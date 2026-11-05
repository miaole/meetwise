# PRIV1 · GAP-PRIV-01 owner 隔离实证 REQUEST（候选 A prove · backlog `:57` · PG-retained）

**Status**: `draft:awaiting_pre_exec_dual`
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null
**Date**: 2026-11-06
**Base / parent tip**: `origin/main` `e282c5ebd`（cap 2489 · 开工时点 origin/main 实测值 · fetch 两次失败：attempt1 默认 HTTP/2 `Failed to connect to github.com port 443` · attempt2 `-c http.version=HTTP/1.1` 同败 · origin/main 本地 ref 开工前已恰在 `e282c5ebd` · 零位移如实登记）
**Authority**: meetwise — 起草并实现刀（本卷随码起草 · 状态停在 `draft:awaiting_pre_exec_dual` · pre-exec dual BOTH PASS + 协调方 AUTHORIZE 前不 push · implementer 禁自批 · alone ≠ dual）
**Line**: PRIV01（GAP-PRIV-01 owner 隔离实证 · 立卷刀 `line/priv01-nail` 先行 · 本刀=候选 A 实施起草）

## §0 现状

**backlog 原文**（`ai-docs/delivery/gap-bug-backlog.md:57`）：

> GAP-PRIV-01 | P0 | 应用层 tenant 原型 additive + prove 绿；审查 **conditional**；授权根仍为 PG RLS / `asPrincipal`+`set_config`；**应用层 tenant ≠ RLS** | 写清并 prove MySQL 时代显式强制（非 optional filter）+ 跨 owner fail-closed；privacy 清单 prove 绿前 **MUST NOT abandon RLS** | … | `ai-docs/delivery/harness/tenant-enforcement.prototype.md`…

立卷刀（`ai-docs/delivery/gap-bug-backlog.md:779` · harness `gap-priv-01-tenant-rls.md`）已裁定：R-B 为原义重心（验收=跨 **owner** fail-closed 非 org 维度）、候选 A 主体裁可（owner 隔离矩阵 6 项 + RLS 内省 3 项 · 证隔离非修隔离）、候选 B 默认 Ban、**候选 A prove 实施仍待后续授权**——本刀即该实施。

**普查复核结论（如实）**：`.tmp/residual-census-a-1105.md:75` 「候选 A 的 owner 隔离实证 prove 尚未实施」**与代码一致**，无已覆盖误判。佐证：`packages/db/test/tenant-wiring.manifest.ts:13` 自钉「The E5 DB-layer half (GUC unset → 0 rows default deny) **belongs to PRIV01-A candidate A isolation prove**」——仓库 SSOT 亲证该面明确留给本刀。

**已有覆盖（各证各面 · 不互抵）**：

| 已有 proof | 覆盖面 | 与候选 A 的关系 |
|---|---|---|
| `packages/db/test/tenant-wiring-neg.proof.ts`（PRIV01-C · P3） | notification 接线面跨 owner N1–N7（含 N5 冒充 INSERT 42501=RLS 根 behind app layer） | 单表·接线面，非全矩阵非内省 |
| `packages/db/test/tenant-wiring-e5.proof.ts`（P2） | E5 应用层半（静态契约·manifest 机检） | 自钉 DB 层半不在此 |
| `packages/db/test/tenant-enforcement.proof.ts` | `packages/db/src/tenant/` helper 静态 fail-closed | 原型面 · 审查 conditional 未解除 |
| `packages/db/test/privacy-authorization.proof.ts` | 授权签发器/jti/sink receipt 面 | 同库不同面 · 不覆盖 RLS 矩阵 |
| `packages/db/test/memory-vector-chunk-erasure.proof.ts` 等 | 向量面行级擦除 | `:60` 面 · cite-only 零借 |
| `pnpm uc033:cross-user-authz:prove` | 跨用户授权 HTTP 面 | 授权链面 · 不覆盖 RLS 内省 |

**缺口**：候选 A 的隔离实证面——跨 owner 访问矩阵（SELECT/INSERT/UPDATE/DELETE + GUC 缺省 deny + 角色逃逸面 + 应用层守卫机理）与真 PG `pg_policies`/`pg_class` 内省——**零实现**。

**与立卷 REQUEST 的两处事实偏差（如实收窄披露）**：

