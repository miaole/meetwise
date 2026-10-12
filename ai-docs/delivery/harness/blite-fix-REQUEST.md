# BLITE-FIX REQUEST（B-lite 修链清欠刀 · CI docs:check 69 红清欠+修链收编 · L 体量 · docs 形式改写+manifest 改径 · 恰 1 commit）

**Status**: **`draft:awaiting_pre_exec_dual`**（rev2=双审席1 FAIL 三阻塞处方九条修订落实·2026-10-12·仍待双审·本刀触面=53 红文件形式改写+1 .mjs 路径常量+2 治理指针件·零逻辑改写。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）

**立项触发**：241 提交首推 origin 后 ci workflow 红于 `docs:check`（base `685498f1` 实跑 EXIT=1·66 处内容红·rev1 落卷时点史实）。**rev2 重锚**：主线 tip `8b8e20bc` 实跑 69 处（§0·并卷新增 +3 恰对账）。授权链：PTP 卷 §2-8「断链既定取舍·修链归 B-lite 后续」+ §9 席2 R1/R2 修链清单移交 + `execution-master-checklist.md` 五处结账注「归 B-lite 清欠另刀」+ i5-caliber R-1「B-lite 欠账」登记。与 PTP 卷「潜伏红零修」条款的关系：PTP 修的是迁出件零红（迁移域 archive 零红已达成）；**本刀修留置件红**（活治理面+历史卷+收据在扫件）——零冲突、互补成全。

## §0 现状锚（起草席亲读·base `feat/mysql-schema-skeleton` @`8b8e20bc`（rev2 重锚·rev1 原钉 `685498f1` 已漂）·真扫描器实跑·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号/数字）

### 0.1 立项触发与红根因（亲证实测）

- `node scripts/ai-docs/check-docs.mjs` 实跑 **EXIT=1**·错误集 **69 处 = 66 PTP_LOCAL_PATH + 2 PTP_EXTERNAL_REFERENCE_LINK + 1 PTP_CODE_HOST_URL**（主线 tip `8b8e20bc` 参考树实跑·rev2 权威读数）·PTP_FILE_LIMIT 零命中（主线已根除·维持）。
- 扫描器钉形（`scripts/ai-docs/public-text-policy.mjs` 亲读）：LOCAL_PATH=字面本机主目录前缀形（`/`+`Users`+`/` 与 `/`+`private`+`tmp`+`/` 与 claude-`501` 三标记·任一子串命中·本卷一律拆词指称防自匹配）；CODE_HOST_URL=六大托管站 host/owner/repo 两段以上路径形；EXTERNAL_REFERENCE_LINK=已发布 markdown 四种外链标记形（行内链/引用定义/尖括号自动链/a-href）。扫描域=MANAGED_ROOTS 十根（ai-docs/apps/packages/scripts/docker/e2e/.github/.claude/ops/docs）×TEXT_EXTENSIONS·顶层 `receipts/` 不在域。
- 与 rev1 落卷时点 66 差集 **+3 恰对账**（并卷新红·逐条 file:line 机测）：`harness/e2e-scene-409-REQUEST.md:6`/`:8`（merge `b345b761` 并入）+ `harness/e2e-scene-batch2-REQUEST.md:6`（merge `f7082391` 并入）；`685498f1`→`8b8e20bc` 区间其余三 merge（`5cb78dab` authz 5A-1/`6ca2275b` ciw/`8b8e20bc` r3-v4-follow）**零新红**。+3 家族归类：F-A worktree 径形 2（两卷基线行）+ F-C 外部审计件径形 1（409 卷 ：8 更正版审计总表行）。PTP 时代 +5 差集（h5/g7trio2/e2e-assert-refresh 等·rev1 §0.1 卷载）已并入 66 基线·史实保留。

### 0.2 三源盘点（起草席机检·tip `8b8e20bc` 实测·rev2 全源重 pin）

**源一·主线实跑红 69 处/53 文件**（=51 基线文件+2 并卷新增文件·权威清单=§0.5·随卷落卷可复现）。**rev1 勘误**：rev1 写「66 处/50 文件」——文件数系误计，rev1 自卷 §0.5 清单 unique 实为 **51**（其 footer「54 文件」=51+manifest 1+治理 2 自洽佐证）·rev2 按实跑机测更正为 69/53。

