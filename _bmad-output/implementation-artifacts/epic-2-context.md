# Epic 2 Context: The Life Model

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Sean defines what matters — life domains, workday shape and 4:30 hard stop, sleep window, hard commitments and protected priorities with protection levels, a starter set of Life Operating Policies, up to 3 active goals (each with one user-defined next action and a protected weekly allocation), and his core people (identity, intentions, important dates, one communication rhythm each) — in a single sitting of ≤45 minutes that must feel like a conversation, not filing taxes. The epic delivers the guided onboarding flow, the underlying life-model entities, day-one empty states, an end-to-end proof that the sitting meets its time budget, and the standalone Policy & Boundaries surface where these rules stay inspectable and editable after setup. It establishes the truthful inputs every later plan depends on.

## Stories

- Story 2.1: Guided Onboarding Flow
- Story 2.2: Boundaries, Domains, and Starter Policies
- Story 2.3: Hard Commitments and Protection Levels
- Story 2.4: Important People and Communication Rhythms
- Story 2.5: Goals with a Next Action and Protected Allocation
- Story 2.6: The Forty-Five-Minute Proof
- Story 2.7: The Policy & Boundaries Surface

## Requirements & Constraints

The setup captures the MVP-lite life model: configurable life domains (11 defaults, renamable/disable/add; items may span domains without becoming silos); the four protection levels (hard commitment / protected priority / flexible intention / optional opportunity) — every plannable item must carry one, none may be untagged; workday shape, hard stop, and sleep boundary; standing hard commitments and protected priorities with recurrence; starter Life Operating Policies (only the non-negotiable and work-boundary templates ship at MVP, offered with plain-language explanations, editable before accepting, with declines recorded rather than nagged).

People are captured as an identity/intention/important-date subset only. Each core person gets one flexible communication rhythm modeled as a flexible intention linked to that Person, schedulable within a window. "Meaningful interactions" and "life events" are user-asserted fields only — never inferred — and no relationship score exists anywhere in the system (an ethical constraint enforced at schema level, binding on all phases).

Goals: up to 3 active, each with exactly one user-defined next meaningful action and a protected weekly time allocation (e.g., 3×45 min), stored as protected-priority intentions linked to the goal. A per-allocation displacement counter increments whenever a planned allocation is moved or dropped, shown in neutral language — no guilt mechanics, no remediation or full tracking yet (those are later phases).

Onboarding must be multi-step with visible progress, every step skippable-with-defaults, resumable mid-way, and lossless on abandonment (each completed step is already persisted). Every step must state why it matters ("What this protects"). The completed sitting is proven with an instrumented start→finish timestamp pair ≤45 minutes and an automated replay test; re-entering setup later edits rather than duplicates. Day-one and first-run empty states are explicit acceptance criteria, not afterthoughts. The Policy & Boundaries surface (a named MVP interface surface) must render all boundaries, policies by category, protection defaults, and theme preference as viewable/editable, state the current autonomy posture in plain language, and apply policy edits to the next plan without restart.

## Technical Decisions

All life-model writes are append-only command/event rows; current state is served from projections; there is no UPDATE/DELETE on event tables and undo is a compensating forward event. Every event/command payload schema is defined once in the `ledger` package and imported, never redeclared — a story needing e.g. `PersonCreated` imports it. Life model and policy logic live in the `policy` and `ledger` core packages; core imports no adapter, host, or framework. Person and Plan projections live in `ledger`.

Every domain entity carries a non-null context tag (work / personal / joint); `joint` is legal only on planning artifacts and user-initiated Person merges. There is one app user. Web mutations are Next.js server actions that append commands; no inline model calls. IDs are application-side UUIDv7; time is stored ISO-8601 UTC with durations as integer minutes; commands are imperative and events past-tense; all payloads cross zod schemas defined in core. Config flows through the typed `config` module only.

The four protection levels reuse a single shared concept across hard commitments, protected priorities, goal allocations, and rhythms. Protection level is a required property of any plannable item. Autonomy at MVP is recommend-and-draft only (levels L2–L3); the only external write surface anywhere is Gmail draft creation, which this epic does not touch. Testing is Vitest with co-located tests; integration tests run against an ephemeral Postgres container; the 45-minute proof is an automated end-to-end replay.

## UX & Interaction Patterns

The flow is styled from the design tokens with a calm, editorial voice — no third-party component system. Microcopy is binding: use the preferred register ("What this protects," "Why this matters"); never use scores, guilt language, streaks, badges, or cheerleading. Protection-level selection shows each level's meaning in preferred language at the point of choice ("should not move except for a genuine emergency") and uses shape/icon, never color alone — a `lock` badge marks hard commitments and protected priorities. Domain chips are orientation-only classification tags (protected variant carries a lock icon), never a ranked hierarchy. Status is never conveyed by color alone anywhere; every interactive element carries a role and state label; keyboard operability and reduced-motion are floors.

A person's intention ("I want to call weekly") is visually distinct from a system-protected hard commitment — the two must not be conflated in copy or styling. Empty/first-run states follow the calm register: the Policy & Boundaries first-run shows starter templates with Accept/Customize actions; day-one Morning Plan/Today (no plan, no sources) reads "Connect your calendars to generate your first plan. In the meantime, capture anything on your mind." Text fields autosave silently ("Saving…" → "Saved") and never block navigation. Banned everywhere: gamification, streak counters, engagement prompts, modal stacks more than one deep, and loading states that block interaction beyond three seconds.

## Cross-Story Dependencies

The whole epic depends on Epic 1 (app shell, Better Auth single-user sign-in, the event ledger with context tags and undo, connected calendars) — the ledger, projection, and event mechanics this epic writes against exist only after Epic 1. Within the epic: Story 2.1 establishes the flow shell the entity stories (2.2–2.5) plug into; Story 2.6 verifies the complete sitting end-to-end and so depends on 2.1–2.5 being in place; Story 2.7 surfaces and edits everything the prior stories persisted. Downstream, Epic 3 (capture/ledger) and Epic 4 (morning plan) consume this life model as planning input — the ContextSnapshot the planner reads is assembled from these projections — so the protection-level model, goal allocations, and rhythms defined here are load-bearing for every later planning surface.
