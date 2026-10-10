# EXEC 收据 — #229 报告重试刀（REPORT-RETRY · D2 五件 + rev2 三补）

**Author**: `mw-retry229-exec` · **Date**: 2026-10-10 · **Branch**: `line/report-retry`
**蓝图**: `ai-docs/delivery/harness/report-retry-REQUEST.md` @ `9d381aaf`（rev2 · git fetch 后确认 HEAD 即 rev2 提交）
**Base tip**: `a03b9371` · est live=0 · actualSpendCny=null · 0 Key 值接触

---

## §1 五件落位（§1 逐条）

| # | 件 | 落位 | 证据 |
|---|---|---|---|
| ① | sweepReports 保留件（零改动·防回归行使） | `packages/db/src/report.ts:73-86`/`apps/worker/src/report-worker.ts:62-109` **零触**；防回归静态锚钉落新 proof P3（MAX_REPORT_ATTEMPTS=3 / 2^attempts 封顶 300 / 超限隔离 SQL / 到期重排 SQL / report_unavailable 终态事件 / dispatchTick·runReportDispatcher 六钉全 PASS） | report-retry:prove P1 全绿 + P3 六锚钉 PASS |
| ② | requeueFailedReport CAS 扩 quarantined + 重置预算 + 频控 | `report.ts:60-66`：CAS `status IN ('failed','quarantined')` + `attempts=0, next_attempt_at=NULL`（函数名/签名/导出面零变）；频控=`interview.service.ts` 入口前置 `RateLimitService.allow('report_retry:'+id, 3, 3/3600)`，超限 429 `report_retry_limited`；常量 `REPORT_RETRY_RL` 钉死可调（S12 建议值待追认·位形 A=服务层 DI，蓝图推荐） | P2/P3 手动 requeue quarantined→true+attempts=0+next_attempt_at=NULL；H4 第 4 次 429 |
| ③ | 零扣费 rg + proof 防回归 | 静态门=新 proof 内四文件（interview-report/report/report-worker/actions）`reserveEntitlement\|confirmConsumption\|releaseConsumption` 非测试调用=0（4/4 PASS）；动态=自动×3+手动×3 轮逐位断言 availableUnits 恒定/consumption 恒 confirmed byte-identical/无新行/无 released（P1-P3+H1-H2 全绿）；页面禁「重新开一场面试」替代出口（H3 契约面 PASS·interview_failed 卡零触） | report-retry:prove + :http:prove |
| ④ | 文案四句（逐字忠实蓝本） | `reportView` 回传 `attempts`（interview-report.ts:31）；`page.tsx` Report type 加 `attempts?: number`；unavailable 卡渲染「报告生成失败，系统已自动重试 {attempts} 次；你可以再次重试，不会重复扣费」（N=attempts·逐字）；429 提示「重试太频繁，请稍后再试。」；404 提示「当前没有可重试的报告。」；非 2xx 不吞（retry_error 提示条独立于状态卡渲染） | H3 契约面 7 断言全 PASS |
| ⑤ | 存量 quarantined 重排不补偿 | ②落地后走同一报告页手动出口自然解锁（零特殊路径）；fixture 直插 attempts≥3 quarantined 存量行（P4）→ requeue→ready，ledger snapshot（consumption+bucket）byte-identical·额度恒 4.0；**不建 admin 批量工具/不做补偿迁移/不做退款**（§7 Non-claim） | P4 六断言全 PASS |

## §2 rev2 三补落位

- **翻转⑦ bulkhead :76**：`report-bulkhead.proof.ts:76-78` 断言 `attempts===2`→`===1` + 标签更新 + 注记「#229 D2 翻转·旧语义 git blame」；:73 仍返 true（§4-⑦「除 :76 外原值」兑现——:66/:90/:126/:155 全部原值 PASS，全仓 .attempts 消费面独立穷举无第 8 处）。
- **附加缺口 (a) nhp-fault 锚改写主动钉**：:105 区 `requeueOnlyFailed`（首匹配假见证）→ `requeueFn` + `requeueResetPin`（`/status IN \('failed','quarantined'\)/` 锚 requeue 函数体内）+ `requeueAttemptsReset`（`/attempts=0, next_attempt_at=NULL/`）；anchors 键名+ANCHOR 断言同步改写。
- **附加缺口 (b) 三文件复跑排入 §4**：见 §3 prove 表（uc019 db/http 全绿；nhp-fault 被**既有 base 红**阻断——见 §5 如实披露）。
- **EXEC 注记**：C3 自披露字符串（F2b / no_retriable_report / quarantined）保留于文件头 C3 注释与 F2 新钉注释——C3 断言两轮实跑均 PASS（防自红兑现）。

