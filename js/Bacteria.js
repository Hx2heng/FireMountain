(function($) {

    window.gamestart = function() {
        var source = []; //游戏资源, 存放图片和声音
        var c = $("#game-box"); //游戏容器
        var cxt = c.get(0).getContext("2d"); //构造画布
        var c_width, c_height; //画布的高和宽
        c.fadeIn(200);
        $('.btn-get').hide(); //隐藏领取按钮
        //游戏配置
        var config = {
            "imageSrc": CFG.imagesUrl, //图片url前缀
            "soundSrc": CFG.soundsUrl, //声音url前缀
            "loadImg": ['bg.jpg', 'loading1.png', 'loading2.png', 'loading3.png', 'logo.png'], //等待动画图片资源
            "gameImg": ['b4.png', 'b4_2.png', 'mountain.png', 'b4_die1.png', 'b4_die2.png', 'cloud.png'], //游戏图片资源
            "gameGiftChance": rd(1, 2),
            "gameSpeed": 10, //游戏帧数(100为1s,参照标准慎改)
            "gameTime": 30, //游戏时间
            "BacteriaLiftTime": 50, //细菌存活时间
            "BacteriaShowTime": 80, //细菌出现间隔
            "getTime": 2, //最短得奖时间
            "pro": 1, //得奖概率
            "isMobile": navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|mobile)/) //是否手机 
        };

        main(); //执行main方法

        //新建图片函数

        function creatImg(src) {
            if (typeof source[src] != "undefined") {
                return source[src];
            }
            source[src] = new Image();
            source[src].src = config.imageSrc + src;
            return source[src];
        }

        //范围随机函数
        function rd(n, m) {
            var c = m - n + 1;
            return Math.floor(Math.random() * c + n);
        }
        //图片预加载函数
        function loadImage(images, callback) {
            var toLoadLength = images.length;
            var loadLength = 0;
            for (var i = toLoadLength; i--;) {
                var src = images[i];
                source[src] = new Image();
                source[src].onload = function() {
                    loadLength++;
                    if (toLoadLength == loadLength) {
                        callback();
                    }
                }
                source[src].src = config.imageSrc + src;
            }
        }
        //游戏主事件

        function main() {
            loadImage(config.loadImg, loading);

            resize();
            $(window).on("resize", resize);

            function resize() {
                var screenWidth = $(window).width();
                var screenHeight = $(window).height();
                c_height = screenHeight < 800 ? screenHeight : 800;
                c_width = screenWidth < 480 ? screenWidth : 480;
                c.attr({
                    height: c_height,
                    width: c_width
                }).offset({
                    top: (screenHeight - c_height) / 2
                });
                cxt.font = "18px Microsoft YaHei";
                cxt.fillStyle = "white";
                cxt.textAlign = "center";
            }
        }

        //等待事件
        function loading() {
            //等待时间
            var loadingTime = 0;

            //等待动画刷新事件
            var refresh = function() {
                    drawBg();
                    drawLogo();
                    load();
                    loadingTime++;

                }
                //设置背景
            function drawBg() {
                var bg_img = creatImg("bg.jpg");
                var bg_img_width = bg_img.width;
                var bg_img_height = bg_img.height;
                cxt.drawImage(bg_img, 0, 0, bg_img_width, bg_img_height);
            }
            //构造logo
            function drawLogo() {
                var logo_img = creatImg("logo.png");
                var logo_width = 150;
                var logo_height = 120;

                var x = (c_width - logo_width) / 2;
                var y = 100;
                cxt.drawImage(logo_img, x, y, logo_width, logo_height);
            }
            //等待动画
            function load() {
                if (loadingTime == 600) {
                    loadingTime = 0;
                }
                //loadingTime每隔200换一张图, 实现等待动画
                var pic = creatImg("loading" + (parseInt(loadingTime / 200) + 1) + ".png");
                var pic_width = pic.width;
                var pic_height = pic.height;

                var x = (c_width - pic_width) / 2;
                cxt.drawImage(pic, x, 220, pic_width, pic_height);
            }
            //开始动画
            var loadingClock = setInterval(refresh, 1);
            loadImage(config.gameImg, function() {
                clearInterval(loadingClock);
                game();

            });

        }

        function game() {
            var game = {};
            game.time = 0;
            game.bgImg = creatImg("bg.jpg");
            game.refreshInterval = config.gameSpeed;
            game.bgAnimationVal = 0;
            game.bgAnimationDer = 0.2;
            game.score = 0;
            game.startTime = 0; //开始时间 
            game.usedTime = 0; //使用时间
            game.isGet = false; //是否已经得奖
            game.chance = config.pro; //得奖概率
            game.bacteriaShowTime = config.BacteriaShowTime;
            game.readyTime = 4;
            game.balls = [];
            //game.music = "bg.mp3";
            game.ready = function() {
                game.readyClock = setInterval(function() {
                    game.readyTime--;
                    game.drawBg();
                    //var my_gradient = cxt.createLinearGradient(0, 0, c_height - 100, 0);
                    var readyTime = MillisecondToDate(game.readyTime * 1000, false);
                    if (readyTime == 0) readyTime = 'Go!';
                    cxt.save();
                    cxt.font = "italic small-caps bold " + c_height / 3 + "px arial";
                    cxt.lineWidth = 2;
                    cxt.fillStyle = '#D32129';
                    cxt.strokeStyle = "white";
                    cxt.textAlign = "center";
                    cxt.fillText(readyTime, c_width / 2, c_height / 2);
                    cxt.strokeText(readyTime, c_width / 2, c_height / 2);
                    cxt.restore();

                    if (game.readyTime <= 0) {
                        clearInterval(game.readyClock);
                        game.start();
                    }
                }, 1000);


            }
            game.start = function() {
                game.startTime = new Date().getTime();
                game.clear();
                if (config.isMobile) {
                    c.get(0).addEventListener("touchstart", function(e) {
                        e.preventDefault();
                        var touch = e.targetTouches[0];
                        var x = touch.pageX - c.offset().left;
                        var y = touch.pageY - c.offset().top;
                        game.BacteriaIsHit(x, y);

                    })
                } else {
                    c.on('click', function(e) {
                        var e = e ? e : window.event;
                        var x = e.clientX - c.offset().left;
                        var y = e.clientY - c.offset().top;
                        game.BacteriaIsHit(x, y);

                    })
                }

                var $this = this;
                this.timer = requestAnimationFrame(function() {
                    $this.refresh();
                    //游戏时间用完结束
                    if (game.usedTime / 1000 > config.gameTime) {
                        $this.over();
                        cancelAnimationFrame($this.timer);
                    } else {
                        $this.timer = requestAnimationFrame(arguments.callee);
                    }
                });
            };
            game.refresh = function() {
                cxt.clearRect(-c_width * 4, -c_height * 4, c_width * 4, c_height * 4);
                game.time++;
                game.usedTime = new Date().getTime() - game.startTime;
                game.drawBg();
                game.mountain();
                game.bacteriaLife();
                game.fireword();
                if (game.gift) {
                    game.gift.draw();
                }
                game.refreshMessage();
            }
            game.over = function() {
            	console.log(this.isGet);
                alert('是否找到礼物:'+(this.isGet?'是':'否'));
                window.location.reload();
            }
            game.clear = function() {
                cxt.clearRect(-c_width * 4, -c_height * 4, c_width * 4, c_height * 4);
                game.time = 0;
                game.score = 0;
                game.Bacterias.length = 0;

            }
            game.drawBg = function() {
                var bg_img_height = game.bgImg.height;
                var bg_img_width = game.bgImg.width;
                cxt.drawImage(game.bgImg, 0, 0, c.width(), c.height());

            }
            game.Bacterias = [];
            game.BacteriasNum = 0;
            game.createBacterias = function() {

                if (game.time % game.bacteriaShowTime != 0) {
                    return;
                }
                if (game.bacteriaShowTime > 4) {
                    game.bacteriaShowTime -= 2;

                }
                game.BacteriasNum++;
                game.creatfireword();
                if (game.usedTime / 1000 >= config.getTime) {
                    game.Bacterias.push(new Bacteria(4, Math.random()));
                } else {
                    game.Bacterias.push(new Bacteria(4, game.chance));

                }
            }

            game.bacteriaLife = function() {
                game.createBacterias();
                for (var i = 0; i < game.Bacterias.length; i++) {
                    game.Bacterias[i].init();
                    if (!game.Bacterias[i].alive) {
                        if (!game.isGet) {
                            if (game.Bacterias[i].isHave) {
                                game.creatfireword(game.Bacterias[i]);
                                game.createGift(game.Bacterias[i]);
                                game.isGet = true;
                            };
                        }
                        game.Bacterias.splice(i, 1);
                    }
                }

            }

            game.refreshMessage = function() {
                var timeLimit = '00:' + MillisecondToDate(config.gameTime * 1000 - game.usedTime, true);
                if (timeLimit == '00:00') timeLimit = "Time up!";
                cxt.save();
                cxt.font = "italic small-caps bold 50px arial";
                cxt.fillStyle = '#D32129';
                cxt.textAlign = "center";
                cxt.fillText(timeLimit, c_width / 2, 54);
                cxt.restore();

            }
            game.BacteriaIsHit = function(x, y) {
                for (var i = 0; i < game.Bacterias.length; i++) {
                    if (game.Bacterias[i].x < x && x < (game.Bacterias[i].x + game.Bacterias[i].width) && game.Bacterias[i].y < y && y < (game.Bacterias[i].y + game.Bacterias[i].height)) {
                        game.Bacterias[i].byAttack();
                    }
                }
            }
            game.createGift = function(Bacterias) {
                game.gift = {
                    x: Bacterias.x + Bacterias.width / 2,
                    y: Bacterias.y + Bacterias.height / 2,
                    vy: -8,
                    vx: 2,
                    w: 10,
                    img: creatImg("gt.png"),
                    init: function() {
                        console.log(this.x, c_width / 2, (c_width + this.img.width) / 2);
                        if (this.x > c_width / 2) {
                            this.vx = -this.vx;
                        }
                    },
                    draw: function() {
                        cxt.drawImage(this.img, this.x, this.y, this.w, this.w);
                        this.x += this.vx;
                        this.y += this.vy;
                        this.vy += 0.2;
                        if (this.w < 100) {
                            this.w += 1;
                        }
                    }
                }
                game.gift.init();
            }
            game.creatfireword = function(Bacterias) {
                var balls = [];
                if (Bacterias) {
                    var x = Bacterias.x;
                    var y = Bacterias.y;
                    var Cx = Bacterias.x + Bacterias.width;
                    var Cy = Bacterias.y + Bacterias.height;
                } else {
                    var Cx = c_width / 2;
                    var Cy = c_height - 100;
                }

                function Ball(Cx, Cy) {
                    this.x = Cx;
                    this.y = Cy;
                    this.r = 4;
                    this.vy = -Math.random() * 6;
                    this.vx = -Math.random() * 6 + 3;
                    this.a = 0.1;
                    this.color = ["red", "yellow", "white", "orange"];
                };
                Ball.prototype.move = function() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vy += this.a;
                }
                var num = arguments[0] ? 80 : 10;
                for (var i = 0; i < num; i++) {
                    game.balls.push(new Ball(Cx, Cy));
                }
                //game.balls.balls;
            }
            game.fireword = function() {
                if (!game.balls) return;
                for (var i = 0; i < game.balls.length; i++) {
                    game.balls[i].move();
                    cxt.save();
                    cxt.beginPath();
                    cxt.arc(game.balls[i].x, game.balls[i].y, game.balls[i].r, 0, Math.PI * 2, true);
                    cxt.closePath();
                    cxt.fillStyle = game.balls[i].color[Math.floor(Math.random() * 4)];
                    cxt.fill();
                    cxt.restore();
                    if (game.balls[i].y > c_height * 2) {
                        game.balls.splice(i, 1);
                    }
                }
            }
            game.mountain = function() {
                mountain.draw();
            }
            var mountain = {
                x: 0,
                y: c_height - 100,
                cx: c_width / 2,
                cy: c_height - 90,
                cw: 0,
                ch: 0,
                cx2: 0,
                cy2: 0,
                cw2: 0,
                ch2: 0,
                cOpacity: 1,
                img: creatImg("mountain.png"),
                cloud: creatImg("cloud.png"),
                draw: function() {
                    if (this.cx2) {
                        cxt.save();
                        cxt.globalAlpha = this.cOpacity;
                        this.cOpacity -= 0.005;
                        cxt.drawImage(this.cloud, this.cx2, this.cy2, this.cw2, this.ch2);
                        cxt.restore();
                    }
                    cxt.drawImage(this.cloud, this.cx, this.cy, this.cw, this.ch);
                    if (game.time % config.BacteriaShowTime == 0) {
                        cxt.drawImage(this.img, this.x, this.y + 5, c_width, 102);
                    } else {
                        cxt.drawImage(this.img, this.x, this.y, c_width, 102);
                    }
                    if (this.cw < c_width * 1.8) {
                        this.cx -= 2;
                        this.cy -= 4;
                        this.cw += 4;
                        this.ch += 4;
                        if (this.cx2) {
                            this.cy2 -= 2;
                            this.ch2 += 2;
                        }
                    } else {
                        this.cOpacity = 1;
                        this.cx2 = this.cx;
                        this.cy2 = this.cy;
                        this.cw2 = this.cw;
                        this.ch2 = this.ch;
                        this.cx = c_width / 2;
                        this.cy = c_height - 90;
                        this.cw = 0;
                        this.ch = 0;
                    }

                }
            }

            function Bacteria(type, chance) {
                this.type = type;
                this.x = c_width / 2;
                this.y = c_height - 100;
                this.vx = 0;
                this.vy = 0;
                this.showTime = 0;
                this.lifeTime;
                this.dieTime = 5;
                this.byAttackTime = 2;
                this.alive = true;
                this.isHave = false; //是否含有奖品
                this.chance = chance;
                this.escapeVx = rd(1, 2) > 1 ? rd(-2, -1) : rd(1, 2);
                this.escapeVy = -10;
                this.angle = 0;
                this.vangle = rd(-10, 10);
                var dieSpeed = 40; //死亡动画播放速度
                switch (type) {
                    case 1:
                        this.hp = 1;
                        this.score = 10;
                        this.lifeTime = config.BacteriaLiftTime;
                        break;
                    case 2:
                        this.hp = 1;
                        this.score = 10;
                        this.lifeTime = config.BacteriaLiftTime;
                        break;
                    case 3:
                        this.hp = 1;
                        this.score = 10;
                        this.lifeTime = config.BacteriaLiftTime;
                        break;
                    case 4:
                        this.hp = 1;
                        this.score = 10;
                        this.lifeTime = config.BacteriaLiftTime;
                        break;
                }

                this.model = creatImg("b" + this.type + ".png");
                this.hurtmodel = creatImg("b" + this.type + "_die1.png");
                this.width = 0;
                this.height = 0;

            };
            Bacteria.prototype = {
                    init: function() {
                        var _this = this;
                        this.move();
                        this.fillOut();
                        this.byAttackTime--;
                        this.showTime++;
                        this.cx = this.x + this.width / 2;
                        this.cy = this.y + this.height / 2;
                        if (this.hp <= 0) {
                            this.die();
                        }
                        this.escape();
                        if (this.type == 4) {
                            if (this.byAttackTime > 0) {
                                cxt.drawImage(this.hurtmodel, _this.x + _this.vx, _this.y + _this.vy, _this.width, _this.height);
                            } else {
                                    cxt.save();
                            		cxt.translate(this.cx, this.cy);
                            		cxt.rotate(this.angle* Math.PI / 180);
                            		cxt.translate(-this.cx, -this.cy);
                            		cxt.drawImage(creatImg(game.time % 30 > 15 ? "b4.png" : "b4_2.png"), _this.x + _this.vx, _this.y + _this.vy, _this.width, _this.height);
                               
                            	cxt.rotate(0);
                            	cxt.restore();
                                this.byAttackTime = 0;
                            }
                        } else {
                            if (this.byAttackTime > 0) {
                                cxt.drawImage(this.hurtmodel, _this.x + _this.vx, _this.y + _this.vy, _this.width, _this.height);
                            } else {
                                cxt.drawImage(_this.model, _this.x + _this.vx, _this.y + _this.vy, _this.width, _this.height);
                                this.byAttackTime = 0;
                            }
                        }
                    },
                    move: function() {
                        this.angle += this.vangle ;
                    },
                    fillOut: function() {
                        if (this.width >= (this.model.width / 2) && this.height >= (this.model.height / 2)) {
                            this.width = this.model.width / 2;
                            this.height = this.model.height / 2;
                        } else {
                            this.x -= 2;
                            this.y -= 2;
                            this.width += 4;
                            this.height += 4;
                        }
                    },
                    byAttack: function() {
                        this.hp--;
                        this.byAttackTime = 10;
                        this.showTime = 0;

                        if (this.chance < game.chance) {
                            this.isHave = true;
                        }
                        if (this.hp <= 0) {
                            game.score += this.score;
                        }
                    },
                    die: function() {
                        this.dieTime--;
                        this.model = creatImg("b" + this.type + "_die1.png");
                        if (this.dieTime <= 0) {
                            this.alive = false;
                        }
                    },
                    escape: function() {
                        this.escapeVx *= 1.01;
                        this.escapeVy += 0.1;
                        this.x += this.escapeVx;
                        this.y += this.escapeVy;
                        if (this.y < -100) {
                            this.alive = false;
                        }
                    }
                }
                
            //毫秒转换
            function MillisecondToDate(msd, hasZero) {
                var time = parseInt(parseFloat(msd) / 1000);
                if (time < 10 && hasZero) {
                    time = '0' + time;
                }
                return time;
            }
            game.ready();
        }
    }
})(jQuery)
