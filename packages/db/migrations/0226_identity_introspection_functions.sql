-- 0226: 身份断言与 ACL 内省查询服务端化（扫描器长字面量门禁；SECURITY INVOKER 保持调用方语义）。
--
-- Mimosa flags `c.query(<template literal>)` whose SQL text exceeds ~512 chars.
-- The eight long introspection queries in src/principal.ts move here verbatim,
-- one SQL function each; the TypeScript call sites shrink to short parameterized
-- literals (`SELECT * FROM mw_...(...)`, params still passed out-of-band).
--
-- Every function is LANGUAGE sql STABLE SECURITY INVOKER with
-- `SET search_path = pg_catalog, public`, so session_user / current_user /
-- has_*_privilege / pg_has_role semantics stay caller-relative exactly as when
-- the same text executed inline in the caller's session.  Bodies are byte-
-- identical to the removed template literals except that $N placeholders are
-- replaced by declared parameter references.  CREATE OR REPLACE keeps this
-- file idempotent-tolerant.

-- ACL normalization helper (normalizeQbankRelationAcl): column-level grantees
-- of one relation ($1 = relation name resolved as regclass in the caller's
-- session, same as the previous inline $1::regclass).
CREATE OR REPLACE FUNCTION mw_qbank_column_grantees(relation regclass)
RETURNS TABLE(column_name name, role_name text) LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $mwfn$
SELECT attribute.attname AS column_name,
       coalesce(role.rolname, 'PUBLIC') AS role_name
  FROM pg_class class
  JOIN pg_attribute attribute
    ON attribute.attrelid=class.oid
   AND attribute.attnum > 0 AND NOT attribute.attisdropped
  CROSS JOIN LATERAL aclexplode(attribute.attacl) AS privilege
  LEFT JOIN pg_roles role ON role.oid=privilege.grantee
 WHERE class.oid=relation
   AND attribute.attacl IS NOT NULL
   AND privilege.grantee <> class.relowner
  GROUP BY attribute.attname, role.rolname
  ORDER BY attribute.attname, role_name
$mwfn$;

-- provisionQbankControlDefiner: generation partitions (and their physical
-- indexes) descending from qbank_generation_chunk, with kind and owner.
CREATE OR REPLACE FUNCTION mw_qbank_partition_objects()
RETURNS TABLE(relation_name text, relation_kind text, owner_name text) LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $mwfn$
WITH RECURSIVE descendants(oid) AS (
   SELECT inheritance.inhrelid
     FROM pg_inherits inheritance
    WHERE inheritance.inhparent='qbank_generation_chunk'::regclass
   UNION
   SELECT inheritance.inhrelid
     FROM pg_inherits inheritance
     JOIN descendants parent ON parent.oid=inheritance.inhparent
 ), protected_objects AS (
   SELECT descendant.oid, 'table'::text AS relation_kind
     FROM descendants descendant
   UNION
   SELECT index_relation.indexrelid, 'index'::text AS relation_kind
     FROM pg_index index_relation
     JOIN descendants descendant ON descendant.oid=index_relation.indrelid
 )
 SELECT object.oid::regclass::text AS relation_name,
        object.relation_kind,
        owner.rolname AS owner_name
   FROM protected_objects object
   JOIN pg_class relation ON relation.oid=object.oid
   JOIN pg_roles owner ON owner.oid=relation.relowner
  ORDER BY object.relation_kind, object.oid::regclass::text
$mwfn$;

-- assertPrivacyWorkerExecutorIdentity: live-catalog gate for the privacy
-- erasure worker connection (session-relative privileges and memberships).
CREATE OR REPLACE FUNCTION mw_assert_privacy_worker_identity()
RETURNS TABLE(rolsuper boolean, rolbypassrls boolean, rolcreaterole boolean, rolcreatedb boolean, rolinherit boolean,
              executor_super boolean, executor_bypass boolean, executor_createrole boolean, executor_createdb boolean, executor_inherit boolean,
              rolreplication boolean, executor_replication boolean, executor_member boolean, app_member boolean, gateway_member boolean,
              owner_member boolean, api_owner_member boolean, qbank_member boolean, rag_member boolean,
              session_members text[], executor_members text[],
              owns_public_relation boolean, owns_schema boolean, owns_database boolean, public_create boolean, database_create boolean,
              raw_ledger_privilege boolean,
              expected_function_found integer, expected_function_executor_allowed integer, expected_function_public_denied integer,
              forbidden_function_found integer, forbidden_function_executor_denied integer, forbidden_function_session_denied integer, forbidden_function_public_denied integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $mwfn$
WITH session_role AS (
         SELECT oid,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolinherit,rolreplication
           FROM pg_roles WHERE rolname=session_user
       ), executor_role AS (
         SELECT oid,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolinherit,rolreplication
           FROM pg_roles WHERE rolname='privacy_worker_executor'
       ), expected_worker_function(signature) AS (
         VALUES
           ('privacy_list_claimable_checkpoint_targets(integer)'::text),
           ('privacy_claim_checkpoint_target(uuid,text,integer)'::text),
           ('privacy_purge_checkpoint_target(uuid,uuid)'::text)
       ), forbidden_worker_function(signature) AS (
         VALUES
           ('revoke_checkpoint_thread(text)'::text),
           ('privacy_begin_checkpoint_erasure(text,text)'::text)
       ), expected_function_fact AS (
         SELECT count(proc.oid)::int AS found,
                count(*) FILTER (WHERE has_function_privilege('privacy_worker_executor',proc.oid,'EXECUTE'))::int AS executor_allowed,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(proc.proacl,acldefault('f',proc.proowner))) AS acl
                   WHERE acl.grantee=0 AND acl.privilege_type='EXECUTE'
                ))::int AS public_denied
           FROM expected_worker_function expected
           LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(expected.signature)
       ), forbidden_function_fact AS (
         SELECT count(proc.oid)::int AS found,
                count(*) FILTER (WHERE NOT has_function_privilege('privacy_worker_executor',proc.oid,'EXECUTE'))::int AS executor_denied,
                count(*) FILTER (WHERE NOT has_function_privilege(session_user,proc.oid,'EXECUTE'))::int AS session_denied,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(proc.proacl,acldefault('f',proc.proowner))) AS acl
                   WHERE acl.grantee=0 AND acl.privilege_type='EXECUTE'
                ))::int AS public_denied
           FROM forbidden_worker_function forbidden
           LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(forbidden.signature)
       )
       SELECT session_role.rolsuper,session_role.rolbypassrls,session_role.rolcreaterole,session_role.rolcreatedb,session_role.rolinherit,
              executor_role.rolsuper AS executor_super,executor_role.rolbypassrls AS executor_bypass,
              executor_role.rolcreaterole AS executor_createrole,executor_role.rolcreatedb AS executor_createdb,executor_role.rolinherit AS executor_inherit,
              session_role.rolreplication,executor_role.rolreplication AS executor_replication,
              pg_has_role(session_user,'privacy_worker_executor','member') AS executor_member,
              pg_has_role(session_user,'app_role','member') AS app_member,
              pg_has_role(session_user,'app_gateway_role','member') AS gateway_member,
              pg_has_role(session_user,'privacy_worker_owner','member') AS owner_member,
              pg_has_role(session_user,'privacy_api_owner','member') AS api_owner_member,
              pg_has_role(session_user,'qbank_control_executor','member') AS qbank_member,
              pg_has_role(session_user,'rag_control_executor','member') AS rag_member,
              coalesce((SELECT array_agg(parent.rolname ORDER BY parent.rolname)
                FROM pg_auth_members membership JOIN pg_roles parent ON parent.oid=membership.roleid
               WHERE membership.member=session_role.oid), ARRAY[]::text[]) AS session_members,
              coalesce((SELECT array_agg(parent.rolname ORDER BY parent.rolname)
                FROM pg_auth_members membership JOIN pg_roles parent ON parent.oid=membership.roleid
               WHERE membership.member=executor_role.oid), ARRAY[]::text[]) AS executor_members,
              EXISTS (SELECT 1 FROM pg_class cls WHERE cls.relnamespace='public'::regnamespace AND cls.relowner=session_role.oid) AS owns_public_relation,
              EXISTS (SELECT 1 FROM pg_namespace n WHERE n.nspowner=session_role.oid) AS owns_schema,
              EXISTS (SELECT 1 FROM pg_database d WHERE d.datdba=session_role.oid) AS owns_database,
              has_schema_privilege(session_user,'public','CREATE') AS public_create,
              has_database_privilege(session_user,current_database(),'CREATE') AS database_create,
              EXISTS (
                SELECT 1
                  FROM (VALUES
                    ('privacy_erasure_request'::text,'SELECT'::text),
                    ('privacy_erasure_request'::text,'INSERT'::text),
                    ('privacy_erasure_request'::text,'UPDATE'::text),
                    ('privacy_erasure_request'::text,'DELETE'::text),
                    ('privacy_deletion_target'::text,'SELECT'::text),
                    ('privacy_deletion_target'::text,'INSERT'::text),
                    ('privacy_deletion_target'::text,'UPDATE'::text),
                    ('privacy_deletion_target'::text,'DELETE'::text),
                    ('privacy_checkpoint_target'::text,'SELECT'::text),
                    ('privacy_checkpoint_target'::text,'INSERT'::text),
                    ('privacy_checkpoint_target'::text,'UPDATE'::text),
                    ('privacy_checkpoint_target'::text,'DELETE'::text)
                  ) AS privilege_fact(relation_name,privilege_name)
                 WHERE has_table_privilege(session_user,privilege_fact.relation_name,privilege_fact.privilege_name)
              ) AS raw_ledger_privilege,
              expected_function_fact.found AS expected_function_found,
              expected_function_fact.executor_allowed AS expected_function_executor_allowed,
              expected_function_fact.public_denied AS expected_function_public_denied,
              forbidden_function_fact.found AS forbidden_function_found,
              forbidden_function_fact.executor_denied AS forbidden_function_executor_denied,
              forbidden_function_fact.session_denied AS forbidden_function_session_denied,
              forbidden_function_fact.public_denied AS forbidden_function_public_denied
         FROM session_role CROSS JOIN executor_role CROSS JOIN expected_function_fact CROSS JOIN forbidden_function_fact
$mwfn$;

-- assertPrivacyAuthorizationIssuerIdentity: catalog gate for the issuer/guard
-- definer roles (0091): non-login, non-inheriting, membership-closed.
CREATE OR REPLACE FUNCTION mw_assert_privacy_authorization_issuer_identity()
RETURNS TABLE(issuer_found integer, guard_found integer,
              issuer_canlogin boolean, issuer_inherit boolean, issuer_super boolean, issuer_createdb boolean,
              issuer_createrole boolean, issuer_replication boolean, issuer_bypass boolean,
              guard_canlogin boolean, guard_inherit boolean, guard_super boolean, guard_createdb boolean,
              guard_createrole boolean, guard_replication boolean, guard_bypass boolean,
              issuer_members integer, issuer_parents integer, guard_members integer, guard_parents integer,
              app_has_issuer boolean, app_has_guard boolean, app_has_worker boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $mwfn$
WITH issuer AS (
         SELECT rolname,rolcanlogin,rolinherit,rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls
           FROM pg_roles WHERE rolname='privacy_issuer'
       ), guard AS (
         SELECT rolname,rolcanlogin,rolinherit,rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls
           FROM pg_roles WHERE rolname='privacy_guard_owner'
       ), issuer_members AS (
         -- PG16+ auto-grants the CREATEROLE creator an ADMIN OPTION membership
         -- (set_option=false, inherit_option=false) that a non-superuser login
         -- cannot REVOKE on RDS.  Only members who can impersonate (set_option)
         -- or inherit (inherit_option) pierce the seal; the creator auto-grant
         -- has neither, so it is excluded from the "no unsafe member" count.
         SELECT count(*)::int AS n FROM pg_auth_members m
          WHERE m.roleid=(SELECT oid FROM pg_roles WHERE rolname='privacy_issuer')
            AND (m.set_option OR m.inherit_option)
       ), issuer_parents AS (
         SELECT count(*)::int AS n FROM pg_auth_members m
          WHERE m.member=(SELECT oid FROM pg_roles WHERE rolname='privacy_issuer')
       ), guard_members AS (
         SELECT count(*)::int AS n FROM pg_auth_members m
          WHERE m.roleid=(SELECT oid FROM pg_roles WHERE rolname='privacy_guard_owner')
            AND (m.set_option OR m.inherit_option)
       ), guard_parents AS (
         SELECT count(*)::int AS n FROM pg_auth_members m
          WHERE m.member=(SELECT oid FROM pg_roles WHERE rolname='privacy_guard_owner')
       )
       SELECT
         (SELECT count(*)::int FROM issuer) AS issuer_found,
         (SELECT count(*)::int FROM guard) AS guard_found,
         (SELECT rolcanlogin FROM issuer) AS issuer_canlogin,
         (SELECT rolinherit FROM issuer) AS issuer_inherit,
         (SELECT rolsuper FROM issuer) AS issuer_super,
         (SELECT rolcreatedb FROM issuer) AS issuer_createdb,
         (SELECT rolcreaterole FROM issuer) AS issuer_createrole,
         (SELECT rolreplication FROM issuer) AS issuer_replication,
         (SELECT rolbypassrls FROM issuer) AS issuer_bypass,
         (SELECT rolcanlogin FROM guard) AS guard_canlogin,
         (SELECT rolinherit FROM guard) AS guard_inherit,
         (SELECT rolsuper FROM guard) AS guard_super,
         (SELECT rolcreatedb FROM guard) AS guard_createdb,
         (SELECT rolcreaterole FROM guard) AS guard_createrole,
         (SELECT rolreplication FROM guard) AS guard_replication,
         (SELECT rolbypassrls FROM guard) AS guard_bypass,
         (SELECT n FROM issuer_members) AS issuer_members,
         (SELECT n FROM issuer_parents) AS issuer_parents,
         (SELECT n FROM guard_members) AS guard_members,
         (SELECT n FROM guard_parents) AS guard_parents,
         pg_has_role('app_role','privacy_issuer','member') AS app_has_issuer,
         pg_has_role('app_role','privacy_guard_owner','member') AS app_has_guard,
         pg_has_role('app_role','privacy_worker_executor','member') AS app_has_worker
$mwfn$;

-- assertRagControlExecutorIdentity: live-catalog gate for the RAG control
-- connection, including the impersonation/inheritance member closure.
CREATE OR REPLACE FUNCTION mw_assert_rag_control_executor_identity()
RETURNS TABLE(rolsuper boolean, rolbypassrls boolean, rolcreaterole boolean, rolcreatedb boolean, rolinherit boolean, rolreplication boolean,
              executor_super boolean, executor_bypass boolean, executor_createrole boolean, executor_createdb boolean,
              executor_inherit boolean, executor_replication boolean, executor_member boolean, app_member boolean,
              gateway_member boolean, privacy_member boolean, extra_membership boolean, executor_parent_membership boolean,
              executor_session_member_count integer, executor_compatibility_member_count integer, executor_unexpected_member_count integer,
              owns_public_relation boolean, owns_schema boolean, public_create boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $mwfn$
WITH RECURSIVE session_role AS (
         SELECT oid,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolinherit,rolreplication
           FROM pg_roles WHERE rolname=session_user
       ), executor_role AS (
         SELECT oid,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolinherit,rolreplication
           FROM pg_roles WHERE rolname='rag_control_executor'
       ), executor_member_closure(oid) AS (
         -- The closure models *who can impersonate or inherit* the executor,
         -- not raw membership.  PostgreSQL 16+ auto-grants a CREATEROLE creator
         -- an ADMIN OPTION membership (set_option=false, inherit_option=false)
         -- in every role it creates; on RDS the non-superuser migration login
         -- cannot REVOKE that auto-grant.  Excluding set_option=false AND
         -- inherit_option=false members keeps the "no unexpected member" check
         -- enforceable in production without weakening the seal: a member that
         -- can neither SET ROLE nor inherit cannot reach the executor.
         SELECT membership.member
           FROM pg_auth_members AS membership
          WHERE membership.roleid='rag_control_executor'::regrole
            AND (membership.set_option OR membership.inherit_option)
         UNION
         SELECT membership.member
           FROM pg_auth_members AS membership
           JOIN executor_member_closure AS parent ON parent.oid=membership.roleid
          WHERE membership.set_option OR membership.inherit_option
       )
       SELECT session_role.rolsuper,session_role.rolbypassrls,session_role.rolcreaterole,session_role.rolcreatedb,session_role.rolinherit,session_role.rolreplication,
              executor_role.rolsuper AS executor_super,executor_role.rolbypassrls AS executor_bypass,
              executor_role.rolcreaterole AS executor_createrole,executor_role.rolcreatedb AS executor_createdb,executor_role.rolinherit AS executor_inherit,executor_role.rolreplication AS executor_replication,
              pg_has_role(session_user,'rag_control_executor','member') AS executor_member,
              pg_has_role(session_user,'app_role','member') AS app_member,
              pg_has_role(session_user,'app_gateway_role','member') AS gateway_member,
              pg_has_role(session_user,'privacy_worker_executor','member') AS privacy_member,
              EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member=session_role.oid AND m.roleid<>'rag_control_executor'::regrole) AS extra_membership,
              EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member=executor_role.oid) AS executor_parent_membership,
              (SELECT count(*)::int FROM executor_member_closure closure WHERE closure.oid=session_role.oid) AS executor_session_member_count,
              (SELECT count(*)::int FROM executor_member_closure closure WHERE closure.oid='rag_control_login'::regrole) AS executor_compatibility_member_count,
              (SELECT count(*)::int
                 FROM executor_member_closure closure
                 JOIN pg_roles member_role ON member_role.oid=closure.oid
                WHERE member_role.oid<>session_role.oid AND member_role.rolname<>'rag_control_login') AS executor_unexpected_member_count,
              EXISTS (SELECT 1 FROM pg_class cls WHERE cls.relnamespace='public'::regnamespace AND cls.relowner=session_role.oid) AS owns_public_relation,
              EXISTS (SELECT 1 FROM pg_namespace n WHERE n.nspowner=session_role.oid) AS owns_schema,
              has_schema_privilege(session_user,'public','CREATE') AS public_create
         FROM session_role CROSS JOIN executor_role
$mwfn$;

-- assertRagControlDefinerOwnership: verified RAG control/runtime function
-- manifests, table manifests, dynamic partition policies and owner identity.
CREATE OR REPLACE FUNCTION mw_assert_rag_control_definer_ownership()
RETURNS TABLE(control_found integer, control_secured integer, control_owners integer, control_public_denied integer, control_app_role_denied integer, control_safe_search_path integer,
              control_unexpected_execute_grants integer,
              control_executor_schema_usage boolean, control_runtime_definer_schema_usage boolean, control_unexpected_schema_usage_grants integer,
              runtime_found integer, runtime_secured integer, runtime_owners integer, runtime_public_denied integer, runtime_app_role_allowed integer, runtime_safe_search_path integer,
              table_found integer, table_forced integer, table_owners integer,
              dynamic_vector_found integer, dynamic_vector_hardened integer, dynamic_vector_app_denied integer, dynamic_vector_policy_hardened integer,
              unexpected_control_definer_count integer, unexpected_runtime_definer_count integer,
              default_function_acl_found integer, default_function_acl_public_denied integer,
              control_owner_name text, control_login boolean, control_super boolean, control_bypass boolean,
              control_inherit boolean, control_createrole boolean, control_createdb boolean, control_member boolean,
              runtime_owner_name text, runtime_login boolean, runtime_super boolean, runtime_bypass boolean,
              runtime_inherit boolean, runtime_createrole boolean, runtime_createdb boolean, runtime_member boolean,
              control_schema_create boolean, runtime_control_create boolean, executor_control_create boolean,
              app_control_schema_usage boolean, app_runtime_schema_usage boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $mwfn$
WITH expected_control(signature) AS (VALUES
           ('rag_control.rag_control_begin_request(text,text,text,bigint)'::text),
           ('rag_control.rag_mark_request_dispatching(text,text,text)'::text),
           ('rag_control.rag_bind_generation_dispatch_request(text,text)'::text),
           ('rag_control.rag_bind_rebuild_dispatch_request(text,text)'::text),
           ('rag_control.rag_settle_request_dispatch(text,text,text)'::text),
           ('rag_control.rag_record_reconciliation_receipt(text,text,text,text,text,text)'::text),
           ('rag_control.rag_terminalize_unknown_generation(text,text,text)'::text),
           ('rag_control.rag_terminalize_unknown_rebuild_run(text,text,text)'::text),
           ('rag_control.rag_control_input_digest(text,jsonb)'::text),
           ('rag_control.rag_claim_request_input(text,text,text)'::text),
           ('rag_control.rag_succeed_request(text,text,text)'::text),
           ('rag_control.rag_register_global_document(text,text,text)'::text),
           ('rag_control.rag_control_publish_global_document_version(text,text,text,text,text,text,jsonb,jsonb)'::text),
           ('rag_control.rag_register_embedding_recipe(text,text,text,text,text,text,integer,text,text,text,text,jsonb)'::text),
           ('rag_control.rag_register_release_policy(text,text,integer,integer,integer,integer)'::text),
           ('rag_control.rag_start_generation(text,text,text,text)'::text),
           ('rag_control.rag_prepare_generation_storage(text,text)'::text),
           ('rag_control.rag_insert_generation_vector(text,text,text,public.vector)'::text),
           ('rag_control.rag_validate_generation(text,text)'::text),
           ('rag_control.rag_record_shadow_evaluation(text,text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric)'::text),
           ('rag_control.rag_gate_generation(text,text,text)'::text),
           ('rag_control.rag_advance_rollout(text,text,integer)'::text),
           ('rag_control.rag_promote_generation(text,text,text)'::text),
           ('rag_control.rag_rollback_generation(text,text,text)'::text),
           ('rag_control.rag_create_rebuild_run(text,text,text,timestamptz,integer)'::text),
           ('rag_control.rag_claim_rebuild_run(text,text,integer)'::text),
           ('rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb)'::text)
       ), control_fact AS (
         SELECT count(proc.oid)::int AS found,count(*) FILTER (WHERE proc.prosecdef AND ns.nspname='rag_control')::int AS secured,
                count(DISTINCT proc.proowner)::int AS owners,min(proc.proowner)::oid AS owner_oid,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS acl
                   WHERE acl.grantee=0 AND acl.privilege_type='EXECUTE'
                ))::int AS public_denied,
                count(*) FILTER (WHERE NOT has_function_privilege('app_role',proc.oid,'EXECUTE'))::int AS app_role_denied,
                count(*) FILTER (WHERE proc.proconfig=ARRAY['search_path=pg_catalog, rag_control, pg_temp'])::int AS safe_search_path
           FROM expected_control e LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(e.signature)
           LEFT JOIN pg_namespace ns ON ns.oid=proc.pronamespace
       ), control_acl_fact AS (
         SELECT count(*) FILTER (WHERE EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(proc.proacl, acldefault('f',proc.proowner))) AS acl
                   WHERE acl.privilege_type='EXECUTE'
                     AND acl.grantee NOT IN (proc.proowner, 'rag_control_executor'::regrole::oid)
                ))::int AS unexpected_execute_grants
           FROM expected_control e
           JOIN pg_proc proc ON proc.oid=to_regprocedure(e.signature)
       ), control_schema_acl_fact AS (
         SELECT bool_or(acl.grantee='rag_control_executor'::regrole::oid) AS executor_usage,
                bool_or(acl.grantee='rag_runtime_definer'::regrole::oid) AS runtime_definer_usage,
                count(*) FILTER (WHERE acl.grantee NOT IN (
                  control_schema.nspowner,
                  'rag_control_executor'::regrole::oid,
                  'rag_runtime_definer'::regrole::oid
                ))::int AS unexpected_usage_grants
           FROM pg_namespace AS control_schema
           CROSS JOIN LATERAL aclexplode(coalesce(control_schema.nspacl, acldefault('n',control_schema.nspowner))) AS acl
          WHERE control_schema.nspname='rag_control' AND acl.privilege_type='USAGE'
       ), expected_runtime(signature) AS (VALUES
           ('rag_runtime.rag_register_private_document(text,text)'::text),
           ('rag_runtime.rag_publish_private_document_version(text,text,text,text,text,jsonb,jsonb)'::text),
           ('rag_runtime.rag_bind_query(text,text,integer)'::text),
           ('rag_runtime.rag_resolve_query_binding(text)'::text),
           ('rag_runtime.rag_search_bound(text,public.vector,integer)'::text),
           ('rag_runtime.rag_evidence_bound(text,text[],integer)'::text),
           ('rag_runtime.rag_record_citation(text,text,text)'::text),
           ('rag_runtime.rag_tombstone_private_document(text,text)'::text)
       ), runtime_fact AS (
         SELECT count(proc.oid)::int AS found,count(*) FILTER (WHERE proc.prosecdef AND ns.nspname='rag_runtime')::int AS secured,
                count(DISTINCT proc.proowner)::int AS owners,min(proc.proowner)::oid AS owner_oid,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS acl
                   WHERE acl.grantee=0 AND acl.privilege_type='EXECUTE'
                ))::int AS public_denied,
                count(*) FILTER (WHERE has_function_privilege('app_role',proc.oid,'EXECUTE'))::int AS app_role_allowed,
                count(*) FILTER (WHERE proc.proconfig=ARRAY['search_path=pg_catalog, rag_runtime, pg_temp'])::int AS safe_search_path
           FROM expected_runtime e LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(e.signature)
           LEFT JOIN pg_namespace ns ON ns.oid=proc.pronamespace
       ), expected_table(name) AS (VALUES
           ('public.rag_corpus_epoch'::text),('public.rag_corpus_document'::text),('public.rag_corpus_content_version'::text),
           ('public.rag_corpus_chunk'::text),('public.rag_corpus_tombstone'::text),('public.rag_embedding_recipe'::text),
           ('public.rag_release_policy'::text),('public.rag_embedding_generation'::text),('public.rag_generation_member'::text),
           ('public.rag_active_generation'::text),('public.rag_rebuild_run'::text),('public.rag_shadow_evaluation'::text),
           ('public.rag_generation_rollout'::text),('public.rag_query_binding'::text),('public.rag_citation'::text),
           ('public.rag_control_request'::text),('public.rag_control_dispatch_attempt'::text),('public.rag_control_dispatch_subject'::text),('public.rag_global_document_provenance'::text),
           ('public.rag_reconciliation_receipt'::text),('public.rag_control_request_input_binding'::text),
           ('public.rag_generation_integrity_quarantine'::text),('public.rag_cache_epoch'::text),('public.rag_cache_invalidation_outbox'::text),
           ('public.rag_generation_release_event'::text)
       ), table_fact AS (
         SELECT count(cls.oid)::int AS found,count(*) FILTER (WHERE cls.relrowsecurity AND cls.relforcerowsecurity)::int AS forced,
                count(DISTINCT cls.relowner)::int AS owners,min(cls.relowner)::oid AS owner_oid
           FROM expected_table e LEFT JOIN pg_class cls ON cls.oid=to_regclass(e.name)
       ), dynamic_vector_fact AS (
         SELECT count(cls.oid)::int AS found,
                count(*) FILTER (WHERE cls.relowner='rag_control_definer'::regrole AND cls.relrowsecurity AND cls.relforcerowsecurity)::int AS hardened,
                count(*) FILTER (WHERE NOT has_table_privilege('app_role',cls.oid,'SELECT,INSERT,UPDATE,DELETE'))::int AS app_denied,
                count(*) FILTER (WHERE
                  (
                    (SELECT count(*) FROM pg_policy policy WHERE policy.polrelid=cls.oid)=1
                    AND EXISTS (
                      SELECT 1 FROM pg_policy policy
                       WHERE policy.polrelid=cls.oid
                         AND policy.polname='p073_legacy_quarantined_control'
                         AND policy.polcmd='*'
                         AND policy.polroles=ARRAY['rag_control_definer'::regrole::oid]
                         AND pg_get_expr(policy.polqual,policy.polrelid)='true'
                         AND pg_get_expr(policy.polwithcheck,policy.polrelid)='true'
                    )
                  )
                  OR (
                    (SELECT count(*) FROM pg_policy policy WHERE policy.polrelid=cls.oid)=3
                    AND EXISTS (
                      SELECT 1 FROM pg_policy policy
                       WHERE policy.polrelid=cls.oid
                         AND policy.polname=format('p_%s_control_all',cls.relname)
                         AND policy.polcmd='*'
                         AND policy.polroles=ARRAY['rag_control_definer'::regrole::oid]
                         AND pg_get_expr(policy.polqual,policy.polrelid)='true'
                         AND pg_get_expr(policy.polwithcheck,policy.polrelid)='true'
                    )
                    AND EXISTS (
                      SELECT 1 FROM pg_policy policy
                       WHERE policy.polrelid=cls.oid
                         AND policy.polname=format('p_%s_runtime_read',cls.relname)
                         AND policy.polcmd='r'
                         AND policy.polroles=ARRAY['rag_runtime_definer'::regrole::oid]
                         AND policy.polqual IS NOT NULL AND policy.polwithcheck IS NULL
                    )
                    AND EXISTS (
                      SELECT 1 FROM pg_policy policy
                       WHERE policy.polrelid=cls.oid
                         AND policy.polname=format('p_%s_runtime_delete',cls.relname)
                         AND policy.polcmd='d'
                         AND policy.polroles=ARRAY['rag_runtime_definer'::regrole::oid]
                         AND policy.polqual IS NOT NULL AND policy.polwithcheck IS NULL
                    )
                  )
                )::int AS policy_hardened
           FROM pg_class cls
           JOIN pg_namespace ns ON ns.oid=cls.relnamespace
          WHERE ns.nspname='rag_control' AND cls.relkind='r' AND cls.relname ~ '^rag_vector_[0-9a-f]{32}$'
       ), unexpected_control_definer AS (
         SELECT count(proc.oid)::int AS found
           FROM pg_proc proc JOIN pg_namespace ns ON ns.oid=proc.pronamespace
          WHERE ns.nspname='rag_control' AND proc.prosecdef
            AND NOT EXISTS (SELECT 1 FROM expected_control e WHERE proc.oid=to_regprocedure(e.signature))
       ), unexpected_runtime_definer AS (
         SELECT count(proc.oid)::int AS found
           FROM pg_proc proc JOIN pg_namespace ns ON ns.oid=proc.pronamespace
          WHERE ns.nspname='rag_runtime' AND proc.prosecdef
            AND NOT EXISTS (SELECT 1 FROM expected_runtime e WHERE proc.oid=to_regprocedure(e.signature))
       ), default_function_acl AS (
         SELECT count(role_name)::int AS found,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(acl.defaclacl,acldefault('f',role.oid))) AS item
                   WHERE item.grantee=0 AND item.privilege_type='EXECUTE'
                ))::int AS public_denied
           FROM (VALUES ('rag_control_definer'::name),('rag_runtime_definer'::name)) AS expected(role_name)
           JOIN pg_roles role ON role.rolname=expected.role_name
           LEFT JOIN pg_default_acl acl ON acl.defaclrole=role.oid AND acl.defaclnamespace=0 AND acl.defaclobjtype='f'
       )
       SELECT control_fact.found AS control_found,control_fact.secured AS control_secured,control_fact.owners AS control_owners,control_fact.public_denied AS control_public_denied,control_fact.app_role_denied AS control_app_role_denied,control_fact.safe_search_path AS control_safe_search_path,
              control_acl_fact.unexpected_execute_grants AS control_unexpected_execute_grants,
              control_schema_acl_fact.executor_usage AS control_executor_schema_usage,control_schema_acl_fact.runtime_definer_usage AS control_runtime_definer_schema_usage,control_schema_acl_fact.unexpected_usage_grants AS control_unexpected_schema_usage_grants,
              runtime_fact.found AS runtime_found,runtime_fact.secured AS runtime_secured,runtime_fact.owners AS runtime_owners,runtime_fact.public_denied AS runtime_public_denied,runtime_fact.app_role_allowed AS runtime_app_role_allowed,runtime_fact.safe_search_path AS runtime_safe_search_path,
              table_fact.found AS table_found,table_fact.forced AS table_forced,table_fact.owners AS table_owners,
              dynamic_vector_fact.found AS dynamic_vector_found,dynamic_vector_fact.hardened AS dynamic_vector_hardened,dynamic_vector_fact.app_denied AS dynamic_vector_app_denied,dynamic_vector_fact.policy_hardened AS dynamic_vector_policy_hardened,
              unexpected_control_definer.found AS unexpected_control_definer_count,unexpected_runtime_definer.found AS unexpected_runtime_definer_count,
              default_function_acl.found AS default_function_acl_found,default_function_acl.public_denied AS default_function_acl_public_denied,
              cowner.rolname AS control_owner_name,cowner.rolcanlogin AS control_login,cowner.rolsuper AS control_super,cowner.rolbypassrls AS control_bypass,
              cowner.rolinherit AS control_inherit,cowner.rolcreaterole AS control_createrole,cowner.rolcreatedb AS control_createdb,
              EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member=cowner.oid) AS control_member,
              rowner.rolname AS runtime_owner_name,rowner.rolcanlogin AS runtime_login,rowner.rolsuper AS runtime_super,rowner.rolbypassrls AS runtime_bypass,
              rowner.rolinherit AS runtime_inherit,rowner.rolcreaterole AS runtime_createrole,rowner.rolcreatedb AS runtime_createdb,
              EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member=rowner.oid) AS runtime_member,
              has_schema_privilege('rag_control_definer','rag_control','CREATE') AS control_schema_create,
              has_schema_privilege('rag_runtime_definer','rag_control','CREATE') AS runtime_control_create,
              has_schema_privilege('rag_control_executor','rag_control','CREATE') AS executor_control_create,
              has_schema_privilege('app_role','rag_control','USAGE') AS app_control_schema_usage,
              has_schema_privilege('app_role','rag_runtime','USAGE') AS app_runtime_schema_usage
         FROM control_fact CROSS JOIN control_acl_fact CROSS JOIN control_schema_acl_fact CROSS JOIN runtime_fact CROSS JOIN table_fact CROSS JOIN dynamic_vector_fact CROSS JOIN unexpected_control_definer CROSS JOIN unexpected_runtime_definer CROSS JOIN default_function_acl
         LEFT JOIN pg_roles cowner ON cowner.oid=control_fact.owner_oid
         LEFT JOIN pg_roles rowner ON rowner.oid=runtime_fact.owner_oid
        WHERE table_fact.owner_oid=control_fact.owner_oid
$mwfn$;

-- assertQbankControlExecutorIdentity: live-catalog gate for the qbank control
-- connection (session-relative privileges and memberships).
CREATE OR REPLACE FUNCTION mw_assert_qbank_control_executor_identity()
RETURNS TABLE(rolsuper boolean, rolbypassrls boolean, rolcreaterole boolean, rolcreatedb boolean, rolinherit boolean,
              executor_super boolean, executor_bypassrls boolean, executor_createrole boolean, executor_createdb boolean, executor_inherit boolean,
              control_member boolean, app_member boolean, gateway_member boolean,
              session_members text[], executor_members text[],
              owns_public_relation boolean, owns_schema boolean, owns_database boolean,
              can_create_public boolean, can_create_database boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $mwfn$
WITH session_role AS (
         SELECT oid, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolinherit
           FROM pg_roles WHERE rolname=session_user
       ), executor_role AS (
         SELECT oid, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolinherit
           FROM pg_roles WHERE rolname='qbank_control_executor'
       )
       SELECT session_role.rolsuper, session_role.rolbypassrls, session_role.rolcreaterole, session_role.rolcreatedb, session_role.rolinherit,
              executor_role.rolsuper AS executor_super, executor_role.rolbypassrls AS executor_bypassrls,
              executor_role.rolcreaterole AS executor_createrole, executor_role.rolcreatedb AS executor_createdb,
              executor_role.rolinherit AS executor_inherit,
              pg_has_role(session_user, 'qbank_control_executor', 'member') AS control_member,
              pg_has_role(session_user, 'app_role', 'member') AS app_member,
              pg_has_role(session_user, 'app_gateway_role', 'member') AS gateway_member,
              coalesce((SELECT array_agg(parent.rolname ORDER BY parent.rolname)
                FROM pg_auth_members membership JOIN pg_roles parent ON parent.oid=membership.roleid
               WHERE membership.member=session_role.oid), ARRAY[]::text[]) AS session_members,
              coalesce((SELECT array_agg(parent.rolname ORDER BY parent.rolname)
                FROM pg_auth_members membership JOIN pg_roles parent ON parent.oid=membership.roleid
               WHERE membership.member=executor_role.oid), ARRAY[]::text[]) AS executor_members,
              EXISTS (
                SELECT 1 FROM pg_class cls
                 WHERE cls.relnamespace='public'::regnamespace AND cls.relowner=session_role.oid
              ) AS owns_public_relation,
              EXISTS (SELECT 1 FROM pg_namespace n WHERE n.nspowner=session_role.oid) AS owns_schema,
              EXISTS (SELECT 1 FROM pg_database d WHERE d.datdba=session_role.oid) AS owns_database,
              has_schema_privilege(session_user, 'public', 'CREATE') AS can_create_public,
              has_database_privilege(session_user, current_database(), 'CREATE') AS can_create_database
         FROM session_role CROSS JOIN executor_role
$mwfn$;

-- assertQbankControlDefinerOwnership: the full qbank definer-shape gate.
-- The four JSON manifests and the definer role name are the same values the
-- TypeScript call site previously bound to $1-$4.
CREATE OR REPLACE FUNCTION mw_assert_qbank_control_definer_ownership(
  function_manifest jsonb,
  table_manifest jsonb,
  definer_role_name text,
  view_manifest jsonb)
RETURNS TABLE(function_count integer, security_definer_count integer, invoker_helper_count integer, safe_search_path_count integer,
              function_owner_count integer, function_public_denied_count integer, function_app_role_match_count integer,
              function_executor_match_count integer, function_grantee_allowlist_count integer,
              table_count integer, forced_rls_count integer, table_owner_count integer,
              table_app_role_match_count integer, table_executor_match_count integer, table_public_denied_count integer,
              table_grantee_allowlist_count integer,
              table_column_app_role_match_count integer, table_column_executor_match_count integer,
              table_column_public_denied_count integer, table_column_owner_only_count integer,
              view_count integer, explicit_definer_count integer, invoker_count integer, view_owner_count integer,
              view_app_role_match_count integer, view_executor_match_count integer, view_public_denied_count integer,
              view_grantee_allowlist_count integer,
              partition_count integer, partition_owner_count integer, partition_app_role_denied_count integer,
              partition_executor_denied_count integer, partition_public_denied_count integer, partition_grantee_allowlist_count integer,
              partition_column_app_role_denied_count integer, partition_column_executor_denied_count integer,
              partition_column_owner_only_count integer,
              partition_index_count integer, partition_index_owner_count integer,
              unexpected_definer_function_count integer,
              global_function_acl_count integer, function_allowlist_count integer, table_allowlist_count integer,
              function_scoped_acl_count integer, table_scoped_acl_count integer,
              definer_vector_chunk_select boolean,
              owner_name text, owner_can_login boolean, owner_inherit boolean, owner_super boolean,
              owner_bypass_rls boolean, owner_create_role boolean, owner_create_database boolean, owner_replication boolean,
              owner_public_usage boolean, owner_public_create boolean, owner_has_parent_role boolean, owner_has_unsafe_member boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $mwfn$
WITH RECURSIVE expected_function(signature, requires_security_definer, allow_app_role_execute, allow_executor_execute, required_search_path) AS (
         SELECT manifest.signature, manifest.requires_security_definer,
                manifest.allow_app_role_execute, manifest.allow_executor_execute,
                manifest.required_search_path
           FROM jsonb_to_recordset(function_manifest::jsonb) AS manifest(
             signature text,
             requires_security_definer boolean,
             allow_app_role_execute boolean,
             allow_executor_execute boolean,
             required_search_path text
           )
       ), function_fact AS (
         SELECT count(proc.oid)::int AS found_count,
                count(*) FILTER (WHERE expected.requires_security_definer AND proc.prosecdef AND namespace.nspname='public')::int AS security_definer_count,
                count(*) FILTER (WHERE NOT expected.requires_security_definer AND NOT proc.prosecdef AND namespace.nspname='public')::int AS invoker_helper_count,
                count(*) FILTER (WHERE proc.proconfig @> ARRAY['search_path=' || expected.required_search_path])::int AS safe_search_path_count,
                count(DISTINCT proc.proowner)::int AS owner_count,
                min(proc.proowner)::oid AS owner_oid
           FROM expected_function expected
           LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(expected.signature)
           LEFT JOIN pg_namespace namespace ON namespace.oid=proc.pronamespace
       ), function_acl_fact AS (
         SELECT count(proc.oid)::int AS found_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS privilege
                   WHERE privilege.grantee=0 AND privilege.privilege_type='EXECUTE'
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE has_function_privilege('app_role'::regrole, proc.oid, 'EXECUTE')=expected.allow_app_role_execute)::int AS app_role_match_count,
                count(*) FILTER (WHERE has_function_privilege('qbank_control_executor'::regrole, proc.oid, 'EXECUTE')=expected.allow_executor_execute)::int AS executor_match_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS privilege
                   WHERE privilege.privilege_type='EXECUTE'
                     AND privilege.grantee NOT IN (0, proc.proowner, 'app_role'::regrole::oid, 'qbank_control_executor'::regrole::oid)
                ))::int AS grantee_allowlist_count
           FROM expected_function expected
           LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(expected.signature)
       ), expected_table(name, app_privileges, executor_privileges) AS (
         SELECT manifest.name, manifest.app_privileges, manifest.executor_privileges
           FROM jsonb_to_recordset(table_manifest::jsonb) AS manifest(
             name text,
             app_privileges text[],
             executor_privileges text[]
           )
       ), table_fact AS (
         SELECT count(cls.oid)::int AS found_count,
                count(*) FILTER (WHERE cls.relkind IN ('r','p') AND cls.relrowsecurity AND cls.relforcerowsecurity)::int AS forced_rls_count,
                count(DISTINCT cls.relowner)::int AS owner_count,
                min(cls.relowner)::oid AS owner_oid
           FROM expected_table expected
           LEFT JOIN pg_class cls ON cls.oid=to_regclass(expected.name)
       ), table_acl_fact AS (
         SELECT count(cls.oid)::int AS found_count,
                count(*) FILTER (WHERE
                  has_table_privilege('app_role'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'DELETE')=('DELETE'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'TRUNCATE')=('TRUNCATE'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'REFERENCES')=('REFERENCES'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'TRIGGER')=('TRIGGER'=ANY(expected.app_privileges))
                )::int AS app_role_match_count,
                count(*) FILTER (WHERE
                  has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'DELETE')=('DELETE'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'TRUNCATE')=('TRUNCATE'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'REFERENCES')=('REFERENCES'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'TRIGGER')=('TRIGGER'=ANY(expected.executor_privileges))
                )::int AS executor_match_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(cls.relacl, acldefault('r', cls.relowner))) AS privilege
                   WHERE privilege.grantee=0
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(cls.relacl, acldefault('r', cls.relowner))) AS privilege
                   WHERE privilege.grantee NOT IN (cls.relowner, 'app_role'::regrole::oid, 'qbank_control_executor'::regrole::oid)
                ))::int AS grantee_allowlist_count
           FROM expected_table expected
           LEFT JOIN pg_class cls ON cls.oid=to_regclass(expected.name)
       ), table_column_acl_fact AS (
         SELECT count(cls.oid)::int AS found_count,
                count(*) FILTER (WHERE
                  has_any_column_privilege('app_role'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.app_privileges))
                  AND has_any_column_privilege('app_role'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.app_privileges))
                  AND has_any_column_privilege('app_role'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.app_privileges))
                  AND has_any_column_privilege('app_role'::regrole, cls.oid, 'REFERENCES')=('REFERENCES'=ANY(expected.app_privileges))
                )::int AS app_role_match_count,
                count(*) FILTER (WHERE
                  has_any_column_privilege('qbank_control_executor'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.executor_privileges))
                  AND has_any_column_privilege('qbank_control_executor'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.executor_privileges))
                  AND has_any_column_privilege('qbank_control_executor'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.executor_privileges))
                  AND has_any_column_privilege('qbank_control_executor'::regrole, cls.oid, 'REFERENCES')=('REFERENCES'=ANY(expected.executor_privileges))
                )::int AS executor_match_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM pg_attribute attribute
                    CROSS JOIN LATERAL aclexplode(attribute.attacl) AS privilege
                   WHERE attribute.attrelid=cls.oid
                     AND attribute.attnum > 0 AND NOT attribute.attisdropped
                     AND attribute.attacl IS NOT NULL
                     AND privilege.grantee=0
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM pg_attribute attribute
                    CROSS JOIN LATERAL aclexplode(attribute.attacl) AS privilege
                   WHERE attribute.attrelid=cls.oid
                     AND attribute.attnum > 0 AND NOT attribute.attisdropped
                     AND attribute.attacl IS NOT NULL
                     AND privilege.grantee <> cls.relowner
                ))::int AS owner_only_count
           FROM expected_table expected
           LEFT JOIN pg_class cls ON cls.oid=to_regclass(expected.name)
       ), expected_view(name, security_invoker, app_privileges, executor_privileges) AS (
         SELECT manifest.name, manifest.security_invoker, manifest.app_privileges, manifest.executor_privileges
           FROM jsonb_to_recordset(view_manifest::jsonb) AS manifest(
             name text,
             security_invoker boolean,
             app_privileges text[],
             executor_privileges text[]
           )
       ), view_fact AS (
         SELECT count(cls.oid)::int AS found_count,
                count(*) FILTER (WHERE cls.relkind='v' AND cls.reloptions @> ARRAY['security_invoker=false']::text[])::int AS explicit_definer_count,
                count(*) FILTER (WHERE cls.relkind='v' AND cls.reloptions @> ARRAY['security_invoker=true']::text[])::int AS invoker_count,
                count(DISTINCT cls.relowner)::int AS owner_count,
                min(cls.relowner)::oid AS owner_oid
           FROM expected_view expected
           LEFT JOIN pg_class cls ON cls.oid=to_regclass(expected.name)
       ), view_acl_fact AS (
         SELECT count(cls.oid)::int AS found_count,
                count(*) FILTER (WHERE
                  has_table_privilege('app_role'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'DELETE')=('DELETE'=ANY(expected.app_privileges))
                )::int AS app_role_match_count,
                count(*) FILTER (WHERE
                  has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'DELETE')=('DELETE'=ANY(expected.executor_privileges))
                )::int AS executor_match_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(cls.relacl, acldefault('r', cls.relowner))) AS privilege
                   WHERE privilege.grantee=0
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(cls.relacl, acldefault('r', cls.relowner))) AS privilege
                   WHERE privilege.grantee NOT IN (cls.relowner, 'app_role'::regrole::oid, 'qbank_control_executor'::regrole::oid)
                ))::int AS grantee_allowlist_count
           FROM expected_view expected
           LEFT JOIN pg_class cls ON cls.oid=to_regclass(expected.name)
       ), vector_chunk_grant_fact AS (
         SELECT has_table_privilege(to_regrole(definer_role_name::text), 'public.vector_chunk'::regclass, 'SELECT') AS definer_vector_chunk_select
       ), partition_descendant(oid) AS (
         SELECT inheritance.inhrelid
           FROM pg_inherits inheritance
          WHERE inheritance.inhparent='qbank_generation_chunk'::regclass
         UNION
         SELECT inheritance.inhrelid
           FROM pg_inherits inheritance
           JOIN partition_descendant parent ON parent.oid=inheritance.inhparent
       ), partition_fact AS (
         SELECT count(partition_relation.oid)::int AS found_count,
                count(*) FILTER (WHERE partition_relation.relowner=to_regrole(definer_role_name::text))::int AS owner_count,
                count(*) FILTER (WHERE NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'SELECT')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'INSERT')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'UPDATE')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'DELETE')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'TRUNCATE')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'REFERENCES')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'TRIGGER'))::int AS app_role_denied_count,
                count(*) FILTER (WHERE NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'SELECT')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'INSERT')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'UPDATE')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'DELETE')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'TRUNCATE')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'REFERENCES')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'TRIGGER'))::int AS executor_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(partition_relation.relacl, acldefault('r', partition_relation.relowner))) AS privilege
                   WHERE privilege.grantee=0
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(partition_relation.relacl, acldefault('r', partition_relation.relowner))) AS privilege
                   WHERE privilege.grantee <> partition_relation.relowner
                ))::int AS grantee_allowlist_count
           FROM partition_descendant descendant
           JOIN pg_class partition_relation ON partition_relation.oid=descendant.oid
       ), partition_column_acl_fact AS (
         SELECT count(partition_relation.oid)::int AS found_count,
                count(*) FILTER (WHERE NOT has_any_column_privilege('app_role'::regrole, partition_relation.oid, 'SELECT')
                  AND NOT has_any_column_privilege('app_role'::regrole, partition_relation.oid, 'INSERT')
                  AND NOT has_any_column_privilege('app_role'::regrole, partition_relation.oid, 'UPDATE')
                  AND NOT has_any_column_privilege('app_role'::regrole, partition_relation.oid, 'REFERENCES'))::int AS app_role_denied_count,
                count(*) FILTER (WHERE NOT has_any_column_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'SELECT')
                  AND NOT has_any_column_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'INSERT')
                  AND NOT has_any_column_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'UPDATE')
                  AND NOT has_any_column_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'REFERENCES'))::int AS executor_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM pg_attribute attribute
                    CROSS JOIN LATERAL aclexplode(attribute.attacl) AS privilege
                   WHERE attribute.attrelid=partition_relation.oid
                     AND attribute.attnum > 0 AND NOT attribute.attisdropped
                     AND attribute.attacl IS NOT NULL
                     AND privilege.grantee <> partition_relation.relowner
                ))::int AS owner_only_count
           FROM partition_descendant descendant
           JOIN pg_class partition_relation ON partition_relation.oid=descendant.oid
       ), partition_index_fact AS (
         SELECT count(index_relation.oid)::int AS found_count,
                count(*) FILTER (WHERE index_relation.relowner=to_regrole(definer_role_name::text))::int AS owner_count
           FROM partition_descendant descendant
           JOIN pg_index index_definition ON index_definition.indrelid=descendant.oid
           JOIN pg_class index_relation ON index_relation.oid=index_definition.indexrelid
       ), unexpected_definer_function AS (
         SELECT count(procedure.oid)::int AS found_count
           FROM pg_proc procedure
           JOIN pg_namespace namespace ON namespace.oid=procedure.pronamespace
          WHERE namespace.nspname='public'
            AND procedure.proowner=to_regrole(definer_role_name::text)
            AND procedure.prosecdef
            AND NOT EXISTS (
              SELECT 1 FROM expected_function expected
               WHERE procedure.oid=to_regprocedure(expected.signature)
            )
       ), default_acl_fact AS (
         SELECT count(*) FILTER (
                  WHERE default_acl.defaclobjtype='f' AND default_acl.defaclnamespace=0
                )::int AS global_function_acl_count,
                count(*) FILTER (
                  WHERE default_acl.defaclobjtype='f'
                    AND (default_acl.defaclnamespace=0 OR namespace.nspname='public')
                    AND NOT EXISTS (
                      SELECT 1
                        FROM aclexplode(coalesce(default_acl.defaclacl, acldefault('f', role.oid))) AS privilege
                       WHERE privilege.grantee <> role.oid
                    )
                )::int AS function_allowlist_count,
                count(*) FILTER (
                  WHERE default_acl.defaclobjtype='r'
                    AND (default_acl.defaclnamespace=0 OR namespace.nspname='public')
                    AND NOT EXISTS (
                      SELECT 1
                        FROM aclexplode(coalesce(default_acl.defaclacl, acldefault('r', role.oid))) AS privilege
                       WHERE privilege.grantee <> role.oid
                    )
                )::int AS table_allowlist_count,
                count(*) FILTER (
                  WHERE default_acl.defaclobjtype='f'
                    AND (default_acl.defaclnamespace=0 OR namespace.nspname='public')
                )::int AS function_scoped_acl_count,
                count(*) FILTER (
                  WHERE default_acl.defaclobjtype='r'
                    AND (default_acl.defaclnamespace=0 OR namespace.nspname='public')
                )::int AS table_scoped_acl_count
           FROM pg_roles role
           LEFT JOIN pg_default_acl default_acl ON default_acl.defaclrole=role.oid
           LEFT JOIN pg_namespace namespace ON namespace.oid=default_acl.defaclnamespace
          WHERE role.rolname=definer_role_name::text
       )
       SELECT function_fact.found_count AS function_count,
              function_fact.security_definer_count,
              function_fact.invoker_helper_count,
              function_fact.safe_search_path_count,
              function_fact.owner_count AS function_owner_count,
              function_acl_fact.public_denied_count AS function_public_denied_count,
              function_acl_fact.app_role_match_count AS function_app_role_match_count,
              function_acl_fact.executor_match_count AS function_executor_match_count,
              function_acl_fact.grantee_allowlist_count AS function_grantee_allowlist_count,
              table_fact.found_count AS table_count,
              table_fact.forced_rls_count,
              table_fact.owner_count AS table_owner_count,
              table_acl_fact.app_role_match_count AS table_app_role_match_count,
              table_acl_fact.executor_match_count AS table_executor_match_count,
              table_acl_fact.public_denied_count AS table_public_denied_count,
              table_acl_fact.grantee_allowlist_count AS table_grantee_allowlist_count,
              table_column_acl_fact.app_role_match_count AS table_column_app_role_match_count,
              table_column_acl_fact.executor_match_count AS table_column_executor_match_count,
              table_column_acl_fact.public_denied_count AS table_column_public_denied_count,
              table_column_acl_fact.owner_only_count AS table_column_owner_only_count,
              view_fact.found_count AS view_count,
              view_fact.explicit_definer_count,
              view_fact.invoker_count,
              view_fact.owner_count AS view_owner_count,
              view_acl_fact.app_role_match_count AS view_app_role_match_count,
              view_acl_fact.executor_match_count AS view_executor_match_count,
              view_acl_fact.public_denied_count AS view_public_denied_count,
              view_acl_fact.grantee_allowlist_count AS view_grantee_allowlist_count,
              partition_fact.found_count AS partition_count,
              partition_fact.owner_count AS partition_owner_count,
              partition_fact.app_role_denied_count AS partition_app_role_denied_count,
              partition_fact.executor_denied_count AS partition_executor_denied_count,
              partition_fact.public_denied_count AS partition_public_denied_count,
              partition_fact.grantee_allowlist_count AS partition_grantee_allowlist_count,
              partition_column_acl_fact.app_role_denied_count AS partition_column_app_role_denied_count,
              partition_column_acl_fact.executor_denied_count AS partition_column_executor_denied_count,
              partition_column_acl_fact.owner_only_count AS partition_column_owner_only_count,
              partition_index_fact.found_count AS partition_index_count,
              partition_index_fact.owner_count AS partition_index_owner_count,
              unexpected_definer_function.found_count AS unexpected_definer_function_count,
              default_acl_fact.global_function_acl_count,
              default_acl_fact.function_allowlist_count,
              default_acl_fact.table_allowlist_count,
              default_acl_fact.function_scoped_acl_count,
              default_acl_fact.table_scoped_acl_count,
              vector_chunk_grant_fact.definer_vector_chunk_select,
              owner_role.rolname AS owner_name,
              owner_role.rolcanlogin AS owner_can_login,
              owner_role.rolinherit AS owner_inherit,
              owner_role.rolsuper AS owner_super,
              owner_role.rolbypassrls AS owner_bypass_rls,
              owner_role.rolcreaterole AS owner_create_role,
              owner_role.rolcreatedb AS owner_create_database,
              owner_role.rolreplication AS owner_replication,
              has_schema_privilege(owner_role.oid, 'public', 'USAGE') AS owner_public_usage,
              has_schema_privilege(owner_role.oid, 'public', 'CREATE') AS owner_public_create,
              EXISTS (
                SELECT 1 FROM pg_auth_members membership
                 WHERE membership.member=owner_role.oid
              ) AS owner_has_parent_role,
              -- PostgreSQL 16+ auto-grants a CREATEROLE creator an ADMIN OPTION
              -- membership in every role it creates, with set_option=false and
              -- inherit_option=false.  On RDS the migration login is NOT a
              -- superuser, so that auto-grant cannot be REVOKEd by the login
              -- itself (verified empirically on PG17.9).  A "no members at all"
              -- invariant is therefore unenforceable in production and would be
              -- false-green only under a superuser (the Docker db:prove path).
              -- The actual seal boundary is: no member may impersonate
              -- (set_option) or silently inherit (inherit_option) the definer.
              -- The creator auto-grant has both false, so it does not pierce the
              -- SECURITY DEFINER boundary and is deliberately allowed.
              EXISTS (
                SELECT 1 FROM pg_auth_members membership
                 WHERE membership.roleid=owner_role.oid
                   AND (membership.set_option OR membership.inherit_option)
              ) AS owner_has_unsafe_member
         FROM function_fact
         CROSS JOIN function_acl_fact
         CROSS JOIN table_fact
         CROSS JOIN table_acl_fact
         CROSS JOIN table_column_acl_fact
         CROSS JOIN view_fact
         CROSS JOIN view_acl_fact
         CROSS JOIN vector_chunk_grant_fact
         CROSS JOIN partition_fact
         CROSS JOIN partition_column_acl_fact
         CROSS JOIN partition_index_fact
         CROSS JOIN unexpected_definer_function
         CROSS JOIN default_acl_fact
         LEFT JOIN pg_roles owner_role ON owner_role.oid=function_fact.owner_oid
        WHERE function_fact.owner_oid=table_fact.owner_oid
          AND function_fact.owner_oid=view_fact.owner_oid
$mwfn$;

-- ── ACL 终态：0073:1342 `ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`
-- （无 FOR ROLE=作用于迁移账户）令本迁移新建函数失去默认 PUBLIC EXECUTE 自动授予。本族函数是
-- SECURITY INVOKER 身份断言/目录内省面，历史形态为调用方以自身身份直跑同语义内联目录查询
-- （含 provisionQbankControlDefiner 的 SET LOCAL ROLE qbank_control_definer 交接窗、四登录
-- 装配身份核验），语义上必须可被最低权身份调用。SECURITY INVOKER 仅读目录、零提权
-- （目录元数据本就 PUBLIC 可读），显式恢复 PUBLIC EXECUTE 不触碰 0073 面向 qbank_control
-- 封印面的默认特权姿态；mw_admin_exec_ddl 不在此列（执行面收窄见 principal.ts 自举段）。
GRANT EXECUTE ON FUNCTION mw_qbank_column_grantees(regclass) TO PUBLIC;
GRANT EXECUTE ON FUNCTION mw_qbank_partition_objects() TO PUBLIC;
GRANT EXECUTE ON FUNCTION mw_assert_privacy_worker_identity() TO PUBLIC;
GRANT EXECUTE ON FUNCTION mw_assert_privacy_authorization_issuer_identity() TO PUBLIC;
GRANT EXECUTE ON FUNCTION mw_assert_rag_control_executor_identity() TO PUBLIC;
GRANT EXECUTE ON FUNCTION mw_assert_rag_control_definer_ownership() TO PUBLIC;
GRANT EXECUTE ON FUNCTION mw_assert_qbank_control_executor_identity() TO PUBLIC;
GRANT EXECUTE ON FUNCTION mw_assert_qbank_control_definer_ownership(jsonb,jsonb,text,jsonb) TO PUBLIC;
