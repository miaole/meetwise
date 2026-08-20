---
id: delivery_ecs_full_stack_cd_implementation_plan
name: ECS 全栈 GitHub CD 实施计划
description: 冻结 Meetwise 从同 SHA CI 到 ACR、ECS、外部验证与 Pages 的发布事务、恢复矩阵和真实 E2E 证据。
type: delivery
scope: shared
level: plan
status: active
owner: platform
version: 1
related:
  - ../requirements/use-cases/ecs-full-stack-preview-runtime.md
  - ../architecture/adr/0021-ecs-full-stack-preview-runtime.md
  - ../architecture/current-runtime-truth.md
  - ./cloud-resource-inventory.md
tags:
  - github-actions
  - ecs
  - acr
  - rollback
  - e2e
---

# ECS 全栈 GitHub CD 实施计划

## 1. 当前结论

2026-08-20：**implementation blocked，releaseEvidence=false**。远程 `main` 尚无完整 CD workflow，ECS
仍是 legacy systemd，Docker/controller/ACR pull 未 provision，Pages 与 runtime/DB 身份漂移。本文是实现合同，
不是已部署声明。

## 2. 冻结发布身份

每次发布必须绑定以下不可变身份，缺一项即在撤权前失败：

- GitHub repository、受保护 `main`、CI workflow file/id、successful run id、`head_sha`、Git tree；
- backend/Web OCI digest、base image digest、Web runtime digest；
- ECS controller live bundle digest 与 Compose spec digest；
- RDS instance/endpoint/database/current role、连续 migration ledger digest/head；
- synthetic capacity receipt、deep-usage receipt、内部 runtime/RLS receipt；
- publication generation、probe nonce/deadline、final manifest fingerprint、Pages exact receipt；
- predecessor transaction、current symlink、Compose images/spec、legacy owner 状态。

远程 `main` 在撤权前和 final commit 前都要重查；旧 SHA 只能撤销自己的 probe，不得确认公开。

## 3. `FullStackReleaseLedger`

ledger 位于 root-owned `0700` controller state，单文件 `0600`、temp+fsync+rename+dir fsync；所有 mutation
持同一 kernel flock，并校验 `transactionId + release + generation + expectedPhase`。

必需字段：

- `schemaVersion`、`transactionId`、`release`、`commit`、`tree`、`generation`、`phase`、`updatedAt`；
- `controllerDigest`、`composeSpecDigest`、`backendImageDigest`、`webImageDigest`、`schemaBefore/After`；
- `predecessor`：publication/state/manifest/approval/target 摘要，current target，Compose env/spec/image，
  legacy units 的 load/active/enabled/masked，Pages fingerprint；
- `candidate`：approval/target/receipts/fingerprint；
- `recoveryPolicy`：`rollback_pre_migration | rollback_compatible | forward_only_maintenance`；
- `lastErrorCode`、`recoveryAttempts`、`committedAt`。

## 4. Phase 与唯一恢复动作

| Phase | 可见性/写者 | 成功后下一步 | crash/reboot 唯一动作 |
| --- | --- | --- | --- |
| `preflighted` | predecessor 不变 | snapshot | 删除未 mutation 的 transaction。 |
| `snapshotted` | predecessor 不变 | close edge | 恢复快照校验后可重放 close。 |
| `edge_closed` | Pages disabled/Funnel off | quiesce | 继续停写者；不得开新服务。 |
| `quiesced` | legacy/Compose API/Worker/Web 全 inactive | migrate | pre-migration 可精确恢复 predecessor。 |
| `migrated` | 无常驻写者 | start candidate | 只在兼容 gate 通过时回旧；否则 forward-only maintenance。 |
| `backend_ready` | API/Worker 内网 | start Web | 失败停候选并按 policy 恢复。 |
| `web_internal_ready` | 三服务内网、Funnel off | synthetic/E2E | 失败同上；publish 前必须达到此 phase。 |
| `receipts_ready` | 三服务内网 | publish probe | receipt 与 release/schema 精确绑定。 |
| `probe_published` | Pages disabled | activate | 过期/失败关闭 Funnel，保持可重试。 |
| `edge_probing` | 临时公网 | external verify | timeout 物理先关边；不可提交。 |
| `confirmed_pending_pages` | final manifest 已签，快照仍保留 | Pages exact receipt | wrong/stale fingerprint 继续 fail-closed。 |
| `pages_enabled` | final fingerprint enabled | commit | 再次核对 main/current/images/schema。 |
| `committed` | 单一新 owner | GC | 只有此处允许删除 rollback bundle。 |
| `rollback_pending` | edge closed | recovery service | 恢复 predecessor 或 forward-only maintenance。 |

