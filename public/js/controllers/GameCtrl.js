angular.module('myApp')

.controller('GameCtrl', function ($scope, gameData, mapData) {

  angular.element(document).ready(function () {
    var socket = io.connect();

    var mapInfo = {};
    var gameInfo = {};

    var offenseMap = L.map('offenseMap').setView([38, -100], 4);

    var defenseMap = L.map('defenseMap').setView([38, -100], 4);


    var mymarkers = [];
    var mycoordinates = [];
    $scope.stats = [];
    var gameName = "";

    var placedTokens = 0;
    var playerId = -1;
    $scope.status = {waiting : false, waitingOn : -1};
    $scope.yourturn = false;

    var turn = -1; //-1-set markers, otherwise matches playerId's turn

    if (gameData.getJoinName() == "") {
      gameInfo = gameData.getInfo();
      if (gameInfo.map == "USA") {
        mapInfo = mapData.getUSA();
      } else {
        mapInfo = mapData.getAmes();
      }
      gameName = gameInfo.createName;

      //create game
      socket.emit('createGame', {
        info: gameInfo
        , map: mapInfo
      });

      setupMap();

    } else {
      gameName = gameData.getJoinName();

      //request to join game
      socket.emit('joinReq', {
        name: gameData.getJoinName()
      });

    }

    defenseMap.on('click', function (e) {
      if (playerId < gameInfo.numberOfPlayers) {
        if ((turn == -1) && (placedTokens < gameInfo.numberOfTokens)) {
          //      alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
          var m = L.marker(e.latlng, {
            icon: L.icon({
              iconUrl: 'marker-yellow.png'
              , iconSize: [25, 41], // size of the icon
              iconAnchor: [12, 40], // point of the icon which will correspond to marker's location
            })
          });
          m.addTo(defenseMap);
          m.dragging.enable();
          m.on('dragstart', function (event) {
            var m = event.target;
            var position = m.getLatLng();
            var index = mycoordinates.indexOf(position);
            mycoordinates.splice(index, 1);
          });
          m.on('dragend', function (event) {
            var m = event.target;
            var position = m.getLatLng();
            m.setLatLng([position.lat, position.lng], {
              draggable: 'true'
            }).bindPopup(position).update();
            mymarkers.pop();
            mymarkers.push(m);
            mycoordinates.push(m.getLatLng());
            m.addTo(defenseMap);
          });
          mymarkers.push(m);
          mycoordinates.push(m.getLatLng());
          placedTokens++;
        }
      } else {
        console.log("Can't place token! You are not a member of this game...");
      }
    });
    offenseMap.on('click', function (e) {
      if (playerId < gameInfo.numberOfPlayers) {
        if (turn == playerId) {
          console.log("guessing");
          //      alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
          socket.emit('guess', {
            id: playerId
            , latlng: e.latlng
            , name: gameName
          });
        } else {
          console.log("Not your turn. Back off!")
        }
      } else {
        console.log("Can't place guess! You are not a member of this game...");
      }
    });

    document.getElementById("ready_btn").onclick = function () {
      save()
    };

    function save() {
      console.log("ready click");
      if (placedTokens < gameInfo.numberOfTokens) {
        alert('You need to place ' + gameInfo.numberOfTokens + ' Tokens on the bottom map!')
      } else {
        var i = 0;
        while (i < mymarkers.length) {
          mymarkers[i].dragging.disable();
          i++;
        }
        socket.emit('ready', {
          id: playerId
          , coordinates: mycoordinates
          , name: gameName
        });
      }
    }

    // draw line received from server
    socket.on('joinReq', function (data) {
      console.log("req");
      if(data.status != undefined){
        if(data.status){
          console.log("successfully created game");
          playerId = 0;
          //gameInfo should already be set, just needed playerID
        } else {
          console.log("failed to create game");
          playerId = -1;
        }
      } else if (data.playing) {
        console.log("playing");
        playerId = data.id;
        gameInfo.numberOfTokens = data.tokenNum;
        gameInfo.numberOfPlayers = data.playerNum;
        mapInfo = data.map;
        console.log(data);
        setupMap();
      } else {
        playerId = -1;
        document.getElementById("gameFull").innerHTML = "This Game Is Full!";
        console.log("This game is already full!");
      }
    });

    socket.on('turn', function (data) {
      if (data.name == gameName) {
        console.log("turn " + data.turn + " id " + playerId);
        turn = data.turn;
        if (turn == playerId) {
          document.getElementById("instructions").innerHTML = "Click on the Offensive Map and try to locate the other players tokens";
          document.getElementById("whosTurn").innerHTML = "Your Turn!";
          $scope.yourturn = true;
        } else {
          document.getElementById("whosTurn").innerHTML = "Opponents Turn...";
          $scope.yourturn = false;
        }
        $scope.$apply();
      }
    });
    
    socket.on('waiting', function (data) {
      if (data.name == gameName) {
        if(data.player == playerId){
          $scope.status.waiting = true;
        }
        $scope.status.waitingOn = data.num;
        $scope.$apply();
      }
    });

    socket.on('guessed', function (data) {
      if (data.name == gameName) {
        console.log("guess by " + data.player + " " + data.distance + " miles from your closest token");
        var m;
        if (data.hit) {
          m = L.marker(data.latlng, {
            icon: L.icon({
              iconUrl: 'marker-red.png'
              , iconSize: [25, 41], // size of the icon
              iconAnchor: [12, 40], // point of the icon which will correspond to marker's location
            })
          });
        } else {
          m = L.marker(data.latlng);
        }
        m.bindPopup("<b>Closest Token:</b><br>" + Math.round(data.distance * 100) / 100 + " mi.")
        if (data.player == playerId) {
          m.addTo(offenseMap);
          if (data.game_status) {
            // Set turn so that you can't place any more markers on either map
            turn = -2;
            document.getElementById("gameEnd").innerHTML = "YOU WIN!!!";
            document.getElementById("whosTurn").innerHTML = "";
          }
        } else {
          m.addTo(defenseMap);
          if (data.game_status) {
            document.getElementById("gameFull").innerHTML = "YOU LOSE...";
            document.getElementById("whosTurn").innerHTML = "";
          }
        }
        console.log(data.stats);
        $scope.stats = data.stats;
        $scope.$apply();
      }
    });
    

    function setupMap() {
      
      console.log(mapInfo);
      
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
        , maxZoom: mapInfo.maxZoom
        , minZoom: mapInfo.minZoom
        , id: 'mapbox.streets'
      , }).addTo(offenseMap);

      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
        , maxZoom: mapInfo.maxZoom
        , minZoom: mapInfo.minZoom
        , id: 'mapbox.streets'
      , }).addTo(defenseMap);

      offenseMap.setMaxBounds([
        [mapInfo.NElat, mapInfo.NElng]
            , [mapInfo.SWlat, mapInfo.SWlng]
      ]);

      defenseMap.setMaxBounds([
        [mapInfo.NElat, mapInfo.NElng]
            , [mapInfo.SWlat, mapInfo.SWlng]
      ]);
    }

  });

});