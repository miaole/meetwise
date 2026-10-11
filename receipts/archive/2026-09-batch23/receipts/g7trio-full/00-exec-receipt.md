# G7TRIO · trio 全景再跑刀 · EXEC 收据（恰 3 run · attempts 1,1,1 · 零 retry-to-green · 零调序）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落：三 CMD 各恰 1 run·EXIT 原值 **CMD1=1 / CMD2=0 / CMD3=1**＝**1 绿 / 2 红·非三绿候选**·预注册三向判读命中**臂 3（CMD1 红）**·与 EXEC 指令席2 校准预期（分支 2：CMD1 绿+CMD2/3 构建相位红）**三面均偏离·如实登记**·判读结论+域读数增量归协调方裁 · STOP awaiting post-prove dual · Ban self-approve）

Pins 十值照抄（零翻转）：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base 与执行地

- 蓝本 = REQUEST `692e8286`（worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7trio` · 分支 `line/g7-trio-full`）· harness = `ai-docs/delivery/harness/g7trio-full.md`（draft:awaiting_pre_exec_dual → 本刀推进 `exec:awaiting_post_prove_dual`·推进+两处措辞注记见 harness 文内 EXEC 注记节）· 双席预审 BOTH PASS 处方并入授权（EXEC 指令 · correlation 锚保持 `^0151` 零迁移）。
- EXEC HEAD = `692e8286ee6a71254a9ff5a1ede5749a058fb080`（= REQUEST commit · `git status` 开工/收工双探针：工作树零 tracked diff·仅新收据目录 `??`）· 执行序 **CMD1→CMD2→CMD3**（Ban 调序）· `3acc6fb5`（tokstream · apps/web 触碰面）为 HEAD 祖先亲证（`git merge-base --is-ancestor` ✓）。
- 环境探针：docker server 29.1.3 · node v22.22.3 · pnpm 10.18.0 · fresh worktree `node_modules` 缺席 → `pnpm install --frozen-lockfile` EXIT=0（3.9s · 零 lockfile 改动）· Key **set（name-only 探针）**只经进程环境 loader（`~/.meetwise-secrets/load-model-api-key.sh` · 值零打印零入库）· **`.env*` ABSENT**（全程零创建零读取）· run 前 host 观测：仅 `mw-itx4` / `meetwise-e2e-godfn1c-35997`（他 session 遗留 · 本刀零触碰零采信）/ `meetwise-postgres-dev`（dev 面）三点名；收工同三点名＝本刀三容器用后即焚**零残留**亲证。
- 预飞静态门（零 e2e 执行）：`apps/web/.next/BUILD_ID` **ABSENT**（CMD2 前亲证）→ 必现场新 build；esbuild transform `e2e/full.e2e.ts` EXIT=0 + `node --check`（transformed JS）EXIT=0（G7P-5 erratum-1 真门）· `e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6）· `.tmp/e2e-consent-capture.ndjson` 与 `.tmp/g7fix2-sidecar/` run 前 ENOENT 亲证。

## 1. Attempts 台账（恰各 1 run · EXIT 原值 · Ban retry-to-green 兑现 · 本次两红无需援引亦未重跑）

### CMD1 · `pnpm e2e:isolated`（attempt#1 · 唯一）

| 字段 | 原值 |
| --- | --- |
| CMD 原文 | `pnpm e2e:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs` · Key 经授权 loader source 进程注入） |
| EXIT | **1**（原值 · `E2E_FAILURE_CLASS class=api`） |
| UTC 窗 | start 19:34:36Z → end 19:35:21Z（machine receipt `19:34:36.518Z→19:35:21.315Z` · **durationMs=44797** · assertionCount=null＝红 run 正常形状） |
| reviewLedger | 恰 **4 行**：`image_ocr_unavailable`(capability) → `voice_unavailable`(capability) → `report_unavailable`(worker) → **`interview_unavailable`(worker·末位)** · **M1-M7 全未达**（红点极早·journey 前段） |
| NDJSON | 全量恰 **1 行**：`bootId=93948 consent 200(6ms)` 后**零行**（无 app_start 成功行 · 无 thrown 行）——红点=consent 之后、app_start 截获之前·精确行不可归属（沿 G7FIX-1「exact line unattributable」如实记） |
| 容器 | `meetwise-e2e-93393-1791488076517:56213`（migrations applied=152 skipped=0 · 用后即焚） |
| sourceDigests | `e2e/full.e2e.ts`=`sha256:c74cecd3588cd20f477d36285c9aea28fdcbdd8172111d222b3eb8c083277339`（**=G7FIX-2 收据同值** · e2e 面零漂移亲证） |
| machine receipt | `cmd1-isolated-receipt.json`（原物拷贝 · schemaMigrationManifest count=152 latest=`0151_pgp_sym_encrypt_grant.sql`） |

