# ANNOT-1 · 01 · 两 prove 读数（一次优先 · EXIT 原值 · 零 retry-to-green）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

| 命令 | EXIT（原值） | 尝试次数 | 尾部读数 verbatim |
| --- | --- | --- | --- |
| `pnpm -C apps/web prove` | **0** | 1（一次过 · 零重试） | `PASS  分开记账卡片不把 0126 写成完整档案` / `✓ 全部通过` |
| `pnpm -C apps/web prove:public-copy` | **0** | 1（一次过 · 零重试） | `✓ TC-PUBLIC-COPY-E12` / `✓ TC-PUBLIC-COPY-E11` / `✓ TC-PUBLIC-COPY-E10` / `static_preflight_valid: selected=13/13; releaseEvidence=false` |

- 跑点：worktree `meetwise-line-annot`（EXEC 树 · 依赖 `pnpm install --frozen-lockfile --prefer-offline` EXIT=0 后跑）；树态=注释已改写（page.tsx blob `490f231d`）。
- 改写后注释在 public-copy 全文扫描面内：禁表零命中（EXIT=0 即证），REQUEST §4 副证预期兑现。
- 类型检查/lint：库内无轻量脚本（REQUEST §4 已记 · rg 亲证零命中），不为门。
- `docs:check` 预存红 retained：base `PTP_FILE_LIMIT:3804`（MAX_FILES=2048）与 EXEC 无关，按授权不跑不为门、Ban 翻 limit——EXEC 后该预存红不因本刀洗绿也不因本刀加深（本刀仅增/改 ai-docs markdown，COUNT 面不受文件数限额放宽影响；如实记录：该门在 base 即红，非本刀产物）。
