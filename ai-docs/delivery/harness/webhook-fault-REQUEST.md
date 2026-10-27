# NHP-014 WEBHOOK-FAULT REQUEST — 支付回调故障注入臂 case 起草卷·UC-E2E-014/026 FAULT cell 残余面（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`closed:post_prove_dual_pass`**（2026-10-27 post 落卷三处翻面·原值 `executed:awaiting_post_prove_dual`·更原 `draft:awaiting_pre_exec_dual` 史录不洗）· alone≠dual 已解（**post-prove 双审两独立外席双 PASS 会签在卷 §9-post**：席1 PC/F1–F3 逐臂对码+六门独立复跑 22/22/22/41/47/90 全绿+re-pin 八 blob+P2×2·席2 资金面独立推演三机证（savepoint 域隔离/外层 COMMIT 空写集零半退/FIFO 舍入算术）+主门 22/22 fresh+邻门两套 uc011 41/neg:commerce 90+P3-O1 登记）· **STOP=closed（三处钉：本 Status 行 + §8 + 卷尾注）** · EXEC 收据=NHP-014-FAULT-01 EXIT=0 · 22 断言（implementer pre-commit runs·attempts=3,0 首跑绿·全录 §9-EXEC·post 两外席独立复跑 fresh 收据在卷 §9-post）· covered 翻面权归协调方（EXIT0=case≠covered·格值 partial 保持·coveredCount=8 不变·后继=并线席 fetch/merge/push/PR 随令）。

