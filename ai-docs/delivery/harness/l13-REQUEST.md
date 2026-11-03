# L-13 REQUEST — 静态库存勘误+老 proof 静面更新起草卷（UC-E2E-028 老 prove 绊线静态处置 · harness §1b/G-GAP/eval 面勘误 · docs-only 起草落卷即停 · ⛔EXEC ⛔push ⛔动主仓）

**Status**: **`drafted:awaiting_pre_exec_dual`**（2026-11-03 起草落卷即停 · pre-exec 双审两独立外席待派 → Dual PASS → 协调方明示 EXEC 授权后始有 EXEC（行使面=§1 两处 additive 卷尾勘误注：`harness/uc-e2e-028-trace-ledger-fail-open.md` 新增 §5 静态库存勘误注 + eval 面卷尾时点勘误注 · 老 proof 本体/两 package.json/runner/cite 脚本/matrix/backlog/checklist 全零触 · 行翻面权归协调方）· alone≠dual · Ban self-approve · est live=0 · markers=0 · 状态钉三处：本行 + §8 + 卷尾 · 同值）

**席位**：meetwise 北星「L-13 静态库存勘误」P2 刀起草席（docs-only 起草 · 协调方派单显式授权「本 P2 项走完整链」随令 · ⛔push ⛔动主仓）。
**基线**：`origin/main` @ **`8c8119d0c`**（full `8c8119d0c341e6382172586f3f657e9385e2a710` = PR #196 `line/err-draft` 并线点 · `git fetch origin` 本 turn EXIT=0 · 本 worktree `meetwise-l13` 由 `git worktree add ../meetwise-l13 -b line/l13-draft origin/main` 亲立 · HEAD 落 `8c8119d0c` 亲证）。起草前本树三门亲跑：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2478 = cap `2_478` 恰等零余量**（`scripts/ai-docs/public-text-policy.mjs:298` `const MAX_FILES = 2_478` 亲读）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**；改动集 markers 零命中（词面运行时组装·本卷不复抄）。**本卷 +1 受管件必越** ⇒ 起草 commit 即行使 **CAP-SANCTION-2479（cap 2478→2479 恰等零多放）**，四联动点在 §3 逐点登记；落卷后复跑 `scanned 2479 = cap 2479` 亲证（§9）。

**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/README.md`（知识层定位）→ `ai-docs/delivery/gap-bug-backlog.md:925`（L-13 立项 SSOT 行·本刀授权与 Ban 全文在行内）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md:127`（UC-E2E-028 行+2026-10-27 翻面注）/`:187`（执行体行+「静态库存更新属另刀」令）/`:278`（P1-10 行）/`:518`-`:521`（Line X nail+对账翻面注）→ `ai-docs/delivery/harness/uc-e2e-028-trace-ledger-fail-open.md`（**E1 目标卷**·§0 `:12`/§1 `:27`-`:41`/§1b `:55`-`:67`/§2 `:73`/§3 `:96`/§4 `:109`）→ `apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs`（**老 proof 本体·零触**）→ `receipts/archive/2026-09-batch23/eval/uc-e2e-028-trace-ledger-fail-open.eval.md`（**E2 目标卷**·2026-09-10 时点记录 78 行）→ `ai-docs/delivery/harness/uc028-e2e-REQUEST.md`（Status `closed` · case-①②③ 闭合证据）→ `ai-docs/delivery/harness/trace-recon-REQUEST.md`（Status `closed` · §0.2-1 `:37` 读码定稿+§1.3 `:72` 候选三否决）→ `ai-docs/delivery/execution-master-checklist.md:1130`-`:1136`（Line X nail 段）→ `packages/ai-runtime/src/invoke.ts:518`-`:530`/`:1206`-`:1210`（persistTraceBestEffort 现态）→ `packages/db/migrations/0207_ai_trace_backfill_scoped.sql`+`apps/worker/src/trace-recon.ts`（RECON 承接体）→ `scripts/eval-harness-matrix-cite.proof.mjs:246`-`:262`/`:516`-`:517`（cite 门 evalDoc 路径与 mustPins 面）→ 两 policy 面（`public-text-policy.mjs:298` MAX_FILES+链区 · `public-text-policy.proof.mjs:452`/`:459`/`:460`-`:461`/`:490`/`:493` 四联动点+链区）。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：① `gap-bug-backlog.md:925` L-13 行原文：「处置刀=静态库存勘误+老 proof 静面更新（新 REQUEST 全链+协调方显式授权）· **Ban 静默改维持**（老 proof 本体零改动·处置刀须全链行使）· 非缺陷定谳·绊线现态=设计内」；② 同行所需 harness 路径列 = 老 proof + harness §1b + 矩阵 Line X `:520`；③ 矩阵 `:187` 更新列「老 prove …= 设计绊线（其静态库存更新属另刀）」+ `:521` 对账翻面注「老 prove 绊线静态库存处置已另刀登记（backlog L-13·Ban 静默改维持）」——本卷即该另刀；④ 协调方派单令（2026-11-03 · 显式授权 P2 项走完整链 · 落卷即停 · dual 归后续波次）。

