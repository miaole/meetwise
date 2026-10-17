# NIGHTLY-RECALL-FIX 夜间召回门断链修复刀（e2e skip 猎杀席 P1 新缺陷·快速链诊断+起草+EXEC 一体·量级微·起草 REQUEST · 落卷即停）

**Status**: **`executed:awaiting_post`**（EXEC 落卷 §9·rev 落卷 §9-rev 待席2 复核修订块·post 审归协调方派单·Ban self-approve·前值 `draft:awaiting_exec`=史录·⛔push）
**席位**：NIGHTLY-RECALL-FIX 夜间召回门断链修复刀快速链席（诊断+起草+EXEC 一体·量级微·e2e 猎杀席 P1 新缺陷承单·⛔push·⛔merge主线）。
**基线**：`feat/mysql-schema-skeleton` @ `656fc7be`（本席亲 fetch 亲证 origin tip=`656fc7be`=trace-service-wire nail 波链顶·派单下界「origin tip≥WSS nail 后 tip」以届时链顶满足·docs:check 2210 本席本树亲跑 EXIT=0）· 分支 `line/nightly-recall-fix`（本席 `git worktree add ../meetwise-nrf -b line/nightly-recall-fix origin/feat/mysql-schema-skeleton` 亲立·零自造 merge 节点·⛔pull --rebase 未用）· 工作树 `meetwise-nrf`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（2026-10-16·e2e skip 猎杀席 P1 新缺陷·快速链 40 分钟·诊断+起草+EXEC 一体）；②brief 缺陷原文源级亲证成立见 §1（nightly.yml:55 调 `pnpm recall:eval`·root package.json 已无该 script=幽灵脚本·`:49` continue-on-error 洗绿=结构性 skip-as-pass）；③修向承猎杀席建议=改接 `pnpm qbank:retrieval:eval`（smoke/qbank-retrieval-eval.ts fail-closed 真 embed 后继）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git hash-object 实测 @`656fc7be`·**EXEC 落卷照本节对终树再 pin**）

### 0.1 blob 锚表（`git hash-object` 亲算 @`656fc7be`·建树即本基线零漂移）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `.github/workflows/nightly.yml` | `ac47e884`（65 行） | **`:55` 幽灵调用 `pnpm recall:eval` 正身**·`:49` recall 臂 `continue-on-error: true`·`:48` step name 词面含「recall:eval」·`:54` skip-echo 无 `::warning::` 前缀·`:50-52` env 注 `MODEL_API_KEY`+`EMBED_API_KEY`·`:64` scoring skip-echo 同缺 `::warning::`·`:33` 段注释自称「硬门…阻断」·`:40` 先例形=`::warning::未配 MODEL_API_KEY → 跳过…`·`:65` `pnpm scoring:eval`（script 在册非幽灵） |
| `package.json` | `3b04b871`（675 行） | **`:561` `"qbank:retrieval:eval": "pnpm -C apps/worker exec tsx smoke/qbank-retrieval-eval.ts"`（后继真身·root 层）**·`:506-507` `scoring:eval`→`scoring:eval:raw`→smoke/scoring-eval.ts（在册）·`:264` `model:smoke`（在册）·`recall:eval` 全词零命中（grep exit=1 亲证） |
| `apps/worker/smoke/qbank-retrieval-eval.ts` | `d0be9f09`（87 行） | **`:78-87` `main().catch` → `process.exit(1)`=exit 语义 fail-closed**·`:38` `validateQbankRetrievalRelease()`（金标集校验先于 embed）·`:41` `dashscopeEmbedder({ dim: 512 })`·`:16-19` 本地 `.env` 装载仅 `MODEL_*|EMBED_MODEL`（CI 无 `.env`=未跟踪 ls-files 亲证·不承载 key）·头注 `:5-9` 自认 worker-shaped 近似·真路径评测在 qbank-retrieval-eval-pg.proof.ts |
| `packages/ai-runtime/src/embedder.ts` | `f6e08e42` | **`:26-27` 注记「只取 embedding 能力 Key；缺失即 embedder_not_configured，绝不回退别的 key 变量」+`:32` `if (!baseUrl || !apiKey) throw new Error('embedder_not_configured')`** |
| `packages/ai-runtime/src/dashscope-native-config.ts` | `c9d31be3` | **`:61` `embed: 'DASHSCOPE_EMBED_API_KEY'`（能力拆分 Key 正身）**·`:1-9` 头注「原生 Key 刻意不继承 MODEL_*」·`:57` broad key `DASHSCOPE_API_KEY` 出现即拒·`:105` 指纹变量可选（key 单独即足·secret-fingerprint.ts `assertKeyFingerprint` key 缺才 return/指纹可选亲读） |
| `apps/worker/smoke/recall-eval.ts` | **absent-in-HEAD**（`git cat-file -e` EXIT≠0 亲证） | 旧 `recall:eval` 所指源=已废正身（§1.3-1 否决复活面） |
| `scripts/workflow-script-existence.proof.mjs` | **absent-in-HEAD** | 本刀新静态门（§1-件d·≤30 行） |

