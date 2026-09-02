// prints a fresh linear app-actor token for one of our oauth apps: `cclio` (default) or `coder`.
//   pnpm linear-agent-token          → cclio token
//   pnpm linear-agent-token coder    → coder token
// id/secret live in the macos keychain as linear-<app>-id / linear-<app>-secret (account <app>);
// the minted token caches in ~/.cache/linear/<app>-token.json and re-mints when <24h of life remain.
//
// why app actors (distilled from the linear-users research, 2026-09-01):
// - an oauth app actor is a free workspace user with its own name and avatar — no seat, on every plan.
//   a personal api key always acts as its owner, so every write attributes to dima.
// - identity is per oauth app, so the grain is one app per ROLE: cclio (coordinator), coder (bg sessions).
//   finer attribution per request: `createAsUser: "<label>"` on issueCreate/commentCreate renders
//   as «label (via app)» — app-actor tokens only.
// - with `app:assignable` linear keeps agents as DELEGATES, never assignees — dima's assignee field
//   stays his commitment signal; delegate = who is actively working it. `app:mentionable` only
//   matters with a webhook listener (not wired).
// - client credentials grant mints headless; the `scope=` param is mandatory (default bounces invalid_scope).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const app = process.argv[2] ?? 'cclio';
const cacheDir = join(homedir(), '.cache', 'linear');
const cacheFile = join(cacheDir, `${app}-token.json`);

if (existsSync(cacheFile)) {
    const cached = JSON.parse(readFileSync(cacheFile, 'utf8'));
    if (cached.expiresAt - Date.now() > 24 * 3600 * 1000) {
        process.stdout.write(cached.token);
        process.exit(0);
    }
}

const keychain = (service: string): string =>
    execFileSync(
        'security',
        ['find-generic-password', '-a', app, '-s', service, '-w'],
        {
            encoding: 'utf8',
        },
    ).trim();

const body = new URLSearchParams({
    client_id: keychain(`linear-${app}-id`),
    client_secret: keychain(`linear-${app}-secret`),
    grant_type: 'client_credentials',
    scope: 'read,write,app:assignable,app:mentionable',
});

const resp = await fetch('https://api.linear.app/oauth/token', {
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
});
const data = (await resp.json()) as {
    access_token?: string;
    expires_in: number;
};
if (!data.access_token) {
    console.error('token mint failed:', JSON.stringify(data));
    process.exit(1);
}

mkdirSync(cacheDir, { recursive: true });
writeFileSync(
    cacheFile,
    JSON.stringify({
        expiresAt: Date.now() + data.expires_in * 1000,
        token: data.access_token,
    }),
);
process.stdout.write(data.access_token);
