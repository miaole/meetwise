# REQUEST — **GAP-PRIV-AUTHZ-PROVE-FLAKE · 根因调查** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer mw-privacy-int）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`（harness/容器/Docker 层与 attempt 纪律归口 · `scripts/run-e2e-isolated.mjs` 执行链）
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

## 请审什么（mw-e2e-ha 视角）

`:68` 两类失败（冷 `ECONNREFUSED` / 暖 `23505`）至今 cause-unknown；树内 mitigation（`waitForPostgres` 三连探针 + post-migrate re-attest + pre-prove Running check，`scripts/run-e2e-isolated.mjs:2146-2173/2319/2326-2330`）上树后零新复现，但 TOCTOU 间隙与发布窗口仍在。本刀 REQUEST = **根因调查设计**。请审：

1. **冷类实验有效性**：E-COLD-1（`docker port` 返回后 ≤100ms ×100 探针 · ≥5 fresh 实例）能否覆盖「发布窗口竞态」假设；E-COLD-2（完整冷启序列后 pre-prove 与 prove spawn 之间注入 `docker stop`/`kill`/无注入对照）与历史退场的**等价性与局限**是否如实标注；判读标准（`Error: connect ECONNREFUSED 127.0.0.1:<port>` + `code:'ECONNREFUSED'` 与 cold-5.log L18/L24 逐字同形 + WITHHELD 字节带分桶）是否可机检；`state_bytes` 29 vs 226 保持「未解释观测」不得擅自归因。
2. **attempt 纪律**：全实验全 attempt 入账（含红/弃）· EXIT+UTC 时戳+容器名/端口+machine receipt 哈希；含 prove 目标的执行（E-WARM-1）teed `PROCESS_EXIT` 行三角一致；**Ban 弃单 · Ban retry-to-green · Ban 洗账 · Ban forge `PROCESS_EXIT`**；非预期红不触发自动重跑。
3. **隔离惯例不变**：实验容器沿用 `--rm -d` · `meetwise-e2e-<pid>-<ts>` 唯一名 · `-p 127.0.0.1::5432` 动态端口 · 零共享卷 · 用后即毁；**Ban 触碰开发库/开发容器**；G3（sole stack 禁 docker-run pgvector）语义不得被实验绕过；R5-MARKED-RED banner 不作 stack truth。
4. **S/SS/P 比对与互借禁令**：三族发生点分立（宿主→发布端口 / capped-child 容器→宿主 / 运行中断连呈现）Ban 互借关闭/根因；SS 后 perf-load attempts 2/3/4 EXIT=0 零 `ECONNREFUSED`（receipt `2026-10-07-gap-perf-container-reachability-fix-prove.md`）+ `ce31d7f2` 6 组 run 只能作为「另一路径健康」引用，**Ban 外推为本 gap 冷类已修复**；「未复现 ≠ 已修复」双向写死是否成立。
5. **实验触碰面**：Ban 改 `scripts/run-e2e-isolated.mjs` / `packages/db` / `apps/` / fixture——实验全部走外部注入（docker 操作 / 数据面预插行 / 独立探针脚本不入产品树）；探针脚本落点与生命周期请在审时裁定（建议 `.tmp` 或实验 receipt 内嵌，Ban 入 `scripts/` 产品面）。
6. **诚实条款完整性**：`:68` 只走 nail 阶段升级（钉死 + 双审同意 + 协调方 nail）；Ban 直接关；绿 ≠ 关；「一次过/未复现」≠ 根因结论；Line AH F5 门闸（`with-docker-session.sh` · cold/warm 分列预声明 · teed 三角 · close bar N≥5 consecutive first-runs no retry）不替代不放宽。

Backlog `gap-bug-backlog.md:68` stays **OPEN**（mitigated/cause-unknown）。**Ban 关 C-PERF-TEARDOWN（`:35`）/ GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER / Line U docker.sock 族** · **Ban 碰 UC-018/052/025 任何行** · **Ban invent「已修复/HA」**（NOT_HA 不变）。

本 stub 不授权实验执行 / prove / coding / push。pre-exec dual PASS 后由协调方另行授权；implementer 不自批。Dual PASS ≠ 实验 ≠ prove ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual 审查段（mw-e2e-ha · adversarial evidence-honesty · docs gate only · 2026-10-07）

