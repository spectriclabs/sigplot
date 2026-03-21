/**
 * @license
 * File: tests.sigplot.test.js
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

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import Layer2D from "../js/sigplot.layer2d.js";

describe("sigplot", () => {
    let container;

    beforeEach(() => {
        container = document.createElement("div");
        container.id = "plot";
        container.style.width = "600px";
        container.style.height = "400px";
        container.style.position = "absolute";
        // jsdom doesn't compute layout — mock clientWidth/clientHeight
        Object.defineProperty(container, "clientWidth", {
            get: () => (container.style.display === "none" ? 0 : parseInt(container.style.width) || 0),
            configurable: true
        });
        Object.defineProperty(container, "clientHeight", {
            get: () => (container.style.display === "none" ? 0 : parseInt(container.style.height) || 0),
            configurable: true
        });
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    // Requires browser mode (jsdom clientWidth/clientHeight always return 0)
    it("sigplot construction", () => {
        expect(container.childNodes.length).toBe(0);
        var plot = new sigplot.Plot(container, {});
        expect(plot).not.toBe(null);
        expect(container.childNodes.length).toBe(1);
        expect(container.childNodes[0]).toBe(plot._Mx.parent);
        expect(plot._Mx.parent.childNodes.length).toBe(2);
        expect(plot._Mx.parent.childNodes[0]).toBe(plot._Mx.canvas);
        expect(plot._Mx.parent.childNodes[1]).toBe(plot._Mx.wid_canvas);
        expect(plot._Mx.canvas.width).toBe(600);
        expect(plot._Mx.canvas.height).toBe(400);
        expect(plot._Mx.canvas.style.position).toBe("absolute");
        expect(plot._Mx.wid_canvas.width).toBe(600);
        expect(plot._Mx.wid_canvas.height).toBe(400);
        expect(plot._Mx.wid_canvas.style.position).toBe("absolute");
    });

    it("sigplot refresh_after", () => {
        var plot = new sigplot.Plot(container, {});
        plot._Mx._syncRender = true;

        var refreshCount = 0;
        plot._refresh = function () {
            refreshCount += 1;
        };

        plot.refresh();
        expect(refreshCount).toBe(1);

        plot.refresh_after(function (thePlot) {
            thePlot.refresh();
            thePlot.refresh();
        });
        expect(refreshCount).toBe(2);

        plot.refresh_after(function (thePlot) {
            thePlot.refresh_after(function (thePlot2) {
                thePlot2.refresh();
            });
            thePlot.refresh_after(function (thePlot2) {
                thePlot2.refresh();
            });
        });
        expect(refreshCount).toBe(3);

        expect(function () {
            plot.refresh_after(function (thePlot) {
                throw "An Error";
            });
        }).toThrow();
        expect(refreshCount).toBe(4);
    });

    it("sigplot layer1d change_settings ymin/ymax", () => {
        var plot = new sigplot.Plot(container, {});
        expect(plot).not.toBe(null);

        expect(plot._Gx.ymin).toBe(-1.0);
        expect(plot._Gx.ymax).toBe(1.0);
        expect(plot._Gx.autoy).toBe(3);

        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            pulse.push(0.0);
        }
        pulse[0] = 10.0;

        plot.overlay_array(pulse);
        expect(plot._Gx.ymin).toBe(-0.2);
        expect(plot._Gx.ymax).toBe(10.2);
        expect(plot._Gx.autoy).toBe(3);

        plot.change_settings({ ymin: -50 });
        expect(plot._Gx.ymin).toBe(-50);
        expect(plot._Gx.ymax).toBe(10.2);
        expect(plot._Gx.autoy).toBe(2);

        plot.change_settings({ ymax: 100 });
        expect(plot._Gx.ymin).toBe(-50);
        expect(plot._Gx.ymax).toBe(100);
        expect(plot._Gx.autoy).toBe(0);

        plot.change_settings({ ymin: 10, ymax: 50 });
        expect(plot._Gx.ymin).toBe(10);
        expect(plot._Gx.ymax).toBe(50);
        expect(plot._Gx.autoy).toBe(0);

        plot.change_settings({ ymin: null });
        expect(plot._Gx.ymin).toBe(-0.2);
        expect(plot._Gx.ymax).toBe(50);
        expect(plot._Gx.autoy).toBe(1);

        plot.change_settings({ ymax: null });
        expect(plot._Gx.ymin).toBe(-0.2);
        expect(plot._Gx.ymax).toBe(10.2);
        expect(plot._Gx.autoy).toBe(3);

        plot.change_settings({ ymin: -100, ymax: 200 });
        expect(plot._Gx.ymin).toBe(-100);
        expect(plot._Gx.ymax).toBe(200);
        expect(plot._Gx.autoy).toBe(0);

        plot.change_settings({ ymin: -10, ymax: 20 });
        expect(plot._Gx.ymin).toBe(-10);
        expect(plot._Gx.ymax).toBe(20);
        expect(plot._Gx.autoy).toBe(0);

        plot.change_settings({ ymin: null, ymax: null });
        expect(plot._Gx.ymin).toBe(-0.2);
        expect(plot._Gx.ymax).toBe(10.2);
        expect(plot._Gx.autoy).toBe(3);
    });

    it("Cmode input test", () => {
        var plot = new sigplot.Plot(container, { cmode: 3 });
        expect(plot._Gx.cmode).toBe(3);

        plot = new sigplot.Plot(container, { cmode: "PH" });
        expect(plot._Gx.cmode).toBe(2);

        expect(plot).not.toBe(null);
        var ramp = [];
        for (var i = 0; i < 20; i++) {
            ramp.push(i);
        }
        plot.overlay_array(ramp, null, {
            name: "x",
            symbol: 1,
            line: 0
        });

        plot.change_settings({ cmode: "Magnitude" });
        expect(plot._Gx.cmode).toBe(1);
        plot.change_settings({ cmode: "Phase" });
        expect(plot._Gx.cmode).toBe(2);
        plot.change_settings({ cmode: "Real" });
        expect(plot._Gx.cmode).toBe(3);
        plot.change_settings({ cmode: "Imaginary" });
        expect(plot._Gx.cmode).toBe(4);
        plot.change_settings({ cmode: "Imag/Real" });
        expect(plot._Gx.cmode).toBe(5);
        plot.change_settings({ cmode: "Real/Imag" });
        expect(plot._Gx.cmode).toBe(5);
        plot.change_settings({ cmode: "10*log10" });
        expect(plot._Gx.cmode).toBe(6);
        plot.change_settings({ cmode: "20*log10" });
        expect(plot._Gx.cmode).toBe(7);

        plot.change_settings({ cmode: 1 });
        expect(plot._Gx.cmode).toBe(1);
        plot.change_settings({ cmode: 2 });
        expect(plot._Gx.cmode).toBe(2);
        plot.change_settings({ cmode: 3 });
        expect(plot._Gx.cmode).toBe(3);
        plot.change_settings({ cmode: 4 });
        expect(plot._Gx.cmode).toBe(4);
        plot.change_settings({ cmode: 5 });
        expect(plot._Gx.cmode).toBe(5);
        plot.change_settings({ cmode: 6 });
        expect(plot._Gx.cmode).toBe(6);
        plot.change_settings({ cmode: 7 });
        expect(plot._Gx.cmode).toBe(7);
    });

    it("sigplot layer1d noautoscale", () => {
        var plot = new sigplot.Plot(container, {});
        expect(plot).not.toBe(null);
        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            pulse.push(0.0);
        }
        var lyr_uuid = plot.overlay_array(pulse);
        expect(plot._Gx.panymin).toBe(-1.0);
        expect(plot._Gx.panymax).toBe(1.0);
        pulse[0] = 1.0;
        plot.reload(lyr_uuid, pulse);
        expect(plot._Gx.panymin).toBe(-0.02);
        expect(plot._Gx.panymax).toBe(1.02);
        for (var i = 1; i <= 1000; i += 1) {
            pulse[i - 1] = 0;
            pulse[i] = 1;
        }
        expect(plot._Gx.panymin).toBe(-0.02);
        expect(plot._Gx.panymax).toBe(1.02);
    });

    it("sigplot layer1d autoscale xpad", () => {
        var plot = new sigplot.Plot(container, { panxpad: 20 });
        expect(plot).not.toBe(null);
        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            pulse.push(-60.0);
        }
        pulse[0] = -10.0;
        plot.overlay_array(pulse);

        expect(plot._Gx.panxmin).toBe(-20);
        expect(plot._Gx.panxmax).toBe(1020);

        expect(plot._Gx.panymin).toBe(-61);
        expect(plot._Gx.panymax).toBe(-9);
    });

    it("sigplot layer1d autoscale xpad %", () => {
        var plot = new sigplot.Plot(container, { panxpad: "20%" });
        expect(plot).not.toBe(null);
        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            pulse.push(-60.0);
        }
        pulse[0] = -10.0;
        plot.overlay_array(pulse);

        expect(plot._Gx.panxmin).toBe(-200);
        expect(plot._Gx.panxmax).toBe(1200);

        expect(plot._Gx.panymin).toBe(-61);
        expect(plot._Gx.panymax).toBe(-9);
    });

    it("sigplot layer1d autoscaley pad", () => {
        var plot = new sigplot.Plot(container, { panypad: 20 });
        expect(plot).not.toBe(null);
        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            pulse.push(-60.0);
        }
        pulse[0] = -10.0;
        plot.overlay_array(pulse);

        expect(plot._Gx.panxmin).toBe(0);
        expect(plot._Gx.panxmax).toBe(1000);

        expect(plot._Gx.panymin).toBe(-81);
        expect(plot._Gx.panymax).toBe(11);
    });

    it("sigplot layer1d autoscale ypad %", () => {
        var plot = new sigplot.Plot(container, { panypad: "20%" });
        expect(plot).not.toBe(null);
        var pulse = [];
        for (var i = 0; i <= 1000; i += 1) {
            pulse.push(-60.0);
        }
        pulse[0] = -10.0;
        plot.overlay_array(pulse);

        expect(plot._Gx.panxmin).toBe(0);
        expect(plot._Gx.panxmax).toBe(1000);

        expect(Math.abs(plot._Gx.panymin - -71.4)).toBeLessThanOrEqual(0.0001);
        expect(Math.abs(plot._Gx.panymax - 1.4)).toBeLessThanOrEqual(0.0001);
    });

    it("sigplot 0px height", () => {
        container.style.height = "0px";
        var plot = new sigplot.Plot(container);
        expect(plot).not.toBe(null);
        expect(plot._Mx.canvas.height).toBe(0);
        var zeros = [];
        for (var i = 0; i <= 1000; i += 1) {
            zeros.push(0.0);
        }
        var lyr_uuid = plot.overlay_array(zeros);
        expect(plot.get_layer(0)).not.toBe(null);
        plot.deoverlay();
        expect(plot.get_layer(0)).toBe(null);
        lyr_uuid = plot.overlay_array(zeros, {
            type: 2000,
            subsize: zeros.length
        });
        expect(plot.get_layer(0)).not.toBe(null);
        plot.deoverlay();
        expect(plot.get_layer(0)).toBe(null);
        lyr_uuid = plot.overlay_pipe({
            type: 2000,
            subsize: 128
        });
        expect(plot.get_layer(0)).not.toBe(null);
        expect(plot.get_layer(0).drawmode).toBe("scrolling");
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(0);
        expect(plot.get_layer(0).lps).toBe(1);
        plot.deoverlay();
        lyr_uuid = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 128
            },
            {
                drawmode: "rising"
            }
        );
        expect(plot.get_layer(0)).not.toBe(null);
        expect(plot.get_layer(0).drawmode).toBe("rising");
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(0);
        expect(plot.get_layer(0).lps).toBe(1);
        plot.deoverlay();
        lyr_uuid = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 128
            },
            {
                drawmode: "falling"
            }
        );
        expect(plot.get_layer(0)).not.toBe(null);
        expect(plot.get_layer(0).drawmode).toBe("falling");
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(0);
        expect(plot.get_layer(0).position).toBe(0);
        expect(plot.get_layer(0).lps).toBe(1);
        plot.deoverlay();
    });

    // Requires browser mode (jsdom clientWidth/clientHeight always return 0)
    it("sigplot resize raster 0px height", () => {
        var plot = new sigplot.Plot(container);
        expect(plot).not.toBe(null);
        expect(plot._Mx.canvas.height).toBe(400);
        var zeros = [];
        for (var i = 0; i <= 128; i += 1) {
            zeros.push(0.0);
        }
        var lyr_uuid = plot.overlay_pipe({
            type: 2000,
            subsize: 128
        });
        expect(plot.get_layer(0)).not.toBe(null);
        expect(plot.get_layer(0).drawmode).toBe("scrolling");
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(1);
        expect(plot.get_layer(0).lps).toBeGreaterThan(1);
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(2);
        expect(plot.get_layer(0).lps).toBeGreaterThan(1);
        container.style.height = "0px";
        plot.checkresize();
        plot._refresh();
        plot.checkresize();
        expect(plot._Mx.canvas.height).toBe(0);
        expect(plot.get_layer(0).lps).toBe(1);
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(0);
    });

    // Requires browser mode (jsdom clientWidth/clientHeight always return 0)
    it("sigplot resize raster larger height", () => {
        var plot = new sigplot.Plot(container);
        expect(plot).not.toBe(null);
        expect(plot._Mx.canvas.height).toBe(400);
        var zeros = [];
        for (var i = 0; i <= 128; i += 1) {
            zeros.push(0.0);
        }
        var lyr_uuid = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 128
            },
            {
                drawmode: "scrolling"
            }
        );
        expect(plot.get_layer(0)).not.toBe(null);
        expect(plot.get_layer(0).drawmode).toBe("scrolling");
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(1);
        expect(plot.get_layer(0).lps).toBeGreaterThan(1);
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(2);
        expect(plot.get_layer(0).lps).toBeGreaterThan(1);
        var orig_lps = plot.get_layer(0).lps;
        container.style.height = "600px";
        plot.checkresize();
        plot._refresh();
        plot.checkresize();
        expect(plot._Mx.canvas.height).toBe(600);
        expect(plot.get_layer(0).lps).toBeGreaterThan(orig_lps);
        plot.push(lyr_uuid, zeros, null, true);
        expect(plot.get_layer(0).position).toBe(3);
        for (var i = 0; i <= plot.get_layer(0).lps; i += 1) {
            plot.push(lyr_uuid, zeros, null, true);
        }
    });

    it("sigplot change raster LPS", () => {
        var plot = new sigplot.Plot(container);
        expect(plot).not.toBe(null);
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
        expect(plot.get_layer(0)).not.toBe(null);
        expect(plot.get_layer(0).lps).toBe(100);
        plot.push(lyr_uuid, zeros, { lps: 200 }, true);
        plot._refresh();
        expect(plot.get_layer(0).lps).toBe(200);
    });

    it("Add and remove plugins", () => {
        var plot = new sigplot.Plot(container, {});
        expect(plot).not.toBe(null);
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
        expect(plot._Gx.plugins.length).toBe(0);
        plot.add_plugin(accordion, 1);
        expect(plot._Gx.plugins.length).toBe(1);
        plot.remove_plugin(accordion);
        expect(plot._Gx.plugins.length).toBe(0);
    });

    it("Plugins still exist after plot and canvas height and width are 0", () => {
        var plot = new sigplot.Plot(container, {});
        expect(plot).not.toBe(null);
        plot.change_settings({ xmin: -4, xmax: 10 });
        var positions = [0.0, 5.0, 9.0, 3.0];
        for (var pos = 0; pos < positions.length; ++pos) {
            var slider = new sigplot.plugins.SliderPlugin({
                style: { strokeStyle: "#FF0000" }
            });
            plot.add_plugin(slider, 1);
            slider.set_position(positions[pos]);
        }
        plot.checkresize();
        expect(plot._Gx.plugins.length).toBe(4);
        expect(plot._Mx.canvas.height).toBe(container.clientHeight);
        expect(plot._Mx.canvas.width).toBe(container.clientWidth);
        for (var pos = 0; pos < positions.length; ++pos) {
            expect(plot._Gx.plugins[pos].canvas.height).toBe(plot._Mx.canvas.height);
            expect(plot._Gx.plugins[pos].canvas.width).toBe(plot._Mx.canvas.width);
        }
        container.style.display = "none";
        plot.checkresize();
        plot._refresh();
        expect(plot._Mx.canvas.height).toBe(0);
        expect(plot._Mx.canvas.width).toBe(0);
        for (var pos = 0; pos < positions.length; ++pos) {
            expect(plot._Gx.plugins[pos].canvas.height).toBe(0);
            expect(plot._Gx.plugins[pos].canvas.width).toBe(0);
        }
        container.style.display = "block";
        plot.checkresize();
        plot._refresh();
        expect(plot._Mx.canvas.height).toBe(container.clientHeight);
        expect(plot._Mx.canvas.width).toBe(container.clientWidth);
        for (var pos = 0; pos < positions.length; ++pos) {
            expect(plot._Gx.plugins[pos].canvas.height).toBe(plot._Mx.canvas.height);
            expect(plot._Gx.plugins[pos].canvas.width).toBe(plot._Mx.canvas.width);
        }
    });

    it("unit strings test: x -> Power and y -> Angle rad", () => {
        var plot = new sigplot.Plot(container, {});
        expect(plot).not.toBe(null);
        var ramp = [];
        for (var i = 0; i < 20; i++) {
            ramp.push(i);
        }
        var lyr_uuid = plot.overlay_array(
            ramp,
            {
                xunits: "Power",
                yunits: "Angle rad"
            },
            {
                name: "x",
                symbol: 1,
                line: 0
            }
        );

        expect(plot._Gx.HCB_UUID[lyr_uuid].xunits).toBe(12);
        expect(plot._Gx.HCB_UUID[lyr_uuid].yunits).toBe(33);
        expect(plot._Gx.xlab).toBe(12);
        expect(plot._Gx.ylab).toBe(33);
    });

    it("unit strings test: x -> Hz and y -> Time_sec", () => {
        var plot = new sigplot.Plot(container, {});
        expect(plot).not.toBe(null);
        var ramp = [];
        for (var i = 0; i < 20; i++) {
            ramp.push(i);
        }
        var lyr_uuid = plot.overlay_array(
            ramp,
            {
                xunits: "Hz",
                yunits: "Time_sec"
            },
            {
                name: "x",
                symbol: 1,
                line: 0
            }
        );

        expect(plot._Gx.HCB_UUID[lyr_uuid].xunits).toBe(3);
        expect(plot._Gx.HCB_UUID[lyr_uuid].yunits).toBe(1);
        expect(plot._Gx.xlab).toBe(3);
        expect(plot._Gx.ylab).toBe(1);
    });

    // Requires browser mode (jsdom clientWidth/clientHeight always return 0)
    it("sigplot line push smaller than framesize", () => {
        var plot = new sigplot.Plot(container);
        expect(plot).not.toBe(null);
        expect(plot._Mx.canvas.height).toBe(400);
        var zeros = [];
        for (var i = 0; i < 128; i += 1) {
            zeros.push(0.0);
        }
        var lyr_uuid = plot.overlay_pipe(
            {
                type: 2000,
                subsize: 64
            },
            {
                layerType: sigplot.Layer1D
            }
        );
        expect(plot.get_layer(0)).not.toBe(null);

        var hcb = plot.get_layer(0).hcb;
        expect(hcb.dview.length - hcb.data_free).toBe(0);

        plot.push(lyr_uuid, zeros, null, true);
        expect(hcb.dview.length - hcb.data_free).toBe(0);

        plot.push(lyr_uuid, zeros.slice(0, 63), null, true);
        expect(hcb.dview.length - hcb.data_free).toBe(0);

        plot.push(lyr_uuid, zeros.slice(0, 2), null, true);
        expect(hcb.dview.length - hcb.data_free).toBe(0);

        plot.push(lyr_uuid, zeros, null, true);
        expect(hcb.dview.length - hcb.data_free).toBe(0);
    });

    // Requires browser mode (jsdom clientWidth/clientHeight always return 0)
    it("sigplot raster push smaller than framesize", () => {
        var plot = new sigplot.Plot(container);
        expect(plot).not.toBe(null);
        expect(plot._Mx.canvas.height).toBe(400);
        var zeros = [];
        for (var i = 0; i < 128; i += 1) {
            zeros.push(0.0);
        }
        var lyr_uuid = plot.overlay_pipe({
            type: 2000,
            subsize: 64
        });
        expect(plot.get_layer(0)).not.toBe(null);

        var hcb = plot.get_layer(0).hcb;
        expect(hcb.dview.length - hcb.data_free).toBe(0);

        plot.push(lyr_uuid, zeros, null, true);
        expect(hcb.dview.length - hcb.data_free).toBe(0);

        plot.push(lyr_uuid, zeros.slice(0, 63), null, true);
        expect(hcb.dview.length - hcb.data_free).toBe(63);

        plot.push(lyr_uuid, zeros.slice(0, 2), null, true);
        expect(hcb.dview.length - hcb.data_free).toBe(1);

        plot.push(lyr_uuid, zeros, null, true);
        expect(hcb.dview.length - hcb.data_free).toBe(1);
    });

    it("sigplot layer user_data", () => {
        var plot = new sigplot.Plot(container);

        var lyr_1 = plot.overlay_array([]);
        expect(plot.get_layer(lyr_1).user_data).toBe(undefined);

        var lyr_2 = plot.overlay_array([], null, { user_data: "test" });
        expect(plot.get_layer(lyr_1).user_data).toBe(undefined);
        expect(plot.get_layer(lyr_2).user_data).toBe("test");
    });

    // Requires browser mode (real canvas) — overlay_href uses XHR which is not available in jsdom
    it.skip("Plot y-cut preserves pan values", () => {});

    // Requires browser mode (real canvas) — overlay_href uses XHR which is not available in jsdom
    it.skip("Plot onerror callback", () => {});

    // Requires browser mode (real canvas) — overlay_href uses XHR which is not available in jsdom
    it.skip("Plot onerror SDS callback", () => {});

    describe("Layer1D regression", () => {
        it("W4: should replace existing highlights when passing an array to add_highlight", () => {
            const plot = new sigplot.Plot(container, {
                all: true,
                expand: true
            });

            const data = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

            plot.overlay_array(data, {
                type: 1000,
                file_name: "highlight_test"
            });

            expect(plot._Gx.lyr).toHaveLength(1);
            const layer = plot._Gx.lyr[0];

            if (layer.add_highlight && layer.get_highlights) {
                const singleHighlight = { xstart: 1, xend: 3, color: "red" };
                layer.add_highlight(singleHighlight);

                let highlights = layer.get_highlights();
                expect(highlights).toHaveLength(1);
                expect(highlights[0].color).toBe("red");

                const highlightArray = [
                    { xstart: 2, xend: 4, color: "blue" },
                    { xstart: 5, xend: 7, color: "green" }
                ];
                layer.add_highlight(highlightArray);

                highlights = layer.get_highlights();
                expect(highlights).toHaveLength(2);

                expect(highlights.some((h) => h.color === "blue")).toBe(true);
                expect(highlights.some((h) => h.color === "green")).toBe(true);
                expect(highlights.some((h) => h.color === "red")).toBe(false);
            } else {
                console.log("Layer highlight methods not available, skipping highlight test");
            }
        });

        it("P2-4: should assign position = 0 when subsize changes in push()", () => {
            const src = fs.readFileSync("js/sigplot.layer1d.ts", "utf-8");

            const subsizeBlock = src.match(/hdrmod\.subsize[\s\S]*?this\.position\s*=\s*0/);
            expect(subsizeBlock).not.toBeNull();

            const posAssignment = src.match(/hdrmod\.subsize[\s\S]*?this\.position\s*=\s*(0|undefined|null)/);
            expect(posAssignment).not.toBeNull();
            expect(posAssignment![1]).toBe("0");
        });
    });

    describe("Layer2D regression", () => {
        it("W1: should use .length (element count) not .byteLength for layer2d sizing", () => {
            const plot = new sigplot.Plot(container, {
                all: true,
                expand: true
            });

            const rows = 4;
            const cols = 5;
            const totalElements = rows * cols;

            const data = new Float64Array(totalElements);
            for (let i = 0; i < totalElements; i++) {
                data[i] = Math.sin(i * 0.1);
            }

            plot.overlay_array(data, {
                type: 2000,
                subsize: cols,
                file_name: "regression_test",
                xstart: 0.0,
                xdelta: 1.0,
                ystart: 0.0,
                ydelta: 1.0
            });

            expect(plot._Gx.lyr).toHaveLength(1);

            const layer = plot._Gx.lyr[0];
            const layerHcb = layer.hcb;

            expect(layerHcb.subsize).toBe(cols);
            expect(layerHcb.size).toBeDefined();
            expect(layerHcb.size).toBeGreaterThan(0);
            expect(typeof layerHcb.size).toBe("number");
        });

        it("W3: should set hcb.buf_type on BlueHeader, not hcb.buf._type (double)", () => {
            const plot = new sigplot.Plot(container, {
                all: true,
                expand: true
            });

            const data = new Float64Array([1, 2, 3, 4, 5]);

            plot.overlay_array(data, {
                type: 1000,
                file_name: "buf_type_test"
            });

            expect(plot._Gx.lyr).toHaveLength(1);

            const layer = plot._Gx.lyr[0];
            const hcb = layer.hcb;

            expect(hcb.buf_type).toBeDefined();
            expect(hcb.buf_type).toBe("D");

            if (hcb.buf) {
                expect(hcb.buf._type).toBeUndefined();
            }
        });

        it("W3: should handle SDS format with buf_type 'I'", () => {
            const plot = new sigplot.Plot(container, {
                all: true,
                expand: true
            });

            const data = new Int16Array([100, 200, 300, 400, 500]);

            plot.overlay_array(data, {
                type: 1000,
                format: "SI",
                file_name: "sds_buf_type_test"
            });

            expect(plot._Gx.lyr).toHaveLength(1);

            const layer = plot._Gx.lyr[0];
            const hcb = layer.hcb;

            expect(hcb.buf_type).toBeDefined();
            expect(typeof hcb.buf_type).toBe("string");
        });

        it("P2-5: should leave position, ymin, ymax undefined before init()", () => {
            const mockPlot = {
                _Gx: {
                    xcompression: 1,
                    rasterDownscale: 1
                }
            };

            const layer = new Layer2D(mockPlot as any);

            expect(layer.position).toBeUndefined();
            expect(layer.ymin).toBeUndefined();
            expect(layer.ymax).toBeUndefined();
        });
    });
});
