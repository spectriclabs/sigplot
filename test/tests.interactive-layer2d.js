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
QUnit.module("sigplot-interactive-layer2d", {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach,
});

interactiveTest(
    "sigplot 2d deoverlay",
    "Do you see a raster? Is alignment of x/y axes correct?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var lyr_n = plot.overlay_array(
            [],
            {},
            {
                layerType: sigplot.Layer2D,
            }
        );
        var data = [
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 0],
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 0],
        ];
        plot.deoverlay(lyr_n);
        lyr_n = plot.overlay_array(data);
    }
);

interactiveTest(
    "sigplot panxpad layer2d",
    "Do you see spikes at 10 and 110 with an x-axis from 0 to 120?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            panxpad: 10,
        });
        assert.notEqual(plot, null);
        var ramp = [];
        for (var i = 0; i < 101; i++) {
            if (i === 0 || i === 100) {
                ramp.push(100);
            } else {
                ramp.push(0);
            }
        }
        var data = [];
        for (var r = 0; r < 100; r++) {
            data.push(ramp);
        }

        plot.overlay_array(data, {
            xstart: 10,
            layerType: sigplot.Layer2D,
        });
    }
);

interactiveTest(
    "pipe 2D name",
    'Do you see a random data plot (0 to 1 ) properly named "Test" in the legend',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            legend: true,
        });
        assert.notEqual(plot, null);
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 100,
            },
            {
                framesize: 100,
                name: "Test",
            }
        );
        ifixture.interval = window.setInterval(function () {
            var random = [];
            for (var i = 0; i < 100; i += 1) {
                random.push(Math.random());
            }
            plot.push(lyr0, random);
        }, 100);
    }
);

// When autol is used, the raster scaling will dynamically updated per-line
// with autol=1 each line is scaled by itself, so this should render as vertical bars
interactiveTest(
    "t2000 file (default autol)",
    "Does the plot render a vertical bars?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            autol: 1,
        });
        assert.notEqual(plot, null);

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
        });
    }
);

// this data is rendered where the left side of the plot will be a constant color,
// the right side should start as constant red and then around 110 switch to a gradient
// that gradually go back to all red.  The 'height' of the rainbow grows as autol
// is increased
interactiveTest(
    "t2000 file (default autol)",
    "Does the plot render a gradient on the right?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            autol: 5,
        });
        assert.notEqual(plot, null);

        var framesize = 128;
        var height = 120;

        var raster = [];
        var val = 0;
        for (var j = 0; j < height; j += 1) {
            for (var i = 0; i < framesize; i += 1) {
                if (i < framesize / 2) {
                    val = 1;
                } else {
                    if (j < 60) {
                        val = 100;
                    } else {
                        val = 10;
                    }
                }
                raster.push(val);
            }
        }

        plot.overlay_array(raster, {
            type: 2000,
            subsize: framesize,
            file_name: "raster",
        });
    }
);

interactiveTest(
    "t2000 layer2D (default autol)",
    "Does the plot correctly autoscale after 100 rows?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 16384; i++) {
            data.push(0);
        }
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: 16384,
        });
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            if (cnt === 100) {
                data = [];
                for (var i = 0; i < 16384; i++) {
                    data.push(i);
                }
            }
            plot.push(lyr0, data);
        }, 100);
    }
);

interactiveTest(
    "layer2D (smoothing)",
    "Do you see evenly spaced lines?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            smoothing: true,
        });
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 16384; i++) {
            if (i % 3 === 0 && i > 400 && i < 800) {
                data.push(400);
            } else if (i % 3 === 0 && i > 1200 && i < 1600) {
                data.push(800);
            } else {
                data.push(0);
            }
        }
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 16384,
            },
            null,
            {
                smoothing: true,
            }
        );
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            plot.push(lyr0, data);
        }, 100);
    }
);

interactiveTest(
    "layer2D (no compression)",
    "you should see lines between 20-40, 60-90, and 90-100?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcmp: 1,
        });
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 100; i++) {
            if (i > 20 && i < 40) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(200);
                } else {
                    data.push(0);
                }
            } else if (i > 60 && i < 80) {
                if (i % 3 === 0) {
                    data.push(50);
                } else if (i % 3 === 1) {
                    data.push(250);
                } else {
                    data.push(0);
                }
            } else if (i > 90) {
                data.push(300);
            } else {
                data.push(0);
            }
        }
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: 100,
        });
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            plot.push(lyr0, data);
        }, 100);
    }
);

