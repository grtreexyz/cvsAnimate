;
//create by 栾树崇
//canvas 动画静态函数库
//requestAnimationFrame兼容
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 1000 / 60 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}());
//一次贝塞尔曲线运动器
//p0原点[x,y]，p1曲线控制点，p2终点，t时间0-1，返回当前时间坐标点
function qBerzier(p0, p1, p2, t) {
    var x = (1 - t) * (1 - t) * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0];
    var y = (1 - t) * (1 - t) * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1];
    return [x, y];
}
//动画函数
function Animate(func, duration, tween) {
    var startTime = new Date().getTime();
    func(0);
    if (tween) {
        loop(startTime, duration, tween);

        function loop(startTime, duration, tween) {
            var c = new Date().getTime() - startTime;
            if (c >= duration) {
                func(1)
            } else {
                func(tween(c, 0, 1, duration));
                requestAnimationFrame(function() { loop(startTime, duration, tween) });
            }
        }
    } else {
        loop(startTime, duration);

        function loop(startTime, duration) {
            var c = new Date().getTime() - startTime;
            if (c >= duration) {
                func(1)
            } else {
                func(c / duration);
                requestAnimationFrame(function() { loop(startTime, duration) });
            }
        }
    }
}
var cvsAnimate = {};
cvsAnimate.tools = {};
cvsAnimate.tools.extend = function(target, options) {
        var src,copy;
        for (name in options) {
            src = target[name];
            copy = options[name];
            // Prevent never-ending loop
            if (target === copy) {
                continue;
            }
            if (copy instanceof Array) {
                if(src instanceof Array)
                    target[name] = arguments.callee(src, copy);
                else
                    target[name] = arguments.callee([], copy);
            } else if (Object.prototype.toString.call(copy)=="[object Object]") {
                if(Object.prototype.toString.call(src)=="[object Object]")
                    target[name] = arguments.callee(src, copy);
                else
                    target[name] = arguments.callee({}, copy);
            } else {
                target[name] = copy;
            }
        }
        return target;
    }
    //动画
    //分散粒子，进入
