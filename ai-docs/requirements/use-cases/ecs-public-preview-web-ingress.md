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
| 控制面 | prepare/deploy/finalize、Nginx/unit 模板、Funnel 解析器和签名器只从 root-owned 固定控制面目录运行。controller archive 中的 installer 只是**验签后的 payload**，不能直接以 `sudo` 执行：首次安装只能由镜像/IaC 预置、或人工受控的独立 root bootstrap 先将 archive 复制到 root-owned `0600` staging、以受信 CLI 验证构件证明并验证 archive 成员与仅常规文件的 payload tree，随后写入 root-only bootstrap receipt（archive SHA-256、payload-tree SHA-256、证明验证时间）才执行 archive 内 payload。installer 在独占 controller lock 下安装并 enable recovery oneshot；每次 release 在取得发布锁前必须启动并确认该 gate active，避免 Web 依赖惰性启动另一个锁拥有者。禁止对工作树、候选 release、archive 内 installer 或未验签路径直接执行 `sudo`。每个已安装入口重验自己的真实路径、逐文件 owner、mode 与摘要。候选 release 仅作为非特权 Web 产物与数据被读取，不能提供 root 可执行脚本或签名器模块。 |
| 崩溃恢复 | prepare/deploy/finalize/revoke 与 boot-time recovery oneshot 取得同一 root-owned `flock` 并协调 ledger、`current` 软链、serving permit 和公开 manifest；Web `ExecStartPre` **只读**复验已完成协调的 permit，绝不竞争该锁或写入状态。ledger、公开 manifest、permit 与 `current` 指针均采用“临时对象写入 → fsync 文件 → rename → fsync 父目录”；不得将单次 rename 描述为持久化。`staged` 不得有有效 permit；`active_unpublished` 只可获得回环 permit 且协调器强制关闭 Funnel；`edge_probing` 只在同一受控发布进程中持有临时 edge-probe permit，Pages 保持禁用。每次探测先持久写入 release-bound monotonic deadline/fence；独立的 60 秒 watchdog **不取得发布锁**，到期时并行以各自 15 秒预算停 Web、关闭 Funnel，随后才尽力清 permit、写 `/run`/持久 timeout marker 并启动重试。这里的“60 秒触发 + 15 秒并行关闭预算”仅描述物理关闭动作的发起与等待窗口；后续 marker、回执与账本修复仍可在 watchdog 的 stop budget 内继续，且它不是实际公网不可达的运行时证据。持久状态卷、D-Bus 或 Tailscale 短暂失败时，expiry 服务仍先重复关闭动作、并以失败重启重试。只有 fence 已完成且 deadline 未到期的精确公开提交可抑制晚到的 watchdog。新 reconciliation 发现任何 `armed` 或 `timed_out` fence 都必须撤链或失败关闭，不能重建 public permit；确认终态后才清理这次 probe 的 fence 和两类 marker。重启恢复或 lease 超时一律失败关闭，不能由卡住的发布进程延长 edge 暴露；`verified` 只有当未过期 signed manifest、ledger、`current` 与 permit 的 release/fingerprint 一致，且 ledger generation 与 permit 一致时才可得到公开 permit（manifest 不携带 generation）。`publishing`、`revoked`、`failed`、失配、缺失或不可验记录均先关闭 Funnel、清除 permit、停止 Web/候选，再保持失败关闭；不得自动恢复旧或新 release。若发现可验证的公开 manifest 与 ledger 不一致，先以**实际公开 manifest**签发撤链记录并等待 Pages 禁用回执；回执前不切换 `current`、不激活候选、不中止到另一 release。 |
| archive 边界 | controller 与 Web archive 只允许常规文件、目录，以及解析后仍位于 archive root 内的相对软链接；拒绝绝对/空/`.`/`..` 路径、重复成员、硬链接、root 外软链接、设备、FIFO、PAX 扩展、超限大小与 root 外成员。验签、列目录、解压和摘要全部针对同一个 root-owned staging archive。相同 release digest 的重放还必须具有相同 archive SHA-256。 |
| 进程 | `meetwise` 非登录用户运行 Web；候选也必须先运行在等价或更严的 transient systemd cgroup，`KillMode=control-group` 停止后才可能激活。Web unit 和候选 transient unit 都必须声明 `TimeoutStopSec=15s`；关闭调用在 15 秒后失败并复核 Web/candidate inactive，不能把被杀掉的 `systemctl` 客户端当作 PID 1 已停止服务。所有 Tailscale Funnel 的开启、关闭和状态读取只能经同一原语：15 秒命令预算后仅给 1 秒 TERM 宽限，随后强制 KILL；因此卡住的 CLI 不得阻塞失败关闭。`funnel off` 的退出码从不证明边缘关闭；在 loopback permit、安装 pre-close 与所有失败关闭路径中，只有该受限 status 的严格空映射判定才允许继续。Funnel off 与 Web stop 必须先于关闭路径的 systemd discovery 并行发起；该路径的 LoadState、ActiveState 和 candidate discovery 查询均有 5 秒上界。只有受限查询明确得到 `LoadState=not-found` 时，Web unit 的 stop 非零才可忽略；D-Bus、fragment 或未知状态均为失败关闭，且不跳过 Funnel status 复核、candidate 清理或 permit 失败关闭。Web unit 的 root `ExecStartPre` 只接受本次协调刚写入、且与 ledger/`current`/manifest 一致的 serving permit；任何失败均阻止 Node 进程启动。两个进程均不授予额外 capability，不读取私钥或服务密钥，仅读取已冻结 release 并限制出站到 loopback；失败不得自动迁移或启动 API/Worker。 |
| Pages | Pages 仍是静态目录。只有签名有效且未过期、`PreviewWebRelease=verified`、HTTPS、构建摘要、边缘/健康/方法门回执进入受控目录清单时，才渲染主项目链接。签名记录只经固定静态 `/preview-release-manifest.json` 暴露；Pages 每小时独立拉取、验签和探测 origin，过期、撤销或健康失败时生成并发布禁用目录与 `preview-link-state.json` 回执。切换已启用 release 前，控制面先签发撤链记录并等到该回执确认禁用。任何已写入公开 manifest、但尚未完成 ledger 确认的发布必须先撤链并收到该回执，之后才能回滚 Web。 |

