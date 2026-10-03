# G7 Line C POST-LIVE 证据诚实复核（mw-e2e-ha）

本审是对已提交收据的离线复核，不是新的 live/付费 prove。未调用模型 API，未启动 docker，未重跑 trio，未重跑 `nhp-r4-adv-covered`。不代签 mw-model-op。alone≠dual。

- 角色：mw-e2e-ha
- 日期：2026-10-02（PT）
- 分支：`feat/mysql-schema-skeleton`
- 本 PASS 只表示这份 live 收据诚实。≠ G7 suite green · ≠ spend · ≠ covered · ≠ nail · ≠ HA

## SHA（origin 已含）

| 对象 | 短 SHA | 全 SHA |
|------|--------|--------|
| 收据 commit | `7eb1a7e` | `7eb1a7e76635e2549c3440f6c7fdcf8fae090288` |
| 声称跑过的 code | `542c064` | `542c0646d1635b0a3a28c5d821ad50bc6ea625a3` |

`git fetch` 后两者都是 `origin/feat/mysql-schema-skeleton` 的祖先。`542c064` 是 `7eb1a7e` 的祖先。lineC-live 工作树 reflog：跑之前 HEAD 在 `542c064`，随后才提交收据（`6a1c870` rebase 成 `7eb1a7e`）。本审开始时 origin tip 为 `2a66c2283cb95b9154bc028d7c9ae650adc44a89`，落笔时 tip 为 `cd44800d952bb19e5f41871148c55093831863a8`（mw-model-op 的独立复核，本审不采用其结论）。

`7eb1a7e` 只新增两份收据（173 行），不改矩阵 / coveredCount / HA：

- `ai-docs/delivery/receipts/g7-linec-live-2026-10-02/2026-10-02-line-c-chat-live-receipt.json`
- `ai-docs/delivery/receipts/g7-linec-live-2026-10-02/2026-10-02-line-c-chat-live-receipt.md`

`542c064` 只改两份 UC-052 harness 文档，把 `GAP-UC052-POOL-ROLE-LEAK` 标 CLOSED，并写明 UC-052 仍 partial、≠ covered、coveredCount 仍 8。本审不把那次文档关闭升格为 G7 或 covered。

## 收据路径

`ai-docs/delivery/receipts/g7-linec-live-2026-10-02/2026-10-02-line-c-chat-live-receipt.json`（及同目录 `.md`）。已整份读完。

## Live CMD | 记录的 EXIT

已提交 JSON：

- `"cmd": "packages/ai-runtime/node_modules/.bin/tsx /tmp/g7-linec-live.mts"`
- `"cwd": "packages/ai-runtime"`
- `"exit": 0`
- 窗口：`2026-10-02T21:27:52-07:00` 至 `2026-10-02T21:27:55-07:00`
- `calls` 长度 1：`actualModel=qwen3.8-flash`，`evidenceClass=free_quota_wiring_only`，`chatFetchDelta=1`，in=190 out=37
- `caps.observedCalls=1`
- deepseek-v4-pro：`fetchDelta=0`，`bypassed=false`，guard/client 均为 `g7_model_banned_without_approval:deepseek-v4-pro`

收据指向的日志**在磁盘上存在**（不在 `7eb1a7e` 的 git 树里；ledger 被写明 gitignored）：

- `/tmp/g7-linec-live.exit`：`RAW_EXIT=0`
- `/tmp/g7-linec-live.out`：`CHAT_FETCH_DELTA=1` · `LEDGER_CALLS=1` · `LEDGER_TOKENS=227` · `CHAT_ACTUAL_MODEL=qwen3.8-flash` · `CALL_1=... evidence=free_quota_wiring_only` · `DRIVER_EXIT=0`
- `/workspace/meetwise-lineC-live/.tmp/g7-ledgers/2026-10-02-linec-live-chat.ndjson`：3 行（reservation / release / 一条 call）。callId `d03cf49a-c513-4412-93b8-1c48ab90d21a`，`actualModel=qwen3.8-flash`，`estimatedCostCny=0`，`evidenceClass=free_quota_wiring_only`。该文件**没有** `actualSpendCny` 字段。

因此不是「声称 EXIT 0 但产物缺失」。`/tmp/g7-linec-live.mts` 不在 `542c064` 的 git 对象里，不能从该 SHA 单独复现驱动脚本；这是条件，不是把 EXIT 洗掉的理由——EXIT 来自已提交收据且与上述磁盘产物一致。

## Trio / g7SuiteGreen

收据 `trio` 三项显式 `thisRun=not_re_run`，历史 `exit=1`：

- `pnpm e2e:isolated`
- `pnpm e2e:ui:isolated`
- `pnpm verify:e2e-performance`

顶层与 `pins.g7SuiteGreen` 都是 `false`。`nail=false`。没有把 trio 写成 EXIT 0，也没有把 suite 写成 green。

## actualSpendCny

