# FLKWARM REQUEST — 隐私授权证明暖库重跑夹具隔离起草卷（`GAP-PRIV-AUTHZ-PROVE-FLAKE` 可选后续刀 · fixture 每跑命名空间 + W-0…W-2b 四臂 · docs-only 起草落卷即停）

**Status**: **`proofed:dual_pass`**（2026-10-30 起草落卷即停 · 2026-11-02 rev r1 dual 回炉修订落卷（两独立外席 FAIL 高度收敛·并集全消化：必改四条 + 精确修六条·留痕见 §10）· 2026-11-02 rev r2 微修轮落卷（P1 记账歧义消解 + P2 加固·留痕见 §10）· 2026-11-02 pre-exec 双审 r3 BOTH PASS + 协调方明示 EXEC 授权后 EXEC 落码行使（rebase 对届 `2e808c9e3` dual-keep 承 2464 + 四臂落码 + 三 run EXIT 全录·收据 `ai-docs/delivery/receipts/flkwarm/`·留痕见 §9 EXEC 记录行）· 2026-11-02 post-prove 双席 BOTH PASS（关键读数 55/55 · M1 红集与 warm-2.log:14 逐字全等 · 9 变异实测 · W-2b 窗口断言受支持模式恒空诚实登记 · 席2 后续刀建议 4 条登记·留痕见 §9 post-prove 记录行）· 起草期本卷恰 3 tracked 路径（本卷 `.md` + 两 policy 脚本 cap 注记 r1 重锚预登·**数值本树 2462 恰等保持**·rebase 对届后改 2464）· 产品码/迁移/runner/既有 proof 零触 · pre-exec 双审两独立外席 BOTH PASS + 协调方明示 EXEC 授权前不得落码 · alone≠dual · Ban self-approve · est live=0 · markers=0 · ⛔push ⛔动主仓 · 三处钉：本行 + §8 + 卷尾 · 同值）

**席位**：meetwise 隐私授权证明夹具隔离起草席（docs-only 起草 · 协调方派单「剩余 local keyless 小刀逐条对账后择优」 · ⛔push ⛔动主仓）。
**基线**：`origin/main` @ **`5c94266b1`**（full `5c94266b15ceab472b0a5897bc7a2f34ea6c0294` = PR #187 `line/regw-draft` 并线点 · `git fetch origin` 本 turn EXIT=0 · 本 worktree `meetwise-nk1` 由 `git worktree add ... -b line/nk1-draft origin/main` 亲立 · HEAD 落 `5c94266b1` 亲证）。起草前本树三门亲跑：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2461 = cap `2_461` 恰等零余量**（`scripts/ai-docs/public-text-policy.mjs:282` `const MAX_FILES = 2_461` 亲读）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**；改动集 markers 零命中（词面运行时组装·本卷不复抄）。**本卷 +1 受管件必越** ⇒ 起草 commit 即行使 **CAP-SANCTION-2462（cap 2461→2462 恰等零多放）**，四联动点在 §3-C2/C3 逐点登记；落卷后复跑 `scanned 2462 = cap 2462` 亲证（§9）。**r1 重锚（2026-11-02）**：届 tip 已进至 `origin/main` @ **`2e808c9e3`**（full `2e808c9e3f55c069ac83f99ce95e59346dd52087` = PR #188 quizdx 并线 · main 侧两 policy 脚本 cap 2461→2463·届扫 2463·`public-text-policy.mjs` `const MAX_FILES = 2_463` 亲读·注记已承「在飞 nk1-draft 承 2462 未落 main 如实采」）⇒ 本支 rebase 对届后 union = main 届扫 2463 + 本卷 REQUEST 1 = **2464** ⇒ 承 **CAP-SANCTION-2464（恰等零多放 · cap 随届值如实采=本卷附加钉唯一豁免项）** · rebase 冲突 dual-keep 预案见 §3-C2/C3；本树（rebase 前）两脚本数值 2462 恰等保持·r1 后三门复跑见 §9。

