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
QUnit.module('sigplot-interactive-layer1d', {
    beforeEach: interactiveBeforeEach,
    afterEach: interactiveAfterEach
});

interactiveTest('sigplot 1d deoverlay', 'Do you see a ramp from 0 to 1023?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var lyr_n = plot.overlay_array([], {}, {
        layerType: sigplot.Layer1D
    });

    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }

    plot.deoverlay(lyr_n);

    lyr_n = plot.overlay_array(ramp, {
        file_name: "ramp"
    });
});

interactiveTest('sigplot multi-file overlay', 'Do you see a sin wave and a pulse train?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.overlay_href("dat/sin.tmp|dat/pulse_cx.tmp");
});

interactiveTest('empty t1000 array', 'Do you see a plot with two pulses?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var lyr0 = plot.overlay_array([], {
        file_name: "data1"
    });
    var lyr1 = plot.overlay_array(null, {
        file_name: "data2"
    });
    var pulse1 = [];
    var pulse2 = [];
    for (var i = 0; i < 1000; i++) {
        if ((i < 490) || (i > 510)) {
            pulse1.push(0);
        } else {
            pulse1.push(10.0);
        }
        if ((i < 240) || (i > 260)) {
            pulse2.push(0);
        } else {
            pulse2.push(10.0);
        }
    }
    plot.reload(lyr0, pulse1);
    plot.reload(lyr1, pulse2);
});

interactiveTest('empty t2000 array', 'Do you see a plot with two pulses?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var lyr0 = plot.overlay_array([], {
        type: 2000,
        subsize: 1000,
        file_name: "data1"
    }, {
        layerType: sigplot.Layer1D
    });
    var lyr1 = plot.overlay_array([], {
        type: 2000,
        subsize: 1000,
        file_name: "data2"
    }, {
        layerType: sigplot.Layer1D
    });
    var pulse1 = [];
    var pulse2 = [];
    for (var i = 0; i < 1000; i++) {
        if ((i < 490) || (i > 510)) {
            pulse1.push(0);
        } else {
            pulse1.push(10.0);
        }
        if ((i < 240) || (i > 260)) {
            pulse2.push(0);
        } else {
            pulse2.push(10.0);
        }
    }
    plot.reload(lyr0, pulse1);
    plot.reload(lyr1, pulse2);
});

interactiveTest('sigplot custom xmult', 'Do you see the x-axis in "hecto-" units (0-40)?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xmult: 100
    });
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }
    plot.overlay_href("dat/sin.tmp", null, {
        name: "x"
    });
});

interactiveTest('sigplot penny 1d legend default', 'Do you see a 1d penny with properly labeled legend (default)?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }
    plot.overlay_href("dat/penny.prm", null, {
        layerType: sigplot.Layer1D
    });
});

interactiveTest('sigplot penny 1d legend string override', 'Do you see a penny with properly labeled legend (abc)?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }
    plot.overlay_href("dat/penny.prm", null, {
        layerType: sigplot.Layer1D,
        name: "abc"
    });
});

interactiveTest('sigplot penny 1d legend multiple', 'Do you see a penny with properly labeled legend (one, two, three)?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }
    plot.overlay_href("dat/penny.prm", null, {
        layerType: sigplot.Layer1D,
        name: ["one", "two", "three"]
    });
});

interactiveTest('sigplot small xrange', 'Do you see a properly formatted axis for 999.9965-999.9985?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 4096; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp",
        xstart: 999996296.08025432,
        xdelta: 0.637054443359375,
        format: "SF"
    });
});

interactiveTest('sigplot panxpad', 'Do you see spikes at 10 and 110 with an x-axis from 0 to 120?', function(assert) {
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
    plot.overlay_array(ramp, {
        xstart: 10
    });
});

interactiveTest('sigplot xtimecode', 'Do you see a timecode xaxis 0 to 1h?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 4096; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp",
        format: "SF",
        xunits: 4
    });
});

interactiveTest('sigplot ytimecode', 'Do you see a timecode yaxis?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 31449600; i < 31449600 + 4096; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp",
        format: "SF",
        yunits: 4
    });
});

