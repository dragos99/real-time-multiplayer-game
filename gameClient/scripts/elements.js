"use strict";

(function (window) {

    var data = {
        'basicFireElement': { // ===================================================================================
            'startHp': 85,
            'speed': 7,
            'rarity': 'epic',
            'color': 'rgba(10, 106, 173, 0.5)',
            'basicAttack': {
                'name': 'Fireball',
                'mana': 7,
                'dmg': 9,
                'range': 1000,
                'duration': 500,
                'cooldown': 1 * 1000,
                'description': 'What about throwing away some fire?'
            },
            'AOE': {
                'name': 'FireNova',
                'mana': 20,
                'dmg': ((20 / 3) * (1000 / 60)) / 1000,
                'range': 850,
                'duration': 3 * 1000,
                'cooldown': 15 * 1000,
                'description': 'Tired of aiming? Just hit them all!'
            },
            'buff': {
                'name': 'Gasoline',
                'mana': 20,
                'effect': 0.3, // 30% more damage
                'duration': 5 * 1000,
                'cooldown': 20 * 1000,
                'description': 'Pump some fuel!'
            },
            'special': {
                'name': 'Stealth',
                'mana': 25,
                'effect': 'Invisibility',
                'duration': 7 * 1000,
                'cooldown': 45 * 1000,
                'description': 'Oops! I did it again!'
            }
        },
        'basicWaterElement': { // ===================================================================================
            'startHp': 95,
            'speed': 7,
            'rarity': 'epic',
            'color': '#314675',
            'basicAttack': {
                'name': 'Water Splash',
                'mana': 7,
                'dmg': 7,
                'range': 1000,
                'duration': 500,
                'cooldown': 0.8 * 1000,
                'description': 'Spill some water!'
            },
            'AOE': {
                'name': 'Ocean Waves',
                'mana': 20,
                'dmg': 15,
                'cooldown': 12 * 1000,
                'description': 'Drown them all!'
            },
            'buff': {
                'name': 'Healing wave',
                'mana': 20,
                'effect': 0.4, // instant gain 40% of damage taken as hp,
                'duration': 500, // animation duration
                'cooldown': 20 * 1000,
                'description': 'I don\'t want to die!'
            },
            'special': {
                'name': 'Water Block',
                'mana': 25,
                'effect': 'Stun all enemies',
                'range': 850,
                'duration': 2 * 1000,
                'cooldown': 45 * 1000,
                'description': 'Too much movment!'
            }
        },
        'basicAirElement': { // ===================================================================================
            'startHp': 100,
            'speed': 7,
            'rarity': 'epic',
            'color': '#BABABA',
            'basicAttack': {
                'name': 'Gale',
                'mana': 5,
                'dmg': 5,
                'range': 1000,
                'duration': 500,
                'cooldown': 0.5 * 1000,
                'description': 'Spill some water!'
            },
            'AOE': {
                'name': 'Tornado',
                'mana': 20,
                'dmg': ((20 / 5) * (1000 / 60)) / 1000,
                'range': 850,
                'duration': 5 * 1000,
                'cooldown': 16 * 1000,
                'description': 'Drown them all!'
            },
            'buff': {
                'name': 'Sprint',
                'mana': 20,
                'effect': 0.3, // 30% more speed,
                'duration': 5 * 1000,
                'cooldown': 20 * 1000,
                'description': 'I don\'t want to die!'
            },
            'special': {
                'name': 'Howling Hurricane',
                'mana': 25,
                'effect': 'Push back 1000 - distanta dintre playeri',
                'range': 850,
                'cooldown': 45 * 1000,
                'description': 'Too much movment!'
            }
        },
        'basicEarthElement': { // ===================================================================================
            'startHp': 110,
            'speed': 7,
            'rarity': 'epic',
            'color': 'rgb(92, 64, 50)',
            'basicAttack': {
                'name': 'Boulder',
                'mana': 9,
                'dmg': 10,
                'range': 1000,
                'duration': 500,
                'cooldown': 1.3 * 1000,
                'description': 'Spill some water!'
            },
            'AOE': {
                'name': 'Earth Quake',
                'mana': 20,
                'dmg': ((50 / 5) * (1000 / 60)) / 1000,
                'range': 550,
                'duration': 5 * 1000,
                'cooldown': 16 * 1000,
                'description': 'Drown them all!'
            },
            'buff': {
                'name': 'Asteroid Belt',
                'mana': 20,
                'effect': 0.3, // 30% damage reduction
                'duration': 5 * 1000,
                'cooldown': 20 * 1000,
                'description': 'I don\'t want to die!'
            },
            'special': {
                'name': 'PushBack',
                'mana': 25,
                'effect': 'push enemies back',
                'range': 850,
                'speed': 500 / (600 / 16.6),
                'duration': 0.6 * 1000,
                'cooldown': 45 * 1000,
                'description': 'Give me some space!'
            }
        }
    }


    if (typeof module === "object" && module && typeof module.exports === "object") {
        module.exports = data;
    } else {
        window.elements = data;
    }

}(this));