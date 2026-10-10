# REQUEST — **GAP-PRIV-AUTHZ-PROVE-FLAKE · 根因调查** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer mw-e2e-ha）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-privacy-int`（`pnpm privacy-authorization:prove` 为隐私授权证明链 · `packages/db/test/privacy-authorization.proof.ts` 属隐私根域测试面）
**Knife**: `harness/gap-flake-rootcause-investigation.md` · slice `gap-flake-rootcause-investigation.slice.md`
**Parent tip**: `50423a6f`（full `50423a6fa6f18d4c9d193611cf84c4702e067208` · origin/feat/mysql-schema-skeleton · fetch 后逐字一致）
**Date**: 2026-10-07

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `canHonestlyFlip` | **false** |
| backlog `:68` | **OPEN** · mitigated/cause-unknown（stays） |

## 请审什么（mw-privacy-int 视角）

A'' teed attempt-2 `PROCESS_EXIT=0`（三角一致 · 51 PASS）补齐了证据链，但 `:68` 根因**未钉死**：冷启 `ECONNREFUSED`（宿主→发布端口 · EXIT=1 ×2）与 warm `23505 interview_pkey`（EXIT=1 ×1）两类并存未归一；attempt-2 一次过未复现 ≠ 根因消失。本刀 REQUEST = **根因调查设计**（非 prove 刀 / 非 fix 刀 / 非关闭刀）。请审：

1. **范围成立性**：REQUEST 是否如实限定为「调查设计」——零实验执行、零产品/基建/测试码、零 SSOT 触碰；每实验是否 pre-registered 假设+判读标准+判读反例（harness §3）；Ban retry-to-green 与 Ban「一次过=根因」是否双向写死（harness §0/§5）。
2. **暖类实验越权边界（隐私测试面核心关切）**：E-WARM-1（同库双跑）/ E-WARM-2（预置行）只允许**外部注入**（另起容器 / 数据面 INSERT），**Ban 改 `privacy-authorization.proof.ts` fixture 迁就实验、Ban 改 `packages/db` 任何源码、Ban `principal.ts` / `checkpoint-principal.ts`**；证明链 51 断言语义零触碰；GUC/角色语义（`privacy_issuer` / `app.principal_user` / `asPrivacyWorkerPrincipal`）在实验全程不得被实验操作改变（实验只建连跑树内现状码）。
3. **designed-red 记账**：E-WARM-1 第二遍 23505 为**设计内预期红**，必须标 `designed-red` 入账且红账保留；Ban 记为回归、Ban retry 洗绿、Ban 把设计内红挪用为「产品有 bug」或「prove 不可靠」的叙事；同时 Ban 反向洗为「必然红=已钉死」而不出示三点全等证据（错误消息 / `code:'23505'` / 键值 `…a1` 与 warm-2.log 逐字同形）。
4. **脱敏**：实验 receipt 沿用 WITHHELD 惯例——Ban 连接串/端口之外的凭据、密码、`POSTGRES_PASSWORD`、GUC 值原文入 receipt；state/logs 诊断只留字节带；teed log 落盘前不含连接串。
5. **升级路径唯一性**：`:68` 状态变化**只走 nail 阶段**——根因钉死（受控实验复现）且双审同意，经协调方 nail 方可升级（如 → `cause-pinned`）；**Ban 直接关行**；实验 EXIT=0（绿）不关 gap；「未复现」只可入账为带样本量的观察。
6. **S/SS/P 比对诚实性**：Line P 池 error 监听改变断连呈现方式、不阻止连接期拒绝；Line SS 修复限定 capped-child 容器→宿主路径，宿主 `baseEnv.PGHOST=127.0.0.1` 路径零改动——三族 Ban 互借关闭/根因（harness §2 表）；「冷启类已被 SS 间接修复」必须写为**证据不足、不可判定**，判定权归 E-COLD 实验。
7. **与 Line AH F5 门闸关系**：本 REQUEST 不替代、不放宽 F5（含 prove 目标的执行按 F5 走：`with-docker-session.sh` 先例 · cold/warm 分列预声明 · teed `PROCESS_EXIT` 三角 · N4 关闭门槛语言 · close bar N≥5 consecutive first-runs no retry 维持不动）。

Backlog `gap-bug-backlog.md:68` stays **OPEN**（mitigated/cause-unknown）。coveredCount=8 不含本 flake。UC-052 stays partial。**Ban covered** · **Ban 碰 C-PERF-TEARDOWN（`:35`）/ GAP-RAG / UC-018/052/025 任何行** · **Ban invent「已修复/已钉死/HA」**（NOT_HA 不变）。

本 stub 不授权实验执行 / prove / coding / push。pre-exec dual PASS 后由协调方另行授权；implementer 不自批。Dual PASS ≠ 实验 ≠ prove ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual 审查段 — `mw-privacy-int`（2026-10-07 · append-only · docs gate only）

