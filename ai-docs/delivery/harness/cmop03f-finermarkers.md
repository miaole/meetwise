# CMOP03-F · GAP-CMOP03-POST7B POST7B finer markers 段内鉴别刀 · REQUEST（docs-only）

status: **`draft:awaiting_pre_exec_dual`**（REQUEST 就绪 · 预执行双审未做 · meetwise 未授权 EXEC · 本 commit 零码零埋点零实跑——埋点与判别 run 属下轮 EXEC 面）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base line 与 worktree 披露

- fetch 2026-10-08：`origin/feat/mysql-schema-skeleton` = `61a9750cc1821125c5fb19950053816fcc5f4440`（≥ `49fc1087` 达成——`49fc1087` 即 G7Y nail，含本刀立项登记；本地同名分支已 ff 至同点）。
- 本刀 worktree：`/Users/miaole/Desktop/golucky/meetwise-line-cmop03f`（仓库根同级新建）；分支 `line/cmop03f-finermarkers`（新立自 `origin/feat/mysql-schema-skeleton`，跟踪同名 upstream）。
- 立项出处：**G7Y nail（`49fc1087`）finer markers 鉴别刀立项登记——本文引用之，不自建 SSOT 行**。POST7B ×3 复现读数系 G7Y 卷面记载，本 REQUEST 未实测（docs-only · 零实跑）。
- 全部 blob/行号锚均为 mw-core 在本 worktree 于 base 点以 `git rev-parse HEAD:<path>` / 逐行亲算，非转录：

| 文件 | blob @ 61a9750c |
| --- | --- |
| `e2e/full.e2e.ts`（**本刀唯一 EXEC 改动面**） | `6c27b58339e952142d5a9c9bc9fd2da02df4143c` |
| `e2e/helpers/sse.ts`（反伪造钉①） | `9bba015d6b3f65a9c8ac26c2036422a92ff458c6` |
| `e2e/helpers/assert.ts`（反伪造钉②） | `975fbb3848c2df29cbf6e891bfa5e0926cf57bdc` |
| `scripts/run-e2e-isolated.mjs`（反伪造钉③） | **`e818fb46362c56d5`**（四钉登记旧值 `13dbfc43` → 当值漂移已在卷：G7Y `g7y-trio-rerun.slice.md`/`harness/g7y-trio-rerun.md` 登记＝PRIV01-C 授权 nail 的 `tenant-wiring-neg:prove:raw` 第 4 处 isolatedCommand 路由新增 · trio 三路由语义零变化 · 非静默漂移 · 本刀零触碰） |
| `packages/ai-runtime/src/model-operation-registry.ts`（反伪造钉④） | `63af556fd16696c8756ddefb8a6317d9495f05ff` |
| `e2e/helpers/failure-class.mjs`（绿门/ledger 实现 · 只读引用） | `102d0f3ad34c30eb` |
| `e2e/helpers/interview.ts`（parity 钉 · 只读引用） | `c70016123ce144d7` |
| `e2e/helpers/http.ts`（readJson 机制亲读 · 只读引用） | `9723e31ad53aaaf4` |

## 1. 红事实与段内候选面解剖（REQUEST 必写①）

**红读数（G7Y 卷面 · trio 原值记账零冲销 retained）**：POST7B（旅程尾段 class=api 红）**×3 复现同窗族**——run1 **78798ms**（CMOP03-FIX 刀① prove）+ G7Y CMD1 **101906ms**（`pnpm run e2e:isolated`）+ G7Y CMD3-HTTP **67369ms**（`verify:e2e-performance` 套件内 HTTP full E2E 步），三读数同 class=api 同窗族。G7Y trio `seg` 心跳 **2/2 收敛**：两 run ledger 11 行逐行同形、**末心跳均＝M5 `seg_bound_start_enter@:337`（M6/M7 未达）**⇒ 红点落**岗位绑定 start 子段 `(:337, :351)` marker 纪元**（岔B 相容 · 收敛=读数增量≠定位定谳 · G7Y Ban 归因两岔任一岔照抄）。本刀＝段内 finer markers 单 run 定位唯一死点。

**段内解剖（码面亲读 @ `6c27b583`，行号亲算）**——`(:337, :351)` 共 7 个语句面候选（任务书口径「两 fetch/readJson 抛面+三组断言」~7 候选 · 本刀逐面机制校准）：

