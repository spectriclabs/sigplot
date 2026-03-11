import { describe, it, expect, vi } from "vitest";
import pluginModule from "../js/sigplot.plugin.js";

const Plugin = pluginModule.Plugin;

// The base Plugin class calls this.pluginSetup() in the constructor,
// but doesn't define it. Create a minimal subclass for testing.
class TestPlugin extends Plugin {
    pluginSetup() {
        this.pluginConstructor();
    }
}

// A plugin that defines custom properties
class CustomPlugin extends Plugin {
    pluginSetup() {
        this.pluginConstructor();
    }

    pluginConstructor() {
        this.defineProperty("color", {
            defaultValue: "red",
            refreshOnChange: true,
            help: "the color of the plugin"
        });
        this.defineProperty("lineWidth", {
            defaultValue: 1
        });
        this.defineProperty("label", {
            defaultValue: "default",
            readonly: true
        });
    }
}

// Minimal mock plot and canvas for init/dispose tests
function createMockPlot() {
    return {
        _Mx: {
            listeners: [],
            addEventListener: function() {},
            removeEventListener: function() {}
        },
        _Gx: {}
    };
}

function createMockCanvas() {
    return {
        getContext: () => ({
            clearRect: () => {},
            fillRect: () => {},
            beginPath: () => {},
            stroke: () => {}
        })
    };
}

