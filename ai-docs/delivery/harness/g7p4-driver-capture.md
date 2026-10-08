# G7P-4 — full.e2e driver 内联 stdout 三元组截获刀（G7 api 红真实面一跑三得）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `79ada922`（applied=152 面）· 分支 `line/g7-driver-capture` · 立项依据 = G7P-3 nail 裁定（A() ✗ 走 stderr=死信已证·「改 A() 消息」禁采·有效形=driver stdout 面）。

## 1. 目标（一跑三得）
在 full.e2e 真实旅程 consent 步落 **stdout 可收据面** 的三元组+throw 码：①拿真实红面（status/body/elapsed 或 err_name/err_code）；②顺带裁定红在 **152 面**是否仍存（绿=「红系 144 基线特有已随后续迁移消解」假说定谳→(f) 轴收口）；③常驻截获面受益未来所有 run。

## 2. 手段（≤8 行·零产品码·零 wrapper 改）
`e2e/full.e2e.ts:35-36` consent 步改造：
1. console.log 三元组行 `E2E_STEP_CAPTURE step=consent status=<n> elapsed_ms=<n> body=<prefix-200-chars>`（**stdout 面**——A() ✗ 的 stderr 系死信·emitE2EFailure 双通道契约先例）**先打印后断言**；
2. try/catch 包 fetch：catch (e) → console.log `E2E_STEP_CAPTURE step=consent thrown=<e.name>/<e.code>` 后 **rethrow 原语义**（不吞不洗）；
3. 断言消息内嵌实际 status（交互面增益）：`PIPL 采集同意 → 200 (实际 ${r.status})`。
- 不触 helpers/不触 wrapper/不触解析器契约（evaluateIsolatedHttpE2E 容忍任意 stdout 行·UC018 banner 先例）。

## 3. 跑法与预注册判读
恰 1 run：`pnpm e2e:isolated`（152 面真实链·MODEL_API_KEY 沿 wrapper 既有钉值）。三向：
- **红+capture 行到手**：status/throw 码定靶 ⇒ 修复刀直接立项（按码面：5xx=DB/4xx=契约/UND_ERR=连接层）；
- **绿（含 consent 200 capture 行）**：152 面红已消 ⇒ (f) 基线特有假说**定谳成立** ⇒ `:107` 收口材料（红链归因=144 基线 ACL 缺失·已由 0150/0151 修复）⇒ G7 修复线转 POST7B/trio 评估；
- **红但 capture 行缺**（死于 consent 前——如 A#1 signup 面）：死亡面再次前移 ⇒ 如实登记再探。
三向如实禁洗绿禁重跑至绿。est live ≤25（sidecar 双计·沿判别 run 口径）。

## 4. Ban
零产品码（apps/packages src 零改）·e2e/full.e2e.ts 改动 ≤8 行且仅 consent 步·helpers/wrapper/解析器零触碰·Key 只经进程 env name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 5. 验收
恰 1 run EXIT 原值+capture 行（或绿面 capture 行）+三向判读+diff ≤8 行亲证+收据 `ai-docs/delivery/receipts/g7p4-driver-capture/`·sidecar v2 实测臂沿五纪律。

## 6. Non-claims
本刀 ≠ G7 修复 ≠ g7SuiteGreen 翻转 ≠ trio 面（绿向仅产 (f) 定谳材料·trio 再跑另立）·capture 行格式不承诺解析器兼容外的任何契约。
