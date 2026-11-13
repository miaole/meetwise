---
id: architecture_devops_ci_cd
name: CI/CD 与发布门禁
description: PR 门禁（docs/lint/arch/契约/单测/RLS 越权/graph fixture/golden 安全+eval/demo 黄金路径 e2e/覆盖率）、密钥与供应链扫描、环境晋级、两类回滚、零停机迁移。把测试与门禁变成卡合并的执行体，不是空头支票。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ../../testing/strategy/test-strategy.md
  - ../../delivery/production-backlog.md
  - ../ai/runtime-migration.md
---

# CI/CD 与发布门禁

> 审计 P0：写了一长串「发布门禁」却无执行体，还引用不存在的 rollback 文档。本文把门禁变成**卡合并/卡发布的执行体**。

## 1. PR 门禁（全绿才可合并）

| 阶段 | 检查 | 失败动作 |
|---|---|---|
| docs | `pnpm docs:check`（必需文件 + 关键术语） | 阻断 |
| 静态 | lint + typecheck + **dependency-cruiser arch test**（模块边界、ai-runtime 不反调、AI 图不碰权益） | 阻断 |
| 契约 | zod4 **schema-diff**：破坏性变更未走版本化 → 阻断 |
| 单元 | Vitest/Jest，**覆盖率阈值**（核心域 ≥ 设定线） | 低于阈值阻断 |
| 隔离 | **RLS 多角色越权测试**：A 查 B / 无 principal → 断言 0 行 | 任一越权阻断 |
| 并发 | CAS 竞争、同 threadId 并发 resume（断言恰一个赢、不双发） | 阻断 |
| graph | 确定性 fixture + fake model 轨迹测试 | 阻断 |
| AI 安全/质量 | **对抗 golden 安全套件 + ai-eval golden**，对真实模型跑，红 → 阻断发布 | 阻断 |
| e2e | 隔离 prove 阻断合并。HTTP 全链路是 `pnpm e2e:isolated`（fetch/SSE，需 live Key，**不在** per-push）。Playwright 只覆盖 `pnpm e2e:ui:isolated` 浏览器层 | 隔离 prove 阻断；live E2E 非 per-push |
| 安全扫描 | gitleaks 密钥扫描 + Trivy/Dependabot SCA + 镜像扫描 | 高危阻断 |

## 2. 密钥与供应链

- pre-commit + CI **gitleaks**；仓库只允许 `*.env.example`，禁真 `.env`/密钥/简历原件/录音。
- 已知泄露的 Langfuse key 走泄露 IR：轮换 + 影响面核查（见 `rules/security/secrets-management.md`，待补）。
- SBOM + 依赖告警；防挖矿（补丁/扫描）接部署加固。

## 3. 环境与晋级

`dev`（compose.dev，本地全栈）→ `staging`（仿真）→ `prod`。晋级条件：上一环境 PR 门禁全绿 + demo 黄金路径冒烟。**不上 K8s（demo/早期单机 compose），不上 IaC（暂缓）**——见 ADR。

## 4. 两类回滚

| 类别 | 触发 | 动作 | 是否发版 |
|---|---|---|---|
| 配置面 | manifest（图/prompt/模型）效果坏 | 翻 `manifest.status`，灰度路由回退；进行中 run 因 pin 不受影响 | 否 |
| 代码面 | 迁移函数/共享代码 bug | deploy 修复 + 期间全局降级（关懒迁移、强制 pin 旧 manifest、batch 停） | 是 |

特性开关 / kill-switch 走服务端 flag 平面（非 provider 告警），可按租户灰度、可硬关。

## 5. 零停机迁移

DB 用 **expand-contract**（先加列/表兼容双写 → 切读 → 删旧），长会话 checkpoint 不能 drain，发布前用**黄金 checkpoint resume 冒烟**验证在飞会话可续（见 `runtime-migration.md`）。WAL/PITR 备份 + 恢复演练。

## 6. 流水线（示意）

```
push → [docs|lint|arch|contract|unit|rls|concurrency|graph] 并行
     → [ai-safety+eval golden vs 真实模型]
     → [build + 安全扫描]
     → [demo 黄金路径 e2e]
     → 全绿 → 可合并 → staging 自动部署 → 冒烟 → 人工晋级 prod（蓝绿/滚动）
```

**审计 H7/H8 修复——区分"已接入"与"计划"，别把表当全已落地**：
- **已 wired 进 `ci.yml`（真能卡合并）**：`docs:check`、密钥扫描(gitleaks 全历史)、五个验证 gate（`db:prove`/`runtime:prove`/`graph:prove`/`api:validate`/`pipeline:prove`）。
- **计划/未接入（DoD 不得宣称已具备）**：lint/typecheck、dependency-cruiser arch test、契约 schema-diff、覆盖率门、e2e 黄金路径、对抗安全 golden + ai-eval。这些是路线，不是现状。
- **真实模型 ai-eval 不作 PR 硬合并门**（H8：非确定性 flake 会阻断全部合并，且与"secrets 门控"矛盾）→ 移到 **nightly / release-gate**，带阈值 + flake 容忍 + owner；**PR 只跑 fake-model 确定性 fixture**。

DoD：标"已 wired"的每条都是 CI 里真实运行、真能卡住合并的 job；标"计划"的不得在 DoD 里冒充已具备。

## 7. ECS 全栈 GitHub CD 当前实施状态

- 目标流水线：`successful main CI SHA → ACR digest images → ECS forced command → quiesce → migrate → internal compose → synthetic/E2E → signed probe → external verify → confirm → Pages exact receipt`。
- 2026-08-20 远程 `main` 尚无该 workflow，ECS 也未 provision Compose/controller；状态是候选实现，不是已接入。
- PR gate 至少要构建两个 Docker image（不 push）并运行状态机行为 proof；纯 regex/includes 不能发现 publish 前 Web 未启动、旧写者未静默或 rollback 过早清理。
- 部署成功必须同时绑定 GitHub run/head SHA、OCI digests、controller live digest、migration ledger、publication generation、Pages final fingerprint 和公网 E2E receipt。
- 任一后半程失败必须由持久状态机自动恢复 predecessor 或保持可前滚的 fail-closed maintenance；不得让 workflow 绿而 Pages 仍 disabled，也不得让 workflow 红后无限期停站。

## 8. 轻量 CI（2026-11-11 用户决定：「CI 轻量，重要的校验、核心够用就行」）

> 本节取代 §6「已 wired 进 `ci.yml`」清单与 §7 中「PR gate 至少要构建两个 Docker image」一条：容器构建移到 nightly。云服务器尚未购买，`deploy.yml` 报红属预期，保持原样不改。全栈 E2E 不进 CI，不配 `MODEL_API_KEY`，本地手跑 `pnpm e2e:isolated`。

### 8.1 PR / main push 门（`ci.yml`）

| job | 内容 | 必过 |
|---|---|---|
| `secrets-scan` | gitleaks 全历史 + 全仓合并冲突标记扫描（`conflict-marker-scan.proof.mjs` + `conflict-marker-scan.mjs`） | 是 |
| `verify` | install → `docs:check`（含 §8.2 步骤台账一致性门）→ **E2E 静态守卫 12 条 + 隐私删除预览 503 无库 pin 2 条**（PR243 复审补回，无库，本地实测合计约 10s）→ `arch` → typecheck 门 → lint 门 → 无库单元 prove 8 条（与原 verify 同序位于 `db:up` 之前；`sse-slot:prove` 已自封闭，见下）→ 核心 DB 门（`db:up` + `db:prove` 四原语 + 迁移编号唯一性 + `migrate:prove`）→ 单元 prove 20 条（确定性秒级，保持原 verify 中位于 db:up 之后的顺序）。checkout 需 `fetch-depth: 0`（迁移编号唯一性门读父提交） | 是 |
| `deps-audit`（独立 workflow） | `pnpm audit --prod --audit-level=critical` | 否（PR/main 均跑） |

`verify` 设 `timeout-minutes: 15`；目标耗时 < 5 分钟（原 verify 约 10.5–14 分钟）。

`sse-slot:prove` 自封闭（PR243 小门B）：`apps/api` 的 `prove:sse-slot` 以 `env -u DATABASE_URL -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE` 启动，SSE notify 单例（`principal.guard` 模块加载期即 `onPrincipalEvict → whenHealthy → createPool`）不建 LISTEN 池、固定 `listen_down` 降级走 2s 轮询；proof 内另有 hermetic 断言（进程无库目标变量 + 单例无池），带库环境直跑 `node …proof.ts` 即红。实测：可达空库 ×3 与无库 ×2 均每 holder=2 次（≤3）；改前可达空库每 holder=4 次（CI run 42947057277 同症）。不再靠步骤顺序兜底。

### 8.2 原 verify 105 步逐条分类（无一静默删除）

三类：**保留（PR/main）**＝在 `ci.yml`；**移到 nightly**＝`nightly-ciw2.yml`（每日 UTC 19:30，亦可 workflow_dispatch 手动触发），除容器构建外 `verify:local` 也含同一命令，便于本地复跑；**移出 CI，本地手跑**＝只在 `verify:local`。脚本全部保留在仓库，`pnpm db:up && pnpm verify:local` 一条命令按原 verify 顺序复跑 nightly 与本地两类的全部 prove 命令（不含 docker build，也不含已回 PR 的 14 条静态守卫 / 503 pin）。单条也可直接 `pnpm <script>` 跑。

当前计数（PR243 复审后）：**保留 47 / nightly 21 / 本地 37 = 105**（复审前 41 / 10 / 54：6 行回 PR，11 行补入 nightly）。nightly 那 21 行里，容器构建 1 行只在 nightly，其余 20 行（含隐私删除暂停 4 条命令、语音等多命令行按行计）`verify:local` 也含。

**台账一致性门（PR243 小门A，盲区补强）**：`pnpm docs:check` 解析本节两张表，与 `ci.yml`（全部 job）、`nightly-ciw2.yml`、`package.json` 的 `verify:local`（按 `&&` 拆）双向对账。比对**完整命令串**（含参数、行首 / step 级 `ENV=val` 前缀，以及 run 块里的 `export VAR=val` / `unset` / `>> $GITHUB_ENV`；step `env:` 与 `VAR=val pnpm …` / `env VAR=val pnpm …` 归一后必须与表中写法一致）。`run: >` 折叠标量按 YAML 语义拼成一行再比对。执行面里任一受跟踪命令（`pnpm` / `node scripts/` / `docker build` / `bash` / `sh` / `npx` / `tsx` / `npm` / `yarn` / `cd …`，以及 `env …` 包装）不在表里，或表里命令没出现在「去向」声明的执行面、或出现在未声明的执行面（`pnpm install` / `pnpm db:up` 基础设施除外），即 EXIT 1。`ci.yml` / `nightly-ciw2.yml` 中出现非 `!cancelled()` 的 `if:`，或出现 `continue-on-error` 且值不是字面 `false` / `${{ false }}`（含 `${{ true }}`、`${{ 1 }}`），亦 EXIT 1，除非本表对应行用反引号显式标记（`` `if: <expr>` `` 归一后全等比较，不得靠子串；job 级还须同时标记 `` `job: <id>` ``）。能简单检测到的弱化——run 块首行 `exit 0`、`set +e`、step / job / workflow 的 `shell:` 覆盖——同样须登记。门**不覆盖**其余 shell 语义（`trap`、heredoc、`if` / `then` / `fi` 把命令包掉、本地 / 第三方 `uses:` 内部执行面等），那些是门的边界，不能当成已看守。门内对每种已覆盖的盲区写法做反证（含去掉 env 前缀、改 step env 为 `'0'`、`export` 覆盖、`if: false`、多命令步 / job 级 `if: 0`、`continue-on-error: true` / `${{ true }}` / `${{ 1 }}`、折叠续行改参、未登记的 `env FOO=1 pnpm` / `bash` / `npx` / `cd … && pnpm`、首行 `exit 0`、`set +e`、`shell:` 覆盖），缺报或删掉反证调用即 `docs:check` 红。改 CI / nightly / verify:local 必须同步改本表。

