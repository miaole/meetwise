# B2a 批收据 — DIR-1 B2 domain 目录拆解刀（第 1/19 批）

**Batch**: B2a（§5 表 B2a 行 · 立模式批）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-09）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md` @ `1f08942a`（rev3 · pre_exec_dual BOTH PASS · 协调方 EXEC 授权）
**Base tip**: `e2834082` · **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`
**Commit**: 本批一 commit（见交付报告 hash）· releaseEvidence=false · NOT_HA

---

## 1. 批内文件清单与 mv 证据（§5 B2a 行：audit/ 域 · audit.ts(10行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/audit.ts` → `packages/db/src/audit/audit.ts` | `R100` 纯 rename · numstat `0 0 packages/db/src/{ => audit}/audit.ts`（本体零字节改） |

**白名单三类随批改（B2a 实面）**：
- **① 包内 import**：0 处——audit.ts 本体仅 `import type … from 'pg'`（外部包），零相对 import；批内无消费件直引（M3 零改类：db-acl/db-acl2 等 proof 均桶引或锚直引）。
- **② 桶 re-export**：1 处——`packages/db/src/index.ts:301` `'./audit.ts'` → `'./audit/audit.ts'`（numstat `1 1`；行对引号外逐字节相同；tenant 2 行与导出名零改）。
- **③ runner receipt**：0 处——audit 无 runner 串（§1.1 runner=0 实测复核：`grep -n audit scripts/run-e2e-isolated.mjs` = 0 命中）；`node --check` 仍跑作额外观察 = PASS（③ 面本批未触）。
- **④ 机械串**：0 处（§5 B2a 行外部串=无；实测全仓 `src/audit.ts` 旧路径引用 = 0）。

**消费面复盘**：`apps/api/src/modules/admin/admin.controller.ts:36` 的 `@Get('audit')` 为 HTTP 路由装饰器非路径串（Ban 区 apps src · 零触 · 零涉）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：`pnpm install --frozen-lockfile` EXIT=0（lockfile 零改）· `pnpm db:up` EXIT=0（meetwise-postgres-dev healthy）。

| 门 | 键 | 批前基线 | 批后 | 对表 |
|----|----|---------|------|------|
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 同 |
| G1 | `e2e-platform:layout:prove` | EXIT=0（9 scenarios） | EXIT=0 | 同 |
| G1 | `e2e-static-guards:check` | EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6） | EXIT=0 | 同 |
| G1 | `e2e-static-guards:prove` | EXIT=0（30/30） | EXIT=0 | 同 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红**：`e2e_parity_inventory` invalid · errors 6 条（assertion_removed ×3 / assertion_untracked ×3 · 全在 `e2e/full.e2e.ts`）批前批后逐字节相同（红原值登记不洗 · e2e/ 树为 Ban 区零触） |
| G2 | tsc `packages/db` | EXIT=2 · 24 行错误集 sha256=f7c970b09cebcc3c7189e03ebbd8904271ea9f19b1495cdcd224d9c498deeb9b | EXIT=2 · 错误集逐字节 ≡ 基线 | 同形（base 预存类型错不洗） |
| G2 | tsc `apps/api` | EXIT=2 · 37 行 sha256=196049ecca4c56b71766ff9df7c439526abc8a3941e57a5ae2bd2761d91b4242 | EXIT=2 · ≡ 基线 | 同形 |
| G2 | tsc `apps/worker` | EXIT=2 · 44 行 sha256=6dae8b2dbca59169c64d9376e1999ef9fdbe0a6cb2ec1070851ddca1bfb32830 | EXIT=2 · ≡ 基线 | 同形 |
| G3 | `prove:isolated-target`（直跑键） | EXIT=0 | EXIT=0 | 绿保持绿 |
| G3 | `prove:db-acl`（直跑键·经 runner 合法隔离入口 `db-acl:prove:raw`，其命令映射即 `pnpm -C packages/db prove:db-acl`） | **EXIT=1（base 红）** | **EXIT=1** | **同形红**：FAIL 6 行 + PASS 10 行批前批后排序逐行相同 · 红类 `migration_ledger_not_contiguous_prefix`（applied=151 vs proof 钉 ≤0143=144 前缀 · §3-1 count=54 vs 55——migration 集演进所致 base 站红 · 非本批引入 · 红原值登记不洗） |
| G3 | receipt ENOENT 观察 | `LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-10-09T11-31-40-968Z-…json`（产出正常） | `…2026-10-09T11-33-56-210Z-…json`（产出正常） | **ENOENT=0 双向成立** |

**G0 面**：`git diff -M` R100 检出 ✓ · 行对引号外逐字节相同 ✓ · 残留 grep `packages/db/src/audit\.ts['"]` on runner = 0 命中 ✓ · 全仓 binary-aware 残留（`git grep -nE "src/audit\.ts|\./audit\.ts"` 全 tracked 树含 e2e/scripts）= 0 命中 ✓ · `git diff --quiet pnpm-lock.yaml` 干净 ✓ · `node --check scripts/run-e2e-isolated.mjs` PASS（额外观察）✓。

