
## Deferred from: code review of spec-1-1-project-scaffold-and-development-environment (2026-07-13)

- `.npmrc` legacy-peer-deps=true globally disables peer-dependency resolution for every install — introduced to work around the @typescript-eslint × TypeScript 7 peer conflict. Revisit and remove when @typescript-eslint publishes TS 7 peer support; until then genuinely-broken peer combos install silently.

## Deferred from: code review of spec-1-2-sign-in-to-a-themed-accessible-shell (2026-07-13)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-sign-in-to-a-themed-accessible-shell.md`
  summary: The single-user sign-up gate has no DB-level backstop; two concurrent first-time sign-ups could both pass the count-then-insert check (TOCTOU) and create two users, weakening AD-6's "one app user" invariant.
  evidence: `isSignUpOpen` does a `SELECT count` and the `user.create.before` hook (confirmed to abort on `false` at better-auth `db/with-hooks.mjs:17`) only refuses when it reads a non-empty table; the count and the insert are not atomic and there is no partial-unique/singleton constraint on the `user` table. Practically unreachable for a single human operator doing one-time onboarding (hence deferred, not patched), but the correct hardening is a partial unique index enforcing at most one row plus an advisory lock around count+insert. Not applied now because the migration is non-trivial to regenerate cleanly in the current drizzle-kit setup (drizzle.config requires a populated env to run generate).