### 0.2 漂移登记与机检基线（起草席本树亲跑 @`656fc7be`）

1. **e621235b 摘除断链源**（`git show e621235b -- package.json` 亲读）：`"recall:eval": "pnpm -C apps/worker exec tsx smoke/recall-eval.ts"` 随同批摘除（同批含 `ocr:prove`/`reaper:prove`/`benchmark:eval` 旧形）换新 prove 套件（含 `memory-two-stage-recall:prove`）——**workflow 未跟改=断链起点**。
2. **全 workflow 幽灵扫描机检（本席 prototype 亲跑）**：9 workflow 冒号形 `pnpm <script>` 引用 **checked=120·missing=1=恰 nightly.yml `recall:eval`**（其余 119 全在 root package.json）——幽灵唯一性机证·亦是件d 新门的改前基线读数。
3. **actionlint 基线**（本机在 `/opt/homebrew/bin/actionlint`·yamllint 未安装）：nightly.yml 唯一 finding=`:26` SC2034（wait-for-postgres 循环变量·**非本刀触面·Ban 借机修**）；全目录共 7 findings（deploy/ci/nightly-ciw2 各处·全 pre-existing）——门口径=改前 findings 集改后恒等零新增。
4. **scoring 臂自skip 语义**：smoke/scoring-eval.ts `:16` 无 MODEL_API_KEY 即 `process.exit(0)`（脚本自skip）——`:64` shell 守卫冗余但诚实化面（补 `::warning::` 即 CI 注解可见·脚本零触）。
5. **防重三对表**：`git branch --list "line/nightly-recall-fix"` 恰 1=本席；`git worktree list` 中 `meetwise-nrf` 恰 1 树；`ls ai-docs/delivery/harness/ | grep nightly-recall` 建前零命中。本刀四触面零第二在飞树锚定。

## §1 红事实（brief 承引+源级亲证）

1. **幽灵脚本断链→洗绿链**：`:55` `pnpm recall:eval` 对 root package.json 零命中 → pnpm missing-script 非零退出 → `:49` `continue-on-error: true` 洗绿 → **夜间召回金标门恒 skip-as-pass（结构性）**。配了 key 也不真跑——门有名无实。
2. **skip 注解缺失**：`:54`/`:64` skip-echo 无 `::warning::` 前缀（对照 `:40` 先例形）→ 无 key 夜静默绿零 GitHub 注解=观测盲。
3. **段注释失实**：`:33` 自称「硬门(…阻断)」辖三步，实则冒烟（`:34-41`·无 continue-on-error）才是硬门，recall（`:49`）/scoring（`:57`）两臂 continue-on-error=信号臂——注释与机制不符。
4. **env 接线错位（后继真依赖面）**：现 env 注 `MODEL_API_KEY`+`EMBED_API_KEY`，而后继 script 唯一真依赖=**`DASHSCOPE_EMBED_API_KEY`**（embedder `:26` 只取 embed 能力 Key 绝不回落 MODEL_*·native-config 头注 `:1-9` 刻意不继承·缺 key `:32` `embedder_not_configured` fail-closed）——若仅改 script 名不改接线=新断链形（守卫见旧 key 真·脚本恒 `embedder_not_configured` 红）→ 修法 a) 一并诚实接线。

