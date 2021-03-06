/**
 * @license
 * File: tests.js
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

/* globals QUnit, sigplot, ColorMap, sigplot.plugins, assert, assert.strictEqual, QUnit.asyncTest, assert.notEqual, alert, BlueFileReader, start, ok, throws, interactiveBeforeEach, interactiveAfterEach, interactiveTest, fixture, ifixture */
//////////////////////////////////////////////////////////////////////////////
// QUnit 'mx' module
//////////////////////////////////////////////////////////////////////////////
QUnit.module('mx', {
    setup: function() {},
    teardown: function() {}
});
QUnit.test('mx format_f', function(assert) {
    // the toFixed() function is limited to 0-20
    assert.equal(sigplot.mx.format_f(1.0, 0, -1), "1");
    assert.equal(sigplot.mx.format_f(1.0, 0, 21), "1.00000000000000000000");
    assert.equal(sigplot.mx.format_f(1.0, 0, 1), "1.0");
    assert.equal(sigplot.mx.format_f(1.0, 0, 20), "1.00000000000000000000");
});
QUnit.test('mx real_to_pixel test', function(assert) {
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
    assert.equal(result.x, 100);
    assert.equal(result.y, 100);
    assert.equal(result.clipped, false);
    var result = sigplot.mx.real_to_pixel(Mx, 1, 1);
    assert.equal(result.x, 200);
    assert.equal(result.y, 0);
    assert.equal(result.clipped, false);
    var result = sigplot.mx.real_to_pixel(Mx, -1, -1);
    assert.equal(result.x, 0);
    assert.equal(result.y, 200);
    assert.equal(result.clipped, false);
    var result = sigplot.mx.real_to_pixel(Mx, 1.5, 1);
    assert.equal(result.x, 250);
    assert.equal(result.y, 0);
    assert.equal(result.clipped, true);
    var result = sigplot.mx.real_to_pixel(Mx, -1, -1.5);
    assert.equal(result.x, 0);
    assert.equal(result.y, 250);
    assert.equal(result.clipped, true);
    var result = sigplot.mx.real_to_pixel(Mx, 1.5, 1, true);
    assert.equal(result.x, 200);
    assert.equal(result.y, 0);
    assert.equal(result.clipped, true);
    var result = sigplot.mx.real_to_pixel(Mx, -1, -1.5, true);
    assert.equal(result.x, 0);
    assert.equal(result.y, 200);
    assert.equal(result.clipped, true);

    var Mx = {
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
    var result = sigplot.mx.real_to_pixel(Mx, 0, 0);
    assert.equal(result.x, 100);
    assert.equal(result.y, 100);
    assert.equal(result.clipped, false);
    var result = sigplot.mx.real_to_pixel(Mx, 1, 1);
    assert.equal(result.x, 200);
    assert.equal(result.y, 200);
    assert.equal(result.clipped, false);
    var result = sigplot.mx.real_to_pixel(Mx, -1, -1);
    assert.equal(result.x, 0);
    assert.equal(result.y, 0);
    assert.equal(result.clipped, false);
    var result = sigplot.mx.real_to_pixel(Mx, 1.5, 1);
    assert.equal(result.x, 250);
    assert.equal(result.y, 200);
    assert.equal(result.clipped, true);
    var result = sigplot.mx.real_to_pixel(Mx, -1, -1.5);
    assert.equal(result.x, 0);
    assert.equal(result.y, -50);
    assert.equal(result.clipped, true);
    var result = sigplot.mx.real_to_pixel(Mx, 1.5, 1, true);
    assert.equal(result.x, 200);
    assert.equal(result.y, 200);
    assert.equal(result.clipped, true);
    var result = sigplot.mx.real_to_pixel(Mx, -1, -1.5, true);
    assert.equal(result.x, 0);
    assert.equal(result.y, 0);
    assert.equal(result.clipped, true);
});
QUnit.test('mx real_distance_to_pixel test', function(assert) {
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
    assert.equal(result.x, 200);
    assert.equal(result.y, 0);
    assert.equal(result.d, 200);
    assert.equal(result.clipped, false);

    result = sigplot.mx.real_distance_to_pixel(Mx, -1, -1, 1, 1);
    assert.equal(result.x, 200);
    assert.equal(result.y, -200);
    assert.close(result.d, 282.8427, 0.001);
    assert.equal(result.clipped, false);

    result = sigplot.mx.real_distance_to_pixel(Mx, -1.5, -1.5, 1.5, 1.5);
    assert.equal(result.x, 300);
    assert.equal(result.y, -300);
    assert.close(result.d, 424.264, 0.001);
    assert.equal(result.clipped, true);

    result = sigplot.mx.real_distance_to_pixel(Mx, -1.5, -1.5, 1.5, 1.5, true);
    assert.equal(result.x, 200);
    assert.equal(result.y, -200);
    assert.close(result.d, 282.8427, 0.001);
    assert.equal(result.clipped, true);

    var Mx = {
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
    assert.equal(result.x, 200);
    assert.equal(result.y, 0);
    assert.equal(result.d, 200);
    assert.equal(result.clipped, false);

    result = sigplot.mx.real_distance_to_pixel(Mx, -1, -1, 1, 1);
    assert.equal(result.x, 200);
    assert.equal(result.y, 200);
    assert.close(result.d, 282.8427, 0.001);
    assert.equal(result.clipped, false);

    result = sigplot.mx.real_distance_to_pixel(Mx, -1.5, -1.5, 1.5, 1.5);
    assert.equal(result.x, 300);
    assert.equal(result.y, 300);
    assert.close(result.d, 424.264, 0.001);
    assert.equal(result.clipped, true);

    result = sigplot.mx.real_distance_to_pixel(Mx, -1.5, -1.5, 1.5, 1.5, true);
    assert.equal(result.x, 200);
    assert.equal(result.y, 200);
    assert.close(result.d, 282.8427, 0.001);
    assert.equal(result.clipped, true);
});
QUnit.test('mx real_box_to_pixel test', function(assert) {
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
    assert.equal(result.ul.x, 0);
    assert.equal(result.ul.y, 0);
    assert.equal(result.lr.x, 100);
    assert.equal(result.lr.y, 100);
    assert.equal(result.w, 100);
    assert.equal(result.h, 100);
    assert.equal(result.clipped, false);

    result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1, 1);
    assert.equal(result.ul.x, 100);
    assert.equal(result.ul.y, 100);
    assert.equal(result.lr.x, 200);
    assert.equal(result.lr.y, 200);
    assert.equal(result.w, 100);
    assert.equal(result.h, 100);
    assert.equal(result.clipped, false);

    result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1.5, 1.5);
    assert.equal(result.ul.x, 100);
    assert.equal(result.ul.y, 100);
    assert.equal(result.lr.x, 250);
    assert.equal(result.lr.y, 250);
    assert.equal(result.w, 150);
    assert.equal(result.h, 150);
    assert.equal(result.clipped, true);

    result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1.5, 1.5, true);
    assert.equal(result.ul.x, 100);
    assert.equal(result.ul.y, 100);
    assert.equal(result.lr.x, 200);
    assert.equal(result.lr.y, 200);
    assert.equal(result.w, 100);
    assert.equal(result.h, 100);
    assert.equal(result.clipped, true);


    var Mx = {
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
    assert.equal(result.ul.x, 0);
    assert.equal(result.ul.y, 0);
    assert.equal(result.lr.x, 100);
    assert.equal(result.lr.y, 100);
    assert.equal(result.w, 100);
    assert.equal(result.h, 100);
    assert.equal(result.clipped, false);

    result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1, 1);
    assert.equal(result.ul.x, 100);
    assert.equal(result.ul.y, 100);
    assert.equal(result.lr.x, 200);
    assert.equal(result.lr.y, 200);
    assert.equal(result.w, 100);
    assert.equal(result.h, 100);
    assert.equal(result.clipped, false);

    result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1.5, 1.5);
    assert.equal(result.ul.x, 100);
    assert.equal(result.ul.y, 100);
    assert.equal(result.lr.x, 250);
    assert.equal(result.lr.y, 250);
    assert.equal(result.w, 150);
    assert.equal(result.h, 150);
    assert.equal(result.clipped, true);

    result = sigplot.mx.real_box_to_pixel(Mx, 0, 0, 1.5, 1.5, true);
    assert.equal(result.ul.x, 100);
    assert.equal(result.ul.y, 100);
    assert.equal(result.lr.x, 200);
    assert.equal(result.lr.y, 200);
    assert.equal(result.w, 100);
    assert.equal(result.h, 100);
    assert.equal(result.clipped, true);
});
