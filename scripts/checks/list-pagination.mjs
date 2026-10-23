// Every lib/data list* returns Page<T>, unless registered with a reason. Enforces CLAUDE.md "Pagination".
// Gates shape, not semantics: green means nothing NEW went unbounded, not that paging is correct.
import { readAllowlist, read, report, sourceFiles } from "./_lib.mjs";

const allowed = readAllowlist("scripts/checks/allowlist-list-pagination.txt");
const failures = [];
const seen = new Set();

for (const file of sourceFiles(["lib/data"])) {
  const source = read(file);
  const re = /export\s+(?:async\s+)?function\s+(list\w+)\s*\(([\s\S]*?)\)\s*(?::\s*([^{]+))?\{/g;
  let m;
  while ((m = re.exec(source))) {
    const name = m[1];
    const returns = m[3] ?? "";
    const key = `${file}#${name}`;
    seen.add(key);
    if (!/Page</.test(returns) && !allowed.has(key)) {
      failures.push(`${key} does not return Page<T>; paginate it or register it in allowlist-list-pagination.txt with a reason`);
    }
  }
}

for (const key of allowed) {
  if (!seen.has(key)) failures.push(`allowlist names ${key}, which no longer exists`);
}

process.exit(report("list-pagination", failures));