收据 JSON 与 markdown 写的是 **`actualSpendCny=null`**，`consoleRead=not_read`。`estimatedCostCny=0` 标明是 price-book 免费额度估算，不是控制台实付。本审不把 0 算成花费，不补算价格。

## 旁路 hard-disable（`542c064`）

在 `G7_FREETIER_REPROVE=1` 时入口会抛错，不是放行：

- `packages/ai-runtime/src/g7-freetier-reprove-guard.ts:103-105` `isG7FreetierReproveEnabled` 仅当该 env 为 `1`
- 同文件 `:16` `G7_DISABLED_PATHS = embed, rerank, asr, tts, asr_stream, tts_stream`
- 同文件 `:413-415` `assertG7UnguardedPathDisabled`：未开 G7 则 return；开了则 throw `g7_path_disabled:<path>`
- 入口：`embedder.ts:31` · `reranker.ts:26` · `voice.ts:430`（asr）· `voice.ts:474`（tts）· `voice-stream.ts:54`（tts_stream）· `voice-stream.ts:79`（asr_stream）
- chat 允许票在 `packages/ai-runtime/src/model-client.ts:440` `withG7OutboundAllow(() => dispatchOnce(activeModel))`，旁路没有这层包装

本次 `/tmp` 驱动只打印了 `NOT_RUN=embed,rerank,...`，没有进入上述入口去观察抛错。收据用映射标签 `g7_hard_disabled`，运行时字符串仍是 `g7_path_disabled:*`。在本次 env（`G7_FREETIER_REPROVE=1`）下旁路不是 enabled。与「hard-disabled」不矛盾，也不把 not_run 当成 pass。

## 本 commit 没有翻 pins

收据 `pins`：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `coveredWritten=false` · `ms3EqualsR4Closed=false` · `pgRetained=true` · `publicDelete=503` · `g7SuiteGreen=false` · `nail=false`。`7eb1a7e` 的 diff 没有改 coverage 矩阵。

## 抽查（仍真，除非注明）

- G7 e2e 在 flag 未设置时写成 0：`scripts/e2e-live-capability-env.mjs:36-41`（`G7_FREETIER_REPROVE===1` 且 `MEETWISE_TECH_ROLE_FAIL_CLOSED` 空白则赋 `'0'`）。生产默认仍 fail-closed ON：`apps/worker/src/adaptive-role-resolve.ts:36-38`（空白 → on）；`docker/env/worker.env.example:28` 为 `=1`。本次 chat 驱动**没有**调用 `applyLiveE2ECapabilityEnv`，收据记录本次 `MEETWISE_TECH_ROLE_FAIL_CLOSED=unset`。Disclosure-1 对 G7 e2e 路径仍然成立。TECH_ROLE=0 ≠ R1。
- 免费模型 ≠ 生产模型：本次 `qwen3.8-flash`；生产缺省 `packages/ai-runtime/src/text-endpoint-config.ts:67` 与 `docker/env/worker.env.example:47` 均为 `qwen-plus`。
- residual CLOSED 只表示 quota 403 FreeTierOnly 根因已移除，不是 suite green。先前 FR3 `4e453f1` 不改、不重跑。
- C-C 仍 OPEN：本收据把 `pnpm verify:e2e-performance` 标 `not_re_run` / exit 1。未重跑，不把历史失败（HTTP full-E2E / provenance assert，不是 403）洗成绿。

## Blockers

无阻塞。磁盘日志与已提交收据一致：一次免费额度 chat、记录 EXIT 0、trio 未重跑、`g7SuiteGreen=false`、`actualSpendCny=null`、旁路在 G7 开启时抛 `g7_path_disabled`。

## Conditions（不是本审 FAIL 因）

- trio OPEN 1/1/1（not_re_run，未洗成 0）
- C-C 仍 OPEN
- Disclosure-1 仍真（G7 e2e 在 unset 时把 `MEETWISE_TECH_ROLE_FAIL_CLOSED` 写成 0；生产默认 ON）
- 映射标签 `g7_hard_disabled` ≠ 运行时抛出的 `g7_path_disabled`；本驱动未现场观察抛错
- ledger ndjson 与 `/tmp` 脚本不在 git 对象中
- alone≠dual；本文件不代替 mw-model-op
- PASS ≠ G7 green ≠ spend ≠ covered ≠ nail ≠ HA
- haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503
- free `qwen3.8-flash` ≠ prod `qwen-plus`

## 简体中文摘要

已提交收据 `7eb1a7e` 与磁盘 EXIT/ledger 一致：一条 `qwen3.8-flash` 免费额度调用，记录 EXIT 0，`actualSpendCny` 保持 null。三项 G7 prove 写明 not_re_run、仍是 EXIT 1，`g7SuiteGreen=false`。旁路在该 SHA 的 G7 开关下会抛错，没有被写成通过。这只是收据诚实，不是套件变绿，也不是花费或 covered。

Verdict: PASS
