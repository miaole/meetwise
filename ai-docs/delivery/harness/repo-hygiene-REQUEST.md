# REPO-HYGIENE 仓库卫生小刀（批5 盘点 Top9·#101 部分 untrack 面 + Dockerfile --prod=false 裁量 + #249/#143 注记登记 · 起草 REQUEST · EXEC 落卷 · **STOP=`executed:awaiting_post_prove_dual`**[EXEC 席翻面 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录]）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席落卷 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录 · post-prove 双审两独立外席待派 · Ban self-approve · alone≠dual · Dual PASS ≠ EXEC · ⛔push · ⛔merge主线）
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
| `apps/web/Dockerfile` | `d04dfcb5`（39 行） | 旁证分判：`:14`（rev 勘正 `:12`→`:14`·§9-rev.5）同 `--prod=false` 但系 **build 阶段**消费（`next build` 需 devDeps）·run 层只带 standalone 产物=devDeps 不进运行层——与 root 镜像运行时消费形**不同质**（§1.2-3） |
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

两件构建/测试副产自 initial commit 起被 git 跟踪、`.gitignore` 零对应条目（§0.1/§0.2-1）。伤害三面：①**恒脏噪音**——typecheck/e2e 每跑必翻动 tracked 树（§0.2-3 活证）·真 diff 被淹没·i6 门 `:197` 被迫设「tsbuildinfo 不计」容忍臂=协议形补丁；②**刀尾回滚税**——每涉 e2e/typecheck 的刀卷尾须手工 `git checkout` 回滚两件（stale-build-guard `:350` 先例形）·漏做即污染下刀 diff 面；③**镜像/上下文夹带**（**R3 措辞限定（§9-rev.3）·本面消亡仅 CI 面成立**）——root Dockerfile `:31` `COPY . .` 将两件运行时零消费件带进构建上下文与镜像层；本刀落位后 CI 全新 checkout 上下文自然少两件（checkout 不再落两件），**本地 docker build 面 `COPY . .` 仍夹带在盘两件**（untrack/ignore 不减在盘文件·docker 构建上下文不读 `.gitignore`·`.dockerignore` 未补=§1.3-6 否决维持）——本地镜像面归后继供应链刀整仓 COPY 瘦身收口。

### 1.2 Dockerfile `--prod=false` 面（派单 b 项·完备性亲证=不完备）

1. **运行时消费链亲证**：root 镜像 CMD（Dockerfile `:38-39`）与 compose.prod.yml 三处命令（`:229`/`:238`/`:273`）均以 `node --import @swc-node/register/esm-register` 直跑 TS 源码——`@swc-node/register` 为**运行时硬依赖**。
2. **依赖归类亲证**：`@swc-node/register`+`@swc/core`+`typescript` 三件在 apps/api 与 apps/worker 均列 **devDependencies**（两 package.json devDeps 块+lockfile importers 双证）。
3. **判定**：`:16` 改 `--prod` 将摘除三件→运行时 `--import` 模块解析失败=**容器拒启**。**prod 运行时依赖完备性=不完备（亲证）**→按派单「若不完备则登记不改」→**Dockerfile 零字节·裁量=维持 `--prod=false`**。解法前提（依赖归位 dependencies / 构建期预编译 TS 消 register）=镜像架构裁量·归后继供应链刀（§1.3-1/2）。
4. **web 镜像分判（防误伤）**：apps/web/Dockerfile `:14`（rev 勘正 `:12`→`:14`·§9-rev.5）同款 `--prod=false` 系 build 阶段 `next build` 消费·run 层 standalone 已隔离 devDeps——无完备性问题·亦无本刀面（§1.3-7）。

### 1.3 #249/#143 注记面（派单 c 项·不改码·登记即义务）

1. **#249（P4·顺核成立）**：生产配置对 localhost/postgres 等本地主机名的拒绝系**有意的响亮失败**（issues-master 复核注记原文·代码锚 `principal.ts:777-778` 拒启+`:824-833` 词表+`:835-837` verify-full 缺省+`checkpoint-principal.ts:141` SET ROLE 链全在位亲读）——本卷零码动；处置建议（部署文档写明前提+启动错误信息给修复指引）登记归后继运维/文档刀·裁决权归协调方。
2. **#143（P4 备忘态·承登）**：`0151:31` `pgp_sym_encrypt(text,text)` 对称密钥经 SQL 参数面——AUTHZ-HARDEN 卷「登记不实施（启用前另刀）」+checklist STILL OPEN 行挂账在卷；本卷零触零宣称·仅注记面承登记（挂账主权仍在 AUTHZ-HARDEN 5A 段/协调方）。

