// native
import { createWriteStream } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
// lib
import decompress from "decompress";
import shelljs from "shelljs";
import tar from "tar";
// src
import { getDirname, getVersion } from "./module-specific.js";

const version = getVersion();
const _dirname: string = getDirname();

const releaseRepoUrl = "https://github.com/tablelandnetwork/go-tableland";

export interface Platarch {
  name: string;
  filetype: string;
}

// These must match the builds that go-tableland is automating
const platarchs: Platarch[] = [
  {
    name: "darwin-amd64",
    filetype: ".tar.gz",
  },
  {
    name: "darwin-arm64",
    filetype: ".tar.gz",
  },
  {
    name: "linux-amd64",
    filetype: ".tar.gz",
  },
  {
    name: "linux-arm64",
    filetype: ".tar.gz",
  },
  {
    name: "windows-amd64",
    filetype: ".zip",
  },
];

const binDirectory = join(_dirname, "..", "..", "bin");

const go = async function (): Promise<void> {
  console.log(
    `installing validator binaries: ${platarchs
      .map((pa) => `${pa.name}${pa.filetype}`)
      // eslint-disable-next-line
      .join(", ")} for version: ${version}`
  );
  for (let i = 0; i < platarchs.length; i++) {
    try {
      await fetchAndUnpack(platarchs[i]);
    } catch (err) {
      // If the version of this package doesn't match a release there will not be anything to fetch,
      // but we don't want the build to totally fail in case someone wants to publish a custom build
      console.log("could not fetch:", platarchs[i]);
      console.log(err);
    }
  }

  console.log("done installing validator binaries");
};

const fetchAndUnpack = async function (platarch: Platarch): Promise<void> {
  // eslint-disable-next-line
  const url = `${releaseRepoUrl}/releases/download/v${version}/api-${platarch.name}${platarch.filetype}`;
  console.log(`fetching: ${url}`);

  const res = await fetch(url);
  if (res.body === null) throw new Error("could not fetch release");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
  // @ts-ignore node and web typings still don't work together, but this works correctly
  const downloadReadstream = Readable.fromWeb(res.body);

  if (platarch.filetype === ".tar.gz") {
    await tarx(downloadReadstream);
  }

  if (platarch.filetype === ".zip") {
    await unzip(downloadReadstream);
  }

  // name windows executables correctly
  const filename = platarch.name.includes("windows")
    ? platarch.name + ".exe"
    : platarch.name;
  const binName = platarch.name.includes("windows") ? "api.exe" : "api";
  // all of the unzipped/extracted downloads expand to a single file named `api` except window, which is `api.exe`
  shelljs.mv(join(binDirectory, binName), join(binDirectory, filename));
};

const tarx = async function (inputStream: Readable): Promise<void> {
  return await new Promise((resolve, reject) => {
    // We can pipe the fetch response straight to tar
    const sink = inputStream.pipe(tar.x({ C: binDirectory }));

    sink.on("finish", () => resolve());
    sink.on("error", (err: Error) => reject(err));
  });
};

const unzip = async function (inputStream: Readable): Promise<void> {
  const tempFilename = join(binDirectory, "api-temp.zip");

  // download the zip file to a temp location
  await new Promise<void>(function (resolve, reject) {
    const destination = createWriteStream(tempFilename);
    const sink = inputStream.pipe(destination);

    sink.on("finish", () => resolve());
    sink.on("error", (err: Error) => reject(err));
  });

  // unzip the tempfile, NOTE: this will reuslt in a bin named `api`
  await decompress(tempFilename, binDirectory);
  // remove the temp zip file now that it's content has been unzipped to `api`
  shelljs.rm(tempFilename);
};

go().catch(function (err) {
  console.error(err);
  process.exit(1);
});