| # | 原步骤 | 命令 | 去向 |
|---|---|---|---|
| 1 | actions/checkout | — | 保留（PR/main） |
| 2 | pnpm/action-setup | — | 保留（PR/main） |
| 3 | actions/setup-node | — | 保留（PR/main） |
| 4 | pnpm install --frozen-lockfile | `pnpm install --frozen-lockfile` | 保留（PR/main） |
| 5 | pnpm docs:check | `pnpm docs:check` | 保留（PR/main） |
| 6 | E2E directory contract (not live E2E) | `pnpm e2e-platform:check` ; `pnpm e2e-platform:prove` ; `pnpm e2e-platform:layout:prove` | 保留（PR/main · PR243 复审补回） |
| 7 | E2E static guards (fake-service flags + secret-redaction scan) | `pnpm e2e-static-guards:check` ; `pnpm e2e-static-guards:prove` | 保留（PR/main · PR243 复审补回） |
| 8 | UI runner 构建复用守卫（无库，不是 live E2E） | `pnpm e2e-ui-stale-build-guard:prove` | 移出 CI，本地手跑 |
| 9 | E2E 用例与断言 parity（静态，非发布证据） | `pnpm e2e-parity:check` ; `pnpm e2e-parity:prove` | 保留（PR/main · PR243 复审补回） |
| 10 | 隐私删除预览路径（域/契约 pin，非发布证据） | `pnpm privacy-erasure-preview:domain:prove` ; `pnpm privacy-erasure-preview:contract:prove` | 保留（PR/main · PR243 复审补回） |
| 11 | 公开文案边界（不替代发布证据） | `pnpm -C apps/web prove:public-copy` | 移出 CI，本地手跑 |
| 12 | 模型供应商出站静态清单（observe-only，非发布证据） | `pnpm provider-egress:inventory` ; `pnpm provider-egress:prove` | 保留（PR/main · PR243 复审补回） |
| 13 | 公开预览写门禁清单与围栏（非发布证据） | `pnpm public-preview-write:inventory` ; `pnpm public-preview-write:prove` ; `pnpm public-preview-write-gate:prove` | 保留（PR/main · PR243 复审补回） |
| 14 | 架构边界（无环 / 依赖向下 / ai-graphs 纯 / ai-runtime 关口） | `pnpm arch` | 保留（PR/main） |
| 15 | typecheck gate (turbo zero-error domains · | `pnpm turbo run typecheck --dry=json > /tmp/turbo-typecheck-dry.json` ; `pnpm turbo typecheck` | 保留（PR/main） |
| 16 | lint gate (turbo lint · | `pnpm turbo lint` | 保留（PR/main） |
| 17 | interview dispatch fairness (no database) | `pnpm interview-dispatch:unit:prove` | 保留（PR/main） |
| 18 | interview dispatch wrapper gate (no database, not remote SQL) | `pnpm interview-dispatch:gate:prove` | 保留（PR/main） |
| 19 | quiz/diagnosis dual-claim fail-closed (no database) | `pnpm quiz-dual-claim:unit:prove` | 保留（PR/main） |
| 20 | quiz/diagnosis/report sequential drain order (no database) | `pnpm owner-drain-order:unit:prove` | 保留（PR/main） |
| 21 | SSE last-event-id fail-closed parser (no database) | `pnpm last-event-id:unit:prove` | 保留（PR/main） |
| 22 | Model slot legacy bypass static guard (no database) | `pnpm model-slot-bypass:static:prove` | 保留（PR/main） |
| 23 | SSE shared principal slot 5+1 429 (no database) | `pnpm sse-slot:prove` | 保留（PR/main） |
| 24 | Web preview gate behavioral proof (real NextRequest, not string match) | `pnpm -C apps/web prove:middleware` | 保留（PR/main） |
| 25 | Full-stack container build gate (no push) | `docker build`×2（backend + web，不推送） | 移到 nightly（仅 nightly · verify:local 不含 docker build） |
| 26 | pnpm db:up | `pnpm db:up` | 保留（PR/main） |
| 27 | wait for postgres | — | 保留（PR/main） |
| 28 | 四原语（CAS / 幂等 / RLS 越权=0 / 事件 seq） | `pnpm db:prove` | 保留（PR/main） |
| 29 | 迁移编号唯一性门（数值前缀·#140 修法②·豁免登记面·MIG-RUNNER 裁决项③ 本刀落码·CI-WIRING 只登记接线） | `node scripts/check-migration-version-uniqueness.mjs` | 保留（PR/main） |
| 30 | 版本化迁移运行器（只跑待应用·幂等·事务·漂移检测·advisory锁） | `pnpm migrate:prove` | 保留（PR/main） |
| 31 | 旧库升级到当前清单（上一版 main 账本 → tip·防链首插号致 migration_ledger_not_contiguous_prefix） | `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 32 | schema 漂移门（迁移路径 vs sql/ 真相 逐列+约束比对;防"改 sql/ 忘写迁移"致 fresh deploy 缺表/列/约束） | `pnpm drift:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 33 | B端历史快照迁移回归（stale binding + deferred FK pending events） | `pnpm neg:bend` | 移出 CI，本地手跑 |
| 34 | 负路径·认证/会话域（停用后令牌即时失效/再登录拒/防枚举） | `pnpm neg:auth` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 35 | 负路径·commerce 域（额度/订单/回调负路径） | `pnpm neg:commerce` | 移出 CI，本地手跑 |
| 36 | 负路径·resume/隐私域（越权/围栏/擦除负路径） | `pnpm neg:resume` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 37 | 负路径·interview 域（终态/跨用户/abandon 幂等） | `pnpm neg:interview` | 移出 CI，本地手跑 |
| 38 | 负路径·输入对抗域（注入/穿越/超长/unicode 不 5xx） | `pnpm neg:input` | 移出 CI，本地手跑 |
| 39 | uc033 跨用户授权负路径（报告/面试/学习全臂） | `pnpm uc033:cross-user-authz:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 40 | DBHY-1 卫生刀 prove（死表退役+sql/ 兼容镜像退役残面门+fresh deploy 重建+qbank 分区释放例程） | `pnpm dbhy1:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 41 | DB ACL pgp_sym_encrypt 补授门（两段式迁移重放+42501 负门+过度授权负门·隔离一次性 PG） | `pnpm db-acl2:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 42 | 跨供应商 failover（primary 故障秒切 backup·内容拒不换供应商·全挂交降级） | `pnpm failover:prove` | 保留（PR/main） |
| 43 | commerce saga（共享池 reserve/confirm/release · FIFO · 按比例 · 并发不超卖 · 对账 · 零额度丢失） | `pnpm commerce:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 44 | 简历摄取（原文加密落库 · 结构化 profile 永不含明文PII · 注入拦截 · 状态机 · 去重 · RLS） | `pnpm resume:prove` | 移出 CI，本地手跑 |
| 45 | 报告子图舱壁（失败隔离:报告失败不碰 interview · 独立重试 · 并发不双跑 · report_ready） | `pnpm report:prove` | 移出 CI，本地手跑 |
| 46 | 押题进程接线（v61 typed resume 引用 · 接地 · 失败退款 · SSE 终态） | `pnpm quiz:prove` | 移出 CI，本地手跑 |
| 47 | 孤儿任务收割（心跳 vs 收割 · 失败退款 · 已结算不倒退） | `pnpm reaper:prove` | 移出 CI，本地手跑 |
| 48 | 模型调用逻辑节点派发配额（同 key 并发唯一 executor · 冻结头只配精确 reservation · trigger 形状门拒绝旁路） | `pnpm model-op00:prove` | 移出 CI，本地手跑 |
| 49 | 面试进程接线（api 入队 → worker 消费循环 → 生命周期 → 报告） | `pnpm adaptive:prove` | 移出 CI，本地手跑 |
| 50 | INT-LEVEL 控制信号（weak/thrashing → decideNext，杀开关先赢） | `pnpm adaptive-signals:prove` | 保留（PR/main） |
| 51 | INT-LEVEL 控制信号图 hook（concludeReason provenance；杀开关先赢） | `pnpm adaptive-signals-graph:prove` | 保留（PR/main） |
| 52 | SIGNAL-SSE 预览投影（early_weak/thrashing → session_concluded，不发明分） | `pnpm signal-sse:prove` | 保留（PR/main） |
| 53 | SIGNAL-SSE 契约（strict 拒 score/band，不进 OpenAPI） | `pnpm signal-sse-contract:prove` | 保留（PR/main） |
| 54 | SIGNAL-SSE worker 接线（假 append，无 DB） | `pnpm signal-sse-worker:prove` | 保留（PR/main） |
| 55 | agent 接地题（检索素材出题 + 版权照搬门） | `pnpm grounded:prove` | 保留（PR/main） |
| 56 | agent CRAG（检索质量分级 + 纠偏 / 外呼降级） | `pnpm crag:prove` | 保留（PR/main） |
| 57 | agent 工具（注册 + 延迟加载） | `pnpm tools:prove` | 保留（PR/main） |
| 58 | agent 出题自审（critique → 重生成） | `pnpm critique:prove` | 保留（PR/main） |
| 59 | agent 自适应图（决策表 / 中断 + 重启续会话） | `pnpm adaptive-graph:prove` | 保留（PR/main） |
| 60 | agent 自适应全流程（fake deps 图执行） | `pnpm adaptive-flow:prove` | 移出 CI，本地手跑 |
| 61 | agent 自适应生命周期（结算 / 收尾 / 跨会话判重） | `pnpm adaptive-life:prove` | 移出 CI，本地手跑 |
| 62 | agent 消费循环（claim / 租约 / reaper 收割孤儿） | `pnpm adaptive-consumer:prove` | 移出 CI，本地手跑 |
| 63 | checkpoint 低权 RLS 与撤销写栅栏 | `pnpm checkpoint-role:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 64 | 隐私删除安全暂停（app_role 无破坏性入口） | `pnpm privacy-erasure:prove` ; `pnpm privacy-erasure:http:prove` ; `pnpm privacy-erasure-preview:prove` ; `pnpm privacy-erasure:pause-upgrade:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 65 | 评分旁路停用（真实 HTTP + 当前迁移组合根零副作用） | `pnpm scor-00:http:prove` | 移出 CI，本地手跑 |
| 66 | 评分状态机/公式 TS↔SQL 对拍 + INSERT 初始态守门 | `pnpm scor-parity:prove` | 移出 CI，本地手跑 |
| 67 | 评分/报告 P0 完整性（隔离一次性 PG·总分聚合不可被模型越权改写） | `pnpm scoring-integrity:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 68 | 流式 token 进度接线（generation_started 先于业务结果落表+payload 白名单围栏） | `pnpm tokenstream:prove` | 移出 CI，本地手跑 |
| 69 | 长上下文真实 v64 队列/图/报告链路（大答案截断+载荷净化+额度精确） | `pnpm stress:prove` | 移出 CI，本地手跑 |
| 70 | UC003 i18n locale 结构断言（S1-S6+G3' 七查·raw 隔离口径） | `pnpm uc003:i18n-locale:prove` | 移出 CI，本地手跑 |
| 71 | agent 模型可观测（token / 延迟 / 成本落库） | `pnpm metrics:prove` ; `pnpm model-output-limit:prove` ; `pnpm dashscope-native-config:prove` ; `pnpm voice-operation-policy:prove` ; `pnpm voice-stream-asr-honesty:prove` ; `pnpm interview-voice-seams:prove` ; `pnpm ocr-operation-policy:prove` | 移出 CI，本地手跑 |
| 72 | agent 语音自适应（modality-agnostic ≡ 文本路径） | `pnpm voice-adaptive:prove` | 移出 CI，本地手跑 |
| 73 | agent 题库 generation（完整迁移 / 不可变 recipe / 完整工件 / 撤销） | `pnpm rag-generation:prove` | 移出 CI，本地手跑 |
| 74 | agent 题库历史完整性升级（0068数据平面归零 → 0069隔离 → 0070–0072低权限 RLS） | `pnpm qbank-integrity-upgrade:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 75 | agent 题库控制面最小权限（伪造 GUC 仍拒绝 / 独立 executor） | `pnpm qbank-control-role:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 76 | 通用 RAG 控制连接启动门（独立低权身份 / definer-RLS 漂移 fail-closed） | `pnpm rag-control-runtime:prove` | 移出 CI，本地手跑 |
| 77 | 通用 RAG 控制面目录/ACL 与动态向量 policy 门 | `pnpm rag-control-role:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 78 | 通用 RAG 0032 前缀升级隔离门 | `pnpm rag-control-upgrade:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 79 | 通用 RAG 版本、request 围栏与 rebuild lease 门 | `pnpm rag-corpus-version:prove` | 移出 CI，本地手跑 |
| 80 | 通用 RAG 派发/对账状态机门 | `pnpm rag-control-dispatch:prove` | 移出 CI，本地手跑 |
| 81 | 迁移 CLI 的 DATABASE_URL 低权账号 post-flight 门 | `pnpm migrate-cli:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 82 | agent 题库摄取管线（类型感知 / 嵌入 / 召回门） | `pnpm qbank-pipeline:prove` | 移出 CI，本地手跑 |
| 83 | agent Web 探索（SSRF 安全:私网/allowlist/超时/降级） | `pnpm web-explore:prove` | 保留（PR/main） |
| 84 | agent 优雅降级（出题失败→兜底题不崩面试） | `pnpm adaptive-degrade:prove` | 移出 CI，本地手跑 |
| 85 | 自适应面试端到端（真图多轮 + 结算 + 报告舱壁） | `pnpm interview:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 86 | worker 优雅排空（SIGTERM 等在飞 job 跑完再退,滚动部署零丢失） | `pnpm drain:prove` | 移出 CI，本地手跑 |
| 87 | worker 事件唤醒（LISTEN 生命周期 + 合并 wake 本地合同） | `pnpm worker-wakeup:prove` | 移出 CI，本地手跑 |
| 88 | 检索/召回引擎（度量数学 + dense/BM25/RRF 排序 + 金标端到端;真召回率见 benchmark:eval） | `pnpm retrieval:prove` | 保留（PR/main） |
| 89 | 评分官质量度量数学（stddev n-1/tie-corrected Spearman·Kendall/ICC/成对序·退化用例;真评分官质量见 nightly scoring-eval） | `pnpm scoring-eval:prove` | 保留（PR/main） |
| 90 | B端反题库窃取/反注入（题库不进候选面·确定性抽样·结构化输出兜底·上下文最小化） | `pnpm security:prove` | 保留（PR/main） |
| 91 | 鉴权（scrypt 密码哈希 + HMAC 令牌,常量时间校验） | `pnpm auth:prove` | 保留（PR/main） |
| 92 | 生产向量库（pgvector HNSW · ANN对齐暴力余弦 · 索引真用 · RLS隔离 · 隐私不存原文） | `pnpm vectorstore:prove` | 移出 CI，本地手跑 |
| 93 | 记忆模块 lean（跨会话精确判重 + 历史弱项只读投影 + RLS 不串户 + 隐私:题面非答案/PII） | `pnpm memory:prove` | 移出 CI，本地手跑 |
| 94 | 部署编排校验（compose.prod 结构合法 · 6 服务 · healthcheck · 依赖顺序） | `pnpm deploy:check` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 95 | 语音面试 modality-agnostic（同一图经 ASR/TTS 推进 ≡ 文本路径） | `pnpm voice:prove` | 移出 CI，本地手跑 |
| 96 | TTS 响应 URL 下载安全（SSRF / DNS 固定 / 截止时间 / MIME / 体积） | `pnpm -C packages/ai-runtime prove:voice-reliability` | 移出 CI，本地手跑 |
| 97 | 非流式语音取消链路（代理 / API / 适配器） | `pnpm -C apps/web prove:speak-proxy` ; `pnpm -C apps/web prove:transcribe-proxy` ; `pnpm -C apps/api prove:voice-timeout` ; `pnpm -C apps/api prove:voice-cancel-http` | 移出 CI，本地手跑 |
| 98 | 流式语音 fake-seam 合同（不是产品流式 ASR / E2E） | `pnpm vstream:prove` | 保留（PR/main） |
| 99 | 运行内核（db 四原语 + ai-runtime invoke 双校验·重试·幂等 / 状态机 / 租约 / 可恢复 / 幻觉拦截） | `pnpm runtime:isolated:prove` | 移到 nightly（PR243 复审补入 · verify:local 亦含） |
| 100 | 真 LangGraph 图（ai-graphs 纯图 + worker PostgresSaver：interrupt + 重启续会话） | `pnpm graph:prove` | 移出 CI，本地手跑 |
| 101 | 请求路径 + SSE（principal 注入 / RLS fail-closed / 幂等 / Last-Event-ID 重放） | `pnpm api:validate` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |
| 102 | 契约 must-smoke（NestJS×SWC×类型DI + @meetwise/contracts zod4 校验） | `pnpm api:smoke` | 保留（PR/main） |
| 103 | 前端承重逻辑（SSE 业务事件解码 · 契约客户端校验 · report_unavailable 优雅降级不转圈） | `pnpm web:prove` | 保留（PR/main） |
| 104 | 端到端 简历→押题（S2 摄取清洗 + S4 押题图 + factuality 歪曲门） | `pnpm pipeline:prove` | 保留（PR/main） |
| 105 | OCR 简历图片视觉转写（关口双校验 + 按次计费 reserve/confirm/release + PII不入trace + 下游注入门） | `pnpm ocr:prove` | 移出 CI，本地手跑 |

#### 8.2.1 原 verify 之外的步骤（同受台账门约束）

| # | 步骤 | 命令 | 去向 |
|---|---|---|---|
| S1 | secrets-scan job：合并冲突标记全仓扫描（先种植 proof 再扫本仓） | `node scripts/conflict-marker-scan.proof.mjs` ; `node scripts/conflict-marker-scan.mjs` | 保留（PR/main · secrets-scan job） |
| S2 | #226 簇Ⅳ 归置：recruiter 无 key 隔离 | `pnpm recruiter:prove` | 仅 nightly（原有） |
| S3 | #155 点名件：SSE push notify | `pnpm sse-push:notify:prove` | 仅 nightly（原有） |
| S4 | #155 点名件：向量平面擦除（隐私步骤，`if: !cancelled()`） | `pnpm vector-plane-erasure:prove` | 仅 nightly（原有） |
| S5 | 转写隐私·答案事实根 + 其余 sink（隐私步骤，`if: !cancelled()`；PR243 复审补入） | `pnpm int-transcript-answer-fact-root:prove` ; `pnpm int-transcript-remaining-sinks:prove` | 仅 nightly（PR243 复审补入） |
| S6 | #247 高 inflight 下 checkpoint 写失败不拖垮 worker（WORKER-INFLIGHT-CRASH-01，含 #260 锁存优先级） | `pnpm worker-inflight-crash:prove` | 未入 CI，本地手跑（第二批合入后补挂） |
| S7 | #249 #18 payload 明文 answer 消费即剥离（隔离 PG） | `pnpm int18:payload-strip:prove` | 未入 CI，本地手跑（第二批合入后补挂） |
| S8 | #248/#261 按路由的请求体上限与 413 契约（`body-limit:prove` 与 `authz34:chunked-cap:prove` 是同一条命令：`node scripts/run-e2e-isolated.mjs authz34:chunked-cap:prove`） | `pnpm body-limit:prove` | 未入 CI，本地手跑（第二批合入后补挂） |
| S9 | #254 HTTP 层跳过当澄清（隔离 PG + 脚本模型） | `pnpm skip-as-clarify:http:prove` | 未入 CI，本地手跑（第二批合入后补挂） |
| S10 | #263 0143 SSE NOTIFY trigger 缺失或禁用时 readiness fail-closed（隔离 PG） | `pnpm sse-notify-trigger-health:prove` | 未入 CI，本地手跑（第二批合入后补挂） |
| S11 | #257 擦除流覆盖 interview_job 明文 + 投影物理 purge（0232，隔离 PG） | `pnpm erasure-job-projection:prove` | 未入 CI，本地手跑（第二批合入后补挂） |
| S12 | ha6 scripts digest / 治理锚（改根 package.json scripts 后须重登；t1660u：不进主 CI） | `pnpm ha6:prove` | 仅 nightly（t1660u 协调者代决 · 改 scripts 的 PR 本地必跑） |

### 8.3 nightly 只放少量关键 prove（建议与理由）

只挑「坏了会丢钱、泄露、丢数据或上云即炸」且 PR 门不覆盖的无 key 隔离 prove。复审前为原 verify 的 10 行（容器构建 + 9 行 prove；那 9 行即 `verify:local` 也含的部分，「10 vs 9」是同一批口径不同，不是漏项）。PR243 复审（mw-privacy-int + mw-e2e-ha）后再补入原 verify 的 11 行 + 转写隐私 2 条，job 设 `timeout-minutes: 60`（默认 360）。实测约 7–9 分钟（2026-11-11 run 42981810539 约 6m56s；run 42989444727 约 8m28s）。隐私类步骤（向量平面擦除、隐私删除暂停 4 条、转写隐私 2 条、`neg:resume`）以及复审后补入的 `neg:auth`、权限 / RLS 五门、迁移升级三类、`runtime:isolated:prove` 均设 `if: ${{ !cancelled() }}`，前序步骤红也照跑，只在手动取消时跳过。

| prove | 理由 |
|---|---|
| 容器构建（backend + web，不推送） | Dockerfile / standalone 打包错误只在构建时暴露；无部署目标时不必每个 PR 花 2 分钟 |
| `deploy:check` | compose.prod 结构 / 健康检查 / 依赖顺序，与容器构建同属上云前置 |
| `migrate-upgrade:prove` | 旧库升级到当前迁移清单（G1 回归面：链首插号 → `migration_ledger_not_contiguous_prefix`）；需全历史，nightly checkout `fetch-depth: 0` |
| `drift:prove` | 迁移路径与 `sql/` 真相逐列 + 约束对账，防 fresh deploy 缺表 / 列 |
| `uc033:cross-user-authz:prove` | 跨用户授权负路径（报告 / 面试 / 学习），越权即泄露 |
| `commerce:prove` | 额度 saga：并发不超卖、零额度丢失，直接关系钱 |
| 隐私删除安全暂停（4 条） | app_role 无破坏性入口，隐私红线 |
| `scoring-integrity:prove` | 总分确定性聚合，模型不可越权改分 |
| `interview:prove` | 面试主链路：真图多轮 + 结算 + 报告舱壁 |
| `api:validate` | 请求路径 + SSE：principal 注入 / RLS fail-closed / 幂等 / Last-Event-ID 重放 |
| `int-transcript-answer-fact-root:prove`、`int-transcript-remaining-sinks:prove`（复审补入） | 转写明文答案不落库 / 不外溢到其余 sink，隐私红线 |
| `neg:resume`、`neg:auth`（复审补入） | 隐私 / 认证负路径：越权、围栏、擦除；停用后令牌即时失效、防枚举 |
| `db-acl2:prove`、`checkpoint-role:prove`、`qbank-control-role:prove`、`rag-control-role:prove`、`migrate-cli:prove`（复审补入） | 权限 / RLS 低权账号门，越权即泄露，与 uc033 同一风险类 |
| `dbhy1:prove`、`qbank-integrity-upgrade:prove`、`rag-control-upgrade:prove`（复审补入） | 迁移升级类，与 migrate-upgrade / drift 同属「上云即炸」 |
| `runtime:isolated:prove`（复审补入） | 运行内核：CAS / 租约 / 幂等 / 可恢复 / 迟到成功，坏了是全局正确性问题 |
| `ha6:prove`（t1660u 补入 nightly，不进主 CI） | 根 package.json scripts digest 与治理锚；改 scripts 漏重登会让本地/nightly 红，主 CI 仍保持轻量 |

其余 37 行只在本地。改到相关域时按 `ai-docs/skills/testing/run-gates.md` 选跑对应 prove，合并前大改动建议整跑一次 `pnpm verify:local`。

**上云待办（不改 `deploy.yml`）**：`deploy.yml` 由 `workflow_run: [ci]` 成功触发，CI 变轻后自动部署只受轻量 CI 把关。买云、开始真实部署之前，必须把 `migrate-upgrade:prove`、`drift:prove`、容器构建、`deploy:check`（或整条 nightly-ciw2）设为部署前置，再放开自动部署。当前云未购买，deploy 报红属预期，本条只登记、不动 workflow。

### 8.4 本地怎么跑

```bash
pnpm install --frozen-lockfile
pnpm db:up                 # 本地 dev Postgres（54329）
pnpm verify:local          # nightly 20 行 + 本地 37 行的全部 prove 命令（不含 docker build 与已回 PR 的静态守卫），按原顺序
pnpm e2e:isolated          # 全栈 HTTP E2E，需本地 MODEL_API_KEY；不在 CI
```

`verify:local` 是一条 `&&` 链：首个失败即停，不汇总后续结果；看到红先修这一条再重跑（或单独 `pnpm <script>` 从失败处往后跑）。改成逐条汇总的 runner 已登记为后续 P3。

NOT_HA · releaseEvidence=false。
