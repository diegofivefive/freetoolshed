import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tools/floor-plan-maker", "/tools/flowchart-maker"],
    },
    sitemap: "https://freetoolshed.com/sitemap.xml",
  };
}
