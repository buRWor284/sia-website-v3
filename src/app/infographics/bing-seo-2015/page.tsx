import React from "react";
import { Colophon, Subscriptions } from "@/components/bureau";
import { HRule, Mark, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";
import { INK, INK15, INK35, INK55, INK70, PAPER, PAPER2, SERIF } from "@/lib/tokens";

// =========================================================================
// The Ultimate Bing SEO Guide + Infographic
// Originally published on syedirfanajmal.com (WordPress) on 19 Dec 2015,
// revised 2021. Faithfully restored here as a Bureau-styled page with the
// original infographic as the centrepiece. Outbound links repaired to their
// current canonical destinations; obvious typos fixed; content preserved.
// =========================================================================

const INFOGRAPHIC = "/infographics/bing-seo-infographic-2015.png";

// ─── Prose style tokens (mirrors the canonical /resources article look) ───────
const P: React.CSSProperties  = { margin: "0 0 20px", fontFamily: SERIF, fontSize: 18.5, lineHeight: 1.65, color: INK };
const H2: React.CSSProperties = { margin: "2.4em 0 0.5em", fontFamily: SERIF, fontWeight: 700, fontSize: 32, lineHeight: 1.12, letterSpacing: "-0.02em", color: INK, borderTop: `1px solid ${INK}`, paddingTop: 22 };
const LEAD: React.CSSProperties = { margin: "0 0 20px", fontFamily: SERIF, fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: INK70 };

const linkStyle: React.CSSProperties = { color: INK, textDecoration: "underline", textUnderlineOffset: 3, textDecorationThickness: 1 };

// External link helper — opens in a new tab, keeps rel hygiene.
const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
    {children}
  </a>
);

const B = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ fontWeight: 700, color: INK }}>{children}</strong>
);

// Bing Webmaster Tools — the single place you now submit a site and a sitemap.
const BING_WMT = "https://www.bing.com/webmasters";
const BING_GUIDELINES = "https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a";

