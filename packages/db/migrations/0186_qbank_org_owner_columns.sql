-- 0186_qbank_org_owner_columns.sql — AG39 企业私有题库（修法①+③+④）：qbank 题库平面 owner 维度纯加列 expand-only。
--
-- REQUEST：ai-docs/delivery/harness/ag39-org-qbank-REQUEST.md（pre-exec 双审 BOTH PASS + rev4 复审 PASS + 协调方开工授权）。
-- 蓝本：README「设计决策：题库分层与私有优先（2026-10-12 用户决策）」四条建议之 1/4 + issues-final AG-39 :478-487 修法原文。
--
-- 【迁移号改占勘误（卷内 §0.2-8 占号登记勘误·EXEC 并线后实测）】本刀原卷拟占 0182+0183；并线主线
--   feat/mysql-schema-skeleton @8d1ff99e 后实测：在飞 cost3（line/ag-cost3）已占 0184_ag12_estimator_claim_freeze、
--   在飞 bill4（line/bill4-ledger-list）已占 0185_gateway_billing_ledger_payer（两工作树 ls 亲证·merge @b26d6aeb 后
--   本树 max=0181）。为保链序单调，本刀两迁移改占 **0186+0187**（预留号未应用改号合法·0184 起顺延勿添重号原语义维持）。
--
-- 列语义（README 用户决策原文）：owner_kind ∈ {platform, org}；platform 时 org_id 为空；org 时必填且指向企业。
--   现状全库零 org 实体（§0.2-7：唯一 CREATE TABLE=184 零 org/tenant/company 表·0156「企业」=entitlement_bucket
--   kind 枚举+招聘方 user 维度）——本刀 org_id=格式 CHECK+partial 索引先行（裁决⑤行使·0170 命名约束先例形），
--   FK 目标挂后继 org 实体刀（§3-7 范围外）。org_id 值源=服务端 interview→job_application（recruiter_user_id）→
--   job_posting 信任根链派生（裁决⑦·禁客户端直供）；本迁移只约束格式与一致性，不发明信任根。
--
-- 落表集（裁决①行使=四层同迁移落列）：qbank_source / qbank_chunk / qbank_question / qbank_generation_chunk 投影。
--   qbank_question_chunk 不入落表集（owner 经 question 行 JOIN 承载·question_evidence 函数以 generation_chunk
--   行级 owner 谓词过滤）；qbank_chunk_serving_scope 不入落表集（owner 挂 qbank_chunk 行·与 (ref,tax,scope) 投影
--   维度正交）——qbank-ingest.ts 第六 INSERT :257 因此不在本刀 threading 面（§8-① 附注行使口径）。
--   generation_chunk 投影 PK 不动（0097 :69-72 四列 PK 已唯一决定 owner——ref_id 在 qbank_chunk 为 PK·一 ref 一 owner；
--   本迁移对投影表纯加列，0097 :57-65 additive 扩列先例同形）。
--
-- 存量行零回填：owner_kind NOT NULL DEFAULT 'platform'——现库只有平台公共题库（AG-39 前无 org 行），
--   DEFAULT 即 platform 公共题语义无损；org_id 全 NULL。历史迁移 0001-0185 零字节（镜像纪律只加新迁移）。
--
-- 件③维护面：qbank_org_curator org 维度信任根白名单（#110 形·org_id+user_id 二维·沿 qbank_curator 0013:19-22
--   白名单形+显式拒写先例）。映射表自身读模型 RLS 沿 0013 p_curator_read USING(true)「名单可读」形
--   （rev3 E-B 券+rev4 R2 限定口径：非 qbank 数据面写路径·非 GUC 鉴权根）。写路径=种子/运维发放面
--   （app_role 显式拒写·超级用户/迁移身份 seed）——org 维护面数据写走 executor 通道（零新 SECURITY DEFINER·
--   零新 qbank 数据面写路径 RLS·0066:90-93 doctrine：executable grant is the authorization boundary）。
--
-- 件④来源审计：qbank_served_question_ref 扩 source_bank（裁决④行使=rev2 E3 对照行使：serve 面已全量登记
--   覆盖完备性更优·零净新增写点；session_generated 值由既有 question_issue_provenance.origin='llm_qbank_miss'
--   （0110:101-106）承载·两载体合流三值 platform / org:{org_id} / session_generated 机器可验证）。
--   旧行 DEFAULT 'platform' 语义无损（0162 落地时只有平台公共题库·org 题不存在）。
--
-- 去重 owner 作用域化（rev2 E1·裁决⑥增补）：uq_qsrc_active_hash 全局唯一会把 org 同 content_hash 提议静默
--   映射回平台既有活跃源——替换为 (owner_kind, COALESCE(org_id,''), content_hash) 部分唯一索引（0013:56
--   partial-unique 形·表达式索引使 platform NULL org_id 归一可比）。被拒 hash 不永久占坑语义原样。
-- 幂等形：ADD COLUMN IF NOT EXISTS + DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT + CREATE INDEX IF NOT EXISTS
--   （0170:19-34 同族幂等形·脏库可重放）。

