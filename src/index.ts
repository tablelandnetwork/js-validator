// aside from holding the compiled binaries to run a validator for all of our supported systems
// this repo's main functionality is to expose the full path to the binary for the system that
// loaded this file

import { resolve } from "node:path";
// NOTE: We are creating this file in the prebuild.sh script so that we can support cjs and esm
import { getDirname } from "./module-specific.js";
const _dirname: string = getDirname();

// ref for all possilbe values of process.platform
const platformMap = {
  aix: "",
  darwin: "",
  freebsd: "",
  linux: "",
  openbsd: "",
  netbsd: "",
  sunos: "",
  win32: "",
  cygwin: "",
  android: "",
  haiku: "",
};

// top level keys are all possible values for process.arch
const archMap: Record<string, Record<string, string>> = {
  arm: platformMap, // not actively supported

  // we don't have an automated build setup for these, but a manual build is
  // included which might be out of date with the latest Validator release
  arm64: {
    aix: "",
    darwin: "darwin-arm64",
    freebsd: "linux-arm64",
    linux: "linux-arm64",
    openbsd: "linux-arm64",
    netbsd: "linux-arm64",
    sunos: "",
    win32: "windows-arm64.exe",
    cygwin: "",
    android: "",
    haiku: "",
  },
  ia32: platformMap, // not actively supported
  mips: platformMap, // not actively supported
  mipsel: platformMap, // not actively supported
  ppc: platformMap, // not actively supported
  ppc64: platformMap, // not actively supported
  s390: platformMap, // not actively supported
  s390x: platformMap, // not actively supported
  riscv64: platformMap, // not actively supported

  // a.k.a. amd64
  x64: {
    aix: "",
    darwin: "darwin-amd64",
    freebsd: "linux-amd64",
    linux: "linux-amd64",
    openbsd: "linux-amd64",
    netbsd: "linux-amd64",
    sunos: "",
    win32: "windows-amd64.exe",
    cygwin: "",
    android: "",
    haiku: "",
  },
};

export const getBinPath = function (): string {
  const binName = getBinName();
  // _dirname is the dist/{module type} directory
  return `${resolve(_dirname, "..", "..", "bin", binName)}`;
};

const getBinName = function (): string {
  const arch = archMap[process.arch];
  const binName = arch[process.platform];

  // use `process` to determine what to return
  return binName;
};
