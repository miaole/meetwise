-- 0092_int_transcript_answer_fact_root.sql
--
-- INT-TRANSCRIPT-00：答案事实根（answer fact root）。
--
-- 这是「评分前置」的承重数据面：面试答案的唯一权威持久化（加密正文源 + 提交回执 +
-- ref-only 评分 job），以及 INT-TRANSCRIPT 自己的删除目标 resolver/sink registry。
--
-- 铁律（与 CLAUDE.md 对齐）：
--   1. 正文只进加密 ciphertext（pgp_sym_encrypt + HMAC body 指纹，非裸 sha256），
--      app_role 永远拿不到 ciphertext 的读权限——读侧只走 SECURITY DEFINER 函数吐
--      watermark（body_hmac/key 版本/epoch/status），绝不吐原文或密文。
--   2. 首包 `accepted_unscored`：模型/评分/RAG/Web/memory/B 端投影副作用 = 0。ref-only
--      job 只引用 artifact，不携带答案正文。
--   3. 删除授权**复用冻结的 PrivacyAuthorizationIssuer**（0091）：本迁移只做 INT-TRANSCRIPT
--      自己的 sink kind 扩展 + begin-erasure + list-claimable + purge，绝不重实现签/验/
--      consume/claim。claim 仍走 0091 的 privacy_authorization_claim_target（sink 无关）。
--   4. 显式状态机（禁布尔汤）：artifact active→fenced→erased、submission
--      accepted_unscored→fenced、job queued→running→done|failed|cancelled；单向 guard
--      在 DB 触发（fenced→active 回放被拒）。
--   5. 四个生产原语：CAS（version 条件更新）、幂等键（UNIQUE(owner,client_submission_key)
--      + ON CONFLICT DO NOTHING）、RLS principal 绑定（FORCE RLS + owner=GUC）、
--      持久有序（erasure request/target 账本由 0047/0091 提供）。
--
-- 与 0093（MEM-00）的协作：两迁移各自「找到并删掉 privacy_deletion_target.sink CHECK →
-- 重加完整枚举」。0092 在 0093 之前跑，故 0093 的重加必须也包含 interview_answer_artifact
-- （已由 INT-TRANSCRIPT 侧通知 MEM builder 同步）。最终枚举 = INT 9 + MEM 7。

-- ── 扩展隐私删除目标 sink 枚举：新增 INT-TRANSCRIPT 答案事实根 sink ─────────────────
-- privacy_deletion_target.sink 的 CHECK 是 0047 内联写的（自动命名 privacy_deletion_target_
-- sink_check）。这里「找到并删掉旧约束 → 重加 INT 完整枚举」。MEM 的 7 个 sink 由 0093 追加。
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname FROM pg_constraint
   WHERE conrelid = 'privacy_deletion_target'::regclass
     AND contype = 'c'
     AND (conname = 'privacy_deletion_target_sink_check'
          OR pg_get_constraintdef(oid) LIKE '%sink%')
   LIMIT 1;
  IF cname IS NULL THEN
    RAISE EXCEPTION 'privacy_deletion_target_sink_check_missing';
  END IF;
  EXECUTE format('ALTER TABLE privacy_deletion_target DROP CONSTRAINT %I', cname);
END $$;

GRANT CREATE ON SCHEMA public TO privacy_api_owner;
ALTER TABLE privacy_deletion_target ADD CONSTRAINT privacy_deletion_target_sink_check
  CHECK (sink IN (
    -- INT-TRANSCRIPT sinks（0047 原有 8 个 + 0092 新增 1 个）
    'checkpoint_rows','interview_job_payload','event','report','vector','redis','oss','langfuse',
    'interview_answer_artifact'
  ));

