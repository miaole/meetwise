# DBHY1-REG-FIX REQUEST — DBHY-1 卫生刀 P3 残面登记缺口修复刀（AG-15 `graph-run-observability.proof.ts:108` 读 `packages/db/sql/01_schema.sql` 镜像未登记 P3_RESIDUE_FILES→P3-1 `✗ 未登记引用`·CI run 39037323125/39037518235/39037857731 三连红 1/28·修法=登记恰一行·dbhy1-reg-fix 战役·快速链诊断+起草+EXEC 一体席·沿 cap-sanction 快速链形制）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-16 快速链一体席 EXEC 落卷翻面·前值 `draft:awaiting_pre_exec_dual` @`45459ba9` 史录保留零字洗·post 双审两外席待派·alone≠dual·⛔push）

**席位**：dbhy1-reg-fix 快速链席（诊断+起草+EXEC 三责一体·协调方派单·主线 CI dbhy1 步三连红 1/28 在靶）。
**基线**：`feat/mysql-schema-skeleton` @ `1b013667`（=origin tip·fetch 后 `git rev-parse` 亲证恒等·派单下界「tip≥1b013667」等号成立）· 分支 `line/dbhy1-reg-fix`（`git worktree add ../meetwise-drf -b line/dbhy1-reg-fix origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `1b013667` 亲证）· 工作树 `meetwise-drf`（仓根同级）。

## §0 现状锚（快速链席亲读亲算 @`1b013667`·EXEC 对届时 tip 重 pin）

### 0.0 防重双对表+在飞复核

- `git worktree list` 恰 1 棵 `meetwise-drf`；`git branch --list "line/dbhy1-reg-fix"` 恰 1（另 `line/dbhy1-p4-fix`/`ccl/line/dbhy1-p4-fix` 系异名旧卷零涉）；`ls ai-docs/delivery/harness/ | grep dbhy1-reg-fix` 建前零命中→落卷后唯一同名卷=本卷。
- 在飞交叠：本地全支线对 `packages/db/test/dbhy1.proof.ts` 逐支 `git log -1 -- <file>`+`merge-base --is-ancestor` 扫描——零 AHEAD 命中（零碰撞）。

### 0.1 blob/行锚表（`git hash-object` 亲算 @`1b013667`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `packages/db/test/dbhy1.proof.ts` | `aea7486a`（502 行） | **`:188-:218` `P3_RESIDUE_FILES` 登记残面集（案B'）·末条目 `:216-:217` bill4 按 entpay-s3 形注记+登记行（先例形）·`:290-:303` P3 门体：`:292` 四模式 `[/packages\/db\/sql/, /db\/sql\//, /sql\/\$\{/, /db\/\$\{dir\}/]`·`:298` `if (P3_RESIDUE_FILES.has(rel)) continue;`（登记豁免）·`:301` P3-1 断言·`:302` `✗ 未登记引用` 打印** |
| `apps/worker/test/graph-run-observability.proof.ts` | `17218e8f`（136 行） | **`:108` `readFileSync(new URL('../../../packages/db/sql/01_schema.sql', import.meta.url), 'utf8')`（唯一 sql/ 触点·命中 `:292` 首模式）·`:126-:127` C5g `01_schema 镜像:current_node/last_error/checkpoint_id 三列镜像在案` 断言（镜像对账承重消费·非影子替代）** |

### 0.2 红事实（本席当日亲证+CI 定谳）

- CI：run `39037323125`/`39037518235`/`39037857731` 三连红·每 run 恰 1/28 失败（nail 大席定谳转录）。
- 本机改前复跑（`pnpm dbhy1:prove`·一次性隔离 PG·EXIT=1）原文誊录：

```text
FAIL  P3-1 全代码面 sql/ 引用仅剩登记残面（neg 族+legacy 夹具+孤儿+manifest/拷贝·案B'）
  ✗ 未登记引用: apps/worker/test/graph-run-observability.proof.ts
✗ 1/28 失败
```

- 机制链两环亲证：AG-15 刀引入 `:108` schema 镜像直读→dbhy1 P3-1 `:292` 模式 grep 全代码面命中→该文件不在 `:188-:218` 登记集→`:302` 打印未登记引用→`A(...)` 计红 1/28。其余 27 臂全 PASS（含 P4⑤ sql⊆mig 四类名录）——红面恰 1 臂零级联。

### 0.3 cap 现势（docs:check 门前置披露）

- `scripts/ai-docs/public-text-policy.mjs:110` `MAX_FILES = 2_232`（`89074c5d` sanction 落值·AG-15 前置）·本支裸树实扫 **2232 恰等 cap（余 0）**·check-docs EXIT=0 亲跑。本卷 REQUEST 落树即 2233>2232——**该门属 cap sanction 面（主线步进刀机制·2200→2208→2216→2224→2232 谱系）非本刀码面**·本刀 diff 预算恰 2 零扩面修权·如实登记升级协调方 sanction 后并线复测（§2-4）。

### 0.4 迁移号登记（预期零迁移）

- 本刀修法=纯登记行追加（§1-修法）·零迁移零 DDL 零产品码。

## §1-修法（登记一行刀·预期码面恰 1 文件净 +2 行=归因注记 1+登记条目 1·零产品文件）

- **件①（唯一码改）**：`packages/db/test/dbhy1.proof.ts`（blob `aea7486a`）`P3_RESIDUE_FILES`（`:188-:218`）末尾（bill4 条目后）沿既有条目形追加：
  - 归因注记一行：`// AG-15 graph-run 观测 proof 读 schema 镜像·登记销案：01_schema.sql 三列镜像对账承重消费（C5g·按 bill4/entpay-s3 形·非影子替代）：`
  - 登记条目一行：`'apps/worker/test/graph-run-observability.proof.ts',`
- 该集既有 15 条目逐条带注记（`:198`/`:201`/`:205`/`:207`/`:212`/`:216` 六组注记形）——本刀沿 `:216-:217` bill4 最新先例形（注记载明归因+消费性质）。
- **登记语义=「残面登记」非豁免滥用**：AG-15 proof 系 `01_schema.sql` 退役镜像的承重对账消费面（C5g 三列镜像断言），与 entpay-s3（`:207-:209`「逐字节镜像对账面」）/bill4（`:216`「镜像逐字节对账承重消费」）同族——P3 门守的是「禁新增影子 schema 加载器」，对账消费面走登记残面清单=既定案B'语义。
- **件②（prove·零 retry-to-green）**：①改前复跑恰 1 次已行使（§0.2 誊录·EXIT=1 1/28·红名单恰 `graph-run-observability.proof.ts` 一件——现场漂移熔断零触发）；②登记后 THE prove 恰 1 次→期望 EXIT=0 **28/28**。两 run 原文+EXIT 入 §9。
- **diff 预期=恰 2 tracked**：本 proof.ts（+2/−0）+本卷 .md（新建）·其余 tracked 树零改。

## §2 验收门（快速链五门·数字口径以实跑实测为准）

1. **dbhy1 红→绿**：改前 EXIT=1 **1/28**（§0.2·FAIL 恰 P3-1·未登记恰一件）→改后 THE prove `pnpm dbhy1:prove` **EXIT=0 28/28**（熔断=0 容差：总数≠28 或 FAIL 名单≠一件即停）。
2. **邻面/当事人抽样全绿**：`pnpm -C apps/worker prove:graph-run-observability` EXIT=0（当事人 proof 自身·C5g 镜像断言在案）+ `node scripts/check-migration-version-uniqueness.mjs` EXIT=0（零迁移邻证）。臂数/断言数如实记·对基线零回退。
3. **markers 五类零命中**：本刀改动集五类标记词（词族=`scripts/i6-239-gates.proof.mjs:151-:163` 运行时组装四词+冲突标记对·词面不复抄防自匹配）grep 零命中。
4. **docs:check ≤届 cap**：`node scripts/ai-docs/check-docs.mjs`——裸树 2232≤cap 2232（余 0·`89074c5d` sanction 落值）亲证；本卷落卷后实扫 **2233>2232 超限=红·归 cap sanction 刀面**（§0.3·本刀零扩面修权·如实登记升级·协调方 sanction 后并线复测预期 2233≤新 cap）。
5. **diff 面机检**：`git diff --numstat` 恰 2 tracked=`packages/db/test/dbhy1.proof.ts`（+2/−0）+本卷 .md——多任何 tracked 路径即停（越界需要类）。

## §3 范围外（越界即停）

1. P3_RESIDUE_FILES 既有 15 条目与其余 27 臂断言本体字节零触；2. 产品码/runner/依赖/CI yml 零触；3. `public-text-policy.mjs` MAX_FILES 零触（cap sanction 归主线步进刀·Ban 就地扩面）；4. 零迁移零 DDL 零 `.env*`；5. 共享 SSOT（LEDGER/checklist）只读·行翻面权归协调方。

## §5 Ban + pins

**Ban**：push/force-push；自批（快速链一体席·post 双审两外席另派·alone≠dual）；retry-to-green（件② 两 run 各司其职·改后红即停）；为绿弱化断言（P3-1 门体/四模式/其余 27 臂零触）；触 cap 常量就地凑绿（§3-3）；登记面外扩（非该 proof 一件不登记）。**pins**：零产品语义变更·haStatus=NOT_HA·releaseEvidence=false·actualSpendCny=null。

## §6 est live=0

零模型外呼（两 proof 全静态/本地隔离 PG）·零生产操作·零 secrets。

## §8 STOP（开工三条款+停止条件）

**STOP · `executed:awaiting_post_prove_dual`**（EXEC 期翻面·前值 `draft:awaiting_pre_exec_dual` @`45459ba9` 史录保留零字洗）** · alone≠dual · Dual PASS ≠ 开工（开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 BOTH PASS 落卷；②协调方明示 EXEC 授权；③EXEC 不得改 §1-修法登记面与 §5 Ban（改则回炉）·照 §0 对届时 tip 重 pin。**停止条件**：①现场漂移（两锚 blob/行锚漂移·改前复跑≠1/28 或红名单≠一件）→停；②机制不满足（登记后 THE prove≠28/28）→停；③越界需要（需触 cap 常量/产品码/登记面外文件）→停；④验收红不可修（docs:check 超限=§2-4 预披露面·如实登记升级不就地修）→登记升级。

## §9 EXEC 记录（快速链一体席落卷·2026-10-16·授权链=派单 brief 快速链三责一体形制[沿 cap-sanction-2216/2208 一体席先例]·基线 `1b013667`=origin tip 等号成立亲证·两锚 blob 零漂零重 pin 需求）

**工序与 commit 链**：①draft 落卷=`45459ba9`（本卷 .md +79 行·STOP 三处 draft 同值）；②改前红亲证恰 1 次（件②①·`pnpm dbhy1:prove` EXIT=1 **1/28**·FAIL 恰 P3-1 一臂·`✗ 未登记引用: apps/worker/test/graph-run-observability.proof.ts`——与 CI 三连红 1/28 恒等·现场漂移熔断零触发）；③件① 登记行落点（`packages/db/test/dbhy1.proof.ts` blob `aea7486a`→`b444c4d0`·numstat **+2/−0**=归因注记 1+登记条目 1·恰预期）；④THE prove 恰 1 次（件②②·EXIT=0 **28/28**·`✓ DBHY-1 prove 28 断言全绿`·P3-1 翻 PASS·migrate applied=205 skipped=0·易失 log 值誊入本节）；⑤门矩阵五门行使（下表）；⑥本 §9 落卷+STOP 三处翻面=commit 2。

**门矩阵五门全表（实跑实测·2026-10-16）**：

| # | 门 | 命令 | 结果 | 证据 |
|---|---|---|---|---|
| 1 | dbhy1 红→绿 | `pnpm dbhy1:prove` | 改前 **EXIT=1 1/28**→THE prove **EXIT=0 28/28**（熔断 0 容差满足） | §0.2 誊录+`:26` `PASS P3-1`+`:59` 全绿行 |
| 2 | 当事人/邻面抽样 | `pnpm -C apps/worker prove:graph-run-observability` + `node scripts/check-migration-version-uniqueness.mjs` | 全 **EXIT=0**：当事人 `ALL PASS`（C5g 镜像断言 PASS 在案）+uniqueness `files=205 violations=0 exemptions=0143,0152,0160` | 两命令回执 |
| 3 | markers 五类 | 改动集两文件运行时组装词面 grep（同 `i6-239-gates.proof.mjs:151-:163` 形） | **hits=0** | 本节同验 |
| 4 | docs:check ≤届 cap | `node scripts/ai-docs/check-docs.mjs` | 裸树 **2232≤cap 2232 EXIT=0**→落卷后 **`PTP_FILE_LIMIT:2233` EXIT=1**——恰 §2-4/§0.3 预披露面：cap sanction 面（主线步进刀谱系 2200→2208→2216→2224→2232）非本刀码面·本刀零扩面修权·**如实登记升级协调方 sanction 后并线复测（预期 2233≤新 cap）** | 两态 EXIT+错误码原文 |
| 5 | diff 面机检 | `git diff --numstat 1b013667..HEAD` | **恰 2 tracked**=本 .ts（+2/−0）+本卷 .md（+79/−0） | 多路径即停未触发 |

**偏离任务书清单**：①cap 零余量系起草期发现（§0.3 前置披露·非 EXEC 期突现）·任务书「docs:check≤届 cap」门对「届 cap=2232」实测超限 1——按停止条件④登记升级·Ban 就地改 `MAX_FILES` 未行使；②零其余偏离——登记面恰一件、+2/−0 恰预期、两 run 各司其职零 retry、pins 零翻（haStatus=NOT_HA·releaseEvidence=false·actualSpendCny=null）。

**STOP → `executed:awaiting_post_prove_dual`**：post 双审两外席待派·cap sanction 步进刀与 LEDGER/checklist 行翻面权归协调方·alone≠dual·⛔push。

---

*DBHY1-REG-FIX REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（§9 EXEC 记录落卷·28/28 翻绿·门矩阵五门·docs:check cap 超限 1 如实登记升级归 cap sanction 刀·post 双审待派·行翻面/nail 归协调方·前值 draft @`45459ba9` 史录保留·⛔push · STOP）*
