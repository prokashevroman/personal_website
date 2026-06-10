#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-{2,}/g, "-");
}

function today(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const rawTitle = process.argv.slice(2).join(" ").trim();
if (!rawTitle) {
  console.error('Usage: pnpm new:post "Post Title"');
  process.exit(1);
}

const slug = slugify(rawTitle);
if (!slug) {
  console.error(`Could not derive a slug from "${rawTitle}".`);
  process.exit(1);
}

const postsDir = path.join(process.cwd(), "content", "posts");
fs.mkdirSync(postsDir, { recursive: true });

const filepath = path.join(postsDir, `${slug}.mdx`);
if (fs.existsSync(filepath)) {
  console.error(`Refusing to overwrite ${path.relative(process.cwd(), filepath)}.`);
  process.exit(1);
}

const imagesDir = path.join(process.cwd(), "public", "images", "posts", slug);
fs.mkdirSync(imagesDir, { recursive: true });

const safeTitle = rawTitle.replace(/"/g, '\\"');

const skeleton = `---
title: "${safeTitle}"
slug: "${slug}"
date: "${today()}"
description: "TODO: write a one-sentence description for SEO + RSS."
tags: []
published: false
---

Write the opening paragraph here.

## Section heading

Body text.

{/* TODO: outline */}
`;

fs.writeFileSync(filepath, skeleton, "utf8");

console.log(`Created ${path.relative(process.cwd(), filepath)}`);
console.log(`Images go in: ${path.relative(process.cwd(), imagesDir)}/`);
console.log("Flip `published: true` and commit when ready.");
