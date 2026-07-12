---
title: Draft-PDF → PRD Reconciliation
source: Life Focus Intelligence PRD.pdf (Master PRD v2.0, §1–§44)
target: prd.md + addendum.md
date: 2026-07-10
---

# Reconciliation: Source Draft PDF → prd.md + addendum.md

## Scope and method

Checked every numbered section of the source PDF (§1–§44) against prd.md and addendum.md.
The PRD's intentional restructuring (thin MVP wedge; draft §§ 39–40 MVP scope mapped to v1.0; Phases 2–4 deferred post-v1.0) was treated as correct and not flagged. Only content that appears in the PDF but is absent from or materially distorted in both target documents is reported.

---

## Material gaps

### GAP-1 — Non-Goals section entirely missing

**Draft:** §8 ("Non-Goals") lists 22 explicit exclusions. Selected items with legal, ethical, or scope-boundary consequence:

- Replace existing calendars, email, Slack, Jira, or task systems
- Become a complete project-management platform or general enterprise search engine
- Become a social network
- Diagnose relationship health / score affection or closeness
- Automatically make major life decisions
- Track every acquaintance
- Monitor keyboard activity or application usage
- Provide employee surveillance
- Fill every available minute / optimize the user solely for output
- Copy all enterprise or personal documents into a single unrestricted store / require data migration into a proprietary system
- Act as a therapist, physician, attorney, or financial adviser
- Infer sensitive traits without necessity
- Claim a complete understanding of the user's life

**Where it should live:** prd.md — a dedicated §8 Non-Goals section (or merged into §2 Problem or §7 Scope). These are boundary statements that constrain every feature team, design decision, and future legal/compliance review. They are as important as the goals they mirror.

**Severity:** Material. The absence means: (a) the scope fence is invisible to downstream consumers of the PRD; (b) "Act as therapist/attorney/financial adviser" and "infer sensitive traits" are standard product liability guardrails absent from the contract; (c) "Monitor keyboard activity / provide employee surveillance" appears nowhere, which could lead to misimplementation.

---

### GAP-2 — Emotional and experiential design goals (§6) reduced to three phrases

**Draft:** §6 ("Experience and Emotional Design Goals") provides explicit word-level design vocabulary in two lists:

**Should feel:** Calm, Intelligent, Warm, Human, Disciplined, Trustworthy, Premium, Focused, Reassuring, Decisive without being controlling.

**Should NOT feel like:** A corporate admin dashboard, A crowded project-management tool, An inbox, A contact CRM, A colorful consumer task application, A gamified self-improvement product, A relationship-scoring system, A chatbot without structure, An autonomous black box, A system designed to maximize productivity at all costs.

**Where it is in the PRD:** §3 Vision captures three of the "should not feel" items in a single clause: "The product must not feel like a corporate dashboard, a gamified self-improvement app, or an autonomous black box." The affirmative list (calm, warm, intelligent, premium, etc.) and the remaining seven "should not feel" items (crowded PM tool, inbox, CRM, colorful consumer task app, chatbot without structure, relationship-scoring system, optimize-at-all-costs) are absent from both prd.md and addendum.md.

**Where it should live:** prd.md §3 (Vision and Product Principles), extended. The full §6 design vocabulary is a first-class UX brief that constrains visual design, interaction design, copy, and notification behavior. It should not require a reader to have the draft PDF to discover it.

**Severity:** Material. UX designers and frontend engineers working only from prd.md will lack the explicit design vocabulary. "Calm," "warm," "premium," "reassuring," and "decisive without being controlling" carry significant visual and copy direction. "A chatbot without structure" and "a relationship-scoring system" are distinct failure modes not mentioned anywhere in the PRD.

---

### GAP-3 — Foundational Product Principles: 10 of 17 absent

**Draft:** §11 lists 17 numbered, binding product principles (§§11.1–11.17). The PRD distills these to 7 (P1–P7). Ten principles are absent from both prd.md and addendum.md in any stated form:

