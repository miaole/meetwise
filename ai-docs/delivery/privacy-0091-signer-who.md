---
id: delivery_privacy_0091_signer_who
name: 0091 授权快照谁来签发
description: PR #257 把投影物理 purge 接进生产 worker 之后，生产路径仍无人签发 0091 快照。本文只出方案，不写实现。
type: plan
scope: shared
level: guide
status: active
owner: privacy
related:
  - ./production-backlog.md
  - ./production-readiness-remediation-register.md
  - ./gap-bug-backlog.md
  - ../architecture/current-runtime-truth.md
  - ../architecture/ai/privacy-deletion-sink-inventory.md
  - ../requirements/use-cases/checkpoint-privacy-erasure.md
  - ../requirements/use-cases/expert-long-interview-runtime.md
---

# 0091 授权快照：谁来签发

> 日期：2026-11-11（Asia/Shanghai）  
> 基线：`origin/main` `607f709a0`（#247 合入后）。对照 PR [#257](https://github.com/miaole/meetwise/pull/257) head `e4a882d3e`（未合入本文基线）。  
> 范围：只出方案文档，不写实现代码，不改迁移字节，不买云，不合入。  
> Pins 不动：`NOT_HA` · `releaseEvidence=false` · 公开 `DELETE /privacy/interview-data/:id` 仍返回 **503** · `INT-P0-ERASURE-ISSUER` 仍 open。本地绿 ≠ 生产 HA。

## 0. 一页结论

PR #257 把 `interview_projection_list_claimable_targets` → claim → `privacy_purge_interview_projection_target` 接进了生产 privacy worker。这条循环要先解析到一张**已消费**的 0091 快照 `jti`，没有就计 `skippedUnauthorized`、不删。账户注销（`POST /profile/deactivate`）只对每场面试调用 `beginInterviewProjectionErasure`，以及记忆面 `memory_begin_account_erasure`，**从不签名、不落账、不消费**。生产进程里也没有人持有隐私签发私钥，也没有 `privacy_issuer` 登录。所以 #257 合入后，投影行在生产上仍然不会被真删。

同一套缺口也作用在 0141 向量面循环上（main 已接线，同样要已消费 `jti`）。

推荐：**先上独立签发器（软件 ECDSA P-256，本地可完整证明），上云后再把同一签发接口接到 KMS，私钥不再离开 KMS。** 不把私钥长期放进 API 进程，更不用数据库内部授权替代签名。签发之前，必须先把 oss/redis/langfuse 挂进同一份请求的目标集；否则本地 purge 一跑完，0096 会把请求结算成 `completed`，外部数据还在。

## 1. 现状

### 1.1 0091 账本：有函数，没有生产签发方

迁移 `0091_privacy_authorization_issuer.sql` 建立了独立删除授权根，用来替换已被 0075/0076 暂停的、可伪造 GUC 公共删除入口：

- 表：`privacy_authorization_snapshot`（`jti` 唯一、`issued`→`consumed` 单向、寿命 ≤ 1 小时）、`privacy_deletion_receipt`。
- 角色：`privacy_issuer`、`privacy_guard_owner` 都是 **NOLOGIN / NOINHERIT / 非超级用户 / 无 BYPASSRLS**，成员封闭。`app_role` 不能成为 issuer 或 worker-executor（0091 末尾与 0096:597 `REVOKE`；`assertPrivacyAuthorizationIssuerIdentity` 在 `principal.ts:995-1065` 做目录契约门）。
- `privacy_issue_authorization_snapshot`：`EXECUTE` 只授 `privacy_issuer`。owner 取自 `app.principal_user`，调用方不能自报。对 `interview_data_erasure` 校验面试归属；0093:841-908 把分支扩到 `account_data_erasure`（subject 必须等于已认证账户）。`resume_data_erasure` 仍 fail-closed。
- **issue 按调用方字段落账，本身不做 JWS 验签，也不把 JWS 存进表。** 表里只有 jti / key_id / actor / owner / interview_id / purpose / epoch / digest / 状态与时间戳。
- consume：`privacy_worker_executor` 对 `jti` 做 issued→consumed 原子 CAS，过期/重放/未知一律拒绝。consume 跨 owner（bearer）；租户绑定推迟到 claim。
- claim（`privacy_authorization_claim_target`）：要求快照已消费且未过期，并重验 owner / scope / subject / epoch / 存储 digest / **活目标集 digest**。目标增删导致 digest 漂移则 42501。父请求必须仍在 `fenced` / `purging` / `pending_external`。
- `assert_privacy_erasure_request_completed_guard`：没有全部 target=`erased`，或仍有 `external_pending` / `failed_cleanup` 收据，就不能把请求写成 `completed`。

