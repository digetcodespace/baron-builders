// Every API route goes through the error mapper; every page has a loading state and an error boundary.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { ROOT, read, report, sourceFiles, stripComments } from "./_lib.mjs";

const failures = [];
const appFiles = sourceFiles(["app"]);

// Webhooks and crons also use the mapper (verify the secret, then throw through it).
for (const file of appFiles.filter((f) => /\/route\.ts$/.test(f))) {
  const code = stripComments(read(file));
  if (!/toErrorResponse\s*\(/.test(code)) failures.push(`${file}: route must catch through toErrorResponse(err, req)`);
  if (/NextResponse\.json\(\s*\{\s*error/.test(code)) failures.push(`${file}: never build an ad hoc { error } response`);
  if (/toErrorResponse\s*\(\s*err\s*\)/.test(code)) failures.push(`${file}: pass req to toErrorResponse so requestId flows through`);
}

function hasAncestor(dir, name) {
  for (let d = dir; d.startsWith("app"); d = dirname(d)) {
    if (existsSync(join(ROOT, d, name))) return true;
    if (d === "app") break;
  }
  return false;
}

for (const file of appFiles.filter((f) => /\/page\.tsx$/.test(f))) {
  const dir = dirname(file);
  if (!hasAncestor(dir, "loading.tsx")) failures.push(`${file}: no loading.tsx in this segment or above`);
  if (!hasAncestor(dir, "error.tsx")) failures.push(`${file}: no error.tsx in this segment or above`);
}

process.exit(report("routes", failures));
