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
QUnit.module('sigplot-interactive-layer2d', {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach
});

interactiveTest('sigplot 2d deoverlay', 'Do you see a raster? Is alignment of x/y axes correct?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var lyr_n = plot.overlay_array([], {}, {
        layerType: sigplot.Layer2D
    });
    var data = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0]
    ];
    plot.deoverlay(lyr_n);
    lyr_n = plot.overlay_array(data);
});

interactiveTest('sigplot panxpad layer2d', 'Do you see spikes at 10 and 110 with an x-axis from 0 to 120?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        panxpad: 10
    });
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 101; i++) {
        if ((i === 0) || (i === 100)) {
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
});

interactiveTest('pipe 2D name', 'Do you see a random data plot (0 to 1 ) properly named "Test" in the legend', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        legend: true
    });
    assert.notEqual(plot, null);
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 100
    }, {
        framesize: 100,
        name: "Test"
    });
    ifixture.interval = window.setInterval(function() {
        var random = [];
        for (var i = 0; i < 100; i += 1) {
            random.push(Math.random());
        }
        plot.push(lyr0, random);
    }, 100);
});


// When autol is used, the raster scaling will dynamically updated per-line
// with autol=1 each line is scaled by itself, so this should render as vertical bars
interactiveTest('t2000 file (default autol)', 'Does the plot render a vertical bars?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autol: 1
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
        file_name: "raster"
    });
});

// this data is rendered where the left side of the plot will be a constant color,
// the right side should start as constant red and then around 110 switch to a gradient
// that gradually go back to all red.  The 'height' of the rainbow grows as autol
// is increased
interactiveTest('t2000 file (default autol)', 'Does the plot render a gradient on the right?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autol: 5
    });
    assert.notEqual(plot, null);

    var framesize = 128;
    var height = 120;

    var raster = [];
    var val = 0;
    for (var j = 0; j < height; j += 1) {
        for (var i = 0; i < framesize; i += 1) {
            if (i < (framesize) / 2) {
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
        file_name: "raster"
    });
});

interactiveTest('t2000 layer2D (default autol)', 'Does the plot correctly autoscale after 100 rows?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 16384; i++) {
        data.push(0);
    }
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 16384
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        if (cnt === 100) {
            data = [];
            for (var i = 0; i < 16384; i++) {
                data.push(i);
            }
        }
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('layer2D (smoothing)', 'Do you see evenly spaced lines?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        smoothing: true
    });
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 16384; i++) {
        if ((i % 3 === 0) && (i > 400) && (i < 800)) {
            data.push(400);
        } else if ((i % 3 === 0) && (i > 1200) && (i < 1600)) {
            data.push(800);
        } else {
            data.push(0);
        }
    }
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 16384
    }, null, {
        smoothing: true
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('layer2D (no compression)', 'you should see lines between 20-40, 60-90, and 90-100?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xcmp: 1
    });
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 100; i++) {
        if ((i > 20) && (i < 40)) {
            if (i % 3 === 0) {
                data.push(100);
            } else if (i % 3 === 1) {
                data.push(200);
            } else {
                data.push(0);
            }
        } else if ((i > 60) && (i < 80)) {
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
        subsize: 100
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('layer2D (average compression)', 'Do you see evenly spaced lines of the same color?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xcmp: 1
    });
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 16384; i++) {
        if ((i > 400) && (i < 800)) {
            if (i % 3 === 0) {
                data.push(100);
            } else if (i % 3 === 1) {
                data.push(200);
            } else {
                data.push(0);
            }
        } else if ((i > 1200) && (i < 1600)) {
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
        subsize: 16384
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('layer2D (min compression)', 'Do you see two lines of the same color?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xcmp: 2
    });
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 16384; i++) {
        if ((i > 400) && (i < 800)) {
            if (i % 3 === 0) {
                data.push(100);
            } else if (i % 3 === 1) {
                data.push(400);
            } else {
                data.push(50);
            }
        } else if ((i > 1200) && (i < 1600)) {
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
        subsize: 16384
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('layer2D (max compression)', 'Do you see two lines of the same color?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xcmp: 3
    });
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 16384; i++) {
        if ((i > 400) && (i < 800)) {
            if (i % 3 === 0) {
                data.push(100);
            } else if (i % 3 === 1) {
                data.push(400);
            } else {
                data.push(0);
            }
        } else if ((i > 1200) && (i < 1600)) {
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
        subsize: 16384
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('layer2D (abs-max compression)', 'Do you see two lines of the same color?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xcmp: 5
    });
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 16384; i++) {
        if ((i > 400) && (i < 800)) {
            if (i % 3 === 0) {
                data.push(800);
            } else if (i % 3 === 1) {
                data.push(400);
            } else {
                data.push(0);
            }
        } else if ((i > 1200) && (i < 1600)) {
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
        subsize: 16384
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('layer2D (change compression layerAvg)', 'Do you see two lines of the same color?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xcmp: 4
    });
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 16384; i++) {
        if ((i > 400) && (i < 800)) {
            if (i % 3 === 0) {
                data.push(100);
            } else if (i % 3 === 1) {
                data.push(400);
            } else {
                data.push(50);
            }
        } else if ((i > 1200) && (i < 1600)) {
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
        subsize: 16384
    }, {
        xcmp: 2
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        plot.push(lyr0, data);
    }, 100);
});

