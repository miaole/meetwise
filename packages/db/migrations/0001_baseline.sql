-- 0001_baseline.sql — 真生产 schema 基线(冻结快照,运行器跑一次+记录+永不重跑→再部署不丢数据)。
-- 来源:sql/01-14 拼接。后续 schema 变更走 0002+ 增量迁移,**勿改本文件**(改→checksum 漂移报错)。

-- ===== 01_schema =====
-- 内核演示 schema（纯 SQL，经 pg 驱动执行；演示见 packages/kernel/src/demo.ts）
-- 审计 H1-H3/H5 修复：
--  * 所有归属表都带 owner_user_id + ENABLE + FORCE ROW LEVEL SECURITY（连超级用户走 app_role 时也不绕过）
--  * 策略 USING(读) + WITH CHECK(写) 双侧——禁止把 owner 写成别人（改归属=越权搬数据）
--  * 幂等键/trace 主键按 (owner_user_id, key) 作用域——杜绝跨用户复用 key 静默吞 DoS
--  * 业务路径以非 owner 的 app_role 执行（见 demo.ts asPrincipal）；超级用户仅做 setup/seed
DROP TABLE IF EXISTS interview, ai_graph_run, interview_event, consumption_record, ai_invocation_trace CASCADE;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_role') THEN
    EXECUTE 'DROP OWNED BY app_role'; EXECUTE 'DROP ROLE app_role';
  END IF;
END $$;

CREATE TABLE interview (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  status text NOT NULL,
  version int NOT NULL DEFAULT 0,
  current_question_index int NOT NULL DEFAULT 0,
  questions jsonb NOT NULL DEFAULT '[]'        -- 押题生成的题目(每次答题凭它重建 mock-interview 图)
);
CREATE TABLE ai_graph_run (
  run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  graph_name text NOT NULL,
  thread_id text NOT NULL,
  owner_user_id text NOT NULL,
  status text NOT NULL,
  version int NOT NULL DEFAULT 0,
  lease_owner text,
  lease_expires_at timestamptz
);
CREATE UNIQUE INDEX uq_active_run ON ai_graph_run (graph_name, thread_id)
  WHERE status IN ('created','active','waiting_user','migrating','paused');
CREATE TABLE interview_event (
  id bigserial PRIMARY KEY,
  owner_user_id text NOT NULL,
  stream_key text NOT NULL,
  seq bigint NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  CONSTRAINT uq_event_seq UNIQUE (stream_key, seq)
);
CREATE TABLE consumption_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  idempotency_key text NOT NULL,
  interview_id text,
  status text NOT NULL DEFAULT 'reserved',
  CONSTRAINT uq_consumption_idem UNIQUE (owner_user_id, idempotency_key)  -- H5：按 principal 作用域
);
CREATE TABLE ai_invocation_trace (
  owner_user_id text NOT NULL,
  idempotency_key text NOT NULL,
  output jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, idempotency_key)  -- 按 principal 作用域
);

-- fail-closed 应用角色（非 owner、无 BYPASSRLS）
CREATE ROLE app_role NOLOGIN;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_role;

-- 所有归属表：ENABLE + FORCE RLS，USING + WITH CHECK 双侧，谓词 = owner = 当前 principal
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['interview','ai_graph_run','interview_event','consumption_record','ai_invocation_trace'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;

-- ===== 02_commerce =====
-- 02_commerce.sql — 共享权益池 + reserve/confirm/release saga + outbox 对账（接 01_schema 之后跑，复用 app_role + RLS 规约）
-- 落已签业务口径（open-decisions / meetwise-pricing-model）：
--   * 共享池：所有 serviceType 同抽一池；池=各桶 available 之和（available = total - reserved - consumed，未过期）
--   * FIFO 先到期先扣：按 expires_at 升序跨桶贪心分配
--   * reserve→confirm→release saga；confirm 支持按比例（降级 1/2）；失败/中止 release 全退
--   * 不丢/不重扣：幂等键按 principal 作用域；桶容量 CHECK + 可用量 CAS 防超卖；confirm/release 幂等
--   * outbox：confirm 落账投 settlement_proposed，对账 sweeper 兜底
DROP TABLE IF EXISTS entitlement_bucket, entitlement_consumption, commerce_outbox, settlement_ledger CASCADE;

-- 共享池的一笔来源桶（gift/trial/paid）。numeric 单位：1 次面试=1.00，降级按比例可落 0.50。
CREATE TABLE entitlement_bucket (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('gift','trial','paid')),
  units_total numeric(12,2) NOT NULL CHECK (units_total >= 0),
  units_reserved numeric(12,2) NOT NULL DEFAULT 0 CHECK (units_reserved >= 0),
  units_consumed numeric(12,2) NOT NULL DEFAULT 0 CHECK (units_consumed >= 0),
  expires_at timestamptz NOT NULL,
  source_order_id text,
  version int NOT NULL DEFAULT 0,
  -- 核心不变量：预留+已耗 不得超过总额（防超卖，DB 层兜底，绕过应用也拦得住）
  CONSTRAINT ck_bucket_capacity CHECK (units_reserved + units_consumed <= units_total)
);
CREATE INDEX ix_bucket_fifo ON entitlement_bucket (owner_user_id, expires_at);