**审查基点**：独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-flk-e2e-ha`（branch `rv/flk-e2e-ha`，自 `origin/feat/mysql-schema-skeleton` tip `8c6860e3` / `8c6860e33d925628771acaaa9de5bc2dbaa72cb6` 建）· 被审 REQUEST `78c35592`（full `78c35592b5748b2c9376cc4027e49de3fc9aa12b`）· `git merge-base --is-ancestor` ∈ origin/feat/mysql-schema-skeleton 亲证 PASS。本审 0 prove run · 0 docker · 0 coding · 0 SSOT 写 · 0 Key 值读取 · 禁 push。

### 检查表（P1–P16 · 全部机检亲证通过）

- **P1 祖先与 docs-only**：REQUEST ∈ origin tip 祖先亲证；diff 恰 4 文件全 `ai-docs/` +270/−0（slice 29 · harness 156 · 本 stub 42 · peer stub 43）；non-ai-docs 文件数机检 = 0；零 package.json/零 migrations/零 scripts/零 packages/零 apps/零 backlog/零 SSOT 行触碰。
- **P2 line 抢跑面 = 0**：`line/flk-rootcause`（worktree `meetwise-line-flk`）`50423a6f..6ee3bc84` 恰 1 commit = REQUEST 本体；patch-id `2e002f7ee7523f4ebf72e07c6c23d0f37225df2f` 主线侧与 line 侧双侧亲算全等（孪生）；零实验执行、零 coding、零 CMD 发生。
- **P3 基线漂移机检**：`50423a6f..78c35592` non-ai-docs 文件 = 0（4 个中间 commit 全 ai-docs）→ harness/stub 申报的全部代码行号在申报 base 与实际 parent 双点均逐字有效。
- **P4 执行链锚点逐行亲读吻合**：`package.json:304-305`（prove→raw 两级链）· `scripts/run-e2e-isolated.mjs:2295-2307`（`docker run --rm -d` 唯一名 + `-p 127.0.0.1::5432` 动态端口 + `docker port` 解析）· `waitForPostgres` `:2146-2173`（容器内 psql + 宿主 `probeHostSql` · 连续 3 次成功 · 90 attempt · 1s 退避）· gap 自注 `:2152-2156` · `migrateWithRecovery` `:2175-2188`（2 attempt + 失败重探）· post-migrate re-attest `:2319` · pre-prove `docker inspect .State.Running` `:2326` + pre-prove 再轮询 `:2330`。
- **P5 fixture 面锚点**：`packages/db/test/privacy-authorization.proof.ts:57-62` `insertInterview` 裸 INSERT（无 `ON CONFLICT`、无预检、跑后无 cleanup）· `:125-126` 固定 id `…0000000000a1`/`…a2` 与 harness §1.2 逐字吻合。
- **P6 红账锚点逐字亲证**：`logs/cold-5.log` L18 `Error: connect ECONNREFUSED 127.0.0.1:33047` + L24 `code: 'ECONNREFUSED'` + L30 `state_bytes=29 logs_bytes=29`；`logs/historical-first-failure-ECONNREFUSED-69de818.log` L16 `ECONNREFUSED 127.0.0.1:33010` + L28 `state_bytes=226`；`logs/warm-2.log` L6 `duplicate key … "interview_pkey"` + L13 `code: '23505'` + L14 `Key (id)=(…a1) already exists`——三点与 harness E-WARM-1 判读逐字同形。
- **P7 台账机检复现**：`privacy-authorization-flake-ledger.jsonl` blob `272f0314e0eff8a9192c658a6a72584ae70146f4` 亲算一致 · 29 行 · 机检分类 cold 4×EXIT0+1×EXIT1 / warm 1+1 / cold_v2 10/10 / warm_v2 10/10 / prove_tip_authz 1/1 / meta 1 → 「EXIT=1 ×3（cold ×2 · warm ×1）」与 harness §1.1 表逐格吻合。
- **P8 A'' 证据链**：teed attempt-2 log L74 `PROCESS_EXIT=0` 实读；receipt `:66`（绿 ≠ 关 flake · canHonestlyFlip=false）与 `:76`（「未复现…不构成根因结论，cause 仍 unknown」）诚实自述在位；A'' nail `62b82cc` 实为 checklist +13 / backlog +11 且 gap 行原样 OPEN。
- **P9 AH 门闸衔接**：`2026-10-06-ledger-refresh.md` F1（9/9 锚）/F3（Line X 后 attempt=0）/F4（三族分界）/F5（未来 rerun 门闸）实读在位；`scripts/with-docker-session.sh` 在树；关闭门槛 cite `REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-privacy-int.md:83`（§3C N≥5 新鲜容器首跑）与 `:109`（C3）亲读一致；harness §8 明文 F5「不替代不放宽」。
- **P10 SS 事实独立复核（不信自评 · git 亲证）**：SS coding `f59c4d20` touched 恰 3 文件（`isolated-test-target.ts` / `isolated-test-target.proof.ts` / `uc018-perf-load-capped-child.mjs`）→ **`run-e2e-isolated.mjs` 零 diff 由本席独立机检证实**，宿主 `baseEnv` 路径零改动成立；SS receipt §2 attempts 2/3/4 EXIT=0（attempt-1 env-blocked 如实归因非可达性类）+ §4 零 `ECONNREFUSED` + §6 C-3/C-5 引用属实；`ce31d7f2` 6 组 run json（perf-01/load-01 × run1-3）在树。
- **P11 E-COLD-1 可执行性**：`docker port` 返回后 ≤100ms 间隔 ×100 探针 · ≥5 fresh 实例 · N≥500 · Docker Desktop 版本登记——探针预算可机检；判读「ECONNREFUSED 后同端口无人工干预自愈→成立（时延分布+复现率）」；反例「0/500 → 未复现入账 · H 未证 · Ban 写排除」双向诚实齐备。
- **P12 E-COLD-2 可执行性与对照**：完整冷启序列复现后注入 `docker stop` + 对照 `docker kill` + 无注入 ×3 对照组齐备；判读 = 与 cold-5.log L18/L24 逐字同形 + WITHHELD 字节带可比（P6 已证锚点存在可比对）；反例如实；`state_bytes` 29 vs 226 在假设句内明文标「未解释观测 · 按字节带分桶登记」零擅自归因。
- **P13 E-COLD-3 / E-WARM-1/2/3 逐个**：E-COLD-3 只作放大器「不单独作根因」在文；E-WARM-1 同库双跑 · 每遍独立 teed log + `PROCESS_EXIT`（`set -o pipefail`）· 第二遍 `designed-red` 三点全等判读 · 「不得记回归不得 retry 洗绿」在文；E-WARM-2 预插行首跑触发（变因隔离 · 仅数据面注入零产品码）；E-WARM-3 零执行 static only；§3.3 Ban 强行归一 · 未复现两类各自保持 cause-unknown。
- **P14 attempt/升级纪律**：§4.2 全 attempt 入账（EXIT+UTC+容器名/端口+machine receipt 哈希）+ teed 三角 + Ban 弃单/retry-to-green/洗账/forge `PROCESS_EXIT`；§4.4 任何红不触发自动重跑（重跑仅双审同意修订设计下新 attempt 段）；§4.1 E-WARM-1 授权单列；§5 `:68` 只走 nail（钉死+双审同意+协调方）· Ban 直接关 · 绿≠关 · 「一次过/未复现」双向 ≠ 根因结论。
- **P15 SS 间接修复落点如实（本审核心问）**：§2 三族发生点分立（宿主→发布端口 / capped-child 容器→宿主 / 运行中断连呈现）；perf-load 绿明文只能作「另一路径健康」引用，对本 gap 冷类「既不构成复现也不构成排除——证据不足既不能肯定也不能否定」；「判定权归 §3 E-COLD 实验」明文；`3d0c71e` mitigation 后零新复现如实单列且 Ban 升格「已修复」；Ban 借 SS 关 `:68` / Ban 借 P / C-PERF-TEARDOWN / docker.sock 全在 Ban 清单——**无借 SS 偷关路径**。
- **P16 Pins 原值 + 占用面**：harness §5 表与 stub Pins 表 11 项原值零漂移（NOT_HA · false · false · gR45Closed=true · coveredCount=8（构成=RAG-FUNNEL-02A..08 only）· ms3=false · PG-retained · DELETE=503 · UC-052 partial · canHonestlyFlip=false · `:68` OPEN mitigated/cause-unknown）；Ban 关 `:35`/pool-listener/docker.sock 族 · Ban 碰 UC-018/052/025 · REQUEST diff secrets 机检 0 hit；本审 append-only：本 stub 首 43 行 byte-intact 机检通过（+N/−0）。

### Fail-trigger audit（F1–F8 · 0 命中）

F1 REQUEST 非 docs-only → 0 hit（P1）。F2 本 commit 含实验执行/prove/CMD → 0 hit（P2 孪生 patch-id + 零 diff 产品面）。F3 SSOT/backlog 行翻转 → 0 hit（diff 无 `gap-bug-backlog.md`）。F4 retry-to-green / 一次过=根因措辞 → 0 hit（双向 Ban 在文且判读反例强制「未复现」语义）。F5 借 SS/perf-load 绿外推冷类修复 → 0 hit（P15）。F6 Pins 漂移 / canHonestlyFlip=true → 0 hit（P16）。F7 secrets/Key 物料 → diff grep 0 hit。F8 forge `PROCESS_EXIT` / 洗红账 → 0 hit（§4.2 Ban + P8 红账原样）。

### Blockers

**0 Blocker。**

### Conditions（C-FLK-HA-1..8 · 随卷绑定）

- **C-FLK-HA-1 docs gate 界定**：本 PASS 仅授信 REQUEST 调查设计文档；PRE dual PASS ≠ 实验执行 ≠ prove ≠ coding ≠ nail ≠ 关闭；执行须协调方显式授权实验包（E-WARM-1 单列），implementer 不自批。
- **C-FLK-HA-2 E-COLD-2 判读上限**：注入成立只能写「机理级受控复现」（充分性）；Ban 升格「历史冷失败必然由此机理导致」，除非 EXEC 期补充退场时点等价性证据；`state_bytes` 29 vs 226 全程「未解释观测」只分桶不归因。
- **C-FLK-HA-3 attempt 纪律绑定**：探针实例/注入 run/proof 双跑全台账；含 prove 目标执行 teed `PROCESS_EXIT` 三角一致；Ban retry-to-green · Ban 弃单 · Ban 洗账 · Ban forge；非预期红如实入账不触发重跑。
- **C-FLK-HA-4 判读双向诚实**：E-COLD-1 0/500 记「本机该 Docker 版本未复现」Ban 写「排除」；实验全绿/全红都只入账观察 + 样本量；绿 ≠ 关 · 「一次过/未复现」双向 ≠ 根因结论。
- **C-FLK-HA-5 触碰面与隔离惯例**：Ban 改 `run-e2e-isolated.mjs`/`packages/db`/`apps/`/fixture；探针脚本 `.tmp` 或 receipt 内嵌（Ban 入 `scripts/` 产品面）；容器 `--rm -d`/唯一名/动态端口/零共享卷/用后即毁；Ban 碰开发库/开发容器；G3 fail-closed 与 `E2E_ISO_STACK_NOTE` 零绕过 · R5-MARKED-RED banner 不作 stack truth。
- **C-FLK-HA-6 互借禁令全程**：SS/perf-load 绿只作「另一路径健康」引用；判定权归 E-COLD；Ban 借 SS/P/C-PERF-TEARDOWN/docker.sock 族关闭 `:68` 或定根因；Ban 外推。
- **C-FLK-HA-7 Pins 冻结与升级**：Pins 11 项原值全程不动；`canHonestlyFlip=false`；`:68` 只走 nail 阶段（双审同意 + 协调方）；AH F5 与 N≥5 关闭门槛不替代不放宽。
- **C-FLK-HA-8 锚点漂移防护**：执行授权时点若主线 tip 前移，§1/§2 引用行号与 blob 锚须对授权 tip 重做 0-drift 机检后方可开跑。

### 观察（非阻断）

- **OB-1**：stub/harness 申报 base/parent tip `50423a6f`，实际 git parent 为 `b85b3b90`（中间 4 commit 全 ai-docs · `50423a6f..78c35592` non-ai-docs=0 亲证）——行号有效性不受影响，沿 C-FLK-HA-8 防护。
- **OB-2**：两份历史冷 log 出自不同 workspace 路径（`meetwise-lineB` vs `mw-rv-69de818`），环境出身不同构——E-COLD-2 判读已锚定 cold-5.log 单一正典形态，字节带分桶可容纳，不需要改文。

### 三行中文摘要

1. 六实验（E-COLD-1/2/3 + E-WARM-1/2/3）假设/方法/判读/反例逐个机检齐备：探针预算 ≤100ms×100·≥5 fresh 可机检，TOCTOU 注入含 stop/kill/无注入对照，E-WARM-1 designed-red 三点全等且判读锚（cold-5 L18/L24 · warm-2 L6/L13/L14）本席逐字亲证在档。
2. SS 间接修复落点如实：`run-e2e-isolated.mjs` 零 diff 经本席 git 独立亲证（非信自评），perf-load 绿只能作「另一路径健康」，判定权归 E-COLD，无借 SS 偷关 `:68` 路径；state_bytes 29 vs 226 与发布窗口分布两观测均留实验钉零擅自归因。
3. `:68` 只走 nail、Ban retry-to-green、「一次过=根因」双向 Ban、Pins 11 项原值 + canHonestlyFlip=false 全部如实；line 抢跑面 0（孪生 patch-id 全等）· 0 Blocker · C-FLK-HA-1..8 随卷 · alone≠dual 不代签 peer mw-privacy-int。

Verdict: PASS

---

# POST-PROVE dual 审查段（mw-e2e-ha · adversarial evidence-honesty · 2026-10-07）

**被审对象**: exec `99a5b96a`（full `99a5b96af43f2fc0f1a628964fe7ffa779e715ec`，`line/flk-rootcause` tip · 本地分支未推 origin，如实记录以本地为被审对象）· parent `ee7563a2` · author mw-core · 本审独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-flkp-e2e-ha` @branch `rv/flkp-e2e-ha` · 本审零 prove 零 docker 零产品码零 SSOT 写 · alone≠dual 不代签 peer mw-privacy-int（并行未读未评）。

