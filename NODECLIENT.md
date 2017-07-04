# Node Client for Botwars
There is a file called `botwarsClient.js`. This is a Node.js library you can use to simplify the registration, server status parsing, and command building for a server response.

## File Setup

```
var net           = require('net'),
    botwarsClient = require('./botwarsClient'); // Use dots for a realitive file path


var socket = net.createConnection(8000);
var client = botwarsClient.create(socket, "YourUsername", "YourPassword"); // Password is sent in plaintext

client.on('turn', function(turn) { // This is called every time the server sends a status update
   var aPawn = turn.myPawns[0];    // Pick the first pawn in the list
   turn.pawnRotateRight(aPawn.id); // Turn the pawn to the right
   turn.sendCommands();            // Send the commands to the server 
});
```

The above code just spins around pawn 0 until it runs out of power

## Turn Class functions

* pawnRotateRight(pawnID)           - Turns the specified pawn right
* pawnRotateLeft(pawnID)            - Turns the specified pawn left
* pawnMove(pawnID)                  - Moves the panw in the direction it is facing
* pawnMine(pawnID)                  - Mines the location the pawn is facing tward
* pawnBuild(pawnID, buildingType)   - Attempt to build a building at the location the pawn is facing
* pawnActivate(pawnID)              - Attempt to activate building pointed to
* pawnPickup(pawnID, amount)        - Attempt to pickup items that the pawn is facing tward
* pawnDrop(pawnID, amount)          - Attempt to drop items at the location the pawn is facing
* pawnCharge(pawnID)                - Attempt to charge the pawn using batters in its inventory
* pawnAttack(pawnID)                - Attack the direction facing. Friendly fire is allowed
* pawnSetNotes(pawnID, notes)       - Set notes for the current pawn. This doesnt use up an action
* sendCommands()                    - Sends all commands to the server. If you dont call this nothing will be commanded
* logCommands()                     - This writes all the commands to stdout
* clearCommands()                   - This clears all commands
* oreCount(x, y, width, height)     - This counts all the ore in the specified area
* batteryCount(x, y, width, height) - This counts all the batteries in the specified area 



Note: pawnID is not the pawn index. There is no gaurentee of the order of anything being sent over from the server.


This project is still in development so you can expect more as the project matures

