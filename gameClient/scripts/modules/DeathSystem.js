
/**
 * 
 * Death System
 * 
 */

var DeathSystem = function(){
	this.deathNoticesPanel = document.getElementById('deathNotices');
	this.deathNotices = [];
	this.deathNoticesPanel.innerHTML = '';
}

// New death
DeathSystem.prototype.new = function(killerId, assisterId, victimId){
	var killerIndex, assisterIndex = false, victimIndex;

	// Get killer index
	killerIndex = playerById(killerId, serverPlayers, 'index');

    // Get victim index
    victimIndex = playerById(victimId, serverPlayers, 'index');

    // Get assister index
    if(assisterId !== undefined)
        assisterIndex = playerById(assisterId, serverPlayers, 'index');

    // Update players' stats
	if(killerIndex !== false)
        serverPlayers[killerIndex].kills++;

    if(assisterIndex !== false)
        serverPlayers[assisterIndex].assists++;

    if(victimIndex !== false){
        serverPlayers[victimIndex].deaths++;
        serverPlayers[victimIndex].dead = true;
    }


    // Add new death notice
    if(killerIndex !== false && victimIndex !== false){
    	var deathNotice;
    	var killer = serverPlayers[killerIndex].username;
    	var victim = serverPlayers[victimIndex].username;

    	var deathNoticeId = Math.floor((Math.random() * 1000) + 1);
    	var dn_class = '';
    	if(serverPlayers[killerIndex].id === me.id)
    		dn_class = 'my_death_notice';

    	if(assisterIndex === false){
    		deathNotice = '<div id="dn_'+ deathNoticeId +'" class="death_notice '+ dn_class +'"><span class="killer_notice">'+ killer +'</span><img src="./gameClient/img/death_notice.png" class="unselectable"> <span class="victim_notice">'+ victim +'</span></div>';
    	} else {
    		var assister = serverPlayers[assisterIndex].username;
    		deathNotice = '<div id="dn_'+ deathNoticeId +'" class="death_notice '+ dn_class +'"><span class="killer_notice">'+ killer +'</span> + <span class="assister_notice">'+ assister +'</span><img src="./gameClient/img/death_notice.png"  class="unselectable"> <span class="victim_notice">'+ victim +'</span></div>';
    	}

    	this.deathNoticesPanel.insertAdjacentHTML('beforeend', deathNotice);

    	this.deathNotices.push({
    		id: deathNoticeId,
    		expiryDate: Date.now() + 5000
    	});

    	this.removeDeathNotices();
    }


    this.killPlayer(victimId);
}

// Kill player
DeathSystem.prototype.killPlayer = function(victimId){
    if (!victimId)
        return;

    var spliceIndex = playerById(victimId, players, 'index');

    // If I died, end game
    if (victimId === me.id) {
        gameOver();
        return;
    }

    // If player is dead, spawn health orb
    this.spawnHealthOrb(players[spliceIndex]);

    players.splice(spliceIndex, 1);
}

// Spawn health orb
DeathSystem.prototype.spawnHealthOrb = function(victim){
	healthOrbs.push({
        id: victim.id,
        x: victim.targetX,
        y: victim.targetY,
        frame: 0
	});
}

// Remove death notice
DeathSystem.prototype.removeDeathNotices = function(){
	var child;
	for(var i = this.deathNotices.length - 1; i >= 0; --i){
		// Fade out death notice
		if(this.deathNotices[i].expiryDate <= Date.now()){
			$('#dn_' + this.deathNotices[i].id).fadeOut();
			$('#dn_' + this.deathNotices[i].id).attr('id', '');
		}
	}
}