/**
 * @license
 * File: sigplot.boxes.js
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

(function() {

    var _ = require("underscore");
    var common = require("./common");
    var m = require("./m");
    var mx = require("./mx");

    class BoxesPlugin {

        /**
         * @constructor
         * 
         * @param {Object} options - options for the plugin
         * @param {Boolean} options.display - controls if boxes should be displayed or hidden
         * @param {Boolean} options.enableSelect - controls if boxes can be selected with the mouse
         * @param {Boolean} options.enableMove - controls if boxes can be moved with the mouse
         * @param {Boolean} options.enableResize - controls if boxes can be resized with the mouse
         * @param {Number} options.lineWidth - the line width (in pixels) for drawing the box
         * @param {Number} options.alpha - the transparency for drawing the box fill
         * @param {Boolean} options.fill - if boxes should be filled or not
         * @param {*} options.strokeStyle - the canvas style to be used for the line and box text
         * @param {*} options.fillStyle - the canvas style to be used for the box fill
         * @param {Boolean} options.absolutePlacement - if boxes x,y,w,h are in pixels instead of real coordinates
         * 
         * @returns {BoxesPlugin}
         */
        constructor({
            display = true,
            enableSelect = false,
            enableMove = false,
            enableResize = false,
            lineWidth = 1,
            alpha = 0.5,
            font,
            fill = false,
            strokeStyle,
            fillStyle,
            absolutePlacement = false
        } = {}) {
            this.options = {};

            this.options.display = display;
            this.options.enableSelect = enableSelect;
            this.options.enableMove = enableMove;
            this.options.enableResize = enableResize;
            this.options.lineWidth = lineWidth;
            this.options.alpha = alpha;
            this.options.font = font;
            this.options.fill = fill;
            this.options.strokeStyle = strokeStyle;
            this.options.fillStyle = fillStyle;
            this.options.absolutePlacement = absolutePlacement;
        }

        /**
         * Initializer called when plot.add_plugin() is used.
         * This should not be called directly.
         */
        init(plot) {
            this.plot = plot;
            this.boxes = [];
            this._clickTimer = null;

            this._onMouseDown = this._onMouseDown.bind(this);
            this._onMouseMove = this._onMouseMove.bind(this);
            this._onMouseClick = this._onMouseClick.bind(this);

            this.plot.addListener("mdown", this._onMouseDown);
            this.plot.addListener("mmove", this._onMouseMove);
            this.plot.addListener("mup", this._onMouseClick);
            this.plot.addListener("mdblclick", this._onMouseClick);
            // listen for document mouse up to handle situations where
            // a user is dragging the mouse out of the plot area
        }

        //////////////////////////////////////////////////////////////////////
        // Public Methods

        /**
         * Get/Set display property.
         */
        display(val) {
            if (val === undefined) {
                return this.options.display;
            } else {
                this.options.display = val;
                this.plot.refresh();
            }
        }

        /**
         * Get/Set enableSelect property.
         */
        enableSelect(val) {
            if (val === undefined) {
                return this.options.enableSelect;
            } else {
                this.options.enableSelect = val;
                if (this.options.enableSelect === false) {
                    _.each(this.boxes, (box) => {
                        box.selected = undefined;
                    });
                }
                this.plot.refresh();
            }
        }

        /**
         * Get/Set enableMove property.
         */
        enableMove(val) {
            if (val === undefined) {
                return this.options.enableMove;
            } else {
                this.options.enableMove = val;
                this.plot.refresh();
            }
        }

        /**
         * Get/Set enableResize property.
         */
        enableResize(val) {
            if (val === undefined) {
                return this.options.enableResize;
            } else {
                this.options.enableResize = val;
                this.plot.refresh();
            }
        }

        /**
         * Get list of all boxes.
         */
        getBoxes() {
            return this.boxes;
        }

        /**
         * Add a new box.
         *
         * @param {Object} box - the box to add
         
         * @param {Number} box.x - upper left corner x position of box
         * @param {Number} box.y - upper left corner y position of box
         * @param {Number} box.w - the width of the box along the x-dimension
         * @param {Number} box.h - the height of the box along the x-dimension
         * @param {string} box.text - a text label for the box
         * @param {Boolen} box.fill - true if you want the box to be filled in
         * @param {string} box.fillStyle - the fillStyle to use, defaults to strokeStyle
         * @param {string} box.strokeStyle - the strokeStyle to use, defaults to the default fore-ground color
         * @param {Number} box.alpha - the alpha transparency to use
         * @param {Number} box.lineWidth - the width for the box outline
         * @param {Boolen} box.absolutePlacement - true if you want the box x,y,w,h coordinates to be pixel instead of real
         * 
         * @returns the unique id for the box
         */
        addBox(box) {
            const Mx = this.plot._Mx;

            const _box = {
                x: box.x,
                y: box.y,
                w: box.w,
                h: box.h,
                text: box.text,
                id: common.uuidv4(),
                fill: box.fill,
                fillStyle: box.fillStyle,
                alpha: box.alpha,
                strokeStyle: box.strokeStyle,
                lineWidth: box.lineWidth,
                absolutePlacement: box.absolutePlacement,
            };
            // Handle deprecated options
            if (box.absolute_placement) {
                _box.absolutePlacement = box.absolute_placement;
            }
            this.boxes.push(_box);

            this.plot.redraw();

            const evt = document.createEvent('Event');
            evt.box = _box;
            evt.initEvent('boxadd', true, true);
            mx.dispatchEvent(Mx, evt);

            return _box.id;
        }

        /**
         * Brings a box to the front of the z-order
         * 
         * @param {string} id - the unique id of the box to remove
         */
        getSelectedBoxes() {
            const selectedBoxes = [];
            let box;
            let ii;
            for (ii = (this.boxes.length - 1); ii > -1; ii--) {
                box = this.boxes[ii];
                if (box.selected) {
                    selectedBoxes.push(box);
                }
            }
            return selectedBoxes;
        }

        /**
         * Brings a box to the front of the z-order
         * 
         * @param {string} id - the unique id of the box to remove
         */
        bringBoxToFront(id) {
            let box;
            let ii;
            for (ii = (this.boxes.length - 1); ii > -1; ii--) {
                box = this.boxes[ii];
                if (box.id === id) {
                    this.boxes.splice(ii, 1);
                    this.boxes.push(box);
                    break;
                }
            }
        }

        /**
         * Sends a box to the back of the z-order
         * 
         * @param {string} id - the unique id of the box to remove
         */
        sendBoxToBack(id) {
            let box;
            let ii;
            for (ii = (this.boxes.length - 1); ii > -1; ii--) {
                box = this.boxes[ii];
                if (box.id === id) {
                    this.boxes.splice(ii, 1);
                    this.boxes.splice(0, 0, box);
                    break;
                }
            }
        }

        /**
         * Removes a box.
         * 
         * @param {string} id - the unique id of the box to remove
         */
        removeBox(id) {
            const Mx = this.plot._Mx;

            let box;
            let ii;
            for (ii = (this.boxes.length - 1); ii > -1; ii--) {
                box = this.boxes[ii];
                if (box.id === id) {
                    this.boxes.splice(ii, 1);

                    const evt = document.createEvent('Event');
                    evt.box = box;
                    evt.initEvent('boxremove', true, true);
                    mx.dispatchEvent(Mx, evt);
                    // TODO - should we allow prevent default
                    // to block a box removal?
                    break;
                }
            }
            this.plot.redraw();
        }

        /**
         * Removes all boxes
         */
        clearBoxes() {
            const Mx = this.plot._Mx;

            let box;
            let ii;
            for (ii = (this.boxes.length - 1); ii > -1; ii--) {
                box = this.boxes[ii];
                this.boxes.splice(ii, 1);

                const evt = document.createEvent('Event');
                evt.box = box;
                evt.initEvent('boxremove', true, true);
                mx.dispatchEvent(Mx, evt);
            }
            this.plot.redraw();
        }

        //////////////////////////////////////////////////////////////////////
        // Deprecated APIs
        add_box(box) {
            return this.addBox(box);
        }

        remove_box(id) {
            return this.removeBox(id);
        }

        clear_boxes(box) {
            return this.clearBoxes();
        }

        //////////////////////////////////////////////////////////////////////
        // Internal Methods
        _getControlPoints(box) {
            // TODO verify this logic works correctly in all origins
            const rect = mx.real_box_to_pixel(this.plot._Mx, box.x, box.y, box.w, box.h);

            const ul = rect.ul;
            const lr = rect.lr;
            const ll = {
                x: ul.x,
                y: lr.y
            };
            const ur = {
                x: lr.x,
                y: ul.y
            };
            // mid-points
            const um = {
                x: (ul.x + lr.x) / 2,
                y: ul.y
            };
            const lm = {
                x: (ul.x + lr.x) / 2,
                y: lr.y
            };
            const ml = {
                x: ul.x,
                y: (ul.y + lr.y) / 2
            };
            const mr = {
                x: lr.x,
                y: (ul.y + lr.y) / 2
            };

            return {
                ul: ul,
                lr: lr,
                ll: ll,
                ur: ur,
                um: um,
                lm: lm,
                ml: ml,
                mr: mr
            };
        }

        // Checks if the xpos/ypos is within a box
        _isWithinBox(xpos, ypos, box) {
            const rect = mx.real_box_to_pixel(this.plot._Mx, box.x, box.y, box.w, box.h);

            const in_x = (rect.ul.x <= xpos) && (xpos <= rect.lr.x);
            const in_y = (rect.ul.y <= ypos) && (ypos <= rect.lr.y);

            return (in_x && in_y);
        }

        // Checks if the xpos/ypos is over a box control point
        _isOverControlPoint(xpos, ypos, box) {
            const controlPoints = this._getControlPoints(box);
            for (const [key, value] of Object.entries(controlPoints)) {
                const dist_x = Math.abs(value.x - xpos);
                const dist_y = Math.abs(value.y - ypos);
                if ((dist_x < 5) && (dist_y < 5)) {
                    return key;
                }
            }
            return null;
        }

        // TODO convert this to using real-world coordinates
        _selectBoxes(xpos, ypos, multi_select) {
            // See if the mouse is within any boxes
            const boxes_selected = [];
            for (let ii = (this.boxes.length - 1); ii > -1; ii--) {
                const box = this.boxes[ii];
                const rect = mx.real_box_to_pixel(this.plot._Mx, box.x, box.y, box.w, box.h);

                const in_x = (rect.ul.x <= xpos) && (xpos <= rect.lr.x);
                const in_y = (rect.ul.y <= ypos) && (ypos <= rect.lr.y);
                if ((multi_select || boxes_selected.length === 0) && (in_x && in_y)) {
                    boxes_selected.push(box);
                    if (this.options.enableSelect) {
                        box.selected = true;
                    }
                } else if (multi_select || this._isOverControlPoint(xpos, ypos, box)) {
                    boxes_selected.push(box);
                    if (this.options.enableSelect) {
                        box.selected = true;
                    }
                } else {
                    box.selected = undefined;
                }
            }
            return boxes_selected;
        }

        // Mouse down handler
        _onMouseDown(evt) {
            const Mx = this.plot._Mx;

            // we never intercept middle mouse for boxes
            if (evt.which === 2) {
                return;
            }

            // If there are no boxes, nothing to do
            if (this.boxes.length === 0) {
                return;
            }

            // Or if the user wants to prevent a drag operation
            if (!this.options.enableSelect && !this.options.enableMove && !this.options.enableResize) {
                return;
            }

            // If the event is outside the plot entirely
            // we can just skip it
            if ((evt.xpos < Mx.l) || (evt.xpos > Mx.r)) {
                return;
            }
            if ((evt.ypos > Mx.b) || (evt.ypos < Mx.t)) {
                return;
            }

            // TODO - support multi-select
            // TODO - should a boxselect event happen on mousedown
            const boxes_selected = this._selectBoxes(evt.xpos, evt.ypos, false);
            if (boxes_selected.length > 0) {
                if (this.options.enableSelect) {
                    boxes_selected[0].selected = true;
                }
                let controlPoint;
                if (this.options.enableResize) {
                    controlPoint = this._isOverControlPoint(evt.xpos, evt.ypos, boxes_selected[0]);
                }
                this._selected = {
                    x: evt.x,
                    y: evt.y,
                    orig_box: Object.assign({}, boxes_selected[0]),
                    box: boxes_selected[0],
                    controlPoint: controlPoint,
                    which: evt.which,
                };

                // Prevent a rubber box from being drawn
                // but this also will prevent mtag events
                // TODO think about that more
                evt.preventDefault();
            }
        }

        _onMouseMove(evt) {
            const Mx = this.plot._Mx;

            // Ignore if there are no boxes
            if (this.boxes.length === 0) {
                return;
            }

            // Or if the user wants to prevent a drag operation
            if (!this.options.enableMove && !this.options.enableResize) {
                return;
            }

            // Ignore if the mouse is outside of the plot area
            if ((evt.xpos < Mx.l) || (evt.xpos > Mx.r)) {
                return;
            }
            if ((evt.ypos > Mx.b) || (evt.ypos < Mx.t)) {
                return;
            }

            // If we aren't dragging, then there is nothing else to do
            if (this._selected && this._selected.which === 1) {
                // If we are dragging, update the box size/location
                const pos = mx.pixel_to_real(Mx, evt.xpos - this._selected.xpos, evt.ypos - this._selected.ypos);
                const xdelta = (evt.x - this._selected.x);
                const ydelta = (evt.y - this._selected.y);

                if (this.options.enableMove) {
                    if (!this._selected.controlPoint) {
                        // we are moving the entire box by how much the mouse moved after mouse down
                        this._selected.box.x = this._selected.orig_box.x + xdelta;
                        this._selected.box.y = this._selected.orig_box.y + ydelta;
                    }
                }

                if (this.options.enableResize) {
                    if ((this._selected.controlPoint === "ul") || (this._selected.controlPoint === "um") || (this._selected.controlPoint === "ur")) {
                        if ((Mx.origin === 1) || (Mx.origin === 2)) {
                            // regular y
                            this._selected.box.y = this._selected.orig_box.y + ydelta;
                            this._selected.box.h = this._selected.orig_box.h + ydelta;
                        } else {
                            // inverted y
                            this._selected.box.y = this._selected.orig_box.y + ydelta;
                            this._selected.box.h = this._selected.orig_box.h - ydelta;
                        }
                    } else if ((this._selected.controlPoint === "ll") || (this._selected.controlPoint === "lm") || (this._selected.controlPoint === "lr")) {
                        if ((Mx.origin === 1) || (Mx.origin === 2)) {
                            // regular y
                            this._selected.box.h = this._selected.orig_box.h - ydelta;
                        } else {
                            // inverted y
                            this._selected.box.h = this._selected.orig_box.h + ydelta;
                        }
                    }

                    if ((this._selected.controlPoint === "ul") || (this._selected.controlPoint === "ml") || (this._selected.controlPoint === "ll")) {
                        if ((Mx.origin === 1) || (Mx.origin === 4)) {
                            // regular x
                            this._selected.box.x = this._selected.orig_box.x + xdelta;
                            this._selected.box.w = this._selected.orig_box.w - xdelta;
                        } else {
                            // inverted x
                            this._selected.box.x = this._selected.orig_box.x + xdelta;
                            this._selected.box.x = this._selected.orig_box.w - xdelta;
                        }
                    } else if ((this._selected.controlPoint === "ur") || (this._selected.controlPoint === "mr") || (this._selected.controlPoint === "lr")) {
                        if ((Mx.origin === 1) || (Mx.origin === 4)) {
                            // regular x
                            this._selected.box.w = this._selected.orig_box.w + xdelta;
                        } else {
                            // inverted x
                            this._selected.box.w = this._selected.orig_box.w - xdelta;
                        }
                    }
                }

                // Refresh the plugin
                this.plot.redraw();
                // Prevent any other plot default action at this point
                evt.preventDefault();
            } else {
                // If a box isn't currently selected, then when the mouse is over a
                // control point highlight the box
                let box, controlPoint, withinBox;
                let ii;
                let cursor = "default";
                for (ii = 0; ii < this.boxes.length; ii++) {
                    box = this.boxes[ii];
                    withinBox = this._isWithinBox(evt.xpos, evt.ypos, box);

                    // Check if we are within the box and move is enabled
                    if (withinBox && this.options.enableMove) {
                        cursor = "move";
                    }

                    // Then check for control points, which take priority over movement action
                    controlPoint = this._isOverControlPoint(evt.xpos, evt.ypos, box);
                    if (controlPoint && this.options.enableResize) {
                        // TODO change cursor
                        if ((controlPoint === 'ul') || (controlPoint === 'lr')) {
                            cursor = "nw-resize";
                        } else if ((controlPoint === 'll') || (controlPoint === 'ur')) {
                            cursor = "ne-resize";
                        } else if ((controlPoint === 'lm') || (controlPoint === 'um')) {
                            cursor = "ns-resize";
                        } else if ((controlPoint === 'ml') || (controlPoint === 'mr')) {
                            cursor = "ew-resize";
                        }
                        box.highlight = true;
                    } else if (!controlPoint && box.highlight) {
                        box.highlight = undefined;
                    }
                }
                if (cursor !== Mx.root.style.cursor) {
                    Mx.root.style.cursor = cursor;
                }
                this.plot.redraw();
            }
        }

        // Mouse click handler
        _onMouseClick(evt) {
            const Mx = this.plot._Mx;
            let allowDefault = true;
            // the box is handling this, so prevent default actions
            if (this.options.enableSelect || this.options.enableMove || this.options.enableResize) {
                if (!this._selected) {
                    const boxes_selected = this._selectBoxes(evt.xpos, evt.ypos, false);
                    if (boxes_selected.length > 0) {
                        if (this.options.enableSelect) {
                            boxes_selected[0].selected = true;
                        }
                        let controlPoint;
                        if (this.options.enableResize) {
                            controlPoint = this._isOverControlPoint(evt.xpos, evt.ypos, boxes_selected[0]);
                        }
                        this._selected = {
                            x: evt.x,
                            y: evt.y,
                            orig_box: Object.assign({}, boxes_selected[0]),
                            box: boxes_selected[0],
                            controlPoint: controlPoint,
                            which: evt.which,
                        };
                    }
                }

                const selected = this._selected;
                if (!selected) {
                    return;
                }
                this._selected = undefined;

                const move_dist = mx.real_distance_to_pixel(
                    this.plot._Mx,
                    selected.orig_box.x,
                    selected.orig_box.y,
                    selected.box.x,
                    selected.box.y
                );

                const size_dist = mx.real_distance_to_pixel(
                    this.plot._Mx,
                    selected.orig_box.x + selected.orig_box.w,
                    selected.orig_box.y + selected.orig_box.h,
                    selected.box.x + selected.box.w,
                    selected.box.y + selected.box.h
                );

                if ((Math.abs(move_dist.x) > 3) || (Math.abs(move_dist.y) > 3) || (Math.abs(size_dist.x) > 3) || (Math.abs(size_dist.y) > 3)) {
                    // If the control point has been dragged causing negative w/h adjust the box
                    if (selected.box.w < 0) {
                        if ((Mx.origin === 1) || (Mx.origin === 4)) {
                            // Regular x
                            selected.box.x = selected.box.x + selected.box.w;
                            selected.box.w = Math.abs(selected.box.w);
                        } else {
                            // Inverted x
                            selected.box.x = selected.box.x - selected.box.w;
                            selected.box.w = Math.abs(selected.box.w);
                        }
                    }
                    if (selected.box.h < 0) {
                        if ((Mx.origin === 1) || (Mx.origin === 2)) {
                            // Regular y
                            selected.box.y = selected.box.y - selected.box.h;
                            selected.box.h = Math.abs(selected.box.h);
                        } else {
                            // Inverted y
                            selected.box.y = selected.box.y + selected.box.h;
                            selected.box.h = Math.abs(selected.box.h);
                        }
                    }

                    // Only issue box move if the box has moved
                    const sevt = document.createEvent('Event');
                    sevt.source = this;
                    sevt.box = selected.box;
                    sevt.action = evt.type;
                    sevt.initEvent('boxmove', true, true);
                    mx.dispatchEvent(Mx, sevt);
                    evt.preventDefault();
                    this.plot.redraw();
                    return; // TODO should a boxmove also emit a boxselect?
                } else {
                    // Restore the original box x,y,w,h to avoid slight movement that doesn't cause boxmove
                    // to change things
                    selected.box.x = selected.orig_box.x;
                    selected.box.y = selected.orig_box.y;
                    selected.box.w = selected.orig_box.w;
                    selected.box.h = selected.orig_box.h;
                }

                const selected_boxes = [selected.box];
                if (this._clickTimer) {
                    clearTimeout(this._clickTimer);
                }

                if ((selected_boxes.length > 0) && (this.options.enableSelect)) {
                    // If a box is selected we need to stop other actions (i.e. unzoom)
                    // that might be associated with the 'mup' event
                    evt.preventDefault();
                    allowDefault = false;
                    this._clickTimer = setTimeout(() => {
                        const sevt = document.createEvent('Event');
                        sevt.source = this;
                        sevt.boxes = selected_boxes;
                        sevt.action = evt.type;
                        sevt.which = evt.which;
                        sevt.initEvent('boxselect', true, true);

                        mx.dispatchEvent(Mx, sevt);

                        this.plot.redraw();
                    }, 200);
                }
            }
            // After a click is finished, we no longer track the internal select state for move/drag
            this._selected = undefined;
            return allowDefault;
        }

        //////////////////////////////////////////////////////////////////////
        // Implementation of Plugin API

        /**
         * Return the Plugin menu to be contributed to the SigPlot main menu.
         */
        menu() {
            return {
                text: "Boxes...",
                menu: {
                    title: "BOXES",
                    items: [{
                        text: "Display",
                        checked: this.display(),
                        style: "checkbox",
                        handler: () => this.display(!this.display())
                    }, {
                        text: "Enable Select",
                        checked: this.enableSelect(),
                        style: "checkbox",
                        handler: () => this.enableSelect(!this.enableSelect())
                    }, {
                        text: "Enable Move",
                        checked: this.enableMove(),
                        style: "checkbox",
                        handler: () => this.enableMove(!this.enableMove())
                    }, {
                        text: "Enable Resize",
                        checked: this.enableResize(),
                        style: "checkbox",
                        handler: () => this.enableResize(!this.enableResize())
                    }, {
                        text: "Clear All",
                        handler: () => this.clearBoxes()
                    }]
                }
            };
        }

        /**
         * Refresh the plugin by drawing upon the plot canvas.
         * 
         * @param {canvas} canvas 
         */
        refresh(canvas) {
            // Quick abort if we have nothing to do
            if ((!this.options.display) || (this.boxes.length === 0)) {
                return;
            }

            // Handy constants for short-hand access within refresh
            const Gx = this.plot._Gx;
            const Mx = this.plot._Mx;
            const ctx = canvas.getContext("2d");

            if ((Gx.x_cut_press_on || Gx.y_cut_press_on)) {
                return;
            }

            // Save off the current context
            ctx.save();

            // Clip all drawing to the plot area
            ctx.beginPath();
            ctx.rect(Mx.l, Mx.t, Mx.r - Mx.l, Mx.b - Mx.t);
            ctx.clip();

            // Draw the boxes themselves
            //   Use for loop and variables outside of the loop scope
            //   to ensure good performance across browsers the optimize poorly
            let box;
            let x, y, w, h;
            let text_w;
            let ii;
            for (ii = 0; ii < this.boxes.length; ii++) {
                box = this.boxes[ii];

                if ((box.absolutePlacement === true) || (this.options.absolutePlacement === true)) {
                    x = box.x + Mx.l;
                    y = box.y + Mx.t;
                    w = box.w;
                    h = box.h;
                } else {
                    const rect = mx.real_box_to_pixel(this.plot._Mx, box.x, box.y, box.w, box.h);

                    x = rect.ul.x;
                    y = rect.ul.y;
                    w = rect.w;
                    h = rect.h;
                }

                ctx.strokeStyle = box.strokeStyle || this.options.strokeStyle || Mx.fg;
                ctx.lineWidth = box.lineWidth || this.options.lineWidth;

                // A highlighed box has a thicker line
                if (box.highlight) {
                    ctx.lineWidth += 2;
                }

                // If the line width is odd, add half a pixel offset so it renders
                // cleanly
                if (ctx.lineWidth % 2 === 1) {
                    x += 0.5;
                    y += 0.5;
                }

                // If the box needs to be filed, draw the fill first
                if (box.fill || box.selected || this.options.fill) {
                    ctx.globalAlpha = box.alpha || this.options.alpha;
                    ctx.fillStyle = box.fillStyle || this.options.fillStyle || ctx.strokeStyle;
                    ctx.fillRect(x, y, w, h);
                    ctx.globalAlpha = 1;
                }

                // Now draw the box
                ctx.strokeRect(x,
                    y,
                    w,
                    h);

                // Draw control points if necessary
                if (this.options.enableResize) {
                    ctx.strokeStyle = box.strokeStyle || this.options.strokeStyle || Mx.fg;
                    ctx.fillStyle = box.strokeStyle || this.options.strokeStyle || Mx.fg;

                    ctx.fillRect(x - 3, y - 3, 6, 6); // ul
                    ctx.fillRect(x + w - 3, y - 3, 6, 6); // ur
                    ctx.fillRect(x + w - 3, y + h - 3, 6, 6); // lr
                    ctx.fillRect(x - 3, y + h - 3, 6, 6); // ll

                    ctx.fillRect(x + (w / 2) - 3, y - 3, 6, 6); // um
                    ctx.fillRect(x + (w / 2) - 3, y + h - 3, 6, 6); // lm
                    ctx.fillRect(x - 3, y + (h / 2) - 3, 6, 6); // ml
                    ctx.fillRect(x + w - 3, y + (h / 2) - 3, 6, 6); // mr
                }

                // Render text
                if (box.text) {
                    ctx.save();
                    ctx.font = box.font || this.options.font || Mx.text_h + "px Courier New, monospace";
                    ctx.globalAlpha = 1;
                    ctx.textAlign = "end";
                    ctx.fillStyle = box.strokeStyle || this.options.strokeStyle || Mx.fg;

                    // the capital M is typically the same height and width
                    let letter_w = ctx.measureText("M").width;
                    x = x - letter_w;
                    y = y - (letter_w / 3);

                    text_w = ctx.measureText(box.text).width;

                    if ((x - text_w) < Mx.l) {
                        x = (x + w);
                    }

                    ctx.fillText(box.text, x, y);
                    ctx.restore();
                }
            }

            ctx.restore();
        }

        dispose() {
            this.plot.removeListener("mdown", this._onMouseDown);
            this.plot.removeListener("mmove", this._onMouseMove);
            this.plot.removeListener("mup", this._onMouseClick);
            this.plot.removeListener("mdblclick", this._onMouseClick);
            // listen for document mouse up to handle situations where
            // a user is dragging the mouse out of the plot area

            this.plot = undefined;
            this.boxes = [];
            if (this._clickTimer) {
                clearTimeout(this._clickTimer);
            }
        }
    }

    module.exports = BoxesPlugin;

}());