**被审 REQUEST**: `78c35592` / `78c35592b5748b2c9376cc4027e49de3fc9aa12b`（`docs(privacy): REQUEST flake rootcause investigation (pre_dual)` · origin/feat/mysql-schema-skeleton 祖先 `git merge-base --is-ancestor` EXIT=0 亲证）· 执行线孪生 `6ee3bc84`（branch `line/flk-rootcause` · parent=`50423a6f` 与本 stub/harness 申报 base 逐字一致 · patch-id `2e002f7ee7523f4ebf72e07c6c23d0f37225df2f` 双侧亲算全等）
**审查基点**: origin tip `8c6860e3` · 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-flk-privacy-int`（branch `rv/flk-privacy-int`）· REQUEST 4 文件自 `78c35592` 起 `git log -- <paths>` 空 = byte-intact · 申报行号在 `8c6860e3` 复核全部有效（零漂移）
**docs-only 亲证**: 恰 4 文件全 A `+270/−0`（slice +29 · harness +156 · mw-e2e-ha stub +42 · 本 stub +43）全 `ai-docs/delivery/` · 零产品码/零 scripts/零 packages/零 package.json/零 migrations/零 `.env*`/零 SSOT（`gap-bug-backlog.md` 不在 diff，`:68` 行本体逐字仍 OPEN · mitigated/cause-unknown）/零 push
**本审纪律**: 0 prove run · 0 docker · 0 coding · 0 SSOT 写 · 0 凭据值读取 · 只读核验（`git show/log/merge-base/patch-id/hash-object/grep/sed`）+ append-only 本段 + worktree 内 commit（author `mw-privacy-int` · 禁 push）

## 审查检查表（P1–P12 · 逐项亲验）

| # | 维度 | 结论 | 亲证要点 |
|---|------|------|----------|
| P1 | REQUEST 祖先 + 孪生 | PASS | `merge-base --is-ancestor 78c35592 origin/feat/mysql-schema-skeleton` EXIT=0；`git show 78c35592 \| git patch-id --stable` = `2e002f7e…25df2f` ≡ `6ee3bc84` 同法全等；孪生 parent=`50423a6f`≡申报 base |
| P2 | docs-only / 零 SSOT | PASS | `--name-status` 4×A +270/−0 全 ai-docs；backlog 零 diff；Pins 九项三文档（stub/harness/slice）逐字一致 |
| P3 | 范围诚实（调查设计刀） | PASS | harness §0「本 commit 不跑任何实验、不跑任何 prove、不改任何产品/基建/测试码」+ §4.1 授权链（PRE dual BOTH PASS → 协调方显式授权 · E-WARM-1 单列）+ §6 Ban prove 执行；本 stub 末段「不授权实验执行/prove/coding/push」 |
| P4 | 6 实验 pre-registration | PASS | E-COLD-1（H-COLD-1 · ≤100ms×100 探针×≥5 fresh 实例 N≥500 · 反例 0/500→入账不写「排除」）· E-COLD-2（H-COLD-2 · stop/kill/无注入×3 对照 · 判读逐字三点+WITHHELD 字节带矩阵 · 反例如实入账）· E-COLD-3（H-COLD-3 · 只作放大器 Ban 单独根因）· E-WARM-1（H-WARM-1 · 同库双跑 · designed-red 条款）· E-WARM-2（H-WARM-2 · 预插行 · 首跑判读+互证）· E-WARM-3（零执行 static）；`state_bytes` 29 vs 226 保持未解释分桶 |
| P5 | 冷/暖证据锚全亲读 | PASS | flake ledger jsonl blob `272f0314e0eff8a9192c658a6a72584ae70146f4` 亲算全等·恰 29 行；historical L16 / cold-5 L18+L24 / warm-2 L6+L13+L14 `grep -n` 逐字核（三点全等：message / `code:'23505'` / `Key (id)=(…a1)`）；warm v1 两跑同 pgPort 33048（复用库）jsonl 原文在卷；`privacy-authorization.proof.ts:57-62` 裸 INSERT 无 `ON CONFLICT` 无 cleanup 亲读+grep 0 cleanup 命中；`:125-126` 固定 id `…a1/…a2` 亲读；warm-2.log 栈帧独立反证 `insertInterview@:58`/`main@:127` |
| P6 | prove 执行链锚 | PASS | `package.json:304-305` → `run-e2e-isolated.mjs privacy-authorization:prove:raw` → `packages/db/package.json:37`；runner `:2146-2173`（三连探针·90 attempt·1s 退避）/`:2152-2156`（gap 注释亲读）/`:2175-2188`（migrate 2 attempt+重探）/`:2295-2307`（`--rm -d` 动态发布端口+`docker port`）/`:2319`（post-migrate re-attest）/`:2326-2330`（pre-prove Running check+再轮询）全亲读吻合 |
| P7 | 暖类越权边界（授权根核心） | PASS | E-WARM-1/2 全外部注入+树内现状码零改动；harness §6 Ban 修产品/fixture 迁就实验 · Ban `principal.ts`/`checkpoint-principal.ts`；本 stub §2 51 断言语义零触碰+GUC/角色语义（`privacy_issuer`/`app.principal_user`/`asPrivacyWorkerPrincipal`）实验全程只读；E-WARM-2 预插 = fresh 一次性容器数据面与 fixture 同 SQL、零产品路径、§4.2「注入 run」入账、WITHHELD 脱敏约束（§4）→ 授权根安全路径成立（C-P-4 固化落账字段） |
| P8 | designed-red 记账 | PASS | E-WARM-1 第二遍 = 设计内预期红标 `class=warm-23505 (designed-red)` 红账保留；Ban 回归叙事 · Ban retry 洗绿 · Ban 反向洗「必然红=已钉死」（须三点全等）——stub §3 ≡ harness §4.4/§5 同构；任何红不触发自动重跑 |
| P9 | 历史绿证据降级预登记 | PASS* | attempt-1 账面已「不同意」（`oneshot-attempt-1.json` `exit:0` 但 log 无 `PROCESS_EXIT` · L1 保留 · FAIL `3811cf1` · JSON 自带 `notClosed/notRootCaused/oneGreenIsNotAClose/retryToGreenBanned`）；warm_v2「23505 类未被重新覆盖」+ E-WARM-3「v2 20/20 对暖类零覆盖力」+ §0 双向禁令（一次过≠根因结论 · 未复现≠排除）= 23505 坐实后 attempt-1/历史绿污染风险已如实预登记（*分布四处表述，收拢条款 C-P-6） |
| P10 | S/SS/P 比对诚实 | PASS | §2 三族分立 Ban 互借；SS 后 perf-load attempts 2/3/4 EXIT=0（SS receipt §2 machine 哈希亲读）路径 = capped-child→`host.docker.internal`→宿主 loopback（§6 e2e-ha C-3 `run-e2e-isolated.mjs` 零 diff / privacy C-5 PGHOST 注入仅 capped-child 亲读）；宿主 `baseEnv.PGHOST:'127.0.0.1'` runner `:1983` 现值亲读；「冷启类已被 SS 间接修复」= **证据不足、不可判定**，判定权归 E-COLD，未复现只入观察 Ban 升格「已修复」——落点如实 |
| P11 | `:68` 升级路径唯一性 | PASS | §4.5/§5 只走 nail（根因钉死 + 双审同意 + 协调方 nail）；Ban 直接关 / flip OPEN / 拿本 REQUEST 或实验 receipt 当关闭依据；绿≠关；`canHonestlyFlip=false`；close bar N≥5 consecutive first-runs no retry 引证 `REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-privacy-int.md:109` C3 / `:83` §3C 逐字核 |
| P12 | Pins 原值 + F5 不放宽 | PASS | NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8（构成 RAG-FUNNEL-02A..08 only · 不含 UC-052/本 flake）· ms3EqualsR4Closed=false · PG-retained · DELETE=503 · UC-052 partial · `:68` OPEN · canHonestlyFlip=false；§8 F5（with-docker-session 先例 · cold/warm 分列预声明 · teed 三角 · N4 语言）不替代不放宽；A'' 先例核：nail `62b82cc` 恰 +checklist 13/+backlog 11、attempt-2 teed L74 `PROCESS_EXIT=0` 三角一致、receipt `:76` 自述「未复现…不构成根因结论，cause 仍 unknown」逐字在卷 |

## Fail-trigger audit（11 项 · 全 0 hit）

F1 Pins 漂移 / `canHonestlyFlip` 翻转 =0 · F2 SSOT/backlog `:68` 触碰或关闭语言 =0 · F3 「一次过/未复现=根因结论」单向声明 =0（双向禁令在卷）· F4 直接关行/绕 nail 升级 =0 · F5 E-WARM-2 裸 INSERT 绕账面 / 修 fixture-产品码迁就实验的授权 =0（外部注入+§4.2 入账+C-P-4）· F6 三族互借关闭/根因（perf-load 绿外推本 gap）=0 · F7 designed-red 洗绿/回归化/弃单授权缺位 =0 · F8 凭据/密码/`POSTGRES_PASSWORD`/GUC 原文入 receipt 的设计 =0（WITHHELD 强制 · `.tmp/` gitignored `:15` 亲证）· F9 F5/close bar 松动 =0 · F10 本审发生 prove/coding/SSOT 写 =0 · F11 孪生/基点漂移未披露 =0（patch-id 双侧全等+4 文件 byte-intact）

## Blockers

无（**0 Blocker**）。

## Observations（非阻断 · 随卷）

- **OB-1** harness §3 前言「其余实验不触碰 prove 目标」与 E-COLD-2（完整冷启序列 + prove spawn 前注入记录 prove 侧错误）/ E-WARM-2（跑一遍 proof）方法面字面不符——按 §4.2「全部尝试…全台账入账」+ §8「含 prove 目标的执行按 F5 门闸走」的保守读法为准（C-P-3）；不削弱任何已申报诚实结论。
- **OB-2** E-COLD-3 无独立「判读反例」栏，以「只作放大器证据、不单独作根因」承担诚实边界；次要实验可接受。
- **OB-3** attempt-1/历史绿的暖类降级语义分布于 §0/§1.1/§1.2/E-WARM-3 四处而非单句收拢；实质齐备（P9），C-P-6 要求根因报告显式收拢。
- **OB-4** 本审基点 origin tip `8c6860e3` 较 REQUEST 申报 parent `50423a6f` 前进（期间全为 docs review commits）；4 文件 byte-intact + 代码锚零漂移亲证，非缺陷。
- **OB-5** 先例澄清：`9b8f748e`（mw-e2e-ha PASS）属 Line X 旧 REQUEST `5773243`（rootcause ledger）的 PRE 半签，非本 FLK REQUEST；本 REQUEST 的 mw-e2e-ha stub 于审查基点仍 PENDING 42 行 byte-intact。

## Conditions（C-P-1~7 · binding 随卷）

- **C-P-1** alone ≠ dual：本 PASS 仅 `mw-privacy-int` 单侧有效，不代签 peer `mw-e2e-ha`；dual 由协调方依双侧 stub 认定；Dual PASS ≠ 实验 ≠ prove ≠ nail ≠ 关闭 ≠ AUTHORIZE；EXEC 须协调方显式授权，E-WARM-1（含 prove 目标执行）单列。
- **C-P-2** 零触碰面贯穿调查全程（含 EXEC 期）：Ban 改 `apps/`/`packages/`/`scripts/`/`package.json`/migrations/`.env*`——尤其 Ban 改 `privacy-authorization.proof.ts`（fixture/断言/51 语义）· `run-e2e-isolated.mjs` · `principal.ts` · `checkpoint-principal.ts`；探针/注入脚本不入产品树（`.tmp` 或 receipt 内嵌）；实验只建连跑树内现状码。
- **C-P-3** attempt 纪律保守读法：一切触碰 prove 目标的执行——E-WARM-1 双跑（第二遍 designed-red）· E-WARM-2 单跑 · E-COLD-2 注入矩阵 run——一律 teed `PROCESS_EXIT` 三角一致 + 全台账（EXIT/UTC/容器名端口/machine 哈希/失败类）；OB-1 句不得被引用为豁免；Ban 弃单 · Ban retry-to-green · Ban 洗账 · Ban forge `PROCESS_EXIT`；非预期红不自动重跑（重跑仅双审同意的修订设计下以新 attempt 段进行）。
- **C-P-4** E-WARM-2 注入落账：预插行操作逐字入 receipt（SQL、行 id `…a1`、容器名/发布端口、UTC 时戳）；仅数据面；Ban 任何实验操作 SET/CREATE/ALTER GUC/角色；Ban 触碰开发库/开发容器；一次性 `--rm -d` 动态发布端口零共享卷用后即毁惯例不变。
- **C-P-5** designed-red 与根因语言：E-WARM-1 第二遍红标 `designed-red` 保留；任何「钉死/归一」措辞前置 = 受控复现成立 + 三点全等（错误消息 / `code:'23505'` / 键值 `…a1` 与 warm-2.log 逐字同形）；两类分立结论 Ban 强行归一；未复现只能写「当前树/当前方法未复现 + 样本量」。
- **C-P-6** 根因报告诚实收拢：逐行登记历史 EXIT=0 的暖类地位——attempt-1=不同意（`3811cf1` 缺陷保留）· attempt-2/`9b39a20`/v2 20/20/SS perf-load 绿 = fresh-path/other-path 零暖类覆盖 · Ban 引为暖类反证；若 E-WARM 坐实「复用库残留行」→ 明示 23505 根因与历史绿无冲突（其从未覆盖该类）；`state_bytes` 29/226 保持未解释分桶；三族 Ban 互借贯穿报告。
- **C-P-7** Pins 冻结 + 脱敏：Pins 原值贯穿 EXEC 全程 · `canHonestlyFlip=false` · `:68` 状态变化仅协调方 nail（钉死+双审同意）；receipt 全程 WITHHELD（Ban 连接串/密码/`POSTGRES_PASSWORD`/GUC 值原文入 receipt · teed log 落盘前无连接串 · `.tmp` 机器哈希入 receipt）。

### 中文摘要（3 行）

1. FLK REQUEST `78c35592`（孪生 `6ee3bc84` patch-id `2e002f7e` 双侧全等 · origin 祖先亲证）docs-only 恰 4 md +270/−0 全 ai-docs 零产品码零 SSOT；6 实验（E-COLD-1/2/3 · E-WARM-1/2/3）假设+方法+判读+反例逐项在卷；冷/暖证据锚（ledger blob `272f0314` 29 行 · historical L16 · cold-5 L18/L24 · warm-2 L6/L13/L14 三点全等 · `proof.ts:57-62` 裸 INSERT / `:125-126` 固定 id）全亲算吻合零漂移。
2. 授权根焦点成立：E-WARM 注入全外部数据面零产品/fixture 触碰、GUC/角色只读、designed-red 双向禁写死；23505 坐实后历史绿污染风险已预登记（attempt-1 不同意 · v2/attempt-2 零暖类覆盖）；SS 间接修复=证据不足不可判定、判定权归 E-COLD；`:68` 只走 nail、绿≠关、Pins 九项+`canHonestlyFlip=false` 原值；0 Blocker，OB-1~5 非阻断，C-P-1~7 随卷（attempt 纪律保守读法 · E-WARM-2 注入落账字段 · 根因报告降级收拢）。
3. 本 PASS = PRE-EXEC docs gate only：alone≠dual 不代签 peer `mw-e2e-ha`（stub PENDING 未触碰）；0 prove run · 0 coding · 0 SSOT · 禁 push；PASS≠实验授权≠prove≠nail≠关闭。

Verdict: PASS

---

# POST-PROVE dual 审查段 — `mw-privacy-int`（2026-10-07 · append-only · 被审对象 = 本地 `line/flk-rootcause` @ `99a5b96a`）

**被审包**: `99a5b96a` / `99a5b96af43f2fc0f1a628964fe7ffa779e715ec`（`docs(privacy): FLK EXEC rootcause experiments + report (awaiting_post_dual)` · parent `ee7563a2` 亲证 · **本地分支未推 origin 如实记录**——`git branch -r --contains 99a5b96a` 空；`ee7563a2` ∈ origin/feat/mysql-schema-skeleton 祖先 EXIT=0 亲证，origin tip 其后已被他线 docs/prove commits 前推至 `0c6c3287`，与本审对象无交集）· 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-flkp-privacy-int`（branch `rv/flkp-privacy-int` @ `99a5b96a`）
**授权链亲证**: PRE dual BOTH PASS `77dd8dd1`（本席 · C-P-1~7）+ `82f5db5c`（mw-e2e-ha · C-FLK-HA-1..8）均 ∈ `99a5b96a` 祖先（`git merge-base --is-ancestor` 双 EXIT=0）
**本审纪律**: 0 prove run · 0 docker · 0 coding · 0 SSOT 写 · 0 凭据值读取；只读核验（`git show/log/branch -r/merge-base/hash-object/shasum/grep/sed/awk`）+ append-only 本段 + worktree 内 commit（author `mw-privacy-int` · 禁 push）；本段追加前全文件 17548 字节 md5 `f81636c7db349b6c29c1027a60cd1427` byte-intact 机检锚

## 包完整性（P-INT · 亲验）

恰 **23 文件** 全 A `+2105/−0`，全在 `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/rootcause/`（`git show --name-only` 逐行 grep 反证 =0 外溢）；非 receipts 路径 diff **空**（含 `scripts/` `packages/` `apps/` `package.json` migrations `.env*`）——`run-e2e-isolated.mjs` / `privacy-authorization.proof.ts` / `principal.ts` / `checkpoint-principal.ts` 零 diff（C-P-2 ✓）；SSOT/backlog `gap-bug-backlog.md` 零 diff、`:68` 行本体逐字仍 **OPEN · mitigated/cause-unknown**（C-P-7 ✓）；实验脚本落 receipt 区非产品 `scripts/`（C-FLK-HA-5 ✓）。凭据扫描：提交 logs+report `PASSWORD/password/DATABASE_URL` 大小写不敏感 grep = 0 命中（report `:18`「0 命中」如实）；`scripts/lib.mjs` 内嵌 `meetwise_dev_password` ×3 = 树内先在明文 dev 容器口令（runner `:1985`/`:2299` 同值），零新暴露（OB-F4）。machine 哈希：`flk-machine-hashes.txt` 17 条逐条 `shasum -a 256` 复算 0 mismatch（其中 4 条引用 `.tmp` 原始组合面文件未入提交面——`ecold2-none-2/3.log` 与已提交 `none-1` byte-identical 同 sha256 `d89a0c18`、`ewarm1-doublerun.log`/`ewarm2-preseed.log` 为 per-run 已提交面的组合流，见 OB-F3）。

## 6 实验复核表（假设/判读/反例/结论四元组 · 逐实验亲算）

| 实验 | 预注册（harness §3） | 执行证据（本审亲算） | 判读一致性 | 结论 |
|------|---------------------|---------------------|-----------|------|
| E-COLD-1 | H-COLD-1 发布窗口竞态；成立=探针见 ECONNREFUSED+自愈；反例=0/500 →「本机未复现」Ban「排除」 | summary `totalProbes:500 totalTcpRefusals:0` ×5 fresh 实例；jsonl 500 行逐行在场；initdb 临时 postmaster 期 SQL `Connection terminated unexpectedly` 自愈签名非 ECONNREFUSED 独立入账 | 反例分支照预注册如实（Ban 排除守约） | **未成立（未复现 · 入观察）** ✓ |
| E-COLD-2 | H-COLD-2 TOCTOU 退场注入；成立=注入 run 逐字 ECONNREFUSED+code 同 cold-5 L18/L24 形 + 字节带可比；反例=形态≠ECONNREFUSED 如实入账 | stop-1/kill-1 EXIT=1 `PROCESS_EXIT=1` 亲读（`Error: connect ECONNREFUSED 127.0.0.1:52827/52863` + `code:'ECONNREFUSED'` @ `assertIsolatedTestTarget` isolated-test-target.ts:84 ← proof.ts:119）；对照 none ×3 EXIT=0 51 PASS；stop-band-1 keep 形同红；字节带 29/29 ≡ cold-5 `state_bytes=29 logs_bytes=29`（`--rm` 后 `docker_diagnostic_unavailable` fallback 29 字节机制在 lib.mjs:147 亲读）、217–223 ≡ historical 226 带——分桶机械成立、归因保留未解释（C-FLK-HA-2 ✓） | 成立分支按预注册上限收在「机理级受控复现（充分性）」，Ban 历史必然性守约 | **成立（充分性）· 部分钉死** ✓ |
| E-COLD-3 | H-COLD-3 负载放大；只作放大器不单独作根因（无独立反例栏 · PRE OB-2 已容） | summary `totalProbes:400 totalTcpRefusals:0` ×4 并行；jsonl 400 行在场 | 如实入观察、未升格根因 | **未成立（未复现 · 入观察）** ✓ |
| E-WARM-1 | H-WARM-1 同库双跑；成立=run1 EXIT=0 + run2 三点逐字（`interview_pkey` duplicate + `code:'23505'` + `Key (id)=(…a1) already exists`） | run1 EXIT=0 亲读（51 PASS 行亲数 · `PROCESS_EXIT=0` · sha256 ≡ 3×none 对照 byte-identical `d89a0c18` = 确定性绿旁证）；run2 EXIT=1 三点全 TRUE 亲读且 vs 历史 `warm-2.log` **L6/L13/L14 逐字全等亲证**（本席独立 `sed -n '6p;13p;14p'` 双侧）；应用帧同位亲证（pg-pool `index.js:45:11` · `proof.ts:58:3 insertInterview` · `proof.ts:127:3 main` 双侧全等；仅 workspace 路径字符串不同——report 已披露；node 内部 `task_queues` 计数 103:5 vs 95:5 差异见 OB-F2）；run2 标 **designed-red** 红账保留 · 零 retry | 成立分支 + designed-red 双向禁守约（未记回归、未 retry 洗绿、未反向洗「必然红」——三点证据在卷） | **成立（确定性）** ✓ |
| E-WARM-2 | H-WARM-2 预置行首跑；成立=首跑 23505 三点 + 与 E-WARM-1 run1 互证 | 首跑 EXIT=1 三点全 TRUE 亲读（sha256 `8abd5416` ≡ E-WARM-1 run2 byte-identical = 同机同形直接旁证）；C-P-4 落账字段**全数在卷**：预插 SQL 逐字（纯数据面 INSERT · 与 fixture `proof.ts:57-62` 同形 · 零 GUC/角色 SET/CREATE/ALTER）+ 行 id `…a1` + 容器/端口 `53304` + UTC `2026-10-07T13:58:25.038Z` | 成立分支；「与累积无关」由首跑触发+fresh run1 不触发互证完整支撑 | **成立（变因隔离）** ✓ |
| E-WARM-3 | static 零执行；产出「触发面=复用库/残留行」供双审独立复核 | 树内亲证：裸 INSERT @`proof.ts:57-62` · `ON CONFLICT`=0 · `DELETE FROM interview`/`TRUNCATE`=0 · 固定 id `…a1`@`:125`/`…a2`@`:126`（另有 6 处固定 id 调用点 `:193/:317/:330/:388/:422/:469`）；9 blob 锚 `git hash-object` 亲算（warm-2 `4ce66da1` · cold-5 `d066fcd8` · jsonl `272f0314` · attempt-1 json `8cc9db56`/log `e8d0fbe4` 全等 · zeroDrift=true）；attempt-1「不同意」语义原样（JSON `exit:0` vs log 无退出行 · FAIL `3811cf1`） | static 陈述与树一致 | **成立** ✓（报告散文「恰 2 次调用」与机检 `insertCalls:8` 相悖——见 OB-F1） |

**暖类钉死复核结论（本席核心）**：E-WARM-1 run2（同库第二遍 designed-red）+ E-WARM-2（预置行首跑）×2 确定性三点全等 + 应用堆栈逐帧同位 + E-WARM-3 静态面（固定 id × 裸 INSERT × 零 cleanup × 零 ON CONFLICT）机理性必然 + fresh 路径结构性不触发（run1 51/0 + 对照 3/3 绿）——**「机理级钉死（warm=cause-pinned）」措辞成立**，满足 C-P-5 前置（受控复现成立 + 三点全等），且与历史 warm-2.log 同形同帧归一。两类分立、Ban 归一守约。

**冷类「部分钉死」vs「Ban 直接关」一致性**：充分性实证（注入 2/2 同形 + 对照 3/3 绿 + 防线只能缩窗不能消除 check-then-use 间隙）与未钉部分（历史退场原因不可回溯 · 自然窗口 0/500+0/400 未复现）分层如实；nail 升级措辞建议 warm=cause-pinned + 冷=cause-partially-pinned 且 **stays OPEN · Ban 直接关**——与 C-P-5/C-P-11/C-FLK-HA-2/C-FLK-HA-7 全一致，无过度声明。

## attempt-1 污染风险影响裁决（C-P-6 收拢口径 · 本席裁定）

1. **attempt-1 的绿（@`5b6e693` · JSON `exit:0`/log 无退出行 · FAIL `3811cf1` 不同意保留）对暖类零证据力**——其路径为 fresh 一次性容器，结构上不进入「复用库/残留行」触发面；暖类钉死后，attempt-1 的「EXIT=0」**不构成根因反证**（report 历史绿账表第 1 行如实）。
2. **attempt-1 的绿亦不构成「当时环境干净」的证明**——fresh 路径即使库外有残留状态也结构性不触发该类，且其退出面本身不完整（`3811cf1` 缺陷在卷）；「一次过=环境干净」双向禁令下此推论 Ban。
3. **A'' attempt-1 结论降级标注裁决**：attempt-1 账面维持「不同意」原状不原地改写（append-only 纪律）；降级通过本报告历史绿账收拢专节 + 本段生效——**任何后续引用 A'' attempt-1「过」必须携带「零暖类覆盖证据力 + 非当时环境干净证明」双重标注**；nail 阶段 `:68` 行文须逐字保留「attempt-1=不同意（`3811cf1`）· 零证据力」收拢语句（CN-P-2）。
4. report 收拢表其余行（attempt-2/`9b39a20`/cold_v2/warm_v2/SS perf-load 全 fresh-path 或另一路径 · 零暖类覆盖）本席对 warm_v2「新容器非复用库」引 review `49ef158` §5 与 backlog `:68` 原文交叉核对一致——**「23505 根因与全部历史绿无冲突」收拢结论成立**（C-P-6 如约，OB-3 单点归拢达成）。

