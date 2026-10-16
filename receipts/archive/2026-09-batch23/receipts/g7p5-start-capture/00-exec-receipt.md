# G7P-5 · full.e2e start 步 NDJSON 截获 + 断言间 marker 刀 · EXEC 收据（单 attempt）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落 mw-core：start 步截获 +5/−2 + marker 恰 1 · 判读 run 恰 1 次 `pnpm e2e:isolated` EXIT=**1** 原值 class=api 61309ms · **六向判读=臂1 命中：409 `interview_ineligible_route` 拒启码面定谳**〔NDJSON `app_start` 记录亲读 + marker `seg2_start_assert_post` 缺席双面互证 ⇒ 致死点 = `:347-:349` start 原子创建断言〕· sidecar correlation 自弃缺陷如实登记（零 poll tick ⇒ driver 单臂+缺陷附注·Ban 单臂冒充双臂）· STOP awaiting post-prove dual · post-prove 双审归协调方派 · Ban self-approve）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base 与执行地

- 蓝本 = REQUEST rev2 `16b1bb8d`（分支 `line/g7-start-capture` · tip 含 G7P-4 consent 截获面 cherry-pick · 禁 rebase 兑现——EXEC 全程零 rebase 零改基）· 代码面 = 152 面（run 实测 `migrations: applied=152 skipped=0` + receipt `schemaMigrationManifest.count=152 latest=0151_pgp_sym_encrypt_grant.sql` 亲证）。
- 执行地：worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7p5` · EXEC HEAD = 本 commit（收据自证）。
- 依赖预置：worktree 无 `node_modules`，`pnpm install --frozen-lockfile` EXIT=0（4.3s · 环境预置非代码改动）。

## 1. Coding 面（≤6 行+1 marker · diff ≤7 硬门 · 亲证）

- 恰 1 文件 `e2e/full.e2e.ts` · 仅 start 步（原 `:342` fetch 一行 → try/catch 两行；原 `:349` 断言消息行改写；`:349` 后 `:350` 前插 marker 行；`:351` 后插 reid 记录行）· `git diff --numstat` = **+5/−2（合 7 行 · ≤7 达标；新增 4 代码行+1 marker 行 · ≤6+1 达标）**· apps/packages 零 diff · helpers/wrapper/解析器零触碰（receipt `sourceDigests` 15 文件工作区逐一重算全 MATCH 亲证）。
- 改造要素逐项落位：①`fs`/`bootId`/`mkdirSync` 全自 `:35` consent 面复用（零新 import·零新 mkdir）②start fetch 包 try/catch（G7P-4 consent 同形态）：happy 面**先 `r.clone().text()` 记录后 readJson**（readJson 消费 body 永不抛——http.ts:4-10 席1 处方兑现），记录 `{bootId, step:'app_start', status, elapsed_ms, body:<截 200>}`；catch 面 `thrown=<e.name>/<e.code>/<e.cause?.code>` 后 rethrow 原语义③marker `reviews.record({ class: 'worker', code: 'seg2_start_assert_post' })` 逐字落 `:349` 后 `:350` 前（同行顺带 `const idemT0 = Date.now();` 幂等臂计时起点——marker record 调用本体逐字未动·如实披露）④幂等臂 fetch 独立一行记录（REQUEST §1.3 明示许可形态）：`{bootId, step:'app_start_reid', status, elapsed_ms, body:JSON.stringify(reused ?? {}).slice(0,200)}`⑤断言消息内嵌实际 status：`…并返回可信跳转 (实际 ${r.status})`。
- body 字段法注记：start 臂 body 用 clone 原文 `.slice(0,200)`（外层 `JSON.stringify` 闭合单行伪锚——consent 臂内层 stringify 系因彼为已解析对象，本臂为响应原文·同归一化语义如实注记）；reid 臂 body 用已解析 `reused` 对象（consent 同法）。
- 预检（run 前 · 零 e2e 执行）：`pnpm e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6）· `.tmp/e2e-consent-capture.ndjson` run 前 **ENOENT 亲证**（`.tmp` 整目录缺席 · 零残留）· launch 时 `docker ps` 零 RUNNING `meetwise-e2e-*`（另见 §3b 环境注记）。
- **erratum-1（语法门实测披露）**：REQUEST §4「node --check 过」名义 EXIT=0，但**阴性对照证明其在本机 Node v22.22.3 对 .ts 系空转**（对注入 `readJson(r;;` 语法错误的副本仍 EXIT=0）——真语法门改用 `esbuild.transformSync(loader:'ts')`：本树 EXIT=0 TRANSFORM OK·阴性对照如期 FAIL。名义门与实门双登记，零隐瞒。

