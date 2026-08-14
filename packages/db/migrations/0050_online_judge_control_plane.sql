-- 0050_online_judge_control_plane.sql
--
-- Online LLM-as-a-Judge is a quality-monitoring side channel.  This migration
-- intentionally stores only opaque HMAC references and scalar state: no
-- answer, audio, resume, prompt, owner/thread/idempotency identifier, or
-- provider endpoint is a permissible column.  Real user material remains
-- fail-closed until an independent consent + redaction packet service exists.
--
-- The HMAC rank is calculated by a dedicated scheduler that holds
-- ONLINE_JUDGE_SAMPLING_SECRET; PostgreSQL receives only the fixed-width rank
-- and atomically closes each lot of ten.  This makes a concurrent or replayed
-- event unable to create a second slot or a second sample.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='online_judge_owner') THEN
    CREATE ROLE online_judge_owner NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='online_judge_scheduler') THEN
    CREATE ROLE online_judge_scheduler NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='online_judge_executor') THEN
    CREATE ROLE online_judge_executor NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO online_judge_owner, online_judge_scheduler, online_judge_executor;

CREATE TABLE IF NOT EXISTS online_judge_policy (
  policy_version text PRIMARY KEY CHECK (policy_version ~ '^[a-z][a-z0-9._-]{2,127}$'),
  status text NOT NULL CHECK (status IN ('triage_only','calibrated','disabled')),
  rubric_version text NOT NULL CHECK (rubric_version ~ '^[a-z][a-z0-9._-]{2,127}$'),
  model_version text NOT NULL CHECK (model_version ~ '^[a-z][a-z0-9._-]{2,127}$'),
  packet_schema_version text NOT NULL CHECK (packet_schema_version ~ '^[a-z][a-z0-9._-]{2,127}$'),
  sampling_key_version text NOT NULL CHECK (sampling_key_version ~ '^[a-z][a-z0-9._-]{2,127}$'),
  max_dispatches_per_day integer NOT NULL CHECK (max_dispatches_per_day >= 0),
  max_dispatches_per_month integer NOT NULL CHECK (max_dispatches_per_month >= 0),
  max_subject_per_feature_day integer NOT NULL DEFAULT 1 CHECK (max_subject_per_feature_day BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  retired_at timestamptz,
  CHECK ((status='disabled' AND retired_at IS NOT NULL) OR (status <> 'disabled' AND retired_at IS NULL))
);

CREATE TABLE IF NOT EXISTS online_judge_stratum_cursor (
  policy_version text NOT NULL REFERENCES online_judge_policy(policy_version) ON DELETE RESTRICT,
  feature text NOT NULL CHECK (feature IN ('agent','rag','scoring','voice','memory','observability')),
  language_group text NOT NULL CHECK (language_group IN ('zh','en','mixed')),
  modality text NOT NULL CHECK (modality IN ('text','asr')),
  risk_bucket text NOT NULL CHECK (risk_bucket IN ('normal','anaphora','low_evidence','injection_handled')),
  current_lot_no bigint NOT NULL DEFAULT 1 CHECK (current_lot_no >= 1),
  PRIMARY KEY (policy_version,feature,language_group,modality,risk_bucket)
);

CREATE TABLE IF NOT EXISTS online_judge_lot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_version text NOT NULL REFERENCES online_judge_policy(policy_version) ON DELETE RESTRICT,
  feature text NOT NULL CHECK (feature IN ('agent','rag','scoring','voice','memory','observability')),
  language_group text NOT NULL CHECK (language_group IN ('zh','en','mixed')),
  modality text NOT NULL CHECK (modality IN ('text','asr')),
  risk_bucket text NOT NULL CHECK (risk_bucket IN ('normal','anaphora','low_evidence','injection_handled')),
  lot_no bigint NOT NULL CHECK (lot_no >= 1),
  eligible_count integer NOT NULL DEFAULT 0 CHECK (eligible_count BETWEEN 0 AND 10),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (policy_version,feature,language_group,modality,risk_bucket,lot_no),
  -- The tenth insert and closure occur in one transaction.  PostgreSQL checks
  -- a non-deferrable row constraint after each UPDATE, so it cannot require
  -- `closed_at` in the intermediate tenth-slot statement; direct table access
  -- is revoked and the reviewed function closes it before COMMIT.
  CHECK (closed_at IS NULL OR eligible_count=10)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_online_judge_lot_one_open
  ON online_judge_lot(policy_version,feature,language_group,modality,risk_bucket)
  WHERE closed_at IS NULL;

CREATE TABLE IF NOT EXISTS online_judge_candidate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_version text NOT NULL REFERENCES online_judge_policy(policy_version) ON DELETE RESTRICT,
  source_attempt_hmac text NOT NULL CHECK (source_attempt_hmac ~ '^[a-f0-9]{64}$'),
  subject_day_hmac text NOT NULL CHECK (subject_day_hmac ~ '^[a-f0-9]{64}$'),
  packet_ref_hmac text NOT NULL CHECK (packet_ref_hmac ~ '^[a-f0-9]{64}$'),
  redaction_receipt_hmac text NOT NULL CHECK (redaction_receipt_hmac ~ '^[a-f0-9]{64}$'),
  source_policy text NOT NULL CHECK (source_policy IN ('synthetic','public_licensed','consented_deidentified')),
  source_license_ref text NOT NULL CHECK (source_license_ref ~ '^[a-f0-9]{64}$'),
  utc_day date NOT NULL,
  feature text NOT NULL CHECK (feature IN ('agent','rag','scoring','voice','memory','observability')),
  language_group text NOT NULL CHECK (language_group IN ('zh','en','mixed')),
  modality text NOT NULL CHECK (modality IN ('text','asr')),
  risk_bucket text NOT NULL CHECK (risk_bucket IN ('normal','anaphora','low_evidence','injection_handled')),
  rank_hmac text NOT NULL CHECK (rank_hmac ~ '^[a-f0-9]{64}$'),
  lot_id uuid NOT NULL REFERENCES online_judge_lot(id) ON DELETE RESTRICT,
  lot_slot smallint NOT NULL CHECK (lot_slot BETWEEN 1 AND 10),
  eligibility_state text NOT NULL DEFAULT 'eligible' CHECK (eligibility_state IN ('eligible','rejected_privacy','revoked')),
  selection_state text NOT NULL DEFAULT 'pending' CHECK (selection_state IN ('pending','lot_closed_unsampled','selected','skipped_budget','skipped_privacy')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (policy_version,source_attempt_hmac),
  UNIQUE (lot_id,lot_slot),
  CHECK (NOT (eligibility_state <> 'eligible' AND selection_state='selected'))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_online_judge_candidate_selected_per_lot
  ON online_judge_candidate(lot_id) WHERE selection_state='selected';
CREATE INDEX IF NOT EXISTS ix_online_judge_candidate_lot_rank
  ON online_judge_candidate(lot_id,rank_hmac,source_attempt_hmac);

CREATE TABLE IF NOT EXISTS online_judge_budget_daily (
  policy_version text NOT NULL REFERENCES online_judge_policy(policy_version) ON DELETE RESTRICT,
  utc_day date NOT NULL,
  reserved_count integer NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  PRIMARY KEY (policy_version,utc_day)
);

CREATE TABLE IF NOT EXISTS online_judge_budget_monthly (
  policy_version text NOT NULL REFERENCES online_judge_policy(policy_version) ON DELETE RESTRICT,
  utc_month date NOT NULL CHECK (utc_month=date_trunc('month',utc_month)::date),
  reserved_count integer NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  PRIMARY KEY (policy_version,utc_month)
);

CREATE TABLE IF NOT EXISTS online_judge_subject_daily (
  policy_version text NOT NULL REFERENCES online_judge_policy(policy_version) ON DELETE RESTRICT,
  feature text NOT NULL CHECK (feature IN ('agent','rag','scoring','voice','memory','observability')),
  utc_day date NOT NULL,
  subject_day_hmac text NOT NULL CHECK (subject_day_hmac ~ '^[a-f0-9]{64}$'),
  reserved_count integer NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  PRIMARY KEY (policy_version,feature,utc_day,subject_day_hmac)
);

CREATE TABLE IF NOT EXISTS online_judge_dispatch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL UNIQUE REFERENCES online_judge_candidate(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','claimed','dispatching','judged','failed','unknown','cancelled')),
  lease_executor_id text,
  lease_token uuid,
  lease_expires_at timestamptz,
  result_code text,
  result_score numeric(5,2),
  provider_receipt_hmac text,
  dispatched_at timestamptz,
  completed_at timestamptz,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK ((status='claimed' AND lease_executor_id IS NOT NULL AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
      OR status <> 'claimed'),
  CHECK ((status IN ('judged','failed','unknown','cancelled') AND completed_at IS NOT NULL)
      OR status NOT IN ('judged','failed','unknown','cancelled')),
  CHECK (result_score IS NULL OR result_score BETWEEN 0 AND 100),
  CHECK (provider_receipt_hmac IS NULL OR provider_receipt_hmac ~ '^[a-f0-9]{64}$')
);
CREATE INDEX IF NOT EXISTS ix_online_judge_dispatch_claimable
  ON online_judge_dispatch(created_at) WHERE status IN ('queued','claimed');

-- Direct application/table access is forbidden.  `online_judge_owner` owns
-- reviewed definer functions only; FORCE RLS also protects against accidental
-- table grants in a future migration.
ALTER TABLE online_judge_policy OWNER TO online_judge_owner;
ALTER TABLE online_judge_stratum_cursor OWNER TO online_judge_owner;
ALTER TABLE online_judge_lot OWNER TO online_judge_owner;
ALTER TABLE online_judge_candidate OWNER TO online_judge_owner;
ALTER TABLE online_judge_budget_daily OWNER TO online_judge_owner;
ALTER TABLE online_judge_budget_monthly OWNER TO online_judge_owner;
ALTER TABLE online_judge_subject_daily OWNER TO online_judge_owner;
ALTER TABLE online_judge_dispatch OWNER TO online_judge_owner;

ALTER TABLE online_judge_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_judge_stratum_cursor ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_judge_lot ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_judge_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_judge_budget_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_judge_budget_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_judge_subject_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_judge_dispatch ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_judge_policy FORCE ROW LEVEL SECURITY;
ALTER TABLE online_judge_stratum_cursor FORCE ROW LEVEL SECURITY;
ALTER TABLE online_judge_lot FORCE ROW LEVEL SECURITY;
ALTER TABLE online_judge_candidate FORCE ROW LEVEL SECURITY;
ALTER TABLE online_judge_budget_daily FORCE ROW LEVEL SECURITY;
ALTER TABLE online_judge_budget_monthly FORCE ROW LEVEL SECURITY;
ALTER TABLE online_judge_subject_daily FORCE ROW LEVEL SECURITY;
ALTER TABLE online_judge_dispatch FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS online_judge_policy_owner ON online_judge_policy;
CREATE POLICY online_judge_policy_owner ON online_judge_policy FOR ALL TO online_judge_owner USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS online_judge_cursor_owner ON online_judge_stratum_cursor;
CREATE POLICY online_judge_cursor_owner ON online_judge_stratum_cursor FOR ALL TO online_judge_owner USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS online_judge_lot_owner ON online_judge_lot;
CREATE POLICY online_judge_lot_owner ON online_judge_lot FOR ALL TO online_judge_owner USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS online_judge_candidate_owner ON online_judge_candidate;
CREATE POLICY online_judge_candidate_owner ON online_judge_candidate FOR ALL TO online_judge_owner USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS online_judge_budget_owner ON online_judge_budget_daily;
CREATE POLICY online_judge_budget_owner ON online_judge_budget_daily FOR ALL TO online_judge_owner USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS online_judge_budget_month_owner ON online_judge_budget_monthly;
CREATE POLICY online_judge_budget_month_owner ON online_judge_budget_monthly FOR ALL TO online_judge_owner USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS online_judge_subject_owner ON online_judge_subject_daily;
CREATE POLICY online_judge_subject_owner ON online_judge_subject_daily FOR ALL TO online_judge_owner USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS online_judge_dispatch_owner ON online_judge_dispatch;
CREATE POLICY online_judge_dispatch_owner ON online_judge_dispatch FOR ALL TO online_judge_owner USING (true) WITH CHECK (true);

REVOKE ALL ON online_judge_policy,online_judge_stratum_cursor,online_judge_lot,online_judge_candidate,
  online_judge_budget_daily,online_judge_budget_monthly,online_judge_subject_daily,online_judge_dispatch FROM PUBLIC,app_role,online_judge_scheduler,online_judge_executor;

-- A policy version is a release artifact, not a mutable knob.  Replacing a
-- budget/rubric/model must create a new version so every lot remains
-- attributable to the exact policy that selected it.
CREATE OR REPLACE FUNCTION online_judge_policy_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'online_judge_policy_immutable' USING ERRCODE='55000';
END $$;
ALTER FUNCTION online_judge_policy_immutable() OWNER TO online_judge_owner;
REVOKE ALL ON FUNCTION online_judge_policy_immutable() FROM PUBLIC,app_role;
DROP TRIGGER IF EXISTS online_judge_policy_no_update ON online_judge_policy;
CREATE TRIGGER online_judge_policy_no_update BEFORE UPDATE ON online_judge_policy
  FOR EACH ROW EXECUTE FUNCTION online_judge_policy_immutable();

CREATE OR REPLACE FUNCTION online_judge_register_candidate(
  p_policy_version text,
  p_source_attempt_hmac text,
  p_subject_day_hmac text,
  p_packet_ref_hmac text,
  p_redaction_receipt_hmac text,
  p_source_policy text,
  p_source_license_ref text,
  p_feature text,
  p_language_group text,
  p_modality text,
  p_risk_bucket text,
  p_utc_day date,
  p_rank_hmac text
) RETURNS TABLE(candidate_id uuid, replayed boolean, eligibility_state text, selection_state text, lot_id uuid, lot_slot smallint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  existing online_judge_candidate%ROWTYPE;
  current_policy online_judge_policy%ROWTYPE;
  cursor_row online_judge_stratum_cursor%ROWTYPE;
  current_lot online_judge_lot%ROWTYPE;
  chosen online_judge_candidate%ROWTYPE;
  used_budget integer;
  used_month_budget integer;
  current_month date := date_trunc('month',p_utc_day)::date;
  used_subject integer;
  selected_ok boolean := false;
BEGIN
  IF p_policy_version !~ '^[a-z][a-z0-9._-]{2,127}$'
     OR p_source_attempt_hmac !~ '^[a-f0-9]{64}$'
     OR p_subject_day_hmac !~ '^[a-f0-9]{64}$'
     OR p_packet_ref_hmac !~ '^[a-f0-9]{64}$'
     OR p_redaction_receipt_hmac !~ '^[a-f0-9]{64}$'
     OR p_source_license_ref !~ '^[a-f0-9]{64}$'
     OR p_rank_hmac !~ '^[a-f0-9]{64}$'
     OR p_feature NOT IN ('agent','rag','scoring','voice','memory','observability')
     OR p_language_group NOT IN ('zh','en','mixed')
     OR p_modality NOT IN ('text','asr')
     OR p_risk_bucket NOT IN ('normal','anaphora','low_evidence','injection_handled')
     OR p_utc_day <> (clock_timestamp() AT TIME ZONE 'UTC')::date THEN
    RAISE EXCEPTION 'online_judge_candidate_invalid' USING ERRCODE='22023';
  END IF;
  -- The independent consent/packet service does not exist yet.  Treating a
  -- caller-supplied string as consent would be a privacy bypass, so real user
  -- material is deliberately rejected rather than conditionally sampled.
  IF p_source_policy NOT IN ('synthetic','public_licensed') THEN
    RAISE EXCEPTION 'online_judge_consent_packet_not_implemented' USING ERRCODE='42501';
  END IF;
  SELECT * INTO current_policy FROM online_judge_policy WHERE policy_version=p_policy_version FOR SHARE;
  IF NOT FOUND OR current_policy.status='disabled' THEN
    RAISE EXCEPTION 'online_judge_policy_not_active' USING ERRCODE='42501';
  END IF;
  SELECT * INTO existing FROM online_judge_candidate
    WHERE policy_version=p_policy_version AND source_attempt_hmac=p_source_attempt_hmac FOR UPDATE;
  IF FOUND THEN
    RETURN QUERY SELECT existing.id,true,existing.eligibility_state,existing.selection_state,existing.lot_id,existing.lot_slot;
    RETURN;
  END IF;

  INSERT INTO online_judge_stratum_cursor(policy_version,feature,language_group,modality,risk_bucket)
    VALUES (p_policy_version,p_feature,p_language_group,p_modality,p_risk_bucket)
    ON CONFLICT DO NOTHING;
  SELECT * INTO cursor_row FROM online_judge_stratum_cursor
    WHERE policy_version=p_policy_version AND feature=p_feature AND language_group=p_language_group
      AND modality=p_modality AND risk_bucket=p_risk_bucket FOR UPDATE;
  -- A duplicate can arrive after the optimistic pre-check and while this
  -- transaction waits for the per-stratum cursor.  Recheck under that cursor
  -- lock before assigning a slot; this is what makes concurrent replay return
  -- the original candidate instead of relying on a unique-violation retry.
  SELECT * INTO existing FROM online_judge_candidate
    WHERE policy_version=p_policy_version AND source_attempt_hmac=p_source_attempt_hmac FOR UPDATE;
  IF FOUND THEN
    RETURN QUERY SELECT existing.id,true,existing.eligibility_state,existing.selection_state,existing.lot_id,existing.lot_slot;
    RETURN;
  END IF;
  SELECT * INTO current_lot FROM online_judge_lot
    WHERE policy_version=p_policy_version AND feature=p_feature AND language_group=p_language_group
      AND modality=p_modality AND risk_bucket=p_risk_bucket AND lot_no=cursor_row.current_lot_no FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO online_judge_lot(policy_version,feature,language_group,modality,risk_bucket,lot_no)
      VALUES (p_policy_version,p_feature,p_language_group,p_modality,p_risk_bucket,cursor_row.current_lot_no)
      RETURNING * INTO current_lot;
  END IF;
  IF current_lot.eligible_count >= 10 OR current_lot.closed_at IS NOT NULL THEN
    RAISE EXCEPTION 'online_judge_cursor_lot_invalid' USING ERRCODE='55000';
  END IF;
  INSERT INTO online_judge_candidate(
    policy_version,source_attempt_hmac,subject_day_hmac,packet_ref_hmac,redaction_receipt_hmac,source_policy,source_license_ref,
    utc_day,feature,language_group,modality,risk_bucket,rank_hmac,lot_id,lot_slot
  ) VALUES (
    p_policy_version,p_source_attempt_hmac,p_subject_day_hmac,p_packet_ref_hmac,p_redaction_receipt_hmac,p_source_policy,p_source_license_ref,
    p_utc_day,p_feature,p_language_group,p_modality,p_risk_bucket,p_rank_hmac,current_lot.id,current_lot.eligible_count+1
  ) RETURNING * INTO existing;
  UPDATE online_judge_lot SET eligible_count=eligible_count+1 WHERE id=current_lot.id RETURNING * INTO current_lot;
  IF current_lot.eligible_count < 10 THEN
    RETURN QUERY SELECT existing.id,false,existing.eligibility_state,existing.selection_state,existing.lot_id,existing.lot_slot;
    RETURN;
  END IF;

  SELECT c.* INTO chosen FROM online_judge_candidate AS c WHERE c.lot_id=current_lot.id AND c.eligibility_state='eligible'
    ORDER BY c.rank_hmac ASC,c.source_attempt_hmac ASC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'online_judge_lot_has_no_eligible_candidate' USING ERRCODE='55000';
  END IF;
  -- Serialize all lots by policy/month, then policy/day, then subject/day.
  -- Every path uses this order, preventing a budget/subject deadlock.
  PERFORM pg_advisory_xact_lock(hashtext('online-judge-month-budget:' || p_policy_version || ':' || current_month::text));
  SELECT reserved_count INTO used_month_budget FROM online_judge_budget_monthly
    WHERE policy_version=p_policy_version AND utc_month=current_month FOR UPDATE;
  PERFORM pg_advisory_xact_lock(hashtext('online-judge-budget:' || p_policy_version || ':' || p_utc_day::text));
  SELECT reserved_count INTO used_budget FROM online_judge_budget_daily
    WHERE policy_version=p_policy_version AND utc_day=p_utc_day FOR UPDATE;
  IF COALESCE(used_month_budget,0) >= current_policy.max_dispatches_per_month
     OR COALESCE(used_budget,0) >= current_policy.max_dispatches_per_day THEN
    UPDATE online_judge_candidate SET selection_state='skipped_budget',updated_at=clock_timestamp() WHERE id=chosen.id;
  ELSE
    INSERT INTO online_judge_budget_monthly(policy_version,utc_month,reserved_count) VALUES (p_policy_version,current_month,1)
      ON CONFLICT(policy_version,utc_month) DO UPDATE SET reserved_count=online_judge_budget_monthly.reserved_count+1;
    INSERT INTO online_judge_budget_daily(policy_version,utc_day,reserved_count) VALUES (p_policy_version,p_utc_day,1)
      ON CONFLICT(policy_version,utc_day) DO UPDATE SET reserved_count=online_judge_budget_daily.reserved_count+1;
    PERFORM pg_advisory_xact_lock(hashtext('online-judge-subject:' || p_policy_version || ':' || p_feature || ':' || p_utc_day::text || ':' || chosen.subject_day_hmac));
    SELECT reserved_count INTO used_subject FROM online_judge_subject_daily
      WHERE policy_version=p_policy_version AND feature=p_feature AND utc_day=p_utc_day AND subject_day_hmac=chosen.subject_day_hmac FOR UPDATE;
    IF COALESCE(used_subject,0) >= current_policy.max_subject_per_feature_day THEN
      -- Do not select a second-ranked candidate: that would make sampling
      -- depend on individual identity and create an unreviewed bias.
      UPDATE online_judge_candidate SET selection_state='skipped_privacy',updated_at=clock_timestamp() WHERE id=chosen.id;
      UPDATE online_judge_budget_monthly SET reserved_count=reserved_count-1 WHERE policy_version=p_policy_version AND utc_month=current_month;
      UPDATE online_judge_budget_daily SET reserved_count=reserved_count-1 WHERE policy_version=p_policy_version AND utc_day=p_utc_day;
    ELSE
      INSERT INTO online_judge_subject_daily(policy_version,feature,utc_day,subject_day_hmac,reserved_count)
        VALUES (p_policy_version,p_feature,p_utc_day,chosen.subject_day_hmac,1)
        ON CONFLICT(policy_version,feature,utc_day,subject_day_hmac) DO UPDATE SET reserved_count=online_judge_subject_daily.reserved_count+1;
      UPDATE online_judge_candidate SET selection_state='selected',updated_at=clock_timestamp() WHERE id=chosen.id;
      INSERT INTO online_judge_dispatch(candidate_id) VALUES (chosen.id);
      selected_ok := true;
    END IF;
  END IF;
  UPDATE online_judge_candidate AS c SET selection_state='lot_closed_unsampled',updated_at=clock_timestamp()
    WHERE c.lot_id=current_lot.id AND c.selection_state='pending';
  UPDATE online_judge_lot SET closed_at=clock_timestamp() WHERE id=current_lot.id;
  UPDATE online_judge_stratum_cursor SET current_lot_no=current_lot_no+1
    WHERE policy_version=p_policy_version AND feature=p_feature AND language_group=p_language_group
      AND modality=p_modality AND risk_bucket=p_risk_bucket;
  SELECT * INTO existing FROM online_judge_candidate WHERE id=existing.id;
  RETURN QUERY SELECT existing.id,false,existing.eligibility_state,existing.selection_state,existing.lot_id,existing.lot_slot;
END $$;

CREATE OR REPLACE FUNCTION online_judge_revoke_candidate(p_policy_version text,p_source_attempt_hmac text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE target online_judge_candidate%ROWTYPE; dispatch_status text;
BEGIN
  SELECT * INTO target FROM online_judge_candidate WHERE policy_version=p_policy_version AND source_attempt_hmac=p_source_attempt_hmac FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT status INTO dispatch_status FROM online_judge_dispatch WHERE candidate_id=target.id FOR UPDATE;
  IF dispatch_status='dispatching' THEN
    RAISE EXCEPTION 'online_judge_revocation_after_external_dispatch' USING ERRCODE='55000';
  END IF;
  UPDATE online_judge_candidate SET eligibility_state='revoked',selection_state='skipped_privacy',updated_at=clock_timestamp() WHERE id=target.id;
  UPDATE online_judge_dispatch SET status='cancelled',completed_at=clock_timestamp(),version=version+1,updated_at=clock_timestamp()
    WHERE candidate_id=target.id AND status IN ('queued','claimed');
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION online_judge_claim_next_dispatch(p_lease_owner text,p_lease_seconds integer)
RETURNS TABLE(dispatch_id uuid,candidate_id uuid,packet_ref_hmac text,lease_token uuid,policy_version text,mode text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE picked online_judge_dispatch%ROWTYPE;
BEGIN
  IF p_lease_owner IS NULL OR length(p_lease_owner) < 3 OR p_lease_seconds NOT BETWEEN 1 AND 300 THEN
    RAISE EXCEPTION 'online_judge_lease_invalid' USING ERRCODE='22023';
  END IF;
  SELECT d.* INTO picked FROM online_judge_dispatch d
    JOIN online_judge_candidate c ON c.id=d.candidate_id
    JOIN online_judge_policy p ON p.policy_version=c.policy_version AND p.status IN ('triage_only','calibrated')
   WHERE c.eligibility_state='eligible' AND (d.status='queued' OR (d.status='claimed' AND d.lease_expires_at < clock_timestamp()))
   ORDER BY d.created_at,d.id FOR UPDATE SKIP LOCKED LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;
  UPDATE online_judge_dispatch SET status='claimed',lease_executor_id=p_lease_owner,lease_token=gen_random_uuid(),
    lease_expires_at=clock_timestamp()+(p_lease_seconds::text || ' seconds')::interval,version=version+1,updated_at=clock_timestamp()
    WHERE id=picked.id RETURNING * INTO picked;
  RETURN QUERY SELECT picked.id,picked.candidate_id,c.packet_ref_hmac,picked.lease_token,c.policy_version,p.status
    FROM online_judge_candidate c JOIN online_judge_policy p ON p.policy_version=c.policy_version WHERE c.id=picked.candidate_id;
END $$;

CREATE OR REPLACE FUNCTION online_judge_mark_dispatching(p_dispatch_id uuid,p_lease_token uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE updated_count integer;
BEGIN
  UPDATE online_judge_dispatch SET status='dispatching',dispatched_at=clock_timestamp(),version=version+1,updated_at=clock_timestamp()
    WHERE id=p_dispatch_id AND status='claimed' AND lease_token=p_lease_token AND lease_expires_at >= clock_timestamp();
  GET DIAGNOSTICS updated_count=ROW_COUNT;
  RETURN updated_count=1;
END $$;

CREATE OR REPLACE FUNCTION online_judge_complete_dispatch(
  p_dispatch_id uuid,p_lease_token uuid,p_terminal_status text,p_result_code text,p_result_score numeric,p_provider_receipt_hmac text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE updated_count integer;
BEGIN
  IF p_terminal_status NOT IN ('judged','failed','unknown')
     OR p_result_code !~ '^[a-z][a-z0-9_]{1,63}$'
     OR p_provider_receipt_hmac IS NOT NULL AND p_provider_receipt_hmac !~ '^[a-f0-9]{64}$'
     OR p_result_score IS NOT NULL AND (p_result_score < 0 OR p_result_score > 100) THEN
    RAISE EXCEPTION 'online_judge_completion_invalid' USING ERRCODE='22023';
  END IF;
  IF p_terminal_status='judged' AND p_provider_receipt_hmac IS NULL THEN
    RAISE EXCEPTION 'online_judge_judged_receipt_required' USING ERRCODE='22023';
  END IF;
  UPDATE online_judge_dispatch SET status=p_terminal_status,result_code=p_result_code,result_score=p_result_score,
    provider_receipt_hmac=p_provider_receipt_hmac,completed_at=clock_timestamp(),version=version+1,updated_at=clock_timestamp()
    WHERE id=p_dispatch_id AND status='dispatching' AND lease_token=p_lease_token;
  GET DIAGNOSTICS updated_count=ROW_COUNT;
  RETURN updated_count=1;
END $$;

ALTER FUNCTION online_judge_register_candidate(text,text,text,text,text,text,text,text,text,text,text,date,text) OWNER TO online_judge_owner;
ALTER FUNCTION online_judge_revoke_candidate(text,text) OWNER TO online_judge_owner;
ALTER FUNCTION online_judge_claim_next_dispatch(text,integer) OWNER TO online_judge_owner;
ALTER FUNCTION online_judge_mark_dispatching(uuid,uuid) OWNER TO online_judge_owner;
ALTER FUNCTION online_judge_complete_dispatch(uuid,uuid,text,text,numeric,text) OWNER TO online_judge_owner;
REVOKE ALL ON FUNCTION online_judge_register_candidate(text,text,text,text,text,text,text,text,text,text,text,date,text) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION online_judge_revoke_candidate(text,text) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION online_judge_claim_next_dispatch(text,integer) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION online_judge_mark_dispatching(uuid,uuid) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION online_judge_complete_dispatch(uuid,uuid,text,text,numeric,text) FROM PUBLIC,app_role;
GRANT EXECUTE ON FUNCTION online_judge_register_candidate(text,text,text,text,text,text,text,text,text,text,text,date,text) TO online_judge_scheduler;
GRANT EXECUTE ON FUNCTION online_judge_revoke_candidate(text,text) TO online_judge_scheduler;
GRANT EXECUTE ON FUNCTION online_judge_claim_next_dispatch(text,integer) TO online_judge_executor;
GRANT EXECUTE ON FUNCTION online_judge_mark_dispatching(uuid,uuid) TO online_judge_executor;
GRANT EXECUTE ON FUNCTION online_judge_complete_dispatch(uuid,uuid,text,text,numeric,text) TO online_judge_executor;
