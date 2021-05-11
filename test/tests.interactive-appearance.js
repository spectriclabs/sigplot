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
QUnit.module("sigplot-interactive-appearance", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach,
});

interactiveTest(
    "sigplot no legend",
    "Is the legend button hidden?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        var plot = new sigplot.Plot(container, {
            no_legend_button: true,
        });
    }
);

interactiveTest(
    "sigplot no ylabel",
    "Does the label say None (U)?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        var plot = new sigplot.Plot(container, {
            ylabel: null,
        });
    }
);

interactiveTest(
    "sigplot no xlabel",
    "Is the label say None (U)?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        var plot = new sigplot.Plot(container, {
            xlabel: null,
        });
    }
);

interactiveTest(
    "sigplot no label",
    "Is the label completely hidden?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        var plot = new sigplot.Plot(container, {
            xlabel: null,
            ylabel: null,
        });
    }
);

interactiveTest(
    "sigplot custom font",
    "Is the font changed from the default?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        var plot = new sigplot.Plot(container, {
            font_family: "Comic Sans MS, cursive, sans-serif",
        });
    }
);

interactiveTest(
    "sigplot fixed font size",
    "Is the font size normal?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        container.style.width = "300px";
        var plot = new sigplot.Plot(container);
    }
);

interactiveTest(
    "sigplot fixed font size",
    "Is the font size large?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        container.style.width = "300px";
        var plot = new sigplot.Plot(container, {
            font_width: 12,
        });
    }
);

interactiveTest(
    "sigplot fixed font size",
    "Is the font size scaled smaller?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        container.style.width = "300px";
        var plot = new sigplot.Plot(container, {
            font_scaled: true,
        });
    }
);

interactiveTest(
    "sigplot bottom scrollbar",
    "Is the x scrollbar on the bottom?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        var plot = new sigplot.Plot(container, {
            noreadout: true,
            xlabel: null,
            ylabel: null,
            x_scrollbar_location: "bottom",
        });
    }
);

interactiveTest(
    "sigplot readout stays visible",
    "Is the readout visible when the mouse hovers?",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);

        var rt_plot = new sigplot.Plot(document.getElementById("plot"), {
            autohide_readout: true, // only show the readout when the mouse is over the plot
            autohide_panbars: true, // only show panbars when necessary and the mouse is over the plot
            no_legend_button: true,
        });

        var cnt = 0;

        var lyr0 = null;
        var lyr1 = null;

        update_rtplot();
        var hdl = window.setInterval(update_rtplot, 500);

        function update_rtplot() {
            var random = [];
            var random2 = [];
            for (var i = 0; i <= 1000; i += 1) {
                random.push(Math.random());
                random2.push(Math.random() + 1);
            }

            var data_layer = rt_plot.get_layer(lyr0);
            if (data_layer) {
                /*     cnt += 1;
                if (cnt === 10) {
                  console.log("changing xstart")
                  rt_plot.get_layer(0).hcb.xstart = -100;
                  rt_plot.get_layer(0).xmin = -100;
                  rt_plot.change_settings({
                    xmin: -100,
                    xmax: -100 + 1000
                  })
                } */
                rt_plot.reload(lyr0, random);
                rt_plot.reload(lyr1, random2);
            } else {
                rt_plot.change_settings({
                    cmode: 3,
                    autol: 1,
                });
                lyr0 = rt_plot.overlay_array(random, {
                    file_name: "random",
                });
                lyr1 = rt_plot.overlay_array(random2, {
                    file_name: "random2",
                });
            }
        }
    }
);

interactiveTest(
    "sigplot minimal chrome",
    "Is the plot devoid of chrome",
    function (assert) {
        var container = document.getElementById("plot");
        assert.equal(container.childNodes.length, 0);
        assert.equal(ifixture.childNodes.length, 2);
        var plot = new sigplot.Plot(container, {
            noreadout: true,
            xlabel: null,
            ylabel: null,
            nopan: true,
            noxaxis: true,
            noyaxis: true,
        });
        // display a ramp so it's easy to see the plot edges
        var ramp = [];
        for (var i = 0; i < 1024; i++) {
            ramp.push(i);
        }
        plot.overlay_array(ramp, {
            file_name: "ramp",
        });
    }
);

interactiveTest(
    "colorbar in legend",
    "does the colorbar show in the legend?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.overlay_href("dat/penny.prm");
    }
);

interactiveTest(
    "Legend",
    "Are the correct functions modified from the legend??",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var ramp = [];
        var ramp2 = [];
        for (var i = 0; i < 20; i++) {
            ramp.push(i);
            var contra = 20 - i;
            ramp2.push(contra);
        }
        plot.overlay_array(ramp, null, {
            name: "up",
            symbol: 0,
            line: 3,
        });
        plot.overlay_array(ramp2, null, {
            name: "down",
            symbol: 0,
            line: 3,
        });
    }
);

interactiveTest(
    "Plot Note",
    'Do you see the plot note saying "Test Note"?',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            note: "Test Note",
        });
        assert.notEqual(plot, null);
    }
);

interactiveTest(
    "Plot Note with data",
    'Do you see the plot note saying "Test Note"?',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            note: "Test Note",
        });
        assert.notEqual(plot, null);
        plot.overlay_href("dat/scalarpacked.tmp", null, {
            subsize: 64,
            layerType: "2D",
        });
    }
);

interactiveTest(
    "Plot Note Change Settings",
    'Do you see the plot note saying "Test Note"?',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            note: "Test Note",
        });
    }
);
