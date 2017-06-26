<?php
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); // HTTP/1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
?><!DOCTYPE html>
<html data-ng-app="appHauntedHouse">
  <head>
    <?php include 'php/html_head_common.php'; ?>
    
    <script src="app/single-solution-coverage-graph.js"></script>
    <script src="app/hauntedhouse.js"></script>
    <script src="app/lobby-controller.js"></script>
    <script src="app/room-controller.js"></script>

    <link rel="stylesheet" type="text/css" href="style/hauntedhouse.css" />
    <title>Haunted House Game</title>
  </head>
  <body>
    <header>
      <h1>Haunted House Game</h1>
    </header>
    
    <article id="gamesurface">
      <div id="gamelobby" 
          data-ng-controller="LobbyCtrl"
          data-ng-show="true || ctrl.gamestate.statename == 'lobby'">
        <h2>Lobby</h2>
        <button data-ng-click="generateHouse()">Generate house</button>
      </div>

      <div id="roomdisplay" data-ng-controller="RoomCtrl">
        <h2>{{ctrl.getFlavor().roomName}}</h2>
        <div class="roomflavor">
          {{ctrl.getFlavor()}}
        </div>
        
        <div class="col-sm-2 roomside roomside-left"></div>

        <div class="room row col-sm-8">
          <div class="roomdoor"
              data-ng-repeat="doordirection in ['N', 'E', 'S', 'W']"
              data-ng-class="'doordirection-' + doordirection">

            <div class="doorsideholder">
              <div class="doorside"
                  data-ng-repeat="adjroom in ctrl.getDoors(doordirection)"
                  data-ng-class="ctrl.getDoorClasses(adjroom)">
                <div class="doorimageholder">
                  <button class="btn"
                      data-ng-click="ctrl.goToRoom(adjroom)">
                    {{adjroom}}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="protagonist">
            :-)
          </div>
        </div>
        
        <div class="col-sm-2 roomside roomside-right"></div>
      </div>

    </article>
  </body>
</html>