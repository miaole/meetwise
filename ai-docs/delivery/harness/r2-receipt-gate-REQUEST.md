# R2-RECEIPT-GATE REQUEST — runner 域收据门修复刀起草卷（G7 账本簿记行混入收据 calls ⇒ 绿 run 收据写盘必炸 EXIT 翻 1 · `loadG7ReceiptFromLedger` 调用行判定修复 · runner 单码面单区域起草落卷即停 · ⛔EXEC ⛔push ⛔动主仓 ⛔起草期码动）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷转（rebase 届核+cap 届值如实采 2481+§1.2 修法逐字节落位 +7/−0+A3 真实账本回放 17/17 PROBE_EXIT=0+主门判别 run EXIT=0 收据门绿+三门全绿·详 §9 EXEC 期行使记录） · 前值 **`drafted:awaiting_pre_exec_dual`**（2026-11-05 起草落卷即停 · rev r1 回炉修订同日复停（pre-exec dual 双席 FAIL 同判一处 P1·机械定谳·详卷尾 rev r1 节） · EXEC 行使面=§1.2 runner 单 region additive patch（`scripts/run-e2e-isolated.mjs` `loadG7ReceiptFromLedger` 账本读入循环 +7/−0）+ §2-A3 真实账本回放读数收据 `.log` 一枚 · `scripts/local-e2e-receipt.mjs`/guard/ledger 写侧/e2e 面全零触（修法定谳=甲·乙永不取）· pre-exec 双审两独立外席留协调方派席 · 行翻面权归协调方 · alone≠dual · Ban self-approve · est live=0 · `actualSpendCny=null` · markers=0 · 状态钉=Status/§8/§9/卷尾 四处同值）

**席位**：meetwise「R2-RECEIPT-GATE」修复刀起草席（runner 域 test-infra bug 修复 · 协调方派单令 2026-11-05 随令 · 上波撞并发限额未跑重派承卷 · ⛔push ⛔动主仓 ⛔禁改 runner 代码——EXEC 期行使）。
**基线**：`origin/main` @ **`edda65a44`**（full `edda65a44…` = PR #198 `line/l13-draft` 并线点 · `git fetch origin` 本 turn EXIT=0 · 本 worktree `meetwise-r2` 由 `git worktree add ../meetwise-r2 -b line/r2-draft origin/main` 亲立 · HEAD 落 `edda65a44` 亲证）。起草前本树三门亲跑：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2479 = cap 2_479 恰等零余量**（`scripts/ai-docs/public-text-policy.mjs:299` `const MAX_FILES = 2_479` 亲读 · 链区注记 `:298`）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**（`static_preflight_valid: selected=12/12`）；改动集 markers 零命中（词面运行时组装·本卷不复抄）。**本卷 +1 受管件必越** ⇒ 起草 commit 即行使 **CAP-SANCTION-2480（cap 2479→2480 恰等零多放）**，四联动点在 §3 逐点登记；落卷后复跑 `scanned 2480 = cap 2480` 亲证（§9）。

