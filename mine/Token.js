var Token = function (lat, lng) {
  var x = lat
    , y = lng
    , found = false;

  // Getters and setters
  var getLat = function () {
    return x;
  };

  var getLng = function () {
    return y;
  };

//  var getDist = function (otherLat, otherLng) {
//    var radlat1 = Math.PI * x / 180
//    var radlat2 = Math.PI * otherLat / 180
//    var theta = y - otherLng
//    var radtheta = Math.PI * theta / 180
//    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
//    dist = Math.acos(dist)
//    dist = dist * 180 / Math.PI
//    dist = dist * 60 * 1.1515
//    return dist
//  };
  
  var getDist = function (otherLat, otherLng) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(otherLat-x);  // deg2rad below
    var dLon = deg2rad(otherLng-y); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(x)) * Math.cos(deg2rad(otherLat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    d = d/1.60934 // Miles
    return d;
  };

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }


  // Define which variables and methods can be accessed
  return {
    getLat: getLat
    , getLng: getLng
    , getDist: getDist
    , found: found
  }
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Token = Token;