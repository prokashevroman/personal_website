import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { MdxImage } from "@/components/MdxImage";

export const mdxComponents: MDXComponents = {
  img: ({ src, alt, title }) =>
    typeof src === "string" ? <MdxImage src={src} alt={alt} title={title} /> : null,
};
