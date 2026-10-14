# BASELINE-RED5 — 基线红五件清欠小刀（integrity GRANT+r4 双钉重指+corpus fixture+dbhy1 登记）

**状态**：`executed:awaiting_post_prove_dual`（EXEC 已落 line/baseline-red5：恰 9 文件 4 码面修复+SSOT 随翻·零迁移零产品码·⛔push·五门隔离复跑逐件 EXIT=0）· 前态：诊断席定谳五件全 S 级（陈旧钉/登记缺位/fixture 未随迁·零产品回归）·协调方授权一柄小刀全清（沿 g7fix/基线红清欠先例简卷）· 基线 = 主线 `feat/mysql-schema-skeleton` tip `c4025186`（pull 后实取·origin/main `c4244470` 系其祖先不含战役面·worktree 亲证）· 分支 `line/baseline-red5`。

## 1. 五件修法（照诊断报告·逐件落点）
1. **qbank-integrity-upgrade**：`apps/worker/test/qbank-integrity-upgrade.proof.ts:211` +1 行 `GRANT SELECT, INSERT, DELETE ON schema_migrations_steps TO ${migrationRole}`（30084d98 mig-runner 旁表新守卫面 proof 角色未随迁·修前隔离实跑红线=`permission denied for table schema_migrations_steps` @migrate.ts:442 via runMigrationsAsRole :252 亲证）。
2. **r4-real-wire-impl+r4-p-planner-unit（同刀同修）**：①`r4-real-wire-impl.proof.ts:40`/`r4-p-planner.proof.ts:37` 两 harnessPath 改指 archive 现址 `receipts/archive/2026-09-batch23/harness/r4-{real-wire-impl,p-planner}.md`（426e0b28 git mv 3025 件未随迁·status/parent 两文件仍在 ai-docs/delivery/harness/ 原位零动）；②`r4-real-wire-impl.proof.ts:165-168` status/parent 断言+`r4-p-planner.proof.ts:243` status 断言改钉现行诚实句「≠ 题域已隔离」（5b3c854e EG3 新句·现文 status 17 处/parent 3 处亲在·旧句「题域隔离 NOT closed」现文 0 处·禁回钉旧句语义倒退）。
3. **qbank-corpus-retrieve**：`apps/worker/test/qbank-corpus-retrieve.proof.ts:165` scripted 题面 `基础题面样本`（6 字）→`基础题面样本：解释缓存一致性`（14 字·≥8 过 question-critique.ts:21 too_short 门·competencyKeywords 未传零 off_competency 面·无 leading/duplicate 面）·behavioral 臂 `:180` 4 字题面仅落 detail 非断言面零动（断言只查 behavLocalCalls===0 亲证）。
4. **dbhy1 P3-1**：`packages/db/test/dbhy1.proof.ts` P3_RESIDUE_FILES +4=bill1/2/3 按纪律注释族注记（头注「禁止用 sql/ 影子 schema」文本提及·非加载器）+bill4 按 entpay-s3 形注记（0185 函数体与 23_api_gateway.sql 镜像逐字节对账承重消费 ⓪-b 直载比对·:177 亲证）。
5. **SSOT 随翻**：checklist「Line AG-37 nail」段 +1 行随注（errata① 三红+QSEC 门② P3-1+errata⑤ integrity 五件闭合·纯插行原文零改）+ag37 卷 §9.4 引用区 +1 行随注（:150/:151/:153 三红闭合指向）+LEDGER 刀位图 +1 行（🔄 EXEC executed:awaiting_post_prove_dual）+本卷。

## 2. 门矩阵（修前基线红亲证→修后复跑绿·同机制同 FAIL 数）
| 门 | 修前基线（实跑） | 修后复跑 |
|---|---|---|
| `qbank-integrity-upgrade:prove` | EXIT=1（permission denied schema_migrations_steps·migrate.ts:442） | **EXIT=0·20 PASS** |
| `r4-real-wire-impl:prove` | EXIT=1（恰 5 FAIL 全 harness .md 面） | **EXIT=0 全绿** |
| `r4-p-planner-unit:prove` | EXIT=1（恰 2 FAIL T7 文案面） | **EXIT=0 全绿** |
| `qbank-corpus-retrieve:prove` | EXIT=1（恰 1 FAIL fundamental question_critique_failed） | **EXIT=0·37 PASS** |
| `dbhy1:prove` | EXIT=1（恰 1/28·P3-1 未登记 bill1-4） | **EXIT=0·28 断言全绿 offenders=0** |
| `pnpm turbo typecheck --force` | — | **EXIT=0（8/8·0 cached）** |
| `pnpm docs:check` | — | **EXIT=0（80 required·2069 managed·落卷后复核见 §4）** |
| markers（改动集五类 grep） | — | **零命中** |
| 邻接门 ag37 面（本卷随注触其卷面） | — | ag37-deficit-persist 门不受码面影响（§9.4 三红=本刀所清·随注后 docs:check 复核） |

## 3. Ban / Non-claims
零迁移零产品码（改动集=4 proof .ts+SSOT 3 .md+本卷）·零 E2E 场景·禁回钉旧句「题域隔离 NOT closed」（语义倒退）·pins 十一值照抄零翻转（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null·本刀 prove 全 scripted 假体/隔离真迁移 PG 零模型外呼零消耗）·实现方不自批·alone≠dual·EXIT0≠post-prove。

## 4. 验收
diff 恰 9 文件亲证+五门逐件 EXIT=0+基线红修前实跑五门原值在案（非引史值）+tsbuildinfo typecheck 门漂移 checkout 还原零入 commit（沿 AG-37 nail 先例）+⛔push（STOP=executed:awaiting_post_prove_dual·合并归协调方 post-dual 后）。

## 5. 偏离任务书
零（五件修法逐件照诊断落点·SSOT 三面+卷宗随翻均任务书内）。