**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/README.md`（知识层定位）→ `ai-docs/delivery/harness/g7w-tail-seg-emit-REQUEST.md:237`（**案 A 卷 §9-LIVE ⑦ 立项登记行·本刀授权源**）→ `scripts/run-e2e-isolated.mjs:57`-`:87`（**修复载体**·`loadG7ReceiptFromLedger` 全文）+ `:4490`-`:4515`（收据写盘调用点+`requireCalls` 语义）→ `scripts/local-e2e-receipt.mjs:105`-`:140`（**收据契约 `optionalG7Fields`·乙否决对象·零触**）+ `:31`-`:59`（`assertReceiptInput`/reviewLedger 门）→ `packages/ai-runtime/src/g7-freetier-reprove-guard.ts:430`-`:449`（三行形类型）+ `:504`-`:557`（reserve/release 簿记写侧）+ `:560`-`:596`（finalize·`:575` `row:'call'`）+ `:598`-`:640`（**guard 读者调用行判定先例·修法镜源**）→ `scripts/ai-docs/public-text-policy.mjs:298`-`:299` + `public-text-policy.proof.mjs:452`/`:459`/`:490`-`:491`/`:494`（cap 四联动点）→ 在盘实证（untracked·sha256 见 §0.2）：`.tmp/g7-ledgers/g7-91160-1793811488060.ndjson`（窗 1·21 call）/`g7-98822-1793811969432.ndjson`（窗 2 形·15 call）/`.tmp/g7-run-cmd1.log`（窗 1 全绿 EXIT=1 原始回执）。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：① **案 A 卷 §9-LIVE ⑦**（`g7w-tail-seg-emit-REQUEST.md:237`·blob `fbd7027e`）原文：「⑦ 收据写盘失败登记（runner 既有机制冲突·非本刀域·本席零触）：`LOCAL_E2E_RECEIPT_FAILED reason=local_e2e_receipt_g7_actual_model_required`——…账本行形=reservation/release/call 三行组（reservation 行仅 `model` 字段）→ 任一 `G7_FREETIER_REPROVE=1` 的 e2e:prove run（**含绿 run**）收据写盘必炸→EXIT 翻 1。…该冲突使绿面亦被翻红，**归 runner 域待另立登记**（§3 范围外…）」——**本卷即该另立登记之行使**；② 协调方派单令（2026-11-05 · R2-RECEIPT-GATE · 明示「起草·落卷即停·禁 EXEC·⛔禁改 runner 代码 EXEC 期行使」·上波撞并发限额未跑重派）；③ 在飞佐证（如实列·非授权源）：`line/g7w-draft`@`86af8b34b`（未并）附带残面登记「runner 收据门 `local_e2e_receipt_g7_actual_model_required` 现值 `2ce86946` `:112`-`:125` 在树未修=runner 域另立归协调方」+「§0.2-⑤ runner 收据门登记补 74825（2026-11-03 receipt=R2 未修最新实证）」。

---

## 认领核对 · 登记处 fresh 亲点（逐行对 `origin/main` @`edda65a44` 亲读亲算）

| 登记处 | 对树行使证据（file:line / blob 亲读） | 判定 |
|---|---|---|
| 案 A 卷 §9-LIVE ⑦ | `g7w-tail-seg-emit-REQUEST.md:237`（blob `fbd7027e` 243 行）登记原文全量亲读（见立项出处①）·本卷行状态=`closed`（2026-11-03 STATUS-RECON 翻面史录）·⑦ 系 §9-LIVE 执行记录内登记·非 OPEN 行 | **开**（本卷=行使·零行翻面） |
| runner 现态（病灶） | `scripts/run-e2e-isolated.mjs`（blob `cde76fda` 4541 行）`:57` `function loadG7ReceiptFromLedger`·`:63`-`:70` 账本读入循环 `:67` `calls.push(row)` **无行形判定**（全行 push）·`:4492`-`:4493` 调用点 `requireCalls: !failed` | **在树未修**（本刀修面） |
| 收据契约（乙面·零触） | `scripts/local-e2e-receipt.mjs`（blob `2ce86946` 253 行）`:105` `optionalG7Fields`·`:108`-`:110` `calls_required`·`:111`-`:114` 逐 call `actualModel` 必查（`:113` throw `local_e2e_receipt_g7_actual_model_required`）·`:115`-`:126` 禁模/未声明模 | **契约在位**（乙否决=零字节） |
| guard 读者判定先例 | `packages/ai-runtime/src/g7-freetier-reprove-guard.ts`（blob `4e75fae7` 641 行）`:611`-`:626` `inspectG7SharedLedgerUnlocked`：`:612` reservation 分支 continue·`:620` release continue·`:621`-`:623` 调用行=形状判定（`estimatedCostCny` number ∧ `actualModel` string）else continue | **判定镜源在树**（单一语义源） |
| 簿记行类型 | guard `:430`-`:438` `G7ReservationRecord`（`row:'reservation'`·仅 `model`/`reserved*`·**无 `actualModel`**）·`:440`-`:444` `G7ReleaseRecord`·`:446`-`:449` `G7LedgerRow`（call 臂 `row?: 'call'` **可缺省**=legacy 形） | **簿记行≠调用行**（类型级实证） |
| 在盘实证（窗 1） | `.tmp/g7-ledgers/g7-91160-1793811488060.ndjson`（untracked·sha256 `8c83cd69…`）65 行=reservation 22+release 22+call 21（`row` 字段逐行亲算）·call 行全 `actualModel='qwen3.8-flash'` · `.tmp/g7-run-cmd1.log`（sha256 `740b9574…`）：容器 `meetwise-e2e-91160-1793811488059`·`E2E_FINAL_SUMMARY assertions=148`·`E2E_REVIEW_CLASS_COUNT count=26`（全 seg*/ready/unavailable 观测码·零 E2E_FAILURE 行）·`LOCAL_E2E_RECEIPT_FAILED reason=local_e2e_receipt_g7_actual_model_required`·exit 1 | **绿断言+EXIT 翻 1 同证** |
| 收据缺位实证 | `.tmp/e2e-receipts/` 全目录 grep pid `91160`/`98822` **零命中**（绿 run 收据写盘 throw→无文件·catch 翻红 runner:4508-:4514）；红 run 收据在盘：`2026-11-03…-74825-….json`（failed·exit 1）+`2026-11-04…-90482-….json`（同形）——rev r1 勘正：两件均**无嵌套 `g7` 块**（契约平铺·`optionalG7Fields` 返回形全平铺 receipt 顶层=`g7FreetierReprove:true`+`calls:[]`+`estimatedCostCny:0`·红臂 `requireCalls=false` flag off→空 calls 合法写盘·初稿「g7 块 `calls:[]`」系误读）——`requireCalls: !failed` 非对称改锚=代码链（runner `:4493` `requireCalls: !failed`+`optionalG7Fields:108`-`:114`）+窗 1 cmd1.log+§0.3 沙箱读数（P1c throw/P2f 写盘）：红 run 收据可写·绿 run 收据必炸 | **不对称实证** |
| 在飞/同名复核 | `git branch --list "line/r2*"` 落卷前唯一命中=本支 `line/r2-draft`；`ls ai-docs/delivery/harness/ | grep -i "r2\|receipt-gate"` 零同名卷；`grep -rln "R2-RECEIPT-GATE" ai-docs/` 零命中（fin 在飞卷内「R2例」系错误登记面行号例·异命名空间如实注） | **零第二认领** |
| 在飞支如实采 | `line/fin-draft`@`2a4b09f22` ahead=1（承 2480·两 policy 热面）·`line/g7w-draft`@`86af8b34b` ahead=2（承 2481·两新 REQUEST·两 policy 热面）·ag20/loadw/pay/scoringeval/uc31 各 ahead=1 两 policy 零触·campaign-state/ag18/cap-2272 系 ancient 分叉不预采 | **§3 在飞如实列** |

---

## §0 现状锚（事实锚 · 起草席亲读亲算 · file:line + blob · **EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 事实钉（四条）

1. **病灶机理（全链）**：`G7_FREETIER_REPROVE=1` 时 runner `:4492` `loadG7ReceiptFromLedger(process.env)` 读 `G7_RUN_COST_LEDGER_PATH` ndjson——`:65`-`:69` 对**全部行** `calls.push(row)`（含 reservation/release 簿记行）；`g7` 入 `writeLocalE2EReceipt` → `optionalG7Fields`（receipt `:111`-`:114`）按 call 契约逐行索要 `actualModel`——簿记行无此字段 ⇒ throw `local_e2e_receipt_g7_actual_model_required` ⇒ runner catch（`:4508`-`:4514`）`failed=true; process.exitCode=1`+`LOCAL_E2E_RECEIPT_FAILED`。**绿 run（requireCalls=true）必炸·红 run（requireCalls=false·calls=[]）可写**——不对称=绿面被翻红的机理（案 A ⑦ 全句兑现）。
2. **账本三行形**：写侧 guard `reserveG7CallOnSharedLedger`（`:504`-`:546`）先记 reservation·`releaseG7ReservationOnSharedLedger`（`:548`-`:557`）记 release·`finalizeG7ReservationOnSharedLedger`（`:560`-`:596`）记 release+call（`:575` `{...call, estimatedCostCny, row:'call'}`）——`row` 字段自 `112e6d26f`（2026-10-16 PR #108·git log -S 亲证）入树；**此前 legacy 账本 call 行无 `row` 字段**（`G7LedgerRow` `:447` `row?: 'call'` 可缺省即兼容声明）。史实补正（rev r1·git show 亲证）：reservation/release 行写侧自 `b74e4e09f`（2026-09-23「reserve-before-dispatch」）即产生（同 commit 已带 `row:'reservation'/'release'` 簿记标记+契约 `optionalG7Fields` 逐 call `actualModel` 必查已在位）⇒ 混合账本（簿记行+调用行共存）炸收据窗口自该时点起·`row` 字段叙述限定 **call 行**（call 行 `row:'call'` 系 `112e6d26f` 引入面）。reservation/release 行**无** `actualModel`/`estimatedCostCny` 字段（`:430`-`:444`）。
3. **窗 1 实证（2026-11-04 trio）**：`.tmp/g7-run-cmd1.log` = 容器 `meetwise-e2e-91160-1793811488059`（pid 91160 ↔ 账本 `g7-91160-1793811488060.ndjson`）·`E2E_FINAL_SUMMARY assertions=148` 全绿形（REVIEW 26 码全观测族）·收据门炸·EXIT=1·**收据文件零落盘**——派单令「断言 148 全绿但 EXIT=1」逐字兑现；2026-11-03 receipt 74825 同形（红 run·`calls:[]` 收据在盘=非对称实证）；窗 2 形账本 `g7-98822`（47 行=16/16/15）另证。
4. **判定口径唯一性**：guard 自身读者 `inspectG7SharedLedgerUnlocked`（`:598`-`:640`）已定义调用行判定=排除 reservation/release+形状判定（`:621`-`:623`）——其 `callCount`/`runningCostCny` 均按此口径；收据侧 `calls` 若不镜用同口径即成第二口径（cap callCount 与收据 calls 计数分叉）——修法甲=镜用既有口径，不发明新语义。

### 0.2 blob 锚表（`git rev-parse HEAD:<path>` 亲算 · 8 hex · 锚基 = `edda65a44`）

| 文件 | blob（行数） | 关键锚 |
|---|---|---|
| `scripts/run-e2e-isolated.mjs` | `cde76fda`（4541） | **`:57`-`:87` `loadG7ReceiptFromLedger` 全文**（`:58` reprove 臂·`:59`-`:60` path 必查·`:61`-`:62` 累加器·`:63`-`:70` **读入循环·`:67` `calls.push(row)` 病灶行·`:68` 成本累加**·`:71`-`:75` key fingerprint·`:76`-`:86` 返回形含 `calls`/`estimatedCostCny`/cap/label）· `:4490`-`:4515` e2e:prove 收据写盘 try/catch（`:4492` g7Base·`:4493` `requireCalls: !failed`·`:4496` receiptRoot `.tmp/e2e-receipts`·`:4507` 成功消息·`:4511`-`:4513` catch 翻红+`LOCAL_E2E_RECEIPT_FAILED`） |
| `scripts/local-e2e-receipt.mjs` | `2ce86946`（253） | **`:105`-`:140` `optionalG7Fields` 全文**（`:106` reprove 臂·`:107` calls 数组化·`:108`-`:110` requireCalls 空查·`:111`-`:114` 逐 call `actualModel` 必查·`:115`-`:117` `deepseek-v4-pro` 禁模·`:118`-`:125` declared 集查·`:128`-`:139` 返回形）· `:31`-`:43` reviewLedger 门·`:45`-`:59` `assertReceiptInput`（`:49` outcome↔exitCode 恒等·`:58` reviewLedger 调用）· `:156`-`:185` `writeLocalE2EReceipt`（`:177` sourceDigests·`:181` `...optionalG7Fields(g7)` 展开点=throw 位置） |
| `packages/ai-runtime/src/g7-freetier-reprove-guard.ts` | `4e75fae7`（641） | `:66`-`:81` `G7CallRecord`（callId/actualModel/tokens/cost/`evidenceClass` 必填）·`:430`-`:438` reservation·`:440`-`:444` release·`:446`-`:449` `G7LedgerRow`（**call 臂 `row?: 'call'` 可缺省**）·`:461`-`:486` 锁·`:488`-`:491` 读行·`:504`-`:546` reserve·`:548`-`:557` release·`:560`-`:596` finalize（`:575` `row:'call'` 落行·`:578`-`:587` settled 对账=同判定族）·**`:598`-`:640` 读者判定**（`:612`/`:620` 簿记 continue·`:621`-`:623` 形状判定·`:624` 成本只累计调用行） |
| `ai-docs/delivery/harness/g7w-tail-seg-emit-REQUEST.md` | `fbd7027e`（243） | **`:237` §9-LIVE ⑦ 立项登记行**（原文见立项出处①·行状态 closed 史录） |
| `scripts/ai-docs/public-text-policy.mjs` | `3d8e6971`（597） | `:298` `CAP-SANCTION-2479` 链区注记·**`:299` `const MAX_FILES = 2_479`（cap 步进落点）** |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `2e0009a1`（510） | **四联动点** `:452` `i < 2_479` · `:459` `scannedFiles, 2_479` · `:490` 链区注记 · `:491` `'ai-docs/f-2479.md'` · `:494` `FILE_LIMIT}:2480`（+ `:460`-`:461` 相邻注释两处·行号随 merge-tree 重排·EXEC 立项照届时 tip 重 pin） |
| 在盘 untracked 实证 | sha256 | `g7-91160-1793811488060.ndjson` `8c83cd6917d9…4c1`（65 行）· `g7-98822-1793811969432.ndjson` `3b31faf91154…2d3`（47 行）· `g7-run-cmd1.log` `740b95741b3d…f66`（20 行） |

### 0.3 现态回放探针（起草期 raw 亲跑 @`edda65a44`·17/17 全绿 · PROBE_EXIT=0 · 临时目录行使·零入树）

探针形：临时目录 node 脚本（仓外）——①现行机制复刻（`:63`-`:70` push-all 逐行）②修法甲判定复刻（排除 reservation/release+形状判定）③经**真** `writeLocalE2EReceipt`（本树 `scripts/local-e2e-receipt.mjs`@`2ce86946` 原文 import·零改）行使真契约。回执逐行：

```
PASS P1a push-all row count (window-1 ledger) :: calls=65
PASS P1b row distribution :: {"reservation":22,"release":22,"call":21}
PASS P1c current mechanism receipt write throws actual_model_required :: local_e2e_receipt_g7_actual_model_required
PASS P2a fixed calls count :: calls=21
PASS P2b fixed all row=call :: {"call":21}
PASS P2c fixed all actualModel=qwen3.8-flash
PASS P2d model set :: qwen3.8-flash
PASS P2e cost sum unchanged (bookkeeping rows costless) :: fixed=0 current=0
PASS P2f receipt written + calls exactly 21 :: <tmpdir receipt .json>
PASS P2g receipt g7 flag
PASS P2h receipt assertionCount
PASS P3a legacy current calls :: 21
PASS P3b legacy fixed calls identical count :: 21
PASS P3c legacy fixed deep-identical to current
PASS P3d legacy cost identical
PASS P4a g7-98822 fixed calls :: fixed=15 pushall=47
PASS P4b g7-98822 all qwen3.8-flash
PROBE_EXIT=0
```

读法：P1=**红向复现**——现行机制对窗 1 真账本产出 65 行 calls（22+22+21）·真收据契约 throw 逐字=生产失败签名（cmd1.log 同值）；P2=**绿向修复**——修法甲判定+真契约 → 收据恰 21 条调用行全 `qwen3.8-flash`·成本恒等；P3=**legacy 兼容**——无 `row` 字段旧形账本上新旧机制 deep-identical（21=21·全等）；P4=第二账本 `g7-98822` → 恰 15（push-all 47=混簿记行）。

### 0.4 修法考证表（甲/乙定谳依据）

| 考证面 | 锚 | 读数 |
|---|---|---|
| 簿记行字段面 | guard `:430`-`:444` | reservation 行仅 `model`/`reserved*`·release 行仅 `reservationId`/`at`——**两簿记形均无 `actualModel`** ⇒ 契约必炸为类型级必然 |
| 读者口径 | guard `:611`-`:626` | 调用行判定=簿记排除+形状判定——`callCount`（cap 口径）只计调用行 ⇒ 收据 `calls` 镜用=与 cap callCount 同口径 |
| legacy 兼容面 | `G7LedgerRow :447` `row?: 'call'` + git log -S `row: 'call'`=`112e6d26f` 2026-10-16 | 旧账本 call 行无 `row` 字段 ⇒ 纯 `row==='call'` 过滤会**误删 legacy 调用行**（calls=[]⇒`calls_required` 炸）——判定须双臂（`row==='call'` 或 无 `row` 字段且形状合）·0.3-P3 机证 deep-identical 保绿 |
| 乙面波及 | receipt `:111`-`:126` | `optionalG7Fields` 为全 G7 e2e 收据唯一契约门 ⇒ 弱化=全收据面门强下降+簿记行入收据合法化 |
| requireCalls 语义 | runner `:4493` | `!failed` 非对称（红可空绿必查）——本刀零触（rev r1 收窄：无/空账本红 run 不变；带簿记账本红 run 修前收据写盘炸、修后转写盘成功·calls=调用行——requireCalls 语义与 exit code 不变·绿 run 从必炸转必成） |

---

## §1 修法（EXEC 期行使内容 · runner 单码面单 region · `scripts/run-e2e-isolated.mjs` `loadG7ReceiptFromLedger` 读入循环 additive +7/−0 · 其余全零触）

### 1.0 刀型唯一

本刀=案 A §9-LIVE ⑦「归 runner 域待另立登记」之行使：runner 收据门调用行判定修复。三边界：①修法=**甲定谳**（`loadG7ReceiptFromLedger` 只纳调用行进 `calls`）——**乙永不取**（`optionalG7Fields` 零字节·理由 1.1）；②载体唯一=`scripts/run-e2e-isolated.mjs` `:63`-`:70` 读入循环一 region·+7/−0 纯 additive 零删除行；③起草席零码动（本卷=spec 落纸）·EXEC 期按 1.2 逐字节行使·Ban 扩 region。

### 1.1 修法定谳=甲（理由全列·乙否决）

**甲**（`loadG7ReceiptFromLedger` 排除簿记行·只 push 调用行）成立四理由：①**类型级语义分层**——`G7LedgerRow`（guard `:446`-`:449`）三行形中 reservation/release 是 reserve-before-dispatch 成本守卫簿记（`:504`/`:548`），无 `actualModel` 字段——簿记行≠调用行·push 全行即类型错配；②**单一语义源**——guard 读者 `inspectG7SharedLedgerUnlocked`（`:611`-`:626`）已定义调用行判定（簿记 continue+形状判定），收据侧镜用=与 cap `callCount` 同口径·不发明第二判定；③**兼容双臂必选**——`row` 字段 2026-10-16 才入树·legacy call 行无 `row` 字段·纯 `row==='call'` 过滤误删 legacy 行（0.4 考证）·故判定=「排除 reservation/release + 形状判定（`estimatedCostCny` number ∧ `actualModel` string）」恰与读者同构·新旧两代账本全兼容（0.3-P3/P4 机证）；④**修面最小**——单 region additive +7/−0·收据契约/写侧/调用点/requireCalls 语义全零触。

**乙否决**（`optionalG7Fields` 对无 `actualModel` 行降级容忍）：①收据契约门弱化——该函数是全 G7 e2e 收据唯一逐 call 校验面（禁模/未声明模检查同门）·为簿记行开口=畸形行/空行同获豁免·fake-green 风险向；②语义污染——降级后 reservation/release 簿记行合法入收据 `calls`（窗 1 形=65 行·其中 44 行簿记）·收据 `calls` 语义从「模型调用清单」漂移为「账本全行 dump」·与 cap 口径 `callCount` 分叉；③隐私/洁净面——收据 `dataHandling` 声明 `no_output_prompt_answer_token_endpoint_or_connection_string_persisted`·簿记行无增益纯杂质；④修面更大——改契约波及全 G7 收据历史读法·甲只改 runner 单 region。**甲>乙 定谳·乙 永不取（Ban）**。

### 1.2 EXEC 行使面（逐字节 spec·落点=`scripts/run-e2e-isolated.mjs` `:63`-`:70`）

现行字节（blob `cde76fda`·亲读）：

```js
  if (existsSync(ledgerPath)) {
    const lines = readFileSync(ledgerPath, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const row = JSON.parse(line);
      calls.push(row);
      estimatedCostCny += Number(row.estimatedCostCny ?? 0);
    }
  }
