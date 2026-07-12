-- 四个生产承重原语的可执行证明（对真 Postgres 跑）
-- 见 ai-docs/rules/global/production-invariants.md
-- 运行：docker exec -i meetwise-postgres-dev psql -U meetwise -d meetwise -v ON_ERROR_STOP=1 < 此文件
-- 审计修复 C1：每个断言 FAIL 即 RAISE EXCEPTION → psql 非零退出（当 CI 门禁时 FAIL 不再静默绿）。
\set ON_ERROR_STOP on
\pset pager off

DROP TABLE IF EXISTS interview, consumption_record, interview_event CASCADE;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_role') THEN
    EXECUTE 'DROP OWNED BY app_role';   -- 清掉残留 GRANT 依赖，否则 DROP ROLE 报依赖
    EXECUTE 'DROP ROLE app_role';
  END IF;
END $$;

CREATE TABLE interview (
  id              text PRIMARY KEY,
  owner_user_id   text,
  owner_tenant_id text,
  status          text NOT NULL,
  version         int  NOT NULL DEFAULT 0,
  CONSTRAINT one_owner CHECK ((owner_user_id IS NOT NULL) <> (owner_tenant_id IS NOT NULL))
);
CREATE TABLE consumption_record (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL,
  status          text NOT NULL DEFAULT 'reserved',
  CONSTRAINT uq_consumption_idem UNIQUE (idempotency_key)
);
CREATE TABLE interview_event (
  id          bigserial PRIMARY KEY,
  stream_key  text NOT NULL,
  seq         bigint NOT NULL,
  kind        text NOT NULL,
  CONSTRAINT uq_event_seq UNIQUE (stream_key, seq)
);
CREATE ROLE app_role NOLOGIN;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_role;

INSERT INTO interview(id, owner_user_id, status, version) VALUES
  ('R1','userA','active',0),('R2','userA','active',0),('R3','userB','active',0);

-- 统一断言：cond 为假即抛错（非零退出）
CREATE OR REPLACE FUNCTION pg_temp.expect(label text, cond boolean) RETURNS void AS $$
BEGIN
  IF cond THEN RAISE NOTICE 'PASS  %', label;
  ELSE RAISE EXCEPTION 'FAIL  %', label;
  END IF;
END $$ LANGUAGE plpgsql;

DO $$
DECLARE n int;
BEGIN
  -- 原语 1：CAS 恰一个赢
  UPDATE interview SET status='waiting_user', version=version+1 WHERE id='R1' AND status='active' AND version=0;
  GET DIAGNOSTICS n = ROW_COUNT; PERFORM pg_temp.expect('原语1 CAS 赢家更新=1 行', n=1);
  UPDATE interview SET status='completed', version=version+1 WHERE id='R1' AND status='active' AND version=0;
  GET DIAGNOSTICS n = ROW_COUNT; PERFORM pg_temp.expect('原语1 CAS 陈旧落败者=0 行', n=0);

  -- 原语 2：幂等键只生效一次
  INSERT INTO consumption_record(idempotency_key) VALUES ('KEY1') ON CONFLICT (idempotency_key) DO NOTHING;
  INSERT INTO consumption_record(idempotency_key) VALUES ('KEY1') ON CONFLICT (idempotency_key) DO NOTHING;
  SELECT count(*) INTO n FROM consumption_record WHERE idempotency_key='KEY1';
  PERFORM pg_temp.expect('原语2 幂等 KEY1 记账=1 条', n=1);

  -- 原语 4：事件 seq 单调 + 重复 seq 被挡
  INSERT INTO interview_event(stream_key,seq,kind) VALUES ('R1',1,'question_ready'),('R1',2,'answer_evaluated'),('R1',3,'report_ready');
  BEGIN
    INSERT INTO interview_event(stream_key,seq,kind) VALUES ('R1',2,'dup');
    PERFORM pg_temp.expect('原语4 重复 seq 应被唯一约束挡', false);
  EXCEPTION WHEN unique_violation THEN PERFORM pg_temp.expect('原语4 重复 seq=2 被挡（重放去重）', true);
  END;
  SELECT count(*) INTO n FROM interview_event WHERE stream_key='R1';
  PERFORM pg_temp.expect('原语4 R1 事件 3 条 seq 连续', n=3);
END $$;

-- 原语 3：RLS 越权=0 + fail-closed（以非 owner 应用角色执行）
ALTER TABLE interview ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview FORCE ROW LEVEL SECURITY;  -- 审计 H2：owner 也不绕过
CREATE POLICY p_user_owned ON interview
  USING (owner_user_id = current_setting('app.principal_user', true));

DO $$
DECLARE n int;
BEGIN
  SET LOCAL ROLE app_role;
  PERFORM set_config('app.principal_user', '', true);     -- 未绑 principal
  SELECT count(*) INTO n FROM interview;
  PERFORM pg_temp.expect('原语3 未绑 principal 可见=0 行（fail-closed）', n=0);
  PERFORM set_config('app.principal_user', 'userA', true);
  SELECT count(*) INTO n FROM interview;
  PERFORM pg_temp.expect('原语3 userA 可见=2 行', n=2);
  SELECT count(*) INTO n FROM interview WHERE owner_user_id='userB';
  PERFORM pg_temp.expect('原语3 userA 越权看 userB=0 行', n=0);
  PERFORM set_config('app.principal_user', 'userB', true);
  SELECT count(*) INTO n FROM interview;
  PERFORM pg_temp.expect('原语3 userB 可见=1 行', n=1);
END $$;

\echo '════════ 四原语证明全部通过（任一 FAIL 会以非零退出）════════'
