# NHP-014 WEBHOOK-NEG REQUEST — 支付回调边界值臂+双口分叉两 case 起草卷·UC-E2E-014/026 NEG/BOUND 三 cell 残余面（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-27 EXEC 落卷三处翻面·原值 `draft:awaiting_pre_exec_dual` 史录不洗）· alone≠dual · **STOP=executed（三处钉：本 Status 行 + §8 + 卷尾注·两 case 门矩阵全绿在卷 §9-EXEC·待 post-prove 双审两独立外席）** · EXEC 收据=NHP-014-NEG-01 EXIT=0 · 22 断言 + NHP-014-BOUND-01 EXIT=0 · 22 断言（implementer pre-commit runs·not evidence of record·attempts 均=1）· 本 commit 不预 claim post-prove dual PASS 与任何 covered 翻面（EXIT0=case≠covered·coveredCount=8 不变）。

**席位**：NHP-014 支付回调刀起草席（docs-only 起草·总盘派单序第 5 项·一卷两 case·协调方授权·与批 A/B/C/各 UC 专属线及 line/uc011 线互斥不重叠）。
**基线**：`origin/main` @ **`961f5ef12`**（full `961f5ef1295f7abe5bce65c8d852b9a060c9faea` · `git fetch origin` 本 turn 成功 · 分支 `line/webhook-neg-draft` 零独有 commit · worktree 建树即落 tip 亲证 `HEAD is now at 961f5ef12`）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2402**（stdout「public text policy scanned 2402 managed worktree files」亲读）· cap=**2402**（`public-text-policy.mjs:157` `MAX_FILES=2_402` 亲证）——**恰达上限零余量**·本卷新文件 +1 必越限 → **越限沿先例步进承登预授权（协调方派单令原文）本 commit 即行使**：`MAX_FILES 2_402→2_403`（**+1 恰等零多放**·沿 CAP-SANCTION-2354（本卷 REQUEST +1 触顶形）与 clock-e2e `fc33c04e6`（+5 恰等）先例形·越限臂 fabricated 数随 cap 联动 `2403/2404`·承登注记 CAP-SANCTION-2403 随刀入两 .mjs）· 工作树 `meetwise-webhook`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行 `:28`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 `:44` / §1.0.1 `:119` 行 / §1.0.2 `:178` 行 / §1.0.3 双表同步令 `:165`）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.2 钱域 `:52-81` / §1.3 表 / 执行纪律 §3）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-014 `:518-526` / UC-026 `:528-546`）→ 涉事机制源 `apps/api/src/modules/commerce/payment-callback.controller.ts` / `commerce-webhook.controller.ts` / `commerce.service.ts`（`verifyCommerceSig` `:26-36`）→ `packages/db/src/commerce/payment.ts`（`markOrderPaidAndCredit` `:65-109` / `markOrderRefunded` `:122-189`）→ 唯一索引迁移 `packages/db/migrations/0020_commerce_terminal_integrity.sql:20-21` / `0136_payment_order_refund_provider_txn.sql:27-29` → 网关函数 `packages/db/migrations/0041_api_runtime_least_privilege.sql:38` → 旁证先例（全只读零触）`apps/api/test/neg-commerce.proof.ts`（webhook 族 `:483-584`）/ `apps/api/test/authz5a2-hmac.proof.ts`（HMAC 验签合一证明·静态窗常数钉值 `:44`+单测直调窗锐缘/类型形/kind 绑定行为臂 `:66/:69-78`）/ `uc-e2e-014-026-webhook-adv.proof.ts`（C1–C7·壳行种子先例 `:105-115`）/ `uc-e2e-011-refund-callback-mouth.proof.ts`（41 臂）/ `uc-e2e-011-refund-callback-adv.proof.ts`（68 臂）/ `uc-e2e-011-nhp-load.proof.ts`（17 臂风暴）→ 隔离壳先例 `apps/api/test/uc-e2e-025-nhp-bound-isolated.proof.ts` + uc011 load 的 `boot()` 进程内真栈形（`_neg-harness.ts:53` `PAY_PROVIDER_SECRET` 单源）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`e2e-requirement-coverage-matrix.md` §1.0.1 **`:119`** 行 UC-E2E-014/026 **NEG=partial / FAULT=partial / BOUND=partial（入账幂等）** 三 cell 残余（tip `48f66d68` 亲读逐字）；②§1.0.2 **`:178`** 行「主路径 covered-ish；重放/篡改七类未全铺」现势读法（`full.e2e`+`neg:commerce`+`commerce:prove`+`uc014:webhook-adv` 旁证集在列）；③`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证·批 A/B/C 同源）；④协调方派单（总盘序第 5 项·一卷两 case·docs-only 授权）；⑤结构范本=`harness/nhp-batch-c-REQUEST.md`（§0-§9 形制·`closed` 在树）。

---

## 认领核对（fresh 行号亲点 @`961f5ef12`·逐 cell 亲读·零重叠核对）

| 行号（tip 亲点） | 行原文关键值（逐字） | 现列值 | 本刀认领 |
|---|---|---|---|
| 矩阵 §1.0.1 **`:119`** | `UC-E2E-014 / 026 ｜ partial ｜ partial ｜ partial（入账幂等）｜ gap（NHP-014-ADV-01 真证据已落…C1–C7 全绿 47 断言…）` | **NEG=partial · FAULT=partial · BOUND=partial（入账幂等）** · ADV=gap（Line K 钉·列措辞不动） | **NEG+BOUND 两 cell 残余亚层**（具名 case 1/2·gap/partial 格值零翻·仅随 EXEC 收据 additive 注记·EXIT0=case≠covered）；FAULT 列不动留后刀 |
| 矩阵 §1.0.2 **`:178`** | `UC-E2E-014 / 026 ｜ 支付 webhook 幂等 / 错签 ｜ full.e2e.ts HMAC 入账+错签403+未知单404；neg:commerce；commerce:prove；uc014:webhook-adv ｜ partial ｜ 主路径 covered-ish；重放/篡改七类未全铺…` | 旁证集在列·**partial** | 工具列 additive 注记（两新 prove 命令随 EXEC 收据呈报·格值 partial 保留） |
| 矩阵 **`:117`**（UC-011） | refund-callback 面：Path A 41/41 + 主口 ADV 68/68 + 旧 18 臂基线红如实 + **NHP-011-LOAD-w-01 执行收据**（批 B·`uc011:nhp-load:prove` EXIT=0 双 fresh · 16 并发恰 1×refunded+15×already / 跨单同流水 4 单恰 1×refunded+3×409 / 负路径 120 req 全 403/400） | 行=partial · ADV=gap/case-only | **零重叠亲证**：uc011 面=refund 口 400/403/404/CAS/409/200 全族+主口↔Path A 跨口重放双向+退款风暴幂等——本刀两 case **零臂落入该面**（分界见下） |
| case-matrix §1.2 **`:62`** | `NHP-014-ADV-01 ｜ 014/026 ｜ ADV ｜ api ｜ webhook 重放/篡改七类 ｜ 幂等+拒 ｜ gap→case-only ｜ 错签 403 partial 仅子集` | 014 域唯一 case 行·已收 ADV | **§1.2 两新行**随 EXEC 补登记：`NHP-014-NEG-01` / `NHP-014-BOUND-01`（`:62` 邻区 additive·Ban 触既有行） |

**与已钉面零重复申明（逐臂对码·防静态推定错——每条均已亲读对码非推定）**：

- **已覆盖（本刀零申明）**——pay 口：`neg:commerce` `:483-584`（缺 sig/缺 ts/超窗旧 ts 400 `:507-510`·未来超窗 400 `:512-516`·伪签等长 403 `:491-494`·**短签 403（注释亲点 `a.length!==e.length` 分支 `:433` 同款 `:496-499`）**·未知单 404 `:518-521`·错 content-type 400 `:523-526`·413 `:528-533`·**owner 冒充字段忽略+签名不受扰 `:534-540`**·重放 credited/already `:541-550`·已 paid 换流水 409 `:551-557`·并发 exactly-once `:558-570`·跨单同流水 409 `:571-584`）+ `uc014-adv` C1–C7 47 臂（pay 口 WH `:39`·C1 `:121-143`/C2 `:147-161`/C3 金额夹带 `:179-189`/C4 重放 `:202-208`/C5 跨单 `:221-227`/C6 并发 `:239-247`/C7 未知单+owner 冒充 `:259-271`）；refund 口：uc011 41 臂（`SIG :136` **pay 标签签名打 refund 口 403** · INV/NF/AMT/M1/M2/M2x 全族）+ 68 臂（A1–A7+X 主口↔Path A 跨口重放双向 `:429-443`）+ NHP-011-LOAD 风暴幂等（上表）。
- **本刀认领（零臂亲证·grep 口径=六证据面全树 grep〔五 proof+`authz5a2-hmac` 单测两形〕·含计算常数形 `WINDOW*1000±1000`/`+2000`·禁字面值单口径）**：
  1. **ts 窗锐缘 ±1s（两层读法）**：HTTP 口层现证据只 ±360s 远超窗（`neg:commerce:424/:509/:515`）——**单测层已行使**＝`authz5a2:44` 常数静态钉值 300+`:71-74` 恰外 ∓301_000 双向 400+`:77-78` 恰内 298s 过 → **本刀新鲜面收窄为 HTTP 口层传输证据**（N1/N3 含未来恰内与双向 ±299_000——锐缘本体全树零臂·N2/N4 降格口层对照臂·Ban 宣「阈值本体首次行使」）（`PAY_SIG_REPLAY_WINDOW_SECONDS=300` `commerce.service.ts:15`·`|now-ts|>300_000` 门 `:29`）；
  2. **ts 类型形**：现证据只缺 ts（`:502-504`）——string 数字形改**口层新鲜**（单测层 `'soon'` 同分支已行使 `authz5a2:70`·Ban 借 N5 宣 typeof 门首次行使）·null/boolean/浮点三形保留零在树申明（浮点→过=全树首证行为臂·N7 明示）（`typeof ts!=='number'||!Number.isFinite(ts)` 门 `:28-29`）；
  3. **kind 标签反向互换**：`refunded` 签名打 **pay 口** → 403 臂零在树（现证据仅 pay 标签打 refund 口·uc011 `mouth:136`/`adv:231`+单测层 `authz5a2:66` 三处单向）；
  4. **双口分叉·跨命名空间同流水**：`uq_payment_order_provider_txn`（0020`:20-21`）与 `uq_payment_order_refund_provider_txn`（0136`:27-29`）系**两分立 partial UNIQUE**·无跨 kind 约束——同字符串跨口跨单双落臂零在树；
  5. **生命周期分叉+重放边界**：refund-on-created→409 / pay-on-refunded→409 / refund 换流水二次→409 / **退款后原支付流水重放→409 非 already**（幂等不跨生命周期倒退复活·`payment.ts:107` 只认 `status='paid'`）——四臂零在树（neg:commerce 换流水臂系 pay 侧 `:552-557`·refund 侧缺；already 臂全系同生命周期内）。
- **与 UC-019 静态推定错的防错申明**：上列 5 项期望值全部按 §0.2 码面实锚逐条对码钉死（含「同单同串双列并存 200/200」这类**非直觉但系码态真值**的证人臂——期望=实际行为钉死并显式披露·Ban 断言迁就·Ban 借证人臂宣产品意图背书）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`961f5ef12`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **30 树**实测——`meetwise-webhook` 恰 1 命中=本席（`line/webhook-neg-draft` 唯一）；`ls ai-docs/delivery/harness/ | grep webhook-neg` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞线逐树亲读**（`git log -1` + `git diff --name-only origin/main...<branch>`）：
  - `line/sse-adv-draft` @`992039dc8`（EXEC 落卷·在飞并线中）——触面=矩阵+case-matrix+**policy 两 .mjs（cap 步进）**+runner+package.json×2+receipts+REQUEST；与本刀共享汇聚文件=**同上六面**（merge-order 敏感·cap/注记 additive 取大直并·沿批 B/C 先例形）。
  - `line/killsw-draft` @`8c8249289`（EXEC 落卷 `executed:awaiting_post_prove_dual`·在飞并线中）——触面同上共享面（含 policy 两 .mjs）；与本刀**行级互斥**（050/051 域）但共享汇聚文件交叠同 sse-adv。
  - `line/pay-neg-draft` @`91c54d817`（rev2 后 EXEC）——触面=**web UI 面**（`NHP-UI-PAY-NEG-01`·case-matrix `:153/:169`+矩阵 `:136`·web-logic/actions/四 page）；与本刀 **api 口面行级互斥零文件交叠亲证**（money 域相邻：其认领 402 到达浏览器后的渲染/交互拒绝·本刀认领无登录态 webhook 嘴的验签/幂等边界——**Ban 互借双向**：本刀收据不 wash 其 UI 行·其收据不 wash 本刀矩阵 `:119/:178` 格）。
  - `line/ledger-notes-draft` @`8ea905a44`（notes PR 在飞）——触面=矩阵+case-matrix 收官注记；与本刀 EXEC 期双表行内改同文件邻区——merge 时 additive 直并·逐件复核。
  - `line/online-pay-draft` @`fdaa1ecf0`（docs-only 支付适配器 REQUEST 初稿）——零产品码零双矩阵触·commerce 域相邻**零重叠**·其「回调幂等与 fail-closed 语义」系二期适配器契约设计面·与本刀现网码面证据层互不替代。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 commit 触面=**恰 3 tracked**（本卷 .md + `scripts/ai-docs/public-text-policy.mjs` + `scripts/ai-docs/public-text-policy.proof.mjs`·cap 步进预授权承登·见 §2-1/§2-3）；EXEC 期触面=两新 proof+注册行（root/apps/api package.json）+runner 注册位（`scripts/run-e2e-isolated.mjs` **五位全登记**：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单/resource-caps 条件——批 C 第五位教训承登）+egress inventory additive+双表行内改（矩阵 `:119/:178` 邻区+case-matrix `:62` 邻区两新行）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `961f5ef12` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·8 hex·行数 wc -l）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `48f66d68`（520） | **§1.0.1 `:119`（014/026 NEG/FAULT/BOUND partial·ADV gap Line K 钉）·`:117`（UC-011 refund 面 41+68+LOAD）**·§1.0.2 **`:178`（014/026 工具行）**·§0.5 `:44`（blind 读法）·§1.0.3 `:165` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `fb74878a`（201） | **§1.2 `:62` NHP-014-ADV-01（014 域唯一 case 行）·`:55-61` 011 五行（LOAD/PERF 收据在列）**·§1.3 表 `:82` 段头（EXEC 补两新行于 §1.2 `:62` 邻区） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-014 `:518-526`（TC-E2E-014-idem/amount `:526`）· UC-026 `:528-546`（E-伪造/篡改/重放 `:536-538` · TC `:544-546`） |
| `apps/api/src/modules/commerce/payment-callback.controller.ts` | `37b8af46`（35） | `:26-31` 白名单四字段解构 · `:32` 缺 orderId 400 `invalid_callback` **先于 HMAC** · `:33` 委托 `refundWebhook` 单管道 |
| `apps/api/src/modules/commerce/commerce-webhook.controller.ts` | `2b976602`（25） | `:12-17` `POST /commerce/webhook/pay/:id`（无登录态）· `:20-24` `refund/:id`（对偶·HMAC 标签 refunded） |
| `apps/api/src/modules/commerce/commerce.service.ts` | `f55d414c`（292） | **`:15` `PAY_SIG_REPLAY_WINDOW_SECONDS=300` · `:26-36` `verifyCommerceSig` 单源（`:27` 缺 providerTxn/sig 400 · `:28-29` `typeof ts!=='number'||!Number.isFinite(ts)||Math.abs(Date.now()-ts)>300_000` 400 · `:33` HMAC 载荷 `` `${id}:${providerTxn}:${kind}:${ts}` `` · `:34-35` `a.length!==e.length` 短路+timingSafeEqual 403）**· `:23` kind 入签对偶标签不可互换注 · `:125-142` payWebhook（`:126` 验签 · `:127-129` 网关函数 · `:130-136` requireOwner fail-closed 404 · `:139-140` 404/409 映射）· `:151-168` refundWebhook 同构 |
| `packages/db/src/commerce/payment.ts` | `15d7887a`（189） | **`markOrderPaidAndCredit :65-109`（CAS `:77-87` `AND status='created' AND channel='online' AND NOT EXISTS provider_txn` · savepoint 23505→conflict `:89-94` · 回读 `:105-108`：`status='paid'∧provider_txn 同` → already `:107`·否则 conflict `:108`）**· **`markOrderRefunded :122-189`（CAS `:130-139` `AND status='paid' AND NOT EXISTS refund_provider_txn` · 红冲 FIFO `:146-172` · 不足回滚 conflict `:173-178` · 回读 `:183-188`：`status='refunded'∧refund_provider_txn 同` → already `:187`·否则 conflict `:188`）** |
| `packages/db/migrations/0020_commerce_terminal_integrity.sql` | `244acb80`（64） | `:20-21` `CREATE UNIQUE INDEX uq_payment_order_provider_txn ON payment_order(provider_txn) WHERE provider_txn IS NOT NULL` |
| `packages/db/migrations/0136_payment_order_refund_provider_txn.sql` | `4561e6c6`（30） | `:3` 「与 provider_txn 分立：支付入账流水保留；退款另记 refund_provider_txn」· `:27-29` `uq_payment_order_refund_provider_txn` partial UNIQUE——**两索引分立·无跨 kind 约束·无同列异值 CHECK（全迁移目录 grep 亲证零命中）** |
| `packages/db/migrations/0041_api_runtime_least_privilege.sql` | `2e981a7c`（161） | `:38` `gateway_payment_order_owner(p_order_id text)`（无表权限网关·owner 单源） |
| `scripts/ai-docs/public-text-policy.mjs` | `dc73f594`（455） | `:157` `MAX_FILES=2_402` · `:156` 步进链注记（…→2397→2402）——本 commit 步进 2403（§2-1） |
| `scripts/ai-docs/public-text-policy.proof.mjs` | （联动件） | `:358` loop `2_402` · `:365` atCap `2_402` · `:368` `f-2402.md` · `:371` `PTP_FILE_LIMIT:2403`——步进联动四值（§2-1） |
| 旁证（零触只读·六证据面） | `neg-commerce.proof.ts`=`23418272`（687）·`authz5a2-hmac.proof.ts`=`be9b9494`（84·`:44` 窗常数钉值 300·`:66/:69-78` 单测直调行为臂）·`uc-e2e-014-026-webhook-adv.proof.ts`=`419c15a7`（296）·`uc-e2e-011-refund-callback-mouth.proof.ts`=`b3301f62`（243）·`uc-e2e-011-refund-callback-adv.proof.ts`=`c9ba96b6`（474）·`uc-e2e-011-nhp-load.proof.ts`=`933f4bce`（219）·`_neg-harness.ts`=`9768b323`（330·`:53` PAY_PROVIDER_SECRET 进程环境单源） | 零重叠对码基面（认领核对节逐行号亲读）·壳行种子先例 `uc-e2e-014-026-webhook-adv.proof.ts:105-115` |

### 0.2 码面锚（注入缝 · 按 case 分列 · symbol 级位移按 symbol 重钉）

**共享验签单源（两 case 共同缝·零改）**：`verifyCommerceSig`（`commerce.service.ts:26-36`）＝三口唯一验签管道——400 族（缺字段 `:27` / ts 形与窗 `:28-29`）**先于** HMAC；403 族（密钥缺失 `:32` 空 → `:35` / 长度不等短路+恒时序不等 `:34-35`）；kind 入签 `:33`（paid/refunded 对偶不可互换 `:23` 注）。三注入缝位：**窗常数 `:15`** / **ts 形门 `:28-29`** / **kind 载荷段 `:33`**。

**Case 1 · `NHP-014-NEG-01`（矩阵 `:119` NEG cell 残余亚层 · ts 锐缘+类型形+kind 反向互换）**

| 锚 | 钉位 | 现证据缺口（零臂亲证） |
|---|---|---|
| `commerce.service.ts:15/:28-29` | 窗阈值本体：恰内 `now−299_000`/`now+299_000` 过 · 恰外 `now−301_000`/`now+301_000` 拒 | neg:commerce 仅 ±360_000 远超窗双向（`:424/:509/:515`）——**单测层已行使**＝`authz5a2:44` 常数静态钉值 300·`:71-74` 恰外 ∓301_000 双向 400·`:77-78` 恰内 298s 过 → 本刀新鲜面收窄=**HTTP 口层传输证据**（恰内 ∓299_000 锐缘全树零臂·恰外降格口层对照臂） |
| `commerce.service.ts:28-29` | ts 类型形：string 数字 → 400 · null → 400 · boolean → 400 · **浮点（JSON 可载·窗内·载荷同值）→ 过** | 全树仅缺 ts 臂（`neg:commerce:502-504`）——string 形单测层 `'soon'` 同分支已行使（`authz5a2:70`）·null/boolean/浮点三形 `typeof`/`isFinite` 逐形零行使（浮点→过全树首证=N7） |
| `commerce.service.ts:33` + `commerce-webhook.controller.ts:12-17` | kind 反向互换：``paySig(`${id}:${txn}:refunded:${ts}`)`` 打 **pay 口** → 403 bad_signature + 零副作用 | uc011+单测层仅单向（pay 标签打 refund 口 `mouth:136`/`adv:231`/`authz5a2:66` 三处）——**反向臂零在树**（对偶互换对称性半开） |

**Case 2 · `NHP-014-BOUND-01`（矩阵 `:119` BOUND cell 残余亚层 · 双口分叉+重放边界）**

| 锚 | 钉位 | 现证据缺口（零臂亲证） |
|---|---|---|
| `0020:20-21` + `0136:27-29` | 两分立 partial UNIQUE 命名空间：同字符串 T 跨口跨单（X 单 pay T credited + Y 单 refund T refunded）→ **双 200**·`provider_txn=T` 恰 1 行∧`refund_provider_txn=T` 恰 1 行 | 跨单臂全系**同 kind 命名空间内**（neg:commerce `:571-584` pay 侧 / refund 侧两例分属两文件·`uc-e2e-011-refund-callback-adv.proof.ts` A5 `:332-339`+`uc-e2e-011-refund-callback-mouth.proof.ts` M2x `:213-219`）——**跨 kind 零臂** |
| `payment.ts:77-87` + `:130-139` | 同单同串双列：ORD pay T credited → 同 ORD refund T refunded → 200/200·同行 `provider_txn=T ∧ refund_provider_txn=T` 并存（分立列分立索引·结构性放行） | 零臂（语义证人形·期望=码态真值钉死+披露） |
| `payment.ts:130-139`/`:188` | refund-on-created：`status='paid'` CAS 不中 → 回读 `created` ≠ `refunded` → **409 order_conflict** | uc011 全族自 `paid` 壳起步（fixture `:72-79` 亲读）——created 壳零臂 |
| `payment.ts:77-87`/`:108` | pay-on-refunded：`status='created'` CAS 不中 → 回读 `refunded` ≠ `paid` → **409** | neg:commerce 仅 pay-on-paid 换流水（`:552-557`）——refunded 终态零臂 |
| `payment.ts:105-108` | 退款后原支付流水重放：pay T credited → refund T2 refunded → **原 pay 回调（T）重放 → 409 非 already**（`:107` already 只认 `status='paid'`——幂等不跨生命周期倒退复活） | 零臂（uc011 X 跨口重放系 refund 流水同口族 `:429-443`·非 lifecycle 倒退面） |
| `payment.ts:183-188` | refund 换流水二次：refunded 单再 refund T3（≠T2）→ CAS 不中+回读 txn 不符 → **409** | refund 侧零臂（pay 侧对偶已在 `neg:commerce:552-557`） |

### 0.3 认领两 cell 登记（行号+case 名+缺列·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **矩阵 `:119`** | **UC-E2E-014 / 026**（支付 webhook 幂等/错签） | NEG=**partial** · FAULT=**partial** · BOUND=**partial（入账幂等）** · ADV=**gap**（Line K 钉不动） | **NEG+BOUND 两 cell 残余亚层**（具名 case 1/2·格值零翻·additive 注记随 EXEC 收据·EXIT0=case≠covered）；FAULT 留后刀（§1.3） |
| **case-matrix §1.2 `:62` 邻区** | `NHP-014-NEG-01` / `NHP-014-BOUND-01` | **零行**（§1.2 亲证 014 域仅 ADV 一行） | EXEC 补两新行（gap→case-only 措辞·锚随收据） |

---

## §1 修法（两 case · 一 cell 一 case · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**（沿批 A/B/C `nhp-*-prove` 族先例）：每 cell 一个具名 NHP case = 新 proof 文件 + apps/api package.json 注册行 + root package.json 双行（`:prove`/`:prove:raw`）+ runner 注册位（`scripts/run-e2e-isolated.mjs` **五位全登记**：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单/resource-caps 条件——批 C 第五位教训承登）+ egress 环境引用登记（`ai-docs/architecture/ai/provider-egress-inventory.json` additive·两新 proof×实际出现词名·class=test-isolation·沿 uc028 `10b920521`/uc004 `834c91cb3` 先例形·漏登即 CI `environment_reference_unregistered` 红）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**；证据层沿 uc011-nhp-load 形（`boot()` 进程内真栈·`_neg-harness.ts:53` `PAY_PROVIDER_SECRET` 单源进程环境·或三层隔离壳 `07077d30` 形·pre-exec dual 裁定）· 零 live 模型 · 零 MODEL_API_KEY（隔离壳 env 自删三键具名：`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`）· 收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/<case>/`（implementer pre-commit runs · **not evidence of record**）。行/列状态一字不动：EXIT0=case≠covered，升格仅经协调方 nail 的 additive honesty；coveredCount=8 不变。