interactiveTest('sigplot ytimecode w/dates', 'Do you see a timecode yaxis?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    var now = Date.now() / 1000;
    for (var i = now; i < now + 2000; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp",
        format: "SF",
        yunits: 4
    });
});

interactiveTest('sigplot custom xlabel/ylabel', 'Do you see custom xlabel/ylabel?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xlabel: "CustomX",
        ylabel: "CustomY"
    });
    assert.notEqual(plot, null);
    var ramp = [];
    var now = Date.now() / 1000;
    for (var i = now; i < now + 2000; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp",
        format: "SF",
        yunits: 4
    });
});

interactiveTest('sigplot custom function xlabel/ylabel', 'Do you see custom xlabel/ylabel?', function(assert) {
    var xlabel = function(units, mult) {
        return "CustomX - " + units + " " + mult;
    };
    var ylabel = function(units, mult) {
        return "CustomY - " + units + " " + mult;
    };
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        xlabel: xlabel,
        ylabel: ylabel
    });
    assert.notEqual(plot, null);
    var ramp = [];
    var now = Date.now() / 1000;
    for (var i = now; i < now + 2000; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp",
        format: "SF",
        yunits: 4
    });
});

// TODO  this test seems broken
interactiveTest('sigplot expand full', 'Do you see a fully expanded plot?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autox: 3,
        autoy: 3,
        cmode: "IR",
        type: 2000,
        xlab: 1,
        ylab: 44,
        expand: true
    });
    assert.notEqual(plot, null);

    function plot2(plot) {
        plot.overlay_array([1, 2, 2, 3, 3, 4, 4, 5], {
            subsize: 4,
            type: 2000,
            format: "CD",
            xdelta: 7.01200008392334,
            xstart: 1435763625.898,
            xunits: 1,
            yunits: 44
        }, {
            layerType: sigplot.Layer1D,
            expand: true
        });
    }

    function plot1(plot) {
        plot.overlay_array([0, 0, 1, 1, 2, 2, 3, 3], {
            subsize: 4,
            type: 2000,
            format: "CD",
            xdelta: 7.01200008392334,
            xstart: 1435763625.898,
            xunits: 1,
            yunits: 44
        }, {
            layerType: sigplot.Layer1D,
            expand: true
        });
    }
    plot1(plot);
    plot2(plot);
});

interactiveTest('sigplot expand full on command', 'Do you see a fully expanded plot?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < (plot._Gx.bufmax * 2); i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp"
    });
    // if we are over bufmax, then only the first buffer is read and used for scaling the y-axis
    // you have to scroll to get the full y-axis
    assert.equal(plot._Gx.bufmax, 32768);
    assert.equal(plot._Gx.panxmin, 0);
    assert.equal(plot._Gx.panxmax, 65535);
    assert.equal(plot._Gx.panymin, -655.34); // based off 0.02 of the first buffer
    assert.equal(plot._Gx.panymax, 33422.34); // based off 0.02 of the first buffer
    assert.equal(plot._Mx.stk[0].xmin, 0);
    assert.equal(plot._Mx.stk[0].xmax, 32767);
    assert.equal(plot._Mx.stk[0].ymin, -655.34);
    assert.equal(plot._Mx.stk[0].ymax, 33422.34);

    plot.expand_full(true, true);

    assert.equal(plot._Gx.bufmax, 32768);
    assert.equal(plot._Gx.panxmin, 0);
    assert.equal(plot._Gx.panxmax, 65535);
    assert.equal(plot._Gx.panymin, -655.34); // based off 0.02 of the first buffer
    assert.equal(plot._Gx.panymax, 33422.34); // based off 0.02 of the first buffer
    assert.equal(plot._Mx.stk[0].xmin, 0);
    assert.equal(plot._Mx.stk[0].xmax, 65535);
    assert.equal(plot._Mx.stk[0].ymin, -655.34);
    assert.equal(plot._Mx.stk[0].ymax, 33422.34);
});

interactiveTest('sigplot custom axis label', 'Do you see the axis label "CustomY (a) vs. Time code format"?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }
    plot.overlay_href("dat/sin.tmp", null, {
        xlab: 4,
        ylab: ["CustomY", "a"]
    });
});

