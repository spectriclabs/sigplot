/**
 * @license
 * File: sigplot.layer2d.js
 * Copyright (c) 2012-2017, LGS Innovations Inc., All rights reserved.
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
 * under the License
 */

/* global module */
/* global require */

(function() {

    var m = require("./m");
    var mx = require("./mx");

    /**
     * @constructor
     * @param plot
     */
    var Layer2D = function(plot) {
        this.plot = plot;

        this.offset = 0.0;
        this.xstart = 0.0;
        this.xdelta = 0.0;
        this.ystart = 0.0;
        this.ydelta = 0.0;
        this.imin = 0;
        this.xmin = 0.0;
        this.xmax = 0.0;
        this.name = "";
        this.cx = false;
        this.drawmode = "scrolling"; // "falling", "rising"
        this.hcb = undefined; // index in Gx.HCB

        this.display = true;
        this.color = 0;
        this.line = 3; // 0=none, 1-vertical, 2-horizontal, 3-connecting
        this.thick = 1; // negative for dashed
        this.symbol = 0;
        this.radius = 3;

        this.skip = 0; // number of elements between ord values
        this.xsub = 0;
        this.ysub = 0;
        this.xdata = false; // true if X data is data from file
        this.modified = false;

        this.preferred_origin = 4;
        this.opacity = 1;
        this.xcompression = plot._Gx.xcompression; // default is Gx.xcompression
        this.downscale = plot._Gx.rasterDownscale;

        // LPB is kinda odd right now, since we read the entire file into memory anyways...
        // given that often we are loading from an HREF so there is no downside to this...
        // however, we keep LPB around (for now) so that the scaling behaves identical to
        // the original code
        this.lpb = undefined;

        this.yc = 1; // y-compression factor...not yet used

        this.options = {};
    };

    Layer2D.prototype = {

        /**
         * Initializes the layer to display the provided data.
         *
         * @param hcb
         *            {BlueHeader} an opened BlueHeader file
         * @param lyrn
         *          the index of the added layer
         *
         * @memberOf Layer2D
         * @private
         */
        init: function(hcb) {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;

            this.hcb = hcb;
            this.hcb.buf_type = "D";

            if (this.hcb.pipe) {
                var self = this;
                this.position = 0;
                this.frame = 0;

                if (this.drawdirection !== "horizontal") {
                    this.lps = this.hcb.lps || Math.ceil(Math.max(1, (Mx.b - Mx.t)));
                } else {
                    this.lps = this.hcb.lps || Math.ceil(Math.max(1, (Mx.r - Mx.l)));
                }

                m.addPipeWriteListener(this.hcb, function() {
                    self._onpipewrite();
                });
            } else {
                this.lps = this.hcb.lps || Math.ceil(hcb.size);
            }

            this.offset = 0;
            this.xbufn = 0;
            this.ybufn = 0;

            if (hcb["class"] <= 2) {
                this.xsub = -1;
                this.ysub = 1;
                this.cx = (hcb.format[0] === 'C');
            } else {
                // TODO
            }

            this.skip = 1;
            if (this.cx) {
                this.skip = 2;
            }

            this.init_axes();
        },

        init_axes: function() {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;

            if (Gx.index) {
                this.xstart = 1.0;
                this.xdelta = 1.0;
                this.xmin = 1.0;

                this.ystart = 1.0;
                this.ydelta = 1.0;
                this.ymin = 1.0;
                if (this.drawdirection !== "horizontal") {
                    this.xmax = this.hcb.subsize;
                    this.ymax = this.size;
                } else {
                    this.xmax = this.size;
                    this.ymax = this.hcb.subsize;
                }
            } else {
                if (this.drawdirection !== "horizontal") {
                    this.xstart = this.hcb.xstart;
                    this.xdelta = this.hcb.xdelta;
                    var d = this.hcb.xstart + (this.hcb.xdelta * this.hcb.subsize);
                    this.xmin = this.hcb.xmin || Math.min(this.hcb.xstart, d);
                    this.xmax = this.hcb.xmax || Math.max(this.hcb.xstart, d);
                    if (this.hcb.class === 1) {
                        this.ystart = this.hcb.xstart;
                        this.ydelta = this.hcb.xdelta * this.hcb.subsize;
                    } else {
                        this.ystart = this.hcb.ystart;
                        this.ydelta = this.hcb.ydelta;
                    }
                    var d = this.ystart + (this.ydelta * this.lps);
                    this.ymin = this.hcb.ymin || Math.min(this.ystart, d);
                    this.ymax = this.hcb.ymax || Math.max(this.ystart, d);
                } else {
                    // This code is kinda confusing because it will look like we are
                    // incorrectly mixing and matching x and y incorrectly, but it's
                    // likely right ... just not clear, before changing anything here
                    // think first
                    this.ystart = this.hcb.xstart;
                    this.ydelta = this.hcb.xdelta;
                    var d = this.hcb.xstart + (this.hcb.xdelta * this.hcb.subsize);
                    this.ymin = this.hcb.xmin || Math.min(this.hcb.xstart, d);
                    this.ymax = this.hcb.xmax || Math.max(this.hcb.xstart, d);

                    if (this.hcb.class === 1) {
                        this.xstart = this.hcb.xstart;
                        this.xdelta = this.hcb.xdelta * this.hcb.subsize;
                    } else {
                        this.xstart = this.hcb.ystart;
                        this.xdelta = this.hcb.ydelta;
                    }
                    var d = this.xstart + (this.xdelta * this.lps);
                    this.xmin = this.hcb.ymin || Math.min(this.hcb.ystart, d);
                    this.xmax = this.hcb.ymax || Math.max(this.hcb.ystart, d);
                }
            }

            // TODO make this work with force 1000 applied
            this.xframe = this.hcb.subsize;
            this.yframe = (this.lps * this.hcb.subsize) / this.xframe;

            if (this.lpb === 0) {
                this.lpb = this.yframe;
            }
            if (!this.lpb || (this.lpb <= 0)) {
                this.lpb = 16;
            }
            this.lpb = Math.max(1, this.lpb / this.yc) * this.yc;

            if (this.drawdirection !== "horizontal") {
                this.xlab = this.hcb.xunits;
                this.ylab = this.hcb.yunits; // might be undefined
            } else {
                this.xlab = this.hcb.yunits;
                this.ylab = this.hcb.xunits; // might be undefined
            }

            if ((this.drawmode === "falling" || this.drawdirection === "horizontal")) {
                this.plot._Mx.origin = 1;
                this.preferred_origin = 1;
            } else {
                this.plot._Mx.origin = 4;
                this.preferred_origin = 4;
            }
        },

        _onpipewrite: function() {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;

            while (m.pavail(this.hcb) >= (this.hcb.subsize * this.hcb.spa)) {

                // if we aren't scrolling, than update the values
                // so that the axis scrolls with the data.  The below
                // code might seem counter intuitive, but given the
                // the behavior of other rendering code it is configured
                // to have ymin always be the history (i.e prior to ystart)
                // and ystart is always the relative "now" which is equivalent
                // to ymax
                if (this.drawmode !== "scrolling") {
                    this.hcb.ystart += this.hcb.ydelta;
                    this.ystart = this.hcb.ystart;
                    this.ymin = this.hcb.ystart - (this.hcb.ydelta * (this.lps));
                    this.ymax = this.hcb.ystart;
                }

                if ((this.drawmode === "falling") && (this.drawdirection !== "horizontal")) {
                    this.position = 0;
                    if (this.img) {
                        mx.shift_image_rows(Mx, this.img, 1);
                    }
                } else if ((this.drawmode === "rising") && (this.drawdirection !== "horizontal")) {
                    this.position = this.lps - 1;
                    if (this.img) {
                        mx.shift_image_rows(Mx, this.img, -1);
                    }
                } else if (this.drawmode === "scrolling") {
                    var ylength = Math.abs(this.ymax - this.ymin);
                    this.ystart = 0;
                    this.ymin = 0;
                    this.ymax = ylength;
                    if (this.position >= this.lps) { // if lps got resized make sure we don't go out of bounds
                        this.position = 0;
                    }
                } else {
                    throw "Invalid draw mode";
                }

                if (!this.buf) {
                    // the layer isn't setup correctly yet
                    return;
                }

                // grab one row worth of data
                var ngot = m.grabx(this.hcb, this.buf, this.hcb.subsize * this.hcb.spa);
                if (ngot === 0) { // shouldn't happen because of the pavail check
                    m.log.error("Internal error");
                    return;
                }

                var zpoint = new m.PointArray(this.hcb.subsize);
                if (this.cx) {
                    if (Gx.cmode === 1) {
                        m.cvmag(this.buf, zpoint, zpoint.length);
                    } else if (Gx.cmode === 2) {
                        if (Gx.plab === 25) {
                            m.cvpha(this.buf, zpoint, zpoint.length);
                            m.vsmul(zpoint, 1.0 / (2 * Math.PI), zpoint, zpoint.length);
                        } else if (Gx.plab !== 24) {
                            m.cvpha(this.buf, zpoint, zpoint.length);
                        } else {
                            m.cvphad(this.buf, zpoint, zpoint.length);
                        }
                    } else if (Gx.cmode === 3) {
                        m.vmov(this.buf, this.skip, zpoint, 1, zpoint.length);
                    } else if (Gx.cmode === 4) {
                        m.vmov(this.buf.subarray(1), this.skip, zpoint, 1, zpoint.length);
                    } else if (Gx.cmode === 5) { // IR
                        m.vfill(zpoint, 0, zpoint.length);
                    } else if (Gx.cmode === 6) { // 10log
                        m.cvmag2logscale(this.buf, Gx.dbmin, 10.0, zpoint);
                    } else if (Gx.cmode === 7) { // 20log
                        m.cvmag2logscale(this.buf, Gx.dbmin, 20.0, zpoint);
                    }
                } else {
                    if (Gx.cmode === 1) { // mag
                        m.vabs(this.buf, zpoint);
                    } else if (Gx.cmode === 2) { // phase
                        m.vfill(zpoint, 0, zpoint.length);
                    } else if (Gx.cmode === 3) { // real
                        m.vmov(this.buf, this.skip, zpoint, 1, zpoint.length);
                    } else if (Gx.cmode === 4) { // imag
                        m.vfill(zpoint, 0, zpoint.length);
                    } else if (Gx.cmode === 5) { // IR
                        m.vfill(zpoint, 0, zpoint.length);
                    } else if (Gx.cmode === 6) { // 10log
                        m.vlogscale(this.buf, Gx.dbmin, 10.0, zpoint);
                    } else if (Gx.cmode === 7) { // 20log
                        m.vlogscale(this.buf, Gx.dbmin, 20.0, zpoint);
                    }
                }

                var min = zpoint[0];
                var max = zpoint[0];
                for (var i = 0; i < zpoint.length; i++) {
                    if (zpoint[i] < min) {
                        min = zpoint[i];
                    }
                    if (zpoint[i] > max) {
                        max = zpoint[i];
                    }
                }

                var zmin, zmax;
                if (Gx.autol === 1) {
                    zmin = min;
                    zmax = max;
                } else if (Gx.autol > 1) {
                    var fac = 1.0 / (Math.max(Gx.autol, 1));
                    zmin = Gx.zmin * fac + min * (1.0 - fac);
                    zmax = Gx.zmax * fac + max * (1.0 - fac);
                } else if (Gx.autol < 0) {
                    // -1 means autol wasn't set so default to
                    // 5 like the original XRTRASTER; however,
                    // don't actually override Gx.autol since
                    // other layers may behave differently
                    var fac = 1.0 / (Math.max(5, 1));
                    zmin = Gx.zmin * fac + min * (1.0 - fac);
                    zmax = Gx.zmax * fac + max * (1.0 - fac);
                }

                if (((Gx.autoz & 1) !== 0)) {
                    Gx.zmin = zmin;
                }
                if (((Gx.autoz & 2) !== 0)) {
                    Gx.zmax = zmax;
                }
                if (Gx.p_cuts) {
                    if (this.drawmode === "scrolling") {
                        //fill in the next row of data.
                        var start_write = this.position * this.hcb.subsize;
                        var stop_write = start_write + this.hcb.subsize;
                        var b = 0;
                        for (var i = start_write; i < stop_write; i++) {
                            this.zbuf[i] = zpoint[b];
                            b++;
                        }

                    }
                    if (this.drawmode === "falling") {
                        //shift and fill in the next row of data.
                        var cut_off = (this.lps - 1) * this.hcb.subsize;
                        var tmp = this.zbuf.slice(0, cut_off);
                        this.zbuf = [];
                        for (var i = 0; i < this.hcb.subsize; i++) {
                            this.zbuf.push(zpoint[i]);
                        }
                        this.zbuf.push.apply(this.zbuf, tmp);
                        tmp = [];
                    }
                    if (this.drawmode === "rising") {
                        //shift and fill in the next row of data.
                        var cut_off = this.lps * this.hcb.subsize;
                        var tmp = this.zbuf.slice(this.hcb.subsize, cut_off);
                        this.zbuf = [];
                        this.zbuf.push.apply(this.zbuf, tmp);
                        for (var i = 0; i < this.hcb.subsize; i++) {
                            this.zbuf.push(zpoint[i]);
                        }
                        tmp = [];
                    }
                }

                if (this.img) {
                    if (this.drawdirection !== "horizontal") {
                        mx.update_image_row(Mx, this.img, zpoint, this.position, Gx.zmin, Gx.zmax, this.xcompression);
                    } else {
                        mx.update_image_col(Mx, this.img, zpoint, this.position, Gx.zmin, Gx.zmax, this.xcompression);
                    }
                }
                this.frame += 1;
                if (this.drawmode === "scrolling") {
                    this.position = (this.position + 1) % this.lps;
                }

                if (Mx.level === 0) {
                    Gx.panymin = this.ymin;
                    Gx.panymax = this.ymax;
                    Mx.stk[0].ymin = this.ymin;
                    Mx.stk[0].ymax = this.ymax;
                }
            }
        },

        get_data: function() {
            var HCB = this.hcb;

            if (!this.buf) {
                if (this.hcb.pipe) {
                    // For pipes, we allocate buf and zbuf to only hold one line of
                    // data
                    this.buf = this.hcb.createArray(null, 0, this.hcb.subsize * this.hcb.spa);
                    this.zbuf = new m.PointArray(this.hcb.subsize);
                } else {
                    // Otherwise, we allocate for the entire image
                    this.buf = this.hcb.createArray(null, 0, this.lps * this.hcb.subsize * this.hcb.spa);
                    this.zbuf = new m.PointArray(this.lps * this.hcb.subsize);
                }
            }

            if (!this.hcb.pipe) {
                m.grab(HCB, this.buf, 0, HCB.subsize);
            }
        },

        /**
         * Provisional API
         *
         * @private
         * @param x
         * @param y
         */
        get_z: function(x, y) {
            var ix = Math.floor(x / this.hcb.xdelta);
            var iy = Math.floor(y / this.hcb.ydelta);
            var zidx = (iy * this.hcb.subsize) + ix;
            return this.zbuf[zidx];
        },

        change_settings: function(settings) {
            var Gx = this.plot._Gx;
            if (settings.subsize) {
                this.hcb.subsize = settings.subsize;
                this.hcb.ape = settings.subsize;
                this.hcb.size = this.hcb.dview.length / (this.hcb.spa * this.hcb.ape);
                this.lps = Math.ceil(this.hcb.size);
                var d = this.hcb.ystart + (this.hcb.ydelta * this.lps);
                this.ymin = this.hcb.ymin || Math.min(this.hcb.ystart, d);
                this.ymax = this.hcb.ymax || Math.max(this.hcb.ystart, d);
            }
            if (settings.cmode !== undefined) {
                this.img = undefined;
                if (((Gx.autoz & 1) !== 0)) {
                    Gx.zmin = undefined;
                }
                if (((Gx.autoz & 2) !== 0)) {
                    Gx.zmax = undefined;
                }
            }
            if ((settings.zmin !== undefined) ||
                (settings.zmax !== undefined) ||
                (settings.autoz !== undefined)) {
                this.img = undefined;
            }
            if (settings.drawmode !== undefined) {
                this.drawmode = settings.drawmode;
            }
            if (settings.drawdirection !== undefined) {
                this.drawdirection = settings.drawdirection;
            }
            // There are a variety of settings, that when changed 
            // require us to recompute the image and many internal settings
            if ((settings.drawmode !== undefined) || (settings.xmin !== undefined) ||
                (settings.xmax !== undefined) || (settings.xdelta !== undefined) ||
                (settings.xstart !== undefined) || (settings.drawdirection !== undefined)) {
                // Reset the buffer
                this.position = 0;
                this.frame = 0;
                if (this.hcb.pipe) {
                    this.buf = this.hcb.createArray(null, 0, this.hcb.subsize * this.hcb.spa);
                    this.zbuf = new m.PointArray(this.hcb.subsize);
                } else {
                    this.buf = this.hcb.createArray(null, 0, this.lps * this.hcb.subsize * this.hcb.spa);
                    this.zbuf = new m.PointArray(this.lps * this.hcb.subsize);
                }
                this.img = undefined;


                this.init_axes();
            }
            if (settings.opacity !== undefined) {
                this.opacity = settings.opacity;
            }
            if (settings.p_cuts !== undefined) {
                var p_cuts = Gx.p_cuts;
                if (settings.p_cuts === null) {
                    p_cuts = !p_cuts;
                } else {
                    p_cuts = settings.p_cuts;
                }

                // If p_cuts are enabled from streams, we need to keep the entire zbuf in memory
                if (this.hcb.pipe) {
                    if (p_cuts) {
                        this.buf = this.hcb.createArray(null, 0, this.lps * this.hcb.subsize * this.hcb.spa);
                        this.zbuf = new m.PointArray(this.lps * this.hcb.subsize);
                    } else {
                        this.buf = this.hcb.createArray(null, 0, this.hcb.subsize * this.hcb.spa);
                        this.zbuf = new m.PointArray(this.hcb.subsize);
                    }
                }
            }

            if (settings.xcmp !== undefined) {
                if (settings.xcmp === "smooth") {
                    this.xcompression = 0;
                } else if (settings.xcmp === "avg") {
                    this.xcompression = 1;
                } else if (settings.xcmp === "min") {
                    this.xcompression = 2;
                } else if (settings.xcmp === "max") {
                    this.xcompression = 3;
                } else if (settings.xcmp === "first") {
                    this.xcompression = 4;
                } else if (settings.xcmp === "maxabs") {
                    this.xcompression = 5;
                } else {
                    this.xcompression = settings.xcmp;
                }
            }

            if (settings.name !== undefined) {
                this.name = settings.name;
            }

            if (settings.downscale !== undefined) {
                this.downscale = settings.downscale;
            }
        },

        reload: function(data, hdrmod) {
            if (this.hcb.pipe) {
                throw "reload cannot be used with pipe, use push instead";
            }
            var axis_change = (this.hcb.dview.length !== data.length) || hdrmod;
            if (hdrmod) {
                for (var k in hdrmod) {
                    this.hcb[k] = hdrmod[k];
                    if (k === "xstart" || k === "xdelta" | k === "ystart" || k === "ydelta" || k === "subsize") {
                        axis_change = true;
                    }
                }
            }
            if (Array.isArray(data) && Array.isArray(data[0])) {
                this.hcb.type = 2000;
                this.hcb["class"] = 2;
                this.hcb.subsize = data[0].length;
                this.hcb.size = data.length;
                axis_change = true;
            }
            this.hcb.setData(data);

            // Setting these causes refresh() to refetch
            this.init(this.hcb);
            this.img = null;
            this.buf = null;

            var xmin = this.xmin;
            var xmax = this.xmax;

            if (axis_change) {
                var d = this.hcb.xstart + (this.hcb.xdelta * this.hcb.subsize);
                this.xmin = Math.min(this.hcb.xstart, d);
                this.xmax = Math.max(this.hcb.xstart, d);
                this.xdelta = this.hcb.xdelta;
                this.xstart = this.hcb.xstart;
                xmin = undefined;
                xmax = undefined;
            }

            return {
                xmin: xmin,
                xmax: xmax
            };
        },

        push: function(data, hdrmod, sync) {
            var Gx = this.plot._Gx;
            var rescale = false;
            var timestamp = null;
            if (hdrmod) {
                // handle timestamps in a unique manner
                if (hdrmod.timestamp) {
                    timestamp = hdrmod.timestamp;
                    delete hdrmod["timestamp"];
                }

                // If the subsize changes, we need to invalidate the buffer and image
                if ((hdrmod.subsize) && (hdrmod.subsize !== this.hcb.subsize)) {
                    this.hcb.subsize = hdrmod.subsize;
                    if (this.hcb.pipe && !Gx.p_cuts) {
                        this.buf = this.hcb.createArray(null, 0, this.hcb.subsize * this.hcb.spa);
                        this.zbuf = new m.PointArray(this.hcb.subsize);
                        this.img = undefined;
                    } else {
                        this.buf = this.hcb.createArray(null, 0, this.lps * this.hcb.subsize * this.hcb.spa);
                        this.zbuf = new m.PointArray(this.lps * this.hcb.subsize);
                        this.img = undefined;
                    }
                    rescale = true;
                }

                for (var k in hdrmod) {
                    if (this.hcb[k] !== hdrmod[k]) {
                        this.hcb[k] = hdrmod[k];
                        if (k === "type") {
                            this.hcb["class"] = hdrmod[k] / 1000;
                        }
                        rescale = true;
                    }
                }

                if (hdrmod.lps) {
                    this.lps = hdrmod.lps;
                }

                if (rescale) {
                    var d = this.hcb.xstart + (this.hcb.xdelta * this.hcb.subsize);
                    this.xmin = Math.min(this.hcb.xstart, d);
                    this.xmax = Math.max(this.hcb.xstart, d);
                    this.xdelta = this.hcb.xdelta;
                    this.xstart = this.hcb.xstart;

                    this.ystart = this.hcb.ystart;
                    this.ydelta = this.hcb.ydelta;
                    var d = this.hcb.ystart + (this.hcb.ydelta * this.lps);
                    this.ymin = Math.min(this.hcb.ystart, d);
                    this.ymax = Math.max(this.hcb.ystart, d);
                }

            }

            if ((this.hcb.yunits === 1) || (this.hcb.yunits === 4)) {
                if ((!this.hcb["timecode"]) && (timestamp)) {
                    // if we don't have a timecode set, we can use
                    // the timestamp and reset ystart
                    this.hcb.timecode = m.j1970toj1950(timestamp);
                    this.hcb.ystart = 0;
                    rescale = true;
                } else {
                    // otherwise, we need to look at timecode, ystart,
                    // and ydelta to see if the timestamp indicates
                    // any data drops...and then zero-fill accordingly
                    // TODO
                }
            }

            if (data.length > 0) {
                m.filad(this.hcb, data, sync);
            }

            return rescale;

        },

        get_pan_bounds: function(view) {
            let prep = this.prep();

            if (prep) {
                return {
                    num: prep.num,
                    xmin: this.xmin,
                    xmax: this.xmax,
                    ymin: this.ymin,
                    ymax: this.ymax
                };
            } else {
                return {
                    num: 0
                };
            }
        },

        prep: function(xmin, xmax) {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;

            var npts = this.lps;

            var skip = this.skip;

            var qmin = this.xmin;
            var qmax = this.xmax;
            var n1, n2;

            var xsize = this.hcb.subsize;
            if (this.xcompression > 0) {
                if (this.drawdirection !== "horizontal") {
                    xsize = Math.min(this.hcb.subsize, Math.ceil(Mx.r - Mx.l));
                } else {
                    xsize = Math.min(this.hcb.subsize, Math.ceil(Mx.t - Mx.b));
                }
            }

            this.get_data();

            if (!this.hcb.pipe) {
                // if we aren't a pipe we do a full prep

                if ((Gx.cmode === 5) || (this.xsub > 0)) {
                    // TODO - is this mode supported in rasters?
                } else if (npts > 0) {
                    var xstart = this.xstart;
                    var xdelta = this.xdelta;
                    var d = npts;
                    if (Gx.index) {
                        n1 = 0;
                        n2 = npts - 1;
                    } else if (xdelta >= 0.0) {
                        n1 = Math.max(1.0, Math.min(d, Math.round((xmin - xstart) / xdelta))) - 1.0;
                        n2 = Math.max(1.0, Math.min(d, Math.round((xmax - xstart) / xdelta) + 2.0)) - 1.0;
                    } else {
                        n1 = Math.max(1.0, Math.min(d, Math.round((xmax - xstart) / xdelta) - 1.0)) - 1.0;
                        n2 = Math.max(1.0, Math.min(d, Math.round((xmin - xstart) / xdelta) + 2.0)) - 1.0;
                    }

                    npts = n2 - n1 + 1;
                    if (npts < 0) {
                        m.log.debug("Nothing to plot");
                        npts = 0;
                    }
                }

                if (npts <= 0) {
                    m.log.debug("Nothing to plot");
                    return;
                }

                if ((Gx.cmode === 5) || (this.ysub > 0)) {
                    // TODO - is this mode supported in rasters?
                } else if (npts > 0) {
                    var ystart = this.ystart;
                    var ydelta = this.ydelta;
                    var d = npts;
                    if (Gx.index) {
                        n1 = 0;
                        n2 = npts - 1;
                    } else if (ydelta >= 0.0) {
                        n1 = Math.max(1.0, Math.min(d, Math.round((xmin - ystart) / ydelta))) - 1.0;
                        n2 = Math.max(1.0, Math.min(d, Math.round((xmax - ystart) / ydelta) + 2.0)) - 1.0;
                    } else {
                        n1 = Math.max(1.0, Math.min(d, Math.round((xmax - ystart) / ydelta) - 1.0)) - 1.0;
                        n2 = Math.max(1.0, Math.min(d, Math.round((xmin - ystart) / ydelta) + 2.0)) - 1.0;
                    }

                    npts = n2 - n1 + 1;
                    if (npts < 0) {
                        m.log.debug("Nothing to plot");
                        npts = 0;
                    }
                }

                if (this.cx) {
                    if (Gx.cmode === 1) { // mag
                        m.cvmag(this.buf, this.zbuf, this.zbuf.length);
                    } else if (Gx.cmode === 2) { // phase
                        if (Gx.plab === 25) {
                            m.cvpha(this.buf, this.zbuf, this.zbuf.length);
                            m.vsmul(this.zbuf, 1.0 / (2 * Math.PI), this.zbuf, this.zbuf.length);
                        } else if (Gx.plab !== 24) {
                            m.cvpha(this.buf, this.zbuf, this.zbuf.length);
                        } else {
                            m.cvphad(this.buf, this.zbuf, this.zbuf.length);
                        }
                    } else if (Gx.cmode === 3) { // real
                        m.vmov(this.buf, this.skip, this.zbuf, 1, this.zbuf.length);
                    } else if (Gx.cmode === 4) { // imag
                        m.vmov(this.buf.subarray(1), this.skip, this.zbuf, 1, this.zbuf.length);
                    } else if (Gx.cmode === 5) { // IR - what does this mean for a raster?
                        m.vfill(this.zbuf, 0, this.zbuf.length);
                    } else if (Gx.cmode === 6) { // 10log
                        m.cvmag2logscale(this.buf, Gx.dbmin, 10.0, this.zbuf);
                    } else if (Gx.cmode === 7) { // 20log
                        m.cvmag2logscale(this.buf, Gx.dbmin, 20.0, this.zbuf);
                    }
                } else {
                    if (Gx.cmode === 1) { // mag
                        m.vabs(this.buf, this.zbuf);
                    } else if (Gx.cmode === 2) { // phase
                        m.vfill(this.zbuf, 0, this.zbuf.length);
                    } else if (Gx.cmode === 3) { // real
                        m.vmov(this.buf, this.skip, this.zbuf, 1, this.zbuf.length);
                    } else if (Gx.cmode === 4) { // imag
                        m.vfill(this.zbuf, 0, this.zbuf.length);
                    } else if (Gx.cmode === 5) { // IR
                        m.vfill(this.zbuf, 0, this.zbuf.length);
                    } else if (Gx.cmode === 6) { // 10log
                        m.vlogscale(this.buf, Gx.dbmin, 10.0, this.zbuf);
                    } else if (Gx.cmode === 7) { // 20log
                        m.vlogscale(this.buf, Gx.dbmin, 20.0, this.zbuf);
                    }
                }

                // find z-min/z-max
                // this is equivalent to setting XRASTER /LPB=0
                var zpoint = this.zbuf;

                var min = 0;
                var max = 0;

                if ((Gx.autol <= 0) || this.hcb.pipe) {
                    // If autol is not used or the layer is rendering
                    // a pipe, then use the basic z-scaling method
                    if (zpoint.length > 0) {
                        min = zpoint[0];
                        max = zpoint[0];
                        for (var i = 0; i < zpoint.length; i++) {
                            if ((i / this.xframe) >= this.lpb) {
                                break;
                            }
                            if (zpoint[i] < min) {
                                min = zpoint[i];
                            }
                            if (zpoint[i] > max) {
                                max = zpoint[i];
                            }
                        }
                    }

                    if (((Gx.autoz & 1) !== 0)) {
                        if (Gx.zmin !== undefined) {
                            Gx.zmin = Math.min(Gx.zmin, min);
                        } else {
                            Gx.zmin = min;
                        }
                    }
                    if (((Gx.autoz & 2) !== 0)) {
                        if (Gx.zmax !== undefined) {
                            Gx.zmax = Math.min(Gx.zmax, max);
                        } else {
                            Gx.zmax = max;
                        }
                    }

                    this.img = mx.create_image(Mx,
                        this.zbuf,
                        this.hcb.subsize,
                        xsize,
                        this.lps,
                        Gx.zmin + Gx.zoff,
                        Gx.zmax + Gx.zoff,
                        this.xcompression,
                        this.drawdirection);
                } else {
                    // otherwise autol > 1
                    var nny = this.hcb.size;
                    var fac = 1.0 / (Math.max(Gx.autol, 1));

                    // If the image isn't yet created, make one now
                    if (!this.img) {
                        this.img = mx.create_image(Mx,
                            this.zbuf,
                            this.hcb.subsize,
                            xsize,
                            this.lps,
                            Gx.zmin + Gx.zoff,
                            Gx.zmax + Gx.zoff,
                            this.drawdirection);
                    }

                    Gx.zmin = 0;
                    Gx.zmax = 0;
                    if (zpoint.length > 0) {
                        for (var yy = 0; yy < nny; yy++) {
                            var noff = yy * this.xframe;
                            var min = zpoint[noff];
                            var max = zpoint[noff];
                            for (var i = 0; i < this.xframe; i++) {
                                min = Math.min(zpoint[noff + i], min);
                                max = Math.max(zpoint[noff + i], max);
                            }

                            // Auto-scale this raster line
                            if ((Gx.autoz !== 2) && (min !== undefined)) {
                                Gx.zmin = (min * fac) + (Gx.zmin * (1.0 - fac));
                            }
                            if ((Gx.autoz !== 1) && (max !== undefined)) {
                                Gx.zmax = (max * fac) + (Gx.zmax * (1.0 - fac));
                            }

                            // Render the row
                            mx.update_image_row(Mx,
                                this.img,
                                zpoint.subarray(noff, noff + this.xframe),
                                yy,
                                Gx.zmin,
                                Gx.zmax);

                        }
                    }
                }
            } else {
                // Setup image for pipe-mode

                if (!this.img) {
                    if (Gx.zmin === undefined) {
                        Gx.zmin = 0;
                    }
                    if (Gx.zmax === undefined) {
                        Gx.zmax = 0;
                    }
                    this.img = mx.create_image(Mx,
                        null,
                        this.hcb.subsize,
                        xsize,
                        this.lps,
                        Gx.zmin + Gx.zoff,
                        Gx.zmax + Gx.zoff,
                        this.xcompression,
                        this.drawdirection);
                }
            }

            this.img.cmode = Gx.cmode;
            this.img.cmap = Gx.cmap;
            this.img.origin = Mx.origin;

            // Make the parts without data transparent
            if (this.hcb.pipe && (this.frame < this.lps)) {
                var imgd = new Uint32Array(this.img);
                if (this.drawdirection !== "horizontal") {
                    if (this.drawmode === "rising") {
                        for (var i = 0; i < imgd.length - (this.frame * xsize); i++) {
                            imgd[i] = 0;
                        }
                    } else {
                        for (var i = this.frame * xsize; i < imgd.length; i++) {
                            imgd[i] = 0;
                        }
                    }
                } else {
                    for (var j = this.frame; j < this.lps; j++) {
                        for (var i = 0; i < this.img.height; i++) {
                            imgd[(i * this.img.width) + j] = 0;
                        }
                    }
                }
            }

            return {
                num: npts,
                panxmin: this.xmin,
                panxmax: this.xmax,
                panymin: this.ymin,
                panymax: this.ymax
            };
        },

        xCutData: function(ypos, zData) {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;
            var height = this.lps;
            var width = this.xframe;
            var i;

            // By default, pipe mode doesn't keep historical data
            // around unless p_cuts has been turned on.
            if (this.hcb.pipe && !Gx.p_cuts) {
                return null;
            }

            var x_cut_data;
            if (this.drawdirection !== "horizontal") {
                var row;

                if (!this.hcb.pipe) {
                    row = Math.floor((ypos - this.ystart) / this.ydelta);
                } else {
                    row = Math.floor((height * (Mx.ypos - Mx.t)) / (Mx.b - Mx.t));
                }
                if ((row < 0) || (row > this.lps)) {
                    return null;
                }
                var start = row * width;
                var finish = start + width;
                if (zData || this.hcb.pipe) {
                    x_cut_data = this.zbuf.slice(start, finish);
                } else {
                    x_cut_data = this.buf.slice(start, finish);
                }
            } else {
                x_cut_data = [];

                var col = Math.round((ypos - this.ystart) / this.ydelta);
                for (i = col; i < (width * height); i += width) {
                    if (zData || this.hcb.pipe) {
                        x_cut_data.push(this.zbuf[i]);
                    } else {
                        x_cut_data.push(this.buf[i]);
                    }
                }
            }

            return x_cut_data;
        },

        /**
         * Display an xCut
         *
         * @param ypos
         *     the y-position to extract the x-cut, leave undefined to
         *     leave xCut
         */
        xCut: function(ypos) {
            var Mx = this.plot._Mx;
            var Gx = this.plot._Gx;

            //display the x-cut of the raster
            if (ypos !== undefined) {

                // Stash important values
                this.cut_stash = {};
                this.cut_stash.ylabel = Gx.ylabel;
                this.cut_stash.xlabel = Gx.xlabel;
                this.cut_stash.level = Mx.level;
                this.cut_stash.stk = JSON.parse(JSON.stringify(Mx.stk));
                this.cut_stash.panymin = Gx.panymin;
                this.cut_stash.panymax = Gx.panymax;
                this.cut_stash.panxmin = Gx.panxmin;
                this.cut_stash.panxmax = Gx.panxmax;

                // Change Gx.lyr[0] to this.
                var x_cut_data = this.xCutData(ypos);
                if (!x_cut_data) {
                    return;
                }

                //adjust for the values of the xcut
                this.old_drawmode = this.drawmode;
                this.old_autol = Gx.autol;
                this.plot.change_settings({
                    drawmode: "undefined",
                    autol: -1
                });

                var cx = ((Gx.lyr.length > 0) && this.cx);
                if (Gx.cmode === 1) {
                    Gx.ylabel = m.UNITS[28][0];
                } else if (Gx.cmode === 2) {
                    Gx.ylabel = Gx.plab;
                } else if ((Gx.cmode === 3) && (cx)) {
                    Gx.ylabel = m.UNITS[21][0];
                } else if (Gx.cmode === 4) {
                    Gx.ylabel = m.UNITS[22][0];
                } else if (Gx.cmode === 5) {
                    Gx.ylabel = m.UNITS[22][0];
                } else if (Gx.cmode === 6) {
                    Gx.ylabel = m.UNITS[26][0];
                } else if (Gx.cmode === 7) {
                    Gx.ylabel = m.UNITS[27][0];
                } else {
                    Gx.ylabel = "Intensity";
                }

                if ((m.UNITS[Gx.xlab][0] !== "None") && (m.UNITS[Gx.xlab][0] !== "Unknown")) {
                    Gx.xlabel = m.UNITS[Gx.xlab][0];
                } else {
                    Gx.xlabel = "Frequency";
                }
                Gx.xlabel += "    CURRENTLY IN X_CUT MODE";
                Mx.origin = 1;

                this.xcut_layer = this.plot.overlay_array(x_cut_data, {
                    xstart: this.xstart,
                    xdelta: this.xdelta
                }, {
                    name: "x_cut_data",
                    line: 3
                });

                //do not display any other layers
                var xcut_lyrn = this.plot.get_lyrn(this.xcut_layer);
                for (var i = 0; i < Gx.lyr.length; i++) {
                    if (i !== xcut_lyrn) {
                        Gx.lyr[i].display = !Gx.lyr[i].display;
                    }
                }
                Gx.x_cut_press_on = true;

                // The y-axis is now the z-values
                var mxmn = m.vmxmn(x_cut_data, this.xframe);
                var ymax = mxmn.smax;
                var ymin = mxmn.smin;
                var yran = ymax - ymin;
                if (yran < 0.0) {
                    ymax = ymin;
                    ymin = ymax + yran;
                    yran = -yran;
                }
                if (yran <= 1.0e-20) {
                    ymin = ymin - 1.0;
                    ymax = ymax + 1.0;
                } else {
                    ymin = ymin - 0.02 * yran;
                    ymax = ymax + 0.02 * yran;
                }

                Gx.panymin = mxmn.smin;
                Gx.panymax = mxmn.smax;
                for (var h = 1; h < Mx.level + 1; h++) {
                    Mx.stk[h].ymin = ymin;
                    Mx.stk[h].ymax = ymax;
                    Mx.stk[h].yscl = (Mx.stk[h].ymax - Mx.stk[h].ymin) / (Mx.b - Mx.t);
                }
                this.plot.rescale();

            } else if (Gx.x_cut_press_on) {
                // ypos wasn't provided so turn x-cut off
                Gx.x_cut_press_on = false;
                for (var h = 0; h < Gx.lyr.length; h++) {
                    if (h !== this.xcut_layer) {
                        Gx.lyr[h].display = !Gx.lyr[h].display;
                    }
                    this.plot.deoverlay(this.xcut_layer);

                    // Restore settings
                    Gx.xlabel = this.cut_stash.xlabel;
                    Gx.ylabel = this.cut_stash.ylabel;
                    Mx.level = this.cut_stash.level;
                    Mx.stk = JSON.parse(JSON.stringify(this.cut_stash.stk));
                    Gx.panymin = this.cut_stash.panymin;
                    Gx.panymax = this.cut_stash.panymax;
                    Gx.panxmin = this.cut_stash.panxmin;
                    Gx.panxmax = this.cut_stash.panxmax;
                    this.cut_stash = undefined;


                    this.plot.rescale();
                    this.plot.refresh();
                    this.xcut_layer = undefined;
                    this.plot.change_settings({
                        drawmode: this.old_drawmode,
                        autol: this.old_autol
                    });
                }
            }
        },

        yCutData: function(xpos, zData) {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;
            var height = this.lps;
            var width = this.xframe;
            var i = 0;

            // By default, pipe mode doesn't keep historical data
            // around unless p_cuts has been turned on.
            if (this.hcb.pipe && !Gx.p_cuts) {
                return null;
            }

            var y_cut_data;
            if (this.drawdirection !== "horizontal") {
                y_cut_data = [];
                var col;
                if (!this.hcb.pipe || zData) {
                    col = Math.floor((xpos - this.xstart) / this.xdelta);
                    if (zData) {
                        for (i = col; i < (width * height); i += width) {
                            y_cut_data.push(this.zbuf[i]);
                        }
                    } else {
                        for (i = col; i < (width * height); i += width) {
                            y_cut_data.push(this.buf[i]);
                        }
                    }
                } else {
                    col = Math.floor((width * (Mx.xpos - Mx.l)) / (Mx.r - Mx.l));
                    for (i = col; i < (width * height); i += width) {
                        y_cut_data.push(this.zbuf[i]);
                    }
                }
            } else {
                var row = Math.round((xpos - this.xstart) / this.xdelta);
                if ((row < 0) || (row > this.lps)) {
                    return;
                }
                var start = row * width;
                var finish = start + width;
                if (!this.hcb.pipe || zData) {
                    y_cut_data = this.zbuf.slice(start, finish);
                } else {
                    y_cut_data = this.buf.slice(start, finish);
                }
            }

            return y_cut_data;
        },

        /**
         * Display an yCut
         *
         * @param xpos
         *     the x-position to extract the y-cut, leave undefined to
         *     leave yCut
         */
        yCut: function(xpos) {
            var Mx = this.plot._Mx;
            var Gx = this.plot._Gx;

            //display the y-cut of the raster
            if (xpos !== undefined) {
                // Stash important values
                this.cut_stash = {};
                this.cut_stash.xlabel = Gx.xlabel;
                this.cut_stash.ylabel = Gx.ylabel;
                this.cut_stash.level = Mx.level;
                this.cut_stash.stk = JSON.parse(JSON.stringify(Mx.stk));
                this.cut_stash.ymax = Mx.stk[Mx.level].ymax;
                this.cut_stash.panymin = Gx.panymin;
                this.cut_stash.panymax = Gx.panymax;
                this.cut_stash.panxmin = Gx.panxmin;
                this.cut_stash.panxmax = Gx.panxmax;

                var y_cut_data = this.yCutData(xpos);

                //adjust for the values of the xcut
                this.old_drawmode = this.drawmode;
                this.old_autol = Gx.autol;

                this.plot.change_settings({
                    drawmode: "undefined",
                    autol: -1
                });


                var cx = ((Gx.lyr.length > 0) && this.cx);
                if (Gx.cmode === 1) {
                    Gx.ylabel = m.UNITS[28][0];
                } else if (Gx.cmode === 2) {
                    Gx.ylabel = Gx.plab;
                } else if ((Gx.cmode === 3) && (cx)) {
                    Gx.ylabel = m.UNITS[21][0];
                } else if (Gx.cmode === 4) {
                    Gx.ylabel = m.UNITS[22][0];
                } else if (Gx.cmode === 5) {
                    Gx.ylabel = m.UNITS[22][0];
                } else if (Gx.cmode === 6) {
                    Gx.ylabel = m.UNITS[26][0];
                } else if (Gx.cmode === 7) {
                    Gx.ylabel = m.UNITS[27][0];
                } else {
                    Gx.ylabel = "Intensity";
                }

                if ((m.UNITS[Gx.ylab][0] !== "None") && (m.UNITS[Gx.ylab][0] !== "Unknown")) {
                    Gx.xlabel = m.UNITS[Gx.ylab][0];
                } else {
                    Gx.xlabel = "Time";
                }
                Gx.xlabel += "    CURRENTLY IN Y_CUT MODE";
                Mx.origin = 1;
                this.ycut_layer = this.plot.overlay_array(y_cut_data, {
                    xstart: this.ystart,
                    xdelta: this.ydelta
                }, {
                    name: "y_cut_data",
                    line: 3
                });


                //do not display any other layers
                var ycut_lyrn = this.plot.get_lyrn(this.ycut_layer);
                for (var k = 0; k < Gx.lyr.length; k++) {
                    if (k !== ycut_lyrn) {
                        Gx.lyr[k].display = !Gx.lyr[k].display;
                    }
                }

                Gx.y_cut_press_on = true;

                // The y-axis is now the z-values
                var mxmn = m.vmxmn(y_cut_data, this.lps);
                var ymax = mxmn.smax;
                var ymin = mxmn.smin;
                var yran = ymax - ymin;
                if (yran < 0.0) {
                    ymax = ymin;
                    ymin = ymax + yran;
                    yran = -yran;
                }
                if (yran <= 1.0e-20) {
                    ymin = ymin - 1.0;
                    ymax = ymax + 1.0;
                } else {
                    ymin = ymin - 0.02 * yran;
                    ymax = ymax + 0.02 * yran;
                }

                Gx.panymin = mxmn.smin;
                Gx.panymax = mxmn.smax;
                for (var h = 1; h < Mx.level + 1; h++) {
                    // the x-axis is now the yvalues
                    Mx.stk[h].xmin = Mx.stk[h].ymin;
                    Mx.stk[h].xmax = Mx.stk[h].ymax;
                    Mx.stk[h].xscl = (Mx.stk[h].xmax - Mx.stk[h].xmin) / (Mx.r - Mx.t);

                    // the y-axis is now the zvalues
                    Mx.stk[h].ymin = ymin;
                    Mx.stk[h].ymax = ymax;
                    Mx.stk[h].yscl = (Mx.stk[h].ymax - Mx.stk[h].ymin) / (Mx.b - Mx.t);
                }

                this.plot.rescale();
            } else if (Gx.y_cut_press_on) {
                Gx.y_cut_press_on = false;
                for (var j = 0; j < Gx.lyr.length; j++) {
                    if (j !== this.ycut_layer) {
                        Gx.lyr[j].display = !Gx.lyr[j].display;
                    }
                    this.plot.deoverlay(this.ycut_layer);

                    // Restore settings
                    Gx.xlabel = this.cut_stash.xlabel;
                    Gx.ylabel = this.cut_stash.ylabel;
                    Mx.level = this.cut_stash.level;
                    Mx.stk = JSON.parse(JSON.stringify(this.cut_stash.stk));
                    Gx.panymin = this.cut_stash.panymin;
                    Gx.panymax = this.cut_stash.panymax;
                    Gx.panxmin = this.cut_stash.panxmin;
                    Gx.panxmax = this.cut_stash.panxmax;
                    this.cut_stash = undefined;

                    this.plot.rescale();
                    this.plot.refresh();
                    this.ycut_layer = undefined;
                    this.plot.change_settings({
                        drawmode: this.old_drawmode,
                        autol: this.old_autol
                    });
                }
            }
        },

        draw: function() {
            var Mx = this.plot._Mx;
            var Gx = this.plot._Gx;
            var HCB = this.hcb;

            if (this.hcb.pipe && this.img) {
                var lps;
                if (this.drawdirection !== "horizontal") {
                    lps = this.hcb.lps || Math.ceil(Math.max(1, (Mx.b - Mx.t)));
                } else {
                    //lps = this.hcb.lps || Math.ceil(Math.max(1, (Mx.r - Mx.l)));
                    lps = this.lps;
                }
                if ((lps !== this.lps) && this.buf) {
                    var lps_delta = (lps - this.lps);
                    this.lps = lps;
                    if (this.position >= this.lps) { // if lps got resized make sure we don't go out of bounds
                        this.position = 0;
                    }

                    if (this.drawmode === "scrolling") {
                        // in scrolling mode, ymin should never change
                        if (this.drawdirection !== "horizontal") {
                            var d = HCB.ystart + (HCB.ydelta * this.lps);
                            this.ymin = Math.min(HCB.ystart, d);
                            this.ymax = Math.max(HCB.ystart, d);
                            this.img = mx.resize_image_height(Mx, this.img, this.lps);
                        }
                    } else if (this.drawmode === "falling") {
                        this.ymax = this.ymin + (HCB.ydelta * this.lps);
                        this.img = mx.resize_image_height(Mx, this.img, this.lps);
                    } else if (this.drawmode === "rising") {
                        this.ymin = this.ymax - (HCB.ydelta * this.lps);
                        // the img needs to be shifted
                        if (lps_delta > 0) {
                            this.img = mx.resize_image_height(Mx, this.img, this.lps);
                            mx.shift_image_rows(Mx, this.img, lps_delta, true);
                        } else {
                            mx.shift_image_rows(Mx, this.img, lps_delta, true);
                            this.img = mx.resize_image_height(Mx, this.img, this.lps);
                        }
                    }


                    // reset the image since we now have more lines to render
                    // TODO - can we preserve the image data rather than resetting?
                    this.plot.rescale();
                }
            }

            var xmin = Math.max(this.xmin, Mx.stk[Mx.level].xmin);
            var xmax = Math.min(this.xmax, Mx.stk[Mx.level].xmax);
            if (xmin >= xmax) { // no data but do scaling
                Gx.panxmin = Math.min(Gx.panxmin, this.xmin);
                Gx.panxmax = Math.max(Gx.panxmax, this.xmax);
                return;
            }
            var ymin = Math.max(this.ymin, Mx.stk[Mx.level].ymin);
            var ymax = Math.min(this.ymax, Mx.stk[Mx.level].ymax);

            var w = Math.abs(xmax - xmin) + 1;
            var h = Math.abs(ymax - ymin) + 1;

            w = Math.floor(w / HCB.xdelta);
            h = Math.floor(h / HCB.ydelta);

            w = Math.min(w, HCB.subsize);
            h = Math.min(h, HCB.size);

            var ul = mx.real_to_pixel(Mx, xmin, ymin);
            var lr = mx.real_to_pixel(Mx, xmax, ymax);

            var iw = lr.x - ul.x;
            var ih = lr.y - ul.y;

            var rx = iw / w;
            var ry = ih / h;

            Gx.xe = Math.max(1, Math.round(rx));
            Gx.ye = Math.max(1, Math.round(ry));

            // we might need to prep in certian situations
            if ((!this.img) || (!this.buf) || (Gx.cmode !== this.img.cmode) || (Mx.origin !== this.img.origin)) {
                this.prep(xmin, xmax);
            }

            // if there is an image, render it
            if (this.img) {
                mx.draw_image(Mx, this.img, this.xmin, this.ymin, this.xmax, this.ymax, this.opacity, Gx.rasterSmoothing, this.downscale);
            }

            // render the scrolling pipe line
            if (this.position !== null && this.drawmode === "scrolling") {
                var pnt;
                if (this.drawdirection !== "horizontal") {
                    pnt = mx.real_to_pixel(Mx, 0, this.position * this.ydelta);
                    if ((pnt.y > Mx.t) && (pnt.y < Mx.b)) {
                        mx.draw_line(Mx, "white", Mx.l, pnt.y, Mx.r, pnt.y);
                    }
                } else {
                    pnt = mx.real_to_pixel(Mx, this.position * this.xdelta, 0);
                    if ((pnt.x > Mx.l) && (pnt.x < Mx.r)) {
                        mx.draw_line(Mx, "white", pnt.x, Mx.t, pnt.x, Mx.b);
                    }
                }
            }
        }
    };

    /**
     * Factory to overlay the given file onto the given plot.
     *
     * @private
     */
    Layer2D.overlay = function(plot, hcb, layerOptions) {
        var Gx = plot._Gx;
        var Mx = plot._Mx;

        hcb.buf_type = "D";
        if (!hcb.ystart) {
            hcb.ystart = 0.0;
        }
        if (!hcb.ydelta) {
            hcb.ydelta = 1.0;
        }

        var layer = new Layer2D(plot);
        layer.init(hcb);

        if (hcb.file_name) {
            layer.name = m.trim_name(hcb.file_name);
        } else {
            layer.name = "layer_" + Gx.lyr.length;
        }

        layer.change_settings(layerOptions);

        for (var layerOption in layerOptions) {
            if (layer[layerOption] !== undefined) {
                layer[layerOption] = layerOptions[layerOption];
            }
        }

        var layers = [];
        if (plot.add_layer(layer)) {
            layers.push(layer);
        }

        return layers;
    };

    module.exports = Layer2D;

}());
