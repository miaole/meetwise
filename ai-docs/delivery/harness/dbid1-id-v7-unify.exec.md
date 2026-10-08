# EXEC — **DBID-1 · 数据库 ID 统一优化刀（UUIDv7 渐进收敛）**（EXEC 落地 + post-dual 席2 修复 · `post_dual_r2_fix:awaiting_seat2_rereview`）

**Status**: **`post_dual_r2_fix:awaiting_seat2_rereview`**（原 `executed:awaiting_post_prove_dual` · post-dual 席2 FAIL 成立（消费方版本锁拒收 v7 真雷）已按协调方修复指令落地（§7）· run-5 全套 36/36 EXIT=0 · **Ban self-write `post_prove_dual_pass`** · 席2 复核 + meetwise nail 专属 · alone ≠ dual）
**Date**: 2026-10-08（Asia/Shanghai）
**Knife**: `harness/dbid1-id-v7-unify.md`（REQUEST）· slice `dbid1-id-v7-unify.slice.md`
**REQUEST**: `13a0f9f6`（parent = origin tip `7135f615`——rebase 要求 **≥7135f615 已满足**：branch `line/db-id-v7-unify` HEAD 恰为 `7135f615 + 13a0f9f6`，fetch 后 origin/feat/mysql-schema-skeleton tip = `7135f615`，无需位移；`7135f615` 含对表勾销块绑定（硬规则 11 · commit `48ec9fc3`/`3afa08d5`/`7135f615` 链））≡ origin 镜像 **`23d8991c`**（协调卷 REQUEST · base `0fe96fca` · patch-id **`2013fe209f0961d56128062b9ddd540558b02647`** 两副本实测全等 · push 前 `git rebase origin/line/db-id-v7-unify` 机检 skip `13a0f9f6` previously applied · EXEC tree 零字节漂移亲证 `git diff efe16da6 HEAD` = 空）
**Pins（全保留 · 零翻转）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null

---

## §1 落地面（与 harness §9 预告面一致 · 零越界）

