var net           = require('net'),
    botwarsClient = require('./botwarsClient');


var socket = net.createConnection(8000);
var client = botwarsClient.create(socket, "hansonry", "1234");
client.on('turn', function(turn) {
   //console.log(turn.raw);
   var aPawn = turn.myPawns[0];
   console.log(aPawn);
   turn.pawnMove(aPawn.id);


   turn.sendCommands();
});



