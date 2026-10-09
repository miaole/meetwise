# EGRESS-1 EXEC 收据 — provider-egress 清算刀（manifest 申报刀·零产品码）

- **席位**：mw-core · **蓝本**：REQUEST rev2 @`0790e541`（`ai-docs/delivery/harness/egress-ledger.md` rev2 段）· **base**：主线 `7ad2b3e2` · worktree `meetwise-line-egress` · 分支 `line/provider-egress-ledger`
- **日期**：2026-10-07 · **作者**：git -c user.name=mw-core -c user.email=mw-core@meetwise.local
- **终态**：`pnpm provider-egress:prove` **EXIT=0（主线首绿）7/7** · harness → `exec:awaiting_post_prove_dual` · STOP · Ban self-approve · alone≠dual

## 0. 验收门实测

```
node --check scripts/provider-egress-inventory.proof.mjs   → OK
node --check scripts/provider-egress-inventory.mjs         → OK
pnpm provider-egress:prove → EXIT=0
  ✓ TC-MODEL-002-E3-inventory-main            （stats: adapters=5 · operations=10 ·
  ✓ TC-MODEL-002-E3-inventory-missing-operation       registeredConsumerSourcePairCount=43 ·
  ✓ TC-MODEL-002-E3-inventory-policy-cannot-self-shrink  environmentReferences=292 ·
  ✓ TC-MODEL-002-E3-inventory-unregistered-adapter-consumer  releaseEvidence=false）
  ✓ TC-MODEL-002-E3-inventory-unregistered-environment
  ✓ TC-MODEL-002-E3-inventory-unregistered-transport
  ✓ TC-MODEL-002-E3-inventory-no-release-overclaim
static_provider_egress_inventory_proof_valid: selected=7/7; releaseEvidence=false
```

## 1. diff 审计（亲证）

```
git status --short:
 M ai-docs/architecture/ai/provider-egress-inventory.json
 M scripts/provider-egress-inventory.proof.mjs
git diff --numstat:
 270  0  ai-docs/architecture/ai/provider-egress-inventory.json   ← 纯增行 0 删 0 改（46 env×5 行 + 10 consumer×4 行 = 270）
   1  1  scripts/provider-egress-inventory.proof.mjs               ← 恰 1 行：:31 33→43
全仓 git diff 删除行计数 = 1（即 proof.mjs 旧行；manifest 纯增）
apps/ packages/ src 零 diff（零产品码亲证·g7-freetier-reprove-guard.ts 源码零改）
既有 246 条零漂移：逐 (name,source,class) 对账 base=HEAD vs 新树 → drift=[]（脚本亲证）
新增去重：env (name,source) 46/46 唯一 · consumer (adapter,source) 10/10 唯一
```

proof.mjs 恰此一行（其余断言零改）：

```diff
-    assert.equal(result.stats.registeredConsumerSourcePairCount, 33);
+    assert.equal(result.stats.registeredConsumerSourcePairCount, 43);
```

## 2. manifest environmentReferences +46 对（逐条 file:line 证据·均 EXEC 亲读）

class 词汇遵既有 246 条税表（inventory.mjs:224 仅查非空；REQUIRED_CLASSES 四值闭集仅辖 consumers）。分布：test-isolation×30 · test-fixture×8 · manual-live-smoke×3 · live-test-launcher×3 · test-only-guard×2。