interactiveTest('sigplot custom axis label', 'Do you see the axis label "CustomY (Ka) vs. CustomX"?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, {
        file_name: "ramp"
    }, {
        xlab: "CustomX",
        ylab: ["CustomY", "a"]
    });
});

interactiveTest('check-xaxis-creep-reload', 'Do you see a pulse staying stationary on the x-axis?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 2;
    var pulse_position = 50;
    for (var i = 0; i < 100; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_array(pulse, {
        type: 1000
    });
    ifixture.interval = window.setInterval(function() {
        plot.reload(lyr0, pulse);
    }, 100);
});

interactiveTest('check-xaxis-creep-reload-oddsize', 'Do you see a pulse staying stationary on the x-axis?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 2;
    var pulse_position = 50;
    for (var i = 0; i < 99; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_array(pulse, {
        type: 1000
    });
    ifixture.interval = window.setInterval(function() {
        plot.reload(lyr0, pulse);
    }, 100);
});

interactiveTest('check-xaxis-creep-push', 'Do you see a pulse staying stationary on the x-axis?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 2;
    var pulse_position = 50;
    for (var i = 0; i < 100; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 100
    }, {
        layerType: "1D"
    });
    ifixture.interval = window.setInterval(function() {
        plot.push(lyr0, pulse);
    }, 100);
});

interactiveTest('check-xaxis-creep-push-oddsize', 'Do you see a pulse staying stationary on the x-axis?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 2;
    var pulse_position = 50;
    for (var i = 0; i < 99; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 99
    }, {
        layerType: "1D"
    });
    ifixture.interval = window.setInterval(function() {
        plot.push(lyr0, pulse);
    }, 100);
});

interactiveTest('check-xaxis-creep-push-partial', 'Do you see a pulse staying stationary on the x-axis?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 2;
    var pulse_position = 50;
    for (var i = 0; i < 100; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 100
    }, {
        layerType: "1D"
    });
    ifixture.interval = window.setInterval(function() {
        plot.push(lyr0, pulse.slice(0, 50));
        plot.push(lyr0, pulse.slice(50, 100));
    }, 100);
});

interactiveTest('reload', 'Do you see a pulse scrolling right?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 5;
    var pulse_position = 0;
    for (var i = 0; i < 1000; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_array(pulse, {
        type: 1000
    });
    ifixture.interval = window.setInterval(function() {
        pulse_position = (pulse_position + 1) % 1000;
        for (var i = 0; i < 1000; i++) {
            if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
                pulse[i] = 10.0;
            } else {
                pulse[i] = -10.0;
            }
        }
        plot.reload(lyr0, pulse);
    }, 100);
});

interactiveTest('xtimecode', 'Do you see a pulse scrolling right with an xtimecode axis?', function(assert) {
    var epochDelta = (20.0 * 365.0 + 5.0) * (24 * 3600 * 1000);
    var currentTime = (new Date().getTime() + epochDelta) / 1000;
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 5;
    var pulse_position = 0;
    for (var i = 0; i < 1000; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_array(pulse, {
        type: 1000,
        xstart: currentTime,
        xunits: 4
    });
    ifixture.interval = window.setInterval(function() {
        pulse_position = (pulse_position + 1) % 1000;
        for (var i = 0; i < 1000; i++) {
            if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
                pulse[i] = 10.0;
            } else {
                pulse[i] = -10.0;
            }
        }
        currentTime = (new Date().getTime() + epochDelta) / 1000;
        plot.reload(lyr0, pulse, {
            xstart: currentTime + 1
        });
    }, 100);
});

interactiveTest('t2000 odd-size layer1D (reload)', 'Do you see a stationary pulse?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 5;
    var pulse_position = 8192;
    for (var i = 0; i < 16385; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_array(null, {
        type: 2000,
        subsize: 16385
    }, {
        layerType: sigplot.Layer1D
    });
    ifixture.interval = window.setInterval(function() {
        var pulse = [];
        for (var i = 0; i < 16385; i++) {
            if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
                pulse.push(Math.random() * 10.0);
            } else {
                pulse.push(-10.0);
            }
        }
        plot.reload(lyr0, pulse);
    }, 100);
});