### CMD2 · `pnpm e2e:ui:isolated`（attempt#1 · 唯一 · **无 grep 过滤全量套件**——G7Y E-5① 偏离不复现）

| 字段 | 原值 |
| --- | --- |
| CMD 原文 | `pnpm e2e:ui:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:ui` → `run-e2e-ui.mjs`） |
| EXIT | **0**（原值） |
| UTC 窗 | start 19:36:35Z → end 19:41:02Z（**4m27s**） |
| web 构建面 | `无 .next/BUILD_ID → 现场next build → production next start :36057`——**build 绿**（无 Failed-to-compile 面 · BUILD_ID 落盘 post-run PRESENT 亲证）——**席2「base≡red retained」校准本树未兑现**（如实记·见 §4） |
| Playwright 面 | **Running 24 tests：14 passed (3.6m) / 0 failed / 10 skipped**（恰 G7Y addendum 全量基线同形 14P/0F/10S）· 零 flake-retry 触发 · 零失败工件 |
| 主旅程 | `recruiting-bound:143` chromium 1.5m + mobile 1.3m 双 project 绿 · `[g7u-fixture] route_decided observed: 4018ms / 3020ms · revision_status=route_decided · attempt_outcome=result_validated`（G7U 轮询臂行使） |
| 容器 | `meetwise-e2e-95711-1791488196023:56656`（migrations applied=152 skipped=0 · 用后即焚） |
| machine receipt | **不适用**（e2e:ui 绿 run 产物仅 wrapper stdout+EXIT=0 · G7Y E-3 先例同形）· wrapper 全文 55 行随收据 `cmd2-wrapper.log` |

### CMD3 · `pnpm verify:e2e-performance`（attempt#1 · 唯一）

| 字段 | 原值 |
| --- | --- |
| CMD 原文 | `pnpm verify:e2e-performance`（= `run-e2e-performance-suite.mjs` · 27 step 套件 · fail-fast） |
| EXIT | **1**（原值 · `Error: e2e_performance_suite_failed:API negative paths:exit=1`） |
| UTC 窗 | start 19:42:12Z → end 19:48:16Z（**6m04s** · 套件 receipt gitHead=`692e8286` 自证实跑 code） |
| step 台账 | 步 1 **web production build EXIT=0（25969ms）**→ 步 2 schema migration EXIT=0（5471ms）→ 步 3 **HTTP full E2E EXIT=0（72023ms · assertionCount=75 · reviewLedger 19 行末位 `seg_boundloop_terminal`=M7 全程绿形）**→ 步 4 browser full E2E EXIT=0（229260ms · 14 passed/10 skipped）→ 步 5 stream idempotency EXIT=0（1874ms）→ 步 6 resume extraction EXIT=0（1154ms）→ 步 7 RAG structural EXIT=0（584ms）→ 步 8 API burst performance EXIT=0（11907ms）→ 步 9 API contract/integration EXIT=0（9087ms）→ **步 10 API negative paths EXIT=1（6079ms · `neg:all` 157 PASS / 7 FAIL）**→ 步 11-26 **not_run**（fail-fast · not_run ≠ pass 如实记） |
| 步 10 红因 | **`consume/` 族恰 7 FAIL**：无额度 402 / 过期额度 402 / 越权他人面试 404 / 并发超卖·恰一场 402 / 并发超卖·被拒方 insufficient_entitlement / 并发同面试双击·reserved==1.0 / 并发同面试双击·仅 1 条 consumption（幂等）——`neg:all` token(25)/devheader/signup(13) 等其余 157 PASS |
| 容器 | sidecar 绑定 3 只：`meetwise-e2e-2494-…:58224`（migrate 步 · 仅 label=pre-prove 无 post-migrate 锚 · G7Y E-4 同形）→ `meetwise-e2e-2849-…:58256`（HTTP 步）→ `meetwise-e2e-4467-…:58544`（browser 步）· 全用后即焚 |
| machine receipts | `cmd3-perf-suite-receipt.json`（套件 receipt · 10 step 表 + outputLog sha256 在卷）+ `cmd3-step3-http-receipt.json`（HTTP 步 75 断言 receipt 原物拷贝） |

