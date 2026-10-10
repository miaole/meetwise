-- 0152_resume_soft_delete_fence.sql
--
-- UNSTUB-ERASE rev2 (D6 compliance minimum set · soft-delete first).  This is
-- the resume-track S1 soft-delete foundation:
--   ① `resume.erasure_requested_at` column (tombstone timestamp).
--   ② `privacy_begin_resume_soft_delete(p_owner, p_resume_id)` — the ONLY
--      reviewed write path into the tombstone statuses.  SECURITY DEFINER
--      OWNER privacy_api_owner; tenant scope stays enforced by the FORCE RLS
--      `p_owner` policy through `app.principal_user` (a forged GUC is routing
--      context, not an authorization root — the definer role has no login and
--      cannot be reached directly).  It fences the row (status +
--      erasure_requested_at + privacy_epoch+1) and records one
--      `privacy_erasure_request` (scope='resume_data', deterministic internal
--      idempotency key).  It creates NO deletion targets and performs NO
--      physical purge: the resume claim/purge worker is S2 (registered, not
--      built).  `purgePending` therefore stays true for S1 and must never be
--      reported as a completed physical deletion.
--   ③ 0060 double-intercept release: BOTH pinned checks (epoch immutability
--      :65-67 and the fenced-transition block :71-73) are released ONLY inside
--      the reviewed definer path above.  The trigger becomes SECURITY INVOKER
--      so `current_user` reflects the effective DML role (0070/0071 qbank
--      definer-discrimination precedent):
--        app_role direct write        -> current_user='app_role'            -> pinned (0060 law)
--        definer fence function       -> current_user='privacy_api_owner',
--                                        session_user=<tenant login>        -> released
--        a session connected AS privacy_api_owner (direct connect — the only
--        way this state arises)       -> session_user='privacy_api_owner'   -> pinned
--      SET ROLE wording note (nail erratum fix, comment-only): SET ROLE changes
--      current_user but NEVER session_user.  A "SET ROLE forgery" is therefore
--      NOT caught by the session_user clause — it is prevented upstream:
--      privacy_api_owner is NOLOGIN NOINHERIT (0048) and NO role is granted
--      membership in it, so `SET ROLE privacy_api_owner` fails (42501) for
--      every session.  Granting membership in privacy_api_owner to any
--      login-capable role would defeat this discriminator and is banned (0060
--      law extension).  The session_user clause is defense-in-depth for the
--      direct-connect case.
--      app_role still has NO DELETE privilege (0060 REVOKE untouched) and
--      still cannot write tombstone states directly.

GRANT CREATE ON SCHEMA public TO privacy_api_owner;

ALTER TABLE resume ADD COLUMN IF NOT EXISTS erasure_requested_at timestamptz;

-- Definer read/write face for the reviewed fence function only.  Row visibility
-- is still tenant-scoped by FORCE RLS p_owner (no TO clause => applies to every
-- role) via app.principal_user.  No DELETE grant is created (0060 REVOKE stands).
GRANT SELECT, UPDATE ON resume TO privacy_api_owner;

