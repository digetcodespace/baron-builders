/* End-to-end check of sign-in, roles, and invites against the live Supabase project.
   Run with: npm run test:e2e:auth   (needs the Supabase CLI signed in, or SUPABASE_SERVICE_ROLE_KEY).
   It starts its own dev server on port 3057, creates throwaway test users, and deletes them. */
import { execSync, spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL as URL_, readServiceKey } from "../lib/supabase-admin.mjs";

const PUBLISHABLE = "sb_publishable_zbL5DoHB4WpoMsHseCUFIA_4EollD3h";
const PORT = 3057;
const BASE = `http://localhost:${PORT}`;
const stamp = Date.now();
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  | " + detail : ""}`);
};

class Jar {
  constructor() { this.cookies = new Map(); }
  absorb(res) {
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const [pair] = line.split(";");
      const i = pair.indexOf("=");
      const name = pair.slice(0, i).trim();
      const value = pair.slice(i + 1);
      if (/max-age=0|expires=thu, 01 jan 1970/i.test(line) || value === "") this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }
  header() { return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "); }
}

async function call(jar, method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    redirect: "manual",
    headers: { cookie: jar.header(), origin: BASE, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  jar.absorb(res);
  let json = null;
  const text = await res.text();
  try { json = JSON.parse(text); } catch { /* html page */ }
  return { status: res.status, json, location: res.headers.get("location"), text };
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE + "/api/health"); if (r.ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("dev server did not start");
}

await (async () => {
  const serviceKey = readServiceKey();
  const admin = createClient(URL_, serviceKey, { auth: { persistSession: false } });
  const server = spawn("npm.cmd", ["run", "dev", "--", "-p", String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: URL_,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE,
      NEXT_PUBLIC_SITE_URL: BASE,
      SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    },
    stdio: "ignore",
  });

  const created = { users: [], projectId: null };
  const staffEmail = `e2e-staff-${stamp}@test.invalid`;
  const buyerEmail = `e2e-buyer-${stamp}@test.invalid`;
  const strangerEmail = `e2e-nobody-${stamp}@test.invalid`;

  try {
    await waitForServer();

    // Fixture: a staff account (as the first admin would be made), plus a project and house to invite a buyer to.
    const staff = await admin.auth.admin.createUser({ email: staffEmail, email_confirm: true, app_metadata: { role: "staff" }, user_metadata: { full_name: "E2E Staff" } });
    created.users.push(staff.data.user.id);
    const project = await admin.from("projects").insert({ name: `E2E ${stamp}` }).select("id").single();
    created.projectId = project.data.id;
    const status = await admin.from("project_statuses").insert({ project_id: created.projectId, name: "Contract signed", position: 1 }).select("id").single();
    const model = await admin.from("models").insert({ project_id: created.projectId, name: "A-34" }).select("id").single();
    const house = await admin.from("houses").insert({ project_id: created.projectId, model_id: model.data.id, status_id: status.data.id, lot: "E2E-1" }).select("id").single();

    // Anyone not signed in is kept out of every portal and API.
    const anon = new Jar();
    let r = await call(anon, "GET", "/staff");
    check("signed-out visitor is redirected away from /staff", r.status === 307 && /sign-in/.test(r.location ?? ""), `${r.status} ${r.location}`);
    r = await call(anon, "GET", "/api/people");
    check("signed-out visitor gets 401 from /api/people", r.status === 401);
    r = await call(anon, "GET", "/api/projects");
    check("signed-out visitor gets 401 from /api/projects", r.status === 401);
    r = await call(anon, "POST", "/api/invites", { email: "x@test.invalid", fullName: "X", role: "staff" });
    check("signed-out visitor cannot invite", r.status === 401);

    // Cross-site posts are refused.
    const evil = await fetch(BASE + "/api/auth/request-code", { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: JSON.stringify({ email: staffEmail }) });
    check("a request from another site is refused", evil.status === 403, String(evil.status));

    // Asking for a code looks identical for a real address and a stranger.
    const a = await call(new Jar(), "POST", "/api/auth/request-code", { email: strangerEmail });
    check("unknown email gets the same neutral answer (no account is revealed)", a.status === 200 && a.json?.ok === true, `${a.status}`);
    const bad = await call(new Jar(), "POST", "/api/auth/request-code", { email: "not-an-email" });
    check("a malformed email is rejected next to the field", bad.status === 400 && bad.json?.error?.field === "email");

    // A wrong code is rejected.
    const wrong = await call(new Jar(), "POST", "/api/auth/verify-code", { email: staffEmail, code: "00000000" });
    check("a wrong code is rejected on the code field", wrong.status === 400 && wrong.json?.error?.field === "code", `${wrong.status}`);
    const short = await call(new Jar(), "POST", "/api/auth/verify-code", { email: staffEmail, code: "123" });
    check("a short code fails validation", short.status === 400 && short.json?.error?.field === "code");

    // Staff sign in with a real code (minted by the admin API so no inbox is needed).
    const link = await admin.auth.admin.generateLink({ type: "magiclink", email: staffEmail });
    const staffJar = new Jar();
    r = await call(staffJar, "POST", "/api/auth/verify-code", { email: staffEmail, code: link.data.properties.email_otp });
    check("staff sign in with the emailed code", r.status === 200 && r.json?.role === "staff", `${r.status} ${JSON.stringify(r.json)}`);
    r = await call(staffJar, "GET", "/staff");
    check("staff can open /staff and sees the dashboard", r.status === 200 && /Dashboard/.test(r.text) && !/NEXT_REDIRECT/.test(r.text), String(r.status));
    r = await call(staffJar, "GET", "/api/people");
    check("staff can list people", r.status === 200 && r.json?.items?.some((p) => p.email === staffEmail));
    r = await call(staffJar, "POST", "/api/projects", { name: "   " });
    check("a blank project name is refused with a field error", r.status === 400 && r.json?.error?.field === "name", `${r.status} ${JSON.stringify(r.json)}`);
    r = await call(staffJar, "POST", "/api/projects", { name: `E2E Project ${stamp}` });
    check("staff can create a project", r.status === 201 && r.json?.name === `E2E Project ${stamp}`, `${r.status} ${JSON.stringify(r.json)}`);
    r = await call(staffJar, "GET", "/api/projects");
    check("the new project is in the list", r.status === 200 && r.json?.items?.some((p) => p.name === `E2E Project ${stamp}`));
    r = await call(staffJar, "GET", "/sign-in");
    check("a signed-in person visiting /sign-in is sent to their portal", r.status === 307 && /staff/.test(r.location ?? ""), `${r.status} ${r.location}`);

    // The role is inside the token.
    const sessionCookie = [...staffJar.cookies.entries()].find(([k]) => /auth-token/.test(k));
    let claim = null;
    if (sessionCookie) {
      const raw = decodeURIComponent(sessionCookie[1]).replace(/^base64-/, "");
      try { const session = JSON.parse(Buffer.from(raw, "base64").toString("utf8")); claim = JSON.parse(Buffer.from(session.access_token.split(".")[1], "base64url").toString("utf8")).user_role; } catch { /* format differs */ }
    }
    check("the sign-in token carries user_role=staff", claim === "staff", `claim=${claim}`);

    // Staff invite a buyer to the house.
    r = await call(staffJar, "POST", "/api/invites", { email: buyerEmail, fullName: "E2E Buyer", role: "buyer", houseId: house.data.id });
    check("staff can invite a buyer to a house", r.status === 201 && r.json?.created === true, `${r.status} ${JSON.stringify(r.json)}`);
    if (r.json?.userId) created.users.push(r.json.userId);
    check("with no email provider configured the invite says so and offers a link", r.json?.emailSent === false && /sign-in\?for=buyer&email=/.test(r.json?.signInUrl ?? ""));
    r = await call(staffJar, "POST", "/api/invites", { email: buyerEmail, fullName: "E2E Buyer", role: "staff" });
    check("the same email cannot be invited under a different role", r.status === 409, String(r.status));
    r = await call(staffJar, "POST", "/api/invites", { email: `x-${stamp}@test.invalid`, fullName: "No House", role: "buyer" });
    check("a buyer invite without a house is rejected on the house field", r.status === 400 && r.json?.error?.field === "houseId");
    const link2 = await admin.from("house_buyers").select("house_id").eq("house_id", house.data.id);
    check("the buyer is linked to exactly that house", link2.data?.length === 1);

    // The buyer signs in and is confined to their portal.
    const bl = await admin.auth.admin.generateLink({ type: "magiclink", email: buyerEmail });
    const buyerJar = new Jar();
    r = await call(buyerJar, "POST", "/api/auth/verify-code", { email: buyerEmail, code: bl.data.properties.email_otp });
    check("the buyer signs in and lands on the buyer role", r.status === 200 && r.json?.role === "buyer");
    r = await call(buyerJar, "GET", "/buyer");
    check("buyer can open /buyer and sees their home", r.status === 200 && /Your home|My home/.test(r.text) && !/NEXT_REDIRECT/.test(r.text));
    r = await call(buyerJar, "GET", "/staff");
    check("buyer is turned away from /staff", r.status === 307 && /buyer/.test(r.location ?? ""), `${r.status} ${r.location}`);
    r = await call(buyerJar, "GET", "/api/people");
    check("buyer cannot list people", r.status === 403, String(r.status));
    r = await call(buyerJar, "GET", "/api/projects");
    check("buyer cannot list projects", r.status === 403, String(r.status));
    r = await call(buyerJar, "POST", "/api/projects", { name: "Nope" });
    check("buyer cannot create a project", r.status === 403, String(r.status));
    r = await call(buyerJar, "POST", "/api/invites", { email: `y-${stamp}@test.invalid`, fullName: "Y", role: "staff" });
    check("buyer cannot invite anyone", r.status === 403, String(r.status));
    r = await call(buyerJar, "GET", "/api/houses");
    check("buyer sees exactly their own house", r.status === 200 && r.json?.items?.length === 1 && r.json.items[0].id === house.data.id, JSON.stringify(r.json?.items?.length));

    // Sign out ends the session.
    r = await call(buyerJar, "POST", "/api/auth/sign-out");
    check("sign out succeeds", r.status === 200);
    r = await call(buyerJar, "GET", "/api/houses");
    check("after sign out the session no longer works", r.status === 401, String(r.status));

    // Sign-up is closed: a stranger cannot create an account on their own.
    const anonClient = createClient(URL_, PUBLISHABLE, { auth: { persistSession: false } });
    const signup = await anonClient.auth.signUp({ email: `selfserve-${stamp}@test.invalid`, password: "Sup3r-secret-pass!" });
    check("public sign-up is closed", Boolean(signup.error) && !signup.data?.user, signup.error?.code ?? "no error");
  } catch (error) {
    check("test run completed without crashing", false, String(error?.stack ?? error).split("\n").slice(0, 3).join(" "));
  } finally {
    // Cleanup everything the test created.
    try {
      await admin.from("projects").delete().like("name", "E2E Project %");
      if (created.projectId) await admin.from("projects").delete().eq("id", created.projectId);
      await admin.from("audit_log").delete().like("details->>email", "%@test.invalid");
      for (const id of created.users) await admin.auth.admin.deleteUser(id);
      const left = await admin.from("profiles").select("id").like("email", "e2e-%@test.invalid");
      check("test accounts were cleaned up", (left.data?.length ?? 1) === 0);
    } catch (error) {
      check("cleanup", false, String(error));
    }
    server.kill();
    try { execSync(`powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${PORT} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"`); } catch { /* already stopped */ }
    const failed = results.filter((x) => !x.ok).length;
    console.log(`\n${results.length} checks, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }
})();
