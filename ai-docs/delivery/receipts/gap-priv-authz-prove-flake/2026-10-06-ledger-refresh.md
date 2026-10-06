# Ledger refresh — **GAP-PRIV-AUTHZ-PROVE-FLAKE · honesty ledger refresh**（Line AH · docs-only · **`executed:awaiting_post_dual`** · gap stays **OPEN** mitigated/cause-unknown）

**Status**: **`executed:awaiting_post_dual`**（Line AH · docs refresh only · F1–F6 · **零 prove · 零 CMD · 零 Docker/PG** · **Ban close** · **Ban claim fixed** · Ban claim root-caused · Ban forge PROCESS_EXIT · Ban retry-to-green · Ban self-nail）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Date**: 2026-10-06（CST / UTC+8）
**Gap id**: **`GAP-PRIV-AUTHZ-PROVE-FLAKE`**（backlog `gap-bug-backlog.md:68` · P2 · **OPEN** · mitigated/cause-unknown · **本刀不改该行**）
**REQUEST**: `b12e20d` / `b12e20d26ef852a9a4de136324f3c225ab7ef4ee`（harness `harness/gap-priv-authz-prove-flake-ledger-refresh.md` · slice `gap-priv-authz-prove-flake-ledger-refresh.slice.md`）
**PRE-EXEC dual BOTH PASS**: mw-privacy-int `880f144` / `880f14408dda9a9cb03737b811b6005d94c3a2dc`（REQUEST tip `b12e20d`）+ mw-e2e-ha `f215438` / `f2154387df654b4600b74b4c8a52c1d35f5986b2`（AD–AH dual half · AH file `REQUEST-2026-10-06-gap-priv-authz-flake-ledger-refresh-pre-mw-e2e-ha.md`）
**Prior nail**: Line X · NAIL `40bed97` / `40bed9708667239d5af71d3abe361567e03c1fd0` · evidence tip `b3e0f41` / `b3e0f4172e188f23dbcc34aac0bae82e571a10dc` · ledger `receipts/gap-priv-authz-prove-flake/2026-10-05-rootcause-ledger.md`（**只读 · 零改写**）
**Authority**: 协调方 AUTHORIZE · Line AH · PRE BOTH PASS · docs-only · Ban coding product · Ban `principal.ts` / `checkpoint-principal.ts` · Ban prove · Ban self-nail · Ban Meridian · Ban buy cloud · Ban secrets/`.env*` · Ban force-push · Ban 碰 Line AD/AE/AF/AG 文件

## 执行声明（先读）

- **本 refresh 未跑任何 prove**（零 `pnpm privacy-authorization:prove` · 零 Docker / Postgres 启动 · 零新 EXIT · **F5 ≠ 本刀授权 rerun**）。
- **零产品改动**：`apps/` · `packages/` · `package.json` · migration · scripts · `.env*` 未碰；`packages/db/src/principal.ts` / `apps/worker/src/checkpoint-principal.ts` 未碰。
- **零 SSOT 改动**：`e2e-requirement-coverage-matrix.md` / `gap-bug-backlog.md` / `execution-master-checklist.md` 未碰（backlog `:68` 原样 OPEN）。
- **零旧证据改动**：attempt-1/2 json/log/receipt · `uc052-pool-role-leak` jsonl/logs · Line X ledger `2026-10-05-rootcause-ledger.md` 均只读（F1 锚复核前后 `git hash-object` 一致）。
- 核验方法：worktree `@` `origin/feat/mysql-schema-skeleton` tip `9e2f001`（REQUEST `b12e20d` 为其祖先）上 `git hash-object` / `git log` / `git diff` / `rg` / `git merge-base --is-ancestor`。
- Privacy PRE N1–N4 已并入下文（N5/N6 为非阻塞披露，见 §Disclosures）。

---

## F1 · blob 锚复核（Line X 9 锚 · 当 tip）

