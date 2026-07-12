import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createJob, listJobs, getJob, listJobCandidates, inviteCandidate, listTalentPool, type TalentQuery } from '@meetwise/db';
import type { CreateJobDto, InviteCandidateDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';

/**
 * 招聘方(B 端)应用服务。多租户:全经 asPrincipal,RLS 按招聘方(principal=owner)隔离——只见自己的岗位/候选人。
 * 企业纵深:邀请候选人用**同一面试引擎**(岗位 competencies 驱动出题),人才库跨自有岗位聚合。
 * who-pays:候选人用自己额度池跑面试(他们的练习);招聘方/AI 图均不直接动 entitlement(邀请只建申请壳)。
 */
@Injectable()
export class RecruiterService {
  constructor(private readonly db: DbService) {}

  create(principal: string, dto: CreateJobDto) {
    return this.db.asPrincipal(principal, (c) => createJob(c, principal, dto));
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
   * email→id 解析走特权池(user_account 无 RLS,仅服务读 by email)。隐私:只解析 role='candidate',
   * 招聘方 email 视为未找到(不当 oracle 暴露 B 端账户);未注册→404(ATS 标准反馈,已 gated 在招聘方鉴权后)。
   */
  async invite(principal: string, jobId: string, dto: InviteCandidateDto) {
    // candidateId 与 email 两条入参路径**对称**地都经受控解析,确认目标是活跃候选人——
    // 杜绝招聘方对任意 userId(含他人招聘方)建幽灵申请,也不暴露 B 端账户。
    const key = dto.candidateId?.trim() ? { col: 'id', val: dto.candidateId.trim() } : dto.candidateEmail ? { col: 'email', val: dto.candidateEmail.trim().toLowerCase() } : null;
    if (!key) throw new HttpException({ error: 'candidateId_or_email_required' }, HttpStatus.BAD_REQUEST);
    const r = await this.db.pool.query(
      `SELECT id FROM user_account WHERE ${key.col}=$1 AND role='candidate' AND status='active'`,
      [key.val],
    );
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
