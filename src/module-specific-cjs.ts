// This file contains features that are only possible with a cjs target.
// It is only included in the build if compiling to cjs, see package.json
// and fixup.sh for related details
export const getDirname = function (): string {
  return __dirname;
};

export const getVersion = function (): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let version = require("../../package.json").version;

  // strip a leading v off the version so that we normalize v0.1.0 and 0.1.0 to be the same value
  if (/^v[0-9]/.test(version)) {
    version = version.slice(1);
  }

  return version;
};