interactiveTest('layer2D (change compression settings)', 'Do you see two lines of the same color after 100 lines?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xcmp: 4
    });
    assert.notEqual(plot, null);
    var data = [];
    for (var i = 0; i < 16384; i++) {
        if ((i > 400) && (i < 800)) {
            if (i % 3 === 0) {
                data.push(100);
            } else if (i % 3 === 1) {
                data.push(400);
            } else {
                data.push(50);
            }
        } else if ((i > 1200) && (i < 1600)) {
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
        subsize: 16384
    });
    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
        cnt = cnt + 1;
        plot.push(lyr0, data);

        if (cnt === 100) {
            plot.change_settings({
                xcmp: 2
            });
        }
    }, 100);
});

interactiveTest('raster (ystart)', 'Does the plot start at y-axis 100?', function(assert) {
    var container = document.getElementById('plot');
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
        ystart: 100
    });
});

interactiveTest('raster (timecode)', 'Do you see a raster that starts at 2014 July 4th for one hour (use "t" to check)?', function(assert) {
    var container = document.getElementById('plot');
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
        timecode: sigplot.m.j1970toj1950(new Date("2014-07-04T00:00:00Z"))
    });
});

interactiveTest('raster (smoothing)', 'Is the following raster smoothed?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        rasterSmoothing: true
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
        file_name: "ramp"
    });
});

interactiveTest('raster (smart-smoothing)', 'Is the following raster smoothed until zoomed?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        rasterSmoothing: 3.0
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
        timecode: sigplot.m.j1970toj1950(new Date("2014-07-04T00:00:00Z"))
    });
});

interactiveTest('sigplot b&w penny 1', 'Do you see a b&w penny', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xc: 0
    });
    assert.notEqual(plot, null);
    plot.overlay_href("dat/penny.prm");
});
interactiveTest('sigplot b&w penny 2', 'Do you see a b&w penny', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        cmap: "Greyscale"
    });
    assert.notEqual(plot, null);
    plot.overlay_href("dat/penny.prm");
});
interactiveTest('sigplot b&w penny 3', 'Do you see a b&w penny', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.overlay_href("dat/penny.prm");
    plot.change_settings({
        cmap: "Greyscale"
    });
});
interactiveTest('sigplot b&w penny 4', 'Do you see a b&w penny', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        cmap: 0
    });
    assert.notEqual(plot, null);
    plot.overlay_href("dat/penny.prm");
});
interactiveTest('sigplot b&w penny 5', 'Do you see a b&w penny', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.overlay_href("dat/penny.prm");
    plot.change_settings({
        cmap: 0
    });
});
interactiveTest('sigplot (custom cmap) penny', 'Do you see a red penny', function(assert) {
    var container = document.getElementById('plot');
    var colors = [{
        pos: 0,
        red: 0,
        green: 0,
        blue: 0
    }, {
        pos: 60,
        red: 50,
        green: 0,
        blue: 0
    }, {
        pos: 100,
        red: 100,
        green: 0,
        blue: 0
    }, {
        pos: 100,
        red: 0,
        green: 0,
        blue: 0
    }, {
        pos: 100,
        red: 0,
        green: 0,
        blue: 0
    }, {
        pos: 100,
        red: 0,
        green: 0,
        blue: 0
    }, {
        pos: 100,
        red: 0,
        green: 0,
        blue: 0
    }];
    var plot = new sigplot.Plot(container, {
        cmap: colors
    });
    assert.notEqual(plot, null);
    plot.overlay_href("dat/penny.prm");
});

