angular.module('myApp')

.factory('gameData', function () {
  
  var service = {};
  
  var joinName = "";
  
  var info = {
      createName: ""
      , numberOfTokens: 3
      , numberOfPlayers: 2
      , percision: 100
      , map: ""
  };

  service.setInfo = function (data) {
    info = data;
  }
  
  service.setJoin = function (name) {
    joinName = name;
  }
  
  service.getInfo = function () {
    return info;
  }
  
  service.getJoinName = function () {
    return joinName;
  }
  
  service.resetInfo = function () {
    info = {
      createName: ""
      , numberOfTokens: 0
      , numberOfPlayers: 0
      , percision: 0
      , map: ""
    };
    return info;
  }

  return service;

});