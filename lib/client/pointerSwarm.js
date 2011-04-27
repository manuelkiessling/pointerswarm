var name = prompt("Please enter your name:", "");

var socket = new io.Socket("localhost");
socket.connect();

socket.on('connect', function() {
	message = {}
	message.type = "name";
	message.name = name;
	socket.send(message);
	document.onmousemove = onMove;
	document.onclick = onClick;
});

socket.on('message', function(message) {
	if (message.type == "newUser") {
		addUserToView(document.getElementById("pointerSwarmPlayground"), message.sessionId, message.name);

	} else if (message.type == "existingUsers" ) {
		for (sessionId in message.users) {
			addUserToView(document.getElementById("pointerSwarmPlayground"), sessionId, message.users[sessionId].name);
		}

	}	else if (message.type == "userChangedPosition") {
		document.getElementById("u" + message.sessionId).style.left = message.x + "px";
		document.getElementById("u" + message.sessionId).style.top = message.y + "px";

	}	else if (message.type == "userClicked") {
		mouseClick(message.elementId);

	} else if (message.type == "userLeft") {
		document.getElementById("u" + message.sessionId).style.display = "none";
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
	message = {};
	message.type = "click";
	message.elementId = event.target.id;
	message.x = event.pageX;
	message.y = event.pageY;
	socket.send(message);
}

function sendCoordinates(event) {
	message = {};
	message.type = "position";
	message.x = event.pageX;
	message.y = event.pageY;
	socket.send(message);
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