interactiveTest(
    "layer2D (average compression)",
    "Do you see evenly spaced lines of the same color?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcmp: 1,
        });
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 16384; i++) {
            if (i > 400 && i < 800) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(200);
                } else {
                    data.push(0);
                }
            } else if (i > 1200 && i < 1600) {
                if (i % 3 === 0) {
                    data.push(50);
                } else if (i % 3 === 1) {
                    data.push(250);
                } else {
                    data.push(0);
                }
            } else {
                data.push(0);
            }
        }
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: 16384,
        });
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            plot.push(lyr0, data);
        }, 100);
    }
);

interactiveTest(
    "layer2D (min compression)",
    "Do you see two lines of the same color?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcmp: 2,
        });
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 16384; i++) {
            if (i > 400 && i < 800) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(50);
                }
            } else if (i > 1200 && i < 1600) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(50);
                }
            } else {
                data.push(0);
            }
        }
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: 16384,
        });
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            plot.push(lyr0, data);
        }, 100);
    }
);

interactiveTest(
    "layer2D (max compression)",
    "Do you see two lines of the same color?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcmp: 3,
        });
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 16384; i++) {
            if (i > 400 && i < 800) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(0);
                }
            } else if (i > 1200 && i < 1600) {
                if (i % 3 === 0) {
                    data.push(200);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(0);
                }
            } else {
                data.push(0);
            }
        }
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: 16384,
        });
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            plot.push(lyr0, data);
        }, 100);
    }
);

interactiveTest(
    "layer2D (abs-max compression)",
    "Do you see two lines of the same color?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcmp: 5,
        });
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 16384; i++) {
            if (i > 400 && i < 800) {
                if (i % 3 === 0) {
                    data.push(800);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(0);
                }
            } else if (i > 1200 && i < 1600) {
                if (i % 3 === 0) {
                    data.push(-800);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(0);
                }
            } else {
                data.push(0);
            }
        }
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: 16384,
        });
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            plot.push(lyr0, data);
        }, 100);
    }
);

interactiveTest(
    "layer2D (change compression layerAvg)",
    "Do you see two lines of the same color?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcmp: 4,
        });
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 16384; i++) {
            if (i > 400 && i < 800) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(50);
                }
            } else if (i > 1200 && i < 1600) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(50);
                }
            } else {
                data.push(0);
            }
        }
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 16384,
            },
            {
                xcmp: 2,
            }
        );
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            plot.push(lyr0, data);
        }, 100);
    }
);

interactiveTest(
    "layer2D (change compression settings)",
    "Do you see two lines of the same color after 100 lines?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcmp: 4,
        });
        assert.notEqual(plot, null);
        var data = [];
        for (var i = 0; i < 16384; i++) {
            if (i > 400 && i < 800) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(50);
                }
            } else if (i > 1200 && i < 1600) {
                if (i % 3 === 0) {
                    data.push(100);
                } else if (i % 3 === 1) {
                    data.push(400);
                } else {
                    data.push(50);
                }
            } else {
                data.push(0);
            }
        }
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: 16384,
        });
        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            cnt = cnt + 1;
            plot.push(lyr0, data);

            if (cnt === 100) {
                plot.change_settings({
                    xcmp: 2,
                });
            }
        }, 100);
    }
);

interactiveTest(
    "raster (ystart)",
    "Does the plot start at y-axis 100?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var framesize = 128;
        var height = 120;
        var ramp = [];
        for (var j = 0; j < height; j += 1) {
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
        }
        plot.overlay_array(ramp, {
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.5,
            ystart: 100,
        });
    }
);

interactiveTest(
    "raster (timecode)",
    'Do you see a raster that starts at 2014 July 4th for one hour (use "t" to check)?',
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var framesize = 128;
        var height = 120;
        var ramp = [];
        for (var j = 0; j < height; j += 1) {
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
        }
        plot.overlay_array(ramp, {
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.5,
            yunits: 4,
            timecode: sigplot.m.j1970toj1950(new Date("2014-07-04T00:00:00Z")),
        });
    }
);