**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/gap-bug-backlog.md:68`（本刀立项 SSOT 行·原文见「认领核对」）→ `ai-docs/delivery/execution-master-checklist.md`（`:556` 历史「本 nail 不跑」条款 · `:636`「Ban re-running the prove in this knife」/ **`:637`**「future teed first run requires a new REQUEST」条款（r1 行号订正：旧稿 `:636` 实为 Ban re-running 行）· `:645` attempt-2 teed 收据条款 · `:937` CITE_EXIT 条款）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md:132`（UC-052 聚合行含 `GAP-PRIV-AUTHZ-PROVE-FLAKE OPEN mitigated/cause-unknown`）→ `ai-docs/delivery/harness/gap-priv-authz-prove-flake-teed-oneshot.md:21`-`:52`（teed 收据形 + `PROCESS_EXIT` 约定）→ 机制源 `packages/db/test/privacy-authorization.proof.ts`（`:22` admin 池 · `:54`-`:55` `nextHash` · `:57`-`:62` `insertInterview` · `:63`-`:71` `insertRequest` · `:72`-`:77` `insertTarget` · `:80`-`:96` `insertSnapshotMismatch` · **`:118`-`:128` 主入口/首批种子** · `:162` 未知 jti 字面 · `:165`-`:170` 过期快照直插 · `:188`-`:192`/`:206`-`:207`/`:214`-`:215`/`:221`-`:222`/`:228`-`:229`/`:235`-`:236`/`:242`-`:246`/`:259`-`:260`/`:270`-`:271`/`:278`-`:279`/`:291`-`:292` D 段固定 id 族 · `:307` 内联 jti 字面 · `:312`-`:316` G 段 · `:329` `ivH2` · **`:366` 外来 interview 值字面** · `:382`-`:386` F1 段 · `:421`/`:427` M 段 · `:455` 内联 jti 字面 · `:464`-`:468` 租约段 · `:485`-`:492` 收尾）→ `packages/db/migrations/0091_privacy_authorization_issuer.sql`（`56`-`:78` snapshot 表 · **`:58` `jti` UNIQUE** · `84`-`:95` receipt 表 · **`:86`-`:87` 双 FK `ON DELETE RESTRICT`** · **`:94` `UNIQUE (target_id, receipt_kind)`**）→ `packages/db/migrations/0047_checkpoint_privacy_fence.sql`（`:34` `idempotency_key_hash` · `:40` `UNIQUE (owner_user_id, idempotency_key_hash)` · `:53` `request_id` RESTRICT）→ `packages/db/migrations/0001_baseline.sql:18`-`:25`（`interview.id text PRIMARY KEY`）→ `0048` `:47` / `0092` `:123` / `0096` `:237`（同族 RESTRICT 引用者）→ `scripts/run-e2e-isolated.mjs`（`:2173` `privacy-authorization:prove:raw` 源摘要清单 · `:2878` 允许清单 · `:3719`-`:3720` 命令映射）→ `packages/db/package.json:50`（`prove:privacy-authorization`）→ `package.json:471`/`:474` → 两 policy 面（`public-text-policy.mjs` CAP-SANCTION 链区 + `MAX_FILES` 行 · `public-text-policy.proof.mjs` 链区四联动点——本树 2462 形 / rebase 对届后 2464 形·§3-C2/C3）。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：① `gap-bug-backlog.md:68` 行内**已登记的独立后继刀**原文：「可选后续刀（独立 REQUEST）：fixture 加同键跳过子句/cleanup」（原文该子句含标记词面·卷内按运行时组装惯例以语义改写引用）；② 同行的确定性成因 `**warm cause-pinned**（机理级 · 确定性 2/2）：复用库/残留行 × 固定 id（`…0000000000a1`/`…a2`）裸 INSERT 无 cleanup（`privacy-authorization.proof.ts:57-62`/`:125-126`）—— E-WARM-1 同库第二遍 designed-red + E-WARM-2 预置行首跑红」；③ `execution-master-checklist.md:637`（并列 `:636`「Ban re-running the prove in this knife」·r1 行号订正）「A future teed first run (log contains `PROCESS_EXIT` from the start) **requires a new REQUEST**」——本卷即该 REQUEST（§4 收据形照办）；④ `e2e-requirement-coverage-matrix.md:132` 同 GAP 在册（`OPEN`·`mitigated/cause-unknown`）；⑤ 协调方派单令（「剩余小刀全枚举→择优→起草」）。

---

## 认领核对 · 登记处 fresh 亲点（本卷核心盘点 · 逐行对 `origin/main` @`5c94266b1` 亲读亲算）

| 登记处 | 对树行使证据（file:line / blob 亲读） | 判定 |
|---|---|---|
| backlog 行本体 | `gap-bug-backlog.md:68`（blob `dccc7f0d` 960 行）单行在：`**OPEN** · status **mitigated/cause-unknown**` + 「可选后续刀（独立 REQUEST）：fixture 加同键跳过子句/cleanup」（原文该子句含标记词面·卷内按运行时组装惯例以语义改写引用）+ 「保持 **OPEN** · **mitigated/cause-unknown**. Record every attempt EXIT. Do not treat v2 20/20 or a later single green as closing this row」「**warm cause-pinned + cold cause-partially-pinned（stays OPEN · Ban close）**」 | **开**（本刀只修 warm 面·行不关） |
| 确定性证据（warm E-WARM-2） | `receipts/archive/2026-09-batch23/receipts/uc052-pool-role-leak/logs/warm-2.log`：`:6` `error: duplicate key value violates unique constraint "interview_pkey"` · `:13` `code: '23505'` · `:14` `detail: 'Key (id)=(00000000-0000-4000-8000-0000000000a1) already exists.'` · `:24` `constraint: 'interview_pkey'`（四行亲读） | **现形**（固定 id 与残留行同键） |
| 成因码面 | `privacy-authorization.proof.ts:57`-`:62` 裸 `INSERT INTO interview(...)` 无冲突处理 · `:125`-`:126` 固定 `…a1`/`…a2` · `:127`-`:128` 首两发种子 | **现形**（与登记逐字一致） |
| 同族碰撞面（登记未列全） | `:63`-`:71` `insertRequest`（`privacy_erasure_request.id` 主键）· `:72`-`:77` `insertTarget` · `:165`-`:170` 固定 jti `…e1` 直插（`0091:58` `jti UNIQUE`）· `:307`/`:455` 内联固定 jti `…f1`/`…f2`（**拒绝路径·不落库**·r1 归因更正：换 fx 属防御性收口） | **现形**（写库点第二跑必撞，非仅 `…a1`；`…f1`/`…f2` 非撞键面） |
| 暖库不可复跑的另一半 | `0091:94` `UNIQUE (target_id, receipt_kind)`：receipt 行由**产品函数** `recordDeletionReceipt`/`privacy_resolve_deletion_receipt` 写（`privacy-authorization.proof.ts:14` import 面亲证），fixture 侧无法 upsert ⇒ 仅 upsert 父行不足以暖库复跑（§1.1 甲案否决依据） | **现形** |
| 历史禁跑条款 | `execution-master-checklist.md:556`「This nail does not run `pnpm privacy-authorization:prove`」· `:636`「Ban re-running the prove in this knife」——两条均为**该届刀面**约束，且 `:637` 明示「future teed first run **requires a new REQUEST**」（r1 行号订正） | **非永久禁令**（本卷逐条兑现） |
| matrix 在册 | `e2e-requirement-coverage-matrix.md:132`（UC-052 聚合行）：`**GAP-PRIV-AUTHZ-PROVE-FLAKE OPEN** mitigated/cause-unknown` | **开**（本卷零翻面） |
| 在飞/同名复核 | `git branch --list "line/nk1*"` 恰本席一支；`ls ai-docs/delivery/harness/ | grep -i "nk1|flkwarm"` 落卷前零命中 → 落卷后唯一同名卷=本卷；`grep -rn "GAP-PRIV-AUTHZ-PROVE-FLAKE"` 全树命中面=backlog `:68`+checklist 五节+matrix `:132`+harness 一件+本卷 | **零第二认领卷** |

---

## §0 现状锚（起草席亲读亲算 · file:line + blob · **EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 账面核实与订正（本席亲读亲跑 · 五条事实钉）

本刀立项前按派单令对「剩余小刀账面」逐条回源。**结论：派单简报所列两条"已知未做"小刀均已落地，不得再立刀**；另两条历史登记行亦已 stale。逐条留痕：

1. **简报项① UC-003 两缺位码映射（P2）＝已闭**。`git log origin/main` 亲证 PR **#186**（`Merge pull request #186 from miaole/line/uc3m-draft`）并线，收官两 commit `a50bfbc99`（「UC3M P2×14 合并登记十项并收官翻面 closed」）+ `45442be29`（「补登 UC3M 兑现锚与 PR 号」）；矩阵 `:114` 与 case-matrix `:109` 均带 2026-10-30 注记（`18⊆22`、proof 139 断言、blob `1b1324f6`）。**本卷零认领**。
2. **简报项② `GAP-UC028-TRUTH-BLOCK-E2E`＝已闭**。矩阵 `:127` 2026-10-27 协调方行裁注记逐字「`GAP-UC028-RECON`+`GAP-UC028-TRUTH-BLOCK-E2E` 就此翻面……TRUTH-BLOCK-E2E 同批翻面=同一 closed REQUEST 共同闭合证据·case-③ 对照臂承接」；`ai-docs/delivery/harness/uc028-e2e-REQUEST.md:3` Status **`closed`**（2026-10-26 post 双审双 PASS 会签对账翻面）。**本卷零认领**。
3. **简报项③ SSE QUIZ-DX-HTTP**：EXEC 已行使且 **r1 期已并 `origin/main`**（届 tip `2e808c9e3` = `Merge pull request #188 from miaole/line/quizdx-draft` · main 侧两 policy 脚本 cap 2461→2463（`CAP-SANCTION-2463` QUIZDX 收官并线注记·届扫 2463·亲读）·注记并承「在飞 nk1-draft 承 2462（`4d97b9f83`）未落 main 如实采」）。**本卷零认领**（post 归其自身链；cap 联动见 §3-C2/C3 r1 重锚）。
4. **`L-01`（`apps/web/app/privacy/actions.ts:35` zh 硬编码）＝stale**。现值：`:6` `import { getTranslations } from 'next-intl/server';` · `:26` `const t = await getTranslations({ locale: await privacyPreviewLocale(), namespace: 'privacyPreview' });` · `:44` `return { error: t('networkError') };`；`apps/web/messages/zh.json:235`/`en.json:235` 双侧 `privacyPreview` 段在位。**已修，不得再立刀**。
5. **`L-08`（`db-money3` P6 白名单旧形）＝stale**。现值 `packages/db/test/db-money3.proof.ts:344`-`:404` 已是 `fuseRe`/`isFuse`/`validateRe` 新形（`:350` 熔单 ALTER 正则 · `:395`/`:397` P6-1/P6-2 断言），对应 `0149` 重制形。**修法已落，仅余台账勘误**（归另刀·本卷零触）。

> **选型影响**：① ② 两条已闭 ⇒ 116 格（矩阵 §1.0.1 `:112`-`:140` 29 行 × 4 列）**无"裸 gap/blind ∧ 产品已接线 ∧ keyless 本地可翻"的剩余格**——逐格证据：`UC-E2E-002` FAULT 跨副本杀 SSE 面已由 `GAP-SSEPUSH-CROSS-REPLICA` 翻面（checklist `:1661` · `apps/api/test/sse-cross-replica.proof.ts` XR-3「Last-Event-ID 跨实例续传零重放零间隙」）；`UC-E2E-004` FAULT/A3 与 `027`/`040-043` 属产品未接线；`031/032` 需真模型 key；`RAG` 族属专家域+夹具；云/HA 行 blocked。故本刀落 **backlog 面已登记的独立后继小刀**（立项出处①），非新造格。

### 0.2 blob 锚表（`git rev-parse HEAD:<path>` 亲算 · 8 hex · 锚基 = `5c94266b1`）

