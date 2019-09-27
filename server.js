'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var compression = require('compression');
var PORT = 8080;

app.use(compression());
app.use(express.static(__dirname + '/gameClient'));

// Get game page assets
app.get('/gameClient/*', function(req, res){
	res.sendFile(__dirname + req.url);
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/gameClient/index.html');
});

server.listen(PORT);
console.log('Server is running on port ' + PORT);


// Start the actual game server
var GameServer = require('./GameServer.js');
var gameServer = new GameServer(1337);

gameServer.start();