interactiveTest('t2000 odd-size layer1D (push)', 'Do you see a stationary pulse?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 5;
    var pulse_position = 8192;
    for (var i = 0; i < 16385; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_pipe({
        type: 2000,
        subsize: 16385
    }, {
        layerType: sigplot.Layer1D
    });
    ifixture.interval = window.setInterval(function() {
        var pulse = [];
        for (var i = 0; i < 16385; i++) {
            if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
                pulse.push(Math.random() * 10.0);
            } else {
                pulse.push(-10.0);
            }
        }
        plot.push(lyr0, pulse);
    }, 100);
});

interactiveTest('t2000 layer1D', 'Do you see a pulse scrolling right (type 2000)?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 5;
    var pulse_position = 0;
    for (var i = 0; i < 1000; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_array(null, {
        type: 2000,
        subsize: 1000
    }, {
        layerType: sigplot.Layer1D
    });
    ifixture.interval = window.setInterval(function() {
        pulse_position = (pulse_position + 1) % 1000;
        for (var i = 0; i < 1000; i++) {
            if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
                pulse[i] = 10.0;
            } else {
                pulse[i] = -10.0;
            }
        }
        plot.reload(lyr0, pulse);
    }, 100);
});

interactiveTest('zoom-xdelta', 'Is the plot fully scaled displaying a ramp?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1000; i++) {
        ramp.push(i);
    }
    var lyr0 = plot.overlay_array(ramp, {
        type: 1000,
        xstart: -500
    });
    plot.zoom({
        x: -250,
        y: 5
    }, {
        x: 250,
        y: -5
    });
    plot.reload(lyr0, ramp, {
        xstart: 0,
        xdelta: 50
    });
    plot.unzoom();
});

interactiveTest('reload', 'Do you see a pulse stationary at 0 while the axis shifts?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 1;
    var pulse_position = 500;
    var xstart = -500;
    var delta = 100;
    for (var i = 0; i < 1000; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_array(pulse, {
        type: 1000,
        xstart: xstart
    });
    ifixture.interval = window.setInterval(function() {
        pulse_position = pulse_position + delta;
        xstart = xstart - delta;
        if ((pulse_position >= 900) || (pulse_position <= 100)) {
            delta = delta * -1;
        }
        for (var i = 0; i < 1000; i++) {
            if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
                pulse[i] = 10.0;
            } else {
                pulse[i] = -10.0;
            }
        }
        plot.reload(lyr0, pulse, {
            xstart: xstart
        });
    }, 1000);
});

interactiveTest('reload', 'Do you see a pulse stationary at 0 while the axis grows?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    var pulse_width = 1;
    var pulse_position = 500;
    var xstart = -500;
    var xdelta = 1;
    for (var i = 0; i < 1000; i++) {
        if ((i >= pulse_position) && (i < (pulse_position + pulse_width))) {
            pulse.push(10.0);
        } else {
            pulse.push(-10.0);
        }
    }
    var lyr0 = plot.overlay_array(pulse, {
        type: 1000,
        xstart: -500,
        xdelta: xdelta
    });
    ifixture.interval = window.setInterval(function() {
        xdelta = xdelta * 2;
        xstart = -500 * xdelta;
        plot.reload(lyr0, pulse, {
            xstart: xstart,
            xdelta: xdelta
        });
    }, 5000);
});

interactiveTest('pipe 1D name', 'Do you see a random data plot (0 to 1 ) properly named "Test" in the legend', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        legend: true
    });
    assert.notEqual(plot, null);
    var lyr0 = plot.overlay_pipe({
        type: 1000
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

interactiveTest('complex scrolling line', 'Do you see a scrolling random data (0 to 1) plot that auto-scales', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        cmode: 3,
        autol: 5
    });
    var lyr0 = plot.overlay_pipe({
        type: 1000,
        format: "CF"
    }, {
        framesize: 32768,
        drawmode: "scrolling"
    });
    ifixture.interval = window.setInterval(function() {
        var random = [];
        for (var i = 0; i < 100; i += 1) {
            random.push(Math.random());
        }
        plot.push(lyr0, random);
    }, 100);
});