-- 一次消费的 saga 记录。幂等键按 (owner, key) 作用域——双击/重发只算一次。
CREATE TABLE entitlement_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  idempotency_key text NOT NULL,
  service_type text NOT NULL,
  units_requested numeric(12,2) NOT NULL CHECK (units_requested > 0),
  units_settled numeric(12,2),                              -- confirm 时按比例定
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved','confirmed','partial_confirmed','released')),
  allocations jsonb NOT NULL DEFAULT '[]',                  -- [{bucket_id, units}] 预留分布，confirm/release 据此回写
  lease_expires_at timestamptz,                             -- 预留租约：长会话靠心跳续约保住预留；租约过期(=进程崩了)才被对账回收
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_entitlement_consumption_idem UNIQUE (owner_user_id, idempotency_key)
);

-- 结算 outbox：confirm 成功在同一事务投 settlement_proposed。relay 消费者投递下游后置 'relayed'。
-- 注：'relayed'=已交给结算消费者,**不等于业务结算完成**（真实下游结算尚是 STUB,见 commerce.ts reconcile 注释）。
CREATE TABLE commerce_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  kind text NOT NULL,
  consumption_id uuid NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','relayed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_outbox_pending ON commerce_outbox (owner_user_id, status);

-- 结算账本：outbox 消费者的**真实下游副作用**——每笔已 confirm 的消费在此入账一次（业务/营收承认）。
-- UNIQUE(consumption_id) 让 at-least-once outbox + 重跑 = exactly-once 入账（不是 relay 占位 stub）。
CREATE TABLE settlement_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  consumption_id uuid NOT NULL,
  units_settled numeric(12,2) NOT NULL,
  service_type text NOT NULL,
  settled_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_settlement_consumption UNIQUE (consumption_id)
);