interactiveTest('sigplot (viridis cmap) penny', 'Do you see a viridis colored penny', function(assert) {
    var container = document.getElementById('plot');
    var colors = [
        [0.267004, 0.004874, 0.329415],
        [0.268510, 0.009605, 0.335427],
        [0.269944, 0.014625, 0.341379],
        [0.271305, 0.019942, 0.347269],
        [0.272594, 0.025563, 0.353093],
        [0.273809, 0.031497, 0.358853],
        [0.274952, 0.037752, 0.364543],
        [0.276022, 0.044167, 0.370164],
        [0.277018, 0.050344, 0.375715],
        [0.277941, 0.056324, 0.381191],
        [0.278791, 0.062145, 0.386592],
        [0.279566, 0.067836, 0.391917],
        [0.280267, 0.073417, 0.397163],
        [0.280894, 0.078907, 0.402329],
        [0.281446, 0.084320, 0.407414],
        [0.281924, 0.089666, 0.412415],
        [0.282327, 0.094955, 0.417331],
        [0.282656, 0.100196, 0.422160],
        [0.282910, 0.105393, 0.426902],
        [0.283091, 0.110553, 0.431554],
        [0.283197, 0.115680, 0.436115],
        [0.283229, 0.120777, 0.440584],
        [0.283187, 0.125848, 0.444960],
        [0.283072, 0.130895, 0.449241],
        [0.282884, 0.135920, 0.453427],
        [0.282623, 0.140926, 0.457517],
        [0.282290, 0.145912, 0.461510],
        [0.281887, 0.150881, 0.465405],
        [0.281412, 0.155834, 0.469201],
        [0.280868, 0.160771, 0.472899],
        [0.280255, 0.165693, 0.476498],
        [0.279574, 0.170599, 0.479997],
        [0.278826, 0.175490, 0.483397],
        [0.278012, 0.180367, 0.486697],
        [0.277134, 0.185228, 0.489898],
        [0.276194, 0.190074, 0.493001],
        [0.275191, 0.194905, 0.496005],
        [0.274128, 0.199721, 0.498911],
        [0.273006, 0.204520, 0.501721],
        [0.271828, 0.209303, 0.504434],
        [0.270595, 0.214069, 0.507052],
        [0.269308, 0.218818, 0.509577],
        [0.267968, 0.223549, 0.512008],
        [0.266580, 0.228262, 0.514349],
        [0.265145, 0.232956, 0.516599],
        [0.263663, 0.237631, 0.518762],
        [0.262138, 0.242286, 0.520837],
        [0.260571, 0.246922, 0.522828],
        [0.258965, 0.251537, 0.524736],
        [0.257322, 0.256130, 0.526563],
        [0.255645, 0.260703, 0.528312],
        [0.253935, 0.265254, 0.529983],
        [0.252194, 0.269783, 0.531579],
        [0.250425, 0.274290, 0.533103],
        [0.248629, 0.278775, 0.534556],
        [0.246811, 0.283237, 0.535941],
        [0.244972, 0.287675, 0.537260],
        [0.243113, 0.292092, 0.538516],
        [0.241237, 0.296485, 0.539709],
        [0.239346, 0.300855, 0.540844],
        [0.237441, 0.305202, 0.541921],
        [0.235526, 0.309527, 0.542944],
        [0.233603, 0.313828, 0.543914],
        [0.231674, 0.318106, 0.544834],
        [0.229739, 0.322361, 0.545706],
        [0.227802, 0.326594, 0.546532],
        [0.225863, 0.330805, 0.547314],
        [0.223925, 0.334994, 0.548053],
        [0.221989, 0.339161, 0.548752],
        [0.220057, 0.343307, 0.549413],
        [0.218130, 0.347432, 0.550038],
        [0.216210, 0.351535, 0.550627],
        [0.214298, 0.355619, 0.551184],
        [0.212395, 0.359683, 0.551710],
        [0.210503, 0.363727, 0.552206],
        [0.208623, 0.367752, 0.552675],
        [0.206756, 0.371758, 0.553117],
        [0.204903, 0.375746, 0.553533],
        [0.203063, 0.379716, 0.553925],
        [0.201239, 0.383670, 0.554294],
        [0.199430, 0.387607, 0.554642],
        [0.197636, 0.391528, 0.554969],
        [0.195860, 0.395433, 0.555276],
        [0.194100, 0.399323, 0.555565],
        [0.192357, 0.403199, 0.555836],
        [0.190631, 0.407061, 0.556089],
        [0.188923, 0.410910, 0.556326],
        [0.187231, 0.414746, 0.556547],
        [0.185556, 0.418570, 0.556753],
        [0.183898, 0.422383, 0.556944],
        [0.182256, 0.426184, 0.557120],
        [0.180629, 0.429975, 0.557282],
        [0.179019, 0.433756, 0.557430],
        [0.177423, 0.437527, 0.557565],
        [0.175841, 0.441290, 0.557685],
        [0.174274, 0.445044, 0.557792],
        [0.172719, 0.448791, 0.557885],
        [0.171176, 0.452530, 0.557965],
        [0.169646, 0.456262, 0.558030],
        [0.168126, 0.459988, 0.558082],
        [0.166617, 0.463708, 0.558119],
        [0.165117, 0.467423, 0.558141],
        [0.163625, 0.471133, 0.558148],
        [0.162142, 0.474838, 0.558140],
        [0.160665, 0.478540, 0.558115],
        [0.159194, 0.482237, 0.558073],
        [0.157729, 0.485932, 0.558013],
        [0.156270, 0.489624, 0.557936],
        [0.154815, 0.493313, 0.557840],
        [0.153364, 0.497000, 0.557724],
        [0.151918, 0.500685, 0.557587],
        [0.150476, 0.504369, 0.557430],
        [0.149039, 0.508051, 0.557250],
        [0.147607, 0.511733, 0.557049],
        [0.146180, 0.515413, 0.556823],
        [0.144759, 0.519093, 0.556572],
        [0.143343, 0.522773, 0.556295],
        [0.141935, 0.526453, 0.555991],
        [0.140536, 0.530132, 0.555659],
        [0.139147, 0.533812, 0.555298],
        [0.137770, 0.537492, 0.554906],
        [0.136408, 0.541173, 0.554483],
        [0.135066, 0.544853, 0.554029],
        [0.133743, 0.548535, 0.553541],
        [0.132444, 0.552216, 0.553018],
        [0.131172, 0.555899, 0.552459],
        [0.129933, 0.559582, 0.551864],
        [0.128729, 0.563265, 0.551229],
        [0.127568, 0.566949, 0.550556],
        [0.126453, 0.570633, 0.549841],
        [0.125394, 0.574318, 0.549086],
        [0.124395, 0.578002, 0.548287],
        [0.123463, 0.581687, 0.547445],
        [0.122606, 0.585371, 0.546557],
        [0.121831, 0.589055, 0.545623],
        [0.121148, 0.592739, 0.544641],
        [0.120565, 0.596422, 0.543611],
        [0.120092, 0.600104, 0.542530],
        [0.119738, 0.603785, 0.541400],
        [0.119512, 0.607464, 0.540218],
        [0.119423, 0.611141, 0.538982],
        [0.119483, 0.614817, 0.537692],
        [0.119699, 0.618490, 0.536347],
        [0.120081, 0.622161, 0.534946],
        [0.120638, 0.625828, 0.533488],
        [0.121380, 0.629492, 0.531973],
        [0.122312, 0.633153, 0.530398],
        [0.123444, 0.636809, 0.528763],
        [0.124780, 0.640461, 0.527068],
        [0.126326, 0.644107, 0.525311],
        [0.128087, 0.647749, 0.523491],
        [0.130067, 0.651384, 0.521608],
        [0.132268, 0.655014, 0.519661],
        [0.134692, 0.658636, 0.517649],
        [0.137339, 0.662252, 0.515571],
        [0.140210, 0.665859, 0.513427],
        [0.143303, 0.669459, 0.511215],
        [0.146616, 0.673050, 0.508936],
        [0.150148, 0.676631, 0.506589],
        [0.153894, 0.680203, 0.504172],
        [0.157851, 0.683765, 0.501686],
        [0.162016, 0.687316, 0.499129],
        [0.166383, 0.690856, 0.496502],
        [0.170948, 0.694384, 0.493803],
        [0.175707, 0.697900, 0.491033],
        [0.180653, 0.701402, 0.488189],
        [0.185783, 0.704891, 0.485273],
        [0.191090, 0.708366, 0.482284],
        [0.196571, 0.711827, 0.479221],
        [0.202219, 0.715272, 0.476084],
        [0.208030, 0.718701, 0.472873],
        [0.214000, 0.722114, 0.469588],
        [0.220124, 0.725509, 0.466226],
        [0.226397, 0.728888, 0.462789],
        [0.232815, 0.732247, 0.459277],
        [0.239374, 0.735588, 0.455688],
        [0.246070, 0.738910, 0.452024],
        [0.252899, 0.742211, 0.448284],
        [0.259857, 0.745492, 0.444467],
        [0.266941, 0.748751, 0.440573],
        [0.274149, 0.751988, 0.436601],
        [0.281477, 0.755203, 0.432552],
        [0.288921, 0.758394, 0.428426],
        [0.296479, 0.761561, 0.424223],
        [0.304148, 0.764704, 0.419943],
        [0.311925, 0.767822, 0.415586],
        [0.319809, 0.770914, 0.411152],
        [0.327796, 0.773980, 0.406640],
        [0.335885, 0.777018, 0.402049],
        [0.344074, 0.780029, 0.397381],
        [0.352360, 0.783011, 0.392636],
        [0.360741, 0.785964, 0.387814],
        [0.369214, 0.788888, 0.382914],
        [0.377779, 0.791781, 0.377939],
        [0.386433, 0.794644, 0.372886],
        [0.395174, 0.797475, 0.367757],
        [0.404001, 0.800275, 0.362552],
        [0.412913, 0.803041, 0.357269],
        [0.421908, 0.805774, 0.351910],
        [0.430983, 0.808473, 0.346476],
        [0.440137, 0.811138, 0.340967],
        [0.449368, 0.813768, 0.335384],
        [0.458674, 0.816363, 0.329727],
        [0.468053, 0.818921, 0.323998],
        [0.477504, 0.821444, 0.318195],
        [0.487026, 0.823929, 0.312321],
        [0.496615, 0.826376, 0.306377],
        [0.506271, 0.828786, 0.300362],
        [0.515992, 0.831158, 0.294279],
        [0.525776, 0.833491, 0.288127],
        [0.535621, 0.835785, 0.281908],
        [0.545524, 0.838039, 0.275626],
        [0.555484, 0.840254, 0.269281],
        [0.565498, 0.842430, 0.262877],
        [0.575563, 0.844566, 0.256415],
        [0.585678, 0.846661, 0.249897],
        [0.595839, 0.848717, 0.243329],
        [0.606045, 0.850733, 0.236712],
        [0.616293, 0.852709, 0.230052],
        [0.626579, 0.854645, 0.223353],
        [0.636902, 0.856542, 0.216620],
        [0.647257, 0.858400, 0.209861],
        [0.657642, 0.860219, 0.203082],
        [0.668054, 0.861999, 0.196293],
        [0.678489, 0.863742, 0.189503],
        [0.688944, 0.865448, 0.182725],
        [0.699415, 0.867117, 0.175971],
        [0.709898, 0.868751, 0.169257],
        [0.720391, 0.870350, 0.162603],
        [0.730889, 0.871916, 0.156029],
        [0.741388, 0.873449, 0.149561],
        [0.751884, 0.874951, 0.143228],
        [0.762373, 0.876424, 0.137064],
        [0.772852, 0.877868, 0.131109],
        [0.783315, 0.879285, 0.125405],
        [0.793760, 0.880678, 0.120005],
        [0.804182, 0.882046, 0.114965],
        [0.814576, 0.883393, 0.110347],
        [0.824940, 0.884720, 0.106217],
        [0.835270, 0.886029, 0.102646],
        [0.845561, 0.887322, 0.099702],
        [0.855810, 0.888601, 0.097452],
        [0.866013, 0.889868, 0.095953],
        [0.876168, 0.891125, 0.095250],
        [0.886271, 0.892374, 0.095374],
        [0.896320, 0.893616, 0.096335],
        [0.906311, 0.894855, 0.098125],
        [0.916242, 0.896091, 0.100717],
        [0.926106, 0.897330, 0.104071],
        [0.935904, 0.898570, 0.108131],
        [0.945636, 0.899815, 0.112838],
        [0.955300, 0.901065, 0.118128],
        [0.964894, 0.902323, 0.123941],
        [0.974417, 0.903590, 0.130215],
        [0.983868, 0.904867, 0.136897],
        [0.993248, 0.906157, 0.143936]
    ];

    var plot = new sigplot.Plot(container, {
        cmap: colors
    });
    assert.notEqual(plot, null);
    plot.overlay_href("dat/penny.prm");
});