---

## 认领核对 · 登记处 fresh 亲点（逐行对 `origin/main` @`8c8119d0c` 亲读亲算）

| 登记处 | 对树行使证据（file:line / blob 亲读） | 判定 |
|---|---|---|
| backlog L-13 行 | `gap-bug-backlog.md:925`（blob `403fc48e` 979 行·**派单令所记 `:924` 系邻行 L-12·L-13 实锚 `:925`·一行偏差如实登记不改令**）· P2 **OPEN**（另刀登记·2026-10-27 对账翻面刀补落） | **开**（本卷只修静面·行不关不翻） |
| 老 proof 本体 | `apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs`（blob `0cdd1275` 208 行）· S1-S5 六检 + G-GAP `PRODUCT_SURFACE refuse` 拒 EXIT=0 条款（`:163`-`:181` 逐读） | **设计绊线在位**（本体零触=Ban 维持） |
| 绊线现态亲证 | 本树 raw 亲跑 `node apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs` → **EXIT=1**：`PASS S1/S3/S4/S5` + `FAIL S2 …persistTrace awaited in same settle region` + `FAIL G-GAP-product-surface-or-pins: PRODUCT_SURFACE … refuse gap EXIT=0` + `GAPS=0`（逐行回执在 §0.3）· 与矩阵 Line X 2026-10-07 收据「S2 coupling + G-GAP refuse 逐字复现 · S1/S3/S4/S5 PASS · GAPS=0」三方一致 | **现态=设计内**（非回归·Ban wash） |
| harness 静面滞后 | `harness/uc-e2e-028-trace-ledger-fail-open.md`（blob `23db6a93` 116 行）：§0 `:14`-`:15`「同事务」「非 fail-open」·§1 `:32` S2 期望·`:36`-`:39` G-GAP-1..4 四挂·§1b `:61`-`:67` 件1-件7·§2 `:77` 期望 EXIT=0·§4 `:111` G-GAP pin 叙事——对现态已滞 | **滞后在卷**（E1 落点） |
| eval 面滞后 | `receipts/archive/2026-09-batch23/eval/uc-e2e-028-trace-ledger-fail-open.eval.md`（blob `3d1a2208` 78 行·2026-09-10 时点）：§2 实测 EXIT=0+G-GAP 四 pins·§3 映射表·§5 专家题——时点记录真·对现态已滞 | **滞后在卷**（E2 落点·原文不洗） |
| 四 G-GAP 清账证据 | 矩阵 `:127`（FAIL-OPEN→Line X nail `b16916fe`·INJECT→case-① 行裁·RECON/TRUTH-BLOCK-E2E→2026-10-27 翻面注）/`:521`（同旨+字面偏差背书）· `harness/uc028-e2e-REQUEST.md:3` Status **`closed`**（2026-10-26 post 双审双 PASS·#140 落主线）· `harness/trace-recon-REQUEST.md:3` Status **`closed`**（2026-10-27 补翻） | **清账在案**（勘误注只转录不新证） |
| 字面偏差背书 | 矩阵 `:521`「协调方对字面偏差显式背书（钉此）：harness §1b-3『以 `interview_event` 为准』原述源不可构造·实现定稿『以 ai_model_invocation 真相差集为准』系 trace-recon REQUEST §0.2-1 读码定稿修正」· `trace-recon-REQUEST.md:37`（§0.2-1）+`:72`（§1.3 候选三否决）亲读 | **背书在案**（§1-E1-丁 转录） |
| cite 门词面依赖 | `scripts/eval-harness-matrix-cite.proof.mjs:246`-`:262` mustPins 十pin（`gap`/`本绿≠全链路 E2E covered`/`≠covered`/`uc028:trace-fail-open:prove`/`releaseEvidence=false`/`Not HA`/trace 词族/`GAP-UC028-FAIL-OPEN|TC-E2E-028-trace-fail`/`GAP-UC028-RECON|TC-E2E-028-recon`/`GAP-UC028|G-GAP|…`/`report-bulkhead|旁证`）对 harness+eval 拼接面断言——**additive 勘误零删改 ⇒ 十pin 结构性保绿** | **零触保绿** |
| 在飞/同名复核 | `git branch --list "line/l13*"` 落卷前零命中；`ls ai-docs/delivery/harness/ | grep -i "l13"` 落卷前零命中 → 落卷后唯一同名卷=本卷；`grep -rln "L-13" ai-docs/delivery/` 命中面=backlog `:904`/`:925`+矩阵 `:187`/`:521`+nk1 `:100`（落选摘要引）——无第二认领卷 | **零第二认领** |

---

## §0 现状锚（事实锚 · 起草席亲读亲算 · file:line + blob · **EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 账面核实与订正（三条事实钉）

