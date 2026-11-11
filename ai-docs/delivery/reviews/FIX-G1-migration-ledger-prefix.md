# FIX-G1 · 迁移链首 0000 导致旧库升级失败（审查 P0-1）

> 修复方：G1 执行者（审查域 mw-e2e-ha）。**需要 mw-e2e-ha 独立审查，修复方不自批、不自合。**
> 基线：`origin/main` = `9c9809446`（0000 由 #236 `adb907774` 引入，已在 main 上，所以基于 main 开分支）。
> 分支：`fix/g1-migration-ledger-prefix`。审查报告来源：`review-refactor-189c0054a.md` 第 5 节 P0-1、第 6 节 G1。
> 本地隔离 PG 绿 ≠ HA；NOT_HA；releaseEvidence=false。所有时间为北京时间。

## 1. 问题

- `packages/db/src/migrate.ts:455-457` 要求已应用账本必须是清单（字节序）的连续前缀。
- #235（`7f7a91d41`）/#236（`9c9809446`）新增 `0000_admin_provision_primitives.sql`，字节序排在 `0001_baseline` 前面。
- 结果：所有按 0001.. 建好的旧库（例如 #234 `9d1d5e95d` 的 225 个迁移）升级时报 `migration_ledger_not_contiguous_prefix`，退出码 1，发布被阻断（fail-closed，不损坏数据）。
- `migrate:prove` / `dbhy1:prove` 都从空库起跑，覆盖不到“旧账本 → tip”。

## 2. 改动

| 文件 | 改动 |
|---|---|
| `packages/db/migrations/0000_admin_provision_primitives.sql` → `0230_admin_provision_primitives.sql` | 纯改号（git rename，**文件字节不变**，sha256 仍为 `50b47580…c14f`）。当前最大号 0229，+1 = 0230 |
| `packages/db/test/migrate-upgrade-previous.proof.ts`（新增） | 旧库升级 proof，见第 3 节 |
| `package.json`、`packages/db/package.json`、`scripts/run-e2e-isolated.mjs` | 注册 `pnpm migrate-upgrade:prove`（隔离一次性 PG，空库起，不进 pre-migrate 名单），只做追加 |
| `.github/workflows/ci.yml` | **只新增 1 个 step**（紧跟 `pnpm migrate:prove` 之后），设置 `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1`；未重排已有内容 |
| `packages/db/test/migrate.proof.ts` | 钉值改为链首必须是 `0001_baseline`，且不存在排在其前的迁移，`0230` 在清单中 |
| `packages/db/test/dbhy1.proof.ts` | P2 冻结基线（0001–0144）去掉 0000 行（0230 > 0145，不再属于该基线区间） |
| `scripts/deploy-check.mjs` | 链首必须是 `0001_baseline.sql`；新增“不得有迁移排在 0001_baseline 之前”守卫 |
| `apps/worker/test/privacy-erasure-pause-upgrade.proof.ts` | legacy 夹具（≤0075）阶段要调用 `provision*Login`，原来靠 0000 在前缀里；现改为按需直接加载 0230 原语体（不写账本），全链重放时 0230 以 CREATE OR REPLACE 幂等落账 |
| `scripts/ai-docs/public-text-policy.mjs` / `.proof.mjs` | 受管文件数 cap 2530→2532（新增恰 2 件：上面的 proof 和本文档），四联动点同步 |

**依赖顺序检查（已核实）：**
- 0001..0229 中没有任何迁移调用 0000 的六个 `mw_admin_*` 原语（`rg mw_admin_(create_login|grant_role|…) packages/db/migrations` 只命中原语文件本身）。唯一调用方是 `packages/db/src/principal.ts` 的 provision 路径，它在迁移完成后才执行（migrate-cli）。
- 0230 文件只含 `CREATE OR REPLACE FUNCTION` 和 `REVOKE ALL … FROM PUBLIC`，空库从头跑、旧库追加、重放都幂等。
- 0229 定义的是另一组 `mw_admin_*` 函数（owner/grant 族），与 0230 不重名、无互相依赖。
- 附带效果：原来空库建库时 0000 先于 0073 的 `ALTER DEFAULT PRIVILEGES … REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC` 执行；现在空库与升级库的原语 ACL 一致（proof 断言 PUBLIC 无 EXECUTE）。
- 没有改写任何其他已应用迁移（`dbhy1:prove` P2-1 的 0001–0144 sha256 冻结基线全等）。

