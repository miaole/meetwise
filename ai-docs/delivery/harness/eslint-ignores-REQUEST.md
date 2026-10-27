# ESLINT-IGNORES REQUEST — P2-C lint 门状态序依赖永久解法起草卷·eslint 全局 ignores 补生成物豁免面（PERF-web/x16 两刀共同发现·微刀卷形·修法随卷落码）（docs-only 起草+config 随卷·起草落卷即停）

**Status**: **`closed`**（2026-10-27 EXEC 落卷翻面·收据刀形·史录不洗：`draft:awaiting_dual`（2026-10-26 起草落卷·修法随卷落码无独立 EXEC 相位·派单令即授权面）→ 值形勘正 `draft:awaiting_pre_exec_dual`（主流形·沿 micro-batch/x16-adv 全仓口径·STOP 值形裁决随令）→ **`closed`**（2026-10-27 pre-exec dual（r1 席1+r2 席2）双 PASS 放行+协调方授权行使·§9-EXEC 门矩阵落卷·无 post-prove 相位·**STOP 三处钉已闭：本 Status 行 + §8 + 卷尾注 同值 `closed`**）· alone≠dual 已解（pre-exec 双审放行在卷）· 卷 closed ≠ 矩阵行/SSOT 翻面——pins 十一值零动）。

**席位**：meetwise eslint-ignores 小刀起草席（docs-only 起草·协调方派·PERF-web/x16 两刀共同 P2-C 永久解法·⛔动主仓 ⛔push）。
**基线**：`origin/main` @ **`7c5aa7445`**（Merge PR **#162** line/perfweb-draft·`git fetch origin` 本 turn 成功·分支 `line/eslint-ignores-draft` 零独有 commit·worktree `meetwise-ignores`）· `node scripts/ai-docs/check-docs.mjs` 本树起草前亲跑 **EXIT=0 · scanned 2420**（= cap 2420 恰等零余量 · §2-1 预算核）· 基线四门亲跑：`pnpm -C apps/web lint` **605=cap 恰等 EXIT=0** · `pnpm lint` **5362=cap 恰等 EXIT=0** · `pnpm -C apps/web typecheck` **EXIT=0** · `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**（步进前值）。
**必读清单（起草前逐件亲读·显式路径）**：`eslint.config.mjs` → `packages/config/eslint.config.base.mjs`（规则唯一授权面·LINT-DESIGN §1.5 S1）→ 13 eslint config 全量（root+apps/web+apps/api+apps/worker+packages 9 薄壳·逐件亲读）→ `apps/web/package.json` → `scripts/run-e2e-isolated.mjs`（收据写盘三位）→ `.gitignore` → `ai-docs/delivery/harness/lint-design.md`（§1.5 S1/S2 切片面）→ 共同发现登记 `ai-docs/delivery/harness/perfweb-REQUEST.md` §P2-C → 先例 `harness/uc003x-REQUEST.md` 线（e10e1b673 同象）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①协调方派单令（PERF-web/x16 两刀共同 P2-C 永久解法·eslint-ignores 小刀起草授权·⛔动主仓 ⛔push）；②perfweb-REQUEST.md §P2-C 登记行（「后继刀建议 eslint ignores 补 `apps/web/.next`+`.tmp`·本卷 Ban 就地改 lint 配置不触·留后刀」——**本卷即其后刀**）；③uc003x 线 `e10e1b673` 同象先例（「lint .next 清场前置实测 2913→601 恰等」——本缺口先于两刀存在·main 同样中招=共享机制缺口）；④结构范本=`harness/x16-adv-REQUEST.md` 同壳（微刀卷形）。

---

## 认领核对 · fresh 亲点 + 在飞零重叠核

- `git worktree list` 本 turn **35 树**实测——`line/eslint-ignores-draft` 恰 1 命中=本席（grep ignores 恰 1=本树）；其余 34 树分支名逐扫零 lint/eslint/config 触面 → eslint config 面本 turn 零他刀认领。
- `ls ai-docs/delivery/harness/ | grep eslint-ignores` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（双审日必做）**：本刀触面=4 tracked（§2-4）；届时对各在飞分支 `git log -1 -- <触面文件>` 逐件复核，任一分支顶对触面存在 `7c5aa7445` 之后新增提交 → 触 §8 停止条件「现场漂移」停手上报。

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`7c5aa7445`·**双审日照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