### Case 1 · `NHP-014-NEG-01`（矩阵 `:119` NEG 残余 · `apps/api/test/uc-e2e-014-nhp-neg.proof.ts`）

- **需求源**：`e2e-scenarios.md:528-546`（UC-026 E-伪造签名/验签 fail-closed `:536`·TC-E2E-026-forged-sig `:544`）+ `:518-526`（UC-014 幂等窗面）——本 case=验签门**边界值证据层**（窗锐缘/ts 形/kind 对偶），非七类重铺。
- **前置**：`'created'` 壳行种子（`uc-e2e-014-026-webhook-adv.proof.ts:105-115` 先例形·§5 豁免具名）——零登录态零 consent（webhook 口无 PrincipalGuard `commerce-webhook.controller.ts:5-7` 亲证）。
- **臂**：PC = 窗心合法回调（ts=now）→ 200 credited（对照·壳行转 paid）；N1 = ts=now−299_000 合法签 → **200 credited**（恰内锐缘·窗下界收·口层新鲜——±299_000 全树零臂）；N2 = ts=now−301_000 合法签（对同壳新单·或 N1 前先打拒臂单）→ **400 `invalid_callback`**（恰外·口层对照臂——单测层同界已行使 `authz5a2:71-74`）；N3 = ts=now+299_000 → **200**（未来恰内·`Math.abs` 双向·口层新鲜全树零臂）；N4 = ts=now+301_000 → **400**（未来恰外·口层对照臂）；N5 = ts 字符串数字 `"17…" → 400`（typeof 门 `:28-29` 前段·口层新鲜——单测层 `'soon'` 同分支已行使 `authz5a2:70`）；N6 = ts=null / ts=true → 400×2（同门逐形）；N7 = ts 浮点（窗内·载荷模板同值）→ 200（`isFinite` 放行形·JSON 可载性亲证·**全树首证行为臂**）；N8 = `refunded` 标签签名打 pay 口（`${id}:${txn}:refunded:${ts}` 正确 HMAC·fresh ts）→ **403 `bad_signature`**（kind 入签 `:33` 反向互换·对偶对称性补齐）+ 零副作用；N9 = 跨口继承旁证一臂：refund 口（`/payment/refund-callback` 或 Path A·EXEC 择一）+ ts=now−301_000 → 400（单源 `verifyCommerceSig` 继承证据·**Ban 扩铺 refund 400/403 族——uc011 已钉**）；N1–N9 拒臂全程零副作用快照（status/provider_txn/refund_provider_txn/桶数合计/全局两流水行数五面 before/after 恒等）。
- **非替代申明**：`neg:commerce` webhook 族（±360s 远超窗/缺 ts/短签/重放/跨单）· `uc014-adv` C1–C7（七类）· `uc011` 41+68+LOAD（refund 口全族+风暴）· `authz5a2-hmac` 单测两形（静态常数钉值 `:44`+直调窗锐缘/类型形/kind 绑定 `:66/:69-78`）= 旁证互不替代 · Ban 互借关列 · Ban 借 N1–N4 宣「防重放窗新增能力」/ 借 N2/N4 宣「阈值本体首次行使」（单测层已行使·本刀=HTTP 口层传输证据层）（窗与常数 5A-2 #100 已在码·本刀=边界值证据层非机制新增）。

