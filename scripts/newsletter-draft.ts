#!/usr/bin/env tsx
/*
 * Creates a Buttondown newsletter email from a published post.
 *
 *   pnpm newsletter <slug>              # create a draft (safe default)
 *   pnpm newsletter <slug> --dry-run    # print what would be sent, call nothing
 *   pnpm newsletter <slug> --send       # create the draft, then queue it for sending
 *
 * Why this exists: Buttondown's RSS-to-email automation is a paid add-on, but API
 * access is free on every plan — so we build the email ourselves from the MDX.
 * Bonus: subscribers get the full post body instead of just the RSS description.
 *
 * Safety rules baked in:
 *   - Always creates `draft` first; nothing sends unless you pass --send.
 *   - Refuses unpublished posts (they aren't on the site yet).
 *   - Refuses if an email with the same subject already exists (no double sends).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { postFrontmatterSchema } from "@/lib/validation";

const API_BASE = "https://api.buttondown.com/v1";
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// ---------------------------------------------------------------------------
// Env: scripts don't get Next's automatic .env.local loading.
// ---------------------------------------------------------------------------
function loadEnvLocal(): void {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key]) continue; // real env wins
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

// The site URL has historically carried a stray trailing dot; normalize so the
// links we put in the email are always clean absolute URLs.
function siteBase(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const cleaned = raw.trim().replace(/[./]+$/, "");
  return cleaned;
}

// ---------------------------------------------------------------------------
// Post lookup (mirrors lib/posts.ts, but requires `published` explicitly)
// ---------------------------------------------------------------------------
type Post = { title: string; slug: string; description: string; body: string };

function findPost(slug: string): Post {
  if (!fs.existsSync(POSTS_DIR)) fail(`No posts directory at ${POSTS_DIR}`);
  for (const entry of fs.readdirSync(POSTS_DIR)) {
    if (!entry.endsWith(".mdx")) continue;
    const filepath = path.join(POSTS_DIR, entry);
    const { data, content } = matter(fs.readFileSync(filepath, "utf8"));
    const parsed = postFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      fail(`Invalid frontmatter in ${entry}: ${parsed.error.message}`);
    }
    const fm = parsed.data;
    if (fm.slug !== slug) continue;
    if (!fm.published) {
      fail(
        `Post "${slug}" has published: false — publish it and deploy before emailing it.`,
      );
    }
    return { title: fm.title, slug: fm.slug, description: fm.description, body: content };
  }
  const available = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => `  - ${f.replace(/\.mdx$/, "")}`)
    .join("\n");
  fail(`No post with slug "${slug}".\nAvailable:\n${available}`);
}

// ---------------------------------------------------------------------------
// MDX -> email markdown
// ---------------------------------------------------------------------------
function buildBody(post: Post, base: string): string {
  let body = post.body;

  // Drop MDX-only syntax that would render as literal text in an email.
  body = body.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");

  // Make root-relative markdown targets absolute so images and links work in
  // the inbox: ](/images/... and ](/blog/... -> ](https://site/...
  if (base) body = body.replace(/\]\(\//g, `](${base}/`);

  const url = base ? `${base}/blog/${post.slug}` : "";
  const footer = url
    ? `\n\n---\n\n[Read this post on the web](${url})\n`
    : "\n";

  return `${body.trim()}\n${footer}`;
}

// ---------------------------------------------------------------------------
// Buttondown API
// ---------------------------------------------------------------------------
async function api(
  apiKey: string,
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<{ status: number; json: any; text: string }> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON response */
  }
  return { status: res.status, json, text };
}

async function findExistingBySubject(apiKey: string, subject: string) {
  const res = await api(apiKey, "GET", "/emails");
  if (res.status !== 200 || !Array.isArray(res.json?.results)) return null;
  return res.json.results.find((e: any) => e?.subject === subject) ?? null;
}

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  loadEnvLocal();

  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const slug = args.find((a) => !a.startsWith("--"));
  const dryRun = flags.has("--dry-run");
  const send = flags.has("--send");
  const force = flags.has("--force");

  const unknown = [...flags].filter(
    (f) => !["--dry-run", "--send", "--force"].includes(f),
  );
  if (unknown.length) fail(`Unknown flag(s): ${unknown.join(", ")}`);

  if (!slug) {
    console.error(
      'Usage: pnpm newsletter <slug> [--dry-run] [--send] [--force]\n\n' +
        "  (no flag)   create a draft in Buttondown, then review and send it there\n" +
        "  --dry-run   print the email locally; makes no API calls\n" +
        "  --send      create the draft and immediately queue it for sending\n" +
        "  --force     proceed even if an email with the same subject exists\n",
    );
    process.exit(1);
  }

  const base = siteBase();
  if (!base) {
    console.warn(
      "! NEXT_PUBLIC_SITE_URL is not set — images and links will stay relative and break in email.",
    );
  }

  const post = findPost(slug);
  const subject = post.title;
  const body = buildBody(post, base);

  if (dryRun) {
    console.log(`\n--- DRY RUN (no API calls) ---`);
    console.log(`Subject: ${subject}`);
    console.log(`Status:  ${send ? "about_to_send" : "draft"}`);
    console.log(`Body (${body.length} chars):\n`);
    console.log(body);
    return;
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    fail("BUTTONDOWN_API_KEY is not set (add it to .env.local).");
  }

  if (!force) {
    const existing = await findExistingBySubject(apiKey, subject);
    if (existing) {
      fail(
        `Buttondown already has an email titled "${subject}" (status: ${existing.status}).\n` +
          `  Delete it in Buttondown, or re-run with --force to create another.`,
      );
    }
  }

  // Always create as a draft first — never send straight from creation.
  const created = await api(apiKey, "POST", "/emails", {
    subject,
    body,
    status: "draft",
  });

  if (created.status === 401 || created.status === 403) {
    fail(`Buttondown rejected the API key (${created.status}). Check BUTTONDOWN_API_KEY.`);
  }
  if (created.status >= 400) {
    const code = created.json?.code ? ` [${created.json.code}]` : "";
    fail(`Buttondown returned ${created.status}${code}: ${created.text.slice(0, 500)}`);
  }

  const id = created.json?.id;
  console.log(`\n✓ Draft created: "${subject}"`);
  if (id) console.log(`  https://buttondown.com/emails/${id}`);

  if (!send) {
    console.log("\n  Review it in Buttondown, then hit Send.\n");
    return;
  }

  // Sending is a separate PATCH: draft -> about_to_send. Doing it this way avoids
  // the one-time confirmation header that creating with about_to_send requires.
  if (!id) fail("Draft created but no id returned, so it cannot be sent automatically.");
  const sent = await api(apiKey, "PATCH", `/emails/${id}`, { status: "about_to_send" });
  if (sent.status >= 400) {
    fail(
      `Draft created but sending failed (${sent.status}): ${sent.text.slice(0, 500)}\n` +
        `  The draft is safe in Buttondown — you can send it from there.`,
    );
  }
  console.log("\n✓ Queued for sending. Buttondown allows a few minutes to undo.\n");
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
