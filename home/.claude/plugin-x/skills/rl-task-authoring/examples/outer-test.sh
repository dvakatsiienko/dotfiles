#!/bin/bash

set -uo pipefail

log() {
    echo "[verifier] $*"
}

VERIFIER_LOG_DIR="/logs/verifier"
VERIFIER_REWARD_JSON="$VERIFIER_LOG_DIR/reward.json"
VERIFIER_REWARD_TXT="$VERIFIER_LOG_DIR/reward.txt"
VERIFIER_TEST_COUNTS="$VERIFIER_LOG_DIR/test_counts.json"

mkdir -p "$VERIFIER_LOG_DIR" /logs/artifacts 2>/dev/null || true
rm -f "$VERIFIER_TEST_COUNTS" 2>/dev/null || true

# Emit a schema-complete zero verdict before anything can fail. Every exit path
# below then leaves a reward the runners can parse, instead of "verifier did not
# produce reward.json", which reports a broken pack rather than a graded zero.
# Step 5 overwrites this with the real verdict.
printf '{"reward": 0, "test_counts": {"passed": 0, "failed": 1, "total": 1}}\n' \
    > "$VERIFIER_REWARD_JSON" 2>/dev/null || true

cd /app || {
    log "ERROR: /app does not exist"
    exit 6
}

# --- PIER MODEL PATCH ARTIFACT: BEGIN ---
PIER_MODEL_BASE_COMMIT="fa79f9ab699f9a22a6f9b50f3d247be6b51f684d"
PIER_MODEL_PATCH_PATH="/logs/artifacts/model.patch"

pier_model_patch_log() {
    echo "[verifier] $*"
}

# The harness stages the reference solution into the sandbox only for an oracle
# run, never for a model run. Capturing the diff there would store the solution
# under a name that promises the model's work.
if [ -e /solution ] || [ -e /work/solution ]; then
    pier_model_patch_log "--- Step 0: oracle run detected - skipping model.patch capture ---"
else
    pier_model_patch_log "--- Step 0: Capturing model.patch artifact ---"
    if ! mkdir -p "$(dirname "$PIER_MODEL_PATCH_PATH")"; then
        pier_model_patch_log "ERROR: Failed to create /logs/artifacts"
        exit 7
    fi

    git config --global --add safe.directory "$(pwd)" 2>/dev/null || true

    if ! git rev-parse --verify "${PIER_MODEL_BASE_COMMIT}^{commit}" >/dev/null 2>&1; then
        pier_model_patch_log "ERROR: Base commit $PIER_MODEL_BASE_COMMIT is not present in this repository"
        exit 7
    fi

    if ! git reset --soft "$PIER_MODEL_BASE_COMMIT"; then
        pier_model_patch_log "ERROR: Failed to reset HEAD to base commit $PIER_MODEL_BASE_COMMIT"
        exit 7
    fi

    if ! git add -A -- .; then
        pier_model_patch_log "ERROR: Failed to stage model changes for artifact capture"
        exit 7
    fi

    if ! git diff --cached --binary > "$PIER_MODEL_PATCH_PATH"; then
        pier_model_patch_log "ERROR: Failed to write $PIER_MODEL_PATCH_PATH"
        exit 7
    fi

    # Leave the model changes in the worktree, but clear Step 0's temporary staging
    # before the test-patch reset/apply logic mutates repository files.
    if ! git reset -q; then
        pier_model_patch_log "ERROR: Failed to unstage model changes after artifact capture"
        exit 7
    fi
    pier_model_patch_log "model.patch written to $PIER_MODEL_PATCH_PATH"
fi
# --- PIER MODEL PATCH ARTIFACT: END ---

# --- Step 1: Reset files the test patch touches back to base commit state ---
log "--- Step 1: Resetting test-patch files to base state ---"
python3 -c '
import re
patch = open("/tests/test.patch", encoding="utf-8").read()
files = set()
for line in patch.splitlines():
    m = re.match(r"^diff --git \"?a/.+ \"?b/(.+?)\"?$", line)
    if m:
        files.add(m.group(1))
for f in sorted(files):
    print(f)
