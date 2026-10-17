# REPO-HYGIENE 仓库卫生小刀（批5 盘点 Top9·#101 部分 untrack 面 + Dockerfile --prod=false 裁量 + #249/#143 注记登记 · 起草 REQUEST · 落卷即停 · **STOP=`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停 · pre-exec 双审两外席待派 · Ban self-approve · alone≠dual · Dual PASS ≠ EXEC（PASS 只过审·开工须协调方明示授权）· ⛔push · ⛔merge主线）
**席位**：REPO-HYGIENE 仓库卫生小刀起草席（协调方派单·批5 盘点席 Top9+#101 部分「零前置」·⛔push·⛔merge主线）。
**基线**：`feat/mysql-schema-skeleton` @ `2c257eb0`（本席 `git fetch --all` 部分成功——origin 更新在先·`ccl` 远端不可达报错如实登记；建树时 `origin/feat/mysql-schema-skeleton`=`2c257eb0`「fix(worker): 生成进度 started 首拍写改为异步链入…」；派单下界「origin tip≥`92086586`」亲证=`git merge-base --is-ancestor 92086586 2c257eb0` EXIT=0 等号以上成立·**起草落卷前 origin 已被并发席行至 `bf453f49`·本卷基线系其祖先·漂移登记见 §0.2-6**）· 分支 `line/repo-hygiene`（本席 `git worktree add ../meetwise-rh -b line/repo-hygiene origin/feat/mysql-schema-skeleton` 亲立·直接锚 origin tip·分支零自造 merge 节点·⛔pull --rebase 未用）· 工作树 `meetwise-rh`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权/立行权归协调方）**：①协调方派单 brief（批5 盘点 Top9+#101 部分·零前置·三面=untrack 面+Dockerfile --prod=false 裁量+#249/#143 注记面）；②`5e-cleanup-sweep-2-REQUEST.md:39/:67` 归槽呈报原文亲读在卷（「残面仍存在=`git ls-files` 亲证 `apps/web/test-results/.last-run.json`+`apps/web/tsconfig.tsbuildinfo` 仍被跟踪（`.gitignore` 零对应条目）+Dockerfile deps `--prod=false`+runtime `COPY . .` 在——剔除·归槽呈报（第5批-C 供应链/仓库卫生域或后继卫生小刀）」——本卷即该「后继卫生小刀」承接席）；③issues-master `#249` 行原文（仓外 `~/Documents/Meetwise产品审计-更正版/issues-master.md:526` 协调方持有·本席亲读摘录见 §1.3）·`#143` 承引 `authz-harden-REQUEST.md:35` + `execution-master-checklist.md:2288/:2357` STILL OPEN 行（亲读在卷）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/`git hash-object`/`git rev-parse HEAD:` 实测 @`2c257eb0`·**EXEC 立项照本节对届时 tip 再重 pin——基线漂移如实改锚·结论不变则只更行号**）

### 0.0 防重三对表

