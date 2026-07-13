---
name: Life Focus Intelligence
status: final
created: 2026-07-12
updated: 2026-07-12
sources:
  - ../../prds/prd-life-focus-2026-07-10/prd.md
  - ../../prds/prd-life-focus-2026-07-10/addendum.md
  - ../../../planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md
  - DESIGN.md
  - imports/morning_whole_life_plan/code.html
  - imports/interrupt_decision_tradeoffs/code.html
  - .memlog.md
---

# Life Focus Intelligence — Experience Spine

> Visual specs and token values live in `DESIGN.md`. This document is the experience layer: behavior, IA, voice, flows, states, and interaction rules. Cross-references use `{path.to.token}` syntax. Where this spine conflicts with mock copy, the spine wins.

---

## Foundation

**Form factor:** Desktop-first web application with responsive mobile PWA for capture and review.

**Stack:** Next.js 16.2 PWA. No third-party UI component system — all surfaces are built on `DESIGN.md` tokens directly (custom component library). This is a deliberate brand-discipline choice: Life Focus Intelligence does not look like shadcn or MUI; it has its own calm, editorial identity.

**Theme preference:** Three modes — System (default, follows OS `prefers-color-scheme`), Light, and Dark. User selection persisted in `localStorage` and synced to the `<html class>` attribute on the server to prevent first-paint theme flash (see Theme Switching section). The `DESIGN.md` `light-*` and `dark-*` token sets are both complete and always ship together.

**Autonomy level at MVP:** L2 (recommend) + L3 (draft) only. The sole external write surface at MVP is Gmail draft creation. Nothing is sent without explicit user approval. No calendar write-back, no external system mutations (AD-8).

---

## Information Architecture

The product is organized around 13 named surfaces (FR-67), each answering a defined question. Seven ship at MVP; six are v1.0.

| # | Surface | Question answered | Phase | Nav position |
|---|---|---|---|---|
| 1 | **Today** | What matters now? What is protected? What is at risk? When does work end? | MVP | Primary (tab 1) |
| 2 | **Morning Plan** | Is this day's plan approved? | MVP | Reached from Today or on app open when plan is pending |
| 3 | **Interrupt Decision** | What are the tradeoffs if I accept this? | MVP | Reached from capture or notification; icon nav "Int" |
| 4 | **Capture Inbox** | What has been captured but not yet resolved? | MVP | Tab / icon nav |
| 5 | **Commitment Ledger** | What have I promised, to whom, at what risk? | MVP | Icon nav "Commitments" |
| 6 | **Policy & Boundaries** | What rules govern this plan? What autonomy am I granting? | MVP | Settings area |
| 7 | **End-of-Day Review** | Did I close today's loops? What carries forward? | MVP | Reached from Today when work-end window passes |
| 8 | **Week** | How is this week's capacity allocated? | v1.0 | Icon nav "Week" |
| 9 | **People** | Who are the important people, what do I owe them, what comes next? | v1.0 | Icon nav "Ppl" |
| 10 | **Goals** | What are my active goals, and are they getting time? | v1.0 | Icon nav "Goals" |
| 11 | **Focus Context** | What do I need to start this activity right now? | v1.0 | Reached from timeline block |
| 12 | **Context Review** | What does the evidence say? Where do sources conflict? | v1.0 | Icon nav "Sources" |
| 13 | **Learning Review** | What has the system learned? Which assumptions should I confirm or reject? | v1.0 | Settings area |

**Mock references** (spines win on conflict with any mock): Stitch imports cover Today ([imports/live_day_focus/](imports/live_day_focus/screen.png)), Morning Plan ([imports/morning_whole_life_plan/](imports/morning_whole_life_plan/screen.png), [imports/morning_plan_documentation_layer/](imports/morning_plan_documentation_layer/screen.png)), Interrupt Decision ([imports/interrupt_decision_tradeoffs/](imports/interrupt_decision_tradeoffs/screen.png), [imports/interrupt_decision_evidence_runbooks/](imports/interrupt_decision_evidence_runbooks/screen.png)), People detail ([imports/person_detail_anna_fixed/](imports/person_detail_anna_fixed/screen.png)), Context Review ([imports/context_review_source_conflicts/](imports/context_review_source_conflicts/screen.png)), [imports/material_status_change_alert/](imports/material_status_change_alert/screen.png) (sync/connector status alert overlay) and [imports/personal_commitment_school_notice/](imports/personal_commitment_school_notice/screen.png) (hard commitment detail card). Key-screen mocks in the adopted identity: [mockups/end_of_day_review.html](mockups/end_of_day_review.html), [mockups/capture_inbox.html](mockups/capture_inbox.html), [mockups/commitment_ledger.html](mockups/commitment_ledger.html). Week, Goals, Policy & Boundaries, Learning Review, and Focus Context are spine-only — built from `DESIGN.md` tokens and the tables in this document. `imports/life_focus_intelligence/` contains only a `DESIGN.md` (identity/design intent document — no screen mock; see `DESIGN.md` for token derivation). No wireframes directory — Stitch mocks in `imports/` serve as visual reference; `mockups/` covers three additional surfaces in the adopted token identity.

