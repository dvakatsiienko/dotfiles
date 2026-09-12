# flawlog 2026-09-12 — wispr-and-gate-verdict · run cclio-memory-bridge

- (night, wispr research) claimed wispr flow has an ipad app from «ios» in the docs; dima installed it: a phone-scaled window, same as superwhisper · cost: a wrong verdict axis («wispr wins the ipad») · lesson: a platform claim names the app store listing line («Only for iPhone» / «iPad»), never the word ios
- (night) first answer on «ukrainian in the flow keyboard» answered dictation language; his ask was a typed cyrillic layout for precise letters · cost: one round trip · lesson: when a question names a keyboard, ask which of the two things moved — the typed layout or the recognised speech — before answering
- (coder #78 rider) my brief said «two type sites, one annotation»; the type is `unknown`, the fix needed a narrow too — a type-fix brief names the new type, not the symptom
- (coder #79) jq 1.7 on the runner vs 1.8 on the mac: a jq program passes locally and fails to compile in ci → fleet-hazards line candidate (github api reads section, or a new jq section)
- (coder #79, measured) `x:github-contrib` + review.yml comments say a claude-code-action pr editing a workflow already on main self-skips — FALSE in our config: #79 was reviewed twice with a verdict line. fix the skill line at the flush; my brief relayed the same wrong premise («prove by failing first» assumed it could not)
- (coder #79) a push that counts itself as a round also corrupts the next review's prompt («commits since <sha>») — partial review; the fix (own workflow file per trigger) is in, the lesson: a counter and a prompt anchor read the same event source
- (coder #79, fleet fact) `performed_via_github_app` exists on issue comments only, absent on pulls/N/comments and pulls/N/reviews → x:github-contrib line
- ticket to file at the flush: review workflow yaml is still the pr's own copy under `checks: write` (workflow_run lane or ruleset) + sha-pinning every action — one ticket, same argument
- (coder #80, fleet fact) two negative turbo filters INTERSECT (`--filter='!a' --filter='!b'` drops both), docs read as union; `turbo run test --dry=json` lists packages with no test script too — measured with --dry=json → guide/hazard candidates
- coder retro BYT-92/93 (1): three of twelve defects were holes opened while closing another (base.sha, six postgres containers, empty $app, one-arm ref test) · brief line: after touching a trust boundary, state what the NEW code trusts and who controls it before pushing
- coder retro (2): brief premise «reviewer stands down on a workflow-editing pr» was false (also in x:github-contrib) — architecture right, stated reason wrong → skill fix at the flush
- coder retro (3): review.yml's own header said «one trigger per file»; the coder added a second trigger with it in context · a file's header is a constraint, not history — coder-brief line
- coder retro (4): the cap counts successful rounds, not opus — a pr that cannot be judged burns unlimited window (two reds ≈ 26 min) → cap attempts too (design note for the gate rethink)
- coder retro (5) measurement pr 7+8: ci reviewer 6 unique · standards 5 · spec 4 · greptile 3 · coderabbit 0 (~40 min, stale head) → per the brief's rule coderabbit is cut after two zero prs → measurement doc + brief chain
- coder retro (7): `sd`/`sed` silently ate `${{ … }}` from a workflow file twice → fleet-hazards line: never sd/sed a line holding `${{ }}`, use the Edit tool; sandbox git-substring refusal ×6 before the scratch-script default — the hazard predicted it, the brief must LEAD with it
- coder retro (8): #79 and #80 both merge past a red gate (no green possible until #79 is on main) — the exact habit the ticket removes; tell dima, not discover
- coder retro (9): the answer-check lane produced 5 of 12 defects and exists only to work around the two-round cap; the coder would have argued to cut it and did not — «a brief item is arguable on day one» goes into coder-brief; the gate rethink weighs deleting it
- deleting #79's branch on merge auto-CLOSED #80 (its base) — github closes a pr whose base ref is deleted; a stacked pr's base must be retargeted BEFORE the parent's branch dies. cost: a reopen/rebase round · rule for merge-with-delete-branch: check `gh pr list --base <branch>` first
- coder retro delta (1): twice reproduced a bug documented in the file open in front of it (needs: edge on the required gate; the concurrency block copied without its incident half) → coder-brief: when copying a block from a file with incident history, copy the incident or say why it does not apply
- coder retro delta (2): reported the flattering half of one observation (the greptile skip = owner test works AND the cancel bug) → «before calling a run proof of X, ask what else the run is evidence of» — brief + my own report-verify leaf
- coder retro delta (6): a `gh api …/runs` waiter keyed on status==completed with per_page=1 matches the PREVIOUS run → key on id > last seen — x:github-contrib line
- coder retro delta (7): the coder read four reviewers' full prose into its own window (700k); review-reading goes to a fork by default — coder-brief line
- gate contract measured on real prs: findings→red+counted (run 9), clean→green+counted (run 11), unjudgeable→red+uncounted (6,7,8), owner approval→green (#83's own lane, run 34697823006)

- 16:1x · #84 ci dead for an hour: the coder wrote «the `[skip ci]` note» in a commit body; github honours the marker anywhere, no run created, silently. found by asking «was a run created», not «is a check green». → `x:cmt` §5 rule (0.11.68), `x:coder-brief` retro angle. same family as the linear-keyword parser trap
- 15:xx · brief claim wrong: «root change = all six apps» — turbo affects nothing for a dependency-less root file; masked by my own dry-run reading. → method-report-verify: a dry-run in a dirty tree measures the dirt
- 14:xx · handed dima the spawn fence for BYT-84 out of Code-tab habit; the rule says cclio spawns --bg itself. → spawn from here next time
- 15:xx · the coder minted a vercel hook unannounced (good probe, silent settings write) → brief rider 0.11.67

- 19:2x · re-asked two verdicted items three times (an echoed block = accept; «what is a rider» was a question, not a hold) → an ask leaves the fence the turn it is verdicted; approved-but-scheduled work goes to the flowlog, never back into the fence
