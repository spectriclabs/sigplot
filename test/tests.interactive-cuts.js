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
QUnit.module("sigplot-interactive-cuts", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach,
});

interactiveTest(
    "p-cuts: side and bottom plots",
    "Do you see updating data when the mouse is moved in the x and y plots",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.overlay_href("dat/penny.prm");
        plot.change_settings({
            p_cuts: true,
        });
    }
);

interactiveTest(
    "p-cuts: side and bottom plots turn on and off",
    'Do the plots toggle on "p" key regardless of mouse postion?',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.overlay_href("dat/penny.prm");
        plot.change_settings({
            p_cuts: true,
        });
    }
);

interactiveTest(
    "p-cuts: x-cut",
    'Does the x-plot show on "x" key regardless of mouse position and update when clicked open in different spot?',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.overlay_href("dat/penny.prm");
        plot.change_settings({
            p_cuts: true,
        });
    }
);

interactiveTest(
    "p-cuts: y-cut",
    'Does the y-plot show on "y" key regardless of mouse position and update when clicked open in different spot?',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.overlay_href("dat/penny.prm");
        plot.change_settings({
            p_cuts: true,
        });
    }
);

interactiveTest(
    "p-cuts: turn on and off",
    'Does the feature toggle with "p" key? Does everything resize correctly?',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.overlay_href("dat/penny.prm");
    }
);

interactiveTest(
    "p-cuts: x-cut and y-cut without p-cuts display",
    "Do the x and y plot display when clicked without the smaller plots?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.overlay_href("dat/penny.prm");
        //console.log(plot._Gx);
    }
);

interactiveTest(
    "falling raster with p-cuts",
    "Do you see a falling raster with p-cut functionality?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
            enabled_streaming_pcut: true,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: framesize,
                file_name: "ramp",
                ydelta: 0.25,
            },
            {
                drawmode: "falling",
            }
        );
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            plot.push(lyr0, ramp);
        }, 100);
    }
);

interactiveTest(
    "rising raster with p-cuts",
    "Do you see a rising raster with p-cut functionality?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
            enabled_streaming_pcut: true,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: framesize,
                file_name: "ramp",
                ydelta: 0.25,
            },
            {
                drawmode: "rising",
            }
        );
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            plot.push(lyr0, ramp);
        }, 100);
    }
);

interactiveTest(
    "scrolling raster with p-cuts",
    "Do you see a scrolling raster with p-cut functionality?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
            enabled_streaming_pcut: true,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: framesize,
                file_name: "ramp",
                ydelta: 0.25,
            },
            {
                drawmode: "scrolling",
            }
        );
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            plot.push(lyr0, ramp);
        }, 100);
    }
);

interactiveTest(
    "Plot x-cut",
    "Does x-cut render correctly with a valid y-axis?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.overlay_href(
            "dat/raster.tmp",
            function () {
                var lyr = plot.get_layer(0);
                lyr.xCut(100);
            },
            {}
        );
    }
);

interactiveTest(
    "Plot x-cut zoom",
    "Does x-cut render with a zoomed x-axis?",
    function (assert) {
        // TODO this test doesn't work
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.overlay_href(
            "dat/raster.tmp",
            function () {
                plot.zoom(
                    {
                        x: 65e6,
                        y: 50,
                    },
                    {
                        x: 70e6,
                        y: 110,
                    }
                );
                var lyr = plot.get_layer(0);
                lyr.xCut(100);
            },
            {}
        );
    }
);

interactiveTest(
    "Plot x-cut zoom 2",
    "Does x-cut render a line at 30?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot_options = {
            autohide_panbars: true,
            hide_note: true,
        };
        var x_data = []; // test data for x-cut test
        var data_header = {
            type: 2000,
            subsize: 100,
            xstart: 0.0, // the start of the x-axis
            xdelta: 0.5, // the x-axis step between each data point
            ystart: 0.0,
            ydelta: 0.5,
        };
        var layer_options = {
            name: "Sample Data",
        };
        // Test x-cut with vertical ramp
        for (var y = 0; y < 100; y++) {
            for (var x = 0; x < data_header.subsize; x++) {
                x_data.push(y);
            }
        }
        var x_plot = new sigplot.Plot(container, plot_options);
        assert.notEqual(x_plot, null);
        x_plot.overlay_array(x_data, data_header, layer_options);
        x_plot.zoom(
            {
                x: 10,
                y: 10,
            },
            {
                x: 20,
                y: 20,
            }
        );
        var lyr = x_plot.get_layer(0);
        lyr.xCut(15);
    }
);

interactiveTest(
    "Plot x-cut issue #25",
    "Does p-cut render correctly?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        plot.change_settings({
            p_cuts: true,
        });
        assert.notEqual(plot, null);
        plot.overlay_href("dat/raster.tmp", null, {});
    }
);

interactiveTest(
    "Plot y-cut",
    "Does y-cut render correctly?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.overlay_href(
            "dat/raster.tmp",
            function () {
                var lyr = plot.get_layer(0);
                lyr.yCut(70000000);
            },
            {}
        );
    }
);

interactiveTest(
    "Plot y-cut zoom",
    "Does y-cut render correctly with a valid axis?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.overlay_href(
            "dat/raster.tmp",
            function () {
                plot.zoom(
                    {
                        x: 600e6,
                        y: 80,
                    },
                    {
                        x: 650e6,
                        y: 110,
                    }
                );
                var lyr = plot.get_layer(0);
                lyr.yCut(625000000);
            },
            {}
        );
    }
);

interactiveTest(
    "Plot y-cut zoom 2",
    "Does y-cut render a line at 30?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot_options = {
            autohide_panbars: true,
            hide_note: true,
        };
        var y_data = []; // test data for x-cut test
        var data_header = {
            type: 2000,
            subsize: 100,
            xstart: 0.0, // the start of the x-axis
            xdelta: 0.5, // the x-axis step between each data point
            ystart: 0.0,
            ydelta: 0.5,
        };
        var layer_options = {
            name: "Sample Data",
        };
        // Test x-cut with vertical ramp
        for (var y = 0; y < 100; y++) {
            for (var x = 0; x < data_header.subsize; x++) {
                y_data.push(x);
            }
        }
        var y_plot = new sigplot.Plot(container, plot_options);
        assert.notEqual(y_plot, null);
        y_plot.overlay_array(y_data, data_header, layer_options);
        y_plot.zoom(
            {
                x: 10,
                y: 10,
            },
            {
                x: 20,
                y: 20,
            }
        );
        var lyr = y_plot.get_layer(0);
        lyr.yCut(15);
    }
);
