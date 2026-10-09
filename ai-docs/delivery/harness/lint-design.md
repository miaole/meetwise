# LINT-DESIGN — C1 lint 门独立设计刀（docs-only 设计定稿）

**状态**：`draft_rev2:awaiting_pre_exec_dual`（rev2 席2 FAIL 三处方：format 半边设计条目+dry-run 零安装矛盾裁决〔dlx 授权或 grep 代理〕+真 token 表述精确化） · base = 主线 `e2834082` · 分支 `line/lint-design` · 立项依据 = NEXT-NODE-BEST-PRACTICES.md C1 ❌（仓内零 lint 配置亲证：无 .eslintrc/eslint.config/biome）+ TSC-GATE-1/2 tsc 门已落（C2 部分就绪）但 lint 独立于 tsc。

## 1. 手段（docs-only 设计定稿·零产品码）
`ai-docs/delivery/harness/lint-design.md` 扩写：
1. **lint 工具选型**：eslint 9 flat config vs biome vs oxc-lint——零依赖边约束（不引入新 npm 包到 root·可加 devDependencies 到独立 config 包）；
2. **规则集设计**：TypeScript strict 辅助规则（no-explicit-any 渐进/naming-convention/no-unused-vars/import-order）——按仓内现状（30 处 catch(:any) 已由 GODFN-1d 消零·残余 req:any 面）设计渐进收紧路径；**format 半边（席2 处方2）**：C1 钉死 eslint9+prettier——eslint9 胜出时 prettier 配置设计独立条目（printWidth/semi/quote/trailingComma 对齐仓内隐式惯例）；biome 胜出时 format 归属 biome（偏离 C1 处方组合须明文声明授权来源=本设计对比表结论）；
3. **门禁挂点**：turbo.json `lint: {}` 空槽（turbo.json:8·与 `typecheck` 同层兄弟任务——结构兼容性天然成立）；**真 token 精确表述（席2 处方3）**：C2 门=`//#typecheck` 根任务 @line/tsc-fix-batches@2ff8b73d（本 base 未并线）——设计按真 token 落笔并标注并线依赖·勿引 turbo.json:6 空 `typecheck` 槽为门；lint 真门=`lint: {}` 空槽+per-workspace lint script 同层点亮；
4. **首日红评估**：全仓 lint dry-run 错数预估+分批清零路径——**预估方法钉死（席2 处方1）**：lockfile eslint=0 亲证（pnpm-lock.yaml eslint 计数=0·传递依赖零）⇒ 全仓 dry-run 无法零安装执行 → **授权 `pnpm dlx` 瞬态 dry-run（package.json/lockfile 零变更·Ban 明写授权）**或 grep 代理静态预估（沿残余 req:any 亲证先例）——二选一钉死入设计；
5. **实施切片建议**。

## 2. Ban
零产品码（纯设计文档）·零 npm 包安装（设计文档不含 package.json 变更）·Key name-only·est 0 live·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 3. 验收
设计文档+选型对比表+规则集清单+首日红预估+实施切片建议+收据 `ai-docs/delivery/receipts/lint-design/`。

## 4. Non-claims
设计 ≠ 实施 ≠ lint 门上线 ≠ C1 勾销。
