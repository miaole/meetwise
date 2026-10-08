# Harness — **RAG04-C · GAP-RAG-04 台账对齐刀**（SSOT 诚实对齐 · docs-only）

**Phase**: **REQUEST（本卷）** · docs-only · 零产品码 · 零 flag 翻转 · SSOT 本体（backlog 行 / w0-w8 状态文本）**只在 nail 面触碰**（本 REQUEST 只写清单，不改 SSOT 行）
**Date**: 2026-10-08
**Base tip**: `eef469d9`（origin/feat/mysql-schema-skeleton tip · ff 已验）· branch `line/rag04-ssot-align`（自 `line/rag04-eg-next` @ `eef469d9` 零 commit 重挂）
**Authority**: meetwise 待授权 · 流程见 §6

## 0. Pins（文首照抄 · 全程生存 · Ban假关）

**haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null**

- `gR45Closed=true` / `eg3ProductClosed=true` / `eg4ProductClosed=true` / `eg5ProductClosed=true` / `eg6ProductClosed=true` / `eg1ProductClosed=true` / `eg2ProductClosed=true` **均已是 true —— 本刀零 flag 翻转，只对齐滞后文本**。
- `ms3EqualsR4Closed=false` **retained** · coveredCount **8**（Batch4b `f802f02` · Ban invent）· G-R4-5 closed ≠ HA / ≠ cutover / ≠ suite。

## 1. 目标（nail 面落卷 · 非本 REQUEST 面执行）

nail 时把 `gap-bug-backlog.md` **GAP-RAG-04 行状态对齐**为：

> **各 EG 面已闭（逐面 nail/prove tip 列表承卷）· `gR45Closed=true` · coveredCount=8 · `ms3EqualsR4Closed=false` retained · 行 CLOSED（faces-complete）**

**行翻转依据 = 既有各刀已授权的 nail（§2 承卷），非本刀新裁、非新授权、非新面。**
`w0-w8-workflow-status.md` 对齐行一并落卷（§4 逐处 file:line 前后文）。

**Ban 洗史**：ARCHIVE non-flip attempt（REQUEST `da185d9` / prove `139dac9` / nail `1c2ed8c`）与逐刀历史 Ban 文本**原样保留不回改**，仅状态列/状态 token 对齐；对齐处一律以括注承卷历史时点，**不做删除式改写、不加删除线、不重写历史叙述**。

## 2. 侦察承卷（@`eef469d9` merge-base 亲证 · 2026-10-08）

以下 **18 个 commit 均为 tip 祖先**（`git merge-base --is-ancestor` 逐个亲证 PASS）；其中 **15 个 nail/prove commit**（EG×12 + reassess×2 + 聚合 prove×1）构成闭面证据链；各面状态 **`post_prove_dual_pass`**：

| Face | nail | prove / EXEC | 状态 |
|------|------|--------------|------|
| EG1 dual-claim | `88277ee` | `4a0877d` | `post_prove_dual_pass` |
| EG2 funnel-covered | `a34421a` | `2d3f055` | `post_prove_dual_pass` |
| EG3 题域 isolation | `7be1a55` | `5b3c854` | `post_prove_dual_pass` |
| EG4 wrong-track | `ce09850` | `0a34933` | `post_prove_dual_pass` |
| EG5 product SSOT | `33f457b` | `7f59b95` | `post_prove_dual_pass` |
| EG6 MS3≠R4 | `315570d` | `757fbe1` | `post_prove_dual_pass` |
| R4·FUNNEL reassess | `2b38e18` | `14e9e2c` | `post_prove_dual_pass` |
| G-R4-5 聚合 | REQUEST `4681b1a` → pre `c2cc937` → **prove `ba1b8aa`** | — | `post_prove_dual_pass`（post dual BOTH PASS on `ba1b8aa`） |

