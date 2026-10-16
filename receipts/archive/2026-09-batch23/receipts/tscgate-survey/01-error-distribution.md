# TSC-GATE-1 错型分布 + 双跑对照（canonical 台账）

数据源：`run-A-canonical-strict-on.txt`（canonical·恰 1 次）、`run-B-strict-off.txt`（探针·上限 2 用 1）。原始逐行诊断以两份原档为准（--pretty false 机器可读·未过滤未截断）。

## 1. 总量

- **canonical 全量错数 = 11**（tsc 6.0.3·EXIT=2 原值·耗时 ≈1s/跑）
- 命中文件 6/14（.ts 面）：full.e2e.ts、helpers/e2e-helpers.proof.ts、helpers/interview.ts、helpers/sse.ts、ocr-fixture.ts、performance.e2e.ts
- 零错文件 8：helpers/assert.ts、auth.ts、classify-failure.ts、commerce.ts、failure.ts、http.ts、resume.ts、voice.ts
- failure-class.mjs：allowJs:true 计入解析、checkJs:false 不产生诊断（席2 附注② 面生效）
- 覆盖面：`e2e/` 全域 14×.ts + 1×.mjs（include `**/*` 相对临时 tsconfig 所在目录= e2e/）

## 2. 错型 × 文件交叉表（canonical）

| TS 码 | full.e2e.ts | proof.ts | interview.ts | sse.ts | ocr-fixture.ts | performance.e2e.ts | 合计 |
|-------|-------------|----------|--------------|--------|----------------|--------------------|------|
| TS2304 找不到名称 | 1 (:209) | 1 (:54) | – | – | – | – | **2** |
| TS2552 找不到名称(有建议) | – | 1 (:70) | – | – | – | – | **1** |
| TS2322 型不配 | – | – | 1 (:182) | 1 (:10) | – | – | **2** |
| TS2345 实参型不配 | – | – | – | 1 (:12) | – | – | **1** |
| TS2532 possibly undefined | – | – | – | – | 2 (:75,:76) | 3 (:52,:53,:54) | **5** |
| **合计** | **1** | **2** | **1** | **2** | **2** | **3** | **11** |

## 3. 双跑对照（strict on/off 分离·判据落实）

| 错点 | Run A (strict on) | Run B (strict off) | 判定 |
|------|-------------------|--------------------|------|
| full.e2e.ts:209 TS2304 `emitE2EFailure` | 在 | **在** | strict 无关·**真断链（仓库内符号）** |
| proof.ts:54 TS2304 `HeadersInit` | 在 | **在** | strict 无关·类型环境缺口（lib/types 面） |
| proof.ts:70 TS2552 `RequestInfo` | 在 | **在** | strict 无关·类型环境缺口（同上族） |
| interview.ts:182 TS2322 string→字面量联合 | 在 | **在** | strict 无关·**真型不配**（includes 不收窄） |
| sse.ts:10 TS2322 `string\|undefined`→string | 在 | 消失 | strictNullChecks+noUncheckedIndexedAccess 噪声 |
| sse.ts:12 TS2345 同族 | 在 | 消失 | 同上 |
| ocr-fixture.ts:75/:76 TS2532 ×2 | 在 | 消失 | 同上 |
| performance.e2e.ts:52-54 TS2532 ×3 | 在 | 消失 | 同上 |

- **A∩B（strict 无关）= 4**；**A∖B（strict 面）= 7**。Run B 残余 = 4（EXIT=2 原值）。
- 协调方判据映射：真断链枚举码〔TS2304/2305/2307/2724〕命中 = TS2304×2（TS2305/2307/2724 = 0）；严格噪声枚举码〔TS7006/7016/2345/2322/strict-null/TS1484〕：TS7006=0·**TS7016=0（allowJs:true+checkJs:false 处方生效·.mjs 边零噪声）**·TS2345=1·TS2322=2·strict-null 族（TS2532）=5·TS1484=0。
- **重要细分（抽核定谳，见 02）**：TS2304×2 非同质——`emitE2EFailure`（:209）系仓库内真断链；`HeadersInit`/`RequestInfo`（proof.ts）系 lib/types 环境缺口（`Headers`/`RequestInit`/`Response`/`fetch` 均可解析、独缺此二全局类型名）。同码不同根，修复分批须分列。

## 4. 结构性读数

- e2e/ 面总体型健康度高：14 文件仅 6 文件命中、11 错中 7 系 strict-null 家族机械噪声（正则捕获组/二维数组索引/percentile 返回），真需产品判断的仅 4 处（1 断链 + 1 型不配 + 2 类型环境决策）。
- 零 TS7006（无隐式 any）·零 TS1484（verbatimModuleSyntax 无违例）——e2e/helpers 经 E2EFAIL-1 等前刀硬化后类型面干净。
- strict-off 探针证明：`--strict false` 可把 11 → 4，但**残余 4 中仍含真断链与真型不配**——「降 strict 换绿」不可行，门禁应 strict-on + 先修后门（见 03）。
