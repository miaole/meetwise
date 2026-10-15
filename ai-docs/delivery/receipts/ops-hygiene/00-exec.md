# OPS-HYGIENE EXEC 收据 · 00 · 2026-10-14 · 基建卫生小刀两件（#93 件① 落码+#95 件② 验证）· 七字段

授权链=协调方派单 brief→d8d03769 起草→pre-exec 双审会签 PASS（席1 agent_1d94c312+席2 agent_81ad61ca）→协调方 EXEC 授权（重派席·前席 quota 中途死·遗留并线 merge 与件① 未暂存 diff 经逐字亲证后收编，见偏离清单 D1）→本收据。基线=merge `f8edb071`（双亲 `d8d03769`+`109e3eb1`=origin tip 亲证）· 收据对应 commit=本卷落卷 commit（§9）· est live=0 · ⛔push。

## 字段一：门矩阵十一门全表（基 `f8edb071`·件① 在工作树状态实测·全绿）

| # | 门 | 实测 | EXIT |
|---|---|---|---|
| 1 | 件① 静态机检 | `rg -n '^ENV APP_REVISION=\$VCS_REF$' Dockerfile` 恰 1 命中=**:27**（>`:19` ARG·<`:34` USER app）·`^LABEL org.opencontainers.image.revision=` 恒 1·`^ENV ` 全镜像恰 2（`:24` NODE_ENV+`:27` 本刀） | 0 |
| 2 | 件① 构建运行时证明（docker 29.1.3 在场） | build（`--build-arg VCS_REF=$sha`+`SOURCE_TREE=$tree`·`-t meetwise-ops-probe`）EXIT=0→容器内 `process.env.APP_REVISION` stdout 恰=`$sha`+`docker inspect` LABEL 恒=`$sha`（双写双读数·见字段四）→`docker rmi` 探毕即删 | build 0 / run 0 / inspect 0 |
| 3 | 件② 语法门 | `bash -n ops/deploy/remote-deploy.sh` EXIT=0 | 0 |
| 4 | 件② 语义在场机检 | `^set -euo pipefail$`=:13·`^trap restore_and_fail ERR$`=:47·`rg -c 'exit 1'`=**1**（含 `:45`）·`^trap - ERR$`=:75·blob `git hash-object`=**`8fe96da2`** 恒等（零字节改） | 0 |
| 5 | 邻面不回退（五 blob 届时重算） | `apps/web/Dockerfile`=`d04dfcb5`·`deploy.yml`=`42f67f31`·`ci.yml`=`4cfa1ed3`·`version.ts`=`8152cd63`·`health.controller.ts`=`abe2c7b2`——五 blob 与起草卷逐条恒等零漂移 | 0 |
| 6 | migrate 链 | `pnpm migrate:prove` `✓ 迁移运行器 全部通过`·链 **202** 头 **`0202_interview_event_kind_score_card_written.sql`**·uniqueness `files=202 violations=0 exemptions=0143,0152,0160` | 0 / 0 |
| 7 | typecheck | `pnpm turbo typecheck --force`=`Tasks: 8 successful, 8 total`·`Cached: 0 cached, 8 total` | 0 |
| 8 | lint 五值恰等 | `pnpm turbo lint` 12/12 包 EXIT=0 全 0 errors·web **601**≤601·root **5235**≤5235·api **1421**≤1421·worker **954**≤954·ai-runtime **628**≤628（恰等零翻转零第三红） | 0 |
| 9 | docs:check | `node scripts/ai-docs/check-docs.mjs` EXIT=0·并前实测 `scanned 2134`≤cap **2136**（§0.1 重 pin 值·`cc90574e:75`）·终值含本收据 +1=**2135**≤2136（`ls-files --others` 口径入扫·落卷后终跑见 §9） | 0 |
| 10 | markers 五类 | 双法：①策略引擎本体 `scanPublicTextPolicy`（`public-text-policy.mjs:335` 导出）对改动集 3 件定向扫描 `violations=0`；②标记词面运行时组装（自策略源码提取 11 ZH 署名构式+6 code host+3 local-path 标记=20 面·`/tmp` 中转·词面不入卷不入收据）grep 改动集全行（tracked diff `^+`+收据全文）=**零命中**（EXIT=1）·沿 i6-239 §2-7/perfload-env-fix 收据门 9 同形制 | 0（零命中） |
| 11 | diff 面机检+卫生 | `git diff --numstat f8edb071` tracked 恰 **2** 路径=`Dockerfile`（+3/0−）+本卷 .md·收据目录 untracked·`pnpm install --frozen-lockfile` EXIT=0·`.env*` ABSENT 双向（git status 零 .env 面+工作树无新增 .env）·`actualSpendCny=null`·零模型外呼 est live=0 | 0 |

typecheck 门运行副效应：`apps/web/tsconfig.tsbuildinfo`（tracked 增量构建状态件）被翻动→`git checkout` 回滚基线（negbend-fix §9 先例形）·门 11 恰 2 路径保持。

