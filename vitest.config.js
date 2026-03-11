import { defineConfig } from "vitest/config";

// sec2tod uses local‑timezone Date methods, so pin to UTC for deterministic results
process.env.TZ = "UTC";

export default defineConfig({
    test: {
        include: ["test/**/*.test.js"],
        globals: true,

        // jsdom for unit tests (sigfile dep doesn't support Vitest browser mode's
        // server-side preprocessing — its UMD wrapper references window at top level)
        environment: "jsdom",

        // Setup file that imports sigplot and creates globals
        setupFiles: ["test/vitest.setup.js"],

        // Coverage configuration
        coverage: {
            provider: "v8",
            include: ["js/**/*.js"],
            exclude: ["js/license.js"],
            reporter: ["text", "lcov", "html"],
            reportsDirectory: "coverage",
        },
    },
});
