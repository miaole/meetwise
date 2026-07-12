import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { listMyApplications, finalizeApplication, startApplicationInterview, declineInvitation } from '@meetwise/db';
import type { FinalizeApplicationDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';

/**
 * 候选人(C 端)申请应用服务。RLS:候选人只见/只改自己的申请(p_party_read + p_candidate_update)。
 * finalize 回填面试结果——分数由候选人侧核验后写入(不可伪造跨方);越权/不存在→404。
 */
@Injectable()
export class ApplicationsService {
  constructor(private readonly db: DbService) {}

  mine(principal: string) {
    return this.db.asPrincipal(principal, async (c) => ({ applications: await listMyApplications(c, principal) }));
  }

  /** 候选人开始面试:状态机 CAS invited → in_progress(仅 invited 可推进;已开始/已完成 → 幂等放行不报错)。 */
  async start(principal: string, appId: string) {
    const ok = await this.db.asPrincipal(principal, (c) => startApplicationInterview(c, principal, appId));
    return { applicationId: appId, status: ok ? 'in_progress' : 'noop' };  // noop:非 invited(已 in_progress/completed)或越权——不死胡同,客户端据 mine() 渲染真状态
  }

  /** 候选人婉拒邀请:状态机 CAS invited → declined(终态)。非 invited(已开始/已完成)→ noop,不死胡同。 */
  async decline(principal: string, appId: string) {
    const ok = await this.db.asPrincipal(principal, (c) => declineInvitation(c, principal, appId));
    return { applicationId: appId, status: ok ? 'declined' : 'noop' };
  }

  async finalize(principal: string, appId: string, dto: FinalizeApplicationDto) {
    // 分数服务端从该面试已评估轮次推导(不接受自报)。失败 = 申请不存在/越权 OR 面试无评估轮次 OR 状态不允许 → 409。
    const ok = await this.db.asPrincipal(principal, (c) =>
      finalizeApplication(c, principal, appId, dto.interviewId));
    if (!ok) throw new HttpException({ error: 'cannot_finalize', message: '面试未完成评估,或申请状态不允许回填' }, HttpStatus.CONFLICT);
    return { applicationId: appId };
  }
}