| 文件 | 动作 | 内容 |
|------|------|------|
| `packages/db/migrations/0143_db_id_v7_unify.sql` | 新增 | `uuidv7()`（VOLATILE·RFC 9562 §5.2）+ `uuidv7_from_parts()`（IMMUTABLE·KAT 专用）+ 55×`ALTER … SET DEFAULT`（N1：`ai_graph_run` 列名=`run_id` 单列特判） |
| `packages/db/src/ids.ts` | 新增 | `newEntityId`（前缀白名单 `ENTITY_PREFIXES` fail-closed）+ `newUuidV7()`（连字符）+ `idUnixMs` 解码 helper（D6·非 v7→null）+ 同 ms 12bit 计数器严格单调 |
| `packages/db/src/index.ts` | 修改 | 导出 ids.ts 面（+4 行） |
| B1 15 点 | 修改 | recruiter.ts×4 · job-route-decision.ts×2 · candidate-route.ts×1 · qbank-route-scope-cache.ts×1 · qbank-miss.ts×1 · free-text-route-decision.ts×2 · commerce.service.ts×1 · quiz.service.ts×1 · interview.service.ts×1 · diagnosis.service.ts×1（`prefix+randomUUID()` → `newEntityId(prefix)`） |
| B2 3 点 | 修改 | int-transcript.ts:134/:154/:165（裸 `randomUUID()` → `newUuidV7()` · 格式不变仅熵源换时间有序） |
| `packages/db/test/db-id-v7.proof.ts` | 新增 | P1–P7（P7=对表勾销块） |
| `package.json` + `packages/db/package.json` | 修改 | `db-id-v7:prove` / `prove:db-id-v7` scripts |
| `scripts/run-e2e-isolated.mjs` | 修改 | target 注册×4 处（allowlist/receipt sources/isolatedCommand/**migrate allowlist**——后者为 attempt#1 红因，见 §3） |
| `ai-docs/architecture/backend/id-convention.md` | 新增 | C 级规范 + 前缀注册表（11 域）+ 冻结格式登记 + N1–N3 勘误 + 消费面契约（§7-PD2 补） |
| **PD2 席2 修复面** | 修改×3+新增×1 | 版本锁正则字符类放宽（§7-PD2 三处）+ `packages/db/scripts/dbid1-api-guard-smoke.ts`（P8 子进程执行体） |

**排除面（harness §3.4 · 登记不动）**：`qgen-` 格式冻结点（worker qbank-generation.ts:359 亲核保留）· 裸 uuid→text 6 点（N2 勘误后口径）· 非 id token 面（reqId/leaseOwner/callId/jti 等全保留）· `ntf_` 派生登记。

## §2 勘误登记（N1–N3 · 亲核证据入 `id-convention.md` §4）

- **N1** `ai_graph_run` 主键列名=`run_id`（0001:27）——55 表唯一特判；migration + prove P4-2 双落。
- **N2** 裸 uuid→text PK 残留实为 **6 点**（harness §3.4 原文「5 点」漏展 interview.service.ts 798/824/906 三行）——ids.ts 头注 + id-convention.md §3.3 双落。
- **N3** 无 DEFAULT uuid 5 张主键列名**均非 `id`**：target 族=`target_id`（0048:46/0092:122/0096:236）· resume 族=`resume_id`（0001:186/195）——prove P4-5 按真实列名断言（attempt#2 红后亲核修正）。附 P5 DEFAULT 冒烟表 `entitlement_consumption`→`entitlement_bucket` 适配说明（见 id-convention.md §4 N3 行）。

## §3 Prove attempts 全账（Ban retry-to-green · 每次运行无论红绿全记录）

| # | at(UTC) | pid | EXIT | 红/绿 | 结果与因 |
|---|---------|-----|------|-------|---------|
| 0（前 turn 在飞） | 2026-10-08T08:01:01Z | 69989 | 1 | 红 | `function uuidv7() does not exist`——`db-id-v7:prove:raw` 未入 run-e2e-isolated **migrate allowlist**（隔离库零迁移即跑 prove）；收据 `.tmp/isolated-proof-receipts/2026-10-08T08-01-09-593Z-69989-*.json` |
| 1 | 2026-10-08T08:13:34Z | 73822 | 1 | 红 | 同因复现（本 turn 修 wiring 前首跑确认根因）→ 修：migrate allowlist 补 target（run-e2e-isolated.mjs:2365 面向数组） |
| 2 | 2026-10-08T08:14:38Z | 74809 | 1 | 红 | 迁移 143 全应用 · **31 断言 28 PASS / 3 FAIL**：P4-5（N3 列名——proof 误用 `id`）· P6-1（ALTER 行对齐空格 vs 单空格正则）· P7-1（kebab 正则不容 `.proof.ts` 双段扩展名）→ 修三断言（P4-5 用真实列名 / `\s+` / `(\.[a-z0-9]+)+`） |
| 3 | 2026-10-08T08:15:54Z | 75685 | **0** | **绿** | **30/30 全 PASS · EXIT=0**（当时收据/commit 误报「31/31」——计数勘误见 §7-E1）；`migrations: applied=143 skipped=0`；收据 `.tmp/isolated-proof-receipts/2026-10-08T08-15-55-848Z-75356-7033a2b5-d0ff-4de9-b26e-9a598d4c36bb.json`（release_evidence=false） |
| 4 | 2026-10-08T08:43:09Z | 95719 | 1 | 红 | post-dual 席2 修复后续跑：P1–P7 30 PASS 全过；**P8 崩**（非断言红）——P8 直 import apps/api 源，tsx 从 packages/db cwd 转译遇参数装饰器（`experimentalDecorators` 未开，interview.service.ts:93-95）→ 改子进程方案（scripts/dbid1-api-guard-smoke.ts + cwd=apps-api 转译发现 nest.json）；期间子进程 bring-up 两跑（路径差一层 / `--tsconfig` 旗标无效）为仪器接线非套跑，如实注记 |
| 5 | 2026-10-08T08:47:01Z | 96815 | **0** | **绿** | **36/36 全 PASS（P1–P7 30 + P8 6）· EXIT=0**；子冒烟 S1/S2/S3 绿且 `SMOKE|` 行回显入卷；收据 `.tmp/isolated-proof-receipts/`（08:47 批次 · release_evidence=false） |

**EXEC 期代码修正（红→绿的因修，全部留痕）**：①migration `rand_b & (2^62-1)` 位掩码 bug → `2^60-1`（原式 rand_b≥2^60 时 to_hex 16 位 → 33hex → `::uuid` cast 崩；KAT 与 25% 随机调用必炸，attempt#1 前静态亲算发现）②proof P2 BigInt 入参 >2^53 → `String()` 入参（pg 不序列化 BigInt）③P6 切分器重写为 dollar-quote 感知（原 `split(';')` 会拆碎 plpgsql 函数体）④P4-5/P6-1/P7-1 三断言修正（attempt#2 红）⑤migrate allowlist 补 target（attempt#0/#1 红）。

## §4 对表勾销块（硬规则 11 · 判据=postgres skill 7 项 + NEXT-NODE · prove P7 程序输出 + 本表登记）

| 判据 | 勾销 | 证据 |
|------|------|------|
| postgres-1 新表代理键=uuid DEFAULT uuidv7()/业务可读键=text prefix+v7 尾/事件表=bigserial | ✅ 本刀落地 | P1/P4/P5 PASS + id-convention.md §1 规范冻结 |
| postgres-2 域前缀注册表制·新前缀须登记 | ✅ 本刀落地 | `ENTITY_PREFIXES` 白名单 fail-closed（P3-2 PASS）+ 注册表 11 域双落 |
| postgres-3 高频列索引 | ≠silently 通过 | 本刀零新增索引面（DEFAULT-only）；存量违规已登记台账（GAP-DEBT-DB 族），不在刀面 |
| postgres-4 status CHECK/金额单位 | ≠silently 通过 | 不在刀面；台账 GAP-DEBT-DB-MONEY3 既有登记 |
| postgres-5 jsonb 万能口袋/timestamptz | ≠silently 通过 | 不在刀面；台账 GAP-DEBT-DB-HYGIENE 既有登记 |
| postgres-6 触发器同族禁复制 | ✅ 零触碰 | P6-2 PASS（全语句含函数体零 TRIGGER 字样；0020/0046 配对面未动） |
| postgres-7 迁移 append-only·存量行 ID 永不回填 | ✅ 结构性保证 | P6-1 PASS（语句白名单：1×CREATE uuidv7 + 1×CREATE from_parts + 2×COMMENT + 55×ALTER SET DEFAULT · other=0）+ P5-3 计数恰 +1 |
| NEXT-NODE C4 文件 kebab-case | ✅ 本刀合规 | P7-1 PASS（ids.ts / db-id-v7.proof.ts / id-convention.md；migration 从仓库 snake_case 惯例 0143_db_id_v7_unify.sql） |
| NEXT-NODE C1/C2 lint/tsc-CI 门 | ≠silently 通过 | 台账既有 ❌ 行（#13/BUG-E2E-FAILUNIMPORT），不在本刀面；本刀 touched 文件 tsc --noEmit 零新错（既有错均在未触碰文件） |

## §5 硬 Ban 自证（全生效）

1. 存量行零回填：0143 无 UPDATE/DELETE/DROP/TYPE 变更（P6-1/P6-2 静态门 + 语句白名单结构性保证）。
2. 列类型/FK/RLS/权限零触碰：仅 SET DEFAULT + CREATE FUNCTION（P4-3/P4-4/P4-5 保留面原样断言）。
3. `idempotency_key` 语义零触碰：全库 grep 零 diff（B1/B2 替换点均在 id 生成处，幂等键 UNIQUE/ON CONFLICT 未动）。
4. 已闭触发器（0020/0046 等）零触碰：migration 文本零 TRIGGER 语句。
5. 共享 SSOT（north-star/hard-gates/e2e 矩阵）零触碰：本刀 diff 无上述文件。
6. secrets/真实数据零入树：prove 密钥为隔离库惰性注入占位（≥16 字符门），收据 dataHandling=no_..._persisted。
7. P6 白名单静态门：允许 `CREATE OR REPLACE FUNCTION`（+COMMENT 元数据）· 禁 DROP/GRANT/TRIGGER/UPDATE/DELETE/INSERT/索引/约束——绿。

## §7 post-dual 席2 修复登记（协调方打回 · 真雷 · 2026-10-08）

**PD2 根因**：0143 切 v7 后，消费方**版本锁 UUID 正则**拒收 v7（版本组 `[1-5]` 不含 7；v7 现纪元首字符恒 `0`，首组锁同雷——全库扫描实证仅版本组锁存在）。主断点：`interview.begin()` 守卫拒 v7 `resumeId` → 主 e2e 断。

**修复面（rg 全库扫 `[1-5][0-9a-f` 版本锁 · 实测 3 处 = 协调方点名 2 处 + 漏网 1 处）**：

| # | file:line | 消费面 | 修 |
|---|-----------|--------|-----|
| 1 | `apps/api/src/modules/interview/interview.service.ts:29` | `UUID_RE`（:196 begin 拒收 resumeId → 主 e2e 断） | 版本组 `[1-5]`→`[0-9a-f]`（字符类单点改） |
| 2 | `apps/web/lib/stream/scoring-honesty.ts:9` | `WEB_UUID_RE`（answerId 闸 → practice hint 不展示） | 同上 |
| 3 | `packages/domain/src/scoring-honesty.ts:17` | `UUID_RE`（:89 `trustedScoreIdentity` fail 门 · 点名 2 处的 domain 孪生漏网） | 同上 |

**纪律自证**：只改正则字符类，变位锁 `[89ab]`（RFC 10x · v7 变位 8-b 不受影响）与一切守卫/闸逻辑零改动；负门 fail-closed 由 P8-2/P8-5 断言保持。

**P8 冒烟（prove 新块 · 6 断言）**：API 面 = 真实 `InterviewService.prototype.begin` 方法（仅 IO 边界桩 preview 门/asPrincipal；子进程 `packages/db/scripts/dbid1-api-guard-smoke.ts` 执行——apps/api 源参数装饰器需 nest.json 转译配置，且不可拖入 packages/db 主 tsc 程序）：P8-1 v7 resumeId 穿守卫抵达 db 面 · P8-2 负门 `invalid_resume_id` 保持 · P8-3 v4 回归（并存终态）。孪生面 = 真实导出纯函数进程内直执：P8-4/P8-5 domain `trustedScoreIdentity` · P8-6 web `practiceHintScore`（不展示≠0）。run-5 全套 **36/36 EXIT=0**（§3 续账 run-4/run-5）。

**E1 计数勘误（如实登记）**：EXEC 收据 §3 run-3 行与 EXEC commit message 原报「31/31 全 PASS」——**实际 30/30**（P1×6+P2×3+P3×8+P4×5+P5×5+P6×2+P7×1=30，run-3 输出 `grep -c ^PASS`=30 可复算）。差 1 为人工计数虚报（prove 程序输出与 `RESULT failures=0` 本身无误）；已推 commit 文本不可改写，本勘误为其更正登记。修后新口径 = **36/36**（30+P8×6）。

**规范固化**：`id-convention.md` §2 增补「消费面契约」——uuid 形态 id 的消费方正则**禁版本锁**（v4/v7 并存终态版本组一律 `[0-9a-f]`），防复发。

## §6 Non-claims（不变）

≠HA · ≠suite green · ≠SLO/性能量化声明 · ≠存量 ID 迁移 · ≠列类型/FK/RLS 变更 · ≠MySQL/Qdrant 重开 · ≠覆盖任何 e2e 门（coveredCount=8 不变）· releaseEvidence=false · actualSpendCny=null · local green ≠ stack truth。

---

*EXEC receipt · DBID-1 · 2026-10-08 · executed:awaiting_post_prove_dual · Ban self-approve · Ban push · pins 全保留*
