# REQUEST — **G1 SCORE-S3 收尾刀**（#42 对拍进 CI · #43 BEFORE INSERT 初始态白名单 · #41 ADR-0020 accepted · 评分卡 S3 面零触遗留 · 起草 docs-only）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（docs-only 起草 · Ban coding · Ban prove 执行 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Line**: **G1 SCORE-S3 收尾刀**（蓝本 `batch-residual-plan.md:86` G1 行 @ `line/batch1-residual` `ab02d499` · LEDGER 既定 `product-campaign-LEDGER.md:27`「对拍测试+INSERT 触发器+ADR-0020 accepted」·:87「#41 🔒SCORE S3」·SCORE S2 切片表 S3 残面承载）
**Base tip**: `9cac8778`（`feat/mysql-schema-skeleton` 主线 tip 2026-10-10 实测 · 本 worktree `line/g1-score-s3` · 本文全部 file:line 于本 tip **亲读重 pin**——审计行号 @0100/0103/0109 逐位原位命中，无漂移）
**Author**: `g1-draft`（REQUEST 起草席 · 实现不自批）
**Date**: 2026-10-10
**依据**: ①`batch-residual-plan.md:16,41,86,114`（G1 组=M 体量·#42/#43/#41 未开工·派序 G2/G3 后 G1/G4）②外部更正版 `/Users/miaole/Documents/Meetwise产品审计-更正版/issues-master.md` #42(:225)/#43(:377)/#41(:489) 亲读原文+修法列 ③SCORE S2 卷 `extreview-score-writer-REQUEST.md` §1.6/§3.10-12/切片表 S3 行+§尾 S2 EXEC 登记：143「零 S3 面（#42/#43/#47/#41 零触）」④`product-campaign-LEDGER.md:27,87,116,207`

---

## §0 立靶（三条款现状亲读 @9cac8778）

### #42（P2·报告·issues-master:225）——TS↔SQL 状态机/总分公式各手写一份，漂移只靠测试发现

- **审计原文**（:225 亲读）：「ScoreCard 状态机与确定性总分公式在 TS 与 SQL 各手写一份，漂移只靠测试发现」；证据列指 `packages/domain/src/scoring-fact-root.ts:47-66`·`0100:385-422`·`0109:157-193`·`0103:234-240`；修法列：「以 SQL 为唯一真相，TS 侧由迁移元数据生成或加 TS↔SQL 对拍测试进 CI」。**蓝本 G1 钉对拍测试形态**（`batch-residual-plan.md:86`「TS↔SQL 对拍测试进 CI（状态机+确定性总分公式）」）；生成化形态另裁（SCORE S2 §7 Non-claims 已声明「≠ #42 SQL 唯一真相终局·只钉对拍测试」）。
- **TS 侧（双份之一）**：`packages/domain/src/scoring-fact-root.ts:19-27`（SCORE_CARD_STATUSES 10 态/SCORE_REQUEST_STATUSES 5 态枚举）·`:47-58`（SCORE_CARD_TRANSITIONS 证据流转移表）·`:62-67`（canTransitionScoreCard：幂等边/吸收态/生命周期边）；`:5-7` 头注释**自认工程债**：「靠跨侧 test pin（proof 逐值比对）兜底——两侧是两份手写真相，漂移不会在运行期被自动拒绝」。公式镜像：`packages/domain/src/scoring-aggregation.ts:97-119`（band∈{below:0,meets:1,exceeds:2}·per-criterion=50×band·`Math.round(Σ(weight×band×50)/Σ(weight))`·越界/空集 fail）。
- **SQL 侧（双份之二）**：score_request 单向门 `0100:362-382`（assert_score_request_status_oneway+guard `:381-382` BEFORE UPDATE OF status）；score_card 状态机 `0100:385-422`（assert_score_card_status_transition `:385-417`+guard `:420-422`）；**live 真相=0109 版**：`0109:157-194` 同名函数 CREATE OR REPLACE 重挂，扩边 `review_required→unscored`（`:184-185`，SCOR-03 合法出边）——对拍基准必须取 0109 版非 0100 版。公式 **SQL 侧自己也是两份**：`0103:234-240`（write_final 路径·`:234` 注释「score = 50×band；总分 = round(加权均值)」·`:240` round）与 `0109:416-420`（adjudicate 路径·`:416` 同式累加·`:420` round）。枚举 CHECK：`0100:141`（score_request 5 态）·`0100:178`（score_card 10 态）。
- **既有测试=双侧独立抽测，非对拍**：`packages/db/test/scor-01.proof.ts:222-243` §E——TS 侧 6 条样例断言（`:224-235`）+ DB 侧 4 条样例转移/拒断言（`:236-243`），两侧各自对手写期望断言，**无全矩阵逐值互推**；`:242-243` 枚举一致仅断「长度 10/5」非值级；`scor-03.proof.ts:188-191` 补 review_required→unscored 边 TS 侧断言。10 态×10 态矩阵、吸收态全集、公式值级（band 边界×权重×round）均未对拍。
- **CI 缺口（「进 CI」的实指）**：`.github/workflows/ci.yml` per-push 本地 PG 车道族（`db:up` :128 起·`db:prove` :146 等）**不含 scor-01/02/03**——per-push 仅 `scor-00:http:prove`（:208）与 `scoring-eval:prove`（:253）；scor-01/02/03 走 `scripts/run-e2e-isolated.mjs` 远程隔离库（target 表 :1451/:1465/:1481·需 E2E_CLOUD_ISOLATED=1·ci.yml :92-93 注释明示不在 per-push）。⇒ 状态机对拍**现状零 per-push 覆盖**。

