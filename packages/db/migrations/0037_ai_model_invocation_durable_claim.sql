-- 0037_ai_model_invocation_durable_claim.sql
--
-- 模型供应商请求不能由一个长事务 advisory lock 承重。此表是调用意图的持久状态机：
-- claimed 可在租约到期后接管（尚未发送）；dispatching/unknown 永不自动重发；
-- succeeded 可安全回放非敏感输出。请求摘要把同一幂等键的语义漂移变成显式错误。

CREATE TABLE IF NOT EXISTS ai_model_invocation (
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

GRANT SELECT, INSERT, UPDATE ON ai_model_invocation TO app_role;
ALTER TABLE ai_model_invocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_invocation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_ai_model_invocation_owner ON ai_model_invocation;
CREATE POLICY p_ai_model_invocation_owner ON ai_model_invocation
  USING (owner_user_id=current_setting('app.principal_user',true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user',true));