### MODEL_API_KEY ×25
| # | source | class | 证据（file:line） |
|---|--------|-------|--------------------|
| 1 | apps/api/test/godfn-1c-begin-guard-merge.proof.ts | test-isolation | :79-80 `delete process.env.MODEL_API_KEY/MODEL_BASE_URL` 防御性删键禁 live |
| 2 | apps/api/test/uc-e2e-001-nhp-adv.proof.ts | test-isolation | :53-56 入口断缺席+delete（Ban live/Ban MODEL_API_KEY） |
| 3 | apps/api/test/uc-e2e-001-nhp-bound.proof.ts | test-isolation | :56-59 同型 fail-closed 隔离 |
| 4 | apps/api/test/uc-e2e-001-nhp-fault.proof.ts | test-isolation | :69-72 同型 |
| 5 | apps/api/test/uc-e2e-001-nhp-neg.proof.ts | test-isolation | :61-64 同型 |
| 6 | apps/api/test/uc-e2e-004-career-path-fault.proof.ts | test-isolation | :174 child env 删键（:423 zero-trace 旁证） |
| 7 | apps/api/test/uc-e2e-011-adv-refund-callback.proof.ts | test-isolation | :25/:75 Ban MODEL_API_KEY/live 声明（no-live 族） |
| 8 | apps/api/test/uc-e2e-025-nhp-bound.proof.ts | test-isolation | :103 delete |
| 9 | apps/api/test/uc-e2e-025-nhp-fault.proof.ts | test-isolation | :114 delete |
| 10 | apps/api/test/uc-e2e-028-nhp-fault.proof.ts | test-isolation | :139 delete+:146 断言缺席 |
| 11 | apps/web/e2e-ui/voice-duplex.spec.ts | manual-live-smoke | :8 文本 MODEL_API_KEY 禁冒充语音凭据（:4-9 真实键门控·真 TTS/ASR live 链路 :166-285） |
| 12 | apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts | test-isolation | :343-344 自审「prove never assigns MODEL_API_KEY」 |
| 13 | apps/worker/test/r4-p-meta-ms3-deploy-product.proof.ts | test-isolation | :374-375 同型自审 |
| 14 | apps/worker/test/uc-e2e-016-nhp-fault.proof.ts | test-isolation | :147/:303 断言 env 未设+model-client.ts:364 fail-closed 双保险 |
| 15 | packages/ai-runtime/src/g7-freetier-reprove-guard.ts | **test-only-guard** | :275 读 Key（详见 §4） |
| 16 | packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts | test-fixture | :89 `process.env.MODEL_API_KEY = 'proof-g7-key'`（假值桩） |
| 17 | packages/ai-runtime/test/g7-freetier-reprove-client.proof.ts | test-fixture | :55 同型假值桩 |
| 18 | packages/ai-runtime/test/g7-freetier-reprove-guard.proof.ts | test-fixture | :128 `assertModelApiKeyPresent({ MODEL_API_KEY: 'test-not-a-real-secret' })` |
| 19 | packages/ai-runtime/test/g7-freetier-reprove-paths.proof.ts | test-fixture | :93 `MODEL_API_KEY: 'sk-test-not-live'` |
| 20 | packages/ai-runtime/test/gap-rag05-classifier.proof.ts | test-isolation | :43 断言三键全 unset（:11 env -u 运行契约） |
| 21 | packages/db/test/uc-e2e-017-nhp-load.proof.ts | test-isolation | :20 「零 live 模型 · 零 MODEL_API_KEY」run-e2e-isolated 契约 |
| 22 | packages/db/test/uc052-external-sink-async-purge.proof.ts | test-isolation | :5 「Ban live · MODEL_API_KEY not loaded」 |
| 23 | packages/db/test/uc052-external-sink-retention.proof.ts | test-isolation | :5 「no MODEL_API_KEY」 |
| 24 | scripts/e2e-live-capability-env.mjs | live-test-launcher | :15 依 MODEL_API_KEY 在场启用 live 面（:11 「Never invents credentials」） |
| 25 | scripts/g7-freetier/redact-gap-evidence.mjs | test-isolation | :35 键值 `[REDACTED_KEY]` 脱敏 regex（循 scripts/e2e-platform/secret-redaction.mjs=test-isolation 先例） |

