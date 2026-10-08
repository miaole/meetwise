# G7P-5 — start 步 NDJSON 截获 + 断言间 marker 刀（拒启码面定谳）

**状态**：`draft_rev2:awaiting_pre_exec_dual`（rev1 席2 base 错位+席1 三 erratum 合并：base 重钉含 G7P-4 EXEC·wire 实名三支+conflict 面·conflict 归 5xx 向·r.clone() 先记录·thrown-face 措辞·链账归正） · base = **`16b40f0d`+G7P-4 EXEC `26ad1b65` cherry-pick（rev2 重钉——consent 截获面真复用·行锚原样成立·协调方裁席2 方案·分支 tip `c0bd2f4d`）** · 分支 `line/g7-start-capture` · 立项依据 = G7P-4 nail 裁定（死亡窗 F2→F3 双断言·首候选 :347-349 start 原子创建·候选谱=①非 2xx 拒启族＞②noop-shape＞③恒 False 基本排除）。

## 1. 手段（≤6 行+1 marker·零产品码·零 wrapper 改·NDJSON 常驻面复用）
1. `e2e/full.e2e.ts:342-343` start fetch 包 try/catch（同 G7P-4 consent 形态）：appendFileSync `.tmp/e2e-consent-capture.ndjson`（bootId 同法）记录 `{bootId, step:'app_start', status, elapsed_ms, body:<JSON.stringify 截 200>}`——**先 `r.clone().text()` 记录后 readJson**（readJson 消费 body 且永不抛·http.ts:4-10——席1 处方）；
2. 断言间加 1 marker：`reviews.record({class:'worker',code:'seg2_start_assert_post'})` 于 :349 后 :350 前——分辨 :347-349 vs :350-353 哪条断言死（席1 erratum(b) 落实）；
3. 幂等臂 :350-353 fetch 同法记录（同一 try/catch 或独立一行记录）。
- fs 用步内动态 import（G7P-4 同法）·mkdirSync 防御沿用。

## 2. 跑法与预注册判读
恰 1 run：`pnpm e2e:isolated`。sidecar v2 实测臂（est ≤25·硬帽 200·G7P-4 后链累计精确口径 0+0+14（G7P-4 nail 实账））。判读（capture 记录优先）：
- **409 码面（wire 实名三支+conflict）**：`resume_not_ready`/`application_binding_invalid`/`interview_ineligible_route`（service.ts:43/:45/:50 wire 名）+23505→409 `{error:'conflict'}`（filter:22）⇒ 拒启码面定谳 ⇒ 修复刀定靶该分支；
- **500 {error:'internal_error'}**：`application_start_conflict`/`interview_ineligible_route` 裸 throw（recruiter.ts:435/:439→filter:25 mask 500·码仅服务端日志——sidecar/api 日志取证）⇒ 服务端炸面；
- **5xx** ⇒ 服务端炸（start 链 DB/RLS 面——0150 已修 uuidv7 但 start 链或有余留）⇒ 定靶服务端；
- **200 但 shape 缺**（noop-shape）⇒ 断言面候选②定谳 ⇒ driver 断言修/服务契约面；
- **200 shape 全绿且断言过** ⇒ 死点=:350-353 幂等臂（marker 区分）⇒ reused 路径面另探；
- **thrown-face 记录（e.name/code/cause.code）+rethrow** ⇒ 连接层 (c) 轴定靶；真无记录=NDJSON 写失败/进程早死（单列如实登记）。
五向如实禁洗绿禁重跑至绿。

## 3. Ban
零产品码（apps/packages src 零改）·e2e/full.e2e.ts 改 ≤7 行且仅 start 步·helpers/wrapper/解析器零触碰·Key 只经进程 env name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
恰 1 run EXIT 原值+NDJSON 记录转录+marker 分辨结论+diff 行数亲证+收据 `ai-docs/delivery/receipts/g7p5-start-capture/`·node --check 过。

## 5. Non-claims
本刀 ≠ G7 修复 ≠ `:107` 翻转 ≠ trio 面·码面到手后修复刀另立全链。
