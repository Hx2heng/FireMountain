(function($) {

    //onepage
    $.extend($.fn, {
        onePage: function(position) { //top,left,bottom,right,auto
            var methons = {
                setCss: function(multiple) {
                    $(this).css({
                        "transform": "scale(" + multiple + ")",
                        "-moz-transform": "scale(" + multiple + ")",
                        "-webkit-transform": "scale(" + multiple + ")",
                        "-o-transform": "scale(" + multiple + ")",
                        "position": "absolute",
                        "overflow": "hidden"
                    });
                    methons.setPosition($(this));
                    methons.check($(this), multiple);
                },
                setPosition: function(c) {
                    var c_w = c.width(),
                        c_h = c.height(),
                        w_w = $('#main').width(),
                        w_h = $('#main').height();

                    c.css({
                        'top': (w_h - c_h) / 2,
                        'left': (w_w - c_w) / 2
                    });
                },
                check: function(c, multiple) {
                    var c_w = c.width() * multiple,
                        c_h = c.height() * multiple,
                        w_w = $('#main').width(),
                        w_h = $('#main').height();

                    if (c_w > w_w || c_h > w_h) {
                        //$.error('onePageJS can ont be supported!');
                        c.css({
                            'width': '100%'
                        });
                    }

                }
            }
            return this.each(function() {
                var w_w = $('#main').width(),
                    w_h = $('#main').height(),
                    c_w = $(this).width() + 2,
                    c_h = $(this).height() + 2,
                    w_wh = w_w / w_h,
                    c_wh = c_w / c_h;
                multiple = 1;
                //设置缩放倍数
                if (w_wh < c_wh) {
                    multiple = w_w / c_w;
                } else if (w_wh > c_wh) {
                    multiple = w_h / c_h;
                } else {
                    multiple = w_w / c_w;
                }
                //
                methons.setCss.call(this, multiple);


            })
        }
    });

    $(document).ready(function() {
        $('.onepage').onePage();
        $(window).on('resize', function() {
            $('.onepage').onePage();
        })
        $(window).on('load', function() {
            $('.onepage').onePage();
        })
        $('#main').append('<canvas id="game-box"><p>您的浏览器不支持此游戏！</p></canvas>');
        gamestart();
    })
})(jQuery)
