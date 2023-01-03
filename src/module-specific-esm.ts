// This file contains features that are only possible with an esm target.
// It is only included in the build if compiling to esm, see package.json
// and fixup.sh for related details
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "module";

export const getDirname = function (): string {
  return dirname(fileURLToPath(import.meta.url));
};

export const getVersion = function (): string {
  // Need to enable importing a json file with typescript
  const _require = createRequire(import.meta.url);
  let version = _require("../../package.json").version;

  // strip a leading v off the version so that we normalize v0.1.0 and 0.1.0 to be the same value
  if (/^v[0-9]/.test(version)) {
    version = version.slice(1);
  }

  return version;
};
