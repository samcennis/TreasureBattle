angular.module('myApp')

.controller('HomeCtrl', function ($scope, $location, $http, gameData) {
  
  $scope.joinData = {
    options: {}
    , joinName: ""
  }
  $scope.createData = gameData.getInfo();
  
  $http.get('/options')
        .success(function(data) {
            console.log(data)
            $scope.joinData.options = data;
        })
        .error(function(data) {
            console.log('GET Error');
        });
  
  $scope.joinGame = function () {
    gameData.setJoin($scope.joinData.joinName);
    $location.path( '/game' );
  }
  
  $scope.createGame = function () {
    gameData.setInfo($scope.createData);
    $location.path( '/game' );
  }
  
});