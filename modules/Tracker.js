var elements = require('../gameClient/scripts/elements.js');
var cfg = require('../config.js');

function Tracker(){

}


Tracker.prototype.checkPlayerRequirements = function(player, check){
	// Cancel if immunity
    if(player.buffs.immunity !== undefined)
        return false;

    // Cancel if cooldown
    if(player.cooldowns[check] !== undefined)
    	return false;

    // Cancel if stun
    if(check !== 'special' && player.buffs.stun !== undefined)
    	return false;

    // Cancel if not enough mana
    if(player.mana < elements[player.element][check].mana)
    	return false;

    return true;
}





/**
 * 
 * Move player
 * 
 */

Tracker.prototype.movePlayer = function(index){
    var targetX, targetY;


    if (this.players[index].moving === true || this.players[index].buffs.pushback !== undefined) {
        if(this.players[index].buffs.stun === undefined || this.players[index].buffs.pushback !== undefined){ // if player is not stunned or has pushback
            targetX = this.players[index].x + this.players[index].moveX;
            targetY = this.players[index].y + this.players[index].moveY;
        } else {
            targetX = this.players[index].x;
            targetY = this.players[index].y;
        }

        if (targetX >= 0 && targetX <= cfg.MAP_WIDTH)
            this.players[index].x = targetX;
        if (targetY >= 0 && targetY <= cfg.MAP_HEIGHT)
            this.players[index].y = targetY;
    }
}






/**
 * 
 * Check player expiry dates
 * 
 */

Tracker.prototype.checkPlayerExpiryDates = function(index){
    // Check buff expiry
    // Check immunity expiry
    // Check stun expiry
    // Check invisibility expiry

    for(var j in this.players[index].buffs){
        if(!this.players[index].buffs.hasOwnProperty(j))
            continue;

        if (this.players[index].buffs[j] !== undefined && this.players[index].buffs[j] <= Date.now())
            this.players[index].buffs[j] = undefined;
    }
}







/**
 * 
 * Check player cooldowns
 * 
 */

Tracker.prototype.checkPlayerCooldowns = function(index){
    // Check basicAttack cooldown
    // Check AOE cooldown
    // Check buff cooldown
    // Check special cooldown

    for(var j in this.players[index].cooldowns){
        if(!this.players[index].cooldowns.hasOwnProperty(j))
            continue;

        if (this.players[index].cooldowns[j] !== undefined && this.players[index].cooldowns[j] <= Date.now())
            this.players[index].cooldowns[j] = undefined;
    }
}







/**
 * 
 * Check player basic attack collision
 * 
 */

Tracker.prototype.checkPlayerBasicAttackCollision = function(index){
    for (var j = this.basicAttacks.length - 1; j >= 0; --j) {
        // Cancel if player isn't alive or has immunity
        if (!this.players[index] || this.players[index].buffs.immunity !== undefined)
            return;

        if (this.players[index].id != this.basicAttacks[j].ownerId && this.basicAttacks[j].x - this.players[index].x <= 50 && this.basicAttacks[j].x - this.players[index].x >= -50 && this.basicAttacks[j].y - this.players[index].y <= 85 && this.basicAttacks[j].y - this.players[index].y >= -85) {
            this.basicAttackHits.push({
                type: this.basicAttacks[j].ownerElement,
                id: this.basicAttacks[j].id,
                victimId: this.players[index].id
            });

            this.playerHit(index, this.basicAttacks[j].dmg, this.basicAttacks[j].ownerId);

            this.basicAttacks.splice(j, 1);
            break;
        }
    }
}



Tracker.prototype.checkPlayerAOECollision = function(index){
    for (var j = this.AOEs.length - 1; j >= 0; --j) {
        // Break if player isn't alive
        if (!this.players[index])
            break;

        // Skip if AOE belongs to the player
        if (this.AOEs[j].id === this.players[index].id)
            continue;
            
        // Check collision
        var distance = Math.sqrt(Math.pow((this.players[index].x - this.AOEs[j].x), 2) + Math.pow((this.players[index].y - this.AOEs[j].y), 2));
        if (distance <= elements[this.AOEs[j].element].AOE.range) {
            this.playerHit(index, this.AOEs[j].dmg, this.AOEs[j].id);
        }      
    }
}


