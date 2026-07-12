# Adversarial Review — Life Focus Intelligence PRD

**Reviewer stance:** hostile. **Documents:** `prd.md`, `addendum.md` (2026-07-10). **Question asked:** does this survive as a *build contract* for one technical founder?

**Verdict:** No — not as written. This is an eloquent vision document wearing a PRD's clothes. The MVP wedge hides the two hardest problems in the entire product (interrupt tradeoff simulation and realistic capacity modeling) inside innocuous-looking bullet points; the success metrics are self-graded and largely unmeasurable with the sensing the MVP actually has; "v1.0" is a multi-year program labeled as one release; and the MVP ships with literally zero acceptance criteria (the addendum admits this and punts it to "epic creation"). The prose discipline is genuinely good — principles, counter-metrics, phasing tags — which makes the structural dishonesty about effort harder to spot, not easier.

---

## CRITICAL

### C1. MVP item 6 is the entire product in a trench coat
**Location:** §7.2 item 6, FR-35 [MVP], FR-25 [MVP]

The "interrupt assessment" bullet reads like one feature among eight. Unpack FR-35, which is tagged [MVP] in full: capture, *interpret the requested outcome*, check for existing commitments, link people/projects/goals, *estimate effort, urgency, uncertainty*, check policy and feasibility, *compare against the active whole-life plan*, ***simulate responses***, recommend among six action types, show professional and personal consequences, replan, preserve displaced commitments, help communicate changes. That is: NL intent interpretation, effort estimation, constraint solving, and counterfactual plan simulation — the four hardest AI/engineering problems in the document — all inside one MVP bullet. UJ-2 ("~90 min estimate, displacement chain, feasibility of Marcus's Friday commitment if moved to tomorrow 9 AM") is a demo of a mature planning engine, not a wedge.

Worse, the MVP interrupt loop *recommends actions the MVP cannot support*: "delegate" is one of the six recommendations, but delegation drafting is explicitly deferred (§7.2 deferral list) and the entire delegation model (FR-63–66) is v1.0. And effort estimation has no basis: the learning loop (FR-37, FR-52) is v1.0 and OQ-2 admits the bootstrap is undefined "user input plus simple defaults." So MVP interrupt assessment = the system asking the user for the estimate, then doing arithmetic against calendar blocks. Fine! But then *write that*, because what's written is a promise the founder will spend six months failing to keep.

**Fix:** Rewrite §7.2 item 6 and FR-35 as an MVP-honest version: user-supplied or template effort estimates; plan-diff view ("if this goes here, these blocks move, work ends at X") computed mechanically; recommendation set reduced to do-now / schedule / acknowledge / decline; "simulate responses" and "delegate" moved to v1.0. Keep the tradeoff *display* (the differentiator) — cut the tradeoff *inference*.

### C2. The success metrics are self-graded vibes with no instrumentation, and the MVP has no acceptance criteria at all
**Location:** §5.2, §5.3; addendum §6

Go metric by metric. **Daily plan accuracy: "days the proposed plan is agreed to reflect the best use of time"** — agreed by whom? The founding user, grading the product he's building, against a counterfactual nobody can observe. This is a mood ring. **Finish-time reliability** — requires knowing when work *actually* ended; nothing in the MVP ingestion ring (two calendars, two inboxes) senses actual stop time, and no time-tracking exists anywhere in scope. **Interrupt decision rate ≥95%** — the denominator is *captured* interrupts, and MVP capture of Slack demands is manual (§7.2 item 2). The metric is trivially gamed by not capturing: every uncaptured interrupt improves the score. **Morning approval time <10 min** — measured with what? A session timer isn't specified; self-report isn't a measurement.

Meanwhile the addendum (§6) concedes the draft's 32-step acceptance journey "maps to v1.0" and "recommend[s] regenerating a scoped MVP acceptance list during epic creation." Translation: **the build contract's MVP has zero acceptance criteria**, deferred to a downstream artifact. A PRD whose MVP can be neither accepted nor measured is not a contract; it's an aspiration with tables.

