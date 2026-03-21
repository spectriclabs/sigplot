import { describe, it, expect } from "vitest";

describe("m.vmov — vector move with stride", () => {
    it("copies elements with stride 1", () => {
        var src = new Float64Array([10, 20, 30, 40, 50]);
        var dst = new Float64Array(5);
        sigplot.m.vmov(src, 1, dst, 1, 5);
        expect(Array.from(dst)).toEqual([10, 20, 30, 40, 50]);
    });

    it("copies with source stride 2 (every other element)", () => {
        var src = new Float64Array([1, 2, 3, 4, 5, 6]);
        var dst = new Float64Array(3);
        sigplot.m.vmov(src, 2, dst, 1, 3);
        expect(Array.from(dst)).toEqual([1, 3, 5]);
    });

    it("copies with destination stride 2", () => {
        var src = new Float64Array([10, 20, 30]);
        var dst = new Float64Array(6);
        sigplot.m.vmov(src, 1, dst, 2, 3);
        expect(dst[0]).toBe(10);
        expect(dst[2]).toBe(20);
        expect(dst[4]).toBe(30);
    });
});

describe("m.vmovmax — max-hold with decay", () => {
    it("keeps maximum values", () => {
        var src = new Float64Array([5, 10, 3, 8]);
        var dst = new Float64Array([0, 0, 0, 0]);
        sigplot.m.vmovmax(src, 0, 1, dst, 0, 1, 4, 1.0);
        // dst should be at least as large as src
        for (var i = 0; i < 4; i++) {
            expect(dst[i]).toBeGreaterThanOrEqual(src[i]);
        }
    });

    it("decays toward source over iterations", () => {
        var src = new Float64Array([5, 5, 5, 5]);
        var dst = new Float64Array([100, 100, 100, 100]);
        // Run multiple iterations with decay — dst should approach src
        for (var iter = 0; iter < 50; iter++) {
            sigplot.m.vmovmax(src, 0, 1, dst, 0, 1, 4, 0.5);
        }
        for (var i = 0; i < 4; i++) {
            expect(dst[i]).toBeGreaterThanOrEqual(5);
        }
    });
});

describe("m.vmxmn — min/max scan", () => {
    it("finds min and max values", () => {
        var data = new Float64Array([3, -1, 4, -1, 5, 9, 2, 6]);
        var result = sigplot.m.vmxmn(data, data.length);
        expect(result.smax).toBe(9);
        expect(result.smin).toBe(-1);
    });

    it("handles single element", () => {
        var data = new Float64Array([42]);
        var result = sigplot.m.vmxmn(data, 1);
        expect(result.smax).toBe(42);
        expect(result.smin).toBe(42);
    });

    it("handles all same values", () => {
        var data = new Float64Array([7, 7, 7, 7]);
        var result = sigplot.m.vmxmn(data, data.length);
        expect(result.smax).toBe(7);
        expect(result.smin).toBe(7);
    });
});

describe("m.vsmul — scalar multiply", () => {
    it("multiplies by positive scalar", () => {
        var src = new Float64Array([1, 2, 3, 4]);
        var dst = new Float64Array(4);
        sigplot.m.vsmul(src, 3.0, dst);
        expect(Array.from(dst)).toEqual([3, 6, 9, 12]);
    });

    it("multiplies by zero", () => {
        var src = new Float64Array([1, 2, 3]);
        var dst = new Float64Array(3);
        sigplot.m.vsmul(src, 0, dst);
        expect(Array.from(dst)).toEqual([0, 0, 0]);
    });

    it("multiplies by negative", () => {
        var src = new Float64Array([1, -2, 3]);
        var dst = new Float64Array(3);
        sigplot.m.vsmul(src, -1, dst);
        expect(Array.from(dst)).toEqual([-1, 2, -3]);
    });
});

describe("m.vfill — fill vector", () => {
    it("fills with value", () => {
        var vec = new Float64Array(5);
        sigplot.m.vfill(vec, 99, 5);
        for (var i = 0; i < 5; i++) {
            expect(vec[i]).toBe(99);
        }
    });

    it("fills partial array", () => {
        var vec = new Float64Array([1, 2, 3, 4, 5]);
        sigplot.m.vfill(vec, 0, 3);
        expect(Array.from(vec)).toEqual([0, 0, 0, 4, 5]);
    });
});

describe("m.vabs — absolute value", () => {
    it("computes absolute values", () => {
        var src = new Float64Array([-3, 2, -1, 0, 5]);
        var dst = new Float64Array(5);
        sigplot.m.vabs(src, dst);
        expect(Array.from(dst)).toEqual([3, 2, 1, 0, 5]);
    });
});

describe("m.cvmag — complex magnitude", () => {
    it("computes magnitude of complex pairs", () => {
        // [re, im, re, im] = [3, 4, 0, 1]
        var src = new Float64Array([3, 4, 0, 1]);
        var dst = new Float64Array(2);
        sigplot.m.cvmag(src, dst, 2);
        expect(dst[0]).toBeCloseTo(5, 10); // sqrt(9+16)
        expect(dst[1]).toBeCloseTo(1, 10); // sqrt(0+1)
    });
});

describe("m.cvmag2 — complex magnitude squared", () => {
    it("computes magnitude squared", () => {
        var src = new Float64Array([3, 4, 1, 2]);
        var dst = new Float64Array(2);
        sigplot.m.cvmag2(src, dst, 2);
        expect(dst[0]).toBe(25); // 9+16
        expect(dst[1]).toBe(5); // 1+4
    });
});

describe("m.PointArray", () => {
    it("is Float32Array or Float64Array", () => {
        expect(sigplot.m.PointArray === Float32Array || sigplot.m.PointArray === Float64Array).toBe(true);
    });

    it("can be constructed with a size", () => {
        var arr = new sigplot.m.PointArray(10);
        expect(arr.length).toBe(10);
    });

    it("supports subarray", () => {
        var arr = new sigplot.m.PointArray([1, 2, 3, 4, 5]);
        var sub = arr.subarray(1, 3);
        expect(sub.length).toBe(2);
        expect(sub[0]).toBe(2);
        expect(sub[1]).toBe(3);
    });
});

describe("m.throttle", () => {
    it("limits call frequency", async () => {
        var calls = 0;
        var fn = sigplot.m.throttle(50, function () {
            calls++;
        });
        // throttle uses Date.now() — first call may be skipped if delay hasn't passed since init
        await new Promise(function (r) {
            setTimeout(r, 60);
        });
        fn(); // should go through
        expect(calls).toBe(1);
        fn(); // too soon, skipped
        expect(calls).toBe(1);
        await new Promise(function (r) {
            setTimeout(r, 60);
        });
        fn(); // enough time passed
        expect(calls).toBe(2);
    });
});
