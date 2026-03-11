import { describe, it, expect } from "vitest";
import ColorMap from "../js/ColorMap.js";

// Simple two-color gradient from black to white for testing
const blackToWhite = [
    { pos: 0, red: 0, green: 0, blue: 0 },
    { pos: 100, red: 100, green: 100, blue: 100 }
];

// Three-color gradient for more complex tests
const redToGreenToBlue = [
    { pos: 0, red: 100, green: 0, blue: 0 },
    { pos: 50, red: 0, green: 100, blue: 0 },
    { pos: 100, red: 0, green: 0, blue: 100 }
];

describe("ColorMap extended tests", () => {

    describe("construction", () => {
        it("creates a colormap with default 500 colors", () => {
            const cm = new ColorMap(blackToWhite);
            expect(cm.getNColors()).toBe(500);
        });

        it("creates a colormap with custom ncolors=16", () => {
            const cm = new ColorMap(blackToWhite, { ncolors: 16 });
            expect(cm.getNColors()).toBe(16);
        });

        it("creates a colormap with custom ncolors=256", () => {
            const cm = new ColorMap(blackToWhite, { ncolors: 256 });
            expect(cm.getNColors()).toBe(256);
        });

        it("creates a colormap from three color stops", () => {
            const cm = new ColorMap(redToGreenToBlue);
            expect(cm.getNColors()).toBe(500);
        });
    });

    describe("setRange and getColorIndex", () => {
        it("maps values within range to color indices", () => {
            const cm = new ColorMap(blackToWhite);
            cm.setRange(0, 100);
            // At range low, index should be 0
            expect(cm.getColorIndex(0)).toBe(0);
            // At range high, index should be max
            expect(cm.getColorIndex(100)).toBe(cm.getNColors() - 1);
        });

        it("maps midpoint to approximately middle index", () => {
            const cm = new ColorMap(blackToWhite);
            cm.setRange(0, 100);
            const midIdx = cm.getColorIndex(50);
            const ncolors = cm.getNColors();
            expect(midIdx).toBeGreaterThan(ncolors * 0.4);
            expect(midIdx).toBeLessThan(ncolors * 0.6);
        });

        it("clamps values below range minimum to index 0", () => {
            const cm = new ColorMap(blackToWhite);
            cm.setRange(10, 90);
            expect(cm.getColorIndex(-100)).toBe(0);
        });

        it("clamps values above range maximum to max index", () => {
            const cm = new ColorMap(blackToWhite);
            cm.setRange(10, 90);
            expect(cm.getColorIndex(200)).toBe(cm.getNColors() - 1);
        });

        it("recalculates scale when range changes", () => {
            const cm = new ColorMap(blackToWhite);
            cm.setRange(0, 100);
            const idx1 = cm.getColorIndex(50);
            cm.setRange(0, 200);
            const idx2 = cm.getColorIndex(50);
            // With wider range, 50 should map to a lower index
            expect(idx2).toBeLessThan(idx1);
        });

        it("does not recalculate if range is the same", () => {
            const cm = new ColorMap(blackToWhite);
            cm.setRange(0, 100);
            const idx1 = cm.getColorIndex(50);
            cm.setRange(0, 100); // same range
            const idx2 = cm.getColorIndex(50);
            expect(idx1).toBe(idx2);
        });
    });

    describe("getColorByIndex", () => {
        it("returns a color object with red, green, blue properties", () => {
            const cm = new ColorMap(blackToWhite);
            const color = cm.getColorByIndex(0);
            expect(color).toHaveProperty("red");
            expect(color).toHaveProperty("green");
            expect(color).toHaveProperty("blue");
        });

        it("returns a color with hex and color properties", () => {
            const cm = new ColorMap(blackToWhite);
            const color = cm.getColorByIndex(0);
            expect(color).toHaveProperty("hex");
            expect(color).toHaveProperty("color");
        });

        it("returns correct color at first index (black)", () => {
            const cm = new ColorMap(blackToWhite);
            const color = cm.getColorByIndex(0);
            expect(color.red).toBe(0);
            expect(color.green).toBe(0);
            expect(color.blue).toBe(0);
        });

        it("returns correct color at last index (white)", () => {
            const cm = new ColorMap(blackToWhite);
            const lastIdx = cm.getNColors() - 1;
            const color = cm.getColorByIndex(lastIdx);
            expect(color.red).toBe(255);
            expect(color.green).toBe(255);
            expect(color.blue).toBe(255);
        });
    });

    describe("getNColors", () => {
        it("returns the total number of colors in the map", () => {
            const cm = new ColorMap(blackToWhite);
            expect(cm.getNColors()).toBe(500);
        });

        it("matches custom ncolors option", () => {
            const cm = new ColorMap(blackToWhite, { ncolors: 64 });
            expect(cm.getNColors()).toBe(64);
        });
    });

    describe("getColor", () => {
        it("returns a color object for a value in range", () => {
            const cm = new ColorMap(blackToWhite);
            cm.setRange(0, 100);
            const color = cm.getColor(50);
            expect(color).toHaveProperty("red");
            expect(color).toHaveProperty("green");
            expect(color).toHaveProperty("blue");
        });
    });

    describe("interpolate", () => {
        it("returns col1 when factor is 0", () => {
            const cm = new ColorMap(blackToWhite);
            const result = cm.interpolate(
                { red: 0, green: 0, blue: 0, alpha: 255 },
                { red: 255, green: 255, blue: 255, alpha: 255 },
                0
            );
            expect(result.red).toBe(0);
            expect(result.green).toBe(0);
            expect(result.blue).toBe(0);
        });

        it("returns col2 when factor is 1", () => {
            const cm = new ColorMap(blackToWhite);
            const result = cm.interpolate(
                { red: 0, green: 0, blue: 0, alpha: 255 },
                { red: 255, green: 255, blue: 255, alpha: 255 },
                1
            );
            expect(result.red).toBe(255);
            expect(result.green).toBe(255);
            expect(result.blue).toBe(255);
        });

        it("returns midpoint when factor is 0.5", () => {
            const cm = new ColorMap(blackToWhite);
            const result = cm.interpolate(
                { red: 0, green: 0, blue: 0, alpha: 255 },
                { red: 200, green: 100, blue: 50, alpha: 255 },
                0.5
            );
            expect(result.red).toBeCloseTo(100, 0);
            expect(result.green).toBeCloseTo(50, 0);
            expect(result.blue).toBeCloseTo(25, 0);
        });
    });

    describe("string color input", () => {
        it("creates a colormap from hex string colors", () => {
            const cm = new ColorMap([
                { pos: 0, color: "#000000" },
                { pos: 100, color: "#ffffff" }
            ]);
            expect(cm.getNColors()).toBe(500);
            const first = cm.getColorByIndex(0);
            expect(first.red).toBe(0);
            expect(first.green).toBe(0);
            expect(first.blue).toBe(0);
        });
    });
});