**间歇性定谳面（同树同 commit 8 分钟两 run 对照）**：CMD1 独跑同 driver **红**（4 ledger 行·consent 后即寂）vs CMD3 步 3 同 driver **绿**（75 断言·M7 全程）——NDJSON 双 bootId 同卷（`cmd3-step3-ndjson-capture.ndjson` 9 行：93948 红形 1 行 + 3424 绿形全 8 行：consent/app_start 200/app_start_reid/a1_loop(2题4答)/a2_provenance(identities=4=2+2·trustedBSideScore=null)/a3_finalize/a4_cand(score=null)/a5_retry 200 started 新 interviewId）——**G7FIX-2 绿形在本刀窗口内可复现，但非逐 run 必现**（单 run 限定语兑现风险如实兑现·臂 3）。

## 2. sidecar v3 实测臂（逐键 · correlation 锚保持 `^0151` 零迁移 · sidecar-v3.mjs 原样复用零改）

| 纪律条 | CMD1 | CMD2 | CMD3 |
| --- | --- | --- | --- |
| ① post-migrate 锚（Ban container_found 锚） | ✓ 1 锚（93393） | ✓ 1 锚（95711） | ✓ 2 锚（2849 HTTP + 4467 browser · 2494 migrate 容器仅 pre-prove 无锚·零 poll） |
| ② 42P01 pending 窗 | 0 tick | 0 tick | 0 tick |
| ③ 停针计数器仅 post-first-ok 武装 | ✓ 持械 · **触发**（teardown 后 5 连败收口·非误停） | ✓ 持械 · **触发**（同） | ✓ 持械 · **触发**（19:47:50 · browser 容器 teardown 后——**步 5-10 未获 sidecar 覆盖**·仪器面局限如实记） |
| ④ v3 策略落文字 | `g7fix2-postm7/sidecar-v3.mjs` 原样（本刀零改·头注 correlation `/^0151(_|$)/` 即席2 处方锚） | 同 | 同 |
| ⑤ 必读面 interview_job + ai_model_invocation | ✓ 逐 ok tick 双读 | ✓ | ✓（逐容器重绑 · anchor/firstOk/correlation 随绑重置） |
| 精确容器名+端口绑定 | `93393:56213` | `95711:56656` | `2494:58224`/`2849:58256`/`4467:58544` |
| correlation（152 + `/^0151(_|$)/` · 剥 `.sql` 归一） | ✓ match=true（`0151_pgp_sym_encrypt_grant`） | ✓ match=true | ✓ match=true ×2 容器 |
| 停针方式 | stop-needle（STOP 哨兵并发到达） | 同 | 同 |

- **双计读数（succeeded+failed · dispatching 不计入 · teardown 撕裂 ±1-2 行下限界沿 G7Y E-2）**：CMD1 **10**（7+3 · +dispatching=1 在途）· job done=8 max attempts=1 + running=1；CMD2 **21**（17+4 · +dispatching=1）· job done=12 max attempts=2；CMD3 **41**（HTTP 容器 21=16+5 · job done=16 attempts 1；browser 容器 20=17+3 · +dispatching=1 · job done=12 attempts 2 + running=1）——**CMD3 步 5-9 容器未获 sidecar 覆盖（停针先收口）·未测 ≠ 0 如实注记（est-not-counter）**。
- poll 计数：CMD1=37（40 ticks）· CMD2=224（227 ticks）· CMD3=252；`fallbackUsed=false` 三臂全真 · SELECT-only 聚合零行内容零 PII。
- **G7Y E-1 前向注兑现**：逐 run 独立 ticks 路径——`cmd{1,2,3}-sidecar-ticks.jsonl` 三份独立归档（sidecar 目录逐 run 清零后复用·脚本零改·编排面隔离）。
- 裸 stdout 死信**五/六证**：CMD1 wrapper 19 行 + CMD3 套件 log 1022 行均**零 `[g7fix2]` marker 行**（grep -c=0/0 亲证）·NDJSON 面仍为唯一可靠截获面（沿 G7P-4/5/G7FIX-1/G7FIX-2 四证续证）。

## 3. skip / marked-red 台账（逐 CMD 显式列出 ·「三绿」操作定义行使面）

**「三绿」操作定义（预注册口径兑现）**：**绿 = EXIT 0 且该 run 的 skip/marked-red 面显式列出**（G7Y 全量 14P/0F/10S 先例口径——skip 计数+名单在卷·marked-red 披露行在卷·非静默绿）。三绿 = 三 CMD 同时满足该定义；**本刀 CMD1/CMD3 EXIT≠0 → 三绿不成立**（CMD2 单独满足定义如实记·不外推）。