1. **L-13 未被后续刀顺带收口**：老 proof 与 harness 卷 blob 内容级最近触点=`112e6d26f`（2026-10-16 PR #108 squash 载体·`--follow` 链上仅 `ded620f52` 2026-09-17 创件+此 squash 重载）·`git log origin/main --since=2026-10-26 -- <老 proof/卷/eval>` **零命中**；2026-10-27 对账翻面刀在矩阵 `:521` 显式留令「静态库存处置已另刀登记（backlog L-13）」；rc/df/flip/err 四刀改动集均未触本刀三面（err §4 门 6 面收敛枚举在卷零交集）。**VERDICT 候选=非 ALREADY_CLOSED·起草成立**。
2. **派单行号偏差**：派单令记 backlog `:924`·届 tip 实锚 L-13=`:925`（`:924`=L-12 擦除复活义务行）——一行偏差·行体恒等（`| L-13 | P2 |` 前缀亲读）·不改令不改令意。
3. **cite 门基线红（既存·非本刀面）**：本树亲跑 `node scripts/eval-harness-matrix-cite.proof.mjs` **EXIT=1（FAIL 39）**——全为 evalDoc 路径漂移（脚本 `:249` 等 pin `ai-docs/delivery/eval/…` · 届树该目录已不存在·实件在 `receipts/archive/2026-09-batch23/eval/`）·基线红先例已由 `harness/uc003-i18n-REQUEST.md:43`/`:79`/`:196` 登记（「非本刀引入·不修不扩」先例形）——本刀零触 cite 脚本·仅 E1 注内如实转录现读数。

### 0.2 blob 锚表（`git rev-parse HEAD:<path>` 亲算 · 8 hex · 锚基 = `8c8119d0c`）

| 文件 | blob（行数） | 关键锚 |
|---|---|---|
| `ai-docs/delivery/gap-bug-backlog.md` | `403fc48e`（979） | **`:925` L-13 立项行**（P2 OPEN·目标/Ban/所需路径三列原文见「立项出处」）· `:904` 台账头 |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `1c35605f`（522） | `:127` UC-E2E-028 行（翻面注两枚）· `:187` 执行体行（「静态库存更新属另刀」令）· `:278` P1-10 行（清账注）· `:518`-`:521` Line X nail 节+对账翻面注（`:520` 老 prove 绊线逐字·`:521` L-13 留令） |
| `ai-docs/delivery/harness/uc-e2e-028-trace-ledger-fail-open.md` | `23db6a93`（116） | **E1 目标卷**：§0 `:12`-`:24`（`:14`-`:15` 同事务叙事滞）· §1 `:27`-`:43`（`:32` S2·`:36`-`:39` G-GAP-1..4·`:41` 产品浮出拒 EXIT=0 条款）· **§1b `:55`-`:71`**（`:61` 件1·`:62` 件2·`:63` 件3 字面偏差·`:64` 件4·`:65` 件5·`:66` 件6·`:67` 件7）· §2 `:73`-`:94`（`:77` 期望 EXIT=0·`:81` cite 门期望 0）· §3 `:96`-`:107` · §4 `:109`-`:116` |
| `apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs` | `0cdd1275`（208） | **老 proof 本体·零触**：`:12`-`:22` 头注（搜码结论滞）· `:29`-`:30` FAIL_OPEN_WRAP_RE/RECON_QUEUE_RE · S2 `:60`-`:78` · G-GAP `:139`-`:186`（`:163`-`:170` refuse 抛点）· 末 `:201`-`:208` EXIT 汇报 |
| `receipts/archive/2026-09-batch23/eval/uc-e2e-028-trace-ledger-fail-open.eval.md` | `3d1a2208`（78） | **E2 目标卷**：`:6` 日期 2026-09-10 · §2 `:18`-`:28`（`:23` 实测 EXIT=0+四 pins）· §3 `:42`-`:56` · §5 `:64`-`:78` |
| `ai-docs/delivery/harness/uc028-e2e-REQUEST.md` | `6ef44de3`（225） | `:3` Status **`closed`**（2026-10-26 post 双审双 PASS·#140）· case-①②③ 闭合臂（§1-修法/§9 在卷） |
| `ai-docs/delivery/harness/trace-recon-REQUEST.md` | `a06b8c97`（172） | `:3` Status **`closed`**（2026-10-27 补翻）· `:37` §0.2-1 读码定稿（真相差集源）· `:72` §1.3 候选三否决（失败日志源不可构造） |
| `ai-docs/delivery/execution-master-checklist.md` | `d7e748ee`（4503） | `:1130`-`:1136` Line X nail 段（`:1136` STILL OPEN 三 GAP 系 2026-10-07 时点记账·清账注在矩阵侧·本刀零触） |
| `packages/ai-runtime/src/invoke.ts` | `f6102433`（1250） | `:518`-`:530` persistTraceBestEffort（旁路 best-effort+`.catch`）· `:1206`-`:1210` 调用点注「UC-028 fail-open(A1)…已拆出本事务」——S2/G-GAP 翻红的机理现态 |
| `packages/db/migrations/0207_ai_trace_backfill_scoped.sql` | `33e303c3`（85） | RECON 产品半（SECURITY DEFINER scoped 回补） |
| `apps/worker/src/trace-recon.ts` | （在树·RECON 承接体） | 30s drainLoop（`intervalMs=30_000`·矩阵 `:521` 亲证面） |
| `scripts/eval-harness-matrix-cite.proof.mjs` | `68dfee2a`（868） | `:246`-`:262` uc-e2e-028 unit+mustPins 十pin · `:516`-`:517` harness/eval 存在性 fail 面（evalDoc 路径漂移=基线红根因·§0.1-3） |
| `scripts/ai-docs/public-text-policy.mjs` | `67808d46`（596） | `:298` `const MAX_FILES = 2_478`（**cap 步进落点**·链区注记带上邻） |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `4f05fa5b`（509） | **四联动点** `:452` `i < 2_478` · `:459` `scannedFiles, 2_478` · `:490` `'ai-docs/f-2478.md'` · `:493` `FILE_LIMIT}:2479`（+ `:460`-`:461` 相邻注释两处 · 链区注记 `:489` 上邻） |
| `package.json` / `apps/api/package.json` | `5927981d`（783）/ `2940b6bc`（156） | `:297`-`:298` / `:128` 老 prove 双 script 入口——**零触**（cite 门 `:255` 断言 root 列表含该词面·零触=保绿） |

