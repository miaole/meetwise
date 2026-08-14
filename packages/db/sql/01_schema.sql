-- 内核演示 schema（纯 SQL，经 pg 驱动执行；演示见 packages/kernel/src/demo.ts）
-- 审计 H1-H3/H5 修复：
--  * 所有归属表都带 owner_user_id + ENABLE + FORCE ROW LEVEL SECURITY（连超级用户走 app_role 时也不绕过）
--  * 策略 USING(读) + WITH CHECK(写) 双侧——禁止把 owner 写成别人（改归属=越权搬数据）
--  * 幂等键/trace 主键按 (owner_user_id, key) 作用域——杜绝跨用户复用 key 静默吞 DoS
--  * 业务路径以非 owner 的 app_role 执行（见 demo.ts asPrincipal）；超级用户仅做 setup/seed
DROP TABLE IF EXISTS interview, ai_graph_run, interview_event, interview_question, consumption_record, ai_invocation_trace, ai_model_invocation CASCADE;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_role') THEN
    EXECUTE 'DROP OWNED BY app_role'; EXECUTE 'DROP ROLE app_role';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_gateway_role') THEN
    EXECUTE 'DROP OWNED BY app_gateway_role'; EXECUTE 'DROP ROLE app_gateway_role';
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
  event_key text,
  payload jsonb NOT NULL DEFAULT '{}',
  CONSTRAINT uq_event_seq UNIQUE (stream_key, seq),
  CONSTRAINT uq_event_key UNIQUE (stream_key, event_key)
);
-- 服务端发放的题目身份：/turn 只接受当前 issued question 的 answer identity，绝不把陈旧 tab 的答案喂给新 interrupt。
CREATE TABLE interview_question (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_id text NOT NULL,
  state_version int NOT NULL CHECK (state_version > 0),
  turn int NOT NULL CHECK (turn >= 0),
  question text NOT NULL,
  competency text,
  qkind text,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','queued','answered','cancelled')),
  answer_id text,
  answer_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz,
  PRIMARY KEY (owner_user_id, interview_id, question_id),
  UNIQUE (owner_user_id, interview_id, state_version)
);
CREATE UNIQUE INDEX uq_interview_question_open
  ON interview_question(owner_user_id, interview_id)
  WHERE status IN ('issued','queued');
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
  service text,                          -- 成本可观测:哪个服务(evaluate/ask/report…)
  input_tokens int, output_tokens int,   -- **成本源头真相落自己库**(不只依赖可选 Langfuse;没配 Langfuse 也能对账/计费/预算告警)
  latency_ms int,
  request_id text,                        -- 全链路 reqId(HTTP→worker job→模型调用一跳到底);见迁移 0014
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, idempotency_key)  -- 按 principal 作用域
);
CREATE INDEX IF NOT EXISTS ix_trace_request_id ON ai_invocation_trace (request_id);   -- reqId 反查(定位单次请求全链路)

-- 生产调用网关的持久状态机。基础建库同步当前最小运行模式：所有会真跑
-- `invoke()` 的集成/压力测试都必须有这张表，不能因旧基座漏表而绕开模型关口。
CREATE TABLE ai_model_invocation (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 256),
  request_digest text NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  lease_token uuid,
  lease_expires_at timestamptz,
  status text NOT NULL CHECK (status IN ('claimed','dispatching','succeeded','failed','unknown')),
  error_code text,
  output jsonb,
  replayable boolean NOT NULL DEFAULT true,
  service text,
  input_tokens integer CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens integer CHECK (output_tokens IS NULL OR output_tokens >= 0),
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  request_id text,
  dispatched_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id,idempotency_key),
  CHECK ((status='claimed' AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
      OR (status <> 'claimed')),
  CHECK ((status='succeeded' AND output IS NOT NULL AND completed_at IS NOT NULL)
      OR status <> 'succeeded')
);
CREATE INDEX IF NOT EXISTS ix_ai_model_invocation_unknown
  ON ai_model_invocation(created_at) WHERE status IN ('dispatching','unknown');

-- fail-closed 应用角色（非 owner、无 BYPASSRLS）
CREATE ROLE app_role NOLOGIN;
CREATE ROLE app_gateway_role NOLOGIN;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_role;
-- 删除权服务只删除当前 RLS principal 的简历 OCR 衍生记录；不要把全库 DELETE
-- 授予应用角色。
GRANT DELETE ON ai_invocation_trace, ai_model_invocation TO app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_role;

-- 所有归属表：ENABLE + FORCE RLS，USING + WITH CHECK 双侧，谓词 = owner = 当前 principal
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['interview','ai_graph_run','interview_event','interview_question','consumption_record','ai_invocation_trace','ai_model_invocation'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;

-- 跨 owner 的调度入口:app_gateway_role 没有任何表权限，只能执行这个固定安全定义者函数。
-- 函数在基线阶段先声明，表在后续 sql/ 文件创建；PL/pgSQL 在首次调用时解析，调用时表已存在。
CREATE OR REPLACE FUNCTION gateway_dispatch_owners(p_work text)
RETURNS TABLE(owner_user_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  CASE p_work
    WHEN 'interview' THEN
      RETURN QUERY SELECT DISTINCT j.owner_user_id::text FROM public.interview_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp());
    WHEN 'quiz' THEN
      RETURN QUERY SELECT DISTINCT j.owner_user_id::text FROM public.quiz_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp());
    WHEN 'diagnosis' THEN
      RETURN QUERY SELECT DISTINCT j.owner_user_id::text FROM public.diagnosis_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp());
    WHEN 'report' THEN
      RETURN QUERY SELECT DISTINCT r.owner_user_id::text FROM public.ai_report AS r
        WHERE r.status IN ('queued','failed') OR (r.status='running' AND r.lease_expires_at < clock_timestamp());
    WHEN 'commerce' THEN
      RETURN QUERY SELECT c.owner_user_id::text FROM public.entitlement_consumption AS c
        WHERE c.status='reserved' AND c.lease_expires_at < clock_timestamp()
      UNION
      SELECT o.owner_user_id::text FROM public.commerce_outbox AS o WHERE o.status='pending';
    ELSE
      RAISE EXCEPTION 'gateway_dispatch_unknown_work' USING ERRCODE = '22023';
  END CASE;
END;
$$;
REVOKE ALL ON FUNCTION gateway_dispatch_owners(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_dispatch_owners(text) TO app_gateway_role;
