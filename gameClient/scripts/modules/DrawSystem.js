"use strict";


var maxHp;
var basicAttackImg;
var aoeSize, x, y, range;
var buffSize, specialSize;;

var drawX, drawY;




/**
 * 
 * Draw player
 * 
 */

var posX, posY, username, userLength;

function drawPlayer(remotePlayer) {
    posX = (remotePlayer.x - drawAnchor.x) / ratio + DOM.canvas.width / 2;
    posY = (remotePlayer.y - drawAnchor.y) / ratio + DOM.canvas.height / 2;

    username = remotePlayer.username;
    userLength = username.length;


    if (remotePlayer.x + playerWidth / 2 >= sViewPortX && remotePlayer.x - playerWidth / 2 <= eViewPortX && remotePlayer.y + playerHeight / 2 >= sViewPortY && remotePlayer.y - playerWidth / 2 <= eViewPortY) {
        if(remotePlayer.buffs.invisibility !== undefined){
            if(remotePlayer.id === me.id)
                ctx.globalAlpha = 0.4;
            else
                ctx.globalAlpha = 0;
        }

        // Draw player's buff
        drawPlayerBuff(remotePlayer, posX, posY);

        // Draw player
    	ctx.drawImage(animations[remotePlayer.element].elementImg, Math.floor(remotePlayer.frame) * 100, 0, 100, 150, posX - playerWidth / 2, posY - playerHeight / 2, playerWidth, playerHeight);

        // Draw username
        drawPlayerUsername(remotePlayer, posX, posY);

        // Draw health bar
        drawPlayerHealthBar(remotePlayer, posX, posY);

        // Draw player's hit buff
        drawPlayerHitBuff(remotePlayer, posX, posY);

        // Draw immunity aura
        drawPlayerImmunity(remotePlayer, posX, posY);

        if(remotePlayer.buffs.invisibility !== undefined)
            ctx.globalAlpha = 1;
    }

    // Draw player on minimap
    drawPlayerOnMinimap(remotePlayer);


}









/**
 * 
 * Draw player on minimap
 * 
 */

function drawPlayerOnMinimap(remotePlayer) {
    // Cancel if player has invisibility and it's not me
    if(remotePlayer.id !== me.id && remotePlayer.buffs.invisibility !== undefined)
        return;

    drawX = remotePlayer.x / minimapRatio.x;
    drawY = remotePlayer.y / minimapRatio.y;

    fillStyle = '#ff0000';

    if (remotePlayer.id === me.id)
        fillStyle = '#00ff00';
 
    minimapCtx.beginPath();
    minimapCtx.arc(drawX, drawY, 2.5 / ratio, 0, 2 * Math.PI);
    minimapCtx.fillStyle = fillStyle;
    minimapCtx.fill();

    // Draw viewport quadran around myself
    if(remotePlayer.id === me.id){
	    drawX = (remotePlayer.x / minimapRatio.x) - ((eViewPortX - sViewPortX) / minimapRatio.x) / 2;
	    drawY = (remotePlayer.y / minimapRatio.y) - ((eViewPortY - sViewPortY) / minimapRatio.y) / 2;

	    minimapCtx.rect(drawX, drawY, (eViewPortX - sViewPortX) / minimapRatio.x, (eViewPortY - sViewPortY) / minimapRatio.y);

	    minimapCtx.lineWidth="0.5";
		minimapCtx.strokeStyle="#ffffff";
	    minimapCtx.stroke();
	}
}








/**
 * 
 * Draw basic attacks
 * 
 */
function drawBasicAttacks() {
    for (i = basicAttacks.length - 1; i >= 0; --i) {
        drawX = (basicAttacks[i].x - drawAnchor.x) / ratio + DOM.canvas.width / 2;
        drawY = (basicAttacks[i].y - drawAnchor.y) / ratio + DOM.canvas.height / 2;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(-(basicAttacks[i].angle * Math.PI / 180));
        ctx.drawImage(animations[basicAttacks[i].ownerElement].basicAttackImg, 610 * basicAttacks[i].frame, 0, 610, 40, 0, -20 / ratio, elements[basicAttacks[i].ownerElement].basicAttack.range / ratio, 40 / ratio);
        ctx.restore();

        basicAttacks[i].frame += 1;

        if (basicAttacks[i].frame > 32) {
            basicAttacks.splice(i, 1);
        }
    }
}







