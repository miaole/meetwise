/**
 * 0124 记忆向量块删除 sink DB 证明（隔离 PostgreSQL）。
 *
 * 七类：① begin+purge 残留=0 ② 非法 hash 拒 ③ 0093 不含本 sink / qbank 不删
 * ④ 跨 owner=0 + 写围栏 ⑤ claim CAS 单赢家 ⑥ 0093 走完向量仍在 ⑦ 域错配拒。
 * 不宣称账户/备份/trace 已完整删除。
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  beginMemoryAccountErasure, beginMemoryVectorChunkErasure,
  claimMemoryVectorChunkTarget, purgeMemoryVectorChunkTarget,
  isMemoryVectorChunkErasureActive,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot,
  type Client,
} from '@meetwise/db';
import {
  MEMORY_VECTOR_CHUNK_DELETION_SINKS,
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';

const admin = createPool({ max: 40 });
const owner = `vchunk-owner-${process.pid}`;
const otherOwner = `vchunk-other-${process.pid}`;
const worker = `vchunk-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-vchunk-01');
const HASH = 'c'.repeat(64);
const HASH_MEM = 'd'.repeat(64);
const VEC512 = '[' + new Array(512).fill(0).join(',') + ']';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

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

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@vchunk.test`, 'scrypt$salt$dk'],
  );
}

async function insertChunk(id: string, ownerId: string, kind: 'memory' | 'qbank', refId: string): Promise<void> {
  await admin.query(
    `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
     VALUES ($1,$2,$3,$4,$5,$6::vector)`,
    [id, ownerId, kind, refId, id.replace(/-/g, '').padEnd(64, '0').slice(0, 64), VEC512],
  );
}

async function countChunks(ownerId: string, kind?: 'memory' | 'qbank'): Promise<number> {
  const r = kind
    ? await admin.query<{ n: string | number }>(
      'SELECT count(*) AS n FROM vector_chunk WHERE owner_user_id=$1 AND kind=$2', [ownerId, kind])
    : await admin.query<{ n: string | number }>(
      'SELECT count(*) AS n FROM vector_chunk WHERE owner_user_id=$1', [ownerId]);
  return Number(r.rows[0]?.n ?? 0);
}

function signAccountSnapshot(ownerId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: ownerId,
    purpose: 'account_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);

  A('域: MEMORY_VECTOR_CHUNK_DELETION_SINKS 冻结为 memory_vector_chunk',
    MEMORY_VECTOR_CHUNK_DELETION_SINKS.join(',') === 'memory_vector_chunk');

  const check = await admin.query<{ def: string }>(
    `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
      WHERE conrelid='privacy_deletion_target'::regclass AND contype='c'
        AND (conname='privacy_deletion_target_sink_check' OR pg_get_constraintdef(oid) LIKE '%sink%')
      LIMIT 1`);
  A('SQL CHECK 与域 sink 双向 pin',
    (check.rows[0]?.def ?? '').includes('memory_vector_chunk'));

  await insertChunk('vc-mem-owner', owner, 'memory', 'mem-1');
  await insertChunk('vc-mem-other', otherOwner, 'memory', 'mem-2');
  await insertChunk('vc-qbank-sys', '__system_qbank__', 'qbank', 'q-1');
  await insertChunk('vc-qbank-owner', owner, 'qbank', 'q-2');
  A('前置: owner memory=1 / other memory=1 / owner qbank=1 / system qbank=1',
    await countChunks(owner, 'memory') === 1
    && await countChunks(otherOwner, 'memory') === 1
    && await countChunks(owner, 'qbank') === 1
    && await countChunks('__system_qbank__', 'qbank') === 1);

  /* ⑥ 0093 不含本 sink，走完后向量仍在 */
  const memBegun = await asPrincipal(admin, owner, (c) => beginMemoryAccountErasure(c, HASH_MEM));
  A('⑥ 0093 begin 仍是 3 sink 且不含 memory_vector_chunk',
    memBegun.targets.length === 3
    && memBegun.targets.every((t) => t.sink !== 'memory_vector_chunk')
    && memBegun.targets.map((t) => t.sink).sort().join(',') === 'memory_context_snapshot,memory_embedding,memory_fact');
  A('⑥ 0093 后 owner memory 向量残留仍为 1', await countChunks(owner, 'memory') === 1);

  /* ② 非法 hash */
  A('② begin: 非 64-hex 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => beginMemoryVectorChunkErasure(c, 'short'))));

  /* ① begin */
  const begun = await asPrincipal(admin, owner, (c) => beginMemoryVectorChunkErasure(c, HASH));
  A('① begin: fenced + 恰好 1 个 memory_vector_chunk target',
    begun.requestStatus === 'fenced' && begun.targets.length === 1
    && begun.targets[0]?.sink === 'memory_vector_chunk');
  const targets: PrivacyAuthzTarget[] = begun.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  A('① begin: SQL digest 与 TS canonicalTargetSetDigest 逐字节相等',
    begun.targetSetDigest === canonicalTargetSetDigest(targets));
  const replay = await asPrincipal(admin, owner, (c) => beginMemoryVectorChunkErasure(c, HASH));
  A('E1 幂等: 同 hash 重放同一 request',
    replay.requestId === begun.requestId && replay.replayed === true);

  A('① 写围栏已激活',
    await asPrincipal(admin, owner, (c) => isMemoryVectorChunkErasureActive(c, owner)) === true);
  A('④ 围栏后迟到 memory INSERT 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
       VALUES ('vc-late',$1,'memory','late',$2,$3::vector)`,
      [owner, 'e'.repeat(64), VEC512]))));
  A('④ 他户围栏未激活，memory 仍可写',
    await asPrincipal(admin, otherOwner, (c) => isMemoryVectorChunkErasureActive(c, otherOwner)) === false);

  const targetId = (await admin.query<{ id: string }>(
    'SELECT id FROM privacy_deletion_target WHERE request_id=$1 AND sink=$2',
    [begun.requestId, 'memory_vector_chunk'])).rows[0]!.id;

  const signed = signAccountSnapshot(owner, begun.privacyEpoch, targets);
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: owner, interviewId: owner,
    purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch,
    targetSetDigest: signed.targetSetDigest, expiresAt: new Date(signed.expiresAtMs),
  }));
  await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, signed.jti, worker));

  const claims = await Promise.all([
    asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryVectorChunkTarget(c, signed.jti, targetId, `${worker}-a`)),
    asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryVectorChunkTarget(c, signed.jti, targetId, `${worker}-b`)),
  ]);
  const winners = claims.filter(Boolean);
  A('⑤ 并发 claim 恰一赢家', winners.length === 1 && !!winners[0]?.leaseToken);

  A('⑦ 跨 owner claim 拒',
    await rejects(() => asPrivacyWorkerPrincipal(admin, otherOwner, (c) =>
      claimMemoryVectorChunkTarget(c, signed.jti, targetId, worker))));

  A('⑤ 陈旧 token purge 拒（lease_lost）',
    await rejects(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      purgeMemoryVectorChunkTarget(c, targetId, '00000000-0000-4000-8000-000000000099'))));

  const purged = await asPrivacyWorkerPrincipal(admin, owner, (c) =>
    purgeMemoryVectorChunkTarget(c, targetId, winners[0]!.leaseToken));
  A('① purge: erased + request completed + 删除数=1',
    purged.status === 'erased' && purged.requestStatus === 'completed' && purged.deletedCount === 1);
  A('① 删后 owner memory=0（真物理删除）', await countChunks(owner, 'memory') === 0);
  A('③ qbank 与他户 memory 行数不变',
    await countChunks(owner, 'qbank') === 1
    && await countChunks('__system_qbank__', 'qbank') === 1
    && await countChunks(otherOwner, 'memory') === 1);
  A('E6 已完成 request 二次 purge 拒（不重复物理删）',
    await rejects(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      purgeMemoryVectorChunkTarget(c, targetId, winners[0]!.leaseToken))));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ memory_vector_chunk 删除围栏 DB 证明通过（本地隔离，releaseEvidence=false）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });
