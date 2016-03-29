var Player = function (playerId) {
  var id = playerId
    , tokens = []
    , found = 0
    , lost = 0
    , guesses = 0;
  
  // Getters and setters
	var getId = function() {
		return id;
	};

	var getFound = function() {
		return found;
	};
  
  var getLost = function() {
		return lost;
	};
  
  var getGuesses = function() {
		return guesses;
	};

  var getDistances = function (otherLat, otherLng) {
    var arr = [];
      for (i = 0; i < tokens.length; i++) {
        if (tokens[i] != this.id && tokens[i].found != true) {
          arr.push(tokens[i].getDist(otherLat, otherLng));
        }
      }
    return arr;
  };

  var lostToken = function (index) {
    lost += 1;
    tokens[index].found = true;
  };
  
  var incFound = function () {
    found += 1;
  };
  
  var addToken = function (token) {
    tokens.push(token);
  };


  // Define which variables and methods can be accessed
  return {
    getId: getId
    , getFound: getFound
    , getLost: getLost
    , getDistances: getDistances
    , incFound: incFound
    , addToken: addToken
    , lostToken: lostToken
  }
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;