| CMD | skip 面 | marked-red 面 |
| --- | --- | --- |
| CMD1 | capability ledger 码 ×2 显式在卷：`image_ocr_unavailable` + `voice_unavailable`（本机无 OCR/TTS/ASR 键 · 先例 g7-key-x3 同源）· 零测试级 skip（单 driver 断言面） | `[R5-MARKED-RED]` 披露行照印（pgvector-legacy fixture ≠ stack truth · local green ≠ RAG migrated） |
| CMD2 | **10 skipped 显式在卷**（wrapper log 逐行）：`online-public.spec` ×4（chromium+mobile 各 2：public landing/protected route——本地无 public ingress 环境）+ `voice-duplex.spec` ×6（chromium+mobile 各 3 :166/:205/:237——本机无 TTS/ASR 键 · 先例 g7-key-x3「voice skipped（no TTS/ASR keys）」同源）· **14 passed / 0 failed** | `[R5-MARKED-RED]` 披露行照印 |
| CMD3 | **步 11-27 not_run 17 步显式在卷**（fail-fast 于步 10）：HTTP turn idempotency / long-context pressure / context window boundary / voice 单轨 / adaptive graph latency / scoring integrity / scoring golden fixture / retrieval algorithms+adversarial / RAG adversarial fixture / crag / agent-skills（11 步）+ 下方 marked-red 6 步 | 套件脚本 in-file 标记 **LEGACY/R5-MARKED-RED 步 6 枚举**（EXEC 指令预注册「五步」·实数 6·如实照抄不机械归一）：步 14 memory isolation / 步 19 vectorstore HNSW / 步 20 RAG immutable generation / 步 21 RAG corpus version / 步 22 qbank control-role / 步 23 RAG+qbank cache——**全部 not_run 未达**（R5 披露保持原样·无退出码豁免亦无行使面） |

## 4. 三向判读（预注册 · 如实 · 禁洗绿）

- **臂 1（三绿 ⇒ 收官）**：**未命中**（CMD1/3 红）。
- **臂 2（CMD1 绿 + CMD2/3 红 ⇒ 红因分层）**：**未命中**——且 **EXEC 指令席2 校准的「现实结局=分支 2（CMD1 绿+CMD2/3 红于构建相位）」三面均未兑现，逐面如实登记**：① CMD1 实为**红**（非绿）；② CMD2 实为**绿**且 web build 现场构建**绿**（`base≡red retained` 假设本树未兑现——GODFN-1b era 的 web build 红 + tokstream 3acc6fb5 因果链推演不适用于本 HEAD 实跑）；③ CMD3 实红但**非构建相位**——步 1 web build EXIT=0（25969ms），红于**步 10 测试相位**（`neg:all` consume 族 7 FAIL）。校准偏离本身按预注册修正条款如实入账（校准=预期管理·不覆盖原值记账）。
- **臂 3（CMD1 红 ⇒ G7FIX-2 绿不可复现 ⇒ 如实登记·再探）**：**命中**。细化：G7FIX-2 单 run 绿的**单 run 限定语兑现风险已兑现**——同树同 HEAD 下 CMD1 独跑红；但 CMD3 步 3 同 driver 同窗口**绿**（75 断言·M7）⇒ **缺陷=间歇性（intermittent）非回归**（零产品码零脚本改·`git status` 亲证 tracked 零 diff·sourceDigests 与 G7FIX-2 同值）。红点面：CMD1 独跑 ledger 4 行末位 `interview_unavailable`(worker) + NDJSON consent 后即寂（app_start 未成）——**域读数增量归协调方登记处置**（`interview_unavailable` 形状 = G7Y §2 记「未复现」的 7A-DOWNGRADE 域形状 · 本刀 1 次再现 · 立行/增记裁权归协调方·EXEC 不自裁归域）。
- **红因分层（按 EXEC 校准细分「性能套件面」两靶）**：CMD3 红 ∈ 性能套件面 → 细分：**构建相位靶=本刀绿**（步 1 EXIT=0 · retained 红假设未兑现）；**R5-legacy 靶=not_run 零行使**（步 14/19-23 未达·无豁免亦无读数）；**实际红靶=测试相位步 10 `neg:all` consume 族**（额度 402 ×2 / 越权 404 / 并发超卖 ×2 / 幂等双击 ×2——157 PASS 对照下 isolated 消费负路径族七断言红）。
- **trio 总判定**：**1/3 绿（CMD2）· 非三绿候选 · `g7SuiteGreen` 不翻**（如实登记 · SSOT 刀无从谈起 · 禁洗红为 flake/env 偶发——CMD1 红的「间歇性」判定限于「同树可绿可红」的复现事实面，**根因归因与定谳归协调方/另刀**）。
- **升级协调方（域读数增量 · 立行/增记处置权归协调方）**：① CMD1 独跑红（`class=api` · interview_unavailable 形状 · 44797ms）——G7 线域新复现读数；② CMD3 步 10 `neg:all` consume 族 7 FAIL——**新红面首录**（G7Y era CMD3 红于 HTTP 步·本 era HTTP 步绿而 consume 族红；历史红零冲销 retained）；③ CMD2 全量 14P/0F/10S 绿（G7Y addendum 基线同形复证 ×1）。

