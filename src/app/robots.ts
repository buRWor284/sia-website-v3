import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/emos-platform/", "/emos-academy/pay"],
      },
    ],
    sitemap: "https://www.syedirfanajmal.com/sitemap.xml",
  };
}