- `git branch --list "line/repo-hygiene"` 恰 1 命中=本席分支；`git worktree list` 中 `meetwise-rh` 恰 1 树=本席工作树（建前双查不存在）。
- `ls ai-docs/delivery/harness/ | grep repo-hygiene` 建前零命中→落卷后唯一同名卷=本卷；LEDGER/checklist `repo-hygiene` 词面零命中（`grep -c` 双 0 亲证）=无在册同名行可撞。
- 本刀三触面（`.gitignore`+两产物路径）`git worktree list` 全树扫（13 树逐树 `git status --porcelain` 对三路径）：零第二在飞树锚定（本席树因基线 typecheck 副产翻动 1 处=§0.2-3 活证·他树全 0）。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算 @`2c257eb0`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/web/test-results/.last-run.json` | `cbcc1fba`（3 行） | **untrack 件①**·Playwright outputDir 簿记（内容 `{"status":"passed","failedTests":[]}`）·`apps/web/playwright.config.ts`（`321b80e0`）无 `outputDir` 配置→默认 `./test-results`=每次 e2e 运行重写·自 initial commit `9c92826e` 被跟踪（`git log --diff-filter=A` 亲证） |
| `apps/web/tsconfig.tsbuildinfo` | `5bf041bc`（单行 ~250KB JSON） | **untrack 件②**·`tsc --noEmit` 增量索引副产——`apps/web/tsconfig.json`（`d34eab1e`）`:7` `"incremental": true` 为全仓唯一 incremental 开关（`grep -rn incremental apps/*/tsconfig.json packages/*/tsconfig.json` 亲证仅此一处）→副产仅此一件·自 `9c92826e` 被跟踪 |
| `.gitignore` | `b84e2b41`（32 行） | **修法件②落点**·现有条目（node_modules/dist/.next/.turbo/coverage/.env 族/.tmp/docker/data/.smoke/.playwright-mcp/.agents/__pycache__ 等）**零 `test-results` 零 `tsbuildinfo` 词面**（亲读+grep 双证） |
| `Dockerfile` | `34f84823`（39 行） | **裁量件③=零字节目标**·`:16` `RUN pnpm install --frozen-lockfile --prod=false`（deps 阶段）·`:28-30` `COPY --from=deps` node_modules/apps/packages·`:31` `COPY . .`（整仓 COPY 面）·`:38-39` CMD `node --import @swc-node/register/esm-register src/main.ts`（**运行时消费 @swc-node/register 正身**） |
| `apps/web/Dockerfile` | `d04dfcb5`（39 行） | 旁证分判：`:12` 同 `--prod=false` 但系 **build 阶段**消费（`next build` 需 devDeps）·run 层只带 standalone 产物=devDeps 不进运行层——与 root 镜像运行时消费形**不同质**（§1.2-3） |
| `docker/compose.prod.yml` | `73462150`（385 行） | 运行时消费链旁证：`:229` migrate+cost-configure（`tsx`/`@swc-node/register`）·`:238`/`:273` api/worker CMD 同形 `node --import @swc-node/register/esm-register` |
| `apps/api/package.json` | `266e64b8`（119 行） | **devDependencies 块**：`@swc-node/register ^1.11.1`+`@swc/core ^1.15.43`+`typescript catalog:`——dependencies 块零此三件（亲读） |
| `apps/worker/package.json` | `f6b6df38`（182 行） | 同上：devDeps 含 `@swc-node/register`+`@swc/core`+`tsx`+`typescript`·dependencies 零（亲读）·`tsx` 仅测试脚本消费非 CMD 面 |
| `pnpm-lock.yaml` | `af9c3f38`（9353 行） | importers 决议亲读：apps/api 与 apps/worker 两块 `@swc-node/register: 1.11.1(@swc/core@1.15.43)(@swc/types@0.1.27)(typescript@6.0.3)` 均列 **devDependencies** 段 |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4`（201 行） | `:197` 恰符臂过滤器 `!f.endsWith('tsconfig.tsbuildinfo')`+`:198` 断言词「tsbuildinfo 构建副产物不计」——**协议形容忍臂在位**（untrack 后语义不变·零触） |
| `.dockerignore` | `e2aac246`（17 行） | `#168`（`**/test`·AUTHZ-HARDEN 5A-2 注记在位）+`#169`（`apps/worker/evidence`·CI-WIRING 注记在位）两排除已落=「排除半已随他刀落」正身·**零 test-results/tsbuildinfo 条目**（残面如实·§1.3-6 归后继） |
| `packages/db/migrations/0151_pgp_sym_encrypt_grant.sql` | （行锚 `:31`） | `GRANT EXECUTE ON FUNCTION public.pgp_sym_encrypt(text,text) TO memory_runtime`——#143 注记面锚（零触） |
| `packages/db/src/principal.ts` | （行锚 `:776-778`/`:824-833`/`:835-837`） | #249 顺核锚：`:777-778` NODE_ENV=production→`production_local_database_host` 拒启·`:824-833` `isLocalDatabaseHost` 词表（localhost/postgres/::1/127.x/169.254/fe8..）·`:835-837` SSL 缺省 verify-full（零触） |

