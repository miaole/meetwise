# Harness — **PRIV01-B · 应用层 tenant M2 等价强制（设计 + prove 方案）**（GAP-PRIV-01 后继刀 · 设计+prove 面 · 接线 PR 另审另刀 · backlog `:57` OPEN · DELETE=503 · PG-retained · **`executed:awaiting_post_prove_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC lifecycle 推进落盘 2026-10-08 Asia/Shanghai · PRE-EXEC dual BOTH PASS：mw-privacy-int 全项 PASS + mw-e2e-ha 全项 PASS · meetwise 协调方 §3⑤ standing authorize 授权 EXEC · P-A 裁定 + 断言措辞定稿（§4.1.1 · R1/R2/O1 落卷 · R3 条件性不触发）+ 设计面 prove `pnpm --filter @meetwise/db tenant-enforcement:prove` **EXIT=0（35 PASS / 0 FAIL）** · attempts 1,0 全录（attempt1 EXIT=1 确定性 fixture 字串缺陷诚实保留 · 沿 PRIV4 先例 · 交 post 双审裁，详见 §11 + receipts）· **零 `src/` 产品码 · ADR 门 cite-only 零执行零 receipt · Ban self-write `post_prove_dual_pass`** · 公开 DELETE=503 · `:57` OPEN · UC-052 partial · alone ≠ dual · Ban nail until POST BOTH + meetwise AUTHORIZE）
**EXEC provenance**: REQUEST `0147f8ce` / full `0147f8ceaef55d27397af53bd9a928eb2b2dda46`（parent `fe218b7a` · EXEC 期间 origin tip 零位移，fetch 复核 up-to-date 免 rebase · 全部引锚自 REQUEST 零漂移）· 收据 `ai-docs/delivery/receipts/priv01-m2-enforcement/2026-10-08-exec-assertions-and-prove.md`（断言措辞 file:line + attempts + env 探针）

