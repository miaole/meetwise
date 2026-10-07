# REQUEST — **F-F · interview_job last_error 甄别刀**（仪器化重跑 + 容器拆除前 DB 只读甄别 · ≠ 修复 ≠ trio 翻绿）· pre-dual · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · trio OPEN · GAP-G7K-API-REDS **P1 OPEN** · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7r-ff-last-error-discriminator.md` · slice `g7r-ff-last-error-discriminator.slice.md`
**上游**: G7R post-dual BOTH PASS `bfd868e0`（残余候选裁决：H0-alt-5 结构性 pre-model throw 最强 · H0-alt-1 协调方 Key 直探出局（输入事实：F-A-1 配对 200 成功 + 错配 401 复现）· H0-alt-2 code-face 驳回）· G7R EXEC 实跑 code SHA `3767f783`（trio EXIT 1/1/1 retained）
**Base tip**: `bfd868e0`（full `bfd868e028821531db0dcb905066730d56f64685` · 本机 origin ref 实测 · **如实登记：本 turn fetch 两次网络失败，以本机 ref 为基线恰满足预期 ≥`bfd868e0`；EXEC 期重 fetch 重钉** · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **F-F**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN**（EXIT 1/1/1 真实业务红 retained） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |
| `actualSpendCny` | **null**（沿 G7R/I 线 · Ban invented spend） |

## 请审什么（mw-e2e-ha · e2e 夹具契约 / 证据诚实 / EXIT 纪律 / withhold 面）

Line F-F · **interview_job last_error 甄别刀**（甄别=只读诊断，修复另刀）。请审（e2e-ha 首责面）：

1. **withhold 契约零触碰（硬 · C-HA-2 延续）**：甄别读数走 **DB 直读旁路**（sidecar 连隔离 PG SELECT-only），与子进程 stdio 零接触——`run-e2e-isolated.mjs` 全文件零 diff，withhold 冻结函数体（blob `13dbfc43` 与 G7R 冻结钉 hash-object 全等 · 本树实测 `runFullE2E` 起 `:2082` · `:2088` `child.stderr.on('data', () => {})`；先例 `:2084-2098`/`:2093` 行号注记偏差如实登记）原样；**Ban 改 wrapper 输出机制**（Ban 为取明细开假面/回显 stderr/落盘子进程输出）；G7R post-dual mw-model-op 已确认「读 DB 不读子进程 stderr」路径合法——本 stub 是否如实呈现该授权边界与「读 DB ≠ 读 stderr」的论证。
2. **prove 容器即毁与读取窗口诚实**：`docker run --rm -d`（`run-e2e-isolated.mjs:2296`）+ finally `docker rm -f`（`:2367`）→ DB 状态随容器消失（G7R EXEC 工件不可回读的原因如实登记）；首选机制 A（run 内 sidecar 端口行监测 + 300ms 轮询 + 快照留痕）的窗口保证论证（端口行 `:2310` 先于 e2e spawn、run 时长 ≫ 采样间隔）是否成立且未夸大；机制 B keep-container 兜底的 **prove 契约偏差弱点**（绕过 wrapper 收据面）是否如实标注并锁死在「协调方显式批准」边界内。
3. **EXIT 契约诚实（双向）**：甄别 run 目的=取 `last_error` 非翻绿——预期 EXIT=1、红 EXIT ≠ 甄别失败、**甄别成功判据=快照捕获读数**（捕获 ≠ e2e pass ≠ trio 翻绿）；备选 iso run 触发条件唯一（「无 failed 行可读」）且须登记触发原因——是否构成 retry-to-green 变体的空间是否已被 Ban 条款封死（Ban 删改 attempt、Ban 只留绿 attempt、红 EXIT 不冲销）。
4. **断言与 spec 零触碰**：甄别 run 复用既有 spec（uc018-abandon ×2 / iso full 链）零改动——Ban 为绿改语义/洗断言（F-D/F-E 否决延续）；`e2e:ui:isolated`/`e2e:isolated` wiring 行号按 EXEC 当 tip 重核的纪律是否在案。
5. **判读表措辞纪律（C-HA-3 延续）**：§1.4 判读表系码面亲读的**机械归类**非根因断言；「与 X 一致」≠「X 已证」；「判读表未覆盖值域」与「读数矛盾」（如 last_error=结构门但 ai_model_invocation 有 dispatch 行；`reaped:worker_died` 与秒抛观测矛盾；`graph_fence_lost` 不应出现而出现）都是**合法收据结论**且须如实记——假设/断言边界是否守住。
6. **输入事实引用边界**：H0-alt-1 出局系协调方 Key 直探（F-A-1 配对 200 + 错配 401）**输入事实**，本 turn 未独立复证——harness §5.3 已锁「EXEC 读数矛盾则如实登记回协调方，Ban 掩盖」；引用与非主张（Non-claims）边界是否如实。
7. **收据与归档**：甄别收据落 `receipts/g7r-ff-last-error-discriminator/`（G7R `receipts/gap-g7k-api-reds-fix/` 零改写零覆盖）；七字段逐 attempt 全记录；evidenceOfRecord/SSOT 登记留 nail 阶段；`g7SuiteGreen=false` 保持声明在案。
8. **Ban 清单确认**：Ban coding（本 turn 与 EXEC 默认 plan——sidecar 探针=psql/node-pg 只读单行命令，零新增代码文件入树；机制 B 同禁代码化）· Ban prove 执行（本 turn 零实跑零 live 零 Key 加载零 DB 连接）· Ban push · Ban SSOT/backlog 状态翻转 · Ban 洗绿/Ban retry-to-green/Ban flake 记法 · Ban 改 withhold 机制 · Ban 为绿改产品（读数命中任何门 → 修复另刀，沿 C-MO-11）· Ban 碰 `:68`/`:70`/`:71` 已清面（registry start-job chat ops `wired:true` 裁决域）· Ban 碰已占用行/sibling 归档 · Ban self-approve · alone ≠ dual。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. `actualSpendCny=null`. **甄别读数 ≠ 修复 ≠ trio 翻绿** · DB 读数 ≠ 产品修复 · **Ban 假绿叙事**。

本 stub 不授权 prove 执行 / 甄别 run / DB 连接 / 机制 B；pre-dual BOTH PASS 后由协调方授权 EXEC（run 面与机制 B 裁定时落字）；implementer 不自批；本 PASS（如落）仅为 mw-e2e-ha 半签，不代签并行 peer mw-model-op。

---

*REQUEST stub · F-F last_error discriminator · Line F-F · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-dual · alone ≠ dual · 禁 push · STOP*
