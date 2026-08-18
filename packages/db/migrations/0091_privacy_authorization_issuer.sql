-- 0091_privacy_authorization_issuer.sql
--
-- INT-TRANSCRIPT-00: the independent PrivacyAuthorizationIssuer.
--
-- Why a separate authorization root: 0075/0076 paused the forged-GUC public
-- admission path and left every historical request `authorization_paused`.  A
-- reviewed deletion authorization must instead be carried by a short-lived,
-- single-use, ECDSA P-256 signed snapshot (iss=meetwise-privacy-authz-v1 /
-- aud=meetwise-deletion-worker) that the dedicated worker verifies out-of-band
-- and then *consumes exactly once* in the database.  This table is the ledger
-- of that snapshot; the private key never enters SQL, the worker, the browser,
-- or AUTH_SECRET (the signing module lives in packages/domain).
--
-- The request/target ledger gains `privacy_epoch` + `target_set_digest` so the
-- deleter can re-verify, at claim time, that the request still matches the
-- snapshot's bound epoch and exact target set (a target added or removed after
-- signing changes the digest and is rejected).  `privacy_deletion_receipt` is
-- the per-sink receipt whose `external_pending`/`failed_cleanup` kinds must
-- never be forged into `completed` (enforced by the guard trigger below).

-- ── roles ──────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='privacy_issuer') THEN
    CREATE ROLE privacy_issuer NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='privacy_guard_owner') THEN
    CREATE ROLE privacy_guard_owner NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO privacy_issuer, privacy_guard_owner;

-- ── request ledger: epoch + exact target-set digest ───────────────────────

GRANT CREATE ON SCHEMA public TO privacy_api_owner;
ALTER TABLE privacy_erasure_request
  ADD COLUMN IF NOT EXISTS privacy_epoch bigint,
  ADD COLUMN IF NOT EXISTS target_set_digest text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='privacy_erasure_request_privacy_epoch_chk') THEN
    ALTER TABLE privacy_erasure_request
      ADD CONSTRAINT privacy_erasure_request_privacy_epoch_chk CHECK (privacy_epoch IS NULL OR privacy_epoch >= 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='privacy_erasure_request_target_digest_chk') THEN
    ALTER TABLE privacy_erasure_request
      ADD CONSTRAINT privacy_erasure_request_target_digest_chk CHECK (target_set_digest IS NULL OR target_set_digest ~ '^[a-f0-9]{64}$');
  END IF;
END $$;

-- ── authorization snapshot ledger ─────────────────────────────────────────
-- `interview_id` has no FK: the snapshot is a historical authorization receipt
-- that must outlive the (later erased) interview row.  Ownership is checked at
-- issue time; the deleter re-verifies it against the live request at claim time.
CREATE TABLE IF NOT EXISTS privacy_authorization_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jti text NOT NULL UNIQUE,
  issuer_id text NOT NULL,
  key_id text NOT NULL,
  actor text NOT NULL,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('interview_data_erasure','resume_data_erasure','account_data_erasure')),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  target_set_digest text NOT NULL CHECK (target_set_digest ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','consumed')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  consumed_by text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  -- Lifetime bound mirrors domain MAX_PRIVACY_AUTHZ_TTL_SEC (1h): the DB also
  -- refuses an over-long window so a misconfigured issuer cannot mint a long-
  -- lived single-use token.
  CHECK (expires_at > issued_at),
  CHECK (expires_at <= issued_at + interval '1 hour')
);
ALTER TABLE privacy_authorization_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_authorization_snapshot FORCE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS privacy_authorization_snapshot_owner_idx ON privacy_authorization_snapshot (owner_user_id);

-- ── per-sink deletion receipt ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS privacy_deletion_receipt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES privacy_erasure_request(id) ON DELETE RESTRICT,
  target_id uuid NOT NULL REFERENCES privacy_deletion_target(id) ON DELETE RESTRICT,
  receipt_kind text NOT NULL CHECK (receipt_kind IN ('local_erased','retention_pending','external_pending','external_confirmed','failed_cleanup')),
  receipt_hash text NOT NULL,
  recorded_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by text,
  UNIQUE (target_id, receipt_kind)
);
-- 幂等补列（对已运行过 0091 的既有账本同样生效）：external_pending→external_confirmed 的
-- 可审计转换记录由 privacy_resolve_deletion_receipt 写入。
ALTER TABLE privacy_deletion_receipt
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by text;
ALTER TABLE privacy_deletion_receipt ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_deletion_receipt FORCE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS privacy_deletion_receipt_request_idx ON privacy_deletion_receipt (request_id);

-- ── grants (raw table access stays off app_role / PUBLIC) ────────────────
REVOKE ALL ON privacy_authorization_snapshot, privacy_deletion_receipt FROM PUBLIC, app_role;
-- Issuer writes its own owner's snapshot through the reviewed definer; the API
-- definer can also read status.  Deleter reads + CAS-consumes cross-owner via
-- the reviewed consume function (its definer owner gets the dispatch policy).
GRANT SELECT, INSERT ON privacy_authorization_snapshot TO privacy_api_owner;
GRANT SELECT, UPDATE ON privacy_authorization_snapshot TO privacy_worker_owner;
-- Receipts are written by the worker (owner-scoped) and read by the completed
-- guard trigger.  No executor login gets raw receipt-table access.
GRANT SELECT, INSERT, UPDATE ON privacy_deletion_receipt TO privacy_api_owner;
GRANT SELECT, INSERT, UPDATE ON privacy_deletion_receipt TO privacy_worker_owner;
-- The completed guard reads child rows by request_id regardless of the caller's
-- principal GUC; its dedicated definer owner gets SELECT (not write) only, and
-- is reachable exclusively through the guard trigger (no login, no other
-- function), so it cannot be used to expose raw child rows to any caller.
GRANT SELECT ON privacy_deletion_target, privacy_deletion_receipt TO privacy_guard_owner;

-- ── RLS policies ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS privacy_authorization_snapshot_issuer ON privacy_authorization_snapshot;
CREATE POLICY privacy_authorization_snapshot_issuer ON privacy_authorization_snapshot
  FOR ALL TO privacy_api_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
