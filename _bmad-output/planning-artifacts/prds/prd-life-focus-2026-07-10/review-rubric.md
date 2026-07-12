# PRD Quality Review — Life Focus Intelligence

Reviewed: `prd.md` + `addendum.md` (2026-07-10). Calibration: founding-user-first, commercial-later; PRD is the durable spec for a solo build now and a launch later; MVP wedge deliberately thin, v1.0 deliberately exhaustive; §12 Open Questions and `[ASSUMPTION]` tags are known and tracked.

## Overall verdict

This is a strong PRD with a real thesis — tradeoff-aware, boundary-respecting planning as the unoccupied market position — and unusually honest scope machinery: an explicit conflict-resolution order, a defended MVP wedge, counter-metrics that punish winning the wrong way, and permanent exclusions stated as decisions. The risk is concentrated almost entirely in downstream usability: no Glossary, no Assumptions Index, no MVP-scoped acceptance set, and an undifferentiated 50-FR v1.0 bucket mean the UX/architecture/epics workflows will have to reconstruct structure the PRD already implies but doesn't expose. Fix the extraction surface and this PRD is green-light quality.

## Decision-readiness — strong

Decisions are stated as decisions. §1 opens with a six-level conflict-resolution priority order, which is rare and genuinely load-bearing (it resolves, e.g., automation vs. explainability without a meeting). §7.2 defends the MVP wedge with named optimization criteria ("time-to-first-value in days, not weeks — setup tax is the #1 abandonment driver") and an explicit defer list; §7.3 names v1.0 exclusions including one permanent one ("relationship scoring (excluded permanently)"). FR-57 pins MVP autonomy at "L2–L4 only" — a real posture decision, not a consideration. §12 open questions are genuinely open and tiered ("none blocks MVP build-start except OQ-1").

Two soft spots. First, the v1.0 bucket: every one of ~50 `[v1.0]` FRs carries identical priority. The exhaustiveness is deliberate (it preserves the source draft), but for a solo builder the distance from MVP to "everything in §9" is enormous and the PRD offers no internal ordering — the first post-MVP planning session will have to invent a sequence with no PRD guidance. Second, one open question looks mis-tiered (see finding below). There are no `[NOTE FOR PM]` callouts anywhere; for a self-authored PRD the §12 register carries most of that load, so this is a note, not a finding.

### Findings
- **medium** v1.0 has no internal sequencing (§9, §7.3) — All v1.0 FRs are peers; "v1.0 — complete product. Everything in §9" gives the solo build no order of attack between the MVP wedge and ~50 requirements. *Fix:* add a coarse tier or dependency note (e.g., v1.0-early: FR-15, FR-24-full, FR-32 additions, FR-37; v1.0-late: delegation §9.15, documents §9.9) or a one-paragraph sequencing principle in §7.3.
- **medium** OQ-3 (identity edge cases) is under-tiered (§12) — §12 says only OQ-1 blocks architecture, but the privacy boundary broker (SEC-1/SEC-2, both `[MVP]`) presumes a clean work/personal identity partition; "same email used across work/personal, or multiple work tenants" breaks that partition's keying. Safe for the founding user (distinct accounts, confirmed stack in addendum §5), unsafe to leave untiered for the architecture phase. *Fix:* tag OQ-3 `[phase-blocker for architecture]` alongside OQ-1, noting it is founding-user-safe.

## Substance over theater — strong

Almost nothing here is furniture. The competitive section (§6 + addendum §7) is earned research: eleven named competitors with loop-coverage gaps, dated insights ("Clockwise shut down post-acquisition, Motion moving upmarket"), and abandonment drivers wired directly to specific sections. The principles are distinctive and binding — P4 names the differentiator, P5 draws a real ethical line ("never claim to know another person's internal state… No relationship scoring, ever"), P6 commits to non-optimization, and the Voice block's forbidden-language list ("productivity score, relationship health, optimized life") could not swap into another PRD. NFRs are mostly product-specific (NFR-3 ties commitment durability to connector failure; NFR-6 bans bulk indexing) and NFR-2 flags its assumed numbers honestly.

Four personas, within budget, and the founding user demonstrably drives decisions (integration Ring 1, MVP wedge shape). The one thin spot: the secondary persona.

### Findings
- **low** Secondary persona is inert (§4) — "Executive or founder… must avoid becoming a bottleneck" drives no FR, journey, or scope decision that the primary persona doesn't already drive; the delegation FRs (§9.15) never reference it. *Fix:* either cite it at FR-64/FR-66 as the motivating persona or fold it into the primary persona's examples list (where "executives, founders" already appear).

## Strategic coherence — strong

