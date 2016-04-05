var Player = function (playerId) {
  var id = playerId
    , tokens = []
    , found = 0
    , lost = 0
    , guesses = 0;

  // Getters and setters
  var getId = function () {
    return id;
  };

  var getFound = function () {
    return found;
  };

  var getLost = function () {
    return lost;
  };

  var getGuesses = function () {
    return guesses;
  };

  var incGuesses = function () {
    guesses++;
  };

  var getDistanceFromClosestToken = function (otherLat, otherLng) {
    var shortest = 99999.99;
    for (var i = 0; i < tokens.length; i++) {
      var thisDistance = tokens[i].getDist(otherLat, otherLng);
      if (thisDistance < shortest) {
        shortest = thisDistance;
      }
    }
    return shortest;
  };

  var getDistancesFromNonFoundTokens = function (otherLat, otherLng) {
    var arr = [];
    for (i = 0; i < tokens.length; i++) {
      if (tokens[i].found != true) {
        arr.push({
          token_index: i
          , distance: tokens[i].getDist(otherLat, otherLng)
        });
      }
    }
    return arr;
  }

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

  var getStats = function () {
    return {
      id: id
      , found: found
      , lost: lost
      , guesses: guesses
    };
  };

  var getTokenByIndex = function (index) {

    //console.log("HERE IS THE TOKEN BY INDEX lat: " + tokens[index].getLat());
    return tokens[index];
  };


  // Define which variables and methods can be accessed
  return {
    getId: getId
    , getFound: getFound
    , getLost: getLost
    , incFound: incFound
    , addToken: addToken
    , lostToken: lostToken
    , getTokenByIndex: getTokenByIndex
    , getStats: getStats
    , incGuesses: incGuesses
    , getDistanceFromClosestToken: getDistanceFromClosestToken
    , getDistancesFromNonFoundTokens: getDistancesFromNonFoundTokens
  }
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;