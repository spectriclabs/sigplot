/**
 * @license
 * File: m.ts
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

import * as sigfile from "sigfile";
import loglevel from "loglevel";
import type { BlueHeader, Mc as McType, MinMaxResult, NumericArray, TypedArray, UnitEntry } from "./types";

var bluefile = sigfile.bluefile;

/**
 * At runtime, hcb.dview is actually a TypedArray (Float32Array, Float64Array, etc.)
 * set by bluefile.BlueHeader.setData(), not a DataView despite the interface declaration.
 * This helper retrieves it with the correct runtime type.
 */
function getDview(hcb: BlueHeader): TypedArray | undefined {
    return hcb.dview as TypedArray | undefined;
}

interface TouchLike {
    pageX: number;
    pageY: number;
}

interface VectorConfig {
    MV: string;
    MS: string;
    nbpt: number;
    view: undefined;
}

function m() {}

m.log = loglevel;

/**
 * @private
 */
var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false;
if (iOS || typeof Float64Array === "undefined" || (Float64Array as any).emulated || !Float64Array.BYTES_PER_ELEMENT) {
    m.PointArray = Float32Array as any;
} else {
    m.PointArray = Float64Array as any;
}

/** UNITS Structure
 * @global
 */
var UNITS: Record<number, UnitEntry> = {
    0: ["None", "U", true, true],
    1: ["Time", "sec", true, true],
    2: ["Delay", "sec", true, false],
    3: ["Frequency", "Hz", true, true],
    4: ["Time code format", "", true, false],
    5: ["Distance", "m", true, true],
    6: ["Speed", "m/s", true, true],
    7: ["Acceleration", "m/sec^2", true, true],
    8: ["Jerk", "m/sec^3", true, true],
    9: ["Doppler", "Hz", true, false],
    10: ["Doppler rate", "Hz/sec", true, true],
    11: ["Energy", "J", true, true],
    12: ["Power", "W", true, true],
    13: ["Mass", "g", true, true],
    14: ["Volume", "l", true, true],
    15: ["Angular power density", "W/ster", true, true],
    16: ["Integrated power density", "W/rad", true, true],
    17: ["Spatial power density", "W/m^2", true, true],
    18: ["Integrated power density", "W/m", false, true],
    19: ["Spectral power density", "W/MHz", true, true],
    20: ["Amplitude", "U", true, false],
    21: ["Real", "U", true, false],
    22: ["Imaginary", "U", true, false],
    23: ["Phase", "rad", true, true],
    24: ["Phase", "deg", false, true],
    25: ["Phase", "cycles", false, true],
    26: ["10*Log", "U", true, false],
    27: ["20*Log", "U", true, false],
    28: ["Magnitude", "U", true, false],
    29: ["Unknown", "U", true, false],
    30: ["Unknown", "U", false, false],
    31: ["General dimensionless", "", true, true],
    32: ["Counts", "", true, false],
    33: ["Angle", "rad", true, false],
    34: ["Angle", "deg", false, false],
    35: ["Relative power", "dB", true, true],
    36: ["Relative power", "dBm", false, true],
    37: ["Relative power", "dBW", false, true],
    38: ["Solid angle", "ster", true, true],
    40: ["Distance", "ft", false, true],
    41: ["Distance", "nmi", false, true],
    42: ["Speed", "ft/sec", false, true],
    43: ["Speed", "nmi/sec", false, true],
    44: ["Speed", "knots=nmi/hr", false, true],
    45: ["Acceleration", "ft/sec^2", false, true],
    46: ["Acceleration", "nmi/sec^2", false, true],
    47: ["Acceleration", "knots/sec", false, true],
    48: ["Acceleration", "G", false, true],
    49: ["Jerk", "G/sec", false, true],
    50: ["Rotation", "rps", true, false],
    51: ["Rotation", "rpm", false, false],
    52: ["Angular velocity", "rad/sec", true, true],
    53: ["Angular velocity", "deg/sec", false, true],
    54: ["Angular acceleration", "rad/sec^2", true, true],
    55: ["Angular acceleration", "deg/sec^2", false, true],
    60: ["Latitude", "deg", true, false],
    61: ["Longitude", "deg", true, false],
    62: ["Altitude", "ft", true, false],
    63: ["Altitude", "m", false, false]
};

m.UNITS = UNITS;

/** Common structure
 * @private
 */