## 3. 旧库升级 proof（`pnpm migrate-upgrade:prove`）

隔离一次性 PG；每臂独立 database、跑完即删（0001 baseline 的 DROP ROLE 是 cluster 级，所以串行）。

| 臂 | 旧库迁移集 | 期望 |
|---|---|---|
| 静态 | 由当前文件字节重建 #234 / #235 / #236 三版迁移集，与 git 实测个数和摘要（钉值）逐一相等 | 证明重建出的旧库就是当时的真实迁移集 |
| R234 | #234 `9d1d5e95d`，0001..0227 共 225 个 | 升级成功，只追加 0229、0230，账本 = 当前清单，重放全 skipped |
| R235 | main@`7f7a91d41`（#235），0000+0001..0227 共 226 个 | 未处置时 fail-closed `migration_ledger_unknown_version:0000_admin_provision_primitives`，账本未动；执行一次性处置后升级成功，追加 0229、0230 |
| R236 | main@`9c9809446`（#236），0000+0001..0227+0229 共 227 个 | 同上，处置后只追加 0230 |
| GIT | 从 git 取“上一版 main”的真实迁移文件：默认 `origin/main`；HEAD 就是 origin/main 时取 `HEAD^1`；可用 `MIGRATE_UPGRADE_FROM_REF` 覆盖 | 升级成功。CI 设 `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1`，取不到 ref 记失败而不是 SKIP（verify job 已是 `fetch-depth: 0`） |

GIT 臂让这道门不会随钉值过期：以后任何 PR 只要把新迁移插到已发布清单的中间或链首，per-push CI 就会红。

## 4. 已用 #235/#236 迁移过的库：一次性处置（需要时由运维执行）

只改名为 0230 不够：#235 库没有 0229，改名后账本仍不是连续前缀。统一做法是退役 0000 账本行（限定 version 和 checksum 同时匹配），然后正常跑迁移：

```sql
DELETE FROM schema_migrations
 WHERE version  = '0000_admin_provision_primitives'
   AND checksum = '50b47580229fb51aebdb6c7b15f28ebf534e077d6abd9be295c1ceeb0bf6c14f';
-- 然后照常执行迁移（compose 的 migrate 一次性服务，或 `pnpm -C packages/db migrate`），runner 会按序追加 0229（#235 库缺）与 0230。
```

- 0230 与旧 0000 字节相同，函数已存在时 CREATE OR REPLACE + REVOKE 重放幂等（R235/R236 臂实证）。
- 未处置时 runner 在任何 DDL 之前以 `migration_ledger_unknown_version:0000_admin_provision_primitives` 拒绝，不会半迁移。
- 是否存在这样的库：`deploy.yml` 最近 40 次运行没有一次成功（最近一次 2026-11-10 03:39 为 9c9809446，失败在 “Sync compose files to ECS”，未到 migrate 步骤）。**推断**云端 ECS 库没有 0000 账本行；本地/开发库（例如用 #235/#236 建的常驻栈库）可能有，需按上面处置。未登录 ECS 核实（未找到直接证据）。

## 5. 验证（命令 | 退出码）

环境：盒子本机，Node 22.23.3，pnpm 10.18.0，Docker 29.9.3，隔离 PG 镜像 pgvector/pgvector:pg16；`DATABASE_URL` 未设置（各 `*:prove` 由 `run-e2e-isolated.mjs` 自起一次性容器）。2026-11-10 20:31–20:36 北京时间完整跑一遍（下表为该轮结果）。

