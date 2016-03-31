document.addEventListener("DOMContentLoaded", function () {

  var socket = io.connect();

  var offenseMap = L.map('offenseMap').setView([38, -100], 4);

  var defenseMap = L.map('defenseMap').setView([38, -100], 4);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
    , maxZoom: 18
    , id: 'mapbox.streets'
  , }).addTo(offenseMap);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
    , maxZoom: 18
    , id: 'mapbox.streets'
  , }).addTo(defenseMap);

  var mymarkers = [];
  var mycoordinates = [];
  var myguesses = [];

  var maxPlayers = 2;
  var tokenNumber = -1;
  var playerId = -1;
  var mapScope = -1;

  var turn = -1; //-1-set markers, otherwise matches playerId's turn

  defenseMap.on('click', function (e) {
    if (playerId < maxPlayers) {
      if (turn < 0) {
  //      alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
        var m = L.marker(e.latlng, {
            icon: L.icon({
              iconUrl: 'marker-yellow.png',
              iconSize:     [25, 41], // size of the icon
              iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
            })
          });
        m.addTo(defenseMap);
        mymarkers.push(m);
        mycoordinates.push(e.latlng);
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
      }
    } else {
      console.log("Can't place guess! You are not a member of this game...");
    }
  });

  document.getElementById("ready_btn").onclick = function() {save()};

  function save() {
    console.log("ready click");
    socket.emit('ready', {id: playerId, coordinates:mycoordinates });
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
    console.log("guess " + data.player + " " + playerId + " " + data.distance);
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
    }
    else{
      m.addTo(defenseMap);
    }
    myguesses.push(m);
  });

  // main loop, running every 25ms
//  function mainLoop() {
//    // check if the user is drawing
//    if (mouse.click && mouse.move && mouse.pos_prev) {
//      // send line to to the server
//      socket.emit('draw_line', {
//        line: [mouse.pos, mouse.pos_prev]
//      });
//      mouse.move = false;
//    }
//    mouse.pos_prev = {
//      x: mouse.pos.x
//      , y: mouse.pos.y
//    };
//    setTimeout(mainLoop, 25);
//  }
//  mainLoop();


  //request to join game
  socket.emit('joinReq', {});


});