interactiveTest(
    "raster (smoothing)",
    "Is the following raster smoothed?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            rasterSmoothing: true,
        });
        var framesize = 200;
        var height = 100;
        var ramp = [];
        for (var j = 0; j < height; j += 1) {
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
        }
        plot.overlay_array(ramp, {
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
        });
    }
);

interactiveTest(
    "raster (smart-smoothing)",
    "Is the following raster smoothed until zoomed?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            rasterSmoothing: 3.0,
        });
        var framesize = 200;
        var height = 100;
        var ramp = [];
        for (var j = 0; j < height; j += 1) {
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
        }
        plot.overlay_array(ramp, {
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            yunits: 4,
            timecode: sigplot.m.j1970toj1950(new Date("2014-07-04T00:00:00Z")),
        });
    }
);

interactiveTest(
    "sigplot b&w penny 1",
    "Do you see a b&w penny",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xc: 0,
        });
        assert.notEqual(plot, null);
        plot.overlay_href("dat/penny.prm");
    }
);
interactiveTest(
    "sigplot b&w penny 2",
    "Do you see a b&w penny",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            cmap: "Greyscale",
        });
        assert.notEqual(plot, null);
        plot.overlay_href("dat/penny.prm");
    }
);
interactiveTest(
    "sigplot b&w penny 3",
    "Do you see a b&w penny",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.overlay_href("dat/penny.prm");
        plot.change_settings({
            cmap: "Greyscale",
        });
    }
);
interactiveTest(
    "sigplot b&w penny 4",
    "Do you see a b&w penny",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            cmap: 0,
        });
        assert.notEqual(plot, null);
        plot.overlay_href("dat/penny.prm");
    }
);
interactiveTest(
    "sigplot b&w penny 5",
    "Do you see a b&w penny",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.overlay_href("dat/penny.prm");
        plot.change_settings({
            cmap: 0,
        });
    }
);
interactiveTest(
    "sigplot (custom cmap) penny",
    "Do you see a red penny",
    function (assert) {
        var container = document.getElementById("plot");
        var colors = [
            {
                pos: 0,
                red: 0,
                green: 0,
                blue: 0,
            },
            {
                pos: 60,
                red: 50,
                green: 0,
                blue: 0,
            },
            {
                pos: 100,
                red: 100,
                green: 0,
                blue: 0,
            },
            {
                pos: 100,
                red: 0,
                green: 0,
                blue: 0,
            },
            {
                pos: 100,
                red: 0,
                green: 0,
                blue: 0,
            },
            {
                pos: 100,
                red: 0,
                green: 0,
                blue: 0,
            },
            {
                pos: 100,
                red: 0,
                green: 0,
                blue: 0,
            },
        ];
        var plot = new sigplot.Plot(container, {
            cmap: colors,
        });
        assert.notEqual(plot, null);
        plot.overlay_href("dat/penny.prm");
    }
);

interactiveTest(
    "sigplot penny (scaled)",
    "Manually scale the Z-axis, does it work (i.e. all blue)?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            zmin: 50,
            zmax: 100,
        });
        assert.notEqual(plot, null);
        assert.equal(plot._Gx.zmin, 50);
        assert.equal(plot._Gx.zmax, 100);
        assert.equal(plot._Gx.autoz, 0);
        plot.overlay_href("dat/penny.prm", function () {
            assert.equal(plot._Gx.zmin, 50);
            assert.equal(plot._Gx.zmax, 100);
            plot.change_settings({
                zmin: 25,
            });
            assert.equal(plot._Gx.zmin, 25);
            plot.change_settings({
                zmax: 1000,
            });
            assert.equal(plot._Gx.zmax, 1000);
        });
    }
);

interactiveTest(
    "scrolling raster two pipes",
    "Do you see a scrolling raster with two pipes?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        // typically when you have two raster layers you will want
        // to manually fix both zmin and zmax, otherwise they will
        // both be trying to adjust the zmin/zmax for autoscaling
        plot.change_settings({
            zmin: -128,
            zmax: 0,
        });
        var framesize = 128;
        var layer_0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "layer0",
            ydelta: 0.25,
        });
        assert.equal(plot.get_lyrn(layer_0), 0);
        var layer_1 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: Math.floor(framesize / 3),
                file_name: "layer1",
                ydelta: 0.25,
            },
            {
                opacity: 0.5,
            }
        );
        assert.equal(plot.get_lyrn(layer_1), 1);

        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(-1 * (i + 1));
            }
            plot.push(layer_0, ramp);
        }, 500);

        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < Math.floor(framesize / 3); i += 1) {
                ramp.push(-2 * (i + 1));
            }
            plot.push(layer_1, ramp);
        }, 100);
    }
);

