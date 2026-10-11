-- 0160 — H3 LEVEL-SCHEME #45/#102 单一出处立法：level_policy_version 策略表 + scheme v2 种子行。
--
-- 蓝本（H1 阈值决议 ai-docs/delivery/harness/h1-thresholds.md §4.1 + §3 + 附录 A'）：
--   * DDL 照 H1 §4.1 = refactor-backlog:744 A.4 形（2026-10-09 修订·单字段+版本号）：
--     id uuid pk · scheme_version text UNIQUE · status CHECK in ('draft','calibrating','active','retired')
--     · levels/weights/thresholds/evidence_requirements/confidence_map 五 jsonb
--     · prompt_version text · calibration_release_id uuid NULL · created_at。
--   * 数值运行时单源 = 本表（发布后不可变）；TS 侧镜像常量落 packages/contracts（LEVEL_SCHEME_V2），
--     域内纯函数与 web 标签面只读镜像·禁第二套 operative 数值（H1 §4.1/§4.2）。
--   * seed v2 行 = 附录 A' 冻结抄写面 16 字段逐字照抄（字段名即契约）入五 jsonb 列：
--       levels                ← tiers / scoreFloor / labels                     （3 字段）
--       weights               ← weightByDifficulty / shrinkage / capabilityWeight（3 字段）
--       thresholds            ← coreFloor / consistencyMargin / highestPassedDifficultyLine /
--                              belowL1Reference / milestoneSimulationPass / gapLine（6 字段）
--       evidence_requirements ← minCards / minCoverage / hardEvidence           （3 字段）
--       confidence_map        ← confidenceCaps                                  （1 字段）
--     计 16 字段；status='calibrating'（H1 §3.4·黄金集校准前 v2 不得 active）；
--     calibration_release_id / prompt_version 置 NULL（校准发布记录尚不存在·H1 §6 门未过·零「已建/已校准」叙事）。
--   * 发布后不可变：append-only 触发器沿 question_rubric 做法（0100:294-296 同形）——
--     BEFORE UPDATE/DELETE 一律拒（ERRCODE 23514）。行级不可变即策略值不可原地改写；
--     校准升版走「新 scheme_version 新行」（append-only·H1 §3/§7），状态机流转与发布面
--     （calibrating→active·需 calibration release 记录）归发布刀——届时以新迁移调整守门形制，
--     本刀保守 fail-closed（REQUEST §2① 冻结语义）。
--   * 中文标签入配置不入 DB CHECK（附录 A 第 1 条·labels 字段随 levels jsonb 承载）。
--
-- 形制：expand-only（仅加表加行·零删改既有对象）·SET LOCAL lock_timeout（0155/0157 同形·H1 §3.6）。
--       先建表+落种子、后收紧授权/RLS（自举序·种子 INSERT 不与 FORCE RLS 相互作用）。
-- 迁移编号 0160：0152-0159 已占（0152 双号并存=0155:4-5 已登记回填史实）·REQUEST §1 漂移表实测重 pin。
-- 本刀范围外：candidate_level_assessment 表（#124 后刀）·R1-R9 算法·发布门执行（H1 §6）。

SET LOCAL lock_timeout = '2s';

-- ── 策略表（A.4 形）─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS level_policy_version (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  scheme_version text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('draft','calibrating','active','retired')),
  levels jsonb NOT NULL,
  weights jsonb NOT NULL,
  thresholds jsonb NOT NULL,
  evidence_requirements jsonb NOT NULL,
  confidence_map jsonb NOT NULL,
  prompt_version text,
  calibration_release_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 发布后不可变（append-only 触发器·0100:294-296 question_rubric 同形）────────────
CREATE OR REPLACE FUNCTION assert_level_policy_version_immutable() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'level_policy_version_immutable' USING ERRCODE='23514';
END $$;

REVOKE ALL ON FUNCTION assert_level_policy_version_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS level_policy_version_immutable_guard ON level_policy_version;
CREATE TRIGGER level_policy_version_immutable_guard
  BEFORE UPDATE OR DELETE ON level_policy_version FOR EACH ROW EXECUTE FUNCTION assert_level_policy_version_immutable();

-- ── seed：scheme v2 行（附录 A' 16 字段逐字照抄·字段名即契约·【占位·待校准】）────────
-- 待校准标记：status='calibrating' 即权威承载（H1 §4.4/§7.3）·TS 镜像 contracts 注记同名标记。
INSERT INTO level_policy_version (scheme_version, status, levels, weights, thresholds, evidence_requirements, confidence_map, prompt_version, calibration_release_id)
VALUES (
  'v2',
  'calibrating',
  '{"tiers":["junior","mid","senior","staff","principal"],
    "scoreFloor":{"junior":null,"mid":50,"senior":65,"staff":75,"principal":85},
    "labels":{"junior":"初级","mid":"中级","senior":"高级","staff":"资深","principal":"专家"}}'::jsonb,
  '{"weightByDifficulty":{"1":0.5,"2":0.75,"3":1.0,"4":1.5,"5":2.0},
    "shrinkage":{"k":1.5,"mu0":50},
    "capabilityWeight":{"core":1.0,"nonCore":0.5}}'::jsonb,
  '{"coreFloor":{"mid":35,"senior":40},
    "consistencyMargin":10,
    "highestPassedDifficultyLine":60,
    "belowL1Reference":30,
    "milestoneSimulationPass":70,
    "gapLine":"@see GAP (packages/domain/src/assessment.ts) = 60"}'::jsonb,
  '{"minCards":{"junior":3,"mid":5,"senior":6,"staff":8,"principal":10},
    "minCoverage":{"junior":2,"mid":3,"senior":4,"staff":4,"principal":5},
    "hardEvidence":{"mid":{"cardsDge3":2,"pDge3":0.50},
                    "senior":{"cardsDge4":3,"pDge4":0.55},
                    "staff":{"cardsDge4":4,"cardsEq5":1,"pDge4":0.65},
                    "principal":{"cardsEq5":3,"p5":0.60}}}'::jsonb,
  '{"confidenceCaps":{"maxCardsForMid":8,"maxCardsForLow":5}}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (scheme_version) DO NOTHING;   -- 幂等面：重放零重复（迁移运行器本 skip·纵深防御）

-- ── 授权与 RLS（种子后收紧：app_role 仅 SELECT·策略表无 owner_user_id 列·零 PII）──────
GRANT SELECT ON level_policy_version TO app_role;
ALTER TABLE level_policy_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_policy_version FORCE ROW LEVEL SECURITY;
-- 无 TO 子句 = 全角色域（含被 FORCE RLS 约束的表 owner）·有表级 SELECT grant 者可读。
CREATE POLICY level_policy_version_read ON level_policy_version
  FOR SELECT USING (true);
