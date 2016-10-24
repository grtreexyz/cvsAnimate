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
        default = {
            width: elem.clientWidth,
            height: elem.clientHeight,
            duration: 1000,
            animationInterval: 40
        }
        cvsAnimate.tools.extend(default, options);
        var c = document.createElement('canvas');
        c.width = default.width;
        c.height = default.height;
        var wb = Math.round(c.width / (default.duration / default.animationInterval)); //宽的步长
        var hb = Math.round(c.height / (default.duration / default.animationInterval)); //宽的步长
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        var img = new Image();
        img.onload = function() {
            var ix = 0,
                iy = 0;
            var IntervalOut = setInterval(function() {
                ctx.drawImage(img, ix, 0, buchang, ch, ix, 0, buchang, ch);
                if (ix >= cw) clearInterval(IntervalOut);
                else ix += buchang;
                if (ix > cw) ix = cw;
            }, options.animationInterval);
        }
        img.src = imgurl;
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