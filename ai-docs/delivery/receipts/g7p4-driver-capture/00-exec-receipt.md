# G7P-4 · full.e2e driver 内联 NDJSON 截获刀 · EXEC 收据（单 attempt）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落：consent 步内联截获 +6/−2 + 判读 run 恰 1 次 EXIT=1 原值 + 四向判读=臂2 命中 · STOP awaiting post-prove dual · post-prove 双审归协调方派 · Ban self-approve）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base 与执行地

- 蓝本 = REQUEST rev2 `f99928b8`（worktree `meetwise-line-g7p4` · 分支 `line/g7-driver-capture`）· 代码面 = 152 面（run 实测 `migrations: applied=152 skipped=0` + receipt `schemaMigrationManifest.count=152 latest=0151` 亲证）。
- 执行地：worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7p4` · EXEC HEAD = 本 commit（收据自证）。

## 1. Coding 面（≤8 行硬门 · 亲证）

- 恰 1 文件 `e2e/full.e2e.ts` · 仅 consent 步（原 `:35-:36` 两行 → 新 `:35-:40` 六行）· `git diff --numstat` = **+6/−2（合 8 行 · ≤8 达标）**· `git status` 仅此一文件（apps/packages 零 diff · helpers/wrapper/解析器零触碰）。
- 改造要素逐项落位：①`await import('node:fs')` 步内动态导入（零顶部 import · 保「仅 consent 步」·另 `mkdirSync('.tmp',{recursive:true})` 防御性自保障——wrapper 仅在 G7 旗标下预建 `.tmp`，缺此行 appendFileSync 将 ENOENT 自毁截获面）②bootId=`process.pid`（=启动时刻 pid · pid 全程不变）③appendFileSync NDJSON 行体 `{bootId, step:'consent', status, elapsed_ms, body:JSON.stringify 截 200}`（单行闭合 · stringify 防伪锚 · SIGKILL 安全）④try/catch 包 fetch·catch 面 `thrown=<e.name>/<e.code>/<e.cause?.code>`（cause 面在场）后 **rethrow 原语义**⑤断言消息内嵌实际 status：`PIPL 采集同意 → 200 (实际 ${r.status})`。
- 预检（run 前 · 零 e2e 执行）：esbuild transpile-only EXIT=0（语法面）· `e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6）· `.tmp/e2e-consent-capture.ndjson` **run 前 unlink 亲证**（`ls` ENOENT · 零残留容器 `docker ps` 零 meetwise-e2e-* 命中）。

## 2. 判读 run（恰 1 次 · 红原值 retained · Ban retry-to-green 兑现）

| 项 | 读数 |
| --- | --- |
| 命令 | `pnpm e2e:isolated`（worktree 内 · `MODEL_API_KEY` 经授权 loader source 进程注入） |
| EXIT | **1（原值 · retained）** · wrapper 外壳 `E2E_ISOLATED_EXIT=1` |
| receipt | `.tmp/e2e-receipts/2026-10-08T13-52-57-041Z-93803-…json`：outcome=failed · failureClass=**api** · durationMs=**61848** · assertionCount=null（红 run 无成功 summary · 正常形状） |
| 容器 | `meetwise-e2e-93803-1791467515192` on 127.0.0.1:58403（随 run 拆除 · `docker ps` 零残留亲证） |
| sourceDigests | `e2e/full.e2e.ts`=`sha256:7932c6dd…`（=本刀树工作区产出 · 其余 15 文件全等 · helpers/wrapper 零触碰佐证） |

### NDJSON 截获记录（亲读转录 · 全量恰 1 行）

```json
{"bootId":94571,"step":"consent","status":200,"elapsed_ms":12,"body":"{\"recorded\":true,\"policyVersion\":\"v1\"}"}
```

- 恰 1 行 = 主旅程 consent 步（:310 H3 无额度用户 consent **未埋点** · 「仅此步」兑现）· 无 thrown 行（fetch 零抛）· bootId=94571=本 run driver 进程 pid（run 前 unlink 亲证 ⇒ 文件内任何行必属本 run）。

### 四向判读（预注册 · 如实）

