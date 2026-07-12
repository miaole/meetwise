import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { hashPassword, verifyPassword, deriveGrowth, toGrowthRow, signToken } from '@meetwise/domain';
import { DbService } from '../../platform/db.service';
import { evictPrincipalStatus } from '../../platform/principal.guard';

/** settings 合并后 preferences 序列化上限(纵深防护:防 jsonb 无界膨胀 / 存储滥用 F6)。 */
const SETTINGS_MAX_BYTES = 4096;

/**
 * 用户资料/设置应用服务(拥有 asPrincipal/pool + SQL + 业务编排)。controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1)。
 * principal=user_account.id;账户表无 owner-RLS,按 id 经 pool 查;overview 走 RLS 限己。
 */
@Injectable()
export class ProfileService {
  constructor(private readonly db: DbService) {}

  async me(principal: string) {
    const r = await this.db.pool.query('SELECT id, email, status, preferences, created_at FROM user_account WHERE id=$1', [principal]);
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return r.rows[0];   // 不含 password_hash
  }

  // 个人总览/仪表盘(首屏):面试分布、答题数、平均分、就绪报告数。全 RLS 限己。
  overview(principal: string) {
    return this.db.asPrincipal(principal, async (c: any) => {
      const iv = await c.query('SELECT status, count(*)::int n FROM interview GROUP BY status');
      const sc = await c.query("SELECT avg((payload->>'score')::numeric) avg, count(*)::int n FROM interview_event WHERE kind='answer_evaluated'");
      const rp = await c.query("SELECT count(*)::int n FROM ai_report WHERE status='ready'");
      return {
        interviewsByStatus: Object.fromEntries(iv.rows.map((r: any) => [r.status, r.n])),
        answered: sc.rows[0].n,
        avgScore: sc.rows[0].avg != null ? Math.round(Number(sc.rows[0].avg)) : null,
        reportsReady: rp.rows[0].n,
      };
    });
  }

  // 成长档案/能力曲线(读侧聚合):历次 ready 评估按时间序 → 成长点 + 维度 + 趋势。全 RLS 限己(他人评估永不入)。
  // 聚合是纯函数 deriveGrowth(domain);本层只取数,绝不在响应里带简历原文/作答原文(只 score/维度标签/时间戳)。
  growth(principal: string) {
    return this.db.asPrincipal(principal, async (c: any) => {
      // RLS(FORCE)已限己;再显式带 owner_user_id 作纵深防御(双闸,修审计低危项)。
      const rep = await c.query(
        "SELECT interview_id, overall, dimensions, created_at FROM assessment_report WHERE owner_user_id=current_setting('app.principal_user', true) AND status='ready' ORDER BY created_at ASC, interview_id ASC");
      const ans = await c.query("SELECT count(*)::int n FROM interview_event WHERE kind='answer_evaluated'");
      return deriveGrowth(rep.rows.map(toGrowthRow), ans.rows[0].n);   // 映射单一真相 toGrowthRow(service 与 proof 同源)
    });
  }

  // 设置合并(F6):controller 已用 updateSettingsSchema 严格校验(白名单 key、值枚举、拒未知 key/深嵌);
  // 本层再对**合并后**总大小封顶(纵深防护),挡住任何绕过契约的 jsonb 无界膨胀。合并语义不变(不整体覆盖)。
  async settings(principal: string, b: { preferences?: Record<string, unknown> }) {
    if (!b?.preferences || typeof b.preferences !== 'object') throw new HttpException({ error: 'invalid_preferences' }, HttpStatus.BAD_REQUEST);
    const patch = JSON.stringify(b.preferences);
    if (Buffer.byteLength(patch, 'utf8') > SETTINGS_MAX_BYTES) throw new HttpException({ error: 'settings_too_large' }, HttpStatus.BAD_REQUEST);   // 入参先兜一层
    // 单语句原子合并 + 结果封顶:pg_column_size(合并值) 超限则 WHERE 不命中 → rowCount 0,不落库(防累积膨胀)。
    const r = await this.db.pool.query(
      `UPDATE user_account SET preferences = preferences || $2::jsonb
         WHERE id=$1 AND pg_column_size(preferences || $2::jsonb) <= $3
         RETURNING preferences`,
      [principal, patch, SETTINGS_MAX_BYTES]);
    if (r.rowCount === 0) {   // 区分:账户不存在 vs 合并后超限
      const exists = await this.db.pool.query('SELECT 1 FROM user_account WHERE id=$1', [principal]);
      if (exists.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
      throw new HttpException({ error: 'settings_too_large' }, HttpStatus.BAD_REQUEST);
    }
    return { preferences: r.rows[0].preferences };
  }

  // 修改密码(自助,安全):验旧密码(常量时间)→ scrypt 哈希新密码 + **密码代次自增**(吊销旧/被盗令牌,F4)。绝不明文。
  async changePassword(principal: string, b: { oldPassword?: string; newPassword?: string }) {
    if (!b?.oldPassword || !b?.newPassword || b.newPassword.length < 8) throw new HttpException({ error: 'invalid_password' }, HttpStatus.BAD_REQUEST);
    const r = await this.db.pool.query('SELECT password_hash FROM user_account WHERE id=$1', [principal]);
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    if (!verifyPassword(b.oldPassword, r.rows[0].password_hash)) throw new HttpException({ error: 'wrong_password' }, HttpStatus.UNAUTHORIZED);
    // 单语句原子改哈希 + 代次自增:并发两次改密各自 read-modify-write 在行锁内串行,代次 0→1→2 不丢更新,旧令牌全失效。
    const up = await this.db.pool.query(
      'UPDATE user_account SET password_hash=$2, pwd_epoch = pwd_epoch + 1 WHERE id=$1 RETURNING pwd_epoch',
      [principal, hashPassword(b.newPassword)]);
    const epoch = up.rows[0].pwd_epoch;
    evictPrincipalStatus(principal);   // 立即清守卫缓存 → 旧令牌下一请求即 401(不等 60s)
    // 签发**新代次**令牌回给当前会话,避免用户改完密码就被自己踢下线(无死胡同);缺密钥时降级为仅 changed。
    const secret = process.env.AUTH_SECRET ?? '';
    const token = secret ? signToken(principal, secret, 7 * 24 * 3600, Math.floor(Date.now() / 1000), epoch) : undefined;
    return token ? { changed: true, token } : { changed: true };
  }

  // 账户注销(自助停用)。PIPL 配合删除权:停用后用 /privacy/resume-data 删 PII。
  async deactivate(principal: string) {
    const r = await this.db.pool.query("UPDATE user_account SET status='disabled' WHERE id=$1", [principal]);
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return { deactivated: true };
  }
}
