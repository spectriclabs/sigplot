/**
 * @license
 * File: sigplot.slider.ts
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

import m from "./m.js";
import mx from "./mx.js";
import common from "./common.js";
import type { CanvasStyle } from "./types.js";

export interface SliderPluginOptions {
    display?: boolean;
    style?: {
        lineWidth?: number;
        lineCap?: CanvasLineCap;
        strokeStyle?: CanvasStyle;
        textStyle?: CanvasStyle;
    };
    direction?: "vertical" | "horizontal" | "both";
    name?: string;
    prevent_drag?: boolean;
    add_box?: boolean;
    persistent_style?: boolean;
    slider_ID?: number;
}

export interface SliderPosition {
    x?: number;
    y?: number;
}

interface PlotMouseEvent extends Event {
    x: number;
    y: number;
    xpos: number;
    ypos: number;
    which: number;
    preventDefault(): void;
    slider_drag?: boolean;
}

class SliderPlugin {
    options: {
        display: boolean;
        style: {
            lineWidth: number;
            lineCap: CanvasLineCap;
            strokeStyle?: CanvasStyle;
            textStyle?: CanvasStyle;
        };
        direction: "vertical" | "horizontal" | "both";
        name: string;
        prevent_drag: boolean;
        add_box: boolean;
        persistent_style: boolean;
        slider_ID: number;
    };
    position: number | SliderPosition | undefined;
    location: number | SliderPosition | undefined;
    name: string;
    paired_slider: SliderPlugin | undefined;
    dragging: boolean;
    highlight: boolean;
    plot: any; // TODO: Type as SigPlot instance

    constructor(options: SliderPluginOptions = {}) {
        this.options = {
            display: true,
            style: {
                lineWidth: 1,
                lineCap: "square" as CanvasLineCap
            },
            direction: "vertical",
            name: "Slider",
            prevent_drag: false,
            add_box: false,
            persistent_style: false,
            slider_ID: 0
        };

        common.update(this.options, options);
        this.position = undefined;
        this.location = undefined;
        this.paired_slider = undefined;
        this.name = this.options.name;
        this.dragging = false;
        this.highlight = false;
    }

    init(plot: any): void {
        // TODO: Type plot parameter
        this.plot = plot;
        const Mx = plot._Mx;

        // Bind once so the same reference is used for add and remove
        this.onmousemove = this.onmousemove.bind(this);
        this.onmousedown = this.onmousedown.bind(this);
        this.onmouseup = this.onmouseup.bind(this);

        // Register for mouse events
        plot.addListener("mmove", this.onmousemove);
        plot.addListener("mdown", this.onmousedown);
        plot.addListener("mup", this.onmouseup);
    }

    onmousemove(evt: PlotMouseEvent): void {
        // Ignore if the slider isn't even visible
        if (this.location === undefined) {
            return;
        }

        // Or if the user wants to prevent a drag operation
        if (this.options.prevent_drag) {
            return;
        }

        const Mx = this.plot._Mx;

        // Ignore if the mouse is outside of the plot area
        if (evt.xpos < Mx.l || evt.xpos > Mx.r) {
            this.set_highlight(false);
            return;
        }
        if (evt.ypos > Mx.b || evt.ypos < Mx.t) {
            this.set_highlight(false);
            return;
        }

        // If the mouse is close, "highlight" the line
        const lineWidth = this.options.style.lineWidth;

        // If we aren't dragging, then there is nothing else to do
        if (!this.dragging) {
            if (Mx.warpbox) {
                return;
            } // Don't highlight if a warpbox is being drawn
            if (this.options.direction === "vertical") {
                if (Math.abs((this.location as number) - evt.xpos) < lineWidth + 5) {
                    this.set_highlight(true);
                } else {
                    this.set_highlight(false);
                }
            } else if (this.options.direction === "horizontal") {
                if (Math.abs((this.location as number) - evt.ypos) < lineWidth + 5) {
                    this.set_highlight(true);
                } else {
                    this.set_highlight(false);
                }
            } else if (this.options.direction === "both") {
                const location = this.location as SliderPosition;
                if (
                    Math.abs(location.x! - evt.xpos) < lineWidth + 5 &&
                    Math.abs(location.y! - evt.ypos) < lineWidth + 5
                ) {
                    this.set_highlight(true);
                } else {
                    this.set_highlight(false);
                }
            }
            return;
        }

        // Otherwise, update the position...
        if (this.options.direction === "vertical") {
            this.location = evt.xpos;
            this.position = mx.pixel_to_real(Mx, evt.xpos, 0).x;
        } else if (this.options.direction === "horizontal") {
            this.location = evt.ypos;
            this.position = mx.pixel_to_real(Mx, 0, evt.ypos).y;
        } else if (this.options.direction === "both") {
            const rp = mx.pixel_to_real(Mx, evt.xpos, evt.ypos);
            this.location = { x: evt.xpos, y: evt.ypos };
            this.position = { x: rp.x, y: rp.y };
        }

        // Refresh the plugin
        this.plot.redraw();
        // Prevent any other plot default action at this point
        evt.preventDefault();
    }

    onmousedown(evt: PlotMouseEvent): void {
        if (this.location === undefined) {
            return;
        }

        // Or if the user wants to prevent a drag operation
        if (this.options.prevent_drag) {
            return;
        }

        const Mx = this.plot._Mx;

        if (evt.xpos < Mx.l || evt.xpos > Mx.r) {
            return;
        }
        if (evt.ypos > Mx.b || evt.ypos < Mx.t) {
            return;
        }

        if (evt.slider_drag) {
            return;
        }

        const lineWidth = this.options.style.lineWidth;
        if (this.options.direction === "vertical") {
            if (Math.abs((this.location as number) - evt.xpos) < lineWidth + 5) {
                this.dragging = true;
                evt.slider_drag = true;
                evt.preventDefault();
            }
        } else if (this.options.direction === "horizontal") {
            if (Math.abs((this.location as number) - evt.ypos) < lineWidth + 5) {
                this.dragging = true;
                evt.slider_drag = true;
                evt.preventDefault();
            }
        } else if (this.options.direction === "both") {
            const location = this.location as SliderPosition;
            if (Math.abs(location.x! - evt.xpos) < lineWidth + 5 && Math.abs(location.y! - evt.ypos) < lineWidth + 5) {
                this.dragging = true;
                evt.slider_drag = true;
                evt.preventDefault();
            }
        }
    }

    onmouseup(evt: PlotMouseEvent): void {
        if (this.dragging) {
            evt.preventDefault();
            this.dragging = false;

            // Dispatch slidertag event
            const slidertag_evt = document.createEvent("Event") as any;
            slidertag_evt.source = this;
            slidertag_evt.location = this.location;
            slidertag_evt.position = this.position;
            slidertag_evt.initEvent("slidertag", true, true);
            mx.dispatchEvent(this.plot._Mx, slidertag_evt);

            // Dispatch sliderdrag event
            const sliderdrag_evt = document.createEvent("Event") as any;
            sliderdrag_evt.source = this;
            sliderdrag_evt.location = this.location;
            sliderdrag_evt.position = this.position;
            sliderdrag_evt.initEvent("sliderdrag", true, true);
            mx.dispatchEvent(this.plot._Mx, sliderdrag_evt);
        }
    }

    menu(): any {
        // TODO: Type return value
        return {
            text: "Slider...",
            menu: {
                title: "Slider",
                items: [
                    {
                        text: "Remove",
                        handler: () => {
                            this.plot.remove_plugin(this);
                        }
                    }
                ]
            }
        };
    }

    addListener(what: string, callback: Function): void {
        this.plot._Mx.addEventListener(what, callback, false);
    }

    removeListener(what: string, callback: Function): void {
        this.plot._Mx.removeEventListener(what, callback, false);
    }

    pair(other_slider: SliderPlugin): void {
        this.paired_slider = other_slider;
    }

    set_highlight(ishighlight: boolean): void {
        if (ishighlight !== this.highlight) {
            this.highlight = ishighlight;
            this.plot.redraw();
        }
    }

    set_position(position: number | SliderPosition): void {
        if (this.options.direction === "both") {
            position = position ? JSON.parse(JSON.stringify(position)) : undefined;
        }

        this.position = position;
        if (this.position !== undefined) {
            const Mx = this.plot._Mx;
            if (this.options.direction === "vertical") {
                this.location = mx.real_to_pixel(Mx, this.position as number, 0).x;
            } else if (this.options.direction === "horizontal") {
                this.location = mx.real_to_pixel(Mx, 0, this.position as number).y;
            } else if (this.options.direction === "both") {
                const pos = this.position as SliderPosition;
                const pp = mx.real_to_pixel(Mx, pos.x || 0, pos.y || 0);
                this.location = { x: pp.x, y: pp.y };
            }
        } else {
            this.location = undefined;
        }

        // Emit slidertag event
        const slidertag_evt = document.createEvent("Event") as any;
        slidertag_evt.source = this;
        slidertag_evt.location = this.location;
        slidertag_evt.position = this.position;
        slidertag_evt.initEvent("slidertag", true, true);
        mx.dispatchEvent(this.plot._Mx, slidertag_evt);
    }

    set_location(location: number | SliderPosition): void {
        if (this.options.direction === "both") {
            location = location ? JSON.parse(JSON.stringify(location)) : undefined;
        }

        this.location = location;
        if (this.location !== undefined) {
            const Mx = this.plot._Mx;
            if (this.options.direction === "vertical") {
                this.position = mx.pixel_to_real(Mx, this.location as number, 0).x;
            } else if (this.options.direction === "horizontal") {
                this.position = mx.pixel_to_real(Mx, 0, this.location as number).y;
            } else if (this.options.direction === "both") {
                const loc = this.location as SliderPosition;
                const rp = mx.pixel_to_real(Mx, loc.x || 0, loc.y || 0);
                this.position = { x: rp.x, y: rp.y };
            }
        } else {
            this.position = undefined;
        }

        // Emit slidertag event
        const slidertag_evt = document.createEvent("Event") as any;
        slidertag_evt.source = this;
        slidertag_evt.location = this.location;
        slidertag_evt.position = this.position;
        slidertag_evt.initEvent("slidertag", true, true);
        mx.dispatchEvent(this.plot._Mx, slidertag_evt);
    }

    get_position(): number | SliderPosition | undefined {
        return this.position;
    }

    get_location(): number | SliderPosition | undefined {
        return this.location;
    }

    refresh(canvas: HTMLCanvasElement): void {
        if (!this.options.display) {
            return;
        }

        const Mx = this.plot._Mx;
        const ctx = canvas.getContext("2d")!;

        ctx.save();
        ctx.beginPath();
        ctx.rect(Mx.l, Mx.t, Mx.r - Mx.l, Mx.b - Mx.t);
        ctx.clip();

        ctx.lineWidth = this.options.style.lineWidth;
        ctx.lineCap = this.options.style.lineCap;
        ctx.strokeStyle = this.options.style.strokeStyle || Mx.fg;

        // Draw the line
        if (this.location !== undefined) {
            if (this.highlight || this.dragging) {
                ctx.lineWidth = ctx.lineWidth * 1.2;
            }

            ctx.beginPath();
            if (this.options.direction === "vertical") {
                const x = this.location as number;
                ctx.moveTo(x, Mx.t);
                ctx.lineTo(x, Mx.b);
            } else if (this.options.direction === "horizontal") {
                const y = this.location as number;
                ctx.moveTo(Mx.l, y);
                ctx.lineTo(Mx.r, y);
            } else if (this.options.direction === "both") {
                const location = this.location as SliderPosition;
                const x = location.x!;
                const y = location.y!;
                ctx.moveTo(x, Mx.t);
                ctx.lineTo(x, Mx.b);
                ctx.moveTo(Mx.l, y);
                ctx.lineTo(Mx.r, y);
            }
            ctx.stroke();
        }

        // Draw position text and optional bounding box
        if (this.position !== undefined && (this.highlight || this.dragging || this.options.persistent_style)) {
            ctx.font = Mx.text_h + "px monospace";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = this.options.style.textStyle || Mx.fg;

            let text: string;
            if (this.options.direction === "both") {
                const pos = this.position as SliderPosition;
                text = "(" + mx.format_g(pos.x || 0, 6, 3, true) + "," + mx.format_g(pos.y || 0, 6, 3, true) + ")";
            } else {
                text = mx.format_g(this.position as number, 6, 3, true);
            }

            const textWidth = ctx.measureText(text).width;
            const textHeight = Mx.text_h;

            let textX: number, textY: number;

            if (this.options.direction === "vertical") {
                const x = this.location as number;
                textX = x + 5;
                textY = Mx.t + textHeight + this.options.slider_ID * textHeight;

                if (textX + textWidth > Mx.r) {
                    textX = x - textWidth - 5;
                }
            } else if (this.options.direction === "horizontal") {
                const y = this.location as number;
                textX = Mx.l + 5;
                textY = y - 5 - this.options.slider_ID * textHeight;

                if (textY < Mx.t) {
                    textY = y + textHeight + 5;
                }
            } else if (this.options.direction === "both") {
                const location = this.location as SliderPosition;
                textX = location.x! + 5;
                textY = location.y! - 5 - this.options.slider_ID * textHeight;
            }

            // Draw bounding box if requested
            if (this.options.add_box) {
                ctx.fillStyle = Mx.bg;
                ctx.fillRect(textX! - 2, textY! - textHeight, textWidth + 4, textHeight + 2);
                ctx.strokeStyle = this.options.style.strokeStyle || Mx.fg;
                ctx.strokeRect(textX! - 2, textY! - textHeight, textWidth + 4, textHeight + 2);
            }

            ctx.fillStyle = this.options.style.textStyle || Mx.fg;
            ctx.fillText(text, textX!, textY!);
        }

        // Draw connection to paired slider if present
        if (this.paired_slider && this.paired_slider.location !== undefined) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = this.options.style.strokeStyle || Mx.fg;

            if (this.options.direction === "vertical" && this.paired_slider.options.direction === "vertical") {
                const x1 = this.location as number;
                const x2 = this.paired_slider.location as number;
                const y = (Mx.t + Mx.b) / 2;

                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.stroke();

                // Draw delta text
                const delta = Math.abs((this.position as number) - (this.paired_slider.position as number));
                const deltaText = "Δ=" + mx.format_g(delta, 6, 3, true);
                const deltaX = (x1 + x2) / 2;
                ctx.fillText(deltaText, deltaX, y - 5);
            } else if (
                this.options.direction === "horizontal" &&
                this.paired_slider.options.direction === "horizontal"
            ) {
                const y1 = this.location as number;
                const y2 = this.paired_slider.location as number;
                const x = (Mx.l + Mx.r) / 2;

                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();

                // Draw delta text
                const delta = Math.abs((this.position as number) - (this.paired_slider.position as number));
                const deltaText = "Δ=" + mx.format_g(delta, 6, 3, true);
                const deltaY = (y1 + y2) / 2;
                ctx.fillText(deltaText, x + 5, deltaY);
            } else if (this.options.direction === "both" && this.paired_slider.options.direction === "both") {
                const loc1 = this.location as SliderPosition;
                const loc2 = this.paired_slider.location as SliderPosition;
                const pos1 = this.position as SliderPosition;
                const pos2 = this.paired_slider.position as SliderPosition;

                const x_center = (loc1.x! + loc2.x!) / 2;
                const y_center = (loc1.y! + loc2.y!) / 2;

                ctx.beginPath();
                ctx.moveTo(loc1.x!, loc1.y!);
                ctx.lineTo(loc2.x!, loc2.y!);
                ctx.stroke();

                // Draw delta text
                const delta_x = Math.abs(pos1.x! - pos2.x!);
                const delta_y = Math.abs(pos1.y! - pos2.y!);
                const deltaText =
                    "Δ(" + mx.format_g(delta_x, 6, 3, true) + "," + mx.format_g(delta_y, 6, 3, true) + ")";
                ctx.fillText(deltaText, x_center + 5, y_center - 5);
            }
        }

        ctx.restore();
    }

    dispose(): void {
        this.plot.removeListener("mmove", this.onmousemove);
        this.plot.removeListener("mdown", this.onmousedown);
        this.plot.removeListener("mup", this.onmouseup);
        document.removeEventListener("mouseup", this.onmouseup as any, false);

        this.plot = undefined;
        this.position = undefined;
    }
}

export default SliderPlugin;
