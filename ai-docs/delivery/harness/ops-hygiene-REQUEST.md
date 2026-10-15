# OPS-HYGIENE REQUEST — 基建卫生小刀两件（#93 运行时版本可观测性=镜像 ENV 注入补环·#95 部署失败 trap 语义亲证钉死零码改）· ops-hygiene 战役 · 起草落卷即停

**Status**: **`draft:awaiting_pre_exec_dual`**（起草即停 · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT · ⛔push）

**席位**：ops-hygiene 起草席（诊断+起草双责·协调方派单 brief 2026-10-14·两件 #93/#95 指派+裁决方向随派）。
**基线**：`feat/mysql-schema-skeleton` @ `7bc8ffaa`（origin tip 亲证·fetch 后 `git worktree add ../meetwise-ops -b line/ops-hygiene feat/mysql-schema-skeleton` 亲立·HEAD 落 `7bc8ffaa` 亲证）· 分支 `line/ops-hygiene`（建前 `git branch --list "line/ops*"` 零命中）· 工作树 `meetwise-ops`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（5C 批余项两件·批表本体主树检索零命中亲证 `rg -rln "ops-hygiene|基建卫生" .tmp/ ai-docs/delivery/harness/`=∅→**以本卷 §0 亲证现场为基**·简报漂移按 §0.2 如实登记）；②结构范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8 形制+§0.2 漂移登记先例）；③`ai-docs/architecture/adr/0022-app-versioning-release.md`（`30dce003`·§4 :51-53 /meta 环境注入裁决本体）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`7bc8ffaa`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git branch --list "line/ops*"` 建后恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg ops-hygiene` 落卷前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀唯一产品触面=`Dockerfile`（仓根·现 blob `1ebc93e4`·末次产品变更=`4f4ad300` 2026-08-20 已在主线）。届时对各在飞分支执行 `git log <branch> -1 -- Dockerfile` 逐树复核，任一分支顶对该文件存在主线 `7bc8ffaa` 之后的新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`7bc8ffaa`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/src/version.ts` | `8152cd63`（10 行） | **`:9` `APP_VERSION = process.env.APP_VERSION ?? 'dev'`·`:10` `APP_REVISION = process.env.APP_REVISION ?? process.env.GIT_SHA ?? 'dev'`——读 env 形已在场且合规（12-factor·文件头 :4-:7 注释+ADR-0022 §4 双自证）·零改面** |
| `Dockerfile`（仓根·api/worker 生产镜像） | `1ebc93e4`（36 行） | **`:19` `ARG VCS_REF=unknown`（runtime stage）·`:20` `ARG SOURCE_TREE=unknown`·`:21-:22` `LABEL org.opencontainers.image.revision=$VCS_REF`+`io.meetwise.source-tree=$SOURCE_TREE`·`:24` 全镜像唯一 `ENV NODE_ENV=production`（rg 亲证 `^ENV ` 恰 1 命中）——ARG→LABEL 单写·零 `APP_*` ENV=本刀修法点** |
| `apps/api/src/modules/health/health.controller.ts` | `abe2c7b2` | **`:59-:63` `/meta` 探针（`:63` `return { name, version: APP_VERSION, revision: APP_REVISION }`·注释自证「当前管线尚未注入，故恒为 dev」）——消费点·零改面** |
| `.github/workflows/deploy.yml` | `42f67f31` | **`:48` `sha="$(git rev-parse HEAD)"`·`:49` `tree="$(git rev-parse HEAD^{tree})"`·`:52-:54` `--build-arg "VCS_REF=$sha" --build-arg "SOURCE_TREE=$tree"` 双镜像构建·`:100-:101` `ssh meetwise-ecs 'bash -s --' < ops/deploy/remote-deploy.sh`（ssh 退码=脚本退码·部署红绿传播通道）——构建参数传递链上游已就绪·零改面** |
| `.github/workflows/ci.yml` | `4cfa1ed3` | `:149-:150` CI 同形 build-arg 双传——链一致性旁证·零改面 |
| `ops/deploy/remote-deploy.sh` | `8fe96da2`（77 行） | **`:13` `set -euo pipefail`·`:39-:46` `restore_and_fail()`（`:41` .env 快照回滚·`:43` 上一版重拉（失败仅告警仍走 :45）·`:45` `exit 1`）·`:47` `trap restore_and_fail ERR`·`:72` `dc up --wait`（最后失败窗）·`:75` `trap - ERR`（成功解除）——失败语义=中断回滚 已在场** |
| `apps/web/Dockerfile` | `d04dfcb5` | `:19-:24` 同形 ARG/LABEL（run stage）——**零触面登记：rg 全树 `APP_VERSION|APP_REVISION` 消费者仅 apps/api 两文件亲证·web 无运行时读取者·注入即空转（§3-1）** |
| `ai-docs/architecture/adr/0022-app-versioning-release.md` | `30dce003` | **`:51-53` §4：`version` 读 `APP_VERSION`、`revision` 读 `APP_REVISION`/`GIT_SHA`·「当前部署管线尚未把 git tag 写入这两个变量…尚未接线」·「刻意不读文件系统取版本…以环境注入为准」——修法裁决权源** |
| `scripts/ai-docs/public-text-policy.mjs` | `dc9da5bd` | `:67` `MAX_FILES = 2_128`（cap 2120→2128 注释块自证 sanction 链）——docs:check 门 cap 锚 |
| `packages/db/migrations/` | —（目录实测） | `ls \| wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`——迁移链锚（预期零迁移） |

### 0.2 派单简报漂移登记（两件全登·结论处理沿 negbend-fix §0.2 先例）

1. **#93 路径漂移**：简报载 `packages/db/src/version.ts:9`——**该路径全历史零存在**（`git log --all --oneline --diff-filter=A -- packages/db/src/version.ts`=∅ 亲证）；实况=`apps/api/src/version.ts`（`8152cd63`·自 `e29e797c` ADR-0021 落地起常驻 apps/api/src）。机制事实（`?? 'dev'` 回退+Dockerfile VCS_REF 仅 LABEL）与简报一致，仅路径错记→**如实改锚·方向维持**。
2. **#95 前提不成立（关键漂移）**：简报载「仅 `trap ERR` 记录不退出·失败部署可静默继续」——实况 `restore_and_fail()` **`:45` `exit 1` 在场**（`git blame -L 45` 亲证=`ed128830` 2026-08-21 文件初版即有·全历史仅 2 commit 触及该文件·从未存在过无 exit 形）。回滚语义（.env 快照还原+上一版重拉）+非零退出+ssh 退码传播（deploy.yml :100）三环齐备→「失败部署静默继续」通道不存在。**#95 由「trap 处理器补 exit 1 码改」降格为「验证门+失败语义文书钉死」·零码改**（§1-修法件②）。按简报盲补 `exit 1` 即伪造工作项+diff 污染（候选乙·§1.3 否决 Ban）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`。本刀修法=镜像元数据层+docs·**预期零迁移零 DDL**。EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**，认领号=对届时主线链顶亲数后取最小未占号顺延·Ban 抢号 Ban 私占。