## 字段二：EXIT 原值登记

- 门 2：`docker build` EXIT=0（后台全量日志 `/tmp/ops-hygiene-probe-build.log`·末行 `BUILD_EXIT=0`）·`docker run` EXIT=0·`docker inspect` EXIT=0·`docker rmi` EXIT=0。
- 门 3 `bash -n` EXIT=0；门 4 四点 rg 全命中 EXIT=0；门 6 `migrate:prove` EXIT=0 + uniqueness EXIT=0；门 7 typecheck EXIT=0；门 8 lint EXIT=0；门 9 docs:check EXIT=0；门 11 `pnpm install --frozen-lockfile` EXIT=0。

## 字段三：件① diff numstat（对基 `f8edb071`）

```
3	0	Dockerfile
```

- `:25` `# 构建标识双写：LABEL 供镜像层审计（docker inspect 可读），ENV 供运行时 /meta.revision 读取（ADR-0022 §4）。`
- `:26` `# VCS_REF 由 deploy.yml/ci.yml --build-arg 传入 git sha；无 --build-arg 的本地构建回退 ARG 默认值 unknown。`
- `:27` `ENV APP_REVISION=$VCS_REF`（**逐字=§1-修法件① 固定行**）
- 工作树 post-edit blob=`34f84823`（pre-edit 基线 blob=`1ebc93e4` 与起草锚恒等亲证）。

## 字段四：传递链六节实测读数（门 2·#93 闭合实质）

传递链：deploy.yml`:48` `git rev-parse HEAD` → `:52/:54` `--build-arg VCS_REF/SOURCE_TREE` → Dockerfile`:19` `ARG VCS_REF=unknown` → **`:27` `ENV APP_REVISION=$VCS_REF`（本刀补环）** → 容器 env → `version.ts:10` 读 `process.env.APP_REVISION` → `health.controller.ts:63` `/meta.revision`。

- 传值：`VCS_REF=f8edb0712db06729a995959fc975e0d649b96ae3`（=门 2 执行时 `git rev-parse HEAD`·`SOURCE_TREE` 同法传 tree）。
- 探针 stdout（容器内 `node -e 'console.log(process.env.APP_REVISION)'`）= **`f8edb0712db06729a995959fc975e0d649b96ae3`**（恰等传值）。
- `docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}'` = **`f8edb0712db06729a995959fc975e0d649b96ae3`**（恰等传值·LABEL 双写保持）。
- 判定：双读数==传值·「机制不满足」停止条件未触·ENV 注入断环已闭。
- 探针镜像=`meetwise-ops-probe` 仅本地·探毕 `docker rmi` 删除·Ban push 遵守。

## 字段五：§0 全量重 pin 表（EXEC 立项 @`f8edb071`·`git hash-object` 逐条复算）

| §0.1 锚 | 起草 blob @`7bc8ffaa` | 重 pin @`f8edb071` | 判定 |
|---|---|---|---|
| `apps/api/src/version.ts` | `8152cd63` | `8152cd63`·`:9-:10` 行锚零漂 | 恒等 |
| `Dockerfile` | `1ebc93e4`（36 行） | `1ebc93e4`（merge 树·件① pre-edit）·`:19/:20/:21-22/:24` 行锚零漂 | 恒等 |
| `apps/api/src/modules/health/health.controller.ts` | `abe2c7b2` | `abe2c7b2`·`:59-:63` 零漂 | 恒等 |
| `.github/workflows/deploy.yml` | `42f67f31` | `42f67f31`·`:48/:49/:52-54/:100-101` 零漂 | 恒等 |
| `.github/workflows/ci.yml` | `4cfa1ed3` | `4cfa1ed3`·`:149-:150` 零漂 | 恒等 |
| `ops/deploy/remote-deploy.sh` | `8fe96da2` | `8fe96da2`·`:13/:39-46/:45/:47/:72/:75` 零漂 | 恒等 |
| `apps/web/Dockerfile` | `d04dfcb5` | `d04dfcb5`·`:19-:24` 零漂 | 恒等 |
| `ai-docs/architecture/adr/0022-app-versioning-release.md` | `30dce003` | `30dce003`·`:51-:53` 零漂 | 恒等 |
| `scripts/ai-docs/public-text-policy.mjs` | `dc9da5bd`（cap 2128·`:67`） | **`cc90574e`**·MAX_FILES=**2_136** 在 **`:75`** | **漂移·如实改锚**（perfload-env-fix nail `45fb6196` cap sanction 2128→2136 随并线携入·门 9 cap=2136·双审 P2 预记行 `:70` 实测 `:75`·纯行号漂移结论零变·见偏离 D2） |
| `packages/db/migrations/` | 202·头 0202 | 202·头 `0202_interview_event_kind_score_card_written.sql` | 恒等（零迁移·§0.3 预期零兑现） |
| **增补锚（双审 P2·第三消费者）** | — | `docker/env/api.env.example`=`3d7d2b2f`·`:4-:5` `APP_VERSION=`/`APP_REVISION=`（注释行 `:3` 自引 ADR-0022·「当前未接线，恒为 dev」措辞一并陈旧·见附注 B） | 增补（非漂移） |

