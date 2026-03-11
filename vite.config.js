import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 1337,
        open: "/examples/",
    },
    resolve: {
        alias: {
            sigplot: "/js/sigplot.js",
        },
    },
});