## §1 红事实（机制链·全部亲证）

### 1.1 #93 运行时版本可观测性缺口（ARG→ENV 断环）

- 断环链五节亲证：①`version.ts:10` 读 `process.env.APP_REVISION`（12-factor 注入形·合规）；②容器 env 无注入源——`Dockerfile:19` ARG 仅被 `:21` LABEL 消费，**LABEL=镜像配置元数据（`docker inspect` 可读），不进容器运行时 env**；`:24` 全镜像唯一 ENV=`NODE_ENV`；③故 `/meta`（`health.controller.ts:63`）线上恒 `revision:'dev'`；④ADR-0022 §4 :53 自证「尚未接线」状态（卷面诚实措辞·非实现宣称）；⑤**构建参数传递链上游已就绪**：deploy.yml `:48` sha → `:52` `--build-arg VCS_REF=$sha` → Dockerfile `:19` ARG——唯一缺环=ARG→ENV 一跳。修法即补此一跳，CI/构建链零改。
- 副效应登记：增 ENV 行=镜像层变化→同 sha 重建产生新摘要——部署链本以新摘要为准（deploy.yml :56-:58 digest 提取）·零 .env 语义变化·预期非红。

### 1.2 #95 部署脚本失败语义（亲证钉死·零缺口）

- 失败语义裁决=**中断回滚**（维持现状·不采纳快速失败改形）：`:13` `set -euo pipefail` 下，`:47-:75` 窗内任一简单命令非零（含 `:59` pull/`:66` migrate/`:72` up --wait）→ `:47` trap 触发 `restore_and_fail`：`:41` 还原 .env 镜像行快照→`:43` 旧版重拉起→`:45` `exit 1`→ssh 退码传播→GHA job 红。回滚自身失败仍退非零（`:43` `|| echo` 仅降级告警·`exit 1` 不被吞）。成功路径 `:75` 先解除 trap 再清理快照。设计前提自证（文件头 :5-:7）：4G 单机 ECS·持久卷·迁移幂等——中断回滚是**既定设计**而非缺陷。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **#93 候选甲（采纳）=保持 LABEL+补 ENV 双写**：`ENV APP_REVISION=$VCS_REF` 单行（ARG 同 stage 可被 ENV 引用·构建期固化·运行时仍可 `docker run -e` 覆盖）——LABEL 供镜像层审计（deploy.yml digest 侧既有事实）·ENV 供运行时可观测，双写各司其职；构建链/CI 零改。
- **#93 候选乙（否决·Ban）=version.ts 改读文件系统取版本**：ADR-0022 §4 :53 明文禁止（cwd/__dirname 在 monorepo 打包与多进程下歧义·以环境注入为准）。
- **#93 候选丙（否决·Ban）=同时注入 `APP_VERSION` semver**：semver 唯一来源=release tag 链（ADR-0022 §3/§5·`scripts/release.mjs`+`release.yml`）·部署构建无 tag 可读源（deploy.yml 只传 sha+tree 亲证）·硬造即撒谎——**version 维持 `'dev'` 回退直至 release 链接线·后继刀域如实登记（§3-6）·本刀闭合面=revision**。
- **#95 候选甲（采纳）=零码改+验证门+语义文书钉死**（§1-修法件②）。
- **#95 候选乙（否决·Ban）=按简报补 `exit 1`**：`:45` 已在场（§0.2-2 亲证）·补写即伪造工作项。
- **#95 候选丙（否决·Ban）=改快速失败语义（去回滚直退）**：推翻文件头自证设计·爆炸半径=迁移后旧版不重拉（服务中断窗）·无派单授权。

