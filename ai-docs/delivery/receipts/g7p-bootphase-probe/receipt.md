# G7P-1 boot-phase 探针刀 — EXEC 收据（恰 2 run）

**EXEC 席**：mw-core（git `-c user.name=mw-core -c user.email=mw-core@meetwise.local`） · **蓝本**：REQUEST rev4 @`58ec2c34`（`ai-docs/delivery/harness/g7p-bootphase-probe.md`·唯一蓝本） · **分支**：`line/g7-bootphase-probe` · **执行 commit**：`7b8eb37c` · **收据时点**：2026-10-08 · **状态**：`exec:awaiting_post_prove_dual`（Ban self-approve：EXEC 席不裁闭环，判读结论附协调方）。

## 0. 探针脚本自证

- 脚本：`scripts/e2e-boot-probe.mjs`（新增·零产品码·零 wrapper 改动：`run-e2e.mjs`/`run-e2e-isolated.mjs`/`run-e2e-ui.mjs` 全零改）
- sha256（磁盘·commit 前）：`1629af6f75928496167c4ffa74401a1041ed4b532c8a730e6a42195bea50007e`
- sha256（脚本运行时自证行 `PROBE_SCRIPT_SHA256`·run-A 与 run-B 各打一次）：`1629af6f75928496167c4ffa74401a1041ed4b532c8a730e6a42195bea50007e` —— **磁盘=自证=收据三方一致**（防 wrapper 漂移）
- `node --check scripts/e2e-boot-probe.mjs` = 过
- 接线：`package.json` 单 script `"e2e:boot-probe": "node scripts/e2e-boot-probe.mjs"`

## 1. 预注册执行形状

- 恰 **2 run**·零重跑（禁重跑至绿同律·实际未发生任何红）：
  - **run-A 冷**（`PROBE_META label=A`·pid 66826·ts 2026-10-08T12:09:56Z·docker 容器新建 `meetwise-g7p-probe-66826-1791461396870`·pg_port 54963·api_port 26826·worker_metrics_port 26827）
  - **run-B 热**（`PROBE_META label=B`·pid 67106·ts 2026-10-08T12:10:15Z·紧随 run-A 结束后 ~5s·容器新建 `meetwise-g7p-probe-67106-1791461415983`·pg_port 55067·api_port 27106·worker_metrics_port 27107）
- 「冷」的诚实边界：run-A 的 pgvector/pgvector:pg16 镜像**本机已缓存**（非首次拉取）；冷=全新容器+全新 initdb+全新 144 迁移。run-B=同 daemon/镜像/页缓存热态下的全新容器。
- EXIT 码语义：EXIT=段号（1-8·fail/timeout 均计红）·EXIT=0=全段过·EXIT=9=脚本未捕获崩溃专属码（双保险：EXIT=1 且无 PROBE_SEGMENT 行亦=崩溃）。

## 2. run-A（冷）EXIT 原值 + 全部 PROBE_SEGMENT 行（逐字）

**EXIT（原值）= 0**。原始日志全量：`run-a.log`（本目录）。

```
PROBE_SCRIPT_SHA256 path=scripts/e2e-boot-probe.mjs sha256=1629af6f75928496167c4ffa74401a1041ed4b532c8a730e6a42195bea50007e
PROBE_META label=A pid=66826 ts=2026-10-08T12:09:56.871Z container=meetwise-g7p-probe-66826-1791461396870 image=pgvector/pgvector:pg16 api_port=26826 worker_metrics_port=26827 node=v22.22.3
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
PROBE_SEGMENT segment=probe_pg_1 status=ok elapsed_ms=1909 ts=2026-10-08T12:09:58.780Z detail=pg_port=54963,ready_attempt=4
migrations: applied=144 skipped=0（migrate 子进程输出·完整行见 run-a.log）
E2E_POSTGRES_READY label=post-migrate consecutive=3 attempt=3
E2E_POSTGRES_READY label=pre-prove consecutive=3 attempt=3
PROBE_SEGMENT segment=probe_migrate_2 status=ok elapsed_ms=5896 ts=2026-10-08T12:10:04.676Z detail=migrate_attempts=1,post_migrate_attempt=3,pre_prove_attempt=3
PROBE_SEGMENT segment=probe_spawn_3 status=ok elapsed_ms=504 ts=2026-10-08T12:10:05.180Z detail=api_pid=67042,worker_pid=67048,mode=back-to-back
PROBE_SEGMENT segment=probe_api_livez_4 status=ok elapsed_ms=1032 ts=2026-10-08T12:10:06.213Z detail=first_200_attempt=1
PROBE_SEGMENT segment=probe_db_gate_5 status=ok elapsed_ms=1045 ts=2026-10-08T12:10:07.258Z detail=login_401_attempt=1
PROBE_SEGMENT segment=probe_exit_check_6 status=ok elapsed_ms=3010 ts=2026-10-08T12:10:10.268Z detail=api_exit=null,worker_exit=null,worker_livez=ok,readyz_worker=ok
PROBE_SEGMENT segment=probe_api_readyz_7 status=ok elapsed_ms=1006 ts=2026-10-08T12:10:11.275Z detail=readyz_api_200_attempt=1
PROBE_SEGMENT segment=probe_first_signup_8 status=ok elapsed_ms=60 ts=2026-10-08T12:10:11.335Z detail=signup_http=200,token_present=true
PROBE_SUMMARY exit=0 total_ms=14465 segments_completed=8 segment_parts=probe_pg_1:ok:1909ms,probe_migrate_2:ok:5896ms,probe_spawn_3:ok:504ms,probe_api_livez_4:ok:1032ms,probe_db_gate_5:ok:1045ms,probe_exit_check_6:ok:3010ms,probe_api_readyz_7:ok:1006ms,probe_first_signup_8:ok:60ms
```

## 3. run-B（热）EXIT 原值 + 全部 PROBE_SEGMENT 行（逐字）

**EXIT（原值）= 0**。原始日志全量：`run-b.log`（本目录）。

```
PROBE_SCRIPT_SHA256 path=scripts/e2e-boot-probe.mjs sha256=1629af6f75928496167c4ffa74401a1041ed4b532c8a730e6a42195bea50007e
PROBE_META label=B pid=67106 ts=2026-10-08T12:10:15.984Z container=meetwise-g7p-probe-67106-1791461415983 image=pgvector/pgvector:pg16 api_port=27106 worker_metrics_port=27107 node=v22.22.3
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
PROBE_SEGMENT segment=probe_pg_1 status=ok elapsed_ms=1703 ts=2026-10-08T12:10:17.688Z detail=pg_port=55067,ready_attempt=4
migrations: applied=144 skipped=0（migrate 子进程输出·完整行见 run-b.log）
E2E_POSTGRES_READY label=post-migrate consecutive=3 attempt=3
E2E_POSTGRES_READY label=pre-prove consecutive=3 attempt=3
PROBE_SEGMENT segment=probe_migrate_2 status=ok elapsed_ms=2964 ts=2026-10-08T12:10:20.652Z detail=migrate_attempts=1,post_migrate_attempt=3,pre_prove_attempt=3
PROBE_SEGMENT segment=probe_spawn_3 status=ok elapsed_ms=502 ts=2026-10-08T12:10:21.154Z detail=api_pid=67337,worker_pid=67343,mode=back-to-back
PROBE_SEGMENT segment=probe_api_livez_4 status=ok elapsed_ms=1028 ts=2026-10-08T12:10:22.182Z detail=first_200_attempt=1
PROBE_SEGMENT segment=probe_db_gate_5 status=ok elapsed_ms=1033 ts=2026-10-08T12:10:23.216Z detail=login_401_attempt=1
PROBE_SEGMENT segment=probe_exit_check_6 status=ok elapsed_ms=3011 ts=2026-10-08T12:10:26.227Z detail=api_exit=null,worker_exit=null,worker_livez=ok,readyz_worker=ok
PROBE_SEGMENT segment=probe_api_readyz_7 status=ok elapsed_ms=1009 ts=2026-10-08T12:10:27.236Z detail=readyz_api_200_attempt=1
PROBE_SEGMENT segment=probe_first_signup_8 status=ok elapsed_ms=71 ts=2026-10-08T12:10:27.307Z detail=signup_http=200,token_present=true
PROBE_SUMMARY exit=0 total_ms=11324 segments_completed=8 segment_parts=probe_pg_1:ok:1703ms,probe_migrate_2:ok:2964ms,probe_spawn_3:ok:502ms,probe_api_livez_4:ok:1028ms,probe_db_gate_5:ok:1033ms,probe_exit_check_6:ok:3011ms,probe_api_readyz_7:ok:1009ms,probe_first_signup_8:ok:71ms
```

## 4. 分段耗时表（ms）

| 段 | run-A（冷） | run-B（热） | Δ（B−A） |
|---|---:|---:|---:|
| probe_pg_1（docker 起+consecutive=3 就绪） | 1909 | 1703 | −206 |
| probe_migrate_2（2-试试义+migrate 1 过+post-migrate/pre-prove 再探） | 5896 | 2964 | −2932 |
| probe_spawn_3（api+worker 背靠背并发 spawn+500ms settle） | 504 | 502 | −2 |
| probe_api_livez_4（/livez 40×1s·首 200@attempt1） | 1032 | 1028 | −4 |
| probe_db_gate_5（login-401 DB 门 60×1s·401@attempt1） | 1045 | 1033 | −12 |
| probe_exit_check_6（3s sleep+exitCode+worker /livez+/readyz/worker） | 3010 | 3011 | +1 |
| probe_api_readyz_7（/readyz/api 实名·200@attempt1） | 1006 | 1009 | +3 |
| probe_first_signup_8（POST /auth/signup·200+token） | 60 | 71 | +11 |
| **合计（PROBE_SUMMARY total_ms）** | **14465** | **11324** | **−3141** |

冷热差几乎全部落在 migrate（−2932ms·热页缓存效应）；启动后链各段差 ≤ 12ms·段 6 差 +1ms（≈3s sleep 常量）。两臂均远离任何红阈值（livez/DB 门预算 40/60 次均 1 次过）。

## 5. 预注册五向判读（rev4 §3·机械规则如实套用·禁洗绿）

机械规则核（最末 PROBE_SEGMENT 行 × EXIT 交叉）：run-A 最末行=`probe_first_signup_8 status=ok`+EXIT=0 ✓；run-B 同 ✓；EXIT=1-无行崩溃态未出现·EXIT=9 未出现 ✓。

| 向 | 命中条件 | 实测 | 结论 |
|---|---|---|---|
| ① 环境面红 | EXIT 1/2 | 未命中（两臂 pg/migrate 全 ok·migrate 1 试过·无恢复试） | 不适用 |
| ② 启动段红 | EXIT 3-7（fail/timeout 均计） | 未命中（段 3-7 两臂全 ok·无 fail 无 timeout） | 不适用 |
| ③ signup 红 | EXIT 8 | 未命中（两臂 signup 200+token） | 不适用 |
| ④ **启动链健康（EXIT 0）** | 全段过 | **命中（两臂均 EXIT 0·8/8 段 ok）** | **主判：红因在旅程段 ⇒ 归 G7X ①面延续（报告钟/断言之外的第三抛点）另探** |
| ⑤ 冷热分裂 | 一红一绿 | 未命中（两臂同绿·仅热缓存提速） | 无 infra-adjacent 指向；n=1/臂边界下亦无分裂形态 |

先例序应用：两臂均无红 run ⇒ 无段 EXIT 主判候选；向④为唯一命中向，判读即向④。**结论（附协调方·不自批）**：在本 worktree 复刻的等价启动链上（docker PG→migrate→api+worker 并发 spawn→livez→login-401 DB 门→3s+exitCode→worker 里程碑→/readyz/api→signup），启动链健康且快（livez 与 DB 门均首拍过·signup 60-71ms 返 token）——历史 api 红族（E2EFAIL-1 23.3s·0 行·双计 0；ledger 2-11 深跑红）**不在本探针可见的启动链内复现**，定靶转向：旅程段（signup 之后的 early journey）与/或 tsx 装载面（见 §6 盲区）。

## 6. 盲区与边界（如实记·必注项）

1. **tsx 装载盲区（rev4 §3 钦定必注）**：本探针不 spawn tsx——`e2e/full.e2e.ts` 装载段红（import 断链/模块解析类）在本探针呈 EXIT 0 绿并落入「旅程段」桶。向④的「旅程段另探」显式包含该装载面候选；下一刀可选 code 截获面（协调方已列的备选方案）以切分「装载红 vs 旅程红」。
2. **环境非历史红环境**：本探针在 worktree `meetwise-line-g7boot`（分支头 `7b8eb37c`）执行，node_modules 为执行前 `pnpm install --frozen-lockfile` 全新安装（4.5s·无 build-script 批准告警影响·@swc/core+tsx 均验证可载）；历史红 run 发生于主 checkout 环境。「启动链健康」结论的作用域=本 worktree 复刻链·非主 checkout 环境排除性结论。
3. **n=1/臂**：每臂单 run·无统计力；冷热同绿只支持「未观察到分裂形态」，不构成「无 infra-adjacent 因子」的坐实。
4. **wrapper 级前置门不复刻（出设计）**：`run-e2e.mjs` 的 `live_provider_key_missing`/fake-service flags/`port_invalid` 门在 wrapper 层非启动链内；本机两 run 时 `MODEL_API_KEY` unset·`.env` absent·`E2E_PG_IMAGE`/`E2E_API_PORT` unset（name-only 核过·零覆盖）——这些门即便复刻也不会触发。
5. 段 3 的 500ms settle 与段 7 的 10×1s 为 probe-local 预算（非 wrapper 钉值·已在脚本头注记）；段 4/5 轮询附子进程退出早停（仅时序锐化·不改变 run-e2e.mjs 判定语义：api/worker 死亡在原链终将呈 not_ready/exited_before_test 红）。
6. 观察项：docker daemon 上存在另一会话的历史容器 `meetwise-e2e-62497-cold2-stop-band-1-…`（先于本探针存在）——未触碰（同 wrapper 规约：绝不枚举/杀无关容器）；两 run 各自 loopback 随机端口（54963/55067·26826/27106+26827/27107），无端口交叠。
7. 收尾核：两 run 结束后 `meetwise-g7p-probe-*` 容器余量为 0（探针 finally 自清·已核）。

## 7. est / Key / 模型面

- **est：0 live 模型调用**。两 run 全部请求面=livez/login(401)/signup(200)/readyz/metrics 里程碑——signup/login 链零模型面（已实证）；未触任何 report/OCR/ASR/embedding 路径（`E2E_REPORT_FAIL_ALL=1` 随 worker 继承但报告路径未达）。
- **0 Key**：执行环境 `MODEL_API_KEY`/`DASHSCOPE_API_KEY` unset·`.env` 不存在——两 run 进程树内**零密钥材料**（非「有而未用」）；探针输出无任何 env 值回显（子进程输出按 run-e2e.mjs 同律 withheld·仅块数/字节数）。
- G7_FREETIER_REPROVE unset ⇒ 无 ledger 面。

## 8. Pins（十值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 9. Non-claims

本刀 ≠ G7 修复 ≠ trio 任何面 ≠ api 红根因定谳（探针=定靶非修复；两臂绿=启动链在复刻环境健康的**排除性**证据，受 §6.2/§6.3 边界约束）≠ g7SuiteGreen 翻转 · alone≠dual · 本收据不构成 post-prove dual 的任何一臂。

## 10. 工件清单

- `scripts/e2e-boot-probe.mjs`（sha256 `1629af6f…50007e`）
- `package.json`（+1 script `e2e:boot-probe`·唯一接线改动）
- `ai-docs/delivery/harness/g7p-bootphase-probe.md`（lifecycle：`draft_rev4:awaiting_pre_exec_dual` → `exec_rev4:awaiting_post_prove_dual`）
- 本收据目录：`receipt.md` + `run-a.log` + `run-b.log`
