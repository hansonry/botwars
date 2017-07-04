var net           = require('net'),
    botwarsClient = require('../botwarsClient');


var socket = net.createConnection(8000);
var client = botwarsClient.create(socket, "hansonry", "1234");

var charging = false;
client.on('turn', function(turn) {
   console.log(JSON.stringify(turn.raw));
   console.log();
   var aPawn = turn.myPawns[0];
   var oc = turn.oreCount(0, -1, 1, 1);
   var bc = turn.batteryCount(1, 0, 1, 1);
   var smallSolar = undefined;
   var smallFactory = undefined;
   var pawnChargePercent = aPawn.charge / aPawn.chargeMax;


   for(var i = 0; i < turn.myBuildings.length; i++) {
      var building = turn.myBuildings[i];
      if(building.type == "smallSolar") {
         smallSolar = building;
      }
      else if(building.type == "smallFactory") {
         smallFactory = building;
      }
   }
   
   if(smallSolar == undefined) {
      if(oc < 50) {
         if(aPawn.facing != "north") {
            turn.pawnRotateRight(aPawn.id);
         }
         else {
            turn.pawnMine(aPawn.id);
         }
      }
      else {
         if(aPawn.facing != "east") {
            turn.pawnRotateRight(aPawn.id);
         }
         else {
            turn.pawnBuild(aPawn.id, "smallSolar");
         }
      }
   }
   else if(pawnChargePercent < 0.30 || charging) {
      charging = true;
      if(aPawn.storageCount > 0 && aPawn.storageType != "battery") {
         if(aPawn.facing != "north") {
            turn.pawnRotateRight(aPawn.id);
         }
         else {
            turn.pawnDrop(aPawn.id, aPawn.storageCount);
         }
      }
      else if(aPawn.storageCount < 50) {
         if(aPawn.facing != "east") {
            turn.pawnRotateRight(aPawn.id);
         }
         else {
            if(bc > 50) {
               turn.pawnPickup(aPawn.id, aPawn.storageMax);
            }
         }
      }
      else {
         turn.pawnCharge(aPawn.id);
         if(pawnChargePercent > 0.95) {
            charging = false;
         }
      }
   }
   else if(smallFactory == undefined) {
      if(oc < 100) {
         if(aPawn.facing != "north") {
            turn.pawnRotateRight(aPawn.id);
         }
         else {
            turn.pawnMine(aPawn.id);
         }
      }
      else {
         if(aPawn.facing != "west") {
            turn.pawnRotateRight(aPawn.id);
         }
         else {
            turn.pawnBuild(aPawn.id, "smallFactory");
         }
      }
   }


   console.log("Ore Count: " + oc);
   console.log("Battery Count: " + bc);
   
   turn.logCommands();
   if(smallSolar == undefined) {
      console.log("Solar Not Built");
   }
   else {
      console.log("Solar Built");
   }
   if(smallFactory == undefined) {
      console.log("Factory Not Built");
   }
   else {
      console.log("Factory Built");
   }

   console.log("Charging: " + charging);
   console.log("Charge Percent: " + pawnChargePercent);
   turn.sendCommands();
   
});