**Fix:** For each MVP metric, specify instrument + denominator + who records it (e.g., in-app plan-approval timestamp pair for approval time; explicit "work ended" tap in end-of-day review for finish time; capture-inbox count as the interrupt denominator *and acknowledge the manual-capture bias in a footnote*). Replace "agreed to reflect the best use of time" with a fixed 3-question end-of-day rubric. Write 10–15 MVP acceptance criteria into §7.2 now, in this document.

### C3. "v1.0" is two to three years of solo work labeled as one release
**Location:** §7.3, §9 throughout, addendum §5

Count what v1.0 adds over MVP: four-plus new integrations including the Apple ecosystem — where the addendum itself admits iMessage is "likely API-constrained — verify feasibility" (i.e., a scoped-in integration whose feasibility is unknown); request/action extraction across ten intent categories (FR-15); a document-intelligence layer with authority ordering, freshness metadata, and conflict surfacing (FR-41–45); a learning and calibration engine across twelve learnable dimensions (FR-52); goal decomposition with allocation tracking (FR-38–40); staged important-date workflows scaling by six variables (FR-11); weekly and live-day operating loops (FR-33–34); a delegation lifecycle for recipients *who have no accounts*, with acceptance detection undefined (FR-64 + OQ-5); context packets (FR-47); and a fully configurable autonomy matrix across eight dimensions (FR-58). Each of those is a quarter-to-multi-quarter effort for one person, *after* the MVP proves out.

The tell is §7.3's own phrasing: v1.0 "incorporates the entirety of the source draft's MVP scope plus its core capability sections." The document preserved the source draft's maximalism by renaming it, not by scoping it. As a contract, "v1.0" therefore means nothing: no build sequence, no priority among the ~40 v1.0 FRs, no interim milestones. The founder will hit month 4, look at §9, and have no idea what's next.

**Fix:** Either (a) decompose v1.0 into v0.2/v0.3/v0.4 increments with a theme and acceptance gate each (e.g., v0.2 = Slack/Jira + live-day loop; v0.3 = learning loop; v0.4 = evidence layer), or (b) redefine v1.0 as "commercial launch minimum" and explicitly push FR-41–45 and FR-63–66 to v1.x. Right now §7.3's "complete product" framing is the single biggest threat to this PRD ever describing shipped software.

---

## HIGH

### H1. FR-26 [MVP] demands capacity inputs the MVP cannot sense
**Location:** FR-26, §7.2 items 2 and 5, FR-37/FR-52 [v1.0]

