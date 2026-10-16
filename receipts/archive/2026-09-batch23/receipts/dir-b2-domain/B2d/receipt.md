# B2d 批收据 — DIR-1 B2 domain 目录拆解刀（第 4/19 批）

**Batch**: B2d（§5 表 B2d 行 rev3 对调后：transcript/ 域 2 文件）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-09）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md` @ `1f08942a`（rev3 · pre_exec_dual BOTH PASS · 协调方 EXEC 授权面内机械执行）
**Base tip**: `e2834082` · **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批 B2a @ `196c8984` · B2b @ `d41b7c41` · B2c @ `442b1af6`）
**Commit**: 本批一 commit（见交付报告 hash）· releaseEvidence=false · NOT_HA

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **通用律 0 三查**：`git fetch origin` 后开批 HEAD 与 `origin/line/dir-b2-domain` 对齐零分叉（B2c @ `442b1af6`）；SOP 沿 B2a–B2c；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线/r4 面零触，本批改动面见 §1）。
- **漂移预检（fresh 亲跑）**：`git diff e2834082 origin/feat/mysql-schema-skeleton -- packages/db/src` = **仅 `packages/db/src/recruiter.ts` +25/−2**（G7FIX-4 mark-then-recover 单触点 · B2b/B2c 收据同面复现，无新增变化）——与本批面（int-transcript/projection 系）**零交集** → 不停手，照常执行，本节登记。
- **漂移面扩至本批文件判定**：B2c §3 移交关注「若 drift 扩至新文件即批内文件被漂移触碰 → 停手上报」——实测未扩（仍单文件 recruiter.ts），未触发。

## 1. 批内文件清单与 mv 证据（§5 B2d 行：int-transcript.ts(285行) · int-transcript-projection.ts(105行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/int-transcript.ts` → `packages/db/src/transcript/int-transcript.ts` | `R098` = R100 + **①类 4 行**（:18 principal 锚 · :20 ids 锚 · :21 checkpoint-privacy **未移平铺件**（B2g 批）· :22 interview-answer-dual-write **未移平铺件**（B2l 批）各加 `../` 前缀；`git show HEAD:` blob 对树逐字节 diff 仅此 4 行 · 引号外逐字节相同） |
| 2 | `packages/db/src/int-transcript-projection.ts` → `packages/db/src/transcript/int-transcript-projection.ts` | `R099` = R100 + **①类 1 行**（:23 principal 锚 `../` 前缀；blob 直比仅此一行） |