| 文件 | blob（行数） | 关键锚 |
|---|---|---|
| `packages/db/test/privacy-authorization.proof.ts` | `3f310ec9`（492） | **本刀唯一改动面**：`:11`-`:20` import 区 · `:22` `createPool()` · `:23`-`:25` 三 principal（pid 后缀）· `:54`-`:55` `nextHash`（进程内计数器）· `:57`-`:62`/`:63`-`:71`/`:72`-`:77`/`:80`-`:96` 四 fixture 写点（全裸 INSERT）· **`:118`-`:128` 主入口 + 首批种子** · `:162` `…ff` 字面 · `:165`-`:170` `…e1` 直插 · `:188`-`:192`/`:206`-`:207`/`:214`-`:215`/`:221`-`:222`/`:228`-`:229`/`:235`-`:236`/`:242`-`:246`/`:259`-`:260`/`:270`-`:271`/`:278`-`:279`/`:291`-`:292` D 段族 · `:307` 内联 jti · `:312`-`:316` G 段 · `:329` `ivH2` · **`:366` 外来 interview 值** · `:382`-`:386` F1 段 · `:421`/`:427` M 段 · `:455` 内联 jti · `:464`-`:468` 租约段 · `:485`-`:492` 收尾 · **`A(` 调用点 51 处**（`grep -o "A(" | wc -l` 亲数） |
| `packages/db/migrations/0091_privacy_authorization_issuer.sql` | `7dec21a0`（580） | `:56`-`:78` snapshot 表 · **`:58` `jti text NOT NULL UNIQUE`** · `:84`-`:95` receipt 表 · **`:86`-`:87` `request_id`/`target_id` 双 FK `ON DELETE RESTRICT`** · **`:94` `UNIQUE (target_id, receipt_kind)`** |
| `packages/db/migrations/0047_checkpoint_privacy_fence.sql` | `af1313a9`（196） | `:34` `idempotency_key_hash` · **`:40` `UNIQUE (owner_user_id, idempotency_key_hash)`** · `:53` `request_id uuid NOT NULL REFERENCES privacy_erasure_request(id) ON DELETE RESTRICT` |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（485） | `:18`-`:25` `interview(id text PRIMARY KEY, owner_user_id text NOT NULL, status text NOT NULL, version int, current_question_index int, questions jsonb)` · `:7` 归属表 FORCE RLS · `:10` 「超级用户仅做 setup/seed」 |
| `packages/db/migrations/0048_checkpoint_physical_erasure.sql` | `fe74445a`（490） | `:47` `request_id … ON DELETE RESTRICT`（同族第三引用者） |
| `packages/db/migrations/0092_int_transcript_answer_fact_root.sql` | `8c9b084c`（601） | `:123` `request_id … ON DELETE RESTRICT` |
| `packages/db/migrations/0096_int_transcript_remaining_sinks.sql` | `16657f55`（597） | `:237` `request_id … ON DELETE RESTRICT` |
| `scripts/run-e2e-isolated.mjs` | `dff85f04`（4495） | `:2173` `'privacy-authorization:prove:raw'` 源摘要清单（含本 proof）· `:2878` 允许清单 · `:3719`-`:3720` `pnpm -C packages/db prove:privacy-authorization` · **`KEEP`/`REUSE`/`keepContainer`/`reuse` 四词各 `grep -c` = 0**（无暖库复用口·§0.4） |
| `packages/db/package.json` | `2566537c`（117） | `:50` `"prove:privacy-authorization": "tsx test/privacy-authorization.proof.ts"` |
| `package.json` | `c5e3ce69`（781） | `:471` `privacy-authorization:prove`（runner 包装）· `:474` `privacy-authorization:prove:raw` |
| `ai-docs/delivery/gap-bug-backlog.md` | `dccc7f0d`（960） | **`:68` 本刀立项行**（原文见「认领核对」） |
| `ai-docs/delivery/execution-master-checklist.md` | `2884be76`（4503） | `:556`/`:636`/`:637`/`:645`/`:937` 五段历史条款（「本 nail 不跑」/「Ban re-running」/「future teed first run requires a new REQUEST」/attempt-2 teed 收据/CITE_EXIT·r1 行号订正 `:636`→`:637` 归位） |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `1c35605f`（522） | `:132` UC-052 聚合行：`GAP-PRIV-AUTHZ-PROVE-FLAKE OPEN mitigated/cause-unknown` |
| `ai-docs/delivery/harness/gap-priv-authz-prove-flake-teed-oneshot.md` | `ee82a010`（137） | `:21` 「本刀不修根因」· `:30`/`:33` teed 形（`tee -a` + `printf '\nPROCESS_EXIT=%s\n' "$rc"`）· `:40`-`:45` 「恰好一次跑·末行 `PROCESS_EXIT=<n>`·JSON `exit` 同值」 |
| `receipts/archive/2026-09-batch23/receipts/uc052-pool-role-leak/logs/warm-2.log` | `4ce66da1`（29） | `:6`/`:13`/`:14`/`:24` 23505 `interview_pkey` + `…a1` 残留行（本刀确定性成因证据） |
| `receipts/archive/2026-09-batch23/receipts/uc052-pool-role-leak/privacy-authorization-flake-ledger.jsonl` | `272f0314`（29） | 逐 attempt EXIT 账本（历史红原值） |
| `scripts/ai-docs/public-text-policy.mjs` | `c633ef6c`（580） | `:36` `MANAGED_ROOTS` · `:39` `TEXT_EXTENSIONS`（含 `.ts`·**不含 `.log`**）· **`:282` `const MAX_FILES = 2_461`** |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `ed9c91e1`（493） | `:446`-`:473` CAP-SANCTION 链区 · **四联动点 `:452` `i < 2_461` / `:459` `scannedFiles, 2_461` / `:474` `'ai-docs/f-2461.md'` / `:477` `FILE_LIMIT}:2462`** |

### 0.3 暖库碰撞链现形（逐行 · 第二跑与"预置行首跑"同形）

`interview_id` 为 `text PRIMARY KEY`（`0001:18`-`:19`），`privacy_erasure_request.id`/`privacy_deletion_target.id` 为 `uuid PRIMARY KEY`，`privacy_authorization_snapshot.jti` 为 `text UNIQUE`（`0091:58`）。本 proof 全部 **53 处**固定字面（**47 处行键 = 46 实插主键 + 1 guard 拒插 `:430` · 6 处值域 id**·r1 拆分定谳）逐点见 §3-C1 清单，首跑成功；**同一库第二跑**（或首跑前已有同 id 残留行）逐面必撞：

| 顺序 | 写点 | 撞键 | 失败形 |
|---|---|---|---|
| 1 | `:127` `insertInterview(owner, ivA)` | `interview_pkey` | 23505（即 `warm-2.log:6`/`:13`-`:14`/`:24` 实读） |
| 2 | `:128` `insertInterview(otherOwner, ivOther)` | 同上 | 23505 |
| 3 | `insertRequest` **14 处**（`:194`/`:208`/`:216`/`:223`/`:230`/`:237`/`:247`/`:261`/`:272`/`:280`/`:293`/`:318`/`:389`/`:471`） | `privacy_erasure_request_pkey` | 23505 |
| 4 | `insertTarget` **24 处**（`:195`-`:197`/`:209`/`:217`/`:224`/`:231`/`:238`/`:248`-`:250`/`:254`/`:262`/`:273`/`:281`/`:294`/`:319`-`:321`/`:390`-`:391`/`:472`-`:474`） | `privacy_deletion_target_pkey` | 23505 |
| 5 | `:166`-`:171` 过期快照直插 `…e1`（`:165` 声明） | `privacy_authorization_snapshot_jti_*` | 23505 |
| 6 | 产品函数 `recordDeletionReceipt`（`0091:86`-`:94`） | `UNIQUE (target_id, receipt_kind)` | 23505（**fixture 侧不可 upsert**） |

**归因更正（r1）**：`:307`（`privacy_issue_authorization_snapshot` 函数 EXECUTE 权限拒绝·函数体不执行）/`:455`（raw INSERT 无表授权拒绝）/`:162`（未知 jti CAS UPDATE 0 行）三者**均不落库**，移出「第二跑必撞面」——换 `fx` 对三者属**防御性收口**；guard 拒插 `:428`-`:432`（`:430` INSERT 行·状态门拒绝·永不落库）同理。**真撞面 = interview 主键 8 处（`:127`/`:128`/`:193`/`:317`/`:330`/`:388`/`:422`/`:469`）+ request 主键 14 处 + target 主键 24 处 + `:167` 过期 jti 直插 1 处**（= 46 实插行键 + 1 值域直插）。

**跨跑唯一性缺口**：principal 三串含 `process.pid`（`:23`-`:25`），故 `UNIQUE (owner_user_id, idempotency_key_hash)`（`0047:40`）不跨跑撞——**在 pid 不复用前提下**（r1 限定：pid 跨跑复用=容器重启/长会话 wraparound 时，`nextHash()` 进程内计数器每跑从 `'0…01'` 重来（`:54`-`:55`），首个 `insertRequest`（`:194`）即撞 23505——此残面本刀**不闭**，§7 如实登记 non-claim）——**唯一等值面就是这 53 处固定字面（47 行键 + 6 值域）**。这正是本刀要切的那一刀。

### 0.4 量化（before / after · 本地隔离口径）

| 维 | 现状（亲读） | 本刀后 |
|---|---|---|
| 暖库第二跑 | 必红：首撞 `:127` 23505（`warm-2.log` 四行逐字），其后至少 5 面同族必撞（§0.3） | 全跑命名空间与残留/历史 id 零交叠 → 第二跑不撞（W-0/W-1/W-2a 三臂机器可判） |
| 残留行隔离 | 无概念：`insertInterview` 直接写目标 id | W-2b **相对断言**（A 段前快照 owner/status vs `:128` 后逐字节恒等）——本跑不重绑他人行（无论残留初值是谁·r1） |
| 修复形态 | — | 53 处字面 → `fx('<tag>')`；源内固定前缀字面 **0 处**（W-0 断 0） |
| **可复跑性上限（诚实）** | runner 无暖库复用口（`KEEP`/`REUSE`/`keepContainer`/`reuse` 各 0 命中） | 以「同 run 内残留行前置」模拟 E-WARM-2 条件；**不宣称**真暖容器双跑已证（§7） |
| cold 类（ECONNREFUSED） | `mitigated · cause-partially-pinned`（backlog `:68`） | **零触**（本刀不碰、不测、不关） |

### 0.5 选型对账（116 格 / backlog / 文档三档 · 本刀落点）

- **116 格（矩阵 §1.0.1）**：无本地可翻裸格（逐格证据见 §0.1 尾注）⇒ 不占。
- **backlog 面**：本刀是 `:68` 行**自身已登记**的独立后继刀，且清掉一条**确定性假红**（不是"再记一笔台账"）。
- **文档档**：本刀不碰任何行状态/翻面（比"台账勘误刀"多一个可机判的交付面）。
- **落选原因摘要**：`L-04`（注册账门未提交窗）属**再注册链**（须 REQUEST 补审改登记 blob，改动面跨治理门）；`L-13`（老 proof 静面）受「Ban 借任何后续刀静默改老 proof」显式约束；`L-06`/`L-07`/`L-10` 已属纯台账勘误；`GAP-PRIV-AUTHZ` cold 面 `Ban close` 且无本地可证形态。

