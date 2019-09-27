"use strict";

var SocketSystem = function(){
	this.socket = undefined;
    this.playerMoveInterval = undefined;
}

SocketSystem.prototype.onSocketConnect = function() {
    console.log('Connected to server: ' + window.location.host);
}


SocketSystem.prototype.onSocketDisconnect = function() {
    console.log('Disconnected from server');
    Socket.socket.close();
}

/**
 * 
 * Init
 * 
 */

SocketSystem.prototype.init = function(){
	Socket.socket = io.connect('http://localhost:1337', {transports: ['websocket']});
	Socket.socket.on('connect', Socket.onSocketConnect);
	Socket.socket.on('disconnect', Socket.onSocketDisconnect);
}

/**
 * 
 * Start game
 * 
 */

SocketSystem.prototype.startGame = function(){
	Socket.socket.on('initPlayer', Socket.initPlayer);

    Socket.socket.emit('startGame', {
        'username': username,
        'element': element
    });
}




/**
 * 
 * Init player
 * 
 */

SocketSystem.prototype.initPlayer = function(data){
	player = Socket.createNewPlayer(data.player);
    players.push(player);
    var sentPlayers = data.players;
    me = playerById(player.id);
    drawAnchor = me;

    // Get server players
    Socket.getServerPlayers(data.serverPlayers);

    // Get game players
    for (i = 0; i < sentPlayers.length; ++i)
        Socket.newPlayer(sentPlayers[i]);

    // Get AOEs and basicAttacks
    Socket.newBasicAttacks(data.basicAttacks);
    Socket.newAOEs(data.AOEs);

    // Get orbs
    for (i = 0; i < data.healthOrbs.length; ++i) {
        healthOrbs.push(data.healthOrbs[i]);
        healthOrbs[i].frame = 0;
    }

    // Set up socket listeners
    Socket.setupListeners();

    Input.setupListeners();

    // Setup viewport 
    DOM.setupViewport();

    // Setup particleSystem
    particleSystem = new ParticleSystem(window, 200, 0.4, 0.5, 0.5);
    particleSystem.init();

    // Setup deathSystem
    deathSystem = new DeathSystem();

    // Start game
    mainloop();
    Socket.playerMoveInterval = setInterval(Socket.sendPlayerMove, 25);
}






/**
 * 
 * Setup listeners
 * 
 */
SocketSystem.prototype.setupListeners = function(){
	Socket.socket.on('playersUpdate', Socket.updatePlayers);
	Socket.socket.on('newPlayer', Socket.newPlayer);
    Socket.socket.on('newBasicAttacks', Socket.newBasicAttacks);
    Socket.socket.on('newAOEs', Socket.newAOEs);
    Socket.socket.on('newSpecials', Socket.newSpecials);
    Socket.socket.on('newKills', Socket.newDeaths);
    Socket.socket.on('basicAttackHits', Socket.newBasicAttackHits);
    Socket.socket.on('splicedAOEs', Socket.splicedAOEs);
    Socket.socket.on('destroyOrbs', Socket.destroyOrbs);
    Socket.socket.on('removePlayer', Socket.removePlayer);
    Socket.socket.on('newMessages', Socket.newMessages);
}


/**
 * 
 * Remove listeners
 * 
 */
SocketSystem.prototype.removeListeners = function(){
	Socket.socket.removeListener('initPlayer', Socket.initPlayer);
	Socket.socket.removeListener('playersUpdate', Socket.updatePlayers);
	Socket.socket.removeListener('newPlayer', Socket.newPlayer);
    Socket.socket.removeListener('newBasicAttacks', Socket.newBasicAttacks);
    Socket.socket.removeListener('newAOEs', Socket.newAOEs);
    Socket.socket.removeListener('newSpecials', Socket.newSpecials);
    Socket.socket.removeListener('newKills', Socket.newDeaths);
    Socket.socket.removeListener('basicAttackHits', Socket.newBasicAttackHits);
    Socket.socket.removeListener('splicedAOEs', Socket.splicedAOEs);
    Socket.socket.removeListener('destroyOrbs', Socket.destroyOrbs);
    Socket.socket.removeListener('removePlayer', Socket.removePlayer);
    Socket.socket.removeListener('newMessages', Socket.newMessages);

    clearInterval(Socket.playerMoveInterval);
}


/**
 * 
 * Update Players
 * 
 */
