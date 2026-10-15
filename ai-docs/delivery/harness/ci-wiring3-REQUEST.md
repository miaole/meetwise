# CI-WIRING3 REQUEST — 主线五门接线刀（scoring-integrity/tokenstream/stress/uc003:i18n-locale 四门 per-push；件② lint 注释对表刷新已摘除·归属让渡 ci-red-clear；ha6:prove 亲证基线红登记不接线·恰 1 workflow 文件·docs-only 修订卷 rev3·ci-wiring3 战役·修订落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已落码落卷 2026-10-15 · 开工链=rev3 窄域复审 PASS `agent_7a80eab2`→协调方明示 EXEC 授权（立项前置=ci-red-clear 已 nail 并线 `0c06033d`）·并线 `1be05b4b`·件①③ 逐字节落码+件④ 收据·门矩阵 11 绿+**门 8 docs:check `PTP_FILE_LIMIT:2137>2136` 红=停止条件「验收红不可修」红停上报·cap 裁决权归协调方·本席零自修**（§9 EXEC 记录+收据 §9-1）·ha6 已重钉转绿登记不接线维持·⛔push · est live=0）

**席位**：ci-wiring3 REQUEST 起草席（诊断已由 CI 对账席在案·本席核验+起草·协调方派；rev2 修订席同席回炉）。
**基线**：`feat/mysql-schema-skeleton` @ `79382f4d`（fetch 后 origin tip 与本地恒等亲证·UC003-FOLLOWUP nail 收官 SSOT commit）· 分支 `line/ci-wiring3`（建前 `git branch --list "line/ci-wiring*"` 恰 `line/ci-wiring2` 一支·本席 `git worktree add ../meetwise-ciw3 -b line/ci-wiring3 feat/mysql-schema-skeleton` 亲立）· 工作树 `meetwise-ciw3`（仓根同级）。
**立项出处**：①CI 对账席对账结论（五门未上 CI 面清单+各门预算括注+stress 裁位二择一+ha6 预算先核条款+nightly-ciw2 非本刀面）；②本席亲证实测 @`79382f4d`（四门实跑绿+ha6 实跑红 50 PASS/**26 FAIL**（rev2 全卷勘误=复审席复测定值·§0.2-2）+时长四值+PASS 计数四值·§1 裁位矩阵）；③形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8+trailer·STOP 三条款+四类停止条件口径）+ 裁位判据先例 `ai-docs/delivery/harness/ci-wiring2-prove-placement.md`（三态口径 per-push/nightly-ciw2/零动作登记·点名件实测判据=单件本地实跑绿+时长预算内·`tokenstream:prove` 基线红登记「归后刀」即本刀）；④**rev2 处置=协调方裁决八项**（件② 摘除让渡/基线重锚 98-102/绝对预算/ha6 27→26 全卷勘误/§2-1 措辞/ha6-repin 锚重钉 `c38e6e22`/件③ 接线前置内联/EXEC 立项序写死）。

## §0 现状锚（起草席亲证 @`79382f4d`·rg/sed/Read/git hash-object/实跑逐条实测·**EXEC 立项照本节对届时 tip 再重 pin**——结论不变则只更行号/blob·**立项序=ci-red-clear 并线之后（§0.0）·届时全量重 pin**）

### 0.0 防重双对表 + 在飞交叠

- `git branch --list "line/ci-wiring*"` 建后恰 2 命中=`line/ci-wiring2`（已并线·EXEC `86303901` 在本基线历史）+本席 `line/ci-wiring3`；`ls ai-docs/delivery/harness/ | rg ci-wiring3` 建前零命中→落卷后唯一同名卷=本卷。
- **ci-red-clear 边界（rev2 改判·归属让渡登记）**：`git rev-parse line/ci-red-clear` =`b0877528`（rev2 复核亲证·**已非基线零 delta**——其 REQUEST 落卷于本基线之上·docs-only 恰 1 .md `git diff-tree` 亲证）·**rev3 pin 复核**：`b0877528` 已 amend 失效（is-ancestor 否证 exit=1 亲测）→`d056dd91`（amend 后起草落卷·处置席计值）·修订席落笔实测 tip=`d6ac92ed`（其上又并其 rev3 件⑤ egress 计数同步·docs-only 仍恰 1 .md 亲证）·活线届时值 EXEC 立项日复核·结论零变·在飞持 **PR #108 双红全上下文**·修法四件 verbatim EXEC-ready·与本刀交叠两面亲证：④lint 基线注释五值+root 对表（=原本刀件② 同一注释块 ci.yml `:103-:106`）+③breaker:prove 僵尸步删步（`ci.yml:193-:194` 恰删两行·步名「模型熔断器…」`sed` 亲证）。**协调方 rev2 裁决=件② 摘除·归属让渡 ci-red-clear**（其刀持双红全上下文+verbatim 块 EXEC-ready·同一注释块 Ban 双写）——本刀 §1-修法件② 撤出（§5 让渡 Ban 承载）。
- **EXEC 立项序写死（rev2·铁证）**：GitHub Actions `ci` workflow **近 300 跑零绿**（协调方 pre-exec 铁证在案）→主线红线未清偿前 Ban 本刀立项。**本刀 EXEC 须在 ci-red-clear 并线之后立项**：EXEC 立项日复核 `git merge-base --is-ancestor line/ci-red-clear <届时 tip>`（或 `git log -1 line/ci-red-clear` 已含其 EXEC 落码 commit 且为本刀 tip 祖先）=并线确认·未并线→触停止条件「越界需要」停手上报；并线后按 §0 对届时 tip 全量重 pin（ci.yml 锚位 `:194` 后整体 −2 平移·steps 99→98·§0.1）。
- **ha6-repin 在飞交叠**：`line/ha6-repin` 锚 rev2 重钉 `a5317ffd`→**`c38e6e22`**（协调方裁决登记·该分支 tip 后续位移按本条 EXEC 日复核规则处理）·**零 ci.yml 新触结论 rev2 亲证不变**（`git log 79382f4d..line/ha6-repin -- .github/workflows/ci.yml` 恰 **0** 命中）·其修法面=恰 1 治理脚本 `scripts/ha/ha6-companion.proof.mjs`（零 ci.yml 接线面·其卷自证）——与本刀 ci.yml 触面**零文件交叠**；本刀 Ban 接线 ha6（§5）与其修法面互补不冲突。EXEC 立项日对该分支对本刀唯一触面 `.github/workflows/ci.yml` 执行 `git log -1 line/ha6-repin -- .github/workflows/ci.yml` 复核，出现主线 `79382f4d` 后新触→触停止条件「现场漂移」停手上报。**rev3 pin 复核**：tip 现值 `b21fe709`（rev3 修订席实测·与处置值恒等）·零 ci.yml 不变量复核维持（`git log 79382f4d..line/ha6-repin -- .github/workflows/ci.yml` 恰 **0** 命中 rev3 亲测）。

### 0.1 blob 锚表（`git hash-object` 8 hex 亲算 @`79382f4d`·rev2 复核 ci.yml blob 恒等 `4cfa1ed3`）

| 文件 | blob（8 hex） | 关键锚 |
|---|---|---|
| `.github/workflows/ci.yml` | `4cfa1ed3`（344 行·现树） | **本刀唯一码改件**。`:25` verify job（`runs-on: ubuntu-latest`·`:30` DATABASE_URL=dev 库 54329）·`:45` docs:check 步·`:97-:101` typecheck 门·`:103-:106` lint gate 注释（**件② 已摘除·归属让渡 ci-red-clear 靶面·本刀零触**）·`:107-:108` `pnpm turbo lint` 步·`:153-:160` db:up+wait-for-postgres·`:174` neg:bend·`:179-:190` neg 六步（**isolated-runner 形接线先例**=纯 `- name:`+`run: pnpm <target>` 步·零 env 零 cond 零 retry）·`:193-:194` **breaker:prove 僵尸步**（ci-red-clear 修法③ 靶面·删步后本表 `:194` 后锚位整体 −2 平移）·`:215-:220` signal-sse 三步（邻位）·`:247-:249` scor-parity 步（邻位·isolated-runner 一次性本地 PG 先例·注释自证「沿 scor-00 先例」·**并线后 `:245-:247`**）·`:250` 下一既有步「agent 模型可观测」（**件① 插入锚=此步之前·并线后 `:248`**）·`:332-:335` 全栈 HTTP E2E 不在 per-push 注记（Key 缺失必须非零退出+skip-if-absent 禁令）·`:337-:344` CI-WIRING 纪律注记块（**只增不减纪律自证**：既有步零改语义/零删除/零重排·新增门一律 fail-loud）·js-yaml 解析 verify steps=**99**（rev2 亲跑·僵尸步=步序 index 38）。**ci-red-clear 并线后形态（本刀 EXEC 基线）**：僵尸步删 2 行→342 行·steps 基线 **99→98**·**件① 插入后 102**（98+4）·lint 注释 `:103-:106` 已由 ci-red-clear 刷新·并线后 blob 以届时 tip `git hash-object` 实算重 pin（预描 342 行/98 步·实测不符即触「现场漂移」停） |
| `package.json`（根） | `3b04b871` | 五门注册行：`:215` `uc003:i18n-locale:prove`→run-e2e-isolated·`:216` `…:raw`→`pnpm -C apps/web prove:uc003-i18n-locale`·`:217` `uc003:i18n-locale-ui:prove`（**UI 件·本刀不接线**）·`:275` `stress:prove`→run-e2e-isolated·`:495` `scoring-integrity:prove`→run-e2e-isolated·`:536`/`:539` `tokenstream:prove`/`:raw`→`pnpm -C apps/worker prove:tokenstream`·`:658` `ha6:prove`→`node scripts/ha/ha6-companion.proof.mjs`。lint 预算现行十二值：root `:8`=5235·api 1421·web 601·worker 954·ai-graphs 47·ai-runtime 628·config 0·contracts 265·db-mysql 0·db 1042·domain 115·qdrant-store 27（逐包 package.json `rg '"lint"'` 亲读·**本刀零改**） |
| `.github/workflows/nightly-ciw2.yml` | `09cd220a`（42 行） | cron UTC 19:30+workflow_dispatch·三件宿=recruiter:prove/sse-push:notify:prove（本地 56.8s）/vector-plane-erasure:prove（本地 7.6s）·头注自证裁入判据=「单件本地实跑绿+时长预算内」。**本刀零触（Ban）** |
| `.github/workflows/nightly.yml` | `ac47e884`（65 行） | 零触（ci-wiring2 逐字节 Ban 沿承·本刀同 Ban） |
| `scripts/run-e2e-isolated.mjs` | `e69e317a` | isolated-runner 本体·头注自证：临时 `meetwise-e2e-*` 容器只删自建·`LIVE_E2E_TARGETS` 含 `e2e:ui`（`:89`）·五门目标均在 prove-shell 通道（`scripts/isolated/targets-domain-prove.mjs`：非 LIVE 非 conn-only 即 prove-shell）·收据写 `.tmp/isolated-proof-receipts/`（gitignored `.gitignore:15`）·EXIT 码透传 fail-loud |
| `scripts/run-e2e-ui.mjs` | `84f9cd2d` | UI 件依赖三证：`:53` `MODEL_API_KEY` 缺失即 throw（live_provider_key_missing）·`:190-:206` 无 `.next/BUILD_ID` 先 `next build`·`:222-:228` Playwright（headless chromium）——**三依赖 CI per-push 均缺→ui 件不接线**（§1.4） |
| `scripts/ha/ha6-companion.proof.mjs` | `d640cc6a`（365 行） | ha6 门本体·`:53` `BASELINE='8ba93f0b'` 冻结基线常量·**本刀零触**（归 line/ha6-repin·§4） |
| `apps/worker/test/scoring-report-integrity.proof.ts` | `35984431` | scoring-integrity 门本体·零触 |
| `apps/worker/test/tokenstream-progress.proof.ts` | `53e88ffe` | tokenstream 门本体·零触 |
| `apps/worker/test/context-stress.proof.ts` | `31401cec` | stress 门本体·零触（scriptedModelClient 离线） |
| `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `8c3cfd4f` | uc003 raw 门本体·`node:assert`+fs 纯结构断言·零浏览器零 Key·零触 |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4` | markers 五类词族组装处 `:151-:153`（四词运行时拼接+冲突标记对·**词面本卷不复抄防自匹配**）·零触 |

### 0.2 派单简报漂移登记（结论修正如实记·亲证为准）

1. **nightly-ciw2.yml 简报称「PR #108 内待着陆件」→ 本基线已着陆**：`86303901`（ci-wiring2 EXEC）在本基线历史亲证（is-ancestor·文件在树 blob `09cd220a`）——「待着陆」系 GitHub 主线侧 PR 口径，`feat/mysql-schema-skeleton` 侧已在位。结论不变：该件非本刀面·本刀零触。
2. **ha6:prove 简报称「静态可证面·预算先核」→ 亲核结果=基线红·裁位翻为「登记不接线」**：本席实跑 EXIT=1·**50 PASS/26 FAIL**（rev2 全卷勘误=复审席复测 50 PASS/**26 FAIL** 定值=20 锚漂+2 钉内容+1 census+3 治理·§1.5 红名单）——「预算先核」条款命中，接线前提不成立。对派单面「五门接线」的实质修正=**四门接线+一门登记**，如实登记升级，归 pre-exec 双审与协调方裁决。
3. **stress 裁位二择一 → 裁 per-push**：本地实测冷 8.0s（29 PASS·无 key 隔离库·离线 scripted client·rev2 补记复审席热测 25.9s 同绿·收据 `outcome=passed`·§1.3 双口径）——绝对预算内（≤56.8s 硬红线·现测余量 2.1 倍）远低于同宿 sse-push 56.8s 裁入上限·且该门为合并闸语义（大答案截断/载荷净化/额度精确）宜 per-push 不宜 nightly 软化（#114 neg 六步同裁口径在卷）。
4. **tokenstream:prove ci-wiring2 时代登记「基线红·归后刀」→ 现已绿**：本席实跑 EXIT=0·20 PASS（17.5s）——「归后刀」即本刀，红已由在链后刀清偿，上游依赖满足。

## §1 红事实 + 裁位矩阵（本席亲跑实测 @`79382f4d`·docker 29.1.3·node 22.22.3·pnpm 10.28.0·零 Key·零模型外呼）

### 1.1 五门裁位矩阵（数字口径=本席实跑实测+复审席复测双口径在案·EXEC 复跑照实记·偏差熔断见 §2）

| 门 | 脚本（根 package.json 行） | 通道 | 实测 EXIT | 实测时长 | PASS 数 | 裁位 |
|---|---|---|---|---|---|---|
| scoring-integrity | `scoring-integrity:prove`（`:495`） | isolated-runner 一次性本地 PG | 0 | 10.9s | **23** | **per-push 接线**（scor-parity 邻位） |
| tokenstream | `tokenstream:prove`（`:536`） | isolated-runner（`:raw`→worker prove） | 0 | 17.5s | **20** | **per-push 接线**（ci-wiring2 悬置件清偿） |
| stress | `stress:prove`（`:275`） | isolated-runner | 0 | **冷 8.0s/热 25.9s**（收据 durationMs 7587/7623·25953ms 双口径在案） | **29** | **per-push 接线**（裁位写明：绝对预算内冷热双口径·合并闸语义·非 nightly-ciw2·§1.3） |
| uc003 i18n-locale | `uc003:i18n-locale:prove`（`:215`） | isolated-runner（raw 口径） | 0 | 2.9s | **7**（S1-S6+G3' 七查） | **per-push 接线**（raw 口径）；**UI 件 `uc003:i18n-locale-ui:prove` 不接线**（§1.4 注记） |
| ha6 | `ha6:prove`（`:658`） | 纯静态（零容器零网络） | **1** | 1.1s | 50（**26 FAIL**·rev2 勘误） | **登记不接线**（§1.5·归 ha6-repin 后另批） |

### 1.2 接线形（isolated-runner 形先例=neg 六步 ci.yml `:179-:190`+scor-parity `:247-:249`）

四门接线步=纯 `- name:`（中文述名+预算括注）+`run: pnpm <脚本名>` 两行形·零 env 零 if 零 retry 零 continue-on-error——与 neg 六步/scor-parity 恒同形·红即非零退出阻断合并（fail-loud）。插入位置=ci.yml scor-parity 步 `run` 行（现树 `:249`·ci-red-clear 并线后 `:247`·−2 平移）之后、「agent 模型可观测」步（并线后 `:248`）之前·四步顺序=scoring-integrity→tokenstream→stress→uc003:i18n-locale（先评分族后流式后上下文后 UC 结构·纯新增·剪除新增四步后余 99 步（ci-red-clear 后 98 步）name 序列对基线逐位恒等）。

### 1.3 stress 裁位写明（派单面「二择一」的裁决记录·rev2 绝对预算改判）

**裁 per-push（ci.yml verify job）·不裁 nightly-ciw2（rev2 维持）**。判据：①**绝对预算口径（rev2 改·3 倍相对线废除）**：熔断=绝对上限 **≤56.8s（硬上限·现测余量 2.1 倍）**（硬红线=宿内最贵件 sse-push 裁入上限 56.8s）——冷热双口径实测在案：冷 8.0s（起草席·收据 durationMs 7587/7623ms）·热 25.9s（复审席·收据 durationMs 25953ms·`outcome=passed`·墙钟口径 26.9s）·区间 8-26s；rev1 相对熔断线「超基准 3 倍=24.0s」已被热测 25.9s 自触（pre-exec P1-2 FAIL 实证）→相对线废除；**现测余量 2.1 倍**（56.8s/26.9s 墙钟热值）·26.9s 仍远低于宿内最贵件 56.8s→**裁位 per-push 维持**；②该门断言面=大答案链路截断/载荷净化/额度精确/舱壁不阻塞——合并闸语义，nightly 日跑软化违背 #114 确立的「负例门=合并闸语义·不作 nightly 软化」裁口径；③无 Key 依赖（scripted client·离线）无 per-push 障碍。

### 1.4 uc003 UI 件 chromium 注记（派单面「+ui 件需 chromium 注记」的落卷）

`uc003:i18n-locale-ui:prove`（根 package.json `:217`）=e2e:ui 通道（LIVE_OPTIONAL_UI·`scripts/isolated/targets-live-e2e.mjs:17`）·依赖三件=①`MODEL_API_KEY` 缺失即 throw（`scripts/run-e2e-ui.mjs:53`）②production `next build`（`:190-:206`）③Playwright chromium（`:222-:228`）。ci.yml `:332-:335` 既有注记自证 Key 缺失必须非零退出+禁 skip-if-absent——**三依赖 per-push CI 均不满足→本刀零接线零步骤·仅本节注记在卷**。其宿面（nightly/手动）归协调方另裁，本刀 Ban 借机接线。

### 1.5 ha6:prove 基线红全量名单（本席实跑·EXIT=1·**50 PASS/26 FAIL**（20 锚漂+2 钉内容+1 census+3 治理）·1.1s·rev2 复审席复测同定值）

- max:1 census 漂 1 臂：got `[sse-notify.service.ts:255, worker main.ts:671]` vs expected `[…:151, …:661]`（内容零变纯位移·ha6-repin rev2 已登记同漂）+两行钉内容断言随漂（`:151`/`:661` 两 FAIL）。
- 行号内容锚漂 **20 臂**（rev1「22 臂」系计值笔误·本清单逐臂实数恰 20·rev2 对齐复审席复测）：auth.service.ts（`:11`/`:12`/`:13`/`:28`×2 臂/`:54`）·recruiter.service.ts（`:114`/`:116`）·quiz.controller.ts（`:56`）·interview.controller.ts（`:262`）·resume.service.ts（`:20`/`:36`/`:48`）·interview.service.ts（`:25`/`:27`/`:30`/`:338`/`:399`/`:432`/`:701`）——proof 自证句「行号再漂，回 REQUEST 补审」逐臂打印。
- 治理门漂 3 臂：`docker/compose.ha.yml` diff vs 基线 8ba93f0b 非恰一行新增；Ban violated: existing compose touched: `docker/compose.prod.yml`；package.json additive violated: `breaker:prove`。
- **根因定性**：该门为钉死 REQUEST 基线 `8ba93f0b` 的单刀治理回归 proof——基线后其余刀合法并线触其冻结面（锚行位移+compose 触面+脚本键增）→**结构性红·非环境假红**。重钉 owner=line/ha6-repin（锚 rev2 重钉 `c38e6e22`·§0.0 登记·零 ci.yml 新触亲证不变·着陆时对届时 tip 再重 pin）·**本刀零触该 proof（Ban 就地修）**·**接线前置=届时 tip 本地 ha6:prove 绿**·届时另批（沿 ci-wiring2 对 tokenstream 基线红「零动作登记·归属勘明归后刀」先例）。

## §1-修法（wiring 刀·预期恰 1 码面文件 `.github/workflows/ci.yml`·零迁移零产品码零 proof 零 package.json·rev2=件② 摘除后三件码面+件④ 收据）

- **件①（四门接线步）**：ci.yml scor-parity 步 `run` 行（现树 `:249`·ci-red-clear 并线后 `:247`）后、「agent 模型可观测」步之前插入以下逐字节内容（插入后既有步零重排·verify steps **98→102**）：

```yaml
      # CI-WIRING3 五门接线（scor-parity 邻位·isolated-runner 一次性本地 PG·fail-loud 红即阻断）。
      # 裁位亲证 @79382f4d：四门本地实跑绿入 per-push；ha6:prove 基线红（50 PASS/26 FAIL·锚漂+治理门漂）
      # 不接线——归属 line/ha6-repin 重钉着陆后另批。
      # 评分/报告 P0 完整性（23 断言·本地实测 10.9s·总分确定性聚合+模型越权防护）
      - name: 评分/报告 P0 完整性（隔离一次性 PG·总分聚合不可被模型越权改写）
        run: pnpm scoring-integrity:prove
      # 流式 token 进度接线（20 断言·本地实测 17.5s·ci-wiring2 时代基线红已由在链后刀清偿）
      - name: 流式 token 进度接线（generation_started 先于业务结果落表+payload 白名单围栏）
        run: pnpm tokenstream:prove
      # 长上下文真实 v64 链路（29 断言·本地实测 冷 8.0s/热 25.9s 双口径·预算内裁 per-push 非 nightly-ciw2·合并闸语义）
      - name: 长上下文真实 v64 队列/图/报告链路（大答案截断+载荷净化+额度精确）
        run: pnpm stress:prove
      # UC003 i18n locale 结构断言（七查·本地实测 2.9s·raw 口径；UI 件需 chromium+Key+生产构建不在 per-push）
      - name: UC003 i18n locale 结构断言（S1-S6+G3' 七查·raw 隔离口径）
        run: pnpm uc003:i18n-locale:prove
```

- **件② 已摘除·归属让渡（rev2·协调方裁决）**：lint 注释十二值对表刷新（ci.yml `:103-:106`）整面归 **line/ci-red-clear**（在飞 `b0877528`·PR #108 双红全上下文·其修法④ verbatim EXEC-ready·同一注释块 Ban 双写·§0.0 登记）——本刀对该注释块**零触**（§2-4 删行恰零承载）。
- **件③（卷尾纪律注记追加）**：ci.yml 末行（并线后 `:342` 行后）追加注释四行（纯增·登记本刀归属与不接线面）：

```yaml
      # CI-WIRING3 接线归属登记：四门（scoring-integrity/tokenstream/stress/uc003:i18n-locale）per-push。
      # ha6:prove 亲证基线红（50 PASS/26 FAIL）不接线·归属 line/ha6-repin 重钉后另批
      # （接线前置=届时 tip 本地 ha6:prove 绿）；UI 件（chromium+MODEL_API_KEY+生产构建三缺）
      # 与 nightly.yml/nightly-ciw2.yml 与 lint 注释面（归 ci-red-clear）本刀零触。
```

- **件④（收据）**：`ai-docs/delivery/receipts/ci-wiring3/00-exec.md`——七字段（门矩阵全表+EXIT 原值+四门复跑时长（冷热双口径）与 PASS 计数+ha6 红名单 diff 对本卷 §1.5+diff numstat+重 pin 全表+偏离清单）·untracked 口径沿 negbend §9-③ 先例。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准）

1. **ci.yml 解析门**：`node -e`（js-yaml@4.3.2 repo 内 realpath 加载）parse EXIT=0·verify steps=**102**（ci-red-clear 并线后基线 98+4·**新增步数熔断=恰 4**·多即停）·且**剪除新增四步后余 99 步（ci-red-clear 后 98 步）name 序列对基线逐位恒等**（js-yaml 抽取比对·错位即停=既有步被重排）。
2. **四门本地实跑绿**：`pnpm scoring-integrity:prove`/`pnpm tokenstream:prove`/`pnpm stress:prove`/`pnpm uc003:i18n-locale:prove` 四命令各恰 1 run EXIT=0·PASS 计数**恰 23/20/29/7**（**熔断=0 容差**·实测≠即触「现场漂移」停）·时长入收据（冷热双口径基准在案：scoring 10.9s/tokenstream 17.5s（收据 16.9-21.0s）/stress 冷 8.0s 热 25.9s（收据 durationMs 7587-25953ms）/uc003 2.9s（收据 2.6-3.4s））·**熔断=绝对上限（rev2 改·3 倍相对线废除）**：任一门单步实测 >56.8s（宿内最贵件 sse-push 裁入上限×余量硬红线·现测余量 2.1 倍）即触「现场漂移」停手上报。
3. **ha6 红登记恒等**：`pnpm ha6:prove` EXIT=1·50 PASS/**26 FAIL**·红名单与本卷 §1.5 **恒等**（多新 FAIL=现场漂移停·少 FAIL=已重钉·如实登记归 ha6-repin 对表）。
4. **邻面不回退（diff 机检·rev2 删行预期改判）**：`git diff <届时基线 SHA> -- .github/workflows/ci.yml` 删行（`^-`）**恰零（本刀纯增）**——件② 已摘除让渡·对并线后基线全 diff 为纯增恰 **19 行**（件① 15 行=块头注 3 行+四步各 3 行 12+件③ 注记 4 行·rev3 勘正：rev1/rev2 计值漏计件① 块头注 3 行·反向「删块头注凑 16 行」方案已否决·块头注为裁位亲证纪律面保留）·出现任何删行/改行即停（只增不减纪律）。
5. **nightly 双件零触**：`git hash-object` 对 `.github/workflows/nightly.yml`=`ac47e884`+`nightly-ciw2.yml`=`09cd220a` 恒等（blob 前后全等）。
6. **ui 件零接线**：`rg -c "i18n-locale-ui|e2e:ui" .github/workflows/ci.yml` 对基线恒等（=零新增命中）。
7. **typecheck 不回退**：`pnpm turbo typecheck` EXIT=0（8/8·若翻动 `apps/web/tsconfig.tsbuildinfo`→`git checkout` 回滚沿 negbend §9 先例）。
8. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2128**（rev2 本树亲跑 2124·**>2128 红停上报**）。
9. **markers 五类零命中**：本刀改动集（本卷 1 .md+EXEC 期 ci.yml+收据目录）五类标记词（词族=`scripts/i6-239-gates.proof.mjs:151-:153` 运行时组装四词+冲突标记对·**词面本卷不复抄防自匹配**）grep 零命中（命令与回执入收据）。
10. **diff 面机检**：起草 turn `git diff --numstat 79382f4d` 恰 1 tracked 路径=本卷 .md；EXEC turn 恰 2=ci.yml+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。
11. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼。
12. **CI 实跑（「推 PR 后观察」口径）**：本刀 EXEC 落卷后由 pusher/协调方推 `line/ci-wiring3` 开 PR——GitHub Actions verify job 全绿（含新增四步+件① 注释）=终证·EXEC 本地实跑为先行证·两者歧义以 CI 运行为准（歧义=停报·禁本地洗绿）——沿 ci-wiring2 §8「CI 自证特殊性」条款同形。

## §3 范围外（边界清单·越界即 FAIL）

1. **五门 proof/脚本本体零触**：§0.1 表列 `scoring-report-integrity.proof.ts`/`tokenstream-progress.proof.ts`/`context-stress.proof.ts`/`uc-e2e-003-i18n-locale.proof.mjs`/`ha6-companion.proof.mjs`/`run-e2e-isolated.mjs`/`run-e2e-ui.mjs` 前后 blob 全等——本刀纯 wiring·断言/预算/重钉皆非本刀面。
2. **package.json 零触**：五门注册行+lint 预算十二值零改（件② 已摘除让渡 ci-red-clear·本刀对 lint 注释面/预算值**零触**——Ban 动真实预算值·预算 sanction 归 lint 线各刀）。
3. **ha6 接线与重钉零触**：`scripts/ha/ha6-companion.proof.mjs` 归 line/ha6-repin（§1.5）·Ban 本刀就地重钉/Ban 就地接线恒红门。
4. **UI 件零接线**：`uc003:i18n-locale-ui:prove`（§1.4 三缺）·Ban 借机接 e2e:ui 通道。
5. **nightly 双件零触**：`nightly.yml`/`nightly-ciw2.yml` blob 恒等（§2-5）·stress 不入 nightly-ciw2（§1.3 裁 per-push 已写明）。
6. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——行翻面权归协调方。
7. **零迁移零 DDL 零依赖升级零产品码**。

## §4 依赖

**①上游已满足**：tokenstream 基线红已由在链后刀清偿（§0.2-4 实测绿）；isolated-runner/neg 六步/scor-parity 接线形在链（ci.yml `:179-:190` 不随平移/`:247-:249`→并线后 `:245-:247`）。**②在飞交叠（rev2 改判）**：ci-red-clear（`b0877528` 在飞 PR #108·lint 注释面+僵尸步删步两面交叠→**件② 摘除归属让渡**·**EXEC 立项序=其并线之后**·§0.0）；ha6-repin（锚 rev2 重钉 `c38e6e22`·与本刀触面零文件交叠·零 ci.yml 新触亲证不变·§0.0 复核规则）。**③下游**：ha6 接线=ha6-repin 着陆+届时 tip 本地 ha6:prove 绿后另批；UI 件宿面归协调方另裁。**④迁移号**：预期零迁移（§3-7）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit·CI 观察归 pusher/协调方）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§2-2 四门各恰 1 run·红不重跑冲销）；Ban 翻 pins（§5 十一值零翻转）；Ban 触五门 proof/脚本本体与 package.json（§3-1/§3-2）；Ban 接 ha6/Ban 就地重钉 ha6（§3-3·借机修 Ban）；Ban 接 UI 件/e2e:ui 通道（§3-4）；Ban 触 nightly 双件（§3-5）；Ban 改既有步语义/删除/重排（ci.yml 只增不减·§2-1 逐位恒等+§2-4 删行恰零承载）；Ban 动 lint 真实预算值（§3-2）；**件② 已摘除·归属让渡 ci-red-clear（§0.0/§1-修法登记）·Ban 本刀再触 lint 注释面（防双写同一注释块）**；Ban 未并线先立项（ci-red-clear 并线前 Ban 本刀 EXEC 立项·§0.0 立项序）；Ban 迁移 Ban DDL；Ban 改共享 SSOT（§3-6）；Ban 触其他工作树；Ban 伪造实测（§1 矩阵值本席亲跑为分母·EXEC 复跑如实记·Ban 抄卷值顶替）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄 negbend §5·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（本刀全门=静态/隔离库机械断言·零模型外呼·零 secrets 消耗）。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零模型外呼零 Key 加载零生产操作零 secrets 消耗。本席亲核用本地隔离容器 5 件次（isolated-runner 临时 `meetwise-e2e-*`·runner 自清·残留 0 亲证·四门全离线 scripted/结构断言·ha6 纯静态）·收据落 `.tmp/isolated-proof-receipts/`（gitignored `.gitignore:15`·树洁亲证）。rev2 修订 turn=docs-only 零实跑·est live=0 维持。EXEC 期四门复跑同离线形·est live=0 维持。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·rev2 修订席复跑同零命中·回执随 EXEC 收据留痕·五类词面不复抄卷内防自匹配——沿 negbend/ag04 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**（rev2 回炉后两外席**重派重审**）；②**协调方明示 EXEC 授权**（committed SHA 重钉）·**且立项序=ci-red-clear 并线之后**（§0.0 铁证：`ci` workflow 300 跑零绿→主线红线清偿前置·未并线 Ban 立项）；③EXEC 立项**不得改 §1 裁位矩阵（四接一登）与 §1.3 stress 裁位（per-push+绝对预算）、§1-修法件①③④ 逐字节内容与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号/blob 漂移如实改锚·结论不变只更锚·§0.0 在飞复核+并线确认必做·§0.2 漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob 漂移·四门基线绿翻红或 PASS 计数≠23/20/29/7·verify steps≠98 基线（ci-red-clear 并线后形态）·ha6 红名单对 §1.5 扩·ci-red-clear 未并线即到立项日（§0.0 立项序前置缺失）/ci-red-clear 并线后预描形态不符（342 行/98 步）/ha6-repin 对本刀触面出现主线后新触（§0.0 规则）→停·重 pin 回炉。
- **机制不满足**：接线步 isolated-runner 语义下无法绿（容器起停/预算/依赖缺失类）·或四门本地复跑任一 EXIT≠0（红面不在本刀交付面）→停·如实升级协调方（Ban 凑绿 Ban 改步形放水）。
- **越界需要**：接线诉求超出 §1-修法件①③（需触 proof 本体/package.json/nightly 双件/UI 件/lint 注释面/产品码方能绿）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（docs:check>2128/lint 出现第三红/CI 推 PR 后 verify 红且归因非新增四步）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*CI-WIRING3 REQUEST · 2026-10-15 起草 · **rev2 修订同日**（pre-exec 双审双 FAIL 回炉：件② 摘除让渡 ci-red-clear+stress 绝对预算+98/102 重锚+ha6 26 勘误+立项序写死） · **rev3 修订同日**（窄域复审 FAIL 回炉五项全落：§2-4 纯增行数勘正 16→19+预算硬上限口径+件① stress 注释双口径+§0.0 ci-red-clear/ha6-repin pin 复核补记·反向删块头注方案否决）· **`draft:awaiting_pre_exec_dual`**（复审维持）· base `feat/mysql-schema-skeleton` @`79382f4d` · 分支 `line/ci-wiring3` · 工作树 `meetwise-ciw3`（本起草席立·建前 branch+worktree 双查零同名）· 立项出处=CI 对账席五门未上 CI 对账+本席五门亲证实测（四绿一红·裁位矩阵 §1.1）· 修法=件① 四门接线步（scor-parity 邻位插入·neg 六步 isolated-runner 恒同形·fail-loud·verify steps 98→102）+件③ 卷尾纪律注记（ha6 接线前置=届时 tip 本地绿内联）+件④ 收据·**件② 已摘除·归属让渡 ci-red-clear**（`b0877528` 在飞 PR #108·§0.0）· stress 裁位=per-push 维持（绝对上限 ≤56.8s（硬上限·现测余量 2.1 倍）·冷 8.0s/热 25.9s 双口径·§1.3）· ha6=亲证基线红 50 PASS/26 FAIL 登记不接线（归 ha6-repin 锚 `c38e6e22`·§1.5）· UI 件=chromium+Key+生产构建三缺注记不接线（§1.4）· **EXEC 立项序=ci-red-clear 并线之后（§0.0/§8）**· 门矩阵十二门（解析 102/四门 23-20-29-7/ha6 恒等/邻面 diff 删行恰零/nightly 双件 blob 恒等/ui 零接线/typecheck/docs:check≤2128/markers/diff 面机检/卫生/CI 推 PR 后观察）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*

---

## rev3 处置摘要（rev2 窄域复审 FAIL 回炉·2026-10-15 同日·docs-only 恰 1 .md·修订席逐项亲证后落笔）

rev2 窄域复审判定 FAIL=恰一处 P1+P2 四则·协调方处置清单五项全落（实测口径=rg/git/机械计数为准·Ban 抄处置计值顶替实测）：

- **P1·§2-4（:112）纯增行数勘正**：「纯增恰 16 行（件① 四步 12 行+件③ 注记 4 行）」→「纯增恰 **19 行**（件① 15 行=块头注 3 行+四步各 3 行 12+件③ 注记 4 行）」——修订席 `sed` 机械计数亲证：件① yaml 块内容恰 15 行（块头注 3+四步各 3 行 12）+件③ 注记块恰 4 行=19·rev1/rev2 计值漏计件① 块头注 3 行=自触计值笔误·**反向「删块头注凑 16 行」方案已否决**（块头注为裁位亲证纪律面·保留）·trailer 无同值（「恰 16 行」全卷恰 :112 一处 rg 亲证·零同步需要）。
- **P2-a·§1.3（:60）+trailer（:160）预算口径精化**：「≤56.8s×余量」→「≤56.8s（硬上限·现测余量 2.1 倍）」两处全落——56.8s 本身即硬上限·「×余量」再乘字样废除（歧义面）·现测余量 2.1 倍（56.8s/26.9s 墙钟热值）口径不变。
- **P2-b/P2-d·件① yaml 注释 stress 行（:87）双口径**（两则复审项同落一处）：「本地实测 8.0s」→「本地实测 冷 8.0s/热 25.9s 双口径」——rg 亲证全卷「本地实测 8.0s」单口径恰此一处（其余 8.0s 表述 rev2 已双口径）·行数零变（19 行计值不受影响）。
- **P2-c·§0.0（:14/:16）在飞 pin 复核补记**：ci-red-clear 补「`b0877528` 已 amend 失效→`d056dd91`（amend 后起草落卷·处置席计值）·修订席落笔实测 tip=`d6ac92ed`（其上又并其 rev3 件⑤ egress 计数同步·docs-only 仍恰 1 .md diff-tree 亲证）·结论零变」——处置席计值 d056dd91 与落笔实测 d6ac92ed 一格位移如实并记（活线·届时值 EXEC 立项日复核）·`b0877528` 非现 tip 祖先（is-ancestor exit=1 亲测）；ha6-repin 补「tip 现值 `b21fe709`（rev3 实测·与处置值恒等）·零 ci.yml 不变量复核维持（`git log 79382f4d..line/ha6-repin -- .github/workflows/ci.yml` 恰 **0** 命中 rev3 亲测）」。
- **自检（rev3 落卷时）**：docs:check EXIT=0·**2124**≤cap 2128（受管文件计数口径·本刀零新文件计数不增）·markers 五类零命中（本卷改动集 grep 亲测）·STOP=**`draft:awaiting_pre_exec_dual`** 复审维持·est live=0（docs-only 零实跑零外呼）·commit=rev3·**⛔push**（CI 观察归 pusher/协调方）。
- **如实登记（不在本轮处置清单·未改）**：§2-2（:110）存同族「裁入上限×余量硬红线」字样一处（rg 亲证）·语义同族于 P2-a·留复审裁量。

*rev3 处置摘要 · 修订席落卷 · 五项对应协调方处置清单·STOP 维持 awaiting*

---

## §9 EXEC 记录（2026-10-15·执行席落卷·post-prove 双审前）

**Status 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`**（开工链=rev3 窄域复审 PASS `agent_7a80eab2`→协调方明示 EXEC 授权·立项前置=ci-red-clear 并线 `0c06033d` 亲证（`git merge-base --is-ancestor line/ci-red-clear origin/feat/mysql-schema-skeleton` EXIT=0·其 EXEC `bb1627d8` 为 tip 祖先）·⛔push）。

- **并线**：`git merge --no-ff origin/feat/mysql-schema-skeleton`→**`1be05b4b`**（origin tip=`0c06033d`·fetch 后本地与 origin 恒等·merge-tree 预演 tree `01b2caca` EXIT=0 零冲突先证·实测零冲突零 dual-keep 需·卷入 85 文件=ci-red-clear/ha6-repin/batch-residual-plan/perfload-env-fix 等合法落刀·⛔pull --rebase 未用）。
- **重 pin（对 `1be05b4b` 全 12 锚）**：11 锚 blob 恒等（package.json `3b04b871`/nightly 双件 `ac47e884`+`09cd220a`/run-e2e-isolated `e69e317a`/run-e2e-ui `84f9cd2d`/五 proof 本体+markers 组装件）·ci.yml=`e7d2031a`/**342 行**/verify steps=**98**（=起草卷预描并线后形态逐项恒等·blob 更 pin）·僵尸步 0 命中·scor-parity `:246-:247`/下一既有步 `:248` 锚位逐字命中·唯一漂移=ha6-companion.proof.mjs `d640cc6a`→`740df0a3`（424 行·ha6-repin 合法落刀·本刀零触结论不变·§1.5 对表见下）。
- **件①**：ci.yml 纯增 15 行逐字节材料化（scor-parity run `:247` 后·「agent 模型可观测」`:248` 前·REQUEST `:78-:92` vs 树内 `:248-:262` `diff` EXIT=0）·steps **98→102**（98+4·新增恰 4 熔断内）·四步恰 name+run 两键·run 值四名对 package.json 注册面 `:495`/`:536`/`:275`/`:215` 恰命中·**剪除新增四步后余 98 步 name 序列对基线逐位恒等**（零错位=既有步零重排零删除）。
- **件③**：末行 `:342` 后纯增注记恰 4 行逐字节（REQUEST `:99-:102` vs 树内 `:358-:361` `diff` EXIT=0）·ha6 接线前置表述按协调方指令维持（届时已绿不回写·归另批）。
- **件② 零双写对表**：本刀 diff 删行恰 0·lint 注释块（`:103-:106` 十二值形）零触——其面归 ci-red-clear 已在其 EXEC `bb1627d8` 落主线树·零双写零双删。
- **件④**：收据 `ai-docs/delivery/receipts/ci-wiring3/00-exec.md`（七字段+红与偏差登记）。
- **门矩阵十二门终值**：门1 解析 steps=102+剪除恒等 **绿**·门2 四门实跑 **EXIT=0·PASS 恰 23/20/29/7**（scoring 10.220s/tokenstream 18.758s（收据 18311ms）/stress 8.798s 冷（收据 8404ms）/uc003 3.045s（收据 2675ms）·各恰 1 run 零 retry·单步均 ≤56.8s 硬上限）**绿**·门3 ha6 **EXIT=0·75 PASS/0 FAIL**（「少 FAIL=已重钉」臂·26→0 零新增 FAIL·归 ha6-repin 对表·**接线维持不接归另批**）**绿（如实登记）**·门4 邻面 diff 删行恰 0 纯增恰 **19** **绿**·门5 nightly 双件 blob 恒等 **绿**·门6 ui 零接线 1→1 **绿**·门7 typecheck **8/8 EXIT=0**（7 cached·零副产）**绿**·门8 docs:check **红=PTP_FILE_LIMIT:2137>2136 红停上报**·门9 markers 五类零命中 **绿**·门10 diff 面机检 码面恰 1 tracked=ci.yml（19/0）·落卷恰 2+收据 untracked **绿**·门11 卫生（frozen-lockfile EXIT=0 零 lockfile 改+.env* ABSENT+actualSpendCny=null+零模型外呼）**绿**·门12 CI 推 PR 后观察归 pusher/协调方 **移交**。
- **邻面不回退（协调方加门）**：neg:bend **179/179 EXIT=0**（6.5s）·sse-push:notify **35/35 EXIT=0**（56.651s·收据 56212ms）·tokenstream 20·scoring-integrity 23——四值恰等零回退。**migrate 链 202 头 0202**（+四门收据 manifest count=202 互证）**绿**。
- **停止条件「验收红不可修」命中登记（Ban 借机修·裁决归协调方）**：门 8 红构成=**并线后基线恰 2136=cap 零余量+件④ 收据 1=2137>2136**。stash 对照亲证：收据移出同树 `check-docs` **EXIT=0·2136≤2136 绿**（本刀 tracked 改动 ci.yml 计数贡献=0）。根因=ci-red-clear sanction cap 2136 时其树实测 2135 余 1，其后主线 `0a787906` 并入 batch-residual-plan.md 恰耗尽余量·件④ 收据（§1-修法钉定路径·受管根下非忽略 .md）必入计无从在 cap 内落卷。本席零自改 cap（cap 史全部协调方 sanction·perfload-env-fix 先例「EXEC 红停 PTP_FILE_LIMIT:2131>2128」同形）·**请协调方裁决上调幅度（最少 +1 至 2137·沿 +8 先例取 2144 可选）**。删收据避红=Ban（件④ 任务书强制产出）。
- **ha6 已重钉转绿登记（非红非漂移）**：proof blob `d640cc6a`→`740df0a3`（424 行）·`pnpm ha6:prove` **EXIT=0·75 PASS/0 FAIL**·proof 尾注自证 rolling registry active（baseline 8ba93f0b retired 2026-10-14）——§1.5 红名单 26 FAIL→0=「已重钉」臂·对表归 ha6-repin·件①/件③ 登记注记为历史亲证记录逐字节未改。
- **卫生**：markers 五类零命中（ci.yml diff+本卷+收据改动集 grep·词族运行时组装）·tracked 码面恰 1 路径（ci.yml）·零 lockfile 改·零迁移零 DDL 零依赖升级零产品码·共享 SSOT 零触·隔离容器 6 件次 runner 自清残留 0·est live=0。
- **pins 十一值零翻**（承 §5 原文）。
- **STOP=**`executed:awaiting_post_prove_dual`**（post 双审归协调方派·门 8 cap 裁决为其前置事项之一）·本 commit 不预 claim CI 运行结果（门 12 推 PR 后观察归 pusher/协调方）·⛔push**。
- **门 8 红转绿（cap sanction 落值·2026-10-15 协调方 sanction 后原地续跑收尾）**：协调方 sanction **cap 2136→2144**（+8·沿 +8 先例·事由=本刀收据 +1 至 2137+reconcile 迁移 +1 至 2137·三刀在飞共享余量）→ `scripts/ai-docs/public-text-policy.mjs` `MAX_FILES` 2_136→**2_144**+cap 史 sanction 注记（ci-wiring3 EXEC 红停 PTP_FILE_LIMIT:2137>2136·三刀共享·协调方 sanction）落卷；`scripts/ai-docs/public-text-policy.proof.mjs` 越限臂 fabricated 数随 cap 联动 2_136→2_144+超限错误串 2137→**2145**+sanction 注记随卷。**proof 复跑 EXIT=0**（`static_preflight_valid: selected=12/12`·cap 数字行为断言 2144/超限 2145 全行使）；**`node scripts/ai-docs/check-docs.mjs` EXIT=0·`scanned 2137 managed worktree files`≤2144**——§8 停止条件「验收红不可修」门 8 红消解·十二门终态=**11 绿+门 12 移交**（门 3 ha6 已重钉转绿登记保持·门 12 CI 推 PR 后观察归 pusher/协调方）。本收尾零产品码零门语义变更（cap 数字预算联动·语义不变强度不减）·est live=0·STOP 维持 **`executed:awaiting_post_prove_dual`**（post 双审归协调方派）。
