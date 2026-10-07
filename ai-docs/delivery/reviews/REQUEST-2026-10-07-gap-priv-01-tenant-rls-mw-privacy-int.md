# REQUEST — **PRIV01 · GAP-PRIV-01 tenant≠RLS** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-privacy-int`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-priv-01-tenant-rls.md` · slice `gap-priv-01-tenant-rls.slice.md`
**Parent tip**: `313e04a7`（full `313e04a7fc0ca91ef60fb229802dd374f85cc93d` · `origin/feat/mysql-schema-skeleton` tip · not a prove tip · 开工时点 origin 最新 tip · 满足预期 ≥`313e04a7`；fetch attempt1 HTTP2 失败 / attempt2 超时 / attempt3 up-to-date 如实记录 · 本机 ref 开工前已恰在预期 tip）
**边界 cite**: `:60` GAP-PRIV-04（vector erase · post_prove_dual_pass）与 `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION（**OPEN** · stub≠cloud · cloudVendorDeleted=false）及 `:68` GAP-PRIV-AUTHZ-PROVE-FLAKE（OPEN · cause-unknown）——**只读边界 · Ban 借证据/状态 · Ban 洗 OPEN 钉**
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

## 请审什么（mw-privacy-int）

1. **D1 两读法裁决诚实性**：R-B（backlog 原义 · M2 应用层原型≠RLS · 验收维度「跨 owner fail-closed」）vs R-A（组织 tenant 维度缺失 · 但 `0001_baseline.sql:281-282` 显式「未来扩展/不过度设计」）是否如实并陈、implementer 读法（R-B 为重心）是否被正确标为**非绑定、交双审裁**；R-A 落选时的「显式改写收窄为诚实登记」逃生门是否写死（Ban 静默换范围）。
2. **候选裁定与伪缺口防线**：候选 B（补 tenant/org 列）默认 Ban 是否成立（伪缺口/过度设计 vs `:281-282` 冲突）；候选 A「零 schema 变更、证隔离而非修隔离」与候选 C「诚实登记」的边界是否如实（A 的 prove 绿 ≠ 新增隔离能力 ≠ `:57` 可关）。
3. **两维度分开断言（核心诚实条款）**：owner 矩阵与 tenant/org 维度是否写死分开断言、分开报告、分开结论——Ban owner-scoped 冒充 tenant 隔离；`visibility='global'` 共享语料面（`0032`）是否被单列、不与 owner 数据面混报。
4. **授权根零触碰**：`asPrincipal`/`set_config('app.principal_user')`/FORCE RLS/`app_role`/`packages/db/src/tenant/`（不接线不删不改）是否全部钉在非目标；`tenant-enforcement:prove` 绿 ≠ RLS 等价、2026-09-10 审查 conditional 原样保留是否如实。
5. **fail-closed 矩阵强度**：读 0 行 / INSERT 冒充 42501 / UPDATE·DELETE 0 行 / GUC 未设缺省 deny / 角色逃逸面（NOBYPASSRLS+NOINHERIT+FORCE）/ 404 不可区分——六项是否写死且 Ban 弱化（行数 proxy 替代、缺红路径、retry-to-green）；RLS 内省是否钉真 PG `pg_policies` 而非 grep 代替。
6. **边界借刀**：`:60` PRIV4 / `:64` AR / `:68` flake 面零借用、零抵扣、零互洗；公开 DELETE=503 复验同列入账；UC-052 stays partial。
7. **EXIT 契约与诚实失败路径**：EXIT0 叙事边界（≠covered/翻行/等价宣称/授权根已迁）+ EXIT1 诚实保留（attempts 全录 Asia/Shanghai+SHA+log · PREREQ 缺预期非零 · Ban 换弱断言凑绿）。
8. **docs-only 边界**：本 commit 恰 4 文件 · 零产品码/migration/script · 零 SSOT 翻行（`:57`/checklist/matrix/queue）· Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban push · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 加 tenant/org 列或 membership 谓词（候选 B 默认 Ban · 显式申报才可解禁）· Ban 动授权根（`asPrincipal`/`set_config`/FORCE RLS/`app_role`）· Ban 接线 `packages/db/src/tenant/` 进生产路径 · Ban 把 `tenant-enforcement:prove` 绿写成 RLS 等价 · Ban owner 冒充 tenant（两维度混报）· Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban 开公开 DELETE（DELETE=503）· Ban flip UC-050/051/052 covered · Ban SSOT 翻行 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban claiming PRE PASS · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-privacy-int` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · awaiting_pre_exec_dual · STOP*
