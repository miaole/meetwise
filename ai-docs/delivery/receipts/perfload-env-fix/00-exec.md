# PERFLOAD-ENV-FIX EXEC 收据 — uc018:perf-load:prove 环境红翻绿（supportedArchitectures 声明式安装面修·恰 1 配置文件码改·attempts 恰 1 绿零 retry）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 依 pre-exec 双审 BOTH PASS+协调方 EXEC 授权开工·**门 8 docs:check PTP_FILE_LIMIT 红=停止条件「验收红不可修」命中·红停上报如实登记见 §6-1·cap 上调权归协调方·本席零自修**·门 3 臂数题面 46→实测 33 偏差登记见 §6-2·⛔push · est live=0 · releaseEvidence=false · claimProductionHA=false）

**席位**：perfload-env-fix EXEC 席（协调方派·工作树 `meetwise-ple`·分支 `line/perfload-env-fix`）。
**开工链**：起草 `072ec8a9`（STOP=draft:awaiting_pre_exec_dual）→ pre-exec 双审席1 `agent_2c63fc07`+席2 `agent_187f6195` BOTH PASS → 协调方明示 EXEC 授权（2026-10-14 派单 brief·双审 P2 四项随 pin 落）→ 本收据。

## §1 重 pin 全表（对届时 tip `b827d1d8`=本线 merge `feat/mysql-schema-skeleton`@`3559c5c9` 后·`git hash-object` 亲算）

| 文件 | 起草卷 blob | @`b827d1d8` 实测 | 结论 |
|---|---|---|---|
| `pnpm-workspace.yaml` | `8ac5f942`（17 行） | `8ac5f942`（17 行） | 恒等 |
| `package.json`（root） | `3b04b871` | `3b04b871`（`:148`/`:149` 门链锚零漂） | 恒等 |
| `scripts/uc018-perf-load-capped-child.mjs` | `c63259c0`（201 行） | `c63259c0`（201 行） | blob 恒等·行号漂移恰 1 处：`--cpus/--memory` 实锚 **`:130-:131`**（起草卷误记 `:137-:138`=实为 `-w`/`-u` 参数行·双审 P2① 已随 pin 改锚入卷）|
| `scripts/run-e2e-isolated.mjs` | `e69e317a`（3189 行） | `e69e317a`（`:2217-` 宿主系列/`:2258-:2259` 唯一容器路由/`:3056` caps 零漂·`:1156` capped-child 第二出现=file-watch 依赖清单非 spawn 面） | 恒等 |
| `apps/api/package.json` | `910ff4f8` | `910ff4f8`（`:41`/`:113-:114` 零漂） | 恒等 |
| `apps/worker/package.json` | `e69420d4` | `e69420d4`（`:8-:9`/`:42`/`:173-:174` 零漂） | 恒等 |
| `pnpm-lock.yaml` | `af9c3f38` | `af9c3f38`（`:1331-:1421` 19 变体块/`:1366-:1369` linux-arm64-gnu/`:1341-:1344` darwin-arm64/`:2119` swc core/`:3812` oxc 本体/`:6145` snapshot 引入链 零漂） | 恒等 |
| `packages/db/src/isolated-test-target.ts` | `bf1af79e` | `bf1af79e`（`:72-:73` 白名单零漂） | 恒等 |
| `execution-master-checklist.md` 锚 | `:1122`/`:2755`/`:2756` | 三锚行号零漂·内容逐字在 | 恒等 |

- **§0.0 在飞交叠复核**：全 worktree 在飞 `line/*` 分支 `git log 156dd977..<branch> -- pnpm-workspace.yaml` 逐树零命中；`feature/*` 旧预览历史分支（`c3de7fe6` Initial public project preview·非 `156dd977` 祖先·零 worktree 附着）不属在飞面——零「现场漂移」。
- **§0.2 题面钉复核**：migrate 链 `ls packages/db/migrations | wc -l`=**202** 头 `0202_interview_event_kind_score_card_written.sql` 亲数恒等；neg:bend 179、lint 五值、docs:check 底值随 §5 门矩阵实测回填。
- **双审 P2 四项随 pin 落卷**：①capped-child 锚 `:130-:131`（§0.1 表已更）②候选丁「八十余脚本（api 89 实测）」（apps/api package.json 全 script 键亲数 89·§1.4 已更）③「run-e2e-isolated 门矩阵内唯一」+HA compose 族旁注 ha-3 `:36`（§1.2 已增）④成本登记行入收据模板（§1-修法 件④ 已增·本收据 §8 承登）。

## §2 件① 落码回执（唯一码改·零形变）

- `pnpm-workspace.yaml` 文件尾追加：`git diff --numstat`=**8 0**（1 空行+7 配置行·既有 17 行零字节改·与 2026-10-07 收据 `:32` 验证形逐字同源·os `[darwin, linux]`+cpu `[arm64, x64]`·libc 键不设）·17→25 行。
- 落码后重装 `pnpm install --frozen-lockfile`：**EXIT=0·16m33.8s**（pnpm 10.18.0·darwin+linux+arm64+x64 全闭包冷物化·较出处③ 1m54s 长系本机 store 冷面如实记）·开工时 node_modules ABSENT 前置首装 10.4s EXIT=0。

## §3 件② 材化断言回执（四命令原值）

| 命令 | 期望 | 实测 |
|---|---|---|
| `ls node_modules/.pnpm \| grep -c '@oxc-resolver+binding-darwin-arm64'` | 恰 1 | **1**（`@oxc-resolver+binding-darwin-arm64@11.21.3`·darwin 共存零铲） |
| `ls node_modules/.pnpm \| grep -c '@oxc-resolver+binding-linux-arm64-gnu'` | 恰 1 | **1**（`@oxc-resolver+binding-linux-arm64-gnu@11.21.3`） |
| `ls node_modules/.pnpm \| grep -c '@swc+core-linux-arm64-gnu'` | ≥1 | **1** |
| `git diff --exit-code pnpm-lock.yaml` | 零输出 EXIT=0 | **EXIT=0**（零 lockfile 改·三版本钉 11.21.3/1.15.43/1.11.1 恒等） |

## §4 件③ prove attempts 全台账（不弃单不洗）

| attempt | 起讫（UTC） | EXIT | 结果 | 隔离面 |
|---|---|---|---|---|
| 1（终态·唯一·零 retry） | 2026-10-15T03:24:09.761Z→03:24:29.128Z（durationMs=19367） | **0** | **passed** `SUMMARY allPass=true capsEnforced=true` | fresh 隔离 PG `meetwise-e2e-72805-1792034649759` @`127.0.0.1:63763`+API 容器 `meetwise-uc018-perf-api-73007-1792034654001`（`node:20-bookworm`·`--cpus=2 --memory=4g`） |

- 改前环境红基线在册不洗：5E nail SSOT `:2755` ⓜ `:2756` STILL OPEN ①+出处③ `:26` attempt-1 归因+出处④ fresh worktree 复红——本刀改后**恰 1 次零 retry 翻绿**·日志零 `Cannot find module` 红签名（grep EXIT=1 零命中）·`UC018_CAPS written enforced=true api NanoCpus=2000000000 Memory=4294967296`。
- LOAD 三 run：run1 `p50=92.2 p95=235.1 p99=297.1 err=0 timeout=0 passed=true`·run2 `p50=99.7 p95=182.8 p99=265.2 err=0 timeout=0 passed=true`·run3 `p50=63.3 p95=215.7 p99=234.9 err=0 timeout=0 passed=true`·`Method freeze nearest-rank · timeout=10s=error · warmup=10 · runs=3 · caps Docker 2cpu/4GiB`·`local ≠ production capacity ≠ HA`。
- **终 run machine receipt 嵌入**（`.tmp/isolated-proof-receipts/2026-10-15T03-24-29-128Z-72805-af61112b-34ec-4426-9833-80380adf6886.json`·proof 设计面同步写 `ai-docs/delivery/receipts/uc018-perf-load/` 7 件=3 load+3 perf+summary）：

```json
{
  "schemaVersion": 1,
  "class": "local_untrusted_isolated_proof_receipt",
  "target": "uc018:perf-load:prove:raw",
  "outcome": "passed",
  "exitCode": 0,
  "durationMs": 19367,
  "startedAt": "2026-10-15T03:24:09.761Z",
  "finishedAt": "2026-10-15T03:24:29.128Z",
  "sourceDigests": {
    "scripts/run-e2e-isolated.mjs": "sha256:49334326305b97b43ec5501d0f36519f42774a672addaf97c8510f54a1361d30",
    "scripts/bounded-command.mjs": "sha256:3710dacb029505851b15f6d059bb94449b8318a8eb5c3d72c26a9a29c720f582",
    "scripts/uc018-perf-load-capped-child.mjs": "sha256:00829aa6aa19a77a0f702de9d144aed0a7d5e3ee3d032e8ab76f694b26a3b819",
    "apps/api/test/uc-e2e-018-perf-load.proof.ts": "sha256:d9bf425bccad6024372100ba5da300c318adfb8a461d9f20040e4fe1e623fe80",
    "apps/api/test/_neg-harness.ts": "sha256:976acabe9b58c545fd736b931167b6d670ff374993c6d02a2a2bc0c1ceab2b1c",
    "apps/api/src/modules/interview/interview.controller.ts": "sha256:baa1608f972f2a717989bd32b7a21cbfbe578e1855d6814c5563301f1874b9c9",
    "apps/api/src/modules/interview/interview.service.ts": "sha256:f66361d9d901760c22a3ed4235535f0621194065fc295811099b4972f2dcd935",
    "packages/db/src/commerce/commerce.ts": "sha256:999d0425979a8bfc76a697ce9e86dfd42cbea41d6c3aa15eb45db9f86f88e8e6"
  },
  "schemaMigrationManifest": {
    "count": 202,
    "latest": "0202_interview_event_kind_score_card_written.sql",
    "digest": "sha256:f3f6a99ee36986856bcbce01941584230300c37229d13fd7acfd1234f5e8b97d"
  },
  "dataHandling": "no_output_prompt_answer_token_endpoint_or_connection_string_persisted",
  "releaseEvidence": false
}
```

