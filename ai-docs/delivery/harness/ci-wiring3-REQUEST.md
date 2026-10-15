# CI-WIRING3 REQUEST — 主线五门接线刀（scoring-integrity/tokenstream/stress/uc003:i18n-locale 四门 per-push + lint 注释对表刷新；ha6:prove 亲证基线红登记不接线·恰 1 workflow 文件·docs-only 起草卷·ci-wiring3 战役·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-15 · pre-exec 双审两外席待派 · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT · ⛔push）

**席位**：ci-wiring3 REQUEST 起草席（诊断已由 CI 对账席在案·本席核验+起草·协调方派）。
**基线**：`feat/mysql-schema-skeleton` @ `79382f4d`（fetch 后 origin tip 与本地恒等亲证·UC003-FOLLOWUP nail 收官 SSOT commit）· 分支 `line/ci-wiring3`（建前 `git branch --list "line/ci-wiring*"` 恰 `line/ci-wiring2` 一支·本席 `git worktree add ../meetwise-ciw3 -b line/ci-wiring3 feat/mysql-schema-skeleton` 亲立）· 工作树 `meetwise-ciw3`（仓根同级）。
**立项出处**：①CI 对账席对账结论（五门未上 CI 面清单+各门预算括注+stress 裁位二择一+ha6 预算先核条款+nightly-ciw2 非本刀面）；②本席亲证实测 @`79382f4d`（四门实跑绿+ha6 实跑红 50 PASS/27 FAIL+时长四值+PASS 计数四值·§1 裁位矩阵）；③形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8+trailer·STOP 三条款+四类停止条件口径）+ 裁位判据先例 `ai-docs/delivery/harness/ci-wiring2-prove-placement.md`（三态口径 per-push/nightly-ciw2/零动作登记·点名件实测判据=单件本地实跑绿+时长预算内·`tokenstream:prove` 基线红登记「归后刀」即本刀）。

## §0 现状锚（起草席亲证 @`79382f4d`·rg/sed/Read/git hash-object/实跑逐条实测·**EXEC 立项照本节对届时 tip 再重 pin**——结论不变则只更行号/blob）

### 0.0 防重双对表 + 在飞交叠

- `git branch --list "line/ci-wiring*"` 建后恰 2 命中=`line/ci-wiring2`（已并线·EXEC `86303901` 在本基线历史）+本席 `line/ci-wiring3`；`ls ai-docs/delivery/harness/ | rg ci-wiring3` 建前零命中→落卷后唯一同名卷=本卷。
- **ci-red-clear 边界（在飞交叠·EXEC 立项日必做复核）**：`git rev-parse line/ci-red-clear` =`79382f4d` 与本基线**同指=零 delta**，该分支零在树卷宗（`rg -l "ci-red-clear" ai-docs` 全仓零命中亲证）。故 lint 注释对表刷新（§1-修法件②）**并入本刀**（对表说明=本条）。EXEC 立项日复核规则：`git log -1 line/ci-red-clear` 若已含对本刀 §1-修法件② 同一注释块（ci.yml lint gate 注释）的新提交且非祖先→**摘除件②**·收据对表说明（Ban 双写同一注释块）。
- **ha6-repin 在飞交叠**：`line/ha6-repin` tip=`a5317ffd`（REQUEST rev2·`draft:awaiting_pre_exec_dual` 待复审·**非本基线祖先**亲证）·其修法面=恰 1 治理脚本 `scripts/ha/ha6-companion.proof.mjs`（零 ci.yml 接线面·其卷自证）——与本刀 ci.yml 触面**零文件交叠**；本刀 Ban 接线 ha6（§5）与其修法面互补不冲突。EXEC 立项日对该分支对本刀唯一触面 `.github/workflows/ci.yml` 执行 `git log -1 line/ha6-repin -- .github/workflows/ci.yml` 复核，出现主线 `79382f4d` 后新触→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 8 hex 亲算 @`79382f4d`）

