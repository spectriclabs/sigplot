/**
 * @license
 * File: tests.mx.test.js
 * Copyright (c) 2012-2017, LGS Innovations Inc., All rights reserved.
 * Copyright (c) 2019-2020, Spectric Labs Inc., All rights reserved.
 *
 * This file is part of SigPlot.
 *
 * Licensed to the LGS Innovations (LGS) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  LGS licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { describe, it, expect } from "vitest";

describe("mx", () => {
    it("mx format_f", () => {
        // the toFixed() function is limited to 0-20
        expect(sigplot.mx.format_f(1.0, 0, -1)).toBe("1");
        expect(sigplot.mx.format_f(1.0, 0, 21)).toBe("1.00000000000000000000");
        expect(sigplot.mx.format_f(1.0, 0, 1)).toBe("1.0");
        expect(sigplot.mx.format_f(1.0, 0, 20)).toBe("1.00000000000000000000");
    });

    it("mx real_to_pixel test", () => {
        var Mx = {
            origin: 1,
            x: 0,
            y: 0,
            level: 0,
            stk: [{
                xmin: -1,
                xmax: 1,
                ymin: -1,
                ymax: 1,
                xscl: 1 / 100,
                yscl: 1 / 100,
                x1: 0,
                y1: 0,
                x2: 200,
                y2: 200
            }]
        };
        var result = sigplot.mx.real_to_pixel(Mx, 0, 0);
        expect(result.x).toBe(100);
        expect(result.y).toBe(100);
        expect(result.clipped).toBe(false);
        result = sigplot.mx.real_to_pixel(Mx, 1, 1);
        expect(result.x).toBe(200);
        expect(result.y).toBe(0);
        expect(result.clipped).toBe(false);
        result = sigplot.mx.real_to_pixel(Mx, -1, -1);
        expect(result.x).toBe(0);
        expect(result.y).toBe(200);
        expect(result.clipped).toBe(false);
        result = sigplot.mx.real_to_pixel(Mx, 1.5, 1);
        expect(result.x).toBe(250);
        expect(result.y).toBe(0);
        expect(result.clipped).toBe(true);
        result = sigplot.mx.real_to_pixel(Mx, -1, -1.5);
        expect(result.x).toBe(0);
        expect(result.y).toBe(250);
        expect(result.clipped).toBe(true);
        result = sigplot.mx.real_to_pixel(Mx, 1.5, 1, true);
        expect(result.x).toBe(200);
        expect(result.y).toBe(0);
        expect(result.clipped).toBe(true);
        result = sigplot.mx.real_to_pixel(Mx, -1, -1.5, true);
        expect(result.x).toBe(0);
        expect(result.y).toBe(200);
        expect(result.clipped).toBe(true);

        Mx = {
            origin: 4,
            x: 0,
            y: 0,
            level: 0,
            stk: [{
                xmin: -1,
                xmax: 1,
                ymin: -1,
                ymax: 1,
                xscl: 1 / 100,
                yscl: 1 / 100,
                x1: 0,
                y1: 0,
                x2: 200,
                y2: 200
            }]
        };
        result = sigplot.mx.real_to_pixel(Mx, 0, 0);
        expect(result.x).toBe(100);
        expect(result.y).toBe(100);
        expect(result.clipped).toBe(false);
        result = sigplot.mx.real_to_pixel(Mx, 1, 1);
        expect(result.x).toBe(200);
        expect(result.y).toBe(200);
        expect(result.clipped).toBe(false);
        result = sigplot.mx.real_to_pixel(Mx, -1, -1);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
        expect(result.clipped).toBe(false);
        result = sigplot.mx.real_to_pixel(Mx, 1.5, 1);
        expect(result.x).toBe(250);
        expect(result.y).toBe(200);
        expect(result.clipped).toBe(true);
        result = sigplot.mx.real_to_pixel(Mx, -1, -1.5);
        expect(result.x).toBe(0);
        expect(result.y).toBe(-50);
        expect(result.clipped).toBe(true);
        result = sigplot.mx.real_to_pixel(Mx, 1.5, 1, true);
        expect(result.x).toBe(200);
        expect(result.y).toBe(200);
        expect(result.clipped).toBe(true);
        result = sigplot.mx.real_to_pixel(Mx, -1, -1.5, true);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
        expect(result.clipped).toBe(true);
    });

    it("mx real_distance_to_pixel test", () => {
        var Mx = {
            origin: 1,
            x: 0,
            y: 0,
            level: 0,
            stk: [{
                xmin: -1,
                xmax: 1,
                ymin: -1,
                ymax: 1,
                xscl: 1 / 100,
                yscl: 1 / 100,
                x1: 0,
                y1: 0,
                x2: 200,
                y2: 200
            }]
        };
        var result;

        result = sigplot.mx.real_distance_to_pixel(Mx, -1, 1, 1, 1);
        expect(result.x).toBe(200);
        expect(result.y).toBe(0);
        expect(result.d).toBe(200);
        expect(result.clipped).toBe(false);

        result = sigplot.mx.real_distance_to_pixel(Mx, -1, -1, 1, 1);
        expect(result.x).toBe(200);
        expect(result.y).toBe(-200);
        expect(Math.abs(result.d - 282.8427)).toBeLessThanOrEqual(0.001);
        expect(result.clipped).toBe(false);

        result = sigplot.mx.real_distance_to_pixel(Mx, -1.5, -1.5, 1.5, 1.5);
        expect(result.x).toBe(300);
        expect(result.y).toBe(-300);
        expect(Math.abs(result.d - 424.264)).toBeLessThanOrEqual(0.001);
        expect(result.clipped).toBe(true);

        result = sigplot.mx.real_distance_to_pixel(Mx, -1.5, -1.5, 1.5, 1.5, true);
        expect(result.x).toBe(200);
        expect(result.y).toBe(-200);
        expect(Math.abs(result.d - 282.8427)).toBeLessThanOrEqual(0.001);
        expect(result.clipped).toBe(true);

        Mx = {
            origin: 4,
            x: 0,
            y: 0,
            level: 0,
            stk: [{
                xmin: -1,
                xmax: 1,
                ymin: -1,
                ymax: 1,
                xscl: 1 / 100,
                yscl: 1 / 100,
                x1: 0,
                y1: 0,
                x2: 200,
                y2: 200
            }]
        };

        result = sigplot.mx.real_distance_to_pixel(Mx, -1, 1, 1, 1);
        expect(result.x).toBe(200);
        expect(result.y).toBe(0);
        expect(result.d).toBe(200);
        expect(result.clipped).toBe(false);

        result = sigplot.mx.real_distance_to_pixel(Mx, -1, -1, 1, 1);
        expect(result.x).toBe(200);
        expect(result.y).toBe(200);
        expect(Math.abs(result.d - 282.8427)).toBeLessThanOrEqual(0.001);
        expect(result.clipped).toBe(false);

        result = sigplot.mx.real_distance_to_pixel(Mx, -1.5, -1.5, 1.5, 1.5);
        expect(result.x).toBe(300);
        expect(result.y).toBe(300);
        expect(Math.abs(result.d - 424.264)).toBeLessThanOrEqual(0.001);
        expect(result.clipped).toBe(true);

        result = sigplot.mx.real_distance_to_pixel(Mx, -1.5, -1.5, 1.5, 1.5, true);
        expect(result.x).toBe(200);
        expect(result.y).toBe(200);
        expect(Math.abs(result.d - 282.8427)).toBeLessThanOrEqual(0.001);
        expect(result.clipped).toBe(true);
    });

    it("mx real_box_to_pixel test", () => {
        var Mx = {
            origin: 1,
            x: 0,
            y: 0,
            level: 0,
            stk: [{
                xmin: -1,
                xmax: 1,
                ymin: -1,
                ymax: 1,
                xscl: 1 / 100,
                yscl: 1 / 100,
                x1: 0,
                y1: 0,
                x2: 200,
                y2: 200
            }]
        };

        var result;
        result = sigplot.mx.real_box_to_pixel(Mx, -1, 1, 1, 1);
        expect(result.ul.x).toBe(0);
        expect(result.ul.y).toBe(0);
        expect(result.lr.x).toBe(100);
        expect(result.lr.y).toBe(100);
        expect(result.w).toBe(100);
        expect(result.h).toBe(100);
        expect(result.clipped).toBe(false);

        result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1, 1);
        expect(result.ul.x).toBe(100);
        expect(result.ul.y).toBe(100);
        expect(result.lr.x).toBe(200);
        expect(result.lr.y).toBe(200);
        expect(result.w).toBe(100);
        expect(result.h).toBe(100);
        expect(result.clipped).toBe(false);

        result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1.5, 1.5);
        expect(result.ul.x).toBe(100);
        expect(result.ul.y).toBe(100);
        expect(result.lr.x).toBe(250);
        expect(result.lr.y).toBe(250);
        expect(result.w).toBe(150);
        expect(result.h).toBe(150);
        expect(result.clipped).toBe(true);

        result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1.5, 1.5, true);
        expect(result.ul.x).toBe(100);
        expect(result.ul.y).toBe(100);
        expect(result.lr.x).toBe(200);
        expect(result.lr.y).toBe(200);
        expect(result.w).toBe(100);
        expect(result.h).toBe(100);
        expect(result.clipped).toBe(true);

        Mx = {
            origin: 4,
            x: 0,
            y: 0,
            level: 0,
            stk: [{
                xmin: -1,
                xmax: 1,
                ymin: -1,
                ymax: 1,
                xscl: 1 / 100,
                yscl: 1 / 100,
                x1: 0,
                y1: 0,
                x2: 200,
                y2: 200
            }]
        };

        result = sigplot.mx.real_box_to_pixel(Mx, -1, -1, 1, 1);
        expect(result.ul.x).toBe(0);
        expect(result.ul.y).toBe(0);
        expect(result.lr.x).toBe(100);
        expect(result.lr.y).toBe(100);
        expect(result.w).toBe(100);
        expect(result.h).toBe(100);
        expect(result.clipped).toBe(false);

        result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1, 1);
        expect(result.ul.x).toBe(100);
        expect(result.ul.y).toBe(100);
        expect(result.lr.x).toBe(200);
        expect(result.lr.y).toBe(200);
        expect(result.w).toBe(100);
        expect(result.h).toBe(100);
        expect(result.clipped).toBe(false);

        result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1.5, 1.5);
        expect(result.ul.x).toBe(100);
        expect(result.ul.y).toBe(100);
        expect(result.lr.x).toBe(250);
        expect(result.lr.y).toBe(250);
        expect(result.w).toBe(150);
        expect(result.h).toBe(150);
        expect(result.clipped).toBe(true);

        result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1.5, 1.5, true);
        expect(result.ul.x).toBe(100);
        expect(result.ul.y).toBe(100);
        expect(result.lr.x).toBe(200);
        expect(result.lr.y).toBe(200);
        expect(result.w).toBe(100);
        expect(result.h).toBe(100);
        expect(result.clipped).toBe(true);
    });
});
