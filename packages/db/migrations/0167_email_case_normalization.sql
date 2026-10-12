-- 0167_email_case_normalization.sql
-- AUTHZ-HARDEN 5A-1 · 簇①（#111+#131 邮箱归一·存量迁移）。
-- REQUEST：ai-docs/delivery/harness/authz-harden-REQUEST.md rev2（pre-exec 双审 BOTH PASS + 协调方派单开工）。
-- 纪律（R9/§3-5）：历史迁移 0001-0166 零字节改（migrate.ts checksum 守卫）；本刀 DDL 白名单=本迁移
-- （归一 + lower(email) 唯一索引）与 0169 会话表两件；零新 RLS 策略/零 BYPASSRLS/零角色授权变更。
-- expand-only：UPDATE 行值归一 + 唯一索引，零 DROP 零列变；幂等可重跑（重放零 diff）。
-- 三步（§1-簇① 修法列逐字）：
--   ① 冲突预检【只报告不合并】：GROUP BY lower(btrim(email)) HAVING count(*)>1 的组 RAISE WARNING 列明
--      ——冲突行整组**原样保留**，合并/删除处置归运营决（Ban 静默合并·修法列「先排查存量冲突账号」）；
--   ② 无冲突行归一：email=lower(btrim(email))。归一目标与他人目标相撞的行必在冲突组内、已整组排除，
--      UPDATE 不可能违反既有 email UNIQUE（plain）→ **中途 UNIQUE 坠迁移结构性不可能**（派单裁决）；
--      已归一行被 IS DISTINCT FROM 短路 → 重跑零 diff（幂等）；
--   ③ 唯一索引条件创建：冲突组清零才 CREATE UNIQUE INDEX ux_user_email_lower ON user_account(lower(email))
--      （§1 逐字索引名/表达式）；冲突未清 → WARNING 延后跳过（防中途 UNIQUE 坠迁移的另一半），
--      运营清障后于新迁移补建（本迁移重放由 ledger 跳过，不在本体内重试）。
-- 索引表达式按 §1 用 lower(email)：经①②后全库 email 已 lower(btrim) 归一，与 lower(btrim(email)) 等价；
-- 新写侧（0168 网关函数 + 应用层 normalizeEmail）均先归一，lower(email) 恒等于归一值。

SET LOCAL lock_timeout = '2s';

-- ① 冲突预检：只报告，不合并（处置归运营决）
DO $$
DECLARE
  v_groups int;
  v_detail text;
BEGIN
  SELECT count(*)::int, coalesce(string_agg('{' || k || '}', ', ' ORDER BY k), '')
    INTO v_groups, v_detail
    FROM (SELECT lower(btrim(email)) AS k FROM public.user_account GROUP BY lower(btrim(email)) HAVING count(*) > 1) c;
  IF v_groups > 0 THEN
    RAISE WARNING 'authz_0167_conflict_report: % 组邮箱大小写/空白变体冲突——只报告不合并(处置归运营决): %', v_groups, v_detail;
  END IF;
END
$$;

-- ② 无冲突行归一（冲突组整组保留；单语句一致快照；重跑 IS DISTINCT FROM 短路 = 幂等零 diff）
UPDATE public.user_account
   SET email = lower(btrim(email))
 WHERE email IS DISTINCT FROM lower(btrim(email))
   AND lower(btrim(email)) NOT IN (
         SELECT lower(btrim(email)) FROM public.user_account
         GROUP BY lower(btrim(email)) HAVING count(*) > 1
       );

-- ③ 唯一索引：冲突清零才建；冲突未清 → WARNING 延后（防中途 UNIQUE 坠迁移），处置后新迁移补建
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_account GROUP BY lower(btrim(email)) HAVING count(*) > 1) THEN
    RAISE WARNING 'authz_0167_ux_user_email_lower_deferred: 冲突未清,ux_user_email_lower 未建(运营处置后新迁移补建)';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS ux_user_email_lower ON public.user_account (lower(email));
  END IF;
END
$$;