-- ── 答案提交回执（客户端提交后拿到的持久凭证；不含正文明文）──────────────────────
CREATE TABLE IF NOT EXISTS interview_answer_submission (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_id text NOT NULL,
  state_version bigint NOT NULL CHECK (state_version >= 0),
  client_submission_key text NOT NULL,
  -- HMAC（keyed，非裸 sha256）防「密文旁明文 sha 确认/关联预言机」（与 resume 对齐）。
  canonical_body_hmac text NOT NULL CHECK (canonical_body_hmac ~ '^[a-f0-9]{64}$'),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  status text NOT NULL DEFAULT 'accepted_unscored' CHECK (status IN ('accepted_unscored','fenced')),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- 幂等键：同 owner + 同 client_submission_key 重放返回既有回执；异体（不同正文）由上层比对
  -- canonical_body_hmac 判冲突（DB 只保证键唯一，不保证正文唯一）。
  UNIQUE (owner_user_id, client_submission_key)
);
ALTER TABLE interview_answer_submission ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answer_submission FORCE ROW LEVEL SECURITY;

-- ── 答案正文源（加密 artifact）：唯一权威答案正文，只留密文 + 指纹 + key 版本 ──────
CREATE TABLE IF NOT EXISTS interview_answer_artifact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_id text NOT NULL,
  state_version bigint NOT NULL CHECK (state_version >= 0),
  submission_id uuid NOT NULL REFERENCES interview_answer_submission(id) ON DELETE RESTRICT,
  -- pgp_sym_encrypt 输出（bytea）；明文只在加密的同一事务内以绑定参数出现，绝不落库。
  ciphertext bytea NOT NULL,
  body_hmac text NOT NULL CHECK (body_hmac ~ '^[a-f0-9]{64}$'),
  hmac_key_version integer NOT NULL CHECK (hmac_key_version >= 1),
  enc_key_version integer NOT NULL CHECK (enc_key_version >= 1),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','fenced','erased')),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id)
);
ALTER TABLE interview_answer_artifact ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answer_artifact FORCE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS interview_answer_artifact_owner_interview_state_idx
  ON interview_answer_artifact (owner_user_id, interview_id, state_version);

-- ── ref-only 评分 job：只引用 artifact，绝不携带答案正文（正文只留加密 artifact）────
CREATE TABLE IF NOT EXISTS interview_answer_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_id text NOT NULL,
  state_version bigint NOT NULL CHECK (state_version >= 0),
  artifact_ref uuid NOT NULL REFERENCES interview_answer_artifact(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed','cancelled')),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artifact_ref)
);
ALTER TABLE interview_answer_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answer_job FORCE ROW LEVEL SECURITY;