## 2. 判读 run（恰 1 次 · 红原值 retained · Ban retry-to-green 兑现）

| 项 | 读数 |
| --- | --- |
| 命令 | `pnpm e2e:isolated`（worktree 内 · `MODEL_API_KEY` 经授权 loader source 进程注入） |
| EXIT | **1（原值 · retained）** · wrapper 外壳 `Command failed with exit code 1` |
| receipt | `.tmp/e2e-receipts/2026-10-08T17-54-55-724Z-35270-2c78…json`：outcome=failed · failureClass=**api** · durationMs=**61309** · assertionCount=null（红 run 无成功 summary · 正常形状） |
| 容器 | `meetwise-e2e-35270-1791482034414` on 127.0.0.1:49470（随 run 拆除 · 收据组立时零本 run 容器残留亲证） |
| sourceDigests | `e2e/full.e2e.ts`=`sha256:4c92fb84…`（=本刀树工作区产出 · 其余 14 文件全等 MATCH 亲证） |

### NDJSON 截获记录（亲读转录 · 全量恰 2 行 · bootId=35819=本 run driver pid · run 前 ENOENT 亲证 ⇒ 行必属本 run）

```json
{"bootId":35819,"step":"consent","status":200,"elapsed_ms":7,"body":"{\"recorded\":true,\"policyVersion\":\"v1\"}"}
{"bootId":35819,"step":"app_start","status":409,"elapsed_ms":3,"body":"{\"error\":\"interview_ineligible_route\",\"message\":\"该岗位路由尚未就绪，暂不可开始题库面试；请待岗位补充描述并完成路由后再试\"}"}
```

### 六向判读（预注册 · capture 记录优先 · 如实）

- **命中 = 臂1（409 码面）**：`app_start` capture = **status 409 · `error=interview_ineligible_route`**（REQUEST rev2 §2 wire 实名三支之一·service.ts `:50` 域）⇒ **拒启码面定谳：服务端在 start 原子创建前以 409 `interview_ineligible_route` 拒启**（「岗位路由尚未就绪」门·要求岗位补充描述并完成路由）⇒ **修复刀定靶该分支**（driver 前置序列 vs 服务端门序的错位面——归协调方另立全链，本刀不修）。
- **marker 分辨（席1 erratum(b) 兑现）**：reviewLedger 13 行 · 末行 `seg2_start_assert_pre` · **`seg2_start_assert_post` 缺席** ⇒ 致死点 = **`:347-:349` start 原子创建断言**（409≠200 fail-fast 抛）· **非 `:350-:353` 幂等臂**（`app_start_reid` 记录缺席与 marker 缺席互证一致）——G7P-4 ledger 有界判读（首候选 :347-:349）**实测坐实**。
- **thrown-face 缺席**：无 `thrown` 行 ⇒ start fetch 返回真实响应（409），连接层 (c) 轴**不涉案**；G7P-4 AggregateError 形态注记本次无需行使。
- **consent 面复证**：`consent` 200/7ms 干净（与 G7P-4 一致）· G7P-4 截获面 cherry-pick 后在本 run 正常工作（一行不缺）⇒ 截获面常驻性兑现。
- **500 mask 臂/5xx 臂/200-shape 臂/200 全绿幂等臂 未命中**：如实各零。
- elapsed 注记：app_start 3ms 为本地单次往返合理值；「请求已达」前提由 capture 在场自证。

## 3. sidecar v2 实测臂（五纪律 · 如实 · 含自弃缺陷登记）