- **聚合 lifecycle nail = `6ded5896`**（docs(delivery): nail G-R4-5 product-close post_prove_dual_pass · ancestor 亲证）——改 `harness/g-r4-5-product-close.md`（L0–L5 全 done）+ 两份 post-prove review（`reviews/REQUEST-2026-09-23-g-r4-5-product-close-post-prove-mw-{e2e-ha,rag-route}.md`）。
- prove 脚本：`package.json:507-527`（`r4-eg1-dual-claim-product-close:prove` / `r4-eg2-funnel-covered-product-close:prove` / `r4-eg3-domain-isolation-product-close:prove` / `r4-eg4-wrong-track-product-close:prove` / `r4-eg5-product-ssot-product-close:prove` / `r4-eg6-ms3-ne-r4-product-close:prove` / `r4-g-r4-5-product-close:prove` 等均在场）。
- 聚合 harness 尾部 pins（原文在场）：`gR45Closed=true` · flip reason = live `canHonestlyFlip` · EG1–EG6 + r4/funnel flags retained · `ms3EqualsR4Closed=false` retained · coveredCount 8 retained · `releaseEvidence=false`。
- 历史证据 tip（Ban wash 对象，均 ancestor 亲证）：EG1 evidence `08f7499`/`ffb2a9b` · EG3 evidence `62c0e2f`/`c18e28f` · EG4 evidence `3cefebf`/`ec90b6d` · EG5 evidence `e099276`/`6058462` · EG6 evidence `9b1c83e`/`3e82f14` · R1 `9fec7c7`/`72233a0` · Batch4b `f802f02`/`0e58386` · 逐刀 REQUEST/pre：`7c1bad1`/`ca5e36f` · `f2b6416` · `6ee0cd1`/`df2488a` · `95b3dd2`/`50924b2`。
- **侦察结论：无任一 EG 面未闭，与上一刀结论零矛盾 → 本 REQUEST 准予立卷。**

## 3. 滞后文本定性（对齐理由）

聚合面 `post_prove_dual_pass` + lifecycle nail `6ded5896` 已落卷，但 SSOT 两处仍留 `executed:awaiting_post_prove_dual` 时代文本（状态列滞后，非事实翻转）：

- `gap-bug-backlog.md:72` GAP-RAG-04 行：聚合段 `executed:awaiting_post_prove_dual` 在场；处置/验收列残留 "`gR45Closed` still false"（reassess 时点）、"EG5 … awaiting post-prove dual"、"不得宣称 G-R4-5 all closed" 等旧状态语。
- `w0-w8-workflow-status.md:59` / `:151` / `:181`：聚合行 / 聚合 Honesty 段 / Hard pins 行仍写 `executed:awaiting_post_prove_dual`、"await post-prove dual → nail → STOP"、"G-R4-5 STILL OPEN"。

## 4. 对齐点清单（nail 面执行 · 逐处 file:line 前后文）

### A. `ai-docs/delivery/gap-bug-backlog.md:72`（GAP-RAG-04 行 · 列序 ID|P|缺口|处置/验收|域|下一刀|证据）

| # | 位置 | 前文（现状） | 后文（对齐后） |
|---|------|--------------|----------------|
| A1 | 缺口列 · 聚合段 | "…REQUEST tip `4681b1a` · pre_dual `c2cc937` · **`executed:awaiting_post_prove_dual`** · Ban假关 …" | "…REQUEST tip `4681b1a` · pre_dual `c2cc937` · **`post_prove_dual_pass`**（post dual BOTH PASS on prove `ba1b8aa` · lifecycle nail `6ded5896`） · Ban假关 …"（仅状态 token；其后 Ban 链原样） |
| A2 | 缺口列 · 行首 | 行以 "**G-R4-5 aggregate product face closed under authorize**（…" 开头 | 行首前置（不删原句、不加删除线）："**CLOSED（faces-complete）**（各 EG 面已闭 · 逐面 nail/prove 承卷：EG1 `88277ee`/`4a0877d` · EG2 `a34421a`/`2d3f055` · EG3 `7be1a55`/`5b3c854` · EG4 `ce09850`/`0a34933` · EG5 `33f457b`/`7f59b95` · EG6 `315570d`/`757fbe1` · R4·FUNNEL reassess `2b38e18`/`14e9e2c` · 聚合 REQUEST `4681b1a`→pre `c2cc937`→prove `ba1b8aa`→nail `6ded5896` · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` retained）· " 再接原文 |
| A3 | 处置/验收列（状态列）· 3 处旧状态语 | ① "reassess … tip nail `2b38e18` · **`gR45Closed` still false**"；② "EG5 product SSOT product face closed under authorize · **awaiting post-prove dual**"；③ "**不得宣称 G-R4-5 all closed** / invent coveredCount / …" | ① → "`gR45Closed=true`（聚合 nail `6ded5896` 对齐；reassess 时点 false 为历史原文承卷）"；② → "EG5 … closed under authorize · `post_prove_dual_pass`（nail `33f457b` / prove `7f59b95`）"；③ → "G-R4-5 faces-complete CLOSED（逐面承卷见缺口列）"，其连排的 "/ invent coveredCount / invent coveredCount / MS3=R4 / wash … without prove · Ban flip gR45Closed/r4/funnel this knife" **原样保留**。列首前置："**行 CLOSED（faces-complete）** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` retained · " 再接原文 |
| A4 | 缺口列 · EG1/EG2/EG5/EG6 四段段头（rev2 补枚举） | 四段段头各为 "（authorized · **`executed:awaiting_post_prove_dual`** · prior `pre_dual_pass`）"："G-R4-5 / EG1 dual-claim product close（…）"、"G-R4-5 / EG2 funnel-covered product close（…）"、"G-R4-5 / EG5 product SSOT product close（…）"、"G-R4-5 / EG6 MS3≠R4 product close（…）" | 逐段段头 token → "`post_prove_dual_pass`"，并逐段括注承卷：EG1（nail `88277ee` / prove `4a0877d`）· EG2（nail `a34421a` / prove `2d3f055`）· EG5（nail `33f457b` / prove `7f59b95`）· EG6（nail `315570d` / prove `757fbe1`）；四段段内其余文本（Ban wash 链 · retained 叙述 · Ban 假关等）**逐字原样** |