### MODEL_BASE_URL ×8
| source | class | 证据 |
|--------|-------|------|
| apps/api/test/godfn-1c-begin-guard-merge.proof.ts | test-isolation | :80 |
| apps/api/test/uc-e2e-001-nhp-adv.proof.ts | test-isolation | :54-56 |
| apps/api/test/uc-e2e-001-nhp-bound.proof.ts | test-isolation | :57-59 |
| apps/api/test/uc-e2e-001-nhp-fault.proof.ts | test-isolation | :70-72 |
| apps/api/test/uc-e2e-001-nhp-neg.proof.ts | test-isolation | :62-64 |
| apps/api/test/uc-e2e-004-career-path-fault.proof.ts | test-isolation | :174 |
| apps/api/test/uc-e2e-025-nhp-bound.proof.ts | test-isolation | :104 |
| apps/api/test/uc-e2e-025-nhp-fault.proof.ts | test-isolation | :115 |

### MODEL_ENDPOINT_PROFILE ×4
| source | class | 证据 |
|--------|-------|------|
| packages/ai-runtime/src/g7-freetier-reprove-guard.ts | **test-only-guard** | :135 `next.MODEL_ENDPOINT_PROFILE = profile.endpointProfile`（§4） |
| packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts | test-fixture | :91 `= 'dashscope-cn-beijing'` |
| packages/ai-runtime/test/g7-freetier-reprove-client.proof.ts | test-fixture | :56 同型 |
| scripts/e2e-live-capability-env.mjs | live-test-launcher | :16-17/:30 缺省补 profile（仅当 live 键在场） |

### MODEL_TEST_TRANSPORT_OVERRIDES ×2
| source | class | 证据 |
|--------|-------|------|
| packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts | test-fixture | :93 fixture 复位块内 `delete`（保证确定性 adapter 配置） |
| packages/ai-runtime/test/g7-freetier-reprove-client.proof.ts | test-fixture | :53 同块 `delete`（:32 列入 MUTATED 台账） |

### DASHSCOPE_API_KEY ×3
| source | class | 证据 |
|--------|-------|------|
| apps/api/test/uc-e2e-028-nhp-fault.proof.ts | test-isolation | :140 delete+:147 断言缺席 |
| packages/ai-runtime/test/gap-rag05-classifier.proof.ts | test-isolation | :43 |
| scripts/g7-freetier/redact-gap-evidence.mjs | test-isolation | :35 |

### 单条族 ×4
| name | source | class | 证据 |
|------|--------|-------|------|
| DASHSCOPE_ASR_API_KEY | apps/web/e2e-ui/voice-duplex.spec.ts | manual-live-smoke | :5 真实键门控（缺席即 skip·Ban 假绿） |
| DASHSCOPE_TTS_API_KEY | apps/web/e2e-ui/voice-duplex.spec.ts | manual-live-smoke | :4 同上 |
| DASHSCOPE_VISION_API_KEY | scripts/e2e-live-capability-env.mjs | live-test-launcher | :20 仅在场时启用 OCR preview 旗标 |
| DASHSCOPE_COMPAT_BASE_URL | packages/ai-runtime/test/gap-rag05-classifier.proof.ts | test-isolation | :43 断言 unset |

## 3. manifest adapters[].consumers +10 对（class=local-adapter-test·五工厂直调逐一亲读确证假 transport）

