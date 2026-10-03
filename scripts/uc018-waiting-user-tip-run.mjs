#!/usr/bin/env node
/**
 * GAP-UC018-WAITING-USER tip runner.
 *
 * Runs the two waiting_user proves at the worktree HEAD (the commit that
 * contains this file) and writes one machine receipt. It does not accept a
 * target SHA, does not check out history, and does not import or call the
 * receipt-backfill emitter, guard, or facts module.
 *
 * Receipt path is fixed under ai-docs/delivery/receipts/uc018-waiting-user-tip/.
 * evidenceOfRecord stays false. Empty stack is not MET. A nonzero prove exit
 * is recorded as-is (no retry, no wash to 0).
 *
 * Pins written into the receipt: NOT_HA, releaseEvidence=false,
 * claimProductionHA=false, gR45Closed=true, coveredCountRetained=8,
 * ms3EqualsR4Closed=false, PG-retained, public DELETE 503.
 * This run does not mark UC-018 covered.
 */
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import {
  createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RECEIPT_DIR_REL = 'ai-docs/delivery/receipts/uc018-waiting-user-tip';
const BACKFILL_PREFIX = 'ai-docs/delivery/receipts/uc018-receipt-backfill';
const RECEIPT_REL = `${RECEIPT_DIR_REL}/waiting-user-tip.json`;
const BANNED_HISTORICAL_PREFIXES = Object.freeze([
  '85d36c7',
  'f06dcba',
  '549da9c',
  'e88d386',
  '23f98d3',
  'bdc5993',
  'b29c191',
]);
const PROVES = Object.freeze([
  {
    id: 'uc018:abandon:prove',
    args: ['uc018:abandon:prove'],
    logRel: `${RECEIPT_DIR_REL}/logs/uc018-abandon-prove.log`,
  },
  {
    id: 'uc018:abandon:http:prove',
    args: ['uc018:abandon:http:prove'],
    logRel: `${RECEIPT_DIR_REL}/logs/uc018-abandon-http-prove.log`,
  },
]);
const PROVE_TIMEOUT_MS = 20 * 60 * 1000;

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function porcelainLines() {
  const out = git(['status', '--porcelain']);
  return out ? out.split('\n').filter(Boolean) : [];
}

function isoPt(date) {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    fractionalSecondDigits: 3,
    timeZoneName: 'longOffset',
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  let off = String(parts.timeZoneName || '').replace(/^GMT/, '');
  if (off === '' || off === 'Z') off = '+00:00';
  else if (/^[+-]\d{1,2}$/.test(off)) off = `${off[0]}${off.slice(1).padStart(2, '0')}:00`;
  else if (/^[+-]\d{4}$/.test(off)) off = `${off.slice(0, 3)}:${off.slice(3)}`;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${parts.fractionalSecond}${off}`;
}

function sha256File(abs) {
  return createHash('sha256').update(readFileSync(abs)).digest('hex');
}

function isBannedHistorical(sha) {
  return BANNED_HISTORICAL_PREFIXES.some((p) => sha.startsWith(p));
}

function runProve(spec) {
  const logAbs = join(ROOT, spec.logRel);
  mkdirSync(dirname(logAbs), { recursive: true });
  return new Promise((resolveRun) => {
    const out = createWriteStream(logAbs);
    const child = spawn('pnpm', spec.args, {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.pipe(out, { end: false });
    child.stderr.pipe(out, { end: false });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000).unref();
    }, PROVE_TIMEOUT_MS);
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      out.end(() => {
        const exit = timedOut || code == null ? 124 : code;
        resolveRun({
          id: spec.id,
          cmd: `pnpm ${spec.args.join(' ')}`,
          exit,
          signal: signal ?? null,
          timedOut,
          logRel: spec.logRel,
          stdoutDigest: `sha256:${sha256File(logAbs)}`,
        });
      });
    });
  });
}

function writeReceipt(receipt) {
  const abs = join(ROOT, RECEIPT_REL);
  if (RECEIPT_REL.startsWith(BACKFILL_PREFIX)) {
    throw new Error('refuse-backfill-path');
  }
  mkdirSync(dirname(abs), { recursive: true });
  const tmp = `${abs}.tmp-${process.pid}`;
  writeFileSync(tmp, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  renameSync(tmp, abs);
  return abs;
}

async function main() {
  if (process.argv.slice(2).length > 0) {
    console.error('uc018-waiting-user-tip-run: no arguments (refusing a historical SHA pin)');
    process.exit(2);
  }
  if (RECEIPT_DIR_REL.startsWith(BACKFILL_PREFIX) || RECEIPT_REL.includes('uc018-receipt-backfill')) {
    console.error('uc018-waiting-user-tip-run: receipt path collides with backfill dir');
    process.exit(2);
  }
  if (existsSync(join(ROOT, RECEIPT_REL))) {
    console.error(`uc018-waiting-user-tip-run: receipt already exists (${RECEIPT_REL}); refusing a second run`);
    process.exit(2);
  }

  const headAtStart = git(['rev-parse', 'HEAD']);
  if (!/^[0-9a-f]{40}$/.test(headAtStart)) {
    console.error('uc018-waiting-user-tip-run: HEAD is not a full sha');
    process.exit(2);
  }
  const dirty = porcelainLines();
  const historical = isBannedHistorical(headAtStart);
  const ranAt = isoPt(new Date());

  const base = {
    knife: 'GAP-UC018-WAITING-USER',
    emittedBy: 'scripts/uc018-waiting-user-tip-run.mjs',
    ranAt,
    runAt: ranAt,
    targetSha: headAtStart,
    wrapperSha: headAtStart,
    runnerCommitSha: headAtStart,
    gitSha: headAtStart,
    historicalTip: historical,
    cmds: PROVES.map((p) => p.id),
    stack: {},
    stackIsRuntimeMet: false,
    caps: {},
    evidenceOfRecord: false,
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    gR45Closed: true,
    coveredCountRetained: 8,
    ms3EqualsR4Closed: false,
    pgRetained: true,
    publicDeleteStatus: 503,
    uc018MatrixStatus: 'partial',
    porcelainBefore: dirty,
    nodeVersion: process.version,
  };

  if (dirty.length > 0 || historical) {
    const receipt = {
      ...base,
      exit: 2,
      exits: Object.fromEntries(PROVES.map((p) => [p.id, null])),
      cmdsRan: false,
      precondition: historical ? 'historical-tip' : 'dirty-tree',
    };
    writeReceipt(receipt);
    console.log(`WAITING_USER_TIP_RECEIPT gitSha=${headAtStart} exit=2 precondition=${receipt.precondition}`);
    process.exit(2);
  }

  let pnpmVersion = null;
  try {
    pnpmVersion = execFileSync('pnpm', ['-v'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    pnpmVersion = null;
  }

  const results = [];
  for (const spec of PROVES) {
    results.push(await runProve(spec));
  }
  const headAtEnd = git(['rev-parse', 'HEAD']);
  const exits = Object.fromEntries(results.map((r) => [r.id, r.exit]));
  const proveBad = results.find((r) => r.exit !== 0);
  const drifted = headAtEnd !== headAtStart;
  const exit = drifted ? (proveBad ? proveBad.exit : 3) : (proveBad ? proveBad.exit : 0);

  const receipt = {
    ...base,
    pnpmVersion,
    exit,
    exits,
    cmdsRan: true,
    headDrift: drifted,
    headAtEnd,
    commandResults: results.map((r) => ({
      id: r.id,
      cmd: r.cmd,
      exit: r.exit,
      signal: r.signal,
      timedOut: r.timedOut,
      logRel: r.logRel,
      stdoutDigest: r.stdoutDigest,
    })),
    porcelainAfterProve: porcelainLines().filter((line) => !line.includes(RECEIPT_DIR_REL)),
  };
  // Equality is the commit that ran, not a later receipt commit.
  if (!drifted) {
    receipt.runnerCommitSha = headAtStart;
    receipt.gitSha = headAtStart;
    receipt.targetSha = headAtStart;
    receipt.wrapperSha = headAtStart;
  }
  const out = writeReceipt(receipt);
  console.log(`WAITING_USER_TIP_RECEIPT gitSha=${receipt.gitSha} runnerCommitSha=${receipt.runnerCommitSha} exit=${exit} path=${out}`);
  process.exit(exit);
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