| Draft principle | Status in PRD/addendum |
|---|---|
| §11.1 "The recommendation is the product" — every primary experience should help the user decide, execute, communicate, protect, renegotiate, or close an open loop | Not stated; partially implied in §9 FRs |
| §11.2 "The whole life shares one capacity pool" — work and personal life cannot be planned independently because they consume the same finite time and energy | Not stated as a principle; implied in §2 Problem |
| §11.3 "Requests are not commitments" | Not stated as a principle; covered in FR-21 |
| §11.4 "People are active planning entities" — important people can create commitments, rhythms, shared responsibilities, important-date workflows, care actions, protected time, and relationship goals | Not stated |
| §11.5 "Important goals must generate action" | Not stated as a principle; covered in FR-38 |
| §11.6 "Time boundaries are real constraints" — overcommitment must not be silently solved through overtime, lost sleep, or canceled personal priorities | Not stated |
| §11.8 "Planning must lead to execution" — the product should reduce activation energy after the user accepts a plan | Not stated; covered in §9.10 FRs |
| §11.9 "Consequences must be visible" — when an item moves, show: what is displaced, who is affected, which goal loses time, whether a boundary is violated, whether the finish time changes, whether another person must agree | Partially in UJ-2 and FR-35; the six-item checklist is not a stated binding constraint |
| §11.11 "Feasibility includes more than time" — actions may require location, device, network, materials, money, privacy, energy, emotional readiness, another person's availability, business hours | Covered in FR-26 and FR-27; not a stated binding principle |
| §11.12 "Other people's time is not freely available" — delegation and household responsibility transfers remain incomplete until accepted | Covered in FR-64–65; not a stated principle |

**Where it should live:** prd.md §3 (Vision and Product Principles). Principles marked "binding on all features" in the draft are lost when collapsed; they cannot be recovered from scattered FRs because FRs are scoped to specific capabilities, not cross-cutting constraints.

**Severity:** Material for §§11.1, 11.2, 11.6, 11.9. Minor for the rest (covered in FRs). §11.9's six-item consequence checklist is especially important: it is the testable definition of what "show the tradeoff" means, and it does not appear in the PRD's stated requirements or addendum.

---

### GAP-4 — Primary Interface Architecture (§34) and Interface Design Requirements (§35) entirely absent

**Draft:** §34 names 13 primary interface surfaces and states the question each surface answers:

1. Today — "What matters now? What should I do next? What is protected? What is at risk? When does work end? What personal commitments follow?"
2. Morning Plan
3. Interrupt Decision
4. Week
5. People
6. Goals
7. Commitment Ledger
8. Capture Inbox
9. Focus Context
10. Policy and Boundaries
11. Context Review
12. Learning Review
13. End-of-Day Review

**Draft:** §35 adds:
- Visual hierarchy: 7-level precedence (current decision > recommendation > reason > person/goal/commitment protected > consequence > confidence/evidence > full source detail)
- Progressive disclosure principle: default view shows only what is needed to decide; detailed evidence remains expandable
- Evidence drawer spec: source badges, confidence, last verified time, expandable evidence, assumptions, conflicts, corrections
- Extended preferred/forbidden language lists (longer than what appears in PRD §3 Voice)

**Where it is in the PRD/addendum:** The named screens are absent from both documents. The visual hierarchy, progressive disclosure, and evidence drawer spec are absent. PRD §3 captures a subset of the preferred/forbidden language.

**Where it should live:** Interface architecture and visual hierarchy belong in prd.md as UX requirements (perhaps a new §10 Interface Architecture section). The evidence drawer spec is an implementation-level detail that belongs in addendum.md. The preferred/forbidden language should be extended in PRD §3.

**Severity:** Material. UX designers have no named screen inventory, no visual hierarchy spec, and no evidence drawer spec from the PRD. The 13 named surfaces are important enough that UX work will likely re-derive them inconsistently without the draft PDF.

---

### GAP-5 — Key Risks and Mitigations section (§42) entirely absent

