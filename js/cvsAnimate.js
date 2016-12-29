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
function Animate(func, duration, tween, callback) {
    var startTime = new Date().getTime();
    func(0);
    var loop;
    if (tween) {
        loop = function(startTime, duration, tween) {
            var c = new Date().getTime() - startTime;
            if (c >= duration) {
                func(1);
                callback && callback();
            } else {
                func(tween(c, 0, 1, duration));
                requestAnimationFrame(function() { loop(startTime, duration, tween) });
            }
        }
        loop(startTime, duration, tween);
    } else {
        loop = function(startTime, duration) {
            var c = new Date().getTime() - startTime;
            if (c >= duration) {
                func(1);
                callback && callback();
            } else {
                func(c / duration);
                requestAnimationFrame(function() { loop(startTime, duration) });
            }
        }
        loop(startTime, duration);
    }
}
var cvsAnimate = {};
cvsAnimate.tools = {};
cvsAnimate.tools.extend = function(target, options) {
    var src, copy;
    for (name in options) {
        src = target[name];
        copy = options[name];
        // Prevent never-ending loop
        if (target === copy) {
            continue;
        }
        if (copy instanceof Array) {
            if (src instanceof Array) target[name] = arguments.callee(src, copy);
            else target[name] = arguments.callee([], copy);
        } else if (Object.prototype.toString.call(copy) == "[object Object]") {
            if (Object.prototype.toString.call(src) == "[object Object]") target[name] = arguments.callee(src, copy);
            else target[name] = arguments.callee({}, copy);
        } else {
            target[name] = copy;
        }
    }
    return target;
}
cvsAnimate.tools.hexToRgb = function(hex) {
    // By Tim Down - http://stackoverflow.com/a/5624139/3493650
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
//动画
//图片分散粒子，进入
cvsAnimate.scatterIn = function(elem, imgurl, options, callback) {
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
        var c = elem.querySelector('canvas') || document.createElement('canvas');
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
                }, defaults.duration, defaults.tween || null, callback);
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
    //canvas 点线随机动画
