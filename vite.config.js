import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 1337,
        open: "/examples/",
    },
    resolve: {
        alias: {
            sigplot: "/js/sigplot.ts",
        },
    },
    plugins: [
        {
            name: "sigplot-dev-redirect",
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === "/sigplot.js") {
                        req.url = "/dist/sigplot.js";
                    }
                    next();
                });
            },
        },
    ],
});
