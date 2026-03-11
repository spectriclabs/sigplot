import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
    js.configs.recommended,

    // Source files
    {
        files: ["js/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                CustomEvent: "readonly",
                Event: "readonly",
                ImageData: "readonly",
                HTMLCanvasElement: "readonly",
                HTMLElement: "readonly",
                XMLHttpRequest: "readonly",
                Worker: "readonly",
                WebSocket: "readonly",
                URL: "readonly",
                Image: "readonly",
                Blob: "readonly",
                FileReader: "readonly",
                prompt: "readonly",
                alert: "readonly",
                performance: "readonly",
                fetch: "readonly",
                Headers: "readonly",
                Response: "readonly",
                HTMLVideoElement: "readonly",
                HTMLImageElement: "readonly",
                self: "readonly",
                event: "readonly",

                // Typed arrays
                ArrayBuffer: "readonly",
                SharedArrayBuffer: "readonly",
                Float32Array: "readonly",
                Float64Array: "readonly",
                Int8Array: "readonly",
                Int16Array: "readonly",
                Int32Array: "readonly",
                Uint8Array: "readonly",
                Uint8ClampedArray: "readonly",
                Uint16Array: "readonly",
                Uint32Array: "readonly",
                DataView: "readonly",
                WeakMap: "readonly",
                ResizeObserver: "readonly",
                process: "readonly",
                global: "readonly",
            },
        },
        rules: {
            // Port from JSHint — warn for now, upgrade to error after code cleanup
            eqeqeq: "warn",
            curly: "error",
            "no-caller": "error",
            "new-cap": "warn",
            "no-undef": "error",
            "no-fallthrough": "warn",

            // Relaxed for existing code — tighten later
            "no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^_" }],
            "no-redeclare": "warn",
            "no-empty": "warn",
            "no-prototype-builtins": "off",
            "no-cond-assign": "off", // JSHint "boss" mode
            "no-useless-assignment": "warn",
            "no-func-assign": "warn",
            "no-self-assign": "warn",
            "no-useless-escape": "warn",
            "no-unassigned-vars": "warn",

            // Don't enforce yet — enable during ES module migration
            "no-var": "off",
            "prefer-const": "off",
        },
    },

    // Test files
    {
        files: ["test/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                QUnit: "readonly",
                sigplot: "readonly",
                Float32Array: "readonly",
                Float64Array: "readonly",
                Int32Array: "readonly",
                ArrayBuffer: "readonly",
                DataView: "readonly",
                Uint8Array: "readonly",
                Blob: "readonly",
                URL: "readonly",
                XMLHttpRequest: "readonly",
                Image: "readonly",
                HTMLCanvasElement: "readonly",
            },
        },
        rules: {
            "no-undef": "error",
            "no-unused-vars": "off",
        },
    },

    // Disable rules that conflict with Prettier
    prettier,
];