### 0.2 漂移登记与亲证面（派单 brief → `2c257eb0` 现状）

1. **untrack 清单亲证（派单 a 项定稿）**：`git ls-files | grep -Ei 'test-results|\.last-run|tsbuildinfo'` 恰 2 命中=上表两件——**全仓仅有的构建/测试副产 tracked 件**（`ai-docs/delivery/receipts/**/*.log` 系交付收据受管审计链非副产·docs:check 计数面·不在本刀域 §1.3-5）。
2. **消费面 grep（派单 §2 点名「CI 依赖面」定稿）**：`.github/` 九 workflow `git grep -n "test-results\|tsbuildinfo\|last-run"` **零命中**；全树码面（`*.ts/*.mjs/*.js/*.tsx`）`git grep -ln "last-run\|test-results"` **零命中**——两产物删除后零 CI 消费零码消费；词面命中全在 `.md`/收据 `.json`（史录非消费·清单=ai-docs 卷面+receipts/archive 族）。
3. **tracked 即恒脏活证**：本席基线 `turbo typecheck --force` 亲跑后 `apps/web/tsconfig.tsbuildinfo` 即翻 `M`（增量索引内嵌 clone 路径/文件指纹·换树必变）——每刀卷尾须手工 checkout 回滚的税负在卷有先例（`e2e-runner-stale-build-guard-REQUEST.md:350`「`.last-run.json`（tracked 副产）`git checkout` 回滚（沿 §9-⑤ tsbuildinfo 先例形）」亲读）。
4. **#249 issues-master 原文摘录（仓外 :526·本席亲读）**：「P4·隐私门卡路径/运维部署·生产配置隐性拒绝：NODE_ENV=production 时拒绝 localhost/postgres 等主机名并要求 verify-full+CA；SET LOCAL ROLE app_role 依赖 migrate 供给的成员关系；非标准部署启动即失败（响亮失败，非静默）」+复核注记「NODE_ENV=production 的拒绝是**有意的响亮失败，非缺陷**（P3→P4）」+处置建议「部署文档写明前提；启动错误信息给出修复指引」。代码锚 §0.1 末行全在位亲读=顺核成立。
5. **#143 在卷登记形承引**：`authz-harden-REQUEST.md:35`「`0151:31` `pgp_sym_encrypt(p_body,p_enc_key)`——D6 决策原文『链路生产未启用…P3→P4 备忘，启用前处理』｜**登记不实施**（随本刀挂账·启用前另刀）」+`execution-master-checklist.md:2288/:2357`「#143 P4 随卷挂账零码动（启用前改应用侧加密）」——挂账主权在 AUTHZ-HARDEN 5A 段·本卷零触零宣称（§1.3）。
6. **基线漂移登记（起草落卷前亲证·如实承登）**：`git fetch --all` 部分成功（origin 更新在先·`ccl` 远端不可达报错如实登记）；**起草期间 origin/feat/mysql-schema-skeleton 已被并发席 fetch 行至 `bf453f49`**（本席落卷前复亲证·领先本卷基线 9 commits=AG-16/nightly-recall-fix/cap-sanction-2224 三 nail 并线+文档帽 **2216→2224** 三步进·`git merge-base --is-ancestor 2c257eb0 bf453f49` EXIT=0=本卷基线系新 tip 祖先·下界 `92086586` 祖先性维持）。影响面：①§2-7 docs cap 读数对bf453f49 树更宽（本卷净 0 判定不变·2224 口径余 11）②§0.1 blob 锚表 EXEC 立项照协议对届时 tip 全量重 pin（§8 停止条件①承载）——本卷起草读数一律对基线 `2c257eb0` 口径如实载·不追涨改写。

### 0.3 迁移号登记（预期零）