m.Mc = {
    colormap: [
        {
            name: "Greyscale",
            colors: [
                {
                    pos: 0,
                    red: 0,
                    green: 0,
                    blue: 0
                },
                {
                    pos: 60,
                    red: 50,
                    green: 50,
                    blue: 50
                },
                {
                    pos: 100,
                    red: 100,
                    green: 100,
                    blue: 100
                },
                {
                    pos: 100,
                    red: 0,
                    green: 0,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 0,
                    green: 0,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 0,
                    green: 0,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 0,
                    green: 0,
                    blue: 0
                }
            ]
        },
        {
            name: "Ramp Colormap",
            colors: [
                {
                    pos: 0,
                    red: 0,
                    green: 0,
                    blue: 15
                },
                {
                    pos: 10,
                    red: 0,
                    green: 0,
                    blue: 50
                },
                {
                    pos: 31,
                    red: 0,
                    green: 65,
                    blue: 75
                },
                {
                    pos: 50,
                    red: 0,
                    green: 85,
                    blue: 0
                },
                {
                    pos: 70,
                    red: 75,
                    green: 80,
                    blue: 0
                },
                {
                    pos: 83,
                    red: 100,
                    green: 60,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 100,
                    green: 0,
                    blue: 0
                }
            ]
        },
        {
            name: "Color Wheel",
            colors: [
                {
                    pos: 0,
                    red: 100,
                    green: 100,
                    blue: 0
                },
                {
                    pos: 20,
                    red: 0,
                    green: 80,
                    blue: 40
                },
                {
                    pos: 30,
                    red: 0,
                    green: 100,
                    blue: 100
                },
                {
                    pos: 50,
                    red: 10,
                    green: 10,
                    blue: 0
                },
                {
                    pos: 65,
                    red: 100,
                    green: 0,
                    blue: 0
                },
                {
                    pos: 88,
                    red: 100,
                    green: 40,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 100,
                    green: 100,
                    blue: 0
                }
            ]
        },
        {
            name: "Spectrum",
            colors: [
                {
                    pos: 0,
                    red: 0,
                    green: 75,
                    blue: 0
                },
                {
                    pos: 22,
                    red: 0,
                    green: 90,
                    blue: 90
                },
                {
                    pos: 37,
                    red: 0,
                    green: 0,
                    blue: 85
                },
                {
                    pos: 49,
                    red: 90,
                    green: 0,
                    blue: 85
                },
                {
                    pos: 68,
                    red: 90,
                    green: 0,
                    blue: 0
                },
                {
                    pos: 80,
                    red: 90,
                    green: 90,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 95,
                    green: 95,
                    blue: 95
                }
            ]
        },
        {
            name: "calewhite",
            colors: [
                {
                    pos: 0,
                    red: 100,
                    green: 100,
                    blue: 100
                },
                {
                    pos: 16.666,
                    red: 0,
                    green: 0,
                    blue: 100
                },
                {
                    pos: 33.333,
                    red: 0,
                    green: 100,
                    blue: 100
                },
                {
                    pos: 50,
                    red: 0,
                    green: 100,
                    blue: 0
                },
                {
                    pos: 66.666,
                    red: 100,
                    green: 100,
                    blue: 0
                },
                {
                    pos: 83.333,
                    red: 100,
                    green: 0,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 100,
                    green: 0,
                    blue: 100
                }
            ]
        },
        {
            name: "HotDesat",
            colors: [
                {
                    pos: 0,
                    red: 27.84,
                    green: 27.84,
                    blue: 85.88
                },
                {
                    pos: 14.2857,
                    red: 0,
                    green: 0,
                    blue: 35.69
                },
                {
                    pos: 28.571,
                    red: 0,
                    green: 100,
                    blue: 100
                },
                {
                    pos: 42.857,
                    red: 0,
                    green: 49.8,
                    blue: 0
                },
                {
                    pos: 57.14286,
                    red: 100,
                    green: 100,
                    blue: 0
                },
                {
                    pos: 71.42857,
                    red: 100,
                    green: 37.65,
                    blue: 0
                },
                {
                    pos: 85.7143,
                    red: 41.96,
                    green: 0,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 87.84,
                    green: 29.8,
                    blue: 29.8
                }
            ]
        },
        {
            name: "Sunset",
            colors: [
                {
                    pos: 0,
                    red: 10,
                    green: 0,
                    blue: 23
                },
                {
                    pos: 18,
                    red: 34,
                    green: 0,
                    blue: 60
                },
                {
                    pos: 36,
                    red: 58,
                    green: 20,
                    blue: 47
                },
                {
                    pos: 55,
                    red: 74,
                    green: 20,
                    blue: 28
                },
                {
                    pos: 72,
                    red: 90,
                    green: 43,
                    blue: 0
                },
                {
                    pos: 87,
                    red: 100,
                    green: 72,
                    blue: 0
                },
                {
                    pos: 100,
                    red: 100,
                    green: 100,
                    blue: 76
                }
            ]
        },
        {
            name: "Hot",
            colors: [
                "#000000",
                "#7f0000",
                "#b30000",
                "#d7301f",
                "#ef6548",
                "#fc8d59",
                "#fdbb84",
                "#fdd49e",
                "#fee8c8",
                "#fff7ec",
                "#ffffff"
            ]
        },
        {
            name: "Cold",
            colors: [
                "#000000",
                "#023858",
                "#045a8d",
                "#0570b0",
                "#3690c0",
                "#74a9cf",
                "#a6bddb",
                "#d0d1e6",
                "#ece7f2",
                "#fff7fb",
                "#ffffff"
            ]
        },
        {
            name: "Purple",
            colors: [
                "#230022",
                "#4d004b",
                "#810f7c",
                "#88419d",
                "#8c6bb1",
                "#8c96c6",
                "#9ebcda",
                "#bfd3e6",
                "#e0ecf4",
                "#f7fcfd"
            ]
        },
        {
            name: "BuGn",
            colors: ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"]
        },
        {
            name: "YlOrBr",
            colors: ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]
        },
        {
            name: "YlGnBu",
            colors: ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]
        },
        {
            name: "YlOrRd",
            colors: [
                "#000000",
                "#662506",
                "#993404",
                "#cc4c02",
                "#ec7014",
                "#fe9929",
                "#fec44f",
                "#fee391",
                "#fff7bc",
                "#ffffe5",
                "#ffffff"
            ]
        },
        {
            name: "GreyNRed",
            colors: [
                "#67001f",
                "#b2182b",
                "#d6604d",
                "#f4a582",
                "#fddbc7",
                "#ffffff",
                "#e0e0e0",
                "#bababa",
                "#878787",
                "#4d4d4d",
                "#1a1a1a"
            ].reverse()
        }
    ]
};