### Case 2 · `NHP-014-BOUND-01`（矩阵 `:119` BOUND 残余 · `apps/api/test/uc-e2e-014-nhp-bound.proof.ts`）

- **需求源**：`e2e-scenarios.md:538`（E-重放 幂等去重边界）+ 矩阵 `:119` BOUND 格「入账幂等」读法 + 0020/0136 两迁移分立唯一索引语义——本 case=**双口分叉语义证人+生命周期重放边界**。
- **前置**：壳行种子三态（`'created'`/`'paid'`+provider_txn 预置/`'refunded'`+双列预置·`uc-e2e-014-026-webhook-adv.proof.ts:105-115`+`cf1e570b:323` 先例形·§5 豁免具名）+ 红冲臂需桶种子（entitlement_bucket·`cf1e570b:323` 先例形·豁免逐项具名）。
- **臂**：B1 = 跨命名空间同流水：单 X pay T → 200 credited + 单 Y（他人）refund T → 200 refunded——`provider_txn=T` 全局恰 1 行 ∧ `refund_provider_txn=T` 全局恰 1 行 ∧ X owner 桶 +10 ∧ Y owner 可用 −10（两索引分立证人）；B2 = 同单同串双列：ORD pay T credited → 同 ORD refund T → 200 refunded·行读 `provider_txn=T ∧ refund_provider_txn=T` 并存（**语义证人臂·期望=码态真值钉死·收据显式披露「非产品意图背书·Ban 借本臂宣退款正确性已证」**）；B3 = created 壳单 refund → **409 `order_conflict`**+零副作用（refund_provider_txn 全局 0 行·桶零变）；B4 = refunded 壳单 pay（合法签）→ **409**+零副作用；B5 = 退款后原支付流水重放：created 单经产品口 pay T credited → refund T2 refunded → 重放原 pay 回调（T·fresh ts 合法签）→ **409 非 200 already**（幂等不跨生命周期倒退复活·`:107` status 门）+ 桶/可用净账恒等（+10 −10 后零再动）；B6 = refunded 壳单 refund T3（≠原 T2·合法签）→ 409+零红冲（对偶 pay 侧 `neg:commerce:552-557`·refund 侧补齐）。
- **非替代申明**：neg:commerce 跨单（pay 侧）/已 paid 换流水（pay 侧）· uc014-adv C4/C5（pay 口重放/跨单）· uc011 M2/A4/X（refund 口 already/跨单/跨口重放）· NHP-011-LOAD（风暴幂等）= 旁证互不替代互不借用 · Ban 借 B1/B2 宣「跨口幂等已统一」（事实=分立命名空间·本刀=语义证人非统一化claim）。

