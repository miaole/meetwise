-- 0236_privacy_signer_attach.sql — 云前软件签发接线（additive）
-- 不改 0091 / 0096 / 0141 的已应用字节。
-- consume 只加给 privacy_issuer，claim / purge 仍只给 privacy_worker_executor。
-- 不把 privacy_issuer 授给任何登录角色（身份门要求可冒充成员数为 0）。

GRANT EXECUTE ON FUNCTION privacy_consume_authorization_snapshot(text,text) TO privacy_issuer;

CREATE OR REPLACE FUNCTION privacy_attach_external_retention_pending(p_request_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  req privacy_erasure_request%ROWTYPE;
  sink_name text;
  v_digest text;
BEGIN
  IF principal IS NULL OR length(principal) = 0 THEN
    RAISE EXCEPTION 'privacy_attach_principal_missing' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO req FROM privacy_erasure_request WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR req.owner_user_id <> principal THEN
    RAISE EXCEPTION 'privacy_attach_request_denied' USING ERRCODE = '42501';
  END IF;
  IF req.status NOT IN ('fenced', 'purging', 'pending_external') THEN
    RAISE EXCEPTION 'privacy_attach_request_not_live' USING ERRCODE = '42501';
  END IF;
  FOREACH sink_name IN ARRAY ARRAY['oss', 'redis', 'langfuse'] LOOP
    INSERT INTO privacy_deletion_target(request_id, sink, resource_hmac, status)
    VALUES (
      req.id,
      sink_name,
      encode(hmac(req.subject_id || ':' || sink_name || ':' || req.id::text, req.idempotency_key_hash, 'sha256'), 'hex'),
      'retention_pending'
    )
    ON CONFLICT (request_id, sink, resource_hmac) DO NOTHING;
  END LOOP;
  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO v_digest
    FROM privacy_deletion_target d
   WHERE d.request_id = req.id;
  IF v_digest IS NULL OR v_digest !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'privacy_attach_digest_invalid' USING ERRCODE = '22023';
  END IF;
  UPDATE privacy_erasure_request
     SET target_set_digest = v_digest, updated_at = now(), version = version + 1
   WHERE id = req.id;
  RETURN v_digest;
END $$;

ALTER FUNCTION privacy_attach_external_retention_pending(uuid) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION privacy_attach_external_retention_pending(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION privacy_attach_external_retention_pending(uuid) TO app_role;

CREATE OR REPLACE FUNCTION privacy_signer_live_target_set(p_request_id uuid)
RETURNS TABLE (
  owner_user_id text,
  subject_id text,
  scope text,
  privacy_epoch bigint,
  target_set_digest text,
  sink text,
  resource_hmac text
)
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT r.owner_user_id, r.subject_id, r.scope, r.privacy_epoch, r.target_set_digest,
         d.sink, d.resource_hmac
    FROM privacy_erasure_request r
    JOIN privacy_deletion_target d ON d.request_id = r.id
   WHERE r.id = p_request_id
     AND r.status IN ('fenced', 'purging', 'pending_external')
   ORDER BY d.sink, d.resource_hmac;
$$;

ALTER FUNCTION privacy_signer_live_target_set(uuid) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION privacy_signer_live_target_set(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION privacy_signer_live_target_set(uuid) TO privacy_issuer;
