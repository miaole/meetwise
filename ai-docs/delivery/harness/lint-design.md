# LINT-DESIGN — C1 lint 门独立设计刀（docs-only 设计定稿）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `e2834082` · 分支 `line/lint-design` · 立项依据 = NEXT-NODE-BEST-PRACTICES.md C1 ❌（仓内零 lint 配置亲证：无 .eslintrc/eslint.config/biome）+ TSC-GATE-1/2 tsc 门已落（C2 部分就绪）但 lint 独立于 tsc。

## 1. 手段（docs-only 设计定稿·零产品码）
`ai-docs/delivery/harness/lint-design.md` 扩写：
1. **lint 工具选型**：eslint 9 flat config vs biome vs oxc-lint——零依赖边约束（不引入新 npm 包到 root·可加 devDependencies 到独立 config 包）；
2. **规则集设计**：TypeScript strict 辅助规则（no-explicit-any 渐进/naming-convention/no-unused-vars/import-order）——按仓内现状（30 处 catch(:any) 已由 GODFN-1d 消零·残余 HMAC×3/req:any·c:any 参数面）设计渐进收紧路径；
3. **门禁挂点**：turbo.json lint 任务+CI 接线建议（与 C2 tsc 门同层）；
4. **首日红评估**：全仓 lint dry-run 错数预估+分批清零路径；
5. **实施切片建议**。

## 2. Ban
零产品码（纯设计文档）·零 npm 包安装（设计文档不含 package.json 变更）·Key name-only·est 0 live·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 3. 验收
设计文档+选型对比表+规则集清单+首日红预估+实施切片建议+收据 `ai-docs/delivery/receipts/lint-design/`。

## 4. Non-claims
设计 ≠ 实施 ≠ lint 门上线 ≠ C1 勾销。
