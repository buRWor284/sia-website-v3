import type { Metadata } from "next";
import { Newsreader, Archivo, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title: "Syed Irfan Ajmal · The Bureau",
  description:
    "Marketing consultant, author, speaker, founder of DMR.agency. " +
    "Get found, get covered, get customers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${archivo.variable} ${jetbrains.variable}`}
    >
      <body>
        {children}
        <SpeedInsights />
      </body>
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
