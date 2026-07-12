---
title: PRD Reconciliation — Architecture Spine
artifact: architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md
sources:
  - prd-life-focus-2026-07-10/prd.md
  - prd-life-focus-2026-07-10/addendum.md
created: 2026-07-12
---

# Architecture Spine — PRD Reconciliation

## How to read this document

Each finding is tagged **MATERIAL** or **MINOR**.

- **MATERIAL** — two independent build sessions could implement this incompatibly, or a load-bearing constraint was silently dropped. Needs an AD, convention row, or explicit deferral note before implementation begins.
- **MINOR** — a clarification or tightening that improves inter-session consistency but is unlikely to produce incompatible implementations on its own.

OQ resolutions are assessed separately at the end.

---

## Findings

### F-1 — NFR-2 latency targets have no architectural governing rule [MATERIAL]

**What:** PRD NFR-2 states concrete assumed targets: morning plan interactive <3s from cached context, full refresh <15s, interrupt assessment <10s. The addendum (§11) flags these as "validate during architecture." The spine's consistency-conventions table and AD set contain no caching strategy, no response-budget convention, and no assignment of which layer owns the cache that makes the <3s morning plan possible.

**Why it's a hole:** Two build sessions could implement radically different caching strategies — one session warms a plan-projection cache in the worker and exposes it via a server action; another session computes the plan fresh on every page load. Both would satisfy AD-1 through AD-9. The gap is not that the spine lacks a performance spec (it correctly defers numbers) but that it lacks any structural decision about where plan-projection results live and how they reach the web host quickly.

**Where it should land:** A new convention row or a brief note in the Structural Seed / Deferred section: "Plan projections are materialized by the worker into a `plan_snapshot` projection table; `apps/web` reads that table — it does not re-execute the planner on request." Alternatively, add a soft AD-2 corollary: "the planner runs in the worker; web surfaces read projections." Without this, session B will wire `apps/web` → `planner` directly, violating the spirit of the hexagon and producing a slow, coupled web layer.

**Severity: MATERIAL**

---

### F-2 — NFR-7 accessibility has no architectural invariant or convention [MATERIAL]

**What:** PRD NFR-7 requires keyboard navigation, high-contrast modes, screen reader support, and non-color status indicators. The spine's consistency-conventions table covers IDs, time, events, validation, errors, naming, config, and auth — but has no accessibility row. The "Interface surfaces" capability map points everything to `apps/web` routes, governed only by AD-1.

**Why it's a hole:** Accessibility requirements routinely diverge across build sessions when there is no enforcing contract: one session uses `<div onClick>` patterns, another uses `<button>`; one invents a color-only badge system for protection levels, another adds `aria-label`. For a product whose primary differentiator is a rich planning interface with consequence checklists and evidence drawers, session-level drift here is not cosmetic — it affects the usability of the core loop.

**Where it should land:** A convention row: "Interface — all interactive elements use semantic HTML; status indicators carry a non-color signal (icon, label, or aria attribute) alongside any color; WCAG 2.1 AA is the floor." This is one line that prevents the most common incompatible choices.

**Severity: MATERIAL**

---

### F-3 — NFR-9 PWA/mobile delivery has no structural convention and "Notification transport" deferral may contradict MVP scope [MATERIAL]

**What:** PRD NFR-9 states "responsive web/PWA in MVP and v1.0." The spine's Deferred section says "Notification transport — in-app only at MVP; push/PWA transport chosen when mobile usage is real." But the PRD's MVP acceptance criteria (AC-6) explicitly requires natural-language capture from "desktop and phone" — that is an MVP commitment, not a post-MVP hope. The spine's structural seed shows `apps/web` as a single Next.js host with no mention of a service worker, manifest, or mobile-responsive constraint.

**Why it's a hole:** If a build session implements `apps/web` without a PWA manifest and responsive layout from the start, retrofitting becomes expensive (viewport meta, service worker, icon sets, install flow, offline capture queue). The spine's deferral note ("push/PWA transport chosen when mobile usage is real") is defensible for *push notifications*, but it could be read to defer the entire PWA/mobile story. The AC-6 phone-capture requirement and NFR-9 are MVP-grade, not post-MVP.

**Where it should land:** A convention row or clarifying deferral note: "`apps/web` ships with a PWA manifest and responsive layout from initial scaffold (NFR-9, AC-6); push notification transport is deferred, but the manifest and mobile-responsive baseline are not." Alternatively, add `apps/web/public/manifest.json` to the structural seed.

**Severity: MATERIAL**

---

### F-4 — Evidence authority order (addendum §4) has no corresponding invariant [MATERIAL]

