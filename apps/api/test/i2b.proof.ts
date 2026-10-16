import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { mkAssert } from './_neg-harness';
import {
  createPool, runMigrations, loadMigrations, asPrincipal, asScoringWorkerPrincipal,
  assertIsolatedTestTarget, publishQuestionRubric, issueQuestionContract, submitInterviewAnswer,
  createScoreRequest, claimScoreRequest, writeFinalScoreCard, answerBodyHmac,
  completeInterviewAndConfirm, failInterviewAndRelease, markApplicationAssessmentUnavailable,
  createJob, inviteCandidate, classifyJobRoute, startApplicationInterview, listMyApplications,
  type DbPool, type Client,
} from '@meetwise/db';
import { scoreSpanDigest } from '@meetwise/domain';
import { ConsentPurpose } from '@meetwise/contracts';
import { ApplicationsService } from '../src/modules/jobs/applications.service';
import { RecruiterService } from '../src/modules/recruiter/recruiter.service';
import { PrivacyService } from '../src/modules/privacy/privacy.service';

/**
 * i2b.proof — I2 B-DELIVERABLE prove（REQUEST §4 判据·隔离 runner·est live=0）。
 *
 * 载体：真迁移链全量应用（0001→**0160**·末位=W2 受控 DEFINER 定性投影函数）+ 真实生产码面
 * （ApplicationsService/RecruiterService/PrivacyService 以最小 DbService seam（asPrincipal→隔离池）
 * 直调·零 HTTP 面·RLS/门/触发器/事务边界全真，沿 entpay-s2/s3 同型）。
 *
 * 判据→落槽（REQUEST §4）：
 *   §4-1 W1 派生：绑定面试 completed→held / failed→failed / 进行中→null（E3 派生口径·C2 SQL）
 *              + attempt+1 恢复后再 hold 的最新绑定口径 + held start → 409 application_held_not_retryable
 *              （C3 服务端守卫/C4 映射）+ failed start → 既有恢复通路零回归（G7FIX-4 面复跑绿）。
 *   §4-2 W2 定性投影：0160 函数属主命中/非属主 0 行/出参列白名单（**无 deterministic_total/score/
 *              overall 列**·结构性断言）/档位聚合 below/meets/exceeds→弱/中/强逐值/非可评分卡与
 *              coverage<1→证据不足/**未同意→未披露双极性**（同意→披露正路径·撤回→翻回未披露·E6
 *              函数内 fail-closed）/镜像逐字节同文（0160 ↔ 23_api_gateway.sql）/endpoint neg：
 *              越权 recruiter/他人 application/非终态 0 行不可区分。
 *   §4-3 W3：purpose=b_qualitative_share 进 #82 枚举面（ConsentPurpose zod）+ consent/withdraw
 *              真实 consent_record 行（PrivacyService 同链）。
 *
 * est live=0（零模型外呼·零真实支付·隔离库零生产 DSN）。
 */

process.env.PAY_PROVIDER_SECRET ??= 'i2b-proof-pay-secret-not-production';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'i2b-proof-route-input-hmac-key-not-production-01';
// 确定性密钥（在调用 submitInterviewAnswer/answerBodyHmac 前注入·growth.proof 同形）。
process.env.INTERVIEW_ANSWER_ENC_KEY ??= 'proof_answer_enc_key_v1_16chars';
process.env.INTERVIEW_ANSWER_HMAC_SECRET ??= 'proof_answer_hmac_secret_16chars';

const REC = 'i2b-recruiter-1';
const REC2 = 'i2b-recruiter-2';
const CAND = 'i2b-candidate-1';
const RESUME = '10000000-0000-4000-8000-000000000001';

let pool: DbPool | null = null;

/** 最小 DbService seam：asPrincipal 直连隔离池（真实事务边界·RLS 上下文全真）。 */
const fakeDb = {
  asPrincipal: (owner: string, fn: (c: any) => any) => asPrincipal(pool!, owner, fn as any),
  asGateway: (fn: (c: any) => any) => Promise.resolve(fn(pool!)),
} as any;

