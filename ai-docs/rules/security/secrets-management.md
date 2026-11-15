---
id: rule_security_secrets_management
name: 密钥治理与泄露 IR
description: 生产规则。密钥只经环境变量注入且不入库不入日志；按层清点消费点与轮换形；隔离 runner 继承白名单、测试夹具 env 派生、沙箱哑凭据、CI 扫描与日志脱敏全部 fail-closed；泄露按 IR 四步处置。
type: rule
scope: shared
level: must
status: active
owner: security
version: 1
tags:
  - p0
  - secrets
  - redaction
  - rotation
related:
  - ../../rules/global/ai-generated-review.md
  - ../backend/rls-isolation.md
  - ../ai/voice-capability-boundary.md
  - ../../delivery/production-backlog.md
---

# 密钥治理与泄露 IR

## 0. 硬规则（P0）

- 密钥**只经环境变量注入**。`.env` / `.env.*` 永不入库（`.gitignore:10-12`，白名单仅 `*.env.example`）；源码、示例、测试**不写可用凭据字面量**（Mimosa secret-gate + `scripts/check-staged-secrets.mjs` + CI `gitleaks` 三层拦）。
- 密钥**不进日志/事件/prompt/checkpoint**。文件名、DSN、token 不落结构化日志（消费面各处「URL 含凭据不落日志」注记为既有惯例）；进程失败输出经 `scripts/bounded-command.mjs` `redactFailureText` 统一脱敏。
- 任何「本地绿」都不构成密钥治理完成的证据；泄露处置见 §5 IR。

## 1. 密钥清单与消费点（单源=代码，此处只指路不复制值）

| 层 | 密钥 | 消费点 | 轮换形 |
|---|---|---|---|
| api | `AUTH_SECRET`（T1 必需） | `env-schema.ts`（缺失拒绝启动）；签发/验签 `auth-session.ts` + `principal.guard.ts:66` 候选钥序 | 双钥窗：`AUTH_SECRET_PREVIOUS`（逗号分隔旧钥）逐钥验签，轮换即改即生效 |
| db | `RESUME_ENC_KEY` / `RESUME_HASH_SECRET`（dev 缺省仅本地） | `packages/db/src/resume/resume.ts:13-28` `requireSecret` + `keyForVersion` | 版本化：blob 行存 `key_version`，历史版本走 `RESUME_ENC_KEY_V{n}`；轮换=新写入用当前钥、旧 blob 按列取钥 |
| db | 数据库口令 | `DATABASE_URL` 或 PG 五件套（`env-schema` T1）；HA 沙箱按角色最小权 login（runtime/qbank-control/rag-control 各自独立 login） | 独立 login=按角色轮换互不牵连 |
| worker/ai-runtime | `MODEL_API_KEY` / `MODEL_BACKUP_API_KEY` / `DASHSCOPE_VISION_API_KEY`（T3 可选·缺省 fail-closed `*_not_configured`） | `model-client` / `dashscope-native-config` | 备用端点独立键（#255 接线）——主备轮换互不锁死 |
| scripts/e2e | 隔离 runner 继承白名单 | `scripts/isolated-inherited-env.mjs`：fail-closed 精确名单；**非 live 目标不继承任何供应商键**，live 目标（e2e:prove / e2e:ui / performance:e2e）显式检查后仅放行 `MODEL_API_KEY` | 名单即策略：加键须改本文件并过 `isolated-env-policy:prove` |
| e2e 夹具 | 一律 env 派生 | `MEETWISE_TEST_FIXTURE_1` 形（`authz34-chunked-cap.proof.ts:44` 注）；夹具假凭据（如 `pg-client-double-release.proof.ts` 的假 DSN）为扫描器已知 advisory，非真实凭据 | — |
| HA 沙箱 | 全哑凭据 | `ha-sandbox.mjs` `PW` 对象 join 拼装形 + `MODEL_ENDPOINT_PROFILE=sandbox-invalid`（host=dashscope.invalid）+ dummy key + 授权门 | tmpfs 即灭；down 后不复存在 |

## 2. 注入面纪律

1. **生产 compose**：`MODEL_API_KEY` 为明文注入（env-schema T3 注记为已知设计·非本文件豁免）——生产部署时优先 secret-manager 挂载而非 compose 明文；落地形态归 B-DEPLOY。
2. **CI**：`secrets-scan` job 跑 gitleaks；`verify` 不携带任何供应商键（轻量 CI 纪律·t1660u）。
3. **本地**：`.env` 不入库；`.env.bak*` 这类历史拷贝不入库且不入扫描豁免。
4. **日志/收据**：`bounded-command.mjs` 对失败输出先经 `DEFAULT_REDACTION_RULES` + `knownSecretForms`（多形精确替换 `[REDACTED]`）+ `registerFailureRedactionSecrets(values)`（运行期登记一次性 token，如隔离 target token）。

## 3. 已登记缺口（诚实边界·不为「文档已写」洗白）

- **A-29（L3-gates 范围）**：`redactFailureText` 尚有 7 类可漏（JSON 数组值/转义引号/Unicode 转义键/键内侧空格/分段 base64/双重 URL 编码/无键名裸密钥），且病理输入上正则呈二次方耗时。
- **C-SEC**：Langfuse key 轮换=用户侧操作（`production-backlog` P1 红），本轮不代轮换。
- 隔离 runner 的 `PGPASSWORD=meetwise_dev_password` 为一次性容器 dev 夹具（非生产凭据），面内如实注。

## 4. 证据命令（CI / 本地均可复跑）

| 门 | 命令 | 断言 |
|---|---|---|
| 入库扫描 | CI `secrets-scan` job / `gitleaks detect` | EXIT=0 |
| 暂存扫描 | `node scripts/check-staged-secrets.mjs` | EXIT=0 |
| 隔离继承策略 | `pnpm isolated-env-policy:prove` | EXIT=0（白名单/前缀洞两向反证） |
| 失败脱敏 | `node scripts/bounded-command.proof.mjs` | EXIT=0 |

## 5. 泄露 IR（四步）

1. **发现登记**：任何疑似泄露先记 issue（不贴值），标注发现面（日志/仓库/外部）。
2. **遏制=轮换**：按 §1 表轮换对应键——`AUTH_SECRET` 走双钥窗（旧值即刻移出 `AUTH_SECRET`，进 `AUTH_SECRET_PREVIOUS` 过渡窗）；`RESUME_ENC_KEY` 轮换必须新增 `RESUME_ENC_KEY_V{n+1}` 并升 `RESUME_KEY_VERSION`（旧 blob 按列取钥，禁原地重加密全表）；供应商键在供应商控制台先吊销后补录。
3. **日志清理**：对已落日志/收据的明文，用 `registerFailureRedactionSecrets` 同形精确替换收口；无法定位面=按泄露范围全量重登。
4. **复盘登记**：五份进度文档跟进段登记「发现面/根因/轮换完成/残余」。当前在案：Langfuse key 轮换待用户侧执行（C-SEC）。

## 6. 验收对照（production-backlog P1「密钥治理+泄露 IR」行）

本文件落库=该行 ❌→🟡（策略成文）；行翻 ✅ 仍需 C-SEC 轮换实际完成 + A-29 收口——两者都是可本地验证项，不在本文件内虚标完成。

Pins：NOT_HA · releaseEvidence=false · ≠ 生产部署完成 · Ban 把本文件当轮换已完成的证据。
