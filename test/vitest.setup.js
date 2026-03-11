/**
 * Vitest setup file — makes the sigplot bundle available globally,
 * matching how QUnit tests expect it (via <script> tag in HTML runner).
 */

// Provide a minimal canvas 2D context stub for jsdom (which lacks canvas support).
const noop = () => {};
const canvasCtxStub = {
    save: noop, restore: noop, beginPath: noop, closePath: noop,
    moveTo: noop, lineTo: noop, arc: noop, rect: noop,
    fill: noop, stroke: noop, clip: noop,
    clearRect: noop, fillRect: noop, strokeRect: noop,
    fillText: noop, strokeText: noop,
    setLineDash: noop, drawImage: noop, putImageData: noop,
    scale: noop, rotate: noop, translate: noop,
    transform: noop, setTransform: noop, resetTransform: noop,
    quadraticCurveTo: noop, bezierCurveTo: noop, arcTo: noop, ellipse: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => null,
    getLineDash: () => [],
    _fontSize: 10,
    measureText(text) {
        const len = (text || "").length;
        return {
            width: len * this._fontSize * 0.6,
            actualBoundingBoxAscent: this._fontSize * 0.8,
            actualBoundingBoxDescent: this._fontSize * 0.2,
        };
    },
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    isPointInPath: () => false, isPointInStroke: () => false,
    font: "", textAlign: "start", textBaseline: "alphabetic",
    fillStyle: "#000000", strokeStyle: "#000000",
    lineWidth: 1, lineCap: "butt", lineJoin: "miter", miterLimit: 10,
    shadowBlur: 0, shadowColor: "rgba(0, 0, 0, 0)", shadowOffsetX: 0, shadowOffsetY: 0,
    globalAlpha: 1, globalCompositeOperation: "source-over",
    lineDashOffset: 0, imageSmoothingEnabled: true, canvas: null,
};

const _origGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(type) {
    if (type === "2d") {
        const ctx = Object.create(canvasCtxStub);
        ctx.canvas = this;
        ctx._fontSize = 10;
        let _font = "";
        Object.defineProperty(ctx, "font", {
            get() { return _font; },
            set(val) {
                _font = val;
                const m = /^(\d+(?:\.\d+)?)px/.exec(val);
                if (m) { ctx._fontSize = parseFloat(m[1]); }
            },
            enumerable: true, configurable: true,
        });
        return ctx;
    }
    return _origGetContext.call(this, type);
};

// Import sigplot from source (Vite resolves deps)
import sigplot from "../js/sigplot.js";

// Make it globally available
globalThis.sigplot = sigplot;
