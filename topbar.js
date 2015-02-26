/*! topbar 0.1.3, 2014-12-09
 *  http://buunguyen.github.io/topbar
 *  Copyright (c) 2014 Buu Nguyen
 *  Licensed under the MIT License */
;(function (window, document) {
  'use strict'

    // https://gist.github.com/paulirish/1579671
  ;(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
      || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
  }());

  var canvas,
      bufferCanvas,
      progressTimerId,
      fadeTimerId,
      currentProgress,
      showing,

      addEvent = function (elem, type, handler) {
        if (elem.addEventListener) elem.addEventListener(type, handler, false)
        else if (elem.attachEvent) elem.attachEvent('on' + type, handler)
        else                       elem['on' + type] = handler
      },

      debounce = function (fn, delay) {
        var timerId
        return function () {
          if (timerId) clearTimeout(timerId)
          timerId = setTimeout(function () {
            timerId = null; fn()
          }, delay)
        }
      },

      options = {
        zIndex: 100001,
        autoRun: true,
        barThickness: 3,
        barColors: {
          '0': 'rgba(26, 188, 156, .9)',
          '.25': 'rgba(52, 152, 219, .9)',
          '.50': 'rgba(241, 196, 15, .9)',
          '.75': 'rgba(230, 126, 34, .9)',
          '1.0': 'rgba(211, 84, 0, .9)'
        },
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, .6)'
      },

      repaint = function () {
        var ctx = canvas.getContext('2d')
        var w = canvas.width
        var h = canvas.height
        var pw = (.5 + Math.ceil(currentProgress * w)) | 0
        ctx.clearRect(0, 0, w, h)
        ctx.drawImage(bufferCanvas, 0, 0, pw, h, 0, 0, pw, h)
      },

      paintBuffer = function () {
        if (!canvas) {
          canvas = document.createElement('canvas')
          canvas.style.position = 'fixed'
          canvas.style.top = canvas.style.left = canvas.style.right = canvas.style.margin = canvas.style.padding = 0
          canvas.style.zIndex = options.zIndex
          canvas.style.display = 'none'
          document.body.appendChild(canvas)

          bufferCanvas = document.createElement('canvas')

          addEvent(window, 'resize', debounce(function () {
            paintBuffer()
            if (showing) repaint()
          }, 100))
        }

        var w = window.innerWidth
        var h = options.barThickness * 5 // need space for shadow

        canvas.width = bufferCanvas.width = w
        canvas.height = bufferCanvas.height = h

        var ctx = bufferCanvas.getContext('2d')
        ctx.clearRect(0, 0, w, h)
        ctx.lineWidth = options.barThickness
        ctx.shadowBlur = options.shadowBlur
        ctx.shadowColor = options.shadowColor

        var lineGradient = ctx.createLinearGradient(0, 0, w, 0)
        for (var stop in options.barColors) {
          lineGradient.addColorStop(stop, options.barColors[stop])
        }
        ctx.strokeStyle = lineGradient

        ctx.beginPath()
        ctx.moveTo(0, options.barThickness / 2)
        ctx.lineTo(w, options.barThickness / 2)
        ctx.stroke()
      },

      topbar = {
        config: function (opts) {
          for (var key in opts)
            if (options.hasOwnProperty(key))
              options[key] = opts[key]
          paintBuffer()
          if (showing) repaint()
        },

        show: function () {
          if (showing) return
          showing = true

          if (!canvas) paintBuffer()

          if (fadeTimerId != null) {
            window.cancelAnimationFrame(fadeTimerId)
            fadeTimerId = null
          }

          canvas.style.display = 'block'
          canvas.style.opacity = 1

          topbar.progress(0)
          if (options.autoRun) {
            (function loop() {
              progressTimerId = window.requestAnimationFrame(loop)
              topbar.progress('+' + (.05 * Math.pow(1 - Math.sqrt(currentProgress), 2)))
            })()
          }
        },

        progress: function (to) {
          if (typeof to === "undefined")
            return currentProgress
          if (typeof to === "string") {
            to = (to.indexOf('+') >= 0 || to.indexOf('-') >= 0 ? currentProgress : 0) + parseFloat(to)
          }
          currentProgress = to > 1 ? 1 : to
          repaint()
          return currentProgress
        },

        hide: function () {
          if (!showing) return
          showing = false
          if (progressTimerId != null) {
            window.cancelAnimationFrame(progressTimerId)
            progressTimerId = null
          }
          (function loop() {
            if (topbar.progress('+.1') >= 1) {
              canvas.style.opacity -= .05
              if (canvas.style.opacity <= .05) {
                canvas.style.display = 'none'
                fadeTimerId = null
                return
              }
            }
            fadeTimerId = window.requestAnimationFrame(loop)
          })()
        }
      }

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = topbar
  }
  else if (typeof define === 'function' && define.amd) {
    define(function () { return topbar })
  }
  else {
    this.topbar = topbar
  }
}).call(this, window, document)