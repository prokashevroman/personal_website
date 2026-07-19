import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

type Props = {
  src?: string;
  alt?: string;
  title?: string;
};

// Fallback dimensions used when we can't read the file on disk.
const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 675;

function readDimensions(src: string): { width: number; height: number } | null {
  if (!src.startsWith("/")) return null;
  const filepath = path.join(process.cwd(), "public", src);
  if (!fs.existsSync(filepath)) return null;
  try {
    // Avoid pulling in image-size as a dep — read PNG/JPEG headers minimally,
    // or just fall back. next/image still renders with provided fallback.
    // (Real builds use sharp via next/image for optimization at request time.)
    const buf = fs.readFileSync(filepath);
    // PNG: bytes 16-19 width, 20-23 height (big-endian)
    if (buf.slice(0, 8).toString("hex") === "89504e470d0a1a0a") {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }
    // JPEG: scan for SOFn marker
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        const length = buf.readUInt16BE(i + 2);
        if (marker !== undefined && marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          const height = buf.readUInt16BE(i + 5);
          const width = buf.readUInt16BE(i + 7);
          if (width > 0 && height > 0) return { width, height };
        }
        i += 2 + length;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function MdxImage({ src, alt, title }: Props) {
  if (!src) return null;
  const dims = readDimensions(src) ?? { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
  // Optional size hint via the Markdown title — `![alt](src "w=240")` caps the
  // display width (px) and centers the image, for low-res shots that look
  // oversized stretched to the full column. Without it, fill the column as before.
  const widthHint = title?.match(/^w=(\d+)$/);
  const maxWidth = widthHint ? Number(widthHint[1]) : null;
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      title={maxWidth ? undefined : title}
      width={dims.width}
      height={dims.height}
      sizes={maxWidth ? `${maxWidth}px` : "(min-width: 768px) 720px, 100vw"}
      className={
        maxWidth
          ? "mx-auto my-8 block h-auto w-full rounded-lg"
          : "my-8 h-auto w-full rounded-lg"
      }
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    />
  );
}
