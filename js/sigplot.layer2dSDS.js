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
    var m = require("./m");
    var mx = require("./mx");
    var common = require("./common");

    var decimationModeLookup = {
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

    var decimationPossibilities = [512, 256, 128, 64, 32, 16, 8, 4, 2, 1];

    /**
     * @constructor
     * @param plot
     */
    var LayerSDS = function (plot) {
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

            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;

            // Get Header Params from URL

            this.hcb = hcb;
            this.hcb.buf_type = "D";

            if (hcb.file_type === 1000) {
                this.lps = this.hcb.lps || Math.ceil(hcb.size / hcb.subsize);
            } else {
                this.lps = this.hcb.lps || Math.ceil(hcb.size);
            }

            this.hcb.class = 2;
            var LRU = require("lru");

            this.cache = new LRU(500);

            if (Gx.index) {
                this.xstart = 1.0;
                this.xdelta = 1.0;
                this.xmin = 1.0;
                this.xmax = hcb.subsize;
                this.ystart = 1.0;
                this.ydelta = 1.0;
                this.ymin = 1.0;
                if (hcb.file_type === 1000) {
                    this.ymax = hcb.size / hcb.subsize;
                } else {
                    this.ymax = hcb.size;
                }
            } else {
                this.xstart = hcb.xstart;
                this.xdelta = hcb.xdelta;
                var d = hcb.xstart + hcb.xdelta * hcb.subsize;
                this.xmin = this.hcb.xmin || Math.min(hcb.xstart, d);
                this.xmax = this.hcb.xmax || Math.max(hcb.xstart, d);
                this.ystart = hcb.ystart;
                this.ydelta = hcb.ydelta;
                var d = hcb.ystart + hcb.ydelta * this.lps;
                this.ymin = this.hcb.ymin || Math.min(hcb.ystart, d);
                this.ymax = this.hcb.ymax || Math.max(hcb.ystart, d);
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
            var Gx = this.plot._Gx;
            if (settings.subsize) {
                this.hcb.subsize = settings.subsize;
                this.hcb.ape = settings.subsize;
                if (this.hcb.file_type === 1000) {
                    this.lps = Math.ceil(this.hcb.size / this.hcb.subsize);
                } else {
                    this.lps = Math.ceil(this.hcb.size);
                }
                var d = this.hcb.xstart + this.hcb.xdelta * this.hcb.subsize;
                this.xmin = this.hcb.xmin || Math.min(this.hcb.xstart, d);
                this.xmax = this.hcb.xmax || Math.max(this.hcb.xstart, d);

                var d = this.hcb.ystart + this.hcb.ydelta * this.lps;
                this.ymin = this.hcb.ymin || Math.min(this.hcb.ystart, d);
                this.ymax = this.hcb.ymax || Math.max(this.hcb.ystart, d);
            }
            if (settings.debugCanvas) {
                this.debugCanvas = settings.debugCanvas;
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
            var xmin, xmax, ymin, ymax;
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
            var arrayBuffer;
            var Mx = this.plot._Mx;
            var Gx = this.plot._Gx;
            if (oReq.readyState === 4) {
                if (oReq.status === 200 || oReq.status === 0) {
                    // status = 0 is necessary for file URL

                    arrayBuffer = null;
                    if (oReq.response) {
                        arrayBuffer = oReq.response;
                    }

                    var xmin = parseFloat(oReq.getResponseHeader("Xmin"));
                    var xmax = parseFloat(oReq.getResponseHeader("Xmax"));
                    var ymin = parseFloat(oReq.getResponseHeader("Ymin"));
                    var ymax = parseFloat(oReq.getResponseHeader("Ymax"));
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

        make_tile_request_url: function (
            tileXsize,
            tileYsize,
            decx,
            decy,
            tileX,
            tileY
        ) {
            var Gx = this.plot._Gx;
            var url;
            var cxm = ["Ma", "Ph", "Re", "Im", "IR", "Lo", "L2"];
            var xcmp = ["first", "mean", "min", "max", "first", "absmax"];

            var urlsplit = this.hcb.url.split("/sds/hdr/");
            url =
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

        sendTileRequest: function (url) {
            var Mx = this.plot._Mx;

            if (this.pendingURLs[url]) {
                return;
            }

            var oReq = new XMLHttpRequest();
            this.pendingURLs[url] = oReq;

            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";
            oReq.overrideMimeType("text/plain; charset=x-user-defined");

            var that = this;
            oReq.onload = function (oEvent) {
                // `this` will be oReq within this context
                that.load_tile(url, this, oEvent);
            };
            oReq.onerror = function (oEvent) {};
            oReq.send(null);
            // this.debounceSend(oReq);
        },

        draw: function () {
            var Mx = this.plot._Mx;
            var Gx = this.plot._Gx;
            var HCB = this.hcb;

            var xmin = Math.max(this.xmin, Mx.stk[Mx.level].xmin);
            var xmax = Math.min(this.xmax, Mx.stk[Mx.level].xmax);
            if (xmin >= xmax) {
                // no data
                return;
            }
            var ymin = Math.max(this.ymin, Mx.stk[Mx.level].ymin);
            var ymax = Math.min(this.ymax, Mx.stk[Mx.level].ymax);

            // Figure out width/height based on the real-world coordinates
            //var w = Math.abs(xmax - xmin) + 1;
            //var h = Math.abs(ymax - ymin) + 1;

            var w = Math.abs(xmax - xmin);
            var h = Math.abs(ymax - ymin);

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
            var ul = mx.real_to_pixel(Mx, xmin, ymin);
            var lr = mx.real_to_pixel(Mx, xmax, ymax);

            // Figure out the pixel width and height
            var iw = Math.abs(lr.x - ul.x);
            var ih = Math.abs(lr.y - ul.y);

            // Determine the pixel to real unit ratio
            var rx = iw / w;
            var ry = ih / h;

            // TODO
            Gx.xe = Math.max(1, Math.round(rx));
            Gx.ye = Math.max(1, Math.round(ry));

            // Index values of xmax,xmin, ymax,ymin
            var x1 = Math.floor((xmin - HCB.xstart) / HCB.xdelta);
            var y1 = Math.floor((ymin - HCB.ystart) / HCB.ydelta);
            var x2 = x1 + w;
            var y2 = y1 + h;

            if (this.usetiles) {
                //var maxtileXsize = 200;
                //var  maxtileYsize = 200;
                var maxtileXsize = Math.min(
                    Math.max(Math.ceil(iw / 300) * 100, 100),
                    500
                );
                var maxtileYsize = Math.min(
                    Math.max(Math.ceil(ih / 300) * 100, 100),
                    500
                );

                //var tileXsize = maxtilesize;
                //var tileYsize = maxtilesize;

                //var requestedDecx = Math.max(1,(w/iw)*1.2);  //Allow for upscaling the number of pixels needed by 20% otherwise request the next zoom level
                // var requestedDecy = Math.max(1,(h/ih)*1.2);
                var requestedDecx = Math.max(1, w / iw);
                var requestedDecy = Math.max(1, h / ih);
                var i = 0;
                while (decimationPossibilities[i] > requestedDecx) {
                    i++;
                }
                var decfactorx = decimationPossibilities[i];
                i = 0;
                while (decimationPossibilities[i] > requestedDecy) {
                    i++;
                }
                var decfactory = decimationPossibilities[i];

                var decx = decimationModeLookup[decfactorx];
                var decy = decimationModeLookup[decfactory];

                var tilexsize = maxtileXsize * decfactorx;
                var tileysize = maxtileYsize * decfactory;

                var firstcolumn = Math.floor(x1 / tilexsize);
                var fistrow = Math.floor(y1 / tileysize);
                var lastcolumn = Math.ceil(x2 / tilexsize);
                var lastrow = Math.ceil(y2 / tileysize);

                //var numtilesx = Math.ceil(w/decfactorx/maxtilesize);
                //var numtilesy = Math.ceil(h/decfactory/maxtilesize);
                // var xsize = xmax-xmin;
                // var ysize = ymax-ymin;
                // var xsizeperfulltile = xsize*(maxtilesize/w);
                // var ysizeperfulltile = ysize*(maxtilesize/h);

                for (var tileY = fistrow; tileY < lastrow; tileY++) {
                    for (var tileX = firstcolumn; tileX < lastcolumn; tileX++) {
                        var url = this.make_tile_request_url(
                            maxtileXsize,
                            maxtileYsize,
                            decx,
                            decy,
                            tileX,
                            tileY
                        );

                        var img = this.cache.get(url);
                        if (img) {
                            //Get the data from this tile out of the cache and plot it.
                            mx.draw_image(
                                Mx,
                                img,
                                img.xmin, // xmin
                                img.ymin, // ymin
                                img.xmax, // xmax
                                img.ymax, // ymax
                                1.0,
                                false,
                                true
                            );
                            //return;
                        } else {
                            // Don't already have the data for this tile to request it from the server.
                            this.sendTileRequest(url);
                        }
                    }
                }
            } else {
                var oReq = new XMLHttpRequest();

                var urlsplit = this.hcb.url.split("/sds/hdr/");
                var url =
                    urlsplit[0] +
                    "/sds/rds/" +
                    x1 +
                    "/" +
                    y1 +
                    "/" +
                    x2 +
                    "/" +
                    y2 +
                    "/" +
                    iw +
                    "/" +
                    ih +
                    "/" +
                    urlsplit[1] +
                    "?outfmt=RGBA" +
                    "&colormap=" +
                    m.Mc.colormap[Gx.cmap].name +
                    "&subsize=" +
                    HCB.subsize;

                if (Gx.zmin !== undefined) {
                    url = url + "&zmin=" + Gx.zmin;
                }
                if (Gx.zmax !== undefined) {
                    url = url + "&zmax=" + Gx.zmax;
                }

                if (Gx.cmode !== undefined) {
                    var cxm = ["Ma", "Ph", "Re", "Im", "IR", "Lo", "L2"];
                    url = url + "&cxmode=" + cxm[Gx.cmode - 1];
                }

                if (this.xcompression !== undefined) {
                    var xcmp = [
                        "first",
                        "mean",
                        "min",
                        "max",
                        "first",
                        "absmax",
                    ];
                    url = url + "&transform=" + xcmp[this.xcompression];
                }

                var img = this.cache.get(url);
                if (img) {
                    mx.draw_image(
                        Mx,
                        img,
                        xmin, // xmin
                        ymin, // ymin
                        xmax, // xmax
                        ymax, // ymax
                        1.0,
                        false,
                        true
                    );
                } else {
                    oReq.open("GET", url, true);
                    oReq.responseType = "arraybuffer";
                    oReq.overrideMimeType("text/plain; charset=x-user-defined");

                    var that = this;
                    oReq.onload = function (oEvent) {
                        if (oReq.readyState === 4) {
                            if (oReq.status === 200 || oReq.status === 0) {
                                // status = 0 is necessary for file URL
                                var zmin = oReq.getResponseHeader("Zmin");
                                var zmax = oReq.getResponseHeader("Zmax");

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
                                var arrayBuffer = null; // Note: not oReq.responseText
                                if (oReq.response) {
                                    arrayBuffer = oReq.response;
                                }

                                //let imgd = new Uint8ClampedArray(arrayBuffer);
                                arrayBuffer.width = iw;
                                arrayBuffer.height = ih;
                                arrayBuffer.contents = "rgba";
                                that.cache.set(url, arrayBuffer);
                                mx.draw_image(
                                    Mx,
                                    arrayBuffer,
                                    xmin, // xmin
                                    ymin, // ymin
                                    xmax, // xmax
                                    ymax, // ymax
                                    1.0,
                                    false,
                                    true
                                );

                                return;
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
         * Display an xCut
         *
         * @param ypos
         *     the y-position to extract the x-cut, leave undefined to
         *     leave xCut
         */
        xCut: function (ypos) {
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

                var row = Math.round((ypos - this.ystart) / this.ydelta);
                if (row < 0 || row > this.lps) {
                    return;
                }

                //Adjust the zoom stack to adjust y values to be undefined.
                for (var stk_num = 0; stk_num < Mx.stk.length; stk_num++) {
                    Mx.stk[stk_num].ymin = undefined;
                    Mx.stk[stk_num].ymax = undefined;
                }
                Gx.panymax = undefined;
                Gx.panymin = undefined;

                this.xcut_layer = this.plot.overlay_href(
                    this.hcb.url,
                    null,
                    {
                        name: "x_cut_data",
                        layerType: "1DSDS",
                        mode: "xcut",
                        xypos_index: row,
                        bottom_level: Mx.level,
                    },
                    {}
                );
                Mx.origin = 1;

                //do not display any other layers
                var xcut_lyrn = this.plot.get_lyrn(this.xcut_layer);
                for (var i = 0; i < Gx.lyr.length; i++) {
                    if (i !== xcut_lyrn) {
                        Gx.lyr[i].display = !Gx.lyr[i].display;
                    }
                }
                Gx.x_cut_press_on = true;
            } else if (Gx.x_cut_press_on) {
                // ypos wasn't provided so turn x-cut off
                Gx.x_cut_press_on = false;
                var xcut_lyrn = this.plot.get_lyrn(this.xcut_layer);
                for (var h = 0; h < Gx.lyr.length; h++) {
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
         * Display an yCut
         *
         * @param xpos
         *     the x-position to extract the y-cut, leave undefined to
         *     leave yCut
         */
        yCut: function (xpos) {
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

                var column = Math.round((xpos - this.xstart) / this.xdelta);
                if (column < 0) {
                    //TODO - Check if column is out or max range.
                    return;
                }

                //Adjust the zoom stack to move y vales to x and adjust y values to be undefined.
                for (var stk_num = 0; stk_num < Mx.stk.length; stk_num++) {
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

                this.ycut_layer = this.plot.overlay_href(
                    this.hcb.url,
                    null,
                    {
                        name: "y_cut_data",
                        layerType: "1DSDS",
                        mode: "ycut",
                        xypos_index: column,
                        bottom_level: Mx.level,
                    },
                    {}
                );
                Mx.origin = 1;

                //do not display any other layers
                var ycut_lyrn = this.plot.get_lyrn(this.ycut_layer);
                for (var k = 0; k < Gx.lyr.length; k++) {
                    if (k !== ycut_lyrn) {
                        Gx.lyr[k].display = !Gx.lyr[k].display;
                    }
                }

                Gx.y_cut_press_on = true;
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
     * @private
     */
    LayerSDS.overlay = function (plot, hcb, layerOptions) {
        var Gx = plot._Gx;
        var Mx = plot._Mx;

        hcb.buf_type = "D";

        var layer = new LayerSDS(plot);
        layer.init(hcb);

        if (hcb.file_name) {
            layer.name = m.trim_name(hcb.file_name);
        } else {
            layer.name = "layer_" + Gx.lyr.length;
        }

        layer.change_settings(layerOptions);

        var layers = [];
        if (plot.add_layer(layer)) {
            layers.push(layer);
        }

        return layers;
    };

    module.exports = LayerSDS;
})();
