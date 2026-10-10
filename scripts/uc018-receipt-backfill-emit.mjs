#!/usr/bin/env node
/**
 * Tip-side UC018 receipt-backfill emitter.
 * Runs prove at recorded targetSha in a disposable worktree; writes NEW receipt JSON
 * under ai-docs/delivery/receipts/uc018-receipt-backfill/ (never overwrites legacy receipts).
 *
 * Modes:
 *   (default) full worktree prove
 *   --mode=reemit-from-log  rebuild JSON from EXISTING committed log (+ prior digests);
 *                           append attempts.jsonl; do not re-run prove
 *
 * Ban: tip run as substitute for old-SHA; retry-until-green; hand-written JSON;
 *      hardcoded stack facts without source; a default HMAC key; reading .env*.
 * New receipts are HMAC-SHA256 over canonical JSON claims and log bytes.
 * Key is process env MEETWISE_UC018_BACKFILL_HMAC_KEY only. Missing key exits 8.
 */
import { spawnSync, spawn, execSync } from 'node:child_process';
import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, appendFileSync,
} from 'node:fs';
import { join, resolve, isAbsolute } from 'node:path';
import {
  EMITTED_BY, sha256File, validateMachineEmittedReceipt,
  attachEmitterHmac, resolveHmacKey, HMAC_KEY_ENV,
} from './lib/uc018-receipt-backfill-guard.mjs';
import {
  parseStackFromLog,
  buildImageDigests,
  parseTargetEnvFromLog,
  capacityRepresentativeFact,
  STACK_KEYS,
  unobservedFact,
  TRACKED_IMAGES,
  parseIsolatedPgBannerContainer,
  parseContainerInspectOutput,
  LIVE_CONTAINER_INSPECT_SOURCE,
  ISOLATED_PG_TRACKED_IMAGE,
} from './lib/uc018-receipt-backfill-facts.mjs';

