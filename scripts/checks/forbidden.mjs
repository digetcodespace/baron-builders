// "Hard nos" and the styling rules from CLAUDE.md that a script can enforce.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, read, report, sourceFiles, stripComments } from "./_lib.mjs";

const failures = [];

for (const name of ["middleware.ts", "middleware.js", "src/middleware.ts"]) {
  if (existsSync(join(ROOT, name))) failures.push(`${name} must not exist; the project uses proxy.ts`);
}

const files = sourceFiles(["app", "lib", "components", "hooks"]).concat(["proxy.ts"]);

for (const file of files) {
  const code = stripComments(read(file));

  if (/\bconsole\.(log|debug|info)\b/.test(code)) failures.push(`${file}: console.log/debug/info is not allowed`);

  // Visual constants come from tokens, never literals.
  const isTokens = file === "lib/design/tokens.ts";
  if (!isTokens && /#[0-9a-fA-F]{3,8}\b/.test(code.replace(/&#\d+;/g, ""))) {
    failures.push(`${file}: hardcoded hex color; use a design token`);
  }
  if (!isTokens && /\b(?:rgb|rgba|hsl|hsla)\(\s*\d/.test(code)) failures.push(`${file}: hardcoded color function; use a design token`);

  // Services and data never read env vars; config is the only door.
  if ((file.startsWith("lib/services/") || file.startsWith("lib/data/")) && /process\.env/.test(code)) {
    failures.push(`${file}: read config through @/lib/config, not process.env`);
  }
  if (!file.startsWith("lib/config/") && file !== "proxy.ts" && /process\.env/.test(code)) {
    failures.push(`${file}: read config through @/lib/config, not process.env`);
  }

  // No second toast lib, no animate-pulse skeletons, no native title tooltips.
  if (/animate-pulse/.test(code)) failures.push(`${file}: use <Skeleton> (the .shimmer texture), not animate-pulse`);
  if (file.startsWith("components/") || file.startsWith("app/")) {
    if (/<(?:button|Button|IconButton)\b[^>]*\stitle=/.test(code)) failures.push(`${file}: no native title on buttons; use <Tooltip>`);
  }

  // No silent catch in services.
  if (file.startsWith("lib/services/") && /\.catch\(\s*\(\s*\)\s*=>\s*(?:null|undefined|\{\s*\})\s*\)/.test(code)) {
    failures.push(`${file}: do not swallow errors; log via ctx.logError`);
  }
}

process.exit(report("forbidden", failures));