interactiveTest(
    "scrolling raster fixed scale",
    "Do you see a scrolling raster?",
    function (assert) {
        var container = document.getElementById("plot");
        // the colors will start around 50 and max out around 100
        var plot = new sigplot.Plot(container, {
            zmin: 50,
            zmax: 100,
        });
        assert.notEqual(plot, null);
        var framesize = 128;
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.25,
        });
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
    "scrolling raster (scaled)",
    "Do you see the scaling change correctly?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.25,
        });

        var cnt = 0;
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            plot.push(lyr0, ramp);
            cnt = cnt + 1;
            if (cnt === 40) {
                // After 40 lines, change the scaling changes
                plot.change_settings({
                    zmin: 50,
                    zmax: 100,
                });
            }
        }, 100);
    }
);

interactiveTest(
    "raster (small xdelta)",
    "Do you see the expected raster?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.25,
            xdelta: 0.0009,
        });
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
    "zoomed scrolling raster",
    "Do you see a scrolling raster with no render errors?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.25,
        });
        plot.zoom(
            {
                x: 95,
                y: 0,
            },
            {
                x: 106.9,
                y: 10,
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
    "xcmp raster align check",
    "Do you see a line centered at 6000?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            xcmp: 3,
        });
        assert.notEqual(plot, null);
        var framesize = 9000;
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: framesize,
                file_name: "test",
            },
            {}
        );
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                if (i > 5990 && i < 6010) {
                    ramp.push(100);
                } else {
                    ramp.push(0);
                }
            }
            plot.push(lyr0, ramp);
        }, 100);
    }
);

interactiveTest(
    "falling raster (timecode)",
    "Do you see a falling raster that starts at 2014 July 4th?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
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
                ydelta: 0.5, // two frames a second
                yunits: 4,
                timecode: sigplot.m.j1970toj1950(
                    new Date("2014-07-04T00:00:00Z")
                ),
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
        }, 500);
    }
);

interactiveTest(
    "falling raster (timestamp)",
    "Do you see a falling raster that starts at 2014 July 4th?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var now = new Date("2014-07-04T00:00:00Z");
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: framesize,
                file_name: "ramp",
                ydelta: 0.5, // two frames a second
                yunits: 4,
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
            plot.push(lyr0, ramp, {
                timestamp: now,
            });
            now.setSeconds(now.getSeconds() + 0.5);
        }, 500);
    }
);

interactiveTest(
    "rising raster (timecode)",
    "Do you see a rising raster that starts at 2014 July 4th?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
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
                ydelta: 0.5, // two frames a second
                yunits: 4,
                timecode: sigplot.m.j1970toj1950(
                    new Date("2014-07-04T00:00:00Z")
                ),
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
        }, 500);
    }
);

interactiveTest(
    "rising raster (timestamp)",
    "Do you see a rising raster that starts at 2014 July 4th?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var now = new Date("2014-07-04T00:00:00Z");
        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: framesize,
                file_name: "ramp",
                ydelta: 0.5, // two frames a second
                yunits: 4,
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
            plot.push(lyr0, ramp, {
                timestamp: now,
            });
            now.setSeconds(now.getSeconds() + 0.5);
        }, 500);
    }
);

interactiveTest(
    "raster changing xstart",
    "Do you see a falling raster that stays the same while the axis shifts?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
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
    "raster changing LPS",
    "Do you see a falling raster redrawn with alternating cursor speed every 10 seconds?",
    function (assert) {
        var container = document.getElementById("plot");
        var initialLps = 50;
        var alternateLps = 200;
        var lpsVals = [initialLps, alternateLps];
        var currentLps = lpsVals[0];
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr_uuid = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            xstart: 0,
            ydelta: 0.25,
            lps: initialLps,
        });
        var toggleLps = function () {
            if (plot.get_layer(0).lps === lpsVals[0]) {
                currentLps = lpsVals[1];
            } else {
                currentLps = lpsVals[0];
            }
            plot.deoverlay(lyr_uuid);
            plot.overlay_pipe({
                type: 2000,
                subsize: framesize,
                file_name: "ramp",
                xstart: 0,
                ydelta: 0.25,
            });
        };
        assert.strictEqual(plot.get_layer(0).lps, initialLps);
        var count = 0;
        ifixture.interval = window.setInterval(function () {
            count++;
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            if (count % 20 === 0) {
                toggleLps();
            }
            plot.push(lyr_uuid, ramp, {
                lps: currentLps,
            });
        }, 500);
    }
);

