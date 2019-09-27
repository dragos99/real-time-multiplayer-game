var cfg = require('../config.js');
var elements = require('../gameClient/scripts/elements.js');
var Tracker = require('./Tracker.js');
var uuid = require('node-uuid');


function SocketSystem(io, gameServer){
	this.io = io;
	this.gameServer = gameServer;
}

module.exports = SocketSystem;

/**
 * 
 * Start game
 * 
 */

SocketSystem.prototype.startGame = function(){
	this.io.on("connection", this.onSocketConnection.bind(this));
}



/**
 * 
 * On client connect
 * 
 */

SocketSystem.prototype.onSocketConnection = function(client){
	var newId = client.id;
	var clientIp = client.handshake.headers['x-forwarded-for'] || client.handshake.address;
	console.log('new player');
    var serverPlayer = {
        ip: clientIp,
        id: newId,
        username: undefined,
        element: undefined,
        spliceDate: undefined,
        hit: 0,
        hitBy: [],
        kills: 0,
        assists: 0,
        deaths: 0
    };

	this.gameServer.serverPlayers.push(serverPlayer);

    client.on('disconnect', this.onClientDisconnect.bind(this, client));
    client.on('startGame', this.onNewPlayer.bind(this, client));
    client.on('playerMove', this.onPlayerMove.bind(this, client));
    client.on('moving', this.onChangePlayerState.bind(this, client));
    client.on('basicAttack', this.onNewBasicAttack.bind(this, client));
    client.on('newAOE', this.onNewAOE.bind(this, client));
    client.on('newBuff', this.onNewBuff.bind(this, client));
    client.on('newSpecial', this.onNewSpecial.bind(this, client));
    client.on('newMessage', this.onNewMessage.bind(this, client));
}




/**
 * 
 * On client disconnect
 * 
 */

 SocketSystem.prototype.onClientDisconnect = function(client){
 	var removePlayer = this.gameServer.playerById(client.id, this.gameServer.serverPlayers);
    // Player not found
    if (!removePlayer) 
        return;

    // add disconnection date to player
    console.log('Player disconnected: ' + removePlayer.id);
    removePlayer.spliceDate = Date.now() + cfg.PLAYER_KEEP_ALIVE;
 }

 



/**
 * 
 * On new player
 * 
 */

 SocketSystem.prototype.onNewPlayer = function(client, data){

 	var newId = client.id;
    var found = false;

    var serverPlayer = this.gameServer.playerById(client.id, this.gameServer.serverPlayers);
    if(!serverPlayer)
    	return;

    // Check if player already connected
    /*
    for (i = players.length - 1; i >= 0; --i)
        if (players[i].ip === clientIp) {
            players[i].id = newId;
            players[i].spliceDate = undefined;
            newPlayer = players[i];
            players.splice(i, 1);

            found = true;
            break;
        }
    */

    // Set username if there isn't any
    if(data.username === ''){
    	data.username = 'NoName';
    }

    // Create a new player
    if (found === false) {
        newPlayer = {
            id: newId,
            username: data.username,
            element: data.element,
            level: 1,
            x: 1000,
            y: 1000,
            moveX: 0,
            moveY: 0,
            hp: elements[data.element].startHp,
            mana: 100,
            moving: true,
            buffs: {
                immunity: Date.now() + cfg.IMMUNITY_TIME,
                buff: undefined,
                invisibility: undefined,
                stun: undefined,
                pushback: undefined,
            },
            cooldowns: {
                basicAttack: undefined,
                AOE: undefined,
                buff: undefined,
                special: undefined
            }
        }

        serverPlayer.username = data.username;
        serverPlayer.element = data.element;

        // Broadcast new player to the connected socket clients
        client.broadcast.emit('newPlayer', newPlayer);
    }
        

    // Send player data to the new player
    client.emit('initPlayer', {
        player: newPlayer,
  		serverPlayers: this.gameServer.serverPlayers,
        players: this.gameServer.players,
        basicAttacks: this.gameServer.basicAttacks,
        healthOrbs: this.gameServer.healthOrbs,
        AOEs: this.gameServer.AOEs
    });
    

    // Add player to players array
    this.gameServer.players.push(newPlayer);
    console.log('Player connected : ' + newPlayer.username);
 }






/**
 * 
 * On player move
 * 
 */