- 本刀**预期零迁移**（untrack+gitignore+docs·零 SQL 零 DDL 零新表）。**协调规则**：若 EXEC 期复判确需迁移→认领号=EXEC 立项日按届时主线链顶顺延实测·Ban 抢号 Ban 私占（沿 obs-family §0.3 同款）。

## §1 红事实（派单三面承引+源级亲证）

### 1.1 untrack 面（派单 a 项·亲证在卷）

两件构建/测试副产自 initial commit 起被 git 跟踪、`.gitignore` 零对应条目（§0.1/§0.2-1）。伤害三面：①**恒脏噪音**——typecheck/e2e 每跑必翻动 tracked 树（§0.2-3 活证）·真 diff 被淹没·i6 门 `:197` 被迫设「tsbuildinfo 不计」容忍臂=协议形补丁；②**刀尾回滚税**——每涉 e2e/typecheck 的刀卷尾须手工 `git checkout` 回滚两件（stale-build-guard `:350` 先例形）·漏做即污染下刀 diff 面；③**镜像/上下文夹带**——root Dockerfile `:31` `COPY . .` 将两件运行时零消费件带进构建上下文与镜像层。

### 1.2 Dockerfile `--prod=false` 面（派单 b 项·完备性亲证=不完备）

1. **运行时消费链亲证**：root 镜像 CMD（Dockerfile `:38-39`）与 compose.prod.yml 三处命令（`:229`/`:238`/`:273`）均以 `node --import @swc-node/register/esm-register` 直跑 TS 源码——`@swc-node/register` 为**运行时硬依赖**。
2. **依赖归类亲证**：`@swc-node/register`+`@swc/core`+`typescript` 三件在 apps/api 与 apps/worker 均列 **devDependencies**（两 package.json devDeps 块+lockfile importers 双证）。
3. **判定**：`:16` 改 `--prod` 将摘除三件→运行时 `--import` 模块解析失败=**容器拒启**。**prod 运行时依赖完备性=不完备（亲证）**→按派单「若不完备则登记不改」→**Dockerfile 零字节·裁量=维持 `--prod=false`**。解法前提（依赖归位 dependencies / 构建期预编译 TS 消 register）=镜像架构裁量·归后继供应链刀（§1.3-1/2）。
4. **web 镜像分判（防误伤）**：apps/web/Dockerfile `:12` 同款 `--prod=false` 系 build 阶段 `next build` 消费·run 层 standalone 已隔离 devDeps——无完备性问题·亦无本刀面（§1.3-7）。

### 1.3 #249/#143 注记面（派单 c 项·不改码·登记即义务）

1. **#249（P4·顺核成立）**：生产配置对 localhost/postgres 等本地主机名的拒绝系**有意的响亮失败**（issues-master 复核注记原文·代码锚 `principal.ts:777-778` 拒启+`:824-833` 词表+`:835-837` verify-full 缺省+`checkpoint-principal.ts:141` SET ROLE 链全在位亲读）——本卷零码动；处置建议（部署文档写明前提+启动错误信息给修复指引）登记归后继运维/文档刀·裁决权归协调方。
2. **#143（P4 备忘态·承登）**：`0151:31` `pgp_sym_encrypt(text,text)` 对称密钥经 SQL 参数面——AUTHZ-HARDEN 卷「登记不实施（启用前另刀）」+checklist STILL OPEN 行挂账在卷；本卷零触零宣称·仅注记面承登记（挂账主权仍在 AUTHZ-HARDEN 5A 段/协调方）。

### 1.4 基线读数（起草席本树亲跑 @`2c257eb0`·2026-10-17·全绿在卷）

`TURBO_DAEMON=false pnpm turbo typecheck --force` **8/8·0 cached EXIT=0**（25.09s）·root `pnpm lint` **5235 warnings 恰等·0 errors EXIT=0**·`node scripts/ai-docs/check-docs.mjs` **2213 ≤ cap 2216 EXIT=0**（「2213 managed worktree files」原文在卷）·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改。即：**既有门全绿=本刀为仓库卫生登记收口刀非复绿刀**。

