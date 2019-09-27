var express = require('express');
var router = express.Router();
var client = express.Router();

/**
 *
 * Page requests
 *
 */
client.use(express.static(__dirname + '/gameClient'));

client.get('/', (req, res) => {
	res.sendFile(__dirname + '/gameClient/index.html');
});

// Get game page assets
router.get('/gameClient/*', function(req, res){
	res.sendFile(__dirname + req.url);
});

// Get Game page
router.get('/gameClient', function(req, res){
	res.sendFile(__dirname + '/gameClient/index.html');
});

// Export the module
module.exports = {
	router: router,
	client
}
