var net           = require('net'),
    botwarsClient = require('../botwarsClient');

/*
This code does the following:
1. Mines ore in the north until it mines 50 ore
2. Builds a smallSolar in the east
3. After the solar is built charing happens when below 30% and stops when above 95%
4. Mines ore in the north until it mines 100 ore
5. Builds a smallFactory in the west
6. Mines ore in the north until it mines 100 ore
7. Waits for the factory to be clear, then builds another pawn
8. Goto step 6
*/


var socket = net.createConnection(8000);
var client = botwarsClient.create(socket, "hansonry", "1234");


function face(turn, pawn, direction) {
   if(pawn.facing != direction) {
      turn.pawnRotateRight(pawn.id);
      return false;
   }
   else {
      return true;
   }
}

function mineOre(turn, pawn) {
   if(face(turn, pawn, "north")) {
      turn.pawnMine(pawn.id);
   }
}
function charge(turn, pawn, batteryCount) {
   if(pawn.storageCount > 0 && pawn.storageType != "battery") {
      // Empty our storage if we are not carring batteries
      if(face(turn, pawn, "north")) {
         turn.pawnDrop(pawn.id, pawn.storageCount);
      }
   }
   else if(pawn.storageCount < 50) {
      if(face(turn, pawn, "east") && batteryCount > 50) {
         turn.pawnPickup(pawn.id, pawn.storageMax);
      }
   }
   else {
      turn.pawnCharge(pawn.id);
   }
}

var charging = false;
client.on('turn', function(turn) {
   console.log(JSON.stringify(turn.raw));
   console.log();
   var aPawn = turn.myPawns[0];
   var oc = turn.oreCount(0, -1, 1, 1);
   var bc = turn.batteryCount(1, 0, 1, 1);
   var smallSolar = undefined;
   var smallFactory = undefined;

   // Find a pawn to tag
   for(var i = 0; i < turn.myPawns.length; i++) {
      if(turn.myPawns[i].notes.tag == "starter") {
         aPawn = turn.myPawns[i];
         break;
      }
   }
   turn.pawnSetNotes(aPawn.id, { tag: "starter" });
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

   // Check to see if there is a pawn on the factory
   var factoryPawns = turn.listPawns(-1, 0, 1, 1);
   var hasFactoryPawn;
   if(factoryPawns.length == 0) {
      hasFactoryPawn = false;
   }
   else {
      hasFactoryPawn = true;
   }


   if(pawnChargePercent >= 0.95) {
      charging = false;
   }

   if((pawnChargePercent < 0.30 && smallSolar != undefined) || 
      charging) {
      charging = true;
      charge(turn, aPawn, bc);

   }
   else if(smallSolar == undefined) {
      if(oc < 50) {
         mineOre(turn, aPawn);
      }
      else if(face(turn, aPawn, "east")) {
         turn.pawnBuild(aPawn.id, "smallSolar");
      }
   }
   else if(smallFactory == undefined) {
      if(oc < 100) {
         mineOre(turn, aPawn);
      }
      else if(face(turn, aPawn, "west")) {
         turn.pawnBuild(aPawn.id, "smallFactory");
      }
   }
   else {
      if(oc < 100) {
         mineOre(turn, aPawn);
      }
      else if(hasFactoryPawn == false && face(turn, aPawn, "west")) {
         turn.pawnActivate(aPawn.id);   
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
   console.log("Pawn On Factory: " + hasFactoryPawn);
   turn.sendCommands();
   
});