| 文件（`ai-docs/delivery/receipts/…`） | expected blob（Line X） | `git hash-object` @ tip | 结果 |
|--------------------------------------|-------------------------|-------------------------|------|
| `uc052-pool-role-leak/privacy-authorization-flake-ledger.jsonl` | `272f0314e0eff8a9192c658a6a72584ae70146f4` | `272f0314e0eff8a9192c658a6a72584ae70146f4` | **OK** |
| `uc052-pool-role-leak/logs/cold-5.log` | `d066fcd8e8a6805e903b706196c3ead5d7cd9feb` | `d066fcd8e8a6805e903b706196c3ead5d7cd9feb` | **OK** |
| `uc052-pool-role-leak/logs/warm-2.log` | `4ce66da1ac4dbaea808580fcaa94784ef689a095` | `4ce66da1ac4dbaea808580fcaa94784ef689a095` | **OK** |
| `uc052-pool-role-leak/logs/historical-first-failure-ECONNREFUSED-69de818.log` | `db8ade3ba4fecc01a7cb7d019b8424174628d631` | `db8ade3ba4fecc01a7cb7d019b8424174628d631` | **OK** |
| `gap-priv-authz-prove-flake/oneshot-attempt-1.json` | `8cc9db56079a60fc6410472632dbf4899952c9c2` | `8cc9db56079a60fc6410472632dbf4899952c9c2` | **OK** |
| `gap-priv-authz-prove-flake/oneshot-attempt-1.log` | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` | **OK** |
| `gap-priv-authz-prove-flake/teed-oneshot-attempt-2.json` | `3919bf579addf264b2eff3625fef7397bf1d7123` | `3919bf579addf264b2eff3625fef7397bf1d7123` | **OK** |
| `gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log` | `9b1341444425c4172d8a9cd02e5d8415a94a4084` | `9b1341444425c4172d8a9cd02e5d8415a94a4084` | **OK** |
| `gap-priv-authz-prove-flake/2026-10-03-teed-oneshot-attempt-2-receipt.md` | `81795533b028c5c71aca49fd8bdb1299937c73f0` | `81795533b028c5c71aca49fd8bdb1299937c73f0` | **OK** |

**F1 结果：9/9 一致 · 零漂移。** 锚复核 ≠ 新证据 · ≠ close · ≠ fixed。

---

## F2 · Line X 后增量登记（`b3e0f41..HEAD` · 共享包装 / `packages/db/src` · 须读 diff）

`git log --oneline b3e0f41..HEAD -- scripts/run-e2e-isolated.mjs packages/db/src` → **恰 5** 提交（无遗漏无多余）：

| Commit | Subject | Diff 摘要（已读） | 是否触及 `privacy-authorization:prove` 执行路径 | 分类 |
|--------|---------|-------------------|--------------------------------------------------|------|
| `3d113c8` / `3d113c872455375d81d84de48b7d806eb42b2dd4` | Line V · NHP-011-ADV-01 | `package.json` +`uc011:adv:prove{,:raw}`；`run-e2e-isolated.mjs` + receiptSources / allowlist / `isolatedCommand` 映射至 `apps/api prove:uc011-adv-refund-callback` | **否** · `package.json:288-289` 隐私脚本未改 · `isolatedCommand` `privacy-authorization:prove:raw` → `pnpm -C packages/db prove:privacy-authorization` 未改 · 隐私 receiptSources 未改 | 新 prove target 注册 only · **≠ fix** |
| `bf1fdb2` / `bf1fdb22674d10fc5ab7fb827a7da11def97fd1f` | Line Z · UC011 refund webhook | +`uc011:refund-callback:prove{,:raw}`；+`packages/db/src/payment.ts` `markOrderRefunded`（+72）· `index.ts` 导出 `RefundResult`；wrapper 新 target | **否** · 隐私脚本/映射/receiptSources 未改；`payment.ts` **不在** `privacy-authorization:prove:raw` receiptSources（该列表钉 `privacy-authorization.ts` / `principal.ts` / `isolated-test-target.ts`） | 新模块 + 新 target · **≠ fix** · **Ban「无关=已证无影响」空话** — 结论来自读 diff，非口号 |
| `6e96cf5` / `6e96cf50a8be410a0d2154761afef88cd2368c7a` | Line AB · NHP-001-BOUND-01 | +`uc001:nhp-bound:prove{,:raw}`；wrapper 新 target；**共享** `migrateWithRecovery` allowlist 行（该行本已含 `privacy-authorization:prove:raw`）末尾 **append** `uc001:nhp-bound:prove:raw` | **命令映射未改** · 隐私仍走同一 `isolatedCommand` 与同一 raw → `packages/db prove:privacy-authorization`；allowlist 上隐私条目本已存在，本次仅并列追加他 target | 共享门闸行字面被编辑（append-only）· 隐私 prove **行为路径不变** · **Ban「增量=修复」** · **≠ flake fix** |
| `40a4f6c` / `40a4f6c2acba905165d269d7318c2351e1be5ecb` | Line V-main · refund-callback ADV | +`uc011:refund-callback-adv:prove{,:raw}`；wrapper 新 target | **否** · 隐私脚本/映射未改 | 新 target only · **≠ fix** |
| `48c4a8a` / `48c4a8aad34396bb8d8a9c348d1fbf94fb6c514d` | Line W · UC-025 FAULT isolated | +`uc025:nhp-fault-isolated:prove{,:raw}`；wrapper 新 target | **否** · 隐私脚本/映射未改 | 新 target only · **≠ fix** |

交叉核：`git diff b3e0f41 HEAD -- packages/db/package.json` 无 privacy 变更；`package.json` `privacy-authorization:prove` / `:raw` 字面自 `b3e0f41`→HEAD 仅因他处插入行号下移（277–278→288–289），命令串不变；`isolatedCommand` 隐私分支与 receiptSources 块 `git show` 逐字一致。

**F2 结论**：5 提交均为他刀新 prove 注册 / 商务退款模块；**无一**改写 `privacy-authorization:prove` 命令映射或隐私 proof 源文件。**Ban「增量 = 修复」** · **Ban 未读 diff 即写「无关=无影响」**。

---

## F3 · 新 attempt 计数（Line X 后）

`git log --oneline b3e0f41..HEAD -- ai-docs/delivery/receipts/gap-priv-authz-prove-flake ai-docs/delivery/receipts/uc052-pool-role-leak` → 仅 `40bed97`（Line X nail · ledger 生命周期注记）。

- 无新 json / log / jsonl 行
- **新 `privacy-authorization:prove` attempt = 0**（诚实）

**Ban「0 新失败 = 已修复」** · 0 新 attempt ≠ close ≠ fixed。

---

## F4 · ECONNREFUSED 族分界（防互借 · 不同 gap / 不同发生点）

| 族 | Gap / 刀 | 发生点 | 字面 / 证据 | 与本 gap 关系 |
|----|----------|--------|-------------|---------------|
| **(a) 本 gap cold** | **GAP-PRIV-AUTHZ-PROVE-FLAKE** | **宿主侧** prove 前/中连接隔离 PG **发布端口**拒绝 | `cold-5.log` L18 `ECONNREFUSED 127.0.0.1:33047`（`state_bytes=29`）· historical `…69de818.log` L16 `ECONNREFUSED 127.0.0.1:33010` | **本账冷失败 class**（×2 已记录 EXIT=1） |
| **(b) C-PERF-TEARDOWN** | C-PERF-TEARDOWN / Line AE 相关 | **API 容器内** `--network=host`（Docker Desktop VM 网络栈）连宿主 loopback 发布端口 @ `assertIsolatedTestTarget` | 收据 `44154aa` / `44154aa53a8c8508e8e8b1c51333c648187ac360` · `receipts/2026-10-05-c-perf-teardown-branch-a-blocked-ledger.md`：`ECONNREFUSED 127.0.0.1:64244`（及同点后续端口） | **不同 gap · 不同发生点** · **Ban 互借关闭/根因** · **Ban 碰 AE 文件**（本刀只读引用 SHA） |
| **(c) Line U docker.sock** | G7 trio / Line U · 后由 Line AC Path A 处理 | docker.sock **permission denied**（**非** ECONNREFUSED） | `receipts/g7-trio-fresh/SUMMARY.md` · Line AC：`receipts/g7-env-gap-honest-fix/SUMMARY.md` | **不同失败 class** |

**F4(c) AC 限定语（N2 · 必抄）**：env-gap cleared **only for this host/session class**（cite `receipts/g7-env-gap-honest-fix/SUMMARY.md:50` 原文「**env-gap cleared** for this host/session class under Ban live」；同文件 `:80` PATH A via `scripts/with-docker-session.sh`）。**勿泛化**为「所有主机/会话已清除」。

三者 **不同发生点 / 不同 gap** · **Ban「同根」** · **Ban 互借关闭** · **Ban 互借根因** · **Ban 与 AE 交叉借证**。

---

## F5 · 未来 teed first-run 前置（更新 · **本刀不授权 rerun**）

若未来**另开**独立 rerun REQUEST（须独立 PRE dual · **本 refresh ≠ 授权**），前置须同时满足：

1. `scripts/with-docker-session.sh`（Line AC 先例 · Ban sudo/chmod/usermod）
2. 预声明 attempt 数 · cold / warm **分别**（warm 须**真复用库**路径以重新覆盖 23505 类；warm_v2 新容器 ≠ 复用库）
3. teed `PROCESS_EXIT` 行入账 · 三角一致可核
4. **N4 关闭门槛语言（必写进未来 REQUEST gate）**：
   - **fresh first run**（禁止 retry/sleep 洗绿）
   - **all attempts booked incl red**（红账全入）
   - **red stays red**（禁抹红）
   - **`PROCESS_EXIT=0` never closes gap**（任何单次绿 ≠ close）
   - **local-only · Ban cloud**（Ban buy cloud）
   - **close bar still unmet**：deliberate red + cause-fix + **N≥5 consecutive first-runs no retry**（cite `REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-privacy-int.md:109` C3 / `:83` §3C）—— **本刀不授权 rerun · 关闭门槛仍未满足**

**Ban 声称本 refresh 已授权再跑。** F5 = 未来门闸文字更新 only。

---

## Attempt EXIT 账（SUMMARY · 含 N1 绿行 · 红账完整保留）

来源：jsonl blob `272f0314…`（29 行）+ `gap-priv-authz-prove-flake/` receipts + Line X ledger · **零新跑**。

| 批次 | tip | n | EXIT=0 | EXIT=1 | class / 备注 |
|------|-----|---|--------|--------|--------------|
| 历史 first-run | `69de818` | 2 | 1 | **1** | cold `ECONNREFUSED 127.0.0.1:33010` |
| cold v1 | `71ec253` | 5 | 4 | **1** | cold `ECONNREFUSED 127.0.0.1:33047`（`state_bytes=29`） |
| warm v1 | `71ec253` | 2 | 1 | **1** | warm SQLSTATE **23505** `interview_pkey` |
| cold_v2 | `3d0c71e` | 10 | 10 | 0 | mitigation only |
| warm_v2 | `3d0c71e` | 10 | 10 | 0 | mitigation only · 新容器（非复用库 · review `49ef158` §5）→ 23505 类 **未被重新覆盖** |
| **prove_tip_authz（N1 · 绿）** | **`9b39a20`** / `9b39a20d6b53d10ac95be880037a3e716126f715` | **1** | **1** | **0** | jsonl L29 · note「Ban claim flake fixed」· **绿行 · 非红** · **≠ close** |
| oneshot attempt-1 | `5b6e693` | 1 | JSON 0 / log 无退出码 | — | **不同意**（Line X L1 保留） |
| teed attempt-2 | `6673042`（可达等价 **`606677d`** / `606677d37a27515894f02adff2ab33a67004abf4`） | 1 | 1（`PROCESS_EXIT=0`） | 0 | 三角一致（≠ close） |

合计已记录 EXIT=1 **3** 次 · **2 类 class 并存未归一** · cause unknown · backlog `:68` **OPEN**。

任何后续绿（v2 20/20 · `9b39a20` · attempt-2 `PROCESS_EXIT=0`）均**不**关行 · **Ban retry-to-green** · **Ban forge PROCESS_EXIT**。

---

## Pins（硬钉 · 未翻）

| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| UC-052 | **partial**（stays） |
| canHonestlyFlip | **false** |
| backlog `:68` GAP-PRIV-AUTHZ-PROVE-FLAKE | **OPEN** · mitigated/cause-unknown |

---

## Non-claims

Not fixed · not closed · not root-caused · not a prove · not a rerun · **not rerun authorization** · not product change · not closing backlog `:68` · not HA · not covered · alone ≠ dual · **GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN mitigated/cause-unknown** · F1 锚复核 ≠ 新证据 · F3 零新 attempt ≠ fixed · N1 绿行 ≠ close

---

## Disclosures（非阻塞）

- **N5 · `6673042` 不可达**：侧枝未上 remote；沿用 Line X 可达性披露 · 以可达等价 `606677d` + 树内 attempt-2 blobs 为准。
- **N6 · REQUEST 父 ≠ harness base**：REQUEST 父 `5eba515`；harness 钉 base `416b6a5`；中间 AD–AG 兄弟 docs REQUEST · `416b6a5..5eba515` 全 `ai-docs/` · 与本刀零文件交叉（Ban 碰 AD/AE/AF/AG）。
- **执行 tip 祖先链**：AUTHORIZE PRE BOTH · privacy `880f144` + e2e `f215438` · REQUEST `b12e20d` · 均为本执行 tip 祖先（push 后以 docs tip 为准）。

---

## CITE_EXIT

本刀 **无 CMD · 无 prove · 无新 EXIT**。引用既有：EXIT=1 ×3（cold ECONNREFUSED ×2 · warm 23505 ×1）保留；绿行 `9b39a20` n=1 EXIT=0 入表（N1）；attempt-2 `PROCESS_EXIT=0` ≠ close。

## STOP

实现方（mw-core）产物 = docs refresh + post dual stubs（draft awaiting expert）。**Ban self-approve** · **Ban self-nail** · **Ban 代签** · **Ban 关 gap** · **Ban 翻 `:68`**。awaiting post dual mw-privacy-int + mw-e2e-ha。

*Ledger refresh · GAP-PRIV-AUTHZ-PROVE-FLAKE · Line AH · 2026-10-06 · executed:awaiting_post_dual · F1 9/9 · F3 attempt=0 · N1 9b39a20 green · OPEN mitigated/cause-unknown · Ban close · Ban claim fixed · zero prove · coveredCount=8 · DELETE=503 · STOP*