- **命中 = 臂2（红且 capture 记录 consent=200）**：红 EXIT=1 在 152 面仍存，但 **consent 面干净**（200 · 12ms · 本地单次往返合理）⇒ **死亡面后移**——红不在 consent 步。
- **死亡点 ledger 有界定位**（reviewLedger 14 行 · 末行 `seg2_start_assert_pre`）：F1 `seg2_start_readjson`(:344) ⇒ start fetch/readJson 已完整返回 · F2 `seg2_start_assert_pre`(:346) ⇒ 断言面前进入 · 下一个 marker `seg2_idem_assert_post`(:354) **缺席** ⇒ fail-fast 语义下唯一自洽致死点 = **:347-:349 `[状态机] start 原子创建岗位专属会话…并返回可信跳转` 断言**（base-era 行号 :343-:345 · 本刀 +4 净移位）。
- **同族判据**：class=api · 旅程尾段（61.8s · 已越过 M1-M5 与 7a 兜底面——本 run failLoop terminal=`report_unavailable` 与断言期望一致 · 7a PASS，系**本线最深旅程进度**，越过 CMOP03-D 鉴别刀红点 `:236`-era）⇒ **G7W 尾段簇同族候选成立**（61.8s 晚于 G7W 窗 37.9-40.6s · 尾段域一致 · 窗值本身不重贴）。
- **臂1/臂3/臂4 未命中**：非 consent 非 200/thrown（臂1 否）· 非绿故「152 面不红」**不成立不声称**（臂3 否 · 144 对比臂与 :107 维持 OPEN 均不触）· NDJSON 有本 run bootId 记录（臂4 否）。
- **consent 面 (f) 材料成立**（臂2 预注册条款）：consent 端点在 152 面结构性与键面双干净；start 断言面红成因**零归因**（status 实值未截获——本刀仅埋 consent 步 · 如实）。

### 裸 stdout 死信复证（顺带 · 与 G7P-3 一致）

wrapper run-log 19 行零 driver 断言/summary 输出（stdout 只进 wrapper 内存从不回显）——rev2 处方「NDJSON 文件面」为唯一可靠收据面，本 run 再次实证。

## 3. sidecar v2 实测臂（五纪律 · G7Y 前向 · 如实）

- ①post-migrate 锚：tick-0 `anchored=true`（run-log `E2E_POSTGRES_READY label=post-migrate` 触发 · Ban container_found 锚兑现）②零 42P01 pending tick（锚后表已在 · 停针计数器未触发）③逐查询 guard：teardown 窗恰 1 个双面 `query_failed` tick（容器拆除竞态 · 预期内）④v2 策略载体=sidecar 源文+本节⑤必读面双读：`ai_model_invocation`+`interview_job` 每 tick 双投影。
- G7Y 前向：SELECT-only 冻结投影 · 精确容器名 `meetwise-e2e-93803-1791467515192` · `created_at>=runStart`（1791467508805ms）· 相关性校验 **migrations=152/152 match=true** · 零失配弃读 · 46 poll tick 恰 1 err（teardown）≠零读数 ⇒ **双臂互证成立**（driver 臂 EXIT/ledger + sidecar 臂账本）。
- **live 记账（last-good tick 13:52:56.602Z · teardown 竞态 ±1-2 下限界）**：`ai_model_invocation` succeeded=10 + failed=4 = **live 14 双计**（dispatching=1 在途不计 · 沿 G7X 7=5+2 / CMOP03-E 14=9+4 / G7Y CMD1 14=10+4 同法）· `interview_job` done=11 · attempts_max=1（零重试）· **est ≤25 达标** · 链累计硬帽 200 远未触 · `actualSpendCny=null`。
- interview_job 读数前提注记（沿 cmop03f rev2）：「请求已达」前提——fetch 抛面零新行相容，本 run F1 已证 start fetch 返回。

## 4. Key 卫生

`MODEL_API_KEY` 只经授权 loader（`~/.meetwise-secrets/load-model-api-key.sh` source · 进程环境）· 收据/日志/ticks 全 name-only（`MODEL_API_KEY=present(name-only,via-loader)`）· 零键值零 fingerprint 入任何 artifact · `.env*` ABSENT（未创建）。

## 5. 证据附件（本目录）

- `00-exec-receipt.md`（本文）· `01-run-log.txt`（wrapper 日志 19 行原样）· `02-ticks.jsonl`（sidecar 49 行原样）· `03-isolated-receipt.json`（runner receipt 原样）· `04-consent-capture.ndjson`（NDJSON 记录原样恰 1 行）。

## 6. Non-claims

Not a pass · not green（EXIT=1 原值 · 「152 面不红」未成立——臂3 未命中）· not 修复（start 断言面红成因零归因零定谳 · 修复刀归协调方另立）· not G7 修复 ≠ g7SuiteGreen 翻转 ≠ trio 面 · not `:107` 触碰（仍 OPEN）· not 144 对比臂（归因 144 ACL 缺失仍系假设 · 因果定谳留 144 面对比臂）· not covered · not HA · not releaseEvidence · not nail · not coordinator authorize（post-prove 双审与 nail 归协调方）· capture 行格式不承诺解析器兼容外任何契约 · alone ≠ dual
