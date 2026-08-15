/**
 * growth:prove — 成长档案/能力曲线读侧聚合证明（对真 Postgres）。
 * 证明:(1) 历次 ready 评估 → 按时间升序的成长点;(2) 维度并集 + 各场维度分;(3) 趋势由最新两场 overall 决定;
 *       (4) 边界 0/1 场不臆造方向(trend=none);(5) **RLS 隔离**——他人评估永不入本人成长档案;
 *       (6) 聚合是确定性纯函数 deriveGrowth(乱序输入仍稳定排序);(7) 响应零 PII(只 score/维度标签/时间戳)。
 * 编排 = db SQL(asPrincipal/appendEvent) + domain.deriveGrowth(生产同一函数,非测试复制)。
 *   pnpm growth:prove   (需 dev Postgres 起着)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createPool, asPrincipal, appendEvent } from '../src/index.ts';
import { deriveGrowth, toGrowthRow, type GrowthRow, type GrowthView } from '@meetwise/domain';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

const OWNER_A = `growthA-${randomUUID()}`;
const OWNER_B = `growthB-${randomUUID()}`;
const OWNER_C = `growthC-${randomUUID()}`;   // 零评估,空档案边界

// 插一行评估(经 asPrincipal,RLS WITH CHECK 强制 owner 一致;created_at 显式控序)。
async function seedAssessment(owner: string, iid: string, overall: number | null, dims: { dimension: string; score: number }[], ageSeconds: number) {
  await asPrincipal(pool, owner, (c) => c.query(
    `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions, overall, created_at)
       VALUES ($1,$2,$3,'ready',$4,$5, now() - ($6 || ' seconds')::interval)`,
    [randomUUID(), owner, iid, JSON.stringify(dims), overall, String(ageSeconds)]));
}

// 走与 profile.service.growth **同一** SQL + 同一 toGrowthRow 映射 + 同一 deriveGrowth(映射真相单一,杜绝 gate 与生产漂移)。
async function loadGrowth(owner: string): Promise<GrowthView> {
  return asPrincipal(pool, owner, async (c) => {
    const rep = await c.query("SELECT interview_id, overall, dimensions, created_at FROM assessment_report WHERE owner_user_id=current_setting('app.principal_user', true) AND status='ready' ORDER BY created_at ASC, interview_id ASC");
    const ans = await c.query("SELECT count(*)::int n FROM interview_event e WHERE e.kind='answer_evaluated' AND EXISTS (SELECT 1 FROM interview_question q WHERE q.owner_user_id=e.owner_user_id AND q.interview_id=e.stream_key AND q.question_id=e.payload->>'questionId' AND q.state_version=CASE WHEN COALESCE(e.payload->>'stateVersion','') ~ '^[0-9]+$' THEN (e.payload->>'stateVersion')::int ELSE NULL END AND q.answer_id=e.payload->>'answerId' AND q.answer_hash=e.payload->>'answerHash' AND q.competency=e.payload->>'competency' AND q.status='answered')");
    return deriveGrowth(rep.rows.map(toGrowthRow), ans.rows[0].n);
  });
}

async function main() {
  await pool.query(sql('../sql/01_schema.sql'));      // app_role / RLS GUC / interview_event
  await pool.query(sql('../sql/08_assessment.sql'));  // assessment_report (+GRANT +RLS)
  await pool.query(sql('../migrations/0021_interview_question_identity.sql'));

  // OWNER_A: 3 场(故意乱序插入,靠 created_at 还原时间序)。overall 50 → 65 → 60(最新两场 65→60 = down)。
  await seedAssessment(OWNER_A, 'IV-A2', 65, [{ dimension: '系统设计', score: 70 }, { dimension: '算法', score: 60 }], 200);
  await seedAssessment(OWNER_A, 'IV-A3', 60, [{ dimension: '系统设计', score: 75 }, { dimension: '沟通', score: 45 }], 100);
  await seedAssessment(OWNER_A, 'IV-A1', 50, [{ dimension: '系统设计', score: 50 }, { dimension: '算法', score: 40 }], 300);
  await asPrincipal(pool, OWNER_A, (c) => appendEvent(c, OWNER_A, 'IV-A1', 'answer_evaluated', { questionId: 'growth-q-1', stateVersion: 1, answerId: '11111111-1111-4111-8111-111111111111', answerHash: 'a'.repeat(64), competency: '系统设计', turn: 0, score: 50 }));
  await asPrincipal(pool, OWNER_A, (c) => appendEvent(c, OWNER_A, 'IV-A1', 'answer_evaluated', { questionId: 'growth-q-2', stateVersion: 1, answerId: '22222222-2222-4222-8222-222222222222', answerHash: 'b'.repeat(64), competency: '算法', turn: 1, score: 40 }));
  await asPrincipal(pool, OWNER_A, (c) => c.query(
    `INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,competency,status,answer_id,answer_hash)
     VALUES ($1,'IV-A1','growth-q-1',1,0,'系统设计题','系统设计','answered','11111111-1111-4111-8111-111111111111',$2),
            ($1,'IV-A1','growth-q-2',2,1,'算法题','算法','answered','22222222-2222-4222-8222-222222222222',$3)`,
    [OWNER_A, 'a'.repeat(64), 'b'.repeat(64)],
  ));

  // OWNER_B: 1 场(单场=趋势 none)+ 一行 quarantine（非 ready,必须被过滤掉）。
  await seedAssessment(OWNER_B, 'IV-B1', 80, [{ dimension: '系统设计', score: 80 }], 50);
  await asPrincipal(pool, OWNER_B, (c) => c.query(
    `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions, overall) VALUES ($1,$2,'IV-B-pending','pending','[]',null)`,
    [randomUUID(), OWNER_B]));

  section('① 时间序成长点（乱序插入仍左老右新）');
  const ga = await loadGrowth(OWNER_A);
  A('场次=3', ga.totals.sessions === 3);
  A('points 按时间升序: A1→A2→A3', ga.points.map((p) => p.interviewId).join(',') === 'IV-A1,IV-A2,IV-A3');
  A('各场 overall 还原正确 [50,65,60]', ga.points.map((p) => p.overall).join(',') === '50,65,60');

  section('② 维度并集 + 各场维度分');
  A('dimensions 并集含 系统设计/算法/沟通', ['系统设计', '算法', '沟通'].every((d) => ga.dimensions.includes(d)));
  A('dimensions 已排序(确定性)', JSON.stringify(ga.dimensions) === JSON.stringify([...ga.dimensions].sort()));
  A('A1.dims 系统设计=50 算法=40', ga.points[0]?.dims['系统设计'] === 50 && ga.points[0]?.dims['算法'] === 40);
  A('A3.dims 含沟通=45、不含算法', ga.points[2]?.dims['沟通'] === 45 && !('算法' in (ga.points[2]?.dims ?? {})));

  section('③ 汇总:最佳/最新/趋势');
  A('bestScore=65', ga.totals.bestScore === 65);
  A('latestScore=60', ga.totals.latestScore === 60);
  A('trend=down(65→60)', ga.totals.trend === 'down');
  A('answered=2(answer_evaluated 计数透传)', ga.totals.answered === 2);

  section('④ 边界:0 场 / 1 场不臆造方向');
  const gc = await loadGrowth(OWNER_C);
  A('空档案: sessions=0 / points=[] ', gc.totals.sessions === 0 && gc.points.length === 0);
  A('空档案: best/latest=null, trend=none', gc.totals.bestScore === null && gc.totals.latestScore === null && gc.totals.trend === 'none');
  const gb = await loadGrowth(OWNER_B);
  A('单场: sessions=1, trend=none(不足两场)', gb.totals.sessions === 1 && gb.totals.trend === 'none');
  A('非 ready(pending) 评估被过滤,不计入', gb.points.every((p) => p.interviewId !== 'IV-B-pending'));
  A('单场 best=latest=80', gb.totals.bestScore === 80 && gb.totals.latestScore === 80);

  section('⑤ RLS 隔离:他人评估永不入本人档案');
  A('A 的档案里无任何 B 的面试', ga.points.every((p) => !p.interviewId.startsWith('IV-B')));
  A('A 的场次正好是自己的 3 场(无越权多读)', ga.totals.sessions === 3);
  A('B 的档案里无任何 A 的面试', gb.points.every((p) => !p.interviewId.startsWith('IV-A')));

  section('⑥ 诚实语义:最新一场未评分 / 全未评分 / 平局(修审计 #4·#3·#5)');
  // OWNER_D: 三场 ready,最新一场 overall=NULL(schema 合法:ready 不强制有分)。绝不把旧分冒充"最新"。
  const OWNER_D = `growthD-${randomUUID()}`;
  await seedAssessment(OWNER_D, 'IV-D1', 50, [{ dimension: '系统设计', score: 50 }], 300);
  await seedAssessment(OWNER_D, 'IV-D2', 60, [{ dimension: '系统设计', score: 60 }], 200);
  await seedAssessment(OWNER_D, 'IV-D3', null, [{ dimension: '系统设计', score: 55 }], 100); // 最新场未评分
  const gd = await loadGrowth(OWNER_D);
  A('最新场未评分 → latestScore=null(不冒充旧分)', gd.totals.latestScore === null);
  A('最新场未评分 → trend=none(不画无视最新场的趋势)', gd.totals.trend === 'none');
  A('bestScore 仍取历来已评分最高=60', gd.totals.bestScore === 60);
  A('未评分场仍计入 sessions=3 与 points', gd.totals.sessions === 3 && gd.points[2]?.overall === null);

  // 全未评分:不出 -Infinity,best/latest=null,trend=none。
  const OWNER_E = `growthE-${randomUUID()}`;
  await seedAssessment(OWNER_E, 'IV-E1', null, [], 200);
  await seedAssessment(OWNER_E, 'IV-E2', null, [], 100);
  const ge = await loadGrowth(OWNER_E);
  A('全未评分 → best/latest=null, trend=none, 无 -Infinity', ge.totals.bestScore === null && ge.totals.latestScore === null && ge.totals.trend === 'none');

  // 平局:最新两场相等 → flat。
  const OWNER_F = `growthF-${randomUUID()}`;
  await seedAssessment(OWNER_F, 'IV-F1', 70, [], 200);
  await seedAssessment(OWNER_F, 'IV-F2', 70, [], 100);
  const gf = await loadGrowth(OWNER_F);
  A('平局(70→70) → trend=flat', gf.totals.trend === 'flat');

  section('⑦ deriveGrowth 纯函数确定性(乱序输入→稳定排序)');
  const shuffled: GrowthRow[] = [
    { interviewId: 'z', overall: 70, dimensions: [], at: '2026-03-02T00:00:00.000Z' },
    { interviewId: 'a', overall: 55, dimensions: [], at: '2026-01-01T00:00:00.000Z' },
    { interviewId: 'm', overall: 90, dimensions: [], at: '2026-02-01T00:00:00.000Z' },
  ];
  const gs = deriveGrowth(shuffled);
  A('乱序→按时间升序 a,m,z', gs.points.map((p) => p.interviewId).join(',') === 'a,m,z');
  A('trend=down(90→70)', gs.totals.trend === 'down');
  A('overall 超界被 clamp(>100→100,<0→0)', (() => {
    const g = deriveGrowth([{ interviewId: 'x', overall: 150, dimensions: [{ dimension: 'd', score: -5 }], at: '2026-01-01T00:00:00.000Z' }]);
    return g.points[0]?.overall === 100 && g.points[0]?.dims['d'] === 0;
  })());
  A('空白维度标签被丢弃(不进 dims/dimensions)', (() => {
    const g = deriveGrowth([{ interviewId: 'x', overall: 50, dimensions: [{ dimension: '  ', score: 80 }, { dimension: 'real', score: 90 }], at: '2026-01-01T00:00:00.000Z' }]);
    return !('  ' in (g.points[0]?.dims ?? {})) && g.dimensions.join() === 'real';
  })());

  section('⑧ 响应零 PII(只 score/维度标签/时间戳)');
  const json = JSON.stringify(ga);
  // 顶层 DTO 结构键白名单(dims 的子键=维度标签是动态业务标签,在 dims 内单独放行;数组下标不计)。
  const structuralKeys = new Set(['points', 'dimensions', 'totals', 'at', 'interviewId', 'overall', 'dims', 'sessions', 'answered', 'bestScore', 'latestScore', 'trend']);
  const bad = new Set<string>();
  (function walk(o: any, parentKey: string | null) {
    if (Array.isArray(o)) { o.forEach((v) => walk(v, parentKey)); return; }
    if (o && typeof o === 'object') {
      for (const k of Object.keys(o)) {
        // dims 的子键 = 维度标签(动态),不参与结构白名单;其余必须是已知 DTO 字段。
        if (parentKey !== 'dims' && !structuralKeys.has(k)) bad.add(k);
        walk(o[k], k);
      }
    }
  })(ga, null);
  A('响应只含已知 DTO 结构字段(无 résumé/answer/content 等业务字段泄露)', bad.size === 0);
  A('响应文本不含明文邮箱/手机样式', !/@|\b1[3-9]\d{9}\b/.test(json.replace(/IV-[A-Z0-9-]+/g, '')));

  console.log(`\n${failures === 0 ? '✓ growth:prove 全部通过' : `✗ growth:prove ${failures} 条失败`}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
