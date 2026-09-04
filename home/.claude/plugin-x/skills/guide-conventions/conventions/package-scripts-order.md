# package.json scripts — one order, every manifest

The `scripts` block reads top to bottom as the engineering loop. Same order in every package.json
Dima owns; an agent printing or editing one sorts it into these sections, in this sequence:

1. **dev** — `dev`, `dev:*` — starts servers of every kind; the loop begins here
2. **build** — `build`, `build:*`, `preview` — the produce step of dev activity
3. **prod infra + helpers** — data-store and deploy shortcuts: `db:studio` (short is fine:
   `db:so`), `db:migrate`, `db:seed`, domain clis like `trophies`
4. **intermediary** — scripts with no clear home; keep this zone small
5. **repo service** — `lint`, `typecheck`, `test`, `check`, `format` — last

Within a section the bare name leads (`build`), then its `:` variants (`build:api`, `build:web`).

✅ the reference shape, bytes `apps/trophy-sys/package.json` (commit `e88969bc`):

```json
"dev": …, "dev:api": …, "dev:web": …,
"build": …, "build:api": …, "build:web": …, "preview": …,
"trophies": …,
"lint": …, "typecheck": …
```

🚫 alphabetical. It reads `build` before `dev` and scatters `lint` between domain scripts —
Dima re-sorted trophy-sys by hand after an alphabetical print.

A prisma project carries at least a studio shortcut in section 3; a manifest without one is
incomplete, not minimal.
