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
QUnit.module("sigplot-interactive-mouse", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach,
});

interactiveTest(
    "sigplot menu no mtag",
    "Open the menu and move it, ensure mtag events are not alerted",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.addListener("mtag", function (evt) {
            alert("Mtag occurred!");
        });
    }
);

interactiveTest(
    "sigplot continuous mtag",
    "Ensure continuous mtag updates",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcnt: "continuous",
        });
        assert.notEqual(plot, null);

        var output = document.createElement("p");
        output.innerHTML = "";
        ifixture.appendChild(output);
        plot.addListener("mtag", function (evt) {
            output.innerHTML =
                "X: " + evt.x.toFixed(8) + " Y: " + evt.y.toFixed(8);
        });
    }
);

interactiveTest(
    "right-click zoom",
    "Can you zoom with right-click and mark with left-click?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            rightclick_rubberbox_action: "zoom",
            rubberbox_action: null,
            always_show_marker: true,
        });
        assert.notEqual(plot, null);
    }
);

interactiveTest(
    "right-click select",
    "Can you select with right-click, zoom with left-click, and mark with left-click?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            rightclick_rubberbox_action: "select",
            rightclick_rubberbox_mode: "horizontal",
            rubberbox_action: "zoom",
            always_show_marker: true,
        });
        assert.notEqual(plot, null);
    }
);

interactiveTest(
    "zoom-keep-marker",
    "Does zooming not change the marker, but shows box size in the specs area?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            always_show_marker: true,
        });
        assert.notEqual(plot, null);
    }
);

interactiveTest(
    "Plot Mimic",
    "When you zoom, unzoom, or pan on each plot, does the other plot mimic the action?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 1000; i++) {
            data.push(Math.random() * 10);
        }
        plot.overlay_array(data);

        container = document.getElementById("plot2");
        container.style.display = "block";
        var plot2 = new sigplot.Plot(container, {});
        assert.notEqual(plot2, null);
        data = [];
        for (var i = 0; i < 1000; i++) {
            data.push(Math.random() * 10);
        }
        plot2.overlay_array(data);

        plot.mimic(plot2, {
            zoom: true,
            unzoom: true,
            pan: true,
        });
        plot2.mimic(plot, {
            zoom: true,
            unzoom: true,
            pan: true,
        });
    }
);

interactiveTest(
    "Plot Un-mimic",
    "When you zoom, unzoom, or pan on each plot, does the other plot NOT mimic the action?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 1000; i++) {
            data.push(Math.random() * 10);
        }
        plot.overlay_array(data);

        container = document.getElementById("plot2");
        container.style.display = "block";
        var plot2 = new sigplot.Plot(container, {});
        assert.notEqual(plot2, null);
        data = [];
        for (var i = 0; i < 1000; i++) {
            data.push(Math.random() * 10);
        }
        plot2.overlay_array(data);

        plot.mimic(plot2, {
            zoom: true,
            unzoom: true,
            pan: true,
        });
        plot2.mimic(plot, {
            zoom: true,
            unzoom: true,
            pan: true,
        });
        plot.unmimic();
        plot2.unmimic();
    }
);

interactiveTest(
    "dom menu",
    "move cursor to bottom right of plot. open menu by pressing 'm'. does the menu open and not appear to be bounded by the plot's grid",
    function (assert) {
        var plot_options = {
            useDomMenu: true,
        };
        var data = [1, 2, 3, 4, 5, 4, 3, 2, 1]; // the series of y-values
        var plot = new sigplot.Plot(
            document.getElementById("plot"),
            plot_options
        );
        assert.notEqual(plot, null);
        plot.overlay_array(data);
    }
);