ARCHIVE 段（"**G-R4-5 / R4·FUNNEL product close authorized attempt（ARCHIVE · Do NOT rewrite）**（… REQUEST `da185d9` · prove `139dac9` · nail `1c2ed8c` … coveredCount **was 0** · pin `evidence_insufficient_coveredCount_zero` · Ban假关）"）**原文不动**。

### B. `ai-docs/delivery/w0-w8-workflow-status.md`

| # | file:line | 前文（现状） | 后文（对齐后） |
|---|-----------|--------------|----------------|
| B1 | `:59`（聚合 knife 行） | 表头斜注 "authorized honest flip · **executed:awaiting_post_prove_dual** · prior pre_dual_pass"；格内 "prior **`pre_dual_pass`** on tip **`4681b1a`** / nail **`c2cc937`**" | 斜注 token → "**post_prove_dual_pass**"；pre_dual 引文后追加 "· post-prove dual BOTH PASS on prove tip **`ba1b8aa`** · lifecycle nail **`6ded5896`** · CLOSED（faces-complete）"（pre_dual 历史引文原样） |
| B2 | `:151`（聚合 Honesty 段） | 段头斜注 "authorized honest flip · **executed:awaiting_post_prove_dual** · prior pre_dual_pass"（rev2 补枚举）；"Status **`executed:awaiting_post_prove_dual`**."；段尾 "await post-prove dual → nail → STOP." | 段头斜注 token → "authorized honest flip · **post_prove_dual_pass** · prior pre_dual_pass"；"Status **`post_prove_dual_pass`**（CLOSED lifecycle · post dual BOTH PASS on prove `ba1b8aa` · lifecycle nail `6ded5896`）."；段尾 → "post-prove dual BOTH PASS on `ba1b8aa` · nail `6ded5896` · STOP."（段内 Ban 链全原样） |
| B3 | `:181`（Hard pins 行 · 仅 G-R4-5 相关段） | 聚合/EG2/EG1/EG6/EG5 五段各含 "**executed:awaiting_post_prove_dual**"；多段含 "**G-R4-5 STILL OPEN**" | 五段状态 token → "post_prove_dual_pass" 并逐段括注承卷：聚合（nail `6ded5896`/prove `ba1b8aa`）· EG2（nail `a34421a`/prove `2d3f055`）· EG1（nail `88277ee`/prove `4a0877d`）· EG6（nail `315570d`/prove `757fbe1`）· EG5（nail `33f457b`/prove `7f59b95`）；G-R4-5 段内 "G-R4-5 STILL OPEN" → "G-R4-5 CLOSED（faces-complete）· `gR45Closed=true`（聚合 `6ded5896`；该段其余为逐刀历史时点承卷）"。EG4 段已是 `post_prove_dual_pass` 不动；各段 Ban wash 链（`da185d9`/`139dac9`/`1c2ed8c`、`f802f02`/`0e58386`、EG evidence tips 等）**逐字保留**；非 G-R4-5 段（R1/W1b/W6/W7/W8/suite/G7-Key）**不动** |

### 不在范围（Ban 改）

`w0-w8` 其余行（`:44-48` Batch 行、`:53-58` 逐刀行、`:129-149` 逐刀 Honesty、`:187` footer）与 `gap-bug-backlog.md:69`（GAP-RAG-01）的历史时代文本**一律不动**（本刀只对齐 §4 所列 4 处；其余滞后属后续刀或保留为历史）。`m4-rag-hard-gates.md` §R4 本刀不动。

## 5. Hard Bans

