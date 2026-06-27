#!/usr/bin/env node
/**
 * create-client.mjs
 * Provision a Clerk user for a new client workspace on syedirfanajmal.com.
 *
 * Usage:
 *   CLERK_SECRET_KEY=sk_live_... node scripts/create-client.mjs \
 *     --name "LAK Consulting" \
 *     --email "lubna@lakconsulting.com" \
 *     --slug "lak" \
 *     [--password "MyPass123!"]   ← omit to auto-generate
 *
 * After running:
 *   1. Create src/app/clients/<slug>/page.tsx (the actual dashboard page).
 *   2. Push to GitHub — the middleware already protects any new /clients/<slug> route.
 *   3. Send the credentials to the client securely (not email).
 *
 * To revoke access: delete the user in the Clerk dashboard.
 * To update the slug (e.g. after a rename): update publicMetadata.client_slug in Clerk.
 */

import { randomBytes } from "crypto";

// ─── Args ─────────────────────────────────────────────────────────────────────

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}

const name = arg("--name");
const email = arg("--email");
const slug = arg("--slug");
const passwordArg = arg("--password");

if (!name || !email || !slug) {
  console.error("Usage: node scripts/create-client.mjs --name <name> --email <email> --slug <slug> [--password <pass>]");
  process.exit(1);
}

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error("Error: CLERK_SECRET_KEY env var is not set.");
  process.exit(1);
}

// Validate slug: lowercase letters, numbers, hyphens only.
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`Error: slug must be lowercase letters, numbers, and hyphens only. Got: "${slug}"`);
  process.exit(1);
}

// ─── Password ─────────────────────────────────────────────────────────────────

function generatePassword() {
  // 16 chars: letters + numbers + symbols. Meets Clerk's strength requirements.
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%^&*";
  return Array.from({ length: 16 }, () => chars[randomBytes(1)[0] % chars.length]).join("");
}

const password = passwordArg || generatePassword();

// ─── Clerk API call ───────────────────────────────────────────────────────────

async function createClerkUser() {
  const res = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      password,
      public_metadata: {
        client_slug: slug,
        client_name: name,
        role: "client",
      },
      // Skip Clerk's email verification — Irfan is provisioning this manually.
      skip_password_checks: false,
      skip_password_requirement: false,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Clerk API error:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  return data;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const user = await createClerkUser();

console.log("\n✓ Client provisioned successfully\n");
console.log("─".repeat(48));
console.log(`  Client name : ${name}`);
console.log(`  Email       : ${email}`);
console.log(`  Password    : ${password}`);
console.log(`  Workspace   : https://www.syedirfanajmal.com/clients/${slug}`);
console.log(`  Clerk ID    : ${user.id}`);
console.log("─".repeat(48));
console.log("\nNext steps:");
console.log(`  1. Create the page: src/app/clients/${slug}/page.tsx`);
console.log("  2. Push to GitHub (middleware already protects the route).");
console.log("  3. Send credentials to client securely (not plain email).\n");
