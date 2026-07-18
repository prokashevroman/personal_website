import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import type { ArchivePost } from "@/lib/last-click-city";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Read PNG/JPEG intrinsic size at build time (same idea as MdxImage) so next/image
// gets real dimensions and there's no layout shift. Falls back to a 3:2 box.
const FALLBACK = { width: 1200, height: 800 };
function readDimensions(src: string): { width: number; height: number } {
  if (!src.startsWith("/")) return FALLBACK;
  const filepath = path.join(process.cwd(), "public", src);
  try {
    const buf = fs.readFileSync(filepath);
    if (buf.slice(0, 8).toString("hex") === "89504e470d0a1a0a") {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        const length = buf.readUInt16BE(i + 2);
        if (
          marker !== undefined &&
          marker >= 0xc0 &&
          marker <= 0xcf &&
          marker !== 0xc4 &&
          marker !== 0xc8 &&
          marker !== 0xcc
        ) {
          return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
        }
        i += 2 + length;
      }
    }
  } catch {
    /* fall through */
  }
  return FALLBACK;
}

export function ArchiveCard({ post }: { post: ArchivePost }) {
  const { title, slug, date, thumbnail, excerptLead, excerpt } = post.frontmatter;
  const href = `/last-click-city/${slug}`;
  const dims = thumbnail ? readDimensions(thumbnail) : null;
  return (
    <article className="flex flex-col gap-4 border-b border-rule py-8 first:pt-0 last:border-b-0 sm:flex-row sm:items-start sm:gap-6">
      {thumbnail && dims ? (
        <Link
          href={href}
          aria-hidden="true"
          tabIndex={-1}
          className="block shrink-0 sm:w-44 md:w-52"
        >
          <Image
            src={thumbnail}
            alt=""
            width={dims.width}
            height={dims.height}
            sizes="(min-width: 768px) 208px, 100vw"
            className="h-auto w-full rounded-lg border border-rule bg-white"
          />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <Link href={href} className="group block">
          <h2 className="font-display text-2xl font-semibold leading-snug tracking-tightish text-ink transition-colors group-hover:text-accent">
            {title}
          </h2>
        </Link>
        <p className="mt-1.5 text-sm text-ink-soft">{formatDate(date)}</p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          {excerptLead ? <strong className="font-semibold text-ink">{excerptLead}</strong> : null}
          {excerptLead && excerpt ? " " : null}
          {excerpt}
          {excerptLead || excerpt ? " " : null}
          <Link
            href={href}
            className="whitespace-nowrap font-medium text-accent hover:text-accent-hover"
          >
            Continue reading
          </Link>
        </p>
      </div>
    </article>
  );
}