**源二·修链清单（PTP §9 席2 R1 移交）**，本席机检重 pin（席2 原钉 139 休眠断链/3 fail-closed 变体/4 文件 8 处治理指针——其逐件机检集未随卷不可复现·沿 PTP R4 教训句以 EXEC 时点同法机检为准·如实登记）：

- **已接线 fail-closed 变体 3 具/断径 8 unique**（`scripts/run-e2e-isolated.mjs` `isolatedReceiptSources`·:1668-:1733 区段·三键行 :1668/`nhp` :1686/`prod-surface` :1710）:`r4-wrong-track-adv-live-pg:prove:raw`/`nhp-r4-adv-covered:prove:raw`/`r4-wrong-track-prod-surface:prove:raw`。**8 unique 断径构成=harness 4/eval 2/slices 2/顶层 0**（rev1 写「harness 3/顶层 1」系误·rev2 `git cat-file -e` 逐一亲证更正：harness 4=`r4-wrong-track-adv-live-pg.md`+`r4-wrong-track-adv.md`+`nhp-r4-adv-covered-path.md`+`r4-f1-wrong-track-prod-surface.md`（后两件原位均 MISSING·孰断机测定·两件皆断）；eval 2=`nhp-r4-adv-covered-path.eval.md`+`r4-f1-wrong-track-prod-surface.eval.md`；slices 2=`nhp-r4-adv-covered-path.slice.md`+`r4-f1-wrong-track-prod-surface.slice.md`；顶层 0）。**不改指 2 径**：`harness/r4-domain-isolation-status.md` 与 `non-happy-path-perf-load-case-matrix.md`（delivery 顶层）**原位实存**（git cat-file -e 亲证）——照 rev1 原文一并改指 archive 反制新断径·rev2 显式裁定**不改指**（§2-3 断言含此·§5 Ban 误扩）。**共享断径 2**（`r4-wrong-track-adv-live-pg.md`/`r4-wrong-track-adv.md`）三数组各现（:1682/:1705/:1731）→全替换行 **12**（2×3 共享+单数组 6）。8 unique 断径全数 `receipts/archive/2026-09-batch23/`（harness/eval/slices 子目录）同名可寻（find 亲证）。**fail-closed 实证**：消费端 `local-e2e-receipt.mjs` `sourceDigests` 对每径 `readFile`·缺文件 throw→receipt 写入失败→run 标 `failed=true`+EXIT 1（run-e2e-isolated.mjs:2756-2774 rev2 复验零漂）——三变体现状跑必 fail-closed。
- **worker readRepo 评估器 3 断径**（`apps/worker/evidence/r4-eg5-product-ssot-product-close.ts`——ciw `9b177b24` git mv 迁入·已并主线 `6ca2275b`·rev1 原钉 `apps/worker/src/` 径已失效如实改锚；`readRepo` existsSync 恒 false→空串→下游 regex 不中=静默降级非抛错·rev2 复验机制描述成立）。readRepo 全 6 径机测复验：**断 3**（`harness/g-r4-5-eg5-true-evidence-impl.md`/`receipts/2026-09-23-g-r4-5-eg5-product-ssot-evidence.json`/`harness/g-r4-5-eg5-product-ssot-product-close.md`）+**实存 3**（`gap-bug-backlog.md`/`m4-rag-hard-gates.md`/`w0-w8-workflow-status.md`）——「3 断径」计数复验成立。原「移交 ciw 随迁改径」**时点已过**（ciw 已 nail 并主线且未承接改径）→**归后继刀按新径承接**（§1-③/§3）。
- **ai-docs 活治理指针**：席2 钉 4 文件 8 处；本席全径机检（修正前缀误报后）=PTP 迁移所致可修 **2 文件 6 处**（`ai-docs/observability/alerting-runbook.md:55` 1 处+`ai-docs/delivery/non-happy-path-perf-load-case-matrix.md:68/:175×2/:176×2` 5 处·目标全 archive 可寻——rev2 复验零漂：`ha-2-graceful-REQUEST.md` archive 在位·`receipts/uc018-perf-load/` 与 `reviews/` nhp-batch 系 28 件在位）；`ai-docs/testing/governance-audit-index.json` 两径全仓不存在=**预存断链（R3 族·非 PTP 迁移所致）照登不洗**；`ai-docs/testing/traceability-manifest.json` 7 处系 glob 形（`public-text-policy*.mjs` 掐断误报·非断链）零操作。
- **长尾休眠断链（CI 不可见·docs:check 不验链完整性）**：本席机检口径（git-tracked·全径提取·存在性判定·glob 形剔除）=码面（apps/packages/scripts/docker/docs/.github）**338 处/189 unique/109 文件**+ai-docs 活面（除 archive 桶）**333 处/128 unique/104 文件**——量过大且与在飞 EXEC 触面高风险·**切分后继刀**（§3）。

