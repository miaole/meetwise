# G7FIX-1 · driver route_decided 等待刀 · EXEC 收据（单 attempt）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落：G7U 同形 SELECT-only 轮询 +13/−0 + 判读 run 恰 1 次 EXIT=1 原值 + 四向判读=**修复面成立·臂2 命中**（start 死点越过推进至 M7·红移位至 start 之后新死点 post-M7 断言窗）· STOP awaiting post-prove dual · post-prove 双审归协调方派 · Ban self-approve）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base 与执行地

- 蓝本 = REQUEST rev3 `941425c6`（worktree `meetwise-line-g7fix` · 分支 `line/g7-route-wait`）· 基座含 G7P-4 consent 面 cherry-pick `c47bf513`（fs/bootId 定义在卷 · rev3 锚点自洽亲证）· 代码面 = 152 面（run 实测 `migrations: applied=152 skipped=0` + receipt `schemaMigrationManifest.count=152 latest=0151_pgp_sym_encrypt_grant.sql` 亲证）。
- 执行地：worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7fix` · EXEC HEAD = 蓝本 commit（收据自证）。
- 环境前置（非代码面）：本 worktree `node_modules` 缺席（fresh worktree）→ `pnpm install --frozen-lockfile` 补齐后 transpile/guards 预检方得执行；run 前 host 观测同 loop 兄弟席（`meetwise-line-godfn1a-base` · `e2e:isolated e2e:ui`）隔离 run 在航（容器 `meetwise-e2e-64245-*`→`meetwise-e2e-69539-*` 轮替），本 run 容器 boot 时窗内已排空（pre-run docker snapshot 仅 `meetwise-e2e-godfn1c-35997` 长命的 UI 面 pg 容器 + `meetwise-postgres-dev`）——隔离 run 按容器名 pid+ts 归因 hermetic，本 run 容器名 `meetwise-e2e-71087-1791484280182` 全程自证归属。

## 1. Coding 面（≤15 行硬门 · 亲证）

- 恰 1 文件 `e2e/full.e2e.ts` · 精确插针位 = 原 `:341` M5 marker `seg_bound_start_enter` 后、原 `:342` start fetch 前 · `git diff --numstat` = **+13/−0（合 13 行 · ≤15 达标）**· 零删改（start fetch/catch/断言 :348-:350 200 started 门原样保留 · 禁松门禁兑现）· `git status` 仅此一文件（apps/packages 零 diff · helpers/wrapper/解析器零触碰）。
- 改造要素逐项落位：①G7U 同形 SELECT-only 直连轮询——`await import('node:module')` 步内动态导入 + `createRequire(new URL('../packages/db/package.json', import.meta.url))('pg')`（声明依赖解析 · 零 manifest 改 · pg resolve 本 worktree 亲测 OK）②runner 注入 PG* env 契约消费（`PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` 五键 presence 硬检·缺则诚实 throw · run-e2e-isolated.mjs :2144-2149/:2469 契约 · 零硬编码零 .env*）③SELECT `SELECT 1 FROM job_route_decision WHERE job_id=$1 AND route_outcome='route_decided'`（jobId :270 作用域 · 参数化 $1）④cap 60_000/周期 1_000（G7U recruiting-bound.spec.ts:85-86 同值）⑤超时诚实 FAIL：判别读数第二 SELECT `job_semantic_revision WHERE job_id=$1 ORDER BY revision DESC LIMIT 1` → stdout 逐字 log `status` 原值 + 三中间态注记（rule_decided/model_prepared/result_validated）+ pending 族（≠route_unresolved·时序面本刀域）/route_unresolved（sticky 族 G7S 转另刀）二分归类后 throw⑥SELECT-only 零写（两查询全 SELECT）⑦finally `client.end()` 防泄漏⑧绿面 stdout `[g7fix1] route_decided observed after Xms`。
- 预检（run 前 · 零 e2e 执行）：esbuild transpile-only EXIT=0（语法面）· `e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6）· `.tmp/e2e-consent-capture.ndjson` run 前 ENOENT 亲证（absent pre-run · wrapper stdout 记录在案）。

## 2. 判读 run（恰 1 次 · 红原值 retained · Ban retry-to-green 兑现）

