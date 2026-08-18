/**
 * 生产向量库证明（真 Postgres + pgvector HNSW）：ANN 检索正确(对齐暴力余弦)、HNSW 索引真被用、RLS 隔离、去重、隐私(不存原文)。
 *   pnpm vectorstore:prove   (临时隔离 pgvector image；不读取开发库残留的 generation schema)
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertIsolatedTestTarget, createPool, asPrincipal, upsertVectorChunk, annSearchLegacy } from '../src/index.ts';

export type VectorstoreProofOutcome = {
  assertions: number;
  failures: string[];
};

const DIM = 512;
// 确定性 512 维向量(每块一个,LCG 伪随机 + 归一)
function embed(seed: number): number[] {
  let s = (seed * 2654435761) >>> 0; const v: number[] = [];
  for (let i = 0; i < DIM; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; v.push(s / 2 ** 32 - 0.5); }
  const nrm = Math.hypot(...v); return v.map((x) => x / nrm);
}
const cosine = (a: number[], b: number[]) => { let d = 0; for (let i = 0; i < a.length; i++) d += a[i]! * b[i]!; return d; }; // 已归一

/**
 * The exact vector-store proof shared by the local isolated target and the
 * private cloud test runner. Target attestation remains the caller's job;
 * every schema, ANN, RLS and privacy assertion below is identical.
 */
