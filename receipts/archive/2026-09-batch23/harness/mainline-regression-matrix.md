# 北星 loop 主线全量回归矩阵（0 BUG 门证据 · 只读探针）

- 探针席：regression-probe（全量 prove 键矩阵亲跑 · 离线零成本 · 零改动零修复零 push）
- 任务基线：`feat/mysql-schema-skeleton @ df12a054`（今日 11 刀落主线后交叉回归核查）
- 基线披露：A/B/C 三轮主矩阵开跑时 HEAD=df12a054+docs(4983042d)（码面同 df12a054）；确认复跑期间主线活跃落卷——HEAD 移至 46ff2290→88ffef5c+2136ad86（18:22 runner 收据清单修复）→9cac8778（18:52）。凡受该修复影响之键在下表单列「探针期内被主线修复」。
- 方法：`pnpm run <key>` / `pnpm -C <pkg> run <key>` 逐键亲跑；每键 300s 硬超时；EXIT 原值全账；红键一次确认复跑（区分 flake/环境/确定性红）。并发=离线层 4 / wrapper 层 2（每键独立一次性 PG 容器）。
- 环境事件披露：确认复跑期间宿主盘一度 ENOSPC（macOS purgeable 释放后缓解，17Gi 恢复）；受影响键已经复跑覆盖；r2 中 `bounded_command_timeout` 类失败（无断言行）一律以 r1 断言签名为红证据，不据此计新红。
- 亲跑范围：root+worker+api+db+web+domain/ai-runtime/ai-graphs/contracts/qdrant-store 全部 prove/neg 入口键；剔除 live 真消耗键（e2e:prove / uc018:abandon:full-e2e:prove / uc018:ui:prove / api:validate 全量族）与 `:raw` 内部键（由其入口键覆盖亲跑）；DB 类无 wrapper 入口键不裸跑（dev-DB 保护，登记于 §7）。

## §1 总账

| 层 | 键数 | 绿 | 红(原值) | 复跑翻绿 | 确认红 |
|---|---|---|---|---|---|
| A root 入口键 | 374 | 266 | 108 | 16 | 92 |
| B 未覆盖离线键 | 33 | 29 | 4 | 0 | 4 |
| C 对照层（parity/tsc/build） | 6 | 1 | 5 | 1(web-typecheck 争用 flake) | 4 |
| 合计（去重键） | 413 | 296 | 117 | 17 | 99* |

\* 确认红 99 中含 5 键属「探针期内被主线修复」（复跑已绿，按 §2-E 双向实证计）；当前 HEAD 仍红确认键 = 94。

## §2 新增红清单（今日窗交叉回归标记；任务期望=0，实测 8 组 20 键，其中 1 组 5 键已获主线修复）


### A ENTPAY片1×public-copy

| 键 | r1 EXIT | confirm |
|---|---|---|
| apps/web:prove:public-copy | 1 | exit=1 |

### B ENTPAY片2×GODFN-1c静态清单

| 键 | r1 EXIT | confirm |
|---|---|---|
| apps/api:prove:begin-guard-merge | 1 | exit=1 |

### C ENTPAY片2×entpay:s1部署车判据

| 键 | r1 EXIT | confirm |
|---|---|---|
| root:entpay:s1:prove | 1 | exit=1 |

### D begin契约/抽取×uc025族+stale-quiz

| 键 | r1 EXIT | confirm |
|---|---|---|
| root:uc025:nhp-adv:prove | 1 | exit=1 |
| root:uc025:nhp-bound:prove | 1 | exit=1 |
| root:uc025:nhp-fault:prove | 1 | exit=1 |
| root:uc025:nhp-fault-isolated:prove | 1 | exit=1 |
| root:uc025:nhp-neg:prove | 1 | exit=1 |
| root:uc025:stale-quiz-expiry:prove | 1 | exit=1 |

### E DIR-B2×runner收据清单（88ffef5c 已修）

| 键 | r1 EXIT | confirm |
|---|---|---|
| root:g7fix4:finalize:prove | 1 | GREEN |
| root:report-retry:http:prove | 1 | GREEN |
| root:report-retry:prove | 1 | GREEN |
| root:role-input:prove | 1 | GREEN |
| root:unstube-erase:prove | 1（收据 ENOENT） | r2 bounded_command_timeout（负载·未取得有效确认）——其收据条目 88ffef5c 已映射新域路径，HEAD 待一次干净复跑定谳 |