SocketSystem.prototype.updatePlayers = function(data){
	var receivedPlayers = data.players;

    console.log('received update');

    for (i = 0; i < receivedPlayers.length; ++i) {
        player = playerById(receivedPlayers[i].id);

        if (!player)
            continue;

        // update position
        player.x = player.targetX;
        player.y = player.targetY;

        player.startX = player.x;
        player.startY = player.y;

        player.targetX = receivedPlayers[i].x;
        player.targetY = receivedPlayers[i].y;

        player.moveX = receivedPlayers[i].moveX;
        player.moveY = receivedPlayers[i].moveY;

        player.hp = receivedPlayers[i].hp;
        player.mana = receivedPlayers[i].mana;
        player.level = receivedPlayers[i].level;
        player.maxHp = (elements[player.element].startHp * player.level);

        // update immunity
        player.buffs.immunity.value = receivedPlayers[i].buffs.immunity !== undefined ? true : false;

        // update buff
        if (receivedPlayers[i].buffs.buff !== undefined) { // if receivedPlayer has buff
            if(player.buffs.buff === undefined)
                player.buffs.buff = 0;
        } else {
            player.buffs.buff = undefined;
        }

        // update invisibility
        if (receivedPlayers[i].buffs.invisibility !== undefined) { // if receivedPlayer has invisibility
            player.buffs.invisibility = true;
        } else {
            player.buffs.invisibility = undefined;
        }

        // update serverPlayers array
        if(DOM.scoreBoardState === true){
            var serverPlayer = playerById(player.id, serverPlayers);
            serverPlayer.level = player.level;
        }

        // update only myself
        if (me.id === receivedPlayers[i].id) {
            // update cooldowns
            if (receivedPlayers[i].cooldowns.basicAttack !== undefined) // basicAttack cooldown
                player.cooldowns.basicAttack = Date.now() + receivedPlayers[i].cooldowns.basicAttack - data.sendDate;
            else
                player.cooldowns.basicAttack = undefined;

            if (receivedPlayers[i].cooldowns.AOE !== undefined) // AOE cooldown
                player.cooldowns.AOE = Date.now() + receivedPlayers[i].cooldowns.AOE - data.sendDate;
            else
                player.cooldowns.AOE = undefined;

            if (receivedPlayers[i].cooldowns.buff !== undefined) // buff cooldown
                player.cooldowns.buff = Date.now() + receivedPlayers[i].cooldowns.buff - data.sendDate;
            else
                player.cooldowns.buff = undefined;

			if (receivedPlayers[i].cooldowns.special !== undefined) // special cooldown
                player.cooldowns.special = Date.now() + receivedPlayers[i].cooldowns.special - data.sendDate;
            else
                player.cooldowns.special = undefined;

            DOM.updateStats(player);
        }
    }

    previousLastUpdate = lastUpdate;
    lastUpdate = Date.now();
}








/**
 * 
 * New player
 * 
 */
SocketSystem.prototype.newPlayer = function(data){
	var buffs = data.buffs;

    var newPlayer = Socket.createNewPlayer(data);
    players.push(newPlayer);

    var serverPlayer = playerById(newPlayer.id, serverPlayers);

    if(!serverPlayer){
        serverPlayers.push({
            id: newPlayer.id,
            username: newPlayer.username,
            element: newPlayer.element,
            level: 1,
            kills: 0,
            assists: 0,
            deaths: 0,
            hit: 0,
            hitBy: []
        });
    } else {
        serverPlayer.element = newPlayer.element;
        serverPlayer.username = newPlayer.username;
        serverPlayer.level = 1;
        serverPlayer.dead = false;
    }
}


/**
 * 
 * New basicAttacks
 * 
 */
SocketSystem.prototype.newBasicAttacks = function(data) {
    for (i = 0; i < data.length; ++i) {
        data[i].frame = 0;
        basicAttacks.push(data[i]);
    }
}






/**
 * 
 * New AOEs
 * 
 */
SocketSystem.prototype.newAOEs = function(data) {
    for (i = 0; i < data.length; ++i) {
        // First sent AOEs have cicle
        if (data[i].cicle)
            data[i].expireDate = Date.now() + ((data[i].expireCicle - data[i].cicle) * (1000 / 60));
        else
            data[i].expireDate = Date.now() + elements[data[i].element].AOE.duration;

        data[i].frame = 0;
        AOEs.push(data[i]);
    }
}






/**
 * 
 * New specials
 * 
 */
SocketSystem.prototype.newSpecials = function(data){
	for(i = 0; i < data.length; ++i){
		specials.push({
			ownerElement: data[i].ownerElement,
			x: data[i].x,
			y: data[i].y,
			frame: 0
		});
	}
}






/**
 * 
 * New deaths
 * 
 */
