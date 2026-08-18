/**
 * growth:prove — 成长档案/能力曲线读侧聚合证明（isolated 完整迁移 + 非交互临时 Postgres）。
 * 证明:(1) 历次 ready 评估 → 按时间升序的成长点;(2) 维度并集 + 各场维度分;(3) 趋势由最新两场 overall 决定;
 *       (4) 边界 0/1 场不臆造方向(trend=none);(5) **RLS 隔离**——他人评估永不入本人成长档案;
 *       (6) 聚合是确定性纯函数 deriveGrowth(乱序输入仍稳定排序);(7) 响应零 PII(只 score/维度标签/时间戳);
 *       (8) answered = 可评分 ScoreCard 数(与 profile.service.growth 同源,legacy answer_evaluated 事件计数已停用)。
 * 编排 = db SQL(asPrincipal) + domain.deriveGrowth(生产同一函数,非测试复制)。
 *   pnpm growth:prove   (经 run-e2e-isolated.mjs 起临时库并应用完整迁移)
 */
import { randomUUID } from 'node:crypto';
import {
  createPool, asPrincipal, asScoringWorkerPrincipal, assertIsolatedTestTarget,
  publishQuestionRubric, issueQuestionContract, submitInterviewAnswer, createScoreRequest,
  claimScoreRequest, writeFinalScoreCard, answerBodyHmac,
  type Client,
} from '@meetwise/db';
import { deriveGrowth, toGrowthRow, scoreSpanDigest, type GrowthRow, type GrowthView } from '@meetwise/domain';

// 确定性密钥（在调用 submitInterviewAnswer/answerBodyHmac 前注入）。
process.env.INTERVIEW_ANSWER_ENC_KEY = 'proof_answer_enc_key_v1_16chars';
process.env.INTERVIEW_ANSWER_HMAC_SECRET = 'proof_answer_hmac_secret_16chars';

const admin = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const OWNER_A = `growthA-${randomUUID()}`;
const OWNER_B = `growthB-${randomUUID()}`;
const OWNER_C = `growthC-${randomUUID()}`;   // 零评估,空档案边界

const asOwner = <T>(u: string, fn: (c: Client) => Promise<T>) => asPrincipal(admin, u, fn);
const asWorker = <T>(u: string, fn: (c: Client) => Promise<T>) => asScoringWorkerPrincipal(admin, u, fn);

let hashCounter = 0;
const nextHash = () => (++hashCounter).toString(16).padStart(64, '0');
let tokenCounter = 0;
const nextToken = () => `00000000-0000-4000-8000-${(++tokenCounter).toString(16).padStart(12, '0')}`;

// 确定性评分答案 + span（UTF-8 字节）。
const ANSWER = 'my-scored-answer-body-123';
const SPAN_CLARITY = { offsetKind: 'utf8_byte' as const, start: 0, end: 9 };
const SPAN_DEPTH = { offsetKind: 'utf8_byte' as const, start: 10, end: 21 };
const RUBRIC_CRITERIA = [
  { criterionId: 'clarity', weight: 2 },
  { criterionId: 'depth', weight: 3 },
];

async function insertInterview(ownerId: string, interviewId: string): Promise<void> {
  // ON CONFLICT DO NOTHING 使该助手幂等：seedAssessment 会为每个 interview_id 补 interview 行，
  // 而 IV-A1 已在 seedScorableCard 前显式插入，避免重复主键冲突。
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb) ON CONFLICT (id) DO NOTHING",
    [interviewId, ownerId],
  );
}

// 插一行评估(经 asPrincipal,RLS WITH CHECK 强制 owner 一致;created_at 显式控序)。
async function seedAssessment(owner: string, iid: string, overall: number | null, dims: { dimension: string; score: number }[], ageSeconds: number) {
  // 全量迁移下 assessment_report 的投影隐私栅栏（enforce_interview_projection_privacy_active）
  // 要求目标 interview 已存在且 privacy-active；先补 interview 行再插评估。
  await insertInterview(owner, iid);
  await asPrincipal(admin, owner, (c) => c.query(
    `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions, overall, created_at)
       VALUES ($1,$2,$3,'ready',$4,$5, now() - ($6 || ' seconds')::interval)`,
    [randomUUID(), owner, iid, JSON.stringify(dims), overall, String(ageSeconds)]));
}

