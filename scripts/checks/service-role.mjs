// The service-role (RLS-bypassing) client is a closed list. Enforces CLAUDE.md "Database clients".
import { readAllowlist, read, report, sourceFiles, stripComments } from "./_lib.mjs";

const allowed = readAllowlist("scripts/checks/allowlist-service-role.txt");
const failures = [];

for (const file of sourceFiles(["app", "lib", "components", "hooks"]).concat(["proxy.ts"])) {
  const code = stripComments(read(file));
  const usesIt = /getServiceSupabase\s*\(/.test(code) || /createAdminClient\s*\(/.test(code);
  if (!usesIt) continue;
  if (!allowed.has(file)) failures.push(`${file}: uses the service-role client but is not in allowlist-service-role.txt`);
}

// Every allowlisted file must still exist and still use it, so the list cannot rot.
for (const file of allowed) {
  let code = "";
  try {
    code = stripComments(read(file));
  } catch {
    failures.push(`allowlist names ${file}, which does not exist`);
    continue;
  }
  if (!/getServiceSupabase\s*\(|createAdminClient\s*\(/.test(code)) failures.push(`allowlist names ${file}, which no longer uses the service-role client`);
}

process.exit(report("service-role", failures));