**届值重 pin（2026-10-27 EXEC 并线后 tip=`00ceb8dc4` 亲算）**：runner `95101ada`→`4f8a4c04`（4200→4222 行·x16 注册位并入 +18·写盘三位 `:2808/:2895/:3051`→`:2826/:2913/:3069`·RAW_DIR `:2799`→`:2817`·三位零动功能保持）·policy `acb89fa3`→`7219d714`（499→511 行·`MAX_FILES=2_423` 届值=CAP-SANCTION-2423）·proof `5228c6f0`→`a89f4966`（428→437 行·四联动点 `2_423`/`f-2423.md`/`:2424`）·base `13b31dd0`→`2a690491`（83→99 行·含本刀修法 ignores 对象=交付面在卷）·gitignore `b8b82897`/perfweb-REQUEST `04109241`/lint-design `b3f28ee6` blob 零漂·eslint 13 件（root+apps 3+packages 8 薄壳）被他刀零触·机制结论零翻。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex·行数括注）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `eslint.config.mjs` | `48298df6`（4） | 薄壳 re-export base（:1-:4·零 ignores·根跑 config=cwd 本件） |
| `packages/config/eslint.config.base.mjs` | `13b31dd0`（83） | **全树唯一规则面**：`tseslint.config(单对象)`·`files: ['**/*.ts','**/*.tsx']`+四规则 warn——**零 `ignores` 键**（逐行亲读） |
| `apps/web/eslint.config.mjs` | `b41d170e`（4） | 薄壳 re-export base（web 跑 config=cwd 本件·:3 相对路径 import） |
| `packages/config/eslint.config.mjs` | `88e7aebf`（4） | 薄壳 re-export base（同形） |
| `apps/web/package.json` | `adf5d6b8`（72） | `:7` `"lint": "eslint . --max-warnings 605"`·`:26` `"typecheck": "tsc --noEmit"` |
| `package.json` | `3f87cd7d`（754） | `:7` `"lint": "eslint . --max-warnings 5362"`·`:9` `"docs:check"` |
| `scripts/run-e2e-isolated.mjs` | `95101ada`（4200） | **收据写盘三位**：`:2808`（uc001-perf-api 形）·`:2895`（uc001-perf-web 形·本刀复现逐字形）·`:3051`（PERF_api 参数化形）逐处 `writeFileSync(join(RAW_DIR, '_caps-child.source.mjs'), ...)`·`:2799` `RAW_DIR = join(ROOT, '.tmp/uc001-perf-api-receipts')` |
| `.gitignore` | `b8b82897`（38） | `:6` `.next/`·`:15` `.tmp/`（两生成物面均 gitignored=CI fresh clone 不受影响机制根） |
| `scripts/ai-docs/public-text-policy.mjs` | `acb89fa3`（499） | `:201` `MAX_FILES = 2_420`（步进前值）+ 注记栈 `:193-:200` |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `5228c6f0`（428） | 越限臂四联动值 `2_420`/`f-2420.md`/`:2421`（:399/:406/:409/:412 旧行号） |
| `ai-docs/delivery/harness/perfweb-REQUEST.md` | `04109241`（191） | **§P2-C 共同发现登记行 `:183`**（亲读逐字：「红 2917 warnings EXIT=1…后继刀建议 eslint ignores 补 apps/web/.next+.tmp…留后刀」）·`:175` web lint 605 门 |
| `ai-docs/delivery/harness/lint-design.md` | `b3f28ee6`（71） | §1.5 S1（config 包产物=规则唯一授权面）/S2（workspace 薄壳指针）切片令 |

### 0.2 缺陷面亲证（机制 + 实测矩阵 + 复现命令落文）

- **缺陷定位（亲读）**：全树 13 eslint config（root 1+workspace 薄壳 11（apps 3+packages 8）+base 1=13）**零 `ignores` 键**——12 薄壳逐件亲读+base 全文件亲读（§0.1）→ eslint 对生成物面零豁免，凡 cwd 下可解析文件一律入 lint。两生成物路径亲证：① `apps/web/.next/types/`（真实 next build 生成 ts 面·本刀自 main 树同源 build 产物亲数 **45 个 ts**·300K）——生成件 naming-convention 警告面；② `.tmp/*/_caps-child.source.mjs`——runner 收据留痕（写盘三位 §0.1·文本标记非 JS）——eslint 默认 js/mjs/cjs 解析面零规则命中仍 parse → **Parsing error=error 级红**（`.tmp/uc001-perf-web-receipts/_caps-child.source.mjs 1:23 error Parsing error: Unexpected character '·'` 亲读）。
- **实测矩阵（本树亲跑·EXIT 原值）**：

