import path from "path";
import { statSync } from "fs";
import { writeFile } from "fs/promises";
import cpy from "cpy";
import mkdirp from "mkdirp";
import { transformFileSync } from "@babel/core";
import { temporaryDirectoryTask } from "tempy";
import ncc from "@vercel/ncc";
import prettyBytes from "pretty-bytes";

// prepare some paths
const inputFile = path.join(process.cwd(), "index.cjs");
const outputDir = path.join(process.cwd(), "dist");

// run code through babel
const { code: babelCode } = transformFileSync(inputFile, {
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

// this temporary directory will be deleted automatically once the inner function is done
await temporaryDirectoryTask(async (tempPath) => {
  // save babel-ified code above to a temporary file -- unfortunately, we can't pipe this code directly into to ncc
  const babelFile = path.join(tempPath, "index.cjs");
  await writeFile(babelFile, babelCode);

  // hacky warning: ncc needs the node_modules we want to bundle next to the input file, so copy them from here
  await cpy("node_modules/**", path.join(tempPath, "node_modules"));

  // compile for distribution with ncc
  const { code, assets } = await ncc(babelFile, {
    cache: false,
    sourceMap: false,
    minify: true,
    debugLog: true,
  });

  // ensure ./dist exists
  await mkdirp(outputDir);

  // write final build to ./dist and make it executable
  await Promise.all([
    writeFile(path.join(outputDir, "index.cjs"), code, { mode: 0o755 }),
    // TODO: figure out if bundling this script from 'open' module is really necessary?
    // https://linux.die.net/man/1/xdg-open
    writeFile(path.join(outputDir, "xdg-open"), assets["xdg-open"].source, {  mode: 0o755 }),
  ]);
});

// quick logging of resulting filesizes
console.log("🎉 Success!");
console.log(`dist/index.cjs\t${prettyBytes((statSync(path.join(outputDir, "index.cjs"))).size)}`);
console.log(`dist/xdg-open\t${prettyBytes((statSync(path.join(outputDir, "xdg-open"))).size)}`);
