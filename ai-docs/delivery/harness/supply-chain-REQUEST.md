# SUPPLY-CHAIN 供应链残面刀（#101 部分·仓库卫生刀残面登记承接·镜像 devDeps 完备性正解 + .dockerignore 补行 + 整仓 COPY 瘦身裁量 + #249/#143 注记承登 · 起草 REQUEST · **STOP=`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷 2026-10-16 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual · Dual PASS ≠ EXEC · ⛔push · ⛔merge主线）
**席位**：SUPPLY-CHAIN 供应链残面刀起草席（协调方派单·#101 部分 残面承接·批5 自主可推件·⛔push·⛔merge主线）。
**基线**：`feat/mysql-schema-skeleton` @ `7c602df0`（本席 `git fetch origin` 亲证 `origin/feat/mysql-schema-skeleton` tip=`7c602df0`「merge(reserve-renew-fix): nail 波序并线」·派单「fetch 后 origin tip≥最新」等号成立亲证·本席 `git worktree add ../meetwise-sc -b line/supply-chain` 亲立锚该 tip·分支零自造 merge 节点·⛔pull --rebase 未用）· 分支 `line/supply-chain` · 工作树 `meetwise-sc`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权/立行权归协调方）**：①协调方派单 brief（#101 部分·四读码面=devDeps 完备性正解+dockerignore 补行+COPY 瘦身裁量+#249/#143 注记）；②`execution-master-checklist.md:3565` STILL OPEN 承接原文亲读在卷（「#101 部分残面（镜像 devDeps+整仓 COPY 瘦身+.dockerignore 补行）归后继供应链刀」——本卷即该后继承接席）；③`product-campaign-LEDGER.md:611` repo-hygiene nail 管线行同款登记（「依赖归位/预编译归后继供应链刀·本地镜像面归后继供应链刀整仓 COPY 瘦身」）；④`repo-hygiene-REQUEST.md` §1.2-3/§1.3-6/§9-rev.3 三处残面登记原文亲读在卷（本卷逐面承接·登记不洗）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/`git rev-parse HEAD:`/`git hash-object` 实测 @`7c602df0`·**EXEC 立项照本节对届时 tip 再重 pin——基线漂移如实改锚·结论不变则只更行号**）

### 0.0 防重三对表