### #43（P3·报告·issues-master:377）——触发器只挂 BEFORE UPDATE，write_final 直插终态靠函数白名单

- **审计原文**（:377 亲读）：「状态转移触发器只挂 BEFORE UPDATE OF status，write_final 直接 INSERT 终态靠函数白名单」；证据列 `0100:421-422`·`0103:132,251-258`；修法列：「补 BEFORE INSERT 触发器校验初始状态白名单」。
- **现状亲读**：score_card 全部 INSERT 面四处——①两阶段 record 路径插 `pending_evidence`（`0100:869-876`·`:875`）；②更正路径 supersede 插 `pending_evidence`（`0100:1006-1013`·`:1010`）；③write_final 直插终态（`0103:251-258`·`:257` status=p_target_status），白名单在函数体内 `0103:129-134`（`p_target_status NOT IN ('practice_eligible','b_review_eligible')` → `scoring_final_card_invalid` :132 亲读）；④adjudicate 直插（`0109:470-478`·`:478` status=v_status），v_status ∈ {`review_required` `:455`·`practice_eligible` `:457`}。⇒ **实测初始态并集={pending_evidence, review_required, practice_eligible, b_review_eligible}**；INSERT 触发器缺位意味着 definer 侧任意新函数可直插任意态（10 态 CHECK 枚举内全开）。表级 INSERT 仅授 scoring_definer_owner（0100 权限面·SCORE S2 rev2「EXTREV-7 对齐定谳」同读）——白名单触发器闭合的是 definer 层内侧缝，非 app_role 直写。
- **与 SCORE S2 的形态差**：S2 §2 曾裁「#43 迁移形态不做（改测试覆盖形态）·若双审裁迁移形态则移交 EXTREV-3B 立账」；本刀按 LEDGER 既定（`LEDGER:27`「INSERT 触发器」·`batch-residual-plan.md:86`「BEFORE INSERT 触发器校验初始状态白名单」）**落真迁移**。

### #41（P3·文档不符·issues-master:489）——ADR-0020 仍 proposed，但 0100–0109 已在主线且 score-writer 已接线

- **审计原文**（:489 亲读）：「ADR-0020（评分卡事实权威）仍为 proposed，但 0100–0109 已在主线」；证据列 `ai-docs/architecture/adr/README.md:77`·`adr/0020-scorecard-authority-and-eligibility.md:7`；修法列：「score-writer 接线后把 ADR-0020 改为 accepted」。
- **现状亲读 @9cac8778**：frontmatter `0020:8` `status: proposed`·正文标题 `0020:18`「# ADR-0020 评分卡事实权威与资格门 · proposed」·目录 `README.md:77`「### ADR-0020 … · proposed」（后果行含「等待产品确认与专用 writer 部署设计」——该等待项已不成立）。
- **前置已满足**：score-writer S1/S2 已落主线（S2 EXEC `50cb3238`+nail `2c3a7d80`「P0 chain #40 code-complete」在 `git log` 亲证）——修法前置「接线后」成立，纯滞后文档。

