#!/usr/bin/env node
/**
 * Prove: machine-only emitter guard refuses hand-written / edited JSON.
 * Also asserts gatherer prefers uc018-receipt-backfill overlays when valid,
 * and fail-closes (BACKFILL-FAILED) when proveExit≠0 or proveExit missing —
 * Ban silent legacy green.
 *
 * G-line (GAP-BACKFILL-EMITTER-UNAUTHENTICATED · HMAC): genuine signed emit
 * verifies; ANY content-changing single-byte mutation of the receipt JSON or
 * of the log bytes rejects (tamper detection, both directions); truncated /
 * wrong-scheme tags reject; missing key fails closed (no repo default key);
 * an attacker rewriting JSON+log together without the key rejects; unsigned
 * pre-HMAC receipts are labeled `unsigned-legacy`, never silently signed.
 * Fixture key is in-process only (Ban real secrets in the repo).
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
  EMITTED_BY,
  sha256Text,
  validateMachineEmittedReceipt,
  verifyMachineReceiptFile,
  verifyReceiptAuthenticity,
  computeReceiptAuth,
  canonicalJson,
  HMAC_KEY_ENV,
  HMAC_SCHEME,
  isBackfillReceiptShape,
  isPreferableBackfillReceipt,
} from './lib/uc018-receipt-backfill-guard.mjs';
import {
  stackFact, unobservedFact, TRACKED_IMAGES,
  unwrapStackValue, isLiveImageDigestEntry,
} from './lib/uc018-receipt-backfill-facts.mjs';
import { REFUSE_REASONS, evaluate } from './lib/uc-covered-evaluator.mjs';

const root = process.cwd();
let failed = 0;
function pass(msg) { console.log('PASS ', msg); }
function fail(msg) { console.error('FAIL ', msg); failed++; }

const tmp = join(root, '.tmp/uc018-receipt-backfill-prove');
mkdirSync(tmp, { recursive: true });
const logPath = join(tmp, 'sample.log');
const logBody = 'synthetic prove log line\nEXIT=0\n';
writeFileSync(logPath, logBody);
const digest = createHash('sha256').update(logBody, 'utf8').digest('hex');

function sourcedStackOk() {
  return {
    postgres: stackFact(true, 'log-parse', { line: 1, regex: 'synthetic' }),
    postgresSaver: stackFact(true, 'log-parse', { line: 1, regex: 'synthetic' }),
    memorySaver: stackFact(false, 'log-parse', { line: 1, regex: 'synthetic' }),
    mysql: stackFact(false, 'log-parse', { line: 1, regex: 'synthetic' }),
    qdrant: stackFact(false, 'log-parse', { line: 1, regex: 'synthetic' }),
  };
}
function imageDigestsOk() {
  const o = {};
  for (const img of TRACKED_IMAGES) {
    o[img] = { imageDigest: 'not-started', started: false, source: 'log-parse' };
  }
  return o;
}

const good = {
  emittedBy: EMITTED_BY,
  ranAt: new Date().toISOString(),
  targetSha: 'a'.repeat(40),
  wrapperSha: 'b'.repeat(40),
  runnerCommitSha: 'a'.repeat(40),
  cmd: 'pnpm uc018:sole:prove',
  exit: 0,
  logPath,
  stdoutDigest: digest,
  disclosure: 'EOR@targetSha ≠ proven at tip (code drift).',
  stack: sourcedStackOk(),
  imageDigests: imageDigestsOk(),
};
// G-line default gate: receipts without an HMAC tag are rejected by default
// (NEG #1: valid log digest but no signature → reject). Legacy-tolerant mode
// (requireAuth:false) labels them `unsigned-legacy` — never silently signed.
{
  const strict = validateMachineEmittedReceipt(good, { root });
  if (!strict.ok && strict.reason === 'hmac-missing') pass('unsigned machine receipt rejected by default (hmac-missing)');
  else fail('expected default hmac-missing got ' + JSON.stringify(strict));

  const legacy = validateMachineEmittedReceipt(good, { root, requireAuth: false });
  if (legacy.ok && legacy.authed === false && legacy.authStatus === 'unsigned-legacy') {
    pass('legacy-tolerant mode labels unsigned-legacy (not silently signed)');
  } else fail('expected unsigned-legacy label got ' + JSON.stringify(legacy));
}

// Hand-written: missing emittedBy
{
  const bad = { ...good, emittedBy: 'human-paste' };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && v.reason === 'emittedBy-mismatch') pass('hand-written emittedBy rejected');
  else fail('expected emittedBy-mismatch got ' + JSON.stringify(v));
}

// Edited digest
{
  const bad = { ...good, stdoutDigest: '0'.repeat(64) };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && v.reason === 'stdoutDigest-mismatch') pass('edited stdoutDigest rejected');
  else fail('expected stdoutDigest-mismatch got ' + JSON.stringify(v));
}

// Missing disclosure clause
{
  const bad = { ...good, disclosure: 'looks fine' };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && v.reason === 'disclosure-missing-eor-clause') pass('missing EOR disclosure rejected');
  else fail('expected disclosure-missing-eor-clause got ' + JSON.stringify(v));
}

// runnerCommitSha !== targetSha
{
  const bad = { ...good, runnerCommitSha: 'c'.repeat(40) };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && v.reason === 'runnerCommitSha-ne-targetSha') pass('runner/target mismatch rejected');
  else fail('expected runnerCommitSha-ne-targetSha got ' + JSON.stringify(v));
}

// Prose-only JSON (no log binding fields)
{
  const prose = { knife: 'fake', exit: 0, gitSha: 'deadbeef', note: 'I swear it passed' };
  const v = validateMachineEmittedReceipt(prose, { root });
  if (!v.ok) pass('prose JSON rejected (' + v.reason + ')');
  else fail('prose JSON unexpectedly accepted');
}

// D-A: stack fact without source rejected
{
  const bad = {
    ...good,
    stack: {
      ...sourcedStackOk(),
      postgresSaver: true, // hardcoded bare boolean — no source
    },
  };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && String(v.reason).includes('source')) pass('stack fact without source rejected (' + v.reason + ')');
  else fail('expected stack-source reject got ' + JSON.stringify(v));
}

// D-A / images: missing imageDigest field rejected
{
  const imgs = imageDigestsOk();
  delete imgs['minio/minio:latest'].imageDigest;
  const bad = { ...good, imageDigests: imgs };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && String(v.reason).includes('imageDigest')) pass('missing imageDigest field rejected (' + v.reason + ')');
  else fail('expected imageDigest-field-missing got ' + JSON.stringify(v));
}

if (!isBackfillReceiptShape(good)) fail('isBackfillReceiptShape false for good');
else pass('isBackfillReceiptShape true for good');
if (isBackfillReceiptShape({ exit: 0 })) fail('shape too loose');
else pass('isBackfillReceiptShape false for thin object');
if (!isPreferableBackfillReceipt(good)) fail('preferable false for exit=0 good');
else pass('isPreferableBackfillReceipt true for exit=0');
if (isPreferableBackfillReceipt({ ...good, exit: 1 })) fail('preferable true for exit=1');
else pass('isPreferableBackfillReceipt false for exit=1');

// Gatherer D-B cases
{
  const g = await import('./lib/uc-covered-real-gatherer.mjs');
  if (typeof g.readReceiptPreferBackfill !== 'function') {
    fail('gatherer missing readReceiptPreferBackfill export');
  } else {
    pass('gatherer exports readReceiptPreferBackfill');
  }
  if (g.WAITING_USER_BACKFILL_STATUS !== 'MISSING-EVIDENCE') {
    fail('WAITING_USER_BACKFILL_STATUS=' + g.WAITING_USER_BACKFILL_STATUS);
  } else pass('waiting_user = MISSING-EVIDENCE constant');

  const recvRoot = join(tmp, 'receipts');
  mkdirSync(join(recvRoot, 'uc018-receipt-backfill'), { recursive: true });
  const legacyRel = 'legacy-green.json';
  writeFileSync(join(recvRoot, legacyRel), JSON.stringify({
    exit: 0,
    gitSha: 'd'.repeat(40),
    evidenceOfRecord: true,
    note: 'legacy would look green',
  }));

  // Case 1: exit=1 backfill must NOT be preferred; flag BACKFILL-FAILED path
  const failBf = {
    ...good,
    exit: 1,
    logPath: 'uc018-receipt-backfill/exit1.log',
  };
  const exit1Log = join(recvRoot, 'uc018-receipt-backfill/exit1.log');
  writeFileSync(exit1Log, logBody);
  failBf.stdoutDigest = createHash('sha256').update(logBody, 'utf8').digest('hex');
  failBf.logPath = exit1Log; // absolute ok for shape; gatherer only checks shape fields
  // gatherer uses relative under receipt root — write relative path receipt
  const failBfDisk = {
    ...failBf,
    logPath: 'uc018-receipt-backfill/exit1.log',
    stdoutDigest: createHash('sha256').update(logBody, 'utf8').digest('hex'),
  };
  writeFileSync(join(recvRoot, 'uc018-receipt-backfill/EXIT1.json'), JSON.stringify(failBfDisk));
  // Fix: readReceiptPreferBackfill joins receiptRoot + backfillRel file name
  writeFileSync(join(recvRoot, 'uc018-receipt-backfill/CASE-EXIT1.json'), JSON.stringify(failBfDisk));
  const r1 = g.readReceiptPreferBackfill(recvRoot, 'CASE-EXIT1.json', legacyRel);
  if (r1 && r1._backfillFailed === true && r1._source === 'backfill-failed' && r1.exit === 1) {
    pass('D-B exit=1 backfill not preferred (flagged backfill-failed)');
  } else {
    fail('D-B exit=1 expected backfill-failed got ' + JSON.stringify({
      source: r1?._source, failed: r1?._backfillFailed, exit: r1?.exit, eor: r1?.evidenceOfRecord,
    }));
  }
  if (r1 && r1.evidenceOfRecord === true) fail('D-B exit=1 must not keep evidenceOfRecord=true');
  else pass('D-B exit=1 evidenceOfRecord forced false');
  // Must not wash to legacy exit 0
  if (r1 && r1.note === 'legacy would look green') fail('D-B exit=1 silently fell back to legacy');
  else pass('D-B exit=1 no silent legacy fallback');

  // Evaluator surfaces BACKFILL-FAILED
  const col = {
    status: 'partial',
    nhpIds: ['NHP-018-NEG-01'],
    prove: { cmd: 'x', exit: 1, gitSha: 'a'.repeat(40), committed: true, shaMatchesCommitted: true, uncommitted: false, staleSha: false },
    dual: { e2eHa: 'PASS', ragRoute: 'PASS' },
    stack: { postgres: true, postgresSaver: true, memorySaver: false, mysql: false, qdrant: false },
    receipts: {
      evidenceOfRecord: false,
      implementerOnly: false,
      capacityRepresentative: false,
      targetEnv: 'docker-isolated',
      present: true,
      missing: true,
      backfillFailed: true,
    },
  };
  // Use evaluate with minimal input — call evaluateColumn via evaluate
  const ev = evaluate({
    columns: {
      NEG: col, FAULT: col, BOUND: col, ADV: col, PERF: col, LOAD: col,
    },
    section11: { businessPathMet: false, openGaps: ['GAP-X'], status: 'partial' },
  });
  const reasons = ev.reasons || [];
  if (reasons.includes(REFUSE_REASONS.BACKFILL_FAILED) || reasons.includes('BACKFILL-FAILED')) {
    pass('D-B evaluator emits BACKFILL-FAILED reason');
  } else {
    fail('D-B missing BACKFILL-FAILED in reasons=' + reasons.join(','));
  }

  // Case 2: missing proveExit
  const miss = { ...failBfDisk };
  delete miss.exit;
  writeFileSync(join(recvRoot, 'uc018-receipt-backfill/CASE-NOEXIT.json'), JSON.stringify(miss));
  const r2 = g.readReceiptPreferBackfill(recvRoot, 'CASE-NOEXIT.json', legacyRel);
  if (r2 && r2._backfillFailed === true && r2._backfillFailReason === 'missing-or-invalid-proveExit') {
    pass('D-B missing proveExit flagged backfill-failed');
  } else {
    fail('D-B missing proveExit got ' + JSON.stringify({
      source: r2?._source, failed: r2?._backfillFailed, reason: r2?._backfillFailReason, exit: r2?.exit,
    }));
  }
  if (r2 && r2.note === 'legacy would look green') fail('D-B missing exit silently fell back to legacy');
  else pass('D-B missing exit no silent legacy fallback');
}


// ── Fixtures: PERF/LOAD README bleed (mw-rag-route FAIL @629f956) ──
{
  const g = await import('./lib/uc-covered-real-gatherer.mjs');
  const legacyBleed =
    '**implementer pre-commit runs · not evidence of record**\n' +
    'These implementer files are retained · uncommitted runner\n';

  // Backfill: own EOR fields only — even if labelText carries legacy README, Ban bleed
  const bfReceipt = {
    emittedBy: EMITTED_BY,
    implementerOnly: false,
    evidenceOfRecord: true,
    exit: 0,
    _source: 'backfill',
  };
  const bfFlags = g.pickEvidenceFlags(bfReceipt, legacyBleed);
  if (bfFlags.implementerOnly === false && bfFlags.evidenceOfRecord === true) {
    pass('FX-BACKFILL-NO-README-BLEED: backfill PERF/LOAD not IMPL-ONLY (expected)');
  } else {
    fail(`FX-BACKFILL-NO-README-BLEED got impl=${bfFlags.implementerOnly} eor=${bfFlags.evidenceOfRecord} want impl=false eor=true`);
  }

  // Legacy: same README label MUST still mark IMPL-ONLY
  const legacyReceipt = {
    implementerOnly: false,
    evidenceOfRecord: true,
    exit: 0,
    _source: 'legacy',
  };
  const legFlags = g.pickEvidenceFlags(legacyReceipt, legacyBleed);
  if (legFlags.implementerOnly === true && legFlags.evidenceOfRecord === false) {
    pass('FX-LEGACY-README-IMPL-ONLY: legacy PERF/LOAD still IMPL-ONLY (expected)');
  } else {
    fail(`FX-LEGACY-README-IMPL-ONLY got impl=${legFlags.implementerOnly} eor=${legFlags.evidenceOfRecord} want impl=true eor=false`);
  }
}

// (a) static-doc must not count as runtime stack MET
{
  const fact = stackFact(true, 'static-doc', { line: 68 });
  if (unwrapStackValue(fact) === undefined) {
    pass('(a) unwrapStackValue(static-doc postgresSaver:true) → undefined (STUB-STACK honest)');
  } else {
    fail('(a) static-doc incorrectly unwrapped to ' + unwrapStackValue(fact));
  }
}

// (b) prior-docker-inspect is not live
{
  const prior = {
    imageDigest: 'sha256:abc',
    source: 'prior-docker-inspect',
    liveObservation: false,
    priorCapturedAt: '2026-09-24T04:38:14.481Z',
  };
  if (!isLiveImageDigestEntry(prior)) {
    pass('(b) prior-docker-inspect not counted as live per-run observation');
  } else {
    fail('(b) prior-docker-inspect wrongly live');
  }
  const live = {
    imageDigest: 'sha256:abc',
    source: 'docker-inspect',
    liveObservation: true,
    capturedAt: '2026-09-24T04:38:14.481Z',
  };
  if (isLiveImageDigestEntry(live)) pass('(b) live docker-inspect still live');
  else fail('(b) live docker-inspect not live');
}


// ════════ G-line: GAP-BACKFILL-EMITTER-UNAUTHENTICATED · HMAC authenticity ════════
{
  const FIXTURE_HMAC_KEY = 'prove-fixture-only-UC018-HMAC-KEY-not-a-secret';
  // Deterministic key resolution: prove passes keys explicitly; env is cleared
  // (and restored) so the missing-key case cannot depend on the shell env.
  const savedEnvKey = process.env[HMAC_KEY_ENV];
  delete process.env[HMAC_KEY_ENV];

  const gdir = join(tmp, 'auth');
  mkdirSync(gdir, { recursive: true });
  const signedPath = join(gdir, 'SIGNED.json');
  const unsignedPath = join(gdir, 'UNSIGNED.json');

  const signedReceipt = { ...good, auth: computeReceiptAuth(good, FIXTURE_HMAC_KEY) };
  writeFileSync(signedPath, JSON.stringify(signedReceipt, null, 2) + '\n');
  writeFileSync(unsignedPath, JSON.stringify(good, null, 2) + '\n');

  try {
    // G1 · genuine signed emit verifies from disk
    {
      const v = verifyMachineReceiptFile(signedPath, { root, hmacKey: FIXTURE_HMAC_KEY });
      if (v.ok && v.authed === true && v.authStatus === 'signed-valid') {
        pass('G1 genuine signed receipt verifies from disk (authed, signed-valid)');
      } else fail('G1 signed receipt failed: ' + JSON.stringify(v));
    }

    // G2 · NEG: valid log digest but no HMAC → strict reject; legacy mode labels
    {
      const strict = verifyMachineReceiptFile(unsignedPath, { root, hmacKey: FIXTURE_HMAC_KEY });
      if (!strict.ok && strict.reason === 'hmac-missing') {
        pass('G2 receipt with valid log digest but no HMAC rejected (hmac-missing)');
      } else fail('G2 expected hmac-missing got ' + JSON.stringify(strict));

      const legacy = verifyMachineReceiptFile(unsignedPath, { root, requireAuth: false, hmacKey: FIXTURE_HMAC_KEY });
      if (legacy.ok && legacy.authed === false && legacy.authStatus === 'unsigned-legacy') {
        pass('G2 pre-HMAC receipt labeled unsigned-legacy (never silently signed)');
      } else fail('G2 expected unsigned-legacy got ' + JSON.stringify(legacy));
    }

    // G3 · FAULT: truncated / malformed tag → reject
    {
      const trunc = { ...signedReceipt, auth: { ...signedReceipt.auth, hmac: signedReceipt.auth.hmac.slice(0, 32) } };
      const v = verifyReceiptAuthenticity(trunc, { hmacKey: FIXTURE_HMAC_KEY });
      if (!v.ok && v.reason === 'hmac-truncated-or-malformed') pass('G3 truncated signature rejected');
      else fail('G3 expected truncated reject got ' + JSON.stringify(v));

      const badScheme = { ...signedReceipt, auth: { ...signedReceipt.auth, scheme: 'HMAC-MD5' } };
      const v2 = verifyReceiptAuthenticity(badScheme, { hmacKey: FIXTURE_HMAC_KEY });
      if (!v2.ok && v2.reason === 'hmac-scheme-unsupported') pass('G3 unsupported scheme rejected');
      else fail('G3 expected scheme reject got ' + JSON.stringify(v2));

      const upperTag = { ...signedReceipt, auth: { ...signedReceipt.auth, hmac: signedReceipt.auth.hmac.toUpperCase() } };
      const v3 = verifyReceiptAuthenticity(upperTag, { hmacKey: FIXTURE_HMAC_KEY });
      if (!v3.ok && v3.reason === 'hmac-truncated-or-malformed') pass('G3 malformed (uppercase) tag rejected');
      else fail('G3 expected malformed reject got ' + JSON.stringify(v3));
    }

    // G4 · BOUND: key missing → fail closed (Ban repo default key)
    {
      const v = verifyReceiptAuthenticity(signedReceipt);
      if (!v.ok && v.reason === 'hmac-key-missing') pass('G4 missing key fails closed (hmac-key-missing)');
      else fail('G4 expected hmac-key-missing got ' + JSON.stringify(v));
    }

    // G5 · ADV: attacker rewrites JSON+log together WITHOUT the key → reject
    {
      const mutatedLog = logBody + 'attacker-forged line\n';
      const mutatedDigest = createHash('sha256').update(mutatedLog, 'utf8').digest('hex');
      const forgeBase = { ...good, stdoutDigest: mutatedDigest, exit: 0 };
      // (a) keeps the copied tag — tag no longer matches the mutated payload
      const forgeTagged = { ...forgeBase, auth: signedReceipt.auth };
      const va = verifyReceiptAuthenticity(forgeTagged, { hmacKey: 'attacker-guess' });
      if (!va.ok && va.reason === 'hmac-invalid') pass('G5a forged JSON+log pair with copied tag rejected (hmac-invalid)');
      else fail('G5a expected hmac-invalid got ' + JSON.stringify(va));
      // (b) same forgery with no key available → fail closed
      const vb = verifyReceiptAuthenticity(forgeTagged);
      if (!vb.ok && vb.reason === 'hmac-key-missing') pass('G5b forged pair without any key fails closed');
      else fail('G5b expected hmac-key-missing got ' + JSON.stringify(vb));
      // (c) forgery strips the tag → unsigned under strict gate
      const vc = verifyReceiptAuthenticity(forgeBase);
      if (!vc.ok && vc.reason === 'hmac-missing') pass('G5c forged pair with tag stripped rejected (hmac-missing)');
      else fail('G5c expected hmac-missing got ' + JSON.stringify(vc));
    }

    // G6 · tamper detection (JSON side): single-byte mutations of the receipt
    // file. Every mutation that CHANGES the parsed content must reject. A
    // mutation that swaps whitespace for whitespace parses to the identical
    // canonical payload — it changes nothing the HMAC covers (not a forgery
    // vector) and is counted separately for honesty.
    {
      const origText = readFileSync(signedPath, 'latin1');
      const origCanonical = canonicalJson(JSON.parse(readFileSync(signedPath, 'utf8')));
      const candidates = ['a', 'b', 'x', '0', '\t', ' '];
      let rejected = 0; let contentSurvivors = 0; let preservedSurvivors = 0;
      for (let i = 0; i < origText.length; i++) {
        for (const repl of candidates) {
          if (origText[i] === repl) continue;
          writeFileSync(signedPath, origText.slice(0, i) + repl + origText.slice(i + 1), 'latin1');
          const v = verifyMachineReceiptFile(signedPath, { root, hmacKey: FIXTURE_HMAC_KEY });
          if (v.ok) {
            let same = false;
            try { same = canonicalJson(JSON.parse(readFileSync(signedPath, 'utf8'))) === origCanonical; } catch { same = false; }
            if (same) preservedSurvivors++; else contentSurvivors++;
          } else rejected++;
        }
      }
      writeFileSync(signedPath, origText, 'latin1'); // restore
      if (contentSurvivors === 0 && rejected > 0) {
        pass(`G6 JSON tamper sweep: ${rejected} content-changing mutations ALL rejected; `
          + `${preservedSurvivors} whitespace-only mutations parse identical (canonical payload unchanged)`);
      } else fail(`G6 JSON sweep: contentSurvivors=${contentSurvivors} rejected=${rejected} preserved=${preservedSurvivors}`);
      const v = verifyMachineReceiptFile(signedPath, { root, hmacKey: FIXTURE_HMAC_KEY });
      if (!v.ok || v.authed !== true) fail('G6 restored signed file no longer verifies: ' + JSON.stringify(v));
    }

    // G7 · tamper detection (log side): ANY single-byte log mutation rejects
    // (stdoutDigest binds the raw log bytes — no whitespace exception here).
    {
      const rDisk = JSON.parse(readFileSync(signedPath, 'utf8'));
      const logAbsPath = rDisk.logPath; // absolute in this fixture
      const origLog = readFileSync(logAbsPath, 'latin1');
      const candidates = ['a', 'b', 'x', '0', '\t', ' '];
      let rejected = 0; let survivors = 0; let checked = 0;
      for (let i = 0; i < origLog.length; i++) {
        for (const repl of candidates) {
          if (origLog[i] === repl) continue;
          checked++;
          writeFileSync(logAbsPath, origLog.slice(0, i) + repl + origLog.slice(i + 1), 'latin1');
          const v = verifyMachineReceiptFile(signedPath, { root, hmacKey: FIXTURE_HMAC_KEY });
          if (v.ok) survivors++; else rejected++;
        }
      }
      writeFileSync(logAbsPath, origLog, 'latin1'); // restore
      if (survivors === 0 && checked > 0) pass(`G7 log tamper sweep: ${checked} single-byte log mutations ALL rejected`);
      else fail(`G7 log sweep: survivors=${survivors} rejected=${rejected} checked=${checked}`);
      const v = verifyMachineReceiptFile(signedPath, { root, hmacKey: FIXTURE_HMAC_KEY });
      if (!v.ok || v.authed !== true) fail('G7 restored log no longer verifies: ' + JSON.stringify(v));
    }

    // G8 · end-to-end: the REAL emitter script (reemit-from-log, offline) signs
    // its output and the receipt verifies from disk; tampering either file rejects.
    {
      const scratch = join(tmp, 'emitter-scratch');
      const receiptsDir = join(scratch, 'ai-docs/delivery/receipts/uc018-receipt-backfill');
      const logsDir = join(receiptsDir, 'logs');
      mkdirSync(logsDir, { recursive: true });
      const gitInit = spawnSync('git', ['init', '-q', scratch], { encoding: 'utf8' });
      const commit = spawnSync('git', ['-C', scratch,
        '-c', 'user.name=prove', '-c', 'user.email=prove@meetwise.local',
        'commit', '--allow-empty', '-q', '-m', 'emitter-e2e-scratch'], { encoding: 'utf8' });
      const shaOut = spawnSync('git', ['-C', scratch, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
      const scratchSha = (shaOut.stdout || '').trim();
      if (gitInit.status !== 0 || commit.status !== 0 || !/^[0-9a-f]{40}$/.test(scratchSha)) {
        fail('G8 scratch repo setup failed: init=' + gitInit.status + ' commit=' + commit.status
          + ' sha=' + JSON.stringify((shaOut.stderr || '').slice(0, 200)));
      } else {
        const scratchKey = 'PROVE';
        const scratchLog = join(logsDir, `${scratchKey}-${scratchSha.slice(0, 7)}.log`);
        writeFileSync(scratchLog, 'synthetic reemit log\n=== pnpm uc018:sole:prove EXIT=0 ===\n');
        const emitRun = spawnSync(process.execPath, [
          'scripts/uc018-receipt-backfill-emit.mjs',
          '--mode=reemit-from-log',
          '--key=' + scratchKey,
          '--targetSha=' + scratchSha,
          '--cmd=uc018:sole:prove',
          '--tipRoot=' + scratch,
        ], {
          cwd: root,
          encoding: 'utf8',
          env: { ...process.env, UC018_RECEIPT_HMAC_KEY: FIXTURE_HMAC_KEY },
          maxBuffer: 16 * 1024 * 1024,
        });
        const scratchReceiptPath = join(receiptsDir, `${scratchKey}.json`);
        if (emitRun.status !== 0 || !existsSync(scratchReceiptPath)) {
          fail('G8 emitter run failed: exit=' + emitRun.status
            + ' stderr=' + String(emitRun.stderr || '').slice(0, 400));
        } else {
          const v = verifyMachineReceiptFile(scratchReceiptPath, { root: scratch, hmacKey: FIXTURE_HMAC_KEY });
          if (v.ok && v.authed === true && v.authStatus === 'signed-valid') {
            pass('G8 real emitter output verifies from disk (HMAC authed)');
          } else fail('G8 emitted receipt failed verification: ' + JSON.stringify(v));

          const disk = JSON.parse(readFileSync(scratchReceiptPath, 'utf8'));
          const authOk = disk.auth
            && disk.auth.scheme === HMAC_SCHEME
            && /^[0-9a-f]{64}$/.test(disk.auth.hmac)
            && disk.auth.keyId === 'env:' + HMAC_KEY_ENV
            && typeof disk.auth.keyFingerprint === 'string'
            && disk.auth.keyFingerprint.length === 12;
          if (authOk) pass('G8 auth block shape (scheme/keyId/keyFingerprint/tag)');
          else fail('G8 unexpected auth block: ' + JSON.stringify(disk.auth));

          const attemptsText = readFileSync(join(receiptsDir, 'attempts.jsonl'), 'utf8').trim().split('\n');
          const lastAttempt = JSON.parse(attemptsText[attemptsText.length - 1]);
          if (lastAttempt.authed === true && lastAttempt.validate && lastAttempt.validate.ok === true) {
            pass('G8 attempts.jsonl records authed=true');
          } else fail('G8 attempt record missing authed=true: ' + JSON.stringify(lastAttempt));

          // tamper emitted JSON (exit 0→1) → reject; restore → verifies again
          const origJson = readFileSync(scratchReceiptPath, 'latin1');
          const flipAt = origJson.indexOf('"exit": 0');
          if (flipAt < 0) fail('G8 could not locate exit field for tamper');
          else {
            const mutated = origJson.slice(0, flipAt) + '"exit": 1' + origJson.slice(flipAt + '"exit": 0'.length);
            writeFileSync(scratchReceiptPath, mutated, 'latin1');
            const vTamper = verifyMachineReceiptFile(scratchReceiptPath, { root: scratch, hmacKey: FIXTURE_HMAC_KEY });
            if (!vTamper.ok) pass('G8 tampered emitter JSON rejected (' + vTamper.reason + ')');
            else fail('G8 tampered emitter JSON unexpectedly verified');
            writeFileSync(scratchReceiptPath, origJson, 'latin1');
          }
          // tamper emitted log (append one byte) → reject; restore → verifies again
          const origLogBytes = readFileSync(scratchLog, 'latin1');
          writeFileSync(scratchLog, origLogBytes + 'x', 'latin1');
          const vLogTamper = verifyMachineReceiptFile(scratchReceiptPath, { root: scratch, hmacKey: FIXTURE_HMAC_KEY });
          if (!vLogTamper.ok && vLogTamper.reason === 'stdoutDigest-mismatch') {
            pass('G8 tampered emitter log rejected (stdoutDigest-mismatch)');
          } else fail('G8 tampered log got ' + JSON.stringify(vLogTamper));
          writeFileSync(scratchLog, origLogBytes, 'latin1');
          const vRestored = verifyMachineReceiptFile(scratchReceiptPath, { root: scratch, hmacKey: FIXTURE_HMAC_KEY });
          if (vRestored.ok && vRestored.authed === true) pass('G8 restored emitter receipt verifies again');
          else fail('G8 restored receipt failed: ' + JSON.stringify(vRestored));
        }
      }
    }
  } finally {
    if (savedEnvKey !== undefined) process.env[HMAC_KEY_ENV] = savedEnvKey;
  }
}


rmSync(tmp, { recursive: true, force: true });

console.log(failed === 0
  ? '\nCMD=pnpm uc018:receipt-backfill:prove EXIT=0'
  : `\nCMD=pnpm uc018:receipt-backfill:prove EXIT=1 failures=${failed}`);
process.exit(failed === 0 ? 0 : 1);
