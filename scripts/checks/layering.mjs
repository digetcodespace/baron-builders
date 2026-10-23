// Imports go down, never up or sideways. Enforces CLAUDE.md "Layering" and "Components".
import { read, report, sourceFiles, valueImports } from "./_lib.mjs";

const failures = [];

// Deep imports are allowed only for these exact specifiers (documented departures).
const ALLOWED_DEEP = new Set([
  "@/lib/data/client", // the browser barrel (different runtime)
  "@/lib/services/_errors", // dependency-free error classes, imported by lib/validation to avoid a cycle
]);
const DEEP_IMPORT_EXEMPT_FILES = new Set(["lib/validation/parse.ts"]);

const rules = [
  {
    name: "data layer",
    applies: (f) => f.startsWith("lib/data/"),
    forbidden: [/^@\/app/, /^@\/components/, /^@\/hooks/, /^@\/lib\/services/, /^@\/lib\/http/, /^next\//],
  },
  {
    name: "service layer",
    applies: (f) => f.startsWith("lib/services/"),
    forbidden: [/^@\/app/, /^@\/components/, /^@\/hooks/, /^@\/lib\/http/, /^next\//],
  },
  {
    name: "components",
    applies: (f) => f.startsWith("components/") && !f.startsWith("components/providers/"),
    forbidden: [/^@\/lib\/data/, /^@\/lib\/services/, /^@\/lib\/http/, /^@\/lib\/providers/, /^@supabase\//],
  },
  {
    name: "hooks",
    applies: (f) => f.startsWith("hooks/"),
    forbidden: [/^@\/lib\/data/, /^@\/lib\/services/, /^@\/lib\/http/, /^@\/lib\/providers/, /^@supabase\//],
  },
  {
    name: "HTTP layer (pages)",
    applies: (f) => f.startsWith("app/"),
    forbidden: [/^@\/lib\/data/, /^@supabase\//, /^@\/lib\/providers/],
  },
];

for (const file of sourceFiles(["app", "lib", "components", "hooks"]).concat(["proxy.ts"])) {
  let source;
  try {
    source = read(file);
  } catch {
    continue;
  }
  for (const spec of valueImports(source)) {
    for (const rule of rules) {
      if (rule.applies(file) && rule.forbidden.some((re) => re.test(spec))) {
        failures.push(`${file}: ${rule.name} must not import "${spec}"`);
      }
    }
    // Deep imports into a layer must go through its barrel.
    const deep = spec.match(/^@\/lib\/(services|data)\/(.+)$/);
    if (deep && !ALLOWED_DEEP.has(spec) && !DEEP_IMPORT_EXEMPT_FILES.has(file)) {
      failures.push(`${file}: deep import "${spec}"; import from the layer barrel "@/lib/${deep[1]}"`);
    }
    // Underscore-prefixed modules are private to their folder.
    if (/\/_[^/]+$/.test(spec) && spec.startsWith("@/") && !DEEP_IMPORT_EXEMPT_FILES.has(file)) {
      failures.push(`${file}: "${spec}" is underscore-private`);
    }
  }
}

process.exit(report("layering", failures));