### 0.3 绊线现态 raw 回执（起草期亲跑 @`8c8119d0c`·逐行）

```
$ node apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs
PASS S1-persistTrace-inserts-ai_invocation_trace
FAIL S2-persistTrace-coupled-in-settle-txn: persistTrace awaited in same settle region
PASS S3-no-missing-trace-rewrite-queue
PASS S4-no-e2e-uc028-scenario
PASS S5-spec-best-effort-vs-code-coupling
FAIL G-GAP-product-surface-or-pins: PRODUCT_SURFACE: persistTrace fail-open / rewrite queue / UC-028 e2e appears wired — refuse gap EXIT=0; wire fail-open isolation prove (TC-E2E-028-*) instead of mark-red
GAPS=0
CMD=pnpm -C apps/api prove:uc028-trace-fail-open EXIT=1   （RAW_PROBE_EXIT=1）
```

读法：S2 翻红=persistTrace 已拆 settle 事务（`invoke.ts:1210` `persistTraceBestEffort` 调用点·正则 `if\s*\(\s*!error\s*\)\s*await\s+persistTrace\s*\(` 不再命中）；G-GAP 翻红=FAIL_OPEN_WRAP_RE 命中现树（旁路 `.catch` 在场）→ `PRODUCT_SURFACE refuse` 抛出——**逐字兑现上文 §1 `:41`「产品若浮出→拒 EXIT=0」条款=设计绊线·非回归·Ban wash**。S1/S3/S4/S5 PASS 与矩阵 Line X 收据恒等。

### 0.4 滞后面对账表（E1/E2 落点逐条）

| 滞后面（原文锚） | 现态（亲证锚） | 勘误落点 |
|---|---|---|
| harness §0 `:14`-`:15`「persistTrace 同事务·非 fail-open」 | `invoke.ts:518`-`:530` best-effort 旁路在产 | E1-甲 |
| harness §1 `:32` S2 期望（同事务耦合） | raw 回执 S2 FAIL=设计内 | E1-乙 |
| harness §1 `:36`-`:39` G-GAP-1..4 四挂 | 四挂全清账（`:127`/`:521`+closed REQUEST×2） | E1-丙 |
| harness §1b `:61`-`:67` 件1-件7 | 件1/件2/件3/件4 已闭·件5/件7 未做·件6 不变 | E1-丁（含 `:63` 字面偏差背书转录） |
| harness §2 `:77` 期望 EXIT=0 | 现树期望 EXIT=1（§0.3） | E1-戊 |
| harness §2 `:81` cite 门期望 0 | 基线红 EXIT=1（§0.1-3·已登记先例） | E1-戊（如实转录·零触） |
| harness §4 `:111`「S1–S5+G-GAP pin」叙事 | mark-red 叙事退役·承接位=nhp-fault+uc028-e2e | E1-己 |
| eval §2 `:23`「实测 EXIT=0+G-GAP 四 pins」 | 时点读数真·对现态已滞 | E2 |
| 老 proof 头注 `:12`-`:22` 搜码结论 | 滞后（本体零触·由 E1 声明退役读法承） | 零改（E1 声明承） |

---

## §1 修法（EXEC 期行使内容 · 恰 2 tracked 既有 .md 卷尾 additive · 原文不洗 · 老 proof 本体/两 package.json/runner/cite 脚本/matrix/backlog/checklist 三 SSOT 全零触）

### 1.0 刀型唯一（docs-only 静面勘误）

本刀=**L-13 行内明令的处置刀**：静态库存勘误+老 proof 静面更新。三边界由 backlog 行文钉死：①「**老 proof 本体零改动**」⇒ `.mjs`/两 `package.json`/runner/头注零字节；②「**Ban 静默改维持**」⇒ 勘误全走本 REQUEST 全链（起草→pre-exec dual→协调方 EXEC 授权→行使→post dual），不借任何其它刀搭车；③「绊线现态=设计内·非缺陷定谳」⇒ 勘误注如实 declaring EXIT=1 为设计终态·**Ban wash 为回归·Ban 借勘误宣称旧 prove 已修/已绿**。若 pre-exec dual 裁「静面更新含 proof 头注文字」→ 越出本卷 §4 边界·回炉（§8），不得就地扩面。