## §P0 包完整性与 append-only 机检（本席 git 亲算）

1. exec diff 恰 **23 文件 +2105/−0**（diff-tree 计数 23 · non-ai-docs=0）· 显式 `git diff ee7563a2 99a5b96a -- scripts/ packages/ apps/ package.json` 空 —— **零产品码零 SSOT**（backlog/checklist/matrix/register 不在 23 文件内）。
2. 本席 PRE 段 append-only 保留：PRE 版（`b0cb747a`，15749 字节，sha256 `0c3ed81f…aa6f`）与 line 分支镜像 `82f5db5c` 同路径文件 **byte-identical（cmp 空）**；exec tip 版文件与本席 PRE 版 **前 15749 字节 prefix 全等（cmp -n 通过）= append-only 保留机检通过**，tip 上本文件无任何非本席追加。
3. 祖先内 `ee7563a2`（Line SS2 · `scripts/run-e2e-isolated.mjs` :5-6 注释 2删/2增）为**另一 line 的独立刀**（自带双审 PRE + 自身 receipt），非本包 23 文件；**2删/2增行数中性** → 本席 PRE 所锚 runner 行号（:1840/:1976-1988/:2123-2127/:2146-2173/:2164/:2313-2314 等）零漂移，本席 @tip 逐点抽验全中。
4. `flk-machine-hashes.txt` 17 条目中 **13 条可对提交面逐条 sha256 亲算全中、0 错**；4 条指向未提交文件（见 §P4 OB-3）。