| 树态 | web lint（cap 605） | root lint（cap 5362） | api lint（cap 1499） | web typecheck |
|---|---|---|---|---|
| 干净基线（生成物缺席） | 605 problems（0 errors）**EXIT=0** | 5362（0 errors）**EXIT=0** | 1499 **EXIT=0** | **EXIT=0** |
| 生成物在场（修法前） | **2917 problems（0 errors·2917 warnings）EXIT=1** | **7675 problems（1 error 7674 warnings）EXIT=1** | — | — |
| 生成物在场（修法后） | **605=cap 恰等 EXIT=0** | **5362=cap 恰等 EXIT=0** | — | — |
| 生成物复清（修法后） | 605=cap 恰等 EXIT=0 | 5362=cap 恰等 EXIT=0 | 1499 恒等 EXIT=0 | EXIT=0 |

- **共同发现数对读（如实）**：web 红 2917=perfweb §P2-C 登记数**恰等复现**；root 红本刀实测 **7675**（1e/7674w）对派单口径 7679 **同形 +4 面差**（届 prove 全量 .tmp 多收据件 vs 本刀最小两件 staged·同象如实承登）·uc003x `e10e1b673` 2913→601 同象三现 → **共享机制缺口**（非单刀残面）。
- **CI 不受影响机制根**：两生成物均 gitignored（§0.1 `.gitignore:6/:15`）·本刀 staged 后 `git status --short` **零噪声亲证**·`git ls-files | grep -E '\.next/|\.tmp/'` **零命中亲证** → fresh clone 两面缺席=门恒绿·状态序依赖仅中招本地 prove 后行使序。
- **复现命令落文（两形）**：全量形（真实行使序）=`pnpm uc001:nhp-perf-web:prove`（web 容器 `next build` 回写宿主 `apps/web/.next/`+runner 落 `.tmp/uc001-perf-web-receipts/_caps-child.source.mjs`）→ 复跑 `pnpm -C apps/web lint`+`pnpm lint` 双红；最小形（本刀实测行使·零 docker）=`mkdir -p apps/web/.next && cp -a <同源 build 树>/apps/web/.next/types apps/web/.next/`（mkdir -p 前置=r2 P2 项·`.next` 缺席时裸 `cp -a` 会将 `types` 落位为 `.next` 本体而非 `.next/types`）+`printf 'wrapper-inline-source · uc001 capped child 三容器扩展形 · PERF-web 收据(.tmp 生成·零 tracked scripts wrapper)\n' > .tmp/uc001-perf-web-receipts/_caps-child.source.mjs`（逐字=runner `:2913` 形·届值行号重 pin）→ 双红复现（§0.2 矩阵行 2）→ 验后 `rm -rf apps/web/.next .tmp/uc001-perf-web-receipts` 复清。

## §1 修法（恰 1 改面=`packages/config/eslint.config.base.mjs` 全局 ignores·零规则改动·cap 随刀步进）