-- ── INT-TRANSCRIPT 自己的删除目标 resolver（sink='interview_answer_artifact' 的 locator）──
-- 与 MEM 的 resolver 是两套**不可互认**的映射：本表只解析 INT 的 interview_answer_artifact
-- sink，跨域（account_data）的 locator 由 0093 的 MEM resolver 负责。
CREATE TABLE IF NOT EXISTS interview_answer_artifact_target (
  target_id uuid PRIMARY KEY REFERENCES privacy_deletion_target(id) ON DELETE RESTRICT,
  request_id uuid NOT NULL REFERENCES privacy_erasure_request(id) ON DELETE RESTRICT,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE interview_answer_artifact_target ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answer_artifact_target FORCE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS interview_answer_artifact_target_owner_interview_idx
  ON interview_answer_artifact_target (owner_user_id, interview_id);

-- ── grants（原始表访问权不落到 app_role/PUBLIC 之外的读面）──────────────────────────
-- app_role 只写不读（ciphertext/指纹都不可读）；读侧只走下方 SECURITY DEFINER 函数。
REVOKE ALL ON interview_answer_submission, interview_answer_artifact, interview_answer_job FROM PUBLIC;
GRANT INSERT ON interview_answer_submission TO app_role;
GRANT INSERT ON interview_answer_artifact TO app_role;
GRANT INSERT ON interview_answer_job TO app_role;
-- 隐私 API definer（begin-erasure 的 fence UPDATE/INSERT + 读侧 watermark 函数）。
GRANT SELECT, INSERT, UPDATE ON interview_answer_submission, interview_answer_artifact TO privacy_api_owner;
GRANT SELECT, INSERT, UPDATE ON interview_answer_job TO privacy_api_owner;
GRANT SELECT, INSERT ON interview_answer_artifact_target TO privacy_api_owner;
-- 隐私 worker definer（purge 的物理 DELETE + 残留计数 + list-claimable 的 locator 读）。
GRANT SELECT, DELETE ON interview_answer_submission, interview_answer_artifact, interview_answer_job TO privacy_worker_owner;
-- purge 用 `SELECT ... FOR UPDATE` 联表锁定 locator（镜像 0078 的 checkpoint purge），
-- 而 PostgreSQL 的 FOR UPDATE 会额外要求被锁表的 UPDATE 权限——故这里必须 SELECT, UPDATE
--（仅 SELECT 会在 purge 时被 aclchk 拒，报 permission denied for interview_answer_artifact_target）。
GRANT SELECT, UPDATE ON interview_answer_artifact_target TO privacy_worker_owner;

-- ── RLS policies ──────────────────────────────────────────────────────────────
-- 提交表：app_role 只能插入 owner=principal 且 status=accepted_unscored（首包唯一合法态）。
DROP POLICY IF EXISTS interview_answer_submission_app_role ON interview_answer_submission;
CREATE POLICY interview_answer_submission_app_role ON interview_answer_submission
  FOR INSERT TO app_role
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true) AND status = 'accepted_unscored');
DROP POLICY IF EXISTS interview_answer_submission_api_owner ON interview_answer_submission;
CREATE POLICY interview_answer_submission_api_owner ON interview_answer_submission
  FOR ALL TO privacy_api_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_submission_worker_owner ON interview_answer_submission;
CREATE POLICY interview_answer_submission_worker_owner ON interview_answer_submission
  FOR SELECT TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_submission_worker_delete ON interview_answer_submission;
CREATE POLICY interview_answer_submission_worker_delete ON interview_answer_submission
  FOR DELETE TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true)
     AND current_setting('app.privacy_target_id', true) IS NOT NULL);

-- 正文源：app_role 只 INSERT（active 态 + owner 绑定），无 SELECT——ciphertext 永不可读。
DROP POLICY IF EXISTS interview_answer_artifact_app_role ON interview_answer_artifact;
CREATE POLICY interview_answer_artifact_app_role ON interview_answer_artifact
  FOR INSERT TO app_role
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true) AND status = 'active');
DROP POLICY IF EXISTS interview_answer_artifact_api_owner ON interview_answer_artifact;
CREATE POLICY interview_answer_artifact_api_owner ON interview_answer_artifact
  FOR ALL TO privacy_api_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_artifact_worker_owner ON interview_answer_artifact;
CREATE POLICY interview_answer_artifact_worker_owner ON interview_answer_artifact
  FOR SELECT TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_artifact_worker_delete ON interview_answer_artifact;
CREATE POLICY interview_answer_artifact_worker_delete ON interview_answer_artifact
  FOR DELETE TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true)
     AND current_setting('app.privacy_target_id', true) IS NOT NULL);

-- ref-only job：app_role 只 INSERT 且**首包必为 queued**（镜像 submission 的 accepted_unscored
-- 与 artifact 的 active 首态 pin）；worker 物理删。若允许原始 app_role SQL 直接落 done/failed，
-- 就会绕过 queued→running→done|failed|cancelled 状态机，故首态在 RLS 层钉死。
DROP POLICY IF EXISTS interview_answer_job_app_role ON interview_answer_job;
CREATE POLICY interview_answer_job_app_role ON interview_answer_job
  FOR INSERT TO app_role
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true) AND status = 'queued');
DROP POLICY IF EXISTS interview_answer_job_api_owner ON interview_answer_job;
CREATE POLICY interview_answer_job_api_owner ON interview_answer_job
  FOR ALL TO privacy_api_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_job_worker_owner ON interview_answer_job;