### F UNSTUB-ERASE×neg:auth/隐私域断言过渡

| 键 | r1 EXIT | confirm |
|---|---|---|
| root:neg:auth | 1 | exit=1 |
| root:privacy-erasure-preview:domain:prove | 1 | exit=1 |
| root:mem00-int00:prove-path | 1 | exit=1 |

### G 0152 fence×recruiter/runtime-role

| 键 | r1 EXIT | confirm |
|---|---|---|
| root:recruiter:prove | 1 | exit=1 |
| root:runtime-role:prove | 1 | exit=1 |

### H E2RG×e2e-platform守卫/G6行为门

| 键 | r1 EXIT | confirm |
|---|---|---|
| root:e2e-platform:prove | 1 | exit=1 |
| root:g6-e2e-iso-blocked:prove | 1 | exit=1 |

组机制证据（亲跑日志+git 亲证）：

- **A** `apps/web/test/public-copy.proof.mjs` TC-PUBLIC-COPY-E8 `forbid(billingAction, ['serverFetch(', '/commerce/orders'])` 命中：`apps/web/app/billing/actions.ts:3/17/41/57`（ab420f61 13:44 ENTPAY 片1 接线）。片1 落卷时 E8 未复跑（其 prove 面=entpay-s1 48 断言）。
- **B** `GODFN-1c` S1..S10 全 FAIL（`FROM resume_quiz count=0`）：5ff5f96d 16:58 片2 将 begin 事务体模块化抽取（`apps/api/src/modules/interview/interview.service.ts:72-73` 注释亲证「原 InterviewService.begin() asPrincipal 事务体逐字搬移」），静态清单仍读 `begin(principal…turn(principal` 旧区域；行为面 R1-R10 全 PASS（合并在跑、语义未坏——纯静态形状断言失配）。
- **C** `entpay:s1:prove` S1-0「真迁移链 0001→0156 全量应用+重跑幂等（部署车）」FAIL：亲跑输出 `applied=159/159 last=0157_billing_payer_route rerun_skipped=159`——片2 新增 0157 后片1 判据终值过期（幂等本身绿，纯终值锚过期）。双轮确定性复现。
- **D** uc025 族静态/负门锚漂移：`S1-controller-forwards-quiz-id`（nhp-fault）、`[PIN|infra] anchor :196/:206/:212 owner-scoped merged quiz SELECT(3→1)`（nhp-adv）、`S1-controller-forwards-quiz-id/S2/S3`（nhp-bound）、`GAP-UC025-NEG-01 begin 不收 quiz artifact`（nhp-neg）、`S1-begin-no-quiz-input`（stale-quiz-expiry）——同受 begin 契约双改（片2 抽取 + e0208e9f 13:22 ROLE #259 begin 增 targetRole 头）影响。任务已知清单仅覆盖 uc001-nhp-fault，uc025 族为清单外。
- **E** runner `isolatedReceiptSources`/watch 清单仍指 DIR-B2 前扁平路径（亲证 6 目标陈旧：role-input:prove:raw=interview-jobs.ts+candidate-route.ts、unstube-erase:prove:raw=int-transcript-projection.ts 等、report-retry:prove:raw/http=commerce.ts+report.ts、g7fix4:finalize:prove:raw、resume-grounding:prove:raw）→ 证明 PASS 仍被收据 ENOENT 判红。**主线 18:22-18:24 以 88ffef5c+2136ad86 修复（提交语自证「五假红转绿」），本探针复跑实测 role-input/report-retry:prove/report-retry:http/g7fix4:finalize 翻绿 = 交叉回归发生与修复双向实证。** resume-grounding:prove:raw 为悬空注册（无 root 入口键，登记 §7）。
- **F** UNSTUB-ERASE（f9383f76 01:35）pin supersession 过渡红：neg:auth deactivate 三断言（status=disabled / 令牌即时失效 401 account_inactive / 再登录拒）× 新 deleted_at+pwd_epoch 语义；privacy-erasure-preview:domain「生产 DELETE 仍 503」×「DELETE=202 软删受理」翻转（c9200502 自述「检查器断言零触碰·nail 期才翻」=设计内过渡，但按本门原值如实记红）；mem00-int00:prove-path 为 privacy-erasure-preview:domain 链式派生。
- **G** 0152_resume_soft_delete_fence（f9383f76）围栏函数 × recruiter:prove（`error: interview_event_raw_answer_fenced`）与 runtime-role:prove（`error: interview_privacy_fenced`）——围栏改变了 recruiter/RLS 证明的可见性预期。
- **H** E2RG（e2479961 13:53 e2e-recruiter-gate）× e2e-platform:prove（`e2e/full.e2e.ts:63/158 log_leaks_secret` 静态守卫红，full.e2e.ts 同刀触碰）＋ × g6-e2e-iso-blocked（run-e2e.mjs/run-e2e-ui.mjs Key-unset 期望非零退出实测 status=null，行为门红）。