`PreviewWebRelease` 状态为 `idle / failed / revoked → staged → active_unpublished → edge_probing → publishing → verified → revoked / failed`。单一 root-owned 实际 `flock` 覆盖协调、撤链、构件验签、候选、激活、Funnel、预签名黑盒验证和签名；`edge_probing` 在写入状态、签发临时 permit、重启 Web 或打开 Funnel 前，必须有界确认 watchdog service、expiry service 与 expiry timer 的 `LoadState=loaded`。`reset-failed` 对从未启动的静态 unit 可以非零退出，但它只是一项清理，不能替代该正向确认。随后才持久写入、签发临时 permit、并重启使 Web 的启动前校验接受该 permit，之后才允许打开 Funnel 做外部黑盒检查，且 Pages 链接始终禁用。它同时启动独立 60 秒 watchdog 和 release-bound deadline/fence：watchdog 的超时处理不等待发布锁，先停 Web、关闭 Funnel；之后再清 permit、写 `/run`/持久 timeout marker、启动失败重试。finalizer 的最后公开 copy/completion 只在持有短 fence lock、deadline 尚未到期、watchdog 仍 active、两类 timeout marker 都不存在时才可成功。任何 `armed`/`timed_out` fence 都是重启不可恢复的负授权；在 Pages 撤链或失败终态确认后才可清理。因而私有 staging、`publishing`、两次 permit 重启和公开 manifest commit 都不能因活着但卡住的 release shell 延长公网暴露。黑盒 receipt 成功且签名前后都重验相同活动 release 后，把 signed manifest 写入 controller 私有 staging、持久写入 `publishing`、写入 public permit 并重启 Web；接着转为 `verified`、按新 generation 刷新 permit 并再次重启 Web。仅在这些步骤都完成后，才将同一 signed manifest 原子复制到 Nginx/Pages 可读路径，并停止 watchdog 与 expiry retry。候选 release 必须先以独立回环端口证明其 release marker、构建摘要和允许页面，且 systemd 确认整个候选 cgroup 已退出后才可能激活。`current` 的物理切换本身不是激活；只有随后的 ledger 转换与 serving permit 都持久完成、并由 unit 启动前复验后才有效。同一 release digest 重放仅接受完全相同 archive；任何签名、HTTPS、精确 origin、边缘/内部健康、构建摘要、路径、permit 或方法门失配均进入失败关闭，Pages 链接保持禁用。`publishing` 不是不可恢复状态：进程重启或状态不一致时只允许完成一致性确认，或先收到撤链回执后失败关闭；不得猜测恢复前一 Web。撤链回执使用签名 manifest 的 canonical JSON SHA-256，避免格式化差异。

