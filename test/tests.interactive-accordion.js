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
QUnit.module("sigplot-interactive-accordion", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach,
});

interactiveTest(
    "vertical accordion",
    "Do you see a vertical accordion that stays centered at zero as the axis shifts",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var framesize = 500;
        var zeros = [];
        for (var i = 0; i < framesize; i += 1) {
            zeros.push(0);
        }
        var accordion = new sigplot_plugins.AccordionPlugin({
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            direction: "vertical",
            edge_line_style: {
                strokeStyle: "#FF2400",
            },
        });
        var lyr0 = plot.overlay_array(
            zeros,
            {
                type: 2000,
                subsize: framesize,
                file_name: "zeros",
                xstart: -250,
                xdelta: 1,
            },
            {
                layerType: sigplot.Layer1D,
            }
        );
        plot.add_plugin(accordion, 1);
        accordion.set_center(0);
        accordion.set_width(50);
        var xstart = -250;
        var xstart_chng = 25;
        ifixture.interval = window.setInterval(function () {
            if (xstart < -450 || xstart >= -25) {
                xstart_chng = xstart_chng * -1;
            }
            xstart += xstart_chng;
            plot.reload(lyr0, zeros, {
                xstart: xstart,
            });
        }, 500);
    }
);

interactiveTest(
    "horizontal accordion",
    "Do you see a horizontal accordion at zero and each multiple of 80, scrolling with the data?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            nogrid: true,
        });
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
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
        var acc;
        var accordion = function (y) {
            acc = new sigplot_plugins.AccordionPlugin({
                draw_center_line: true,
                shade_area: true,
                draw_edge_lines: true,
                direction: "horizontal",
                edge_line_style: {
                    strokeStyle: "#FF2400",
                },
            });
            acc.set_center(y);
            acc.set_width(0.25 * 50);
            return acc;
        };
        plot.add_plugin(accordion(0), 1);
        var row = 0;
        ifixture.interval = window.setInterval(function () {
            var zeros = [];
            for (var i = 0; i < framesize; i += 1) {
                zeros.push(0);
            }
            row += 1;
            if (row % (80 / 0.25) === 0) {
                var y = row * 0.25;
                plot.remove_plugin(acc);
                plot.deoverlay(1);
                plot.add_plugin(accordion(y), 1);
            }
            plot.push(lyr0, zeros);
        }, 100);
    }
);

interactiveTest(
    "vertical accordion relative placement",
    "Do you see a vertical accordion that doesn't move as the axis shifts?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_array(
            null,
            {
                type: 2000,
                subsize: framesize,
                file_name: "zeros",
                xstart: -64,
            },
            {
                layerType: sigplot.Layer1D,
            }
        );
        var accordion = new sigplot_plugins.AccordionPlugin({
            mode: "relative",
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            direction: "vertical",
            edge_line_style: {
                strokeStyle: "#FF2400",
            },
        });
        plot.add_plugin(accordion, 1);
        accordion.set_center(0.5);
        accordion.set_width(0.1);
        var xstart = 0;
        var xstart_chng = 16;
        ifixture.interval = window.setInterval(function () {
            var zeros = [];
            for (var i = 0; i < framesize; i += 1) {
                zeros.push(0);
            }
            if (Math.abs(xstart) >= 64) {
                xstart_chng = xstart_chng * -1;
            }
            xstart += xstart_chng;
            plot.reload(lyr0, zeros, {
                xstart: xstart,
            });
        }, 500);
    }
);

interactiveTest(
    "horizontal accordion relative placement",
    "Do you see a horizontal accordion that doesn't move with the data?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            nogrid: true,
        });
        assert.notEqual(plot, null);
        var framesize = 128;
        plot.change_settings({
            autol: 5,
        });
        var zeros = [];
        for (var i = 0; i < framesize; i += 1) {
            zeros.push(0);
        }
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: framesize,
                file_name: "zeros",
            },
            {
                drawmode: "rising",
            }
        );
        var accordion = new sigplot_plugins.AccordionPlugin({
            mode: "relative",
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            direction: "horizontal",
            edge_line_style: {
                strokeStyle: "#FF2400",
            },
        });
        plot.add_plugin(accordion, 1);
        accordion.set_center(0.5);
        accordion.set_width(0.1);
        var count = 0;
        ifixture.interval = window.setInterval(function () {
            plot.push(lyr0, zeros);
        }, 100);
    }
);

interactiveTest(
    "horizontal and vertical accordions absolute placement zoom",
    "Do the accordions stay at the same Real World Coordinates when you zoom?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var zeros = [];
        for (var i = 0; i <= 1000; i++) {
            zeros.push(0);
        }
        plot.overlay_array(zeros, {});
        var vert_accordion = new sigplot_plugins.AccordionPlugin({
            mode: "absolute",
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            direction: "vertical",
            edge_line_style: {
                strokeStyle: "#FF2400",
            },
        });
        var horiz_accordion = new sigplot_plugins.AccordionPlugin({
            mode: "absolute",
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            direction: "horizontal",
            edge_line_style: {
                strokeStyle: "#FF2400",
            },
        });
        plot.add_plugin(vert_accordion, 1);
        plot.add_plugin(horiz_accordion, 2);
        vert_accordion.set_center(500);
        vert_accordion.set_width(100);
        horiz_accordion.set_center(0);
        horiz_accordion.set_width(0.5);
    }
);

interactiveTest(
    "horizontal and vertical accordions relative placement zoom",
    "Do the accordions stay at the same pixel location when you zoom?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var zeros = [];
        for (var i = 0; i <= 1000; i++) {
            zeros.push(0);
        }
        plot.overlay_array(zeros, {});
        var vert_accordion = new sigplot_plugins.AccordionPlugin({
            mode: "relative",
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            direction: "vertical",
            edge_line_style: {
                strokeStyle: "#FF2400",
            },
        });
        var horiz_accordion = new sigplot_plugins.AccordionPlugin({
            mode: "relative",
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            direction: "horizontal",
            edge_line_style: {
                strokeStyle: "#FF2400",
            },
        });
        plot.add_plugin(vert_accordion, 1);
        plot.add_plugin(horiz_accordion, 2);
        vert_accordion.set_center(0.5);
        vert_accordion.set_width(0.1);
        horiz_accordion.set_center(0.5);
        horiz_accordion.set_width(0.1);
    }
);
