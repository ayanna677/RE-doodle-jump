class Game {
    constructor() {
        this.score = 0;
        this.isRunning = false;
        this.timeline = gsap.timeline({ smoothChildTiming: true });
        this.time = 1.6;
        this.colors = ["#FF4571", "#FFD145", "#8260F6"];
        this.color = this.colors[0];
        this.prevColor = null;
        this.calculateScale();
    }

    calculateScale() {
        this.screen = $(window).width();
        this.screenHeight = $(window).height();
        this.scale = (this.screen > this.screenHeight) ? this.screenHeight / 800 : this.screen / 1200;
        this.stickWidth = 180 * this.scale;
        this.steps = this.screen / this.stickWidth;
    }

    generateSticks() {
        let numberOfSticks = Math.ceil(this.steps);
        for (let i = 0; i <= numberOfSticks; i++) {
            new Stick();
        }
    }

    generateBall() {
        this.balltween = gsap.timeline({ repeat: -1, paused: true });
        $('.scene .ball-holder').append('<div class="ball red" id="ball"></div>');
        this.bounce();
    }

    start() {
        this.stop();
        $('.start-game, .stop-game').hide();
        $('.nominee').hide();
        this.score = 0;
        this.isRunning = true;
        $('#sticks, .scene .ball-holder').html('');
        $('#score').text(this.score);
        this.generateSticks();
        this.generateBall();
        this.moveToStart();
        this.moveScene();
        this.timeline.timeScale(1);
        this.balltween.timeScale(1);
    }

    stop() {
        this.isRunning = false;
        $('#sticks, .scene .ball-holder, #score').html('');
        gsap.killTweensOf("*");
        this.showResult();
    }

    showResult() {
        $('.stop-game').show();
        $('.stop-game .final-score').text(this.score + '!');
        $('.stop-game .result').text(this.showGrade(this.score));
        $('.nominee').show();
    }

    showGrade(score) {
        if (score > 30) return "Chuck Norris?";
        if (score > 25) return "You're da man";
        if (score > 20) return "Awesome";
        if (score > 15) return "Great!";
        if (score > 13) return "Nice!";
        if (score > 10) return "Good Job!";
        if (score > 5) return "Really?";
        return "Poor...";
    }

    scaleScreen() {
        this.calculateScale();
        $('.container').css({
            transform: `scale(${this.scale})`,
            height: $(window).height() / this.scale,
            width: $(window).width() / this.scale,
            transformOrigin: 'left top'
        });
        $('#sticks').width(this.screen / this.scale + 3 * this.stickWidth / this.scale);
    }

    scaleScreenAndRun() {
        this.scaleScreen();
        this.isRunning ? this.stop() : this.intro();
    }

    moveToStart() {
        let tip = gsap.timeline({ delay: 2 });
        tip.fromTo('.learn-to-play', { scale: 0 }, { scale: 1, opacity: 1, ease: "elastic.out(1.25,0.5)" })
           .to('.learn-to-play', { scale: 0, opacity: 0, ease: "elastic.out(1.25,0.5)", delay: 3 });

        gsap.fromTo('#ball', { scale: 0 }, { 
            scale: 1, 
            delay: this.time * ((this.steps - 3) - 1.5),
            onComplete: () => this.balltween.play()
        });

        this.timeline.to('#sticks', { x: 0, duration: this.time * this.steps, ease: "none" });
    }

    moveScene() {
        this.timeline.to('#sticks', {
            x: '-=180px',
            duration: this.time,
            ease: "none",
            repeat: -1,
            onRepeat: () => this.rearrange()
        });
    }

    rearrange() {
        let scale = this.speedUp();
        this.timeline.timeScale(scale);
        this.balltween.timeScale(scale);
        $('#sticks .stick').first().remove();
        new Stick();
    }

    speedUp() {
        if (this.score > 30) return 1.8;
        if (this.score > 20) return 1.7;
        if (this.score > 15) return 1.5;
        if (this.score > 12) return 1.4;
        if (this.score > 10) return 1.3;
        if (this.score > 8) return 1.2;
        if (this.score > 5) return 1.1;
        return 1;
    }

    bounce() {
        this.balltween.to('#ball', { 
            y: '+=250px', 
            scaleY: 0.7, 
            duration: this.time / 2, 
            ease: "power2.in",
            onComplete: () => this.checkColor()
        }).to('#ball', { 
            y: '-=250px', 
            scaleY: 1.1, 
            duration: this.time / 2, 
            ease: "power2.out",
            onStart: () => {
                while (this.prevColor == this.color) {
                    this.color = new Color().getRandomColor();
                }
                this.prevColor = this.color;
                gsap.to('#ball', { backgroundColor: this.color, duration: 0.5 });
            }
        });
    }

    checkColor() {
        let ballPos = $('#ball').offset().left + $('#ball').width() / 2;
        let stickWidth = $('.stick').width();
        let score = this.score;

        $('#sticks .stick').each(function () {
            if ($(this).offset().left < ballPos && $(this).offset().left > (ballPos - stickWidth)) {
                if (Color.getColorFromClass($(this)) == Color.getColorFromClass('#ball')) {
                    score++;
                    $('#score').text(score);
                    gsap.fromTo('#score', { scale: 1.5 }, { scale: 1, ease: "elastic.out(1.5,0.5)" });
                } else {
                    game.stop();
                }
            }
        });

        this.score = score;
    }
}

