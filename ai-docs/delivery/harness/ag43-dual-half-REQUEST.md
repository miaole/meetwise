# AG43-DUAL-HALF REQUEST（AG-43 双半收口小刀 · ①manifest 纳管释放函数 + ②审核人半单行 · 量级微 · 零迁移 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·est live=0·Ban self-approve·alone≠dual·⛔push）

**席位**：AG-43 双半收口小刀起草席（QSEC STILL OPEN 两件·半刀清条·协调方派单·北星 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `fe4079a0`（origin tip 亲证·本席 `git fetch --all --prune` 后 `git rev-parse origin/feat/mysql-schema-skeleton`=`fe4079a073d5ea2b5ebcb5afec134ee40b1d1462`·派单下界「tip≥fe4079a0」**等号成立**亲证）。分支 `line/ag43-dual-half`·工作树 `meetwise-ag43`（仓根同级·`git worktree add ../meetwise-ag43 -b line/ag43-dual-half origin/feat/mysql-schema-skeleton` 本起草席亲立·直接落 origin tip 零 reset；`-b` 成功即分支建前不存在的机证）。
**立项出处（三层蓝本·不自建 SSOT 行——STILL OPEN 行与刀映射行翻面权归协调方）**：①`issues-final.md` AG-43 `:522-531`（P3·两子句=「审核人缺失记为 `__system_qbank__`」+「退役/失败代释放函数无调度」·修法原文两肢）；②QSEC 卷（`qbank-control-sec-REQUEST.md` blob `33dac889`）§1.3-2/§3-2/§5 Ban「AG-43 审核人半=单行搭车项·本刀不收·另登」+§9.3-6「manifest 纳管=后继刀面（直接 ALTER 属主撞 unexpected_definer_function_count=0 门）」——**本刀即该后继刀面+另登载体**；③`execution-master-checklist.md` `:2476`（QSEC nail 段「AG-43 审核人半：按卷 §3-2/§5 Ban 裁定零字节」）+`:2482`（STILL OPEN 行两件在案：「AG-43 manifest 纳管释放函数」「AG-43 审核人半单行（qbank-curation.ts 搭车项另登）」）+`LANDING-INDEX.md` §11 `:85` 刀映射②「AG-43 审核人半=单行顺手项」。