CREATE POLICY interview_answer_job_worker_owner ON interview_answer_job
  FOR SELECT TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_job_worker_delete ON interview_answer_job;
CREATE POLICY interview_answer_job_worker_delete ON interview_answer_job
  FOR DELETE TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true)
     AND current_setting('app.privacy_target_id', true) IS NOT NULL);

-- resolver：api_owner 只摸自己的；worker 走 dispatch（USING true，仅供 list-claimable
-- definer 跨 owner 枚举，爆炸半径由「executor 无表级 GRANT + 仅 SECURITY DEFINER 函数可达」收窄）。
DROP POLICY IF EXISTS interview_answer_artifact_target_api_owner ON interview_answer_artifact_target;
CREATE POLICY interview_answer_artifact_target_api_owner ON interview_answer_artifact_target
  FOR ALL TO privacy_api_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_artifact_target_worker_dispatch ON interview_answer_artifact_target;
CREATE POLICY interview_answer_artifact_target_worker_dispatch ON interview_answer_artifact_target
  FOR SELECT TO privacy_worker_owner
  USING (true);
-- purge 用 `SELECT ... FOR UPDATE` 联表锁定 locator（镜像 0078 的 checkpoint purge）。
-- PostgreSQL 对 FOR UPDATE 除 SELECT 策略（可视性）外，还要求一个可用的 UPDATE 策略
-- （行可锁定性）——仅有 worker_dispatch 的 FOR SELECT 时，FOR UPDATE 会静默返回 0 行，
-- 命中 purge 的 NOT FOUND 分支（interview_answer_fact_target_not_found_or_forbidden）。
-- 故补 owner-scoped 的 FOR ALL（镜像 0048 的 privacy_checkpoint_target_worker_owner）；
-- 它与 worker_dispatch 的 SELECT 策略 OR 起来，可视性不变（仍 cross-owner 枚举可达）。
DROP POLICY IF EXISTS interview_answer_artifact_target_worker_owner ON interview_answer_artifact_target;
CREATE POLICY interview_answer_artifact_target_worker_owner ON interview_answer_artifact_target
  FOR ALL TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ── 单向状态 guard（fenced→active 回放 / erased 逆向被拒）──────────────────────────
CREATE OR REPLACE FUNCTION assert_interview_answer_artifact_status_oneway() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF (OLD.status = 'fenced' AND NEW.status = 'active')
     OR (OLD.status = 'erased' AND NEW.status IN ('active','fenced')) THEN
    RAISE EXCEPTION 'interview_answer_artifact_status_oneway' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

ALTER FUNCTION assert_interview_answer_artifact_status_oneway() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_interview_answer_artifact_status_oneway() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS interview_answer_artifact_status_oneway_guard ON interview_answer_artifact;
CREATE TRIGGER interview_answer_artifact_status_oneway_guard
  BEFORE UPDATE OF status ON interview_answer_artifact
  FOR EACH ROW EXECUTE FUNCTION assert_interview_answer_artifact_status_oneway();

CREATE OR REPLACE FUNCTION assert_interview_answer_submission_status_oneway() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status = 'fenced' AND NEW.status = 'accepted_unscored' THEN
    RAISE EXCEPTION 'interview_answer_submission_status_oneway' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION assert_interview_answer_submission_status_oneway() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_interview_answer_submission_status_oneway() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS interview_answer_submission_status_oneway_guard ON interview_answer_submission;
CREATE TRIGGER interview_answer_submission_status_oneway_guard
  BEFORE UPDATE OF status ON interview_answer_submission
  FOR EACH ROW EXECUTE FUNCTION assert_interview_answer_submission_status_oneway();

-- ref-only job 的单向状态机 guard（与 artifact/submission 同源，铁律「显式状态机 + 服务端
-- 单向重校验」）。终态（done/failed/cancelled）是吸收态，running 不得回退 queued。允许
-- queued→running→done|failed|cancelled，以及 fence 直接 queued/running→cancelled。
CREATE OR REPLACE FUNCTION assert_interview_answer_job_status_oneway() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status IN ('done','failed','cancelled') AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'interview_answer_job_status_oneway' USING ERRCODE='23514';
  END IF;
  IF OLD.status = 'running' AND NEW.status = 'queued' THEN
    RAISE EXCEPTION 'interview_answer_job_status_oneway' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION assert_interview_answer_job_status_oneway() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_interview_answer_job_status_oneway() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS interview_answer_job_status_oneway_guard ON interview_answer_job;
CREATE TRIGGER interview_answer_job_status_oneway_guard
  BEFORE UPDATE OF status ON interview_answer_job
  FOR EACH ROW EXECUTE FUNCTION assert_interview_answer_job_status_oneway();

-- ── 面试是否仍可写入答案（answer-artifact 专用 fence 谓词）────────────────────────
-- 与 0058 的 interview_privacy_active 取**同一把 advisory 锁**（meetwise:interview_privacy:）
-- 串行 submit × delete；但查的是 INT-TRANSCRIPT 自己的 resolver（不是 checkpoint resolver）。
-- 状态列表与 0076 重定义后的 interview_privacy_active 完全一致（含 authorization_paused）。
CREATE OR REPLACE FUNCTION interview_answer_fact_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN RETURN false; END IF;

  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || target_interview));

  PERFORM 1
    FROM interview i
   WHERE i.id=target_interview AND i.owner_user_id=principal;
  IF NOT FOUND THEN RETURN false; END IF;

  PERFORM 1
    FROM interview_answer_artifact_target at
    JOIN privacy_erasure_request r ON r.id=at.request_id
   WHERE at.interview_id=target_interview
     AND at.owner_user_id=principal
     AND r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed','authorization_paused')
   LIMIT 1;
  RETURN NOT FOUND;
END $$;
ALTER FUNCTION interview_answer_fact_active(text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION interview_answer_fact_active(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_answer_fact_active(text) TO app_role;

CREATE OR REPLACE FUNCTION assert_interview_answer_fact_active(target_interview text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_answer_fact_active(target_interview) THEN
    -- 与 assert_interview_privacy_active 一致：missing/cross-owner/deleted 折叠为同一错误，不给存在 oracle。
    RAISE EXCEPTION 'interview_answer_fact_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
ALTER FUNCTION assert_interview_answer_fact_active(text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_interview_answer_fact_active(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION assert_interview_answer_fact_active(text) TO app_role;

-- ── 答案正文写入 guard：原始 app_role SQL 也不得在 fence 后重建正文（防御纵深）────
-- 只在 INSERT 上挂（fence 的 UPDATE 是隐私 definer 的内部翻转，不在其内）；故 begin-erasure
-- 在插 locator 之前先 fence，使这内部 UPDATE 仍观察为 active——与 0058 注释同源。
CREATE OR REPLACE FUNCTION enforce_interview_answer_artifact_privacy_active() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  PERFORM assert_interview_answer_fact_active(NEW.interview_id);
  RETURN NEW;
END $$;
ALTER FUNCTION enforce_interview_answer_artifact_privacy_active() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION enforce_interview_answer_artifact_privacy_active() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS interview_answer_artifact_privacy_active_write_guard ON interview_answer_artifact;
CREATE TRIGGER interview_answer_artifact_privacy_active_write_guard
  BEFORE INSERT ON interview_answer_artifact
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_answer_artifact_privacy_active();

-- ── 读侧 watermark（SECURITY DEFINER，绝不吐 ciphertext/原文）────────────────────
CREATE OR REPLACE FUNCTION interview_answer_readback_receipt(p_client_submission_key text)
RETURNS TABLE (submission_id uuid, client_submission_key text, canonical_body_hmac text, privacy_epoch bigint, status text, artifact_id uuid, interview_id text, question_id text, state_version bigint, job_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_client_submission_key IS NULL OR length(p_client_submission_key)=0 THEN RETURN; END IF;
  RETURN QUERY
    SELECT s.id, s.client_submission_key, s.canonical_body_hmac, s.privacy_epoch, s.status, a.id,
           s.interview_id, s.question_id, s.state_version, j.id
      FROM interview_answer_submission s
      LEFT JOIN interview_answer_artifact a ON a.submission_id = s.id
      LEFT JOIN interview_answer_job j ON j.artifact_ref = a.id
     WHERE s.owner_user_id = principal
       AND s.client_submission_key = p_client_submission_key
       AND s.status = 'accepted_unscored';
END $$;
ALTER FUNCTION interview_answer_readback_receipt(text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION interview_answer_readback_receipt(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_answer_readback_receipt(text) TO app_role;

CREATE OR REPLACE FUNCTION interview_answer_view_snapshot(p_interview_id text, p_after_state_version bigint DEFAULT 0)
RETURNS TABLE (question_id text, state_version bigint, body_hmac text, hmac_key_version integer, privacy_epoch bigint, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_interview_id IS NULL OR length(p_interview_id)=0 THEN RETURN; END IF;
  RETURN QUERY
    SELECT a.question_id, a.state_version, a.body_hmac, a.hmac_key_version, a.privacy_epoch, a.status
      FROM interview_answer_artifact a
     WHERE a.owner_user_id = principal
       AND a.interview_id = p_interview_id
       AND a.status = 'active'
       AND a.state_version > p_after_state_version
     ORDER BY a.state_version;
END $$;
ALTER FUNCTION interview_answer_view_snapshot(text,bigint) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION interview_answer_view_snapshot(text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_answer_view_snapshot(text,bigint) TO app_role;

-- ── 非破坏 fence（API 阶段）：创建 answer-artifact 目标 + 活 digest + epoch ───────
CREATE OR REPLACE FUNCTION interview_answer_fact_begin_erasure(
  target_interview text,
  request_key_hash text,
  p_privacy_epoch bigint
) RETURNS TABLE (request_id uuid, request_status text, artifact_target_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  existing privacy_erasure_request%ROWTYPE;
  created_request uuid;
  created_target uuid;
  v_digest text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0
     OR request_key_hash !~ '^[a-f0-9]{64}$' OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1 THEN
    RAISE EXCEPTION 'interview_answer_fact_erasure_invalid' USING ERRCODE='22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || target_interview));
  PERFORM 1 FROM interview i WHERE i.id=target_interview AND i.owner_user_id=principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'interview_answer_fact_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id=principal AND r.idempotency_key_hash=request_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'interview_data' OR existing.subject_id <> target_interview THEN
      RAISE EXCEPTION 'interview_answer_fact_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    -- 幂等键在 `(owner, idempotency_key_hash)` 上全局唯一，且 checkpoint（0058）与本域共用
    -- scope='interview_data'/subject=interviewId。若编排层复用一个 key 先跑 checkpoint 再跑本域，
    -- 此处会命中 checkpoint 建的 request 但查不到 answer-artifact target → created_target=NULL →
    -- 上层 fail-closed 抛 interview_answer_fact_erasure_unavailable（不漏、不伪完成，仅要求两流
    -- 用**不同** key）。这是有意耦合：两条 sink 各自独立 begin-erasure，绝不把对方 target 混入
    -- 本域 target_set_digest。
    SELECT at.target_id INTO created_target
      FROM interview_answer_artifact_target at
     WHERE at.request_id=existing.id AND at.interview_id=target_interview;
    RETURN QUERY SELECT existing.id, existing.status, created_target, true;
    RETURN;
  END IF;

  INSERT INTO privacy_erasure_request(owner_user_id,scope,subject_id,idempotency_key_hash,status)
    VALUES (principal,'interview_data',target_interview,request_key_hash,'requested')
    RETURNING id INTO created_request;

  -- 先 fence 正文/回执/job，再插 locator（否则正文 INSERT guard 会在内部翻转时把 fence 判成
  -- 已封禁，回滚整个 begin-erasure）。与 0058「先清队列、后建 target」的顺序同源。
  UPDATE interview_answer_artifact
     SET status='fenced', version=version+1, updated_at=now()
   WHERE owner_user_id=principal AND interview_id=target_interview AND status='active';
  UPDATE interview_answer_submission
     SET status='fenced', version=version+1, updated_at=now()
   WHERE owner_user_id=principal AND interview_id=target_interview AND status='accepted_unscored';
  UPDATE interview_answer_job
     SET status='cancelled', version=version+1, updated_at=now()
   WHERE owner_user_id=principal AND interview_id=target_interview AND status IN ('queued','running');

  INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status)
    VALUES (
      created_request,
      'interview_answer_artifact',
      encode(hmac(target_interview || ':interview_answer_artifact:' || created_request::text, request_key_hash, 'sha256'),'hex'),
      'pending'
    ) RETURNING id INTO created_target;
  INSERT INTO interview_answer_artifact_target(target_id,request_id,owner_user_id,interview_id)
    VALUES (created_target, created_request, principal, target_interview);

  -- 把「精确目标集 digest + epoch」钉到 request 账本，供冻结 claim 重验（claim 要求两者非 NULL
  -- 且与签名快照逐字节相等；0091 的 issue 函数**不**写 epoch/digest，这里必须补）。
  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO v_digest
    FROM privacy_deletion_target d WHERE d.request_id = created_request;

  UPDATE privacy_erasure_request
     SET status='fenced', privacy_epoch=p_privacy_epoch, target_set_digest=v_digest, updated_at=now(), version=version+1
   WHERE id=created_request AND status='requested';
  RETURN QUERY SELECT created_request,'fenced'::text,created_target,false;
END $$;
ALTER FUNCTION interview_answer_fact_begin_erasure(text,text,bigint) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION interview_answer_fact_begin_erasure(text,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_answer_fact_begin_erasure(text,text,bigint) TO app_role;

-- ── 后台可认领目标（answer-artifact 专用 dispatch feed，镜像 0078）────────────────
CREATE OR REPLACE FUNCTION interview_answer_artifact_list_claimable_targets(
  max_items integer DEFAULT 32
) RETURNS TABLE (target_id uuid, owner_user_id text)
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT at.target_id, at.owner_user_id
    FROM interview_answer_artifact_target at
    JOIN privacy_deletion_target t ON t.id=at.target_id
    JOIN privacy_erasure_request r ON r.id=at.request_id
   WHERE max_items BETWEEN 1 AND 128
     AND r.status IN ('fenced','purging','pending_external')
     AND (t.status='pending' OR (t.status='leased' AND t.lease_expires_at < now()) OR t.status='failed')
   ORDER BY t.created_at, at.target_id
   LIMIT max_items
$$;


GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION interview_answer_artifact_list_claimable_targets(integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION interview_answer_artifact_list_claimable_targets(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION interview_answer_artifact_list_claimable_targets(integer) TO privacy_worker_executor;

-- ── 后台物理删除（answer-artifact 专用 purge，镜像 0078 的 checkpoint purge）──────
CREATE OR REPLACE FUNCTION privacy_purge_answer_artifact_target(
  target uuid,
  token uuid
) RETURNS TABLE (target_id uuid, status text, deleted_count bigint, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  target_row record;
  removed_artifacts bigint := 0;
  removed_submissions bigint := 0;
  removed_jobs bigint := 0;
  remaining bigint := 0;
  final_request_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR token IS NULL THEN
    RAISE EXCEPTION 'interview_answer_fact_purge_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id,t.request_id,t.status,t.lease_token,t.lease_expires_at,t.version,
         at.interview_id,at.owner_user_id,r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN interview_answer_artifact_target at ON at.target_id=t.id
    JOIN privacy_erasure_request r ON r.id=t.request_id
   WHERE t.id=target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'interview_answer_fact_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RAISE EXCEPTION 'interview_answer_fact_target_request_not_active' USING ERRCODE='42501';
  END IF;
  IF target_row.status='erased' THEN
    RETURN QUERY SELECT target_row.id,'erased'::text,0::bigint,target_row.request_status;
    RETURN;
  END IF;
  IF target_row.status <> 'leased' OR target_row.lease_token IS DISTINCT FROM token
     OR target_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'interview_answer_fact_target_lease_lost' USING ERRCODE='42501';
  END IF;

  PERFORM set_config('app.privacy_target_id', target_row.id::text, true);
  PERFORM set_config('app.privacy_lease_token', token::text, true);
  -- 依赖顺序：job→artifact→submission（FK RESTRICT）。
  DELETE FROM interview_answer_job WHERE interview_id=target_row.interview_id AND owner_user_id=principal;
  GET DIAGNOSTICS removed_jobs = ROW_COUNT;
  DELETE FROM interview_answer_artifact WHERE interview_id=target_row.interview_id AND owner_user_id=principal;
  GET DIAGNOSTICS removed_artifacts = ROW_COUNT;
  DELETE FROM interview_answer_submission WHERE interview_id=target_row.interview_id AND owner_user_id=principal;
  GET DIAGNOSTICS removed_submissions = ROW_COUNT;
  SELECT
    (SELECT count(*) FROM interview_answer_artifact WHERE interview_id=target_row.interview_id AND owner_user_id=principal)
    + (SELECT count(*) FROM interview_answer_submission WHERE interview_id=target_row.interview_id AND owner_user_id=principal)
    + (SELECT count(*) FROM interview_answer_job WHERE interview_id=target_row.interview_id AND owner_user_id=principal)
    INTO remaining;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'interview_answer_fact_residual_rows' USING ERRCODE='55000';
  END IF;
  UPDATE privacy_deletion_target AS d
     SET status='erased',deleted_count=removed_artifacts+removed_submissions+removed_jobs,
         receipt_hash=encode(digest(target_row.id::text || ':' || token::text || ':' ||
           (removed_artifacts+removed_submissions+removed_jobs)::text, 'sha256'),'hex'),
         lease_owner=NULL,lease_token=NULL,lease_expires_at=NULL,version=d.version+1,updated_at=now()
   WHERE d.id=target_row.id AND d.status='leased' AND d.lease_token=token AND d.version=target_row.version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'interview_answer_fact_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;
  -- F1 同源最终 CASE：纳入 receipts 判定，绝不因 external_pending/failed_cleanup 未 resolve 而
  -- 伪造 completed（否则命中 0091 no-forge-completed guard 回滚本已完成的物理删除）。
  UPDATE privacy_erasure_request AS r
     SET status=CASE
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status IN ('pending','leased')) THEN 'purging'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='external_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='retention_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='failed_cleanup') THEN 'partial_failed'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='failed') THEN 'partial_failed'
       ELSE 'completed' END,
       version=r.version+1,updated_at=now()
   WHERE r.id=target_row.request_id
   RETURNING r.status INTO final_request_status;
  RETURN QUERY SELECT target_row.id,'erased'::text,removed_artifacts+removed_submissions+removed_jobs,final_request_status;
END $$;
ALTER FUNCTION privacy_purge_answer_artifact_target(uuid,uuid) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION privacy_purge_answer_artifact_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_answer_artifact_target(uuid,uuid) TO privacy_worker_executor;
