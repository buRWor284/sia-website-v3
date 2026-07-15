import type { Metadata } from "next";
import { Newsreader, Archivo, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteHeaderConditional } from "@/components/SiteHeaderConditional";
import "./globals.css";
import "./mobile-optimization.css"; // loaded after globals so mobile overrides win the cascade

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.syedirfanajmal.com"),
  // Provides the homepage canonical; all other pages override this via their own alternates.canonical
  alternates: { canonical: "/" },
  title: {
    default: "Syed Irfan Ajmal · Fractional CMO & Earned Media Strategist",
    template: "%s · Syed Irfan Ajmal",
  },
  description:
    "Fractional CMO and founder of DMR.agency. Helping founders and marketing teams get found, get covered, and get customers through GEO, SEO-PR, and earned media.",
  openGraph: {
    type: "website",
    siteName: "Syed Irfan Ajmal",
    title: "Syed Irfan Ajmal · Fractional CMO & Earned Media Strategist",
    description:
      "Fractional CMO, international speaker, and founder of DMR.agency — GEO, SEO-PR, and earned media.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@syedirfanajmal",
    creator: "@syedirfanajmal",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
};

// Site-wide structured data (Person + Organization + WebSite).
// Rendered on every route so search engines have a stable entity graph.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.syedirfanajmal.com/#person",
      name: "Syed Irfan Ajmal",
      url: "https://www.syedirfanajmal.com",
      image: "https://www.syedirfanajmal.com/headshot.jpg",
      jobTitle: "Fractional CMO & Earned Media Strategist",
      description:
        "Fractional CMO, international speaker, and founder of DMR.agency. " +
        "Helping founders and marketing teams get found, get covered, and get customers " +
        "through GEO, SEO-PR, and earned media.",
      sameAs: [
        "https://www.linkedin.com/in/syedirfanajmal/",
        "https://x.com/syedirfanajmal",
        "https://twitter.com/syedirfanajmal",
        "https://youtube.com/@syedirfanajmal/",
      ],
      worksFor: { "@id": "https://dmr.agency/#organization" },
      knowsAbout: [
        "SEO",
        "Digital PR",
        "Earned Media",
        "Generative Engine Optimization",
        "Personal Branding",
        "Content Marketing",
        "Link Building",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://dmr.agency/#organization",
      name: "DMR.agency",
      url: "https://dmr.agency",
      founder: { "@id": "https://www.syedirfanajmal.com/#person" },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.syedirfanajmal.com/#website",
      url: "https://www.syedirfanajmal.com",
      name: "Syed Irfan Ajmal",
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider signInUrl="/emos-platform/signin" signUpUrl="/emos-platform/signin">
    <html
      lang="en"
      className={`${newsreader.variable} ${archivo.variable} ${jetbrains.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <SiteHeaderConditional />
        {children}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
{/* Cal.com popup embed — initialises the queue; embed.js loads lazily on first interaction */}
      <Script id="cal-init" strategy="lazyOnload">{`
        (function (C, A, L) {
          let p = function (a, ar) { a.q.push(ar); };
          let d = C.document;
          C.Cal = C.Cal || function () {
            let cal = C.Cal;
            let ar = arguments;
            if (!cal.loaded) {
              cal.ns = {};
              cal.q = cal.q || [];
              d.head.appendChild(d.createElement("script")).src = A;
              cal.loaded = true;
            }
            if (ar[0] === L) {
              const api = function () { p(api, arguments); };
              const namespace = ar[1];
              api.q = api.q || [];
              typeof namespace === "string"
                ? (cal.ns[namespace] = api) && p(api, ar)
                : p(cal, ar);
              return;
            }
            p(cal, ar);
          };
        })(window, "https://app.cal.com/embed/embed.js", "init");
        Cal("init", { origin: "https://cal.com" });
      `}</Script>
    </html>
    </ClerkProvider>
  );
}