**源三·152 空目录壳（PTP §9 席2 R2 移交）**：本席机检 **失配消解**——现 tip 工作树+主工作树实扫空目录 0/20：该 152 壳系 PTP EXEC 时点盘态（meetwise-ptp 树随 nail 删除+git checkout 自动剪枝 emptied dirs）·现态交付树（ai-docs/receipts 全域）**零空壳**；余 20 壳全属运行时杂壳（**.tmp 备份 12/apps 构建残壳 3/ai-docs 结构壳 5**——rev1 写「apps 残壳 5/ai-docs 结构壳 3」构成系误·rev2 主线树 `find -type d -empty` 实扫更正·总数 20 不变；五壳=`ai-docs/requirements/iterations`/`ai-docs/rules/devops`/`ai-docs/rules/frontend`/`ai-docs/skills/shared`/`ai-docs/skills/ai`）非本刀域。**R2 事实上已消解·零 rmdir 零 git 操作·如实改登记**。

### 0.3 在飞清册与划界（rev2 刷新·2026-10-12 `git worktree list` 七树实测）

meetwise（主线 tip `8b8e20bc`）/meetwise-5e（line/5e-group @`41d04062`·在飞）/meetwise-authz（line/authz-harden @`74374a01`·**5A-2 rev2 补漏在飞**·5A-1 已并主线 `5cb78dab`）/meetwise-blite（line/blite-fix @`67d39795`·**本 rev2 席切回使用**）/meetwise-e2sc（line/e2e-scene-409 @`3735d6b9`·已并主线 `b345b761`·树余留）/meetwise-i6（line/i6-239 @`7b6d0f38`·#239 D6 EXEC 在飞·draft 卷 `5a9797d3`·rev1 时点不存在·新现）/meetwise-line-entpay（line/batch1-residual @`ab02d499`·在飞）。**ciw/e2s2 两树已删**（各已并主线 `6ca2275b`/`f7082391`·rev1 清册相应注销）。**逐树 `git diff --name-only <base>...branch -- ai-docs` 机证：在飞分支（5e/authz/i6/batch1-residual）触 ai-docs 与 §0.5 五十三红文件交集=空（2026-10-12 复测）**——本刀主线改写零在飞冲突。**authz 5A-2 触 `scripts/run-e2e-isolated.mjs` 三区**（:97-99 `isolatedReceiptSources` 新目·纯码径零 ai-docs 串；:1799 区允许表；:2183 区命令映射·diff hunk 亲读）——与本刀 :1668-:1733 三数组**零行重叠**·软协调随 §4。在飞卷 REQUEST 自带的本机径形红（各卷 ：5/:8 基线/worktree 行）**现不在主线扫描域**·待其 nail 并主线后成「并卷新增红」·归后继同族刀或随该卷自身勘误清欠（沿 h5/e2e-assert-refresh/e2e-scene 两卷先例）——**本刀 scope 显式划界**。

### 0.4 治理面（亲证）

活治理面留置件（NORTH-STAR-EXECUTION-LOOP/execution-master-checklist/PARALLEL-DISPATCH/extreview-fix-campaign-SOP/product-campaign-EXECUTION-SOP 等具名件）在 §0.5 清单内者·其红**必须本刀修掉 CI 才绿**——修法=形式改写（本机径改符号名/占位/描述语）·语义零改（分支名/SHA/引用行号/EXIT 值/表结构逐字节保留）。本刀零触 PTP 迁移域（`receipts/archive/` 内容逐字节零动）·零触共享 SSOT（LEDGER/batch-residual-plan/issues-master 只读）·Ban 改语义只改形式。

### 0.5 预演机检 69 清单（权威对账单·rev2 重锚主线 tip `8b8e20bc` 实跑取数·EXEC 前重跑全等对账·漂移逐条登记）

