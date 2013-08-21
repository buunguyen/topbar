/*! rainbow.js 0.0.3, 2013-08-20
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

    var canvas, progressTimerId, fadeTimeId, currentProgress, showing,
        addEvent = function(elem, type, handler) {
            if (elem.addEventListener) elem.addEventListener(type, handler, false)
            else if (elem.attachEvent) elem.attachEvent('on' + type, handler)
            else                       elem['on' + type] = handler
        },
        options = {
            autoRun       : true,
            barThickness  : 3,
            barColors     : {
                '0'       : 'rgba(26,  188, 156, .7)',
                '.25'     : 'rgba(52,  152, 219, .7)',
                '.50'     : 'rgba(241, 196, 15,  .7)',
                '.75'     : 'rgba(230, 126, 34,  .7)',
                '1.0'     : 'rgba(211, 84,  0,   .7)'
            },
            shadowThickness : 1,
            shadowColor     : '#bbb'
        },
        repaint = function() {
            canvas.width = window.innerWidth
            canvas.height = options.barThickness + options.shadowThickness
            var ctx = canvas.getContext('2d')
            if (options.barThickness > 0) {
                if (options.shadowThickness > 0) {
                    ctx.shadowColor = options.shadowColor
                    ctx.shadowBlur = options.shadowThickness
                    ctx.shadowOffsetY = options.shadowThickness
                }
                var lineGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
                for (var stop in options.barColors)
                    lineGradient.addColorStop(stop, options.barColors[stop])
                ctx.lineWidth = options.barThickness
                ctx.beginPath()
                ctx.moveTo(0, options.barThickness/2)
                ctx.lineTo(Math.ceil(currentProgress * canvas.width), options.barThickness/2)
                ctx.strokeStyle = lineGradient
                ctx.stroke()
            }
        },
        createCanvas = function() {
            canvas = document.createElement('canvas')
            var style = canvas.style
            style.position = 'fixed'
            style.top = style.left = 0
            style.zIndex = 100001
            style.display = 'none'
            document.body.appendChild(canvas)
            addEvent(window, 'resize', repaint)
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
                if (fadeTimeId !== null)
                    window.cancelAnimationFrame(fadeTimeId) 
                if (!canvas) createCanvas()
                canvas.style.opacity = 1
                canvas.style.display = 'block'
                rainbow.progress(0)
                if (options.autoRun) {
                    (function loop() {
                        progressTimerId = window.requestAnimationFrame(loop)
                        rainbow.progress('+' + (.05 * Math.pow(1-Math.sqrt(currentProgress), 2)))
                    })()
                }
            },
            progress: function(to) {
                if (typeof to === "undefined")
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
                if (progressTimerId != null) {
                    window.cancelAnimationFrame(progressTimerId)
                    progressTimerId = null
                }
                (function loop() {
                    if (rainbow.progress('+.1') >= 1) {
                        canvas.style.opacity -= .04
                        if (canvas.style.opacity <= 0) {
                            canvas.style.display = 'none'
                            fadeTimeId = null
                            return
                        } 
                    }
                    fadeTimeId = window.requestAnimationFrame(loop)
                })()
            }
        }

    if (typeof exports === 'object')
        module.exports = rainbow
    else if (typeof define === 'function' && define.amd)
        define(function() { return rainbow })
    else this.rainbow = rainbow
}).call(this, window, document)