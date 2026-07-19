#!/usr/bin/env tsx
/*
 * One-off importer: converts the raw Mobirise export of the old "Last Click City"
 * blog (content/last_click_city_archive/public_html) into MDX + images for the
 * archive module under /last-click-city/.
 *
 * Outputs (all committed as the source of truth; this script is removable after):
 *   - content/last-click-city/<slug>.mdx        (40 articles)
 *   - public/images/last-click-city/**          (only referenced images; spaces -> _)
 *   - lib/last-click-city.data.ts               (CATEGORIES + PILLAR_ORDER constants)
 *
 * Run with: pnpm import:lcc
 */
import fs from "node:fs";
import path from "node:path";
import { parse, HTMLElement, TextNode, type Node } from "node-html-parser";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "content", "last_click_city_archive", "public_html");
const OUT_DIR = path.join(ROOT, "content", "last-click-city");
const IMG_SRC_DIR = path.join(SRC_DIR, "assets", "images");
const IMG_OUT_DIR = path.join(ROOT, "public", "images", "last-click-city");
const DATA_FILE = path.join(ROOT, "lib", "last-click-city.data.ts");

// Files that are not articles.
const NON_ARTICLE = new Set([
  "index.html",
  "attribution-models.html",
  "google-analytics.html",
  "google-bigquery.html",
  "google-tag-manager.html",
  "google931a1876fc2f55cb.html",
]);
const CATEGORY_FILES = [
  "attribution-models",
  "google-analytics",
  "google-bigquery",
  "google-tag-manager",
];

// Root-level assets used by the archive chrome (hero + logo fallback).
const EXTRA_IMAGES = ["city-1879x701v3.png", "logo-122x244.png"];

// Every image path (relative to assets/images, original spelling) we actually
// reference, so we copy only those.
const referencedImages = new Set<string>();

// ---------------------------------------------------------------------------
// Entity decoding
// ---------------------------------------------------------------------------
const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  bull: "•", middot: "·", hellip: "…", mdash: "—", ndash: "–",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", sbquo: "‚", bdquo: "„",
  laquo: "«", raquo: "»", copy: "©", reg: "®", trade: "™", deg: "°",
  times: "×", divide: "÷", plusmn: "±", frac12: "½", frac14: "¼", frac34: "¾",
  sup2: "²", sup3: "³", euro: "€", pound: "£", cent: "¢", yen: "¥",
  sect: "§", para: "¶", dagger: "†", Dagger: "‡", permil: "‰",
  prime: "′", Prime: "″", larr: "←", rarr: "→", uarr: "↑", darr: "↓",
  harr: "↔", rArr: "⇒", hArr: "⇔", infin: "∞", ne: "≠", le: "≤", ge: "≥",
  asymp: "≈", equiv: "≡", sum: "∑", prod: "∏", radic: "√", int: "∫",
  isin: "∈", notin: "∉", cap: "∩", cup: "∪", sube: "⊆", supe: "⊇",
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", pi: "π", sigma: "σ",
  mu: "µ", lambda: "λ", theta: "θ", omega: "ω", Delta: "Δ", Sigma: "Σ",
  ordm: "º", ordf: "ª", shy: "", ensp: " ", emsp: " ", thinsp: " ", zwnj: "", zwj: "",
};

function decode(input: string | undefined): string {
  if (!input) return "";
  return input.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (m, ent: string) => {
    if (ent[0] === "#") {
      const code =
        ent[1] === "x" || ent[1] === "X"
          ? parseInt(ent.slice(2), 16)
          : parseInt(ent.slice(1), 10);
      return Number.isNaN(code) ? m : String.fromCodePoint(code);
    }
    const named = NAMED[ent] ?? NAMED[ent.toLowerCase()];
    return named !== undefined ? named : m;
  });
}

