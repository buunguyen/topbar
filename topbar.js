var topbar = (function (exports) {
    'use strict';

    /*
     * @license MIT
     * topbar 3.0.0
     * http://buunguyen.github.io/topbar
     * Copyright (c) 2024 Buu Nguyen
     */
    const DEFAULT_BAR_COLORS = {
        0: "rgba(26,  188, 156, .9)",
        ".25": "rgba(52,  152, 219, .9)",
        ".50": "rgba(241, 196, 15,  .9)",
        ".75": "rgba(230, 126, 34,  .9)",
        "1.0": "rgba(211, 84,  0,   .9)",
    };
    class Topbar {
        container;
        canvas;
        progressTimerId = null;
        autoRun;
        showing;
        currentProgress;
        barThickness;
        barColors;
        shadowBlur;
        shadowColor;
        className;
        fadeTimerId = null;
        delayTimerId = null;
        constructor({ container, autoRun, barThickness, barColors, shadowBlur, shadowColor, className, } = {}) {
            this.container = container || document.body;
            this.autoRun = autoRun || true;
            this.shadowBlur = shadowBlur || 10;
            this.shadowColor = shadowColor || "rgba(0, 0, 0, .6)";
            this.barThickness = barThickness || 3;
            this.showing = false;
            this.currentProgress = 0;
            this.barColors = barColors || DEFAULT_BAR_COLORS;
            this.className = className;
        }
        show(delay) {
            if (this.showing)
                return;
            if (delay) {
                if (this.delayTimerId)
                    return;
                this.delayTimerId = window.setTimeout(() => this.show(), delay);
            }
            else {
                this.showing = true;
                if (this.fadeTimerId !== null)
                    window.cancelAnimationFrame(this.fadeTimerId);
                if (!this.canvas) {
                    this.createCanvas();
                }
                if (!this.canvas.parentElement) {
                    this.container.appendChild(this.canvas);
                }
                this.canvas.style.opacity = "1";
                this.canvas.style.display = "block";
                this.progress(0);
                if (this.autoRun) {
                    this.loopShow();
                }
            }
        }
        hide() {
            clearTimeout(this.delayTimerId);
            this.delayTimerId = null;
            if (!this.showing)
                return;
            this.showing = false;
            if (this.progressTimerId != null) {
                window.cancelAnimationFrame(this.progressTimerId);
                this.progressTimerId = null;
            }
            this.hideLoop();
        }
        progress(to) {
            if (typeof to === "undefined")
                return this.currentProgress;
            if (typeof to === "string") {
                const progressStarted = to.indexOf("+") >= 0 || to.indexOf("-") >= 0;
                to = (progressStarted ? this.currentProgress : 0) + parseFloat(to);
            }
            this.currentProgress = to > 1 ? 1 : to;
            this.repaint();
            return this.currentProgress;
        }
        hideLoop() {
            if (this.progress("+.1") >= 1 && this.canvas) {
                const opacity = parseFloat(this.canvas.style.opacity) - 0.05;
                this.canvas.style.opacity = opacity.toString();
                if (parseFloat(this.canvas.style.opacity) <= 0.05) {
                    this.canvas.style.display = "none";
                    this.fadeTimerId = null;
                    return;
                }
            }
            this.fadeTimerId = window.requestAnimationFrame(this.hideLoop.bind(this));
        }
        loopShow() {
            this.progressTimerId = window.requestAnimationFrame(this.loopShow.bind(this));
            this.progress("+" + 0.05 * Math.pow(1 - Math.sqrt(this.currentProgress), 2));
        }
        createCanvas() {
            this.canvas = document.createElement("canvas");
            const style = this.canvas.style;
            style.position = "fixed";
            style.top = "0";
            style.left = "0";
            style.right = "0";
            style.margin = "0";
            style.padding = "0";
            style.zIndex = "100001";
            style.display = "none";
            if (this.className) {
                this.canvas.classList.add(this.className);
            }
            window.addEventListener("resize", this.repaint, false);
        }
        repaint() {
            if (!this.canvas)
                return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = this.barThickness * 5; // need space for shadow
            const ctx = this.canvas.getContext("2d");
            if (!ctx)
                return;
            ctx.shadowBlur = this.shadowBlur;
            ctx.shadowColor = this.shadowColor;
            const lineGradient = ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            for (const stop in this.barColors) {
                lineGradient.addColorStop(parseFloat(stop), this.barColors[stop]);
            }
            ctx.lineWidth = this.barThickness;
            ctx.beginPath();
            ctx.moveTo(0, this.barThickness / 2);
            ctx.lineTo(Math.ceil(this.currentProgress * this.canvas.width), this.barThickness / 2);
            ctx.strokeStyle = lineGradient;
            ctx.stroke();
        }
    }
    let topbar;
    function config(options) {
        topbar = new Topbar(options);
        return topbar;
    }
    function show(delay) {
        if (!topbar) {
            topbar = new Topbar();
        }
        topbar.show(delay);
    }
    function hide() {
        if (!topbar) {
            topbar = new Topbar();
        }
        topbar.hide();
    }
    function progress(to) {
        if (!topbar) {
            topbar = new Topbar();
        }
        return topbar.progress(to);
    }

    exports.Topbar = Topbar;
    exports.config = config;
    exports.hide = hide;
    exports.progress = progress;
    exports.show = show;

    return exports;

})({});