## §0 现状锚（起草席亲读·base `fe4079a0`·file:line/blob 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节对届时 tip 全量重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：建前快照 60 树实测（主仓+59 支线树）——**无 ag43 树**；建后 61 树=本席 `meetwise-ag43` 一株。
- `git branch -a | grep ag43-dual`：建后恰 1=`line/ag43-dual-half`（本席 `worktree add -b` 亲立·建前不存在由 `-b` 成功机证）。
- `ls ai-docs/delivery/harness/ | grep ag43` EXIT=1——**零同名刀卷**（ag39-org-qbank/ag39-quality 两卷系 AG-39 面·非本刀）。→ **停止条件未触发·可落卷**。
- 在飞交叠：四支非主线祖先支线（`ccl/line/cap-sanction-2208`@`a75736a0`/`ccl/line/g7w-diag-needles`@`e09cf11c`/`ccl/line/worker-hang-guard`@`a479fdc2`/`ccl/line/5e-cleanup-sweep-2`@`2ca6e56f`）对 `git diff HEAD...支线` 逐支机检——**七文件（§1 修法面）零触**（cap-sanction 支触 public-text-policy 两件=§2-6 门救济载体非交叠）。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`fe4079a0`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/db/src/principal.ts` | `c31cbac0`（全 40 hex：`c31cbac08890c49bf42555b136adf43b1b393e1e`·对 QSEC §0.1 锚**恒等亲证零漂**） | `:49` `QBANK_CONTROL_DEFINER_ROLE`·**:51-103** `QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST`（**31 条**·五元组 signature/requiresSecurityDefiner/allowAppRoleExecute/allowExecutorExecute/requiredSearchPath·generation 生命周期组 `:56-59` prepare/validate/activate/mark_failed）·**:398-415** 供给环函数属主转移（owner≠migration 即拒·沿 manifest 逐条 ALTER OWNER TO definer）·**:507-541** ACL 归一环（REVOKE 全体 EXECUTE+按 allowAppRole/allowExecutor 补授）·`:2030-2034` 断言计数面（function_count===MANIFEST.length 等）·**:2067** `unexpected_definer_function_count !== 0` 门 |
| `packages/db/src/qbank/qbank-curation.ts` | `4072d3c5` | `:109-112` reviewSource docblock（reviewerScope=「授权之上的信任根断言·非鉴权根」）·`:116` `reviewerScope?: { reviewer: string; orgId?: string }`·`:118-139` 边界校验块（org 白名单/平台 curator 兜底）·**:140-149** UPDATE 块（`:143-145` 注记自认 audit-attribution-only·**:146** `reviewed_by=coalesce(nullif(current_setting('app.principal_user', true), ''), '__system_qbank__')`·**:149** params `[sourceId, fromStatus, decision, reviewNote ?? null]`）——**AG-43 审核人半·本刀件②** |
| `packages/db/migrations/0146_qbank_partition_lifecycle.sql` | `c9982ea1`（对 QSEC §0.1 恒等） | `:9` 「例程为手动运维例程（无自动调度·Ban 自动清理调度）」原文（调度半 Ban·QSEC 裁决项③已明示解除·本卷零字节）·`:15-59` 释放函数原体·`:61-62` GRANT app_role（历史态·0176 已收）——**历史迁移零字节** |
| `packages/db/migrations/0176_qbank_control_plane_authz_closeout.sql` | `38c1ec22` | 头注 `:16-21` 【生产可操作性如实登记】释放函数不在 MANIFEST→守卫 1 fail-closed·「把释放函数纳管 manifest（属主转 qbank_control_definer）系后继刀面（直接 ALTER 属主会撞 unexpected_definer_function_count=0 门·本卷不碰）」=**本刀件①定谳原文**·`:47-50` 函数 SECURITY DEFINER+`SET search_path = public, pg_temp`·`:58-60` 守卫 1 `tf_is_generation_control_definer()` 白名单断言·`:98-99` REVOKE PUBLIC,app_role+GRANT executor |
| `packages/db/migrations/0144_db_trigfam_unify.sql` | `29afdf46`（对 QSEC §0.1 恒等） | `:674-701` `tf_is_generation_control_definer()`——白名单=15 控制面函数属主集合**动态解析 pg_proc**（`pg_get_userbyid(proowner)`·属主转移后白名单随 provision 自洽）·`:703-711` DO 块幂等确保 `qbank_control_definer` 角色在链 |
| `packages/db/test/qbank-control-role.proof.ts` | `df258d90` | **`:55`** `QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length === 31` **pin**·`:58-61` `.some()` 签名断言族（taxonomy/chunk_serving/ann/search_terms 四支先例形） |
| `packages/db/test/qbank-handoff-closure.proof.ts` | `2ee1b196` | **`:82`** `=== 31` **pin**·`:86` `every(requiredSearchPath)` |
| `packages/db/test/qbank-control-sec.proof.ts` | `089d8924` | `:162-183` A1/A2（app_role+伪造 GUC 拒绝臂·SET LOCAL ROLE 事务定界）·`:184-188` A3a-c 静态镜像/ACL 断言·`:190-217` A4-A7 executor 端到端（**隔离库迁移身份池·全卷不 provision=件①零触亲证**） |
| `apps/worker/src/qbank-release-sweep.ts` | `b995bcc7` | `:13-19` Honesty pins 注记（`:14-17` 「生产 manifest 不含释放函数…manifest 纳管=后继刀面」=**件①落值后 stale 源**）·`:72-102` tick（`:88` executor 调释放函数形）·`:61-69` 双旋钮（ENABLED 缺省 false） |
| `packages/db/src/qbank/qbank-ingest.ts` | `d2fd6af4` | **`:276`** seed auto-approved 臂（`reviewSource(c, sourceId, 'pending', 'approved', 'seed auto-approved (trusted system corpus)')` 4 参形·**生产唯一 reviewSource 调用方**·合法无主体=未命名通道） |
| `apps/worker/test/ag39-org-qbank-isolation.proof.ts` | `8b214386` | `:322-334` reviewerScope 五调用（org 白名单过/外人拒/平台兜底/平台源两臂）——**全卷零 `reviewed_by` 断言**（rg 亲证·件②零断言触） |
| `apps/worker/test/qbank-generation.proof.ts` | （随锚·blob 届时亲算） | `:598/:605/:621` takedown 4 参形（未命名通道零触臂） |
| `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md` | （随锚·blob 届时亲算） | `:4`/`:31`/`:41`/`:55`/`:151` 「31 函数」**五处计数**·`:55-104` §2 函数移交清单（§2.1 表 generation 组含 mark_failed 行）·`:151` 门禁描述「不在 31 函数清单里的任何函数计数」 |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `dac7f58c`（对 QSEC §0.1 恒等） | AG-43 `:522-531`（触发例子「审核调用未带主体 → 审计显示系统账号；retired/failed 代分区无人定期释放」·修法原文「审核人缺失应拒绝**或记明确错误**，不得静默写成 `__system_qbank__`；为 0146 释放函数加受控调度」——调度半 QSEC 已兑现·审核人半=本刀件②） |
| `ai-docs/delivery/harness/qbank-control-sec-REQUEST.md` | `33dac889` | §1.3-2/§3-2/§5 Ban「AG-43 审核人半（qbank-curation.ts `__system_qbank__` coalesce——单行搭车项·**本刀不收·另登**）」·§9.3-6「manifest 纳管=后继刀面」·§9.4 门矩阵基线（control-sec 26/dbhy1 28/handoff 16/control-role 12） |
| `ai-docs/delivery/execution-master-checklist.md` | `8a98fb92` | `:2476` QSEC nail 段（「AG-43 审核人半：按卷 §3-2/§5 Ban 裁定零字节（派单『若卷裁搭车』条件未满足）」）·**:2482** STILL OPEN 行（「AG-43 manifest 纳管释放函数…归后继」「AG-43 审核人半单行（qbank-curation.ts 搭车项另登）」两件在案）——只读引用·翻面权归协调方 |
| `ai-docs/delivery/ai-capability-review/LANDING-INDEX.md` | `948fc7c7`（对 QSEC §0.1 恒等） | §11 `:85` 刀映射定谳（「②AG-43 审核人半=单行顺手项」） |
| `scripts/ai-docs/public-text-policy.mjs` | （只读锚） | `:102` `const MAX_FILES = 2_200`（cap 现值·`git merge-base --is-ancestor a75736a0 fe4079a0` EXIT=1=**cap-sanction-2208 未并主线亲证**）·`:87-100` sanction 注记栈（末行「cap 2200→2208（2026-10-16 协调方 sanction…在飞 G7W-DIAG-NEEDLES/WORKER-HANG-GUARD 两 REQUEST 并入即 2201 超限）」系 a75736a0 支线内容·主线树无） |

### 0.2 漂移登记（派单/QSEC 记值 vs 实测·如实改述·结论零变·非停止条件）

1. **QSEC qbank-curation.ts 锚漂**：QSEC §0.1 blob `e617a824`·reviewSource 块 `:48-58`（coalesce 臂 `:55`）——实测现树 blob `4072d3c5`·块 `:140-149`（coalesce 臂 `:146`）=**AG39 刀（0186/0187）演进所致**（reviewerScope 参数与 :118-139 边界校验块为 AG39 增补）。AG-43 审核人半红事实（coalesce 尾臂系统账号兜底）**在场结论零变**·行锚随树演进重钉。
2. **principal.ts 零漂**：blob `c31cbac0` 对 QSEC §0.1 锚**恒等亲证**（QSEC 本卷零字节兑现）·0146 `c9982ea1`/0144 `29afdf46` 同恒等。
3. **unexpected 门行漂**：QSEC §9.3-6 记 principal.ts `:2059` 实文——实测现树 `:2067`（checklist 波行漂·非本刀面）。
4. **「31 函数」计数面盘点**：两 proof pin（`:55`/`:82`）+sealed-manifest 规则文档五处（`:4/:31/:41/:55/:151`）=件①落值后的随翻面全集（rg `=== 31` 全仓恰两命中+规则文档五处·web-logic.proof `vclock === 31_750` 无关排除）。
5. **issues-final 修法字面收窄**：「审核人缺失应拒绝」系审计时点两肢并列（「**或记明确错误**」）——AG39 reviewerScope 命名通道在场后·失真面收窄为「命名通道归因不走信任根值」·§1.3 候选甲否决承。
6. **docs:check cap 谱系**：主线 fe4079a0 树 cap 2200（`:102` 亲读）·起草树实测 scanned **2200=cap 余 0**（本席 `node scripts/ai-docs/check-docs.mjs` EXIT=0 亲跑）——fe4079a0 卷（context-budget-wire nail）自证「cap 贴边触顶·余量 0·停手条件预置在案」·**本卷 +1 .md 即 2201 越限**（§2-6 红况如实登记·救济载体在途）。

## §1 红事实与修法定稿（两件·量级微·零迁移）

### 1.1 件①红事实：释放函数 manifest 缺位=调度半生产不可用（QSEC 自登记的后继刀面）

机制链四环：①0176 收口后释放函数 executor-only+守卫 1 白名单断言（0176:58-60）——隔离库（迁移身份属主全函数）守卫恒过·QSEC proof A4-A7 端到端已证；②**生产 provision 后函数属主仍=迁移登录**：供给环（principal.ts `:398-415`）只对 MANIFEST 成员做 ALTER OWNER→函数不在清单=不转属主；③守卫 1 在 SD 体内读 `current_user`·白名单=15 控制面函数属主集合（0144:674-701 动态解析）——provision 后该集合={qbank_control_definer}·迁移登录 ∉ 集合 → **守卫 1 显式拒绝**（fail-closed 提前于 DETACH·0176:16-18 自登记）；④后果=QSEC 已落的调度半（`qbank-release-sweep.ts`·QSEC 已 nail）在生产恒 pending——`qbankReleaseSweepTick` 逐代调用全数落 catch·released=0。0176:19-20 明文「把释放函数纳管 manifest（属主转 qbank_control_definer）系后继刀面（直接 ALTER 属主会撞 assertQbankControlDefinerOwnership 的 unexpected_definer_function_count=0 门·本卷不碰）」——**本刀即其后继刀面**。随锚面：两 proof `=== 31` pin+sealed-manifest 规则文档「31 函数」五处。

### 1.2 件②红事实：审核人归因在命名通道失真（单行搭车项·另登兑现）

reviewSource UPDATE（`:146`）`reviewed_by=coalesce(nullif(current_setting('app.principal_user', true), ''), '__system_qbank__')`：AG39（0186）已增补 reviewerScope 命名审核人通道（`:118-139`·服务端信任根校验 org 白名单/平台 curator）——但**命名通道审核落库时 reviewed_by 仍走 GUC 值/系统账号兜底**：GUC 可被 asPrincipal 自设（principal.ts `:985-986` doctrine 自认「tenant-routing context, not a cryptographic identity root」·0176 头注①同源承）·操作面无主体时静默记系统账号=审计归因失真（issues-final AG-43 触发例子「审核调用未带主体 → 审计显示系统账号」在命名通道的残留形）。**影响界如实**：未命名通道（`qbank-ingest.ts:276` seed 自动审核臂·生产唯一调用方）`__system_qbank__` 归因**如实**（确系系统所为）·历史 proof 全零触（ag39 proof 五调用零 `reviewed_by` 断言亲证）。

### 1-修法两件（⛔以下定稿文本不得更改——EXEC 逐字节照抄·Ban 自由发挥·blob 锚届时亲算）

**件① manifest 纳管释放函数（五触点·a 语义面+四随翻）**

(a) `packages/db/src/principal.ts` `:59` 行（`qbank_mark_generation_failed` 条目）后插入恰 4 行：

```ts
  { signature: 'qbank_mark_generation_failed(text,text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'public, pg_temp' },
  // AG-43 release terminal (0146 body, guard 1 rewritten to the definer-whitelist
  // assertion by 0176).  Registered so provisionQbankControlDefiner transfers its
  // owner to qbank_control_definer — the successor face logged at 0176:16-21.
  { signature: 'qbank_release_retired_generation_storage(text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'public, pg_temp' },
```

（五元组与 0176:47-50 函数事实逐项对映：SECURITY DEFINER→requiresSecurityDefiner=true·`:98-99` executor-only→allowAppRoleExecute=false/allowExecutorExecute=true·`SET search_path = public, pg_temp`→requiredSearchPath 同值。）

(b) `packages/db/test/qbank-control-role.proof.ts` `:55` `=== 31`→`=== 32`·并在 `:61` `qbank_search_terms` some() 子句后追加一子句：

```ts
    && QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.some((entry) => entry.signature === 'qbank_release_retired_generation_storage(text)'));
```

（替换原 `:61` 行尾 `));` 为上形——四支 some() 先例形同构。）

(c) `packages/db/test/qbank-handoff-closure.proof.ts` `:82` `=== 31`→`=== 32`。

(d) `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md` 五处计数 31→32（`:4`/`:31`/`:41`/`:55`/`:151`）·§2.1 表 `qbank_mark_generation_failed` 行后追加一行：

```markdown
| `qbank_release_retired_generation_storage(text)` | 是 | 否 | 是 | `public, pg_temp` |
```

(e) `apps/worker/src/qbank-release-sweep.ts` `:13-19` Honesty pins 首条注记刷新（comment-only·零行为）——原文四行替换为：

```ts
 * - manifest 纳管（AG-43 双半刀兑现 0176:16-21 后继刀面）：释放函数已入 QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST
 *   （requiresSecurityDefiner/allowAppRoleExecute=false/allowExecutorExecute=true/search_path 同 0176 函数事实）——
 *   provision 后属主=qbank_control_definer（0144:674-701 白名单动态解析）→ 守卫 1 生产面恒过；ACL 归一维持
 *   executor-only（0176:98-99 语义恒等）。隔离库迁移身份属主下守卫恒过不变。