```

替换字节（+7/−0·纯 additive·零删除·注释不含任务号/刀号）：

```js
  if (existsSync(ledgerPath)) {
    const lines = readFileSync(ledgerPath, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const row = JSON.parse(line);
      // Ledger bookkeeping rows (reservation/release) are cost-guard accounting,
      // not model calls. Classify call rows exactly like the shared-ledger reader
      // in packages/ai-runtime/src/g7-freetier-reprove-guard.ts
      // (inspectG7SharedLedgerUnlocked) so receipt `calls` carries only actual
      // model-call rows; legacy rows without a `row` field stay accepted.
      if (row.row === 'reservation' || row.row === 'release') continue;
      if (typeof row.estimatedCostCny !== 'number' || typeof row.actualModel !== 'string') continue;
      calls.push(row);
      estimatedCostCny += Number(row.estimatedCostCny ?? 0);
    }
  }
```

勘误注（rev r1·dual 双席机械定谳）：现行块 `:63`-`:70` region 本身恰 8 行·疑与「+8」混淆（误将 preserved 计入 delta）——实算=替换块 15 行 vs 现行块 8 行纯插入 **+7/−0**（5 注释行+2 守卫行·preserved 8/8·两席独立定谳：逐行模拟 delta=+7 + /tmp git 仓逐字节 patch 后 numstat 实测 `7 0`）·EXEC 按 §1.2 逐字节行使即得 numstat `+7 -0`·原「+8」口径下 A2 必红触 §8 停手·凑行凑数=spec 漂移触 §5 Ban。

语义注（spec 性质·不入码）：判定双臂与 guard 读者 `:612`/`:620`/`:621`-`:623` 同构；`row==='call'` 行天然过形状臂（字段全）；`estimatedCostCny` 累加随 `continue` 只累计调用行=读者 `:624` 同口径（簿记行成本恒 0·0.3-P2e 恒等机证）；`:57`-`:62` 函数头/`:71`-`:87` fingerprint+返回形/`:4492`-`:4493` 调用点/`requireCalls` 语义全零触。镜像边界（rev r1 补）：本判定系 guard 读者 `inspectG7SharedLedgerUnlocked` 口径的 runner 侧镜像——未来读者口径变更（含新增簿记行型）须 runner 镜像随刀重同步·Ban 单侧漂移；带形状字段（`estimatedCostCny` number ∧ `actualModel` string）的新簿记行将与读者同口径进入 `calls`（fail-closed 兜底=契约 declared 集查 `:118`-`:125` `model_undeclared` 炸收据翻红·不静默）。

### 1.3 「旧代码忽略仍正确」书面结论（wire/结构兼容义务）

账本 ndjson 面新增 `row` 字段自 `112e6d26f`（2026-10-16）：**旧读法**（push-all 无判定）对三形账本的行为——legacy 全 call 行（无 `row` 字段）全纳✓ / 新形全 call 行全纳✓ / 三行组混合形炸收据（本刀修面）。**新读法**（本刀判定）对三形——legacy 全 call 行全纳（形状臂过·`row` 字段缺席不影响）✓·新形全 call 行全纳✓·三行组混合形只纳调用行✓。**结论：旧账本（任何代）在两代读法下 `calls` 恒等（0.3-P3 deep-identical 机证）——旧读者（旧 runner 代码）对新账本的唯一失败点=本刀修面本身·无其余静默漂移**；`estimatedCostCny` 累加：簿记行无该字段恒 0·判定后仍只累计调用行·新旧恒等（P2e）。收据契约零改 ⇒ 旧收据读者期望（每 call `actualModel`）不变。**无「旧代码忽略仍正确」例外残留**。

### 1.4 零触面（全列）

`scripts/local-e2e-receipt.mjs`（乙否决·零字节）· `packages/ai-runtime/src/g7-freetier-reprove-guard.ts`（读者/写侧零触）· runner 其余 4533 行（`:57`-`:62`+`:71`-`:87` 同函数其余段+`:4490`-`:4515` 调用点全零触）· e2e suite/断言面 · 双 package.json 入口 · ledger 写侧·cap/PTP 语义面（仅 §3 数值）· 产品码/迁移 · matrix/backlog/checklist 三 SSOT · 案 A 卷既闭史录 · 在飞 fin/g7w 两支。

---

## §2 断言预算（EXEC 期机器可判 · 逐条 EXIT · 数字口径以实跑实测为准）

- **A1 面收敛门**：`git diff --name-status origin/main..HEAD` = 起草期恰 3 tracked（`A ai-docs/delivery/harness/r2-receipt-gate-REQUEST.md`+`M` 两 policy）+ EXEC 期恰 1 tracked 增量 `M scripts/run-e2e-isolated.mjs`（+收据 `.log` ∉TEXT_EXTENSIONS 不计）；**`scripts/local-e2e-receipt.mjs`/guard/e2e/产品码/迁移/双 package.json/matrix/backlog/checklist 零命中**（乙否决机证=`git diff origin/main..HEAD -- scripts/local-e2e-receipt.mjs` 空集）。
- **A2 patch 机证**：`git diff origin/main..HEAD -- scripts/run-e2e-isolated.mjs` numstat = **+7/−0**（纯 additive 零删除行）·恰 1 hunk 落 `loadG7ReceiptFromLedger` 读入循环区（届 tip 行号重 pin）·hunk 外 runner 字节零漂。
- **A3 真实账本回放（最强验收断言·派单令第 3 条）**：以 2026-11-04 窗 1 在盘真账本 `.tmp/g7-ledgers/g7-91160-1793811488060.ndjson`（sha256 `8c83cd69…`·21 call 全 `qwen3.8-flash`·**物理源=主仓 `.tmp/g7-ledgers/`（主仓 worktree 根=本 worktree `meetwise-r2` 同级 `../meetwise`·即 `../meetwise/.tmp/g7-ledgers/`）**·sha256 复核后复制进 EXEC 临时目录回放·§5「Ban 动主仓」不涉读）回放收据写入——红向：现行 push-all 复刻+真 `writeLocalE2EReceipt` → throw **`local_e2e_receipt_g7_actual_model_required`**（与 cmd1.log 生产签名逐字同值）；绿向：1.2 替换字节落树后同账本+真 `writeLocalE2EReceipt`（repoRoot=本树·临时 receiptRoot·`requireCalls:true`·`assertionCount:148`）→ **收据 `calls` 恰 21 条·全 `row='call'`·全 `actualModel='qwen3.8-flash'`**·`estimatedCostCny` 与旧机制恒等；附第二账本 `g7-98822…` → 恰 15。回放脚本+读数全文入收据 `.log`（只准 `.log`·临时目录行使·Ban `.mjs` 入树）。复刻钉（rev r1 补）：`loadG7ReceiptFromLedger` runner 内未导出（`run-e2e-isolated.mjs:57` 定义·`:4492` 唯一调用·无 export）→红/绿两向判定均按 §1.2 字节于回放脚本内复刻（非 import）；绿向经真 `writeLocalE2EReceipt` 过 `assertReceiptInput` 全门→`reviewLedger` 需 ≥1 合法件（`local-e2e-receipt.mjs:31`-`:43`·passed 臂 `:39`-`:40`）·回放须备。**断言红即停（§8）·Ban 借机修**。
- **A4 起草期探针读数**：§0.3 17/17 `PROBE_EXIT=0` 亲证在卷——EXEC 立项时对届 tip 复跑同探针（红向签名+绿向 21/15 两读数·判读同 §0.3）·读数漂移即停重 pin。
- **A5 三门**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned=cap 恰等**（起草落卷后 2480=2480；EXEC 期零新增受管件 → terminal 2480 零再步进）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**；markers 门=改动集（起草 3+EXEC 1 tracked+收据 .log）五类标记词（词面运行时组装防自指·同 `scripts/i6-239-gates.proof.mjs` §2-7 口径·本卷不复抄）+ 行首冲突标记 **0 命中**。
- **A6 真机绿收据（LIVE·判别 run）**：恰 1 次 `G7_FREETIER_REPROVE=1` 的 `e2e:isolated`（est live≈7/run 账本口径沿案 A §0.2c）→ `LOCAL_E2E_RECEIPT file=… release_evidence=false` 消息面 EXIT=0·收据 `calls` 计数=实跑调用行数（簿记行零混入）——**LIVE 授权归协调方另行·两票分立**（EXEC 授权≠LIVE 授权·沿案 A §8 条款形）·本卷起草零行使（est live=0）· Ban retry-to-green。

---

## §3 cap 预登（本卷 REQUEST +1 ⇒ **CAP-SANCTION-2480** · 沿 nk1/flip/sse2/err/l13 预登形 · 随届值如实采=唯一豁免项）

- **union 算式**：main 届扫 2479（=cap 2479 恰等·CAP-SANCTION-2479 L-13 起草承值·起草前本树 docs:check EXIT=0 scanned 2479 亲证）+ 本卷 `harness/r2-receipt-gate-REQUEST.md` 受管 1 件 = **2480 恰等零多放**（=派单令预登值 2479+1 恒等）。
- **起草 commit 即行使**（沿 l13「起草 commit 即行使 CAP-SANCTION-2479」先例形·协调方派单常设预授权「随届值如实采·恰等步进预登」随令）：两 policy 四联动点 **2_480 形**——`public-text-policy.mjs` `const MAX_FILES = 2_480`（现 `:299`）+链区 `CAP-SANCTION-2480` 注记一行（现 `:298` 上邻）；`public-text-policy.proof.mjs` `i < 2_480`（现 `:452`）/`scannedFiles, 2_480`（现 `:459`）/'ai-docs/f-2480.md'（现 `:491`）/`FILE_LIMIT}:2481`（现 `:494`）（+现 `:460`-`:461` 相邻注释两处同步·链区 `CAP-SANCTION-2480` 注记一行·行号随 merge-tree 重排·EXEC 立项照届时 tip 重 pin）。
- **EXEC 期零新增受管件**（runner `.mjs` 既有件 in-place·收据只准 `.log` ∉TEXT_EXTENSIONS 不计）⇒ **terminal 2480 零再步进**。
- **在飞如实采**（本 turn `git branch` 逐支亲算）：`fin-draft`@`2a4b09f22` ahead=1 承 2480（其卷 fin-REQUEST.md 受管 1 件·**两 policy 热面**）·`g7w-draft`@`86af8b34b` ahead=2 承 2481（两新 REQUEST 受管 2 件·**两 policy 热面**·其派单预登 2480 系单卷估式如实采 +2）——两支均未并 main 且同触两 policy=已知共享热面 dual-keep 先例形（main 侧既有注记史录全保留+后并支注记并留·号随 merge-tree 重排·并线期 union 沿常设预授权届时重算承登）；ag20/loadw/pay/scoringeval/uc31 各 ahead=1 两 policy 零触（不步进 cap）·campaign-state/ag18/cap-2272/5c 族等 ahead≥2.3k ancient 分叉不预采 · df/rc/l13/err/uc011adv/audit 七支 ahead=0 已并或空面。

---

## §4 非范围（全列 · 越界即废）

1. **乙修法面**：`scripts/local-e2e-receipt.mjs` `optionalG7Fields`/`assertReceiptInput`/reviewLedger 门任何字节（定谳 1.1·乙永不取）。
2. **guard/ledger 写侧**：`g7-freetier-reprove-guard.ts` 读者/写侧/价格簿/类型全零触（判定镜用不镜改）。
3. **runner 其余面**：`loadG7ReceiptFromLedger` 读入循环外任何段（含 fingerprint/返回形/调用点/`requireCalls` 语义/LIVE 白名单/隔离栈叙事）零触。
4. **e2e 断言面与性能套件**：窗 1 断言 148 全绿本身零触·cmd3 性能套件红（`e2e_performance_suite_failed`）非本刀面。
5. **LIVE 跑数**：判别 run 无协调方两票分立授权不行使（§2-A6 预登）· Ban 起草期 live。
6. **SSOT 行翻面**：案 A 卷/backlog/matrix/checklist 任何行零字节（史录 closed 态不洗）·旧收据（74825/90482）零回写。
7. **cap/PTP 语义面**：两 policy 仅 §3 数值步进·`MANAGED_ROOTS`/`TEXT_EXTENSIONS`/扫描面零改。

---

## §5 Ban

Ban push/force-push/pull --rebase（git 写只本 worktree 起草 commit）· Ban 动主仓 · Ban self-approve（pre-exec 双审两独立外席·alone≠dual）· **Ban 乙修法**（收据契约门弱化永不取·任何理由）· Ban 起草期码动（runner `.mjs` 本卷零字节·EXEC 期唯一 region=1.2）· Ban 扩 region（1.2 hunk 外 runner 任何字节）· Ban 判定单臂化（纯 `row==='call'` 过滤=legacy 误删·1.1-③）· Ban retry-to-green（A3/A6 红 run 不重跑冲销）· Ban LIVE 未授权先跑（两票分立）· Ban 翻 SSOT 行/旧收据回写 · Ban 代码注释写任务号/刀号 · Ban 改两 policy 语义面 · Ban 收据落 `.md`/`.txt`/`.json`（只准 `.log`）· Ban 敏感物料入收据（key 全值/连接串/prompt/answer——keyFingerprint 前 8 hex 为现形上限）· Ban wash（EXIT=1 史实不写作已绿/已修）· Ban 赛后手补尾注。

---

## §6 pins（同族卷照抄 · EXEC/审查不得改口 · 本刀零翻转 · **cap 项唯一豁免=随届值如实采**）

`releaseEvidence=false` · `haStatus=NOT_HA` · `claimProductionHA=false` · `PG-retained`（Postgres/PostgresSaver/pgvector 业务切流叙事禁）· `actualSpendCny=null`（本刀零模型外呼·est live=0）· `g7SuiteGreen=false`（free-tier green ≠ production-model/perf-SLO evidence·`evidenceLabel` 原样）。

**本卷附加钉**：修法=**甲**·乙永不取 · `optionalG7Fields` 契约零改 · `requireCalls: !failed` 语义零改 · ledger 簿记行不入收据 `calls` · 判定双臂与 guard 读者同构（§1.2）· 窗 1 回放断言=calls 恰 21 全 `qwen3.8-flash`（§2-A3）· `cap = 2480`（CAP-SANCTION-2480 恰等·随届值如实采=唯一豁免项）· 断言预算六门（§2）。

---

## §7 Non-claims

本刀 **≠** 绿 run 已重跑/已绿（判别 run 未行使·A6 预登） **≠** 案 A 卷 §9-LIVE ⑦ 或其行状态触碰（closed 史录·零洗） **≠** G7W-TAIL-DEATH/backlog/matrix/checklist 任何行翻面（权归协调方） **≠** 在飞 fin/g7w 两支代答（各自行链独立） **≠** runner 其它面（LIVE 白名单/隔离栈/性能套件）已修 **≠** 收据契约已弱化或已改（乙否决·零触） **≠** 74825/90482 旧收据回写或冲销 **≠** G7 cap/cost 口径变化（读者口径镜用非新造） **≠** production-model/perf-SLO evidence（`evidenceLabel` 原样） **≠** 任何 SSOT 行文字改写。drafted ≠ DONE（完成判定走 pre-exec dual + 协调方 EXEC 授权 + 判别 run LIVE 授权 + post dual）。

---

## §8 STOP（停手 · 开工三条款 + 停止条件五类）

**STOP · `executed:awaiting_post_prove_dual`（2026-11-05 EXEC 行使落卷转 · 前值 `drafted:awaiting_pre_exec_dual` 史录保留 · 详 §9 EXEC 期行使记录 · 状态钉=Status/§8/§9/卷尾 四处同值）。** 开工三条款（未履行不得 EXEC）：① **pre-exec 双审两独立外席 BOTH PASS 落卷**（双审对象=§0 锚保真+§1.2 逐字节 spec+§1.1 甲/乙定谳+§2 断言预算）；② **协调方明示 EXEC 授权**（派单令授权起草≠授权 EXEC）；③ **§0 全量对届时 tip 重 pin**——runner `:57`-`:87`/`:4490`-`:4515`、receipt `:105`-`:140`、guard `:430`-`:640`、案 A `:237`、两 policy 四联动点任一 blob/行号漂移且结论受疑即回炉。

- **现场漂移**：届时 tip 上 `loadG7ReceiptFromLedger`/`optionalG7Fields`/guard 读者已被任何刀改字节 / 案 A ⑦ 登记行被洗 → 停·重 pin·如实登记。
- **机制不满足**：A3 回放红（calls≠21 / 红向不炸 / P3 兼容恒等破）→ **停手上报**·stash 对照亲证基线·**Ban 借机修**。
- **ALREADY_CLOSED**：届 tip runner 已修（`calls.push` 已带判定/等价修复在树）→ 停上报·零增量·不得重复立刀。
- **越界需要**：被要求改 `local-e2e-receipt.mjs`（乙）/guard 写侧/翻 SSOT 行/无 LIVE 票跑判别 run → 停（§4 全列）·另刀或协调方裁决。
- **验收红不可修**：docs 门 scanned>cap 2480 / PTP 红 → 停（起草期未落 §3 前 2480 超限系**预期红**·先落 cap 步进再跑三门）。

---

## §9 状态

**`executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷转 · 前值 **`drafted:awaiting_pre_exec_dual`**（2026-11-05 起草落卷即停）史录保留 · 详下文 EXEC 期行使记录 · 状态钉=Status/§8/§9/卷尾 四处同值 · 原钉文：本卷恰 3 tracked 路径=本卷 `.md`+两 policy 脚本 · EXEC 期增量恰 1 tracked `M scripts/run-e2e-isolated.mjs`（+7/−0）+ 收据 `.log` 一枚（∉TEXT_EXTENSIONS 不计）· `local-e2e-receipt.mjs`/guard/e2e/产品码/三 SSOT/既闭链卷全零触亲证 · est live=0（起草零外呼零容器零 DB 零 Key 加载·探针全本地临时目录）· `actualSpendCny=null` · markers=0 · ⛔push ⛔动主仓 ⛔merge 主线 ⛔force push 未用 · 落卷即停）。

