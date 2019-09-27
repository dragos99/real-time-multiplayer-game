"use strict";

var InputSystem = function(){
	this.parentOffset = undefined;
	this.loadingAOE = false;
	this.change = true;
}

InputSystem.prototype.setupListeners = function(){
	window.addEventListener('mousemove', Input.mouseMove, false);
	window.addEventListener('mousedown', Input.mouseDown, false);
    window.addEventListener('keydown', Input.keyDown, false);
    window.addEventListener('keyup', Input.keyUp, false);
}


InputSystem.prototype.removeListeners = function(){
	removeEventListener('mousemove', Input.mouseMove);
	removeEventListener('mousedown', Input.mouseDown);
    removeEventListener('keydown', Input.keyDown);
    removeEventListener('keyup', Input.keyUp);
}





/**
 * 
 * Mouse move
 * 
 */

InputSystem.prototype.mouseMove = function(e){
	if (Input.change === true) {
        lastXMousePos = xMousePos;
        lastYMousePos = yMousePos;
    }

    this.parentOffset = $('#mapCanvas').offset();

    xMousePos = e.pageX - this.parentOffset.left;
    yMousePos = e.pageY - this.parentOffset.top;

    if (DOM.dragging)
        DOM.drag(e.pageX, e.pageY);
}




/**
 * 
 * Mouse down
 * 
 */

InputSystem.prototype.mouseDown = function(e){
	if(e.target.id === 'mapCanvas' && Chat.opened === true)
		DOM.toggleChat('close');

	if (Input.loadingAOE === true) {
        Input.loadingAOE = false;

        Input.activateAOE(e.clientX, e.clientY);
        return;
    }
}






/**
 * 
 * Key down
 * 
 */

InputSystem.prototype.keyDown = function(e){
	var key = e.keyCode;

    if (key === 9) { // TAB
        e.preventDefault();
        if(DOM.scoreBoardState === false)
            DOM.showScoreBoard();
        return;
    }

    if (key === 81) { // Q
        Input.newBasicAttack();

        return;
    }

    if (key === 87) { // W
    	// Cancel if chat is opened
    	if(Chat.opened === true)
    		return;

        if (me.element.indexOf('Earth') !== -1) {
            if (Input.loadingAOE === false)
                Input.loadingAOE = true;
            else
                Input.loadingAOE = false;

            return;
        }

        Input.activateAOE();

        return;
    }

    if (key === 69) { // E
    	// Cancel if chat is opened
    	if(Chat.opened === true)
    		return;

        Input.activateBuff();

        return;
    }

    if (key === 82) { // R
    	// Cancel if chat is opened
    	if(Chat.opened === true)
    		return;

    	Input.activateSpecial();

    	return;
    }

    if (key === 32) { // SPACE
    	// Cancel if chat is opened
    	if(Chat.opened === true)
    		return;

        if (me.moving === false)
            return;

        me.moving = false;
        Socket.socket.emit('moving', { moving: false });

        return;
    }

    if (key === 16) { // SHIFT
        Input.change = false;

        return;
    }

    if (key === 89) { // Y
    	// Cancel if chat is opened
    	if(Chat.opened === true)
    		return;

    	e.preventDefault();
    	DOM.toggleChat('open');

    	return;
    }

    if (key === 13) { // ENTER
    	e.preventDefault();
    	if(document.activeElement.id === 'input_field'){
    		Chat.sendMessage();
    	}

    	return;
    }

    if (key === 27) { // ESC
    	// Close chat if opened
    	if(Chat.opened === true){
    		DOM.toggleChat('close');

    		return;
    	}
    	
    	return;
    }
}






/**
 * 
 * Key up
 * 
 */

InputSystem.prototype.keyUp = function(e){
	var key = e.keyCode;

    // tab
    if(key === 9){
        e.preventDefault();
        DOM.hideScoreBoard();
        return;
    }

    // space
    if (key === 32) {
    	// Cancel if chat is opened
    	if(Chat.opened === true)
    		return;

        if (me.moving === true)
            return false;
        me.moving = true;
        Socket.socket.emit('moving', { moving: true });
        return;
    }

    // shift
    if (key === 16){
        Input.change = true;

        return;
    }
}




/**
 * 
 * Emit new basic attack
 * 
 */

InputSystem.prototype.newBasicAttack = function(){
	// Cancel if cooldown or immunity
    if (me.cooldowns.basicAttack !== undefined || me.buffs.immunity.value === true)
        return;

    var difX = xMousePos - DOM.canvasWidthOffset;
    var difY = yMousePos - DOM.canvasHeightOffset;
    var distance = Math.sqrt(difX * difX + difY * difY);

    var moveX = difX / distance;
    var moveY = difY / distance;

    Socket.emitNewBasicAttack(moveX, moveY);
}




/**
 * 
 * Activate AOE
 * 
 */

InputSystem.prototype.activateAOE = function(posX, posY){
	// Cancel if cooldown or immunity
    if (me.cooldowns.AOE !== undefined || me.buffs.immunity.value === true)
        return;

    if (posX && posY) {
        var x = sViewPortX + posX * ratio;
        var y = sViewPortY + posY * ratio;

        Socket.socket.emit('newAOE', { x: x, y: y });
        return;
    }

    Socket.socket.emit('newAOE');
}





/**
 * 
 * Activate buff
 * 
 */

InputSystem.prototype.activateBuff = function(){
	// Cancel if cooldown or immunity
    if (me.cooldowns.buff !== undefined || me.buffs.immunity.value === true)
        return;

    Socket.socket.emit('newBuff');
}





/**
 * 
 * Activate Special
 * 
 */

InputSystem.prototype.activateSpecial = function(){
	// Cancel if cooldown or immunity
	if(me.cooldowns.special !== undefined || me.buffs.immunity.value === true)
		return;

	Socket.socket.emit('newSpecial');
}