## §P1 六实验复核表（本席独立重算 · 非信自评）

| 实验 | 本席机检锚 | 申报 | 裁决 |
|------|-----------|------|------|
| E-COLD-1 | `ecold1.jsonl` 500 行亲析：tcp `{ok:500}` · idx 恰 100×5 · 0 拒绝；sql `Connection terminated unexpectedly` ×47 独立入账（initdb 临时 postmaster 相，~0.9–1.0s 自愈，非 ECONNREFUSED 签名）；log 时戳与 summary bootMs 249/254/384/263/289 · firstTcpOkMs 3/0/1/0/1 · firstSqlOkMs 934/1034/926/928/1042 逐格吻合；驱动脚本头注预注册「0 refusals => not reproduced…NOT an exclusion」 | H-COLD-1 未成立 · 0/500 · 本机未复现（样本 500×5 fresh）· Ban 写排除 | **诚实成立**（反例分支命中如实入账） |
| E-COLD-2 | summary 6 attempt 全录：stop-1/kill-1 EXIT=1 state/logs **29/29**；none-1/2/3 EXIT=0 217–218/8714；stop-band-1（keep）EXIT=1 223/8732；stop-1 teed log 逐行亲读：`Error: connect ECONNREFUSED 127.0.0.1:52827`+`code: 'ECONNREFUSED'`+`assertIsolatedTestTarget(:84:18 ← proof.ts:119)`+ELIFECYCLE+`PROCESS_EXIT=1`；注入时机=pre-probe 三连探针+Running 检查全过之后、prove spawn 之前（脚本 :42-47 亲读） | 机理级受控复现成立（**充分性**）· 与 cold-5 L18/L24 同形 · 对照 ×3 全绿 · **Ban 升格必然** | **在 C-FLK-HA-2 上限内成立**（部分钉死=充分性钉、必然性明示未钉） |
| E-COLD-3 | `ecold3-load4.jsonl` 400 行亲析：tcp `{ok:400}` · 4 实例×100 · firstTcpOkMs {3,2,1,1}ms · firstSqlOkMs {826,1022,1126,1227}ms · 0 拒绝 | H-COLD-3 未成立 · 0/400 · 仅入账观察不作根因 | **诚实成立**（放大器不单独根因如约；prose 数值漂移见 OB-2） |
| E-WARM-1 | run1 EXIT=0 51 PASS/0 FAIL threePoint 全 false；run2 EXIT=1 threePoint 全 TRUE（run2 log L6/L13/L14 亲读：`duplicate key … "interview_pkey"`+`code: '23505'`+`Key (id)=(…a1) already exists.`）· 堆栈同位 pg-pool `index.js:45`→`insertInterview proof.ts:58`→`main :127` 与 warm-2.log 逐帧同位（仅 workspace 路径串异，本席 PRE OB 已预容）· port 53199 | designed-red 照卷 · Ban 回归 · 未 retry | **诚实成立**（red 保持 red · 台账零 retry 痕迹） |
| E-WARM-2 | summary run1 EXIT=1 threePoint 全 TRUE · 首跑即触发 · port 53304；预插 SQL 逐字在 `ewarm.mjs:46-47`（与 fixture proof.ts:57-62 同形 · id …a1 · 零 GUC/角色 DDL） | H-WARM-2 成立 · 触发=库内同 id 行在库 · 与 E-WARM-1 run1 互证 | **成立**（fresh 不触发/有残留必触发，2/2 确定性） |
| E-WARM-3 | summary zeroDrift=true 本席复算：4 blob 锚 @tip 亲算全中（cold-5 `d066fcd8`/warm-2 `4ce66da1`/historical `db8ade3b`/ledger `272f0314` 恰 29 行）；attempt-1 双 blob `8cc9db56`/`e8d0fbe4` 全中 · FAIL commit `3811cf1` 在树；fixture 面：`insertInterview`@:57 裸 INSERT · ON CONFLICT=0 · `DELETE FROM interview`=0 · TRUNCATE=0 · 固定 id :125/:126 | static 边界 · 「跑后残留行在库」结构性成立 | **成立**（prose「恰 2 次调用」与机面 8 见 OB-1） |

