---
type: version-reality-review
reviewed: '2026-07-12'
reviewer: claude-fable (architecture-reviewer persona)
subject: ARCHITECTURE-SPINE.md — Stack table + technology decisions
verdict: CONDITIONAL PASS — 4 items need correction before scaffold
---

# Version / Reality Review — Architecture Spine

Reviewed against live web sources on 2026-07-12. Every item below was checked
via web search against npm, official docs, or authoritative blog posts. No
claim is asserted from training-data memory alone.

---

## Verdict Summary

**4 FLAGS, 9 PASS.** The Anthropic API choices, auth, job-queue, zod, and
framework (Next.js) are all correct. The flags are TypeScript version, Node.js
LTS pick, Drizzle 1.0 status annotation, and UUIDv7 native-pg clarification.
None block architecture; all four require a note or a one-word correction in the
spine before the scaffold PR.

---

## Per-Item Results

### Stack Table

| # | Item as written | Verdict | Finding | Source |
|---|---|---|---|---|
| 1 | TypeScript 5.x (strict) | **FLAG** | TypeScript 7.0.2 shipped July 8, 2026. TS 6.x is in between. The spine says "5.x" but the current major is 7. Should read `7.x (strict)` or at minimum `>=6.x`. | npmjs.com/package/typescript |
| 2 | Node.js 22 LTS | **FLAG** | Node 22 is still a valid active LTS line (EOL April 2027), but Node 24 entered LTS in 2026 and is now the recommended choice for new projects. Node 26 becomes LTS in October 2026. For a project starting today, "Node 24 LTS" is the better default. Node 22 is not wrong but is no longer the newest LTS. | nodejs.org/en/about/releases/ |
| 3 | Next.js 16.2 | **PASS** | 16.2.10 confirmed as the current stable release (published ~10 days ago). Version exists and is current. | npmjs.com/package/next |
| 4 | Drizzle ORM 0.45.x (pin until 1.0 stable) | **PASS with note** | 0.45.2 is the current stable tag. v1.0.0-beta.22 shipped April 2026; 1.0 stable is not yet released. The annotation "pin until 1.0 stable" is accurate. The version number 0.45.x is current. No action required; the note in the spine is correct. | npmjs.com/package/drizzle-orm |
| 5 | pg-boss 12.x | **PASS** | 12.25.1 published 7 days ago. 12.x is real, current, and actively maintained. | npmjs.com/package/pg-boss |
| 6 | Better Auth (current stable at scaffold time) | **PASS** | v1.6.23 published 8 days ago. Project is healthy and actively maintained. Explicitly supports Next.js 15/16 (noting that Next.js 16 renames "middleware" to "proxy", but integration is supported). | npmjs.com/package/better-auth |
| 7 | zod 4.x | **PASS** | 4.4.3 is current stable (released ~May 2026). zod 4 is the active major. | npmjs.com/package/zod |
| 8 | Anthropic TS SDK (current stable) | **PASS** | No version pinned in spine (intentional). The pattern "current stable" is appropriate given Anthropic's rapid iteration cadence. |  |
| 9 | Postgres — Supabase-provisioned major | **PASS with note** | Supabase currently offers Postgres 15, 17, and OrioleDB-17. Postgres 14 was deprecated July 1, 2026. Postgres 18 is not yet a standard Supabase offering. The spine says "Supabase-provisioned major; dev container pinned to match" — this is deliberately unspecified (correct). No architecture constraint broken. Architects should be aware the likely provisioned version is 17 when scaffolding. |  |
| 10 | Docker Compose | **PASS** | No version pinned in spine. Docker Compose V2 is stable and universal. No concern. |  |

### Model IDs (AD-3)

| # | Item as written | Verdict | Finding | Source |
|---|---|---|---|---|
| 11 | `claude-haiku-4-5` | **PASS** | Confirmed as a valid, current Anthropic API model identifier. Pricing: $1/$5 per million input/output tokens. | anthropic.com/claude/haiku |
| 12 | `claude-sonnet-5` | **PASS** | Confirmed as a valid, current Anthropic API model identifier. Introductory pricing active through August 31, 2026. | anthropic.com/news/claude-sonnet-5 |
| 13 | Batch API | **PASS** | Anthropic Messages Batch API is Generally Available. Async bulk inference, ~1-hour turnaround, 50% cost reduction vs. synchronous. Mechanism unchanged. | docs.anthropic.com/en/docs/build-with-claude/batch-processing |
| 14 | Prompt caching | **PASS** | Generally Available. February 2026 update added workspace-level cache isolation and cache-aware rate limits. Automatic prefix detection now standard (simplified from earlier manual tracking approach). | docs.anthropic.com/en/docs/build-with-claude/prompt-caching |

