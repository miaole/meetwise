-- 0150 · DBACL-1 uuidv7() EXECUTE ACL 修复刀（GRANT-only · 最小授权）
--
-- 根因链（三刀互证 · 亲核行号）：
--   * 0073:1342 `ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`
--     （迁移 owner 作用域）。
--   * 0143:14 `CREATE FUNCTION public.uuidv7()` 创建于该 REVOKE 之后，全文件零 GRANT
--     ⇒ pg_proc.proacl 仅 owner（实测 {owner=X/owner}），PUBLIC/app_role/全部
--     SECURITY DEFINER owner 均无 EXECUTE。
--   * 55 表 `DEFAULT uuidv7()`（0143:66+）⇒ 任何受限角色身份的 omit-id INSERT 全部
--     `42501 permission denied for function uuidv7`（生产支付发桶 500 · DBM3-1 P3 实炸）。
--
-- 授权闭集（§3 catalog 机检推导 · EXEC 期 live catalog 双向核 · 非本文件自指）：
--   全迁移 SECURITY DEFINER 函数体含 omit-id INSERT INTO〈55 张 uuidv7-default 表〉
--   → distinct proowner 全集 ∪ TS 侧 SET LOCAL ROLE 受限直接写者（仅 app_role ·
--   principal.ts:949 亲证；qbank/rag 写自家 schema 非 55 表 · gateway 无表权限 ·
--   privacy worker 经 SD）= 恰 8 角色：
--     app_role · privacy_api_owner · privacy_worker_owner · memory_runtime ·
--     memory_summarizer · memory_admission_issuer · scoring_definer_owner · online_judge_owner
--   （推导 SQL + 逐行 owner|function|table 证据入 prove P2 收据）
--
-- 明确剔除（最小授权）：
--   * privacy_guard_owner —— 0140:327 纯 SELECT guard 触发器，零 uuidv7 写。
--   * uuidv7_from_parts —— 0143:41 唯一调用方 = owner 默认池 proof，无受限角色调用。
--   * rag_control_definer / rag_runtime_definer / qbank_control_definer —— 写自家
--     schema，非 55 表写者，推导集之外。
--
-- Ban 落实：仅 GRANT 语句（8 条 · prove P6 语句白名单机检）· 无 GRANT ALL ·
--   uuidv7 函数体/DEFAULT 零字节变化 · 历史迁移 0001-0149 零字节改 · 幂等（GRANT 天然幂等）。

GRANT EXECUTE ON FUNCTION public.uuidv7() TO app_role;
GRANT EXECUTE ON FUNCTION public.uuidv7() TO privacy_api_owner;
GRANT EXECUTE ON FUNCTION public.uuidv7() TO privacy_worker_owner;
GRANT EXECUTE ON FUNCTION public.uuidv7() TO memory_runtime;
GRANT EXECUTE ON FUNCTION public.uuidv7() TO memory_summarizer;
GRANT EXECUTE ON FUNCTION public.uuidv7() TO memory_admission_issuer;
GRANT EXECUTE ON FUNCTION public.uuidv7() TO scoring_definer_owner;
GRANT EXECUTE ON FUNCTION public.uuidv7() TO online_judge_owner;
