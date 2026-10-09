-- 0152 — RESUME-GROUNDING rev3 G1/G4 最小同意读写面(expand-only):面试个性化用途同意可撤回。
-- 撤回=行删除(G4:停止后续使用;已落 checkpoint/事件不回溯清除,Non-claims 覆盖;
-- #81 全量撤回端点/policy 升版通用化仍归 W5 批 4)。零 schema 变更、零新表新列——
-- 仅补 app_role 对 consent_record 的 DELETE 授权(0001_baseline 建表时只授 SELECT,INSERT);
-- RLS(p_owner)保持 owner 只能删自己的同意行,撤回面零越权。
GRANT DELETE ON consent_record TO app_role;