### 1.1 E1 · harness 卷尾 additive 勘误注（落点=`harness/uc-e2e-028-trace-ledger-fail-open.md` 文件末尾·新节 `## 5.`·上文 §0–§4 一字不洗）

> ## 5. 静态库存勘误注（L-13 处置 · 2026-11-03 · additive · 上文 §0–§4 一字不洗 · 老 proof 本体零改动）
>
> **§5-0 绊线现态（设计内·非回归）**：`pnpm uc028:trace-fail-open:prove`（`apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs`）现树期望 **EXIT=1**=设计绊线——上文 §1「产品若浮出→拒 EXIT=0」条款逐字兑现（S1/S3/S4/S5 PASS · S2 同事务耦合断言 FAIL · G-GAP `PRODUCT_SURFACE … refuse gap EXIT=0` FAIL · GAPS=0 · 起草期 raw 亲证 @`8c8119d0c`·与矩阵 Line X 2026-10-07 收据三方一致）。**Ban wash 为回归；Ban 借任何后续刀静默改老 proof 本体**（矩阵 Line X `:520` 明令维持）——旁路/recon 浮出后本 prove 的 gap mark-red 叙事退役，运营承接位=`pnpm uc028:nhp-fault:prove`（A1 fail-open isolation·40/40 双 fresh）+`harness/uc028-e2e-REQUEST.md`（closed）case-①②③。
>
> **§5-1 G-GAP 四挂清账（上文 §1 G-GAP-1..4 行对现态已滞）**：`GAP-UC028-FAIL-OPEN`→已闭（2026-10-07 Line X nail：persistTrace 拆 settle 事务 best-effort 旁路 `persistTraceBestEffort`+失败观测 `ai_trace_persist_failures_total`·新 prove EXIT=0 40/40 双 fresh）；`GAP-UC028-RECON`→已闭（迁移 `0207_ai_trace_backfill_scoped` SECURITY DEFINER+worker `trace-recon.ts` 30s drainLoop+case-② 九列恒等/幂等重放/水位 gauge 归零·40/40 两独立复现）；`GAP-UC028-TRUTH-BLOCK-E2E`→已闭（同一 closed REQUEST case-③ 对照臂）；`GAP-UC028-INJECT`→已闭（2026-10-27 行裁·case-① 承接）。闭合 REQUEST=`harness/uc028-e2e-REQUEST.md`（Status `closed`·#140 落主线·post 双审双 PASS 会签）·翻面注记见矩阵 `:127`/`:187`/`:278`/`:521`。
>
> **§5-2 §1b 现态对账（上文 §1b 表逐件）**：件1（persistTrace 旁路）已闭（Line X nail）·件2（故障注入 harness）已闭（case-①）·件3（对账补写路径+prove）已闭（0207+trace-recon+case-②）·件4（对照 E2E）已闭（case-③）·**件5（e2e/*.e2e.ts 隔离 HTTP/worker 专段）未做·件7（sole-stack 夹具）未做**——UC-E2E-028 行/FAULT 列 stays **gap**·≠covered·case-only 措辞维持·件6（假绿禁令）不变。
>
> **§5-3 §1b-3 字面偏差勘误（钉）**：上文 §1b 件3「以 `interview_event`（事件账本）为准」原述源不可构造（console JSON 流非持久可查账面·`trace-recon-REQUEST.md` §1.3 候选三否决）——实现定稿=「以 `ai_model_invocation` 真相差集为准」（同卷 §0.2-1 读码定稿修正·协调方 2026-10-27 显式背书在案·矩阵 `:521` 逐字）。
>
> **§5-4 §2/§4 时点勘误**：§2「`pnpm uc028:trace-fail-open:prove` 期望 EXIT=0」系 2026-09-10 时点值·现树期望=**EXIT=1**（§5-0）·raw/prove:raw 双入口与 `package.json:297`-`:298`/`apps/api/package.json:128` 入口映射不变（零触）；§2「`pnpm eval-harness-matrix-cite:prove` 期望 0」系时点值·现树该门基线红 EXIT=1（evalDoc 路径漂移 `ai-docs/delivery/eval/`→`receipts/archive/2026-09-batch23/eval/` 未随迁·基线红先例已由 `harness/uc003-i18n-REQUEST.md` 登记·**非本刀修面·零触**）；§4 锚点行「S1–S5 + G-GAP pin」mark-red 叙事按 §5-0/§5-1 退役读法承。eval 面（`receipts/archive/2026-09-batch23/eval/uc-e2e-028-trace-ledger-fail-open.eval.md`）已随卷尾时点勘误注对账（原文不洗）。
>
> **Pins 不变**：矩阵行/FAULT 列 stays **gap** · coveredCount=**8** · EXIT0≠covered · releaseEvidence=false · Not HA · fixture=pgvector→green-risk/R5 · Ban 升 covered/假 partial-closed。本节=backlog 台账 L-13 静态库存勘误行使落点（行翻面权归协调方）。

### 1.2 E2 · eval 面卷尾时点勘误注（落点=`receipts/archive/2026-09-batch23/eval/uc-e2e-028-trace-ledger-fail-open.eval.md` 文件末尾·additive 一段·上文一字不洗）

> **【2026-11-03 时点勘误注（backlog L-13 静态库存勘误刀 · append-only · 上文一字不洗）】**：本卷系 **2026-09-10 时点执行记录**（原文保留·时点真）。对现态已滞三处如实对账：①上文 §2「`pnpm uc028:trace-fail-open:prove` 实测 EXIT=0+G-GAP 四 pins」系接线前时点读数——persistTrace 旁路（2026-10-07 Line X nail `persistTraceBestEffort`）+对账补写（`0207`+worker `trace-recon.ts` 30s drainLoop）落主线后，该 prove 零改动翻转 **EXIT=1=设计绊线**（S2+G-GAP `PRODUCT_SURFACE refuse`·S1/S3/S4/S5 PASS·GAPS=0）；②上文 §3 G-GAP-1..4 四挂已全部清账（FAIL-OPEN→Line X nail·RECON→case-②·TRUTH-BLOCK-E2E→case-③·INJECT→2026-10-27 case-① 行裁·闭合 REQUEST=`harness/uc028-e2e-REQUEST.md` closed）——G-GAP 打印语义由「未闭诚实钉」退役为「绊线现态」；③本卷非 covered 证据·矩阵 UC-E2E-028 行/FAULT 列 stays **gap**·coveredCount=8 不变·EXIT0≠covered。现态权威读法=`harness/uc-e2e-028-trace-ledger-fail-open.md` §5 静态库存勘误注（L-13 处置落点）。

### 1.3 零触面（全列）

老 proof `.mjs` 本体（含头注）· `package.json`/`apps/api/package.json` 双 script 入口 · `scripts/run-e2e-isolated.mjs`（`:2075`/`:2880`/`:3581` 三映射）· `scripts/eval-harness-matrix-cite.proof.mjs`（evalDoc 路径漂移=另行登记面·非本刀）· `scripts/ai-docs/public-text-policy*.mjs`（除 §3 cap 联动外零语义触）· matrix/backlog/checklist 三 SSOT（行翻面权归协调方）· `uc028:nhp-fault:prove`/`uc028-e2e-REQUEST`/`trace-recon-REQUEST` 三既闭链卷 · 新 fail-open/recon 产品码与测试码全零触。

---

## §2 断言预算（EXEC 期机器可判 · 逐条 EXIT · 数字口径以实跑实测为准）

- **A1 面收敛门**：`git diff --name-status $(git merge-base HEAD origin/main)..HEAD` = 起草期 3 tracked（`A ai-docs/delivery/harness/l13-REQUEST.md`+`M` 两 policy）+ EXEC 期恰 2 tracked 增量（`M harness/uc-e2e-028-trace-ledger-fail-open.md`+`M receipts/archive/2026-09-batch23/eval/uc-e2e-028-trace-ledger-fail-open.eval.md`）；**产品码/迁移/runner/老 proof/双 package.json/cite 脚本/matrix/backlog/checklist 零命中**。
- **A2 原文不洗机证**：两目标卷 `git diff --numstat` 各 **delete=0**；且对 origin/main 原blob 前 N 行（N=116/78）逐字节前缀恒等（`git show origin/main:<path> | head -n N | cmp - <(git show HEAD:<path> | head -n N)` EXIT=0）——新内容只允许在原末行之后 append。
- **A3 老 proof 零字节门**：`git diff origin/main..HEAD -- apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs` **空集**（EXIT=0 · 零输出）；双 package.json 同判。
- **A4 绊线现态探针（诚实登记·不修不 wash）**：`node apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs` → **EXIT=1** 且 FAIL 集恰 `{S2, G-GAP-product-surface-or-pins}`·PASS 集恰 `{S1,S3,S4,S5}`·GAPS=0——读数入收据·偏离即停（§8 现场漂移）。
- **A5 词面保绿门**：`node scripts/eval-harness-matrix-cite.proof.mjs` 输出中 `uc-e2e-028-trace-ledger-fail-open` unit 的 harness present/matrix points/matrix references/pins 族各行 **PASS 维持**（eval missing 行系基线红§0.1-3 如实维持·不计本刀）；两目标卷对 mustPins 十词面 grep 全命中（原文不洗结构性保证）。
- **A6 三门**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned=cap 恰等**（起草落卷后 2479=2479；EXEC 期零新增受管件 → terminal 2479 零再步进）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**；markers 门=改动集（起草 3 + EXEC 2 tracked）五类标记词（词面运行时组装防自指·同 `scripts/i6-239-gates.proof.mjs` §2-7 口径·本卷不复抄）+ 行首冲突标记 **0 命中**。

---

## §3 cap 预登（本卷 REQUEST +1 ⇒ **CAP-SANCTION-2479** · 沿 nk1/flip/sse2/err §3-C2/C3 预登形 · 随届值如实采=唯一豁免项）

- **union 算式**：main 届扫 2478（=cap 2478 恰等·CAP-SANCTION-2478 ERRATA-SWEEP rev r1 承值·起草前本树 docs:check EXIT=0 scanned 2478 亲证）+ 本卷 `harness/l13-REQUEST.md` 受管 1 件 = **2479 恰等零多放**。
- **起草 commit 即行使**（沿 nk1「起草 commit 即行使 CAP-SANCTION-2462」/err「CAP-SANCTION-2475 起草随刀恰等步进」先例形·协调方派单常设预授权「随届值如实采·恰等步进预登」随令）：两 policy 四联动点 **2_479 形**——`public-text-policy.mjs:298` `const MAX_FILES = 2_479`+链区 `CAP-SANCTION-2479` 注记一行；`public-text-policy.proof.mjs` `:452` `i < 2_479`/`:459` `scannedFiles, 2_479`/`:490` `'ai-docs/f-2479.md'`/`:493` `FILE_LIMIT}:2480`（+`:460`-`:461` 相邻注释两处同步·链区 `CAP-SANCTION-2479` 注记一行·行号随 merge-tree 重排·EXEC 立项照届时 tip 重 pin）。
- **EXEC 期零新增受管件**（两既有 .md in-place 卷尾 additive·收据只准 `.log` ∉TEXT_EXTENSIONS 不计）⇒ **terminal 2479 零再步进**。
- **在飞如实采**：届窗无在飞活跃支承 2479（`line/df-draft`/`rc-draft`/`flip-draft`/`err-draft` 四支均已并 #193-#196；`line/ag20-residual-draft`/`loadw-exec`/`online-pay-draft`/`scoring-eval-exec`/`uc011-adv-status-flip`/`uc31-draft` 各 ahead=1 且 policy 零触；`line/ag18-draft`/`line/cap-2272` 系 ancient 分叉（ahead≈2.6k·不同窗）不预采）——并线期 union 沿常设预授权届时重算承登·同触两 policy 脚本=已知共享热面 dual-keep 先例形（main 侧既有注记史录全保留+本支注记并留·号随 merge-tree 重排）。

---

## §4 非范围（全列 · 越界即废）

1. **老 proof 本体任何字节**（含头注/注释/断言/EXIT 语义）——L-13「本体零改动」Ban 维持；头注滞后由 E1 声明承·不直改。
2. **cite 门 evalDoc 路径漂移修复**（`ai-docs/delivery/eval/` 目录缺位）——既存基线红·uc003-i18n 先例形登记·另刀另登；本刀仅注内如实转录读数。
3. **matrix/backlog/checklist 行状态与行文字**——L-13 行翻面、UC-E2E-028 行/FAULT 列翻面、coveredCount 变化全归协调方；checklist `:1136` STILL OPEN 时点行不触（清账注已在矩阵侧）。
4. **既闭链三卷**（nhp-fault harness/uc028-e2e-REQUEST/trace-recon-REQUEST）零触；**Ban 重跑其 prove 冲销**。
5. **fail-open/recon 产品码、迁移、worker、e2e**——已闭面零再动；件5/件7 残面（e2e/*.e2e.ts 专段+sole-stack 夹具）不认领（stays gap）。
6. **其它 GAP/UC/L 行**——nk1 §0.5 引 L-13 时的落选清单不构成本刀扩面依据；L-12 擦除复活义务零触。
7. **cap/lint/typecheck 语义面**——两 policy 仅 §3 数值步进·`MANAGED_ROOTS`/`TEXT_EXTENSIONS`/扫描面零改。

---

## §5 Ban

Ban push/force-push（git 写只本 worktree commit）· Ban 动主仓 · Ban self-approve（pre-exec 双审两独立外席·alone≠dual）· Ban EXEC 期 retry-to-green（A4 探针 EXIT=1 系**期望诚实读数**非红可修项·Ban 反复跑冲销）· **Ban wash 绊线**（EXIT=1 永不写作回归/已修/已绿）· **Ban 静默改老 proof**（借任何刀·含本刀 EXEC）· Ban 升 covered/假 partial-closed/宣称 UC-E2E-028 闭环 · Ban 翻 matrix/backlog/checklist 任何行 · Ban 触既闭链三卷与 nhp-fault prove · Ban 修 cite 门路径漂移（越界）· Ban 在代码注释写任务号/刀号 · Ban 改两 policy 语义面 · Ban 造 .env*/secrets 入树入据 · Ban 收据落 `.md`/`.txt`/`.json`（只准 `.log`）· Ban 赛后手补 `PROCESS_EXIT` 类尾注。