/** Pipe Size
 * @private
 */
m.PIPESIZE = 1024 * 1024;

/**
 * Converts unit strings to number code
 */
m.unit_lookup = function (unitInput: string | number): number | string {
    for (var i = 0; i < 64; i++) {
        var u: UnitEntry;
        if (UNITS[i] === undefined) {
            u = UNITS[0];
        } else {
            u = UNITS[i];
        }
        var first = u[0];
        var second = u[1];
        var comparer1 = u[0] + " " + u[1];
        var comparer2 = u[0] + "_" + u[1];
        if (unitInput === first) {
            if (u[2]) {
                return i;
            }
        } else if (unitInput === second) {
            if (u[3]) {
                return i;
            }
        } else if (unitInput === comparer1 || unitInput === comparer2) {
            return i;
        }
    }
    return unitInput;
};

/**
 * Creates new file with header initialized to type-1000 defaults
 * and data appended.
 */
m.initialize = function (
    data: ArrayBuffer | NumericArray,
    overrides?: Record<string, any>,
    cleanup?: () => void
): BlueHeader {
    var hcb: BlueHeader = new bluefile.BlueHeader(null);

    hcb.version = "BLUE";
    hcb.size = 0;
    hcb.type = 1000;
    hcb.format! = "SF";
    hcb.timecode = 0.0;
    hcb.xstart = 0.0;
    hcb.xdelta = 1.0;
    hcb.xunits = 0;
    hcb.subsize! = 1;
    hcb.ystart = 0.0;
    hcb.ydelta = 1.0;
    hcb.yunits = 0;
    hcb.enabled_streaming_pcut = false;

    hcb.cleanup = cleanup;

    if (!overrides) {
        overrides = {};
    }

    for (var field in overrides) {
        hcb[field] = overrides[field];
    }

    hcb["xunits"] = m.unit_lookup(hcb["xunits"]) as number;
    hcb["yunits"] = m.unit_lookup(hcb["yunits"]) as number;

    if (hcb["subsize"] > 1) {
        hcb.type = 2000;
    } else if (Array.isArray(data) && (Array.isArray(data[0]) || ArrayBuffer.isView(data[0]))) {
        hcb.type = 2000;
        hcb.subsize! = (data[0] as any).length;
        hcb.size = data.length;
    }
    hcb["class"] = hcb.type / 1000;
    if (hcb["class"] === 2 && hcb["subsize"] === undefined) {
        throw "subsize must be provided with type 2000 files";
    }

    if (!overrides.pipe) {
        (hcb as any).setData(data);
    } else {
        hcb.pipe = true;
        hcb.in_byte! = 0;
        hcb.out_byte = 0;
        var pipesize = overrides.pipesize || m.PIPESIZE;

        hcb.buf! = new ArrayBuffer(pipesize);
        (hcb as any).setData(hcb.buf!);
        hcb.data_free! = getDview(hcb)!.length;
    }

    return hcb;
};

/**
 * Convert type-2000 header internals to force GRAB and FILAD routines to treat file as a 1000-type file.
 */
m.force1000 = function (hcb: BlueHeader): void {
    if (hcb["class"] === 2) {
        if (hcb.size && !hcb.pipe) {
            hcb.size = hcb.subsize! * hcb.size;
        } else {
            hcb.size = 0;
        }
        hcb.bpe = hcb.bpe / hcb.subsize!;
        hcb.ape = 1;
    }
};