- **① base 单点全局 ignores**：base 头部插全局 ignores 对象 `{ ignores: ['**/.next/**', '**/.tmp/**'] }`（`tseslint.config` 首参·全局 ignores 语义=仅 ignores 键对象）——**单点覆盖双门**：root 跑（cwd=仓根）与各 workspace 跑（cwd=apps/web 等）共用本 base（§0.1 薄壳 13 件逐件亲读）·相对 ignores 按行使 cwd config 锚定 → **双星锚形（`**/` 前缀）双锚通命中**（根锚下 `apps/web/.next/**` 命中+web 锚下 `.next/**` 命中·零源码误豁免：`git ls-files` 零 tracked `.next`/`.tmp` 路径亲证 §0.2）。**零规则改动**：四规则/plugins/languageOptions/`files` 三元组零触（diff 纯 ignores 对象插入+原对象缩进·逐 hunk 亲对）。**项形沿既有**：双星 glob 项形=本文件 pathGroups `'@meetwise/**'` 同构（lint-design §:34 `.prettierignore` 设计项形 `dist/**` 同族）。
- **② 派单措辞落地说明（如实）**：派单令「eslint.config.mjs 全局 ignores 增 `apps/web/.next/**`+`.tmp/**`」——root `eslint.config.mjs` 单点落法经实验**否决**（§1.3-①：root 5362 恢复 EXIT=0 但 web 2917 红不退=root config 不进 web cwd 行使面）→ 修法按门矩阵功能等价落 **base**（两 lint 门共同消费面·微刀恰 1 config 触面）；`**/` 双星形对派单字面 `apps/web/.next/**`+`.tmp/**` 为**锚定语义等价展形**（根锚展开恰为派单字面值·web 锚展开为 `.next/**`/`.tmp/**`）·偏离如实承登·协调方双审可否决回炉。
- **③ cap 随刀步进 2420→2421（+1 恰等零多放）**：本卷新受管 1 件（本卷 .md）→ 届扫 2421>2420 必超（PTP_FILE_LIMIT 形）·沿 uc003x `c1a4ce3a0` 起草随刀「+1 恰等零多放」先例形+协调方派单预授权「越限沿先例步进承登」随令：policy .mjs `MAX_FILES 2_420→2_421`+注记置顶·proof .mjs 越限臂四联动点（`2_421`/`f-2421.md`/`:2422`+注记）恰等改·PTP proof **12/12 EXIT=0** 亲跑（步进值全行使）。
- **④ 机制效果**：lint 门对两生成物面**状态序无关**（在场/缺席双态恒 605/5362 EXIT=0·§0.2 矩阵行 3/4 亲证）→ prove 后 lint 门**免清场前置**·runner 收据留痕机制零触（写盘三位零动·收据功能保持仅 lint 豁免）·CI fresh clone 行为零变。

### §1.3 否决表（落选项诚实留痕）

| 否决项 | 否决实验/理据（亲证） |
|---|---|
| ① root `eslint.config.mjs` 单点落派单字面 `['apps/web/.next/**','.tmp/**']` | 本树亲跑：root **5362 EXIT=0** 恢复但 web **2917 EXIT=1 红不退**——flat config 无向下继承·web 跑 cwd config=`apps/web/eslint.config.mjs`（§0.1）·双门只修一门=违门矩阵 |
| ② 逐 workspace 薄壳各加 ignores（root+web+…多件） | 违微刀恰 1 config 触面·base 单点已全 workspace 覆盖（13 shell 共消费）·冗余面 |
| ③ 落 `.eslintignore`（legacy 文件形） | eslint 9 flat config 已废 .eslintignore 消费+新增受管文件违「零新文件」预算核·flat 全局 ignores 对象为 9 正形 |
| ④ 清场前置写进 prove/门脚本（run-e2e-isolated.mjs 加 rm） | 触 runner 共享面（在飞多刀注册位）·治标（序依赖改个方向）非治本·perfweb §P2-C「留后刀」指 config 豁免形 |
| ⑤ lint 帽随红步进（605→2917/5362→7675） | 生成物警告面非源码面·帽=源码警告基线·步进帽=永久吞红 Ban |
| ⑥ `.tmp` 面不豁免（只豁 `.next`） | root 红含 **1 error**（caps-child 解析红 §0.2）——warnings 豁免不消 error 级红·`.tmp/**` 为必需非卫生项 |

## §2 验收门矩阵（起草门·本 commit 适用·双审照本节复跑·**数字口径以实跑实测为准**）

