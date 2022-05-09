import path from "path";
import fs from "fs-extra";
import { temporaryDirectoryTask } from "tempy";
import { transformFileAsync } from "@babel/core";
import ncc from "@vercel/ncc";
import prettyBytes from "pretty-bytes";

// prepare some paths
const inputFile = path.join(process.cwd(), "index.cjs");
const outputDir = path.join(process.cwd(), "dist");

// run code through babel
const { code: babelCode } = await transformFileAsync(inputFile, {
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ],
  sourceType: "script", // we're outputting CJS, even though this package is technically ESM
});

await temporaryDirectoryTask(async (tempPath) => {
  // save babel-ified code to a temporary file -- unfortunately, we can't pipe this code directly to ncc below
  await fs.writeFile(path.join(tempPath, "babel.cjs"), babelCode);

  // hacky warning: ncc needs the node_modules we want to bundle next to the input file, so copy them from here
  await fs.copy(path.join(process.cwd(), "node_modules"), path.join(tempPath, "node_modules"));

  // compile for distribution with ncc
  const { code, assets } = await ncc(path.join(tempPath, "babel.cjs"), {
    cache: false,
    sourceMap: false,
    minify: true,
    debugLog: true,
    assetBuilds: true,
  });

  // remove anything leftover from previous builds
  await fs.emptyDir(outputDir);

  // write final build to ./dist
  await Promise.all([
    fs.outputFile(path.join(outputDir, "index.cjs"), code),
    // TODO: figure out if script from 'open' module is really necessary
    fs.outputFile(path.join(outputDir, "xdg-open"), assets["xdg-open"].source),
  ]);

  // make everything executable
  await Promise.all([
    fs.chmod(path.join(outputDir, "index.cjs"), 0o775),
    fs.chmod(path.join(outputDir, "xdg-open"), 0o775),
  ]);
});

// quick logging of resulting filesizes
console.log("🎉 Success!");
console.log(`dist/index.cjs\t${prettyBytes((await fs.stat(path.join(outputDir, "index.cjs"))).size)}`);
console.log(`dist/xdg-open\t${prettyBytes((await fs.stat(path.join(outputDir, "xdg-open"))).size)}`);
