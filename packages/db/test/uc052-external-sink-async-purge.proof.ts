/**
 * Line AR · GAP-PRIV-EXTERNAL-SINK async purge real prove (vendor purge path evidence).
 *
 * Named CMD: `pnpm uc052:external-sink-async-purge:prove`
 * via run-e2e-isolated · Ban live · MODEL_API_KEY not loaded · Ban buy cloud · Ban secrets.
 *
 * N1 pinned evidence classes (oss/redis/langfuse · Ban OSS-only shrink).
 * N2 resolve vendor gate (0140).
 * N3 confirmer writes external_pending after evidence, then resolve, then erased.
 *
 * EXIT0 ≠ covered ≠ :64 CLOSED ≠ cloud vendor deleted ≠ open DELETE ≠ HA.
 * local_isolated_stub ≠ real OSS/Redis/Langfuse wipe · gap :64 stays OPEN · UC-052 partial.
 * Ban count-as-erased · NB-3 · cite ada604a honesty ≠ wash into wipe · DELETE=503.
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
import { beginInterviewProjectionErasure } from '../src/transcript/int-transcript-projection.ts';
import { recordDeletionReceipt, resolveDeletionReceipt } from '../src/privacy-authorization.ts';
import {
  EXTERNAL_ASYNC_PURGE_SINKS, EVIDENCE_CLASS_BY_SINK, ENVIRONMENT_CLASS,
  createLocalStubVendorSurface, runExternalSinkAsyncPurgeConfirm,
  recordVendorPurgeEvidence, applyExternalSinkErasedWithVendorEvidence,
  type ExternalAsyncPurgeSink,
} from '../src/uc052-external-sink-async-purge.ts';

const REQUIRED_CASES = [
  'AP-N1-CLASS',     // N1: pinned evidence classes match sink · wrong class rejected
  'AP-PATH-01',      // happy: all 3 sinks stub purge → evidence → pending → resolve → erased → completed (stub only)
  'AP-NEG-01',       // no vendor evidence → resolve 55000 vendor_unproven (N2)
  'AP-NEG-02',       // 0137 attested confirm WITHOUT vendor evidence → completed 55000 (NB-3 Ban wash)
  'AP-NEG-03',       // erase without evidence → 55000
  'AP-NEG-04',       // partial (langfuse refuse) → failed_cleanup · ≠ completed · Ban count-as-erased
  'AP-NEG-05',       // timeout → failed_cleanup · ≠ completed
  'AP-N3-WIRE',      // N3: after PATH, externals have audited external_confirmed + evidence · not bare retention_pending
  'AP-DEL-01',       // public DELETE stays 503
  'AP-HONEST-01',    // stub ≠ cloud wipe · gap64Open · releaseEvidence=false · cloudVendorDeleted=false
] as const;

const EXTERNAL = EXTERNAL_ASYNC_PURGE_SINKS;
type ExternalSink = ExternalAsyncPurgeSink;

const admin = createPool();
const owner = `uc052ap-owner-${process.pid}`;
const worker = `uc052ap-worker-${process.pid}`;
const KEY = generatePrivacyAuthzKeyPair('uc052-ap-2026-01');
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

let hashCounter = 0x6a000;
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
    if (!t) throw new Error(`uc052ap_missing_external_target:${s}`);
    return t;
  };
  const ext: Record<ExternalSink, Uc052ErasureTarget> = {
    oss: pick('oss'), redis: pick('redis'), langfuse: pick('langfuse'),
  };
  return { iv, requestId: result.requestId, requestStatus: result.requestStatus, targets, ext };
}

async function main() {
  await assertIsolatedTestTarget(admin);
  const porcelain = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (porcelain) {
    console.error('C-UNCOMMITTED refuse: dirty worktree\n' + porcelain);
    process.exit(1);
  }
  const gitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(`UC052_EXTERNAL_SINK_ASYNC_PURGE_PROVE gitSha=${gitSha} line=AR live=false modelKey=not_loaded env=${ENVIRONMENT_CLASS}`);

  /* ── AP-N1-CLASS: pinned classes · wrong class rejected ── */
  {
    const id = 'AP-N1-CLASS';
    const h = await eraseHappy(1);
    const vendor = createLocalStubVendorSurface('ok');
    vendor.seedInterview(h.iv);
    const purge = vendor.purge('oss', h.iv);
    const wrong = await sqlErr(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      recordVendorPurgeEvidence(
        c, h.ext.oss.targetId,
        'redis_del_exists_empty_local_stub', // wrong class for oss
        nextHash(), purge.vendorOperation, worker,
      )));
    const right = await sqlErr(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      recordVendorPurgeEvidence(
        c, h.ext.oss.targetId,
        EVIDENCE_CLASS_BY_SINK.oss, nextHash(), purge.vendorOperation, worker,
      )));
    A(id,
      wrong !== null && String(wrong.message).includes('privacy_vendor_evidence_class_mismatch')
      && right === null
      && EVIDENCE_CLASS_BY_SINK.oss === 'oss_delete_list_empty_local_stub'
      && EVIDENCE_CLASS_BY_SINK.redis === 'redis_del_exists_empty_local_stub'
      && EVIDENCE_CLASS_BY_SINK.langfuse === 'langfuse_retention_delete_replica_local_stub',
      `wrong=${fmtErr(wrong)} right=${fmtErr(right)} classes=${JSON.stringify(EVIDENCE_CLASS_BY_SINK)}`);
  }

  /* ── AP-PATH-01: full stub path all 3 sinks ── */
  let pathResult: Awaited<ReturnType<typeof runExternalSinkAsyncPurgeConfirm>> | null = null;
  {
    const id = 'AP-PATH-01';
    const h = await eraseHappy(2);
    const vendor = createLocalStubVendorSurface('ok');
    vendor.seedInterview(h.iv);
    pathResult = await runExternalSinkAsyncPurgeConfirm({
      asWorker: (fn) => asPrivacyWorkerPrincipal(admin, owner, fn),
      requestId: h.requestId,
      interviewId: h.iv,
      externals: EXTERNAL.map((s) => ({ sink: s, targetId: h.ext[s].targetId })),
      workerId: worker,
      vendor,
    });
    const status = await loadRequestStatus(admin, h.requestId);
    const targets = await loadRequestTargets(admin, h.requestId);
    const allErased = EXTERNAL.every((s) => targets.find((t) => t.sink === s)?.status === 'erased');
    const evidence = await admin.query<{ sink: string; evidence_class: string; verified_absent: boolean; environment_class: string }>(
      `SELECT sink, evidence_class, verified_absent, environment_class FROM privacy_external_purge_evidence
        WHERE request_id=$1::uuid ORDER BY sink`, [h.requestId]);
    const evidenceOk = evidence.rows.length === 3
      && evidence.rows.every((r) => r.verified_absent && r.environment_class === ENVIRONMENT_CLASS
        && r.evidence_class === EVIDENCE_CLASS_BY_SINK[r.sink as ExternalSink]);
    A(id,
      pathResult.allExternalErased && allErased && status === 'completed' && evidenceOk
      && pathResult.cloudVendorDeleted === false && pathResult.gap64Open === true,
      `req=${status} allErased=${allErased} evidence=${evidence.rows.length} cloudDeleted=${pathResult.cloudVendorDeleted} gap64Open=${pathResult.gap64Open}`);
  }

  /* ── AP-NEG-01: resolve without vendor evidence → 55000 (N2) ── */
  {
    const id = 'AP-NEG-01';
    const h = await eraseHappy(3);
    const err = await sqlErr(() => asPrivacyWorkerPrincipal(admin, owner, async (c) => {
      await recordDeletionReceipt(c, h.ext.oss.targetId, 'external_pending', nextHash(), worker);
      await resolveDeletionReceipt(c, h.ext.oss.targetId, worker);
    }));
    const status = await loadRequestStatus(admin, h.requestId);
    A(id,
      err !== null && String(err.message).includes('privacy_authorization_resolve_vendor_unproven')
      && status === 'pending_external',
      `err=${fmtErr(err)} req=${status}`);
  }

  /* ── AP-NEG-02: NB-3 Ban wash — forged erased + 0137 attest without vendor evidence → completed refused ── */
  {
    const id = 'AP-NEG-02';
    const h = await eraseHappy(4);
    // Seed evidence temporarily only to get resolve past N2, then DELETE evidence and try completed?
    // Stronger: forge erased + write unaudited path is already 0137; here forge erased +
    // insert resolve-audited confirm WITHOUT evidence by bypassing resolve (direct SQL) —
    // completed must still hit vendor_unproven.
    const c = await admin.connect();
    let inTxnStatus = 'missing';
    let err: SqlErr = null;
    try {
      await c.query('BEGIN');
      await c.query(
        `UPDATE privacy_deletion_target SET status='erased', version=version+1, updated_at=now()
          WHERE request_id=$1::uuid AND sink = ANY($2::text[])`, [h.requestId, [...EXTERNAL]]);
      for (const s of EXTERNAL) {
        await c.query(
          `INSERT INTO privacy_deletion_receipt(request_id,target_id,receipt_kind,receipt_hash,recorded_by,resolved_at,resolved_by)
           VALUES ($1::uuid,$2::uuid,'external_confirmed',$3,$4,now(),$4)
           ON CONFLICT (target_id, receipt_kind) DO UPDATE
             SET resolved_at=now(), resolved_by=EXCLUDED.resolved_by, receipt_hash=EXCLUDED.receipt_hash`,
          [h.requestId, h.ext[s].targetId, nextHash(), worker]);
      }
      await c.query('SAVEPOINT sp');
      err = await sqlErr(async () => {
        await c.query(
          `UPDATE privacy_erasure_request SET status='completed', version=version+1 WHERE id=$1::uuid`,
          [h.requestId]);
      });
      if (err) await c.query('ROLLBACK TO SAVEPOINT sp');
      const s = await c.query<{ status: string }>(`SELECT status FROM privacy_erasure_request WHERE id=$1::uuid`, [h.requestId]);
      inTxnStatus = s.rows[0]?.status ?? 'missing';
    } finally {
      await c.query('ROLLBACK').catch(() => undefined);
      c.release();
    }
    const after = await loadRequestStatus(admin, h.requestId);
    A(id,
      err !== null && String(err.message).includes('privacy_erasure_request_external_vendor_unproven')
      && inTxnStatus === 'pending_external' && after === 'pending_external',
      `err=${fmtErr(err)} inTxn=${inTxnStatus} after=${after} (NB-3 Ban wash attestation into wipe)`);
  }

  /* ── AP-NEG-03: apply erased without evidence → 55000 ── */
  {
    const id = 'AP-NEG-03';
    const h = await eraseHappy(5);
    const err = await sqlErr(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      applyExternalSinkErasedWithVendorEvidence(c, h.ext.redis.targetId, worker)));
    const t = (await loadRequestTargets(admin, h.requestId)).find((x) => x.sink === 'redis');
    A(id,
      err !== null && String(err.message).includes('privacy_external_erase_vendor_unproven')
      && t?.status === 'retention_pending',
      `err=${fmtErr(err)} status=${t?.status}`);
  }

  /* ── AP-NEG-04: partial langfuse refuse → ≠ completed ── */
  {
    const id = 'AP-NEG-04';
    const h = await eraseHappy(6);
    const vendor = createLocalStubVendorSurface('partial_skip');
    vendor.seedInterview(h.iv);
    const r = await runExternalSinkAsyncPurgeConfirm({
      asWorker: (fn) => asPrivacyWorkerPrincipal(admin, owner, fn),
      requestId: h.requestId,
      interviewId: h.iv,
      externals: EXTERNAL.map((s) => ({ sink: s, targetId: h.ext[s].targetId })),
      workerId: worker,
      vendor,
    });
    const status = await loadRequestStatus(admin, h.requestId);
    const lang = r.sinks.find((s) => s.sink === 'langfuse');
    A(id,
      status !== 'completed' && lang?.stage === 'failed_cleanup' && r.allExternalErased === false
      && r.cloudVendorDeleted === false,
      `req=${status} langfuse=${lang?.stage} allErased=${r.allExternalErased}`);
  }

  /* ── AP-NEG-05: timeout → failed_cleanup · ≠ completed ── */
  {
    const id = 'AP-NEG-05';
    const h = await eraseHappy(7);
    const vendor = createLocalStubVendorSurface('timeout');
    vendor.seedInterview(h.iv);
    const r = await runExternalSinkAsyncPurgeConfirm({
      asWorker: (fn) => asPrivacyWorkerPrincipal(admin, owner, fn),
      requestId: h.requestId,
      interviewId: h.iv,
      externals: EXTERNAL.map((s) => ({ sink: s, targetId: h.ext[s].targetId })),
      workerId: worker,
      vendor,
    });
    const status = await loadRequestStatus(admin, h.requestId);
    const allFailed = r.sinks.every((s) => s.stage === 'failed_cleanup');
    A(id,
      status !== 'completed' && allFailed && r.cloudVendorDeleted === false,
      `req=${status} allFailed=${allFailed}`);
  }

  /* ── AP-N3-WIRE: PATH left audited confirmed + evidence (not bare retention_pending) ── */
  {
    const id = 'AP-N3-WIRE';
    // Re-read last PATH request via a fresh happy+path
    const h = await eraseHappy(8);
    const vendor = createLocalStubVendorSurface('ok');
    vendor.seedInterview(h.iv);
    await runExternalSinkAsyncPurgeConfirm({
      asWorker: (fn) => asPrivacyWorkerPrincipal(admin, owner, fn),
      requestId: h.requestId,
      interviewId: h.iv,
      externals: EXTERNAL.map((s) => ({ sink: s, targetId: h.ext[s].targetId })),
      workerId: worker,
      vendor,
    });
    const rc = await admin.query<{ sink: string; receipt_kind: string; resolved_at: Date | null }>(
      `SELECT t.sink, rc.receipt_kind, rc.resolved_at
         FROM privacy_deletion_target t
         JOIN privacy_deletion_receipt rc ON rc.target_id = t.id
        WHERE t.request_id=$1::uuid AND t.sink = ANY($2::text[])
        ORDER BY t.sink, rc.receipt_kind`, [h.requestId, [...EXTERNAL]]);
    const confirmed = EXTERNAL.every((s) =>
      rc.rows.some((r) => r.sink === s && r.receipt_kind === 'external_confirmed' && r.resolved_at !== null));
    const ev = await admin.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM privacy_external_purge_evidence WHERE request_id=$1::uuid AND verified_absent`,
      [h.requestId]);
    A(id, confirmed && ev.rows[0]?.n === '3',
      `confirmed=${confirmed} evidenceN=${ev.rows[0]?.n} (N3: pending→resolve after evidence)`);
  }

  /* ── AP-DEL-01: DELETE=503 ── */
  {
    const id = 'AP-DEL-01';
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

  /* ── AP-HONEST-01: stub ≠ cloud · :64 OPEN ── */
  {
    const id = 'AP-HONEST-01';
    A(id,
      ENVIRONMENT_CLASS === 'local_isolated_stub'
      && pathResult?.cloudVendorDeleted === false
      && pathResult?.gap64Open === true
      && pathResult?.environmentClass === ENVIRONMENT_CLASS,
      `env=${ENVIRONMENT_CLASS} cloudVendorDeleted=${pathResult?.cloudVendorDeleted} gap64Open=${pathResult?.gap64Open} (stub≠cloud · :64 OPEN · Ban wash ada604a honesty into wipe)`);
  }

  const missing = REQUIRED_CASES.filter((c) => !seen.has(c));
  A('C-CASECOUNT', missing.length === 0, missing.length ? `missing=${missing.join(',')}` : `all ${REQUIRED_CASES.length} present`);

  console.log(JSON.stringify({
    line: 'AR',
    gap: 'GAP-PRIV-EXTERNAL-SINK-RETENTION',
    gapStatus: 'OPEN',
    canHonestlyFlip: false,
    gitSha,
    releaseEvidence: false,
    haStatus: 'NOT_HA',
    publicDelete: 503,
    environmentClass: ENVIRONMENT_CLASS,
    cloudVendorDeleted: false,
    evidenceClasses: EVIDENCE_CLASS_BY_SINK,
    nb3: 'external_confirmed≠vendor_deleted',
    citeHonestyNail: 'ada604a',
    countAsErased: false,
    coveredCount: 8,
    uc052: 'partial',
    cases: Object.fromEntries([...caseStatus.entries()]),
    details: Object.fromEntries([...caseDetail.entries()]),
    required: REQUIRED_CASES,
  }));

  console.log(failures === 0
    ? '\n✓ UC052 external sink async-purge prove PASS (stub path evidenced · ≠ cloud wipe · ≠ :64 CLOSED · ≠ covered · DELETE=503)'
    : `\n✗ UC052 external sink async-purge prove FAIL failures=${failures}`);
  await admin.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  try { await admin.end(); } catch { /* ignore */ }
  process.exit(1);
});
