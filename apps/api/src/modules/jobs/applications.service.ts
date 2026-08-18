import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { listMyApplications, finalizeApplication, startApplicationInterview, declineInvitation } from '@meetwise/db';
import type { StartApplicationDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';

/**
 * 候选人(C 端)申请应用服务。RLS:候选人只见/只改自己的申请(p_party_read + p_candidate_update)。
 * finalize 只确认已绑定会话的终态。评分校准发布前，它不会向 B 端回填或
 * 公开数值分，而是返回 scoreless 的人工复核状态；越权/不存在→404。
 */
@Injectable()
export class ApplicationsService {
  constructor(private readonly db: DbService) {}

  mine(principal: string) {
    return this.db.asPrincipal(principal, async (c) => ({ applications: await listMyApplications(c, principal) }));
  }

  /**
   * application 是岗位评估的唯一根：同一事务内行锁 application、验证 candidate 的已摄取 resume、
   * 创建/复用唯一 interview，再将四元绑定写回。返回 ID 只来自持久化绑定，不能由浏览器指定。
   */
  async start(principal: string, appId: string, dto: StartApplicationDto) {
    const r = await this.db.asPrincipal(principal, (c) => startApplicationInterview(c, principal, appId, dto.resumeId));
    if (r.status === 'resume_not_ready')
      throw new HttpException({ error: 'resume_not_ready', message: '请选择一份已完成解析的本人简历' }, HttpStatus.CONFLICT);
    if (r.status === 'binding_invalid')
      throw new HttpException({ error: 'application_binding_invalid', message: '该申请的面试绑定异常，已停止继续处理' }, HttpStatus.CONFLICT);
    if (r.status === 'noop') return { applicationId: appId, status: 'noop' as const };
    // 其余联合分支只可能是 started/reused，先显式收窄再读取持久化会话标识。
    if (r.status !== 'started' && r.status !== 'reused') {
      throw new HttpException({ error: 'application_start_unexpected', message: '申请面试状态异常，已停止继续处理' }, HttpStatus.CONFLICT);
    }
    return {
      applicationId: appId,
      status: r.status,
      interviewId: r.interviewId,
      redirectTo: `/interview/${encodeURIComponent(r.interviewId)}?applicationId=${encodeURIComponent(appId)}`,
    };
  }

  /** 候选人婉拒邀请:状态机 CAS invited → declined(终态)。非 invited(已开始/已完成)→ noop,不死胡同。 */
  async decline(principal: string, appId: string) {
    const ok = await this.db.asPrincipal(principal, (c) => declineInvitation(c, principal, appId));
    return { applicationId: appId, status: ok ? 'declined' : 'noop' };
  }

  async finalize(principal: string, appId: string) {
    // 不接受客户端 interviewId。DB 会验证 application↔interview↔job↔resume↔owner；
    // calibration hold 下任何完成都只能收口为 assessment_unavailable。
    const r = await this.db.asPrincipal(principal, (c) => finalizeApplication(c, principal, appId));
    if (r === 'not_ready') throw new HttpException({ error: 'cannot_finalize', message: '岗位绑定面试尚未完成或绑定不一致' }, HttpStatus.CONFLICT);
    const bound = await this.db.asPrincipal(principal, async (c) =>
      c.query('SELECT interview_id FROM job_application WHERE id=$1 AND candidate_user_id=$2', [appId, principal]));
    if (bound.rowCount !== 1 || !bound.rows[0].interview_id)
      throw new HttpException({ error: 'cannot_finalize', message: '岗位绑定面试不存在' }, HttpStatus.CONFLICT);
    return {
      applicationId: appId,
      interviewId: bound.rows[0].interview_id as string,
      replayed: r === 'replayed',
      outcome: 'assessment_unavailable' as const,
    };
  }
}