---

## §6 pins（十一值照抄同族卷 · EXEC/审查不得改口 · 本刀零翻转 · **cap 项唯一豁免=随届值如实采**）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务 + PostgresSaver + pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = **503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·est live=0）。

**本卷附加钉**：老 prove `uc028:trace-fail-open:prove` 现树期望 **EXIT=1=设计绊线**（非回归·Ban wash）· 老 proof 本体零改动 · UC-E2E-028 行/FAULT 列 stays **gap** · G-GAP 四挂清账态（§1-E1-丙）· eval/2026-09-10 时点记录原文不洗 · cite 门基线红维持登记态（零触）· 断言预算六门（§2）· `cap = 2479`（CAP-SANCTION-2479 恰等·随届值如实采=唯一豁免项）。

---

## §7 Non-claims

本刀 **≠** L-13 行关闭/翻面（翻面权归协调方） **≠** UC-E2E-028 行或 FAULT 列离开 gap **≠** covered 变化（coveredCount 仍 8） **≠** 老 proof 已修/已绿/已退役删除（本体在树·EXIT=1 设计终态） **≠** fail-open/A1、recon/A2、truth-block/A3、inject 任何 GAP 本刀新证（只转录既闭证据） **≠** 件5/件7 残面收口（stays gap·case-only 措辞维持） **≠** cite 门基线红修复 **≠** `eval-harness-matrix-cite:prove` 修复承诺 **≠** HA/容量/suite green **≠** 生产行为变化（docs-only 零码） **≠** 任何 SSOT 行文字改写（原文不洗·additive 唯一形）。drafted ≠ DONE（完成判定走 pre-exec dual + 协调方 EXEC 授权 + post dual）。

