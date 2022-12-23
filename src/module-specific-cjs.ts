// This file contains features that are only possible with a cjs target.
// It is only included in the build if compiling to cjs, see package.json
// and fixup.sh for related details
export const getDirname = function () {
  return __dirname;
};

export const getVersion = function () {
  return require("../../package.json").version;
};