// 经完整 SCOR-02 管线写一张可评分 ScoreCard（practice_eligible,deterministic_total=80）。
// 只用于构造「answered=可评分卡数」的事实源,证明读侧 count 吃 score_card 而非 legacy 事件。
async function seedScorableCard(owner: string, interviewId: string, questionId: string, rubricId: string): Promise<void> {
  const issued = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId, questionId, stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const submitted = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId, questionId, stateVersion: 2, clientSubmissionKey: `growth-sub-${questionId}`,
    answer: ANSWER, privacyEpoch: 5,
  }));
  const req = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: `growth-req-${questionId}`,
  }));
  const token = nextToken();
  await asWorker(owner, (c) => claimScoreRequest(c, req.requestId, `growth-worker-${owner}`, token));
  const written = await asWorker(owner, (c) => writeFinalScoreCard(c, {
    requestId: req.requestId, leaseToken: token,
    evidence: [
      { criterionId: 'clarity', sourceAnswerId: submitted.artifactId, answerVersion: 1, span: SPAN_CLARITY, spanDigest: scoreSpanDigest(ANSWER, SPAN_CLARITY), disposition: 'meets' as const },
      { criterionId: 'depth', sourceAnswerId: submitted.artifactId, answerVersion: 1, span: SPAN_DEPTH, spanDigest: scoreSpanDigest(ANSWER, SPAN_DEPTH), disposition: 'exceeds' as const },
    ],
    targetStatus: 'practice_eligible',
  }));
  if (!written.recorded) throw new Error(`seed_scorable_card_failed:${questionId}`);
}

// 走与 profile.service.growth **同一** SQL(score_card eligible 计数)+ 同一 toGrowthRow 映射 + 同一 deriveGrowth。
async function loadGrowth(owner: string): Promise<GrowthView> {
  return asPrincipal(admin, owner, async (c) => {
    const rep = await c.query("SELECT interview_id, overall, dimensions, created_at FROM assessment_report WHERE owner_user_id=current_setting('app.principal_user', true) AND status='ready' ORDER BY created_at ASC, interview_id ASC");
    const ans = await c.query("SELECT count(*)::int n FROM score_card WHERE status IN ('practice_eligible','b_review_eligible')");
    return deriveGrowth(rep.rows.map(toGrowthRow), ans.rows[0].n);
  });
}

async function main() {
  await assertIsolatedTestTarget(admin);

  // OWNER_A: 3 场(故意乱序插入,靠 created_at 还原时间序)。overall 50 → 65 → 60(最新两场 65→60 = down)。
  // IV-A1 另造 2 张可评分 ScoreCard,供「answered=可评分卡数」断言(非 legacy 事件计数)。
  await insertInterview(OWNER_A, 'IV-A1');
  const rubricId = (await asOwner(OWNER_A, (c) => publishQuestionRubric(c, {
    questionId: 'growth-rubric', questionVersion: 1, rubricVersion: 1, competency: '系统设计',
    difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: nextHash(), criteria: RUBRIC_CRITERIA,
  }))).rubricId;
  await seedScorableCard(OWNER_A, 'IV-A1', 'growth-q-1', rubricId);
  await seedScorableCard(OWNER_A, 'IV-A1', 'growth-q-2', rubricId);

  await seedAssessment(OWNER_A, 'IV-A2', 65, [{ dimension: '系统设计', score: 70 }, { dimension: '算法', score: 60 }], 200);
  await seedAssessment(OWNER_A, 'IV-A3', 60, [{ dimension: '系统设计', score: 75 }, { dimension: '沟通', score: 45 }], 100);
  await seedAssessment(OWNER_A, 'IV-A1', 50, [{ dimension: '系统设计', score: 50 }, { dimension: '算法', score: 40 }], 300);

  // OWNER_B: 1 场(单场=趋势 none)+ 一行 quarantine（非 ready,必须被过滤掉）。
  await seedAssessment(OWNER_B, 'IV-B1', 80, [{ dimension: '系统设计', score: 80 }], 50);
  await insertInterview(OWNER_B, 'IV-B-pending');
  await asPrincipal(admin, OWNER_B, (c) => c.query(
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
  A('answered=2(可评分 ScoreCard 计数透传,非 legacy 事件)', ga.totals.answered === 2);

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
  await admin.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