/**
 * Get data from file at specified start location.
 */
m.grab = function (hcb: BlueHeader, bufview: TypedArray, start: number, nget: number): number {
    var dv = getDview(hcb);
    if (!dv) {
        return 0;
    }

    if (hcb.format![0] === "C") {
        start = start * 2;
    }

    nget = hcb.ape * nget;

    var ngot = Math.min(bufview.length, dv.length - start);
    if (bufview.set === undefined) {
        for (var i = 0; i < ngot; i++) {
            bufview[i] = dv[start + i];
        }
    } else {
        bufview.set(dv.subarray(start, start + ngot));
    }
    if (hcb.format![0] === "C") {
        ngot = ngot / 2;
    }
    return ngot;
};

/**
 * Append data buffer to file specified in the bluefile header control block.
 */
m.filad = function (hcb: BlueHeader, data: TypedArray | number[], sync?: boolean): void {
    var dv = getDview(hcb)!;
    if (hcb.data_free! < data.length) {
        throw "Pipe full";
    }
    var sidx = hcb.in_byte! / dv.BYTES_PER_ELEMENT;
    var eidx = sidx + data.length;
    if (eidx > dv.length) {
        var head = dv.length - sidx;
        var tail = data.length - head;
        if (Array.isArray(data)) {
            dv.set(data.slice(0, head), sidx);
            dv.set(data.slice(head, data.length), 0);
        } else {
            dv.set(data.subarray(0, head), sidx);
            dv.set(data.subarray(head, data.length), 0);
        }
        hcb.in_byte! = tail * dv.BYTES_PER_ELEMENT;
    } else {
        dv.set(data, sidx);
        hcb.in_byte! = (eidx * dv.BYTES_PER_ELEMENT) % hcb.buf!.byteLength;
    }
    hcb.data_free! -= data.length;
    if (hcb.onwritelisteners) {
        for (var i = 0; i < hcb.onwritelisteners.length; i++) {
            if (!sync) {
                window.setTimeout(hcb.onwritelisteners[i], 0);
            } else {
                hcb.onwritelisteners[i]();
            }
        }
    }
};

/**
 * @private
 */
m.pavail = function (hcb: BlueHeader): number {
    return getDview(hcb)!.length - hcb.data_free!;
};

/**
 * Get data from file in dataflow fashion.
 */
// WARNING - nget is number of scalars...which differs from the normal API
m.grabx = function (hcb: BlueHeader, dview: TypedArray, nget?: number, offset?: number): number {
    var dv = getDview(hcb)!;
    var navail = dv.length - hcb.data_free!;
    if (offset === undefined) {
        offset = 0;
    }
    if (!nget) {
        nget = Math.min(dview.length - offset, navail);
    } else if (nget > dview.length - offset) {
        throw "m.grabx : nget larger then available buffer space";
    }
    if (nget < 0) {
        throw "m.grabx : nget cannot be negative";
    }
    if (nget > navail) {
        return 0;
    }

    var sidx = hcb.out_byte! / dv.BYTES_PER_ELEMENT;
    var eidx = sidx + nget;
    if (eidx >= dv.length) {
        var head = dv.length - sidx;
        eidx = eidx - dv.length;
        dview.set(dv.subarray(sidx, dv.length), offset);
        dview.set(dv.subarray(0, eidx), offset + head);
    } else {
        dview.set(dv.subarray(sidx, eidx), offset);
    }
    hcb.out_byte = (eidx * dv.BYTES_PER_ELEMENT) % hcb.buf!.byteLength;
    hcb.data_free! += nget;
    var ngot = nget;
    return ngot;
};

/**
 * @private
 */
m.addPipeWriteListener = function (hcb: BlueHeader, onwrite: () => void): void {
    if (!hcb.onwritelisteners) {
        hcb.onwritelisteners = [];
    }
    if (hcb.onwritelisteners.indexOf(onwrite) === -1) {
        hcb.onwritelisteners.push(onwrite);
    }
};

/**
 * Returns ASCII description of units code
 */
// ~= M$UNITS_NAME
m.units_name = function (units: number): string {
    var u = UNITS[units];
    return u[0] + " (" + u[1] + ")";
};

/**
 * Extract filename from full path
 */
m.trim_name = function (pathfilename: string): string {
    var i = pathfilename.indexOf("]");
    if (i === -1) {
        i = pathfilename.indexOf("/");
    }
    if (i === -1) {
        i = pathfilename.indexOf(":");
    }
    var j = pathfilename.substr(i + 1, pathfilename.length).indexOf(".");
    if (j < 0) {
        j = pathfilename.length - i;
    }
    var filename = pathfilename.substr(i + 1, i + j + 1);
    return filename;
};