### 1.4 基线读数（起草席本树亲跑 @`2c257eb0`·2026-10-17·全绿在卷）

`TURBO_DAEMON=false pnpm turbo typecheck --force` **8/8·0 cached EXIT=0**（25.09s）·root `pnpm lint` **5235 warnings 恰等·0 errors EXIT=0**·`node scripts/ai-docs/check-docs.mjs` **2213 ≤ cap 2216 EXIT=0**（「2213 managed worktree files」原文在卷）·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改。即：**既有门全绿=本刀为仓库卫生登记收口刀非复绿刀**。

## §1-修法（两件落码+一件裁量+本卷 docs·零迁移·零码面）

- **件① untrack 两件（索引摘除·工作树保留=仅及执行该命令之树）**：`git rm --cached apps/web/test-results/.last-run.json apps/web/tsconfig.tsbuildinfo`——`--cached` 语义=仅摘索引·**工作树保留效力仅及执行该命令之树（本席树零翻动成立）**；他既有 clone 并线本 commit 时按其两文件状态分判——**件净**（对 HEAD 干净）→随 merge 物理删除（输出 `delete mode`·两件可再生簿记删除无害·件② ignore 后 checkout 不再落回）；**件脏**（本地产物被本地 run 翻动）→**merge 中止一次**（`local changes would be overwritten`）·须末次 `git checkout -- apps/web/test-results/.last-run.json apps/web/tsconfig.tsbuildinfo` 后重并（在飞知会=§8 在飞知会条目）——全新 checkout 不再落两件·git 停止跟踪后续变化（**rev 修正**：原「本席树与一切既有 clone 工作树文件零翻动」句经席2 沙盒实证推翻·如实改口径·操作形零变·定谳=§9-rev.1）。
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
7. **否决「web Dockerfile `:14`（rev 勘正 `:12`→`:14`·§9-rev.5）`--prod=false` 同步裁」**：web 系 build 阶段消费（§1.2-4 分判）·无不完备问题·零本刀面。
8. **否决「untrack 扩面其他 generated 类 tracked 件（如 `apps/web/next-env.d.ts`）」**：`next-env.d.ts` 系 Next 框架约定 tracked 件（`git ls-files` 亲证在跟踪）·派单面零点名——扩面=越面发明·本刀只收派单点名两件。

## §2 验收断言候选（EXEC 门矩阵·pre-exec 双审核对单基面·全过为绿）

