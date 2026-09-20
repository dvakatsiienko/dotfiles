# 2026-09-20 · gmail, the apps lane, the jev vet · run cc·20260907·raycast

- the first `gmailctl apply` deleted dima's two pre-existing gmail filters: the tool treats the config as the whole truth and I never ran `download` first. the class: **a declarative tool's first apply on a live account is preceded by an import of what is there** — same shape as renovate's first run, a dotfiles:link apply, a launchd bootstrap. fixed for gmail in `gmail/AGENTS.md`; the class is a fleet-hazards candidate
- `op item create` with the category's built-in slots (`username`/`credential`) for a client id + secret; dima: «why did you create wrong labels». a labelled field is `"client id[text]=…"`; the built-ins are for what they say. fixed in place, drop
- the changelog-hunt fork picked wispr's blog as the changelog; dima found `wisprflow.ai/whats-new` in one look. a hunt reports «no changelog page» only after trying `/whats-new`, `/changelog`, `/releases`, `/updates` and the footer links — say which were tried
- git-crypt + worktrees: `git worktree add` dies on the smudge filter (no key under `.git/worktrees/<n>/`); the fix is `-c filter.git-crypt.smudge=cat -c filter.git-crypt.required=false` then `git-crypt unlock` inside the tree. in `gmail/AGENTS.md`; fleet-hazards candidate (git hooks section)
- my 09-19 claim «impeccable's monorepo config does not work as the docs say» was wrong: 4.3.1 discovers workspaces and inherits the root PRODUCT.md. the wrong thing was the readme's gitignore anchoring. a claim about a tool's capability names the version and the doc line it was read from
- the cclio memory barrel did not load in this session (probe: the hash in `sys-settings-drift` not nameable); a fresh `claude -p` loads it. cause unknown; dima: resolve in place if it repeats, suspects the AGENTS.md migration
- `x:coder-brief` is `disable-model-invocation`; the Skill tool refuses it. the brief was written from `craft-spawning` + the spawn template, which is the documented path («cclio pastes the file body into a --bg prompt») — no defect, a reminder that the memory leaf carries the recipe
- ci-watch `--boot` exited 1 on every clean boot since 09-18 (grep's exit as the script's); one `exit 0`. the class: a script's last command decides its exit — end with an explicit `exit 0` when the last line is a test
- GOOD: dima's «will you catch up a skipped monday» and «is the next one still monday» found two real gaps in the apps lane before it ran once (markers vs dates; monday-anchored due, not 7 days)
- GOOD: the fixture suite on its first run showed the inbox rubric at 2/4 — the same two misses the vet log had; the criterion was reworded with the numbers in hand
- (coder, chords) `hotkeys/*.ts` was typechecked by NOTHING — root tsconfig included only `script/**`, and the node-run hotkeys files sat in no config; a reverted interface field left the whole gate green (node strips types). found by accident, fixed on the branch (root include gains `hotkeys/*.ts`), proven by making the gate fail. fleet-hazards candidate beside green statuses: a green typecheck answers «did the configured files pass», never «are my files configured»
- (coder, chords) three greens beaten by LOOKING at output in one day: the dark-mode bar inverted (a token reused across themes), a lowercase pass that matched nothing, `until` shipped as a no-op (added to the type, not to the printer's field order). the `sd`-hazard shape: a replacement that matches nothing reports success
- (coder, chords) the move's dates are day-granular: presses earlier on the moving day are credited to nobody (66 on a real move). written at the field; instant comparison is the fix, not cheap (labelAt runs per event)
- (cclio) ten PR heads got no CI run because the PR was conflicting — github creates no pull_request run without a merge ref; «no checks reported» read as calm. rule: main moves under an open PR → merge it in within the hour. x:github-contrib candidate
- (coder, chords) `agent-browser fill <sel> ""` does NOT clear an input — the old value stays and it reports success; clearing needs the native value setter plus an input event. cost a wrong conclusion; x:browser-headless candidate

## coder retro — DOT-254 phase 0–2 (c24a8636, 18 commits), ranked by the coder
- ten commits ran no CI for hours: a conflicted PR creates no run; the coder checked for red, never for a run. fix: merge main the same hour it moves → x:github-contrib + x:coder-brief
  - dima's correction: dotfiles has light CI by intent (no review workflow, no bot) — the complaint about «no reviewer» is a decision, not a gap; only the «was a run created» half survives
- remote state asserted twice from `@{u}` instead of `ls-remote`; a worktree that cannot push asks the remote → x:coder-brief line
- three silent no-op writes in one session (a field missing from a printer's order, a text pass matching nothing, `agent-browser fill ""`): every replacement asserts its anchor → x:coder-brief contract line
- the typecheck hole (`hotkeys/*.ts` in no tsconfig) was found by luck; nothing in the method finds «are my files configured» → fleet-hazards green-statuses line
- the dark bar inverted from a token reused across themes, twenty minutes after loading dataviz's «dark is selected, not flipped»; the light one was under contrast too → a rule read is not a rule applied; measure both themes
- a duplicate h1 shipped four commits; a screenshot caught what a dozen `eval` reads did not → look at the top of the page once per commit
- a first row design worse than the terminal's (8000 px of scroll) → start from the thing being replaced
- an invented constraint (the 30-day window) handed back to dima as his → x:coder-brief: never present a carried default as a requirement
- the brief scoped the move as three edits and missed that hk needed a new endpoint; named the move an `edit` route; asked for a root PRODUCT.md — wrong for a multi-tool repo
- GOOD: unbriefed improvement — run `impeccable context` before writing shape questions; ask voice at init
- AUTOMATION: a `commit-msg` hook rejecting a linear keyword adjacent to a ticket id (sibling of the ci-skip marker hook), ten lines, kills a hand-run scan on 18 bodies → ticket or freebie
- NOBODY ASKED: `/old/` now shows live counts it never had off disk — phase 3's A/B compares against something slightly better than the original; say so when judging
- (cclio) the verifier reported every round to me instead of the coder: my spawn note said «report to cclio-17 by SendMessage only» and overrode the skill, which already specified the direct loop. a spawn note never overrides a contract; the skills now say so
- (coder p3) the A/B `chords:ab` defaulted to HEAD~1, so after a multi-commit pass both tabs held the pass — «typeset looks identical» was a baseline error, not a subtle pass. a pass names its explicit baseline ref in every ping
- (coder p3) a ping is the end of a step, never the end of the assignment: he ended his turn on «starting harden» and idled → x:coder-brief line
- (coder p3) `dist-before/` inside the vite root made every A/B rebuild full-reload dima's dev tab until the hmr socket gave up — build output goes outside the watched root or into `server.watch.ignored`
- (cclio + coder p3) the `audit` pass never ran: harden → polish, and my steers walked past it too; caught by the coder at the nits. every named pass in a brief gets a checkbox the coordinator ticks, not a memory
- (coder p3) a write-path probe used dima's real note key (cmd+z, empty body = delete) and wiped notes.json; restored from git byte-identical. a probe writes only to a chord nothing is filed under, or to a fixture
- (coder p3) ended a turn on a chat reply to dima twice, leaving a commit unpinged and edits half done → x:coder-brief: a turn ends on the ping to the coordinator
- (coder p3) a structural change invalidates every layout number already banked: the `<main>` landmark added in audit made the board unshrinkable at ≤768, while «no overflow at 390/1024/1280» stood from before it. re-measure after any change above the measured element
- (coder p3) his own rule «The Faint Is Not Text» listed four exempt places; two are operable buttons (free keys, unheld modifiers) and not exempt — a rule written in a hurry carries the case it was written for, not the cases it covers

## coder retro — DOT-254 phase 3 (de1c2f21), ranked by the coder
- banked measurements invalidated without re-running, twice (the `<main>` landmark vs «no overflow»; `chords:ab` HEAD~1 baseline) → x:guide-ui-ux: a structural change invalidates every layout number banked before it
- the primary button verified only disabled; shipped invisible at 1.16:1 through polish → x:guide-ui-ux: a control is measured in its enabled state
- `audit` skipped, step 0 counted as a verb — the coordinator's checklist miss too
- turns ended on chat replies, twice → x:coder-brief: a turn ends on the ping
- a probe deleted dima's only note → write-path probes use a key nothing is filed under
- a rule authored the same evening had two wrong exemptions → a rule is tested, not written
- unbriefed: audit before polish; open the verifier lane after the first pass, not the last
- NOBODY ASKED: the `hk` shell alias calls `hotkey-monitor:top`, which does not exist — broken every time dima typed it → fix on main
- the two numbers: impeccable ≈ 35k tokens ≈ 4.4 % of ~800k context (skill ×3, six references, context dump); one `layout` pass ≈ 25 tool calls, no instrumented token figure — the cost was the measuring, not the skill; the skill produced the two best findings (the 12px floor, the hover audit)

## verifier retro — DOT-254 (89d2d47b), three phases, 11 findings, 1 high
- exit lines improved every phase; concrete observables («204 chords, 82 + 103 apps») made an independent recount possible — write them so from the start
- refusing green: `detect` returned [] until violations were planted; two heads with zero runs looked calm; the save button read right in the only state opened
- its own two false greens (tailwind escaped selectors vs `el.matches()`; the disabled-state reading) caught by cross-check
- cost: ~40 min per round, mostly setup; `CHORDS_PORT` + `--data-dir` cut round 2 to near zero → ship harness affordances on day one
- the ci-reviewer comparison is unanswerable in dotfiles (no review workflow); run it in bytes if it still matters
- exit lines re-read against the head when a pass removes something (line 6 outlived its subject)
- a verifier that speaks only at the end of a round wastes the round it is halfway through
