---
name: Life Focus Intelligence
status: draft
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

**Mock references** (spines win on conflict with any mock): Stitch imports cover Today ([imports/live_day_focus/](imports/live_day_focus/screen.png)), Morning Plan ([imports/morning_whole_life_plan/](imports/morning_whole_life_plan/screen.png), [imports/morning_plan_documentation_layer/](imports/morning_plan_documentation_layer/screen.png)), Interrupt Decision ([imports/interrupt_decision_tradeoffs/](imports/interrupt_decision_tradeoffs/screen.png), [imports/interrupt_decision_evidence_runbooks/](imports/interrupt_decision_evidence_runbooks/screen.png)), People detail ([imports/person_detail_anna_fixed/](imports/person_detail_anna_fixed/screen.png)), Context Review ([imports/context_review_source_conflicts/](imports/context_review_source_conflicts/screen.png)), plus a status alert and a commitment detail. Key-screen mocks in the adopted identity: [mockups/end_of_day_review.html](mockups/end_of_day_review.html), [mockups/capture_inbox.html](mockups/capture_inbox.html), [mockups/commitment_ledger.html](mockups/commitment_ledger.html). Week, Goals, Policy & Boundaries, Learning Review, and Focus Context are spine-only — built from `DESIGN.md` tokens and the tables in this document.

**Visual hierarchy rule (FR-68):** Every primary view follows this order, top-to-bottom:
1. Current decision or action (what Sean needs to do right now)
2. Recommendation (what the system proposes)
3. Reason (why — the "Why this matters" / "What this protects" language)
4. Person / goal / commitment protected
5. Consequence (what will move, who is affected)
6. Confidence and evidence (framed as "Based on current information")
7. Full source detail (available via evidence drawer — collapsed by default)

Progressive disclosure is mandatory: the default view shows only what is needed to decide. Evidence, sources, and full reasoning are accessible but not default-visible.

**Primary navigation shape:** Left sidebar rail on desktop (80px wide, icon + `{typography.label-caps}` label, active indicator is a 2px right border in `{colors.light-primary}`). On mobile, a 4-tab bottom strip: Today / Interrupts / Goals / Sources (visible in interrupt_decision_tradeoffs mock; exact MVP tab set is Today / Interrupts / Inbox / Commitments). The sidebar items visible in the morning_whole_life_plan mock — Today, Week, Interrupts, People, Settings — reflect the v1.0 nav; MVP ships the subset marked above.

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

---

## Interaction Primitives

**Keyboard-first on desktop.** The primary audience is a technical professional. The keyboard surface is the product; mouse is not penalized but is not the primary interaction model.

[GAP: keyboard shortcut table not yet defined — defer to epic creation. Minimum expected: plan approval, capture focus, undo, and surface navigation shortcuts.]

**Approve = explicit affirmative.** No action is confirmed by default, timeout, or inactivity. Every consequential action requires an explicit tap or keyboard action. This is the NFR-4 reversibility contract: if Sean can undo it, it never needed a "are you sure" dialog; if he can't, it must require explicit approval (and currently nothing at MVP is in that category — AD-8).

**Autosave, never block.** Text fields (capture, plan notes, policy edits) autosave silently. The save state is visible ("Saving..." → "Saved") but never blocks forward navigation.

**One-step undo everywhere (NFR-4).** Every plan mutation supports one-step undo. The undo affordance appears immediately after the action as a transient element (not a history panel). Undo is always a forward compensating event (AD-4) — it never silently reverts state.

**No drag-to-reorder at MVP.** Timeline reordering at MVP uses modify mode with explicit controls. Drag-and-drop is deferred. [GAP: modify mode exact interaction pattern not yet specified — defer to story-level design.]

**Protected blocks are not draggable.** Hard commitments cannot be moved by drag; they can only be renegotiated via the explicit renegotiation flow (FR-24).

**Banned everywhere:** streak counters, badge counts, push-notification re-engagement, gamification animations, carousels, hover-only affordances on mobile, modal stacks > 1 deep, loading states that block interaction for > 3 seconds.

---

## Accessibility Floor

Behavioral. Visual contrast levels live in `DESIGN.md` (both `light-*` and `dark-*` token sets target WCAG AA).

