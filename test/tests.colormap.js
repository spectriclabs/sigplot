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

/* globals QUnit, sigplot, ColorMap, sigplot_plugins, assert, assert.strictEqual, QUnit.asyncTest, assert.notEqual, alert, BlueFileReader, start, ok, throws, interactiveBeforeEach, interactiveAfterEach, interactiveTest, fixture, ifixture */
//////////////////////////////////////////////////////////////////////////////
// QUnit 'ColorMap' module
//////////////////////////////////////////////////////////////////////////////
QUnit.module("ColorMap", {
    setup: function () {},
    teardown: function () {},
});
QUnit.test("colormap", function (assert) {
    var map = new ColorMap([
        {
            pos: 0,
            red: 0,
            green: 0,
            blue: 15,
        },
        {
            pos: 10,
            red: 0,
            green: 0,
            blue: 50,
        },
        {
            pos: 31,
            red: 0,
            green: 65,
            blue: 75,
        },
        {
            pos: 50,
            red: 0,
            green: 85,
            blue: 0,
        },
        {
            pos: 70,
            red: 75,
            green: 80,
            blue: 0,
        },
        {
            pos: 83,
            red: 100,
            green: 60,
            blue: 0,
        },
        {
            pos: 100,
            red: 100,
            green: 0,
            blue: 0,
        },
    ]);
    var color = map.getColor(0);
    assert.equal(color.red, 0);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 38);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#000026");
    assert.equal(color.color, -14286848);
    color = map.getColor(1);
    assert.equal(color.red, 255);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 0);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#ff0000");
    assert.equal(color.color, -16776961);
    color = map.getColor(0.5);
    assert.equal(color.red, 0);
    assert.equal(color.green, 217);
    assert.equal(color.blue, 0);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#00d900");
    assert.equal(color.color, -16721664);
    map.setRange(0, 100);
    var color = map.getColor(0);
    assert.equal(color.red, 0);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 38);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#000026");
    assert.equal(color.color, -14286848);
    color = map.getColor(100);
    assert.equal(color.red, 255);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 0);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#ff0000");
    assert.equal(color.color, -16776961);
    color = map.getColor(50);
    assert.equal(color.red, 0);
    assert.equal(color.green, 217);
    assert.equal(color.blue, 0);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#00d900");
    assert.equal(color.color, -16721664);

    var map = new ColorMap(["#000026", "#ff0000"]);
    var color = map.getColor(0);
    assert.equal(color.red, 0);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 38);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#000026");
    assert.equal(color.color, -14286848);
    color = map.getColor(1);
    assert.equal(color.red, 255);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 0);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#ff0000");
    assert.equal(color.color, -16776961);
    map.setRange(0, 100);
    var color = map.getColor(0);
    assert.equal(color.red, 0);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 38);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#000026");
    assert.equal(color.color, -14286848);
    color = map.getColor(100);
    assert.equal(color.red, 255);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 0);
    assert.equal(color.alpha, 255);
    assert.equal(color.hex, "#ff0000");
    assert.equal(color.color, -16776961);

    // make sure the Greyscale works correctly
    var map = new ColorMap(sigplot.m.Mc.colormap[0].colors);
    map.setRange(0, 100);

    color = map.getColor(0);
    assert.equal(color.red, 0);
    assert.equal(color.green, 0);
    assert.equal(color.blue, 0);

    color = map.getColor(60);
    assert.equal(color.red, 128);
    assert.equal(color.green, 128);
    assert.equal(color.blue, 128);

    color = map.getColor(100);
    assert.equal(color.red, 255);
    assert.equal(color.green, 255);
    assert.equal(color.blue, 255);
});