-- 业务路径用非 owner app_role + principal 上下文（FORCE RLS 生效）。01_schema 的 GRANT ALL 不覆盖此后新建表，显式补。
GRANT SELECT, INSERT, UPDATE ON entitlement_bucket, entitlement_consumption, commerce_outbox, settlement_ledger TO app_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['entitlement_bucket','entitlement_consumption','commerce_outbox','settlement_ledger'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;

-- ===== 03_resume =====
-- 03_resume.sql — S2 简历摄取：原文加密落库(与结构化分表) + 状态机 + 幂等去重 + RLS。接 01_schema 之后跑。
-- 隐私铁律落库：原文只进**加密 blob**(pgp_sym_encrypt),结构化 profile **永不含原文/PII 明文**,只存脱敏文本 + PII 计数摘要。
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS resume, resume_blob, resume_profile CASCADE;

CREATE TABLE resume (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','ingesting','ingested','failed')),
  content_sha text NOT NULL,                                   -- 原文 sha256,同人同原文去重
  source_kind text NOT NULL DEFAULT 'text',                    -- text|pdf|...（多模态抽取适配器层,本期 text）
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_resume_content UNIQUE (owner_user_id, content_sha),
  CONSTRAINT uq_resume_id_owner UNIQUE (id, owner_user_id)            -- 复合 FK 用：让子表 FK 强制同 owner
);

-- 加密原文：与 profile 物理分表。日志/profile/普通查询都拿不到明文；解密需 key（生产走 KMS）。
-- 复合 FK (resume_id, owner_user_id) → resume：DB 层强制子行 owner == 父行 owner（RI 绕 RLS,故须复合,审计 P1-5）。
CREATE TABLE resume_blob (
  resume_id uuid PRIMARY KEY,
  owner_user_id text NOT NULL,
  ciphertext bytea NOT NULL,
  key_version int NOT NULL DEFAULT 1,                                 -- 加密 key 版本（轮转用,审计 P1-7）
  FOREIGN KEY (resume_id, owner_user_id) REFERENCES resume(id, owner_user_id) ON DELETE CASCADE
);

-- 结构化 profile：脱敏后的 experience/skills/facts + PII 仅计数摘要（无任何明文/掩码值）。
CREATE TABLE resume_profile (
  resume_id uuid PRIMARY KEY,
  owner_user_id text NOT NULL,
  FOREIGN KEY (resume_id, owner_user_id) REFERENCES resume(id, owner_user_id) ON DELETE CASCADE,
  structured jsonb NOT NULL,                                   -- {experience, skills, facts}（已脱敏）
  pii_summary jsonb NOT NULL,                                  -- {phone:n,email:n,idcard:n} 仅计数
  blocked_count int NOT NULL DEFAULT 0,                        -- 被拦的注入行数
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON resume, resume_blob, resume_profile TO app_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['resume','resume_blob','resume_profile'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;

-- ===== 04_report =====
-- 04_report.sql — 报告子图**舱壁**：报告作为独立后台 job,与面试主链路解耦。接 01_schema 之后跑。
-- 失败隔离：报告失败绝不回滚/阻塞 interview（面试结果照样 completed）；报告自带状态机 + 租约 + 重试,可独立恢复。
DROP TABLE IF EXISTS ai_report CASCADE;

CREATE TABLE ai_report (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','ready','failed','quarantined')),
  content jsonb,                                              -- ready 时填
  attempts int NOT NULL DEFAULT 0,
  next_attempt_at timestamptz,                                -- 退避：failed 后到此刻才允许重排（防瞬时故障毫秒内烧光重试次数）
  last_error text,
  lease_owner text,                                           -- 哪个 worker 在跑（防并发双跑）
  lease_expires_at timestamptz,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_report_interview UNIQUE (owner_user_id, interview_id)  -- 一场面试一份报告（enqueue 幂等）
);
CREATE INDEX ix_report_claimable ON ai_report (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON ai_report TO app_role;

ALTER TABLE ai_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_report FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON ai_report
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
-- ===== 05_interview_jobs =====
-- 05_interview_jobs.sql — 面试 job 队列：api 入队(start/answer),worker 消费循环 drain。接 01_schema 之后跑。
-- 进程边界:api 薄(只入队+返回),长编排(图/模型)在 worker(架构铁律)。job 带租约+attempts,崩溃可重领。
DROP TABLE IF EXISTS interview_job CASCADE;

CREATE TABLE interview_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('start','answer')),
  seq int NOT NULL DEFAULT 0,                                 -- 同面试内保序(答题按 seq 消费)
  payload jsonb NOT NULL DEFAULT '{}',                        -- start:{resumeRaw}; answer:{turn, answer}
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  lease_owner text,
  lease_expires_at timestamptz,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_ijob_claim ON interview_job (owner_user_id, status, seq, created_at);

GRANT SELECT, INSERT, UPDATE ON interview_job TO app_role;

ALTER TABLE interview_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_job FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON interview_job
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ===== 06_retrieval =====
-- 06_retrieval.sql — 生产向量库(pgvector HNSW)。题库/用户记忆共用;隐私:**只存向量+引用 id+hash,不存原文 PII**。
-- 接 01_schema 之后跑。dim=512(实测选定)。**C 端定位:owner_user_id RLS 即足**(每用户自己的库)。
-- B 端租户共享题库是未来扩展:届时按 tenant 维度加 membership 谓词(owner 列即扩展点),现在不过度设计。
CREATE EXTENSION IF NOT EXISTS vector;
DROP TABLE IF EXISTS vector_chunk CASCADE;

CREATE TABLE vector_chunk (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,                 -- 用户隔离(RLS)
  kind text NOT NULL CHECK (kind IN ('qbank','memory')),
  ref_id text NOT NULL,                         -- 指回业务实体(题目id / 记忆id)——原文在业务表,这里不放
  content_hash text NOT NULL,                   -- 去重
  embedding vector(512) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, kind, content_hash)
);
CREATE INDEX ix_vchunk_hnsw ON vector_chunk USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ix_vchunk_owner ON vector_chunk (owner_user_id, kind);

GRANT SELECT, INSERT, UPDATE, DELETE ON vector_chunk TO app_role;

ALTER TABLE vector_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_chunk FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON vector_chunk
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ===== 07_memory =====
-- 07_memory.sql — 长期/情景记忆(成长档案)。接 01+06 之后跑。
-- 三层记忆:工作记忆=LangGraph checkpointer;**长期语义记忆=本表(派生事实,向量化进 vector_chunk 语义召回)**;情景=kind='episode'。
-- 隐私:content 是**派生摘要**(如"分布式锁掌握较弱"),非简历原文/PII;RLS 按 owner 隔离。
DROP TABLE IF EXISTS user_memory CASCADE;

CREATE TABLE user_memory (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('skill','weakness','topic','preference','episode')),
  content text NOT NULL,                       -- 派生摘要(非原文 PII)
  salience real NOT NULL DEFAULT 1.0,          -- 重要度(可随时间衰减/强化)
  source_id text,                              -- 来源面试 id(可追溯)
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_umem_owner ON user_memory (owner_user_id, kind);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_memory TO app_role;

ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON user_memory
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ===== 08_assessment =====
-- 08_assessment.sql — 能力评估报告(把面试 eval 结果 → 能力维度+差距)。接 01 后跑。
-- 状态机:pending→ready/failed(显式 enum,审计转移)。RLS owner 隔离。差距维度回写成长档案记忆(user_memory)。
DROP TABLE IF EXISTS assessment_report CASCADE;

CREATE TABLE assessment_report (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','failed')),
  dimensions jsonb NOT NULL DEFAULT '[]',      -- [{dimension, score, gap:bool, evidence:[]}]
  overall int,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, interview_id)
);
CREATE INDEX ix_assess_owner ON assessment_report (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON assessment_report TO app_role;

ALTER TABLE assessment_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_report FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON assessment_report
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ===== 09_auth =====
-- 09_auth.sql — 用户账户(真鉴权)。接 01 后跑。password_hash 只存 scrypt 派生,绝不明文。
-- 仅 auth 服务访问;app_role 经服务读写(查 by email/id)。email 唯一。
DROP TABLE IF EXISTS user_account CASCADE;

CREATE TABLE user_account (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,                 -- scrypt$salt$dk,绝不明文
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  preferences jsonb NOT NULL DEFAULT '{}',     -- 用户设置(语言/通知偏好等)
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_user_email ON user_account (email);

GRANT SELECT, INSERT, UPDATE ON user_account TO app_role;

-- ===== 10_learning =====
-- 10_learning.sql — 学习计划(评估差距 → 学习项)。接 01 后跑。RLS owner 隔离。
DROP TABLE IF EXISTS learning_plan CASCADE;

CREATE TABLE learning_plan (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed')),
  items jsonb NOT NULL DEFAULT '[]',
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, interview_id)
);
CREATE INDEX ix_learn_owner ON learning_plan (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON learning_plan TO app_role;

ALTER TABLE learning_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plan FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON learning_plan
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ===== 11_commerce =====
-- 11_commerce.sql — 支付订单(下单→回调入账)。接 01+02 后跑。
-- 承重铁律:回调**幂等 exactly-once 入账**(CAS status created→paid,重复回调不双扣不双入)。RLS owner 隔离。
DROP TABLE IF EXISTS payment_order CASCADE;

CREATE TABLE payment_order (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  product_id text NOT NULL,
  amount_cents int NOT NULL,
  units numeric NOT NULL,                       -- 购买的额度
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed','refunded')),
  provider_txn text,                            -- 支付方流水号(回调幂等依据)
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_order_owner ON payment_order (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON payment_order TO app_role;

ALTER TABLE payment_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_order FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON payment_order
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ===== 12_career =====
-- 12_career.sql — 职业路径(成长链终点)。接 01 后跑。RLS owner 隔离。
DROP TABLE IF EXISTS career_path CASCADE;
CREATE TABLE career_path (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  readiness text NOT NULL,
  level text NOT NULL,
  milestones jsonb NOT NULL DEFAULT '[]',
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, interview_id)
);
GRANT SELECT, INSERT, UPDATE ON career_path TO app_role;
ALTER TABLE career_path ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_path FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON career_path
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ===== 13_privacy =====
-- 13_privacy.sql — PIPL 合规:同意记录 + 删除权(授 DELETE 给 PII 表)。接 01+03+09 后跑。
-- C 端处理简历 PII,上线硬门槛:可证同意、可导出、可删除。
DROP TABLE IF EXISTS consent_record CASCADE;

CREATE TABLE consent_record (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  purpose text NOT NULL,                         -- 采集目的(resume_processing / interview / ...)
  policy_version text NOT NULL,                  -- 同意时的隐私政策版本(可审计)
  granted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_consent_owner ON consent_record (owner_user_id, purpose);
GRANT SELECT, INSERT ON consent_record TO app_role;
ALTER TABLE consent_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_record FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON consent_record
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- 删除权:授 DELETE 给 PII 表(用户删除自己数据;RLS 限只删己)
GRANT DELETE ON resume_blob, resume_profile, resume TO app_role;

-- ===== 14_notification =====
-- 14_notification.sql — 站内通知(报告就绪/评估完成等)。接 01 后跑。RLS owner 隔离。
DROP TABLE IF EXISTS notification CASCADE;
CREATE TABLE notification (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  kind text NOT NULL,                  -- report_ready / assessment_ready / ...
  payload jsonb NOT NULL DEFAULT '{}',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_notif_owner ON notification (owner_user_id, read, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON notification TO app_role;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON notification
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
