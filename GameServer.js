var app = require('http').createServer()
var io = require('socket.io')(app);
var SocketSystem = require('./modules/SocketSystem.js');
var ChatSystem = require('./modules/ChatSystem.js');
var Tracker = require('./modules/Tracker.js');
var elements = require('./gameClient/scripts/elements.js');

function GameServer(port){
	this.Socket = new SocketSystem(io, this);
	this.Chat = new ChatSystem();
	this.PORT = port;

	this.tick = 0;
	this.time = Date.now();
	this.sendTick = 0;


	// initialize arrays
	this.players = [];
    this.serverPlayers = [];
	this.basicAttacks = [];
	this.newBasicAttacks = [];
	this.healthOrbs = [];
	this.takenOrbs = [];
	this.AOEs = [];
	this.newAOEs = [];
	this.newKills = [];
    this.specials = [];
    this.newSpecials = [];
    this.splicedAOEs = [];
    this.basicAttackHits = [];

    console.log('New GameServer started on port %s', this.PORT);

}

module.exports = GameServer;




/**
 * 
 * Start
 * 
 */

GameServer.prototype.start = function(){
	app.listen(this.PORT);

	this.Socket.startGame();

	setInterval(this.mainloop.bind(this), 1);
}






/**
 * 
 * Mainloop
 * 
 */

GameServer.prototype.mainloop = function(){
	this.tick += Date.now() - this.time;
    this.time = Date.now();

    if (this.tick >= 1000 / 60) {

    	// update at 60 fps
        setTimeout(this.updatePlayers.bind(this), 0);
        setTimeout(this.updateBasicAttacks.bind(this), 0);
        setTimeout(this.updateAOEs.bind(this), 0);
        setTimeout(this.updateSpecials.bind(this), 0);

        this.sendTick++;
        if (this.sendTick >= 3) {
        	// update at 20 fps
        	setTimeout(this.sendUpdates.bind(this), 0);


            this.sendTick = 0;
        }

    	this.tick = 0;
    }
}






/**
 * 
 * Send Updates
 * 
 */

GameServer.prototype.sendUpdates = function(){
	// Emit everything to everyone
    this.Socket.io.emit('playersUpdate', { players: this.players, sendDate: Date.now() });
    
    if (this.newBasicAttacks.length !== 0) 
    	io.emit('newBasicAttacks', this.newBasicAttacks);
    if (this.takenOrbs.length !== 0) 
    	io.emit('destroyOrbs', this.takenOrbs);
    if (this.newAOEs.length !== 0) 
    	io.emit('newAOEs', this.newAOEs);
    if(this.newKills.length !== 0)
    	io.emit('newKills', this.newKills);
    if(this.newSpecials.length !== 0)
        this.Socket.io.emit('newSpecials', this.newSpecials);
    if(this.splicedAOEs.length !== 0)
        this.Socket.io.emit('splicedAOEs', this.splicedAOEs);
    if(this.basicAttackHits.length !== 0)
    	this.Socket.io.emit('basicAttackHits', this.basicAttackHits);
    if(this.Chat.newMessages.length !== 0){
        this.Socket.io.emit('newMessages', this.Chat.newMessages);
        this.Chat.clearNewMessages();
    }

    // Once sent, erase them
    this.newBasicAttacks.length = 0;
    this.newAOEs.length = 0;
    this.takenOrbs.length = 0;
    this.newKills.length = 0;
    this.newSpecials.length = 0;
    this.splicedAOEs.length = 0;
    this.basicAttackHits.length = 0;
}





/**
 * 
 * update Players
 * 
 */

GameServer.prototype.updatePlayers = function(){
	var spliceIndex;

	// Check splice date
    for(var i = this.serverPlayers.length - 1; i >= 0; --i){
        if (this.serverPlayers[i].spliceDate != 'undefined' && this.serverPlayers[i].spliceDate <= Date.now()) {
            // emit the removed player
            io.emit('removePlayer', this.serverPlayers[i].id);

            // splice player from server array and game array
            spliceIndex = this.playerById(this.serverPlayers[i].id, this.players, 'index');
            if(spliceIndex !== false) 
                this.players.splice(spliceIndex, 1);
            this.serverPlayers.splice(i, 1);
        }
    }

    // Update players 
	for(var i = this.players.length - 1; i >= 0; --i){
        // Move the player
        setTimeout(Tracker.movePlayer.bind(this, i), 0);

		// Check expiry dates (for buffs mostly)
		setTimeout(Tracker.checkPlayerExpiryDates.bind(this, i), 0); 

		// Check cooldowns
		setTimeout(Tracker.checkPlayerCooldowns.bind(this, i), 0);

		// Check basicAttack collision
		setTimeout(Tracker.checkPlayerBasicAttackCollision.bind(this, i), 0);

		// Check AOE collision
		setTimeout(Tracker.checkPlayerAOECollision.bind(this, i), 0);

		// Check healthOrb collision
		setTimeout(Tracker.checkPlayerHealthOrbCollision.bind(this, i), 0);

        // Check special collision
        setTimeout(Tracker.checkPlayerSpecialCollision.bind(this, i), 0);

        
        if(!this.players[i])
        	continue;

        // Increase mana
        this.players[i].mana += 5 / (1000 / (1000 / 60));
        if( this.players[i].mana > 100)
        	this.players[i].mana = 100;
	}
}







