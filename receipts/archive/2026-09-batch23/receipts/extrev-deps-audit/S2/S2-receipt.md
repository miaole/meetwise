# EXTREV-0 DEPS-AUDIT · S2 EXEC 收据（CI audit 门 fail-closed + Renovate · #106 CI 面）

**席位**: mw-depsaud-exec2 · **日期**: 2026-10-07 · **基线**: 2acf92c3（S1 完成态 tip）· **worktree**: line/extrev-deps-aud
**范围严格=S2**：①独立 workflow audit 门 ②负例实跑证明 ③Renovate 最小配置 ④席1 处方记账入 REQUEST（rev3 节已落）。

---

## 1. 门语义声明（fail-closed 逐条）

| 面 | 语义 | 机制 |
|---|---|---|
| critical>0 | **red 阻断** | `pnpm audit --prod --audit-level=critical` 命中即非零退出，步骤默认失败语义，无 `continue-on-error`/`|| true` 等任何放行开关 |
| high/medium/low | **不挡门** | `--audit-level=critical` 只以 critical 计红（S1 剩余 18 high 为 Non-claim 面·与 REQUEST §7 一致） |
| **网络失败** | **红非静默** | registry 不可达 → pnpm audit 非零退出 → 步骤红；无 fallback、无重试后静默成功 |
| lockfile 不可解析/缺失 | 红 | 同为非零退出 |
| 步骤位置 | **install 之前** | 本 workflow **零 install**：audit 只读 pnpm-lock.yaml + advisory 端点（负例实测无 node_modules 真红·§3） |
| 触发面 | push(main)/PR/每周 cron/workflow_dispatch | cron 应对 advisory 库滚动——lockfile 不变亦重审同一 lockfile（§7「advisory 库滚动」Non-claim 的门侧对策） |
| 物理边界 | **零触 ci.yml** | 独立文件 `.github/workflows/deps-audit.yml`（rev2 记账「audit 步建议独立 workflow 文件」落实）；action pins 与 ci.yml 同 SHA 同机制 |

## 2. 正例（S1 完成态 · 判据②）

```
CMD:  pnpm audit --prod --audit-level=critical     （worktree 根 @ 2acf92c3·联网）
EXIT: 0
OUT:  25 vulnerabilities found / Severity: 1 low | 6 moderate | 18 high（critical=0 → 门绿）
```

- 与 S1 收据 §5 剩余列（25 条非点名）**逐条同源一致**；18 high 全部 Non-claim 不挡门。
- 证据快照：`positive-exit.txt`（本目录）。

## 3. 负例（判据① · 真 red 实证 · 不 push · 不留分支）

```
1) git worktree add --detach /tmp/s2-negative-test HEAD        # detached·零新分支
2) apps/web/package.json:37  "next": "15.5.27" → "next": "15.5.19"
3) pnpm install --lockfile-only    # EXIT=0·8.7s·corepack 按 packageManager 走 pnpm 10.18.0
                                   # ★ 全程零 node_modules——顺带坐实 audit 无需 install（门步前置于 install 成立）
4) pnpm audit --prod --audit-level=critical
EXIT: 1   （原值·零 retry-to-green）
OUT:  37 vulnerabilities found / Severity: 1 low | 13 moderate | 21 high | 2 critical
      critical×2 均包=next·路径 apps/web>next·均 <15.5.24 受影响列：
      - GHSA-p293-qw3h-jr36  Unauthenticated RCE on windows-hosted servers（修复 ≥15.5.24）
      - GHSA-2xp9-vwfh-vxw4  Unauthenticated RCE in Image Optimization API (AVIF)（修复 ≥15.5.24）
5) git worktree remove --force /tmp/s2-negative-test
   复验：worktree list 无残留；`git branch -a | grep negative` 无命中（EXIT=1=零匹配）→ 零分支残留·主线零污染
```

- 证据：`negative-audit-output.txt`（本目录·含两条 critical 全表）。
- 注：critical×2 与评审/REQUEST §3 调研值（两条 critical 未认证 RCE）吻合；S1 后主线 15.5.27 不在受影响列。

## 4. YAML / 配置校验（判据③④）

