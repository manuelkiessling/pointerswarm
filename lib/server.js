var http = require("http");
var url = require("url");
var io = require('socket.io');

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    route(handle, pathname, response);
  }

  server = http.createServer(onRequest);
  server.listen(80);
  
  var socket = io.listen(server);
  socket.on('connection', function(client) {
    console.log("New socket.io client");

    client.on('message', function(data) {
      console.log("Pointer X: " + data.x);
      console.log("Pointer Y: " + data.y);
    });

    client.on('disconnect', function() {
      console.log("Socket.io client left");
    });
  }); 
  
  console.log("Server has started.");
}

exports.start = start;