- **`_caps-evidence.json` 嵌入**（`.tmp/uc018-perf-load-receipts/_caps-evidence.json`）：

```json
{
  "enforced": true,
  "method": "docker --cpus=2 --memory=4g",
  "declared": { "cpus": 2, "memoryGiB": 4 },
  "pg": { "container": "meetwise-e2e-72805-1792034649759", "HostConfig": { "NanoCpus": 2000000000, "Memory": 4294967296 }, "ok": true },
  "api": { "container": "meetwise-uc018-perf-api-73007-1792034654001", "HostConfig": { "NanoCpus": 2000000000, "Memory": 4294967296 }, "ok": true },
  "expected": { "NanoCpus": 2000000000, "Memory": 4294967296 },
  "blocker": null
}
```

- 容器内零模型外呼（passEnv `:110-:123` 无模型 Key 通道·est live=0）；日志 `fatal: not a git repository: …/meetwise/.git/worktrees/meetwise-ple` 一行=容器内 git worktree 指针不可解析（bind-mount 面 git 元数据缺·非 proof 断言路径·proof EXIT=0 不受影响·如实记）。

## §5 门矩阵全表（十门·EXIT 原值）

| # | 门 | 命令 | 结果 | 判 |
|---|---|---|---|---|
| 1 | perf-load:prove 翻绿（见证点） | `pnpm uc018:perf-load:prove` | **EXIT=0**·attempts 恰 1 台账·`SUMMARY allPass=true capsEnforced=true` | **绿** |
| 2 | neg:bend 臂数钉 | REQUEST 载 `pnpm -C apps/api neg:bend`·实际行权沿 SSOT 先例 `node scripts/run-e2e-isolated.mjs neg:bend`（runner 隔离行使·fresh worktree 无宿主 PG env·直跑形 env_schema_invalid 红为取道缺配非邻面产品红·见 §6-3） | **EXIT=0**·`✓ neg:bend: 179 条负路径用例全绿` | **绿**（179/179 恰钉） |
| 3 | uc018:abandon:prove | `pnpm uc018:abandon:prove` | **EXIT=0**·PASS 33/FAIL 0·题面 46→实测 33 偏差登记 §6-2 | 绿（臂数偏差已登记） |
| 4 | migrate 链 | `pnpm migrate:prove` | **EXIT=0** `✓ 迁移运行器 全部通过`·链 **202** 头 0202（`ls` 亲数+machine receipt manifest count=202） | **绿** |
| 5 | drift+uniqueness | `pnpm drift:prove` + `node scripts/check-migration-version-uniqueness.mjs` | **双 EXIT=0**·`✓ schema 无漂移`·`files=202 violations=0`（豁免 0143/0152/0160 既登） | **绿** |
| 6 | typecheck | `pnpm turbo typecheck --force` | **EXIT=0**·`8 successful, 8 total / 0 cached` | **绿** |
| 7 | lint 五值承登 | `pnpm turbo lint` | **EXIT=0**·12/12 successful·五值恰等=web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628** 全 0 errors（11/12 turbo 缓存复放·输入 hash 键控·五值恰等实测·如实记） | **绿** |
| 8 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=1 `public_text_policy:PTP_FILE_LIMIT:2131`**（+本收据后 2132）·cap 2128 | **红·红停上报**（§6-1） |
| 9 | markers 五类 | 五类标记词面运行时组装防自指（沿 i6-239 §2-7 同源·词面不入卷不入收据）扫改动集（本卷 .md+件① yaml+收据目录全文件） | **hits=0**（扫描 9 件含 prove 7 JSON·收据落卷后复扫 10 件) | **绿** |
| 10 | diff 面机检+卫生 | `git diff --numstat b827d1d8` 等 | tracked 恰 **2 路径**=本 yaml+本卷 .md（§6-4 tsbuildinfo 门检副产还原记）+收据目录 untracked（7+1）·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` 仓根/apps/api/packages/db 三查 ABSENT·`actualSpendCny=null`·est live=0 | **绿** |

## §6 红与偏差如实登记（Ban 借机修·裁决权归协调方/post 双审）

1. **门 8 红=停止条件「验收红不可修」命中**：`PTP_FILE_LIMIT:2131>2128`（+本收据 2132）。stash 对照亲证基线：`git stash push -u` 后 clean `b827d1d8` 实测 **2124≤2128 EXIT=0 绿**（本席 tracked 改动对计数贡献=0·yaml 非受管 md·REQUEST 为既有件）。红构成全分解=**基线 2124 + 件③ 强制产出 7（proof 设计 `TRACKED_DIR=ai-docs/delivery/receipts/uc018-perf-load`·perf-load:prove 史上首次翻绿故该 7 件首现·件③「终 run machine receipt 嵌入收据」义务的载体）+ 件④ 收据 1 = 2132**。根因=sanctioned cap 2128 对「merge 漂 +1（起草底值 2122 预期落卷 2123·实 2124）+ prove 首绿机检件 +7」无预算——起草卷预期仅 +1 无从预见首绿产出。**本席 Ban 自改 cap**（`public-text-policy.mjs` cap 史=全部协调方 sanction·先例「EXEC 红停 PTP_FILE_LIMIT 2081>2080」同形）·**按 §8 停止条件红停上报·请协调方裁决 cap 上调幅度**（最少 +4 至 2132·沿 +8 先例取 2136 头空亦可选）。7 件 JSON 照 proof 设计随本刀入树（删证=Ban·且 untracked 面同计 Worktree 计数·红与 commit 与否无关）。
2. **门 3 臂数偏差**：题面 46（master-checklist `:2755` ⓐ）→实测 **33 PASS/0 FAIL/EXIT=0**。根因=proof 本体 `uc-e2e-018-user-abandon.proof.ts` 在基线内 `5b1208a1`（5E-BEHAVIOR 二十面测试改形·2026-10-15·`156dd977` 祖先亲证）已改形至 33 `A()` 臂（源码 `grep -cE "\bA\('"`=33 亲证）·起草卷照抄旧 SSOT 行未对新基线复测。门本体绿（EXIT=0）·属题面钉漂移非邻面红·偏差登记上报。
3. **门 2 取道记**：REQUEST 载直跑形 `pnpm -C apps/api neg:bend` 于本 fresh worktree 缺宿主 PG env（`.env*` 三查 ABSENT=门 10 卫生面）→`env_schema_invalid: database_target_missing` EXIT=1（log 留 /tmp/ple-gate2-negbend.log）。改沿 SSOT 先例（negbend-fix 收据命令录+`:2755`「runner 隔离行使」）`node scripts/run-e2e-isolated.mjs neg:bend`→**EXIT=0 179/179**。取道=runner 隔离行使·非修红非改门本体（臂数钉 179 恰等）。
4. **门检副产还原记**：`pnpm turbo typecheck --force`（门 6）触 `apps/web/tsconfig.tsbuildinfo`（tracked 构建副产物）1/1 漂·`git checkout --` 还原使门 10 tracked 恰 2 路径成立·非产品码非交付面·如实记。

## §7 成本登记行（双审 P2④·三值据席2 实测）

> **supportedArchitectures 双平台物化成本三值（席2 实测承登）**：生产镜像 **+~185MB**／CI 冷跑 **+0.65-1.3GB 每次**（store 共享可摊薄）／宿主 store 一次性 **+1.6-2GB**。本席本地实测旁证：件① 后宿主重装 16m33.8s（闭包冷物化）·perf 容器镜像 `node:20-bookworm` 已在位 1.59GB（非本刀新增面）。

## §8 pins 零翻声明（十二值照抄·翻绿外推禁令沿承）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · 公开 DELETE=**503** · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false** · actualSpendCny=**null**。perf-load:prove EXIT=0 **不外推**为容量/HA/release 任何叙事（proof 头 `local ≠ production capacity ≠ HA · PERF/LOAD partial ≠ UC covered · §1.1 stays partial` 原样在 log）。共享 SSOT（master-checklist `:2756` STILL OPEN ① 行翻面）零触·翻面权归协调方 nail。

---

*PERFLOAD-ENV-FIX EXEC · 2026-10-15 · merge `b827d1d8`（--no-ff 并 feat/mysql-schema-skeleton@3559c5c9·零冲突·merge-tree 预演 tree `9e48b77c` EXIT=0 先证）· 件① `pnpm-workspace.yaml` +8/-0 · 件② 材化四断言全绿 · 件③ attempts 恰 1 绿零 retry · 件④ 本收据 · 十门=8 绿+1 红（门 8 cap 红停上报）+1 绿含偏差登记（门 3 臂数 33）· est live=0 · markers=0 · 停止条件「验收红不可修」命中登记·裁决归协调方 · **`executed:awaiting_post_prove_dual`** · ⛔push*