**What:** The addendum specifies a nine-tier evidence authority order (user correction → operational status → approved decision → source-of-record milestone → project brief → meeting decision → draft documentation → historical notes → unverified inference) that governs how conflicting evidence is resolved before a recommendation reaches the planner. The spine's AD-3 establishes that all LLM output enters as typed Assertions carrying `confidence` and `provenance`. But the authority *ordering* — the rule that resolves two Assertions from different sources that disagree — is not captured anywhere in the spine.

**Why it's a hole:** Without an authority-order convention, two build sessions implementing `interpretation-schema` will choose different tie-breaking rules: one might prefer the most recent assertion, another might prefer the highest-confidence assertion, a third might surface a conflict rather than resolve it. FR-43 and FR-44 bind to this behavior, and SM-14 measures whether evidence-assisted recommendations are rated more accurate. Inconsistent tie-breaking undermines both.

**Where it should land:** A new convention row: "Evidence authority — when two Assertions for the same fact conflict, the `interpretation-schema` resolver applies the configurable authority order (default: user-correction > operational-status > approved-decision > source-of-record > brief > meeting-decision > draft > historical > inference); ties resolved by freshness. Source conflicts are surfaced as events per FR-44 when the controlling authority is not clear." The configurable authority order itself belongs in the `policy` package.

**Severity: MATERIAL**

---

### F-5 — Broker mechanism is described but its MVP vs. v1.0 scope split is ambiguous in the spine [MINOR]

**What:** AD-5 says "broker" governs cross-context output and references SEC-2. The PRD explicitly distinguishes two stages: "MVP builds the seam" (context tagging + cross-context audit log) and "v1.0 hardens the seam into the planning boundary broker" (constraint-only exchange rules). The spine places `broker` as a full package in the structural seed and capability map. A build session could reasonably implement the full broker constraint-rules engine in MVP, or stub it to tagging + audit only.

**Where it should land:** A clarifying note in the Deferred section or inline in AD-5: "MVP scope of `broker` = context-tag enforcement + cross-context audit log emission; constraint-only exchange rules are deferred to v1.0 hardening (per PRD SEC-2 phasing). The package exists at scaffold; the exchange-rule logic is empty/passthrough until v1.0." This prevents over-building in MVP and prevents the inverse (building nothing until v1.0 and then discovering the package shape is wrong).

**Severity: MINOR** (package exists; the split is recoverable, but worth specifying)

---

### F-6 — Tone/voice ("feel and voice") has no architectural expression [MINOR]

**What:** PRD §3 specifies a detailed feel-and-voice contract: forbidden UI language ("productivity score," "relationship health," "AI knows," "optimized life"), preferred UI language ("Why this matters," "What will move," "Needs a decision," etc.), and a prohibited-tone list (chatbot-without-structure, gamified, relationship-scoring). The spine governs naming (domain types match PRD glossary) but has no convention or invariant preventing forbidden UI copy from appearing in server actions, error messages, or notification text.

**Why it matters architecturally:** The concern here is not UX copy (that belongs in a design spec), but the places where the architecture produces user-facing text: plan explanations generated by the planner, notification bodies generated by the `notify` adapter, draft acknowledgments generated by `llm-gateway`. A build session implementing planner output format or llm-gateway prompt templates could easily produce "your productivity score is 78" or "AI has optimized your day" without any spine rule blocking it.

**Where it should land:** A convention row: "User-visible text generated by core packages (planner explanations, notification bodies, llm-gateway drafts) must use PRD §3 preferred language; forbidden terms ('productivity score,' 'relationship health score,' 'optimized life,' 'AI knows') are disallowed in any user-visible string. Prompt templates in `llm-gateway` carry a system-level language constraint enforcing this." This is one convention that prevents the single most trust-destroying output category.