### §1.3 否决表（落选臂/落选 cell 诚实留痕 · 含停止条件登记 · 与认领核对互补）

| 落选项 | 否决理由 |
|---|---|
| **长签变体臂**（>64 hex sig → 403） | 短签臂已实质行使 `a.length!==e.length` 短路分支（`neg:commerce:433` 注释亲点该分支名·`:434`/'ff' `:498`/`uc014-adv:131` 'zz' 三处）——长签同分支同 403 reason → **wash 零信息增量**·不申明。 |
| **kid/alg 形额外字段臂** | 白名单结构性忽略+签名不受扰已被 owner 冒充臂实质行使（`neg:commerce:536` goodBody 展开+owner 字段+合法签 → 200·`uc014-adv:267`·`uc011-adv:389`）——kid 形同白名单路径同 reason → **wash**·不申明（§5 Ban 互借句承）。 |
| **FAULT cell（`:119` 第三列）** | 有缝（超时/5xx 注入形）但一卷两 case 定标（协调方令）·且 FAULT 注入面与 C6 并发/审计后置 residual 交叠 wash 风险 → **留后刀独立裁量**·本卷零申明。 |
| **refund 口 400/403/404/replay/already 全族** | UC-011 41+68+LOAD 已钉（`:117` 亲读）——本刀仅 N9 单臂旁证单源继承·Ban 重铺。 |
| **fulfilled/refunding/expired 中间态臂** | 状态机 targets（`e2e-scenarios.md:30`）非现网 webhook 可达态（`payment.ts` 两 CAS 仅 created/paid/refunded 三态亲证）——**码面不存在可测注入缝·Ban 发明不可达断言**·停止条件登记（同批 C UC-027 先例形）。 |
| **PERF/LOAD 面（014 域）** | 负路径并发 PERF 形已被 NHP-011-PERF-api-01 同管道行使（refund 口 120 req）·pay 口 PERF 与其同族重载 wash → 留后刀。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check + cap 预算核（亲算·预授权步进本 commit 已行使）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2402** · cap=**2402**（`:157` 亲证）**恰达零余量** → 本卷新 .md +1 必越限 → **协调方预授权「越限沿先例步进承登」本 commit 行使**：`MAX_FILES 2_402→2_403`（+1 恰等零多放·CAP-SANCTION-2354 本卷形/clock-e2e `fc33c04e6` +5 恰等先例形）+ 越限臂四值联动（proof `:358/:365`→2_403·`:368`→`f-2403.md`·`:371`→`:2404`）+ 承登注记 CAP-SANCTION-2403 两 .mjs 随刀 + `public-text-policy.proof.mjs` 本树亲跑 12/12 EXIT=0。预期起草后 **scanned 2403 ≤ 2403 恰达**。若 EXEC 期在飞并线（sse-adv/killsw/notes）使届扫 >2403 → 按 merge 时「cap 取大+各支承登」先例形上报协调方·**Ban 就地多放**。
2. **markers 五类零命中 + est live=0**：本刀改动集（3 tracked）五类标记词 + conflict-marker grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked**＝①本卷 .md ②`scripts/ai-docs/public-text-policy.mjs`（cap +1+注记）③`scripts/ai-docs/public-text-policy.proof.mjs`（联动+注记）——**派单令「恰 1 tracked」系零余量前提下的预排；cap 步进预授权行使后如实登记为 3 件·多任何未登记 tracked 路径即停**。EXEC 期 diff 面=本卷+两 proof 新文件+注册行（root/apps/api package.json）+runner 五位+egress inventory additive+双表行内改（矩阵 `:119/:178` 邻区+case-matrix `:62` 邻区两新行）+收据 tracked 面——届时逐件登记·多任何未登记路径即停。
4. **EXEC 预基面（届时重 pin）**：两 case 隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退（`neg:commerce` / `uc014:webhook-adv` / `uc011:refund-callback` 按届时 SSOT 口径恒等绿）· 双表同步 diff 逐件登记（§1.0.3 `:165` 令）· 期望值对 §0.2 逐臂对码（**臂收据与 §1 推定形不符即根因诊断被证伪**·UC-019 静态推定错防线）· 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:119/:178` 与 case-matrix 对应格仅允许 additive 注记（gap/partial 格值零翻·coveredCount=8 零翻转）· Ban 借两收据互 wash（NEG≠BOUND≠uc011 面≠uc014-adv 面）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增两 test proof 文件+注册行+runner 注册位·沿 uc011-load/批 C nhp 族 prove-only 先例）。
2. **已钉面零触**：uc011 触面（`:117`·refund 口全族）· uc014-adv C1–C7 文件 · neg-commerce.proof.ts · 批 A/B/C 触面 · pay-neg/online-pay/sse-adv/killsw/notes 在飞触面——全部只读；`provider-egress-inventory.json` 系共享 additive 登记面（EXEC 按先例形 additive·非他线专属）不在零触之列。
3. **其余 §1.0 行零触**：`§1.3` 落选项全部只读；FAULT cell 与 PERF/LOAD 留后刀零申明。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支** · **零迁移零配置**（Ban 新迁移 Ban 触告警/CI 配置·零 .env 触）。

## §4 依赖

**①上游已满足**：验签单源/两 CAS/两分立索引全在树（§0.1/§0.2 blob 亲算）+ `boot()` 真栈先例（uc011-load `933f4bce`）+ 三层隔离壳先例（`07077d30`）+ 壳行种子先例（`419c15a7:105-115`）+ 桶种子先例（`cf1e570b:323`）。**②同文件并发**：起草 commit 触 policy 两 .mjs——sse-adv/killsw 在飞同面（§0.0 逐树登记·merge additive 取大直并·届时 merge-tree 预演）；EXEC 期矩阵/case-matrix 邻区与 notes 线同文件——同规则。**③下游**：两 cell 收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 动主仓；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 partial/借旁证 wash/跨口 wash）；Ban live key（零 Key 面硬跑）；Ban 触 uc011/uc014-adv/neg:commerce/批 A/B/C/pay-neg/online-pay/sse-adv/killsw/notes 触面与其余 §1.0 行；Ban 触产品码面/迁移/CI 告警配置（cap 值步进系预授权例外·恰等 +1 承登·Ban 就地多放）；Ban 改共享 SSOT；Ban 触既有 proof 文件（零触只读引用）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·**枚举完备**：壳行种子 `payment_order` 三态（'created'/'paid'+provider_txn/'refunded'+双列·`419c15a7:105-115` 先例形）+ 桶种子 `entitlement_bucket`（B1/B5 红冲净账面·`cf1e570b:323` 先例形）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 借 ts 锐缘臂宣「防重放窗新增能力」/ 借 B1/B2 宣「跨口幂等统一」/ 借 B2 宣「退款正确性背书」（语义证人臂三重披露钉）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（cap 步进两 .mjs 系纯文面+本树 proof 机检·零外呼）（EXEC 期两 case 全离线隔离·`boot()` 进程内真栈零 drain 零模型·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（3 tracked·起草 turn）五类标记词（四标记词面+冲突标记·词面运行时组装口径 `i6-239-gates.proof.mjs:159-163` 亲读·**本卷零字面复抄防自匹配**）+ 行首冲突标记 grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕——沿批 B/C §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual`（2026-10-27 EXEC 落卷三处翻面·三处钉：本节 + Status 头 + 卷尾注·原值 `draft:awaiting_pre_exec_dual` 史录不洗）· alone≠dual · 开工三条款已兑现（①pre-exec 双审 r2 两独立外席 BOTH PASS 落卷 ②协调方明示 EXEC 授权+落码令·egress r2 席2 P2-A/P2-B 修订随令行使 ③§1 修法面/§5 Ban/pins/§1.3 否决面零改动·§0 对开工 tip 全量重 pin·见 §9.0）· 后继=post-prove 双审两独立外席（协调方派单）→ 双 PASS 会签翻终态（漂移如实改锚）——**在飞漂移 rev 实测提示**：四线 tip 均已前移（sse-adv `992039dc8→b4de1a469`·killsw `8c8249289→b00c09df3`·notes `8ea905a44→e01db6990` 三线已并入 main #153/#154/#155·pay-neg `91c54d817→80847d175` 在飞）·矩阵格值零翻仅行号漂（origin/main tip `d1a947e3d` 亲点：`:119` 未动·`:178`→`:179`·`:62`→`:63`）·worktree 自起草 30 上行（派单届值 32·rev 修订席本 turn 实测 34）→ §0.0 在飞登记与 §0.1/§0.2 全锚届时逐件重 pin·以届时实跑为准。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（三 cell 列值被他刀改写 · `verifyCommerceSig` 单源/两 CAS/两分立索引被重构 · sse-adv/killsw/notes 并线改写 `:119/:178`/`:62` 归属）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期臂收据与 §1/§0.2 推定形不符（如恰外 ts 被静默接受 · refunded 签打 pay 口 200 · refund-on-created 非 409 · 原支付流水重放返 already）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 2 case 面（需触产品码/uc011 已钉族/covered 翻面/共享 SSOT/迁移/cap 多放）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2403 且无并线 sanction / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