## §1-修法（两件落码+一件裁量+本卷 docs·零迁移·零码面）

- **件① untrack 两件（索引摘除·工作树保留）**：`git rm --cached apps/web/test-results/.last-run.json apps/web/tsconfig.tsbuildinfo`——`--cached` 语义=仅摘索引：本席树与一切既有 clone 工作树文件零翻动·全新 checkout 不再落两件·git 停止跟踪后续变化。
- **件② `.gitignore` 补全（恰 2 条目）**：文件尾追加注记块+`test-results/`（目录级·覆盖 apps/web 现位与任何未来同名列）+`*.tsbuildinfo`（通配·覆盖增量索引副产族）——两件自此进 ignore 语义·`git status` 恒脏噪音源除名。
- **件③ Dockerfile 裁量=零字节**：§1.2 完备性亲证=不完备→派单「登记不改」条款行使·`:16` `--prod=false` 维持·残面（devDeps 进镜像+整仓 COPY 瘦身）整体归后继供应链/镜像刀（登记面=§1.2-3/§1.3-6）。
- **件④ 本卷 REQUEST**（docs 面·恰 1 新增 .md）。
- **效果账**：①`git status` 两噪音源除名·i6 门 `:197` 容忍臂成冗余但语义不变（留置零触）②刀尾手工回滚税自然消亡 ③CI 全新 checkout 上下文自然少两件零消费件（§2-2 亲证承载）④零迁移零码面零 lockfile 零依赖变更。

## §1.3 否决（替代路径·全数否决·越界行使即停止条件）

1. **否决「Dockerfile `:16` 改 `--prod`」**：§1.2 亲证运行时三件全在 devDeps=摘除即容器拒启——修法前提未满足前行使=打断生产镜像；归后继供应链刀与依赖归位/预编译同刀裁决。
2. **否决「本刀顺带把 `@swc-node/register`/`@swc/core`（/`typescript`）移 dependencies」**：触 package.json×2+lockfile 决议=供应链域越面（镜像体积/安全审计面联动）·且与①互为绑定·拆开行使=半修；非仓库卫生小刀量级。
3. **否决「物理删除两文件（`git rm` 无 `--cached`）」**：索引摘除已达全部目的；物理删除令本席树与既有 clone 翻动·两件均可再生簿记·删除零增益。
4. **否决「`apps/web/tsconfig.json` 改 `incremental:false` 消源」**：为灭一产物改编译行为=倒挂（增量缓存收益丧失·8 包 typecheck 门时长上升）·产物问题以 ignore 解·tsconfig 零字节。
5. **否决「`ai-docs/delivery/receipts/**/*.log` 等审计链一并 untrack」**：收据 logs 系交付收据受管件（docs:check 计数面·审计链本体）非构建副产——误伤=审计链断裂·Ban。
6. **否决「`.dockerignore` 顺带补 `test-results/`/`*.tsbuildinfo` 两行」**：镜像运行时零消费（§1.2）·CI 全新 checkout 后上下文本就无两件——保持 diff 恰 4 tracked 最小面·整仓 COPY 瘦身整体归后继供应链刀（#101 残面登记不洗）。
7. **否决「web Dockerfile `:12` `--prod=false` 同步裁」**：web 系 build 阶段消费（§1.2-4 分判）·无不完备问题·零本刀面。
8. **否决「untrack 扩面其他 generated 类 tracked 件（如 `apps/web/next-env.d.ts`）」**：`next-env.d.ts` 系 Next 框架约定 tracked 件（`git ls-files` 亲证在跟踪）·派单面零点名——扩面=越面发明·本刀只收派单点名两件。

## §2 验收断言候选（EXEC 门矩阵·pre-exec 双审核对单基面·全过为绿）