**白名单随批改（B2d 实面 · §3 四类对账 · staged 面 = 2 mv + 6 文件，零第八方 · ④ 类实面 = 0 与 §5 行「外部串改点：无」吻合）**：
- **① 包内 import（9 处）**：移动件自引改 5（int-transcript ×4 = principal/ids 锚 + checkpoint-privacy/interview-answer-dual-write 未移平铺件；projection ×1 = principal 锚）+ 消费件 4 = src 1（`packages/db/src/uc052-internal-erasure.ts:15` `'./int-transcript-projection.ts'`→`'./transcript/int-transcript-projection.ts'` · 未移平铺件指移动件规则 · 即 §1.1 projection inSRC=1 那一户）+ db test 直引 3（`uc052-external-sink-async-purge.proof.ts:26` · `uc052-external-sink-retention.proof.ts:28` · `uc052-internal-erasure.proof.ts:23` 各 `'../src/…'`→`'../src/transcript/…'`——即 §5 B2d 行注记「uc052 proofs import 属 ① 类随批改」实面，亦属 §1.2 M3 六文件须随批改集合的本批切片）。int-transcript inSRC=0 实测复核成立（全仓无 `from '…/int-transcript.ts'` import 面，仅注释裸名，见 §5 判留）。
- **② 桶 re-export（4 处）**：`packages/db/src/index.ts:309/:313`（int-transcript）· `:318/:321`（projection）specifier 加域前缀；tenant 2 行与全部导出名零改。
- **③ runner receipt（12 处 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：int-transcript ×8（:1022 db-id-v7 · :1314 int-transcript-preview-submit:http · :1320 int-transcript-answer-fact-root · :1337 int-answer-dual-write-fence · :1369 scor-01 · :1383 scor-02 · :1399 scor03-evidence-conflict · :1416 growth）+ projection ×4（:936 uc052:internal-erasure · :948 uc052:external-sink-retention · :959 uc052:external-sink-async-purge · :1346 int-transcript-remaining-sinks）；**awk 靶映射亲证 12/12 与 §5 B2d 行 rev3（R7 对调后）靶列吻合**（int-transcript 8 靶 · projection 4 靶含 int-transcript-remaining-sinks）；`node --check` PASS；改后 `grep -nE "packages/db/src/(int-transcript|int-transcript-projection)\.ts['\"]" runner` = **0 命中**；全仓旧路径串 `git grep`（binary-aware）= **0 行**。
- **④ 仓内机械串（0 处）**：全仓 binary-aware 扫描两文件名——apps/domain/qdrant-store/scripts（runner 外）/tenant-wiring manifest 均无命中（蓝图 §1.1 ext=1 各为裸主题名/靶名消费，非路径串，零改面）→ §5 B2d 行「外部串改点：无」实测复核成立。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：`pnpm install --frozen-lockfile` 幂等 EXIT=0（node_modules 在树 · lockfile 零改）· `pnpm db:up` 幂等（meetwise-postgres-dev Up healthy）。`.env` ABSENT 盘上亲证。