**根因合并裁定披露**：三条**非同一根因**（#42=双写漂移·#43=INSERT 无守门·#41=文档滞后），不合并条款；同域同刀承载（LEDGER 既定 SCORE S3 收尾），各条独立验收独立可回退。

## §1 范围（逐条改动清单·file:line 全亲读 @9cac8778）

| # | 面 | 锚点（亲读） | 改动 | 备注 |
|---|---|---|---|---|
| 1 | #42 对拍 proof（状态机） | TS `scoring-fact-root.ts:19-27,47-58,62-67` vs SQL `0100:141,178,362-382`·`0100:385-422`·`0109:157-194`（live 版） | 全矩阵逐值对拍：card 10 态×10 态每格 TS 判定 vs DB 触发器行为（合法通/23514 拒）互推；request 5 态单向门同法；吸收态/幂等边/生命周期边全覆盖；枚举**值级**比对（替 scor-01:242-243 的长度级）；SQL 基准取 0109 重挂版含 review_required→unscored 边 | 以 SQL 为真相；漂移则修 TS 向 SQL 对齐且收据逐值披露 |
| 2 | #42 对拍 proof（公式） | TS `domain/scoring-aggregation.ts:97-119` vs `0103:234-240` + `0109:416-420` | 公式值级对拍：band 三档×权重组合×round 边界；空集/越界/非整数拒绝路径 TS fail vs SQL 异常行为对齐；两 SQL 副本（0103/0109）互相亦对拍 | SQL 侧自身双份=对拍对象×2 |
| 3 | #42 进 CI | `ci.yml:146`（db:prove 本地 PG 车道先例）·:208（scor-00 先例）·run-e2e-isolated target 表 :1451/:1767 | 对拍 proof 接线 per-push CI 本地 PG 车道族（ci.yml 增一步）；**D1**：形制由双审裁——(a) 扩 scor-01/scor-03（已双注册）+ ci.yml 增步 vs (b) 新键 `scor-parity:prove`（照惯例根 package.json+run-e2e-isolated target 表双注册+ci.yml 增步） | Ban 动远程隔离库车道语义；#98 nightly 另域 |
| 4 | #43 INSERT 触发器迁移 | `0100:421-422`（仅 UPDATE）·白名单 `0103:129-134`·直插 `0100:875,1010`·`0103:251-258`·`0109:470-478(:455,:457)` | 新 migration（编号顺延 0158+·Ban 复写 0100/0103/0109）：score_card BEFORE INSERT 触发器校验 NEW.status ∈ 初始白名单 {pending_evidence, review_required, practice_eligible, b_review_eligible}（§0 实测并集），非法初始态 RAISE 23514 | **D2**：白名单精确值+负测矩阵由双审复核（含「四 writer 合法初始态 INSERT 仍通」正测——SECURITY DEFINER 函数同样触发本触发器，白名单错一值即断 S1/S2 已落写卡链）；score_request INSERT 面是否同迁移补校验由双审裁（audit 未点·默认不做） |
| 5 | #43 守门 prove | 触发器负测+writer 正测 | 裸 INSERT 非白名单态（如 evidence_valid/unscored/superseded）被拒 23514；经 scoring_record_score_card/write_final/adjudicate 的合法初始态仍全通（真实函数行使非伪造） | S1/S2 写卡链回归不可破 |
| 6 | #41 ADR 翻 accepted | `adr/0020-*.md:8,18`·`adr/README.md:77` | 三处 proposed→accepted + 决策记录补一行「已接线」锚（引 score-writer S1/S2 收据+nail `2c3a7d80`）；**D3**：README:77 后果行「等待产品确认与专用 writer 部署设计」措辞按 accepted 语义收口，正文改写幅度由双审裁（最小形制=状态行+决策记录附录，不改决策内容本身） | docs-only |

## §2 非范围（划界防双改/扩权）

