# Accessibility Review — Life Focus Intelligence UX Spine

**Scope:** DESIGN.md + EXPERIENCE.md (spine pair), spot-check of `mockups/commitment_ledger.html` and `mockups/capture_inbox.html`
**Floor:** PRD NFR-7 — keyboard navigation, screen readers, high contrast, status never conveyed by color alone — across both light and dark themes.
**Reviewer:** Accessibility review agent · 2026-07-12
**Method:** WCAG 2.1 relative-luminance contrast ratios computed from the exact hex tokens in DESIGN.md frontmatter and the exact hex values in the two mockups. Thresholds: 4.5:1 body text, 3:1 large text (≥24px / ≥18.66px bold) and non-text UI components (WCAG 1.4.3, 1.4.11).

**Verdict:** The spine's accessibility intent is unusually strong for a planning artifact — the token math is largely sound and the color-only-status rules are genuinely specified — but there is one critical hole (the entire commitment-status/at-risk color vocabulary lives outside the token system with no dark-mode variants) and two major behavioral gaps (no focus-visible spec, no live-region/announcement rules for the product's most dynamic moments).

---

## 1. Contrast math

### 1a. Token pairs — light theme (computed)

| Pair | Fg / Bg | Ratio | AA body 4.5:1 | Notes |
|---|---|---|---|---|
| `light-on-surface` / `light-surface` | #1c1c18 / #fcf9f3 | **16.26** | PASS | Excellent |
| `light-on-surface-variant` / `light-surface` | #424848 / #fcf9f3 | **8.87** | PASS | |
| `light-on-primary` / `light-primary` | #ffffff / #17282a | **15.29** | PASS | |
| `light-on-primary-container` / `light-primary-container` | #96a9ab / #2d3e40 | **4.57** | PASS (marginal) | 0.07 of headroom; see Finding M-1 |
| `light-secondary` / `light-surface` | #5e5e5c / #fcf9f3 | **6.18** | PASS | |
| `light-error` / `light-surface` | #ba1a1a / #fcf9f3 | **6.15** | PASS | |
| `light-on-error` / `light-error` | #ffffff / #ba1a1a | **6.46** | PASS | |
| `light-on-error-container` / `light-error-container` | #93000a / #ffdad6 | **7.24** | PASS | |
| `light-on-surface` / `light-surface-container` | #1c1c18 / #f1ede7 | **14.66** | PASS | |
| `light-on-surface` / `light-surface-container-high` | #1c1c18 / #ebe8e2 | **13.98** | PASS | |
| `light-on-surface` / `light-surface-container-highest` | #1c1c18 / #e5e2dc | **13.22** | PASS | |
| `light-on-surface-variant` / `light-surface-container` | #424848 / #f1ede7 | **8.00** | PASS | |
| `light-on-surface-variant` / `light-surface-container-highest` | #424848 / #e5e2dc | **7.21** | PASS | |
| `light-secondary` / `light-surface-container` | #5e5e5c / #f1ede7 | **5.57** | PASS | |
| `light-secondary` / `light-surface-container-highest` | #5e5e5c / #e5e2dc | **5.03** | PASS | Capacity-chip labels OK |
| `light-on-secondary-container` / `light-secondary-container` | #636360 / #e1dfdc | **4.53** | PASS (marginal) | 0.03 of headroom; see M-1 |
| `light-on-tertiary-container` / `light-tertiary-container` | #a7a5a5 / #3b3b3b | **4.57** | PASS (marginal) | See M-1 |
| `light-outline` / `light-surface` (UI, 3:1) | #727879 / #fcf9f3 | **4.27** | PASS | |
| `light-on-primary` (white) / `light-primary-container` (Approve button) | #ffffff / #2d3e40 | **11.20** | PASS | |
| `light-on-primary-fixed` / `light-primary-fixed` | #0d1e20 / #d3e6e8 | **13.28** | PASS | |

### 1b. Token pairs — dark theme (computed)

| Pair | Fg / Bg | Ratio | AA body 4.5:1 |
|---|---|---|---|
| `dark-on-surface` / `dark-surface` | #e3e5e3 / #1a1c1b | **13.53** | PASS |
| `dark-on-surface-variant` / `dark-surface` | #c2c8c7 / #1a1c1b | **10.10** | PASS |
| `dark-on-primary` / `dark-primary` | #0d1e20 / #b7cacc | **10.08** | PASS |
| `dark-on-primary-container` / `dark-primary-container` | #d3e6e8 / #394a4c | **7.20** | PASS |
| `dark-secondary` / `dark-surface` | #c8c6c4 / #1a1c1b | **10.06** | PASS |
| `dark-error` / `dark-surface` | #ffb4ab / #1a1c1b | **10.09** | PASS |
| `dark-on-error` / `dark-error` | #690005 / #ffb4ab | **7.72** | PASS |
| `dark-on-error-container` / `dark-error-container` | #ffdad6 / #93000a | **7.24** | PASS |
| `dark-on-surface` / `dark-surface-container` | #e3e5e3 / #202323 | **12.51** | PASS |
| `dark-on-surface` / `dark-surface-container-high` | #e3e5e3 / #2b2e2d | **10.83** | PASS |
| `dark-on-surface` / `dark-surface-container-highest` | #e3e5e3 / #363938 | **9.22** | PASS |
| `dark-on-surface-variant` / `dark-surface-container-highest` | #c2c8c7 / #363938 | **6.88** | PASS |
| `dark-secondary` / `dark-surface-container-highest` | #c8c6c4 / #363938 | **6.85** | PASS |
| `dark-on-secondary-container` / `dark-secondary-container` | #e4e2df / #474745 | **7.20** | PASS |
| `dark-outline` / `dark-surface` (UI, 3:1) | #8c9292 / #1a1c1b | **5.42** | PASS |

**The dark palette is excellent** — no dark token pair is below 5.4:1, and the claim in DESIGN.md ("All dark tokens verified at WCAG AA") checks out for every pair above. The light palette passes everywhere but has three pairs with essentially zero headroom (4.53–4.57).

### 1c. Mockup hex values (the a11y-relevant part — none of these are tokens)

| Usage | Fg / Bg | Ratio | Threshold | Result |
|---|---|---|---|---|
| At-risk chip text (12px) | #92400e / #fef3c7 | **6.37** | 4.5 | PASS |
| Overdue badge (11px) | #92400e / #fffbeb | **6.84** | 4.5 | PASS |
| **Warning icon** on amber chip | #d97706 / #fef3c7 | **2.86** | 3.0 (1.4.11) | **FAIL** |
| Warning icon on at-risk card | #d97706 / #fffbeb | **3.07** | 3.0 | PASS (marginal) |
| At-risk left border | #d97706 / #ffffff | **3.19** | 3.0 | PASS (marginal) |
| State chip "Accepted" (12px) | #0369a1 / #e0f2fe | **5.17** | 4.5 | PASS |
| State chip "In progress" (12px) | #065f46 / #d1fae5 | **6.78** | 4.5 | PASS |
| State chip "Waiting" (12px) | #5b21b6 / #ede9fe | **7.57** | 4.5 | PASS |
| State chip "Waiting on you" (12px) | #c2410c / #fff7ed | **4.88** | 4.5 | PASS |
| State chip "Fulfilled" (12px) | #424848 / #e5e2dc | **7.21** | 4.5 | PASS |
| Confidence/timestamp text (11–11.5px) | #5e5e5c / #ffffff | **6.50** | 4.5 | PASS |
| Clarification text (13px) | #78350f / #fef9ee | **8.64** | 4.5 | PASS |
| **Fulfilled card at `opacity: 0.6`** — title (14px, effective #777774 on white) | | **4.49** | 4.5 | **FAIL** (marginal) |
| Fulfilled card meta (12px, effective #8e9191) | | **3.18** | 4.5 | **FAIL** |
| Fulfilled card secondary text (11px, effective #9e9e9d) | | **2.68** | 4.5 | **FAIL** |
| Sidebar nav label, `rgba(255,255,255,0.55)` @ 10px (effective #979e9f on #17282a) | | **5.61** | 4.5 | PASS (but see typography) |
| **Sidebar Settings label**, `rgba(255,255,255,0.4)` @ 9px (capture_inbox, effective #747e7f) | | **3.66** | 4.5 | **FAIL** |
| Ghost-button border (sole component boundary) | #ebe8e2 / #ffffff | **1.22** | 3.0 | **FAIL** (see Minor) |

---

## Findings

### CRITICAL

**C-1 — The entire commitment-status / at-risk color vocabulary exists only as hardcoded hex in mocks, with no tokens and no dark-mode variants.**
Both mockups build the Commitment Ledger and Capture Inbox status system (an MVP surface's core vocabulary) from ad-hoc hex values that appear nowhere in DESIGN.md's 80-token palette: `#d97706`, `#92400e`, `#fef3c7`, `#fffbeb`, `#0369a1`/`#e0f2fe`, `#065f46`/`#d1fae5`, `#5b21b6`/`#ede9fe`, `#c2410c`/`#fff7ed`, `#78350f`/`#fef9ee`, `#f5d98a`, plus `#5ecfca` (capture_inbox active-nav indicator). This directly violates DESIGN.md's own rules — "No hardcoded hex values in component CSS" (EXPERIENCE.md Theme Switching) and "Keep both light and dark token sets complete; every component specifies both" (DESIGN.md Do's) — and it means **dark-theme contrast for at-risk, overdue, waiting, accepted, in-progress, fulfilled, and classification-chip states is entirely undefined and unverifiable**. NFR-7 promises the floor across BOTH themes; today one theme's status system doesn't exist. Included in this finding: the warning icon `#d97706` on `#fef3c7` computes **2.86:1**, failing WCAG 1.4.11 (3:1 for graphical objects) in the light theme — the icon is precisely the "shape companion" the spine relies on for non-color status, so it must itself meet 3:1.
**Fix:** Promote a warning/attention token family (e.g., `light-warning`, `light-on-warning-container`, `light-warning-container` + dark counterparts) and a state-chip token set into DESIGN.md frontmatter, with computed AA ratios in both modes; darken the icon color (e.g., `#92400e` on `#fef3c7` = 6.37:1 already passes for both text and icon).

### MAJOR

**M-2 — No focus-visible specification anywhere.**
EXPERIENCE.md's Accessibility Floor specifies Tab reachability, focus order = reading order, and Esc-closes-topmost — good. But neither document defines a focus-visible treatment: no focus-ring token, no offset/width/color rule, no spec for focus on dark surfaces (a `light-primary` ring is invisible on the `#17282a` sidebar). The only focus style in the whole system is `capture-quick-add: focus-border-bottom-light`. Both mockups contain **zero** `:focus-visible` CSS and rely on browser defaults, which the heavy `border-radius: 999px` pill language will clip inconsistently. For a product that declares "the keyboard surface IS the product," this is the single most load-bearing missing rule. The deferred shortcut table (GAP register) is acceptable; a missing focus-visible system is not.
**Fix:** Add a `focus-ring` token pair (light/dark) to DESIGN.md components + a global rule in the Accessibility Floor (e.g., 2px ring, 2px offset, `light-primary`/`dark-primary`, never removed, WCAG 2.4.13-compatible).

**M-3 — No live-region / announcement rules for the product's dynamic moments.**
The Screen readers section covers static semantics well (roles + state labels, pip announcements, confidence phrasing, drawer expand/collapse state). It says nothing about *announcements* for: (a) plan-diff rerenders during Modify mode ("Each adjustment reruns the plan-diff and updates Plan Intelligence in real time" — a sighted-only experience as specified); (b) sync-health degradation ("confidence chip changes label" — silent to SR users); (c) the transient one-step Undo affordance (NFR-4) — appears and disappears with no announcement rule and **no minimum persistence duration**, a WCAG 2.2.1 (Timing Adjustable) risk; (d) autosave "Saving… → Saved". No landmark map is specified either (which surface regions are `main`/`nav`/`aside`/`complementary`; the Plan Intelligence panel is a natural `complementary` landmark).
**Fix:** Add to Accessibility Floor: a polite `aria-live` region for plan-diff/sync-health/save-state announcements, an assertive-or-polite decision + minimum on-screen duration (or focusable persistence) for the Undo affordance, and a landmark map per surface.

**M-4 — The "muted/archived" opacity pattern fails AA in the light theme.**
`commitment_ledger.html` dims fulfilled commitments with `opacity: 0.6` on the whole card. Computed effective contrast: title 14px = **4.49:1** (fail), 12px meta = **3.18:1** (fail), 11px secondary text = **2.68:1** (fail). This is a pattern risk, not just a mock bug — "fulfilled/closed commitments (muted, archived feel)" is named as a spine section, so devs will copy the opacity idiom. Dimming-by-opacity in the dark theme would degrade even faster.
**Fix:** Spec the muted state with tokens that still pass AA (e.g., `on-surface-variant` text at full opacity = 8.0:1 on white) instead of container-level opacity.

**M-5 — Keyboard semantics for the decision surfaces are unspecified.**
The approve flow says "explicit tap or keyboard action" but never defines what the keyboard action is (Enter/Space on the focused Approve button is implied by native `button`, but nothing states that Approve must be the natural next Tab stop after the timeline, or where focus goes after approval clears the sticky area). Scenario cards (grid of up to 4) have no keyboard selection model: no roving-tabindex/radiogroup decision, no rule for where focus lands after "Select Option" applies the plan-diff, no Enter/Esc semantics for the inline clarification banner in Capture Inbox. Esc is specified only for popovers/drawers. Modify mode is a declared GAP (acceptable as deferral), but the approve flow and scenario cards are MVP-critical and spec-silent.
**Fix:** Add per-flow rules: scenario cards = group with one Tab stop + arrow keys, or plain sequential buttons (decide); focus moves to the applied plan-diff summary after selection; Enter activates, Esc dismisses clarification without data loss.

### MODERATE

**M-1 — Three light-theme token pairs pass AA with near-zero headroom.**
`light-on-primary-container` #96a9ab / #2d3e40 = **4.57:1**, `light-on-secondary-container` #636360 / #e1dfdc = **4.53:1**, `light-on-tertiary-container` #a7a5a5 / #3b3b3b = **4.57:1**. These pass, but any rendering variance (font smoothing, opacity in glass panels, blending over the 70%-alpha `glass-panel` backgrounds) drops them below 4.5:1. Note the glass panels (`rgba(252,249,243,0.7)` + blur) make all computed on-surface ratios content-dependent — contrast over glass should be spec'd against the worst-case underlying surface.
**Fix:** Nudge the three on-container tokens (e.g., #96a9ab → #a3b5b7 gives headroom) or restrict them to large text; add a rule that text over glass panels must meet AA against the darkest permitted backdrop.

**M-6 — Selected/active states conveyed by fill color alone.**
The color-only rules in DESIGN.md and EXPERIENCE.md genuinely cover status (pips, consequence icons, capacity-chip risk, at-risk badge = "shape + label + color") — this part of the spine holds. But *selection* states are not covered: the mock filter chips' active state is background-fill only (`filter-chip.active` = dark fill, same label), and no component spec requires `aria-pressed`/`aria-selected` or a non-color companion (checkmark) for chips, nav items, or the recommended scenario card ("RECOMMENDED" badge exists — good — but filter/nav selection has no equivalent rule). Also: the commitment **state chips** (Accepted/In progress/Waiting/At risk/Fulfilled) have no component spec in DESIGN.md at all — the mocks happen to pair icon + label, but nothing *requires* it, which is exactly the spec-vs-mock gap NFR-7 needs closed.
**Fix:** Add a `state-chip` component spec (icon + text label mandatory, tokenized colors both modes) and a selection-state rule (ARIA state + non-color indicator).

**M-7 — Sub-scale type sizes and no zoom/reflow requirements.**
The typography scale bottoms out at `label-caps` 12px, but the mocks ship 9px (Settings label), 9.5–10px (nav labels, stat labels), and 11–11.5px (badges, timestamps, confidence text) — all below the system's own smallest token. Playfair Display is correctly confined to ≥24px headlines (spec: "never used for body copy, labels" — good), though mocks use it decoratively at 14–18px in logo marks (tolerable as decoration). Neither document states WCAG 1.4.4 (200% zoom), 1.4.10 (reflow at 320px), or 1.4.12 (text spacing) expectations, and no maximum line-length rule exists despite 1200px content columns with `body-md` 16px.
**Fix:** Declare 12px as the hard floor (fix mock stragglers), add zoom/reflow/text-spacing to the Accessibility Floor, and cap body measure (~70ch).

**M-8 — forced-colors / Windows High Contrast Mode is never mentioned.**
PRD NFR-7 explicitly commits to "high contrast." `prefers-color-scheme` handling is exemplary (System default, no-flash inline script, reactive change listener), and `prefers-reduced-motion` is covered — but `forced-colors: active` appears nowhere. The system leans on subtle non-border cues (tonal surface layering, 4px left borders, fill-state pips) that forced-colors mode strips or flattens; the filled-vs-open pip distinction specifically needs a forced-colors fallback (border style or SVG `forced-color-adjust` handling). A one-paragraph explicit deferral would be acceptable; total silence against an NFR commitment is not.
**Fix:** Add a forced-colors subsection to the Accessibility Floor (or an explicit, dated deferral in the GAP register).

### MINOR

**N-1 — Mockups carry no a11y idioms to imitate.** Zero `aria-*` attributes, zero `role`s, zero `tabindex`, no `aria-live`, no skip link in either mock. Landmarks are partially right (`nav`/`main`/`aside`/`header` used; `commitment_ledger` marks the sidebar `aside` where `nav` is more accurate) and interactive elements are native `button`/`a`/`input` (consistent with the jsx-a11y lint-gate commitment — good). Mocks are mocks, but since EXPERIENCE.md names them as key-screen references, they teach the wrong defaults. The capture input also has no associated `label`/`aria-label` (placeholder-only labeling).

**N-2 — Ghost-button boundary is 1.22:1.** `#ebe8e2` border on white cards is the *only* boundary for ghost/secondary buttons (Reclassify, Snooze, Reply). Text inside passes (6.5:1+), so this is a usability-leaning 1.4.11 judgment call, but low-vision users get no discernible hit area. Consider `light-outline` (#727879, 4.27:1) for interactive boundaries.

**N-3 — DESIGN.md strikethrough contradiction.** Components spec says "Intentionally not scheduled" items use `line-through` text at 0.8 opacity; the Do's/Don'ts table says don't "use strikethrough as an implicit failure signal." The mock also strikes through completed dates. Pick one; if strikethrough stays, ensure SR text carries the semantic ("Intentionally not scheduled") since `text-decoration` is not announced.

---

## What the spine gets right (worth preserving)

- Dark palette computed ratios are outstanding (min 5.42:1, most pairs 7–13:1); the "verified at WCAG AA" claim is true at token level.
- Color-only status rules are real component-level requirements, not mock accidents: domain pips ("shape + aria-label carry the protection signal; color is supplemental" — DESIGN.md `domain-pip`), consequence checklist ("icon + text… Color is supplemental, never sole" — EXPERIENCE.md), capacity-chip risk (icon + subline), at-risk badge ("shape + label + color").
- Esc semantics, Tab reachability, focus order = reading order, sticky-area reachability are all stated.
- SR announcement content for pips, confidence chips, and drawer state is specified.
- `prefers-color-scheme` + no-flash + reactive system sync; `prefers-reduced-motion`; 44px touch targets; semantic-HTML/jsx-a11y lint gate; no hover-only affordances on mobile; modal stack depth ≤ 1.

## Severity counts

| Severity | Count | IDs |
|---|---|---|
| Critical | 1 | C-1 |
| Major | 4 | M-2, M-3, M-4, M-5 |
| Moderate | 4 | M-1, M-6, M-7, M-8 |
| Minor | 3 | N-1, N-2, N-3 |

Total: 12 findings.

## Recommended gate

Do not exit the UX phase until C-1 (tokenize the status/warning palette in both themes) and M-2 (focus-visible system) are resolved in DESIGN.md, and M-3/M-5 rules are added to EXPERIENCE.md's Accessibility Floor. M-4 and the Moderates can be story-level acceptance criteria; the Minors are mock-hygiene notes for the build phase.