```

**件② 审核人半（三触点·恰 qbank-curation.ts 一文件）**

(a) `:112` docblock 行尾追加半句（原句零改）：

```
 * 审核人归因（AG-43 双半刀）：reviewerScope 传入时 reviewed_by=reviewerScope.reviewer（服务端信任根派生·非 GUC 非系统账号兜底）；未传=既有链零变（系统 seed 自动审核臂 `__system_qbank__` 归因如实保留）。
```

(b) `:143-145` SQL 注记块末追加一行：

```
             -- A named reviewerScope reviewer is attributed verbatim; the GUC/coalesce
             -- chain only covers the unnamed operational arm.
```

(c) `:146` coalesce 行与 `:149` params 行替换为：

```ts
            reviewed_by=coalesce($5, nullif(current_setting('app.principal_user', true), ''), '__system_qbank__'),
            review_note=$4, reviewed_at=now(), version=version+1
      WHERE id=$1 AND status=$2`,
    [sourceId, fromStatus, decision, reviewerScope?.reviewer ?? null, reviewNote ?? null]);
```

**效果链（机制自证）**：件① 供给环 `:398-415` 属主转移（现owner=迁移登录→definer·非迁移属主仍显式拒）→守卫 1 白名单生产恒过→调度半生产可用；ACL 归一环 `:507-541` 先 REVOKE 全体 EXECUTE 再按五元组补授（executor 补授=0176:98-99 现状恒等·PUBLIC/app_role 拒绝恒等）；断言门 `:2030-2067` 计数自洽（function_count=32=MANIFEST.length·security_definer_count/invoker_helper_count/safe_search_path_count 随 filter 自洽·unexpected_definer_function_count=0——**manifest 先行是唯一合法序**）。件② named 通道归因=信任根派生值（reviewerScope.reviewer 在 `:118-139` 已过白名单校验方至此）；未命名通道 `$5=NULL`→coalesce 原链逐字节等值（seed 臂/历史 proof 零行为差）。

