---
id: UC-public-preview-directory-01
name: GitHub Pages 公开预览目录
status: planned
owner: devops
---

# UC-public-preview-directory-01 · GitHub Pages 公开预览目录

## 目标与范围

公开目录只介绍项目、展示能力边界并链接已确认的源码仓库。它是静态页面，不是应用代理、认证层或数据入口。主项目链接默认禁用；只有受控 ECS 发布清单同时证明 HTTPS、镜像摘要、健康状态、访问策略与公开只读模式后，才可由后续独立工作包启用。

- 角色：公开访客、仓库维护者、Pages 发布任务。
- 前置：仓库默认分支受保护；发布任务只从默认分支运行；`preview-site/` 是唯一发布目录。
- 明确不做：不调用 API、不嵌入主应用、不接收表单、不在链接中携带 token/query/fragment，不将 Pages 用作 ECS 访问授权。

## 契约

| 项 | 契约 |
| --- | --- |
| 内容 | 仅版本控制的 `preview-site/index.html` 与样式；无脚本、网络请求、环境变量、IP、端口、连接串或秘密。 |
| 发布源 | 只由默认分支 push 或维护者手动触发；禁止 pull request、`pull_request_target` 或外部输入直接发布。 |
| 权限 | 校验 job 只读；部署 job 仅有 Pages 所需 `pages: write`、`id-token: write` 和仓库内容读取权限。 |
| 入口 | 只保留已确认的源码仓库链接；未验证的 ECS 主项目地址永远不出现在静态产物中。 |
| 失败 | 目录检查、构件上传或 Pages 部署任一步失败时不产生新的部署；不能以 `noindex` 代替访问控制。 |

## 主流程

1. 默认分支中 `preview-site/` 或 Pages workflow 发生受审变更。
2. 发布任务检出该受保护提交，只执行静态目录 proof。
3. proof 通过后上传唯一 `preview-site/` 构件并部署至 Pages 环境。
4. 访客只能看到项目说明、能力边界和源码链接；主项目入口仍呈禁用状态。

## 异常与验收

| 类别 | TC | 断言 |
| --- | --- | --- |
| 正常 | TC-public-preview-directory-01-main | 默认分支的静态 proof 通过，构件只来自 `preview-site/`。 |
| 异常 | TC-public-preview-directory-01-E1 | 缺失入口、样式或 proof 失败时上传/部署不执行。 |
| 特殊 | TC-public-preview-directory-01-E2 | `noindex,nofollow`、无脚本和无网络副作用保持成立。 |
| 逃逸通道 | TC-public-preview-directory-01-E3 | 无 IP、端口、secret、连接串、iframe、API URL 或未验证 ECS 链接。 |
| 高并发 | TC-public-preview-directory-01-E4 | 并发发布被同一 Pages concurrency group 串行化，不产生两个相互覆盖的部署。 |
| 复杂 | TC-public-preview-directory-01-E5 | 非默认分支、PR 事件和外部 workflow 输入不能发布 Pages。 |
| 刁钻 | TC-public-preview-directory-01-E6 | 源码链接固定为确认仓库，任何运行时跳转输入、query 或 fragment 均不存在。 |

## 状态

`TC-public-preview-directory-01-main/E1…E6` 为 planned/unmapped。静态 proof 与 workflow 只提供 `releaseEvidence=false` 的配置检查；真实 Pages 地址、ECS 健康和主项目入口由后续发布工作包单独验收。
