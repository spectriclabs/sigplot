/**
 * @license
 * File: sigplot.plugin.ts
 * Copyright (c) 2012-2019, LGS Innovations Inc., All rights reserved.
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
import type { MxContext, GxContext, MenuItem, Plot } from "./types.js";

/** Schema for a plugin property defined via defineProperty. */
export interface PropertyDefinition {
    defaultValue?: any;
    refreshOnChange?: boolean;
    readonly?: boolean;
    callback?: (value: any) => void;
    help?: string;
}

/** Internal event listener entry. */
export interface EventListenerEntry {
    cb: (...args: any[]) => void;
    ctx?: any;
}

class Plugin {
    initial_properties: Record<string, any> | undefined;
    properties: Record<string, any>;
    definedproperties: Record<string, PropertyDefinition>;
    _plot: Plot | undefined;
    _canvas: HTMLCanvasElement | undefined;
    _events: Record<string, EventListenerEntry[]> | undefined;

    // Dynamic property accessor methods added by defineProperty
    [key: string]: any;

    /**
     * Plugins implement pluginSetup to define properties (via this.defineProperty)
     * and any local variables.
     */
    pluginSetup(): void {}

    /**
     * Plugins implement pluginConstructor to define properties (via this.defineProperty)
     * and any local variables.
     */
    pluginConstructor(): void {}

    /**
     * pluginInit is called after the plugin has been added to a plot.
     */
    pluginInit(): void {}

    /**
     * pluginDispose is called after the plugin has been removed from a plot.
     */
    pluginDispose(): void {}

    /**
     * pluginRefresh is called whenever the plugin needs to redraw.
     *
     * Plugins should render their current state to this.canvas.
     */
    pluginRefresh(_canvas?: HTMLCanvasElement): void {}

    /**
     * pluginGetMenu is called to obtain the menu structure for the plugin.
     *
     * If a plugin does not have a menu, it does not need to implement this.
     */
    pluginGetMenu(): MenuItem[] | undefined {
        return undefined;
    }

    /**
     * Construct the plugin.
     *
     * @param properties - The properties for this plugin.
     */
    constructor(properties?: Record<string, any>) {
        this.initial_properties = properties;
        this.properties = {};
        this.definedproperties = {};

        this._plot = undefined;
        this._canvas = undefined;

        // All plugins have a display Property
        this.defineProperty("display", {
            defaultValue: true,
            refreshOnChange: true,
            help: "changes if the plugin is rendered on the plot or not"
        });

        this.pluginSetup();

        return this;
    }

    /**
     * Called when the plugin is added to the plot.
     *
     * @param plot - The plot the plugin is attached to
     * @param canvas - The canvas the plugin should render to
     */
    init(plot: Plot, canvas: HTMLCanvasElement): void {
        if (this._plot) {
            throw "Plugins can only be added to one plot at a time";
        }
        this._plot = plot;
        this._canvas = canvas;
        this.properties = {};

        // When a plugin is added to a plot, its properties are reset
        // to the initial values provided during construction.
        this.resetProperties(this.initial_properties);

        this.pluginInit();
    }

    get plot(): Plot | undefined {
        return this._plot;
    }

    get Mx(): MxContext | null {
        return this._plot ? this._plot._Mx : null;
    }

    get Gx(): GxContext | null {
        return this._plot ? this._plot._Gx : null;
    }

    get canvas(): HTMLCanvasElement | undefined {
        return this._canvas;
    }

    get Context(): CanvasRenderingContext2D | null {
        return this._canvas ? this._canvas.getContext("2d") : null;
    }

    /**
     * Called when the plugin is removed from the plot.
     */
    dispose(): void {
        this.pluginDispose();

        this._plot = undefined;
        this._canvas = undefined;
        this.properties = {};
    }

    /**
     * Refresh is called when the plugin needs to redraw itself.
     */
    refresh(): void {
        if (!this._plot || !this._canvas) {
            return;
        }
        if (!this.properties.display) {
            return;
        }
        this.pluginRefresh(this.canvas);
    }

    /**
     * Provides the menu for the plugin.
     *
     * @returns A mx.menu compatible object or a function that creates one
     */
    menu(): MenuItem[] | undefined {
        return this.pluginGetMenu();
    }