CREATE OR REPLACE FUNCTION privacy_begin_resume_soft_delete(p_owner text, p_resume_id uuid)
RETURNS TABLE (request_id uuid, resume_id uuid, already_fenced boolean, fenced_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_key text;
  v_request uuid;
  v_existing privacy_erasure_request%ROWTYPE;
  v_fenced_at timestamptz;
  v_epoch bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR principal <> p_owner
     OR p_resume_id IS NULL THEN
    RAISE EXCEPTION 'resume_soft_delete_forbidden' USING ERRCODE='42501';
  END IF;

  -- Deterministic internal idempotency key: one request per (owner, resume),
  -- replaying the same tombstone never multiplies the ledger.
  SELECT encode(digest('resume_soft_delete:' || p_owner || ':' || p_resume_id::text, 'sha256'), 'hex')
    INTO v_key;

  SELECT * INTO v_existing
    FROM privacy_erasure_request r
   WHERE r.owner_user_id = p_owner
     AND r.idempotency_key_hash = v_key
   ORDER BY r.created_at DESC
   LIMIT 1;
  IF FOUND THEN
    IF v_existing.scope <> 'resume_data' OR v_existing.subject_id <> p_resume_id::text THEN
      RAISE EXCEPTION 'resume_soft_delete_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    -- State-idempotent replay: same requestId, no new ledger row.
    RETURN QUERY
      SELECT v_existing.id, p_resume_id, true,
             (SELECT r.erasure_requested_at FROM resume r
               WHERE r.id = p_resume_id AND r.owner_user_id = p_owner);
    RETURN;
  END IF;

  -- Fence exactly one owned, fencible row.  The 0152-revised write guard
  -- releases the fenced transfer + epoch advance for this definer path only.
  UPDATE resume
     SET status='erasure_fenced',
         erasure_requested_at=now(),
         privacy_epoch=privacy_epoch+1
   WHERE id = p_resume_id
     AND owner_user_id = p_owner
     AND status IN ('uploaded','ingesting','ingested','failed')
   RETURNING erasure_requested_at, privacy_epoch INTO v_fenced_at, v_epoch;

  IF NOT FOUND THEN
    -- Lost a concurrent race (another transaction fenced it first) or the row
    -- is missing / cross-owner / not in a fencible state.  Re-check the ledger
    -- so a concurrent double delete collapses to the same 202 shape instead of
    -- surfacing as a false 404; otherwise fail with the opaque 42501 that the
    -- service layer maps to 404 (no existence oracle).
    SELECT * INTO v_existing
      FROM privacy_erasure_request r
     WHERE r.owner_user_id = p_owner
       AND r.idempotency_key_hash = v_key
     ORDER BY r.created_at DESC
     LIMIT 1;
    IF FOUND THEN
      RETURN QUERY
        SELECT v_existing.id, p_resume_id, true,
               (SELECT r.erasure_requested_at FROM resume r
                 WHERE r.id = p_resume_id AND r.owner_user_id = p_owner);
      RETURN;
    END IF;
    RAISE EXCEPTION 'resume_soft_delete_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  INSERT INTO privacy_erasure_request(owner_user_id, scope, subject_id, idempotency_key_hash, status, privacy_epoch)
    VALUES (p_owner, 'resume_data', p_resume_id::text, v_key, 'fenced', v_epoch)
    ON CONFLICT (owner_user_id, idempotency_key_hash) DO NOTHING
    RETURNING id INTO v_request;
  IF v_request IS NULL THEN
    SELECT r.id INTO v_request
      FROM privacy_erasure_request r
     WHERE r.owner_user_id = p_owner AND r.idempotency_key_hash = v_key;
  END IF;

  RETURN QUERY SELECT v_request, p_resume_id, false, v_fenced_at;
END $$;
ALTER FUNCTION privacy_begin_resume_soft_delete(text, uuid) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;

REVOKE ALL ON FUNCTION privacy_begin_resume_soft_delete(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION privacy_begin_resume_soft_delete(text, uuid) TO app_role;

-- ③ 0060 double-intercept release (see file header).  The INSERT branch stays
-- fully pinned for every path: tombstone rows are created by UPDATE only.
CREATE OR REPLACE FUNCTION enforce_resume_tombstone_foundation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  -- Release predicate (rev2 R3): true ONLY inside a SECURITY DEFINER function
  -- owned by privacy_api_owner invoked from a non-owner login.  An invoker
  -- trigger observes the effective DML role, so direct app_role writes keep
  -- current_user='app_role' (pinned) and a session connected AS
  -- privacy_api_owner fails the session_user clause (direct-connect pinned;
  -- SET ROLE forgery is prevented upstream — privacy_api_owner is NOLOGIN
  -- NOINHERIT with zero membership grants, see the file-header SET ROLE note).
  v_privacy_definer_path boolean := current_user = 'privacy_api_owner'
                                AND session_user <> 'privacy_api_owner';
BEGIN
  IF TG_OP='INSERT' THEN
    IF NEW.status IN ('erasure_fenced','erased') OR NEW.privacy_epoch <> 1 THEN
      RAISE EXCEPTION 'resume_privacy_lifecycle_not_available' USING ERRCODE='P0001';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.privacy_epoch IS DISTINCT FROM OLD.privacy_epoch
     AND NOT v_privacy_definer_path THEN
    RAISE EXCEPTION 'resume_privacy_epoch_immutable' USING ERRCODE='P0001';
  END IF;
  IF NEW.content_sha IS DISTINCT FROM OLD.content_sha THEN
    RAISE EXCEPTION 'resume_content_hmac_immutable' USING ERRCODE='P0001';
  END IF;
  IF (OLD.status IN ('erasure_fenced','erased') OR NEW.status IN ('erasure_fenced','erased'))
     AND NOT v_privacy_definer_path THEN
    RAISE EXCEPTION 'resume_privacy_lifecycle_not_available' USING ERRCODE='P0001';
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION enforce_resume_tombstone_foundation() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION enforce_resume_tombstone_foundation() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS resume_tombstone_foundation_write_guard ON resume;
CREATE TRIGGER resume_tombstone_foundation_write_guard
  BEFORE INSERT OR UPDATE ON resume
  FOR EACH ROW EXECUTE FUNCTION enforce_resume_tombstone_foundation();

-- ── DOWN (rollback face · reviewed reverse operations, apply in order) ──────
-- The migration ledger has no automatic down; this section records the exact
-- rollback.  Rolling back requires zero tombstone rows in flight: every resume
-- with status='erasure_fenced' or a non-null erasure_requested_at must first be
-- resolved (S2 executor or reviewed manual restore), otherwise fence semantics
-- are silently lost.
--   DROP TRIGGER IF EXISTS resume_tombstone_foundation_write_guard ON resume;
--   -- re-create the 0060 original SECURITY DEFINER trigger verbatim, then:
--   DROP FUNCTION IF EXISTS privacy_begin_resume_soft_delete(text, uuid);
--   REVOKE SELECT, UPDATE ON resume FROM privacy_api_owner;
--   ALTER TABLE resume DROP COLUMN IF EXISTS erasure_requested_at;