66 处 PTP_LOCAL_PATH（file:line·=rev1 基线 63+并卷新增 3）：

```text
ai-docs/delivery/PARALLEL-DISPATCH-2026-10-02.md:24
ai-docs/delivery/execution-master-checklist.md:634
ai-docs/delivery/harness/NORTH-STAR-EXECUTION-LOOP.md:4
ai-docs/delivery/harness/NORTH-STAR-EXECUTION-LOOP.md:8
ai-docs/delivery/harness/b110-REQUEST.md:6
ai-docs/delivery/harness/cmop03-driver-assertion-fix.md:12
ai-docs/delivery/harness/cmop03-post7b-discriminator.md:10
ai-docs/delivery/harness/cmop03-weak-input-calib.md:14
ai-docs/delivery/harness/e2e-assert-refresh-REQUEST.md:8
ai-docs/delivery/harness/e2e-scene-409-REQUEST.md:6
ai-docs/delivery/harness/e2e-scene-409-REQUEST.md:8
ai-docs/delivery/harness/e2e-scene-batch2-REQUEST.md:6
ai-docs/delivery/harness/errmsg-map-REQUEST.md:5
ai-docs/delivery/harness/extrev-deps-audit-REQUEST.md:8
ai-docs/delivery/harness/extrev-score-writer-REQUEST.md:8
ai-docs/delivery/harness/extreview-fix-campaign-SOP.md:3
ai-docs/delivery/harness/g2-report-page-REQUEST.md:5
ai-docs/delivery/harness/g2-report-page-REQUEST.md:8
ai-docs/delivery/harness/g7-enoent-fix-REQUEST.md:4
ai-docs/delivery/harness/g7-path-b-honesty-classification.md:9
ai-docs/delivery/harness/g7-trio-disclosure-techrole-honesty.md:6
ai-docs/delivery/harness/g7-trio-keyed-fresh-run.md:10
ai-docs/delivery/harness/g7-trio-keyed-fresh-run.md:52
ai-docs/delivery/harness/g7-trio-keyed-fresh-run.md:54
ai-docs/delivery/harness/g7r-ff-last-error-discriminator.md:14
ai-docs/delivery/harness/g7r-ff-last-error-discriminator.md:104
ai-docs/delivery/harness/g7v-spec-calib-thirdarm.md:8
ai-docs/delivery/harness/g7v-spec-calib-thirdarm.md:16
ai-docs/delivery/harness/g7v-spec-calib-thirdarm.md:146
ai-docs/delivery/harness/g7v-thirdarm-copy-fix.md:8
ai-docs/delivery/harness/g7v-thirdarm-copy-fix.md:72
ai-docs/delivery/harness/g7v-thirdarm-copy-fix.md:83
ai-docs/delivery/harness/g7w-golden-api-discriminator.md:11
ai-docs/delivery/harness/g7w-golden-residual-arm.md:11
ai-docs/delivery/harness/g7y-trio-rerun.md:11
ai-docs/delivery/harness/gap-adaptive-early-stop.md:8
ai-docs/delivery/harness/gap-begin-snapshot-supply-fix.md:8
ai-docs/delivery/harness/gap-e2e-iso-banner-pg-retained.md:7
ai-docs/delivery/harness/gap-flake-rootcause-investigation.md:6
ai-docs/delivery/harness/gap-g7k-api-reds-fix.md:10
ai-docs/delivery/harness/gap-g7k-api-reds-fix.md:72
ai-docs/delivery/harness/gap-priv-authz-prove-flake-teed-oneshot.md:7
ai-docs/delivery/harness/gap-priv-authz-prove-flake-teed-oneshot.md:28
ai-docs/delivery/harness/gap-red1-timing-face.md:8
ai-docs/delivery/harness/gap-route-classify-quality.md:8
ai-docs/delivery/harness/gap-sole-stack-align.md:7
ai-docs/delivery/harness/gap-uc002-adv-led-crossuser-nhp.md:6
ai-docs/delivery/harness/gap-uc011-adv-main-mouth-wiring.md:6
ai-docs/delivery/harness/gap-uc014-026-adv-webhook-nhp.md:6
ai-docs/delivery/harness/gap-uc016-fault-inject-nhp.md:7
ai-docs/delivery/harness/gap-uc017-load-sweep-nhp.md:7
ai-docs/delivery/harness/growth-gen-REQUEST.md:5
ai-docs/delivery/harness/growth-gen-REQUEST.md:8
ai-docs/delivery/harness/h1-thresholds.md:7
ai-docs/delivery/harness/h5-role-input-REQUEST.md:8
ai-docs/delivery/harness/h5-role-input-REQUEST.md:41
ai-docs/delivery/harness/nhp-028-fault-01-trace-fail-open.md:7
ai-docs/delivery/harness/parity-baseline-regen.md:10
ai-docs/delivery/harness/product-campaign-EXECUTION-SOP.md:3
ai-docs/delivery/harness/qgen-schema-env-recheck.md:13
ai-docs/delivery/harness/rag03c-exactk-observe.md:13
ai-docs/delivery/harness/resume-grounding-REQUEST.md:5
ai-docs/delivery/harness/resume-grounding-REQUEST.md:6
ai-docs/delivery/receipts/evidence-delivery/2026-10-10-exec-prove.md:4
ai-docs/delivery/receipts/g7trio2-full/00-exec-receipt.md:9
ai-docs/delivery/receipts/g7trio2-full/cmd3-perf-suite-receipt.json:11
```

