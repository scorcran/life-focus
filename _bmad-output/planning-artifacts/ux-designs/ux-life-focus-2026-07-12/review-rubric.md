# Spine Pair Review — life-focus

## Overall verdict

The spine pair is **contract-ready with two targeted fixes required before story handoff**: the hardcoded green hex in `decision-scenario-card` must become a token, and the UJ-2 Key Flow has a protagonist-action inconsistency that will confuse story writers. Everything else is either strong, adequate, or a low-severity editorial note. A downstream consumer can extract cleanly on all load-bearing questions. The GAP Register in EXPERIENCE.md is exemplary — it converts ambiguity into explicit deferrals rather than hiding it.

---

## 1. Flow coverage — adequate

**What was checked.** All six PRD user journeys (UJ-1 through UJ-6) were verified against Key Flows. Each MVP journey was checked for: named protagonist, numbered steps, climax beat, and failure path.

### Findings

- **medium** UJ-2 narrative inconsistency (EXPERIENCE.md, Key Flows / UJ-2 steps 9–10). Step 9 says "Sean taps 'Select Option' on Option 3 (join at 5:15 PM after pickup)." Step 10 says "The system drafts an acknowledgment to Maya." That is coherent — but the climax paragraph says "Ask Priya to lead initially" and references preserving the architecture doc to Marcus, which are consequences of Option 1 (Delegate), not Option 3. The Climax beat is narrating Option 1's outcome even though the protagonist chose Option 3. A story writer sourcing this will write conflicting acceptance criteria. *Fix:* Rewrite the Climax to reflect Option 3's actual consequences — work end shifts to 5:30 PM after pickup, architecture commitment preserved to Marcus (rescheduled tomorrow 9 AM). Remove the "Ask Priya" framing from the Climax; it belongs in the Option 1 card description, not the conclusion.

- **low** UJ-4/5/6 absent from Key Flows. The Coverage Self-Check correctly tags these as v1.0 and the IA table marks all three surfaces as v1.0. Absence is defensible — the spines explicitly scope Key Flows to MVP journeys. *Fix:* None required before MVP story handoff; add a one-line note in Key Flows stating "v1.0 journeys (UJ-4/5/6) are specified at story level when their surfaces ship."

- **low** UJ-2 "Delegate" card is shown as Option 1 / RECOMMENDED in the flow (EXPERIENCE.md UJ-2 step 8). The GAP Register (RESOLVED note) explains that at MVP this card triggers an acknowledge flow, not a delegation workflow. This is resolved correctly, but the flow text says "the delegation workflow is v1.0" while still labeling Option 1 RECOMMENDED in the scenario. A story writer will ask: if delegation is deferred, why is the deferred option RECOMMENDED? *Fix:* Change UJ-2 Option 1 to the MVP-correct "Decline / Ask for context" or "Schedule tomorrow and acknowledge." Move Delegate to a parenthetical: "(Delegate arrives v1.0 — not rendered in this scenario at MVP)." Alternatively, swap RECOMMENDED to Option 3 in the narrative.

---

## 2. Token completeness — strong

**What was checked.** Every token defined in DESIGN.md frontmatter (colors, typography, spacing, rounded, component sub-keys). Every `{path.to.token}` reference in both spines. Contrast targets for load-bearing combinations.

### Findings

- **high** Hardcoded hex `#2d6a4f` in `decision-scenario-card.consequence-preserved-icon-color` (DESIGN.md frontmatter, components section). This green exists nowhere in the color token set — no name, no dark-mode pair. Downstream engineers will hardcode it, breaking the single-source-of-truth contract for dark mode. It also violates the file's own Do's and Don'ts rule "Leave any component without a specified dark-mode token." *Fix:* Add `light-success-indicator: '#2d6a4f'` and `dark-success-indicator: '#4caf50'` (or equivalent verified-contrast green) to the color frontmatter. Reference as `{colors.light-success-indicator}` in the component. Add a contrast note: verify ≥3:1 against `{colors.light-surface}` for icon-on-background use.

- **medium** Hardcoded hex `#ebe8e2` in `timeline-block.background-committed-light` (DESIGN.md frontmatter, components section). The value is byte-identical to the existing token `light-surface-container-high: '#ebe8e2'` but is written as a literal instead of a reference. If the surface scale is ever retuned, the committed-block background silently drifts out of the palette. Lower severity than `#2d6a4f` because a matching token already exists — the dark variant (`background-committed-dark`) correctly references `{colors.dark-surface-container}`. *Fix:* Replace with `'{colors.light-surface-container-high}'`.

