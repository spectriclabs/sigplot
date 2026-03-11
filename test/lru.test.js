import { describe, it, expect } from "vitest";
import LRU from "../js/lru.js";

describe("LRU cache", () => {
    it("stores and retrieves values", () => {
        var cache = new LRU(10);
        cache.set("a", 1);
        cache.set("b", 2);
        expect(cache.get("a")).toBe(1);
        expect(cache.get("b")).toBe(2);
    });

    it("returns undefined for missing keys", () => {
        var cache = new LRU(10);
        expect(cache.get("missing")).toBeUndefined();
    });

    it("evicts least recently used when at capacity", () => {
        var cache = new LRU(3);
        cache.set("a", 1);
        cache.set("b", 2);
        cache.set("c", 3);
        // Cache is full: [a, b, c]
        cache.set("d", 4);
        // "a" should be evicted (LRU)
        expect(cache.get("a")).toBeUndefined();
        expect(cache.get("b")).toBe(2);
        expect(cache.get("c")).toBe(3);
        expect(cache.get("d")).toBe(4);
    });

    it("get() refreshes recency", () => {
        var cache = new LRU(3);
        cache.set("a", 1);
        cache.set("b", 2);
        cache.set("c", 3);
        // Access "a" to make it most recent
        cache.get("a");
        // Now add "d" — "b" should be evicted (oldest)
        cache.set("d", 4);
        expect(cache.get("a")).toBe(1);
        expect(cache.get("b")).toBeUndefined();
    });

    it("overwrites existing keys without growing", () => {
        var cache = new LRU(2);
        cache.set("a", 1);
        cache.set("b", 2);
        cache.set("a", 10); // overwrite
        expect(cache.get("a")).toBe(10);
        // Should not have evicted "b"
        expect(cache.get("b")).toBe(2);
    });

    it("handles capacity of 1", () => {
        var cache = new LRU(1);
        cache.set("a", 1);
        expect(cache.get("a")).toBe(1);
        cache.set("b", 2);
        expect(cache.get("a")).toBeUndefined();
        expect(cache.get("b")).toBe(2);
    });

    it("works with non-string keys", () => {
        var cache = new LRU(5);
        cache.set(42, "number-key");
        cache.set(null, "null-key");
        expect(cache.get(42)).toBe("number-key");
        expect(cache.get(null)).toBe("null-key");
    });

    it("stores objects and arrays as values", () => {
        var cache = new LRU(5);
        var obj = { x: 1, y: 2 };
        var arr = [1, 2, 3];
        cache.set("obj", obj);
        cache.set("arr", arr);
        expect(cache.get("obj")).toBe(obj);
        expect(cache.get("arr")).toBe(arr);
    });
});
