#!/bin/bash
# Verifier entrypoint for the vite-wintertc-middleware task.
#
#   test.sh base   regression coverage that must hold with or without the feature
#   test.sh new    the winter-tc feature suite
#
# Exits non-zero if any test in the selected suite fails, and publishes the
# running pass/fail tally to test_counts.json so the harness can report
# "N/M checks" rather than a bare pass/fail.

set -uo pipefail

MODE="${1:-new}"

log() { echo "[test.sh] $*"; }

cd /app 2>/dev/null || cd "$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "[test.sh] ERROR: cannot locate the repository root" >&2
  exit 1
}

COUNTS_DIR="/logs/verifier"
mkdir -p "$COUNTS_DIR" 2>/dev/null || COUNTS_DIR="/tmp/winter-tc-verifier"
mkdir -p "$COUNTS_DIR" 2>/dev/null || true
COUNTS_FILE="$COUNTS_DIR/test_counts.json"

BASE_SUITE="packages/vite/src/node/server/__tests__/winterTcRegression.spec.ts"
NEW_SUITE="packages/vite/src/node/server/__tests__/winterTcMiddleware.spec.ts"

case "$MODE" in
  base) SUITE="$BASE_SUITE" ;;
  new)  SUITE="$NEW_SUITE" ;;
  *)
    log "ERROR: unknown mode '$MODE' (expected 'base' or 'new')"
    exit 2
    ;;
esac

if [ ! -f "$SUITE" ]; then
  log "ERROR: suite not found: $SUITE"
  exit 3
fi

RESULT_FILE="/tmp/winter-tc-results-$MODE.json"
rm -f "$RESULT_FILE"

log "--- running $MODE suite: $SUITE ---"
# `vitest run` exits non-zero on failure; the json report is what we count from,
# so the exit status is captured rather than allowed to abort the script.
pnpm exec vitest run "$SUITE" \
  --reporter=default \
  --reporter=json \
  --outputFile="$RESULT_FILE"
SUITE_EXIT=$?
log "$MODE suite exit code: $SUITE_EXIT"

# --- Tally this mode, then republish the combined total ----------------------
python3 - "$MODE" "$RESULT_FILE" "$COUNTS_DIR" "$COUNTS_FILE" "$SUITE_EXIT" <<'PY'
import json
import os
import sys

mode, result_file, counts_dir, counts_file, suite_exit = sys.argv[1:6]

passed = failed = 0
try:
    with open(result_file, encoding="utf-8") as handle:
        report = json.load(handle)
    passed = int(report.get("numPassedTests", 0))
    failed = int(report.get("numFailedTests", 0))
    # A suite that fails to load reports no tests at all; that is a failure,
    # not a clean sweep, so record one so the denominator is never zero.
    if passed + failed == 0:
        failed = 1
except Exception as error:
    sys.stderr.write(f"[test.sh] could not read {result_file}: {error}\n")
    failed = 1

# Persist this mode's tally, then sum whatever modes have run so far. test.sh is
# invoked once per mode, so the combined file has to survive across calls.
with open(os.path.join(counts_dir, f"counts-{mode}.json"), "w", encoding="utf-8") as handle:
    json.dump({"passed": passed, "failed": failed}, handle)

total_passed = total_failed = 0
for name in ("base", "new"):
    path = os.path.join(counts_dir, f"counts-{name}.json")
    try:
        with open(path, encoding="utf-8") as handle:
            part = json.load(handle)
        total_passed += int(part["passed"])
        total_failed += int(part["failed"])
    except FileNotFoundError:
        continue
    except Exception as error:
        sys.stderr.write(f"[test.sh] ignoring unreadable {path}: {error}\n")

with open(counts_file, "w", encoding="utf-8") as handle:
    json.dump(
        {
            "passed": total_passed,
            "failed": total_failed,
            "total": total_passed + total_failed,
        },
        handle,
    )

print(f"[test.sh] {mode}: {passed} passed, {failed} failed")
print(
    f"[test.sh] cumulative: {total_passed}/{total_passed + total_failed} checks passing"
)
PY

exit $SUITE_EXIT