/**
 * 
 * Draw AOEs
 * 
 */
function drawAOEs() {
    for (i = AOEs.length - 1; i >= 0; --i) {
        owner = playerById(AOEs[i].id);

        // cancel if owner is dead and element is not earth
        if (!owner && AOEs[i].element.indexOf('Earth') === -1) {
            AOEs.splice(i, 1);
            continue;
        }

        range = elements[AOEs[i].element].AOE.range;

        // determine AOE pos
        if (AOEs[i].element.indexOf('Earth') !== -1) {
            x = AOEs[i].x;
            y = AOEs[i].y;
        } else {
            x = owner.x;
            y = owner.y;
        }

        // check if it's inside the viewport
        if (!(x >= sViewPortX - range && x <= eViewPortX + range && y >= sViewPortY - range && y <= eViewPortY + range))
            continue;

        // Draw AOE
        drawX = (x - drawAnchor.x) / ratio + DOM.canvas.width / 2;
        drawY = (y - drawAnchor.y) / ratio + DOM.canvas.height / 2;
        aoeSize = animations[AOEs[i].element].AOEImgSize;

        ctx.drawImage(animations[AOEs[i].element].AOEImg, aoeSize * AOEs[i].frame, 0, aoeSize, aoeSize, drawX - range / ratio, drawY - range / ratio, range * 2 / ratio, range * 2 / ratio);

        // update frame and check expiry
        AOEs[i].frame++;
        if (AOEs[i].frame >= 30)
            AOEs[i].frame = 0;
        if (AOEs[i].expireDate <= Date.now())
            AOEs.splice(i, 1);

    }
}






/**
 * 
 * Draw specials
 * 
 */

function drawSpecials(){
	for(i = specials.length - 1; i >= 0; --i){
		range = elements[specials[i].ownerElement].special.range;

        // determine special pos
        x = specials[i].x;
        y = specials[i].y;
 
        // check if it's inside the viewport
        if (!(x >= sViewPortX - range && x <= eViewPortX + range && y >= sViewPortY - range && y <= eViewPortY + range))
            continue;

        // Draw special
        drawX = (x - drawAnchor.x) / ratio + DOM.canvas.width / 2;
        drawY = (y - drawAnchor.y) / ratio + DOM.canvas.height / 2;
        specialSize = animations[specials[i].ownerElement].specialImgSize;

        ctx.drawImage(animations[specials[i].ownerElement].specialImg, specialSize * specials[i].frame, 0, specialSize, specialSize, drawX - range / ratio, drawY - range / ratio, range * 2 / ratio, range * 2 / ratio);

        // update frame and check expiry
        specials[i].frame++;
        if (specials[i].frame >= 30)
            specials.splice(i, 1);
    }
}






/**
 * 
 * Draw player buff
 * 
 */
function drawPlayerBuff(remotePlayer, drawX, drawY) {
    // Cancel if no buff or air element
    if (remotePlayer.buffs.buff === undefined || remotePlayer.element.indexOf('Air') !== -1)
        return;

    buffSize = animations[remotePlayer.element].buffImgSize;

    // Draw buff
    ctx.drawImage(animations[remotePlayer.element].buffImg, buffSize * remotePlayer.buffs.buff, 0, buffSize, buffSize, drawX - 125 / ratio, drawY - 125 / ratio, 250 / ratio, 250 / ratio);

    remotePlayer.buffs.buff++;
    if (remotePlayer.buffs.buff >= 30)
        remotePlayer.buffs.buff = 0;
}







/**
 * 
 * Draw player hit buff
 * 
 */