interactiveTest(
    "raster changing xdelta",
    "Do you see a falling raster that stays the same while the axis increases?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.25,
        });
        var xdelta = 1;
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(i + 1);
            }
            xdelta *= 2;
            plot.push(lyr0, ramp, {
                xdelta: xdelta,
            });
        }, 500);
    }
);

interactiveTest(
    "raster drawmode change (scrolling -> rising -> scrolling)",
    "Do you see the scrolling line?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.25,
        });
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(-1 * (i + 1));
            }
            plot.push(lyr0, ramp);
        }, 100);
        setTimeout(function () {
            plot.change_settings({
                drawmode: "rising",
            });
            setTimeout(function () {
                plot.change_settings({
                    drawmode: "scrolling",
                });
            }, 5000);
        }, 5000);
    }
);

interactiveTest(
    "raster drawmode change (scrolling -> falling -> scrolling)",
    "Do you see the scrolling line?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.change_settings({
            autol: 5,
        });
        var framesize = 128;
        var lyr0 = plot.overlay_pipe({
            type: 2000,
            subsize: framesize,
            file_name: "ramp",
            ydelta: 0.25,
        });
        ifixture.interval = window.setInterval(function () {
            var ramp = [];
            for (var i = 0; i < framesize; i += 1) {
                ramp.push(-1 * (i + 1));
            }
            plot.push(lyr0, ramp);
        }, 100);
        setTimeout(function () {
            plot.change_settings({
                drawmode: "falling",
            });
            setTimeout(function () {
                plot.change_settings({
                    drawmode: "scrolling",
                });
            }, 5000);
        }, 5000);
    }
);

interactiveTest(
    "SP format",
    "Do you see a plot that looks like a checkerboard?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        var bf = sigplot.m.initialize();
        bf.format = "SP";
        bf.setData(new Uint8Array([170, 85, 170, 85, 170, 85, 170, 85]).buffer);

        assert.equal(bf.dview.getBit(0), 1);
        assert.equal(bf.dview.getBit(1), 0);
        assert.equal(bf.dview.getBit(2), 1);
        assert.equal(bf.dview.getBit(3), 0);
        assert.equal(bf.dview.getBit(4), 1);
        assert.equal(bf.dview.getBit(5), 0);
        assert.equal(bf.dview.getBit(6), 1);
        assert.equal(bf.dview.getBit(7), 0);

        assert.equal(bf.dview.getBit(56), 0);
        assert.equal(bf.dview.getBit(57), 1);
        assert.equal(bf.dview.getBit(58), 0);
        assert.equal(bf.dview.getBit(59), 1);
        assert.equal(bf.dview.getBit(60), 0);
        assert.equal(bf.dview.getBit(61), 1);
        assert.equal(bf.dview.getBit(62), 0);
        assert.equal(bf.dview.getBit(63), 1);

        plot.overlay_bluefile(bf, {
            subsize: 8,
            layerType: "2D",
        });
    }
);

interactiveTest(
    "B&W SP format",
    "Do you see a plot that looks like a black and white checkerboard?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {
            cmap: 0,
        });
        assert.notEqual(plot, null);
        var bf = sigplot.m.initialize();
        bf.format = "SP";
        bf.setData(new Uint8Array([170, 85, 170, 85, 170, 85, 170, 85]).buffer);

        plot.overlay_bluefile(bf, {
            subsize: 8,
            layerType: "2D",
        });
    }
);

interactiveTest(
    "SP file",
    "Do you see a line plot of binary points 0 to 1?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.overlay_href("dat/scalarpacked.tmp");
    }
);

interactiveTest(
    "SP file raster",
    "Do you see a binary plot of random data?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);
        plot.overlay_href("dat/scalarpacked.tmp", null, {
            subsize: 64,
            layerType: "2D",
        });
    }
);

