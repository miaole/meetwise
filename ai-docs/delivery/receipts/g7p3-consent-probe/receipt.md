# G7P-3 consent 端点定靶刀 — EXEC 收据（恰 2 run）

**EXEC 席**：mw-core（git `-c user.name=mw-core -c user.email=mw-core@meetwise.local`） · **蓝本**：REQUEST rev2 @`d0549c20`（`ai-docs/delivery/harness/g7p3-consent-probe.md`·唯一蓝本） · **环境复刻蓝本**：G7P-1 `scripts/e2e-boot-probe.mjs` **blob `d6cdce7f`**（commit `7b8eb37c`·钉此收据=「复刻」证） · **分支**：`line/g7-consent-probe`（base=主线 `94650e43`） · **执行时点**：2026-10-08 · **状态**：`executed:awaiting_post_prove_dual`（Ban self-approve：EXEC 席不裁闭环·判读结论附协调方）。

## 0. 探针脚本自证

- 脚本：`scripts/e2e-consent-probe.mjs`（新增·零产品码：apps/packages src 零改·零 wrapper 改：`run-e2e.mjs`/`run-e2e-isolated.mjs` 零改·helpers 零改只读复用——`auth.ts:35-49` signupOrLogin 形态与 `resume.ts:12-19` consent body 形态均探针内自实现）
- sha256（磁盘·执行前）：`4b7db56607c8774746751e7940af11dbd87aec4b4e66a7a249f1e33d850ae7ba`
- sha256（脚本运行时自证行 `PROBE_SCRIPT_SHA256`·run-A 与 run-B 各打一次）：`4b7db56607c8774746751e7940af11dbd87aec4b4e66a7a249f1e33d850ae7ba` —— **磁盘=自证=收据三方一致**
- `node --check scripts/e2e-consent-probe.mjs` = 过
- 接线：`package.json` 单 script `"e2e:consent-probe": "node scripts/e2e-consent-probe.mjs"`

## 1. 预注册执行形状

- 恰 **2 run**·零重跑（禁重跑至绿同律·实际未发生任何红·无重跑）：
  - **run-A 冷**（`PROBE_META label=A`·pid 87871·ts 2026-10-08T13:17:36Z·容器新建 `meetwise-g7p3-consent-87871-1791465456088`·pg_port 52215·api_port 27871·worker_metrics_port 27872）
  - **run-B 热**（`PROBE_META label=B`·pid 88135·ts 2026-10-08T13:18:02Z·紧随 run-A 结束后 ~5s·容器新建 `meetwise-g7p3-consent-88135-1791465482549`·pg_port 52383·api_port 28135·worker_metrics_port 28136）
- 「冷」的诚实边界：pgvector/pgvector:pg16 镜像本机已缓存（非首次拉取·与 G7P-1 同边界）；冷=全新容器+全新 initdb+全新 **152** 迁移（主线 0150/0151 后·applied=152 skipped=0）。run-B=同 daemon/镜像/页缓存热态下的全新容器。
- **MODEL_API_KEY 红面复刻（rev2 §3）**：两 run 均经进程 env 注入 MODEL_API_KEY（源=主 checkout `.env`·仅值经 shell 变量传递·不落盘·不回显·不进任何收据/git）——`PROBE_META model_api_key=set model_api_key_face=name_only dot_env_present=false`。子进程 env 链=loader 同式：inheritedEnv 透传（剥离清单不含 MODEL_API_KEY）→buildChildEnv（worktree 无 .env·不覆盖）→`applyLiveE2ECapabilityEnv`（key set+profile unset→pin `dashscope-cn-beijing`·与红环境 loader 行为一致）。G7P-1↔红环境唯一实测登记差（key unset vs set）自此受控。
- EXIT 码语义（rev2 §2）：EXIT=首个红段号（1-5·fail/timeout 均计红·skipped 不计红）；EXIT=0=无红段；EXIT=9=未捕获崩溃专属（含 120s 无进展 watchdog 触发=崩溃类·未触发）。
- **consent 红≠早退（rev2 覆写）**：段 3 红续行·段 4 无条件照跑·段 5 条件照跑（4xx/5xx/throw 时；timeout 不复打·预算已尽）——本轮段 3 两臂均 200·段 5 两臂均 `status=skipped`（`detail=condition_not_met:segment3_http=200`·probe-local 扩充值·不计红·预注册于脚本头注）。
- 段 1/2 红沿 G7P-1 早退语义（非 consent 红·不在覆写范围·脚本头注预注册）；本轮未触发。

