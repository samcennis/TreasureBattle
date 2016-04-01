document.addEventListener("DOMContentLoaded", function () {

  var socket = io.connect();

  // Map setting
  var usaNElat = 50;
  var usaNElng = -66;
  var usaSWlat = 26;
  var usaSWlng = -124;
  var usaMinZoom = 4;
  var usaMaxZoom = 12;

  var amesNElat = 42.07;
  var amesNElng = -93.40;
  var amesSWlat = 41.97;
  var amesSWlng = -93.83;
  var amesMinZoom = 12;
  var amesMaxZoom = 18;


  var offenseMap = L.map('offenseMap').setView([38, -100], 4);

  var defenseMap = L.map('defenseMap').setView([38, -100], 4);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
    , maxZoom: usaMaxZoom
    , minZoom: usaMinZoom
    , id: 'mapbox.streets'
  , }).addTo(offenseMap);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
    , maxZoom: usaMaxZoom
    , minZoom: usaMinZoom
    , id: 'mapbox.streets'
  , }).addTo(defenseMap);

  offenseMap.setMaxBounds([
    [usaNElat, usaNElng],
    [usaSWlat, usaSWlng]
  ]);

  defenseMap.setMaxBounds([
    [usaNElat, usaNElng],
    [usaSWlat, usaSWlng]
  ]);
  var mymarkers = [];
  var mycoordinates = [];
  var myguesses = [];

  var maxPlayers = 2;
  var tokenNumber = -1;
  var placedTokens = 0;
  var playerId = -1;
  var mapScope = -1;

  var turn = -1; //-1-set markers, otherwise matches playerId's turn

  defenseMap.on('click', function (e) {
    if (playerId < maxPlayers) {
      if ((turn == -1) && (placedTokens < tokenNumber)) {
  //      alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
        var m = L.marker(e.latlng, {
            icon: L.icon({
              iconUrl: 'marker-yellow.png',
              iconSize:     [25, 41], // size of the icon
              iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
            })
          });
        m.addTo(defenseMap);
        m.dragging.enable();
        m.on('dragstart', function(event){
          var m = event.target;
          var position = m.getLatLng();
          var index = mycoordinates.indexOf(position);
          mycoordinates.splice(index, 1);
        });
        m.on('dragend', function(event){
            var m = event.target;
            var position = m.getLatLng();
            m.setLatLng([position.lat,position.lng],{draggable:'true'}).bindPopup(position).update();
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
    if (playerId < maxPlayers) {
      if (turn == playerId) {
        console.log("guessing");
  //      alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
        socket.emit('guess', {id: playerId, latlng: e.latlng});
      } else {
        console.log("Not your turn. Back off!")
      }
    } else {
      console.log("Can't place guess! You are not a member of this game...");
    }
  });

  document.getElementById("ready_btn").onclick = function() {save()};

  function save() {
    console.log("ready click");
    if(placedTokens < tokenNumber) {
      alert('You need to place ' + tokenNumber
            + ' Tokens on the bottom map!')
    }
    else {
      var i = 0;
      while(i < mymarkers.length){
        mymarkers[i].dragging.disable();
        i++;
      }
      socket.emit('ready', {id: playerId, coordinates:mycoordinates });
    }
  }

  // draw line received from server
  socket.on('joinReq', function (data) {
    console.log("req");
    if(data.playing){
      console.log("playing");
      playerId = data.id;
      tokenNumber = data.tokenNum;
      mapScope = data.scope;
    }
    else{
      playerId = maxPlayers;
      document.getElementById("gameFull").innerHTML = "This Game Is Full!";
      console.log("This game is already full!");
    }
  });

  socket.on('turn', function (data) {
    console.log("turn");
    turn = data.turn;
    if(turn == playerId){
      document.getElementById("instructions").innerHTML = "Click on the top map and try to locate the other players tokens";
      document.getElementById("whosTurn").innerHTML = "Your Turn!";
    }
    else{
      document.getElementById("whosTurn").innerHTML = "Opponents Turn...";
    }
  });

  socket.on('guessed', function (data) {
    console.log("guess by " + data.player + " " + data.distance + " miles from your closest token");
    var m;
    if(data.hit){
      m = L.marker(data.latlng, {
          icon: L.icon({
            iconUrl: 'marker-red.png',
            iconSize:     [25, 41], // size of the icon
            iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
          })
        });
    }
    else{
      m = L.marker(data.latlng);
    }
    m.bindPopup("<b>Closest Token:</b><br>" + data.distance + " mi.")
    if(data.player == playerId){
       m.addTo(offenseMap);
       if (data.game_status) {
         // Set turn so that you can't place any more markers on either map
         turn = -2;
         document.getElementById("gameEnd").innerHTML = "YOU WIN!!!";
         document.getElementById("whosTurn").innerHTML = "";
       }
    }
    else{
      m.addTo(defenseMap);
      if (data.game_status) {
        document.getElementById("gameFull").innerHTML = "YOU LOSE...";
        document.getElementById("whosTurn").innerHTML = "";
      }
    }
    myguesses.push(m);
  });


  //request to join game
  socket.emit('joinReq', {});


});