| 文件 | blob（8 hex） | 关键锚 |
|---|---|---|
| `.github/workflows/ci.yml` | `4cfa1ed3`（344 行） | **本刀唯一码改件**。`:25` verify job（`runs-on: ubuntu-latest`·`:30` DATABASE_URL=dev 库 54329）·`:45` docs:check 步·`:97-:101` typecheck 门·`:103-:106` lint gate 注释（**陈旧五值待刷**·§1-修法件② 靶面）·`:107-:108` `pnpm turbo lint` 步·`:153-:160` db:up+wait-for-postgres·`:174` neg:bend·`:179-:190` neg 六步（**isolated-runner 形接线先例**=纯 `- name:`+`run: pnpm <target>` 步·零 env 零 cond 零 retry）·`:215-:220` signal-sse 三步（邻位）·`:247-:249` scor-parity 步（邻位·isolated-runner 一次性本地 PG 先例·注释自证「沿 scor-00 先例」）·`:250` 下一既有步「agent 模型可观测」（**件① 插入锚=此步之前**）·`:332-:335` 全栈 HTTP E2E 不在 per-push 注记（Key 缺失必须非零退出+skip-if-absent 禁令）·`:337-:344` CI-WIRING 纪律注记块（**只增不减纪律自证**：既有步零改语义/零删除/零重排·新增门一律 fail-loud）·js-yaml 解析 verify steps=**99**（亲跑·§2 门1 基线值） |
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
2. **ha6:prove 简报称「静态可证面·预算先核」→ 亲核结果=基线红·裁位翻为「登记不接线」**：本席实跑 EXIT=1·**50 PASS/27 FAIL**（§1.5 红名单）——「预算先核」条款命中，接线前提不成立。对派单面「五门接线」的实质修正=**四门接线+一门登记**，如实登记升级，归 pre-exec 双审与协调方裁决。
3. **stress 裁位二择一 → 裁 per-push**：本地实测 8.0s（29 PASS·无 key 隔离库·离线 scripted client）——按 ci-wiring2 E5 判据（本地绿+预算内）远低于同宿 sse-push 56.8s 的裁入上限·且该门为合并闸语义（大答案截断/载荷净化/额度精确）宜 per-push 不宜 nightly 软化（#114 neg 六步同裁口径在卷）。
4. **tokenstream:prove ci-wiring2 时代登记「基线红·归后刀」→ 现已绿**：本席实跑 EXIT=0·20 PASS（17.5s）——「归后刀」即本刀，红已由在链后刀清偿，上游依赖满足。

## §1 红事实 + 裁位矩阵（本席亲跑实测 @`79382f4d`·docker 29.1.3·node 22.22.3·pnpm 10.28.0·零 Key·零模型外呼）

### 1.1 五门裁位矩阵（数字口径=本席实跑实测·EXEC 复跑照实记·偏差熔断见 §2）

| 门 | 脚本（根 package.json 行） | 通道 | 实测 EXIT | 实测时长 | PASS 数 | 裁位 |
|---|---|---|---|---|---|---|
| scoring-integrity | `scoring-integrity:prove`（`:495`） | isolated-runner 一次性本地 PG | 0 | 10.9s | **23** | **per-push 接线**（scor-parity 邻位） |
| tokenstream | `tokenstream:prove`（`:536`） | isolated-runner（`:raw`→worker prove） | 0 | 17.5s | **20** | **per-push 接线**（ci-wiring2 悬置件清偿） |
| stress | `stress:prove`（`:275`） | isolated-runner | 0 | **8.0s** | **29** | **per-push 接线**（裁位写明：8.0s 预算内·合并闸语义·非 nightly-ciw2） |
| uc003 i18n-locale | `uc003:i18n-locale:prove`（`:215`） | isolated-runner（raw 口径） | 0 | 2.9s | **7**（S1-S6+G3' 七查） | **per-push 接线**（raw 口径）；**UI 件 `uc003:i18n-locale-ui:prove` 不接线**（§1.4 注记） |
| ha6 | `ha6:prove`（`:658`） | 纯静态（零容器零网络） | **1** | 1.1s | 50（**27 FAIL**） | **登记不接线**（§1.5·归 ha6-repin 后另批） |

### 1.2 接线形（isolated-runner 形先例=neg 六步 ci.yml `:179-:190`+scor-parity `:247-:249`）

四门接线步=纯 `- name:`（中文述名+预算括注）+`run: pnpm <脚本名>` 两行形·零 env 零 if 零 retry 零 continue-on-error——与 neg 六步/scor-parity 恒同形·红即非零退出阻断合并（fail-loud）。插入位置=ci.yml `:249`（scor-parity 步 `run` 行）之后、`:250`（「agent 模型可观测」步）之前·四步顺序=scoring-integrity→tokenstream→stress→uc003:i18n-locale（先评分族后流式后上下文后 UC 结构·纯新增·既有 99 步名序列前缀恒等）。

### 1.3 stress 裁位写明（派单面「二择一」的裁决记录）

**裁 per-push（ci.yml verify job）·不裁 nightly-ciw2**。判据：①实测 8.0s∈预算（对宿内最贵件 sse-push 56.8s 有 7 倍余量·E5 判据满足）；②该门断言面=大答案链路截断/载荷净化/额度精确/舱壁不阻塞——合并闸语义，nightly 日跑软化违背 #114 确立的「负例门=合并闸语义·不作 nightly 软化」裁口径；③无 Key 依赖（scripted client·离线）无 per-push 障碍。

### 1.4 uc003 UI 件 chromium 注记（派单面「+ui 件需 chromium 注记」的落卷）

`uc003:i18n-locale-ui:prove`（根 package.json `:217`）=e2e:ui 通道（LIVE_OPTIONAL_UI·`scripts/isolated/targets-live-e2e.mjs:17`）·依赖三件=①`MODEL_API_KEY` 缺失即 throw（`scripts/run-e2e-ui.mjs:53`）②production `next build`（`:190-:206`）③Playwright chromium（`:222-:228`）。ci.yml `:332-:335` 既有注记自证 Key 缺失必须非零退出+禁 skip-if-absent——**三依赖 per-push CI 均不满足→本刀零接线零步骤·仅本节注记在卷**。其宿面（nightly/手动）归协调方另裁，本刀 Ban 借机接线。

### 1.5 ha6:prove 基线红全量名单（本席实跑·EXIT=1·50 PASS/27 FAIL·1.1s）

- max:1 census 漂 1 臂：got `[sse-notify.service.ts:255, worker main.ts:671]` vs expected `[…:151, …:661]`（内容零变纯位移·ha6-repin rev2 已登记同漂）+两行钉内容断言随漂（`:151`/`:661` 两 FAIL）。
- 行号内容锚漂 22 臂：auth.service.ts（`:11`/`:12`/`:13`/`:28`×2 臂/`:54`）·recruiter.service.ts（`:114`/`:116`）·quiz.controller.ts（`:56`）·interview.controller.ts（`:262`）·resume.service.ts（`:20`/`:36`/`:48`）·interview.service.ts（`:25`/`:27`/`:30`/`:338`/`:399`/`:432`/`:701`）——proof 自证句「行号再漂，回 REQUEST 补审」逐臂打印。
- 治理门漂 3 臂：`docker/compose.ha.yml` diff vs 基线 8ba93f0b 非恰一行新增；Ban violated: existing compose touched: `docker/compose.prod.yml`；package.json additive violated: `breaker:prove`。
- **根因定性**：该门为钉死 REQUEST 基线 `8ba93f0b` 的单刀治理回归 proof——基线后其余刀合法并线触其冻结面（锚行位移+compose 触面+脚本键增）→**结构性红·非环境假红**。重钉 owner=line/ha6-repin（`a5317ffd` rev2 在飞待复审·其基线 `8ae2a93e` 早于本基线·着陆时对届时 tip 再重 pin）·**本刀零触该 proof（Ban 就地修）**·接线归 ha6-repin 着陆+届时 tip 本地绿后另批（沿 ci-wiring2 对 tokenstream 基线红「零动作登记·归属勘明归后刀」先例）。

## §1-修法（wiring 刀·预期恰 1 码面文件 `.github/workflows/ci.yml`·零迁移零产品码零 proof 零 package.json）

- **件①（四门接线步）**：ci.yml `:249` 后插入以下逐字节内容（插入后既有步零重排·verify steps 99→103）：

```yaml
      # CI-WIRING3 五门接线（scor-parity 邻位·isolated-runner 一次性本地 PG·fail-loud 红即阻断）。
      # 裁位亲证 @79382f4d：四门本地实跑绿入 per-push；ha6:prove 基线红（50 PASS/27 FAIL·锚漂+治理门漂）
      # 不接线——归属 line/ha6-repin 重钉着陆后另批。
      # 评分/报告 P0 完整性（23 断言·本地实测 10.9s·总分确定性聚合+模型越权防护）
      - name: 评分/报告 P0 完整性（隔离一次性 PG·总分聚合不可被模型越权改写）
        run: pnpm scoring-integrity:prove
      # 流式 token 进度接线（20 断言·本地实测 17.5s·ci-wiring2 时代基线红已由在链后刀清偿）
      - name: 流式 token 进度接线（generation_started 先于业务结果落表+payload 白名单围栏）
        run: pnpm tokenstream:prove
      # 长上下文真实 v64 链路（29 断言·本地实测 8.0s·预算内裁 per-push 非 nightly-ciw2·合并闸语义）
      - name: 长上下文真实 v64 队列/图/报告链路（大答案截断+载荷净化+额度精确）
        run: pnpm stress:prove
      # UC003 i18n locale 结构断言（七查·本地实测 2.9s·raw 口径；UI 件需 chromium+Key+生产构建不在 per-push）
      - name: UC003 i18n locale 结构断言（S1-S6+G3' 七查·raw 隔离口径）
        run: pnpm uc003:i18n-locale:prove
```

- **件②（lint 注释对表刷新·ci-red-clear 并入本刀对表见 §0.0）**：ci.yml `:103-:106` 注释块四行整体替换为（仅注释·门语义零改·仅数值刷新+补 root 值·十二包全量对表 @`79382f4d`）：

```yaml
      # #96 LINT S3-S5 点亮（lint-design §1.5·四规则 warn 态零修复点亮）：turbo lint 全量绿 = per-workspace
      # "lint": "eslint . --max-warnings N"（点亮日 dlx dry-run 实测基线·CI-WIRING3 对表刷新 @79382f4d：
      # root 5235/api 1421/web 601/worker 954/ai-graphs 47/ai-runtime 628/config 0/contracts 265/
      # db-mysql 0/db 1042/domain 115/qdrant-store 27）——存量不破门、潜增即红；error 恒红（点亮日 dry-run 实测 error=0）。
```

- **件③（卷尾纪律注记追加）**：ci.yml 末行（`:344` 后）追加注释四行（纯增·登记本刀归属与不接线面）：

```yaml
      # CI-WIRING3 接线归属登记：四门（scoring-integrity/tokenstream/stress/uc003:i18n-locale）per-push+
      # lint 注释十二值对表刷新（补 root 5235·五陈旧值更正 api/web/worker/ai-runtime/db）。ha6:prove
      # 亲证基线红（50 PASS/27 FAIL）不接线·归属 line/ha6-repin 重钉后另批；UI 件（chromium+MODEL_API_KEY+
      # 生产构建三缺）与 nightly.yml/nightly-ciw2.yml 本刀零触。
```

- **件④（收据）**：`ai-docs/delivery/receipts/ci-wiring3/00-exec.md`——七字段（门矩阵全表+EXIT 原值+四门复跑时长与 PASS 计数+ha6 红名单 diff 对本卷 §1.5+diff numstat+重 pin 全表+偏离清单）·untracked 口径沿 negbend §9-③ 先例。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准）

