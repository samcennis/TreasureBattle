angular.module('myApp')

.factory('gameData', function () {
  
  var service = {};
  
  var joinName = "";
  
  var created = false;
  
  var info = {
      createName: ""
      , numberOfTokens: 3
      , numberOfPlayers: 2
      , percision: 100
      , map: ""
  };

  service.setInfo = function (data) {
    isCreated = true;
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
  
  service.isCreated = function () {
    return created;
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