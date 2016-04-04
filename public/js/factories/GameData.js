angular.module('myApp')

.factory('gameData', function () {
  
  var service = {};
  
  var joinName = "";
  
  var created = false;
  
  var info = {
      createName: ""
      , numberOfTokens: 3
      , numberOfPlayers: 2
      , precision: 100
      , map: "USA"
  };

  service.setInfo = function (data) {
    created = true;
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
      , precision: 0
      , map: ""
    };
    return info;
  }

  return service;

});