PTP_EXTERNAL_REFERENCE_LINK 2 处：`ai-docs/delivery/harness/g7-key-x3-freetieronly-reprove.md:195` `:196`（云端帮助页行内链标记形）。PTP_CODE_HOST_URL 1 处：`ai-docs/delivery/harness/ha-track.multi-instance.md:50`（CI live run 托管 URL 形·run id `35930389740`/artifact `10781320550` 为证据钉值保留）。

### 0.6 防重双对表（过）

`rg -l "B-lite|blite-fix" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md` 命中 2 件逐条判定：①`execution-master-checklist.md` 五处结账注=PTP 刀移交注记（「归 B-lite 清欠另刀」）·非刀卷；②`i5-caliber-REQUEST.md:158`=欠账登记引用·非刀卷。harness 无同名卷（blite-fix-REQUEST 唯一）·分支 `line/blite-fix` 与工作树 `meetwise-blite` 建前 `git worktree list` 实查不存在·本席新建。

## §1 修法（三件·file:line 实锚·EXEC 立项重 pin·**Ban 改语义只改形式**）

### ① 69 处 CI 红形式改写（53 文件=51 基线+2 并卷新增·逐处判语境·族签 EXEC 时点逐行重验）

统一铁律：**分支名/commit SHA（短全 both）/引用行号/EXIT 值/表列结构/命令语义逐字节保留**；仅机器本机径形与外链标记形改写。族谱（按 §0.5 清单逐处归类·rev2 机测重计数）：

- **F-A worktree 径形（51 处·机测=49 基线+2 并卷新增）**：本机绝对径 `…/Desktop/golucky/meetwise-<树名>` → 符号名 `meetwise-<树名>`（保留 worktree 名）+每卷首现处附「（仓根同级 worktree）」描述语。例：`gap-priv-authz-prove-flake-teed-oneshot.md:7/:28`、`execution-master-checklist.md:634`、`cmd3-perf-suite-receipt.json:11`（JSON 串内路径同法符号化·收据证据本体 log 零触·随卷登记形式改写注记）+并卷新增 `e2e-scene-409-REQUEST.md:6`/`e2e-scene-batch2-REQUEST.md:6`。
- **F-B 本仓根径形（3 处·rev2 机测维持）**：`NORTH-STAR-EXECUTION-LOOP.md:4/:8`、`PARALLEL-DISPATCH-2026-10-02.md:24` → `<repo>`（本仓根）占位形。
- **F-C 外部审计件径形（10 行/11 出现·机测·含并卷新增 1）**：`extreview-fix-campaign-SOP.md:3`、`product-campaign-EXECUTION-SOP.md:3`、`extrev-deps-audit-REQUEST.md:8`、`extrev-score-writer-REQUEST.md:8`（2 出现）、`growth-gen-REQUEST.md:8`、`h1-thresholds.md:7`、`g2-report-page-REQUEST.md:8`、`resume-grounding-REQUEST.md:6`、`b110-REQUEST.md:6`、并卷新增 `e2e-scene-409-REQUEST.md:8` 等 → 描述引用「外部审计总表（本机外部件·不入仓）`issues-master.md`」+行号钉值保留；文档名与条目号零动。
- **F-D secrets loader 径形（1 处）**：`g7-trio-keyed-fresh-run.md:54` 本机主目录前缀 → `~/.meetwise-secrets/MODEL_API_KEY` 波浪形（loader 语义逐字保留·非密钥本体·路径形式净化）。
- **F-E 杂径形（1 处·机测）**：`h5-role-input-REQUEST.md:41`（错误日志引录内 workspace 径）→ 占位/描述形·错误语义（wrong-cwd ENOENT）保留。
- **F-F 外链标记形（2 处）**：`g7-key-x3-freetieronly-reprove.md:195/:196` 云端帮助页行内链 → 描述引用（页名保留+「（云端帮助页）」）·链标记剥离·表语义零动。
- **F-G 托管 URL 形（1 处）**：`ha-track.multi-instance.md:50` → run id/artifact id 钉值保留+「（托管 URL 形不列·CI live run 记录）」注记·`haStatus=NOT_HA` 等诚实语义零动。

### ② 修链收编（3 文件·18 触点=manifest 12 替换行/8 unique 断径+治理指针 6 处·全 archive 可寻）

- **manifest 三变体 8 unique 断径改指 archive 新址**：`scripts/run-e2e-isolated.mjs` `isolatedReceiptSources` 之 `r4-wrong-track-adv-live-pg:prove:raw`/`nhp-r4-adv-covered:prove:raw`/`r4-wrong-track-prod-surface:prove:raw` 三键数组内断径 → `receipts/archive/2026-09-batch23/`（harness/eval/slices 子目录）对应新径（逐径映射 EXEC 落表·**构成 harness 4/eval 2/slices 2/顶层 0**·共享 2 径三数组各现 :1682/:1705/:1731·**全替换行=12**=共享 2×3+单数组 6·rev1 写「harness 3/顶层 1」构成系误·rev2 机测更正）。**不改指 2 径**：`harness/r4-domain-isolation-status.md` 与 `non-happy-path-perf-load-case-matrix.md` 原位实存（git cat-file -e 亲证）·原样零触——误改指=制造新断径=FAIL。**同文件 `adr-postgres-retained.md` 3 处（:6/:2315/:2690）系实存非断链——Ban 误扩·零触**（禁一切「按 ai-docs/delivery 前缀全量替换」式粗放操作·只动 8 unique 断径 12 行）。**fail-closed 论证**：改径后 `sourceDigests` 恢复可读（archive 件=PTP R100 纯迁移·与原径字节同一）→ 收据 sourceDigests 链语义等价续存·三变体由「必 fail-closed」恢复「可跑可收据」·不裁撤变体（证明链零退役·诚实性零降级）。仅路径字符串常量·零逻辑改。
- **治理指针 2 文件 6 处改链**：`alerting-runbook.md:55` → `receipts/archive/2026-09-batch23/harness/ha-2-graceful-REQUEST.md`；`non-happy-path-perf-load-case-matrix.md:68` → `receipts/archive/2026-09-batch23/receipts/uc018-perf-load/`、`:175×2/:176×2` → `receipts/archive/2026-09-batch23/reviews/` 对应新径。

### ③ 零操作登记（随卷如实·不构成动作）

- **R2 空壳 152→0 消解登记**（§0.2 源三·零 rmdir）。
- **R3 预存断链照登不洗**：governance-audit-index.json 两径等全仓不存在之既存断链·非 PTP 迁移所致·归长尾后继刀再判。
- **r4-eg5 readRepo 3 断径归后继刀按新径承接**：`apps/worker/evidence/r4-eg5-product-ssot-product-close.ts`（ciw `9b177b24` git mv 迁入·已并主线 `6ca2275b`·rev1 原钉 `apps/worker/src/` 径与「移交 ciw」时点均已过——ciw 已 nail 并主线且未承接改径）·断径 3/实存 3 机测明细见 §0.2 源二·后继刀按新径承接·本刀零触该文件。
- **长尾切分后继刀（B-lite-2 建议）**：码面 338 处/109 文件+ai-docs 活面 333 处/104 文件休眠断链·本卷 §0.2 机检口径与方法（全径提取+存在性判定+glob 剔除）随卷可复现·后继刀立项照法重 pin。
- **在飞各卷 ：5/:8 行红线划界**：§0.3（rev2 清册：在飞四卷 5e/authz/i6/batch1-residual）·随并卷归口。