§0.0 防重双对表重跑：`git branch --list "line/ops*"` 恰 1 命中=`line/ops-hygiene`；在飞交叠复核=全 branch 集（`line/ops-hygiene` 外逐一）`git log <branch> -1 -- Dockerfile`+`merge-base --is-ancestor` 扫描·**零命中**（无任何分支顶对 `Dockerfile` 存在 `7bc8ffaa` 后新增提交）→「现场漂移」停止条件未触。

## 字段六：偏离清单（3 条·全登记不动手外扩）

- **D1（协调方简报漂移·前席遗留收编）**：派单载「前席被配额杀·未落任何码」——实况=①并线 merge **`f8edb071` 已由前席落卷**（双亲 `d8d03769`+`109e3eb1` 亲证·`merge-base --is-ancestor` 双向 PASS·merge message 授权链与本席派单一致·⛔pull --rebase 未用·零冲突）；②**件① 3 行以未暂存 diff 形在场**（逐字对照 §1-修法件① 固定行+注释内容要件双写语义/构建链来源/ADR-0022 §4 引用全命中）。处置：merge 重跑=`Already up to date` 无意义→亲证后收编不再重做；件① diff 逐字亲证后收编进本刀 commit。非本席新码·零外扩。
- **D2（双审 P2 行锚预记 vs 实测）**：双审 P2 预记 `public-text-policy.mjs` 行 `:67`→`:70`——实测 **`:75`**（blob 同步 `dc9da5bd`→`cc90574e`·cap 2136 机制结论零变）。按 §0 协议「行号漂移如实改锚·结论不变则只更行号」处置·§2 门 9 cap 按 2136 实跑·非停止条件（现场漂移以「结论受疑」为门槛·本漂移结论零受疑）。
- **D3（门 2 执行时点）**：探针传值 sha=门 2 执行时 `git rev-parse HEAD`=`f8edb071`（§2-2 字面口径·本刀 commit 落卷前的届时 HEAD）——最终 EXEC commit sha 必然≠该值（收据/§9 落卷使 HEAD 前进）。机制证明与具体 sha 值无关（部署链 deploy.yml 届时同样传届时 HEAD）·如实登记不计红。

## 附注 A（双审 P2·件① 收据附注·措辞陈旧三处登记）

「无 `--build-arg` 本地构建→`/meta.revision`='unknown' 非 'dev'」语义钉死：本刀后 `revision` 臂=有 `--build-arg`（deploy.yml/ci.yml 生产路径）→git sha；无 `--build-arg`（本地裸 `docker build`）→ARG 默认 **`unknown`**；唯 `APP_VERSION` 维持 `'dev'` 回退（semver 归 release 链刀·§1.3 候选丙）。据此事实，以下三处现树措辞对 `revision` 臂已陈旧（均零触面·如实登记不动手）：

1. `apps/api/src/version.ts:4-:6`（`8152cd63`）——「当前部署管线尚未把 git tag 写入这两个变量…故 `/meta` 现恒为 `dev`」：对 `revision` 臂已不成立（本刀接线）·对 `version` 臂仍成立。
2. `apps/api/src/modules/health/health.controller.ts:59`（`abe2c7b2`）——「当前管线尚未注入，故恒为 dev」：`revision` 臂已注入（sha/unknown）·`version` 臂仍 dev。
3. `ai-docs/architecture/adr/0022-app-versioning-release.md:53`（`30dce003`）——「当前部署管线尚未把 git tag 写入这两个变量…`/meta` 现恒为 `dev`」：同 1·且本刀未触 ADR（零改面）。

三处更辞权归后继刀/协调方（均 §3 零触面：1/2=§3-3·3=AUD 索引面）·本刀仅登记。

## 附注 B（双审 P2·/meta 暴露域登记）

`/meta`（`health.controller.ts:61` `@Get('meta')`·**零 Guard**：控制器无 `@UseGuards`·`main.ts`/`app.module.ts` 零 `APP_GUARD` 全局守卫命中）返回 `{name,version,revision}` 构建元数据。当前暴露域=**loopback+tailnet**（部署拓扑·双审席亲证口径）·零公网直暴。**仓转公开须重评**本暴露域（构建 sha 公开非敏感但暴露面变化须走协调方裁决）·登记为 P2 后继观察项·本刀零处置。

## 字段七：pins 零翻声明

十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。§0.2 两件漂移结论/§1.3 候选裁决/§5 Ban/§8 停止条件/§1-修法件① 唯一码改面——零改。

---

*OPS-HYGIENE EXEC 收据 00 · 2026-10-14 · STOP=`executed:awaiting_post_prove_dual`（§9）· est live=0 · markers=0 · ⛔push*