## 5. 预算与卫生

- est 逐 CMD（est-not-counter）：CMD1 实测 10 ≤ 25 ✓ · CMD2 实测 21 ≤ 30 ✓ · CMD3 sidecar 可见面 41（步 3-4 两容器）≤ 64 ✓（**步 5-9 容器未覆盖·未测 ≠ 0 注记** · 覆盖面局限源于 v3 停针先收口·仪器面如实）。
- **链累计记账**：前账 0+0+14+21=**35**（G7FIX-2 收据口径）+ 本刀实测 10+21+41=**72** ⇒ **107 ≤ 硬帽 200** ✓（est 预注册上界 ~154<200 同满足 · 两口径并在卷）。
- **actualSpendCny=null**（无计价数据源 · Ban invented spend）。
- Key 卫生：只经进程环境 loader · name-only 探针 `MODEL_API_KEY=present(name-only,via-loader)`（值零打印零入库零入 log）· **`.env*` ABSENT** 双向记录。
- Ban 复核：零 retry-to-green（attempts 1,1,1）· 零第二次 run 通道 · 零调序 · 零产品码/脚本/helpers/wrapper/解析器/守卫触碰（tracked 树零 diff 亲证 · 本 commit 仅收据+harness 注记）· 零 force-push · sidecar-v3.mjs 原样复用（correlation 锚 `^0151` 未机械改 0152——本刀零迁移亲证：152 迁移/`0151_pgp_sym_encrypt_grant`）。

## 6. 证据附件（本目录）

- `00-exec-receipt.md`（本文）
- CMD1：`cmd1-wrapper.log`（19 行原样）· `cmd1-isolated-receipt.json`（runner receipt 原样）· `cmd1-sidecar-stdout.log` · `cmd1-sidecar-ticks.jsonl`（40 行）· `cmd1-sidecar-final.json`（pollCount=37·correlationMatch=true）· `cmd1-ndjson-capture.ndjson`（1 行红形）· `cmd1-window.txt`（UTC 窗+EXIT 原值）
- CMD2：`cmd2-wrapper.log`（55 行全量·24 tests 逐行）· `cmd2-sidecar-stdout.log` · `cmd2-sidecar-ticks.jsonl`（227 行）· `cmd2-sidecar-final.json`（pollCount=224·correlationMatch=true）· `cmd2-window.txt`
- CMD3：`cmd3-wrapper.log`（1022 行全量套件）· `cmd3-perf-suite-receipt.json`（套件 receipt 原样·gitHead=692e8286）· `cmd3-step3-http-receipt.json`（HTTP 步 75 断言 receipt 原样）· `cmd3-step3-ndjson-capture.ndjson`（9 行 = 93948 红形 + 3424 绿形双 bootId）· `cmd3-sidecar-stdout.log` · `cmd3-sidecar-ticks.jsonl` · `cmd3-sidecar-final.json`（pollCount=252·3 容器重绑·correlationMatch=true）· `cmd3-window.txt`
- sidecar 脚本原件（零改）：`../g7fix2-postm7/sidecar-v3.mjs`（provenance 指认·本目录零副本零改）

## 7. Non-claims（逐条 · 本收据不宣称）

本收据 **≠ 三绿 ≠ `g7SuiteGreen=true` ≠ 任一 OPEN 行关闭 ≠ 修复 ≠ 根因定谳**（CMD1 间歇性=复现事实面记录·归因归协调方/另刀）≠ consume 族 7 FAIL 定位定谳（红面首录·处置归协调方）≠ web build 恒绿（本刀两 run 绿 + GODFN-1b era 红·历史红零冲销 retained）≠ R5 任何行使（6 marked-red 步 not_run）≠ covered（coveredCount=8 unchanged）· not HA · not `releaseEvidence=true`（receipts 自证 release_evidence=false）· CMD2 绿 ≠ 套件绿 ≠ UI 全域绿（单 run 单窗口）· **Pins 十值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **g7SuiteGreen=false** · **actualSpendCny=null** · alone ≠ dual（post-prove 双审归协调方派）· 禁洗红为 flake/env 偶发 · EXEC 不自批收官。