> **Pre-exec-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 零 coding / 零 prove 执行 / 零产品码 / 零 SSOT · Ban coding until PRE dual BOTH PASS + meetwise AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`fe218b7a`** / full `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`（开工时点 origin 最新 tip · 满足预期 ≥`fe218b7a` · fetch 一次成功 up-to-date：本地 ref 开工前已恰在 `fe218b7a`，ff 为 no-op）
**Authority**: meetwise — docs-only REQUEST · Ban coding · Ban prove 执行 · Ban self-nail · PRE dual BOTH PASS（mw-privacy-int + mw-e2e-ha）后由 meetwise 授权「设计+prove 面 EXEC」· implementer 禁自批
**Line**: **PRIV01-B**（GAP-PRIV-01 后继刀 · 前刀 PRIV01-A 已落 · 队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32`）
**Worktree provenance**: `/Users/miaole/Desktop/golucky/meetwise-line-priv01`（指定路径先前刀 PRIV01-A worktree 占用、checkout 干净零未提交——旧 checkout 移除后同路径重挂本刀分支；旧分支 `line/priv01-tenant-rls` 及其 exec 提交 `f7a7162a` **原样保留零删除**，其内容已以孪生落 tip（`gap-bug-backlog.md:774` 登记）· 本刀分支 `line/priv01-m2-enforcement` 恰基于 `fe218b7a`）

## 0. backlog 原文与缺口定义（行锚 `:57` · 表头 `:55`）

原文（`ai-docs/delivery/gap-bug-backlog.md:57`，列名按表头 `:55`「现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径」）：

- **现状**：「应用层 tenant 原型 additive + prove 绿；审查 **conditional**；授权根仍为 PG RLS / `asPrincipal`+`set_config`；**应用层 tenant ≠ RLS**」
- **目标**：「写清并 prove MySQL 时代显式强制（非 optional filter）+ 跨 owner fail-closed；privacy 清单 prove 绿前 **MUST NOT abandon RLS**」
- **归属域**：privacy · **拟切片**：「M2 等价强制设计→prove 对齐 ADR 清单；接线 PR 另审」 · **所需 harness 路径**：`ai-docs/delivery/harness/tenant-enforcement.prototype.md`；切流前另需 `pnpm privacy-authorization:prove` / `crypto:prove` / erasure*

**前刀已落 provenance（PRIV01-A · cite）**：应用层 tenant 原型 additive + `pnpm --filter @meetwise/db tenant-enforcement:prove` 绿（`packages/db/package.json:35`）· 审查 **conditional**（`reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md`「切流/放弃 RLS 仍 block · 接线 PR 须另审」原样有效）· 授权根仍为 PG RLS / `asPrincipal`+`set_config` · D1 双审一致 **R-B 胜出**（M2 原型≠RLS 差距保留 · 显式延后设计扩展≠现行隐私洞 · `harness/gap-priv-01-tenant-rls.md` §0.1.1）· 候选 A 隔离面（真 PG owner 矩阵 6 项 + RLS 内省 3 项）已裁可、prove 执行仍待后续授权 · 立卷登记 `:774` · **`:57` stays OPEN**。

**缺口定义一句话（本刀）**：应用层 tenant 强制原型是 **additive、未接线、审查 conditional** 的旁路面——它**不是** PG RLS 授权根的等价物；本刀把「MySQL 时代显式强制（非 optional filter）+ 跨 owner fail-closed」**写清为 PG-retained 下的等价强制语义设计**（design doc）并给出**可执行的 prove 方案**（prove plan），设计面 prove 证「语义合同」本身；授权根今日仍且仅为 PG RLS FORCE + `asPrincipal`+`set_config('app.principal_user')`，privacy 清单 prove 绿前 **MUST NOT abandon RLS**，且应用层 tenant 在任何叙事中都不得被写成已替代/已等价 RLS。

## 1. 目标（REQUEST 必写三件事）

1. **M2 等价强制设计文档 + prove 方案**：把应用层 tenant 强制从 additive 原型（optional/旁路/未接线）升级为「**显式强制（非 optional filter）+ 跨 owner fail-closed**」的**等价设计**——等价指**强制语义等价**（对齐 `m2-tenant-authorization-model.md` §3 等价表的显式强制策略行：查询路径不可跳过、跨 owner fail-closed、不是默认 WHERE 可选 filter），**不是**授权根迁移、**不是** MySQL cutover 复活（两份 M2 文档头注 STOPPED/superseded by PG-retained 原样有效，「MySQL 时代」仅系 backlog `:57` 原文语境引用）。
2. **prove 对齐 ADR 清单**：prove 方案按行内清单写清「哪些 prove 必须绿」——`m2-tenant-authorization-model.md` §4「Prove 门禁清单（ADR）」+ `:57` 所需 harness 路径列「切流前另需 `pnpm privacy-authorization:prove` / `crypto:prove` / erasure*」——登记为**切流门**（各门独立 EXIT=0 + 独立审查；本刀 cite-only 不执行不复跑，见 §4.2/§4.3）。
3. **本刀只做设计+prove 面**：产品码接线 = **接线 PR 另刀另审**（2026-09-10 conditional 审查条件 #2 原样）；本刀零产品码改动，设计 target ≠ 已授权接线。

## 2. 两层关系（写死 · 硬 Ban 防线 · 设计文必载）

| 层 | 今日真相 | 本刀处置 |
|----|----------|----------|
| **授权根（第一层 · 唯一）** | PG RLS FORCE（`0001_baseline.sql:7`「所有归属表都带 owner_user_id + ENABLE + FORCE ROW LEVEL SECURITY（连超级用户走 app_role 时也不绕过）」· `:63-82` `app_role NOLOGIN` 无 BYPASSRLS + `p_owner` USING/WITH CHECK 双侧 · `:300-304` vector_chunk 同形）+ `asPrincipal`（`principal.ts:945-955` `BEGIN`→`SET LOCAL ROLE app_role`→`set_config('app.principal_user',$1,true)`→COMMIT）+ `provisionRuntimeLogin`（`:566-608` `LOGIN NOINHERIT … NOBYPASSRLS`）+ `app_role` | **零触碰 · MUST NOT abandon/弱化/迁移**（backlog `:57` 目标列逐字「privacy 清单 prove 绿前 **MUST NOT abandon RLS**」）|
| **应用层 tenant 强制（第二层 · 纵深防御）** | `packages/db/src/tenant/` 四 helper（`requireOwnerUserId`/`assertTenantPredicate`/`buildRequiredOwnerFilter`/`enforceOwnerOnRow`）additive · 未接线 · prove 绿但审查 conditional | 本刀写清其**显式强制语义合同**（§3）+ prove 方案（§4）；接线另刀 |

- **两层形态不同、缺一不可**：DB 层缺省 deny（GUC 未设/空 → `current_setting('app.principal_user', true)` 为 NULL → 谓词假 → **0 行**）；应用层为入口 throw（missing/blank → `tenant_owner_user_id_required` · mismatch → `tenant_owner_mismatch`）。应用层强制**不替代**任一 DB 层形态。
- **等价宣称 Ban（三类）**：「应用层 tenant = RLS 等价」「应用层 tenant 已替代 RLS / 授权根已迁应用层」「prove 绿 ⇒ RLS 可降级/放弃」——三类叙事全 Ban；「M2 等价」仅指**显式强制语义**相对 backlog `:57` 验收口径的等价设计，非授权根等价。
- **abandon 零预授权**：本设计即使全部 prove 绿，也不触发 RLS abandon——abandon 另须 privacy 清单 prove 绿 + 产品权威显式裁定 + 独立审批，本刀不预授权、不写 abandon 判据时间表。

## 3. 设计主体（M2 等价强制语义合同 · 显式非 optional · 跨 owner fail-closed）

### 3.1 现状（additive 原型 · cite）

`packages/db/src/tenant/index.ts`（130 行 · 头注「ADDITIVE path for future MySQL · 应用层 tenant ≠ RLS · Must not silently replace the auth root」）+ `packages/db/test/tenant-enforcement.proof.ts`（154 行 · missing/blank owner throw · mismatch throw · match pass · 静态钉 `asPrincipal`+`set_config` 在位）。现状 = 库存在、语义合同已在源码注释声明、**零生产接线**、审查 conditional。

### 3.2 升级合同（E1–E5 · 本刀写死 · 接线 PR 按合同另审）

| # | 合同 | 语义 | fail 模式 |
|---|------|------|-----------|
| **E1** | **owner 显式供给** | 每条 app 层 tenant 域查询/写路径必须**显式**从已认证 principal context 供给 `owner_user_id`；**无环境态/默认 tenant scope**——缺/空/非字符串一律入口拒绝 | `requireOwnerUserId` throw `tenant_owner_user_id_required`（fail-closed 入口）|
| **E2** | **必选谓词（非 optional filter）** | owner 谓词是语句形状的**必选部分**（WHERE / WITH CHECK 等价位）；`buildRequiredOwnerFilter` 恒返回必选谓词对象（`column:'owner_user_id'`+`value`），**不存在「空谓词成功」形态**；调用方 MUST bind、省略即合同违约 | helper 恒返回谓词或 throw，永不返回「无过滤」成功 |
| **E3** | **跨 owner fail-closed** | 行 owner ≠ required → throw（deny）；API 出面**不可区分** 404 `not_found_or_forbidden`（`interview.service.ts:177-190` `guardInterviewPrivacy` owner 维度先例——不泄露存在性 oracle）；写前/读后双侧断言 | `assertTenantPredicate`/`enforceOwnerOnRow` throw `tenant_owner_mismatch`（row owner 缺失 → `tenant_predicate_invalid`）|
| **E4** | **层内运行** | 应用层检查**在 `asPrincipal` 会话内**执行（`SET LOCAL ROLE app_role` + `set_config` GUC 在位）；不包装、不旁路、不移除 `set_config`；GUC 仍是 RLS 输入（`principal.ts:945-955`）| 违反 = 授权根静默降级 = 合同违约（prove 静态钉）|
| **E5** | **双层 fail-closed 形态区分** | DB 层 GUC 未设 → 0 行（baseline `p_owner` 缺省 deny）；应用层 throw 为入口拒绝——两层形态并存；接线 PR 须区分「正当 0 行」与「自身 id 读写**意外** 0 行」，后者按 fail-closed 上抛，**不得**静默转译为合法空结果 | 意外 0 行 → 错误路径（非空结果）|

### 3.3 接线面（设计 target · 本刀零码）

设计仅登记：接线 = 生产 PG 归属数据路径在 `asPrincipal` 会话内按 E1–E5 调用 helper 族；具体接线文件清单、diff 面、feature-flag/bypass prove 形状（沿 M2 模型 §3「additive/flag 关零行为变化」要求）**属接线 PR**，另刀另审。本刀零 import、零调用、零 `packages/db/src/tenant/` 语义变更。

### 3.4 与 M2 模型 §3 等价表对齐（如实登记 · 非 MySQL 复活）

| M2 §3 等价表行 | PG-retained 下本刀口径 |
|----------------|------------------------|
| RLS FORCE + `app.principal_user` GUC → 显式强制策略（查询路径不可跳过 · 跨 owner fail-closed · 非 optional filter） | 即本刀 E1–E5 合同主体；**RLS FORCE 本体零触碰不 abandon** |
| privacy issuer/lease GUC（`privacy_issuer`、`app.privacy_*`）→ 等价授权根 + lease 语义；Ban `AUTH_SECRET` 冒充隐私 JWS | **不属本刀**（issuer/lease 面零触碰 · ADR 清单门 cite §4.2）|
| SECURITY DEFINER 写路径 → 收敛写入口 + 契约 prove | 不属本刀接线面；接线 PR 若触及须另审 |
| 向量/题库 chunk 删除 → sink recall=0 + 逐 sink receipt | 不属本刀（GAP-PRIV-04 `:60` 面 · cite-only 零借）|

## 4. Prove 方案

### 4.1 设计面 prove（本刀 EXEC 面 · 拟 · PRE dual 裁定）

- **CMD（拟）**：扩展现有 `pnpm --filter @meetwise/db tenant-enforcement:prove`（`packages/db/package.json:35`）或具名后继 `pnpm tenant-m2-enforcement-design:prove`（根 `package.json` named CMD · 由 PRE dual 裁定）；**always-on 零 DB 依赖**（沿现有 prove 形状 · Ban live 云端 · 不要求 MySQL/Qdrant）。
- **断言面（不得弱化）**：
  1. **E1**：missing（undefined/null）/blank/non-string owner → `tenant_owner_user_id_required` throw；
  2. **E2**：`buildRequiredOwnerFilter` 恒返回必选谓词形状（column+value），无空谓词成功形态；源短语钉「required predicate, not an optional filter hint」「应用层 tenant ≠ RLS」「授权根不得静默降级」（M2 模型 §2 中文钉死沿用）；
  3. **E3**：mismatch → `tenant_owner_mismatch` · blank row owner → `tenant_predicate_invalid` · match → pass；
  4. **E4/E5 静态钉**：`principal.ts` 仍导出 `asPrincipal` 且 `set_config('app.principal_user', $1, true)` 在位（`:945-955` 实锚）；`0001_baseline.sql` FORCE RLS + `p_owner` USING/WITH CHECK 双侧谓词形状在位（`:7`/`:63-82`/`:300-304` 实锚）；
  5. **接线面机检**：`packages/db/src/tenant/` 生产接线 = 0（`src/tenant` 仅被 `test/tenant-enforcement.proof.ts` 引用的 grep 面）——接线 PR 落地前强制保持为 0。
- **候选（PRE dual 裁定 · 实现方倾向非绑定）**：**P-A** = 扩展 proof 文件落 E1–E5 合同断言 + 接线面机检（设计升级须有对应 prove 面）；**P-B** = 沿用现有 prove 零扩展（现有断言已覆盖 E1–E3 + 静态钉主体，EXEC 仅定稿设计文档 + 复跑现有 CMD 入账）；**P-C** = 诚实失败路径（EXIT1 同形兼容 · attempts 全录 · 不得作 docs-alone 捷径）。倾向 P-A 主体、P-B 为可接受最小面、C 仅诚实失败。

### 4.1.1 EXEC 定稿（2026-10-08 · P-A 裁定 · 断言措辞 file:line · R1/R2/R3/O1 落档）

**裁定 P-A**（双审读数倾向 + 断言 4 baseline 半边/断言 2 成形断言/断言 5 接线面机检在现有 proof 缺位，P-B 将留可机检而不检面；触面恰为授权清单内 test/proof 文件，CMD 不变故 `packages/db/package.json`/根 `package.json` 零变更）。**R3（P-B 条件登记）不触发**——条件性显式注销，非静默跳过。

**断言措辞定稿（file:line · `packages/db/test/tenant-enforcement.proof.ts` · EXEC 后 299 行 · 全表见 receipts §2）**：E1 `:65-79`（既有）· E3 `:81-89`+`:112-119`（既有）· E2 成形 `:101`/`:107` · E2 源短语钉 `required predicate object, not an optional filter hint`（源 `src/tenant/index.ts:99`）`:132` · E4 provisionRuntimeLogin `:150` · E4 baseline 四钉（`0001:7`/`:63-64`/`:69-79`/`:300-304`）`:160`/`:163`/`:165`/`:168` · **R1 断言 5 接线面机检** face A（字面 `src/tenant` 串零命中 · `hits=0 files-scanned=332`）`:250` + face B（tenant 模块/符号引用在纯 re-export span 之外零命中 · `consumption=0 reexportStmts=2`）`:253` + barrel 存在性与归类断言（恰 2 条 re-export 语句）`:256`。

**R1 登记全文**：grep 面钉死双面——face A = 生产 src（`packages/*/src`+`apps/*/src`，排除 `src/tenant/**` 本体与 test）**字面 `'src/tenant'` 串**；face B = **模块引用面**（`from`/`import()`/`require()` specifier 含 `tenant` 路径段 + 五导出符号，注释剥离后落在纯 re-export span 外计 consumption）。**`packages/db/src/index.ts:25-32` barrel re-export 显式登记在位且归类 re-export ≠ consumption**（`:25-31` 值块 + `:32` 类型，恰 2 条语句 · 存在性断言防静默收窄 · barrel 使未来 `@meetwise/db` 消费者可被 face B 捕获）——防误红 + 防静默收窄。

**R2/O1（同车落卷）**：E5 应用层半边（自身 id 意外 0 行 fail-closed 上抛）**本 proof 不证、prove 显式归属接线 PR**（`proof :26-29` 头注 R2 块 + `:180` 注释 + receipts + 本节四处同文）；E5 DB 层半边（GUC 未设→0 行缺省 deny）归属前刀候选 A 隔离面 prove（awaiting 授权）——**任何一方不得被读作「E5 已证」**。

### 4.2 ADR 清单门（切流门 · cite-only · 本刀不执行不复跑）

按 `:57` 行内清单 + `m2-tenant-authorization-model.md` §4「Prove 门禁清单（ADR）」逐行登记（**未绿 = 红；全绿前 Ban cutover · Ban abandon RLS**；各门独立 EXIT=0 + 独立审查，**不自批**）：

| 门 | CMD | 锚（`package.json` 根，实测 fe218b7a） |
|----|-----|----------------------------------------|
| privacy-authorization | `pnpm privacy-authorization:prove` | `:306`（raw `:307`） |
| crypto | `pnpm privacy-authorization:crypto:prove` | `:303` |
| erasure-preview | `pnpm privacy-erasure-preview:prove`（及 domain/contract 按需） | `:349`（domain `:304` · contract `:305`） |
| erasure + DELETE=503 | `pnpm privacy-erasure:prove` / `pnpm privacy-erasure:http:prove`（含**公开 DELETE=503 pin**） | `:299` / `:359` |
| memory-vector-chunk-erasure | `pnpm memory-vector-chunk-erasure:prove` | `:345` |
| erasure*（`:57` 行内广义 · 按行清单口径） | `pnpm uc052:internal-erasure:prove` · `pnpm privacy-erasure:pause-upgrade:prove` · `pnpm vector-plane-erasure:prove` · `pnpm qdrant-store:g5-erasure:prove` | `:308` · `:301` · `:347` · `:50` |

门与刀的关系：本刀设计面 prove 绿 ≠ 任何一门绿；门绿 ≠ 接线授权 ≠ abandon 授权；门在本刀 EXEC 面零执行、零复跑、零 receipt 入账（cite-only）。

### 4.3 前刀隔离面（cite · 零互借）

PRIV01-A 已裁可候选 A（隔离真 PG owner 访问矩阵 6 项 + RLS 内省 3 项 · `harness/gap-priv-01-tenant-rls.md` §2-§3 · prove 执行仍待后续授权）。**分层口径写死**：本刀设计面 prove 证「应用层语义合同」；前刀隔离面 prove 证「PG 根事实隔离」——两层证据**分开断言、分开报告、分开结论**，零互借、零抵扣、零互洗。

### 4.4 EXIT 契约

- **EXIT0**（设计面 prove 绿）≠ 接线已授权 ≠ RLS abandon 门开 ≠ backlog `:57` CLOSED/翻行 ≠ 「tenant=RLS 等价」≠ 授权根已迁 ≠ MySQL 等价强制完成 ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ ADR 清单门全绿宣称。
- **EXIT1** = 诚实保留（做不出/环境不可复现/双审判无残余可证面→转候选 P-C）· **attempts 全录**（Asia/Shanghai 时间戳 + commit SHA + log 路径）· **Ban retry-to-green**；PREREQ 缺（pnpm/tsx 不可用等）→ 预期非零 EXIT 且记录，**Ban 换弱断言凑绿**。

## 5. 边界钉（cite-only · Ban 借）

| 边界 | 钉 |
|------|----|
| GAP-PRIV-02 `:58` | 公开 DELETE=503 **冻结**（`privacy.controller.ts:51-52` `@HttpCode(SERVICE_UNAVAILABLE)` 实码）——一字不动 |
| GAP-PRIV-04 `:60` | 向量面另刀 post_prove_dual_pass——Ban 借证据/状态/receipt/代码 |
| AR `:64` | GAP-PRIV-EXTERNAL-SINK-RETENTION **OPEN**（stub≠cloud · cloudVendorDeleted=false）——不借 |
| `:68` | GAP-PRIV-AUTHZ-PROVE-FLAKE **OPEN**（mitigated/cause-unknown · Ban retry-to-green）——不借、不洗、不当弱断言挡箭牌 |
| UC-052 | stays **partial**（Ban covered flip） |
| coveredCount=**8** | 不变 · 矩阵零触碰 |

## 6. 诚实条款

- **Ban prototype 洗白**：`tenant-enforcement:prove` 绿 ≠ RLS 等价 ≠ 授权根替代；2026-09-10 审查 **conditional** 结论（「切流/放弃 RLS 仍 block · 接线 PR 须另审」）原样保留、不得引用为已解除。
- **Ban 两层混报**：设计面/隔离面/ADR 门三层证据分开断言、分开报告、分开结论；任一层绿不得抵扣他层。
- **Ban 预支接线**：设计 target ≠ 已授权接线；接线 PR 另刀另审，本刀任何「绿」不构成接线授权。
- **Ban M2 cutover 复活叙事**：`m2-tenant-authorization-model.md` / `m2-tenant-prototype-impl.md` 头注 **STOPPED / superseded by PG-retained** 原样有效；本设计是 PG-retained 下的等价强制**语义**设计，不复活 MySQL 关系库切流、不宣称授权根迁 MySQL。
- **Ban owner 冒充 tenant**：owner 维度与 tenant/org 维度分开断言（沿前刀 C-P2/C-P3 口径）；本设计零 tenant/org 列、零 membership 谓词（候选 B 默认 Ban 沿袭）。

## 7. Scope / 非目标

- **本 REQUEST（本 commit）**：恰 4 文档 docs-only（§9）· 零产品码 / 零 migration / 零 script / 零 prove 执行 / 零 SSOT 编辑。
- **EXEC 面（授权后 · 拟）**：harness/slice lifecycle 推进 + 候选 P-A/P-B 裁定的 prove 面落地与执行入账；触碰 file 清单（拟）：本 harness + slice（零双审 stub 触碰）+ 若 P-A：`packages/db/test/tenant-enforcement.proof.ts` + `packages/db/package.json` + 根 `package.json`（named CMD）。**零 `src/` 产品码**。
- **非目标**：不接线（零生产 import/调用）· 不加 tenant/org 列或 membership 谓词 · 不动授权根（`asPrincipal`/`set_config`/FORCE RLS/`app_role`/`provisionRuntimeLogin`）· **不碰 `apps/worker/src/checkpoint-principal.ts`（隐私主链禁改文件）** · 不动 0091/0125/0137/0140/0141 授权与擦除链 · 不动公开 DELETE 503 · 不动 UC-052 面 · 不执行 ADR 清单门（cite-only）· 零 SSOT 翻行（`:57`/checklist/matrix/queue）· 零 secrets（Key name-only）。

## 8. Ban

Ban abandon RLS（授权根仍 PG RLS / `asPrincipal`+`set_config`；应用层强制 ≠ 替代 RLS · §2 两层关系写死）· Ban 把「应用层 tenant」写成 RLS 等价或替代叙事（三类等价宣称 Ban）· Ban 碰公开 DELETE=503（`privacy.controller.ts:51-52`）· Ban 碰 `apps/worker/src/checkpoint-principal.ts`（隐私主链禁改文件）· Ban 改共享 SSOT（backlog/checklist/matrix/queue · `:57` stays OPEN）· Ban secrets（Key name-only · 零值 · Ban `.env*`）· Ban coding / product code（本 REQUEST docs-only · EXEC 授权面仅设计+prove 面 · 接线另刀）· Ban prove 执行（本 REQUEST）· Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 动授权根 · Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban flip UC-050/051/052 covered · Ban retry-to-green · Ban Meridian · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · backlog `:57` OPEN · UC-052 partial。

## 9. Products

| Role | Path |
|------|------|
| Harness（设计文 + prove 方案） | `ai-docs/delivery/harness/priv01-m2-enforcement-design.md`（本文件） |
| Slice | `ai-docs/delivery/priv01-m2-enforcement-design.slice.md` |
| Dual stub `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-priv01-m2-mw-privacy-int.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-priv01-m2-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**REQUEST 立卷 commit = 上述恰 4 文件 docs-only**（零 SSOT 编辑 · backlog/checklist/matrix/queue 不在 diff · 零产品码 / migration / script / prove 执行 / 零 secrets）。

## 10. 双审 + 流程声明

**预执行双审**：`mw-privacy-int` + `mw-e2e-ha`（各自独立签 · alone ≠ dual · stub PENDING 不代填）。裁决点：两层关系写死与三类等价宣称 Ban、E1–E5 合同强度（不得弱化）、候选 P-A/P-B/P-C 取舍、ADR 清单门 cite-only 口径、EXIT 契约与诚实条款、docs-only 边界。

**流程声明**：REQUEST → 预执行双审（mw-privacy-int + mw-e2e-ha）→ meetwise 授权 → 设计+prove 面 EXEC → post 双审 → meetwise 授权 nail。（当前推进至 EXEC 完成态 `executed:awaiting_post_prove_dual`——post 双审归协调方派）

## 11. EXEC 登记（2026-10-08 Asia/Shanghai · lifecycle 推进 · meetwise 协调方 AUTHORIZE 后落盘）

| 项 | 登记 |
|----|------|
| **PRE-EXEC dual BOTH PASS** | mw-privacy-int 全项 PASS（授权根两层关系写死 · E1-E5 合同对码 · ADR 门 cite-only · 禁改面全守）+ mw-e2e-ha 全项 PASS（prove 方案可执行可判 · EXIT 契约/cite-only 边界自洽）· meetwise 协调方 §3⑤ standing authorize 授权 EXEC |
| **base 核对** | EXEC 开工 fetch origin：origin tip 仍 `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9` 零位移 → 免 rebase；全部引锚（backlog `:57`/`:58`/`:60`/`:64`/`:68` · `0001:7`/`:63-82`/`:280-281`/`:300-304` · `principal.ts:945-955`/`:566-608` · `interview.service.ts:177-190` · `privacy.controller.ts:51-52` · R1 barrel `index.ts:25-32`）自 REQUEST 零漂移实测复核 |
| **P-A/P-B 裁定** | **P-A**（依据三：双审读数倾向 · 现有 proof 缺断言 2 成形/断言 4 baseline 半边/断言 5 接线面机检 · 触面恰在授权清单且 CMD 不变→两 package.json 零变更）；R3（P-B 条件登记）**条件性不触发显式注销** |
| **断言措辞定稿** | §4.1.1（file:line 全表）· proof 文件 154→299 行（+146/−1）· 零 `src/` 产品码 |
| **R1** | 断言 5 接线面机检双面钉死（face A 字面 `src/tenant` 串 · face B 模块引用面）+ `packages/db/src/index.ts:25-32` barrel re-export 显式登记存在且归类 re-export≠consumption（防误红/防静默收窄）——落 `proof:174-258` + receipts §2 |
| **R2/O1（同车）** | E5 应用层半边 prove 显式归属接线 PR（`proof:26-29` 头注 + `:180` 注释 + receipts §2 + §4.1.1 四处同文）· E5 DB 层半边归属前刀候选 A 隔离面 · Ban 读作「E5 已证」 |
| **R3** | P-B 条件登记不触发（P-A 裁定）· receipts §1 显式注销 |
| **prove** | `pnpm --filter @meetwise/db tenant-enforcement:prove`（=`packages/db/package.json:35`）· **attempt1 EXIT=1**（2026-10-08 10:26:28..10:26:32 +0800 · 33/1 · 唯一 FAIL=断言正则漏源 `:99` 一词 `object` 的**确定性 fixture 字串缺陷**）→ 恰一行正则修复（S1→S2 diff 可验证 · 零断言语义变更 · 零被测源变更）→ **attempt2 EXIT=0**（10:27:29 +0800 · **35 PASS / 0 FAIL**）· attempts 1,0 全录（Asia/Shanghai 窗 + HEAD=`0147f8ce`+工作树态 S1/S2 + log/exit 落 receipts）· **沿 GAP-PRIV-04 attempts 台账 1,0 先例，非 `:68` 型 retry-to-green；缺陷定性显式交 post 双审裁——若裁不可采，attempt1 EXIT=1 诚实保留为 EXEC 终态** |
| **ADR 门** | **零执行 · 零复跑 · 零 receipt（cite-only）**——privacy-authorization / crypto / erasure 系列仍为切流门各自独立 EXIT=0 + 独立审查 |
| **收据** | `ai-docs/delivery/receipts/priv01-m2-enforcement/`（`2026-10-08-exec-assertions-and-prove.md` + `priv01-prove-attempt1/2.log` + `.exit`）· env 探针：node v22.22.3 · pnpm 10.18.0 · tsx v4.22.4 · darwin arm64 · PREREQ `pnpm install --frozen-lockfile`（5.2s 零 lockfile 变更）· **secrets 零触及（Key name-only）· actualSpendCny=null** |
| **触面机检（自报 · 待 post 双审机检复核）** | EXEC commit 触面 = proof.ts + 本 harness + slice + receipts 四类恰 7 文件 · **零 `src/` 产品码 / 零两 package.json / 零 SSOT 四件 / 零双审 stub / 零 `checkpoint-principal.ts` / 零 `privacy.controller.ts` / 零授权根（`principal.ts`/migrations）/ 零 secrets** |
| **EXIT 契约** | EXIT=0 十不得+1 照抄生效：≠接线已授权 ≠RLS abandon 门开 ≠`:57` CLOSED/翻行 ≠tenant=RLS 等价 ≠授权根已迁 ≠MySQL 等价强制完成 ≠HA ≠releaseEvidence ≠UC-052 flip ≠DELETE 开放 ≠ADR 门全绿宣称 |
| **Ban self-write** | **`post_prove_dual_pass` 阶段标记由 post-prove 双审（协调方派）写入**，implementer 本 EXEC 仅推进至 `executed:awaiting_post_prove_dual` 为止 · Ban nail until POST BOTH + meetwise AUTHORIZE |

---

*Harness · PRIV01-B 应用层 tenant M2 等价强制（设计+prove 方案）· `executed:awaiting_post_prove_dual` · 2026-10-07 立卷 / 2026-10-08 EXEC · backlog `:57` OPEN · DELETE=503 · PG-retained · PRE dual BOTH PASS · P-A · prove EXIT=0（35/0 · attempts 1,0 全录 · fixture 缺陷定性交 post 双审）· ADR 门 cite-only · 零 src/ 产品码 · **Ban self-write `post_prove_dual_pass`** / Ban nail until POST BOTH + meetwise AUTHORIZE · alone ≠ dual · STOP（awaiting post-prove dual）*