## 2. run-A（冷）EXIT 原值 + 全部 PROBE_SEGMENT 行（逐字）

**EXIT（原值）= 0**。原始日志全量：`run-a.log`（本目录）。

```
PROBE_SCRIPT_SHA256 path=scripts/e2e-consent-probe.mjs sha256=4b7db56607c8774746751e7940af11dbd87aec4b4e66a7a249f1e33d850ae7ba
PROBE_META label=A pid=87871 ts=2026-10-08T13:17:36.089Z container=meetwise-g7p3-consent-87871-1791465456088 image=pgvector/pgvector:pg16 api_port=27871 worker_metrics_port=27872 node=v22.22.3 model_api_key=set model_api_key_face=name_only dot_env_present=false g7_freetier_reprove=unset fetch_budget_ms=30000 watchdog_boundary_ms=120000
E2E isolated PostgreSQL: meetwise-g7p3-consent-87871-1791465456088 on 127.0.0.1:52215
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
migrations: applied=152 skipped=0 rag_control_manifest=not_requested qbank_control_manifest=not_requested runtime_login=not_requested qbank_control_login=not_requested privacy_worker_login=not_requested
E2E_POSTGRES_READY label=post-migrate consecutive=3 attempt=3
E2E_POSTGRES_READY label=pre-probe consecutive=3 attempt=3
PROBE_SEGMENT segment=probe_env_1 status=ok elapsed_ms=15255 ts=2026-10-08T13:17:51.345Z detail=pg_port=52215,ready_attempt=4,migrate_attempts=1,post_migrate_attempt=3,pre_probe_attempt=3,api_pid=88087,worker_pid=88093,mode=back-to-back
PROBE_CONSENT op=auth_signup status=200 body="{"token":"eyJ1aWQiOi…（JWT·全文见 run-a.log）","userId":"e9104360-1248-4cd4-ad23-ca5d982adf26","role":"candidate"}" elapsed_ms=63 ts=2026-10-08T13:17:51.409Z
PROBE_SEGMENT segment=probe_signup_2 status=ok elapsed_ms=64 ts=2026-10-08T13:17:51.409Z detail=via=signup,http=200,token_present=true,elapsed_ms=63
PROBE_CONSENT op=consent_post status=200 body="{"recorded":true,"policyVersion":"v1"}" elapsed_ms=6 ts=2026-10-08T13:17:51.415Z
PROBE_SEGMENT segment=probe_consent_post_3 status=ok elapsed_ms=6 ts=2026-10-08T13:17:51.415Z detail=http=200,elapsed_ms=6
PROBE_CONSENT op=consent_status_get status=200 body="{"consented":true,"purpose":"resume_processing","policyVersion":"v1"}" elapsed_ms=3 ts=2026-10-08T13:17:51.418Z
PROBE_SEGMENT segment=probe_consent_status_4 status=ok elapsed_ms=3 ts=2026-10-08T13:17:51.418Z detail=http=200,elapsed_ms=3
PROBE_SEGMENT segment=probe_repost_5 status=skipped elapsed_ms=0 ts=2026-10-08T13:17:51.418Z detail=condition_not_met:segment3_http=200
PROBE_SUMMARY exit=0 total_ms=15329 segments_completed=5 segment_parts=probe_env_1:ok:15255ms,probe_signup_2:ok:64ms,probe_consent_post_3:ok:6ms,probe_consent_status_4:ok:3ms,probe_repost_5:skipped:0ms
```

## 3. run-B（热）EXIT 原值 + 全部 PROBE_SEGMENT 行（逐字）

