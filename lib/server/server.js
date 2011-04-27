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
    
    message = {};
    message.type = "existingUsers";
    message.users = users;
    client.send(message);
    
    client.on('message', function(msg) {
			if (msg.type == "position") {
        users[client.sessionId].x = msg.x;
        users[client.sessionId].y = msg.y;
        message = {};
        message.type = "userChangedPosition";
        message.sessionId = client.sessionId;
        message.x = msg.x;
        message.y = msg.y;
        client.broadcast(message);
      } else if (msg.type == "click") {
      	console.log(client.sessionId + " clicked on " + msg.elementId);
      	message = {};
        message.type = "userClicked";
        message.sessionId = client.sessionId;
        message.elementId = msg.elementId;
        message.x = msg.x;
        message.y = msg.y;
        client.broadcast(message);
      } else if (msg.type == "name") {
        var user = {};
        user.sessionId = client.sessionId;
        user.name = msg.name;
        user.x = 0;
        user.y = 0;
        users[user.sessionId] = user;
        message = {};
        message.type = "newUser";
        message.sessionId = client.sessionId;
        message.name = user.name;
        client.broadcast(message);
      }
    });

    client.on('disconnect', function() {
      console.log("Socket.io client left: " + client.sessionId);
      delete(users[client.sessionId]);
      message = {};
      message.type = "userLeft";
      message.sessionId = client.sessionId;
      client.broadcast(message);
    });
  }); 
  
  console.log("Server has started.");
}

exports.start = start;
