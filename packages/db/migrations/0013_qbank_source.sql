-- 0013_qbank_source.sql — qbank 策展源表 + 审核门 + 跨租户投毒隔离(地基层)。
--
-- 背景/威胁模型:今天 qbank(共享题库)由系统 owner 直写全局向量池(vector_chunk kind='qbank',见 06_retrieval),
--   而该表读策略是 `kind='qbank' OR owner=principal` —— 任何用户都能 INSERT 一条 owner=自己、kind='qbank' 的向量块
--   (WITH CHECK 只校 owner=自己,对 kind='qbank' 无限制),之后全体用户检索 qbank 都命中它 → **跨租户投毒**。
--
-- 本轮范围(诚实边界,重要):本迁移**只建策展门**——一条"提议→审核→approved 才可进策展全局池"的合法通道,
--   并在门表内部把投毒手段(自审批/越权审核/未审内容进池/自封 curator/重复投毒)在 DB 层结构化挡死。
--   本轮**不接管** vector_chunk 的直写与 annSearch 的读取(那需改 06_retrieval 策略 + 让 annSearch JOIN 本门,属后续)。
--   ⚠️ 因此在检索接管落地前,06_retrieval 的 vector_chunk 直写洞**仍开**;此门是"新增的合法旁路 + 门本身可验证",
--   不是"已封死整条投毒链"。切换步骤见文末 TODO。嵌入/分块管线同样在下游(promoteToPool 之后再嵌入)——honest gap。
--
-- 幂等/非破坏:CREATE TABLE IF NOT EXISTS + DROP POLICY/TRIGGER IF EXISTS + CREATE OR REPLACE FUNCTION/VIEW
--   + CREATE [UNIQUE] INDEX IF NOT EXISTS(脏库可重跑,不 DROP 丢数据)。

-- ── 授权根:curator 白名单 ────────────────────────────────────────────────────────────
-- 谁能审核 = 是否在此表。app_role 只授 SELECT(策略要读它判权限),并**显式 REVOKE 写**(信任根不可自封,
-- 显式拒绝而非依赖"隐式未授权",防 01_schema 的 GRANT ALL 若在本迁移之后重跑而回补写权)。只有超级用户能 seed curator。
CREATE TABLE IF NOT EXISTS qbank_curator (
  user_id    text PRIMARY KEY,
  granted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON qbank_curator TO app_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON qbank_curator FROM app_role;   -- 显式拒写:信任根不可被 app_role 自封
ALTER TABLE qbank_curator ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_curator FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_curator_read ON qbank_curator;
CREATE POLICY p_curator_read ON qbank_curator FOR SELECT USING (true);   -- 名单可读(非敏感);写=无授权+无策略=双拒

-- 当前 principal 是否 curator。STABLE + INVOKER:app_role 有 qbank_curator SELECT 权,策略里可安全调用。
-- 空 GUC(app.principal_user 未设)→ NULL,`user_id = NULL` → 不匹配任何人(curator 表无空行)→ 安全 fail-closed。
CREATE OR REPLACE FUNCTION qbank_is_curator() RETURNS boolean
  LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM qbank_curator WHERE user_id = current_setting('app.principal_user', true))
$$;

