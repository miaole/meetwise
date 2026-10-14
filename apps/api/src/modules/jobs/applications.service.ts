import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { listMyApplications, finalizeApplication, startApplicationInterview, declineInvitation, requireOwnerUserId } from '@meetwise/db';
import type { StartApplicationDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';
import { assertPublicPreviewWritesClosed, PublicPreviewReadOnlyError } from '../../platform/public-preview';
import { beginInterviewCore } from '../interview/interview.service';

/** S2-C4 拒因分码（修法③）：候选人稳定面=application_enterprise_pay_unavailable；企业侧原始子码
 *  enterprise_insufficient_balance 由 beginInterviewCore 抛出（招聘方面 API 分码·卡片触面归片3）。 */
const ENTERPRISE_PAY_UNAVAILABLE = 'application_enterprise_pay_unavailable' as const;
const ENTERPRISE_PAY_UNAVAILABLE_MESSAGE = '该岗位面试暂不可用，请联系招聘方';

/**
 * 候选人(C 端)申请应用服务。RLS:候选人只见/只改自己的申请(p_party_read + p_candidate_update)。
 * finalize 只确认已绑定会话的终态。评分校准发布前，它不会向 B 端回填或
 * 公开数值分，而是返回 scoreless 的人工复核状态；越权/不存在→404。
 * PRIV01-C:应用层 tenant 强制第二层(E1 入口显式 owner,fail-closed tenant_owner_user_id_required)——
 * 授权根仍为 PG RLS(应用层 tenant ≠ RLS);owner 谓词绑定在 db 候选侧函数内(recruiter.ts)。
 */
@Injectable()
export class ApplicationsService {
  constructor(private readonly db: DbService) {}

  mine(principal: string): Promise<{ applications: Awaited<ReturnType<typeof listMyApplications>> }> {
    const owner = requireOwnerUserId(principal, 'applications.mine');   // PRIV01-C 第二层 E1
    return this.db.asPrincipal(owner, async (c) => ({ applications: await listMyApplications(c, owner) }));
  }

  /**
   * application 是岗位评估的唯一根：同一事务内行锁 application、验证 candidate 的已摄取 resume、
   * 创建/复用唯一 interview，再将四元绑定写回。返回 ID 只来自持久化绑定，不能由浏览器指定。
   */
  private denyPublicPreviewWrite(): void {
    try {
      assertPublicPreviewWritesClosed();
    } catch (error) {
      if (error instanceof PublicPreviewReadOnlyError) {
        throw new HttpException({ error: 'public_preview_read_only' }, HttpStatus.SERVICE_UNAVAILABLE);
      }
      throw error;
    }
  }

  async start(principal: string, appId: string, dto: StartApplicationDto, requestId?: string) {
    this.denyPublicPreviewWrite();
    const owner = requireOwnerUserId(principal, 'applications.start');   // PRIV01-C 第二层 E1
    // B271 片2 S2-C4（修法⑤·#227 缺陷收口）：start+begin 服务端动作合一——企业预留与申请状态迁移
    // 同一事务（同一 asPrincipal 事务：startApplicationInterview 的 INSERT/CAS 与 beginInterviewCore 的
    // 预留/入队原子提交或整体回滚）。企业额度不足 ⇒ 预留抛 → 整事务回滚 ⇒ 不产生 in_progress 空申请
    // （recruiter.ts CAS 落库零触）；候选人分码 application_enterprise_pay_unavailable（402·非候选人
    // 个人额度语义·Ban 条款-5）。reused 复用路（recruiter.ts:373-387）同样走 begin 核心：已 begun 幂等
    // 短路零重扣；未 begun 则预留——零余额同拒（rev2-R8）。
    const r = await this.db.asPrincipal(owner, async (c) => {
      const started = await startApplicationInterview(c, owner, appId, dto.resumeId);
      if (started.status !== 'started' && started.status !== 'reused') return started;
      try {
        await beginInterviewCore(c, owner, started.interviewId, dto.resumeId, requestId);
      } catch (e: unknown) {
        if (e instanceof HttpException && (e.getResponse() as { error?: string })?.error === 'enterprise_insufficient_balance') {
          throw new HttpException({ error: ENTERPRISE_PAY_UNAVAILABLE, message: ENTERPRISE_PAY_UNAVAILABLE_MESSAGE }, HttpStatus.PAYMENT_REQUIRED);
        }
        throw e;
      }
      return started;
    });
    if (r.status === 'resume_not_ready')
      throw new HttpException({ error: 'resume_not_ready', message: '请选择一份已完成解析的本人简历' }, HttpStatus.CONFLICT);
    if (r.status === 'binding_invalid')
      throw new HttpException({ error: 'application_binding_invalid', message: '该申请的面试绑定异常，已停止继续处理' }, HttpStatus.CONFLICT);
    if (r.status === 'interview_ineligible_route')
      throw new HttpException({
        error: 'interview_ineligible_route',
        message: '该岗位路由尚未就绪，暂不可开始题库面试；请待岗位补充描述并完成路由后再试',
      }, HttpStatus.CONFLICT);
    // I2 W1 修法④（裁定⑥ `application_held_not_retryable`·409）：held（绑定面试 completed 的
    // hold 终态）不再可重试——服务端守卫与 UI 收窄同源（recruiter.ts 绑定面试 status 校验）。
    // 非既有 402 分码面（application-enterprise-pay 映射零改·新拒因并列既有 409 表）。
    if (r.status === 'application_held_not_retryable')
      throw new HttpException({
        error: 'application_held_not_retryable',
        message: '本场面试已完成，评分待校准；无需重新开始',
      }, HttpStatus.CONFLICT);
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
    const owner = requireOwnerUserId(principal, 'applications.decline');   // PRIV01-C 第二层 E1
    const ok = await this.db.asPrincipal(owner, (c) => declineInvitation(c, owner, appId));
    return { applicationId: appId, status: ok ? 'declined' : 'noop' };
  }

  async finalize(principal: string, appId: string) {
    this.denyPublicPreviewWrite();
    const owner = requireOwnerUserId(principal, 'applications.finalize');   // PRIV01-C 第二层 E1
    // 不接受客户端 interviewId。DB 会验证 application↔interview↔job↔resume↔owner；
    // calibration hold 下任何完成都只能收口为 assessment_unavailable。
    const r = await this.db.asPrincipal(owner, (c) => finalizeApplication(c, owner, appId));
    if (r === 'not_ready') throw new HttpException({ error: 'cannot_finalize', message: '岗位绑定面试尚未完成或绑定不一致' }, HttpStatus.CONFLICT);
    const bound = await this.db.asPrincipal(owner, async (c) =>
      c.query('SELECT interview_id FROM job_application WHERE id=$1 AND candidate_user_id=$2', [appId, owner]));
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