cvsAnimate.scatterIn = function(elem, imgurl, options) {
        var self = this;
        var defaults = {
            width: elem.clientWidth, //canvas的大小
            height: elem.clientHeight, //canvas的大小
            duration: 3000, //动画持续时间
            cols: elem.clientWidth / 4, //imgBox.w/2，粒子列数
            rows: elem.clientHeight / 4, //imgBox.h/2，粒子行数
            imgBox: { x: elem.clientWidth / 4, y: 0, w: elem.clientWidth / 2, h: elem.clientHeight / 2 }, //图像显示位置盒子
            originRangeBox: { x: -elem.clientWidth, y: -elem.clientWidth, w: elem.clientWidth * 3, h: elem.clientHeight * 3 }, //粒子初始位置盒子
        }
        if (options) {
            options.imgBox && options.imgBox.w && options.cols && (options.cols = options.imgBox.w / 2);
            options.imgBox && options.imgBox.h && options.rows && (options.rows = options.imgBox.h / 2);
            cvsAnimate.tools.extend(defaults, options);
        }
        var c = document.createElement('canvas');
        c.width = defaults.width;
        c.height = defaults.height;
        var ctx = c.getContext("2d");
        this.particles = []; //粒子数组最好不要超过30万个，否则很可能会卡
        var img = new Image();
        img.onload = function() {
                var c = document.createElement('canvas');
                c.width = defaults.imgBox.w;
                c.height = defaults.imgBox.h;
                var ctx = c.getContext("2d");
                ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, c.width, c.height);
                var cw = Math.ceil(c.width / defaults.cols);
                var rh = Math.ceil(c.height / defaults.rows);
                var imageData = ctx.getImageData(0, 0, c.width, c.height);
                var data = imageData.data;
                var pos = 0;
                for (var i = 0; i < defaults.cols; i++)
                    for (var j = 0; j < defaults.rows; j++) {
                        pos = (j * rh * c.width + i * cw) * 4;
                        var particle = {
                            ox: defaults.originRangeBox.x + defaults.originRangeBox.w * Math.random(),
                            oy: defaults.originRangeBox.y + defaults.originRangeBox.h * Math.random(),
                            x: i * cw,
                            y: j * rh,
                            delay: defaults.duration * Math.random(), //粒子延迟处理时间，调整它可以出现不同动画效果
                            fillStyle: 'rgba(' + data[pos++] + ', ' + data[pos++] + ', ' + data[pos++] + ',' + data[pos++] / 255 + ')'
                        };
                        self.particles.push(particle);
                    }
                Animate(function(t) {
                    draw(self.particles, cw, rh, t);
                }, defaults.duration, defaults.tween || null);
            }
            //img.crossOrigin = "anonymous";
        img.src = imgurl;
        elem.appendChild(c);

        function draw(p, w, h, t) {
            var t1 = new Date();
            ctx.clearRect(0, 0, c.width, c.height);
            for (var i in p) {
                ctx.fillStyle = p[i].fillStyle;
                var zb = p[i].delay / defaults.duration;
                var dt = t - zb;
                if (dt >= 0) {
                    var temp = qBerzier([p[i].ox, p[i].oy], [200, 200], [defaults.imgBox.x + p[i].x, defaults.imgBox.y + p[i].y], dt / (1 - zb));
                    ctx.fillRect(temp[0], temp[1], w, h);
                }
            }
            var t2 = new Date();
            console.log('画一次用的时间:' + (t2 - t1) + 'ms');
        }
    }
    // cvsAnimate.skewIn = function(elem, imgurl, options) {
    //         default = {
    //             mode: 'lt2rb', //左上到右下，
    //             width: elem.clientWidth,
    //             height: elem.clientHeight,
    //             duration: 1000,
    //             animationInterval: 40
    //         }
    //         cvsAnimate.tools.extend(default, options);
    //         var c = document.createElement('canvas');
    //         c.width = default.width;
    //         c.height = default.height;
    //         var wb = Math.round(c.width / (default.duration / default.animationInterval)); //宽的步长
    //         var hb = Math.round(c.height / (default.duration / default.animationInterval)); //宽的步长
    //         var ctx = c.getContext("2d");
    //         ctx.clearRect(0, 0, c.width, c.height);
    //         var img = new Image();
    //         img.onload = function() {
    //             var ix = 0,
    //                 iy = 0;
    //             var IntervalOut = setInterval(function() {
    //                 ctx.drawImage(img, ix, 0, buchang, ch, ix, 0, buchang, ch);
    //                 if (ix >= cw) clearInterval(IntervalOut);
    //                 else ix += buchang;
    //                 if (ix > cw) ix = cw;
    //             }, options.animationInterval);
    //         }
    //         img.src = imgurl;
    //     }
    // cvsAnimate.printIn = function(canvasid, imgsrc, duration) {
    //     var c = document.getElementById(canvasid);
    //     var cw = c.width;
    //     var ch = c.height;
    //     var buchang = Math.round(cw / (duration / 50));
    //     var ctx = c.getContext("2d");
    //     ctx.clearRect(0, 0, cw, ch);
    //     var img = new Image();
    //     img.onload = function() {
    //         var ix = 0,
    //             iy = 0;
    //         var IntervalOut = setInterval(function() {
    //             ctx.drawImage(img, ix, 0, buchang, ch, ix, 0, buchang, ch);
    //             if (ix >= cw) clearInterval(IntervalOut);
    //             else ix += buchang;
    //             if (ix > cw) ix = cw;
    //         }, 50);
    //     }
    //     img.src = imgsrc;
    // }
    // function DownCaRu(canvasid, imgsrc, duration) {
    //     var c = document.getElementById(canvasid);
    //     var cw = c.width;
    //     var ch = c.height;
    //     var buchang = Math.round(ch / (duration / 50));
    //     var ctx = c.getContext("2d");
    //     ctx.clearRect(0, 0, cw, ch);
    //     var img = new Image();
    //     img.onload = function() {
    //         var ix = 0,
    //             iy = ch;
    //         var IntervalOut = setInterval(function() {
    //             ctx.drawImage(img, ix, iy, cw, buchang, ix, iy, cw, buchang);
    //             if (iy == 0) clearInterval(IntervalOut);
    //             else iy -= buchang;
    //             if (iy < 0) iy = 0;
    //         }, 50);
    //     }
    //     img.src = imgsrc;
    // }