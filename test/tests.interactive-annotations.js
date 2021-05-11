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
QUnit.module("sigplot-interactive-annotations", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach,
});

interactiveTest(
    "annotations",
    "Do you see a text annotation at the correct locations, fonts and colors?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
        annotations.add_annotation({
            x: 0,
            y: 0,
            value: "0,0 (red)",
            color: "red",
            highlight_color: "green",
            popup: "a",
        });
        annotations.add_annotation({
            x: 0.5,
            y: 0.5,
            value: "0.5,0.5 (small)",
            font: "15px monospace",
            popup: "b",
        });
        annotations.add_annotation({
            x: -0.5,
            y: -0.5,
            value: "-0.5,-0.5",
            popup: "c",
            onclick: function () {
                alert("you clicked me");
            },
        });
        annotations.add_annotation({
            x: -0.5,
            y: 0.5,
            value: "-0.5,0.5",
            popup: "d",
            textBaseline: "middle",
            textAlign: "center",
        });
        annotations.add_annotation({
            x: 0.5,
            y: -0.5,
            value: "0.5,-0.5 (small green)",
            color: "green",
            font: "15px monospace",
            popup: "e",
            popupTextColor: "red",
        });
    }
);

interactiveTest(
    "annotations png",
    "Do you see a image annotation centered at 0,0 that has a popup on hover?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
        var img = new Image(); // Create new img element
        img.onload = function () {
            annotations.add_annotation({
                x: 0,
                y: 0,
                value: img,
                popup: "Hello World",
            });
        };
        img.src = "dat/info.png";
    }
);

interactiveTest(
    "annotations popup",
    "Do you see an popup when you hover over the annotation?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
        annotations.add_annotation({
            x: -0.25,
            y: 0.25,
            value: "Test Popup",
            popup: "This is metadata",
        });
    }
);

interactiveTest(
    "annotations custom popup",
    "Do you see an popup when you hover over the annotation?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var tt;
        plot.addListener("annotationhighlight", function (evt) {
            // you could use tipped.js, opentip, bootstrap, etc. here
            // this is just a simple test example not intended to be actually used
            if (evt.state && !tt) {
                tt = document.createElement("div");
                tt.setAttribute("id", "test-tooltip");
                tt.style.display = "block";
                tt.style.position = "relative";
                tt.style.top = evt.y + 5 + "px";
                tt.style.left = evt.x + 5 + "px";
                tt.style.width = "100px";
                tt.style.height = "50px";
                tt.style.opacity = 0.4;
                tt.style.background = "red";
                container.appendChild(tt);
            } else if (!evt.state && tt) {
                container.removeChild(tt);
                tt = null;
            }
        });
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
        annotations.add_annotation({
            x: 0,
            y: 0,
            value: "Test Custom Popup",
        });
    }
);

interactiveTest(
    "annotations shift",
    "Do you see a text annotation that remains at the correct locations while the axis shifts?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
        annotations.add_annotation({
            x: 0,
            y: 50,
            value: "0,50",
        });
        annotations.add_annotation({
            x: 50,
            y: 60,
            value: "50,60",
        });
        annotations.add_annotation({
            x: -50,
            y: 60,
            value: "-50,60",
        });
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            xstart: -64,
            ydelta: 0.25,
        });
        var xstart = 0;
        var xstart_chng = 16;
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            if (Math.abs(xstart) >= 64) {
                xstart_chng = xstart_chng * -1;
            }
            xstart += xstart_chng;
            plot.push(lyr0, ramp, {
                xstart: xstart,
            });
        }, 500);
    }
);

interactiveTest(
    "annotation falling raster",
    "Do you see annotations that scroll with the data?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var img = new Image(); // Create new img element
        img.src = "dat/info.png";
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
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
                drawmode: "falling",
            }
        );
        var row = 0;
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            row += 1;
            if (row % 64 === 0) {
                var y = row * 0.25;
                annotations.add_annotation({
                    x: 64,
                    y: y,
                    value: "64," + y,
                    popup: "test",
                });
            } else if (row % 100 === 0) {
                var y = row * 0.25;
                annotations.add_annotation({
                    x: 32,
                    y: y,
                    value: img,
                    popup: "32," + y,
                });
            }
            plot.push(lyr0, ramp);
        }, 100);
    }
);

interactiveTest(
    "annotation rising raster",
    "Do you see annotations that scroll with the data?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var img = new Image(); // Create new img element
        img.src = "dat/info.png";
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
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
        var row = 0;
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            row += 1;
            if (row % 64 === 0) {
                var y = row * 0.25;
                annotations.add_annotation({
                    x: 64,
                    y: y,
                    value: "64," + y,
                    popup: "test",
                });
            } else if (row % 100 === 0) {
                var y = row * 0.25;
                annotations.add_annotation({
                    x: 32,
                    y: y,
                    value: img,
                    popup: "32," + y,
                });
            }
            plot.push(lyr0, ramp);
        }, 100);
    }
);

interactiveTest(
    "x-fixed annotation rising raster",
    "Do you see annotations that do not scroll with the data?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var img = new Image(); // Create new img element
        img.src = "dat/info.png";
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
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
        annotations.add_annotation({
            x: 32,
            pxl_y: 50,
            value: "A",
            popup: "I should be at X=32 always",
        });
        annotations.add_annotation({
            x: 96,
            pxl_y: 200,
            value: "B",
            popup: "I should be at X=96 always",
        });
        var row = 0;
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
    "lots of annotations",
    "Does the plot still seem smooth?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var img = new Image(); // Create new img element
        img.src = "dat/info.png";
        var annotations = new sigplot_plugins.AnnotationPlugin();
        plot.add_plugin(annotations);
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
        for (var j = 0; j < 1000; j += 1) {
            var x = Math.random() * 128;
            var y = Math.random() * (plot._Mx.b - plot._Mx.t) + plot._Mx.t;
            annotations.add_annotation({
                x: x,
                pxl_y: y,
                value: j.toString(),
                popup: "Test",
            });
        }
        var row = 0;
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            plot.push(lyr0, ramp);
        }, 100);
    }
);
