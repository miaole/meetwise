# REQUEST — **INT-TRANSCRIPT-01 生产 cutover 立卷合同（MOP03 六门先例）** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-int-transcript-01-cutover-contract.md` · `gap-int-transcript-01-cutover-contract.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `313e04a7` / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-gap-int-transcript-01-cutover-contract-mw-privacy-int.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

## Pins（原值全抄 · retained 写死）

| Pin | 值 |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503**（冻结 · GAP-PRIV-02 `:58`） |
| backlog `:60` GAP-PRIV-04 | **OPEN**（本地行级证据 ≠ close · Qdrant 未登记为可证明擦除 sink） |
| backlog `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION | **OPEN**（stub≠cloud · `cloudVendorDeleted=false` · NB-3） |
| UC-052 | **partial**（≠ covered ≠ INT-TRANSCRIPT-01） |
| INT-TRANSCRIPT-01 | **blocked**（checklist `:173`「这**不**授权 `INT-TRANSCRIPT-01` 生产 cutover」· `:169`「00 不授权 01 生产写入」） |
| `INT-P0-RAW-QUEUE` | **open**（legacy `/turn` plaintext payload 不可洗） |
| 七类 TC | **planned/unmapped** |
| PG LISTEN / Redis | unchanged（**无关本刀** · MOP03 面保留口径） |
| coveredCount 扩面 | **无**（本刀零 matrix edit · covered 不动） |

## Scope（待审 · e2e/HA 视角）

docs-only REQUEST：INT-TRANSCRIPT-01 生产 cutover 准入合同立卷（harness §2b 六门 + §2b-0 结构前提）。待审要点：**立卷≠授权**（MOP03 六门先例同构 · Ban 借立卷宣称 cutover ready / Ban 预授权任何一门）· 门 5 公平重放/幂等三项判据在**真实 HTTP/SSE/RLS 组合根**的可证明性（同 key 同体回放幂等 / 同 key 异体冲突显式拒绝 / 同题双 tab 恰一 winner · `:176` 原文）· 0128 dispatch fairness 预览级证据 **≠** 生产组合根证据（checklist `:175`「公开预览下 OCR 组合根仍关」）· 七类 TC planned/unmapped 与 `TC-public-preview-01-main/E1…E6` 不因立卷翻行（`:154`/`:173`）· EXIT 契约（attempts 全录 · 诚实失败 · Ban retry-to-green · 单次 attempt 窗口 · EXIT0 ≠ cutover ≠ suite green · Line C 口径）· HA 语义（NOT_HA / claimProductionHA=false 不动 · DELETE=503 冻结）· PG LISTEN/Redis 无关本刀零改（MOP03 successor 面 PG LISTEN retained 口径不位移）· `INT-P0-RAW-QUEUE` 保留 open（0126 围栏 + dual-write 切换图为 §2b-0c 前提）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · Ban `pnpm db:up` · **Ban 预授权六门任一** · **Ban 宣称 cutover ready** · Ban 把立卷写成授权 · Ban INT-TRANSCRIPT-01 flip/blocked 摘除 · Ban 公开 DELETE 开放（503 冻结）· Ban 0129 preview 回执写成完成 · Ban rehearsal purge 称删除闭环 · Ban `:58`/`:60`/`:64` flip · Ban UC-052 covered flip · Ban coveredCount 变动 · Ban SSOT edit · Ban `INT-P0-RAW-QUEUE` 洗白 · Ban 七类 TC 映射/翻行 · Ban 预览级证据顶替生产组合根证据 · Ban 四专家审降级/代指派（D3）· Ban PG LISTEN/Redis 改动 · Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual review — `mw-e2e-ha`（2026-10-07 · docs gate only · evidence-honesty / E2E 面）

**审域**：六门可执行判据逐门核 + 现状诚实清单实线核 + E2E 证据根裁决。本审 0 prove 执行 · 0 coding · 0 SSOT · 0 push · append-only 仅本 stub · alone ≠ dual。

**对象核验**：被审 REQUEST 直接哈希 `397f3ec` 不在 `origin/feat/mysql-schema-skeleton` 祖先链；origin 链（tip `6b61b734`）载 **patch-id 全等孪生 `c173ee0f`**（同父 `313e04a7` · 树 `8ac5a976` 双侧一致 · patch-id `9d52d8ea` 双侧亲算全等）→ 内容零漂移，本审以孪生内容为被审对象（OB-EH-1 · 落链登记归协调方）。REQUEST diff = 恰 4 md **+286/−0** · 零非 md · 零 SSOT · 零 sibling AN · docs-only 亲证（`313e04a7..6b61b734` 全程 md-only）。本 stub 自 REQUEST 后零触碰（41 行 byte-intact）。

**检查表**（✓ = 亲证）：

| # | 项 | 结果 |
|---|----|------|
| 1 | 六门逐门可执行判据（门1 0091 生产级 key 管理/轮换/JWS 验签组合根 · 门2 逐外部 sink vendor real-delete · 门3 INT 向量 sink 作用域键+Qdrant 登记+`0091` receipt 对齐 · 门4 公开 DELETE 开关合同+独立审 · 门5 公平重放/幂等 · 门6 BUG-REV-COND 四专家审） | ✓ 每门判据落到可 prove/可审的具体主张（§2b）+ 各带现状锚（`:167`/`:64`/`:60`/`:58`/`:175`/`:100`），无空洞门、无达标宣告 |
| 2 | **门5 E2E 级裁决** | ✓ 裁：证据根 = **真实 HTTP/SSE/RLS 组合根**（checklist `:176` 原文 + §2b-0b 绑定）；**in-process（supertest 式 in-process app、直接 service/仓储层调用、scripted seam、0092/0096 rehearsal 面、0128 预览级公平性证据）不足以过此门**；「双 tab 恰一 winner」须**两个独立并发 HTTP/SSE 会话**（Ban 串行两次调用充数）；预览级顶替已被 §2b/门5/stub Ban 显式禁 → C-EH-1 钉死 |
| 3 | **门4 独立 prove + 专家审** | ✓ backlog `:58`「独立 prove + 专家审批准前**不得放开**」由合同收紧为「独立 prove + ≥ mw-privacy-int + mw-e2e-ha dual · Ban 自批」+ 503 pin 先行入账 + 0129 `preview_incomplete` 保持 + **单一明确开关 Ban 多入口**（收紧非弱化 → C-EH-2） |
| 4 | 现状诚实清单 H1–H13 逐条实线核 | ✓ `:154`（其余方法 onRequest 前置门固定 `503 public_preview_read_only` · `TC-public-preview-01-main/E1…E6` planned/unmapped）· `:167`（无部署密钥 · 无真实组合根回执 `releaseEvidence=false` · checkpoint 仅恢复 pending graph）· `:169`（00 不授权 01 生产写入 · 0092/0096 rehearsal 与预览 `/answers` 都不是公开 01 write route）· `:173`（0129 回执**固定未完成** · 七类 TC planned/unmapped · legacy `/turn` 仍写 plaintext job payload = `INT-P0-RAW-QUEUE` 不可洗 · 0091 不做 JWS 验签/worker 走 0077/HTTP 未接线 · 远程 PG Ban `db:up` · 「这**不**授权 01 生产 cutover」）· `:174`（0126 围栏 · 01 保持 blocked）· `:175`（preview `/answers` 受控写 · **公开预览下 OCR 组合根仍关** · 0129 公开预览下仍 503）· `:176`（两道不可拆 release gate · 真实 HTTP/SSE/RLS 组合根 · 三项重放语义）· `:1179-1184`（PRIV4 本地行级证据 ≠ `:60` closed ≠ 云端删除）· backlog `:58`/`:59`/`:60`/`:64`/`:68`/`:100` 逐行吻合 · **零洗白** |
| 5 | 立卷 ≠ 授权 | ✓ §1/§7/§8 三处写死（Ban 预授权任一门 · Ban cutover-ready · Non-claims 全清单）；六门无一被标达标；门6 现状锚诚实声明「本刀双审只是 REQUEST 级 docs gate，**不是**门 6」 |
| 6 | Pins 原值 | ✓ haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `:60`/`:64` OPEN · UC-052 partial · 01 blocked · `INT-P0-RAW-QUEUE` open · 七类 TC planned/unmapped · PG LISTEN/Redis unchanged — 与 checklist `:173` pins 行零漂移 |
| 7 | named ≠ 授权（I2 先例）+ EXIT 契约 | ✓ §4 八条 named proves 全「本 REQUEST **不跑**」· 生产组合根证「不命名 · 不授权」· §5 attempts 全录/诚实失败/Ban retry-to-green（`:68` 先例）/单次 attempt 窗口/EXIT0 ≠（cutover/六门关/01 解禁/DELETE 开放/`:60`·`:64` closed/UC-052 covered/HA/releaseEvidence/suite green）全清单 |
| 8 | MOP03 先例同构 | ✓ `harness/gap-mop-03-successor.md:38` §2b 六项准入合同结构对齐 · D3 沿其 D2「不降级」口径 · 两刀互不引用对方开关面（PG LISTEN/Redis 无关本刀口径成立） |

**D1–D3 独立裁决**：

- **D1（六门不加不减）= PASS**。SSOT 要求面 → 六门映射完备：`:176` 两道 gate → §2b-0a/0b · 重放三语义 → 门5 · `:169` 密钥禁令 → 门1 · `:58` → 门4 · `:64` → 门2 · `:60` → 门3 · `:100` → 门6 · 0126 切换图断明文 → §2b-0c · `:59`（GAP-PRIV-03 acceptance）→ §2b-0b。无 SSOT 项被漏；门5 内含 0128 fairness 生产级证据属门内收紧（`:175` 依文）非增门；GAP-PRIV-01 tenant≠RLS 与 SCOR-01/02 排除**不**豁免 RLS 作为门5/§2b-0b 证据根（`:100` 切流 block 原样在案）。维持六门，无需改写合同。
- **D2（vendor 证据形态留白）= PASS**。禁令为**类别级**（非 vendor 侧可复核证据一律不得顶替），三例（local_isolated_stub / `external_confirmed` NB-3 / docs 自述）为示例非穷尽白名单；正面形态留未来 cutover REQUEST 定义 + 双审可接受（C-EH-4 收口）。
- **D3（四专家名单留 AUTHORIZE）= PASS**。`:100` 原文确未列名单；「不降级 + 名单留 AUTHORIZE」解读保持下限 ≥ 既有双审再加两席，Ban 降级为双审即切、Ban 代指派，沿 MOP03 D2 先例，可执行。

**Fail-trigger audit**（触发即 FAIL 六项 · 逐项查无）：①六门弱化/任一门预授权/cutover-ready 叙事 — 无（§1/§7/§8 + 各门现状锚全为未达标口径）②诚实清单洗白（preview 回执写成完成 / `/turn` 洗成停用 / 七类 TC 映射 / UC-052 covered / `:58`·`:60`·`:64` flip）— 无（检查表#4 全实线核零漂移）③Pins 漂移 — 无 ④证据根降级（门5 放行 in-process/预览级）— 无，且本审以 C-EH-1 把 E2E 级读法钉死 ⑤越界（SSOT / sibling AN / 产品码 / scripts）— 无（+286/−0 恰 4 md）⑥程序违规（self-approve / 代签 peer / push）— 无（peer stub 末行仍 PENDING · 本审 append-only 本 stub · 禁 push）。

**Blockers**：0。

**Non-blocking**：
- **OB-EH-1**：REQUEST `397f3ec` 不在 origin 分支祖先链，origin 链载 patch-id 全等孪生 `c173ee0f`（同父 `313e04a7` · 树 `8ac5a976` 一致 · patch-id `9d52d8ea` 双侧亲算全等）· 内容零漂移；落链/SSOT 登记归协调方 nail 阶段（C-EH-7）。
- **OB-EH-2**：门1「轮换流程有逐次证据」的证据形态（轮换次数、回执样式）未定死 — 属未来 cutover REQUEST 定义面（与 D2 同构），门判据本身可执行（逐次证据 + 组合根 issue→verify→receipt 全链路已写死），非阻断。

**Conditions**：
- **C-EH-1（门5 证据根 · E2E 级）**：门5 三项（同 key 同体回放幂等 / 同 key 异体冲突显式拒绝 / 同题双 tab 恰一 winner）+ 0128 dispatch fairness 的唯一合格证据根 = **真实 HTTP/SSE/RLS 组合根**——out-of-process 真 HTTP server + 真 SSE 流 + RLS 开启的远程 Postgres（环境变量注入 · Ban `pnpm db:up`）；**in-process 调用（supertest 式 in-process app、直接 service/仓储层调用、scripted seam、0092/0096 rehearsal 面、0128 预览级证据）一律不足以过门 5**；「双 tab 恰一 winner」须两个独立并发 HTTP/SSE 会话，串行两次调用不算数；未来 cutover REQUEST 的门5 prove 按此执行，预览级顶替 Ban（合同原文 + 本 Condition 双重钉）。
- **C-EH-2**：门4 放行前置 = 独立 prove（含 DELETE=503 pin 先行入账）+ ≥ mw-privacy-int + mw-e2e-ha dual 专家审 + Ban 自批 + 单一明确开关（Ban 多入口绕行）；0129 `preview_incomplete` 语义直至开关合同满足。
- **C-EH-3**：D1 落地 — 六门不加不减维持；任何未来增删门须显式改写本合同 + 双审，Ban 口头扩面/缩面；GAP-PRIV-01/SCOR 排除不豁免 RLS 证据根义务（`:100` 切流 block 不动）。
- **C-EH-4**：D2 落地 — 未来 vendor 证据形态定义须产出 **vendor 侧可复核工件**（Ban 实现方自述/无交叉核 console 截图顶替）并经双审；三例禁令按类别执行非穷尽。
- **C-EH-5**：D3 落地 — 四专家名单由协调方 AUTHORIZE 指派；下限 ≥ mw-privacy-int + mw-e2e-ha + 再两席；Ban 降级、Ban 代指派。
- **C-EH-6**：本 PASS 仅 REQUEST 级 docs gate 一票 — alone ≠ dual，不代签 peer `mw-privacy-int`；不预授权六门任一；PASS ≠ AUTHORIZE ≠ coding ≠ prove ≠ cutover；INT-TRANSCRIPT-01 stays blocked；Pins 原值 held 零漂移；EXIT0 ≠（§5 全清单）在未来执行期持续绑定。
- **C-EH-7**：OB-EH-1 lineage — 协调方 nail 阶段落链时以 patch-id `9d52d8ea` 复核 `397f3ec` ≡ `c173ee0f` 且合并零内容漂移。

**三行中文摘要**：
1. INT01 立卷合同六门判据逐门核可执行：门5 公平重放/幂等裁真实 HTTP/SSE/RLS 组合根为唯一证据根（in-process/预览级不足过门、双 tab 须两独立并发会话，C-EH-1 钉死），门4 收紧为独立 prove + dual + Ban 自批，门6 四专家不降级、名单留 AUTHORIZE。
2. H1–H13 现状诚实清单逐条 SSOT 实线核（`:154`/`:167-176`/`:1179-1184` · backlog `:58`-`:100`）零洗白：preview 回执固定未完成、legacy `/turn` plaintext=`INT-P0-RAW-QUEUE` open、七类 TC planned、UC-052 partial、`:60`/`:64` OPEN、releaseEvidence=false 全 held；Pins 原值零漂移。
3. D1 六门不加不减 / D2 vendor 形态留白·顶替禁入 / D3 名单留 AUTHORIZE 三裁全 PASS；0 Blocker · C-EH-1~7 · OB-EH-1 孪生落链归协调方 · alone≠dual 不代签 mw-privacy-int · docs gate only 零 prove 零 coding 零 SSOT 零 push。

Verdict: PASS

---

## POST-PROVE dual review — `mw-e2e-ha`（2026-10-07 · docs gate only · evidence-honesty / E2E 面 · POST-PROVE 补席）

**被审对象**：EXEC 提交 **`a1fd61a2`** / `a1fd61a2d1004496d256b9f7bf55d7e4c077648f`（branch `line/int01-cutover-contract` tip · parent = origin tip `9f399f55` · author `mw-core`）——INT01 立卷合同 lifecycle `draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`** docs-only 推进。本审独立 worktree `rv/int01p-e2e-ha`（自 `origin/feat/mysql-schema-skeleton` `9f399f55` 切出 · 零 git 写操作出此 worktree · 禁 push）。0 prove 执行 · 0 coding · 0 SSOT · append-only 仅本 stub · **alone ≠ dual · 不代签 `mw-privacy-int`**（其 POST 审并行独立、互不可见互不引用）。

**包完整性机检**（✓ = 亲证）：

- ✓ 恰 **2 md** touched（`gap-int-transcript-01-cutover-contract.slice.md` + `harness/gap-int-transcript-01-cutover-contract.md` 均 M · 0 A 0 D）· **零非 md** · 零产品码 / migrations / `package.json` · **零 SSOT**（backlog/matrix/checklist 零改）——`git diff --name-status 9f399f55 a1fd61a2` 亲证。
- ✓ 双审 stub 零 diff：`git diff 9f399f55 a1fd61a2 -- ai-docs/delivery/reviews/` = **0 行**。
- ✓ 本 stub PRE 段（`58466c836d910ff6a1c120c6ae9450cc7a250fac` ≡ 镜像 `b4bcff45`）**append-only byte-intact**：`git diff 58466c836d91 a1fd61a2 -- <本 stub>` 空输出机检。

**C-EH-1~7 逐条裁决（对 exec §9 EXEC 登记 Conditions 落点逐条对读）**：

| Condition | 裁决 | 证据 |
|---|------|------|
| **C-EH-1** 门5 唯一证据根 | **零弱化 · PASS** | §9 行全要素在位：唯一合格证据根 = **真实 HTTP/SSE/RLS 组合根**（out-of-process 真 HTTP + 真 SSE + RLS 开启远程 Postgres · Ban `pnpm db:up`）；**in-process（supertest 式 app / 直调 service/仓储 / scripted seam / 0092/0096 rehearsal 面 / 0128 预览级证据）一律不足以过门 5**；「双 tab 恰一 winner」须**两个独立并发 HTTP/SSE 会话**、串行两次调用不算数；「合同原文 + 本 Condition 双重钉」——门5 判据 §2b 原文经 `sed '/^### 2b\./,/^## 8\./'` 区间 diff = 空 **byte-identical** 机检，exec 未动判据原文 |
| **C-EH-2** 门4 收紧 | **零弱化 · PASS** | §9 行：独立 prove（DELETE=503 pin 先行入账）+ ≥ mw-privacy-int + mw-e2e-ha dual 专家审 + Ban 自批 + 单一明确开关 Ban 多入口绕行 + 0129 `preview_incomplete` 直至开关合同满足——全要素与 PRE C-EH-2 一致 |
| **C-EH-3** D1 落地 | **零弱化 · PASS** | §9 D1 行：六门不加不减 = ACCEPT/PASS；未来增删门须显式改写合同 + 双审、Ban 口头扩面/缩面；GAP-PRIV-01/SCOR 排除**不**豁免 RLS 证据根（`:100` 切流 block 原样在案） |
| **C-EH-4** D2 落地 | **零弱化 · PASS** | §9 D2 行：形态留白 + 顶替禁令**类别级**写死；未来形态定义须产出 **vendor 侧可复核工件**、Ban 实现方自述 / 无交叉核 console 截图顶替 |
| **C-EH-5** D3 落地 | **零弱化 · PASS** | §9 D3 行：不降级 · 下限 ≥ 双审再加两席 · 名单归协调方 AUTHORIZE 指派 · Ban 代指派 · Ban 降为双审即切 |
| **C-EH-6** EXIT0 非执行期绑定 | **零弱化 · PASS** | §9 行明写「**§5 EXIT0 ≠ 清单在未来执行期持续绑定**」；§5 EXIT 段 byte-identical 机检；**exec 后零新增执行期绑定宣称**：lifecycle 仅写 `executed:awaiting_post_prove_dual` 而非 `post_prove_dual_pass`（POST 状态未自签）；新增 **Ban self-write `post_prove_dual_pass`** 属收紧非弱化；SSOT 零改 → 零执行期绑定落地物 |
| **C-EH-7** lineage 复核归协调方 | **引用如实 · PASS** | 义务正确**保留给协调方 nail 阶段**（exec 未代偿该复核）；exec provenance 引用逐项亲证：`397f3ece` parent `313e04a7` tree `8ac5a976` · `c173ee0f` parent `313e04a7` tree `8ac5a976` 双侧一致 · patch-id 双侧亲算 **`9d52d8ea89339741a62f72412727e4e70df9d22f`** 全等 · `c173ee0f` 确为 origin tip `9f399f55` 祖先（`merge-base --is-ancestor` EXIT0）→ 「自动 drop 落 tip」宣称**机械成立** · PRE 引用 `70e95caf`（mw-privacy-int 实存 · PASS）镜像 `0cee4f18`、`58466c836d91` 镜像 `b4bcff45` 均在链亲证——「均已收 origin」**如实** |

**携带口径诚实性**：§9 末行注记自曝「派单写 C-EH-1~5 随卷携带、实审 Conditions 为 C-EH-1~7、按**超集全携带**」——如实披露而非静默缩水，零弱化 ✓。

**立卷完整性复验**（六门 + 两道 release gate + H1–H13）：

- ✓ §2b 六门 + §2b-0a/0b/0c 结构前提（checklist `:176` **两道不可拆 release gate** 原文钉）`9f399f55` vs `a1fd61a2` 区间 diff = 空 **byte-identical** 机检。
- ✓ **H1–H13 诚实清单 byte-identical 零洗白**：preview 回执固定未完成（H2）· legacy `/turn` plaintext = `INT-P0-RAW-QUEUE` open（H5）· 七类 TC planned/unmapped（H6）· UC-052 partial（H7）· `:64` OPEN / `cloudVendorDeleted=false`（H9）· `:60` OPEN（H10）· `releaseEvidence=false`（H4 等）全 held。
- ✓ §5 EXIT / §6 Pins / §7 Ban / §8 Non-claims 本体全 **identical** 机检；slice Pins 行 + Named-proves→Ban 块 identical；slice 全 diff 仅 4 hunk 亲列（`1c1` header · `3c3,5` Status+historical · `25a28,31` EXEC 登记 · `43c49` footer）= 纯 lifecycle 面，零判据面触碰。
- ✓ privacy C-1（§4 将 `pnpm mem00-int00:prove-path`（#103）标「已存在」而该脚本在被审 base 不在任何 package.json）由 exec **如实登记修正义务且不改立卷原文**——诚实处理非掩盖非静默修正；义务随卷（nail 阶段强制 · 本刀 named-not-run 不阻 Verdict）。

**Fail-trigger audit**（POST 六项 · 逐项查无）：① exec 弱化任一门/任一 Condition — 无（byte-identity 机检 + C-EH-1~7 逐条对读）② H1–H13 洗白 — 无 ③ Pins 漂移 — 无 ④ POST 状态自签 — 无（`awaiting_post_prove_dual` + 新增 Ban self-write）⑤ provenance 虚引 — 无（4 组 SHA / tree / patch-id 全部亲算吻合）⑥ 越界（SSOT / 产品码 / sibling stub / push）— 无（恰 2 md docs-only · 双 stub 零 diff · 本审禁 push）。

**Blockers**：0。

**Conditions**（随卷重申 · 对未来 nail / cutover 持续绑定）：

- **C-EH-1~7 原文全量维持**（PRE 段 Conditions + §9 落点已核零弱化）；其中 **C-EH-1**（门5 唯一证据根）、**C-EH-6**（EXIT0 非执行期绑定）、**C-EH-7**（协调方 patch-id 复核义务）为本 POST 审重点复核项，继续全额绑定。
- **C-EH-7-POST**：协调方 nail 阶段落链时仍须以 patch-id `9d52d8ea` 复核 `397f3ece` ≡ `c173ee0f` 且合并零内容漂移——本 POST 审只核 provenance 引用如实，**不代偿该复核**。
- **C-1 携带**（privacy 修正义务）：nail 阶段须把 §4 `pnpm mem00-int00:prove-path` 格改注「属 #103 INFLIGHT、合入后方可称已存在」。
- **POST PASS ≠ AUTHORIZE ≠ post_prove_dual_pass 落章**：本 PASS 仅 REQUEST 级 docs gate 一票（POST-PROVE 补席）；`post_prove_dual_pass` 状态须待双审各自独立落 stub + 协调方 AUTHORIZE，**Ban self-write**；INT-TRANSCRIPT-01 **stays blocked**；六门任一未裁；公开 DELETE=503 冻结；`INT-P0-RAW-QUEUE` open；Pins 原值 held。

**三行中文摘要**：

1. exec `a1fd61a2` 为 docs-only lifecycle 推进（恰 2 md · 零 SSOT 零产品码 · 双 stub 零触碰 · PRE 段 byte-intact 机检亲证），lifecycle 只写 `awaiting_post_prove_dual` 未自签 post 状态且新增 Ban self-write `post_prove_dual_pass`，属收紧非弱化。
2. C-EH-1~7 逐条对读 §9 落点零弱化：门5 真实 HTTP/SSE/RLS 组合根唯一证据根 + in-process/预览级禁入 + 双 tab 两独立并发会话全额在位；EXIT0 非执行期绑定重申且 §5 byte-identical；lineage patch-id 复核义务保留协调方且 exec 四组 SHA/tree/patch-id 引用双侧亲算全等（`9d52d8ea8933…` · 树 `8ac5a976` · `c173ee0f` 确为 origin tip 祖先，自动 drop 机械成立）。
3. 六门 + 两道 release gate + H1–H13 + Pins + EXIT + Non-claims 全 byte-identical 零洗白；0 Blocker；携带口径（1~5 vs 1~7）如实自曝超集全携带；POST PASS 仅 docs gate 一票，01 stays blocked，alone≠dual 不代签 mw-privacy-int，禁 push。

Verdict: PASS
