/**
 * schedule:install — link every job's plist into ~/Library/LaunchAgents and load it.
 */
import { execFile } from 'node:child_process';
import { lstat, readdir, readlink, symlink, unlink } from 'node:fs/promises';
import { homedir, userInfo } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const jobDir = join(dirname(fileURLToPath(import.meta.url)), 'jobs');
const agentDir = join(homedir(), 'Library', 'LaunchAgents');
const domain = `gui/${userInfo().uid}`;
const unloadAttemptCap = 25;
const unloadPollMs = 200;

const install = async () => {
    const jobList = await readJobList();

    if (jobList.length === 0) {
        console.log('no jobs under schedule/jobs — nothing to install.');
        return;
    }

    for (const job of jobList) {
        const line = await installJob(job);
        console.log(line);
    }
};

/* Helpers */
const readJobList = async (): Promise<Job[]> => {
    const nameList = await readdir(jobDir, { withFileTypes: true });
    const jobList = await Promise.all(
        nameList
            .filter((entry) => entry.isDirectory())
            .map((entry) => readJob(entry.name)),
    );

    return jobList.filter((job) => job !== null);
};

const readJob = async (name: string): Promise<Job | null> => {
    const fileList = await readdir(join(jobDir, name));
    const plistName = fileList.find(
        (file) => file.startsWith('com.dima.') && file.endsWith('.plist'),
    );

    // A job directory with no plist is a cloud task: it has no local process to
    // load, only a heartbeat under schedule/state that the reader picks up.
    if (!plistName) return null;

    return {
        label: plistName.slice(0, -'.plist'.length),
        name,
        source: join(jobDir, name, plistName),
    };
};

const installJob = async (job: Job): Promise<string> => {
    const target = join(agentDir, `${job.label}.plist`);
    const linked = await linkPlist(job.source, target);

    if (linked !== null) return `🔴 ${job.name} — ${linked}`;

    // launchd caches the resolved path at bootstrap, so an edited or re-linked
    // plist changes nothing until the job is booted out and back in.
    await run('launchctl', ['bootout', `${domain}/${job.label}`]).catch(
        () => null,
    );

    if (!(await waitForUnload(job.label))) {
        return `🔴 ${job.name} — still loaded after bootout, not rebootstrapped`;
    }

    try {
        await run('launchctl', ['bootstrap', domain, target]);
    } catch (error) {
        return `🔴 ${job.name} — bootstrap refused: ${toMessage(error)}`;
    }

    return `🟢 ${job.name} — linked and loaded`;
};

// `bootout` returns before launchd has finished tearing the job down, and a bootstrap
// racing that teardown is refused — so the signal waited on is the service actually
// leaving the domain, never a fixed sleep.
const waitForUnload = async (label: string): Promise<boolean> => {
    for (let attempt = 0; attempt < unloadAttemptCap; attempt++) {
        const loaded = await run('launchctl', ['print', `${domain}/${label}`])
            .then(() => true)
            .catch(() => false);

        if (!loaded) return true;

        await new Promise((resolve) => setTimeout(resolve, unloadPollMs));
    }

    return false;
};

// Returns null on success, or why the link could not be made.
const linkPlist = async (
    source: string,
    target: string,
): Promise<string | null> => {
    const current = await lstat(target).catch(() => null);

    if (current?.isSymbolicLink()) {
        if ((await readlink(target)) === source) return null;

        await unlink(target);
    } else if (current) {
        return `${target} is a real file, not ours to replace`;
    }

    await symlink(source, target);

    return null;
};

const toMessage = (error: unknown) =>
    error instanceof Error ? error.message.split('\n')[0] : String(error);

/* Types */
interface Job {
    label: string;
    name: string;
    source: string;
}

await install();
