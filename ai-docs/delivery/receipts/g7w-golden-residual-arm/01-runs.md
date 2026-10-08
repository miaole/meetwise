# RUNS — G7W-G · 全 suite 上下文复现臂 EXEC · 四 run 逐 run 七字段台账（S1→S2→S3→C1 一次成型 · 零重试）

**EXEC HEAD**: `6fcd4c4d`（base `cb89c23d` = `origin/feat/mysql-schema-skeleton` fetch 后实测 tip · REQUEST `0dde0351` rebase 重放为 `6fcd4c4d`）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-golden` · branch `line/g7w-golden-residual-arm`
**四来源交叉口径（UI 模式适配如实声明）**：UI 模式无 `.tmp/e2e-receipts/*.json` machine receipt（该机制属 `e2e:prove` HTTP 面）——四源改为：(1) CMD EXIT 直录（G7W OB-1 教训 · 重定向外无管道）· (2) wrapper `E2E_FAILURE`/`ELIFECYCLE` 行 · (3) Playwright tally（list reporter）· (4) run log 全文（`.tmp/g7wg/{s1,s2,s3,c1}.log` · 不入 git）。

## 环境探针（逐 run 同一面 · name-only）

`MODEL_API_KEY=SET`（loader source `~/.meetwise-secrets/load-model-api-key.sh`）· `MODEL_ENDPOINT_PROFILE` unset · `MODEL_NAME` unset（OB-3 同口径如实承卷）· `DASHSCOPE_TTS_API_KEY` unset · `DASHSCOPE_ASR_API_KEY` unset（**voice-duplex 活门=关 · 3×2 skip**）· `ONLINE_BASE_URL` unset（online-public 2×2 skip）· `E2E_UI_GREP`/`E2E_UI_PROJECT` 主臂 unset / 对照臂 C1=`'golden path'` · `.env*` ABSENT（run 前后双测 · zsh no matches 亲证）· Docker 29.1.3 · migrations applied=142（四 run 全同）。

## 上下文并行度（判别读数 · 零改动只记录 @blob `321b80e0` 前后全等）

`workers:1`（`:17`）· `fullyParallel:false`（`:13`）· projects=chromium+mobile 双端**串行**（`:27-31`）· `retries:0`（`:19`）· expect 10s（`:12`）· test timeout 150s（`:11`）· trace retain-on-failure（`:24` · 本 EXEC 零 trace 留存=全 arm golden 零失败的预期无留，非仪器缺口，沿 G7W POST 排除先例）· suite 收集=24 tests（grep-invert 排除 README screenshots 命名 · **demo screenshots 3 tests ×2 project 实跑在卷**）。

## 七字段逐 run 台账

| 字段 | S1 | S2 | S3 | C1（对照） |
|---|---|---|---|---|
| CMD 原文 | `pnpm run e2e:ui:isolated`（无 GREP） | 同 S1 | 同 S1 | `E2E_UI_GREP='golden path' pnpm run e2e:ui:isolated` |
| EXIT 原值 | **0** | **0** | **1** | **0** |
| UTC 窗 | 03:53:27Z→03:58:44Z（317s · **含冷 build**） | 04:01:13Z→04:05:23Z（250s · 热 build） | 04:05:40Z→04:11:41Z（361s · 热 build · 含失败面 120s×2 等待窗） | 04:12:44Z→04:13:06Z（22s · 热 build） |
| 实跑 code SHA | `6fcd4c4d`（工作树） | 同 | 同 | 同 |
| PG 容器（isolation 行） | `meetwise-e2e-63158-1791431608367` :58913 | `meetwise-e2e-65213-1791432073413` :60741 | `meetwise-e2e-66686-1791432341416` | `meetwise-e2e-69225-1791432764816` :64084 |
| tally（P/F/S） | 14P / 0F / 10S（4.4m） | 14P / 0F / 10S（3.9m） | **13P / 1F / 10S**（5.8m） | 2P / 0F / 0S（8.3s） |
| wrapper 分类行 | 无（绿） | 无（绿） | **`E2E_FAILURE class=frontend code=client_exited`**（×2 行）+ `ISOLATED_POSTGRES_OUTPUT_WITHHELD` 信封 | 无（绿） |
| est tally（frozen 表 · est-not-counter） | ≤20 | ≤20 | ≤20 | ≤4 |

## golden 判别读数（分段时长 · 基线带 3.0–4.4s vs 超时窗 20s）

| run | golden `:10` chromium | golden `:10` mobile | golden `:61` chromium | golden `:61` mobile | 判读 |
|---|---|---|---|---|---|
| S1 | **4.1s** | **3.1s** | 192ms | 188ms | 绿 · 双端落基线带 |
| S2 | **4.4s** | **4.0s** | 187ms | 197ms | 绿 · 双端落基线带（4.4s=带沿 · ≪20s） |
| S3 | **4.3s** | **3.4s** | 162ms | 201ms | 绿 · 双端落基线带 |
| C1 | **4.4s** | **2.9s** | —（grep 不含 `:61`） | — | 绿 · 预期绿对照锚成立 |
| **主臂小计** | **12/12 golden 执行全绿（3 run × 4 执行）· 分段 2.9–4.4s 全落基线带 · 零超时窗触碰 · 零表外步骤** | | | | |

**S1 冷 build 如实**：fresh worktree 无 `.next/BUILD_ID` → runner 原生先 build（log `:21` 亲读 · G7W OB-4 同族最高红概率条件）；S2/S3/C1 热 build（BUILD_ID 在）。

## S1 逐 spec live 重估表（advisory 硬条款① · FROZEN before S2 · 冻结件 `.tmp/g7wg/s1-reestimate-frozen.md`）

| spec | 执行数/全量 run（S1 实测） | live 面 basis | per-run live est（extreme-bound · est-not-counter） |
|---|---|---|---|
| golden `:10` | 2 | 简历摄取 1–2/执行（G7W EXEC 口径） | ≤4 |
| golden `:61` | 2 | 零 live | 0 |
| recruiting-bound `:142` C→B 旅程 | 2 | 绑岗→面试→完成→finalize（G7U CMD1 全旅程 DB 账本 live=7 · UI 子集） | ≤10 |
| stream-window `:9` SSE replay | 2 | 回放面（保守 ≤1/执行） | ≤2 |
| uc018-abandon `:68` | 2 | 面试+放弃面（保守 ≤2/执行） | ≤4 |
| screenshots（demo · 实跑） | 4 | 零 live | 0 |
| voice-duplex | 0（skip · DASHSCOPE 双 Key unset） | — | 0 |
| online-public | 0（skip · ONLINE_BASE_URL unset） | — | 0 |
| **合计/全量 run** | 14P+10S | | **≤20** |

**总账**：主臂 ≤60 + C1 ≤4 = **≤64 ≪ 硬帽 200**。**偏差登记**：REQUEST 结构估 ≤35 → frozen ≤64（偏差源=REQUEST 粒度未逐 spec 展开；S1 实测后冻结）· **止蚀线唯一=硬帽 200（重估偏差未构成中止触发器 · N=3+1 设计保全）** · 低于双审已核极端口径 125。

## S3 非 golden 红（表外值域 · 如实登记回协调方 · Ban 就地 reinterpret）

- 失败测试：`[mobile] › e2e-ui/recruiting-bound.spec.ts:142:1 › C→B: real browser binds application to a new interview, completes it, and front-end finalizes it`（**同测试同 run 内 chromium 臂 ✓ 1.6m PASS · S1/S2 双端 4 执行全 PASS**）
- 失败面（log 内联可见块 · spec `:230-:232` 亲读）：扣费臂结算后 `Promise.any([REPORT_DOWN『报告暂时无法生成』, PRACTICE_FEEDBACK].map(f => f.waitFor({visible, timeout:120_000})))` → **AggregateError: All promises were rejected**（120s 双分支均未现）· `:230` 为 G7V 第三臂文案披露断言（C-HA-V1 面 · 本 run 该断言本身 PASS 后死于 `:232` 等待）· trace/截图落 `test-results/`（未跟踪 · 不入 git）
- 四源：EXIT=1（直录）· `E2E_FAILURE class=frontend code=client_exited`（wrapper ×2 行）· tally 1F/13P/10S · log 全文（`.tmp/g7wg/s3.log`）
- **边界声明**：此红**非预注册判别面**（判读表锚=golden resume 页 consent/textarea 20s 断言）——不满足「主臂 golden 红 ≥1」判据；**不并入 G7W-G golden 判读、不冲销任何台账、不触发追加跑**；该面与 recruiting-bound 既有 OPEN 面族（G7V 第三臂文案行/结算链）的归簇与否**归协调方裁**。
- **withhold 零触碰**：wrapper `E2E_PROCESS_OUTPUT_WITHHELD process=playwright:stdout chunks=50 bytes=9269` 与 `ISOLATED_POSTGRES_OUTPUT_WITHHELD` 信封如实登记**未回读**；上文失败面引用全部来自 wrapper 回放的内联可见块。