## §1-修法（四点·零产品码·零迁移·workflow+静态门两触面）

- **件a) 幽灵改接**：nightly.yml `:55` `pnpm recall:eval` → `pnpm qbank:retrieval:eval`；`:48` step name 词面 `recall:eval` → `qbank:retrieval:eval`（同步诚实命名）；`:50-52` env 改注 `DASHSCOPE_EMBED_API_KEY: ${{ secrets.DASHSCOPE_EMBED_API_KEY }}`（后继唯一真依赖·§1-4）；`:54` 守卫改判 `DASHSCOPE_EMBED_API_KEY` 空→skip。continue-on-error 两臂**原样维持**（信号臂定位=campaign 设计·§1.3-2）。
- **件b) skip 注解对齐**：`:54`/`:64` skip-echo 补 `::warning::` 前缀对齐 `:40` 先例形（无 key 夜=GitHub 注解可见的诚实 skip·非静默绿）。
- **件c) 段注释诚实形**：`:33` 改「门位如实：冒烟=硬门阻断·recall/scoring=信号臂（continue-on-error·红=信号不阻断）」形——注释与机制恒等。
- **件d) 静态门入刀（量级裁量=入）**：新 `scripts/workflow-script-existence.proof.mjs` **≤30 行**（扫描 `.github/workflows/*.yml` 全部冒号形 `pnpm <script>` 引用·逐一对照 root package.json `scripts`·missing>0 即 exit 1 fail-closed）+root package.json 注册 `"workflow-script-existence:prove"`。改前基线 missing=1（§0.2-2 机检）·改后预期 checked=120 missing=0。**不挂 e2e-static-guards**（521 行共享守卫面+347 行 proof 邻触=超量级·§1.3-3）。

## §1.3 否决（替代路径·全数否决·越界行使即停止条件）

1. **否决「恢复旧 recall-eval.ts 复原 `recall:eval`」**：旧形所指 `smoke/recall-eval.ts` 在 HEAD absent（§0.1）=**已废源双废正身**（script+文件同批废于 e621235b）；复活=复活已废评测源+与 `qbank-retrieval-eval.ts` 新 holdout 双源漂移·且背离职门方向（金标应走 fail-closed 真 embed 后继）。
2. **否决「摘除 `:49` continue-on-error 把 recall 臂硬门化」**：信号臂定位系 campaign 设计（无 key 夜恒红=假信号噪音）；真硬门化前置=协调方/用户配 `DASHSCOPE_EMBED_API_KEY` secret——归后刀·本刀以 `::warning::` 诚实 skip 承观察面。
3. **否决「静态门挂入 e2e-static-guards.mjs」**：521 行共享守卫+347 行 proof 邻触改=超量级微刀面·独立 ≤30 行 proof 零邻触（越面诉求归协调方）。
4. **否决「顺带修 `:26` SC2034/其他 workflow findings」**：全 pre-existing 非本刀触面（§0.2-3）·Ban 借机修。
5. **否决「改 nightly-ciw2.yml/deploy.yml 等其余 8 workflow」**：非本刀面（幽灵唯一性 §0.2-2 机证）。

## §2 验收断言（EXEC 门矩阵·全过为绿）