---

## §8 STOP（停手 · 开工三条款 + 停止条件五类）

**STOP · `drafted:awaiting_pre_exec_dual`（2026-11-03 起草落卷即停 · 三处钉：Status 行 + 本节 + 卷尾 · 同值）。** 开工三条款（未履行不得 EXEC）：① **pre-exec 双审两独立外席 BOTH PASS 落卷**；② **协调方明示 EXEC 授权**（L-13「新 REQUEST 全链+协调方显式授权」条款的刀级兑现·派单令授权起草≠授权 EXEC）；③ **§0 全量对届时 tip 重 pin**——backlog `:925` 行、矩阵 `:127`/`:187`/`:278`/`:518`-`:521`、harness 卷 §0/§1/§1b/§2 行号、老 proof blob、eval 卷 blob、两 policy 四联动点任一漂移且结论受疑即回炉。

- **现场漂移**：届时 tip 上老 proof 被任何刀改过字节 / harness 卷或 eval 卷被他刀先行勘误 / 四 G-GAP 清账注记被改 / L-13 行状态已翻 → 停·重 pin·如实登记。
- **机制不满足**：届时若发现本刀三面已被顺带收口（老 proof 退役/静面已勘误）→ **停手上报 ALREADY_CLOSED**（零增量·不得重复立刀）。
- **越界需要**：被要求改老 proof 本体/头注、修 cite 门 evalDoc 路径、翻任何 SSOT 行、扩件5/件7 → 停（§4 全列）·另刀或协调方裁决。
- **验收红不可修**：A2/A3 机证红（出现删除行/proof 被触）→ 停·stash 对照亲证基线·**Ban 借机修**；docs 门 scanned>cap 2479 / PTP 红 → 停（起草期未落 §3 前 2479 超限系**预期红**·先落 cap 步进再跑三门）。
- **关闭诉求**：若双审/授权席要求「顺手关 L-13 行/翻矩阵行/改 coveredCount」→ 停（§4-3/§7）；本刀无翻面授权。