-- ── 策展源表 + 审核状态机 ────────────────────────────────────────────────────────────
-- 状态机:pending →(curator)→ approved / rejected;approved →(curator)→ rejected(撤销/召回被投毒内容)。
-- 非法跃迁 + 关键列篡改由触发器拦;越权审核由 RLS 拦;自审批由 WITH CHECK 拦;陈旧审核由 status 作 CAS 令牌拦。
CREATE TABLE IF NOT EXISTS qbank_source (
  id           text PRIMARY KEY,
  kind         text NOT NULL CHECK (kind IN ('official_doc','question_bank','manual')),  -- 官方文档/题库/人工
  uri          text,                                    -- 来源(文档 url / 题库标识 / 人工录入批次)
  content_hash text NOT NULL,                           -- 内容指纹:去重 + 防重复投毒
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  review_note  text,                                    -- 审核意见(为何拒/为何批)
  added_by     text NOT NULL,                           -- 提议者(候选人/招聘方/运营)——低信任输入
  reviewed_by  text,                                    -- 审核人(必为 curator)
  version      int  NOT NULL DEFAULT 0,                 -- CAS:陈旧审核落败
  created_at   timestamptz NOT NULL DEFAULT now(),
  reviewed_at  timestamptz
);
CREATE INDEX IF NOT EXISTS ix_qsrc_status ON qbank_source (status);
-- 去重仅对"活跃"(非 rejected)源生效:同内容只能有一条活跃源(防重复投毒/刷量),
-- 但**被拒的 hash 不永久占坑** → 正规内容日后仍可重新提议(否则一次误拒=对该内容的永久 DoS)。
CREATE UNIQUE INDEX IF NOT EXISTS uq_qsrc_active_hash ON qbank_source (content_hash) WHERE status <> 'rejected';
GRANT SELECT, INSERT, UPDATE ON qbank_source TO app_role;   -- 提议(INSERT)+ 审核(UPDATE);不授 DELETE(留痕)

ALTER TABLE qbank_source ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_source FORCE ROW LEVEL SECURITY;
-- 读:approved 源公开(=已进策展目录)/ 提议者看自己的 / curator 看全部。
DROP POLICY IF EXISTS p_src_read ON qbank_source;
CREATE POLICY p_src_read ON qbank_source FOR SELECT
  USING (status = 'approved'
      OR added_by = current_setting('app.principal_user', true)
      OR qbank_is_curator());
-- 提议:任何人可 INSERT,但只能 added_by=自己 且 status='pending' —— 堵住"插入即 approved"自审批。
DROP POLICY IF EXISTS p_src_propose ON qbank_source;
CREATE POLICY p_src_propose ON qbank_source FOR INSERT
  WITH CHECK (added_by = current_setting('app.principal_user', true) AND status = 'pending');
-- 审核:只有 curator 能 UPDATE(approve/reject/改 note)。候选人 UPDATE = USING 假 = 0 行,永远改不动 status。
DROP POLICY IF EXISTS p_src_review ON qbank_source;
CREATE POLICY p_src_review ON qbank_source FOR UPDATE
  USING (qbank_is_curator())
  WITH CHECK (qbank_is_curator());

-- 审核 UPDATE 的两道结构约束:① 状态机合法跃迁;② 关键列不可篡改(连 curator 也不能借审核 UPDATE 改
-- content_hash/added_by/kind —— 否则可把一条已被审阅的源"偷换内容/冒充提议者")。
CREATE OR REPLACE FUNCTION qbank_source_guard_update() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.content_hash <> OLD.content_hash OR NEW.added_by <> OLD.added_by OR NEW.kind <> OLD.kind THEN
    RAISE EXCEPTION 'qbank_source 关键列(content_hash/added_by/kind)不可变' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;         -- 不改 status(仅改 note 等)恒允许
  IF (OLD.status, NEW.status) IN (
       ('pending','approved'), ('pending','rejected'), ('approved','rejected')
     ) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'qbank_source 非法状态跃迁 % -> %', OLD.status, NEW.status USING ERRCODE = 'check_violation';
END $$;
DROP TRIGGER IF EXISTS trg_qsrc_update ON qbank_source;
CREATE TRIGGER trg_qsrc_update BEFORE UPDATE ON qbank_source
  FOR EACH ROW EXECUTE FUNCTION qbank_source_guard_update();

-- 去重反查(SECURITY DEFINER,绕 RLS):按 content_hash 取当前活跃源的 id。
-- 用途:提议命中 ON CONFLICT 后诚实返回既有源 id —— 否则他人 pending 源被 RLS 挡成不可见时,
-- 上层会误报一个未落库的幽灵 id(下游 promote 撞 FK)。只回不透明 id,不回内容;须已知精确 hash 才可查,非 PII。
CREATE OR REPLACE FUNCTION qbank_active_source_id(p_hash text) RETURNS text
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM qbank_source WHERE content_hash = p_hash AND status <> 'rejected' LIMIT 1
$$;