## §1-修法（预期恰 1 产品文件·+1 ENV 行±注释·零迁移零 TS 触面）

- **件①（#93·唯一码改）**：`Dockerfile` runtime stage `:24` `ENV NODE_ENV=production` 行后新增——`ENV APP_REVISION=$VCS_REF`（**此行逐字固定**）+1-2 行注释（内容要件：双写语义=LABEL 审计/ENV 运行时·构建链来源=deploy.yml --build-arg VCS_REF=git sha·ADR-0022 §4 引用）。**diff 预期=恰 1 文件 +2~+3 行·其余 tracked 树零改**。传递链文书（入收据）：deploy.yml:48 `git rev-parse HEAD` → :52 `--build-arg VCS_REF` → Dockerfile:19 ARG → 新增 ENV → 容器 env → version.ts:10 读 → health.controller.ts:63 `/meta.revision`。
- **件②（#95·验证only·零码改）**：`ops/deploy/remote-deploy.sh` blob 全等保持（`8fe96da2`·零字节改）+三断言机检（§2 门 4）+失败语义「中断回滚」文书随收据落卷（§1.2 逐环引 line 号）。
- **件③（收据）**：`ai-docs/delivery/receipts/ops-hygiene/00-exec.md`——七字段（门矩阵全表+EXIT 原值+件① diff numstat+传递链六节实测读数（探针 stdout/LABEL 双读数）+重 pin 全表+偏离清单+pins 零翻声明）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十一门·数字口径以实跑实测为准+偏差熔断）