**Visual hierarchy rule (FR-68):** Every primary view follows this order, top-to-bottom:
1. Current decision or action (what Sean needs to do right now)
2. Recommendation (what the system proposes)
3. Reason (why — the "Why this matters" / "What this protects" language)
4. Person / goal / commitment protected
5. Consequence (what will move, who is affected)
6. Confidence and evidence (framed as "Based on current information")
7. Full source detail (available via evidence drawer — collapsed by default)

Progressive disclosure is mandatory: the default view shows only what is needed to decide. Evidence, sources, and full reasoning are accessible but not default-visible.

**Primary navigation shape:** Left sidebar rail on desktop (80px wide, icon + `{typography.label-caps}` label, active indicator is a 2px right border in `{colors.light-primary}`). On mobile, a 4-tab bottom strip. MVP tab set: Today / Interrupts / Inbox / Commitments. See Component Patterns › Side navigation for FAB spec and v1.0 additions.

---

## Voice and Tone

Microcopy is a product decision, not a copy decision. Visual posture lives in `DESIGN.md`; this section governs every word the system produces.

**Preferred language (verbatim from PRD §3):**

- "Why this matters"
- "What this protects"
- "What will move"
- "Who is affected"
- "Needs a decision"
- "Waiting on you"
- "Intentionally not scheduled"
- "Repeatedly displaced"
- "Best remaining opening"
- "Work ends at"
- "Based on current information"

**Forbidden language (verbatim from PRD §3 and addendum §8):**

- productivity score
- relationship health
- utility score
- optimized life
- "AI knows"
- objective priority
- knowledge-graph score

**Microcopy rules:**

| Situation | Write this | Not this |
|---|---|---|
| Confidence statement | "Based on current information (81%)" | "AI confidence: 81" or bare "81%" |
| Recommendation framing | "Based on current information, this option preserves school pickup." | "The AI recommends..." or "Optimal solution:" |
| Goal neglect | "Your health goal hasn't received scheduled time in 12 days. Wednesday morning is the best remaining opening." | "You've been neglecting your health goal!" or any guilt mechanics |
| Unscheduled item | "Intentionally not scheduled — Thursday morning is the best remaining opening." | "Skipped" or "Failed" |
| Interrupt recommendation button | "Choose this option" or "Accept recommendation" | "Execute Recommendation" |
| Plan approval button | "Approve today's plan" | "Confirm" or "Done" or "Execute" |
| Sync error | "Last synced 9:20 AM — plan may not reflect recent changes. Capture anything new manually." | "Error" or "Sync failed" |
| Connector failure | "Google Calendar hasn't synchronized since 9:20 AM. Some meetings may be missing. Confidence reduced." | "Integration error" |
| Empty capture inbox | "Nothing waiting for a decision." | "Inbox zero! Great work!" |
| At-risk commitment | "Commitment to Marcus (Friday) is at risk. Best renegotiation window: tomorrow 9 AM." | "You promised Marcus something due Friday." |
| Relationship intent reminder | "You said you wanted to call weekly — last call was 18 days ago. Want to add a call this week?" | "Your relationship with Mom needs attention." |

**Ethical relationship reasoning (P5):** The system reasons only about Sean's behavior and stated intentions. It never claims knowledge of another person's internal state. "Your mother feels neglected" is forbidden at every phase. "You said you wanted to call weekly — it's been 18 days" is correct.

---

## Component Patterns

Behavioral rules. Visual specs live in `DESIGN.md Components`.

### Plan Intelligence panel and glass-panel cards

`glass-panel` is the card primitive; `plan-intelligence-panel` is the composed sticky aside that contains the cards. A standalone `glass-panel` card can appear outside the aside (e.g., in Today live view). `plan-intelligence-panel` always denotes the full 4-card right aside. Story writers must not use them interchangeably.

**Triggering condition:** `plan-intelligence-panel` is present on both Morning Plan (pre-approval) and Today (post-approval) right-aside panel. The four-card structure persists in live day view with updated real-time state — it is not cleared after plan approval.

**Interaction rules:** Cards within the panel are read-only (no direct editing). The "Needs attention" card with `attention-border-left` (error color) signals a hard risk — it remains visible until an explicit decision is recorded (no auto-dismiss). The panel does not control plan mutations; it informs them.

**Exit / state-change:** After plan approval, the sticky action area clears but the Plan Intelligence panel updates to show real-time state — risks resolved or new, confidence updated. It does not disappear.

### Timeline block behavioral spec

Blocks are read-only during Today surface (live day view). Adjust mode is only entered via the "Modify Plan" tap on the Morning Plan surface. Protected blocks (hard commitments) have no drag affordance at any phase. Hover lift (`translateY(-0.5px)`) signals interactivity in Morning Plan adjust mode; suppressed for protected blocks in Today view.

### Hard-conflict callout behavioral spec

Renders whenever a hard boundary is at risk (detected during interrupt classification or plan-diff). Stays visible until an explicit decision is recorded — no auto-dismiss. The inner recommendation inset label is always "Based on current information" (never "The AI recommends" or "Optimal").

### Side navigation behavioral spec