## §1.3 否决（候选淘汰登记·防 EXEC 期重开）

- **候选甲（否决·Ban）=issues-final 字面「审核人缺失应拒绝」全局硬闸化**：生产唯一调用方=qbank-ingest.ts `:276` seed 自动审核臂**合法无主体**（系统灌库·`:46` QBANK_OWNER 主体注释亲读）——硬闸=系统灌库审核臂全断·面反转；「或记明确错误」另一肢的等值实现=命名通道归因修正（本刀件②）·归因不再静默失真。
- **候选乙（否决·Ban）=直接 ALTER FUNCTION OWNER 跳过 manifest**：撞 `:2067` unexpected_definer_function_count=0 门（0176:19-20 自登记+QSEC §9.3-6 承）——manifest 先行唯一合法序。
- **候选丙（否决·Ban）=新迁移（0178+）SQL 路线镜像转属主**：0176 体已权威（守卫 1 白名单断言已落）·缺的只是 provision 归属面=TS manifest 一条目兑现；新迁移 CREATE OR REPLACE=零语义增量重复 DDL+镜像纪律面（Ban 动 0146/0176 原文承·函数体零字节即无迁移必要）。
- **候选丁（否决·Ban）=reviewed_by 新列/GUC 弃用重构**：新增列=迁移面越界（本刀零迁移）；GUC 读面保留=未命名通道向后兼容臂（0176 后 GUC 非鉴权根·纯审计残值如实保留）。
- **候选戊（否决·登记）=0029:119/:121 两支 P5 残面顺带清理**：checklist `:2482` 明文「归 P5 后继清点」·与 0146 释放函数 UPDATE 的 RLS 语义纠缠在案（QSEC §9.3-4 如实越界注记）·非本刀面。
- **候选己（否决·Ban）=manifest 条目 allowExecutorExecute=false 纯边界形**：0176:99 已 GRANT executor·落值后 ACL 归一环会 REVOKE 且不补授=调度半断（枚举与调用全走 asQbankControlExecutor）——allowExecutorExecute=true 系调度半存续要件非自由项。