interactiveTest('sigplot penny (scaled)', 'Manually scale the Z-axis, does it work (i.e. all blue)?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        zmin: 50,
        zmax: 100
    });
    assert.notEqual(plot, null);
    assert.equal(plot._Gx.zmin, 50);
    assert.equal(plot._Gx.zmax, 100);
    assert.equal(plot._Gx.autoz, 0);
    plot.overlay_href("dat/penny.prm", function() {
        assert.equal(plot._Gx.zmin, 50);
        assert.equal(plot._Gx.zmax, 100);
        plot.change_settings({
            zmin: 25
        });
        assert.equal(plot._Gx.zmin, 25);
        plot.change_settings({
            zmax: 1000
        });
        assert.equal(plot._Gx.zmax, 1000);
    });
});

interactiveTest('scrolling raster two pipes', 'Do you see a scrolling raster with two pipes?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    // typically when you have two raster layers you will want
    // to manually fix both zmin and zmax, otherwise they will
    // both be trying to adjust the zmin/zmax for autoscaling
    plot.change_settings({
        zmin: -128,
        zmax: 0
    });
    var framesize = 128;
    var layer_0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "layer0",
        ydelta: 0.25
    });
    assert.equal(plot.get_lyrn(layer_0), 0);
    var layer_1 = plot.overlay_pipe({
        type: 2000,
        subsize: Math.floor(framesize / 3),
        file_name: "layer1",
        ydelta: 0.25
    }, {
        opacity: 0.5
    });
    assert.equal(plot.get_lyrn(layer_1), 1);

    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(-1 * (i + 1));
        }
        plot.push(layer_0, ramp);
    }, 500);

    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < Math.floor(framesize / 3); i += 1) {
            ramp.push(-2 * (i + 1));
        }
        plot.push(layer_1, ramp);
    }, 100);
});

