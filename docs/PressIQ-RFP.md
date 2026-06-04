# PressIQ — Request for Proposal / Build Specification

**An AI-powered journalist pitch scoring tool for syedirfanajmal.com**

| | |
|---|---|
| **Working product name** | PressIQ *(assumed from brief; rename freely — see §13, D-12)* |
| **Owner** | Syed Irfan Ajmal (SIA) |
| **Host site** | syedirfanajmal.com (Next.js 16 App Router, React 19, Tailwind v4, Vercel) |
| **Repo** | github.com/buRWor284/sia-website-v3 |
| **Proposed route** | `/tools/pressiq` (alongside existing `/tools/authority-calculator`, `/tools/collabiq`) |
| **Document status** | Draft v1 for review. Decisions marked **[RESOLVED]** are locked; **[OPEN]** decisions list options + a recommendation. |
| **Primary author of spec** | Drafted for SIA; intended to be executed by a human developer **or** an AI coding agent (e.g. Claude Code) working directly in the repo. |

---

## How to read this document

This RFP is written to be executable by a builder with no prior context on the project. It is opinionated where the evidence or the existing codebase makes one path clearly better, and it presents options where the decision is genuinely SIA's to make. Every quantitative scoring threshold traces back to a cited source in **Appendix A — Evidence Pack**.

Section map:

- **§1–§3** — Vision, goals, and exactly what ships in MVP vs. v2.
- **§4** — The scoring framework (the 3 layers), in full, with evidence-backed thresholds.
- **§5** — The one structural change to the original brief: scoring against the *query*, not just the pitch.
- **§6–§10** — UX, technical architecture, API, data model, gating, and the feedback-copy engine.
- **§11–§12** — Personal-brand layer and the research/evidence architecture.
- **§13** — Every open decision consolidated, each with a recommendation.
- **§14** — Challenges, easy wins, and the biggest blind spot (the brief's questions 8–10).
- **§15** — The source library to ground the tool on (question 11).
- **§16** — Build plan, milestones, acceptance criteria.
- **Appendices** — Evidence pack with citations, the verbatim 34-point checklist, example API payloads, and a quick-reference index answering all 11 of the brief's open questions.

---

## 1. Executive summary & product vision

PressIQ is a free, no-signup-required web tool that scores a draft PR pitch — the kind sent through HARO, Qwoted, Source of Sources, Featured, and Help a B2B Writer — and returns a composite score plus specific, mechanism-named, actionable feedback. It is not a generic email checker. It is purpose-built around one outcome: an **earned placement, brand mention, or editorial backlink** — not merely a reply.

It serves two jobs at once:

1. **A genuinely useful standalone tool** that a founder, marketer, or in-house PR person can use to sharpen a pitch in 60 seconds.
2. **The top of the funnel for EMOS** (the Earned Media Operating System). The tool's feedback deliberately teaches EMOS's vocabulary — narrative transportation, the oxytocin effect, System 1 credibility, loss framing, E-E-A-T, the halo effect — so that users who feel the framework's value want the full program.

The differentiator versus every existing pitch/email tool (Boomerang Respondable, Lavender, Flowrite-style assistants) is **Layer 3: the EMOS framework scoring** (Personal Branding × Storytelling × Neuromarketing). No other pitch tool scores a message against a named, research-backed earned-media methodology and uses the feedback as an educational on-ramp to a paid program.

### Design north star

Match the UI/UX *spirit* of Boomerang Respondable — calm, instant, visual, a score you trust — but render it in SIA's existing **"Bureau" editorial design language** (Georgia/serif, ink-on-paper palette, spot-ink accents, percentile framing) so it feels native to the site, not a bolted-on SaaS widget. The existing `founder-press-score.jsx` and `/infographics/journo-outreach-checklist` are the visual and tonal reference implementations.

---

## 2. Goals, non-goals & success metrics

### 2.1 Goals

- Score any pasted pitch in **under ~6 seconds** end-to-end (after the user clicks Analyze).
- Return a **0–100 composite score**, a **tier/badge**, and a **per-dimension breakdown** with at least one concrete fix per weak dimension.
- Make the feedback **teach EMOS** — every weakness is explained via the underlying mechanism, in SIA's voice.
- Capture **email leads** at a natural moment (unlock more scores / "email me the full breakdown").
- Be **defensible**: every threshold is backed by published research, viewable by the user on demand.
- Reuse existing infrastructure (`/api/collab-ai` pattern, `newsletter-subscribe` route, Bureau components) so build cost is low and the tool is maintainable by SIA alone.

### 2.2 Non-goals (explicitly out of scope for MVP)

- **Not** a guaranteed "X% chance of placement" predictor. No public dataset links pitch text to placement outcomes; promising a probability would be dishonest and erode trust. The score is a **quality/readiness** signal. (See §14, the blind spot.)
- **Not** a full CRM, send-tool, or journalist database. It scores the *artifact*, not the *campaign* (timing, follow-up, deliverability, sender reputation are out of scope — noted to the user).
- **Not** a real-time per-keystroke AI tool. (Cost and key-safety make that non-viable; see §6 for the hybrid that gets the same feel.)
- **Not** an automated personal-brand web audit in MVP. Self-report only; automated audit is a v2 / separate embeddable tool. **[RESOLVED per SIA]**

### 2.3 Success metrics (instrument from day one)

| Metric | Why it matters | Target signal (first 90 days) |
|---|---|---|
| Scores completed / unique visitor | Core engagement | > 1.5 |
| Email-unlock conversion (free → email tier) | Lead-gen efficacy | > 8% of users who hit the free cap |
| EMOS CTA click-through from results | Funnel efficacy | Track per tier; expect higher from low scorers |
| Share-card generations | Virality / top-of-funnel | Track raw count |
| Median time-to-result | UX health | < 6s |
| % sessions hitting the free cap | Gating calibration | If very high, loosen; if ~0, tighten |

---

## 3. Scope — MVP vs. v2 (read this carefully)

### 3.1 The phasing principle: phase by *complexity*, not by *layer*

The brief proposed an MVP that might ship only Layers 1–2 and defer Layer 3. **We recommend against that, and instead ship all three layers in the MVP — but defer only the genuinely hard, expensive sub-feature inside Layer 3.** Here is the reasoning, stated plainly because it matters to the product:

- **Layer 3 (the EMOS signals) *is* the differentiator and the funnel.** It is the only reason this tool is a top-of-funnel asset for EMOS rather than a commodity email checker. Cutting it from MVP would ship a tool that looks like everyone else's and teaches none of EMOS's language. That defeats the strategic purpose.
- **Most of Layer 3 is nearly free to add.** Storytelling and Neuromarketing are judged from the pitch *text* by the same single AI call that already evaluates the Layer 2 checklist. Adding them is extra rubric instructions in one prompt — not extra infrastructure, not extra API calls, not meaningful extra latency or cost.
- **Only one piece of Layer 3 is genuinely hard: the *automated* Personal-Brand audit** (fetching and analysing a user's external footprint from a URL). That requires scraping, third-party data, added latency, cost, and reliability risk. *That* is what we defer — not the whole layer.

So the split is:

> **MVP ships Layers 1, 2, and 3 in full — with the Personal-Brand layer powered by user *self-report* (checkboxes), not an automated audit. The automated URL audit is v2 (or a separate, embeddable Personal-Brand-Score tool).**

This gives the tool its full differentiation and EMOS-teaching power on day one, while keeping the build to a single deterministic module + a single AI call + a self-report form.

### 3.2 What's in the MVP

- Pitch input (textarea) + **query/context input** (the journalist's request — see §5) + platform selector + self-report brand checklist.
- **Layer 1** objective metrics, computed in JS, shown as live/debounced meters (no API cost).
- **Layer 2 + Layer 3** scored by **one** structured AI call returning JSON.
- Composite 0–100 score, tier/badge, circular meter, per-dimension breakdown bars (reuse `founder-press-score` patterns).
- Mechanism-named feedback copy (the EMOS-teaching engine, §10).
- Freemium gating: 3/mo anonymous, 10/mo with email (§9).
- EMOS CTAs + email capture + shareable score card.
- "View the research" affordance behind any threshold (§12).
- Full instrumentation (§2.3) and pitch logging for the data flywheel (§8.4).

### 3.3 What's deferred to v2+

| Feature | Why deferred | Note |
|---|---|---|
| Automated personal-brand URL audit | Scraping/cost/latency/reliability | Self-report covers MVP; consider a separate embeddable tool **[per SIA]** |
| Referral-based & EMOS-purchase bonus credits | Not needed to validate | Design the credit ledger (§9) so these slot in later |
| One-click AI rewrite of the pitch | Strategic + cost question (§14, easy win) | Strong candidate for fast-follow |
| Saved pitch history / accounts | Needs auth | localStorage history is a cheap interim |
| A/B-tunable weights dashboard | Premature | Weights live in config (§8) and are edited in code for now |
| Predictive (ML) success model | No labeled data yet | Only possible after the flywheel (§8.4) accrues outcomes |

---

## 4. The scoring framework (the 3 layers)

The composite score is a weighted roll-up of four scored areas: **Relevance** (new — §5), **Layer 1 Objective signals**, **Layer 2 Checklist compliance**, and **Layer 3 EMOS signals**. All weights below are **starting values, tunable in one config file** (§8.1) — they are proposals, not dogma.

### 4.0 Composite model (proposed starting weights)

| Area | Weight | How it's computed | Shown to user as |
|---|---:|---|---|
| Relevance / query-fit (§5) | 25% | AI, only when a query is provided | "Answering the brief" |
| Layer 1 — Objective/structural | 15% | Deterministic JS | "Mechanics" |
| Layer 2 — 34-point checklist | 30% | AI (structured) | "The SIA system" |
| Layer 3 — EMOS signals | 30% | AI (structured) | "EMOS authority" |

Layer 3's 30% is split: **Storytelling 12% · Neuromarketing 12% · Personal Branding 6%** (brand is lighter in MVP because it leans on self-report).

**Relevance handling when no query is supplied:** if the user does not paste the journalist's query, Relevance is *excluded* and its 25% is redistributed proportionally across the other three areas, **and** the result is stamped with a "Scored without the query — relevance not assessed" confidence badge. This both stays honest and nudges users to supply the query (which makes the tool dramatically better — see §5).

**Score → tier banding (proposed, mirrors `founder-press-score` four-tier pattern):**

| Score | Tier | Badge | Meaning |
|---:|---|---|---|
| 0–39 | Will be ignored | "Cold" | Structural problems; likely deleted unread. |
| 40–64 | Needs work | "Warming" | Real material, missing the system. |
| 65–84 | Competitive | "Live" | A journalist could paste this; tighten to win. |
| 85–100 | Placement-grade | "Filed" | Reflects the EMOS standard. |

### 4.1 Layer 1 — Objective / structural signals (deterministic, no AI)

These are computed in JavaScript from the pitch text alone, instantly and for free. They power the live meters (§6) and contribute 15% of the composite. Each has an **evidence-backed target band**; scoring is a smooth curve (full marks inside the band, tapering outside), not a hard pass/fail.

| Signal | Target band | Evidence basis (see Appendix A) | Scoring notes |
|---|---|---|---|
| **Total word count** | **~80–200 words** (sweet spot 100–150) | Boomerang: 50–125 words = peak response (75–100 → 51%). Propel (400k+ pitches): 51–150 words → 7.51% response, the highest band; 501–1000 → 1.51%. Muck Rack: 65% want < 200 words. Fractl: 58% want 100–200. | Four independent sources converge. Penalise > 250 hard; warn < 60 (likely too thin to be useful). |
| **Subject-line length** | **6–9 words** (PR-pitch specific) | Propel: subject lines of 6–9 words had the highest open rate (48.83%). Boomerang's 3–4 words is *cold-email* specific; PR pitches need to signal the topic, so use Propel. | Also check the subject *anchors to the query title* (Layer 2, step 02). |
| **Reading level** | **≤ Grade 7–8** (lower is better) | Boomerang: 3rd-grade-level emails got +36% responses vs. college level, +17% vs. high school. | Use Flesch–Kincaid Grade Level via `text-readability`. Reward simplicity; flag dense/jargon-heavy prose. |
| **Question count** | **Exactly 1 closing question** (1–3 tolerated) | Boomerang: 1–3 questions lifts response. SIA checklist step 05: end on a single question. | 0 questions = missed "open a door" close → penalty. > 3 = interrogation → penalty. |
| **Subjectivity** | **Low–moderate, and only if backed** | SIA thesis: opinion-heavy = red flag; journalists want expert insight + data, not hot takes. Boomerang: slightly warm/negative tone beats neutral. | See §4.1.1 — this one is nuanced and partly AI-assisted. |

#### 4.1.1 The subjectivity nuance (important)

Subjectivity is **not** the same as sentiment, and "low subjectivity" is **not** universally good. The right rule, drawn from SIA's framework:

- **Penalise** high subjectivity that is **unsupported** — adjective-stuffed opinion with no data, no first-hand example, no specific claim ("our revolutionary, game-changing, best-in-class platform").
- **Reward** a **confident point of view that is grounded** — a strong, specific take *backed by* original data or lived experience. That is "distinctive expert POV," which journalists prize.

Implementation: compute a cheap lexical subjectivity proxy in JS for the live meter (opinion/intensifier-word density + sentiment magnitude). Then let the AI call make the *grounded-vs-ungrounded* judgment (does the strong claim have a stat/example attached?). This is also why **true TextBlob-style subjectivity is not ported to JS** — see §7.3.

### 4.2 Layer 2 — 34-point checklist compliance (AI-scored)

This layer encodes SIA's existing interactive checklist at `/infographics/journo-outreach-checklist` verbatim. The source of truth is `STEPS[]` in that page's source; the RFP reproduces it in **Appendix B**. There are **34 checkable items across 7 steps**. The AI evaluates the pitch against each item and returns, per item: `met | partial | missing | not_applicable`, plus a one-line reason.

| # | Step | Items | What the AI checks for |
|---|---|---:|---|
| 01 | Research | 3 | Evidence the pitch references the journalist's prior work / beat / a specific past article. |
| 02 | Email Subject Line | 5 | Anchored to query title; has a substantive modifier ([Stats + Examples] etc.); scannable; not generic. |
| 03 | Intro + Bio | 3 | First-name greeting; 2–3 sentence bio (not a résumé); credibility tied to the topic. |
| 04 | Answering the Query | 7 | Answers the *exact* question; 70–250 words; ≥1 sourced statistic; a visual/screenshot offer; skimmable; a first-hand example; a useful tool/book to point readers to. |
| 05 | The Ending | 2 | Ends on a question; offers to send more. |
| 06 | Signature | 8 | Name, title, company, URL, email, X, LinkedIn, headshot URL present. |
| 07 | More Hacks / post-send | 4 (+2) | Branded short URL; tightened/edited; (post-send items are coaching, scored as guidance not penalty). |

**Scoring:** Layer 2 score = (weighted % of applicable items met). Some items are structural and machine-detectable (signature fields, a closing question, presence of a statistic) — the AI can be cross-checked against deterministic detectors for these to reduce variance (see §7.4). Post-send items (step 07's "after sending") are surfaced as **coaching**, not counted against the score, since they can't be verified from the draft.

**Per-section feedback:** for each step, the result shows met/total and the single highest-leverage fix, in SIA's editorial voice, using the same spot-ink section colours as the checklist page for visual continuity.

### 4.3 Layer 3 — EMOS framework signals (AI-scored, the differentiator)

Three sub-scores, judged from the pitch text (and the self-report brand input). The vocabulary, definitions, and mechanisms below are taken directly from SIA's EMOS copy deck (`EMOS-Playbook-Copy-Deck.md`) so the tool speaks the program's exact language.

#### 4.3.1 Storytelling (12%)

**What it scores:** Does the pitch carry a **problem → insight → resolution** narrative arc with a protagonist/expert *character* — or is it a flat list of credentials and claims?

| Signal | Looks for | Mechanism named in feedback |
|---|---|---|
| Narrative arc | A tension/problem set up, an insight, a resolution | "Narrative transportation" (Green & Brock, 2000) — immersion suppresses counter-arguing/skepticism |
| Protagonist / character | A specific human in a specific situation (founder, customer, the expert) | "The oxytocin effect" (Zak) — character-driven stories trigger empathy and trust |
| Concreteness | A scene/example vs. abstraction | Memorability ("made to stick"); editorial framing disarms the Persuasion Knowledge Model |

**Anti-pattern to flag:** "credential dump" — a pitch that lists titles and adjectives but never puts a character in a scene. The feedback should *name* this and explain why a journalist's skepticism stays switched on.

#### 4.3.2 Neuromarketing (12%)

**What it scores:** Is the pitch engineered for **System 1 credibility** and does it use the right cognitive triggers?

| Signal | Looks for | Mechanism named in feedback |
|---|---|---|
| 2-second subject test | Subject line readable & compelling in < 2s | "System 1" snap judgment (Kahneman); loss framing/specificity raise open rates |
| Loss framing / specificity | Stakes or a specific, concrete number vs. vague upside | Loss aversion; processing fluency |
| **Original data > borrowed stats** | Proprietary data / a distinctive POV vs. Googleable third-party stats | **The differentiating rule (see below)** |
| Authority cues | Editorial-grade proof, not salesy hype | Cialdini's Authority principle; ELM peripheral route |

**The original-data rule (call this out prominently in the build).** Generic borrowed statistics ("studies show 73% of…") are *weaker* than original data or a proprietary take, because **a journalist can Google a stat; they cannot Google your unique research or opinion.** The scorer should:

- **Detect** whether numeric claims appear to be *cited third-party* stats vs. *first-party/original* data or a distinctive expert interpretation.
- **Reward** original data, proprietary research, and a specific contrarian/expert POV.
- **Down-weight** (not zero) borrowed stats; flag a pitch built *entirely* on borrowed stats as "commoditised — nothing here a journalist couldn't find themselves."

This single rule is a meaningful differentiator versus naive "include a statistic" checkers and reinforces an EMOS lesson.

#### 4.3.3 Personal Branding (6% in MVP — self-report)

**What it scores:** Personal branding is mostly about **verifiable external signals**, not words in the pitch. (SIA's lived example: when SEMrush accepted his pitch, they said they'd Googled him and seen the signals — site, bylines, channel, case studies.) Because MVP does **not** audit the web automatically **[RESOLVED per SIA]**, this sub-score has two parts:

1. **Self-reported footprint (input):** a short checklist the user ticks — *I have:* a personal website · published bylines · a YouTube/video presence · a speaking history · case studies/testimonials · an active LinkedIn. This establishes the user's *available* authority.
2. **Reflection check (AI):** does the **pitch actually deploy** that authority? If the user has bylines but the pitch's bio doesn't reference any credibility, the feedback says so: "You told us you have Forbes bylines — your pitch never signals it. A journalist won't Google you mid-skim; put the proof *in the pitch*."

**Mechanisms named:** E-E-A-T accumulation, the halo effect, "journalist familiarity lowers the pitch threshold."

**v2 upgrade path (designed, not built):** an optional URL field that runs a light automated audit, or a separate **Personal-Brand-Score** tool embedded here. Keep the self-report data model forward-compatible so an automated signal can later populate the same fields. **[per SIA]**

---

## 5. The structural addition: score against the *query*, not just the pitch

**This is the single most important change to the original brief, and it doubles as the biggest "easy win" and the biggest "blind spot" (brief questions 9 & 10).**

The brief scores a pitch *in isolation*. But the published evidence is unambiguous that the dominant driver of placement is **relevance to the specific journalist's request**:

- Cision (3,000+ journalists): **86% immediately reject** a pitch not aligned to their beat/audience.
- Muck Rack (1,500+ journalists): **86% will ignore** an off-topic pitch; relevance is the recurring theme.

A pitch can be a 95/100 on mechanics, story, and authority and still be deleted because it didn't answer *the actual question asked.* Scoring the artifact without the brief is scoring half the problem.

**The fix is cheap:** add a second input — **"Paste the journalist's query / source request"** (the HARO/Qwoted/Featured prompt). When present, the AI scores a **Relevance / query-fit** dimension (25% of the composite): does the pitch answer the *exact* question, match the beat, and respect any constraints (deadline, format, region, "no PR firms," word limits) stated in the query?

When the query is **absent**, the tool still works, but it: (a) redistributes the 25% weight, (b) shows a "relevance not assessed" badge, and (c) prompts the user to add the query for a real score. This is honest *and* it improves output quality dramatically, *and* it's a few lines of prompt + one textarea. It is the rare change that is simultaneously the easy win, the blind-spot fix, and a trust-builder.

---

## 6. UX / UI requirements

### 6.1 The real-time question, resolved

Respondable updates coloured bars live as you type. Doing that for *AI* scoring means an API call per keystroke — non-viable on cost and impossible to do safely client-side (it would expose the API key). **Resolution [RESOLVED]: a hybrid.**

- **Layer 1 (objective) meters update live / debounced as the user types** — word count, subject length, reading level, question count, subjectivity proxy. These are pure JS, free, instant, and give the exact Respondable "alive" feel.
- **Layers 2–3 + Relevance (the AI) run on an explicit "Analyze pitch" click** (and may re-run on a debounced 2s pause *only if* SIA later wants it and accepts the cost). MVP = button-triggered.

This delivers the Respondable experience for the cheap signals while keeping the expensive, high-value judgment deliberate and affordable.

### 6.2 Screen flow

1. **Intro / input screen.** Headline in Bureau style. Inputs: **Pitch** (large textarea), **Journalist's query** (textarea, encouraged), **Platform** selector (HARO · Qwoted · Source of Sources · Featured · Help a B2B Writer — affects tone/weights, §13 D-7), **brand self-report** checklist (collapsible), optional **subject line** field (or parsed from the pitch). Live Layer-1 meters render in a side rail. Primary button: **Analyze pitch →**. Microcopy: "No signup. 3 free scores this month."
2. **Analyzing state.** Skeleton/loader with rotating EMOS micro-lessons ("Checking whether your subject line passes the 2-second System 1 test…"). Stream results if using a streaming-capable model.
3. **Result screen.** Circular composite meter + tier badge + percentile line (reuse `ScoreMeter` from `founder-press-score.jsx`). Then four expandable area cards (Relevance, Mechanics, The SIA System, EMOS Authority), each with its sub-bars and the single highest-leverage fix. Then: **strongest line in your pitch** (quote it back — positive reinforcement) and **the three fixes that move the score most**. Then EMOS CTA block (tiered, like the checklist page's `EmosCTA`), email-capture card, share-on-X card, and "view the research" links.

### 6.3 Design system reuse (do not reinvent)

Build with the existing **Bureau** primitives and tokens already in the repo:

- Tokens: `@/lib/tokens` (`INK`, `PAPER`, `PAPER2`, `SERIF`, `GROT`, `YEL`, `INK15/35/55/70`, the `STEP_COLORS` spot-ink array).
- Components: `@/components/bureau` (`Colophon`, `Subscriptions`) and `@/components/bureau/primitives` (`DoubleRule`, `Mark`, `SCaps`, `SectionMast`, `SiaLogo`).
- Patterns to lift directly from `founder-press-score.jsx`: `ScoreMeter` (SVG circular gauge), the per-dimension breakdown bars, the tiered CTA + email-capture + share blocks, the four-tier `TIERS` structure.
- Persisted state via `localStorage` exactly as `journo-outreach-checklist` does (`STORE_KEY` pattern) — used here for the usage counter and pitch history.

### 6.4 Accessibility & mobile

Keyboard-navigable inputs, `aria-pressed` on toggles (as the checklist already does), colour-contrast-safe tier colours, results readable on a phone (the side-rail meters collapse above the textarea on narrow screens). Never rely on colour alone — pair every bar with a number and a label.

---

## 7. Technical architecture

### 7.1 Where the AI call runs [RESOLVED]

**Server-side, in a Next.js App Router API route — never the browser.** This is non-negotiable for key safety and matches the codebase's existing, proven pattern. The repo already does exactly this in `src/app/api/collab-ai/route.ts`: it imports `@anthropic-ai/sdk`, instantiates `new Anthropic()` with `ANTHROPIC_API_KEY` from env, takes a `{ type, data }` POST, builds a prompt server-side, calls `client.messages.create(...)`, and returns JSON. **Clone that pattern.** No new architectural decisions are required here; the question in the brief ("server-side or smarter?") resolves to "server-side is the smart and existing answer."

New route: **`src/app/api/pitch-score/route.ts`**.

### 7.2 Two-stage scoring pipeline

```
                 ┌─────────────────────────────────────────────────────┐
  user input ──▶ │  CLIENT (tools/pressiq/page.tsx)                  │
                 │  • Layer-1 deterministic metrics (live meters)        │
                 │  • debounced; zero API cost                           │
                 └───────────────┬─────────────────────────────────────┘
                                 │  POST { pitch, query, platform, brand, metrics }
                                 ▼
                 ┌─────────────────────────────────────────────────────┐
  gating  ◀────▶ │  API ROUTE /api/pitch-score (server)                  │
  (KV)           │  1. rate-limit check (§9)                             │
                 │  2. recompute Layer-1 metrics server-side (trust)     │
                 │  3. ONE structured LLM call → JSON (L2 + L3 + Relev.)  │
                 │  4. merge deterministic + AI → composite (config wts)  │
                 │  5. log pitch + scores (flywheel, §8.4)               │
                 │  6. return { composite, tiers, breakdown, feedback }   │
                 └─────────────────────────────────────────────────────┘
```

Key points:

- **Layer 1 is computed in both places.** Client-side for the live meters (UX); recomputed server-side as the trusted value (never trust client-supplied numbers).
- **One LLM call, structured output.** Use Anthropic **tool-use / JSON schema** to force a parseable object (scores per dimension, item-level checklist verdicts, evidence flags, and the raw materials for feedback). Do **not** parse free text. Set a **low temperature** (0–0.3) for score stability.
- **Composite math is deterministic and lives in code**, applying the config weights (§8.1) to the AI's per-dimension 0–100 sub-scores + the Layer-1 score. This keeps scores reproducible and the weights tunable without prompt edits.

### 7.3 Deterministic metrics module (`src/lib/pitch/metrics.ts`) — answers brief Q7

All Layer-1 math is plain JS/TS running in Node (the route) and the browser (meters). **No Python service is needed or recommended** — standing one up adds an entire deployment surface for a few formulas. Recommended libraries (all npm, pure JS):

| Need | Library | Notes |
|---|---|---|
| Flesch–Kincaid grade + reading ease | **`text-readability`** | Also gives Coleman–Liau, ARI, SMOG. Battle-tested, no native deps. |
| (alt) minimal FK only | `flesch-kincaid` + `syllable` | Smaller bundle if you only want FK. |
| Sentiment magnitude (subjectivity proxy) | **`sentiment`** (AFINN-165) or **`textlens`** | `textlens` bundles readability + sentiment + reading time in one. |
| Word/sentence/question tokenisation | built-in regex or `wink-nlp` | Question count = count of `?`-terminated sentences. |

**On subjectivity specifically:** the classic *TextBlob subjectivity score* is a Python lexicon that has **no exact JS port.** Do **not** offload to Python for it. Instead: (a) compute a lightweight JS proxy (intensifier/opinion-word density + sentiment magnitude) for the live meter, and (b) let the single LLM call render the nuanced *grounded-vs-ungrounded* judgment (§4.1.1). This is cheaper, simpler, and better than a Python round-trip.

### 7.4 LLM scoring module (`src/lib/pitch/score-prompt.ts`)

- **Inputs to the prompt:** pitch, query (if any), platform, self-report brand flags, and the deterministic metrics (so the model can reference them rather than recount words).
- **Output:** a strict JSON object (enforced via tool-use). Suggested shape in **Appendix C**.
- **Cross-check for stability:** for machine-detectable checklist items (closing question present? signature fields present? a statistic present?), compute a deterministic boolean and **reconcile** with the AI verdict; if they disagree, trust the deterministic detector for the score and let the AI supply the prose. This cuts the "same pitch, different score" variance that pure-LLM scoring suffers.
- **Model choice [OPEN — D-9]:** Opus (as `collab-ai` uses) gives the best judgment but is the slowest/priciest; Sonnet is the likely sweet spot for a high-volume free tool; Haiku for cost-floor. Recommendation: **start on Sonnet**, keep the model in an env var, and load-test. Because one call does L2+L3+Relevance, per-score cost stays low.
- **Prompt-injection hardening:** the pitch is untrusted user input. Wrap it in clear delimiters, instruct the model to treat it as data to be scored (never as instructions), and never reflect raw pitch text into a privileged context. (See §14 risks.)

---

## 8. Data model

The guiding principle: **the rubric, the weights, the thresholds, and the feedback copy all live in typed config files — not hardcoded in components or prompts.** SIA can then tune scoring and rewrite voice without a developer touching logic. This directly answers brief Q3 (how to structure the research-backed criteria): **config-as-code**, not a CMS (overkill for MVP) and not magic numbers sprinkled through the prompt.

### 8.1 `src/lib/pitch/config.ts` — the single source of truth

```ts
export const WEIGHTS = {
  relevance: 0.25,        // redistributed if no query supplied
  objective: 0.15,
  checklist: 0.30,
  emos: { storytelling: 0.12, neuromarketing: 0.12, personalBrand: 0.06 },
};

export const L1_BANDS = {
  wordCount:     { ideal: [100, 150], ok: [80, 200], hardMax: 250, warnMin: 60 },
  subjectWords:  { ideal: [6, 9],     ok: [4, 12] },
  readingGrade:  { ideal: [0, 7],     ok: [0, 9],  penaltyAbove: 12 },
  questions:     { ideal: 1, ok: [1, 3] },
  // subjectivity handled with the grounded/ungrounded AI flag
};

export const CHECKLIST = [ /* the 7 steps × 34 items — Appendix B, mirrors STEPS[] */ ];

export const EVIDENCE = { /* see §12 — each threshold → {claim, source, url} */ };
```

Every number above is a **proposal traceable to Appendix A**. Changing the product's scoring is editing this one file.

### 8.2 Feedback copy model — see §10 (separate file, `feedback.ts`).

### 8.3 Request / response contract — see Appendix C.

### 8.4 Pitch logging & the data flywheel (build this in MVP)

Log every scored pitch (hashed/pseudonymous), its sub-scores, platform, and — critically — provide an **optional, later "Did this pitch get a reply / a placement?" callback** (one click in the result-email follow-up, or a returning-user prompt). Over time this builds the **one dataset that does not exist publicly: pitch text → real outcome.** That corpus is (a) the only honest path to a future predictive model, and (b) a genuine competitive moat. Store in a simple table (Vercel Postgres / Supabase) with a clear retention & privacy policy (§14). **Do not promise prediction now — instrument so it becomes possible later.**

> **Privacy note:** pitches may contain unpublished, sensitive material. Disclose retention, allow "score without storing," and never expose stored pitches. (§14)

---

## 9. Usage-limiting / gating logic — answers brief Q5

### 9.1 Tiers (MVP)

| Tier | Limit | Identity | Reset |
|---|---|---|---|
| Anonymous | **3 scores / month** | device + IP | monthly |
| Email | **10 scores / month** | verified email (existing `newsletter-subscribe`) | monthly |
| *(v2)* Referral / EMOS bonus | credits | account | — |

### 9.2 Mechanism [RESOLVED with caveat]

**Layered, server-enforced — never client-only.** A cookie/localStorage counter alone is bypassed by incognito in two seconds.

1. **Client:** `localStorage` counter for instant UX ("2 of 3 free scores left"). Cosmetic only.
2. **Server (authoritative):** on each `/api/pitch-score` call, increment a counter in a **KV store (Vercel KV / Upstash Redis)** keyed on a composite of **IP + a lightweight device fingerprint** (e.g. FingerprintJS open-source, or a hash of stable headers). Reject over-limit before the LLM call (protects cost). Monthly TTL.
3. **Email tier:** verifying an email (reusing `newsletter-subscribe`) sets a signed cookie / JWT that raises the limit and keys usage to the email.

### 9.3 Honest expectations

A determined user can still bypass anonymous limits (fresh incognito + new network). **That's acceptable for MVP** — the gate's job is *gentle friction that drives email capture*, not airtight DRM. Spending heavily on bulletproofing is a poor trade. The hard cap that matters is the **server-side cost guard** (reject over-limit before hitting the API, plus a global daily ceiling so a bad actor can't run up the Anthropic bill).

---

## 10. The feedback-copy system — answers brief Q6 (the EMOS-teaching engine)

This is where the tool earns its strategic keep. The requirement: when the tool flags a weakness, the feedback must **name the underlying mechanism in EMOS's language** ("narrative transportation," "the oxytocin effect," "System 1," "loss framing," "E-E-A-T," "the halo effect") so users absorb the framework and want the full program.

### 10.1 Architecture: templated frame + AI-generated specifics

Pure-AI feedback drifts off-brand and can hallucinate mechanisms; pure-templated feedback is generic. **Split the two:**

- **The frame is templated** (typed config in `src/lib/pitch/feedback.ts`). Each rubric dimension has copy keyed by score band (`strong | weak | missing`). The **mechanism name, the EMOS explanation, and the link to the relevant essay** live here — consistent, on-brand, never hallucinated.
- **The specifics are AI-generated.** The model fills slots with what *this* pitch did: the weak line it quotes back, the concrete rewrite suggestion, the missing element. The model is given the mechanism name to use — it does not invent the framing.

```ts
// feedback.ts — illustrative
storytelling: {
  weak: {
    mechanism: "Narrative transportation",
    learn: "/resources/storytelling",
    frame: (s) =>
      `Your pitch states authority but never puts a character in a scene. ` +
      `Journalists stay skeptical of claims — but narrative transportation ` +
      `(the immersion a story creates) quietly suppresses that skepticism. ` +
      `${s.aiSpecific} Try opening on the moment the problem bit, not the credential.`,
  },
  // strong / missing variants…
}
```

### 10.2 Tone & voice

Match SIA's editorial register from the checklist and `founder-press-score`: direct, second person, a little wry, never corporate. Praise specifically (quote the user's strongest line back). Frame fixes as the next move, not a scolding. Lower scores get a *warmer* CTA toward EMOS Foundation; high scorers get a "scale it" CTA — mirror the tier→CTA mapping already in `founder-press-score.jsx`'s `TIERS`.

### 10.3 Each result should always include

1. **One thing you nailed** (positive anchor, quoted from their pitch).
2. **The three highest-leverage fixes** (ranked by score impact).
3. **One EMOS concept to learn**, deep-linked to the matching long-form essay (`/resources/storytelling`, `/resources/neuromarketing`, `/resources/personal-branding`, `/resources/writing-tips`). This is the soft funnel: feedback → essay → EMOS.

---

## 11. Personal-brand layer (MVP self-report; v2 automated) — answers brief Q2

Covered in §4.3.3. Summary of the resolved approach:

- **MVP: self-report only** — checkboxes for website, bylines, video/YouTube, speaking, case studies, LinkedIn. The AI then scores whether the **pitch reflects** that authority. **[RESOLVED per SIA]**
- **v2: optional automated URL audit**, or a **separate embeddable Personal-Brand-Score tool** that can be dropped into this result screen. **[per SIA]**
- **Forward-compatible data model:** the self-report fields and an (eventual) audited-signal source write to the same `brandSignals` shape, so swapping self-report for automated data later is a data-source change, not a redesign.

---

## 12. Research / evidence architecture — answers brief Q3

**How the published research is structured, weighted, cited, and maintained.**

### 12.1 Encode as config, cite in the UI

- Each scoring threshold in `config.ts` references an entry in an **`EVIDENCE` map**: `{ claim, source, year, url, n }`. Example: the word-count band points to the Boomerang, Propel, Muck Rack, and Fractl entries.
- In the result UI, every threshold has a subtle **"why?"** affordance that reveals the citation(s) — e.g. tapping the word-count meter shows *"51–150 words drew the highest response rate (7.51%) across 400k+ pitches — Propel Media Barometer, Q1 2024."* This makes the tool **visibly evidence-based**, which builds trust and differentiates from black-box scorers.

### 12.2 Should research inform weightings? Yes — but transparently

Weights should reflect **strength + convergence of evidence**, not vibes:

- **Relevance** is weighted highest (25%) because two large independent surveys (Cision n≈3,000; Muck Rack n≈1,500) both put it at ~86% as the top rejection reason.
- **Word count / readability** thresholds are high-confidence (4 converging sources) → they anchor Layer 1 firmly.
- **EMOS mechanisms** are weighted on *mechanism* evidence (the psychology is well-established: Kahneman, Cialdini, Green & Brock, Zak) even though *pitch-outcome* evidence is SIA's proprietary case data — so the methodology note (below) is shown.

### 12.3 The process to gather/evaluate/organise/encode (repeatable)

1. **Collect** from a defined tier of sources (§15): annual journalist surveys, large-N outreach studies, and the foundational books.
2. **Evaluate** each finding on: sample size, recency, independence, and whether it measures *response* vs *placement* (different things). Prefer large-N, recent, independent, placement-relevant.
3. **Normalise** into the `EVIDENCE` map (one row per claim, with URL + n + year).
4. **Map** each claim to the threshold/weight it justifies in `config.ts`.
5. **Surface** the citation in the UI behind the relevant signal.
6. **Review quarterly** — re-run the surveys (Muck Rack, Cision, Propel publish annually/quarterly) and bump the config. A dated "evidence last reviewed: Q_ 20__" line in the footer keeps it honest.

### 12.4 Methodology disclosure (reuse SIA's own wording)

The EMOS copy deck already nails the right disclaimer; reuse its spirit verbatim on the tool's "about the scoring" page: *outcome figures are case-study data, not guarantees; cited research describes the underlying psychological and algorithmic mechanisms, not promised results.* This protects credibility and models intellectual honesty.

---

## 13. Open decisions — consolidated, each with a recommendation

The brief asked the RFP to flag unresolved decisions and offer options rather than guess. Here they are in one place. **[RESOLVED]** items reflect SIA's answers or a clearly-correct default; **[OPEN]** items need SIA's call (a recommendation is given for each).

| ID | Decision | Options | Recommendation / status |
|---|---|---|---|
| D-1 | AI server-side vs. client | server route / client | **Server route. [RESOLVED]** — clone `api/collab-ai`. |
| D-2 | All 3 layers in MVP? | phase by layer / by complexity | **All 3, phased by complexity. [RESOLVED per SIA]** |
| D-3 | Personal-brand method | self-report / auto audit / hybrid | **Self-report in MVP; automated later. [RESOLVED per SIA]** |
| D-4 | Research structure | hardcoded / config / CMS | **Config-as-code (`config.ts` + `EVIDENCE`). [RESOLVED]** |
| D-5 | Real-time vs on-submit | live / on-submit / hybrid | **Hybrid: live JS meters + on-click AI. [RESOLVED]** |
| D-6 | Gating | cookie / email / layered | **Layered (KV + IP + fingerprint), email tier. [RESOLVED]** |
| D-7 | Per-platform tuning | one rubric / per-platform weights | **[OPEN]** — Recommend a `platform` selector that shifts a few weights/notes (HARO formal vs. B2B-writer casual; emoji allowed on casual per checklist step 02). Ship one rubric + light per-platform overrides. |
| D-8 | Subject line input | separate field / parse from pitch | **[OPEN]** — Recommend an optional explicit field; fall back to parsing the first line. Explicit is more reliable for scoring. |
| D-9 | Model | Opus / Sonnet / Haiku | **[OPEN]** — Recommend **start on Sonnet**, env-configurable, load-test; reserve Opus for a possible "deep analysis" paid tier. |
| D-10 | Logging/outcomes store | none / KV / Postgres | **[OPEN]** — Recommend Postgres (Supabase/Vercel) for the flywheel; KV only for rate limits. |
| D-11 | One-click AI rewrite | include / defer | **[OPEN]** — Recommend **defer to fast-follow** (§14 easy win); decide after watching free-tier cost. |
| D-12 | Product name | PressIQ / other | **[OPEN]** — Used as working name; confirm or replace before launch (affects route, share copy, OG tags). |
| D-13 | Store pitches at all? | always / opt-out / never | **[OPEN]** — Recommend store-by-default with a visible opt-out and clear retention, to feed the flywheel without surprising users. |

---

## 14. Challenges, easy wins & the biggest blind spot — answers brief Q8, Q9, Q10

### 14.1 Q8 — Challenges & what the brief is missing

| Challenge | Why it bites | Mitigation |
|---|---|---|
| **Scoring in isolation from the query** | Relevance is the #1 placement driver but the brief scores the pitch alone | **Add the query input (§5)** — the most important single fix |
| **LLM score variance** | Same pitch → different score erodes trust | Low temperature; structured output; deterministic cross-checks (§7.4); cache identical inputs |
| **Cost at scale on a free tool** | Per-keystroke would bankrupt it; even per-click adds up | Hybrid UX (§6.1); Sonnet not Opus (D-9); server cost-guard + global daily ceiling (§9.3); cache |
| **Prompt injection** | Pitch is untrusted; "ignore previous instructions…" | Delimit pitch as data; hardened system prompt; never execute pitch content |
| **Gaming the rubric** | Users optimise to the score, not to real journalists | Keep some judgment holistic; weight Relevance & original-data; show outcomes framing |
| **Latency** | Opus is slow; users abandon | Stream results; skeleton + rotating micro-lessons; faster model |
| **Privacy of unpublished pitches** | Sensitive/embargoed content pasted in | Disclose retention; opt-out; never expose stored data; consider auto-redaction of emails/phones in logs |
| **Platform heterogeneity** | HARO ≠ Qwoted ≠ B2B-writer norms | Platform selector + light weight overrides (D-7) |
| **Over-promising** | "Predict success" sets a trap | Reframe as quality/readiness; methodology note (§12.4) |
| **Maintenance burden** | Research and EMOS copy drift | Config-as-code (§8) + quarterly evidence review (§12.3) so SIA maintains it solo |

### 14.2 Q9 — The easy wins (high value, low effort)

1. **The query input (§5).** One textarea + a few lines of prompt unlocks the #1 placement factor. Biggest ROI in the whole build.
2. **Quote the user's strongest line back to them.** Trivial for the model; huge for perceived insight and shareability.
3. **Shareable score card** (reuse `founder-press-score`'s share-on-X pattern + an OG image). Free top-of-funnel virality.
4. **Pre-loaded example pitches** ("Score a sample HARO pitch") to kill the blank-state and demo the value instantly.
5. **Deep-link feedback to the matching essay.** Reuses content SIA already wrote; turns the tool into a content funnel for free.
6. **"View the research" citations (§12.1).** Cheap to add (it's already in config), and it's a credibility differentiator no competitor bothers with.

### 14.3 Q10 — The biggest blind spot

There are two, and both deserve to be stated bluntly:

**(a) Relevance to the specific query is the dominant driver of success, and the original design is blind to it.** A beautifully-scored pitch that doesn't answer *this* journalist's *actual* question gets deleted. Two large independent surveys put this at ~86%. **§5 fixes it; treat it as P0, not optional.**

**(b) "Predicting the likelihood of success" is not honestly possible today — and pretending otherwise is the real risk.** No public dataset maps pitch text to placement outcomes. The tool can score *quality against evidence-backed heuristics*; it cannot output a trustworthy "37% chance of placement." Overstating this would be the fastest way to lose credibility with exactly the sophisticated audience EMOS targets. The correct strategy:

- Frame the number as **pitch quality / placement-readiness**, not probability.
- **Build the data flywheel (§8.4)** — log pitches + optional self-reported outcomes — so that a genuine predictive model becomes possible *later*, trained on a dataset only SIA will have.
- SIA's own pitch archive (and the **0% → 47.06% HARO conversion** result already cited on the checklist page) is the seed of that proprietary, defensible dataset. **The moat isn't the scorer; it's the outcome data the scorer collects.**

---

## 15. Recommended research & source library — answers brief Q11

A note on "training": you do **not** fine-tune a model on these books (copyright aside, it wouldn't help scoring). You **encode their principles as rubric criteria and cite them in feedback.** The only data worth "training" on later is SIA's own pitch→outcome corpus (§8.4), used as few-shot examples and an evaluation set. With that said, the library to ground the rubric and feedback:

### 15.1 Primary data sources (encode these into `EVIDENCE`, refresh on their publication cadence)

| Source | What it gives the rubric | Cadence |
|---|---|---|
| **Muck Rack — State of Journalism** (n≈1,500+) | Pitch length (<200w), 1:1 email preference, relevance/off-topic rejection | Annual |
| **Cision — State of the Media** (n≈3,000, 19 markets) | Relevance as #1 factor (86%), value of knowing past work | Annual |
| **Propel — Media Barometer** (400k+ pitches/qtr) | Response rates (~3.4%), subject 6–9 words, body 51–150 words, best day (Thu) | Quarterly |
| **Backlinko — Email Outreach Study** (12M emails) | +30.5% from personalized subject, +32.7% personalized body, ~8.5% baseline | One-off |
| **Boomerang — email response study** (40M emails) | Word count 50–125, 3rd-grade reading level, 1–3 questions, sentiment | One-off (the Respondable basis) |
| **Fractl** — journalist preference & content studies (500+ journalists) | 100–200w preference, original data/emotional hooks, follow-up cadence | Periodic |

### 15.2 Foundational books (encode as mechanisms + name them in feedback)

- **Neuromarketing / decision science:** *Thinking, Fast and Slow* (Kahneman) — System 1/2; *Influence* & *Pre-Suasion* (Cialdini) — authority, social proof, framing; *Predictably Irrational* (Ariely); *Alchemy* (Rory Sutherland); *Decoded* (Phil Barden).
- **Storytelling:** *Made to Stick* (Heath & Heath) — the SUCCESs model, which doubles as a usable "is this idea sticky?" checklist; *Building a StoryBrand* (Miller); *The Science of Storytelling* (Will Storr); Paul Zak's oxytocin research (*Trust Factor* / HBR "Why Your Brain Loves Good Storytelling"); Green & Brock (2000) on narrative transportation.
- **PR / earned media / personal brand:** *The New Rules of Marketing & PR* and *Newsjacking* (David Meerman Scott); *Trust Me, I'm Lying* (Ryan Holiday) — how the media food chain actually works; *Contagious* (Berger) — why things get shared (STEPPS).

### 15.3 The most important "data" of all

SIA's own assets: the **34-point checklist**, the three long-form essays (`/resources/personal-branding`, `/resources/neuromarketing`, `/resources/storytelling`), the **100+ writing tips**, and the **EMOS science map (which already cites 13 published works)**. These should be the tool's primary voice and rubric source; the third-party research above is the *external validation layer* that makes the scoring defensible. Pull the EMOS science map's 13 citations directly into the `EVIDENCE` map as a starting set.

---

## 16. Build plan, milestones & acceptance criteria

### 16.1 Milestones

| Phase | Deliverable | Acceptance criteria |
|---|---|---|
| **M0 — Scaffold** | Route `/tools/pressiq`, page shell in Bureau style, `/api/pitch-score` echoing a stub | Page renders with tokens/primitives; route returns 200 |
| **M1 — Layer 1** | `metrics.ts` + live meters | Word count, subject length, FK grade, question count, subjectivity proxy compute client + server and match; meters update debounced |
| **M2 — AI scoring** | `score-prompt.ts`, structured JSON output, composite math | Given a fixed pitch, returns stable JSON; composite reproduces from sub-scores + weights; deterministic cross-checks reconcile |
| **M3 — Relevance** | Query input + relevance dimension + no-query redistribution & badge | With/without query both score correctly; badge shows when absent |
| **M4 — Feedback engine** | `feedback.ts` templated frames + AI specifics; result UI | Every weak dimension names a mechanism + links an essay; voice matches checklist |
| **M5 — Gating** | KV rate-limit, email tier via `newsletter-subscribe`, cost-guard | Over-limit rejected pre-LLM; email unlock raises cap; global daily ceiling enforced |
| **M6 — Polish & flywheel** | Share card, citations UI, example pitches, pitch logging + opt-out, instrumentation | Metrics (§2.3) fire; logging respects opt-out; share card renders OG image |
| **M7 — Launch** | QA, methodology page, copy review | All [RESOLVED] behaviours pass; SIA signs off on voice |

### 16.2 Definition of done (MVP)

A user can paste a pitch (and ideally the query), pick a platform, optionally self-report brand signals, click Analyze, and within ~6s receive a 0–100 score, a tier, four dimension breakdowns, three ranked fixes that each name an EMOS mechanism and link an essay, a citation behind every threshold, an EMOS CTA, and an email-unlock path — all in the Bureau design language, gated at 3/mo (10/mo with email), instrumented, and logging pitches for the flywheel with a visible opt-out.

---

## Appendix A — Evidence pack (cited)

Every Layer-1 threshold and the top-line weights trace to these. URLs are the working citations for the `EVIDENCE` map; verify and date-stamp at encode time.

| # | Claim (as encoded) | Figure | Source | URL |
|---|---|---|---|---|
| A1 | Pitch body length sweet spot | 51–150 words → 7.51% response (highest band); 501–1000 → 1.51% | Propel Media Barometer, Q1 2024 (400k+ pitches) | propelmypr.com/research/the-propel-media-barometer---q1-2024 |
| A2 | Subject line length | 6–9 words → highest open rate (48.83%) | Propel Media Barometer | propelmypr.com (as above) |
| A3 | Pitch length preference | 65% of journalists want < 200 words | Muck Rack State of Journalism 2025 (n≈1,500) | muckrack.com/research (state of journalism) |
| A4 | Pitch length preference | 58% want 100–200 words | Fractl journalist survey (500+) | frac.tl/work/marketing-research |
| A5 | Email length / response | 50–125 words optimal; 75–100 → 51% | Boomerang study (40M emails) | blog.boomerangapp.com/2016/02/7-tips-for-getting-more-responses-to-your-emails-with-data |
| A6 | Reading level | 3rd-grade level → +36% vs college, +17% vs high school | Boomerang study | (as A5) |
| A7 | Question count | 1–3 questions lifts response | Boomerang study | (as A5) |
| A8 | Sentiment | slightly warm/negative > neutral by ~10–15% | Boomerang study | (as A5) |
| A9 | Relevance is #1 | 86% immediately reject off-beat pitches | Cision State of the Media 2025 (n≈3,000) | cision.com/resources/guides-and-reports/2025-state-of-the-media-report |
| A10 | Off-topic = ignored | 86% ignore off-topic; relevance recurring theme | Muck Rack 2025 | muckrack.com (as A3) |
| A11 | Personalization lift | +30.5% (subject), +32.7% (body); ~8.5% baseline | Backlinko, 12M emails | backlinko.com/email-outreach-study |
| A12 | Realistic base rate | ~3.43% journalist response rate | Propel Media Barometer | propelmypr.com (as A1) |
| A13 | Channel preference | 62% prefer 1:1 email pitches | Muck Rack 2025 | muckrack.com (as A3) |
| A14 | Narrative transportation | reduces counter-arguing; 3 dimensions | Green & Brock (2000) | (academic; cite in `EVIDENCE`) |
| A15 | Oxytocin & story | character-driven stories → oxytocin → trust/empathy | Paul Zak (Future of StoryTelling; PNAS 2021) | pnas.org/doi/10.1073/pnas.2018409118 |

**Convergence note:** A1, A3, A4, A5 independently put pitch length in the ~80–200-word range from four different datasets — this is the rubric's most robust threshold and should be weighted with confidence.

**Tension to encode honestly:** Muck Rack found journalists most want *interview access to relevant sources* (27%), ranked above *original data* or *pre-written quotes*. This does **not** contradict the original-data rule (§4.3.2): access-to-sources is what journalists want from the *relationship*; original data is what makes a *written pitch* stand out from other written pitches. Both are true; the tool scores the written artifact and should still reward original data while noting (in coaching) that offering interview access is a strong move.

---

## Appendix B — The 34-point checklist (verbatim source of truth)

Mirror of `STEPS[]` in `src/app/infographics/journo-outreach-checklist/page.tsx`. Keep this and `config.ts` in sync (ideally import the same constant).

**01 · Research (3)** — (1) Read the journalist's previous articles, then their profile. (2) Pin down their style, beat, and focus. (3) Find one older-but-relevant article of theirs to reference in the pitch.

**02 · Email Subject Line (5)** — (1) Anchor the subject to the query title. (2) Add a modifier ([Screenshots Included], [With Statistics], Insider Tips, Lesser-Known Ways, Myths, X Shocking Facts, Y Secrets). (3) Pressure-test with a subject-line tester (e.g. CoSchedule). (4) Tack on [Facts + Figures] / [Stats + Examples]. (5) Emoji allowed — only on less formal platforms. *Formula: "Re: [Query Title] — Insider Tips + [Stats + Examples]".*

**03 · Intro + Bio (3)** — (1) Greet the reporter by first name. (2) Bio in 2–3 sentences (no résumé). (3) Tie the intro to the topic: credibility, social proof, expertise, lived experience.

**04 · Answering the Query (7)** — (1) Answer the precise question(s) directly. (2) 70–250 words. (3) ≥1 statistic with source. (4) One screenshot/GIF with source. (5) Skimmable (bullets, short lists, occasional CAPS). (6) A personal first-hand example. (7) Suggest a relevant tool/app/book for readers.

**05 · The Ending (2)** — (1) End with a question, not a sign-off. (2) Offer to send more. *Lines: "Is this all that you needed?" / "Does this answer your question?" / "Happy to send more."*

**06 · Signature (8)** — Full name · designation/title · company · company URL · email · X/Twitter · LinkedIn · headshot URL.

**07 · More Hacks (4) + After sending (2)** — (1) Branded short URL (bit.ly). (2) Re-read; run through Grammarly. (3) Cut anything unnecessary. (4) Enable a read-receipt (e.g. Boomerang). *After: retweet/follow the reporter; log the pitch in your tracker.* (Post-send items = coaching, not scored.)

*Total checkable items: 34.*

---

## Appendix C — Example API contract

**Request — `POST /api/pitch-score`**

```jsonc
{
  "pitch": "Hi Sarah, saw your piece on remote-team burnout…",
  "query": "Looking for HR experts on the 4-day week. Need data, by Thu.",  // optional but encouraged
  "subject": "Re: 4-day week — our 18-month data + [Stats + Examples]",      // optional; else parsed
  "platform": "haro",                  // haro|qwoted|sos|featured|b2bwriter
  "brandSignals": { "website": true, "bylines": true, "youtube": false,
                    "speaking": true, "caseStudies": true, "linkedin": true },
  "store": true                        // user opt-out sets false
}
```

**Response (abridged)**

```jsonc
{
  "composite": 72,
  "tier": { "label": "Competitive", "badge": "Live", "color": "#2f6f68" },
  "relevanceAssessed": true,
  "areas": {
    "relevance":   { "score": 80, "fixes": ["Name the 4-day-week angle in line 1"] },
    "objective":   { "score": 68, "metrics": { "words": 142, "subjectWords": 8,
                     "fkGrade": 7.1, "questions": 1, "subjectivity": "moderate-grounded" } },
    "checklist":   { "score": 70, "steps": { "04": { "met": 5, "of": 7,
                     "topFix": "Add one sourced statistic" } } },
    "emos": {
      "storytelling":   { "score": 55, "mechanism": "Narrative transportation",
                          "note": "Credential list, no character in a scene",
                          "learn": "/resources/storytelling" },
      "neuromarketing": { "score": 74, "mechanism": "Original data > borrowed stats" },
      "personalBrand":  { "score": 60, "note": "You have bylines; the pitch never signals them" }
    }
  },
  "strongestLine": "We tracked 1,200 employees for 18 months…",
  "topFixes": [ /* 3 ranked, each with mechanism + essay link */ ],
  "evidence": { "wordCount": "A1", "subject": "A2" },   // keys into EVIDENCE map
  "usage": { "remaining": 2, "tier": "anonymous" }
}
```

---

## Appendix D — Quick-reference: the brief's 11 questions → where answered

| # | Question | Answer location |
|---|---|---|
| 1 | Server-side vs smarter architecture | §7.1 — server route, clone `api/collab-ai`. [RESOLVED] |
| 2 | Personal-brand: URL audit vs self-report | §4.3.3, §11 — self-report MVP, automated v2. [RESOLVED] |
| 3 | How to structure the research | §8, §12 — config-as-code + `EVIDENCE` map + UI citations |
| 4 | Output UI: real-time vs on-submit | §6.1 — hybrid (live JS meters + on-click AI). [RESOLVED] |
| 5 | Freemium limits mechanism | §9 — layered KV + IP + fingerprint, email tier |
| 6 | Feedback copy system | §10 — templated EMOS frame + AI specifics |
| 7 | Tech stack / JS vs Python for FK & subjectivity | §7.3 — all JS (`text-readability`); subjectivity via proxy + LLM, no Python |
| 8 | Challenges / what's missing | §14.1 — incl. the query blind spot |
| 9 | Easy win we're not seeing | §14.2 — the query input (+ quote-back, share card) |
| 10 | Big problem we're blind to | §14.3 — relevance blindness + the "can't predict" honesty trap |
| 11 | Research/books to ground the tool | §15 — surveys, books, and SIA's own corpus as the moat |

---

*End of RFP v1. Open decisions D-7 through D-13 await SIA's call; everything else is build-ready.*
