# PRE-EXEC · Line AN-PRIV-EXT · GAP-PRIV-EXTERNAL-SINK-RETENTION · mw-e2e-ha（docs gate only · Ban coding · Ban count-as-erased · DELETE=503 · alone ≠ dual）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · **不代签** `mw-privacy-int` · **不替代** privacy review）
**Review date**: 2026-10-06 ~20:20 CST（Asia/Shanghai · UTC+8）
**Line**: **AN-PRIV-EXT**（wave AN）
**REQUEST tip**: `59e2189`（`59e21898fd29c8d64897e7414a228c379568e3e6`）· parent `57f92ff`（`57f92ffaa37ecfd628e6e43251a18231d5690f4b` · AK nail）· **match**
**Wave tip read at**: `d269761`（`d26976171ddfa0678b4a42a003fe48a706e9d20e` · `origin/feat/mysql-schema-skeleton` after fetch · REQUEST ancestor ✓）
**Harness**: `ai-docs/delivery/harness/gap-priv-external-sink-retention.md`
**Slice**: `ai-docs/delivery/gap-priv-external-sink-retention.slice.md`
**Stub（本方 · 未改）**: `ai-docs/delivery/reviews/REQUEST-2026-10-06-gap-priv-external-sink-retention-mw-e2e-ha.md`（PENDING · 本文件为独立 PRE 审）
**Peer**: `mw-privacy-int` PRE-EXEC **PASS** `fb6fca2`（`fb6fca2ada0b9afeec974f646242a4b9d7783026` · 文件 `REQUEST-2026-10-06-gap-priv-external-sink-retention-mw-privacy-int.md` · 已读 · **cite only · 不代签 · 不替代 privacy review**）· 本审独立 · alone ≠ dual（双签完成与否由协调方判定）
**本审未跑**: 零 product coding · 零 prove · 零 live · 零 `.env*` · 零 SSOT edit · 零 git config · 零 force-push · 零碰 sibling AN 文件 · 零碰 AG/AI/AK · 零 AN-CIMG-EA

## Hard pins（restated · 不改）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · g7SuiteGreen=**false**

## Docs-only

`git show --stat 59e2189`：**4 markdown**（harness · slice · 2 stubs），零代码 / migration / script / package.json；`git diff 57f92ff d269761 -- ai-docs/delivery/gap-bug-backlog.md` 为空（零 SSOT edit）✓。

## Extract（REQUEST 本体）

| Item | Content |
|------|---------|
| Acceptance（拟） | externals `oss`/`redis`/`langfuse` 在异步确认落地前 **不得** 计 erased；request ≠ `completed`；书面异步确认 / receipt 形状 / fail-closed（超时/拒绝 → 不升 `completed`）对齐 0091 completed guard |
| Prove CMD plan | 拟 `pnpm uc052:external-sink-retention:prove`（**不存在**）或扩展 `uc052:internal-erasure:prove` 外部面 · via `run-e2e-isolated.mjs` · Ban live · 确切 CMD「PRE dual 裁定」 |
| Evidence layer | real PG（isolated）· DB 行状态 + request 终态 + HTTP 503 |
| EXIT contract | EXIT0 ≠ covered ≠ deletion closed ≠ open DELETE ≠ HA；EXIT1 诚实保留 · Ban retry-to-green |
| OPEN | backlog `:64` stays OPEN · UC-052 / privacy 行 stays partial · canHonestlyFlip=false |

## Spot-checks（@ `d269761`）

| Check | Result |
|-------|--------|
| backlog `:64` 原文 =「oss/redis/langfuse 保持 `retention_pending` · request happy=`pending_external` · Ban count-as-erased」· 目标「外部 sink 异步确认/真实 purge 另刀；对齐 0091 completed guard」 | ✓ 与 harness §1 逐字一致 |
| `0096_int_transcript_remaining_sinks.sql:207-215` `FOREACH sink_name IN ARRAY ['oss','redis','langfuse']` → `'retention_pending'` | ✓（0048/0058 同形 · 0096 为最新定义） |
| `0091_privacy_authorization_issuer.sql:516-545` `assert_privacy_erasure_request_completed_guard`：completed iff 全 target `erased` 且无 `external_pending`/`failed_cleanup` · 零 target 拒 | ✓ |
| `privacy-deletion-sink-inventory.md:87` redis/oss/langfuse = 外部 · `pending_external` · 禁伪 completed · **无异步确认执行器** | ✓ |
| `apps/api/src/modules/privacy/privacy.service.ts:53-56` `eraseInterviewData` → `HttpStatus.SERVICE_UNAVAILABLE`（503）· 注释「外部 sink 仍未齐」 | ✓ DELETE=503 未松动 |
| `package.json` `privacy-erasure:http:prove` 存在（503 回归面） · `uc052:internal-erasure:prove` 存在 · `uc052:external-sink-retention:prove` **不存在** | ✓（拟名 · 未授权） |
| 现 prove `packages/db/test/uc052-internal-erasure.proof.ts:302/:478-480` **已断言** externals `retention_pending` + request `pending_external` | ⚠ 见 C-3（stasis 复跑 ≠ 本刀新证据） |
| 0091 既有 receipt 状态机：`receipt_kind ∈ {local_erased, retention_pending, external_pending, external_confirmed, failed_cleanup}`（`:88`）· `privacy_resolve_deletion_receipt`（`:460-508`）external_pending→external_confirmed · **只改 receipt 不改 target.status** · `privacy_record_deletion_receipt`（`:418-449`）**可直接写 `external_confirmed`**（绕开 pending→confirmed 审计链） | ⚠ REQUEST 未 cite · 见 C-4 |
| Ban count-as-erased · Ban open DELETE · Ban invent completed · Ban wash Line B internals · Ban flip UC-050/051/052 | ✓ harness §2/§5 硬钉 |
| MySQL/Qdrant cutover · Redis cutover · MODEL-OP · UC-018 · FULLTEXT 叙事 | ✓ 无（Ban MySQL/Qdrant cutover 明文） |

