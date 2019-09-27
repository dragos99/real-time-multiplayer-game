"use strict";


var DOMSystem = function() {
	this.spells = ['basicAttack', 'AOE', 'buff', 'special'];
	this.scoreBoardState = false;
	this.oldWindowWidth = window.innerWidth;
	this.oldWindowHeight = window.innerHeight;

	// DOM elements
	this.minimapView = document.getElementById('minimapView');
	this.minimapCanvas = document.getElementById('minimapCanvas');
	this.$gameView = $('#gameView');
	this.$element = $('#element');
	this.$playBtn = $('#submit');
	this.spellbar = document.getElementById('spellbar');
	this.ability = document.getElementsByClassName('ability');
	this.hpStats = document.getElementById('hp');
	this.manaStats = document.getElementById('mana');
	this.draggables = document.getElementsByClassName('draggable');
	this.tooltipViews = document.getElementsByClassName('tooltipView');
	this.scoreBoard = document.getElementById('scoreBoard');

	this.dragging = false;
	this.dragPoint = {
	    x: 0,
	    y: 0,
	    bounds: {
	        top: 0,
	        left: 0
	    }
	}

	this.$username = $('#username');
	this.$container = $('#container');

	this.canvas = document.getElementById('mapCanvas');
	this.canvasWidthOffset = this.canvas.width / 2;
	this.canvasHeightOffset = this.canvas.width / 2;

}







/**
 * 
 * Init 
 * 
 */

DOMSystem.prototype.init = function() {
	DOM.$container.fadeIn();
	DOM.$username.focus();

	
	DOM.canvas.width = window.innerWidth;
	DOM.canvas.height = window.innerHeight;

	// Add drag event to draggable elements
	for (var i = 0; i < DOM.draggables.length; ++i) {
	    DOM.draggables[i].addEventListener('mousedown', function (e) {
	        DOM.dragging = true;
	        DOM.dragPoint.target =  DOM.getTargetElement(e.target);
	        var bounds = DOM.dragPoint.target.getBoundingClientRect();
	        DOM.dragPoint.x = e.pageX;
	        DOM.dragPoint.y = e.pageY;
	        DOM.dragPoint.bounds = bounds;
	    }, false);
	}

	// Add cancel drag event on mouseup
	window.addEventListener('mouseup', function () {
    	DOM.dragging = false;
	}, false);


	// Setup tooltips
	for (var i = 0; i < DOM.tooltipViews.length; ++i) {
	    DOM.tooltipViews[i].onmouseover = function (e) {
	        this.children[1].style.display = 'none';
	    }

	    DOM.tooltipViews[i].onmouseout = function (e) {
	        this.children[1].style.display = 'block';
	    }
	}

	// Play listener
	this.$playBtn.click(function (e) {
	    if (!gameState) initGame();
	});
}






/**
 * 
 * Start game
 * 
 */

DOMSystem.prototype.startGame = function() {
	$('#mapCanvas').remove();

    $('#gameView').append(DOM.canvas);
    ctx = DOM.canvas.getContext('2d');
    minimapCtx = DOM.minimapCanvas.getContext('2d');

    DOM.canvas.width = window.innerWidth;
    DOM.canvas.height = window.innerHeight;

    username = DOM.$username.val();
    element = DOM.$element.val();

    DOM.$container.fadeOut();
    DOM.$gameView.fadeIn();


    window.addEventListener('resize', DOM.resize, false);
    DOM.resize();
}





/**
 * 
 * Remove listeners
 * 
 */

DOMSystem.prototype.removeListeners = function(){
    removeEventListener('resize', DOM.resize);
}





/**
 * 
 * Setup viewport
 * 
 */
DOMSystem.prototype.setupViewport = function(){
	//DOM.draggables[1].style.borderColor = elements[me.element].color;
    //DOM.draggables[2].style.borderColor = elements[me.element].color;
    //DOM.draggables[3].style.borderColor = elements[me.element].color;
}




/**
 * 
 * Update viewport
 * 
 */
DOMSystem.prototype.updateViewPort = function() {
	sViewPortX = me.x - DOM.canvasWidthOffset * ratio;
    sViewPortY = me.y - DOM.canvasHeightOffset * ratio;
    eViewPortX = me.x + DOM.canvasWidthOffset * ratio;
    eViewPortY = me.y + DOM.canvasHeightOffset * ratio;
}





/**
 * 
 * Update stats
 * 
 */

