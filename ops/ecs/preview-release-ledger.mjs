import { mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';

const STATES = new Set(['idle', 'staged', 'active_unpublished', 'edge_probing', 'publishing', 'verified', 'revoked', 'failed']);
const TRANSITIONS = new Map([
  ['idle', new Set(['staged', 'revoked'])],
  ['failed', new Set(['staged', 'revoked'])],
  ['revoked', new Set(['staged'])],
  ['staged', new Set(['active_unpublished', 'revoked', 'failed'])],
  // `edge_probing` is a deliberately narrow, non-resumable state: it is the
  // only state in which a temporary Funnel can be opened for the external
  // black-box check. Pages remains disabled and a reboot must fail it closed.
  ['active_unpublished', new Set(['edge_probing', 'revoked', 'failed'])],
  ['edge_probing', new Set(['publishing', 'revoked', 'failed'])],
  ['publishing', new Set(['verified', 'revoked', 'failed'])],
  ['verified', new Set(['revoked', 'failed'])],
]);

function option(args, name) {
  const index = args.indexOf(name);
  if (index < 0 || index === args.length - 1) throw new Error(`preview_ledger_${name.slice(2)}_required`);
  return args[index + 1];
}

async function load(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    if (parsed.schemaVersion !== 1 || !STATES.has(parsed.state)) throw new Error('preview_ledger_invalid');
    return parsed;
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return { schemaVersion: 1, generation: 0, state: 'idle', updatedAt: null, releaseDigest: null, fingerprint: null, origin: null, pages: 'disabled' };
    }
    throw error;
  }
}

async function write(path, value) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.${process.pid}.${randomUUID()}.tmp`;
  const handle = await open(temp, 'wx', 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(temp, path);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
  const directory = await open(dirname(path), 'r');
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , command, ...args] = process.argv;
  const path = resolve(option(args, '--path'));
  if (command === 'read') {
    process.stdout.write(`${JSON.stringify(await load(path))}\n`);
  } else if (command === 'transition') {
    const from = option(args, '--from');
    const to = option(args, '--to');
    const prior = await load(path);
    if (!STATES.has(to) || prior.state !== from || !TRANSITIONS.get(from)?.has(to)) throw new Error('preview_ledger_transition_invalid');
    const next = {
      schemaVersion: 1,
      generation: prior.generation + 1,
      state: to,
      updatedAt: new Date().toISOString(),
      releaseDigest: option(args, '--release') || null,
      fingerprint: option(args, '--fingerprint') || null,
      origin: option(args, '--origin') || null,
      pages: option(args, '--pages') || 'disabled',
    };
    await write(path, next);
    process.stdout.write(`${JSON.stringify(next)}\n`);
  } else {
    throw new Error('usage: preview-release-ledger.mjs read|transition');
  }
}