**EXIT（原值）= 0**。原始日志全量：`run-b.log`（本目录）。

```
PROBE_SCRIPT_SHA256 path=scripts/e2e-consent-probe.mjs sha256=4b7db56607c8774746751e7940af11dbd87aec4b4e66a7a249f1e33d850ae7ba
PROBE_META label=B pid=88135 ts=2026-10-08T13:18:02.550Z container=meetwise-g7p3-consent-88135-1791465482549 image=pgvector/pgvector:pg16 api_port=28135 worker_metrics_port=28136 node=v22.22.3 model_api_key=set model_api_key_face=name_only dot_env_present=false g7_freetier_reprove=unset fetch_budget_ms=30000 watchdog_boundary_ms=120000
E2E isolated PostgreSQL: meetwise-g7p3-consent-88135-1791465482549 on 127.0.0.1:52383
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
migrations: applied=152 skipped=0 rag_control_manifest=not_requested qbank_control_manifest=not_requested runtime_login=not_requested qbank_control_login=not_requested privacy_worker_login=not_requested
E2E_POSTGRES_READY label=post-migrate consecutive=3 attempt=3
E2E_POSTGRES_READY label=pre-probe consecutive=3 attempt=3
PROBE_SEGMENT segment=probe_env_1 status=ok elapsed_ms=11389 ts=2026-10-08T13:18:13.940Z detail=pg_port=52383,ready_attempt=4,migrate_attempts=1,post_migrate_attempt=3,pre_probe_attempt=3,api_pid=88346,worker_pid=88352,mode=back-to-back
PROBE_CONSENT op=auth_signup status=200 body="{"token":"eyJ1aWQiOm…（JWT·全文见 run-b.log）","userId":"f0d1f525-ef81-4299-a113-7c82e99da31c","role":"candidate"}" elapsed_ms=80 ts=2026-10-08T13:18:14.020Z
PROBE_SEGMENT segment=probe_signup_2 status=ok elapsed_ms=81 ts=2026-10-08T13:18:14.021Z detail=via=signup,http=200,token_present=true,elapsed_ms=80
PROBE_CONSENT op=consent_post status=200 body="{"recorded":true,"policyVersion":"v1"}" elapsed_ms=11 ts=2026-10-08T13:18:14.032Z
PROBE_SEGMENT segment=probe_consent_post_3 status=ok elapsed_ms=11 ts=2026-10-08T13:18:14.032Z detail=http=200,elapsed_ms=11
PROBE_CONSENT op=consent_status_get status=200 body="{"consented":true,"purpose":"resume_processing","policyVersion":"v1"}" elapsed_ms=3 ts=2026-10-08T13:18:14.035Z
PROBE_SEGMENT segment=probe_consent_status_4 status=ok elapsed_ms=3 ts=2026-10-08T13:18:14.035Z detail=http=200,elapsed_ms=3
PROBE_SEGMENT segment=probe_repost_5 status=skipped elapsed_ms=0 ts=2026-10-08T13:18:14.035Z detail=condition_not_met:segment3_http=200
PROBE_SUMMARY exit=0 total_ms=11486 segments_completed=5 segment_parts=probe_env_1:ok:11389ms,probe_signup_2:ok:81ms,probe_consent_post_3:ok:11ms,probe_consent_status_4:ok:3ms,probe_repost_5:skipped:0ms
```

## 4. consent 三元组（精确 status+body+elapsed）与分段耗时

| 面 | run-A（冷） | run-B（热） |
|---|---|---|
| POST /privacy/consent（body={purpose:'resume_processing'}·Bearer） | **200** · `{"recorded":true,"policyVersion":"v1"}` · **6ms** | **200** · `{"recorded":true,"policyVersion":"v1"}` · **11ms** |
| GET /privacy/consent（对照·无条件） | 200 · `{"consented":true,"purpose":"resume_processing","policyVersion":"v1"}` · 3ms | 200 · `{"consented":true,"purpose":"resume_processing","policyVersion":"v1"}` · 3ms |
| signup（auth_signup·via=signup） | 200 · token present · 63ms | 200 · token present · 80ms |
| 复打（段 5 条件） | skipped（segment3_http=200） | skipped（segment3_http=200） |