历史红账锚抽验全中：cold-5 **L18** `Error: connect ECONNREFUSED 127.0.0.1:33047` / **L24** `code: 'ECONNREFUSED'` / **L30** `state_bytes=29 logs_bytes=29`；warm-2 **L6/L13/L14** 三点逐字；historical **L16** `:33010` / **L28** `state_bytes=226 logs_bytes=29`。runner/fixture 锚 @tip：`:1840` 容器名模板 / `:1976-1988` baseEnv / `:2123-2127` probeHostSql / `:2146-2173` waitForPostgres / `:2164` READY 行 / `package.json:304-305` / `proof.ts:57`·`:125-126` 全中。 Secrets 机检：提交日志 grep `PASSWORD/password/DATABASE_URL` = **0 命中**。

## §P2 C-FLK-HA-1..8 逐条裁决（本席条件 · POST 裁定）

| 条件 | 裁决 | 依据（本席亲算） |
|------|------|------|
| C-FLK-HA-1 docs gate 界定 | **守约** | 23 文件全 receipts+report；`executed:awaiting_post_dual` · 零 nail 零关闭零授权自封；Pins 头注原值；flip 语言扫描 0 hit |
| C-FLK-HA-2 E-COLD-2 判读上限=充分性 Ban 升格必然 | **守约** | 「机理级受控复现成立（**充分性**）」+:44/:78 两处显式 Ban「历史必然由此机理导致」；冷类标「**部分钉死**」并明列未钉部分（历史退场原因不可回溯·自然窗口未复现）——「部分钉死」措辞正是充分性上限的诚实表达，未越权升格必然。暖类「钉死（机理级·**本机/本树实证**·确定性 2/2）」在 §3.2 预注册判读内且明示本机范围，不属本条 Ban 面 |
| C-FLK-HA-3 attempt 纪律 | **守约** | prove 目标执行恰 ×9（E-COLD-2×6+E-WARM-1×2+E-WARM-2×1）=C-P-3 自算吻合 · 全台账零弃单零 retry · designed-red run2 保持红未洗 · teed 三角（PROCESS_EXIT 行/driver JSON/sha256）在卷 · 脚本缺陷两次**docker 前零副作用**修正有披露 |
| C-FLK-HA-4 判读双向诚实（designed-red 双向禁） | **守约** | 0/500+0/400 三处（:33/:50/:78）写「本机未复现+样本量」且显式「观察，非排除」，脚本头注预注册 NOT-an-exclusion；designed-red 双向禁两侧均守（未记回归/未 retry 洗绿）；绿≠关全卷一致。prose↔机面三处数值/事实漂移降级为 OB-1/OB-2（方向均为低估面·不抬结论） |
| C-FLK-HA-5 触碰面与隔离惯例 | **守约** | 零产品 diff 双重亲证（包级+显式 product 路径 diff 空）；驱动脚本落 receipts 区非 `scripts/`；lib.mjs 亲读：`--rm -d`·唯一名·`-p 127.0.0.1::5432`·GUC token·零共享卷·用后清理；baseEnv 零 shell 继承；E-WARM-2 预插纯数据面（仅 INSERT，零 GUC/角色） |
| C-FLK-HA-6 互借禁令全程 | **守约** | SS 间接修复判定保留「**不可判定**（证据不足）」且判定权自认归 E-COLD；perf-load 绿只作「另一路径健康引用」；§历史绿账收拢逐行分类（attempt-1 不同意保留·attempt-2/9b39a20/v2×20 全判「零暖类覆盖」）· 无一历史绿被借作暖类反证或 `:68` 关闭证据 |
| C-FLK-HA-7 Pins 冻结 + `:68` 只走 nail | **守约** | Pins 九项+`canHonestlyFlip=false` 原值在头注；backlog :68 **零 diff**（23 文件外）且 tip 实读仍 `OPEN · mitigated/cause-unknown`；§`:68` 建议处置明标「仅建议·翻转在 nail·双审同意·stays OPEN·Ban 直接关」 |
| C-FLK-HA-8 锚点漂移防护 | **守约** | 4 blob 锚+attempt-1 双 blob+FAIL commit 本席 @tip 亲算全中；cold-5 L18/L24/L30 · warm-2 L6/L13/L14 · historical L16/L28 逐行亲读全中；runner/fixture 行锚全中；SS2 :5-6 行数中性零漂移（本席 cmp 亲证） |

