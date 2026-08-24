A skill asked for → **edit the file.** `plugin-x/skills/<name>/SKILL.md` for the `x:*` family,
`cclio/plugin-cclio/commands/<name>.md` for `cclio:*`. Commit it like any other change.

**The habit underneath, which Dima called one of the most important:** *never hand him a package to
install by hand when you can make the change yourself.* No zips for drag-and-drop, no «re-upload
this». The old `skills-cw` zip lane is gone — `cw` gets the same files via the `x-cw`
marketplace plugin, synced by git push ([DOT-77](linear://linear.app/issue/DOT-77) closed on it).

🚨 **`cclio:*` is the exception: a file edit alone changes NOTHING.** The plugin loads from a
version-pinned cache under `~/.claude/plugins/cache/cclio/cclio/<version>/`, refreshed on a **version
bump**, not a file change. `claude plugin update` against an unchanged version answers *«already at
the latest version»* and leaves the stale copy live.

    # bump "version" in plugin-cclio/.claude-plugin/plugin.json, then:
    claude plugin marketplace update cclio
    claude plugin update cclio@cclio --scope project

**And it binds only in the NEXT session.** Say that when handing the edit back, or he types the new
command and finds it missing.

📌 **A command file containing a query must contain a query that RAN.** A boot step shipped into
`/cclio:init` untested and failed on linear's complexity cap — it would have broken every boot.
Write it at the shell first, watch it succeed, then paste what ran. **For an executable artifact the
test IS the write.**