interactiveTest('dB auto-scale', 'Do you dblog plot that auto-scales', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        cmode: 6,
        autol: 5
    });
    var lyr0 = plot.overlay_pipe({
        type: 1000,
        format: "SF"
    }, {
        framesize: 1024
    });
    ifixture.interval = window.setInterval(function() {
        var random = [];
        for (var i = 0; i < 1024; i += 1) {
            random.push(Math.random() * 10);
        }
        plot.push(lyr0, random);
    }, 100);
});


// Demonstrate that changing the ymin/ymax settings
// will implicitly change the autoy settings
interactiveTest('sigplot layer1d change_settings ymin/ymax ',
    'Do you see a plot scaled from -10 to 50',
    function(assert) {
        var container = document.getElementById('plot');
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            if (i < 500) {
                pulse.push(0.0);
            } else {
                pulse.push(10.0);
            }
        }

        plot.overlay_array(pulse);
        plot.change_settings({
            ymin: -10,
            ymax: 50
        });
    });

interactiveTest('sigplot layer1d change_settings ymin/ymax ',
    'Do you see a plot scaled from 0.2 to 50',
    function(assert) {
        var container = document.getElementById('plot');
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            if (i < 500) {
                pulse.push(0.0);
            } else {
                pulse.push(10.0);
            }
        }

        plot.overlay_array(pulse);
        plot.change_settings({
            ymax: 50
        });
    });

interactiveTest('sigplot layer1d change_settings ymin/ymax ',
    'Do you see a plot scaled from -10 to 10.2',
    function(assert) {
        var container = document.getElementById('plot');
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            if (i < 500) {
                pulse.push(0.0);
            } else {
                pulse.push(10.0);
            }
        }

        plot.overlay_array(pulse);
        plot.change_settings({
            ymin: -10
        });
    });

// Prove that automatic autoy works when setting ymin/ymax
// back to null
interactiveTest('sigplot layer1d change_settings ymin/ymax ',
    'Do you see a plot scaled from 0.2 to 10.2',
    function(assert) {
        var container = document.getElementById('plot');
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            if (i < 500) {
                pulse.push(0.0);
            } else {
                pulse.push(10.0);
            }
        }

        plot.overlay_array(pulse);
        plot.change_settings({
            ymin: -10,
            ymax: 50
        });
        plot.change_settings({
            ymin: null,
            ymax: null
        });
    });

interactiveTest('sigplot layer1d framesize change',
    'Do you see a plots where the x-axis grows in size and the triangle stays centered?',
    function(assert) {
        var container = document.getElementById('plot');
        var plot = new sigplot.Plot(container, {});
        assert.notEqual(plot, null);

        var current_framesize = 100;
        var lyr0 = plot.overlay_pipe({
            type: 1000
        }, {
            framesize: current_framesize
        });

        ifixture.interval = window.setInterval(function() {
            var data = [];
            for (var i = 0; i < current_framesize; i += 1) {
                if (i < current_framesize / 2) {
                    data.push(i);
                } else {
                    data.push(current_framesize - i);
                }
            }
            // change the framesize
            plot.change_settings({
                framesize: current_framesize
            });
            // push the data
            plot.push(lyr0, data);
            // increate the framesize for the next pass
            current_framesize = current_framesize + 100;
        }, 2000);
    });

interactiveTest('LO ymin/ymax', 'Do you see a plot that scales -100 to -20?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        ymin: 1e-10,
        ymax: 1e-2,
        cmode: "LO"
    });
    assert.notEqual(plot, null);
    var data1 = [];
    for (var i = 0; i < 1024; i++) {
        data1.push(i % 2);
    }
    plot.overlay_array(data1, {
        file_name: "data1"
    });
    var data2 = [];
    for (var i = 0; i < 2048; i++) {
        if (i % 2) {
            data2.push(-60);
        } else {
            data2.push(-40);
        }
    }
    plot.overlay_array(data2, {
        file_name: "data2"
    });
});

interactiveTest('D1 ymin/ymax', 'Do you see a plot that scales -100 to -20?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        ymin: -100,
        ymax: -20,
        cmode: "D1"
    });
    assert.notEqual(plot, null);
    var data1 = [];
    for (var i = 0; i < 1024; i++) {
        data1.push(i % 2);
    }
    plot.overlay_array(data1, {
        file_name: "data1"
    });
    var data2 = [];
    for (var i = 0; i < 2048; i++) {
        if (i % 2) {
            data2.push(-60);
        } else {
            data2.push(-40);
        }
    }
    plot.overlay_array(data2, {
        file_name: "data2"
    });
});

