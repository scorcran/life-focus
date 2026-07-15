# Life Focus Intelligence — Agent Rules

## Commit messages

All commits MUST follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

- Format: `<type>(<optional scope>): <description>` — imperative, lowercase, no trailing period.
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `perf`, `style`.
- Reference the BMad story in the description or body when the commit implements one, e.g. `feat: scaffold monorepo and development environment (story 1-1)`.
- Breaking changes: `!` after the type/scope plus a `BREAKING CHANGE:` footer.

## Project conventions (pointers, not duplicates)

- Architecture invariants (AD-1..10): `_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md` — binding on all code.
- Requirements: `_bmad-output/planning-artifacts/prds/prd-life-focus-2026-07-10/prd.md`; stories: `_bmad-output/planning-artifacts/epics.md`; sprint state: `_bmad-output/implementation-artifacts/sprint-status.yaml`.
- UX contract: `_bmad-output/planning-artifacts/ux-designs/ux-life-focus-2026-07-12/` (DESIGN.md tokens are byte-identical in code; EXPERIENCE.md microcopy rules bind all UI copy).
- Gates: `npm run typecheck`, `npm run lint` (includes fixture proofs), `npm test` must pass before any commit; violations of the AD-1 dependency direction fail lint by design.
