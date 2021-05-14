/**
 * @license
 * File: sigplot.layer2dSDS.js
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

(function () {
    const m = require("./m");
    const mx = require("./mx");
    const common = require("./common");

    const decimationModeLookup = {
        1: 1,
        2: 2,
        4: 3,
        8: 4,
        16: 5,
        32: 6,
        64: 7,
        128: 8,
        256: 9,
        512: 10,
    };

    const decimationPossibilities = [512, 256, 128, 64, 32, 16, 8, 4, 2, 1];

    /**
     * @constructor
     * @param plot
     */
    const LayerSDS = function (plot) {
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

        this.preferred_origin = 4; // TODO Raster is normally 4
        this.opacity = 1;
        this.xcompression = plot._Gx.xcompression; // default is Gx.xcompression

        // LPB is kinda odd right now, since we read the entire file into memory anyways...
        // given that often we are loading from an HREF so there is no downside to this...
        // however, we keep LPB around (for now) so that the scaling behaves identical to
        // the original code
        this.lpb = undefined;

        this.yc = 1; // y-compression factor...not yet used

        this.options = {};
        this.pendingURLs = {};
    };

    LayerSDS.prototype = {
        /**
         * Initializes the layer to display the provided data.
         *
         * @param hcb
         *            {BlueHeader} an opened BlueHeader file
         * @param lyrn
         *          the index of the added layer
         *
         * @memberOf LayerSDS
         * @private
         */
        init: function (hcb) {
            //De-Bounce this function
            this.debounceSend = common.debounce(
                function (oReq) {
                    oReq.send(null);
                },
                100,
                false
            );

            // Get Header Params from URL
            this.hcb = hcb;
            this.hcb.buf_type = "D";

            if (hcb.file_type === 1000) {
                this.lps = this.hcb.lps || Math.ceil(hcb.size / hcb.subsize);
            } else {
                this.lps = this.hcb.lps || Math.ceil(hcb.size);
            }

            this.hcb.class = 2;
            const LRU = require("lru-cache");

            this.cache = new LRU(500);

            this.init_axes();
        },

        init_axes: function () {
            const Gx = this.plot._Gx;

            if (Gx.index) {
                this.xstart = 1.0;
                this.xdelta = 1.0;
                this.xmin = 1.0;

                this.ystart = 1.0;
                this.ydelta = 1.0;
                this.ymin = 1.0;
                if (this.hcb.file_type === 1000) {
                    this.ymax = this.hcb.size / this.hcb.subsize;
                } else {
                    if (this.drawdirection !== "horizontal") {
                        this.xmax = this.hcb.subsize;
                        this.ymax = this.size;
                    } else {
                        this.xmax = this.size;
                        this.ymax = this.hcb.subsize;
                    }
                }
            } else {
                let d;
                if (this.drawdirection !== "horizontal") {
                    this.xstart = this.hcb.xstart;
                    this.xdelta = this.hcb.xdelta;
                    d = this.hcb.xstart + this.hcb.xdelta * this.hcb.subsize;
                    this.xmin = this.hcb.xmin || Math.min(this.hcb.xstart, d);
                    this.xmax = this.hcb.xmax || Math.max(this.hcb.xstart, d);
                    this.ystart = this.hcb.ystart;
                    this.ydelta = this.hcb.ydelta;
                    d = this.hcb.ystart + this.hcb.ydelta * this.lps;
                    this.ymin = this.hcb.ymin || Math.min(this.hcb.ystart, d);
                    this.ymax = this.hcb.ymax || Math.max(this.hcb.ystart, d);
                } else {
                    this.ystart = this.hcb.xstart;
                    this.ydelta = this.hcb.xdelta;
                    d = this.hcb.xstart + this.hcb.xdelta * this.hcb.subsize;
                    this.ymin = this.hcb.xmin || Math.min(this.hcb.xstart, d);
                    this.ymax = this.hcb.xmax || Math.max(this.hcb.xstart, d);
                    this.xstart = this.hcb.ystart;
                    this.xdelta = this.hcb.ydelta;
                    d = this.hcb.ystart + this.hcb.ydelta * this.lps;
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
            if (!this.lpb || this.lpb <= 0) {
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

            if (this.drawdirection === "horizontal") {
                this.plot._Mx.origin = 1;
                this.preferred_origin = 1;
            } else {
                this.plot._Mx.origin = 4;
                this.preferred_origin = 4;
            }
        },

        get_data: function () {},

        /**
         * Provisional API
         *
         * @private
         * @param x
         * @param y
         */
        get_z: function (x, y) {},

        change_settings: function (settings) {
            const Gx = this.plot._Gx;
            if (settings.subsize) {
                this.hcb.subsize = settings.subsize;
                this.hcb.ape = settings.subsize;
                if (this.hcb.file_type === 1000) {
                    this.lps = Math.ceil(this.hcb.size / this.hcb.subsize);
                } else {
                    this.lps = Math.ceil(this.hcb.size);
                }
                let d = this.hcb.xstart + this.hcb.xdelta * this.hcb.subsize;
                this.xmin = this.hcb.xmin || Math.min(this.hcb.xstart, d);
                this.xmax = this.hcb.xmax || Math.max(this.hcb.xstart, d);

                d = this.hcb.ystart + this.hcb.ydelta * this.lps;
                this.ymin = this.hcb.ymin || Math.min(this.hcb.ystart, d);
                this.ymax = this.hcb.ymax || Math.max(this.hcb.ystart, d);
            }
            if (settings.debug) {
                this.debug = settings.debug;
            }

            if (settings.cmode !== undefined) {
                this.img = undefined;
                if ((Gx.autoz & 1) !== 0) {
                    Gx.zmin = undefined;
                }
                if ((Gx.autoz & 2) !== 0) {
                    Gx.zmax = undefined;
                }
            }

            if (settings.drawdirection !== undefined) {
                this.drawdirection = settings.drawdirection;
            }

            if (settings.origin !== undefined) {
                this.plot._Mx.origin = settings.origin;
                this.preferred_origin = settings.origin;
            }

            if (this.drawdirection === "horizontal") {
                this.plot._Mx.origin = 1;
                this.preferred_origin = 1;
                this.init_axes();
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
            if (settings.usetiles !== undefined) {
                this.usetiles = settings.usetiles;
            }
        },

        reload: function (data, hdrmod) {},

        prep: function (xmin, xmax) {
            return this.lps;
        },

        get_pan_bounds: function (view) {
            let xmin, xmax, ymin, ymax;
            if (this.xmin < this.xmax) {
                xmin = this.xmin;
                xmax = this.xmax;
            }
            if (this.ymin < this.ymax) {
                ymin = this.ymin;
                ymax = this.ymax;
            }

            return {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
            };
        },

        load_tile: function (url, oReq, oEvent) {
            if (oReq.readyState === 4) {
                if (oReq.status === 200 || oReq.status === 0) {
                    // status = 0 is necessary for file URL

                    let arrayBuffer = null;
                    if (oReq.response) {
                        arrayBuffer = oReq.response;
                    }

                    const xmin = parseFloat(oReq.getResponseHeader("Xmin"));
                    const xmax = parseFloat(oReq.getResponseHeader("Xmax"));
                    const ymin = parseFloat(oReq.getResponseHeader("Ymin"));
                    const ymax = parseFloat(oReq.getResponseHeader("Ymax"));
                    arrayBuffer.width = oReq.getResponseHeader("Outxsize");
                    arrayBuffer.height = oReq.getResponseHeader("Outysize");
                    arrayBuffer.contents = "rgba";
                    arrayBuffer.xmin = xmin;
                    arrayBuffer.ymin = ymin;
                    arrayBuffer.xmax = xmax;
                    arrayBuffer.ymax = ymax;
                    this.cache.set(url, arrayBuffer); // store the data in the cache

                    delete this.pendingURLs[url]; // Remove this url as pending
                    this.plot.refresh(); // refresh the plot will cause this tile to be drawn
                }
            }
        },

        /**
         * Build SDS Tile API URL
         *
         * @param {number} tileXsize
         * @param {number} tileYsize
         * @param {number} decx
         * @param {number} decy
         * @param {number} tileX
         * @param {number} tileY
         * @returns {string}
         */
        make_tile_request_url: function (
            tileXsize,
            tileYsize,
            decx,
            decy,
            tileX,
            tileY
        ) {
            const Gx = this.plot._Gx;
            const cxm = ["Ma", "Ph", "Re", "Im", "IR", "Lo", "L2"];
            const xcmp = ["first", "mean", "min", "max", "first", "absmax"];

            const urlsplit = this.hcb.url.split("/sds/hdr/");
            let url =
                urlsplit[0] +
                "/sds/rdstile/" +
                tileXsize +
                "/" +
                tileYsize +
                "/" +
                decx +
                "/" +
                decy +
                "/" +
                tileX +
                "/" +
                tileY +
                "/" +
                urlsplit[1] +
                "?outfmt=RGBA" +
                "&colormap=" +
                m.Mc.colormap[Gx.cmap].name +
                "&subsize=" +
                this.hcb.subsize;

            if (Gx.zmin !== undefined) {
                url = url + "&zmin=" + Gx.zmin;
            }
            if (Gx.zmax !== undefined) {
                url = url + "&zmax=" + Gx.zmax;
            }

            if (Gx.cmode !== undefined) {
                url = url + "&cxmode=" + cxm[Gx.cmode - 1];
            }

            if (this.xcompression !== undefined) {
                url = url + "&transform=" + xcmp[this.xcompression];
            }
            return url;
        },

        /**
         * Performs the HTTP GET to Sigplot Data Service
         * for the requested tile
         *
         * @param url
         */
        sendTileRequest: function (url) {
            if (this.pendingURLs[url]) {
                return;
            }

            const oReq = new XMLHttpRequest();
            this.pendingURLs[url] = oReq;

            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";
            oReq.overrideMimeType("text/plain; charset=x-user-defined");

            const that = this;
            oReq.onload = function (oEvent) {
                // `this` will be oReq within this context
                that.load_tile(url, this, oEvent);
            };
            oReq.onerror = function (oEvent) {};
            oReq.send(null);
            // this.debounceSend(oReq);
        },

        draw: function () {
            const Mx = this.plot._Mx;
            const Gx = this.plot._Gx;
            const HCB = this.hcb;

            let horizontal_min, horizontal_max, vertical_min, vertical_max;
            if (this.drawdirection !== "horizontal") {
                horizontal_min = Math.max(this.xmin, Mx.stk[Mx.level].xmin);
                horizontal_max = Math.min(this.xmax, Mx.stk[Mx.level].xmax);
                if (horizontal_min >= horizontal_max) {
                    // no data
                    return;
                }
                vertical_min = Math.max(this.ymin, Mx.stk[Mx.level].ymin);
                vertical_max = Math.min(this.ymax, Mx.stk[Mx.level].ymax);
            } else {
                horizontal_min = Math.max(this.ymin, Mx.stk[Mx.level].ymin);
                horizontal_max = Math.min(this.ymax, Mx.stk[Mx.level].ymax);
                if (horizontal_min >= horizontal_max) {
                    // no data
                    return;
                }
                vertical_min = Math.max(this.xmin, Mx.stk[Mx.level].xmin);
                vertical_max = Math.min(this.xmax, Mx.stk[Mx.level].xmax);
            }

            let w, h;
            if (this.drawmode !== "horizontal") {
                w = Math.abs(horizontal_max - horizontal_min);
                h = Math.abs(vertical_max - vertical_min);
            } else {
                w = Math.abs(vertical_max - vertical_min);
                h = Math.abs(horizontal_max - horizontal_min);
            }

            // Convert w/h to elements
            w = Math.ceil(w / HCB.xdelta);
            h = Math.ceil(h / HCB.ydelta);

            // Make sure w/h remain within limits
            w = Math.min(w, HCB.subsize);
            if (HCB.file_type === 1000) {
                h = Math.min(h, HCB.size / HCB.subsize);
            } else {
                h = Math.min(h, HCB.size);
            }

            // figure out the upper-left and lower-right pixel coordinates
            let ul, lr, out_x_pixel_size, out_y_pixel_size;
            if (this.drawdirection !== "horizontal") {
                ul = mx.real_to_pixel(Mx, horizontal_min, vertical_min);
                lr = mx.real_to_pixel(Mx, horizontal_max, vertical_max);

                // Figure out the pixel width and height
                out_x_pixel_size = Math.abs(lr.x - ul.x);
                out_y_pixel_size = Math.abs(lr.y - ul.y);
            } else {
                lr = mx.real_to_pixel(Mx, vertical_min, horizontal_min);
                ul = mx.real_to_pixel(Mx, vertical_max, horizontal_max);

                // Figure out the pixel width and height
                out_y_pixel_size = Math.abs(lr.x - ul.x);
                out_x_pixel_size = Math.abs(lr.y - ul.y);
            }

            // Index values of horizontal_max, horizontal_min, vertical_max, vertical_min
            const x1 = Math.floor((horizontal_min - HCB.xstart) / HCB.xdelta);
            const y1 = Math.floor((vertical_min - HCB.ystart) / HCB.ydelta);

            const x2 = x1 + w;
            const y2 = y1 + h;

            const rotationAngle =
                this.drawdirection === "horizontal" ? -Math.PI / 2 : null;
            if (this.usetiles) {
                const maxtileXsize = Math.min(
                    Math.max(Math.ceil(out_x_pixel_size / 300) * 100, 100),
                    500
                );
                const maxtileYsize = Math.min(
                    Math.max(Math.ceil(out_y_pixel_size / 300) * 100, 100),
                    500
                );
                const requestedDecx = Math.max(1, w / out_x_pixel_size);
                const requestedDecy = Math.max(1, h / out_y_pixel_size);
                let i = 0;
                while (decimationPossibilities[i] > requestedDecx) {
                    i++;
                }
                const decfactorx = decimationPossibilities[i];
                i = 0;
                while (decimationPossibilities[i] > requestedDecy) {
                    i++;
                }
                const decfactory = decimationPossibilities[i];

                const decx = decimationModeLookup[decfactorx];
                const decy = decimationModeLookup[decfactory];

                const tilexsize = maxtileXsize * decfactorx;
                const tileysize = maxtileYsize * decfactory;

                const firstcolumn = Math.floor(x1 / tilexsize);
                const firstrow = Math.floor(y1 / tileysize);
                const lastcolumn = Math.ceil(x2 / tilexsize);
                const lastrow = Math.ceil(y2 / tileysize);

                for (let tileY = firstrow; tileY < lastrow; tileY++) {
                    for (let tileX = firstcolumn; tileX < lastcolumn; tileX++) {
                        const url = this.make_tile_request_url(
                            maxtileXsize,
                            maxtileYsize,
                            decx,
                            decy,
                            tileX,
                            tileY
                        );
                        const img = this.cache.get(url);
                        if (img) {
                            //Get the data from this tile out of the cache and plot it.
                            let strokeStyle, text;
                            if (this.debug) {
                                strokeStyle = Mx.fg;
                                text =
                                    tileX.toString() + "," + tileY.toString();
                            }
                            if (this.drawdirection !== "horizontal") {
                                mx.draw_image(
                                    Mx,
                                    img,
                                    img.xmin, // horizontal_min
                                    img.ymin, // vertical_min
                                    img.xmax, // horizontal_max
                                    img.ymax, // vertical_max
                                    1.0,
                                    false,
                                    true,
                                    rotationAngle,
                                    strokeStyle,
                                    text
                                );
                            } else {
                                mx.draw_image(
                                    Mx,
                                    img,
                                    img.ymin, // horizontal_min
                                    img.xmin, // vertical_min
                                    img.ymax, // horizontal_max
                                    img.xmax, // vertical_max
                                    1.0,
                                    false,
                                    true,
                                    rotationAngle,
                                    strokeStyle,
                                    text
                                );
                            }
                        } else {
                            // Don't already have the data for this tile to request it from the server.
                            this.sendTileRequest(url);
                        }
                    }
                }
            } else {
                const oReq = new XMLHttpRequest();
                const [sds_host, filepath] = this.hcb.url.split("/sds/hdr/");

                const base_url = `${sds_host}/sds`;
                const url_params = `rds/${x1}/${y1}/${x2}/${y2}/${out_x_pixel_size}/${out_y_pixel_size}/${filepath}`;

                let query_string = `?outfmt=RGBA&colormap=${
                    m.Mc.colormap[Gx.cmap].name
                }&subsize=${HCB.subsize}`;
                if (Gx.zmin !== undefined) {
                    query_string = `${query_string}&zmin=${Gx.zmin}`;
                }
                if (Gx.zmax !== undefined) {
                    query_string = `${query_string}&zmax=${Gx.zmax}`;
                }

                if (Gx.cmode !== undefined) {
                    const cxm = ["Ma", "Ph", "Re", "Im", "IR", "Lo", "L2"];
                    query_string = `${query_string}&cxmode=${
                        cxm[Gx.cmode - 1]
                    }`;
                }

                if (this.xcompression !== undefined) {
                    const xcmp = [
                        "first",
                        "mean",
                        "min",
                        "max",
                        "first",
                        "absmax",
                    ];
                    query_string = `${query_string}&transform=${
                        xcmp[this.xcompression]
                    }`;
                }

                const url = `${base_url}/${url_params}${query_string}`;
                const img = this.cache.get(url);
                if (img) {
                    if (this.drawdirection !== "horizontal") {
                        mx.draw_image(
                            Mx,
                            img,
                            horizontal_min, // xmin
                            vertical_min, // ymin
                            horizontal_max, // xmax
                            vertical_max, // ymax
                            1.0,
                            false,
                            true,
                            rotationAngle
                        );
                    } else {
                        mx.draw_image(
                            Mx,
                            img,
                            vertical_min, // xmin
                            horizontal_min, // ymin
                            vertical_max, // xmax
                            horizontal_max, // ymax
                            1.0,
                            false,
                            true,
                            rotationAngle
                        );
                    }
                } else {
                    oReq.open("GET", url, true);
                    oReq.responseType = "arraybuffer";
                    oReq.overrideMimeType("text/plain; charset=x-user-defined");

                    const that = this;
                    oReq.onload = function (oEvent) {
                        if (oReq.readyState === 4) {
                            if (oReq.status === 200 || oReq.status === 0) {
                                // status = 0 is necessary for file URL
                                const zmin = oReq.getResponseHeader("Zmin");
                                const zmax = oReq.getResponseHeader("Zmax");

                                if (Mx.level === 0 && Gx.zmin === undefined) {
                                    if ((Gx.autoz & 1) !== 0) {
                                        Gx.zmin = zmin;
                                    }
                                }
                                if (Mx.level === 0 && Gx.zmax === undefined) {
                                    if ((Gx.autoz & 2) !== 0) {
                                        Gx.zmax = zmax;
                                    }
                                }
                                let arrayBuffer = null; // Note: not oReq.responseText
                                if (oReq.response) {
                                    arrayBuffer = oReq.response;
                                }

                                //let imgd = new Uint8ClampedArray(arrayBuffer);
                                arrayBuffer.width = out_x_pixel_size;
                                arrayBuffer.height = out_y_pixel_size;
                                arrayBuffer.contents = "rgba";
                                that.cache.set(url, arrayBuffer);
                                if (that.drawdirection !== "horizontal") {
                                    mx.draw_image(
                                        Mx,
                                        arrayBuffer,
                                        horizontal_min, // xmin
                                        vertical_min, // ymin
                                        horizontal_max, // xmax
                                        vertical_max, // ymax
                                        1.0,
                                        false,
                                        true,
                                        rotationAngle
                                    );
                                } else {
                                    mx.draw_image(
                                        Mx,
                                        arrayBuffer,
                                        vertical_min, // xmin
                                        horizontal_min, // ymin
                                        vertical_max, // xmax
                                        horizontal_max, // ymax
                                        1.0,
                                        false,
                                        true,
                                        rotationAngle
                                    );
                                }
                            }
                        }
                    };
                    oReq.onerror = function (oEvent) {};

                    this.debounceSend(oReq);
                }
            }
            return {
                xmin: this.xmin,
                xmax: this.xmax,
                ymin: this.ymin,
                ymax: this.ymax,
            };
        },

        /**
         * Display an xCut for a given Y (axis) value
         *
         * @param {number?} ypos  the y-position to extract the x-cut, leave undefined to
         *                       leave xCut
         */
        xCut: function (ypos) {
            const Mx = this.plot._Mx;
            const Gx = this.plot._Gx;

            //display the x-cut of the raster
            if (ypos !== undefined) {
                // Stash important values
                this.cut_stash = {};
                this.cut_stash.ylabel = Gx.ylabel;
                this.cut_stash.xlabel = Gx.xlabel;
                this.cut_stash.level = Mx.level;
                this.cut_stash.stk = JSON.parse(JSON.stringify(Mx.stk));

                const row = Math.round((ypos - this.ystart) / this.ydelta);
                if (row < 0 || row > this.lps) {
                    return;
                }

                //Adjust the zoom stack to adjust y values to be undefined.
                for (let stk_num = 0; stk_num < Mx.stk.length; stk_num++) {
                    Mx.stk[stk_num].ymin = undefined;
                    Mx.stk[stk_num].ymax = undefined;
                }
                Gx.panymax = undefined;
                Gx.panymin = undefined;

                let name, mode;
                if (this.drawdirection !== "horizontal") {
                    name = "x_cut_data";
                    mode = "xcut";
                } else {
                    name = "y_cut_data";
                    mode = "ycut";
                }
                this.xcut_layer = this.plot.overlay_href(
                    this.hcb.url,
                    null,
                    {
                        name: name,
                        layerType: "1DSDS",
                        mode: mode,
                        xypos_index: row,
                        bottom_level: Mx.level,
                    },
                    {}
                );
                Mx.origin = 1;

                //do not display any other layers
                const xcut_lyrn = this.plot.get_lyrn(this.xcut_layer);
                for (let i = 0; i < Gx.lyr.length; i++) {
                    if (i !== xcut_lyrn) {
                        Gx.lyr[i].display = !Gx.lyr[i].display;
                    }
                }
                Gx.x_cut_press_on = true;
            } else if (Gx.x_cut_press_on) {
                // ypos wasn't provided so turn x-cut off
                Gx.x_cut_press_on = false;
                const xcut_lyrn = this.plot.get_lyrn(this.xcut_layer);
                for (let h = 0; h < Gx.lyr.length; h++) {
                    if (h !== xcut_lyrn) {
                        Gx.lyr[h].display = !Gx.lyr[h].display;
                    }
                    this.plot.deoverlay(this.xcut_layer);

                    // Restore settings
                    Gx.xlabel = this.cut_stash.xlabel;
                    Gx.ylabel = this.cut_stash.ylabel;
                    Mx.level = this.cut_stash.level;
                    Mx.stk = JSON.parse(JSON.stringify(this.cut_stash.stk));
                    this.cut_stash = undefined;
                    Mx.origin = 4;

                    this.plot.rescale();
                    this.plot.refresh();
                    this.xcut_layer = undefined;
                    this.plot.change_settings({
                        drawmode: this.old_drawmode,
                        autol: this.old_autol,
                    });
                }
            }
        },

        /**
         * Display an yCut for a given X (axis) value
         *
         * @param {number?} xpos  the x-position to extract the y-cut, leave undefined to
         *                        leave yCut
         */
        yCut: function (xpos) {
            const Mx = this.plot._Mx;
            const Gx = this.plot._Gx;

            //display the y-cut of the raster
            if (xpos !== undefined) {
                // Stash important values
                this.cut_stash = {
                    xlabel: Gx.xlabel,
                    ylabel: Gx.ylabel,
                    level: Mx.level,
                    stk: JSON.parse(JSON.stringify(Mx.stk)),
                    ymax: Mx.stk[Mx.level].ymax,
                    panymin: Gx.panymin,
                    panymax: Gx.panymax,
                    panxmin: Gx.panxmin,
                    panxmax: Gx.panxmax,
                };

                const column = Math.round((xpos - this.xstart) / this.xdelta);
                if (column < 0) {
                    //TODO - Check if column is out or max range.
                    return;
                }

                //Adjust the zoom stack to move y vales to x and adjust y values to be undefined.
                for (let stk_num = 0; stk_num < Mx.stk.length; stk_num++) {
                    Mx.stk[stk_num].xmin = Mx.stk[stk_num].ymin;
                    Mx.stk[stk_num].xmax = Mx.stk[stk_num].ymax;
                    Mx.stk[stk_num].xscl = Mx.stk[stk_num].yscl;
                    Mx.stk[stk_num].ymin = undefined;
                    Mx.stk[stk_num].ymax = undefined;
                    Mx.stk[stk_num].yscl = undefined;
                }
                Gx.panxmax = Gx.panymax;
                Gx.panxmin = Gx.panymin;
                Gx.panymax = undefined;
                Gx.panymin = undefined;

                let name, mode;
                if (this.drawdirection !== "horizontal") {
                    name = "y_cut_data";
                    mode = "ycut";
                } else {
                    name = "x_cut_data";
                    mode = "xcut";
                }
                this.ycut_layer = this.plot.overlay_href(
                    this.hcb.url,
                    null,
                    {
                        name: name,
                        layerType: "1DSDS",
                        mode: mode,
                        xypos_index: column,
                        bottom_level: Mx.level,
                    },
                    {}
                );
                Mx.origin = 1;

                //do not display any other layers
                const ycut_lyrn = this.plot.get_lyrn(this.ycut_layer);
                for (let k = 0; k < Gx.lyr.length; k++) {
                    if (k !== ycut_lyrn) {
                        Gx.lyr[k].display = !Gx.lyr[k].display;
                    }
                }

                Gx.y_cut_press_on = true;
            } else if (Gx.y_cut_press_on) {
                Gx.y_cut_press_on = false;
                for (let j = 0; j < Gx.lyr.length; j++) {
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
                    Mx.origin = 4;
                    this.plot.rescale();
                    this.plot.refresh();
                    this.ycut_layer = undefined;
                    this.plot.change_settings({
                        drawmode: this.old_drawmode,
                        autol: this.old_autol,
                    });
                }
            }
        },
    };

    /**
     * Factory to overlay the given file onto the given plot.
     *
     * @param {Plot} plot   SigPlot plot object
     * @param {BlueHeader} hcb  Header object from bluefile/matfile
     * @param {object?} layerOptions  Options specific to this layer
     * @returns {array}   Array of Layers
     *
     * @private
     */
    LayerSDS.overlay = function (plot, hcb, layerOptions) {
        const Gx = plot._Gx;
        hcb.buf_type = "D";

        const layer = new LayerSDS(plot);
        layer.init(hcb);

        if (hcb.file_name) {
            layer.name = m.trim_name(hcb.file_name);
        } else {
            layer.name = "layer_" + Gx.lyr.length;
        }

        layer.change_settings(layerOptions);

        const layers = [];
        if (plot.add_layer(layer)) {
            layers.push(layer);
        }

        return layers;
    };

    module.exports = LayerSDS;
})();
