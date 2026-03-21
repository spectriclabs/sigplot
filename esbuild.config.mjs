import * as esbuild from "esbuild";

const common = {
    bundle: true,
    target: "es2018",
    sourcemap: true,
    logLevel: "info",
};

// UMD-style bundle (IIFE with global name) — replaces browserify --standalone
await esbuild.build({
    ...common,
    entryPoints: ["js/sigplot.ts"],
    format: "iife",
    globalName: "sigplot",
    outfile: "dist/sigplot.js",
    footer: { js: "sigplot = sigplot.default || sigplot;" },
});

// Minified UMD
await esbuild.build({
    ...common,
    entryPoints: ["js/sigplot.ts"],
    format: "iife",
    globalName: "sigplot",
    outfile: "dist/sigplot.min.js",
    minify: true,
    footer: { js: "sigplot = sigplot.default || sigplot;" },
});

// ESM bundle for modern consumers
await esbuild.build({
    ...common,
    entryPoints: ["js/sigplot.ts"],
    format: "esm",
    outfile: "dist/sigplot.esm.js",
    target: "es2020",
});

// Plugins bundle
await esbuild.build({
    ...common,
    entryPoints: ["js/plugins.ts"],
    format: "iife",
    globalName: "sigplot_plugins",
    outfile: "dist/sigplot.plugins.js",
});

// Plugins minified
await esbuild.build({
    ...common,
    entryPoints: ["js/plugins.ts"],
    format: "iife",
    globalName: "sigplot_plugins",
    outfile: "dist/sigplot.plugins.min.js",
    minify: true,
});
