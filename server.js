var http = require('http'),
	fs = require('fs'),
	validator = require('validator'),
	port = 1337;

var app = http.createServer(function (request, response) {
	fs.readFile("client.html", 'utf-8', function (error, data) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(data);
		response.end();
	});
}).listen(port);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {
	socket.on('message_to_server', function(data) {
		var escaped_message = validator.escape(data["message"]);
		io.sockets.emit("message_to_client",{ message: escaped_message });
		sleep(500).then(() => {
			io.sockets.emit("message_from_nlp",{ message: "hi there!" });
		})
	});
});

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

console.log("running... navigate to http://localhost:".concat(port.toString()))