- **Keyboard navigation:** All interactive elements reachable by Tab. Focus order follows reading order on every surface. `Esc` closes the topmost popover/drawer. Sticky action area is reachable without scrolling.
- **Screen readers:** Every interactive element has a role + state label. Domain pips announce their protection level: "Standard event" (open) vs. "Hard commitment — School Pickup" (filled). Confidence chips announce the full phrase, not just the number. The evidence drawer announces its expand/collapse state.
- **Status never color-only:** Domain pips use fill state (open vs. filled) + aria-label. Consequence checklist items use icon shape (check_circle vs. cancel) + text label. Capacity chips use icon (warning) + text subline for risk state. Error states use error icon + text, never just a red border.
- **Contrast:** Both `light-*` and `dark-*` palettes verified at WCAG AA. `{colors.light-on-surface}` (#1c1c18) on `{colors.light-surface}` (#fcf9f3): ≥ 4.5:1. `{colors.dark-on-surface}` (#e3e5e3) on `{colors.dark-surface}` (#1a1c1b): ≥ 4.5:1. Error states in both modes: ≥ 3:1 (large text) per WCAG AA.
- **Reduce Motion:** Evidence drawer and plan block hover lift animations respect `prefers-reduced-motion`. No animation is the only signal of any state change.
- **Touch targets:** ≥ 44px × 44px on all mobile interactive elements. Capacity chips, timeline blocks, and scenario cards all meet this floor without adjustment.
- **Semantic HTML:** Architecture spine specifies `eslint-plugin-jsx-a11y` in the lint gate (AD-9 conventions). No `div` click handlers on primary affordances; native `button` and `a` throughout.

---

## Key Flows

Protagonist: **Sean**, technical leader, married, kids in school, **hard stop at 4:30 PM**. Note: the Stitch mock copy stating "5:20 PM" as Sean's work end is incorrect; the PRD (§8) and memlog both establish 4:30 PM as the hard stop. All flows use 4:30 PM.

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
   - **Option 1: Delegate** [RECOMMENDED — 2px primary ring, RECOMMENDED badge]: "Ask Priya to lead initially." Preserved: school pickup, family dinner. [Note: at MVP, delegate option exists in this display as a scenario but the delegation workflow is v1.0 — the card's "Select Option" triggers an acknowledge flow with drafted reply at MVP]
   - **Option 2: Join at 4:30**: Missing school pickup (cancel icon), Anna must change plans (cancel icon), work day extends to 6:00 PM (schedule icon).
   - **Option 3: Join at 5:15 PM**: Preserves school pickup (check icon), dinner delayed 20m (info icon).
   - **Option 4: Ask for context**: Drafts clarification message.
9. Sean taps "Select Option" on Option 3 (join at 5:15 PM after pickup).
10. The system drafts an acknowledgment to Maya: "I can join at 5:15 PM after a prior commitment — does that work?" The draft lands in his work Gmail drafts folder, ready to send.
11. **Climax:** The plan-diff applies: architecture doc commitment to Marcus preserved (rescheduled to tomorrow 9 AM — still feasible); work end shifts to 5:30 PM but pickup is protected. Marcus's commitment is not silently dropped. Sean sees the consequences before they happen, makes the call, and sends the reply with one click.

*Failure path:* Classification is wrong. Sean corrects it in Capture Inbox. Correction is an AD-4 event; the interrupt loop reruns.

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

## Coverage Self-Check

### FR-67 surface coverage
All 13 surfaces appear in the IA table above: Today (1), Morning Plan (2), Interrupt Decision (3), Capture Inbox (4), Commitment Ledger (5), Policy & Boundaries (6), End-of-Day Review (7), Week (8), People (9), Goals (10), Focus Context (11), Context Review (12), Learning Review (13). ✓

### PRD journey → surface mapping
- UJ-1 Morning planning → Morning Plan + Today ✓
- UJ-2 Interrupt tradeoff → Capture Inbox + Interrupt Decision ✓
- UJ-3 Deliberate stop → Today + End-of-Day Review ✓
- UJ-4 Goal activation (v1.0) → Goals surface (v1.0 tag) ✓
- UJ-5 Important date prep (v1.0) → People surface (v1.0 tag) ✓
- UJ-6 Evidence-assisted decision (v1.0) → Context Review + Interrupt Decision (v1.0 tag) ✓

### Theme token coverage
Light-mode tokens: complete — 40 light-* color tokens in DESIGN.md frontmatter ✓
Dark-mode tokens: complete — 40 dark-* color tokens in DESIGN.md frontmatter ✓
All DESIGN.md components specify both light and dark variants ✓

---

## GAP Register

- [GAP: keyboard shortcut table not yet defined — defer to epic creation. Minimum expected: plan approval, capture focus, undo, surface navigation.]
- [GAP: modify mode exact interaction pattern for timeline blocks not yet specified — defer to story-level design. Confirmed: no drag-to-reorder at MVP.]
- [GAP: exact Settings / Preferences IA not yet defined — defer to epic creation. Theme selector lives somewhere in Settings area.]
- [GAP: no-flash theme implementation pattern to confirm against Next.js 16 RSC specifics during development — the localStorage + inline-script pattern is standard but RSC hydration may introduce constraints.]
- [GAP: mobile "Add to home screen" prompt timing and UX — not specified in PRD or memlog; defer to v0.1 implementation decision.]
- RESOLVED (PRD FR-35): at MVP the Interrupt Decision surface renders only the do now / schedule / acknowledge / clarify / decline scenario cards — the Delegate card is omitted entirely (no locked placeholder) and returns with the v1.0 delegation model. The Stitch mock showing Delegate depicts the v1.0 state; spines win.
- RESOLVED (Sean, 2026-07-12): mobile bottom nav at MVP = Today / Interrupts / Inbox / Commitments. Goals, People, and Sources tabs arrive with v1.0.
