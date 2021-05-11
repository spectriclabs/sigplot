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
QUnit.module("sigplot-interactive-slider", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach,
});

interactiveTest("slider", "Do you see a sliders?", function (assert) {
    var container = document.getElementById("plot");
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var slider1 = new sigplot_plugins.SliderPlugin({
        name: "Slider 1",
    });
    plot.add_plugin(slider1);
    var slider2 = new sigplot_plugins.SliderPlugin({
        name: "Slider 2",
    });
    plot.add_plugin(slider2);
    slider1.pair(slider2);
    slider2.pair(slider1);
    slider1.set_position(0.5);
    slider2.set_position(-0.5);
    // slidertag events happen whenever a slider is moved
    // programatically or by the user
    plot.addListener("slidertag", function (evt) {});
    // sliderdrag events happen only when a slider is moved by
    // the user
    plot.addListener("sliderdrag", function (evt) {});
});