SocketSystem.prototype.onPlayerMove = function(client, data){
	var player = this.gameServer.playerById(client.id);

    // Player not found
    if (!player)
        return;

    // Cancel if player has no control (pushback effect)
    if(player.buffs.pushback !== undefined)
        return;

    // Calculate speed 
    var speed = elements[player.element].speed;
    if (player.element.indexOf('Air') !== -1 && player.buffs.buff !== undefined)
        speed += elements[player.element].buff.effect * speed;

    var distance = Math.sqrt(Math.pow(data.difX, 2) + Math.pow(data.difY, 2));

    var moves = distance / speed;
    var moveX = data.difX / moves;
    var moveY = data.difY / moves;

    player.moveX = moveX;
    player.moveY = moveY;

}




/**
 * 
 * On change player state
 * 
 */

SocketSystem.prototype.onChangePlayerState = function(client, data){
	var player = this.gameServer.playerById(client.id);
	
    if(!player)
    	return;

    player.moving = data.moving;
    player.moveX = 0;
    player.moveY = 0;

}






/**
 * 
 * On new basic attack
 * 
 */

 SocketSystem.prototype.onNewBasicAttack = function(client, data){
 	var player = this.gameServer.playerById(client.id);

    if (!player)
        return;
    
    // Check requirements for basicAttack
    if(Tracker.checkPlayerRequirements(player, 'basicAttack') === false)
    	return;

    // Create the attack
    var acosA = Math.acos(data.moveX) * (180 / Math.PI);
    var angle;

    if (data.moveY <= 0)
        angle = acosA;
    else
        angle = 360 - acosA;

    // Calculate damage
    var dmg = elements[player.element].basicAttack.dmg;
    if(player.element.indexOf('Fire') !== -1 && player.buffs.buff !== undefined)
        dmg += elements[player.element].buff.effect * dmg;

    // Calculate position and speed
    var speed = (elements[player.element].basicAttack.range / elements[player.element].basicAttack.duration) * (1000 / 60);
    var x = player.x + (data.moveX * speed) * 2;
    var y = player.y + (data.moveY * speed) * 2;


    this.gameServer.basicAttacks.push({
        ownerId: player.id,
        id: uuid.v1(),
        ownerElement: player.element,
        dmg: dmg,
        x: x,
        y: y,
        angle: angle,
        moveX: data.moveX,
        moveY: data.moveY,
        speed: speed,
        cicle: 0,
        expireCicle: Math.ceil(elements[player.element].basicAttack.duration / (1000 / 60))
    });

    this.gameServer.newBasicAttacks.push({
        ownerElement: player.element,
        id: this.gameServer.basicAttacks[this.gameServer.basicAttacks.length - 1].id,
        x: x,
        y: y,
        angle: angle
    });

    // Set basicAttack cooldown
    player.cooldowns.basicAttack = Date.now() + elements[player.element].basicAttack.cooldown;

    // Reduce player's mana
    Tracker.reducePlayerMana(player, 'basicAttack');

    // Cancel fire's special
    if(player.element.indexOf('Fire') !== -1 && player.buffs.invisibility !== undefined)
        Tracker.cancelBuff(player, 'invisibility');
 }






 /**
 * 
 * On new AOE
 * 
 */

 SocketSystem.prototype.onNewAOE = function(client, data){
 	var player = this.gameServer.playerById(client.id);
    if(!player)
        return;

    // Cancel if immunity, cooldown or stun
    if (Tracker.checkPlayerRequirements(player, 'AOE') === false)
        return;

   var x, y;

    // Push AOE for fire, air and earth
    if (player.element !== 'basicWaterElement') {
        if (data) {
            x = data.x;
            y = data.y;

            this.gameServer.newAOEs.push({
                id: player.id,
                element: player.element,
                x: x,
                y: y
            });
        } else {
            x = player.x;
            y = player.y;

            this.gameServer.newAOEs.push({
                id: player.id,
                element: player.element
            });
        }
    
        // Calculate damage
        dmg = elements[player.element].AOE.dmg;
        if(player.element.indexOf('Fire') !== -1 && player.buffs.buff !== undefined)
            dmg += elements[player.element].buff.effect * dmg;
       
        this.gameServer.AOEs.push({
            id: player.id,
            element: player.element,
            dmg: dmg,
            x: x,
            y: y,
            cicle: 0,
            expireCicle: Math.round(elements[player.element].AOE.duration / (1000 / 60)) 
        });
    } else {
    	var AOEangle, moveX, moveY, dmg, speed;

    	// Push AOE for water
        for (i = 0; i < 16; ++i) {
            AOEangle = i * (Math.PI / 8);
            moveX = Math.cos(AOEangle);
            moveY = -Math.sin(AOEangle);

		    // Calculate damage
		    dmg = elements[player.element].basicAttack.dmg;

			// Calculate position and speed
		    speed = (elements[player.element].basicAttack.range / elements[player.element].basicAttack.duration) * (1000 / 60);
		    x = player.x + (moveX * speed) * 2;
		    y = player.y + (moveY * speed) * 2;

		    this.gameServer.basicAttacks.push({
		    	ownerId: player.id,
		        id: uuid.v1(),
		        ownerElement: player.element,
		        dmg: dmg,
		        x: x,
		        y: y,
		        angle: AOEangle * (180 / Math.PI),
		        moveX: moveX,
		        moveY: moveY,
                speed: speed,
		        cicle: 0,
		        expireCicle: Math.ceil(elements[player.element].basicAttack.duration / (1000 / 60))
		    });

		    var length = this.gameServer.basicAttacks.length;

		    this.gameServer.newBasicAttacks.push({
		        ownerElement: player.element,
		        id: this.gameServer.basicAttacks[length - 1].id,
		        x: x,
		        y: y,
		        angle: AOEangle * (180 / Math.PI)
		    });
        }
    }

    // Set AOE cooldown
    player.cooldowns.AOE = Date.now() + elements[player.element].AOE.cooldown;

    // Reduce player's mana
    Tracker.reducePlayerMana(player, 'AOE');

    // Cancel fire's special
    if(player.element.indexOf('Fire') !== -1 && player.buffs.invisibility !== undefined)
        Tracker.cancelBuff(player, 'invisibility');
 }