## §3 prove 逐键 EXIT（§4 全表 · 隔离库 run-e2e-isolated · 零 retry-to-green）

| 键 | 对应 §4 | 结果 | 断言计数 |
|---|---|---|---|
| `report-retry:prove`（新·db 腿） | ①②db 腿③静态门+锚钉⑥ | **EXIT=0** | P1-P4 全 PASS（47 PASS） |
| `report-retry:http:prove`（新·HTTP 腿） | ②HTTP 腿③动态④频控+跨报告 | **EXIT=0** | 38/38 PASS |
| `uc011:report-refund:prove` | ⑤ | **EXIT=0** | R1-R4 全 PASS（36）·R2 核心 :140-144 逐字节原样 · 唯一翻转=:146-155 钉 |
| `uc011:report-refund:http:prove` | ⑤ | **EXIT=0** | 52/52 PASS · H2 钉翻转 200+attempts=0 |
| `uc019:report-regenerate:prove` | rev2(b) | **EXIT=0** | 29 PASS · G3 翻转+GAP-UC019-QUARANTINE-REGEN 退役 |
| `uc019:report-regenerate:http:prove` | rev2(b) | **EXIT=0** | 35/35 PASS · H3 翻转 |
| `report:prove`（report-bulkhead） | ⑦ | **EXIT=0** | 31/31 全 PASS（:76 翻转后 attempts=1·其余原值） |
| `neg:interview` | ⑦ | **EXIT=0** | 97/97 全 PASS |
| `uc001:nhp-fault:prove` | rev2(b) | **EXIT≠0（既有 base 红·pristine 同形）** | 静态锚面全 PASS（C1/ANCHOR 含新钉/C3/C5/C7/F3）；HTTP 流程 fixture 阻断于 f1 begin 409（见 §5） |
| `interview:prove` | ⑦ | **EXIT≠0（既有 base 红·pristine 同形）** | 见 §5 |

**tsc 三门**（pristine 对照在卷 `/tmp/rr229_{api,db,worker}_{mine,pristine}.txt`）：db 20 err·worker 63 err **逐字节同形**；api 30 err **同形仅行号漂移**（uc011-http 246→251 等 7 行·错误种类与计数零新增）。web `tsc --noEmit` **EXIT=0**（零新增）。

## §4 翻转表七处对表（§3-8+rev2）

| # | 文件:行 | 旧钉 | 新钉 | 复跑 |
|---|---|---|---|---|
| 1 | `uc-e2e-011-report-refund.proof.ts:146-155` | quarantined 不可 requeue→false | quarantined requeue→**true**+attempts=0+零扣费（注记 #229 D2 翻转·旧语义 git blame） | EXIT=0 |
| 2 | `uc-e2e-019-report-regenerate.proof.ts:197-198+200` | G3 quarantined 不可 requeue + GAP_PIN QUARANTINE-REGEN | requeue→true+queued+attempts=0+零扣费；GAP_PIN→**PIN_RETIRED** | EXIT=0 |
| 3 | `uc-e2e-019-report-regenerate-http.proof.ts:11-12+261-266+301` | H3 quarantined retry→404 | H3 retry→**200 requeued:true**+attempts=0；头注+PIN_RETIRED | EXIT=0 |
| 4 | `uc-e2e-011-report-refund-http.proof.ts:194-197` | H2 quarantined retry→404 | H2 retry→**200 requeued:true**+attempts=0+额度不变 | EXIT=0 |
| 5 | `uc-e2e-001-nhp-fault.proof.ts:105-108+121-122+133-134` | requeueOnlyFailed 首匹配假见证 | 主动钉 requeue 函数体新 CAS 正则+重置正则 | 静态锚 PASS（HTTP 腿被 base 红阻断 §5） |
| 6 | `uc-e2e-001-nhp-fault.proof.ts:440-449+17-19` | F2 quarantined retry→404 | F2 retry→**200 requeued:true**+attempts=0（频控内）；C3 字符串保留 | 同上（flip 语义等价动态覆盖=uc011-http H2/uc019-http H3/report-retry-http H1 三处同口全绿） |
| 7 | `report-bulkhead.proof.ts:76`（rev2 翻转⑦） | attempts===2 | attempts===**1**（requeue 归零→claim+1）+注记 | EXIT=0（:73 仍 true·其余原值） |

## §5 既有 base 红（如实披露 · 零 retry-to-green · pristine 对照在卷）

