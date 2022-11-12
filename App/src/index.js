"use strict";

var connection = null;
var clientId = 0;

function setUsername() {
	console.log("***SET USERNAME");
	var msg = {
		name: document.getElementById("name").value,
		date: Date.now(),
		id: clientId,
		type: "username"
	};
	console.log("Sending username to server: " + console.dir(msg));
	connection.send(JSON.stringify(msg));
}

function connect() {
	var serverUrl;
	var scheme = "ws";

	if (document.location.protocol === "https:") {
		scheme += "s";
	}

	serverUrl = scheme + "://" + document.location.hostname + ":6502";

	connection = new WebSocket(serverUrl, "json");
	console.log("***CREATED WEBSOCKET");

	connection.onopen = function (evt) {
		console.log("***ONOPEN");
		document.getElementById("text").disabled = false;
		document.getElementById("send").disabled = false;
	};
	console.log("***CREATED ONOPEN");

	connection.onmessage = function (evt) {
		console.log("***ONMESSAGE");
		var f = document.getElementById("chatbox").contentDocument;
		var text = "";
		var msg = JSON.parse(evt.data);
		console.log("Message received: ");
		console.dir(msg);
		var time = new Date(msg.date);
		var timeStr = time.toLocaleTimeString();

		switch (msg.type) {
			case "id":
				clientId = msg.Id;
				setUsername();
				break;
			case "username":
				text = "<b>User <em>" + msg.name + "</em> signed in at " + timeStr + "</b><br>";
				break;
			case "message":
				text = "(" + timeStr + ") <b>" + msg.name + "</b>: " + msg.text + "<br>";
				break;
			case "rejectusername":
				text = "<b>Your username has been set to <em>" + msg.name + "</em> because the name you chose is in use.</b><br>";
				break;
			case "userList":
				var ul = "";
				var i;
				for (i = 0; i < msg.users.length; ++i) {
					ul += msg.users[i] + "<br>";
				}
				document.getElementById("userlistbox").innerHTML = ul;
				break;
		}

		if (text.length) {
			f.write(text);
			document.getElementById("chatbox").contentWindow.scrollByPages(1);
		}
	};
	console.log("***CREATED ONMESSAGE");
}

function send() {
	console.log("***SEND");
	var msg = {
		text: document.getElementById("text").value,
		type: "message",
		id: clientId,
		date: Date.now()
	};
	connection.send(JSON.stringify(msg));
	document.getElementById("text").value = "";
}

function handleKey(evt) {
	if (evt.keyCode === 13 || evt.keyCode === 14) {
		if (!document.getElementById("send").disabled) {
			send();
		}
	}
}