1. **CI 面不受损核**：`git grep -n "test-results\|tsbuildinfo\|last-run" -- .github/` **零命中**（起草席亲证 EXIT=1）——九 workflow 零消费；`ci.yml:153-154` 两 `docker build` 的 `COPY . .` 内容面仅少两件零消费件=CI 结构面不受损。
2. **CI checkout 影响核（派单点名臂）**：全树码面 `git grep -ln "last-run\|test-results" -- '*.ts' '*.mjs' '*.js' '*.tsx'` **零命中**（亲证 EXIT=1）——**产物文件删除后 CI/码面依赖断裂=零**；`.md`/收据词面命中=史录非消费（§0.2-2 清单）。
3. **i6 门容忍核**：`scripts/i6-239-gates.proof.mjs`（blob `339f92f4`）`:197-198` 容忍臂**零字节零触**——untrack 后其过滤集只减不增·语义不变。
4. **untrack 机制核**：改后 `git ls-files | grep -E "test-results|tsbuildinfo"` **零命中**；`git check-ignore -v` 对两路径**双命中**件②新条目；两文件**在盘**（`ls` 亲证=`--cached` 语义兑现）。
5. **typecheck 门**：`TURBO_DAEMON=false pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径·基线亲跑绿在卷）。
6. **lint 门**：root `pnpm lint` **5235 恰等** EXIT=0（基线亲跑绿·零新增 warning 为预期·漂移即停如实登记·**Ban 借机修 lint**）。
7. **docs:check 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（基线 **2213**·本卷**净 0**=新 .md +1 与 `.last-run.json` 摘除受管集 −1 相抵——`.json` 系受管扩展+`apps/` 系 MANAGED_ROOT·`*.tsbuildinfo` 非文本扩展本就不在受管集·起草席落卷亲跑复测 **2213 ≤ cap 2216 余 3** 与基线同值·>2216 红即停上报·cap sanction 权归协调方**；**rev 届 tip 重钉（P2-3·§9-rev.5）**：cap 已上游 sanction 步进 2216→2224→**2232**（届 tip policy blob `05f48933:110` `const MAX_FILES = 2_232;` 亲读·本树 policy `4509bf68:106` 尚 2_216 值旧）——EXEC 判据改读「届实跑≤届 cap **2232**」·原「>2216」读数作废·届时 sanction 再步进如实承认·超红停上报权归协调方）。
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

## §8 STOP · `executed:awaiting_post_prove_dual`（EXEC 席翻面 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录·三处同值：标题行+Status 行+本节·卷尾复述同值·post-prove 双审两独立外席待派·alone≠dual·Dual PASS ≠ EXEC·PASS 只过审·开工须协调方明示授权）

**开工三条款**：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §8 裁决行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号）。**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（两产物跟踪状态被他刀改/.gitignore 被他刀改/Dockerfile 消费链被改/i6 容忍臂被改）→停·重 pin 回炉；**机制不满足**=件①②落位后 §2-4/9 命中红（ls-files 残留/check-ignore 不中/diff 面溢出）→停·如实升级协调方（Ban 就地改因 Ban 扩面修）；**越界需要**=任何码面/依赖/迁移/SSOT 改动诉求（含 --prod 改造诉求）→停·另刀或 §8 裁决行使（Ban 就地修）；**验收红不可修**=门矩阵静态红（lint 漂移/docs>2216）且根因不在本刀交付面→停·如实登记（Ban 借机修）。

**待双审/EXEC 裁决项**：
- **①gitignore 条目形追认（件②）**：`test-results/` 目录级通配 vs `apps/web/test-results/` 路径限定——推荐=目录级（防未来同名列·Playwright 默认 outputDir 语义随配置走）。
- **②tsbuildinfo 条目形追认（件②）**：`*.tsbuildinfo` 通配 vs `tsconfig.tsbuildinfo` 单名——推荐=通配（增量索引副产族全覆盖·含未来 split tsbuildinfo）。
- **③Dockerfile 裁量行使追认（件③）**：登记不改=派单「若不完备则登记不改」条款行使（§1.2 亲证完备性=不完备）——推荐=追认零字节；后继供应链刀接手形（依赖归位 or 预编译）裁决归协调方。
- **④#249/#143 注记登记归宿**：本卷 §1.3 注记面（零码）vs 协调方另立 issues-master 行同步——推荐=本卷注记面+协调方择机入册（本卷不代行立行权）。
- **⑤行关闭效力**：EXEC 命中门矩阵全绿+post 双审 BOTH PASS→批5 盘点 #101 部分 **untrack 半面**（两产物跟踪+.gitignore 缺口）的关闭/翻面登记权归协调方 nail（**镜像 devDeps+整仓 COPY 残面不随翻**·归后继供应链刀·本刀不宣称关闭）。

**在飞知会条目（rev 增补·R2/P2-4·知会即生效非裁决项·详 §9-rev.2）**：各在飞席/协调方 nail 波将本 commit 并线进己树时，若 merge 中止报 `local changes would be overwritten`（涉及 `apps/web/test-results/.last-run.json`/`apps/web/tsconfig.tsbuildinfo` 两产物）——系件① untrack 对**脏副本**的预期拦截·**非事故**：`git checkout -- apps/web/test-results/.last-run.json apps/web/tsconfig.tsbuildinfo` 丢弃本地脏副本（可再生簿记·零价值零抢救面）后重并即过·件② ignore 生效后**此后永免**。**nail 注记（P2-4）**：协调方 nail 波遇本支并线中止同款 discard 处置·脏副本一概可弃（rev 席 /tmp clone 双形复演亲证：件净→`delete mode` 物理删除·件脏→中止一次·discard 后重并成功）。**EXEC 生效注记（2026-10-17·EXEC 席落卷起本条目生效）**：件① 已落卷（起草 `c3b9c2d2`）并随 EXEC 并线 `f1abd8ce` 入届树——各在飞席/协调方 nail 波并线本支（`f1abd8ce` 及其并线产物后继）遇两产物 `local changes would be overwritten` 一概 `git checkout -- apps/web/test-results/.last-run.json apps/web/tsconfig.tsbuildinfo` 即过·脏副本可弃（可再生簿记零抢救面）·件② ignore 生效后此后永免。**时效注记（席2 P2-a·nail 波落卷 2026-10-17）**：本条目的拦截窗=并线 nail 前支线 commit（`34b1e366`/`f1abd8ce` 及其并线产物后继）的**既存在飞树/clone**——nail 并主线（`feat/mysql-schema-skeleton`，nail merge `f950403a` 双亲 `34b1e366`+`1b013667`）落卷后，**全新 clone 自 checkout 起两产物即不被跟踪且件② ignore 同步在位=`local changes would be overwritten` 报错永不再遇**（席2 P2-a 预言兑现·本注记即时效封条）；条目全文保留作既存在飞树过渡窗处置指引（append 注记形不洗史）。

## §9-rev rev 修订注记（pre-exec 双审席1 PASS+席2 FAIL R1 P1 契约文本失实→rev 回路 · rev 席落卷 2026-10-17 · **append 注记形+六处在位修正（§1-件①/§1.1-③/§0.1/§1.2-4/§1.3-7/§2-7·各带 rev 标）** · 本节为 EXEC 期对前文对应句的权威修正与增补 · 契约文本改动系 §8-③「改则回炉重审」条款行使=rev 落卷后整卷重送双审）

> **席2 FAIL 定谳（rev 席逐位亲证成立+/tmp clone 双形复演）**：R1（P1）——§1-修法件①原句「`--cached` 语义=仅摘索引：**本席树与一切既有 clone 工作树文件零翻动**·全新 checkout 不再落两件」被席2 沙盒实证推翻，rev 席 /tmp 本地 clone 对届 tip `7d71a64f` 并线本 commit（`c3b9c2d2`）复演同判：**件净**（两文件对 HEAD 干净）→merge EXIT=0 输出 `delete mode 100644` 两行·两文件自工作树**物理删除**（可再生簿记·删除无害）；**件脏**（本地翻动 `.last-run.json`）→merge 中止（`error: Your local changes to the following files would be overwritten by merge…Aborting`）·`git checkout -- <两件>` 后重并成功。**落码操作本身无恙**（`git rm --cached` 形正确·索引摘除语义达成·§2-4 断言零变）——**纯契约文本失实**：原句把「执行该命令之树」的工作树保留效力误扩为「一切既有 clone」。席1 同轮 PASS 附 P2 三件（行锚/cap/nail 注记）随本 rev 并流落卷。修订清单六条（R1/R2 P1+R3/R4 P2+席1 P2×3）落点如次。

### §9-rev.1 修订①（R1·P1）——§1-修法件①契约文本改如实口径（在位修正·回炉重审形）

- §1-修法件①「工作树保留」效力限定**仅及执行该命令之树**（本席树零翻动成立）；他 clone 并线效力按其两文件状态分判：件净→随 merge 物理删除（`delete mode`·可再生无害）；件脏→merge 中止一次（`local changes would be overwritten`）须末次 checkout（知会条目=§8 在飞知会条目）——在位修正全文见 §1-修法件①（rev 标）·原「本席树与一切既有 clone 工作树文件零翻动」句**作废**。
- **修法操作形零变更**：`git rm --cached <两路径>` 逐字不变·§2-4/§2-9 断言零变；§1.3-3「Ban 物理删除」语义不变（其否决语境=本席树主动 `git rm`；他 clone 并线的 `delete mode` 系索引语义自然结果·非否决项行使）。
- **回炉形**：本条触 §1-修法定稿契约文本=§8-③「改则回炉重审」条款行使——rev 落卷即整卷重送 pre-exec 双审·此前两席审态不作 EXEC 依据。

### §9-rev.2 修订②（R2·P1 随附）——§8 增补在飞知会条目（merge 中止 discard 处置·此后永免）

§8 裁决项⑤后增补「**在飞知会条目**」（知会即生效·非裁决项）：各在飞席/协调方 nail 波并线本 commit 遇 merge 中止报两产物 `local changes would be overwritten` → `git checkout -- apps/web/test-results/.last-run.json apps/web/tsconfig.tsbuildinfo` 即过·件② ignore 生效后此后永免——条目全文见 §8（rev 增补段）；R2 落点择 §8（派单「§8 或 §2」裁量·知会面贴 STOP 节最贴执行者）。

### §9-rev.3 修订③（R3·P2）——「CI 全新 checkout 不再落两件」与 §1.1-③ 措辞 CI 面限定（本地 docker build 仍夹带）

- §1.1-③「镜像/上下文夹带」在位补限定：本刀落位后该伤害面消亡**仅 CI 面成立**（CI 全新 checkout 不再落两件）；**本地 docker build `COPY . .` 仍夹带在盘两件**（untrack/ignore 不减在盘文件·docker 构建上下文不读 `.gitignore`·`.dockerignore` 未补=§1.3-6 否决维持）——本地镜像面归后继供应链刀整仓 COPY 瘦身收口（§1.3-6/§4-④ 不变）。
- 起草 commit（`c3b9c2d2`）message「CI 全新 checkout 不再落两件」同口径限定：该句**仅 CI 面成立**·已 commit message 不可改（SHA 已入双审引用链）·以本节为权威限定；本 rev commit message 措辞照限定口径书写。
- §1-修法效果账③「CI 全新 checkout 上下文自然少两件零消费件」本就系 CI 面措辞·零改。

### §9-rev.4 修订④（R4·P2）——`.gitignore:28` 孤儿注释登记（登记不触）

`.gitignore:28`「# ECS 预览运行时状态(含真实云端点/实例标识),不进开源仓库;模板见 .example」系孤儿注释——rev 席全文件 38 行亲读：该注记前后无邻接条目、全文件无 ECS/.example 对应条目（`:34-38` 系本刀件② 注记块+两新条目·非其对应物）。**本刀登记不触**（件②「恰 2 条目」纪律·孤儿注释清理归协调方/后继卫生刀裁量·非本刀面·不入 diff）。

### §9-rev.5 修订⑤（席1 P2-1/P2-3/P2-4）——行锚勘正+cap 届 tip 重钉+nail 注记

- **P2-1 行锚 `:12`→`:14`（三处在位修正）**：§0.1 apps/web/Dockerfile 行+§1.2-4+§1.3-7——blob `d04dfcb5` 对基线 `2c257eb0` 与届 tip `7d71a64f` **恒等亲证**=纯行锚勘误非漂移：`:14` `RUN pnpm install --frozen-lockfile --prod=false`（`:15` `COPY . .`·rev 席两树逐行亲读）——起草席 `:12` 系行数误记。
- **P2-3 cap 届 tip 重钉**：cap 已上游 sanction 步进 2216→2224→**2232**（届 tip policy blob **`05f48933:110`** `const MAX_FILES = 2_232;` 亲读·sanction 注记「2224 帽算术漏计 progress-write +1·AG-15（+5）落地 2225>2224 必红·本刀补 +8」（2026-10-17）在卷；本树 policy `4509bf68:106` 尚 2_216 值旧）——席1 钉值（现 tip 树 2224·先并再重钉 2232）如实承登且 **2232 半已由届 tip sanction 落地亲证**；rev 席实测三值：本树 **2213**·届 tip `7d71a64f` 树 **2220**·并线树（`7d71a64f`×`c3b9c2d2` 真合并·/tmp clone 亲跑）**2220**——三值 ≤2232（余 12）亦 ≤2224（余 4）·全绿。§2-7 判据在位改读「届实跑≤届 cap 2232」·EXEC 立项仍照届时 tip 全量重 pin（sanction 再步进如实承认·超红停上报·权归协调方）。
- **P2「届 tip」混标勘正（EXEC 落卷义务·rev 确认席 P2 承接·2026-10-17）**：上句「届 tip policy blob 05f48933」系混标——05f48933 系 bb321093 之物（`bb321093`=`ci(docs): 文档帽 2224→2232 步进`·rev 期届 tip `7d71a64f` 树 policy blob 实为 `dfab50c4` 亲证·彼树尚无 05f48933）；EXEC 期届 tip 全量重 pin 承接=fetch 亲证 origin tip 恰 `23e80b40`（派单下界等号成立）→并线树 policy blob 恰 `05f48933:110` `const MAX_FILES = 2_232;` 恒等·判据「届实跑≤届 cap 2232」承接成立。
- **P2-4 nail 注记**：§8 在飞知会条目内补 nail 面 discard 句——协调方 nail 波遇并线中止同款 `git checkout -- <两件>` 处置·脏副本可弃（可再生·§0.2-3 恒脏机制同一根源）——全文见 §8（rev 增补段）。

### §9-rev.6 门矩阵 rev 后口径（rev 席亲跑）+STOP 状态

- **markers**：rev 改动集（本卷 .md+`.gitignore`+两删除路径在盘文件·沿 §2-8 口径）五类标记词+行首冲突标记直扫 **0 命中**（词族沿 `scripts/i6-239-gates.proof.mjs` `:154` 区运行时组装·词面不誊卷防自指）。
- **docs:check**：EXIT=0 **2213 ≤ 2232**（本 rev append 零新增文件→计数与起草落卷同值亲证·cap 2232=届 tip sanction 值·§9-rev.5）。
- **diff 面**：rev commit=恰 1 tracked（本卷 .md）·零码面零他 tracked；EXEC 判据（§2-9 恰 4 tracked 对立项基线 `2c257eb0`）不变。
- **STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（标题行/Status 行/§8/卷尾注零字洗）——rev 落卷后待**席1+席2 复审修订块**（§9-rev.1-6 落点确认或协调方裁定）→**重派 pre-exec 双审两独立外席**（rev 后重审·alone≠dual·Ban self-approve）·Dual PASS ≠ EXEC（PASS 只过审·开工须协调方明示授权）·⛔push ⛔merge 主线 ⛔改码面（本 rev 恰 1 doc 零码面·est live=0·actualSpendCny=null）。

## §9-EXEC EXEC 记录（EXEC 席落卷 2026-10-17·STOP→`executed:awaiting_post_prove_dual`·重派续作形=前席超时中断·树净零半成品 commit 亲证→全序重跑）

**授权链**：起草落卷 `c3b9c2d2`→rev 落卷 `5e77cfee`（席1 PASS+席2 FAIL R1 P1 契约文本失实→rev 回路·§9-rev.1-6 六处修订+§8 在飞知会条目增补）→pre-exec 双审**重派会签有效**（席1 PASS+席2 FAIL R1 契约已由 rev `5e77cfee` 修订+rev 复核 CONFIRMED·席1+席2 会签有效）→协调方明示授权 EXEC（重派令·前席超时中断续作）→EXEC 本席开工三查亲证：`git status` 净+`git log` 无前席 EXEC 半成品 commit（tip 恰 `5e77cfee` rev）→全序重跑。

**序1 并线**：`git fetch` 亲证 `origin/feat/mysql-schema-skeleton` tip 恰 **`23e80b40`**（派单下界「届 tip≥23e80b40」等号成立亲证=`git merge-base --is-ancestor 23e80b40 origin/...` EXIT=0）→`merge-tree --write-tree` 预演 EXIT=0 零冲突→**merge `f1abd8ce`** `--no-ff` 双亲 `5e77cfee`+`23e80b40` 零冲突兑现（入线 29 commits 对本刀四路径[REQUEST/.gitignore/两产物]零交叠机证·SSOT 无冲突面纯并集·⛔pull --rebase 未用·⛔force push 未用）。

**序2 §0 全量重 pin（并线树 HEAD=`f1abd8ce` 亲算·14 锚）**：两产物上游 blob 恒等（`cbcc1fba`/`5bf041bc` @`23e80b40`=跟踪状态未被并线改）·`.gitignore` 上游 `b84e2b41` 恒等（HEAD `b8b82897`=本卷件② 产物·两新条目 :37/:38+注记 :34-36 亲证）·`Dockerfile` `34f84823` 恒等（:16 `--prod=false`/:31 `COPY . .`/:38-39 CMD swc-node 逐行亲证）·`apps/web/Dockerfile` `d04dfcb5` 恒等（:14/:15）·`pnpm-lock.yaml` `af9c3f38` 恒等·`scripts/i6-239-gates.proof.mjs` `339f92f4` 恒等（:197 恰符臂过滤器+:198 断言词「tsbuildinfo 构建副产物不计」逐字在位=**容忍臂语义不变零触**）·`.dockerignore` `e2aac246` 恒等·`0151:31` GRANT 在位·`principal.ts` blob `23e5b770` 与基线恒等=零漂移（§0.1 行锚 `:777-778` 系起草席行记偏移→更锚 **`:780-781`** `production_local_database_host` 拒启·`:824-833` 词表·`:835-837` verify-full 全在位）——**blob 漂移恰两锚·均系并线携入且结论不变**：`docker/compose.prod.yml` `73462150`→`663720c3`（+28 行=readyz-privacy-wire 携入·新增段在 :289 后·运行时消费行锚 **:229/:238/:273 恒等**重 pin·结论「运行时硬依赖 @swc-node/register」不变）·`apps/worker/package.json` `f6b6df38`→`d83fbde4`（+1 行=scripts 段 `prove:adaptive-legacy-checkpoint`·依赖分判不变=dependencies 块零 swc/tsx/typescript·devDeps 全有[json 分判亲证]）·`apps/api/package.json` `266e64b8` 恒等同判。policy `05f48933:110` MAX_FILES=2_232 恒等（勘正见 §9-rev.5 混标勘正行）。**停止条件①现场漂移=未触发**。

**序3 落码核验（件①②③④ 对并线树逐条兑现）**：件① 两产物 untrack 在位=`git ls-files` 对 `test-results|tsbuildinfo` **零命中**+`git check-ignore -v` **双命中件② 新条目**（`.gitignore:37:test-results/`+`.gitignore:38:*.tsbuildinfo`）+两文件**在盘**（45B/243562B=`--cached` 语义兑现）·件② `.gitignore` 恰 2 条目 :37/:38+三行注记 :34-36（起草卷 `c3b9c2d2` 落定·并线零触恒等承接）·件③ Dockerfile 零字节（root+web 双零触·裁量维持 `--prod=false`）·件④ 本卷 REQUEST（本节+勘正一行+§8 生效注记+STOP 翻面随卷）。**效果账活证**：`turbo typecheck --force` 全量跑后 `git status --porcelain` **0 行**=「tracked 即恒脏噪音+刀尾手工回滚税」消亡机制兑现（§1-修法效果账①②）。

**序4 门矩阵（并线树亲跑·交付 commit 前本席手跑全绿）**：

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| 1 | typecheck | 8/8·0 cached | 8 successful, 8 total·Cached: 0（20.97s） | 0 | 绿 |
| 2 | lint | 0 errors·届树亲数恰等 | root **5235 problems（0 errors, 5235 warnings）**恰等起草基线 pin | 0 | 绿 |
| 3 | docs:check | 届实跑≤届 cap 2232 | **2222 managed worktree files**≤2232 余 10·净 0 口径兑现=对届 tip 树文件集差恰 +1/−1（+本卷 REQUEST/−`.last-run.json`·`git diff --name-status 23e80b40 HEAD` 恰 4 行机证） | 0 | 绿 |
| 4 | markers | 改动集五类词+行首冲突标记零命中 | 改动集四路径（本 REQUEST+`.gitignore`+两在盘产物）词表运行时组装直扫 **0 hits**·全树行首冲突标记严格形 EXIT=1 零命中（词面沿 `i6-239-gates.proof.mjs:154` 区口径·不入卷防自指） | 0 | 绿 |
| 5 | diff 面 | 恰 4 tracked 对届 tip | `git diff --name-status 23e80b40 HEAD` 恰 4=`.gitignore`(M)+本卷 REQUEST(A)+两产物(D)·Ban 面（Dockerfile 两件/compose 族/lockfile/package.json×2/tsconfig.json/i6 脚本/.dockerignore）零字节入 diff 机证 | 0 | 绿 |
| 6 | i6 容忍臂 | :197 语义不变零触 | blob `339f92f4` 恒等+:197 过滤器/:198 断言词逐字亲证=过滤集只减不增语义不变 | 0 | 绿 |
| 7 | CI 面双零 | .github/ 九 workflow+码面零消费 | `git grep -n "test-results\|tsbuildinfo\|last-run" -- .github/` 零命中（九 workflow 恰数亲证）+`*.ts/*.mjs/*.js/*.tsx` 码面零命中（两 grep 均 EXIT=1） | 1 | 绿（1=零命中） |
| 卫生 | frozen-lockfile+est live | lockfile 零改·零外呼 | `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·est live=0（七门全本地静态·零模型外呼零容器零 Key 零 secrets）·actualSpendCny=null·零迁移零 DDL 零 env 闸 | 0 | 绿 |

**序5 P2 落卷义务**：「届 tip」混标勘正一行已落 §9-rev.5（05f48933 系 bb321093 之物·rev 期届 tip `7d71a64f` 树实为 `dfab50c4`·EXEC 期届 tip `23e80b40` 重 pin 恒等承接）。

**偏离清单**：理想零——**零偏离**（§1-修法四件契约逐字兑现·§5 Ban/pins 零翻·§3 边界零越·STOP 翻面仅及本 REQUEST 标题行+Status 行+§8+卷尾四处同值·LEDGER/checklist 翻面权归协调方未触[§3-3 承诺兑现]）。停止条件四类逐条判定=①现场漂移**未触发**（序2 重 pin 14 锚全承接·两 blob 漂移系并线携入结论不变）②机制不满足**未触发**（§2-4/§2-9 全绿）③越界需要**未触发**（触面恰 4 tracked 全在授权清单内）④验收红不可修**未触发**（门矩阵全绿）。

**STOP=`executed:awaiting_post_prove_dual`（EXEC 席翻面 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录·三处同值翻面=标题行+Status 行+§8+卷尾复述·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·本刀不宣称关闭·批5 盘点 #101 部分 untrack 半面行翻面登记权归协调方 nail[§8-⑤]·⛔push ⛔merge 主线 ⛔force push）**。

---

*REPO-HYGIENE REQUEST · 2026-10-17 起草 · 2026-10-17 EXEC 落卷 · **STOP=`executed:awaiting_post_prove_dual`**（EXEC 席翻面·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录·三处同值=标题+Status+§8·卷尾复述·post-prove 双审两独立外席待派·alone≠dual·⛔push·⛔merge主线） · 起草 base=`feat/mysql-schema-skeleton` @`2c257eb0`（建树时 origin/feat/mysql-schema-skeleton tip·下界「≥`92086586`」`git merge-base --is-ancestor` EXIT=0 亲证·fetch --all 部分成功 ccl 远端不可达如实登记·**落卷前 origin 已被并发席行至 `bf453f49`=本卷基线祖先·漂移登记 §0.2-6**）· 分支 `line/repo-hygiene` · 工作树 `meetwise-rh`（本起草席 `git worktree add` 亲立·建前 branch/worktree/同名卷三查不存在）· 立项出处=协调方派单 brief（批5 盘点 Top9+#101 部分·零前置）+`5e-cleanup-sweep-2-REQUEST.md:39/:67` 归槽呈报承接+issues-master #249 仓外行亲读+authz-harden 卷 #143 挂账承引 · 修法=件① `git rm --cached` 两产物（`cbcc1fba`+`5bf041bc`·工作树保留）+件② `.gitignore` 补 `test-results/`+`*.tsbuildinfo` 恰 2 条目+件③ Dockerfile 裁量零字节（`--prod=false` 维持·`@swc-node/register`/`@swc/core`/`typescript` 三件 devDeps=运行时 `--import` 硬依赖亲证→**prod 依赖完备性=不完备→登记不改**）+件④本卷 · #249（响亮失败有意设计·顺核锚全在位）/（#143 P4 备忘挂账承登）两注记面零码 · CI/码面消费双零命中亲证（`.github/` 零引用+`*.ts/*.mjs/*.js/*.tsx` 零引用）·i6 门 `:197` 容忍臂零触 · 零迁移零 lockfile 零依赖 · 触面=恰 4 tracked 路径 · 起草基线门亲跑全绿（typecheck 8/8 0 cached+lint 5235 恰等+docs:check 2213≤2216+install --frozen-lockfile）· est live=0 · actualSpendCny=null · markers=0（恰符臂协议形承登）· 停止条件四类全设未触发 · Ban self-approve · alone≠dual · Dual PASS ≠ EXEC · ⛔push · ⛔merge主线 · STOP*
