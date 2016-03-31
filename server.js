var express = require('express')
  , app = express()
  , http = require('http')
  , socketIo = require('socket.io')
  , Player = require('./Player').Player
  , Token = require('./Token').Token;

// start webserver on port 8080
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

var numOfPlayers = 2;
var tokensPerPlayer = 3;
var accuracyRange = 100;
var minZoom = 100;

var count = 0;
var ready = 0;
var turn = 0;
var players = [];


// event-handler for new incoming connections
var setEventHandlers = function() {
  console.log("setEventHandlers");
	io.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(socket) {

  console.log("on connection");

    socket.on('joinReq', joinRequest);

    socket.on('ready', playerReady);

    socket.on('guess', guess);

}

function joinRequest(data) {
  console.log("join request " + count);
  if (count < numOfPlayers) {
    this.emit('joinReq', {
      playing: true,
      id: count,
      tokenNum: tokensPerPlayer,
      scope: minZoom
    });
    players.push(new Player(count));
    count += 1;
  }
  else{
    this.emit('joinReq', {
      playing: false
    });
  }
}

function playerReady(data){
  if (data.id < numOfPlayers) {
    console.log("Player " + data.id + " ready! " + data.coordinates.length + " tokens hidden");
    for(i=0; i < data.coordinates.length; i++){
      var token = new Token(data.coordinates[i].lat, data.coordinates[i].lng);
      players[data.id].addToken(token);
    }
    ready++;
    if(ready == numOfPlayers){
      this.broadcast.emit('turn', {turn: 0});
      this.emit('turn', {turn: 0});
    }
  } else {
    console.log("Invalid player with ID: " + data.id + " tried to click ready button");
  }
}

function guess(data){
  console.log("guess by player " + data.id);
  var shortest = 99999999.99;
  var inRange = false;
  var win = false;
  var curr = 0;
  //loop through players other than the one guessing
  for(i=0; i < players.length; i++){
    if(i != data.id){ //look at other players tokens
      curr = i;
      // console.log("i: " + i + " " + curr);
      var dists = players[i].getDistances(data.latlng.lat, data.latlng.lng);
      console.log(dists);
      // console.log("i: " + i + " " + curr);
      for(j=0; j < dists.length; j++){
        // console.log("i: " + i);
        //check if close enough for a find
        if(dists[j] < accuracyRange){
          //i player's token has been found
          console.log("You found a token!!!");
          players[curr].lostToken(j);
          players[data.id].incFound();
          inRange = true;
        }
        //check if shortest distance
        if(dists[j] < shortest){
          shortest = dists[j];
        }
        if (players[data.id].getFound() == tokensPerPlayer) {win = true;}
      }
    }
  }
  this.broadcast.emit('guessed', {player: data.id, hit: inRange, latlng: data.latlng, distance: shortest, game_status: win});
  this.emit('guessed', {player: data.id, hit: inRange, latlng: data.latlng, distance: shortest, game_status: win});
  console.log(win);
  if (!win) {
    turn++;
    this.broadcast.emit('turn', {turn: turn % numOfPlayers});
    this.emit('turn', {turn: turn % numOfPlayers});
  }
}

setEventHandlers();