## §2 验收断言（pre-exec 双审核对单基面·EXEC 立项重 pin）

1. **终局断言**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（valid:true errors:0）——本刀唯一终局验收·EXEC 收据贴全输出。
2. **逐族对账断言**：EXEC 开工前基线重跑与 §0.5 清单逐条全等（69 处 file:line）·改写后三族各零命中（66+2+1→0/0/0）·超集或异集=FAIL·漂移逐条登记。
3. **manifest 修复断言**：8 unique 新径逐径 `existsSync=true`（node 一行断言脚本随 EXEC 收据）+`rg -c "receipts/archive/2026-09-batch23" scripts/run-e2e-isolated.mjs` 基线 0（rev2 机测）→改后 **12·增量恰 +12**（rev1 原写 +8 系按 unique 误计——共享 2 径三数组各现·替换行=2×3+单数组 6）·三键名零改·数组其余径零动·不改指 2 径与 `adr-postgres-retained.md` 3 处原样零触（Ban 误扩·误改指/误触=FAIL）。
4. **形式改写纯度断言（rev2 操作化重写）**：full-SHA 铁律不变·机检改用 **40hex 出现次数多重集相等**——
   `diff <(git diff -U0 <base> HEAD | grep '^+' | grep -oE '[0-9a-f]{40}' | sort | uniq -c) <(git diff -U0 <base> HEAD | grep '^-' | grep -oE '[0-9a-f]{40}' | sort | uniq -c)`
   **EXIT=0 即 PASS**（`<base>`=EXEC 立项 §0 重锚值·本 rev2 时点=`8b8e20bc`）。语义：每个 full-SHA 在 +/− 两侧按同一出现次数成对存续=「SHA 逐字节保留」铁律的等价机检化——任一 SHA 增/删/换值→多重集破裂→FAIL；纯形式改写（SHA 原样随行重写）→恒 PASS。**重写缘由**：rev1 原式 `git diff | grep -E '^[+-].*[0-9a-f]{40}'` 要求 EXIT=1 按字面不可满足——66 处 LOCAL 红线中 **22 行本身含 full-SHA**（rev2 机测 22/66）·铁律保留→改写行必含 40hex→该式恒假 FAIL（把合规判成违规）。行首 `+++`/`---` 头无 40hex 不扰判定。分支名/引用行号不改（双审逐 hunk 核）维持。
5. **自匹配防断言**：本卷与全部改写件复扫·三族标记零新增（断言 1 蕴含）·本卷文本以拆词形指称标记（防自命中·沿扫描器同款先例）。

## §3 范围外（边界清单七条·越界即 FAIL·rev2 计数口径统一——rev1 commit 语曾称「八条」实 7 bullet·以本卷 bullet 数为准）

- 长尾休眠断链（码面+ai-docs 活面·§1-③·后继 B-lite-2）；
- `apps/worker/evidence/r4-eg5-product-ssot-product-close.ts` readRepo 3 断径（ciw 已并主线未承接·归后继刀按新径承接）；
- 在飞四卷分支内文件（5e/authz/i6/batch1-residual·§0.3）与已并余树（e2sc 树余留）及其 REQUEST 自带红线；
- R3 预存断链（照登不洗）；`receipts/archive/` 迁移域内容逐字节零触；顶层 `receipts/` 零触（不在扫描域·零操作）；
- 码面逻辑零改：`.mjs` 仅路径字符串常量·零 import/控制流/语义改；其余码面（ts/tsx/sql/yaml 业务面）零触；
- 共享 SSOT（product-campaign-LEDGER/batch-residual-plan/issues-master）只读；pins 十一值零翻；MAX_FILES cap 零动；
- 空壳 rmdir 零操作（R2 已消解·如 EXEC 时点重扫出现新增交付树空壳·照登不顺手扩权）。

## §4 依赖与时序

