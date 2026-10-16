# RECEIPT — F-F 甄别 run · CMD1 `e2e:ui:isolated`（executed · 七字段全记录 · EXIT 如实）

**Lifecycle**: `executed:awaiting_post_prove_dual`（post-prove 双审由协调方另派 · alone ≠ dual · 禁 push）
**甄别目的**: 取 `interview_job.last_error`，非翻绿——预期 EXIT=1，红 EXIT ≠ 甄别失败；**甄别成功判据 = 快照捕获读数**（已达成，见 §5）。

## 1. CMD 原文

```
# worktree /Users/miaole/Desktop/golucky/meetwise-line-ff · branch line/ff-last-error @ 7ed35f0d
pnpm install --frozen-lockfile        # 前置 · EXIT=0（.tmp/ff-install.log）
node .tmp/ff-sidecar.mjs .tmp/ff-ffrun-01.log .tmp/ff-lasterror-snapshots.log   # sidecar 只读探针（harness §1.2-A · SELECT-only · .tmp/ 不入 git）
source ~/.meetwise-secrets/load-model-api-key.sh                                # Key 仅经进程环境 loader（name-only）
export MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing MODEL_NAME=qwen-plus         # G7R 协调方 EXEC 下达 F-A-1 值沿用（复现 G7R 失败面必要条件 · 非 secret 配置值）
pnpm e2e:ui:isolated > .tmp/ff-ffrun-01.log 2>/dev/null                         # 甄别 run · wrapper stdout tee · wrapper 自身 stderr 丢弃
```

## 2. EXIT 原值

**EXIT=1**（`.tmp/ff-ffrun-01.exit`；wrapper 末行 `E2E_FAILURE class=frontend code=client_exited` + `ELIFECYCLE Command failed with exit code 1`）。三红 retained：**4 failed**（`recruiting-bound.spec.ts:56` ×2 chromium/mobile · 34.7s/34.5s + `uc018-abandon.spec.ts:68` ×2 · 1.8s/1.8s）· 10 passed · 10 skipped。与 G7R CMD2 逐面同形（G7R 34.8/34.5s + 1.8/1.9s）——复现面成立。

## 3. 起止时间戳

start epoch `1791395164`（2026-10-07T17:46:04Z）→ end epoch `1791395330`（2026-10-07T17:48:50Z）· **dur=166s**（build+migrate+2.0m 测试窗口）。

## 4. 实跑 code SHA + worktree/branch

- 实跑 code SHA：**`7ed35f0d05f7d31fcfca24e873664311160d157c`**（= origin tip `7ed35f0d` · RE-PRE 双 PASS commit；worktree 在跑时除 `apps/web/test-results/` 未跟踪产物外零 diff，HEAD 即实跑树）。receipt commit ≠ 实跑 SHA（本收据 commit 由协调方 post-prove 后另核）。
- worktree `/Users/miaole/Desktop/golucky/meetwise-line-ff` · branch `line/ff-last-error`（rebase 后 = origin tip）。

## 5. 环境探针 + sidecar 窗口健康（C-HA-FFR-1）

- docker `29.1.3` · pnpm `10.18.0` · node `v22.22.3` · playwright chromium-1217/1228 在位。
- `.env` / `.env.local` / `.env.production` **三文件 ABSENT**（磁盘亲探）；`MODEL_API_KEY` name-only **set**（经 loader，值零读取零入树）；`MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` · `MODEL_NAME=qwen-plus`（配置名值，非 secret，可录）。
- **sidecar 窗口健康**：port_found @ `2026-10-07T17:46:06.709Z`（container `meetwise-e2e-8418-1791395164551` · port `51211`）→ connected → **快照 536 行 = 525 轮四查询全 ok + 8 轮早期仪器错误 + 3 行 phase 标记**。
- **8 轮仪器错误如实登记（C-HA-FF-3）**：@17:46:06.7-17:46:08.8Z（migrate 前空库窗口）四查询报 `relation "interview_job"/"ai_model_invocation"/"ai_invocation_trace" does not exist`——系 **仪器时序错误非空读**，未计入判读、未触发备选 attempt；migrate 完成后 525 轮连续全 ok。
- **最后一份全 ok 快照 @ `17:48:50.659Z`**——wrapper finally `docker rm -f` 拆除容器**之前**捕获（wrapper end epoch 1791395330 ≈ 17:48:50Z）→ 窗口保证兑现。sidecar 停止方式=后台任务清理信号终止（无 `sidecar_stop` 行 · exit 1 如实登记；快照完整性不受影响）。全量原文留 `.tmp/ff-lasterror-snapshots.log`（不入 git）。
- machine receipt 面：ui-isolated 目标不产出 `LOCAL_E2E_RECEIPT`（`.tmp/e2e-receipts/` 无文件，runner 仅 `e2e:prove` 目标写）——**四来源交叉降为三来源**（EXIT + wrapper stdout + sidecar 快照），如实登记。

## 6. 四查询读数（最后全 ok 快照原文 · name-only）