1. **新静态门**：`pnpm workflow-script-existence:prove` **EXIT=0·checked=120·missing=0**（改前基线 missing=1 在卷 §0.2-2）。
2. **actionlint**（若在=在）：nightly.yml findings 改前=改后**恰等零新增**（基线唯一 `:26` SC2034·非触面）；yamllint 未安装=登记缺席（actionlint 承 YAML schema 解析形）。
3. **夜间三 script 词面在册 grep 门**：`model:smoke`/`qbank:retrieval:eval`/`scoring:eval` 三词在 root package.json `scripts` 全命中·`recall:eval` 全树 workflow 零命中。
4. **typecheck 不触**：diff 面零 `.ts/.tsx` + `pnpm typecheck` EXIT=0（零 TS 触面·cached 承认如实登记）。
5. **markers 门**：改动集五类标记词+行首冲突标记**零命中**（词面运行时组装沿 `scripts/i6-239-gates.proof.mjs` 口径·不入卷防自指）。
6. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（基线 2210·本卷 +2 新件=**2212 ≤ cap 2216 余 4**）。
7. **lint**：root `pnpm lint` 零新增 warning（基线 5235 口径亲跑比对·新 proof 零 warning 为预期）。
8. **diff 面**：全刀恰 **4 tracked 路径**=nightly.yml+package.json+新 proof+本 REQUEST·零其他。
9. **frozen-lockfile**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改（package.json 仅 scripts 行零依赖变更）。
10. **est live=0**：零模型外呼零 key 消费（本刀不真跑 eval——真跑需 secret·run 归配 key 后 nightly/手动触发）。

## §3 范围外（越界即停）

1. scoring 臂仅补 `::warning::`（其 script 在册+self-skip 形零改·smoke/scoring-eval.ts 零字节）；模型冒烟臂（`:34-41`）零触。
2. 其余 8 workflow 零触；`e2e-static-guards.mjs` 及其 proof 零触（§1.3-3）；`apps/worker`/`packages/*` 产品码零字节。
3. SSOT 四卷（LEDGER/checklist/batch-residual-plan/issues-master）零触——行翻面权归协调方。
4. GH secrets 配置（`DASHSCOPE_EMBED_API_KEY` 入库）归协调方/用户——不配则每夜 `::warning::` skip 注解=诚实信号非断链（§8-③呈报）。
5. est live=0。

## §4 依赖

上游全已满足：`qbank:retrieval:eval` 定义在 root package.json `:561`+smoke 后继在树（`d0be9f09`）+dashscope 能力 Key fail-closed 链在树（`f6e08e42`/`c9d31be3`）。无同文件并发（§0.2-5 三对表）。

## §5 Ban 列表 + pins

**Ban**：push/force-push（⛔push·git 写只本 worktree commit）·触其余 8 workflow·摘 continue-on-error（§1.3-2）·复活已废 recall-eval.ts（§1.3-1）·挂改 e2e-static-guards（§1.3-3）·借机修 SC2034/lint/协议形红（§1.3-4）·触产品码/SSOT/secrets 面（§3）·弱化门断言·Ban retry-to-green（门红恰 1 attempt·基建红除外）·Ban 伪造已读/已验来源。

**pins**：diff 面=**4 tracked**·新门 **≤30 行**·ghost 扫描 **checked=120**（改前 missing=1/改后 0）·docs 基线 **2210**/预期 **2212**/cap **2216**·root lint 基线 **5235** 零新增·actionlint findings 改前=改后·迁移=**0**·est live=0·actualSpendCny=null。

## §6 est live=0（起草 turn）+ EXEC 门预申明

起草与 EXEC 全程零模型外呼零 Key 加载零生产操作（纯本地 node/actionlint/pnpm 元门）。EXEC 预申明：件a-d 落位→§2 十门逐条亲跑 EXIT 入 §9→STOP 翻 `executed:awaiting_post`。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+nightly.yml+package.json+新 proof）五类标记词+行首冲突标记**零命中**（词面运行时组装口径·不入卷防自指）——EXEC 落卷时对终改动集亲跑复证入 §9。

## §8 STOP（开工条款 + 待裁决项）

**STOP · `executed:awaiting_post`**（EXEC 已落卷=§9·post 审归协调方派单·Ban self-approve·前值 `draft:awaiting_exec`=史录）。开工三条款：①本席自审（§0 锚亲证齐全+四件修法与四点派单修向逐条对表+门矩阵可机检）PASS 落记；②快速链一体授权=派单 brief 明示「诊断+起草+EXEC 一体」（§席位）；③EXEC 不得改 §1-修法四件契约与 §5 Ban/pins（改则回炉）——三条款兑现录于 §9。停止条件：**现场漂移**（§0.1 任一锚 blob 漂移）→停重 pin；**门红不可修**（§2 任一门红且根因不在本刀交付面）→停如实登记；**越界需要**（任何 §3 面诉求）→停另裁。