// ---------------------------------------------------------------------------
// Node helpers
// ---------------------------------------------------------------------------
function isEl(n: Node): n is HTMLElement {
  return n instanceof HTMLElement;
}
function isText(n: Node): n is TextNode {
  return n instanceof TextNode;
}
function tagOf(n: Node): string {
  return isEl(n) ? n.tagName?.toLowerCase() ?? "" : "";
}

const INLINE_TAGS = new Set([
  "a", "b", "strong", "i", "em", "u", "span", "code", "sup", "sub", "small",
  "font", "mark", "abbr", "cite", "s", "strike", "tt", "var", "kbd", "big",
  "img", "br", "wbr", "q", "time", "label",
]);
const BLOCK_HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const BLOCK_TAGS = new Set([
  "p", "div", "section", "article", "header", "footer", "main", "aside",
  "ul", "ol", "li", "table", "thead", "tbody", "tfoot", "tr", "td", "th",
  "pre", "blockquote", "figure", "figcaption", "hr", "dl", "dt", "dd",
  ...BLOCK_HEADINGS,
]);
const DROP_TAGS = new Set(["script", "style", "noscript", "svg", "iframe", "form", "button"]);

function hasBlockDescendant(el: HTMLElement): boolean {
  for (const c of el.childNodes) {
    if (isEl(c)) {
      const t = tagOf(c);
      if (BLOCK_TAGS.has(t) || t === "img") {
        if (t === "img") continue; // images are fine inline
        return true;
      }
      if (hasBlockDescendant(c)) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// URL / image rewriting
// ---------------------------------------------------------------------------
function rewriteImageSrc(src: string | undefined): string | null {
  let s = decode(src).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s; // external image, keep as-is
  s = s.replace(/^\.?\//, "");
  const idx = s.indexOf("assets/images/");
  if (idx === -1) return null;
  const rel = s.slice(idx + "assets/images/".length).replace(/%20/g, " ");
  referencedImages.add(rel);
  const safe = rel
    .split("/")
    .map((seg) => seg.replace(/ /g, "_"))
    .join("/");
  return `/images/last-click-city/${safe}`;
}

// Slugify an in-page anchor so the same original text produces the same id on the
// target and the same href on the link (the old blog used ids/hrefs with spaces,
// "/" and ":", which don't survive Markdown/HTML cleanly).
function anchorSlug(text: string): string {
  return decode(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function rewriteLink(href: string | undefined): string {
  const h = decode(href).trim();
  if (!h) return "";
  if (/^(mailto|tel):/i.test(h)) return h;
  if (h.startsWith("#")) {
    const frag = h.slice(1);
    return frag ? `#${anchorSlug(frag)}` : "";
  }
  const lc = h.match(/^https?:\/\/(?:www\.)?lastclick\.city\/?(.*)$/i);
  if (lc) {
    const rest = lc[1] || "";
    if (rest === "" || /^index\.html/i.test(rest)) return "/last-click-city";
    return "/last-click-city/" + rest.replace(/\.html($|[?#])/i, "$1").replace(/^\//, "");
  }
  if (/^https?:\/\//i.test(h)) return h; // other external
  if (/^index\.html($|[?#])/i.test(h)) return "/last-click-city";
  if (/^[A-Za-z0-9][A-Za-z0-9-]*\.html($|[?#])/.test(h)) {
    return "/last-click-city/" + h.replace(/\.html($|[?#])/i, "$1");
  }
  // A relative href containing whitespace can't be a real path — it's an in-page
  // anchor that lost its leading '#' in the original (e.g. the SUBQUERIES TOC link).
  if (/\s/.test(h)) return `#${anchorSlug(h)}`;
  return h;
}

// ---------------------------------------------------------------------------
// Inline serialization
// ---------------------------------------------------------------------------
function escapeText(raw: string): string {
  return decode(raw)
    .replace(/\s+/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "\\*") // bold/italic are emitted as <strong>/<em>, so a literal * is always text
    .replace(/</g, "&lt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function renderImage(el: HTMLElement): string {
  const newSrc = rewriteImageSrc(el.getAttribute("src"));
  if (!newSrc) return "";
  const alt = decode(el.getAttribute("alt")).replace(/\s+/g, " ").replace(/[[\]]/g, "").trim();
  return `![${alt}](${newSrc})`;
}

function serializeInline(nodes: Node[]): string {
  let out = "";
  for (const n of nodes) {
    if (isText(n)) {
      out += escapeText(n.rawText);
      continue;
    }
    if (!isEl(n)) continue;
    const tag = tagOf(n);
    if (DROP_TAGS.has(tag)) continue;
    const inner = () => serializeInline(n.childNodes);
    switch (tag) {
      case "br":
        out += "  \n";
        break;
      case "b":
      case "strong": {
        // Emit HTML rather than ** — CommonMark won't close **word,**next when
        // the emphasis is glued to adjacent punctuation/text (a real case here),
        // and HTML tags render faithfully regardless of surrounding characters.
        // Keep inner whitespace (a space can live inside the tag, e.g. "data, ");
        // the browser collapses runs, so this can't create double spaces.
        const t = inner();
        if (t.trim()) out += `<strong>${t}</strong>`;
        break;
      }
      case "i":
      case "em":
      case "cite":
      case "var": {
        const t = inner();
        if (t.trim()) out += `<em>${t}</em>`;
        break;
      }
      case "code":
      case "tt":
      case "kbd": {
        const t = decode(n.rawText).replace(/\s+/g, " ").trim();
        if (!t) break;
        out += t.includes("`") ? `\`\` ${t} \`\`` : `\`${t}\``;
        break;
      }
      case "sup":
        out += `<sup>${inner().trim()}</sup>`;
        break;
      case "sub":
        out += `<sub>${inner().trim()}</sub>`;
        break;
      case "a": {
        const href = rewriteLink(n.getAttribute("href"));
        const t = inner().trim();
        if (!href) out += t;
        else out += `[${t || href}](${href})`;
        break;
      }
      case "img":
        out += renderImage(n);
        break;
      default:
        out += inner();
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Block serialization
// ---------------------------------------------------------------------------
const BULLET_RE = /^[•·▪◦‣-]\s+/;

function renderParagraph(nodes: Node[]): string[] {
  const s = serializeInline(nodes).replace(/[ \t]+$/gm, "");
  const trimmed = s.trim();
  if (!trimmed) return [];

  // Bullet runs: a paragraph that is one or more <br>-separated bullet lines,
  // or a single line beginning with a bullet glyph.
  const lines = s.split(/\n/).map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);
  const bulletLines = nonEmpty.filter((l) => /^[•·▪◦‣]\s*/.test(l));
  if (bulletLines.length && bulletLines.length === nonEmpty.length) {
    const items = nonEmpty.map((l) => "- " + l.replace(/^[•·▪◦‣]\s*/, "").trim());
    return [items.join("\n")];
  }

  // Numbered paragraphs ("1.", "2)") are prose in the original, not <ol> items —
  // escape the marker so Markdown keeps them as paragraphs.
  const numbered = trimmed.replace(/^(\d+)([.)])(\s+)/, "$1\\$2$3");
  return [numbered];
}

function renderList(el: HTMLElement, ordered: boolean): string {
  const out: string[] = [];
  let i = 0;
  // Malformed Mobirise lists put content directly under <ul>: bullet sub-items as
  // loose "&bull; <a>…</a>" text+inline between <li>s, and sometimes tables. Buffer
  // inline runs (so links survive) and emit them in document order — sub-item
  // bullets get indented under the preceding item; block children pass through.
  const tail: string[] = []; // non-bullet inline content + block children, appended after the list
  let inlineBuf: Node[] = [];
  const flushInline = () => {
    if (!inlineBuf.length) return;
    const blocks = renderParagraph(inlineBuf);
    inlineBuf = [];
    for (const b of blocks) {
      // Bullet sub-items nest under the preceding item; anything else (a stray
      // image, prose) is appended after the list, as it was before.
      if (out.length && /^\s*[-*]\s/.test(b)) {
        out.push(b.split("\n").map((l) => `  ${l}`).join("\n"));
      } else {
        tail.push(b);
      }
    }
  };
  for (const child of el.childNodes) {
    const t = tagOf(child);
    if (t === "li") {
      flushInline();
      const content = serializeBlocks(child as HTMLElement).join("\n\n").trim();
      if (!content) continue;
      const marker = ordered ? `${++i}. ` : "- ";
      const pad = " ".repeat(marker.length);
      out.push(
        content
          .split("\n")
          .map((line, idx) => (idx === 0 ? marker + line : pad + line))
          .join("\n"),
      );
    } else if (isText(child) || INLINE_TAGS.has(t)) {
      inlineBuf.push(child);
    } else if (isEl(child)) {
      flushInline();
      tail.push(...renderBlockElement(child as HTMLElement));
    }
  }
  flushInline();
  return [out.join("\n"), ...tail].filter((s) => s.trim()).join("\n\n");
}

function renderCode(pre: HTMLElement): string {
  // node-html-parser treats <pre> as a raw-text element, so the nested
  // <code class="language-X"> arrives as literal text in rawText, not as a
  // child element. Recover the language and strip the wrapper tags by hand.
  const raw = pre.rawText ?? "";
  const preClass = pre.getAttribute("class") ?? "";
  let lang = (
    raw.match(/language-([\w+#-]+)/i)?.[1] ??
    preClass.match(/language-([\w+#-]+)/i)?.[1] ??
    ""
  ).toLowerCase();
  if (lang === "bsh") lang = "bash";
  else if (lang === "js") lang = "javascript";
  else if (lang === "py") lang = "python";
  if (lang === "prettyprint" || lang === "prettyprinted" || lang === "lang") lang = "";
  let code = raw.replace(/<\/?code\b[^>]*>/gi, "").replace(/<\/?pre\b[^>]*>/gi, "");
  code = decode(code).replace(/\r\n/g, "\n").replace(/^\n+/, "").replace(/[ \t\n]+$/, "");
  let fence = "```";
  while (code.includes(fence)) fence += "`";
  return `${fence}${lang}\n${code}\n${fence}`;
}

// A table is a real data table only if no cell holds an image or block content.
function isDataTable(table: HTMLElement): boolean {
  for (const cell of table.querySelectorAll("td, th")) {
    if (cell.querySelector("img, table, ul, ol, pre, blockquote, h1, h2, h3, h4")) return false;
    const pCount = cell.querySelectorAll("p").length;
    if (pCount > 1) return false;
  }
  return true;
}

function cellText(cell: HTMLElement): string {
  return serializeInline(cell.childNodes).replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|").trim();
}

function renderTable(table: HTMLElement): string {
  const rows = table.querySelectorAll("tr");
  if (!rows.length) return "";

  if (!isDataTable(table)) {
    // Layout table (side-by-side images/prose): flatten each cell's content into
    // the normal block flow, which renders faithfully where GFM cannot.
    const blocks: string[] = [];
    for (const row of rows) {
      for (const cell of row.querySelectorAll("td, th")) {
        blocks.push(...serializeBlocks(cell));
      }
    }
    return blocks.join("\n\n");
  }

  // GFM data table. Use the first row as the header (promote <td> to header if
  // the row has no <th>).
  const matrix = rows.map((r) =>
    r.childNodes.filter((c) => tagOf(c) === "td" || tagOf(c) === "th").map((c) => cellText(c as HTMLElement)),
  );
  const width = Math.max(...matrix.map((r) => r.length));
  const pad = (r: string[]) => [...r, ...Array(width - r.length).fill("")];
  const [header, ...body] = matrix;
  const head = pad(header ?? []).map((c) => c || " ");
  const lines = [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...body.map((r) => `| ${pad(r).map((c) => c || " ").join(" | ")} |`),
  ];
  return lines.join("\n");
}

function renderBlockElement(el: HTMLElement): string[] {
  const tag = tagOf(el);
  if (DROP_TAGS.has(tag)) return [];
  if (el.getAttribute("id") === "disqus_thread") return [];
  const anchorId = el.getAttribute("id");
  switch (tag) {
    case "p": {
      // A <p> with an id is an anchor target (a pseudo-heading or footnote on the
      // old blog). Emit it as HTML so the id survives for in-page links.
      if (anchorId && !hasBlockDescendant(el)) {
        const inline = serializeInline(el.childNodes).replace(/\s+/g, " ").trim();
        return inline ? [`<p id="${anchorSlug(anchorId)}">${inline}</p>`] : [];
      }
      return hasBlockDescendant(el) ? serializeBlocks(el) : renderParagraph(el.childNodes);
    }
    case "div":
    case "section":
    case "article":
    case "header":
    case "footer":
    case "main":
    case "aside":
    case "figure":
    case "dl":
      return serializeBlocks(el);
    case "figcaption":
    case "dt":
    case "dd":
      return renderParagraph(el.childNodes);
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const level = Number(tag[1]);
      const t = serializeInline(el.childNodes).replace(/\s+/g, " ").trim();
      if (!t) return [];
      // Preserve an explicit id (a TOC anchor target) by emitting an HTML heading.
      if (anchorId) return [`<h${level} id="${anchorSlug(anchorId)}">${t}</h${level}>`];
      return [`${"#".repeat(level)} ${t}`];
    }
    case "ul":
    case "ol": {
      // A list with no direct <li> is a malformed wrapper — pass through so
      // nested lists/tables/prose inside it are still reached.
      if (!el.childNodes.some((c) => tagOf(c) === "li")) return serializeBlocks(el);
      return [renderList(el, tag === "ol")].filter((s) => s.trim());
    }
    case "pre":
      return [renderCode(el)];
    case "blockquote": {
      const inner = serializeBlocks(el).join("\n\n").trim();
      if (!inner) return [];
      return [inner.split("\n").map((l) => (l ? `> ${l}` : ">")).join("\n")];
    }
    case "table":
      return [renderTable(el)].filter(Boolean);
    case "hr":
      return ["---"];
    case "br":
      return [];
    case "img":
      return [renderImage(el)].filter(Boolean);
    default:
      return serializeBlocks(el);
  }
}

function serializeBlocks(node: HTMLElement): string[] {
  const blocks: string[] = [];
  let inlineBuf: Node[] = [];
  const flush = () => {
    if (!inlineBuf.length) return;
    blocks.push(...renderParagraph(inlineBuf));
    inlineBuf = [];
  };
  for (const child of node.childNodes) {
    if (isText(child)) {
      inlineBuf.push(child);
      continue;
    }
    if (!isEl(child)) continue;
    const tag = tagOf(child);
    // An inline tag that wraps block content is malformed source (e.g. a
    // mis-nested `<b><i>x</b></i>` leaves headings/paragraphs trapped inside a
    // bold tag). Treat it as a block container so the nested structure survives
    // instead of the whole rest of the article rendering bold.
    if (INLINE_TAGS.has(tag) && !hasBlockDescendant(child)) {
      inlineBuf.push(child);
    } else {
      flush();
      blocks.push(...renderBlockElement(child));
    }
  }
  flush();
  return blocks.filter((b) => b.trim() !== "");
}

function htmlBodyToMdx(container: HTMLElement): string {
  return serializeBlocks(container).join("\n\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

// The old index/category cards showed each article's opening paragraph as the
// preview — a bold lead phrase followed by regular text. That paragraph is
// exactly the article's first prose block, which we parse reliably (more robust
// than re-parsing the 40 deeply-malformed cards). Split it into the bold lead
// and the rest, both as plain text (tags/markdown stripped, entities decoded).
function plainText(s: string): string {
  return decode(
    s
      .replace(/<[^>]+>/g, "") // strong/em/sup/sub tags
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
      .replace(/\\([\\`*_{}[\]()#+.!-])/g, "$1") // undo markdown escapes
      .replace(/[`*_]/g, ""), // stray markers
  )
    .replace(/\s+/g, " ")
    .trim();
}

function excerptParts(body: string): { lead: string; rest: string } {
  const block = body
    .split(/\n{2,}/)
    .find((b) => b.trim() && !/^(#{1,6}\s|```|\||>|!\[|\s*[-*+]\s|\d+\\?[.)]\s)/.test(b.trim()));
  if (!block) return { lead: "", rest: "" };
  const m = block.match(/^\s*<strong>([\s\S]*?)<\/strong>([\s\S]*)$/);
  if (m) return { lead: plainText(m[1]), rest: plainText(m[2]) };
  return { lead: "", rest: plainText(block) };
}

// ---------------------------------------------------------------------------
// Frontmatter helpers
// ---------------------------------------------------------------------------
const MONTHS: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

function toISO(dateText: string): string | null {
  const m = dateText.match(/([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!m) return null;
  const mm = MONTHS[m[1].toLowerCase()];
  if (!mm) return null;
  return `${m[3]}-${mm}-${String(Number(m[2])).padStart(2, "0")}`;
}

function metaContent(root: HTMLElement, sel: string): string {
  const el = root.querySelector(sel);
  return el ? decode(el.getAttribute("content")).trim() : "";
}

function yaml(value: string): string {
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// Card parsing (index + category pages)
// ---------------------------------------------------------------------------
// The card teaser is authored per card (not always the article's opening), so we
// must read it from the index/category page to match the old blog exactly.
type Card = { slug: string; thumbnail: string | null; lead: string; rest: string };

function cleanText(el: HTMLElement): string {
  return decode(el.text).replace(/\s+/g, " ").trim();
}

// Whole-page parses of the 40-card index mis-nest in node-html-parser, dropping
// most excerpts. Slice the page into one chunk per card (each starts at a
// `.mbr-figure`) and parse those small fragments, which nest cleanly.
function parseCards(rawHtml: string): Card[] {
  const section = extractContent6Html(rawHtml) ?? rawHtml;
  const chunks = section
    .split(/(?=<div class="mbr-figure)/i)
    .filter((c) => /continue reading/i.test(c));
  const cards: Card[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    const frag = parse(chunk, { comment: false });
    const anchor = frag
      .querySelectorAll("a")
      .find((a) => /continue reading/i.test(decode(a.text)));
    if (!anchor) continue;
    const href = decode(anchor.getAttribute("href")).trim();
    const m = href.match(/^([A-Za-z0-9][A-Za-z0-9-]*)\.html/);
    if (!m || seen.has(m[1])) continue;
    const slug = m[1];
    seen.add(slug);

    const img = frag.querySelector(".mbr-figure img");
    const thumbnail = img ? rewriteImageSrc(img.getAttribute("src")) : null;

    // Excerpt = the card text with title, date and the "Continue reading" link
    // removed. Reading the whole text box avoids the p-nesting that node-html-parser
    // gets wrong on the older cards.
    const box = frag.querySelector(".mbr-section-text") ?? frag;
    const strong = box.querySelector("strong, b");
    const lead = strong ? cleanText(strong) : "";
    box.querySelector("h2")?.remove();
    for (const p of box.querySelectorAll("p")) {
      if (/^[A-Za-z]+\s+\d{1,2},\s+\d{4}\b/.test(decode(p.text).trim())) {
        p.remove();
        break;
      }
    }
    anchor.remove();
    const full = cleanText(box).replace(/\s*continue reading\s*$/i, "").trim();
    const rest = lead && full.startsWith(lead) ? full.slice(lead.length).trim() : full;

    cards.push({ slug, thumbnail, lead, rest });
  }
  return cards;
}

function categoryTitle(root: HTMLElement, fallback: string): string {
  const t = decode(root.querySelector("title")?.text ?? "").trim();
  const m = t.match(/Last Click City\s*::\s*(.+)$/i);
  return m ? m[1].trim() : fallback;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function readHtml(name: string): HTMLElement {
  const raw = fs.readFileSync(path.join(SRC_DIR, name), "utf8");
  return parse(raw, { comment: false });
}

// The page sections (menu / content6 / footer3) are siblings, never nested. A
// couple of the larger articles contain stray tags that make node-html-parser
// mis-nest (or drop) the whole content section during a full-document parse. To
// stay robust, slice the content6 section straight out of the raw HTML and parse
// just that fragment; a block-walker over the fragment is immune to the internal
// div mis-nesting that would otherwise truncate the body.
function extractContent6Html(raw: string): string | null {
  const start = raw.match(/<section[^>]*\bcontent6\b[^>]*>/i);
  if (start?.index === undefined) return null;
  const rest = raw.slice(start.index);
  const end = rest.search(/<\/section>/i);
  return end === -1 ? rest : rest.slice(0, end + "</section>".length);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(IMG_OUT_DIR, { recursive: true });

  // 1. Index cards -> pillar order + per-slug thumbnail/excerpt.
  const indexCards = parseCards(fs.readFileSync(path.join(SRC_DIR, "index.html"), "utf8"));
  const cardBySlug = new Map(indexCards.map((c) => [c.slug, c]));
  const pillarOrder = indexCards.map((c) => c.slug);

  // 2. Category pages -> CATEGORIES.
  const categories = CATEGORY_FILES.map((slug) => {
    const root = readHtml(`${slug}.html`);
    const members = parseCards(fs.readFileSync(path.join(SRC_DIR, `${slug}.html`), "utf8")).map(
      (c) => c.slug,
    );
    return { slug, title: categoryTitle(root, slug), articleSlugs: members };
  });

  // 3. Articles.
  const articleFiles = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".html") && !NON_ARTICLE.has(f))
    .sort();

  let bylineCount = 0;
  const written: string[] = [];
  for (const file of articleFiles) {
    const slug = file.replace(/\.html$/, "");
    const rawHtml = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
    const root = parse(rawHtml, { comment: false }); // for <head> meta only
    const sectionHtml = extractContent6Html(rawHtml);
    if (!sectionHtml) {
      console.warn(`! No content section in ${file}`);
      continue;
    }
    // Serialize the whole content6 fragment: it holds only the article (title,
    // date, byline, body, disqus) wrapped in structural divs.
    const container = parse(sectionHtml, { comment: false });

    // Strip chrome that must not appear in the body.
    container.querySelectorAll(".rrssb-buttons, script, noscript, style, #disqus_thread").forEach((n) => n.remove());

    // Title (first heading).
    const heading = container.querySelector("h1, h2, h3");
    const title = decode(heading?.text ?? "").replace(/\s+/g, " ").trim() ||
      metaContent(root, 'meta[property="og:title"]') ||
      slug;
    heading?.remove();

    // Date (first paragraph that looks like "Month D, YYYY").
    let date: string | null = null;
    for (const p of container.querySelectorAll("p")) {
      const iso = toISO(decode(p.text).trim());
      if (iso && /^[A-Za-z]+\s+\d/.test(decode(p.text).trim())) {
        date = iso;
        p.remove();
        break;
      }
    }

    // Byline.
    let author: string | undefined;
    let authorUrl: string | undefined;
    for (const p of container.querySelectorAll("p")) {
      if (/an article by/i.test(decode(p.text))) {
        const a = p.querySelector("a");
        author = decode(a?.text ?? p.text)
          .replace(/.*an article by/i, "")
          .replace(/\s+/g, " ")
          .trim();
        authorUrl = a ? rewriteLink(a.getAttribute("href")) : undefined;
        p.remove();
        break;
      }
    }
    if (author) bylineCount++;

    const description =
      metaContent(root, 'meta[name="description"]') ||
      metaContent(root, 'meta[property="og:description"]') ||
      cardBySlug.get(slug)?.rest ||
      title;
    const originalUrl =
      metaContent(root, 'meta[property="og:url"]') || `https://lastclick.city/${file}`;

    const card = cardBySlug.get(slug);
    const body = htmlBodyToMdx(container);
    // Card preview: the teaser authored on the old index (bold lead + rest). Fall
    // back to the article's opening paragraph, then the description.
    const bodyParts = excerptParts(body);
    let excerptLead = "";
    let excerpt = "";
    if (card && (card.lead || card.rest)) {
      excerptLead = card.lead;
      excerpt = card.rest;
    } else {
      excerptLead = bodyParts.lead;
      excerpt = bodyParts.rest;
    }
    if (!excerptLead && !excerpt) excerpt = description;

    const fm: string[] = [
      `title: ${yaml(title)}`,
      `slug: ${yaml(slug)}`,
      `date: ${yaml(date ?? "")}`,
      `description: ${yaml(description)}`,
    ];
    if (author) fm.push(`author: ${yaml(author)}`);
    if (authorUrl) fm.push(`authorUrl: ${yaml(authorUrl)}`);
    fm.push(`originalUrl: ${yaml(originalUrl)}`);
    if (card?.thumbnail) fm.push(`thumbnail: ${yaml(card.thumbnail)}`);
    if (excerptLead) fm.push(`excerptLead: ${yaml(excerptLead)}`);
    if (excerpt) fm.push(`excerpt: ${yaml(excerpt)}`);

    const mdx = `---\n${fm.join("\n")}\n---\n\n${body}`;
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.mdx`), mdx, "utf8");
    written.push(slug);
    if (!date) console.warn(`! No date found for ${slug}`);
  }

  // 4. Copy referenced images (+ chrome extras), renaming spaces -> _.
  for (const name of EXTRA_IMAGES) referencedImages.add(name);
  let copied = 0;
  const missing: string[] = [];
  for (const rel of referencedImages) {
    const from = path.join(IMG_SRC_DIR, rel);
    if (!fs.existsSync(from)) {
      missing.push(rel);
      continue;
    }
    const safe = rel
      .split("/")
      .map((seg) => seg.replace(/ /g, "_"))
      .join("/");
    const to = path.join(IMG_OUT_DIR, safe);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    copied++;
  }

  // 5. Generated data module.
  const dataTs =
    `// GENERATED by scripts/import-last-click-city.ts — do not edit by hand.\n` +
    `// Category membership + pillar (index) ordering recovered from the old blog.\n\n` +
    `export type ArchiveCategory = { slug: string; title: string; articleSlugs: string[] };\n\n` +
    `export const CATEGORIES: ArchiveCategory[] = ${JSON.stringify(categories, null, 2)};\n\n` +
    `export const PILLAR_ORDER: string[] = ${JSON.stringify(pillarOrder, null, 2)};\n`;
  fs.writeFileSync(DATA_FILE, dataTs, "utf8");

  // Report.
  console.log(`\nArticles written : ${written.length}`);
  console.log(`Bylines (Sergey) : ${bylineCount}`);
  console.log(`Pillar cards     : ${pillarOrder.length}`);
  console.log(`Categories       : ${categories.map((c) => `${c.slug}(${c.articleSlugs.length})`).join(", ")}`);
  console.log(`Images copied    : ${copied}`);
  if (missing.length) console.warn(`Images MISSING   : ${missing.join(", ")}`);
  const orphanCards = pillarOrder.filter((s) => !written.includes(s));
  if (orphanCards.length) console.warn(`Cards w/o article: ${orphanCards.join(", ")}`);
}

main();
