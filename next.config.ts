import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // pdfkit is a native Node.js module — tell Next.js not to bundle it with webpack
  serverExternalPackages: ["pdfkit"],
  async redirects() {
    const p = true; // permanent: true shorthand
    return [
      // /writing → /resources (slug change)
      { source: "/writing",        destination: "/resources",        permanent: p },
      { source: "/writing/:path*", destination: "/resources/:path*", permanent: p },

      // /insights → /resources (section rename)
      { source: "/insights",        destination: "/resources",        permanent: p },
      { source: "/insights/:path*", destination: "/resources/:path*", permanent: p },

      // /blog → /resources (retiring blog)
      { source: "/blog",        destination: "/resources",        permanent: p },
      { source: "/blog/:path*", destination: "/resources/:path*", permanent: p },

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
      { source: "/the-ultimate-bing-seo-guide",                           destination: "/infographics/bing-seo",       permanent: p },
      { source: "/the-ultimate-bing-seo-guide/",                          destination: "/infographics/bing-seo",       permanent: p },
      { source: "/become-a-good-writer",                                  destination: "/resources",      permanent: p },
      { source: "/become-a-good-writer/",                                 destination: "/resources",      permanent: p },
      { source: "/digital-tools-writers-editors",                         destination: "/resources",      permanent: p },
      { source: "/digital-tools-writers-editors/",                        destination: "/resources",      permanent: p },
      { source: "/6-productivity-hacks-entrepreneurs",                    destination: "/resources",                       permanent: p },
      { source: "/6-productivity-hacks-entrepreneurs/",                   destination: "/resources",                       permanent: p },
      { source: "/google-analytics-content-marketing",                    destination: "/resources",                       permanent: p },
      { source: "/google-analytics-content-marketing/",                   destination: "/resources",                       permanent: p },
      { source: "/maximize-ecommerce-conversions-using-product-discovery",destination: "/resources",                       permanent: p },
      { source: "/maximize-ecommerce-conversions-using-product-discovery/",destination: "/resources",                      permanent: p },

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

      // PartnerCollabIQ — renamed from CollabIQ; canonical URL is /tools/partnercollabiq
      { source: "/tools/collabiq",                  destination: "/tools/partnercollabiq", permanent: p },
      { source: "/tools/collabiq/",                 destination: "/tools/partnercollabiq", permanent: p },
      { source: "/tools/collab-link-building",      destination: "/tools/partnercollabiq", permanent: p },
      { source: "/tools/collab-link-building/",     destination: "/tools/partnercollabiq", permanent: p },
      { source: "/resources/collab-link-building",  destination: "/tools/partnercollabiq", permanent: p },
      { source: "/resources/collab-link-building/", destination: "/tools/partnercollabiq", permanent: p },

      // Clerk invite links use /signup (no hyphen) → canonical /sign-up
      { source: "/signup",        destination: "/sign-up",        permanent: false },
      { source: "/signup/:path*", destination: "/sign-up/:path*", permanent: false },

      // Legacy WordPress cleanup (added 2026-06-17)
      // Deleted author archives (e.g. /author/joceylnbrown) -> home
      { source: "/author",        destination: "/", permanent: p },
      { source: "/author/:path*", destination: "/", permanent: p },
      // Old blog taxonomy archives -> resources (closest live equivalent)
      { source: "/category",        destination: "/resources", permanent: p },
      { source: "/category/:path*", destination: "/resources", permanent: p },
      { source: "/tag",        destination: "/resources", permanent: p },
      { source: "/tag/:path*", destination: "/resources", permanent: p },
      // Old WP pagination archives -> section root
      { source: "/page/:path*",         destination: "/",        permanent: p },
      { source: "/podcast/page",        destination: "/podcast", permanent: p },
      { source: "/podcast/page/:path*", destination: "/podcast", permanent: p },
      // Old root-level podcast episode slugs -> canonical /podcast/<slug>
      { source: "/faisal-khan-interview",   destination: "/podcast/faisal-khan-interview",   permanent: p },
      { source: "/faisal-khan-interview/",  destination: "/podcast/faisal-khan-interview",   permanent: p },
      { source: "/greg-heilers-interview",  destination: "/podcast/greg-heilers-interview",  permanent: p },
      { source: "/greg-heilers-interview/", destination: "/podcast/greg-heilers-interview",  permanent: p },
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
