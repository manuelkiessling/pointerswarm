var name = prompt("Please enter your name:", "");

var socket = new io.Socket("localhost");
socket.connect();

socket.on('connect', function() {
	outgoingMessage = {}
	outgoingMessage.type = "thisUserRegistered";
	outgoingMessage.name = name;
	socket.send(outgoingMessage);
	document.onmousemove = onMove;
	document.onclick = onClick;
});

socket.on('message', function(incomingMessage) {
	if (incomingMessage.type == "otherUserRegistered") {
		addUserToView(document.getElementById("pointerSwarmPlayground"), incomingMessage.sessionId, incomingMessage.name);

	} else if (incomingMessage.type == "recognizeExistingUsers" ) {
		for (sessionId in incomingMessage.users) {
			addUserToView(document.getElementById("pointerSwarmPlayground"), sessionId, incomingMessage.users[sessionId].name);
		}

	}	else if (incomingMessage.type == "otherUserChangedPosition") {
		document.getElementById("u" + incomingMessage.sessionId).style.left = incomingMessage.x + "px";
		document.getElementById("u" + incomingMessage.sessionId).style.top = incomingMessage.y + "px";

	}	else if (incomingMessage.type == "otherUserClicked") {
		mouseClick(incomingMessage.elementId);

	} else if (incomingMessage.type == "otherUserLeft") {
		document.getElementById("u" + incomingMessage.sessionId).style.display = "none";
	}

});

socket.on('disconnect', function() {
});

var running = false;
function onMove(event) {
	event = event || window.event;
	if (!running) {
		running = true;
		setTimeout(function(){sendCoordinates(event);running=false;}, 10);
	}
}

var clickInProgress = false;
function onClick(event) {
	if (clickInProgress) {
		clickInProgress = false;
		return true;
	}
	outgoingMessage = {};
	outgoingMessage.type = "thisUserClicked";
	outgoingMessage.elementId = event.target.id;
	outgoingMessage.x = event.pageX;
	outgoingMessage.y = event.pageY;
	socket.send(outgoingMessage);
}

function sendCoordinates(event) {
	outgoingMessage = {};
	outgoingMessage.type = "thisUserChangedPosition";
	outgoingMessage.x = event.pageX;
	outgoingMessage.y = event.pageY;
	socket.send(outgoingMessage);
}

function addUserToView(area, userId, userName) {
	var old = area.innerHTML;
	area.innerHTML = old + '<div style="position: fixed;" id="u' + userId + '"><img src="http://localhost/mousepointer.png" width="22" height="22" />' + userName + '</div>';
}

function mouseClick(elementId) {
	clickInProgress = true;
	var evt = document.createEvent("MouseEvents");
  evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  var el = document.getElementById(elementId);
  var canceled = !el.dispatchEvent(evt);
}