0093 之后，账户目的也可以签发，但生产路径同样没人调用。

### 1.2 签名与密钥代码：原语在，接线不在

`packages/domain/src/privacy-authorization.ts` 是纯密码学模块（零 IO、零 SQL）：

- 算法固定 **ECDSA P-256 / ES256**（JWS 紧凑序列化，R||S ieee-p1363），`iss=meetwise-privacy-authz-v1`，`aud=meetwise-deletion-worker`。这与模型网关 `AuthorizationSnapshot` 的 Ed25519（`iss=meetwise-authz-v1` / `aud=meetwise-model-gateway`）刻意分离，禁止密钥复用。
- 模块注释写明：算法选择是因为阿里云 KMS/HSM 原生支持、接入成本最低；私钥只存在于签发器进程，**绝不进 SQL、worker、浏览器或 `AUTH_SECRET`**。
- `signPrivacyAuthorizationSnapshot` / `verifyPrivacyAuthorizationSnapshot` / `PrivacyAuthzKeyRegistry`（kid 轮换：active / retired 窗口内可验 / revoked 立即拒绝）都已实现。最大寿命 `MAX_PRIVACY_AUTHZ_TTL_SEC = 3600`，与 0091 表约束一致。
- kid 注册表持久化、JWKS 对外发布、「只许用 active kid 签发」的强制，源码明确留给「未来 issuer 服务接线」，当前不能宣称两套身份根已在网关侧闭环运行。

数据库封装在 `packages/db/src/privacy/privacy-authorization.ts`：`issueAuthorizationSnapshot`、`consumeAuthorizationSnapshotBound`（验签载荷与账本逐字段绑定）、`claimAuthorizationTarget`、收据写/解析。生产 API / worker **没有**调用 `sign*` / `issue*`。唯一调用方是证明编排：`uc052-internal-erasure.ts`、`uc052-checkpoint-physical.ts`、`unstube-erase.proof.ts`、`privacy-erasure-http.proof.ts`。这些证明自己 `generatePrivacyAuthzKeyPair`，再用测试连接 `SET LOCAL ROLE privacy_issuer`。仓库里没有生产用的 `asPrivacyIssuer`，也没有 `PRIVACY_AUTHZ_PRIVATE_KEY_*` 这类部署环境变量（`PRIVACY_ERASURE_IDEMPOTENCY_HMAC_KEY` 只用于幂等键，不能当签发根；#238 配的是 `PRIVACY_WORKER_*`，给删除执行器，不是签发器）。

### 1.3 账户注销：只 begin，不签发

`apps/api/src/modules/profile/profile.service.ts:179-226` 的 `deactivate`（密码复核后同一事务）：

1. 每份活跃简历 → `beginResumeSoftDelete`（软删围栏）；
2. 每场自有面试 → `beginInterviewProjectionErasure`（0096，每场恰好 4 个 target：`event` / `ai_graph_run` / `report` + 已是 `erased` 的 `checkpoint_rows` 围栏锚）；
3. 记忆面 → `memory_begin_account_erasure`（0093）；
4. 账户 `disabled` + `deleted_at` + `pwd_epoch+1`，令牌即时失效。

HTTP 返回 202 + `mode:'logical'` + `purgePending:true`，不宣称物理清除已完成。全程没有 `signPrivacyAuthorizationSnapshot`，没有 `issueAuthorizationSnapshot`，没有 consume。公开面试删除入口保持 503；预览 `POST /privacy/erasure-preview` 也不是生产签发。

0096 的 `interview_projection_begin_erasure`（`:323-444`）只建上述 4 个 sink，**不挂** `oss` / `redis` / `langfuse`。checkpoint 旧路径 `privacy_begin_checkpoint_erasure`（0075 已对 `app_role` 撤销）才会为这三项建 `retention_pending`；注销流程不走那条路径。