1. **CI 面不受损核**：`git grep -n "test-results\|tsbuildinfo\|last-run" -- .github/` **零命中**（起草席亲证 EXIT=1）——九 workflow 零消费；`ci.yml:153-154` 两 `docker build` 的 `COPY . .` 内容面仅少两件零消费件=CI 结构面不受损。
2. **CI checkout 影响核（派单点名臂）**：全树码面 `git grep -ln "last-run\|test-results" -- '*.ts' '*.mjs' '*.js' '*.tsx'` **零命中**（亲证 EXIT=1）——**产物文件删除后 CI/码面依赖断裂=零**；`.md`/收据词面命中=史录非消费（§0.2-2 清单）。
3. **i6 门容忍核**：`scripts/i6-239-gates.proof.mjs`（blob `339f92f4`）`:197-198` 容忍臂**零字节零触**——untrack 后其过滤集只减不增·语义不变。
4. **untrack 机制核**：改后 `git ls-files | grep -E "test-results|tsbuildinfo"` **零命中**；`git check-ignore -v` 对两路径**双命中**件②新条目；两文件**在盘**（`ls` 亲证=`--cached` 语义兑现）。
5. **typecheck 门**：`TURBO_DAEMON=false pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径·基线亲跑绿在卷）。
6. **lint 门**：root `pnpm lint` **5235 恰等** EXIT=0（基线亲跑绿·零新增 warning 为预期·漂移即停如实登记·**Ban 借机修 lint**）。
7. **docs:check 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（基线 **2213**·本卷**净 0**=新 .md +1 与 `.last-run.json` 摘除受管集 −1 相抵——`.json` 系受管扩展+`apps/` 系 MANAGED_ROOT·`*.tsbuildinfo` 非文本扩展本就不在受管集·起草席落卷亲跑复测 **2213 ≤ cap 2216 余 3** 与基线同值·>2216 红即停上报·cap sanction 权归协调方）。
8. **markers 门**：改动集（本卷 .md+`.gitignore`+两删除路径在盘文件）五类标记词+行首冲突标记**零命中**（起草席落卷亲跑直证·词表沿 `i6-239-gates.proof.mjs` 运行时组装口径·不入卷防自指）。
9. **diff 面（改动面窄断言）**：EXEC diff（对立项基线）=恰 **4 tracked 路径**——本卷 REQUEST（A）+`.gitignore`（M）+两产物（D·`--cached` 删除）；Dockerfile/apps/web/Dockerfile/package.json×2/pnpm-lock.yaml/apps/web/tsconfig.json/i6 脚本/.dockerignore/compose 族**零字节入 diff**（`git diff --name-only` 词面机检·typecheck 副产 tsbuildinfo 自件②后不入 status=回滚税消亡的机制兑现）。
10. **零迁移门**：改动集零 SQL 零新表（§0.3 预期零实证）。
11. **est live=0**：零模型外呼零 Key 加密零容器零生产操作（§6）。

## §3 范围外（边界清单·越界即 FAIL）

1. **零码面**：Dockerfile/apps/web/Dockerfile/docker/compose*.yml/apps+packages 全部 package.json/pnpm-lock.yaml/apps/web/tsconfig.json/scripts/**/.dockerignore 零字节（件③裁量=零字节目标·§1.3 全数否决行使面）。
2. **#249/#143 零码**：注记登记面（§1.3）·principal.ts/checkpoint-principal.ts/migrate-cli.ts/0151 迁移零触零宣称。
3. **共享 SSOT 零改**：LEDGER/checklist/5e-cleanup-sweep-2 卷/issues-master 只读引用——#101 部分 行翻面/立行权归协调方·本刀不宣称行关闭不自建立行。
4. **零迁移零依赖变更**（§0.3·lockfile 零改）。
5. **兄弟树零触**（§0.0 三对表·13 树零交集亲证）。
6. est live=0（起草 turn·§6）。

## §4 依赖

**①上游已满足**：`5e-cleanup-sweep-2` 卷归槽呈报（`:39/:67`·本卷即承接席）+`#168`/`#169` .dockerignore 半面已落（`e2aac246` 注记在位）+i6 门容忍臂先例形（`339f92f4`）。**②无同文件并发**：§0.0 三对表亲证。**③迁移号**：§0.3（预期零）。**④下游**：#101 部分 残面（镜像 devDeps+整仓 COPY+.dockerignore 补行）归后继供应链/镜像刀·批5 盘点行/issues-master 登记权归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（⛔push·git 写只本 worktree commit）·Ban merge 主线（⛔merge主线）·Ban 自批（pre-exec 双审须独立外席·alone≠dual 不代签）·Ban 触 Dockerfile 两件/compose/lockfile/package.json/tsconfig.json/i6 脚本/.dockerignore（§3-1·§1.3-1/2/4/6/7 否决行使面）·Ban 物理删除两产物（§1.3-3）·Ban untrack 扩面（§1.3-5/8）·Ban 触 #249/#143 码面（§3-2）·Ban 触共享 SSOT 与立行（§3-3）·Ban 抢迁移号 Ban 私占（§0.3）·Ban 借机修 lint/cap/协议形红（§2-6/§2-7）·Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）·Ban 触其他工作树。