interactiveTest('scrolling raster fixed scale', 'Do you see a scrolling raster?', function(assert) {
    var container = document.getElementById('plot');
    // the colors will start around 50 and max out around 100
    var plot = new sigplot.Plot(container, {
        zmin: 50,
        zmax: 100
    });
    assert.notEqual(plot, null);
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp);
    }, 100);
});

interactiveTest('scrolling raster (scaled)', 'Do you see the scaling change correctly?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    });

    var cnt = 0;
    ifixture.interval = window.setInterval(function() {
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
                zmax: 100
            });
        }
    }, 100);
});

interactiveTest('raster (small xdelta)', 'Do you see the expected raster?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25,
        xdelta: 0.0009
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp);
    }, 100);
});

interactiveTest('zoomed scrolling raster', 'Do you see a scrolling raster with no render errors?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    });
    plot.zoom({
        x: 95,
        y: 0
    }, {
        x: 106.9,
        y: 10
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp);
    }, 100);
});

interactiveTest('xcmp raster align check', 'Do you see a line centered at 6000?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xcmp: 3
    });
    assert.notEqual(plot, null);
    var framesize = 9000;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "test"
    }, {});
    ifixture.interval = window.setInterval(function() {
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
});

interactiveTest('falling raster (timecode)', 'Do you see a falling raster that starts at 2014 July 4th?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.5, // two frames a second
        yunits: 4,
        timecode: sigplot.m.j1970toj1950(new Date("2014-07-04T00:00:00Z"))
    }, {
        drawmode: "falling"
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp);
    }, 500);
});