旧 runtime 在新 migration ledger 上能否启动必须由明确兼容 probe 证明；不得让旧镜像隐式再次执行 migrate。

## 5. 命令合同

ECS forced-command 只暴露 token-bound 命令：

`preflight → begin → close-edge → quiesce → migrate → start-backend → start-web-internal → verify-data → publish-probe → activate → confirm → wait-pages → commit`。

另有只读 `status/controller-version` 与受监管 `recover/abort`。所有命令必须幂等、校验 phase，错误顺序、旧 token、
其他 release 或 mixed files 均拒绝。GitHub workflow failure handler 只能请求 `recover`，不能自行拼 shell 回滚。

## 6. 供应链和凭据

- ACR push 与 ECS pull 两个身份；ECS pull 为 root-only `0600`，候选容器不读取。
- controller 独立带外安装，manifest 覆盖 receiver/root dispatch/Compose/units/helpers 的 source、destination、mode、hash；
  `controller-version` 每次实时 lstat/owner/mode/hash。
- 初次 clean-host bootstrap 仍是带外 provision：必须先安装白名单 controller bundle、root-owned rollout state、
  `meetwise-cd-controller-rollout-recovery.service`，执行 `systemctl daemon-reload` 并确认该 recovery unit 已 enable；
  这一步不是 GitHub workflow 提供的零信任起步，也不能用后续 rollout 证据替代。
- bootstrap 之后，`rollout-cd-controller.yml` 仅接受 workflow_dispatch 的 exact protected `main` SHA，先通过 GitHub API
  重验唯一 `.github/workflows/ci.yml` 的同 SHA successful run 与 `preview-cd` environment，再生成
  `source|destination|mode|sha256` canonical manifest。receiver 的 `receive-controller <bundleDigest> <archiveDigest>`
  只做限大小、O_EXCL、fsync 的归档接收；单独的 `install-controller` 才会由 root 做清单闭包、哈希/模式/regular
  no-symlink 检查、快照、原子安装、nginx/systemd gate、live O_NOFOLLOW readback 与失败恢复。
- rollout 在 apply 前持久化 root-only `installing` intent；进程中断后，下一次 root dispatch 或 recovery unit 必须在同一
  controller lock 下恢复完整 predecessor snapshot，并以 `recovered` terminal state 结束；只有新 bundle 的 live readback、
  version、receipt 与新进程 self-test 完成后才写 `complete`。旧 snapshot/receipt 不覆盖。controller rollout 与全栈发布
  共用 `full-stack-deploy` concurrency，应用 transaction active phase 时拒绝 controller install。
- 候选 loader/verifier 不获得 migration URL、controller key 或外部 probe signing key。DB snapshot/RLS verifier 使用
  controller-owned 固定工具和专用 read-only 审计身份；合成 runner 只持固定 API 账号能力。
- `preview-cd` secrets 只在受保护环境使用；workflow/Docker/controller 路径需要 CODEOWNERS 与非作者审批。
- 外部 probe signer 在独立受保护 workflow/KMS 中；候选只接收签名 receipt。
- 最终形态由独立、固定 commit 的 deploy-control reusable workflow 持有 ACR push、Tailscale 与 ECS SSH 能力；
  应用仓库 workflow 只传递 `repository + exact CI workflow id/run id + commit/tree`。control workflow 必须通过 GitHub API
  重验唯一 CI file/id 和三项 required check，拒绝同名 `ci` workflow。完成迁移前，`preview-cd` 必须至少有
  CODEOWNERS、1 个非作者审批与 environment reviewer，且不得把“临时降级形态”标为完成。

