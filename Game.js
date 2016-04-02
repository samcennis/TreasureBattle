var Game = function (gameName, numPlayers, numTokens, range, map) {
  var name = gameName
    , players = []
    , numOfPlayers = numPlayers
    , numOfTokens = numTokens
    , full = false
    , mapInfo = map
    , numReady = 0
    , turn = 0
    , precision = range
    , playerCount = 0;
  
  // Getters and setters
	var getMap = function() {
		return mapInfo;
	};
  
  var getPrecision = function() {
		return precision;
	};
  
  var getNumPlayers = function() {
		return numOfPlayers;
	};

	var getTurn = function() {
		return turn % numOfPlayers;
	};
  
  var getCount = function() {
		return playerCount;
	};
  
  var getName = function() {
		return name;
	};
  
  var getReady = function() {
		return numReady;
	};
  
  var isFull = function() {
		return full;
	};
  var getNumOfTokens = function() {
		return numOfTokens;
	};

  var addPlayer = function (player) {
      players.push(player);
      playerCount++;
      full = playerCount == numOfPlayers
  };
  
  var nextTurn = function() {
      turn++;
	};
  
  var incReady = function () {
      numReady++;
      return numOfPlayers - numReady;
  };

  // Define which variables and methods can be accessed
  return {
    getMap: getMap
    , getTurn: getTurn
    , getCount: getCount
    , getName: getName
    , getReady: getReady
    , addPlayer: addPlayer
    , getNumOfTokens: getNumOfTokens
    , isFull: isFull
    , players: players
    , incReady: incReady
    , getNumPlayers: getNumPlayers
    , getPrecision: getPrecision
    , nextTurn: nextTurn
  }
};

exports.Game = Game;