const applications = new ApplicationsService(fakeDb);
const recruiter = new RecruiterService(fakeDb, { allow: () => true } as any);
const privacy = new PrivacyService(fakeDb);

const errOf = (e: unknown): { status?: number; error?: string; message?: string } => {
  const he = e as { getStatus?: () => number; getResponse?: () => { error?: string; message?: string } } | undefined;
  if (typeof he?.getStatus === 'function' && typeof he?.getResponse === 'function') {
    const res = he.getResponse();
    return { status: he.getStatus(), error: res?.error, message: res?.message };
  }
  return {};
};

const asOwner = <T>(u: string, fn: (c: Client) => Promise<T>) => asPrincipal<T>(pool!, u, fn);
const asWorker = <T>(u: string, fn: (c: Client) => Promise<T>) => asScoringWorkerPrincipal<T>(pool!, u, fn);

const jobIdOf = async (appId: string) => (await pool!.query('SELECT job_id FROM job_application WHERE id=$1', [appId])).rows[0].job_id as string;

let hashCounter = 0;
const nextHash = () => (++hashCounter).toString(16).padStart(64, '0');
let tokenCounter = 0;
const nextToken = () => `00000000-0000-4000-8000-${(++tokenCounter).toString(16).padStart(12, '0')}`;

const ANSWER = 'my-scored-answer-body-123';
const SPAN_A = { offsetKind: 'utf8_byte' as const, start: 0, end: 9 };
const SPAN_B = { offsetKind: 'utf8_byte' as const, start: 10, end: 21 };
const RUBRIC_A_CRITERIA = [{ criterionId: 'clarity', weight: 2 }, { criterionId: 'depth', weight: 3 }];
const RUBRIC_B_CRITERIA = [{ criterionId: 'accuracy', weight: 2 }];

/** B 端播种四件套（entpay-s2 同形·0155 审核制招聘方语境·rule-classified 零模型）：open 岗位→邀请→applicationId。 */
async function seedApplication(rec: string): Promise<string> {
  const jobRow = await asOwner(rec, (c) => createJob(c, rec, {
    title: 'Node.js 服务端工程师',
    description: '使用 NestJS 构建服务',
    competencies: ['nestjs', 'express', 'koa'],
  }));
  const rev = Number((await pool!.query('SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobRow.id])).rows[0].n);
  await classifyJobRoute(pool!, rec, jobRow.id, rev, {
    modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
  });
  const invited = await asOwner(rec, (c) => inviteCandidate(c, rec, jobRow.id, CAND));
  if (!invited?.applicationId) throw new Error('i2b_seed_application_failed');
  return invited.applicationId;
}

/** 经完整 SCOR-02 管线写一张可评分 ScoreCard（growth.proof 同形·B 端事实根=b_review_eligible）。 */
async function seedScorableCard(owner: string, interviewId: string, questionId: string, rubricId: string, criteria: Array<{ criterionId: string }>, dispositions: Array<'below' | 'meets' | 'exceeds'>): Promise<void> {
  const { requestId, artifactId } = await seedPipelineToRequest(owner, interviewId, questionId, rubricId);
  const token = nextToken();
  await asWorker(owner, (c) => claimScoreRequest(c, requestId, `i2b-worker-${owner}`, token));
  const spans = [SPAN_A, SPAN_B];
  const evidence = dispositions.map((d, i) => ({
    criterionId: criteria[i]!.criterionId,
    sourceAnswerId: artifactId, answerVersion: 1,
    span: spans[i] ?? SPAN_A,
    spanDigest: scoreSpanDigest(ANSWER, spans[i] ?? SPAN_A),
    disposition: d,
  }));
  const written = await asWorker(owner, (c) => writeFinalScoreCard(c, {
    requestId, leaseToken: token, evidence, targetStatus: 'b_review_eligible',
  }));
  if (!written.recorded) throw new Error(`i2b_seed_card_failed:${questionId}`);
}

/** 走管线到 score_request 为止（不 claim/不写卡）→ FK 链（供 pending_evidence 直插）。 */
async function seedPipelineToRequest(owner: string, interviewId: string, questionId: string, rubricId: string): Promise<{ requestId: string; artifactId: string; submissionId: string; contractId: string }> {
  const issued = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId, questionId, stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const submitted = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId, questionId, stateVersion: 2, clientSubmissionKey: `i2b-sub-${questionId}`,
    answer: ANSWER, privacyEpoch: 5,
  }));
  const req = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: `i2b-req-${questionId}`,
  }));
  return { requestId: req.requestId, artifactId: submitted.artifactId, submissionId: submitted.submissionId, contractId: issued.contractId };
}

