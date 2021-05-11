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
QUnit.module("sigplot-interactive-boxes", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach,
});

interactiveTest("boxes", "Do you see a boxes?", function (assert) {
    var container = document.getElementById("plot");
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var boxes = new sigplot_plugins.BoxesPlugin();
    plot.add_plugin(boxes);
    boxes.add_box({
        x: 0,
        y: 0,
        w: 0.1,
        h: 0.1,
        text: "0,0",
    });
    boxes.add_box({
        x: 0.5,
        y: 0.5,
        w: 0.1,
        h: 0.1,
        text: "0.5,0.5",
        fill: true,
    });
    boxes.add_box({
        x: -0.5,
        y: -0.5,
        w: 0.1,
        h: 0.1,
        text: "-0.5,-0.5",
        fillStyle: "green",
    });
    boxes.add_box({
        x: 0.5,
        y: -0.5,
        w: 0.1,
        h: 0.1,
        text: "0.5,-0.5",
        fillStyle: "red",
        alpha: 0.25,
    });
});
interactiveTest("clear boxes", "Do you see one box?", function (assert) {
    var container = document.getElementById("plot");
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var boxes = new sigplot_plugins.BoxesPlugin();
    plot.add_plugin(boxes);
    boxes.add_box({
        x: 0,
        y: 0,
        w: 0.1,
        h: 0.1,
        text: "I should be gone soon...",
    });
    window.setTimeout(function () {
        boxes.clear_boxes();
        boxes.add_box({
            x: 0.5,
            y: 0.5,
            w: 0.1,
            h: 0.1,
            text: "You should see me",
        });
    }, 1000);
});