- 五纪律行使：①post-migrate 锚 tick 在场（`anchored=true` · Ban container_found 锚）②零 42P01 pending tick（锚前即 correlation 弃读·停针未触发）③逐查询 guard（本 run correlation 后未进 poll 面）④v2 策略载体=`sidecar-v2.mjs` 源文+本节⑤双必读面（`ai_model_invocation`+`interview_job`）载入 QUERIES 未及行使。
- **缺陷如实登记（erratum-2）**：correlation 期望 `max(version)=='0151'`，实测值=`0151_pgp_sym_encrypt_grant`（version 列含名称后缀——G7P-4 收据 `latest=0151_pgp_sym_encrypt_grant.sql` 本已示形·本席脚本期望格式写错）⇒ 前向纪律 mismatch⇒弃读条款**自我触发**：`match=false` ⇒ sidecar 17:54:01 自停，**零 poll tick**（ticks.jsonl 全量恰 3 行：container/anchor/correlation）。
- **后果记账（Ban 单臂冒充双臂兑现）**：本 run live 双计读数（`ai_model_invocation` succeeded+failed / `interview_job` done/attempts）**缺席** ⇒ est ≤25 对本 run **不可证实亦不可证伪**·双臂互证**不成立** ⇒ 本 run 记 **driver 单臂+缺陷附注**；链累计 = 0+0+14 + 本刀 live N（**读数缺席·不伪称**）· 硬帽 200 形式维持；`actualSpendCny=null` 不变。container 已随 run 拆除，读数不可补采（单 attempt 纪律禁重跑）。

### 环境注记（如实 · 零隐瞒）

- launch 前零 RUNNING `meetwise-e2e-*`；存在 **Exited(0) 28h** 前任 run 残留 `meetwise-e2e-62497-cold2-stop-band-1-…`（非本刀线·未触碰未清除）。
- 收据组立期观测到 **`meetwise-e2e-godfn1c-35997` Up**（异席/异会话并发 run·命名与 pid 均非本 run 35270/35819）——未触碰·如实披露。

## 3b. EXEC 期流程披露（erratum-3）

首次 launch 因 `.tmp` 目录缺席在 shell 重定向面失败（`pnpm`/wrapper/容器**均未执行·零 e2e 面 touched**）——`mkdir -p .tmp` 后重试 launch。**Ban retry-to-green 不涉案**（失败发生在 run 之前，非红 run 重试）；判读 run 全程恰 1 次。

## 4. Key 卫生

`MODEL_API_KEY` 只经授权 loader（`~/.meetwise-secrets/load-model-api-key.sh` source · 进程环境注入）· 收据/日志/ticks 全 name-only（`MODEL_API_KEY=present(name-only,via-loader)`）· 零键值零 fingerprint 入任何 artifact · `.env*` ABSENT（未创建）。

## 5. 证据附件（本目录）

- `00-exec-receipt.md`（本文）· `01-run-log.txt`（wrapper 日志 19 行原样）· `02-ticks.jsonl`（sidecar 3 行原样·correlation 弃读前停）· `02b-sidecar-cmd.log`（sidecar 控制台原样）· `02c-sidecar-final.json`（sidecar 终态 summary）· `03-isolated-receipt.json`（runner receipt 原样）· `04-start-capture.ndjson`（NDJSON 记录原样恰 2 行）· `sidecar-v2.mjs`（as-ran 源文·含缺陷原样·不追改）。

## 6. Non-claims

Not a pass · not green（EXIT=1 原值 retained）· not 修复（409 `interview_ineligible_route` 码面到手·修复刀归协调方另立全链——本刀不触产品码不定修法）· not G7 修复 ≠ g7SuiteGreen 翻转 ≠ trio 面 ≠ `:107` 触碰（仍 OPEN）· not 双臂互证（sidecar 零 poll tick·单臂+缺陷附注）· not est 兑现声称（读数缺席不伪称）· not nail · not coordinator authorize（post-prove 双审与 nail 归协调方）· capture 行格式不承诺解析器兼容外任何契约 · alone ≠ dual