## §2 门矩阵（pre-exec 双审核对单基面·**数字口径以实跑实测为准+偏差熔断**·命令原样可复制）

0. **改前基线 run（必做·恰 1 次）**：`git hash-object packages/db/src/principal.ts`=`c31cbac08890c49bf42555b136adf43b1b393e1e` 恒等亲证+`git hash-object packages/db/src/qbank/qbank-curation.ts`=`4072d3c5` 前缀亲证（漂则 §0.2 协议重 pin 非停）+`node scripts/ai-docs/check-docs.mjs`（起草树实测 EXIT=0 scanned **2200**）。
1. **QSEC 邻面 proof 六门（隔离库·est live=0）**：
   - `pnpm -C packages/db prove:qbank-control-sec` EXIT=0 **26 臂**（A1-A7/B1-B9/C1-C3·零改门·隔离池不 provision=件①对 A 系零触亲证）；
   - `pnpm -C packages/db prove:qbank-control-role` EXIT=0 **12 臂**（`:55` pin 32 翻转行使+(b) some() 新子句行使）；
   - `pnpm -C packages/db prove:qbank-handoff-closure` EXIT=0 **16/16**（`:82` pin 32 翻转行使）；
   - `pnpm -C packages/db prove:dbhy1` EXIT=0 **28 臂**（P5 族零翻·P5-12 failed 可释臂原值·dbhy1 P3-1 登记缺口臂维持可预期红如实登记）；
   - `pnpm -C apps/worker prove:ag39-org-qbank` EXIT=0 **50 臂**（reviewerScope 通道行为面零触·reviewed_by 零断言亲证）；
   - `pnpm -C apps/worker prove:qbank-integrity-upgrade` EXIT=1 **基线同红如实登记**（mig-runner 时代差分·QSEC §9.4 承·非本刀面）。