EXEC 期现值 **`executed:awaiting_post_prove_dual`**（2026-10-27 三处翻面·起草态 `draft:awaiting_pre_exec_dual`→pre-exec r2 双审双 PASS→协调方 EXEC 授权·史录不洗）· 起草 commit=本卷 .md + cap 步进两 .mjs · EXEC 落卷=两 case proof+注册+双表 additive+§9-EXEC 全录（下节）· 后继=post-prove 双审（两独立外席·alone≠dual·协调方派单）→ 双 PASS 会签翻终态 → 翻面权归协调方。

---

## §9-EXEC 落卷（2026-10-27 EXEC 席·协调方授权行使·r2 席2 P2-A/P2-B 修订随令·两 case 断言/门矩阵 EXIT 原值/重 pin 落点/attempts 台账如实全录）

### 9.0 立项并线与全量重 pin（§8 ③履行·届值如实采）

- **并线**：`git fetch origin` 本 turn 亲跑 EXIT=0 · 届值 origin/main **`9c31c0ccc`**（**#156 pay-neg 收官已并线·含 #154/#155 届值·#157 在飞未在 main 如实采**——派单令「届值含 #156/#157 在飞·cap 届值如实采」对届值漂移如实承登）· merge-tree 预演=两 policy .mjs 双改冲突（本支 2403 vs main 承 2410）→ 按派单令「共享文件 additive→dual-keep」+「cap 取大+各支承登」先例形解决（注释 dual-keep 双留·数值取大 2410）· merge 落 **`69997bd42`** · `pnpm install --frozen-lockfile` EXIT=0（5.2s）。
- **§0.0 在飞交叠复核**：worktree 亲读 `meetwise-webhook` 恰 1 命中=本席（`line/webhook-neg-draft` 唯一）·并线届值后 §0.0 登记四线全部收官或并线（sse-adv `d1a947e3d`/killsw `27a87781b`/notes `e01db6990` 已在 main·pay-neg `9c31c0ccc` #156 已并）——零未决在飞交叠。
- **§0.1 blob 锚重 pin（merge tip `69997bd42` 亲算）**：机制源**零漂**（payment-callback `37b8af46`/webhook-ctrl `2b976602`/commerce.service `f55d414c`/payment.ts `15d7887a`/e2e-scenarios `9976f9c3`/迁移 `244acb80`+`4561e6c6`/旁证六面 `23418272`+`be9b9494`+`419c15a7`+`b3301f62`+`c9ba96b6`+`933f4bce`+`_neg-harness 9768b323` 与 §0.1 逐值恰等=机制零漂·停止条件未触发）·文档锚漂移如实更：矩阵 `48f66d68`→**`28048fce`**（520→521 行·§1.0.1 `:119` 未漂·§1.0.2 `:178`→**`:179`**）·case-matrix `fb74878a`→**`c71bf78b`**（201→204 行·§1.2 `:62`→**`:63`**——与 §8 漂移预告逐值一致）·policy 两 .mjs 届值 `30480d07`/proof 联动件随并线双改如实采。
- **P2-B 两键实形行号承登**：协调方令引 `_neg-harness.ts:62-63`·届值 blob 亲读=**`:61-62`**（`delete process.env.MODEL_API_KEY;` :61 + `delete process.env.MODEL_BASE_URL;` :62·相邻两行）——**两键实形同令·行号差 1 如实承登**（非三键：harness 内零 DASHSCOPE 词面亲证）。

