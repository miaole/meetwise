import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { hashPassword, verifyPassword, deriveGrowth, toGrowthRow, signToken } from '@meetwise/domain';
import {
  requireOwnerUserId, buildRequiredOwnerFilter, beginResumeSoftDelete,
  beginInterviewProjectionErasure, beginMemoryAccountErasure,
} from '@meetwise/db';
import { DbService } from '../../platform/db.service';
import { evictPrincipalStatus } from '../../platform/principal.guard';

/** settings 白名单键(与 contracts.updateSettingsSchema 同源):落库前把已存 preferences 投影到这些键。 */
const SETTINGS_KEYS = ['locale', 'theme', 'notifications'];

/**
 * 用户资料/设置应用服务(拥有 asPrincipal/pool + SQL + 业务编排)。controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1)。
 * principal=user_account.id;账户表和业务表均由 RLS 限制到当前主体。
 */
@Injectable()
export class ProfileService {
  constructor(private readonly db: DbService) {}

  async me(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query(
      'SELECT id, email, status, preferences, created_at FROM user_account WHERE id=$1',
      [principal],
    ));
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return r.rows[0];   // 不含 password_hash
  }

  // 个人总览/仪表盘(首屏):面试分布、已答题数、平均分、就绪报告数。全 RLS 限己。
  overview(principal: string) {
    // PRIV01-C 第二层 E1:入口显式 owner(fail-closed tenant_owner_user_id_required)——授权根仍为 RLS。
    const owner = requireOwnerUserId(principal, 'profile.overview');
    const ansFilter = buildRequiredOwnerFilter(owner, 'profile.overview.answered');
    return this.db.asPrincipal(owner, async (c: any) => {
      const iv = await c.query('SELECT status, count(*)::int n FROM interview i WHERE interview_privacy_active(i.id) GROUP BY status');
      // 得分权威 = ScoreCard(确定性总分,仅 practice_eligible/b_review_eligible),legacy answer_evaluated.score 结构性不参与。
      // 全 owner 作用域由 score_card_app_role RLS(FORCE) 兜底,无卡 → avg=null(fail-closed,无数值)。
      const sc = await c.query("SELECT avg(deterministic_total) avg FROM score_card WHERE status IN ('practice_eligible','b_review_eligible')");
      const rp = await c.query("SELECT count(*)::int n FROM ai_report WHERE status='ready'");
      // C 端「已答题数」= 题目账本已答行(与 GET /interview.answered_turns 同一 FILTER),不是 ScoreCard 张数。
      // 无卡时仍应反映已作答;issued/queued/cancelled 不计;隐私围栏场次与列表同一谓词排除。
      // 第二层 E2:owner 谓词必选显式绑定(原 GUC 直读改参数绑定,RLS 会话内同值)。
      const ans = await c.query(
        "SELECT count(*)::int n FROM interview_question iq WHERE iq.status='answered' AND iq.owner_user_id=$1 AND interview_privacy_active(iq.interview_id)",
        [ansFilter.value],
      );
      return {
        interviewsByStatus: Object.fromEntries(iv.rows.map((r: any) => [r.status, r.n])),
        answered: ans.rows[0].n,
        avgScore: sc.rows[0].avg != null ? Math.round(Number(sc.rows[0].avg)) : null,
        reportsReady: rp.rows[0].n,
      };
    });
  }

  // 成长档案/能力曲线(读侧聚合):历次 ready 评估按时间序 → 成长点 + 维度 + 趋势。全 RLS 限己(他人评估永不入)。
  // 聚合是纯函数 deriveGrowth(domain);本层只取数,绝不在响应里带简历原文/作答原文(只 score/维度标签/时间戳)。
  // R4 读面过滤(UNSTUB-ERASE rev2):账户级删除(注销)后,已围栏面试的评估不再进成长档案——
  // interview_privacy_active(interview_id) 与列表/导出同一谓词,弱项偏置零泄漏。
  growth(principal: string) {
    // PRIV01-C 第二层 E1+E2:入口显式 owner + 谓词显式绑定(RLS(FORCE) 仍是授权根,双闸纵深防御沿原注释)。
    const owner = requireOwnerUserId(principal, 'profile.growth');
    const repFilter = buildRequiredOwnerFilter(owner, 'profile.growth.reports');
    return this.db.asPrincipal(owner, async (c: any) => {
      // RLS(FORCE)已限己;再显式带 owner_user_id 作纵深防御(双闸,修审计低危项)——现经 required predicate 绑定。
      const rep = await c.query(
        "SELECT interview_id, overall, dimensions, created_at FROM assessment_report WHERE owner_user_id=$1 AND status='ready' AND interview_privacy_active(assessment_report.interview_id) ORDER BY created_at ASC, interview_id ASC",
        [repFilter.value]);
      // answered = 可评分 ScoreCard 数(仅 practice_eligible/b_review_eligible),非 legacy answer_evaluated 事件计数;
      // 无卡 → 0(fail-closed)。成长档案训练量仍以 score_card 为权威;C 端总览已答题数改走题目账本(UC-overview-001)。
      const ans = await c.query("SELECT count(*)::int n FROM score_card WHERE status IN ('practice_eligible','b_review_eligible')");
      return deriveGrowth(rep.rows.map(toGrowthRow), ans.rows[0].n);   // 映射单一真相 toGrowthRow(service 与 proof 同源)
    });
  }

  // 设置合并(F6:防 jsonb 无界膨胀 / 存储滥用)。controller 已用 updateSettingsSchema 严格校验入参(白名单 key、值枚举、拒未知 key/深嵌)。
  // 落库时把**已存 preferences 先投影到白名单键**(SETTINGS_KEYS)再合并新 patch:
  //   ① 体积由白名单结构性钉死(恒极小,远小于任何字节封顶)——从根上杜绝无界膨胀,且**不用数值 reject-cap**,
  //      故不会出现"遗留超大行被永久锁死改不了设置"的回归(审计 F6 高危项);
  //   ② 顺带清洗历史脏 key(旧无校验代码可能残留的白名单外键),自愈存量数据。
  // 合并语义:**顶层按 key 合并**(本次未传的 locale/theme 保留原值);notifications 是嵌套对象,按 jsonb `||`
  //   语义**整体替换**(前端须提交完整 notifications 对象,不做子字段部分更新)。
  async settings(principal: string, b: { preferences?: Record<string, unknown> }) {
    if (!b?.preferences || typeof b.preferences !== 'object') throw new HttpException({ error: 'invalid_preferences' }, HttpStatus.BAD_REQUEST);
    const patch = JSON.stringify(b.preferences);
    // jsonb_object_agg(...) FILTER 把存量 prefs 投影到白名单键(无匹配→NULL→COALESCE '{}'),再 || 新 patch。单语句原子。
    const r = await this.db.asPrincipal(principal, (c) => c.query(
      `UPDATE user_account SET preferences = (
           SELECT COALESCE(jsonb_object_agg(k, v) FILTER (WHERE k = ANY($3::text[])), '{}'::jsonb)
             FROM jsonb_each(preferences) AS e(k, v)
         ) || $2::jsonb
         WHERE id=$1
         RETURNING preferences`,
      [principal, patch, SETTINGS_KEYS]));
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return { preferences: r.rows[0].preferences };
  }

  // 修改密码(自助,安全):验旧密码(常量时间)→ scrypt 哈希新密码 + **密码代次自增**(吊销旧/被盗令牌,F4)。绝不明文。
  async changePassword(principal: string, b: { oldPassword?: string; newPassword?: string }) {
    if (!b.oldPassword || !b.newPassword || b.newPassword.length < 8) throw new HttpException({ error: 'invalid_password' }, HttpStatus.BAD_REQUEST);
    const r = await this.db.asPrincipal(principal, (c) => c.query(
      'SELECT password_hash FROM user_account WHERE id=$1', [principal]));
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    if (!verifyPassword(b.oldPassword, r.rows[0].password_hash)) throw new HttpException({ error: 'wrong_password' }, HttpStatus.UNAUTHORIZED);
    // 单语句原子改哈希 + 代次自增:并发两次改密各自 read-modify-write 在行锁内串行,代次 0→1→2 不丢更新,两个旧代次令牌均失效。
    // 边角:并发双改密时先提交者回签的令牌内嵌旧代次(如 1),会被终值(2)判失效——极罕见的自锁,可接受。
    const newPassword = b.newPassword;   // 守卫后已收窄为 string；const 捕获进闭包(strictNullChecks 下 b 参数不收窄进回调)
    const up = await this.db.asPrincipal(principal, (c) => c.query(
      'UPDATE user_account SET password_hash=$2, pwd_epoch = pwd_epoch + 1 WHERE id=$1 RETURNING pwd_epoch',
      [principal, hashPassword(newPassword)]));
    const epoch = up.rows[0].pwd_epoch;
    evictPrincipalStatus(principal);   // 清本进程守卫缓存 → 单实例下旧令牌下一请求即 401;多实例仅本机即时,其余实例 ≤60s 缓存过期后生效
    // 签发**新代次**令牌回给当前会话,避免用户改完密码就被自己踢下线(无死胡同);缺密钥时降级为仅 changed。
    const secret = process.env.AUTH_SECRET ?? '';
    const token = secret ? signToken(principal, secret, 7 * 24 * 3600, Math.floor(Date.now() / 1000), epoch) : undefined;
    return token ? { changed: true, token } : { changed: true };
  }

  /**
   * 账户注销 + 发起账户级删除（UNSTUB-ERASE rev2 · D6 最低集 · #236 语义）：
   * ①密码复核（常量时间 verifyPassword，错→401 零副作用——高危操作二次确认）
   * ②同一事务内原子落全部软删面：owner 全部简历 → 0152 受审墓碑函数逐份围栏落账；
   *   owner 全部面试 → interview_projection_begin_erasure（0096 · 每场恰 4 target:
   *   event/ai_graph_run/report + checkpoint_rows fence 锚）；
   *   账户记忆面 → memory_begin_account_erasure（0093 · account_data 分账本）；
   *   user_account → status='disabled' + deleted_at + pwd_epoch+1。
   * ③evictPrincipalStatus 即时逐缓存：现存全部机械即刻吊销令牌（旧 Bearer→401
   *   account_inactive/session_revoked；login→401 status!=='active'）。
   * **不撒谎边界**：202 + `mode:'logical'` + `purgePending:true`——本地围栏即时生效，
   * 物理清除（含匿名化/同邮箱释放）由已建 PRIV 链异步补完，S1 恒不宣称完成。
   * 同一事务=FAULT 原子性：任一子面失败整体回滚，无部分围栏态。
   */
  async deactivate(principal: string, password?: string) {
    if (!password) throw new HttpException({ error: 'password_required' }, HttpStatus.BAD_REQUEST);
    const acct = await this.db.asPrincipal(principal, (c) => c.query(
      'SELECT password_hash, status FROM user_account WHERE id=$1', [principal]));
    if (acct.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    if (!verifyPassword(password, acct.rows[0].password_hash)) {
      throw new HttpException({ error: 'wrong_password' }, HttpStatus.UNAUTHORIZED);   // 零副作用失败路径
    }
    const result = await this.db.asPrincipal(principal, async (c: any) => {
      // 简历轨:全部 active 态逐份软删受理(0152 幂等键内部派生;重放不建第二份账)。
      const resumes = await c.query(
        "SELECT id FROM resume WHERE owner_user_id=$1 AND status IN ('uploaded','ingesting','ingested','failed')",
        [principal]);
      let resumesFenced = 0;
      for (const row of resumes.rows) {
        await beginResumeSoftDelete(c, principal, row.id);
        resumesFenced++;
      }
      // 面试轨:全部自有场次逐场投影围栏(0096;TS 包装层钉死恰 4 target,缺一 fail-closed)。
      const interviews = await c.query(
        'SELECT id FROM interview WHERE owner_user_id=$1 ORDER BY created_at, id',
        [principal]);
      let interviewsFenced = 0;
      for (const row of interviews.rows) {
        const keyHash = createHash('sha256').update(`account_deletion:interview:${principal}:${row.id}`).digest('hex');
        await beginInterviewProjectionErasure(c, row.id, keyHash, 1);
        interviewsFenced++;
      }
      // 记忆轨:账户级删除分账本(0093;幂等键同内部派生,重放同 requestId)。
      const memoryKeyHash = createHash('sha256').update(`account_deletion:memory:${principal}`).digest('hex');
      const memory = await beginMemoryAccountErasure(c, memoryKeyHash);
      // 账户本体:disabled + deleted_at + 密码代次自增(0153;吊销全部既有令牌的代次面)。
      const up = await c.query(
        "UPDATE user_account SET status='disabled', deleted_at=now(), pwd_epoch=pwd_epoch+1 WHERE id=$1 AND status='active' RETURNING deleted_at, pwd_epoch",
        [principal]);
      if (up.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
      return { deletedAt: up.rows[0].deleted_at as string, resumesFenced, interviewsFenced, memoryRequestId: memory.requestId };
    });
    evictPrincipalStatus(principal);   // 清本进程守卫缓存 → 注销后旧令牌下一请求即 401
    return {
      deactivated: true as const,
      mode: 'logical' as const,
      purgePending: true as const,
      deletedAt: result.deletedAt,
      resumesFenced: result.resumesFenced,
      interviewsFenced: result.interviewsFenced,
    };
  }
}