## §P3 两未解释观测裁决 + E-COLD-1/3 反例分支

1. **state_bytes 29 vs 226 分桶**：机面成立——29 字节 fallback 串 `docker_diagnostic_unavailable` 本席数 `lib.mjs:147` 恰 **29 字节**；--rm 注入 ×2 实测 29/29、在场对照 217–218、keep 退场 223（217–223 带内）· 历史 29/29=移除桶、historical 226=在场 State JSON 带，**state_bytes 轴差异由机械分桶覆盖**；「历史各 run 容器为何退场仍不可回溯」按约保留为未解释（只分桶不归因）。残余诚实注记：historical 行 (state=226, logs=29) 的「state 在场+logs fallback」组合未被新矩阵任一 attempt 实现过（新面：在场→8.7k，移除→29/29）——见 OB-4，报告「完全覆盖」应按其所写范围（state 带差异）理解。
2. **端口发布窗口分布**：firstTcpOkMs 实测 E-COLD-1 {3,0,1,0,1}ms、E-COLD-3 {3,2,1,1}ms，全 ≤3ms · 0/900 拒绝（500+400 本席复算=申报 0/900 一致）；报告按预注册记「观察·非结论」未作窗口不存在结论。prose 两处数值漂移见 OB-2。
3. **E-COLD-1/3 反例分支诚实性**：反例分支（0/500+0/400 未复现）被**如实呈现为「观察非排除」**——报告 :33（「Ban 写『排除』」）/:50（「仅入账观察，不作根因」）/:78（「观察，非排除」）三处在卷 + 驱动脚本头注预注册同文；「H-COLD-1/3 未成立」以反例分支命中明标。**裁决：诚实**。