// Stick and Color classes remain mostly the same as your original code.
// Minor adjustments for gsap v3 syntax (replace TweenMax with gsap).

// Initialize
var game = new Game();
var color = new Color();
Animation.generateSmallGlows(20);

$(document).ready(function () {
    game.scaleScreen();
    game.intro();
});

$(document).on('click', '.stick', function () {
    color.changeColor($(this));
});

$(window).resize(function () {
    game.scaleScreenAndRun();
});

$(window).on("orientationchange", function () {
    game.scaleScreenAndRun();
});

class Stick {
    constructor() {
        this.stick = this.addStick();
    }

    addStick() {
        const stickEl = $('<div class="stick inactive"></div>');
        $('#sticks').append(stickEl);
        return stickEl;
    }
}

class Color {
    constructor() {
        this.colors = ["#FF4571", "#FFD145", "#8260F6"];
        this.effects = ["bubble", "triangle", "block"];
        this.prevEffect = null;
    }

    getRandomColor() {
        const index = Math.floor(Math.random() * 3);
        return this.colors[index];
    }

    colorcodeToName(color) {
        const mapping = {
            "#FF4571": "red",
            "#FFD145": "yellow",
            "#8260F6": "purple"
        };
        return mapping[color] || false;
    }

    changeColor(el) {
        let index = el.data("index") ?? 0;
        index = (index + 1) % 3;
        el.css('background-color', this.colors[index]).data('index', index);

        el.removeClass('red yellow purple').addClass(this.colorcodeToName(this.colors[index]));

        if (el.hasClass('inactive')) {
            this.setEffect(el);
            el.addClass('no-effect');
        }

        el.removeClass('inactive');
    }

    getRandomEffect() {
        let effectIndex;
        do {
            effectIndex = Math.floor(Math.random() * 3);
        } while (effectIndex === this.prevEffect);
        this.prevEffect = effectIndex;
        return this.effects[effectIndex];
    }

    setEffect(el) {
        const effect = this.getRandomEffect();
        el.addClass(`${effect}-stick`);
        for (let i = 1; i <= 14; i++) {
            if (effect === 'block') {
                el.append(`<div class="${effect} ${effect}-${i}"><div class="inner"></div><div class="inner inner-2"></div></div>`);
            } else {
                el.append(`<div class="${effect} ${effect}-${i}"></div>`);
            }
        }
    }

    static getColorFromClass(el) {
        const classes = $(el).attr('class').split(/\s+/);
        for (let cls of classes) {
            if (["red", "yellow", "purple"].includes(cls)) return cls;
        }
    }
}