/**
 * Takes an integer code for units and a multiplier and returns the string representation.
 */
// ~= M$LABEL
m.label = function (units: number | string | UnitEntry, mult: number): string {
    var u: [string, string | null] = ["Unknown", "U"];

    if (typeof units === "string") {
        u = [units, null];
    } else if (Array.isArray(units)) {
        u = units as unknown as [string, string | null];
    } else {
        var entry = UNITS[units as number];
        if (entry === undefined) {
            u = ["Unknown", "U"];
        } else {
            u = [entry[0], entry[1]];
        }
    }

    var prefix = m.mult_prefix(mult);

    if (u[1]) {
        return u[0] + " (" + prefix + u[1] + ")";
    } else {
        return u[0];
    }
};

/**
 * Clamp value between bounds
 */
m.bound = function (a: number, b: number, c: number): number {
    return a < b ? b : a > c ? c : a;
};

m.touch_distance = function (touchA: TouchLike, touchB: TouchLike): number {
    var xd = touchA.pageX - touchB.pageX;
    var yd = touchA.pageY - touchB.pageY;
    return Math.sqrt(xd * xd + yd * yd);
};

m.mult_prefix = function (mult: number): string {
    var prefix = "?";

    /* jshint -W116 */
    if (mult == 1) {
        prefix = "";
    } else if (mult == 10) {
        prefix = "da";
    } else if (mult == 0.1) {
        prefix = "d";
    } else if (mult == 100) {
        prefix = "h";
    } else if (mult == 0.01) {
        prefix = "c";
    } else if (mult == 1.0e3) {
        prefix = "K";
    } else if (mult == 1.0e-3) {
        prefix = "m";
    } else if (mult == 1.0e6) {
        prefix = "M";
    } else if (mult == 1.0e-6) {
        prefix = "u";
    } else if (mult == 1.0e9) {
        prefix = "G";
    } else if (mult == 1.0e-9) {
        prefix = "n";
    } else if (mult == 1.0e12) {
        prefix = "T";
    } else if (mult == 1.0e-12) {
        prefix = "p";
    }
    /* jshint +W116 */

    return prefix;
};

/**
 * @private
 */
var VECTOR: VectorConfig = {
    MV: "F",
    MS: "F",
    nbpt: 4,
    view: undefined
};

/**
 * Sets data type for all subsequent calls to vector libraries.
 */
// ~= VSTYPE
m.vstype = function (ctype: string): void {
    VECTOR.MS = ctype;
    VECTOR.MV = ctype;
    if (VECTOR.MV === "D") {
        VECTOR.nbpt = 8;
    } else if (VECTOR.MV === "L" || VECTOR.MV === "F") {
        VECTOR.nbpt = 4;
    } else if (VECTOR.MV === "I") {
        VECTOR.nbpt = 2;
    } else if (VECTOR.MV === "B") {
        VECTOR.nbpt = 1;
    } else {
        alert("Unsupported vector type");
    }
};

m.log10 = function (v: number, lo_thresh?: number): number {
    if (lo_thresh === undefined) {
        lo_thresh = 1.0e-20;
    }
    return Math.log(Math.max(v, lo_thresh)) / Math.log(10);
};

/**
 * For each vector element in src, determine the max of src element and lo_thresh,
 * returns the log(base10) of that value in dst
 */
// ~= M$VLOG10
m.vlog10 = function (src: NumericArray, lo_thresh?: number, dst?: NumericArray): void {
    if (lo_thresh === undefined) {
        lo_thresh = 1.0e-20;
    }
    if (dst === undefined) {
        dst = src;
    }
    for (var i = 0; i < src.length; i++) {
        if (dst.length <= i) {
            break;
        }
        dst[i] = Math.log(Math.max(src[i], lo_thresh)) / Math.log(10);
    }
};

/**
 * Same as vlog10 but multiply each output value by a scale factor dbscale.
 * @private
 */
m.vlogscale = function (src: NumericArray, lo_thresh?: number, dbscale?: number, dst?: NumericArray): void {
    if (lo_thresh === undefined) {
        lo_thresh = 1.0e-20;
    }
    if (dbscale === undefined) {
        dbscale = 1;
    }
    if (dst === undefined) {
        dst = src;
    }
    for (var i = 0; i < src.length; i++) {
        if (dst.length <= i) {
            break;
        }
        dst[i] = Math.log(Math.abs(Math.max(src[i], lo_thresh))) / Math.log(10);
        dst[i] = dst[i] * dbscale;
    }
};

/**
 * Same as vlogscale but computes magnitude squared from interleaved complex data
 * (src is interleaved: [r0, i0, r1, i1, ...]).
 * @private
 */