### 9.1 egress r2 履行（P2-A/P2-B）+ 两 case 落码与门矩阵亲跑（EXIT 原值·stdout 留痕）

- **P2-A 履行（boot() 真栈形·零含词·零条目）**：两新 proof 均 `import { boot, paySig } from './_neg-harness'` 进程内真栈·回调密钥只经 boot() 进程环境单源·**proof 文件零环境变量词面**（MODEL_API_KEY/MODEL_BASE_URL/DASHSCOPE/PAY_PROVIDER_SECRET/MODEL_ENDPOINT/MODEL_BACKUP/AUTH_SECRET 七词面 grep **0 命中**亲证）· **inventory additive 零条目**：`pnpm provider-egress:inventory` **EXIT=0 · environment_references=376 届值恒等零新增**（stdout 收据 `.tmp/nhp-014-neg-01-receipts/04-egress-inventory.stdout.log`）——**PAY_PROVIDER_SECRET 未新增入 environmentReferences**（不在扫域亲证：`provider-egress-policy.mjs` environmentNames 表 grep=0 命中·扫域=apps/packages/scripts 三目录 TEXT_EXTENSIONS·Ban 新增登记履行）· P2-B 履行=两键自删经 boot() 继承（harness 内实形·零新写零三键）。
- **docker info 亲证**：EXIT=**0**（Server 29.5.2 · Ubuntu 24.04.4 LTS · colima 容器可用·receipt `.tmp/nhp-014-neg-01-receipts/00-docker-info.txt`）。
- **NHP-014-NEG-01**（`apps/api/test/uc-e2e-014-nhp-neg.proof.ts`·`pnpm uc014:nhp-neg:prove`）：**EXIT=0 · 22 断言全绿·attempts=1**（PC 窗心对照 200 credited+壳行转 paid · N1/N3 恰内 ∓299_000 双向 200（口层新鲜全树零臂）· N2/N4 恰外 ∓301_000 400×2（口层对照）· N5 string/N6 null+bool 400×3（typeof 门逐形）· N7 浮点窗内 200（全树首证行为臂·JSON 可载亲证）· N8 refunded 标签签打 pay 口 403 bad_signature（反向互换全树零臂）· N9 refund 口 −301_000 400（单源继承·EXEC 择 Path A 对偶口）· 拒臂全程零副作用五面快照恒等×7）· tracked receipt `ai-docs/delivery/receipts/nhp-014-neg-01/01-gate-uc014-nhp-neg.stdout.log`。
- **NHP-014-BOUND-01**（`apps/api/test/uc-e2e-014-nhp-bound.proof.ts`·`pnpm uc014:nhp-bound:prove`）：**EXIT=0 · 22 断言全绿·attempts=1**（B1 跨命名空间同流水双 200+`provider_txn`/`refund_provider_txn` 全局恰 1 行×2+X 桶 +10/Y 可用 −10 · B2 同单同串双列并存 200/200+行读双列同值（语义证人·DISCLOSURE 两行非产品意图背书钉）· B3 refund-on-created 409 · B4 pay-on-refunded 409 · B5 退款后原支付流水重放 409 非 already+净账归零 · B6 refund 换流水二次 409 零红冲 · 壳行种子三态+桶种子=§5 豁免枚举①②具名·枚举外零裸 INSERT）· tracked receipt `ai-docs/delivery/receipts/nhp-014-bound-01/01-gate-uc014-nhp-bound.stdout.log`。
- **attempts 台账（红次如实全录·Ban retry-to-green 承守）**：门矩阵两 case 均 attempt1 EXIT=0（零门红）· 唯一红次=**typecheck 首跑 EXIT=2**（TS2554×2：A() 断言器调用形状 4 参越签——name 与描述误拆两参）→ 根因=断言器签名 `(name, cond, detail?)` 调用形误写 → 修复=两 proof 全部 A() 调用 name+描述合并单参（**零断言谓词变·纯调用形状修复**）→ typecheck 复跑 EXIT=0。
- **邻面不回退（§2-4）**：`neg:commerce` 复跑 **EXIT=0 · 90 臂**（receipt `.tmp/nhp-014-neg-01-receipts/02-neighbor-neg-commerce.stdout.log`）· `uc014:webhook-adv:prove` 复跑 **EXIT=0 · 47 断言**（`03-neighbor-uc014-webhook-adv.stdout.log`）· `uc011:refund-callback:prove` 复跑 **EXIT=0**（`.tmp/nhp-014-bound-01-receipts/02-neighbor-uc011-refund-callback.stdout.log`）——三邻面恒等绿·零回退。
- **机检面（§2-2/§2-3/§2-5）**：markers 五类标记词+冲突标记 grep 改动集（运行时组装口径 `i6-239-gates.proof.mjs:159-163` 承形·本卷零字面复抄）**零命中** · typecheck `pnpm -C apps/api typecheck` EXIT=0（含两新 proof）· diff 面亲读：本卷 .md+两 proof+双 package.json+runner+两 policy .mjs+双矩阵+两收据 log·**产品源 `apps/*/src`/`packages/*/src` 零 diff 亲证**。
- **cap/lint 承登（§8「验收红不可修」防御）**：并线树 docs:check 终验亲跑 **PTP_FILE_LIMIT:2411>2410 红**（union=main 2410+本卷 REQUEST 1）如实承登→本刀 EXEC 面 +2 受管 proof（两门矩阵 stdout 收据 .log 非 TEXT_EXTENSIONS 扫描面不计·`:332` 亲证）→ **cap 2410→2413 恰等步进**（协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·沿 2405/2406→2409→2410 并线先例形·CAP-SANCTION-2413 承登两 .mjs 随刀·越限臂 fabricated 数 2_413/2414 联动）→ `check-docs` 复跑 **EXIT=0 · scanned 2413 恰等** + `public-text-policy.proof.mjs` **EXIT=0 · 12/12** · lint **零步进承登**：root 5334=cap 恰等 EXIT=0（增量 0·两新 proof 亲测 0 warning）·apps/api 1475=cap 恰等 EXIT=0（增量 0）· runner **四位全登记**（位1 isolatedReceiptSources/位2 supported targets/位3 isolatedCommand/位4 pre-migrate 名单）·**位5 resource-caps=PERF 专用·本刀非 PERF 不适用**（沿 uc050/uc051 同形如实承登）。

