/**
 * AG39 企业私有题库——owner 作用域服务端派生（裁决⑦值源）。
 *
 * `app.qbank_org_id` 禁客户端直供:值源=服务端从面试链路信任根派生——
 *   interview(0001/0028 application_id) → job_application(0005 recruiter_user_id) → job_posting(0004 招聘方信任根)。
 * 本模块只做"绑定面派生":无绑定 interview（application_id NULL·0028 fail-closed 不猜测语义）显式落
 *   owner_kind='platform'（裁决⑦ N-A 臂·禁 RAISE——防 C 端练习检索全断）;有绑定则以 recruiter_user_id
 *   为本场企业作用域值（现库零 org 实体·招聘方 user 即信任根·§0.2-7;org 实体刀落位后此处换 org 键零触面外）。
 * 派生结果经 QbankServingScopeInput.ownerKind/orgId 注入检索 GUC 契约;DB 层强制过滤与 fail-closed 在 0187
 *   SECURITY DEFINER 函数内,应用层只注入参数不承担隔离（§5 Ban 应用层过滤）。
 */
import type { PoolClient as Client } from 'pg';
import type { QbankOwnerKind } from './qbank-generation-retrieval.ts';

export interface QbankOwnerScope {
  ownerKind: QbankOwnerKind;
  /** ownerKind='org' 时为本场企业作用域值;platform 臂为 undefined。 */
  orgId?: string;
}

/**
 * 派生一场面试的检索 owner 作用域。调用方须已处于该面试 owner 的 asPrincipal 上下文
 * （RLS interviewer owner 隔离——B 端越权面试行不可见→自然落 platform 臂,不跨 owner 探测）。
 */
export async function deriveQbankOwnerScope(c: Client, owner: string, interviewId: string): Promise<QbankOwnerScope> {
  if (!interviewId || interviewId.length > 512) throw new Error('qbank_owner_invalid_interview');
  const r = await c.query(
    `SELECT ja.recruiter_user_id AS recruiter
       FROM interview i
       JOIN job_application ja ON ja.id = i.application_id
      WHERE i.id = $1 AND i.owner_user_id = $2 AND i.application_id IS NOT NULL
      LIMIT 1`,
    [interviewId, owner],
  );
  const recruiter = r.rows[0]?.recruiter;
  if (typeof recruiter === 'string' && recruiter.length >= 1 && recruiter.length <= 512) {
    return { ownerKind: 'org', orgId: recruiter };
  }
  return { ownerKind: 'platform' };   // 无绑定 interview（练习场）→ 显式 platform,禁 RAISE
}