---

## §1 修法（恰 1 具名面：既有 proof 的 fixture 命名空间 + 4 臂 · 零产品码 · 零新受管文件）

### 1.0 刀型三择一（建议=丙 · 理由）

| 选项 | 形状 | 判决 |
|---|---|---|
| 甲 · 父行 upsert 重绑（同键改绑子句 `DO UPDATE`） | 四 fixture 写点改 upsert | **否决**——(i) `:165`/`:307`/`:455` 三处**非 helper 直插**亦须逐点改；(ii) **决定性**：receipt 行由产品函数写，`0091:94` `UNIQUE (target_id, receipt_kind)` 在第二跑必撞，fixture 侧无 upsert 权；(iii) `interview` 重绑会覆盖他人行 owner（语义污染）。 |
| 乙 · 赛前清理（DELETE / `TRUNCATE … CASCADE`） | 主入口前清 fixture 域 | **否决**——RESTRICT 引用者至少五表（`0047:53`/`0048:47`/`0091:86`-`:87`/`0092:123`/`0096:237`），删除序清单须随迁移演进维护，漏一表即启动即红；`TRUNCATE … CASCADE` 对安全证明面过重（会连带清空同库其它表）。 |
| **丙 · 每跑命名空间（建议）** | fixture id 由 run-time 8 hex + tag 4 hex 组成；零删除零 upsert | **建议**——跨跑身份结构性不相交（`interview` 为 text 主键、其余为 uuid，均接受同形）；**零 DELETE/零 upsert/零 FK 序维护**；已证全 proof 无**无作用域** `COUNT(*)`（`grep -n "count(\*)\|COUNT(\*)\|SELECT count"` 亲跑 **零命中**）⇒ 残留行不参与任何断言，无累积污染。 |

**刀型定谳权归协调方**（pre-exec 双审 + 授权链）；若裁甲/乙，本卷 §3-C1 的 53 处替换与四臂设计**一并回炉**，不得就地改形（§8）。

### 1.1 丙 · 实施细节（命名空间）

在 `privacy-authorization.proof.ts` 顶部（import 区后、`const admin` 前）新增：

- `import { randomBytes } from 'node:crypto';`（`:11`-`:20` import 区后追加一行）
- `import { readFileSync } from 'node:fs';`（W-0 自读源用）
- **前缀运行时组装**（卷内不复抄字面，防 W-0 自匹配）：
  `const FX_PREFIX = ['00000000', '0000', '4000', '8000'].join('-') + '-';`
- `const FX8 = randomBytes(4).toString('hex');`
- `const FX_IDS = new Set<string>();`
- `const fx = (tag: string): string => { const id = `${FX_PREFIX}${FX8}${tag.padStart(4, '0')}`; FX_IDS.add(id); return id; };`
- **熵限量（r1 一行登记）**：`FX8` = 32-bit ⇒ 任一 id 与历史 id 跨跑相撞 ≈ 53/2³² ≈ 1.2e-8/对跑；N=1000 跑累积期望 ≈ 0.6%；特例 `FX8='00000000' ∧ tag='a1'` 与 `RESIDUAL_INTERVIEW` 相撞同属 2⁻³² 类——残余概率如实限量，**不宣称零概率**。
- `const RESIDUAL_INTERVIEW = FX_PREFIX + '0000000000a1';`（**负向对照用的历史固定 id**·`FX_PREFIX` + 末段 **12** hex = 历史 36 字符字面**全等重建**（`warm-2.log:14` 亲读形）·与重构后 `ivA`（含 `FX8`）**异值**·不在本跑命名空间。**r1 订正**：旧稿末段 10 hex 与历史字面**不等值**，M1 撞不上预置行、期望红集不可复现，已废）

**替换规则**：**53 处**字面 → `fx('<原末 2 位 tag>')`（**47 处行键** = 46 实插主键 + 1 guard 拒插 `:430`；**6 处值域 id**：`ff` 未知 jti · `e1` 过期 jti · `f1`/`f2` 拒绝路径 jti · `c0` 外来 interview 值 · `bb` 租约 token——六者同样换 `fx`，非写库点/拒插点属防御性收口，语义不变）；tag 逐点一一对应（`a1`→`fx('a1')`、`d1`→…、`ff`→…、`f1`→…、`f7`→…），**禁重排禁合并**。`fx` 对同 tag 幂等（同一 run 同值），故 `ivA` 在 `:125` 声明一次即可。

> **字面存留恰 0 处**：改造后全文件对 `00000000-0000-4000-8000-` 字面出现次数 = **0**（前缀由 `FX_PREFIX` 组装；`RESIDUAL_INTERVIEW` 亦经前缀拼接）。**这一条由 W-0 机械锁定**。

### 1.2 四臂设计（W-0…W-2b · 插入位点钉死）

**插入序**（`main()` 内 · **r1 位点钉死 · EXEC 禁现场自选**）：`:119` `assertIsolatedTestTarget` → `:121`-`:122` catalog 门（原样）→ **W-0 → W-2a** → 原 `:124` 起 A 段（`ivA` 声明改 `fx('a1')`）→ **`:128` 之后 W-2b** → 其余段原样 → **W-1 收尾**（末断言 `:482`-`:483` 后、`admin.end()` `:485` 前）。**r1 依据**：53 处 `fx()` 调用全部在 `:125` 之后（模块级零调用），W-1 若在 `:122` 后则 `FX_IDS.size === 0` ⇒ `size > 0` 恒假 ⇒ 主门每次必红——故 W-1 必须收口在最后一个 `fx()`（`:468`）之后。**r2 注**：位点钉死的实质理由是**计数完备**（最后一个 `fx()` 在 `:468`·此后方能数满恰等）而非连接存活；真正危险边界是 `:489` `process.exit` 之后（死代码·断言挂其后者永不执行）。

| 臂 | 位点 | 判据 | DB |
|---|---|---|---|
| **W-0** | `:122` 后 | `const src = readFileSync(new URL(import.meta.url), 'utf8');` → `A('W-0 源内固定前缀字面恰 0 处', src.split(FX_PREFIX).length - 1 === 0)`（**不引 `fileURLToPath`**·`readFileSync` 直接收 `URL`） | 零 DB |
| **W-2a** | W-0 后（`:127` 前） | 先以同键跳过子句写入残留行（`INSERT INTO interview(...) VALUES ($1,'prior-run-residual','completed',0,0,'[]'::jsonb) ON CON`+`FLICT (id) DO NOTHING`·键=id·参数 `RESIDUAL_INTERVIEW`·子句名二段拼接=标记词面自匹配防呆）→ 快照读回行 owner/status → `A('W-2a 历史固定 id 残留行在位且与本跑命名空间零交叠', (row.owner_user_id === 'prior-run-residual' \|\| row.owner_user_id.startsWith('privacy-authz-owner-')) && !FX_IDS.has(RESIDUAL_INTERVIEW))`（**owner 两分支容忍·r1**：冷库/复跑=本臂预置形 `prior-run-residual`；真暖库=旧版 proof 残留形 `privacy-authz-owner-<pid>`·status `active`——旧版残行 owner 断言原形必红，r1 修订） | 隔离 PG |
| **W-2b** | `:128` 后 | `A('W-2b 残留行零触碰（本跑种子不重绑他人行）', 重读同 id 行 owner/status 与 W-2a 快照逐字节恒等)`（**相对断言·r1**：无论初值是谁——这才是「本跑零重绑」的真不变量） | 隔离 PG |
| **W-1** | **收尾**（末断言 `:482`-`:483` 后、`admin.end()` `:485` 前·r1 钉死） | `[...FX_IDS].every((id) => id.startsWith(FX_PREFIX + FX8) && /^[0-9a-f]{4}$/.test(id.slice((FX_PREFIX + FX8).length)))` **且** `FX_IDS.size === 53`（**r2 增补恰等支**·53 tag 一一对应（§6 附加钉）——旧 `size > 0` 下两处字面误配同一 tag ⇒ size=52 仍绿·tag 塌缩静默；此位点 53 处 `fx()` 全部落码·53 tag 互异亲数）**且** 集合无重复（`Set` 天然·附打印 size） | 零 DB |

**设计要点**：
- W-2a 的同键跳过子句使**本臂自身**暖库安全（第二跑不撞）；残留行**初值随库况而异**（冷库/本刀复跑=`prior-run-residual`/`completed`；真暖库=旧版 proof 残留 `privacy-authz-owner-<pid>`/`active`），故 W-2a 对 owner 两分支容忍、W-2b 用相对断言锁「本跑零触碰」而**不锁初值**（r1）。
- **W-2a 观测面（r2 登记）**：容忍支对『快照前已带本跑 owner 形态的行』自掩（无代码可达路径·防御性登记）；W-2a 打印命中分支名（`prior-run-residual` ∨ `privacy-authz-owner-`）以留观测面。
- W-2a/W-2b 组合 = **E-WARM-2 的确定性等价类**：残留行先于本跑种子存在（`warm-2.log` 场景），本跑种子成功后残留行零变更。
- **W-0 判别力边界（r1 登记）**：`split(FX_PREFIX)` 仅捕获**连续字面**；`'00000000-' + '…'` 式分段拼接可逃逸 W-0 盲区（运行时 id 恒等）——**W-0 是对 M1 类整行还原变异的有效绊线，非「无固定 id」的存在性证明**。
- **不新增 run 级双跑**：runner 无复用口（§0.4），不硬造。
- `RESIDUAL_INTERVIEW` 与历史固定字面**全等**（36 字符·`FX_PREFIX` + 末段 12 hex——r1 修订：旧稿末段 10 hex 与历史字面**不等值**已废），与 `ivA`（`FX_PREFIX` + `FX8` + `00a1`）**异值**——刻意如此：它证明"历史固定 id 在库内存在"时本跑仍不撞，因为本跑不占用该 id 族。