| 门 | 键 | 批前基线 | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R098+R099 rename 检出 · blob 直比 Δ=4/Δ=1 行（全 ① 类）· `node --check` PASS · 批内+全仓残留 grep=0（runner 旧串 0 · 全仓旧全路径串 0 · 相对旧 specifier 0）· runner 12 hunk 全在 :93–:1640 块内 · `git diff --quiet pnpm-lock.yaml` | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 同形：diff 仅 `.tmp/e2e-platform-loop-<rand>/<ts>-<uuid>.json` 临时回执路径（outcome/exitCode/steps/rounds 全同） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红**：输出逐字节相同（e2e_parity_inventory invalid · e2e/ 树 Ban 区零触） |
| G2 | tsc `packages/db` | EXIT=2 · sha256=f7c970b09cebcc3c7189e03ebbd8904271ea9f19b1495cdcd224d9c498deeb9b | 同 sha | 错误集逐字节 ≡ 基线（≡ B2a/B2b/B2c 记录 · **四批连续性**；基线错误集零 int-transcript 路径提及，sha 无位移面） |
| G2 | tsc `apps/api` | EXIT=2 · sha256=196049ecca4c56b71766ff9df7c439526abc8a3941e57a5ae2bd2761d91b4242 | 同 sha | 同形 |
| G2 | tsc `apps/worker` | EXIT=2 · sha256=6dae8b2dbca59169c64d9376e1999ef9fdbe0a6cb2ec1070851ddca1bfb32830 | 同 sha | 同形 |
| G3 | `prove:int-transcript-answer-fact-root`（直跑键 · proof :99 `assertIsolatedTestTarget` ⇒ 唯一合法完成形态 = runner `int-transcript-answer-fact-root:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿**：规范化（一次性容器名/随机端口/receipt 时间戳 uuid）后 PASS 序列逐行相同 |
| G3 | `prove:int-transcript-remaining-sinks`（直跑键 · 同上经 runner `int-transcript-remaining-sinks:prove:raw`） | EXIT=0 | EXIT=0 | 绿保持绿：同上规范化同形 |
| G3 | `prove:int-answer-dual-write-fence`（直跑键 · 同上经 runner `int-answer-dual-write-fence:prove:raw`） | EXIT=0 | EXIT=0 | 绿保持绿：同上规范化同形 |
| G3 | `int-transcript-preview-submit:http:prove:raw`（**base 红候选（§4 E5 interview_privacy_fenced 族）· 协调方 B2d 指令「base 红族批前实测登记」→ 批前亲跑实测**） | **EXIT=0（实测绿 · 非红）** | **EXIT=0** | 绿保持绿：同上规范化同形——蓝本红候选预期与实测不符时按 §0.1-3「以批前实测为准」登记为绿原值；privacy_fenced 族真红靶（runtime-role）不在本批 12 靶面，仍归 E5 清单由后续批/sweep 对表 |
| G3 | receipt ENOENT 观察 | runner 四靶 `LOCAL_ISOLATED_PROOF_RECEIPT` 各产出 1 只（pre `…T12-15-00…`/`…T12-15-07…`/`…T12-15-14…`/`…T12-15-23…`） | 各产出 1 只（post `…T12-17-20…`/`…T12-17-28…`/`…T12-17-38…`/`…T12-17-50…`） | **ENOENT=0 双向成立（8/8 产出正常 · release_evidence=false 标注一致）；post 4 只 sourceDigests 键亲证解析新路径 `packages/db/src/transcript/int-transcript{,-projection}.ts`（③ 类改写正确性机械证据 · E4 反面教训闭环）** |

**attempts 全账（Ban retry-to-green · 无重试刷绿）**：批前批后各一轮、逐键一次完成（runner 4 靶 ×2 = 8 次计入对表，非重试）；本批无红直跑键，零重跑。

## 3. Base 漂移处置结果

见 §0：漂移仅 recruiter.ts +25/−2（skeleton 线 G7FIX-4 · B2b 起三批同面无新增），与本批文件/白名单面**零交集** → 未触发停手红线，照常执行 + 本收据登记。后续批（B2e+）开席仍须 fresh 重跑漂移预检。

## 4. 停止条件核查（沿 B2a–B2c a–e）

| 条件 | 核查 | 结果 |
|------|------|------|
| a) 落位与 §2 映射冲突 | §2 transcript/：int-transcript · int-transcript-projection 两件 → `transcript/<名>.ts` | 未命中 |
| b) 门红非预登记 base 红族 | 全部红（parity · tsc×3）均为批前实测 base 红原值且批后同形（parity 逐字节 · tsc sha 四批连续）；G3 四靶批前实测全绿（含 E5 红候选亲跑实测为绿的原值登记） | 未命中 |
| c) 需触批外文件 | 改动面 = 2 mv + 6 文件白名单行（index.ts · runner · uc052-internal-erasure.ts · uc052 三 proof 均为 §5 B2d 行/§3 白名单登记面）；staged 面亲证 8 条目无第八方 | 未命中 |
| d) 漂移预检红线 | 漂移仅 recruiter.ts（B2c 已消化面），与本批零交集 | 未命中 |
| e) 环境 ANY 串改逻辑 | 全部改动 = mv + 引号串内路径前缀（逐 hunk 亲核 · 移动件 blob 直比 Δ=4/Δ=1 行） | 未命中 |

## 5. Ban 纪律登记

- **Ban 7**：`.env` ABSENT（盘上亲证）· MODEL_API_KEY/MODEL_BASE_URL 每次 prove/runner/tsc 调用均 `env -u` 剥离 · Key name-only 零打印零落盘 · est 0 live 模型调用。
- **Ban 2 锚区**：7 锚 + tenant/ 零触（index.ts 仅 :309/:313/:318/:321 四 specifier 行 · tenant 2 行与 `barrelTenantReexports===2` 断言零改 · 两移动件的 `../principal.ts`/`../ids.ts` 为移动件自身 import 前缀改，锚本体零触）· migrations/** 零触 · e2e/ 树零触 · G7 面零触（runner 数组内 db 串除外）。
- **Ban 3**：runner 仅 isolatedReceiptSources 块内 12 串改写（12 hunk 行号 936–1416 全在 :93–:1640 · `git diff -U0` 亲证）；target 名/数组结构/命令 map（:1943–1950 int-transcript 系命令映射亲证未触）/块外零改。
- **Ban 6**：零 shim/转发层。
- **Ban 10 S1 判留八处复述登记**（本批零新增判留；**S1 第 1 处随本批 mv 位移登记**）：
  1. `packages/db/src/int-transcript.ts:7` → **本批后物理位置 `packages/db/src/transcript/int-transcript.ts:7`**（src 注释内 `packages/db/src/privacy-authorization.ts` 路径串指 B2n 批文件 · 注释本体判留零改 · 不入终批 grep 路径集 · 蓝本原文引用旧址，位移由本收据承载）
  2. `packages/db/test/db-acl.proof.ts:267` · 3. `:490`
  4. `packages/db/test/qbank-source.proof.ts:2`
  5. `packages/domain/src/qbank-route-scope-cache.ts:16`
  6. `packages/domain/src/qbank-track-local-retrieval.ts:13`
  7. `packages/qdrant-store/src/product-vectorstore-bridge.ts:5/:9`
  8. `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:19` 头注
  （本批判留新增登记四处裸名注释面——migrations `0108_ctx03…sql:30` 与 `src/ctx03-event-source.ts:11`（散文提 resume.ts/int-transcript.ts 裸名）· `db/test/int-transcript-answer-fact-root.proof.ts:28` · `scor-01.proof.ts:29` · `scor-02.proof.ts:28`（散文提 int-transcript.ts 裸名·非 import 非路径串，不中任何残留 grep 模式，migrations/散文零触判留））
- **binary-aware erratum 逐批登记**（蓝本非阻塞披露）：`qbank-generation-projection.ts` 与 `qbank-provider-input.ts` 含 NUL 字节（B2r 批文件）——本批残留/消费面抽查全部走 `git grep`（binary-aware），未用裸 rg。
- **消费面复盘（零涉登记）**：apps api preview-submit proof 经 runner 靶源 `apps/api/test/int-transcript-preview-submit-http.proof.ts`（靶名/文件自身名零改）；34 文件桶引面零改（M3）；`uc052-internal-erasure.ts` 他 import 行零触；ai-docs 历史文档旧路径串不在 §3 终批 grep 路径集（docs 判留）。
- **Pins 十一值照抄零翻转**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=**PG-retained** · 公开 DELETE=**503**（stays） · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本批纯移动零模型调用零计费面）。

## 6. 环境与收尾观察

- runner 一次性容器批前批后各 4 只均被 finally `docker rm -f` 正常回收；`docker ps -a` 无本批新增残留（现存 46h 前他场旧容器 `meetwise-e2e-62497-cold2-stop-band-1-…` Exited(0) 沿 B2b 登记不予处置）。
- receipt 靶观察面（§5 B2d 行 12 靶中 4 靶 = int-transcript-answer-fact-root · int-transcript-remaining-sinks · int-answer-dual-write-fence · int-transcript-preview-submit:http 经本批 runner 复跑覆盖，sources 已解析新路径且 receipt 产出正常 ENOENT=0；其余 8 靶（db-id-v7 · growth · scor-01 · scor-02 · scor03-evidence-conflict · uc052:internal-erasure · uc052:external-sink-retention · uc052:external-sink-async-purge）批内必跑集合=∅（R5 口径），由 post 双审指令 + B2s 终批 117 靶 sweep 兜底）。
- G4：commit 后 `git status` 0 entries · push origin line/dir-b2-domain（交付报告承载）。

**B2d 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 · 红同形红 · receipt ENOENT=0 ×8 · sourceDigests 新路径亲证）· 1 commit 1 收据 · 漂移零交集照常执行登记 · 蓝本 §5 B2d 行状态由本收据承载推进（蓝本原文零改写）。**