## 7. 数据与展示账号 successor

- 已在线 migration `0121_resume_pgcrypto_runtime_acl` 的精确字节/checksum 必须先进入仓库；`0122` 只补齐其三参数 pgcrypto ACL，中文上下文迁移改为 `0123`。
- `large-v1` 历史 receipt 保持只读，不能混入深度使用副作用；新增 successor dataset 把容量基线和 deep usage 分层。
- 固定展示主体为 `previewc@meetwise.com` 与 `previewb@meetwise.com`；密码不写仓库/文档/artifact，由 root-only
  credential descriptor 注入。全站共享鉴权合同要求密码为 8–128 字符，因此 6 位 `123456` 明确不可用且不得为
  预览账号弱化；首次外部配置时必须由操作者提供至少 8 位的替代密码。catalog、DB verifier 与 cleanup manifest
  必须显式接受这两个确定主体。
- C 端覆盖中文简历、中文岗位、多轮面试、报告/不可用终态；B 端覆盖中文岗位、申请/邀请/重试与
  `assessment_unavailable + score NULL`。不得伪造 B 端数值评分、支付、删除完成或模型成功。
- 每次 successor 验证分别产出 capacity receipt、deep-usage receipt 与 combined publication receipt；下次发布
  不得用 `large-v1` 的“model/consumption/answer=0”否定已授权的 deep usage。

## 8. 外部 E2E 与成功定义

短 probe（10 分钟）只验证公开表面、版本、受保护跳转、nonce 与内部组合回执摘要；耗时的 B/C 写入闭环必须在
`web_internal_ready` 且 Funnel 关闭时预先完成。final receipt 组合：

- root/login/manifest 200，dashboard 未登录跳公开域且无 localhost；
- API/Web/Worker runtime identity、schema/current_user/Tair readiness；
- C/B 固定账号登录、中文业务名称、幂等写入、Worker 终态与 UI/API/DB 三方一致；
- B↔C、第三主体、无 principal 的 RLS 拒绝；API/metrics/DB/Tair 无公网 listener；
- commit/tree/images/controller/schema/receipts/final Pages fingerprint 全相等。

GitHub job 只有在 Pages workflow 成功且公开 `preview-link-state.json` 为同 generation/final fingerprint `enabled`
后才成功。仅 dispatch Pages、仅 HTTP 200、仅静态 regex 均不得标绿。

## 9. 七类执行矩阵

| 类别 | 必须执行 |
| --- | --- |
| 正常 | clean-host 首发、legacy 首发、第二次升级、B/C 内网深 E2E、final Pages。 |
| 异常 | ACR、migration、readiness、synthetic、probe、confirm、Pages 每点故障。 |
| 特殊 | 无 predecessor、旧 schema兼容/不兼容、原本 inactive legacy、receipt 已存在重放。 |
| 逃逸 | 同名假 CI、stale main、错 digest/controller/host key/DB、候选自签、迁移凭据读取。 |
| 高并发 | 两个 release、重复 forced command、confirm/timeout/revoke、20 路业务幂等。 |
| 复杂 | 每 phase 写前/写后 SIGKILL、ECS reboot、GitHub runner 中断、Worker takeover/SSE重连。 |
| 刁钻 | Pages 首次旧 fingerprint、队列超 lease、旧镜像遇新 ledger、磁盘/GC、混合 controller 文件。 |

## 10. 完成门

1. 本地状态机行为 proof 使用临时文件/假 systemd/Compose/HTTP 执行真实 phase，不再只匹配源码字符串；
2. GitHub PR 构建两个镜像但不 push，required checks 唯一且同 SHA；
3. ECS fresh/upgrade/rollback 故障注入全绿并有 root-only receipt；
4. 真实 GitHub CD run、ECS ledger、OCI digest、DB ledger、Pages state、公网 E2E 六方一致；
5. 第二次 expert-audit 无 P0/P1 后，才可把 `implementation_blocked` 改为 `released`。
