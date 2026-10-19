# 北星战役交接说明（供任意 agent 从 origin 接管）

> 本文件 + 本分支（`line/campaign-state`）= 战役全部状态快照。主开发线 = `feat/mysql-schema-skeleton`。

## 一、当前状态（2026-10-19 快照）

- 主线 `feat/mysql-schema-skeleton` @ `4c2ea4c9f`，CI 三 workflow 全绿
- 修复进度：批表 223/271（82.3%，权威计件源=本分支 `.tmp/external/issues-master.md`）；AI 能力台账 done 30 / half 2 / open 16
- 文档数量帽：`scripts/ai-docs/public-text-policy.mjs` MAX_FILES=2264，主线现值 2261（余 3）
- lint 帽恰等：root 5242 / api 1423 / domain 115（0 errors 红线不可放宽）

## 二、在飞四支线（均已提交并推送，各卷 STOP 状态见各自 REQUEST）

| 分支 | 内容 | STOP | 下一步 |
|---|---|---|---|
| `line/upload-guards-draft` @ df150781d | 上传文件头校验+解析超时强制终止 | executed:awaiting_post_prove_dual | 窄域复核席1 的两条补码（text 全魔数族+探针常驻门，见 REQUEST §9-EXEC 补记）→PASS 即与席2 PASS 会签合并→merge 主线 |
| `line/ag17-draft` @ 1cf4c4042 | AI 结构化输出 span 档名修正 | draft:awaiting_pre_exec_dual | 双审×2 → 实现 |
| `line/pgp-key-param-draft` @ c7f30447c | 会话加密密钥移出 SQL 语句参数 | draft:awaiting_rev | 双审×2 → 实现 |
| `line/threshold-calibration-draft` @ 67f905a2d | 自适应面试阈值参数化 | draft:awaiting_pre_exec_dual | 双审×2 → 实现 |

**第一波注意**：四卷并线后主线文档数 2265 会超帽 2264——先派一个帽步进任务（2264→2272，改 MAX_FILES+联动断言+自查 grep，模板=仓内 `cap-sanction-2264-REQUEST.md`）。

## 三、任务固定流程

起草卷（`ai-docs/delivery/harness/<名>-REQUEST.md`：§0 锚 blob 亲算 / §1 修法 / §1.3 否决 / §2 验收门矩阵 / §8 STOP）→ 两个互盲评审席 BOTH PASS → 实现（静态门+隔离门全绿）→ 两个互盲复核席 BOTH PASS → merge 回主线（--no-ff·先 fetch 届 tip+`git merge-tree --write-tree` 预演零冲突）→ `product-campaign-LEDGER.md` 管线区 + `execution-master-checklist.md` 各 append 登记行 → `git push origin HEAD:feat/mysql-schema-skeleton`（只许直推）→ 等 CI 判定。

## 四、硬性规则

1. commit 消息禁任务黑话（刀/nail/sanction/门矩阵/REQUEST/批表等）：标题=`类型(范围): 中文一句话说清解决了什么`，正文列要点
2. 并行额度 6 席；席位 600 秒无响应判死，重试一次仍死→主会话内联接续
3. 磁盘 >20Gi 才开工；支线合并后即删工作树；Docker.raw>20G 先 prune（绝不动 volumes）
4. 每次收官汇报必附进度条：批表 x/271 · AG done/open · 主线 tip+CI · 在飞队列 · 磁盘
5. 每波派单前看本文件「二」的下一步；收官后更新本文件并 push 本分支（状态快照随做随更）

## 五、常用命令

```
pnpm install                                   # 环境就绪（需 Node22+pnpm10+Docker）
pnpm turbo typecheck --force && pnpm turbo lint --force
node scripts/ai-docs/check-docs.mjs            # 文档门（数量帽）
node scripts/check-migration-version-uniqueness.mjs
node scripts/run-e2e-isolated.mjs neg:resume   # API 隔离门（门名清单见脚本 :2162）
pnpm --filter @meetwise/domain prove:resume-extract
```

## 六、待用户拍板（不要自行决定）

P1=PR #109 合并+BV 双钥核查；P2=G7 三输入+LIVE 判别授权；P3=计费语义/S7 真键等八项+候选 6 项。明细=`.tmp/user-decisions-final.md`（本分支已带）。

## 七、历史与先例

`ai-docs/delivery/harness/` 下 40+ 已收官任务卷=模板与先例；`execution-master-checklist.md`=全量登记；测试收据=`.tmp/isolated-proof-receipts/`（本分支已带最近全量）。