-- ── 策展全局池:唯一合法的"内容进全局 qbank"入口 ──────────────────────────────────────
-- 生产嵌入管线应只经此表登记被检索的策展块(ref_id 指向 vector_chunk 的块),而非直写 vector_chunk。
-- 结构化门(触发器):被登记的 source 必须 approved。写权限(RLS):只有 curator 能 INSERT。双门。
-- 读:RLS 结构化**只暴露"当前仍 approved 源"的条目** → 撤销(approved→rejected)即时从直读与视图双双消失(非查询自觉)。
CREATE TABLE IF NOT EXISTS qbank_pool_entry (
  id           text PRIMARY KEY,
  source_id    text NOT NULL REFERENCES qbank_source(id),
  ref_id       text NOT NULL,                           -- 指回 vector_chunk.ref_id(下游嵌入后回填)
  content_hash text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ref_id)                                       -- 全局唯一:一个检索块只归一条源,避免候选重复/多源争块
);
CREATE INDEX IF NOT EXISTS ix_qpool_source ON qbank_pool_entry (source_id);
GRANT SELECT, INSERT ON qbank_pool_entry TO app_role;                 -- 写仅 curator(策略);读经 RLS 过滤到 approved
REVOKE UPDATE, DELETE, TRUNCATE ON qbank_pool_entry FROM app_role;    -- 不许改/删:池条目 append-only

ALTER TABLE qbank_pool_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_pool_entry FORCE ROW LEVEL SECURITY;
-- 直读结构化过滤:只暴露 source 当前仍 approved 的条目(撤销即消失)。连直查 pool 表也拿不到 pending/被撤销的块。
DROP POLICY IF EXISTS p_pool_read ON qbank_pool_entry;
CREATE POLICY p_pool_read ON qbank_pool_entry FOR SELECT
  USING (EXISTS (SELECT 1 FROM qbank_source s WHERE s.id = qbank_pool_entry.source_id AND s.status = 'approved'));
DROP POLICY IF EXISTS p_pool_insert ON qbank_pool_entry;
CREATE POLICY p_pool_insert ON qbank_pool_entry FOR INSERT
  WITH CHECK (qbank_is_curator());

-- 结构化门:只有 approved 源的内容能被选入全局池。
CREATE OR REPLACE FUNCTION qbank_pool_requires_approved() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM qbank_source s WHERE s.id = NEW.source_id AND s.status = 'approved') THEN
    RAISE EXCEPTION 'qbank_pool: 源 % 未 approved,禁止进全局池', NEW.source_id USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_qpool_approved ON qbank_pool_entry;
CREATE TRIGGER trg_qpool_approved BEFORE INSERT ON qbank_pool_entry
  FOR EACH ROW EXECUTE FUNCTION qbank_pool_requires_approved();

-- 检索候选唯一入口(security_invoker=off:以视图属主/超级用户读底表,只暴露 approved 源的块)。
-- 撤销(approved→rejected)后该源的块**立即**从视图消失,即便 pool_entry 行仍在 → 撤销隔离是结构保证。
CREATE OR REPLACE VIEW qbank_retrieval_candidate AS
  SELECT p.ref_id, p.source_id, p.content_hash
    FROM qbank_pool_entry p JOIN qbank_source s ON s.id = p.source_id
   WHERE s.status = 'approved';
GRANT SELECT ON qbank_retrieval_candidate TO app_role;

-- TODO(检索接管,后续迁移/PR):① 06_retrieval 收紧 vector_chunk 写(REVOKE app_role 直写 qbank / WITH CHECK 加 kind='memory'),
--   由经本门的 SECURITY DEFINER 写入;② annSearch(kind='qbank') 改为仅在 qbank_retrieval_candidate.ref_id 集合内召回。
--   两步落地前,vector_chunk 直写洞仍开,本门为"合法旁路 + 门自证",非整链闭合。