m.cvmag2logscale = function (src: NumericArray, lo_thresh?: number, dbscale?: number, dst?: NumericArray): void {
    if (lo_thresh === undefined) {
        lo_thresh = 1.0e-20;
    }
    if (dbscale === undefined) {
        dbscale = 1;
    }
    if (dst === undefined) {
        dst = src;
    }
    var j = 0;
    for (var i = 0; i < dst.length; i++) {
        j = 2 * i + 1;
        if (j >= src.length) {
            break;
        }
        dst[i] = src[j - 1] * src[j - 1] + src[j] * src[j];
        dst[i] = Math.log(Math.abs(Math.max(dst[i], lo_thresh))) / Math.log(10);
        dst[i] = dst[i] * dbscale;
    }
};

/**
 * Multiply count elements of src by mul, store results in dst
 */
// ~= M$VSMUL
m.vsmul = function (src: NumericArray, mul: number, dst?: NumericArray, count?: number): void {
    if (dst === undefined) {
        dst = src;
    }
    if (count === undefined) {
        count = dst.length;
    }
    count = Math.min(dst.length, count);
    count = Math.min(src.length, count);

    for (var i = 0; i < count; i++) {
        if (dst.length <= i) {
            break;
        }
        dst[i] = src[i] * mul;
    }
};

/**
 * Finds max and min values in vector vec and returns values.
 */
// ~= M$VMXMN
m.vmxmn = function (vec: NumericArray, size: number): MinMaxResult {
    var smax = vec[0];
    var smin = vec[0];
    var imax = 0;
    var imin = 0;
    size = Math.min(size, vec.length);
    for (var i = 0; i < size; i++) {
        if (vec[i] > smax) {
            smax = vec[i];
            imax = i;
        }
        if (vec[i] < smin) {
            smin = vec[i];
            imin = i;
        }
    }
    return {
        smax: smax,
        smin: smin,
        imax: imax,
        imin: imin
    };
};

/**
 * Move count elements from src to dest with strides.
 */
m.vmov = function (src: NumericArray, sstride: number, dest: NumericArray, dstride: number, count?: number): void {
    if (count === undefined) {
        count = src.length;
    }
    count = Math.min(src.length, count);

    for (var i = 0; i < count; i++) {
        var s = i * sstride;
        var d = i * dstride;
        if (s >= src.length) {
            break;
        }
        if (d >= dest.length) {
            break;
        }
        dest[d] = src[s];
    }
};

/**
 * Move count elements from src to dest keeping the maximum value (with decay).
 */
m.vmovmax = function (
    src: NumericArray,
    sstart: number,
    sstride: number,
    dest: NumericArray,
    dstart: number,
    dstride: number,
    count?: number,
    decay?: number
): void {
    if (count === undefined) {
        count = src.length;
    }
    count = Math.min(src.length, count);

    let adjust = 0;
    for (var i = 0; i < count; i++) {
        var s = i * sstride + sstart;
        var d = i * dstride + dstart;
        if (s >= src.length) {
            break;
        }
        if (d >= dest.length) {
            break;
        }
        adjust = (src[s] - dest[d]) * (1 - Math.exp(-decay!));
        dest[d] = Number.isNaN(dest[d] + adjust) ? src[s] : dest[d] + adjust;
        dest[d] = Math.max(dest[d], src[s]);
    }
};

/**
 * Initialize count consecutive elements of input vector vec with value inpval.
 */
// ~= M$VFILL
m.vfill = function (vec: NumericArray, inpval: number, count?: number): void {
    if (count === undefined) {
        count = vec.length;
    }
    count = Math.min(vec.length, count);
    for (var i = 0; i < count; i++) {
        vec[i] = inpval;
    }
};

/**
 * Compute the absolute value of count elements in vec and write to output vector dest
 */
m.vabs = function (vec: NumericArray, dest?: NumericArray, count?: number): void {
    if (count === undefined) {
        count = vec.length;
    }
    if (dest === undefined) {
        dest = vec;
    }
    for (var i = 0; i < count; i++) {
        dest[i] = Math.abs(vec[i]);
    }
};

/**
 * Computes the magnitude of count complex vector cxvec elements
 * (interleaved: [r0, i0, r1, i1, ...]).
 */
// ~= M$CVMAG
m.cvmag = function (cxvec: NumericArray, dest: NumericArray, count?: number): void {
    if (count === undefined) {
        count = dest.length;
    }
    count = Math.min(dest.length, count);

    for (var i = 0; i < count; i++) {
        var j = 2 * i + 1;
        if (j >= cxvec.length) {
            break;
        }
        dest[i] = Math.sqrt(cxvec[j - 1] * cxvec[j - 1] + cxvec[j] * cxvec[j]);
    }
};

/**
 * Computes the magnitude squared of count complex vector cxvec elements
 * (interleaved: [r0, i0, r1, i1, ...]).
 */
