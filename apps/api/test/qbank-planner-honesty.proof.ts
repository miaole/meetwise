/**
 * QBANK-PLANNER-HONESTY(#200/#201)api 侧 prove——begin 链 sourceQuizId 供给面(纯静态+in-process fake client,零 DB/零网络/零模型,est live=0)。
 *
 * 断言面(照 §2+双席补臂):
 *   §2-4 不带头逐字节:payload 基形仅 requestId+三键全条件写(静态·沿 weakness.proof S6 payload additivity 先例);
 *        不带 quiz-id → 零 resume_quiz 查询+守卫块整块跳过+抵达 bind(in-process 实跑·godfn-1c-begin-guard-merge
 *        R10 同形;该 prove 另行复跑 EXIT 原值)。
 *   §2-5 owner 范围负测:他主 quiz-id → owner-scoped SELECT 0 行 → 404 not_found_or_forbidden,先于任何
 *        绑定/扣额/入队副作用(零 side-effect 计数);stale → 409 stale_quiz(抛序与 godfn 矩阵等价,此处只钉负测锚)。
 *   web 发头链静态:QuizPanel ?quiz= → /interviews 隐藏域 → action 非空才增 quiz-id 头(裁决项⑤ query param 形)。
 * Pins(§5 照抄):haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 ·
 * ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
 * 运行:pnpm -C apps/api prove:qbank-planner-honesty(node --import @swc-node/register/esm-register)。
 */
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CMD = 'pnpm prove:qbank-planner-honesty';
const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(apiRoot, '../..');
const read = (rel: string) => {
  const p = resolve(repoRoot, rel);
  assert.equal(existsSync(p), true, `missing file: ${rel}`);
  return readFileSync(p, 'utf8');
};

let fail = 0;
const A = (name: string, cond: boolean, detail = '') => {
  if (cond) console.log(`PASS  ${name}`);
  else { fail++; console.log(`FAIL  ${name}${detail ? `: ${detail}` : ''}`); }
};

console.log('QBANK-PLANNER-HONESTY api 侧 · begin 链 sourceQuizId 供给面(不带头逐字节/owner 负测/web 发头链)');
console.log('haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · PG-retained · 公开 DELETE=503 · r1Closed=false · actualSpendCny=null\n');

/* ── S: 静态断言(payload 三键条件写+web 发头链) ──────────────────────── */
const svc = read('apps/api/src/modules/interview/interview.service.ts');
const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
const quizPanel = read('apps/web/components/QuizPanel.tsx');
const page = read('apps/web/app/interviews/page.tsx');
const actions = read('apps/web/app/interviews/actions.ts');

const bStart = svc.indexOf('export async function beginInterviewCore(');
const bEnd = svc.indexOf('export class InterviewService', bStart);
const region = bStart >= 0 && bEnd > bStart ? svc.slice(bStart, bEnd) : '';
A('S0-begin-region-parseable', region.length > 0);

A('S1-payload-base-shape(不带=现状字节:{ requestId } 唯一无条件键)',
  /const startPayload: Record<string, unknown> = \{ requestId \};/.test(region));
A('S2-payload-three-conditional-keys(targetRole/focus/sourceQuizId 同形仅在场写)',
  /if \(targetRoleNormalized\) startPayload\.targetRole = targetRoleNormalized;/.test(region)
  && /if \(focusNormalized\) startPayload\.focus = focusNormalized;/.test(region)
  && /if \(sourceQuizIdNormalized\) startPayload\.sourceQuizId = sourceQuizIdNormalized;/.test(region));
A('S3-quiz-id-normalize-trim(空→undefined → 零新键)',
  /const sourceQuizIdNormalized = \(sourceQuizId \?\? ''\)\.trim\(\) \|\| undefined;/.test(region));