## 条件裁决（C-P-1~7 · 逐条）

| 条件 | 裁决 | 亲证要点 |
|------|------|----------|
| C-P-1 alone≠dual · EXEC 协调方授权 · E-WARM-1 单列 | **PASS** | 授权链 `77dd8dd1`+`82f5db5c` 祖先亲证；report `awaiting_post_dual` 零自批；本 PASS 仅 mw-privacy-int 单侧，不代签 peer mw-e2e-ha（其 POST 审并行、未见不评） |
| C-P-2 零触碰面贯穿 EXEC | **PASS** | 23 文件 diff 面亲验零外溢；脚本落 receipt 区；探针/注入容器唯一名+`--rm -d`+显式 env 构造（lib.mjs 亲读：不继承 shell env · stop/kill 仅指向自建容器 · 收尾 `rm -f` 自容器） |
| C-P-3 teed 三角 + 全台账 + Ban 弃单/retry | **PASS（披露偏差已入账）** | 9 次 prove 目标执行（E-COLD-2 ×6 · E-WARM-1 ×2 · E-WARM-2 ×1）全部 raw 直跑**不经 runner receipt-writer**——report `:16` 执行声明事前披露，三角改锚 teed log `PROCESS_EXIT` 行 / driver JSON exit 记录 / log 正文三点互证 + sha256；全部 17 条哈希复算 0 mismatch；designed-red ×1 照卷 · 非预期红 0 · 弃单 0 · retry 0；驱动脚本两次模块解析缺陷修于任何 docker attempt 之前（零副作用 · 披露在卷）——attempt 纪律诚实性成立 |
| C-P-4 E-WARM-2 注入落账 | **PASS** | SQL 逐字 + 行 id + 容器/端口 + UTC 时戳全在卷；纯数据面；零 GUC/角色操作；零开发库/开发容器触碰 |
| C-P-5 designed-red 与根因语言 | **PASS** | run2 designed-red 保留；「钉死」前置=受控复现+三点全等 ×2 达成；两类分立 Ban 归一守约；未复现一律「本机未复现+样本量」措辞（0/500 · 0/400 · 历史等价性未钉） |
| C-P-6 历史绿收拢 | **PASS** | 专节逐行 + attempt-1 不同意保留 + 全绿零暖类覆盖 + Ban 反证 + 单点归拢（OB-3 达成）；`state_bytes` 29/226 保持「未解释观测·只分桶」；三族互借禁令贯穿（SS 判「不可判定」保留 · perf-load 绿只作另一路径健康） |
| C-P-7 Pins 冻结 + 脱敏 | **PASS** | Pins 九项原值 + `canHonestlyFlip=false` + `:68` stays OPEN 零翻转；logs 脱敏 0 命中；`.tmp` 机器哈希入 receipt（OB-F4 卫生注记非阻断） |

## Blockers

无（**0 Blocker**）。

## Observations（非阻断 · 随卷 · nail 阶段处理）