1. **docs:check + cap 预算核**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2421=cap 2421 恰等**（基线 2420=cap 恰等零余量亲跑+本卷 1 件=2421 必超 → §1-③ 随刀步进·偏离派单门「零越限」如实承登）。
2. **PTP proof**：`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**（2_421/2422 双值全行使·步进后亲跑）。
3. **markers=0**：本刀改动集五类标记词（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·防自指不复抄）+行首冲突标记严格形 grep **零命中**（起草席亲跑·§7）。
4. **diff 面机检**：`git show --stat HEAD` **恰 4 tracked**=本卷 .md+`packages/config/eslint.config.base.mjs`+policy 两 script——**派单门「恰 2 tracked（REQUEST+eslint.config.mjs）」偏离如实承登**：①cap 恰等零余量现实强制 policy 两 script 随刀（uc003x `c1a4ce3a0` 同构先例：3 tracked 起草 commit）②config 改面落 base 非 root shell（§1-② 否决实验）·零其他路径·多任何未登记 tracked 即停。
5. **lint 双门双态（状态序依赖消除亲证）**：生成物缺席 `pnpm -C apps/web lint` **605=cap EXIT=0**+`pnpm lint` **5362=cap EXIT=0**；生成物在场复跑**同值同 EXIT**（本刀 §0.2 矩阵行 3 亲证·双审可选最小形复现复跑）·邻面 `pnpm -C apps/api lint` **1499=cap 恒等 EXIT=0**（零规则漂移旁证）·**lint 帽零步进**（605/5362/1499 三帽零动）。
6. **web typecheck 零影响**：`pnpm -C apps/web typecheck` **EXIT=0**（ignores ≠ tsconfig 面·tsc 消费面零触亲证）。

## §3 范围外（越界即 FAIL）

1. **规则面零触**：四规则/plugins/languageOptions/`files` 零动（diff 纯 ignores 对象+缩进·零调参=base 头注「规则唯一授权面」语义保持）。
2. **lint 帽零动**：605/5362/1499 及各 workspace 帽零步进零触碰。
3. **runner/prove 面零触**：`run-e2e-isolated.mjs` 零 diff（收据写盘三位功能保持·仅 lint 豁免其生成面）·prove 脚本零触。
4. **CI/tsconfig/gitignore 面零触**：workflow/`.gitignore`/tsconfig 零 diff（两生成物 gitignore 现状即机制根·零改）。
5. **共享 SSOT 零改**：矩阵/case-matrix/queue/ledger/backlog 只读——本卷零矩阵行（机制修非 case 刀·coveredCount=8 零动·EXIT0=case≠covered 不适用面如实注）。

## §4 依赖

**①上游已满足**：flat config 全局 ignores 语义（eslint 9 在树·base 消费形 §0.1）+两生成物路径与写盘三位在树（§0.1/§0.2 亲证）+cap 步进先例形（`c1a4ce3a0`）。**②同文件并发**：base/policy 三件在飞零他刀认领（认领核对亲点）——双审日 §0.0 复核必做。**③下游**：perfweb/x16 后继并线终验五门「lint 前清生成物」前置义务**随本卷落码解除**（届值以双审后并线树实测为准）；后续 prove 类刀 lint 门免清场。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban self-approve（双审两独立外席·alone≠dual）；Ban 规则面/帽面/tsconfig/CI/runner 触面（§3 任一即 FAIL）；Ban 帽随红步进（§1.3-⑤）；Ban 清场前置改序依赖方向（§1.3-④）；Ban 生成物面入 tracked（gitignore 现状零动）；Ban 借本卷宣任何 covered/列升格（机制修非 case 刀）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn）

est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（lint/typecheck/docs 门全本地静态·复现最小形零 docker·生成物两件 staged 验后复清）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+base+policy 两 script·4 tracked）五类标记词（词面运行时组装口径·防自指不复抄）+行首冲突标记严格形 grep **零命中**（起草席亲跑·回执随双审留痕）。

## §8 STOP（三处钉·closed 态·停止条件四类）

**STOP · `closed`（三处钉：本节 + Status 行 + 卷尾注 同值·2026-10-27 EXEC 落卷翻面·收据刀形）· 史录不洗：`draft:awaiting_dual`（2026-10-26 起草落卷·值形勘正→主流形 `draft:awaiting_pre_exec_dual`）→ `closed`（2026-10-27 pre-exec dual（r1 席1+r2 席2）双 PASS 放行+协调方授权行使·修法随卷落码无独立 EXEC 相位·§9-EXEC 落卷·无 post-prove 相位）· alone≠dual 已解 · 停止条件四类行使期已核未命中（§9-EXEC）· 翻面权归协调方。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：双审日 tip 对 §0.1 任一锚 blob 漂移（base/runner/gitignore/policy 被他刀改写）或在飞分支新增 config 面触提交 → 停·重 pin 回炉。
- **机制不满足**：双审复跑与本卷 §0.2 实测矩阵不符（ignores 后生成物在场仍红·或邻面帽漂）→ 停·如实升级（Ban 就地改断言迁就）。
- **越界需要**：修法诉求超 §1 恰 1 config+cap 步进面（需触规则/帽/tsconfig/CI/runner）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面 → 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9-EXEC（2026-10-27 · EXEC 席行使落卷 · pre-exec dual（r1 席1+r2 席2）双 PASS 放行 · 协调方授权行使 · 修法随卷落码无独立 EXEC 相位=收据刀形 · ⛔push）

1. **r2 P2 三件先落（本卷文面·行使落卷）**：①**§0.2 :39 分解勘误**：起草面「root 1+workspace 11+config 包 2」加和 14 与全量 13 不自洽 → 勘正「root 1+workspace 薄壳 11（apps 3+packages 8）+base 1=13」（r2 引式「薄壳 10（apps 3+packages 7）」与本树 eslint config 全量 find 亲数 **13** 不符：packages 薄壳实 **8** 件（ai-graphs/ai-runtime/config/contracts/db-mysql/db/domain/qdrant-store）·按 §0 重 pin 规则「基线漂移如实改锚·结论不变则只更行号」落亲数形·结论（13 件零 `ignores` 键）零翻·偏离如实承登协调方裁决）②**§0.2 :51 补 `mkdir -p apps/web/.next` 前置**（`.next` 缺席时裸 `cp -a` 会将 `types` 整体落位为 `.next` 本体而非 `.next/types`·前置后复现形逐字成立）③**STOP 值形勘正**：`draft:awaiting_dual`→`draft:awaiting_pre_exec_dual`（主流形·沿 micro-batch/x16-adv 全仓口径·协调方值形裁决随令·史录不洗）随卷翻 `closed`（三处钉同值）。
2. **并线**：`git fetch origin` **EXIT=0** → 届值 `origin/main bd9c6c7f8`=**#163** x16-adv 已并（#162 perfweb/#161 uc003x 在前·#160-#164 在飞届值如实采）·merge-tree 预演恰 2 处冲突=两 policy 脚本注记/cap 区 → `git merge --no-ff`=**`00ceb8dc4`**（冲突 **dual-keep 双留**：本支 eslint-ignores 起草注记+main X16-ADV 起草注记/CAP-SANCTION-2420/2422 注记并留·kept 行逐条对 stage 对象**字节等机证**）·cap 届值双亲各自合规（main 2422=cap 恰等·本支 c0b73c21a 2421=cap 恰等）·`pnpm install --frozen-lockfile` **EXIT=0**（485ms·lockfile 零漂）。
3. **cap 届值核+恰等步进**：并线树终验亲跑 docs:check **PTP_FILE_LIMIT:2423>2422 红（真 EXIT=1 亲证）**——union 实测 **2423**=main 届扫 2422+本支互斥受管目 1（本卷 REQUEST·两集合无交叠·`ai-docs` ls-files 本树 813 vs main 812 恰 +1 亲证·两 stdout 收据 .log 非扫描扩展名不计）→ **CAP-SANCTION-2423 恰等步进 2422→2423**（协调方常设预授权「union 越限沿常设预授权恰等步进」随令·沿 2420→2422 并线先例形）·policy `MAX_FILES=2_423`+注记·proof 四联动点 `2_423`/`f-2423.md`/`:2424` 恰等改+**P3 勘误随卷**（main 侧「第 2421 个注入路径」与其 `:2423` 断言不自洽·随步进勘正为「第 2424 个」）→ 复跑 **docs:check EXIT=0 scanned 2423=cap 恰等**。
4. **§0 届值重 pin**（tip=`00ceb8dc4` 亲算·详 §0 重 pin 块）：runner 写盘三位 `:2808/:2895/:3051`→`:2826/:2913/:3069`（x16 注册位并入 +18·三位零动）·policy/proof/base blob 行数届值如实更·gitignore/perfweb-REQUEST/lint-design blob 零漂·**在飞未并线（line/webhook-fault-draft 5 commit/line/x33-adv-draft 7 commit）对 13 件 eslint config 面零触提交亲证**（ccl/* 遗留远支系古基线非在飞新提交）→ §8「现场漂移」停止条件**未命中**（锚行号如实更·机制结论零翻）。
5. **修法机证（零规则改动·深等强证形）**：对 base 修法面做 **RULE-FACE PROOF**（旧面 `git show 7c5aa7445:packages/config/eslint.config.base.mjs` 与 tip 新面双 import·`assert.deepEqual`）**EXIT=0**：`new[1] deepEqual old[0]`（四规则/plugins/languageOptions/`files` 全等·规则键=no-explicit-any/naming-convention/no-unused-vars/import/order）+`new[0]` 恰 `{ignores: ['**/.next/**','**/.tmp/**']}` 单键（全局 ignores 语义）·13 件其余 eslint config 零 diff 亲证。
6. **门矩阵 EXIT 原值（§2 六门全绿·红零冲销）**：①docs:check **EXIT=0 scanned 2423=cap 2423 恰等**（落卷树终值）②PTP proof **12/12 EXIT=0**（2_423/2424 双值全行使）③**markers=0 EXIT=0**（五类标记词词面运行时组装口径+行首冲突标记严格形·EXEC 改动集 3 tracked 零命中）④diff 面机检：本 EXEC 落卷 commit=**恰 1 tracked**（本卷 .md·r2 P2 三件+§0 重 pin+§9-EXEC+STOP 翻面）·并线 merge commit=policy 2 tracked（CAP-SANCTION-2423 四联动点+dual-keep 注记）·base 修法面在起草 commit `c0b73c21a`（修法随卷落码形·派单令即授权面）⑤**lint 三帽零步进**（`--max-warnings` 605/5362/1499 三 package.json 届值 grep 恰等零动）。
7. **双态核（状态序依赖消除实证·§2-5 履行）**：缺席态 `pnpm -C apps/web lint` **EXIT=0 605=cap 恰等**+`pnpm lint` **EXIT=0 5362=cap 恰等** → 植针（mkdir -p 前置形 `cp -a` **45 ts·300K** 亲数+收据探针 runner `:2913` 形逐字**自 runner 源码字节提取**落 `.tmp/uc001-perf-web-receipts/_caps-child.source.mjs`·`git status` 探针零入 index 亲证）→ **在场态 web lint EXIT=0 605=cap 恰等+root lint EXIT=0 5362=cap 恰等**（同值同 EXIT=状态序依赖消除实证）→ **探针复清**（rm 双面·缺席亲证）·邻面 `pnpm -C apps/api lint` **EXIT=0 1499=cap 恒等**·`pnpm -C apps/web typecheck` **EXIT=0**。修法前红面（web 2917/root 7675·EXIT=1）系起草卷 §0.2 矩阵行 2 在卷亲证·本 EXEC 不重复行使。
8. **停止条件核**：门红一次=cap 越限红（§9-EXEC-3·常设预授权恰等步进臂·沿先例形处置·非本刀交付面红非迁就）·锚漂=零（§9-EXEC-4）·越界=零（恰 base ignores+cap 步进面）·验收红不可修=零。**est live=0**（全门本地静态·零模型外呼零 Key 零 docker）·pins 十一值零翻。
9. **STOP 终态=`closed`**（三处翻面：Status 行/§8/卷尾注·史录链 `draft:awaiting_dual`→值形勘正 `draft:awaiting_pre_exec_dual`→`closed` 零字洗）· pre-exec dual（r1 席1+r2 席2）双 PASS 放行在先+协调方授权行使·修法随卷落码无独立 EXEC 相位·无 post-prove 相位=**收据刀形**·EXIT0=case≠covered 不适用面如实注（机制修零矩阵行·coveredCount=8 零动）·⛔push。

### 双审会签落卷（pre-exec dual · 席1 r1 PASS+席2 r2 PASS · 两独立外席·alone≠dual 已解 · 2026-10-27）

- **席1 · r1 · PASS**：①**root-only 反事实实验 D 机械复证**——root 单点落派单字面 ignores 独立复跑（root 门恢复 EXIT=0 而 web 门红不退）=§1.3-① 否决实验同象机械复现 → **修法落 base 必需性落**（flat config 无向下继承·双门共同消费面唯 base）；②**双星双锚双 cwd 亲证**——`**/.next/**`+`**/.tmp/**` 根锚（cwd=仓根）与 web 锚（cwd=apps/web）双行使面各自命中·`git ls-files` 零 tracked `.next`/`.tmp` 路径=零源码误豁免亲证；③**P2×3**（§0.2 :39 分解不自洽/§0.2 :53 缺 `mkdir -p` 前置/STOP 值形——三件随 §9-EXEC-1 落卷）。
- **席2 · r2 · PASS**：①**12 薄壳逐件亲读**（root shell+11 workspace 薄壳·零 `ignores` 键逐件亲证·与 §0.2 :39 亲数形恰等）；②**双锚植针实证 605/5362 双态恒等**——植针（`apps/web/.next/types` 45 ts+`.tmp/uc001-perf-web-receipts/_caps-child.source.mjs` 收据探针）在场态与复清缺席态 web lint **605=cap EXIT=0**+root lint **5362=cap EXIT=0** 同值同 EXIT（状态序依赖消除实证）；③**对照臂 Parsing error 复现**——豁免缺席对照态 `.tmp` 探针 `1:23 error Parsing error` error 级红独立复现（§0.2 机制根亲证·红面如实承登非迁就）；④**P2×4**（含 STOP 值形异形登记 `draft:awaiting_dual` 非主流形——全件随 §9-EXEC-1+协调方裁决处置）。
- **协调方裁决落款（2026-10-27）**：①**STOP 值形勘正为主流形 `draft:awaiting_pre_exec_dual` 随卷**（沿 micro-batch/x16-adv 全仓口径·史录不洗）；②**§0.2 :39 分解按亲数形**（root 1+workspace 薄壳 11（apps 3+packages 8）+base 1=13）；③两席 P2 全件随卷覆盖**零残余**。

## §9 状态

**`closed`**（2026-10-27 EXEC 落卷翻面·收据刀形·§9-EXEC 在卷·STOP 三处钉同值）· 前值史录：`draft:awaiting_dual`（2026-10-26 起草落卷·值形勘正→`draft:awaiting_pre_exec_dual`）· 状态翻面权归协调方 · ⛔push ⛔force-push。

---

*ESLINT-IGNORES REQUEST · 2026-10-26 起草落卷 · **STOP=`closed`**（2026-10-27 EXEC 落卷翻面·收据刀形·三处钉：Status 行+§8+本行 同值·史录不洗：`draft:awaiting_dual`→值形勘正 `draft:awaiting_pre_exec_dual`→`closed`·pre-exec dual（r1 席1+r2 席2）双 PASS 放行+协调方授权行使·无独立 EXEC 相位·无 post-prove 相位）· P2-C lint 门状态序依赖永久解法（PERF-web/x16 两刀共同发现·perfweb-REQUEST.md §P2-C `:183` 留后刀令·uc003x `e10e1b673` 2913→601 同象三现=共享机制缺口）· 缺陷锚=13 eslint config 零 ignores 亲读+两生成物亲证（`apps/web/.next/types/` 45 ts 生成件+`.tmp/*/_caps-child.source.mjs` runner 写盘三位 `:2808/:2895/:3051`·gitignore `:6/:15`=CI fresh clone 不受影响机制根）· 实测矩阵=web 605→2917（0e）EXIT=1 恰等复现+root 5362→7675（1e=caps-child Parsing error）EXIT=1 同形（派单口径 7679+4 面差如实承登）→修法后双态恒 605/5362 EXIT=0·api 1499 恒等·typecheck EXIT=0 · 修法=base 单点全局 ignores `**/.next/**`+`**/.tmp/**`（双星锚形·双门通修·零规则改动·项形沿 pathGroups `@meetwise/**` 同构）·root 单点落法 2917 红不退亲证否决（§1.3-①·派单字面锚定语义等价展形偏离承登）· cap 2420→2421 +1 恰等零多放（uc003x `c1a4ce3a0` 先例形·派单预授权随令·四联动点恰等改·PTP 12/12 EXIT=0）· 门矩阵=docs:check 2421=cap 恰等+PTP 12/12+markers=0+lint 双门双态绿+typecheck 零影响+lint 三帽零步进 · diff 恰 4 tracked（派单门 2 tracked 偏离如实承登·零余量 cap 联动强制+config 落 base 否决实验两因）· est live=0 · markers=0 · pins 十一值零翻 · ⛔push*
