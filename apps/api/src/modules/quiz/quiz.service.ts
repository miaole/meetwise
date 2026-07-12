import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { reserveEntitlement, enqueueQuizJob, releaseConsumption } from '@meetwise/db';
import { DbService } from '../../platform/db.service';

/**
 * 押题应用服务(拥有 asPrincipal 事务边界 + 业务编排:advisory 锁、幂等、额度预留、入队、状态机、RLS)。
 * 镜像 InterviewService:controller 只解析/校验/映射 HTTP,不碰 SQL/事务/编排(架构铁律 F1)。
 * **AI 图绝不直接碰额度**——预留在此(业务服务),worker 跑完图再 confirm,失败 release(无泄漏)。
 */
@Injectable()
export class QuizService {
  constructor(private readonly db: DbService) {}

  // 新建押题(空壳,created)。begin 才扣额度跑图。
  async create(principal: string) {
    const id = 'qz_' + randomUUID();
    await this.db.asPrincipal(principal, (c) =>
      c.query("INSERT INTO resume_quiz(id, owner_user_id, status) VALUES ($1,$2,'created')", [id, principal])); // RLS WITH CHECK owner=principal
    return { quizId: id, status: 'created' };
  }

  // 开始押题:扣额度 + 入队 generate job(resume-quiz 图在 worker 跑,api 薄)。202 已受理。
  begin(principal: string, id: string, resumeId: string) {
    if (!resumeId) throw new HttpException({ error: 'missing_resume_id' }, HttpStatus.BAD_REQUEST);
    return this.db.asPrincipal(principal, async (c) => {
      // 并发竞态安全:事务级 advisory 锁串行化同押题的并发 begin——否则两并发都过 check-then-act = 双开双扣。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['quiz-begin', id]);
      if ((await c.query('SELECT 1 FROM resume_quiz WHERE id=$1', [id])).rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      // 幂等:已有 generate job(重复 begin/网络重试)→ 不再扣额度、不再入队(否则双扣 + 双跑双花模型)。
      const existing = await c.query('SELECT id FROM quiz_job WHERE owner_user_id=$1 AND quiz_id=$2', [principal, id]);
      if (existing.rowCount! > 0) return { accepted: true, jobId: existing.rows[0].id, alreadyBegun: true };
      // 额度不足时 reserveEntitlement **抛**(回滚),必须 catch 映射成 402,否则被异常过滤当 500。
      let rr;
      try { rr = await reserveEntitlement(c, principal, id, 'resume_quiz', 1.0); }
      catch (e: any) {
        if (e?.code === 'insufficient_entitlement') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
        throw e;
      }
      if (rr.status !== 'reserved') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
      const jobId = await enqueueQuizJob(c, principal, id, { resumeId });
      return { accepted: true, jobId };
    });
  }

  // 放弃押题:**退还预留额度**(不漏扣)+ status failed。对接 commerce saga release 路径。
  // **状态机守卫(专家审计:abandon×worker 竞态)**:CAS 仅从 created/generating 放弃 → 0 行=已 ready/已结束,拒绝(不倒退已完成已扣费的押题)。
  // 先 CAS 占终态再 release:与 worker 的"confirm→CAS ready 同事务"经 resume_quiz 行锁 + consumption FOR UPDATE 串行,任一交错顺序都安全(worker 先成则此处 409;此处先成则 worker confirm 命中 released→拒绝交付)。
  abandon(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c) => {
      if ((await c.query('SELECT 1 FROM resume_quiz WHERE id=$1', [id])).rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      const upd = await c.query("UPDATE resume_quiz SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status IN ('created','generating')", [id, principal]);
      if (upd.rowCount === 0) throw new HttpException({ error: 'cannot_abandon', message: '押题已完成或已结束,无法放弃' }, HttpStatus.CONFLICT);
      const rel = await releaseConsumption(c, principal, id);   // 退还 begin 时预留的额度(idempotencyKey=id;未预留则 no-op)
      return { abandoned: true, released: rel.status };
    });
  }

  // 列出自己的押题(RLS 只见己),可按 status 过滤 + limit 分页。
  async list(principal: string, status?: string, limit?: string) {
    const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const r = await this.db.asPrincipal(principal, (c) =>
      status
        ? c.query('SELECT id, status FROM resume_quiz WHERE status=$1 ORDER BY created_at DESC LIMIT $2', [status, lim])
        : c.query('SELECT id, status FROM resume_quiz ORDER BY created_at DESC LIMIT $1', [lim]));
    return { quizzes: r.rows };
  }

  // 押题详情:题目(含考察点 refs)+ 报告。generating/failed 据 status 渲染(前端按事件刷新,无死胡同)。
  async get(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT id, status, questions, report FROM resume_quiz WHERE id=$1', [id]));
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // RLS:越权→0行→404
    const row = r.rows[0];
    return { id: row.id, status: row.status, questions: row.questions ?? [], report: row.report ?? null };
  }

  // SSE 事件取数(replay):复用 interview_event(stream_key=quizId)。返回 null=越权/不存在(404),否则待写入的事件行。
  events(principal: string, id: string, lastEventId: string) {
    const lastId = Number(lastEventId ?? 0) || 0;
    return this.db.asPrincipal(principal, async (c) => {
      const own = await c.query('SELECT 1 FROM resume_quiz WHERE id=$1', [id]);
      if (own.rowCount === 0) return null;
      return (await c.query('SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq', [id, lastId])).rows;
    });
  }
}
