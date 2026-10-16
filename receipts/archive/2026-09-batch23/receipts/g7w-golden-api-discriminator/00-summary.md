# SUMMARY — G7W · golden 冷启归因 + api 面拒因甄别刀（EXEC · 双甄别实验 · 协调方授权后执行）

**Line**: G7W · **Date**: 2026-10-08（UTC）· **授权**: REQUEST（`93b3c215` origin · 本地孪生 `9b95f04c` rebase patch-id 自动 skip）→ PRE dual BOTH PASS（mw-e2e-ha `1cfb0cdf` + mw-model-op `10e25f38`）→ 协调方 EXEC 授权（两实验定值落字：`E2E_UI_GREP` 透传 / 升压臂 ≥6·+≤15 / sidecar 1000ms · `.tmp/g7w-sidecar/` / **C-MO-1/C-HA-1 `job_application` 表名纠偏强制**）· **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7w` · branch `line/g7w-discriminator`（rebase 落 origin tip `10e25f38`）· **实跑 code**: `10e25f38`（工作树内容）

## 一句话定谳（两实验）

1. **实验一（golden 冷启）＝未定谳（削弱+挂起）**：过滤单跑 6 run / 12 golden 执行（含冷栈+冷 build 最高红概率条件）**零复现**，分段 3.0–4.4s ≪ 20s——H-G1/H-G2 置信度显著下降（非证伪）；H-G3 契约内不可证伪（破坏性注入=Ban）；归因残留=「G7U 两轮环境特异（宿主负载/栈启动抖动）」**如实挂起回协调方**（Ban 定谳「永不复现」· backlog 立行与否归协调方）。
2. **实验二（CMD1 api 面）＝定位成立 + 「同形不同内容」定谳为真**：EXIT=1 · class=api · **38013ms** 落 G7S/G7U 簇（37.9–40.6s）正中（**形 retained**）；sidecar 35 tick 全窗口 DB 时间线定谳**内容**——**供给链清白**（6 job 全 done · last_error 全 NULL · interview completed · begin/start 面无缺=G7S 修复 effective face 实测干净）、**api 红=后旅程尾段死亡**（末 DB 活动 00:23:05 → receipt 终点 ≈12s 静默窗后 uncaught throw · `job_application` 35 tick 恒 0 行 → 死于申请面前 = report/B-side/review 尾段）；**表外读数登记**：`ai_model_invocation.error_code='schema_validation_failed' ×2`（旅程开头 3s · 被 question-generation MALFORMED 优雅路径吸收 · 致死性不定谳）+ 精确断言原文（withhold 契约 · 回读裁定权归协调方）。

## 码面机检（binding #3 · 全 PASS）

1. **三钉 blob 前后全等**：`run-e2e-isolated.mjs` **`13dbfc43`** · `e2e/full.e2e.ts` **`7d65d0f3`** · `model-operation-registry.ts` **`63af556f`**——EXEC 前（rebase 后预检）= EXEC 后（全 run 完成）`git hash-object` 亲算两轮全等。
2. **tracked 树零改**：EXEC 全程 `git status --porcelain` 非 untracked 变更=0——零产品码/零 spec/零 wrapper/零 SSOT 改动（甄别=只读诊断）。
3. **锚 tip 复核**：`package.json` blob `0afb3bd2`（wiring `:278/:279`）· `golden.spec.ts` blob `8db8746b`——均与 REQUEST 时代全等；`E2E_UI_GREP` 透传行 tip 实测恰 `:193`。
4. **receipt 自证**：CMD1 machine receipt `sourceDigests["e2e/full.e2e.ts"]` sha256 `f55f57f3…` 与本树 `shasum -a 256` 亲算全等。
5. **机检面机扫**：收据三文件 `sk-*`/`Bearer` 扫描零命中；Key 值/fingerprint 零入树；`.env*` 全程 ABSENT。

## 条件逐条自评（binding 合并全集 · 违反任一=post-prove FAIL 交双审裁）

| # | 条件 | 自评 |
|---|---|---|
| 1a | 实验一 ×3 受控复现 · H-G1/G2/G3 判读表照卷 | **兑现**（×3 + 升压臂共 6 run · 判读表五行逐行落字 · Receipt 01） |
| 1b | 升压臂仅 A 零红预注册触发（≥6 / +≤15 一次成型） | **兑现**（A=0 红 → 触发 · 总样本 6 run · B 臂 est ≤12 ≤ +15） |
| 1c | 慢速因子限无破坏观测类 | **兑现**（零破坏性注入 · 零 BUILD_ID 清理 · 零降资源） |
| 1d | 红在记录面外步骤=表外值域回协调方 | **N/A**（实验一零红 → 无表外步骤；实验二表外读数按同纪律登记 · Receipt 02） |
| 2a | 实验二 CMD1 ×1 + sidecar SELECT-only 白名单 | **兑现**（恰 1 run · 9 查询白名单 · Ban payload/output/写语句零违） |
| 2b | **C-MO-1/C-HA-1 表名纠偏** | **兑现**（SQL 逐字修正为 `job_application` @`0005:20` 实测 · 纠偏入收据 · 纠偏必要性实证=原表名将成永久 relation-ERROR · J-A4 锚在修正名查询 ok 后参与判读） |
| 2c | ok/error 逐查询纪律（残余报错=仪器缺口回协调方） | **兑现**（tick-1 迁移在途 ERROR 如实记 · tick-2 起零残余 error → 无仪器缺口；OB-2 拆除伪影不影响证据窗口） |
| 2d | J-A1~A6 对称定谳「同形不同内容」 | **兑现**（J-A1/A2/A4 排除 · J-A3 修正读法+J-A6 命中 · J-A5 值域未现→表外登记 · 定谳=真 · Receipt 02） |
| 3a | 预注册沿 FLK（每跑假设+判读+反例）· Ban retry-to-green | **兑现**（7 run 全台账 · 零重跑零择优 · 升压臂=预注册分支） |
| 3b | 甄别=只读诊断 Ban 修复 | **兑现**（零码改 · 修复路由建议交协调方） |
| 3c | withhold 零触碰（读 DB 不读 stderr） | **兑现**（探针与子进程 stdio 零接触 · case 名/断言原文零回读 · wrapper blob 全等） |
| 3d | blob 三钉全等入收据 · `g7SuiteGreen=false`/`actualSpendCny=null` 保持 | **兑现**（§码面机检 1 · 两值零翻转） |
| 4 | Pins 原值 | **零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 |

## attempts 全台账（7 run · Ban retry-to-green 守住）

| # | run | EXIT | 定性 |
|---|---|---|---|
| 1–6 | 实验一 golden 过滤（A×3 + B×3） | 0×6 | 全绿（甄别样本 · 非翻绿冲销——G7U CMD2 真测 EXIT=1 retained 不受影响） |
| 7 | 实验二 CMD1 | 1 | **预期红**（retained api 面 · 甄别成功判据=快照捕获 ✓ 35 tick 全窗口 · 红 EXIT ≠ 甄别失败） |

## 仪器披露（非阻断 OB · 全量如实）

1. **OB-1**：run1 显式 EXIT 捕获变量 zsh 管道下未展开——EXIT=0 以 tally+零 ✗+收尾+复合进程四证承担；run2-6 已改直录法。
2. **OB-2**：sidecar 于容器拆除瞬间因 pg Client 未处理 `error` 事件 exit 1——拆除伪影，35/35 tick 全窗口快照完好（末快照距 receipt 终点 1.06s）；仪器改进项（`client.on('error')` 兜底）登记非本刀域。
3. **OB-3**：本机 loader 仅导出 `MODEL_API_KEY`——`MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset（G7U 收据口径 `dashscope-cn-beijing`/`qwen-plus`）；env 口径差如实登记，与实验二 `schema_validation_failed ×2` 读数的联合解释力交协调方裁。
4. **OB-4**：实验一 run1 含 web production build（fresh worktree 无 BUILD_ID · runner 原生行为）——冷+build 条件入判读。