## Adversarial PRE

- **Fake green**：拟 prove 期望（externals stay `retention_pending` · request ≠ completed · 503）与现 `uc052:internal-erasure` 已断言面重叠 → 若仅复跑现 prove 拿 EXIT0 冒充本刀进展 = 假绿风险。REQUEST 已列「Ban count-as-erased 断言红路径」，以 C-3 钉死须新增红路径。
- **Wrong locus**：异步确认合同须落在 0091 既有 receipt 枚举 + resolve 函数上；另起平行 receipt 形状 = 错落点风险 → C-4。
- **Wash**：Line B UC-052 internal nail 仅 cite · 未洗外部闭环 ✓。
- **Covered invent**：coveredCount=8 · UC-052 partial ✓。
- **DELETE≠503**：零放开 ✓。

## Ban mirrored（from harness/REQUEST）

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· **Ban count-as-erased** · **Ban open DELETE（DELETE=503）** · Ban invent `completed` · Ban wash Line B internals 为外部闭环 · Ban invent covered · Ban flip UC-050/051/052 · Ban SSOT edit of matrix/backlog · Ban MySQL/Qdrant cutover · Ban buy cloud · Ban Meridian · Ban secrets/`.env*` · Ban force-push · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban product/infra code this turn

## Conditions（carry to AUTHORIZE / execution）

- **C-1**：alone ≠ dual；本审不代签、不替代 `mw-privacy-int`（peer PASS `fb6fca2` 仅 cite）。privacy 语义（purge 合法性 / 保留期）由 peer 独立裁定。
- **C-2**：本 PASS ≠ coding ≠ prove ≠ nail ≠ erased ≠ completed ≠ covered；执行须 PRE dual BOTH PASS + 协调方 AUTHORIZE。
- **C-3（e2e 证据层）**：执行前须 **具名** CMD（新 `:prove` 或现 CMD 扩面，写入 AUTHORIZE 记录）；prove 必须含 **新增** 红路径断言，至少：(a) external target 被直接改 `erased` 或缺确认时 request 不得 `completed`（guard 55000）；(b) `privacy_resolve_deletion_receipt` 无 `external_pending` → fail-closed `40901`；(c) DELETE 503 由 `privacy-erasure:http:prove` 回归同列入账。**仅复跑 `uc052:internal-erasure:prove` EXIT0 ≠ 本刀证据**。
- **C-4（contract locus）**：异步确认 / receipt 合同须锚定 0091 既有 `receipt_kind` 枚举与 `privacy_resolve_deletion_receipt`；`privacy_record_deletion_receipt` 可直写 `external_confirmed` 的面 **不得** 被计为外部 purge 证据（交 peer `mw-privacy-int` 判是否须收紧 · 本审不替判）。与 peer `fb6fca2` 非阻塞备注 N2（今日 target `retention_pending` 未必伴随 `receipt_kind=external_pending`，0091 resolve 入口要求后者）方向一致 · 各自独立。
- **C-5**：attempts 预声明 · 全录（Asia/Shanghai + code SHA）· Ban retry-to-green · EXIT1 诚实保留。
- **C-6**：pins 冻结 · backlog `:64` stays OPEN · canHonestlyFlip=false。

## Blockers

无阻塞。抽查：backlog `:64` 原文 · 0096 L207-215 seed · 0091 L516-545 guard · inventory `:87` · privacy.service 503 · package.json CMD 清单 · uc052 internal prove 既有断言 · 0091 receipt 状态机（C-3/C-4 为条件而非阻塞：REQUEST 已声明 CMD 由 PRE 裁定且含红路径）。

## 中文三行摘要

1. REQUEST `59e2189` docs-only 开外部 sink 异步确认/真实 purge 诚实轨；backlog `:64` stays OPEN · DELETE=503 · Ban count-as-erased 硬钉。
2. 锚点核对一致；条件：须具名 CMD + 新增红路径（复跑 internal prove ≠ 本刀）· 合同锚 0091 既有 receipt 状态机 · 直写 `external_confirmed` 不计 purge。
3. 本 PASS = mw-e2e-ha docs 半签；peer `mw-privacy-int` PASS `fb6fca2` 仅 cite（不代签 · 不替代 privacy review）；alone≠dual；≠ coding ≠ prove ≠ erased ≠ HA。

Verdict: PASS（docs gate · Ban coding）
