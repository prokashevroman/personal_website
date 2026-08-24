import { z } from "zod";

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  // Optional revision date. Surfaces as og:modified_time and schema.org
  // dateModified so a substantive rewrite can be re-crawled as fresh content.
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "updated must be YYYY-MM-DD")
    .optional(),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export const subscribeInputSchema = z.object({
  email: z.string().email(),
});

export type SubscribeInput = z.infer<typeof subscribeInputSchema>;

export const contactInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(200).optional().default(""),
  message: z.string().min(20).max(5000),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

// Honeypot is checked before schema validation so a bot that fills it
// gets a silent 200 instead of leaking the field's existence via a 400.
export function hasHoneypot(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const website = (payload as Record<string, unknown>).website;
  return typeof website === "string" && website.length > 0;
}