1. **consumption_record 已死**：立卷时点 0001 DO 循环五表含 `consumption_record`；`0145_dead_table_jsonb_deprecate.sql:19` 已 `DROP TABLE IF EXISTS consumption_record CASCADE`（死表退役刀）。本刀 canonical family 取**存活**七表（interview/ai_graph_run/interview_event/ai_invocation_trace/user_memory/vector_chunk/notification），I1/I2 对不存在的表断言无意义。
2. **tenant/org 记录性内省收窄**：立卷 §3 期待「information_schema 断言无 tenant_id/org_id/workspace 类列」；实测 `0186_qbank_org_owner_columns.sql:49/:63/:77/:93` 为 B 端企业题库合规加了 5 个 `org_id` 列（qbank_source/qbank_chunk/qbank_question/qbank_generation_chunk/qbank_org_curator）。故 T1 改为：断言**零 RLS 策略以 tenant/org 为隔离谓词**（实测 0）+ canonical owner 族内零 tenant/org 列（实测 0）+ 列普查如实入 receipt——企业 org 列是 B 端作用域扩展、不是用户隔离根替代，两头叙事（「已有租户隔离」/「隔离缺陷实锤」）均不写。
3. fetch 两连败（HTTP/2 与 HTTP/1.1 同文）——origin/main 无位移，如实采本值。

## §1 修法

**授权根零触碰**：不动 `0001_baseline.sql` 的 ENABLE/FORCE RLS 与 `p_owner`、不动 `principal.ts` `asPrincipal`/`set_config`/`provisionRuntimeLogin`、不动 `app_role`、不接线 `packages/db/src/tenant/`、不加 tenant/org 列（候选 B 默认 Ban 维持）。本刀只**证**隔离、不加不改隔离。

**新件恰 2**：

1. `packages/db/test/tenant-rls-isolation.proof.ts` — 隔离真 PG（`run-e2e-isolated.mjs` one-off pgvector 容器 · pre-migrate 全迁移链 222 件先行）owner 隔离实证 prove，入口先 `assertIsolatedTestTarget`（容器 nonce · 禁指本机开发库/云库）：
   - **矩阵 M1–M6**（C-P3 断言强度不弱化 · 每负臂前置防空转正对照）：M1 跨 owner SELECT=0（A/B 自读 ≥1 正对照）；M2 冒充 owner INSERT→**42501**（自有 INSERT 正对照）；M3 跨 owner UPDATE/DELETE=0 rows（自有 UPDATE ≥1/DELETE =1 正对照·user_memory 全 CRUD grant 面）；M4 GUC 未设/空串→0 rows（实测诚实修正：池化连接跑过 `set_config(...,true)` 后事务本地值回滚但 placeholder 保持**已定义空串**，从未设才是 NULL——两态都算未设面，承重断言是 0 行 default deny，不弱化）；M5 角色逃逸面动态化：`provisionRuntimeLogin` 真实 provisioning（NOINHERIT·NOBYPASSRLS 落 `pg_roles` 实读）+ 非超用户连接裸查=42501 拒 + `SET LOCAL ROLE app_role` 后 effective role 实读 + GUC 缺省 0 行 + GUC 设置后恰见自有行零 B 行；M6 应用层守卫机理：B 对 A interview id 的 `SELECT 1 FROM interview WHERE id=$1`（即 `guardInterviewPrivacyTx` 原查询）=0 行（404 分支必然触发·不可区分）+ guard 404/410 分支源文 witness（apps/api NestJS 依赖不可从 db 包隔离 proof import，映射面以 witness 钉，如实披露）；
   - **内省 I1–I3**（真 `pg_policies`/`pg_class` 实读·Ban 迁移 grep 代替）：I1 canonical 七表 `relrowsecurity=true ∧ relforcerowsecurity=true`；I2 每表读侧（USING/qual）与写侧（WITH CHECK）各自存在 owner 谓词策略（deparse 归一化 `::text`/括号后内容精确匹配；vector_chunk 分 action 策略族按「读侧至少一策略 + 写侧至少一策略」判，不弱化为单策略）；I3 策略普查基线（总数 340 + RLS 表 166 + 七表策略名单）入 `TENANT_RLS_ISO_RECEIPT` JSON；`visibility='global'` 共享语料面（rag_corpus_document）单列报告、不入 owner 数据面结论；
   - **T1 记录性内省**（按 §0 偏差 2 收窄）：零 tenant/org RLS 谓词策略 + canonical 族内零 tenant/org 列 + 列普查入 receipt；
   - **S 静态钉**：`principal.ts` SET LOCAL ROLE + set_config witness · `0001_baseline.sql` ENABLE+FORCE+owner 谓词 witness · `packages/db/src/tenant/index.ts` 「应用层 tenant ≠ RLS」头注 witness · 公开 DELETE=503 witness（`privacy.controller.ts` `@Delete('interview-data/:id')` + `HttpStatus.SERVICE_UNAVAILABLE`）。
