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

//////////////////////////////////////////////////////////////////////////////
// QUnit 'sigplot' module
//////////////////////////////////////////////////////////////////////////////
QUnit.module('sigplot', {
    beforeEach: function() {
        var plotdiv = document.createElement("div");
        plotdiv.id = "plot";
        plotdiv.style.position = "absolute";
        plotdiv.style.width = "600px";
        plotdiv.style.height = "400px";
        fixture.appendChild(plotdiv);
    },
    afterEach: function() {
        fixture.innerHTML = '';
    }
});
QUnit.test('sigplot construction', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    assert.equal(container.childNodes.length, 1);
    assert.equal(container.childNodes[0], plot._Mx.parent);
    assert.equal(plot._Mx.parent.childNodes.length, 2);
    assert.equal(plot._Mx.parent.childNodes[0], plot._Mx.canvas);
    assert.equal(plot._Mx.parent.childNodes[1], plot._Mx.wid_canvas);
    assert.equal(plot._Mx.canvas.width, 600);
    assert.equal(plot._Mx.canvas.height, 400);
    assert.equal(plot._Mx.canvas.style.position, "absolute");
    assert.equal(plot._Mx.wid_canvas.width, 600);
    assert.equal(plot._Mx.wid_canvas.height, 400);
    assert.equal(plot._Mx.wid_canvas.style.position, "absolute");
});
QUnit.test('sigplot refresh_after', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    plot._Mx._syncRender = true;

    var refreshCount = 0;
    plot._refresh = function() {
        refreshCount += 1;
    };

    // normal refresh calls increment the count
    plot.refresh();
    assert.equal(refreshCount, 1);

    // during refresh_after, refresh calls are ignored and only
    // one refresh is called at the end
    plot.refresh_after(
        function(thePlot) {
            thePlot.refresh();
            thePlot.refresh();
        }
    );
    assert.equal(refreshCount, 2);

    // refresh_after is safe for reentrant calls
    plot.refresh_after(
        function(thePlot) {
            thePlot.refresh_after(function(thePlot2) {
                thePlot2.refresh();
            });
            thePlot.refresh_after(function(thePlot2) {
                thePlot2.refresh();
            });
        }
    );
    assert.equal(refreshCount, 3);

    // refresh_after guarantees a refresh, even with an error, but does
    // not swallow the error
    assert.throws(
        function() {
            plot.refresh_after(
                function(thePlot) {
                    throw "An Error";
                }
            );
        }
    );
    assert.equal(refreshCount, 4);

});

// Demonstrate that changing the ymin/ymax settings
// will implicitly change the autoy settings
QUnit.test('sigplot layer1d change_settings ymin/ymax ', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);

    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    // An empty plot starts at -1.0, 1.0
    assert.equal(plot._Gx.ymin, -1.0);
    assert.equal(plot._Gx.ymax, 1.0);
    assert.equal(plot._Gx.autoy, 3);


    var pulse = [];
    for (var i = 0; i <= 1000; i += 1) {
        pulse.push(0.0);
    }
    pulse[0] = 10.0;

    // The first overlay will scale the plot
    plot.overlay_array(pulse);
    assert.equal(plot._Gx.ymin, -0.2);
    assert.equal(plot._Gx.ymax, 10.2);
    assert.equal(plot._Gx.autoy, 3);

    plot.change_settings({
        ymin: -50
    });
    assert.equal(plot._Gx.ymin, -50);
    assert.equal(plot._Gx.ymax, 10.2);
    assert.equal(plot._Gx.autoy, 2);

    plot.change_settings({
        ymax: 100
    });
    assert.equal(plot._Gx.ymin, -50);
    assert.equal(plot._Gx.ymax, 100);
    assert.equal(plot._Gx.autoy, 0);

    plot.change_settings({
        ymin: 10,
        ymax: 50
    });
    assert.equal(plot._Gx.ymin, 10);
    assert.equal(plot._Gx.ymax, 50);
    assert.equal(plot._Gx.autoy, 0);

    plot.change_settings({
        ymin: null
    });
    assert.equal(plot._Gx.ymin, -0.2);
    assert.equal(plot._Gx.ymax, 50);
    assert.equal(plot._Gx.autoy, 1);

    plot.change_settings({
        ymax: null
    });
    assert.equal(plot._Gx.ymin, -0.2);
    assert.equal(plot._Gx.ymax, 10.2);
    assert.equal(plot._Gx.autoy, 3);

    plot.change_settings({
        ymin: -100,
        ymax: 200
    });
    assert.equal(plot._Gx.ymin, -100);
    assert.equal(plot._Gx.ymax, 200);
    assert.equal(plot._Gx.autoy, 0);

    plot.change_settings({
        ymin: -10,
        ymax: 20
    });
    assert.equal(plot._Gx.ymin, -10);
    assert.equal(plot._Gx.ymax, 20);
    assert.equal(plot._Gx.autoy, 0);

    plot.change_settings({
        ymin: null,
        ymax: null
    });
    assert.equal(plot._Gx.ymin, -0.2);
    assert.equal(plot._Gx.ymax, 10.2);
    assert.equal(plot._Gx.autoy, 3);
});

