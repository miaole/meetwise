import { Injectable, Optional, HttpException, HttpStatus } from '@nestjs/common';
import { reserveEntitlement, enqueueDiagnosisJob, releaseConsumption, requireOwnerUserId, buildRequiredOwnerFilter, newEntityId, errCode } from '@meetwise/db';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';
import { parseLastEventId } from '../../platform/last-event-id.ts';

// #87/API-HARDEN-A:诊断 begin 成本闸(每 begin=1.0 单位预留 + generate job=整条诊断生成模型管线)。
// 形制/量级/env 覆写口与 interview/quiz begin 闸同源同依据:
// principal 桶(10,0.05)管单主体,`dgbg:global` 共享桶(60,1)管多账号脚本总量。
const RL_DIAG_BEGIN_RAW = (process.env.RL_DIAG_BEGIN ?? '10,0.05').split(',');
const DIAG_BEGIN_RL = { capacity: Number(RL_DIAG_BEGIN_RAW[0]) > 0 ? Number(RL_DIAG_BEGIN_RAW[0]) : 10, refillPerSec: Number(RL_DIAG_BEGIN_RAW[1]) > 0 ? Number(RL_DIAG_BEGIN_RAW[1]) : 0.05 };
const RL_DIAG_BEGIN_GLOBAL_RAW = (process.env.RL_DIAG_BEGIN_GLOBAL ?? '60,1').split(',');
const DIAG_BEGIN_GLOBAL_RL = { capacity: Number(RL_DIAG_BEGIN_GLOBAL_RAW[0]) > 0 ? Number(RL_DIAG_BEGIN_GLOBAL_RAW[0]) : 60, refillPerSec: Number(RL_DIAG_BEGIN_GLOBAL_RAW[1]) > 0 ? Number(RL_DIAG_BEGIN_GLOBAL_RAW[1]) : 1 };

/**
 * 简历诊断应用服务(拥有 asPrincipal 事务边界 + 业务编排:advisory 锁、幂等、额度预留、入队、状态机、RLS)。
 * 镜像 QuizService:controller 只解析/校验/映射 HTTP,不碰 SQL/事务/编排(架构铁律 F1)。
 * **AI 图绝不直接碰额度**——预留在此(业务服务),worker 跑完图再 confirm,失败 release(无泄漏)。
 * PRIV01-C:应用层 tenant 强制第二层(E1 入口显式 owner + E2 必选谓词绑定)——授权根仍为 RLS(应用层 tenant ≠ RLS)。
 */
@Injectable()
export class DiagnosisService {
  // @Optional 形沿 RateLimitService 自身 db 注入先例(直接 new 的单测证明可零 rl 构造;Nest DI 生产恒注入)。
  constructor(private readonly db: DbService, @Optional() private readonly rl?: RateLimitService) {}

  // 新建诊断(空壳,created)。begin 才扣额度跑图。
  async create(principal: string) {
    const owner = requireOwnerUserId(principal, 'diagnosis.create');   // PRIV01-C 第二层 E1(fail-closed)
    const id = newEntityId('dg');
    await this.db.asPrincipal(owner, (c) =>
      c.query("INSERT INTO resume_diagnosis(id, owner_user_id, status) VALUES ($1,$2,'created')", [id, owner])); // RLS WITH CHECK owner=principal
    return { diagnosisId: id, status: 'created' };
  }