export async function runVectorstoreProof(
  pool: any,
  sqlDirectory: string,
  report?: (name: string, passed: boolean) => void,
): Promise<VectorstoreProofOutcome> {
  let assertions = 0;
  const failures: string[] = [];
  const A = (name: string, passed: boolean) => {
    assertions++;
    report?.(name, passed);
    if (!passed) failures.push(name);
  };
  const sql = (file: string) => readFileSync(resolve(sqlDirectory, file), 'utf8');

  await pool.query(sql('01_schema.sql'));
  // The local Docker proof usually connects as a PostgreSQL superuser.  The
  // project-only cloud runner intentionally does not, so grant the freshly
  // created runtime role to the proof connection explicitly. This remains
  // part of the one shared assertion body and disappears with its database.
  const currentRole = String((await pool.query('SELECT current_user AS role')).rows[0]?.role ?? '');
  if (!currentRole) throw new Error('vectorstore_proof_current_role_missing');
  await pool.query(`GRANT app_role TO "${currentRole.replaceAll('"', '""')}"`);
  await pool.query(sql('06_retrieval.sql'));
  const N = 60, OWNER = 'userA', QOWNER = '__system_qbank__';   // qbank 现仅系统灌库 principal 可写(06_retrieval 写门收紧);memory 仍各用户自写
  const vecs = Array.from({ length: N }, (_, i) => embed(i + 1));

  await asPrincipal(pool, QOWNER, async (c) => {
    for (let i = 0; i < N; i++) await upsertVectorChunk(c, QOWNER, { id: `vc${i}`, kind: 'qbank', refId: `q${i}`, contentHash: `h${i}`, embedding: vecs[i]! });
  });
  A(`写入 ${N} 个向量块`, (await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM vector_chunk'))).rows[0].n === N);

  // ① ANN 正确性:用第 7 块自身向量查 → top-1 必是 q7
  // This fixture only installs the legacy vector schema, not the versioned
  // qbank-generation metadata. Keep the proof on the legacy read primitive
  // it was designed to validate rather than accidentally exercising the
  // unrelated generation control plane.
  const self = await asPrincipal(pool, OWNER, (c) => annSearchLegacy(c, 'qbank', vecs[7]!, 5));
  A('ANN 自查:top-1 = 自己(q7),距离≈0', self[0]?.refId === 'q7' && (self[0]?.distance ?? Infinity) < 1e-4);

  // ② ANN ≈ 暴力余弦:扰动查询,HNSW top-5 与暴力 top-5 高度一致(ANN 近似但应高召回)
  const q = embed(7).map((x, i) => x + (i % 11 === 0 ? 0.02 : 0));   // 轻扰动
  const ann = (await asPrincipal(pool, OWNER, (c) => annSearchLegacy(c, 'qbank', q, 5))).map((r) => r.refId);
  const brute = vecs.map((v, i) => ({ id: `q${i}`, s: cosine(q, v) })).sort((a, b) => b.s - a.s).slice(0, 5).map((x) => x.id);
  const overlap = ann.filter((id) => brute.includes(id)).length;
  A(`ANN top-5 与暴力余弦 top-5 重合 ${overlap}/5(HNSW 高召回)`, overlap >= 4 && ann[0] === brute[0]);

  // ③ HNSW 索引真被使用(非 seq scan)
  const plan = (await asPrincipal(pool, OWNER, (c) => c.query(`EXPLAIN SELECT ref_id FROM vector_chunk WHERE kind='qbank' ORDER BY embedding <=> '${`[${q.join(',')}]`}'::vector LIMIT 5`))).rows.map((r) => r['QUERY PLAN']).join(' ');
  A('查询计划走 HNSW 索引(ix_vchunk_hnsw),非全表扫', /ix_vchunk_hnsw|Index Scan/i.test(plan));

  // ④ 去重:同 owner+kind+hash 再写 → 不新增
  await asPrincipal(pool, QOWNER, (c) => upsertVectorChunk(c, QOWNER, { id: 'vcX', kind: 'qbank', refId: 'q0', contentHash: 'h0', embedding: vecs[0]! }));
  A('同 hash 幂等去重(不增行)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM vector_chunk'))).rows[0].n === N);

  // ⑤ 租户模型(决策 i):qbank 共享公共读 / memory 私有 owner-only
  const bSeesQbank = await asPrincipal(pool, 'userB', (c) => annSearchLegacy(c, 'qbank', vecs[7]!, 5));
  A('qbank 共享:userB 也能检索到(策展真题=共享知识,公共读)', bSeesQbank.length > 0);
  await asPrincipal(pool, OWNER, (c) => upsertVectorChunk(c, OWNER, { id: 'mA', kind: 'memory', refId: 'mem-a', contentHash: 'hm', embedding: vecs[7]! }));
  const bSeesMem = await asPrincipal(pool, 'userB', (c) => annSearchLegacy(c, 'memory', vecs[7]!, 5));
  A('memory 私有:userB 检索不到 userA 的成长档案(不串户,RLS 限己)', bSeesMem.length === 0);

  // ⑥ 隐私:表里无原文列(只 ref_id + hash + 向量)
  const cols = (await asPrincipal(pool, OWNER, (c) => c.query("SELECT column_name FROM information_schema.columns WHERE table_name='vector_chunk'"))).rows.map((r) => r.column_name);
  A('向量库不含原文/内容列(只 ref_id+hash+embedding,隐私)', !cols.includes('content') && !cols.includes('text') && cols.includes('ref_id') && cols.includes('content_hash'));

  return { assertions, failures };
}

function localSqlDirectory(): string {
  const packageDirectory = resolve(process.cwd(), 'sql');
  if (existsSync(packageDirectory)) return packageDirectory;
  const workspaceDirectory = resolve(process.cwd(), 'packages/db/sql');
  if (existsSync(workspaceDirectory)) return workspaceDirectory;
  throw new Error('vectorstore_proof_sql_directory_missing');
}

async function main() {
  const pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    const outcome = await runVectorstoreProof(pool, localSqlDirectory(), (name, passed) => {
      console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}`);
    });
    console.log(`\n${outcome.failures.length === 0 ? '✓ 生产向量库(pgvector HNSW)全部通过' : `✗ ${outcome.failures.length} 项失败`}`);
    process.exitCode = outcome.failures.length === 0 ? 0 : 1;
  } finally {
    await pool.end();
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath.endsWith('/vectorstore.proof.ts')) {
  void main().catch((error) => { console.error(error); process.exitCode = 1; });
}
