# Epic 2 Context: The Life Model

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Epic 2 lets Sean define what matters — life domains, workday shape and 4:30 hard stop, sleep window, protection levels, starter policies, up to 3 goals (each with one next action plus a protected weekly time allocation), and core people with important dates and one communication rhythm each — in a single sitting of ≤45 minutes that must not feel like taxes. It is the second build-order epic (after the Steel Thread Foundation), and it produces the durable life model that every planning surface downstream reads from: the planner cannot honor a boundary, protect a priority, or claim honest capacity until these entities exist. The epic explicitly opens with the onboarding-flow design itself, treats day-one empty states as first-class acceptance criteria, and ends by proving the ≤45-minute sitting end-to-end (AC-2) rather than assuming it. It also delivers the persistent Policy & Boundaries surface so the rules governing the plan stay inspectable and editable after setup.

## Stories

- Story 2.1: Guided Onboarding Flow
- Story 2.2: Boundaries, Domains, and Starter Policies
- Story 2.3: Hard Commitments and Protection Levels
- Story 2.4: Important People and Communication Rhythms
- Story 2.5: Goals with a Next Action and Protected Allocation
- Story 2.6: The Forty-Five-Minute Proof
- Story 2.7: The Policy & Boundaries Surface

## Requirements & Constraints

- **The 45-minute sitting is the headline success criterion (AC-2).** Full life-model setup — workday shape, hard stop, sleep window, hard commitments, protected priorities, up to 3 goals, core people with important dates, starter policies — must complete in a single sitting of ≤45 minutes. Story 2.6 must prove this with an instrumented timestamp pair and an automated end-to-end replay, with the completed model requiring at minimum: boundaries, domains, policies, ≥3 hard commitments, ≥1 protected priority, ≤3 goals with actions+allocations, and ≥5 people with dates and rhythms.
- **Limited, resumable setup (FR-7).** Onboarding begins with limited setup and adds context gradually. The flow must show progress, make every step skippable-with-defaults, and be resumable mid-way — abandoning loses nothing because each completed step is already persisted. Re-entering setup later edits rather than duplicates.
- **Every plannable item carries a protection level (FR-3).** The four levels are: hard commitment; protected priority (moves only via explicit tradeoff); flexible intention (occurs within a window); optional opportunity. Protection level is required — no untagged plannable item may exist. Each level's meaning is shown at selection in plain preferred language (e.g., "should not move except for a genuine emergency").
- **Distinct models per item type (FR-2).** Goals, relationship intentions, responsibilities, boundaries, rhythms, and important dates are modeled distinctly.
- **Life domains (FR-1).** 11 default domains, each renamable/disable-able/addable; domains inform without becoming silos.
- **Starter policies only at MVP (FR-4-starter).** Ship the non-negotiable and work-boundary starter templates with plain-language explanations, editable before accepting; declining a template is recorded, not nagged. The full 7-category policy catalog and conflict handling are deferred to Epic 12.
- **Person model is the MVP-lite subset (FR-8-lite).** Capture only name, relationship type, user-defined importance, relationship intention, important dates, and context. "Meaningful interactions" and "life events" are user-asserted-only fields, enforced at the schema level. The full Person field set is deferred to Epic 10.
- **One communication rhythm per person (FR-10-lite).** A rhythm ("call Mom weekly") is created as a flexible intention linked to the Person, schedulable within its window. All other relationship-generated action categories are deferred to Epic 10.
- **Ethical relationship reasoning is binding (FR-12 / P5).** Reason only about Sean's own behavior and stated intentions; never claim knowledge of another person's internal state; no relationship scoring exists anywhere in the system. This is enforced, not merely stated.
- **Honest capacity (P3).** The system never equates calendar availability with real capacity — relevant here because declared boundaries, reserves, and protected allocations are what make capacity honest downstream.
- **Goals claim capacity manually (FR-38-lite).** Each of up to 3 active goals gets one user-defined next meaningful action plus a protected weekly time allocation (e.g., 3×45min), stored as protected-priority intentions linked to the goal. No autonomous decomposition at MVP (deferred to Epic 10).
- **Displacement visibility, no guilt (FR-40-displacement).** A per-allocation displacement counter increments whenever a planned allocation is moved or dropped, displayed on the goal in neutral language. No guilt mechanics, no remediation ("best remaining opening") — that is Epic 10.
- **Policy & Boundaries surface (FR-67).** A dedicated, post-onboarding surface (Settings area) where all boundaries, policies-by-category, protection defaults, and theme preference are viewable and editable; edits take effect on the next plan without restart. It states the current autonomy posture in plain language ("The system recommends and drafts; nothing is sent or changed without you").