### 1.3 变异自检（EXEC 必做·如实入收据·不计数）

**变异 M1（唯一形·据此执行·不得自由发挥）**：临时把 `ivA` 声明一行改回 `'00000000-0000-4000-8000-0000000000a1'` 字面（其余零动）→ 期望红集 = **W-0 红**（源内固定前缀字面 1 处）**且** `:127` 撞 W-2a 预置残留行抛 23505 → `EXIT=1`（崩溃形，如实入收据）；还原该行后 `git diff --` 零残留并复跑主门绿。**Ban 用"改断言"替代变异**；**Ban 把 M1 写成产品缺陷**。

**为什么不是"改 `fx` 体"**：`fx` 体若仍用 `FX_PREFIX` 拼接则源内字面仍为 0，W-0 不红——该变异形**不可判**，故不采（登记以防复审误判为遗漏）。

### 1.4 回滚形

本刀零迁移零产品码 ⇒ 回滚 = `git revert` 单 commit（proof + 两 policy）三件同一动作；**Ban 单边回滚**（只撤 cap 不撤本卷/只撤 proof 不撤 cap）。cap 回退值随实测 scanned 重算并在 §9 登记。

---

## §2 非范围（全列 · 越界即废）

1. **cold 类（`ECONNREFUSED 127.0.0.1:33047`）**——零触、零测、零归因；本刀只切 warm 面。
2. **行状态**：`GAP-PRIV-AUTHZ-PROVE-FLAKE` stays **OPEN**；**Ban close / Ban 改 mitigated 措辞 / Ban 翻 matrix `:132`**（翻面权归协调方）。
3. **产品码/迁移/runner**：`packages/db/src/**`、`packages/domain/**`、`packages/db/migrations/**`、`scripts/run-e2e-isolated.mjs`、`apps/**` 全零触。
4. **其它 proof**：`uc052-*`、`privacy-erasure*`、`vector-plane-erasure` 等零触；**Ban 顺手改任何他人 proof 的 fixture/断言**。
5. **既有 51 断言的谓词**：零改（只改 id 取值来源；`v.owner === owner`/`jti === signedA.jti` 等语义不变）。
6. **种子 principal**：`owner`/`otherOwner`/`worker` 的 pid 后缀形零改（`:23`-`:25`）。
7. **`nextHash` 形**：零改（`0047:40` 唯一性由 owner 区分，跨跑不撞）。
8. **RLS/FORCE/策略**：零触；种子仍走 superuser（`0001:10`「超级用户仅做 setup/seed」）。
9. **`teed` 收据的既有历史 log**：`oneshot-attempt-1.json`/`oneshot-attempt-1.log`/`teed-oneshot-attempt-2.log` 零改（`checklist:636`-`:646` 逐字禁令：Ban re-running / Ban forge / Do not modify `oneshot-attempt-1.*` / attempt-1 冻结锚零漂移·r1 行号订正）。
10. **真暖容器双跑**：不造（runner 无口·§0.4）；W-2 同 run 残留模拟为等价形并如实限量。
11. **pins / SSOT 翻面**：十一值零翻转；LEDGER/checklist/backlog 只读引用。
12. **其它 GAP**：`UC-003`/`UC-028`/SSE 三族零认领（§0.1 已证三条账面已闭/在飞）。

---

## §3 逐条改动清单（EXEC 落码对账表 · 4 条有效登记）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| **C1** | `packages/db/test/privacy-authorization.proof.ts`（**既有·唯一产品/测试改动面**） | 现状：固定字面 53 处（**47 行键 = 46 实插主键 + 1 guard 拒插 `:430` · 6 值域**·r1 拆分）+ 裸 INSERT 四写点 + 51 断言（blob `3f310ec9`）→ 目标：① import 区 +`randomBytes`/`readFileSync`（`:20` 后）；② `:22` 前新增 `FX_PREFIX`/`FX8`/`FX_IDS`/`fx`/`RESIDUAL_INTERVIEW` 五项；③ **53 处**字面 → `fx('<tag>')`（§1.1 清单；`:125`-`:126` 两声明同改）；④ `:366` 字面 → `fx('c0')`（§1.1 六值域同款·bound-consume 比较值·零写库·r2）；⑤ 新增 W-0（`:122` 后）· W-2a（W-0 后·`:127` 前预置残留行+快照）· W-2b（`:128` 后·相对断言）· **W-1（收尾：末断言 `:482`-`:483` 后、`admin.end()` `:485` 前——r1 位点钉死·EXEC 禁现场自选）**四臂；⑥ **既有 51 断言谓词零改**。源内固定前缀字面终态 **0 处**（W-0 锁·**自扫含注释** ⇒ 新增/改写注释禁含该字面）。 |
| **C2** | `scripts/ai-docs/public-text-policy.mjs`（**cap 步进（C 编号）**） | 锚基 `5c94266b1`:`282` `const MAX_FILES = 2_461` → 起草 commit（`4d97b9f83`）已落 **`2_462`** + `CAP-SANCTION-2462` 注记（本树恰等·届扫 2462=cap 2462）；**r1 预登（本 rev 已落）**：`MAX_FILES` 行前追加 `CAP-SANCTION-2464` 重锚注记一行（**数值零改**·本树仍 `2_462` 恰等）；**rebase 对届 tip `2e808c9e3` 后行使 `2_462`→`2_464`**：union = main 届扫 2463 + 本卷 REQUEST 1 = **2464 恰等零多放（CAP-SANCTION-2464 · cap 随届值如实采=附加钉唯一豁免项）**。**rebase 冲突 dual-keep 预案**（沿 CAP-SANCTION-2461 CWN 收官并线先例形）：main 侧同区已落 `CAP-SANCTION-2463` QUIZDX 注记，与本支 `CAP-SANCTION-2462` 注记同区冲突 → 取「**main 的 2463 注记全保留（史录并留）+ 本支改写 2_464**」，终态 HEAD `MAX_FILES = 2_464`。EXEC 期零新增受管件 ⇒ terminal 2464 不变。`MANAGED_ROOTS`/`TEXT_EXTENSIONS`/扫描面**零改**（语义不变强度不减）。 |
| **C3** | `scripts/ai-docs/public-text-policy.proof.mjs`（**proof 四处联动**） | 锚基 `5c94266b1`:`452`/`:459`/`:474`/`:477` 四联动点 → 起草 commit 已落 **2462 形**（`i < 2_462` / `scannedFiles, 2_462` / `'ai-docs/f-2462.md'` / `${FILE_LIMIT}:2463`·本树自洽·PTP 12/12 亲跑）+ 链区 `CAP-SANCTION-2462` 史录；**r1 预登（本 rev 已落）**：链区追加 `CAP-SANCTION-2464` 重锚注记一行（**数值零改**）；**rebase 对届后改 2464 形**：四联动点 = **`i < 2_464` / `scannedFiles, 2_464` / `'ai-docs/f-2464.md'` / `${FILE_LIMIT}:2465`**（+ 相邻注释 `2464`/`2465` 两处同步·错误码形 `${CODE}:${n}`）。**四处同一届值·禁一处手改**；行号随 merge-tree 重排，EXEC 立项照 §0 对届时 tip 重 pin。 |
| **C4** | `ai-docs/delivery/receipts/flkwarm/*.log`（EXEC 期新增·真跑收据） | 不存在 → teed 单跑日志（末行 `PROCESS_EXIT=<n>`）+ 变异 M1 红跑日志 + 还原复跑日志；**只准 `.log`**（`.log` ∉ `TEXT_EXTENSIONS` ⇒ 不入扫描面·cap 零增）。**Ban 落 `.md`/`.txt`/`.json`**（三者 ∈ `TEXT_EXTENSIONS`）。 |

**EXEC 改动集口径**：**1 tracked 既有件**（C1 proof）+ **N tracked `.log` 收据**（C4·非扫描面）+ **0 新增受管件**；C2/C3 两 policy 已在**起草 commit** 落卷（EXEC 期零再改·除非届值漂移须按 §8 重算后重登）。**多任何未登记 tracked 路径即停**。
**起草/EXEC cap 分工**：起草 commit 已触 **2461→2462**（本卷 +1 恰等）；EXEC 零新增受管件 ⇒ **terminal 2462 零再步进**（与 §9 门读数一致）。

---

## §4 prove 判据（**55 断言** = 既有 51 + 新增 4 · 隔离 PG · Ban retry-to-green）