**待裁决项**：
- ①**env 接线改 `DASHSCOPE_EMBED_API_KEY`**（§1-件a）：推荐=改（后继唯一真依赖·不改=新断链形 §1-4）vs 维持旧双 key 名（仅守卫形不变·脚本恒红）。
- ②**静态门独立 proof vs 挂 e2e-static-guards**：推荐=独立 ≤30 行（量级微·零邻触）。
- ③**secrets 呈报**：`DASHSCOPE_EMBED_API_KEY` 现无任何 workflow 引用（§0.2-1 同批机检面）——配 key 前 recall 臂每夜=skip+`::warning::` 注解（诚实信号）；**配 secret 仅解除 key 缺失臂·CI 真跑还须解决 .env ENOENT（本刀 rev touch .env 修法·§9-rev P1-1/P1-2）**，其后 nightly/手动触发方为真跑。

---

*nightly-recall-fix REQUEST · 2026-10-16 起草 · **STOP=`executed:awaiting_post`（EXEC 落卷=§9+rev 落卷=§9-rev 待席2 复核修订块·post 审归协调方派单·前值 `draft:awaiting_exec`=史录）** · 起草 base=`feat/mysql-schema-skeleton` @`656fc7be`（本席亲 fetch·origin tip 链顶亲证·⛔pull --rebase 未用）· 分支 `line/nightly-recall-fix` · 工作树 `meetwise-nrf`（本席立·branch/worktree/同名卷三查 §0.2-5）· 缺陷=nightly.yml:55 幽灵 `pnpm recall:eval`（e621235b 摘除未跟改）被 `:49` continue-on-error 洗绿=夜间召回金标门结构性 skip-as-pass+`:54`/`:64` skip 注解缺失+`:33` 段注释失实 · 修法四件=改接 qbank:retrieval:eval（诚实 env 接线 DASHSCOPE_EMBED_API_KEY）+双 `::warning::`+段注释诚实形+新静态门 ≤30 行（改前 missing=1 机检·改后 0）· 零产品码零迁移 · est live=0 · markers=0 · ⛔push · STOP*

## §9 EXEC 记录（EXEC 席落卷 2026-10-16·快速链一体席·STOP→`executed:awaiting_post`）

**授权链**：起草落卷 `5c9e34a7`（STOP=`draft:awaiting_exec` 史录）→ 本席自审 PASS（§0 十锚亲证在卷+四件修法对派单四修向逐条对表恰等+§2 十门全可机检）→ 快速链一体授权=派单 brief「诊断+起草+EXEC 一体」明示 → EXEC 本卷（零 merge·基线即建树 `656fc7be`·⛔merge主线 ⛔pull --rebase 未用）。

**① §0 重 pin**：四诊断锚 blob（`d0be9f09`/`f6e08e42`/`c9d31be3`+absent 双件）落卷复算**全数恒等零漂移**·nightly.yml/package.json 系本刀自改面（改前 blob `ac47e884`/`3b04b871` 在卷）。停止条件①未触发。

**② 基线漂移登记（非违约·并线归协调方）**：EXEC 期主线 origin tip 因并发 worker-shutdown-seq 波推进 `656fc7be`→`79d83617`（8 files=SSOT 三卷+worker 四码面+该卷 REQUEST）——对四触面**零交叠机证**（`git diff --name-only 656fc7be origin/feat/mysql-schema-skeleton` 交集空亲证）；本刀 Ban merge 主线不并线·支线并线归协调方 nail 波（沿本仓 nail 波 merge --no-ff 先例形·零冲突预期）。

