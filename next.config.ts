import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  async redirects() {
    const p = true; // permanent: true shorthand
    return [
      // /writing → /resources (slug change)
      { source: "/writing",        destination: "/resources",        permanent: p },
      { source: "/writing/:path*", destination: "/resources/:path*", permanent: p },

      // /insights → /resources (section rename)
      { source: "/insights",        destination: "/resources",        permanent: p },
      { source: "/insights/:path*", destination: "/resources/:path*", permanent: p },

      // About (merged pages)
      { source: "/bio-of-syed-irfan-ajmal",  destination: "/about", permanent: p },
      { source: "/bio-of-syed-irfan-ajmal/", destination: "/about", permanent: p },
      { source: "/press",                    destination: "/about", permanent: p },
      { source: "/press/",                   destination: "/about", permanent: p },
      { source: "/testimonials",             destination: "/about", permanent: p },
      { source: "/testimonials/",            destination: "/about", permanent: p },
      { source: "/honors-and-awards",        destination: "/about", permanent: p },
      { source: "/honors-and-awards/",       destination: "/about", permanent: p },

      // Speaking
      { source: "/keynote-speaking-topics",  destination: "/speaking", permanent: p },
      { source: "/keynote-speaking-topics/", destination: "/speaking", permanent: p },
      { source: "/speaking-gallery",         destination: "/gallery",  permanent: p },
      { source: "/speaking-gallery/",        destination: "/gallery",  permanent: p },
      { source: "/videos",                   destination: "/gallery",  permanent: p },
      { source: "/videos/",                  destination: "/gallery",  permanent: p },

      // Writing guides (playbooks)
      { source: "/brand-yourself-for-success",                            destination: "/resources/personal-branding", permanent: p },
      { source: "/brand-yourself-for-success/",                           destination: "/resources/personal-branding", permanent: p },
      { source: "/neuromarketing-101-neuromarketing-work",                destination: "/resources/neuromarketing",    permanent: p },
      { source: "/neuromarketing-101-neuromarketing-work/",               destination: "/resources/neuromarketing",    permanent: p },
      { source: "/storytelling101-elevate-your-brand",                    destination: "/resources/storytelling",      permanent: p },
      { source: "/storytelling101-elevate-your-brand/",                   destination: "/resources/storytelling",      permanent: p },
      { source: "/writing-tips",                                          destination: "/resources/writing-tips",      permanent: p },
      { source: "/writing-tips/",                                         destination: "/resources/writing-tips",      permanent: p },
      { source: "/the-ultimate-bing-seo-guide",                           destination: "/resources/writing-tips",      permanent: p },
      { source: "/the-ultimate-bing-seo-guide/",                          destination: "/resources/writing-tips",      permanent: p },
      { source: "/become-a-good-writer",                                  destination: "/resources/writing-tips",      permanent: p },
      { source: "/become-a-good-writer/",                                 destination: "/resources/writing-tips",      permanent: p },
      { source: "/digital-tools-writers-editors",                         destination: "/resources/writing-tips",      permanent: p },
      { source: "/digital-tools-writers-editors/",                        destination: "/resources/writing-tips",      permanent: p },
      { source: "/6-productivity-hacks-entrepreneurs",                    destination: "/blog",                       permanent: p },
      { source: "/6-productivity-hacks-entrepreneurs/",                   destination: "/blog",                       permanent: p },
      { source: "/google-analytics-content-marketing",                    destination: "/blog",                       permanent: p },
      { source: "/google-analytics-content-marketing/",                   destination: "/blog",                       permanent: p },
      { source: "/maximize-ecommerce-conversions-using-product-discovery",destination: "/blog",                       permanent: p },
      { source: "/maximize-ecommerce-conversions-using-product-discovery/",destination: "/blog",                      permanent: p },

      // Infographics — each old slug → the specific interactive page or gallery
      { source: "/top-11-scientific-benefits-writing-infographic",        destination: "/infographics/writing-benefits", permanent: p },
      { source: "/top-11-scientific-benefits-writing-infographic/",       destination: "/infographics/writing-benefits", permanent: p },
      { source: "/managing-remote-teams-with-hubstaff-time-tracking",     destination: "/infographics",                  permanent: p },
      { source: "/managing-remote-teams-with-hubstaff-time-tracking/",    destination: "/infographics",                  permanent: p },
      { source: "/form-writing-habits-success-infographic",               destination: "/infographics",                  permanent: p },
      { source: "/form-writing-habits-success-infographic/",              destination: "/infographics",                  permanent: p },
      { source: "/content-ideas-from-customers-infographic",              destination: "/infographics",                  permanent: p },
      { source: "/content-ideas-from-customers-infographic/",             destination: "/infographics",                  permanent: p },

      // Contact
      { source: "/contacting-syed-irfan-ajmal",  destination: "/contact", permanent: p },
      { source: "/contacting-syed-irfan-ajmal/", destination: "/contact", permanent: p },
    ];
  },
  turbopack: {
    // Pin the workspace root so Turbopack doesn't pick up an unrelated
    // lockfile from a parent directory.
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "syedirfanajmal.com",
      },
    ],
  },
};

export default nextConfig;