cvsAnimate.DotAndLine = function(elem, options) {
        var canvas_el = elem.querySelector('canvas') || document.createElement('canvas');
        elem.appendChild(canvas_el);
        canvas_el.width = elem.clientWidth;
        canvas_el.height = elem.clientHeight;
        /* default values */
        pJS = {
            canvas: {
                el: canvas_el,
                w: canvas_el.offsetWidth,
                h: canvas_el.offsetHeight
            },
            particles: {
                color: '#ffffff',
                shape: 'circle', // "circle"圆, "edge"方块 or "triangle"三角
                opacity: 1,
                size: 5,
                size_random: true,
                nb: 30, //个数
                line_linked: {
                    enable_auto: true,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 1,
                    width: 1,
                    condensed_mode: {
                        enable: true,
                        rotateX: 65000,
                        rotateY: 65000
                    }
                },
                anim: {
                    enable: true,
                    speed: 1
                },
                array: []
            },
            // interactivity: {
            //     enable: true,
            //     mouse: {
            //         distance: 100
            //     },
            //     detect_on: 'canvas',
            //     mode: 'grab',
            //     line_linked: {
            //         opacity: 1
            //     },
            //     events: {
            //         onclick: {
            //             enable: false,
            //             mode: 'push',
            //             nb: 4
            //         }
            //     }
            // },
            retina_detect: false,
            fn: {
                vendors: {
                    interactivity: {}
                }
            }
        };
        if (options) {
            cvsAnimate.tools.extend(pJS, options);
        }
        pJS.particles.color_rgb = cvsAnimate.tools.hexToRgb(pJS.particles.color);
        pJS.particles.line_linked.color_rgb_line = cvsAnimate.tools.hexToRgb(pJS.particles.line_linked.color);
        /* detect retina */
        if (pJS.retina_detect && window.devicePixelRatio > 1) {
            pJS.retina = true;
            pJS.canvas.pxratio = window.devicePixelRatio
            pJS.canvas.w = pJS.canvas.el.offsetWidth * pJS.canvas.pxratio;
            pJS.canvas.h = pJS.canvas.el.offsetHeight * pJS.canvas.pxratio;
            pJS.particles.anim.speed = pJS.particles.anim.speed * pJS.canvas.pxratio;
            pJS.particles.line_linked.distance = pJS.particles.line_linked.distance * pJS.canvas.pxratio;
            pJS.particles.line_linked.width = pJS.particles.line_linked.width * pJS.canvas.pxratio;
            //pJS.interactivity.mouse.distance = pJS.interactivity.mouse.distance * pJS.canvas.pxratio;
        }
        /* ---------- CANVAS functions ------------ */
        pJS.fn.canvasInit = function() {
            pJS.canvas.ctx = pJS.canvas.el.getContext('2d');
        };
        pJS.fn.canvasSize = function() {
            pJS.canvas.el.width = pJS.canvas.w;
            pJS.canvas.el.height = pJS.canvas.h;
            window.onresize = function() {
                if (pJS) {
                    pJS.canvas.w = pJS.canvas.el.offsetWidth;
                    pJS.canvas.h = pJS.canvas.el.offsetHeight;
                    /* resize canvas */
                    if (pJS.retina) {
                        pJS.canvas.w *= pJS.canvas.pxratio;
                        pJS.canvas.h *= pJS.canvas.pxratio;
                    }
                    pJS.canvas.el.width = pJS.canvas.w;
                    pJS.canvas.el.height = pJS.canvas.h;
                    /* repaint canvas */
                    pJS.fn.canvasPaint();
                    if (!pJS.particles.anim.enable) {
                        pJS.fn.particlesRemove();
                        pJS.fn.canvasRemove();
                        launchParticles();
                    }
                }
            }
        };
        pJS.fn.canvasPaint = function() {
            pJS.canvas.ctx.fillRect(0, 0, pJS.canvas.w, pJS.canvas.h);
        };
        pJS.fn.canvasRemove = function() {
                pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);
            }
            /* --------- PARTICLES functions ----------- */
        pJS.fn.particle = function(color, opacity, position) {
            /* position */
            this.x = position ? position.x : Math.random() * pJS.canvas.w;
            this.y = position ? position.y : Math.random() * pJS.canvas.h;
            /* size */
            this.radius = (pJS.particles.size_random ? Math.random() : 1) * pJS.particles.size;
            if (pJS.retina) this.radius *= pJS.canvas.pxratio;
            /* color */
            this.color = color;
            /* opacity */
            this.opacity = opacity;
            /* animation - velocity for speed */
            this.vx = -.5 + Math.random();
            this.vy = -.5 + Math.random();
            /* draw function */
            this.draw = function() {
                pJS.canvas.ctx.fillStyle = 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + this.opacity + ')';
                pJS.canvas.ctx.beginPath();
                switch (pJS.particles.shape) {
                    case 'circle':
                        pJS.canvas.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                        break;
                    case 'edge':
                        pJS.canvas.ctx.rect(this.x, this.y, this.radius * 2, this.radius * 2);
                        break;
                    case 'triangle':
                        pJS.canvas.ctx.moveTo(this.x, this.y - this.radius);
                        pJS.canvas.ctx.lineTo(this.x + this.radius, this.y + this.radius);
                        pJS.canvas.ctx.lineTo(this.x - this.radius, this.y + this.radius);
                        pJS.canvas.ctx.closePath();
                        break;
                }
                pJS.canvas.ctx.fill();
            }
        };
        pJS.fn.particlesCreate = function() {
            for (var i = 0; i < pJS.particles.nb; i++) {
                pJS.particles.array.push(new pJS.fn.particle(pJS.particles.color_rgb, pJS.particles.opacity));
            }
        };
        pJS.fn.particlesAnimate = function() {
            for (var i = 0; i < pJS.particles.array.length; i++) {
                /* the particle */
                var p = pJS.particles.array[i];
                /* move the particle */
                p.x += p.vx * (pJS.particles.anim.speed / 2);
                p.y += p.vy * (pJS.particles.anim.speed / 2);
                /* change particle position if it is out of canvas */
                if (p.x - p.radius > pJS.canvas.w) p.x = p.radius;
                else if (p.x + p.radius < 0) p.x = pJS.canvas.w + p.radius;
                if (p.y - p.radius > pJS.canvas.h) p.y = p.radius;
                else if (p.y + p.radius < 0) p.y = pJS.canvas.h + p.radius;
                /* Check distance between each particle and mouse position */
                for (var j = i + 1; j < pJS.particles.array.length; j++) {
                    var p2 = pJS.particles.array[j];
                    /* link particles if enable */
                    if (pJS.particles.line_linked.enable_auto) {
                        pJS.fn.vendors.distanceParticles(p, p2);
                    }
                    /* set interactivity if enable */
                    // if (pJS.interactivity.enable) {
                    //     /* interactivity mode */
                    //     switch (pJS.interactivity.mode) {
                    //         case 'grab':
                    //             pJS.fn.vendors.interactivity.grabParticles(p, p2);
                    //             break;
                    //     }
                    // }
                }
            }
        };
        pJS.fn.particlesDraw = function() {
            /* clear canvas */
            pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);
            /* move particles */
            pJS.fn.particlesAnimate();
            /* draw each particle */
            for (var i = 0; i < pJS.particles.array.length; i++) {
                var p = pJS.particles.array[i];
                p.draw('rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + p.opacity + ')');
            }
        };
        pJS.fn.particlesRemove = function() {
            pJS.particles.array = [];
        };
        /* ---------- VENDORS functions ------------ */
        pJS.fn.vendors.distanceParticles = function(p1, p2) {
            var dx = p1.x - p2.x,
                dy = p1.y - p2.y,
                dist = Math.sqrt(dx * dx + dy * dy);
            /* Check distance between particle and mouse mos */
            if (dist <= pJS.particles.line_linked.distance) {
                /* draw the line */
                var color_line = pJS.particles.line_linked.color_rgb_line;
                pJS.canvas.ctx.beginPath();
                pJS.canvas.ctx.strokeStyle = 'rgba(' + color_line.r + ',' + color_line.g + ',' + color_line.b + ',' + (pJS.particles.line_linked.opacity - dist / pJS.particles.line_linked.distance) + ')';
                pJS.canvas.ctx.moveTo(p1.x, p1.y);
                pJS.canvas.ctx.lineTo(p2.x, p2.y);
                pJS.canvas.ctx.lineWidth = pJS.particles.line_linked.width;
                pJS.canvas.ctx.stroke();
                pJS.canvas.ctx.closePath();
                /* condensed particles */
                if (pJS.particles.line_linked.condensed_mode.enable) {
                    var dx = p1.x - p2.x,
                        dy = p1.y - p2.y,
                        ax = dx / (pJS.particles.line_linked.condensed_mode.rotateX * 1000),
                        ay = dy / (pJS.particles.line_linked.condensed_mode.rotateY * 1000);
                    p2.vx += ax;
                    p2.vy += ay;
                }
            }
        };
        // pJS.fn.vendors.interactivity.listeners = function() {
        //     /* init el */
        //     if (pJS.interactivity.detect_on == 'window') {
        //         var detect_el = window;
        //     } else {
        //         var detect_el = pJS.canvas.el;
        //     }
        //     /* el on mousemove */
        //     detect_el.onmousemove = function(e) {
        //         if (detect_el == window) {
        //             var pos_x = e.clientX,
        //                 pos_y = e.clientY;
        //         } else {
        //             var pos_x = e.offsetX || e.clientX,
        //                 pos_y = e.offsetY || e.clientY;
        //         }
        //         if (pJS) {
        //             pJS.interactivity.mouse.pos_x = pos_x;
        //             pJS.interactivity.mouse.pos_y = pos_y;
        //             if (pJS.retina) {
        //                 pJS.interactivity.mouse.pos_x *= pJS.canvas.pxratio;
        //                 pJS.interactivity.mouse.pos_y *= pJS.canvas.pxratio;
        //             }
        //             pJS.interactivity.status = 'mousemove';
        //         }
        //     };
        //     /* el on onmouseleave */
        //     detect_el.onmouseleave = function(e) {
        //         if (pJS) {
        //             pJS.interactivity.mouse.pos_x = 0;
        //             pJS.interactivity.mouse.pos_y = 0;
        //             pJS.interactivity.status = 'mouseleave';
        //         }
        //     };
        //     /* el on onclick */
        //     if (pJS.interactivity.events.onclick.enable) {
        //         switch (pJS.interactivity.events.onclick.mode) {
        //             case 'push':
        //                 detect_el.onclick = function(e) {
        //                     if (pJS) {
        //                         for (var i = 0; i < pJS.interactivity.events.onclick.nb; i++) {
        //                             pJS.particles.array.push(new pJS.fn.particle(pJS.particles.color_rgb, pJS.particles.opacity, {
        //                                 'x': pJS.interactivity.mouse.pos_x,
        //                                 'y': pJS.interactivity.mouse.pos_y
        //                             }))
        //                         }
        //                     }
        //                 }
        //                 break;
        //             case 'remove':
        //                 detect_el.onclick = function(e) {
        //                     pJS.particles.array.splice(0, pJS.interactivity.events.onclick.nb);
        //                 }
        //                 break;
        //         }
        //     }
        // };
        // pJS.fn.vendors.interactivity.grabParticles = function(p1, p2) {
        //     var dx = p1.x - p2.x,
        //         dy = p1.y - p2.y,
        //         dist = Math.sqrt(dx * dx + dy * dy);
        //     var dx_mouse = p1.x - pJS.interactivity.mouse.pos_x,
        //         dy_mouse = p1.y - pJS.interactivity.mouse.pos_y,
        //         dist_mouse = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);
        //     /* Check distance between 2 particles + Check distance between 1 particle and mouse position */
        //     if (dist <= pJS.particles.line_linked.distance && dist_mouse <= pJS.interactivity.mouse.distance && pJS.interactivity.status == 'mousemove') {
        //          Draw the line 
        //         var color_line = pJS.particles.line_linked.color_rgb_line;
        //         pJS.canvas.ctx.beginPath();
        //         pJS.canvas.ctx.strokeStyle = 'rgba(' + color_line.r + ',' + color_line.g + ',' + color_line.b + ',' + (pJS.interactivity.line_linked.opacity - dist_mouse / pJS.interactivity.mouse.distance) + ')';
        //         pJS.canvas.ctx.moveTo(p1.x, p1.y);
        //         pJS.canvas.ctx.lineTo(pJS.interactivity.mouse.pos_x, pJS.interactivity.mouse.pos_y);
        //         pJS.canvas.ctx.lineWidth = pJS.particles.line_linked.width;
        //         pJS.canvas.ctx.stroke();
        //         pJS.canvas.ctx.closePath();
        //     }
        // };
        pJS.fn.vendors.destroy = function() {
            cancelAnimationFrame(pJS.fn.requestAnimFrame);
            canvas_el.remove();
            delete pJS;
        };
        /* --------- LAUNCH ----------- */
        function launchParticles() {
            pJS.fn.canvasInit();
            pJS.fn.canvasSize();
            pJS.fn.canvasPaint();
            pJS.fn.particlesCreate();
            pJS.fn.particlesDraw();
        };

        function launchAnimation() {
            pJS.fn.particlesDraw();
            pJS.fn.requestAnimFrame = requestAnimationFrame(launchAnimation);
        };
        launchParticles();
        if (pJS.particles.anim.enable) {
            launchAnimation();
        }
        // if (pJS.interactivity.enable) {
        //     pJS.fn.vendors.interactivity.listeners();
        // }
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