### Anthropic "No-Training Terms" Claim (AD-3)

| # | Item as written | Verdict | Finding | Source |
|---|---|---|---|---|
| 15 | "no-training terms" — both contexts' content may flow to Anthropic API under these terms | **PASS** | Confirmed. Anthropic's commercial API default: "Anthropic does not use your Inputs or Outputs to train our models." Opt-in is available only via the Developer Partner Program. Default is no-training for all commercial API customers. AD-3's reliance on this is accurate. | docs.anthropic.com/en/docs/claude-code/data-usage |

### Supabase Free Tier (implied by AD-9 / stack)

| # | Item as written | Verdict | Finding | Source |
|---|---|---|---|---|
| 16 | Supabase free tier: 500MB, pauses after 7 idle days, plain-PG connection strings | **PASS** | 500MB database storage confirmed. 7-day inactivity pause confirmed. Plain Postgres connection string usage is consistent with AD-9 ("access via Drizzle over a standard connection string only") and not contradicted by Supabase docs. | supabase.com/pricing |

### Accessibility (Consistency Conventions)

| # | Item as written | Verdict | Finding | Source |
|---|---|---|---|---|
| 17 | eslint-plugin-jsx-a11y in lint gate | **PASS** | Still the standard a11y lint plugin for Next.js/React in 2026. ESLint 9 and flat config supported. Actively maintained under the jsx-eslint organization. | npmjs.com/package/eslint-plugin-jsx-a11y |

### UUIDv7 (Consistency Conventions)

| # | Item as written | Verdict | Finding | Source |
|---|---|---|---|---|
| 18 | UUIDv7 everywhere | **FLAG (minor)** | UUIDv7 is an excellent choice in 2026 and widely recommended. However: native `uuidv7()` function only arrives in Postgres 18. Supabase currently provisions Postgres 17 (and 15). Application-side generation (e.g., via the `uuidv7` npm package) is required for the foreseeable Supabase deployment. The spine does not explicitly call this out, which could mislead a developer who assumes `gen_random_uuid()` covers v7. A one-line note is needed: "generated application-side (uuidv7 package); Postgres 18 native support not yet available on Supabase." | thenile.dev/blog/uuidv7 |

---

## Required Corrections (before scaffold PR)

### FLAG-1 — TypeScript version

**Location:** Stack table, row 1.  
**Current text:** `TypeScript | 5.x (strict)`  
**Correction:** Change to `7.x (strict)` (or `>=6.x (strict)` if the team prefers to span the transition).  
**Why:** TypeScript 7.0.2 shipped July 8, 2026. Scaffolding to TS 5.x means immediately being two majors behind.

---

### FLAG-2 — Node.js LTS pick

**Location:** Stack table, row 2.  
**Current text:** `Node.js | 22 LTS`  
**Correction:** Change to `Node.js | 24 LTS`  
**Why:** Node 24 entered LTS in 2026 and is the recommended LTS for new projects today. Node 22 remains valid (EOL April 2027) but is no longer the leading LTS line.

---

### FLAG-3 — Drizzle 1.0 annotation (minor / informational)

**Location:** Stack table, row 4.  
**Current text:** `Drizzle ORM | 0.45.x (pin until 1.0 stable)`  
**Status:** Version number accurate; annotation accurate. No change required to correctness. Recommended: add a note that 1.0.0-beta.22 shipped April 2026 so maintainers know to watch for the stable release.  
**Action:** Optional informational note; not a blocking correction.

---

### FLAG-4 — UUIDv7 application-side generation

**Location:** Consistency Conventions table, IDs row.  
**Current text:** `UUIDv7 everywhere; event tables also carry a monotonic event_seq bigint`  
**Correction:** Append: "; generated application-side via `uuidv7` npm package (Postgres 18 native uuidv7() not yet available on Supabase Postgres 17)."  
**Why:** Prevents a developer from assuming DB-side generation is available and shipping a migration that fails at runtime.

---

## Non-Issues (no action required)

- Next.js 16.2 — confirmed current. PASS.
- pg-boss 12.x — confirmed current. PASS.
- Better Auth — healthy, Next.js 16 compatible. PASS.
- zod 4.x — confirmed current stable. PASS.
- Anthropic model IDs — both valid. PASS.
- Batch API + prompt caching — both current mechanisms. PASS.
- No-training default — confirmed accurate. PASS.
- Supabase free tier 500MB / 7-day pause — confirmed. PASS.
- eslint-plugin-jsx-a11y — confirmed standard, ESLint 9 compatible. PASS.
- Docker Compose — no version pinned, no concern. PASS.
- Postgres "Supabase-provisioned major" phrasing — intentionally unspecified; correct. Note: likely Postgres 17 at scaffold time. PASS.
