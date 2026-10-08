# Harness / REQUEST — DIR-1 · E4 微刀：run-e2e-isolated.mjs receipt 层路径文本修正案

**Status**: `executed:awaiting_post_prove_dual` · **EXEC 完成**（协调方授权 · 双审 BOTH PASS 前置齐）· 收据见 §7 · **STOP**
**Date**: 2026-10-07 · **Base tip**: `409843b3`（B1 批已 push · f208a78d..409843b3）
**Worktree**: `meetwise-line-dirstruct` · branch `line/dir-structure`
**releaseEvidence=false** · **NOT_HA** · 本微刀零逻辑 · 批绿 ≠ 重构完成 ≠ E2E ≠ HA

---

## 0. 裁定回执（协调方 2026-10-07 · 本刀存在性依据）

- **E4 裁定**：授权微刀「run-e2e-isolated.mjs receipt 层路径文本修正案」——B 类路径白名单**扩至该文件 receipt 路径串**·**仅文本替换·零逻辑**·**B2 前置**。
- **E5 裁定**：prove/tsc 期望值口径改为「**与各自 base 零回归基准**」；harness `EXIT=0` 期望**作废**，以实值修正。
- B1 批 REQUEST（`dir-restructure-b1.md` §6 E4/E5 行）不改写；裁定以本文件登记为准。

## 1. 刀的边界（一句话）

把 `scripts/run-e2e-isolated.mjs` 内 `isolatedReceiptSources`（**行 93–1534**）中 **245 处** `packages/db/src/<平铺>.ts` 路径串按 B1 §4.1 落位映射改为 `packages/db/src/<域>/<名>.ts`——**仅此一个文件·仅此一种文本替换·零逻辑改动**。

## 2. 范围实值（本 REQUEST 落盘前实测）

| 项 | 实值 |
|----|------|
| 文件 | `scripts/run-e2e-isolated.mjs`（唯一） |
| 改动块 | `isolatedReceiptSources` 对象（:93–:1534） |
| 替换量 | **245 处**路径串 · 波及 **104 个** target（按命令面分：db 50 · apps/api 15 · apps/worker 25 · 其他 14[ai-runtime 7 + node 子脚本 1 + 多行 ternary 命令 6]） |
| 涉及文件 | **59 个** B1 已移文件（映射 = harness §4.1 原表，逐串机械前缀插入） |
| 块外溢出 | **0**（全文 `packages/db/src/<moved>.ts` 块外出现 = 0，已证） |
| 不动串 | 锚 6 类引用原样：`index` · `isolated-test-target` · `migrate` · `migrate-cli` · `principal` · `tenant/index`；`migrations/*` 与 `test/*` 串不动 |
| 相邻文件核验 | `scripts/local-e2e-receipt.mjs` 默认 `SOURCE_PATHS` = e2e helpers（**零 db 路径** ✓）；`writeLocalE2EReceipt` 面不经本刀 |

**替换规则**（钉死，防自由发挥）：对 59 名单内每个 `<name>`，`'packages/db/src/<name>.ts'` → `'packages/db/src/<folder>/<name>.ts'`（folder=§4.1 映射）；不接受任何其他形式的"顺手改"（排序/去重/重排数组/改注释 = 违例作废）。

## 3. 验收门（E5 口径：与 base 零回归 + E4 解阻实证）

| 门 | 命令 | 期望（零回归基准 = `409843b3`） |
|----|------|------|
| G0 语法/面 | `node --check scripts/run-e2e-isolated.mjs` | EXIT=0 · `git diff` 恰 1 文件 · 变更行对全为纯路径文本（B1 同法逐行对验，引号外逐字节相同） |
| G1 契约门（本文件属 e2e 契约面，必全绿或 base 同红） | `pnpm e2e-platform:check` · `e2e-platform:layout:prove` · `e2e-static-guards:check` · `e2e-static-guards:prove` · `e2e-parity:check` | 五门 **EXIT=0**（B1 态实测五门已 0）；`e2e-platform:prove` 预存红 `secret-redaction e2e/full.e2e.ts:59/:154` **base≡B1 同红**（E5 类，非本刀面，不洗） |
| G2 E4 解阻（核心门） | `node scripts/run-e2e-isolated.mjs <target>` | **必跑**：db 50 target 全量（B1 已实证 proof 本体绿者此处应 EXIT=0；**base 同红 2 例外**：`runtime-role:prove:raw`[`interview_privacy_fenced`] · `qbank-source:prove:raw`[`app_role` 缺] 维持红=零回归）；**抽样 ≥3/包**：api · worker · ai-runtime 各 ≥3（其中 base 红者记 base≡red）；其余 target 由 post 双审定全量/抽样 |
| G3 复验已绿不倒退 | `vectorstore:prove:raw` · `rag-control-dispatch:prove:raw` · `qbank-control-role:prove:raw` | 仍 EXIT=0 |
| G4 收尾 | `git diff --quiet pnpm-lock.yaml` · `git status` | lockfile 零改 · status 干净（commit 后） |

**记录格式**：逐 target `CMD + EXIT` 实录入收据；`LOCAL_ISOLATED_PROOF_RECEIPT` 正常产出（ENOENT 消失）为 G2 通过的必要观察。

## 4. E4b 登记（本裁定**未**覆盖 · 零处置零扩散）