**门读数（起草席亲跑·2026-11-05）**：改前基线——门 1 docs **EXIT=0 · scanned 2479 = cap 2479 恰等**（`ai-docs check passed: 80 required files verified; public text policy scanned 2479 managed worktree files` 亲读）· 门 2 PTP **12/12 EXIT=0**（`static_preflight_valid: selected=12/12` 亲读）。落卷后复跑（同口径亲跑·见 git log 本 commit）：门 1 docs **EXIT=0 · scanned 2480 = cap 2480 恰等** · 门 2 PTP **12/12 EXIT=0**（四联动点 2_480/f-2480.md/:2481 已落位）· 门 3 markers 改动集 3 tracked 五类标记词+行首冲突标记 **0 命中**（词面运行时组装·i6-239 §2-7 口径·本卷不复抄）· 面收敛 `git diff --name-status origin/main..HEAD` 恰 3 tracked=`A ai-docs/delivery/harness/r2-receipt-gate-REQUEST.md`+`M scripts/ai-docs/public-text-policy.mjs`+`M scripts/ai-docs/public-text-policy.proof.mjs`。

**起草期回放探针读数（§0.3·17/17 全绿 PROBE_EXIT=0）**：红向 P1（现行机制×窗 1 真账本=65 行 calls·真契约 throw `local_e2e_receipt_g7_actual_model_required` 逐字=生产签名）+ 绿向 P2（修法甲×真契约=收据恰 21 条调用行全 `qwen3.8-flash`·成本恒等·assertionCount 148）+ 兼容 P3（legacy 无 `row` 字段账本新旧 deep-identical 21=21）+ 第二账本 P4（`g7-98822` 恰 15）——EXEC 期按 §2-A4 对届 tip 复跑·§2-A3 落树后终证。

