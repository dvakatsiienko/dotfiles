# AGENTS.md: gmail

the mail side of the mac: filters as code, the spam auto-read script, and the himalaya cli config
(`home/.config/himalaya/config.toml`). gmail's own spam classification is never touched; this dir
only adds delete-on-arrival filters for dima's picks and keeps newton's spam counter at zero.

- `blocklist.json` — the one hand-edited file: `address` (exact sender), `domain` (everything from
  it), `name` (display name). the x-ray «gmail: block sender» command appends here and applies
- `config.jsonnet` — renders the blocklist into gmailctl rules; `gmailctl apply --config ~/dotfiles/gmail`
- `spam-autoread.gs` — the apps script, installed by hand at script.google.com
- `credentials.json` + `token.json` — gmailctl's oauth client + token, gitignored, never committed

📌 a filter never touches mail that already arrived — after adding a sender, the sweep of old mail
is one gmail search by hand. 📌 «delete» is gmail's trash, purged after 30 days; there is no
permanent-delete filter action.