interactiveTest('custom color line', 'Do you see an orange line?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1000; i++) {
        ramp.push(i);
    }
    var layer = plot.overlay_array(ramp, {
        file_name: "ramp"
    }, {
        color: "orange"
    });
});

interactiveTest('custom color line (change settings)', 'Do you see an orange line?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1000; i++) {
        ramp.push(i);
    }
    var layer = plot.overlay_array(ramp, {
        file_name: "ramp"
    });
    plot.get_layer(layer).color = "orange";
    plot.refresh();
});

interactiveTest('overlapping_highlights', 'Do you see an unbroken yellow line with red on each end?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1000; i++) {
        ramp.push(i);
    }
    var layer = plot.overlay_array(ramp, {
        file_name: "ramp"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 400,
        xend: 600,
        color: "red"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 600,
        xend: 800,
        color: "red"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 450,
        xend: 550,
        color: "yellow"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 550,
        xend: 650,
        color: "yellow"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 650,
        xend: 750,
        color: "yellow"
    });
});

interactiveTest('overlapping_highlights', 'Do you see an unbroken red line?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1000; i++) {
        ramp.push(i);
    }
    var layer = plot.overlay_array(ramp, {
        file_name: "ramp"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 450,
        xend: 550,
        color: "yellow"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 550,
        xend: 650,
        color: "yellow"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 650,
        xend: 750,
        color: "yellow"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 400,
        xend: 600,
        color: "red"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 600,
        xend: 800,
        color: "red"
    });
});

interactiveTest('overlapping_highlights', 'Do you see evenly spaced red/yellow highlights?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 1000; i++) {
        ramp.push(i);
    }
    var layer = plot.overlay_array(ramp, {
        file_name: "ramp"
    });
    // Create various overlap conditions
    plot.get_layer(layer).add_highlight({
        xstart: 375,
        xend: 450,
        color: "yellow"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 450,
        xend: 537,
        color: "yellow"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 537,
        xend: 700,
        color: "yellow"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 400,
        xend: 425,
        color: "red"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 450,
        xend: 475,
        color: "red"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 500,
        xend: 525,
        color: "red"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 550,
        xend: 575,
        color: "red"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 600,
        xend: 625,
        color: "red"
    });
    plot.get_layer(layer).add_highlight({
        xstart: 650,
        xend: 675,
        color: "red"
    });
});

interactiveTest('vertical and horizontal lines', 'Is there a horizontal and vertical line on every point?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    var ramp = [];
    for (var i = 0; i < 20; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, null, {
        name: "x",
        symbol: 0,
        line: 4
    });
});

interactiveTest('change_settings', 'does the plot show a range 200-2200', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autohide_panbars: false,
        cmode: 'LO',
        xcnt: 'continuous'
    });
    assert.notEqual(plot, null);

    var hcb = {
        xunits: 3,
        yunits: 26,
        size: 1024,
        xdelta: 20
    };
    var layerOptions = {
        framesize: 1024
    };

    var lyr_uuid = plot.overlay_pipe(hcb, layerOptions);

    var ramp = [];
    for (var i = 0; i < 1024; i += 1) {
        ramp.push(i + 1);
    }
    // do a syncronous push so we can make some assertions
    plot.push(lyr_uuid, ramp, null, true);
    assert.strictEqual(plot._Mx.stk[0].xmin, 0);
    assert.strictEqual(plot._Mx.stk[0].xmax, 20460);

    assert.strictEqual(plot._Gx.lyr[0].xmin, 0);
    assert.strictEqual(plot._Gx.lyr[0].xmax, 20460);

    plot.change_settings({
        xmin: 200,
        xmax: 2200
    });
    assert.strictEqual(plot._Mx.stk[0].xmin, 200);
    assert.strictEqual(plot._Mx.stk[0].xmax, 2200);

    // do a syncronous refresh
    plot._refresh();
    assert.strictEqual(plot._Mx.stk[0].xmin, 200);
    assert.strictEqual(plot._Mx.stk[0].xmax, 2200);

    // and another push
    plot.push(lyr_uuid, ramp, null, true);
    assert.strictEqual(plot._Mx.stk[0].xmin, 200);
    assert.strictEqual(plot._Mx.stk[0].xmax, 2200);

});

