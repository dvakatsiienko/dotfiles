// github has no account-wide defaults for repo settings, so this applies ours to every repo dima
// owns — run it again after each `gh repo create`. `pnpm repo:defaults` covers all owned, unarchived
// repos; `pnpm repo:defaults <name>...` covers the named ones.
import { execFileSync } from 'node:child_process';

const owner = 'dvakatsiienko';
const gh = (args: string[]) => execFileSync('gh', args, { encoding: 'utf8' });

// squash + rebase keep history linear; a merge commit forks it
const settings = {
    allow_merge_commit: false,
    allow_rebase_merge: true,
    allow_squash_merge: true,
    allow_update_branch: true,
    delete_branch_on_merge: true,
};

type Repo = { name: string; isArchived: boolean; isFork: boolean };

const named = process.argv.slice(2);
const repos = named.length
    ? named
    : (
          JSON.parse(
              gh([
                  'repo',
                  'list',
                  owner,
                  '--limit',
                  '200',
                  '--json',
                  'name,isArchived,isFork',
              ]),
          ) as Repo[]
      )
          .filter((r) => !(r.isArchived || r.isFork))
          .map((r) => r.name);

const fields = Object.entries(settings).flatMap(([k, v]) => [
    '-F',
    `${k}=${v}`,
]);
for (const repo of repos) {
    gh(['api', '-X', 'PATCH', `repos/${owner}/${repo}`, ...fields, '--silent']);
    console.log(`✓ ${repo}`);
}