```json
{"t":"2026-10-07T17:48:50.659Z","q":[
 {"id":1,"name":"interview_job_failed_rows","status":"ok","rowCount":2,"rows":[
   {"id":"dcf1e772-84b2-4a99-b06e-6c5c08084d1e","kind":"start","status":"failed","attempts":1,"last_error":"adaptive_role_route_missing","created_at":"2026-10-07T17:48:49.644Z"},
   {"id":"5d646198-463d-483a-b9a9-d65183d99b09","kind":"start","status":"failed","attempts":1,"last_error":"adaptive_role_route_missing","created_at":"2026-10-07T17:47:44.030Z"}]},
 {"id":2,"name":"ai_model_invocation_distribution","status":"ok","rowCount":1,"rows":[
   {"service":"job.route-classify.v1","status":"succeeded","error_code":null,"count":"2"}]},
 {"id":3,"name":"ai_invocation_trace_count","status":"ok","rowCount":1,"rows":[{"count":"2"}]},
 {"id":4,"name":"interview_status_distribution","status":"ok","rowCount":1,"rows":[{"status":"failed","count":"2"}]}]}
```

逐查询执行状态：**全 ok**（C-HA-FFR-1 兑现）。

## 7. 判读表归类 + 显式负检查

- **C-MO-P1 负检查**：536 行快照全量扫描 `qbank.embedding-build.v1`/`qbank.embedding-query.v1`/`qbank.rerank.v1`（及 embedding-build/embedding-query/rerank 子串）**全 absent** → **H0-alt-2 驳回维持，无证伪**（§1.4 证伪分支未触发）。
- **Q1 主读**：`last_error='adaptive_role_route_missing'` ×2（同值确定性 · attempts=1 · kind=start）= **判读表未预列值域**（§1.4 六域无一命中 · §5.2「未覆盖值域」合法结论）→ 码面定位（@`7ed35f0d` 亲读）：
  - throw 点 `apps/worker/src/adaptive-role-resolve.ts:57-62`——`MEETWISE_TECH_ROLE_FAIL_CLOSED` **默认 ON**（unset/blank → on）且 `roleFromRouteSnapshot`（`interview-consumer.ts:345-349` 读 `routeSnapForRetrieve?.allocations?.[0]?.leafTrackId`）与 `roleFromJobRouteMetadata` **双缺 → fail-closed throw**；
  - 传播链：`interview-consumer.ts:351-355`（role resolve，start 分支内、`startAdaptiveInterview` **之前**）→ catch-all `:370-381` → `failClaimedInterviewJob`（`:155-168`）→ `markJobFailed`（`packages/db/src/interview-jobs.ts:214-217`）→ last_error 持久化 → `terminalizeUnsettledInterview`（`:77-96`）→ `interview_unavailable{kind:start,reason:job_failed}`（`:93`）。
- **归类结论：H0-alt-5 族成立（结构性 pre-model throw），具体门 = 新子面 d「role-resolve fail-closed 门」（判读表未预列 · 本收据登记备后续判读表增补）**。互证：Q2 分布**仅** `job.route-classify.v1` succeeded ×2——**零** `interview.competency-planning.v1`/`interview.question-generation.v1` 派发行（start job 在任何 interview chat op 之前即死）；Q3 trace=2 恰为两次 classify 成功完成；**零 `provider_rejected`/`deterministic_refusal`/`unknown` 行** → 红②面 provider/准入零涉案 → 与协调方 Key 直探（F-A-1 配对 200）互证一致，H0-alt-1 出局维持、原 H0 值面出局维持。Q4 interview failed ×2 = 红② begin 后秒级 fail-closed 实证（SSE throw 签名链吻合）。
- **红①观察（如实登记 · 非定谳 · 不展开）**：recruiting-bound ×2 仍红（34.7/34.5s 同形）而 Q2 现 classify succeeded ×2——表面张力如实登记；其归因（succeeded 行归属哪两个 revision · invoke succeeded 与 route 层 validation_rejected/sticky 的区分）需 `job_route` 表数据，**超出 §1.3 四查询授权清单，未扩查**；红①面甄别 = start job 未入队面（C-MO-P2），留 route 侧另刀，回协调方。

## 8. live 调用与预算

classify succeeded ×2 = **2 次 live provider 调用**（本 run 全部 live 面）——≤200 口径内；`actualSpendCny=null`（无计价依据 · Ban invented spend）。voice/OCR/ASR/TTS honest capability skip = 0 调用。

---

*RECEIPT · F-F last_error discriminator · CMD1 e2e:ui:isolated · 2026-10-07 · executed:awaiting_post_prove_dual · EXIT=1 如实 · 甄别成功=快照捕获（4/4 ok）· last_error=adaptive_role_route_missing ×2 → H0-alt-5 族 · role-resolve fail-closed 门（判读表未预列 · 码面 adaptive-role-resolve.ts:57-62）· C-MO-P1 负检查全 absent · 8 轮 migrate 前仪器错误如实（C-HA-FF-3）· live=2/200 · actualSpendCny=null · alone ≠ dual · 禁 push · STOP*