FR-26 — tagged [MVP] without qualification — requires energy constraints (deep-work periods, low-energy periods, meeting-load fatigue, recovery) and resource constraints (location, device, access, materials, another person's availability). The MVP ingests two calendars and two inboxes. Where does fatigue come from? Location? Materials? The learning loop that could infer any of this is v1.0. As written, FR-26 is unbuildable at MVP; what will actually ship is static user-configured buffers and time windows — which is perfectly adequate, but then the FR is dishonest about what "realistic capacity" means at MVP, and P3 ("never presents incomplete context as complete") is violated by the PRD itself.

**Fix:** Split it. FR-26a [MVP]: time constraints + user-declared energy windows + fixed configurable reserves (interrupt reserve, transition buffer). FR-26b [v1.0]: inferred energy/resource constraints via the learning loop. One sentence of honesty saves a month of scope confusion.

### H2. The privacy broker at MVP is theater — and the PRD never says which component sits astride the boundary
**Location:** §11 SEC-1/SEC-2 [MVP], §5.2 cross-context metric, UJ-2, addendum §3

At MVP there is one user, one deployment, one pair of eyeballs that sees both contexts anyway. There is no adversary, no enterprise auditor, no second party. Building a broker abstraction now is architecture rehearsal, not a product requirement — defensible as investment, but the PRD sells it as an MVP *security* requirement with an "absolute zero" metric attached (§5.2), which is unfalsifiable at MVP because the only observer of a leak is the person the wall supposedly protects... from himself.

The deeper problem: the product's core value requires a component that straddles the wall. The morning plan and the interrupt tradeoff view *must* join work and personal context — UJ-2 shows the user "doing this now... pushes work end into family dinner." That framing is exactly the cross-context synthesis SEC-2 says the broker prevents ("work context sees 'unavailable after 4:05 PM'... never the child's name"). So either the planner lives outside the broker and sees everything — in which case what does the broker actually guard at MVP? — or the plan surface is somehow context-partitioned, which contradicts every user journey. The PRD resolves this nowhere, and §12 doesn't list it, so this is *worse than the stated open questions*: OQ-1 gestures at "privacy guarantees" as a model-selection issue, but the unanswered question is architectural, not vendor selection.

**Fix:** At MVP, downgrade SEC-2 to: context-tagged data model + cross-context access audit log (build the seam, not the wall). Add an explicit statement: "The planning layer is a trusted component with read access to both contexts; the broker governs what *derived* context crosses into surfaces, messages, and drafts visible to third parties." Add the planner/broker boundary to §12.

### H3. The MVP journeys execute actions the MVP scope cannot perform
**Location:** UJ-2, FR-48, FR-57 [MVP], §7.2 item 8, §7.2 deferral list

UJ-2 (labeled MVP): "the drafted reply goes out after his approval." Goes out *how*? The interrupt arrived via Slack; Slack integration is v1.0, and even then read-oriented. FR-48 says MVP ships "*drafted* acknowledgments and replies" — drafting, not sending. No write-back integration exists before Phase 2 (addendum §5, Ring 4: "calendar/task write-back — Phase 2–3"). Yet FR-57 declares MVP operates at "L2–L4," and L4 is "execute with approval" — execute *what*, against *which* connected system? The MVP has no write path. Either L4 at MVP is an empty set (so say L2–L3), or it silently implies Gmail send capability that appears in no integration ring or FR. Combined with C1's "delegate" recommendation, the MVP's flagship journey demonstrates three capabilities its own scope section defers.

**Fix:** Rewrite UJ-2's ending: "the drafted reply is copied for Sean to send" (honest, still valuable). Change FR-57 MVP posture to L2–L3, or add "Gmail send-with-approval" as an explicit MVP integration decision with its own risk note. Reconcile §7.2 item 6's recommendation set with the deferral list two paragraphs below it.

---

## MEDIUM

### M1. A fistful of unfalsifiable FRs
**Location:** FR-19, FR-25, FR-40, FR-61; P3

- FR-19: "asks *only* questions that materially affect planning" — "materially" is a judgment call; any question can be defended, so the requirement can never fail a test.
- FR-25: "reasons across explicit dimensions... and explains conclusions in plain language" — "reasons across" has no observable behavior; a hardcoded ranking with a template sentence passes this FR.
- FR-40: "the *least disruptive* opening" — least by what measure? Undefined objective function presented as a requirement.
- FR-61: "plan confidence *reflects* source freshness, coverage..." — "reflects" admits any monotonic hand-wave.
- P3: "never presents incomplete context as complete" — an unfalsifiable universal; context is always incomplete, so compliance is a matter of wording, not behavior.

**Fix:** For each, add one observable acceptance clause. E.g., FR-19: "clarification prompts are capped at N per item and each names the plan decision it unblocks." FR-25: "every recommendation exposes a 'why' panel listing the top 3 contributing dimensions with the underlying facts." FR-61: "confidence is a defined function of enumerated inputs, documented and displayed."

### M2. The competitive section states an absolute, and reads the market graveyard as an open lane
**Location:** §6, P4, addendum §7

P4: tradeoff-before-consequence is what "no shipping competitor does" — an absolute claim pinned to July 2026 research that will be stale before MVP ships; Morgen ("closest philosophical match") is one feature release away from falsifying the PRD's "central differentiator." More damning: the addendum's own evidence — "Clockwise shut down post-acquisition, Motion moving upmarket," funded players "vacating individual whole-life planning" — is presented as three unoccupied positions. The equally supported reading is that venture-funded teams tried this segment and concluded individuals won't pay for whole-life planning. The PRD never engages the graveyard interpretation, which is the single most important commercial fact in the document. Fine for the "me first" phase — but OQ-7 defers business model without noting the exit evidence bearing on it.

**Fix:** Soften P4 to "no competitor identified as of 2026-07"; add a dated re-verification checkpoint before any commercial investment; add one honest paragraph to §6: "Funded exits from this segment may indicate weak willingness-to-pay; this is unresolved and attaches to OQ-7."

### M3. Counter-metrics measure features the MVP doesn't have, and one contradicts the vision
**Location:** §5.3 vs FR-31 [v1.0], §3, FR-34 [v1.0]

The white-space-fill-rate guardrail depends on "user-defined unstructured time" — which is FR-31, tagged v1.0. At MVP the counter-metric has no data source. Separately, "time in tool should trend *down* after week 2" sits awkwardly against a vision (§3) of "the first interface opened... the interface consulted when circumstances change" plus a v1.0 live-day loop (FR-34) explicitly designed to be looked at all day. Both can be defended, but the PRD doesn't define the boundary (glance-time vs. session-time?), so the guardrail can be argued away exactly when it's needed.

**Fix:** Tag each counter-metric with its phase and data source, same as FRs. Define "time in tool" as active-interaction time excluding glanceable live-day surface.

### M4. MVP's very first AI feature is the abandonment driver the PRD warns against, with no quality bar
**Location:** FR-15 (MVP email-scope extraction), §7.2 item 4, addendum §7 ("noise amplification")

Email commitment extraction across two Gmail accounts is a precision/recall problem, and the PRD sets no target for either. At low precision, the confirmation queue becomes the noise-amplification failure mode §6 promises to avoid — the user's first daily experience is dismissing bogus "did you commit to this?" prompts. OQ-2 covers effort estimation but nothing covers extraction quality; this is a §12-grade open question that isn't in §12.

**Fix:** Add an MVP quality gate: e.g., "extraction ships behind a per-account toggle; if user rejection rate of proposed commitments exceeds 50% in week one, extraction drops to explicit-forward-only mode." Add extraction quality to §12.

---

## LOW

### L1. FR-56 [MVP] enumerates notification triggers that require v1.0 features
**Location:** FR-56 vs FR-11, FR-53, FR-63–64

The MVP-tagged notification FR lists triggers including "delegation unaccepted" (delegation is v1.0), "important-date workflow must begin" (FR-11, v1.0), and "a learned assumption could improve planning" (FR-53, v1.0). Cosmetic, but it's the same disease as H3: MVP tags applied to composite requirements without pruning the v1.0 limbs. **Fix:** Split the trigger list by phase.

### L2. The Person model quietly collects what P5 forbids reasoning about
**Location:** FR-8 vs FR-12/P5

FR-8's full field list includes "recent meaningful interactions" and "life events." Deciding an interaction was *meaningful*, or ingesting third parties' life events, edges toward the third-party modeling P5 prohibits — the constraint is on *claims about internal state*, but the data collected invites exactly those inferences, and FR-54 only prohibits profiling "unnecessarily." **Fix:** One sentence in FR-8: meaningfulness and life events are user-asserted fields only, never inferred from message content.

---

## Scorecard

| Severity | Count | Findings |
|---|---|---|
| Critical | 3 | C1 interrupt loop = hidden whole product; C2 unmeasurable metrics + zero MVP acceptance criteria; C3 v1.0 is a multi-year program |
| High | 3 | H1 capacity model unbuildable as tagged; H2 privacy broker theater / undefined planner-boundary; H3 MVP journeys execute beyond MVP scope |
| Medium | 4 | M1 unfalsifiable FRs; M2 absolute competitive claims + graveyard blindness; M3 counter-metrics without data sources; M4 extraction quality ungated |
| Low | 2 | L1 phase-mixed notification triggers; L2 Person-model fields vs P5 |

**Bottom line:** the vision and principles are the strongest part of the document — keep them. But before this functions as a build contract, C1–C3 must be fixed *in the PRD itself*, not deferred to epics: an honest MVP interrupt spec, written MVP acceptance criteria with instrumentation, and a v1.0 broken into sequenced increments. Everything else can be patched during architecture.