    /**
     * Defines a new Property that the Plugin exposes.
     *
     * @param PropertyName - Name of the property
     * @param definition - Property definition schema
     */
    defineProperty(PropertyName: string, definition?: PropertyDefinition): void {
        if (this.definedproperties === undefined) {
            this.definedproperties = {};
        }

        const def: PropertyDefinition = definition || {};

        this.definedproperties[PropertyName] = def;

        // Fluentize the API
        this[PropertyName] = function (this: Plugin) {
            if (!arguments.length) {
                return this.properties[PropertyName];
            }

            if (def.readonly) {
                throw "property " + PropertyName + " is readonly";
            }

            if (this.properties[PropertyName] !== arguments[0]) {
                this.properties[PropertyName] = arguments[0];
                if (def.callback) {
                    def.callback(arguments[0]);
                }
                if (def.refreshOnChange) {
                    this.refresh();
                }
                return this;
            }
        };
    }

    resetProperties(overrides?: Record<string, any>): void {
        for (const propName in this.definedproperties) {
            this.properties[propName] = this.definedproperties[propName].defaultValue;
        }
        this.assignProperties(overrides);
    }

    /**
     * Updates the Plugin's properties with new values.
     *
     * @param properties - New property values to assign
     */
    assignProperties(properties?: Record<string, any>): void {
        let refresh = false;
        for (const propName in properties) {
            // don't let the user define new properties
            if (!this.definedproperties.hasOwnProperty(propName)) {
                continue;
            }

            // if the values are the same nothing to do
            if (this.properties[propName] === properties[propName]) {
                continue;
            }

            if (this.definedproperties[propName].readonly) {
                throw "property " + propName + " is readonly";
            }

            // set the Property
            this.properties[propName] = properties[propName];
            // make the callback if necessary
            if (this.definedproperties[propName].callback) {
                this.definedproperties[propName].callback!(properties[propName]);
            }
            // if a refresh is necessary, call it later
            if (this.definedproperties[propName].refreshOnChange === true) {
                refresh = true;
            }
        }
        // refresh if necessary
        if (refresh) {
            this.refresh();
        }
    }

    /**
     * Register to receive a plugin specific event.
     *
     * @param type - The type of event
     * @param fn - The function callback
     * @param context - Context that will be provided to the callback
     */
    on(type: string, fn: (...args: any[]) => void, context?: any): void {
        if (!this._events) {
            this._events = {};
        }
        if (!this._events[type]) {
            this._events[type] = [];
        }
        if (context === this) {
            // Less memory footprint.
            context = undefined;
        }
        this._events[type].push({
            cb: fn,
            ctx: context
        });
    }

    /**
     * Emit a plugin event.
     */
    emit(type: string, data?: Record<string, any>): this {
        const event = Object.assign({}, data, {
            type: type,
            target: this
        });
        if (this._events) {
            const listeners = this._events[type];
            if (listeners) {
                for (let i = 0, len = listeners.length; i < len; i++) {
                    const l = listeners[i];
                    l.cb.call(l.ctx || this, event);
                }
            }
        }
        return this;
    }

    /**
     * Unregister callback for a plugin specific event.
     *
     * @param type - The type of event
     * @param fn - The function callback
     * @param context - Context that will be provided to the callback
     */
    off(type?: string, fn?: (...args: any[]) => void, context?: any): this | undefined {
        if (!type) {
            // clear all listeners if called without arguments
            delete this._events;
            return undefined;
        }
        if (!this._events) {
            return undefined;
        }
        const listeners = this._events[type];
        if (!listeners) {
            return undefined;
        }
        if (context === this) {
            context = undefined;
        }
        // find fn and remove it
        for (let i = 0, len = listeners.length; i < len; i++) {
            const l = listeners[i];
            if (l.ctx !== context) {
                continue;
            }
            if (l.cb === fn) {
                listeners.splice(i, 1);
                return undefined;
            }
        }
        return this;
    }

    /**
     * Add a listener to a Plot event.
     */
    addListener(what: string, callback: (...args: any[]) => void): void {
        if (!this.Mx) {
            throw "listeners cannot be added until pluginInit is called";
        }
        mx.addEventListener(this.Mx, what, callback, false);
    }

    /**
     * Remove a listener from the Plot.
     */
    removeListener(what: string, callback: (...args: any[]) => void): void {
        if (!this.Mx) {
            throw "listeners cannot be removed until pluginInit is called";
        }
        mx.removeEventListener(this.Mx, what, callback, false);
    }
}

export default {
    Plugin: Plugin
};

export { Plugin };
