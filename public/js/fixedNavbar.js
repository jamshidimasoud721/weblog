$(document).ready(function(){
    $(window).bind('scroll', function() {
        if ($(window).scrollTop() > 120) {
            $('.nav_bar').delay(3000).addClass('fixed');
        }
        else {
            $('.nav_bar').removeClass('fixed');
        }
    });
});
