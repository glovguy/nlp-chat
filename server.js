var http = require('http'),
	fs = require('fs'),
	validator = require('validator'),
	express = require('express'),
	port = (process.env.PORT || 5000);

var http = require('http');
const url = require('url');

var app = http.createServer(function (request, response) {
	fs.readFile("client.html", 'utf-8', function (error, data) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(data);
		response.end();
	});
}).listen(port);

var io = require('socket.io').listen(app);

callback = function(response) {
	var str = '';

			  //another chunk of data has been recieved, so append it to `str`
			  response.on('data', function (chunk) {
			  	str += chunk;
			  });

			  //the whole response has been received, so we just print it out here
			  response.on('end', function () {
			  	console.log(str=='True');
			  	if (str == 'True') {
			  		nlp_transmit("Why do you want that?");
			  	} else {
			  		nlp_transmit("Tell me more...");
			  	};
			  });
			}

nlp_transmit = function(message) {
	nlp_message = message;
	io.sockets.emit("message_from_nlp",{ message: nlp_message });
	console.log("NLP says: " + nlp_message);
}

io.sockets.on('connection', function(socket) {
	socket.on('message_to_server', function(data) {
		var escaped_message = validator.escape(data["message"]);
		io.sockets.emit("message_to_client",{ message: escaped_message });
		console.log("Someone said: " + escaped_message);

		

		api_url = url.parse('http://language-games.herokuapp.com/intention?text=' + escaped_message)
		var options = {
		  host: api_url.host,
		  path: api_url.path
		};

		http.request(options, callback).end();
	});
});

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

console.log("running... navigate to http://localhost:".concat(port.toString()))