2. `ai-docs/delivery/harness/priv1-owner-isolation-REQUEST.md` — 本卷。

**既有文件 additive 行内改（零新增件）**：根 `package.json` + `packages/db/package.json` 具名 CMD（`tenant-rls-isolation:prove` → `run-e2e-isolated.mjs tenant-rls-isolation:prove:raw` → `pnpm -C packages/db prove:tenant-rls-isolation`）；`scripts/run-e2e-isolated.mjs` 恰 4 注册点沿 `tenant-wiring-neg:prove:raw` 同形（watchlist/rawTargets/isolatedCommand 分派/pre-migrate 名单第四注册位）；两 policy 脚本 cap 链注**纯追加**（CAP-SANCTION-2491）+ 四联动点恰等改（`public-text-policy.mjs` MAX_FILES `2_489`→`2_491`、`public-text-policy.proof.mjs` loop/atCap/overCap 三处 `2_491`/`f-2491.md`/`:2492`）——不改写任何既有注记。基线亲证：起草前 main `e282c5ebd` 树 `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2489=cap 2489 恰等**。

**cap 算式**：届扫 2489 + 本刀新受管件恰 2 = **2491** 恰等零多放。**在飞同号竞争如实列**（2026-11-06 本地 ref 实测 · fetch 网络败未刷新）：s3caps-draft ahead=6 / ksw-draft ahead=3 / fastm-draft ahead=3 / xs-draft ahead=14（均 merge-base 92a82a944 两 policy 热面）+ uc31-rev ahead=4（同基两 policy 热面）+ rtx-draft ahead=3（merge-base e282c5ebd=届 tip 两 policy 热面）——并线期沿常设预授权「cap 以合并树实测恰等步进免再询」届时取大重算承登，冲突区 dual-keep 双留史录。

**行文口径**：全文 PG-retained（`ai-docs/delivery/adr-postgres-retained.md`），零 MySQL/Qdrant 切流方向表述；隔离 shell 仅测试基础设施，≠ 产品栈变更 ≠ cutover 证据。

## §2 验收

- **变异测试（红先证）**：在 `/tmp/priv1-mut` 全仓拷贝（node_modules symlink 回真树）上把 `0001_baseline.sql` 中 user_memory `p_owner` 的 owner 条件手术替换为 `USING (true) WITH CHECK (true)`（MUT-PRIV1-1），同 runner 隔离容器复跑新 proof——**必须红**。实测读数：**M3 红**（A 跨 owner 改/删 B 行 `upd=1 del=1`，正对照仍绿=非环境红）+ **I2 user_memory 红**（pg_policies 实读 `qual=false chk=false`）+ EXIT=1。行为面与内省面双抓，回归可捕获。
- **新 proof 绿**：`pnpm tenant-rls-isolation:prove` 隔离容器真迁移链 EXIT=0（attempts 全录：#1 EXIT=1 内省归一化缺陷 12 失败诚实保留不洗，#2 EXIT=0 40 PASS）。attempts log：本卷 §9。
- **相关既有 proof**：`pnpm db:prove` · `pnpm uc033:cross-user-authz:prove` · `pnpm neg:resume` · `pnpm tenant-wiring-neg:prove`（同锚热面回归）。
- **静态面**：受影响包 typecheck/lint 不高于基线 · `pnpm arch` · `node scripts/e2e-static-guards.mjs` · `node scripts/provider-egress-inventory.mjs` · `node scripts/ai-docs/check-docs.mjs`（届扫 2491=cap 恰等）· `node scripts/ai-docs/public-text-policy.proof.mjs`（12/12）· markers 0。不跑浏览器 UI runner。

**EXIT 契约**：新 proof EXIT=0 ≠ GAP-PRIV-01 CLOSED ≠ backlog `:57` 翻面 ≠ 应用层 tenant=RLS 等价 ≠ 授权根已迁 ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ R-A 缺口消失。PREREQ 缺（无 docker/PG）→ 诚实非零 EXIT 记 attempt，Ban 弱断言凑绿，Ban retry-to-green。

**翻面建议（留 nail · 本刀不执行）**：`:57` 行目标句「MySQL 时代」措辞已被 PG-retained superseded；建议 nail 阶段将行内目标改写为「候选 A prove 绿 + 跨 owner fail-closed 维持」PG-retained 口径后，以独立 SSOT 翻行刀处置（立卷刀 `:779` 钉「prove 绿不自动关行」）。本卷只建议，不动 backlog。

## §8 停止条件

`draft:awaiting_pre_exec_dual`。pre-exec dual（mw-privacy-int + mw-e2e-ha）BOTH PASS + 协调方 AUTHORIZE 前：Ban push · Ban nail · Ban self-write `post_prove_dual_pass` · Ban SSOT 翻行（backlog `:57`/checklist/matrix/queue）· Ban 翻 coveredCount · Ban 借 `:60`/`:64`/`:68` 证据 · Ban 开公开 DELETE · Ban UC-050/051/052 covered flip · Ban retry-to-green · Ban 接线 `packages/db/src/tenant/` · Ban 加 tenant/org 列 · Ban 动授权根（RLS/asPrincipal/set_config/app_role）· Ban secrets/`.env*` · Ban 冒充 dual/代签。prove 复现或门红无法收窄 → 停，如实记 attempt 报告。若双审判 M6 witness 化（apps/api 依赖不可 import）强度不足，回炉补动态守卫面（如经 apps/api 侧姊妹 proof），Ban 静默降级。

## §9

**实际改动文件**：新增 `packages/db/test/tenant-rls-isolation.proof.ts`、`ai-docs/delivery/harness/priv1-owner-isolation-REQUEST.md`；行内 additive：根 `package.json`、`packages/db/package.json`、`scripts/run-e2e-isolated.mjs`（恰 4 注册点）、`scripts/ai-docs/public-text-policy.mjs`（MAX_FILES + 链注追加）、`scripts/ai-docs/public-text-policy.proof.mjs`（loop/atCap/overCap + 链注追加）。零迁移 · 零授权根触碰 · 零 SSOT 编辑。

**prove attempts 台账**（Asia/Shanghai · 树 `line/priv1-draft` · base `e282c5ebd`）：

| # | 时点 | CMD | EXIT | 读数 |
|---|---|---|---|---|
| 1 | 2026-11-06 02:49 | `pnpm tenant-rls-isolation:prove` | 1 | 12 失败=内省归一化/死表/占位符语义三缺陷（本 proof 自身缺陷·非隔离面红）· 诚实保留 |
| 2 | 2026-11-06 02:53 | 同上 | 0 | 40 PASS · 读数同 #3 |
| 3 | 2026-11-06 03:02 | 同上（终码 re-run：lint 清理 unused import+naming disable 注释后复跑·断言零变化） | **0** | **40 PASS** · receipt：policies=340 · rlsTables=166 · tenantPredicatePolicies=0 · org 列 5 全在 qbank 族 |
| MUT-1 | 2026-11-06 02:54 | `/tmp/priv1-mut` 变异树同 CMD（attempt2 码） | 1 | M3 红 `upd=1 del=1` + I2 user_memory `qual=false chk=false` · 共 2 失败 |
| MUT-2 | 2026-11-06 03:04 | 同变异树·终码 re-run | **1** | 同 M3 红 `upd=1 del=1` + I2 user_memory 红 · **终码变异红承** |

隔离收据：`.tmp/isolated-proof-receipts/2026-11-05T19-02-21-584Z-34673-*.json`（终码绿）/ `/tmp/priv1-mut/.tmp/isolated-proof-receipts/2026-11-05T18-54-35-896Z-85657-*.json`（变异红·副本 `/tmp/priv1-mut-receipt.json`）。

**门读数（本树终验 · 2026-11-06）**：新 proof attempt3 EXIT=0（40 PASS）+ 变异树 EXIT=1（M3+I2 红）· `pnpm db:prove` EXIT=0 · `pnpm uc033:cross-user-authz:prove` EXIT=0（51 例）· `pnpm neg:resume` EXIT=0（91 例）· `pnpm tenant-wiring-neg:prove` EXIT=0（N1–N7）· packages/db `tsc --noEmit` EXIT=0（tsconfig 含 test/）· eslint 触面 2 warnings=基线同面 2（零新增）· `pnpm arch` EXIT=0（0 error · 8 既有 warning）· `node scripts/e2e-static-guards.mjs` EXIT=0 · `node scripts/provider-egress-inventory.mjs` EXIT=0 · `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2491=cap 2491 恰等** · `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0 · markers=0（两新件 TODO/FIXME/XXX/HACK 零命中）· 浏览器 UI runner 未跑（按派单）。

**状态**: `draft:awaiting_pre_exec_dual`

---

**Status**: `draft:awaiting_pre_exec_dual`（起草并实现随刀 · prove/mutation 读数已实测在卷 · pre-exec dual BOTH PASS + 协调方 AUTHORIZE 前 Ban push/Ban nail/Ban SSOT · alone ≠ dual · STOP）