### 1.4 0141 向量面：同一授权缺口，main 上已经存在

`0141_vector_plane_erasure_receipt_fence.sql` 给 0125 `memory_vector_chunk` 提供 list/consumed-jti feed。生产 `runVectorPlanePrivacyEraser`（`privacy-erasure-worker.ts:58-60`，`main.ts:772`）同样是：没有已消费且 epoch/digest 一致的 0091 `jti` 就跳过，无授权不删。账户注销只 begin 记忆账本，不签发，所以向量行在生产上也不会被这条循环清掉。下文推荐方案对面试投影与账户/向量轨道一并适用。

### 1.5 PR #257 接线后实际会发生什么

#257（head `e4a882d3e`）把生产 `runCheckpointPrivacyEraser` 改成一拍三步：checkpoint 擦除（0077 原语，**不依赖** 0091 快照）+ 投影物理 purge + 已围栏 `interview_job` 残留清除。投影步（`interviewProjectionPrivacyErasureTick`）是：

1. `listClaimableInterviewProjectionTargets`；
2. `resolveInterviewProjectionTargetConsumedJti`（0232，与 0141 同形：找已消费、未过期、owner/epoch/digest 一致的 `jti`）。没有 → `skippedUnauthorized++`，不删；
3. 有 `jti` 才走 0091 冻结 `claimAuthorizationTarget`（十项复核仍是唯一授权裁定者）；
4. `purgeInterviewProjectionTarget`；残留 ≠ 0 则 raise；
5. `privacy_record_deletion_receipt` 落 `local_erased`。

这条循环**不验 JWS**（表里也没有 JWS 可验），默认消费已经在上游做完。证明里的完整顺序是：begin →（可选）挂外部目标 → 签名 → issue → 验签 → `consumeAuthorizationSnapshotBound` → claim → purge。生产缺的是「签名到消费」整段。因此 #257 合入后，生产计数会看到可认领目标和 `skippedUnauthorized`，物理行仍在。这不是 #257 的实现错误，是授权根从未接线。checkpoint 步仍可按 0077 推进；它删不了 0096 投影，也补不上缺失的快照。

另外：claim 也检查 `expires_at`。即使签发后立刻 consume，物理 claim/purge 仍须在 1 小时窗口内完成，否则要重新签发（新 `jti`，digest 仍须等于当时活目标集）。

### 1.6 0096 老问题：外部目标未挂，purge 完成后请求变成 completed

`privacy_purge_interview_projection_target` 末尾（0096:576-583）按 CASE 结算请求状态：还有 pending/leased → `purging`；有 `external_pending` 收据或 `retention_pending` 目标 → `pending_external`；有失败 → `partial_failed`；否则 → **`completed`**。0091 completed guard 只看账本里实际存在的 target/收据，不会凭空要求「应该还有外部目标」。

因此，如果某次请求只含 0096 begin 的 4 个本地目标（其中 `checkpoint_rows` 一开始就是 `erased`），一旦 event / ai_graph_run / report 都 purge 成功且没有外部收据，请求就会被写成 `completed`。OSS、Redis/Tair、Langfuse 上的访谈痕迹并不在这份账本里，也不会把状态拦住。这与 sink 清单和 UC-052 的诚实终态（本地清完后应保持 `pending_external`，见 `attachExternalRetentionPendingTargets` 与 `GAP-PRIV-EXTERNAL-SINK-RETENTION`）相反。

当前生产还没人签发，purge 跑不到结算，这个假 completed **是潜伏的**。一旦补上签发器，若不先挂外部目标，第一次真正的本地 purge 就会把请求标成已完成。digest 在签发时钉死，事后再补 oss/redis/langfuse 会导致活 digest 漂移、claim 全拒，所以外部目标必须**出现在签名之前**的目标集里。

外部确认本身仍是未关闭项：0140 / AR 刀只证明了本地 stub 路径，`external_confirmed` ≠ 云厂商已删；真实厂商回执标为「上云后」。本方案要求的是：在那之前，请求不得提前 `completed`。

## 2. 方案比较

比较维度：安全边界、私钥位置、上云前能否在本地完整验证、要不要买云资源、改动量、对现有 prove 的影响。四个选项都**不**重开公开 DELETE，也**不**把 `AUTH_SECRET` 扩成删除能力。