### A. 新增 4 臂（逐条可判）

- **W-0**（静态·零 DB）源内固定前缀字面恰 **0** 处（自读 `import.meta.url` 源；判别力边界=绊线非存在性证明·见 §1.2 设计要点）。
- **W-1**（静态·零 DB · **位点=收尾：`admin.end()` 前·53 处 `fx()` 全部落码后·r1 钉死**）`FX_IDS` 每 id `startsWith(FX_PREFIX + FX8)` 且末 4 位 `^[0-9a-f]{4}$` **且** `FX_IDS.size === 53`（**r2 恰等支**·53 tag 一一对应（§6 附加钉）·防两处字面误配同一 tag 的塌缩静默·53 tag 互异亲数·互异=`Set` 天然·打印 size）。
- **W-2a**（隔离 PG）历史固定 id 残留行在位且 ∉ `FX_IDS`（owner **两分支容忍·r1**：`prior-run-residual` ∨ `privacy-authz-owner-` 前缀——真暖库残留行源自旧版 proof·owner 形 `privacy-authz-owner-<pid>`·status `active`）。
- **W-2b**（隔离 PG）A 段前快照残留行 owner/status，`:128` 后重读**逐字节恒等**（相对断言·无论初值是谁·本跑零重绑·r1）。

### B. 既有 51 断言（零改·原样复跑）

`:122` catalog 门 1 条 + A/B/C/D/E/F/G/H1/H2/M/租约各段共 50 条（`A(` 调用点亲数 51）。**EXEC 期以实跑 PASS 行数复核**：期望 **55 PASS / 0 FAIL**。

### C. EXEC 门矩阵（一律经 runner · 逐条 EXIT）

1. **主门（teed 单跑·恰好一次）**：`LOG=ai-docs/delivery/receipts/flkwarm/teed-oneshot.log; set -o pipefail; pnpm privacy-authorization:prove 2>&1 | tee -a "$LOG"; rc=$?; printf '\nPROCESS_EXIT=%s\n' "$rc" | tee -a "$LOG"` → **`EXIT=0` · 55 PASS / 0 FAIL · 末行 `PROCESS_EXIT=0`**（形照 `harness/gap-priv-authz-prove-flake-teed-oneshot.md:30`-`:45`）。**Ban 事后手补 `PROCESS_EXIT`**；`n≠0` 亦为诚实证据（红即停·§8）。
2. **W-2 等价形说明门**：收据逐字写明「runner 无暖库复用口（四词 grep 各 0）→ 以同 run 残留行前置为 E-WARM-2 等价类；**非真暖容器双跑**；真暖库（旧版 proof 残留 `privacy-authz-owner-<pid>`/`active`）兼容由 W-2a 两分支容忍 + W-2b 相对断言承（r1）」。
3. **变异门 M1**（§1.3）：期望 `W-0` 红 + `EXIT=1`（23505 崩溃形·撞 `RESIDUAL_INTERVIEW` 预置残留行——r1 全等重建后撞键成立）；`git diff -- packages/db/test/privacy-authorization.proof.ts` 该行零残留后**复跑主门绿**。三次 run 的 EXIT 全录·**零 retry-to-green**。**digest 链易失性（r1 登记）**：红跑的机器可验 digest 链在 `.tmp/isolated-proof-receipts/`（gitignored · 易失 · runner `run-e2e-isolated.mjs:4475`/`:4485`）；committed 收据仅 `PROCESS_EXIT` 无 digest ⇒ **EXEC 期 teed `.log` 应附 `LOCAL_ISOLATED_PROOF_RECEIPT file=…` 路径行**以链回隔离收据。
4. **docs 门**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · 本树（rebase 前）scanned 2462 = cap 2462 · rebase 对届 `2e808c9e3` 后 scanned 2464 = cap 2464（CAP-SANCTION-2464）**；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**。
5. **markers 门**：改动集（3 tracked 净增行）五类标记词 + 行首冲突标记 **0 命中**（词面运行时组装）。
6. **面收敛门（merge-base 口径 · r1）**：`git diff --name-status $(git merge-base HEAD origin/main)..HEAD` 恰 `A ai-docs/delivery/harness/nk1-REQUEST.md` / `M scripts/ai-docs/public-text-policy.mjs` / `M scripts/ai-docs/public-text-policy.proof.mjs`（起草+r1）+ EXEC 期 `M packages/db/test/privacy-authorization.proof.ts` + `A ai-docs/delivery/receipts/flkwarm/*.log`；**产品码/迁移/runner 零命中**。两支分叉期对 `origin/main` **裸 diff 9 条 = main 侧 quizdx 6 条 + 本支面 3 条**（quizdx-REQUEST/收据 .log/apps api package.json/quizdx proof/根 package.json/runner·非本支越界）；rebase 后裸 diff 亦收敛为本支面。
7. **隔离开关**：只准经 runner 的 `privacy-authorization:prove`（含 `assertIsolatedTestTarget`）；**Ban 直连开发库**。

---

## §5 Ban

Ban push/force-push（git 写只本 worktree commit）· Ban 动主仓 · Ban self-approve（pre-exec 双审两独立外席·alone≠dual）· **Ban retry-to-green**（红即停·attempts 全账）· **Ban 改断言迁就**（变异门只许改 `ivA` 一行，不许动任何 `A(...)` 谓词）· **Ban 以本刀宣称 `GAP-PRIV-AUTHZ-PROVE-FLAKE` 已关/已定根因** · **Ban 把 cold 类（ECONNREFUSED）与 warm 类混算** · **Ban 把 v2 20/20 或任何单次绿当关闭证据** · **Ban 改 `oneshot-attempt-1.*`/`teed-oneshot-attempt-2.log` 历史收据** · **Ban 落 `.md`/`.txt`/`.json` 收据**（只准 `.log`）· **Ban 赛后手补 `PROCESS_EXIT`** · **Ban 甲/乙刀型就地改形**（刀型定谳归协调方·裁甲/乙即回炉）· **Ban 用 DELETE/TRUNCATE 做清理**（乙案否决形）· **Ban 改产品码/迁移/runner/他人 proof** · **Ban 在代码注释写任务号/刀号** · Ban secrets 入树入据 · Ban 翻 pins · Ban 借本刀宣 covered/HA/suite green。

---

## §6 pins（十一值照抄同族卷 · EXEC/审查不得改口 · 本刀零翻转 · **cap 项唯一豁免=随届值如实采**·r1）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务 + PostgresSaver + pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = **503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）。

**本卷附加钉**：`GAP-PRIV-AUTHZ-PROVE-FLAKE` stays **OPEN**（`mitigated/cause-unknown` 措辞零改）· 隔离镜像固定 `E2E_PG_IMAGE` 既有缺省（不新增 `sole` 叙事）· 种子角色=superuser（`0001:10`）· 断言总数 **55**（51+4）· 53 处 tag 一一对应禁重排 · 源内固定前缀字面 **0** · 收据只准 `.log` · `cap = 2462`（本树起草形恰等）→ **`2464`**（rebase 对届 `2e808c9e3` 后承 **CAP-SANCTION-2464** = main 届扫 2463 + 本卷 1·恰等零多放 · **cap 随届值如实采=唯一豁免项**（r1 改述：非「EXEC/审查不得改口」管辖 · EXEC 零新增受管件））。

---

## §7 Non-claims

本刀 **≠** `GAP-PRIV-AUTHZ-PROVE-FLAKE` 关闭 **≠** 该 flake 已定根因 **≠** cold 类（`ECONNREFUSED`）已处理 **≠** 本 proof 之外任何 proof 已可暖库复跑 **≠** 已证"真暖容器双跑"（runner 无复用口；W-2 为同 run 等价类） **≠** `privacy-authorization:prove` 的 10/10 或 20/20 类读数为本刀产出 **≠** UC-052 行/covered 翻转 **≠** `coveredCount` 变化（仍 8） **≠** HA/容量/suite green **≠** `GAP-UC028-*`/UC-003/SSE 族任何行状态变化（§0.1 三事实钉只作账面核实，不构成翻面） **≠** 生产行为（本地隔离证据） **≠** 其它 flaky proof 的通用修法（本刀只切该 proof 的固定 id 面） **≠** pid 复用残面已闭（r1 登记：`nextHash()` 进程内计数器每跑重置 `:54`-`:55` + owner 含 `process.pid` `:23`-`:25` ⇒ pid 跨跑复用（容器重启/长会话 wraparound）时 `:194` 首个 `insertRequest` 即撞 `UNIQUE (owner_user_id, idempotency_key_hash)`（`0047:40`）23505——命名空间刀**不闭此面**） **≠** 任意 id 零相撞概率（`FX8`=32-bit·残余 ≈ 1.2e-8/对跑·§1.1 熵限量如实登记）。prove EXIT=0 ≠ DONE（完成判定走双审 + nail）。`est live=0`。

---

## §8 STOP（开工三条款 + 停止条件五类）

