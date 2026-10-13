-- 0166_recruiter_contact_share_projection.sql
--
-- I4 INVITE-FACE · 簇③（#223 招聘方候选人识别·裁决项③采 b=同意门邮箱显示·purpose=recruiter_contact_share）。
-- REQUEST：ai-docs/delivery/harness/i4-invite-face-REQUEST.md（rev2 @080dc6a5·§0.5/§1-③/§2-3）。
-- 真缝：邀请邮箱瞬时解析不落库（gateway_active_candidate·23_api_gateway.sql）——修法列「显示招聘方自己
--       输入的邀请邮箱」无现状存储；裁决③b=候选人侧同意门邮箱显示（CONSENT_PURPOSES 只增
--       'recruiter_contact_share'·contracts :505 零迁移），招聘方读面经本函数在同意门后取得识别替代列
--       （8 位 id 截断形制零改——识别=加替代手段非展开完整 id·§5 Ban）。
-- 形制先例：0160 gateway_b_qualitative_projection 同形（SECURITY DEFINER + search_path 锁定 + 函数内
--       自包含同意门 fail-closed + owner 谓词 + 自包含 ACL）。**Ban 改 0160 本体**（I2B-0d/0e 承重墙·
--       其与 23_api_gateway.sql 镜像逐字节同文）——本函数为全新独立同形函数。
-- 授权模型：①PERFORM gateway_require_active_recruiter()（0155 DB 纵深门·pending/rejected 同拒）
--       ②owner 谓词 fail-closed（job_application.recruiter_user_id=p_recruiter·非自有申请零出参）
--       ③同意门函数内承重（consent_record (candidate_owner,'recruiter_contact_share') 无行→该申请零出参·
--       与不存在不可区分）。批量形（text[]）：列表页（首屏 30 行封顶）单次调用承接，详情页同函数复用。
-- 出参白名单：application_id + email 恰两列（候选人自愿同意共享的联系方式·零其他 PII 列）。
-- expand-only：仅 CREATE OR REPLACE FUNCTION（全新函数）+ 自包含 REVOKE/GRANT——零表零列零触发器零策略。
-- 禁顶层 BEGIN/COMMIT（migrate.ts 硬抛）·SET LOCAL lock_timeout（0156/0157/0159 先例）。
-- 镜像承重墙：packages/db/sql/23_api_gateway.sql 末尾同位追加（函数体+ACL 与本文件逐字节同文·
--       0159 RX-3：23=受控函数族+ACL 镜像住地·0160 同款判据）。

SET LOCAL lock_timeout = '2s';

CREATE OR REPLACE FUNCTION gateway_recruiter_contact_share(
  p_recruiter text,
  p_application_ids text[]
)
RETURNS TABLE(application_id text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- ① DB 纵深门：函数内复核 active+approved recruiter（0155·gateway_active_candidate 同族）。
  PERFORM public.gateway_require_active_recruiter();
  -- ② owner 谓词 + 同意门（函数内承重·Ban 旁路）：申请须属于该招聘方，且候选人存在
  --    purpose='recruiter_contact_share' 同意行——无同意 → 该申请零出参（fail-closed·0160 同意门
  --    同形；撤回=删行随即停显）。出参恰 (application_id, email) 白名单两列。
  RETURN QUERY
    SELECT a.id, u.email
      FROM public.job_application a
      JOIN public.user_account u ON u.id = a.candidate_user_id
     WHERE a.id = ANY(p_application_ids)
       AND a.recruiter_user_id = p_recruiter
       AND EXISTS (
         SELECT 1 FROM public.consent_record cr
          WHERE cr.owner_user_id = a.candidate_user_id
            AND cr.purpose = 'recruiter_contact_share'
       );
END;
$$;

REVOKE ALL ON FUNCTION gateway_recruiter_contact_share(text, text[]) FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_recruiter_contact_share(text, text[]) TO app_role;
