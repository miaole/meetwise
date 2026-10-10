/**
 * GAP-PRIV-EXTERNAL-SINK-RETENTION · Line AN-PRIV-EXT · external sink async-purge honesty prove.
 *
 * Named CMD: `pnpm uc052:external-sink-retention:prove` (run-e2e-isolated · real PG · Ban live ·
 * no MODEL_API_KEY). NEW red paths (PRE e2e C-3 / C-4) — NOT a re-run of uc052:internal-erasure:
 *   (a) external target forced `erased` (no confirmation / direct-written external_confirmed)
 *       → request must NOT reach `completed` (0091 guard + 0137 tightening · SQLSTATE 55000)
 *   (b) `privacy_resolve_deletion_receipt` without an `external_pending` receipt → 40901 fail-closed
 *   (c) interview DELETE closed(503)·resume/account DELETE=202 软删受理(purge_pending) (service pin here; `privacy-erasure:http:prove` co-recorded same window)
 * Contract locus = 0091 existing receipt_kind enum + privacy_resolve_deletion_receipt (no new shape).
 *
 * EXIT0 ≠ covered ≠ deletion closed ≠ external purged ≠ open DELETE ≠ HA. Externals stay
 * `retention_pending`; request happy terminal = `pending_external`; Ban count-as-erased.
 * Forged states (target → erased) run inside an admin txn that is ROLLED BACK (never persisted).
 * C-CASECOUNT: every REQUIRED_CASE must run or EXIT≠0.
 */
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor,
  assertIsolatedTestTarget, type Client,
} from '@meetwise/db';
import { generatePrivacyAuthzKeyPair } from '@meetwise/domain';
import {
  runAuthorizedInterviewErasure, loadRequestStatus, loadRequestTargets,
  reassessRequestStatus, attachExternalRetentionPendingTargets, type Uc052ErasureTarget,
} from '../src/uc052-internal-erasure.ts';
import { beginInterviewProjectionErasure } from '../src/int-transcript-projection.ts';
import { recordDeletionReceipt, resolveDeletionReceipt } from '../src/privacy-authorization.ts';

const REQUIRED_CASES = [
  'EXT-RP-01',     // happy: externals retention_pending · request pending_external · N2 no external_* receipt
  'EXT-NEG-01',    // C-3(a) externals retention_pending → forced UPDATE completed → 55000
  'EXT-NEG-02',    // C-3(a) externals forced erased, ZERO confirmation → UPDATE completed → 55000
  'EXT-NEG-02B',   // C-3(a) same forge via product settler reassessRequestStatus → ≠ completed
  'EXT-NEG-03',    // C-3(a) forced erased + unresolved external_pending → 55000
  'EXT-NEG-04',    // C-4 direct privacy_record_deletion_receipt(external_confirmed) + forged erased → 55000
  'EXT-NEG-05',    // C-3(b) resolve w/o external_pending (today's retention_pending shape) → 40901
  'EXT-NEG-06',    // C-3(b) resolve on direct-written external_confirmed (not pending) → 40901
  'EXT-POS-01',    // C-4 contract: record external_pending → resolve → external_confirmed audited · target stays retention_pending · request ≠ completed
  'EXT-DEL-01',    // C-3(c) DELETE service pin: interview 503 closed · resume/account=202 软删受理(purge_pending) (+ http prove co-recorded separately)
] as const;

const EXTERNAL = ['oss', 'redis', 'langfuse'] as const;
type ExternalSink = typeof EXTERNAL[number];
const LOCAL = ['event', 'ai_graph_run', 'report'] as const;

const admin = createPool();
const owner = `uc052ext-owner-${process.pid}`;
const worker = `uc052ext-worker-${process.pid}`;
const KEY = generatePrivacyAuthzKeyPair('uc052-ext-2026-01');
const NOW_SEC = Math.floor(Date.now() / 1000);
const keys = { privateKeyPem: KEY.privateKeyPem, publicJwk: KEY.publicJwk, kid: KEY.kid };

