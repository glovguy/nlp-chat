var http = require('http'),
	fs = require('fs'),
	validator = require('validator'),
	express = require('express'),
	request = require('request');

if (process.env.PROD) {
	port = (process.env.PORT);
} else {
	port = (5005);
}

if (process.env.PROD) {
	resource_name = 'http://language-games.herokuapp.com'
} else {
	resource_name = 'http://localhost:5000'
}

const url = require('url');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static('bower_components/bootstrap'));
app.use(express.static('bower_components/jquery'));
app.use(express.static('bootstrap_templates'));

app.get('/', function(request, response) {
	fs.readFile("client.html", 'utf-8', function (error, data) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(data);
		response.end();
	});
});

server.listen(port);
console.log("running... navigate to http://localhost:".concat(port.toString()));

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

		api_url = url.parse(resource_name + '/intention?text=' + escaped_message );

		request(
			{
				json: true,
				uri: api_url
			}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
			    console.log("RESPONSE BODY:");
				console.log(body);
				if (body["intention_with_which"] == true) {
					nlp_transmit("Why do you want that?");
				} else {
					nlp_transmit("Tell me more...");
				};
			} else {
				console.log("SOMETHING WENT WRONG");
				console.log(error + response + body);
			}
		
		})

	});
});