function drawPlayerHitBuff(remotePlayer, drawX, drawY){
    // Cancel if no hit buff
    if(remotePlayer.buffs.hit.type === undefined)
        return;

    element = remotePlayer.buffs.hit.type;

    buffSize = animations['hitBuffs'][element].size;

    // Draw hit buff
    ctx.drawImage(animations['hitBuffs'][element].img, buffSize * remotePlayer.buffs.hit.frame, 0, buffSize, buffSize, drawX - 125 / ratio, drawY - 125 / ratio, 250 / ratio, 250 / ratio);

    remotePlayer.buffs.hit.frame++;
    if (remotePlayer.buffs.hit.frame >= 30)
        remotePlayer.buffs.hit.type = undefined;
}






/**
 * 
 * Draw player immunity
 * 
 */
function drawPlayerImmunity(remotePlayer, drawX, drawY) {
    if (remotePlayer.buffs.immunity.value === false)
        return;

    // Draw immunity
    ctx.drawImage(animations['immunityAura'], 128 * remotePlayer.buffs.immunity.frame, 0, 128, 128, drawX - 125 / ratio, drawY - 115 / ratio, 250 / ratio, 250 / ratio);

    remotePlayer.buffs.immunity.frame++;
    if (remotePlayer.buffs.immunity.frame >= 30)
        remotePlayer.buffs.immunity.frame = 0;
}










/**
 * 
 * Draw health orbs
 * 
 */

function drawHealthOrbs() {
    for (i = healthOrbs.length - 1; i >= 0; --i) {
        if (!(healthOrbs[i].x >= sViewPortX - 60 && healthOrbs[i].x <= eViewPortX + 60 && healthOrbs[i].y >= sViewPortY - 60 && healthOrbs[i].y <= eViewPortY + 60)) {
            continue;
        }

        drawX = (healthOrbs[i].x - drawAnchor.x) / ratio + DOM.canvas.width / 2;
        drawY = (healthOrbs[i].y - drawAnchor.y) / ratio + DOM.canvas.height / 2;

        ctx.drawImage(animations['healthOrb'], 60 * healthOrbs[i].frame, 0, 60, 60, drawX - 30 / ratio, drawY - 30 / ratio, 60 / ratio, 60 / ratio);

        healthOrbs[i].frame++;
        if (healthOrbs[i].frame >= 60)
            healthOrbs[i].frame = 0;
    }
}











/**
 * 
 * Draw player health bar
 * 
 */

var width, height;
function drawPlayerHealthBar(remotePlayer, drawX, drawY){
    if(remotePlayer.id === me.id){
        // Draw mana bar
        width = remotePlayer.mana / ratio;
        height = 7 / ratio;
        x = drawX - (playerWidth / 2) + (playerWidth - (100 / ratio)) / 2;
        y = drawY - (playerHeight / 2) + (10 / ratio);

        ctx.fillStyle = '#1092C4';
        ctx.roundRect(x, y, width, height);
        ctx.fill();

    }

    maxHp = remotePlayer.maxHp;
    width = (remotePlayer.hp * 100 / maxHp) / ratio;
    height = 7 / ratio;
    x = drawX - (playerWidth / 2) + (playerWidth - (100 / ratio)) / 2;
    y = drawY - (playerHeight / 2) + (10 / ratio);

    if(remotePlayer.id === me.id)
        y -= 10 / ratio;

    // Draw health bar
    ctx.fillStyle = '#09D647';
    ctx.roundRect(x, y, width, height);
    ctx.fill();
}








/**
 * 
 * Draw player username
 * 
 */

function drawPlayerUsername(remotePlayer, drawX, drawY){
    // Draw username
    ctx.textAlign = 'center';
    ctx.font = 28 / ratio + 'px Open Sans';
    ctx.fillStyle = '#ffffff';

    x = drawX;
    y = drawY + (playerHeight / 2) + (15 / ratio);

    ctx.fillText(remotePlayer.username, x, y);
}









/**
 * 
 * Draw grid
 * 
 */