**③ 门矩阵十门全表**（终树交付 commit 前亲跑·基线 `656fc7be` 口径）：

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| 1 | workflow-script-existence:prove（新门·件d） | EXIT=0·missing=0 | `workflows=9 checked=120 missing=0`（改前基线 missing=1=nightly recall:eval §0.2-2） | 0 | 绿 |
| 2 | actionlint（若在=在） | findings 改前=改后零新增 | nightly.yml 恰 1 finding=`:26` SC2034（pre-existing 非触面·Ban 借机修遵守）；全目录 7 findings 恰等基线（§0.2-3）·yamllint 未安装=登记缺席（actionlint 承 YAML schema 形） | 0* | 绿（*门形=零新增·raw exit=1 系基线预存 finding 承登） |
| 3 | 夜间三 script 在册 grep 门 | 三词在册+幽灵零命中 | `model:smoke`/`qbank:retrieval:eval`/`scoring:eval` 全命中 package.json·`recall:eval` 全 workflow 零命中 | 0 | 绿 |
| 4 | typecheck 不触 | EXIT=0+零 .ts/.tsx 触面 | `pnpm typecheck` EXIT=0（tsconfig.e2e 形·diff 面零 TS 亲证） | 0 | 绿 |
| 5 | markers | 改动集五类词+冲突标记零命中 | 终改动集四文件直扫 **0 hits**（词表运行时组装口径防自指） | 0 | 绿 |
| 6 | docs:check | EXIT=0·≤cap 2216 | **2212 ≤ 2216 余 4**（基线 2210+本卷 2 新件·恰等 §5 pin 预期） | 0 | 绿 |
| 7 | lint | 0 errors·零新增 warning | root `pnpm lint` **0 errors·5235 warnings**=基线恰等（新 proof 零 warning） | 0 | 绿 |
| 8 | diff 面 | 恰 4 tracked 路径 | nightly.yml（M）+package.json（M）+scripts/workflow-script-existence.proof.mjs（新）+本 REQUEST（新·commit 1）·零其他 | 0 | 绿 |
| 9 | frozen-lockfile | EXIT=0 零 lockfile 改 | `pnpm install --frozen-lockfile` EXIT=0（新树全量装 19m38s·lockfile 零改） | 0 | 绿 |
| 10 | est live=0 | 零模型外呼零 key 消费 | 全程零外呼（未真跑 eval·run 归配 secret 后 nightly/手动） | — | 绿 |

**④ diff numstat（对基线 `656fc7be`）**：nightly.yml +6/−7（件a/b/c）·package.json +1/−0（件d 注册）·scripts/workflow-script-existence.proof.mjs 新增 27 行（≤30 pin 恰等）·本 REQUEST 新增（commit 1 104 行+本 §9）。**恰 4 tracked 路径**。

**⑤ 修法四件落点对表**：件a=`:48` name 词面改接+`:50-51` env 单 key `DASHSCOPE_EMBED_API_KEY`+`:53` 守卫改判+`:54` `pnpm qbank:retrieval:eval`（continue-on-error 两臂原样维持=§1.3-2 遵守·`:53`/`:54` 系席2 P2-4 终树行号勘正·原 `:54`/`:55` 误沿改前基线引锚）；件b=`:53`/`:63` 双 `::warning::` 对齐 `:40` 先例形（同 P2-4 勘正口径）；件c=`:33` 段注释诚实形；件d=新门 27 行+package.json 注册行。

**⑥ pins 零翻声明+停止条件判定**：§5 pins 全值复验恰等（4 tracked/27≤30 行/checked=120·missing 1→0/docs 2210→2212≤2216/lint 5235 恰等/actionlint 零新增/迁移 0/est live=0）。停止条件：①现场漂移未触发（§9-①）②机制不满足未触发（十门全绿）③越界需要未触发（零 §3 面诉求）④验收红不可修未触发（唯一 raw exit=1 系 actionlint 基线预存 finding·门形=零新增口径承登非红）。

**⑦ 偏离清单（理想零·登记两条非越面）**：1. 基线漂移=origin tip EXEC 期被并发波推进（§9-②·零交叠机证·非违约）。2. actionlint 门口径登记：本机 actionlint 对基线原样即 exit=1（`:26` SC2034 pre-existing）——门判据按「findings 集改前=改后零新增」行使（§0.2-3 预登记口径）·若按 raw-exit 口径则基线即红=非本刀交付面（如实承登防误判）。