## §P4 观察台账（非阻断 · nail 阶段勘误项）

- **OB-1**（prose↔机面）：report :70「恰 2 次调用」vs 机面 `ewarm3-static-summary.json insertCalls=8`（本席 grep 树内恰 8 处 `await insertInterview(`：:127/:128/:193/:317/:330/:388/:422/:469）；该句仅出自 exec prose（harness/REQUEST 无此句）。方向=低估残留面（8 个固定 id 均残留），「残留行在库」结论 a fortiori 不动摇；nail 勘误为「恰 8 次调用（8 固定 id）」。
- **OB-2**（prose 数值漂移）：report :49「firstTcpOkMs 0–2ms · firstSqlOkMs ~0.8–1.0s」vs 机面 {1,2,1,3}ms 与 {826–1227}ms；端点各差 1ms/~0.2s，零结论影响，nail 勘误。
- **OB-3**（哈希台账完备性）：manifest 17 条中 13 条对提交面全中；4 条未提交——`ecold2-none-2/3.log` 与 none-1 **同哈希 `d89a0c18`**（内容由哈希同一性间接作证）；`ewarm1-doublerun.log`/`ewarm2-preseed.log`（driver master log）不在提交面 → C-P-4 的 UTC 时戳 `13:58:25.038Z` 仅 report prose 在卷（其源 log 未提交），SQL 逐字/行 id/容器/端口由提交面脚本+summary 独立在卷；另 manifest 未覆盖 ecold1.log/2×ecold3/5 脚本/report（脚本为原生面不为副本，影响限于 manifest 完备性表述）。
- **OB-4**（分桶边界）：historical (226, 29) 组合未被新矩阵复现；「完全覆盖」精确成立域=state_bytes 轴差异；logs 轴该组合与「顺序诊断遇上移除竞态」相容但未演示——按「只分桶不归因」保留，不得在 nail 引为已解释。
- **OB-5**（措辞）：「逐字同形」复合词以「同形」为义（括注自限定：同错误行**形态**/同断言点/同 EXIT）；实际字节差异=端口/errno/workspace/帧行号（`assertIsolatedTestTarget` 历史 :73 vs 现 :84，同函数不同行、文件演进所致，本席 :84 实读确认在函数体内）。
- **OB-6**（方法透明）：`runProveRawTeed` 用无 `-a` 的 `tee` 截断 attempt log，committed per-attempt log 中 driver READY/MIGRATE 前言行被覆盖不存（审计连续性由 driver JSON summary 承担，`preProbePassed=true` 已入账）。