QUnit.test('Cmode input test', function(assert) {
    var container = document.getElementById('plot');
    // constructor accept integers
    var plot = new sigplot.Plot(container, {
        cmode: 3
    });
    assert.equal(plot._Gx.cmode, 3);

    // or string
    var plot = new sigplot.Plot(container, {
        cmode: "PH"
    });
    assert.equal(plot._Gx.cmode, 2);

    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 20; i++) {
        ramp.push(i);
    }
    plot.overlay_array(ramp, null, {
        name: "x",
        symbol: 1,
        line: 0
    });


    plot.change_settings({
        cmode: "Magnitude"
    });
    assert.equal(plot._Gx.cmode, 1);
    plot.change_settings({
        cmode: "Phase"
    });
    assert.equal(plot._Gx.cmode, 2);
    plot.change_settings({
        cmode: "Real"
    });
    assert.equal(plot._Gx.cmode, 3);
    plot.change_settings({
        cmode: "Imaginary"
    });
    assert.equal(plot._Gx.cmode, 4);
    plot.change_settings({
        cmode: "Imag/Real"
    });
    assert.equal(plot._Gx.cmode, 5);
    plot.change_settings({
        cmode: "Real/Imag"
    });
    assert.equal(plot._Gx.cmode, 5);
    plot.change_settings({
        cmode: "10*log10"
    });
    assert.equal(plot._Gx.cmode, 6);
    plot.change_settings({
        cmode: "20*log10"
    });
    assert.equal(plot._Gx.cmode, 7);

    plot.change_settings({
        cmode: 1
    });
    assert.equal(plot._Gx.cmode, 1);
    plot.change_settings({
        cmode: 2
    });
    assert.equal(plot._Gx.cmode, 2);
    plot.change_settings({
        cmode: 3
    });
    assert.equal(plot._Gx.cmode, 3);
    plot.change_settings({
        cmode: 4
    });
    assert.equal(plot._Gx.cmode, 4);
    plot.change_settings({
        cmode: 5
    });
    assert.equal(plot._Gx.cmode, 5);
    plot.change_settings({
        cmode: 6
    });
    assert.equal(plot._Gx.cmode, 6);
    plot.change_settings({
        cmode: 7
    });
    assert.equal(plot._Gx.cmode, 7);
});