/**
 * 
 * On new buff
 * 
 */

 SocketSystem.prototype.onNewBuff = function(client, data){
 	var player = this.gameServer.playerById(client.id);

    if (!player)
        return;

    // Cancel if immunity or cooldown
    if (Tracker.checkPlayerRequirements(player, 'buff') === false)
        return;

    // Set buff
    if (player.element.indexOf('Water') !== -1) { // water element
        var maxHp = this.gameServer.calcMaxHp(player);
        var hpGain = elements[player.element].buff.effect * (maxHp - player.hp);
        player.hp += hpGain;
    } 

    // Reduce player's mana
    Tracker.reducePlayerMana(player, 'buff');

    // Set cooldown and expire date
    player.buffs.buff = Date.now() + elements[player.element].buff.duration;
    player.cooldowns.buff = Date.now() + elements[player.element].buff.cooldown;
 }







 /**
 * 
 * On new special
 * 
 */

 SocketSystem.prototype.onNewSpecial = function(client){
 	player = this.gameServer.playerById(client.id);
    if(!player)
        return;

    // Cancel if immunity or cooldown
    if(Tracker.checkPlayerRequirements(player, 'special') === false)
        return;

    // Set special
    if(player.element.indexOf('Fire') !== -1){ // fire element
        player.buffs.invisibility = Date.now() + elements[player.element].special.duration;
    } else {
        if(player.element.indexOf('Air') !== -1){
            player.buffs.stun = undefined;
            player.buffs.pushback = undefined;
        }

        this.gameServer.newSpecials.push({
            ownerElement: player.element,
            x: player.x,
            y: player.y
        });

        this.gameServer.specials.push({
            ownerId: player.id,
            ownerElement: player.element,
            x: player.x,
            y: player.y,
            used: false
        });
    }

    // Reduce player's mana
    Tracker.reducePlayerMana(player, 'special');

    player.cooldowns.special = Date.now() + elements[player.element].special.cooldown;
 }





/**
 * 
 * On new message
 * 
 */

 SocketSystem.prototype.onNewMessage = function(client, data){
 	var player = this.gameServer.playerById(client.id, this.gameServer.serverPlayers);

    this.gameServer.Chat.newMessage({
        sender: player.username,
        msg: data
    });
 }