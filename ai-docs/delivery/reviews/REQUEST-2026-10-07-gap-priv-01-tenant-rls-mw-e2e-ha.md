# REQUEST — **PRIV01 · GAP-PRIV-01 tenant≠RLS** · pre-exec · mw-e2e-ha（docs gate only · Ban coding · Ban prove · DELETE=503 · alone ≠ dual）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-privacy-int`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-privacy-int`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-priv-01-tenant-rls.md` · slice `gap-priv-01-tenant-rls.slice.md`
**Parent tip**: `313e04a7`（full `313e04a7fc0ca91ef60fb229802dd374f85cc93d` · `origin/feat/mysql-schema-skeleton` tip · not a prove tip · 开工时点 origin 最新 tip · 满足预期 ≥`313e04a7`；fetch attempt1 HTTP2 失败 / attempt2 超时 / attempt3 up-to-date 如实记录 · 本机 ref 开工前已恰在预期 tip）
**边界 cite**: `:60` GAP-PRIV-04（vector erase · post_prove_dual_pass）与 `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION（**OPEN** · stub≠cloud · cloudVendorDeleted=false）及 `:68` GAP-PRIV-AUTHZ-PROVE-FLAKE（OPEN · cause-unknown · Ban retry-to-green 先例面）——**只读边界 · Ban 借证据/状态 · Ban 洗 OPEN 钉**
**Date**: 2026-10-07
**Line**: **PRIV01**（队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32` · GAP-PRIV-01 tenant≠RLS）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained**（授权根仍为 PG RLS / `asPrincipal`+`set_config` · Ban 授权根迁移叙事） |
| Public DELETE | **503**（stays · GAP-PRIV-02 `:58` 冻结） |
| backlog `:57` GAP-PRIV-01 | **OPEN**（本 commit 零 SSOT 编辑 · Ban close via docs alone） |
| UC-052 | **partial**（Ban covered flip） |
| `:60` / `:64` / `:68` | cite-only（Ban 借证据/状态 · Ban 洗 OPEN 钉） |
| EXIT 契约 | EXIT0 ≠ covered ≠ `:57` CLOSED ≠ tenant=RLS 等价 ≠ 授权根已迁 ≠ UC-052 flip ≠ DELETE 开放 ≠ HA；EXIT1 诚实保留 · Ban retry-to-green |

## 请审什么（mw-e2e-ha）

1. **prove 工程面可执行性**：具名 CMD 拟法 `pnpm tenant-rls-isolation:prove` → `run-e2e-isolated.mjs …:raw` → `pnpm -C packages/db prove:tenant-rls-isolation` 是否与 `privacy-authorization:prove`（`package.json:304`）/ `vector-plane-erasure:prove`（`:343`）同形；`run-e2e-isolated.mjs` 注册面（receipt sources / gate 白名单 / isolatedCommand 分派 / migrate-with-recovery）先例是否引用准确；**隔离真 PG**（Ban live 云端 / Ban 共享开发库）是否写死。
2. **fail-closed 矩阵断言完备性（e2e 视角）**：两 owner A/B 同库六项（读 0 行 / INSERT 冒充 42501 / UPDATE·DELETE 0 行 / GUC 未设缺省 deny / 角色逃逸面 NOBYPASSRLS+NOINHERIT+FORCE / `guardInterviewPrivacy` 404 不可区分）是否有缺项、是否 Ban 弱化（缺红路径、行数 proxy、retry-to-green）；`visibility='global'` 共享面（`0032`）是否单列不混报。
3. **两维度分开断言**：owner 维度与 tenant/org 维度分开断言/分开报告/分开结论是否写死；tenant/org 内省是否被正确钉为**记录性**（非授权实现、非缺口实锤）；Ban owner 冒充 tenant 是否可机检。
4. **RLS 内省真实性**：`pg_policies`/`pg_class.relrowsecurity`+`relforcerowsecurity`/`pg_roles.rolbypassrls`+`rolinherit` 内省是否钉真 PG（Ban grep 代替）；策略普查基线入 receipt JSON 是否可复算。
5. **EXIT 契约与环境诚实**：EXIT0 叙事边界八不得 + EXIT1 诚实保留路径（attempts 全录 Asia/Shanghai+SHA+log 路径 · PREREQ 缺（docker/PG 不可用）→ 预期非零 EXIT 且记录 · Ban 换弱断言凑绿 · Ban retry-to-green 沿 `:68` 先例口径但不借其状态）。
6. **边界与 SSOT**：`:60` PRIV4 / `:64` AR / `:68` flake 零借用零互洗；公开 DELETE=503 复验同列入账；UC-052 stays partial；本 commit 恰 4 文件 docs-only、零 SSOT 翻行（`:57`/checklist/matrix/queue）、零产品码/migration/script；Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE。
7. **D1 裁决可执行性**：两读法（R-B 原义 / R-A 组织维度 · baseline `:281-282` 反证）与候选 A/B/C 利弊是否足以支撑双审裁决；R-A 落选时「显式改写收窄为诚实登记」逃生门是否写死可核。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban push · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 加 tenant/org 列或 membership 谓词（候选 B 默认 Ban · 显式申报才可解禁）· Ban 动授权根（`asPrincipal`/`set_config`/FORCE RLS/`app_role`）· Ban 接线 `packages/db/src/tenant/` 进生产路径 · Ban 把 `tenant-enforcement:prove` 绿写成 RLS 等价 · Ban owner 冒充 tenant（两维度混报）· Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban 开公开 DELETE（DELETE=503）· Ban flip UC-050/051/052 covered · Ban SSOT 翻行 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban claiming PRE PASS · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · awaiting_pre_exec_dual · STOP*