Desktop: 80px icon rail, always visible at `≥ lg` breakpoint. Active item: `surface-container` fill + 2px `primary` right border. No hamburger menu on desktop. Mobile: 4-tab bottom strip (Today / Interrupts / Inbox / Commitments at MVP). Center FAB above the strip provides capture quick-add access — see `DESIGN.md components.side-nav` for FAB token spec. Tab set v1.0 adds Goals, People, Sources.

### Decision scenario cards (Interrupt Decision surface)

Each card implements the P11 consequence checklist (FR-30, P11) as its primary body content — not as a footnote. The six checklist items are:
1. What is displaced
2. Who is affected
3. Which goal loses time
4. Whether a boundary is violated
5. Whether the finish time changes
6. Whether another person must agree

Not every interrupt triggers all six items; items with no consequence are omitted (not shown as "N/A"). Items present always use icon + text (shape + color: `check_circle` for preserved, `cancel` for violated, `schedule`/`info` for neutral). Color is supplemental, never sole.

The "Select Option" button is always present and always requires an explicit tap. No hover-to-commit, no auto-commit. MVP interrupt options: do now, schedule, acknowledge, clarify, decline. "Delegate" appears only at v1.0 (PRD §7.2 explicitly defers it).

### Evidence drawer expand behavior

The evidence drawer is a progressively disclosed expansion, not a modal. It expands inline below the recommendation it annotates. The collapsed trigger reads: "[icon] Based on current information · View sources" in `{typography.label-md}` / `{colors.light-secondary}`. On expansion: source badges appear first (most authoritative first, per addendum §4 authority order), then confidence phrase, then last-verified timestamp, then expandable evidence list, then assumptions (labelled "Assumptions"), then conflicts (labelled "Conflict detected," error color), then any user corrections (labelled "Overridden by you").

The drawer never opens a modal or navigates away from the current surface.

### Capacity chips semantics

The five chips communicate capacity state, not a single "productivity score." They answer specific questions:
- **Work:** How much work time remains in the day? (labeled "Ends [time]")
- **Personal:** How much personal/family time is committed today? (labeled "N Hard Commitments")
- **Flexibility:** How much interrupt reserve remains? (labeled "Interrupt Reserve")
- **Confidence:** How reliable is this plan given current source coverage? (teal value color; labeled "Plan Viability" — not "AI Score")
- **Unscheduled:** How much demand is unresolved vs. capacity? (error subline + warning icon only when demand exceeds capacity)

No chip ever shows a gamified status, a streak, or a comparative rank.

### Plan approve / modify flow

Morning Plan is the only surface with the sticky action area at MVP. Flow:
1. System renders the plan with all blocks, exclusions, risks, expected work end, and confidence.
2. Sean reviews the timeline + Plan Intelligence panel.
3. **Modify Path:** "Modify Plan" opens an adjustment mode (drag/swap blocks or remove items). Each adjustment reruns the plan-diff and updates Plan Intelligence in real time.
4. **Approve Path:** "Approve today's plan" is a single explicit tap — a committed affirmative. The system records the approval timestamp (SM-2 instrument). No confirmation dialog on top of this; the button itself is the confirmation.
5. After approval, the sticky action area clears and Today becomes the active surface.

Approval is never auto-triggered by time or inactivity.

### Capture quick-add (≤ 2 interactions)

Accessible from any surface via a persistent capture entry point. Interaction budget:
- Interaction 1: Focus the capture field (tap/click, or keyboard shortcut TBD)
- Interaction 2: Type text + Enter / tap the send icon

The system classifies the item after submission — Sean does not classify it upfront. Clarification questions (max 3, per FR-19) arrive as a follow-up in the Capture Inbox, not blocking the submission moment.

On mobile, the capture field opens the phone keyboard immediately — it does not require navigating to a Capture Inbox surface first (NFR-9, AC-6).

### Context Review surface (surface #12, v1.0)

The Context Review surface answers: "What does the evidence say? Where do sources conflict?" It is the source-of-truth audit layer for the knowledge graph.

**Conflict source grid:** A 3-column source grid displays conflicting sources. The active/primary source renders at full opacity; secondary/inactive sources render at `opacity: 0.8`. Selection of a source as trusted baseline changes its opacity state and marks it with a `trusted-baseline-badge` (DESIGN.md `components.trusted-baseline-badge`). The grid is keyboard-navigable using roving tabindex; arrow keys move between source panels.

**Needs-confirmation hover-reveal:** Line items requiring user confirmation show an action button with hover-reveal (`opacity: 0` default → `opacity: 1` on group hover, or `:focus-within`). The approve/reject action resolves the conflict without navigating away from the surface. Keyboard users reach the reveal via Tab within the row; the action button becomes focusable when the row is focused.

**Connected-sources list:** Shows all connected data sources. Each row: source icon (domain-specific Material Symbol) + source name + sync status icon (`check_circle` = OK, `sync` = syncing, `error_outline` = failed) + last-sync timestamp. The status icon + `aria-label` communicates sync state — not color alone (e.g., `aria-label="Sync failed — last synced [timestamp]"`).

**Recent-ingests mini-timeline:** A vertical timeline (line + dot pattern, `{colors.light-outline-variant}` rail, `{colors.light-primary-container}` dot) with relative timestamps ("2 min ago") for recently ingested items. Distinct from the main day timeline — this is a compact audit trail, not a schedule.

