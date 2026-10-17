import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  createJob, listJobs, getJob, closeJob, updateJob, getJobRouteStatus, listJobRouteStatuses, retryJobRoute,
  listJobCandidates, inviteCandidate, listTalentPool,
  notifyWorkerJobWakeup, type TalentQuery,
} from '@meetwise/db';
import type { CreateJobDto, InviteCandidateDto, UpdateJobDto } from '@meetwise/contracts';
import { normalizeEmail } from '@meetwise/domain';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';

/**
 * 招聘方(B 端)应用服务。多租户:全经 asPrincipal,RLS 按招聘方(principal=owner)隔离——只见自己的岗位/候选人。
 * 企业纵深:邀请候选人用**同一面试引擎**(岗位 competencies 驱动出题),人才库跨自有岗位聚合。
 * who-pays:B 端岗位面试(application_id 非空)扣**企业桶**——reserveEntitlementForApplication
 * (0157 payer=job_application.recruiter_user_id 单跳派生·候选人桶零读写·扣额路由实锚 interview.service.ts);
 * C 端本人练习才走候选人自己额度池。招聘方/AI 图均不直接动 entitlement(邀请只建申请壳)。
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
    // I3 JOB-MGMT（#219）：列表旁车 routes（jobId→最新 revision 路由态）——招聘方可见面；additive 可选字段。
    return this.db.asPrincipal(principal, async (c) => ({
      jobs: await listJobs(c, principal),
      routes: await listJobRouteStatuses(c, principal),
    }));
  }

  async get(principal: string, id: string) {
    const job = await this.db.asPrincipal(principal, (c) => getJob(c, principal, id));
    if (!job) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);   // RLS:别人的→404
    return job;
  }

  /**
   * I3 JOB-MGMT（裁决①·#220）：编辑岗位——owner 谓词内建（db assertPrincipal+行锁），语义字段真变化
   * 时 db 写新 revision（route_pending·recruiter.ts :108 链），此处 wakeup 走既有 sole worker drain
   * （R2 P-API 组合根同 createJob 先例·API 不调 classifyJobRoute）。零新增管道·接线即自通。
   */
  async update(principal: string, id: string, dto: UpdateJobDto) {
    const job = await this.db.asPrincipal(principal, (c) => updateJob(c, principal, id, dto));
    if (!job) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);   // RLS:别人的/不存在→404
    await this.db.asPrincipal(principal, (c) => notifyWorkerJobWakeup(c));
    return job;
  }

  /**
   * I3 JOB-MGMT（裁决①·#220）：下线岗位——三臂语义保持：非自有/不存在 → 404；closed 再 close →
   * db rowCount=0 返 false → 同 404 恒定壳（无存在性信号）；open → closed → 200 {closed:true}。
   */
  async close(principal: string, id: string) {
    const closed = await this.db.asPrincipal(principal, (c) => closeJob(c, principal, id));
    if (!closed) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    return { closed: true } as const;
  }

  /** I3 JOB-MGMT（#219 可见面）：读岗位语义路由状态（最新 revision 枚举+attemptOutcome/reasonCodes 摘要·仅 owner）。 */
  async route(principal: string, id: string) {
    const route = await this.db.asPrincipal(principal, (c) => getJobRouteStatus(c, principal, id));
    if (route === null) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    return { route };
  }

  /**
   * I3 JOB-MGMT（裁决③·#219）：显式重试路由——db 写新 revision（route_pending）后 wakeup 走既有 drain。
   * sticky 枚举语义零改（unresolved 旧 revision 原样留存·同 revision 重跑仍 noop already_unresolved）；
   * 重试=招聘方显式动作·一次至多一个新 revision（Ban 无界自动重试）。API 零 classifyJobRoute（Worker 唯一调用方）。
   */
  async retryRoute(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, (c) => retryJobRoute(c, principal, id));
    if (r === null) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    if (r.status === 'retried') await this.db.asPrincipal(principal, (c) => notifyWorkerJobWakeup(c));
    return r;
  }

  /** 招聘方查申请到自己某岗位的候选人(多方 RLS:招聘方为一方→可见缓存状态/分数,不见候选人私有面试)。 */
  candidates(principal: string, jobId: string) {
    return this.db.asPrincipal(principal, async (c) => ({ candidates: await listJobCandidates(c, principal, jobId) }));
  }

  /**
   * I2 W2（裁定②形 A·裁定③落点 A）：B 端最小定性投影端点。单申请人自身事实投影——
   * 能力维度名 + 强/中/弱/证据不足档位（rubric disposition 三值映射·Ban 自造档位），
   * 不出数字（0160 出参白名单无 deterministic_total/score/overall/coverage 数值列）；
   * 同意门（E6）在 gateway_b_qualitative_projection 函数内 fail-closed：无 b_qualitative_share
   * 同意行 → disclosed=false 未披露态（非空壳假数据）；同意但无评分事实 → 暂无可复核的评估记录。
   * 归属预检双 404 恒定壳（getJob 同形 :44）：非自有岗位/非自有申请/函数 0 行（非属主或非终态）
   * 零存在性信号。Ban 排序/过滤/跨申请人比较用途（fix-roadmap:117 承接）。
   */
  async qualitative(principal: string, jobId: string, applicationId: string) {
    const job = await this.db.asPrincipal(principal, (c) => getJob(c, principal, jobId));
    if (!job) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);   // RLS:别人的→404
    return this.db.asPrincipal(principal, async (c) => {
      const owned = await c.query(
        'SELECT 1 FROM job_application WHERE id=$1 AND job_id=$2 AND recruiter_user_id=$3',
        [applicationId, jobId, principal],
      );
      if ((owned.rowCount ?? 0) === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      const rows = await c.query<{
        disclosed: boolean; terminal_kind: string | null; competency: string | null; strong_count: string | null;
        mid_count: string | null; weak_count: string | null; insufficient_count: string | null;
      }>(
        'SELECT disclosed, terminal_kind, competency, strong_count, mid_count, weak_count, insufficient_count FROM gateway_b_qualitative_projection($1,$2)',
        [principal, applicationId],
      );
      // 函数 0 行=非属主/非终态（0160 owner 谓词 fail-closed）→ 与越权同壳 404，不可区分。
      const first = rows.rows[0];
      if (rows.rows.length === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      // terminal_kind 两态状态信号不进同意门（0160 ②·W3④ 承接）；disclosed 只门定性投影。
      if (first?.disclosed !== true)
        return { disclosed: false, terminalKind: first?.terminal_kind === 'failed' ? 'failed' : 'held', dimensions: [] };
      // 计数 → 档位存在性映射（有序·Ban 自造档位·数字不出 API 面）。
      const dimensions = rows.rows
        .filter((row) => row.competency != null)
        .map((row) => ({
          competency: String(row.competency),
          tiers: [
            ...(Number(row.strong_count) > 0 ? ['strong' as const] : []),
            ...(Number(row.mid_count) > 0 ? ['mid' as const] : []),
            ...(Number(row.weak_count) > 0 ? ['weak' as const] : []),
            ...(Number(row.insufficient_count) > 0 ? ['insufficient' as const] : []),
          ],
        }));
      return { disclosed: true, terminalKind: first.terminal_kind === 'failed' ? 'failed' as const : 'held' as const, dimensions };
    });
  }

  /**
   * 招聘方邀请候选人为某岗位面试(InviteCandidateDto:candidateId 或 email 二选一)。
   * b110 反枚举双闸:
   * ① R2 岗位归属预检**前置**到候选人解析之前——非自有/不存在岗位恒 404 `job_not_found_or_forbidden`
   *    (字节稳定)。现序曾先候选人后岗位;恒定壳后若不前置,「越权岗位×幽灵→壳 200 vs 越权岗位×真候选人→404」
   *    枚举面复活(jobs.controller 仅 PrincipalGuard 暴露岗位 id,一人双账户攻击面真实)。
   * ② 响应收敛恒定壳:命中=真实建申请、未命中/招聘方 email=同形同码零信号;applicationId/status 不再出响应,
   *    真实状态以租户内 candidates 列表承载(幂等复用语义不变)。
   * DB 纵深:gateway_active_candidate 函数内复核 active recruiter + 审批(approved)维度(0155·回填重编号)。
   */
  async invite(principal: string, jobId: string, dto: InviteCandidateDto, ip?: string) {
    // 反账号枚举(安全审计 F8 + b110 §1.2.6):桶序钉死 per-principal→ip(|| 短路;429 断言确定性)。
    // per-principal 桶零改(回归锚):突发 12、稳态 0.05/秒;invite:ip 桶同档,封「批量注册 recruiter 绕过主体桶」。
    if (!(await this.rl.allow(`invite:${principal}`, 12, 0.05)))
      throw new HttpException({ error: 'too_many_requests', message: '邀请过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
    if (!(await this.rl.allow(`invite:ip:${ip ?? 'unknown'}`, 12, 0.05)))
      throw new HttpException({ error: 'too_many_requests', message: '邀请过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
    // candidateId 与 email 两条入参路径**对称**地都经受控解析,确认目标是活跃候选人——
    // 杜绝招聘方对任意 userId(含他人招聘方)建幽灵申请,也不暴露 B 端账户。
    const candidateIdInput = dto.candidateId?.trim() || null;
    // AUTHZ-HARDEN 5A-1 簇①（#131·§1「归一改调与注册同源的单一 helper」）：邀请侧与注册/登录同源 normalizeEmail
    // （trim+lower，行为与原双写等价）——注册侧已归一落库（auth.service+0168 双闸），此处大写/带空白输入照命中；I4 面零触。
    const candidateEmailInput = dto.candidateEmail ? normalizeEmail(dto.candidateEmail) || null : null;
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
      await this.db.asPrincipal(principal, async (c) => {
        const app = await inviteCandidate(c, principal, jobId, candidateId);
        // I4 #221:候选人站内通知写侧只经裁决形通道(0165 gateway_notify_invited·SECURITY DEFINER+
        // 窄接口:kind/payload 固定·id=ntf_<applicationId> 幂等零堆积·owner 谓词 fail-closed——
        // 非自有/不存在零写零信号,b110 恒定壳「未命中零写」红线由函数内承重)。未命中分支零进此臂。
        // 竞态防御(预检后岗位被删):inviteCandidate 零命中 → 零写零信号,恒定壳同码不受影响。
        if (!app) return;
        await c.query('SELECT gateway_notify_invited($1,$2)', [principal, app.applicationId]);
      });
    }
    // 恒定壳:命中/未命中/招聘方 email 同形同码零信号——真实受理状态以租户内 candidates 列表为准。
    return { received: true } as const;
  }

  /** 人才库:跨自有所有岗位聚合候选人(RLS 租户隔离,看不到他人租户);服务端排序/筛选。 */
  talent(principal: string, q: TalentQuery) {
    return this.db.asPrincipal(principal, async (c) => ({ talents: await listTalentPool(c, principal, q) }));
  }
}