| 命令 | 退出码 | 备注 |
|---|---|---|
| `pnpm migrate:prove`（空库全链） | 0 | 128 PASS，含新钉值“链首 0001_baseline·0230 在清单” |
| `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove`（旧库升级） | 0 | 32 条断言全绿（静态 + R234 + R235 + R236 + GIT 臂）；另连跑 5 次全 0 |
| `pnpm migrate-cli:prove` | 0 | |
| `pnpm dbhy1:prove` | 0 | 28 PASS，P2-1 冻结基线全等（没有改写历史迁移） |
| `pnpm db-acl2:prove` | 0 | 43 PASS |
| `pnpm qbank-control-role:prove` | 0 | 12 PASS |
| `pnpm privacy-erasure:prove` | 0 | |
| `pnpm privacy-erasure:pause-upgrade:prove` | 0 | pass_count=15（含新增“legacy 夹具按需加载 0230 原语”断言） |
| `pnpm qbank-integrity-upgrade:prove` / `rag-control-upgrade:prove` / `authz5a:normalize:prove`（其他前缀升级类 proof） | 0 / 0 / 0 | |
| `pnpm runtime-role:prove` | 0 | |
| `pnpm drift:prove` | 0 | |
| `pnpm deploy:check` | 0 | 227 个版本化迁移 |
| `node scripts/check-migration-version-uniqueness.mjs` | 0 | |
| `pnpm db:prove` 等价命令（`proof/primitives.sql` 灌入本刀自起的一次性 pgvector 容器，不碰共享 `meetwise-postgres-dev`） | 0 | 四原语全部通过 |
| `pnpm turbo typecheck` / `pnpm typecheck` | 0 / 0 | |
| `pnpm turbo lint` / `pnpm lint` | 0 / 0 | root 0 errors / 5411 warnings（与改前相同，上限 5425 未动）；新 proof 文件 0 warning |
| `pnpm docs:check` / `node scripts/ai-docs/public-text-policy.proof.mjs` | 0 / 0 | scanned 2532 = cap 2532 |
| `pnpm arch` | 0 | |

**反证（negative control）：** 在一份临时拷贝里把 0230 改回 0000，`pnpm deploy:check` 退出码 1（报“迁移不得排在 0001_baseline 之前”），`pnpm migrate-upgrade:prove` 退出码 1（静态臂 FAIL、`migrate_upgrade_manifest_invalid`）。新门能拦住这类回退。原始缺陷（#234 账本 → tip 退出码 1、`migration_ledger_not_contiguous_prefix`）见审查报告第 3c 节复现。

**过程中的红与作废（如实登记）：**
- 第一轮矩阵（Node 20）跑的过程中，我在同一 worktree 做过一次 `git stash`/`stash pop`（约 16 秒，迁移文件被临时还原），所以第一轮整体作废，不计入结果。
- 第二轮（Node 20，20:27 左右）`migrate-upgrade:prove` 在 R236 臂建库时报 SQLSTATE 53100 并断连，紧接着 `migrate-cli:prove` 报 `isolated_postgres_database_not_ready:boot`；`pnpm arch` 因 Node 20 不受 dependency-cruiser 支持退出 1。同时段盒子上其他代理在并发跑栈。
- 第三轮改用 Node 22 完整重跑（上表），外加 `migrate-upgrade:prove` 连跑 5 次，以及前后另 3 次单跑，共 9 次全部为 0。53100 根因未定位（推断为并发负载导致的环境问题，未实证）。如果 CI 上出现 53100，需要回看这里。

## 6. 遗留项

1. **是否把第 4 节处置做进 runner**（例如受限的“已退役版本”白名单，在 advisory 锁内、同 checksum 才删除）：本次没做。它改变账本信任语义，按审查建议属于需双审的方案②，留给 mw-e2e-ha 审查/用户拍板。
2. **0230 文件注释过时**：第 1–3 行仍写“序号 0000=置于链首”，第 4、8 行写 “SECURITY DEFINER”，实际是 INVOKER（审查 P3-1）。为保持字节不变（checksum 不变，第 4 节处置才能用同一 checksum 精确匹配），本次不改注释；本文档即为更正记录。0229 的 `%s` 白名单（P3-1 后半）属于已应用迁移，不在本刀改。
3. **P3-4**（`principal.ts` qbank definer provision 的 finally 里 `pg_advisory_unlock` 去掉 `.catch()`）未在本刀处理，避免扩大改动面；建议另开一刀。
4. **CI workflow 冲突约定**：审查报告第 6 节约定由 G3 统一改 workflow；本刀按协调方派单只**新增**了 1 个 step，没有重排。若 G3 同时改动同一区域，合并时以追加方式解决。
5. **受管文件 cap**：本刀把 cap 2530→2532。其他并行修复组如果也新增文件，合并时按 union 实测重算。
6. 共享进度文档（execution-master-checklist 等）未改，由协调者统一更新。