DOMSystem.prototype.updateStats = function(player){
	// update stats
    DOM.hpStats.children[0].style.width = (player.hp * 100) / player.maxHp + '%';
    DOM.hpStats.children[1].innerHTML = player.hp.toFixed(0);
    DOM.hpStats.children[2].innerHTML = 'Hp: ' + player.hp.toFixed(0) + ' / ' + player.maxHp.toFixed(0);
    
    DOM.manaStats.children[0].style.width = player.mana + '%';
    DOM.manaStats.children[1].innerHTML = player.mana.toFixed(0);
    DOM.manaStats.children[2].innerHTML = 'Mana: ' + player.mana.toFixed(0) + ' / 100';
}






/**
 * 
 * Show scoreboard
 * 
 */

DOMSystem.prototype.showScoreBoard = function() {
    DOM.scoreBoardState = true;
    var scoreHTML = '<div class="title"><div class="element">Element</div><div class="username">Username</div><div class="kills">K</div><div class="assists">A</div><div class="deaths">D</div><div class="level">Level</div></div>';

    // sort serverPlayers array
    sort(serverPlayers, 'kills');

    for(i = 0; i < serverPlayers.length; ++i){
        var username = serverPlayers[i].username;
        var element = serverPlayers[i].element;
        var scoreLevel = playerById(serverPlayers[i].id).level;
        var rarityHTML = elements[element] ? elements[element].rarity : '';
        var classHTML = '';

        if(element === undefined){
            element = '-';
        } else {
            element = detectElement(serverPlayers[i].element);
        }

        if(username === undefined)
            username = ' - in lobby - ';

        if(scoreLevel === undefined)
            scoreLevel = '-';
        

        if(serverPlayers[i].dead === true)
            classHTML = 'dead';
        else 
            classHTML = 'alive';

        scoreHTML += '<div class="player '+ classHTML +'"><div class="element '+ rarityHTML +'">'+ element +'</div><div class="username">'+ username +'</div><div class="kills">'+ serverPlayers[i].kills +'</div><div class="assists">'+ serverPlayers[i].assists +'</div><div class="deaths">'+ serverPlayers[i].deaths +'</div><div class="level">'+ scoreLevel +'</div></div>';
    }

    DOM.scoreBoard.innerHTML = scoreHTML;
    DOM.scoreBoard.style.display = 'block';
}






/**
 * 
 * Hide scoreboard
 * 
 */

DOMSystem.prototype.hideScoreBoard = function() {
    DOM.scoreBoardState = false;
    DOM.scoreBoard.style.display = 'none';
}






/**
 * 
 * Show cooldowns
 * 
 */

DOMSystem.prototype.showCooldowns = function() {
	var cooldownLayer, ms;

    for (i = 0; i < 4; ++i) {
        if (me.cooldowns[DOM.spells[i]] !== undefined) { // if there is a cooldown
            if (DOM.ability[i].childNodes.length === 0) { // if there is no cooldown layer
                // append cooldown
                cooldownLayer = document.createElement('div');
                cooldownLayer.className = 'cooldownLayer';
                DOM.ability[i].appendChild(cooldownLayer);
            }

            // check cooldown expiration
            if (me.cooldowns[DOM.spells[i]] > Date.now()) { 
                ms = (me.cooldowns[DOM.spells[i]] - Date.now()) / 1000;
                DOM.ability[i].childNodes[0].innerHTML = ms.toFixed(1);
            } else {
                // remove cooldown layer
                DOM.ability[i].removeChild(DOM.ability[i].childNodes[0]);
            }
        } else {
            // remove cooldown layer
            if (DOM.ability[i].childNodes.length === 1) {
                DOM.ability[i].removeChild(DOM.ability[i].childNodes[0]);
            }
        }
    }
}





/**
 * 
 * Resize
 * 
 */

DOMSystem.prototype.resize = function() {
    DOM.canvas.width = window.innerWidth;
    DOM.canvas.height = window.innerHeight;
    DOM.canvasWidthOffset = DOM.canvas.width / 2;
    DOM.canvasHeightOffset = DOM.canvas.height / 2;

    var p = DOM.canvas.width;

    if (DOM.canvas.height > DOM.canvas.width)
        p = DOM.canvas.height;

    ratio = 1920 / p;

    if (ratio > 2)
     	ratio = 2;
    if (ratio < 1.45)              
        ratio = 1.45;

    playerWidth = cfg.PLAYER_WIDTH / ratio;
    playerHeight = cfg.PLAYER_HEIGHT / ratio;
          
    // Resize minimap
    minimapRadius = Math.pow(1.618, 7);

    DOM.minimapView.style.width = ((cfg.MAP_WIDTH / minimapRadius) / ratio) + 'px';
    DOM.minimapView.style.height = ((cfg.MAP_HEIGHT / minimapRadius) / ratio) + 'px';
    DOM.minimapCanvas.style.width = DOM.minimapView.style.width;
    DOM.minimapCanvas.style.height = DOM.minimapView.style.height;
    minimapRatio.x = cfg.MAP_WIDTH / DOM.minimapCanvas.width;
    minimapRatio.y = cfg.MAP_HEIGHT / DOM.minimapCanvas.height;


    DOM.position(DOM.minimapView);
    DOM.position(DOM.spellbar);
    DOM.position(DOM.hpStats.parentElement);
    
    DOM.oldWindowWidth = window.innerWidth;
    DOM.oldWindowHeight = window.innerHeight;

    // Reinitialize particle system
    if(particleSystem){
    	particleSystem.init();
    }
}