interactiveTest(
    "Raster downscale max",
    "Do you see two red lines in the middle?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.change_settings({
            cmode: "LO",
            autol: 5,
        });

        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 0,
                file_name: "random",
                xstart: null,
                xdelta: null,
            },
            {
                downscale: "max",
            }
        );

        var hdl = window.setInterval(function () {
            var random = [];
            var framesize = 32768;
            for (var i = 0; i < framesize; i += 1) {
                random.push(Math.random() + 100);
            }
            random[500] = 1;
            random[15990] = 1000;
            random[15991] = 100;
            random[15992] = 100;
            random[15993] = 100;
            random[15995] = 100;
            random[15996] = 100;
            random[15997] = 100;
            random[15998] = 100;
            random[15999] = 1000;
            random[16000] = 1000;
            random[16001] = 1000;
            random[16002] = 1000;
            random[18000] = 1000;

            plot.push(lyr0, random, {
                subsize: framesize,
                xstart: 5e6,
                xdelta: 10,
            });
        }, 300);
    }
);

interactiveTest(
    "Raster downscale min",
    "Do you see one black line on the left?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.change_settings({
            cmode: "LO",
            autol: 5,
        });

        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 0,
                file_name: "random",
                xstart: null,
                xdelta: null,
            },
            {
                downscale: "min",
            }
        );

        var hdl = window.setInterval(function () {
            var random = [];
            var framesize = 32768;
            for (var i = 0; i < framesize; i += 1) {
                random.push(Math.random() + 50);
            }
            random[500] = 1;
            random[15990] = 1000;
            random[15991] = 100;
            random[15992] = 100;
            random[15993] = 100;
            random[15995] = 100;
            random[15996] = 100;
            random[15997] = 100;
            random[15998] = 100;
            random[15999] = 1000;
            random[16000] = 1000;
            random[16001] = 1000;
            random[16002] = 1000;
            random[18000] = 1000;

            plot.push(lyr0, random, {
                subsize: framesize,
                xstart: 5e6,
                xdelta: 10,
            });
        }, 300);
    }
);

interactiveTest(
    "Raster downscale minmax",
    "Do you see one black line on the left and two red lines in the middle?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.change_settings({
            cmode: "LO",
            autol: 5,
        });

        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 0,
                file_name: "random",
                xstart: null,
                xdelta: null,
            },
            {
                downscale: "minmax",
            }
        );

        var hdl = window.setInterval(function () {
            var random = [];
            var framesize = 32768;
            for (var i = 0; i < framesize; i += 1) {
                random.push(Math.random() + 50);
            }
            random[500] = 1;
            random[15990] = 1000;
            random[15991] = 100;
            random[15992] = 100;
            random[15993] = 100;
            random[15995] = 100;
            random[15996] = 100;
            random[15997] = 100;
            random[15998] = 100;
            random[15999] = 1000;
            random[16000] = 1000;
            random[16001] = 1000;
            random[16002] = 1000;
            random[18000] = 1000;

            plot.push(lyr0, random, {
                subsize: framesize,
                xstart: 5e6,
                xdelta: 10,
            });
        }, 300);
    }
);

interactiveTest(
    "Raster downscale minmax zoom",
    "Do you see a line at 16000 and 18000?",
    function (assert) {
        var container = document.getElementById("plot");
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        plot.change_settings({
            cmode: "LO",
            autol: 5,
        });

        var lyr0 = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 0,
                file_name: "random",
            },
            {
                downscale: "minmax",
            }
        );

        window.setTimeout(function () {
            plot.zoom(
                {
                    x: 15000,
                    y: 5,
                },
                {
                    x: 19000,
                    y: 25,
                }
            );
        });

        var hdl = window.setInterval(function () {
            var random = [];
            var framesize = 32768;
            for (var i = 0; i < framesize; i += 1) {
                random.push(Math.random() + 50);
            }
            random[500] = 1;
            random[15990] = 1000;
            random[15991] = 100;
            random[15992] = 100;
            random[15993] = 100;
            random[15995] = 100;
            random[15996] = 100;
            random[15997] = 100;
            random[15998] = 100;
            random[15999] = 1000;
            random[16000] = 1000;
            random[16001] = 1000;
            random[16002] = 1000;
            random[18000] = 1000;

            plot.push(lyr0, random, {
                subsize: framesize,
            });
        }, 300);
    }
);