**Resolution input:** An underline-only focus style (no border box) matching the `capture-quick-add` pattern. Used for entering resolution notes or trusted-baseline annotations. `aria-label="Resolution note"`.

**Conflict resolution accessibility:** When a conflict is resolved, a polite `aria-live` announcement confirms: "Conflict resolved — [source name] marked as trusted baseline."

### People surface (surface #9, v1.0)

The People surface answers: "Who are the important people, what do I owe them, what comes next?"

**Intention card distinction:** The intention card on a person detail view uses a `primary-container` left border (4px, `{colors.light-primary-container}`), NOT `primary`. This distinguishes personal intent ("I want to call weekly") from system-protected hard commitments (which use `primary` left border). Story writers must not conflate these.

**Action vs. observation card pair:** Side-by-side two-card layout. The action card (`surface-container-high` background, hover-elevated) proposes a next action. The observation card (`surface-container` background, neutral) surfaces a recent observation. These are read in combination — the observation provides context for the action.

Visual component anatomy: see `DESIGN.md components.person-detail`.

---

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Morning plan loading | Morning Plan | Skeleton blocks matching expected timeline count. Resolves <3s from cached context (NFR-2 target). |
| Plan approval pending | Today / Morning Plan | Sticky action area visible. No plan blocks are interactive until approval. |
| Plan approved | Today | Sticky action area clears. Timeline becomes the live day view. Expected work end time prominent in header. |
| Empty Capture Inbox | Capture Inbox | "Nothing waiting for a decision." No gamified messaging. |
| Capture Inbox: new item | Capture Inbox | Item appears at top with classification badge and status "Needs a decision." |
| Day one / fresh onboarding | Morning Plan | Empty-state copy: "Connect your calendars to generate your first plan. In the meantime, capture anything on your mind." No empty guilt, no cheerleading. |
| Connector failure | Anywhere (sync health indicator) | In-app disclosure within one sync cycle (AC-15). Plan confidence label downgrades. "Google Calendar hasn't synchronized since [time]. Capture anything new manually." Manual capture offered. |
| Sync health degraded | Plan Intelligence panel | Plan confidence chip changes label to "Based on partial information." Last-synced time surfaces. |
| Commitment at risk | Commitment Ledger / Plan Intelligence | "At risk" badge (shape + label + color) on affected commitment. Proposed renegotiation appears in Plan Intelligence "Needs attention" card. |
| Hard boundary conflict | Interrupt Decision | `hard-conflict-callout` renders. Error label + block icon. Confidence remains factual. |
| Goal not receiving time | Today / Week (v1.0) | Neutral language. "Your [goal] hasn't received scheduled time in N days. [Best opening] is the best remaining opening." Accept or dismiss — no guilt default. |
| End-of-day trigger | Today | When work-end window passes (4:30 PM for Sean), the system surfaces the End-of-Day Review prompt. Not a modal — a surface navigation. |
| Undo available | Any surface after mutation | One-step undo available immediately after any plan mutation (NFR-4). Presented as a transient "Undo" affordance, not a history panel. |
| Work context on personal surface | Any | FORBIDDEN. Work project titles, customer names, and work details never appear on personal surfaces (SEC-1, AC-14). |
| Today cold-start (no plan, no sources) | Today | When no plan exists and no sources are connected, Today shows the same "Connect your calendars to generate your first plan. In the meantime, capture anything on your mind." prompt as Morning Plan — it is not an empty chrome. Not distinct from the Morning Plan day-one state. |
| Commitment Ledger empty | Commitment Ledger | "No commitments tracked yet. Accepted requests and confirmed commitments appear here." No gamified messaging, no onboarding animation. |
| Policy & Boundaries first-run | Policy & Boundaries | Shows starter templates with "Accept" / "Customize" actions for non-negotiables (work hard stop, family time) and work-context boundaries (SEC-1). Consistent with FR-4 MVP templates. |
| Interrupt Decision empty | Interrupt Decision | "No interrupts waiting for a decision. Capture a new request to begin." Nav to Capture Inbox offered. |
| Fulfilled commitment (muted state) | Commitment Ledger | Fulfilled commitments use `{components.state-chip.fulfilled-*}` tokens at FULL opacity. Do NOT apply opacity < 1 to the card container — this fails WCAG AA for meta and secondary text. The muted feel is achieved via the fulfilled chip's desaturated tokens, not by dimming the card. |

---

## Interaction Primitives

**Keyboard-first on desktop.** The primary audience is a technical professional. The keyboard surface is the product; mouse is not penalized but is not the primary interaction model.

[GAP: keyboard key-binding table (Cmd/Ctrl shortcuts) not yet defined — defer to epic creation. Minimum key-binding scope: plan approval, capture focus, undo, surface navigation. Keyboard interaction semantics for decision surfaces (scenario cards, approve flow, evidence drawer, clarification banner) are already specified in Accessibility Floor › Keyboard semantics — decision surfaces below.]

**Approve = explicit affirmative.** No action is confirmed by default, timeout, or inactivity. Every consequential action requires an explicit tap or keyboard action (NFR-4 reversibility contract): if an action is undoable, no confirmation dialog is required; if it is not undoable, it requires explicit approval. At MVP, no action falls in the non-undoable category (AD-8).

