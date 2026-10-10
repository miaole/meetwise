# ROLE-INPUT prove EXIT 账（2026-10-10 · EXEC S1）

knife=role-input · base=feat/mysql-schema-skeleton@6979a069（rebase clean）· branch=line/role-input
est live=0 · 零 Key·零网络·零迁移 · actualSpendCny=null · releaseEvidence=false

## 命令 → EXIT 原值

| # | 命令 | EXIT | 计数 | 时序 | 备注 |
|---|---|---|---|---|---|
| 0a | `pnpm interview:prove`（基线·rebase 后开工前） | 1 | — | 第 1 跑 | `isolated_postgres_database_not_ready:boot`（环境面：工作树 node_modules 未装+容器首启竞态；docker 探针复核容器健康）· 如实记账不抹 |
| 0b | `pnpm interview:prove`（基线·重跑） | **0** | **54 PASS / 0 FAIL** | 第 2 跑 | **实测基线数落账（禁引 54/29 历史值判据）** |
| 1 | `pnpm -C apps/api prove:role-input`（=根 `role-input:api:prove:raw`） | **0** | 13 PASS / 0 FAIL | 1 跑 | S1-S8 静态 + R1-R5 归一化三形/幂等 alreadyBegun 零改写 |
| 2 | `pnpm -C apps/web prove`（web-logic.proof.ts） | **0** | 204 PASS / 0 FAIL | 1 跑 | 含本刀新增 5 断言（#259 空串不发头段） |
| 3 | `pnpm role-input:prove`（=runner `role-input:prove:raw`） | 1 | U1-U9 绿 | 第 1 跑 | 新 proof fixture 缺陷：epoch 推导双重 `.rows[0]` → bigint `NaN`（22P02）· 修 fixture（非断言放宽） |
| 3' | `pnpm role-input:prove` | **0** | **31 PASS / 0 FAIL** | 第 2 跑 | §4 矩阵 ①②③④ 全过（含 ③c 门零弱化·④ 额度账实 net=3） |
| 4 | `pnpm interview:prove`（改后回归） | **0** | **54 PASS / 0 FAIL** | 1 跑 | 与基线逐位一致 = ② byte-identical 判据 |
| 5 | `pnpm neg:interview` | **0** | **97 条全绿** | 1 跑 | — |
| 6 | `pnpm typecheck`（root·e2e tsconfig） | **0** | — | 1 跑 | — |
| 7 | `pnpm -C apps/web typecheck` | **0** | — | 1 跑 | web 真 tsc 门（rev4 ⑧） |
| 8 | `pnpm r1-tech-role-fail-closed:prove` | **0** | 全绿 | 1 跑 | resolver 改后门语义等价·零改自证 |

## §4 矩阵 → 断言落槽（三段式 C11/C8）

| 判据 | 落槽 |
|---|---|
| ① 用户岗位入 planner `<data>` 且胜 snapshot 叶 | worker `apps/worker/test/role-input.proof.ts` ①a-①f |
| ② 留空 byte-identical（现状路由·payload 零键） | worker ②a-②c + `interview:prove` 改后 54/0 |
| ③ 优先序边界 a/b/c/d | worker U1-U9（单元）+ ③b（flag-off）+ ③c（门零弱化）+ ②c（旧 job 无键容忍） |
| ④ begin 传输面（归一化三形+payload 键+幂等+空串不发头） | api `apps/api/test/role-input.proof.ts` R1-R5 + S1-S8；web `web-logic.proof.ts` ROLE-INPUT 5 断言 |

## 停止条件核查

- 锚点形状：C1-C7 全数 ±3 行内命中（controller :25-26·service :166/:312·interview-jobs :158-170·resolver :51-64·consumer :211/:240/:360-364·interviews page/actions·R9 adaptive-lifecycle role 贯通面零改亲读）→ 无漂移越界。
- Ban 面：prompts.ts / candidate-profile-route.ts / candidate-route.ts / migrations 全零字节（`git diff --name-only` grep BAN_CLEAN）。
- prove 新增红：worker proof 第 1 跑红=**新 proof 自身 fixture 缺陷**（非存量断言红），修正后绿；存量面零红。
- 冲突：rebase 零冲突。

## 边界

只在本工作树 line/role-input commit · ⛔push · ⛔动主线仓 · ⛔触其他工作树 · 零 secrets · pins 十一值零翻转 · markers=0。
