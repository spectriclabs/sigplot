import { describe, it, expect } from "vitest";

describe("m extended math functions", () => {

    // --- log10 ---
    describe("log10", () => {
        it("returns log base 10 for normal positive values", () => {
            expect(sigplot.m.log10(100)).toBeCloseTo(2, 10);
            expect(sigplot.m.log10(1000)).toBeCloseTo(3, 10);
            expect(sigplot.m.log10(1)).toBeCloseTo(0, 10);
            expect(sigplot.m.log10(10)).toBeCloseTo(1, 10);
        });

        it("clamps to lo_thresh for zero", () => {
            const result = sigplot.m.log10(0);
            // Should use default lo_thresh=1e-20, so result = log10(1e-20) = -20
            expect(result).toBeCloseTo(-20, 0);
        });

        it("clamps to lo_thresh for negative values", () => {
            const result = sigplot.m.log10(-5);
            expect(result).toBeCloseTo(-20, 0);
        });

        it("uses custom lo_thresh when provided", () => {
            const result = sigplot.m.log10(0, 1e-10);
            expect(result).toBeCloseTo(-10, 0);
        });
    });

    // --- vlog10 ---
    describe("vlog10", () => {
        it("applies log10 to each element of an array", () => {
            const src = [1, 10, 100, 1000];
            const dst = new Array(4);
            sigplot.m.vlog10(src, undefined, dst);
            expect(dst[0]).toBeCloseTo(0, 10);
            expect(dst[1]).toBeCloseTo(1, 10);
            expect(dst[2]).toBeCloseTo(2, 10);
            expect(dst[3]).toBeCloseTo(3, 10);
        });

        it("clamps values below threshold", () => {
            const src = [0, -1, 1e-30];
            const dst = new Array(3);
            sigplot.m.vlog10(src, 1e-20, dst);
            expect(dst[0]).toBeCloseTo(-20, 0);
            expect(dst[1]).toBeCloseTo(-20, 0);
            expect(dst[2]).toBeCloseTo(-20, 0);
        });

        it("overwrites src when dst is not provided", () => {
            const src = [10, 100];
            sigplot.m.vlog10(src);
            expect(src[0]).toBeCloseTo(1, 10);
            expect(src[1]).toBeCloseTo(2, 10);
        });
    });

    // --- vlogscale ---
    describe("vlogscale", () => {
        it("applies log10 * dbscale=10 to each element", () => {
            const src = [10, 100];
            const dst = new Array(2);
            sigplot.m.vlogscale(src, undefined, 10, dst);
            // log10(10)*10 = 10, log10(100)*10 = 20
            expect(dst[0]).toBeCloseTo(10, 5);
            expect(dst[1]).toBeCloseTo(20, 5);
        });

        it("applies log10 * dbscale=20 to each element", () => {
            const src = [10, 100];
            const dst = new Array(2);
            sigplot.m.vlogscale(src, undefined, 20, dst);
            // log10(10)*20 = 20, log10(100)*20 = 40
            expect(dst[0]).toBeCloseTo(20, 5);
            expect(dst[1]).toBeCloseTo(40, 5);
        });

        it("uses default dbscale=1 when not specified", () => {
            const src = [1000];
            const dst = new Array(1);
            sigplot.m.vlogscale(src, undefined, undefined, dst);
            expect(dst[0]).toBeCloseTo(3, 5);
        });
    });

    // --- cvmag2logscale ---
    describe("cvmag2logscale", () => {
        it("computes magnitude squared then logscale for complex pairs", () => {
            // Complex pair [3, 4] => mag^2 = 9+16 = 25
            // log10(25) * 10 ≈ 13.979
            const src = [3, 4];
            const dst = new Array(1);
            sigplot.m.cvmag2logscale(src, undefined, 10, dst);
            expect(dst[0]).toBeCloseTo(Math.log(25) / Math.log(10) * 10, 5);
        });

        it("handles multiple complex pairs", () => {
            // [1,0] => mag^2=1, log10(1)*10=0
            // [0,1] => mag^2=1, log10(1)*10=0
            const src = [1, 0, 0, 1];
            const dst = new Array(2);
            sigplot.m.cvmag2logscale(src, undefined, 10, dst);
            expect(dst[0]).toBeCloseTo(0, 5);
            expect(dst[1]).toBeCloseTo(0, 5);
        });

        it("respects lo_thresh for small magnitudes", () => {
            const src = [0, 0];
            const dst = new Array(1);
            sigplot.m.cvmag2logscale(src, 1e-20, 10, dst);
            // mag^2=0, clamped to 1e-20, log10(1e-20)*10 = -200
            expect(dst[0]).toBeCloseTo(-200, 0);
        });
    });

    // --- cvpha ---
    describe("cvpha", () => {
        it("returns 0 for [1, 0]", () => {
            const dest = new Array(1);
            sigplot.m.cvpha([1, 0], dest, 1);
            expect(dest[0]).toBeCloseTo(0, 10);
        });

        it("returns π/2 for [0, 1]", () => {
            const dest = new Array(1);
            sigplot.m.cvpha([0, 1], dest, 1);
            // (0,0) is special-cased: re becomes 1, so atan2(1,1) = π/4
            // But [0,1] has re=0, im=1 — re===0 and im!==0, so no special case
            expect(dest[0]).toBeCloseTo(Math.PI / 2, 10);
        });

        it("returns π for [-1, 0]", () => {
            const dest = new Array(1);
            sigplot.m.cvpha([-1, 0], dest, 1);
            // re=-1, im=0, not the (0,0) case
            expect(dest[0]).toBeCloseTo(Math.PI, 10);
        });

        it("returns π/4 for [1, 1]", () => {
            const dest = new Array(1);
            sigplot.m.cvpha([1, 1], dest, 1);
            expect(dest[0]).toBeCloseTo(Math.PI / 4, 10);
        });

        it("returns 0 for [0, 0] (special case: re set to 1)", () => {
            const dest = new Array(1);
            sigplot.m.cvpha([0, 0], dest, 1);
            // Special case: re=0,im=0 → re becomes 1 → atan2(0,1) = 0
            expect(dest[0]).toBeCloseTo(0, 10);
        });
    });

    // --- cvphad ---
    describe("cvphad", () => {
        it("returns 0 degrees for [1, 0]", () => {
            const dest = new Array(1);
            sigplot.m.cvphad([1, 0], dest, 1);
            expect(dest[0]).toBeCloseTo(0, 10);
        });

        it("returns 90 degrees for [0, 1]", () => {
            const dest = new Array(1);
            sigplot.m.cvphad([0, 1], dest, 1);
            expect(dest[0]).toBeCloseTo(90, 10);
        });

        it("returns 180 degrees for [-1, 0]", () => {
            const dest = new Array(1);
            sigplot.m.cvphad([-1, 0], dest, 1);
            expect(dest[0]).toBeCloseTo(180, 10);
        });

        it("returns 45 degrees for [1, 1]", () => {
            const dest = new Array(1);
            sigplot.m.cvphad([1, 1], dest, 1);
            expect(dest[0]).toBeCloseTo(45, 10);
        });

        it("returns 0 degrees for [0, 0] (special case)", () => {
            const dest = new Array(1);
            sigplot.m.cvphad([0, 0], dest, 1);
            expect(dest[0]).toBeCloseTo(0, 10);
        });
    });

    // --- trunc ---
    describe("trunc", () => {
        it("truncates positive float toward zero", () => {
            expect(sigplot.m.trunc(3.7)).toBe(3);
        });

        it("truncates negative float toward zero", () => {
            expect(sigplot.m.trunc(-3.7)).toBe(-3);
        });

        it("returns 0 for 0", () => {
            expect(sigplot.m.trunc(0)).toBe(0);
        });

        it("returns integer unchanged", () => {
            expect(sigplot.m.trunc(5)).toBe(5);
            expect(sigplot.m.trunc(-5)).toBe(-5);
        });
    });

    // --- sign ---
    describe("sign", () => {
        it("returns -|a1| when a2 is negative", () => {
            expect(sigplot.m.sign(3, -1)).toBe(-3);
        });

        it("returns |a1| when a2 is positive", () => {
            expect(sigplot.m.sign(-3, 1)).toBe(3);
        });

        it("returns |a1| when a2 is zero", () => {
            expect(sigplot.m.sign(5, 0)).toBe(5);
        });

        it("handles negative a1 with negative a2", () => {
            expect(sigplot.m.sign(-7, -2)).toBe(-7);
        });
    });

    // --- bound ---
    describe("bound", () => {
        it("returns value when within bounds", () => {
            expect(sigplot.m.bound(5, 0, 10)).toBe(5);
        });

        it("clamps to lower bound", () => {
            expect(sigplot.m.bound(-1, 0, 10)).toBe(0);
        });

        it("clamps to upper bound", () => {
            expect(sigplot.m.bound(15, 0, 10)).toBe(10);
        });

        it("returns bound when at exact boundary", () => {
            expect(sigplot.m.bound(0, 0, 10)).toBe(0);
            expect(sigplot.m.bound(10, 0, 10)).toBe(10);
        });
    });

    // --- mult_prefix ---
    describe("mult_prefix", () => {
        it("returns empty string for 1", () => {
            expect(sigplot.m.mult_prefix(1)).toBe("");
        });

        it("returns K for 1e3", () => {
            expect(sigplot.m.mult_prefix(1e3)).toBe("K");
        });

        it("returns M for 1e6", () => {
            expect(sigplot.m.mult_prefix(1e6)).toBe("M");
        });

        it("returns G for 1e9", () => {
            expect(sigplot.m.mult_prefix(1e9)).toBe("G");
        });

        it("returns T for 1e12", () => {
            expect(sigplot.m.mult_prefix(1e12)).toBe("T");
        });

        it("returns m for 1e-3", () => {
            expect(sigplot.m.mult_prefix(1e-3)).toBe("m");
        });

        it("returns u for 1e-6", () => {
            expect(sigplot.m.mult_prefix(1e-6)).toBe("u");
        });

        it("returns n for 1e-9", () => {
            expect(sigplot.m.mult_prefix(1e-9)).toBe("n");
        });

        it("returns p for 1e-12", () => {
            expect(sigplot.m.mult_prefix(1e-12)).toBe("p");
        });

        it("returns da for 10", () => {
            expect(sigplot.m.mult_prefix(10)).toBe("da");
        });

        it("returns d for 0.1", () => {
            expect(sigplot.m.mult_prefix(0.1)).toBe("d");
        });

        it("returns h for 100", () => {
            expect(sigplot.m.mult_prefix(100)).toBe("h");
        });

        it("returns c for 0.01", () => {
            expect(sigplot.m.mult_prefix(0.01)).toBe("c");
        });

        it("returns ? for unknown multiplier", () => {
            expect(sigplot.m.mult_prefix(42)).toBe("?");
        });
    });

    // --- trim_name ---
    // trim_name finds the first path separator ('/', ']', ':') and the first '.'
    // after it, then returns the substring between them.
    describe("trim_name", () => {
        it("extracts filename when no path separators", () => {
            // No '/', ']', or ':' → i=-1, so starts at 0; '.' at position 4
            expect(sigplot.m.trim_name("file.tmp")).toBe("file");
        });

        it("extracts filename from single-level unix path", () => {
            // The function uses substr(i+1, i+j+1), so for "/file.tmp"
            // i=0, j=4 → substr(1,5) = "file."
            const result = sigplot.m.trim_name("/file.tmp");
            expect(result).toContain("file");
        });

        it("extracts filename from VMS-style path with ]", () => {
            // ']' found, then '.' found → extracts between them
            const result = sigplot.m.trim_name("[dir]file.dat");
            expect(result).toContain("file");
        });

        it("handles filename without extension (no separator)", () => {
            const result = sigplot.m.trim_name("myfile");
            expect(result).toBe("myfile");
        });

        it("returns a string", () => {
            expect(typeof sigplot.m.trim_name("test.dat")).toBe("string");
        });
    });

    // --- j1970toj1950 / j1950toj1970 round-trip ---
    describe("j1970toj1950 and j1950toj1970", () => {
        it("round-trip conversion preserves the original value", () => {
            const t = 1000000;
            const j1950 = sigplot.m.j1970toj1950(t);
            const back = sigplot.m.j1950toj1970(j1950);
            expect(back).toBeCloseTo(t, 5);
        });

        it("j1970toj1950 adds the j1950 offset", () => {
            const offset = (20.0 * 365.0 + 5.0) * (24 * 3600);
            expect(sigplot.m.j1970toj1950(0)).toBeCloseTo(offset, 5);
        });

        it("j1950toj1970 subtracts the j1950 offset", () => {
            const offset = (20.0 * 365.0 + 5.0) * (24 * 3600);
            expect(sigplot.m.j1950toj1970(offset)).toBeCloseTo(0, 5);
        });

        it("round-trip works for negative values", () => {
            const t = -500000;
            const result = sigplot.m.j1950toj1970(sigplot.m.j1970toj1950(t));
            expect(result).toBeCloseTo(t, 5);
        });

        it("j1970toj1950 accepts Date objects", () => {
            const d = new Date(0); // Unix epoch
            const result = sigplot.m.j1970toj1950(d);
            const offset = (20.0 * 365.0 + 5.0) * (24 * 3600);
            expect(result).toBeCloseTo(offset, 5);
        });
    });

    // --- pad ---
    describe("pad", () => {
        it("returns numeric pad amount as-is", () => {
            expect(sigplot.m.pad(100, 10)).toBe(10);
        });

        it("parses percentage string", () => {
            expect(sigplot.m.pad(100, "10%")).toBeCloseTo(10, 5);
        });

        it("returns 0 when padamt is undefined", () => {
            expect(sigplot.m.pad(100)).toBe(0);
        });

        it("returns 0 when padamt is 0", () => {
            expect(sigplot.m.pad(100, 0)).toBe(0);
        });

        it("parses string number without percent", () => {
            expect(sigplot.m.pad(100, "25")).toBe(25);
        });

        it("handles percentage of different base values", () => {
            expect(sigplot.m.pad(200, "50%")).toBeCloseTo(100, 5);
            expect(sigplot.m.pad(50, "20%")).toBeCloseTo(10, 5);
        });
    });
});