**Severity: MINOR** (recoverable; but the planner's "why" panel format is part of the MVP differentiator and should not drift)

---

### F-7 — NFR-6 data minimization has no storage convention [MINOR]

**What:** PRD NFR-6 states "only context necessary for planning is retrieved or stored; no bulk indexing by default." The spine's source-mirror table model (AD-7) governs connector ingest semantics correctly — mirrors are cache-semantics and safe to drop. But there is no convention governing how long source-mirror data is retained, what gets promoted vs. discarded after interpretation, or what the deletion policy is for superseded assertions.

**Why it matters:** Without a retention convention, one build session accumulates raw email bodies in source-mirror tables indefinitely; another deletes them after extraction. Both satisfy AD-7 as written.

**Where it should land:** A convention row or a note in AD-7: "Source-mirror tables retain raw inbound data for [configurable] days after last use; raw content is not replicated into Assertion payloads (only structured extraction results and provenance references). Retention policy is a `config` module value."

**Severity: MINOR** (important for the privacy story and SEC-3/NFR-6, but not an incompatibility risk that would break two sessions irreconcilably)

---

### F-8 — Addendum processing-deployment options (local/VPC/enterprise) have no spine acknowledgment [MINOR]

**What:** Addendum §3 states "architecture must keep these paths open even though MVP ships single-tenant cloud." The spine's AD-9 rule is strictly "plain Postgres via Drizzle, no Supabase coupling" — which is good — but makes no mention of the constraint that the `llm-gateway` must also be architectable for local/on-device/VPC processing. The current AD-3 rule hardcodes `claude-haiku-4-5` and `claude-sonnet-5` via Anthropic API with no note that model routing is config and may eventually point to local inference.

**Where it should land:** A note in the Deferred section: "Model routing in `llm-gateway` is config-driven (model IDs in `config` module); no Anthropic SDK calls are hardcoded outside `llm-gateway`, preserving a future path to local/VPC/on-device inference without a core rewrite (addendum §3)." AD-3 already says "routing is config" but does not say why — this makes the constraint explicit and bindable.

**Severity: MINOR** (deferred to Phase 3–4, but the architectural decision to keep it open should be stated)

---

## OQ Resolution Assessment

### OQ-1 — AI infrastructure [architecture-phase blocker]

**PRD requirement:** model/provider selection for extraction, interpretation, and planning; cost, latency, and privacy guarantees. Constrains NFR-2 and SEC-1.

**Spine resolution:** AD-3 assigns `claude-haiku-4-5` for extraction (batch + prompt-cached) and `claude-sonnet-5` for reasoning/explanation; all calls go through `llm-gateway`; every call logs tokens + cost; routing is config. The stack table pins the Anthropic TS SDK as the provider.

**Verdict: RESOLVED** for MVP provider and cost-visibility purposes. The privacy guarantee for SEC-1 (work content going to Anthropic API) is implicitly accepted by the single-tenant personal-use framing but is not explicitly stated. Recommend adding one sentence to AD-3 or the Deferred section: "SEC-1 privacy: at MVP, all model calls are user-owned single-tenant (Sean's data); enterprise/commercial deployment will require on-premise or VPC inference — this is the addendum §3 path." This closes the gap without reopening the question.

---

### OQ-3 — Identity edge cases [architecture-phase blocker]

**PRD requirement:** same email used across work/personal, or multiple work tenants: resolution flow undefined. Interacts directly with the SEC-2 context-tagging seam.

**Spine resolution:** AD-6 states context is a property of the *connection*, chosen by the user at connect time, immutable thereafter (reconnect to change). This correctly prevents email-address-based context inference. It handles the "same email serves both lives" case by making context an explicit connection attribute, not derived from the address.

**Verdict: RESOLVED** for the named cases. The multiple-work-tenant case is implicitly deferred to the single-tenant assumption (AD-6 + stack section: single-user). No gap.

---

### OQ-9 — Planner/boundary architecture [architecture-phase blocker]

**PRD requirement:** precisely which components may hold joint work+personal context, and how the trusted planning layer (SEC-2) is isolated in multi-tenant and enterprise deployments.

**Spine resolution:** AD-5 establishes `context ∈ {work, personal, joint}` with `joint` legal only on planning-layer artifacts; AD-5 also states all cross-context reads/emits are AD-4 audit events; the `broker` package filters all third-party-visible output. The planner (pure function) receives a `ContextSnapshot` that may be `joint` — this is the trusted planning component. The isolation question for multi-tenant/enterprise is explicitly deferred to the "Multi-user / commercial deployment (OQ-7, Phase 3+)" deferral note.

**Verdict: SUBSTANTIALLY RESOLVED** for MVP and v1.0. The spine answers "which components may hold joint context" (planner receives ContextSnapshot, broker filters output) and "how is it isolated" (context tags + audit events, `broker` package as the only egress point for third-party-visible derived data). The enterprise multi-tenant isolation question is properly deferred with a findability note. No gap for MVP build-start.

---

## Summary counts

| Severity | Count |
|---|---|
| MATERIAL | 4 (F-1, F-2, F-3, F-4) |
| MINOR | 4 (F-5, F-6, F-7, F-8) |
| OQ fully resolved | 2 (OQ-3, OQ-9) |
| OQ substantially resolved with one note needed | 1 (OQ-1) |

**Recommended additions before first implementation session begins:** address F-1 (plan-projection materialization convention), F-2 (accessibility baseline convention), F-3 (PWA/mobile scope clarification in Deferred), and F-4 (evidence authority convention). F-5 through F-8 can be folded into epic creation or the first build session's brief.
