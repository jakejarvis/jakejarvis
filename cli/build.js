const path = require("path");
const fs = require("fs").promises;
const babel = require("@babel/core");
const ncc = require("@vercel/ncc");
const prettyBytes = require("pretty-bytes");

(async () => {
  // prepare some paths
  const tempDir = path.join(__dirname, "tmp");
  const distDir = path.join(__dirname, "dist");

  // remove anything leftover from previous builds
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.rm(distDir, { recursive: true, force: true });

  // run code through babel
  const { code: babelCode } = await babel.transformFileAsync(path.join(__dirname, "index.js"), {
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
  await fs.mkdir(tempDir);
  await fs.writeFile(path.join(tempDir, "babel.js"), babelCode);

  // compile for distribution with ncc
  const { code, assets } = await ncc(path.join(tempDir, "babel.js"), {
    cache: false,
    sourceMap: false,
    minify: true,
    debugLog: true,
  });

  // write final build to ./dist and make executable
  await fs.mkdir(distDir);
  await fs.writeFile(path.join(distDir, "index.js"), code);
  await fs.writeFile(path.join(distDir, "xdg-open"), assets["xdg-open"].source); // TODO: external script from 'open' module
  await fs.chmod(path.join(distDir, "index.js"), 0o775);
  await fs.chmod(path.join(distDir, "xdg-open"), 0o775);

  // quick logging of resulting filesize
  console.log("✅ Success!");
  console.log(`dist/index.js\t${prettyBytes((await fs.stat(path.join(distDir, "index.js"))).size)}`);
  console.log(`dist/xdg-open\t${prettyBytes((await fs.stat(path.join(distDir, "xdg-open"))).size)}`);

  // clean up temp files
  await fs.rm(tempDir, { recursive: true, force: true });
})();