**⑧ 七字段（SOP trace）**：
- **任务类型**：快速链一体席（诊断+起草+EXEC·量级微·L1 面工作流接线+静态门·派单 brief 明示一体授权）。
- **工作区范围**：worktree `meetwise-nrf`（分支 `line/nightly-recall-fix`·恰 4 tracked 路径·零他树触碰）。
- **来源证据**：派单 brief+§0 十锚亲读（blob+line 双锚）+幽灵唯一性机检（checked=120 missing=1）+§9-③ 十门 EXIT 收据。
- **已读文档**：`.github/workflows/nightly.yml` 全文·root `package.json` scripts 面·`apps/worker/smoke/qbank-retrieval-eval.ts`+`qbank-retrieval-release.ts`（validate 臂）·`packages/ai-runtime/src/embedder.ts`+`dashscope-native-config.ts`+`secret-fingerprint.ts`+`g7-freetier-reprove-guard.ts`（fail-closed 链）·`apps/worker/smoke/scoring-eval.ts` 头段（self-skip 形）·`scripts/ai-docs/public-text-policy.mjs`（PTP 约束）·`ai-docs/delivery/harness/boot-validate-REQUEST.md`（卷形先例）·`git show e621235b`（断链源考）。
- **跳过文档及原因**：`ai-docs/rules/*`+产品面 docs（零产品码零规则面·修法面纯 workflow 接线+元门）——快速链量级微·契约由本卷 §1-修法承载。
- **结论状态**：`executed:awaiting_post`（门矩阵十门全绿·post 审归协调方派单·行翻面权归协调方）。
- **验证命令**：`pnpm workflow-script-existence:prove`·`actionlint .github/workflows/nightly.yml`（及全目录）·夜间三 script grep 门·`pnpm typecheck`·markers 直扫·`node scripts/ai-docs/check-docs.mjs`·`pnpm lint`·`pnpm install --frozen-lockfile`·`git diff --numstat 656fc7be`——逐条 EXIT 在 §9-③。

**⑨ 后继登记（归协调方·非本刀面）**：①GH secrets 配 `DASHSCOPE_EMBED_API_KEY`（§8-③·不配则 recall 臂每夜=skip+`::warning::` 注解诚实形·**配 secret 仅解除 key 缺失臂·CI 真跑还须 .env 占位——本刀 rev touch .env 已消账·§9-rev P1-1**）；②recall 臂硬门化（摘 continue-on-error）须以 secret 在配为前提·归后刀；③并线（`line/nightly-recall-fix`→主线）归协调方 nail 波（§9-② 零冲突预期）；④LEDGER/checklist 行翻面权归协调方（本刀不宣称关闭）；⑤**第二断链消账（§9-rev P1-1）**+同型面观测登记：顶层裸 `readFileSync(.env)` 全 smoke 共 9 处（含 `model-live-smoke.ts:11`=夜间**硬门臂**·配 `MODEL_API_KEY` 后 CI 同型 ENOENT 即真红无洗绿）——归后继观测刀（本刀 Ban 借机修·零触）。

## §9-rev 修订记录（2026-10-16·席2 post FAIL P1×2+P2×2→rev 回路落卷·快速链席·STOP 维持 `executed:awaiting_post` 待席2 复核修订块）

**rev 触发**：席2 post 审 FAIL 定谳四项（P1-1 第二断链/P1-2 诊断漏推导/P2-4 行号/P2-5 docs 口径）→rev 回路（量级微·20 分钟形）→本席亲证后落卷。rev 面=nightly.yml recall 步 +1 行+本卷四处勘正/补登·零产品码零迁移。