- `git branch --list "line/supply-chain"` 恰 1 命中=本席分支；`git worktree list` 中 `meetwise-sc` 恰 1 树=本席工作树（建前双查不存在）。
- `ls ai-docs/delivery/harness/ | grep ^supply-chain` 建前零命中→落卷后唯一同名卷=本卷；`git log --all --grep="供应链" ` 命中两件均系前刀史录（`eae603c3`/`4c20884d`=5e-cleanup-sweep-2 卷归槽呈报·非本域名占有）=无在册同名卷可撞。
- 本刀五触面（Dockerfile/.dockerignore/两 apps package.json/packages db+domain package.json/lockfile）`git worktree list` 13 树扫：本席树外零第二在飞树锚定（前刀 repo-hygiene 线 `line/repo-hygiene` 已 nail 落主线·其残面登记即本卷立项出处）。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算 @`7c602df0`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `Dockerfile` | `34f84823`（39 行） | **修法件②④落点**·`:16` `RUN pnpm install --frozen-lockfile --prod=false`（deps 阶段·devDeps 全量进树）·`:28-30` `COPY --from=deps` node_modules/apps/packages 三行（cache 结构·零触面）·`:31` `COPY . .`（整仓 COPY 面）·`:38-39` CMD `node --import @swc-node/register/esm-register src/main.ts`（**运行时消费 @swc-node/register 正身**） |
| `.dockerignore` | `e2aac246`（17 行） | **修法件③落点**·`:5` `**/node_modules`（**node_modules 已排除亲证**——派单点核项答=已排除）·`:14` `**/test`（#168 AUTHZ-HARDEN 5A-2）·`:17` `apps/worker/evidence`（#169 CI-WIRING）·**零 `test-results` 零 `tsbuildinfo` 词面**（grep 双证=残面两行欠） |
| `apps/api/package.json` | `9ec7b830` | **修法件①落点**·dependencies 十三件零 swc/typescript·devDependencies 四件=`@swc-node/register ^1.11.1`+`@swc/core ^1.15.43`+`@types/node catalog:`+`typescript catalog:`（亲读）·`serve` 脚本与数十 `prove:*` 脚本 `node --import @swc-node/register/esm-register`（前者=镜像 CMD 同形·后者=dev-only 非镜像消费） |
| `apps/worker/package.json` | `79b91c07` | 同上：devDeps 六件含 `@swc-node/register`+`@swc/core`+`tsx ^4.22.4`+`typescript`·`start` 脚本同形 register（亲读）·`tsx` 在 worker 侧仅 `prove:*` 脚本消费=**dev-only 零镜像面（留 dev 归位否决见 §1.3-4）** |
| `packages/db/package.json` | `1331641f` | **修法件①落点（残面补全）**·dependencies 三件=`pg`+`@meetwise/errors`+`@meetwise/qdrant-store`·devDependencies 八件含 **`@meetwise/domain`+`@meetwise/contracts`（workspace 链·src 24 文件 import 亲证=dev 归类失实）**+`tsx`（migrate 硬依赖·§0.2-1）+`@langchain/langgraph-checkpoint{,-postgres}`（src 零 import 亲证=真 dev 留置）·`exports."."`=`./src/index.ts`+`"./sql/*"`（TS 源直出面·migrate 面需 sql/+migrations/ 全目录在镜像） |
| `packages/domain/package.json` | `837b4a51` | **修法件①落点（传递边）**·dependencies 二件=`mammoth`+`pdf-parse`·devDependencies 含 **`@meetwise/contracts`（domain src import `@meetwise/contracts` 亲证·`grep -rl` 命中 domain/src=dev 归类失实传递边）** |
| `pnpm-lock.yaml` | `af9c3f38`（9353 行） | importers 决议：apps/api/apps/worker 两块 `@swc-node/register` 均列 devDependencies 段（`:106`/`:270`）·`packages/db` 块 `tsx` 列 dev（`:409` 区）·peer 组 `@swc-node/register@1.11.1(@swc/core@1.15.43)(@swc/types@0.1.27)(typescript@6.0.3)`（`:6138`）——**件① 归位后 EXEC `pnpm install` 刷 importers 分类·版本零变** |
| `docker/compose.prod.yml` | `663720c3`（413 行） | 运行时消费链三处：`:229` migrate `node node_modules/tsx/dist/cli.mjs src/migrate-cli.ts && cd /app/apps/worker && node --import @swc-node/register/esm-register src/cost-configure.ts`（**tsx+register 双硬依赖一处**）·`:238`/`:273` api/worker CMD 同形 register·`:396-397` watchdog 纯 `node -e`（零 register 零触）·web 服务 `:350` 区系 `WEB_IMAGE` 独立镜像（apps/web 源不入 backend 镜像亲证） |
| `docker/compose.ha-3-proof.yml` | `d24f0a8f` | `:107` migrate 命令形与 prod 同款（同 BACKEND_IMAGE 族·件①② 落位自动受益·零字节触面） |
| `apps/web/Dockerfile` | `d04dfcb5`（32 行） | 分判防误伤：`:14` 同款 `--prod=false` 系 **build 阶段消费**（`:16` `next build` 需 devDeps）·run 层 `:26-28` 只带 standalone/static/public 三产物=devDeps 不进运行层——与 root 镜像运行时消费形**不同质**（§1.3-6 否决维持·零本刀面） |
| `apps/api/tsconfig.json` | `99baac83` | `"extends": "../../packages/config/tsconfig/nest.json"`——**运行时 register 读 per-package tsconfig·extends 链全指 packages/config**（worker=`base.json`·七 packages 全 `../config/tsconfig/base.json` 八处亲读·root `tsconfig.json` 系 typecheck/depcruise 面=运行时零消费→COPY 精确清单免 root tsconfig 亲证） |
| `packages/config/package.json` | `77f6b76e` | `exports` 含 `./tsconfig/base.json`+`./tsconfig/nest.json`——extends 链落点·`COPY packages ./packages` 精确清单覆盖亲证 |
| `apps/web/package.json` | （devDeps 面旁证） | `@playwright/test ^1.61.1`+`tailwindcss`+`tsx` 等 devDeps=web 侧 dev-only 标记件族（root devDeps `eslint`/`turbo`/`esbuild`/`dependency-cruiser` 同=件⑤ 缺席断言标记池） |
| `.gitignore` | `b8b82897` | `:37` `test-results/`+`:38` `*.tsbuildinfo`（REPO-HYGIENE 件② 已落·`git ls-files` 对两词面零命中亲证=untrack 半已收口·本刀只收 `.dockerignore` 镜像面残半） |
| `scripts/ai-docs/public-text-policy.mjs` | `f9fcbbf5` | `:112` `const MAX_FILES = 2_240;`（cap 现值）·`:110-111` sanction 注记「2232→2240·N-19 修复刀随刀行使·授权随令」·`:324` `paths.length > MAX_FILES` 红臂——**本卷已知红承登面（§2-5）·Ban 本刀自改** |
| `packages/db/src/principal.ts` | `23e5b770` | #249 顺核锚：`:780-781` NODE_ENV=production→`production_local_database_host` 拒启·`:824-831` `isLocalDatabaseHost` 词表·`:834-841` verify-full 缺省（零触承登） |
| `packages/db/migrations/0151_pgp_sym_encrypt_grant.sql` | `e6e76af1` | `:31` `GRANT EXECUTE ON FUNCTION public.pgp_sym_encrypt(text,text) TO memory_runtime`——#143 挂账锚（零触承登） |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4` | `:197` 恰符臂过滤器 `!f.endsWith('tsconfig.tsbuildinfo')`+`:198` 断言词在位——本卷对届树必红该臂=**协议形承登**（repo-hygiene §7 先例·§7 同款） |

