$(document).ready(function () {
    $(".next").click(function () {
        $(".pagination").find(".page-item.active").next().addClass("active");
        $(".pagination").find(".page-item.active").prev().removeClass("active");
    });
    $(".prev").click(function () {
        $(".pagination").find(".page-item.active").prev().addClass("active");
        $(".pagination").find(".page-item.active").next().removeClass("active");
    });
});