| 校验 | 工具 | 对象 | CMD | EXIT | 结果 |
|---|---|---|---|---|---|
| workflow 语法+action 语义 | actionlint 1.7.12（brew 本地补装） | deps-audit.yml | `actionlint .github/workflows/deps-audit.yml` | **0** | 全净零告警 |
| 既有 workflow 基线（防归罪对照） | 同上 | 全部 7 个 | `actionlint .github/workflows/*.yml` | 1 | 既有 shellcheck warning 仅 ci.yml(SC1083×2/SC2034)/deploy.yml(SC1083×2)/nightly.yml(SC2034)——**未触文件既有红·零恶化；新文件零贡献** |
| renovate.json 语法 | node JSON.parse | renovate.json | `node -e "JSON.parse(...)"` | **0** | JSON_PARSE_OK |
| renovate.json schema | ajv-cli 5.0.0 + 官方 renovate-schema.json（draft-07·快照存本目录） | renovate.json | `npx ajv-cli@5.0.0 validate --spec=draft7 -s renovate-schema.json --strict=false -d renovate.json` | **0** | `renovate.json valid`（`--strict=false` 为 schema 自带 `x-renovate-version` 自定义关键字所需·非配置问题；日志存 ajv-validate.log） |

**限制如实登记**：GitHub Actions runner 侧真实触发行为不可本地验证（本地无 runner）；actionlint 已覆盖 workflow 语法/表达式/action pin 语义层。renovate.json 为 schema-valid 静态校验，Renovate App 实际首跑行为（catalog 解析·分组 PR 形状）留 app 侧首周期观察——非本刀可证面。

## 5. Renovate（二选一裁定落实 · rev2 席2：Renovate 优先于 Dependabot）

**取舍理由（入档）**：Dependabot 不解析 pnpm 双层 catalog；本仓根 `catalog` + 命名 `catalogs.langchain` 承重——亲验 **8 个 workspace package.json 共 33 处 `catalog:` 引用**（apps/web 3·apps/api 3·apps/worker 8·packages/contracts 3·ai-runtime 3·db 5·ai-graphs 4·domain 2·qdrant-store 2）。Renovate ≥39 对 pnpm catalog（默认+命名）原生解析、零额外配置。→ `renovate.json`。

**最小配置面**（逐键）：
- `extends: ["config:recommended"]`（含 dependencyDashboard·npm/pnpm manager 默认启用=**catalog 支持即为原生**）
- `timezone: Asia/Shanghai` + `schedule: ["after 1am and before 5am on monday"]` —— **周频**窗口
- `prHourlyLimit: 4` + `prConcurrentLimit: 10` —— **限流**
- `packageRules[0]`：`groupName: "package.json deps (weekly)"` + `matchManagers: [npm]` —— **分组**单一周更 PR（advisory 面渐进收；「Ban 顺带升级」纪律由 review 面维持，自动化不放大面）
- **不启用** `lockFileMaintenance`（默认关）——Ban 全量升级纪律不因自动化放水。

## 6. 席1 处方记账（④ · 已登记 REQUEST rev3 节 · 执行归后续刀）

1. **nest12 升级落地时摘除根 `package.json` `pnpm.overrides.fastify` 钉子**——@nestjs/platform-fastify@12.1.2 官方配对即 fastify@5.12.5；overrides 在 nest11 线内属定点过渡机制（S1 已声明非通用策略）·摘除动作归 nest12 升级刀。
2. **platform-fastify 闭包残留 fast-uri@3.1.2（7 high + 1 moderate·经 @fastify/ajv-compiler·fast-json-stringify 7 侧已有并行 4.2.1）列 S2/Renovate 首批**——Renovate 首周期优先收口。

## 7. 硬规则 11 对表（NEXT-NODE-BEST-PRACTICES §A/§B/§C）

- 本切片**零产品码/零声明面/零 lockfile 变更**（仅 .github/workflows/deps-audit.yml 新建 + renovate.json 新建 + REQUEST/收据文档）——§A Next.js/§B NestJS 升级条款无涉；CI 门属 §C 流程面，无违例项。

## 8. Pins（十一值 · 照抄 REQUEST §6 · 原值禁改口）

```
haStatus=NOT_HA
releaseEvidence=false
claimProductionHA=false
gR45Closed=true
coveredCount=8
ms3EqualsR4Closed=false
PG-retained（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）
公开 DELETE /privacy/interview-data/:id = 503
PERF/LOAD = local partial
capacityRepresentative=false
canHonestlyFlip=false
```

## 9. Non-claims

- 门绿 ≠ 供应链安全完璧（advisory 库滚动·cron 仅收 critical 挡门面）；Renovate 配置存在 ≠ 已启用（需 Renovate App 接管 repo 后首跑方生效）；门红判据仅 critical——high×18 仍 Non-claim 列；actionlint/schema 校验 ≠ runner/app 侧运行证明（§4 限制）；≠ #106/#107 总表行 CLOSED · 非 nail · alone ≠ dual · PASS ≠ 关行 ≠ HA。

## 10. 状态

**`exec_S2_DONE_awaiting_review`**——S1+S2 收口·S3（#107 解析守卫）未起。零 stop-condition 命中·est live=0。

*EXTREV-0 DEPS-AUDIT · S2 · 2026-10-07 · mw-depsaud-exec2 · base 2acf92c3*
