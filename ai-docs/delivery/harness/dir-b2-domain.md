# Harness / REQUEST — DIR-1 · B2 domain 目录拆解刀（packages/db/src 域文件夹化 · 65 纯移动 · ≤5 文件分批 B2a–B2s）

**Status**: `draft:awaiting_pre_exec_dual`（rev1→rev2 · 状态保持）· **STOP**（预执行双审未开 · 未授权不得 mv · 本 REQUEST docs-only · rev2 修订见文末 Erratum）
**Date**: 2026-10-07 · **Base tip**: `e2834082`（g7p6 nail · 本 worktree 实测 HEAD · 工作树干净）
**Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`
**前置裁定引用**：DIR-1 B1（`line/dir-structure` · `409843b3` · 65 纯 git mv + 白名单路径文本）+ E4 微刀（`d3507770` · run-e2e-isolated.mjs receipt 层纯路径文本修正案）已由协调方裁定 nail —— B2 前置达成；本刀 = **同先例模式在本线的落地刀**：前缀迁移 + runner receipt 路径更新 + 静态守卫/机械串面更新，一鱼三吃并入每批。
**releaseEvidence=false** · **NOT_HA** · 本绿 ≠ 重构完成 ≠ E2E ≠ HA

---

## Pins（十一值照抄 · 本刀不改口）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=**PG-retained** · 公开 DELETE=**503**（stays）· `g7SuiteGreen=false` · `r1Closed=false`

> 脚注：`actualSpendCny=null`（本刀 docs-only/纯移动，零模型调用零计费面）。

---

## 0. 刀的边界（一句话）

把 `packages/db/src` 下 **65 个平铺业务文件**按域前缀迁入 18 个域文件夹（B1 §4.1 先例映射 1:1，本 REQUEST §2 自含全表）——**只用 `git mv`（R100 rename）+ 四类纯路径文本改写（§3 白名单），零逻辑变更**；每批 ≤5 文件（B2a–B2s 共 19 批串行），每批同批完成 **runner receipt 路径串**（`scripts/run-e2e-isolated.mjs` `isolatedReceiptSources`，E4 同型授权面）与**仓内机械消费串**（conn-stack / qdrant-store / apps tests / db test / tenant-wiring manifest）更新，杜绝 E4 型「proof 绿但 receipt ENOENT」回填债。

## 0.1 前置与口径（三条）

1. **B1 映射自含**：B1 REQUEST 正文仅存于 `line/dir-structure` 线（本 base 无该文件），故本 REQUEST §2 落位表**自含全量**（由 `git show 409843b3 --name-status -M` 65 条 rename 逐条誊录 + 本 base 复核 65/65 名单在树）。
2. **基线漂移披露**：E4 在 `409843b3` 线实测 receipt 面 245 处/104 靶/59 文件；本 base（`e2834082` 主线演进后）实测 **243 行含串 / 435 处串 / 66 唯一文件 / 117 靶 / 块外 0**（§1.2）——以本 REQUEST 实测为准，E4 数字不跨线照抄。
3. **E5 口径延续**：一切 prove/tsc 期望值 =「与各自批前 base 零回归基准」；harness 不预设 EXIT=0（B1 教训：base 即有红/类型错），批前先实测基线原值入收据，批后逐键对表。

---

## 1. 批前盘点（只读 · 全部 @ `e2834082` 实测）

### 1.1 packages/db/src 全量清单（73 文件 = 72 平铺 + tenant/index.ts · 15,454 行）

消费面四列：`inSRC`=包内 src 相对 import 消费者数 · `barrel`=index.ts 桶 re-export 行数 · `runner`=isolatedReceiptSources 含串行数 · `ext`=仓外（apps/scripts/qdrant-store/domain）含串文件数。**域**列 = §2 落位。

| 文件 | 行 | 域 | inSRC | barrel | runner | ext |
|------|---:|----|------:|-------:|-------:|----:|
| principal.ts | 2077 | **根锚** | 45（含桶） | 3 | 67 | 10 |
| index.ts | 568 | **根锚（桶）** | — | — | 39 | 7 |
| qbank-embedding-compute-cache.ts | 549 | qbank | 0 | 2 | 1 | 3 |
| recruiter.ts | 475 | recruiting | 0 | 2 | 10 | 6 |
| qbank-ingest.ts | 459 | qbank | 2 | 2 | 16 | 2 |
| job-route-decision.ts | 404 | routing | 4 | 2 | 7 | 8 |
| commerce.ts | 388 | commerce | 0 | 2 | 23 | 4 |
| qbank-miss.ts | 385 | qbank | 0 | 2 | 2 | 2 |
| qbank-retrieval-cache.ts | 374 | qbank | 2 | 2 | 7 | 3 |
| memory-control-surface.ts | 348 | memory | 0 | 2 | 1 | 1 |
| migrate.ts | 315 | **根锚** | 0 | 2 | 4 | 1 |
| qbank-route-scope-cache.ts | 310 | qbank | 0 | 2 | 2 | 3 |
| ctx03-event-source.ts | 304 | context | 0 | 2 | 6 | 1 |
| uc052-external-sink-async-purge.ts | 296 | privacy | 0 | 1 | 1 | 1 |
| int-transcript.ts | 285 | transcript | 0 | 2 | 8 | 1 |
| memory-index-generation.ts | 282 | memory | 0 | 2 | 3 | 2 |
| uc052-internal-erasure.ts | 275 | privacy | 1 | 1 | 4 | 1 |
| memory-summary.ts | 275 | memory | 0 | 2 | 3 | 1 |
| qbank-track-local-retrieval.ts | 271 | qbank | 0 | 2 | 4 | 8 |
| interview-jobs.ts | 265 | interview | 0 | 2 | 8 | 1 |
| free-text-route-decision.ts | 264 | routing | 0 | 2 | 2 | 2 |
| qbank-generation-retrieval.ts | 262 | qbank | 5 | 2 | 13 | 2 |
| rag-corpus-versioning.ts | 257 | retrieval | 0 | 2 | 3 | 1 |
| uc052-checkpoint-physical.ts | 251 | privacy | 0 | 0 | 1 | 1 |
| memory-governance.ts | 237 | memory | 0 | 2 | 2 | 1 |
| resume.ts | 220 | resume | 1 | 2 | 9 | 2 |
| scoring-fact-root.ts | 207 | scoring | 0 | 2 | 5 | 1 |
| context-compression-dispatch.ts | 193 | context | 0 | 2 | 2 | 1 |
| memory-two-stage-recall.ts | 191 | memory | 0 | 2 | 1 | 1 |
| memory-summary-tree.ts | 185 | memory | 0 | 2 | 1 | 1 |
| model-invocation.ts | 183 | model-op | 0 | 2 | 8 | 1 |
| qbank-generation-projection.ts | 174 | qbank | 1 | 2 | 5 | 2 |
| privacy-authorization.ts | 172 | privacy | 4 | 2 | 12 | 1 |
| context-compression-snapshot.ts | 170 | context | 0 | 2 | 3 | 1 |
| payment.ts | 166 | commerce | 0 | 2 | 4 | 5 |
| retrieval-backend.ts | 149 | retrieval | 0 | 2 | 0 | 1 |
| memory-fact-adjudication.ts | 146 | memory | 0 | 2 | 4 | 1 |
| usage-calibration.ts | 137 | model-op | 0 | 2 | 1 | 1 |
| candidate-route.ts | 134 | routing | 0 | 2 | 2 | 1 |
| interview-question.ts | 131 | interview | 1 | 2 | 3 | 2 |
| tenant/index.ts | 130 | **原地** | — | 2 | 1 | 0 |
| vector-plane-erasure.ts | 126 | privacy | 0 | 2 | 1 | 1 |
| memory-admission.ts | 123 | memory | 0 | 2 | 5 | 1 |
| checkpoint-privacy.ts | 123 | checkpoint | 3 | 2 | 7 | 1 |
| qbank-provider-input.ts | 116 | qbank | 0 | 2 | 1 | 1 |
| online-judge-control.ts | 114 | model-op | 0 | 2 | 0 | 0 |
| scoring-aggregation.ts | 111 | scoring | 0 | 2 | 3 | 1 |
| model-operation-admission.ts | 108 | model-op | 0 | 2 | 2 | 1 |
| int-transcript-projection.ts | 105 | transcript | 1 | 2 | 4 | 1 |
| qbank-curation.ts | 101 | qbank | 1 | 2 | 5 | 2 |
| ids.ts | 98 | **根锚（内核·新增裁定）** | 7 | 2 | 1 | 1 |
| ai-cost-governance.ts | 98 | model-op | 0 | 2 | 10 | 1 |
| report.ts | 92 | report | 0 | 2 | 7 | 2 |
| context-compression-erasure.ts | 92 | context | 0 | 2 | 1 | 1 |
| privacy-erasure-preview.ts | 90 | privacy | 0 | 2 | 1 | 1 |
| quiz-jobs.ts | 89 | jobs | 1 | 1 | 4 | 1 |
| isolated-test-target.ts | 89 | **根锚** | 0 | 1 | 64 | 1 |
| interview-graph-lease.ts | 87 | interview | 0 | 2 | 1 | 1 |
| diagnosis-jobs.ts | 87 | jobs | 0 | 1 | 3 | 1 |
| scoring-evidence-conflict.ts | 86 | scoring | 0 | 2 | 1 | 1 |
| migrate-cli.ts | 84 | **根锚** | 0 | 0 | 1 | 3 |
| memory-vector-chunk-erasure.ts | 81 | memory | 1 | 2 | 2 | 1 |
| interview-answer-dual-write.ts | 67 | interview | 3 | 1 | 1 | 1 |
| retrieval-store.ts | 66 | retrieval | 1 | 1 | 3 | 13 |
| gateway-dispatch.ts | 63 | jobs | 0 | 2 | 0 | 1 |
| memory-store.ts | 56 | memory | 0 | 2 | 2 | 1 |
| retrieval-legacy.ts | 45 | retrieval | 1 | 0 | 2 | 1 |
| interview-event.ts | 43 | interview | 1 | 1 | 4 | 1 |
| notification.ts | 36 | notification | 0 | 1 | 1 | 1 |
| worker-job-wakeup.ts | 35 | jobs | 0 | 1 | 0 | 4 |
| errors.ts | 35 | **根锚（内核·新增裁定）** | 2 | 2 | 0 | 0 |
| checkpoint-thread.ts | 34 | checkpoint | 0 | 2 | 0 | 0 |
| audit.ts | 10 | audit | 0 | 1 | 0 | 0 |

### 1.2 消费面量化（四类机械面 + 一类判留面）

| # | 面 | 实测（@`e2834082`） | B2 处置 |
|---|----|---------------------|---------|
| M1 | 桶 `src/index.ts` | 568 行 · **128 行相对 re-export**（`from './<name>.ts'`）+ tenant 2 行（:33/:34 · `barrelTenantReexports===2` 断言钉死 **禁触**） | 每批随移动改写对应 specifier |
| M2 | runner `scripts/run-e2e-isolated.mjs` `isolatedReceiptSources`（:93–:1640 · 消费点 :2558） | **243 行含串 / 435 处串 / 66 唯一文件 / 117 靶**；移动件净面 = **258 处串 / 59 文件**；内核锚 176 处（principal 67 · isolated-test-target 64 · index 39 · migrate 4 · migrate-cli 1 · ids 1）+ tenant 1 处 + errors 0 处 = **零改**；**块外 db 串 = 0 行（已证）** | E4 同型·同批纯文本改写 |
| M3 | 包内 import | src 移动件互引 + 移动件→锚/tenant（principal ×45 文件 · ids ×7 · errors ×2 · tenant ×3：candidate-route/notification/recruiter）；`packages/db/test/` 73 proof 中 **47 文件**含 `../src/` 相对 import，其中**非桶直引 = 13 文件 24 行**，须随批改 = **6 文件 17 行**（db-money3 ×3 · retrieval-backend-qdrant ×1 · uc052-{checkpoint-physical ×3 · external-sink-async-purge ×4 · external-sink-retention ×3 · internal-erasure ×3}，§5 逐批列）；其余 7 文件为锚/tenant 直引（db-acl · db-acl2 · db-trigfam-unify · migrate · pool-error-listener · isolated-test-target · tenant-enforcement）+ 34 文件仅 `../src/index.ts` 桶引 = **零改** | 每批随移动改写 |
| M4 | 仓内机械路径**串**消费（readFileSync/readRepo/readPkg/join/STATIC_TARGET） | ① `scripts/conn-stack/` 8 文件 11 处（1 处 principal 锚零改 → 净 10 处/7 文件）② `packages/qdrant-store/test/` 8 文件（全部 `retrieval-store.ts`）③ `apps/api/test/` 11 文件（1 文件仅 principal 锚零改）④ `apps/worker/src/r4-funnel-covered-count-batch{1..4}.ts` 4 文件 **17 行 = 13 处移动面**（batch1 2 · batch2 5 · batch3 5 · batch4 1）+ 4 处 index.ts 锚零改（b2:176·b3:118·b3:201·b4:115）＝ b1:97 job-route-decision · b1:181 track-local · b2:96 projection · b2:97 track-local · b2:174 compute-cache · b2:175 retrieval-cache · b2:179 memory-index-generation · b3:117 miss · b3:200 route-scope-cache · b3:202 compute-cache · b3:204 track-local · b3:205 retrieval-cache · b4:114 free-text-route-decision ⑤ `apps/worker/test/` 14 文件（6 文件仅 principal 锚零改）⑥ `packages/db/test/` 机械串 6 文件（§5 逐批列）⑦ `tenant-wiring.manifest.ts` WIRED_FILES **6 处 file: 实值**（:147/:157/:170/:227/:233/:239）+ RESIDUAL_PATHS brace-glob 2 行（:245/:251） | 每批同批纯文本改写（漏改 = 机械红） |
| S1 | 注释/文档型路径串（非机械） | `packages/db/src/int-transcript.ts:7` · `packages/db/test/db-acl.proof.ts:267/:490` · `qbank-source.proof.ts:2` · `packages/domain/src/qbank-{route-scope-cache:16,track-local-retrieval:13}.ts` · `packages/qdrant-store/src/product-vectorstore-bridge.ts:5/:9` · `apps/api/test/uc-e2e-011-{adv-refund-callback:15,refund-callback-adv:24}.proof.ts` 头注 · `packages/db/test/uc052-checkpoint-physical.proof.ts:7` 头注（B2o 批收据复述登记） · `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:19` 头注 | **判留陈旧 + 本节登记（八处）**（E3b 同型先例：`docker/env/worker.env.example:171`）；改则仅路径文本且须批 REQUEST 单列 |
| M5 | 锚点外部引用（**零改面**） | `docker/compose.prod.yml:231`（`src/migrate-cli.ts` 容器命令）· 根 `tsconfig.json:8`（`@meetwise/db → packages/db/src/index.ts`）· `scripts/deploy-check.mjs:31` · `scripts/quality-governance.proof.mjs:266` · `scripts/mysql-schema.skeleton.proof.mjs:142` · `scripts/ha/prove-nest-session.mjs:150` · `scripts/conn-stack/mysql-stack.m2-tenant:16`（全指锚）· apps 56 文件经 `@meetwise/db` 桶 import | 锚不动 ⇒ 全部零改 |
| M6 | **static guards**（`scripts/e2e-static-guards.mjs`+`.proof.mjs`） | **零 packages/db/src 引用**（只钉 `e2e/` 树：helpers 7 + full.e2e + proof） | **B2 更新点 = 0**；但五契约门每批必跑（§6 G1）——「static guards 更新」在本刀的实体 = M2 runner receipt 面 + M4 manifest/串面，guards 本体零触 |

### 1.3 候选域判定

沿 B1 先例 18 域（§2）；**本刀新增裁定 2 条**（交双审复核）：
- `errors.ts`（35 行 · 2 消费者）· `ids.ts`（98 行 · 7 消费者跨 4 域（routing/qbank/transcript/recruiting））为**跨域共享内核**，判留根锚（同 `principal.ts` 判例 · SPLIT-1 候选）——B1 基线无此二文件（主线后增），无先例覆盖，故显式裁定。
- 其余 65 文件全部入域；`tenant/` 原地；根最终留 **7 锚**（index · principal · migrate · migrate-cli · isolated-test-target · errors · ids）+ tenant/。

---

## 2. 落位表（65 mv · B1 §4.1 映射 1:1 誊录 + 本 base 复核）

| 目标文件夹 | 文件 | 数 |
|------------|------|----|
| `memory/` | memory-admission · memory-control-surface · memory-fact-adjudication · memory-governance · memory-index-generation · memory-store · memory-summary-tree · memory-summary · memory-two-stage-recall · memory-vector-chunk-erasure | 10 |
| `qbank/` | qbank-curation · qbank-embedding-compute-cache · qbank-generation-projection · qbank-generation-retrieval · qbank-ingest · qbank-miss · qbank-provider-input · qbank-retrieval-cache · qbank-route-scope-cache · qbank-track-local-retrieval | 10 |
| `interview/` | interview-answer-dual-write · interview-event · interview-graph-lease · interview-jobs · interview-question | 5 |
| `privacy/` | privacy-authorization · privacy-erasure-preview · uc052-checkpoint-physical · uc052-external-sink-async-purge · uc052-internal-erasure · vector-plane-erasure | 6 |
| `scoring/` | scoring-aggregation · scoring-evidence-conflict · scoring-fact-root | 3 |
| `retrieval/` | retrieval-backend · retrieval-legacy · retrieval-store · rag-corpus-versioning | 4 |
| `context/` | context-compression-dispatch · context-compression-erasure · context-compression-snapshot · ctx03-event-source | 4 |
| `checkpoint/` | checkpoint-privacy · checkpoint-thread | 2 |
| `commerce/` | commerce · payment | 2 |
| `model-op/` | ai-cost-governance · model-invocation · model-operation-admission · online-judge-control · usage-calibration | 5 |
| `jobs/` | diagnosis-jobs · gateway-dispatch · quiz-jobs · worker-job-wakeup | 4 |
| `routing/` | candidate-route · free-text-route-decision · job-route-decision | 3 |
| `transcript/` | int-transcript · int-transcript-projection | 2 |
| `audit/` · `recruiting/` · `resume/` · `notification/` · `report/` | audit · recruiter · resume · notification · report（单件域各独占） | 5 |
| **根锚（不动）** | index.ts · principal.ts（2077 行 · SPLIT-1 候选）· migrate.ts · migrate-cli.ts（docker `:231` 直引）· isolated-test-target.ts（e2e LIVE 靶解析锚）· **errors.ts · ids.ts（本刀新增内核裁定）** | 7 |
| **原地** | tenant/（唯一既有子目录 · 桶 2 行断言钉死） | (1) |

核对：10+10+5+6+3+4+4+2+2+5+4+3+2+5 = **65 mv** + 7 根锚 + tenant/ = 73 ✓

---

## 3. 路径文本改写白名单（四类 · 零其他内容 · E4 同型纪律）

| 类 | 面 | 规则 |
|----|----|------|
| ① | 包内相对 import | 移动件自 imports：同域 `./x.ts` 不变 / 锚与未移平铺件 `./x.ts`→`../x.ts` / 已移跨域 `../<域>/x.ts`；消费件（src+test）指移动件：`./x.ts`→`./<域>/x.ts`、`../src/x.ts`→`../src/<域>/x.ts`。**引号外逐字节不变** |
| ② | 桶 re-export | `index.ts` 对应 specifier `./x.ts`→`./<域>/x.ts`；tenant 2 行与全部导出名零改 |
| ③ | runner receipt（E4 同型授权面） | `isolatedReceiptSources` 块内（:93–:1640）对每移动名 `'packages/db/src/<name>.ts'`→`'packages/db/src/<域>/<name>.ts'`；**块外零改 · 数组结构/target 名/非 db 串零改 · `node --check` 必过** |
| ④ | 仓内机械消费串 | §1.2 M4 全表（conn-stack · qdrant-store tests · apps tests/worker src · db test 串 · tenant-wiring manifest file: 实值）；RESIDUAL_PATHS brace-glob（:245/:251）随批逐元素加域前缀（登记诚实，B1 同判） |

**逐行核验法（每批 G0）**：`git diff -M` 行对在剥离引号串后逐字节相同（B1 202/202 同法）；静态残留收口（每批）：
```bash
grep -nE "packages/db/src/<本批移动名>\.ts['\"]" scripts/run-e2e-isolated.mjs   # 期望 0 命中
```
**终批全仓残留收口（B2s）**：
```bash
grep -rnE "packages/db/src/[a-z0-9-]+\.ts" apps packages/domain packages/qdrant-store packages/db/test scripts e2e \
  --include="*.ts" --include="*.mjs" \
  | grep -vE "src/(index|principal|migrate|migrate-cli|isolated-test-target|errors|ids|tenant/index)\.ts" \
  | grep -vE "db-acl\.proof\.ts:(267|490):|qbank-source\.proof\.ts:2:|uc052-checkpoint-physical\.proof\.ts:7:|qbank-route-scope-cache\.ts:16:|qbank-track-local-retrieval\.ts:13:|product-vectorstore-bridge\.ts:(5|9):|uc-e2e-011-adv-refund-callback\.proof\.ts:15:|uc-e2e-011-refund-callback-adv\.proof\.ts:24:|uc-e2e-014-026-webhook-adv\.proof\.ts:19:"   # 期望 0 行（S1 登记八处豁免 · int-transcript.ts:7 处 packages/db/src 不入本 grep 路径集）
