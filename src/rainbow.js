/*! rainbow.js 0.0.2, 2013-08-01
 *  https://github.com/buunguyen/rainbow.js
 *  Copyright (c) 2013 Buu Nguyen
 *  Licensed under the Apache License, Version 2.0 */
;(function(window, document) {
    // https://gist.github.com/paulirish/1579671
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    var canvas, timerId, currentProgress, showing,
        addEvent = function(elem, type, handler) {
            if (elem.addEventListener) elem.addEventListener(type, handler, false)
            else if (elem.attachEvent) elem.attachEvent('on' + type, handler)
            else                       elem['on' + type] = handler
        },
        options = {
            lineThickness : 5,
            circleRadius  : 5,
            autoRun       : true,
            lineColors    : {
                '0'       : 'rgba(26,  188, 156, .5)',
                '.25'     : 'rgba(52,  152, 219, .5)',
                '.50'     : 'rgba(241, 196, 15,  .5)',
                '.75'     : 'rgba(230, 126, 34,  .5)',
                '1.0'     : 'rgba(211, 84,  0,   .5)'
            },
            circleColors  : {
                '0'       : 'rgba(230, 126, 34, .9)',
                '1.0'     : 'rgba(241, 196, 15, .9)'
            }
        },
        repaint = function() {
            canvas.width = window.innerWidth
            canvas.height = Math.max(options.lineThickness, options.circleRadius * 2)
            
            var ctx = canvas.getContext('2d'),
                center = {
                    x: Math.ceil(currentProgress * canvas.width),
                    y: canvas.height / 2
                }
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (options.lineThickness > 0) {
                var lineGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
                for (var stop in options.lineColors)
                    lineGradient.addColorStop(stop, options.lineColors[stop])
                ctx.lineWidth = options.lineThickness
                ctx.beginPath()
                ctx.moveTo(0, center.y)
                ctx.lineTo(center.x, center.y)
                ctx.strokeStyle = lineGradient
                ctx.stroke()
            }

            if (options.circleRadius > 0) {
                var circleGradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, options.circleRadius)
                for (var stop in options.circleColors)
                    circleGradient.addColorStop(stop, options.circleColors[stop])
                ctx.fillStyle = circleGradient
                ctx.arc(center.x, center.y, options.circleRadius, 0, Math.PI * 2, false)
                ctx.fill()
            }
        },
        createCanvas = function() {
            canvas = document.createElement('canvas')
            var style = canvas.style
            style.position = 'fixed'
            style.top = style.left = 0
            style['z-index'] = 100001
            style.display = 'none'
            document.body.appendChild(canvas)
            addEvent(window, "resize", repaint)
        },
        rainbow = {
            config: function(opts) {
                for (var key in opts)
                    if (options.hasOwnProperty(key))
                        options[key] = opts[key]
            },
            show: function() {
                if (showing) return
                showing = true
                if (!canvas) createCanvas()
                currentProgress = 0
                canvas.style.display = 'block'
                repaint()
                if (options.autoRun) {
                    (function loop() {
                        timerId = window.requestAnimationFrame(loop)
                        rainbow.progress('+' + (.05 * Math.pow(1-Math.sqrt(currentProgress), 2)))
                    })()
                }
            },
            progress: function(to) {
                if (typeof to === "undefined" || !showing)
                    return currentProgress
                if (typeof to === "string")
                    to = (to.indexOf('+') !== -1 || to.indexOf('-') !== -1)
                        ? eval('currentProgress' + to)
                        : parseFloat(to)
                currentProgress = to > 1 ? 1 : to
                repaint()
                return currentProgress
            },
            hide: function() {
                if (!showing) return
                showing = false
                canvas.style.display = 'none'
                if (timerId != null) {
                    window.cancelAnimationFrame(timerId)
                    timerId = null
                }
            }
        }

    if (typeof exports === 'object')
        module.exports = rainbow
    else if (typeof define === 'function' && define.amd)
        define(function() { return rainbow })
    else this.rainbow = rainbow
}).call(this, window, document)