-- ═════════════════════════════════════════════════════════════════════════════
-- ① 四层 owner 列 + 命名 CHECK（0170 形制）+ partial 索引（0170:33-34 先例形）
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE qbank_source ADD COLUMN IF NOT EXISTS owner_kind text NOT NULL DEFAULT 'platform';
ALTER TABLE qbank_source ADD COLUMN IF NOT EXISTS org_id text;
ALTER TABLE qbank_source DROP CONSTRAINT IF EXISTS ck_qbank_source_owner_kind;
ALTER TABLE qbank_source
  ADD CONSTRAINT ck_qbank_source_owner_kind CHECK (owner_kind IN ('platform','org'));
ALTER TABLE qbank_source DROP CONSTRAINT IF EXISTS ck_qbank_source_owner_consistency;
ALTER TABLE qbank_source
  ADD CONSTRAINT ck_qbank_source_owner_consistency CHECK (
    (owner_kind = 'platform' AND org_id IS NULL)
    OR (owner_kind = 'org' AND org_id IS NOT NULL AND char_length(org_id) BETWEEN 1 AND 512)
  );
CREATE INDEX IF NOT EXISTS ix_qbank_source_org
  ON qbank_source (org_id) WHERE owner_kind = 'org';

ALTER TABLE qbank_chunk ADD COLUMN IF NOT EXISTS owner_kind text NOT NULL DEFAULT 'platform';
ALTER TABLE qbank_chunk ADD COLUMN IF NOT EXISTS org_id text;
ALTER TABLE qbank_chunk DROP CONSTRAINT IF EXISTS ck_qbank_chunk_owner_kind;
ALTER TABLE qbank_chunk
  ADD CONSTRAINT ck_qbank_chunk_owner_kind CHECK (owner_kind IN ('platform','org'));
ALTER TABLE qbank_chunk DROP CONSTRAINT IF EXISTS ck_qbank_chunk_owner_consistency;
ALTER TABLE qbank_chunk
  ADD CONSTRAINT ck_qbank_chunk_owner_consistency CHECK (
    (owner_kind = 'platform' AND org_id IS NULL)
    OR (owner_kind = 'org' AND org_id IS NOT NULL AND char_length(org_id) BETWEEN 1 AND 512)
  );
CREATE INDEX IF NOT EXISTS ix_qbank_chunk_org
  ON qbank_chunk (org_id) WHERE owner_kind = 'org';

ALTER TABLE qbank_question ADD COLUMN IF NOT EXISTS owner_kind text NOT NULL DEFAULT 'platform';
ALTER TABLE qbank_question ADD COLUMN IF NOT EXISTS org_id text;
ALTER TABLE qbank_question DROP CONSTRAINT IF EXISTS ck_qbank_question_owner_kind;
ALTER TABLE qbank_question
  ADD CONSTRAINT ck_qbank_question_owner_kind CHECK (owner_kind IN ('platform','org'));
ALTER TABLE qbank_question DROP CONSTRAINT IF EXISTS ck_qbank_question_owner_consistency;
ALTER TABLE qbank_question
  ADD CONSTRAINT ck_qbank_question_owner_consistency CHECK (
    (owner_kind = 'platform' AND org_id IS NULL)
    OR (owner_kind = 'org' AND org_id IS NOT NULL AND char_length(org_id) BETWEEN 1 AND 512)
  );