发布信任根固定为 root-owned 的 `/srv/meetwise-preview/{releases,current}`。既有 `/srv/meetwise` 是非特权服务用户的 home，不属于 preview controller 的发布根；controller 不得在其中创建、修改、删除或读取 release/current。安装新 controller 前必须先并行停止旧 preview Web、关闭 Funnel、验证两者均已关闭并清除 serving permit；任一步失败都不得创建或接管新根。`tailscale funnel off` 在整个 tailnet 尚未开通 Funnel 时可以返回非零；该退出码不能单独判定仍有公网边缘。唯一可接受的关闭状态是受限 `tailscale funnel status --json` 成功返回的顶层空对象（该 CLI 对“全局未启用”返回 `{}`），或只有一个 `Web`/`web` 字段且其值为普通空对象；任何缺失字段之外的额外字段、null、数组、未知结构或非空映射均失败关闭。新根与 `releases` 仅在缺失时经 root-owned、非链接、不可 group/world-write 的祖先受控创建并 fsync；已存在的路径必须精确为 root:root `0755`，否则拒绝。Web、候选与 recovery service 都以 `InaccessiblePaths=/srv/meetwise` 隔离旧 home。控制器将 Web/候选关闭限定在 15 秒外部预算内，并使用 `systemctl stop` 的同步语义；`--wait` 只适用于 systemd 的 start/restart，不能附加给 stop。CLI 超时不是服务停止证明：实际 unit 的 `TimeoutStopSec` 同样为 15 秒，并且关闭后须检查 inactive。Pages 撤链失败时只能调用同一受限关闭原语，不能以未验证的直接 `tailscale` 或 `systemctl` 命令宣称边缘已关闭。每次控制器更新都必须以目标 ECS 的 systemd 版本复验该关闭路径，静态断言不能替代这项实机回执。

## 首次 root bootstrap 合同

首次安装使用独立的 `ops/bootstrap/first_root_bootstrap.py`，它不被 controller archive 打包。这个文件的**唯一批准摘要**必须先由受信 `main` 中同目录的 `first-root-bootstrap.sha256` 读取，并由 `ops/bootstrap/test_first_root_bootstrap.py` 校验其与验证器字节精确一致。它不是运行后才记录的自我摘要。

首次 root 执行的固定四步是：① 非特权执行者把验证器上传到临时路径；② root 以固定 `/usr/bin/sha256sum` 将该临时文件与批准摘要比较，匹配后复制到新建的 root-owned `0700` bootstrap 目录并再次比较该 root 副本；③ root 仅以 `env -i PATH=/usr/bin:/bin HOME=/root PYTHONNOUSERSITE=1 /usr/bin/python3.11 -I <root-copy> --input-archive=<untrusted-path>` 执行该 root 副本；④ 验证器再校验其隔离解释器和摘要后才读取任何候选 archive。任何摘要、owner、mode、解释器、复制后摘要或 isolation flag 不匹配都不得读取 approval 或 archive。执行者还必须先在该 bootstrap 目录建立 root-only `gh-config/`（`0700`）并以 `GH_CONFIG_DIR` 完成 GitHub device login；验证器只读取其中 root-only `hosts.yml`（`0600`），不继承任意用户家目录的 GitHub 配置。

验证器不接受 archive SHA、仓库、workflow、commit、run 或 validator SHA 这类调用方参数。root 在启动前把这组值连同 `approvedSourceCommit` 写入固定 `controller-approval.json`（root:root `0600`）；描述符只允许 `miaole/meetwise` 和受信 `main` workflow，且 `approvedSourceCommit` 必须等于 attested archive 的 commit。批准者先从该 protected-main commit 读取 `first-root-bootstrap.sha256` 并核对 validator bytes，随后才创建 descriptor。验证器记录此 descriptor 的 SHA-256，并把它作为唯一信任目标：它以 `O_NOFOLLOW|O_CLOEXEC` 打开 untrusted archive descriptor，`fstat` 为有界普通文件后仅复制该 descriptor 的字节，拒绝 FIFO/链接/替换路径且在复制时再次施加 archive 上限。它在新的 root-owned `0700` staging 内复制 archive 为 `0600`，再对**这份副本**运行 `/usr/bin/gh attestation verify`，要求 subject digest、固定 repo/workflow、`refs/heads/main`、descriptor 的 commit 与 run ID 精确匹配。