## 预算

实验一 est ≤24（12 执行 × 1–2 简历摄取 · est-not-counter）⊆ A ≤15 + B ≤15；实验二 **live=7（DB 账本实测读数：succeeded 5 + failed 2）** ≤ ≤10 口径。无超限中止 · **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）· Key 只经进程环境（loader source · name-only）。

## EXIT 契约落点（双向）

- **甄别定位成立 ≠ 修复 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**——本 EXEC 仅主张两甄别实验的读数与定谳措辞（「与 X 一致」≠「X 已证」）。
- **后继处置权全归协调方**：实验一残留（环境特异假说/backlog 立行/全 suite 上下文复现臂是否需要）；实验二尾段断言面甄别新形态（driver 侧结构化埋点 or withhold 契约裁定）+ `schema_validation_failed ×2` 立案与否 + OB-3 env 口径统一与否。
- trio stays **OPEN**（G7U 真测 1/1/1 retained · 本 EXEC 零冲销）· `g7SuiteGreen=false` · GAP-G7K-API-REDS `:107` stays P1 OPEN（零 backlog 翻转）· Disclosure-1 OPEN · 残红① 零触碰 · 旧红③ `full.e2e.ts:203`（C-MO-P3）零触碰。

## Non-claims

Not a pass · not fixed · not coding（EXEC 零码改 · tracked 树零改机检在卷）· not golden 冷启定谳（未定谳=削弱+挂起）· not trio green（1/1/1 retained）· not suite green · not `g7SuiteGreen=true` · not 尾段断言定位（withhold 契约内不可回读）· not `schema_validation_failed` 致死性定谳（表外登记回协调方）· not G7S 时点内容追认（容器即毁不可回溯）· not R1 closed · not Disclosure-1 closed · not backlog 状态翻转 · not HA · not covered · not `releaseEvidence=true` · not nail · **`actualSpendCny=null`** · alone ≠ dual · **STOP——post-prove 双审由协调方另派 · 禁自批 · 禁 push**

---
*SUMMARY · G7W EXEC · 2026-10-08 · 双甄别实验完成：实验一 golden ×6 run 全绿→假说削弱+环境特异残留挂起；实验二 CMD1 EXIT=1 class=api 38013ms→供给链清白+尾段死亡定位+`schema_validation_failed ×2` 表外登记+「同形不同内容」定谳为真 · C-MO-1/C-HA-1 纠偏兑现 · 三钉 blob 前后全等 · 7 attempt 全台账零重跑 · Pins 零翻转 · `actualSpendCny=null` · **STOP——post-prove 双审由协调方另派 · 禁自批 · 禁 push** · STOP*
