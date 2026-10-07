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

---

# PRE-EXEC dual 审查段 — mw-privacy-int（append-only · 2026-10-07 · docs gate only）

**审查方**: `mw-privacy-int`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-p1-privacy-int` · branch `rv/p1-privacy-int` @ origin tip `6b61b734`）· **被审 REQUEST**: `786a1949`（origin 链镜像 · parent `c173ee0f`）≡ line 孪生 `f3a48a76`（parent `313e04a7` = stub 自报开工 tip）· **patch-id `9e70fd01` 两侧亲算全等，零内容漂移** · `786a1949` 为 origin tip `6b61b734` 祖先（`git merge-base --is-ancestor` 亲证）。
**docs-only 机检亲证**: `git show --stat 786a1949` = 恰 4 文件 +275/-0，全 `ai-docs/*.md`（slice / harness / 双 PENDING stub）；grep 复核零非 .md 路径、零 `ai-docs/` 外路径、零产品码 / migration / script / package.json；SSOT 面（`gap-bug-backlog.md` / checklist / matrix / queue）不在 diff。**本审 0 prove run · 0 coding · 0 SSOT edit · 禁 push · 不代签 peer `mw-e2e-ha`（alone ≠ dual）**。

## 检查表（对 stub「请审什么」8 项逐条 · 全部实码核验）

| # | 项 | 核验证据（本审亲读） | 裁定 |
|---|----|---------------------|------|
| 1 | D1 两读法诚实并陈 | harness §0.1 双读法+反证如实并陈；implementer 读法标「非绑定」；逃生门「显式改写收窄为诚实登记 · Ban 静默换范围 · Ban 借机加列」写死于 harness §0.1 + slice Scope | **成立** |
| 2 | 候选 B 默认 Ban / A·C 边界如实 | harness §2 候选 B「默认 Ban · 显式申报+重立卷才可解禁」；A「证隔离非修隔离」弊面如实（「不新增任何隔离能力」）；slice One-line「A prove 绿 ≠ `:57` 可关」 | **成立** |
| 3 | 两维度分开断言 | harness §4 Ban owner 冒充 tenant（分开断言/报告/结论）+ §3 tenant/org 内省钉「记录性·非授权实现·非缺口实锤」+ `visibility='global'` 单列（`0032:38` `USING (visibility='global' OR owner_user_id=…)` 与 `:417` `__system_rag__` 实读吻合） | **成立** |
| 4 | 授权根零触碰 | harness §2 非目标 + §5 Ban + slice Ban + 双 stub Pins「Ban 授权根迁移叙事」；实码吻合：`principal.ts:945-955` `SET LOCAL ROLE app_role`+`set_config('app.principal_user',$1,true)`、`:938-944` 注释自钉「tenant-routing context, not a cryptographic identity root」、`:566-608` `LOGIN NOINHERIT … NOBYPASSRLS`+反向 REVOKE；`0001_baseline.sql:7`（FORCE RLS 头注）·`:63-82`（`app_role NOLOGIN`@:64 + DO 循环 `p_owner` USING/WITH CHECK 双侧）·`:300-307`（vector_chunk 同形）全部实读在位；`tenant/index.ts` 头注「应用层 tenant ≠ RLS · Must not silently replace the auth root」原样；2026-09-10 审查 **conditional** 原文在档（`reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md`「切流/放弃 RLS 仍 block」） | **成立** |
| 5 | fail-closed 矩阵强度 | harness §3 六项（读 0 行 / INSERT 冒充 42501 / UPDATE·DELETE 0 行 / GUC 未设缺省 deny / 角色逃逸面 NOBYPASSRLS+NOINHERIT+FORCE / `guardInterviewPrivacy` 404 不可区分+410）——`interview.service.ts:177-190` 实读吻合（`not_found_or_forbidden` 不可区分 + fence 410）；内省钉真 PG `pg_policies`/`pg_class`/`pg_roles`，Ban grep 代替（stub #5）；harness §7「矩阵 6 项 + 内省 3 项不得弱化」写死 | **成立** |
| 6 | 边界借刀 | `:60` PRIV4 / `:64` AR（OPEN · stub≠cloud · `cloudVendorDeleted=false`）/ `:68` flake（OPEN · cause-unknown）四处 cite-only（harness §0.2 表 + slice One-line + 双 stub Pins/backlog 边界行）；backlog 实读 `:58`=GAP-PRIV-02 DELETE=503 冻结、`:60`/`:64`/`:68` 行锚全对位；`privacy.controller.ts:51-52` `@HttpCode(SERVICE_UNAVAILABLE)` 实码在位 | **成立** |
| 7 | EXIT 契约与诚实失败路径 | harness §3 EXIT 契约八不得（≠covered/≠`:57` CLOSED/≠等价宣称/≠授权根已迁/≠HA/≠releaseEvidence/≠UC-052 flip/≠DELETE 开放/≠R-A 缺口消失）+ EXIT1 诚实保留（attempts 全录 Asia/Shanghai+SHA+log · PREREQ 缺预期非零 · Ban 换弱断言凑绿 · Ban retry-to-green）；`:68` 先例口径引用不借状态 | **成立** |
| 8 | docs-only 边界 | 上机检段 + harness/slice 双处「本 commit = 上述恰 4 文件 docs-only · 零 SSOT 编辑」自述与实 diff 一致；Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE 三处在卷 | **成立** |

## D1 裁决（本审裁定 · 写死进 Conditions）

**裁定 R-B 为 backlog `:57` 原义重心；逃生门不触发，但写死保留为休眠回退。** 依据（全部实码/实档亲读）：

1. **现状列整段即 M2 原型状态**：`:57` 现状 = 「应用层 tenant 原型 additive + prove 绿；审查 conditional；授权根仍为 PG RLS / `asPrincipal`+`set_config`；应用层 tenant ≠ RLS」——末短语系 M2 文档钉死短语（`packages/db/src/tenant/index.ts` 头注第 4 行原样、`m2-tenant-prototype-impl.md:10`「tenant≠RLS still true under PG-retained」原样）。
2. **验收维度是 owner 非 org**：`:57` 目标 = 「写清并 prove **MySQL 时代**显式强制（非 optional filter）+ **跨 owner** fail-closed；privacy 清单 prove 绿前 **MUST NOT abandon RLS**」——若原义为组织租户维度，验收判据应为跨 tenant/org 而非跨 owner；「MySQL 时代」措辞自锚 M2 语境。
3. **拟切片与 harness 指向 M2 工件**：「M2 等价强制设计→prove 对齐 ADR 清单」+ `harness/tenant-enforcement.prototype.md`——全为 M2 原型面，非 schema/org 维度面。
4. **R-A 反证实锚**：baseline 设计注记实读在 `0001_baseline.sql:280-281`（被审引 `:281-282` 差一行，见 OB-1）：「**C 端定位:owner_user_id RLS 即足**(每用户自己的库)。B 端租户共享题库是未来扩展:届时按 tenant 维度加 membership 谓词(owner 列即扩展点),现在不过度设计。」——org 维度系**显式延后的设计扩展**。本审机检：全 `packages/db/migrations/*.sql` 零 `tenant_id`/`org_id`/workspace 列；产品无 org 概念。R-A 语境下的「缺口」不满足现行隐私洞判据，实现之即伪造缺口/过度设计。
5. **边界判据（写死）**：「显式延后的设计扩展」vs「现行隐私洞」以两问裁定：①冻结基线（`:2`「勿改本文件」checksum 保护）是否显式延后该维度——是（`:280-281`）；②产品今日是否既**需要**又**宣称** tenant 隔离而缺失——否（无 org 概念、无 tenant 隔离宣称）。两问皆指向延后扩展 → R-A 不成立为现行洞，其事实观察（schema 无 tenant/org 列）只能经候选 A 的**记录性内省**诚实登记，两头叙事（「已具备租户隔离」或「隔离缺陷已实锤」）均 Ban（harness §4 原样保留）。

## 候选裁决

- **候选 A（隔离真 PG owner 访问矩阵 + RLS 内省 · 零 schema 变更）= 足以诚实关闭残余面，本审裁可取（主体）**。R-B 在 PG-retained（2026-09-17 hard ruling · 两 M2 文档头注 STOPPED/superseded 实读在档）下的残余诚实面恰为二：对**现行** RLS 根做隔离实证（prove 绿）+「应用层 tenant ≠ RLS」差距**如实保留不关**。候选 A 直面此残余面：实证 ≠ 实现新维度，零产品风险；六项矩阵直对 `:57` 验收「跨 owner fail-closed」，三项内省（`pg_policies` 谓词含 `owner_user_id`+`current_setting('app.principal_user'`、`relrowsecurity`+`relforcerowsecurity`、`rolbypassrls=false`/`rolinherit=false`）直对授权根事实。隔离 CMD 拟法与 `privacy-authorization:prove`（`package.json:304-305`）/`vector-plane-erasure:prove`（`:343-344`）同形，`run-e2e-isolated.mjs` 注册先例实读在位（allowlist gate `EXIT=3` 反假绿 + `writeLocalE2EReceipt`/`writeLocalIsolatedReceipt` + `isolatedCommand` 分派 `:1584/:2227/:2339` + `migrateWithRecovery` `:2175`）。
- **候选 B（补 tenant/org 维度）默认 Ban = 正确，本审维持**。与 `:280-281` 显式「未来扩展/不过度设计」冲突；触碰面 = 全 ownership 表族 + 策略面（本审 fresh 机检全 migrations `CREATE POLICY` = **350** 条，M2 文档口径 348、被审「348±2」带内吻合）= 大面积伪缺口实现。解禁条件（双审+产品权威显式裁「产品现已需 B 端隔离」+ 显式申报 + 重立卷）足够窄。
- **候选 C（诚实登记不做实现）= 仅可为 A 的诚实失败/裁决路径**（EXIT1 同形兼容 · attempts 全录），不得作 docs-alone 关 `:57` 的捷径（Pins：`:57` OPEN · Ban close via docs alone 原样保留）。
- **组合裁定**：A 主体 + C 为诚实失败路径 + B 默认 Ban——与实现方倾向一致，本审裁可交协调方写入 AUTHORIZE。

## RLS 根非 abandon（授权根焦点）

backlog `:57` 目标列「privacy 清单 prove 绿前 **MUST NOT abandon RLS**」被 harness §0 逐字引用并落实为四处写死：harness §2 非目标（不动 `asPrincipal`/`set_config`/FORCE RLS）· harness §5 Ban（Ban 动授权根/`app_role`）· slice Ban 同文 · 双 stub Pins（Stack **PG-retained** · Ban 授权根迁移叙事）+ EXIT 契约（EXIT0 ≠ 授权根已迁 ≠ tenant=RLS 等价）。授权根定义与实码三点吻合（FORCE RLS `0001:7/:63-82/:300-307` + asPrincipal `principal.ts:945-955` + provisionRuntimeLogin NOINHERIT/NOBYPASSRLS `:566-608`）。**本审写死：本刀 prove 与 coding 阶段 MUST NOT abandon/弱化/迁移该授权根（C-P4）。**

## Pins 原值核验（零漂移）

| Pin | stub/harness/slice 值 | 裁定 |
|-----|----------------------|------|
| haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false | 三处一致 | **held** |
| gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false | 三处一致 | **held** |
| PG-retained | 三处一致（授权根仍 PG RLS/asPrincipal+set_config） | **held** |
| 公开 DELETE=503 | 三处一致 + `privacy.controller.ts:51-52` 实码 + backlog `:58` 冻结行对位 | **held** |
| backlog `:57` OPEN · UC-052 partial · `:60`/`:64`/`:68` cite-only | 三处一致 + backlog 行锚实读对位 | **held** |

## Fail-trigger audit（触发即 FAIL 的面 · 逐项排查）

1. docs-only 越界 / 产品码夹带 —— **未触发**（机检段亲证恰 4 md）。
2. SSOT 翻行（`:57`/checklist/matrix/queue）—— **未触发**（四 SSOT 面零 diff）。
3. self-approve / 代签 peer —— **未触发**（双 stub 提交时点均 PENDING · 本审仅 append 本 stub · Verdict 由本审查段给出，peer `mw-e2e-ha` 不代签）。
4. prove 执行 / receipt 夹带 —— **未触发**（diff 零 prove/receipt 文件 · 本审 0 prove run）。
5. D1 择一冒充 / 两头叙事 —— **未触发**（双读法并陈 + 反证如实呈报 + implementer 读法标非绑定）。
6. 弱断言预埋（行数 proxy 替红 / 缺红路径 / grep 顶 `pg_policies` / retry-to-green）—— **未触发**（矩阵六项+内省三项写死不得弱化 · Ban retry-to-green 三处在卷）。
7. 借 `:60`/`:64`/`:68` 证据/状态、洗 OPEN 钉 —— **未触发**（cite-only 四处钉 + OPEN 原文实读对位）。
8. Pins 漂移 / 预授 coding —— **未触发**（Pins 表零漂移 · Ban coding until PRE BOTH + AUTHORIZE 原样）。

## 观察与 Blockers

- **OB-1（非阻断 · 引锚差一行）**：被审三方（harness §0.1/§1、slice Evidence、本 stub「请审什么」#1）引 `0001_baseline.sql:281-282`，awk 机检实际注记行 = **`:280-281`**（`:281` 为「B 端租户共享题库是未来扩展…不过度设计」、`:280` 为「C 端定位:owner_user_id RLS 即足」）。逐字文本在档、语义全同、±1 行漂移——不改 D1 任何结论。→ C-P7 要求 coding 期文档与 prove receipt 改用已验证锚 `:280-281`。
- **OB-2（非阻断 · 孪生镜像落链）**：line 孪生 `f3a48a76`（parent `313e04a7` = 自报开工 tip）与 origin 镜像 `786a1949`（parent `c173ee0f`）patch-id `9e70fd01` 两侧亲算全等，属并行线标准镜像合并；落链/nail 顺序归协调方（与 MOP02 先例同形）。
- **Blockers: 0。**

## Conditions C-P1…C-P8（本审裁定写死 · 违任一即本 PASS 撤销）

- **C-P1（D1 裁定）**：R-B 为 `:57` 原义；残余面 = 现行 RLS 根隔离实证 + 「应用层 tenant ≠ RLS」差距保留；coding 期文档 D1 节须逐字载本裁定与依据 1-5；逃生门保留为休眠回退（仅当双审或后续证据推翻依据 1-4 方可触发，触发即显式改写收窄为诚实登记 · Ban 静默换范围）。
- **C-P2（边界写死）**：tenant/org 维度缺失 = `:280-281` 显式延后的设计扩展 ≠ 现行隐私洞；只许记录性内省；两头叙事 Ban；候选 B 默认 Ban 维持，解禁须显式申报+重立卷+产品权威。
- **C-P3（断言不可弱化）**：矩阵六项 + 内省三项写死（harness §7）——红路径不得行数 proxy 化、内省 Ban grep 代替、`visibility='global'` 共享面单列分开断言（`0032:38`/`:417`）、owner 与 tenant/org 分开断言/报告/结论。
- **C-P4（授权根非 abandon）**：prove/coding MUST NOT abandon/弱化/迁移 FORCE RLS+`asPrincipal`+`set_config`+`app_role`+NOINHERIT/NOBYPASSRLS 根；`packages/db/src/tenant/` 不接线不删不改；`tenant-enforcement:prove` 绿 ≠ RLS 等价；2026-09-10 conditional 结论原样引用不解除。
- **C-P5（EXIT 诚实）**：EXIT0 ≠ covered ≠ `:57` CLOSED ≠ 等价宣称 ≠ 授权根已迁 ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ R-A 缺口消失；EXIT1=诚实保留 attempts 全录（Asia/Shanghai+SHA+log）；PREREQ 缺→预期非零且记录；Ban 换弱断言凑绿 · Ban retry-to-green（`:68` 口径，不借其状态）。
- **C-P6（Pins 与边界冻结）**：Pins 原值全 held；`:60`/`:64`/`:68` cite-only 零借零洗；DELETE=503 prove 内复验同列入账；UC-052 partial；`:57` OPEN——prove 绿不自动关行，关行须独立 SSOT 翻行刀循既定程序。
- **C-P7（引锚更正）**：coding 期 harness/slice/receipt 引基线设计注记一律用实锚 `0001_baseline.sql:280-281`（OB-1 更正），零语义变更。
- **C-P8（alone ≠ dual）**：本 PASS 仅 mw-privacy-int 一票；dual = PRE BOTH PASS（mw-privacy-int + mw-e2e-ha）+ 协调方 AUTHORIZE；不代签 peer。

## 中文三行摘要

1. PRIV01 REQUEST `786a1949`（≡`f3a48a76` patch-id 全等）docs-only 恰 4 md +275/-0 零产品码零 SSOT，D1 两读法诚实并陈、逃生门写死——程序面全清。
2. 本审裁 **D1=R-B**（`:57` 原义 = M2 原型 ≠ RLS 差距保留：现状列整段 M2 语境、验收「跨 owner」非 org、拟切片指 M2 工件、基线 `:280-281` 显式延后 B 端租户 = 非现行洞）；候选 **A 裁可（证隔离非修隔离）·B 默认 Ban 维持（伪缺口 · 策略面 fresh 机检 350∈348±2）·C 仅诚实失败路径**；RLS 根 MUST NOT abandon 四处写死与实码三点吻合。
3. Pins 原值零漂移、`:60`/`:64`/`:68` cite-only、DELETE=503 在码；OB-1 引锚 `:281-282`→实锚 `:280-281` 非阻断（C-P7 更正）；0 Blocker · 8 Conditions · alone≠dual 不代签 mw-e2e-ha · 0 prove · 0 coding · 0 SSOT · 禁 push。

**Verdict: PASS**