**STOP · `proofed:dual_pass`（2026-11-02 post-prove 双席 BOTH PASS·留痕见 §9 post-prove 记录行 · 三处钉：Status 行 + 本节 + 卷尾 · 同值）。** 开工三条款（未履行不得 EXEC）：① **pre-exec 双审两独立外席 BOTH PASS 落卷**（含**刀型三择一定谳**=甲/乙/丙、W-2 等价形采纳、W-1 收尾位点钉死（r1）、cap 2462→2464 步进授权（CAP-SANCTION-2464·随届如实采·唯一豁免））；② **协调方明示 EXEC 授权**（含"本刀将真跑 `privacy-authorization:prove`"的显式放行——`checklist:556`/`:636` 历史条款为本刀前置，须逐条兑现后再落码）；③ **§0 全量对届时 tip 重 pin**——`:57`-`:96` 四写点/`:118`-`:128` 主入口/53 处字面清单/`0091:58`/`:86`-`:94`/`0047:40`/runner `:2173`/`:3719` 任一漂移且结论受疑即回炉。

- **现场漂移**：`origin/main` 届 tip 上该 proof 的 53 处字面清单、主入口结构、`insertInterview`/`insertRequest`/`insertTarget` 三 helper、`0091` 两表约束、runner 目标映射、两 policy 四联动点任一变化 → 停·重 pin。
- **机制不满足**：若届时 proof 已改为每跑 id（W-0 前置已成立）、或已加 upsert/cleanup（甲/乙已落）→ **停手上报**（本刀零增量，不得重复立刀）。
- **越界需要**：修法诉求超出 §3 四条（如要求改 runner 以支持暖库复用、要求改产品函数 receipt 幂等、要求清理其它 proof）→ 停·另刀或协调方裁决。
- **验收红不可修**：主门 `EXIT≠0` 且红因不在本刀改动面（如 cold 类复现、既有 51 断言红）→ 停·stash 对照亲证基线·如实登记·**Ban 借机修**；`docs:check` 扫描数 **> cap（本树 2462 / rebase 对届后 2464·CAP-SANCTION-2464）** / PTP 红 → 停（**注意**：起草期未落 C2/C3 前撞 cap 是**预期红**，须先落 cap 步进再跑 docs 门）。
- **关闭诉求**：若双审/授权席要求"顺手关行/翻 matrix `:132`/改 mitigated 措辞" → **停**（§2-2/§7）；本刀无翻面授权。

---

## §9 状态

**`proofed:dual_pass`**（2026-10-30 起草落卷即停 · 2026-11-02 rev r1 回炉修订落卷（§10）· 2026-11-02 rev r2 微修落卷（§10）· 2026-11-02 EXEC 落码行使毕（见下行 EXEC 记录）· 2026-11-02 post-prove 双席 BOTH PASS（见下行 post-prove 记录行）· 起草期本卷恰 3 tracked 路径（本卷 `.md` + 两 policy 脚本）· 产品码/迁移/runner/既有 51 断言零触 · pre-exec 双审两独立外席 r3 BOTH PASS + 协调方明示 EXEC 授权已履行 · ⛔push ⛔动主仓 · est live=0 · markers=0）。

**EXEC 记录行（2026-11-02 EXEC 席亲跑亲证）**：rebase 对届 `2e808c9e3` 冲突恰两 policy 脚本（起草 + r1 两次重放）·dual-keep 承 **CAP-SANCTION-2464**（`MAX_FILES = 2_464` + 四联动点 `2_464`/`2_464`/`f-2464.md`/`:2465` + 相邻注释两处·main 侧 2463 注记全保留史录并留）；C1 落码 = import 前置 + 五项声明逐字形 + **53 处字面 → `fx('<tag>')`**（53 tag 互异亲数·源内固定前缀字面终态 0）+ 四臂位点钉死（W-0 `:122` 后 / W-2a 预置+快照 `:127` 前 / W-2b `:128` 后 / W-1 收尾 `admin.end()` 前）·既有 51 断言谓词零改（仅 ff/c0 两处按规则改 id 取值来源）；主门 teed 单跑 **55 PASS / 0 FAIL · EXIT=0 · `PROCESS_EXIT=0`**（W-0 PASS · W-2a 分支打印 `prior-run-residual` · W-2b PASS · W-1 `FX_IDS.size=53` PASS）；变异 M1 红集逐字命中（W-0 红 + `:127` 撞预置残留行 23505 `interview_pkey`·`Key (id)=(…a1) already exists.` 与 warm-2.log:14 全等 · EXIT=1）·同 turn 还原零残留（快照 cmp 全等）+ 还原复跑 **55 PASS / 0 FAIL · EXIT=0**——三 run EXIT 全录零 retry-to-green，`LOCAL_ISOLATED_PROOF_RECEIPT file=` 三行分抄三 teed `.log` 尾；docs 门 scanned **2464 = cap 2464 恰等** EXIT=0 · PTP **12/12** EXIT=0 · markers 五类+行首冲突标记 **0** · lint root 5410=帽恰等 / packages/db 1042=帽恰等 · 零新增 warning · typecheck EXIT=0；W-2 等价形说明逐字入收据（§4-C-2）；收据面 = `ai-docs/delivery/receipts/flkwarm/` 恰 4 `.log`（teed-oneshot / m1-mutation-red / post-restore-rerun / exec-summary·全 `.log` 非扫描面·零新受管件）；EXEC 期偏离登记 2 条实现细节级（W-2a/W-2b SELECT 列别名 camelCase + node: import 前置·均因零新增 warning 帽·谓词语义零变·详见 exec-summary.log §8）。

**post-prove 记录行（2026-11-02 post-prove 双席亲审·BOTH PASS）**：两独立外席对 EXEC 收据面（4 `.log`）+ 落码树逐项复核·BOTH PASS。关键读数：主门 **55/55**（PASS 55 / FAIL 0·三 run EXIT 全录 0/1/0·零 retry-to-green）；变异 M1 红集与 `warm-2.log:14` **逐字全等**（`Key (id)=(…a1) already exists.` 23505 `interview_pkey` 崩溃形·EXIT=1）；**9 变异实测**（双席合计·逐条如实登记）；W-2b 窗口断言**受支持模式恒空**的诚实登记（判别力如实限量·不据此宣称超出设计的隔离保证）。**席2 后续刀建议 4 条登记**（均不在本卷行使·留痕归协调方择优另立）：① W-2b「DO UPDATE 应红」期望撤回/改窗口写入形；② W-2a `!FX_IDS.has` 恒真死防御移位或删；③ receipt §4 显式登记 M1 崩形依赖 W-2a 预置；④ W-2a else 支打印误标外观。双席 PASS ≠ 任何行翻面（§2-2/§7 零触·`GAP-PRIV-AUTHZ-PROVE-FLAKE` stays OPEN · mitigated/cause-unknown 措辞零改）。