// ~= M$CVMAG2
m.cvmag2 = function (cxvec: NumericArray, dest: NumericArray, count?: number): void {
    if (count === undefined) {
        count = dest.length;
    }
    count = Math.min(dest.length, count);

    var j = 0;
    for (var i = 0; i < count; i++) {
        j = 2 * i + 1;
        if (j >= cxvec.length) {
            break;
        }
        dest[i] = cxvec[j - 1] * cxvec[j - 1] + cxvec[j] * cxvec[j];
    }
};

/**
 * Computes phase in radians of count complex vector cxvec elements
 * (interleaved: [r0, i0, r1, i1, ...]).
 */
// ~= M$CVPHA
m.cvpha = function (cxvec: NumericArray, dest: NumericArray, count?: number): void {
    if (count === undefined) {
        count = dest.length;
    }
    count = Math.min(dest.length, count);

    var j = 0;
    var re = 0;
    var im = 0;
    for (var i = 0; i < count; i++) {
        j = 2 * i + 1;
        if (j >= cxvec.length) {
            break;
        }
        re = cxvec[j - 1];
        im = cxvec[j];
        if (re === 0.0 && im === 0.0) {
            re = 1.0;
        }
        dest[i] = Math.atan2(im, re);
    }
};

/**
 * Computes the phase in degrees of count complex vector cxvec elements
 * (interleaved: [r0, i0, r1, i1, ...]).
 */
// ~= M$CVPHAD
m.cvphad = function (cxvec: NumericArray, dest: NumericArray, count?: number): void {
    if (count === undefined) {
        count = dest.length;
    }
    count = Math.min(dest.length, count);

    var j = 0;
    var re = 0;
    var im = 0;
    for (var i = 0; i < count; i++) {
        j = 2 * i + 1;
        if (j >= cxvec.length) {
            break;
        }
        re = cxvec[j - 1];
        im = cxvec[j];
        if (re === 0.0 && im === 0.0) {
            re = 1.0;
        }
        dest[i] = Math.atan2(im, re) * (180.0 / Math.PI);
    }
};

/**
 * Truncate a number to its integer part.
 * @private
 */
// ~= INT(), DINT
m.trunc = function (n: number): number {
    return n - (n % 1);
};

/**
 * Transfer of sign function from Fortran.
 * @private
 */
m.sign = function (a1: number, a2: number): number {
    if (a2 >= 0) {
        return Math.abs(a1);
    } else {
        return -Math.abs(a1);
    }
};

/**
 * @private
 */

function pad2(number: number): string {
    return (number < 10 ? "0" : "") + number;
}

/**
 * Convert J1950 time or seconds-since-Epoch (midnight Dec-31-1949) to time-of-day.
 * Fractional seconds accurate to milliseconds.
 */
m.sec2tod = function (sec: number, trim_trailing_zeros?: boolean): string {
    var tod = "";
    var j1950 = Date.UTC(1950, 0, 1); //From 1950 to 1970
    var j1950Date = new Date(j1950); //debug var
    var d = new Date();
    var midnightToday = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    var diffDaySecs = 86400;
    var diffYearSecs = 31536000;
    var negDiffYearSecs = -1 * diffYearSecs;

    if (sec >= 0) {
        if (sec < diffDaySecs) {
            // hh:mm:ss
            var millisecs = midnightToday.getTime() + sec * 1000;
            var d = new Date(millisecs);
            tod = pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
        } else if (sec === 86400) {
            tod = "24:00:00";
        } else if (sec < diffYearSecs) {
            // ddd:hh:mm:ss
            var days: any = sec / diffDaySecs;
            days = [days > 0 ? Math.floor(days) : Math.ceil(days)];

            // Break down integral seconds in the day into hours, minutes and seconds.
            var seconds = Math.floor(sec % diffDaySecs);
            var hours = Math.floor(seconds / 3600);
            var minutes = Math.floor((seconds / 60) % 60);
            seconds %= 60;

            tod = days.toString() + "::" + pad2(hours) + ":" + pad2(minutes) + ":" + pad2(seconds);
        } else {
            // convert to j1950
            var secMilli = Math.floor(sec * 1000) + j1950;
            d = new Date(secMilli);
            tod =
                d.getUTCFullYear() +
                ":" +
                pad2(d.getUTCMonth() + 1) +
                ":" +
                pad2(d.getUTCDate()) +
                "::" +
                pad2(d.getUTCHours()) +
                ":" +
                pad2(d.getUTCMinutes()) +
                ":" +
                pad2(d.getUTCSeconds());
        }
    } else {
        if (sec > negDiffYearSecs) {
            // -ddd:hh:mm:ss
            var days: any = sec / diffDaySecs;
            days = days <= 0 ? Math.ceil(days) : Math.floor(days);

            // Break down integral seconds in the day into hours, minutes and seconds.
            var seconds = Math.floor(Math.abs(sec) % diffDaySecs);
            var hours = Math.floor(seconds / 3600);
            var minutes = Math.floor((seconds / 60) % 60);
            seconds %= 60;

            if (days === 0) {
                days = "-0";
            } else {
                days = days.toString();
            }
            tod = days + "::" + pad2(hours) + ":" + pad2(minutes) + ":" + pad2(seconds);
        } else {
            // convert to j1950
            var secMilli = Math.floor(sec * 1000) + j1950;
            d = new Date(secMilli);
            tod =
                d.getUTCFullYear() +
                ":" +
                pad2(d.getUTCMonth() + 1) +
                ":" +
                pad2(d.getUTCDate()) +
                "::" +
                pad2(d.getUTCHours()) +
                ":" +
                pad2(d.getUTCMinutes()) +
                ":" +
                pad2(d.getUTCSeconds());
        }
    }

    // violate legacy behavior, include full precision always
    var fractional = sec % 1;
    if (fractional === 0.0) {
        tod += ".000000";
    } else {
        tod +=
            "." +
            Math.abs(sec % 1)
                .toPrecision(6)
                .slice(2, 8);
    }

    if (trim_trailing_zeros) {
        var dloc = tod.indexOf(".");
        var zloc = -1;
        if (dloc !== -1) {
            zloc = tod.substr(dloc, tod.length).indexOf("0");
        }
        if (zloc !== -1) {
            tod = tod.substr(0, dloc + zloc);
        }
    }
    return tod;
};

