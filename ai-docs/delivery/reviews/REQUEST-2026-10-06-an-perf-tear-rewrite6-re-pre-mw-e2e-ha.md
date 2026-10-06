# Re-PRE ×6 · **AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause fix** · mw-e2e-ha

**Verdict**: **PASS**（单方 · docs gate · 非 dual · alone ≠ dual）
**时间**: 2026-10-06 22:46 +08:00
**REWRITE6_SHA**: `f76fcff266369cec1f1d808f5be7324fbc4e0c61`（`f76fcff` · supersedes prove tip `af9664a` / REQUEST `771ca84` → `b5633f0` → `083cce4` → `1b74fb1` → `553cfc5` → `110532e`）
**Docs-only**: `git show --name-only f76fcff` = 5 paths under `ai-docs/` only（harness · slice · 2026-10-05 R2 receipt title · 两 stub）· `git diff --quiet 771ca84 f76fcff -- scripts packages apps` EXIT 0 → **无产品码**
**Cites FAIL**: mw-rag-route POST FAIL `4803616e965b0a6d06731c534ab7c9de4a10146d`（@PROVE `af9664a` / CODE `60de958` · A-MUT/A-POST/C-POST 0/3 · J-2 L3-sim 谓词误设 · L3 IN 不可达 · R2 11/11 · 0 POST Unhandled · peer `1d9d3ac` cited not co-signed）· 更早 FAIL `a07256c` / `70cba94` / `20da721` / `7e97dc3` / `152b665` retained
**Own prior POST**: mw-e2e-ha POST PASS `1d9d3ac029170e7e1340abda2f113813bd7e01ee` @af9664a —— **cited not as dual**（证据诚实 / 同认矩阵未全格达标 · SPLIT · alone ≠ dual）· **不**延用为本稿 PASS；本审对 `f76fcff` 全新独立复核。
**Peer**: mw-rag-route POST FAIL `4803616` —— **仅引用 blocker checklist，不代签**；本审独立对抗复核 ×6 三 MUST。是否构成 dual + AUTHORIZE 由协调方判定，本审**不** AUTHORIZE · Ban nail。
**审查基**: `/workspace/meetwise` @ `origin/feat/mysql-schema-skeleton` tip `f76fcff` · 只读 · 无 prove / 无 docker 操作 · 未读 `.env*` · 无 live 模型 · 未改 shared git config · Ban coding · Ban invent covered/HA
**Scope**: PRE / docs gate only · Ban coding · Ban prove · Ban buy cloud · Ban nail · Ban wash · Ban covered flip · Ban invent covered/HA · HOLD AN-CIMG-EA · Never Meridian · QUOTA WIND-DOWN · NO new knives

## Hard pins（frozen · 本审不改）

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · g7SuiteGreen=false · backlog `gap-bug-backlog.md:35` C-PERF-TEARDOWN **CONDITION OPEN** · attempt1 @ `b29c191` 不洗 · UC-018 / §1.1 partial · gap ≠ covered

## 0. 基线核对

| 检查 | 结论 |
|------|------|
| `git rev-parse f76fcff` = `f76fcff266369cec1f1d808f5be7324fbc4e0c61` | ✓ on origin tip |
| rewrite commit 文件树 | 5× `ai-docs/` · **0** `scripts/`/`packages/`/`apps/` |
| CODE 锚 | `771ca84..f76fcff` product paths quiet → 行号沿用 ×5 / `ac03f30` |
| backlog `:35` | 原文仍「disclosed, not washed, not closed」· status **OPEN** · `f76fcff` 未触 backlog |
| Status | harness/slice = `draft:awaiting_pre_exec_dual` · 两 stub Verdict 仍 PENDING（core 未代填） |
| 不追溯 `af9664a` | ×6 note 明文：A/C-POST FAIL×3 + `A_FATAL_ON_ACTIVE` / `J2_NOT_L3SIM` 原样保留为历史 · 契约只对 next prove 生效 |

## 1. ×6 MUST ① · J-2 L3 IN / L3-sim / EXTERNAL-OTHER → **已解除（契约层）**

对抗目标：复活旧「`kill`→`die`→`destroy` **全部**早于首错」· 漏钉新标记 · 把满足 (T-k) 的 kill 再落 L1 · 假清。

