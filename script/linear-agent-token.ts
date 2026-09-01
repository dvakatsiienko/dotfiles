// prints a fresh linear app-actor token for the cclio oauth app.
// id/secret live in the macos keychain (linear-cclio-id / linear-cclio-secret);
// the minted token caches in ~/.cache/linear/ and re-mints when <24h of life remain.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const cacheDir = join(homedir(), '.cache', 'linear');
const cacheFile = join(cacheDir, 'cclio-token.json');

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
        ['find-generic-password', '-a', 'cclio', '-s', service, '-w'],
        {
            encoding: 'utf8',
        },
    ).trim();

const body = new URLSearchParams({
    client_id: keychain('linear-cclio-id'),
    client_secret: keychain('linear-cclio-secret'),
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
