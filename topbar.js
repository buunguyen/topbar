/**
 * @license MIT
 * topbar 3.1.0
 * http://buunguyen.github.io/topbar
 * Copyright (c) 2025 Buu Nguyen
 */
(function (window, document) {
  "use strict";

  var canvas,
    currentProgress,
    showing,
    progressTimerId = null,
    fadeTimerId = null,
    delayTimerId = null,
    indefiniteTimerId = null,
    indefiniteOffset = 0,
    interpolateColor = function(color1, color2, ratio) {
      // Parse rgba colors and interpolate between them
      var rgba1 = color1.match(/rgba?\(([^)]+)\)/);
      var rgba2 = color2.match(/rgba?\(([^)]+)\)/);
      
      if (!rgba1 || !rgba2) return color1;
      
      var values1 = rgba1[1].split(',').map(function(x) { return parseFloat(x.trim()); });
      var values2 = rgba2[1].split(',').map(function(x) { return parseFloat(x.trim()); });
      
      var r = Math.round(values1[0] + (values2[0] - values1[0]) * ratio);
      var g = Math.round(values1[1] + (values2[1] - values1[1]) * ratio);
      var b = Math.round(values1[2] + (values2[2] - values1[2]) * ratio);
      var a = values1[3] + (values2[3] - values1[3]) * ratio;
      
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a.toFixed(2) + ')';
    },
    addEvent = function (elem, type, handler) {
      if (elem.addEventListener) elem.addEventListener(type, handler, false);
      else if (elem.attachEvent) elem.attachEvent("on" + type, handler);
      else elem["on" + type] = handler;
    },
    options = {
      indeterminate: 'grow',
      barThickness: 3,
      barColors: {
        0: "rgba(26,  188, 156, .9)",
        ".25": "rgba(52,  152, 219, .9)",
        ".50": "rgba(241, 196, 15,  .9)",
        ".75": "rgba(230, 126, 34,  .9)",
        "1.0": "rgba(211, 84,  0,   .9)",
      },
      shadowBlur: 10,
      shadowColor: "rgba(0,   0,   0,   .6)",
      className: null,
    },
    repaintGrowing = function () {
      canvas.width = window.innerWidth;
      canvas.height = options.barThickness * 5; // need space for shadow

      var ctx = canvas.getContext("2d");
      ctx.shadowBlur = options.shadowBlur;
      ctx.shadowColor = options.shadowColor;

      var lineGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      for (var stop in options.barColors)
        lineGradient.addColorStop(stop, options.barColors[stop]);
      ctx.lineWidth = options.barThickness;
      ctx.beginPath();
      ctx.moveTo(0, options.barThickness / 2);
      ctx.lineTo(
        Math.ceil(currentProgress * canvas.width),
        options.barThickness / 2
      );
      ctx.strokeStyle = lineGradient;
      ctx.stroke();
    },
    repaintRolling = function () {
      canvas.width = window.innerWidth;
      canvas.height = options.barThickness * 5; // need space for shadow

      var ctx = canvas.getContext("2d");
      ctx.shadowBlur = options.shadowBlur;
      ctx.shadowColor = options.shadowColor;

      // Create a moving gradient that flows smoothly
      var gradientWidth = canvas.width * 2.5;
      var gradient = ctx.createLinearGradient(
        indefiniteOffset, 
        0, 
        indefiniteOffset + gradientWidth, 
        0
      );
      
      // Use user colors in a flowing pattern
      var colorKeys = Object.keys(options.barColors).sort(function(a, b) {
        return parseFloat(a) - parseFloat(b);
      });
      
      if (colorKeys.length > 0) {
        // Create a repeating pattern of user colors
        for (var cycle = 0; cycle < 3; cycle++) {
          for (var i = 0; i < colorKeys.length; i++) {
            var stop = colorKeys[i];
            var position = (cycle * colorKeys.length + i) / (3 * colorKeys.length - 1);
            gradient.addColorStop(position, options.barColors[stop]);
          }
        }
        // Add the first color again to complete the loop
        gradient.addColorStop(1, options.barColors[colorKeys[0]]);
      } else {
        // Fallback colors
        gradient.addColorStop(0, "rgba(26, 188, 156, 0.9)");
        gradient.addColorStop(0.25, "rgba(52, 152, 219, 0.9)");
        gradient.addColorStop(0.5, "rgba(241, 196, 15, 0.9)");
        gradient.addColorStop(0.75, "rgba(230, 126, 34, 0.9)");
        gradient.addColorStop(1, "rgba(26, 188, 156, 0.9)");
      }
      
      ctx.lineWidth = options.barThickness;
      ctx.beginPath();
      ctx.moveTo(0, options.barThickness / 2);
      ctx.lineTo(canvas.width, options.barThickness / 2);
      ctx.strokeStyle = gradient;
      ctx.stroke();
    },
    createCanvas = function () {
      canvas = document.createElement("canvas");
      var style = canvas.style;
      style.position = "fixed";
      style.top = style.left = style.right = style.margin = style.padding = 0;
      style.zIndex = 100001;
      canvas.hidden = true;
      if (options.className) canvas.classList.add(options.className);
      addEvent(window, "resize", function() {
        if (options.indeterminate === 'roll') {
          repaintRolling();
        } else {
          repaintGrowing();
        }
      });
    },
    topbar = {
      config: function (opts) {
        for (var key in opts)
          if (options.hasOwnProperty(key)) options[key] = opts[key];
      },
      show: function (delay) {
        if (showing) return;
        if (delay) {
          if (delayTimerId) return;
          delayTimerId = setTimeout(() => topbar.show(), delay);
        } else {
          showing = true;
          if (fadeTimerId !== null) window.cancelAnimationFrame(fadeTimerId);
          if (!canvas) createCanvas();
          if (!canvas.parentElement) document.body.appendChild(canvas);
          canvas.style.opacity = 1;
          canvas.hidden = false;
          topbar.progress(0);
          
          if (options.indeterminate === 'grow') {
            // Grow mode: progress that slows down and never reaches full width
            (function loop() {
              progressTimerId = window.requestAnimationFrame(loop);
              topbar.progress(
                "+" + 0.05 * Math.pow(1 - Math.sqrt(currentProgress), 2)
              );
            })();
          } else if (options.indeterminate === 'roll') {
            // Roll mode: full bar with moving gradient
            currentProgress = 1; // Set to full width
            indefiniteOffset = 0;
            repaintRolling(); // Initial paint
            (function loop() {
              indefiniteTimerId = window.requestAnimationFrame(loop);
              indefiniteOffset += 10; // Smooth, obvious movement
              if (indefiniteOffset > canvas.width * 0.5) {
                indefiniteOffset = -canvas.width * 2.0;
              }
              repaintRolling();
            })();
          }
        }
      },
      progress: function (to) {
        if (typeof to === "undefined") return currentProgress;
        if (typeof to === "string") {
          to =
            (to.indexOf("+") >= 0 || to.indexOf("-") >= 0
              ? currentProgress
              : 0) + parseFloat(to);
        }
        currentProgress = to > 1 ? 1 : to;
        if (options.indeterminate === 'roll') {
          repaintRolling();
        } else {
          repaintGrowing();
        }
        return currentProgress;
      },
      hide: function () {
        clearTimeout(delayTimerId);
        delayTimerId = null;
        if (!showing) return;
        showing = false;
        if (progressTimerId != null) {
          window.cancelAnimationFrame(progressTimerId);
          progressTimerId = null;
        }
        if (indefiniteTimerId != null) {
          window.cancelAnimationFrame(indefiniteTimerId);
          indefiniteTimerId = null;
        }
        (function loop() {
          if (topbar.progress("+.1") >= 1) {
            canvas.style.opacity -= 0.05;
            if (canvas.style.opacity <= 0.05) {
              canvas.hidden = true;
              fadeTimerId = null;
              return;
            }
          }
          fadeTimerId = window.requestAnimationFrame(loop);
        })();
      },
    };

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = topbar;
  } else if (typeof define === "function" && define.amd) {
    define(function () {
      return topbar;
    });
  } else {
    this.topbar = topbar;
  }
}.call(this, window, document));