```

---

## 4. 风险评估（③）

| 维 | 评估 | 依据/处置 |
|----|------|-----------|
| **RLS 面** | **低**：RLS policy 全在 migrations（0001–0151 · 本刀零触）；src 内嵌运行时 SQL 含 `current_setting(`/`pgp_sym_encrypt` 的 7 文件（commerce · ctx03 · int-transcript · isolated-test-target · qbank-curation · recruiter · resume）本体字节不动；RLS 会话核心 `principal.ts`（2077 行 · 45 消费者）**锚定不动** | 移动=路径文本 ⇒ RLS 行为零变；RLS 族 base 同红（§6 E5 清单）零洗 |
| **触发器面** | **零**：src 内 `CREATE TRIGGER|CREATE POLICY` 计数 = **0**（grep 实测，触发器族全在 migrations）；`db-trigfam-unify` proof 经桶引（M3 零改类） | 桶导出集不变 ⇒ 触发器证明面零语义变 |
| **导入环** | **无环已证**：对 72 平铺文件相对 import 图 DFS 全量遍历 = **0 环**（barrel 为汇 · 仅 migrate-cli.ts:3 引桶）；移动为纯前缀改写保 DAG | 跨域二段改写（先移方 `../x.ts`、后移方再改 `../<域>/x.ts`）不生环 |
| **跨域依赖** | fan-in top（src 相对 import 消费者）：principal 45（锚不动）· ids 7（锚不动）· qbank-generation-retrieval 5 · privacy-authorization 4 · job-route-decision 4 · qbank-ingest 4 · checkpoint-privacy 3 · interview-answer-dual-write 3。已知跨域边：qbank↔retrieval（ingest→retrieval-store）· qbank↔interview（miss→question/event）· qbank↔routing（miss/track-local→job-route-decision）· privacy↔memory（vector-plane→memory-vector-chunk-erasure）· privacy↔checkpoint（uc052/checkpoint-privacy）· transcript↔checkpoint/interview | 高 fan-in 域（qbank/memory/privacy/interview）排后段批；每批 import 同批改写，二段 churn 纯文本 |
| **机械 ENOENT 面** | M2 runner 258 处/59 文件 + M4 仓内串 ~40 文件——**漏改即机械红**（E4 实证形态：proof 绿 receipt ENOENT EXIT=1） | 三重防：③ 类同批改写 + 每批残留 grep=0 + 该批 receipt 靶抽样复跑（§6） |
| **锚点/生产面** | `docker/compose.prod.yml:231` 引 `src/migrate-cli.ts`、根 tsconfig paths 引桶、`deploy-check`/`quality-governance`/`mysql-schema.skeleton`/`ha-nest-session`/conn-stack m2 引 principal——**全指锚，零改** | 锚 7 + tenant 不动是硬 Ban（§7） |
| **在飞线冲突** | SSE-PUSH 线碰 `apps/api/src/modules/interview/*`（B2 零触 apps src）；TOKSTREAM 线碰 `packages/ai-runtime/src`（B2 零触，仅其 receipt 数组内 db 串属 ③ 类）；隐私主线 `apps/worker/src/checkpoint-principal.ts` 不在 B2 面；r4 线 `apps/worker/src/r4-funnel-*` 仅 ④ 类串改 | 每批开批前重跑通用律 0（fetch 对齐 tip + SOP + W 线冻结序 + loop §3 冲突表）；命中即顺延并入批 REQUEST 声明 |
| **base 同红（E5）** | 预期族（以批前逐靶实测为准，红原值登记不洗）：`pgp_sym_encrypt` 权限族 6 靶（ctx03/ctx04/ctx05/ctx06 · mem02-summary · mem03-summary-tree）· `interview_privacy_fenced` 族 2 靶（runtime-role · int-transcript-preview-submit:http）· `qbank-source`（app_role 缺）· `adaptive-consumer`（NORMAL_ANSWER_DRAIN）· direct `migrate`（migration_uninitialized_nonempty_database）· `prove:tenant-wiring-neg`（42P01）· `prove:retrieval-backend-qdrant`（EXIT=3 · Qdrant 未起）· `e2e-platform:prove`（secret-redaction e2e/full.e2e.ts:59/:154） | 批前实测基线原值入收据 → 批后逐键同形对表 |
| **register 诚实** | RESIDUAL_PATHS 两条 brace-glob 若不随批更新即成 silent absence（BANNED） | ④ 类同批逐元素加域前缀（B1 同判） |

---

## 5. 分批实施切片（④ · 19 批 · 每批 ≤5 文件 · 串行一刀一批）

**排序律**：叶子/低耦合先（立模式）→ fan-in 与机械串面重者后；同域不跨批拆散（>5 文件域拆连续两批）；每批 = 1 commit + 1 收据节。`直跑键`=db 包直跑 script；`receipt 靶`=isolatedReceiptSources 含本批移动串的 runner 靶（③ 类改写后须复跑的抽样全集，批内必跑集合=∅，复跑由 post 双审指令 + B2s 终批 sweep 兜底）；`外部串`=M4 ④ 类 file:line。

| 批 | 移动文件（行） | 直跑 prove 键 | receipt 靶（runner 抽样面） | 外部串改点 |
|----|----------------|----------------|------------------------------|------------|
| **B2a** | audit/：audit(10) | `prove:db-acl` · `prove:isolated-target` | 无（audit runner=0）——本批立模式：桶 1 行 + tsc + 残留 grep=0 即收口 | 无 |
| **B2b** | report/：report(92)；notification/：notification(36) | `prove:uc019-report-regenerate` · `prove:db-acl` · `tenant-enforcement:prove` · `prove:tenant-wiring-e5` | **report**：db-acl · report · uc001:nhp-fault · uc011:report-refund:http · uc011:report-refund · uc019:report-regenerate:http · uc019:report-regenerate；**notification**：tenant-wiring-neg（base 红候选） | `uc-e2e-001-nhp-fault.proof.ts:90`；manifest :147/:227（notification file: 实值·readFileSync 机械） |
| **B2c** | resume/：resume(220)；recruiting/：recruiter(475) | `resume` · `recruiter` · `prove:tenant-wiring-e5` · `prove:db-id-v7` | **resume**：resume · interview · ocr · reaper · resume-derivative-reference · resume-erasure:foundation · resume-reference:http · uc027:manual-review-appeal · adaptive-consumer（base 红候选）；**recruiter**：recruiter · db-id-v7 · rag03-route · rag04-track-local · rag05-qbank-miss · scor-00:http · tenant-wiring-neg · nhp-r4-adv-covered · r4-wrong-track-adv-live-pg · r4-wrong-track-prod-surface | `r2-p-api-route-classify.proof.ts:29`；worker r2 4 + api:29（r2-classify-job-route-prereq:33 · r2-p-live:31 · r2-p-loop:26 · r2-p-start:25）；manifest :157/:233；`uc-e2e-027-manual-review-appeal.proof.mjs:127`（resume 面） |
| **B2d** | transcript/：int-transcript(285) · int-transcript-projection(105) | `prove:int-transcript-answer-fact-root` · `prove:int-transcript-remaining-sinks` · `prove:int-answer-dual-write-fence` | **int-transcript**：int-transcript-answer-fact-root · int-answer-dual-write-fence · db-id-v7 · growth · scor-01 · scor-02 · scor03-evidence-conflict · int-transcript-preview-submit:http（base 红候选·privacy_fenced 族）；**projection**：uc052:internal-erasure · uc052:external-sink-retention · uc052:external-sink-async-purge · int-transcript-remaining-sinks | 无（uc052 proofs 的 `../src/int-transcript-projection.ts` import 属 ① 类随批改） |
| **B2e** | commerce/：commerce(388) · payment(166) | `commerce` · `prove:db-money3` · `prove:uc011-report-refund` · `prove:uc019-report-regenerate` | **commerce（23）**：commerce · db-money3 · ocr · reaper · recruiter · uc001:nhp-{adv,bound,fault,neg} · uc011:report-refund{,:http} · uc016:nhp-fault · uc017:{nhp-load,orphan} · uc018:{abandon,abandon:http,adv,graph,perf-load,ttl} · uc019:report-regenerate{,:http} · uc025:nhp-adv；**payment（4）**：db-money3 · uc011:adv · uc011:refund-callback · uc011:report-refund:http | **E6 残留面收口**：`packages/db/test/uc-e2e-011-report-refund.proof.ts:200`（readRepo payment）；api 五文件：uc-e2e-011-adv-refund-callback(:80,:296) · uc-e2e-011-refund-callback-adv(:182,:191,:461) · uc-e2e-011-report-refund-http(:286) · uc-e2e-014-026-webhook-adv(:284) · uc-e2e-001-nhp-{adv:75,bound:72,fault:92}；`db-money3.proof.ts` imports（commerce/payment/interview-event→B2l 二段） |
| **B2f** | routing/：candidate-route(134) · free-text-route-decision(264) · job-route-decision(404) | `prove:rag03-route` · `prove:rag07-free-text-route` · `prove:db-id-v7` · `prove:tenant-wiring-e5` | **candidate-route**：db-id-v7 · tenant-wiring-neg（红候选）；**free-text**：rag07-free-text-route · db-id-v7；**job-route-decision**：rag03-route · rag04-track-local · rag05-qbank-miss · db-id-v7 · nhp-r4-adv-covered · r4-wrong-track-adv-live-pg · r4-wrong-track-prod-surface | manifest :170/:239；`conn-stack/mysql-stack.m4-rag:21`；worker `r4-funnel-covered-count-batch1.ts:97`；worker r2 六处（r2-classify:32 · r2-p-fake:36 · r2-p-live:32 · r2-p-loop:27 · r2-p-start:26 · r2-p-worker:31）；worker `r4-funnel-covered-count-batch4.ts:114`（free-text-route-decision · readRepo 机械） |
| **B2g** | checkpoint/：checkpoint-privacy(123) · checkpoint-thread(34) | `prove:uc052-checkpoint-physical`（927 行重 proof·本批必跑） | **checkpoint-privacy（7）**：checkpoint-role · int-transcript-answer-fact-root · privacy-erasure:http · privacy-erasure:pause-upgrade · privacy-erasure:prove · scor-01 · uc052:checkpoint-physical；checkpoint-thread 无靶 | `uc052-checkpoint-physical.proof.ts` import（checkpoint-privacy）① 类 |
| **B2h** | jobs/：diagnosis-jobs(87) · quiz-jobs(89) · gateway-dispatch(63) · worker-job-wakeup(35) | `prove:uc017-orphan` · `prove:uc017-nhp-load` · `prove:uc018-abandon` · `prove:uc018-graph` | **diagnosis**：diagnosis · resume-derivative-reference · uc016:nhp-fault；**quiz**：quiz · reaper · resume-derivative-reference · uc016:nhp-fault；gateway/worker-job-wakeup 无靶 | **E4b 面收口**：`conn-stack/mysql-stack.m3-queue:17` + `redis-wakeup:21`（worker-job-wakeup）；`r2-p-api-route-classify.proof.ts:24` · `r2-classify-job-route-prereq.proof.ts:60` · `r2-p-worker-route-classify.proof.ts:32`（gateway-dispatch） |
| **B2i** | context/：ctx03-event-source(304) · context-compression-dispatch(193) · -erasure(92) · -snapshot(170) | `prove:ctx03-event-source` · `prove:ctx04-compression-snapshot` · `prove:ctx05-concurrency-recovery` · `prove:ctx06-deletion-closure` | **ctx03（6）**：ctx03-event-source · ctx04-compression-snapshot · ctx05-concurrency-recovery · ctx06-deletion-closure · mem02-summary（红候选）· mem03-summary-tree（红候选）；**dispatch（2）**：ctx05-concurrency-recovery · ctx06-deletion-closure；**erasure（1）**：ctx06-deletion-closure；**snapshot（3）**：ctx04-compression-snapshot · ctx05-concurrency-recovery · ctx06-deletion-closure | 无 |
| **B2j** | retrieval/：rag-corpus-versioning(257) · retrieval-backend(149) · retrieval-legacy(45) · retrieval-store(66) | `prove:vectorstore` · `prove:rag-corpus-version` · `prove:rag-control-role` · `prove:rag-control-upgrade` · `prove:rag-control-dispatch` · `prove:rag03-filter-locus` · `prove:rag03-hnsw-completeness` · `prove:rag03c-exactk-observe` · `prove:retrieval-backend-qdrant`（红候选 EXIT=3） | **rag-corpus-versioning（3）**：rag-control-role · rag-control-upgrade · rag-corpus-version；**retrieval-legacy（2）**：rag03-filter-locus · rag03-hnsw-completeness；**retrieval-store（3）**：rag03-filter-locus · rag03-hnsw-completeness · rag03c-exactk-observe；retrieval-backend 无靶 | **conn-stack 四连**：m4-rag:24 · m5-fixtures:23 · qdrant-backed:33 · r5-mark-red:30；**qdrant-store 八文件**：memory-qdrant:49 · qdrant-store.erase-honesty:29 · g5-erasure:41 · g5-ledger-map:49 · skeleton:24 · vectorstore-adapter:37 · rag-qdrant:48 · vectorstore-qdrant:41；`retrieval-backend-qdrant.proof.ts:41/:42`（join src/…）+ :32 import |
| **B2k** | model-op/：ai-cost-governance(98) · model-invocation(183) · model-operation-admission(108) · online-judge-control(114) · usage-calibration(137) | `prove:ai-cost` | **ai-cost（10）**：db-trigfam · model-cost · model-op00 · model-op02 · model-op00-usage-reconciler · model-invocation-reconcile · failover-price-policy · model-slot-bypass · estimate-threading-invoke · uc028:nhp-fault；**model-invocation（8）**：model-op00 · model-op02 · model-op00-usage-reconciler · model-invocation-reconcile · model-slot-bypass · adaptive-degrade · privacy-erasure:prove · runtime:claim-join；**admission（2）**：model-op02 · model-slot-bypass；**usage-calibration（1）**：model-op00-usage-reconciler；online-judge-control 无靶 | 无 |
| **B2l** | interview/：interview-answer-dual-write(67) · interview-event(43) · interview-graph-lease(87) · interview-jobs(265) · interview-question(131) | `prove:uc002-lease` · `prove:int-answer-dual-write-fence` · `prove:db-money3`（interview-event 面·二段） | **dual-write（1）**：int-answer-dual-write-fence；**event（4）**：db-money3 · int-answer-dual-write-fence · rag05-qbank-miss · tokenstream:prove:raw（若含 live 面→E5 base 同红登记不跑不洗）；**lease（1）**：uc002:lease；**jobs（8）**：interview · reaper · reqid · stress · adaptive-consumer（红候选）· privacy-erasure:prove · resume-reference:http · int-answer-dual-write-fence；**question（3）**：rag05-qbank-miss · uc001:nhp-adv · uc001:nhp-fault | `uc-e2e-001-nhp-adv.proof.ts:74`（api） |
| **B2m** | scoring/：scoring-aggregation(111) · scoring-evidence-conflict(86) · scoring-fact-root(207) | `prove:scor-01` · `prove:scor-02` · `prove:scor-03` | **aggregation（3）**：growth · scor-02 · scor03-evidence-conflict；**conflict（1）**：scor03-evidence-conflict；**fact-root（5）**：scor-01 · scor-02 · scor03-evidence-conflict · growth · rag05-qbank-miss | 无 |
| **B2n** | privacy/ 前段：privacy-authorization(172) · privacy-erasure-preview(90) · vector-plane-erasure(126) | `prove:privacy-authorization` · `prove:privacy-erasure-preview` · `prove:vector-plane-erasure` · `prove:memory-vector-chunk-erasure` | **privacy-authorization（12）**：privacy-authorization · uc052:internal-erasure · uc052:external-sink-retention · uc052:external-sink-async-purge · uc052:checkpoint-physical · int-transcript-answer-fact-root · int-transcript-remaining-sinks · mem02-summary（红候选）· memory-governance · memory-vector-chunk-erasure · vector-plane-erasure · ctx06-deletion-closure；**preview（1）**：privacy-erasure-preview；**vector-plane（1）**：vector-plane-erasure | uc052×4 proofs 的 `../src/privacy-authorization.ts` import（① 类·M3 六文件面）；src 注释 int-transcript.ts:7 判留登记 |
| **B2o** | privacy/ 后段：uc052-checkpoint-physical(251) · uc052-external-sink-async-purge(296) · uc052-internal-erasure(275) | `prove:uc052-internal-erasure` · `prove:uc052-external-sink-retention` · `prove:uc052-external-sink-async-purge` · `prove:uc052-checkpoint-physical` | **uc052-checkpoint-physical（1）**：uc052:checkpoint-physical；**async-purge（1）**：uc052:external-sink-async-purge；**internal-erasure（4）**：uc052:internal-erasure · uc052:external-sink-retention · uc052:external-sink-async-purge · uc052:checkpoint-physical | `uc052-checkpoint-physical.proof.ts` imports ×3（① 类）+ :907 seal 披露串（④ 类） |
| **B2p** | memory/ 前段：memory-admission(123) · memory-control-surface(348) · memory-fact-adjudication(146) · memory-governance(237) · memory-index-generation(282) | `prove:memory-admission` · `prove:memory-control-surface` · `prove:memory-fact-adjudication` · `prove:memory-governance` · `prove:memory-index-generation` | 各自同名靶 + 交叉：memory-control-surface（admission/fact-adjudication/index-generation 串）· memory-index-generation · memory-two-stage-recall（下批文件串在本批数组亦出现→③ 类随批改） | `r4-funnel-covered-count-batch2.ts:179`（memory-index-generation） |
| **B2q** | memory/ 后段：memory-store(56) · memory-summary(275) · memory-summary-tree(185) · memory-two-stage-recall(191) · memory-vector-chunk-erasure(81) | `prove:memory-two-stage-recall` · `prove:mem02-summary`（红候选）· `prove:mem03-summary-tree`（红候选）· `prove:memory-vector-chunk-erasure` · `prove:dbhy1`（memory-store 面） | **store（2）**：memory-governance · memory；**summary（3）**：mem02-summary（红候选）· mem03-summary-tree（红候选）· ctx04-compression-snapshot；**summary-tree（1）**：mem03-summary-tree；**two-stage（1）**：memory-two-stage-recall；**vector-chunk-erasure（2）**：memory-vector-chunk-erasure · vector-plane-erasure | 无 |
| **B2r** | qbank/ 前段：qbank-curation(101) · qbank-embedding-compute-cache(549) · qbank-generation-projection(174) · qbank-generation-retrieval(262) · qbank-ingest(459) | `prove:qbank-control-role` · `prove:qbank-handoff-closure` · `prove:embed-compute-cache` · `prove:rag03-filter-locus` · `prove:rag03-hnsw-completeness` · `prove:rag03c-exactk-observe` · `prove:rag04-track-local` | **curation（5）**：qbank-handoff-closure · rag03-filter-locus · rag03-hnsw-completeness · rag03c-exactk-observe · uc027:manual-review-appeal；**embed-cache（1）**：embed-cache；**projection（5）**：rag-generation · rag04-track-local · nhp-r4-adv-covered · r4-wrong-track-adv-live-pg · r4-wrong-track-prod-surface；**generation-retrieval（13）**：上五 + qbank-integrity-upgrade · qbank-pipeline · qbank-retrieval-eval · rag03-filter-locus · rag03-hnsw-completeness · rag03c-exactk-observe · rag05-qbank-miss · rag06-route-scope-cache；**ingest（16）**：上十三去重 + qbank-handoff-closure · embed-cache · migrate-cli | **STATIC_TARGET 双串**：`rag03-filter-locus.proof.ts:54` + `rag03-hnsw-completeness.proof.ts:50`；`conn-stack/mysql-stack.m4-rag:22`；api `.mjs` ×2：uc-e2e-027:109 · uc-e2e-040-043:99；worker `r4-funnel-batch2:96/:174` · `batch3:117(=miss·B2s 二段)/:202` |
| **B2s** | qbank/ 后段：qbank-miss(385) · qbank-provider-input(116) · qbank-retrieval-cache(374) · qbank-route-scope-cache(310) · qbank-track-local-retrieval(271) + **终批收口** | `prove:qbank-cache` · `prove:rag05-qbank-miss` · `prove:rag06-route-scope-cache` · `prove:rag04-track-local` · `prove:db-id-v7` | **miss（2）**：rag05-qbank-miss · db-id-v7；**provider-input（1）**：rag-generation；**retrieval-cache（7）**：rag06-route-scope-cache · rag04-track-local · rag-generation · embed-cache · nhp-r4-adv-covered · r4-wrong-track-adv-live-pg · r4-wrong-track-prod-surface；**route-scope-cache（2）**：rag06-route-scope-cache · db-id-v7；**track-local（4）**：rag04-track-local · nhp-r4-adv-covered · r4-wrong-track-adv-live-pg · r4-wrong-track-prod-surface | `conn-stack/mysql-stack.m4-rag:23` + `r4-domain-isolation:26`；worker `r4-funnel-b1:181` · `batch2:97/:175`（:175=qbank-retrieval-cache）· `batch3:200/:204/:205`（:205=qbank-retrieval-cache · :117 已由 B2r 记二段）· `batch4:115`（index 锚零改 · :114 已于 B2f 改讫）；`g4-dispatch-recheck-prereq:27` · `r4-wrong-track-adv:62`；**终批收口 = §3 全仓残留 grep=0 + runner db 面 117 靶全量 sweep（或协调方裁定抽样面）** |

批次核对：1+2+2+2+2+3+2+4+4+4+5+5+3+3+3+5+5+5+5 = **65 ✓**（每批 ≤5）。

---

## 6. prove / 回归策略（⑤）

### 6.1 每批固定门（四门 + 契约五门 · E5 零回归口径）

| 门 | 命令 | 期望 |
|----|------|------|
| G0 面 | `git diff -M`（行对引号外逐字节）· `node --check scripts/run-e2e-isolated.mjs`（涉 ③ 批必跑）· §3 残留 grep=0 · `git diff --quiet pnpm-lock.yaml` | 全 rename 检出 · 0 违例 · EXIT=0 · lockfile 零改 |
| G1 契约 | `pnpm e2e-platform:check` · `e2e-platform:layout:prove` · `e2e-static-guards:check` · `e2e-static-guards:prove` · `e2e-parity:check` | 五门 EXIT=0（base 红则同红原值登记；`e2e-platform:prove` 预存红 secret-redaction 不洗） |
| G2 类型 | `pnpm install --frozen-lockfile` 后 `pnpm exec tsc -p packages/db/tsconfig.json --noEmit` + `apps/api` + `apps/worker` 同法 | **批前实测基线原值**（本 base 未装依赖，B1 教训不预设 EXIT 值）→ 批后错误集逐字节 ≡ 基线 |
| G3 prove | 本批 §5 表：直跑键全跑 + receipt 靶抽样集（post 双审指令）经唯一合法隔离入口 `node scripts/run-e2e-isolated.mjs <target>` | 直跑键零回归 + sweep 靶零回归（绿保持绿·红同形红）；`LOCAL_ISOLATED_PROOF_RECEIPT` 正常产出（receipt ENOENT=0）为 ③ 类通过的必要观察 |
| G4 收尾 | commit 后 `git status`（0 entries）· runner 容器零残留 | 干净 |

**环境**：`pnpm db:up` 起 dev postgres 属环境准备非行为变更；runner 跑前 `env -u MODEL_API_KEY -u MODEL_BASE_URL`（est live 模型调用=0 · **Key name-only 零打印零落盘**）；live 类面（`e2e:isolated` · `e2e:ui:isolated` · perf/smoke live）不在本刀 prove 面。

### 6.2 每批 prove 键清单

见 §5 表逐批列（直跑键 + receipt 靶 + base 红候选标注）。汇总：db 包 74 script 全部直跑键分布于 19 批；直跑键每批全跑（62/62 实存）；receipt 靶列为抽样全集，批内必跑集合=∅，由 post-dual 双审指令 + B2s 终批 117 靶 sweep 兜底。

### 6.3 终批（B2s）收口三件

1. §3 全仓残留 grep = **0 行**（除 7 锚 + tenant）。
2. runner db 面 **117 靶全量 sweep**（协调方可裁定为抽样，但抽样集须 ≥ 未跑余量（117 全量）半数并披露未跑清单）。
3. `git log --oneline e2834082..HEAD` 19 commit 一批一 commit 对表 + 全批收据归档 `ai-docs/delivery/receipts/dir-b2/`。

### 6.4 禁止计入成功

`pnpm e2e:isolated` / `e2e:ui:isolated` / 任一 mysql-stack live 面冒充；EXIT=0 冒充「重构完成」；base 红洗绿；绿 receipts 顶替 post 双审。

---

## 7. Ban（违者本刀/本批作废）

1. **Ban 逻辑变更**：文件本体除 ①类 import 行、②类桶 specifier、③类 runner receipt db 串、④类机械串外任何行零改；Ban 顺手重构/改名/排序/去重/加注释/拆文件/补 module。
2. **Ban 触锚与禁区**：`index.ts`·`principal.ts`·`migrate.ts`·`migrate-cli.ts`·`isolated-test-target.ts`·`errors.ts`·`ids.ts`·`tenant/`（含桶 tenant 2 行与 `barrelTenantReexports===2` 断言）·`packages/db/migrations/**`·`e2e/` 树·`g7-bootstrap.ts`·`apps/**/src`（仅 ④ 类串例外：r4-funnel×4 / r2、uc、g4 tests）·`scripts/isolated/`·`scripts/conn-stack/` 除 ④ 类串外逻辑。
3. **Ban runner 越权**：`run-e2e-isolated.mjs` 仅限 `isolatedReceiptSources` 块内（:93–:1640）db 移动串的纯文本替换；target 名/数组结构/命令 map/块外零改。
4. **Ban migrations / SSOT**：`e2e-requirement-coverage-matrix.md`·`gap-bug-backlog.md`·checklist·`e2e-directory-contract.md`·`adr-e2e-directory-restructure.md` 字节零动；**Ban 关债叙事**：r4-funnel/r2/qbank 串改 ≠ 关闭任何 r4/R4/FUNNEL/G-R4-5 backlog 行。
5. **Ban G7 面**：G7 树/g7 助手/G7 receipt 面零触（runner 数组内 db 串除外）。
6. **Ban shim/转发层**：不建任何 re-export shim/路径转发；旧路径一律直改引用处。
7. **Ban secrets / live**：Key name-only 零打印零落盘（`.env` ABSENT）；est 0 live 模型调用；Ban 把任何绿记为 HA/releaseEvidence/covered。
8. **Ban 假绿/洗红**：base 同红原值登记（E5）；proof 绿 + receipt ENOENT = 该批 G3 FAIL（E4 教训成文）。
9. **Ban 自批/越序**：预执行双审 BOTH PASS + 协调方授权前 mv = 作废；批间串行，上一批 post 双审过方开下一批；每批开批前通用律 0 三查（fetch tip 对齐 / SOP / W 线冻结序 + loop §3 冲突表），命中即顺延入档。
10. **Ban 注释静默漂移**：S1 判留清单八处须随批收据复述登记；新增判留须当批补登，不得无声。

---

## 8. 状态

- [x] §1 只读盘点落盘（73 文件全量 + 消费面 M1–M6 量化 + 基线漂移披露 243/435/66/117/块外 0）
- [x] §2 落位表自含（65 mv + 7 锚 + tenant · B1 映射 1:1 誊录复核）· §3 白名单四类 + 残留收口命令钉死
- [x] §4 风险评估（RLS/触发器/导入环 0 环实证/跨域 fan-in/ENOENT 面/锚点/在飞线/E5 base 红族）
- [x] §5 分批切片 B2a–B2s（19 批 · ≤5 文件 · 65/65 对账）· §6 每批 prove 键 + 四门 + 终批收口
- [ ] 预执行双审 BOTH `Verdict: PASS`（两席独立复算：65 mv 对账 · runner 258 处/59 文件 · §5 外部串 file:line 抽验）
- [ ] 协调方授权 → B2a 起批（每批一 commit 一收据 · post 双审按批）
- [x] **STOP**

---

---

## Erratum（rev1 → rev2 · 预执行双审三 FAIL 席处方合并 · docs-only 机械修订）

- **R1**（§1.2 M4④）：「4 文件 12 处」→「4 文件 **17 行 = 13 处移动面**（batch1 2 · batch2 5 · batch3 5 · batch4 1）+ 4 处 index.ts 锚零改（b2:176·b3:118·b3:201·b4:115）」，附 13 点全清单（b1:97 job-route-decision · b1:181 track-local · b2:96 projection · b2:97 track-local · b2:174 compute-cache · b2:175 retrieval-cache · b2:179 memory-index-generation · b3:117 miss · b3:200 route-scope-cache · b3:202 compute-cache · b3:204 track-local · b3:205 retrieval-cache · b4:114 free-text-route-decision）。
- **R2**（§5 B2f 外部串）：补 worker `r4-funnel-covered-count-batch4.ts:114`（free-text-route-decision · readRepo 机械）。
- **R3**（§5 B2s 外部串）：删「batch4（无涉）」，改 `batch2:97/:175`（:175=qbank-retrieval-cache）· `batch3:200/:204/:205`（:205=qbank-retrieval-cache · :117 已由 B2r 记二段）· `batch4:115`（index 锚零改 · :114 已于 B2f 改讫）。
- **R4**（§5 B2c 外部串）：补 `uc-e2e-027-manual-review-appeal.proof.mjs:127`（resume 面）。
- **R5**（§6.2/G3）：删「~60 靶次加粗必跑」，改「直跑键每批全跑（62/62 实存）；receipt 靶列为抽样全集，批内必跑集合=∅，由 post-dual 双审指令 + B2s 终批 117 靶 sweep 兜底」；G3 期望「加粗靶零回归」同步改「直跑键零回归 + sweep 靶零回归」。
- **R6**（§3/§1.2/§7）：终批「期望 0 行」grep 豁免集补 S1 全部登记行；S1 登记六处→**八处**（新增第七处 `packages/db/test/uc052-checkpoint-physical.proof.ts:7` 头注串·B2o 批收据复述登记 · 第八处 `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:19` 头注串）；§7 Ban 10「六处」同步改「八处」。
- **R7**（§5 B2d 靶列对调）：int-transcript 9→8（删 int-transcript-remaining-sinks）；projection 3→4（增 int-transcript-remaining-sinks）。
- **R8**（§5 B2r ingest 组成）：补 `qbank-handoff-closure`（计数 16 不变）。
- **R9**（口径勘误）：qbank-ingest inSRC 4→2（含桶 2 语句口径）· principal inSRC 45 标「含桶」· ids「跨 6 域」→「跨 4 域（routing/qbank/transcript/recruiting）」· ext 列五名（principal/index/job-route-decision/qbank-track-local-retrieval/retrieval-store）各 −1（conn-stack 裸名与 `mysql-schema.skeleton.proof.mjs` 重复计入 · index 原含根 `tsconfig.json:8`）· B2c「五连」→「worker 4 + api:29」。
- **R10**（§5 B2i）：receipt 靶 ctx04/ctx05/ctx06 写 runner 全名 `ctx04-compression-snapshot` · `ctx05-concurrency-recovery` · `ctx06-deletion-closure`（@`packages/db/package.json` scripts + runner 实名核）。

**非阻塞披露**：`packages/db/src/qbank-generation-projection.ts` 与 `qbank-provider-input.ts` 含 NUL 字节——执行席任何 rg 残留/消费面抽查须 binary-aware，入每批收据登记。

---

*DIR-1 B2 domain 目录拆解 REQUEST · 2026-10-07 · rev2 · base `e2834082` · worktree `meetwise-line-dirb2` · 65 纯移动 · releaseEvidence=false · NOT_HA · actualSpendCny=null · awaiting pre-exec dual · STOP*