| 行锚（6c27b583） | 面 | 机制（亲读 helpers） |
| --- | --- | --- |
| `:338` | fetch#1（首发 start POST）抛面 | `fetch` 网络面可 throw → 未捕获 → `main().catch`（`full.e2e.ts:390-393`）落 `class=api code=client_uncaught` 族 |
| `:339` | readJson#1 形变面 | **readJson 永不 throw**（`http.ts:4-10` try/catch 返回 `{}`）——失败模式为 `{}`/null 形体向下游传导（`:340` 对 null 体属性读 TypeError→client_uncaught；或字段缺失→`:341-:343` 断言红） |
| `:340` | `boundInterviewId` 赋值面 | 仅 `started` 为 null/原始值时 TypeError（JSON null 体机制罕面） |
| `:341-:343` | **start 断言**（原子创建岗位专属会话+可信跳转） | `A()` fail-fast（`assert.ts:10-22`）→ `E2E_FAILURE class=api code=assertion` + stderr 原文（withhold 契约内不可回读）+ `process.exit(1)` |
| `:344` | fetch#2（幂等重试 start）抛面 | 同 `:338` |
| `:345` | readJson#2 形变面 | 同 `:339`（失败模式向 `:346-:347` 传导） |
| `:346-:347` | **幂等断言**（reused 同一 interviewId） | 同 `:341-:343` |
| `:349` | fetch#3（begin POST）抛面 | 同 `:338` |
| `:350` | **begin 断言**（202） | 同 `:341-:343` |

**为何 M5/M6 现存粒度不可判（鉴别缺口本体）**：M5（`:337`）与 M6（`:351`）之间 7+ 面同落 class=api；断言面（code=assertion）与未捕获抛面（code=client_uncaught 族）在 **class 维度零鉴别力**（CMOP03-D §1 已立）；精确致死行不在 receipt 可读面（stderr 断言原文 withhold 契约内不可回读）。故须段内 finer markers + code 维度交叉读数（§4）。

## 2. 埋点设计（4 枚 · e2e-ha 席推荐点位 · insert-only · 本 REQUEST 零码）

**发射通道裁定（CMOP03-D 同法 · 只引不改）**：埋点行以 **`reviews.record({ class: 'worker', code: 'seg2_*' })`** 落账——`full.e2e.ts:22` 既有 `createE2EReviewLedger()` 实例（`6c27b583` 亲证在树）· `E2E_REVIEW` 结构化行为 receipt 一等公民。**不采用 `emitE2EFailure`**——其打印 `E2E_FAILURE` 行，红 retained 预期下虽不触发绿门，绿 run 会被 `evaluateIsolatedHttpE2E` 判 `success_with_failure_class` 拒收（`failure-class.mjs:102d0f3a` 绿门）——`E2E_REVIEW` 通道双向安全。CMOP03-D 7 枚 `seg_*`（M1:257/M2:260/M3:304/M4:307/**M5:337**/M6:351/M7:362）**留树零重加零改写**（G7Y 留树纪律照抄）。

**埋点点位清单（恰 4 点 · 恰 4 行纯插入 · 零行删除零行改写 · 行号锚＝blob `6c27b583` 插入前亲算）**：

| # | code | 锚（6c27b583） | 插入位置 | 命中读数含义 |
| --- | --- | --- | --- | --- |
| F1 | `seg2_start_readjson` | `:339`（`const started = await readJson(r);`）后、`:340` 前 | 首发 start fetch(`:338`)/readJson(`:339`) 已完整返回（含 4xx/5xx 形体——readJson 不抛） |
| F2 | `seg2_start_assert_pre` | `:341`（start 断言 `A(` 首行）前、`:340` 后 | start 断言面即将进入（F1 达 F2 未达 ⇒ 死点=`:340` 赋值面） |
| F3 | `seg2_idem_assert_post` | `:347`（幂等断言收行）后、`:348` 空行前 | 第二发 start(`:344`/:345)+幂等断言(`:346-:347`) 已完整通过 |
| F4 | `seg2_begin_assert_post` | `:350`（begin 断言）后、`:351`（M6 行）前 | begin fetch(`:349`)+断言(`:350`) 已完整通过 |