### 9.2 双表同步（§1.0.3 令）+ 范围外核

- 矩阵 §1.0.1 `:119` NEG/BOUND 两格 **additive 注记**（格值 partial 零翻·EXIT0=case≠covered·coveredCount=8 不变）·§1.0.2 `:179` 工具列 additive 注记（两新 prove 命令登记·格值 partial 保持）·case-matrix §1.2 `:63` 邻区两新行 `NHP-014-NEG-01`/`NHP-014-BOUND-01`（**gap→case-only 措辞**·锚随收据·邻区 additive 零触既有行）·FAULT cell 与 PERF/LOAD 留后刀零申明（§1.3 维持）。
- pins 十一值零翻转（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8** · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）·uc011 触面/uc014-adv 文件/neg-commerce.proof.ts/批 A-B-C/pay-neg/online-pay 触面零触（只读旁证亲证）·共享 SSOT 零改·零迁移零配置零 .env 触·est live=0（全程隔离 boot() 真栈零外呼零模型零 Key 加载）·⛔push。
- **post 输入**：§9-EXEC 两 case 门矩阵全绿在卷（三处钉 `executed:awaiting_post_prove_dual`·待 post-prove 双审两独立外席·alone≠dual）→ 双 PASS 会签 → 三处钉（Status 头+§8+卷尾注）翻终态；stdout 全痕目录 `.tmp/nhp-014-neg-01-receipts/`+`.tmp/nhp-014-bound-01-receipts/`（docker-info/门 stdout/邻面三门/egress 门/lint）+`.tmp/isolated-proof-receipts/`（fresh 收据·gitignored 本地证据）。

