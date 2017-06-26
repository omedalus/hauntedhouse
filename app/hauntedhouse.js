/* global angular */

var appHauntedHouse = angular.module('appHauntedHouse', []);

(function() {
  var gamestate = {
    statename: 'lobby',
    
    house: null,
    currentRoom: null,
    lastRoom: null,
    lampsPlaced: [],
    numLampsLeft: 0,
    roomFlavor: [],
    highestDifficulty: 1
  };
  
  appHauntedHouse.factory('gamestate', function() {
    return gamestate;
  });
}());