M5（`:337` 前夹逼界）与 M6（`:351` 后夹逼界）**已在树**（G7Y 留树 · 零重加）。**EXEC 后行号重锚纪律（G7Y rev3 e2e-ha 席处方同法）**：插入后行号整体位移，EXEC 收据须以 marker 纪元（插入后实锚行号逐行亲证）重锚登记，锚语义与 insert-only 性质逐点成立（CMOP03-D E-a/E-b erratum 先例）。

**账本预算（绿 run 兼容性亲算 · `REVIEW_LEDGER_LIMIT=32` @ `failure-class.mjs:55`）**：绿 run 既有 5-7（terminals ×5 + capability 面 ×0-2）+ CMOP03-D 7（`seg_*`）+ 本刀 4（`seg2_*`）= **16-18 ≤ 32**；POST7B 红形（trio 实证 ledger 11 行 + 段内最多 4 枚新达）= **11-15 ≤ 32**。`E2E_REVIEW_SUMMARY count` 与 `collectE2EReviews` 同源自 entries，`review_summary_mismatch` 绿门自动一致；UC018 abandon-only 提前 return 路径（`:129-137`）全埋点在其后，零影响。

**静态门兼容（CMOP03-D §2 同法亲读 `scripts/e2e-static-guards.mjs`）**：required（`interview_helper_import`/`interview_helper_call` ≥3 处/`scoreless_bound_null_score`）与 forbidden（本地 shadow `driveInterviewToTerminal`/`if(false)` 死调用/伪造 0 分断言/`questionId` 模板串）与 4 行 `reviews.record` 纯插入互斥相交零冲突；EXEC 以 `e2e-static-guards:prove`+`:check` 实证。

**三零保证（EXEC 机器核验 · 非自述）**：① **A() 本体逐字节零 diff**——4 行纯插入，全文件 `git diff` 恰 4 行 `+` 且全为 `reviews.record({ class: 'worker', code: 'seg2_*' })` 形态（`E2E_REVIEW_LINE_RE` code 正则 `[a-z][a-z0-9_]{0,79}` 合形亲证）；`:337-:351` 段内全部既有行（含 `:341-:343`/`:346-:347`/`:350` 三组断言与 M5/M6 两心跳行）逐字节零 diff 机器核验；② **四钉 blob 全等**——EXEC 前后 `git hash-object` 亲算：钉① `9bba015d`/钉② `975fbb38`/钉④ `63af556f` 与 §0 表全等；钉③ `13dbfc43`（登记旧值）→当值 `e818fb46` 前后全等（漂移已登记 · 本刀零触碰）；③ **withhold 契约零触碰**——`seg2_*` 为 `E2E_REVIEW` 结构化行 **≠ stderr 断言原文回读**，`run-e2e-isolated.mjs`（`e818fb46`）withhold 面零触碰。

## 3. sidecar v2 臂（五条全程 · model-op 前向纪律兑现 · 交叉互证非唯一判据）

**先例引用（checklist :1553 sidecar v2 前向纪律五条 · 只引不改）+ G7Y trio 全程行使形态**：判别 run 内并行 sidecar——① **post-migrate 锚**（挂 wrapper stdout `E2E_POSTGRES_READY label=post-migrate` · **Ban container_found 锚**）；② **42P01 pending 窗**（首 ok tick 前 relation-missing 归类 `pending` 不计失败预算）；③ **停针计数器仅 post-first-ok 武装**；④ **逐查询纪律**（C-HA-FF-3 + OB-Q2 兜底 · `fallbackUsed=false` guard · Ban 新发明查询——G7X 冻结投影/CMOP03-D `.tmp/cmop03d-sidecar/` 同法 SELECT-only · 1000ms EXEC 定值）；⑤ **必读面 `interview_job` + `ai_model_invocation` 双读逐 tick 双计**。容器精确绑定 · 外来容器零触碰零采信 · 产物 `.tmp/` 不入 git · 容器用后即焚零残留。

**本刀交叉读数（预注册 · 互证非唯一判据）**：段内死亡（M6 未达）⇒ 绑定 interview 已于 `:338` 创建 ⇒ `interview_job` 窗内新行**应在**；模型调用自 boundLoop（`:352` 起 · M6 后）方始 ⇒ `ai_model_invocation` 绑定会话增量**预期 0**（若 >0 ⇒ 与心跳读数冲突 ⇒ 两臂冲突条款如实升级）。收据仅入计数与时间戳（`request_digest`/`output`/token 计数不入收据 prose）。