### 0.2 亲证面（派单四读码面定稿·本席逐条实锚）

1. **运行时硬依赖全谱（四件组→九条目定稿·派单 a 项）**：镜像运行时消费链=compose.prod `:229`/`:238`/`:273`+Dockerfile `:38-39`——`@swc-node/register`（api/worker/cost-configure 三 CMD 面）+`tsx`（migrate 一 CMD 面·**前刀三件组登记未含 tsx 之 packages/db 面·本卷残面补全如实承登**）。完备性传递审计（本席 `grep -rhoE "from '(@[^']+)'"` 对五包 src 全扫+`python3 json` deps 对照）：**九条目 dev 归类失实清单**=apps/api 三件（`@swc-node/register`+`@swc/core`+`typescript`——peer 组亲证 `@swc-node/register` package.json peerDependencies=`@swc/core`+`typescript`·**esm/esm.mjs `:7` `import ts from 'typescript'` 运行时硬 require 本席亲读**）+apps/worker 同三件+packages/db 三件（`@meetwise/domain`+`@meetwise/contracts`——src 24 文件 import 而 dev 归类·`tsx`——migrate CMD）+packages/domain 一件（`@meetwise/contracts`——domain src import 传递边·**若仅移 db 不移 domain：--prod 剪枝后 domain→contracts 断链=同一拒启**）。反向核（真 dev 留置面）：worker/db 侧 `tsx` 之 prove 脚本消费面、db devDeps `@langchain/langgraph-checkpoint{,-postgres}`（src 零 import 亲证）、`@types/*` 族、root devDeps 全件（`eslint`/`turbo`/`esbuild`/`dependency-cruiser`）——`--prod` 剪枝正确目标=仅失实九条目。
2. **tsconfig 运行时消费面（COPY 瘦身免 root tsconfig 亲证）**：register 自 cwd 读最近 tsconfig（`esm-register.mjs` `register('…', pathToFileURL('./'))` 本席亲读·CMD workdir=/app/apps/api 与 /app/apps/worker）·tsx 同理最近 tsconfig——extends 八处全指 `packages/config/tsconfig/*`（§0.1 两行锚）→**root `tsconfig.json`/`tsconfig.e2e.json` 运行时零消费**·精确 COPY 清单（件④）可免。
3. **镜像夹带面（派单 b+c 项现状）**：`:31` `COPY . .` 全仓入镜像——ai-docs 卷面（本席亲算：`git ls-files ai-docs | wc -l`=**668**·其中 delivery/harness 目录 289 卷）/`scripts/`/`docker/`/`docs/`/`.github/`/`apps/web` 源树（WEB_IMAGE 独立镜像·backend 运行时零消费亲证 §0.1 compose 行）/本地在盘杂物（`output/`/`preview-site/`/`.sync/` 等 untracked 在盘件——docker 构建上下文不读 `.gitignore`·repo-hygiene §9-rev.3 承登的「本地 docker build 夹带在盘两产物」面即此）——`.dockerignore` 两行（件③）收两产物·精确清单（件④）收整仓面。
4. **#249/#143 注记面（派单 d 项·不改码·承登即义务）**：#249=生产配置拒本地主机名系**有意响亮失败**（repo-hygiene §1.3-1 承引 issues-master 仓外 :526 复核注记·代码锚 §0.1 principal.ts 行全在位本席亲读）——处置建议（部署文档写明前提+启动错误信息给修复指引）登记归后继运维/文档刀·裁决权归协调方·本卷零码零宣称。#143=0151`:31` pgp_sym_encrypt 对称密钥经 SQL 参数面·AUTHZ-HARDEN 5A 段「登记不实施（启用前另刀）」挂账主权不变·本卷承登零触。
5. **基线门读数（本席本树亲跑 @`7c602df0`·2026-10-16）**：`TURBO_DAEMON=false pnpm turbo typecheck --force` **8/8·0 cached EXIT=0**（14.2s）·root `pnpm lint` **5240 warnings 恰等·0 errors EXIT=0**（较前刀基线 5235 +5 系并线波携入·如实登记非本刀面）·`node scripts/ai-docs/check-docs.mjs` **2240 ≤ cap 2240 EXIT=0 恰等零余量**（「scanned 2240 managed worktree files」原文在卷——**本卷 REQUEST +1 后必红 FILE_LIMIT=已知红承登 §2-5/§8-①**）·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`git status --porcelain` 0 行（前刀恒脏噪音消亡活证）。