' | while IFS= read -r f; do
    if git checkout HEAD -- "$f" 2>/dev/null; then
        log "  Reset: $f"
    else
        # Step 0 stages the model diff for artifact capture. If this path is
        # not present at HEAD, clear any staged model entry before applying tests.
        git rm -r --cached --ignore-unmatch -- "$f" >/dev/null 2>&1 || true
        if [ -e "$f" ]; then
            rm -rf "$f"
            log "  Removed (not in HEAD): $f"
        else
            log "  Not present in HEAD or workspace: $f"
        fi
    fi
done
reset_status=${PIPESTATUS[0]}
if [ "$reset_status" -ne 0 ]; then
    log "ERROR: Failed to parse /tests/test.patch for reset"
    exit 2
fi
log "Reset complete"

# --- Step 2: Apply the hidden test patch ---
log "--- Step 2: Applying test.patch ---"
if ! git apply --whitespace=nowarn /tests/test.patch; then
    log "ERROR: Failed to apply /tests/test.patch"
    exit 3
fi
log "test.patch applied"

if [ ! -f /app/test.sh ]; then
    log "ERROR: /app/test.sh missing after applying test.patch"
    exit 4
fi
chmod +x /app/test.sh

# --- Step 3: Run both test modes ---
log "--- Step 3: Running baseline tests ---"
bash /app/test.sh base
BASE_RESULT=$?
log "Baseline exit code: $BASE_RESULT"

log "--- Step 4: Running new tests ---"
bash /app/test.sh new
NEW_RESULT=$?
log "New tests exit code: $NEW_RESULT"

# --- Step 5: Write the reward ---
# The runners grade $VERIFIER_REWARD_JSON and parse it strictly: exactly the keys
# `reward` and `test_counts`; `test_counts` exactly {passed, failed, total} with
# passed + failed == total; an integer reward must be 0 or 1 (a float may be any
# finite value, so a graded fraction is also legal). reward.txt is written for
# backwards compatibility only - run-oracle.py ignores it.
if [ "$BASE_RESULT" -eq 0 ] && [ "$NEW_RESULT" -eq 0 ]; then
    REWARD=1
else
    REWARD=0
fi

# Report real per-test counts: write {"passed": P, "failed": F, "total": T} to
# $VERIFIER_TEST_COUNTS from your /app/test.sh, counting only the tests you
# authored. Those counts become the "N/M checks" verdict, which is the signal
# used to judge task difficulty. Without them this falls back to a 1/1
# placeholder: it grades correctly, but it cannot show how much of the task the
# model actually completed.
COUNTS=$(python3 - "$REWARD" "$VERIFIER_TEST_COUNTS" <<'PY'
import json
import sys

reward = int(sys.argv[1])
path = sys.argv[2]

if reward == 1:
    passed, failed, total = 1, 0, 1
else:
    passed, failed, total = 0, 1, 1

try:
    with open(path, encoding="utf-8") as handle:
        raw = json.load(handle)
    p = int(raw["passed"])
    f = int(raw["failed"])
    t = int(raw["total"])
    if min(p, f, t) >= 0 and p + f == t and t > 0:
        passed, failed, total = p, f, t
    else:
        sys.stderr.write("inconsistent test_counts.json, using placeholder counts\n")
except FileNotFoundError:
    sys.stderr.write("no test_counts.json published by /app/test.sh, using placeholder counts\n")
except Exception as error:
    sys.stderr.write("could not read test_counts.json (%s), using placeholder counts\n" % error)

print(passed, failed, total)
PY
) || COUNTS=""

if [ -z "$COUNTS" ]; then
    log "WARNING: could not derive test counts, falling back to the placeholder verdict"
    if [ "$REWARD" -eq 1 ]; then
        COUNTS="1 0 1"
    else
        COUNTS="0 1 1"
    fi
fi

set -- $COUNTS
PASSED="$1"
FAILED="$2"
TOTAL="$3"

if ! printf '{"reward": %s, "test_counts": {"passed": %s, "failed": %s, "total": %s}}\n' \
    "$REWARD" "$PASSED" "$FAILED" "$TOTAL" > "$VERIFIER_REWARD_JSON"; then
    log "ERROR: Failed to write $VERIFIER_REWARD_JSON"
    exit 5
fi

echo "$REWARD" > "$VERIFIER_REWARD_TXT" 2>/dev/null || true
log "reward: $REWARD ($PASSED/$TOTAL tests passed, base exit $BASE_RESULT, new exit $NEW_RESULT)"
