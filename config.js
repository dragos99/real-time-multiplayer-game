(function (window) {


    var data = {
        // SERVER
        "PORT": process.env.PORT || 80, 									// set the port the server is listening to; default is 5555

        // MAP
        "MAP_WIDTH": 10000,								// map width; default is 10000
        "MAP_HEIGHT": 6180,							// map height; default is 10000

        // PLAYER
        "PLAYER_WIDTH": 127,							// player width; default is 100
        "PLAYER_HEIGHT": 190,							// player height; default is 190
        "PLAYER_START_MANA": 100,						// player starting mana; default is 100
        "PLAYER_SPEED": 4,								// player speed; default is 4
        "PLAYER_START_LEVEL": 1,						// player starting level; default is 1
        "PLAYER_EVOLVE_RATE": 1.3,						// player evolve rate; default is 1.3
        "IMMUNITY_TIME": 3000,
        "PLAYERS_SPEED": 6,
        "PLAYER_KEEP_ALIVE": 25000
    }

    if (typeof module === "object" && module && typeof module.exports === "object") {
        module.exports = data;
    } else {
        window.cfg = data;
    }

}(this));