1. **件① 静态机检**：`rg -n '^ENV APP_REVISION=\$VCS_REF$' Dockerfile` 恰 1 命中·其行号 > `rg -n '^ARG VCS_REF=' Dockerfile` 行号（现 19）·且位于 `:31 USER app` 之前；`rg -n '^LABEL org.opencontainers.image.revision=' Dockerfile` 恒 1（LABEL 双写保持）。
2. **件① 构建运行时证明（必做·本门即 #93 闭合实质）**：`sha=$(git rev-parse HEAD)` 后 `docker build --build-arg "VCS_REF=$sha" --build-arg "SOURCE_TREE=$(git rev-parse HEAD^{tree})" -t meetwise-ops-probe -f Dockerfile .`（EXIT=0·构建含容器内 pnpm install·数分钟属常态非红）→ `docker run --rm meetwise-ops-probe node -e 'console.log(process.env.APP_REVISION)'` stdout **恰=`$sha`**；`docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' meetwise-ops-probe` **恒=`$sha`**（双写双读数）；探毕 `docker rmi meetwise-ops-probe`。docker daemon 缺席→停（验收红不可修类）上报·Ban 以门 1 静态凑数关闭 #93。
3. **件② 语法门**：`bash -n ops/deploy/remote-deploy.sh` EXIT=0。
4. **件② 语义在场机检**：`rg -n '^set -euo pipefail$' ops/deploy/remote-deploy.sh`=13·`rg -n '^trap restore_and_fail ERR$'`=47·`rg -c 'exit 1'`≥1（含 `:45`）·`rg -n '^trap - ERR$'`=75；`git hash-object ops/deploy/remote-deploy.sh` 恒=`8fe96da2`（届时重算恒等）。
5. **邻面不回退**：apps/web/Dockerfile blob 恒=`d04dfcb5`·两 workflow（`42f67f31`/`4cfa1ed3`）恒等·version.ts（`8152cd63`）/health.controller.ts（`abe2c7b2`）恒等——五 blob 届时重算零漂移。
6. **migrate 链**：`pnpm migrate:prove` EXIT=0·链 202 头 0202（届时顺延如实记）+`node scripts/check-migration-version-uniqueness.mjs`→`files=202 violations=0`（files 对届时链顶亲数·violations 恒 0）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径·届时实测记·Dockerfile 非 TS 触面·此门证零扰动）。
8. **lint 五值恰等**：`pnpm turbo lint` 全包 0 errors 且 warning 实测恰等预算：web 601≤601·root 5235≤5235·api 1421≤1421·worker 954≤954·ai-runtime 628≤628（预算零翻转·第三面新红即停）。
9. **docs:check ≤cap 2128 红停**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·现值 2124 本树亲跑·本卷落卷后 2125·EXEC 加收据后≈2126（`ls-files --others` 口径入扫）·**>2128 红停上报**。
10. **markers 五类零命中**：本刀改动集（本卷 1 .md+Dockerfile 新增行+收据）对策略五码族 grep 零命中（ATTRIBUTION_ZH/ATTRIBUTION_EN/CODE_HOST_URL/NEEDS_REVIEW/LOCAL_PATH——`public-text-policy.mjs` POLICY_RULES 五码·词面不复抄卷内防自匹配·命令与回执入收据）。
11. **diff 面机检+卫生**：`git diff --numstat <base>` 恰 2 tracked 路径=`Dockerfile`+本卷 .md（+收据目录 untracked）·多任何 tracked 路径即停（越界需要类）；`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（est live=0）。

## §3 范围外（边界清单·越界即 FAIL）

1. **web 镜像零触**：`apps/web/Dockerfile` ARG/LABEL 面零改——全树零 `APP_*` 运行时读取者（rg 亲证）·注入即空转；web 版本可观测若有诉求归协调方另裁。
2. **remote-deploy.sh 零触**：件② 验证only（§0.2-2·候选乙丙否决）·零字节改。
3. **version.ts/health.controller.ts 零触**：读 env 形合规在场（§1.1-①）·断言改形/读取改形均 Ban。
4. **构建链零触**：deploy.yml/ci.yml 零改（build-arg 双传已在场亲证·§0.1）。
5. **release 链零触**：`scripts/release.mjs`/`release.yml`/tag→`APP_VERSION` semver 接线=后继刀域（§1.3 候选丙）·本刀零涉。
6. **ha-dual 面零触**：`docker/Dockerfile.ha-dual` 系本地 HA 壳（bind-mount·头部自证非生产摘要）·零 VCS_REF 消费·零改。
7. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——5C 批余项行翻面权归协调方。**零迁移零 DDL·零 CI/wrapper/runner 改·零依赖升级**。

## §4 依赖

**①上游已满足**：deploy.yml/ci.yml 构建参数链（`42f67f31`/`4cfa1ed3` 在链）=#93 修法前提；ADR-0022 accepted 在链=裁决权源；remote-deploy.sh 失败语义在场（`ed128830` 初版）=#95 验证前提。**②无同文件并发**：`Dockerfile` 末次产品变更=`4f4ad300`（已在主线）·在飞交叠复核规则=§0.0 第二条（EXEC 立项日必做）。**③迁移号**：§0.3 预期零。**④下游**：`/meta.revision` 可读=线上版本问询/回滚锚点（ADR-0022 背景-2「快速恢复第一步」）之前置；version（semver）臂仍 OPEN 归 release 链刀。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban 翻 pins（十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 就地扩面（§3 七项边界外任何 tracked 路径·web 镜像/构建链/release 链/ha-dual 零触）；Ban 触 remote-deploy.sh（件② 验证only·零字节）；Ban 改 version.ts/断言面（候选乙丙沿承）；Ban 硬造 `APP_VERSION` 注入（无 tag 源即撒谎）；Ban 以静态门凑数关闭 #93（门 2 构建运行时证明必做·daemon 缺席即停）；Ban 部署操作（本刀全离线本地·Ban 触 ECS/ACR/任何远端·探针镜像 Ban push 只 rmi）；Ban 迁移 Ban DDL（§0.3 预期零·需则停上报走认领规则）；Ban 改共享 SSOT；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（门矩阵为 EXEC 期义务·本 turn 仅静态诊断；EXEC 期 docker 探针构建为本地离线机作·零模型外呼·est live 仍=0）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·策略五码族词面不复抄卷内防自匹配——沿 negbend-fix/g7w 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §0.2 两件漂移结论与 §1.3 候选裁决与 §5 Ban/pins 与 §1-修法件① 唯一码改面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且本卷结论受疑（如 Dockerfile ARG/LABEL 形改写·remote-deploy.sh trap 形变更·version.ts 读 env 形改写·迁移链头≠0202 及其顺延失同步·§0.0 在飞分支对 `Dockerfile` 有新增提交）→停·重 pin 回炉。
- **机制不满足**：门 2 探针 stdout/LABEL 读数≠`--build-arg` 实传值（ENV 注入断环未闭/ARG 作用域漂移）→修法机制被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法件① 恰 1 文件面（需触 web 镜像/构建链/release 链/version.ts/remote-deploy.sh/迁移）→停·另刀或协调方裁决（§1.3 否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（migrate/typecheck 新红·lint 第三面红·docs:check>2128·docker daemon 缺席）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*OPS-HYGIENE REQUEST · 2026-10-14 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`7bc8ffaa` · 分支 `line/ops-hygiene` · 工作树 `meetwise-ops`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief（5C 批余项 #93/#95·批表本体未落树·以 §0 亲证现场为基）+negbend-fix 形制范本+ADR-0022 · **#93**=运行时版本可观测性缺口，机制=`/meta` 恒 dev 五节断环链（version.ts 读 env 合规·镜像 ARG→LABEL 单写·容器 env 零注入·ADR-0022 §4 自证未接线·构建链 build-arg 已就绪），修法=候选甲 LABEL+ENV 双写恰 1 文件 1 ENV 行（`ENV APP_REVISION=$VCS_REF` 逐字固定）·revision 臂闭合·version（semver）臂 OPEN 归 release 链刀 · **#95**=简报前提不成立（`restore_and_fail` `exit 1` 自初版 `ed128830` 在场·blame 亲证·「静默继续」通道不存在），裁决=失败语义钉死**中断回滚**+零码改验证门（bash -n+四点机检+blob 恒等 `8fe96da2`）·候选乙盲补/候选丙改快速失败均否决 Ban · 门矩阵十一门（静态机检+构建运行时证明+bash -n+blob 五锚恒等+migrate 链 202 头 0202+typecheck+lint 五值恰等+docs:check≤2128 红停+markers 五类+diff 面机检+卫生）· 迁移预期零（需则链顶顺延认领）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
