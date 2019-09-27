"use strict";


// Arrays / Objects
var players, serverPlayers;
var basicAttacks, healthOrbs, AOEs, specials;


// Utils
var i, j, f, spliceIndex;
var delta, now, then, lastUpdate, previousLastUpdate;
var moving, gameState = false;
var ratio;
var fillStyle;
var minimapRadius;
var minimapRatio = {
    x: 0,
    y: 0
};


// Player
var player, me, owner, username, element;
var sViewPortX, sViewPortY, eViewPortX, eViewPortY;
var xMousePos, yMousePos, lastXMousePos, lastYMousePos;
var playerWidth = cfg.PLAYER_WIDTH;
var playerHeight = cfg.PLAYER_HEIGHT;
var drawAnchor;



var DOM = new DOMSystem();
DOM.init();

var Socket = new SocketSystem();
Socket.init();

var Input = new InputSystem();

var Chat = new ChatSystem();

var ctx = DOM.canvas.getContext('2d');
var minimapCtx = DOM.minimapCanvas.getContext('2d');

var particleSystem, deathSystem;



/**
 * 
 * Start game
 * 
 */

function initGame() {
    gameState = true;

    DOM.startGame();

    loadImages();

    ratio = ratio || 1;
    moving = true;
    players = [];
    basicAttacks = [];
    healthOrbs = [];
    AOEs = [];
    serverPlayers = [];
    specials = [];

    Socket.startGame();
}








/**
 * 
 * Main loop
 * 
 */

function mainloop() {
    if (gameState === true)
        window.requestAnimationFrame(mainloop);

    now = Date.now();
    if (!then) then = Date.now();
    delta = now - then;
    then = now;

    update();

    DOM.updateViewPort();

    draw();

    DOM.showCooldowns();

    if(DOM.scoreBoardState === true)
        DOM.showScoreBoard();
}

function draw() {

    ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    minimapCtx.clearRect(0, 0, DOM.minimapCanvas.width, DOM.minimapCanvas.height);
    ctx.beginPath();

    drawGrid();
    particleSystem.drawParticles();
    drawAOEs();
    drawSpecials();
    drawHealthOrbs();
    drawBasicAttacks();

    // Draw players
    for (i = players.length - 1; i >= 0; --i)
        drawPlayer(players[i]);
}

function update() {
    for (i = 0; i < players.length; ++i)
        updatePlayers(players[i]);

    particleSystem.update();
    deathSystem.removeDeathNotices();
}
















/**
#################################################################################################################################
#################################################################################################################################
#################################################################################################################################
#################################################################################################################################
#################################################################################################################################
*/





/**
 * 
 * Update functions
 * 
 */
var t1, t2, total, renderTime, portion, perc, interpX, interpY;

function updatePlayers(remotePlayer) {
    t1 = previousLastUpdate;
    t2 = lastUpdate;

    total = t2 - t1;
    renderTime = Date.now() - 50;


    remotePlayer.frame++;
    if (remotePlayer.frame >= 30)
        remotePlayer.frame = 0;;

    if (renderTime >= t1 && renderTime <= t2) {
        portion = renderTime - t1;


        perc = portion / total;


        interpX = lerp(remotePlayer.startX, remotePlayer.targetX, perc);
        interpY = lerp(remotePlayer.startY, remotePlayer.targetY, perc);

        remotePlayer.x = interpX;
        remotePlayer.y = interpY;
    }

}












/**
#################################################################################################################################
#################################################################################################################################
#################################################################################################################################
#################################################################################################################################
#################################################################################################################################
*/

/**
 * 
 * Auxiliary functions
 * 
 */



function gameOver() {
    gameState = false;

    DOM.$container.show();
    DOM.$gameView.hide();

    // Remove listeners
    Socket.removeListeners();
    Input.removeListeners();
    DOM.removeListeners();
}


function detectElement(element){
    if(element.indexOf('Fire') !== -1)
        return 'Fire';
    
    if(element.indexOf('Water') !== -1)
        return 'Water';
    
    if(element.indexOf('Air') !== -1)
        return 'Air';

    return 'Earth';
}



function calcMaxHp(remotePlayer) {
    return (elements[remotePlayer.element].startHp * remotePlayer.level);
}

function lerp(from, to, t) {
    return from + t * (to - from);
}

function sort(array, key){
    array.sort(function(a, b){
        return b[key] - a[key];
    });
}




// Get player by ID
function playerById(id, array, request) {
    array = array || players; // default is players
    request = request || 'player'; // default is player
    
    for (f = 0; f < array.length; ++f) {
        if (array[f].id === id) {
            if (request === 'player')
                return array[f];
            return f;
        }
    }
    return false;
}