### 选项 A. API 进程持私钥

注销/begin 成功后，API 在本进程用软件 ECDSA 签名，经新的 issuer 数据库登录 `SET ROLE privacy_issuer` 落账，并在同一编排里验签、consume，再交给现有 worker 去 claim/purge。

| 维度 | 评估 |
|---|---|
| 安全边界 | 弱于独立签发器。API 已被攻破时，攻击者同时握有会话根（`AUTH_SECRET`）和删除签发根（即便环境变量不同、同进程可读）。这正是 0091 要把私钥排除出「API runtime」的原因。 |
| 私钥放在哪 | 部署在 API 主机/容器的专用环境变量或文件（例如 `PRIVACY_AUTHZ_PRIVATE_KEY_PEM` + `kid`），内存中只给签发模块。不进 SQL、不进 worker、不进浏览器、不等于 `AUTH_SECRET`。 |
| 本地能否完整验证 | 能。Compose 注入一次性 PEM；已有 domain/uc052 证明可复用；再补「注销 → 签发消费 → worker 一拍真删、无密钥则 fail-closed」即可。 |
| 要不要买云 | 本阶段不需要。 |
| 改动量 | 中等：`asPrivacyIssuer`、API 接线、issuer 登录供给、注销后签发/消费、外部目标先挂、窗口内重签。无强制新迁移（除非把挂载写进 0096 的后续迁移）。 |
| 对 prove 的影响 | 现有 uc052 / unstube / sinks 证明应保持绿（它们自备密钥）。需新增或扩展生产路径证明；缺密钥时注销仍应 202 围栏成功还是整体失败，要在实现前钉死（建议：围栏成功、签发失败可重试，不得把请求标 completed）。 |

可作为最短接线，不适合作为目标态。

### 选项 B. 独立控制面或签发服务

单独的签发器进程（或本地 sidecar）：只负责签名、落 0091 账本、验签后 consume。API 在用户已认证且 begin（含外部目标）成功后，经回环/内部 mTLS（或本机 Unix 套接字）提交「owner + subject + purpose + epoch + 目标集」。Worker 仍然不持有私钥，只按已消费 `jti` claim/purge。上云后签发后端可换成选项 C，对外接口不变。

| 维度 | 评估 |
|---|---|
| 安全边界 | 与 0091 设计一致：删除签发根与 API 会话根、worker 执行根分离。compromised worker 不能签发；compromised API 若拿不到签发器凭证，也不能伪造快照。`privacy_issuer` 只授给签发器使用的数据库登录。 |
| 私钥放在哪 | 只在签发器进程内存。本地/预发用 PEM；生产目标态见选项 C。JWKS 只发布公钥。 |
| 本地能否完整验证 | 能。Compose 增加一个签发器容器，注入一次性密钥。证明走真 HTTP 注销 + 真签发器 + 真 worker 循环，不断言云厂商已删。 |
| 要不要买云 | 软件签发阶段不需要。把私钥迁入 KMS、发布对外 JWKS、要真实组合根回执，标「上云后」。 |
| 改动量 | 高于 A：多一个进程、内部签发 API、供给与轮换、失败重试。密码学与 0091 函数复用，不重写。 |
| 对 prove 的影响 | 同上，另加「签发器不可达 / 错误 audience / 过期 kid」负例。uc052 内部编排可以继续直接调 domain 原语，不必强迫每条旧证明都走网络签发器；新增的生产路径证明必须走真实签发器边界。 |

### 选项 C. KMS 托管签名

签发器不加载 PEM，只调用云 KMS 的非对称 Sign（P-256/ES256）。私钥不出 KMS。这是 `privacy-authorization.ts` 头注里已经预留的算法选型理由。

| 维度 | 评估 |
|---|---|
| 安全边界 | 托管最强：进程只持有调用 KMS 的角色凭证，没有长期私钥文件。轮换与吊销走 KMS/JWKS。 |
| 私钥放在哪 | 云 KMS/HSM（目标为阿里云，与现有算法选择一致）。本地没有这份私钥。 |
| 本地能否完整验证 | **不能只用真 KMS 做完。** 上云前应验证「同一签发接口可切换后端」：本地继续用软件签名器（选项 B），用伪造/失败的 KMS 适配器证明 fail-closed。真 KMS 签发与组合根滥用回执标「上云后」。 |
| 要不要买云 | 要（KMS 密钥与调用权限）。当前口径是不买云，故不能作为上云前的唯一方案。 |
| 改动量 | 在 B 的接口上增加 KMS 后端与 JWKS 同步，签发协议不必重做。 |
| 对 prove 的影响 | 软件路径 prove 保持。增加适配器契约证明（算法/kid/失败码）。真 KMS prove 上云后才有，不得把本地软件绿写成 `releaseEvidence=true`。 |

### 选项 D. 用数据库内部授权替代签名

取消 JWS。例如在 `begin` 的同一 definer 里直接插入 `privacy_authorization_snapshot`，或另写「已认证 principal 即可授权删除」的 SQL，让 worker 只凭账本行 claim。

| 维度 | 评估 |
|---|---|
| 安全边界 | **回归。** 0075/0076 暂停公共删除，正是因为可写 GUC / runtime SQL 凭据可以伪造主体。issue 今天已经不验 JWS；若再去掉独立签名根，持有 issuer 角色或能调用该 definer 的凭据就可以授权删除。与 `INT-P0-ERASURE-ISSUER` 关闭条件相反。 |
| 私钥放在哪 | 无私钥。授权根退化成 DB 角色与 GUC。 |
| 本地能否完整验证 | 能跑通功能，但证明的是一条已否决的授权模型。 |
| 要不要买云 | 不需要。 |
| 改动量 | 表面小，语义大：要改 0091 之后的授权叙事、claim 前置，并和大量「必须有独立签发器」的文档/证明对账。不建议改已应用的 0091 函数体（校验和冻结）；即使另做迁移，也是授权根降级。 |
| 对 prove 的影响 | uc052 / domain 签验证明会失去对象，或被改成「无签名也可删除」。这是破坏性变化，不推荐。 |

### 对照表

| | A API 持钥 | B 独立签发器（软件） | C KMS | D DB 替代签名 |
|---|---|---|---|---|
| 与 0091 身份根分离 | 弱（同进程） | 强 | 更强（钥不出进程） | 破坏分离 |
| 上云前可本地完整验证 | 是 | 是 | 否（真 KMS）；接口可先用 B 验证 | 功能可测，模型不可接受 |
| 买云 | 否 | 软件阶段否 | 是（上云后） | 否 |
| 建议 | 可作权宜，不作终态 | **上云前采用** | **上云后接在 B 后面** | **不采用** |

## 3. 推荐方案

**上云前落地选项 B，上云后把签发后端换成选项 C。不把选项 A 当目标态，不做选项 D。**

建议的生产顺序（实现阶段，不在本 PR 编码）：

1. **先挂外部目标，再签发。** 在 0096/注销路径上，把 `oss` / `redis` / `langfuse` 写成 `retention_pending`（可复用 uc052 已有 `attachExternalRetentionPendingTargets` 的语义，做成生产函数，而不是证明专用 SQL）。重算并写入 `target_set_digest` 之后才能签名。这样本地三 sink 清完后，0096 CASE 会落到 `pending_external`，而不是 `completed`。不要改已应用的 0096 函数体；用后续迁移或 additive 函数。
2. **签发器进程**持软件 PEM（本地 Compose / 预发）。新增只用于签发的数据库登录，可 `SET ROLE privacy_issuer`，不能兼 worker、不能兼 `app_role`。补 `asPrivacyIssuer` 一类封装。缺密钥、缺登录、JWKS 无法解析一律 fail-closed，不得静默跳过签发却把请求标完成。
3. **编排**：begin（含外部目标）提交 → 签发器按活目标集签名 → issue 落账 → 当场验签 → `consumeAuthorizationSnapshotBound`。这样 #257 / 0141 现有的「已消费 jti feed」不必改裁定语义，worker 仍不持钥、仍不验 JWS（表中无 JWS）。JWS 可以是短暂的，不必先改 0091 表结构来存密文。
4. **1 小时窗口**：保持现有 TTL，不为图省事放宽。未在窗口内 claim/purge 完的本地目标，由签发器按**当前活 digest**重签新 `jti`（目标集若已变，必须先承认漂移，不得拿旧 digest 硬签）。
5. **同一签发器也给账户/记忆/0125 向量轨道签发**（`purpose=account_data_erasure`，0093 已支持 subject=账户），否则 0141 循环会一直 `skippedUnauthorized`。
6. 公开 DELETE 保持 503；注销继续 202 + `purgePending:true`。不得把登录 HMAC 当成删除能力。
7. **上云后**：签发后端改为 KMS 非对称签名；发布 JWKS；用真实组合根做滥用/轮换回执。OSS/Redis/Langfuse 的厂商确认删除仍走既有 `privacy_resolve_deletion_receipt`，在有真实回执前请求保持 `pending_external`。这些步骤全部标「上云后」，不作为买云前关闭 `INT-P0-ERASURE-ISSUER` 或翻转 `releaseEvidence` 的条件。

