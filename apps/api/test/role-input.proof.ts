/**
 * ROLE-INPUT (#259 目标岗位输入) prove —— api 侧 begin 传输面(REQUEST rev4 §3 C11·断言三段式落槽:api 段)。
 *
 * 判据(REQUEST §4④):
 *   S —— 静态:controller begin 收 `@Headers('target-role')` 并透传 service;service begin region 归一化表达式
 *        (trim/slice(0,100)/空→undefined)在位;payload 条件键在场(缺省零新键=现状字节)。
 *   R —— in-process 真 InterviewService.begin + 记录型 fake client(零 DB/零网络/零模型;沿 godfn-1c 形制):
 *        归一化三形(超 100 截断/纯空白→undefined/缺省→undefined)与 payload 键写入/不写断言 +
 *        幂等 alreadyBegun 不改写首场 role(B 端 application 绑定形 skip 供给面,生产真实形)。
 *   (worker payload→planner 段归 apps/worker/test/role-input.proof.ts;web 空串不发头归 apps/web/test/web-logic.proof.ts。)
 *
 * Pins(REQUEST §6 照抄):haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开删除面=202 软删受理(purge_pending) ·
 * g7SuiteGreen=false · r1Closed=false · actualSpendCny=null(本刀零外呼零消耗)。
 * 纯断言新增面:不改任何旧断言、零迁移、零词典/供给链触碰(candidate-profile-route/candidate-route 零字节)。
 */
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CMD = 'pnpm prove:role-input';
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

console.log('ROLE-INPUT api begin transport · target-role header → normalized payload scalar (#259)');
console.log('haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · PG-retained · DELETE=202 软删受理(purge_pending) · r1Closed=false\n');

// ── S: static inventory ─────────────────────────────────────────────
const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
const beginCtrl = ctrl.indexOf("begin(@Param('id') id: string");
const beginCtrlEnd = ctrl.indexOf('\n  }', beginCtrl);
const ctrlRegion = beginCtrl >= 0 && beginCtrlEnd > beginCtrl ? ctrl.slice(beginCtrl, beginCtrlEnd) : '';
A('S1-controller-begin-region-parseable', ctrlRegion.length > 0);
A('S2-controller-declares-target-role-header', /@Headers\('target-role'\)\s+targetRole\?:\s*string/.test(ctrlRegion));
A('S3-controller-passes-target-role-to-service', /this\.interviews\.begin\([\s\S]*targetRole\)/.test(ctrlRegion));

const svc = read('apps/api/src/modules/interview/interview.service.ts');
const bStart = svc.indexOf('begin(principal');
const bEnd = svc.indexOf('turn(principal', bStart);
const region = bStart >= 0 && bEnd > bStart ? svc.slice(bStart, bEnd) : '';
A('S4-begin-region-parseable', region.length > 0);
A('S5-service-normalizes-trim-slice-empty-undefined(诊断链同形制)',
  /const targetRoleNormalized = \(targetRole \?\? ''\)\.trim\(\)\.slice\(0, 100\) \|\| undefined;/.test(region));
A('S6-payload-conditional-key(absent → 现状字节 {requestId})',
  /enqueueInterviewJob\(c, owner, id, 'start', targetRoleNormalized \? \{ requestId, targetRole: targetRoleNormalized \} : \{ requestId \}, 0\)/.test(region));
A('S7-target-role-not-a-table-column(payload 标量传输·Ban 走私面)',
  !/ALTER TABLE|interview\s+SET\s+[^\n]*target_role|target_role\s+text/.test(region));
A('S8-idempotent-existing-branch-untouched(alreadyBegun 短路在 normalize 之后的既有查询面)',
  /alreadyBegun: true/.test(region) && region.indexOf('alreadyBegun: true') > region.indexOf('targetRoleNormalized'));

// ── R: in-process real begin + recording fake client(零 DB/网络/模型) ─────────────────
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
delete process.env.MEETWISE_PUBLIC_PREVIEW;
const { InterviewService } = await import('../src/modules/interview/interview.service.ts');

const IV = 'IV_ROLE_INPUT_BEGIN';
const OWNER = 'userRoleInput';
const RESUME_ID = '33333333-3333-4333-8333-333333333333';
const EPOCH = 1;

