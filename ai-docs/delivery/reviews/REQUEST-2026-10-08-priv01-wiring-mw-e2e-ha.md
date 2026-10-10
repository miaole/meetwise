# REQUEST — **PRIV01-C · GAP-PRIV-01 应用层 tenant 强制接线 PR（纵深防御第二层）** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-privacy-int`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-e2e-ha`
**Peer**: `mw-privacy-int`（独立签 · alone ≠ dual）
**Knife**: `harness/priv01-tenant-wiring.md` · slice `priv01-tenant-wiring.slice.md`
**Parent tip**: `eef469d9`（full `eef469d9b1305e290d41f510922c0b0795f2266f` · `origin/feat/mysql-schema-skeleton` tip · not a prove tip · 开工时点 origin 最新 tip · 满足预期 ≥`eef469d9`；fetch up-to-date · ff no-op）
**边界 cite**: `:58` GAP-PRIV-02（公开 DELETE=503 冻结 · `privacy.controller.ts:51-52` 实码）· `:60` GAP-PRIV-04（vector erase）· `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION（OPEN）· `:68` GAP-PRIV-AUTHZ-PROVE-FLAKE（OPEN · cause-unknown · Ban retry-to-green）——**只读边界 · Ban 借证据/状态 · Ban 洗 OPEN 钉**
**Date**: 2026-10-07（本机 · stub 名 `REQUEST-2026-10-08-*` 系协调方 mandate 跨日命名）
**Line**: **PRIV01-C**（GAP-PRIV-01 接线刀 · PRIV01-A 立卷 + PRIV01-B 设计已 nail @主线 · 队列 Phase 3 privacy）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained**（授权根仍为 PG RLS / `asPrincipal`+`set_config` · Ban 授权根迁移叙事 · Ban abandon RLS） |
| 公开 DELETE | **503**（stays · GAP-PRIV-02 `:58` 冻结） |
| `g7SuiteGreen` | **false** |
| `actualSpendCny` | **null** |
| backlog `:57` GAP-PRIV-01 | **OPEN**（本 commit 零 SSOT 编辑 · 行翻转 = 本刀全链 + 双审 + 协调方 nail 后另议） |
| UC-052 | **partial**（Ban covered flip） |
| `:60` / `:64` / `:68` | cite-only（Ban 借证据/状态 · Ban 洗 OPEN 钉） |
| EXIT 契约 | 全绿 ≠ `:57` CLOSED ≠ abandon 门开 ≠ tenant=RLS 等价 ≠ 授权根已迁 ≠ cutover ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ ADR 门全绿；非零 = 诚实保留 · Ban retry-to-green |

## 请审什么（mw-e2e-ha）

1. **Prove 方案可执行可判**：P1 `pnpm --filter @meetwise/db tenant-enforcement:prove`（CMD 不变 · `packages/db/package.json:35`）翻正后期望 EXIT=0 · PASS=35+Δ（Δ 如实宣布禁静默）· face B 行 `consumption>0`；P2 `pnpm tenant-wiring-e5:prove`（新 named · 零 DB 依赖）期望 EXIT=0；P3 `pnpm tenant-wiring-neg:prove`（`node scripts/run-e2e-isolated.mjs …:raw` · 一次性本 run 自有 `pgvector/pgvector:pg16` 容器 · 随机口令不落盘 · `DATABASE_URL` 由 `docker port` 组装 · finally 自有 `rm -f` 仅该名）期望 EXIT=0——命令、期望 EXIT、输出判据、AUX 步（docker run/port/isready/rm）是否齐备可判；PREREQ 缺（docker/pnpm/tsx）→ 预期非零 EXIT 如实记录。
2. **R1 翻正方案（翻正本身交双审）**：face A 语义翻转（零接线→零深路径字面导入纪律 · barrel `@meetwise/db` 导入钉死）· face B 双断言（`consumption>0` 且 == wiring manifest：文件集合+每文件计数）· barrel 恰 2 条 re-export 存在性断言零弱化（`packages/db/src/index.ts:25-32` · re-export ≠ consumption 原样）· R2 头注（`proof:26-29`/`:180`）同步更新——翻正是否有防静默收窄/防误红设计；既有 35/0 断言一字不减是否写死。
3. **E2E NEG 面设计**：user-a fixture → user-b principal 跨 owner 读/写 → 应用层 `tenant_owner_mismatch`/`tenant_owner_user_id_required` throw + API 404 不可区分（`guardInterviewPrivacy :177-190` 先例形状）+ 写侧 RLS `42501` 双重 fail-closed——断言是否逐条可机检；list 白名单（正当 0 行）与单 id 意外 0 行 fail-closed 的区分是否可判。
4. **attempts 契约**：全账一次优先 · Ban retry-to-green · 确定性 harness 字串级缺陷沿 PRIV01-B E-1/PRIV4 先例交 post 双审裁可采性 · implementer 不自裁自采 · log/`.exit` 落 `receipts/priv01-tenant-wiring/`（Asia/Shanghai + SHA）。
5. **接线范围可执行性**：§3 file:line 锚 @`eef469d9` 是否实测可信；排除面（privacy 主链/`checkpoint-principal.ts`/worker lane/recruiter B 端/admin/roles/公开读/migration）是否闭环防 scope creep；EXEC 触面 = 授权清单、超清单=越权是否写死。
6. **硬 Ban 面**：Ban 动 RLS 授权根 · Ban 等价/替代叙事 · Ban 公开 DELETE=503 · Ban `checkpoint-principal.ts` · Ban 共享 SSOT（`:57` stays OPEN）· Ban secrets · Ban `:60`/`:64`/`:68` 借证 · Ban UC flip · Ban ADR 门执行（cite-only）。
7. **docs-only 边界**：本 commit 恰 4 文档 · 零产品码/migration/script · 零 prove 执行 · 流程声明（REQUEST → 预执行双审 → meetwise 授权 → coding+prove 一次优先 EXEC → post-prove 双审 → meetwise 授权 nail）是否如实。

## Ban

Ban coding（until PRE dual BOTH PASS + meetwise AUTHORIZE）· Ban prove 执行 · Ban push 冒充执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 动 RLS 授权根（`asPrincipal`/`set_config`/FORCE RLS/`app_role`/`provisionRuntimeLogin` · MUST NOT abandon/弱化/migrate）· Ban 把应用层写成 RLS 等价或替代叙事 · Ban 碰 `apps/worker/src/checkpoint-principal.ts` · Ban 碰公开 DELETE=503 / privacy 主链 / erasure 链 · Ban 改共享 SSOT（backlog/checklist/matrix/queue · `:57` stays OPEN）· Ban flip UC-050/051/052 covered · Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban 加 tenant/org 列或 membership 谓词 · Ban feature-flag/bypass 化第二防御层（拟 · 待双审裁决）· Ban worker/recruiter/admin/roles 域接线 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*`（Key name-only）· Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban claiming PRE PASS · Ban product/infra code（本 REQUEST docs-only）。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由 meetwise（协调方）授权接线 coding+prove EXEC；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · awaiting_pre_exec_dual · STOP*