| adapter | consumer | 工厂直调证据 | 假 transport 证据 |
|---------|----------|--------------|--------------------|
| openai-compatible-chat | packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts | :143/:246 `openAICompatibleClient(` | `globalThis.fetch` 桩 :137/:241（restore :260） |
| openai-compatible-chat | packages/ai-runtime/test/g7-freetier-reprove-client.proof.ts | :74/:84/:106/:134/:156 `openAICompatibleClient(` | fetch 桩 :95/:117/:150（restore :164） |
| dashscope-embedding | packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts | :211 `dashscopeEmbedder(` | 断言 `g7_path_disabled:embed` fail-closed 无外呼 |
| dashscope-embedding | packages/ai-runtime/test/g7-freetier-reprove-paths.proof.ts | :99 | :102 断言 `g7_path_disabled:embed` |
| dashscope-rerank | packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts | :212 `dashscopeReranker(` | `g7_path_disabled:rerank` |
| dashscope-rerank | packages/ai-runtime/test/g7-freetier-reprove-paths.proof.ts | :106 | :109 同型 |
| dashscope-http-voice | packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts | :213 `dashscopeAsr(` / :214 `dashscopeTts(` | `g7_path_disabled:asr`/`:tts` |
| dashscope-http-voice | packages/ai-runtime/test/g7-freetier-reprove-paths.proof.ts | :113/:120 | :116/:123 同型 |
| dashscope-streaming-voice | packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts | :217 `dashscopeStreamingAsr(` / :222 `dashscopeStreamingTts(` | `g7_path_disabled:asr_stream`/`:tts_stream` |
| dashscope-streaming-voice | packages/ai-runtime/test/g7-freetier-reprove-paths.proof.ts | :127/:134 | :130/:137 同型 |

## 4. g7-freetier-reprove-guard.ts 申报 class=test-only-guard（源码零 diff·循先例）

- **非真雷论证（席2 亲证承接·EXEC 复核一致）**：
  - **g7 门控**：`packages/ai-runtime/src/model-client.ts:380-383` — `const g7 = g7RuntimeInjection().freetierReproveEnabled();` → `if (g7) { assertModelApiKeyPresent(process.env); }`（:**382** 为该调用行）——生产路径仅在 G7 旗标下触达守卫，缺键 fail-closed（`g7_model_api_key_missing`）。
  - **指纹-only**：`packages/ai-runtime/src/g7-freetier-reprove-guard.ts:274-277` — `assertModelApiKeyPresent` 读 `env.MODEL_API_KEY`（:**275**）仅作在厚度校验，返回 `keyFingerprintPrefix(key, 8)`（:**277**）sha256 前 8 位指纹——原始键值不出函数、不落日志/账本。
  - **profile 写**：同文件 :135 `applyG7FreetierReproveEnv` 内 `next.MODEL_ENDPOINT_PROFILE = profile.endpointProfile` — g7 测试环境注入面，非生产配置读取。
- **先例**：`packages/ai-runtime/src/dashscope-native-config.ts:137-141` `rejectDashscopeNativeTransportOverride`（NODE_ENV==='test' + DASHSCOPE_TEST_TRANSPORT_OVERRIDES==='1' 门控）→ manifest 既有申报即 class=test-only-guard。
- 本刀对该文件**源码零改**（diff 亲证 apps/packages 零 diff），仅 manifest environmentReferences 两行申报（MODEL_API_KEY/MODEL_ENDPOINT_PROFILE）。src 内嵌守卫结构债另域立账，本刀不洗（Non-claims）。

## 5. pins（十一值照抄）+ 脚注

haStatus=NOT_HA · releaseEvidence=false（manifest 顶层 `releaseEvidence:false` 未动·inventory.mjs:115 门在）· claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · **脚注 actualSpendCny=null**。

## 6. Non-claims 与资源面

- 本刀 ≠ env 卫生完成（Runtime env 值轮换/泄漏扫描另域）≠ egress 策略变更（class 归类照实非新政策）。
- **est live 模型调用 = 0**：全程 name-only 引用 env 名（零 .env 写·零真实键值入 manifest/收据·prove 门纯静态无网络）。
- 双席化妆级残留已落 harness：标题旧值（64 行 ~40 文件→实数 56/25/9）+ §3 Ban「prove 门断言零改」精准豁免括注。
- 遗留：TOKSTREAM-S2 探针债不在本 base（369a07ca 非祖先）；g7 src 内嵌守卫结构债另域。

## 7. 状态

`exec:awaiting_post_prove_dual` — push origin `line/provider-egress-ledger` 后 STOP，待协调方双席 post-prove 审。Ban self-approve · alone≠dual · 席位 mw-core。