---

## §9 状态

**`drafted:awaiting_pre_exec_dual`**（2026-11-03 起草落卷即停 · 本卷恰 3 tracked 路径=本卷 `.md`+两 policy 脚本 · 老 proof/双 package.json/runner/cite 脚本/三 SSOT/既闭链卷全零触 · EST live=0 · markers=0 · ⛔push ⛔动主仓 · dual 归后续波次）。

**门读数（起草席亲跑·落卷 commit 前回填·2026-11-03）**：门 1 docs **`EXIT=0` · scanned 2479 = cap 2479 恰等**（2479 形·`ai-docs check passed: 80 required files verified` 亲读）· 门 2 PTP **12/12 `EXIT=0`**（`static_preflight_valid: selected=12/12` 亲读·四联动点 2_479/f-2479.md/:2480 已落位）· 门 3 markers 改动集 3 tracked（本卷 `.md`+两 policy）五类标记词+行首冲突标记 **0 命中**（词面运行时组装·i6-239 §2-7 口径）· 面收敛 `git diff --name-status origin/main..HEAD` 恰 3 tracked=`A ai-docs/delivery/harness/l13-REQUEST.md`+`M scripts/ai-docs/public-text-policy.mjs`+`M scripts/ai-docs/public-text-policy.proof.mjs`·**老 proof/双 package.json/runner/cite 脚本/三 SSOT/既闭链卷零命中**。

**EXEC 期预登（未行使·授权后）**：§1 两处卷尾 additive 勘误注逐字行使（E1 新节 `## 5.`+E2 一段·原文不洗机证 A2）· A4 探针读数回执入收据（`.log`·只准 `.log`）· 三门复跑同 §2-A6 · 行号对届时 tip 重 pin（漂则如实采新值·定性漂移即停 §8）。