async function main() {
  const { A, done } = mkAssert('i2b:prove');
  pool = createPool({ purpose: 'i2b_proof' });
  await assertIsolatedTestTarget(pool);
  await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  const manifest = loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url)));
  const applied = await runMigrations(pool, manifest);
  const rerun = await runMigrations(pool, manifest);

  // ══ I2B-0 部署车（§4-8 形）══
  A('I2B-0a 真迁移链全量应用 0001→0160（末位=0160 W2 受控 DEFINER 定性投影函数）',
    applied.applied[applied.applied.length - 1] === '0160_b_qualitative_projection');
  A('I2B-0b 重跑全 skipped（幂等·CREATE OR REPLACE+自包含 REVOKE/GRANT）',
    rerun.applied.length === 0 && rerun.skipped.length === manifest.length);
  A('I2B-0c 0160 函数在位（SECURITY DEFINER·prosecdef）',
    ((await pool.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname='gateway_b_qualitative_projection' AND prosecdef`)).rows[0]?.n ?? 0) === 1);
  // §4-2 结构性出参白名单断言（非仅值断言）：RETURNS TABLE 出参列集恰 6 列·无 deterministic_total/score/overall/coverage。
  const fnParams = (await pool.query(`
    SELECT p.parameter_name FROM information_schema.parameters p
     JOIN information_schema.routines r ON r.specific_schema=p.specific_schema AND r.specific_name=p.specific_name
     WHERE r.routine_schema='public' AND r.routine_name='gateway_b_qualitative_projection' AND p.parameter_mode='OUT'
     ORDER BY p.ordinal_position`)).rows.map((r: { parameter_name: string }) => r.parameter_name);
  const banCols = fnParams.filter((n) => ['deterministic_total', 'score', 'overall', 'coverage'].includes(n));
  A('I2B-0d 出参列白名单结构性断言（RETURNS TABLE 恰 7 列·Ban deterministic_total/score/overall/coverage 数字分列）',
    JSON.stringify(fnParams) === JSON.stringify(['disclosed', 'terminal_kind', 'competency', 'strong_count', 'mid_count', 'weak_count', 'insufficient_count'])
      && banCols.length === 0);
  const migSrc = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0160_b_qualitative_projection.sql', import.meta.url)), 'utf8');
  const mirrorSrc = readFileSync(fileURLToPath(new URL('../../../packages/db/sql/23_api_gateway.sql', import.meta.url)), 'utf8');
  const blockOf = (src: string) => {
    const m = src.match(/^CREATE OR REPLACE FUNCTION gateway_b_qualitative_projection[\s\S]*?^GRANT EXECUTE ON FUNCTION gateway_b_qualitative_projection\(text, text\) TO app_role;$/m);
    if (!m) throw new Error('i2b_block_not_found');
    return m[0];
  };
  A('I2B-0e 0160 函数体+ACL 与 23_api_gateway.sql 镜像逐字节同文（0159 RX-3 同款承重墙判据）',
    blockOf(migSrc) === blockOf(mirrorSrc));

  // ══ 播种（entpay-s2 同形：user_account/resume/企业桶）══
  await pool.query(`INSERT INTO user_account(id,email,password_hash,role,approval_status)
    VALUES ($1,$2,'x','recruiter','approved'),($3,$4,'x','recruiter','approved'),($5,$6,'x','candidate','approved')
    ON CONFLICT DO NOTHING`, [REC, 'i2b-rec@x.com', REC2, 'i2b-rec2@x.com', CAND, 'i2b-cand@x.com']);
  await pool.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
    VALUES ($1,'enterprise',9.00, now()+interval '365 days')`, [REC]);
  await pool.query(`INSERT INTO resume(id, owner_user_id, status, content_sha)
    VALUES ($2,$1,'ingested','i2b:resume:1') ON CONFLICT DO NOTHING`, [CAND, RESUME]);

  // ══ §4-1 W1 派生三形状 + attempt+1 恢复后再 hold（最新绑定口径）══
  const appHeld = await seedApplication(REC);
  const startHeld = await applications.start(CAND, appHeld, { resumeId: RESUME } as any);
  const ivHeld = (startHeld as { interviewId: string }).interviewId;

  // 播种评分事实（B 端事实根 b_review_eligible·两维度：系统设计=强+中 / 算法=弱）。
  const rubricA = (await asOwner(CAND, (c) => publishQuestionRubric(c, {
    questionId: 'i2b-q-sys', questionVersion: 1, rubricVersion: 1, competency: '系统设计',
    difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: nextHash(), criteria: RUBRIC_A_CRITERIA,
  }))).rubricId;
  const rubricB = (await asOwner(CAND, (c) => publishQuestionRubric(c, {
    questionId: 'i2b-q-algo', questionVersion: 1, rubricVersion: 1, competency: '算法',
    difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: nextHash(), criteria: RUBRIC_B_CRITERIA,
  }))).rubricId;
  await seedScorableCard(CAND, ivHeld, 'i2b-q-sys', rubricA, RUBRIC_A_CRITERIA, ['exceeds', 'meets']);
  await seedScorableCard(CAND, ivHeld, 'i2b-q-algo', rubricB, RUBRIC_B_CRITERIA, ['below']);

  // hold：0082 finalize 自动收口（interview completed → assessment_unavailable·绑定面试 completed）。
  const completed = await asOwner(CAND, (c) => completeInterviewAndConfirm(c, CAND, ivHeld));
  A('W1-0a hold 链：completeInterviewAndConfirm → 0082 finalize 自动收口（interview completed）',
    completed.status === 'completed');

  // 候选人侧派生读数=生产函数直调（listMyApplications·非测试复制 SQL·entpay-s3「探针逐字镜像」更严形）。
  const myRows = async () => {
    const rows = await asOwner(CAND, (c) => listMyApplications(c, CAND));
    return rows.map((r) => ({ id: r.id, status: r.status, terminalKind: r.terminalKind }));
  };

  // 失败链（adaptive-lifecycle :463-464 同参调用形）：failInterviewAndRelease + markApplicationAssessmentUnavailable。
  const appFailed = await seedApplication(REC);
  const startFailed = await applications.start(CAND, appFailed, { resumeId: RESUME } as any);
  const ivFailed = (startFailed as { interviewId: string }).interviewId;
  await asOwner(CAND, (c) => failInterviewAndRelease(c, CAND, ivFailed));
  const markFailed = await asOwner(CAND, (c) => markApplicationAssessmentUnavailable(c, CAND, ivFailed));

  // 进行中形状：第三申请保持 in_progress。
  const appProgress = await seedApplication(REC);
  await applications.start(CAND, appProgress, { resumeId: RESUME } as any);

  const rows1 = await myRows();
  const kindOf = (id: string) => {
    const row = rows1.find((r: any) => r.id === id);
    return row ? (row.terminalKind as string | null) : '<missing>';
  };
  A('W1-1a held 派生（E3 口径：a.status=assessment_unavailable × i.status=completed → held·0082 finalize 自动收口）',
    kindOf(appHeld) === 'held');
  A('W1-1b failed 派生（i.status=failed → failed·markApplicationAssessmentUnavailable updated）',
    markFailed === 'updated' && kindOf(appFailed) === 'failed');
  A('W1-1c 进行中 → null（派生口径收窄·非终态不派生）', kindOf(appProgress) === null);
  A('W1-1d 口径收窄：非 assessment_unavailable 状态恒不派生（非两源外形状零产出）',
    rows1.every((r: any) => r.status === 'assessment_unavailable' || r.terminalKind === null));

  // 招聘方侧镜像=隔离墙如实断言：interview 为候选人私有（RLS p_owner·0005 by-design），招聘方
  // 会话内 join 派生不可达（attempt3 实证全 null）→ 列表行零改保持兜底文案；两态经详情页 0160
  // 受控函数 terminal_kind 承接（W2 区断言）。此处断言墙本身：三申请对招聘方可见且不带两态信号。
  const candWall: boolean[] = [];
  for (const appId of [appHeld, appFailed, appProgress]) {
    const v = await recruiter.candidates(REC, await jobIdOf(appId));
    const row = v.candidates.find((c: any) => c.id === appId);
    candWall.push(!!row && (row as any).terminalKind === undefined);
  }
  A('W1-1e 招聘方列表行隔离墙如实（三申请可见∧两态信号零携带·interview RLS by-design·列表兜底零改·两态走详情页 0160）',
    candWall.length === 3 && candWall.every(Boolean));

  // held start → 服务端守卫 409（C3 DB 守卫 + C4 API 映射双层）。
  const dbGuard = await asOwner(CAND, (c) => startApplicationInterview(c, CAND, appHeld, RESUME));
  A('W1-2a DB 守卫（C3）：held start → application_held_not_retryable（绑定面试 completed 拒重试）',
    (dbGuard as { status: string }).status === 'application_held_not_retryable');
  let heldErr: { status?: number; error?: string; message?: string } = {};
  try { await applications.start(CAND, appHeld, { resumeId: RESUME } as any); } catch (e) { heldErr = errOf(e); }
  A('W1-2b API 映射（C4）：held start → 409 application_held_not_retryable（新拒因并列·既有 402 分码面零触）',
    heldErr.status === 409 && heldErr.error === 'application_held_not_retryable'
      && heldErr.message === '本场面试已完成，评分待校准；无需重新开始');

  // failed start → 既有恢复通路零回归（G7FIX-4 面复跑绿）：新 attempt started。
  const retryFailed = await applications.start(CAND, appFailed, { resumeId: RESUME } as any);
  const ivFailed2 = (retryFailed as { interviewId: string }).interviewId;
  A('W1-2c failed start → 既有恢复通路 started（新 attempt·G7FIX-4 面零回归）',
    retryFailed.status === 'started' && ivFailed2 !== ivFailed);
  const rows2 = await myRows();
  A('W1-1f attempt+1 恢复中 → null（恢复中不派生·最新绑定口径前半）',
    rows2.find((r: any) => r.id === appFailed)?.terminalKind === null);
  // 恢复后再 hold：新 attempt 完成回 hold（最新绑定口径后半·终态区分跟最新绑定走）。
  await asOwner(CAND, (c) => completeInterviewAndConfirm(c, CAND, ivFailed2));
  const rows3 = await myRows();
  A('W1-1g attempt+1 恢复后再 hold → held（最新绑定面试 completed·终态区分跟最新绑定走）',
    rows3.find((r: any) => r.id === appFailed)?.terminalKind === 'held');

  // ══ §4-2 W2 定性投影（0160·E6 双极性）══
  const qualFn = async (rec: string, appId: string) => (await pool!.query(
    'SELECT disclosed, terminal_kind, competency, strong_count, mid_count, weak_count, insufficient_count FROM gateway_b_qualitative_projection($1,$2)',
    [rec, appId])).rows;

  // 未同意 → 未披露形状（恰一行 false·非空壳假数据）。
  const noConsentRows = await qualFn(REC, appHeld);
  A('W2-1 函数级未同意 → 未披露形状（恰一行 disclosed=false·E6 函数内 fail-closed）',
    noConsentRows.length === 1 && noConsentRows[0].disclosed === false && noConsentRows[0].competency === null
      && noConsentRows[0].strong_count === null && noConsentRows[0].insufficient_count === null);
  A('W2-1b 未同意态下两态状态信号仍可用（terminal_kind=held·状态分流不进同意门·W3④ 承接）',
    noConsentRows[0].terminal_kind === 'held');
  const noConsentView = await recruiter.qualitative(REC, await jobIdOf(appHeld), appHeld);
  A('W2-2 endpoint 未同意 → {disclosed:false}（双极性负极·未披露态非空壳假数据）',
    noConsentView.disclosed === false && noConsentView.dimensions.length === 0);

  // 同意 → 投影白名单（披露正路径）。
  await privacy.consent(CAND, 'b_qualitative_share');
  const consentedRows = await qualFn(REC, appHeld);
  const dimOf = (comp: string) => consentedRows.find((r: any) => r.competency === comp);
  const sysDim = dimOf('系统设计');
  const algoDim = dimOf('算法');
  A('W2-3 函数级同意 → 首行 disclosed 标记行（true·competency NULL·terminal_kind=held）',
    consentedRows.length >= 1 && consentedRows[0].disclosed === true && consentedRows[0].competency === null
      && consentedRows[0].terminal_kind === 'held');
  A('W2-4a 档位聚合逐值（系统设计：exceeds→强 1·meets→中 1·below→弱 0·insufficient 0）',
    !!sysDim && Number(sysDim.strong_count) === 1 && Number(sysDim.mid_count) === 1 && Number(sysDim.weak_count) === 0
      && Number(sysDim.insufficient_count) === 0);
  A('W2-4b 档位聚合逐值（算法：below→弱 1·其余 0）',
    !!algoDim && Number(algoDim.weak_count) === 1 && Number(algoDim.strong_count) === 0
      && Number(algoDim.mid_count) === 0 && Number(algoDim.insufficient_count) === 0);
  const consentedView = await recruiter.qualitative(REC, await jobIdOf(appHeld), appHeld);
  const dimsByComp = new Map<string, string>(consentedView.dimensions.map((d: any) => [d.competency, d.tiers.join(',')]));
  A('W2-5 endpoint 同意 → {disclosed:true,terminalKind}+档位映射（strong/mid/weak·计数不出 API 面·Ban 自造档位）',
    consentedView.disclosed === true && (consentedView as any).terminalKind === 'held' && consentedView.dimensions.length === 2
      && dimsByComp.get('系统设计') === 'strong,mid' && dimsByComp.get('算法') === 'weak');

  // 非可评分卡（pending_evidence 直插·无分项）→ 该维度证据不足。
  const pend = await seedPipelineToRequest(CAND, ivHeld, 'i2b-q-pend', rubricA);
  await pool.query(`
    INSERT INTO score_card(owner_user_id,interview_id,question_id,answer_id,submission_id,score_request_id,
      issued_contract_id,rubric_id,rubric_version,measurement_version,deterministic_total,coverage,status)
    VALUES ($1,$2,'i2b-q-pend',$3,$4,$5,$6,$7,1,'measure-v1',0,1,'pending_evidence')`,
  [CAND, ivHeld, pend.artifactId, pend.submissionId, pend.requestId, pend.contractId, rubricA]);
  const pendRows = await qualFn(REC, appHeld);
  const sysPend = pendRows.find((r: any) => r.competency === '系统设计');
  A('W2-6 非可评分卡（pending_evidence·无分项·0158 守门内初始态）→ 系统设计 insufficient ≥1',
    !!sysPend && Number(sysPend.insufficient_count) >= 1);
  const pendView = await recruiter.qualitative(REC, await jobIdOf(appHeld), appHeld);
  const pendTiers = new Map<string, string>(pendView.dimensions.map((d: any) => [d.competency, d.tiers.join(',')]));
  A('W2-6b endpoint 系统设计 tiers 增 insufficient（strong/mid 保留·证据不足并列不互斥）',
    pendTiers.get('系统设计') === 'strong,mid,insufficient');

  // coverage<1 防御分支（0103 铁律2 生产恒 1.0·此处以 0158 守门内初始态 b_review_eligible 直插夹具
  // 验证分支——score_card content-immutable 触发器禁原地改写（attempt2 实证 23514），故夹具取直插新卡）。
  const cov = await seedPipelineToRequest(CAND, ivHeld, 'i2b-q-cov', rubricB);
  await pool.query(`
    INSERT INTO score_card(owner_user_id,interview_id,question_id,answer_id,submission_id,score_request_id,
      issued_contract_id,rubric_id,rubric_version,measurement_version,deterministic_total,coverage,status)
    VALUES ($1,$2,'i2b-q-cov',$3,$4,$5,$6,$7,1,'measure-v1',0,0.5,'b_review_eligible')`,
  [CAND, ivHeld, cov.artifactId, cov.submissionId, cov.requestId, cov.contractId, rubricB]);
  const covRows = await qualFn(REC, appHeld);
  const algoCov = covRows.find((r: any) => r.competency === '算法');
  A('W2-7 coverage<1 → 算法增证据不足（既有弱计数保留·两分支并列不互斥·出参白名单不变）',
    !!algoCov && Number(algoCov.insufficient_count) >= 1 && Number(algoCov.weak_count) === 1);

  // 撤回 → 翻回未披露（E6 双极性闭环：撤回即停·0160 函数内门承重·Ban 旁路实证）。
  await privacy.withdrawConsent(CAND, 'b_qualitative_share');
  const withdrawnRows = await qualFn(REC, appHeld);
  const withdrawnView = await recruiter.qualitative(REC, await jobIdOf(appHeld), appHeld);
  A('W2-8 撤回 → 双极性闭环（函数恰一行 false + endpoint {disclosed:false}）',
    withdrawnRows.length === 1 && withdrawnRows[0].disclosed === false
      && withdrawnView.disclosed === false && withdrawnView.dimensions.length === 0);

  // 属主谓词 fail-closed：非属主 recruiter/非终态申请 → 0 行（与不存在不可区分）。
  A('W2-9a 函数级非属主 recruiter → 0 行（错配反例·Ban 无作用域全表读）',
    (await qualFn(REC2, appHeld)).length === 0);
  A('W2-9b 函数级非终态申请（in_progress）→ 0 行（投影范围=assessment_unavailable 终态）',
    (await qualFn(REC, appProgress)).length === 0);
  // endpoint neg：越权 recruiter/他人 application → 恒定 404 壳（零存在性信号）。
  let negJob: { status?: number; error?: string } = {};
  try { await recruiter.qualitative(REC2, await jobIdOf(appHeld), appHeld); } catch (e) { negJob = errOf(e); }
  A('W2-10a endpoint 越权 recruiter（非自有岗位）→ 404 not_found_or_forbidden（getJob 同形恒定壳）',
    negJob.status === 404 && negJob.error === 'not_found_or_forbidden');
  let negApp: { status?: number; error?: string } = {};
  try { await recruiter.qualitative(REC, await jobIdOf(appHeld), 'app-not-mine-xxxxxxxx'); } catch (e) { negApp = errOf(e); }
  A('W2-10b endpoint 他人 application id → 404 not_found_or_forbidden（申请归属预检零存在性信号）',
    negApp.status === 404 && negApp.error === 'not_found_or_forbidden');

  // ══ §4-3 W3 purpose 枚举 + consent 同链 ══
  A('W3-1 purpose=b_qualitative_share 进 #82 枚举面（ConsentPurpose zod·CONSENT_PURPOSES 白名单）',
    ConsentPurpose.safeParse('b_qualitative_share').success === true
      && ConsentPurpose.safeParse('b_qualitative_share_unknown').success === false);
  await privacy.consent(CAND, 'b_qualitative_share');
  const status1 = await privacy.consentStatus(CAND, 'b_qualitative_share');
  const again = await privacy.consent(CAND, 'b_qualitative_share');   // 幂等重同意
  await privacy.withdrawConsent(CAND, 'b_qualitative_share');
  const status2 = await privacy.consentStatus(CAND, 'b_qualitative_share');
  A('W3-2 consent/withdraw 真实 consent_record 行（PrivacyService 同链·幂等·撤回翻态）',
    status1.consented === true && again.recorded === true && status2.consented === false);

  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });
