/**
 * @license
 * File: sigplot.playback.ts
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

import mx from "./mx.js";
import common from "./common.js";
import type { MxContext, CanvasStyle, PixelPoint } from "./types.js";

type PlaybackState = "paused" | "playing";

interface PlaybackOptions {
    display: boolean;
    size: number;
    lineWidth: number;
    fillStyle: CanvasStyle | false;
    strokeStyle?: CanvasStyle;
    position?: PixelPoint;
}

// TODO: plot type should be the SigPlot class once migrated
interface PlaybackPlot {
    _Mx: MxContext;
    _Gx: any;
    addListener(what: string, callback: (evt: any) => void): void;
    removeListener(what: string, callback: (evt: any) => void): void;
    redraw(): void;
    refresh(): void;
}

class PlaybackControlsPlugin {
    options: PlaybackOptions;
    state: PlaybackState;
    highlight: boolean;
    plot: PlaybackPlot | undefined;
    private onmousemove: ((evt: any) => void) | undefined;
    private onmousedown: ((evt: any) => void) | undefined;
    private onmouseclick: ((evt: any) => void) | undefined;

    constructor(options?: Partial<PlaybackOptions>) {
        this.options = {
            display: true,
            size: 25,
            lineWidth: 2,
            fillStyle: false
        };
        if (options) {
            common.update(this.options, options);
        }
        this.state = "paused";
        this.highlight = false;
    }

    init(plot: PlaybackPlot): void {
        this.plot = plot;

        // Register for mouse events
        const self = this;
        const Mx = this.plot._Mx;
        this.onmousemove = function (evt: any): void {
            if (Mx.warpbox) {
                return;
            } // Don't highlight if a warpbox is being drawn

            // Ignore if the mouse is outside of the control area
            if (self.ismouseover(evt.xpos, evt.ypos)) {
                self.set_highlight(true);
            } else {
                self.set_highlight(false);
            }
        };
        this.plot.addListener("mmove", this.onmousemove);

        this.onmousedown = function (evt: any): void {
            if (Mx.warpbox) {
                return;
            } // Don't handle if a warpbox is being drawn

            // Ignore if the mouse is outside of the control area
            if (self.ismouseover(evt.xpos, evt.ypos)) {
                evt.preventDefault();
            }
        };
        // Prevents zooms and stuff from occuring
        this.plot.addListener("mdown", this.onmousedown);

        this.onmouseclick = function (evt: any): void {
            if (Mx.warpbox) {
                return;
            } // Don't handle if a warpbox is being drawn

            // Ignore if the mouse is outside of the control area
            if (self.ismouseover(evt.xpos, evt.ypos)) {
                self.toggle();
                evt.preventDefault();
            }
        };
        this.plot.addListener("mclick", this.onmouseclick);
    }

    set_highlight(ishighlight: boolean): void {
        if (ishighlight !== this.highlight) {
            this.highlight = ishighlight;
            this.plot!.redraw();
        }
    }

    toggle(new_state?: PlaybackState): void {
        if (!new_state) {
            if (this.state === "paused") {
                new_state = "playing";
            } else {
                new_state = "paused";
            }
        }

        if (new_state !== this.state) {
            if (this.plot) {
                const Mx = this.plot._Mx;
                const evt: any = document.createEvent("Event");
                evt.initEvent("playbackevt", true, true);
                evt.state = new_state;
                const executeDefault: boolean = mx.dispatchEvent(Mx, evt);
                if (executeDefault) {
                    this.state = new_state;
                }
                this.plot.redraw();
            }
        }
    }

    addListener(what: string, callback: (evt: any) => void): void {
        const Mx = this.plot!._Mx;
        mx.addEventListener(Mx, what, callback, false);
    }

    removeListener(what: string, callback: (evt: any) => void): void {
        const Mx = this.plot!._Mx;
        mx.removeEventListener(Mx, what, callback, false);
    }

    ismouseover(xpos: number, ypos: number): boolean {
        const position = this.position();
        const distance_from_ctr = Math.pow(xpos - position.x!, 2) + Math.pow(ypos - position.y!, 2);
        const R = this.options.size / 2;

        return distance_from_ctr < Math.pow(R, 2);
    }

    position(): { x: number | null; y: number | null } {
        if (this.options.position) {
            return this.options.position;
        } else if (this.plot) {
            const Mx = this.plot._Mx;
            const R = this.options.size / 2;
            return {
                x: Mx.l + R + this.options.lineWidth + 1,
                y: Mx.t + R + this.options.lineWidth + 1
            };
        } else {
            return {
                x: null,
                y: null
            };
        }
    }

    refresh(canvas: HTMLCanvasElement): void {
        if (!this.options.display) {
            return;
        }
        const Mx = this.plot!._Mx;

        const ctx = canvas.getContext("2d")!;

        ctx.lineWidth = this.options.lineWidth;
        let R = this.options.size / 2;

        if (this.highlight) {
            ctx.lineWidth += 2;
            R += 1;
        }

        const position = this.position();

        ctx.beginPath();
        ctx.arc(position.x!, position.y!, R - ctx.lineWidth, 0, Math.PI * 2, true);
        ctx.closePath();

        ctx.strokeStyle = (this.options.strokeStyle || Mx.fg) as string;
        ctx.stroke();

        if (this.options.fillStyle) {
            ctx.fillStyle = this.options.fillStyle as string;
            ctx.fill();
        }

        if (this.state === "paused") {
            const p1: PixelPoint = {
                x: R * 0.8,
                y: R * 0.56
            };
            const p2: PixelPoint = {
                x: R * 1.45,
                y: R
            };
            const p3: PixelPoint = {
                x: R * 0.8,
                y: R * 1.45
            };

            p1.x += position.x! - R;
            p2.x += position.x! - R;
            p3.x += position.x! - R;
            p1.y += position.y! - R;
            p2.y += position.y! - R;
            p3.y += position.y! - R;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();

            ctx.fillStyle = (this.options.strokeStyle || Mx.fg) as string;
            ctx.fill();
        } else {
            ctx.lineCap = "round";
            ctx.lineWidth = Math.floor(Math.min(1, this.options.size / 8));

            const p1a: PixelPoint = {
                x: R * 0.8,
                y: R / 2
            };
            const p2a: PixelPoint = {
                x: R * 0.8,
                y: R * 1.5
            };
            p1a.x += position.x! - R;
            p2a.x += position.x! - R;
            p1a.y += position.y! - R;
            p2a.y += position.y! - R;

            ctx.beginPath();
            ctx.moveTo(p1a.x, p1a.y);
            ctx.lineTo(p2a.x, p2a.y);
            ctx.closePath();
            ctx.stroke();

            const p1b: PixelPoint = {
                x: R + R / 5,
                y: R / 2
            };
            const p2b: PixelPoint = {
                x: R + R / 5,
                y: R * 1.5
            };
            p1b.x += position.x! - R;
            p2b.x += position.x! - R;
            p1b.y += position.y! - R;
            p2b.y += position.y! - R;

            ctx.beginPath();
            ctx.moveTo(p1b.x, p1b.y);
            ctx.lineTo(p2b.x, p2b.y);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    }

    dispose(): void {
        this.plot = undefined;
    }
}

export default PlaybackControlsPlugin;