interactiveTest('falling raster (timestamp)', 'Do you see a falling raster that starts at 2014 July 4th?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var now = new Date("2014-07-04T00:00:00Z");
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.5, // two frames a second
        yunits: 4
    }, {
        drawmode: "falling"
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp, {
            timestamp: now
        });
        now.setSeconds(now.getSeconds() + 0.5);
    }, 500);
});

interactiveTest('rising raster (timecode)', 'Do you see a rising raster that starts at 2014 July 4th?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.5, // two frames a second
        yunits: 4,
        timecode: sigplot.m.j1970toj1950(new Date("2014-07-04T00:00:00Z"))
    }, {
        drawmode: "rising"
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp);
    }, 500);
});

interactiveTest('rising raster (timestamp)', 'Do you see a rising raster that starts at 2014 July 4th?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var now = new Date("2014-07-04T00:00:00Z");
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.5, // two frames a second
        yunits: 4
    }, {
        drawmode: "rising"
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        plot.push(lyr0, ramp, {
            timestamp: now
        });
        now.setSeconds(now.getSeconds() + 0.5);
    }, 500);
});

interactiveTest('raster changing xstart', 'Do you see a falling raster that stays the same while the axis shifts?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        xstart: -64,
        ydelta: 0.25
    });
    var xstart = 0;
    var xstart_chng = 16;
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        if (Math.abs(xstart) >= 64) {
            xstart_chng = xstart_chng * -1;
        }
        xstart += xstart_chng;
        plot.push(lyr0, ramp, {
            xstart: xstart
        });
    }, 500);
});

