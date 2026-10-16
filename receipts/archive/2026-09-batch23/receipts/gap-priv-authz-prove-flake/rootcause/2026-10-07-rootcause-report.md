# Receipt / Rootcause report — **GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` 根因调查 EXEC**（Line FLK · 6 实验 · `executed:awaiting_post_dual`）

**Status**: **`executed:awaiting_post_dual`**（POST dual mw-privacy-int + mw-e2e-ha 由协调方另派 · Ban self-approve · alone ≠ dual · 本 receipt ≠ nail ≠ 关闭）
**Pins（原值 · 全程未动）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · UC-052 stays partial · **canHonestlyFlip=false**
**Date**: 2026-10-07（UTC 时间戳见各 attempt）
**Base / exec tip**: `line/flk-rootcause` @ **`ee7563a2`** / full `ee7563a2675f7afb7b6b33407531b66f52f20fec`（= origin/feat/mysql-schema-skeleton · REQUEST 6ee3bc84≡78c35592 孪生已被 dual tip 收编 · rebase 后本分支与 tip 逐字一致）
**Authority**: 协调方 AUTHORIZE EXEC（PRE dual BOTH PASS：mw-privacy-int `77dd8dd1`（C-P-1~7）+ mw-e2e-ha `82f5db5c`（C-FLK-HA-1..8））
**Executor**: mw-core（实现方 · 禁自批）
**执行 worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-flk` · 本刀全部 git 写操作仅在此 worktree · 禁 push

## 执行声明（先读）

- 6 实验（E-COLD-1/2/3 + E-WARM-1/2/3）按 harness `harness/gap-flake-rootcause-investigation.md` §3 预注册设计执行；每实验假设/判读/反例照卷，结论无论钉死与否如实入账。
- **零触碰面机检**：`git status` 零 `ai-docs/` 外条目；`git diff HEAD -- scripts/ packages/ apps/ package.json` 空 —— `run-e2e-isolated.mjs` / `privacy-authorization.proof.ts` / `principal.ts` / `checkpoint-principal.ts` / 迁移 / `.env*` **零 diff**（C-P-2 / C-FLK-HA-5）。实验脚本落 receipt 区（`rootcause/scripts/`，Ban `scripts/` 产品面已守）；原始日志在 `.tmp/flk-exec/`（gitignored），提交面为 `rootcause/logs/` 副本 + sha256。
- **C-FLK-HA-8 锚点重检（开跑前）**：@`ee7563a2` 亲测 runner `:1840`（容器名）/:`1976`（token randomUUID）/:`2164`（READY 行）/`waitForPostgres :2146-2173`/`probeHostSql :2123-2127`/`package.json:304-305`/proof.ts `:57 insertInterview`·`:125 ivA` —— 与 REQUEST §1/§2 引用行号逐点一致；9 blob 锚（attempt-1/2 json/log/receipt · jsonl · 三冷/暖 log）`git hash-object` 全等（E-WARM-3 机检 `zeroDrift=true`）。base 漂移防护通过后方开跑。
- **teed 三角口径披露**：本刀含 prove 目标的执行（E-COLD-2 注入矩阵 run ×6 · E-WARM-1 双跑 · E-WARM-2 单跑）全部为 **raw 目标直跑**（`pnpm -C packages/db prove:privacy-authorization`，`set -o pipefail` + teed log + 同 shell `PROCESS_EXIT` 行）——不经 runner 包装，故无 runner 的 `LOCAL_ISOLATED_PROOF_RECEIPT`（该行由 runner 打印，attempt-2 先例在卷）；机器面以 **teed log + driver JSON 台账 + sha256**（`logs/flk-machine-hashes.txt`）为锚。三角 = teed log `PROCESS_EXIT` 行 / driver exit 记录 / log 正文（PASS·FAIL·错误形态）逐点互证。
- 脚本缺陷披露（attempt 纪律）：实验驱动脚本在**首次 docker 尝试前**两次模块解析缺陷（`pg` 解析路径、`capture` 未导出）修于任何 attempt 产生之前——零 docker 副作用、零 attempt 弃单；修正后 smoke（1×3）通过才开正式 run。
- 环境卫生：driver env 零 shell 继承（显式构造 baseEnv 等价面，云凭据/陈旧 `E2E_*`/`PG*` 不可能泄入）；容器惯例 `--rm -d`·唯一名 `meetwise-e2e-<pid>-<label>-<ts>`·`-p 127.0.0.1::5432` 动态端口·GUC token·零共享卷·用后即毁；收尾 `docker ps` 空。脱敏：全部提交日志 grep `PASSWORD/password/DATABASE_URL` = 0 命中（C-P-7）。

## Attempt 全台账（红账完整 · Ban 弃单 · Ban retry-to-green · designed-red 标注）

### E-COLD-1 · 发布窗口竞态探针（2026-10-07T13:52–13:55Z）

| 实例 | 容器（meetwise-e2e-…） | 发布端口 | bootMs | firstTcpOkMs | firstSqlOkMs | TCP 拒绝 / SQL 拒绝 |
|------|------------------------|----------|--------|--------------|--------------|---------------------|
| 0 | …-62092-ecold1-0-1791381274991 | 51566 | 249 | 3 | 934 | 0/100 · 0 |
| 1 | …-62092-ecold1-1-… | 51796 | 254 | 0 | 1034 | 0/100 · 0 |
| 2 | …-62092-ecold1-2-… | 52015 | 384 | 1 | 926 | 0/100 · 0 |
| 3 | …-62092-ecold1-3-… | 52234 | 263 | 0 | 928 | 0/100 · 0 |
| 4 | …-62092-ecold1-4-… | 52472 | 289 | 1 | 1042 | 0/100 · 0 |

- **合计 0/500** `ECONNREFUSED`（TCP outcome 分布 `{'ok': 500}` · SQL `Connection terminated unexpectedly` 仅现于 initdb 临时 postmaster 阶段并在 ~0.9–1.0s 自愈，签名**非** ECONNREFUSED，独立观察入账）。
- **判读（反例分支命中 · 如实）**：H-COLD-1 **未成立**——本机 Docker Desktop 29.1.3 上「`docker port` 返回 → 代理可连」窗口 ≤100ms 探针粒度 ×5 实例未复现。按预注册与 C-FLK-HA-4：入账为「**本机该 Docker 版本未复现（样本 500 探针 ×5 fresh 实例）**」，**Ban 写「排除」**。

### E-COLD-2 · TOCTOU 退场注入（2026-10-07T13:55–13:57Z · 每_attempt 独立容器）

| attempt | 注入 | 容器形态 | EXIT | 错误形态（teed log 逐字） | PROCESS_EXIT | WITHHELD 字节带 (state/logs) |
|---------|------|----------|------|---------------------------|--------------|------------------------------|
| stop-1 | `docker stop` | --rm | **1** | `Error: connect ECONNREFUSED 127.0.0.1:52827` + `code: 'ECONNREFUSED'` @ `assertIsolatedTestTarget`（isolated-test-target.ts:84 ← proof.ts:119） | =1 | **29 / 29** |
| kill-1 | `docker kill` | --rm | **1** | `Error: connect ECONNREFUSED 127.0.0.1:52863` + 同上同形 | =1 | **29 / 29** |
| none-1/2/3 | 无注入（对照 ×3） | --rm | 0/0/0 | 51 PASS 全过 | =0 | 217–218 / 8714 |
| stop-band-1 | `docker stop` | **keep（无 --rm · 仅字节带诊断）** | 1 | `Error: connect ECONNREFUSED 127.0.0.1:53035` 同形 | =1 | 223 / 8732 |

- **判读（成立分支 · 按预注册上限）**：H-COLD-2 **机理级受控复现成立（充分性）**——pre-prove 三连探针 + Running 检查全过之后、prove 建连之前注入退场 → prove 侧失败与 cold-5.log **L18/L24 逐字同形**（同错误行形态、同 `code:'ECONNREFUSED'`、同断言点 `assertIsolatedTestTarget`、同 EXIT=1 + ELIFECYCLE）；对照 ×3 全绿。按 C-FLK-HA-2：**Ban 升格「历史冷失败必然由此机理导致」**（历史 run 的实际退场原因不可回溯）。
- **字节带分桶（机械解释 · 非历史归因）**：29/29 带 = 容器已被 `--rm` 自动移除、`docker inspect/logs` 诊断不可得 → driver fallback 串 `docker_diagnostic_unavailable`（29 字节）——**与 cold-5.log `state_bytes=29 logs_bytes=29` 同带**；~220 带（217–223 实测）= 容器在场（退场未删或未退）State JSON —— **与 historical `state_bytes=226` 同带**。历史两份 log 的带差异由此机械分桶完全覆盖；但**历史各 run 容器当时为何退场仍属不可回溯**（未解释归因保留，只分桶不归因如约）。

### E-COLD-3 · 并行负载放大（2026-10-07T13:58–13:59Z）

- 4 容器同起并发探针 ×100（400 探针）：**0/400** `ECONNREFUSED`（firstTcpOkMs 0–2ms · firstSqlOkMs ~0.8–1.0s）。
- **判读**：H-COLD-3 **未成立**——本机 4 并行未放大出窗口（样本 400）；仅入账观察，不作根因（预注册「放大器不单独作根因」如约）。

### E-WARM-1 · 同库连跑双跑（2026-10-07T13:57–13:58Z · 容器 `meetwise-e2e-64053-ewarm1-doublerun-1791381474567` @ 127.0.0.1:53199）

| run | EXIT | 结果 | 三点核验（vs warm-2.log L6/L13/L14） |
|-----|------|------|--------------------------------------|
| run1（fresh） | **0** | 51 PASS / 0 FAIL | 不适用（fresh 路径结构性不触发） |
| run2（同库第二遍 · **designed-red**） | **1** | `PASS catalog gate` 后即崩 @ `insertInterview` | **三点全 TRUE**：`duplicate key value violates unique constraint "interview_pkey"` + `code: '23505'` + `Key (id)=(00000000-0000-4000-8000-0000000000a1) already exists.` |

- run2 堆栈与 warm-2.log **逐帧同位**（pg-pool@3.14.0_pg@8.22.0 `index.js:45` → `proof.ts:58 insertInterview` → `proof.ts:127 main`）；仅绝对 workspace 路径字符串不同（`/workspace/meetwise-lineB` vs 本 worktree · 审 e2e-ha OB 已预容）。三点全等 + 同帧 = 判读**成立**。
- run2 红 = **designed-red**（预注册设计内预期），照卷入账；**Ban 记为回归、Ban retry 洗绿**（未 retry）。

### E-WARM-2 · 预置行单跑（2026-10-07T13:58:20–13:58:26Z · 容器 `meetwise-e2e-64368-ewarm2-preseed-1791381500804` @ 127.0.0.1:53304）

- 预插落账（C-P-4 逐字）：fresh 容器 migrate 后、prove 前，外部数据面 `docker exec … psql -c "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ('00000000-0000-4000-8000-0000000000a1','flk-preseed-owner','active',0,0,'[]'::jsonb)"`（与 fixture `proof.ts:57-62` 同 SQL 形 · 行 id `…a1` · admin plane 与 fixture `admin.query` 同面 · **零 GUC/角色 SET/CREATE/ALTER** · UTC `2026-10-07T13:58:25.038Z`）。
- 单跑 run1：**EXIT=1 · 三点全 TRUE**（同 E-WARM-1 run2 同形同帧）——**首跑即触发**。
- **判读**：H-WARM-2 **成立**——触发条件 = 库内已存在同 id 行，与「同进程多轮累积」无关；与 E-WARM-1 run1（fresh 单跑不触发）互证完整。

### E-WARM-3 · static 边界核验（零执行 · 2026-10-07T13:52Z）

- fixture 面：`insertInterview` @ `proof.ts:57`（裸 INSERT）· `ON CONFLICT` = 0 · `DELETE FROM interview`/`TRUNCATE` = 0 · 固定 id `…a1`@`:125` / `…a2`@`:126` · 恰 2 次调用——「跑后残留行在库」结构性成立。
- 锚：9 blob 锚 zeroDrift=true（attempt-1 json/log blob 全等 · 3811cf1 对象在场 · cold-5/warm-2/historical/jsonl 全等）——attempt-1「不同意」语义（JSON `exit:0` vs log 无退出码 · FAIL `3811cf1`）**原样保留**。

## 根因钉死程度（结论 · 诚实分级）

| Class | 程度 | 内容 |
|-------|------|------|
| **暖类（SQLSTATE 23505 `interview_pkey`）** | **钉死（机理级 · 本机/本树实证 · 确定性 2/2）** | 根因 = **复用库/残留行**：fixture 固定 id（`…a1`/`…a2`）+ 裸 INSERT + 无 cleanup，凡库内已存在同 id 行（前次 run 残留或种子）必 23505（E-WARM-1 run2 同库第二遍 + E-WARM-2 预置行首跑，三点全等 ×2）；fresh 路径结构性不触发（run1 51/0 + 全部对照绿）。与历史 warm-2.log 三点+堆栈同帧同位。 |
| **冷类（`ECONNREFUSED` 宿主→发布端口）** | **部分钉死** | **充分机理已实证**：TOCTOU 间隙容器退场 → 与历史逐字同形的冷失败（同断言点/同错误行/同 EXIT），且现有防线（三连探针 + Running 检查）只能缩窗不能消除 check-then-use 间隙（注入 ×2/2 复现）。**未钉部分**：历史 2 次冷失败的实际退场原因不可回溯（Ban 断言历史必然由此机理导致 · C-FLK-HA-2）；自然发布窗口竞态（0/500）与 4 并行放大（0/400）在本机 Docker 29.1.3 未复现（观察，非排除）。 |
| **两类归一** | **不归一（按预注册 §3.3）** | 机理不同源（连接期退场 vs 约束冲突），分立钉死，Ban 强行归一。 |

**SS 间接修复判定（判定权归 E-COLD · C-FLK-HA-6）**：SS 修复（`f59c4d20`）改动面在 capped-child 容器→宿主路径，宿主 `baseEnv.PGHOST='127.0.0.1'` 路径与 runner 零 diff（复证）——E-COLD 证据下：冷类**自然触发面**在本机当前环境未观测到（0/900 探针），但**注入机理在当前树仍然复现**且与 SS/任何已上树增量无关；「已被 SS 间接修复」**仍属不可判定**（证据不足），本报告不改写该结论、Ban 借 SS/perf-load 绿关 `:68`。历史自然复发 ×2 均在 `3d0c71e` mitigation 之前，mitigation 后零自然复发（attempt-2 + Line X 后新 attempt=0）与此一致。

## 历史绿账收拢（C-P-6 · 逐行 · 暖类地位）

| 历史 EXIT=0 行 | 暖类覆盖地位 | 与本报告根因的关系 |
|----------------|--------------|---------------------|
| attempt-1 @`5b6e693`（JSON `exit:0` / log 无退出码） | **不同意**（FAIL `3811cf1` 缺陷保留 · L1） | 零证据力（连 EXIT 面都不完整）· 不作暖类反证 |
| teed attempt-2 @`6673042`（`PROCESS_EXIT=0` · 51 PASS） | fresh-path（一次性新容器） | **零暖类覆盖**——其绿与「复用库残留行」根因**无冲突**（该 run 从未进入复用库路径） |
| `9b39a20` n=1 绿 | fresh-path 单次 | 同上 · 零覆盖 |
| cold_v2 10/10 @`3d0c71e` | fresh 容器 ×10 | 冷类 mitigation 观察 · 零暖类覆盖 |
| warm_v2 10/10 @`3d0c71e` | **新容器（非复用库路径 · review `49ef158` §5）** | **零暖类覆盖**（v2 标签不等于复用库）· v2 绿对本报告暖类根因零反证力 |
| SS perf-load attempts 2/3/4 + `ce31d7f2` 6 run | capped-child 容器→宿主路径（另一 gap） | 零本 gap 任何类覆盖 · 只作另一路径健康引用 |

**收拢结论**：23505 根因（复用库残留行）与全部历史绿**无冲突**——历史上没有任何一次绿覆盖过「复用库/残留行」路径；Ban 引任何历史绿作暖类反证（C-P-6 如约收拢于此，含 OB-3 要求的单点归拢）。

## `:68` 建议处置（**仅建议** · 翻转在 nail 阶段 · Ban 本刀直接改）

- backlog `:68` 状态建议由协调方在 nail 阶段（**双审同意**）升级措辞为：**warm 类 cause-pinned（复用库/残留行机理 · 本机确定性实证）+ 冷类 cause-partially-pinned（退场机理充分性实证 · 历史等价性未钉 · 自然窗口本机未复现）**——具体行文与生命周期值由 nail 裁定；**stays OPEN · Ban 直接关**。
- 可选后续（未来独立 REQUEST · 本刀零授权）：fixture 加 `ON CONFLICT DO NOTHING` 或跑后 cleanup 属 `packages/db` 测试面产品改动，须独立 REQUEST + 授权 + 自身 prove + dual；冷类自然复现的长期观测可挂在常规 prove 台账（红账全入）。

## 证据清单（本 receipt 提交面 · sha256 见 `logs/flk-machine-hashes.txt`）

- 脚本：`rootcause/scripts/{lib,ecold1-release-window,ecold2-toctou,ewarm,ewarm3-static}.mjs`
- 日志/数据：`rootcause/logs/`（ecold1 jsonl+summary+log · ecold2 summary+stop-1/kill-1/none-1/stop-band-1 teed logs · ecold3 jsonl+summary · ewarm1 run1/run2 teed logs+summary · ewarm2 run1 teed log+summary · ewarm3 static summary · machine hashes）
- `.tmp/flk-exec/`（gitignored）为原始生成面；提交面为其副本，两者 sha256 一致（flk-machine-hashes.txt 为准）。

## Conditions 自评（逐条 · 实现方自评不代审）

| 条件 | 自评 | 依据 |
|------|------|------|
| C-P-1 alone≠dual · EXEC 须协调方授权 · E-WARM-1 单列 | ✅ | 协调方授权在先；E-WARM-1 在授权书与 EXEC 中单列；本 receipt awaiting post dual |
| C-P-2 零触碰面 | ✅ | git status/diff 机检（上文执行声明）；脚本落 receipt 区非 `scripts/` |
| C-P-3 teed 三角 + 全台账 | ✅（口径披露见执行声明） | 全部 prove 目标执行 ×9（E-COLD-2 ×6 · E-WARM-1 ×2 · E-WARM-2 ×1）teed `PROCESS_EXIT` + driver JSON + sha256；非预期红 0；designed-red 1（run2）未 retry |
| C-P-4 E-WARM-2 注入落账 | ✅ | SQL 逐字 + 行 id + 容器/端口 + UTC 时戳在卷；零 GUC/角色操作 |
| C-P-5 designed-red 与根因语言 | ✅ | run2 标 designed-red；「钉死」措辞前置三点全等 ×2；两类分立不归一；未复现只写「未复现+样本量」 |
| C-P-6 历史绿收拢 | ✅ | 专节逐行（attempt-1 不同意保留 · 全部绿零暖类覆盖 · Ban 反证） |
| C-P-7 Pins 冻结 + 脱敏 | ✅ | Pins 全程原值 canHonestlyFlip=false；日志 0 凭据命中；`.tmp` 哈希入 receipt |
| C-FLK-HA-1 docs gate 界定 | ✅ | 本 receipt 是实验产物，非 nail 非关闭非授权 |
| C-FLK-HA-2 E-COLD-2 判读上限 | ✅ | 只写「机理级受控复现（充分性）」；历史等价性明示未钉；字节带只分桶 |
| C-FLK-HA-3 attempt 纪律 | ✅ | 全台账（含脚本缺陷两次零副作用修正披露）；非预期红 0；无弃单无重跑 |
| C-FLK-HA-4 判读双向诚实 | ✅ | 0/500、0/400 写「本机未复现 + 样本量」不写排除；绿 ≠ 关 |
| C-FLK-HA-5 触碰面与隔离惯例 | ✅ | 零产品 diff；容器惯例全守；G3/R5 banner 未绕过（本刀不涉 sole stack 路径） |
| C-FLK-HA-6 互借禁令 | ✅ | SS 判定「不可判定」保留；perf-load 绿只作另一路径健康 |
| C-FLK-HA-7 Pins 冻结与升级 | ✅ | `:68` 只建议不翻转；AH F5 / N≥5 关闭门槛未触未放宽 |
| C-FLK-HA-8 锚点漂移防护 | ✅ | 开跑前 @`ee7563a2` 行号 + 9 blob 锚重检全过（执行声明） |

## STOP

本 receipt 为实现方（mw-core）实验产物。**post-prove 双审（mw-privacy-int + mw-e2e-ha）由协调方另派**；实现方不自批、不代签、不 nail、不翻 `:68`、不 push。钉死程度以双审裁定为准。

*Rootcause report · GAP-PRIV-AUTHZ-PROVE-FLAKE · Line FLK EXEC · 2026-10-07 · tip ee7563a2 · warm class pinned (residual-row mechanism, deterministic ×2) · cold class partially pinned (exit-injection mechanism sufficient, historical equivalence unproven, natural window not reproduced 0/500+0/400) · designed-red ×1 booked · no retry · no close · canHonestlyFlip=false · STOP*
