"use client";

/* ------------------------------------------------------------------------- *
 * EMOS landing figures (FIG 1-5).
 * The five intricate animated diagrams are kept as one self-contained client
 * component: the markup is injected as static HTML and each figure is revealed
 * (and its count-up / typewriter / sequence animations fired) on scroll via an
 * IntersectionObserver. CSS for these lives in globals.css (.fig, .f1-*, etc.).
 * ------------------------------------------------------------------------- */

import { useEffect, useRef } from "react";

const FIGS: Record<number, string> = {
  1: `<div class="fig" data-fig="1">
        <div class="sm"><div class="sm-double"></div><div class="sm-row"><span class="sm-pill">FIG. 1</span><span class="sm-label">The Press Lead Time Problem</span><div class="sm-line"></div><span class="sm-vol">§ 5 · Why Now</span></div><div class="sm-close"></div></div>
        <p class="fig-desc">Coverage takes 30 to 120 days to materialize. Start EMOS today and both tiers are live before investors run their pre-meeting search. Wait 90 days and Tier 1 doesn't arrive in time.</p>
        <div class="f1">
          <div class="f1-heroes">
            <div class="f1-hero"><div class="f1-ghost">90</div><div class="f1-count" data-count="90">0</div><div class="f1-unit">Day Lag · Tier 1 Coverage</div><p class="f1-cap">Average time from starting outreach to seeing your first Tier 1 placement appear live.</p></div>
            <div class="f1-hero dark"><div class="f1-ghost">180</div><div class="f1-count" data-count="180">0</div><div class="f1-unit">Days to Series A Window</div><p class="f1-cap">Start today. Both coverage tiers clear before VCs run their pre-meeting search at month 5.</p></div>
          </div>
          <div class="f1-bars">
            <div class="f1-axis"><span class="f1-ax hi">TODAY</span><span class="f1-ax">30D</span><span class="f1-ax">60D</span><span class="f1-ax">90D</span><span class="f1-ax">120D</span><span class="f1-ax">150D</span><span class="f1-ax hi">6 MOS.</span></div>
            <div class="f1-row"><div class="f1-rl">TIER<br>2/3</div><div class="f1-track"><div class="f1-hatch" style="width:25%;--d:.22s;"><span>30 to 45 DAY LAG</span></div><div class="f1-live" style="left:25%;width:75%;--d:.7s;"><span>TIER 2/3 PLACEMENTS LIVE</span></div></div></div>
            <div class="f1-row"><div class="f1-rl">TIER 1</div><div class="f1-track"><div class="f1-hatch" style="width:50%;--d:.42s;"><span>60 to 90 DAY LAG</span></div><div class="f1-live" style="left:50%;width:50%;--d:1s;"><span>TIER 1 LIVE</span></div></div></div>
            <div class="f1-row" style="margin-bottom:0;"><div class="f1-rl dim">VC DUE<br>DILIG.</div><div class="f1-track" style="background:rgba(26,20,16,.018);border-color:rgba(26,20,16,.07);"><div class="f1-vc"><span>VCS SEARCH</span></div></div></div>
          </div>
          <div class="f1-foot"><div class="f1-fi"><div class="f1-chip y">✓</div><span class="f1-ft">Both tiers live before VCs run their pre-meeting search, start EMOS today.</span></div><div class="f1-fi"><div class="f1-chip n">✗</div><span class="f1-ft">Wait 90 days to start and Tier 1 doesn't arrive before your Series A.</span></div></div>
        </div>
      </div>`,
  2: `<div class="fig" data-fig="2">
          <div class="sm"><div class="sm-double"></div><div class="sm-row"><span class="sm-pill">FIG. 2</span><span class="sm-label">One Placement, Five Returns</span><div class="sm-line"></div><span class="sm-vol">§ 9 · 5-Return Framework</span></div><div class="sm-close"></div></div>
          <p class="fig-desc">A single Tier 1 placement multiplies into five parallel returns, each active independently, long after the article goes live.</p>
          <div class="f2">
            <div class="f2-src">
              <div class="f2-big">1</div>
              <div class="f2-lbl">Placement</div>
              <div class="f2-srcdiv"></div>
              <div class="f2-x5lbl">&times; 5 Returns</div>
            </div>
            <div class="f2-trunk"><div class="f2-vline"></div></div>
            <div class="f2-rows">
              <div class="f2-ret" style="--d:.78s;"><div class="f2-numcol"><span class="f2-n">01</span><div class="f2-bar"></div></div><div class="f2-body"><p class="f2-title">SEO Authority</p><p class="f2-desc">A high-DA backlink lifts your domain rating; target pages rank higher for the keywords your buyers use</p></div></div>
              <div class="f2-ret" style="--d:.94s;"><div class="f2-numcol"><span class="f2-n">02</span><div class="f2-bar"></div></div><div class="f2-body"><p class="f2-title">LLM Citation</p><p class="f2-desc">ChatGPT, Perplexity, and Google AI Overviews cite credible publications, your name surfaces in AI answers</p></div></div>
              <div class="f2-ret" style="--d:1.1s;"><div class="f2-numcol"><span class="f2-n">03</span><div class="f2-bar"></div></div><div class="f2-body"><p class="f2-title">Sales Collateral</p><p class="f2-desc">"As featured in" lifts homepage trust, deck credibility, and email-signature legitimacy</p></div></div>
              <div class="f2-ret" style="--d:1.26s;"><div class="f2-numcol"><span class="f2-n">04</span><div class="f2-bar"></div></div><div class="f2-body"><p class="f2-title">Investor Proof</p><p class="f2-desc">Founders cited in Tier 1 skip the "who is this?" question before the meeting starts</p></div></div>
              <div class="f2-ret" style="--d:1.42s;"><div class="f2-numcol"><span class="f2-n">05</span><svg class="f2-signal" width="20" height="16" viewBox="0 0 20 16" fill="none"><rect x="0" y="10" width="3.5" height="6" rx="0.4" fill="#f5b81f"/><rect x="5.5" y="7" width="3.5" height="9" rx="0.4" fill="#f5b81f"/><rect x="11" y="4" width="3.5" height="12" rx="0.4" fill="#f5b81f"/><rect x="16.5" y="0" width="3.5" height="16" rx="0.4" fill="#f5b81f"/></svg></div><div class="f2-body"><p class="f2-title">Social Signal</p><p class="f2-desc">Share-worthy content for LinkedIn and X, earned coverage compounds organic reach</p></div></div>
            </div>
          </div>
        </div>`,
  3: `<div class="fig" data-fig="3">
        <div class="sm"><div class="sm-double"></div><div class="sm-row"><span class="sm-pill">FIG. 3</span><span class="sm-label">What the VC Finds · The Pre-Meeting Search</span><div class="sm-line"></div><span class="sm-vol">§ 3 · Investor Lens</span></div><div class="sm-close"></div></div>
        <p class="fig-desc">What happens when a VC looks you up five minutes before the first call, without EMOS, and after.</p>
        <div class="f3">
          <div class="f3-col f3-before">
            <span class="f3-tag">Before EMOS · The Pre-Meeting Search</span>
            <div class="f3-bar"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;opacity:.35;"><circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.3"/><line x1="7.5" y1="7.5" x2="11" y2="11" stroke="currentColor" stroke-width="1.3"/></svg><span>"[Your Name]" founder Series A</span></div>
            <div class="f3-res" style="--d:.3s;"><div class="f3-pub">companyname.com</div><div class="f3-title">Your Company | Official Website</div><div class="f3-url">companyname.com</div></div>
            <div class="f3-res" style="--d:.48s;"><div class="f3-pub">linkedin.com</div><div class="f3-title">Your Name | Co-Founder &amp; CEO, Your Company</div><div class="f3-url">linkedin.com/in/yourname</div></div>
            <div class="f3-empty">No third-party coverage found.</div>
            <div class="f3-verdict" style="--d:.9s;"><div class="f3-vl">VC's pre-meeting read</div><div class="f3-vt">"Unknown. No outside validation. Higher risk, harder to back."</div></div>
          </div>
          <div class="f3-col f3-after">
            <span class="f3-tag">After EMOS · The Same Search</span>
            <div class="f3-bar"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;opacity:.35;"><circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.3"/><line x1="7.5" y1="7.5" x2="11" y2="11" stroke="currentColor" stroke-width="1.3"/></svg><span id="f3q"></span><span class="f3-cur" id="f3c"></span></div>
            <div class="f3-res" style="--d:.5s;"><div class="f3-pub">Forbes</div><div class="f3-title">5 Founders Reshaping [Your Industry] in 2025</div><div class="f3-url">forbes.com/sites/contributor/2025/…</div></div>
            <div class="f3-res" style="--d:.7s;"><div class="f3-pub">Harvard Business Review</div><div class="f3-title">Why [Your Insight] Is Changing How Enterprises Buy</div><div class="f3-url">hbr.org/2025/03/…</div></div>
            <div class="f3-res" style="--d:.9s;"><div class="f3-pub">Yahoo Finance · Business Insider</div><div class="f3-title">Quoted as industry expert in 3 market analyses this quarter</div><div class="f3-url">finance.yahoo.com · businessinsider.com</div></div>
            <div class="f3-res" style="--d:1.1s;"><div class="f3-pub">Entrepreneur · MarketWatch</div><div class="f3-title">Named a top voice in [Your Space] by two publications</div><div class="f3-url">entrepreneur.com · marketwatch.com</div></div>
            <div class="f3-verdict" style="--d:1.45s;"><div class="f3-vl">VC's pre-meeting read</div><div class="f3-vt">"This founder has pull. They own the narrative in their space. Worth a meeting."</div></div>
          </div>
        </div>
      </div>`,
  4: `<div class="fig" data-fig="4">
        <div class="sm"><div class="sm-double"></div><div class="sm-row"><span class="sm-pill">FIG. 4</span><span class="sm-label">Cohort 1 · Week by Week</span><div class="sm-line"></div><span class="sm-vol">§ 7 · What You'll Build</span></div><div class="sm-close"></div></div>
        <p class="fig-desc">8 weeks, 2 tracks, one compounding system. Foundation closes at Week 4 with a guaranteed placement. Accelerate adds four more weeks of Tier 1 linkable asset building.</p>
        <div class="f4">
          <div class="f4-top"><div class="f4-badge">COHORT 1 · ROLLING APPLICATIONS</div></div><div class="f4-head"><div class="f4-wks"><div class="f4-wk on" style="--d:.18s;">W1</div><div class="f4-wk on" style="--d:.26s;">W2</div><div class="f4-wk on" style="--d:.34s;">W3</div><div class="f4-wk on" style="--d:.42s;">W4</div><div class="f4-wk off" style="--d:.5s;">W5</div><div class="f4-wk off" style="--d:.58s;">W6</div><div class="f4-wk off" style="--d:.66s;">W7</div><div class="f4-wk off" style="--d:.74s;">W8</div></div></div>
          <div class="f4-bars"><div class="f4-cgrid"><div class="f4-cg"></div><div class="f4-cg"></div><div class="f4-cg"></div><div class="f4-cg"></div><div class="f4-cg"></div><div class="f4-cg"></div><div class="f4-cg"></div><div class="f4-cg"></div></div><div class="f4-div"></div><div class="f4-by">FOUNDATION · WKS 1 to 4 · 1 PLACEMENT GUARANTEED IN 60 DAYS</div><div class="f4-bd">ACCELERATE · WKS 5 to 8 · 2 PLACEMENTS GUARANTEED IN 90 DAYS</div></div>
          <div class="f4-mils">
            <div class="f4-ms" style="--d:.64s;"><div class="f4-dot y" style="--d:.69s;"></div><div class="f4-mt on">Platforms<br>live</div><div class="f4-mn">Media kit<br>ready</div></div>
            <div class="f4-ms" style="--d:.79s;"><div class="f4-dot y" style="--d:.84s;"></div><div class="f4-mt on">5 templates</div><div class="f4-mn">8 to 10 pitches<br>sent</div></div>
            <div class="f4-ms" style="--d:.94s;"><div class="f4-dot y" style="--d:.99s;"></div><div class="f4-mt on">15+ pitches</div><div class="f4-mn">Tracking<br>live</div></div>
            <div class="f4-ms" style="--d:1.09s;"><div class="f4-dot y" style="--d:1.14s;"></div><div class="f4-mt on">1st placement ✓</div><div class="f4-mn">20-journalist<br>list built</div></div>
            <div class="f4-ms" style="--d:1.24s;"><div class="f4-dot d" style="--d:1.29s;"></div><div class="f4-mt off">Report<br>concept</div><div class="f4-mn">locked</div></div>
            <div class="f4-ms" style="--d:1.39s;"><div class="f4-dot d" style="--d:1.44s;"></div><div class="f4-mt off">Draft +<br>infographic</div><div class="f4-mn">in production</div></div>
            <div class="f4-ms" style="--d:1.54s;"><div class="f4-dot d" style="--d:1.59s;"></div><div class="f4-mt off">20 journalists</div><div class="f4-mn">identified</div></div>
            <div class="f4-ms" style="--d:1.69s;"><div class="f4-dot d" style="--d:1.74s;"></div><div class="f4-mt off">Report live</div><div class="f4-mn">Tier 1<br>outreach</div></div>
          </div>
        </div>
      </div>`,
  5: `<div class="fig" data-fig="5">
        <div class="sm"><div class="sm-double"></div><div class="sm-row"><span class="sm-pill">FIG. 5</span><span class="sm-label">Winning Pitch Anatomy</span><div class="sm-line"></div><span class="sm-vol">§ 10 · Curriculum · Week 2</span></div><div class="sm-close"></div></div>
        <p class="fig-desc">The five elements that separate a pitch that gets used from a press release that gets deleted. Most founders include two. EMOS builds the muscle for all five.</p>
        <div class="f5">
          <div class="f5-email">
            <div class="f5-sec" id="f5s1" style="--d:.28s;"><div class="f5-stag">To / Subject</div><div class="f5-sbody"><strong>To:</strong> [Editor, First Name] · [Publication]<br><strong>Subject:</strong> Re: New data on [beat], angle for you</div></div>
            <div class="f5-sec" id="f5s2" style="--d:.44s;"><div class="f5-stag">Opener</div><div class="f5-sbody">Hi [First name], caught your piece on [topic] last week. There's a data connection here I think you'll want.</div></div>
            <div class="f5-sec" id="f5s3" style="--d:.6s;"><div class="f5-stag">The Angle</div><div class="f5-sbody">We surveyed 400 B2B founders preparing for a Series A raise. 71% said investors ask about media presence in meeting one.<br><strong>Most aren't ready. Most advisors haven't said a word.</strong></div></div>
            <div class="f5-sec" id="f5s4" style="--d:.76s;"><div class="f5-stag">Proof + Credentials</div><div class="f5-sbody">Data + methodology available. [Pub] ran a similar angle in Q1.<br><em>[Name] · [Title], [Company] · [One-sentence credential].</em></div></div>
            <div class="f5-sec" id="f5s5" style="--d:.92s;"><div class="f5-stag">The Ask</div><div class="f5-sbody">Would 15 minutes work this week to walk through the data? Happy to give you exclusivity if you move fast. [Name]</div></div>
          </div>
          <div class="f5-anns">
            <div class="f5-ann" style="--d:.52s;"><div class="f5-pill">Subject Line</div><div class="f5-at">Beat-specific. Under 8 words. No PR boilerplate.</div></div>
            <div class="f5-ann" style="--d:.78s;"><div class="f5-pill">Opener</div><div class="f5-at">Name their article. Earn 3 more seconds of attention.</div></div>
            <div class="f5-ann" style="--d:1.04s;"><div class="f5-pill">The Angle</div><div class="f5-at">Story first. Product last. Surprise is the hook.</div></div>
            <div class="f5-ann" style="--d:1.3s;"><div class="f5-pill">Proof + Creds</div><div class="f5-at">One stat. One-line bio. Proof before credentials.</div></div>
            <div class="f5-ann" style="--d:1.56s;"><div class="f5-pill">The Ask</div><div class="f5-at">15 minutes. Low-friction. Exclusivity as the lever.</div></div>
          </div>
        </div>
      </div>`,
};

