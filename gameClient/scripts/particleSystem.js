"use strict";

(function (window) {


    var particleSystem = function(main, maxAmount, particleSize, baseSpeedX, baseSpeedY){
        this.maxAmount = maxAmount;
        this.particleSize = particleSize;
        this.baseSpeedX = baseSpeedX;
        this.baseSpeedY = baseSpeedY;

        this.particles = [];

        this.me = main.me;
        this.ctx = main.ctx;
    }

    particleSystem.prototype.addParticle = function(x, y){
        var opacity = (Math.random() * 1.1) + 0.4;

        var speedX = this.baseSpeedX * opacity;
        var speedY = this.baseSpeedY * opacity;

        var newParticle = {
            x: x,
            y: y,
            speedX: speedX,
            speedY: speedY,
            opacity: opacity,
            color: '#fff',
            size: this.particleSize
        }

        this.particles.push(newParticle);
    }

    particleSystem.prototype.init = function(){
        var x, y, opacity, speedX, speedY, newParticle;
        this.particles.length = 0;

        while(this.particles.length < this.maxAmount){
            x = (Math.random() * window.innerWidth);
            y = (Math.random() * window.innerHeight);
            opacity = (Math.random() * 1) + 0.4;

            speedX = this.baseSpeedX * opacity;
            speedY = this.baseSpeedY * opacity;

            newParticle = {
                x: x,
                y: y,
                speedX: speedX,
                speedY: speedY,
                opacity: opacity,
                color: '#fff',
                size: this.particleSize
            }

            this.particles.push(newParticle);
        }
    };

    particleSystem.prototype.update = function(){
        var i, particles, x, y;
        var particles = this.particles;

        for(i = particles.length - 1; i >= 0; --i){
            // Splice particles if out of view and create new ones
            if(!(particles[i].x >= 0 && particles[i].x <= window.innerWidth && particles[i].y >= 0 && particles[i].y <= window.innerHeight)){
                x = particles[i].x;
                if(particles[i].x < 0)
                    x = window.innerWidth - 1;
                else if(particles[i].x > window.innerWidth)
                    x = 1;

                y = particles[i].y;
                if(particles[i].y <0)
                    y = window.innerHeight - 1;
                else if(particles[i].y > window.innerHeight)
                    y = 1;

                particles.splice(i, 1);

                this.addParticle(x, y);
            }

            // Update particle
            particles[i].speedX = (-this.me.moveX * particles[i].opacity) / 1.1;
            particles[i].speedY = (-this.me.moveY * particles[i].opacity) / 1.1;


            if(this.me.moving === false) {
                particles[i].speedX = this.baseSpeedX * particles[i].opacity;
                particles[i].speedY = this.baseSpeedY * particles[i].opacity;
            }

            particles[i].x += particles[i].speedX;
            particles[i].y += particles[i].speedY;
        }
    }

    particleSystem.prototype.drawParticles = function(){
        var drawX, drawY;
        var particles = this.particles;
        var i;

        for(i = 0; i < particles.length; ++i){
            this.ctx.beginPath();

            drawX = particles[i].x;
            drawY = particles[i].y;

            this.ctx.arc(drawX, drawY, particles[i].size, 0, 2 * Math.PI, false);

            this.ctx.fillStyle = 'rgba(255, 255, 255, '+ particles[i].opacity +')';
            this.ctx.fill();
        }

    }

    window.ParticleSystem = particleSystem;

}(this));