interactiveTest('raster changing LPS', 'Do you see a falling raster redrawn with alternating cursor speed every 10 seconds?', function(assert) {
    var container = document.getElementById('plot');
    var initialLps = 50;
    var alternateLps = 200;
    var lpsVals = [initialLps, alternateLps];
    var currentLps = lpsVals[0];
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        xstart: 0,
        ydelta: 0.25,
        lps: initialLps
    });
    var toggleLps = function() {
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
            ydelta: 0.25
        });
    };
    assert.strictEqual(plot.get_layer(0).lps, initialLps);
    var count = 0;
    ifixture.interval = window.setInterval(function() {
        count++;
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        if (count % 20 === 0) {
            toggleLps();
        }
        plot.push(lyr_uuid, ramp, {
            lps: currentLps
        });
    }, 500);
});

interactiveTest('raster changing xdelta', 'Do you see a falling raster that stays the same while the axis increases?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    });
    var xdelta = 1;
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(i + 1);
        }
        xdelta *= 2;
        plot.push(lyr0, ramp, {
            xdelta: xdelta
        });
    }, 500);
});

interactiveTest('raster drawmode change (scrolling -> rising -> scrolling)', 'Do you see the scrolling line?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(-1 * (i + 1));
        }
        plot.push(lyr0, ramp);
    }, 100);
    setTimeout(function() {
        plot.change_settings({
            drawmode: "rising"
        });
        setTimeout(function() {
            plot.change_settings({
                drawmode: "scrolling"
            });
        }, 5000);
    }, 5000);
});

