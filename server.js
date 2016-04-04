var express = require('express')
  , app = express()
  , http = require('http')
  , socketIo = require('socket.io')
  , Player = require('./Player').Player
  , Game = require('./Game').Game
  , Token = require('./Token').Token;

// start webserver on port 8080
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

var gameCount = 0;
var gameLimit = 10;
var games = [];

//REST API
app.get('/options', function (req, res) {
  console.log("getting options");
  var options = [];
  for (name in games) {
    
    options.push({
      name: name
      , number: games[name].getNumPlayers() - games[name].getCount()
    })
  }
  res.json(options)
});


// event-handler for new incoming connections
var setEventHandlers = function () {
  console.log("setEventHandlers");
  io.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(socket) {

  console.log("on connection");

  socket.on('createGame', createGame);

  socket.on('joinReq', joinRequest);

  socket.on('ready', playerReady);

  socket.on('guess', guess);

}

function createGame(data) {
  console.log("create game " + data.info.createName);
  
  var isCreated = false;
  
  if (gameCount <= gameLimit) {
    
    var newGame = new Game(data.info.createName, data.info.numberOfPlayers, data.info.numberOfTokens, data.info.precision, data.map);
    
    newGame.addPlayer(new Player(0));
    
    games[data.info.createName] = newGame;
    
    isCreated = true;
  } else {
    console.log("Failed, reached game limit");
  }
  
  this.emit('joinReq', {
    status: isCreated
  });
}

function joinRequest(data) {
  console.log("join request " + data.name);

  game = games[data.name];
    
  if (game != undefined && game.isFull() == false) {
    this.emit('joinReq', {
      playing: true
      , id: game.getCount()
      , tokenNum: game.getNumOfTokens()
      , playerNum: game.getNumPlayers()
      , precision: game.getPrecision()
      , map: game.getMap()
    });
    game.addPlayer(new Player(game.getCount()));
  } else {
    this.emit('joinReq', {
      playing: false
    });
  }
}

function playerReady(data) {
  game = games[data.name];

  //check if valid game name
  if (game == undefined) {
    console.log("Invalid game name: " + data.name + " in playerReady");
  }

  if (data.id < game.getNumPlayers()) {
    console.log("Player " + data.id + " ready! " + data.coordinates.length + " tokens hidden");
    for (var i = 0; i < data.coordinates.length; i++) {
      var token = new Token(data.coordinates[i].lat, data.coordinates[i].lng);
      game.players[data.id].addToken(token);
    }
    waitingOn = game.incReady();
    if (waitingOn == 0) {
      this.broadcast.emit('turn', {
        name: data.name
        , turn: 0
      });
      this.emit('turn', {
        name: data.name
        , turn: 0
      });
    }
    this.broadcast.emit('waiting', {
      name: data.name
      , num: waitingOn
      , player: data.id
    });
    this.emit('waiting', {
      name: data.name
      , num: waitingOn
      , player: data.id
    });
  } else {
    console.log("Invalid player with ID: " + data.id + " tried to click ready button");
  }
}

function guess(data) {
  game = games[data.name];

  //check if valid game name
  if (game == undefined) {
    console.log("Invalid game name: " + data.name + " in guess");
    return;
  }
  console.log(data.name + ": guess by player " + data.id);

  var shortest = 99999.99; // Earth circumference 24901 mi
  var inRange = false;
  var stats = [];
  var win = false;
  var curr = 0;
  
  game.players[data.id].incGuesses();
  
  //loop through players other than the one guessing
  for (var i = 0; i < game.getNumPlayers(); i++) {
    if (i != data.id) { //look at other players tokens
      //somehow the value of i gets changed befor the next iteration, so to keep its value i assign it to a temp variable
      curr = i;
      var dists = game.players[i].getDistances(data.latlng.lat, data.latlng.lng);
      console.log(dists);
      for (var j = 0; j < dists.length; j++) {
        //check if close enough for a find
        if (dists[j] <= game.getPrecision()) {
          //i player's token has been found
          console.log("You found a token!!!");
          game.players[curr].lostToken(j);
          game.players[data.id].incFound();
          inRange = true;
        }
        //check if shortest distance
        if (dists[j] < shortest) {
          shortest = dists[j];
        }
        if (game.players[data.id].getFound() == game.getNumOfTokens()) {
          win = true;
        }
      }
    }
  }
  //collect stats for scoreboard
  for (var i = 0; i < game.getNumPlayers(); i++){
    stats.push(game.players[i].getStats());
  }
  this.broadcast.emit('guessed', {
    name: data.name
    , player: data.id
    , hit: inRange
    , latlng: data.latlng
    , distance: shortest
    , stats: stats
    , game_status: win
  });
  this.emit('guessed', {
    name: data.name
    , player: data.id
    , hit: inRange
    , latlng: data.latlng
    , distance: shortest
    , stats: stats
    , game_status: win
  });
  if (!win) {
    game.nextTurn();
    this.broadcast.emit('turn', {
      name: data.name
      , turn: game.getTurn()
    });
    this.emit('turn', {
      name: data.name
      , turn: game.getTurn()
    });
  } else {
    //if win condition reached, remove game from list
    delete games[data.game]
    gameCount--;
  }
}

setEventHandlers();