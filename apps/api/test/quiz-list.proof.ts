/**
 * #232 押题列表显示面证明(隔离库·fixture 直插 resume+resume_profile+resume_quiz):
 *   list 扩投影返回 created_at(ISO)与 resume_display_name(resumeDisplayName 单一出处派生);
 *   resume_id NULL 行 → resume_display_name null(前端「未绑定简历」兜底,列表行不撒谎);
 *   status 过滤 / LIMIT 封顶 / RLS owner 谓词语义零变回归。
 * 隔离库(run-e2e-isolated 门·assertIsolatedTestTarget)·零模型调用·est live=0。
 *   pnpm quiz-list:prove   (经 scripts/run-e2e-isolated.mjs,绝不触碰开发库)
 */
import 'reflect-metadata';
import { assertIsolatedTestTarget, createPool, asPrincipal } from '@meetwise/db';
import { QuizService } from '../src/modules/quiz/quiz.service.ts';
import { DbService } from '../src/platform/db.service.ts';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const OWNER = 'quizListUser', OTHER = 'quizListOther', RUN = Date.now();
const QID_A = `qz-ls-a-${RUN}`, QID_B = `qz-ls-b-${RUN}`, QID_NULL = `qz-ls-n-${RUN}`, QID_OTHER = `qz-ls-o-${RUN}`;
const HINT = '负责订单系统限流改造';

// 生产 service + 真 pool 的 asPrincipal 薄封装(DbService 的 DI 形,绕开 Nest DI 容器)。
const svc = new QuizService({
  asPrincipal: <T,>(user: string, fn: (c: any) => Promise<T>) => asPrincipal(pool, user, fn),
} as unknown as DbService);

async function main() {
  await assertIsolatedTestTarget(pool);
  // fixture:owner 名下两份简历(一份带 profile/一份裸 resume)+ 押题三行(绑定带 profile 简历/绑定裸简历/resume_id NULL)+ 他人一行。
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES (gen_random_uuid(),$1,'ingested',$2),(gen_random_uuid(),$1,'ingested',$3) RETURNING id",
      [OWNER, `sha-ls-1-${RUN}`, `sha-ls-2-${RUN}`],
    );
    const r1 = (await c.query('SELECT id FROM resume WHERE owner_user_id=$1 AND content_sha=$2', [OWNER, `sha-ls-1-${RUN}`])).rows[0]!.id as string;
    await c.query(
      "INSERT INTO resume_profile(resume_id,owner_user_id,structured,pii_summary) VALUES ($1,$2,$3,$4)",
      [r1, OWNER, JSON.stringify({ experience: [{ text: HINT }], skills: [{ text: 'Redis、限流' }], facts: [] }), { phone: 0, email: 0, idcard: 0 }],
    );
    const r2 = (await c.query('SELECT id FROM resume WHERE owner_user_id=$1 AND content_sha=$2', [OWNER, `sha-ls-2-${RUN}`])).rows[0]!.id as string;
    // 0061 reference-pair 铁律:resume_id 与 privacy_epoch 成对写入(NULL 同步)——fixture 同约束真实插入。
    const eps = (await c.query('SELECT id, privacy_epoch FROM resume WHERE owner_user_id=$1', [OWNER])).rows as Array<{ id: string; privacy_epoch: number }>;
    const e1 = Number(eps.find((r) => r.id === r1)!.privacy_epoch);
    const e2 = Number(eps.find((r) => r.id === r2)!.privacy_epoch);
    await c.query(
      "INSERT INTO resume_quiz(id,owner_user_id,status,resume_id,privacy_epoch) VALUES ($1,$2,'ready',$3,$4),($5,$2,'failed',$6,$7),($8,$2,'created',NULL,NULL)",
      [QID_A, OWNER, r1, e1, QID_B, r2, e2, QID_NULL],
    );
  });
  await asPrincipal(pool, OTHER, async (c) => {
    await c.query("INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ($1,$2,'ready')", [QID_OTHER, OTHER]);
  });

  section('① list 扩投影:created_at(ISO) + resume_display_name(resumeDisplayName 单一出处)');
  const all = await svc.list(OWNER);
  const byId = new Map<string, any>(all.quizzes.map((q: any) => [q.id, q]));
  A('返回本人全部三行(他人行不见=RLS 语义零变)', all.quizzes.length === 3 && !byId.has(QID_OTHER));
  const rowA = byId.get(QID_A);
  A('created_at 序列化 ISO(沿 interview-view :14 形)', typeof rowA?.created_at === 'string' && !Number.isNaN(Date.parse(rowA.created_at)) && rowA.created_at.endsWith('Z'));
  A('绑定带 profile 简历 → 名含 experience hint(接地,非 id 假名)', typeof rowA?.resume_display_name === 'string' && rowA.resume_display_name.includes(HINT));
  const rowB = byId.get(QID_B);
  A('绑定裸简历(无 profile)→ 名仍如实派生(hint 缺省不编造)', typeof rowB?.resume_display_name === 'string' && rowB.resume_display_name.startsWith('简历'));
  const rowNull = byId.get(QID_NULL);
  A('resume_id NULL 行 → resume_display_name null(前端「未绑定简历」兜底面)', rowNull?.resume_display_name === null);

  section('② 过滤/封顶/RLS 回归(语义零变原值)');
  const failed = await svc.list(OWNER, 'failed');
  A('status 过滤:只回 failed 支', failed.quizzes.length === 1 && failed.quizzes[0]!.id === QID_B);
  const capped = await svc.list(OWNER, undefined, '1');
  A('LIMIT 封顶:limit=1 只回 1 行(ORDER BY created_at DESC 形不变)', capped.quizzes.length === 1);
  const otherList = await svc.list(OTHER);
  A('RLS:他人只见自己(OTHER 不见 OWNER 行)', otherList.quizzes.length === 1 && otherList.quizzes[0]!.id === QID_OTHER);
  A('他人行同样带扩投影字段(NULL 简历 → null)', otherList.quizzes[0]!.resume_display_name === null && typeof otherList.quizzes[0]!.created_at === 'string');

  console.log(`\n${failures === 0 ? '✓ 押题列表扩投影全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