QUnit.test('sigplot layer1d noautoscale', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var pulse = [];
    for (var i = 0; i <= 1000; i += 1) {
        pulse.push(0.0);
    }
    var lyr_uuid = plot.overlay_array(pulse);
    assert.equal(plot._Gx.panymin, -1.0);
    assert.equal(plot._Gx.panymax, 1.0);
    pulse[0] = 1.0;
    plot.reload(lyr_uuid, pulse);
    assert.equal(plot._Gx.panymin, -0.02);
    assert.equal(plot._Gx.panymax, 1.02);
    for (var i = 1; i <= 1000; i += 1) {
        pulse[i - 1] = 0;
        pulse[i] = 1;
        assert.equal(plot._Gx.panymin, -0.02);
        assert.equal(plot._Gx.panymax, 1.02);
    }
});
/* 
 TODO REVISIT THE AUTO_SCALE TESTS
QUnit.test('sigplot layer1d autoscale', function(assert) {
    // TODO revisit this test.  The autol actually gets called
    // multiple times when it should only be called twice.
    // this is evident if you do a sync refresh
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container, {
        autol: 2
    });
    assert.notEqual(plot, null);
    assert.equal(plot._Gx.autol, 2);
    var pulse = [];
    for (var i = 0; i <= 1000; i += 1) {
        pulse.push(0.0);
    }
    var lyr_uuid = plot.overlay_array(pulse);
    assert.equal(plot._Gx.autol, 2);
    assert.equal(plot._Gx.panymin, -1.0);
    assert.equal(plot._Gx.panymax, 1.0);
    pulse[0] = 1.0;
    plot.reload(lyr_uuid, pulse, null, false);
    var expected_ymin = (-0.02 * 0.5) + (-1 * 0.5);
    var expected_ymax = (1.02 * 0.5) + (1 * 0.5);
    assert.equal(plot._Gx.panymin, expected_ymin);
    assert.equal(plot._Gx.panymax, expected_ymax);
    for (var i = 1; i <= 1000; i += 1) {
        // this code seems to be pointless
        pulse[i - 1] = 0;
        pulse[i] = 1;
        expected_ymin = (expected_ymin * 0.5) + (expected_ymin * 0.5);
        expected_ymax = (expected_ymax * 0.5) + (expected_ymax * 0.5);
        assert.equal(plot._Gx.panymin, expected_ymin);
        assert.equal(plot._Gx.panymax, expected_ymax);
    }
});
QUnit.test('sigplot layer1d autoscale negative', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container, {
        autol: 2
    });
    assert.notEqual(plot, null);
    var pulse = [];
    for (var i = 0; i <= 1000; i += 1) {
        pulse.push(-60.0);
    }
    pulse[0] = -10.0;
    var lyr_uuid = plot.overlay_array(pulse);
    var expected_ymin = (-61.0 * 0.5) + (-1 * 0.5);
    var expected_ymax = (-9.0 * 0.5) + (1 * 0.5);
    assert.equal(plot._Gx.panymin, expected_ymin);
    assert.equal(plot._Gx.panymax, expected_ymax);
    for (var i = 1; i <= 1000; i += 1) {
        pulse[i - 1] = -60;
        pulse[i] = -10;
        expected_ymin = (expected_ymin * 0.5) + (expected_ymin * 0.5);
        expected_ymax = (expected_ymax * 0.5) + (expected_ymax * 0.5);
        assert.equal(plot._Gx.panymin, expected_ymin);
        assert.equal(plot._Gx.panymax, expected_ymax);
    }
});
*/
QUnit.test('sigplot layer1d autoscale xpad', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container, {
        panxpad: 20
    });
    assert.notEqual(plot, null);
    var pulse = [];
    for (var i = 0; i <= 1000; i += 1) {
        pulse.push(-60.0);
    }
    pulse[0] = -10.0;
    plot.overlay_array(pulse);

    assert.equal(plot._Gx.panxmin, -20);
    assert.equal(plot._Gx.panxmax, 1020);

    assert.equal(plot._Gx.panymin, -61);
    assert.equal(plot._Gx.panymax, -9);
});
QUnit.test('sigplot layer1d autoscale xpad %', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container, {
        panxpad: "20%"
    });
    assert.notEqual(plot, null);
    var pulse = [];
    for (var i = 0; i <= 1000; i += 1) {
        pulse.push(-60.0);
    }
    pulse[0] = -10.0;
    plot.overlay_array(pulse);

    assert.equal(plot._Gx.panxmin, -200);
    assert.equal(plot._Gx.panxmax, 1200);

    assert.equal(plot._Gx.panymin, -61);
    assert.equal(plot._Gx.panymax, -9);
});
QUnit.test('sigplot layer1d autoscaley pad', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container, {
        panypad: 20
    });
    assert.notEqual(plot, null);
    var pulse = [];
    for (var i = 0; i <= 1000; i += 1) {
        pulse.push(-60.0);
    }
    pulse[0] = -10.0;
    plot.overlay_array(pulse);

    assert.equal(plot._Gx.panxmin, 0);
    assert.equal(plot._Gx.panxmax, 1000);

    assert.equal(plot._Gx.panymin, -81);
    assert.equal(plot._Gx.panymax, 11);
});
QUnit.test('sigplot layer1d autoscale ypad %', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container, {
        panypad: "20%"
    });
    assert.notEqual(plot, null);
    var pulse = [];
    for (var i = 0; i <= 1000; i += 1) {
        pulse.push(-60.0);
    }
    pulse[0] = -10.0;
    plot.overlay_array(pulse);

    assert.equal(plot._Gx.panxmin, 0);
    assert.equal(plot._Gx.panxmax, 1000);

    assert.close(plot._Gx.panymin, -71.4, 0.0001);
    assert.close(plot._Gx.panymax, 1.4, 0.0001);
});
QUnit.test('sigplot 0px height', function(assert) {
    var container = document.getElementById('plot');
    container.style.height = "0px";
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container);
    assert.notEqual(plot, null);
    assert.equal(plot._Mx.canvas.height, 0);
    var zeros = [];
    for (var i = 0; i <= 1000; i += 1) {
        zeros.push(0.0);
    }
    var lyr_uuid = plot.overlay_array(zeros);
    assert.notEqual(plot.get_layer(0), null);
    plot.deoverlay();
    assert.equal(plot.get_layer(0), null);
    lyr_uuid = plot.overlay_array(zeros, {
        type: 2000,
        subsize: zeros.length
    });
    assert.notEqual(plot.get_layer(0), null);
    plot.deoverlay();
    assert.equal(plot.get_layer(0), null);
    lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: 128
    });
    assert.notEqual(plot.get_layer(0), null);
    assert.equal(plot.get_layer(0).drawmode, "scrolling");
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 0);
    assert.equal(plot.get_layer(0).lps, 1);
    plot.deoverlay();
    lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: 128
    }, {
        drawmode: "rising"
    });
    assert.notEqual(plot.get_layer(0), null);
    assert.equal(plot.get_layer(0).drawmode, "rising");
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 0);
    assert.equal(plot.get_layer(0).lps, 1);
    plot.deoverlay();
    lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: 128
    }, {
        drawmode: "falling"
    });
    assert.notEqual(plot.get_layer(0), null);
    assert.equal(plot.get_layer(0).drawmode, "falling");
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 0);
    assert.equal(plot.get_layer(0).position, 0);
    assert.equal(plot.get_layer(0).lps, 1);
    plot.deoverlay();
});
QUnit.test('sigplot resize raster 0px height', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container);
    assert.notEqual(plot, null);
    assert.equal(plot._Mx.canvas.height, 400);
    var zeros = [];
    for (var i = 0; i <= 128; i += 1) {
        zeros.push(0.0);
    }
    var lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: 128
    });
    assert.notEqual(plot.get_layer(0), null);
    assert.equal(plot.get_layer(0).drawmode, "scrolling");
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 1);
    assert.ok(plot.get_layer(0).lps > 1);
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 2);
    assert.ok(plot.get_layer(0).lps > 1);
    container.style.height = "0px";
    plot.checkresize();
    plot._refresh();
    plot.checkresize();
    assert.equal(plot._Mx.canvas.height, 0);
    assert.equal(plot.get_layer(0).lps, 1);
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 0);
});
QUnit.test('sigplot resize raster larger height', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container);
    assert.notEqual(plot, null);
    assert.equal(plot._Mx.canvas.height, 400);
    var zeros = [];
    for (var i = 0; i <= 128; i += 1) {
        zeros.push(0.0);
    }
    var lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: 128
    }, {
        drawmode: "scrolling"
    });
    assert.notEqual(plot.get_layer(0), null);
    assert.equal(plot.get_layer(0).drawmode, "scrolling");
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 1);
    assert.ok(plot.get_layer(0).lps > 1);
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 2);
    assert.ok(plot.get_layer(0).lps > 1);
    var orig_lps = plot.get_layer(0).lps;
    container.style.height = "600px";
    plot.checkresize();
    plot._refresh();
    plot.checkresize();
    assert.equal(plot._Mx.canvas.height, 600);
    assert.ok(plot.get_layer(0).lps > orig_lps);
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(plot.get_layer(0).position, 3);
    for (var i = 0; i <= plot.get_layer(0).lps; i += 1) {
        plot.push(lyr_uuid, zeros, null, true);
    }
});
QUnit.test('sigplot change raster LPS', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container);
    assert.notEqual(plot, null);
    var zeros = [];
    for (var i = 0; i <= 128; i += 1) {
        zeros.push(0.0);
    }
    var lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: 128,
        lps: 100,
        pipe: true
    });
    assert.notEqual(plot.get_layer(0), null);
    assert.strictEqual(plot.get_layer(0).lps, 100);
    plot.push(lyr_uuid, zeros, {
        lps: 200
    }, true);
    plot._refresh();
    assert.strictEqual(plot.get_layer(0).lps, 200);
});
QUnit.test('Add and remove plugins', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var zeros = [];
    for (var i = 0; i <= 128; i += 1) {
        zeros.push(0.0);
    }
    plot.overlay_pipe({
        type: 2000,
        subsize: 128,
        lps: 100,
        pipe: true
    });
    var accordion = new sigplot.plugins.AccordionPlugin({
        draw_center_line: true,
        shade_area: true,
        draw_edge_lines: true,
        direction: "vertical",
        edge_line_style: {
            strokeStyle: "#FF2400"
        }
    });
    assert.equal(plot._Gx.plugins.length, 0, "Expected zero plugins");
    plot.add_plugin(accordion, 1);
    assert.equal(plot._Gx.plugins.length, 1, "Expected one plugin");
    plot.remove_plugin(accordion);
    assert.equal(plot._Gx.plugins.length, 0, "Expected zero plugins");
});
QUnit.test('Plugins still exist after plot and canvas height and width are 0', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    plot.change_settings({
        xmin: -4,
        xmax: 10
    });
    var positions = [0.0, 5.0, 9.0, 3.0];
    for (var pos = 0; pos < positions.length; ++pos) {
        var slider = new sigplot.plugins.SliderPlugin({
            style: {
                strokeStyle: "#FF0000"
            }
        });
        plot.add_plugin(slider, 1);
        slider.set_position(positions[pos]);
    }
    plot.checkresize();
    assert.equal(plot._Gx.plugins.length, 4, "Expected 4 slider plugins");
    assert.equal(plot._Mx.canvas.height, container.clientHeight, "Expected plot canvas height to be container width");
    assert.equal(plot._Mx.canvas.width, container.clientWidth, "Expected plot canvas width to be container height");
    for (var pos = 0; pos < positions.length; ++pos) {
        assert.equal(plot._Gx.plugins[pos].canvas.height, plot._Mx.canvas.height, "Expected #" + pos + " slider plugin height to be plot height");
        assert.equal(plot._Gx.plugins[pos].canvas.width, plot._Mx.canvas.width, "Expected #" + pos + " slider plugin width to be plot width");
    }
    container.style.display = "none";
    plot.checkresize();
    plot._refresh(); // force syncronous refresh
    assert.equal(plot._Mx.canvas.height, 0, "Expected plot canvas height to be 0");
    assert.equal(plot._Mx.canvas.width, 0, "Expected plot canvas width to be 0");
    for (var pos = 0; pos < positions.length; ++pos) {
        assert.equal(plot._Gx.plugins[pos].canvas.height, 0, "Expected #" + pos + " slider plugin height to be 0");
        assert.equal(plot._Gx.plugins[pos].canvas.width, 0, "Expected #" + pos + " slider plugin width to be 0");
    }
    container.style.display = "block";
    plot.checkresize();
    plot._refresh(); // force syncronous refresh
    assert.equal(plot._Mx.canvas.height, container.clientHeight, "Expected plot canvas height to be container width");
    assert.equal(plot._Mx.canvas.width, container.clientWidth, "Expected plot canvas width to be container height");
    for (var pos = 0; pos < positions.length; ++pos) {
        assert.equal(plot._Gx.plugins[pos].canvas.height, plot._Mx.canvas.height, "Expected #" + pos + " slider plugin height to be plot height");
        assert.equal(plot._Gx.plugins[pos].canvas.width, plot._Mx.canvas.width, "Expected #" + pos + " slider plugin width to be plot width");
    }
});

