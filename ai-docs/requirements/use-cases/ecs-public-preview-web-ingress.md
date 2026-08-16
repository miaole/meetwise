---
id: UC-ecs-public-preview-web-ingress-01
name: ECS 只读预览 Web 入口
status: planned
owner: platform
---

# UC-ecs-public-preview-web-ingress-01 · ECS 只读预览 Web 入口

## 目标与范围

在完整应用数据面尚未获准启用前，公开预览只提供四个无状态 Web 展示页。受信 HTTPS 边缘只转发到 ECS 回环 Nginx；Nginx 同时执行路径与方法 allowlist，并在任何 Next.js 路由、Server Action、API 代理或请求体处理之前拒绝其余请求。Web 进程不持有数据库、缓存、对象存储、模型、支付或迁移凭据；API 与 Worker 不在该工作包启动。

- 角色：公开访客、ECS 发布执行者、GitHub Pages 目录。
- 前置：已构建、冻结且带摘要的 Web release；Web 仅监听 `127.0.0.1:3000`；Nginx 仅监听 `127.0.0.1:8080`；受信 HTTPS 边缘只指向该回环 Nginx。
- 触发：访客通过已验证的 HTTPS 预览 URL 请求 Web 页面。
- 明确不做：不开放登录、注册、简历、回答、语音、订单、支付、删除、API 直连、Worker、迁移或远程数据服务。

## 契约与状态

| 项 | 契约 |
| --- | --- |
| 发布对象 | `PreviewWebRelease` 绑定 GitHub Actions 已证明的 Web archive、commit/tree、Web 构建摘要、静态资源摘要、精确 HTTPS origin、候选/回环/边缘健康与方法门回执、访问模式、签发/到期时间、撤销状态和独立签名；不含数据库 URL、令牌、用户数据或运行凭据。 |
| 网络 | 受信 HTTPS 边缘 → `127.0.0.1:8080` Nginx → `127.0.0.1:3000` Next Web。API、Worker、metrics 与数据库没有公网监听。Nginx 只代理 `/`、`/features`、`/faq`、`/legal` 与必需 `/_next/static/` 资源；`/api/*`、登录、业务页面和未知路径固定拒绝。 |
| 方法门 | 只有精确 `GET`、`HEAD`、`OPTIONS` 可继续；其他所有方法在 Nginx 返回 JSON `503 public_preview_read_only`，不转发给 Web。`OPTIONS` 只在允许路径返回无状态预检响应。代理清除 Cookie、Authorization 和访客转发身份头。 |
| 控制面 | prepare/deploy/finalize、Nginx/unit 模板、Funnel 解析器和签名器只从 root-owned 固定控制面目录运行。首次安装由非 root 操作员先验证 GitHub Actions 对 controller archive 的构件证明，再从已验证 archive 取出与其字节一致的 installer；禁止对工作树、候选 release 或未验签路径执行 `sudo`。installer 将输入一次性复制到 root-owned `0600` staging 文件后才重新验签、解析 archive 元数据和解压。每个入口重验自己的真实路径、逐文件 owner、mode 与摘要。候选 release 仅作为非特权 Web 产物与数据被读取，不能提供 root 可执行脚本或签名器模块。 |
| archive 边界 | controller 与 Web archive 只允许常规文件、目录，以及解析后仍位于 archive root 内的相对软链接；拒绝绝对/空/`.`/`..` 路径、重复成员、硬链接、root 外软链接、设备、FIFO、PAX 扩展、超限大小与 root 外成员。验签、列目录、解压和摘要全部针对同一个 root-owned staging archive。相同 release digest 的重放还必须具有相同 archive SHA-256。 |
| 进程 | `meetwise` 非登录用户运行 Web；候选也必须先运行在等价或更严的 transient systemd cgroup，`KillMode=control-group` 停止后才可能激活。两个进程均不授予额外 capability，不读取私钥或服务密钥，仅读取已冻结 release 并限制出站到 loopback；失败只重启 Web，不自动迁移或启动 API/Worker。 |
| Pages | Pages 仍是静态目录。只有签名有效且未过期、`PreviewWebRelease=verified`、HTTPS、构建摘要、边缘/健康/方法门回执进入受控目录清单时，才渲染主项目链接。签名记录只经固定静态 `/preview-release-manifest.json` 暴露；Pages 每小时独立拉取、验签和探测 origin，过期、撤销或健康失败时生成并发布禁用目录与 `preview-link-state.json` 回执。切换已启用 release 前，控制面先签发撤链记录并等到该回执确认禁用。 |