- **OB-F1（erratum 级 · 须 nail 勘误）**：report E-WARM-3 段散文「恰 2 次调用」与其同 receipt 机检 `insertCalls: 8` 及树内实况（`insertInterview` 8 个调用点 `proof.ts:127/:128/:193/:317/:330/:388/:422/:469` · 8 个固定 id `…a1/…a2/…d1/…b1/…b6/…b7/…bc/…f3` 全裸 INSERT 无 cleanup）相悖。方向保守（低估触发面、不强化结论）——残留行机理反而更必然（第二次跑任一固定 id 即撞）；不影响钉死结论；CN-P-3 勘误。
- **OB-F2（精度注记）**：冷类「同断言点」为函数级——historical cold-5.log 栈帧 `isolated-test-target.ts:73:18` vs 复现 `:84:18`，行差由 SS coding `71a57f4b`（cloud 分支插入）机械解释、同一 `pool.query` 语句亲证，report 未申报行号漂移（其措辞未声明行号全等，非失实）；暖类帧比对中 node 内部 `task_queues` 计数 103:5 vs 95:5 差异未在「仅路径字符串不同」句中提及（应用帧全等不受影响）。nail 引用时建议一并注明。
- **OB-F3（machine 哈希覆盖面）**：`flk-machine-hashes.txt` 17 条中 4 条（`ecold2-none-2/3.log` · `ewarm1-doublerun.log` · `ewarm2-preseed.log`）指向未入提交面的 `.tmp` 组合/去重面——none-2/3 与已提交 none-1 byte-identical（同 sha256 亲证）；组合流文件须 `.tmp` 在场方可复核。提交面自身全部复核通过，非缺陷。
- **OB-F4（卫生注记）**：`scripts/lib.mjs` 内嵌 `meetwise_dev_password` ×3 = 树内先在明文（compose/env.example/CI/runner 同值），零新暴露；report「0 命中」限于 logs 如实；nail 可选择在 receipt 头注注明该值域来源以绝后患。
- **OB-F5（基点时点）**：report `:6`「ee7563a2 = origin/feat/mysql-schema-skeleton」为 EXEC 时点事实；origin 其后被 G7K/SS2/INT01 等他线 commits 前推（`ee7563a2..origin` 含非 ai-docs 文件），与本审对象（本地分支）无关，如实记录。

## Conditions（CN-P-1~4 · binding 随卷）

- **CN-P-1** alone ≠ dual：本 PASS 仅 `mw-privacy-int` 单侧有效，不代签 peer `mw-e2e-ha`；dual 由协调方依双侧 POST 段认定；钉死程度最终以 dual+nail 裁定为准；本 PASS ≠ nail ≠ 关闭 ≠ `:68` 翻转 ≠ AUTHORIZE。
- **CN-P-2** `:68` 措辞升级只走协调方 nail（双审同意）：warm=cause-pinned + 冷=cause-partially-pinned 建议措辞下 **stays OPEN · Ban 直接关**；nail 行文须逐字保留 C-P-6 收拢（attempt-1=不同意 `3811cf1` 零证据力 · 历史绿零暖类覆盖 · `state_bytes` 只分桶不归因 · 三族 Ban 互借）；可选后续刀（fixture ON CONFLICT/cleanup）独立 REQUEST 零本刀授权。
- **CN-P-3** OB-F1 勘误随 nail 落字：「恰 2 次调用」→ 8 调用点（对齐机检 `insertCalls:8` 与树内实况）；OB-F2 行号漂移注记随引用一并申报。
- **CN-P-4** Pins 全项原值冻结 + `canHonestlyFlip=false` 贯穿至 nail；零 retry · 零弃单 · 零洗账延续；Ban 借本 receipt 或本审关闭任何行。

### 中文摘要（3 行）

1. FLK EXEC 包 `99a5b96a`（本地分支未推 origin 如实记录 · 授权链 `77dd8dd1`+`82f5db5c` 祖先亲证）恰 23 文件 +2105/−0 全 receipts rootcause/ 零产品码零 SSOT、`:68` 仍 OPEN；6 实验四元组逐个亲算复核：暖类 E-WARM-1 run2 designed-red + E-WARM-2 预置行首跑 ×2 三点全等（vs 历史 warm-2.log L6/L13/L14 双侧逐字亲证 + 应用帧 `index.js:45`/`proof.ts:58:3`/`:127:3` 同位）+ E-WARM-3 静态面树内亲证（裸 INSERT · ON CONFLICT=0 · 零 cleanup · 9 blob 锚全等）——**warm=cause-pinned 成立**；冷类注入 2/2 同形 @`assertIsolatedTestTarget` + 对照 3/3 绿 + 字节带 29/29 与 217–223 机械分桶=充分性实证、历史等价不可回溯 + 自然窗口 0/500+0/400 未复现=**cause-partially-pinned 措辞与 Ban 直接关一致**。
2. attempt-1 裁决（C-P-6 口径）：attempt-1「EXIT=0」**不构成暖类反证（零覆盖）亦不构成当时环境干净证明**，账面原状保留、降级经本段生效，任何后续引用须携双重标注、nail `:68` 行文逐字保留收拢语句；C-P-1~7 逐条 PASS（C-P-3 raw 直跑不经 runner receipt-writer 事前披露、teed+JSON+sha256 三角 17 哈希复算 0 mismatch · designed-red 双向禁守约零 retry）；0 Blocker，OB-F1「恰 2 次调用」vs 机检 8 调用点 erratum 随 nail 勘误（方向保守不涉结论），OB-F2~5 非阻断。
3. 本 PASS = POST-PROVE dual 之 mw-privacy-int 单侧：alone≠dual 不代签 peer `mw-e2e-ha`；0 prove run · 0 docker · 0 coding · 0 SSOT · 禁 push；PASS≠nail≠关闭≠`:68` 翻转；追加前 17548 字节 md5 `f81636c7db349b6c29c1027a60cd1427` byte-intact 机检锚在卷。

Verdict: PASS
