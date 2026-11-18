/**
 * 云前签发实库：begin → 0236 挂外部目标 → 活 digest 签验消费 → 真 worker 一拍。
 * 本地行删掉，请求停在 pending_external，不得 completed。
 * 只在隔离库跑。运行：node scripts/run-e2e-isolated.mjs privacy-signer-live:prove
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  asPrincipal, asPrivacyIssuer, assertIsolatedTestTarget, consumeAuthorizationSnapshotBound,
  createPool, issueAuthorizationSnapshot, type Client,
} from '@meetwise/db';
import { authorizeLiveDeletion, generatePrivacyAuthzKeyPair, type LiveDeletionRequest } from '@meetwise/domain';
import { notifyDeletionSigner } from '../../../apps/api/src/modules/profile/deletion-signer-client.ts';
import { beginInterviewProjectionErasure } from '../src/transcript/int-transcript-projection.ts';
import { interviewProjectionPrivacyErasureTick } from '../../../apps/worker/src/privacy-erasure-worker.ts';

const ROOT = resolve(import.meta.dirname, '../../..');

const admin = createPool({ purpose: 'privacy-signer-live' });
let signerChild: ChildProcess | null = null;
const owner = `signer-live-${process.pid}`;
const keys = generatePrivacyAuthzKeyPair('live-signer-1');
const nowSec = Math.floor(Date.now() / 1000);
let failed = 0;
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` · ${detail}` : ''}`);
  if (!ok) failed += 1;
};

async function seed(interviewId: string): Promise<void> {
  await admin.query(
    `INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions)
     VALUES ($1,$2,'active',0,0,'[]'::jsonb)`,
    [interviewId, owner],
  );
  await asPrincipal(admin, owner, async (c) => {
    await c.query(
      `INSERT INTO interview_event(owner_user_id, stream_key, seq, kind, payload)
       VALUES (current_setting('app.principal_user', true), $1, 1, 'question_ready', '{}'::jsonb)`,
      [interviewId],
    );
    await c.query(
      `INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
       VALUES ('mock-interview', $1, current_setting('app.principal_user', true), 'completed')`,
      [interviewId],
    );
    await c.query(
      `INSERT INTO ai_report(owner_user_id, interview_id)
       VALUES (current_setting('app.principal_user', true), $1)`,
      [interviewId],
    );
  });
}

async function loadLive(requestId: string): Promise<LiveDeletionRequest | null> {
  return asPrivacyIssuer(admin, owner, async (c: Client) => {
    const rows = await c.query<{
      owner_user_id: string; subject_id: string; scope: string; privacy_epoch: string | number;
      target_set_digest: string; sink: string; resource_hmac: string;
    }>('SELECT * FROM privacy_signer_live_target_set($1::uuid)', [requestId]);
    const first = rows.rows[0];
    if (!first) return null;
    return {
      requestId,
      owner: first.owner_user_id,
      subjectId: first.subject_id,
      scope: first.scope,
      privacyEpoch: Number(first.privacy_epoch),
      targetSetDigest: first.target_set_digest,
      targets: rows.rows.map((row) => ({ sink: row.sink, resourceHmac: row.resource_hmac })),
    };
  });
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  const interviewId = randomUUID();
  await seed(interviewId);
  const keyHash = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
  const begun = await asPrincipal(admin, owner, async (c) => {
    const started = await beginInterviewProjectionErasure(c, interviewId, keyHash.slice(0, 64), 1);
    await c.query('SELECT privacy_attach_external_retention_pending($1::uuid)', [started.requestId]);
    return started;
  });

  const missing = await authorizeLiveDeletion(keys, randomUUID(), {
    load: loadLive,
    issue: (input) => asPrivacyIssuer(admin, input.actor, (c) => issueAuthorizationSnapshot(c, input)),
    consume: (verified, worker) => asPrivacyIssuer(admin, verified.owner, (c) => consumeAuthorizationSnapshotBound(c, verified, worker)),
  }, nowSec);
  A('异常：不存在的请求不签发', missing.ok === false && missing.completed === false && missing.retryable === true);

  const socketPath = `/tmp/mw-signer-${process.pid}.sock`;
  try { unlinkSync(socketPath); } catch { /* absent */ }
  const child: ChildProcess = spawn('pnpm', ['exec', 'tsx', 'scripts/privacy-signer-serve.ts'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PRIVACY_SIGNER_SOCKET: socketPath,
      PRIVACY_AUTHZ_KID: keys.kid,
      PRIVACY_AUTHZ_PUBLIC_JWK: JSON.stringify(keys.publicJwk),
      PRIVACY_AUTHZ_PRIVATE_KEY_PEM: keys.privateKeyPem,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  signerChild = child;
  let signerLog = '';
  child.stderr?.on('data', (chunk) => { signerLog += String(chunk); });
  child.stdout?.on('data', (chunk) => { signerLog += String(chunk); });
  const listening = await new Promise<boolean>((resolveListening) => {
    const timer = setTimeout(() => resolveListening(false), 20_000);
    child.stderr?.on('data', () => {
      if (!signerLog.includes('privacy_signer_listening')) return;
      clearTimeout(timer);
      resolveListening(true);
    });
    child.on('exit', () => {
      clearTimeout(timer);
      resolveListening(signerLog.includes('privacy_signer_listening'));
    });
  });
  A('正常：独立签发进程只听本机套接字', listening, signerLog.trim().slice(-200));
  const notified = listening
    ? await notifyDeletionSigner([begun.requestId], { PRIVACY_SIGNER_SOCKET: socketPath }, owner)
    : { accepted: false, retryable: true, completed: false as const };
  const signerTail = signerLog.split('\n').filter((line) => line.startsWith('privacy_signer_')).slice(-4).join(' | ');
  A('正常：套接字通知被独立进程受理，不标完成', notified.accepted === true && notified.completed === false,
    `reason=${notified.reason ?? 'none'} ${signerTail}`);
  child.kill('SIGTERM');
  try { unlinkSync(socketPath); } catch { /* absent */ }
  const consumed = await admin.query<{ jti: string }>(
    `SELECT jti FROM privacy_authorization_snapshot
      WHERE interview_id=$1 AND owner_user_id=$2 AND consumed_at IS NOT NULL`,
    [interviewId, owner],
  );
  A('正常：活集由独立进程签发并消费，不标完成', consumed.rows.length === 1);
  const issuedJti = consumed.rows[0]?.jti ?? '';

  let replayRejected = false;
  if (issuedJti.length > 0) {
    try {
      await asPrivacyIssuer(admin, owner, (c) => c.query(
        'SELECT * FROM privacy_consume_authorization_snapshot($1,$2)',
        [issuedJti, 'privacy-signer'],
      ));
    } catch { replayRejected = true; }
  }
  A('异常：同一 jti 重放消费被拒', replayRejected);

  const tick = await interviewProjectionPrivacyErasureTick(admin, `signer-worker-${process.pid}`);
  const status = await admin.query<{ status: string }>('SELECT status FROM privacy_erasure_request WHERE id=$1::uuid', [begun.requestId]);
  const events = await admin.query<{ n: string }>('SELECT count(*)::text AS n FROM interview_event WHERE stream_key=$1', [interviewId]);
  const external = await admin.query<{ n: string }>(
    `SELECT count(*)::text AS n FROM privacy_deletion_target
      WHERE request_id=$1::uuid AND sink IN ('oss','redis','langfuse') AND status='retention_pending'`,
    [begun.requestId],
  );
  const requestStatus = status.rows[0]?.status ?? '';
  A('正常：worker 清掉本地行，外部仍 pending，请求不是 completed',
    tick.erased > 0
    && Number(events.rows[0]?.n) === 0
    && Number(external.rows[0]?.n) === 3
    && requestStatus === 'pending_external'
    && requestStatus !== 'completed',
    `erased=${tick.erased} status=${requestStatus} events=${events.rows[0]?.n} external=${external.rows[0]?.n}`);

  await admin.end();
  console.log(failed === 0 ? 'privacy-signer-live proof passed' : `failed ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'privacy_signer_live_failed');
  signerChild?.kill('SIGTERM');
  await admin.end().catch(() => undefined);
  process.exit(1);
});
