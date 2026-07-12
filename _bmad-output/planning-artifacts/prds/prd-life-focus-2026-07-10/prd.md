---
title: Life Focus Intelligence PRD
status: final
created: 2026-07-10
updated: 2026-07-11
---

# Life Focus Intelligence — Product Requirements Document

## 1. Executive Summary

Life Focus Intelligence is a closed-loop life operating system: it senses relevant context across work and personal systems, interprets commitments and intentions, recommends realistic plans with explicit tradeoffs, helps execute decisions, and learns from what actually happened — without taking control away from the user.

It answers one question continuously:

> "Given everything I care about, everything I have promised, the people who depend on me, the current state of my responsibilities, and the time and energy I actually have, what is the best use of my attention now?"

**Delivery strategy.** The founding user (Sean) is user #1 and the proving ground; the product is designed from day one to scale to a commercial launch without a rewrite. This PRD defines:

- **MVP** — a thin wedge chosen for fastest personal value and habit formation (§7.2).
- **v1.0** — the complete feature set (§9), which incorporates the full scope of the source draft.
- **Post-v1.0** — collaboration, automation, and full-life-OS phases (§7.4).

**Conflict resolution priority order.** When requirements conflict, resolve in this order:
1. User safety, privacy, and authority
2. Hard commitments and explicit user policies
3. Accurate representation of capacity and consequences
4. Explainability and source traceability
5. Product usefulness and ease of use
6. Automation and optimization

## 2. Problem

People with demanding careers and full personal lives coordinate obligations across disconnected systems. Work lives in calendars, task tools, email, Slack, Jira, documents, and memory. Personal life lives in family calendars, texts, notes, school schedules, and household lists. Important aspirations — be a present parent, protect evenings, maintain close relationships — often exist in no operational system at all.

Nine failure modes define the problem space:

1. **Fragmented mental model** — understanding "what matters today" requires manually inspecting many systems, consuming a substantial portion of each morning.
2. **Reactive prioritization** — the loudest demand wins because new requests are answered before being compared against existing commitments and capacity.
3. **Commitment displacement** — new work displaces planned work or personal commitments without a deliberate decision, and affected people may never be told.
4. **Interrupt dormancy** — a request is seen but never completed, scheduled, delegated, declined, or acknowledged; it becomes buried.
5. **Personal-priority erosion** — work repeatedly consumes family, health, rest, and personal time; each displacement appears individually reasonable.
6. **Goal inactivity** — meaningful long-term goals never translate into actions and time allocations.
7. **Unrealistic planning** — scheduling tools equate calendar availability with capacity, ignoring preparation, follow-up, travel, context switching, fatigue, interrupts, recovery, and boundaries.
8. **Lost context** — a task title rarely contains enough context for a high-quality decision; meaning lives in documents, briefs, incident records, and prior commitments.
9. **Planning without execution** — even with a plan, the user must reconstruct working context before beginning each activity.

**What this product is not:** primarily a dashboard, calendar, task manager, contact manager, project-management tool, inbox, or habit tracker. It is a decision-support and execution layer across the user's life.

### 2.1 Non-goals

Binding exclusions — the product will not:

1. Replace existing calendars, email, Slack, Teams, Jira, Asana, Todoist, or other task systems, or replace document repositories
2. Become a complete project-management platform, a general enterprise search engine, or a social network
3. Diagnose relationship health or score affection or closeness
4. Automatically make major life decisions
5. Automatically contact people without appropriate review
6. Track every acquaintance
7. Monitor keyboard activity or application usage, or provide employee surveillance
8. Fill every available minute or optimize the user solely for output
9. Require data migration into a proprietary system, or copy all enterprise or personal documents into a single unrestricted store
10. Act as a therapist, physician, attorney, or financial adviser
11. Infer sensitive traits without necessity
12. Claim a complete understanding of the user's life

## 3. Vision and Product Principles

Life Focus Intelligence should become: the first interface opened when planning the day; the interface consulted when circumstances change; the place accepted commitments remain visible; the bridge between long-term intentions and daily action; the system that protects boundaries and exposes tradeoffs; and the interface that helps the user deliberately stop working.

It should feel like a combination of chief of staff, personal planner, executive assistant, time air-traffic controller, and thoughtful life steward. The emotional outcome for the user: oriented rather than overwhelmed; intentional rather than reactive; protected rather than overcommitted; confident rather than guilty; clear about what to do next; aware of tradeoffs before making them; able to stop work deliberately; assured that important people and commitments will not disappear.

Three supporting promises anchor the behavior: the user should know what matters now, what can wait, what is being neglected, and what will be displaced when priorities change; important goals, people, commitments, and responsibilities must not depend solely on the user remembering them at the right moment; and overcommitment must be represented as a decision, never hidden inside an unrealistic schedule.

**Principles (binding on all features):**

- **P1 — User authority.** The product never attempts to define a good life for the user. It helps the user act consistently with values, responsibilities, and priorities they explicitly choose. Consequential recommendations and actions must be understandable, modifiable, rejectable, and undoable.
- **P2 — The core loop.** Every capability serves the loop: *Sense → Interpret → Decide → Act → Learn.*
- **P3 — Honest capacity.** The system never equates calendar availability with capacity, and never presents incomplete context as complete.
- **P4 — Tradeoffs before consequences.** The user sees what will move, break, or be displaced *before* accepting something new — the product's central differentiator (no competitor identified as of 2026-07 ships this; re-verify before any commercial investment).
- **P5 — Ethical relationship reasoning.** The system may reason about the user's own behavior and stated intentions ("You said you wanted to call weekly") — never claim to know another person's internal state ("Your mother feels neglected"). No relationship scoring, ever.
- **P6 — Non-optimization.** The purpose is not to maximize how much the user accomplishes; it is to help the user direct finite attention toward what they deliberately chose to value. White space is preserved, not filled.
- **P7 — Privacy separation.** Confidential work context and private personal context remain technically separated; only minimal planning constraints cross the boundary (§11).
- **P8 — The recommendation is the product.** Every primary experience helps the user decide, execute, communicate, protect, renegotiate, or close an open loop.
- **P9 — One capacity pool.** Work and personal life cannot be planned independently; they consume the same finite time and energy.
- **P10 — Time boundaries are real constraints.** Overcommitment must never be silently solved through overtime, lost sleep, or canceled personal priorities.
- **P11 — Consequences must be visible.** When an item moves, the system shows: what is displaced; who is affected; which goal loses time; whether a boundary is violated; whether the finish time changes; whether another person must agree. This six-item checklist is the testable definition of "show the tradeoff" and binds every planning surface (FR-30, FR-35).

Further binding constraints are carried by specific requirements: requests are not commitments (FR-21); important goals must generate action (FR-38); planning must lead to execution (§9.10); feasibility includes more than time (FR-26–27); other people's time is not freely available (FR-64–65); people are active planning entities (§9.2).

