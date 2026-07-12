# Life Focus Intelligence — PRD Addendum

Depth preserved for downstream documents (architecture, solution design, UX spec). Not part of the PRD contract.

## 1. Source draft lineage

The PRD distills **Master Product Requirements Document v2.0** (canonical), which superseded: the original whole-life planning PRD, the Documentation/Knowledge/Evidence Layer amendment, and the Closed-Loop Life Operating System Foundations amendment. The source draft's section numbering (1–44) is referenced in `.memlog.md` entries where applicable.

## 2. Data model (for architecture phase)

**Core entities (draft §22.8):** Person, Relationship intention, Life domain, Goal, Responsibility, Boundary, Rhythm, Important date, Request, Commitment, Work item, Interrupt, Time block, Plan, Decision, Plan change, Document, Evidence, Assertion, Source conflict, Context snapshot, Resource, Policy, Delegation, Capture item.

**Layered context model (draft §22.1–22.7):**

| Layer | Contents |
|---|---|
| User intention | Life domains, goals, relationship intentions, responsibilities, boundaries, rhythms, preferences |
| Operational | Tasks, meetings, messages, projects, incidents, deadlines, interrupts, current statuses |
| People | Family, friends, stakeholders, customers, collaborators, delegation candidates, people waiting on / affected by the user |
| Evidence | Documents, assertions, decisions, commitments, dependencies, risks, status changes, authority, freshness, confidence |
| Capacity & feasibility | Time, energy, focus, travel, location, devices, business hours, materials, others' availability, buffers, boundaries |
| Policy | Conflict rules, emergency rules, overtime rules, autonomy, white-space rules, privacy boundaries |
| Planning | Daily plan, weekly allocation, scenarios, displaced work, affected people, goal impact, boundary impact, finish-time impact |

**Person fields (draft §14.1)** and **commitment fields (draft §18.3)** are enumerated in PRD FR-8 and FR-22.

**Household-partner anticipation:** the data model must anticipate the future household planning partner persona (shared responsibilities, responsibility transfers, partner agreement on reassignment) without building collaboration in v1.0. Which fields are required now vs. later is an open architecture question.

## 3. Privacy boundary broker (mechanism sketch, draft §33)

- Work context container: work projects, customers, technical docs, incidents, work messages, enterprise tasks, confidential commitments.
- Personal context container: family details, personal goals/docs, household responsibilities, personal relationships, health-related scheduling, personal messages.
- Broker passes only: busy/unavailable window, protection level, estimated duration, general urgency, general consequence, user-approved summary, decision-required flag.
- **Document access modes (draft §33.6):** metadata only (title/owner/type/updated/classification/link); user-curated (explicit selection/upload); approved retrieval (relevant passages on demand); enterprise-controlled processing (retrieval + inference inside enterprise infrastructure); personal private mode (encrypted, separately controlled).
- **Processing deployment options:** local, VPC, enterprise-hosted, on-device — architecture must keep these paths open even though MVP ships single-tenant cloud [assumed].

## 4. Evidence authority order (draft §21.5, configurable default)

1. Explicit user correction → 2. Current operational status → 3. Approved decision record → 4. Current source-of-record milestone → 5. Approved project brief → 6. Current meeting decision → 7. Draft documentation → 8. Historical notes → 9. Unverified inference.

## 5. Integration inventory

| Ring | Sources | Phase |
|---|---|---|
| 1 | Work Google Calendar, personal Google Calendar, work Gmail, personal Gmail | MVP |
| 2 | Slack (work interrupts), Jira (work items/incidents), personal task app, Apple ecosystem (Calendar/Reminders; iMessage likely API-constrained — verify feasibility) | v1.0 |
| 3 | Meeting notes, selected documents, browser extension, share sheet, email forwarding, API input | v1.0 |
| 4 | Calendar/task write-back, enterprise document systems | Phase 2–3 |

Founding-user stack (confirmed 2026-07-10): work = Google Workspace + Slack + Jira; personal = Gmail/GCal + Apple ecosystem + a task app; employer permits full connection.

## 6. Draft MVP acceptance criteria