| 检查 | 结论 | 锚 |
|------|------|----|
| 旧规则删除 | ✓ | ×6 note 表 #1 「**删除**…全部早于首个错误行」· §2.1 标题「取代 ×2–×5…」· Ban §5.4 「Ban 保留 / 并用旧规则」。`rg`「全部早于」仅出现于删除/取代/Ban 语境 · **无**操作性旧谓词 |
| (T-k) kill(9) 严格早于首错 | ✓ | §2.1 `(T-k)` · L3 IN / L3-sim / EXTERNAL-OTHER 三行同写 |
| (T-d) die(137) ≤ 500 ms after kill | ✓ | `W_die = 500 ms` · exitCode=137 写死 |
| (T-x) destroy ≤ 2000 ms after die | ✓ | `W_destroy = 2000 ms` |
| die/destroy **可**晚于首错 | ✓ | §2.1 明示「相对 `t_err` 的先后**不判**」· 与 mission 一致（die/destroy MAY follow first error） |
| 新标记 | ✓ | `J2_KILL_NOT_BEFORE_ERROR` · `J2_POSTKILL_WINDOW_EXCEEDED`（事前钉 · 格 FAIL · 计入 3 · Ban retry/换 attempt）· L3-sim 行与 UNDETERMINABLE 桶均挂 |
| 满足 (T-k) 不落 L1 | ✓ | L1 行加「首错前无本 run PG kill(9)」· 判定次序「存在 (T-k) → 只能落 kill 三行或 UNDETERMINABLE · **不得**再落 L1」→ 解除 `4803616`「真实外部 kill → L1」连带堵死 |
| C-POST / J-3 / §4.1 / §5.1 同步 | ✓ | C-POST 矩阵用 ×6 谓词 + 新标记；J-3 承接 L3-sim；§4.1 / §5.1 J-2 事件期望同步 |
| 界值诚实 | ✓ | Non-claims：500/2000 由 `af9664a` 6 次事件推出（kill→die 177–226 · die→destroy 460–581）· 非本刀新测 · Ban 事后放宽 |

**对抗结论**：旧「all before first error」未复活；新窗口 + 新标记落地；L3 IN 对真实外部 kill 在表结构上可达（attempt1 本身仍 UNDETERMINABLE · Ban wash）。`4803616` 阻塞「J-2 L3-sim 谓词误设 / L3 IN 不可达」**真实解除（契约）**。

## 2. ×6 MUST ② · (b) A-MUT/A-POST = 诊断 · 非 P-HOLD 门控 → **已解除（契约层）**

对抗目标：wash A 成绿 · drop/swap `A_FATAL_ON_ACTIVE` · 把 A 非门控洗成「A 已证」· 事后豁免而非事前 REQUEST · 漏掉零 Unhandled / B-MUT/C-MUT。

| 检查 | 结论 | 锚 |
|------|------|----|
| 选 (b) 事前 REQUEST | ✓ | ×6 note 表 #2 · §3 P-HOLD · §4「×6 门控集」· 「非事后豁免」明文 |
| A 仍执行 3× | ✓ | §4 A-MUT / A-POST 行保留 · 3 attempts · 原签名判 PASS/FAIL · 如实记录 |
| `A_FATAL_ON_ACTIVE` Ban drop/swap | ✓ | §4 诊断行仍计 FAIL · Ban 列表 · Retain 段 · Non-claims「A 非门控 ≠ A 已证 · A 钉定路径 **unproven**」 |
| P-HOLD 门控定义 | ✓ | **PC + B-POST + C-POST（×6 谓词）3/3** ∧ **B-MUT + C-MUT 3/3** ∧ **全部 POST inject（含 A-POST）零 `Unhandled 'error' event`** · A 不入门控格集但仍受零 Unhandled 覆盖（A-POST Unhandled → 直接否定 P-HOLD / 触发 P-FIX） |
| (a) seed 重设计延后 | ✓ | 明文「本稿不选 · 延后 · Ban coding」 |
| 不追溯 `af9664a` | ✓ | 历史 A FAIL×3 原样 · 不洗绿 |

**对抗结论**：未 wash A · 未 drop `A_FATAL_ON_ACTIVE` · A 路径诚实 unproven · P-HOLD 门控 = mission 定义。`4803616` 阻塞「Inject A 0/3 永久阻塞 P-HOLD / 无非门控行」**真实解除（契约 · 选 b）**。

## 3. ×6 MUST ③ · R2 11/11（非 12/12）→ **已解除**

| 检查 | 结论 |
|------|------|
| harness §6 R2 | **11/11 PASS**（注明原 12/12 为继承误计） |
| 2026-10-05 收据 `:21` / `:121` 标题 | **11/11** + 更正注记 · Appendix B 正文 11 行 PASS 原样不动 |
| proof 源码独立计数 | `packages/db/test/pool-error-listener.proof.ts` @`ac03f30` 恰 **11** 个 `A(`（`:62 :86 :88 :91 :98 :100 :102 :109 :115 :125 :126`）· 与 harness 列举一致 |
| `12/12` 残留 | 仅历史「原写 12/12」更正语境 · 无操作性 12/12 期望 |