零硬闸（不依赖任何在飞卷落点·纯主线文本面）。软协调三条（rev2 刷新）：①原 ciw 协调已完成时态——`line/ci-wiring` 已 nail 并主线（`6ca2275b`）·本刀 manifest 三数组（:1668-:1733）与其已落触面零冲突机证维持；②authz 5A-2 在飞同触 `scripts/run-e2e-isolated.mjs` 三区（:97-99/:1799 区/:2183 区·§0.3）与本刀三数组零行重叠（diff hunk 亲读）——若 authz 先并·EXEC 立项照 §0 协议重 pin 基线（断言 3 的 rg 增量按新基线复测·authz 新目纯码径零 archive 串·预期 +12 不变）；③建议本刀先于在飞各卷 nail 落主线（CI 转绿·后续并卷基线干净·并卷新增红沿先例归口后继）。

## §5 Ban 列表 + pins（沿 PTP 卷 §5 同源逐字誊 + 本刀面增补/豁免）

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/issues-master 只读）；Ban 触其他工作树（在飞四树零触·§0.3）；Ban 伪造已问/已验来源；**本刀增补**：Ban 改语义（形式改写铁律·§1 统一铁律逐 hunk 双审核）；Ban 触 `receipts/archive/` 与顶层 `receipts/` 内容；Ban 触码面逻辑（`.mjs` 仅路径常量串）；Ban 修长尾/R3/r4-eg5（§3 划界·越界即 FAIL）；**Ban 误扩（rev2 增补）**——manifest 同文件原位实存径禁改指禁触：`r4-domain-isolation-status.md`/`non-happy-path-perf-load-case-matrix.md`/`adr-postgres-retained.md` 3 处（:6/:2315/:2690）·禁「按 ai-docs/delivery 前缀全量替换」式粗放操作（§1-②/§2-3）；Ban 动 MAX_FILES cap 与扫描器规则本体（`public-text-policy.mjs` 零触）；Ban 新增红形（改写件与本卷复扫零命中）；Ban 伪造「全绿」宣称（断言 1 输出如实贴卷·EXIT 非 0 即如实登记 FAIL）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）。

## §6 est live=0

本刀零模型外呼：全部触面=docs 形式改写+路径字符串常量+断言脚本本地一行（零网络零模型零 secrets）——全静态·零生产操作·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本卷改动集（恰 1 .md·本卷）**五类卫生标记词 grep 零命中**（起草席自检·rev1 落卷与 rev2 修订各自检一次·命令与回执留 prove·EXEC 收据复核）。五类标记词不复抄卷内（避免自匹配·沿 ptp-archive/diag/h2 卷同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本卷恰 1 .md·每版恰 1 commit）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——本卷 §0 数字/行号=base `8b8e20bc` 实测·漂移必登记）。**Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**rev2 版记（2026-10-12）**：双审席1 FAIL 三阻塞（fail-closed 方向）处方落实——九条修订=§0.5 重锚 66→69+§1 冻结面扩容+§1-② 8 断径构成更正（harness 4/eval 2/slices 2/顶层 0+不改指 2 径）+§2-3 增量 +8→+12+§2-4 断言操作化重写（40hex 多重集相等）+r4-eg5 移交锚更新（evidence 新径·后继刀承接）+§0.3 在飞清册刷新+杂项勘误（空壳构成/七条口径/adr Ban 误扩/全卷计数）+形制维持（pins/STOP/markers 零翻）——§1 修法语义与 §5 pins 零翻转·数字/构成/锚点更正系 §0 协议「基线漂移如实改锚」之行使·仍待双审。

---

*BLITE-FIX REQUEST · rev2 · 2026-10-12 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`8b8e20bc`（rev2 重锚·rev1 原钉 `685498f1`）· 分支 `line/blite-fix` · 工作树 `meetwise-blite`（rev1 起草席立·rev2 席切回使用）· 形制沿 ptp-archive-REQUEST rev2（§0-§8 全·Ban/pins 同源誊录）· 触面=56 文件 87 处（53 红文件 69 处+manifest 1 文件 12 替换行+治理指针 2 文件 6 处）· 三源盘点=主线实跑 69 红（66 基线+3 并卷新增恰对账）/修链（fail-closed 实证+r4-eg5 后继刀按新径承接+长尾切分）/空壳 R2 失配消解（152→0·零 rmdir·杂壳构成 12/3/5 实扫更正）· 断言候选五条（check-docs EXIT=0 终局+逐族对账 69 全等+manifest existsSync 8 径+rg 增量恰 +12+diff 纯度=40hex 多重集相等 rev2 操作化+自匹配防）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
