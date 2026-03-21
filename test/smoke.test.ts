import { describe, it, expect } from "vitest";

describe("sigplot build smoke test", () => {
    it("exports the sigplot namespace", () => {
        expect(sigplot).toBeDefined();
    });

    it("exposes the m (math) namespace", () => {
        expect(sigplot.m).toBeDefined();
    });

    it("exposes the mx (graphics) namespace", () => {
        expect(sigplot.mx).toBeDefined();
    });

    it("exposes Layer1D and Layer2D constructors", () => {
        expect(sigplot.Layer1D).toBeDefined();
        expect(sigplot.Layer2D).toBeDefined();
    });

    it("has a version string", () => {
        expect(typeof sigplot.version).toBe("string");
        expect(sigplot.version.length).toBeGreaterThan(0);
    });
});

describe("m namespace — math operations", () => {
    it("vmxmn finds min and max", () => {
        var data = new Float64Array([3, 1, 4, 1, 5, 9, 2, 6]);
        var result = sigplot.m.vmxmn(data, data.length);
        expect(result.smax).toBe(9);
        expect(result.smin).toBe(1);
    });

    it("vsmul multiplies by scalar", () => {
        var src = new Float64Array([1, 2, 3, 4]);
        var dst = new Float64Array(4);
        sigplot.m.vsmul(src, 2.0, dst);
        expect(dst[0]).toBe(2);
        expect(dst[1]).toBe(4);
        expect(dst[2]).toBe(6);
        expect(dst[3]).toBe(8);
    });

    it("vfill fills array with value", () => {
        var vec = new Float64Array(5);
        sigplot.m.vfill(vec, 42, 5);
        for (var i = 0; i < 5; i++) {
            expect(vec[i]).toBe(42);
        }
    });

    it("vmov copies with stride", () => {
        var src = new Float64Array([10, 20, 30, 40, 50]);
        var dst = new Float64Array(5);
        sigplot.m.vmov(src, 1, dst, 1, 5);
        expect(dst[0]).toBe(10);
        expect(dst[4]).toBe(50);
    });

    it("sec2tod converts seconds to time string", () => {
        expect(sigplot.m.sec2tod(0)).toBe("00:00:00.000000");
    });

    it("PointArray is Float32Array or Float64Array", () => {
        expect(sigplot.m.PointArray === Float32Array || sigplot.m.PointArray === Float64Array).toBe(true);
    });
});
