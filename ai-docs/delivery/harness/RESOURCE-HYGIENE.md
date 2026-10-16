# 资源治理（disk/worktree hygiene）· 2026-10-10 制度化

> **总原则（用户 2026-10-10 定）**：能复用的复用；不能复用的单次任务，结束且未来不会用到 = **及时清理**。判定时点不是"某天想起来"，而是任务收口动作的一部分（nail/审查毕 = 清理触发器）。

> 背景：北星 loop 单日派生 27+ 工作树（每树装 node_modules 后 0.5-3G）+162 个 rv-* 审查残留目录+Docker.raw 膨胀至 72G，磁盘 3.5G 告急（ENOSPC 复发）。本文件为**强制制度**，协调方每波派发前执行。

## 〇、复用判定表（先判复用，再判清理）

| 资产 | 复用性 | 处置 |
|---|---|---|
| 主仓（feat/mysql-schema-skeleton） | 永久 | 保留 |
| 刀分支（line/*） | 历史/回溯 | 保留（不占工作区） |
| 在飞席位工作树 | 在飞必用 | 保留至席位毕 |
| **已 nail 刀工作树** | **单次·成果在主线** | **nail 后立即删**（本条即"及时清理"的执行点） |
| **rv-* 审查树** | **单次审查** | **席毕即删**（含非注册目录残留） |
| node_modules | pnpm store 硬链接共享 | 随树删，store 定期清 |
| 隔离 e2e 容器/收据 | 单次 | 容器自弃；收据旧批定期清 |
| Docker.raw | 容器层可重建 | 膨胀 >20G 即清（§三） |
| quarantine 证材料 | 结案前需证 | 结案（nail+违规处置完）后可清 |
| exec 会话日志 | 极少回看 | 每周清旧 |


## 一、工作树生命周期 = 刀生命周期（硬规则）

| 刀状态 | 工作树处置 |
|---|---|
| nail 落主线（merge commit 在 feat/mysql-schema-skeleton） | **立即删工作树**（`git worktree remove --force`）·分支保留（成果在主线，分支仅历史） |
| EXEC/rev 在飞 | 保留 |
| post-prove 双审完毕且 nail 落主线 | 立即删 |
| 审查席一次性树（rv-*、探针） | **席毕即删**（禁留目录残留——非注册 worktree 的目录 `rm -rf` 直接清） |

- 收口判定以主线 `git log` 为准（nail/merge commit 可见=成果安全，工作树可删）。
- 删树前检查：无未提交的实现卷（有则先问协调方）、无活动 stash（有则 `git stash show -p` 导出至主线 `.tmp/` 保全）。

## 二、每波派发前置检查（协调方必做）

```
df -h /System/Volumes/Data   # < 20Gi 可用 = 先清再派
git worktree list | wc -l    # > 12 = 收口树清理
du -sh golucky/meetwise-* | sort -rh | head  # 单树 > 3G 排查 node_modules/产物
```

## 三、Docker.raw（历史两次膨胀：44G→72G）

- 隔离 e2e 容器每次自起/自弃，但 Docker.raw **只增不减**（sparse 膨胀不回收）。
- 警戒线 20G：`find ~/Library/Containers/com.docker.docker -name '*.raw' -size +20G`。
- daemon 未运行时直接删 Docker.raw（先例：2026-10-09 授权、2026-10-10 复用）；损失=dev 库 meetwise-postgres-dev 数据（`migrate` 可重建）与一次性容器，**不影响隔离 e2e**（runner 每次自起临时 PG）。
- daemon 运行时：优先 `docker system prune -af --volumes`（保留 dev 库）。

## 四、旧数据定期清（协调方每 2-3 天一次）

| 对象 | 命令 | 频率 |
|---|---|---|
| ~/.zcode/cli/exec 会话日志 | 按日期删旧（G3 落卷席曾自救清出 1.4G） | 每周 |
| ~/Library/Caches | `rm -rf ~/Library/Caches/*`（2.7G 级） | 每周 |
| 主仓 .tmp/ 隔离收据与归档 | 保留 quarantaine 等证材料，删 .tmp/isolated-proof-receipts 旧批 | 每周 |
| 收口刀分支 | 保留（不占工作区）——批量删分支需协调方确认 | 月度 |

## 五、禁删清单（用户资产·非 loop 产物）

- `golucky/lucky-wms-*`、`golucky/golucky-web`、`golucky/pda*`、`golucky/demo`、`golucky/golucky-20260923_weekdev`（其他项目）
- `meetwise_副本`、`meetwise-e88d386-ui`、`meetwise-ecs-public-preview`（疑似用户手工副本——删前必须问）
- `.env*`、Key/secret 任何形态

## 六、执行记录

- 2026-10-10：3.5G→27Gi（+23.5G）——删已收口 worktree ×24（含 consentmin/e2rg）+rv-* 残留目录 ×162+Docker.raw 72G（daemon 未运行）+Caches 2.7G。保全：entpay stash@{0}（eviddel WIP）与 stash@{1}（s1 preservation）导出至 `.tmp/quarantine-entpay-unauthorized/`。