### 0.3 迁移号登记（预期零）

- 本刀**预期零迁移**（依赖归位+镜像构建面·零 SQL 零 DDL 零新表）。**协调规则**：若 EXEC 期复判确需迁移→认领号=EXEC 立项日按届时主线链顶顺延实测·Ban 抢号 Ban 私占（沿 repo-hygiene §0.3 同款）。

## §1 红事实（派单四面承引+源级亲证）

### 1.1 devDeps 进镜像面（派单 a 项·完备性=不完备而镜像=带全量 dev）

`--prod=false`（`:16`）令全 workspace（importers 12·lockfile `:64-416` 区本席亲算）全量 devDeps 进 deps 树→`COPY --from=deps /app/node_modules`（`:28`）全量进运行层：typescript/eslint/turbo/esbuild/@swc core native 多平台二进制/@playwright test/tailwind 等**运行时零消费件全在镜**——体积面+供应链审计面（镜像 SBOM 夹带 dev 面）双红。同时**反向红**=九条目运行时硬依赖 dev 归类失实（§0.2-1 九条目清单·tsx 之 migrate 面系前刀登记残缺本卷补全）——单翻 `--prod` 即四容器拒启（api/worker/migrate/cost-configure）。两面同根：**依赖归类失实=「直跑 TS 架构 + dev 归类惯性」的结构残面**·前刀「登记不改」条款到期·本卷即承接收口席。

### 1.2 整仓 COPY 面（派单 c 项）

`:31` `COPY . .` 全仓入镜像（§0.2-3 清单）——`COPY --from=deps` 已供 apps/packages 之 package.json 骨架·`:31` 全仓 overlay 纯冗余夹带；apps/web 源树系最重零消费件（WEB_IMAGE 独立镜像亲证）。**裁量=最小面精确清单**（件④·4 行 whitelist）·**多阶段 builder/预编译运行形=彻底解超量级→分批登记归后继预编译运行刀**（§1.3-1/§4-④）。

### 1.3 `.dockerignore` 缺口面（派单 b 项·node_modules 已排除亲证+两产物两行欠）

`**/node_modules` `:5` 已排除（派单点核项答=**已排除·亲证**）·`**/test`+`apps/worker/evidence` 两排除已随 #168/#169 落——**唯 test-results/tsbuildinfo 两词面零条目**（grep 双证）：前刀 untrack+gitignore 后 CI 全新 checkout 上下文本就无两件（§2-1 CI 面判据）·但**本地 docker build 夹带在盘两件面仍开**（repo-hygiene §9-rev.3 原文「本地镜像面归后继供应链刀」即本刀件③）——补两行即收口·注记形沿 #168 共同权威注记（两镜像 context 均仓库根）。

### 1.4 #249/#143 承登面（派单 d 项·零码）

§0.2-4 全谱承引·本卷注记面零码零宣称零挂账主权移转。

## §1-修法（五件落码·零迁移·本卷 REQUEST 随卷·**EXEC 契约定稿·改则回炉重审**）

- **件① 依赖归位（九条目×五 package.json·devDependencies→dependencies 块移行·specifier/版本零变）**：
  - `apps/api/package.json`：`@swc-node/register`+`@swc/core`+`typescript` 三件移 dependencies（CMD register 面+peer 组·§0.2-1）。
  - `apps/worker/package.json`：同三件移 dependencies（`start`+cost-configure 面·worker 侧 `tsx`/`@types/*` 留 dev=prove 脚本 dev-only 亲证）。
  - `packages/db/package.json`：`@meetwise/domain`+`@meetwise/contracts`+`tsx` 三件移 dependencies（migrate 命令链 src import 面·`@langchain/langgraph-checkpoint{,-postgres}`+`@types/*`+`typescript` 留 dev——tsx 不 require typescript（esbuild 形）·migrate-cli 运行零 typescript 消费亲证）。
  - `packages/domain/package.json`：`@meetwise/contracts` 移 dependencies（传递边·§0.2-1）。
  - lockfile 随动：EXEC 序内 `pnpm install` 刷 importers 分类（版本零变·同 peer 组快照）→ `pnpm install --frozen-lockfile` 复验 EXIT=0。
- **件② Dockerfile `:16` `--prod=false` → `--prod`**（单 token 翻转·其余 38 行零字节·`:28-30` COPY --from=deps 三行 cache 结构零触）。
- **件③ `.dockerignore` 尾部补两行+注记块**：`**/test-results`+`**/*.tsbuildinfo`（目录级/通配双形与 `.gitignore:37/:38` 对仗）+三行注记（REPO-HYGIENE 承登+两镜像共同权威形沿 #168 注记）——恰 2 条目·Ban 扩面（§1.3-7）。
- **件④ Dockerfile `:31` `COPY . .` → 精确清单 4 行**：`COPY pnpm-workspace.yaml package.json ./` + `COPY packages ./packages` + `COPY apps/api ./apps/api` + `COPY apps/worker ./apps/worker`——运行时消费面全谱覆盖亲证（src 树+per-package tsconfig extends 链+db sql/+migrations/+各 package.json exports 面·root tsconfig 两件免 COPY 亲证 §0.2-2）·apps/web/scripts/ai-docs/docs/docker/.github 及在盘杂物全数出镜。
- **件⑤ 本卷 REQUEST**（docs 面·恰 1 新增 .md）。
- **效果账**：①prod 树=运行时零缺失（九条目归位直证）②dev 全量出镜（typescript/eslint/turbo/@playwright/swc 多平台余码等）③整仓夹带出镜（ai-docs 全卷+web 源+在盘杂物）④本地 docker build 两产物夹带面收口（前刀 §9-rev.3 承登兑现）⑤零迁移零码行为变更（依赖树同版本同形状·唯分类与镜像内容面收口）。

## §1.3 否决（替代路径·全数否决·越界行使即停止条件）

1. **否决「彻底解本刀行使」（预编译运行形：builder 阶段 tsc emit/esbuild bundle/standalone 产物·运行层 plain node dist/·register/tsx/typescript 全出运行时）**：触 compose 命令形 16 件（docker/*.yml 全域·本席亲算）+Dockerfile 构建面重写+tsconfig 构建配置+dist 布局+CI 面联动=超本刀量级——**分批登记归后继预编译运行刀**（§4-④ 下游指针·裁决权归协调方派单）。
2. **否决「仅移 `@swc-node/register` 不移 `@swc/core`+`typescript`」**：peer 组+`esm.mjs:7` `import ts from 'typescript'` 运行时硬 require 亲证——register 起动即崩·半修=拒启。
3. **否决「packages/db `tsx` 不归位」**：compose `:229` migrate 链 `node_modules/tsx/dist/cli.mjs` 硬依赖亲证——漏移=迁移容器拒启·**前刀三件组登记之残缺面本卷补全**（非翻前刀案·系其登记时点未及 db 面·如实承登）。
4. **否决「worker/db 侧 `tsx` 一并归位」**：worker tsx 仅 prove 脚本消费=dev-only 亲证（§0.2-1 反向核）——归位=dev 面夹带回潮·恰反本刀宗旨。
5. **否决「依赖归位不配 `:16` --prod 翻转」**：devDeps 面不收口=派单面半修·两面同根必同刀。
6. **否决「web Dockerfile `:14` `--prod=false` 同步翻」**：web 系 build 阶段消费（`next build` 需 devDeps·run 层 standalone 已隔离）·repo-hygiene §1.2-4 分判承继·零本刀面零字节。
7. **否决「`.dockerignore` 扩面 `output/`/`preview-site/`/`.sync/`/`.zcodeignore` 等本地在盘杂物」**：派单点名两产物+node_modules 已排除亲证=本刀域三件·扩面发明归协调方/后继卫生刀裁量·件④ 精确清单已令杂物不进 backend 镜像（web 镜像面其自裁量）。
8. **否决「`:28-30` `COPY --from=deps` 三行重排/删除」**：cache 结构面零增益翻动·`apps`/`packages` 骨架仍需其供给——零字节。
9. **否决「compose 命令形改写」（直跑 tsc/换 ts-node 等）**：命令形主权在部署链 16 件（docker/*.yml 全域）——本刀只动 node_modules 内容面与镜像内容面·命令形零字节。
10. **否决「本刀自改 `public-text-policy.mjs` MAX_FILES」**：cap sanction 权归协调方（`:110` 注记「授权随令」形·N-19 先例「红停承登·随刀 sanction」）——本卷只呈报（§8-①）·policy 文件零字节=Ban 面。
11. **否决「#249/#143 顺带码动」**：注记承登面·码面主权在 AUTHZ-HARDEN 5A 段/协调方运维文档刀（§0.2-4）。

## §2 验收断言候选（EXEC 门矩阵·pre-exec 双审核对单基面·全过为绿）

1. **docker build 面校验（派单点名臂）**：`docker build --build-arg VCS_REF=$(git rev-parse HEAD) --build-arg SOURCE_TREE=$(git rev-parse HEAD^{tree}) -f Dockerfile -t meetwise-sc:probe .` EXIT=0（沿 ci.yml `:153` 同参）+web 镜像同参建（`:154` 形·件⑥ 零字节防误伤面核）。**镜像断言三臂**：①register 探针 `docker run --rm --workdir /app/apps/api meetwise-sc:probe node --import @swc-node/register/esm-register src/main.ts` →EXIT≠0 且输出含 env 校验拒启形（fail-closed 设计拒启）**零 `ERR_MODULE_NOT_FOUND` 零 `Cannot find package`**=依赖树完备性直证；②tsx 探针 `docker run --rm --workdir /app/packages/db meetwise-sc:probe node node_modules/tsx/dist/cli.mjs --version` EXIT=0；③dev-only 缺席断言 `docker run --rm meetwise-sc:probe sh -c "test ! -d node_modules/.pnpm/eslint* && test ! -d apps/web/node_modules/@playwright"` 形 EXIT=0（标记池=eslint/turbo/@playwright 任选实录）·**两镜像体积读数如实登记入收据（修前修后双值·不设 pin 不造数）**。三探针均进程级离线（零业务外呼零生产集群·est live=0 承登 §6）。
2. **CI 面不受损核**：`git diff --name-only` 对立项基线 `.github/` 零命中·ci.yml `:153-154` 两 build 结构零字节；`git grep -n "test-results\|tsbuildinfo" -- .github/` 维持零命中（前刀 §2-1 口径承继）。
3. **typecheck 门**：`TURBO_DAEMON=false pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径·基线亲跑绿在卷 §0.2-5）。
4. **lint 门**：root `pnpm lint` **届树亲数恰等（起草基线 5240）** EXIT=0（+5 漂移系并线携入已承登 §0.2-5·EXEC 对届 tip 重数·Ban 借机修 lint）。
5. **docs:check 门（已知红承登）**：`node scripts/ai-docs/check-docs.mjs` 判据=**届实跑≤届 cap**——起草基线 **2240=cap 2240 恰等零余量**·本卷 REQUEST +1 后 **2241>2240 必红 FILE_LIMIT**（`:324` 臂·本席已知红如实承登非隐瞒）——**cap sanction 2240→2248 归协调方 EXEC 前行使（§8-①·N-19「红停承登·随刀 sanction」先例形）**·EXEC 判据=「sanction 落树后届实跑 2241≤届 cap 2248」· sanction 未行使→停（§8 停止条件②）·Ban 本刀自改 policy（§1.3-10）。
6. **markers 门**：改动集（本卷 .md+Dockerfile+.dockerignore+四 package.json+pnpm-lock.yaml）五类标记词+行首冲突标记零命中（起草席落卷亲跑直证 §7·词表沿 `i6-239-gates.proof.mjs` 运行时组装口径·不入卷防自指）。
7. **diff 面（改动面窄断言）**：EXEC diff（对立项基线 `7c602df0`）=恰 **8 tracked 路径**——本卷 REQUEST（A）+`Dockerfile`（M）+`.dockerignore`（M）+`apps/api/package.json`（M）+`apps/worker/package.json`（M）+`packages/db/package.json`（M）+`packages/domain/package.json`（M）+`pnpm-lock.yaml`（M·importers 分类移行零版本变）；**零字节机检面**=apps/web/Dockerfile/compose 16 件/root tsconfig 两件/principal.ts/0151/scripts/ai-docs 全卷/i6 脚本/public-text-policy.mjs/.gitignore（`git diff --name-only` 词面机检）。
8. **零迁移门**：改动集零 SQL 零新表（§0.3 预期零实证）。
9. **est live=0**：起草 turn 零外呼；EXEC 期=本地 docker build+三探针容器（`--rm` 进程级离线·零生产集群零 Key 零 secrets）+pnpm/turbo/node 本地门=est live=0 承登（§6）。
10. **lockfile 卫生门**：`pnpm install --frozen-lockfile` EXIT=0·`git diff pnpm-lock.yaml` 仅 importers 分类移行（版本行零变·`dependency`/`devDependency` 键位迁行形·EXEC 收据附 diff 摘录）。

## §3 范围外（边界清单·越界即 FAIL）

1. **web 镜像零字节**：apps/web/Dockerfile 零触（§1.3-6 否决行使面）·apps/web 源树/package.json 零触。
2. **compose 16 件+部署链零字节**：命令形主权不在本刀（§1.3-9）·prod/ha-3-proof/其余 14 件全零触。
3. **root tsconfig 两件/`apps/*/tsconfig.json`/`packages/config` 零字节**（件④ 精确清单已覆盖其运行时面·零改必要）。
4. **cap policy 零字节**：`scripts/ai-docs/public-text-policy.mjs` sanction 权归协调方（§1.3-10/§8-①）。
5. **#249/#143 零码**：principal.ts/checkpoint-principal.ts/0151 迁移零触零宣称（§1.4 承登面）。
6. **共享 SSOT 零改**：LEDGER/checklist/repo-hygiene 卷/issues-master 只读引用——#101 部分 残面行翻面/立行权归协调方·本刀不宣称行关闭不自建立行。
7. **零迁移零 env 闸零 secrets**（§0.3·est live 面）。
8. **兄弟树零触**（§0.0 三对表·13 树零交集亲证）。

## §4 依赖

**①上游已满足**：repo-hygiene nail（untrack+gitignore 半已落·`:3565` 残面登记指针即本卷立项）+`#168`/`#169` .dockerignore 排除半已落（`e2aac246` 注记在位）+`5e-cleanup-sweep-2` 归槽呈报链。**②无同文件并发**：§0.0 三对表亲证·五触面 13 树零第二占有。**③迁移号**：§0.3（预期零）。**④下游**：预编译运行刀（彻底解·§1.3-1 分批登记）+#249 运维/文档刀（处置建议）+cap sanction 归协调方——三指针均登记归协调方派单裁。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（⛔push·git 写只本 worktree commit）·Ban merge 主线（⛔merge主线）·Ban 自批（pre-exec 双审须独立外席·alone≠dual 不代签）·Ban 触 apps/web/Dockerfile/compose 16 件（docker/*.yml 全域）/root tsconfig 两件+全 per-package tsconfig/root package.json/scripts 全卷/public-text-policy.mjs/.gitignore/principal.ts/0151（§3 边界+§1.3 否决行使面）·Ban cap 自改（§1.3-10）·Ban 归位扩面（九条目外任何 devDeps 迁移·含 worker/db tsx 面 §1.3-4）·Ban 彻底解越刀行使（§1.3-1）·Ban 命令形改写（§1.3-9）·Ban 触 #249/#143 码面（§3-5）·Ban 触共享 SSOT 与立行（§3-6）·Ban 抢迁移号 Ban 私占（§0.3）·Ban 借机修 lint/cap/协议形红（§2-4/§2-5）·Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）·Ban 触其他工作树。

**pins（本卷钉值·零翻转）**：归位条目=**9**（api 三+worker 三+db 三+domain 一=**9 条目×5 package.json**·口径=四件组正身+传递边补全）·`:16` 翻转=**单 token**（`--prod=false`→`--prod`）·`.dockerignore` 新条目恰 **2**（`**/test-results`+`**/*.tsbuildinfo`）·`:31` 替换=**精确清单恰 4 行**·diff 面=**8 tracked 路径**·node_modules 排除=**已排除亲证**（`:5`·派单点核答）·运行时硬依赖=register+tsx **两正身·九条目支撑**·typecheck=**8/8 0 cached**·lint=**5240 恰等（起草口径）**·docs 基线 **2240**/cap **2240 恰等零余量**（本卷 +1 已知红承登·sanction 请求 2248）·迁移=**0**·est live=0（起草 turn）·haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null。

## §6 est live=0（起草 turn）+ EXEC 门预申明

- **起草 turn（本 commit）**：est live=**0**——零模型外呼零 Key 加载零生产操作零消耗（基线门=纯本地 pnpm/turbo/node·零容器）。
- **EXEC 期门预申明（授权后方可行）**：①件①-⑤落位（契约条款逐条对照·Ban 就地改契约）；②§2 十门全跑全落收据（EXIT 逐门入卷·docker 三探针臂含 ERR_MODULE_NOT_FOUND 直证）；③cap sanction 须已落树（§8-①·未行使即停）；④收据落点 `ai-docs/delivery/receipts/supply-chain/`（余量 3 内 EXEC 自裁最小集·越即停上报）+harness 本卷推进注记（append-only）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+Dockerfile+.dockerignore+四 package.json+pnpm-lock.yaml）**五类标记词 grep 零命中**（起草席落卷时对本卷亲跑直证·回执随 EXEC 收据留痕·五类词面见 `i6-239-gates.proof.mjs` 运行时组装·不入卷防自指）。**承登（基线红如实）**：`i6-gates:prove` 恰符臂以 i6-239 历史刀申报清单为期望集·任何后继刀必红该臂=**协议形承登**（repo-hygiene §7/obs-family §7 先例）；本刀实质臂=改动集五类词面零命中+`est live=0`+探针三臂直证（§2-1）+零迁移+SSOT 零触·全绿为门。

## §8 STOP · `draft:awaiting_pre_exec_dual`（起草落卷 2026-10-16·三处同值：标题行+Status 行+本节·卷尾复述同值·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS ≠ EXEC·PASS 只过审·开工须协调方明示授权）

**开工三条款**：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §8 裁决行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号）。**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（Dockerfile 消费链被改/.dockerignore 被他刀改/四 package.json 依赖面被他刀改/compose 命令形被改/cap sanction 被他人行使落地）→停·重 pin 回炉；**机制不满足**=件①-⑤落位后 §2-1/§2-7 命中红（探针 ERR_MODULE_NOT_FOUND/diff 面溢出）→停·如实升级协调方（Ban 就地改因 Ban 扩面修）；**越界需要**=compose 命令形/web 镜像/预编译彻底解/cap 自改等诉求→停·另刀或 §8 裁决行使（Ban 就地修）；**验收红不可修**=cap sanction 未行使/docs 基线再漂超帽而 sanction 未随/lint 漂移根因不在本刀交付面→停·如实登记（Ban 借机修）。

**待双审/EXEC 裁决项**：
- **①cap sanction 2240→2248 行使（§2-5 已知红）**：起草基线 2240=cap 恰等零余量·本卷 REQUEST +1 必红 FILE_LIMIT——推荐=协调方 EXEC 前随令 sanction +8（`2_240`→`2_248`·N-19「红停承登·随刀 sanction」先例形·越限臂 fabricated 数随 cap 联动同步）·本刀与双审刀零自改。
- **②九条目归位定稿追认（件①）**：api/worker 各三件+db 三件（domain/contracts/tsx·**前刀三件组残缺面补全**）+domain 一件（contracts 传递边）——推荐=追认九条目×五 package.json 形；`--prod` 翻转随追认同刀行使（§1.3-5 绑定）。
- **③COPY 精确清单形追认（件④）**：4 行 whitelist（pnpm-workspace.yaml+package.json/packages/apps/api/apps/worker）vs 多阶段 builder——推荐=whitelist 本刀行使·builder 归后继预编译运行刀（§1.3-1/§4-④）。
- **④镜像探针臂形追认（§2-1）**：register boot 拒启形（env fail-closed 输出+零 `ERR_MODULE_NOT_FOUND`）+tsx `--version`+dev-only 缺席三探针——推荐=追认；全栈 boot（需 env 族/DB）=越 est live 面否决维持。
- **⑤#249/#143 注记归宿**：本卷 §1.4 承登面（零码）vs 协调方另立运维/文档刀——推荐=本卷承登+协调方择机派单（挂账主权 AUTHZ-HARDEN 5A 段不变）。

---

*SUPPLY-CHAIN REQUEST · 2026-10-16 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`**（三处同值=标题+Status+§8·卷尾复述·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve·⛔push·⛔merge主线） · 起草 base=`feat/mysql-schema-skeleton` @`7c602df0`（fetch 后 origin tip 等号亲证·worktree `meetwise-sc`/branch `line/supply-chain` 本席亲立·防重三查不存在）· 立项出处=协调方派单 brief（#101 部分·四读码面）+`execution-master-checklist.md:3565`+`product-campaign-LEDGER.md:611` 残面登记承接+repo-hygiene 卷 §1.2-3/§1.3-6/§9-rev.3 三处登记原文 · 修法五件=件① 九条目依赖归位（api 三+worker 三+db 三+domain 一·五 package.json·specifier 零变）+件② Dockerfile `:16` `--prod` 单 token 翻转+件③ `.dockerignore` 补 `**/test-results`+`**/*.tsbuildinfo` 恰 2 行（node_modules 已排除亲证 `:5`）+件④ `:31` `COPY . .`→精确清单恰 4 行+件⑤本卷 · 彻底解（预编译运行形）=超量级分批登记归后继预编译运行刀 · migrate tsx 面=前刀三件组残缺补全如实承登 · #249/#143 两注记承登零码 · diff 面=恰 8 tracked · docker 三探针臂+CI 面+typecheck 8/8+lint 5240 恰等+docs 基线 2240=cap 恰等（本卷 +1 已知红 FILE_LIMIT 承登·sanction 2248 归协调方 §8-①）+markers=0+零迁移 · est live=0 · actualSpendCny=null · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ EXEC · ⛔push · ⛔merge主线 · STOP*