验证器在 receipt 发布前不加载 candidate JS 或 shell。它以流式方式只提取 `ops/ecs` 下的显式目录和 POSIX regular 文件；PAX、sparse/contiguous 扩展、链接、设备、FIFO、重复名、越界路径和超限 archive 均失败关闭。提取后再用 `lstat` 复核树并从内向外 fsync 每个目录，写入 schema v2 的 `bootstrap.json` 与原始 attestation JSON，并对 staging 与父目录 fsync 后原子改名为 `verified-controller-<完整 archive-SHA-256>`。receipt 写入同一 `bootstrapSlot`；slot、receipt 的 actual/expected SHA 与系统重新计算的 archive SHA 必须全部精确一致。旧固定 `verified-controller` 是历史 slot，既不能作为新 installer 的输入，也不能自动回退。相同摘要 slot 已存在时拒绝覆盖，不同摘要可并存以支持受控 controller 更替；slot 不在安装时写临时文件，自动清理多 slot 也不在本工作包范围。receipt 除原有 archive/tree digest 与验证时间外，还记录 expected digest、repo/workflow/commit/run、validator 的批准摘要和实际摘要、archive policy/大小和目标主机。

receipt 发布后，root **只**以 `env -i PATH=/usr/sbin:/usr/bin:/sbin:/bin HOME=/root /bin/bash --noprofile --norc <bootstrap 输出的 verified-controller-完整摘要目录>/payload/ops/ecs/install-preview-controller.sh` 调用已验 payload 的 installer；installer 从自己的 canonical path 派生 slot，并重新计算 archive SHA，要求它与 receipt 的 `bootstrapSlot`、actual/expected SHA 及完整 slot 后缀全部一致。安装时 scratch 只位于 root-only controller runtime；普通命令失败会恢复旧 controller/unit，旧 controller 仅在新 recovery 成功后才清理。controller/unit 替换的 SIGKILL、掉电持久 journal 与 boot resolver 尚未实现，遇到该类中断必须保持 edge 失败关闭并由受控恢复流程处理，不能写成已具备断电回滚。禁止经 shebang、`env bash`、`BASH_ENV`、用户 PATH、工作树或临时上传路径启动它。installer 的 shebang 固定为 `/bin/bash`，但首次调用仍必须使用上面的明确解释器命令。

`TC-ecs-public-preview-web-ingress-01-E1` 的首次安装分支必须覆盖：错误 archive SHA、错误 repo/workflow/commit/run、坏 gzip、PAX、软/硬链接、越界/重复成员、超限条目、非 root/错误 mode、提取后 metadata 漂移、receipt fsync/rename 中断与既有 staging。当前 Python archive policy proof 只验证普通输入与拒绝 traversal/symlink；远端 root bootstrap 和真实 ECS 故障注入在 controller 安装回执之前均保持 `releaseEvidence=false`。

## 主流程

1. GitHub Actions 在受保护 `main` 构建 Web archive 与 controller archive，并分别签发构件证明；ECS 只接受验证签发 workflow、仓库和 archive 摘要均一致的 Web archive。
2. 独立 root bootstrap 先把 controller archive 固定到 `0600` staging、验证构件证明与成员边界，才执行 archive 内 installer；已安装 root-owned 控制面随后把 Web archive 固定到 `0600` staging，并验证 commit/tree、普通成员边界、冻结 ownership、构建/静态资源摘要、Nginx 配置与 service unit，再以受限 transient systemd 候选端口确认新版本 marker。
3. systemd 以 `meetwise` 用户启动 Web，仅绑定 `127.0.0.1:3000`；boot-time root recovery oneshot 先协调四项记录，随后每次启动前 root `ExecStartPre` 只读验证 permit。切换或健康失败时停站并关闭边缘，不自动猜测恢复前一软链或 service。
4. Nginx 在 `127.0.0.1:8080` 执行路径和方法双 allowlist；允许页面的 `GET`/`HEAD` 才反代到 Web，`OPTIONS` 无状态返回，其他方法和路径固定拒绝。
5. Funnel 从本机 Tailscale status 派生精确 hostname，并在修改前拒绝非预览映射；完整外部 HTTPS、允许路径、拒绝路径、并发写拒绝、未知 Host 和监听边界在预签名黑盒阶段全部通过后，root-owned 签名器才将发布记录写为 `verified`，后续受控 Pages 清单才可启用链接。

## 异常流与七类测试

