var util    = require('util'), 
    events  = require('events'), 
    carrier = require('carrier');


function BotwarsTurn(msg, socket) {
   var self = this;
   this.raw = msg;
   this.myPawns = [];
   msg.vision.forEach(function(spot) {
      if(spot.type == "pawn" && spot.pawn.ownerName == msg.username) {
         self.myPawns.push({id: spot.pawn.id, x: spot.x, y: spot.y, 
            facing: spot.pawn.facing, health: spot.pawn.health});
      }
   });

   var command = {type: "command", commands: []};

   this.pawnTurnLeft = function(id) {
      command.commands.push({type: "rotate", pawnId: id, direction: "left"});
   }
   this.pawnTurnRight = function(id) {
      command.commands.push({type: "rotate", pawnId: id, direction: "right"});
   }
   this.pawnMove = function(id) {
      command.commands.push({type: "move", pawnId: id});
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
            if(type == "pawn") {
               result.things.push({type: "pawn", id: spot.pawn.id, 
                  ownerName: spot.pawn.ownerName, facing: spot.pawn.facing, 
                  health: spot.pawn.health});
            }
            else if(type == "wall") {
               result.things.push({type: "wall"});
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