var sx, sy, sWidth, sHeight;
function drawGrid() {
    sx = sViewPortX / 4.5;
    sy = sViewPortY / 4.5;
    sWidth = DOM.canvas.width;
    sHeight = DOM.canvas.height;
    x = 0;
    y = 0;

   ctx.drawImage(animations['bck'], sx, sy, sWidth, sHeight, x, y, sWidth, sHeight);


    /*for (x = 0; x <= cfg.MAP_WIDTH; x += 66) {
        if (x > eViewPortX)
            break;
        if (x >= sViewPortX) {
            ctx.moveTo((x - drawAnchor.x) / ratio + DOM.canvas.width / 2, (0 - drawAnchor.y) / ratio + DOM.canvas.height / 2);
            ctx.lineTo((x - drawAnchor.x) / ratio + DOM.canvas.width / 2, (cfg.MAP_HEIGHT - drawAnchor.y) / ratio + DOM.canvas.height / 2);
        }
    }

    for (x = 0; x <= cfg.MAP_HEIGHT; x += 66) {
        if (x > eViewPortY)
            break;
        if (x >= sViewPortY) {
            ctx.moveTo((0 - drawAnchor.x) / ratio + DOM.canvas.width / 2, (x - drawAnchor.y) / ratio + DOM.canvas.height / 2);
            ctx.lineTo((cfg.MAP_WIDTH - drawAnchor.x) / ratio + DOM.canvas.width / 2, (x - drawAnchor.y) / ratio + DOM.canvas.height / 2);
        }
    }

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "rgb(5, 5, 5)";
    ctx.stroke();*/
}











/**
 * 
 * Load images
 * 
 */

function loadImages() {

    ctx.drawImage(animations['basicFireElement'].elementImg, 0, 0);
    ctx.drawImage(animations['basicFireElement'].basicAttackImg, 0, 0);
    ctx.drawImage(animations['basicFireElement'].AOEImg, 0, 0);
    ctx.drawImage(animations['basicFireElement'].buffImg, 0, 0);

    ctx.drawImage(animations['basicWaterElement'].elementImg, 0, 0);
    ctx.drawImage(animations['basicWaterElement'].basicAttackImg, 0, 0);
    ctx.drawImage(animations['basicWaterElement'].buffImg, 0, 0);
    ctx.drawImage(animations['basicWaterElement'].specialImg, 0, 0);

    ctx.drawImage(animations['basicAirElement'].elementImg, 0, 0);
    ctx.drawImage(animations['basicAirElement'].basicAttackImg, 0, 0);
    ctx.drawImage(animations['basicAirElement'].AOEImg, 0, 0);
    ctx.drawImage(animations['basicAirElement'].specialImg, 0, 0);

    ctx.drawImage(animations['basicEarthElement'].elementImg, 0, 0);
    ctx.drawImage(animations['basicEarthElement'].basicAttackImg, 0, 0);
    ctx.drawImage(animations['basicEarthElement'].AOEImg, 0, 0);
    ctx.drawImage(animations['basicEarthElement'].buffImg, 0, 0);
    ctx.drawImage(animations['basicEarthElement'].specialImg, 0, 0);

    ctx.drawImage(animations['immunityAura'], 0, 0);
    ctx.drawImage(animations['healthOrb'], 0, 0);

    ctx.drawImage(animations['hitBuffs'].Fire.img, 0, 0);
    ctx.drawImage(animations['hitBuffs'].Water.img, 0, 0);
    ctx.drawImage(animations['hitBuffs'].Air.img, 0, 0);
    ctx.drawImage(animations['hitBuffs'].Earth.img, 0, 0);
}







/**
 * 
 * Draw rounded rectangle
 * 
 */

CanvasRenderingContext2D.prototype.roundRect = 
function(x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = false;
  }
  if (typeof radius === "undefined") {
    radius = 3;
  }
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
  if (stroke) {
    this.stroke();
  }
  if (fill) {
    this.fill();
  }        
}