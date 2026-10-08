# G7P-4 — full.e2e driver 内联 stdout 三元组截获刀（G7 api 红真实面一跑三得）

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已落 mw-core：+6/−2 consent 步 NDJSON 截获 · 恰 1 run `pnpm e2e:isolated` EXIT=1 原值 class=api 61848ms · 四向判读=**臂2 命中**〔consent=200/12ms 干净 ⇒ 死亡面后移 · ledger 末行 `seg2_start_assert_pre` ⇒ 致死点有界=start 原子创建断言 :347-:349〔base :343-:345〕· G7W 尾段簇同族候选〕· sidecar v2 live 14=10+4 双臂互证 · 收据 `receipts/g7p4-driver-capture/` · STOP awaiting post-prove dual）· 前态 `draft_rev2:awaiting_pre_exec_dual`（rev1 双席 FAIL 六处方：capture 面改 NDJSON 文件〔裸 stdout 系死信〕+cause 面必含+四向补「consent=200 红死亡面后移」臂+绿向降级「152 面不红定谳」留 144 对比臂+绿后 :107 仍 OPEN+JSON.stringify 伪锚闭合+硬帽重申） · base = 主线 `79ada922`（applied=152 面）· 分支 `line/g7-driver-capture` · 立项依据 = G7P-3 nail 裁定（A() ✗ 走 stderr=死信已证·「改 A() 消息」禁采·有效形=driver stdout 面）。

## 1. 目标（一跑三得）
在 full.e2e 真实旅程 consent 步落 **stdout 可收据面** 的三元组+throw 码：①拿真实红面（status/body/elapsed 或 err_name/err_code）；②顺带裁定红在 **152 面**是否仍存（绿=「红系 144 基线特有已随后续迁移消解」假说定谳→(f) 轴收口）；③常驻截获面受益未来所有 run。

## 2. 手段（≤8 行·零产品码·零 wrapper 改）【rev2·席1 致命缺陷修正：capture 面改 NDJSON 文件】
`e2e/full.e2e.ts:35-36` consent 步改造：
1. **appendFileSync NDJSON 文件面**（G7P-2 boot trace 同形态·SIGKILL 安全）：`.tmp/e2e-consent-capture.ndjson` 每行内嵌 run 身份（bootId=启动时刻.pid）+run 前 unlink 亲证——行体 `{bootId, step:'consent', status:<n>, elapsed_ms:<n>, body:<JSON.stringify 截 200 字符>}`。【rev1 裸 console.log 系死信——runFullE2E :2247 stdout 只收内存从不回显·emitE2EFailure 双通道先例=解析后 wrapper 再发射非裸可见——协调方起草错误席1 纠正】
2. try/catch 包 fetch：catch (e) → appendFileSync `thrown=<e.name>/<e.code>/<e.cause?.code>`（**cause 面必含**——Node fetch 网络错 name=TypeError·code=undefined·分辨码 ECONNREFUSED/UND_ERR_* 在 e.cause.code）后 **rethrow 原语义**（不吞不洗→main().catch fallback 原样生效）。**形态注记（席2 nit·rev2）**：undici 连接族可抛 `AggregateError`——此时三元组呈 `AggregateError/undefined/undefined` 而分辨码藏在 `e.errors[]` 数组各成员的 `.code`——判读遇此形状不得据「cause=undefined」误断连接层无罪，须按形态注记如实登记（本刀三元组格式不扩字段 · 沿 ≤8 行硬门）。
3. 断言消息内嵌实际 status（交互面增益）：`PIPL 采集同意 → 200 (实际 ${r.status})`。
- 不触 helpers/不触 wrapper/不触解析器契约·body JSON.stringify 一行闭合伪锚（防原文换行造伪 E2E_ 行首）。

## 3. 跑法与预注册判读
恰 1 run：`pnpm e2e:isolated`（152 面真实链·MODEL_API_KEY 沿 wrapper 既有钉值）。**四向**：
- **红+capture 记录在手（consent 非 200 或 thrown）**：status/cause 码定靶 ⇒ 修复刀直接立项（按码面：5xx=DB/4xx=契约/ECONNREFUSED|UND_ERR_*=连接层 (c) 轴）；
- **红且 capture 记录 consent=200**：死亡面**后移**（G7W 尾段簇 37.9-40.6s 同族候选）⇒ 如实登记再探·consent 面 (f) 材料成立；
- **绿（A#2 过=consent 200 结构性推得+NDJSON 记录佐证）**：**「152 面不红」定谳+(f) 基线特有**强候选增强**（归因 144 ACL 缺失仍系假设——因果定谳留 144 面对比臂·沿 G7P-3 nail 后续序）**；**绿向后 `:107` 行仍 OPEN（修复另刀）** ⇒ G7 修复线转 144 复跑/POST7B/trio 评估；
- **红但 NDJSON 无本 bootId 记录**（死于 consent 前）：死亡面再次前移 ⇒ 如实登记再探。
四向如实禁洗绿禁重跑至绿。est live ≤25（sidecar 双计·绿向满旅程校准值·**链累计硬帽 200 重申**）。

## 4. Ban
零产品码（apps/packages src 零改）·e2e/full.e2e.ts 改动 ≤8 行且仅 consent 步·helpers/wrapper/解析器零触碰·Key 只经进程 env name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 5. 验收
恰 1 run EXIT 原值+NDJSON 记录（run 前 unlink 亲证 · bootId 归属本 run）+四向判读+diff ≤8 行亲证+收据 `ai-docs/delivery/receipts/g7p4-driver-capture/`·sidecar v2 实测臂沿五纪律。

## 6. Non-claims
本刀 ≠ G7 修复 ≠ g7SuiteGreen 翻转 ≠ trio 面（绿向仅产 (f) 强候选材料——「152 面不红」定谳+归因仍留 144 对比臂·trio 再跑另立）·capture 行格式不承诺解析器兼容外的任何契约。
