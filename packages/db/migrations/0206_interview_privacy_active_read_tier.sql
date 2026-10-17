-- 0206_interview_privacy_active_read_tier.sql — privacy_active 读分层 additive（读 twin+围栏集聚合，两函数+ACL，零表零列零 DROP 零 ALTER）。
--
-- 只读面专用：本文件两函数是围栏判定的无锁读镜像。admission 面（invoke pre-dispatch、
-- commerce fence-first、begin/abandon/preview 直锁、claim/resume 谓词、score-writer fence
-- 序）仍必须走原 locking 谓词 interview_privacy_active——admission-vs-delete TOCTOU 串行化
-- 零削弱。现行权威体=0076 :88-118 同名 CREATE OR REPLACE 体（active 状态集 7 项含
-- authorization_paused）；读 twin 与权威体的唯一 delta=去掉 :97 的
-- pg_advisory_xact_lock 行（0058:40 同款），其余逐字。本文件不 REPLACE 权威函数、
-- 不触 0058/0076 任何既有对象，纯 additive。
-- ACL 形制沿 0058/0076：OWNER→privacy_api_owner + REVOKE PUBLIC + GRANT app_role；
-- 0076:114 的 REVOKE CREATE ON SCHEMA public 系 schema 级 DDL 面，不属本 additive 函数面。

CREATE OR REPLACE FUNCTION interview_privacy_active_read(target_interview text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN RETURN false; END IF;

  PERFORM 1
    FROM interview i
   WHERE i.id=target_interview AND i.owner_user_id=principal;
  IF NOT FOUND THEN RETURN false; END IF;

  PERFORM 1
    FROM privacy_checkpoint_target pt
    JOIN privacy_erasure_request r ON r.id=pt.request_id
   WHERE pt.thread_id=target_interview
     AND pt.owner_user_id=principal
     AND r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed','authorization_paused')
   LIMIT 1;
  RETURN NOT FOUND;
END $$;
ALTER FUNCTION interview_privacy_active_read(text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION interview_privacy_active_read(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_active_read(text) TO app_role;

-- principal 全量围栏集单查询聚合：active 状态 erasure request join target（owner 等值
-- 谓词内嵌），状态集与读 twin/权威体同式 7 项。thread_id 列 NOT NULL（0048），
-- 反连接消费（id != ALL($n)）无 NULL 陷阱。
CREATE OR REPLACE FUNCTION interview_privacy_fenced_targets()
RETURNS TABLE(thread_id text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 THEN RETURN; END IF;
  RETURN QUERY
    SELECT pt.thread_id
      FROM privacy_checkpoint_target pt
      JOIN privacy_erasure_request r ON r.id=pt.request_id
     WHERE pt.owner_user_id=principal
       AND r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed','authorization_paused');
END $$;
ALTER FUNCTION interview_privacy_fenced_targets() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION interview_privacy_fenced_targets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_fenced_targets() TO app_role;
