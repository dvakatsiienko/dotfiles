import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import {
    Action,
    ActionPanel,
    Form,
    Toast,
    popToRoot,
    showToast,
} from '@raycast/api';

const run = promisify(execFile);
const gmailDir = join(homedir(), 'dotfiles', 'gmail');
const blocklistPath = join(gmailDir, 'blocklist.json');

const GmailBlockSender = () => {
    const handleSubmit = async ({ mode, sender }: Values) => {
        const value = normalise(mode, sender);
        if (!value) {
            await showToast(Toast.Style.Failure, 'nothing to block');
            return;
        }

        const toast = await showToast(
            Toast.Style.Animated,
            `blocking ${value}`,
        );
        const blocklist = readBlocklist();
        if (blocklist[mode].includes(value)) {
            toast.style = Toast.Style.Success;
            toast.title = `${value} is already blocked`;
            return;
        }
        blocklist[mode] = [...blocklist[mode], value];
        writeFileSync(blocklistPath, `${JSON.stringify(blocklist, null, 4)}\n`);

        try {
            await run('gmailctl', ['apply', '--yes', '--config', gmailDir]);
            toast.style = Toast.Style.Success;
            toast.title = `${value} blocked — old mail needs one search by hand`;
            await popToRoot();
        } catch (error) {
            toast.style = Toast.Style.Failure;
            toast.title = 'blocklist saved, gmailctl apply failed';
            toast.message = (error as Error).message;
        }
    };

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm onSubmit={handleSubmit} title='Block' />
                </ActionPanel>
            }>
            <Form.TextField
                id='sender'
                info='an address, a domain, or the display name spam keeps using'
                placeholder='news@example.com'
                title='Sender'
            />
            <Form.Dropdown
                defaultValue='address'
                id='mode'
                info='address — that one sender. domain — everything from it (never gmail.com). name — the from: display name, for spam that rotates addresses'
                title='Block'>
                <Form.Dropdown.Item title='this address' value='address' />
                <Form.Dropdown.Item title='the whole domain' value='domain' />
                <Form.Dropdown.Item title='this sender name' value='name' />
            </Form.Dropdown>
            <Form.Description
                text='delete on arrival, via gmailctl. mail that already arrived stays until you search it by hand.'
                title='What happens'
            />
        </Form>
    );
};

export default GmailBlockSender;

/* Helpers */
const readBlocklist = () =>
    JSON.parse(readFileSync(blocklistPath, 'utf8')) as Blocklist;

// domain mode takes whatever he pasted — a bare domain, an address, or `@domain` — and keeps the
// domain only; the other two modes are the trimmed text.
const normalise = (mode: Mode, sender: string) => {
    const text = sender.trim();
    if (mode !== 'domain') return text;
    return text.replace(/^.*@/, '').toLowerCase();
};

/* Types */
type Mode = 'address' | 'domain' | 'name';
type Blocklist = Record<Mode, string[]>;
type Values = { sender: string; mode: Mode };
