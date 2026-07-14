# Epic 2 Context: The Life Model

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Epic 2 is where Sean tells the system what actually matters to him — his workday shape, 4:30 hard stop, sleep window, life domains, standing hard commitments and protected priorities, starter operating policies, up to three active goals (each with one next action and a protected weekly time allocation), and his core people (with important dates, relationship intentions, and one communication rhythm apiece). The entire life model is captured in a single guided sitting of ≤45 minutes that must feel like a conversation, not tax filing. This model is the foundation every later epic reasons over: it gives the planner its non-negotiables before it ever proposes a day, and it establishes the durable Policy & Boundaries surface the user returns to. The epic builds on Epic 1 (event ledger, context tags, calendars) and is a hard prerequisite for Epic 3 (capture) and Epic 4 (the morning plan).

## Stories

- Story 2.1: Guided Onboarding Flow
- Story 2.2: Boundaries, Domains, and Starter Policies
- Story 2.3: Hard Commitments and Protection Levels
- Story 2.4: Important People and Communication Rhythms
- Story 2.5: Goals with a Next Action and Protected Allocation
- Story 2.6: The Forty-Five-Minute Proof
- Story 2.7: The Policy & Boundaries Surface

## Requirements & Constraints

- The full life-model setup must complete in a single sitting of ≤45 minutes, verified by an instrumented start/finish timestamp pair — not assumed. The success bar (AC-2) covers workday shape, hard stop, sleep window, hard commitments, protected priorities, up to 3 goals, core people with important dates, and starter policies.
- The onboarding flow must be multi-step, resumable mid-way, and every step skippable with sensible defaults. Abandoning mid-flow loses nothing because every completed step is already persisted. Each step must explain why it matters ("What this protects").
- Protection level is mandatory on every plannable item — no untagged plannable item may exist. The four levels are: hard commitment / protected priority / flexible intention / optional opportunity. Each level's plain-language meaning must be shown at the moment of selection.
- Domains: 11 defaults, each renamable, disable-able, or extendable. Domains inform planning but must not become silos.
- Starter policies at MVP are the non-negotiable and work-boundary templates only, offered with plain-language explanations and editable before accepting. Declining a template is recorded once, never nagged.
- Person model is the MVP-lite subset: name, relationship type, importance, intention, important dates, context. "Meaningful interactions" and "life events" are user-asserted only. No relationship scoring may exist anywhere in the system — enforced at the schema level, not merely by convention.
- Each core person gets one communication rhythm modeled as a flexible intention linked to the Person, schedulable within its window.
- Goals: up to 3 active, each with exactly one manually-defined next action plus a protected weekly time allocation (e.g., 3×45min) stored as protected-priority intentions linked to the goal. A per-allocation displacement counter increments whenever a planned allocation is moved or dropped and is displayed in neutral language — no guilt mechanics, no remediation logic (that is v1.0).
- Day-one cold-start and empty states are explicit acceptance criteria, not afterthoughts.
- The Policy & Boundaries surface (one of the 7 MVP surfaces) must make all boundaries, policies by category, protection defaults, and theme preference viewable and editable after onboarding, and must state the current autonomy posture in plain language. Policy edits take effect on the next plan without a restart.
- An automated end-to-end test must replay the full onboarding journey; re-entering setup later must edit existing entities rather than duplicate them.

## Technical Decisions

- Append-only event model (AD-4): every life-model entity — boundaries, policies, domains, commitments, protection levels, people, rhythms, goals, allocations, and every later edit — is written as a command/event row with a non-null context tag. Current state is served from `ledger` projections only. There are no UPDATE/DELETE mutations on event tables; edits and undo are compensating forward events. Command/event payload schemas are defined once, in `packages/ledger`.
- Context tagging (AD-5/AD-6): every domain entity carries a non-null work/personal/joint context tag. There is one app user. Person entities are the user's own model of relationships; merges (if any) are user-initiated only.
- Hexagonal boundaries (AD-1): domain logic lives in core packages; the web host appends commands and reads projections. Onboarding steps append commands; they do not mutate state directly.
- The ethical/privacy constraint (P5 / FR-12) is a hard schema-level rule for this epic: the system reasons only about the user's own behavior and intentions, never third-party internal state. No relationship scores, ever.
- Displacement counting is mechanical and neutral (a count surfaced in neutral language); no inference, no "best remaining opening" remediation, no guilt framing at MVP.
- Persisted entities feed the ContextSnapshot the planner consumes in Epic 4, so the shapes chosen here (protection levels, allocations, rhythms as flexible intentions) must be projection-queryable and stable.
- The ≤45-minute claim is instrumented: a timestamp pair is recorded and asserted by test, consistent with the project's build-the-metric-into-the-product discipline.

## UX & Interaction Patterns

- Everything is styled per the DESIGN.md token system and written in the calm voice register (EXPERIENCE.md): preferred/forbidden language lists bind all copy; no guilt, engagement, or motivational prompts; empty states read like "Nothing waiting for a decision."
- Onboarding shows visible progress, is resumable, and every step is skippable-with-defaults. Each step surfaces a "What this protects" rationale.
- Protection levels use lock/shield/tune iconography — status must never be conveyed by color alone (accessibility floor; non-color status indicators throughout).
- Fulfilled/declined/archived items use muted tokens at full opacity; the opacity-dimming idiom is banned.
- First-run and empty states across the epic follow the state-pattern contract (day-one cold start, empty states). Accessibility floor from Epic 1 applies to every surface: full keyboard operability, focus-visible rings, landmark roles, screen-reader announcements.
- The Policy & Boundaries surface is a Settings-area view (per the 7-level FR-68 hierarchy with progressive disclosure), presenting boundaries, policies by category, protection defaults, theme preference, and a plain-language autonomy-posture statement.

## Cross-Story Dependencies

- Epic 2 requires Epic 1 (the event ledger, context tags, and connected calendars) before any story can land. Story 2.6's proof requires a fresh account with connected calendars.
- Within the epic: Story 2.1 (the flow) frames the container; Stories 2.2–2.5 fill in boundaries, commitments, people, and goals; Story 2.6 verifies the whole sitting end-to-end and depends on 2.1–2.5 being complete; Story 2.7 (the durable surface) presents and edits everything the prior stories persisted.
- Epic 2 is a hard prerequisite for Epic 3 (capture, which appends to the same ledger) and Epic 4 (the morning plan, whose ContextSnapshot is assembled from the life-model entities defined here). Full policy catalog/conflict handling, full Person model, goal decomposition, and relationship-generated actions are deliberately deferred to later v1.0 epics.
