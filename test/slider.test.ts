/**
 * @license
 * File: slider.test.ts
 *
 * Regression tests for the SliderPlugin.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import SliderPlugin from "../js/sigplot.slider.js";

describe("Slider regression", () => {
    describe("P2-1: Slider listener removal uses same function reference", () => {
        it("should pass the same callback reference to removeListener that was passed to addListener", () => {
            const addedListeners: Record<string, Function> = {};
            const removedListeners: Record<string, Function> = {};

            const mockPlot = {
                _Mx: {},
                addListener(what: string, cb: Function) {
                    addedListeners[what] = cb;
                },
                removeListener(what: string, cb: Function) {
                    removedListeners[what] = cb;
                }
            };

            const slider = new SliderPlugin({ direction: "vertical" });
            slider.init(mockPlot);

            // Listeners should be registered
            expect(addedListeners["mmove"]).toBeDefined();
            expect(addedListeners["mdown"]).toBeDefined();
            expect(addedListeners["mup"]).toBeDefined();

            slider.dispose();

            // The exact same function references must be used for removal
            expect(removedListeners["mmove"]).toBe(addedListeners["mmove"]);
            expect(removedListeners["mdown"]).toBe(addedListeners["mdown"]);
            expect(removedListeners["mup"]).toBe(addedListeners["mup"]);
        });
    });

    describe("P2-2: Slider 'both' mode uses AND (intersection) not OR", () => {
        it("should use && (not ||) for the 'both' direction proximity check", () => {
            const src = fs.readFileSync("js/sigplot.slider.ts", "utf-8");

            // Find all "both" direction blocks that check x and y proximity.
            // The actual source uses:
            //   (Math.abs(location.x! - evt.xpos) < ...) &&
            //   (Math.abs(location.y! - evt.ypos) < ...)
            // We verify && is used (AND/intersection), not || (OR/union).
            const bothProximityBlocks = src.match(
                /Math\.abs\(location\.x![\s\S]{0,80}?(\&\&|\|\|)[\s\S]{0,40}?Math\.abs\(location\.y!/g
            );
            expect(bothProximityBlocks).not.toBeNull();
            expect(bothProximityBlocks!.length).toBeGreaterThanOrEqual(1);

            // Every match must use && not ||
            for (const block of bothProximityBlocks!) {
                expect(block).toContain("&&");
                expect(block).not.toContain("||");
            }
        });
    });

    describe("P2-3: Slider drag guards preserved", () => {
        it("should check evt.slider_drag in onmousedown to prevent concurrent drags", () => {
            const src = fs.readFileSync("js/sigplot.slider.ts", "utf-8");

            // The onmousedown handler must contain a slider_drag guard
            const onmousedownMatch = src.match(/onmousedown[\s\S]*?evt\.slider_drag/);
            expect(onmousedownMatch).not.toBeNull();
        });
    });

    describe("P2-7: Slider preventDefault in drag handlers", () => {
        it("should call preventDefault in onmousedown when drag starts", () => {
            const src = fs.readFileSync("js/sigplot.slider.ts", "utf-8");

            // Extract the onmousedown method body
            const onmousedownMatch = src.match(/onmousedown[\s\S]*?preventDefault/);
            expect(onmousedownMatch).not.toBeNull();
        });

        it("should call preventDefault in onmouseup when dragging", () => {
            const src = fs.readFileSync("js/sigplot.slider.ts", "utf-8");

            // Extract the onmouseup method body
            const onmouseupMatch = src.match(/onmouseup[\s\S]*?preventDefault/);
            expect(onmouseupMatch).not.toBeNull();
        });
    });
});
