import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createJob, listJobs, getJob, listJobCandidates, inviteCandidate, listTalentPool, type TalentQuery } from '@meetwise/db';
import type { CreateJobDto, InviteCandidateDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';

/**
 * 招聘方(B 端)应用服务。多租户:全经 asPrincipal,RLS 按招聘方(principal=owner)隔离——只见自己的岗位/候选人。
 * 企业纵深:邀请候选人用**同一面试引擎**(岗位 competencies 驱动出题),人才库跨自有岗位聚合。
 * who-pays:候选人用自己额度池跑面试(他们的练习);招聘方/AI 图均不直接动 entitlement(邀请只建申请壳)。
 */
@Injectable()
export class RecruiterService {
  constructor(private readonly db: DbService, private readonly rl: RateLimitService) {}

  async create(principal: string, dto: CreateJobDto, idempotencyKey?: string) {
    try {
      return await this.db.asPrincipal(principal, (c) => createJob(c, principal, { ...dto, idempotencyKey }));
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
   * email→id 解析走受限数据库函数。函数在数据库内复核当前主体是 active recruiter，
   * 并且只返回活跃 candidate 的 id。隐私:只解析 role='candidate',
   * 招聘方 email 视为未找到(不当 oracle 暴露 B 端账户);未注册→404(ATS 标准反馈,已 gated 在招聘方鉴权后)。
   */
  async invite(principal: string, jobId: string, dto: InviteCandidateDto) {
    // 反账号枚举(安全审计 F8):该端点用 email 探测"是否活跃候选人"(命中/404 可区分)→ per-principal 限流封住枚举 oracle。
    // 突发 12(足够一次批量邀请)、稳态 0.05/秒(~3/分),正常招聘够用、批量刷邮箱被摁住。
    if (!this.rl.allow(`invite:${principal}`, 12, 0.05))
      throw new HttpException({ error: 'too_many_requests', message: '邀请过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
    // candidateId 与 email 两条入参路径**对称**地都经受控解析,确认目标是活跃候选人——
    // 杜绝招聘方对任意 userId(含他人招聘方)建幽灵申请,也不暴露 B 端账户。
    const candidateIdInput = dto.candidateId?.trim() || null;
    const candidateEmailInput = dto.candidateEmail?.trim().toLowerCase() || null;
    if (!candidateIdInput && !candidateEmailInput) throw new HttpException({ error: 'candidateId_or_email_required' }, HttpStatus.BAD_REQUEST);
    const r = await this.db.asPrincipal(principal, (c) => c.query(
      'SELECT id FROM gateway_active_candidate($1,$2)',
      [candidateIdInput, candidateEmailInput],
    ));
    if (r.rowCount === 0) throw new HttpException({ error: 'candidate_not_found' }, HttpStatus.NOT_FOUND);
    const candidateId = r.rows[0].id as string;
    if (candidateId === principal) throw new HttpException({ error: 'cannot_invite_self' }, HttpStatus.BAD_REQUEST);

    const res = await this.db.asPrincipal(principal, (c) => inviteCandidate(c, principal, jobId, candidateId));
    if (!res) throw new HttpException({ error: 'job_not_found_or_forbidden' }, HttpStatus.NOT_FOUND);  // 非自有岗位
    return { applicationId: res.applicationId, status: res.status };   // 回真实状态(幂等复用时不谎报 invited)
  }

  /** 人才库:跨自有所有岗位聚合候选人(RLS 租户隔离,看不到他人租户);服务端排序/筛选。 */
  talent(principal: string, q: TalentQuery) {
    return this.db.asPrincipal(principal, async (c) => ({ talents: await listTalentPool(c, principal, q) }));
  }
}
