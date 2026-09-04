/**
 * 0129 预览删除路径隔离 PostgreSQL 证明。
 * 七类：正/异/特/逃/并/复/刁。不宣称生产删除完成。
 */
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  beginPrivacyPreviewErasure, getPrivacyPreviewReceipt, listPrivacyPreviewReceipts,
  type Client,
} from '@meetwise/db';
import { PRIVACY_PREVIEW_SINK_CATALOG } from '@meetwise/domain';

const admin = createPool({ max: 20 });
const owner = `preview-owner-${process.pid}`;
const other = `preview-other-${process.pid}`;
const interviewId = `preview-iv-${process.pid}`;
const HASH = 'a'.repeat(64);
const HASH2 = 'b'.repeat(64);
const HASH3 = 'c'.repeat(64);
const HASH4 = 'd'.repeat(64);
const HASH5 = 'e'.repeat(64);

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@preview.test`, 'scrypt$salt$dk'],
  );
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(other);
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, owner],
  );

  const catalogCount = Number((await admin.query<{ n: string }>('SELECT count(*)::int AS n FROM privacy_preview_catalog()')).rows[0]?.n);
  A('正：SQL catalog 与域目录行数一致', catalogCount === PRIVACY_PREVIEW_SINK_CATALOG.length);

  const begun = await asPrincipal(admin, owner, (c: Client) =>
    beginPrivacyPreviewErasure(c, 'interview_data', interviewId, HASH));
  A('正：面试预览 local_fenced 且 sink 齐全、未完成',
    begun.status === 'local_fenced'
    && begun.replayed === false
    && begun.productionSloClaimed === false
    && begun.completeness === 'preview_incomplete'
    && begun.editionLabel === '预览版'
    && begun.sinks.length === PRIVACY_PREVIEW_SINK_CATALOG.length
    && typeof begun.localSweepRequestId === 'string'
    && begun.sinks.some((row) => row.sink === 'event' && row.disposition === 'local_begin_started')
    && begun.sinks.some((row) => row.sink === 'oss' && row.disposition === 'external_pending'));

  const child = await admin.query<{ n: string }>(
    'SELECT count(*)::int AS n FROM privacy_erasure_request WHERE id=$1 AND owner_user_id=$2 AND scope=$3',
    [begun.localSweepRequestId, owner, 'interview_data']);
  A('正：链接的 0096 子请求存在', Number(child.rows[0]?.n) === 1);
  const active = await asPrincipal(admin, owner, async (c: Client) => {
    const r = await c.query<{ active: boolean }>('SELECT interview_privacy_active($1) AS active', [interviewId]);
    return r.rows[0]?.active;
  });
  const anchors = Number((await admin.query<{ n: string }>(
    'SELECT count(*)::int AS n FROM privacy_checkpoint_target WHERE thread_id=$1 AND owner_user_id=$2',
    [interviewId, owner],
  )).rows[0]?.n);
  A('正：面试预览后投影围栏生效（active=false 且 fence 锚≥1）',
    active === false && anchors >= 1);

  const replay = await asPrincipal(admin, owner, (c: Client) =>
    beginPrivacyPreviewErasure(c, 'interview_data', interviewId, HASH));
  A('复：同 key 重放同一 requestId', replay.replayed === true && replay.requestId === begun.requestId);

  const got = await asPrincipal(admin, owner, (c: Client) => getPrivacyPreviewReceipt(c, begun.requestId));
  A('正：GET 读同一回执', got.requestId === begun.requestId && got.sinks.length === begun.sinks.length);

  A('异：非 64-hex hash 拒',
    await rejects(() => asPrincipal(admin, owner, (c: Client) =>
      beginPrivacyPreviewErasure(c, 'resume_data', null, 'not-hex'))));

  A('特：面试缺 subject 拒',
    await rejects(() => asPrincipal(admin, owner, (c: Client) =>
      beginPrivacyPreviewErasure(c, 'interview_data', null, HASH2))));

  const resume = await asPrincipal(admin, owner, (c: Client) =>
    beginPrivacyPreviewErasure(c, 'resume_data', null, HASH2));
  A('特：简历只盘点、无本地 sweep',
    resume.status === 'inventoried' && resume.localSweepRequestId === null
    && resume.sinks.every((row) => row.disposition !== 'local_begin_started'));

  const conflict = await rejects(() => asPrincipal(admin, owner, (c: Client) =>
    beginPrivacyPreviewErasure(c, 'account_data', null, HASH)));
  A('并：同 key 不同 scope 冲突', conflict);

  const listed = await asPrincipal(admin, owner, (c: Client) => listPrivacyPreviewReceipts(c, 8));
  A('正：列表含本 owner 预览请求', listed.some((row) => row.requestId === begun.requestId));

  A('刁：跨 owner GET=0',
    await rejects(() => asPrincipal(admin, other, (c: Client) => getPrivacyPreviewReceipt(c, begun.requestId))));

  const otherCount = await asPrincipal(admin, other, async (c: Client) => {
    const r = await listPrivacyPreviewReceipts(c, 8);
    return r.length;
  });
  A('刁：其他 owner 列表=0', otherCount === 0);

  const forged = await admin.query(
    `UPDATE privacy_preview_request SET status='completed' WHERE id=$1`,
    [begun.requestId],
  ).then(() => false).catch(() => true);
  A('逃：不能把预览请求标 completed', forged);

  const account = await asPrincipal(admin, owner, (c: Client) =>
    beginPrivacyPreviewErasure(c, 'account_data', null, HASH3));
  A('复：账户预览启动 0125，user_memory 仍未闭合',
    account.status === 'local_fenced'
    && account.sinks.some((row) => row.sink === 'memory_vector_chunk' && row.disposition === 'local_begin_started')
    && account.sinks.some((row) => row.sink === 'user_memory' && row.disposition === 'honest_unresolved')
    && account.completeness === 'preview_incomplete');

  const storedHashes = await admin.query<{ idempotency_key_hash: string }>(
    'SELECT idempotency_key_hash FROM privacy_preview_request WHERE owner_user_id=$1',
    [owner]);
  A('刁：落库只接受调用方已 HMAC 的 64-hex，不含 raw 明文键',
    storedHashes.rows.length >= 1
    && storedHashes.rows.every((row) => /^[a-f0-9]{64}$/.test(row.idempotency_key_hash))
    && !storedHashes.rows.some((row) => row.idempotency_key_hash.includes('raw-key') || row.idempotency_key_hash === HASH.slice(0, 8)));

  const beforeFail = Number((await admin.query<{ n: string }>(
    'SELECT count(*)::int AS n FROM privacy_preview_request WHERE owner_user_id=$1',
    [owner],
  )).rows[0]?.n);
  const foreignInterview = `preview-foreign-iv-${process.pid}`;
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [foreignInterview, other],
  );
  A('异：他人面试 begin 失败后预览行不增加',
    await rejects(() => asPrincipal(admin, owner, (c: Client) =>
      beginPrivacyPreviewErasure(c, 'interview_data', foreignInterview, HASH5)))
    && Number((await admin.query<{ n: string }>(
      'SELECT count(*)::int AS n FROM privacy_preview_request WHERE owner_user_id=$1',
      [owner],
    )).rows[0]?.n) === beforeFail);

  const concurrent = await Promise.allSettled([
    asPrincipal(admin, owner, (c: Client) => beginPrivacyPreviewErasure(c, 'resume_data', null, HASH4)),
    asPrincipal(admin, owner, (c: Client) => beginPrivacyPreviewErasure(c, 'resume_data', null, HASH4)),
  ]);
  const concurrentOk = concurrent.filter((row) => row.status === 'fulfilled') as PromiseFulfilledResult<Awaited<ReturnType<typeof beginPrivacyPreviewErasure>>>[];
  const concurrentCount = Number((await admin.query<{ n: string }>(
    'SELECT count(*)::int AS n FROM privacy_preview_request WHERE owner_user_id=$1 AND idempotency_key_hash=$2',
    [owner, HASH4],
  )).rows[0]?.n);
  A('并：同 key 并发恰 1 预览请求且回执同一 requestId',
    concurrentCount === 1
    && concurrentOk.length >= 1
    && concurrentOk.every((row) => row.value.requestId === concurrentOk[0].value.requestId));

  if (failures) {
    console.error(`\n✗ privacy-erasure-preview db ${failures} 失败`);
    process.exit(1);
  }
  console.log('\n✓ privacy-erasure-preview db 证明通过');
  await admin.end();
}

main().catch(async (error) => {
  console.error(error);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
