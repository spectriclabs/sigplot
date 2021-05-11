/**
 * @license
 * File: sigplot.layer1d.js
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
 * under the License.
 */

/* global module */
/* global require */

(function () {
    var m = require("./m");
    var mx = require("./mx");
    var common = require("./common");
    var LRU = require("lru");

    /**
     * @constructor
     * @param plot
     */

    var Layer1DSDS = function (plot) {
        this.plot = plot;
        this.options = {};
        this.size = 0;
        this.color = 0;
        this.line = 3;
        this.thick = 1;
        this.opacity = 1.0;
        this.fillStyle = null;
        this.symbol = 0;
        this.radius = 3;
        this.display = true;
        this.xptr = null;
        this.yptr = null;
        this.xpoint = null; // PointArray backed by memory in xptr
        this.ypoint = null; // PointArray backed by memory in yptr
        this.server_data = null;
        this.ymax = -1;
        this.ymin = 0;
        this.localpanymin = 0;
        this.localpanymax = -1;
        this.xmax = -1;
        this.xmin = 0;
        this.localpanxmin = 0;
        this.localpanxmax = -1;
        this.xlab = 0;
        this.ylab = 0;
        this.mode = "lds";
        this.xypos_index = 0;
        this.y_value_change = false;
        this.pendingurl = "";
    };

    Layer1DSDS.prototype = {
        /**
         * Initializes the layer to display the provided data.
         *
         * @param hcb
         *            {BlueHeader} an opened BlueHeader file
         * @param lyrn
         *          the index of the added layer
         *
         * @memberOf Layer1D
         * @private
         */
        init: function (hcb, options) {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;

            this.hcb = hcb;
            this.hcb.buf_type = "I";

            if (hcb["file_type"] === 2000) {
                m.force1000(hcb);
                this.size = hcb.subsize;
            } else {
                this.size = hcb.size;
            }
            if (this.mode === "lds" || this.mode === "xcut") {
                this.xmin = this.hcb.xstart;
                this.xmax = this.hcb.xstart + this.hcb.xdelta * this.size; //If size is subsize for 2000 files then this logic should work.
            } else if (this.mode === "ycut") {
                // In y cut mode this 1D plot will have its x axis be the y axis of the original 2D file.
                this.xmin = this.hcb.ystart;
                if (hcb["file_type"] === 2000) {
                    this.xmax =
                        this.hcb.ystart + this.hcb.ydelta * this.hcb.size;
                } else {
                    this.xmax =
                        this.hcb.ystart +
                        this.hcb.ydelta * (this.hcb.size / this.hcb.subsize);
                }
            }
            this.set_pan_values();

            this.cache = new LRU(20);

            //De-Bounce this function
            this.debounceSend = common.debounce(
                function (oReq) {
                    oReq.send(null);
                },
                100,
                false
            );
        },

        get_data: function () {},

        change_settings: function (settings) {
            var Gx = this.plot._Gx;
            if (settings.cmode !== undefined) {
                // If setting a new cmode then reset y values.

                if ((Gx.autoz & 1) !== 0) {
                    this.ymin = 0;
                    this.localpanymin = 0;
                }
                if ((Gx.autoz & 2) !== 0) {
                    this.ymax = -1;
                    this.localpanymax = -1;
                }
            }
        },

        reload: function (data, hdrmod) {},

        push: function (data, hdrmod, sync) {},

        set_pan_values() {
            if (this.localpanxmin > this.localpanxmax) {
                this.localpanxmin = this.xmin;
                this.localpanxmax = this.xmax;
            } else {
                this.localpanxmin = Math.min(this.localpanxmin, this.xmin);
                this.localpanxmax = Math.max(this.localpanxmax, this.xmax);
            }

            if (this.localpanymin > this.localpanymax) {
                this.localpanymin = this.ymin;
                this.localpanymax = this.ymax;
            } else {
                this.localpanymin = Math.min(this.localpanymin, this.ymin);
                this.localpanymax = Math.max(this.localpanymax, this.ymax);
            }
        },

        prep: function (xmin, xmax) {},

        make_request_url: function (x1, y1, x2, y2, zmin, zmax) {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;
            var url;

            var urlsplit = this.hcb.url.split("/sds/hdr/");
            var url = "";

            if (this.mode === "lds") {
                url =
                    urlsplit[0] +
                    "/sds/lds/" +
                    x1 +
                    "/" +
                    x2 +
                    "/" +
                    Math.round(Mx.r - Mx.l) +
                    "/" +
                    Math.round(Mx.b - Mx.t) +
                    "/" +
                    urlsplit[1];
            } else if (this.mode === "xcut") {
                url =
                    urlsplit[0] +
                    "/sds/rdsxcut/" +
                    x1 +
                    "/" +
                    this.xypos_index +
                    "/" +
                    x2 +
                    "/" +
                    Math.round(this.xypos_index + 1) +
                    "/" +
                    Math.round(Mx.r - Mx.l) +
                    "/" +
                    Math.round(Mx.b - Mx.t) +
                    "/" +
                    urlsplit[1];
            } else if (this.mode === "ycut") {
                url =
                    urlsplit[0] +
                    "/sds/rdsycut/" +
                    this.xypos_index +
                    "/" +
                    y1 +
                    "/" +
                    Math.round(this.xypos_index + 1) +
                    "/" +
                    y2 +
                    "/" +
                    Math.round(Mx.r - Mx.l) +
                    "/" +
                    Math.round(Mx.b - Mx.t) +
                    "/" +
                    urlsplit[1];
            }

            if (zmin !== undefined) {
                if (url.includes("?")) {
                    url = url + "&zmin=" + zmin;
                } else {
                    url = url + "?zmin=" + zmin;
                }
            }
            if (zmax !== undefined) {
                if (url.includes("?")) {
                    url = url + "&zmax=" + zmax;
                } else {
                    url = url + "?zmax=" + zmax;
                }
            }

            if (Gx.cmode !== undefined) {
                var cxm = ["Ma", "Ph", "Re", "Im", "IR", "Lo", "L2"];
                if (url.includes("?")) {
                    url = url + "&cxmode=" + cxm[Gx.cmode - 1];
                } else {
                    url = url + "?cxmode=" + cxm[Gx.cmode - 1];
                }
            }
            return url;
        },

        send_request_to_server: function (url) {
            if (this.pendingurl === url) {
                return;
            }
            var oReq;
            oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";
            oReq.overrideMimeType("text/plain; charset=x-user-defined");

            var that = this;
            oReq.onload = function (oEvent) {
                // `this` will be oReq within this context
                that.load_data_from_server(url, this, oEvent);
            };
            oReq.onerror = function (oEvent) {};
            this.debounceSend(oReq);
            this.pendingurl = url;
        },

        load_data_from_server: function (url, oReq, oEvent) {
            var Mx = this.plot._Mx;

            if (oReq.readyState === 4) {
                if (oReq.status === 200 || oReq.status === 0) {
                    // status = 0 is necessary for file URL
                    var Mx = this.plot._Mx;
                    var Gx = this.plot._Gx;
                    var arrayBuffer = null; // Note: not oReq.responseText
                    if (oReq.response) {
                        arrayBuffer = oReq.response;
                    }

                    this.server_data = new Int16Array(arrayBuffer);

                    var ymin = parseFloat(oReq.getResponseHeader("Zmin"));
                    var ymax = parseFloat(oReq.getResponseHeader("Zmax"));
                    this.ymin = ymin;
                    this.ymax = ymax;
                    this.set_pan_values();

                    //cache the data for later
                    arrayBuffer.zmin = this.ymin;
                    arrayBuffer.zmax = this.ymax;
                    this.cache.set(url, arrayBuffer);
                    this.plot.refresh();
                }
            }
        },

        process_plot_data: function () {
            var Gx = this.plot._Gx;
            var Mx = this.plot._Mx;

            var numPixels = this.server_data.length / 2;
            this.xptr = new ArrayBuffer(numPixels * 2);
            this.yptr = new ArrayBuffer(numPixels * 2);
            this.xpoint = new Int16Array(this.xptr);
            this.ypoint = new Int16Array(this.yptr);

            // lds service returns int16 pixels with a list of all x values followed by all y values.
            m.vmov(this.server_data, 1, this.xpoint, 1, numPixels);
            m.vmov(
                this.server_data.subarray(numPixels),
                1,
                this.ypoint,
                1,
                numPixels
            );

            var traceoptions = {};

            if (this.fillStyle) {
                traceoptions.fillStyle = this.fillStyle;
            } else if (Gx.fillStyle) {
                traceoptions.fillStyle = Gx.fillStyle;
            }
            if (this.options) {
                traceoptions.highlight = this.options.highlight;
                traceoptions.noclip = this.options.noclip;
            }
            var line = 0;
            if (this.line === 0) {
                line = 0;
            } else {
                line = 1;
                if (this.thick > 0) {
                    line = this.thick;
                } else if (this.thick < 0) {
                    line = Math.abs(this.thick);
                    traceoptions.dashed = true;
                }
                if (this.line === 1) {
                    traceoptions.vertsym = true;
                }
                if (this.line === 2) {
                    traceoptions.horzsym = true;
                }
                if (this.line === 4) {
                    traceoptions.horzsym = true;
                    traceoptions.vertsym = true;
                }
            }
            traceoptions.pixels = true;
            mx.trace(
                Mx,
                this.color,
                this.xpoint,
                this.ypoint,
                this.xpoint.length,
                0,
                1,
                line,
                this.symbol,
                this.radius,
                traceoptions
            );
        },

        get_pan_bounds: function (view) {
            var cacheData = this.get_data_from_cache();
            if (cacheData.plotData) {
                this.ymin = cacheData.plotData.zmin;
                this.ymax = cacheData.plotData.zmax;
                this.set_pan_values();
            }
            var xmin, xmax, ymin, ymax;
            if (this.localpanxmin < this.localpanxmax) {
                xmin = this.localpanxmin;
                xmax = this.localpanxmax;
            }
            if (this.localpanymin < this.localpanymax) {
                ymin = this.localpanymin;
                ymax = this.localpanymax;
            }

            return {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
            };
        },

        get_data_from_cache() {
            var Mx = this.plot._Mx;

            var x1 = Math.round(
                (Mx.stk[Mx.level].xmin - this.xmin) / this.hcb.xdelta
            );
            var x2 = Math.round(
                (Mx.stk[Mx.level].xmax - this.xmin) / this.hcb.xdelta
            );
            // y1 and y2 are only used for y cut mode, where the y of the original file has been moved to x
            var y1 = Math.round(
                (Mx.stk[Mx.level].xmin - this.xmin) / this.hcb.ydelta
            );
            var y2 = Math.round(
                (Mx.stk[Mx.level].xmax - this.xmin) / this.hcb.ydelta
            );
            var ymin;
            var ymax;
            if (Mx.stk[Mx.level].ymin < Mx.stk[Mx.level].ymax) {
                ymin = Mx.stk[Mx.level].ymin;
                ymax = Mx.stk[Mx.level].ymax;
            }
            var url;
            url = this.make_request_url(x1, y1, x2, y2, ymin, ymax);
            var plotData = this.cache.get(url);
            if (!plotData) {
                // The ymin/ymax are optional parameters, so another url might already be cached with the same data
                var urlb = this.make_request_url(
                    x1,
                    y1,
                    x2,
                    y2,
                    undefined,
                    undefined
                );
                var plotData = this.cache.get(urlb);
                if (plotData) {
                    if (plotData.zmin !== ymin || plotData.zmax !== ymax) {
                        //If the y limits don't match then don't use this data.
                        plotData = undefined;
                    }
                }
            }
            return {
                url: url,
                plotData: plotData,
            };
        },

        draw: function () {
            var cacheData = this.get_data_from_cache();

            if (cacheData.plotData) {
                this.server_data = new Int16Array(cacheData.plotData);

                this.ymin = cacheData.plotData.zmin;
                this.ymax = cacheData.plotData.zmax;
                this.set_pan_values();
                this.process_plot_data();
                return {
                    xmin: this.xmin,
                    xmax: this.xmax,
                    ymin: this.ymin,
                    ymax: this.ymax,
                };
            } else {
                // We don't already have this data so we need to ask for it.
                this.send_request_to_server(cacheData.url);
            }
        },
    };

    /**
     * Color positions for the various layers
     *
     * These magic numbers were conjured up by a wizard somewhere.
     *
     * @memberOf sigplot
     * @private
     */
    var mixc = [0, 53, 27, 80, 13, 40, 67, 93, 7, 60, 33, 87, 20, 47, 73, 100];

    /**
     * Factory to overlay the given file onto the given plot.
     *
     * @private
     */
    Layer1DSDS.overlay = function (plot, hcb, layerOptions) {
        var Gx = plot._Gx;
        var Mx = plot._Mx;

        // If doing xy cut mode not sure if this will caused an unwanted effect.
        if (hcb["class"] === 2) {
            m.force1000(hcb);
        }
        hcb.buf_type = "I";

        // Extract the layer_name before enter the loop
        var layer_name_override = layerOptions["name"];
        delete layerOptions["name"];

        var layers = [];
        // This is logic from within sigplot.for LOAD_FILES
        var layer = new Layer1DSDS(plot);

        // Provide a default color for the layer
        var n = Gx.lyr.length % mixc.length;
        layer.color = mx.getcolor(Mx, m.Mc.colormap[3].colors, mixc[n]);

        // Provide the layer name

        if (layer_name_override !== undefined) {
            layer.name = layer_name_override;
        } else if (hcb.file_name) {
            layer.name = m.trim_name(hcb.file_name);
        } else {
            layer.name = "layer_" + Gx.lyr.length;
        }
        layer.offset = 0;

        for (var layerOption in layerOptions) {
            if (layer[layerOption] !== undefined) {
                layer[layerOption] = layerOptions[layerOption];
            }
        }

        layer.init(hcb, layerOptions);

        if (plot.add_layer(layer)) {
            layers.push(layer);
        }

        return layers;
    };

    module.exports = Layer1DSDS;
})();