**Draft:** §42 enumerates 14 product risks with explicit mitigations:

1. Excessive scope → keep MVP focused; integrate don't replace
2. Poor inference quality → show confidence; make correction easy; require confirmation
3. Commitment inflation → separate requests from commitments; require acceptance
4. False precision → use ranges; show uncertainty; avoid opaque scores
5. Relationship overreach → use user-defined intentions; avoid scores; avoid emotional diagnosis; minimize third-party data; require review for sensitive communication
6. User distrust → keep user authoritative; require approval for material changes; support undo; expose assumptions
7. Goal overload → limit active goals; generate only next meaningful actions; preserve white space
8. Behavioral overfitting → require repeated evidence; confirm material learning; support expiration and deletion
9. Excessive optimization → protect white space; present opportunities not obligations
10. Collaboration assumptions → track acceptance state; preserve ownership until confirmed
11. Notification overload → batch low-priority; respect focus blocks
12. Enterprise integration limitations → support metadata-only; manual capture; remain useful with partial visibility
13. Privacy leakage → federated architecture; minimal summaries; explicit permissions; audit; separate storage
14. Source conflicts and stale documentation → track freshness; detect conflicts; require confirmation; preserve traceability

**Where it should live:** prd.md as a §10 or §12 Risks section. This is standard PRD content and informs QA, security review, and stakeholder conversations. Risks 4 ("false precision"), 5 ("relationship overreach"), 6 ("user distrust"), and 13 ("privacy leakage") are especially important for a product of this nature.

**Severity:** Material. Without this section, teams assessing launch readiness, writing security reviews, or planning QA test strategy lack the explicit risk register.

---

### GAP-6 — Third-party dignity requirement (§33.7) absent

**Draft §33.7:** "The system should store only information necessary for planning, commitments, important dates, and user-defined intentions. Emotionally consequential communication must require review."

**Where it is in the PRD/addendum:** The data minimization part is partially covered in NFR-6 and SEC-3. The specific requirement "emotionally consequential communication must require review" is absent from both documents.

**Where it should live:** prd.md §11 Privacy (appended to SEC-3 or as SEC-5), or added to FR-48 (execution actions) and FR-64 (delegation).

**Severity:** Material. This is a concrete guard against the product drafting and sending sensitive relationship messages without approval — a distinct failure mode from the general autonomy controls. It should be an explicit requirement, not implied.

---

### GAP-7 — Two emotional outcomes missing from Vision (§5)

**Draft §5:** The product should make the user feel: "Clear about what to do next" and "Aware of tradeoffs before making them."

**Where it is in the PRD:** PRD §3 lists six emotional outcomes but omits these two. Both are recoverable from context (UJ-2 and FR-35 demonstrate tradeoff awareness; FR-34 demonstrates next-action clarity), but they are absent from the stated aspirational outcomes.

**Where it should live:** prd.md §3 Vision emotional outcomes list.

**Severity:** Minor. Conceptually implied but should be explicit as they are the most testable emotional outcomes in the product.

---

## Minor gaps

### GAP-8 — "Customer-facing professionals" omitted from persona examples (§9.1)

**Draft §9.1:** The primary persona example list includes "Customer-facing professionals." PRD §4 lists: executives, founders, consultants, technical leaders, product managers, program managers, senior ICs, parents with demanding careers. "Customer-facing professionals" is dropped. This is a commercially relevant segment (account executives, customer success managers, solutions engineers).

**Where it should live:** prd.md §4 Users, primary persona examples.

**Severity:** Minor.

---

### GAP-9 — Core Product Promise sub-promises (§3) absent

**Draft §3** contains three supporting promises in addition to the main promise:

> "Know what matters now, what can wait, what is being neglected, and what will be displaced when priorities change."

> "Important goals, people, commitments, and responsibilities should not depend solely on the user remembering them at the right moment."

> "Overcommitment must be represented as a decision, not hidden inside an unrealistic schedule."

