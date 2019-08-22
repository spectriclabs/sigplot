/* global module */
/* global require */
 (function() {
     var tinycolor = require("tinycolor2");
     if (typeof Object.assign !== 'function') {
         // Must be writable: true, enumerable: false, configurable: true
         Object.defineProperty(Object, "assign", {
             value: function assign(target, varArgs) { // .length of function is 2
                 'use strict';
                 if (target == null) { // TypeError if undefined or null
                     throw new TypeError('Cannot convert undefined or null to object');
                 }
                 var to = Object(target);
                 for (var index = 1; index < arguments.length; index++) {
                     var nextSource = arguments[index];
                     if (nextSource != null) { // Skip over if undefined or null
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
     var ColorMap = window.ColorMap = function(colors, options) {
         this.options = {
             ncolors: 500,
             alpha: 255
         };
         this.options = Object.assign(this.options, options);
         this.map = [];
         var _min = 0;
         this._low = 0;
         this._high = 1;
         var ncolors = this.options.ncolors;
         this._fscale = ncolors / (this._high - this._low);

         colors = JSON.parse(JSON.stringify(colors)); //make a copy so we dont change the original colors
         colors = this._parseColors(colors);
         this.colors = colors;

         // Add the first color
         this._addColor(colors[0], true);

         var colorindex = 0;
         for (var n = 1; n < ncolors - 1; n++) {
             var colorPos = n * (100.0 / ncolors);
             while ((colorindex < colors.length-1) && (colors[colorindex+1].pos < colorPos)) {
                 colorindex += 1;
             }

             var col1 = colors[colorindex];
             var col2 = colors[colorindex+1];

             var xx = (colorPos - col1.pos) / (col2.pos - col1.pos);
             this._addColor(this.interpolate(col1, col2, xx));
         }

         // Move to the first color with pos:100 and at it at the end of the list
         while (colorindex < colors.length - 1 && colors[colorindex + 1].pos < 100) {
            colorindex += 1;
         }

         this._addColor(colors[colorindex+1]);
         
     };
     ColorMap.prototype = {
         _addColor: function(color, front) {
             color.hex = this._rgbToHex(color.red, color.green, color.blue);
             color.color = (color.alpha << 24) | // alpha
                 (color.blue << 16) | // blue
                 (color.green << 8) | // green
                 (color.red);
             if (front) {
                 this.map.unshift(color);
             } else {
                 this.map.push(color);
             }
         },
         _parseColors: function(colors) {
             for (var i = 0, c = colors.length; i < c; i++) {
                 var color = colors[i];
                 if (typeof color === "string") {
                     colors[i] = this._hexToRgb(color);
                     color = tinycolor(color);
                     color = color.toRgb();
                     colors[i] = {red:color.r,green:color.g,blue:color.b,alpha:this.options.alpha};

                 } else if (color.hasOwnProperty("color")) {
                     var newColor = tinycolor(color.color);
                     newColor = newColor.toRgb();
                     newColor = {red:newColor.r,green:newColor.g,blue:newColor.b,alpha:this.options.alpha};
                     if (color.hasOwnProperty("pos")) {
                         newColor.pos = color.pos;
                     }
                     colors[i] = newColor;
                 } else {
                     //assume if it has rgb values it is a percentage
                     colors[i].red = Math.floor(Math.round(255 * (color.red / 100)));
                     colors[i].green = Math.floor(Math.round(255 * (color.green / 100)));
                     colors[i].blue = Math.floor(Math.round(255 * (color.blue / 100)));
                 }
                 if (!colors[i].hasOwnProperty("alpha")) {
                     colors[i].alpha = this.options.alpha;
                 }
             }
             return this._checkColorStops(colors);
         },
         _checkColorStops: function(colors) {
             var lastStop = 0;
             var colorsWithNoStops = 0;
             for (var i = 0, c = colors.length; i < c; i++) {
                 var color = colors[i];
                 if (!color.hasOwnProperty("pos")) {
                     colorsWithNoStops += 1;
                 } else {
                     if (colorsWithNoStops) {
                         var stopSize = (color.pos - lastStop) / colorsWithNoStops;
                         var currentPos = color.pos;
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
         },
         _componentToHex: function(c) {
             var hex = c.toString(16);
             return hex.length === 1 ? "0" + hex : hex;
         },
         _rgbToHex: function(r, g, b) {
             return "#" + this._componentToHex(r) + this._componentToHex(g) + this._componentToHex(b);
         },
         _hexToRgb: function(hex) {
             var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
             return result ? {
                 red: parseInt(result[1], 16),
                 green: parseInt(result[2], 16),
                 blue: parseInt(result[3], 16)
             } : null;
         },
         getColor: function(number) {
             var colorindex = this.getColorIndex(number);
             return this.map[colorindex];
         },
         getColorByIndex: function(colorindex) {
            return this.map[colorindex];
         },
         getColorIndex: function(number) {
            var n = (number - this._low) * this._fscale;
            var colorindex = ~~n; //make int fastest method
            if (colorindex > this.map.length - 1) {
                colorindex = this.map.length - 1;
            } else if (colorindex < 0) {
                colorindex = 0;
            }
            return colorindex;
         },
         getNColors : function() {
             return this.map.length;
         },
         setRange: function(low, high) {
             // only recalculate if a value has changed
             if ((this._low !== low) || (this._high !== high)) {
                 this._low = low;
                 this._high = high;
                 this._fscale = this.map.length / Math.abs(this._high - this._low);
             }
         },
         interpolate: function(col1, col2, factor) {
             return {
                 red: ~~(col1.red + factor * (col2.red - col1.red)),
                 green: ~~(col1.green + factor * (col2.green - col1.green)),
                 blue: ~~(col1.blue + factor * (col2.blue - col1.blue)),
                 alpha: ~~(col1.alpha + factor * (col2.alpha - col1.alpha))
             };
         }
     };
     module.exports = ColorMap;
 })();