1. **Ban invent 新面**——本刀零新面，faces 集合恰为 EG1–EG6 + R4·FUNNEL + 聚合，承卷即全集。
2. **Ban 洗 prior tips**——§2 全部 tip 及 ARCHIVE non-flip（`da185d9`/`139dac9`/`1c2ed8c`）原样承卷，不回改不改写不删。
3. **Ban 翻 `gR45Closed`/eg3/eg4/eg5/eg6 任一 flag**——它们已是 true，本刀零 flag 翻转，只对齐滞后文本。
4. **Ban 碰 `ms3EqualsR4Closed=false`**——retained，不得改写。
5. **Ban coveredCount≠8**——coveredCount=8（Batch4b `f802f02`），Ban invent。
6. **Ban 改其他行**——只动 §4 所列 backlog GAP-RAG-04 行 + w0-w8 `:59`/`:151`/`:181`。
7. **Ban 碰产品码 / 碰 SSOT 本体于 REQUEST 面**——SSOT 行状态对齐只在 nail 面落卷。
8. **Ban secrets / `.env*`**；Ban Cloud Agent；Ban Meridian；Ban second knife；Dual PASS ≠ next knife auto-authorize。
9. **Ban 假关 / Ban 洗史**——行 CLOSED 的依据=既有各刀 nail 承卷，非本刀新裁；历史时点文本括注承卷，不删除式改写。

## 6. 流程声明

**REQUEST（本卷，docs-only）→ 预执行双审（`mw-rag-route` + `mw-e2e-ha`，stub：`reviews/REQUEST-2026-10-08-rag04-align-mw-rag-route.md` / `reviews/REQUEST-2026-10-08-rag04-align-mw-e2e-ha.md`）→ meetwise 授权 → （EXEC 面为空/仅核对清单 §7）→ post 双审 → meetwise 授权 nail（nail = SSOT 行状态对齐落卷，即 §4 清单执行）→ STOP。**

Dual PASS ≠ coding 授权（本刀无 coding）· Dual PASS ≠ next knife auto-authorize。

## 7. EXEC 面核对清单（EXEC 为空 · 仅核对，nail 面复跑）

1. ancestor 复核：§2 表 18 commit `git merge-base --is-ancestor` 全 PASS。
2. 对齐复核（rev2 边界明确）：**状态 token = 段生命周期 token，清零范围 = A1 + A4 四处 + B1 斜注 + B2 两处（段头斜注 · Status 句）+ B3 五段**，对齐后上述生命周期 token 清零；**batch 段 "prior … recorded" 历史叙事、EG6 true-evidence 段及对齐点外历史 token 豁免，数量不减于 base**——与「Ban wash 链逐字保留 / ARCHIVE 段不动」条款零冲突。
3. diff 复核：nail commit 相对 REQUEST tip 仅改 `ai-docs/delivery/gap-bug-backlog.md` + `ai-docs/delivery/w0-w8-workflow-status.md` 两文件；零产品码。
4. Ban 保全复核：ARCHIVE 段与逐刀 Ban 链逐字在场（`da185d9`/`139dac9`/`1c2ed8c`、`evidence_insufficient_coveredCount_zero`、`3cefebf`/`ec90b6d`、`62c0e2f`/`c18e28f` 等）。
5. flags 复核：`gR45Closed=true` · coveredCount=8 · `ms3EqualsR4Closed=false` · `releaseEvidence=false` · 公开 DELETE=503 · ≠HA · ≠suite，全未翻转。

## 8. Non-claims

- 不宣称 HA / cutover / suite green / `releaseEvidence=true` / 实际花费披露（`actualSpendCny=null`）。
- 不宣称 MS3=R4 closed（`ms3EqualsR4Closed=false` retained）。
- 不宣称本刀翻转任何 flag（零翻转）；不宣称新面；不宣称 coveredCount 变化。
- G-R4-5 faces-complete CLOSED ≠ HA / ≠ cutover / ≠ suite green / ≠ 公开 DELETE 解冻（DELETE=503 freeze 不变）。
- 本 REQUEST 卷不改 SSOT 行；SSOT 行状态对齐只发生在 meetwise 授权后的 nail 卷。

---

*Harness · RAG04-C SSOT align · 2026-10-08 · REQUEST phase · base `eef469d9` · zero coding · zero flag flip · SSOT row touch deferred to authorized nail · 承卷：EG1 `88277ee`/`4a0877d` · EG2 `a34421a`/`2d3f055` · EG3 `7be1a55`/`5b3c854` · EG4 `ce09850`/`0a34933` · EG5 `33f457b`/`7f59b95` · EG6 `315570d`/`757fbe1` · R4·FUNNEL `2b38e18`/`14e9e2c` · 聚合 `4681b1a`/`c2cc937`/`ba1b8aa`/nail `6ded5896` · ARCHIVE `da185d9`/`139dac9`/`1c2ed8c` 原样 · Ban invent 新面 · Ban 洗 prior tips · Ban 翻 gR45Closed/eg3/eg4/eg5/eg6 · Ban 碰 ms3EqualsR4Closed=false · Ban coveredCount≠8 · Ban 改其他行 · Ban secrets / `.env*` · Ban second knife · STOP*