SocketSystem.prototype.newDeaths = function(data){
	for(i = 0; i < data.length; ++i){
        // Add new death
        deathSystem.new(data[i].killer, data[i].assister, data[i].victim);
    }
}





/**
 * 
 * New basicAttackHits
 * 
 */
SocketSystem.prototype.newBasicAttackHits = function(data){
	for(i = data.length - 1; i >= 0; --i){
        // Splice basicAttack
        spliceIndex = playerById(data[i].id, basicAttacks, 'index');
        if(spliceIndex !== false){
            basicAttacks.splice(spliceIndex, 1);
        }

        // Set victim's hit buff
        player = playerById(data[i].victimId);
        // Skip if player isn't alive
        if(!player)
            continue;
        player.buffs.hit.type = detectElement(data[i].type);
        player.buffs.hit.frame = 0;
    }
}




/**
 * 
 * New spliced AOEs
 * 
 */
SocketSystem.prototype.splicedAoes = function(data){
	for(i = data.length - 1; i >= 0; --i){
		spliceIndex = playerById(data[i], AOEs, 'index');
		if(spliceIndex !== false)
			AOEs.splice(spliceIndex, 1);
	}
}





/**
 * 
 * New destroyed orbs
 * 
 */
SocketSystem.prototype.destroyOrbs = function(data){
	var id;
	for (j = data.length - 1; j >= 0; --j){
        // splice all healthOrbs twins with this one
        id = data[j];
        spliceIndex = playerById(id, healthOrbs, 'index');
        while(spliceIndex !== false){
            healthOrbs.splice(spliceIndex, 1);
            spliceIndex = playerById(id, healthOrbs, 'index');
        }
    }
}




/**
 * 
 * Remove player
 * 
 */
SocketSystem.prototype.removePlayer = function(data){
	// splice player from server players array
    spliceIndex = playerById(data, serverPlayers, 'index');
    if (spliceIndex === false)
        return;
    serverPlayers.splice(spliceIndex, 1);

    // splice player from game players array
    spliceIndex = playerById(data, players, 'index');
    if (spliceIndex === false)
        return;

    players.splice(spliceIndex, 1);
}






/**
 * 
 * Get server players
 * 
 */
SocketSystem.prototype.getServerPlayers = function (data){
    // Get Server Players
    for(i = 0; i < data.length; ++i){
        serverPlayers.push(data[i]);
    }
}





/**
 * 
 * Create new player
 * 
 */
SocketSystem.prototype.createNewPlayer = function(data){
	return {
        ip: data.ip,
        id: data.id,
        level: data.level,
        x: data.x,
        y: data.y,
        startX: data.x,
        startY: data.y,
        targetX: data.x,
        targetY: data.y,
        moveX: 0,
        moveY: 0,
        moving: true,
        hp: data.hp,
        mana: data.mana,
        maxHp: data.hp,
        username: data.username,
        element: data.element,
        frame: 0,
        buffs: {
            immunity: {
                value: data.buffs.immunity !== undefined ? true : false,
                frame: 0
            },
            buff: undefined,
            invisibility: undefined,
            hit: {
                type: undefined,
                frame: 0
            }
        },
        cooldowns: {
            basicAttack: undefined,
            AOE: undefined,
            buff: undefined,
            special: undefined
        }
    }
}








/**
 * 
 * Send Player Move
 * 
 */

SocketSystem.prototype.sendPlayerMove = function(difX, difY){
    // Cancel if I can't fucking move
    if(me.moving === false || me.buffs.stun !== undefined || me.buffs.pushback !== undefined)
        return

    if (Input.change === false) {
        var difX = lastXMousePos - DOM.canvasWidthOffset;
        var difY = lastYMousePos - DOM.canvasHeightOffset;
    } else {
        var difX = xMousePos - DOM.canvasWidthOffset;
        var difY = yMousePos - DOM.canvasHeightOffset;
    }

    Socket.socket.emit('playerMove', {
        'difX': difX,
        'difY': difY
    });
}




/**
 * 
 * Emit new basic attack
 * 
 */

SocketSystem.prototype.emitNewBasicAttack = function(moveX, moveY){
    Socket.socket.emit('basicAttack', {
        'moveX': moveX,
        'moveY': moveY,
    });
}








/**
 * 
 * Send chat message
 * 
 */

 SocketSystem.prototype.sendChatMessage = function(msg){
    this.socket.emit('newMessage', msg);
 }








 /**
 * 
 * New chat messages
 * 
 */

SocketSystem.prototype.newMessages = function(data){
    for(var i = 0; i < data.length; ++i){
        Chat.receiveMessage(data[i]);
    }
}