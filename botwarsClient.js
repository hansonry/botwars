var util    = require('util'), 
    events  = require('events'), 
    carrier = require('carrier');

function viewToRect(x, y, view) {
   return {
      x:      x - view,
      y:      y - view,
      width:  view * 2 + 1,
      height: view * 2 + 1
   };
}

function BotwarsTurn(msg, socket) {
   var self = this;
   this.raw = msg;
   this.myPawns = [];
   msg.vision.forEach(function(spot) {
      if(spot.type == "pawn" && spot.pawn.ownerName == msg.username) {
         var pawn = Object.assign({x: spot.x, y: spot.y}, spot.pawn);
         self.myPawns.push(pawn);
      }
   });

   var command = {type: "command", commands: []};

   this.pawnRotateLeft = function(id) {
      command.commands.push({ type: "rotate", pawnId: id, direction: "left" });
   }
   this.pawnRotateRight = function(id) {
      command.commands.push({ type: "rotate", pawnId: id, direction: "right" });
   }
   this.pawnMove = function(id) {
      command.commands.push({ type: "move", pawnId: id });
   }
   this.pawnMine = function(id) {
      command.commands.push({ type: "mine", pawnId: id});

   }

   this.sendCommands = function() {
      socket.write(JSON.stringify(command) + "\n");
   }

   this.clearCommands = function() {
      command.commands = [];
   }

   this.scan = function(x, y) {
      var result = { visable: false, things: [] };
      msg.vision.forEach(function(spot) {
         if(spot.x == x && spot.y == y) {
            result.visable = true;
            result.things.push(spot);
         }
         if(result.visable == false) {
            for(var k = 0; k < self.myPawns.length; k++) {
               var pawn = self.myPawns[k];
               var rect = viewToRect(pawn.x, pawn.y, pawn.view);
               if(x >= rect.x && y >= rect.y && 
                  x < rect.x + rect.width && y < rect.y + rect.height) {
                  result.visable = true;
                  break;
               }
            }
         }
      });
      return result;
   }
}

function BotwarsClient(socket, username, password) {
   var self = this;

   var loginRequestMessage = {type: "signIn", username: username, password: password};
   var registerRequestMessage = {type: "register", username: username, password: password};

   var state = "signIn";
   var myCarrier = carrier.carry(socket);
   myCarrier.on('line', function(line) {
      var msg = JSON.parse(line);
      if(state == "signIn") {
         if(msg.type == "result") {
            if(msg.result == "success") {
               state = "inGame";
            }
            else {
               state = "register";
               socket.write(JSON.stringify(registerRequestMessage) + "\n");
            }
         }
         else {
            // Attempt to login again?
            socket.write(JSON.stringify(loginRequestMessage) + "\n");
         }
      }
      else if(state == "register") {
         if(msg.type == "result") {
            if(msg.result == "success") {
               state = "signIn";
               socket.write(JSON.stringify(loginRequestMessage) + "\n");
            }
            else {
               state = "error";
               console.log("Failed to Register Account");
               console.log(msg);
            }
         }
         else {
            // Attempt to register again?
            socket.write(JSON.stringify(registerRequestMessage) + "\n");
         }
      }
      else if(state == "inGame") {
         if(msg.type == "status") {
            var turn = new BotwarsTurn(msg, socket);
            process.nextTick(function() {
               self.emit('turn', turn);               
            });


         }
      }

   });
   socket.on('connect', function() {
      // Attempt to login
      socket.write(JSON.stringify(loginRequestMessage) + "\n");

   });
   
}

util.inherits(BotwarsClient, events.EventEmitter);

// Exports
exports.create = function(socket, username, password) {
   return new BotwarsClient(socket, username, password);
}