let failures = 0;
const seen = new Set<string>();
const caseStatus = new Map<string, string>();
const caseDetail = new Map<string, string>();
const A = (id: string, ok: boolean, detail = '') => {
  seen.add(id);
  caseStatus.set(id, ok ? 'pass' : 'fail');
  caseDetail.set(id, detail);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail ? ` · ${detail}` : ''}`);
  if (!ok) failures++;
};

type SqlErr = { code: string | null; message: string } | null;
async function sqlErr(fn: () => Promise<unknown>): Promise<SqlErr> {
  try { await fn(); return null; } catch (e: any) {
    return { code: e?.code ?? null, message: String(e?.message ?? e) };
  }
}
const fmtErr = (e: SqlErr) => (e ? `${e.code}:${e.message}` : 'NO_ERROR');

let hashCounter = 0x5e000;
const nextHash = () => (++hashCounter).toString(16).padStart(64, '0');

async function asIssuer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_issuer');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

async function seedSubject(interviewId: string): Promise<void> {
  await admin.query(
    `INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions)
     VALUES ($1,$2,'active',0,0,'[]'::jsonb)`, [interviewId, owner]);
  await asPrincipal(admin, owner, async (c) => {
    await c.query(
      `INSERT INTO interview_event(owner_user_id, stream_key, seq, kind, payload)
       VALUES (current_setting('app.principal_user', true), $1, 1, 'question_ready', '{}'::jsonb)`, [interviewId]);
    await c.query(
      `INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
       VALUES ('mock-interview', $1, current_setting('app.principal_user', true), 'completed')`, [interviewId]);
    await c.query(
      `INSERT INTO ai_report(owner_user_id, interview_id)
       VALUES (current_setting('app.principal_user', true), $1)`, [interviewId]);
  });
}

/** Line B authorized internal erasure (locals erased · externals retention_pending). Setup only. */
async function eraseHappy(epoch: number) {
  const iv = randomUUID();
  await seedSubject(iv);
  const key = nextHash();
  const begun = await asPrincipal(admin, owner, (c) => beginInterviewProjectionErasure(c, iv, key, epoch));
  await attachExternalRetentionPendingTargets(admin, begun.requestId, iv, key);
  const result = await runAuthorizedInterviewErasure({
    preBegun: { requestId: begun.requestId, privacyEpoch: epoch },
    issue: (fn) => asIssuer(owner, fn),
    consume: (fn) => asPrivacyWorkerExecutor(admin, fn),
    asWorkerPrincipal: (own, fn) => asPrivacyWorkerPrincipal(admin, own, fn),
    admin, owner, interviewId: iv, keys, workerId: worker, nowSec: NOW_SEC,
  });
  const targets = await loadRequestTargets(admin, result.requestId);
  const pick = (s: ExternalSink): Uc052ErasureTarget => {
    const t = targets.find((x) => x.sink === s);
    if (!t) throw new Error(`uc052ext_missing_external_target:${s}`);
    return t;
  };
  const ext: Record<ExternalSink, Uc052ErasureTarget> = { oss: pick('oss'), redis: pick('redis'), langfuse: pick('langfuse') };
  return { iv, requestId: result.requestId, requestStatus: result.requestStatus, targets, ext };
}

async function receiptsFor(targetIds: string[]) {
  const r = await admin.query<{ target_id: string; receipt_kind: string; resolved_at: Date | null; resolved_by: string | null }>(
    `SELECT target_id::text, receipt_kind, resolved_at, resolved_by FROM privacy_deletion_receipt
      WHERE target_id = ANY($1::uuid[]) ORDER BY target_id, receipt_kind`, [targetIds]);
  return r.rows;
}

/** Forge external targets → 'erased' inside a txn, run `attempt`, ALWAYS rollback (never persisted). */
async function inForgedTxn<T>(requestId: string, attempt: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query(
      `UPDATE privacy_deletion_target SET status='erased', version=version+1, updated_at=now()
        WHERE request_id=$1::uuid AND sink = ANY($2::text[])`, [requestId, [...EXTERNAL]]);
    return await attempt(c as unknown as Client);
  } finally {
    await c.query('ROLLBACK').catch(() => undefined);
    c.release();
  }
}

/** Try forced completed inside the forged txn; returns error + status seen in-txn. */
async function forcedCompleteInForge(requestId: string, via: 'update' | 'reassess') {
  return inForgedTxn(requestId, async (c) => {
    await c.query('SAVEPOINT sp');
    const err = await sqlErr(async () => {
      if (via === 'update') {
        await c.query(`UPDATE privacy_erasure_request SET status='completed', version=version+1 WHERE id=$1::uuid`, [requestId]);
      } else {
        await reassessRequestStatus(c as any, requestId);
      }
    });
    if (err) await c.query('ROLLBACK TO SAVEPOINT sp');
    const s = await c.query<{ status: string }>(`SELECT status FROM privacy_erasure_request WHERE id=$1::uuid`, [requestId]);
    return { err, inTxnStatus: s.rows[0]?.status ?? 'missing' };
  });
}

async function main() {
  await assertIsolatedTestTarget(admin);
  const porcelain = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (porcelain) {
    console.error('C-UNCOMMITTED refuse: dirty worktree\n' + porcelain);
    process.exit(1);
  }
  const gitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(`UC052_EXTERNAL_SINK_RETENTION_PROVE gitSha=${gitSha} line=AN-PRIV-EXT live=false modelKey=not_loaded`);

  /* ── EXT-RP-01: happy baseline · externals retention_pending · N2 receipt shape ── */
  {
    const id = 'EXT-RP-01';
    const h = await eraseHappy(21);
    const localsErased = LOCAL.every((s) => h.targets.find((t) => t.sink === s)?.status === 'erased');
    const extRp = EXTERNAL.every((s) => h.ext[s]?.status === 'retention_pending');
    const rc = await receiptsFor(EXTERNAL.map((s) => h.ext[s].targetId));
    const extKinds = rc.map((r) => r.receipt_kind);
    const noExternalStar = !extKinds.includes('external_pending') && !extKinds.includes('external_confirmed');
    const status = await loadRequestStatus(admin, h.requestId);
    A(id,
      status === 'pending_external' && localsErased && extRp && noExternalStar,
      `req=${status} localsErased=${localsErased} externalsRp=${extRp} externalReceiptKinds=[${extKinds.join(',')}] (N2: retention_pending target ≠ external_pending receipt)`);
  }

  /* ── EXT-NEG-01: externals retention_pending → forced completed → 55000 ── */
  {
    const id = 'EXT-NEG-01';
    const h = await eraseHappy(22);
    const err = await sqlErr(() => admin.query(
      `UPDATE privacy_erasure_request SET status='completed', version=version+1 WHERE id=$1::uuid`, [h.requestId]));
    const status = await loadRequestStatus(admin, h.requestId);
    A(id,
      err?.code === '55000' && /privacy_erasure_request_incomplete_targets/.test(err.message) && status === 'pending_external',
      `err=${fmtErr(err)} req=${status}`);
  }

  /* ── EXT-NEG-02: externals forced erased with ZERO confirmation → UPDATE completed → 55000 ── */
  {
    const id = 'EXT-NEG-02';
    const h = await eraseHappy(23);
    const { err, inTxnStatus } = await forcedCompleteInForge(h.requestId, 'update');
    const after = await loadRequestStatus(admin, h.requestId);
    const extAfter = (await loadRequestTargets(admin, h.requestId)).filter((t) => (EXTERNAL as readonly string[]).includes(t.sink));
    const rolledBack = extAfter.every((t) => t.status === 'retention_pending');
    A(id,
      err?.code === '55000' && inTxnStatus !== 'completed' && after === 'pending_external' && rolledBack,
      `err=${fmtErr(err)} inTxn=${inTxnStatus} after=${after} forgeRolledBack=${rolledBack}`);
  }

  /* ── EXT-NEG-02B: same forge via product settler reassessRequestStatus (CASE ELSE 'completed') ── */
  {
    const id = 'EXT-NEG-02B';
    const h = await eraseHappy(24);
    const { err, inTxnStatus } = await forcedCompleteInForge(h.requestId, 'reassess');
    const after = await loadRequestStatus(admin, h.requestId);
    A(id,
      err?.code === '55000' && inTxnStatus !== 'completed' && after === 'pending_external',
      `err=${fmtErr(err)} inTxn=${inTxnStatus} after=${after}`);
  }

  /* ── EXT-NEG-03: forced erased + unresolved external_pending receipts → 55000 ── */
  {
    const id = 'EXT-NEG-03';
    const h = await eraseHappy(25);
    for (const s of EXTERNAL) {
      await asPrivacyWorkerPrincipal(admin, owner, (c) =>
        recordDeletionReceipt(c, h.ext[s].targetId, 'external_pending', nextHash(), worker));
    }
    const { err, inTxnStatus } = await forcedCompleteInForge(h.requestId, 'update');
    const after = await loadRequestStatus(admin, h.requestId);
    A(id,
      err?.code === '55000' && /privacy_erasure_request_external_unresolved/.test(err.message)
      && inTxnStatus !== 'completed' && after === 'pending_external',
      `err=${fmtErr(err)} inTxn=${inTxnStatus} after=${after}`);
  }

  /* ── EXT-NEG-04 (C-4): direct privacy_record_deletion_receipt(external_confirmed) ≠ purge evidence ── */
  /* ── EXT-NEG-06 (C-3b): resolve on direct-written external_confirmed (not pending) → 40901 ── */
  {
    const h = await eraseHappy(26);
    for (const s of EXTERNAL) {
      await asPrivacyWorkerPrincipal(admin, owner, (c) =>
        recordDeletionReceipt(c, h.ext[s].targetId, 'external_confirmed', nextHash(), worker));
    }
    const rc = await receiptsFor(EXTERNAL.map((s) => h.ext[s].targetId));
    const directUnaudited = rc.length === 3 && rc.every((r) => r.receipt_kind === 'external_confirmed' && r.resolved_at === null);
    const resolveErr = await sqlErr(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      resolveDeletionReceipt(c, h.ext.oss.targetId, worker)));
    A('EXT-NEG-06',
      resolveErr?.code === '40901' && /privacy_authorization_receipt_not_pending/.test(resolveErr.message),
      `resolveErr=${fmtErr(resolveErr)}`);
    const { err, inTxnStatus } = await forcedCompleteInForge(h.requestId, 'update');
    const after = await loadRequestStatus(admin, h.requestId);
    A('EXT-NEG-04',
      directUnaudited && err?.code === '55000' && inTxnStatus !== 'completed' && after === 'pending_external',
      `directExternalConfirmed(resolved_at=NULL)=${directUnaudited} err=${fmtErr(err)} inTxn=${inTxnStatus} after=${after}`);
  }

  /* ── EXT-NEG-05 (C-3b): resolve without external_pending (today's retention_pending shape) → 40901 ── */
  {
    const id = 'EXT-NEG-05';
    const h = await eraseHappy(27);
    const before = await receiptsFor(EXTERNAL.map((s) => h.ext[s].targetId));
    const errs: SqlErr[] = [];
    for (const s of EXTERNAL) {
      errs.push(await sqlErr(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
        resolveDeletionReceipt(c, h.ext[s].targetId, worker))));
    }
    const after = await receiptsFor(EXTERNAL.map((s) => h.ext[s].targetId));
    const status = await loadRequestStatus(admin, h.requestId);
    const extStill = (await loadRequestTargets(admin, h.requestId))
      .filter((t) => (EXTERNAL as readonly string[]).includes(t.sink)).every((t) => t.status === 'retention_pending');
    A(id,
      errs.every((e) => e?.code === '40901' && /privacy_authorization_receipt_not_pending/.test(e.message))
      && before.length === after.length && status === 'pending_external' && extStill,
      `errs=[${errs.map((e) => e?.code ?? 'NO_ERROR').join(',')}] receipts=${before.length}->${after.length} req=${status} externalsRp=${extStill}`);
  }

  /* ── EXT-POS-01 (C-4 contract locus): 0091 audit chain works but does NOT erase target nor complete ── */
  /* AR 0140 N2: resolve requires vendor evidence for externals; seed stub evidence (≠ erase · ≠ cloud wipe). */
  {
    const id = 'EXT-POS-01';
    const h = await eraseHappy(28);
    await asPrivacyWorkerPrincipal(admin, owner, async (c) => {
      await c.query(
        `SELECT privacy_record_vendor_purge_evidence($1::uuid,$2,$3,$4,true,$5)`,
        [h.ext.oss.targetId, 'oss_delete_list_empty_local_stub', nextHash(), 'deleteObject+listEmpty', worker],
      );
      await recordDeletionReceipt(c, h.ext.oss.targetId, 'external_pending', nextHash(), worker);
    });
    const midStatus = await loadRequestStatus(admin, h.requestId);
    const resolved = await asPrivacyWorkerPrincipal(admin, owner, (c) =>
      resolveDeletionReceipt(c, h.ext.oss.targetId, `${worker}-confirmer`));
    const rc = await receiptsFor([h.ext.oss.targetId]);
    const audited = rc.length === 1 && rc[0]!.receipt_kind === 'external_confirmed'
      && rc[0]!.resolved_at !== null && rc[0]!.resolved_by === `${worker}-confirmer`;
    const targets = await loadRequestTargets(admin, h.requestId);
    const extStill = EXTERNAL.every((s) => targets.find((t) => t.sink === s)?.status === 'retention_pending');
    const status = await loadRequestStatus(admin, h.requestId);
    A(id,
      midStatus === 'pending_external' && resolved.receiptKind === 'external_confirmed' && audited
      && resolved.requestStatus === 'pending_external' && status === 'pending_external' && extStill,
      `mid=${midStatus} resolvedKind=${resolved.receiptKind} audited=${audited} resolveReq=${resolved.requestStatus} req=${status} externalsStillRp=${extStill} (no confirmer flips target → ≠ completed)`);
  }

  /* ── EXT-DEL-01 (C-3c): interview DELETE still 503 closed · resume/account DELETE=202 软删受理(purge_pending) (service pin · http prove co-recorded separately) ── */
  {
    const id = 'EXT-DEL-01';
    const mod = await import('../../../apps/api/src/modules/privacy/privacy.service.ts');
    const svc = Object.create(mod.PrivacyService.prototype) as InstanceType<typeof mod.PrivacyService>;
    let status: number | null = null;
    let code: string | null = null;
    try {
      svc.eraseInterviewData('principal', randomUUID(), 'idem-key-12345678');
    } catch (e: any) {
      status = e?.getStatus?.() ?? e?.status ?? null;
      code = e?.response?.error ?? e?.message ?? null;
    }
    A(id,
      status === 503 && String(code).includes('interview_erasure_authorization_not_available'),
      `httpStatus=${status} code=${code}`);
  }

  /* ── C-CASECOUNT ── */
  const missing = REQUIRED_CASES.filter((c) => !seen.has(c));
  A('C-CASECOUNT', missing.length === 0, missing.length ? `missing=${missing.join(',')}` : `all ${REQUIRED_CASES.length} present`);

  console.log(JSON.stringify({
    line: 'AN-PRIV-EXT',
    gap: 'GAP-PRIV-EXTERNAL-SINK-RETENTION',
    gapStatus: 'OPEN',
    canHonestlyFlip: false,
    gitSha,
    releaseEvidence: false,
    haStatus: 'NOT_HA',
    publicDelete: 503,
    externals: 'retention_pending',
    countAsErased: false,
    cases: Object.fromEntries([...caseStatus.entries()]),
    details: Object.fromEntries([...caseDetail.entries()]),
    required: REQUIRED_CASES,
  }));

  console.log(failures === 0
    ? '\n✓ UC052 external sink retention prove PASS (≠ external purged · ≠ completed · ≠ covered · gap OPEN)'
    : `\n✗ ${failures} assertion failures`);
  await admin.end().catch(() => undefined);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