**EXEC 期预登（未行使·授权后）**：§1.2 替换字节逐字落位（+7/−0·A2 机证）· §2-A3 真实账本回放读数收据 `.log` 落卷（只准 `.log`·回放脚本全文内嵌）· 三门复跑同 §2-A5 · 行号对届 tip 重 pin（漂则如实采新值·定性漂移即停 §8）· A6 判别 run 留 LIVE 授权两票分立。

**EXEC 期行使记录（2026-11-05 · 开工三条款履行亲证：① pre-exec dual 两独立外席 BOTH PASS 在卷（协调方确认随令）② 协调方派单令 2026-11-05 EXEC 授权随令（主门判别 run 授权同令明示「pnpm e2e:isolated freetier=1·Key 已在位·单跑」）③ §0 对届 tip 重 pin 零定性漂）**：

- **rebase 届核 + cap 届值如实采**：`git fetch origin` EXIT=0·origin/main 前进 `edda65a44`→`09fe2a23d`（#199 fin 已并）·detached worktree `node scripts/ai-docs/check-docs.mjs` EXIT=0 `scanned 2480 managed worktree files`（main 届扫 2480=cap 2480 恰等亲跑）→ `git rebase origin/main` 行使·冲突=两 policy 脚本 3 处冲突块（policy 注记区+proof 形状注释区+proof 注记/overCap 区·均在注记/注释行·数值行双侧同改自动归并）·dual-keep 双留（main 侧 CAP-SANCTION-2480 FIN 注记史录全保留+本支起草 2480 注记并留+新增 CAP-SANCTION-2481 union 注记·沿 CAP-SANCTION-2478 ERRATA-SWEEP rev r1 dual-keep 先例形）·union 算式=main 届扫 2480+本卷 1=**2481**·四联动点 2_481/f-2481.md/:2482 恰等改·在飞如实采=idu-draft 承 2480（ISO-DOTENV-UI 两 policy 热面）/g7w-draft 承 2481 竞争如实列·rebase 后 runner/receipt/guard blob 恰等零漂（`cde76fda`/`2ce86946`/`4e75fae7` 亲证）·rebase 后 docs EXIT=0 scanned 2481=cap 2481+PTP 12/12 复跑全绿。
- **§1.2 修法逐字节落位（+7/−0）**：`scripts/run-e2e-isolated.mjs` `loadG7ReceiptFromLedger` 读入循环 5 注释行+2 守卫行纯插入零删除·A2 机证=`git diff --numstat -- scripts/run-e2e-isolated.mjs` **`7 0`**·恰 1 hunk `@@ -64,6 +64,13 @@` 落读入循环区·hunk 外 runner 字节零漂（落 commit 后 `origin/main..HEAD` 同值复核）。
- **A3 真实账本回放（§2-A3 最强验收·账本物理源=主仓 `../meetwise/.tmp/g7-ledgers/` sha256 复核 `8c83cd69…4c1`/`3b31faf9…2d3` 后复制临时目录·主仓零触）**：**17/17 PASS `PROBE_EXIT=0`**——红向 P1c 现行 push-all 复刻×真 `writeLocalE2EReceipt` throw `local_e2e_receipt_g7_actual_model_required` 逐字（=cmd1.log 生产签名）·绿向 P2f 真收据落盘 `calls` 恰 21 全 `row='call'` 全 `qwen3.8-flash`（P2g g7 flag·P2h assertionCount=148·requireCalls=true 门过）·P2e 成本恒等·P3 legacy 无 `row` 字段账本新旧 deep-identical 21=21（P3c deep=true）·P4 `g7-98822` 恰 15（pushall=47）——读数与 §0.3 起草探针逐字全同=A4 复跑零漂·回放脚本全文+读数入收据 `.log` `ai-docs/delivery/receipts/r2-receipt-gate/01-exec-ledger-replay.log`（只 `.log`·临时目录行使·Ban `.mjs` 入树未犯）。
- **A6 主门判别 run（LIVE 授权=协调方派单令明示随令·恰 1 判别 run·原值记账不冲销）**：`G7_FREETIER_REPROVE=1 E2E_SKIP_DOTENV=1 pnpm e2e:isolated`（loader 方式 b `~/.meetwise-secrets/load-model-api-key.sh` 进程 env 注入·零 .env 落盘·case A ① 先例形）——attempt 1（19:17Z）**EXIT=1 系 infra 红**（`E2E_FAILURE class=db code=isolated_postgres_database_not_ready:boot`·worktree node_modules 缺位·套件零行使零断言账本空=非判别 red·log `.tmp/g7-run-r2-exec-cmd1.log` 原值留存不洗）→ 环境预备 `pnpm install --frozen-lockfile`（3.8s·非破坏）→ **attempt 2=判别 run：`E2E_FINAL_SUMMARY assertions=147` 全绿形（`E2E_REVIEW_CLASS_COUNT count=26` 全观测码·`E2E_FAILURE` 行 0）+ `LOCAL_E2E_RECEIPT file=…-42599-….json release_evidence=false`（`LOCAL_E2E_RECEIPT_FAILED` 0 命中）+ EXIT=0**——真账本 `.tmp/g7-ledgers/g7-42599-1793820153485.ndjson` 58 行=reservation 20+release 20+**call 18**（混合三行形=窗 1 毒形）→ 收据 `calls` 恰 18 全 `row='call'` 全 `qwen3.8-flash`·estimatedCostCny=0·keyFingerprint=d26808ef（8 hex 现形上限）——**窗 1 同形（绿 run×混合账本）修前必炸 `local_e2e_receipt_g7_actual_model_required`→修后收据写盘成功 EXIT=0=R2 修复端到端兑现**（对照窗 1 cmd1.log：assertions=148+收据门炸+EXIT=1）。**断言数 147 vs 窗 1 的 148 漂移如实披露**：seg_expert 段本 run `report_ready`（窗 1 `report_unavailable` 降级形）·26 观测码集其余逐位相同·零 E2E_FAILURE·漂移系产品路径方差非收据门面（+7/−0 仅行使于套件后收据写盘）·est live：est≈7/run（案 A §0.2c 口径）→ 实测 18 次模型调用（est-not-counter 口径如实记账非偏离）·actualSpendCny=null（Ban fabrication）。
- **三门复跑（改动集终形=3 tracked+runner+收据 `.log` 恰 5 件）**：门 1 docs **EXIT=0 scanned 2481=cap 2481 恰等**（`80 required files verified; public text policy scanned 2481 managed worktree files` 亲读）·门 2 PTP **12/12 EXIT=0**（`static_preflight_valid: selected=12/12`）·门 3 markers 改动集 5 件五类标记词+行首冲突标记 **0 命中**。
- **§0 行号重 pin 读数（届 tip）**：runner `:57`-`:87`/`:4490`-`:4515`·receipt `:105`-`:140`·guard `:430`-`:449`/`:504`-`:596`/`:598`-`:640`·案 A `:237` 全零漂亲证·两 policy 联动点随 fin 注记+union 注记重排（policy `MAX_FILES` 现 `:302`·proof 形状注释现 `:460`-`:461`/overCap 区现 `:491`-`:497`·§0.2 锚基=edda65a44 史录维持）·结论零漂·A1 面收敛亲证（`git diff origin/main..HEAD -- scripts/local-e2e-receipt.mjs packages/ai-runtime/src/g7-freetier-reprove-guard.ts` 空集）。