function arg(name, def = null) {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.slice(name.length + 3) : def;
}
function sh(cmd, opts = {}) {
  return spawnSync('bash', ['-lc', cmd], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
}
function git(tipRoot, args) {
  return execSync(`git ${args}`, { cwd: tipRoot, encoding: 'utf8' }).trim();
}
function porcelain(cwd) {
  const o = sh('git status --porcelain', { cwd });
  return (o.stdout || '').trim().split('\n').filter(Boolean);
}
function recordAttempt(attemptsPath, row) {
  mkdirSync(join(attemptsPath, '..'), { recursive: true });
  appendFileSync(attemptsPath, JSON.stringify(row) + '\n', 'utf8');
}

const tipRoot = resolve(arg('tipRoot', process.cwd()));
const mode = arg('mode', 'prove'); // prove | reemit-from-log
const key = arg('key');
const targetSha = arg('targetSha');
const cmd = arg('cmd'); // e.g. uc018:sole:prove
const worktreeBase = resolve(arg('worktreeBase', '/workspace/meetwise-lineA-backfill'));

if (!key || !targetSha || !cmd) {
  console.error('Usage: --key= --targetSha= --cmd=uc018:…:prove [--mode=prove|reemit-from-log]');
  process.exit(2);
}
if (!resolveHmacKey()) {
  console.error(`fail closed: ${HMAC_KEY_ENV} missing (no default key, no .env read)`);
  process.exit(8);
}

function childEnv(extra = {}) {
  const env = { ...process.env, ...extra };
  delete env[HMAC_KEY_ENV];
  return env;
}

const wrapperSha = git(tipRoot, 'rev-parse HEAD');
const targetFull = git(tipRoot, `rev-parse ${targetSha}`);
const ranAt = new Date().toISOString();
const receiptDir = join(tipRoot, 'ai-docs/delivery/receipts/uc018-receipt-backfill');
const logRel = `ai-docs/delivery/receipts/uc018-receipt-backfill/logs/${key}-${targetSha.slice(0, 7)}.log`;
const logAbs = join(tipRoot, logRel);
const attemptsPath = join(receiptDir, 'attempts.jsonl');
const wtPath = join(worktreeBase, targetSha.slice(0, 7));
const outRel = `ai-docs/delivery/receipts/uc018-receipt-backfill/${key}.json`;
const outPath = join(tipRoot, outRel);

mkdirSync(join(receiptDir, 'logs'), { recursive: true });

function emptySourcedStack() {
  const s = {};
  for (const k of STACK_KEYS) s[k] = unobservedFact();
  return s;
}

function buildReceiptBody({
  installExit, proveExit, logBody, nodeV, pnpmV, priorImageDigests,
  digestMode = 'reemit', priorCapturedAt = null, liveCaptures = [],
}) {
  // Always write/overwrite log when logBody provided; reemit keeps existing bytes
  if (logBody != null) {
    writeFileSync(logAbs, logBody, 'utf8');
  }
  if (!existsSync(logAbs)) {
    throw new Error('log-missing:' + logAbs);
  }
  const logText = readFileSync(logAbs, 'utf8');
  const stdoutDigest = sha256File(logAbs);
  const exit = typeof proveExit === 'number' ? proveExit : (installExit ?? 1);
  const cmds = {};
  cmds[cmd] = exit;
  const stack = parseStackFromLog(logText, { logRel });
  const imageDigests = buildImageDigests(logText, priorImageDigests || {}, {
    logRel,
    mode: digestMode,
    priorCapturedAt,
    liveCaptures,
  });
  const targetEnvFact = parseTargetEnvFromLog(logText, { logRel });
  const capFact = capacityRepresentativeFact();

  const receipt = {
    knife: 'UC-E2E-018-RECEIPT-BACKFILL',
    gap: 'GAP-UC018-RECEIPT-BACKFILL',
    key,
    emittedBy: EMITTED_BY,
    ranAt,
    targetSha: targetFull,
    wrapperSha,
    runnerCommitSha: targetFull,
    gitSha: targetFull,
    cmd: `pnpm ${cmd}`,
    exit,
    cmds,
    exits: { [cmd]: exit },
    installExit: installExit == null ? null : installExit,
    logPath: logRel,
    stdoutDigest,
    nodeVersion: nodeV,
    pnpmVersion: pnpmV,
    imageDigests,
    stack,
    targetEnv: targetEnvFact.value,
    targetEnvSource: targetEnvFact,
    capacityRepresentative: capFact.value,
    capacityRepresentativeSource: capFact,
    evidenceOfRecord: true,
    implementerOnly: false,
    disclosure:
      'EOR@targetSha ≠ proven at tip (code drift). Machine-emitted backfill at recorded ancestor SHA; Ban tip-substitution; Ban hand-write JSON from prose. Emitter HMAC binds JSON claims + log bytes via MEETWISE_UC018_BACKFILL_HMAC_KEY (process env only; Ban default key; Ban .env read).',
    waitingUser: 'MISSING-EVIDENCE',
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    coveredCountRetained: 8,
  };
  if (key === 'PERF-LOAD') {
    receipt.command = `pnpm ${cmd}`;
    receipt.caps = {
      enforced: true,
      method: 'docker-isolated (backfill; capacityRepresentative=false)',
      note: 'C-PERF-CAP-PARTIAL · local/docker only · Ban elevate',
      source: 'policy-C-PERF-CAP-PARTIAL',
    };
  }
  // soleStack from static ADR pins (source=static-doc; Ban runtime stack MET)
  if (key === 'SOLE' && stack.postgresSaver?.value === true && stack.postgres?.value === true) {
    receipt.soleStack = {
      value: 'Postgres+pgvector+PostgresSaver',
      source: 'static-doc',
      logFile: logRel,
      note: 'ADR pins in static sole prove; unwrapStackValue rejects static-doc as runtime MET',
    };
  }
  return receipt;
}

function finalizeReceipt(receipt, attemptExtra = {}) {
  const keyMaterial = resolveHmacKey();
  if (!keyMaterial) {
    const v = { ok: false, signed: false, reason: 'hmac-key-missing' };
    recordAttempt(attemptsPath, {
      key,
      targetSha: targetFull,
      wrapperSha,
      installExit: receipt.installExit,
      proveExit: receipt.exit,
      outPath: outRel,
      validate: v,
      ranAt,
      ...attemptExtra,
      note: `missing process env ${HMAC_KEY_ENV}; Ban default key; Ban .env read`,
    });
    console.error(JSON.stringify({
      ok: false, key, targetSha: targetFull, wrapperSha,
      reason: 'hmac-key-missing', env: HMAC_KEY_ENV, mode,
    }, null, 2));
    process.exit(8);
  }
  const logAbsForHmac = isAbsolute(receipt.logPath)
    ? receipt.logPath
    : join(tipRoot, receipt.logPath);
  const logBytes = readFileSync(logAbsForHmac);
  const signed = attachEmitterHmac(receipt, logBytes, keyMaterial);
  if (!signed.ok) {
    recordAttempt(attemptsPath, {
      key,
      targetSha: targetFull,
      wrapperSha,
      installExit: receipt.installExit,
      proveExit: receipt.exit,
      outPath: outRel,
      validate: signed,
      ranAt,
      ...attemptExtra,
    });
    console.error(JSON.stringify({ ok: false, reason: signed.reason, mode }, null, 2));
    process.exit(8);
  }
  const finalReceipt = signed.receipt;
  writeFileSync(outPath, JSON.stringify(finalReceipt, null, 2) + '\n', 'utf8');
  const v = validateMachineEmittedReceipt(finalReceipt, { root: tipRoot });
  recordAttempt(attemptsPath, {
    key,
    targetSha: targetFull,
    wrapperSha,
    installExit: finalReceipt.installExit,
    proveExit: finalReceipt.exit,
    outPath: outRel,
    validate: v,
    signed: v.signed === true,
    ranAt,
    ...attemptExtra,
  });
  console.log(JSON.stringify({
    ok: v.ok, signed: v.signed === true, key, targetSha: targetFull, wrapperSha,
    installExit: finalReceipt.installExit, proveExit: finalReceipt.exit, outPath, validate: v,
    mode,
  }, null, 2));
  if (!v.ok) process.exit(5);
}

// ---------- reemit-from-log (no worktree / no re-prove) ----------
if (mode === 'reemit-from-log') {
  if (!existsSync(logAbs)) {
    console.error('reemit-from-log requires existing log:', logRel);
    process.exit(6);
  }
  let prior = {};
  if (existsSync(outPath)) {
    try { prior = JSON.parse(readFileSync(outPath, 'utf8')); } catch { prior = {}; }
  }
  const proveExit = typeof prior.exit === 'number' ? prior.exit : null;
  if (proveExit == null) {
    // try parse EXIT= from log last prove banner
    const logText = readFileSync(logAbs, 'utf8');
    const m = logText.match(/=== pnpm \S+ EXIT=(\d+) ===/g);
    const last = m && m.length ? m[m.length - 1] : null;
    const em = last && last.match(/EXIT=(\d+)/);
    if (!em) {
      console.error('cannot determine proveExit for reemit');
      process.exit(7);
    }
  }
  const exitResolved = typeof prior.exit === 'number'
    ? prior.exit
    : Number((readFileSync(logAbs, 'utf8').match(/=== pnpm \S+ EXIT=(\d+) ===/g) || [])
      .pop()
      ?.match(/EXIT=(\d+)/)?.[1] ?? 1);

  // priorCapturedAt: first-wave live inspect time (original ranAt), else inherited
  let priorCap = prior.ranAt || null;
  const prevImg = prior.imageDigests || {};
  for (const ent of Object.values(prevImg)) {
    if (ent && typeof ent === 'object' && (ent.priorCapturedAt || ent.capturedAt)) {
      priorCap = ent.priorCapturedAt || ent.capturedAt;
      break;
    }
  }
  const receipt = buildReceiptBody({
    installExit: prior.installExit ?? 0,
    proveExit: exitResolved,
    logBody: null, // keep existing log bytes (digest stable)
    nodeV: prior.nodeVersion ?? null,
    pnpmV: prior.pnpmVersion ?? null,
    priorImageDigests: prior.imageDigests || {},
    digestMode: 'reemit',
    priorCapturedAt: priorCap,
  });
  // Preserve original ranAt from first emit if present; record reemit in attempts
  if (prior.ranAt) receipt.ranAt = prior.ranAt;
  receipt.reemittedAt = ranAt;
  receipt.reemitNote =
    'format upgrade: static-doc stack + prior-docker-inspect digests from committed log; prove not re-run; wrapperSha=tip emitter (≠ prove-wave 7433807)';
  finalizeReceipt(receipt, { phase: 'reemit-from-log', priorExit: prior.exit ?? null });
  process.exit(0);
}

// ---------- full prove mode ----------
mkdirSync(worktreeBase, { recursive: true });

const tipDirty = porcelain(tipRoot).filter((line) => {
  const path = line.replace(/^\?\? /, '').replace(/^[ MADRCU]{1,2} /, '').trim();
  if (path.startsWith('ai-docs/delivery/receipts/uc018-receipt-backfill')) return false;
  if (path.startsWith('.tmp/')) return false;
  return true;
});
if (tipDirty.length) {
  console.error('DIRTY_TREE tip:', tipDirty.slice(0, 20).join('\n'));
  process.exit(3);
}

try {
  git(tipRoot, `merge-base --is-ancestor ${targetFull} HEAD`);
} catch {
  console.error('targetSha not ancestor of tip HEAD');
  process.exit(4);
}

sh(`git worktree remove --force ${JSON.stringify(wtPath)} 2>/dev/null || rm -rf ${JSON.stringify(wtPath)}`, {
  cwd: tipRoot,
});

const add = sh(`git worktree add --detach ${JSON.stringify(wtPath)} ${targetFull}`, { cwd: tipRoot });
if (add.status !== 0) {
  const row = {
    key, targetSha: targetFull, wrapperSha, phase: 'worktree-add',
    exit: add.status ?? 1, stderr: (add.stderr || '').slice(0, 2000), ranAt,
  };
  recordAttempt(attemptsPath, row);
  const receipt = buildReceiptBody({
    installExit: null,
    proveExit: add.status ?? 1,
    logBody: add.stderr || add.stdout || 'worktree-add-failed',
    nodeV: null, pnpmV: null, priorImageDigests: {},
  });
  finalizeReceipt(receipt, { phase: 'worktree-add-fail' });
  process.exit(0);
}

function collectImageDigestsRaw(cwd) {
  const digests = {};
  const images = [
    'pgvector/pgvector:pg16',
    'redis:7-alpine',
    'minio/minio:latest',
    'mailhog/mailhog:v1.0.1',
  ];
  for (const img of images) {
    const r = sh(`docker image inspect ${JSON.stringify(img)} --format '{{json .RepoDigests}}' 2>/dev/null || echo '[]'`, { cwd });
    try {
      digests[img] = JSON.parse((r.stdout || '[]').trim() || '[]');
    } catch {
      digests[img] = [];
    }
  }
  return digests;
}

// ---------- C-IMAGE-DIGEST fix: LIVE per-run image digest capture ----------
//
// The run container is `docker run --rm` (run-e2e-isolated.mjs) and is removed in
// its finally (and in this emitter's own finally below): after the prove child
// exits, `docker inspect <container>` cannot succeed. The capture therefore MUST
// happen inside the run window: the prove child is spawned as a STREAMING pipe
// (not the buffered spawnSync sh()), each output line is observed as it arrives,
// and when the unique run banner ("E2E isolated PostgreSQL: meetwise-e2e-<pid>-<ts>
// on 127.0.0.1:<port>") is seen, that EXACT banner-parsed container is inspected
// immediately — while the container is still alive. Ban: impersonating a live
// observation from host tag inspects, from post-exit inspect failures, or from
// name-prefix polling that could hit a concurrent run's container.

/** Stream a prove child line-by-line; onLine observes each line as it arrives. */
function runProveStreaming(cmdLine, { cwd, env, onLine }) {
  return new Promise((resolvePromise) => {
    const child = spawn('bash', ['-lc', cmdLine], { cwd, env });
    let out = '';
    let err = '';
    let outLineBuf = '';
    let errLineBuf = '';
    let settled = false;
    const emitLines = (chunk, bufKey) => {
      let buf = bufKey === 'out' ? outLineBuf : errLineBuf;
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (onLine) {
          try { onLine(line); } catch { /* observer must never break the prove run */ }
        }
      }
      if (bufKey === 'out') outLineBuf = buf; else errLineBuf = buf;
    };
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      out += chunk;
      emitLines(chunk, 'out');
    });
    child.stderr.on('data', (chunk) => {
      err += chunk;
      emitLines(chunk, 'err');
    });
    const finish = (code, extraErr = '') => {
      if (settled) return;
      settled = true;
      // flush a trailing line without newline (banner could arrive un-terminated)
      for (const tail of [outLineBuf, errLineBuf]) {
        if (tail !== '' && onLine) {
          try { onLine(tail); } catch { /* ignore observer errors */ }
        }
      }
      resolvePromise({
        status: code,
        stdout: out,
        stderr: extraErr ? err + extraErr : err,
      });
    };
    child.on('error', (e) => finish(1, `\n[emitter] spawn error: ${e && e.message}\n`));
    child.on('close', (code) => finish(code));
  });
}