class Animation {
    static generateSmallGlows(number) {
        let h = $(window).height();
        let w = $(window).width();
        const scale = (w > h) ? h / 800 : w / 1200;
        h /= scale;
        w /= scale;

        for (let i = 0; i < number; i++) {
            const left = Math.floor(Math.random() * w);
            const top = Math.floor(Math.random() * (h / 2));
            const size = Math.floor(Math.random() * 8) + 4;
            const glow = $('<div class="small-glow"></div>').css({ left, top, width: size, height: size });
            $('.small-glows').prepend(glow);
        }
    }

    playBubble(el) {
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(el.find('.bubble'), { scale: 1, duration: 0.3, stagger: 0.03 });
        tl.to(el.find('.bubble'), { y: '-=60', duration: 0.5, stagger: 0.03 });
    }

    playTriangle(el) {
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(el.find('.triangle'), { scale: 1, duration: 0.3, stagger: 0.03 });
        tl.to(el.find('.triangle'), {
            rotationY: 360,
            rotationX: 0,
            duration: 1.5,
            stagger: 0.1,
            repeat: -1
        });
    }

    playBlock(el) {
        const tl1 = gsap.timeline({ repeat: -1, yoyo: true });
        tl1.to(el.find('.block'), { scale: 1, duration: 0.3, stagger: 0.03 });
        tl1.to(el.find('.block .inner:not(.inner-2)'), { x: '+=200%', duration: 1, repeat: -1, stagger: 0.1 });
        tl1.to(el.find('.block .inner-2'), { x: '+=200%', duration: 1, repeat: -1, stagger: 0.1 });
    }

    static sceneAnimation() {
        const speed = 15;
        $('.small-glow').each(function () {
            const radius = Math.floor(Math.random() * 20) + 20;
            gsap.to($(this), { rotation: 360, duration: speed, repeat: -1, transformOrigin: `-${radius}px -${radius}px` });
        });

        const waves = ['.top_wave', '.wave1', '.wave2', '.wave3', '.wave4'];
        waves.forEach((w, i) => {
            gsap.to(w, { backgroundPositionX: '-=54px', duration: speed * (1 + i * 0.1) / 42, repeat: -1, ease: "none" });
        });

        const mountains = ['.mount1', '.mount2'];
        mountains.forEach((m, i) => {
            gsap.to(m, { backgroundPositionX: '-=' + (1760 + i * 22) + 'px', duration: speed * (8 + i * 2), repeat: -1, ease: "none" });
        });

        gsap.to('.clouds', { backgroundPositionX: '-=1001px', duration: speed * 3, repeat: -1, ease: "none" });
    }
}

// Initialize game objects
var game = new Game();
var animation = new Animation();
var color = new Color();
var userAgent = window.navigator.userAgent;

// Generate background small glows
Animation.generateSmallGlows(20);

$(document).ready(function(){
    game.scaleScreen();   // scale the screen properly
    game.intro();         // show intro animation
    
    // Show play full page button for very small screens
    if($(window).height() < 480) {
        $('.play-full-page').css('display', 'block');
    }
});

// Stick click events to change color and trigger effects
$(document).on('click', '.stick', function(){
    color.changeColor($(this));
    if($(this).hasClass('no-effect')) {
        if($(this).hasClass('bubble-stick')) {
            animation.playBubble($(this));
        } else if($(this).hasClass('triangle-stick')) {
            animation.playTriangle($(this));
        } else if($(this).hasClass('block-stick')) {
            animation.playBlock($(this));
        }
        $(this).removeClass('no-effect');
    }
});

// Bar click event (for section-2 bars)
$(document).on('click', '.section-2 .bar', function(){
    color.changeColor($(this));
});

// Handle window resize (except on iOS devices)
$(window).resize(function(){
    if (!userAgent.match(/iPad/i) && !userAgent.match(/iPhone/i)) {
        game.scaleScreenAndRun();
    }
});

// Handle device orientation change
$(window).on("orientationchange", function(){
    game.scaleScreenAndRun();
});