1. **ci.yml 解析门**：`node -e`（js-yaml@4.3.2 repo 内 realpath 加载）parse EXIT=0·verify steps=**103**（基线 99+4·**新增步数熔断=恰 4**·多即停）·且既有 99 步 name 序列对本基线**前缀恒等**（js-yaml 抽取比对·错位即停=既有步被重排）。
2. **四门本地实跑绿**：`pnpm scoring-integrity:prove`/`pnpm tokenstream:prove`/`pnpm stress:prove`/`pnpm uc003:i18n-locale:prove` 四命令各恰 1 run EXIT=0·PASS 计数**恰 23/20/29/7**（**熔断=0 容差**·实测≠即触「现场漂移」停）·时长入收据（本卷基准 10.9/17.5/8.0/2.9s·EXEC 实测超基准 3 倍=预算熔断停手上报）。
3. **ha6 红登记恒等**：`pnpm ha6:prove` EXIT=1·50 PASS/27 FAIL·红名单与本卷 §1.5 **恒等**（多新 FAIL=现场漂移停·少 FAIL=已重钉·如实登记归 ha6-repin 对表）。
4. **邻面不回退（diff 机检）**：`git diff 79382f4d -- .github/workflows/ci.yml` 中删行（`^-`）集合**恰=件② 五陈旧值所在三注释行**·其余全部为纯增行（`^+`）——出现任何其他删行/改行即停（只增不减纪律）。
5. **nightly 双件零触**：`git hash-object` 对 `.github/workflows/nightly.yml`=`ac47e884`+`nightly-ciw2.yml`=`09cd220a` 恒等（blob 前后全等）。
6. **ui 件零接线**：`rg -c "i18n-locale-ui|e2e:ui" .github/workflows/ci.yml` 对基线恒等（=零新增命中）。
7. **typecheck 不回退**：`pnpm turbo typecheck` EXIT=0（8/8·若翻动 `apps/web/tsconfig.tsbuildinfo`→`git checkout` 回滚沿 negbend §9 先例）。
8. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2128**（基线 2123 本树亲跑·本卷落卷后预期 2124·**>2128 红停上报**）。
9. **markers 五类零命中**：本刀改动集（本卷 1 .md+EXEC 期 ci.yml+收据目录）五类标记词（词族=`scripts/i6-239-gates.proof.mjs:151-:153` 运行时组装四词+冲突标记对·**词面本卷不复抄防自匹配**）grep 零命中（命令与回执入收据）。
10. **diff 面机检**：起草 turn `git diff --numstat 79382f4d` 恰 1 tracked 路径=本卷 .md；EXEC turn 恰 2=ci.yml+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。
11. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼。
12. **CI 实跑（「推 PR 后观察」口径）**：本刀 EXEC 落卷后由 pusher/协调方推 `line/ci-wiring3` 开 PR——GitHub Actions verify job 全绿（含新增四步+件① 注释）=终证·EXEC 本地实跑为先行证·两者歧义以 CI 运行为准（歧义=停报·禁本地洗绿）——沿 ci-wiring2 §8「CI 自证特殊性」条款同形。

## §3 范围外（边界清单·越界即 FAIL）

1. **五门 proof/脚本本体零触**：§0.1 表列 `scoring-report-integrity.proof.ts`/`tokenstream-progress.proof.ts`/`context-stress.proof.ts`/`uc-e2e-003-i18n-locale.proof.mjs`/`ha6-companion.proof.mjs`/`run-e2e-isolated.mjs`/`run-e2e-ui.mjs` 前后 blob 全等——本刀纯 wiring·断言/预算/重钉皆非本刀面。
2. **package.json 零触**：五门注册行+lint 预算十二值零改（件② 只刷 ci.yml 注释·Ban 动真实预算值——预算 sanction 归 lint 线各刀）。
3. **ha6 接线与重钉零触**：`scripts/ha/ha6-companion.proof.mjs` 归 line/ha6-repin（§1.5）·Ban 本刀就地重钉/Ban 就地接线恒红门。
4. **UI 件零接线**：`uc003:i18n-locale-ui:prove`（§1.4 三缺）·Ban 借机接 e2e:ui 通道。
5. **nightly 双件零触**：`nightly.yml`/`nightly-ciw2.yml` blob 恒等（§2-5）·stress 不入 nightly-ciw2（§1.3 裁 per-push 已写明）。
6. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——行翻面权归协调方。
7. **零迁移零 DDL 零依赖升级零产品码**。

## §4 依赖