/**
 * 
 * Update basic attacks
 * 
 */

GameServer.prototype.updateBasicAttacks = function(){
	for (var i = this.basicAttacks.length - 1; i >= 0; --i) {
    	// Check basicAttack expiry
        if (++this.basicAttacks[i].cicle >= this.basicAttacks[i].expireCicle) {
            this.basicAttacks.splice(i, 1);
            continue;
        }

        this.basicAttacks[i].x += this.basicAttacks[i].moveX * this.basicAttacks[i].speed;
        this.basicAttacks[i].y += this.basicAttacks[i].moveY * this.basicAttacks[i].speed;
    }
}


/**
 * 
 * Update AOEs
 * 
 */

GameServer.prototype.updateAOEs = function(){
	var player;

	for(var i = this.AOEs.length - 1; i >= 0; --i){
		// Check AOE expiry 
	    if (++this.AOEs[i].cicle >= this.AOEs[i].expireCicle) {
	        this.AOEs.splice(i, 1);
	        continue;
	    }

		// Move AOE if it's not from Earth
		if (this.AOEs[i].element.indexOf('Earth') === -1) {
    		player = this.playerById(this.AOEs[i].id);

    		// If owner died, splice AOE and continue
    		if(!player){
    			this.AOEs.splice(i, 1);
    			continue;
    		}

            this.AOEs[i].x = player.x;
            this.AOEs[i].y = player.y;
        }
	}
}


/**
 * 
 * Update specials
 * 
 */

GameServer.prototype.updateSpecials = function(){
	for(var i = this.specials.length - 1; i >= 0; --i){
        if(this.specials[i].used === true)
            this.specials.splice(i, 1);
    }
}


/**
 * 
 * Player hit
 * 
 */

GameServer.prototype.playerHit = function(index, damage, attackerId){
	var victim = this.players[index];
    var attackerServer = this.playerById(attackerId, this.serverPlayers);
    var assister = undefined;

	// Cancel if player has immunity
    if(victim.buffs.immunity !== undefined)
        return;

    // Reduce damage for earth victim if it's buff is activated
    if (victim.element.indexOf('Earth') !== -1 && victim.buffs.buff !== undefined)
        damage -= elements[victim.element].buff.effect * damage;

    victim.hp -= damage;
    if(attackerServer) attackerServer.hit += damage;

    // Update hit and hitBy
    victimServer = this.playerById(victim.id, this.serverPlayers);
    indexServer = this.playerById(attackerId, victimServer.hitBy, 'index');
    if(indexServer === false){
        victimServer.hitBy.push({
            id: attackerId,
            dmg: damage
        });
    } else {
        victimServer.hitBy[indexServer].dmg += damage;
    }

    // Victim died
    if (victim.hp <= 0) {
    	// create health orb
        this.healthOrbs.push({
        	id: victim.id,
            hp: this.calcMaxHp(victim) * 0.3,
            x: victim.x,
            y: victim.y
        });

        victimServer.deaths++;

        if(attackerServer) attackerServer.kills++;

        this.sort(victimServer.hitBy, 'dmg');
        for(var k = 0; k < victimServer.hitBy.length; ++k){
        	if(victimServer.hitBy[k].id !== attackerId){
        		assister = this.playerById(victimServer.hitBy[k].id, serverPlayers);
        		break;
        	}
        }

        if(assister) assister.assists++;

        this.newKills.push({
        	killer: attackerId,
        	assister: assister ? assister.id : undefined,
        	victim: victim.id
        });					

		victimServer.hit = 0;
        victimServer.hitBy = [];
		victimServer.hitBy.length = 0;
		assister = undefined;

        this.players.splice(index, 1);
    }
}


/**
 * 
 * Sort
 * 
 */

GameServer.prototype.sort = function(array, key){
	array.sort(function(a, b){
		return b[key] - a[key];
	});
}

GameServer.prototype.calcMaxHp = function(player) {
    return elements[player.element].startHp * player.level;
}

/**
 * 
 * PlayerById
 * 
 */

GameServer.prototype.playerById = function(id, array, request){
	array = array || this.players; // default is players
    request = request || 'player'; // default is player
    
    for (var f = 0; f < array.length; ++f) {
        if (array[f].id === id) {
            if (request === 'player')
                return array[f];
            return f;
        }
    }
    return false;
}


