import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const ROOT = process.cwd();

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "brand", "public", ".claude"]);

/** All source files under the given top-level folders, as repo-relative posix paths. */
export function sourceFiles(folders, extensions = [".ts", ".tsx"]) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (extensions.some((e) => entry.endsWith(e))) out.push(relative(ROOT, full).split(sep).join("/"));
    }
  };
  for (const folder of folders) {
    try {
      walk(join(ROOT, folder));
    } catch {
      // Folder does not exist yet; nothing to check.
    }
  }
  return out;
}

export const read = (file) => readFileSync(join(ROOT, file), "utf8");

/** Value imports only; `import type` and `export type` lines are ignored. */
export function valueImports(source) {
  const imports = [];
  const re = /^\s*(?:import|export)\s+(type\s+)?[^;]*?from\s+["']([^"']+)["']/gm;
  let m;
  while ((m = re.exec(source))) if (!m[1]) imports.push(m[2]);
  const sideEffect = /^\s*import\s+["']([^"']+)["']/gm;
  while ((m = sideEffect.exec(source))) imports.push(m[1]);
  return imports;
}

/** Strip comments so documentation about a rule never trips the rule. */
export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " ")).replace(/(^|[^:])\/\/.*$/gm, "$1");
}

export function readAllowlist(file) {
  try {
    return new Set(
      read(file)
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
        .map((l) => l.split(/\s+#/)[0].trim()),
    );
  } catch {
    return new Set();
  }
}

export function report(name, failures) {
  if (failures.length === 0) {
    console.log(`ok  ${name}`);
    return 0;
  }
  console.error(`FAIL ${name}`);
  for (const f of failures) console.error(`  - ${f}`);
  return 1;
}
