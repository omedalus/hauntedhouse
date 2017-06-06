/* global appHauntedHouse */


appHauntedHouse.controller('RoomCtrl', [
    '$scope', 'gamestate',
    function($scope, gamestate) {
  var ctrl = this;
  $scope.ctrl = ctrl;
  
  ctrl.$scope = $scope;
  ctrl.gamestate = gamestate;
}]);