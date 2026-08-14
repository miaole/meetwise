/**
 * 共享题库灌库**治理完整性**证明(真 Postgres):灌库不再直灌免治理,而是经策展治理入库
 *   (propose→approve→promoteToPool→vector_chunk),使**线上真实题库可被撤销下架**。
 *
 *   pnpm qbank:prove   (需 db:up;pgvector image)
 *
 * 断言:① 灌完后 annSearch(kind='qbank')能召回种子,且每条挂在 approved 策展源 + qbank_pool_entry 下(=受治理,非 lane(b) 直灌);
 *      ② **撤销(reject)某源后,它的真实 chunk 立即从 annSearch 消失**(chunk 仍在库 → 真过滤下架,非删除;证明现有题库可治理);
 *      ③ 灌库幂等(重灌不重复建源/池/块);④ 被撤销的种子**重灌不复活**(尊重下架)。
 * 治理路径由迁移 0017 provision(seed '__system_qbank__' 为 curator);annSearch 接管由 0016(qbank_visible_ref)。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, annSearch } from '@meetwise/db';
import { fakeEmbedder } from '@meetwise/ai-runtime';
import { ingestQbank, QBANK_OWNER, type QbankItem } from '../src/qbank-ingest.ts';
import { reviewSource } from '../src/qbank-curation.ts';
import { createHash } from 'node:crypto';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const dbSql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8');
const migSql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/${f}.sql`, import.meta.url)), 'utf8');
const emb = fakeEmbedder(512);
const hashOf = (t: string) => createHash('sha256').update(t).digest('hex').slice(0, 32);

const READER = 'readerX';                                   // 任意普通用户:公共读共享题库
const METADATA = { taxonomyVersion: 'v1', servingScopeId: 'backend/general', annotationSource: 'curator_reviewed' as const };
const LEGACY_FIXTURE = { allowLegacyMetadataFixture: true } as const;
const items: QbankItem[] = [
  { refId: 'itest:a', text: '灌库治理证明题 A:谈谈幂等与去重的取舍', ...METADATA },
  { refId: 'itest:b', text: '灌库治理证明题 B:撤销源如何即时下架其真实 chunk', ...METADATA },
  { refId: 'itest:c', text: '灌库治理证明题 C:崩溃半态如何原子恢复', ...METADATA },
];
// 任意用户按 kind='qbank' 召回的可见 ref 集合(块数 ≤ k 时全返回 → ref∈集 等价于可见)。
const visibleRefs = async (queryText: string): Promise<string[]> => {
  const [v] = await emb.embed([queryText]);
  if (!v) throw new Error('test_embedder_returned_no_query_vector');
  const hits = await asPrincipal(pool, READER, (c) => annSearch(c, READER, 'qbank', v, 10));
  return hits.map((h) => h.refId);
};
const countInt = async (q: string, p: unknown[] = []) => (await pool.query(q, p)).rows[0].n as number;

async function main() {
  await pool.query(dbSql('01_schema'));                     // app_role + RLS 基座
  await pool.query(dbSql('06_retrieval'));                  // vector_chunk(写门:qbank 仅系统 principal 可写)
  // 测试台重建(仅证明用):qbank_* 不在 01/06,持久库跨 schema 需先拆再由迁移建(否则 IF NOT EXISTS 跳过旧异构表)。
  await pool.query(`DROP VIEW IF EXISTS qbank_retrieval_candidate, qbank_visible_ref CASCADE;
    DROP TABLE IF EXISTS qbank_pool_entry, qbank_source, qbank_curator CASCADE;
    DROP FUNCTION IF EXISTS qbank_is_curator(), qbank_active_source_id(text),
      qbank_source_guard_update(), qbank_pool_requires_approved() CASCADE;`);
  await pool.query({ text: migSql('0013_qbank_source') });               // 源表 + 审核门 + 受审池
  await pool.query({ text: migSql('0016_qbank_retrieval_takeover') });   // annSearch 接管:可信可见集视图
  await pool.query({ text: migSql('0017_qbank_seed_curator') });         // provision:seed __system_qbank__ 为 curator(被测对象)
  await pool.query("DELETE FROM vector_chunk WHERE kind='qbank'");       // 清残留 qbank 块,结果确定
  A('前置:0017 已 seed __system_qbank__ 为 curator(治理路径 provision)',
    await countInt("SELECT count(*)::int n FROM qbank_curator WHERE user_id=$1", [QBANK_OWNER]) === 1);

  console.log('\n──────── ① 灌库经治理入库 + 可召回 ────────');
  const n = await ingestQbank(pool, items, emb, LEGACY_FIXTURE);
  A('灌 3 题(经 propose→approve→promoteToPool→vector_chunk)', n === 3);
  A('每条种子挂在 approved 策展源之下(3 条 approved qbank_source)',
    await countInt("SELECT count(*)::int n FROM qbank_source WHERE status='approved' AND content_hash = ANY($1)", [items.map((i) => hashOf(i.text))]) === 3);
  A('每条种子的 chunk 已进 qbank_pool_entry(受治理 lane(a),非免治理直灌 lane(b))',
    await countInt("SELECT count(*)::int n FROM qbank_pool_entry WHERE ref_id = ANY($1)", [items.map((i) => i.refId)]) === 3);
  let refs = await visibleRefs(items[0]!.text);
  A('任意用户公共读召回全部 3 条种子(真接地数据)', ['itest:a', 'itest:b', 'itest:c'].every((r) => refs.includes(r)));

  console.log('\n──────── ② 撤销源即时下架其真实 chunk(现有题库可治理)────────');
  const hb = hashOf(items[1]!.text);
  A('撤销 itest:b 的源(approved→rejected)生效',
    await asPrincipal(pool, QBANK_OWNER, (c) => reviewSource(c, 'qs-' + hb, 'approved', 'rejected', 'takedown test')));
  A('撤销后 itest:b 的 chunk 仍在 vector_chunk(证下面是真过滤下架,非删除)',
    await countInt("SELECT count(*)::int n FROM vector_chunk WHERE ref_id='itest:b' AND kind='qbank'") === 1);
  refs = await visibleRefs(items[1]!.text);
  A('撤销后 itest:b 立即从 annSearch 消失(线上真实题库被真正下架)', !refs.includes('itest:b'));
  A('撤销不误伤其余种子(itest:a / itest:c 仍可召回)', refs.includes('itest:a') && refs.includes('itest:c'));

  console.log('\n──────── ③ 灌库幂等 + ④ 被撤销种子不复活 ────────');
  const n2 = await ingestQbank(pool, items, emb, LEGACY_FIXTURE);           // 重灌:b 已 rejected 应被跳过
  A('重灌返回 2(被下架的 itest:b 跳过,尊重下架)', n2 === 2);
  A('幂等:qbank_source 仍 3 行(不重复建源)',
    await countInt("SELECT count(*)::int n FROM qbank_source WHERE content_hash = ANY($1)", [items.map((i) => hashOf(i.text))]) === 3);
  A('幂等:qbank_pool_entry 仍 3 行(不重复建池条目)',
    await countInt("SELECT count(*)::int n FROM qbank_pool_entry WHERE ref_id = ANY($1)", [items.map((i) => i.refId)]) === 3);
  A('幂等:vector_chunk 仍 3 行(hash 去重,不重复建块)',
    await countInt("SELECT count(*)::int n FROM vector_chunk WHERE ref_id = ANY($1) AND kind='qbank'", [items.map((i) => i.refId)]) === 3);
  A('itest:b 重灌未复活(仍 rejected,仍不可召回)',
    await countInt("SELECT count(*)::int n FROM qbank_source WHERE id=$1 AND status='rejected'", ['qs-' + hb]) === 1
    && !(await visibleRefs(items[1]!.text)).includes('itest:b'));

  console.log('\n──────── ⑤ 键对齐:同题面/不同 refId 不崩 + 共享源撤销全下架(修专家审计致命项)────────');
  const DUP = '灌库治理证明:同题面不同 refId 的键对齐用例';
  const hd = hashOf(DUP);
  const nd = await ingestQbank(pool, [{ refId: 'itest:d1', text: DUP, ...METADATA }, { refId: 'itest:d2', text: DUP, ...METADATA }], emb, LEGACY_FIXTURE);
  A('同题面不同 refId 一批灌入不崩(pool PK 随 refId,不逃逸 ON CONFLICT → 无 23505 整批中止)', nd === 2);
  A('同题面两 refId 共享一条策展源(content_hash 去重,不重复建源)',
    await countInt("SELECT count(*)::int n FROM qbank_source WHERE content_hash=$1", [hd]) === 1
    && await countInt("SELECT count(*)::int n FROM qbank_pool_entry WHERE ref_id = ANY($1)", [['itest:d1', 'itest:d2']]) === 2);
  const dupRefs = await visibleRefs(DUP);
  A('灌后同题面可召回(≥1 个 refId 可见)', dupRefs.includes('itest:d1') || dupRefs.includes('itest:d2'));
  await asPrincipal(pool, QBANK_OWNER, (c) => reviewSource(c, 'qs-' + hd, 'approved', 'rejected', 'dup takedown'));
  A('撤销共享源 → 该题面下所有 refId 即时下架(治理挂对对象)',
    await visibleRefs(DUP).then((r) => !r.includes('itest:d1') && !r.includes('itest:d2')));

  console.log('\n──────── ⑥ refId 内容不可变守卫:改版 fail-loud(不静默 mis-key 治理)────────');
  await ingestQbank(pool, [{ refId: 'itest:e', text: '改版守卫 v1', ...METADATA }], emb, LEGACY_FIXTURE);
  let revErr = false;
  try { await ingestQbank(pool, [{ refId: 'itest:e', text: '改版守卫 v2(同 refId 换内容)', ...METADATA }], emb, LEGACY_FIXTURE); }
  catch { revErr = true; }
  A('同 refId 换内容重灌 → 抛错(fail-loud,改版须走新 refId + 撤销旧源)', revErr);

  console.log(`\n${fail === 0 ? '✓ 灌库治理完整性(经审核入库 + 可撤销下架 + 幂等 + 不复活 + 键对齐 + 改版守卫)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.stack ?? e); process.exit(1); });
