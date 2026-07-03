# Earned-Media Pipeline — QA Report
**Site:** syedirfanajmal.com
**Scope:** 4 public tool pages (SignalIQ → JournoCollabIQ → PressIQ → CoverageIQ)
**Mode:** Report only (no fixes, no destructive actions)
**Note:** /emos was NOT audited — link resolution only (confirmed HTTP 200, no 404).
**Testing caveat:** Browser minimum window width was ~550px, so "mobile" checks were performed at ~550px rather than the requested 390px.

---

## 1. SignalIQ — `/tools/signaliq`

### 🔴 Critical
**Scan fails with "Verification failed" (403).**
- **What:** Selected beat "SaaS & Startups" and clicked **Scan**. Request returned **403 "Verification failed"**; no results rendered.
- **Where:** `/tools/signaliq` — Scan button / scan API call.
- **Expected:** A first-time visitor should be able to run a scan and see signal results, or be shown a completable verification challenge. Currently the core tool action is blocked outright.

### 🟡 Minor
**Pipeline strip label consistency.**
- **What:** The "SIA earned-media pipeline" strip reflects current step, but earlier/next-step labeling is not uniform with later pages.
- **Where:** `/tools/signaliq` — pipeline navigation strip.
- **Expected:** Current step "You are here", earlier steps "Previous", next step "Next step" — identical wording on every page.

### ⚪ Nit
**Minor spacing inconsistency in the beat-selector block.**
- **Where:** `/tools/signaliq` — beat selection area.
- **Expected:** Consistent vertical rhythm with the rest of the page.

---

## 2. JournoCollabIQ — `/tools/journocollabiq`

### 🔴 Critical
**Research step fails with 403 on `/api/journo-ai`.**
- **What:** Completed step 1 (FlowMetric / flowmetric.io / B2B SaaS / SaaS-Software), advanced through step 2 (offer "Expert Commentary") to step 3 → **"Verification failed"**; POST `/api/journo-ai` returned **403**.
- **Where:** `/tools/journocollabiq` — step 3 research generation.
- **Expected:** Tool should return journalist/collaboration research output without error, or present a completable challenge.

### 🟠 Major
**Form pre-filled with unrelated demo data.**
- **What:** Fields were pre-populated with stale demo content ("Onsense.ai") unrelated to the user's session.
- **Where:** `/tools/journocollabiq` — step 1 input fields.
- **Expected:** Fields should start empty (or with clearly-labeled placeholder examples), not persistent unrelated demo values that a first-time visitor might accidentally submit.

### 🟡 Minor
**Continue button disabled state relies on native input events.**
- **What:** The "Continue" button stays disabled unless real key events fire (programmatic value-setting doesn't enable it).
- **Where:** `/tools/journocollabiq` — step 1 Continue button.
- **Expected:** Not user-facing, but flagged as fragile validation binding.

---

## 3. PressIQ — `/tools/pressiq`  ✅ Functional Pass

### 🟠 Major
**~25s analysis wait with no progress indicator.**
- **What:** Used the pre-loaded sample pitch, clicked **Analyze pitch** → Cloudflare Turnstile passed → POST `/api/pitch-score` returned **score 86/100** after ~25 seconds with no visible progress/loading feedback.
- **Where:** `/tools/pressiq` — Analyze pitch flow.
- **Expected:** A progress indicator or estimated-time message during the long request so users don't assume it froze.

### 🟡 Minor
**Inconsistent tool naming in title.**
- **What:** Page title reads "PR Pitch Scorer" while elsewhere it's referred to as "Journalist Pitch Score".
- **Where:** `/tools/pressiq` — page title vs body copy.
- **Expected:** One consistent name for the tool everywhere.

*Verified working:* Score/Top Fixes/Breakdown/Evidence view tabs all render correctly.

---

## 4. CoverageIQ — `/tools/coverageiq`  ✅ Functional Pass

### 🟠 Major
**EMOS labeled inconsistently in pipeline strip.**
- **What:** EMOS appears as "NEXT STEP" here but is referred to as "THE SYSTEM" on other pages.
- **Where:** `/tools/coverageiq` — pipeline strip / EMOS reference.
- **Expected:** Consistent label for EMOS across all pages.

### 🟠 Major
**CRM table is not responsive.**
- **What:** At narrow width (~550px) the pitch-tracking CRM table overflows horizontally / gets cut off.
- **Where:** `/tools/coverageiq` — PESO/CRM table.
- **Expected:** Table should scroll within a container or reflow for small screens.

### ⚪ Nit
**PESO dashboard header column order.**
- **Where:** `/tools/coverageiq` — PESO Dashboard tab header.
- **Expected:** Logical/consistent column ordering.

*Verified working:* PESO Dashboard tab works; "+ New Pitch" modal → Log Pitch succeeded ("Pitch logged"). **Note:** this created one reversible client-side demo pitch (Pipeline count 16→17, persisted via client-side storage). No server-side/destructive change.

---

## 5. Cross-Page Findings

### 🟠 Major
**Inconsistent headers/branding and uneven verification gating.**
- **What:** Header/branding differs per tool; Cloudflare Turnstile gating is applied unevenly (PressIQ passes verification and works; SignalIQ and JournoCollabIQ hard-fail with 403).
- **Where:** Across all 4 tool pages.
- **Expected:** Consistent header/footer/branding and a uniform, completable verification experience across tools.

---

## 6. Summary Table — Issue Counts by Page

| Page | 🔴 Critical | 🟠 Major | 🟡 Minor | ⚪ Nit | Total |
|------|:----------:|:-------:|:-------:|:-----:|:-----:|
| SignalIQ | 1 | 0 | 1 | 1 | 3 |
| JournoCollabIQ | 1 | 1 | 1 | 0 | 3 |
| PressIQ | 0 | 1 | 1 | 0 | 2 |
| CoverageIQ | 0 | 2 | 0 | 1 | 3 |
| Cross-page | 0 | 1 | 0 | 0 | 1 |
| **Total** | **2** | **5** | **3** | **2** | **12** |

---

## 7. Top 5 Fixes by Impact

1. **Fix SignalIQ scan 403 "Verification failed"** (Critical) — the primary tool action is fully blocked for a first-time visitor.
2. **Fix JournoCollabIQ `/api/journo-ai` 403** (Critical) — research generation, the tool's core output, fails.
3. **Unify verification gating across all tools** (Major, cross-page) — make Turnstile completable everywhere like PressIQ, so no tool hard-fails.
4. **Clear/neutralize JournoCollabIQ pre-filled demo data** (Major) — prevents first-time users from submitting stale "Onsense.ai" content.
5. **Add progress feedback to PressIQ analysis + make CoverageIQ CRM table responsive** (Major) — addresses the two biggest UX friction points on the otherwise-passing pages.

---

## 8. EMOS Link Resolution (not audited)
Confirmed `GET /emos` → **200 OK** (no 404). All 4 tool prefetch URLs also returned 200. No further auditing performed, per scope.

---

*End of report — report only; no changes were made to the site beyond one reversible client-side demo pitch in CoverageIQ.*