**门读数（r2 修订席亲跑·2026-11-02）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2462 = cap 2462**（本树恰等零多放·r1 两脚本注记预登数值零动）· `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0** · 改动集 markers **0/0**（五类标记词 + 行首冲突标记·词面运行时组装）· 面收敛 **merge-base 口径**：`git diff --name-status $(git merge-base HEAD origin/main)..HEAD` = 本卷 + 两 policy 恰 3 tracked（对 `origin/main` 裸 diff 9 条 = main 侧 quizdx 6 条 + 本支面 3 条·非本支越界·rebase 后裸差收敛为本支面）。

**EXEC 期预登（未行使）**：C1 proof 改动 + C4 `.log` 收据 → terminal 受管件数 **2464**（rebase 对届 `2e808c9e3` 后承 CAP-SANCTION-2464·零新增）· 主门期望 **55 PASS** · 变异 M1 期望红集 **W-0 + 崩溃 EXIT=1（撞全等重建 `RESIDUAL_INTERVIEW` 残留行）** · `PROCESS_EXIT` 逐 run 入据 + teed `.log` 附 `LOCAL_ISOLATED_PROOF_RECEIPT file=…` 路径行。

---

## §10 rev 修订记录（r1 dual 回炉 + r2 微修轮 · 2026-11-02 · 本节为修订留痕 · 刀型丙与 §3 四条骨架不变）

**dual r1 两独立外席 FAIL · 高度收敛**（席1 P1×4 / 席2 P0×1+P1×1+P2×4）→ 回炉并集全消化。逐条落法：

| 级 | 发现（两席证据） | 落法（落点节） |
|---|---|---|
| **P0** | W-1 位点永红：53 处 `fx()` 调用全部在 `:125` 之后（模块级零调用），原钉位点（`:122` 后）处 `FX_IDS.size===0` ⇒ `size>0` 恒假 ⇒ `A()` 记录型不抛 ⇒ `failures=1` ⇒ `process.exit(1)` ⇒ 主门每次必红且 EXEC 无自救路径（两席独立同判） | 三择一采 **(a) 并钉死**：W-1 移至收尾（末断言 `:482`-`:483` 后、`admin.end()` `:485` 前）· §1.2 插入序/臂表、§3-C1-⑤、§4-A 同步 · EXEC **禁现场自选** · 断言总数 **55 不变**（未拆 W-1a/W-1b） |
| **P1** | `RESIDUAL_INTERVIEW`/`FOREIGN_INTERVIEW` 末段 10 hex ≠ 历史字面末段 **12** hex（`warm-2.log:14` 亲读 36 字符）⇒ 与 M1 改回的历史字面**不同键**、不撞预置残留行 ⇒ §1.3 期望红集不可复现；「与 ivA 同值」措辞亦误（重构后 `ivA` 必含 `FX8`）（席1 实测 + 席2 隔离 PG E4 逐字复现 warm-2.log 崩溃形） | 两常量改 `FX_PREFIX + '0000000000a1'` / `'0000000000c0'`（12 hex 全等重建）· 删「与 ivA 同值」改「与历史固定字面同值、与重构后 ivA 异值」（§1.1/§1.2）· **r2 订正**：`FOREIGN_INTERVIEW` 常量撤编（不经 `fx()`·不入 `FX_IDS` ⇒ 与 C1-③「53 处 → fx」双重记账），`:366` 改循六值域 `fx('c0')`·详 §10 rev r2 |
| **P1** | W-2a/W-2b 绝对 owner 断言在真暖库必红：真暖残留行来自旧版 proof（owner=`privacy-authz-owner-<pid>` · status `active`），`ON CONFLICT DO NOTHING` 跳插后读回 ≠ `prior-run-residual` ⇒ 「暖库复跑」目标在真场景自败（席1 推演 + 席2 隔离 PG E1 实测） | W-2a owner **两分支容忍**（`prior-run-residual` ∨ `privacy-authz-owner-` 前缀）∧ `!FX_IDS.has(RESIDUAL_INTERVIEW)`；W-2b 改**相对断言**（A 段前快照 · `:128` 后逐字节恒等·无论初值是谁）（§1.2/§4-A） |
| **P1** | cap 时点错位 2462→应 2464：届 tip 已进 `2e808c9e3`（#188 quizdx 并线 · main 侧 cap 已 2463 · 两 policy 同行已改）⇒ rebase 后 union = 2463 + 本卷 1 = **2464** 且 rebase 必冲突（两席独立同判） | 全卷对届 tip 重锚 **CAP-SANCTION-2464**（§0.1-3 / §3-C2/C3 / §6 附加钉改述「cap 随届值如实采=唯一豁免」/ §8 停止阈值 / §9 / Status 行 / 基线行）· 四联动点数值写 2464/`f-2464.md`/`:2465`（**rebase 后行使**）· dual-keep 预案沿 CAP-SANCTION-2461 CWN 收官并线先例形写明（卷面 §3-C2/C3 + 两脚本 `CAP-SANCTION-2464` 预登注记·**数值本树 2462 恰等保持**） |
| P2-1 | §0.3 归因错：`:307`/`:455`/`:162` 三者不落库 | 移出必撞面改注「非写库点·换 fx 防御性收口」；真撞面 = interview 8 + request 14 + target 24 + `:167` jti 1；字面拆分改 **47 行键（46 实插 + 1 guard 拒插 `:430`）+ 6 值域**·总数 53 不变（§0.3/§1.1/认领核对） |
| P2-2 | `nextHash()` 计数器每跑重置 + owner 含 pid ⇒ pid 复用时 `:194` 首个 `insertRequest` 撞 `0047:40` UNIQUE | §7 补 non-claim；§0.3「唯一等值面」加「在 pid 不复用前提下」限定 |
| P2-3 | FX8=32-bit 熵未限量 | §1.1 一行登记（≈1.2e-8/对跑 · N=1000 期望 ≈0.6% · 特例同 2⁻³² 类） |
| P2-4 | 红跑 digest 链在 `.tmp/isolated-proof-receipts/`（gitignored·易失）·committed 收据仅 PROCESS_EXIT | §4-C-3 注明 teed `.log` 应附 `LOCAL_ISOLATED_PROOF_RECEIPT file=…` 路径行 |
| P2-5 | W-0 对分段拼接逃逸（盲区实测） | §1.2 设计要点登记「W-0 是对 M1 类整行还原变异的有效绊线，非『无固定 id』的存在性证明」 |
| P2-6 | checklist 行号漂移 + 裸 diff 口径 | `:636`→`:637`（future teed 条款归位·全卷同步）；面收敛门/§9 注明 **merge-base 口径**（现裸 diff 9 条系 main 侧 quizdx 件·非本支越界） |

**r1 后自检**：三门亲跑（docs 本树 2462 = 本支 cap / PTP 12/12 / markers 0·读数见 §9）· 断言总数 **55 = 51 + 4 不变** · pins 十一值零翻（cap 项豁免按重锚处理）· STOP 三处 `draft:awaiting_pre_exec_dual` 同值 · diff 恰 3 tracked。

**rev r2 微修轮（dual 回炉 · 2026-11-02 · 席1 FAIL / 席2 PASS → FAIL 优先 · 席1 实证 r1 十条全部兑现·骨架不变）**：

| 级 | 发现 | 落法（落点节） |
|---|---|---|
| **P1** | §3-C1 ③/④ 对 `:366` 双重记账：③「53 处字面 → `fx`」与 ④「`:366` 字面 → `FOREIGN_INTERVIEW`」互斥（`:366` 的 c0 字面只能一个去向）——`FOREIGN_INTERVIEW` 为模块级常量、不经 `fx()`、不入 `FX_IDS`，按 ④ 则 `FX_IDS.size=52`≠53（§1.2/§4-A/§6/§10-P0 四处期望值），按 §1.1 六值域则 ④ 跳单+常量死代码——两读法迫使 EXEC 现场自选（本卷明令禁止） | 采席1 方案一：C1-④ 改「`:366` 字面 → `fx('c0')`（§1.1 六值域同款·bound-consume 比较值·零写库）」· 删 §1.1 `FOREIGN_INTERVIEW` 声明行与字面存留注记「/FOREIGN_INTERVIEW」· C1-②「六项」→「五项」· §10-P1 行补 r2 订正——53 处 fx / `size=53` / §10-P0 依据全链自洽，改动面最小（§1.1/§3-C1） |
| P2-1 | W-1 谓词 `every(形) ∧ size>0` 不含 53 恰等——两处字面误配同一 tag ⇒ size=52 仍绿（tag 塌缩静默） | W-1 增补第三合取支 `FX_IDS.size === 53`（与 §6「53 处 tag 一一对应」自洽·零误红）；§1.2 注明位点钉死实质理由=**计数完备**（最后一个 `fx()` 在 `:468`）而非连接存活、真正危险边界=`:489` `process.exit` 之后（死代码）（§1.2/§4-A） |
| P2-2 | W-2a 容忍支对「快照前已带本跑 owner 形态的行」自掩（无代码可达路径） | §1.2 设计要点一行登记；W-2a 打印命中分支名以留观测面（§1.2） |
| P2-3 | 裸 diff 9 条归属措辞粗（「系 main 侧 quizdx 件」未计本支面） | 改「裸 diff 9 条 = main 侧 quizdx 6 条 + 本支面 3 条」（§4-C-6/§9） |
| P2-4 | §1.1 熵行「50/2³²」与 53 处 fx 口径不一（席1 提·可选采） | 统一为「53/2³²」（§1.1） |

**r2 后自检**：三门亲跑（docs 本树 2462 = 本支 cap / PTP 12/12 / markers 0·读数见 §9）· 断言总数 **55 = 51 + 4 不变**（`size === 53` 为 W-1 同一断言内增补合取支·未拆条）· pins 十一值零翻（cap 豁免按 r1 口径）· STOP 三处 `draft:awaiting_pre_exec_dual` 同值 · diff 恰 3 tracked。

---

*FLKWARM REQUEST · 2026-10-30 起草落卷 · 2026-11-02 rev r1 dual 回炉修订 + rev r2 微修（§10）· 认领=`GAP-PRIV-AUTHZ-PROVE-FLAKE` 行内已登记的**独立后继刀**（`gap-bug-backlog.md:68`「可选后续刀（独立 REQUEST）：fixture 加同键跳过子句/cleanup」（原文该子句含标记词面·卷内按运行时组装惯例以语义改写引用））· 账面核实五事实钉（§0.1：UC-003 映射已闭 / UC-028 TRUTH-BLOCK-E2E 已闭 / QUIZ-DX-HTTP 已并 `2e808c9e3` / L-01、L-08 stale）· 修法=**每跑命名空间**（53 处字面 → `fx(tag)`·源内前缀字面 0）+ **四臂**（W-0/W-2a/W-2b + W-1 收尾位点·r1 钉死）+ cap 2461→2462（起草）→**2464**（rebase 对届 `2e808c9e3` 承 CAP-SANCTION-2464·随届如实采唯一豁免）四联动 · 断言 **55 = 51 + 4** · 锚 @`5c94266b1` 起草亲读亲算 · r1 重锚 @`2e808c9e3` · pins 十一值零翻转 · est live=0 · markers=0 · ⛔push ⛔动主仓 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · proof EXIT=0 ≠ DONE · STOP=`proofed:dual_pass`（2026-11-02 post-prove 双席 BOTH PASS·§9 post-prove 记录行）*

*卫生声明：markers=0 = 本卷改动集五类标记词与行首冲突标记 grep 零命中——词面由门命令运行时组装、卷内不复抄（防自匹配；沿 ha-1/ag09 同款）。*