  // 开始诊断:扣额度 + 入队 generate job(resume-diagnosis 图在 worker 跑,api 薄)。202 已受理。
  async begin(principal: string, id: string, resumeId: string, targetRole?: string) {
    if (!resumeId) throw new HttpException({ error: 'missing_resume_id' }, HttpStatus.BAD_REQUEST);
    // #87/API-HARDEN-A:成本闸在 400 形校验后、advisory 锁/事务前(400 不入桶;幂等 alreadyBegun
    // 重放也计费——重复 begin 本身就是可刷面,与 interview/quiz begin 闸同口径)。
    if (this.rl) {
      const ownerGate = requireOwnerUserId(principal, 'diagnosis.begin');
      if (!(await this.rl.allow(`dgbg:${ownerGate}`, DIAG_BEGIN_RL.capacity, DIAG_BEGIN_RL.refillPerSec))
        || !(await this.rl.allow('dgbg:global', DIAG_BEGIN_GLOBAL_RL.capacity, DIAG_BEGIN_GLOBAL_RL.refillPerSec)))
        throw new HttpException({ error: 'too_many_requests', message: '诊断过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
    }
    const role = (targetRole ?? '').trim().slice(0, 100) || undefined;     // 限长防滥用;空串归一为 undefined
    const owner = requireOwnerUserId(principal, 'diagnosis.begin');   // PRIV01-C 第二层 E1
    const jobFilter = buildRequiredOwnerFilter(owner, 'diagnosis.begin.existingJob');   // E2 必选谓词
    const resumeFilter = buildRequiredOwnerFilter(owner, 'diagnosis.begin.resume');
    const boundFilter = buildRequiredOwnerFilter(owner, 'diagnosis.begin.bind');
    return this.db.asPrincipal(owner, async (c) => {
      // 并发竞态安全:事务级 advisory 锁串行化同诊断的并发 begin——否则两并发都过 check-then-act = 双开双扣。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['diagnosis-begin', id]);
      if ((await c.query('SELECT 1 FROM resume_diagnosis WHERE id=$1', [id])).rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // E5:自身 id 意外 0 行 → 404 fail-closed
      // 幂等:已有 generate job(重复 begin/网络重试)→ 不再扣额度、不再入队(否则双扣 + 双跑双花模型)。
      const existing = await c.query('SELECT id FROM diagnosis_job WHERE owner_user_id=$1 AND diagnosis_id=$2', [jobFilter.value, id]);
      if (existing.rowCount! > 0) return { accepted: true, jobId: existing.rows[0].id, alreadyBegun: true };
      // Bind an owner-checked ingested resume and its privacy epoch in the
      // same transaction.  The queue receives only this typed tuple; the role
      // stays in the parent diagnosis row, never in a JSON payload.
      const resume = await c.query(
        "SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2 AND status='ingested'",
        [resumeId, resumeFilter.value],
      );
      if (resume.rowCount !== 1) throw new HttpException({ error: 'resume_not_found_or_not_ready' }, HttpStatus.CONFLICT);
      const privacyEpoch = Number(resume.rows[0].privacy_epoch);
      const bound = await c.query(
        `UPDATE resume_diagnosis
            SET target_role=$3, resume_id=$4, privacy_epoch=$5, version=version+1
          WHERE id=$1 AND owner_user_id=$2 AND status='created'
            AND resume_id IS NULL AND privacy_epoch IS NULL`,
        [id, boundFilter.value, role ?? null, resumeId, privacyEpoch],
      );
      if (bound.rowCount !== 1) throw new HttpException({ error: 'diagnosis_resume_reference_conflict' }, HttpStatus.CONFLICT);
      // 额度不足时 reserveEntitlement **抛**(回滚),必须 catch 映射成 402,否则被异常过滤当 500。
      let rr;
      try { rr = await reserveEntitlement(c, owner, id, 'resume_diagnosis', 1.0); }
      catch (e: unknown) {
        if (errCode(e) === 'insufficient_entitlement') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
        throw e;
      }
      if (rr.status !== 'reserved') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
      const jobId = await enqueueDiagnosisJob(c, owner, id, resumeId, privacyEpoch);
      return { accepted: true, jobId };
    });
  }

  // 放弃诊断:**退还预留额度**(不漏扣)+ status failed。对接 commerce saga release 路径。
  // **状态机守卫(abandon×worker 竞态)**:CAS 仅从 created/generating 放弃 → 0 行=已 ready/已结束,拒绝(不倒退已完成已扣费的诊断)。
  abandon(principal: string, id: string) {
    const owner = requireOwnerUserId(principal, 'diagnosis.abandon');   // PRIV01-C 第二层 E1
    const casFilter = buildRequiredOwnerFilter(owner, 'diagnosis.abandon.cas');   // E2 必选谓词
    return this.db.asPrincipal(owner, async (c) => {
      if ((await c.query('SELECT 1 FROM resume_diagnosis WHERE id=$1', [id])).rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // E5:自身 id 意外 0 行 → 404 fail-closed
      const upd = await c.query("UPDATE resume_diagnosis SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status IN ('created','generating')", [id, casFilter.value]);
      if (upd.rowCount === 0) throw new HttpException({ error: 'cannot_abandon', message: '诊断已完成或已结束,无法放弃' }, HttpStatus.CONFLICT);
      const rel = await releaseConsumption(c, owner, id);   // 退还 begin 时预留的额度(idempotencyKey=id;未预留则 no-op)
      return { abandoned: true, released: rel.status };
    });
  }

  // 列出自己的诊断(RLS 只见己),可按 status 过滤 + limit 分页。
  async list(principal: string, status?: string, limit?: string) {
    const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const r = await this.db.asPrincipal(principal, (c) =>
      status
        ? c.query('SELECT id, status FROM resume_diagnosis WHERE status=$1 ORDER BY created_at DESC LIMIT $2', [status, lim])
        : c.query('SELECT id, status FROM resume_diagnosis ORDER BY created_at DESC LIMIT $1', [lim]));
    return { diagnoses: r.rows };
  }

  // 诊断详情:诊断报告(结构/亮点/风险/匹配度+改写建议)。generating/failed 据 status 渲染(前端按事件刷新,无死胡同)。
  async get(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT id, status, target_role, report FROM resume_diagnosis WHERE id=$1', [id]));
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // RLS:越权→0行→404
    const row = r.rows[0];
    return { id: row.id, status: row.status, targetRole: row.target_role ?? null, report: row.report ?? null };
  }

  // SSE 事件取数(replay):复用 interview_event(stream_key=diagnosisId)。返回 null=越权/不存在(404),否则待写入的事件行。
  events(principal: string, id: string, lastEventId?: string) {
    const lastId = parseLastEventId(lastEventId);
    return this.db.asPrincipal(principal, async (c) => {
      const own = await c.query('SELECT 1 FROM resume_diagnosis WHERE id=$1', [id]);
      if (own.rowCount === 0) return null;
      const rows = (await c.query('SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq', [id, lastId])).rows;
      return { lastId, rows };
    });
  }
}