---

*NHP-014 WEBHOOK-NEG REQUEST · 2026-10-26 起草 · 2026-10-27 EXEC 落码落卷 · **STOP=`executed:awaiting_post_prove_dual`**（2026-10-27 EXEC 三处翻面·三处钉：Status 行+§8+本行·原值 `draft:awaiting_pre_exec_dual` 史录留痕不洗）· 剩余队列 Phase2 #12 one-knife-one-row · 覆盖矩阵残余 UC-E2E-014/026 `:119` NEG+BOUND 两 cell 亚层 + `:178` 工具行 + case-matrix `:62` 邻区两新行 · 修法=恰 2 具名 case（`NHP-014-NEG-01` ts 锐缘±1s+类型形+kind 反向互换 / `NHP-014-BOUND-01` 双口分叉跨命名空间+生命周期重放边界）· 零产品码触 · 与 UC-011 41+68+LOAD 面/uc014-adv C1–C7/neg:commerce webhook 族零重复申明（长签/kid 形 wash 否决 §1.3·FAULT/PERF/LOAD 留后刀）· 期望值逐臂对码（防 UC-019 静态推定错·B2 语义证人臂三重披露）· cap 步进预授权行使 2402→2403（+1 恰等·CAP-SANCTION-2403 承登·越限臂 2403/2404 联动）· 起草 commit 恰 3 tracked（本卷+policy 两 .mjs·派单令「恰 1」系零余量前提预排·如实承登）· 在飞四线登记（sse-adv/killsw 并线中·pay-neg rev2 后 EXEC·notes PR 在飞·merge additive 取大）· est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0≠covered · releaseEvidence=false · ≠HA · alone≠dual · ⛔动主仓 ⛔push*