- **medium** `sticky-action-area.button-approve` specifies `text-light: '{colors.light-on-primary}'` and `text-dark: '{colors.dark-on-primary}'` but the background is `{colors.light-primary-container}` (light) and `{colors.dark-primary-container}` (dark). In light mode: `light-on-primary` (#ffffff) on `light-primary-container` (#2d3e40) = high contrast. In dark mode: `dark-on-primary` (#0d1e20) on `dark-primary-container` (#394a4c) — dark text on dark container. No contrast claim is made for this pairing. *Fix:* Verify contrast ratio for dark-mode approve button. If it fails AA, swap `text-dark` to `{colors.dark-on-primary-container}` (#d3e6e8) which is the correct semantic pair for `dark-primary-container`.

- **low** EXPERIENCE.md Accessibility Floor states `{colors.light-on-surface}` (#1c1c18) on `{colors.light-surface}` (#fcf9f3) "≥ 4.5:1" and dark equivalent. These are stated as assertions, not verified calculations. For a consumer writing accessibility tests, the actual ratios should be documented. *Fix:* Either compute and state the actual ratios (e.g., "19.3:1") or note "verified via [tool] on [date]" so downstream can reproduce.

---

## 3. Component coverage — adequate

**What was checked.** All component names in DESIGN.md frontmatter and prose cross-referenced against EXPERIENCE.md Component Patterns section. Both visual spec (DESIGN.md) and behavioral spec (EXPERIENCE.md) required for each.

### Findings

- **medium** Five components have visual specs in DESIGN.md but no dedicated behavioral spec in EXPERIENCE.md Component Patterns: `side-nav`, `timeline-block`, `domain-pip`, `plan-intelligence-panel`/`glass-panel`, and `hard-conflict-callout`. These are partially covered in Key Flows prose, but prose narrative is not a behavioral spec — it doesn't state rules a story writer can convert to acceptance criteria. *Fix:* Add a brief behavioral spec for each in Component Patterns. Minimum per component: one sentence on the triggering condition, one on the interaction rule, one on the exit/state-change. For `timeline-block`: "Blocks are read-only during Today; enter adjust-mode only via 'Modify Plan' tap. Protected blocks have no drag affordance at any phase." For `hard-conflict-callout`: "Renders whenever a hard boundary is at risk. Stays visible until an explicit decision is recorded — no auto-dismiss."

- **low** `plan-intelligence-panel` and `glass-panel` are two separate frontmatter component entries but function as a single surface element (the panel contains glass-panel cards). No behavioral spec distinguishes when each is used as a standalone vs. composed. *Fix:* Note in Component Patterns that `glass-panel` is the card primitive; `plan-intelligence-panel` is the composed aside. Story writers need this to build correctly.

---

## 4. State coverage — adequate

**What was checked.** All 7 MVP surfaces walked for applicable states: empty, cold-load/skeleton, focus/active, error, offline/connector-failure, permission-denied.

### Findings

- **medium** Today surface has no "pre-setup" state defined — what does Today show before any sources are connected or before the first morning plan exists? The Day one state is defined for Morning Plan only ("Empty-state copy: 'Connect your calendars...'") but not for Today itself, which is the first surface shown. A story writer building the Today shell has no spec for this. *Fix:* Add a Today cold-start state to State Patterns: e.g., "When no plan exists, Today shows the same 'Connect your calendars' prompt as Morning Plan — it is not an empty chrome."

- **medium** Commitment Ledger has no empty state defined (no commitments yet). Capture Inbox has an empty state ("Nothing waiting for a decision") but the Ledger does not. *Fix:* Add to State Patterns: "Commitment Ledger empty: 'No commitments tracked yet. Accepted requests and confirmed commitments appear here.'"

- **low** Policy & Boundaries surface has no states at all in the table. As a settings surface it is low-risk, but first-run vs. configured states differ. *Fix:* Add a single row: "Policy & Boundaries first-run: shows starter templates with 'Accept' / 'Customize' actions for non-negotiables and work boundaries (FR-4 MVP templates)."

- **low** Interrupt Decision has no "no interrupt" or entry-without-capture state defined. If Sean navigates to it directly from the nav without a pending item, it is unclear what renders. *Fix:* Add: "Interrupt Decision empty: 'No interrupts waiting for a decision. Capture a new request to begin.'"

---

## 5. Visual reference coverage — adequate

**What was checked.** All files in imports/ (10 subdirectories) and mockups/ (3 HTML files). Cross-referenced against both spines' inline citations.

### Findings

- **medium** Two imports are referenced loosely in EXPERIENCE.md IA ("plus a status alert and a commitment detail") without naming their directory paths. `material_status_change_alert/` and `personal_commitment_school_notice/` have no explicit named link in either spine. A downstream consumer cannot find these without guessing. *Fix:* Replace the parenthetical with explicit named references: "[imports/material_status_change_alert/](imports/material_status_change_alert/screen.png) (sync/connector status alert overlay) and [imports/personal_commitment_school_notice/](imports/personal_commitment_school_notice/screen.png) (hard commitment detail card)."

- **low** `imports/life_focus_intelligence/` contains only a `DESIGN.md` (no screen.png). DESIGN.md frontmatter sources it as `imports/life_focus_intelligence/DESIGN.md`. The import is a design-intent artifact, not a visual mock — but it is listed alongside screen-bearing imports with no distinction. *Fix:* Add a parenthetical: "(identity/design intent document — no screen mock; see DESIGN.md for token derivation)."

- **low** No wireframes directory exists. The omission is fine (the Stitch HTML mocks cover the functional surfaces), but a note would prevent future contributors from creating one unnecessarily. *Fix:* Add a one-line note in EXPERIENCE.md IA: "No wireframes directory — Stitch mocks in imports/ serve as visual reference; mockups/ covers three additional surfaces in adopted token identity."

- **low** `spines-win-on-conflict` is stated in EXPERIENCE.md IA intro ("Where this spine conflicts with mock copy, the spine wins") — correct and present. ✓ No action needed.

---

## 6. Bloat & overspecification — strong

### Findings

- **low** EXPERIENCE.md Theme Switching section includes Next.js 16 RSC implementation notes (`localStorage` key name `lfi-theme`, inline script pattern, hydration caveat). This is implementation territory — it belongs in the architecture spine or a story tech note, not the experience spine. The GAP Register at the bottom correctly flags this with "[GAP: exact implementation pattern to confirm against Next.js 16 RSC specifics]" — but the detail above the GAP is already in the spec. *Fix:* Trim Theme Switching to behavioral contract only: three modes, System default, localStorage persistence, no-flash requirement, system-indicator in Settings UI. Move implementation detail to the architecture spine or defer to the story.

---

## 7. Inheritance discipline — strong

### Findings

- **medium** Neither spine carries a Glossary section. Key terms — "hard commitment," "protected priority," "plan-diff," "P11 consequence checklist," "renegotiation," "autonomy ladder" — are used throughout both files without inline definition. A downstream consumer (story writer, architect) must chase to PRD §14. The PRD is thorough but is a separate file with its own evolution cycle. *Fix:* Add a brief Glossary appendix to EXPERIENCE.md (or DESIGN.md, or both) containing the 8–10 terms most load-bearing for story writers. Verbatim from PRD §14 is fine — the goal is single-document usability.

- **low** DESIGN.md frontmatter sources `imports/life_focus_intelligence/DESIGN.md` which is a prior design-intent artifact, not a planning document. Sourcing it creates a shadow lineage that is potentially confusing — a consumer reading sources frontmatter will wonder if that file overrides anything. *Fix:* Add a comment in frontmatter: `# imports/life_focus_intelligence/DESIGN.md — Stitch identity artifact; referenced for visual lineage only; this DESIGN.md supersedes it.`

---

## 8. Shape fit — strong

### Findings

- No section order violations in either spine. DESIGN.md: Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts. Canonical order ✓.
- EXPERIENCE.md: Foundation → IA → Voice and Tone → Component Patterns → State Patterns → Interaction Primitives → Accessibility Floor → Key Flows. All required defaults present ✓.
- Invented sections (Responsive and Platform, Theme Switching, Coverage Self-Check, GAP Register) all earn their place. The GAP Register is exemplary practice.

---

## Per-section verdicts

| Section | Verdict |
|---|---|
| 1. Flow coverage | adequate |
| 2. Token completeness | strong |
| 3. Component coverage | adequate |
| 4. State coverage | adequate |
| 5. Visual reference coverage | adequate |
| 6. Bloat & overspecification | strong |
| 7. Inheritance discipline | strong |
| 8. Shape fit | strong |

## Finding counts by severity

| Severity | Count |
|---|---|
| critical | 0 |
| high | 1 |
| medium | 9 |
| low | 9 |

**Total: 19 findings.** The single high-severity finding (hardcoded hex `#2d6a4f`) and the medium UJ-2 narrative inconsistency are the two fixes required before story handoff. All others can be resolved incrementally without blocking downstream work.

---

## Mechanical notes

- **DESIGN.md sources frontmatter** includes `imports/life_focus_intelligence/DESIGN.md` and `../../../planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md`. The architecture spine path is relative and untested — verify that path resolves from the ux-designs subfolder before downstream consumers attempt to follow it.
- **EXPERIENCE.md sources frontmatter** includes `.memlog.md` — a process artifact. Harmless, but unusual. No impact on downstream use.
- **Component name consistency:** Verified across both spines. No drift detected. `decision-scenario-card`, `hard-conflict-callout`, `evidence-drawer`, `capacity-chip`, `domain-pip`, `timeline-block` are identical in all uses across both files.
- **PRD reference fidelity:** UJ names (UJ-1 through UJ-6), FR references (FR-30, FR-35, FR-67, FR-68), and principle numbers (P5, P11) are verbatim from PRD. AC-6, AC-8, AC-14, AC-15 cited correctly. NFR-2, NFR-4, NFR-9 cited correctly.
- **Spec conformance:** DESIGN.md conforms to the design-md spec at `/Users/sean/Documents/Github/life-focus/.claude/skills/bmad-ux/references/design-md-spec.md` (google-labs-code/design.md format): required `name` + `description` frontmatter present, flat kebab-case color object with hex strings, nested typography objects, `rounded`/`spacing`/`components` shapes correct, `{path.to.token}` cross-reference syntax used throughout, and the light/dark split uses the spec's sanctioned separate-kebab-token pattern. Body sections follow the spec's locked order with none omitted. The two hardcoded hex literals in component tokens (findings above) are the only deviations from the spec's token-reference discipline.
- **No wireframes directory** exists. The omission is coherent given the Stitch-based workflow.