/**
 * The offset to convert midnight Jan 1st 1970 to
 * midnight Jan 1st 1950.
 *
 * @private
 */
var j1950offset = (20.0 * 365.0 + 5.0) * (24 * 3600);

/**
 * 0.0 - 86400 == m.sec2tod
 * >86400 then modulo 86400
 */
m.sec2tspec = function (sec: number, mode?: string, trim_trailing_zeros?: boolean): string {
    mode = mode || "";
    if (sec >= 0 && sec <= 86400) {
        return m.sec2tod(sec, trim_trailing_zeros);
    } else {
        sec = sec % 86400;
        if (mode !== "delta" && sec <= 0) {
            return m.sec2tod(sec + 86400, trim_trailing_zeros);
        } else if (mode === "delta" && sec <= 0) {
            return "-" + m.sec2tod(-1 * sec, trim_trailing_zeros);
        } else {
            return m.sec2tod(sec, trim_trailing_zeros);
        }
    }
};

/**
 * Convert seconds to time-of-day (j1970 epoch).
 */
m.sec2tod_j1970 = function (sec: number): string {
    var tod = "";
    var d: Date;
    if (sec >= 0 && sec < 86400) {
        // hh:mm:ss
        d = new Date(sec * 1000);
        tod = pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    } else if (sec < 0 && sec > -31536000) {
        // -ddd:hh:mm:ss
        var days = -1 * (sec / (24 * 60 * 60));
        d = new Date(sec * 1000);
        tod = days.toString() + "::" + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    } else {
        // convert to j1950
        d = new Date((sec - j1950offset) * 1000);
        tod =
            d.getFullYear() +
            ":" +
            pad2(d.getMonth()) +
            ":" +
            pad2(d.getDate()) +
            "::" +
            pad2(d.getHours()) +
            ":" +
            pad2(d.getMinutes()) +
            ":" +
            pad2(d.getSeconds());
    }
    if (sec % 1 !== 0) {
        tod += "." + (sec % 1).toPrecision(6).slice(2, 8);
    }
    return tod;
};

m.j1970toj1950 = function (t: number | Date): number {
    if ((t as Date).getTime !== undefined) {
        return (t as Date).getTime() / 1000 + j1950offset;
    } else {
        return (t as number) + j1950offset;
    }
};

m.j1950toj1970 = function (t: number): number {
    return t - j1950offset;
};

/**
 * Throttle calls to "callback" routine and ensure that it
 * is not invoked any more often than "delay" milliseconds.
 * @private
 */
m.throttle = function (delay: number, callback: (...args: any[]) => void): () => void {
    var previousCall = new Date().getTime();
    return function () {
        var time = new Date().getTime();

        if (time - previousCall >= delay) {
            previousCall = time;
            callback.apply(null, arguments as any);
        }
    };
};

m.pad = function (value: number, padamt?: number | string): number {
    if (!padamt) {
        return 0;
    }
    if (typeof padamt === "string") {
        if (padamt.endsWith("%")) {
            padamt = value * (parseFloat(padamt) / 100.0);
        } else {
            padamt = parseFloat(padamt);
        }
    }

    return padamt;
};

// Node: Export function
export default m;
