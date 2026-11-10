# FIX-G4：生产编排接通隐私擦除 worker（#247）

- **审查域**：mw-privacy-int（本修复不自行合并；请该席独立审查）
- **分支**：`fix/g4-privacy-worker-prod`
- **基底**：`origin/main`（`9c9809446`）。问题在 main 与 `origin/line/final-polish`（`189c0054a`，PR #237）上相同，`compose.prod.yml` / `privacy-worker-runtime.ts` 在两分支间无 diff，故以 main 为基底，避免把未合并的 polish 提交带进来。
- **对照审查**：`/workspace/ua-snapshots/review-refactor-189c0054a.md` P1-3（#247/D6）与第 6 节 G4
- **时间**：2026-11-10（北京时间，Asia/Shanghai）
- **未改共享进度文档**；本说明为 G4 单独交付件。

## 问题

默认生产编排（`docker/compose.prod.yml`）未挂载 `PRIVACY_WORKER_DATABASE_URL`。`apps/worker/src/privacy-worker-runtime.ts` 遇到缺省会 `return undefined`，擦除循环静默不启动。`docker/env/*.example` 也没有 worker 侧该变量。公开 `DELETE /privacy/interview-data/:id` 仍应固定 503，本修复未改该语义。

## 改动

1. **`docker/compose.prod.yml`（G4 独占此文件的本轮修复）**
   - worker 段增加 `${PRIVACY_WORKER_DATABASE_URL:?set dedicated privacy worker database URL}`，只挂 worker，不进 API。
   - `x-migration-env` 增加 `${PRIVACY_WORKER_DB_USER:?…}` / `${PRIVACY_WORKER_DB_PASSWORD:?…}`，让默认生产 migrate 会 provision 擦除执行器登录（`migrate-cli.ts` 已支持，此前 compose 未注入所以 `privacy_worker_login=not_requested`）。
   - 估算器缺省（N-15 / `utf8-bytes-v1`）本轮不动。
2. **`docker/compose.ha.yml`**
   - YAML 锚不跨文件，`worker-a` / `worker-b` 是独立环境块。已同步挂载同一 `${PRIVACY_WORKER_DATABASE_URL:?…}`，避免合载 HA 叠加层后生产 worker 因缺变量启动失败。migrate 服务仍来自 prod 文件，无需在 HA 文件重复 DB_USER/PASSWORD。
3. **`docker/env/worker.env.example`**：增加 `PRIVACY_WORKER_DATABASE_URL=` 空占位与说明（绝不写真实凭据）。
4. **`docker/env/migrate.env.example`**：原已有 `PRIVACY_WORKER_DB_*` 空占位，补了“生产默认编排需要、只把结果 URL 注入 worker”的注释。
5. **`apps/worker/src/privacy-worker-runtime.ts`**：`NODE_ENV=production`（大小写不敏感，复用 `isProductionEnvironment`）下 URL 缺失或仅空白时抛 `privacy_worker_database_url_missing` 并失败启动（fail-closed）。非生产仍返回 `undefined`，由 `main.ts` 既有 `console.warn` 告警，便于本地无专用登录启动。
6. **单测**：`apps/worker/test/privacy-worker-runtime.proof.ts`（`pnpm -C apps/worker prove:privacy-worker-runtime`）。并 grep 钉死公开 DELETE 仍为 503。
7. **部署文档**：`ai-docs/delivery/lean-cd-deployment.md` 将 `PRIVACY_WORKER_DATABASE_URL` 列入控制面 URL 与必填说明；`ai-docs/observability/alerting-runbook.md` §3.13 更正“缺 URL 则端点恒绿”的过时表述（生产改为启动失败 / unreachable）。

未提交任何真实凭据；compose 与 example 均为 `${…:?}` 或空占位。

## 验证矩阵

均在 worktree `/workspace/mw-fix-g4` 跑，未占用或停掉常驻栈端口 `8787` / `3100` / `54392` / `63799`（事后确认仍在监听）。隔离证明使用临时端口（`32791` / `32792` / `32795` / `40071`）。时间均为北京时间。

| 命令 | 退出码 | 结果（北京时间） |
| --- | --- | --- |
| `docker compose -f docker/compose.prod.yml config`（非密 contract 占位） | **0** | worker 仅有 `PRIVACY_WORKER_DATABASE_URL=` 占位；migrate 仅有 `PRIVACY_WORKER_DB_USER/PASSWORD` 占位；api/web/privacy-watchdog 皆无 |
| `docker compose -f docker/compose.prod.yml -f docker/compose.ha.yml config` | **0** | `worker-a` / `worker-b` 均挂载 URL 占位；migrate 仍持有 provision 变量 |
| `pnpm deploy:check` | **0** | `validate-prod-compose.mjs` + `deploy-check.mjs` 全绿 |
| `pnpm -C apps/worker prove:privacy-worker-runtime` | **0** | 14 项 PASS（含生产 fail-closed、编排契约、公开 DELETE 503 钉） |
| `pnpm -C apps/worker typecheck` | **0** | `tsc --noEmit` 无错误 |
| `pnpm -C apps/worker lint` | **0** | 0 error；989 warning（帽 999；本修复未引入 error） |
| `pnpm privacy-erasure:prove` | **0** | isolated `pass_count=2`；临时 PG `127.0.0.1:32791`；20:22 左右 |
| `pnpm privacy-erasure:http:prove` | **0** | isolated `pass_count=25`；临时 PG `127.0.0.1:32792`；公开 503 路径仍绿 |
| `pnpm privacy-erasure:pause-upgrade:prove` | **0** | isolated `pass_count=14`；临时 PG `127.0.0.1:32795` |
| `pnpm neg:resume` | **0** | `91` 条负路径全绿；API 临时口 `127.0.0.1:40071`；20:23:06–20:23:12 |