**live 记账纪律（前向兑现）**：est ≤25/本刀（含判别 run+sidecar 实测）· 硬帽 200（链累计）· `actualSpendCny=null`（无计价数据源 · Ban invented spend）· Key 只经进程环境 loader（收据内 name-only 零键值）· `.env*` ABSENT（全程零创建零读取零入收据）。

## 4. 判别判据（预注册双向）

**主判据＝末心跳序位 × receipt code 交叉读数（6 窗完备 · `6c27b583` 行号锚）**：

| 末心跳（前达·后未达） | 红点窗 | 窗内候选面 | code 交叉读数 | 判读（预注册） |
| --- | --- | --- | --- | --- |
| M5 ✓ F1 ✗ | `(:337, :339]` | `:338` fetch#1 抛 / `:339` readJson#1 形变 | client_uncaught→`:338`（唯一）；code=assertion 机制不可能→异常升级 | 首发抛面定谳 |
| F1 ✓ F2 ✗ | `(:339, :341)` | `:340` 赋值面（仅 null 体 TypeError 形） | client_uncaught→`:340`；assertion 不可能→异常升级 | 机制罕面如实登记 |
| F2 ✓ F3 ✗ | `[:341, :347]` | `:341-:343` start 断言 / `:344` fetch#2 抛 / `:345` readJson#2 形变 / `:346-:347` 幂等断言 | client_uncaught→`:344`（唯一）；assertion→**双断言残留窗**（`:341-:343` vs `:346-:347` 非唯一）→如实登记升级协调方 · **Ban 段内候选预claim** | 段内最宽窗（唯一/残留两分支均预注册） |
| F3 ✓ F4 ✗ | `(:347, :350]` | `:349` fetch#3 抛 / `:350` begin 断言 | assertion→`:350` 唯一；client_uncaught→`:349` 唯一 | 唯一定位 |
| F4 ✓ M6 ✗ | `(:350, :351)` | 零语句面（相邻行零隙） | — | 机制异常→升级协调方 |

**双向界条款（任务书明文）**：M5 **未达**（红点在 `:337` 前）或 M6 **达**（红点在 `:351` 后）⇒ 红点在本段外 ⇒ **如实验证升级协调方（跨 run 形状漂移）**，Ban 强行归类段内。

- **四枚新心跳+M5/M6 夹逼 ⇒ 死点定位**：六窗中四窗唯一死点、两窗（F1-F2 机制罕窗 / F2-F3 assertion 残留窗）预注册升级条款——非唯一分支**诚实预注册**（Ban 隐匿）。
- **sidecar 交叉互证**：§3 两臂方向一致则判别成立；两臂冲突或任一机制不可判 → 如实登记升级协调方。
- **预期红 retained ≠ 判别失败**：判别 run 预期 EXIT=1 class=api retained——鉴别刀交付物=定位读数非翻绿；**单 attempt · Ban retry-to-green**。
- **定位 ≠ 修复 ≠ 关闭**：`GAP-CMOP03-POST7B` **P1 OPEN 维持**；定位读数出后修复另刀（新 REQUEST + pre-exec dual + 协调方授权）；Ban 就地归因既有 OPEN 行。
- **不动 `:337-:351` 任何断言本体**（§2 三零① · 全段既有行零 diff）。

## 5. EXEC 面范围与 prove 计划（下轮 · 本 REQUEST 不执行）

- **coding**：恰 1 文件 `e2e/full.e2e.ts` · 恰 4 行 `reviews.record({ class: 'worker', code: 'seg2_*' })` 纯插入（§2 表）· 零其他 diff；插入后 marker 纪元重锚逐行亲证。
- **prove（一次优先 · 单 attempt）**：`pnpm e2e-static-guards:prove` + `pnpm e2e-static-guards:check` 期望 EXIT=0 · `pnpm e2e-helpers:prove` 期望 EXIT=0 · `pnpm e2e-parity:prove`（base 已再生 74→84 · parity-b nail 在卷）+ `pnpm e2e-case-inventory:prove` 期望 EXIT=0；**判别 run＝`pnpm run e2e:isolated`（CMD1 同体）+ sidecar v2 五条全程并行 · 恰 1 次，预期 EXIT=1 class=api retained**；收据须含：全量 `seg_*`/`seg2_*` 心跳行 + 末心跳序位判读 + receipt code 交叉读数 + sidecar 五条逐项读数（post-migrate 锚/42P01 pending 窗/post-first-ok/逐查询 guard/必读面双计）+ 三零机器核验（A() 逐字节零 diff · 四钉前后全等 · withhold 零触碰）+ live 记账（est ≤25 · 硬帽 200 · `actualSpendCny=null`）。
- 机器核验命令与判读脚本 /tmp 预演（dry-run）先行，Ban 未经授权加跑（绿面佐证臂不默认行使 · 归预执行双审裁）。

