const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["lambda-src/index.js"],
    outfile: "lambda-dist/index.js",
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    sourcemap: false,
  })
  .then(() => console.log("Build successful"))
  .catch(() => process.exit(1));