| 项 | 读数 |
| --- | --- |
| 命令 | `pnpm e2e:isolated`（worktree 内 · `MODEL_API_KEY` 经授权 loader source 进程注入） |
| EXIT | **1（原值 · retained）** · 外壳 `E2E_ISOLATED_EXIT=1` · WALL=81s |
| receipt | `.tmp/e2e-receipts/2026-10-08T18-32-40-102Z-71087-…json`：outcome=failed · failureClass=**api** · durationMs=**79919** · assertionCount=null（红 run 无成功 summary · 正常形状） |
| 容器 | `meetwise-e2e-71087-1791484280182` on 127.0.0.1:58930（随 run 拆除 · post-run `docker ps` 零本 run 残留亲证） |
| sourceDigests | `e2e/full.e2e.ts`=`sha256:d149a0ce…`（=本刀树工作区产出 shasum 亲证 · helpers×12/wrapper×2 全在卷） |

### NDJSON 截获记录（亲读转录 · 全量恰 3 行 · bootId=71488 一致）

```json
{"bootId":71488,"step":"consent","status":200,"elapsed_ms":11,"body":"{\"recorded\":true,\"policyVersion\":\"v1\"}"}
{"bootId":71488,"step":"app_start","status":200,"elapsed_ms":16,"body":"{\"applicationId\":\"app_01a11cc9b8c47dbb8182e3ccf53ba9ec\",\"status\":\"started\",\"interviewId\":\"iv_01a11cc9c8b976d993e385492b2b088b\",\"redirectTo\":\"/interview/iv_01a11cc9c8b976d993e385492b2b088b?applicationI"}
{"bootId":71488,"step":"app_start_reid","status":200,"elapsed_ms":4,"body":"{\"applicationId\":\"app_01a11cc9b8c47dbb8182e3ccf53ba9ec\",\"status\":\"reused\",\"interviewId\":\"iv_01a11cc9c8b976d993e385492b2b088b\",\"redirectTo\":\"/interview/iv_01a11cc9c8b976d993e385492b2b088b?applicationId"}
```

- **`app_start` status=200 · body `status=started` + 绑定 interviewId + 可信 redirectTo**——G7P-5 定谳的 409 `interview_ineligible_route` 时序错位面**已消**：route 轮询在 start fetch 前完成（app_start elapsed 仅 16ms ⇒ 等待已越过 · 精确等待 ms 不可测——见下 deadletter 注记）。
- `app_start_reid` 200 `reused` 同 interviewId——幂等臂 F3 同窗干净。
- 无 thrown 行（零 fetch 抛面）· bootId=71488=本 run driver 进程 pid（run 前 unlink 亲证 ⇒ 文件内任何行必属本 run）。

### reviewLedger 判读（19 行 · 本线最深旅程进度）

`…seg_bound_start_enter(M5) → seg2_start_readjson(F1) → seg2_start_assert_pre(F2) → **seg2_start_assert_post(F2.5·上刀致死断言本刀绿)** → seg2_idem_assert_post(F3) → seg2_begin_assert_post(F4·绑定 begin 202) → seg_boundloop_enter(M6) → assessment_unavailable(worker 终态记账) → seg_boundloop_terminal(M7·末行)`——G7P-4 时死亡点（base :347-:349 start 原子创建断言）**整面越过**，并推进经幂等臂、绑定 begin、boundLoop 至 terminal 记账。

### 四向判读（预注册 · 如实 · 两臂复合如实拆记）

- **修复面成立（臂1 的「越过 start 死点推进」证据材料在卷）**：start 死点消灭——F1/F2/F2.5/F3/F4 全绿 + NDJSON 双行 200 + M6/M7 推进。修复生效的最终定谳与 trio 再跑评估、`:107` 收口材料完备性**归协调方裁**（EXEC 不自批 arm-1 全款）。
- **命中 = 臂2（红于 start 之后新死点）**：红 EXIT=1 于 post-M7 断言窗（**base 坐标 :387-:405** · 现树 :400-:418 · 本刀 +13 净移位）——`assessment_unavailable` 终态下 `scorelessBound=true` 分支：:387 questions/turns 断言、:388 出处审查、:393 finalize outcome、:400 candidates 可信无分面、:404 显式重试新 attempt 面五候选；**精确行不可归因**（M7 后零 marker 系设计如此 · stdout 死信第三次复证）· class=api 与 api 面断言一致 · **归下一定靶刀如实登记**（G7W 尾段簇家族或 finalize/candidates 面定靶权归协调方）。
- **臂3 未命中**：cap 未耗尽（route_decided 已观测 ⇒ 判别读数 ② 未触发 · `job_semantic_revision.status` 无读必要 · 诚实注记：轮询绿面 console.log 行被死信吞没，wrapper log 零 `[g7fix1]` 行亲证）· 臂4 未命中（NDJSON 三行俱在 · 无 ReferenceError/基座自伤 · rev3 锚点自洽兑现）。

### 裸 stdout 死信三证（沿 G7P-4/G7P-5）

wrapper run-log 19 行零 driver 断言/summary/`[g7fix1]` 输出（stdout 只进 wrapper 内存从不回显）——「NDJSON 文件面为唯一可靠收据面」第三次实证；`[g7fix1] route_decided observed after Xms` 精确等待时长随之不可归档（仅保有 elapsed 16ms 上界 bound · 如实）。

## 3. sidecar v2 实测臂（五纪律 · 自弃如实登记 · 单臂记账 Ban 冒充双臂）

- ①post-migrate 锚达成：tick `anchored=true`（run-log `E2E_POSTGRES_READY label=post-migrate` 触发 · Ban container_found 锚兑现）②容器精确绑定 `meetwise-e2e-71087-1791484280182:58930` ③零 42P01 tick ④correlation **match=false 自弃**：`expectedMax='0151'` vs 实测 `0151_pgp_sym_encrypt_grant`——**G7P-5 erratum-2 已登记缺陷复发**（本席 erratum：选型失察——照抄 g7p5 副本未预检 pin 格式；g7y 变体系更旧 0142 pin，在卷无 152/`0151_pgp_sym_encrypt_grant` 全名修正变体）⇒ **零 poll tick**（ticks 恰 3 行：container/anchor/correlation）· 停因 `correlation mismatch => discard (registered)`。
- **live est 记账本 run 不可实测**：sidecar 自弃 + 容器随 run 拆除 ⇒ N=null（诚实 null · 不估不冒充）；链累计 **0+0+14+N(null)** 起算 · 硬帽 200 无实测读数不作声称（定性上界：failLoop 域 G7P-4 实账 14 不因本刀改变 · boundLoop 有界增量 · 远不及帽——此为定性注记非实测）。interview_job/ai_model_invocation 投影本 run 零读。
- 恰 1 run 纪律下**不以重跑补 sidecar**（Ban 重跑至绿·Ban 补臂重跑）· 修正变体归下刀工具面。

## 4. Key 卫生

`MODEL_API_KEY` 只经授权 loader（`~/.meetwise-secrets/load-model-api-key.sh` source · 进程环境注入 · pre-flight 亲验 present）· 收据/日志/ticks 全 name-only（`MODEL_API_KEY=present(name-only,via-loader)`）· 零键值零 fingerprint 入任何 artifact · `.env*` ABSENT（未创建）。

## 5. 证据附件（本目录）

- `00-exec-receipt.md`（本文）· `01-run-log.txt`（wrapper 日志 19 行原样）· `02-ticks.jsonl`（sidecar 3 行原样）· `03-isolated-receipt.json`（runner receipt 原样）· `04-consent-capture.ndjson`（NDJSON 3 行原样）· `05-sidecar-stdout.log`（sidecar stdout 5 行原样）· `sidecar-v2.mjs`（g7p5 副本 outDir re-home · 恰 1 行差异 provenance 注记在文内）。

## 6. Non-claims

Not a pass · not green（EXIT=1 原值）· 修复生效定谳 not 自批（start 死点消灭证据在卷 · 结论归协调方 post-prove 双审 + trio）· not G7 收官 ≠ g7SuiteGreen 翻转 ≠ `:107` 关闭（收口材料归 SSOT 刀 · 本刀仅材料面候选）· post-M7 新死点**零归因定谳**（五候选窗如实有界 · 精确行留下一定靶刀）· est ≤25 not 实测（N=null · sidecar 自弃如实）· not covered · not HA · not releaseEvidence · not nail · not coordinator authorize（post-prove 双审与下刀定靶归协调方）· alone ≠ dual