## 6. Ban 列表（REQUEST 必写④）

Ban 碰 `:337-:351` 断言本体（A() 调用全族逐字节零 diff · 全段既有行零改写）；Ban 碰 `:356`/`:357`（任务书行号锚——7d65d0f3 旧纪元＝boundLoop 死胡同断言/provenance 计数断言，`6c27b583` 当树对应 `:363`/`:364-:365`；当树 `:356`/`:357`＝`driveInterviewToTerminal` 实参行——**两读法均零触碰**）；Ban 碰反伪造四钉 blob（`9bba015d`=`e2e/helpers/sse.ts` · `975fbb38`=`e2e/helpers/assert.ts` · `13dbfc43` 登记=`scripts/run-e2e-isolated.mjs`〔当值 `e818fb46` 漂移已在卷 · 本刀零触碰〕· `63af556f`=`packages/ai-runtime/src/model-operation-registry.ts`）；Ban 碰 withhold 契约（stderr 断言原文回读面）；Ban 碰产品码（`apps/**` · `packages/**` 零触碰）；Ban 碰 CMOP03-D 7 埋点（M1-M7 留树零重加零改写）；**Ban 顺手修复**（定位≠修复≠关闭 · POST7B P1 OPEN 维持 · 修复另刀）；**Ban 两岔或段内候选预claim**（红读数未出前任何候选面归因均禁止 · 含 F2-F3 残留窗双断言任一）；Ban 改共享 SSOT（`gap-bug-backlog.md` / `execution-master-checklist.md` / 矩阵 / sibling 归档——只读引用；`GAP-CMOP03-POST7B` 行注 EXEC 结果登记**归本刀 nail**）；Ban secrets / 键值入收据 / invented spend / `.env*`；Ban force-push；Ban retry-to-green；Ban self-approve（预执行/post-prove 双审均须 mw-e2e-ha + mw-model-op 独立席位）。

## 7. 流程声明（REQUEST 必写⑦）

REQUEST（本文）→ 预执行双审（mw-e2e-ha + mw-model-op · 空审 stub 见 §8）→ meetwise 授权 → EXEC（埋点 4 枚 + CMD1 同体单 attempt + sidecar v2）→ post-prove 双审 → meetwise 授权 nail。执行地：worktree `meetwise-line-cmop03f` · 分支 `line/cmop03f-finermarkers`。

## 8. 交付物与本 commit

- `ai-docs/delivery/harness/cmop03f-finermarkers.md`（本文）
- `ai-docs/delivery/cmop03f-finermarkers.slice.md`（切片速览）
- `ai-docs/delivery/reviews/REQUEST-2026-10-08-cmop03f-mw-e2e-ha.md`（空审 stub · 待审席填写）
- `ai-docs/delivery/reviews/REQUEST-2026-10-08-cmop03f-mw-model-op.md`（空审 stub · 待审席填写）

本 commit = 上述恰 4 文件、零其他 diff；作者/提交者 `mw-core <mw-core@meetwise.local>`。

## 9. Not-a-pass 诚实尾条

Not a pass · not coding（埋点未落 · 本 REQUEST docs-only）· not proven · not run（零实跑零 live 零容器零 sidecar）· not 鉴别定谳（段内死点未定位 · 六窗未判）· not 归因（两岔/段内候选零预claim）· not 修复 · not POST7B 关闭（P1 OPEN 维持）· not `:356`/`:357`（两读法）处置（候修归协调方）· not covered · not HA · not releaseEvidence · not nail · not coordinator authorize · not 预执行双审 done · 红读数 retained（POST7B ×3＝78798/101906/67369ms 原值记账零冲销）· `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual
