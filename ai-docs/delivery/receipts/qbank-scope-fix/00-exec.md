# QBANK-SCOPE-FIX 落卷收据 — 00-exec（CI 红线修复刀·夹具 owner GUC 恰 1 文件 +1 行·2026-10-15）

**席位与授权口径**：落卷席（前起草席过期后协调方收尾令接手·非完整 EXEC）——授权=协调方直令（核卷→夹具修法 (a) 落地→复跑四门→§9 落卷→commit；唯一码触面=测试夹具文件·Ban 产品码 0187·⛔push⛔merge）。**pre-exec 双审未走**（前席起草落卷即停于 `draft:awaiting_pre_exec_dual`·无会签）→ STOP 终态如实维持 `draft:awaiting_pre_exec_dual`（§9 收尾记录同此）·本收据即双审受审面之一。
**工作区**：`meetwise-qsf`（line/qbank-scope-fix）·base=`feat/mysql-schema-skeleton`@`bab69561`（本树 HEAD 恒等）·**主线 tip 已前移 `f417d8e7`（cost-columns nail·cap sanction 591d07cf 2144→2152 在主线）——本树 ⛔merge 未并线·基线漂移如实登记·本刀 delta 对 base 零意图变更**·est live=**0**（prove 全 run-e2e-isolated 隔离容器·零模型外呼零 secrets·`actualSpendCny=null`）·`.env*` ABSENT 双向记录（ls no matches）。

## 一、§0 全量重 pin（收尾日对本树 `bab69561` 实测·blob `git hash-object` 亲算）

| 锚 | 卷 pin blob | 实测 blob | 结论 |
|---|---|---|---|
| `apps/worker/test/qbank-generation.proof.ts` | `02f1675b`（640 行·NUL=6） | 改前 `02f1675b`（640 行·NUL=6·sha256 `6ef28f45…`·46840 B）→ **改后 `ad696c38`**（641 行·NUL=6 原值·47049 B=46840+209 恰等） | 修法件① 唯一改面·落定 |
| `packages/db/migrations/0187_qbank_owner_scoped_retrieval.sql` | `5eee1f56` | `5eee1f56` | 同·零触 |
| `packages/db/migrations/0176_qbank_control_plane_authz_closeout.sql` | `38c1ec22` | `38c1ec22` | 同·零触 |
| `packages/db/src/qbank/qbank-generation-retrieval.ts` | `2c5ed849` | `2c5ed849` | 同·生产四 GUC 面零触 |
| `packages/db/src/principal.ts` | `c31cbac0` | `c31cbac0` | 同·零触 |
| `.github/workflows/ci.yml` | `97252708` | `97252708` | 同·step 71 定义零触 |
| `scripts/ai-docs/public-text-policy.mjs` | `7937bafa` | `7937bafa` | 同·本树 `MAX_FILES=2_144`（主线 sanction 2152 未并线·见偏离③） |
| `qbank-integrity-upgrade.proof.ts` | —（sibling 形锚） | `49c4e401` | `:258`/`:368` canonical 形逐字在位 |
| `qbank-retrieval-eval-pg.proof.ts` | —（sibling 形锚） | `5d164310` | `:142` canonical 形逐字在位 |
| `apps/worker/src/qbank-generation.ts` | —（只读引用） | `b3f0e0c5` | 零触 |
| 迁移链 | 203 头 0203（§0.3） | `ls …/migrations/*.sql | wc -l`=**203**·头 `0203_gateway_model_invocation_backlog.sql` | 恒等·零迁移零 DDL 兑现 |

**§0.1 锚漂移结论：全表零机制漂移（唯一 blob 变更=件① 本刀自改面）·§1.2 根因四环结论维持。**

## 二、件① 落地（唯一码改）

- 落点：`apps/worker/test/qbank-generation.proof.ts` directSqlBoundary 事务内·`:555`（serving 双 GUC 参数行）之后、`:556` 首查询之前·恰 1 行（4 空格缩进·回调参数 `c`·照 sibling `qbank-integrity-upgrade.proof.ts:258` canonical 形同形换绑）：
  `await c.query("SELECT set_config('app.qbank_owner_kind','platform',true), set_config('app.qbank_org_id','',true)");   // AG39 裁决⑧ setup 注入（qbank-scope-fix 刀·0187 owner 维度夹具供给）`
- 手法：perl 字节级插入（文件含 6 枚裸 NUL·§2-12① rg 陷阱规避·Ban 裸 rg/grep 下结论全程 `grep -a`/perl）·字节恒等式 `47049=46840+209` 亲证·NUL 计数改前改后=6/6·`git diff --numstat`=`1 0` 恰 1 文件 +1/−0·五探针臂/`:581`/`:582-583` 断言本体零字节改。

## 三、prove 红绿对照（EXIT 原值·恰三次·零 retry-to-green）

| # | 树 | 命令 | EXIT | 关键行 |
|---|---|---|---|---|
| R0 | 改前 | `pnpm rag-generation:prove` | 1 | **未达 prove 面=基建失败**：`isolated_postgres_database_not_ready:boot`（容器 `meetwise-e2e-81818` 未就绪·根因=新建 worktree `node_modules` 空目录·依赖从未安装）·非红非绿·不入冲销账（如实登记） |
| R1 | 改前（`pnpm install --frozen-lockfile` EXIT=0 4.4s·lockfile 零改亲证后） | 同上 | 1 | **改前基线红证据（件②①）**：`applied=203 skipped=0`→30 臂 PASS→`✗ error: qbank_retrieval_scope_missing`（23514 check_violation）栈 `qbank-generation.proof.ts:556:24 ← packages/db/src/principal.ts:997:15`——**与 CI run `38728371250` step 71 签名逐字同形**· receipt `.tmp/isolated-proof-receipts/2026-10-15T15-45-32-857Z-85436-*.json` |
| R2 | 改后（恰 1 run） | 同上 | **0** | **红翻绿（件②②·CI 红线直证）**：40 臂全 PASS·尾行 `✓ qbank generation: immutable recipe / atomic activation / rollback / retrieval policy / revoke / cache-DoS proof passed`·两关键臂「双空 GUC 直调五函数逐一报错」（探针断言面零触仍绿=0187 serving 先行判定仍命中原 message）+「直接 SQL 不能复活 retired generation，超大 k/refs 在数据库内封顶」（本红抛点臂·owner 供给后复绿） receipt `…/2026-10-15T15-46-31-766Z-86246-*.json` |

**臂账**：改前 30 PASS 后于 `:556` 未捕获中断（简报「前 32 臂」口径差如实登记·卷 §0.2-6 已预留「精确分母以改前必做 run 实测为准」）；改后 40 臂全绿（恢复 10 臂+尾行）·零 retry 零冲销。

**勘误注记（P2-c·pre-exec 双审席2 修订·append 不洗）**：R1/R2 行所引 `.tmp/isolated-proof-receipts/…json` 系 runner 元数据收据（本席 EXEC 期亲验 JSON keys=`class/dataHandling/durationMs/exitCode/finishedAt/outcome/releaseEvidence/schemaMigrationManifest/schemaVersion/sourceDigests/startedAt/target`·**不含臂计数不含 stdout 原件**）——本表「关键行」系落卷席对本地 run 终端输出的转录·**红签名权威面=CI run `38728371250` step 71 日志**（PR #108 verify·改前基线红证据以 CI 日志为权威对账面·本地转录与 CI 日志逐字同形在卷）。

## 四、协调方收窄复跑门（本席四面·全 EXIT 原值）

| # | 门 | 结果 | 关键行 |
|---|---|---|---|
| 1 | `rag-generation:prove`（主门） | **EXIT=0 红翻绿**（§三 R2） | 40 臂全 PASS |
| 2 | `docs:check` | **本树 EXIT=1 `public_text_policy:PTP_FILE_LIMIT:2146`**（2144 基线+本卷+收据=2146·本树 cap 仍 2144）——**非红停回归**：cap sanction 2152 已落主线（591d07cf/f417d8e7）·本树 ⛔merge 未并线故本地常量未随（见偏离③）·nail 并线 union 面算术必绿 2146≤2152 | scanned 2146 |
| 3 | markers 五类 | **零命中**（改动集=本卷 .md+件① .ts+本收据·词面运行时组装 `['T','O','D','O'].join('')`/`['F','I','X','M','E'].join('')`/`['X','X','X'].join('')`/`['H','A','C','K'].join('')`+冲突标记对（六 `<` 连与五 `>` 连·`'<'+'<'+'<'+…` 组装形·词面不入卷防自匹配）·同 `scripts/i6-239-gates.proof.mjs:151-163` 形·grep -a 全文件 EXIT=1 零命中） | 零命中 |
| 4 | diff 面机检 | **恰三面**：`M apps/worker/test/qbank-generation.proof.ts`（+1/−0）+`?? ai-docs/delivery/harness/qbank-scope-fix-REQUEST.md`+`?? ai-docs/delivery/receipts/qbank-scope-fix/00-exec.md`·tracked 变更恰 1 路径·`.tmp/`/`node_modules/` gitignore 在册零入面 | 多任何 tracked 路径即停条款未触发 |

**未复跑如实登记**：卷 §2 门矩阵其余门（qbank 域九邻面/neg 687/interview 57/migrate-drift-uniqueness/typecheck/lint 五值）本席按协调方收窄清单未跑——留 pre-exec 双审与（若协调方追认）后续 EXEC/双审面照卷 §2 全表行使；本刀改面=夹具 +1 行 setup 注入·零产品码零断言零迁移·邻面回归风险面=隔离容器内 R2 全臂绿已直证主门。

**勘误注记（P2-b·pre-exec 双审席2 修订·append 不洗）**：上表门 2「nail 并线 union 面算术必绿 2146≤2152」系并线前预写算术——**勘正为实测真值口径**：「2146」不作数·**并线后实测·按主线 `317ea3df` 时点 scanned 实数登记**（cap 以并线随入主线 sanction `317ea3df`=**2160** 为准·预写「≤2152」上限随 sanction 过时）；EXEC 收尾并线 `f21e5d74` 后复跑实测值见文末「附录·EXEC 收尾门矩阵补全」。

## 五、偏离清单（五项·如实全登记）

1. **环境修复**：`pnpm install --frozen-lockfile` 落卷前执行（EXIT=0·4.4s·`pnpm-lock.yaml` 零改亲证·git status 安装前后恒等）——新建 worktree 依赖缺失·R0 容器 boot 失败根因。
2. **R0 基建失败一次**：`isolated_postgres_database_not_ready:boot`·未达 prove 面·非红非绿·不入冲销账（件② 纪律「红不重跑冲销」指 prove 面红证据·基建 boot 失败重跑系环境修复非凑绿）。
3. **docs:check 本地红=并线态如实登记**：本树 cap 常量 2144（`7937bafa` 零触·§3-5 sanction 面零自改）·主线 tip `f417d8e7` 已带 sanction 2152——⛔merge 令下本地不可达「2146≤2152 绿」·红停解除以主线 sanction 为准（协调方 2026-10-14 明示「红停已解除」）·本读数非 §8「验收红不可修」新红（同因已登记·nail 并线自动消解·零就地处置）。
4. **门矩阵收窄**：协调方复跑清单四面（主门/docs:check/markers/diff 面）·卷 §2 全表未全跑（见四末注）。
5. **PASS 分母 30**（非简报 32）：§0.2-6 口径预留兑现·精确分母=改前 run 实测。

## 六、pins 零翻声明 + 卫生

- pins 十一值零翻：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · **actualSpendCny=null**。
- est live=0（三 run 全隔离容器·零宿主库直跑·零外呼）·0 Key 值·`.env*` ABSENT 双向记录·六枚 NUL 原值保留（§3-3）·产品码 0176/0186/0187 与生产五文件全零字节（§3-1）·`public-text-policy.mjs` 零自改（§3-5）·共享 SSOT 零触（§3-6）·⛔push⛔merge⛔force-push·commit=本卷落卷 commit（append 不洗·本分支 tip 亲证）。

## 附录·EXEC 收尾（2026-10-16·并线+P2×3+门矩阵补全·七字段承卷 §9-append-2·本附录为收据面镜像）

**授权链**：pre-exec 双审席1 `agent_85bd8012`+席2 `agent_e353817b` BOTH PASS（「可授权 EXEC·nail 时并主线 cap 2160 生效」·P2×3 修订随卷）→协调方 EXEC 授权（执行序=并线→P2×3→门矩阵补全→§9 EXEC 记录+commit）。
**并线**：`git merge --no-ff origin/feat/mysql-schema-skeleton@317ea3df`（merge-tree 预演 EXIT=0 零冲突·实并同零冲突·**冲突解=∅**·双亲 `6414c562`+`317ea3df`=merge **`f21e5d74`**·27 files +1814/−91·cap 2160 sanction 与链 204 头 0204 主线携入·⛔pull --rebase 未用）。
**届时 tip 重 pin（§8③·`f21e5d74` 实测）**：卷 §0.1 锚 sanctioned 面外全恒等——件① 改后夹具 `ad696c38`（641 行/47049 B/NUL=6·主线零触）·0187 `5eee1f56`·0176 `38c1ec22`·retrieval `2c5ed849`·principal `c31cbac0`·ci.yml `97252708`·qbank-generation.ts `b3f0e0c5` 全恒等；`public-text-policy.mjs` `7937bafa`→`3015b893`（cap 2160 sanction 随并·§3-5 零自改兑现）；迁移链 203 头 0203→**204 头 0204**（主线携入·本刀零迁移零 DDL 兑现）。

**门矩阵补全终值（并线树 `f21e5d74` EXEC 席亲跑·EXIT 原值）**：

| # | 门 | 实测 | EXIT |
|---|---|---|---|
| 1 | `rag-generation:prove`（主门·复跑维持） | **40 臂全 PASS**（两 run 均 EXIT=0·首 run log 截断复跑全量捕获·证据补全非 retry·偏离①） | 0 |
| 2 | `qbank-control-sec:prove` | 26 断言全绿 | 0 |
| 3 | `qbank-control-role:prove` | 12 PASS | 0 |
| 4 | `qbank-handoff-closure:prove` | 16/16 | 0 |
| 5 | `dbhy1:prove` | 28 断言全绿 | 0 |
| 6 | `ag39-org-qbank:prove` | 53 臂全 PASS ALL GREEN（卷面 50 系旧值·proof 双树零字节=臂数恒等·§2 实测条款·非漂移） | 0 |
| 7 | `rag03-filter-locus:prove` | 12 PASS 全绿 | 0 |
| 8 | `rag03-hnsw-completeness:prove` | 16 PASS 全绿 | 0 |
| 9 | `rag03c-exactk-observe:prove` | 7 PASS 全绿 | 0 |
| 10 | `rag04-track-local:prove` | 33 PASS 全绿 | 0 |
| 11 | `qbank-integrity-upgrade:prove` | **EXIT=1 承登基线红（§2-3·非新红非阻塞）**：`column "owner_kind" does not exist`@retrieval`:285`←proof`:261`←principal`:997`·**基线树 `bab69561` 临时 worktree 对照实跑同红同签名亲证**（对照后拆除）·proof/retrieval 双树零触+并线窗 src diff 零交叠=零因果 | 1（承登） |
| 12 | `qbank-corpus-retrieve:prove` | 37 PASS 全绿（ag39 时代承登红实测转绿·主线收敛如实记） | 0 |
| 13 | `neg:all` | **687/687**（90+90+91+102+179+135·零 FAIL·对基线恒等） | 0 |
| 14 | `interview:prove` | **57 PASS** | 0 |
| 15 | `migrate:prove` | 全 PASS（123 断言）·链 **204 头 0204** | 0 |
| 16 | `drift:prove` | `✓ schema 无漂移`（豁免 2 项 0145 恒等·runner cwd 缺陷首跑未达门面已重跑·偏离③） | 0 |
| 17 | uniqueness | `files=204 violations=0 exemptions=0143,0152,0160` | 0 |
| 18 | typecheck | `--force` 8/8·0 cached | 0 |
| 19 | lint | `--force` 12/12·0 cached·五值恰等 web 601/root 5235/api 1421/worker 954/ai-runtime 628（0 errors） | 0 |
| 20 | `docs:check` | **scanned 2153≤cap 2160 EXIT=0**（P2-b 实测真值兑现·「2146」预写作废·余量 7） | 0 |
| 21 | markers 五类 | 改动集运行时组装词面零命中（i6-239 canonical 形） | 0 |
| 22 | diff 面机检 | 对 `317ea3df` 恰 3 tracked=件① .ts（+1/−0）+本卷 .md+收据 .md；tsbuildinfo 副产已 checkout 回滚（§2-12②） | 0 |
| 23 | 卫生 | est live=0·0 Key·真 `.env*` ABSENT（tracked 仅 docker/env/*.env.example 四模板主线既有）·`actualSpendCny=null` | 0 |

**门 11 与 CI 红非同面声明**：integrity-upgrade 红=legacy 夹具 owner 列缺位（`owner_kind does not exist`）·CI run `38728371250` step 71 红=directSqlBoundary owner GUC 缺供给（`qbank_retrieval_scope_missing`）——两红机制异源·后者已由件① 翻绿·前者系 ag39 EXEC「基线红三处单列」承登面（签名随主线演进如实记）。
**偏离清单（EXEC 期五项）**：①主门复跑两 run（log 截断补捕获·均 EXIT=0）；②ag39 臂数 53 对卷 50（双树零字节·实测条款）；③drift 首跑 runner cwd 缺陷（仓外目录未达门面）→仓根重跑 EXIT=0；④承登对照走临时 worktree@bab69561 实跑后拆除；⑤双审席验证 run 收据一帧（`.tmp/…16-12-09…json` EXIT=0·非本席账）。
**pins 零翻**：十一值恒等（§六）·est live=0 维持（EXEC 期全隔离容器/只读检查·零外呼）·**STOP=`executed:awaiting_post_prove_dual`**（post 双审两外席待派·nail/行翻面归协调方·alone≠dual·⛔push）。