1. **`interview:prove` 模块加载 SyntaxError**：`apps/worker/src/adaptive-lifecycle.ts:10+12` 重复 `import { admitInterviewResume }`（`:13/:15/:17` 三重 `buildAdaptiveDeps` 导入）——`a03b9371`（score-s2-backfill「dual-keep both imports」）机械落下重复导入语句，ESM 链接期 `Identifier 'admitInterviewResume' has already been declared`。**本刀零触该文件**；stash 后 pristine @9d381aaf 同形复现（在卷）。归 SCORE/回填线修复。
2. **`uc001:nhp-fault:prove` f1 begin→409**：G7S `supplyCandidateProfileRoute`（`packages/db/src/candidate-route.ts`，先于 base 落地）对裸 fixture（resume 无可解密内容）返回 `profile_unavailable` → 服务层 409 `candidate_route_undecided`（C-MO-S4 fail-closed）→ complete 结算 not_found。**本刀零触 begin 链**；stash 后 pristine 同点同形复现（在卷）。归 G7S/ez 线修 fixture。
   - 本刀四处 nhp-fault 翻转中**静态锚面在两轮实跑均全 PASS**（新主动钉+改写 ANCHOR+保留 C3）；F2 200 翻转的运行时断言被上述 base 红阻断，同一产品口（POST /interview/:id/report/retry → requeueFailedReport quarantined→200+attempts=0+零扣费）的动态覆盖由 uc011-http H2 / uc019-http H3 / report-retry-http H1 三套全绿 prove 等价行使。

## §6 停止条件核查

- 迁移：**零迁移**（ai_report attempts/next_attempt_at 列已在 0001_baseline · 零新迁移零改旧迁移）✓
- R2/R3 账本边界：uc011 R2 核心（:140-144）/R3 全部（:158-179）/R1/R4 **逐字节零触**（diff 仅 :146-155 钉+尾部 BLOCKED 行）✓
- 退款/红冲/补偿：零（releaseConsumption 调用面零新增·静态门四文件=0）✓
- sweepReports 语义/参数：零改（六锚钉钉死）✓
- 范围外改动被迫：无（两处 base 红如实登记归位，未越权修复）✓
- rev2 附：nhp-fault C3 字符串保留新钉注释——C3 断言实跑 PASS 防自红 ✓；三文件复跑排入——uc019 双文件全绿、nhp-fault base 红如实 ✓
- Ban 面：零死代码删除/零 secrets 入卷/零 SSOT 编辑/零 G7/零 self-approve/零 Mermaid/零 buy cloud ✓

## §7 Pins 声明（§6 十一值零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## §8 Non-claims 重申

本刀 ≠ 批量重排入口 · ≠ 频控阈值定谳（3 次/小时/份待用户追认·`REPORT_RETRY_RL` 改值不需重开 REQUEST）· ≠ 频控多实例完备（单实例内存·与 signup 同 seam）· ≠ 报告必成 · ≠ 退款承诺 · prove 绿 ≠ covered · GAP-UC019-QUARANTINE-REGEN 退役后 UC-019 收口判定归其自身刀线。

## §9 numstat（17 文件 · +147/−44 + 两新文件）

```
 1  0 apps/api/package.json
 2  1 apps/api/src/modules/interview/interview-report.ts
 6  0 apps/api/src/modules/interview/interview.service.ts
20  9 apps/api/test/uc-e2e-001-nhp-fault.proof.ts
 8  3 apps/api/test/uc-e2e-011-report-refund-http.proof.ts
12  8 apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts
17  3 apps/web/app/report/[id]/actions.ts
19  3 apps/web/app/report/[id]/page.tsx
 3  1 apps/worker/test/report-bulkhead.proof.ts
 4  0 package.json
 1  0 packages/db/package.json
 3  2 packages/db/src/report.ts
10  3 packages/db/test/uc-e2e-011-report-refund.proof.ts
14  8 packages/db/test/uc-e2e-019-report-regenerate.proof.ts
26  2 scripts/run-e2e-isolated.mjs
?? apps/api/test/report-retry-http.proof.ts   (新 · 241 行)
?? packages/db/test/report-retry.proof.ts     (新 · 257 行)
```

注册四处：root `package.json`（report-retry:prove / :raw / :http:prove / :raw 四键）+ `packages/db/package.json`（prove:report-retry）+ `apps/api/package.json`（prove:report-retry-http）+ `scripts/run-e2e-isolated.mjs`（允许名单+收据源+命令映射+预迁移名单）。

*收据 · #229 REPORT-RETRY EXEC · mw-retry229-exec · 2026-10-10 · awaiting post-prove dual · alone ≠ dual*