**后续**：pre-exec 双审两独立外席留协调方派席 · 状态钉=Status/§8/§9/卷尾 四处同值（翻面/关账权归协调方） · alone≠dual · Ban self-approve · ⛔push。

## rev r1（2026-11-05 · pre-exec dual 双席 FAIL 同判一处 P1·机械定谳 → 回炉修订 · 修订史录·非新刀）

修法定谳甲/乙不变 · §6 pins 零翻 · 零 EXEC 行使 · 状态钉四处维持同值（本节非状态钉）。落法：

- **P1（必改·8 处断言值一字符改）**：全卷 8 处 delta 断言误写 `+8`（add/−0 形）与 §1.2 字节矛盾——替换块 15 行 vs 现行块（`run-e2e-isolated.mjs:63`-`:70`）8 行=纯插入 **+7/−0**（5 注释行+2 守卫行·preserved 8/8·两席独立机械定谳：逐行模拟 delta=+7 + /tmp git 仓逐字节 patch 后 numstat 实测 `7 0`）。8 处=Status/§1 标题/§1.0②/§1.1④/§1.2 标题/§2-A2 机证门/§9/§9 EXEC 预登——全改 **+7/−0**·§1.2 加勘误注（region 本身恰 8 行疑与「+8」混淆）。原口径下 EXEC 逐字节行使必致 A2 numstat 红→§8 停手·凑满 8 行=spec 漂移触 §5 Ban。
- **P2-1（STOP 钉枚举统一）**：原 Status「三处=本行+§8+卷尾」vs §9 后续「三处=Status+§8+本节」互斥·实际 4 处同值——统一「钉=Status/§8/§9/卷尾 四处同值」（Status/§8/§9/后续/卷尾五处枚举句全对齐）。
- **P2-2（§0.4 requireCalls 行收窄）**：「红 run 行为不变」改为——无/空账本红 run 不变；带簿记账本红 run 修前收据写盘炸、修后转写盘成功（calls=调用行）——requireCalls 语义与 exit code 不变。
- **P2-3（§认领核对 74825/90482 引证勘正）**：在盘两红收据**无嵌套 g7 块**（契约平铺+红臂 requireCalls=false flag off）——初稿「g7 块 calls:[]」系误读；非对称实证改锚=代码链（runner `:4493`+`optionalG7Fields:108`-`:114`）+ cmd1.log + §0.3 沙箱读数。
- **P2-4（§2-A3 落点补钉）**：账本物理源=主仓 `.tmp/g7-ledgers/`（主仓 worktree 根=本 worktree 同级 `../meetwise`·即 `../meetwise/.tmp/g7-ledgers/`·sha256 复核后复制进 EXEC 临时目录回放·§5 Ban 动主仓不涉读）；明记 `loadG7ReceiptFromLedger` 未导出→判定按 §1.2 字节于回放脚本内复刻；补 `reviewLedger` 需 ≥1 合法件（`local-e2e-receipt.mjs:31`-`:43`）。
- **P2-5（§1.2 语义注补「镜像边界」）**：未来 guard 读者口径变更（含新增簿记行型）须 runner 镜像随刀重同步；带形状字段的新簿记行会与读者同口径进入 calls（fail-closed 兜底=model_undeclared）。
- **P2-6（§0.1-② 史实补正）**：reservation/release 行写侧自 `b74e4e09f`（2026-09-23）即产生（`row` 字段叙述限定 call 行）·混合账本炸收据窗口自该时点起。

