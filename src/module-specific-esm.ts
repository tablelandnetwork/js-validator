// This file contains features that are only possible with an esm target.
// It is only included in the build if compiling to esm, see package.json
// and fixup.sh for related details
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const getDirname = function (): string {
  return dirname(fileURLToPath(import.meta.url));
};