- **S2 已落面零触**：#52 v6 量表/`SCORING_PROMPT_POLICY_VERSION`、D5 三钉/`deriveScoreCardAssessmentLegacy`、#50 v3、去桩后的 `interview.proof`、D4 租约形制——全部零触零重构。
- **评分语义零变**：本刀不改任何合法转移、写卡路径、公式取值、聚合行为；#42 对拍以现行 SQL live 语义为基准，**Ban 以对拍为名改 SQL**；TS 若检出漂移只许 TS 向 SQL 对齐且逐值披露。
- **#47 不属本刀**（范围披露）：SCORE S2 零触清单曾并点 #47（assessment_report.dimensions.evidence 类型统一），但 `fix-roadmap.md:87,188` 已将 #47 移入批2（消除 #47→#45 前向依赖），蓝本 G1（`batch-residual-plan.md:86`）不含——Ban 顺手。
- **#98 边界**：nightly/隔离库主链 E2E/发布门接线归 #98 域（批5-D）；本刀只接 per-push ci.yml 本地 PG 车道族。
- **既有 base 红不碰**：`scoring-report-integrity.proof.ts:99` hasOwn TypeError（S2 登记 pristine 同形）非本刀范围；若 D1 裁扩该键须先裁红，默认不扩。
- **零迁移重写**：0100/0103/0109 已落主线不重写；#43 只新增顺延编号迁移。
- **SSOT 零触**：backlog/matrix/checklist/queue/issues-master 状态行不翻（更正版为外部文档·回写归协调方）；零 G7 面；Ban secrets/`.env*`。

## §3 Prove

- **主证**：#42 对拍 proof EXIT=0（全矩阵断言计数如实宣布：card 10×10+request 5 态+公式值级组）；#43 迁移后 `migrate:prove`/`db:prove` 仍绿 + §1.5 负测/正测全绿；#41 过 `docs:check`（ci.yml:45 同门）。
- **回归门**：`interview:prove` EXIT=0 不回退（S1/S2 写卡链经真实函数行使回归）；scor-01/scor-03 若被扩改，原断言只增不删不弱化。
- **est live=0**：零 model 外呼、零真实供应商接触、`actualSpendCny=null`、0 Key 值接触。
- 既有环境红如实披露零 retry-to-green；Ban masking/假绿叙事；attempts 一次优先。

## §4 Ban

Ban 触 S2 已落面（v6/D5/legacy 聚合器/去桩 proof/D4 租约）· Ban 改 SQL 语义（0100/0103/0109 重写、公式/转移表改值）· Ban 对拍漂移静默（TS 修复必须收据逐值披露）· Ban #47/#98/#104/#45 域顺手 · Ban 既有 base 红修复（:99 另裁）· Ban 复写已落迁移（新迁移 only·编号顺延）· Ban SSOT 编辑 · Ban model 外呼（est live=0 铁律）· Ban self-approve/代签 peer（alone≠dual）· Ban retry-to-green/masking/假绿 · Ban push 冒充执行 · Ban Meridian · Ban buy cloud。

## §5 Pins（十一值照抄 · 本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## §6 Non-claims

对拍绿 ≠ 评分语义正确性已证（语义正确性由 0100/0103/0109 落库审计承担·本刀只钉两侧一致）；#43 触发器 ≠ 全量写路径安全证明（definer 层白名单外侧归 db-acl 面）；ADR accepted ≠ 评分体系完成（#104 读面 v2/#45 五档/评估质量 eval 均另刀）；ci.yml 增步绿 ≠ #98 收口（nightly/发布门另域）；est live=0 ≠ 零成本主张外延；本刀 ≠ 批1 收官（G2/G3/G4+#257 残余另刀）。

## §7 STOP

本 REQUEST 为 docs-only 起草，**不授权 coding/prove 执行/实跑/push**。下一步：预执行双审（`awaiting_pre_exec_dual`·建议 db-schema + CI/门禁 双域——D2 白名单精确值与迁移形制归前者·D1 CI 接线形制归后者）BOTH Verdict: PASS → meetwise 授权 EXEC（含 D1/D2/D3 定值）→ coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail。implementer 不自批 · **alone ≠ dual** · **STOP**。

---

*REQUEST stub · G1 SCORE-S3 收尾刀 · Line line/g1-score-s3 · g1-draft · 2026-10-10 · PENDING awaiting pre-exec dual · alone ≠ dual · Ban push · STOP*
