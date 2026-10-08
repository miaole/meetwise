# GODFN-1b EXEC prove 收据 — G7 freetier reprove 卫兵移组合根

**Knife**: GODFN-1b（设计 `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e §2.2/§5.2 · REQUEST 薄壳 `ai-docs/delivery/harness/godfn-1b-exec.md` rev3 @53966369 唯一蓝本）
**EXEC 席**: mw-core · base tip `53966369`（REQUEST rev3 · 等于主线 `16b40f0d` + rev2/rev3 docs）· branch `line/godfn-1b-g7guard`
**状态**: prove 全键终态落卷 · `exec:awaiting_post_prove_dual` · Ban self-approve · alone≠dual
**Pins 十一值照抄（零翻转）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（GAP-DEBT-BE-GODFN 保持 P1 OPEN）

---

## 1. diff 面（仅卫兵移动面 · 设计 §2.2 全范围）

| 文件 | 变更 | pre blob → post blob |
|---|---|---|
| `packages/ai-runtime/src/g7-outbound-interceptor.ts` | **git mv → `test/support/`**（test-support 面 · 设计「EXEC 定」落位）· 内容除 :14 guard import 相对路径外逐字节不动（:79 `installG7OutboundInterceptor(env: NodeJS.ProcessEnv = process.env)` 收注入 env 参数保形 ✓） | `d2ffe9cc` → `4cdc48f5`（新址） |
| `packages/ai-runtime/src/g7-bootstrap.ts` | **git mv → `test/support/`** · 头注补 GODFN-1b test-only 定位（install 本体零变） | `84ff0147` → `ba66ca9f`（新址） |
| `packages/ai-runtime/src/g7-runtime-injection.ts` | **新增** 注入缝（谓词 `freetierReproveEnabled` + 派发票 `withOutboundAllow` · 默认 OFF+pass-through · 零 process.env 读） | — → `f50c1d14` |
| `packages/ai-runtime/src/model-client.ts` | :220/:347/:376 三处 `isG7FreetierReproduceEnabled(process.env)` 直读 → `g7RuntimeInjection().freetierReproveEnabled()`；:379 二次 `installG7OutboundInterceptor(process.env)` 移除（装配责任上移组合根）；:440 `withG7OutboundAllow(...)` → `g7RuntimeInjection().withOutboundAllow(...)`；interceptor import 随迁删除 | `6b12dfca` → `9787da41` |
| `packages/ai-runtime/src/context-budget.ts` | :281 直读 → 注入谓词（import 随迁） | `2bf1959e` → `33ed0e74` |
| `packages/ai-runtime/src/index.ts` | :222 interceptor 导出随迁至 `@meetwise/ai-runtime/g7-test-support`（`test/support/index.ts` barrel）；新增注入缝导出 | `1bf7c795` → `6ea13f25` |
| `packages/ai-runtime/package.json` | exports：`./g7-bootstrap` 与 `./g7-bootstrap.ts` 随迁 test/support 路径 + 新增 `./g7-test-support`；新增 `prove:g7-bootstrap-zero-prod-import` 键 | `ee0a3204` → `62aef72e` |
| `apps/api/src/main.ts` | :2 无条件 `import '@meetwise/ai-runtime/g7-bootstrap'` → **单读点**（`isG7FreetierReproduceEnabled(process.env)` 恰一次）+ 按开关动态装配（`await import('@meetwise/ai-runtime/g7-test-support')` → configure 注入 + install interceptor） | `d20dbed0` → `c5806a12` |
| `apps/worker/src/main.ts` | :9 同上（bootstrap() 体零触碰） | `793c1547` → `593046dc` |
| `packages/ai-runtime/test/g7-freetier-reprove-client.proof.ts` | 组合根替身：configureG7RuntimeInjection（真 ticket）+ finally reset；断言文本零改写 | → `523fe160` |
| `packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts` | 同上 + interceptor import 路径随迁 | → `d46ff819` |
| `packages/ai-runtime/test/g7-freetier-reprove-paths.proof.ts` | interceptor import 路径随迁（内容零变） | → `45d232d1` |
| `packages/ai-runtime/test/g7-bootstrap-zero-prod-import.proof.ts` | **新增静态门**（§3） | — → `3f04c20d` |
| `test/support/index.ts` | **新增** test-support barrel | — → `24301cfb` |
| 四 runner（`run-e2e.mjs` / `run-e2e-ui.mjs` / `e2e-live-capability-env.mjs` / `run-e2e-isolated.mjs`） | **零字节变更**（激活行 :46-47/:51-52/:27-29/:58 与 :2151/:2161 传播链自洽——子进程 env 传播→组合根单读点消费，链路语义不变）；**:2065/:2075 邻近 stderr-withhold 三钉契约 :2162-2163 零触碰**（blob 对照 §5） | `c655235c`/`aa86fb3f`/`996d865b`/`ee762a8c` → 同值（**blob 零位移**） |

零迁移 / 零 SSOT / G7 判定语义零变（env 键名 `G7_FREETIER_REPROVE` 与 `=1` 激活 `trim()==='1'` 钉写 guard :104 逐字节不动）。

## 2. 语义等价论证（G7 off 字节级等价 + G7 on 装配等价）

- **默认注入 = OFF + pass-through ticket**：G7 off 进程（生产全部）pre-1b 各直读点本就返回 false、ticket 仅在 `g7` 分支内调用 → 注入后行为逐点等价（`prove:context-budget` / `prove:model-client-*` 族全绿直证）。
- **G7 on（=1）**：组合根单读点闭包谓词返回 true（env 值进程内不变 → 与 per-call 直读同值）；interceptor 由 main 装配（pre-1b 由 :2/:9 无条件 import 的 bootstrap 先装 + model-client :379 幂等重装；post-1b 由 main 单次装配——同一 install 函数、同一时机窗〔任何 dispatch 前〕）。真进程四向实证：
  - api main G7=1：`predicate=true · interceptor_installed=true`；
  - worker main G7=1：`predicate=true · installed=true`；
  - worker main G7=0 负控：`predicate=false`；
  - api main G7=0：模块导入成功（无装配）。
- **in-process 测试用户**（非组合根进程）须显式装配——三个 g7 proof 已落组合根替身；`apps/worker/smoke/adaptive-attack.ts` 等手工 smoke 不在 prove 矩阵/runner 链内，G7=1 手工跑时须自行装配（登记为已知面，非 prove 面）。

## 3. 静态门（新增 · `prove:g7-bootstrap-zero-prod-import`）

实测输出（310 生产文件遍历 · 注释剥离扫描）：

```text
PASS  P0 production walk found the source tree :: files=310
PASS  P1 production src zero g7-bootstrap specifier
PASS  P2 production src zero g7-outbound-interceptor specifier
PASS  P3 runtime/production src zero isG7FreetierReproveEnabled(process.env) direct read
PASS  P4 runtime/production src zero installG7OutboundInterceptor call
PASS  P5a g7-test-support never statically imported
PASS  P5b g7-test-support dynamic import only in api+worker mains
PASS  P6 ai-runtime src index has no interceptor re-export
PASS  P7 api main keeps exactly one G7 single-read point
PASS  P8 worker main keeps exactly one G7 single-read point
OK g7-bootstrap-zero-prod-import (static gate)   EXIT=0
```

## 4. 全键终态表（§5.2 矩阵 · 60 键 = ai-runtime 17 + 新静态门 1 + api 3 + r4 族 36 + trio 3）

### 4.1 ai-runtime（17+1 · 全 EXIT=0）

| 键 | 终态 |
|---|---|
| prove:g7-freetier-reprove-guard | EXIT=0 |
| prove:g7-freetier-reprove-client | EXIT=0 |
| prove:g7-freetier-reprove-paths | EXIT=0 |
| prove:g7-freetier-fix-round2 | EXIT=0 |
| prove:g7-bootstrap-zero-prod-import（**新增静态门**） | EXIT=0 |
| prove:native-fail-closed | EXIT=0 |
| prove:dashscope-native-config | EXIT=0 |
| prove:text-endpoint-config | EXIT=0 |
| prove:interview-voice-seams | EXIT=0 |
| prove:voice-reliability | EXIT=0 |
| prove:vstream | EXIT=0 |
| prove:voice-stream-preview | EXIT=0 |
| prove:retrieval | EXIT=0 |
| prove:context-budget | EXIT=0 |
| prove:model-client-output-limit | EXIT=0 |
| prove:model-client-dispatch | EXIT=0 |
| prove:model-slot-bypass-static | EXIT=0 |
| prove:model-slot-bypass | **base≡red**（见 §5） |

### 4.2 api voice 族（3 · 全 EXIT=0）

prove:voice-timeout · prove:voice-operation-policy · prove:voice-cancel-http — 各 EXIT=0。

### 4.3 r4 族 36 键（worker · 8 绿 + 28 base≡red）

**绿（EXIT=0）**：`prove:r4-eg1-dual-claim` · `prove:r4-eg2-funnel-covered` · `prove:r4-eg3-domain-isolation-product` · `prove:r4-funnel-covered-count-batch4` · `prove:r4-funnel-covered-count-batch4b-08-eval` · `prove:r4-eg4-wrong-track-product` · `prove:r4-pr1b-combo-root` · `prove:r4-pr1c-no-legacy`

**base≡red 零回归（28 · PASS/FAIL 签名与 base 逐行一致，见 §5）**：
`prove:r4-real-wire-impl` · `prove:r4-wrong-track-prod-surface`（wrapper 形态）· `prove:r4-p-meta-p-r1` · `prove:r4-p-meta-serving` · `prove:r4-p-meta-serving-product` · `prove:r4-p-meta-ms1-product-wire` · `prove:r4-p-r1-fail-closed` · `prove:r4-p-meta-ms2-facets-product` · `prove:r4-p-meta-ms3-deploy-product` · `prove:r4-eg1-dual-claim-product-close` · `prove:r4-eg2-funnel-covered-product-close` · `prove:r4-g-r4-5-product-close` · `prove:r4-eg3-domain-isolation-product-close` · `prove:r4-funnel-product-close` · `prove:r4-funnel-covered-count-batch1` · `prove:r4-funnel-covered-count-batch2` · `prove:r4-funnel-covered-count-batch2b-02b-wire` · `prove:r4-funnel-covered-count-batch3` · `prove:r4-funnel-covered-count-batch3b-05-06-wire` · `prove:r4-eg4-wrong-track-product-close` · `prove:r4-eg5-product-ssot` · `prove:r4-eg5-product-ssot-product-close` · `prove:r4-eg6-ms3-ne-r4` · `prove:r4-eg6-ms3-ne-r4-product-close` · `prove:r4-pr1-product-close` · `prove:r4-wrong-track-adv` · **`prove:r4-wrong-track-adv-live-pg`（强制位点 ✓ 真实 PG hit：`LIVE_PG path truly hit Postgres: mode=isolated · CALL_SITES=1` · 33 PASS 同 base）** · **`prove:nhp-r4-adv-covered`（强制位点 ✓ 94 PASS 同 base）**

红因三族（base 同在，非本刀引入）：① status/harness 文档 pin 族 FAIL（「题域隔离 NOT closed」等文档态断言）；② isolated runner 收据层 ENOENT（`packages/db/src/model-op/model-operation-admission.ts` / `packages/db/src/qbank/qbank-track-local-retrieval.ts` digest 读缺失——runner 收据层与 db 文件均本刀零触碰）；③ prod-surface 的 PG env 门（E2E_ISOLATED 直跑拒跑，wrapper 形态同 base 红）。

### 4.4 e2e trio（3 · 全 base≡red · **零 live spend**）

| 键 | tip | base | 签名 |
|---|---|---|---|
| `pnpm e2e:isolated` | EXIT=1 failureClass=worker（worker boot 窗 11.26s 死亡 · assertionCount=null） | EXIT=1 同 class（11.28s） | 一致 |
| `pnpm e2e:ui:isolated` | EXIT=1 `worker_exited_before_test` | EXIT=1 同码 | 一致 |
| `pnpm verify:e2e-performance` | EXIT=1 `web production build:exit=1` | EXIT=1 同 | 一致 |

三键两侧均在 boot/build 相位死亡（先于任何模型派发）→ **零 live 模型调用**。base 同红 = 零回归（Ban 洗红：无任何断言/文档改写）。

## 5. base≡red 全账（零回归 · 非 retry-to-green）

方法：`git stash push`（代码 diff 移出）→ base 亲跑 → `git stash pop` → PASS/FAIL 签名 diff。红键 29（slot-bypass + r4 28）全部签名逐行一致（机检 diff 空输出）；trio 三键 class/错误码一致。原始 base 日志与 tip 日志存 `logs/`（BASE-* / T2-*）。

**est live 链记账**：本刀全部 60 键 + base 对照轮 = **est live 模型调用 0**（trio 六轮全数 boot/build 相位死亡；r4/G7/voice 族全离线或 mock；live-pg 为真 PG 非真模型）。G7P 系已账 14 不动 · GODFN-1c 在飞独立合账 · 本刀 ≤25/run 约束天然满足。Key name-only：`MODEL_API_KEY` 仅经进程环境 loader 注入 trio（值零入树/零入收据 · 未写任何 .env）。

## 6. attempts 台账（全账 · 含仪器层失误披露）

| 轮 | 面 | 结果 |
|---|---|---|
| 1 | 静态门首跑 | 红×3（P5b/P7/P8）——`runtimeRoot` 解析到 packages/ 而非 repo root，P1-P4 空遍历空过 → 修根 + 增 P0 非空遍历门（Ban vacuous pass）→ 绿 |
| 2 | 静态门 P3/P4 首版 | 组合根自身合法单读点被误扫 → 收窄排除面（P7/P8 钉恰一次）→ 绿 |
| 3 | prove:g7-freetier-reprove-client / fix-round2 首跑 | ReferenceError（注入处用了 `withOutboundAllow` 简写，导入名 `withG7OutboundAllow`）→ 修 → 绿 |
| 4 | prove:model-slot-bypass 首跑 | env 红两连（DATABASE_URL 缺 / destructive_proof_requires_e2e_isolated）→ 改 canonical wrapper `pnpm model-slot-bypass:prove`（isolated runner）→ proof 断言体全绿、runner 收据层 ENOENT 红 → base 同红登记 |
| 5 | r4 族首轮（1-5 批） | 22 红即时 base 对照（wip2/wip3 轮）签名一致 |
| 6 | **仪器层失误（如实披露）** | wip4/wip5 两轮 `git stash pop` 静默失败（`>/dev/null 2>&1` 吞错）→ batch3 之后的「tip」轮实为 base 状态跑 → 发现后自 wip4 stash 逐字恢复全部代码 diff（blob 复核 + 三 g7 proof 复绿）→ **batch3 之后所有键全部 tip 重跑（T2 轮）** 并重新对照 base 签名（§4.3/§5 的数字以 T2 轮为准）→ r4 绿键的收据/矩阵文档重生成后与 HEAD 后续手修漂移 → `git checkout -- ai-docs/` 复位 HEAD（收据文档非本刀 diff 面；emitter 重生成会覆盖后续刀 docs-only 打磨——登记为 emitter 已知副作用） |
| 7 | trio | tip 三键红 → base 三键亲跑同红 → 零回归登记（§4.4） |
| 8 | 组合根装配四向 | api/worker G7=1 装配 ✓ · worker G7=0 负控 ✓（§2） |

## 7. 三钉 blob 对照

| 钉 | base blob | 本刀后 | 判 |
|---|---|---|---|
| `scripts/run-e2e-isolated.mjs`（stderr-withhold 契约 :2162-2163 邻域含 :2065/:2075） | `ee762a8c` | `ee762a8c` | **零字节** ✓ |
| `packages/ai-runtime/src/text-endpoint-config.ts` | `005c68cc` | `005c68cc` | **零字节** ✓ |
| `apps/api/src/modules/interview/interview.service.ts`（1c 面，本刀不触） | `d43a569c`（base 口径） | 未触碰 | ✓ |
| `packages/ai-runtime/src/g7-freetier-reprove-guard.ts`（=1 钉写 :104） | `4e75fae7` | `4e75fae7` | **零字节** ✓ |

## 8. §5.2b 读者名单 diff 前后必看（已看）

读者面=读 `apps/worker/src/main.ts` 文本的 r4 脚本：`r4-pr1b-combo-root-flag-on-evidence.ts`（:80 readSrc('main.ts')·锚 `/组合根/resolveAdaptiveInterviewRole/MEETWISE_TECH_ROLE_FAIL_CLOSED/runInterviewConsumer`）· `r4-eg3-domain-isolation-product-evidence.ts`（:98 · 锚 `trackLocal\s*:`+`REAL-WIRE|dispatchTrackLocalRetrieval`）· `r4-funnel-covered-count-batch1/2/3/4.ts`（各 readSrc('main.ts')）。pre-diff 锚快照 `pre-diff-reader-anchors.txt`；post-diff 实证：**`prove:r4-pr1b-combo-root` EXIT=0 · `prove:r4-eg3-domain-isolation-product` EXIT=0 · funnel 各 batch 键红因与 base 签名一致（锚断言零涉）**——组合根 :9 区改动零伤读者锚。

## 9. 席2 三登记

1. **静态门**：`prove:g7-bootstrap-zero-prod-import`（P0-P8 · §3 全绿 · 含非空遍历反 vacuous 门 + 组合根恰一次单读点钉）——键入 `packages/ai-runtime/package.json`。
2. **三钉契约**：§7 对照表——runner 零字节、text-endpoint-config 零字节、guard 零字节、interview.service 未触；:2065/:2075 与 :2162-2163 零触碰（本刀对 run-e2e-isolated.mjs 全文件零 diff）。
3. **蓝本锚记账**：设计 §2.2 逐点——散读点 4 处尽迁（静态门 P3 零残留）· `:440` 派发票随迁（注入 ticket）· `index.ts:221-222` 导出随迁（:222 → test-support barrel；:221 guard 保留）· 四 runner 激活行零字节保语义（消费端迁至组合根单读点，传播链不变，收据七字段完整性不受损——live-pg receipt 路径本轮未产出 G7 receipt〔G7=0 跑〕，字段逻辑在 runner :58 未动）· guard 本体留 src（蓝本「EXEC 定」项：guard 全函数族 env 参数化注入形即蓝本「收注入 env 非直读」形态，逐字节不动 blob=4e75fae7）· interceptor/bootstrap 移 test-support 面（蓝本「EXEC 定」落位 `packages/ai-runtime/test/support/`）· §2.2「生产构建零 g7-bootstrap import」静态门落地。

## 10. 边界与在飞纪律

- §7.3：本刀先于 1d；voice.ts / model-client.ts 的 1d 面（`voice.ts:453` / `model-client.ts:517` message 判定）零触碰；禁与 1d 并行已守（本 worktree 独占两文件；GODFN-1c 在飞为 interview.service 面，与本刀零共文）。
- vectorPlaneErasureLoop SIGTERM 缺位：**零处置**（蓝本 §1 独立授权面维持登记）。
- 收据/emitter 副作用：r4 证据文档在本刀 prove 轮被 emitter 重写后已复位 HEAD（§6 轮 6）；ai-docs 零净 diff。

## 11. 终态

diff 面（§1 · 11 tracked + 5 新增/随迁文件）+ prove 全键 EXIT=0 或 base 同红零回归（§4）+ attempts 全账（§6）+ 静态门（§3）+ 三钉（§7）+ 读者名单（§8）+ 席2 三登记（§9）→ **push origin line/godfn-1b-g7guard 后 STOP · `exec:awaiting_post_prove_dual` · Ban self-approve**。
