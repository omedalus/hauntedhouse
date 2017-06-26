/* global appHauntedHouse */
/* global _ */


appHauntedHouse.controller('RoomCtrl', [
    '$scope', 'gamestate',
    function($scope, gamestate) {
  var ctrl = this;
  $scope.ctrl = ctrl;
  
  ctrl.$scope = $scope;
  ctrl.gamestate = gamestate;
  
  var getFlavor = function() {
    return gamestate.roomFlavor[gamestate.currentRoom];
  };
  
  var getDoors = function(direction) {
    if (!gamestate.house || !gamestate.house.adjacencies) {
      return [];
    }
    var currentRoomAdjacencies = 
      _.map(_.keys(gamestate.house.adjacencies[gamestate.currentRoom]), function(key) {
        return parseInt(key, 10);
      });
      
    // West and North are lower-number rooms, East and South are higher.
    if (direction == 'N' || direction == 'W') {
      currentRoomAdjacencies = _.filter(currentRoomAdjacencies, function(adjroom) {
        return (adjroom) < gamestate.currentRoom;
      });
    } else if (direction == 'S' || direction == 'E') {
      currentRoomAdjacencies = _.filter(currentRoomAdjacencies, function(adjroom) {
        return (adjroom) > gamestate.currentRoom;
      });
    }
    
    // North and South are mutually even numbered rooms, East and West are mutually odd.
    if (direction == 'N' || direction == 'S') {
      currentRoomAdjacencies = _.filter(currentRoomAdjacencies, function(adjroom) {
        return (adjroom + gamestate.currentRoom) % 2 == 0;
      });
    } else if (direction == 'E' || direction == 'W') {
      currentRoomAdjacencies = _.filter(currentRoomAdjacencies, function(adjroom) {
        return (adjroom + gamestate.currentRoom) % 2 == 1;
      });
    }
    
    return currentRoomAdjacencies;
  };
  
  ctrl.getDoors = getDoors;
  ctrl.getFlavor = getFlavor;
}]);