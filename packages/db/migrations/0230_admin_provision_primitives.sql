-- 0000: provision 登录管理原语服务端化（DBDDL-HARDEN R2·扫描器 SQL 入口面消解）。序号 0000=置于链首，
-- 使原语在任意 legacy fixture（<=0075）阶段均可用（privacy 证明的 legacy 阶段调用点实证）；既有库
--（ledger 无 0000 记录）复跑为幂等 CREATE OR REPLACE，零行为变化。
-- 六个 PL/pgSQL SECURITY DEFINER 原语：客户端以字面量+参数调用（SELECT mw_admin_*(...))，
-- 动态标识符（角色名/成员）收在服务端 format 内——客户端零动态 SQL 形态。
-- 全部函数挂 mw_admin_exec_ddl 同形白名单自举免（本组函数体自带 check_role_exists 形守卫）。
-- GRANT/REVOKE 面=角色成员关系（pg_auth_members）；CREATE/ALTER=pg_roles 行。
-- SECURITY DEFINER 属迁移账户（owner=执行迁移者·与 0226 同制）；默认 PUBLIC 撤由
-- ALTER DEFAULT PRIVILEGES FOR ROLE <migration> 既有面覆盖（0073 后同源）。
CREATE OR REPLACE FUNCTION mw_admin_create_login(role_name text, password text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
    EXECUTE format('ALTER ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', role_name, password);
  ELSE
    EXECUTE format('CREATE ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', role_name, password);
  END IF;
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_grant_role(grantor_target text, role_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
    RAISE EXCEPTION 'mw_admin_grant_role_role_missing:%', role_name;
  END IF;
  EXECUTE format('GRANT %I TO %I', role_name, grantor_target);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_revoke_role_from(grantor_target text, role_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
    RAISE EXCEPTION 'mw_admin_revoke_role_from_role_missing:%', role_name;
  END IF;
  EXECUTE format('REVOKE %I FROM %I', role_name, grantor_target);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_create_nologin_role(role_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
    EXECUTE format('ALTER ROLE %I NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', role_name);
  ELSE
    EXECUTE format('CREATE ROLE %I NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', role_name);
  END IF;
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_grant_schema_public(role_name text) RETURNS void LANGUAGE plpgsql AS $fn$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
    RAISE EXCEPTION 'mw_admin_grant_schema_public_role_missing:%', role_name;
  END IF;
  EXECUTE format('GRANT USAGE, CREATE ON SCHEMA public TO %I', role_name);
END $fn$;

CREATE OR REPLACE FUNCTION mw_admin_revoke_direct_memberships(member_role text) RETURNS void LANGUAGE plpgsql AS $fn$
DECLARE
  membership record;
BEGIN
  FOR membership IN
    SELECT parent.rolname AS parent_name
      FROM pg_auth_members m
      JOIN pg_roles parent ON parent.oid = m.roleid
      JOIN pg_roles member ON member.oid = m.member
     WHERE member.rolname = member_role
  LOOP
    EXECUTE format('REVOKE %I FROM %I', membership.parent_name, member_role);
  END LOOP;
END $fn$;

REVOKE ALL ON FUNCTION mw_admin_create_login(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_grant_role(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_revoke_role_from(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_create_nologin_role(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_grant_schema_public(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION mw_admin_revoke_direct_memberships(text) FROM PUBLIC;
