var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var io = require("socket.io");

function start() {
  function onRequest(request, response) {
    var uri = url.parse(request.url).pathname;
	if (uri === "/") uri = "/index.html";
    var filename = "../client" + uri;
	console.log(filename);
    path.exists(filename, function(exists) {
      if (!exists) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
      } else { // file exists
        fs.readFile(filename, "binary", function(err, file) {
          if (err) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
            return;
          } else {
            response.writeHead(200);
            response.write(file, "binary");
            response.end();
          }
        });
      }
    });
  }

  var server = http.createServer(onRequest);
  server.listen(80);

  var users = {};

  var socket = io.listen(server);
  socket.on('connection', function(client) {
    console.log("New socket.io client");
    
    outgoingMessage = {};
    outgoingMessage.type = "recognizeExistingUsers";
    outgoingMessage.users = users;
    client.send(outgoingMessage);
    
    client.on('message', function(incomingMessage) {
			if (incomingMessage.type == "thisUserChangedPosition") {
        users[client.sessionId].x = incomingMessage.x;
        users[client.sessionId].y = incomingMessage.y;
        outgoingMessage = {};
        outgoingMessage.type = "otherUserChangedPosition";
        outgoingMessage.sessionId = client.sessionId;
        outgoingMessage.x = incomingMessage.x;
        outgoingMessage.y = incomingMessage.y;
        client.broadcast(outgoingMessage);
      } else if (incomingMessage.type == "thisUserClicked") {
      	console.log(client.sessionId + " clicked on " + incomingMessage.elementId);
      	outgoingMessage = {};
        outgoingMessage.type = "otherUserClicked";
        outgoingMessage.sessionId = client.sessionId;
        outgoingMessage.elementId = incomingMessage.elementId;
        outgoingMessage.x = incomingMessage.x;
        outgoingMessage.y = incomingMessage.y;
        client.broadcast(outgoingMessage);
      } else if (incomingMessage.type == "thisUserRegistered") {
        console.log(client.sessionId + " registered as " + incomingMessage.name);
        var user = {};
        user.sessionId = client.sessionId;
        user.name = incomingMessage.name;
        user.x = 0;
        user.y = 0;
        users[user.sessionId] = user;
        outgoingMessage = {};
        outgoingMessage.type = "otherUserRegistered";
        outgoingMessage.sessionId = client.sessionId;
        outgoingMessage.name = user.name;
        client.broadcast(outgoingMessage);
      }
    });

    client.on('disconnect', function() {
      console.log("Socket.io client left: " + client.sessionId);
      delete(users[client.sessionId]);
      outgoingMessage = {};
      outgoingMessage.type = "otherUserLeft";
      outgoingMessage.sessionId = client.sessionId;
      client.send(outgoingMessage);
    });
  }); 
  
  console.log("Server has started.");
}

exports.start = start;