## §P5 Blockers

**0 Blocker。**

## §P6 Conditions（随卷 · nail 阶段约束）

- **C-FLK-HA-1..8 原文全部继续有效**并绑定 nail（上表逐条已 POST 裁定守约，不解除）。
- **C-FLK-HA-9（新增）**：nail 阶段对 `:68` 或任何后继文书引用本 receipt 时，须并入 OB-1/OB-2 勘误（「恰 8 次调用」、E-COLD-3 数值），Ban 原样转录错误 prose。
- **C-FLK-HA-10（新增）**：nail 措辞须保持四分诚实结构：暖类 cause-pinned（本机实证）/ 冷类 cause-partially-pinned（充分性）/ 历史等价性未钉 / 自然窗口未复现≠排除；四者不得合并、不得省略限定词。
- 沿例：本 PASS≠nail≠`:68` 翻转≠关闭≠AUTHORIZE；`alone≠dual` 不代签 peer mw-privacy-int；Ban push。

## §P7 三行中文摘要

1. 包完整性成立：exec `99a5b96a` 恰 23 文件 +2105/−0 全 receipts 零产品码零 SSOT，本席 PRE 段（`b0cb747a`≡镜像 `82f5db5c` byte-identical）在 tip 上 prefix 全等 append-only 保留，祖先内 SS2 `ee7563a2` :5-6 行数中性不触本包行锚。
2. 六实验机面全部本席独立重算吻合（0/500+0/400 反例分支三处如实「观察非排除」·E-COLD-2 充分性上限「部分钉死」措辞守约未升格必然·designed-red 保持红未 retry·哈希 13/13 全中·历史红账锚 L18/L24/L30/L6/L13/L14/L16/L28 逐行亲中）；state_bytes 分桶 29 字节 fallback 机面坐实且归因按约保留未解释。
3. 0 Blocker · 观察 6 条非阻断（prose「恰 2 次」vs 机面 8 为最大项）· C-FLK-HA-1..8 全数守约并携 C-FLK-HA-9/10 勘误新条件入 nail · `:68` 仍 OPEN 零 diff · Pins 零漂移 canHonestlyFlip=false · alone≠dual 不代签 mw-privacy-int · 0 prove run · 0 docker · 0 产品码 · 禁 push。

Verdict: PASS
