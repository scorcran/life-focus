#!/usr/bin/env bash
#
# bmad-loop-ship.sh — run the autonomous bmad-loop, then push a review branch and
# open a PR ONLY when the run completed cleanly.
#
# Why a wrapper: bmad-loop is intentionally local-only (its [scm] block has no
# push/PR options), and it exposes no per-run "on finish" hook — only per-CLI-session
# relays. So the reliable, transparent place to gate remote integration is right
# here, around the CLI, keyed off the run's own state.json (the source of truth).
#
# Pairs with [scm] target_branch = "main" in .bmad-loop/policy.toml: the loop merges
# every completed story into the LOCAL main ref (building each story on the last).
# This script never pushes straight to main — it pushes main's HEAD to a run-scoped
# branch and opens a PR into main, so origin/main only advances through review.
#
# Usage — invoke exactly as you would bmad-loop, e.g.:
#   scripts/bmad-loop-ship.sh run
#   scripts/bmad-loop-ship.sh run --epic 2
#   scripts/bmad-loop-ship.sh resume <run-id>
# All arguments are forwarded verbatim to `bmad-loop`.
#
# "Completed cleanly" means, per the run's state.json:
#   - not crashed and not stopped (aborted / manual-rollback halt), AND
#   - no story was deferred (defer_reason) or escalated (sentinel_kind), AND
#   - local main is actually ahead of origin/main (there is something to ship).
# A clean epic-boundary pause still ships what got done. Any failure/defer/escalation
# → no push, no PR (the branches stay local for you to inspect, exactly as today).
#
# To require the ENTIRE sprint to finish before any PR, add `and s.get("finished")`
# to the CLEAN check in the python block below.

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
RUNS_DIR="$REPO_ROOT/.bmad-loop/runs"
BASE_BRANCH="main"     # PR target; keep in sync with [scm] target_branch
REMOTE="origin"

# 1. Run the loop, forwarding every argument. Capture its exit code but do NOT
#    let it decide shipping — a paused-at-epic-boundary run exits non-zero yet may
#    still be clean. state.json is the source of truth.
bmad-loop "$@"
LOOP_EXIT=$?

# 2. Identify the run that just executed = most-recently-modified run directory.
LATEST_RUN="$(ls -dt "$RUNS_DIR"/*/ 2>/dev/null | head -1)"
if [[ -z "${LATEST_RUN:-}" || ! -f "${LATEST_RUN}state.json" ]]; then
  echo "[ship] no run state found under $RUNS_DIR; nothing to ship." >&2
  exit "$LOOP_EXIT"
fi
RUN_ID="$(basename "$LATEST_RUN")"
STATE="${LATEST_RUN}state.json"

# 3. Preconditions for remote integration. Missing tooling is a skip, not an error.
if ! command -v gh >/dev/null 2>&1; then
  echo "[ship] gh CLI not found; skipping push/PR for run $RUN_ID." >&2
  exit "$LOOP_EXIT"
fi
if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "[ship] no '$REMOTE' remote; skipping push/PR for run $RUN_ID." >&2
  exit "$LOOP_EXIT"
fi

# Refresh origin/main so the ahead-count below is accurate.
git fetch --quiet "$REMOTE" "$BASE_BRANCH" 2>/dev/null || true

# 4. Decide clean success from state.json + git ahead-count.
CLEAN="$(python3 - "$STATE" "$BASE_BRANCH" "$REMOTE" <<'PY'
import json, subprocess, sys
state_path, base, remote = sys.argv[1], sys.argv[2], sys.argv[3]
s = json.load(open(state_path))

failed = s.get("crashed") or s.get("stopped")
tasks = list(s.get("tasks", {}).values())
deferred_or_escalated = any(t.get("defer_reason") or t.get("sentinel_kind") for t in tasks)

# Is local base ahead of the remote? (something to ship)
try:
    ahead = int(subprocess.check_output(
        ["git", "rev-list", "--count", f"{remote}/{base}..{base}"],
        stderr=subprocess.DEVNULL).decode().strip() or "0")
except Exception:
    ahead = 0

clean = (not failed) and (not deferred_or_escalated) and ahead > 0
print("yes" if clean else "no")
PY
)"

if [[ "$CLEAN" != "yes" ]]; then
  echo "[ship] run $RUN_ID is not clean-and-ahead (crashed/stopped/deferred/escalated, or nothing new on $BASE_BRANCH). No push, no PR." >&2
  exit "$LOOP_EXIT"
fi

# 5. Clean success → push a run-scoped review branch and open a PR into main.
PR_BRANCH="bmad-loop/run-${RUN_ID}"
echo "[ship] run $RUN_ID completed cleanly → pushing $PR_BRANCH and opening PR into $BASE_BRANCH" >&2

# Push the LOCAL base ref (never HEAD, never straight to $BASE_BRANCH). force-with-lease
# lets a resume of the same run id update its existing review branch safely.
git push --force-with-lease "$REMOTE" "refs/heads/${BASE_BRANCH}:refs/heads/${PR_BRANCH}"

PR_BODY="$(python3 - "$STATE" "$RUN_ID" <<'PY'
import json, sys
s = json.load(open(sys.argv[1])); rid = sys.argv[2]
lines = [f"Autonomous bmad-loop run `{rid}` completed cleanly.", "", "Stories shipped:", ""]
for t in s.get("tasks", {}).values():
    if t.get("phase") == "done" and t.get("commit_sha"):
        lines.append(f"- `{t['story_key']}` — {t['commit_sha'][:8]}")
print("\n".join(lines))
PY
)"

if gh pr view "$PR_BRANCH" >/dev/null 2>&1; then
  echo "[ship] PR already open for $PR_BRANCH; branch updated." >&2
else
  gh pr create --base "$BASE_BRANCH" --head "$PR_BRANCH" \
    --title "bmad-loop run ${RUN_ID}" --body "$PR_BODY"
fi

exit "$LOOP_EXIT"
