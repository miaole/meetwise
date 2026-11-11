# 精简单机 CD（当前生效的部署方式）

> 这是**当前生效**的持续部署实现。原「全栈事务化预览 CD」（`deploy-full-stack.yml` +
> 27 步 token 事务链 + 外部签名回执 + Pages 链接态绑定 + `meetwise-cd-root.sh` 控制器 +
> 合成数据重灌）已**退役**：对单机 demo 属过度工程且长期无法稳定收敛。相关工作流已
> `gh workflow disable`（文件暂留仓库、不再触发），其设计文档见
> `ecs-full-stack-cd-implementation-plan.md` / `adr/0021-ecs-full-stack-preview-runtime.md`，
> 仅作历史背景，**不再代表运行现状**。

## 目标与边界

单机 Aliyun ECS 上跑 demo/预览，`push main`（CI 通过后）自动部署。只保留必须的可靠性：
镜像内容寻址身份、幂等迁移、健康门槛、失败自动回滚。**不做**多代事务账本、密码学回执、
Pages 门控、每次部署重灌合成数据（数据库为持久卷，合成数据是一次性手动初始化）。

## 数据流

```
push main → CI(ci.yml 全绿) → deploy.yml:
  1. 构建 web + backend 镜像，按 @sha256 摘要推送到 Aliyun ACR
  2. 接入临时 Tailscale 节点（ECS 仅 tailnet 可达，无公网 SSH）
  3. scp compose.prod.yml + compose.prod.override.yml 到 ECS
  4. ssh 跑 ops/deploy/remote-deploy.sh：
       .env 原地改两行镜像摘要 → docker compose pull
       → run --rm migrate（幂等，只应用新增迁移）
       → up -d --no-deps --wait api worker web（等内建健康检查）
       → 失败自动回滚上一版镜像摘要
公网入口：Tailscale Funnel 443 → 宿主 nginx:80 → web 容器 3000
```

镜像身份 = `@sha256` 内容摘要（不是可变 tag）：被部署的事实即摘要。4G 内存的 ECS 本地
`next build` 会 OOM，故镜像**必须在 CI 构建**，ACR 是 ECS 唯一可拉取源。

## 文件清单

| 文件 | 作用 |
|---|---|
| `.github/workflows/deploy.yml` | CD 工作流（`workflow_run [ci] main success` + 手动） |
| `ops/deploy/remote-deploy.sh` | 机器侧部署：pull→migrate→up --wait→失败回滚 |
| `docker/compose.prod.yml` | 受治理的容器契约（api/worker/web/migrate；镜像 `@sha256` 注入） |
| `docker/compose.prod.override.yml` | 非治理叠加层：部署期运行时旋钮（当前：`web HOSTNAME=0.0.0.0`） |
| `ops/deploy/nginx.conf` | 宿主 nginx，恒定反代 web:3000（`default_server`） |
| `ops/deploy/bootstrap-ecs.sh` | 机器一次性切换脚本（见下） |

## 机器一次性切换（`bootstrap-ecs.sh`）

以 root 在 ECS 跑一次，把机器从旧 controller 切到普通 compose 部署（幂等、不删数据、不动
`.env` 凭据）：停用旧 CD 的全部 `meetwise-*` systemd 单元 → 建 `meetwise-deploy` 账号
（docker 组）并装 CI 部署公钥 → 摘除发行版 nginx 的 `default_server` 并装本站 conf。
另需一次性：把 ACR 登录凭据给 `meetwise-deploy`（`docker login` 或复制 root 的
`~/.docker/config.json`），使 `compose pull` 免登录。

## Secrets（GitHub `preview-cd` 环境）

`ACR_REGISTRY` / `ACR_NAMESPACE` / `ACR_USERNAME` / `ACR_PASSWORD`、
`TAILSCALE_OAUTH_CLIENT_ID` / `TAILSCALE_OAUTH_SECRET`、
`ECS_DEPLOY_KEY`（`meetwise-deploy` 私钥）、`ECS_CD_SSH_HOST`、`ECS_CD_KNOWN_HOSTS`。
机器上的 `/srv/meetwise-compose/.env` 持有 DB/模型等全部运行时密钥（一次性 provision），
部署过程只改写其中 `BACKEND_IMAGE` / `WEB_IMAGE` 两行。

