/**
 * @license
 * File: common.js
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
 *
 */

// ArrayBuffer.transfer polyfill (native in ES2024, needed for older browsers)
declare global {
    interface ArrayBufferConstructor {
        transfer?(source: ArrayBuffer, length: number): ArrayBuffer;
    }
}

if (!ArrayBuffer.transfer) {
    ArrayBuffer.transfer = function (source: ArrayBuffer, length: number): ArrayBuffer {
        if (!(source instanceof ArrayBuffer)) {
            throw new TypeError("Source must be an instance of ArrayBuffer");
        }
        if (length <= source.byteLength) {
            return source.slice(0, length);
        }
        var sourceView = new Uint8Array(source),
            destView = new Uint8Array(new ArrayBuffer(length));
        destView.set(sourceView);
        return destView.buffer;
    };
}

interface Common {
    dashOn(ctx: CanvasRenderingContext2D, on: number, off: number): boolean;
    dashOff(ctx: CanvasRenderingContext2D): void;
    getKeyCode(e: KeyboardEvent): number;
    setKeypressHandler(handler: (e: KeyboardEvent) => void): void;
    update<T extends Record<string, any>>(dst: T, src: Record<string, any>): T;
    debounce(func: (...args: any[]) => void, wait: number, immediate?: boolean): (...args: any[]) => void;
    uuidv4(): string;
}

var common: Common = {
    dashOn: function (ctx: CanvasRenderingContext2D, on: number, off: number): boolean {
        ctx.setLineDash([on, off]);
        return true;
    },

    dashOff: function (ctx: CanvasRenderingContext2D): void {
        ctx.setLineDash([]);
    },

    getKeyCode: function (e: KeyboardEvent): number {
        return e.charCode || e.keyCode;
    },

    setKeypressHandler: function (handler: (e: KeyboardEvent) => void): void {
        window.addEventListener("keypress", handler, false);
    },

    //Updates destination object with source values
    update: function update<T extends Record<string, any>>(dst: T, src: Record<string, any>): T {
        for (var prop in src) {
            var val = src[prop];
            if (typeof val === "object") {
                // recursive
                update(dst[prop], val);
            } else {
                (dst as Record<string, any>)[prop] = val;
            }
        }
        return dst; // return dst to allow method chaining
    },

    debounce: function debounce(
        func: (...args: any[]) => void,
        wait: number,
        immediate?: boolean
    ): (...args: any[]) => void {
        var timeout: ReturnType<typeof setTimeout> | null;
        return function (this: any) {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args as any);
                }
            };
            var callNow = immediate && !timeout;
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args as any);
            }
        };
    },

    uuidv4: function uuidv4(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
};

export default common;
