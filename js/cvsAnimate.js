;
//create by 栾树崇
//
var cvsAnimate = {};
cvsAnimate.tools = {};
cvsAnimate.tools.extend = function(target, options) {
    for (name in options) {
        copy = options[name];
        if (copy instanceof Array) {
            target[name] = arguments.callee([], copy);
        } else if (copy instanceof Object) {
            target[name] = arguments.callee({}, copy);
        } else {
            target[name] = options[name];
        }
    }
    return target;
}
cvsAnimate.scatterIn = function(elem, imgurl, options) {
    var self=this;
    var defaults = { 
        width: elem.clientWidth,
        height: elem.clientHeight,
        duration: 1000,
        animationInterval: 40,
        cols: elem.clientWidth/4,
        rows: elem.clientHeight/4,
    }
    cvsAnimate.tools.extend(defaults, options);
    var c = document.createElement('canvas');
    c.width = defaults.width;
    c.height = defaults.height;
    var ctx = c.getContext("2d");
    var img = new Image();
    this.particles = [];
    var pos = 0;
    var cw = Math.ceil(c.width / defaults.cols) || 1;
    var rh = Math.ceil(c.height / defaults.rows) || 1;
    img.onload = function() {
        ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, c.width, c.height);
        var imageData = ctx.getImageData(0, 0, c.width, c.height);
        ctx.clearRect(0, 0, c.width, c.height);
        elem.appendChild(c);
        var data = imageData.data;
        for (var i = 0; i < defaults.cols; i++)
            for (var j = 0; j < defaults.rows; j++) {
                pos = (j * rh * c.width + i * cw) * 4;
                var particle = {
                    x: i * cw,
                    y: j * rh,
                    fillStyle: 'rgba('+data[pos++]+', '+data[pos++]+', '+data[pos++]+','+data[pos++]/255+')'
                };
                self.particles.push(particle);
        }
        draw(self.particles)
    }
    //img.crossOrigin = "anonymous";
    img.src = imgurl;

    function draw(p) {
        var t1=new Date();
        ctx.clearRect(0, 0, c.width, c.height);
        for (var i in p) {
            ctx.fillStyle=p[i].fillStyle;
            ctx.fillRect(p[i].x,p[i].y,cw,rh);
        }
        var t2=new Date();
        console.log('画一次用的时间:'+(t2-t1)+'ms');
    }
}
// "use strict";
// var canvas = {},
// image = {},
// requestId = 0,
// startTime = 0;