// =========================================================================
// PAGE
// =========================================================================
export default function BingSeoGuidePage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <style>{`
        .bs15-section { padding: 80px 56px 56px; }
        .bs15-body    { padding: 64px 56px 8px; }
        .bs15-note    { padding: 40px 56px 0; }
        .bs15-ig      { padding: 32px 56px 8px; }
        .bs15-footer  { padding: 24px 56px 64px; }
        .bs15-h1      { margin: 16px 0 22px; font-family: ${SERIF}; font-weight: 700; font-size: clamp(36px, 8vw, 64px); line-height: 0.98; letter-spacing: -0.03em; }
        @media (max-width: 680px) {
          .bs15-section, .bs15-body, .bs15-note, .bs15-ig, .bs15-footer {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .bs15-section { padding-top: 48px !important; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="bs15-section">
        <SectionMast n="00" label="The Infographics Desk · Bing SEO" />
        <div style={{ maxWidth: 820 }}>
          <Pill size={10.5} ls="0.18em">Guide + Infographic</Pill>
          <h1 className="bs15-h1">
            The Ultimate{" "}
            <span style={{ fontStyle: "italic" }}>
              <Mark>Bing SEO</Mark>
            </span>{" "}
            Guide
          </h1>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: "clamp(16px, 2.5vw, 20px)", lineHeight: 1.6, color: INK70, maxWidth: 620 }}>
            {`Bing keeps growing — and it now feeds Microsoft Copilot and a wave of AI answer engines. If you want to diversify your organic traffic beyond Google, it pays to take Bing seriously. Here is the original illustrated guide, restored in full.`}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginTop: 44, paddingTop: 24, borderTop: `1px solid ${INK15}` }}>
          {[
            { label: "Author", value: "Syed Irfan Ajmal" },
            { label: "Published", value: "First published December 19, 2015 · Restored 2026" },
            { label: "Format", value: "Illustrated guide + infographic" },
          ].map(({ label, value }) => (
            <div key={label}>
              <SCaps size={10} ls="0.14em" color={INK35}>{label}</SCaps>
              <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 15, color: INK55 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Editor's note 2026 (moved to top) ──────────────────── */}
      <section className="bs15-note">
        <div style={{ maxWidth: 760 }}>
          <SCaps size={11} ls="0.22em" color={INK55}>{`Editor's note · 2026`}</SCaps>
          <p style={{ ...P, marginTop: 12, padding: "20px 24px", background: PAPER2, border: `1px solid ${INK35}`, fontSize: 16.5, color: INK70, lineHeight: 1.6 }}>
            {`This guide first ran in December 2015. Bing has changed a great deal since — it now powers Microsoft Copilot and feeds answers to several AI search tools — but the fundamentals here still hold: get verified in `}
            <Ext href={BING_WMT}>Bing Webmaster Tools</Ext>
            {`, follow the guidelines, earn the right links, stay active socially, and diversify your content formats. For anything tactical (exact menus, sitemap steps, current limits), check the live Bing Webmaster Tools docs, since the screens have moved on since this was written.`}
          </p>
          <p style={{ ...P, marginTop: 14, fontSize: 16.5 }}>
            <a href="/infographics/bing-seo" style={{ color: INK, textDecoration: "underline", textUnderlineOffset: 3 }}>
              {`Read the fully updated 2026 edition: How to Win on Bing, and the AI answer engines it feeds →`}
            </a>
          </p>
        </div>
      </section>

      {/* ── Intro ──────────────────────────────────────────────── */}
      <section className="bs15-body">
        <div style={{ maxWidth: 760 }}>
          <p style={LEAD}>{`You can't ignore Bing anymore. Startled? Keep reading.`}</p>

          <h2 style={H2}>Why is Bing SEO important?</h2>
          <p style={P}>{`Sure, Google is still the major player here, but considering the slow-but-steady growth of Bing, it is time to take Bing SEO much more seriously.`}</p>
          <p style={P}>
            {`Most people don't want to think about Bing SEO — not because they doubt it's useful, but because it's human psychology to dislike change. Some also assume that `}
            <B>{`if your ranking is good on Google, it will be good on Bing too`}</B>
            {`. In a majority of cases, it doesn't work that way.`}
          </p>
          <p style={P}>
            {`So why not start `}<B>{`investing in Bing SEO with a bang`}</B>{`? It's the start of a good habit, and it will help you beat competitors who haven't bothered.`}
          </p>
          <p style={P}>{`Buckle up. Below are easy-to-implement tips that will help you rank higher on Bing — and the infographic that summarises the whole thing at a glance.`}</p>
        </div>
      </section>

      {/* ── The Infographic (centrepiece) ──────────────────────── */}
      <section className="bs15-ig">
        <SectionMast n="01" label="The Bing SEO Infographic" />
        <figure style={{ margin: "0 auto", maxWidth: 760, textAlign: "center" }}>
          <div style={{ border: `1px solid ${INK}`, background: PAPER2, padding: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={INFOGRAPHIC}
              alt="The Ultimate Bing SEO Guide infographic — submitting your site, on-site fixes, backlinks, social signals and content formats that help you rank on Bing."
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
          <figcaption style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK55, lineHeight: 1.5 }}>
            The Ultimate Bing SEO Guide infographic · first published 2015 ·{" "}
            <Ext href={INFOGRAPHIC}>View full size ↗</Ext>
          </figcaption>
        </figure>
      </section>

      {/* ── The Written Guide ──────────────────────────────────── */}
      <section className="bs15-ig">
        <SectionMast n="02" label="The Written Guide" />
        <div style={{ maxWidth: 760 }}>

          <h2 style={{ ...H2, marginTop: 0, borderTop: "none", paddingTop: 0 }}>3 basic steps to start Bing SEO</h2>
          <p style={P}>
            <B>1.</B>{` The first and most obvious (but ignored) step is to `}
            <Ext href={BING_WMT}>add and verify your website in Bing Webmaster Tools</Ext>{`.`}
          </p>
          <p style={P}>
            <B>2.</B>{` Give the `}<Ext href={BING_GUIDELINES}>Bing Webmaster Guidelines</Ext>{` a read. Don't worry — they aren't as long as Google's, but they matter. They spell out what Bing wants from site owners in order to rank them higher. When Bing says `}<B>{`"content is what Bing actually seeks"`}</B>{`, it means it. Consistently publish fresh, up-to-date content that helps and educates readers, and Bing will reward you.`}
          </p>
          <p style={P}>
            <B>3.</B>{` Submit your website and its sitemap inside `}<Ext href={BING_WMT}>Bing Webmaster Tools</Ext>{`. Keep the sitemap updated so Bing stays aware of structural changes — it helps the crawler index your URLs correctly.`}
          </p>

          <h2 style={H2}>5 on-site issues to resolve for Bing SEO</h2>
          <p style={P}>{`The top fixes that improve on-site quality and help you perform better on Bing:`}</p>
          <p style={P}>
            <B>1.</B>{` If you want to rank a page for "white flowers," include "white flowers" in the URL. Your URL shouldn't be random numbers or gibberish — that's bad user experience, and Bing watches signals like bounce rate and how visitors behave on your site.`}
          </p>
          <p style={P}>
            <B>2.</B>{` Use your main keyword once or twice in the first paragraph so search engines know what the page is about — but don't force it more than about three times overall. Stuffing looks unnatural and can get you penalised. The keyword should read naturally to both people and search engines.`}
          </p>
          <p style={P}>
            <B>3.</B>{` The meta description is a short summary — really a call to action — that appears in the SERP. Make it tight, include your main keyword naturally, and treat it as the core of your sales pitch: it's the reason a searcher clicks your link instead of someone else's.`}
          </p>
          <p style={P}>
            <B>4.</B>{` Use one primary keyword per page plus a few related secondary keywords. And always do a thorough keyword-intent analysis so you understand what the audience is actually looking for.`}
          </p>
          <p style={P}>
            <B>5.</B>{` Category pages should never be empty — give them real content describing your products. You have to educate visitors throughout the buying process, and studies show category pages with content outperform those without.`}
          </p>
          <p style={P}>
            <B>Bonus.</B>{` Tidy up on-site issues and strengthen internal linking. Redirect "page not found" and other error URLs to a relevant page (or remove them), and when you link internally, point to pages that are already indexed, already earning traffic, and have higher page authority.`}
          </p>

          <h2 style={H2}>What backlinks should you get for higher Bing rankings?</h2>
          <p style={P}>
            {`Unlike Google, Bing still responds well to `}<B>{`keyword-focused backlinks`}</B>{`. Where too many exact-match anchors can get you penalised on Google, Bing is more forgiving — you could say Google is the more intelligent of the two here.`}
          </p>
          <p style={P}>
            {`So how do you do well on both without tripping either? Earn keyword-focused links mostly from sites with high `}<B>{`Domain Authority`}</B>{`, and keep your anchors generic (broad, branded text) when the linking site's authority is lower.`}
          </p>

          <h2 style={H2}>Bing rewards your social-media strength</h2>
          <p style={P}>{`Bing places real weight on a site being promoted by its followers and fans. It reads that activity positively and rewards it with higher SERP positions, so put your social channels to work to get the most out of Bing.`}</p>

          <h2 style={H2}>Bing loves more than text</h2>
          <p style={P}>{`Use great images, infographics, videos and podcasts to get your message across. Your audience will love it — and Bing handles non-text content better than Google does. Above all, Bing favours content that is original, unique, relevant, and genuinely loved by viewers.`}</p>

          <h2 style={H2}>Finally</h2>
          <p style={P}>
            {`SEO on Bing is similar to Google, but it needs a few tweaks. To enjoy higher rankings on both, `}<B>{`be yourself and be creative`}</B>{`. Create content for people — they're the ones who'll buy from you, not the search engines.`}
          </p>
          <p style={P}>
            {`Talk to your customers through your content, educate them, and guide them through the buyer's journey. Thank them well, because happy customers bring you more leads and future buyers. `}<B>{`Happy customers are your happiest promoters.`}</B>
          </p>
        </div>
      </section>

      {/* ── Footer nav ─────────────────────────────────────────── */}
      <section className="bs15-footer">
        <div style={{ maxWidth: 760, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/infographics" style={{ padding: "12px 18px", background: INK, color: PAPER, textDecoration: "none", fontFamily: "var(--font-grot)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            ← All Infographics
          </a>
          <a href="/resources/writing-tips" style={{ padding: "12px 18px", background: "transparent", color: INK, border: `1px solid ${INK}`, textDecoration: "none", fontFamily: "var(--font-grot)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Read · 100+ Writing Tips →
          </a>
        </div>
      </section>

      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}