interactiveTest('headermod', 'does the plot show a range 200-2200', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autohide_panbars: false,
        cmode: 'LO',
        xcnt: 'continuous'
    });
    assert.notEqual(plot, null);

    var hcb = {
        xunits: 3,
        yunits: 26,
        size: 1024,
        xdelta: 20
    };
    var layerOptions = {
        framesize: 1024
    };

    var lyr_uuid = plot.overlay_pipe(hcb, layerOptions);

    var ramp = [];
    for (var i = 0; i < 1024; i += 1) {
        ramp.push(i + 1);
    }
    // do a syncronous push so we can make some assertions
    plot.push(lyr_uuid, ramp, null, true);
    assert.strictEqual(plot._Mx.stk[0].xmin, 0);
    assert.strictEqual(plot._Mx.stk[0].xmax, 20460);

    assert.strictEqual(plot._Gx.lyr[0].xmin, 0);
    assert.strictEqual(plot._Gx.lyr[0].xmax, 20460);

    plot.headermod(lyr_uuid, {
        xmin: 200,
        xmax: 2200
    });
    assert.strictEqual(plot._Mx.stk[0].xmin, 200);
    assert.strictEqual(plot._Mx.stk[0].xmax, 2200);

    assert.strictEqual(plot._Gx.lyr[0].xmin, 200);
    assert.strictEqual(plot._Gx.lyr[0].xmax, 2200);

    // do a syncronous refresh
    plot._refresh();
    assert.strictEqual(plot._Mx.stk[0].xmin, 200);
    assert.strictEqual(plot._Mx.stk[0].xmax, 2200);

    // and another push
    plot.push(lyr_uuid, ramp, null, true);
    assert.strictEqual(plot._Mx.stk[0].xmin, 200);
    assert.strictEqual(plot._Mx.stk[0].xmax, 2200);

    assert.strictEqual(plot._Gx.lyr[0].xmin, 200);
    assert.strictEqual(plot._Gx.lyr[0].xmax, 2200);
});

interactiveTest('correct scale after cmode change', 'is the plot correctly scaled with full scroll bars', function(assert) {
    var done = assert.async();

    var plot_options = {
        autohide_panbars: false,
        hide_note: true
    };
    var data = [1, 2, 3, 4, 5, 4, 3, 2, 1]; // the series of y-values
    var data_header = {
        xunits: "Time",
        xstart: 100, // the start of the x-axis
        xdelta: 50, // the x-axis step between each data point
        yunits: "Power"
    };
    var layer_options = {
        name: "Sample Data"
    };
    var plot = new sigplot.Plot(document.getElementById('plot'), plot_options);
    plot.overlay_array(data, data_header, layer_options);

    assert.equal(plot._Mx.stk[0].xmin, 100);
    assert.equal(plot._Mx.stk[0].xmax, 500);
    assert.equal(plot._Mx.stk[0].ymin, 0.92);
    assert.equal(plot._Mx.stk[0].ymax, 5.08);
    assert.equal(plot._Gx.panymin, 0.92);
    assert.equal(plot._Gx.panymax, 5.08);

    plot.change_settings({
        cmode: 6
    });
    window.setTimeout(function() {

        assert.equal(plot._Mx.stk[0].xmin, 100);
        assert.equal(plot._Mx.stk[0].xmax, 500);
        assert.equal(plot._Mx.stk[0].ymin, -0.13979400086720375);
        assert.equal(plot._Mx.stk[0].ymax, 7.129494044227391);
        assert.equal(plot._Gx.panymin, -0.13979400086720375);
        assert.equal(plot._Gx.panymax, 7.129494044227391);

        plot.change_settings({
            cmode: 3
        });

        assert.equal(plot._Mx.stk[0].xmin, 100);
        assert.equal(plot._Mx.stk[0].xmax, 500);
        assert.equal(plot._Mx.stk[0].ymin, 0.92);
        assert.equal(plot._Mx.stk[0].ymax, 5.08);
        assert.equal(plot._Gx.panymin, 0.92);
        assert.equal(plot._Gx.panymax, 5.08);

        done();

    }, 1000);
});

