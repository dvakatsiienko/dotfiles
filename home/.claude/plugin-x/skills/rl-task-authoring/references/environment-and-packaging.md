# Environment, packaging, calibration

## Environment setup

Scaffold first, then pin, then clone a local golden checkout:

```bash
scripts/scaffold-task.py <task-id> --repo org/repo --base-commit <40-char-sha>
```

The scaffold creates `task.toml`, `instruction.md`, `environment/Dockerfile`,
`solution/{solution.patch,solve.sh}`, `tests/{test.patch,test.sh}`.

**The base commit must be identical in three files**: `task.toml`,
`environment/Dockerfile`, `tests/test.sh`.

### ⚠️ The annotated-tag trap

`git rev-parse <tag>` on an **annotated tag** returns the **tag object** SHA, not the
commit it points to. `git checkout <tag-object-sha>` silently dereferences and appears to
work — but a Dockerfile that verifies `test "$(git rev-parse HEAD)" = "$BASE_COMMIT"`
will fail, because after checkout `rev-parse HEAD` returns the *commit*.

Always resolve to the commit SHA. Confirm with `git rev-parse <tag>^{commit}` or by
checking out and reading `HEAD`.

### Golden checkout hygiene

Clone the target repo separately from the dataset repo, check out the pinned commit, and
work on a local branch with **no upstream tracking** so a stray `git push` cannot
succeed. Removing the `origin` remote entirely is cheap extra insurance.

Never push a solution branch or commit upstream. Never open an upstream PR.

### Dockerfile shape

Provided environment files are reference only — free to write from scratch, as long as
the setup stays simple. No Docker-in-Docker.

The essentials:
1. A base image matching the repo's required runtime version.
2. The repo's own package manager, pinned to the version the repo declares.
3. Fetch **only** the base commit — `git fetch --depth 1 origin <sha>` — so future
   history is not present for a model to read.
4. **Verify** after checkout: assert `rev-parse HEAD` equals the base commit and the
   worktree is clean.
5. Install dependencies and build at **image build time** — runtime is airgapped.
6. Re-verify the worktree is still clean and the commit unchanged after install/build; a
   dirty tree here silently pollutes the captured model patch later.

Bake in anything the task or verifiers need — fixtures, documents, extra services.
Prefer running a service inside the container over standing up external infra.

A dependency added for verifiers must be present in the image. Installing it can dirty
the worktree; one approach is to install, then restore the manifest and lockfile from
git so the packages remain in `node_modules` while the repo stays clean.

## Packaging — the split

- **`solution.patch`** = production changes, optionally plus a few repo-native tests (see
  `solution-and-review.md`).
- **`test.patch`** = new verifier tests **and** the `/app/test.sh` entrypoint, plus any
  verifier-only helpers.

Working examples of both harness layers ship with this skill:
`examples/outer-test.sh` (scaffold-generated: captures the model patch, applies
`test.patch`, calls the inner script twice, writes `reward.json`) and
`examples/inner-test.sh` (mode dispatch plus the accumulate-across-calls counts logic).
`examples/task.toml` is a filled-in metadata file that passes validation.

The classic failure: tests end up in `solution.patch` and `test.patch` is empty. The
grader then has nothing to apply and **even the reference solution scores 0**.

Generate with explicit pathspecs so the split cannot drift. Stage untracked files first
(`git add -N`) or they will not appear in the diff:

```bash
git add -N <new files>

git diff --binary <base-commit> -- <production paths> \
  > tasks/<task-id>/solution/solution.patch

git diff --binary <base-commit> -- <test paths> test.sh \
  > tasks/<task-id>/tests/test.patch
```

Keep the pathspec lists explicit per file when production and test code share a
directory — a directory-wide pathspec will silently pull the wrong files across.

Ensure the work tree is clean before generating, and always regenerate from the pinned
base commit. Ship plain patches — no embedded archives or blob fallbacks.

`solve.sh` stays trivial:
```bash
cd /app
git apply --allow-empty --whitespace=nowarn /solution/solution.patch
```

## Calibration — the required red/green proof

```bash
scripts/run-baseline.py <task-id>   # tests only, no solution → reward 0 / < 1
scripts/run-oracle.py   <task-id>   # tests + solution        → reward 1
scripts/validate-task.toml --task <task-id>
```