CREATE INDEX IF NOT EXISTS ix_qbank_question_org
  ON qbank_question (org_id) WHERE owner_kind = 'org';

-- generation_chunk 投影（分区表·ADD COLUMN 经分区模板自动传播·0097 :57-65 additive 先例同形；
-- PK/FK/metadata CHECK 零触——owner 由投影写手从 qbank_chunk 穿链承值，非投影键成分）。
ALTER TABLE qbank_generation_chunk ADD COLUMN IF NOT EXISTS owner_kind text NOT NULL DEFAULT 'platform';
ALTER TABLE qbank_generation_chunk ADD COLUMN IF NOT EXISTS org_id text;
ALTER TABLE qbank_generation_chunk DROP CONSTRAINT IF EXISTS ck_qbank_generation_chunk_owner_kind;
ALTER TABLE qbank_generation_chunk
  ADD CONSTRAINT ck_qbank_generation_chunk_owner_kind CHECK (owner_kind IN ('platform','org'));
ALTER TABLE qbank_generation_chunk DROP CONSTRAINT IF EXISTS ck_qbank_generation_chunk_owner_consistency;
ALTER TABLE qbank_generation_chunk
  ADD CONSTRAINT ck_qbank_generation_chunk_owner_consistency CHECK (
    (owner_kind = 'platform' AND org_id IS NULL)
    OR (owner_kind = 'org' AND org_id IS NOT NULL AND char_length(org_id) BETWEEN 1 AND 512)
  );
CREATE INDEX IF NOT EXISTS ix_qbank_generation_chunk_org
  ON qbank_generation_chunk (org_id) WHERE owner_kind = 'org';

-- ═════════════════════════════════════════════════════════════════════════════
-- ② 去重 owner 作用域化（rev2 E1·0013:56 partial-unique 先例形·表达式归一 platform NULL）
-- ═════════════════════════════════════════════════════════════════════════════

DROP INDEX IF EXISTS uq_qsrc_active_hash;
CREATE UNIQUE INDEX IF NOT EXISTS uq_qsrc_active_hash_scoped
  ON qbank_source (owner_kind, COALESCE(org_id, ''), content_hash) WHERE status <> 'rejected';

-- ═════════════════════════════════════════════════════════════════════════════
-- ③ org 维度信任根白名单（#110 形·沿 qbank_curator 0013:19-28 全同形）
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS qbank_org_curator (
  org_id     text NOT NULL CHECK (char_length(org_id) BETWEEN 1 AND 512),
  user_id    text NOT NULL CHECK (char_length(user_id) BETWEEN 1 AND 512),
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);
GRANT SELECT ON qbank_org_curator TO app_role;
GRANT SELECT ON qbank_org_curator TO qbank_control_executor;   -- org 维护面 curation 校验(isOrgCurator)在 executor 通道内求值
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON qbank_org_curator FROM app_role;   -- 显式拒写:信任根不可自封（0013:24 先例）
ALTER TABLE qbank_org_curator ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_org_curator FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_org_curator_read ON qbank_org_curator;
CREATE POLICY p_org_curator_read ON qbank_org_curator FOR SELECT USING (true);   -- 名单可读(非敏感);写=无授权+无策略=双拒

-- ═════════════════════════════════════════════════════════════════════════════
-- ④ 来源审计载体（裁决④行使：serve 面 source_bank 扩维·三值映射见文件头）
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE qbank_served_question_ref ADD COLUMN IF NOT EXISTS source_bank text NOT NULL DEFAULT 'platform';
ALTER TABLE qbank_served_question_ref DROP CONSTRAINT IF EXISTS ck_qbank_served_question_ref_source_bank;
-- 形注:PG 正则重复计数上限 255(DR_REGREP)——'.{1,512}' 形在行级 CHECK 求值时 2201B 编译炸,故用 LIKE 前缀+长度界同义形。
ALTER TABLE qbank_served_question_ref
  ADD CONSTRAINT ck_qbank_served_question_ref_source_bank CHECK (
    source_bank = 'platform'
    OR (source_bank LIKE 'org:%' AND char_length(source_bank) BETWEEN 5 AND 517)
  );