interactiveTest('1d preferred origin 2 array', 'Do you see a ramp from 0 to 1023 backwards?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);


    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }

    var lyr_n = plot.overlay_array(ramp, {}, {
        layerType: sigplot.Layer1D,
        preferred_origin: 2
    });
});

interactiveTest('1d array negative xdelta', 'Do you see a ramp from 0 to 1023 backwards?', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);


    var ramp = [];
    for (var i = 0; i < 1024; i++) {
        ramp.push(i);
    }

    var lyr_n = plot.overlay_array(ramp, {
        xstart: 300,
        xdelta: -0.1
    }, {
        layerType: sigplot.Layer1D
    });
});

interactiveTest('1d preferred origin 2 pipe', 'does the plot x-axis show correctly', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autohide_panbars: false,
        xcnt: 'continuous',
    });
    assert.notEqual(plot, null);

    var hcb = {
        xunits: 3,
        yunits: 26,
        size: 1024,
        xdelta: 20
    };
    var layerOptions = {
        framesize: 1024,
        preferred_origin: 2,

    };

    var lyr_uuid = plot.overlay_pipe(hcb, layerOptions);

    var ramp = [];
    for (var i = 0; i < 1024; i += 1) {
        ramp.push(i + 1);
    }
    // do a syncronous push so we can make some assertions if we want
    plot.push(lyr_uuid, ramp, null, true);
});

interactiveTest('1d negative xdelta pipe', 'does the plot x-axis show correctly', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        autohide_panbars: false,
        xcnt: 'continuous',
    });
    assert.notEqual(plot, null);

    var hcb = {
        xunits: 3,
        yunits: 26,
        size: 1024,
        xstart: 300,
        xdelta: -0.1
    };
    var layerOptions = {
        framesize: 1024,
    };

    var lyr_uuid = plot.overlay_pipe(hcb, layerOptions);

    var ramp = [];
    for (var i = 0; i < 1024; i += 1) {
        ramp.push(i + 1);
    }
    // do a syncronous push so we can make some assertions if we want
    plot.push(lyr_uuid, ramp, null, true);
});

interactiveTest('1d max-hold', 'does the plot have a max hold feature', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        legend: true,
        autol: 5
    });
    assert.notEqual(plot, null);
    var lyr0 = plot.overlay_pipe({
        type: 1000
    }, {
        framesize: 2048,
        name: "Test",
        maxhold: {
            decay: 0.01, // slow decay
            color: "red",
            traceoptions: {
                dashed: true
            }
        }
    });

    var offset = 0;
    window.setInterval(function() {
        offset = (offset + 200) % 2048
    }, 2000);

    ifixture.interval = window.setInterval(function() {
        var random = [];
        for (var i = 0; i < 2048; i += 1) {

            if ((i > offset) && (i < offset + 500)) {
                random.push(Math.random() * 3);
            } else {
                random.push(Math.random());
            }
        }
        plot.push(lyr0, random);
    }, 100);
});

interactiveTest('1d max-hold reset', 'does the plot have a max hold feature that resets every 5 seconds', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {
        legend: true,
        autol: 5
    });
    assert.notEqual(plot, null);
    var lyr0 = plot.overlay_pipe({
        type: 1000
    }, {
        framesize: 2048,
        name: "Test",
        maxhold: {
            decay: 0, // never decay
            color: "red",
            traceoptions: {
                dashed: true
            }
        }
    });

    var offset = 0;
    window.setInterval(function() {
        offset = (offset + 200) % 2048
    }, 2000);

    window.setInterval(function() {
        plot.change_settings({
            maxhold: {
                decay: 0, // never decay
                color: "red",
                traceoptions: {
                    dashed: true
                }
            }
        })
    }, 5000);

    ifixture.interval = window.setInterval(function() {
        var random = [];
        for (var i = 0; i < 2048; i += 1) {

            if ((i > offset) && (i < offset + 500)) {
                random.push(Math.random() * 3);
            } else {
                random.push(Math.random());
            }
        }
        plot.push(lyr0, random);
    }, 100);
});