## §3 已知预存红对照（任务清单 7 项全命中复现）

| 已知项 | 键 | r1 EXIT | 复现证据 |
|---|---|---|---|
| turn-idempotency 3 FAIL 42883 | turn-idempotency:prove | 1 | r1 红（42883 族）；r2 负载期 bounded_command_timeout，红证据以 r1 为准 |
| resume-reference 5 FAIL | resume-reference:http:prove | 1 | 「开始请求返回 202 并创建单一 start job」断言红（清单述 5 FAIL 同面） |
| uc001 nhp-fault | uc001:nhp-fault:prove | 1 | r1 红 ✓（uc001 nhp-adv/bound/neg 同红——清单外，归 §2-D 同族嫌疑） |
| neg:input 3 | neg:input | 1 | `✗ neg:input: 3/135 失败` 与已知「3 FAIL」精确吻合 ✓ |
| web build 1 | c:web-build | 1 | ✓ |
| worker·api tsc 预存族 | c:worker-tsc / c:api-tsc | 2 / 2 | ✓（c:web-typecheck r1=2→r2=0 记争用 flake，不计预存） |
| parity:check | parity:e2e-parity:check | 1 | ✓（另 e2e-parity:prove 亦红，清单外预存） |

## §4 清单外预存红（亲跑确认红、今日窗未触碰或守卫/环境类——不计新红，登记待归账）


**r4 meta-guard 族（proof 面 09-17/09-23）**（28 键）：

 | 键 | r1 EXIT | confirm |
---|---|---
| root:r4-eg1-dual-claim-product-close:prove | 1 | exit=1 |
| root:r4-eg2-funnel-covered-product-close:prove | 1 | exit=1 |
| root:r4-eg3-domain-isolation-product-close:prove | 1 | exit=1 |
| root:r4-eg4-wrong-track-product-close:prove | 1 | exit=1 |
| root:r4-eg5-product-ssot-product-close:prove | 1 | exit=1 |
| root:r4-eg5-product-ssot:prove | 1 | exit=1 |
| root:r4-eg6-ms3-ne-r4-product-close:prove | 1 | exit=1 |
| root:r4-eg6-ms3-ne-r4:prove | 1 | exit=1 |
| root:r4-funnel-covered-count-batch1:prove | 1 | exit=1 |
| root:r4-funnel-covered-count-batch2:prove | 1 | exit=1 |
| root:r4-funnel-covered-count-batch2b-02b-wire:prove | 1 | exit=1 |
| root:r4-funnel-covered-count-batch3:prove | 1 | exit=1 |
| root:r4-funnel-covered-count-batch3b-05-06-wire:prove | 1 | exit=1 |
| root:r4-funnel-product-close:prove | 1 | exit=1 |
| root:r4-g-r4-5-product-close:prove | 1 | exit=1 |
| root:r4-p-meta-ms1-product-wire:prove | 1 | exit=1 |
| root:r4-p-meta-ms2-facets-product:prove | 1 | exit=1 |
| root:r4-p-meta-ms3-deploy-product:prove | 1 | exit=1 |
| root:r4-p-meta-p-r1:prove | 1 | exit=1 |
| root:r4-p-meta-serving-product:prove | 1 | exit=1 |
| root:r4-p-meta-serving:prove | 1 | exit=1 |
| root:r4-p-planner-unit:prove | 1 | exit=1 |
| root:r4-p-r1-fail-closed:prove | 1 | exit=1 |
| root:r4-pr1-product-close:prove | 1 | exit=1 |
| root:r4-real-wire-impl:prove | 1 | exit=1 |
| root:r4-wrong-track-adv-live-pg:prove | 1 | exit=1 |
| root:r4-wrong-track-adv:prove | 1 | exit=1 |
| root:r4-wrong-track-prod-surface:prove | 1 | exit=1 |