`PreviewWebRelease` 状态为 `idle / failed / revoked → staged → active_unpublished → verified → revoked / failed`。单一 root-owned `flock` 覆盖撤链、构件验签、候选、激活、Funnel、预签名黑盒验证和签名；黑盒 receipt 成功且签名前后都重验相同活动 release 后，才允许原子写入公开 signed manifest 并进入 `verified`。候选 release 必须先以独立回环端口证明其 release marker、构建摘要和允许页面，且 systemd 确认整个候选 cgroup 已退出后才可能激活。同一 release digest 重放仅接受完全相同 archive；任何签名、HTTPS、精确 origin、边缘/内部健康、构建摘要、路径或方法门失配均进入 `failed`，恢复前一 release，Pages 链接保持禁用。撤链回执使用签名 manifest 的 canonical JSON SHA-256，避免格式化差异。

## 主流程

1. GitHub Actions 在受保护 `main` 构建 Web archive 与 controller archive，并分别签发构件证明；ECS 只接受验证签发 workflow、仓库和 archive 摘要均一致的 Web archive。
2. root-owned 控制面先把 archive 固定到 `0600` staging 文件，再验证 archive 内的 commit/tree、普通成员边界、冻结 ownership、构建/静态资源摘要、Nginx 配置与 service unit，并以受限 transient systemd 候选端口确认新版本 marker。
3. systemd 以 `meetwise` 用户启动 Web，仅绑定 `127.0.0.1:3000`；切换或健康失败时恢复前一软链、unit 和 service。
4. Nginx 在 `127.0.0.1:8080` 执行路径和方法双 allowlist；允许页面的 `GET`/`HEAD` 才反代到 Web，`OPTIONS` 无状态返回，其他方法和路径固定拒绝。
5. Funnel 从本机 Tailscale status 派生精确 hostname，并在修改前拒绝非预览映射；完整外部 HTTPS、允许路径、拒绝路径、并发写拒绝、未知 Host 和监听边界在预签名黑盒阶段全部通过后，root-owned 签名器才将发布记录写为 `verified`，后续受控 Pages 清单才可启用链接。

## 异常流与七类测试

| 类别 | TC | 断言与机制 |
| --- | --- | --- |
| 正常 | `TC-ecs-public-preview-web-ingress-01-main` | 允许页面的 `GET`/`HEAD` 到达 Web；release marker、digest、回环健康、精确 HTTPS 地址和签名记录一致。机制：不可变 release 目录与签名健康回执。 |
| 异常 | `TC-ecs-public-preview-web-ingress-01-E1` | 构建产物、archive 成员、候选 marker/cgroup 停止、Nginx 校验、切换、外部 HTTPS 或健康任一失败时 service 恢复前一 release，公开 manifest 尚未签发且 Pages 链接保持禁用。机制：失败关闭发布状态机。 |
| 特殊 | `TC-ecs-public-preview-web-ingress-01-E2` | 允许路径的 `OPTIONS` 返回无状态响应；缺失 API/数据库凭据时首页仍可浏览，数据页面、登录和 API 不伪造成功。机制：最小进程边界。 |
| 逃逸通道 | `TC-ecs-public-preview-web-ingress-01-E3` | 携带已有 cookie 的 `/api/*`、RSC、登录和业务路径均不转发；`POST`、`PUT`、`PATCH`、`DELETE`、`TRACE`、`COPY`、自定义方法以及带 cookie、query、body 的变体均为 503 或 404，Next handler/Server Action/API/队列=0。机制：Nginx 路径与方法双 allowlist。 |
| 高并发 | `TC-ecs-public-preview-web-ingress-01-E4` | 20 个并发非安全请求全部 503；无 Web action、API、队列或数据面调用。机制：无状态边缘拒绝。 |
| 复杂 | `TC-ecs-public-preview-web-ingress-01-E5` | Web 重启、候选切换回滚、边缘暂时断开、release 过期或撤销时，旧实例可恢复且入口/Pages 均不可指向失效 release；已启用入口先收到 Pages 禁用回执才能切换。机制：systemd restart、串行 ledger、签名 release 状态与 Pages 清单。 |
| 刁钻 | `TC-ecs-public-preview-web-ingress-01-E6` | 未知/伪造 Host、伪造/过期签名、误将 Nginx 绑定公网、Web 绑定非回环、配置出现 API upstream、秘密或自动迁移时静态门失败。机制：部署配置与黑盒 proof。 |

## 后置与关联

- 成功后仅得到 `PreviewWebRelease=verified` 的静态配置/回环运行证据，`releaseEvidence=false`；它不是 CloudRuntimeRelease、真实云 E2E、删除证明或完整应用发布。
- 关联：`UC-public-preview-directory-01`、`UC-public-preview-01`、`UC-cloud-test-001`、`ai-docs/architecture/devops/local-demo-deployment.md`、`scripts/ecs-preview-config.proof.mjs`。
