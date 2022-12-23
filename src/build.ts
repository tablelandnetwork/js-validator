// native
import { createReadStream, createWriteStream } from "node:fs";
import { join } from "node:path";
import { Readable, pipeline } from "node:stream";
import { promisify } from "node:util";
import { createUnzip } from "node:zlib";
// lib
import decompress from "decompress";
import shelljs from "shelljs";
import tar from "tar";
// src
import { getDirname, getVersion } from "./module-specific.js";

const version = "0.0.1-alpha-3"//getVersion();
const _dirname = getDirname();

const pipe = promisify(pipeline);

export interface Platarch {
  name: string;
  filetype: string;
};

// These must match the builds that go-tableland is automating
const platarchs: Platarch[] = [
  {
    name: "darwin-amd64",
    filetype: ".tar.gz"
  },
  {
    name: "linux-amd64",
    filetype: ".tar.gz"
  },
  {
    name: "windows-amd64",
    filetype: ".zip"
  }
];

const binDirectory = join(_dirname, "..", "..", "bin");

const go = async function () {
  console.log(`installing validator binaries: ${platarchs.map(pa => `${pa.name}${pa.filetype}`).join(", ")} for version: ${version}`);
  for (let i = 0; i < platarchs.length; i++) {
    await fetchAndUnpack(platarchs[i]);
  }

  console.log("done installing validator binaries");
};

const fetchAndUnpack = async function (platarch: Platarch) {
  const url = `https://github.com/tablelandnetwork/go-tableland/releases/download/v${version}/api-${platarch.name}${platarch.filetype}`
  console.log(`fetching: ${url}`);

  const res = await fetch(url);
  // TODO: Seems to be a bug in the fetch typings?
  // @ts-ignore
  const downloadReadstream = Readable.fromWeb(res.body);

  if (platarch.filetype === ".tar.gz") {
    await tarx(downloadReadstream)
  }
  
  if (platarch.filetype === ".zip") {
    await unzip(downloadReadstream);
  }

  // name windows executables correctly
  const filename = platarch.name.includes("windows") ? platarch.name + ".exe" : platarch.name;
  shelljs.mv(join(binDirectory, "api"), join(binDirectory, filename))
};

const tarx = function (inputStream: Readable): Promise<void> {
  return new Promise((resolve, reject) => {
    // We can pipe the fetch response straight to tar
    const sink = inputStream.pipe(
      tar.x({ C: binDirectory })
    );

    sink.on("finish", () => resolve());
    sink.on("error", (err: Error) => reject(err));
  });
}

const unzip = async function (inputStream: Readable): Promise<void> {
  const tempFilename = join(binDirectory, "api-temp.zip");
  const outFilename = join(binDirectory, "api");

  // download the zip file to a temp location
  await new Promise<void>(function (resolve, reject) {
    const destination = createWriteStream(tempFilename);
    const sink = inputStream.pipe(destination);

    sink.on("finish", () => resolve());
    sink.on("error", (err: Error) => reject(err));
  });

  // unzip the tempfile, NOTE: this will reuslt in a bin named `api`
  await decompress(tempFilename, binDirectory);
  // remove the temp file
  shelljs.rm(tempFilename);
};

go().catch(function (err) {
  console.error(err)
  process.exit(1);
});
