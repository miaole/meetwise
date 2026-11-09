-- 0229: qbank 控制面所有权/授权服务端化（DBDDL-HARDEN R3·扫描器 SQL 入口面消解续）。
-- 与 0000 同制：SECURITY DEFINER（owner=迁移账户）·客户端零动态 SQL 形态·字面量+参数调用。
CREATE OR REPLACE FUNCTION mw_admin_alter_table_owner(relation regclass, owner_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('ALTER TABLE %s OWNER TO %I', relation, owner_name);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_alter_object_owner(kind text, relation regclass, owner_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('ALTER %s %s OWNER TO %I', kind, relation, owner_name);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_alter_function_owner(fn regprocedure, owner_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('ALTER FUNCTION %s OWNER TO %I', fn, owner_name);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_alter_view_owner(relation regclass, owner_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('ALTER VIEW %s OWNER TO %I', relation, owner_name);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_grant_select_table(relation regclass, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('GRANT SELECT ON TABLE %s TO %I', relation, grantee);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_grant_exec_fn(fn regprocedure, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO %I', fn, grantee);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_revoke_membership_from(grantee text, role_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('REVOKE %I FROM %I', role_name, grantee);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_revoke_exec_fn(fn regprocedure, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM %I', fn, grantee);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_grant_table_priv(table_name text, relation regclass, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('GRANT %s ON TABLE %s TO %I', table_name, relation, grantee);
END $fn$;

REVOKE ALL ON FUNCTION mw_admin_alter_table_owner(regclass,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_alter_object_owner(text,regclass,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_alter_function_owner(regprocedure,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_alter_view_owner(regclass,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_grant_select_table(regclass,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_grant_exec_fn(regprocedure,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_revoke_membership_from(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_revoke_exec_fn(regprocedure,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_grant_table_priv(text,regclass,text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION mw_admin_revoke_all_table(relation regclass, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE %s FROM %s', relation, CASE WHEN grantee='PUBLIC' THEN 'PUBLIC' ELSE format('%I', grantee) END);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_revoke_col_table(relation regclass, column_name text, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('REVOKE ALL PRIVILEGES (%I) ON TABLE %s FROM %s', column_name, relation, CASE WHEN grantee='PUBLIC' THEN 'PUBLIC' ELSE format('%I', grantee) END);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_grant_table_privs(relation regclass, privileges text, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('GRANT %s ON TABLE %s TO %I', privileges, relation, grantee);
END $fn$;

REVOKE ALL ON FUNCTION mw_admin_revoke_all_table(regclass,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_revoke_col_table(regclass,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_grant_table_privs(regclass,text,text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION mw_admin_grant_select_table_by_name(table_name text, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('GRANT SELECT ON TABLE %s TO %I', table_name, grantee);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_default_priv_revoke(for_role text, schema_clause text, privileges text, object_type text, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I%s REVOKE %s ON %s FROM %s', for_role, schema_clause, privileges, object_type, grantee);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_revoke_exec_all(fn regprocedure, grantee text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM %s', fn, grantee);
END $fn$;

REVOKE ALL ON FUNCTION mw_admin_grant_select_table_by_name(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_default_priv_revoke(text,text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_revoke_exec_all(regprocedure,text) FROM PUBLIC;

-- SET ROLE 窗内（provisionQbankControlDefiner 的 ACL 归一段）需要的原语执行权：
-- 交接身份（qbank_control_definer·NOLOGIN）在窗内以自身身份调用以下六原语完成归一。
GRANT EXECUTE ON FUNCTION mw_admin_revoke_all_table(regclass,text) TO qbank_control_definer;
GRANT EXECUTE ON FUNCTION mw_admin_revoke_col_table(regclass,text,text) TO qbank_control_definer;
GRANT EXECUTE ON FUNCTION mw_admin_grant_table_privs(regclass,text,text) TO qbank_control_definer;
GRANT EXECUTE ON FUNCTION mw_admin_revoke_exec_all(regprocedure,text) TO qbank_control_definer;
GRANT EXECUTE ON FUNCTION mw_admin_grant_exec_fn(regprocedure,text) TO qbank_control_definer;
GRANT EXECUTE ON FUNCTION mw_admin_default_priv_revoke(text,text,text,text,text) TO qbank_control_definer;

-- partition/index 移交段（SET ROLE 窗内）的原语执行权补充
GRANT EXECUTE ON FUNCTION mw_admin_alter_table_owner(regclass,text) TO qbank_control_definer;
GRANT EXECUTE ON FUNCTION mw_admin_alter_object_owner(text,regclass,text) TO qbank_control_definer;
