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

  const rawKey = await admin.query<{ n: string }>(
    `SELECT count(*)::int AS n FROM privacy_preview_request
      WHERE owner_user_id=$1 AND idempotency_key_hash=$2`,
    [owner, 'raw-key-must-not-land']);
  A('刁：原始幂等键不入库', Number(rawKey.rows[0]?.n) === 0);

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