**Where it is in the PRD:** The main promise is rendered as the central question in §1 and the principles in §3. The three sub-promises are not stated anywhere. The second ("should not depend solely on the user remembering") is the core value proposition of the commitment and relationship system; the third ("overcommitment must be a decision, not hidden") is a concrete behavioral claim.

**Where it should live:** prd.md §3 Vision and Product Principles (or §1 Executive Summary as supporting promises). The third sub-promise could also appear as context in FR-28.

**Severity:** Minor. These read as messaging/positioning copy but also anchor specific behavioral requirements.

---

### GAP-10 — Example learned observations (§28.2) not preserved

**Draft §28.2** gives five concrete examples of learned system observations (e.g., "Customer investigations estimated at one hour average two hours," "Architecture reviews require at least 90 uninterrupted minutes," "Work scheduled after 3:30 PM is rarely completed on meeting-heavy days"). These examples make the learning loop requirement concrete and testable.

**Where it should live:** addendum.md §8 (or a new §9 Learning examples). These are implementation-guidance examples, not requirements.

**Severity:** Minor.

---

### GAP-11 — §11.9 consequence checklist not surfaced as a binding requirement

**Draft §11.9:** "When an item moves, the system must show: what is displaced, who is affected, which goal loses time, whether a boundary is violated, whether the finish time changes, whether another person must agree."

**Where it is in the PRD:** Partially in UJ-2 (narrative) and FR-35 (interrupt loop). However, the six-item checklist is not stated as a binding cross-feature requirement. FR-59 ("every automatic or consequential action provides: reason, supporting policy, evidence, audit history, undo, clear disclosure, and notification") is related but different.

**Where it should live:** prd.md §9.6 (Prioritization, capacity, and planning) or as an addition to FR-28 or FR-30. The six-item checklist is the testable acceptance criterion for "show the tradeoff."

**Severity:** Minor (items are implied across multiple FRs but not as a consolidated cross-feature rule).

---

## Cosmetic gaps

### GAP-12 — Specific white-space policy examples from §31.2 not preserved

**Draft §31.2** gives five example white-space policies (e.g., "Keep one evening per week unplanned," "Do not fill every weekend opening," "Preserve 30 minutes between work and family," "Keep 10% of the week unallocated," "Protect one weekend morning for spontaneous family activity"). FR-31 covers white-space protection in principle but not with these specific examples.

**Where it should live:** addendum.md as white-space policy template examples, to inform the policy template catalog (OQ-6).

**Severity:** Cosmetic.

---

### GAP-13 — "Emotionally" in UJ-3 timing context (cosmetic discrepancy)

The draft UJ-3 narrative occurs at 5:25 PM (hard stop 5:30 PM); PRD UJ-3 is at 3:55 PM (hard stop 4:30 PM). This reflects a deliberate persona adjustment for the founding user (Sean's 4:30 hard stop). Not a gap — noted for completeness.

**Severity:** Cosmetic / intentional.

---

## Gap count summary

| Severity | Count |
|---|---|
| Material | 7 (GAP-1 through GAP-7) |
| Minor | 4 (GAP-8 through GAP-11) |
| Cosmetic | 2 (GAP-12 through GAP-13) |
| **Total** | **13** |

---

## Priority order for remediation

1. **GAP-1** (Non-Goals) — highest-priority addition; single dedicated section, copy-adaptable from draft §8
2. **GAP-2** (Emotional design vocabulary) — extend PRD §3 Voice; critical for UX team
3. **GAP-4** (Interface architecture + design requirements) — add screen inventory to prd.md; move evidence drawer to addendum
4. **GAP-5** (Risks and mitigations) — add as PRD §12 or append to §12 Open Questions
5. **GAP-3** (Collapsed principles) — add the 10 missing principles to PRD §3; most important are §§11.1, 11.2, 11.6, 11.9
6. **GAP-6** (Third-party dignity / emotionally consequential communication) — single sentence addition to SEC-3
7. **GAP-7** (Two emotional outcomes) — two-line addition to PRD §3
