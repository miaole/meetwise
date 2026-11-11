# Meetwise · 剩余北星执行队列（SSOT）
Date: 2026-10-06 · tip base: origin/feat/mysql-schema-skeleton (ff before write)
Pins: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · g7SuiteGreen=false · Ban buy cloud · HOLD AN-CIMG-EA until user key authorize · PG-retained · DELETE=503
Cross-links: harness/NORTH-STAR-EXECUTION-LOOP.md · north-star-hard-gates.md · gap-bug-backlog.md · e2e-requirement-coverage-matrix.md

Companion: docs SSOT on the AO-COND35 tip/line（beyond REQUEST `95ddd88` · refine beyond companion draft `cbe6fd2a` · **NOT** a second REQUEST · Ban close `:35` via queue alone）

## 2026-11-11 G1–G4 修复合入与用户决定（协调方同步）

**合入 main（merge commit，均经独立领域审查 PASS + PR CI 全绿）**

| 组 | PR | 内容 | merge sha | 合入后 PTP cap |
|----|----|------|-----------|----------------|
| G3 | [#240](https://github.com/miaole/meetwise/pull/240) | SSE 槽 proof 按连接计数 + 轮询下界 + 全仓冲突标记扫描（secrets-scan 内）+ verify `timeout-minutes: 30` | `67a4daeed771785523a1caf869702ec411daae3c` | 2533 |
| G1 | [#239](https://github.com/miaole/meetwise/pull/239) | 迁移账本链首前缀修复（0000→0230 改号）+ 旧库升级 proof | `6212ab8572f4e468ee669aee49d0e6d05c1f9d0e` | 2535 |
| G2 | [#241](https://github.com/miaole/meetwise/pull/241) | 判重出题降级（本场不重复 → 换能力项 → 跨场重复兜底） | `9bc700764482a50c0fdadcaca8e27c9891d24cb4` | 2536 |
| G4 | [#238](https://github.com/miaole/meetwise/pull/238) | 隐私 worker 生产编排与 env 校验 | `2be4e4f29acb9f61594dbd1298a572dc298877e4` | 2536（不增受管件） |

main 上 `ci` 工作流对上述合入提交均 success。`deploy` 工作流报红属**预期内**：云服务器尚未购买，目标 ECS 不存在。`deploy.yml` 保持原样，不改、不禁用。

**用户决定（2026-11-10/11）**

- 跨场重复默认值：本场不重复；本场可换的能力项都换完后，才允许使用别场问过的题（不多调模型、不多扣额度）。如将来要求严格不跨场重复，另开一刀做历史题降权，不靠无上限重摇。
- 全栈 E2E 不进 CI，不配 `MODEL_API_KEY`；在本地手跑 `pnpm e2e:isolated`。
- CI 改为轻量，只保留核心校验（瘦身另走 PR，经 mw-e2e-ha 独立审查后再合）。
- 隐私 worker 的生产密钥（`PRIVACY_WORKER_DATABASE_URL` / `PRIVACY_WORKER_DB_USER` / `PRIVACY_WORKER_DB_PASSWORD`）用户确认已配好。
- 上云口径：除「买云 + 部署」这一项以外，上云前的所有工作都要做完。#238 隐私 worker 实际上线排在「买云 + 部署」这一项里，当前**未上线**。

**后续队列（未关）**

1. #18 `interview_job.payload` 明文 answer 需即时剥离。
2. #106 deps-audit 只阻断 critical，现存 18 个 high。
3. N-11 口径冲突待深审。
4. #28 ADR 仍写 BullMQ/Redis，需与 PG-retained 对齐。
5. #70 bodyLimit 12MiB 低于 base64 上限，413 不可达。
6. #234 use-cases 索引未更新。
7. `ha6:prove` 在 main 上原本即红（3 条），单独跟进。
8. G5（N-13/N-14）、G6（N-17）后置。
9. G2 `duplicateFallback` 标记未投影到 `question_ready` 事件，运营不可见；§4.5 缺 `provenance=cross_session_repeat` 断言。
10. 缺 HTTP 层「跳过当澄清」的 E2E。
11. isolated 场景 `runFullE2E` 吞掉 stderr，Key-block 易被误读为 PG 静默失败。
12. 跨场撞题降权（确定性相似度、当场仍硬拒）另开一刀，需 PRE 双审。
13. `sse-slot:prove` 轮询下界只能稳定抓到约 <875ms 的回归（1000ms 的 2 倍退化抓不到）。
14. 0000 ledger 老库需要手动 DELETE 孤儿行；是否自动化由用户决定。
15. 0230 迁移头注释误写为 DEFINER，需要勘误。
16. **WORKER-INFLIGHT-CRASH-01（P0 · 修复已提 PR，未合 · 2026-11-11）**：2c4g sizing `WORKER_INTERVIEW_GLOBAL_INFLIGHT=16` 压测中 worker 整进程退出（N=20 +14s 未处理 42501 `checkpoint_privacy_fenced`＠`PostgresSaver.put`；N=40 +28s 未处理 pg `Connection terminated`＠`PostgresSaver.putWrites`）。根因：LangGraph 1.4.7 `PregelLoop._trackCheckpointerPromise` 的 checkpoint 写 promise 要到 `_streamIterator` finally 才挂 handler，写失败到 finally 之间节点仍在等模型/DB → unhandledRejection → Node 默认退出，一个 job 拖垮全部在飞 job。修法（分支 `fix/worker-inflight-crash`）：`FenceCheckpointSaver.runContained` 收容作用域（首个写失败锁存 + abort 本次 invoke，返回给 LangGraph 的 promise 不再 reject，锁存后零续写，读缝抛锁存错，invoke 结束原码上抛），`adaptive-lifecycle` 四个 invoke 缝全部经 `invokeWithCheckpointContainment`；pg 连接族无 code 错折算 `checkpoint_connection_lost` 并入 transient 白名单（requeue 后 pg-pool 新建连接重试），42501 仍为确定性终态。回归：`pnpm worker-inflight-crash:prove`（零 DB，约 4s；修前 EXIT=1 / 修后 EXIT=0，内置反证臂）。CI 挂钩待 #243 合入后再定（按 ci-cd.md §8 归 `verify:local`），本 PR 不改 ci.yml。未做：真 PG 断连注入 + 16 inflight 全栈复跑 sizing（需重跑 2c4g 矩阵）。

Pins 不变：NOT_HA · releaseEvidence=false。

## 0 Now
~~AR — GAP-PRIV-EXTERNAL-SINK async purge~~ **DONE** · nailed `post_prove_dual_pass`（POST BOTH privacy `3b1a136d`+e2e `2197d93e` · PROVE `a49d712e` · CODE `111df857` · REQUEST `e2eac8ca` · PRE `6093626e`+`e473eac2` · A5 EXIT0×5 · MUT −0140 EXIT1 · N1–N3 · local_isolated_stub PATH evidenced **this knife only** · `:64` **OPEN** · stub≠cloud · cloudVendorDeleted=false · NB-3 · Ban count-as-erased · Ban wash ada604a · Ban covered flip · coveredCount=8 · UC-052 partial · DELETE=503）
Next: Phase 0 item **2+**（serial COND / A-seed product rootcause still OPEN · Ban wash · Ban covered flip）· Phase 0 item 3 AQ nail DONE（≠ `:71` close）· Phase 0 item 5 AR nail DONE（≠ `:64` close · stub≠cloud）

## Phase 0 (after AO nail · local · no key/no cloud)
1. ~~AO nail SSOT honesty~~ **DONE** · S · e2e · serial COND line · :35 A residual **OPEN** (57P01) · nail = honesty dual-pass ≠ CONDITION close ≠ A proven
2. C-PERF-TEARDOWN :35 product rootcause next if A still needs prove · L · e2e+rag · Ban wash · Ban covered flip
3. ~~GAP-RAG-03 :71 R3-HNSW-COMPLETENESS~~ **DONE** · AQ nail `post_prove_dual_pass` · M→L · rag+e2e · PROVE `19d69d72` · CODE `49cfce97` · POST `1894d04a`+`eb4131d5` · path-exercised + live plan + safety + honesty fields · **`:71` stays OPEN** · Ban production HNSW SLO / exact-K · Ban FULLTEXT/Qdrant · Ban wash rag03-route EXIT1 (=GAP-RAG-02) · Ban covered flip
4. GAP-MOP-03 :76 successor cutover/independent review · M · model-op+e2e · Ban MODEL-OP closed · Ban Redis cutover · PG LISTEN retained
5. ~~GAP-PRIV-EXTERNAL-SINK :64 async purge real knife~~ **DONE** · AR nail `post_prove_dual_pass` · L · privacy+e2e · PROVE `a49d712e` · CODE `111df857` · POST `3b1a136d`+`2197d93e` · local_isolated_stub PATH + N1–N3 · **`:64` stays OPEN** · stub≠cloud · cloudVendorDeleted=false · Ban count-as-erased · NB-3 · Ban wash ada604a · Ban covered flip · UC-052 partial · DELETE=503

## Phase 1 user-blocked
6. HOLD AN-CIMG-EA / C-IMAGE-DIGEST :34 · needs HMAC key authorize · Ban .env*
7. G7 Key/live/MODEL_API_KEY · Ban wash suite green

## Phase 2 matrix
8. UC-018 stay partial · L · Ban invent covered
9. UC-004 FAULT/A3 gap · L
10. UC-025 row gap · M–L
11. UC-011 ADV/covered-lift · M · **勘误（2026-10-26 剩余队列行对账·沿 `:35` 先例形）**：本行挂账「ADV/covered-lift」两面已收口——ADV 面 `GAP-UC011-ADV-01` **CLOSED（wired）**（gap-bug-backlog `:543` Line V 主口接线 nail `post_prove_dual_pass`）· covered-lift reassess 已 nail（gap-bug-backlog `:566` **CLOSED as honest non-flip assessment only** · `canHonestlyFlip=false`）· 余面=ADV 隔离收据 E2E REQUEST 卷**在飞**（`line/uc011-draft` @ `16b277bc0` · pre-exec 双审 rev 后两席 PASS · EXEC 待容器恢复行使 68+41 臂隔离收据·如实注：EXEC 未行使前不称收据已落）· **UC-E2E-011 stays partial ≠ covered** · coveredCount=8 不变 · **强制 caveat：本行勘误 ≠ 矩阵 `:117`/case-matrix 行翻动 ≠ covered flip ≠ UC-011 covered ≠ EXEC 已行使**（行状态由其 EXEC 收据行使 · 本笔仅 queue 行对账 · 矩阵 `:117`/case-matrix 零触）· Ban invent covered · Ban wash
12. remaining NHP rows one-knife-one-row · highly parallel
13. GAP-PRIV-AUTHZ flake :68 low priority · Ban retry-to-green

## Phase 3 privacy
DELETE=503 freeze · INT-TRANSCRIPT-01 · GAP-PRIV-01 tenant≠RLS · GAP-PRIV-04 vector erase

## Phase 4 RAG
~~GAP-RAG-02 fixture · GAP-RAG-05 semantic classifier late~~ **DONE（fixture 刀 + Stage S 结构面收官勘误 · 2026-10-07 落主线证据亲证）** · fixture knife `post_prove_dual_pass`（coding `263f3bcf4` main 祖先亲证 ≡ 台账 `d4d02e48` patch-id `1767357a` · nail docs `24612b3af` main 祖先亲证 ≡ `6afd8c8ff` patch-id `8909e15a` · backlog `:70` 已录 knife nail）· Stage S `post_prove_dual_pass`（nail = checklist Line RAG05 + backlog `:783` 登记 · POST dual `7d8d7d72d`+`77e9ac85e` main 祖先亲证 · coding 台账 `db7da1cd` ≡ 落地 `281128ce` patch-id `f7142630` 经 #108 `112e6d26f` 落 main · `SEMANTIC_ROUTE_PERF_BUDGET` 冻结在位）· **Route L residual stays**（量化面实测须 EXEC 再显式授权 · `actualSpendCny=null`）· **强制 caveat：翻 queue 行 ≠ `:70`/`:71`/`:73` 任一行 closed ≠ covered flip ≠ HA ≠ 语义质量冻结 ≠ 路由生产接线宣称** · coveredCount=8 · DELETE=503

## Phase 5 MOP
GAP-MOP-01/BUG-NOTIFY-REC · GAP-MOP-02 claim

## Phase 6 G7
trio fresh green · R1 Disclosure · releaseEvidence=false until full

## Phase 7 product
SCOR then P0-CB

## Phase 8 HA
local honest · buy cloud frozen until user yes

## Suggested next after AO
ISO banner OR HNSW OR A-seed/:35 → parallel sink purge / MOP → UC covered → G7 → (user) cloud

---

*Companion docs SSOT · docs-only · Ban product code · Ban covered flips · Ban CONDITION close · Ban secrets · Ban AN-CIMG-EA · Ban prove · Ban buy cloud · STOP*