QUnit.test('unit strings test: x -> Power and y -> Angle rad', function(assert) {
    var container = document.getElementById('plot');
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 20; i++) {
        ramp.push(i);
    }
    var lyr_uuid = plot.overlay_array(ramp, {
        xunits: "Power",
        yunits: "Angle rad"
    }, {
        name: "x",
        symbol: 1,
        line: 0
    });

    assert.equal(plot._Gx.HCB_UUID[lyr_uuid].xunits, 12);
    assert.equal(plot._Gx.HCB_UUID[lyr_uuid].yunits, 33);
    assert.equal(plot._Gx.xlab, 12);
    assert.equal(plot._Gx.ylab, 33);
});

QUnit.test('unit strings test: x -> Hz and y -> Time_sec', function(assert) {
    var container = document.getElementById('plot');
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);
    var ramp = [];
    for (var i = 0; i < 20; i++) {
        ramp.push(i);
    }
    var lyr_uuid = plot.overlay_array(ramp, {
        xunits: "Hz",
        yunits: "Time_sec"
    }, {
        name: "x",
        symbol: 1,
        line: 0
    });

    assert.equal(plot._Gx.HCB_UUID[lyr_uuid].xunits, 3);
    assert.equal(plot._Gx.HCB_UUID[lyr_uuid].yunits, 1);
    assert.equal(plot._Gx.xlab, 3);
    assert.equal(plot._Gx.ylab, 1);
});

QUnit.test('sigplot line push smaller than framesize', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container);
    assert.notEqual(plot, null);
    assert.equal(plot._Mx.canvas.height, 400);
    var zeros = [];
    for (var i = 0; i < 128; i += 1) {
        zeros.push(0.0);
    }
    var lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: 64
    }, {
        layerType: sigplot.Layer1D
    });
    assert.notEqual(plot.get_layer(0), null);

    // the pipe should start empty
    var hcb = plot.get_layer(0).hcb;
    assert.equal(hcb.dview.length - hcb.data_free, 0);

    // pushing twice the subsize should allow
    // two frames to be written, leaving nothing
    // in the pipe
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(hcb.dview.length - hcb.data_free, 0);

    // if we push 63 elements they should remain in the pipe
    plot.push(lyr_uuid, zeros.slice(0, 63), null, true);
    assert.equal(hcb.dview.length - hcb.data_free, 0);

    // pushing two should leave one item in the pipe
    plot.push(lyr_uuid, zeros.slice(0, 2), null, true);
    assert.equal(hcb.dview.length - hcb.data_free, 0);

    // as does pushing another 128
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(hcb.dview.length - hcb.data_free, 0);
});

QUnit.test('sigplot raster push smaller than framesize', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container);
    assert.notEqual(plot, null);
    assert.equal(plot._Mx.canvas.height, 400);
    var zeros = [];
    for (var i = 0; i < 128; i += 1) {
        zeros.push(0.0);
    }
    var lyr_uuid = plot.overlay_pipe({
        type: 2000,
        subsize: 64
    });
    assert.notEqual(plot.get_layer(0), null);

    // the pipe should start empty
    var hcb = plot.get_layer(0).hcb;
    assert.equal(hcb.dview.length - hcb.data_free, 0);

    // pushing twice the subsize should allow
    // two frames to be written, leaving nothing
    // in the pipe
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(hcb.dview.length - hcb.data_free, 0);

    // if we push 63 elements they should remain in the pipe
    plot.push(lyr_uuid, zeros.slice(0, 63), null, true);
    assert.equal(hcb.dview.length - hcb.data_free, 63);

    // pushing two should leave one item in the pipe
    plot.push(lyr_uuid, zeros.slice(0, 2), null, true);
    assert.equal(hcb.dview.length - hcb.data_free, 1);

    // as does pushing another 128
    plot.push(lyr_uuid, zeros, null, true);
    assert.equal(hcb.dview.length - hcb.data_free, 1);
});
QUnit.test('sigplot layer user_data', function(assert) {
    var container = document.getElementById('plot');
    assert.equal(container.childNodes.length, 0);
    assert.equal(fixture.childNodes.length, 1);
    var plot = new sigplot.Plot(container);

    var lyr_1 = plot.overlay_array([]);
    assert.equal(plot.get_layer(lyr_1).user_data, undefined);

    var lyr_2 = plot.overlay_array([], null, {
        user_data: "test"
    });
    assert.equal(plot.get_layer(lyr_1).user_data, undefined);
    assert.equal(plot.get_layer(lyr_2).user_data, "test");
});
QUnit.test('Plot y-cut preserves pan values', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    var done = assert.async();
    plot.overlay_href("dat/raster.tmp", function(hcb, lyr_n) {
        plot.zoom({
            x: 600e6,
            y: 80
        }, {
            x: 650e6,
            y: 110
        });
        var orig_panxmin = plot._Gx.panxmin;
        var orig_panxmax = plot._Gx.panxmax;
        var orig_panymin = plot._Gx.panymin;
        var orig_panymax = plot._Gx.panymax;

        var lyr = plot.get_layer(lyr_n);
        lyr.yCut(625000000);
        lyr.yCut();

        assert.equal(orig_panxmin, plot._Gx.panxmin);
        assert.equal(orig_panxmax, plot._Gx.panxmax);
        assert.equal(orig_panymin, plot._Gx.panymin);
        assert.equal(orig_panymax, plot._Gx.panymax);

        var lyr = plot.get_layer(lyr_n);
        lyr.xCut(100);
        lyr.xCut();

        assert.equal(orig_panxmin, plot._Gx.panxmin);
        assert.equal(orig_panxmax, plot._Gx.panxmax);
        assert.equal(orig_panymin, plot._Gx.panymin);
        assert.equal(orig_panymax, plot._Gx.panymax);

        done();
    }, {});
});
QUnit.test('Plot onerror callback', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    var done = assert.async();

    var onload = function(hcb, ii) {
        assert.notOk(true, 'onload should not have been called');
        done();
    };
    var onerror = function(event) {
        assert.ok(true, 'onerror was expected to be be called');
        done();
    };
    plot.overlay_href("dat/nonexistant.tmp", {
        "onload": onload,
        "onerror": onerror
    });
});
QUnit.test('Plot onerror SDS callback', function(assert) {
    var container = document.getElementById('plot');
    var plot = new sigplot.Plot(container, {});
    assert.notEqual(plot, null);

    var done = assert.async();

    var onload = function(hcb, ii) {
        assert.notOk(true, 'onload should not have been called');
        done();
    };
    var onerror = function(event) {
        assert.ok(true, 'onerror was expected to be be called');
        done();
    };
    plot.overlay_href("dat/nonexistant.tmp", {
        "onload": onload,
        "onerror": onerror
    }, {
        layerType: "2DSDS"
    });
});