**席位**：UC-014/026 FAULT 起草席（docs-only 起草·总盘 R9·协调方授权·与在飞 `line/webhook-neg-draft`（同 cell 姊妹刀·NEG/BOUND 两 case·EXEC 已落卷 post 期）行同 cell 异亚层互斥零重叠·与批 A/B/C 及各 UC 专属线互斥）。
**基线**：`origin/main` @ **`ca7ca748`**（full `ca7ca748830b0fc57c0d0e403ddc920dba0f7c5b` · `git fetch origin` 本 turn 成功（`9c31c0ccc..ca7ca7488` 亲读）· 分支 `line/webhook-fault-draft` 零独有 commit · worktree `meetwise-webhook-f`（仓根同级）· `HEAD is now at ca7ca7488` 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2410**（stdout「public text policy scanned 2410 managed worktree files」亲读）· cap=**2410**（`scripts/ai-docs/public-text-policy.mjs:171` `MAX_FILES = 2_410` 亲证）——**恰达上限零余量**·本卷新 .md +1 必越限 → **协调方派单令「届值·越限沿先例步进承登预授权」本 commit 即行使**：`MAX_FILES 2_410→2_411`（**+1 恰等零多放**·沿 CAP-SANCTION-2409/2410（本树在链注记 `public-text-policy.proof.mjs:299/:305` 亲读）与 webhook-neg 卷 CAP-SANCTION-2403/2413 先例形·越限臂 fabricated 数随 cap 联动 `2_411/2_412`·承登注记 CAP-SANCTION-2411 随两 .mjs 入刀）· 起草后预期 **scanned 2411=cap 恰达**。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行 `:28`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§1.0.1 `:119` / §1.0.2 `:179` / §1.0.3 双表同步令 / §0.5 强制列）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.2 钱域 `:55-63` / §3 执行纪律）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-014 `:518-526` / UC-026 `:528-546`）→ 涉事机制源 `packages/db/src/commerce/payment.ts`（`markOrderRefunded` `:122-189`·红冲块 `:146-178`）→ `apps/api/src/modules/commerce/commerce.service.ts`（`verifyCommerceSig` `:26-36` / `payWebhook` `:125-142` / `refundWebhook` `:151-168`）→ `apps/api/src/modules/commerce/commerce-webhook.controller.ts` / `payment-callback.controller.ts` → 旁证先例（全只读零触）`apps/api/test/neg-commerce.proof.ts`（webhook 并发/跨单族）/ `uc-e2e-014-026-webhook-adv.proof.ts`（C1–C7·壳行种子先例 `:105-115`）/ `uc-e2e-011-refund-callback-mouth.proof.ts`（足额红冲面 `:185/:200`·桶种子先例 `:94`）/ `uc-e2e-011-refund-callback-adv.proof.ts` / `uc-e2e-011-nhp-load.proof.ts`（风暴幂等）/ `_neg-harness.ts`（`:53` `PAY_PROVIDER_SECRET` 单源·`:61-62` 两键自删）→ 在飞姊妹卷 `harness/webhook-neg-REQUEST.md`（分支 `line/webhook-neg-draft` @`a095cad3d`·主线未并·只读旁证）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`e2e-requirement-coverage-matrix.md` §1.0.1 **`:119`** 行 UC-E2E-014/026 **FAULT cell 残余亚层**（fresh 亲读逐字·见认领核对表值差承登）；②§1.0.2 **`:179`** 行工具列现势读法；③`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证）；④协调方派单（总盘 R9·docs-only 起草·认领 FAULT cell 残余）；⑤结构范本=`harness/webhook-neg-REQUEST.md`（同 cell 姊妹卷·§0-§9 形制）+ `harness/nhp-batch-c-REQUEST.md`。

---

## 认领核对（fresh 行号亲点 @`ca7ca748`·逐 cell 亲读·零重叠核对）

| 行号（tip 亲点） | 行原文关键值（逐字） | 现列值 | 本刀认领 |
|---|---|---|---|
| 矩阵 §1.0.1 **`:119`** | `UC-E2E-014 / 026 ｜ partial ｜ partial ｜ partial（入账幂等）｜ gap（NHP-014-ADV-01 真证据已落…C1–C7 全绿 47 断言…）` | **NEG=partial · FAULT=partial · BOUND=partial（入账幂等）** · ADV=gap（Line K 钉·列措辞不动） | **FAULT cell 残余亚层**（故障注入面·具名 case 1·格值零翻·仅随 EXEC 收据 additive 注记·EXIT0=case≠covered） |
| 矩阵 §1.0.2 **`:179`** | `UC-E2E-014 / 026 ｜ 支付 webhook 幂等 / 错签 ｜ full.e2e.ts…；neg:commerce；commerce:prove；uc014:webhook-adv ｜ partial ｜ 主路径 covered-ish…` | 旁证集在列·**partial** | 工具列 additive 注记（新 prove 命令随 EXEC 收据呈报·格值 partial 保留） |
| 矩阵 **`:117`**（UC-011） | refund-callback 面：Path A 41/41 + 主口 ADV 68/68 + **NHP-011-LOAD-w-01 执行收据**（批 B·EXIT=0 双 fresh · 16 并发恰 1×refunded+15×already / 跨单同流水 4 单恰 1×refunded+3×409 / 负路径 120 全 403/400） | 行=partial · ADV=gap/case-only | **零重叠亲证**：uc011 面=refund 口 400/403/404/CAS/409/200 全族+跨口重放+**足额**桶下风暴幂等——本刀认领的是**红冲不足回滚面**（桶态故障注入）·零臂落入该面（分界见下） |
| case-matrix §1.2 **`:63`** | `NHP-014-ADV-01 ｜ 014/026 ｜ ADV ｜ api ｜ webhook 重放/篡改七类 ｜ 幂等+拒 ｜ gap→case-only ｜ 错签 403 partial 仅子集` | 主线 014 域唯一 case 行·已收 ADV | **§1.2 一新行**随 EXEC 补登记：`NHP-014-FAULT-01`（`:63` 邻区 additive·与在飞 webhook-neg 两新行同区·merge additive 直并·Ban 触既有行） |
| **派单令值差承登** | 派单令原文「矩阵 UC-014/026 行 FAULT cell（fresh 行号亲点·**gap**）」 | fresh 亲读 = **partial 非 gap** | **如实承登行值差**：partial 系 §1.0.1 卷头令「下列 partial 只继承 §1.1/§1.2 已登记的负路径/失败族/越权 prove，不是新发明的 covered」之继承格值（≠covered·非本刀发明）——本刀照实认领该 cell 残余亚层·**Ban 就地改格值**（翻面权归协调方·pin「row/格值不动」承） |

**与已钉/在飞面零重复申明（逐臂对码·每条亲读非推定）**：

- **已覆盖（本刀零申明）**：
  1. **并发双写冲突路径（23505 savepoint 面 `payment.ts:89-94`/`:140-145`）已被三面钉**——pay 口并发双回调 exactly-once（`neg-commerce.proof.ts:466-479` pay 块 / `:558-569` webhook 块）·**跨单同流水 409**（`:570-584`——即 23505→`ROLLBACK TO SAVEPOINT`→conflict 本体行使）·refund 口跨单（`uc-e2e-011-refund-callback-adv.proof.ts` A5 `:332-339` + `uc-e2e-011-refund-callback-mouth.proof.ts` M2x `:213-219`）·风暴幂等（`uc-e2e-011-nhp-load.proof.ts`·16 并发 1×refunded+15×already / 4 跨单 1+3×409）——**本刀零臂落入·Ban 重铺（wash）**；
  2. **生命周期 409 族（在飞 webhook-neg BOUND case·EXEC 落卷 22 断言 EXIT=0·post 期）**——B3 refund-on-created / B4 pay-on-refunded / B5 退款后原支付流水重放 409 / B6 refund 换流水二次——全族走 **CAS rowCount=0 → 回读 `:183-188`** 路径·**不进红冲块**——与本书缝（CAS 命中 `rowCount=1` 后红冲不足→savepoint 回滚 `:173-178`）**机制路径互斥·零臂重叠**（分界钉：**BOUND=进不了红冲的 CAS 不中族 · FAULT=进了红冲但桶不足的回滚族**·共享 409 `order_conflict` 码面但机制/断言面不同——BOUND 断言未触态零副作用·FAULT 断言**已写态被回滚撤销**）；
  3. **足额红冲成功面已钉**——`uc-e2e-011-refund-callback-mouth.proof.ts` M1/M2（`:185` sum −10 / `:200` 无双退）+ `uc-e2e-011-refund-callback-adv.proof.ts` A3/A4（`:292`/`:315`）——其桶种子恒足额（`:94`/`:164` `units_total=x.units` 与订单等值）——本书缝=**不足红冲回滚面**（补集非重铺）；
  4. uc014-adv C1–C7（ADV 七类）·neg-commerce 验签/重放/换流水族——零触零借。
- **派单令三问逐答（产品面侦察结论）**：
  1. **persistTraceBestEffort 式 best-effort 面：commerce 链零类似缝（如实报告·零 case）**——webhook 链=纯事务形（验签 `:126`/`:152` → 网关 owner `:127-129`/`:153-155` → `asPrincipal` 单事务 CAS+落桶 `:137-138`/`:163-164` → HTTP 映射 `:139-140`/`:165-166`）·commerce 模块 grep `.catch(`/`setImmediate`/`outbox`/`GuardrailHit` **0 命中**亲证·全树唯一同形 best-effort 旁路=`packages/ai-runtime/src/invoke.ts:524` `persistTraceBestEffort`（调用点 `:1206/:1210`·UC-028 fail-open 域 blob `f6102433` 亲证）——commerce 侧**无故障可注的旁路缝**；「审计后置未接线」residual 已由 NHP-014-ADV-01 nail 具名携带（GuardrailHit 0 emit 点·矩阵 `:119` ADV 格注在卷）·非本刀面·**Ban 发明旁路断言**；
  2. **savepoint 回滚路径（红冲不足→conflict）**：**有缝·全树零臂·本刀认领**——`payment.ts:146-172` FIFO 逐桶 claw（`:164-170` 守卫 UPDATE）·总可用 < need → `remaining>0` → **`ROLLBACK TO SAVEPOINT payment_refund_txn_claim` `:175` + RELEASE `:176` → return 'conflict' `:177`** → `refundWebhook` `:166` → **409 `order_conflict`**·注释 `:174`「不静默半退」——全树 proof grep「红冲不足/insufficient」**0 命中**（仅 entpay DEFINER 预留 402 面 `entpay-s2-preverify.proof.ts:274-286` 与消费 402 面 `neg-commerce.proof.ts:587-631`·异域异管道）；
  3. **并发双写冲突路径**：已被钉（上 1）→ **wash 零申明**（§1.3 否决留痕）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`ca7ca748`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **39 树**实测——`meetwise-webhook-f` 恰 1 命中=本席（`line/webhook-fault-draft` 唯一）；`harness/` 落卷前 `webhook-fault` **零命中** → 落卷后唯一同名卷=本卷。**零碰撞**：`git grep 'NHP-014-FAULT'`/`uc014:nhp-fault` 对 `origin/main`+`line/webhook-neg-draft`+`line/pay-neg-draft`+`line/loadw-exec`+`line/uc31-draft` 五 ref 亲跑 **0 命中**。
- **主仓 checkout 停旧位**（主仓仓根 checkout 本地 main @`47dd6be56` #122 旧并·落后 origin/main）——本刀零触主仓·基线=派单令原文 `origin/main ca7ca7488`。
- **在飞线逐树亲读**（`git log -1` + `git diff --name-only ca7ca7488...<branch>`）：
  - `line/webhook-neg-draft` @`a095cad3d`（**同 cell 姊妹刀**·EXEC 落卷 `executed:awaiting_post_prove_dual`·post 期在飞）——触面=矩阵+case-matrix+`webhook-neg-REQUEST.md`+两 proof（`uc-e2e-014-nhp-neg/bound.proof.ts`）+双 package.json+runner+**两 policy .mjs（cap 已承登 2413·CAP-SANCTION-2413）**+两收据；与本刀起草 commit 共享=**两 policy .mjs**（cap 步进）·与本刀 EXEC 期共享=双矩阵邻区（additive 直并）——**cap 并线序敏感如实承登**：本支起草届值 2410→2411·彼支已承登 2413——若彼支先并主线则届值 cap=2413·本刀 EXEC 面按届时合并树实测恰等重算（协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」）·**Ban 就地多放**。
  - `line/loadw-exec` @`62f75399d`（LOAD worker 收官刀在飞）——case-matrix NHP-015-LOAD 行邻区·与本刀 EXEC 期 `:63` 邻区新行同文件——merge additive 直并·逐件复核。
  - 其余在飞线（pay/uc31/x16/x33/rag02/mop03/qfix 等）触面与本刀零交集亲证。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 commit 触面=**恰 3 tracked**（本卷 .md + `scripts/ai-docs/public-text-policy.mjs` + `scripts/ai-docs/public-text-policy.proof.mjs`·cap 步进预授权行使·见 §2-1/§2-3）；对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `ca7ca7488` 之后新增提交且结论受疑 → 停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·8 hex·行数 wc -l）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `feba0404`（521） | **§1.0.1 `:119`（014/026 NEG/FAULT/BOUND partial·ADV gap）·`:117`（UC-011 refund 面 41+68+LOAD）**·§1.0.2 **`:179`**（014/026 工具行）·§1.0.3 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `a0d37fbf`（204） | **§1.2 `:63` NHP-014-ADV-01（014 域唯一主线行）·`:57-62` 011 六行（LOAD/PERF 收据在列）** |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-014 `:518-526`（异常流/幂等族 `:522`·TC `:526`）· UC-026 `:528-546`（后置「非法回调零副作用」`:539`·TC `:544-546`） |
| `packages/db/src/commerce/payment.ts` | `15d7887a`（189） | **`markOrderPaidAndCredit :65-109`（CAS `:77-87` · savepoint 23505→conflict `:89-94` · 落桶 `:99-101` · 回读 `:105-108`）**· **`markOrderRefunded :122-189`（CAS `:130-139` · savepoint `:127` · 23505 `:140-145` · 红冲桶选择 `:151-158`（avail>0 过滤 `:156`·FOR UPDATE·FIFO `:157`）· 逐桶 claw `:160-172`（守卫 UPDATE `:164-170`·rowCount 判定 `:171`）· **不足回滚 conflict `:173-178`（`:174`「不静默半退」）** · 回读 `:182-188`）**——与 webhook-neg 卷 §0.1 blob 逐值恰等=**机制零漂** |
| `apps/api/src/modules/commerce/commerce.service.ts` | `f55d414c`（292） | `:15` 窗常数 · `:26-36` `verifyCommerceSig` 单源 · `:125-142` `payWebhook`（conflict→409 映射 `:140`）· `:151-168` `refundWebhook`（**conflict→409 `:166`**）· `:112-116` `bucketForOrder` |
| `apps/api/src/modules/commerce/commerce-webhook.controller.ts` | `2b976602`（25） | `:12-17` `POST /commerce/webhook/pay/:id`（无登录态）· `:20-24` `refund/:id` |
| `apps/api/src/modules/commerce/payment-callback.controller.ts` | `37b8af46`（35） | `:24-34` `POST /payment/refund-callback`（白名单四字段 `:26-31`·缺 orderId 400 `:32` 先于 HMAC） |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（485） | `:93-105` `entitlement_bucket`（`units_total/reserved/consumed numeric(12,2)`·`ck_bucket_capacity :104` `reserved+consumed<=total`——种子 4.00/5.00 合法·consumed=total 零可用形合法） |
| `packages/ai-runtime/src/invoke.ts` | `f6102433`（1250） | `:524` `persistTraceBestEffort`（调用点 `:1206/:1210`·UC-028 域）——best-effort 三问对码锚（commerce 侧零类似缝旁证） |
| `scripts/ai-docs/public-text-policy.mjs` | `596d4017`（469） | `:171` `MAX_FILES = 2_410` · `:165-170` 步进链注记——本 commit 步进 2411（§2-1） |
| 旁证（零触只读） | `neg-commerce.proof.ts`=`23418272`（687）·`uc-e2e-014-026-webhook-adv.proof.ts`=`419c15a7`（296·壳行种子先例 `:105-115`）·`uc-e2e-011-refund-callback-mouth.proof.ts`=`b3301f62`（243·足额红冲 `:185/:200`·桶种子 `:94`）·`uc-e2e-011-refund-callback-adv.proof.ts`=`c9ba96b6`（474）·`uc-e2e-011-nhp-load.proof.ts`=`933f4bce`（219）·`_neg-harness.ts`=`9768b323`（330·`:53` 密钥单源·`:61-62` 两键自删） | 零重叠对码基面（认领核对节逐行号亲读） |

### 0.2 码面锚（注入缝 · 按 case 分列 · symbol 级位移按 symbol 重钉）

**Case · `NHP-014-FAULT-01`（矩阵 `:119` FAULT cell 残余 · 红冲不足→savepoint 回滚族）**

| 锚 | 钉位 | 现证据缺口（零臂亲证） |
|---|---|---|
| `payment.ts:130-139` + `:146` | 红冲前提：CAS 命中（`rowCount=1`）→ 进红冲块 | 现树全部 refund 409 臂系 CAS **不中**族（BOUND/uc011 lifecycle 面）——「CAS 命中后失败」面全树零臂 |
| `payment.ts:151-158` | 桶选择：`avail>0` 过滤 `:156` + `FOR UPDATE` + FIFO `:157` | **零可用形零臂**（全桶 `units_reserved+units_consumed=units_total` → 空桶集 → 立即不足）——uc011 桶种子恒足额（`:94`/`:164` 与订单等值） |
| `payment.ts:160-172` | 逐桶 claw 守卫 UPDATE `:164-170`（`avail>=take` + `reserved+consumed<=total-take` 谓词）+ `rowCount===1` 判定 `:171` | **多桶部分红冲后不足零臂**（部分 claw 已写入 → 仍不足 → 回滚撤销全部部分写入） |
| `payment.ts:173-178` | **缝本体**：`remaining>0` → `ROLLBACK TO SAVEPOINT` `:175` + RELEASE `:176` → `'conflict'` `:177`（`:174`「不静默半退」） | **零臂**（全树 proof grep 红冲不足/insufficient 0 命中·仅 entpay 预留 402 / 消费 402 异域异管道） |
| `commerce.service.ts:166` | `conflict` → **409 `order_conflict`** 口层映射（红冲回滚路径特有的映射行使·非 lifecycle 回读路径） | 口层零臂（现 409 臂全经 `:183-188` 回读族） |
| `0001_baseline.sql:93-105` | 故障注入可行性：`numeric(12,2)` · `ck_bucket_capacity :104` | 种子形合法亲证（4.00/5.00 两桶过 CHECK·consumed=total 零可用形过 CHECK） |
| `e2e-scenarios.md:518-526`/`:528-546` | 需求源：UC-014 异常流/幂等族 + UC-026 后置「非法回调零副作用」`:539`——**期望口径=确定性 409 + 全量回滚零副作用·非 invent**（`payment.ts:174` 产品注释自钉） | — |

### 0.3 认领 cell 登记（行号+case 名+缺列·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **矩阵 `:119`** | **UC-E2E-014 / 026**（支付 webhook 幂等/错签） | NEG=partial · **FAULT=partial** · BOUND=partial（入账幂等）· ADV=gap（Line K 钉不动） | **FAULT cell 残余亚层**（具名 case·格值零翻·additive 注记随 EXEC 收据·EXIT0=case≠covered）；NEG/BOUND 归在飞 webhook-neg 卷·ADV 已钉 Line K·PERF/LOAD 留后刀 |
| **case-matrix §1.2 `:63` 邻区** | `NHP-014-FAULT-01` | **零行**（§1.2 亲证主线 014 域仅 ADV 一行·在飞两新行分支内未并） | EXEC 补一新行（gap→case-only 措辞·锚随收据·邻区 additive） |

---

## §1 修法（一 cell 一 case · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**（沿 `uc014:nhp-neg/nhp-bound` 姊妹卷及批 A/B/C `nhp-*-prove` 族先例）：新 proof `apps/api/test/uc-e2e-014-nhp-fault.proof.ts` + root `package.json` 双行（`uc014:nhp-fault:prove`/`:raw`）+ `apps/api/package.json` script 一行 + runner 注册位（`scripts/run-e2e-isolated.mjs` **五位全登记**：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单/resource-caps 条件——位5 resource-caps 非 PERF 不适用承登）+ egress 环境引用登记（additive·**零新增条目预期**·七词面 grep 0 命中承登）· 证据层沿 uc011-load 形（`boot()` 进程内真栈·`_neg-harness.ts:53` `PAY_PROVIDER_SECRET` 进程环境单源·零 live 模型零 MODEL_API_KEY）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**。行/列状态一字不动：EXIT0=case≠covered·coveredCount=8 不变。

### Case · `NHP-014-FAULT-01`（矩阵 `:119` FAULT 残余 · `apps/api/test/uc-e2e-014-nhp-fault.proof.ts`）

- **需求源**：`e2e-scenarios.md:518-526`（UC-014 异常流/幂等族）+ `:539`（UC-026 非法回调零副作用后置）——本 case=**回调写路径内故障注入证据层**（桶态故障→savepoint 回滚确定性），非七类重铺非并发重铺。
- **前置**：壳行种子 `payment_order`（'created' PC 单 / 'paid'+provider_txn 预置故障单·`419c15a7:105-115` 先例形）+ 桶种子 `entitlement_bucket`（F2 两桶 4.00/5.00 / F3 consumed=total·`b3301f62:94`/`c9ba96b6:164` 先例形）——§5 豁免枚举①②具名·枚举外零裸 INSERT。
- **臂**（拒臂全程五面快照 before/after 恒等：status / provider_txn / refund_provider_txn 全局行数 / 桶 units_total 合计 / 全局 refund 流水行数）：
  - **PC = 管道活性对照（non-claim）**：'created' 壳单经产品口 pay → 200 `credited`（桶经产品路径 `:99-101` +10）→ 合法签 refund → **200 `refunded`**——仅证 harness 管道非假阴性（成功红冲面=`uc011` M1 已钉·本臂 zero claim·Ban 借 PC 宣成功面新证据）；
  - **F1 = 零桶形**：'paid' 壳单（provider_txn 预置）+ owner **零桶** → 合法签 refund → **409 `order_conflict`**（非 500·非 200 already）+ 快照恒等（status='paid' 不变·refund_provider_txn 全局 0 行·桶零行）；
  - **F2 = 多桶部分红冲不足形（缝本体）**：'paid' 壳单 + 两桶种子 4.00/5.00（总 avail 9.00 < order.units 10.00）→ 合法签 refund → **409 `order_conflict`** + 快照恒等：**两桶 units_total 逐值恢复 4.00/5.00**（部分 claw 已写入的扣减被 `:175` savepoint 回滚撤销·**零半退** `:174`）+ status='paid' + refund_provider_txn 0 行；
  - **F3 = 零可用形**：'paid' 壳单 + 桶种子 units_total=10.00 / units_consumed=10.00（avail=0 → `:156` 谓词过滤出桶集）→ 合法签 refund → **409** + 快照恒等（桶行零触）。
- **非替代申明**：在飞 BOUND（CAS 不中 lifecycle 族）·uc011 mouth/adv（足额红冲成功面+refund 口 400/403/404 全族）·NHP-011-LOAD（足额桶下并发风暴幂等）·neg-commerce（pay 口并发/跨单）·uc014-adv C1–C7 = 旁证互不替代互不借用 · **Ban 借 F 臂宣「退款失败自动重试已证」**（`:174-178` 面无重试语义·conflict 即确定性终态回应·重试归 PSP 侧·Ban 发明）· **Ban 借 F 臂宣全量退款正确性**（本 case 只证不足路径的回滚完整性·非退款业务正确性背书）。

---

## §1.3 否决表（落选缝/落选臂诚实留痕 · 含停止条件登记 · 与认领核对互补）

| 落选项 | 否决理由 |
|---|---|
| **并发双写冲突面（23505 savepoint `:89-94`/`:140-145`）** | 三面已钉（neg-commerce `:466-479`/`:558-569`/`:570-584` + uc011 A5/M2x + NHP-011-LOAD 风暴）——重铺 **wash 零信息增量**·不申明。 |
| **best-effort 旁路注入 case（派单令第一问）** | **零缝**：commerce 链纯事务形·模块 grep `.catch(`/`setImmediate`/`outbox`/GuardrailHit 0 命中·全树唯一同形=`invoke.ts:524`（UC-028 域）——**Ban 发明旁路断言**；审计后置 residual 归 ADV nail 携带非本刀面。 |
| **pay 侧原子性注入臂**（CAS 命中 `:77-87` → 落桶 `:99-101` 失败 → 事务 abort「不留 paid 未发权益」`:61`） | **无可达确定性注入缝**：落桶系新行 INSERT（reserved/consumed=0 恒过 `ck_bucket_capacity :104`）·**owner_user_id 无 FK（0001:93-105）+owner 经网关函数自 payment_order 行解析恒存在——失效点集为空** → **停止条件登记**（同 webhook-neg §1.3 中间态臂先例形）·Ban 发明不可达断言。（P3-1 措辞修订已落·r1 席2 随令·EXEC 期顺手履行·机制事实亲证：0001_baseline.sql:93-105 entitlement_bucket.owner_user_id 无 REFERENCES·commerce.service.ts:127-129/:153-155 网关函数解析） |
| **企业桶 kind 过滤 × 不足交点臂**（`markOrderRefunded` `bucket.kind='enterprise'` 形） | entpay/B271 域（`entpay-s2/s3.proof.ts` avail 形在树 `:129`/`:148`）——本刀仅 C 端形（bucket 缺省 → `$2=NULL` 谓词恒真 `:155`）·**Ban 跨域**·该交点若 B271 线未测归该线裁量。 |
| **claw 守卫 rowCount=0 竞态臂**（`:171` 判定失效形） | `numeric(12,2)` 下 `take=Math.round(min(avail,remaining)*100)/100` 锐缘不可达（2dp 精度无亚分尾数·守卫谓词同事务内恒真）+ `FOR UPDATE` 行锁下并发收缩非确定性可注 → **停止条件登记**。 |
| **fulfilled/refunding/fulfill_failed 中间态臂** | 状态机 targets（`e2e-scenarios.md:522`）非现网 webhook 可达态（`payment.ts` 两 CAS 仅 created/paid/refunded 三态亲证·同 webhook-neg §1.3 否决）——**Ban 发明不可达断言**。 |
| **014 域 PERF/LOAD 面** | 留后刀（同 webhook-neg §1.3·NHP-011-PERF-api-01 同管道重载 wash）。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check + cap 预算核（亲算·预授权步进本 commit 已行使）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2410** · cap=**2410**（`:171` 亲证）**恰达零余量** → 本卷新 .md +1 必越限 → **派单令「届值·越限沿先例步进承登预授权」本 commit 行使**：`MAX_FILES 2_410→2_411`（+1 恰等零多放·CAP-SANCTION-2411 承登两 .mjs）+ 越限臂四值联动（proof `:375`→`2_411` · `:382`→`2_411` · `:385`→`f-2411.md` · `:390`→`:2412`）+ `public-text-policy.proof.mjs` 本树亲跑 **12/12 EXIT=0**。预期起草后 **scanned 2411 = cap 恰达**。**EXEC 期并线序敏感承登**：在飞 webhook-neg 分支已承登 cap 2413——届时以合并树实测为准恰等重算（常设预授权）·**Ban 就地多放**。
2. **markers 五类零命中 + est live=0**：本刀改动集（3 tracked）五类标记词 + 冲突标记 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked**＝①本卷 .md ②`scripts/ai-docs/public-text-policy.mjs`（cap +1+注记）③`scripts/ai-docs/public-text-policy.proof.mjs`（联动四值+注记）——多任何未登记 tracked 路径即停。EXEC 期 diff 面=本卷+新 proof+注册行（root/apps/api package.json）+runner 五位+egress inventory additive+双表行内改（矩阵 `:119` FAULT 格 additive 注记+case-matrix `:63` 邻区新行）+收据 tracked 面——届时逐件登记·多任何未登记路径即停。
4. **EXEC 预基面（届时重 pin）**：隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退（`neg:commerce` / `uc014:webhook-adv` / `uc011:refund-callback` 恒等绿；`uc014:nhp-neg`/`uc014:nhp-bound` 若届时已并主线则并入恒等集·未并则如实登记跳过不硬跑）· 双表同步 diff 逐件登记（§1.0.3 令）· 期望值对 §0.2 逐臂对码（**臂收据与 §1 推定形不符即根因诊断被证伪**·UC-019 静态推定错防线）· 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:119`/`:179` 与 case-matrix 对应格仅允许 additive 注记（FAULT **partial 格值零翻**·coveredCount=8 零翻转）· Ban 借收据互 wash（FAULT≠BOUND≠NEG≠uc011 面≠LOAD 面≠uc014-adv 面）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增一 test proof 文件+注册行+runner 注册位·沿 uc011-load/批 C nhp 族 prove-only 先例）。
2. **已钉面零触**：uc011 触面（`:117`）· uc014-adv 文件 · neg-commerce.proof.ts · 批 A/B/C 触面 · 在飞 webhook-neg/loadw 触面——全部只读；`provider-egress-inventory.json` 系共享 additive 登记面不在零触之列。
3. **其余 §1.0 行零触**：`§1.3` 落选项全部只读；NEG/BOUND（在飞姊妹刀）/ADV（Line K 钉）/PERF/LOAD 零申明。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支** · **零迁移零配置**（Ban 新迁移 Ban 触告警/CI 配置·零 .env 触）。

## §4 依赖

**①上游已满足**：savepoint/红冲缝全在树（§0.1 blob 亲算·与姊妹卷机制零漂）+ `boot()` 真栈先例（uc011-load `933f4bce`）+ 壳行/桶种子先例（`419c15a7:105-115`/`b3301f62:94`）。**②同文件并发**：起草 commit 触 policy 两 .mjs——webhook-neg 在飞同面（§0.0 逐树登记·merge additive 取大直并·届时 merge-tree 预演）；EXEC 期 case-matrix `:63` 邻区与 webhook-neg 两新行/loadw 行同文件——同规则。**③下游**：FAULT cell 收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 动主仓；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 partial/借旁证 wash/跨列 wash）；Ban live key（零 Key 面硬跑）；Ban 触 uc011/uc014-adv/neg:commerce/批 A/B/C/webhook-neg/loadw 触面与其余 §1.0 行；Ban 触产品码面/迁移/CI 告警配置（cap 值步进系派单预授权例外·恰等 +1 承登·Ban 就地多放）；Ban 改共享 SSOT；Ban 触既有 proof 文件（零触只读引用）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·**枚举完备**：壳行种子 `payment_order`（'created'/'paid'+provider_txn 预置·`419c15a7:105-115` 先例形）+ 桶种子 `entitlement_bucket`（F2/F3 故障桶态·`b3301f62:94` 先例形）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 借 F 臂宣「退款失败重试已证」/「全量退款正确性背书」/ 借 PC 宣成功面新证据（三重披露钉）；Ban 把 FAULT cell partial 格值按派单令「gap」就地改写（fresh 亲读值差如实承登·翻面权归协调方）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（cap 步进两 .mjs 系纯文面+本树 proof 机检·零外呼）（EXEC 期 case 全离线隔离·`boot()` 进程内真栈零 drain 零模型·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（3 tracked·起草 turn）五类标记词（四标记词面+冲突标记·词面运行时组装口径 `i6-239-gates.proof.mjs:159-163` 亲读·**本卷零字面复抄防自匹配**）+ 行首冲突标记 grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕——沿批 B/C 与姊妹卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `closed:post_prove_dual_pass`（2026-10-27 post 落卷三处翻面·三处钉：本节 + Status 头 + 卷尾注·原值 `executed:awaiting_post_prove_dual` 史录不洗）· post-prove 双审两独立外席双 PASS 会签已落卷 §9-post（席1 逐臂对码+六门独立复跑 22/22/22/41/47/90+re-pin 八 blob+P2×2 · 席2 资金面独立推演三机证+主门 fresh 22/22+邻门两套 uc011 41/neg:commerce 90+P3-O1）· 后继=并线席 fetch/merge/push/PR（停止条件四类仍对各在飞 step 适用·命中即停手上报·Ban 就地处置）。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（FAULT cell 格值被改写 · `markOrderRefunded` savepoint/红冲块被重构 · webhook-neg 并线改写 `:119`/`:63` 邻区归属）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期臂收据与 §1/§0.2 推定形不符（如 F2 桶值未恢复恒等（半退）· F1 返 200 already 或 500 · F3 零可用臂非 409 · PC 非 200）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case 面（需触产品码/已钉族/covered 翻面/共享 SSOT/迁移/cap 多放）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 越限且无并线 sanction / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

现值 **`closed:post_prove_dual_pass`**（2026-10-27 post 三处翻面·全链 `draft:awaiting_pre_exec_dual`→pre-exec dual r1 双 PASS→协调方 EXEC 授权→§9-EXEC 落卷→§9-post 双审双 PASS·史录不洗）· 起草 commit=本卷 .md + cap 步进两 .mjs（恰 3 tracked）· EXEC 落卷=case proof+注册（runner 五位+双 package.json）+双表 additive+P3-1 措辞修订+cap 并线恰等步进两 .mjs+收据· post 落卷=§9-post 双席双 PASS（六门超额复跑+三机证+re-pin 八 blob+P2×2/P3-O1 残余登记）· 后继=并线席 fetch/merge/push/PR → 翻面权归协调方。

---

## §9-EXEC 落卷（2026-10-27 EXEC 席·协调方授权行使·pre-exec dual r1 双 PASS 在前·r1 席2 P3-1 随令顺手履行·断言/门矩阵 EXIT 原值/重 pin 落点/attempts 台账如实全录）

### 9.0 立项并线与全量重 pin（§8 履行·届值如实采）

- **并线**：`git fetch origin` 本 turn 亲跑 EXIT=0 · 届值 origin/main **`124a3053e`**（**#160/#161 已并线落 main 如实采**——含 #159 webhook-neg 收官（NEG/BOUND 两 case+双表 additive+cap 2413 系已并）+#157 perf3-receipts+uc003x 残面 post 收官（cap 2413→2415→**2418** 恰等步进在 main·CAP-SANCTION-2418 在链亲读）——派单令「届值含 #160/#161 在飞」对届值前移如实承登）· merge 两 policy .mjs 双改冲突（本支 2411 vs main 承 2418）→ 常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令 dual-keep+恰等步进解决（注释 dual-keep 双留·**合并树实测亲跑 check-docs scanned 2419=2418+本卷 REQUEST 1 恰等·先手步进 cap 2418→2420**=2419+本刀 EXEC proof 1 件受管·**CAP-SANCTION-2420 承登两 .mjs**·越限臂 fabricated 数 2_420/2421 联动·沿 2413→2415/2416→2418 先例形）· merge 落 **`a2825050b`** · `pnpm install --frozen-lockfile` EXIT=0（3.6s lockfile 零漂）。
- **§0.1 blob 锚重 pin（merge tip `a2825050b` 亲算）**：机制源**零漂**（payment.ts `15d7887a`(189)/commerce.service `f55d414c`(292)/webhook-ctrl `2b976602`(25)/payment-callback `37b8af46`(35)/0001_baseline `d68f8dd0`(485)/e2e-scenarios `9976f9c3`(648)/invoke.ts `f6102433`(1250) 与 §0.1 逐值恰等·旁证六面 `23418272`/`419c15a7`/`b3301f62`/`c9ba96b6`/`933f4bce`/`_neg-harness 9768b323` 逐值恰等=机制零漂·停止条件未触发）· 文档锚漂移如实更：矩阵 `feba0404`→**`49224a05`**（521 行同·§1.0.1 `:119`/§1.0.2 `:179` 行号未漂·内容=webhook-neg NEG/BOUND additive 注记已并·**FAULT 格仍纯 partial 零翻亲证**）· case-matrix `a0d37fbf`→**`b3611bc2`**（204→210 行·§1.2 NHP-014 三行 `:63`-`:65`（ADV/NEG/BOUND）·本刀新行插 `:65` 邻区）· `:117` UC-011 refund 面行零触亲证。
- **机制缝逐值亲读（§0.2 对码）**：markOrderRefunded SAVEPOINT `:127`/CAS `:130-139`/桶选择 avail>0 过滤 `:156`+FOR UPDATE+FIFO `:157`/逐桶 claw 守卫 UPDATE `:164-170`/`remaining>0`→ROLLBACK `:175`+RELEASE `:176`→'conflict' `:177`（`:174`「不静默半退」）/refundWebhook conflict→409 `:166` 逐值在位零漂。

### 9.1 egress 零条目形 + 落码与门矩阵亲跑（EXIT 原值·stdout 留痕）

- **egress（零新增条目预期如实登记为零条目形）**：新 proof `import { boot, paySig } from './_neg-harness'` 进程内真栈·回调密钥只经 boot() 进程环境单源·两模型环境键 harness 内自删（两键继承）· **proof 文件零环境变量词面**（policy environmentNames 全表 **40 词面 grep 0 命中**亲证·零含词→零登记义务）· `provider-egress-inventory.proof.mjs` **EXIT=0 · environment_references=382 届值恒等零新增**——PAY_PROVIDER_SECRET 未新增入 environmentReferences（不在扫域·§0 令原文亲证·Ban 新增登记履行）。
- **docker info 亲证**：EXIT=**0**（Server 29.5.2 · cpus=2 · colima 容器可用·receipt `ai-docs/delivery/receipts/nhp-014-fault-01/03-gate-static.stdout.log`）。
- **NHP-014-FAULT-01**（`apps/api/test/uc-e2e-014-nhp-fault.proof.ts`·`pnpm uc014:nhp-fault:prove`）：**EXIT=0 · 22 断言全绿·attempts=3,0 首跑绿**（fresh×2+收据跑全绿零红次）· 臂收据与 §1/§0.2 推定形逐值相符（**机制推定未被证伪**）：PC 管道活性对照 5 断言（pay 200 credited+壳行转 paid+产品路径落桶恰 1 桶 +10+合法签 refund 200 refunded+终态 refunded 落列·non-claim zero claim）· F1 零桶形 6 断言（夹具零桶自证+合法签 refund→**409 `order_conflict`**（非 500 非 200 already）+五面快照恒等 status 恒 paid+refund_provider_txn 全局 0 行+桶零行恒等——CAS 命中 rowCount=1 后空桶集→`:175` 回滚→`:177` conflict→`:166` 口层 409）· F2 多桶部分红冲不足形 6 断言（夹具两桶 4.00+5.00=9.00<need 10 自证+409+**两桶 units_total 逐值恢复 4,5 恒等**（部分 claw 已写入被 `:175` savepoint 回滚撤销·零半退 `:174`）+桶行无半退残迹（reserved/consumed/version 恒 0/0/0·种子已提交行不在 savepoint 内）+五面快照恒等+refund_provider_txn 全局 0 行）· F3 零可用形 5 断言（夹具 total=10.00/consumed=10.00 过 ck_bucket_capacity `:104` 自证+409（`:156` avail>0 谓词过滤空桶集）+桶行零触（total/consumed/version 恒等）+五面快照恒等+refund_provider_txn 全局 0 行）· 种子=§5 豁免枚举①②具名（壳行 'created' PC+'paid'+provider_txn 预置×3·桶种子故障态×3 行）枚举外零裸 INSERT）· tracked receipt `ai-docs/delivery/receipts/nhp-014-fault-01/01-gate-uc014-nhp-fault.stdout.log`。
- **attempts 台账（红次如实全录·Ban retry-to-green 承守）**：主 prove attempt1/2/3 全 EXIT=0（**零红次**）· typecheck 首跑即 EXIT=0 · lint 零新增 warning（新 proof 单文件 eslint EXIT=0 零 finding）。
- **邻面不回退（§2-4·恒等集含已并主线姊妹两套）**：`uc014:nhp-neg:prove` 复跑 **EXIT=0 · 22 断言** · `uc014:nhp-bound:prove` 复跑 **EXIT=0 · 22 断言** · `uc011:refund-callback:prove` 复跑 **EXIT=0 · 41 条** · `uc014:webhook-adv:prove` 复跑 **EXIT=0 · 47 断言** · `neg:commerce` 复跑 **EXIT=0 · 90 臂**——五邻面恒等绿零回退（receipt `ai-docs/delivery/receipts/nhp-014-fault-01/02-gate-neighbors.stdout.log`·EXIT 原值 pipestatus 留痕）。
- **机检面（§2-2/§2-3/§2-5）**：markers 五类标记词+冲突标记 grep 新 proof（运行时组装口径 `i6-239-gates.proof.mjs:159-163` 承形·本卷零字面复抄）**零命中** · typecheck `pnpm -C apps/api typecheck` EXIT=0 · api lint EXIT=0（1499=cap 恰等零步进·新 proof 0 warning 增量）· docs:check **EXIT=0 · scanned 2420=cap 恰达** · `public-text-policy.proof.mjs` **EXIT=0 · 12/12**（越限臂 2_420/2421 联动亲证）· diff 面亲读：merge commit（两 policy .mjs conflict 恰等步进+在飞并线面）+本刀 EXEC=新 proof+双 package.json+runner+双矩阵 additive+本卷 .md+三收据 log·**产品源 `apps/*/src`/`packages/*/src` 零 diff 亲证**。
- **runner 五位全登记**：位1 isolatedReceiptSources/位2 targets 名单/位3 isolatedCommand/位4 pre-migrate 名单/位5 resource-caps=PERF 专用**本刀非 PERF 不适用**（沿 webhook-neg 两行同形如实承登）。

### 9.2 双表同步（§1.0.3 令）+ P3-1 履行 + 范围外核

- 矩阵 §1.0.1 `:119` **FAULT 格 additive 注记**（格值 partial 零翻·EXIT0=case≠covered·coveredCount=8 不变·NEG/BOUND/ADV 三格零触）· §1.0.2 `:179` 工具列 additive 注记（`uc014:nhp-fault:prove` 登记·「两新」→「三新」）· case-matrix §1.2 `:65` 邻区新行 `NHP-014-FAULT-01`（**gap→case-only 措辞**·锚随收据·邻区 additive 零触既有行）。
- **P3-1 履行（r1 席2 随令顺手）**：§1.3 pay 侧否决措辞已改「owner_user_id 无 FK（0001:93-105）+owner 经网关函数自 payment_order 行解析恒存在——失效点集为空」（机制事实亲证：0001_baseline.sql:93-105 entitlement_bucket.owner_user_id 无 REFERENCES·commerce.service.ts:127-129/:153-155 网关函数解析）。
- pins 十一值零翻转（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8** · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）· uc011 触面/uc014-adv 文件/neg-commerce.proof.ts/批 A-B-C/webhook-neg/uc003x 触面零触（只读旁证亲证）· 共享 SSOT 零改·零迁移零配置零 .env 触·est live=0（全程隔离 boot() 真栈零外呼零模型零 Key 加载）·⛔push。
- **post 输入**：§9-EXEC 门矩阵全绿在卷（三处钉 `executed:awaiting_post_prove_dual`·待 post-prove 双审两独立外席·alone≠dual）→ 双 PASS 会签 → 三处钉（Status 头+§8+卷尾注）翻终态；stdout 留痕 `ai-docs/delivery/receipts/nhp-014-fault-01/`（01 主门/02 邻面五套/03 静态门）+`.tmp/isolated-proof-receipts/`（fresh 收据·gitignored 本地证据）。

---

## §9-post 落卷（2026-10-27 post-prove 双审两独立外席·协调方派单·双 PASS 会签·三处钉随本节同拍翻 `closed:post_prove_dual_pass`·原值史录不洗）

### 9P.1 席1（post-prove 独立外席·逐臂对码+六门独立复跑+re-pin 八 blob）— **PASS**

- **PC/F1–F3 逐臂对码**（`uc-e2e-014-nhp-fault.proof.ts` 逐臂 Read·对 `payment.ts:122-189`+`commerce.service.ts:151-168` 亲读·零静态推定）：PC 5 断言（'created' 壳产品口 pay→200 credited+壳行转 paid+产品路径落桶恰 1 桶 +10+合法签 refund→200 refunded+终态 refunded 落列——non-claim zero claim·Ban 借 PC 宣成功面新证据承守）✓；F1 6 断言（夹具零桶自证→合法签 refund→**409 `order_conflict`** 非 500 非 200 already+五面快照恒等 status 恒 paid+refund_provider_txn 全局 0 行+桶零行——CAS `:130-139` 命中 rowCount=1 后 `:151-158` avail>0 过滤 `:156` 空桶集→`remaining=10>0`→`:175` ROLLBACK→`:177` conflict→`:166` 口层 409）✓；F2 6 断言（两桶 4.00/5.00 合计 9<need 10 过 `ck_bucket_capacity :104` 自证→409+**两桶 units_total 逐值恢复 4,5**+reserved/consumed/version 恒 0/0/0（种子已提交行不在 savepoint 域内）+五面快照恒等+refund 流水全局 0 行——逐桶 claw `:164-170` 尽→remaining=1>0→`:175` 回滚撤销全部部分写入·零半退 `:174`）✓；F3 5 断言（total=consumed=10.00 自证→409（`:156` 过滤空桶集）+桶行零触 total/consumed/version 恒等+五面快照恒等+refund 流水 0 行）✓——断言算术 22=5+6+6+5 恰等·期望值与 §0.2/§1 逐值恰等·零断言迁就。
- **六门独立复跑（本席自带新跑·非引用 EXEC 收据·attempts=1 零红）**：`pnpm uc014:nhp-fault:prove` **EXIT=0 · 22/22** · `pnpm uc014:nhp-neg:prove` **EXIT=0 · 22/22** · `pnpm uc014:nhp-bound:prove` **EXIT=0 · 22/22** · `pnpm uc011:refund-callback:prove` **EXIT=0 · 41/41** · `pnpm uc014:webhook-adv:prove` **EXIT=0 · 47/47** · `pnpm neg:commerce` **EXIT=0 · 90 臂全绿**——六门超额全绿零回退（stdout `.tmp/post-receipts/s1-*.log` 本地留痕）。
- **re-pin 八 blob（HEAD `981964d9d` 亲算 `git rev-parse`）**：机制源七值**零漂逐值恰等**——`payment.ts 15d7887a`(189 行)/`commerce.service f55d414c`(292)/`webhook-ctrl 2b976602`(25)/`payment-callback 37b8af46`(35)/`0001_baseline d68f8dd0`(485)/`e2e-scenarios 9976f9c3`(648)/`invoke f6102433`(1250) + 本卷主 proof `79201898`(199)=**八 blob**——停止条件「现场漂移」未触发；文档锚现值如实承登：矩阵 `7a263d1c`(521 行·EXEC additive 后现值·`:119` FAULT 格注记在卷)/case-matrix `ff0b987e`(211 行·`:63-:66` 四行在卷)。
- **P2×2（残余如实登记·非阻断·翻面/定谳权归协调方）**：①**conflict 终态后同流水重试路径零独立行为臂**（F1–F3 拒臂收口后同 txn 二次 refund→CAS `:134-137` NOT EXISTS 不中（本事务写已回滚零落列）→回读 `:186-188` status='paid'≠'refunded'→conflict 409 恒等——码面亲证非行为臂·薄残余·后继触面刀搭车件候选）②**payment_order.version 快照面零独立断言**（§1 五面快照枚举不含 order 行 version——CAS `:132` version+1 与 claw `:166` version+1 均被 `:175` 回滚撤销现由 F2 桶侧 0/0/0+status/refund_provider_txn 恒等间接证·order 行 version 恒等未独立断言·薄残余）。
- **席1 裁定：PASS**（§2 门 1–5 逐门复核·逐臂对码零不符·六门超额全绿零回退·零 retry-to-green·格值 partial 零翻·coveredCount=8 不变）。

### 9P.2 席2（post-prove 独立外席·资金面独立推演+三机证+独立复跑 fresh）— **PASS**

- **机证①savepoint 域隔离**（行序亲读+复跑收据）：`:127` SAVEPOINT **先于** CAS `:130-139` 与 claw `:164-170`→`:175` ROLLBACK TO SAVEPOINT 撤销域=本事务 SAVEPOINT 后全部写（CAS+claw 两写点）→**夹具种子系先前已提交事务行不在域内**——fresh 复跑 machine-evidence：F2 两桶 units_total 逐值恢复 4/5+reserved/consumed/version 恒 0/0/0（种子行零触·若种子在域内或 claw 残留则断言红）。
- **机证②外层 COMMIT 空写集零半退机制保证**：`markOrderRefunded` 全函数（`:122-189`）写点恰二=CAS `:130-139`+claw `:164-170`·均在 `:127` 之后·`:175` 回滚后 conflict 返回→`refundWebhook :166` 抛 409→`asPrincipal` 外层事务 **COMMIT 写集=∅**→零行变更——「零半退」由机制保证非仅观察面（F1/F2/F3 五面快照恒等+refund_provider_txn 全局 0 行为其观察面亲证）。
- **机证③FIFO claw+2dp 舍入算术确定性（node 实测·非推定）**：F2 形 take₁=round(min(4,10)·100)/100=4→remaining=round((10−4)·100)/100=6→take₂=round(min(5,6)·100)/100=5→remaining=round((6−5)·100)/100=**1>0→conflict**——与 F2 臂收据恒等；F3 形 avail>0 过滤后桶集=0→零 claw 行使→conflict——`Math.round(x*100)/100` 对 2dp 桶值恒等保值（4.00/5.00 均精确可表示·零亚分尾数）。
- **独立复跑（fresh 容器新收据·非引用席1·attempts=1 零红）**：`pnpm uc014:nhp-fault:prove` **EXIT=0 · 22/22 fresh**（`.tmp/isolated-proof-receipts/2026-10-27T14-*` LOCAL_ISOLATED_PROOF_RECEIPT 在卷·release_evidence=false）+ 邻门两套 `pnpm uc011:refund-callback:prove` **EXIT=0 · 41/41** · `pnpm neg:commerce` **EXIT=0 · 90 臂**。
- **P3-O1 登记（产品语义披露级观察·非缺陷定谳·修法/翻面权归协调方）**：零桶/零可用 owner 的退款通道恒 **409 确定性终态且无重试/降级语义在树**（`:174-178` 面无重试语义·conflict 即确定性终态回应·重试归 PSP 侧——§1 非替代申明三重披露钉在卷）；F1（零桶行）与 F3（零可用过滤）两成因在口层同一 `order_conflict` 码面**不可区分**——错误语义披露级残余·登记于本节不另开 backlog 行。
- **席2 裁定：PASS**（三机证闭合+fresh 三绿收据在卷·attempts=1 零红·零断言迁就·格值 partial 零翻）。

### 9P.3 双 PASS 会签（alone≠dual → dual 成立·三处钉随本节翻终态）

- 席1 **PASS** × 席2 **PASS**＝**post-prove 双审双 PASS 会签成立**（两独立外席各自独立形成裁定·收据各自新跑互不引用·alone≠dual 已解）；三处钉（Status 头+§8+卷尾注）随本节同拍翻 **`closed:post_prove_dual_pass`**（原值 `executed:awaiting_post_prove_dual`·起草态→EXEC→post 三态全链留痕史录不洗）· EXIT0=case≠covered 口径维持·格值 partial 零翻·coveredCount=8 不变·pins 十一值零翻（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）· est live=0（两席复跑全离线隔离 boot() 真栈零外呼零模型零 Key 加载）· P2×2+P3-O1 全部残余如实登记非阻断· 后继=并线席 fetch/merge/push/PR（翻面权归协调方）。

---

*NHP-014 WEBHOOK-FAULT REQUEST · 2026-10-27 起草 · 2026-10-27 EXEC 落码落卷 · 2026-10-27 post 双审双 PASS 会签落卷 · **STOP=`closed:post_prove_dual_pass`**（2026-10-27 post 三处翻面·三处钉：Status 行+§8+本行·原值 `executed:awaiting_post_prove_dual` 史录留痕不洗）· 剩余队列 Phase2 #12 one-knife-one-row · 覆盖矩阵残余 UC-E2E-014/026 `:119` **FAULT cell 残余亚层**（格值 partial 零翻·additive 注记已随 EXEC 落卷）+ `:179` 工具行 + case-matrix `:65` 邻区新行 · 修法=恰 1 具名 case（`NHP-014-FAULT-01` 红冲不足→savepoint 回滚族：F1 零桶/F2 多桶部分红冲不足/F3 零可用·零半退快照恒等）· EXEC 收据=**EXIT=0 · 22 断言·attempts=3,0 首跑绿**（§9-EXEC 全录·egress 零条目形 382 恒等·docker info 亲证 EXIT=0）· post 双外席=席1 六门超额全绿（22/22/22/41/47/90）+re-pin 八 blob（机制源七值零漂+主 proof）+P2×2 · 席2 资金面三机证（savepoint 域隔离/外层 COMMIT 空写集零半退/FIFO 舍入算术）+主门 fresh 22/22+邻门两套（uc011 41/neg:commerce 90）+P3-O1（§9-post 全录）· P3-1 措辞修订已落（§1.3·r1 席2 随令顺手）· 零产品码触 · 与已并 webhook-neg NEG/BOUND 两 case（CAS 不中 lifecycle 族）分界钉=「进不了红冲 vs 进了红冲但桶不足」· 与 uc011 足额红冲面/NHP-011-LOAD 风暴/neg-commerce 并发跨单（23505 面已钉）零重复申明（wash 否决 §1.3）· best-effort 三问=commerce 链零类似缝如实报告（零 case·Ban 发明）· cap 步进全链=起草 2410→2411（CAP-SANCTION-2411）→EXEC 并线恰等 2418→2420（CAP-SANCTION-2420 承登·越限臂 2420/2421 联动·scanned 2420=cap 恰达亲跑）· EXEC commit=新 proof+注册（runner 五位+双 package.json）+双矩阵 additive+本卷落卷+两 policy .mjs+三收据 log · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0≠covered · releaseEvidence=false · ≠HA · 后继=并线席 fetch origin/main/merge-tree 预演/merge --no-ff/终验五门/push/PR（门红或冲突不可解即停上报）*