A('S4-guard-consumes-raw-value(守卫块语义零改·GODFN-1c 归一形原样)',
  /if \(sourceQuizId\) \{/.test(region) && /WHERE q\.id=\$1 AND q\.owner_user_id=\$2/.test(region));
A('S5-zero-migration(零新表零新列·begin region 无 DDL 面)',
  !/ALTER TABLE|ADD COLUMN|CREATE TABLE/.test(region));
A('S6-controller-header-wiring(quiz-id 头真收真透传·既有面零触)',
  /@Headers\('quiz-id'\) quizId\?: string/.test(ctrl) && /this\.interviews\.begin\(req\.principal, id, resumeId, req\.reqId, quizId, targetRole, focus\)/.test(ctrl));

A('S7-quizpanel-entry-query-param(裁决项⑤:?quiz= 进 /interviews)',
  /href=\{quizId \? `\/interviews\?quiz=\$\{encodeURIComponent\(quizId\)\}` : '\/interviews'\}/.test(quizPanel));
A('S8-page-hidden-field(?quiz= 在场才渲染隐藏域·缺省零渲染=现状字节)',
  /\{quizId && <input type="hidden" name="quizId" value=\{quizId\} \/>\}/.test(page));
A('S9-action-header-conditional(非空才增 quiz-id 头·空串不发头=#259 同纪律)',
  /const quizId = String\(formData\.get\('quizId'\) \?\? ''\)\.trim\(\);/.test(actions)
  && /if \(quizId\) headers\['quiz-id'\] = quizId;/.test(actions));

/* ── R: in-process real begin + counting fake client(godfn-1c 先例形) ───────────────── */
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
delete process.env.MEETWISE_PUBLIC_PREVIEW;
const { InterviewService } = await import('../src/modules/interview/interview.service.ts');

const IV = 'IV_QPH_API';
const OWNER = 'userQph';
const OWNER_OTHER = 'userQphOther';
const R_A = '11111111-1111-4111-8111-111111111111';
const Q = 'quiz-qph-01';
class ReachedBind extends Error { constructor() { super('REACHED_BIND'); } }

type MergedRow = {
  status?: string | null;
  expires_at?: Date | string | null;
  pinned_resume_id?: string | null;
  pinned_epoch?: number | null;
  current_epoch?: number | null;
};
function run(resumeId: string, quizId: string | undefined, row: MergedRow | null, owner = OWNER): Promise<{ kind: 'ok' | 'err'; v?: any; e?: any; log: string[] }> {
  const log: string[] = [];
  const client = {
    async query(sql: string, _params?: unknown[]) {
      const s = String(sql).replace(/\s+/g, ' ').trim();
      log.push(s);
      if (s.startsWith('SELECT pg_advisory_xact_lock')) return { rowCount: 1, rows: [{}] };
      if (s.startsWith('SELECT status,resume_id,resume_privacy_epoch,application_id FROM interview'))
        return { rowCount: 1, rows: [{ status: 'created', resume_id: null, resume_privacy_epoch: null, application_id: null }] };
      if (s === 'SELECT 1 FROM interview WHERE id=$1') return { rowCount: 1, rows: [{}] };
      if (s.startsWith('SELECT assert_interview_privacy_active')) return { rowCount: 1, rows: [{}] };
      if (s.startsWith('SELECT q.status, q.expires_at') && s.includes('FROM resume_quiz q')) {
        if (!row) return { rowCount: 0, rows: [] };
        return { rowCount: 1, rows: [row] };
      }
      if (s.startsWith('UPDATE interview i')) throw new ReachedBind();
      throw new Error(`UNEXPECTED_SQL ${s.slice(0, 80)}`);
    },
  };
  const db = { asPrincipal: async (_p: string, fn: (c: any) => Promise<any>) => fn(client) };
  const svcInst = new (InterviewService as any)(db, {}, {}, {}, {});
  return svcInst.begin(owner, IV, resumeId, 'req-qph', quizId).then(
    (v: any) => ({ kind: 'ok' as const, v, log }),
    (e: any) => ({ kind: 'err' as const, e, log }),
  );
}
const quizQueryCount = (log: string[]) => log.filter((s) => /resume_quiz/.test(s)).length;
const sideEffect = (log: string[]) => log.some((s) => /entitlement|interview_job|^UPDATE|^INSERT/i.test(s));
const errCode = (r: any, code: string, status = 409) => r.kind === 'err' && typeof r.e?.getStatus === 'function'
  && r.e.getStatus() === status && r.e.getResponse()?.error === code;
const reachedBind = (r: any) => r.kind === 'err' && r.e instanceof ReachedBind;
const future = new Date(Date.now() + 86_400_000);
const base = { status: 'ready', expires_at: future, pinned_resume_id: R_A, pinned_epoch: 1, current_epoch: 1 };

// §2-5 owner 范围负测:他主 quiz-id → owner-scoped SELECT 0 行 → 404(先于绑定/扣额/入队·零副作用)。
// (RLS 为授权根;应用层谓词 q.owner_user_id=$2 为第二层——本 fake 以 0 行模拟「非本主工件」,与生产
//  begin 守卫 :141-142 not_found_or_forbidden 语义同源。)
const own = await run(R_A, Q, null, OWNER_OTHER);
A('R1-other-owner-quiz-id → 404 not_found_or_forbidden(owner-scoped 0 行·§2-5)', errCode(own, 'not_found_or_forbidden', 404), String(own.e?.message ?? own.kind));
A('R1-no-side-effect(零绑定/零扣额/零入队)', !sideEffect(own.log));
A('R1-exactly-one-resume-quiz-read(守卫单查形·计数)', quizQueryCount(own.log) === 1, `count=${quizQueryCount(own.log)}`);

// §2-5 stale 负测锚(全矩阵见 godfn-1c prove·此处钉负测主臂)。
const stale = await run(R_A, Q, { ...base, status: 'draft' });
A('R2-stale-quiz → 409 stale_quiz(owner-scoped 消费·NEG 首臂)', errCode(stale, 'stale_quiz'), String(stale.e?.message ?? stale.kind));
A('R2-no-side-effect', !sideEffect(stale.log));

// §2-4 不带 quiz-id:零 resume_quiz 读+守卫块整块跳过+抵达 bind(行为与现状一致·逐字节面由静态 S1-S3 承接)。
const noQuiz = await run(R_A, undefined, { ...base });
A('R3-no-quiz-id → zero resume_quiz reads, reaches bind(§2-4)', reachedBind(noQuiz) && quizQueryCount(noQuiz.log) === 0, `count=${quizQueryCount(noQuiz.log)}`);

// 带 quiz-id + 本主 valid 工件 → 守卫全过抵达 bind(payload 标量面由静态 S1-S2 承接;全矩阵见 godfn)。
const withQuiz = await run(R_A, Q, { ...base });
A('R4-valid-quiz-id → reaches bind(guard passes, chain continues)', reachedBind(withQuiz), String(withQuiz.e?.message ?? withQuiz.kind));

console.log('');
if (fail === 0) {
  console.log('PASS  QBANK-PLANNER-HONESTY api 侧:不带头逐字节(payload 条件写+守卫块跳过)+owner 负测(他主 404 零副作用)+web 发头链');
  console.log('NOTE  in-process evidence(fake DB client)+read-file 静态·零 DB/网络/模型依赖 · ≠ HTTP/PG E2E ≠ covered ≠ nail ≠ HA');
  console.log(`\nCMD=${CMD} EXIT=0`);
  process.exit(0);
}
console.log(`GAP  QBANK-PLANNER-HONESTY api 侧  ${fail} check(s) failed`);
console.log(`\nCMD=${CMD} EXIT=1`);
process.exit(1);