`scripts/conn-stack/mysql-stack.*`（S4 契约体）**7 文件 10 处**机械读 B1 已移 db 路径（`readFileSync(join(root,'packages/db/src/<moved>.ts'))`：m3-queue·m4-rag·m5-fixtures·qdrant-backed·r5-mark-red·redis-wakeup·r4-domain-isolation）——下次运行 `mysql-stack:*:prove` 别名即 ENOENT。**本微刀不动**（超出授权面）；需协调方另裁（并入本微刀扩面 / B6 前置扫 / 契约修正案），裁定前该面维持登记态。

## 5. Ban（违者本微刀作废）

1. Ban 改 `isolatedReceiptSources` 以外任何行/任何文件（含同文件命令 map·注释·格式）。
2. Ban 逻辑改动（增删 target·改数组结构·动 sourceDigests/readFile 链）。
3. Ban 借机修 G1 预存红或 E5 base 红（零回归 ≠ 洗红）。
4. Ban 触碰 E4b conn-stack 面。
5. Ban SSOT/债行/push-before-dual；Ban shim（本刀本身就是"直改引用处"的正路，非转发层）。
6. Pins 十值照抄不改口（NOT_HA · releaseEvidence=false · PG-retained · DELETE=503 · coveredCount=8 …）。

## 6. 状态

- [x] 裁定回执登记（§0）+ 范围实值落盘（§2 · 245/104/59/块外 0）
- [x] E4b 连带面登记（§4 · 7 文件 10 处 · 零处置）
- [x] 验收门钉死（§3 · E5 零回归口径）
- [x] **预执行双审 BOTH `Verdict: PASS`（两席独立复算 245/104/59/50 全中 · 协调方 2026-10-07 授权 EXEC）**
- [x] **EXEC + G0–G4 全门实录（§7 收据）· commit `d3507770`**
- [ ] post-prove 双审 → nail 授权
- [x] **STOP**

---

## 7. EXEC 收据（2026-10-07 · commit `d3507770` · base `409843b3`）

### G0 面验证
`node --check` 前/后 EXIT=0 · 替换 **245/245** 落地（59 文件 §4.1 纯前缀插入·零排序零重排）· 块外旧路径残留 **0** · 锚串原样（principal ×60 · isolated-test-target ×57 · migrate-cli ×1 · tenant/index ×1）· `git diff` 恰 1 文件 172+/172− · **172/172 行对引号外逐字节相同（0 违例）**。

### G1 契约门
`e2e-platform:check` **0** · `e2e-platform:layout:prove` **0** · `e2e-static-guards:check` **0** · `e2e-static-guards:prove` **0** · `e2e-parity:check` **0**；`e2e-platform:prove` **EXIT=1 = base 同红原样**（`secret-redaction e2e/full.e2e.ts:59/:154` · E5 不洗）。

### G2 解阻复跑（64 靶 = db 50 全量 + api/worker/ai-runtime 各抽 3 + 三靶不倒退 + base 同红 2 例外）
**53 绿 / 11 红 · 零回归**（逐红靶 base `409843b3` parity 实录同败）：

- **绿 EXIT=0 + 回执正常产出（53）**：db 44（含 commerce·memory-admission·privacy-authorization·scor-01·resume·uc052×4 复跑等；uc052×4 首跑因净树守卫 `C-UNCOMMITTED refuse: dirty worktree` 拒跑——commit `d3507770` 后复跑全绿）+ api 抽 3 中 2 + worker 抽 3 中 2 + ai-runtime 3/3（runtime:claim-join · model-cost · model-op00-usage-reconciler）+ 不倒退 3/3（vectorstore · rag-control-dispatch · qbank-control-role）。**receipt ENOENT 全线归零（fail=0）**。
- **红 = base 同红维持（10）**：`pgp_sym_encrypt` 权限族 6（ctx03/04/05/06 · mem02/mem03）· `interview_privacy_fenced` 族 2（runtime-role · int-transcript-preview-submit:http）· `qbank-source`（app_role 缺）· `adaptive-consumer`（NORMAL_ANSWER_DRAIN）——以上在 base `409843b3` 逐靶复跑 **EXIT=1 同错**（E5 类既有红 · 本刀零致 · 零回归成立）。

### E6 登记（新 · 本刀零处置）
`packages/db/test/uc-e2e-011-report-refund.proof.ts:200` `readRepo('packages/db/src/payment.ts')` —— **B1 扫漏的单行 test 路径串**（B1 白名单①类 · 当时清单未含该文件），致 `uc011:report-refund` 本体红（base `409843b3` 同红 + 双重 ENOENT；本刀后仅剩本体红，回执已修复）。**全仓复扫确认此为 packages/db 内唯一残留**（src 干净 · test 唯此 1 行；仓外余量 = E4b conn-stack 10 处已登记）。处置建议：并入 B1b 单行修正（同白名单类）或随 B2 批带上——需协调方裁定，本刀未触。

### G4 收尾
`git diff --quiet pnpm-lock.yaml` EXIT=0 · commit 后 `git status` 0 entries · runner 容器零残留 · 临时 worktree 已清。

### Ban 自证
E4b conn-stack 零触碰 · SSOT/债行零动 · 无 shim · 单文件单块零逻辑（172/172 证）· 预存红零洗 · pins 十值未改口。

---

*DIR-1 E4 微刀 REQUEST+收据 · 2026-10-07 · exec commit `d3507770` · 单文件纯路径文本 · awaiting post-prove dual · STOP*