| 段 | run-A（冷） | run-B（热） | Δ（B−A） |
|---|---:|---:|---:|
| probe_env_1（容器+迁移 152+spawn+livez+DB 门+worker 里程碑+readyz·蓝本 7 段收拢） | 15255 | 11389 | −3866 |
| probe_signup_2 | 64 | 81 | +17 |
| probe_consent_post_3 | 6 | 11 | +5 |
| probe_consent_status_4 | 3 | 3 | 0 |
| probe_repost_5 | skipped(0) | skipped(0) | 0 |
| **合计（PROBE_SUMMARY total_ms）** | **15329** | **11486** | **−3843** |

冷热差几乎全落环境段（−3866ms·热页缓存）；consent 面两臂 6/11ms——与 G7P-2 登记的红面时序（T3 后 13ms fail-closed）同量级，**红绿分野不在时数量级而在 code 本身**（本探针两臂拿到的都是确定性 200）。

## 5. 预注册五向判读（rev2 §3·机械规则如实套用·禁洗绿·禁重跑至绿）

机械规则核（最末 PROBE_SUMMARY 行 × EXIT 交叉）：run-A 末行 `exit=0`+5 段无红 ✓；run-B 同 ✓；skipped 两臂仅段 5 且条件未中 ✓；EXIT=9/watchdog 未触发 ✓；PROBE_CRASH 未出现 ✓。

| 向 | 命中条件 | 实测 | 结论 |
|---|---|---|---|
| ① 5xx | 段 3 呈 5xx | 未命中（两臂 200） | 服务端 DB/RLS/迁移面（0150/0151 后主线环境）**在本探针环境未见红** |
| ② 4xx | 段 3 呈 4xx | 未命中（两臂 200） | guard/body/purpose 契约面未见红 |
| ③ fetch-throw/传输面（向 5·rev2 补） | 段 3 status=fail detail=segment_throw:*（ECONNRESET/UND_ERR_* 等） | 未命中（两臂零 throw·零网络 err） | keep-alive 复用/连接层竞态假说**在探针环境未复现**（探针 undici 池在 consent 前已有 livez/login 门/signup 多请求复用史——池复用本身未触发红） |
| ④ **200 双 run（上下文差）** | 两臂均 200 | **命中** | **主判：探针环境不可复现 ⇒ 状态依赖/上下文差假说增强 ⇒ 下一刀=full.e2e 内联 code 截获（driver 侧打印 consent response）** |
| ⑤ 间歇 | 一红一绿 | 未命中（两臂同绿） | 无冷热分裂形态 |

先例序应用：无红 run ⇒ 无段 EXIT 主判候选；向④为唯一命中向。**结论（附协调方·不自批）**：在 G7P-1 等价复刻环境上（含 **MODEL_API_KEY set 红面**——G7P-1↔红环境唯一实测登记差已受控），POST /privacy/consent 以 200/`{"recorded":true,"policyVersion":"v1"}`/6-11ms 确定性通过，GET 对照同步 200——**红因不在 consent 端点自身的 DB/契约/连接层，而在 full.e2e 特有上下文**。剩余上下文差（如实记·下一刀候选切分轴）：(a) email 生成策略——探针每 run 全新 `g7p3-consent-*` 邮箱=纯 signup 面 vs full.e2e `e2e_<tag>@x.com` 标签邮箱（重跑落 login 面）；(b) tsx 装载段与全旅程断言序（G7P-2 已证 T1/T2/T3 达·死亡在 T3 后 13ms 第 2 断言=本端点面）；(c) undici 池使用史细节（full.e2e 在 consent 前的同池请求序列与探针不同）；(d) 主 checkout 环境差（.env 派生密钥 AUTH_SECRET/RESUME_ENC_KEY 等在红环境为 .env 值·本探针为 e2e 默认值——key 面已复刻·密钥面未复制·Ban 不落盘）；(e) api/worker 冷热与进程内状态。预注册指向：**下一刀=full.e2e 内联截获**（在真实红链上拿同一三元组）。