Baseline proves the tests actually require the feature. Oracle proves they are
satisfiable and the solution is correct. **Both numbers belong in the PR description** —
reviewers look for them first.

Reading a multi-model run — target band, what each shape means, the effort-level confound,
and the tuning levers — lives in `process.md` under "Reading the numbers". This file owns
the mechanics of *producing* the numbers; that one owns interpreting them.

Re-uploading a pack **replaces it, bumps the version, and resets calibration** — oracle
and baseline must pass again before model runs count.

### Where the proof lands, and where it goes

`run-task-docker.py` bind-mounts `.task-run-logs/<task-id>/` to `/logs` inside the
container, so everything the verifier writes is already on the host — nothing to extract,
and it survives the container. Oracle output sits at the top level, baseline nests under
`baseline/`:

```
.task-run-logs/<task-id>/
├── run.log · build.log
├── verifier/reward.json          oracle verdict
├── verifier/counts-{base,new}.json
└── baseline/
    ├── run.log · build.log
    ├── artifacts/model.patch     empty on a baseline run — it is a no-op
    └── verifier/reward.json      baseline verdict
```

The per-mode `counts-*.json` split is worth keeping: it shows the regression suite
passing in *both* runs while the feature suite collapses at baseline, which is the shape
reviewers are checking for.

**These logs are a deliverable, not a byproduct** — *"keep the red/green `reward.json`
and full verifier logs explaining both runs; drop these logs on your PR so reviewers can
see red → green"* (`08-validating-locally.md` step 5). They attach to the **PR**, next to
the pack — never inside the pack zip, which is what the harness consumes. When there is
no PR yet, send them as a separate archive alongside it.

**Check for false passes.** Any feature test that passes at baseline is testing nothing.
A test asserting only a side effect that is already true (a null field, a default) will
pass without the feature and must be strengthened or cut.

If the oracle fails anything, either the solution or the test has a bug — do not adjust
the test to match a wrong implementation without flagging it.

**Report the separation, not just the two numbers.** Reviewers look at
*oracle-to-baseline separation* — the gap in percentage points between the two pass
rates. A real submitted task reported it like this:

```
Golden solution   467 changed production lines; solution.patch 883 lines physical
                  Tests, documentation and changelog excluded from the golden patch
Verifier          20 hidden behavioral checks; test file 514 lines
                  Existing regression gate: 3/3 passed
                  Fractional scoring: enabled
Qualification     Oracle 20/20 — reward 1.00 · Baseline 1/20 — reward 0.05
                  Oracle-to-baseline separation: 95 percentage points
```

That single baseline pass was legitimate — it verified behavior stays unchanged when the
new feature is not enabled. A regression test passing at baseline is correct; a *feature*
test passing at baseline is a bug in the test.

**Clean-room check:** the tooling scans the test patch for network-looking calls (`nc`,
`curl` to external hosts) and blocks the run until reviewed. Keep verifiers offline and
it never trips; a genuine false positive can be reviewed and allowed.

`docs/09` lists `seed/` among the pack contents. The scaffolder does not create one and
tasks ship without it — treat it as optional unless a reviewer asks.

A useful pre-Docker loop: apply the real patch files to a pristine checkout and run the
inner `test.sh` directly. That covers patch application, mode dispatch, counts and reward
inputs in seconds. It does **not** cover the container path — offline build, `solve.sh`,
the `/logs/verifier` mount, the outer `test.sh` writing `reward.json`. Run the Docker
scripts before declaring done.

Delete the local counts directory between runs, or stale tallies from a previous run get
summed in.

## Harbor — this task format is the Harbor format

**Confirmed by execution, not inferred.** Harbor is the open-source execution framework
from the Terminal-Bench authors (`uv tool install harbor`; PyPI `harbor`, author Alex
Shaw). `harbor init --task` scaffolds `instruction.md`, `environment/Dockerfile`,
`solution/solve.sh`, `task.toml`, `tests/test.sh` — our directory, item for item. Harbor's
own parser loads an unmodified task, and a full oracle run reproduced our reward
exactly.

