import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  createJob, listJobs, getJob, listJobCandidates, inviteCandidate, listTalentPool,
  notifyWorkerJobWakeup, type TalentQuery,
} from '@meetwise/db';
import type { CreateJobDto, InviteCandidateDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';

/**
 * 招聘方(B 端)应用服务。多租户:全经 asPrincipal,RLS 按招聘方(principal=owner)隔离——只见自己的岗位/候选人。
 * 企业纵深:邀请候选人用**同一面试引擎**(岗位 competencies 驱动出题),人才库跨自有岗位聚合。
 * who-pays:候选人用自己额度池跑面试(他们的练习);招聘方/AI 图均不直接动 entitlement(邀请只建申请壳)。
 *
 * R2 P-API: createJob 后 notifyWorkerJobWakeup → sole Worker route-classify drain。
 * API **不**调用 classifyJobRoute（Worker 唯一调用方）。closing P-API ≠ R2 关 / ≠ 路由已生效。
 */
@Injectable()
export class RecruiterService {
  constructor(private readonly db: DbService, private readonly rl: RateLimitService) {}

  async create(principal: string, dto: CreateJobDto, idempotencyKey?: string) {
    try {
      return await this.db.asPrincipal(principal, async (c) => {
        const job = await createJob(c, principal, { ...dto, idempotencyKey });
        // Combination root (I3): wake shared worker channel after createJob → route_pending.
        // Migration 0133 also NOTIFYs on revision insert; double wake is lossy-safe.
        // Prefer wakeup — do NOT invent an inline classify path that bypasses Worker.
        await notifyWorkerJobWakeup(c);
        return job;
      });
    } catch (error) {
      if ((error as { code?: string })?.code === 'job_idempotency_key_conflict')
        throw new HttpException({ error: 'idempotency_key_conflict' }, HttpStatus.CONFLICT);
      throw error;
    }
  }

  list(principal: string) {
    return this.db.asPrincipal(principal, async (c) => ({ jobs: await listJobs(c, principal) }));
  }

  async get(principal: string, id: string) {
    const job = await this.db.asPrincipal(principal, (c) => getJob(c, principal, id));
    if (!job) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);   // RLS:别人的→404
    return job;
  }

  /** 招聘方查申请到自己某岗位的候选人(多方 RLS:招聘方为一方→可见缓存状态/分数,不见候选人私有面试)。 */
  candidates(principal: string, jobId: string) {
    return this.db.asPrincipal(principal, async (c) => ({ candidates: await listJobCandidates(c, principal, jobId) }));
  }

  /**
   * 招聘方邀请候选人为某岗位面试(InviteCandidateDto:candidateId 或 email 二选一)。
   * b110 反枚举双闸:
   * ① R2 岗位归属预检**前置**到候选人解析之前——非自有/不存在岗位恒 404 `job_not_found_or_forbidden`
   *    (字节稳定)。现序曾先候选人后岗位;恒定壳后若不前置,「越权岗位×幽灵→壳 200 vs 越权岗位×真候选人→404」
   *    枚举面复活(jobs.controller 仅 PrincipalGuard 暴露岗位 id,一人双账户攻击面真实)。
   * ② 响应收敛恒定壳:命中=真实建申请、未命中/招聘方 email=同形同码零信号;applicationId/status 不再出响应,
   *    真实状态以租户内 candidates 列表承载(幂等复用语义不变)。
   * DB 纵深:gateway_active_candidate 函数内复核 active recruiter + 审批(approved)维度(0152)。
   */
  async invite(principal: string, jobId: string, dto: InviteCandidateDto, ip?: string) {
    // 反账号枚举(安全审计 F8 + b110 §1.2.6):桶序钉死 per-principal→ip(|| 短路;429 断言确定性)。
    // per-principal 桶零改(回归锚):突发 12、稳态 0.05/秒;invite:ip 桶同档,封「批量注册 recruiter 绕过主体桶」。
    if (!this.rl.allow(`invite:${principal}`, 12, 0.05))
      throw new HttpException({ error: 'too_many_requests', message: '邀请过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
    if (!this.rl.allow(`invite:ip:${ip ?? 'unknown'}`, 12, 0.05))
      throw new HttpException({ error: 'too_many_requests', message: '邀请过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
    // candidateId 与 email 两条入参路径**对称**地都经受控解析,确认目标是活跃候选人——
    // 杜绝招聘方对任意 userId(含他人招聘方)建幽灵申请,也不暴露 B 端账户。
    const candidateIdInput = dto.candidateId?.trim() || null;
    const candidateEmailInput = dto.candidateEmail?.trim().toLowerCase() || null;
    if (!candidateIdInput && !candidateEmailInput) throw new HttpException({ error: 'candidateId_or_email_required' }, HttpStatus.BAD_REQUEST);
    // R2 归属预检前置:getJob 同款(:44),非自有/不存在 → 恒 404(在候选人解析之前,零存在性信号)。
    const job = await this.db.asPrincipal(principal, (c) => getJob(c, principal, jobId));
    if (!job) throw new HttpException({ error: 'job_not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    const r = await this.db.asPrincipal(principal, (c) => c.query(
      'SELECT id FROM gateway_active_candidate($1,$2)',
      [candidateIdInput, candidateEmailInput],
    ));
    const candidateId = (r.rows[0]?.id as string | undefined) ?? null;
    if (candidateId === principal) throw new HttpException({ error: 'cannot_invite_self' }, HttpStatus.BAD_REQUEST);
    if (candidateId) {
      // 命中才真实建申请(幂等复用既有行);**响应不回 applicationId/status**(恒定壳)。
      await this.db.asPrincipal(principal, (c) => inviteCandidate(c, principal, jobId, candidateId));
    }
    // 恒定壳:命中/未命中/招聘方 email 同形同码零信号——真实受理状态以租户内 candidates 列表为准。
    return { received: true } as const;
  }

  /** 人才库:跨自有所有岗位聚合候选人(RLS 租户隔离,看不到他人租户);服务端排序/筛选。 */
  talent(principal: string, q: TalentQuery) {
    return this.db.asPrincipal(principal, async (c) => ({ talents: await listTalentPool(c, principal, q) }));
  }
}
