var carrier = require('carrier'), 
    net     = require('net'), 
    shortid = require('shortid');

// constants
var serverTickMS = 500;


// data
var clients = [];
var users = [];
var map = {
   pawns     : [],
   terrain   : [],
   ores      : [ { x: 0, y: -1, rate: 1, max: 100, value: 50 } ],
   items     : [],
   buildings : []
};

var buildingPrices = {
   smallSolar   : 50,
   smallFactory : 100,
   smallStorage : 100,
};

var actionCosts = {
   rotate   : 1,
   move     : 5,
   mine     : 10,
   build    : 20,
   pickup   : 2,
   drop     : 2,
   activate : 10
};


function findPawnById(pawnId) {
   for(var i = 0; i < map.pawns.length; i++) {
      if(map.pawns[i].id == pawnId) {
         return map.pawns[i];
      }
   }
   return undefined;
}

var server = net.createServer(function(socket) {
   var thisClient = {}
   clients.push(thisClient)
   thisClient.loggedIn = false;
   thisClient.socket = socket;

   var thisCarrier = carrier.carry(socket);
   thisCarrier.on('line', function(line) {
      var objMsg = JSON.parse(line);
      if(thisClient.loggedIn) {
         if(objMsg.type == "signOut") {
            console.log("User Signed Out: " + thisClient.user.username);
            clients.splice(client.indexOf(thisClient), 1);
            socket.end();
         }
         else if(objMsg.type == "command") {
            //console.log(objMsg);
            objMsg.commands.forEach(function (cmd) {
               if(cmd.type == "rotate") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     if(cmd.direction == "left") {
                        pawn.command = { type: "rotate", direction: "left" };
                     }
                     else if(cmd.direction == "right") {
                        pawn.command = { type: "rotate", direction: "right" };
                     }
                     else {
                        pawn.command = { type: "none" };
                     }
                  }
               }
               else if(cmd.type == "move") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     pawn.command = { type: "move" };
                  }
               }
               else if(cmd.type == "none") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     pawn.command = { type: "none" };
                  }
               }
               else if(cmd.type == "pickup") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     pawn.command = { type: "pickup", amount: cmd.amount };
                  }
               }
               else if(cmd.type == "drop") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     pawn.command = { type: "drop", amount: cmd.amount };
                  }
               }
               else if(cmd.type == "charge") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     pawn.command = { type: "charge" };
                  }
               }
               else if(cmd.type == "mine") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     pawn.command = { type: "mine" };
                  }
               }
               else if(cmd.type == "build") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     pawn.command = { type: "build", buildingType: cmd.buildingType };
                  }
               }
               else if(cmd.type == "activate") {
                  var pawn = findPawnById(cmd.pawnId);
                  if(pawn != undefined) {
                     pawn.command = { type: "activate" };
                  }
               }
            });
         }
         else {
            socket.write(JSON.stringify({type : "result", result : "failure", 
               code : 1, text : "Unknown Message Type"}) + "\n");
         }
      }
      else {
         if(objMsg.type == "register") {
            var thisUser = {}
            users.push(thisUser);
            thisUser.username = objMsg.username;
            thisUser.password = objMsg.password;
            console.log("Created user: " + objMsg.username);
            socket.write(JSON.stringify({type: "result", result : "success"}) + "\n");
            map.pawns.push({id: shortid.generate(), owner: thisUser, x:0, y:0, 
               facing: "north", health:10, view:2, storageType: "none", 
               storageCount: 0, storageMax: 100, charge: 100, chargeMax: 100, 
               command: { type: "none" } });
            //console.log(map.pawns);
         }
         else if(objMsg.type == "signIn") {
            var thisUser = users.find(function(user) {
               return user.username == objMsg.username;
            });
            if(thisUser == undefined) {
               console.log("User " + objMsg.username + " not found");
               //console.log(users);
               socket.write(JSON.stringify({type: "result", result: "failure", reason: "Username not found"}) + "\n");
            }
            else {
               if(thisUser.password == objMsg.password) {
                  thisClient.user = thisUser;
                  thisClient.loggedIn = true;
                  console.log("User Signed In: " + objMsg.username);
                  socket.write(JSON.stringify({type: "result", result : "success"}) + "\n");
               }
               else {
                  console.log("User " + objMsg.username + " entered incorrect password");
                  socket.write(JSON.stringify({type: "result", result : "failure"}) + "\n");
               }
            }

         }
         else {
            socket.end();
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
      var points = [];
      var min = {x: coords.x - radius, y: coords.y - radius};
      var size = radius * 2 + 1;
      for(var x = min.x; x < min.x + size; x ++) {
         for(var y = min.y; y < min.y + size; y ++) {
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

function viewToRect(x, y, view) {
   return {
      x:      x - view,
      y:      y - view,
      width:  view * 2 + 1,
      height: view * 2 + 1
   };
}

function listAllInArea(x, y, width, height) {
   if(width <= 0 || height <= 0) {
      return [];
   }
   var list = [];
   for(var i = 0; i < map.pawns.length; i++) {
      var pawn = map.pawns[i];
      if(pawn.x >= x && pawn.y >= y &&
         pawn.x < x + width && pawn.y < y + height) {
         list.push({ type:"pawn", x: pawn.x, y: pawn.y, index: i, pawn: pawn });
      }
   }

   for(var i = 0; i < map.terrain.length; i++) {
      var terr = map.terrain[i];
      if(terr.x >= x && terr.y >= y &&
         terr.x < x + width && terr.y < y + height) {
         list.push({ type:"terrain", x: terr.x, y: terr.y, index: i, terrain: terr });
      }
   }

   for(var i = 0; i < map.ores.length; i++) {
      var ore = map.ores[i];
      if(ore.x >= x && ore.y >= y &&
         ore.x < x + width && ore.y < y + height) {
         list.push({ type: "ore", x: ore.x, y: ore.y, index: i, ore: ore });
      }
   }

   for(var i = 0; i < map.items.length; i++) {
      var item = map.items[i];
      if(item.x >= x && item.y >= y &&
         item.x < x + width && item.y < y + height) {
         list.push({ type: "item", x: item.x, y: item.y, index: i, item: item });
      }
   }
   for(var i = 0; i < map.buildings.length; i++) {
      var building = map.buildings[i];
      if(building.x >= x && building.y >= y &&
         building.x < x + width && building.y < y + height) {
         list.push({ type: "building", x: building.x, y: building.y, index: i, 
                     building: building });
      }
   }
   return list;
}

function addAreaToSet(set, area) {
   for(var i = 0; i < area.length; i++) {
      var found = false;
      for(var k = 0; k < set.length; k++) {
         if(area[i].type == set[k].type && 
            area[i].x    == set[k].x && 
            area[i].y    == set[k].y) {
            found = true;
            break;
         }
      }
      if(found == false) {
         set.push(area[i]);
      }
   }
}

setInterval(function() {
   //console.log("Tick!");
   // Update clients list
   for(var i = clients.length - 1; i >= 0; i--) {
      if(clients[i].socket.destroyed)
      {
         console.log("User Signed Out: " + clients[i].user.username);
         clients.splice(i, 1);
      }
   }

   // Update Ores

   for(var i = 0; i < map.ores.length; i++) {
      var ore = map.ores[i];
      ore.value = ore.value + ore.rate;
      if(ore.value > ore.max) {
         ore.value = ore.max;
      }
   }

   // Update Buildings
   for(var i = 0; i < map.buildings.length; i++) {
      var building = map.buildings[i];
      if(building.type == "smallSolar") {
         var eles = listAllInArea(building.x, building.y, 1, 1);
         var item = undefined;
         var otherItem = false;
         for(k = 0; k < eles.length; k++) {
            if(eles[k].type == "item") {
               if(eles[k].item.type == "battery") {
                  item = eles[k].item;
                  break;
               }
               else {
                  otherItem = true;
                  break;
               }
            }
         }

         if(otherItem == false) {
            if(item == undefined) {
               map.items.push({ x: building.x, y: building.y, type: "battery", 
                  count: building.rate });
            }
            else {
               item.count = item.count + building.rate;
            }
         }
      }
   }


   // Proccess State

   for(var i = 0; i < map.pawns.length; i++) {
      var pawn = map.pawns[i];
      if(pawn.command.type == "rotate") {
         if(pawn.charge < actionCosts.rotate) {
            pawn.charge = 0;
         }
         else {
            pawn.facing = rotate(pawn.facing, pawn.command.direction);
            pawn.charge = pawn.charge - actionCosts.rotate;
         }
      }
      else if(pawn.command.type == "move") {
         if(pawn.charge < actionCosts.move) {
            pawn.charge = 0;
         }
         else {
            var offset = facingOffset(pawn.facing);
            pawn.x = pawn.x + offset.x;
            pawn.y = pawn.y + offset.y;
            pawn.charge = pawn.charge - actionCosts.move;
         }

      }
      else if(pawn.command.type == "mine") {
         var offset = facingOffset(pawn.facing);
         var target = {
            x: pawn.x + offset.x,
            y: pawn.y + offset.y
         };
         var eles = listAllInArea(target.x, target.y, 1, 1);
         var mined = 0;
         var mineAblity = 10;
         for(var k = 0; k < eles.length; k++) {
            if(eles[k].type == "ore") {
               if(eles[k].ore.value >= mineAblity) {
                  mined = mineAblity;
               }
               else {
                  mined = eles[k].ore.value;
               }
               eles[k].ore.value = eles[k].ore.value - mined;

               break;
            }
         }

         if(mined > 0) {
            if(pawn.charge < actionCosts.mine) {
               pawn.charge = 0;
            }
            else {
               var item = undefined;
               var otherItem = false;
               for(var k = 0; k < eles.length; k++) {
                  if(eles[k].type == "item") {
                     if(eles[k].item.type == "ore") {
                        item = eles[k].item;
                        break;
                     }
                     else {
                        otherItem = true;
                        break;
                     }
                  }
               }
               if(otherItem == false)
               {
                  if(item == undefined) {
                     map.items.push({ x: target.x, y: target.y, type: "ore", count: mined });
                  }
                  else {
                     item.count = item.count + mined;
                  }
               }
               pawn.charge = pawn.charge - actionCosts.mine;
            }
         }
      }
      else if(pawn.command.type == "build") {
         var offset = facingOffset(pawn.facing);
         var target = {
            x: pawn.x + offset.x,
            y: pawn.y + offset.y
         };
         var searchRect = viewToRect(target.x, target.y, 1);
         var eles = listAllInArea(searchRect.x, searchRect.y, 
                                  searchRect.width, searchRect.height);
         var oreList = [];
         var oreValue = 0;
         var areaClear = true;
         for(var k = 0; k < eles.length; k++) {
            if(eles[k].type == "building" && eles[k].x == target.x && eles[k].y == target.y) {
               areaClear = false;
            }
            else if(eles[k].type == "item" && eles[k].item.type == "ore") {
               oreList.push(eles[k]);
               oreValue = oreValue + eles[k].item.count;
            }
         }
         var cost = buildingPrices[pawn.command.buildingType];

         if(areaClear && oreValue >= cost) {
            if(pawn.charge < actionCosts.build) {
               pawn.charge = 0;
            }
            else {
               // remove Ore
               for(var k = 0; k < oreList.length; k++) {
                  if(oreList[k].item.count >= cost) {
                     oreList[k].item.count = oreList[k].item.count - cost;
                     cost = 0;
                  }
                  else {
                     cost = cost - oreList[k].item.count;
                     oreList[k].item.count = 0;
                     
                  }
                  if(oreList[k].item.count <= 0) {
                     map.items.splice(oreList[k].index, 1);
                  }
                  if(cost <= 0) {
                     break;
                  }
               }
               // Create Building
               var building = { type: pawn.command.buildingType, 
                                x: target.x, y: target.y, owner: pawn.owner };

               if(building.type == "smallSolar") {
                  building.view   = 1;
                  building.health = 10;
                  building.rate   = 2;
               }
               else if(building.type == "smallFactory") {
                  building.view   = 1;
                  building.health = 10;
                  building.cost   = 100;
               }
               map.buildings.push(building);
               pawn.charge = pawn.charge - actionCosts.build;

            }
         }
      }
      else if(pawn.command.type == "activate") {
         var offset = facingOffset(pawn.facing);
         var target = {
            x: pawn.x + offset.x,
            y: pawn.y + offset.y
         };
         var eles = listAllInArea(target.x, target.y, 1, 1);
         var building = undefined;
         for(var k = 0; k < eles.length; k++) {
            if(eles[k].type == "building") {
               building = eles[k].building;
               break;
            }
         }
        

         if(building != undefined && building.type == "smallFactory" ) {
            if(pawn.charge < actionCosts.activate) {
               pawn.charge = 0;
            }
            else {
               var rect = viewToRect(building.x, building.y, 1);
               var eles = listAllInArea(rect.x, rect.y, rect.width, rect.height);
               var oreList = [];
               var oreValue = 0;
               var areaClear = true;
               for(var k = 0; k < eles.length; k++) {
                  if(eles[k].type == "pawn" && eles[k].x == target.x && eles[k].y == target.y) {
                     areaClear = false;
                  }
                  else if(eles[k].type == "item" && eles[k].item.type == "ore") {
                     oreList.push(eles[k]);
                     oreValue = oreValue + eles[k].item.count;
                  }
               }
               var cost = building.cost;

               if(areaClear && oreValue >= cost) {
                  // remove Ore
                  for(var k = 0; k < oreList.length; k++) {
                     if(oreList[k].item.count >= cost) {
                        oreList[k].item.count = oreList[k].item.count - cost;
                        cost = 0;
                     }
                     else {
                        cost = cost - oreList[k].item.count;
                        oreList[k].item.count = 0;
                        
                     }
                     if(oreList[k].item.count <= 0) {
                        map.items.splice(oreList[k].index, 1);
                     }
                     if(cost <= 0) {
                        break;
                     }
                  }
                  // Create New Pawn
                  map.pawns.push({ id: shortid.generate(), owner: building.owner, 
                                   x: building.x, y: building.y, 
                                   facing: pawn.facing, health:10, view:2, 
                                   storageType: "none", storageCount: 0,
                                   storageMax: 100, charge: 100, chargeMax: 100, 
                                   command: { type: "none" } });
               }
               pawn.charge = pawn.charge - actionCosts.activate;
            }
         }
      }
      else if(pawn.command.type == "pickup") {
         if(pawn.storageCount < pawn.storageMax) {
            var offset = facingOffset(pawn.facing);
            var target = {
               x: pawn.x + offset.x,
               y: pawn.y + offset.y
            };
            var eles = listAllInArea(target.x, target.y, 1, 1);
            var itemEle = undefined;
            for(var k = 0; k < eles.length; k ++) {
               if(eles[k].type == "item" ) {
                  itemEle = eles[k];
                  break;
               }
            }

            if(itemEle != undefined && (
               pawn.storageType == itemEle.item.type || 
               pawn.storageCount == 0)) {
               pawn.storageType = itemEle.item.type;
               var xfer = pawn.command.amount;
               if(xfer + pawn.storageCount > pawn.storageMax) {
                  xfer = pawn.storageMax - pawn.storageCount;
               }
               if(xfer > itemEle.item.count) {
                  xfer = itemEle.item.count;
               }
               if(xfer > 0) {
                  if(pawn.charge < actionCosts.pickup) {
                     pawn.charge = 0;
                  }
                  else {
                     pawn.storageCount = pawn.storageCount + xfer;
                     itemEle.item.count = itemEle.item.count - xfer;

                     if(itemEle.item.count <= 0) {
                        map.items.splice(itemEle.index, 1);
                     }
                     pawn.charge = pawn.charge - actionCosts.pickup;
                  }
               }
            }
         }
      }
      else if(pawn.command.type == "drop") {
         if(pawn.storageCount > 0) {
            var offset = facingOffset(pawn.facing);
            var target = {
               x: pawn.x + offset.x,
               y: pawn.y + offset.y
            };
            var eles = listAllInArea(target.x, target.y, 1, 1);
            var itemEle = undefined;
            for(var k = 0; k < eles.length; k ++) {
               if(eles[k].type == "item" ) {
                  itemEle = eles[k];
                  break;
               }
            }

            var xfer = pawn.command.amount;
            if(pawn.storageCount < xfer) {
               xfer = pawn.storageCount;
            }
            if(itemEle == undefined) {
               if(pawn.charge < actionCosts.drop) {
                  pawn.charge = 0;
               }
               else {
                  map.items.push({ x: target.x, y: target.y, 
                                   type: pawn.storageType, count: xfer });
                  pawn.storageCount = pawn.storageCount - xfer;
                  pawn.charge = pawn.charge - actionCosts.drop;
               }
            }
            if(pawn.storageType == itemEle.item.type) {
               if(pawn.charge < actionCosts.drop) {
                  pawn.charge = 0;
               }
               else {
                  itemEle.item.count = itemEle.item.count + xfer;
                  pawn.storageCount = pawn.storageCount - xfer;
                  pawn.charge = pawn.charge - actionCosts.drop;

               }
            }
            if(pawn.storageCount <= 0) {
               pawn.storageType = "none";
            }
         }
      }
      else if(pawn.command.type == "charge") {
         if(pawn.storageType == "battery") {
            var xfer = pawn.chargeMax - pawn.charge;
            if(xfer > pawn.storageCount)
            {
               xfer = pawn.storageCount;
            }
            pawn.charge = pawn.charge + xfer;
            pawn.storageCount = pawn.storageCount - xfer;
            if(pawn.storageCount <= 0) {
               pawn.storageType = "none";
            }
         }
      }

      pawn.command = {type: "none"};

   }

   // Decay Items
   var maxItemCount = 100;
   var itemDecayRate = 5;
   for(var i = 0; i < map.items.length; i++) {
      var item = map.items[i];
      if(item.count > maxItemCount) {
         if(item.count - itemDecayRate < maxItemCount) {
            item.count = maxItemCount;
         }
         else {
            item.count = item.count - itemDecayRate;
         }

      }
   }

   // Send Results
   clients.forEach(function(client) {
      if(client.loggedIn) {
         var viewSet = [];
         var vision = [];
         var clientMessage = {
            type: "status",
            username: client.user.username,
            serverTickMS: serverTickMS,
            vision: vision
         };

         for(k = 0; k < map.pawns.length; k++) {
            var pawn = map.pawns[k];
            if(pawn.owner == client.user) {
               var rect = viewToRect(pawn.x, pawn.y, pawn.view);
               addAreaToSet(viewSet, listAllInArea(rect.x, rect.y, rect.width, rect.height));

            }
         }
         for(k = 0; k < map.buildings.length; k++) {
            var building = map.buildings[k];
            if(building.owner == client.user) {
               var rect = viewToRect(building.x, building.y, building.view);
               addAreaToSet(viewSet, listAllInArea(rect.x, rect.y, rect.width, rect.height));
            }
         }


         viewSet.forEach(function (ele) {
            var thisCoordObj = { x: ele.x, y: ele.y, type : ele.type };
            if(ele.type == "pawn") {
               thisCoordObj.pawn = {
                  id:           ele.pawn.id, 
                  ownerName:    ele.pawn.owner.username, 
                  facing:       ele.pawn.facing,
                  health:       ele.pawn.health,
                  view:         ele.pawn.view,
                  storageType:  ele.pawn.storageType,
                  storageCount: ele.pawn.storageCount,
                  storageMax:   ele.pawn.storageMax,
                  charge:       ele.pawn.charge,
                  chargeMax:    ele.pawn.chargeMax
               };               
            }
            else if(ele.type == "ore") {
               thisCoordObj.ore = {
                  value: ele.ore.value,
                  rate:  ele.ore.rate,
                  max:   ele.ore.max
               };
            }
            else if(ele.type == "item") {
               thisCoordObj.item = {
                  type:  ele.item.type,
                  count: ele.item.count
               };
            }
            else if(ele.type == "building") {
               thisCoordObj.building = {
                  type:      ele.building.type,
                  view:      ele.building.view,
                  health:    ele.building.health,
                  ownerName: ele.building.owner.username
               };
               if(thisCoordObj.building.type == "smallFactory") {
                  thisCoordObj.building.cost = ele.building.cost;
               }
            }
            

            vision.push(thisCoordObj);
         });
         //console.log(vision);
         client.socket.write(JSON.stringify(clientMessage) + "\n");
      }
   });
}, serverTickMS);

