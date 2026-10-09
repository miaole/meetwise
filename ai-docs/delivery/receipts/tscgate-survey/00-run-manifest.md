# TSC-GATE-1 盘点跑 manifest（EXEC 期预声明·跑前落字）

- 蓝本：REQUEST @`b24fcc5a`（ai-docs/delivery/harness/tscgate-survey.md）· 分支 `line/tsc-gate-survey` · worktree `/Users/miaole/Desktop/golucky/meetwise-line-tscgate` · base HEAD = `b24fcc5a4f02b63c34039c7d0b7a3695417181b2`
- 环境：node v22.22.3 · pnpm 10.18.0 · tsc 6.0.3（`pnpm exec tsc --version`）· `pnpm install --frozen-lockfile` Done 4.3s EXIT=0（环境准备跑，非盘点跑，不计入跑数）
- 临时 tsconfig：`e2e/tsconfig.json`（untracked·extends `../tsconfig.json`·`noEmit`·`include: ["**/*"]`〔相对本文件=e2e/ 全域·非 root 相对·防 TS18003〕·`allowJs:true`+`checkJs:false`〔.mjs 边 TS7016 噪声排除〕·strict/skipLibCheck/types:["node"] 经 root→packages/config/tsconfig/base.json 继承）· 用后即删+`git status --porcelain` 亲证零残留

## 跑数预声明（EXEC 期）

| 跑 | 命令 | 性质 | 上限 |
|----|------|------|------|
| Run A（canonical） | `pnpm exec tsc -p e2e/tsconfig.json --pretty false`（strict 继承=on） | **恰 1 次**·全量机器可读诊断入收据·错数/错型分布唯一台账 | 1（Ban「恰 1 次盘点跑」即指此跑：禁重跑至绿·禁多跑取优·失败不重跑如实登记） |
| Run B（探针·strict off） | `pnpm exec tsc -p e2e/tsconfig.json --strict false --pretty false` | 松紧分离探针·只作「真断链类 vs 严格噪声类」判据·**不形成第二份全量错数账** | 授权上限 2·本刀声明用 1 |
| Run C（备用探针，预声明不预承诺） | 同 B 面按 TS 码过滤口径（如需） | 仅当 B 不足以分离判据时启用 | ≤1 |

**与 Ban「恰 1 次盘点跑」的关系**：Ban 锁定的是 canonical 全量口径恰 1 次（Run A 唯一·错数唯一真相源）；探针跑（B/C）非盘点口径——不产生替代错数、不参与聚合、不用于任何「跑绿」目的，仅按 TS 码做类分离交叉对照。此口径经协调方授权预声明（探针上限 2），非 Ban 规避。

## 判读预注册（跑前锁定）

- 真断链类：TS2304（找不到名称）/ TS2305（模块无导出）/ TS2307（模块解析失败）/ TS2724（导出名/签名不符）——strict off 后**存活**者。
- 严格噪声类：TS7006（隐式 any 参数）/ TS7016（无声明模块·已由 allowJs 面排除 .mjs 边）/ TS2345 / TS2322（型不配）/ strict-null 族（TS2531/TS18047/TS18048 等）/ TS1484（type-only 导入）——strict off 后**消失**者。
- 分类判据 = Run A ∖ Run B 差集（strict 面噪声）与 Run A ∩ Run B（strict 无关·真断链候选）双面交叉，每类抽 ≥3 例亲读源码定性。
- 已知真断链 `e2e/full.e2e.ts:209`（:14 仅 import `emitClassifiedE2EFailure`，:209 裸调 `emitE2EFailure`）预登记在案——**盘点不动**，Run A 应见 TS2304 命中；此为判读器自校准锚（若缺席即 tsconfig 面失效，STOP 上报）。