## 6. 盲区与边界（如实记·必注项）

1. **本收据两 log 含 signup 应答 token 原文**（探针三元组打印 body 未脱敏）：该 token 为 e2e 默认 `AUTH_SECRET`（e2e-dev-secret-key）签发的临时账户 JWT·账户仅存在于已销毁的隔离容器（两 run 容器均 finally 自清·`docker ps -a` 余量 0 已核）——非生产密钥材料·非 MODEL_API_KEY 面；已如实披露不追改逐字 log。
2. **进程内 watchdog 残留盲区**：120s 无进展界为进程内可重置实现（喂狗点=段边界/环境子步/PG 每试/migrate 每输出块/每次 fetch 完成）——事件环真冻结（同步死循环类）无进程内捕获路径·该形态需外杀（wrapper 改动被 Ban·沿 G7P-2 外部 watchdog 形态才覆盖）。本轮未触发。
3. **密钥面未复制**（仅 key 面）：MODEL_API_KEY 已 set 复刻（loader 同式 profile pin 生效）；主 checkout `.env` 其余派生密钥未复制（Ban：Key 只经进程 env·不落盘）——context-diff (d) 如实记。
4. **n=1/臂**：每臂单 run·无统计力；两臂同绿只支持「未观察到分裂/红形态」，不构成「consent 面无间歇红」的坐实。
5. 段 1 环境子面（a-g）收拢为单段（rev2 §2 五段钦定）：环境红时 EXIT=1·子面以 detail `env_face:*` 定位——本轮未触发·子面分辨率未受检。
6. 30s fetch 预算未受检（两臂最快 3ms/最慢 80ms·远低于界）；timeout 分类路径与段 5 复打路径本轮零执行——分支逻辑在但未被实跑覆盖（如实记）。
7. 收尾核：两 run 后 `meetwise-g7p3-consent-*` 容器余量 0（探针 finally 自清·已核）；无关容器未触碰。

## 7. est / Key / 模型面

- **est：0 live 模型调用**。两 run 全部请求面=livez/login(401 门+signup 面)/consent POST+GET/readyz/metrics——signup/login/consent 链零模型面（已实证）；未触任何 report/OCR/ASR/embedding 路径。
- **Key 面**：MODEL_API_KEY 经进程 env 注入两 run（name-only 登记 `model_api_key=set`）——值零回显·零落盘·零入 git；`DASHSCOPE_API_KEY`/vision 键 unset；G7_FREETIER_REPROVE unset ⇒ 无 ledger 面 ⇒ **actualSpendCny=null**。
- 探针输出无任何 env 值回显（api/worker 子进程输出按 run-e2e.mjs 同律 withheld·仅块数/字节数；本轮无红故零 withheld 行）。

## 8. Pins（十值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 9. Non-claims

本刀 ≠ G7 修复 ≠ consent 面根因定谳（200 双 run=**排除性**证据：红因不在本探针可见的 consent 端点 DB/契约/连接层·受 §6.3/§6.4 边界约束）≠ full.e2e 上下文差逐一排除（(a)-(e) 仅登记未切分）≠ trio 面 ≠ g7SuiteGreen 翻转 · alone≠dual · 本收据不构成 post-prove dual 的任何一臂。

## 10. 工件清单

- `scripts/e2e-consent-probe.mjs`（新增·sha256 见 §0）
- `package.json`（+1 行 script 接线 `e2e:consent-probe`）
- `ai-docs/delivery/harness/g7p3-consent-probe.md`（状态推进 `draft_rev2:awaiting_pre_exec_dual` → `executed:awaiting_post_prove_dual` + §5「四向」→「五向」一词顺改）
- `ai-docs/delivery/receipts/g7p3-consent-probe/receipt.md`（本收据）+ `run-a.log` + `run-b.log`（逐字原log）
