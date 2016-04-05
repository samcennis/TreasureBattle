angular.module('myApp')

.factory('mapData', function () {

  var service = {};

  var nelat = 0;
  var nelng = 0;
  var swlat = 0;
  var swlng = 0;
  var minZoom = 2;
  var maxZoom = 18;

  service.getUSA = function () {
    return {
      NElat : 50,
      NElng : -66,
      SWlat : 26,
      SWlng : -124,
      minzoom : 4,
      maxzoom : 12
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

  service.setCustom = function (data) {
    nelat = data.getBounds().getNorthEast().lat;
    nelng = data.getBounds().getNorthEast().lng;
    swlat = data.getBounds().getSouthWest().lat;
    swlng = data.getBounds().getSouthWest().lng;
    minzoom = data.getZoom();
  }

  service.getCustom = function () {
    return {
      NElat : nelat,
      NElng : nelng,
      SWlat : swlat,
      SWlng : swlng,
      minZoom : minzoom,
      maxZoom : 18
    };
  }

  return service;

});
