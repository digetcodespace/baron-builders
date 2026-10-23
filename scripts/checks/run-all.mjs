// Runs every structural check and exits non-zero if any fail.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const checks = ["layering", "forbidden", "routes", "service-role", "list-pagination", "spelling"];

let failed = 0;
for (const name of checks) {
  const result = spawnSync(process.execPath, [join(dir, `${name}.mjs`)], { stdio: "inherit" });
  if (result.status !== 0) failed += 1;
}
process.exit(failed === 0 ? 0 : 1);
