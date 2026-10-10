# POST-LIVE · mw-model-op · Line C G7 chat-only window

**Verdict**: **PASS**（只闭合「一次免费模型接线调用、封顶内、禁模生效、旁路未跑」· **≠** G7 green · **≠** trio green · **≠** R1 closed · **≠** HA · **≠** MODEL-OP-00 closed · **≠** dual）  
**Role**: `mw-model-op`  
**Date**: 2026-10-02 (~21:35 PT)  
**Receipt**: `7eb1a7e76635e2549c3440f6c7fdcf8fae090288`  
**Code SHA claimed run**: `542c0646d1635b0a3a28c5d821ad50bc6ea625a3`（祖先于收据）  
**Branch**: `feat/mysql-schema-skeleton`  
**Live re-run**: **not_run**（本审未调模型、未重跑脚本）  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

本 PASS **不能**读成 G7 suite green，也 **不能**读成先前 trio 变绿。窗口约 3 秒，一次 chat 接线。

---

## 范围

收据目录只有 md + json，**没有** ndjson。命令是 `packages/ai-runtime/node_modules/.bin/tsx /tmp/g7-linec-live.mts`，cwd `packages/ai-runtime`，EXIT **0**，窗口 `2026-10-02T21:27:52-07:00`–`21:27:55-07:00`。

`/tmp/g7-linec-live.mts` **存在**（3616 bytes）且 **不在** `542c064` / `7eb1a7e` 的 git 对象里（`git hash-object` 无对应 blob，无同内容的仓库文件）。**不能**从该 SHA 复现。未把脚本内容写入本收据。

## 字段核对（收据 json/md）

| Claim | Receipt field | Match |
|-------|----------------|-------|
| e2e:isolated 本轮未跑 | `trio[0].cmd=pnpm e2e:isolated` · `exit=1` · `thisRun=not_re_run` | yes（用词是 `not_re_run` + 历史 EXIT 1，不是本轮 pass） |
| ui / performance 同 | `trio[1]` `trio[2]` 均为 exit 1 · `not_re_run` | yes |
| g7SuiteGreen | `false`（顶层与 pins） | yes |
| 1× qwen3.8-flash in=190 out=37 `free_quota_wiring_only` | `calls[0]` | yes |
| per-call actualModel | `calls[0].actualModel=qwen3.8-flash` | yes |
| deepseek-v4-pro 拒绝 | `ALLOW_DEEPSEEK_V4_PRO_TEST=unset`；guard 与 client 均为 `g7_model_banned_without_approval:deepseek-v4-pro`；`fetchDelta=0`；`bypassed=false` | yes |
| 六旁路 not_run | embed/rerank/asr/tts/asr_stream/tts_stream · `g7_hard_disabled` | yes |
| Caps | `caps.cny=5` · `tokens=2000000` · `calls=200` · observed 1 call · 227 tokens | yes（190+37=227） |
| actualSpendCny | JSON **null** · `consoleRead=not_read` | yes |
| estimatedCostCny=0 | 标明 price-book estimate，**不是** console actual | yes（未把 0 写入 actualSpendCny） |
| R1 | `r1Closed=false` · `MEETWISE_TECH_ROLE_FAIL_CLOSED=unset` · `techRoleIsNotR1=true` | yes |
| coveredCount / pins | 8 · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · pgRetained=true · publicDelete=503 · nail=false | yes |
| Ledger | `.tmp/g7-ledgers/2026-10-02-linec-live-chat.ndjson`，写明 gitignored、不是 2026-09-23 账 | 路径新；文件不在本 commit |
| allow-ticket | runner 文本：`openAICompatibleClient complete()` chat path | 与 `542c064` `model-client.ts:440` `withG7OutboundAllow(() => dispatchOnce)` 一致；embed/rerank/voice **无**该包装 |

代码 `542c064`：`G7_RUN_COST_CAP_CNY=5`，token cap `2_000_000`，call cap `200`，禁模抛 `g7_model_banned_without_approval`，`buildG7ReceiptFields` 写死 `actualSpendCny: null`，旁路抛 `g7_path_disabled:*`（收据标签仍是 `g7_hard_disabled`）。

实现者工作树里那份 gitignored ndjson（不在收据目录）只有 3 行：reservation `qwen3.8-flash`、同 id release、一条 settled call（callId / 190 / 37 / estimated 0 / `free_quota_wiring_only`）。无更早调用。未把正文抄入本审。

## 脱敏

md+json：`sk-` / Bearer / `MODEL_API_KEY=` / private-key **0** 命中。`keyFingerprint` 重复既有 2026-09-23 G7 收据已发表的值，无新指纹。`keySource` 只是外部 loader 路径，无 Key 值。

## Blockers

无。

## Non-claims

- 本窗口 **不是** `e2e:isolated`，**不是** trio 重跑。历史 EXIT 1/1/1 仍 OPEN。  
- **≠** G7 green · **≠** suite green · **≠** R1 closed · **≠** HA · **≠** `releaseEvidence=true` · **≠** MODEL-OP-00 closed · **≠** nail。  
- `/tmp` 脚本不可从 SHA 复现。本 PASS 单独 **≠** dual（`mw-e2e-ha` 仍要另签）。  
- `estimatedCostCny=0` **不是** actual spend。控制台未读，`actualSpendCny` 保持 null。

---

Verdict: PASS