- **P1-1 第二断链（FAIL 主因·已修）**：`apps/worker/smoke/qbank-retrieval-eval.ts:16` 顶层裸 `readFileSync(new URL('../../../.env', import.meta.url), 'utf8')`（无 try/catch）——`.env` 系 `.gitignore:10` 未跟踪（`git check-ignore` 亲证·本机 ls 无 .env 亲证）→CI checkout 无 .env→配 secret 真跑即 ENOENT throw exit 1→被 nightly.yml `:49` `continue-on-error: true` 洗绿=第二断链。「配 secrets 后才真跑」三处承诺（§8-③/§9-⑨①/footer）对 CI 语境为假（GH secrets 现空集=今日诚实 skip 仍成立·P1 触发面=配 secret 动作）。**修法落点**：nightly.yml recall 步 run 块 `pnpm qbank:retrieval:eval` 前置 `touch .env`（rev 树 `:54`·注释「CI checkout 无 .env·脚本顶层 readFileSync 需占位文件」·占位空文件 readFileSync 成功·key 仍走 workflow env 注入——`.env` 装载臂仅 `MODEL_*|EMBED_MODEL` 本不承载 embed key）。
- **P1-2 诊断漏推导（§8-③ 已改+§9-⑨ 已补登）**：§0.1 行18 已亲读「CI 无 `.env`」（qbank-retrieval-eval.ts `:16-19` 锚）却未推导顶层 readFileSync 崩溃语义=诊断盲点。§8-③ 措辞改「**配 secret 仅解除 key 缺失臂·CI 真跑还须解决 .env ENOENT（本刀 touch .env 修法）**」；§9-⑨①/⑤ 补登第二断链消账笔+同型面观测登记（9 处含硬门臂 model-live-smoke.ts:11）。
- **P2-4 行号勘正（§9-⑤ 已改）**：件a 终树（00035a59）行号 `:54` 守卫/`:55` 命令→**`:53`/`:54`**（对届树 nightly.yml 亲读机证）；件b 同表 `:54`/`:64` 系同型误沿改前基线引锚→终树实位 `:53`/`:63` 一并勘正；史录 §0/§1/§6 对改前 blob `ac47e884` 的 `:54`/`:55` 引锚不动（彼时行号自洽）。rev 树终位：守卫 `:53`·touch `:54`·命令 `:55`。
- **P2-5 docs 口径勘正（rev 时点实测）**：席2 定谳=主线 **2211** 非 2212·合并后 2213（§9-③ 门6/§5 pins 的 `2212` 系**本支线届树**实测=基线 2210+本卷 2 新件 REQUEST+proof·非主线值·勿混）。**rev 时点亲证推进**：主线 tip 已再推进 `92086586`（requeue-backoff 波）·临时 worktree docs:check 实测主线现值 **2212**；支线两新件对主线 `git ls-tree` 零命中亲证·merge-base 仍 `656fc7be`→**合并后投影 2214**（2212+本卷 2 新件）。本支线届树 2212 口径不变·nail 波并线门以届时主线实测为准。

**rev 门复行使（终树交付 commit 前亲跑）**：见下表。

| # | 门 | 实测 | EXIT | 结论 |
|---|---|---|---|---|
| 1 | workflow-script-existence:prove | `workflows=9 checked=120 missing=0` | 0 | 绿 |
| 2 | actionlint nightly.yml | 恰 1 finding=`:26` SC2034（pre-existing·改前=改后恒等零新增） | 0* | 绿 |
| 3 | 夜间三 script 在册 grep 门 | 三词全命中+`recall:eval` 全 workflow 零命中 | 0 | 绿 |
| 4 | markers 五类词+冲突标记 | rev 改动集（nightly.yml+本卷）0 hits | 0 | 绿 |
| 5 | docs:check 届树 | 2212 ≤ 2216 余 4（rev 零新件·文件计数不变） | 0 | 绿 |
| 6 | diff 面 | 恰 2 tracked=nightly.yml+本卷 REQUEST·零其他 | 0 | 绿 |

**rev 结论**：P1-1/P1-2/P2-4/P2-5 四项全落卷·门复行使全绿·STOP 维持 `executed:awaiting_post`（rev 后待席2 复核修订块·Ban self-approve）。