checkpoint 物理删除仍走 0077，不依赖 0091；注销目前也不发起 0058 那条 checkpoint 删除请求（0096 只放围栏锚）。是否在注销时另开 checkpoint 物理删除请求，属于相邻项，不阻塞本方案，但应在实现签发器时一并登记，避免只清投影、不清 checkpoint 行。

## 4. 对现有 prove 的影响

应保持绿、不必为了本方案改语义的：

- `pnpm` domain / contracts 的 `privacy-authorization` 证明（签验与跨侧常量 pin）；
- `uc052:internal-erasure:prove`（已演示 begin + 挂外部目标 + 签名 + consume + 本地 purge + 诚实 `pending_external`）；
- `uc052:external-sink-retention:prove` / `uc052:external-sink-async-purge:prove`（外部 sink 诚实性；stub ≠ 云删）；
- `unstube-erase:prove`、`int-transcript-remaining-sinks:prove`、`privacy-erasure:prove`、`privacy-erasure:http:prove`。

实现阶段需要新增（本 PR 不做）：

- 生产路径：注销（或等价 begin）→ 真实签发器 → 已消费快照存在 → worker 一拍 `erased>0` 且 `skippedUnauthorized=0`（针对已签发目标）；
- 负例：无密钥 / 签发器不可达 / 错误 iss 或 aud / 目标集在签名后被改动 → 不删、不 completed；
- 0096 回归：挂了外部目标后，本地 purge 结束请求为 `pending_external`；故意不挂时证明会 completed（作为反证，生产路径禁止这种 begin）；
- 窗口过期后重签才能继续 claim；
- 变异：去掉签发步骤，#257 循环只能计 `skippedUnauthorized`。

这些新证明在本地隔离 PG + Compose 签发器上就能跑完，不需要买云，也不得因此把 `releaseEvidence` 置真。

## 5. 需要用户拍板的点

1. **是否采纳「B 为上云前方案、C 为上云后后端」？** 若坚持 A（API 持钥）以减少一个进程，需要明确接受会话根与删除根同主机/同进程的风险，并且仍须先挂外部目标、仍须独立 issuer 数据库登录。D 不建议。
2. **TTL 保持 1 小时并做重签，还是用新迁移放宽寿命？** 推荐保持 1 小时，避免单次授权窗口被拉长。
3. **签发失败时注销 API 的行为：** 建议围栏与 202 仍成功（账户已停用、数据已停止处理），签发进入可重试队列，响应继续 `purgePending:true`，绝不改口成已完成。若要求「没有快照就不让注销成功」，会改变现有 202 合同，需要另定。
4. **签发器形态：** 独立 sidecar（更贴近 0091）还是 API 机器上的独立进程/独立用户。不推荐把私钥读进 API 业务进程。

公开 DELETE=503、不买云、本刀不写实现，不在拍板范围内。

## 6. 明确不做（本刀与后续实现的共同边界）

- 不实现、不合并本方案中的代码。
- 不修改已应用迁移 0091 / 0096 / 0141 的 SQL 字节。
- 不重开公开删除，不把 503 改成 202/completed。
- 不把 stub 或本地 purge 说成云端彻底删除，不翻转 `releaseEvidence`，不宣称 HA。
- 不把 `AUTH_SECRET`、worker 凭据或可写 GUC 扩展为删除签发能力。
