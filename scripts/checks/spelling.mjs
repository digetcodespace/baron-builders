// US English everywhere (CLAUDE.md "Language and spelling"). New British spellings fail.
import { read, report, sourceFiles } from "./_lib.mjs";

const BRITISH = [
  "colour", "behaviour", "centre", "organisation", "organise", "licence", "defence", "catalogue",
  "dialogue", "analogue", "grey", "labelled", "modelling", "optimise", "normalise", "serialise",
  "analyse", "favourite", "neighbour", "cancelled",
];
const re = new RegExp(`\\b(${BRITISH.join("|")})\\w*\\b`, "i");

const failures = [];
for (const file of sourceFiles(["app", "lib", "components", "hooks", "scripts", "supabase"], [".ts", ".tsx", ".mjs", ".sql", ".css"]).filter((f) => f !== "scripts/checks/spelling.mjs")) {
  read(file)
    .split("\n")
    .forEach((line, i) => {
      const m = line.match(re);
      if (m) failures.push(`${file}:${i + 1}: "${m[0]}" (use the US spelling)`);
    });
}
process.exit(report("spelling", failures));
