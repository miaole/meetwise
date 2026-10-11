# SUMMARY — CMOP03-FIX · driver 断言修复刀 EXEC（G7X nail 立项刀① · coding+prove 一次优先 · 修复面越过实证 · post-7b 新面红原值登记 · STOP 勿自 nail）

**Line**: CMOP03-FIX · **Date**: 2026-10-08 · **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-cmop03fix` · branch `line/cmop03-driver-assertion-fix` · **coding base HEAD**=`938e0f5505ddd14c63347178fd0a739939e1a956`（REQUEST `479719a9` rebase twin · base=`eef469d9` 恰=授权定值）

## 一句话定谳

**修复面成立：`full.e2e.ts:201-203` 澄清感知对称化后，CMD1 同体单有效 attempt 越过该断言（C-MO-P3 恒 False 面就此消除——G7X T-1 的 40363ms 死亡点不复现），journey 首次推进经 step 7（:216 容 quarantined）/7a（report_unavailable+quarantined 首验过）/7b（quiz_unavailable + diagnosis_ready 双终态非死胡同）全部通过，最终 EXIT=1 class=api 红于 post-7b 新面（死亡窗 ∈(:256, 旅程末) · 精确断言行 stderr 契约内不可回读）——按 §3 冻结契约「step 7 以后任何红=新面新登记」原值记账升级协调方，Ban retry-to-green 守住（零第二次 run）。**

## attempts 全台账

| # | run | EXIT | 定性 |
|---|---|---|---|
| 1 | `pnpm run e2e:isolated`（重定向 `.tmp/` 缺失） | 1 | **env-not-ready（infra abort · 非产品红）**：e2e 未起跑零产品读数（G7V-FIX attempt#1 分档先例） |
| 2 | **唯一有效**：loader source Key → `pnpm run e2e:isolated` | **1** | **修复面越过实证 + post-7b 新面红**（failureClass=api · 78798ms · receipt `2026-10-08T03-27-38-134Z-…-48495d1986be.json`） |

## 判读要点（详证 Receipt 00）

1. **修复面（方案 a 主形）**：`identities.length === questions + clarifications`（:202 计数段 only · B 端分信任两段零改动）——clarifications 计数器 `interview.ts:64`（类型）/:292（init）/:342（分支头部每轮恰一 · stale-replay 不 increment 语义保持）/:376（返回形状）。**越过实证=reviewLedger 后四条 recordTerminal（:209 主旅程 report_unavailable / :235 7a failLoop report_unavailable / :249 quiz_unavailable / :255 diagnosis_ready）全部严格位于 :203 之后 + A() fail-closed 首假即退**。
2. **provenance 反伪造零弱化（机检四钉 pre/post run 全等）**：`sse.ts`=`9bba015d` · `assert.ts`=`975fbb38` · `run-e2e-isolated.mjs`=`13dbfc43` · `model-operation-registry.ts`=`63af556f`——rejectForgedProgressScores/identity 签发纪律（:77/:90-97）/progress 携 questionId 拒（:206）/`:216`/`:236-237` 断言本体全部零 diff；NEG 四条预注册构造性保持（受保护面零 diff · 单 attempt 契约内无独立 NEG run）。
3. **errata ×2 回填**：E-1 类型名=`InterviewLoopResult`（interview.ts:59 · :63 为 questions 字段行）；E-2 终态族锚=`interview.ts:7`（INTERVIEW_TERMINALS · :8=STALE_QUESTION_ERROR）。判读值域不变。
4. **post-7b 新面（升级协调方）**：死亡窗 ∈ **(`:256`, 旅程末)** · failureClass=api（缺省类 A() 或 `:383-385` client_uncaught）· duration 78798ms = G7X T-1 死亡点 40363ms + ~38.4s post-:203 区段 · 精确位置 withhold 契约内不可回读（logs_bytes=1617/state_bytes=217 withheld · Ban readback）——step 8/9 区（本刀预期面新登记）vs 专家评审段（既有面）两岔契约内不可分辨，归协调方裁。**Ban 就地定位重跑 · Ban 归因既有关行 · Ban retry-to-green（零第二次 run 通道守住）**。
5. **base 重钉与锚重核**：fetch EXIT=0 · tip 恰 `eef469d9` · rebase 零冲突；七锚 blob @`eef469d9` 与 REQUEST 申报全等（base 漂移仅 G7V-FIX 线 `apps/web/lib/*`+其 proof · Ban 碰面零重叠）；receipt 自证四 digest `shasum` 亲算全等；tracked 树 run 前后零改（恰 2 modified · blob pre/post 全等）。

## 预算

est 硬帽 **≤200**；**est ≤25 ≪ 200**（est-not-counter）；**`ai_model_invocation` 账本实测不可达**（wrapper finally 拆容器 · `docker ps -a` 零行 · 本 EXEC 未派 sidecar · Ban 第二 run 补测——实测缺口如实记）；无超限中止 · **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）· Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only · 值零入卷）· `.env*` ABSENT 前后双测。

## EXIT 契约落点（双向）

- **修复落地 ≠ C-MO-P3 关闭 ≠ `:107` 关闭 ≠ trio 翻绿 ≠ `g7SuiteGreen=true` ≠ 刀② 裁定**——C-MO-P3 落地登记、`:107` 处置、post-7b 红面（新面 vs 既有面两岔）裁定、刀② 开工权全归协调方。
- trio stays **OPEN**（G7U 真测 1/1/1 retained · 零冲销）· `g7SuiteGreen=false` · GAP-G7K-API-REDS `:107` stays P1 OPEN · P2 复验门零触碰 · 残红①② 零触碰 · G7V-FIX 线零触碰（apps/web/lib/* 零 diff 机检在卷）。

## Non-claims

Not a pass · not fixed-fully（修复面成立但 post-7b 面红在卷）· not post-7b 定位（bounding 非「已证」）· not C-MO-P3 closed · not `:107` closed · not 刀② 裁定 · not trio green · not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · alone ≠ dual · **`actualSpendCny=null`** · **STOP——post-prove 双审由协调方另派 · 禁自批 · push 后停**

---

*SUMMARY · CMOP03-FIX EXEC · 2026-10-08 · 单有效 attempt EXIT=1 class=api 78798ms · **修复面 `:201-203` 越过实证（C-MO-P3 恒 False 面消除 · G7X T-1 死亡点不复现）** · step 7/7a/7b 首验全过（report_unavailable×2 + quiz_unavailable + diagnosis_ready 四终态 ledger 在卷 · :236-237 零改断言本体而预期形状兑现）· post-7b 新面红原值登记（∈(:256,末) · class=api · withhold bounding · 两岔归协调方）· coding 恰两文件四钉零 diff · errata ×2 回填 · est ≤25 ≪ 200（账本实测不可达如实记）· `actualSpendCny=null` · **STOP——勿自 nail · post-prove 双审归协调方派** · STOP*

> **erratum · push 模式登记（append-only · 2026-10-08）**：首推被拒 non-FF——remote 停在 pre-rebase REQUEST `479719a9`（本人上一 turn 所推 · `git ls-remote` 亲测 · **零外来提交**），本地按 EXEC 指令 1 rebase 出 patch 全等孪生 `938e0f55`（4 文件 +266 numstat 逐行同 · 亲算）致历史分叉。处置=`git push --force-with-lease=refs/heads/line/cmop03-driver-assertion-fix:479719a9107ec2414b44d7e1becfd91f3fc4e3ac`（lease 钉死已知远端 SHA · 零外来工作覆盖面）→ 远端 `479719a9`→`9a48f57c`（forced update · ls-remote 终测=9a48f57c）。远端终链：`eef469d9` ← `938e0f55`（REQUEST twin）← `4252efc8`（coding）← `9a48f57c`（EXEC 收据）。
