import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DbService } from '../../platform/db.service';

const POLICY_VERSION = process.env.PRIVACY_POLICY_VERSION ?? 'v1';

/** PIPL 合规应用服务:采集同意 / 数据可携导出 / 删除权。全经 principal/RLS(修审计 F1)。 */
@Injectable()
export class PrivacyService {
  constructor(private readonly db: DbService) {}

  async consent(principal: string, purpose = 'resume_processing') {
    // 幂等:同一 purpose 已同意则不重复插行(否则前端重复点击/双提交会堆积重复同意记录)。
    await this.db.asPrincipal(principal, async (c) => {
      const ex = await c.query('SELECT 1 FROM consent_record WHERE purpose=$1 LIMIT 1', [purpose]);
      if (ex.rowCount === 0)
        await c.query('INSERT INTO consent_record(id, owner_user_id, purpose, policy_version) VALUES ($1,$2,$3,$4)', [randomUUID(), principal, purpose, POLICY_VERSION]);
    });
    return { recorded: true, policyVersion: POLICY_VERSION };
  }

  /** 查采集同意状态(前端据此决定是否显示"同意隐私政策"卡片,避免上传即报错的死胡同)。 */
  async consentStatus(principal: string, purpose = 'resume_processing') {
    const consented = await this.db.asPrincipal(principal, async (c) =>
      (await c.query('SELECT 1 FROM consent_record WHERE purpose=$1 LIMIT 1', [purpose])).rowCount! > 0);
    return { consented, purpose, policyVersion: POLICY_VERSION };
  }

  // 数据可携:导出结构化档案,不含加密原文/明文 PII。
  export(principal: string) {
    return this.db.asPrincipal(principal, async (c) => {
      const resumes = (await c.query('SELECT id, status FROM resume')).rows;
      const interviews = (await c.query('SELECT id, status FROM interview')).rows;
      const assessments = (await c.query('SELECT interview_id, overall FROM assessment_report')).rows;
      const consents = (await c.query('SELECT purpose, policy_version, granted_at FROM consent_record')).rows;
      return { exportedAt: new Date().toISOString(), resumes, interviews, assessments, consents };
    });
  }

  // 删除权:删自己的简历 PII(原文 blob + 结构化 profile + 记录)。RLS 限己。
  deleteResumeData(principal: string) {
    return this.db.asPrincipal(principal, async (c) => {
      await c.query('DELETE FROM resume_profile WHERE owner_user_id = current_setting($1, true)', ['app.principal_user']);
      await c.query('DELETE FROM resume_blob WHERE owner_user_id = current_setting($1, true)', ['app.principal_user']);
      const d = await c.query('DELETE FROM resume WHERE owner_user_id = current_setting($1, true)', ['app.principal_user']);
      return { deleted: true, resumesRemoved: d.rowCount };
    });
  }
}
