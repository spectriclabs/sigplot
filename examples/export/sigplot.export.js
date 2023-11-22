/**
 * @license
 * File: sigplot.slider.js
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

class ExportPlugin {
    constructor(options) {
        this.options = {
            name: "Export",
        };

        sigplot.common.update(this.options, options);

        this.name = this.options.name;
    }

    init(plot) {
        this.plot = plot;
        var Mx = plot._Mx;
    }

    menu() {
        var _raw_csv_handler = (function(self) {
            return function() {
                var Gx = self.plot._Gx;
                if (Gx.HCB.length > 0) {
                    // Only export the first layer
                    // TODO support exporting multiple layers, similar to how
                    // the traces menu works
                    // TODO confirm that the hcb isn't a pipe
                    var hcb = Gx.HCB_UUID[Gx.HCB[0]];
                    if (!hcb.dview) {
                        return;
                    }
                    var contents = "";
                    for (var ii=0; ii<hcb.dview.length; ++ii) {
                        contents = hcb.dview.join(",");
                    }

                    var mime_type = "text/csv";
                    var blob = new Blob([contents], {type: mime_type});

                    var link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    link.download = "SigPlot." + (new Date()).getTime() + ".csv";
                    link.display = "none";
                    link.onclick = function(e) {
                        // revokeObjectURL needs a delay to work properly
                        var that = this;
                        setTimeout(function() {
                            window.URL.revokeObjectURL(that.href);
                        }, 1500);
                    };
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };
        }(this));

        return {
            text: this.name + "...",
            menu: {
                title: "Format",
                items: [{
                    text: "Raw CSV",
                    handler: _raw_csv_handler
                }]
            }
        };
    }

    refresh(canvas) {
        
    }

    dispose() {
        this.plot = undefined;
    }
}