2. **neg 邻面**：`pnpm neg:all` EXIT=0 **692**（90+90+91+107+179+135·对届时实测·总臂差≠0 如实登记归因）。
3. **migrate 零新**：`pnpm migrate:prove` EXIT=0·链 **204 文件头 0204**（本刀零迁移）+`node scripts/check-migration-version-uniqueness.mjs` violations=0。
4. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（**8/8**·0 cached）。
5. **lint**：`pnpm turbo lint` 全任务 **12/12**·五值恰等贴边（root **5235**/web **601**/api **1421**/worker **954**/ai-runtime **628** 对 fe4079a0 卷终值·届时漂移以实测为准·全域 0 errors·零第三红·出现即停）。
6. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned≤届时 cap——**起草树红况如实登记（停手条件命中上报）**：fe4079a0 树 cap **2200**（public-text-policy.mjs `:102` 亲读）+起草树实测 **2200=cap 余 0**+本卷 1 .md → **2201>2200 越限红**（fe4079a0 卷预登记「cap 触顶后处置权归协调方」）。**已 sanction 救济在途**=`cap-sanction-2208` 刀（`a75736a0`·2200→2208·sanction 注记「2026-10-16 协调方 sanction」支线 `:87-88` 亲读·**未并主线** merge-base 亲证）——EXEC 届时按届时主线 cap 实跑：cap 2208 已并则 2201≤2208 EXIT=0·未并则红停上报协调方（**Ban 自升**·cap sanction 权归协调方）。
7. **markers 五类零命中**：本刀改动集（§2-8 七 tracked+收据目录）五类标记词 grep 零命中（`scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·**词面不复抄卷内防自匹配**·命令与回执入收据）。
8. **diff 面机检+卫生**：`git diff --numstat <base>`（`<base>`=届时主线 tip·EXEC 工序并线 merge 第二亲）恰 **7 tracked**=件① principal.ts+两 proof+规则 .md+sweep 头注 5 改+件② curation.ts 1 改+本卷 1 新 .md（多任何 tracked 路径即停）·**零迁移**零 package.json 零 lockfile·`pnpm install --frozen-lockfile` EXIT=0·`.env*` ABSENT 双向记录·`actualSpendCny=null`·est live=0·typecheck 副产 tsbuildinfo `git checkout` 回滚基线。

## §3 范围外（边界清单·越界即 FAIL）

1. **历史迁移 0001-0177 零字节**（含 0146/0176/0144/0106/0066/0067 原文·镜像纪律）·**零新迁移**（§1-修法丙承）。
2. **释放函数体与守卫零字节**（0176 权威体·件①只动 provision 归属面非函数语义面）·五函数 ACL 读面/0106:358-367 retrieval_plan RLS 零动。
3. **0029:119/:121 两支 P5 残面**（§1.3 候选戊·归 P5 后继清点）·AG-39/AG-37 面零触。
4. **生产 consumer/检索语义应用层零字节**（interview-consumer/qbank-retrieve-scope/qbank-generation-retrieval）·principal.ts 非 manifest 面（asPrincipal doctrine/executor 面）零字节。
5. **未命名审核通道语义零变**（seed 自动审核臂 4 参形·GUC 读链保留·历史 proof 全零触）。
6. **共享 SSOT 四件+INDEX 只读**：checklist `:2482` 两 STILL OPEN 行/LANDING-INDEX 刀映射行/issues-master/issues-final/LEDGER 翻面权全归协调方（本卷不预翻不宣称关闭 AG-43 整行）。
7. **cap sanction 面零触**：public-text-policy.mjs/proof 零字节（§2-6·Ban 自升）·cap-sanction-2208 支线零触（救济序归协调方）。

## §4 依赖

**①上游（已满足·亲证）**：QSEC nail 已在主线（0176 迁移+qbank-release-sweep 调度半+executor-only·fe4079a0 树 §0.1 锚亲证）+AG39 0186/0187 已在主线（reviewerScope 通道在产）——本刀零等待。
**②同文件在飞**：§0.0 四支零触亲证·唯 cap-sanction-2208 系 §2-6 门救济载体（并线序归协调方·先并则 EXEC 按 2208 复跑）。
**③迁移号**：零新增（§0.3 不设·零 DDL）。
**④下游**：门矩阵全绿→pre-exec 双审→EXEC→post 双审→nail；checklist `:2482` 两行翻面+LEDGER AG-43 行兑现注记+合计笔递推**均归协调方 nail 波**。

## §5 Ban 列表 + pins

**Ban 列表**（QSEC 承誊+本刀面增补）：

Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（门矩阵任一 prove 恰 1 次·红不重跑冲销·改前基线 run 恰 1 次）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX 行与统计只读引用·STILL OPEN 行与刀映射行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已读/已验来源；**本刀增补**：Ban 历史迁移零字节改（0001-0177 全体·只零新增）；Ban 动 0146/0176/0144/0106/0066/0067 原文（blob 锚 §0.1 对账）；Ban 动释放函数体与五道守卫（0176 权威体·件①只动 manifest 归属面）；Ban 动五函数 ACL 读面与 retrieval_plan RLS（QSEC 同款承）；Ban 触生产 consumer/检索语义应用层与 principal.ts 非 manifest 面（asPrincipal/executor doctrine 面零字节）；Ban 触 AG-39/AG-37/0029:119:121 P5 残面（§1.3 戊）；Ban 未命名审核通道语义变（seed 臂 4 参形零触·GUC 读链保留）；Ban cap 自升（§2-6·cap sanction 权归协调方·越限红停上报）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全隔离库/静态断言·零模型外呼·零消耗）

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（docs-only 落卷 turn；门矩阵亲跑仅 docs:check 本地静态门）。EXEC 期 prove 面=全隔离容器（QSEC 六门同法）+静态断言·零模型外呼·§2 承。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·词面不复抄卷内防自匹配——沿 QSEC/context-budget-wire 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类 + 裁决项）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（QSEC STILL OPEN 两件登记+LANDING-INDEX §11:85 刀映射②=立项蓝本·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 对届时 tip 逐条重 pin——含 §0.2 六项漂移登记如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 principal.ts 对 `c31cbac0` 漂移（另席在飞触同文件=按 §0.0 并线序重 pin 非停）·curation.ts 对 `4072d3c5` 漂移·门基线锚漂（control-sec≠26/dbhy1≠28/handoff≠16/control-role≠12/ag39≠50/neg≠692/迁移链≠204·届时实测账）→停·重 pin 回炉。
- **机制不满足**：供给环/断言门实文与 §1.1 机制链推定不符（如 unexpected 门语义已变·或白名单解析已非属主动态形）→证伪诊断→停·如实升级回炉。
- **越界需要**：修法诉求超出 §1 两件七触面（需触函数体/迁移/SSOT/cap 面）→停·另刀或协调方裁决（§1.3 六候选否决沿承）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（docs:check cap 越限=**起草树已命中已上报**·邻面新红/lint 第三红）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

**待双审/协调方/EXEC 裁决项**：

1. **随翻面收编**：§1-修法①(d)(e)（sealed-manifest 规则文档计数同步 31→32 五处+表行追加·sweep 头注 honesty pin 刷新）收编与否——推荐收编（契约文与注记随码面同.truthful·diff 面 7 tracked）；否决则 5 tracked 但留 stale 契约计数与 stale 注记（如实呈报两形）。
2. **审核人半归因序**：reviewerScope.reviewer 最优先（推荐·审计归因随服务端信任根·不依赖可伪造 GUC·issues-final 修法肢的命名通道兑现）vs GUC 最优先（reviewerScope 仅作边界断言·归因漂移维持=件②退化为零修法）——本卷按推荐形定稿。
3. **docs:check cap 处置序**（起草树 2201>2200 红已登记·停手条件命中上报）：cap-sanction-2208 刀 nail 并线先行 vs 本刀 EXEC 期并线后按 2208 复跑——序归协调方·两形均 EXIT=0 可达（Ban 自升不破）。

---

*AG43-DUAL-HALF REQUEST · 2026-10-16 · **draft:awaiting_pre_exec_dual** · base `feat/mysql-schema-skeleton` @`fe4079a0`（origin tip 亲证·派单下界 tip≥fe4079a0 等号成立·起草树 docs:check EXIT=0 scanned 2200=cap 余 0 本席亲跑·+本卷即 2201 越限红如实登记=停手条件命中上报·救济载体 cap-sanction-2208@a75736a0 已 sanction 在途未并）· 分支 `line/ag43-dual-half` · 工作树 `meetwise-ag43`（git worktree add 本起草席立·直接落 origin tip·建前 worktree list 60 树无 ag43+-b 成功机证分支不存在+harness 零同名卷三查过）· 立项三层蓝本=issues-final AG-43 :522-531（两子句+修法两肢）+QSEC 卷 §1.3-2/§3-2/§5 Ban「审核人半搭车项另登」§9.3-6「manifest 纳管=后继刀面」+checklist :2476/:2482 STILL OPEN 两件+LANDING-INDEX §11:85 刀映射② · 红事实两链=（①释放函数 manifest 缺位→provision 不转属主→守卫 1 白名单生产拒→调度半生产恒 pending·0176:16-21 自登记后继刀面·unexpected 门 :2067 禁跳序）（②命名审核通道 reviewed_by 仍走可伪造 GUC/系统账号兜底=审计归因失真·seed 臂系统归因如实）· 修法两件七触面（①principal.ts manifest 条目+两 proof pin 32+规则文档计数同步+sweep 头注刷新 ②curation.ts coalesce 前置 $5+params+两注记）· 零迁移零新码文件零 package.json · 门矩阵九门（QSEC 邻面六 proof+neg 692+migrate 204+typecheck 8/8+lint 12/12 五值+docs:check 届时 cap+markers+diff 恰 7 tracked）· 否决六候选（甲硬闸断 seed 臂/乙跳 manifest 撞门/丙新迁移重复 DDL/丁新列越界/戊 P5 残面非本刀/己 executor 补授=调度半存续要件）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual · **STOP 三处同值（Status 头+§8+卷尾注）***