**attempts 全账（Ban retry-to-green · 无重试刷绿）**：
1. `prove:db-acl` 裸 env 直跑 → EXIT=1 `database_config_invalid:database_target_missing`（环境装配尝试 · attest 前抛出 · 零 schema 副作用）
2. `prove:db-acl` + dev PG env（PGHOST/PORT/USER/PASSWORD/DATABASE=dev compose 提交值）直跑 → EXIT=1 `destructive_proof_requires_e2e_isolated`（环境装配尝试 · attest 前抛出 · 零 schema 副作用——proof 的 server-nonce attestation 需 runner 一次性容器 GUC `meetwise.e2e_run_token`，裸直跑结构性无法满足 ⇒ 该直跑键的唯一合法完成形态 = 经 runner `db-acl:prove:raw`）
3. runner `db-acl:prove:raw` 批前 → EXIT=1（base 红 · 上表）
4. runner `db-acl:prove:raw` 批后 → EXIT=1（同形红 · 上表）

**红族登记补充**：`e2e-parity:check` 与 `db-acl:prove:raw` 两红均不在 §4 E5 预登记族枚举内，但 §4 E5 明示「以批前逐靶实测为准，红原值登记不洗」且 §6.1 G3 口径=「绿保持绿·红同形红」——本批按批前实测原值登记，批后逐键同形对表通过，未洗红未重试。

## 3. Base 漂移预检（先行必做 · 亲跑）

`git diff e2834082 origin/feat/mysql-schema-skeleton -- packages/db/src` 实测：**仅 `packages/db/src/recruiter.ts` +25/−2**（G7FIX-4 mark-then-recover 单触点 · numstat 亲证 · packages/db/src 面内无第二文件）。

- **交集裁定**：B2a 批内文件（audit.ts）与白名单面（index.ts:301 桶行 · audit 自身 import 面）与漂移**零交集** → 照常执行，本收据登记漂移面。
- **移交警示**：recruiter.ts 属 **B2c** 批范围——B2c 开席须重跑漂移预检并按「批内文件被漂移触碰→停手上报」红线处置（主线漂移未消化前 B2c 不得直接 mv recruiter.ts）。

## 4. 停止条件核查（§5 停止条件 a–e）

| 条件 | 核查 | 结果 |
|------|------|------|
| a) 落位与 §2 映射冲突 | §2 audit/ 单件域独占 · audit.ts → `audit/audit.ts` | 未命中 |
| b) 门红非预登记 base 红族 | 全部红（parity/db-acl/tsc×3）均为批前实测 base 红原值，批后同形 | 未命中（两新测红族已按 E5「批前实测为准」登记，见 §2 补充） |
| c) 需触批外文件 | 改动面 = 1 mv + 1 桶行，均批内 | 未命中 |
| d) 漂移预检红线 | 漂移仅 recruiter.ts（B2c 面），与本批零交集 | 未命中 |
| e) 环 ANY 串改逻辑 | 全部改动 = mv + specifier 字符串内路径前缀 | 未命中 |

## 5. Ban 纪律登记

- **Ban 7**：`.env` ABSENT（盘上与 tracked 双证）· MODEL_API_KEY/MODEL_BASE_URL 每次 prove/runner 调用均 `env -u` 剥离 · Key name-only 零打印零落盘 · est 0 live 模型调用。
- **Ban 2 锚区**：7 锚 + tenant/ 零触（index.ts 仅 :301 audit specifier 一行 · tenant 2 行与 `barrelTenantReexports===2` 断言零改）· migrations/** 零触 · e2e/ 树零触 · G7 面零触。
- **Ban 6**：零 shim/转发层。
- **Ban 10 S1 判留八处复述登记**（本批零新增判留）：
  1. `packages/db/src/int-transcript.ts:7`（src 注释 · 不入终批 grep 路径集）
  2. `packages/db/test/db-acl.proof.ts:267/:490`
  3. `packages/db/test/qbank-source.proof.ts:2`
  4. `packages/domain/src/qbank-route-scope-cache.ts:16`
  5. `packages/domain/src/qbank-track-local-retrieval.ts:13`
  6. `packages/qdrant-store/src/product-vectorstore-bridge.ts:5/:9`
  7. `packages/db/test/uc052-checkpoint-physical.proof.ts:7` 头注（B2o 批复述重申）
  8. `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:19` 头注
  （另 §1.2 S1 行所列 `apps/api/test/uc-e2e-011-{adv-refund-callback:15,refund-callback-adv:24}.proof.ts` 头注对随 §3 终批 grep 豁免集原样有效）
- **binary-aware erratum 逐批登记**（蓝本非阻塞披露）：`packages/db/src/qbank-generation-projection.ts` 与 `qbank-provider-input.ts` 含 NUL 字节——本批残留/消费面抽查全部走 `git grep`（binary-aware），未用裸 rg。
- **Pins 十一值照抄零翻转**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=**PG-retained** · 公开 DELETE=**503**（stays） · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本批纯移动零模型调用零计费面）。

## 6. 环境与收尾观察

- runner 一次性容器批前批后各 1 只均被 finally `docker rm -f` 正常回收；docker ps -a 残留仅 46h 前他场会话旧容器（`meetwise-e2e-62497-cold2-stop-band-1-…` Exited(0)，非本批产物，不予处置）。
- receipt 靶观察面（`db-acl:prove:raw` 的 sources 含 principal/isolated-test-target 锚串）批后复跑产出正常——runner receipt 机制经本批后完好。

**B2a 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 · 红同形红 · receipt ENOENT=0）· 1 commit 1 收据 · 蓝本 §5 B2a 行状态由本收据承载推进（蓝本原文零改写）。**