const liveCaptureAttempts = []; // every attempt (ok or failed) — attempts-ledger honesty
const seenBannerContainers = new Set();

/** docker inspect the banner-parsed run container NOW — inside the run window. */
function inspectRunContainerLive(containerName, bannerLine) {
  const capturedAt = new Date().toISOString(); // real in-window inspect moment
  const fmt = '{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Running}}';
  const r = sh(
    `docker inspect --format ${JSON.stringify(fmt)} ${JSON.stringify(containerName)}`,
  );
  const parsed = parseContainerInspectOutput(r.stdout || '');
  if (r.status !== 0 || !parsed.ok) {
    return {
      ok: false,
      source: LIVE_CONTAINER_INSPECT_SOURCE,
      containerName,
      image: ISOLATED_PG_TRACKED_IMAGE, // banner-identified service; image ref unconfirmed
      attributionNote: 'attributed via E2E isolated PostgreSQL banner; image ref unconfirmed (inspect failed)',
      reason: r.status !== 0 ? 'docker-inspect-failed' : parsed.reason,
      detail: ((r.stderr || '') + ' ' + (parsed.detail || '')).trim().slice(0, 240),
      bannerLine: String(bannerLine).slice(0, 240),
      capturedAt,
    };
  }
  if (!TRACKED_IMAGES.includes(parsed.configImage)) {
    return {
      ok: false,
      source: LIVE_CONTAINER_INSPECT_SOURCE,
      containerName,
      image: ISOLATED_PG_TRACKED_IMAGE,
      observedConfigImage: parsed.configImage,
      observedImageDigest: parsed.imageDigest,
      reason: 'untracked-config-image',
      bannerLine: String(bannerLine).slice(0, 240),
      capturedAt,
    };
  }
  return {
    ok: true,
    source: LIVE_CONTAINER_INSPECT_SOURCE,
    containerName,
    image: parsed.configImage,
    imageDigest: parsed.imageDigest,
    containerId: parsed.containerId,
    configImage: parsed.configImage,
    running: true,
    bannerLine: String(bannerLine).slice(0, 240),
    capturedAt,
  };
}