数据库地址前提：`.env` 的 `RUNTIME_DATABASE_URL` / `MIGRATION_DATABASE_URL`（经 compose
`x-cloud-runtime-env` / `x-migration-env` 注入）主机必须指向云数据库，不得为 `localhost` /
`127.0.0.1` / `::1` / `postgres` / 链路本地地址；worker 控制面 `QBANK_CONTROL_DATABASE_URL` /
`RAG_CONTROL_DATABASE_URL` / `PRIVACY_WORKER_DATABASE_URL` 同规则。`NODE_ENV=production` 下违反即启动失败（有意的响亮失败，
非静默），错误码 `database_config_invalid:production_local_database_host`；verify-full + CA
前提 compose 两 env 块已钉，此处引用不重抄。

生产默认编排还要求：migrate 段注入 `PRIVACY_WORKER_DB_USER` / `PRIVACY_WORKER_DB_PASSWORD`
以 provision 擦除执行器登录；该登录对应的连接串只挂到 worker 的
`PRIVACY_WORKER_DATABASE_URL`（`:?required`，绝不写入真实凭据）。生产模式下缺失该 URL
会使 worker 启动失败，错误码 `privacy_worker_database_url_missing`（fail-closed，避免擦除循环
静默不启动）。公开 `DELETE /privacy/interview-data/:id` 仍固定返回 503，与本变量无关。

## 运维

- 手动部署 / 重试：`gh workflow run deploy.yml`。
- 回滚：`remote-deploy.sh` 在任一步失败时自动恢复上一版 `.env` 镜像摘要并重起；亦可手动
  把 `.env` 两行摘要改回上一版后 `docker compose ... up -d --wait`。
- 健康：api `/readyz/api`、worker `/readyz/worker`、web `/login`（compose 内建 healthcheck）。
- 调部署期运行时参数：改 `compose.prod.override.yml`（非治理，无需 governance 仪式）；
  改容器契约本身才动受治理的 `compose.prod.yml`。
- 启动报错排错：api / worker / migrate 启动日志报
  `database_config_invalid:production_local_database_host` → 查 `.env` 中库地址是否误填
  本机 / 容器内地址 → 改为云数据库地址并核对 verify-full + CA → 重跑部署。

## 附录：FIX-G4 修复说明（#247 / PR #238）

> 本说明原计划作为独立文件 `ai-docs/delivery/reviews/FIX-G4-privacy-worker-prod.md`。
> `pnpm docs:check` 的 public-text-policy 对受管文本有 `MAX_FILES=2530` 上限
> （`scripts/ai-docs/public-text-policy.mjs`，越限报 `PTP_FILE_LIMIT:<实际文件数>`）。
> `origin/main` 已恰为 2530；再新增独立说明 + 独立 proof 会变成 2532 并让 CI verify 失败。
> 按策略要求不调高上限，故将本说明并入本文档，将单测并入已有的
> `apps/worker/test/deploy-worker-env.proof.ts`（`pnpm -C apps/worker prove:privacy-worker-runtime`
> 现指向该文件）。

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
6. **单测**：并入已有 `apps/worker/test/deploy-worker-env.proof.ts`（`pnpm -C apps/worker prove:privacy-worker-runtime` 现指向该文件，以避免新增受管 `.ts` 触顶 `PTP_FILE_LIMIT`）。并 grep 钉死公开 DELETE 仍为 503。
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

原独立 `privacy-worker-runtime.proof.ts`（现已并入 `deploy-worker-env.proof.ts`）原先用 `fileURLToPath(new URL('../../..', import.meta.url))` 得到带尾斜杠的仓库根，再 `endsWith('meetwise') || includes('mw-fix-g4')`。标准 clone 路径如 `/path/meetwise/` 因尾斜杠而恒为 false，只有目录名碰巧含 `mw-fix-g4` 才过。已改为：去掉尾部 `/` 或 `\`，并用 `existsSync(pnpm-workspace.yaml)` + `existsSync(docker/compose.prod.yml)` 探测仓库根，不再依赖目录名。

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
