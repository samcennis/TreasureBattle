angular.module('myApp')

.factory('mapData', function () {
  
  var service = {};
  
  service.getUSA = function () {
    return {
      NElat : 50,
      NElng : -66,
      SWlat : 26,
      SWlng : -124,
      minZoom : 4,
      maxZoom : 12
    };
  }
  
  service.getAmes = function () {
    return {
      NElat : 42.07,
      NElng : -93.40,
      SWlat : 41.97,
      SWlng : -93.83,
      minZoom : 12,
      maxZoom : 18
    };
  }
  

  return service;

});