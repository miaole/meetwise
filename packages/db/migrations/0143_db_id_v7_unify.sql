-- 0143 · DBID-1 数据库 ID 统一优化刀（A 级 · 零回填渐进）
--
-- 亲核事实（@7135f615 · REQUEST reviews 双审 BOTH PASS · D1=全 55 切）：
--   * 55 张 uuid 主键表 DEFAULT gen_random_uuid()（UUIDv4 随机）→ 换 DEFAULT uuidv7()
--     （RFC 9562 §5.2：unix_ms(48)|ver(4)=0111|rand_a(12)|var(2)=10|rand_b(62)）。
--   * N1：ai_graph_run 主键列名 = run_id（其余 54 张 = id），逐表亲核。
--   * 零回填：仅 ALTER ... SET DEFAULT；存量 v4 行 append-only 原样保留（表内 v4/v7 并存
--     为预期终态）；列类型/FK/RLS/触发器/幂等键零触碰（prove P6 静态门强制）。
--   * uuidv7_from_parts：仅供 prove 做 RFC 9562 已知答案测试（KAT），生产路径不调用。
--
-- Ban（本 migration 语句白名单 = CREATE OR REPLACE FUNCTION + ALTER SET DEFAULT）：
--   禁 UPDATE/DELETE/DROP/GRANT/TRIGGER/ADD CONSTRAINT/列类型变更 —— prove P6 逐条扫描。

CREATE OR REPLACE FUNCTION public.uuidv7() RETURNS uuid
LANGUAGE plpgsql VOLATILE AS $fn$
DECLARE
  ts_ms  bigint;
  e      text;
  rand_a bigint;
  rand_b bigint;
BEGIN
  -- RFC 9562 §5.2 布局。时间源 clock_timestamp()（同事务多次调用也前进）。
  ts_ms := (floor(extract(epoch FROM clock_timestamp()) * 1000))::bigint;
  -- 熵源：v4 尾巴 32 hex（第 13/17 字符为版本/变位固定值 → 位段取偏移，避开固定 nibble）。
  e := replace(gen_random_uuid()::text, '-', '');
  rand_a := (('x' || substr(e, 18, 3))::bit(12))::bigint;
  rand_b := ((('x' || (substr(e, 21, 12) || substr(e, 1, 3)))::bit(60))::bigint * 4)
            + (((('x' || substr(e, 15, 1))::bit(4))::int) & 3);
  RETURN ( lpad(to_hex(ts_ms), 12, '0')
         || '7'
         || lpad(to_hex(rand_a), 3, '0')
         || to_hex(8 | (rand_b >> 60))
         || lpad(to_hex(rand_b & 1152921504606846975), 15, '0')
         )::uuid;
END
$fn$;

COMMENT ON FUNCTION public.uuidv7() IS
  'DBID-1: UUIDv7 (RFC 9562) — 48bit unix_ms 时间有序 + 74bit 随机尾部；高写入代理键默认值';

CREATE OR REPLACE FUNCTION public.uuidv7_from_parts(unix_ms bigint, rand_a bigint, rand_b bigint) RETURNS uuid
LANGUAGE plpgsql IMMUTABLE AS $fn$
BEGIN
  -- prove KAT 专用（确定性）；生产路径不调用。
  -- rand_a ∈ [0,2^12) · rand_b ∈ [0,2^62)：变位 nibble = 8 | rand_b 最高 2 位（rand_b 低 60 位全保留）。
  IF unix_ms < 0 OR unix_ms >= 281474976710656
     OR rand_a < 0 OR rand_a >= 4096
     OR rand_b < 0 OR rand_b >= 4611686018427387904 THEN
    RAISE EXCEPTION 'uuidv7_from_parts_out_of_range';
  END IF;
  RETURN ( lpad(to_hex(unix_ms), 12, '0')
         || '7'
         || lpad(to_hex(rand_a), 3, '0')
         || to_hex(8 | (rand_b >> 60))
         || lpad(to_hex(rand_b & 1152921504606846975), 15, '0')
         )::uuid;
END
$fn$;

COMMENT ON FUNCTION public.uuidv7_from_parts(bigint, bigint, bigint) IS
  'DBID-1: 确定性 UUIDv7 组装（prove KAT 专用·IMMUTABLE）';

-- ── A 级 55 表 DEFAULT 切换（D1：一刀切；分档仅叙事） ─────────────────────

-- 核心点名（commerce 五表 + ai_graph_run · N1：ai_graph_run 列名 = run_id）
ALTER TABLE ONLY public.entitlement_consumption ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.entitlement_bucket      ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.consumption_record      ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.commerce_outbox         ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.settlement_ledger       ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.ai_graph_run            ALTER COLUMN run_id SET DEFAULT public.uuidv7();

-- checkpoint 族（0047）
ALTER TABLE ONLY public.privacy_deletion_target ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.privacy_erasure_request ALTER COLUMN id SET DEFAULT public.uuidv7();

-- 高写入运行时（0001/0007/0008/0092）
ALTER TABLE ONLY public.resume                     ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.interview_job              ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.ai_report                  ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.quiz_job                   ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.diagnosis_job              ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.interview_answer_submission ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.interview_answer_artifact   ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.interview_answer_job        ALTER COLUMN id SET DEFAULT public.uuidv7();

-- ctx 事件源与压缩（0108/0115/0117）
ALTER TABLE ONLY public.conversation_event            ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.conversation_event_artifact   ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.context_compression_snapshot  ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.context_compression_dispatch  ALTER COLUMN id SET DEFAULT public.uuidv7();

-- 评分事实根（0100/0103）
ALTER TABLE ONLY public.issued_question_contract ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.score_request            ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.score_card               ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.score_card_criterion     ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.score_evidence           ALTER COLUMN id SET DEFAULT public.uuidv7();

-- OJ 控制面（0050）
ALTER TABLE ONLY public.online_judge_candidate ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.online_judge_dispatch  ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.online_judge_lot       ALTER COLUMN id SET DEFAULT public.uuidv7();

-- memory 运行时/索引/准入（0093/0095/0099/0102/0105/0112）
ALTER TABLE ONLY public.memory_consent                         ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_fact                            ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_context_snapshot                ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_index_generation                ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_fact_adjudication               ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_fact_relationship               ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_recall_context_snapshot         ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_index_generation_cache_entry    ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_index_generation_embedding      ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_index_source_manifest           ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_index_source_manifest_item      ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_summary                         ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_admission_authorization         ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_admission_record                ALTER COLUMN id SET DEFAULT public.uuidv7();

-- 隐私收据族（0091/0129/0140）
ALTER TABLE ONLY public.privacy_authorization_snapshot ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.privacy_deletion_receipt       ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.privacy_preview_request        ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.privacy_external_purge_evidence ALTER COLUMN id SET DEFAULT public.uuidv7();

-- 控制面低频 + 内容低频（0107/0100）
ALTER TABLE ONLY public.memory_collection_pause       ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_correction_command     ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_deletion_request       ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_deletion_target        ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_export_receipt         ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_policy_publish_command ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.memory_reindex_task           ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.question_rubric               ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.question_rubric_criterion     ALTER COLUMN id SET DEFAULT public.uuidv7();