## 4. Retain ×5 clears · C-a/b/c · pins · CONDITION

| 项 | 结论 |
|----|------|
| ×5 TIMING 预启动 / `GATE_LOOP_START t0_ms < t_load2` | retained · 未回退 |
| B-POST `U_B` 公式 / margin / `BC_MARGIN_INFEASIBLE` | retained |
| C-POST 与阶段无关 OK keep · B-POST 落点复核 | retained |
| `idle_n≥2` · pg 栈帧 · `wait∈{143,0}` · MUT-ZERO / POOLQUERY_RACE / C1–C4 / Inject A idle-in-txn+57P01 | retained |
| **C-a / C-b / C-c** AUTHORIZE 条件落地段 | 全文保留（Emitted-at 扫描 · kill -TERM EXIT 0 · margin.json docker version） |
| 0 POST Unhandled 诚实性 · `principal.ts` P-HOLD 零改 · Ban invent product loci | retained |
| pins | NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false（hard pin 携带） |
| CONDITION `:35` | **OPEN** · 本审不关 · Ban covered flip |

## 5. 阻塞项

**无阻塞。**

（非阻塞披露 · 不构成 FAIL）：harness 文末短 footer 写「P-HOLD = PC+B-POST+C-POST + 0 POST Unhandled」省略 B-MUT/C-MUT 字样；**正文 §3 / §4 门控集完整含 B-MUT/C-MUT**，以正文为准。L2-self 行仍用旧「die 早于首错」口径（×6 note 披露「不在 `4803616` 范围 · 不开新刀」）——本审不 invent 扩大范围。

## 6. Spot-check（全部只读 · 本 box）

- `git fetch` · `git rev-parse f76fcff` = full SHA · on `origin/feat/mysql-schema-skeleton`
- `git show --stat/--name-only f76fcff` · product path quiet vs `771ca84`
- harness @f76fcff：×6 note · §2.1 J-2 谓词/判定表 · §3 P-HOLD · §4 门控集 + A/C-POST 行 · §5.4 Ban ×6 · §6 R2 · Pins / Non-claims
- slice @f76fcff 与 harness 对齐（J-2 窗口 · (b) · R2 11/11 · Ban 列表）
- receipt `2026-10-05-gap-principal-pool-error-listener-fix-prove.md` `:21`/`:121` 标题 11/11
- `pool-error-listener.proof.ts` 11× `A(` 行号复核
- peer FAIL `4803616` POST 段 blocker 对照（J-2 / A 门控 / R2）
- own POST `1d9d3ac` 仅 cite · 不代签为 dual
- `gap-bug-backlog.md:35` CONDITION OPEN 原文
- `rg` 对抗：旧「全部早于」仅删除语境 · `J2_KILL_NOT_BEFORE_ERROR` / `J2_POSTKILL_WINDOW_EXCEEDED` 存在 · `A_FATAL_ON_ACTIVE` 未 drop · 无 12/12 操作性期望

## 结论

`4803616` 三合约阻塞在 REQUEST 契约层**真实解除**（非假清 · 非 wash · 非 invent covered）：① J-2 改为 kill-before-error + die≤500ms / destroy≤2000ms post-window · 旧 all-before-error 删除 · 新标记落地 · L3 IN 表可达；② 选 (b) A 诊断非门控 · `A_FATAL_ON_ACTIVE` 保留 · P-HOLD = PC+B-POST+C-POST(×6)+B-MUT+C-MUT + 全 POST 零 Unhandled · A unproven 诚实；③ R2 11/11 harness+收据标题+proof 11 `A(`。×5 clears / C-a/b/c / pins / CONDITION `:35` OPEN 保持。docs-only · 无产品码。**无阻塞 → PASS（单方）**。

Ban coding（直到 BOTH PASS + 协调方 AUTHORIZE）· Ban prove · Ban nail · Ban self-approve · Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · Ban invent covered/HA · backlog `:35` CONDITION OPEN · cites FAIL `4803616` · own POST `1d9d3ac` cited not as dual（SPLIT · alone ≠ dual）· peer 不代签 · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · HOLD AN-CIMG-EA · Never Meridian · QUOTA WIND-DOWN · NO new knives · 本审**不** AUTHORIZE。

Verdict: PASS