/** Observe one prove-output line; on the run banner, inspect that exact container in-window. */
function observeProveLineForLiveDigest(line) {
  const parsed = parseIsolatedPgBannerContainer(line);
  if (!parsed) return;
  if (seenBannerContainers.has(parsed.containerName)) return;
  seenBannerContainers.add(parsed.containerName);
  if (!parsed.trusted) {
    liveCaptureAttempts.push({
      ok: false,
      source: LIVE_CONTAINER_INSPECT_SOURCE,
      containerName: parsed.containerName,
      image: ISOLATED_PG_TRACKED_IMAGE,
      reason: parsed.reason,
      bannerLine: String(line).slice(0, 240),
      capturedAt: new Date().toISOString(),
    });
    return;
  }
  liveCaptureAttempts.push(inspectRunContainerLive(parsed.containerName, line));
}

try {
  const wtDirty = porcelain(wtPath);
  if (wtDirty.length) {
    const receipt = buildReceiptBody({
      installExit: null, proveExit: 3,
      logBody: 'DIRTY_TREE worktree\n' + wtDirty.join('\n'),
      nodeV: null, pnpmV: null, priorImageDigests: {},
    });
    finalizeReceipt(receipt, { phase: 'dirty-worktree' });
  } else {
    const nodeV = sh('node -v', { cwd: wtPath }).stdout.trim();
    const pnpmV = sh('pnpm -v', { cwd: wtPath }).stdout.trim();
    const imageDigestsPre = collectImageDigestsRaw(wtPath);

    const install = sh('pnpm install --frozen-lockfile', { cwd: wtPath, env: childEnv() });
    const installLog = `=== pnpm install --frozen-lockfile EXIT=${install.status} ===\n${install.stdout || ''}\n${install.stderr || ''}\n`;
    if (install.status !== 0) {
      const receipt = buildReceiptBody({
        installExit: install.status ?? 1,
        proveExit: install.status ?? 1,
        logBody: installLog,
        nodeV, pnpmV, priorImageDigests: imageDigestsPre,
        digestMode: 'live',
        liveCaptures: [], // no prove ran → no run window → no live capture possible
      });
      finalizeReceipt(receipt, { phase: 'install-fail', liveCaptures: [] });
    } else {
      // Streaming prove run: banner lines are observed DURING the run window so the
      // run container can be docker-inspected while it is still alive (C-IMAGE-DIGEST).
      const prove = await runProveStreaming(`pnpm ${cmd}`, {
        cwd: wtPath,
        env: childEnv({ CI: process.env.CI || '1' }),
        onLine: observeProveLineForLiveDigest,
      });
      const proveLog =
        installLog +
        `\n=== pnpm ${cmd} EXIT=${prove.status} ===\n${prove.stdout || ''}\n${prove.stderr || ''}\n`;
      // Host tag inspects stay as honest non-live fallback values only.
      const imageDigestsRaw = { ...imageDigestsPre, ...collectImageDigestsRaw(wtPath) };
      const receipt = buildReceiptBody({
        installExit: 0,
        proveExit: prove.status ?? 1,
        logBody: proveLog,
        nodeV, pnpmV, priorImageDigests: imageDigestsRaw,
        digestMode: 'live',
        liveCaptures: liveCaptureAttempts,
      });
      finalizeReceipt(receipt, { phase: 'prove', liveCaptures: liveCaptureAttempts });
    }
  }
} finally {
  sh(`git worktree remove --force ${JSON.stringify(wtPath)} 2>/dev/null || rm -rf ${JSON.stringify(wtPath)}`, {
    cwd: tipRoot,
  });
  sh(`docker ps -aq --filter name=meetwise-e2e --filter name=meetwise-uc018 | xargs -r docker rm -f 2>/dev/null || true`);
}

process.exit(0);