**①上游已满足**：tokenstream 基线红已由在链后刀清偿（§0.2-4 实测绿）；isolated-runner/neg 六步/scor-parity 接线形在链（ci.yml `:179-:190`/`:247-:249`）。**②在飞交叠**：ci-red-clear（tip=基线零 delta·件② 并入本刀·EXEC 日复核规则 §0.0）；ha6-repin（`a5317ffd` 待复审·与本刀触面零文件交叠·§0.0 复核规则）。**③下游**：ha6 接线=ha6-repin 着陆+届时 tip 本地绿后另批；UI 件宿面归协调方另裁。**④迁移号**：预期零迁移（§3-7）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit·CI 观察归 pusher/协调方）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§2-2 四门各恰 1 run·红不重跑冲销）；Ban 翻 pins（§5 十一值零翻转）；Ban 触五门 proof/脚本本体与 package.json（§3-1/§3-2）；Ban 接 ha6/Ban 就地重钉 ha6（§3-3·借机修 Ban）；Ban 接 UI 件/e2e:ui 通道（§3-4）；Ban 触 nightly 双件（§3-5）；Ban 改既有步语义/删除/重排（ci.yml 只增不减·§2-1 前缀恒等+§2-4 diff 机检承载）；Ban 动 lint 真实预算值（§3-2·件② 注释刷新≠预算变更）；Ban 双写件②（ci-red-clear 若已覆盖则摘除·§0.0 对表）；Ban 迁移 Ban DDL；Ban 改共享 SSOT（§3-6）；Ban 触其他工作树；Ban 伪造实测（§1 矩阵值本席亲跑为分母·EXEC 复跑如实记·Ban 抄卷值顶替）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄 negbend §5·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（本刀全门=静态/隔离库机械断言·零模型外呼·零 secrets 消耗）。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零模型外呼零 Key 加载零生产操作零 secrets 消耗。本席亲核用本地隔离容器 5 件次（isolated-runner 临时 `meetwise-e2e-*`·runner 自清·残留 0 亲证·四门全离线 scripted/结构断言·ha6 纯静态）·收据落 `.tmp/isolated-proof-receipts/`（gitignored `.gitignore:15`·树洁亲证）。EXEC 期四门复跑同离线形·est live=0 维持。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面不复抄卷内防自匹配——沿 negbend/ag04 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 裁位矩阵（四接一登）与 §1.3 stress 裁位、§1-修法件①②③ 逐字节内容与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号/blob 漂移如实改锚·结论不变只更锚·§0.0 在飞复核必做·§0.2 漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob 漂移·四门基线绿翻红或 PASS 计数≠23/20/29/7·verify steps≠99 基线·ha6 红名单对 §1.5 扩·ci-red-clear/ha6-repin 对本刀触面出现主线后新触（§0.0 规则）→停·重 pin 回炉。
- **机制不满足**：接线步 isolated-runner 语义下无法绿（容器起停/预算/依赖缺失类）·或四门本地复跑任一 EXIT≠0（红面不在本刀交付面）→停·如实升级协调方（Ban 凑绿 Ban 改步形放水）。
- **越界需要**：接线诉求超出 §1-修法三件（需触 proof 本体/package.json/nightly 双件/UI 件/产品码方能绿）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（docs:check>2128/lint 出现第三红/CI 推 PR 后 verify 红且归因非新增四步）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*CI-WIRING3 REQUEST · 2026-10-15 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`79382f4d` · 分支 `line/ci-wiring3` · 工作树 `meetwise-ciw3`（本起草席立·建前 branch+worktree 双查零同名）· 立项出处=CI 对账席五门未上 CI 对账+本席五门亲证实测（四绿一红·裁位矩阵 §1.1）· 修法=件① 四门接线步（scor-parity 邻位插入·neg 六步 isolated-runner 恒同形·fail-loud）+件② lint 注释十二值对表刷新（ci-red-clear 并入对表 §0.0）+件③ 卷尾纪律注记+件④ 收据· stress 裁位=per-push（8.0s 预算内+合并闸语义·§1.3 写明）· ha6=亲证基线红 50/27 登记不接线（归 ha6-repin 后另批·§1.5）· UI 件=chromium+Key+生产构建三缺注记不接线（§1.4）· 门矩阵十二门（解析 103/四门 23-20-29-7/ha6 恒等/邻面 diff 机检/nightly 双件 blob 恒等/ui 零接线/typecheck/docs:check≤2128/markers/diff 面机检/卫生/CI 推 PR 后观察）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
