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
