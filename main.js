var Lazy = require('lazy'), net = require('net'), shortid = require('shortid');

// constants
var serverTickMS = 500;


// data
var clients = [];
var users = [];
var map = {
   pawns : [],
   walls : [],
   ores  : []
};


var server = net.createServer(function(socket) {
   var thisClient = {}
   clients.push(thisClient)
   thisClient.loggedIn = false;
   thisClient.socket = socket;

   new Lazy(socket).lines.forEach(function(msg) {
      var objMsg = JSON.parse(msg);
      if(thisClient.loggedIn) {
         if(objMsg.type == "signOut") {
            console.log("User Signed Out: " + thisClient.user.username);
            clients.splice(client.indexOf(thisClient), 1);
            socket.disconnect();
         }
         else if(objMsg.type == "command") {
            objMsg.commands.forEach(function (cmd) {
               if(cmd.type == "rotate") {
                  var pawn = map.pawns.find(function (pawn) {
                     return pawn.id == cmd.pawnId;
                  });
                  if(pawn != undefined) {
                     if(cmd.direction == "left") {
                        pawn.command = {type: "rotate", direction: "left"};
                     }
                     else if(cmd.direction == "right") {
                        pawn.command = {type: "rotate", direction: "right"};
                     }
                     else {
                        pawn.command = {type: "none"};
                     }
                  }
               }
               else if(cmd.type == "move") {
                  var pawn = map.pawns.find(function (pawn) {
                     return pawn.id == cmd.pawnId;
                  });
                  if(pawn != undefined) {
                     pawn.command = {type: "move"};
                  }
               }
               else if(cmd.type == "none") {
                  var pawn = map.pawns.find(function (pawn) {
                     return pawn.id == cmd.pawnId;
                  });
                  if(pawn != undefined) {
                     pawn.command = {type: "none"};
                  }
               }
               else if(cmd.type == "pickup") {
                  var pawn = map.pawns.find(function (pawn) {
                     return pawn.id == cmd.pawnId;
                  });
                  if(pawn != undefined) {
                     pawn.command = {type: "pickup"};
                  }
               }
               else if(cmd.type == "drop") {
                  var pawn = map.pawns.find(function (pawn) {
                     return pawn.id == cmd.pawnId;
                  });
                  if(pawn != undefined) {
                     pawn.command = {type: "drop"};
                  }
               }
            });
         }
         else {
            socket.write(JSON.stringify({type : "result", result : "failure", code : 1, text : "Unknown Message Type"}));
         }
      }
      else {
         if(objMsg.type == "register") {
            var thisUser = {}
            users.push(thisUser);
            thisUser.username = objMsg.username;
            thisUser.password = objMsg.password;
            console.log("Created user: " + objMsg.username);
            socket.write(JSON.stringify({type: "result", result : "success"}));
            map.pawns.push({id: shortid.generate(), owner: thisUser.username, x:0, y:0, facing:"north", health:10, view:2, command:{type: "none"}});
         }
         else if(objMsg.type == "signIn") {
            var thisUser = users.find(function(username) {
               return username == objMsg.username;
            });
            if(thisUser.password == objMsg.password) {
               thisClient.user = thisUser;
               thisClient.loggedIn = true;
               console.log("User Signed In: " + objMsg.username);
               socket.write(JSON.stringify({type: "result", result : "success"}));
            }
            else {
               console.log("User " + objMsg.username + " entered incorrect password");
               socket.write(JSON.stringify({type: "result", result : "failure"}));
            }

         }
         else {
            socket.disconnect();
         }
      }
   });
}).listen(8000);

console.log("Server started at port 8000");


function CreateSightArray(coords, radius) {
   if(radius <= 0) {
      return [{x: coords.x, y: coords.y}];
   }
   else {
      var points = {};
      var min = {x: coords.x - radius, y: coords.y - radius};
      var size = radius * 2 + 1;
      for(var x = min.x; x <= min.x + size; x ++) {
         for(var y = min.y; y <= min.y + size; y ++) {
            points.push({x: x, y: y});
         }
      }
      return points;
   }
}

function AddCoordSet(array, coordsList) {
   coordsList.forEach(function (coord) {
      var obj = array.find(function (ele) {
         return ele.x == coord.x && ele.y == coord.y;
      });
      if(obj == undefined) {
         array.push(coord);
      }
   });
}

function rotate(facing, direction) {
   var result = facing;
   if(facing == "north") {
      if(direction == "left") {
         result = "west";
      }
      else if(direction == "right") {
         result = "east";
      }
   }
   else if(facing == "east") {
      if(direction == "left") {
         result = "north";
      }
      else if(direction == "right") {
         result = "south";
      }
   }
   else if(facing == "south") {
      if(direction == "left") {
         result = "east";
      }
      else if(direction == "right") {
         result = "west";
      }
   }
   else if(facing == "west") {
      if(direction == "left") {
         result = "south";
      }
      else if(direction == "right") {
         result = "north";
      }
   }
   return result;
}

function facingOffset(facing) {
   var result = {x: 0, y: 0};
   if(facing == "north") {
      result.y = -1;
   }
   else if(facing == "east") {
      result.x = 1;
   }
   else if(facing == "south") {
      result.y = 1;
   }
   else if(facing == "west") {
      result.x = -1;
   }
   return result;
}

setInterval(function() {
   console.log("Tick!");
   // Proccess State

   map.pawns.forEach(function (pawn) {
      if(pawn.command.type == "rotate") {
         pawn.facing = rotate(pawn.facing, pawn.command.direction);
      }
      else if(pawn.command.type == "move") {
         var offset = facingOffset(pawn.facing);
         pawn.x = pawn.x + offset.x;
         pawn.y = pawn.y + offset.y;

      }

      pawn.command = {type: "none"};
   });

   // Send Results
   clients.forEach(function(client) {
      if(client.loggedIn) {
         var myPawnList = [];
         var viewSet = [];
         var vision = [];
         var clientMessage = {
            type: "status",
            username: client.user.username,
            serverTickMS: serverTickMS,
            vision: vision
         };
         map.pawns.forEach(function(pawn) {
            if(pawn.user == client.user) {
               myPawnList.push(pawn);
            }
         });
         myPawnList.forEach(function(pawn) {
            AddCoordSet(viewSet, CreateSightArray(pawn, pawn.view));
         });
         viewSet.forEach(function (coord){
            var thisCoordObj = {x: coord.x, y: coord.y, type : "none"};
            map.pawns.forEach(function (pawn) {
               if(coord.x == pawn.x && coord.y == pawn.y) {
                  thisCoordObj.type = "pawn";
                  thisCoordObj.pawn = {id: pawn.id, owner: pawn.owner, facing: pawn.facing, health: pawn.health};
               }

            });
            map.walls.forEach(function (wall) {
               if(coord.x == wall.x && coord.y == wall.y) {
                  thisCoordObj.type = "wall";
               }               
            });
            map.ores.forEach(function (ore) {
               if(coord.x == ore.x && coord.y == ore.y) {
                  thisCoordObj.type = "ore";
               }
               
            });
            vision.push(thisCoordObj);
         });
         client.socket.write(JSON.stringify(clientMessage));
      }
   });
}, serverTickMS);