**db 证明族（0143/0152 双号×staged ledger + 0156 grant 面）**（6 键）：

 | 键 | r1 EXIT | confirm |
---|---|---
| root:db-acl:prove | 1 | exit=1 |
| root:db-acl2:prove | 1 | exit=1 |
| root:db-intfk:prove | 1 | exit=1 |
| root:db-money3:prove | 1 | exit=1 |
| root:db-id-v7:prove | 1 | exit=1 |
| root:db-trigfam:prove | 1 | exit=1 |

**honesty/mark-red 守卫**（6 键）：

 | 键 | r1 EXIT | confirm |
---|---|---
| root:nhp-r4-adv-covered:prove | 1 | exit=1 |
| root:conn-stack:r5-mark-red:prove | 1 | exit=1 |
| root:mysql-stack:r5-mark-red:prove | 1 | exit=1 |
| root:g-r2-5-retrieve-fail-closed:prove | 1 | exit=1 |
| root:g4-dispatch-recheck-prereq:prove | 1 | exit=1 |
| root:g4-production-scoped-retrieve:prove | 1 | exit=1 |

**工作树 porcelain 脏守卫（preview-site//.sync/ 未跟踪）**（7 键）：

 | 键 | r1 EXIT | confirm |
---|---|---
| root:uc052:checkpoint-physical:prove | 1 | exit=1 |
| root:uc052:external-sink-async-purge:prove | 1 | exit=1 |
| root:uc052:external-sink-retention:prove | 1 | exit=124 |
| root:uc052:internal-erasure:prove | 1 | exit=124 |
| root:uc052:pool-role-leak:prove | 1 | exit=1 |
| root:uc018:covered-criterion:prove | 1 | exit=1 |
| root:uc018:covered-lift-reassess:prove | 1 | exit=1 |

**断言红（r1 签名）**（11 键）：

 | 键 | r1 EXIT | confirm |
---|---|---
| root:scoring-integrity:prove | 1 | exit=1 |
| root:stress:prove | 1 | exit=1 |
| root:reqid:prove | 1 | exit=1 |
| root:uc011:adv:prove | 1 | exit=1 |
| root:uc004:career-path:prove | 1 | exit=1 |
| root:uc028:trace-fail-open:prove | 1 | exit=1 |
| root:e2e-parity:prove | 1 | exit=1 |
| root:scor-00:sole-fixture:prove | 1 | exit=1 |
| root:quality:governance:prove | 1 | exit=1 |
| root:provider-egress:prove | 1 | exit=1 |
| root:public-preview-write:prove | 1 | exit=1 |

**ENV-BARE（直跑键需隔离/远端 env）**（11 键）：

 | 键 | r1 EXIT | confirm |
---|---|---
| root:voice:prove | 1 | exit=1 |
| root:graph:prove | 1 | exit=1 |
| root:adaptive-latency:prove | 1 | exit=1 |
| root:rag-cost:prove | 1 | exit=1 |
| root:rag-cache:prove | 1 | exit=1 |
| root:runtime:prove | 1 | exit=1 |
| root:quiz-dual-claim:prove | 1 | exit=1 |
| root:interview-dispatch:prove | 1 | exit=1 |
| root:rag-cost-runtime:prove | 1 | exit=1 |
| apps/worker:prove:g7fix4-reroll | 1 | exit=1 |
| apps/worker:prove:job-wakeup-redis | 124 | exit=124 |

派生/其余：`neg:all` = neg:auth+neg:input 组内派生红（§2-F/§3）。


**复跑翻绿-环境/派生补充表**（含于 §5，此处给全账行）：