/**
 * 
 * Drag
 * 
 */

DOMSystem.prototype.drag = function(pageX, pageY) {
    var element = DOM.dragPoint.target;
    if (element.id === 'gameView' || element.id === 'mapCanvas')
        return;

    element.style.marginLeft = 0;
    element.style.marginRight = 0;
    var left = DOM.dragPoint.bounds.left + pageX - DOM.dragPoint.x
    var top = DOM.dragPoint.bounds.top + pageY - DOM.dragPoint.y;
    
    if (left + DOM.dragPoint.bounds.width  < DOM.canvas.width)
        element.style.left = left + 'px';
    if (left < 0)
        element.style.left = 0 + 'px';
    if (top + DOM.dragPoint.bounds.height < DOM.canvas.height)
        element.style.top = top + 'px';
    if (top < 0)
        element.style.top = 0 + 'px';
}




/**
 * 
 * Position
 * 
 */

DOMSystem.prototype.position = function(element) {

    var style = window.getComputedStyle(element);

    element.style.left = style.left.replace('px', '') / (DOM.oldWindowWidth / window.innerWidth) + 'px';
    element.style.top = style.top.replace('px', '') / (DOM.oldWindowHeight / window.innerHeight) + 'px';

    DOM.keepOnScreen(element);
}




/**
 * 
 * Keep on screen
 * 
 */

DOMSystem.prototype.keepOnScreen = function(element) {
    var left = parseInt(element.style.left.replace('px', '')) + parseInt(element.style.width.replace('px', ''));
    var top = parseInt(element.style.top.replace('px', '')) + parseInt(element.style.height.replace('px', ''));

    var calcLeft = parseInt(window.innerWidth - $('#' + element.id).width() - 20);
    var calcTop = parseInt(window.innerHeight - $('#' + element.id).height() - 20);

    if (left > window.innerWidth) {
        element.style.left = calcLeft + 'px';
    } else if (left < 0) {
        element.style.left = 0 + 'px';
    }

    if (top > window.innerHeight) {
        element.style.top = calcTop + 'px';
    } else if (top < 0) {
        element.style.top = 0 + 'px';
    }
}




/**
 * 
 * Get target element
 * 
 */


DOMSystem.prototype.getTargetElement = function(target){
    if (target.className.indexOf('draggable') !== -1) {
        return target;
    }
    return DOM.getTargetElement(target.parentElement);
}





/**
 * 
 * Get target element
 * 
 */

 DOMSystem.prototype.toggleChat = function(action){
	if(action === 'open'){ // open it
 		Chat.chatBox.style.backgroundColor = Chat.backgroundColor;
 		Chat.msgBox.style.backgroundColor = Chat.msgBoxBackgroundColor;
 		Chat.inputBox.style.opacity = 1;
 		Chat.inputBox.children[0].focus();
 		Chat.opened = true;
 		Chat.inputBox.children[0].value = '';

 		Chat.msgBox.style.overflow = 'auto';

 		// Remove 'closed' class from messages
 		for(var i = 0; i < Chat.msgBox.children.length; ++i){
 			Chat.msgBox.children[i].className = Chat.msgBox.children[i].className.replace('closed', '');
 		}

 		return;
 	}

 	if(action === 'close'){ // close it
 		Chat.chatBox.style.backgroundColor = 'transparent';
 		Chat.msgBox.style.backgroundColor = 'transparent';
 		Chat.inputBox.style.opacity = 0;
 		Chat.opened = false;

 		Chat.msgBox.style.overflow = 'hidden';

 		// Add 'closed' class to messages
 		for(var i = 0; i < Chat.msgBox.children.length; ++i){
 			Chat.msgBox.children[i].className = Chat.msgBox.children[i].className.replace('closed', '') + ' closed';
 		}

 		return;
 	} 
 }






 /**
 * 
 * New chat message
 * 
 */

 DOMSystem.prototype.newChatMessage = function(data){
 	
 	Chat.msgBox.insertAdjacentHTML('beforeend', data);

 	Chat.msgBox.scrollTop = Chat.msgBox.scrollHeight;
 }