**pins（本卷钉值·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼零消耗）——**刀专项**：untrack 恰 **2** 件（`.last-run.json`+`tsconfig.tsbuildinfo`·`--cached` 形）·`.gitignore` 新条目恰 **2**（`test-results/`+`*.tsbuildinfo`）·Dockerfile=root 零字节+web 零字节·diff 面=**4 tracked 路径**·CI/码面消费=**0**（§2-1/2 双零命中）·typecheck=**8/8 0 cached**·lint=**5235 恰等**·docs 基线 **2213**/cap **2216**·迁移=**0**·est live=0（起草 turn）。

## §6 est live=0（起草 turn）+ EXEC 门预申明

- **起草 turn（本 commit）**：est live=**0**——零模型外呼零 Key 加载零生产操作零消耗（基线门=纯本地 pnpm/turbo/node·零容器）。
- **EXEC 期门预申明（授权后方可行）**：①件①②落位（契约条款逐条对照·Ban 就地改契约·件③零字节兑现）；②§2 十一门全跑全落收据（EXIT 逐门入卷）；③`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改；④收据落点 `ai-docs/delivery/receipts/repo-hygiene/`（余量 3 内 EXEC 自裁最小集·越即停上报）+harness 本卷推进注记（append-only）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+`.gitignore`+两删除路径）**五类标记词 grep 零命中**（起草席落卷时对本卷亲跑直证·回执随 EXEC 收据留痕·五类词面见 `i6-239-gates.proof.mjs` 运行时组装·不入卷防自指）。**承登（基线红如实）**：`i6-gates:prove` 恰符臂以 i6-239 历史刀申报清单为期望集·任何后继刀必红该臂=**协议形承登**（沿 obs-family §7/boot-validate §7 先例）；本刀实质臂=改动集五类词面零命中+`est live=0`+CI/码面双零消费（§2-1/2）+零迁移+SSOT 零触·全绿为门。

## §8 STOP · `draft:awaiting_pre_exec_dual`（起草落卷即停·三处同值：标题行+Status 行+本节·卷尾复述同值·pre-exec 双审两外席待派·alone≠dual·Dual PASS ≠ EXEC·PASS 只过审·开工须协调方明示授权）

**开工三条款**：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §8 裁决行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号）。**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（两产物跟踪状态被他刀改/.gitignore 被他刀改/Dockerfile 消费链被改/i6 容忍臂被改）→停·重 pin 回炉；**机制不满足**=件①②落位后 §2-4/9 命中红（ls-files 残留/check-ignore 不中/diff 面溢出）→停·如实升级协调方（Ban 就地改因 Ban 扩面修）；**越界需要**=任何码面/依赖/迁移/SSOT 改动诉求（含 --prod 改造诉求）→停·另刀或 §8 裁决行使（Ban 就地修）；**验收红不可修**=门矩阵静态红（lint 漂移/docs>2216）且根因不在本刀交付面→停·如实登记（Ban 借机修）。

**待双审/EXEC 裁决项**：
- **①gitignore 条目形追认（件②）**：`test-results/` 目录级通配 vs `apps/web/test-results/` 路径限定——推荐=目录级（防未来同名列·Playwright 默认 outputDir 语义随配置走）。
- **②tsbuildinfo 条目形追认（件②）**：`*.tsbuildinfo` 通配 vs `tsconfig.tsbuildinfo` 单名——推荐=通配（增量索引副产族全覆盖·含未来 split tsbuildinfo）。
- **③Dockerfile 裁量行使追认（件③）**：登记不改=派单「若不完备则登记不改」条款行使（§1.2 亲证完备性=不完备）——推荐=追认零字节；后继供应链刀接手形（依赖归位 or 预编译）裁决归协调方。
- **④#249/#143 注记登记归宿**：本卷 §1.3 注记面（零码）vs 协调方另立 issues-master 行同步——推荐=本卷注记面+协调方择机入册（本卷不代行立行权）。
- **⑤行关闭效力**：EXEC 命中门矩阵全绿+post 双审 BOTH PASS→批5 盘点 #101 部分 **untrack 半面**（两产物跟踪+.gitignore 缺口）的关闭/翻面登记权归协调方 nail（**镜像 devDeps+整仓 COPY 残面不随翻**·归后继供应链刀·本刀不宣称关闭）。

---

*REPO-HYGIENE REQUEST · 2026-10-17 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（三处同值=标题+Status+§8·卷尾复述·pre-exec 双审两外席待派·alone≠dual·⛔push·⛔merge主线） · 起草 base=`feat/mysql-schema-skeleton` @`2c257eb0`（建树时 origin/feat/mysql-schema-skeleton tip·下界「≥`92086586`」`git merge-base --is-ancestor` EXIT=0 亲证·fetch --all 部分成功 ccl 远端不可达如实登记·**落卷前 origin 已被并发席行至 `bf453f49`=本卷基线祖先·漂移登记 §0.2-6**）· 分支 `line/repo-hygiene` · 工作树 `meetwise-rh`（本起草席 `git worktree add` 亲立·建前 branch/worktree/同名卷三查不存在）· 立项出处=协调方派单 brief（批5 盘点 Top9+#101 部分·零前置）+`5e-cleanup-sweep-2-REQUEST.md:39/:67` 归槽呈报承接+issues-master #249 仓外行亲读+authz-harden 卷 #143 挂账承引 · 修法=件① `git rm --cached` 两产物（`cbcc1fba`+`5bf041bc`·工作树保留）+件② `.gitignore` 补 `test-results/`+`*.tsbuildinfo` 恰 2 条目+件③ Dockerfile 裁量零字节（`--prod=false` 维持·`@swc-node/register`/`@swc/core`/`typescript` 三件 devDeps=运行时 `--import` 硬依赖亲证→**prod 依赖完备性=不完备→登记不改**）+件④本卷 · #249（响亮失败有意设计·顺核锚全在位）/（#143 P4 备忘挂账承登）两注记面零码 · CI/码面消费双零命中亲证（`.github/` 零引用+`*.ts/*.mjs/*.js/*.tsx` 零引用）·i6 门 `:197` 容忍臂零触 · 零迁移零 lockfile 零依赖 · 触面=恰 4 tracked 路径 · 起草基线门亲跑全绿（typecheck 8/8 0 cached+lint 5235 恰等+docs:check 2213≤2216+install --frozen-lockfile）· est live=0 · actualSpendCny=null · markers=0（恰符臂协议形承登）· 停止条件四类全设未触发 · Ban self-approve · alone≠dual · Dual PASS ≠ EXEC · ⛔push · ⛔merge主线 · STOP*
