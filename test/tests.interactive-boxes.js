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
QUnit.module("sigplot-interactive-boxes", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach
});
interactiveTest("boxes", "Do you see a boxes at the correct locations?", function (assert) {
    var container = document.getElementById("plot");
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var boxes = new sigplot.plugins.BoxesPlugin();
    plot.add_plugin(boxes);
    assert.equal(boxes.getBoxes().length, 0);
    boxes.add_box({
        x: 0,
        y: 0,
        w: 0.1,
        h: 0.1,
        text: "0,0"
    });
    assert.equal(boxes.getBoxes().length, 1);
    boxes.add_box({
        x: 0.5,
        y: 0.5,
        w: 0.1,
        h: 0.1,
        text: "0.5,0.5",
        fill: true
    });
    assert.equal(boxes.getBoxes().length, 2);
    boxes.add_box({
        x: -0.5,
        y: -0.5,
        w: 0.1,
        h: 0.1,
        text: "-0.5,-0.5",
        fillStyle: "green"
    });
    assert.equal(boxes.getBoxes().length, 3);
    boxes.add_box({
        x: 0.5,
        y: -0.5,
        w: 0.1,
        h: 0.1,
        text: "0.5,-0.5",
        fillStyle: "red",
        alpha: 0.25
    });
    assert.equal(boxes.getBoxes().length, 4);
});
interactiveTest("boxes (type 2000)", "Do you see a boxes at the correct locations (type 2000)?", function (assert) {
    var container = document.getElementById("plot");
    var plot = new sigplot.Plot(container, {});

    var framesize = 128;
    var height = 120;

    var raster = [];
    for (var j = 0; j < height; j += 1) {
        for (var i = 0; i < framesize; i += 1) {
            raster.push(j + i);
        }
    }

    plot.overlay_array(raster, {
        type: 2000,
        subsize: framesize,
        file_name: "raster",
        xstart: -50,
        ystart: -50
    });

    assert.notEqual(plot, null);
    var boxes = new sigplot.plugins.BoxesPlugin();
    plot.add_plugin(boxes);

    assert.equal(boxes.getBoxes().length, 0);
    boxes.add_box({
        x: 0,
        y: 0,
        w: 10,
        h: 10,
        text: "0,0"
    });
    assert.equal(boxes.getBoxes().length, 1);
    boxes.add_box({
        x: 25,
        y: 25,
        w: 10,
        h: 10,
        text: "25,25",
        fill: true
    });
    assert.equal(boxes.getBoxes().length, 2);
    boxes.add_box({
        x: -25,
        y: -25,
        w: 15,
        h: 15,
        text: "-25,-25",
        fillStyle: "green"
    });
    assert.equal(boxes.getBoxes().length, 3);
    boxes.add_box({
        x: 25,
        y: -25,
        w: 20,
        h: 20,
        text: "25,-25",
        fillStyle: "red",
        alpha: 0.25
    });
    assert.equal(boxes.getBoxes().length, 4);
});
interactiveTest("clear boxes", "Do you see one box?", function (assert) {
    var done = assert.async();
    var container = document.getElementById("plot");
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var boxes = new sigplot.plugins.BoxesPlugin();
    plot.add_plugin(boxes);
    assert.equal(boxes.getBoxes().length, 0);
    boxes.add_box({
        x: 0,
        y: 0,
        w: 0.1,
        h: 0.1,
        text: "I should be gone soon..."
    });
    assert.equal(boxes.getBoxes().length, 1);
    window.setTimeout(function () {
        boxes.clear_boxes();
        assert.equal(boxes.getBoxes().length, 0);
        boxes.add_box({
            x: 0.5,
            y: 0.5,
            w: 0.1,
            h: 0.1,
            text: "You should see me"
        });
        assert.equal(boxes.getBoxes().length, 1);
        done();
    }, 1000);
});
interactiveTest("remove boxes", "Do you see one box?", function (assert) {
    var done = assert.async();
    var container = document.getElementById("plot");
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var boxes = new sigplot.plugins.BoxesPlugin();
    plot.add_plugin(boxes);
    assert.equal(boxes.getBoxes().length, 0);
    var box_id = boxes.add_box({
        x: 0,
        y: 0,
        w: 0.1,
        h: 0.1,
        text: "I should be gone soon..."
    });
    assert.equal(boxes.getBoxes().length, 1);
    window.setTimeout(function () {
        boxes.remove_box(box_id);
        assert.equal(boxes.getBoxes().length, 0);
        boxes.add_box({
            x: 0.5,
            y: 0.5,
            w: 0.1,
            h: 0.1,
            text: "You should see me"
        });
        assert.equal(boxes.getBoxes().length, 1);
        done();
    }, 1000);
});