type Row = Record<string, unknown>;
/** 记录型 fake client:B 端 application 绑定形(resume 已绑+application_id 非空 → 生产真实 skip 供给面)。 */
function makeClient(opts: { existingStartId?: string }): { client: any; inserts: Array<{ sql: string; params: unknown[] }> } {
  const inserts: Array<{ sql: string; params: unknown[] }> = [];
  const client = {
    async query(sql: string, params?: unknown[]) {
      const s = String(sql).replace(/\s+/g, ' ').trim();
      if (s.startsWith('SELECT pg_advisory_xact_lock')) return { rowCount: 1, rows: [{}] };
      if (s.startsWith('SELECT status,resume_id,resume_privacy_epoch,application_id FROM interview'))
        return { rowCount: 1, rows: [{ status: 'created', resume_id: RESUME_ID, resume_privacy_epoch: EPOCH, application_id: 'APP_BOUND' }] };
      if (s === 'SELECT 1 FROM interview WHERE id=$1') return { rowCount: 1, rows: [{}] };
      if (s.startsWith('SELECT assert_interview_privacy_active')) return { rowCount: 1, rows: [{}] };
      if (s.startsWith('SELECT j.id') && s.includes("j.kind='start'"))
        return opts.existingStartId
          ? { rowCount: 1, rows: [{ id: opts.existingStartId }] }
          : { rowCount: 0, rows: [] as Row[] };
      if (s.startsWith("SELECT 1 FROM interview_job") && s.includes("kind='start'")) return { rowCount: 0, rows: [] as Row[] };
      // reserveEntitlement 邻域(同形 SQL 桩;记录面只关心 enqueue INSERT):
      if (s.startsWith("SELECT current_setting('app.principal_user'")) return { rowCount: 1, rows: [{ p: OWNER }] };
      if (s.startsWith('INSERT INTO entitlement_consumption')) return { rowCount: 1, rows: [{ id: 'consumption-1' }] };
      if (s.startsWith('SELECT id, (units_total - units_reserved - units_consumed) AS avail'))
        return { rowCount: 1, rows: [{ id: 'bucket-1', avail: '5' }] };
      if (s.startsWith('UPDATE entitlement_bucket')) return { rowCount: 1, rows: [{}] };
      if (s.startsWith('UPDATE entitlement_consumption')) return { rowCount: 1, rows: [{}] };
      // enqueueInterviewJob 邻域:
      if (s.startsWith('SELECT i.resume_id::text') && s.includes('FOR KEY SHARE'))
        return { rowCount: 1, rows: [{ resume_id: RESUME_ID, resume_privacy_epoch: EPOCH }] };
      if (s.startsWith('INSERT INTO interview_job')) {
        inserts.push({ sql: s, params: (params ?? []) as unknown[] });
        return { rowCount: 1, rows: [{ id: `job-${inserts.length}` }] };
      }
      throw new Error(`UNEXPECTED_SQL ${s.slice(0, 90)}`);
    },
  };
  return { client, inserts };
}
const dbOf = (client: any) => ({ asPrincipal: async (_p: string, fn: (c: any) => Promise<any>) => fn(client) });
const beginOn = (opts: { existingStartId?: string }, targetRole: string | undefined, requestId: string) => {
  const { client, inserts } = makeClient(opts);
  const svcInst = new (InterviewService as any)(dbOf(client), {}, {}, {}, {});
  return svcInst.begin(OWNER, IV, RESUME_ID, requestId, undefined, targetRole).then(
    (v: any) => ({ kind: 'ok' as const, v, inserts }),
    (e: any) => ({ kind: 'err' as const, e, inserts }),
  );
};
const payloadParamOf = (r: { inserts: Array<{ params: unknown[] }> }) => {
  const insert = r.inserts.at(-1);
  return { insert, payloadJson: typeof insert?.params?.[4] === 'string' ? (insert!.params![4] as string) : undefined };
};

// R1 超 100 截断:120 字符输入(带首尾空白)→ payload.targetRole 恰 100 字符且已脱空白。
const long = `  ${'后'.repeat(118)}  `;
const r1 = await beginOn({}, long, 'req-role-1');
const p1 = payloadParamOf(r1);
A('R1-over-100-truncated-to-100(payload.targetRole=slice(0,100))',
  r1.kind === 'ok' && p1.payloadJson === JSON.stringify({ requestId: 'req-role-1', targetRole: '后'.repeat(100) }),
  p1.payloadJson?.slice(0, 80));

// R2 纯空白 → undefined → payload 零新键(JSON.stringify({requestId}) 与现状逐字节)。
const r2 = await beginOn({}, '   \t ', 'req-role-2');
const p2 = payloadParamOf(r2);
A('R2-whitespace-blank-normalizes-undefined(absent key = 现状 payload 字节)',
  r2.kind === 'ok' && p2.payloadJson === JSON.stringify({ requestId: 'req-role-2' }), p2.payloadJson);

// R3 缺省(undefined)→ 同现状字节。
const r3 = await beginOn({}, undefined, 'req-role-3');
const p3 = payloadParamOf(r3);
A('R3-absent-header → byte-identical {requestId} payload',
  r3.kind === 'ok' && p3.payloadJson === JSON.stringify({ requestId: 'req-role-3' }), p3.payloadJson);

// R4 幂等 alreadyBegun:既有 start job 在场 → 不再 INSERT,首场 role 不被改写(沿 requestId 同幂等形制)。
const r4 = await beginOn({ existingStartId: 'job-first' }, '重试携带的岗位不应生效', 'req-role-4');
A('R4-alreadyBegun-no-rewrite(existing 分支短路·零新 INSERT·首场 role 生效)',
  r4.kind === 'ok' && r4.v?.alreadyBegun === true && r4.v?.jobId === 'job-first' && r4.inserts.length === 0,
  JSON.stringify(r4.kind === 'ok' ? r4.v : String(r4.e)));

// R5 非空在场值:trim+写入 payload(写入面正例,与 R1 截断面互补)。
const r5 = await beginOn({}, '  数据工程师  ', 'req-role-5');
const p5 = payloadParamOf(r5);
A('R5-value-trimmed-and-written(payload.targetRole=数据工程师)',
  r5.kind === 'ok' && p5.payloadJson === JSON.stringify({ requestId: 'req-role-5', targetRole: '数据工程师' }), p5.payloadJson);

console.log('');
if (fail === 0) {
  console.log('PASS  ROLE-INPUT api begin transport:target-role 头→归一化(超100截断/空白→undefined/缺省现状字节)→payload 条件键;幂等 alreadyBegun 不改写');
  console.log('NOTE  in-process evidence(fake DB client)·零 DB/网络/模型依赖 · ≠ HTTP/PG E2E ≠ covered ≠ nail ≠ HA');
  console.log(`\nCMD=${CMD} EXIT=0`);
  process.exit(0);
}
console.log(`GAP  ROLE-INPUT api  ${fail} check(s) failed; begin transport not proven`);
console.log(`\nCMD=${CMD} EXIT=1`);
process.exit(1);
