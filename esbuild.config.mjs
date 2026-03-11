import * as esbuild from "esbuild";

const common = {
    bundle: true,
    target: "es2018",
    sourcemap: true,
    logLevel: "info",
};

// Unwrap the default export so `window.sigplot` is the sigplot object itself
// rather than `{ default: sigplot }` which esbuild produces for `export default`.
const iifeFooter = { js: "sigplot = sigplot.default;" };

// UMD-style bundle (IIFE with global name) — replaces browserify --standalone
await esbuild.build({
    ...common,
    entryPoints: ["js/sigplot.js"],
    format: "iife",
    globalName: "sigplot",
    footer: iifeFooter,
    outfile: "dist/sigplot.js",
});

// Minified UMD
await esbuild.build({
    ...common,
    entryPoints: ["js/sigplot.js"],
    format: "iife",
    globalName: "sigplot",
    footer: iifeFooter,
    outfile: "dist/sigplot.min.js",
    minify: true,
});

// ESM bundle for modern consumers
await esbuild.build({
    ...common,
    entryPoints: ["js/sigplot.js"],
    format: "esm",
    outfile: "dist/sigplot.esm.js",
    target: "es2020",
});

const pluginsIifeFooter = { js: "sigplot_plugins = sigplot_plugins.default;" };

// Plugins bundle
await esbuild.build({
    ...common,
    entryPoints: ["js/plugins.js"],
    format: "iife",
    globalName: "sigplot_plugins",
    footer: pluginsIifeFooter,
    outfile: "dist/sigplot.plugins.js",
});

// Plugins minified
await esbuild.build({
    ...common,
    entryPoints: ["js/plugins.js"],
    format: "iife",
    globalName: "sigplot_plugins",
    footer: pluginsIifeFooter,
    outfile: "dist/sigplot.plugins.min.js",
    minify: true,
});
