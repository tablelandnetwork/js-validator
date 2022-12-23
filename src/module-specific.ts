// This file contains features that are only possible with an esm target.
// It is only included in the build if compiling to esm, see package.json
// and fixup.sh for related details
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "module";

export const getDirname = function () {
  return dirname(fileURLToPath(import.meta.url));
};

export const getVersion = function () {
  // Need to enable importing a json file with typescript
  const _require = createRequire(import.meta.url);
  return _require("../../package.json").version;
};
