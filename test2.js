var net           = require('net'),
    botwarsClient = require('./botwarsClient');


var socket = net.createConnection(8000);
var client = botwarsClient.create(socket, "hansonry", "1234");

var rotate = false;
client.on('turn', function(turn) {
   console.log(JSON.stringify(turn.raw));
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
   turn.pawnMine(aPawn.id);

   turn.sendCommands();
});



