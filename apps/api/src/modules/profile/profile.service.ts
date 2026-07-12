import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { hashPassword, verifyPassword, deriveGrowth, toGrowthRow } from '@meetwise/domain';
import { DbService } from '../../platform/db.service';

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

  async settings(principal: string, b: { preferences?: Record<string, unknown> }) {
    if (!b?.preferences || typeof b.preferences !== 'object') throw new HttpException({ error: 'invalid_preferences' }, HttpStatus.BAD_REQUEST);
    const r = await this.db.pool.query('UPDATE user_account SET preferences = preferences || $2::jsonb WHERE id=$1 RETURNING preferences', [principal, JSON.stringify(b.preferences)]);
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return { preferences: r.rows[0].preferences };   // 合并(不整体覆盖)
  }

  // 修改密码(自助,安全):验旧密码(常量时间)→ scrypt 哈希新密码落库。绝不明文。
  async changePassword(principal: string, b: { oldPassword?: string; newPassword?: string }) {
    if (!b?.oldPassword || !b?.newPassword || b.newPassword.length < 8) throw new HttpException({ error: 'invalid_password' }, HttpStatus.BAD_REQUEST);
    const r = await this.db.pool.query('SELECT password_hash FROM user_account WHERE id=$1', [principal]);
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    if (!verifyPassword(b.oldPassword, r.rows[0].password_hash)) throw new HttpException({ error: 'wrong_password' }, HttpStatus.UNAUTHORIZED);
    await this.db.pool.query('UPDATE user_account SET password_hash=$2 WHERE id=$1', [principal, hashPassword(b.newPassword)]);
    return { changed: true };
  }

  // 账户注销(自助停用)。PIPL 配合删除权:停用后用 /privacy/resume-data 删 PII。
  async deactivate(principal: string) {
    const r = await this.db.pool.query("UPDATE user_account SET status='disabled' WHERE id=$1", [principal]);
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return { deactivated: true };
  }
}
