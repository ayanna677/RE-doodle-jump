// Initialize game, color, animation globally
var game, color, animation;
var userAgent = window.navigator.userAgent;

$(document).ready(function(){

    // Create instances once
    game = new Game();
    color = new Color();
    animation = new Animation();

    // Generate glows
    Animation.generateSmallGlows(20);

    // Scale screen and show intro
    game.scaleScreen();
    game.intro();

    // For very small screens
    if($(window).height() < 480) {
        if($('.play-full-page').length) $('.play-full-page').css('display', 'block');
    }

});

// Click handlers
$(document).on('click', '.stick', function(){
    color.changeColor($(this));
    if($(this).hasClass('no-effect')) {
        if($(this).hasClass('bubble-stick')) animation.playBubble($(this));
        else if($(this).hasClass('triangle-stick')) animation.playTriangle($(this));
        else if($(this).hasClass('block-stick')) animation.playBlock($(this));
        $(this).removeClass('no-effect');
    }
});

$(document).on('click', '.section-2 .bar', function(){
    color.changeColor($(this));
});

// Handle resize and orientation
$(window).resize(function(){
    if (!userAgent.match(/iPad/i) && !userAgent.match(/iPhone/i)) {
        game.scaleScreenAndRun();
    }
});

$(window).on("orientationchange",function(){
    game.scaleScreenAndRun();
});