The source draft (§40) defines a 32-step canonical verification journey (connect sources → life model setup → daily plan → interrupt → delegation → focus block → evidence review → source conflict → learning → privacy separation → end-of-day). These steps map to **v1.0** acceptance in this PRD's phasing. The MVP wedge verifies the subset covering §7.2 items 1–8. Recommend regenerating a scoped MVP acceptance list during epic creation.

## 7. Competitive landscape (research digest, 2026-07)

| Product | Positioning | Loop coverage | Gap vs. LFI |
|---|---|---|---|
| Motion | "AI Employee SuperApp," auto-scheduling | Sense(cal)→interpret→act | No email/Slack sensing, silent moves, no learn; pivoting to SMB teams |
| Reclaim.ai | AI calendar defending focus/habits | Sense(cal/tasks)→act | Manual priorities, silent rescheduling, merges work+life (no privacy wall) |
| Sunsama | Calm planning ritual | Sense; human decides | No AI; best-in-class intentionality philosophy |
| Akiflow | Unified task command center | Sense only | Aggregator, not planner |
| Morgen | AI proposes, human approves | Sense→interpret→suggest | Closest philosophical match; no tradeoff view or learning |
| Amie | Joyful calendar + contacts | Light sense/interpret | Relationship context without planning |
| Lindy.ai | AI exec-assistant agents | Sense(email/Slack)→act | Acts without planning/tradeoff layer or boundaries |
| Vellum / alfred_ / Read AI | AI chief-of-staff briefings | Sense→interpret→propose | Digest-first, no closed loop, no personal-life scope |
| Claryti | Commitment extraction from meetings/email | Sense→interpret | Passive ledger; no plan generation |
| Saner.AI | ADHD-friendly day building | Sense→decide | Niche; no boundaries/learning/privacy split |
| Clay / Dex / Monica | Personal CRMs | Sense(contacts)→nudge | Nudges siloed from the daily plan |

**Key insights:** the full sense→interpret→decide→act→learn loop is closed by no current product; tradeoff-aware planning, work/personal privacy separation, and relationship stewardship in-plan are unoccupied; agentic morning briefings (ChatGPT Pulse, Google "Your Day Ahead") validate the sense→propose pattern but stop at digests; funded players are vacating individual whole-life planning (Clockwise shut down post-acquisition; Motion moving upmarket); human-in-control is a differentiator, not table stakes.

**Abandonment drivers to design against:** trust erosion from one bad action (→ conservative autonomy, zero-boundary-violation target); noise amplification (→ decision-oriented notifications only); setup tax (→ day-one value from calendars+email); plans ignoring whole-person reality (→ capacity/energy model); integration rot (→ active sync-health monitoring).

## 8. Interface detail (for UX phase)

Complements PRD FR-67/68. From draft §34–35:

- **Evidence drawer** — every major recommendation includes: source badges, confidence, last verified time, expandable evidence, assumptions, conflicts, corrections.
- **Surface inventory** — the 13 named surfaces (PRD FR-67) with the question each answers; Today is the primary daily operating surface ("What matters now? What should I do next? What is protected? What is at risk? When does work end? What personal commitments follow?").
- **Additional forbidden term** — "knowledge-graph score" (alongside the PRD §3 forbidden list).

## 9. Learning-loop example observations (draft §28.2)

Concrete targets that make FR-37/FR-52 testable: "Customer investigations estimated at one hour average two hours"; "Architecture reviews require at least 90 uninterrupted minutes"; "Work scheduled after 3:30 PM is rarely completed on meeting-heavy days"; plus per-type duration bias and transition-time patterns.

## 10. White-space policy template seeds (draft §31.2, feeds PRD OQ-6)

Keep one evening per week unplanned · do not fill every weekend opening · preserve 30 minutes between work and family · keep 10% of the week unallocated · protect one weekend morning for spontaneous family activity.

## 11. Deferred / set-aside items

- **Enterprise architecture detail** (regional residency, on-device processing, federated agents): keep as Phase 3–4 constraints; no MVP/v1.0 design needed beyond not foreclosing them.
- **Business model / pricing:** deliberately deferred while in "me first, product later" mode (PRD OQ-7).
- **Latency SLA numbers:** PRD NFR-2 carries assumed targets; validate during architecture.
