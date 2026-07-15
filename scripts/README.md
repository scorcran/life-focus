# scripts/

## bmad-loop-ship.sh

Runs the autonomous `bmad-loop`, then pushes a review branch and opens a PR into
`main` **only when the run completed cleanly**. See the header comment in the
script for the full contract.

Use it exactly like `bmad-loop`:

```bash
scripts/bmad-loop-ship.sh run          # or: npm run loop:ship -- run
scripts/bmad-loop-ship.sh run --epic 2
scripts/bmad-loop-ship.sh resume <run-id>
```

How it stays autonomous but safe:

- `.bmad-loop/policy.toml` `[scm] target_branch = "main"` — the loop merges every
  completed story into the local `main` ref, so each story builds on the last.
- After the loop exits, the wrapper reads the run's `state.json`. It pushes +
  opens a PR only if: not crashed, not stopped/aborted, no story deferred or
  escalated, and local `main` is ahead of `origin/main`.
- It pushes `main`'s HEAD to `bmad-loop/run-<id>` and PRs that into `main` — it
  never pushes straight to `main`, so the shared branch only advances via review.

Requires `gh` (authenticated) and an `origin` remote. Missing either → the loop
still runs; the push/PR step is skipped with a message.