The PRD has a thesis and bets on it consistently: the closed Sense→Interpret→Decide→Act→Learn loop (P2) plus three unoccupied positions (§6: tradeoff-aware planning, privacy separation, relationship stewardship in-plan). The MVP wedge follows the thesis, not ease — "trust-first sequencing — the plan must prove it respects boundaries before it earns broader inputs and autonomy" (§7.2) is scope logic derived from the abandonment research. Success metrics validate the thesis rather than activity: plan accuracy, finish-time reliability, and interrupt decision rate instead of DAU. The counter-metrics (§5.3) are exceptional — "total daily time in the product should trend *down* after week 2" is the anti-engagement bet stated as a measurable guardrail, and "a single blown hard commitment destroys trust… target is zero" ties the #1 abandonment cause to a hard number.

One coherent-but-worth-naming tension: the learning loop is claimed as "near-universally missing" in the market (§6) yet deferred entirely out of MVP (§7.2). That's a defensible trust-first tradeoff and the deferral is explicit, so no finding.

## Done-ness clarity — adequate

The FRs lean heavily — and mostly successfully — on enumeration as testability: FR-18's twelve capture classes, FR-21's full lifecycle state machine, FR-22's commitment record fields, FR-56's explicit appropriate/prohibited notification lists, FR-57's autonomy ladder. FR-28's overcommitment behavior is a checkable behavioral contract ("never silently consumes sleep, family time, or recovery"). Some soft language even has bounds hiding elsewhere: FR-30's "minimizes unnecessary movement" is operationalized by the §5.3 replanning-churn counter-metric ("moved more than twice without user request").

But the dimension downstream stories lean on hardest has real gaps. The biggest: the MVP has no acceptance set of its own. Addendum §6 admits the source draft's 32-step verification journey "map[s] to **v1.0**" and recommends "regenerating a scoped MVP acceptance list during epic creation" — so the thing being built first is the only slice without a defined done-state, deferred to exactly the workflow that needs it as input. Second, the MVP north stars have targets but no measurement mechanism — "days the proposed plan is agreed to reflect the best use of time" (§5.2): agreed how, recorded where, prompted when? For an n=1 metric the capture ritual *is* the metric. And a handful of untestable triggers survive: FR-49 "when useful," FR-19 "materially affect planning," NFR-4 "wherever technically possible."

### Findings
- **medium** MVP wedge has no acceptance journey (§7.2, addendum §6) — the 32-step canonical journey is explicitly v1.0-scoped; MVP done-ness is deferred to epic creation, which will lean on this PRD to define it. *Fix:* add a ~10-step MVP acceptance journey to §7.2 (connect Ring-1 sources → life-model-lite setup → first morning plan with visible exclusions/finish time → capture → interrupt with tradeoff display → end-of-day roll-forward → audit trail check).
- **medium** North-star metrics lack a measurement mechanism (§5.2) — "agreed to reflect the best use of time" and "Morning approval time (median)" have no stated capture method (daily one-tap rating? instrumented timer?). For founding-user metrics, undefined capture means unmeasured metrics. *Fix:* one sentence per metric naming the instrument (e.g., end-of-day loop asks a single plan-accuracy question; approval time instrumented from plan-open to approve).
- **low** Residual untestable triggers — FR-49 "converts vague titles… when useful"; FR-19 "questions that materially affect planning" (the quoted example list partially rescues it); NFR-4 "reversible wherever technically possible." *Fix:* give FR-49 a trigger condition (e.g., title lacks a verb + object or user requests it); for NFR-4, enumerate the known-irreversible classes (sent messages, external side effects).

## Scope honesty — strong

