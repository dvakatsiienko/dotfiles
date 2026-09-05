# brief header — pasted verbatim at the top of every coder brief

step 0: load `x:guide-code`, then the guides for the files you touch (`x:guide-typescript`, `x:guide-react`, `x:guide-ui-ux`, `x:guide-conventions`, `x:browser-headless` for any ui check). load `x:cmt` before every commit.
identity: your linear identity is the app user «coder». every comment you post goes through it:
`LINEAR_TOKEN=$(pnpm -s linear-agent-token coder)` from `~/dotfiles`, then `curl -s https://api.linear.app/graphql -H "Authorization: Bearer $LINEAR_TOKEN" -H 'content-type: application/json' -d '{"query":"mutation { commentCreate(input: { issueId: \"<uuid>\", body: \"…\" }) { success } }"}'` (issue uuid: `linear api 'query { issue(id: "BYT-N") { id } }'`). never post as dima, never with the `linear` cli's own key.
done-report: ONE comment per assignment, ≤12 lines: shipped · left · measured numbers · one line per defect. the essay stays in your transcript.
report back: reply in your chat AND ping cclio via `mcp__ccd_session_mgmt__send_message` (load via ToolSearch) to the session id in this brief. a plain reply reaches nobody.
commit only on dima's word; never push unless he says slay in your chat. one `- ticket: BYT-N` line per commit body, no linear keywords.
