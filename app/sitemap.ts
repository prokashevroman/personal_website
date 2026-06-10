import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const posts = getAllPosts()
    .filter((p) => p.frontmatter.published)
    .map<MetadataRoute.Sitemap[number]>((post) => ({
      url: `${base}/blog/${post.frontmatter.slug}`,
      lastModified: new Date(`${post.frontmatter.date}T00:00:00Z`),
      changeFrequency: "yearly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...posts];
}