interactiveTest('raster drawmode change (scrolling -> falling -> scrolling)', 'Do you see the scrolling line?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        autol: 5
    });
    var framesize = 128;
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: framesize,
        file_name: "ramp",
        ydelta: 0.25
    });
    ifixture.interval = window.setInterval(function() {
        var ramp = [];
        for (var i = 0; i < framesize; i += 1) {
            ramp.push(-1 * (i + 1));
        }
        plot.push(lyr0, ramp);
    }, 100);
    setTimeout(function() {
        plot.change_settings({
            drawmode: "falling"
        });
        setTimeout(function() {
            plot.change_settings({
                drawmode: "scrolling"
            });
        }, 5000);
    }, 5000);
});

interactiveTest('SP format', 'Do you see a plot that looks like a checkerboard?', function(assert) {
    var container = document.getElementById('plot');
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
        layerType: "2D"
    });
});

interactiveTest('B&W SP format', 'Do you see a plot that looks like a black and white checkerboard?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        cmap: 0
    });
    assert.notEqual(plot, null);
    var bf = sigplot.m.initialize();
    bf.format = "SP";
    bf.setData(new Uint8Array([170, 85, 170, 85, 170, 85, 170, 85]).buffer);

    plot.overlay_bluefile(bf, {
        subsize: 8,
        layerType: "2D"
    });
});

interactiveTest('SP file', 'Do you see a line plot of binary points 0 to 1?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.overlay_href("dat/scalarpacked.tmp");
});

interactiveTest('SP file raster', 'Do you see a binary plot of random data?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.overlay_href("dat/scalarpacked.tmp", null, {
        subsize: 64,
        layerType: "2D"
    });
});

interactiveTest('Raster downscale max', 'Do you see two red lines in the middle?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    plot.change_settings({
        cmode: 'LO',
        autol: 5
    });

    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 0,
        file_name: "random",
        xstart: null,
        xdelta: null
    }, {
        downscale: "max"
    });

    var hdl = window.setInterval(function() {
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
            xdelta: 10
        });
    }, 300);
});

interactiveTest('Raster downscale min', 'Do you see one black line on the left?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    plot.change_settings({
        cmode: 'LO',
        autol: 5
    });

    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 0,
        file_name: "random",
        xstart: null,
        xdelta: null
    }, {
        downscale: "min"
    });

    var hdl = window.setInterval(function() {
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
            xdelta: 10
        });
    }, 300);
});

interactiveTest('Raster downscale minmax', 'Do you see one black line on the left and two red lines in the middle?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    plot.change_settings({
        cmode: 'LO',
        autol: 5
    });

    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 0,
        file_name: "random",
        xstart: null,
        xdelta: null
    }, {
        downscale: "minmax"
    });

    var hdl = window.setInterval(function() {
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
            xdelta: 10
        });

    }, 300);
});

interactiveTest('Raster downscale minmax zoom', 'Do you see a line at 16000 and 18000?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    plot.change_settings({
        cmode: 'LO',
        autol: 5
    });

    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 0,
        file_name: "random"
    }, {
        downscale: "minmax"
    });

    window.setTimeout(function() {
        plot.zoom({
            x: 15000,
            y: 5
        }, {
            x: 19000,
            y: 25
        });
    });

    var hdl = window.setInterval(function() {
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
});

interactiveTest('sigplot 2d array origin 2', 'Do you see a raster? Is alignment of x/y axes correct?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var data = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0]
    ];
    var lyr_n = plot.overlay_array(data, null, {
        preferred_origin: 2
    });
});

interactiveTest('type1000 file', 'Do you see ydelta calculated correctly?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.overlay_href("dat/ramp.tmp", null, {
        layerType: sigplot.Layer2D
    }, {
        subsize: 10
    });

});
