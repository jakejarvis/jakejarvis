const path = require("path");
const fs = require("fs-extra");
const babel = require("@babel/core");
const ncc = require("@vercel/ncc");
const prettyBytes = require("pretty-bytes");

(async () => {
  // prepare some paths
  const tempDir = path.join(__dirname, "tmp");
  const distDir = path.join(__dirname, "dist");

  // remove anything leftover from previous builds
  fs.removeSync(tempDir);
  fs.removeSync(distDir);

  // run code through babel
  const { code: babelCode } = babel.transformFileSync(path.join(__dirname, "index.js"), {
    presets: [
      [
        "@babel/preset-react",
        {
          runtime: "automatic",
        },
      ],
    ],
  });

  // save babelified code to a file -- unfortunately, we can't pipe this code directly to ncc below
  fs.outputFileSync(path.join(tempDir, "babel.js"), babelCode);

  // compile for distribution with ncc
  const { code, assets } = await ncc(path.join(tempDir, "babel.js"), {
    cache: false,
    sourceMap: false,
    minify: true,
    debugLog: true,
  });

  // write final build to ./dist and make executable
  fs.outputFileSync(path.join(distDir, "index.js"), code);
  fs.outputFileSync(path.join(distDir, "xdg-open"), assets["xdg-open"].source); // TODO: external script from 'open' module
  fs.chmodSync(path.join(distDir, "index.js"), 0o775);
  fs.chmodSync(path.join(distDir, "xdg-open"), 0o775);

  // quick logging of resulting filesize
  console.log("✅ Success!");
  console.log(`dist/index.js\t${prettyBytes(fs.statSync(path.join(distDir, "index.js")).size)}`);
  console.log(`dist/xdg-open\t${prettyBytes(fs.statSync(path.join(distDir, "xdg-open")).size)}`);

  // clean up temp files
  fs.removeSync(tempDir);
})();