function countUp(el: HTMLElement, target: number, duration: number, delay: number) {
  window.setTimeout(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };
    requestAnimationFrame(tick);
  }, delay);
}

function typewrite(text: string, delay: number) {
  window.setTimeout(() => {
    const el = document.getElementById("f3q");
    const cur = document.getElementById("f3c");
    if (!el) return;
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) window.setTimeout(tick, 50);
      else window.setTimeout(() => { if (cur) cur.style.display = "none"; }, 1600);
    };
    tick();
  }, delay);
}

function lightSections(baseDelay: number) {
  ["f5s1", "f5s2", "f5s3", "f5s4", "f5s5"].forEach((id, i) => {
    window.setTimeout(() => {
      document.getElementById(id)?.classList.add("lit");
    }, baseDelay + i * 340);
  });
}

function onFigIn(fig: Element) {
  const n = (fig as HTMLElement).dataset.fig;
  if (n === "1")
    fig.querySelectorAll<HTMLElement>("[data-count]").forEach((el) =>
      countUp(el, Number(el.dataset.count || 0), 1400, 280)
    );
  if (n === "3") typewrite('"[Your Name]" founder Series A', 420);
  if (n === "5") lightSections(620);
}

export function Figure({ n }: { n: 1 | 2 | 3 | 4 | 5 }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const fig = root.querySelector(".fig") as HTMLElement | null;
    if (!fig) return;

    // Reveal once, by whichever trigger fires first. The IntersectionObserver is the
    // primary path; the scroll listener and timeout are fallbacks so a figure never
    // stays stuck at opacity:0 if the observer's initial callback is missed (e.g. a
    // React Strict Mode double-mount in dev, or the figure being in view on load).
    let revealed = false;
    const cleanups: Array<() => void> = [];
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      fig.classList.add("in");
      onFigIn(fig);
      cleanups.forEach((fn) => fn());
    };
    const inView = () => {
      const r = fig.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(fig);
    cleanups.push(() => io.disconnect());

    const onScroll = () => {
      if (inView()) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    const fallback = window.setTimeout(() => {
      if (inView()) reveal();
    }, 1200);
    cleanups.push(() => window.clearTimeout(fallback));

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [n]);

  const html = n === 2 ? `<div class="fig-mount">${FIGS[n]}</div>` : FIGS[n];
  return <div ref={ref} className="fig-embed" dangerouslySetInnerHTML={{ __html: html }} />;
}
