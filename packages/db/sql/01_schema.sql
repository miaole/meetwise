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
  service text,                          -- 成本可观测:哪个服务(evaluate/ask/report…)
  input_tokens int, output_tokens int,   -- **成本源头真相落自己库**(不只依赖可选 Langfuse;没配 Langfuse 也能对账/计费/预算告警)
  latency_ms int,
  request_id text,                        -- 全链路 reqId(HTTP→worker job→模型调用一跳到底);见迁移 0014
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, idempotency_key)  -- 按 principal 作用域
);
CREATE INDEX IF NOT EXISTS ix_trace_request_id ON ai_invocation_trace (request_id);   -- reqId 反查(定位单次请求全链路)

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
