// Create a staff account without an invitation. Needed once, for the first person, because every
// later account is created by a staff member through the People page.
//   npm run create-staff -- you@company.com "Your Name"
import { adminClient } from "./lib/supabase-admin.mjs";

const [email, ...nameParts] = process.argv.slice(2);
const fullName = nameParts.join(" ").trim();
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !fullName) {
  console.error('Usage: npm run create-staff -- you@company.com "Your Name"');
  process.exit(1);
}

const admin = adminClient();
const normalized = email.trim().toLowerCase();
const existing = await admin.from("profiles").select("id, role").eq("email", normalized).maybeSingle();
if (existing.data) {
  console.log(`${normalized} already has a ${existing.data.role} account. Nothing changed.`);
  process.exit(0);
}

const { data, error } = await admin.auth.admin.createUser({
  email: normalized,
  email_confirm: true,
  app_metadata: { role: "staff" },
  user_metadata: { full_name: fullName },
});
if (error) {
  console.error(`Could not create the account: ${error.message}`);
  process.exit(1);
}
console.log(`Created staff account for ${normalized} (${data.user.id}). Sign in at the site with an emailed code.`);