**Autosave, never block.** Text fields (capture, plan notes, policy edits) autosave silently. Save state ("Saving..." → "Saved") is visible but never blocks navigation.

**One-step undo everywhere (NFR-4).** Every plan mutation supports one-step undo. The undo affordance appears immediately after the action as a transient element (not a history panel). Undo is always a forward compensating event (AD-4) — it never silently reverts state.

**No drag-to-reorder at MVP.** Timeline reordering at MVP uses modify mode with explicit controls. Drag-and-drop is deferred. [GAP: modify mode exact interaction pattern not yet specified — defer to story-level design.]

**Protected blocks are not draggable.** Hard commitments cannot be moved by drag; they can only be renegotiated via the explicit renegotiation flow (FR-24).

**Banned everywhere:** streak counters, badge counts, push-notification re-engagement, gamification animations, carousels, hover-only affordances on mobile, modal stacks > 1 deep, loading states that block interaction for > 3 seconds.

---

## Accessibility Floor

Visual contrast levels are in `DESIGN.md` (`light-*` and `dark-*` token sets both target WCAG AA). This section covers behavioral requirements only.

- **Keyboard navigation:** All interactive elements reachable by Tab. Focus order follows reading order on every surface. `Esc` closes the topmost popover/drawer. Sticky action area is reachable without scrolling.
- **Screen readers:** Every interactive element has a role + state label. Domain pips announce their protection level: "Standard event" (open) vs. "Hard commitment — School Pickup" (filled). Confidence chips announce the full phrase, not just the number. The evidence drawer announces its expand/collapse state.
- **Status never color-only:** Domain pips use fill state (open vs. filled) + aria-label. Consequence checklist items use icon shape (check_circle vs. cancel) + text label. Capacity chips use icon (warning) + text subline for risk state. Error states use error icon + text, never just a red border.
- **Contrast:** `light-*` and `dark-*` palettes verified WCAG AA (computed from hex tokens, 2026-07-12). `{colors.light-on-surface}` (#1c1c18) on `{colors.light-surface}` (#fcf9f3): **16.26:1** ✓. `{colors.dark-on-surface}` (#e3e5e3) on `{colors.dark-surface}` (#1a1c1b): **13.53:1** ✓. Error states: `{colors.light-error}` (#ba1a1a) on `{colors.light-surface}` = 6.15:1 ✓; `{colors.dark-error}` (#ffb4ab) on `{colors.dark-surface}` = 10.09:1 ✓. Warning icon/text: `{colors.light-on-warning-container}` (#92400e) on `{colors.light-warning-container}` (#fef3c7) = **6.37:1** ✓ (replaces the hardcoded #d97706 icon that failed at 2.86:1). Three marginal light-token pairs must be restricted to large text (≥24px) over glass panels where effective contrast may degrade: `light-on-primary-container` (4.57:1), `light-on-secondary-container` (4.53:1), `light-on-tertiary-container` (4.57:1). All three pass AA at standard sizes but are marginal.
- **Reduce Motion:** Evidence drawer and plan block hover lift animations respect `prefers-reduced-motion`. No animation may be the sole signal of any state change.
- **Touch targets:** ≥ 44px × 44px on all mobile interactive elements. Capacity chips, timeline blocks, and scenario cards all meet this floor without adjustment.
- **Semantic HTML:** Architecture spine specifies `eslint-plugin-jsx-a11y` in the lint gate (AD-9 conventions). No `div` click handlers on primary affordances; native `button` and `a` throughout.
- **Focus-visible system:** All interactive elements use `outline: 2px solid; outline-offset: 2px` with `{colors.light-primary}` (light) or `{colors.dark-primary}` (dark). Applied via `:focus-visible` selector only. Never removed or clipped. See `DESIGN.md components.focus-ring` for full token spec. Verified contrast: `light-primary` (#17282a) on `light-surface` (#fcf9f3) = 16.26:1; on `dark-surface` sidebar backgrounds: `dark-primary` (#b7cacc) = 8.67:1. Both exceed WCAG 2.4.13 minimum (3:1). On pill-radius elements, `outline-offset: 2px` prevents ring clipping by border-radius.
- **Live regions and announcements:** The following dynamic moments require `aria-live` announcements to SR users:
  - Plan-diff rerenders during Modify mode: polite region announces "Plan updated — [N] items affected" when the plan-diff settles (debounced ~500ms after last change).
  - Sync-health degradation: polite region announces "Plan confidence reduced — Google Calendar hasn't synchronized since [time]." Triggered when confidence chip label changes.
  - Autosave state: polite region announces "Saving…" → "Saved" transitions.
  - Undo affordance (NFR-4): assertive region announces "Undo available" when the transient undo element appears. The undo affordance must remain visible for a minimum of 8 seconds OR until the next user action — whichever is later. This satisfies WCAG 2.2.1 (Timing Adjustable). If the element is focusable (recommended), focus persistence serves as the alternative to auto-dismiss timing.
- **Landmark map (applies to all surfaces):** `<nav>` for the sidebar/bottom strip. `<main>` for the primary content area (timeline, cards, decision grid). `<aside>` (with `aria-label="Plan Intelligence"`) for the Plan Intelligence panel. `<header>` for the surface header bar. Commitment Ledger sidebar is `<nav>` (site navigation), not `<aside>`. Any time-based progress or status area uses `role="status"` with a polite live region.
- **Keyboard semantics — decision surfaces:**
  - **Scenario cards (Interrupt Decision):** Card grid uses a roving-tabindex / radiogroup model. One card is in the Tab sequence at a time; left/right arrow keys move between cards. Enter or Space activates the focused card's "Select Option" button. After selection, focus moves to the applied plan-diff summary region (announced by the plan-diff live region).
  - **Approve flow:** The "Approve today's plan" button must be the natural next Tab stop after the timeline content (or Plan Intelligence panel if it receives focus). After approval, focus moves to the Today surface heading.
  - **Clarification banner (Capture Inbox):** Enter activates the primary clarification action. Esc dismisses the banner without data loss and returns focus to the captured item.
  - **Evidence drawer:** Chevron trigger is a `<button>` with `aria-expanded` state. Enter/Space toggle collapse/expand. Esc collapses the drawer and returns focus to the trigger.
- **Minimum type size floor:** 12px (`{typography.label-caps}`) is the hard minimum for all rendered text. Sub-12px sizes (9px, 10px, 11px) observed in imported mocks are mock artifacts and MUST NOT be implemented in production components. Nav labels, stat labels, badges, timestamps, and confidence text all use `label-caps` (12px) or larger.
- **Zoom and reflow (WCAG 1.4.4, 1.4.10, 1.4.12):** All surfaces must remain functional at 200% browser zoom without horizontal scrolling. At 320px viewport width, single-column reflow is required (no two-column layout). Line length for `body-md` and `body-lg` content is capped at ~70ch to prevent measure overrun on wide viewports. Text spacing must not cause content loss when line-height is increased to 1.5x, letter-spacing to 0.12em, word-spacing to 0.16em, or spacing after paragraphs to 2em (WCAG 1.4.12 user overrides).
- **Forced colors / Windows High Contrast Mode (WCAG 1.4.3 + NFR-7):** The primary pip distinction (open vs. filled) and state-chip colors rely on CSS token fills that forced-colors mode may override. Mitigation: (a) filled pips must retain a border distinguishable from the unfilled state (e.g., `border: 2px solid ButtonText` under forced-colors); (b) state chips must carry icon + text labels — not background alone — so the semantic is preserved when colors are replaced by system colors. [GAP: full forced-colors QA pass deferred to v0.1 implementation. This note satisfies the NFR-7 explicit mention requirement — silence on forced-colors against an NFR commitment is not acceptable. Implement with `@media (forced-colors: active)` overrides that restore pip border distinction and remove background-only state indicators.]

---

## Key Flows

Protagonist: **Sean**, technical leader, married, kids in school, **hard stop at 4:30 PM**. Note: the Stitch mock states "5:20 PM" as Sean's work end — this is incorrect. The PRD (§8) and memlog establish 4:30 PM as the hard stop. All flows use 4:30 PM.

> **Flow scope:** MVP journeys only (UJ-1, UJ-2, UJ-3). v1.0 journeys (UJ-4: Goal Activation, UJ-5: Important Date Prep, UJ-6: Evidence-Assisted Decision) are specified at story level when their surfaces ship. All three are tagged v1.0 in the IA table above.

### UJ-1 — Morning planning loop (MVP)

**Context:** 7:40 AM. Sean opens Life Focus Intelligence instead of triaging four apps. The system has already read both calendars and both inboxes overnight.

1. App opens. Plan status is "pending approval." Morning Plan surface is active (or a prominent "Approve your plan" prompt on Today).
2. The header shows: "Good morning, Sean." In `{typography.display-lg}`. Below it: "Your recommended day ends at **4:10 PM**. School pickup at 4:30 PM is protected."
3. Five capacity chips render: Work / Personal / Flexibility / Confidence / Unscheduled.
4. The 67/33 layout: timeline left, Plan Intelligence right.
5. Sean scans the timeline. He sees the "Complete architecture decision" block is marked as protected priority (filled pip + lock badge + "Why: Blocks 3 engineers").
6. He reads the Plan Intelligence panel: "What this plan protects" (family evening boundary, deep work momentum), "Intentionally not scheduled" (inbox zero block deferred to tomorrow — "Thursday morning is the best remaining opening").
7. He notices the "2:30 PM — Quarterly planning" block. He wants to move the deep-work block earlier.
8. He taps "Modify Plan." The timeline enters adjust mode.
9. He adjusts one block. The plan-diff rerenders; confidence updates.
10. He taps "Approve today's plan."
11. **Climax:** The sticky action area clears. Today becomes the live surface. Sean sees the approved timeline, his expected work end (4:10 PM), and the school pickup block immovably anchored at 4:05 PM departure. He starts the day oriented in under 7 minutes without having checked four apps.

*Failure path:* A connector is unavailable. Plan Intelligence "Needs attention" card reads: "Google Calendar hasn't synchronized since 9:20 AM — some meetings may be missing. Confidence reduced." Sean can still approve; the plan's confidence chip shows "Based on partial information." Manual capture is offered.

### UJ-2 — Interrupt with visible tradeoffs (MVP)

**Context:** 1:50 PM. Sean is mid-plan. A Slack message (captured manually at MVP) asks him to review a customer escalation "today."

1. Sean taps the capture quick-add.
2. He types: "Review Acme escalation — today, ~90 min" and submits (2 interactions).
3. Item lands in Capture Inbox. The system proposes a classification: "Work request — review + written assessment, ~90 min. Needs a decision."
4. Sean taps the item. The Interrupt Decision surface opens.
5. The header: an `error-container` badge "Schedule Conflict Detected." `display-lg` heading: "Incoming Interrupt." Body: "A request has been made that conflicts with your established commitments."
6. The bento grid renders: "The Request" card (Acme escalation, Maya, urgent client escalation) + "Hard Conflict" card (School pickup — leave at 4:05 PM).
7. The hard-conflict callout reads: "Based on current information, accepting this request now would push work end to 5:50 PM, past your 4:30 PM hard stop and into family time."
8. Four decision scenario cards render with the P11 consequence checklist:
   - **Option 1: Do Now (join immediately)**: Work end shifts to 5:50 PM (cancel icon — past hard stop); school pickup missed (cancel icon). [Not recommended]
   - **Option 2: Join at 4:30**: Missing school pickup (cancel icon), Anna must change plans (cancel icon), work day extends to 6:00 PM (schedule icon).
   - **Option 3: Join at 5:15 PM** [RECOMMENDED — 2px primary ring, RECOMMENDED badge]: Preserves school pickup (check icon), dinner delayed 20m (info icon). Plan-diff: architecture doc to Marcus rescheduled tomorrow 9 AM (info icon).
   - **Option 4: Ask for context**: Drafts clarification message to Maya (ask icon).
   - **Option 5: Decline**: Declines with acknowledgment (cancel icon for this request).
9. Sean taps "Select Option" on Option 3 (join at 5:15 PM after pickup).
10. The system drafts an acknowledgment to Maya: "I can join at 5:15 PM after a prior commitment — does that work?" The draft lands in his work Gmail drafts folder, ready to send.
11. **Climax:** The plan-diff applies Option 3's consequences: architecture doc commitment to Marcus is rescheduled to tomorrow 9 AM (still feasible — Marcus is informed); work end shifts to 5:30 PM but school pickup at 4:05 PM departure is protected. Sean sees the tradeoffs before they happen, makes the call with full information, and sends the acknowledgment to Maya with one click. No one is silently dropped.

*Failure path:* Classification is wrong. Sean corrects it in Capture Inbox — an AD-4 compensating event; the interrupt classification loop reruns.

### UJ-3 — Deliberate stop (MVP)

**Context:** 3:55 PM. Sean is approaching his 4:30 hard stop.

1. At 3:55 PM (or when the last scheduled work block ends), the system surfaces the End-of-Day Review prompt on Today: "Work ends at 4:30 PM. Ready to review today?"
2. Sean taps. End-of-Day Review surface opens.
3. **Completed:** Four outcome blocks are listed as completed, with green check marks (shape + color).
4. **Displaced:** One commitment is listed as displaced — "Inbox reply to Priya" — with the note "Renegotiated: reply sent Thursday."
5. **Unanswered:** Two requests listed. Both have drafted acknowledgments ready: "Tap to review and send."
6. **Tomorrow's shape:** A preliminary view of tomorrow is shown (not yet a full plan — just the hard commitments and carried-over items).
7. Sean reviews and taps "Send drafts" for both acknowledgments. They land in Gmail drafts.
8. He taps "Mark work as done."
9. **Climax:** The system records the explicit "work ended" tap (SM-3 instrument). Unresolved items roll forward without loss. Tomorrow already has a credible starting shape. The background hum of open loops is gone. Sean closes the laptop at 4:15 PM.

*Failure path:* Sean doesn't tap the review. The system does not send anything, does not close loops automatically. Items remain in Capture Inbox. The next morning plan surfaces them as "carried over from yesterday."

---

## Responsive and Platform

| Breakpoint | Behavior |
|---|---|
| `≥ lg` (1024px+) | Full desktop layout. Side nav rail (80px) always visible. 8+4 two-column layout on Morning Plan, Interrupt Decision, and Today. All 7 MVP surfaces accessible. |
| `md` (768–1023px) | Side nav collapses to icons only (no labels). Timeline goes full-width. Plan Intelligence panel stacks below timeline. |
| `< md` (mobile / phone) | Side nav becomes 4-tab bottom strip. Morning Plan and Interrupt Decision stack single-column. Capture quick-add accessible from all surfaces. |

**PWA manifest (NFR-9, AC-6):** Ships from MVP. Enables "Add to home screen" on phone. Push-notification transport is deferred to v0.2+ (not MVP). Service worker handles offline gracefully: cached morning plan remains viewable; capture writes to local queue and syncs on reconnect.

**Phone surface at MVP = capture + review only.** Full planning surfaces (timeline manipulation, Plan Intelligence modification) are desktop-first. On phone, the Morning Plan surface is read-only with approve/modify capability, but the modify experience is simplified (no drag; list-based controls). Full edit experience requires desktop.

**No native mobile app before Phase 2** (NFR-9). The responsive web/PWA is the sole mobile delivery mechanism through v1.0.

---

## Theme Switching

Three theme modes: **System** (default), **Light**, **Dark**.

**System default behavior:** On first visit, `prefers-color-scheme` media query determines the initial theme. No theme selector appears until the user visits Settings. System mode does not require a setting to be saved.

**Manual override:** In Settings (Policy & Boundaries surface or a dedicated Preferences section [GAP: exact Settings IA not yet defined]), the user selects Light, Dark, or System. The selection is saved to `localStorage` immediately and applied to `<html class>` without page reload.

**No-flash on load:** The `<html class>` attribute is set by a non-blocking inline script in `<head>` before any React hydration, reading `localStorage` first, falling back to `prefers-color-scheme`. This prevents the default-light flash on dark-mode users. [GAP: exact implementation pattern to confirm during Next.js 16 development — this is the expected pattern but Next.js 16 RSC specifics may require a different approach.]

**Persistence:** `localStorage` key `lfi-theme` stores one of `system` | `light` | `dark`. On system-sync mode, the app also listens to the `change` event on `prefers-color-scheme` and updates the theme class reactively without reload.

**Token behavior across modes:** Every component in `DESIGN.md` specifies both `*-light` and `*-dark` token variants. The CSS variable layer maps `--color-surface` to `{colors.light-surface}` when `<html class="light">` and to `{colors.dark-surface}` when `<html class="dark">`. No hardcoded hex values in component CSS.

**System indicator:** When System mode is active, the Settings UI shows the current resolved theme: "System (currently Dark)" or "System (currently Light)." This helps Sean understand what he's seeing without requiring a manual selection.

---

## GAP Register

- [GAP: keyboard key-binding table (Cmd/Ctrl shortcuts) not yet defined — defer to epic creation. Minimum key-binding scope: plan approval, capture focus, undo, surface navigation. Keyboard interaction semantics for decision surfaces are specified in Accessibility Floor › Keyboard semantics — decision surfaces.]
- [GAP: modify mode exact interaction pattern for timeline blocks not yet specified — defer to story-level design. Confirmed: no drag-to-reorder at MVP.]
- [GAP: exact Settings / Preferences IA not yet defined — defer to epic creation. Theme selector lives somewhere in Settings area.]
- [GAP: no-flash theme implementation pattern to confirm against Next.js 16 RSC specifics during development — the localStorage + inline-script pattern is standard but RSC hydration may introduce constraints.]
- [GAP: mobile "Add to home screen" prompt timing and UX — not specified in PRD or memlog; defer to v0.1 implementation decision.]
- RESOLVED (PRD FR-35): at MVP the Interrupt Decision surface renders only the do now / schedule / acknowledge / clarify / decline scenario cards — the Delegate card is omitted entirely (no locked placeholder) and returns with the v1.0 delegation model. The Stitch mock showing Delegate depicts the v1.0 state; spines win.
- RESOLVED (Sean, 2026-07-12): mobile bottom nav at MVP = Today / Interrupts / Inbox / Commitments. Goals, People, and Sources tabs arrive with v1.0.

---

## Glossary

Key terms from PRD §14, reproduced here for single-document usability.

| Term | Definition |
|---|---|
| **Hard commitment** | A commitment that cannot be moved without explicit renegotiation — school pickup, a deadline promised to another person. Represented by filled domain pip + `primary` left border + lock badge. |
| **Protected priority** | A Sean-defined priority block given "do not move" status (FR-24). Implemented identically to hard commitments in the timeline, distinguished only by `why-inset` rationale language. |
| **Plan-diff** | The delta between the current plan and a proposed modification — which blocks move, who is affected, what boundary is at risk. Rendered in real time during Modify mode and in the P11 consequence checklist on scenario cards. |
| **P11 consequence checklist** | The six-item consequence check required for every interrupt decision (FR-30, P11): (1) what is displaced, (2) who is affected, (3) which goal loses time, (4) whether a boundary is violated, (5) whether finish time changes, (6) whether another person must agree. |
| **Renegotiation** | The explicit flow for moving a hard commitment — requires a drafted communication to the affected party (FR-24). Never silent; never auto-resolved. |
| **Autonomy ladder** | The five levels of system autonomy: L1 (inform) → L2 (recommend) → L3 (draft) → L4 (act with review) → L5 (act autonomously). MVP is L2+L3. |
| **Suppressed feedback** | The design philosophy of the color/feedback system: error/warning colors are suppressed until a decision-critical moment. No red for urgency; no amber for general emphasis. |
| **SEV tier** | Severity tier for interrupt/alert classification. SEV-1 = critical (error tokens); SEV-2 = warning (warning tokens); lower SEVs use neutral styles. |
| **AC-14 / SEC-1** | Privacy scope controls: work project titles and customer names never appear on personal surfaces. |
| **SM-2 / SM-3** | Success metric instruments: SM-2 = plan approval timestamp, SM-3 = "work ended" explicit tap timestamp. Both record explicit user affirmatives, not inferred state. |