// function Particles(c) {
//     var a = this;
//     var b = c.ease || "easeInOutExpo";
//     if (typeof window[b] !== "function") {
//         console.log("the function is not existed, it will use easeInOutExpo instead");
//         b = "easeInOutExpo"
//     }
//     this.init = (function() {
//         if (!c.canvasId || !document.getElementById(c.canvasId)) {
//             console.log("pls use the correct canvas id");
//             return
//         }
//         if (!c.imgUrl) {
//             console.log("pls use the correct img url");
//             return
//         }
//         canvas.self = document.getElementById(c.canvasId);
//         if (canvas.self.getContext) {
//             canvas.w = canvas.self.width;
//             canvas.h = canvas.self.height;
//             canvas.ctx = canvas.self.getContext("2d");
//             var d = new Image();
//             image.isLoaded = false;
//             d.onload = function() {
//                 image.self = d;
//                 image.w = d.width;
//                 image.h = d.height;
//                 image.x = c.imgX || parseInt(canvas.w / 2 - image.w / 2);
//                 image.y = c.imgY || 0;
//                 canvas.ctx.drawImage(image.self, image.x, image.y, image.w, image.h);
//                 image.imgData = canvas.ctx.getImageData(image.x, image.y, image.w, image.h);
//                 canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
//                 Particles.prototype._calculate({
//                     color: c.fillStyle || "rgba(26,145,211,1)",
//                     pOffset: c.particleOffset || 2,
//                     startX: c.startX || (image.x + image.w / 2),
//                     startY: c.startY || 0,
//                     duration: c.duration || 3000,
//                     interval: c.interval || 3,
//                     ease: b,
//                     ratioX: c.ratioX || 1,
//                     ratioY: c.ratioY || 1,
//                     cols: c.cols || 100,
//                     rows: c.rows || 100
//                 });
//                 image.isLoaded = true;
//                 startTime = new Date().getTime()
//             };
//             d.crossOrigin = "anonymous";
//             d.src = c.imgUrl
//         }
//     })();
//     this.draw = function() {
//         if (image.isLoaded) {
//             Particles.prototype._draw()
//         } else {
//             setTimeout(a.draw)
//         }
//     };
//     this.animate = function() {
//         if (image.isLoaded) {
//             Particles.prototype._animate(c.delay)
//         } else {
//             setTimeout(a.animate)
//         }
//     }
// }
// Particles.prototype = {
//     array: [],
//     _calculate: function(a) {
//         var k = image.imgData.length;
//         var f = image.imgData.data;
//         var m = a.cols,
//         o = a.rows;
//         var n = parseInt(image.w / m),
//         c = parseInt(image.h / o);
//         var g, e;
//         var l = 0;
//         var h = {};
//         for (var d = 0; d < m; d++) {
//             for (var b = 0; b < o; b++) {
//                 l = (b * c * image.w + d * n) * 4;
//                 if (f[l + 3] > 100) {
//                     h = {
//                         x0: a.startX,
//                         y0: a.startY,
//                         x1: image.x + d * n + (Math.random() - 0.5) * 10 * a.pOffset,
//                         y1: image.y + b * c + (Math.random() - 0.5) * 10 * a.pOffset,
//                         fillStyle: a.color,
//                         delay: b / 20,
//                         currTime: 0,
//                         count: 0,
//                         duration: parseInt(a.duration / 16.66) + 1,
//                         interval: parseInt(Math.random() * 10 * a.interval),
//                         ease: a.ease,
//                         ratioX: a.ratioX,
//                         ratioY: a.ratioY
//                     };
//                     if (f[l + 1] < 175 && f[l + 2] < 10) {
//                         h.fillStyle = "#ffa900"
//                     } else {
//                         if (f[l + 1] < 75 && f[l + 1] > 50) {
//                             h.fillStyle = "#ff4085"
//                         } else {
//                             if (f[l + 1] < 220 && f[l + 1] > 190) {
//                                 h.fillStyle = "#00cfff"
//                             } else {
//                                 if (f[l + 1] < 195 && f[l + 1] > 175) {
//                                     h.fillStyle = "#9abc1c"
//                                 }
//                             }
//                         }
//                     }
//                     this.array.push(h)
//                 }
//             }
//         }
//     },
//     _draw: function() {
//         canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
//         var b = this.array.length;
//         var a = null;
//         for (var c = 0; c < b; c++) {
//             a = this.array[c];
//             canvas.ctx.fillStyle = a.fillStyle;
//             canvas.ctx.fillRect(a.x1, a.y1, 1, 1)
//         }
//     },
//     _render: function() {
//         canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
//         var l = Particles.prototype.array;
//         var f = l.length;
//         var h = null;
//         var d, a;
//         var k = 0,
//         b = 0,
//         c = 0,
//         j = 1,
//         g = 1;
//         for (var e = 0; e < f; e++) {
//             h = l[e];
//             if (h.count++ > h.delay) {
//                 canvas.ctx.fillStyle = h.fillStyle;
//                 k = h.currTime;
//                 b = h.duration;
//                 c = h.interval;
//                 h.ratioX !== 1 ? j = h.ratioX + Math.random() * 2 : 1;
//                 h.ratioY !== 1 ? g = h.ratioY + Math.random() * 2 : 1;
//                 if (l[f - 1].duration + l[f - 1].interval < l[f - 1].currTime / 2) {
//                     cancelAnimationFrame(requestId);
//                     Particles.prototype._draw();
//                     return
//                 } else {
//                     if (k < b + c) {
//                         if (k >= c) {
//                             d = window[h.ease]((k - c) * j, h.x0, (h.x1 - h.x0) * j, b);
//                             a = window[h.ease]((k - c) * g, h.y0, (h.y1 - h.y0) * g, b);
//                             canvas.ctx.fillRect(d, a, 1, 1)
//                         }
//                     } else {
//                         canvas.ctx.fillRect(h.x1, h.y1, 1, 1)
//                     }
//                 }
//                 h.currTime += Math.random() + 0.5
//             }
//         }
//         requestId = requestAnimationFrame(Particles.prototype._render)
//     },
//     _animate: function(a) {
//         if (startTime + a < new Date().getTime()) {
//             requestId = requestAnimationFrame(Particles.prototype._render)
//         } else {
//             setTimeout(function() {
//                 Particles.prototype._animate(a)
//             })
//         }
//     }
// };
//缓动函数
var linear = function(e, a, g, f) {
    return g * e / f + a
},
easeInOutQuad = function(e, a, g, f) {
    e /= f / 2;
    if (e < 1) {
        return g / 2 * e * e + a
    }
    e--;
    return -g / 2 * (e * (e - 2) - 1) + a
},
easeOutQuad = function(e, a, g, f) {
    e /= f;
    return -g * e * (e - 2) + a
},
easeOutQuad = function(e, a, g, f) {
    e /= f;
    return -g * e * (e - 2) + a
},
easeInCubic = function(e, a, g, f) {
    e /= f;
    return g * e * e * e + a
},
easeOutCubic = function(e, a, g, f) {
    e /= f;
    e--;
    return g * (e * e * e + 1) + a
},
easeInOutCubic = function(e, a, g, f) {
    e /= f / 2;
    if (e < 1) {
        return g / 2 * e * e * e + a
    }
    e -= 2;
    return g / 2 * (e * e * e + 2) + a
},
easeInQuart = function(e, a, g, f) {
    e /= f;
    return g * e * e * e * e + a
},
easeOutQuart = function(e, a, g, f) {
    e /= f;
    e--;
    return -g * (e * e * e * e - 1) + a
},
easeInOutQuart = function(e, a, g, f) {
    e /= f / 2;
    if (e < 1) {
        return g / 2 * e * e * e * e + a
    }
    e -= 2;
    return -g / 2 * (e * e * e * e - 2) + a
},
easeInQuint = function(e, a, g, f) {
    e /= f;
    return g * e * e * e * e * e + a
},
easeOutQuint = function(e, a, g, f) {
    e /= f;
    e--;
    return g * (e * e * e * e * e + 1) + a
},
easeInOutQuint = function(e, a, g, f) {
    e /= f / 2;
    if (e < 1) {
        return g / 2 * e * e * e * e * e + a
    }
    e -= 2;
    return g / 2 * (e * e * e * e * e + 2) + a
},
easeInSine = function(e, a, g, f) {
    return -g * Math.cos(e / f * (Math.PI / 2)) + g + a
},
easeOutSine = function(e, a, g, f) {
    return g * Math.sin(e / f * (Math.PI / 2)) + a
},
easeInOutSine = function(e, a, g, f) {
    return -g / 2 * (Math.cos(Math.PI * e / f) - 1) + a
},
easeInExpo = function(e, a, g, f) {
    return g * Math.pow(2, 10 * (e / f - 1)) + a
},
easeOutExpo = function(e, a, g, f) {
    return g * (-Math.pow(2, -10 * e / f) + 1) + a
},
easeInOutExpo = function(e, a, g, f) {
    return g * (-Math.pow(2, -10 * e / f) + 1) + a
},
easeInCirc = function(e, a, g, f) {
    e /= f;
    return -g * (Math.sqrt(1 - e * e) - 1) + a
},
easeOutCirc = function(e, a, g, f) {
    e /= f;
    e--;
    return g * Math.sqrt(1 - e * e) + a
},
easeInOutCirc = function(e, a, g, f) {
    e /= f / 2;
    if (e < 1) {
        return -g / 2 * (Math.sqrt(1 - e * e) - 1) + a
    }
    e -= 2;
    return g / 2 * (Math.sqrt(1 - e * e) + 1) + a
},
easeInOutElastic = function(g, e, k, j, f, i) {
    if (g == 0) {
        return e
    }
    if ((g /= j / 2) == 2) {
        return e + k
    }
    if (!i) {
        i = j * (0.3 * 1.5)
    }
    if (!f || f < Math.abs(k)) {
        f = k;
        var h = i / 4
    } else {
        var h = i / (2 * Math.PI) * Math.asin(k / f)
    }
    if (g < 1) {
        return -0.5 * (f * Math.pow(2, 10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i)) + e
    }
    return f * Math.pow(2, -10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i) * 0.5 + k + e
},
easeInElastic = function(g, e, k, j, f, i) {
    if (g == 0) {
        return e
    }
    if ((g /= j) == 1) {
        return e + k
    }
    if (!i) {
        i = j * 0.3
    }
    if (!f || f < Math.abs(k)) {
        f = k;
        var h = i / 4
    } else {
        var h = i / (2 * Math.PI) * Math.asin(k / f)
    }
    return -(f * Math.pow(2, 10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i)) + e
},
easeOutElastic = function(g, e, k, j, f, i) {
    if (g == 0) {
        return e
    }
    if ((g /= j) == 1) {
        return e + k
    }
    if (!i) {
        i = j * 0.3
    }
    if (!f || f < Math.abs(k)) {
        f = k;
        var h = i / 4
    } else {
        var h = i / (2 * Math.PI) * Math.asin(k / f)
    }
    return (f * Math.pow(2, -10 * g) * Math.sin((g * j - h) * (2 * Math.PI) / i) + k + e)
},
easeInOutBack = function(e, a, h, g, f) {
    if (f == undefined) {
        f = 1.70158
    }
    if ((e /= g / 2) < 1) {
        return h / 2 * (e * e * (((f *= (1.525)) + 1) * e - f)) + a
    }
    return h / 2 * ((e -= 2) * e * (((f *= (1.525)) + 1) * e + f) + 2) + a
},
easeInBack = function(e, a, h, g, f) {
    if (f == undefined) {
        f = 1.70158
    }
    return h * (e /= g) * e * ((f + 1) * e - f) + a
},
easeOutBack = function(e, a, h, g, f) {
    if (f == undefined) {
        f = 1.70158
    }
    return h * ((e = e / g - 1) * e * ((f + 1) * e + f) + 1) + a
};
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