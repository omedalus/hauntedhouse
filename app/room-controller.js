/* global appHauntedHouse */
/* global _ */
/* global $ */


appHauntedHouse.controller('RoomCtrl', [
    '$scope', '$timeout', 'gamestate',
    function($scope, $timeout, gamestate) {
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
    if (direction === 'N' || direction === 'W') {
      currentRoomAdjacencies = _.filter(currentRoomAdjacencies, function(adjroom) {
        return (adjroom) < gamestate.currentRoom;
      });
    } else if (direction === 'S' || direction === 'E') {
      currentRoomAdjacencies = _.filter(currentRoomAdjacencies, function(adjroom) {
        return (adjroom) > gamestate.currentRoom;
      });
    }
    
    // North and South are mutually even numbered rooms, East and West are mutually odd.
    if (direction == 'N' || direction == 'S') {
      currentRoomAdjacencies = _.filter(currentRoomAdjacencies, function(adjroom) {
        return (adjroom + gamestate.currentRoom) % 2 === 0;
      });
    } else if (direction == 'E' || direction == 'W') {
      currentRoomAdjacencies = _.filter(currentRoomAdjacencies, function(adjroom) {
        return (adjroom + gamestate.currentRoom) % 2 === 1;
      });
    }
    
    return currentRoomAdjacencies;
  };
  
  var characterEnterRoom = function() {
    var enteredElem = $('.doorside.lastroom').first();
    var roomElem = $('.room').first();
    
    var center = {
      x: roomElem.outerWidth() / 2,
      y: roomElem.outerHeight() / 2
    };
    
    if (enteredElem.length !== 0) {
      center = {
        x: (enteredElem.offset().left - roomElem.offset().left) +
            (enteredElem.outerWidth() / 2),
        y: (enteredElem.offset().top - roomElem.offset().top) +
            (enteredElem.outerHeight() / 2),
      };
    }
    
    var protElem = $('.protagonist').first();

    var pos = _.clone(center);
    pos.x -= protElem.outerWidth() / 2;
    pos.y -= protElem.outerHeight() / 2;
    
    protElem.css({
      left: pos.x + 'px',
      top: pos.y + 'px'
    });
  };
  
  var goToRoom = function(roomnum) {
    gamestate.currentRoom = roomnum;
  };
  
  var getDoorClasses = function(roomnum) {
    var retval = {
      lastroom: (ctrl.gamestate.lastRoom === roomnum),
      lit: false
    };
    return retval;
  };
  
  ctrl.getDoors = getDoors;
  ctrl.getFlavor = getFlavor;
  ctrl.goToRoom = goToRoom;
  ctrl.getDoorClasses = getDoorClasses;

  $scope.$watch('ctrl.gamestate.currentRoom', function(newValue, oldValue) {
    gamestate.lastRoom = oldValue;
    $timeout(characterEnterRoom, 0, false);
  });  
}]);