| 类别 | TC | 断言与机制 |
| --- | --- | --- |
| 正常 | `TC-ecs-public-preview-web-ingress-01-main` | 允许页面的 `GET`/`HEAD` 到达 Web；release marker、digest、回环健康、精确 HTTPS 地址、permit 和签名记录一致。机制：不可变 release 目录、启动前 permit 与签名健康回执。 |
| 异常 | `TC-ecs-public-preview-web-ingress-01-E1` | 构建产物、archive 成员、候选 marker/cgroup 停止、Nginx 校验、`current` 切换、permit、外部 HTTPS、公开 manifest 后的 ledger transition 或健康任一失败时，先完成撤链回执或关闭 Funnel，再停止 Web；Pages 链接保持禁用。Nginx reload 后的首个回环连接被拒时，仅在 `active_unpublished` 的 bounded loopback retry 内重试；20 次仍未取得 marker 则失败关闭，绝不以一次监听竞态打开 Funnel。覆盖 manifest rename 后至 `publishing → verified` 前崩溃、撤链 manifest 写入后至 ledger 转换前失败、ledger/permit 写入失败和 `current` 指针目录 fsync 前掉电，以及旧 home pre-close、新根创建、controller 安装、recovery 前每个迁移中断点。当前仅有 deterministic/static proof；ECS systemd、Funnel、Pages receipt 的故障注入仍为 planned。机制：带 fsync 的记录与失败关闭发布状态机。 |
| 特殊 | `TC-ecs-public-preview-web-ingress-01-E2` | 允许路径的 `OPTIONS` 返回无状态响应；缺失 API/数据库凭据时首页仍可浏览，数据页面、登录和 API 不伪造成功。机制：最小进程边界。 |
| 逃逸通道 | `TC-ecs-public-preview-web-ingress-01-E3` | 携带已有 cookie 的 `/api/*`、RSC、登录和业务路径均不转发；`POST`、`PUT`、`PATCH`、`DELETE`、`TRACE`、`COPY`、自定义方法以及带 cookie、query、body 的变体均为 503 或 404，Next handler/Server Action/API/队列=0。新 preview root 的 symlink、`meetwise`-owned、group/world-write 或 partial 目录都拒绝；`meetwise` Web/候选进程对旧 `/srv/meetwise` 必为 `EACCES`，对 new current 仅可读。机制：Nginx 路径与方法双 allowlist、root trust-path 断言与 systemd 路径隔离。 |
| 高并发 | `TC-ecs-public-preview-web-ingress-01-E4` | 20 个并发非安全请求全部 503；无 Web action、API、队列或数据面调用。机制：无状态边缘拒绝。 |
| 复杂 | `TC-ecs-public-preview-web-ingress-01-E5` | Web 重启、候选切换回滚、边缘暂时断开、release 过期或撤销时，只有四项一致的 release 才能取得 permit；其余场景 Web/Funnel 均停止，入口/Pages 不得指向失效 release。覆盖重启时 `publishing`、公开 manifest 已持久而 ledger 回退为 `active_unpublished`、`verified` manifest/fingerprint 不一致、`current` 与 ledger 不一致、permit 丢失，以及 `edge_probing` 中 kill-9、卡住的 release lock、watchdog deadline 与 public-manifest commit 竞争、Funnel 或状态盘短暂失败后的重复关闭。真实 ECS 必须注入忽略 TERM 的 Tailscale CLI：15 秒后 1 秒 KILL 宽限必须终止该子进程、关闭路径继续而非卡住。controller/unit 替换还需覆盖每个 rename 与 unit-copy 后的 SIGKILL/掉电：在 journal/boot resolver 落地前只允许 edge 失败关闭，不得称有可自动断电回滚。协调完成前新 release 的 `current` 不得生效。当前仅有 deterministic/static proof；真实 systemd/Funnel/Pages receipt 的故障注入仍为 planned，不能写成发布证据。机制：boot recovery + read-only `ExecStartPre`、带 fsync 的串行 ledger/permit/pointer、持久 deadline/fence、独立 watchdog、公开 manifest 对账与 Pages 清单。 |
| 刁钻 | `TC-ecs-public-preview-web-ingress-01-E6` | 未知/伪造 Host、伪造/过期签名、误将 Nginx 绑定公网、Web 绑定非回环、配置出现 API upstream、秘密或自动迁移时静态门失败。机制：部署配置与黑盒 proof。 |

## 后置与关联

- 成功后仅得到 `PreviewWebRelease=verified` 的静态配置/回环运行证据，`releaseEvidence=false`；它不是 CloudRuntimeRelease、真实云 E2E、删除证明或完整应用发布。
- 关联：`UC-public-preview-directory-01`、`UC-public-preview-01`、`UC-cloud-test-001`、`ai-docs/architecture/devops/local-demo-deployment.md`、`scripts/ecs-preview-config.proof.mjs`。
