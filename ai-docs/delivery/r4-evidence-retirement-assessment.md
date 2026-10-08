# r4 证据脚本退役评估（DBSB-1 · GAP-DEBT-BE-R4SCRIPTS 退役评估子面）

**Date**: 2026-10-08 · **Author**: mw-core（EXEC 授权 @8241ba3a）
**Scope**: 仅退役**评估**与触发条件 + prove 别名保全契约。**本刀零 r4 文件位移、零别名改名**（物理迁出归 DIR-1 B3 · 冲突让位五条见 `harness/dbsb1-src-boiler-convergence.md` §5）。
**现状亲核 @EXEC**: `apps/worker/src/r4-*.ts` 31 文件 7163 行（worker src 45.8%·运行时零 import）；`apps/worker/test/r4-*.proof.ts` 35 文件；`apps/worker/package.json` `prove:r4-*` 别名 35 条；根聚合别名（`r4-real-wire-impl:prove` 等）与 `scripts/run-e2e-isolated.mjs` target 注册若干。

---

## 1. 退役判定框架（触发条件）

一条 r4 prove 别名**只有同时满足**以下全部条件才进入可退役评估，且退役本身须另立刀（本刀不执行任何退役）：

| # | 条件 | 判据 |
|---|------|------|
| T1 | 证据已被后续卷取代 | 该 prove 断言的事实已被更新的已闭卷（nail commit 链）以更严断言覆盖，且旧收据不再被任何 SSOT/对表勾销块引用 |
| T2 | 无 standing pin 依赖 | 别名不在任何 pins 照抄面（gR45Closed / coveredCount / ms3EqualsR4Closed 等）的**生成路径**上——若该 prove 的输出仍被用于维持某 pin 的「如实登记」义务，永续 |
| T3 | 无 live 连接 | 别名不连真库/真模型（live-pg 族天然不满足，除非其 live 面已另行关闭并留痕） |
| T4 | 收据链冻结 | 最后一次绿收据已入 `.tmp/isolated-proof-receipts` 归档且 commit 链可追——退役后历史收据仍可解释（别名删除≠收据作废，但须留「退役登记」指针） |
| T5 | 协同窗口 | DIR-1 B3 文件夹化已落地（退役操作在 B3 的新路径上做，避免双重搬迁） |

**退役动作定义**（后续刀）：别名删除 + 退役登记表回填（本文件 §4 追加行）+ 源/proof 文件删除或归档——一切以 B3 落地后的路径为准。

## 2. 永续集（不可退役 · 逐条列名）

以下别名承载活防线或 standing 义务，**长期保留**（迁移后按新路径继续可跑）：

| 别名族 | 具体别名 | 永续理由 |
|--------|---------|---------|
| live 连接防线 | `prove:r4-wrong-track-adv-live-pg` · `prove:nhp-r4-adv-covered` | 连真库的 wrong-track/adv 覆盖防线；g7SuiteGreen=false 仍开卷，防线未闭 |
| 实体接线 | `prove:r4-real-wire-impl` | R4 真实接线回归面（0130/0131/0132/0133 job-route 链的活断言） |
| wrong-track 产品面 | `prove:r4-wrong-track-adv` · `prove:r4-wrong-track-prod-surface` | 生产面谎报路由防线（G7 wrong-track 谎言族），产品未关 |
| P-meta planner | `prove:r4-p-planner-unit`（domain）· `prove:r4-p-meta-p-r1` · `prove:r4-p-r1-fail-closed` | P-meta 判定/R1 fail-closed 语义仍在产品路径 |
| P-meta serving 族 | `prove:r4-p-meta-serving` · `prove:r4-p-meta-serving-product` · `prove:r4-p-meta-ms1-product-wire` · `prove:r4-p-meta-ms2-facets-product` · `prove:r4-p-meta-ms3-deploy-product` | ms1/ms2/ms3 里程碑接线回归面；ms3EqualsR4Closed=false（pin），防线活 |
| 终态把关 | `prove:r4-funnel-product-close` · `prove:r4-pr1-product-close` · `prove:r4-g-r4-5-product-close` | product-close **重评路径**（gR45Closed=true 但 flip 资格重评入口必须保留——头注自述 reassess path） |
| EG 终态把关 | `prove:r4-eg1-dual-claim-product-close` · `prove:r4-eg2-funnel-covered-product-close` · `prove:r4-eg2-funnel-covered-matrix` · `prove:r4-eg3-domain-isolation-product-close` · `prove:r4-eg4-wrong-track-product-close` · `prove:r4-eg5-product-ssot-product-close` · `prove:r4-eg6-ms3-ne-r4-product-close` | EG1–EG6 各自的 product-close/矩阵重评入口（EG1/2/4/5/6 product 未闭——闭卷前不可退役） |