Tracker.prototype.checkPlayerSpecialCollision = function(index){
    for(var j = this.specials.length - 1; j >= 0; --j){
       this.specials[j].used = true;

        // Break if player isn't alive
        if (!this.players[index])
            break;

        // Skip if player has immunity
        if(this.players[index].buffs.immunity !== undefined)
            continue;

        // Skip if special belongs to the player
        if (this.specials[j].ownerId === this.players[index].id)
            continue;

        // Check collision
        var distance = Math.sqrt(Math.pow((this.players[index].x - this.specials[j].x), 2) + Math.pow((this.players[index].y - this.specials[j].y), 2));
        if(distance <= elements[this.specials[j].ownerElement].special.range){
            // if water element
            if(this.specials[j].ownerElement.indexOf('Water') !== -1){ 
                this.players[index].buffs.stun = Date.now() + elements[this.specials[j].ownerElement].special.duration;

                // cancel player pushback
                this.players[index].buffs.pushback = undefined;
            }

            // if air element
            if( this.specials[j].ownerElement.indexOf('Air') !== -1){ 
                // remove player's buffs
                for(var key in this.players[index].buffs){
                    if(this.players[index].buffs[key] !== undefined){
                        this.players[index].buffs[key] = undefined;
                    }
                }

                // remove player's AOE
                var spliceIndex = this.playerById(this.players[index].id, this.AOEs, 'index');
                if(spliceIndex !== false){
                    this.AOEs.splice(spliceIndex, 1);
                    this.splicedAOEs.push(this.players[index].id);
                }
            } else 
            /* if earth element */ { 
                this.players[index].buffs.pushback = Date.now() + elements[this.specials[j].ownerElement].special.duration;

                // Calculate speed 
                var speed = elements[this.specials[j].ownerElement].special.speed;

                var moves = distance / speed;
                var moveX = (this.players[index].x - this.specials[j].x) / moves;
                var moveY = (this.players[index].y - this.specials[j].y) / moves;

                this.players[index].moveX = moveX;
                this.players[index].moveY = moveY;   
            }
        }
    }
}







Tracker.prototype.checkPlayerHealthOrbCollision = function(index){
    for (var j = this.healthOrbs.length - 1; j >= 0; --j) {
        // Break if player isn't alive
        if (!this.players[index])
            break;

        if(this.players[index].buffs.immunity !== undefined) // cancel if player has immunity
            continue;

        if(!this.healthOrbs[j]){
            continue;
        }

        if (this.healthOrbs[j].x - this.players[index].x >= -20 && this.healthOrbs[j].x - this.players[index].x <= 20 && this.healthOrbs[j].y - this.players[index].y >= -40 && this.healthOrbs[j].y - this.players[index].y <= 40) {
            this.players[index].hp += this.healthOrbs[j].hp;

            var maxHp = this.calcMaxHp(this.players[index]);
            if (this.players[index].hp > maxHp)
                this.players[index].hp = maxHp;

            var id = this.healthOrbs[j].id;
            var spliceIndex = this.playerById(id, this.healthOrbs, 'index');
            if(spliceIndex === false)
                continue;

            this.takenOrbs.push(this.healthOrbs[spliceIndex].id);
            this.healthOrbs.splice(spliceIndex, 1);

            // splice all healthOrbs twins with this one
            spliceIndex = this.playerById(id, this.healthOrbs, 'index');
            while(spliceIndex !== false){
                this.healthOrbs.splice(spliceIndex, 1);
                spliceIndex = this.playerById(id, this.healthOrbs, 'index');
            }
        }
    }
}




Tracker.prototype.reducePlayerMana = function(player, key){
    player.mana -= elements[player.element][key].mana;
}

Tracker.prototype.cancelBuff = function(player, key){
    player.buffs[key] = undefined;
}





var tracker = new Tracker();


module.exports = tracker;