import type { Metadata } from "next";
import { Newsreader, Archivo, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";

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
  title: "Syed Irfan Ajmal · Fractional CMO & Earned Media Strategist",
  description:
    "Fractional CMO, international speaker, and founder of DMR.agency. " +
    "Helping founders and marketing teams get found, get covered, and get customers " +
    "through SEO-PR, GEO, and earned media.",
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${archivo.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      {/* Mailchimp embedded form validation — jQuery required by mc-validate.js */}
      <Script
        src="https://code.jquery.com/jquery-3.7.1.min.js"
        strategy="lazyOnload"
      />
      <Script
        src="//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js"
        strategy="lazyOnload"
      />
      <Script id="mc-init" strategy="lazyOnload">{`
        (function($) {
          window.fnames = new Array();
          window.ftypes = new Array();
          fnames[0]='EMAIL'; ftypes[0]='email';
          fnames[1]='MMERGE1'; ftypes[1]='text';
        }(jQuery));
        var $mcj = jQuery.noConflict(true);
      `}</Script>
    </html>
  );
}