## Technical Decisions

- **Append-only event ledger (AD-4).** Every life-model entity — boundary, policy, domain, protection level, commitment, person, rhythm, goal, allocation — is persisted as a command that appends an event row; current state is served from a `ledger` projection. No UPDATE/DELETE on event tables. Edits and undo are compensating forward events. All command/event payload schemas live only in `packages/ledger`. Every entity created in this epic must be queryable from ledger projections (a Story 2.6 acceptance criterion), and re-entering setup edits via new events rather than duplicating.
- **Non-null context tag on every entity (AD-5).** Every domain entity carries a work/personal/joint context tag; entities in this epic take a context at creation. Joint is reserved for planning artifacts and user-initiated merges.
- **Single app user (AD-6).** One app user; person merge is user-initiated only (person-merge operations at scale are Epic 10). Source identity is immutable once assigned.
- **Ethical constraints enforced at the schema level.** P5/FR-12 is not just policy: user-asserted-only fields and the total absence of relationship scoring must be structural properties of the data model.
- **Persistence-per-step, not persist-on-finish.** Because the flow is resumable and abandonment must lose nothing, each completed onboarding step must emit its events immediately rather than batching at the end.
- **No third-party UI library.** All surfaces are custom-built on DESIGN.md tokens (deliberate brand-discipline choice); do not reach for shadcn/MUI.

## UX & Interaction Patterns

- **Calm, editorial voice register (UX-DR6).** All copy follows the preferred/forbidden microcopy rules. Never "Execute," never scores, never guilt language. Empty states use the calm register ("Nothing waiting for a decision."). Each onboarding step names why it matters using the "What this protects" framing.
- **First-run / empty states are explicit ACs (UX-DR8).** Day-one cold-start and empty states must be designed and built, not left implicit — this is a defining requirement of the epic, not an afterthought.
- **Progress, skippability, resumability** are visible interaction affordances in the multi-step flow, styled per DESIGN.md.
- **Protection-level iconography is shape + icon + label, never color-only (DESIGN.md, NFR-7).** Use lock/shield/tune iconography for the four levels; status is never conveyed by color alone. Protected items also receive a left-border + lock-badge treatment downstream.
- **Accessibility floor (NFR-7 / UX-DR7).** Full keyboard operability, landmark roles, focus-visible rings, screen-reader support, AA contrast in both themes, and non-color status indicators apply to every surface in this epic.
- **Autonomy posture stated plainly** on the Policy & Boundaries surface ("The system recommends and drafts; nothing is sent or changed without you").

## Cross-Story Dependencies

- **Epic 2 depends on Epic 1** (Steel Thread Foundation): the themed/accessible app shell, Better Auth, the append-only event ledger with context tags and undo (Story 1.3), and connected Google Calendars (Story 1.4). Story 2.6's proof runs against a fresh account *with connected calendars*.
- **Within the epic:** Stories 2.2–2.5 populate the life model that Story 2.1's flow orchestrates; Story 2.6 verifies the full sequence end-to-end and therefore depends on 2.1–2.5 being complete; Story 2.7 (Policy & Boundaries surface) reads and edits the entities the earlier stories create.
- **Epic 2 is a prerequisite for downstream planning epics.** Epic 3 (Capture & Ledger) needs Epics 1+2; Epic 4 (Morning Plan) needs Epics 1+2+3 — the planner's ContextSnapshot (Story 4.2) reads boundaries, protection levels, goal allocations, and rhythms defined here.
- **Deliberate deferrals (do not build here):** full policy catalog + conflict handling and interpreted acceptance → Epic 12; full Person model, relationship-generated actions, goal decomposition, important-date workflows, displacement remediation, person-merge ops → Epic 10.
