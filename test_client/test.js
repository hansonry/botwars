var carrier = require('carrier'), net = require('net');

var socket = net.createConnection(8000);
var myCarrier = carrier.carry(socket);

var state = {registered: false, loggedIn: false};

myCarrier.on('line', function(line) {
   var msg = JSON.parse(line);
   if(state.registered == false) {
      if(msg.type == "result" && msg.result == "success") {
         state.registered = true;
         var message = {type: "signIn", username: "hansonry", password: "1234"};
         socket.write(JSON.stringify(message) + "\n");
      }
   }
   else if(state.loggedIn == false) {
      if(msg.type == "result" && msg.result == "success") {
         state.loggedIn = true;
      }
   }
   else if(state.loggedIn == true) {
      // TODO: Proccess commands
      if(msg.type == "status") {
         console.log("Line: " + line);
         msg.vision.forEach(function (pos) {
            if(pos.type == "pawn") {
               console.log(pos.pawn);
            }
         });
         
      }
   }

   //console.log(msg);
});

socket.on('connect', function() {
   var message = {type: "register", username: "hansonry", password: "1234"};
   socket.write(JSON.stringify(message) + "\n");
});