Consequences worth having: **the eval harness is not the only way to score a task.** Harbor runs
locally, ships `oracle`, `nop`, `claude-code`, `codex`, and `gemini-cli` agents, and gives
an independent measurement to cross-check a suspect the eval harness run. If the two disagree,
that is diagnostic — investigate before changing the task.

```bash
harbor run -p tasks/<task-id> -a oracle -o ~/.cache/harbor-jobs
harbor run -p tasks/<task-id> -a claude-code -m <model> -n 4
harbor check tasks/<task-id>          # LLM task-quality rubric, see below
```

Local paths use `-p`; `--dataset` is for registry names.

### Three traps, all hit on the first real run

- **`docker buildx` must be installed.** Harbor shells out to `docker buildx build`. A
  Docker install carrying only the `compose` plugin fails with `unknown flag: --file`,
  which reads like a Harbor bug and is not.
- **On a VM-backed Docker (colima, Lima), the jobs dir must sit inside a shared mount.**
  Only `$HOME` is virtiofs-shared by default. Point `-o` at a path under `/tmp` and Harbor
  creates `verifier/` on the host while the container writes `reward.json` into the VM's
  private copy — producing `RewardFileNotFoundError` and a ~4s verifier phase that looks
  exactly like a broken task. Check with `colima ssh -- mount | grep virtiofs`.
- **A nested `test_counts` in `reward.json` is not upstream-Harbor-compatible.** Harbor's `VerifierResult`
  takes a **flat** `dict[str, float|int]`; the nested form fails its schema
  validation. Harbor reads `reward.json` first and only falls back to `reward.txt`, so a
  pack writing both still trips. **Do not fix this by changing the pack** — the target harness's format is
  authoritative for what ships. For a Harbor run, use a copy whose `test.sh` writes only
  `reward.txt`.

### `harbor check` — a machine-runnable quality rubric

Grades a task against `quality_checker/default-rubric.toml`. Several criteria are ones this
skill already enforces by hand: `behavior_in_task_description` (the bidirectional coupling
rule), `behavior_in_tests`, `anti_cheating_measures`, `tests_or_solution_in_image`,
`test_deps_in_image`, `hardcoded_solution`, `file_reference_mentioned`.

**It is stricter than the accepted-prompt corpus.** `behavior_in_task_description` fails
a task when tests need "details not specified", including filenames and interfaces — but
merged prompts are terse by design and several would fail it. Run it for signal;
**do not rewrite a prompt to satisfy it.**

**Harbor, not BenchFlow.** BenchFlow is a competing task format; adopting it means
converting away from what the target harness uses. Harbor is worth the setup precisely because
it is the same format, so the same pack runs in both.

## Local model runs without the eval harness

```bash
export OPENAI_API_KEY=<key>
uv run scripts/mini-task-runner.py tasks/<task-id>
```

Verifies the reference solution in an isolated network-disabled container, then runs the
model and verifier in a fresh one. `--model` selects the model, `--json-out` saves the
result, `--preflight-only` checks the pack and prerequisites.

This is the way to gauge difficulty while the eval harness access is pending — and a way to
answer "is this task hard enough" with data rather than intuition.

Also available: `scripts/run-task-docker.py <task-id>` for a full local build-and-run,
with `--list`, `--dry-run`, `--skip-build`, `--fail-fast`.

## Metadata

`validate-task.toml` enforces non-empty `task.description`, `metadata.display_title`,
`metadata.display_description`, and `metadata.language`. Fill `category`, `keywords`, and
`original_title` too — the reference tasks do.

## Packaging checklist

- [ ] `solution.patch` applies cleanly and contains **no verifier files**. It may carry a
      handful of repo-native tests as part of a complete PR — see the tests-in-solution
      section of `solution-and-review.md`, which supersedes the docs' blanket "zero test
      files" rule. What it must never contain is a copy of the verifier suite.
- [ ] `test.patch` = verifiers + `/app/test.sh`; applies cleanly; NOT empty
- [ ] Base commit identical in `task.toml`, `Dockerfile`, `test.sh`
- [ ] `validate-task.toml` passes
- [ ] `run-oracle.py` → reward 1
- [ ] `run-baseline.py` → exits 0 with reward < 1
- [ ] Both patches apply cleanly to a pristine checkout at the base commit
- [ ] No secrets committed; nothing pushed to the source project's upstream
