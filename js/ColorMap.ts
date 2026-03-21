import tinycolor from "tinycolor2";

/** Internal RGBA color with optional position and computed fields */
interface ColorRGBA {
    red: number;
    green: number;
    blue: number;
    alpha: number;
    pos?: number;
    hex?: string;
    color?: number;
    [index: number]: number;
}

/** Color input that uses a "color" key (e.g., CSS string) with optional position */
interface ColorWithColorKey {
    color: string;
    pos?: number;
    [key: string]: any;
}

/** Percentage-based RGB input (values 0–100) */
interface ColorPercentage {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
    pos?: number;
    [key: string]: any;
}

type ColorInput = string | ColorWithColorKey | ColorPercentage | number[];

interface ColorMapOptions {
    ncolors?: number;
    alpha?: number;
}

if (typeof Object.assign !== "function") {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target: any, _varArgs: any) {
            // .length of function is 2
            "use strict";
            if (target == null) {
                // TypeError if undefined or null
                throw new TypeError("Cannot convert undefined or null to object");
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

class ColorMap {
    options: { ncolors: number; alpha: number };
    map: ColorRGBA[];
    colors: ColorRGBA[];
    _low: number;
    _high: number;
    _fscale: number;

    constructor(colors: ColorInput[], options?: ColorMapOptions) {
        this.options = {
            ncolors: 500,
            alpha: 255
        };
        this.options = Object.assign(this.options, options);
        this.map = [];
        this._low = 0;
        this._high = 1;
        var ncolors = this.options.ncolors;
        this._fscale = ncolors / (this._high - this._low);
        var colorindex = 1;
        var colorBlockIndex = 1;
        var parsedColors: ColorRGBA[] = JSON.parse(JSON.stringify(colors)); //make a copy so we dont change the original colors
        parsedColors = this._parseColors(parsedColors as any);
        this.colors = parsedColors;
        var col1 = parsedColors[0];
        var col2 = parsedColors[1];
        // pos is the percentage of scale (0-100), so
        // colorStop is how many percentage is allocated
        // to this band
        var colorStop = parsedColors[1].pos! - parsedColors[0].pos!;
        // now many colors are allocated to this block
        var colorsInBlock = ncolors * (colorStop / 100);
        // the interpolation step per color number
        var factorStep = 1 / colorsInBlock;
        for (var n = 0; n < ncolors - 2; n++) {
            if (colorBlockIndex > colorsInBlock) {
                col1 = parsedColors[colorindex];
                col2 = parsedColors[colorindex + 1];
                // if we are at the end of the color list
                if (col2 === undefined) {
                    break;
                }
                if (col1.pos! >= 100 && col2.pos! >= 100) {
                    break;
                }
                colorStop = col2.pos! - col1.pos!;
                colorsInBlock = ncolors * (colorStop / 100);
                factorStep = 1 / colorsInBlock;
                colorBlockIndex = 1;
                colorindex += 1;
            }
            this._addColor(this.interpolate(col1, col2, factorStep * colorBlockIndex));
            colorBlockIndex += 1;
        }

        this._addColor(parsedColors[colorindex]);
        this._addColor(parsedColors[0], true);
    }

    _addColor(color: ColorRGBA, front?: boolean): void {
        color.hex = this._rgbToHex(color.red, color.green, color.blue);
        color.color =
            (color.alpha << 24) | // alpha
            (color.blue << 16) | // blue
            (color.green << 8) | // green
            color.red;
        if (front) {
            this.map.unshift(color);
        } else {
            this.map.push(color);
        }
    }

    _parseColors(colors: any[]): ColorRGBA[] {
        for (var i = 0, c = colors.length; i < c; i++) {
            var color = colors[i];
            if (typeof color === "string") {
                colors[i] = this._hexToRgb(color);
                color = tinycolor(color);
                color = color.toRgb();
                colors[i] = { red: color.r, green: color.g, blue: color.b, alpha: this.options.alpha };
            } else if (color.hasOwnProperty("color")) {
                var newColor: any = tinycolor(color.color);
                newColor = newColor.toRgb();
                newColor = {
                    red: newColor.r,
                    green: newColor.g,
                    blue: newColor.b,
                    alpha: this.options.alpha
                } as ColorRGBA;
                if (color.hasOwnProperty("pos")) {
                    newColor.pos = color.pos;
                }
                colors[i] = newColor;
            } else {
                if (color.red === undefined && color.green === undefined && color.blue === undefined) {
                    //assume if it doesn't have rgb values it is a matplotlib style color map
                    colors[i].red = Math.floor(Math.round(255 * color[0]));
                    colors[i].green = Math.floor(Math.round(255 * color[1]));
                    colors[i].blue = Math.floor(Math.round(255 * color[2]));
                } else {
                    //assume if it has rgb values it is a percentage
                    colors[i].red = Math.floor(Math.round(255 * (color.red / 100)));
                    colors[i].green = Math.floor(Math.round(255 * (color.green / 100)));
                    colors[i].blue = Math.floor(Math.round(255 * (color.blue / 100)));
                }
            }
            if (!colors[i].hasOwnProperty("alpha")) {
                colors[i].alpha = this.options.alpha;
            }
        }
        return this._checkColorStops(colors);
    }

    _checkColorStops(colors: ColorRGBA[]): ColorRGBA[] {
        var lastStop = 0;
        var colorsWithNoStops = 0;
        for (var i = 0, c = colors.length; i < c; i++) {
            var color = colors[i];
            if (!color.hasOwnProperty("pos")) {
                colorsWithNoStops += 1;
            } else {
                if (colorsWithNoStops) {
                    var stopSize = (color.pos! - lastStop) / colorsWithNoStops;
                    var currentPos = color.pos!;
                    for (var z = 1; z <= colorsWithNoStops; z++) {
                        colors[i - z].pos = currentPos - stopSize;
                        currentPos -= stopSize;
                    }
                }
                colorsWithNoStops = 0;
            }
        }
        if (colorsWithNoStops) {
            var currentPos = 100;
            colors[colors.length - 1].pos = currentPos;
            if (lastStop === 0) {
                colors[0].pos = 0;
                colorsWithNoStops -= 1;
            }
            var stopSize = (currentPos - lastStop) / colorsWithNoStops;
            var i = colors.length - 1;
            for (var z = 1; z < colorsWithNoStops; z++) {
                colors[i - z].pos = currentPos - stopSize;
                currentPos -= stopSize;
            }
        }
        return colors;
    }

    _componentToHex(c: number): string {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    _rgbToHex(r: number, g: number, b: number): string {
        return "#" + this._componentToHex(r) + this._componentToHex(g) + this._componentToHex(b);
    }

    _hexToRgb(hex: string): { red: number; green: number; blue: number } | null {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  red: parseInt(result[1], 16),
                  green: parseInt(result[2], 16),
                  blue: parseInt(result[3], 16)
              }
            : null;
    }

    getColor(number: number): ColorRGBA {
        var colorindex = this.getColorIndex(number);
        return this.map[colorindex];
    }

    getColorByIndex(colorindex: number): ColorRGBA {
        return this.map[colorindex];
    }

    getColorIndex(number: number): number {
        var n = (number - this._low) * this._fscale;
        var colorindex = ~~n; //make int fastest method
        if (colorindex > this.map.length - 1) {
            colorindex = this.map.length - 1;
        } else if (colorindex < 0) {
            colorindex = 0;
        }
        return colorindex;
    }

    getNColors(): number {
        return this.map.length;
    }

    setRange(low: number, high: number): void {
        // only recalculate if a value has changed
        if (this._low !== low || this._high !== high) {
            this._low = low;
            this._high = high;
            this._fscale = this.map.length / Math.abs(this._high - this._low);
        }
    }

    interpolate(col1: ColorRGBA, col2: ColorRGBA, factor: number): ColorRGBA {
        return {
            red: col1.red + factor * (col2.red - col1.red),
            green: col1.green + factor * (col2.green - col1.green),
            blue: col1.blue + factor * (col2.blue - col1.blue),
            alpha: col1.alpha + factor * (col2.alpha - col1.alpha)
        };
    }
}

// Expose on window for backward compatibility
(window as any).ColorMap = ColorMap;

export default ColorMap;
