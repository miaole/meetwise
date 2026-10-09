# TSC-GATE-1 e2e/ 全域 tsc 覆盖盘点刀 — EXEC 收据（mw-core）

```yaml
knife: TSC-GATE-1（e2e/ 全域 tsc 覆盖盘点·C1/C2 前置·零修复纯盘点）
seat: mw-core（EXEC）
blueprint: REQUEST @b24fcc5a（ai-docs/delivery/harness/tscgate-survey.md·唯一蓝本+双席处方经协调方授权转达）
base: b24fcc5a4f02b63c34039c7d0b7a3695417181b2（worktree /Users/miaole/Desktop/golucky/meetwise-line-tscgate·分支 line/tsc-gate-survey）
status: **exec:awaiting_post_prove_dual**（STOP·post-prove 双审归协调方派·Ban self-approve·alone≠dual）
env: node v22.22.3 · pnpm 10.18.0 · tsc 6.0.3 · pnpm install --frozen-lockfile Done 4.3s EXIT=0（环境准备跑·非盘点跑·不计跑数·node_modules gitignore 零污染）
est_live_model_calls: 0（纯 tsc 盘点·零 live·零 .env 触碰·Key name-only 零使用）
```

## 1. 交付面（全列·零产品码）

- 临时盘点配置 `e2e/tsconfig.json`（untracked·extends `../tsconfig.json`·noEmit·include `["**/*"]` 非 root 相对防 TS18003·allowJs:true+checkJs:false 排 .mjs 边 TS7016·strict/skipLibCheck/types:["node"] 经 base.json 继承）——**用后即删**（§4 亲证）；
- 盘点跑：Run A canonical 恰 1 次（`pnpm exec tsc -p e2e/tsconfig.json --pretty false`·strict 继承 on·EXIT=2 原值·03:43:44Z）→ **全量 11 错·逐行机器可读诊断原档入收据**（run-A-canonical-strict-on.txt·13 行未过滤未截断）；
- 探针跑：Run B strict-off 恰 1 次（`--strict false`·上限 2 用 1·EXIT=2 原值·03:44:55Z）→ 残余 4 错——双跑分离落实「真断链类 vs 严格噪声类」判据（A∩B=4 strict 无关·A∖B=7 strict 面）；
- 抽核：断链/strict 无关类 4 例全读·strict 噪声类读 5 点位（覆盖 7 错点位）——**每类 ≥3 达标·均亲读源码定性**（02）；
- 门禁设计建议：清零四批估算（B1 断链→B4 噪声·≈15-20 行/6 文件）+ 三挂点利弊（static guards 作钉 / 独立 :check/:prove script 立即可落 / turbo typecheck :6 空挂现成落点作战略）+ 合成建议 B+C 分层·A 作钉·反对降 strict 换绿（03）；
- 收据族：`ai-docs/delivery/receipts/tscgate-survey/`（00 manifest/01 分布+双跑/02 抽核/03 门禁/04 本收据/run-A/run-B 原档/SHA256SUMS.txt）+ harness 状态行推进+席2 三附注落字（harness/tscgate-survey.md）。

## 2. 关键史实发现（如实登记·不裁决·归协调方）

1. **canonical 11 错**（非大规模红面）：TS2304×2·TS2552×1·TS2322×2·TS2345×1·TS2532×5；TS7006/TS7016/TS1484/TS2305/TS2307/TS2724 全零。
2. **已知锚命中**：full.e2e.ts:209 TS2304 `emitE2EFailure`（:14 未导入·failure.ts:21 有导出）——预登记自校准锚恰命中，盘点不动（Ban）。
3. **E2EFAIL-1 修复未并本线**：`83a6ec8b`（":14 import + failure-helper import static guard w/ 2 permanent red TCs"）经 `git merge-base --is-ancestor` 亲证非 HEAD 祖先，仅存 `line/g7-driver-assert`（本地+origin）——故本 base 断链仍在。修复 REQUEST 立项时**必须显式裁并轨/重放顺序**（双刀同触 `:14` 冲突面）。
4. **TS2304 二分**：`emitE2EFailure`（真断链·仓库内）vs `HeadersInit`/`RequestInfo`（proof.ts·类型环境缺口——Headers/RequestInit/Response/fetch 可解析独缺此二名，根因 lib=["ES2022"] 无 DOM + undici-types 全局覆盖边界）——同码不同根，修复分批分列（B1 vs B3）。
5. **门禁素材亲证**：turbo.json:6 `typecheck` 任务全库空挂（apps/*/packages package.json 零实现）= 现成落点；:check/:prove 族实测 491 个；ci.yml :45/:47-53/:56-59 挂点模板；apps/api tsconfig include ["src","test"] 可复制。

## 3. Ban 核对（逐条）

- 零产品码零源码改动：apps/packages src **零 diff**（§4 亲证）；全程仅写收据族+harness+临时 tsconfig（已删）；
- 恰 1 次盘点跑：Run A 恰 1·原值 EXIT=2·零重跑零取优；探针口径预声明在 00-manifest（上限 2·用 1·与 Ban 关系已写明：探针非盘点口径·不形成第二份错数账）；
- Key name-only：零 Key 触碰·零 .env 读·est 0 live ✓；
- pins 十一值照抄：**haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false** +脚注 **actualSpendCny=null**；
- 已知真断链在盘不动：:209 零触碰 ✓；C1/C2 不勾销（盘点=前置供料）✓；临时 tsconfig 用后即删 ✓（§4）。

## 4. 零残留/零 diff 亲证（EXEC 尾·commit 前实测）

- `rm e2e/tsconfig.json` 后 `git status --porcelain`：仅收据族+harness 两 tracked 路径改动·**e2e/ 路径零残留**（untracked 亲证）；
- `git diff --stat`：apps/ packages/ 路径**零行**（零产品码亲证）；diff 仅 ai-docs/delivery/{receipts/tscgate-survey/*, harness/tscgate-survey.md}。

## 5. Non-claims

本刀 ≠ 门禁落地 ≠ 任何修复 ≠ C1/C2 勾销 ≠ :209 修复（修复分批 REQUEST 归协调方另立·须先裁 83a6ec8b 并轨面）≠ strict 门绿宣称（11 错原值在卷）≠ alone=dual。全量诊断原档为唯一错数真相源，本收据聚合数仅为导读。