-- Cross-owner dispatch for the reviewed consume function only.  USING(true)/
-- WITH CHECK(true) 的爆炸半径被双重收窄：① executor 登录无任何 snapshot 表级 GRANT，此
-- 策略只能经 SECURITY DEFINER 函数体（owner=privacy_worker_owner）到达；② 该 owner 除
-- consume（issued→consumed CAS）与 M1 单向 trigger 外无其它写该表的函数。二者任一失守，
-- 此开放策略都会变成跨租户读写面——故 M1 的单向 trigger 是第二道约束，不依赖策略收窄。
DROP POLICY IF EXISTS privacy_authorization_snapshot_worker_dispatch ON privacy_authorization_snapshot;
CREATE POLICY privacy_authorization_snapshot_worker_dispatch ON privacy_authorization_snapshot
  FOR ALL TO privacy_worker_owner
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS privacy_deletion_receipt_api_owner ON privacy_deletion_receipt;
CREATE POLICY privacy_deletion_receipt_api_owner ON privacy_deletion_receipt
  FOR ALL TO privacy_api_owner
  USING (EXISTS (SELECT 1 FROM privacy_erasure_request r
    WHERE r.id = privacy_deletion_receipt.request_id
      AND r.owner_user_id = current_setting('app.principal_user', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM privacy_erasure_request r
    WHERE r.id = privacy_deletion_receipt.request_id
      AND r.owner_user_id = current_setting('app.principal_user', true)));
DROP POLICY IF EXISTS privacy_deletion_receipt_worker_owner ON privacy_deletion_receipt;
CREATE POLICY privacy_deletion_receipt_worker_owner ON privacy_deletion_receipt
  FOR ALL TO privacy_worker_owner
  USING (EXISTS (SELECT 1 FROM privacy_erasure_request r
    WHERE r.id = privacy_deletion_receipt.request_id
      AND r.owner_user_id = current_setting('app.principal_user', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM privacy_erasure_request r
    WHERE r.id = privacy_deletion_receipt.request_id
      AND r.owner_user_id = current_setting('app.principal_user', true)));

-- Guard definer owner gets principal-independent child visibility (bounded to
-- its request_id filters inside the trigger body).  No login receives this role.
DROP POLICY IF EXISTS privacy_deletion_target_guard_dispatch ON privacy_deletion_target;
CREATE POLICY privacy_deletion_target_guard_dispatch ON privacy_deletion_target
  FOR SELECT TO privacy_guard_owner
  USING (true);
DROP POLICY IF EXISTS privacy_deletion_receipt_guard_dispatch ON privacy_deletion_receipt;
CREATE POLICY privacy_deletion_receipt_guard_dispatch ON privacy_deletion_receipt
  FOR SELECT TO privacy_guard_owner
  USING (true);

-- ── issuer: record a signed snapshot, owner bound to the authenticated caller ─
-- The caller cannot self-report owner: it is read from app.principal_user, so a
-- privacy_issuer credential can only record a snapshot for the owner it has
-- actually authenticated.  EXECUTE is granted only to privacy_issuer — not
-- app_role (runtime) and not privacy_worker_executor (deleter).
CREATE OR REPLACE FUNCTION privacy_issue_authorization_snapshot(
  p_jti text,
  p_key_id text,
  p_actor text,
  p_interview_id text,
  p_purpose text,
  p_privacy_epoch bigint,
  p_target_set_digest text,
  p_expires_at timestamptz
) RETURNS TABLE (snapshot_id uuid, owner_user_id text, issued_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_owner text;
  v_issued timestamptz;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_jti IS NULL OR length(p_jti)=0
     OR p_key_id IS NULL OR length(p_key_id)=0
     OR p_actor IS NULL OR length(p_actor)=0
     OR p_interview_id IS NULL OR length(p_interview_id)=0
     OR p_purpose NOT IN ('interview_data_erasure','resume_data_erasure','account_data_erasure')
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1
     OR p_target_set_digest IS NULL OR p_target_set_digest !~ '^[a-f0-9]{64}$'
     OR p_expires_at IS NULL OR p_expires_at <= now()
     OR p_expires_at > now() + interval '1 hour' THEN
    RAISE EXCEPTION 'privacy_authorization_issue_invalid' USING ERRCODE='22023';
  END IF;

  -- 00 scope: only interview erasure is issued.  The subject interview must be
  -- owned by the authenticated principal (no cross-owner issuance).
  IF p_purpose = 'interview_data_erasure' THEN
    PERFORM 1 FROM interview i WHERE i.id = p_interview_id AND i.owner_user_id = principal;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'privacy_authorization_not_found_or_forbidden' USING ERRCODE='42501';
    END IF;
  ELSE
    -- Subject validation for other purposes is owned by their governance
    -- modules (MEM-00/account); fail-closed here rather than accept an
    -- unvalidated subject reference.
    RAISE EXCEPTION 'privacy_authorization_purpose_unsupported' USING ERRCODE='22023';
  END IF;

  -- L10：p_actor 仅作审计字段（“谁发起了删除”），不是权威身份根；owner 来自
  -- app.principal_user，权威性由本 definer 的调用方（privacy_issuer，未来独立 provisioning）
  -- 保证。actor 不参与任何租户隔离或 claim 校验（claim 只比对 owner/scope/subject/epoch/digest）。
  INSERT INTO privacy_authorization_snapshot
    (jti, issuer_id, key_id, actor, owner_user_id, interview_id, purpose, privacy_epoch, target_set_digest, status, issued_at, expires_at)
  VALUES
    (p_jti, 'meetwise-privacy-authz-v1', p_key_id, p_actor, principal, p_interview_id, p_purpose, p_privacy_epoch, p_target_set_digest, 'issued', now(), p_expires_at)
  ON CONFLICT (jti) DO NOTHING
  RETURNING privacy_authorization_snapshot.id, privacy_authorization_snapshot.owner_user_id, privacy_authorization_snapshot.issued_at
    INTO v_id, v_owner, v_issued;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'privacy_authorization_jti_conflict' USING ERRCODE='23505';
  END IF;
  RETURN QUERY SELECT v_id, v_owner, v_issued;
END $$;

ALTER FUNCTION privacy_issue_authorization_snapshot(text,text,text,text,text,bigint,text,timestamptz) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION privacy_issue_authorization_snapshot(text,text,text,text,text,bigint,text,timestamptz) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_issue_authorization_snapshot(text,text,text,text,text,bigint,text,timestamptz) TO privacy_issuer;

-- ── deleter: single-use CAS consume of the jti ────────────────────────────
-- FOR UPDATE serializes concurrent consumers: exactly one transitions
-- issued→consumed; the loser observes `consumed` after the lock releases and
-- is rejected.  Unknown/expired/consumed all fail-closed.
-- M4：consume 刻意跨 owner（不按 app.principal_user 绑定）——jti 是 bearer 能力，其唯一
-- 安全属性是单次 CAS 消费；租户(owner)绑定推迟到 claim 阶段（claim 强制 app.principal_user
-- = snapshot.owner_user_id）。因此这里的“安全边界”是单次性，不是租户隔离。
CREATE OR REPLACE FUNCTION privacy_consume_authorization_snapshot(
  p_jti text,
  p_worker text
) RETURNS TABLE (
  snapshot_id uuid, owner_user_id text, interview_id text, purpose text,
  privacy_epoch bigint, target_set_digest text, issued_at timestamptz, expires_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  snap privacy_authorization_snapshot%ROWTYPE;
BEGIN
  IF p_jti IS NULL OR length(p_jti)=0 OR p_worker IS NULL OR length(p_worker)=0 THEN
    RAISE EXCEPTION 'privacy_authorization_consume_invalid' USING ERRCODE='22023';
  END IF;
  SELECT * INTO snap FROM privacy_authorization_snapshot
   WHERE privacy_authorization_snapshot.jti = p_jti FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_found' USING ERRCODE='42501';
  END IF;
  -- M6：issuer_id 是 SQL 侧第三份拷贝（另两份在 packages/domain 与 packages/contracts 的
  -- PRIVACY_AUTHZ_ISSUER 常量）。consume/claim 就地校验，防有人只改 issue 的 INSERT 字面量
  -- 造成三份拷贝静默漂移（跨侧 test pin 覆盖 TS 侧两处，此处覆盖 SQL 侧一处）。
  IF snap.issuer_id <> 'meetwise-privacy-authz-v1' THEN
    RAISE EXCEPTION 'privacy_authorization_issuer_mismatch' USING ERRCODE='42501';
  END IF;
  IF snap.status = 'consumed' THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_already_consumed' USING ERRCODE='40901';
  END IF;
  IF snap.expires_at <= now() THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_expired' USING ERRCODE='40901';
  END IF;
  UPDATE privacy_authorization_snapshot
     SET status='consumed', consumed_at=now(), consumed_by=p_worker, version=version+1
   WHERE id = snap.id AND status = 'issued';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_consume_cas_lost' USING ERRCODE='40901';
  END IF;
  RETURN QUERY SELECT snap.id, snap.owner_user_id, snap.interview_id, snap.purpose,
    snap.privacy_epoch, snap.target_set_digest, snap.issued_at, snap.expires_at;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_consume_authorization_snapshot(text,text) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_consume_authorization_snapshot(text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_consume_authorization_snapshot(text,text) TO privacy_worker_executor;

-- ── deleter: constrained claim of a target under a consumed snapshot ──────
-- Re-verifies, from the ledger (never from caller-supplied fields): the
-- snapshot is consumed + unexpired, the parent request's owner/scope/subject/
-- epoch/digest match the snapshot, and the live target set still hashes to the
-- stored digest.  Then it leases exactly like the checkpoint claim.
-- M12 返回语义：安全违规（未消费/过期/owner/scope/subject/epoch/digest/活漂移）一律 RAISE
-- fail-closed；业务不可租（父请求非推进态/已被租/已 erased）只返回空结果集（NULL），不抛。
CREATE OR REPLACE FUNCTION privacy_authorization_claim_target(
  p_jti text,
  p_target uuid,
  p_worker text,
  p_lease_seconds integer DEFAULT 60
) RETURNS TABLE (target_id uuid, lease_token uuid, status text, attempt integer)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  snap privacy_authorization_snapshot%ROWTYPE;
  target_row record;
  live_digest text;
  token uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_jti IS NULL OR length(p_jti)=0 OR p_target IS NULL OR p_worker IS NULL OR length(p_worker)=0
     OR p_lease_seconds < 5 OR p_lease_seconds > 600 THEN
    RAISE EXCEPTION 'privacy_authorization_claim_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO snap FROM privacy_authorization_snapshot
   WHERE privacy_authorization_snapshot.jti = p_jti FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_found' USING ERRCODE='42501';
  END IF;
  -- M6：与 consume 同源的 SQL 侧 issuer_id 第三份拷贝 pin（防静默漂移，fail-closed）。
  IF snap.issuer_id <> 'meetwise-privacy-authz-v1' THEN
    RAISE EXCEPTION 'privacy_authorization_issuer_mismatch' USING ERRCODE='42501';
  END IF;
  IF snap.status <> 'consumed' THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_consumed' USING ERRCODE='42501';
  END IF;
  IF snap.expires_at <= now() THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_expired' USING ERRCODE='40901';
  END IF;
  -- The worker's tenant principal must match the snapshot's bound owner.  The
  -- owner value itself comes from the signed + DB-verified ledger, never from
  -- the caller; a worker that sets the wrong principal simply cannot exercise
  -- this snapshot (owner_mismatch).
  IF snap.owner_user_id IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'privacy_authorization_owner_mismatch' USING ERRCODE='42501';
  END IF;

  SELECT t.*, r.owner_user_id AS request_owner, r.scope, r.subject_id,
         r.privacy_epoch AS request_epoch, r.target_set_digest AS request_digest,
         r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  IF target_row.request_owner IS DISTINCT FROM snap.owner_user_id
     OR target_row.request_owner IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'privacy_authorization_owner_mismatch' USING ERRCODE='42501';
  END IF;
  IF NOT (snap.purpose = 'interview_data_erasure' AND target_row.scope = 'interview_data') THEN
    RAISE EXCEPTION 'privacy_authorization_scope_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.subject_id IS DISTINCT FROM snap.interview_id THEN
    RAISE EXCEPTION 'privacy_authorization_subject_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.request_epoch IS NULL OR target_row.request_epoch <> snap.privacy_epoch THEN
    RAISE EXCEPTION 'privacy_authorization_epoch_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.request_digest IS NULL OR target_row.request_digest <> snap.target_set_digest THEN
    RAISE EXCEPTION 'privacy_authorization_digest_mismatch' USING ERRCODE='42501';
  END IF;

  -- Second line of defence: recompute the digest from the live target set.  If
  -- a target was added or removed after signing, the stored digest no longer
  -- matches and the claim is rejected.
  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO live_digest
    FROM privacy_deletion_target d
   WHERE d.request_id = target_row.request_id;
  IF live_digest IS DISTINCT FROM target_row.request_digest THEN
    RAISE EXCEPTION 'privacy_authorization_target_drift' USING ERRCODE='42501';
  END IF;

  -- Parent request must be in an active (re-authorizable) state.  Legacy
  -- authorization_paused rows cannot be claimed under the new path (see 0078).
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RETURN;
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, target_row.lease_token, target_row.status, target_row.attempts;
    RETURN;
  END IF;
  IF target_row.status = 'leased' AND target_row.lease_expires_at >= now() THEN
    RETURN;
  END IF;
  IF target_row.status NOT IN ('pending','leased','failed') THEN
    RETURN;
  END IF;

  token := gen_random_uuid();
  UPDATE privacy_deletion_target AS d
     SET status='leased', lease_owner=p_worker, lease_token=token,
         lease_expires_at=now()+(p_lease_seconds||' seconds')::interval,
         attempts=d.attempts+1, version=d.version+1, updated_at=now(), last_error_code=NULL
   WHERE d.id = target_row.id AND d.version = target_row.version
   RETURNING d.id, d.lease_token, d.status, d.attempts INTO target_id, lease_token, status, attempt;
  IF NOT FOUND THEN RETURN; END IF;
  RETURN NEXT;
END $$;
ALTER FUNCTION privacy_authorization_claim_target(text,uuid,text,integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_authorization_claim_target(text,uuid,text,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_authorization_claim_target(text,uuid,text,integer) TO privacy_worker_executor;

-- ── per-sink receipt write (owner-scoped, idempotent per target+kind) ──────
CREATE OR REPLACE FUNCTION privacy_record_deletion_receipt(
  p_target uuid,
  p_receipt_kind text,
  p_receipt_hash text,
  p_recorded_by text
) RETURNS TABLE (receipt_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_request uuid;
  v_id uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_target IS NULL
     OR p_receipt_kind NOT IN ('local_erased','retention_pending','external_pending','external_confirmed','failed_cleanup')
     OR p_receipt_hash IS NULL OR length(p_receipt_hash)=0 THEN
    RAISE EXCEPTION 'privacy_receipt_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.request_id INTO v_request
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target AND r.owner_user_id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_receipt_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  INSERT INTO privacy_deletion_receipt(request_id, target_id, receipt_kind, receipt_hash, recorded_by)
  VALUES (v_request, p_target, p_receipt_kind, p_receipt_hash, p_recorded_by)
  ON CONFLICT (target_id, receipt_kind) DO UPDATE
    SET receipt_hash = EXCLUDED.receipt_hash, recorded_by = EXCLUDED.recorded_by
  RETURNING id INTO v_id;
  RETURN QUERY SELECT v_id;
END $$;
ALTER FUNCTION privacy_record_deletion_receipt(uuid,text,text,text) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_record_deletion_receipt(uuid,text,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_record_deletion_receipt(uuid,text,text,text) TO privacy_worker_executor;

-- ── deleter: resolve an external_pending receipt → external_confirmed ──────
-- F1 解死锁出口：外部系统确认删除后，把 external_pending 收据单向推进到
-- external_confirmed（记录 resolved_at/resolved_by，可审计），并在全部 target 已 erased
-- 且无 external_pending/failed_cleanup 残留时，重估把请求从 pending_external 推进到
-- completed（该 UPDATE 会再经 guard 校验，故不能伪造 completed）。仅 external_pending 可
-- 被解析；无 external_pending 收据或其它 kind 一律 fail-closed。
CREATE OR REPLACE FUNCTION privacy_resolve_deletion_receipt(
  p_target uuid,
  p_recorded_by text
) RETURNS TABLE (receipt_id uuid, receipt_kind text, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_request uuid;
  receipt_row record;
  new_request_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_target IS NULL
     OR p_recorded_by IS NULL OR length(p_recorded_by)=0 THEN
    RAISE EXCEPTION 'privacy_authorization_resolve_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.request_id INTO v_request
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target AND r.owner_user_id = principal
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_resolve_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  -- 表别名 rc 显式限定列：receipt_row 是 record 变量，其字段 receipt_kind 与表列同名，
  -- 裸 `receipt_kind` 在 plpgsql 里会触发 42702 歧义（既可能指表列又可能指 record 字段）。
  SELECT rc.* INTO receipt_row FROM privacy_deletion_receipt rc
   WHERE rc.target_id = p_target AND rc.receipt_kind = 'external_pending' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_receipt_not_pending' USING ERRCODE='40901';
  END IF;
  UPDATE privacy_deletion_receipt rc
     SET receipt_kind='external_confirmed', resolved_at=now(), resolved_by=p_recorded_by
   WHERE rc.id = receipt_row.id;

  -- 解析后重估：全部 target 已 erased 且无 external_pending/failed_cleanup 残留，且请求
  -- 仍处非终态 → 推进 completed；否则保持现状（等剩余 sink）。
  IF NOT EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=v_request AND t.status <> 'erased')
     AND NOT EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=v_request AND rc.receipt_kind IN ('external_pending','failed_cleanup')) THEN
    UPDATE privacy_erasure_request
       SET status='completed', version=version+1, updated_at=now()
     WHERE id=v_request AND status IN ('fenced','purging','pending_external')
     RETURNING status INTO new_request_status;
  END IF;
  IF new_request_status IS NULL THEN
    SELECT status INTO new_request_status FROM privacy_erasure_request WHERE id=v_request;
  END IF;
  RETURN QUERY SELECT receipt_row.id, 'external_confirmed'::text, new_request_status;
END $$;
ALTER FUNCTION privacy_resolve_deletion_receipt(uuid,text) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION privacy_resolve_deletion_receipt(uuid,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_resolve_deletion_receipt(uuid,text) TO privacy_worker_executor;

-- ── no-forge-completed guard ──────────────────────────────────────────────
-- A request may only transition to `completed` when every target is `erased`
-- and no `external_pending`/`failed_cleanup` receipt exists.  This makes the
-- "pending_external / failed_cleanup must never be forged into completed"
-- invariant a database constraint, not a caller convention.  The guard reads
-- child rows under its own principal-independent SELECT policy, so it stays
-- correct even if a buggy caller forgets app.principal_user — it filters solely
-- by NEW.id, the request that was itself authorized for this UPDATE.
CREATE OR REPLACE FUNCTION assert_privacy_erasure_request_completed_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  -- M2：对 INSERT 与 UPDATE 都生效（此前仅 BEFORE UPDATE，直插 completed 可绕过）。
  -- TG_OP='INSERT' 时 OLD 未赋值，故用 TG_OP 判定而非依赖 OLD.status。
  IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    -- M3：零 target 的 completed 是真空真值，必须拒绝（一个删除请求至少一个 target）。
    IF NOT EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id = NEW.id) THEN
      RAISE EXCEPTION 'privacy_erasure_request_zero_targets' USING ERRCODE='55000';
    END IF;
    IF EXISTS (SELECT 1 FROM privacy_deletion_target t
                WHERE t.request_id = NEW.id AND t.status <> 'erased') THEN
      RAISE EXCEPTION 'privacy_erasure_request_incomplete_targets' USING ERRCODE='55000';
    END IF;
    IF EXISTS (SELECT 1 FROM privacy_deletion_receipt rc
                WHERE rc.request_id = NEW.id
                  AND rc.receipt_kind IN ('external_pending','failed_cleanup')) THEN
      RAISE EXCEPTION 'privacy_erasure_request_external_unresolved' USING ERRCODE='55000';
    END IF;
  END IF;
  RETURN NEW;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_guard_owner;
ALTER FUNCTION assert_privacy_erasure_request_completed_guard() OWNER TO privacy_guard_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_guard_owner;


REVOKE ALL ON FUNCTION assert_privacy_erasure_request_completed_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS privacy_erasure_request_completed_guard ON privacy_erasure_request;
CREATE TRIGGER privacy_erasure_request_completed_guard
  BEFORE INSERT OR UPDATE ON privacy_erasure_request
  FOR EACH ROW EXECUTE FUNCTION assert_privacy_erasure_request_completed_guard();

-- ── snapshot status one-way guard (M1) ────────────────────────────────────
-- 函数体 CAS 是正确性第一道；这里是约束级第二道：即使某个 privacy_worker_owner definer
-- 函数有 bug 想把 consumed→issued 回滚重放，也被拒。纯 OLD/NEW 判定、无表访问，故不需要
-- SECURITY DEFINER 或额外 GRANT（trigger 不参与 EXECUTE 授权）。
CREATE OR REPLACE FUNCTION assert_privacy_authorization_snapshot_status_oneway() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status = 'consumed' AND NEW.status = 'issued' THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_replay_forbidden' USING ERRCODE='55000';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS privacy_authorization_snapshot_status_oneway_guard ON privacy_authorization_snapshot;
CREATE TRIGGER privacy_authorization_snapshot_status_oneway_guard
  BEFORE UPDATE ON privacy_authorization_snapshot
  FOR EACH ROW EXECUTE FUNCTION assert_privacy_authorization_snapshot_status_oneway();

-- The runtime login can never become the issuer or the deleter executor through
-- membership drift (mirror 0048's final REVOKE for the worker).
REVOKE privacy_issuer, privacy_worker_executor FROM app_role;