未宣称 HA、未买云、`releaseEvidence=false`。隔离栈绿 ≠ 生产擦除已覆盖。

## 部署注意事项

合入后，生产 `.env` / secret manager 必须补：

- `PRIVACY_WORKER_DB_USER` / `PRIVACY_WORKER_DB_PASSWORD`（仅 migrate）
- `PRIVACY_WORKER_DATABASE_URL`（仅 worker；应为上述登录的 TLS 连接串，不得与 runtime / qbank / rag 控制面登录共用）

缺任一项时：compose 在 `config`/`up` 阶段因 `:?required` 拒绝，或 worker 进程以 `privacy_worker_database_url_missing` 退出。这是有意的响亮失败。

## 遗留

- **未改** `scripts/deploy-check.mjs`：审查分组里该文件归 G1。契约断言改放在本 G4 单测，避免与 G1 争用。G1 若方便可补一条与 qbank 对称的 deploy-check 守卫。
- **公开 DELETE 仍为 503**：有意保留，不在 #247 范围内。物理擦除循环接通 ≠ 重开公开删除权。
- **未做生产实库联调 / 真登录 identity 实测**：本轮证明覆盖编排解析、启动 fail-closed 单测、既有 privacy-erasure proof。真实 `assertPrivacyWorkerExecutorIdentity` 仍依赖既有 pause-upgrade / erasure proof 与部署期 provision。
- **`receipts/ha-6/resource-budget.json:45`**：这是 HA-6 当时的 receipt 证据文件（`lazinessNote` 含 “privacy 未配即禁用”），本轮**未改**，以免改写已落卷证据。现行码面口径见下方审查跟进。

本 PR 需要 **mw-privacy-int** 独立审查通过后再合入。作者不自批、不自合并。

## 审查跟进（mw-privacy-int PR #238 FAIL，2026-11-10 北京时间）

### 阻塞修复

`apps/worker/test/privacy-worker-runtime.proof.ts` 原先用 `fileURLToPath(new URL('../../..', import.meta.url))` 得到带尾斜杠的仓库根，再 `endsWith('meetwise') || includes('mw-fix-g4')`。标准 clone 路径如 `/path/meetwise/` 因尾斜杠而恒为 false，只有目录名碰巧含 `mw-fix-g4` 才过。已改为：去掉尾部 `/` 或 `\`，并用 `existsSync(pnpm-workspace.yaml)` + `existsSync(docker/compose.prod.yml)` 探测仓库根，不再依赖目录名。

验证：在无关目录名的 detached worktree `/tmp/zz-check`（路径不含 `meetwise` 或 `mw-fix-g4`）跑 `pnpm -C apps/worker prove:privacy-worker-runtime`，**14/14 PASS，退出码 0**（北京时间约 20:32）。验证后已 `git worktree remove` 删除该临时 worktree。

### 非阻塞文档

已为旧表述“URL 未配即禁用”补上“仅非生产”限定：

- `ai-docs/delivery/harness/ha-6-companion-REQUEST.md:45`、同文件原 `:97`（W1 修法段 “privacy 未配即禁用”）
- `ai-docs/delivery/harness/unstub-inventory.md:149`

`receipts/ha-6/resource-budget.json:45` 未改（见上，receipt 证据）。

### 复跑

| 命令 | 退出码 | 结果（北京时间） |
| --- | --- | --- |
| `/tmp/zz-check` 下 `pnpm -C apps/worker prove:privacy-worker-runtime` | **0** | 14/14 PASS（目录名无关路径） |
| `/workspace/mw-fix-g4` 下 `pnpm -C apps/worker prove:privacy-worker-runtime` | **0** | 14/14 PASS；约 20:33 |
| `pnpm privacy-erasure:http:prove` | **0** | isolated `pass_count=25`；临时 PG `127.0.0.1:32842`；约 20:33 |

未占用或停掉常驻栈端口 `8787` / `3100` / `54392` / `63799`。

### 磁盘 / inode

审查方报告机器 inode 100%（No space left on device）。本机 20:30（北京时间）实测：

- `df -h`：`/dev/vdb` 挂载 `/`，128G 已用 26G，剩余 102G，**21%**（空间未满）
- `df -i`：同一挂载点 inode 已用 1,889,120 / 2,015,232，剩余 126,112，**94%**（随后观察升至约 95%）。inode 紧张的是根分区 `/`，不是 `/dev` 或 `/dev/shm`。

本回合只清理了自己产生的临时物：`/tmp/zz-check` worktree（验证后已移除）、以及本席先前的 `/tmp/g4-proofs`、`/tmp/g4-compose-config.yml`、`/tmp/g4-dummy-rds-ca.pem`、`/tmp/g4-worker-lint.txt`。未删除其他席位的 worktree、`/tmp/g4-priv-review`、运行中的隔离容器或其他人的 `node_modules`。