describe("Plugin base class", () => {

    describe("construction", () => {
        it("creates a plugin instance", () => {
            const plugin = new TestPlugin();
            expect(plugin).toBeInstanceOf(Plugin);
        });

        it("stores initial_properties", () => {
            const props = { display: false };
            const plugin = new TestPlugin(props);
            expect(plugin.initial_properties).toEqual(props);
        });

        it("has display property defined by default", () => {
            const plugin = new TestPlugin();
            expect(plugin.definedproperties).toHaveProperty("display");
        });

        it("display defaults to true", () => {
            const plugin = new TestPlugin();
            // Before init, properties are empty object; display is defined but
            // properties are set via resetProperties during init
            expect(plugin.definedproperties.display.defaultValue).toBe(true);
        });

        it("has a fluent display() accessor", () => {
            const plugin = new TestPlugin();
            expect(typeof plugin.display).toBe("function");
        });
    });

    describe("defineProperty", () => {
        it("creates a fluent getter/setter", () => {
            const plugin = new CustomPlugin();
            expect(typeof plugin.color).toBe("function");
            expect(typeof plugin.lineWidth).toBe("function");
        });

        it("getter returns current property value", () => {
            const plugin = new CustomPlugin();
            // Set properties manually to test getter
            plugin.properties.color = "blue";
            expect(plugin.color()).toBe("blue");
        });

        it("setter updates the property value", () => {
            const plugin = new CustomPlugin();
            plugin.properties.color = "red";
            plugin.color("green");
            expect(plugin.color()).toBe("green");
        });

        it("setter returns the plugin for chaining", () => {
            const plugin = new CustomPlugin();
            plugin.properties.color = "red";
            const result = plugin.color("blue");
            expect(result).toBe(plugin);
        });

        it("readonly property throws on set", () => {
            const plugin = new CustomPlugin();
            plugin.properties.label = "test";
            expect(() => plugin.label("new value")).toThrow("readonly");
        });

        it("triggers callback when property changes", () => {
            const callback = vi.fn();
            const plugin = new TestPlugin();
            plugin.defineProperty("myProp", {
                defaultValue: 1,
                callback: callback
            });
            plugin.properties.myProp = 1;
            plugin.myProp(42);
            expect(callback).toHaveBeenCalledWith(42);
        });
    });

    describe("init and dispose lifecycle", () => {
        it("init sets plot and canvas", () => {
            const plugin = new TestPlugin();
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            expect(plugin.plot).toBe(plot);
            expect(plugin.canvas).toBe(canvas);
        });

        it("init resets properties to defaults", () => {
            const plugin = new CustomPlugin();
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            expect(plugin.color()).toBe("red");
            expect(plugin.lineWidth()).toBe(1);
        });

        it("init applies initial_properties overrides", () => {
            const plugin = new CustomPlugin({ color: "blue" });
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            expect(plugin.color()).toBe("blue");
        });

        it("dispose clears plot and canvas", () => {
            const plugin = new TestPlugin();
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            plugin.dispose();
            expect(plugin.plot).toBeUndefined();
            expect(plugin.canvas).toBeUndefined();
        });

        it("throws if added to two plots", () => {
            const plugin = new TestPlugin();
            const plot1 = createMockPlot();
            const plot2 = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot1, canvas);
            expect(() => plugin.init(plot2, canvas)).toThrow();
        });

        it("can be re-added after dispose", () => {
            const plugin = new TestPlugin();
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            plugin.dispose();
            // Should not throw
            plugin.init(plot, canvas);
            expect(plugin.plot).toBe(plot);
        });
    });

    describe("property accessors", () => {
        it("Mx returns plot._Mx when attached", () => {
            const plugin = new TestPlugin();
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            expect(plugin.Mx).toBe(plot._Mx);
        });

        it("Mx returns null when not attached", () => {
            const plugin = new TestPlugin();
            expect(plugin.Mx).toBeNull();
        });

        it("Gx returns plot._Gx when attached", () => {
            const plugin = new TestPlugin();
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            expect(plugin.Gx).toBe(plot._Gx);
        });

        it("Gx returns null when not attached", () => {
            const plugin = new TestPlugin();
            expect(plugin.Gx).toBeNull();
        });

        it("Context returns 2d context when attached", () => {
            const plugin = new TestPlugin();
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            expect(plugin.Context).toBeDefined();
        });

        it("Context returns null when not attached", () => {
            const plugin = new TestPlugin();
            expect(plugin.Context).toBeNull();
        });
    });

    describe("resetProperties", () => {
        it("resets all properties to defaults", () => {
            const plugin = new CustomPlugin();
            plugin.properties.color = "purple";
            plugin.properties.lineWidth = 99;
            plugin.resetProperties();
            expect(plugin.properties.color).toBe("red");
            expect(plugin.properties.lineWidth).toBe(1);
        });

        it("applies overrides after reset", () => {
            const plugin = new CustomPlugin();
            plugin.resetProperties({ color: "green" });
            expect(plugin.properties.color).toBe("green");
            expect(plugin.properties.lineWidth).toBe(1);
        });
    });

    describe("assignProperties", () => {
        it("updates defined properties", () => {
            const plugin = new CustomPlugin();
            plugin.properties.color = "red";
            plugin.properties.lineWidth = 1;
            plugin.assignProperties({ color: "blue", lineWidth: 3 });
            expect(plugin.properties.color).toBe("blue");
            expect(plugin.properties.lineWidth).toBe(3);
        });

        it("ignores undefined properties", () => {
            const plugin = new CustomPlugin();
            plugin.properties.color = "red";
            plugin.assignProperties({ unknownProp: "value" });
            expect(plugin.properties.unknownProp).toBeUndefined();
        });

        it("throws when assigning to readonly property", () => {
            const plugin = new CustomPlugin();
            plugin.properties.label = "original";
            expect(() => plugin.assignProperties({ label: "changed" })).toThrow("readonly");
        });

        it("does not trigger callback when value is the same", () => {
            const callback = vi.fn();
            const plugin = new TestPlugin();
            plugin.defineProperty("myProp", {
                defaultValue: 1,
                callback: callback
            });
            plugin.properties.myProp = 5;
            plugin.assignProperties({ myProp: 5 });
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe("event system (on/emit/off)", () => {
        it("on registers a listener and emit triggers it", () => {
            const plugin = new TestPlugin();
            const handler = vi.fn();
            plugin.on("myevent", handler);
            plugin.emit("myevent", { value: 42 });
            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler.mock.calls[0][0].type).toBe("myevent");
            expect(handler.mock.calls[0][0].value).toBe(42);
        });

        it("emit sets target to the plugin", () => {
            const plugin = new TestPlugin();
            const handler = vi.fn();
            plugin.on("test", handler);
            plugin.emit("test", {});
            expect(handler.mock.calls[0][0].target).toBe(plugin);
        });

        it("emit returns the plugin for chaining", () => {
            const plugin = new TestPlugin();
            const result = plugin.emit("noop", {});
            expect(result).toBe(plugin);
        });

        it("off with no args clears all listeners", () => {
            const plugin = new TestPlugin();
            const handler = vi.fn();
            plugin.on("evt", handler);
            plugin.off();
            plugin.emit("evt", {});
            expect(handler).not.toHaveBeenCalled();
        });

        it("multiple listeners can be registered", () => {
            const plugin = new TestPlugin();
            const h1 = vi.fn();
            const h2 = vi.fn();
            plugin.on("evt", h1);
            plugin.on("evt", h2);
            plugin.emit("evt", {});
            expect(h1).toHaveBeenCalledTimes(1);
            expect(h2).toHaveBeenCalledTimes(1);
        });

        it("listeners with context get called with that context", () => {
            const plugin = new TestPlugin();
            const ctx = { name: "myContext" };
            let calledContext;
            plugin.on("evt", function() { calledContext = this; }, ctx);
            plugin.emit("evt", {});
            expect(calledContext).toBe(ctx);
        });

        it("emit does nothing for unregistered event types", () => {
            const plugin = new TestPlugin();
            // Should not throw
            expect(() => plugin.emit("nonexistent", {})).not.toThrow();
        });

        it("off for non-existent type does not throw", () => {
            const plugin = new TestPlugin();
            expect(() => plugin.off("nonexistent")).not.toThrow();
        });
    });

    describe("refresh", () => {
        it("does nothing when not attached to a plot", () => {
            const plugin = new TestPlugin();
            // Should not throw
            expect(() => plugin.refresh()).not.toThrow();
        });

        it("does nothing when display is false", () => {
            const plugin = new TestPlugin();
            const plot = createMockPlot();
            const canvas = createMockCanvas();
            plugin.init(plot, canvas);
            plugin.display(false);
            // Should not throw - no actual rendering since pluginRefresh is a no-op
            expect(() => plugin.refresh()).not.toThrow();
        });
    });

    describe("menu", () => {
        it("returns undefined for base plugin (no menu)", () => {
            const plugin = new TestPlugin();
            expect(plugin.menu()).toBeUndefined();
        });
    });

    describe("addListener/removeListener", () => {
        it("throws if called before init (no Mx)", () => {
            const plugin = new TestPlugin();
            expect(() => plugin.addListener("click", () => {})).toThrow();
        });

        it("throws removeListener if called before init", () => {
            const plugin = new TestPlugin();
            expect(() => plugin.removeListener("click", () => {})).toThrow();
        });
    });
});
