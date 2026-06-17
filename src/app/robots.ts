import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/emostool/", "/emos/pay"],
      },
    ],
    sitemap: "https://www.syedirfanajmal.com/sitemap.xml",
  };
}
