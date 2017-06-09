/* global appHauntedHouse */
/* global SingleSolutionCoverageGraph */
/* global _ */

appHauntedHouse.controller('LobbyCtrl', [
    '$scope', 'gamestate',
    function($scope, gamestate) {
  var ctrl = this;
  $scope.ctrl = ctrl;
  
  $scope.difficulty = 2;
  
  ctrl.$scope = $scope;
  ctrl.gamestate = gamestate;

  var getRoomCategories = function() {
    return {
      ENTRANCE: ['Foyer', 'Coat Closet'],
      FOOD: ['Kitchen', 'Dining Room', 'Pantry', 'Wine Cellar'],
      GATHERING: ['Living Room', 'Drawing Room', 'TV Room', 'Den', 'Billiard Room'],
      CLEANING: ['Bathroom', 'Laundry Room', 'Half-Bath'],
      WORK: ['Study', 'Office', 'Library', 'Art Studio', 'Music Studio'],
      OUTSIDE: ['Garage', 'Deck', 'Garden', 'Pool', 'Courtyard', 'Greenhouse'],
      BEAUTY: ['Art Gallery', 'Statue Gallery', 'Trophy Room'],
      SLEEP: ['Master Bedroom', 'Teenager\'s Room', 'Children\'s Room', 'Nursery', 'Guest Bedroom'],
      MAINTENANCE: ['Utility Closet', 'Storage Closet', 'Server Closet']
    };
  };

  var createRoomNames = function() {
    var roomsToName = _.chain(gamestate.house.numNodes).
        range().
        without(0).
        shuffle().
        value();
    
    if (!roomsToName.length) {
      return;
    }

    var roomCategories = getRoomCategories();
    
    // The first room is always the foyer.
    var roomnum = 0;
    gamestate.roomFlavor[roomnum].roomType = 'ENTRANCE';
    gamestate.roomFlavor[roomnum].roomName = roomCategories['ENTRANCE'].shift();
    if (!roomsToName.length) {
      return;
    }
    
    // The first few random rooms are always the kitchen, bathroom, and bedroom.
    roomnum = roomsToName.shift();
    gamestate.roomFlavor[roomnum].roomType = 'FOOD';
    gamestate.roomFlavor[roomnum].roomName = roomCategories['FOOD'].shift();
    if (!roomsToName.length) {
      return;
    }

    roomnum = roomsToName.shift();
    gamestate.roomFlavor[roomnum].roomType = 'CLEANING';
    gamestate.roomFlavor[roomnum].roomName = roomCategories['CLEANING'].shift();
    if (!roomsToName.length) {
      return;
    }
    
    roomnum = roomsToName.shift();
    gamestate.roomFlavor[roomnum].roomType = 'SLEEP';
    gamestate.roomFlavor[roomnum].roomName = roomCategories['SLEEP'].shift();
    if (!roomsToName.length) {
      return;
    }

    _.each(roomCategories, function(names, category) { 
      roomCategories[category] = _.shuffle(names); 
    });

    // All the rest of the rooms are names randomly, but are biased toward
    // being similar to adjacent rooms.
    while (roomsToName.length > 0) {
      roomnum = roomsToName.shift();
      var categorySelected = null;
      
      // Figure out what kind of rooms are adjacent to us.
      var adjtypes = _.map(_.keys(gamestate.house.adjacencies[5]), function(adjroomnum) { 
        return gamestate.roomFlavor[adjroomnum].roomType; 
      });
      
      adjtypes = _.shuffle(adjtypes);

      for (var iAdjType = 0; iAdjType < adjtypes.length; iAdjType++) {
        var adjtype = adjtypes[iAdjType];
        if (!adjtype) {
          continue;
        }
        
        var catnames = roomCategories[adjtype];
        if (!catnames || !catnames.length) {
          continue;
        }
        
        categorySelected = adjtype;
        break;
      }
      
      // If the adjacent rooms haven't been assigned yet, then pick 
      // a category.
      if (!categorySelected && _.size(roomCategories) > 0) {
        categorySelected = _.chain(roomCategories).keys().shuffle().value()[0];
      }

      if (!categorySelected) {
        // We don't have any more valid categories available. No choice
        // but to assign spare rooms.
        gamestate.roomFlavor[roomnum].roomType = 'SPARE';
        gamestate.roomFlavor[roomnum].roomName = 'Spare Room';
        
      } else {
        gamestate.roomFlavor[roomnum].roomType = categorySelected;
        gamestate.roomFlavor[roomnum].roomName = roomCategories[categorySelected].shift();
        
        if (!roomCategories[categorySelected].length) {
          delete roomCategories[categorySelected];
        }
      }
    }
  };

  var decorateHouse = function() {
    createRoomNames();
  };

  $scope.generateHouse = function() {
    gamestate.house = new SingleSolutionCoverageGraph($scope.difficulty);
    gamestate.currentRoom = 0;
    gamestate.numLampsLeft = gamestate.house.solutionNumActiveNodes;

    gamestate.roomFlavor = _.map(_.range(gamestate.house.numNodes), function() { return {}; });

    decorateHouse();

    gamestate.statename = 'playing';
  };
}]);