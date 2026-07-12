---
title: Stitch Import Reconciliation
created: 2026-07-12
scope: Compares the 7 Stitch screens (live_day_focus, personal_commitment_school_notice, context_review_source_conflicts, material_status_change_alert, morning_plan_documentation_layer, interrupt_decision_evidence_runbooks, person_detail_anna_fixed) plus the Stitch DESIGN.md prose against the canonical DESIGN.md and EXPERIENCE.md spines.
verdict-rule: Spines win on every conflict. Flags here are for mock-consumer awareness and backlog for spine authors.
---

# Stitch Import Reconciliation

## Methodology

Sources read:
- **Canonical spines:** `DESIGN.md`, `EXPERIENCE.md` (both dated 2026-07-12)
- **Import:** `imports/life_focus_intelligence/DESIGN.md` (Stitch prose)
- **Screens (7):** `live_day_focus/code.html`, `personal_commitment_school_notice/code.html`, `context_review_source_conflicts/code.html`, `material_status_change_alert/code.html`, `morning_plan_documentation_layer/code.html`, `interrupt_decision_evidence_runbooks/code.html`, `person_detail_anna_fixed/code.html`
- **Skimmed for contradiction only:** `morning_whole_life_plan/code.html`, `interrupt_decision_tradeoffs/code.html`

Severity definitions:
- **MATERIAL** — affects implemented component anatomy, color tokens, or behavioral contract. Builders will diverge without this.
- **MINOR** — pattern present in screens but not specified in spine; low-risk omission, should be codified.
- **COSMETIC** — editorial/prose refinement; no builder impact if ignored.

---

## Findings

### GAP-01 — Amber/warning color tier entirely absent from DESIGN.md
**Severity:** MATERIAL

**Evidence:** `material_status_change_alert/code.html` defines:
```css
.amber-accent  { color: #d97706; }
.amber-bg-soft { background-color: #fef3c7; border: 1px solid #fde68a; }
```
Used as the ribbon at the top of the alert card for SEV-2 → SEV-1 severity escalation. The Stitch import `DESIGN.md` prose lists "Red/Amber/Green appear only when a user's Capacity is at risk or a hard conflict occurs." DESIGN.md frontmatter has `light-error: #ba1a1a` only. There is no warning/amber token in the light or dark palette, and the `glass-panel` component spec lists only an `attention-border-left` using `light-error` — not a distinct amber tier.

**Where it should land:** Add `light-warning` (#d97706) and `light-warning-container` (#fef3c7) token pair to DESIGN.md frontmatter colors section, plus dark-mode equivalents. Update `glass-panel` component: add `warning-ribbon-color` and `warning-ribbon-background` variants. Add a note: "amber/warning appears only for severity escalation alerts (SEV tier changes), not for generic urgency."

**Mock consumer impact:** Any builder implementing `material_status_change_alert` or future alert surfaces will invent their own amber or misuse `light-error`.

---

### GAP-02 — Person detail layout idioms not specified in DESIGN.md
**Severity:** MATERIAL

**Evidence:** `person_detail_anna_fixed/code.html` introduces a distinct layout:
- Circular profile photo with `border-surface-variant` ring
- **Intention card:** `bg-surface-container-low` + `border-l-4 border-primary-container` + `favorite` icon header — distinct from `timeline-block` hard-commitment pattern (which uses `border-l-4 border-primary`)
- **Suggested action vs. observation card pair:** side-by-side, `bg-surface-container-high` (action, elevated on hover) vs. `bg-surface-container` (observation, neutral) — a two-card comparative layout not the same as `decision-scenario-card`
- **Established rhythms section:** `icon + text + frequency` row pattern
- **Horizons/milestones:** `border-l accent` in `primary-container` + time badge (`rounded.full`)
- **Open commitments list:** `radio_button_unchecked` icon + hover-reveal action

DESIGN.md has no person-detail component block. EXPERIENCE.md lists "People" as surface #9 (v1.0) and references `imports/person_detail_anna_fixed/` as its mock, but provides no component spec.

**Where it should land:** Add `person-detail` component block to DESIGN.md with: profile header anatomy, intention-card variant (border-l in `primary-container`, not `primary`), action-vs-observation two-card pattern, rhythms row, horizon item with time badge, open commitment row. Also add a behavioral note in EXPERIENCE.md People surface: "Intention card uses `primary-container` left border (not `primary`) to distinguish personal intent from system-protected commitments."

**Mock consumer impact:** Builders will conflate intention cards with protected timeline blocks and use incorrect border color.

---

### GAP-03 — Documentation-layer drawer is a different animation contract than evidence drawer
**Severity:** MATERIAL

**Evidence:** `morning_plan_documentation_layer/code.html` uses CSS grid animation:
```css
.drawer { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
.drawer.open { grid-template-rows: 1fr; }
.drawer-content { overflow: hidden; }
```
This is a `grid-template-rows` collapse pattern. DESIGN.md `evidence-drawer` spec says "expandable row with chevron; collapsed by default" but specifies no animation contract.

Additionally, the documentation-layer drawer has **nested source-type badge variants** using Material Symbols icons to classify evidence origin:
- `bug_report` icon — issue tracker source
- `description` icon — document source
- `article` icon — article/reference source
- `security` icon — security/compliance source

DESIGN.md `evidence-drawer` only specifies generic `source-badge-background-light` with `rounded.full`. No icon variants per source type.

**Where it should land:** Add animation contract to `evidence-drawer` in DESIGN.md: "Collapse/expand via `grid-template-rows: 0fr → 1fr` transition (0.3s ease). Respects `prefers-reduced-motion` — collapse/expand is instant when motion is reduced." Add source-badge icon taxonomy: issue-tracker (`bug_report`), document (`description`), article (`article`), compliance (`security`), calendar (`event`), email (`mail`).

**Mock consumer impact:** Builders building expand/collapse from scratch without animation spec may use height animation, max-height hacks, or JS show/hide — all inferior to the grid pattern.

---

### GAP-04 — Commitment card / school notice anatomy missing
**Severity:** MATERIAL

**Evidence:** `personal_commitment_school_notice/code.html` introduces:
- **Privacy badge:** top-right corner, `lock` icon + "Private Scope" label text in `label-md` — distinct from the `domain-chip` protected variant (which is a full-width chip)
- **Source attribution header:** verification icon (`verified_user`) + source name + inline confidence indicator — not the same as the evidence drawer's source-badge list
- **Detected commitments list:** `icon + text + date` rows with a distinct list anatomy
- **Recommendation panel:** `border-l-4 border-primary` + `lightbulb` icon header + bulleted action items prefixed by arrow_right icon — different from `plan-intelligence-panel` card anatomy

DESIGN.md has no commitment-ingestion card or privacy scope badge component.

**Where it should land:** Add `privacy-scope-badge` component to DESIGN.md: position top-right, `lock` icon + "Private Scope" label, `label-md` style, `surface-container-highest` background, `rounded.md`. Add `source-attribution-header` component: `verified_user` icon + source name + inline `(NN% confidence)` in `label-md` secondary color. Add `recommendation-panel` variant to DESIGN.md with `lightbulb` icon header, `border-l-4 primary`, and `arrow_right` prefixed action items.

**Mock consumer impact:** Privacy scope indicator is a security-adjacent UX element (SEC-1, AC-14 context); divergence here creates misaligned trust signals.

---

### GAP-05 — Context review conflict UI patterns unspecified
**Severity:** MATERIAL

**Evidence:** `context_review_source_conflicts/code.html` shows several patterns not in DESIGN.md:
- **3-column conflict source grid:** three source boxes, active source at full opacity, inactive at `opacity: 0.8` — visual disambiguation of primary vs. secondary conflicting sources
- **Needs-confirmation item:** hover-reveal action button (`opacity: 0` → `opacity: 1` on group hover) for approve/reject without leaving the list
- **Trusted-baseline pill badge:** inline in text, `rounded.full`, `surface-container-highest` background, distinct from `domain-chip`
- **Recent-ingests timeline:** vertical line with dots + relative timestamps (e.g., "2 min ago"), distinct from the main day timeline
- **Connected-sources list:** icon + source name + sync status icon (`check_circle` for OK, `sync` for syncing, `error` for failed) + last-sync timestamp
- **Resolution input field:** `border-b` focus style (underline-only, no box), matching `capture-quick-add` but in a conflict-resolution context

EXPERIENCE.md names Context Review as surface #12 (v1.0) but provides no behavioral spec beyond its question ("What does the evidence say? Where do sources conflict?").

**Where it should land:** Add `context-review` surface section to EXPERIENCE.md: conflict source grid behavior (3-col, opacity for active/inactive), needs-confirmation hover-reveal pattern, connected-sources list anatomy with sync-state icons, recent-ingests mini-timeline. Add `trusted-baseline-badge` to DESIGN.md components (distinct from `domain-chip` — no lock icon, no color, text-only pill).

**Mock consumer impact:** Surface #12 has no behavioral spec; builder has no contract for the conflict-resolution interaction pattern.

---

### GAP-06 — Evidence/runbook panel in Interrupt Decision is underspecified
**Severity:** MINOR

**Evidence:** `interrupt_decision_evidence_runbooks/code.html` shows:
- **Context panel grid:** 2-5 column grid of label+value metadata pairs (Reporter, Severity, Affected System, Time since report, Escalation path) — a distinct incident-context anatomy not described in DESIGN.md
- **Evidence layer footer:** `verified_user` icon + "Evidence reviewed — Based on current information (N%)" summary line at the bottom of the decision surface (not the same as the expandable evidence drawer)
- **Recommendation narrative block:** `border-l-2 border-primary pl-6` with `body-lg` text — distinct from the `hard-conflict-callout` inset (which uses `border-l-4` and `error-container` tint)
- **Severity badge inline:** red dot + "SEV-2" label in `label-md` — distinct from the chip taxonomy defined in DESIGN.md

DESIGN.md `decision-scenario-card` and `hard-conflict-callout` don't account for the context panel metadata grid or the evidence-layer footer summary.

**Where it should land:** Add `interrupt-context-panel` component to DESIGN.md: fluid grid of label+value pairs, `label-caps` for labels, `body-md` for values, `surface-container-low` background, `rounded.xl`. Add `evidence-layer-footer` component: non-expandable footer summary bar, `verified_user` icon, inline confidence phrase, `secondary` text color, appears below decision scenario cards. Add `severity-badge` component: inline dot + label, dot color from error/warning token per tier.

---

### GAP-07 — Live day focus introduces glass panel in non-plan-intelligence context
**Severity:** MINOR

**Evidence:** `live_day_focus/code.html` renders a `glass-panel` in the right column of the live day (Today) view — not just on the Morning Plan surface. DESIGN.md `glass-panel` spec says "Plan Intelligence aside" in its layout descriptor. EXPERIENCE.md's state table for "Plan approved" / Today says "Timeline becomes the live day view" without specifying whether the right-panel intelligence context persists after approval.

**Where it should land:** Clarify in DESIGN.md `glass-panel` component: "Used in both Morning Plan (pre-approval) and Today (post-approval) right-aside panel. The same four-card structure persists in live day view with updated real-time state." Clarify in EXPERIENCE.md Today surface description.

---

### GAP-08 — FAB (floating action button) on mobile bottom nav unspecified
**Severity:** MINOR

**Evidence:** `live_day_focus/code.html` shows a center-elevated FAB button in the mobile bottom navigation strip (the capture quick-add trigger, elevated above the nav strip level with a drop shadow). DESIGN.md `side-nav` component and EXPERIENCE.md mobile nav description mention "4-tab bottom strip" but say nothing about a FAB or capture affordance elevation on mobile.

**Where it should land:** Add to DESIGN.md `side-nav` component: "Mobile bottom strip includes a center FAB for capture quick-add: `rounded.full`, `primary` fill, elevated with `0px 4px 20px rgba(0,0,0,0.08)` shadow, sits above the tab strip z-plane. The four surrounding tabs are standard icon tabs." Add note in EXPERIENCE.md capture quick-add section: "On mobile, the capture entry point is the center FAB in the bottom nav strip."

---

### GAP-09 — SVG progress ring timer not in DESIGN.md
**Severity:** MINOR

**Evidence:** `live_day_focus/code.html` includes an SVG progress ring using `stroke-dasharray` / `stroke-dashoffset` animation for a focus timer display on the Today / live-day focus surface. No component or visual spec for this exists in DESIGN.md.

**Where it should land:** Add `focus-timer-ring` component to DESIGN.md when Focus Context surface (surface #11, v1.0) is designed. Tag as v1.0. Note: it appears in `live_day_focus` mock as a preview of v1.0 state — builders should not implement for MVP Today.

---

### GAP-10 — Stitch DESIGN.md "Life Timeline fluid horizontal axis" prose dropped
**Severity:** COSMETIC

**Evidence:** The Stitch import `DESIGN.md` (prose section under Layout & Spacing) states: "The 'Life Timeline' component should use a fluid horizontal axis to represent time." The canonical DESIGN.md describes only a vertical timeline rail. The horizontal-axis concept does not appear in any of the 9 screens either — all timelines are vertical. The prose appears to describe a possible Goals or Week surface, not the implemented day timeline.

**Where it should land:** Log as a design decision resolved by implementation: vertical timeline is the adopted pattern. If a horizontal time-axis is ever introduced (e.g., Week surface, v1.0), it should be specified as a separate `week-timeline` component. No action needed on current spines.

---

### GAP-11 — Stitch prose rule "glassmorphism only for sticky navigation bars" contradicts spine
**Severity:** COSMETIC (contradiction — spine wins)

**Evidence:** Stitch import `DESIGN.md` states: "Use backdrop blurs (Glassmorphism) only for sticky navigation bars to maintain context of the content scrolling beneath." Canonical DESIGN.md correctly expands this to the Plan Intelligence panel (`glass-panel` component, `plan-intelligence-panel` sticky aside). The canonical spine is right; the import is wrong.

**Mock consumer note:** Disregard the Stitch import prose rule. Canonical DESIGN.md governs: `glass-panel` is valid for the sticky Plan Intelligence aside and the sticky header — not arbitrary card use.

---

### GAP-12 — Scenario comparison card in Stitch prose vs. canonical decision-scenario-card
**Severity:** COSMETIC

**Evidence:** Stitch import `DESIGN.md` describes "Scenario Comparison Cards: Two or more containers side-by-side with a subtle vertical divider. Use these to show 'Plan A' vs 'Plan B' life paths." The canonical `decision-scenario-card` component is more precisely specified (up to 4 cards, P11 consequence checklist, recommended badge, 2px primary ring). The "vertical divider" detail from the Stitch prose does not appear in the screens or the canonical spec.

**Where it should land:** No action needed. Canonical spec is more precise and is adopted. The vertical-divider idea is superseded by the tonal card differentiation (recommended card elevated, standard card flat).

---

## Contradiction Register

| # | Import says | Spine says | Resolution |
|---|---|---|---|
| C-01 | "Glassmorphism only for sticky nav bars" (Stitch DESIGN.md) | `glass-panel` used for Plan Intelligence aside and sticky header | **Spine wins.** Glass-panel is valid for sticky context overlays. |
| C-02 | Amber as implicit feedback color (Stitch DESIGN.md prose mentions "Amber") | No amber token in DESIGN.md palette | **Spine is incomplete** (see GAP-01). Add amber token pair. |
| C-03 | "5:20 PM" work-end time appears in mock copy (already noted in DESIGN.md Do's/Don'ts) | 4:30 PM hard stop (PRD §8, memlog) | **Spine wins. Already flagged** in DESIGN.md Do's/Don'ts and EXPERIENCE.md flows. No new action. |

---

## Severity Summary

| Severity | Count | Finding IDs |
|---|---|---|
| MATERIAL | 5 | GAP-01, GAP-02, GAP-03, GAP-04, GAP-05 |
| MINOR | 4 | GAP-06, GAP-07, GAP-08, GAP-09 |
| COSMETIC | 3 | GAP-10, GAP-11, GAP-12 |

**Total findings:** 12  
**Contradictions:** 3 (C-03 already resolved in spines; C-01 spine wins; C-02 requires spine update per GAP-01)

---

## Recommended Next Actions

1. **Immediate (before any builder starts on alert, people, or context-review surfaces):** Resolve GAP-01 (amber token), GAP-02 (person-detail component), GAP-04 (commitment card anatomy). These affect components with no current spec.
2. **Before Interrupt Decision story implementation:** Resolve GAP-03 (drawer animation contract), GAP-06 (evidence/runbook panel anatomy).
3. **Before Context Review story (v1.0):** Resolve GAP-05 (full context-review behavioral spec in EXPERIENCE.md).
4. **Backlog (v1.0 scope):** GAP-07, GAP-08 (mobile FAB), GAP-09 (focus ring timer).
5. **No action needed:** GAP-10, GAP-11, GAP-12 (cosmetic/already resolved).