## 3. 可退役候选集（满足 §1 触发条件后由后续刀裁定 · 逐条列名）

| 别名 | 初判依据（T1-T5 命中面） | 前置 |
|------|------------------------|------|
| `prove:r4-eg1-dual-claim-evidence` | 中间证据已被 `…product-close` 收编（evidence vs close 双轨中 evidence 层被取代） | EG1 闭卷 + T4/T5 |
| `prove:r4-eg3-domain-isolation-product`（evidence 层） | 同上（product evidence 被 product-close 取代） | EG3 重评口径冻结后 |
| `prove:r4-eg4-wrong-track-product`（evidence 层） | 同上 | EG4 闭卷 |
| `prove:r4-eg5-product-ssot`（evidence 层） | 同上 | EG5 闭卷 |
| `prove:r4-eg6-ms3-ne-r4`（evidence 层） | 同上 | EG6 闭卷 + ms3EqualsR4Closed 裁定终局 |
| `prove:r4-pr1b-combo-root-flag-on-evidence` · `prove:r4-pr1c-default-on-no-legacy-evidence` | 一次性 flag/default 回填证据（PR1b/PR1c 批次已收） | 确认无重评入口引用 |
| `prove:r4-funnel-covered-count-batch1` / `batch2` / `batch2b-02b-wire` / `batch3` / `batch3b-05-06-wire` / `batch4` / `batch4b-08-eval` | 一次性 coveredCount 回填批次证明（coveredCount=8 已定 pin 冻结——增量断言使命已完成） | T2 复核（确认 coveredCount 维持义务不由这些 prove 承载）+ T5 |

**初判不改任何现状**：以上候选在后续刀逐条过 §1 五条件并留退役登记后才可移除；任何一条不满足即回落永续集。

## 4. prove 别名保全契约（DBSB-1 交付 · 对 B3 硬约束）

1. DIR-1 B3 迁移 `apps/worker/src/r4-*.ts` 与 `test/r4-*.proof.ts` 时，`apps/worker/package.json` 的 `prove:r4-*` **别名名一字不改**，仅允许改路径段指向新位置；根聚合别名与 `run-e2e-isolated.mjs` target 注册同步改路径不改名。
2. 迁移后全部别名必须继续解析到实文件（DBSB-1 prove P6-1 断言——B3 落地后该 prove 自动按新路径校验，不按旧路径硬编码）。
3. 历史收据（`.tmp/isolated-proof-receipts`）与已推 commit 链不因迁移作废；B3 收据须登记「r4 别名名→新路径」映射表。
4. 本评估文档随退役/迁移事件在 §5 追加登记行（append-only）。

## 5. 事件登记（append-only）

| 日期 | 事件 | 卷 |
|------|------|----|
| 2026-10-08 | DBSB-1 EXEC 落本评估 + P6 别名保全断言入 `dbsb1-src-boiler.proof.ts`（零位移零改名） | DBSB-1 exec |

---

*DBSB-1 · r4 retirement assessment · 2026-10-08 · docs-only on the r4 surface · 物理迁出归 DIR-1 B3*
