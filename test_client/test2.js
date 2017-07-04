var net           = require('net'),
    botwarsClient = require('../botwarsClient');


var socket = net.createConnection(8000);
var client = botwarsClient.create(socket, "hansonry", "1234");

var rotate = false;
client.on('turn', function(turn) {
   console.log(JSON.stringify(turn.raw));
   console.log();
   var aPawn = turn.myPawns[0];
   //console.log(aPawn);

   /*
   if(rotate) {
      turn.pawnRotateRight(aPawn.id);
      rotate = false;
   }
   else {
      turn.pawnMove(aPawn.id);
      rotate = true;
   }
   */

   var oc = turn.oreCount(0, -1, 1, 1) 

   if(oc < 50) {
      turn.pawnMine(aPawn.id);
   }
   else {
      if(aPawn.facing == "north") {
         turn.pawnRotateRight(aPawn.id);
      }
      else {
         turn.pawnBuild(aPawn.id, "smallSolar");        
      }
   }

   console.log("Ore Count: " + turn.oreCount(0, -1, 1, 1));

   turn.sendCommands();
});



