import { describe, it, expect } from "vitest";
import common from "../js/common.js";

describe("common.dashOn / common.dashOff", () => {
    it("sets line dash on context", () => {
        var dashes = null;
        var ctx = {
            setLineDash: function(d) { dashes = d; }
        };
        var result = common.dashOn(ctx, 5, 3);
        expect(result).toBe(true);
        expect(dashes).toEqual([5, 3]);
    });

    it("clears line dash", () => {
        var dashes = [5, 3];
        var ctx = {
            setLineDash: function(d) { dashes = d; }
        };
        common.dashOff(ctx);
        expect(dashes).toEqual([]);
    });
});

describe("common.getKeyCode", () => {
    it("returns charCode when available", () => {
        expect(common.getKeyCode({ charCode: 65, keyCode: 0 })).toBe(65);
    });

    it("falls back to keyCode", () => {
        expect(common.getKeyCode({ charCode: 0, keyCode: 13 })).toBe(13);
    });
});

describe("common.update", () => {
    it("copies properties from src to dst", () => {
        var dst = { a: 1, b: 2 };
        common.update(dst, { b: 20, c: 30 });
        expect(dst.a).toBe(1);
        expect(dst.b).toBe(20);
        expect(dst.c).toBe(30);
    });

    it("recursively updates nested objects", () => {
        var dst = { nested: { x: 1, y: 2 } };
        common.update(dst, { nested: { y: 20 } });
        expect(dst.nested.x).toBe(1);
        expect(dst.nested.y).toBe(20);
    });

    it("returns dst for chaining", () => {
        var dst = {};
        var result = common.update(dst, { a: 1 });
        expect(result).toBe(dst);
    });
});

describe("common.debounce", () => {
    it("delays execution", async () => {
        var calls = 0;
        var fn = common.debounce(function() { calls++; }, 50);
        fn();
        fn();
        fn();
        expect(calls).toBe(0);
        await new Promise(function(r) { setTimeout(r, 100); });
        expect(calls).toBe(1);
    });

    it("immediate mode fires on leading edge", () => {
        var calls = 0;
        var fn = common.debounce(function() { calls++; }, 100, true);
        fn();
        expect(calls).toBe(1);
    });
});

describe("common.uuidv4", () => {
    it("returns a string in UUID v4 format", () => {
        var uuid = common.uuidv4();
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it("generates unique values", () => {
        var a = common.uuidv4();
        var b = common.uuidv4();
        expect(a).not.toBe(b);
    });
});