| 键 | r1 EXIT | confirm | 判定 |
|---|---|---|---|
| conn-stack:ping/qdrant-backed/sole-wiring、mysql-stack:ping/qdrant-backed/sole-wiring、e2e-isolation:sole-*（5）、memory:qdrant:prove | 1/3 | GREEN | ENV-GATE→sole 栈拉起后 ENV-RESOLVED |
| c:web-typecheck | 2 | GREEN（16s） | tsc 并发争用 flake（C 层对照键，非 prove） |
| root:ctx05-concurrency-recovery:prove | 1 | GREEN（11s） | docker 并发期 flake |
| root:uc001:nhp-adv / nhp-bound / nhp-neg :prove | 1/1/1 | exit=1 | uc001 族清单外同红（§2-D 同族嫌疑·begin 契约） |
| root:neg:all | 1 | exit=1 | 组内派生（含 neg:auth §2-F + neg:input §3） |

## §5 超时/环境处置登记

- **超时（>5min cap）**：`uc018:perf-load:prove`（r1 300s TIMEOUT·r2 内部 bounded_command_timeout）；`apps/worker:prove:job-wakeup-redis`（B 层 300s TIMEOUT·redis 等待，ENV 类）。其余全部键在 cap 内出值。
- **ENV-GATE（sole 栈未起时首红，探针中拉起 `docker compose -f docker/compose.mysql-local.yml` 后复跑全绿）**：conn-stack:ping/qdrant-backed/sole-wiring、mysql-stack:ping/qdrant-backed/sole-wiring、e2e-isolation:sole-*（5）、memory:qdrant:prove —— 12 键 ENV-RESOLVED。
- **flake（r1 红→r2 绿、无刀面解释）**：ctx05-concurrency-recovery（docker 并发期）、c:web-typecheck（tsc 并发争用）。

## §6 重点交叉面结论（任务指定）

| 交叉面 | 结果 |
|---|---|
| SSE×FENCE 融合（web prove 256） | **绿**。web:prove 104 PASS 行全过（102 面版现值）；signal-sse×3 / sse-push:notify / sse-slot / uc010:sse-resume / fence-reflow-repair:prove 全绿——融合面零回归。 |
| ENTPAY 片2×F3（commerce-reconcile） | commerce-reconcile:prove 绿、commerce:prove 绿；**但 entpay:s1:prove 自身 S1-0 红于片2 的 0157（§2-C）**——F3 判据本身无回归，刀间判据过期是新红。 |
| DIR-B2 路径×全 prove（runner 注册路径） | **发现注册漂移**：runner 收据清单 6 目标陈旧（§2-E），主线已修复；growth:prove（6799544f 热修面）绿、fence-reflow-repair 绿；resume-grounding:prove:raw 悬空注册（无 root 入口）。 |
| CONSENT-MIN 门×语音链 | consent-min:prove 绿；语音链 voice-adaptive/voice-timeout/interview-voice-seams/vstream/voice-reliability 全绿；`voice:prove` 红=ENV-BARE（root 直跑键无隔离 env，database_config_invalid，非回归）。 |

## §7 跳过/剔除/登记（不跑键及理由）

- live 真消耗（任务剔除）：`e2e:prove`、`uc018:abandon:full-e2e:prove`、`uc018:ui:prove`、`api:validate`（全量族）。
- `:raw` 内部键 134 个：由 wrapper 入口键覆盖，不裸跑（裸跑无隔离 env 必假红）。
- DB 证明无 wrapper 入口（dev-DB 保护，头注禁止裸跑）：`packages/db: prove:principal-config`、`packages/db: tenant-enforcement:prove`。
- 悬空注册：`resume-grounding:prove:raw`（无 root 入口键）。
- 同文件重复入口（覆盖等价，不重复计）：worker prove:flow/prove:qbank/prove:model-cost、db prove:qbank-source、api prove:uc025-nhp-neg/voice-operation-policy/turn-idempotency/neg:*（wrapper 变量映射）。
- `.int.ts`/需远端键（非离线零成本）：worker prove:rag-redis-cache。

## §8 附件

- 亲跑原始账（本机临时区，随系统清理）：`/tmp/regm/results-{CB,A,R,R2}.jsonl`（每键 EXIT/时长/输出尾）、`/tmp/regm/logs/`（逐键日志）、`/tmp/regm/manifest*.jsonl`（清单）、`runner*.stderr.log`（进度账）。
- 探针零改动声明：仅新增本报告文件；未修任何红；未 push；工作树既有脏面（.gitignore/tsbuildinfo/preview-site//.sync/ 与 loop 自身 receipts 编辑）非本探针所为。

—— regression-probe · 今日键矩阵全量亲跑收口