The best-run dimension after coherence. Omissions are explicit at every level: §2's "What this product is not" list; §7.2's itemized "explicitly defers to v1.0" paragraph; §7.3's exclusion list with one permanent exclusion; §7.4's closing constraint ("Future capabilities must never compromise user authority…"). The 7 inline `[ASSUMPTION]` tags sit at genuinely uncertain points (the MVP wedge itself, NFR-2's invented latency numbers, the synthesized UJ narratives) rather than as decoration, and each states its provenance ("recommendation by Claude, approved direction 'thin it — you propose'; adjust freely on review"). Open-items density (8 OQs + 7 assumptions) is appropriate for founding-user stakes with an explicit "revisit before any launch investment" gate on OQ-7.

The one structural miss: the rubric's assumption contract is inline tags *indexed at the end*, and there is no Assumptions Index — 7 tags in prd.md plus a lowercase `[assumed]` in addendum §3 ("MVP ships single-tenant cloud") that is invisible to anyone reading only the PRD despite being an architecture-relevant assumption.

### Findings
- **medium** No Assumptions Index (§12 / end of PRD) — inline `[ASSUMPTION]` tags (§7.2 ×2, §8, NFR-2, NFR-9, OQ-2, OQ-8) are never rolled up, and addendum §3's single-tenant-cloud `[assumed]` lives outside the PRD contract entirely. Downstream reviewers cannot audit assumptions without a full re-read. *Fix:* add an Assumptions Index after §12 listing each tag with location and status; promote the single-tenant-cloud assumption into it.

## Downstream usability — adequate

This is a chain-top PRD — it explicitly feeds UX, architecture ("Belongs to the architecture phase," OQ-1), and epic creation (addendum §6) — so this dimension matters at full weight, and it's where the PRD underdelivers relative to its own quality. The good: FR-1–66, NFR-1–9, SEC-1–5, UJ-1–6 are contiguous, unique, and consistently phase-tagged; UJs have a named protagonist (Sean) with named counterparties (Priya, Marcus); the addendum cleanly separates architecture-phase material (entity catalog, broker mechanism, authority order) with draft-section lineage.

The gaps: **(1) No Glossary.** The PRD mints a dense domain vocabulary — Commitment Ledger, Capture Inbox, Life Operating Policies, protection level, hard commitment, protected priority, white space, autonomy ladder, planning boundary broker, context packet — defined in-place at first use (FR-3, FR-57, SEC-2) and then used bare everywhere else. A UX or epic workflow extracting §9.6 alone has no definition of "protected priority" without hunting for FR-3. **(2) Success metrics have no IDs** — the MVP table is unnamed rows and the "Full v1.0 metric set" is a single semicolon-run prose paragraph; nothing downstream can reference "the goal-activation metric" unambiguously. **(3)** One broken cross-reference, twice (mechanical notes).

### Findings
- **high** No Glossary (whole document) — for a chain-top PRD intended as the durable spec, every downstream workflow must reverse-engineer term definitions from scattered FRs; this is the single change with the most downstream leverage. *Fix:* add a Glossary section defining ~15 minted terms (protection level + its four values, Commitment Ledger, Capture Inbox, Life Operating Policy, white space, autonomy ladder L0–L5, planning boundary broker, context packet, coverage indicator, interrupt, rhythm), each pointing at its owning FR.
- **medium** Success metrics unaddressable (§5.2) — MVP metrics are unnamed table rows; the v1.0 set is one prose block ("adds): planning-overhead reduction…; commitment accuracy…; retention…"). Epics and analytics work cannot cite them. *Fix:* assign SM-1…SM-n IDs and break the v1.0 set into a list or table.

## Shape fit — strong

The shape matches the product and the stakes. A consumer-grade personal product with meaningful UX gets load-bearing UJs (six, protagonist-named, each demonstrating a specific capability against the thesis — UJ-2 is the differentiator P4 dramatized); the deliberate hybrid of "founding user now / commercial later" is handled structurally through phasing rather than by pretending to one audience. The §9 capability-spec density suits the stated purpose of preserving the source draft, and the PRD is honest that the remaining core jobs "are specified as functional requirements in §9 and follow the same pattern" rather than padding out UJ-7 through UJ-12. The addendum split is the right call: architecture-phase material (data model, broker mechanism, authority order, integration rings) is preserved without bloating the PRD contract. No findings.

## Mechanical notes

- **Broken cross-reference, ×2:** §5.3 ("decision-oriented notifications only (§9.15)") and §6 ("decision-oriented notifications (§9.15)") both point at §9.15 *Shared responsibility and delegation*; Notifications is **§9.12**. Looks like section-renumbering residue. Fix both.
- **Assumptions Index roundtrip:** fails — no index exists (see scope-honesty finding). Inline tags: §7.2 header, §7.2 item 2, §8, NFR-2, NFR-9, OQ-2, OQ-8; plus lowercase `[assumed]` in addendum §3.
- **ID continuity:** FR-1–FR-66 contiguous and unique across §9.1–§9.15; NFR-1–9, SEC-1–5, UJ-1–6, OQ-1–8 all clean. Verified §5.3→§9.6 (replanning churn) and §6→§9.1/§9.13/§9.14 references resolve correctly.
- **Phase-tag vocabulary drift (low):** FR tags use several ad-hoc variants — `[MVP-lite / v1.0-full]` (FR-8), `[MVP-flag / v1.0-full]` (FR-24), `[MVP-day / v1.0-all]` (FR-29), `[MVP-basic / v1.0-full]` (FR-60), `[all phases]` (FR-12, FR-54), `[v1.0+]` (SEC-5). Each is individually clear; downstream automated extraction would benefit from a legend at the top of §9.
- **UJ protagonists:** all six UJs carry Sean inline with context; no floating UJs.
- **Glossary drift:** cannot be assessed against a Glossary (none exists), but in-text usage is notably consistent — "hard commitment," "protected priority," "white space," and "Commitment Ledger" are used identically throughout; no case/synonym drift observed.
- **Required sections:** all present for the stakes and product type except Glossary and Assumptions Index (covered above).

---

**Finding totals:** critical 0 · high 1 · medium 6 · low 2
