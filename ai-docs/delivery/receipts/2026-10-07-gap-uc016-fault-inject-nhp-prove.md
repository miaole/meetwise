# PROVE RECEIPT — **NHP-016-FAULT-01 · UC-016/029 诊断/押题显式失败注入**（Line Y2 · 2026-10-07）

**Status**: `executed:awaiting_post_prove_dual`（实现方收据 = **implementer pre-commit runs · not evidence of record** · evidence of record = POST-PROVE 双审独立复跑 · 禁自批 · alone ≠ dual · STOP）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Knife**: `harness/gap-uc016-fault-inject-nhp.md`（+ micro-patch `95b1fd95`）· slice `gap-uc016-fault-inject-nhp.slice.md` · PRE dual mw-e2e-ha + mw-rag-route BOTH PASS
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-y2`（branch `line/y2-next-nhp` · rebase 自 origin tip `1b85b58a6b4e9fdfdce8d3085cc4bc96b7945ded`）

## Commits（本机 line/y2-next-nhp · 禁 push）

| # | SHA | 内容 |
|---|-----|------|
| 1 | `2051d12a029c8cacd81d3ec2795d31615dc0f7f5` | code(e2e) prove 接线：新 proof `apps/worker/test/uc-e2e-016-nhp-fault.proof.ts` + 三层壳注册（root `package.json` ×2 行 · `apps/worker/package.json` ×1 行 · `scripts/run-e2e-isolated.mjs` 四处：receipt-sources / allowlist / isolatedCommand / migrate-list）· 零产品码（`apps/*/src`·`packages/*/src`·migrations 零 diff） |
| 2 | `20fe852d84885af09dd647b6edef08b9fbcc477a` | fix(e2e) attempt-1 接线修复：夹具 ref UPDATE 参数位次（wiring only · 断言集零改动） |
| 3 | （本 commit） | receipts：本 prove doc + tracked 镜像 `receipts/uc016-fault/uc016-nhp-fault-attempt001.json` + `attempt2-full.log` |

## Prove CMD 与 attempts 台账（全记录 · Ban retry-to-green · EXIT1 不记 flake）

| attempt | CMD | EXIT | 失败类 | 处置 |
|---------|-----|------|--------|------|
| **#1** | `MW_GIT_SHA=2051d12a… env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm uc016:nhp-fault:prove` | **1** | 接线缺陷：夹具 ref UPDATE 参数位次错位（`SET resume_id=$3,privacy_epoch=$4` vs params `[OWNER,resumeId,epoch,…]` → PG `could not determine data type of parameter $2` · run 在种子阶段即止 · **零断言面被行使**） | wiring 修复（恰 2 行内替换 · `20fe852d`）· 断言集零改动 · **非 retry-to-green**（无绿可追 · 非断言迁就） |
| **#2** | `MW_GIT_SHA=20fe852d… env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm uc016:nhp-fault:prove` | **0** | — | **45 PASS / 0 FAIL** · 收据 `.tmp/uc016-fault-receipts/uc016-nhp-fault-attempt001.json`（tracked 镜像 `receipts/uc016-fault/`） |

**隔离直证（attempt #2）**：fresh isolated PG `meetwise-e2e-96621-1791364914621` on 127.0.0.1（boot→migrate `applied=140 skipped=0`→pre-prove 三重 ready）· `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`（test infra ≠ stack truth · releaseEvidence=false · Not HA）· 本机 `pgvector/pgvector:pg16` image Id `sha256:7b822b0aac60967beb1ea5e576b8602c94c300a157d187f385ae3e0da199b90a` 与 AN-RAG-R3/Y ledger 历史逐字同（无 pull · 未依赖 docker.m.daocloud.io 可达性 · digest 比对口径）· 零 live 模型（`env -u` 三键 · `envModelApiKeyUnset=true` 入收据 · scriptedModelClient 注入零 provider 外呼 · 缺 key fail-closed 双保险 `model-client.ts:364` 未被触发亦在位）。

## PC + F1–F6 + N1–N4 逐类结果（45/0 · 逐断言见 `attempt2-full.log`）

| 类 | 结果 | 要点 |
|----|------|------|
| **PC** | 6 PASS | 成功 scripted 模型 quiz+diagnosis 经真队列（`quizDispatchTick`/`diagnosisDispatchTick`）到 ready+done+终态事件+结算 −2.0 —— 正对照活，失败断言确由注入引起 |
| **F1**（E2 quiz 模型缝抛错） | 9 PASS | `resume-quiz.generate` script throw → `quiz_job failed`+对象 `resume_quiz failed`+恰 1 条 `quiz_unavailable`+`attempts=1`+双退款落账 |
| **F2**（E1 diagnosis 同族） | （并入上 9） | 同族全绿（`diagnosis_unavailable` 恰 1 · attempts=1） |
| **F3**（E3 schema 非法 JSON） | 8 PASS | `ok:true`+schema 外形非法 → **第一层 schema 拒绝**（last_error=`quiz:schema_validation_failed` · 实际行为即证据）→ 终态收敛：二次调度零 requeue 零重跑 · attempts 仍=1 ≤ `MAX_QUIZ_JOB_ATTEMPTS=5` |
| **F4**（A1/A2 · D1 重建映射） | 6 PASS | 失败后**重建新实例**→ready（断言文本带 D1 映射标记 · 非字面 failed→pending 口）· 旧失败对象终态稳定不复活 · 事件数不变（C-HA-4 三绑定兑现） |
| **F5**（无悬挂消费） | 3 PASS | 全 job done\|failed 零 stuck · 二次 reap 幂等 0 增量 |
| **F6**（收据） | 落盘 | `.tmp/uc016-fault-receipts/`+tracked 镜像 · frozenParams/scriptedSeams/classification 全录 · ≠SLO≠容量≠HA |
| **N1**（钱 · spec A3） | 6 PASS | F1+F2+F3 失败流全部净 0 · alreadySettled 不重复退（余额不变）· 不发假终态（quiz/diagnosis unavailable 仍=0）· 全 run 对账 `avail === 9.00 − 6×1.0 = 3.00` · 台账 confirmed=6 / released=3 |
| **N2**（死胡同 · micro-patch 键面） | 3 PASS | 键面内（failed 且对象非 ready）恰 3（=F1/F2/F3）逐 job 恰一条 `*_unavailable` · 键面外 alreadySettled（failed+ready）恰 2 全部豁免且 0 条假终态事件 |
| **N3**（ready 不倒退） | 3 PASS | ASett 已 ready 押题/诊断被 reap 晚到失败后**仍 ready**（CAS `NOT IN ('ready')` 负向行使）· 全程 ready 对照组（PC/F4/ASett 六对象）零倒退 |
| **N4**（attempts 有界） | 3 PASS | F1/F2/F3 attempts 全=1 · 二次调度零重跑 · 上界=产品常量 MAX=5 |

## classification（实际行为 · C-RR-3 · 收据同录）

- **F1/F2**：script throw → 产品归类 `external_outcome_unknown` 族（last_error=`quiz:external_outcome_unknown` / `diagnosis:external_outcome_unknown`）· 按实际行为落 receipt，**未**断言 transient/deterministic 分类语义。
- **F3**：实测=第一层 schema 拒绝即终态收敛（`schema_validation_failed`）· **spec E3「transient 重试」分支 NOT claimed**（C-RR-3 · 收据 note 原文在位）。

## micro-patch `95b1fd95` 键面一致性确认

实现与 micro-patch 措辞**逐字一致**：proof `keyFace()` 把 failed jobs 分为 `failedNotReady`（failed 且对象非 ready → 逐 job 恰一 `*_unavailable` 断言面）/ `failedReady`（alreadySettled → **不在断言面**），并对 `failedReady` 反向断言 0 条假终态事件（N1 负向）+ 对象仍 ready（N3）——注释原文引 micro-patch 键面句（「failed 且对象**非 ready** 的注入面 job 恰一条 *_unavailable 终态事件…Ban 藉本键面把已 ready 倒退合法化——N3 仍守」）。**无静默豁免扩大**：豁免面恰=alreadySettled 两 job，且每一步都有对应断言（收割 happened / job failed / 对象 ready / 0 事件 / 零退款）。

## 绑定条件逐条自评

| 条件 | 自评 |
|------|------|
| 1 micro-patch 兑现 | ✅ 上节 · 无豁免扩大 |
| 2 零产品码 diff | ✅ `git diff 1b85b58a..20fe852d -- 'apps/*/src' 'packages/*/src' 'packages/db/migrations'` 空 · 两 commit 全部面=新 proof+注册+receipts · 缺陷→attempt#1 诚实记录+wiring 修复（未触产品） |
| 3 零 live 三缝 | ✅ 每 case scriptedSeams 冻结入收据 · 全程 `env -u MODEL_API_KEY`（+DASHSCOPE 两键）· `envModelApiKeyUnset=true` 入收据 · 零 provider 外呼 |
| 4 C-RR-3/C-HA-4 | ✅ F3 按实际行为落 receipt · E3 transient 不宣称 · F4 断言带 D1 映射标记 + 「非字面 failed→pending 口」落字 + 旧对象终态稳定断言未省略 · D2 产品真表真事件名 |
| 5 prove 纪律 | ✅ attempts 全记录（#1 EXIT1 wiring · #2 EXIT0）· 断言集两次全等（esbuild parse 同源 · #1 未入断言面即止）· EXIT0 ≠ covered ≠ 翻行 ≠ suite green ≠ PERF/LOAD/容量/SLO/HA ≠ 模型质量闭环 |
| 6 行冻结 | ✅ SSOT 零触碰（矩阵/backlog/checklist/queue 不在 diff）· UC-016/029 行措辞不动 · coveredCount=8 · 禁碰清单零触碰 |
| 7 Pins 原值 | ✅ 八值全程未动（本文头 + 收据 nonClaims + proof 文件头） |
| 8 基建 | ✅ `pnpm install --frozen-lockfile` EXIT0 · `node --check` runner OK · esbuild parse proof OK · docker 本地镜像 digest `7b822b0aac60…` 与 ledger 逐字同（无 pull） |

## Non-claims

Not covered · not suite green · not 行升格 · not PERF/LOAD/容量/SLO/HA · not model quality closure · not releaseEvidence · alone ≠ dual · **EXIT0 = 具名 case NHP-016-FAULT-01 真证据（§1.0.1 FAULT 面 gap→case-only 措辞不动 · 升格仅经 coordinator nail）· coveredCount=8 不变**

---

*Prove receipt · NHP-016-FAULT-01 · executed:awaiting_post_prove_dual · 45/0 EXIT0 · coveredCount=8 · STOP（post-prove 双审 mw-e2e-ha + mw-rag-route 由协调方另派）*