**Feel and voice.** The product should feel: calm, intelligent, warm, human, disciplined, trustworthy, premium, focused, reassuring, decisive without being controlling. It must NOT feel like: a corporate admin dashboard, a crowded project-management tool, an inbox, a contact CRM, a colorful consumer task application, a gamified self-improvement product, a relationship-scoring system, a chatbot without structure, an autonomous black box, or a system designed to maximize productivity at all costs. Core message: "Here is what appears to matter based on your policies, commitments, goals, people, capacity, and current evidence. Here are the tradeoffs. You remain in control." Preferred UI language: "Why this matters," "What this protects," "What will move," "Who is affected," "Needs a decision," "Waiting on you," "Intentionally not scheduled," "Repeatedly displaced," "Best remaining opening," "Work ends at," "Based on current information." Forbidden language: productivity score, relationship health, utility score, optimized life, "AI knows," objective priority.

## 4. Users

- **Founding user (MVP).** Sean — technical leader balancing a demanding role with family, health, household, and personal goals. Work context: Google Workspace, Slack, Jira. Personal context: Gmail + Google Calendar, Apple ecosystem (Calendar, Reminders, Notes, iMessage), a personal task app. Full connection of work systems is permitted. Desired outcome: move from "never enough time" to feeling in control and spending worry-free time with family.
- **Primary persona (v1.0): High-cognitive-load professional.** Manages multiple projects; receives frequent unplanned requests; balances work with family, health, relationships, household; uses several disconnected systems; carries implicit commitments mentally. Examples: executives, founders, consultants, technical leaders, product managers, program managers, senior ICs, customer-facing professionals, parents with demanding careers.
- **Secondary persona (v1.0): Executive or founder.** Balances strategic and operational responsibilities; frequently interrupted by legitimate requests; must avoid becoming a bottleneck and protect high-leverage time. The delegation and shared-responsibility requirements (FR-63–66) exist primarily for this persona.
- **Future persona (post-v1.0): Household planning partner.** Participates in family coordination, shared responsibilities, and responsibility transfers. Not required for MVP or v1.0, but the data model must anticipate it.

## 5. Goals and Success Metrics

### 5.1 Product goals

1. Create a realistic whole-life plan.
2. Reduce planning overhead to a short review-and-approve process.
3. Protect accepted commitments from silent displacement.
4. Distinguish requests from commitments.
5. Evaluate interrupts against the complete active plan, not just calendar availability.
6. Protect people and relationships (rhythms, important dates, promises).
7. Activate meaningful goals into actions and protected capacity.
8. Protect stopping times and boundaries.
9. Reduce friction between deciding and doing.
10. Improve through transparent learning.
11. Preserve user agency over every consequential action.
12. Respect privacy boundaries between work and personal contexts.

### 5.2 Success metrics

**MVP north stars** (measured for the founding user; targets carry into v1.0). Every metric names its instrument — nothing is graded by vibe:

| ID | Metric | Target | Instrument |
|---|---|---|---|
| SM-1 | Daily plan accuracy | ≥80% of scored days | Fixed three-question end-of-day rubric (below), recorded in-app |
| SM-2 | Morning approval time | <10 min median initially; <5 min long-term | Automatic timestamp pair: plan first rendered → plan approved |
| SM-3 | Finish-time reliability | Improving trend vs. first-2-week baseline | Explicit "work ended" tap in end-of-day review, compared to the plan's stated finish window |
| SM-4 | Personal-priority protection | ≥95% | Commitment Ledger audit: hard/protected personal items completed or explicitly renegotiated vs. silently displaced |
| SM-5 | Interrupt decision rate | ≥95% | Denominator: Capture Inbox items classified actionable; numerator: items reaching an explicit decision state. Known bias: uncaptured interrupts are invisible — reviewed weekly against calendar/email reality |

**SM-1 rubric** (asked in the end-of-day review, yes/no): (1) Knowing what you knew this morning, did the approved plan reflect the best use of your time? (2) Did anything happen today the plan should have anticipated? (3) Did the day end within the intended finish window without sacrificing a protected commitment? A day scores accurate on yes/no/yes.

**Full v1.0 metric set** (adds): SM-6 planning-overhead reduction (weekly self-report); SM-7 commitment accuracy (requests vs. accepted commitments correctly distinguished, user-corrected sample); SM-8 commitment reliability (ledger: fulfilled or renegotiated before failure); SM-9 dormancy reduction (ledger: requests with no acknowledgment/decision/closure); SM-10 goal activation (% of active goals generating an approved action within horizon); SM-11 relationship follow-through (against user-defined intentions, never a relationship score); SM-12 goal-allocation reliability (% of intended weekly capacity delivered); SM-13 effort calibration (estimated-vs-actual error reduction); SM-14 context usefulness (evidence-assisted recommendations rated more accurate); SM-15 autonomy trust (% of system actions rated appropriate, understandable, reversible); SM-16 white-space preservation (FR-31 allocations); SM-17 cross-context privacy (unauthorized work↔personal transfers = **zero**, verified against the SEC-2 cross-context audit log); SM-18 retention (weekly and 90-day among users completing setup) [commercial launch only].

### 5.3 Counter-metrics

The product fails if it wins its metrics the wrong way. Guardrails, each tagged with phase and data source:

- **Time in tool [MVP — session telemetry]** — active-interaction time (excluding glanceable surfaces such as the live-day view) should trend *down* after week 2; the product is an operating interface, not a destination.
- **Notification volume [MVP — notification log]** — decision-oriented notifications only (§9.12); volume trending up while decision rate stays flat indicates noise amplification.
- **Replanning churn [MVP — plan-change audit trail]** — plan items moved more than twice without user request signals over-optimization (§9.6 minimizes movement).
- **Boundary violations [MVP — ledger audit]** — a single blown hard commitment destroys trust (the #1 abandonment cause for this category); target is zero, and any violation triggers a root-cause review.
- **White-space fill rate [v1.0 — requires FR-31 allocations]** — user-defined unstructured time must not shrink week over week without deliberate reallocation.
- **Extraction rejection rate [MVP — confirmation queue telemetry]** — if >50% of proposed email-derived commitments are rejected in week one, auto-extraction drops to forward-only mode (FR-15).

## 6. Competitive Position

Research (2026) confirms the loop is fragmented across the market but closed nowhere: briefing agents (Lindy, Read AI, ChatGPT Pulse) sense and propose; auto-schedulers (Motion, Reclaim) decide and act silently; ritual planners (Sunsama, Morgen) keep the human in control but lack intelligence; commitment extractors (Claryti) build passive ledgers; personal CRMs (Clay, Dex, Monica) nudge in a silo that never reaches the daily plan. Three positions are unoccupied and define this product: **tradeoff-aware planning** (what moves if I accept this), **work/personal privacy separation**, and **relationship stewardship inside the daily plan**. The learning loop is near-universally missing. Category abandonment drivers — setup tax before value, trust erosion from one bad action, noise amplification, integration rot — are addressed directly by gradual onboarding (§9.1), conservative autonomy defaults (§9.13), decision-oriented notifications (§9.12), and coverage/degradation transparency (§9.14). (Full landscape table in `addendum.md`.)

An honest caveat: the same evidence supports a darker reading. Funded players *exited* this segment (Clockwise acquired and shut down; Motion moved upmarket to teams) — which may mean individuals won't pay for whole-life planning, not that the lane is open. This is unresolved and attaches to OQ-7; it costs nothing during the "me first" phase but must be confronted before commercial investment.

## 7. Scope and Phasing

### 7.1 Phasing model

- **MVP** — the thinnest slice that delivers daily personal value and builds the trust habit: an honest, boundary-respecting morning plan with visible tradeoffs.
- **v1.0** — the complete product this PRD specifies: every functional requirement in §9 (the source draft's full scope).
- **Post-v1.0** — Phases 2–4 (§7.4).

### 7.2 MVP — recommended wedge [ASSUMPTION: recommendation by Claude, approved direction "thin it — you propose"; adjust freely on review]

**Rationale.** The wedge optimizes for (a) time-to-first-value in days, not weeks — setup tax is the #1 abandonment driver; (b) the founding user's stated pain: reactive days, eroded family time, no felt control; (c) trust-first sequencing — the plan must prove it respects boundaries before it earns broader inputs and autonomy.

**MVP includes:**

1. **Life model, lite** — workday shape and hard stop; sleep window; hard commitments and protected priorities with protection levels; a starter set of Life Operating Policies (non-negotiables, work boundaries); up to 3 active goals and a core-people list (names, intentions, important dates) captured for visibility — without decomposition or workflow engines.
2. **Source ingestion, first ring** — work Google Calendar, personal Google Calendar, work Gmail, personal Gmail. Slack and Jira arrive in v1.0; until then their demands enter via capture. [ASSUMPTION: calendars + email give the highest planning signal per integration-hour; interrupts from Slack are captured manually in MVP]
3. **Capture** — desktop and mobile-web natural-language capture into a Capture Inbox with basic classification and minimal clarification.
4. **Commitment Ledger, core** — requests vs. commitments distinguished; lifecycle states; source and history preserved; at-risk flagging; email-derived commitments require confirmation before creation.
5. **Morning planning loop** — import meetings and due work; review commitments and requests; calculate realistic capacity (buffers, transition time, boundaries); propose a day showing exclusions, expected work end, risks, and confidence; approve or adjust.
6. **Interrupt assessment, MVP-honest** — capture a demand; classify the requested outcome (user-confirmable, not autonomously inferred); take effort from user input or per-type templates (the MVP does *no* inferred estimation); compute a **mechanical plan-diff** against the active day (example output: "if this goes here, these blocks move, work ends at X, this boundary is at risk" — the P11 checklist); recommend among do now / schedule / acknowledge / clarify / decline ("delegate" arrives with the v1.0 delegation model); preserve displaced commitments; track to resolution. The tradeoff *display* is the MVP differentiator; tradeoff *inference* (effort estimation, response simulation) is v1.0.
7. **End-of-day review, lite** — completed outcomes; displaced commitments; unanswered requests; roll-forward; boundary check and deliberate stop.
8. **Autonomy posture** — recommend and draft only; every action user-approved; full audit trail from day one.

**MVP explicitly defers to v1.0:** documentation/evidence layer; goal decomposition and allocation tracking; staged important-date workflows and relationship rhythms; execution context packets; learning loop; inferred effort estimation and response simulation; delegation (including the "delegate" recommendation); weekly planning loop; live-day loop; Slack/Jira/task-app/Apple-ecosystem ingestion; coverage dashboard beyond basic sync status.

**MVP acceptance criteria** — the wedge is done when all of these pass:

- **AC-1** Both Google Calendars and both Gmail accounts connect via OAuth; sync status and last-sync time are visible.
- **AC-2** Life-model setup (workday shape, hard stop, sleep window, hard commitments, protected priorities, up to 3 goals, core people with important dates, starter policies) completes in a single sitting of ≤45 minutes.
- **AC-3** The first morning plan is available on day one, immediately after connecting sources — no multi-day training period.
- **AC-4** The morning plan shows proposed blocks, exclusions with reasons, expected work end, risks, and confidence; approval and adjustment both work; the render→approve timestamp pair is recorded (SM-2).
- **AC-5** A proposed plan never schedules over a hard commitment or past the hard stop without an explicitly flagged tradeoff; silent violations are zero (SM-4).
- **AC-6** Natural-language capture from desktop and phone reaches the Capture Inbox; classification is proposed; every actionable item remains traceable per FR-20.
- **AC-7** Email-derived commitment candidates appear only as proposals requiring confirmation; a per-account toggle exists; the week-one >50% rejection fallback (FR-15) is implemented.
- **AC-8** The interrupt flow runs from capture to decision in ≤5 interactions and displays all six P11 consequence-checklist items.
- **AC-9** Every interrupt reaches an explicit recorded decision state; the ledger lists at-risk commitments.
- **AC-10** Drafted acknowledgments/replies land in the correct Gmail account's drafts folder, ready to send — never auto-sent.
- **AC-11** The end-of-day review shows completed, displaced, and unanswered items; records the explicit "work ended" tap (SM-3); rolls unresolved items forward without loss.
- **AC-12** Every consequential recommendation exposes an inspectable "why" (FR-25).
- **AC-13** Every plan mutation is undoable in one step; the audit trail chains recommendation → decision → action → plan change.
- **AC-14** Work-context titles/details never appear on personal-context surfaces and vice versa, except broker-permitted constraint summaries — verified against the SEC-2 cross-context audit log.
- **AC-15** A failed or revoked connector is disclosed in-app within one sync cycle; plan confidence downgrades; manual capture is offered.

### 7.3 v1.0 — complete product, reached through sequenced increments

v1.0 remains the promise: every functional requirement in §9, incorporating the entirety of the source draft's scope. The road there is sequenced so there is always a next buildable increment with its own gate [ASSUMPTION: proposed sequence — reorder as the MVP teaches]:

- **v0.2 — Work signal.** Slack + Jira ingestion; full request/action extraction (FR-15); live-day loop (FR-34); weekly planning loop (FR-33). *Gate: work interrupts arrive without manual capture; the week has a planned shape.*
- **v0.3 — Calibration.** Learning loop (FR-37, FR-52–55); capacity model v2 with inferred energy/resource constraints (FR-26 full, FR-27); full coverage dashboard (FR-60). *Gate: SM-13 effort-calibration error visibly shrinking.*
- **v0.4 — People and goals.** Goal decomposition and allocation (FR-38–40); relationship actions and important-date workflows (FR-9–11); personal task app + Apple-ecosystem ingestion (iMessage is feasibility-gated — see addendum §5; drop without replanning if API-constrained). *Gate: SM-10 goal activation and SM-11 relationship follow-through measurable.*
- **v0.5 — Evidence and execution.** Documentation/evidence layer (FR-41–45); context packets (FR-47); full execution actions (FR-48–50); delegation model and drafting (FR-63–66). *Gate: UJ-6 works end-to-end.*
- **v1.0 — Completion and hardening.** Full policy catalog (FR-4–6); autonomy configuration matrix (FR-58); acceptance interpretation (FR-23); the source draft's full 32-step acceptance journey passes.

**Explicitly excluded from v1.0** (deferred to post-v1.0 phases): full partner/team collaboration; autonomous message sending by default; full enterprise knowledge indexing; complex predictive health modeling; broad financial planning; native mobile execution app; automated delegation acceptance; full household responsibility negotiation; fully automatic life scheduling; relationship scoring (excluded permanently); comprehensive opportunity-recommendation engine.

### 7.4 Post-v1.0 roadmap

- **Phase 2 — Stronger execution and collaboration:** richer mobile experience; shared household planning; delegation acceptance; calendar/task write-back; meeting acceptance recommendations; smarter stakeholder communication; richer context packets; weekly review and learning workflows.
- **Phase 3 — Broader context and automation:** enterprise-controlled deployments; expanded document intelligence; team dependency awareness; workload forecasting; scenario simulation; advanced energy-aware planning; automated low-risk actions; household responsibility coordination.
- **Phase 4 — Full life operating system:** long-term life-goal planning; travel and experience planning; health and recovery integrations; financial scheduling; family and partner collaboration; opportunity discovery; local-first personal AI; federated enterprise and personal agents.

Future capabilities must never compromise user authority, explainability, white-space preservation, or privacy separation.

## 8. User Journeys

Protagonist: Sean, technical leader, married, kids in school, hard stop at 4:30 PM. [ASSUMPTION: narratives synthesized from the draft's core jobs and operating loops; validate details against real days]

**UJ-1 — Morning planning (MVP).** 7:40 AM. Sean opens Life Focus Intelligence instead of triaging four apps. The system has already read both calendars and both inboxes: today holds six meetings, two due work items, one overdue commitment to Priya, and a school pickup at 3:30 flagged as a hard commitment. The proposed day shows deep work at 8–10, the overdue reply scheduled at 10:15, buffers around meetings, expected work end 4:10 PM, and a note: "Two requests from yesterday are still unassessed. The design review prep is intentionally not scheduled today — Thursday morning is the best remaining opening." Sean moves one block, approves, and starts the day oriented in under seven minutes.

**UJ-2 — Interrupt with visible tradeoffs (MVP).** 1:50 PM. A Slack message asks Sean to review a customer escalation "today." He captures it in one action. The system interprets the outcome ("review + written assessment, ~90 min"), compares it against the active plan, and lays out the tradeoff: "Doing this now displaces the architecture doc (committed to Marcus for Friday — still feasible if moved to tomorrow 9 AM) and pushes work end to 5:50 PM, past your 4:30 hard stop and into family time. Alternatives: schedule tomorrow 9 AM and acknowledge now with a drafted reply; or ask a clarifying question before committing." Sean picks acknowledge-and-schedule; the drafted reply lands in his work Gmail drafts, ready to send with one click; Marcus's commitment is preserved and rescheduled, not silently dropped.

**UJ-3 — Deliberate stop (MVP).** 3:55 PM. End-of-day review: four outcomes completed, one commitment displaced (already renegotiated), two requests awaiting simple acknowledgments — both drafted for approval. Tomorrow already has a credible starting shape. The system marks the transition out of work. Sean closes the laptop at 4:15 without the background hum of open loops.

**UJ-4 — Goal activation (v1.0).** Sean's health goal has received no scheduled time for 12 days. The system says so in neutral language and proposes the least disruptive opening (Wednesday 7 AM). Accepting allocates protected weekly capacity; declining is recorded without guilt mechanics.

**UJ-5 — Important date preparation (v1.0).** Three weeks before his wife's birthday, the system proposes a staged workflow: decide how to celebrate, coordinate childcare, book the restaurant, order the gift by the 14th, protect the evening as a hard commitment. Each step lands in the plan at the right lead time; all steps are editable.

**UJ-6 — Evidence-assisted decision (v1.0).** A Jira ticket asks for "the migration plan status." The system retrieves the relevant design doc and last week's meeting decision, notes the two sources disagree on the deadline, shows both with freshness and authority, and asks Sean to resolve before it schedules follow-up work.

The remaining core jobs — weekly allocation, consequence awareness, commitment management, relationship stewardship, execution context, boundary protection — are specified as functional requirements in §9 and follow the same pattern: sense, interpret, show tradeoffs, act with approval, learn.

## 9. Functional Requirements

Phases: **[MVP]** = §7.2 wedge; **[v1.0]** = complete product. All v1.0 requirements incorporate the source draft's full scope.

### 9.1 Life model and onboarding

- **FR-1 [MVP]** Users define life domains (defaults: Work, Spouse/partner, Children/family, Friends/social, Health/fitness, Household, Finances, Personal growth, Recreation, Community, Rest/recovery); domains are configurable, items may span multiple domains, and domains inform context without becoming rigid silos.
- **FR-2 [MVP]** The system distinguishes and separately models: goals, relationship intentions, responsibilities, boundaries, rhythms/rituals, and important dates.
- **FR-3 [MVP]** Every commitment, work item, relationship action, goal action, or event supports a protection level: hard commitment; protected priority (moves only via explicit tradeoff); flexible intention (occurs within a window); optional opportunity.
- **FR-4 [MVP]** Users define Life Operating Policies across categories: non-negotiables, work boundaries, relationship policies, health/recovery policies, emergency definitions, overtime policies, delegation policies. MVP ships starter templates for non-negotiables and work boundaries; v1.0 ships the full catalog.
- **FR-5 [v1.0]** Policy onboarding is gradual: templates offered, repeated confirmed choices observed, policy additions suggested with confirmation (e.g., "You protected Thursday pickup in the last three conflicts — make it a recurring hard commitment?"). Users never need to configure every rule upfront.
- **FR-6 [v1.0]** Policy conflicts are surfaced: the system identifies the conflict, explains affected commitments, shows the likely controlling policy, presents alternatives, asks for a decision when no rule controls, and records approved exceptions.
- **FR-7 [MVP]** Onboarding supports beginning with limited setup (workday shape, hard stop, sleep boundary, hard commitments, up to 3 goals, core people, starter policies, autonomy permissions) and adding context gradually. v1.0 extends to 3–5 goals, 5–15 people, full policy and rhythm setup.

### 9.2 People and relationships

- **FR-8 [MVP-lite / v1.0-full]** A Person model captures: name, relationship type, domains, user-defined importance, relationship intention, preferred interaction forms, contact rhythm, availability, important dates, open commitments, shared responsibilities, recent meaningful interactions, unanswered messages, life events, related goals, professional role, delegation suitability, privacy settings, and source links. MVP captures the identity/intention/important-date subset. "Meaningful interactions" and "life events" are user-asserted fields only — never inferred from message content (P5, FR-54).
- **FR-9 [v1.0]** Relationship importance levels (core, important, active professional, extended network, context only) influence attention but never create absolute priority.
- **FR-10 [v1.0]** The system proposes relationship-generated actions across: communication (call, text, reply, send update), shared time (dinner, visit, date night, protected family time), care and support (check in, help, arrange, follow up), celebration (plan, gift, reserve, coordinate, protect), commitment fulfillment (send promised info, review, introduce, confirm), and repair (apologize, reschedule canceled time, acknowledge a missed commitment).
- **FR-11 [v1.0]** Important dates generate staged preparation workflows rather than same-day reminders (decide → coordinate → gift → reserve → invite → protect the window → celebrate); depth scales with relationship importance, event type, lead time, geography, budget, and participants; all proposed actions are editable.
- **FR-12 [all phases]** Ethical constraint (P5): the system reasons only about the user's behavior and stated intentions, never claims knowledge of another person's internal state, and never computes a relationship score.

### 9.3 Source ingestion and context

- **FR-13 [MVP]** Connect approved sources with OAuth/least privilege; preserve source links; track synchronization state; respect source permissions; distinguish imported vs. inferred vs. user-confirmed data. MVP sources: work + personal Google Calendar, work + personal Gmail. v1.0 adds: Slack, Jira, a personal task app, Apple ecosystem sources, meeting notes, and selected documents.
- **FR-14 [MVP]** Separate work and personal identities are supported as first-class, with the privacy boundary of §11 between them.
- **FR-15 [MVP-core / v1.0-full]** Request and action extraction identifies: direct requests, implied requests, follow-ups, decisions, invitations, approval requests, care needs, social commitments, important dates, and informational messages requiring no action. MVP ships email-scope extraction with confirmation required, behind a per-account toggle, with a quality gate: if the user rejects >50% of proposed commitments in week one, auto-extraction drops to explicit-forward-only mode until precision improves. v1.0 extends extraction to Slack, Jira, and all connected sources.
- **FR-16 [v1.0]** The context model maintains the layered structure: user intention layer, operational layer, people layer, evidence layer, capacity/feasibility layer, policy layer, planning layer (entity catalog in `addendum.md`).

### 9.4 Capture

- **FR-17 [MVP]** Natural-language capture from desktop and mobile web into a Capture Inbox. v1.0 adds: voice input, browser extension, OS share sheet, email forwarding, Slack action, photo/document upload, calendar follow-up actions, meeting-note import, API input.
- **FR-18 [MVP]** Captured items classify into: request, commitment, task, goal, idea, note, responsibility, important date, relationship intention, boundary, waiting item, decision.
- **FR-19 [MVP]** Minimal clarification: the system asks only questions that materially affect planning ("Did you commit? Who is affected? Deadline? How protected?"). Testable form: clarification prompts are capped at 3 per captured item, and each names the planning decision it unblocks.
- **FR-20 [MVP]** Capture guarantee: an actionable captured item remains traceable until scheduled, delegated, clarified, declined, completed, converted to reference, or deleted by the user.

### 9.5 Requests, commitments, and the Commitment Ledger

- **FR-21 [MVP]** The system distinguishes requests from commitments and tracks the full lifecycle: detected request → unassessed → clarification required / proposed → accepted / modified / delegated / declined → scheduled → in progress → waiting / blocked / at risk → fulfilled / renegotiated / canceled / failed.
- **FR-22 [MVP]** Commitment records carry: required outcome, requester, owner, beneficiary, dates (requested, accepted, due), source, supporting evidence, scope, definition of done, protection level, related goal/person/project, confidence, current state, communication state, renegotiation history, fulfillment evidence.
- **FR-23 [v1.0]** Acceptance interpretation distinguishes acknowledgment, agreement to investigate, agreement to estimate, acceptance of full responsibility, agreement to coordinate another owner, and acceptance of a specific outcome and deadline. "I'll look into it" never auto-escalates to "fully resolve today."
- **FR-24 [MVP-flag / v1.0-full]** At-risk detection and renegotiation: identify risk early, explain why, recommend new date/owner/scope, draft the stakeholder update, track acceptance of the change, preserve original history. Dragging a commitment to a new date is not renegotiation. MVP ships at-risk flagging; drafted renegotiation completes in v1.0.

### 9.6 Prioritization, capacity, and planning

- **FR-25 [MVP]** Prioritization reasons across explicit dimensions — operational necessity, strategic/personal value, human impact, timing significance, commitment strength, capacity feasibility, neglect and displacement, reversibility, confidence — and explains conclusions in plain language; internal scores are never surfaced as unexplained numbers. Testable form: every consequential recommendation exposes a "why" panel listing its top contributing dimensions with the underlying facts.
- **FR-26 [MVP-declared / v1.0-inferred]** Realistic capacity distinguishes theoretical availability from real capacity. **MVP (declared inputs only):** time constraints (workday, hard stop, sleep, meals, commute, childcare, travel), user-declared energy windows (preferred deep-work and low-energy periods), and configurable reserves (interrupt reserve, transition time, recovery buffer). **v1.0 (adds inferred and situational inputs via the learning loop):** meeting-load fatigue, recovery needs, and resource constraints (location, device, access, materials, another person, preparation). The MVP never claims capacity awareness it does not have (P3).
- **FR-27 [v1.0]** Feasibility states classify work as: important and feasible now; important but not feasible now; feasible but low value; requires preparation / another person / another location / more information.
- **FR-28 [MVP]** Overcommitment behavior: when demand exceeds capacity the system states the mismatch, identifies contributing items, shows affected domains, recommends what should move, preserves displaced commitments, shows consequences of each scenario, and never silently consumes sleep, family time, or recovery.
- **FR-29 [MVP-day / v1.0-all]** Planning horizons: today (fixed events, hard commitments, due work, acknowledgments, boundaries); this week (goal allocations, rhythms, exercise, household, strategic work, recovery); this month (important dates, appointments, milestones); quarter/year (major goals, direction, travel, development). MVP plans today; v1.0 adds week/month/quarter.
- **FR-30 [MVP]** Replanning recalculates remaining capacity; preserves completed work and commitments; minimizes unnecessary movement; identifies displaced priorities; explains changes; records reasons; requests approval for consequential changes. Every move displays the P11 consequence checklist: what is displaced, who is affected, which goal loses time, whether a boundary is violated, whether the finish time changes, whether another person must agree.
- **FR-31 [v1.0]** White space and non-optimization: users define protected unstructured time (unplanned evenings, transition time, open weekend mornings, % of week unallocated); the planner preserves buffers per the anti-saturation rule; opportunity suggestions (open Saturday + neglected outdoor goal → "consider the hike") remain opportunities and never become obligations automatically.

### 9.7 Operating loops

- **FR-32 [MVP]** Morning planning loop: review work and personal calendars, due/overdue work, accepted commitments, incoming requests, relevant messages; calculate realistic capacity; identify missing information and conflicts; generate a proposed day; show exclusions, assumptions, risks, expected work end, and confidence; request approval or adjustment. v1.0 adds goal-allocation shortfalls, relationship rhythms and important dates, and evidence retrieval to the loop.
- **FR-33 [v1.0]** Weekly planning loop: review obligations, intended goal allocation, relationship rhythms, important dates, health/household/family needs; calculate weekly capacity; protect important-but-nonurgent priorities; identify overcommitment; preserve white space; propose a flexible weekly shape.
- **FR-34 [v1.0]** Live-day loop: show what to do now and why, what comes next, remaining capacity, projected finish time; protect later commitments; capture new requests; surface only material risks.
- **FR-35 [MVP-honest / v1.0-full]** Interrupt loop. **MVP:** capture the original request; classify the requested outcome with user confirmation; check whether a commitment already exists; link related people/projects/goals; take effort from user input or per-type templates; check policy and hard-boundary feasibility; compute a mechanical plan-diff against the active day; recommend among do now / schedule / acknowledge / clarify / decline; show the P11 consequence checklist; update the plan after approval; preserve displaced commitments; track to resolution. **v1.0 adds:** inferred effort/urgency/uncertainty estimation, response simulation across scenarios, the "delegate" recommendation, evidence retrieval into the loop, and drafted stakeholder communication of changes.
- **FR-36 [MVP-lite / v1.0-full]** End-of-day loop: review completed outcomes; identify displaced commitments, unresolved requests, and people awaiting responses; recommend closure actions; support renegotiation; roll forward unresolved items; protect the personal evening; create a preliminary model for tomorrow.
- **FR-37 [v1.0]** Learning loop: compare estimated vs. actual effort; identify repeated patterns; propose updated assumptions; require confirmation for material changes; apply accepted learning; allow correction, expiration, deletion.

### 9.8 Goal-to-action translation

- **FR-38 [v1.0]** Goals decompose through: goal/intention → desired outcomes → milestones/rhythms/responsibilities → next meaningful actions → resources and dependencies → protected time allocations. Material decompositions require approval.
- **FR-39 [v1.0]** Users control decomposition fully: accept, modify outcomes, remove actions, change cadence or protection, reject the interpretation, define success criteria.
- **FR-40 [v1.0]** Goal neglect is identified in neutral language with a remedy proposed ("Your health goal has not received scheduled time for 12 days; Wednesday morning is the best remaining opening"). "Best remaining opening" is defined: the candidate slot that displaces nothing above flexible-intention protection and minimizes P11 checklist impact. Allocation tracking reports intended vs. delivered weekly capacity.

### 9.9 Documentation, knowledge, and evidence

- **FR-41 [v1.0]** Users link selected documents (technical designs, ADRs, issues, incidents, runbooks, briefs, meeting notes, policies, school notices, itineraries, selected personal notes); the system extracts commitments, decisions, owners, dates, risks, dependencies — with confirmation required before any document-derived commitment is created.
- **FR-42 [v1.0]** Documents never automatically become work: the system distinguishes background knowledge, proposals, decisions, commitments, actions, dependencies, risks, status changes, and historical records. A sentence containing "should," "need," or "will" does not automatically become a task.
- **FR-43 [v1.0]** Evidence before confidence: user-confirmed facts, approved decisions, operational status, source-system facts, inferences, drafts, historical and superseded information are distinguished; authority and freshness metadata (source, author, dates, status, confidentiality, supersession, permissions) attach to every assertion, with a configurable authority order (user correction highest, unverified inference lowest).
- **FR-44 [v1.0]** Source conflicts are surfaced with the affected recommendation, competing values, likely controlling source, and a user resolution when materially uncertain.
- **FR-45 [v1.0]** Targeted retrieval only: documentation is retrieved when relevant to active work, interrupts, commitments, incidents, or user questions — never bulk-indexed by default.
- **FR-46 [MVP]** Traceability: every consequential recommendation retains its sources, evidence, assumptions, conflicts, confidence, plan consequences, and user overrides.

### 9.10 Execution layer

- **FR-47 [v1.0]** Context packets open each activity with: required outcome, why it matters, definition of done, time available, relevant people, open decisions, key messages, supporting documents, dependencies, prior progress, communication deadlines, resources, known risks.
- **FR-48 [v1.0]** Execution actions: open source systems and documents, start a focus block, create a checklist, draft acknowledgments/clarifications/meeting briefs/delegation briefs/renegotiations, record progress, update source tasks, mark completion, capture follow-ups, record decisions. MVP ships drafted acknowledgments and replies within the interrupt and end-of-day loops.
- **FR-49 [v1.0]** Vague activity titles convert into definitions of done: on user request always, and proposed automatically when an item over 30 minutes is scheduled without completion criteria.
- **FR-50 [v1.0]** Completion behavior: marking work complete triggers checks — is the outcome genuinely complete, is someone now waiting, is a follow-up or source update or stakeholder update needed, is another plan affected, can the commitment close.
- **FR-51 [MVP]** Communication is work: the system recognizes when the right action is acknowledge, clarify, renegotiate, provide status, transfer ownership, or confirm — not full completion.

### 9.11 Learning and calibration

- **FR-52 [v1.0]** Learnable dimensions: actual duration, setup/transition time, estimation bias, meeting follow-up load, interrupt expansion, effective focus duration, energy patterns, communication preferences, delegation success, causes of late finishes, repeatedly displaced goals and relationship actions, source reliability.
- **FR-53 [v1.0]** Material learned assumptions require confirmation before affecting plans; all learned assumptions are visible, correctable, expirable, and deletable.
- **FR-54 [all phases]** Learning boundaries: the system never diagnoses health or emotional states, infers sensitive traits unnecessarily, profiles third parties, treats occasional behavior as permanent preference, hides learned assumptions, or makes consequential automatic changes from weak patterns.
- **FR-55 [v1.0]** Feedback controls: correct recommendation; right priority, wrong timing; wrong effort estimate; missing context; wrong person or goal; boundary not respected; too much replanning; too little flexibility; never recommend this again.

### 9.12 Notifications

- **FR-56 [MVP-core / v1.0-full]** Notifications are limited and decision-oriented, batched at low priority, and respect focus blocks. **MVP triggers:** new request needs assessment; commitment at risk; hard boundary may be violated; connector failure reduced confidence; protected priority repeatedly displaced. **v1.0 triggers add:** delegation unaccepted; important person awaiting a promised response; important-date workflow must begin; material incident change; policy conflict needs input; goal repeatedly displaced; a learned assumption could improve planning. **Prohibited at every phase:** motivational prompts, guilt-based relationship reminders, per-movement schedule notifications, engagement-driven prompts.

### 9.13 Autonomy and decision rights

- **FR-57 [MVP]** The autonomy ladder governs all system action: L0 observe, L1 surface, L2 recommend, L3 draft, L4 execute with approval, L5 execute automatically within explicit low-risk reversible policy. MVP operates at L2–L3 only: the sole MVP write surface is creating drafts in the user's own Gmail drafts folder; nothing is sent, and no external system is mutated. L4 arrives with v1.0 write-capable integrations; L5 remains post-v1.0.
- **FR-58 [v1.0]** Autonomy is configurable by domain, source, person, action type, risk, confidence, reversibility, and work-vs-personal context (e.g., auto-reschedule flexible exercise within the week; never move school pickup; draft professional messages but never send; never send personal messages without approval; never create document-derived commitments without confirmation).
- **FR-59 [MVP]** Every automatic or consequential action provides: reason, supporting policy, evidence, audit history, undo, clear disclosure, and notification when another person is materially affected.

### 9.14 Coverage and graceful degradation

- **FR-60 [MVP-basic / v1.0-full]** Coverage indicators show: connected and unavailable sources, last synchronization, metadata-only sources, excluded contexts, known blind spots, material assumptions, unresolved conflicts (e.g., "Slack has not synchronized since 9:20 AM; the plan does not include your spouse's calendar").
- **FR-61 [MVP]** Plan confidence is a defined, documented function of enumerated inputs — source freshness, coverage, effort uncertainty, conflicts, unassessed requests, commitment stability — displayed with the plan and framed as "the best plan based on the information currently available."
- **FR-62 [MVP]** Connector failure: disclose the failure, explain which decisions may be affected, continue with reliable context, reduce confidence, offer manual review or capture. Sync health is monitored actively — silent integration rot is a defined failure mode.

### 9.15 Shared responsibility and delegation

- **FR-63 [v1.0]** Responsibility types: sole, shared, delegated, awaiting acceptance, supporting another owner, waiting on another person, unassigned.
- **FR-64 [v1.0]** Delegation lifecycle: proposed → request sent → accepted → responsibility transfers. The user remains responsible until acceptance unless organizational policy says otherwise. v1.0 drafts delegation requests without requiring collaborative accounts.
- **FR-65 [v1.0]** Household behavior: the system never assumes another household member can absorb a task; it offers options (preserve the commitment, ask the partner, request an approved backup, decline the conflicting work).
- **FR-66 [v1.0]** Professional behavior: identify existing ownership, qualified delegates, on-call responsibility, required approvals, and handoff context.

### 9.16 Interface architecture

- **FR-67 [MVP-subset / v1.0-full]** The product is organized around named interface surfaces, each answering a defined question. **MVP surfaces:** Today (what matters now, what is protected, what is at risk, when work ends, what personal commitments follow); Morning Plan (review and approve); Interrupt Decision (compare scenarios and consequences); Capture Inbox (captured but unresolved items); Commitment Ledger (promises, risk, ownership, communication state); Policy and Boundaries (policies and autonomy); End-of-Day Review (close loops, carry forward, transition out of work). **v1.0 adds:** Week (allocate capacity); People (intentions, dates, open commitments, next actions); Goals (decomposition, allocation, next actions); Focus Context (execute with a context packet); Context Review (evidence, conflicts, source access); Learning Review (confirm or reject learned assumptions).
- **FR-68 [MVP]** Every primary view follows the visual hierarchy, in order: current decision or action → recommendation → reason → person/goal/commitment protected → consequence → confidence and evidence → full source detail. Progressive disclosure: the default view shows only what is needed to decide; evidence, sources, and reasoning remain expandable (evidence-drawer spec in `addendum.md`).

## 10. Non-Functional Requirements

- **NFR-1 Trust and explainability.** Consequential recommendations are understandable and traceable to evidence.
- **NFR-2 Responsiveness.** The daily interface loads quickly enough to feel like an operating surface, not report generation. [ASSUMPTION: targets — morning plan interactive <3s from cached context, full refresh <15s, interrupt assessment <10s; draft specified no numbers]
- **NFR-3 Reliability.** Accepted commitments and hard boundaries never disappear because of connector failure; the commitment ledger is durable independent of sources.
- **NFR-4 Reversibility.** Every plan mutation supports one-step undo. Irreversible external actions (sending a message, mutating a source system) are never automatic and always require explicit approval.
- **NFR-5 Auditability.** The system records recommendation, evidence, policy, user decision, action taken, and resulting plan change.
- **NFR-6 Data minimization.** Only context necessary for planning is retrieved or stored; no bulk indexing by default.
- **NFR-7 Accessibility.** Keyboard navigation, high-contrast modes, screen readers, non-color status indicators.
- **NFR-8 Partial-connectivity operation.** Useful with limited integrations, metadata-only access, manual capture, and temporary outages.
- **NFR-9 Platform.** Desktop web application plus responsive mobile capture-and-review. No native mobile app before Phase 2. [ASSUMPTION: mobile delivered as responsive web/PWA in MVP and v1.0]

## 11. Privacy and Security Requirements

- **SEC-1 [MVP]** Strict separation between confidential work context (projects, customers, incidents, work messages) and private personal context (family, health scheduling, personal messages, household).
- **SEC-2 [MVP-seam / v1.0-full]** The planning layer is a **trusted component** with read access to both contexts — the user's own plan view necessarily joins work and personal (P9); the privacy boundary governs what *derived* context crosses into anything visible to third parties: drafts, notifications, shared surfaces, and communication. **MVP builds the seam:** every entity is context-tagged (work/personal), and all cross-context reads and outputs are recorded in a cross-context audit log (the SM-17 instrument). **v1.0 hardens the seam into the planning boundary broker:** third-party-visible outputs carry only minimal planning constraints — busy/unavailable windows, protection level, estimated duration, general urgency and consequence, user-approved summaries, decision-required flags. A work-visible draft says "unavailable after 4:05 PM — hard external commitment," never the child's name or school; a personal surface says "work may extend to 5:30 PM — high-priority escalation," never the customer or incident. (Mechanism detail in `addendum.md`; residual architecture question in OQ-9.)
- **SEC-3 [MVP]** Least-privilege access; OAuth or approved enterprise identity; source- and document-level permission respect; encryption; configurable retention; data deletion; audit history.
- **SEC-4 [all phases]** No training on customer data by default; explicit cross-context audit; unauthorized cross-context transfer target is zero (§5.2).
- **SEC-5 [v1.0+]** Document access modes: metadata only; user-curated; approved retrieval; enterprise-controlled processing; personal private mode. Regional data residency and local/VPC/enterprise-hosted/on-device processing options scale in with enterprise deployment (Phase 3).
- **SEC-6 [all phases]** Third-party dignity and minimization: the system stores only information necessary for planning, commitments, important dates, and user-defined intentions — and **emotionally consequential communication always requires human review before sending**, regardless of autonomy configuration.

## 12. Open Questions and Assumptions

Tracked for resolution; none blocks MVP build-start. OQ-1, OQ-3, and OQ-9 are **architecture-phase blockers** — they must be resolved by `bmad-architecture` before implementation begins.

1. **OQ-1 — AI infrastructure** — model/provider selection for extraction, interpretation, and planning; cost, latency, and privacy guarantees. Constrains NFR-2 and SEC-1. [architecture phase-blocker]
2. **OQ-2 — Effort-estimation bootstrap** — before the learning loop exists, initial estimates come from user input plus simple defaults [ASSUMPTION]; acceptable initial accuracy undefined.
3. **OQ-3 — Identity edge cases** — same email used across work/personal, or multiple work tenants: resolution flow undefined. Interacts directly with the SEC-2 context-tagging seam. [architecture phase-blocker]
4. **OQ-4 — Roster limits** — behavior when users exceed 5–15 people / 3–5 goals, and how importance decays over time.
5. **OQ-5 — Delegation acknowledgment in v1.0** — recipients have no accounts; how acceptance is detected (reply parsing? manual confirmation?) is undefined.
6. **OQ-6 — Policy template catalog** — which Life Operating Policy templates ship at v1.0 and how many (white-space policy examples in `addendum.md` seed this).
7. **OQ-7 — Business model** — B2C vs. B2B packaging, pricing, and how enterprise privacy architecture maps to commercial tiers. Deferred while product is in "me first" phase; note the funded-exit evidence in §6 bears directly on this. Revisit before any launch investment.
8. **OQ-8 — Onboarding time-to-value target** — maximum acceptable setup duration before first useful plan; MVP aims for first morning plan on day one with calendars + email only [ASSUMPTION].
9. **OQ-9 — Planner/boundary architecture** — precisely which components may hold joint work+personal context, and how the trusted planning layer (SEC-2) is isolated in multi-tenant and enterprise deployments. [architecture phase-blocker]
10. **OQ-10 — Extraction quality bar** — the MVP gate is behavioral (FR-15 rejection-rate fallback); numeric precision/recall targets for email request extraction are undefined.

**Assumptions index** (inline `[ASSUMPTION]` tags): §7.2 MVP wedge composition and calendar+email-first ingestion; §7.3 v0.2–v0.5 increment sequence; §8 journey narrative details; NFR-2 latency targets; NFR-9 responsive web/PWA mobile delivery; OQ-2 estimation bootstrap; OQ-8 day-one time-to-value.

## 13. Risks and Mitigations

1. **Excessive scope** — whole-life planning becomes too broad → keep the MVP wedge focused (§7.2); integrate existing tools rather than replacing them (§2.1).
2. **Poor inference quality** — misread requests, commitments, documents → show confidence; preserve evidence; make correction easy; require confirmation for consequential inference (FR-15, FR-41).
3. **Commitment inflation** — too many requests become obligations → separate requests from commitments; require acceptance; preserve decline and acknowledgment (FR-21, FR-23).
4. **False precision** — priority and effort estimates look more certain than they are → use ranges; show uncertainty; present scenarios; no opaque scores (FR-25, FR-61).
5. **Relationship overreach** — the product feels intrusive or mechanistic → user-defined intentions only; no scores; no emotional diagnosis; minimal third-party data; review for sensitive communication (P5, FR-12, SEC-6).
6. **User distrust** — the system appears controlling → user stays authoritative; explanations; approval for material changes; undo; exposed assumptions (P1, FR-57, FR-59, NFR-4).
7. **Goal overload** — decomposition creates too many tasks → limit active goals; generate only next meaningful actions; preserve white space (FR-38, FR-31).
8. **Behavioral overfitting** — temporary behavior becomes durable preference → repeated evidence required; confirm material learning; expiration and deletion (FR-53, FR-54).
9. **Excessive optimization** — life feels mechanized → protect white space; flexible intentions; opportunities, not obligations (P6, FR-31).
10. **Collaboration assumptions** — delegation treated as complete before acceptance → track acceptance state; preserve ownership until confirmed (FR-63–64).
11. **Notification overload** — the product becomes another interrupter → decision-oriented only; batch low priority; respect focus blocks (FR-56).
12. **Enterprise integration limits** — work data unavailable under security policy → metadata-only mode; approved enterprise deployments; manual capture; useful with partial visibility (SEC-5, NFR-8).
13. **Privacy leakage** — information crosses the work/personal boundary → context tagging and audit seam now, broker at v1.0; minimal summaries; explicit permissions; separate storage (SEC-1–2, SM-17).
14. **Source conflicts and stale documentation** — old or contradictory sources distort recommendations → freshness and authority tracking; conflict detection; confirmation when material; traceability (FR-43–44).

## 14. Glossary

- **Request** — a demand on the user's time that has not been accepted; carries no obligation.
- **Commitment** — a request whose responsibility, outcome, and expectations the user has accepted or negotiated (FR-21).
- **Interrupt** — any new demand arriving after the day's plan is approved.
- **Protection level** — one of: hard commitment, protected priority, flexible intention, optional opportunity (FR-3).
- **Life Operating Policy** — a user-defined rule the planner must obey (non-negotiables, work boundaries, relationship, health, emergency, overtime, delegation) (FR-4).
- **Boundary** — a constraint the system protects (e.g., the 4:30 PM hard stop, sleep window).
- **Rhythm** — a recurring intention, fixed or flexibly scheduled (weekly call, exercise cadence).
- **Relationship intention** — how the user wants to show up for a person; always user-defined, never scored.
- **Important date** — a date generating staged preparation and protected capacity (FR-11).
- **Capture item** — anything entered through the capture layer, pre-classification (FR-17–20).
- **Plan-diff** — the mechanical comparison showing exactly which blocks move and what the new work end is if a demand is accepted (§7.2 item 6).
- **Consequence checklist (P11)** — the six items shown whenever anything moves: what is displaced, who is affected, which goal loses time, whether a boundary is violated, whether finish time changes, whether another person must agree.
- **Context (work / personal)** — the two technically separated data domains of §11; every entity carries a context tag.
- **Planning boundary broker / seam** — the mechanism governing what derived information crosses contexts; seam (tagging + audit) at MVP, broker (constraint-only exchange) at v1.0 (SEC-2).
- **Autonomy ladder** — L0 observe → L1 surface → L2 recommend → L3 draft → L4 execute with approval → L5 execute automatically within policy (FR-57).
- **White space** — user-defined unstructured time the planner must not fill (P6, FR-31).
- **Displacement** — an existing plan item losing its slot to a new demand; always explicit, never silent (P10, FR-28).
- **Renegotiation** — explicitly agreeing on a new date/owner/scope with the affected stakeholder; moving a date alone does not qualify (FR-24).
- **Evidence / assertion** — a sourced statement with authority, freshness, and confidence metadata backing a recommendation (FR-43, FR-46).
- **Coverage** — which sources the plan can currently see, how fresh they are, and the known blind spots (FR-60).
- **Definition of done** — the completion criteria attached to an activity (FR-49).

---

*Companion documents: `addendum.md` (technical content, data model, evidence-drawer spec, landscape research, draft lineage) and `.memlog.md` (decision log) in this folder.*