**rev r1 三门亲跑（本席·2026-11-05）**：docs EXIT=0 scanned 2480=cap 2480 恰等 / PTP 12/12 EXIT=0 / markers 改动集（本支 3 tracked）五类标记词+冲突标记 0 命中 · `git diff --name-only origin/main..HEAD` 恰 3 tracked 不变（本卷 `.md`+两 policy 脚本·cap 联动承 r0）。

*R2-RECEIPT-GATE REQUEST · 2026-11-05 起草 · **`executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷转 · 前值 `drafted:awaiting_pre_exec_dual` 史录保留 · 详 §9 EXEC 期行使记录 · 状态钉=Status/§8/§9/卷尾 四处同值）· base `origin/main` @`edda65a44`（PR #198 并线点·fetch EXIT=0·worktree `meetwise-r2` 亲立·branch `line/r2-draft` 建前零同名卷/零第二认领三查亲证）· 立项出处=案 A 卷 §9-LIVE ⑦（`g7w-tail-seg-emit-REQUEST.md:237`@`fbd7027e`）+协调方派单令 2026-11-05（R2-RECEIPT-GATE·起草落卷即停·禁 EXEC·禁改 runner 代码 EXEC 期行使·上波撞并发限额未跑重派）· 修法定谳=甲（runner 只纳调用行·判定双臂镜用 guard 读者口径）·乙否决（收据契约零触）· 起草期回放探针 17/17 PROBE_EXIT=0（红向复现+绿向 21/15+legacy 恒等）· CAP-SANCTION-2480 起草随刀恰等步进预登（main 届扫 2479+本卷 1=2480·在飞如实列 fin/g7w 两 policy 热面+五 ahead=1 零触支+ancient 不预采）· est live=0 · actualSpendCny=null · markers=0 · STOP=drafted:awaiting_pre_exec_dual · pre-exec dual ≠ 开工 · ⛔push ⛔merge 主线 ⛔force push（落卷即停·EXEC/判别 run/闭合授权全归协调方）*
