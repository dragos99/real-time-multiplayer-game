"use strict";

(function (window) {

    var folder = './animations';

    // Basic Fire Element ===============================================
    var basicFireElement = {
        'srcFolder': folder + '/basicFireElement',
        'rarityColor': '#A400A4',
        'elementImg': new Image(),
        'basicAttackImg': new Image(),
        'AOEImg': new Image(),
        'buffImg': new Image(),

        'AOEImgSize': 600,
        'buffImgSize': 256,
        'assign': function () {
            this.elementImg.src = this.srcFolder + '/element.png';
            this.basicAttackImg.src = this.srcFolder + '/basicAttack.png';
            this.AOEImg.src = this.srcFolder + '/AOE.png';
            this.buffImg.src = this.srcFolder + '/buff.png';
        }
    }
    basicFireElement.assign();


    // Basic Water Element ===============================================
    var basicWaterElement = {
        'srcFolder': folder + '/basicWaterElement',
        'rarityColor': '#A400A4',
        'elementImg': new Image(),
        'basicAttackImg': new Image(),
        'buffImg': new Image(),
        'specialImg': new Image(),

        'buffImgSize': 50,
        'specialImgSize': 700,
        'assign': function () {
            this.elementImg.src = this.srcFolder + '/element.png';
            this.basicAttackImg.src = this.srcFolder + '/basicAttack.png';
            this.buffImg.src = this.srcFolder + '/buff.png';
            this.specialImg.src = this.srcFolder + '/special.png';
        }
    }
    basicWaterElement.assign();


    // Basic Air Element ===============================================
    var basicAirElement = {
        'srcFolder': folder + '/basicAirElement',
        'rarityColor': '#A400A4',
        'elementImg': new Image(),
        'basicAttackImg': new Image(),
        'AOEImg': new Image(),
        'specialImg': new Image(),

        'AOEImgSize': 128,
        'specialImgSize': 400,
        'assign': function () {
            this.elementImg.src = this.srcFolder + '/element.png';
            this.basicAttackImg.src = this.srcFolder + '/basicAttack.png';
            this.AOEImg.src = this.srcFolder + '/AOE.png';
            this.specialImg.src = this.srcFolder + '/special.png';
        }
    }
    basicAirElement.assign();

    // Basic Earth Element ===============================================
    var basicEarthElement = {
        'srcFolder': folder + '/basicEarthElement',
        'rarityColor': '#A400A4',
        'elementImg': new Image(),
        'basicAttackImg': new Image(),
        'AOEImg': new Image(),
        'buffImg': new Image(),
        'specialImg': new Image(),

        'AOEImgSize': 400,
        'buffImgSize': 100,
        'specialImgSize': 256,
        'assign': function () {
            this.elementImg.src = this.srcFolder + '/element.png';
            this.basicAttackImg.src = this.srcFolder + '/basicAttack.png';
            this.AOEImg.src = this.srcFolder + '/AOE.png';
            this.buffImg.src = this.srcFolder + '/buff.png';
            this.specialImg.src = this.srcFolder + '/special.png';
        }
    }
    basicEarthElement.assign();


    // Globals ===============================================
    var healthOrbImg = new Image();
    healthOrbImg.src = folder + '/healthOrb.png';
    var immunityAuraImg = new Image();
    immunityAuraImg.src = folder + '/immunityAura.png';


    var hitBuffs = {
        'Fire': {
            'img': new Image(),
            'size': 128
        },
        'Water': {
            'img': new Image(),
            'size': 128
        },
        'Air': {
            'img': new Image(),
            'size': 128
        },
        'Earth': {
            'img': new Image(),
            'size': 128
        },
        'assign': function(){
            this.Fire.img.src = folder + '/hitBuffs/fireHit.png';
            this.Water.img.src = folder + '/hitBuffs/waterHit.png';
            this.Air.img.src = folder + '/hitBuffs/airHit.png';
            this.Earth.img.src = folder + '/hitBuffs/earthHit.png';
        }
    }
    hitBuffs.assign();

    // Background image
    var bck = new Image();
    bck.src = 'img/bck.jpg';

    // Export animations ===============================================
    window.animations = {
        'basicFireElement': basicFireElement,
        'basicWaterElement': basicWaterElement,
        'basicAirElement': basicAirElement,
        'basicEarthElement': basicEarthElement,
        'healthOrb': healthOrbImg,
        'immunityAura': immunityAuraImg,
        'hitBuffs': hitBuffs,
        'bck': bck
    }



}(this));
