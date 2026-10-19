# meetwise 用户决议包（定稿·正式呈报）

- 定稿：2026-10-17 · 用户决议包定稿席（草稿 `.tmp/user-decisions-draft.md` 六项·按届实况亲证更新·只读未触产品码·未 push）
- 届实况亲证（相对草稿的更新，全部本席亲测）：
  1. **主线 tip 届值＝`7d71a64f`**（2026-10-17 17:20 +0800「docs(backlog): 并入 e2e 审计六件登记」·git fetch 亲证·草稿引值 `2c257eb0` 已成 tip 祖先）；main tip 仍 `112e6d26`（#109 未并入）。
  2. **BV 已 nail 落主线**：`ab3ab9c9`（nail·#244/#245/#246·批表 +3·P2-1 归用户）为届 tip 祖先（merge-base --is-ancestor 亲证）——boot-validate fail-fast（`resumeSecretProblems` prod 短钥拒启）**已上线主线**，P2-1 双钥核查由「部署注意」升格「部署前必过闸」，**更紧迫**。
  3. **幽灵脚本已修**：nightly 召回金标门改接 `qbank:retrieval:eval` + recall 步前置 `touch .env`（`00035a59`+`2ab86a3d`，并线形 `847a0516`·均 tip 祖先亲证）——`nightly.yml:48-55` 亲证：`DASHSCOPE_EMBED_API_KEY` secrets 钩已就位，未配→warning+skip，**配置后即真跑金标**。
  4. **五刀已 nail 落主线**（均 tip 祖先亲证）：progress-write `2c257eb0`（merge `99770ff0`）·WSS `61bac850`/`aaa68704` ·requeue `92086586`（merge `2c2061f6`）·AG-16 `0e601e7d`（merge `27e38330`）·backlog 六件登记 `87b8dc22`+`7d71a64f`。
  5. **CI 全绿 ×5+**：面板口径 YES×5（`38955809462`→`38969397319`→`38977711672`→`38980604529`→`39012763120`）+第 6 连 `39016899845`@`2c257eb0` GH 侧亲验 success（step 100=205/0）；本席 gh 另证届 tip 链三波（`847a0516`/`bf453f49`/`7d71a64f`）×三 workflow（ci+deps-audit+ha-probe-multi）＝**九绿**（tip 波 `39020874942`/`39020874897`/`39020874866` 全 success）。
  6. **PR #109**：gh 现测（2026-10-17）＝OPEN·MERGEABLE·**mergeStateStatus=CLEAN**（面板快照「BLOCKED=待裁决」系裁决语义·已刷新）·head=`7d71a64f`=届 tip 恒等——五刀+BV+幽灵脚本修均在 #109 head 链内，**merge 即整体带上主线**。
  7. **批表 216/271（79.7%）**（面板 `mainline.批表` 亲证·BV +3 已含）；门禁④ g7SuiteGreen=false 维持（卡用户三输入）。

---

## 一、G7 三输入（卡门禁④「G7 绿」·g7SuiteGreen=false）

### 1a. BACKUP_BILLING 定价权威值 或 授权卸 backup key（卷 `6dfb0fdd` 两案并陈）

- **现状**：仓根 `.env` 已有 `MODEL_BACKUP_API_KEY`（非空=开关已开）但 BACKUP_BILLING 24 键计数 0——enforce 模式 worker boot 顺次核到 `model-cost-governance.ts:100` 首失败键 `MODEL_BACKUP_BILLING_MODEL` 即 throw `model_cost_invalid_model_backup_billing_model`，进程在任何 suite 前死亡（G7 全量 S1+S3 双红同根在案）；卷 `6dfb0fdd` 状态 `draft:awaiting_pre_exec_dual`·两案未择·择案权=协调方/用户。
- **待裁点**：案 A（补全 24 键权威块·定价权威值须用户提供，⛔席上发明）／案 B（`MODEL_BACKUP_API_KEY=` 置空一行·开关关·`withFailover` 退化单端点诚实登记）——二择一。
- **选项**：①案 A（已持 Bailian/DashScope 权威定价·保留 failover 冗余·一次填准；`PRICE_REVISION` immutable 填前定准）②案 B（无权威价格表在手·一行最快解闸·零定价发明风险）。两案均不触产品码。
- **不解锁后果**：G7 全量 S1+S3 维持 boot 层双红零 suite 到达，门禁④ g7SuiteGreen=false 无收据可议翻转。
- **一键行动建议**：无权威价格表在手→**选案 B**（一行置空即解闸），权威定价到位后再走案 A 补冗余；两案工序均随卷 §1 用户操作单执行。

### 1b. 买云 / 生产环境（HA 生产面）

- **现状**：Ban 买云未解除（D3 报价已钉≠授权·「buy cloud frozen until user yes」）；HA 本地面 9/9 全闭（HA-1~HA-6 @`88459afb` 等）但 `haStatus=NOT_HA` pin 不翻——HALOC-1 阶 C/D 生产面+买云待用户。
- **待裁点**：是否解除 Ban 买云并授权生产环境采购/开通（阶 C/D 云证据面）。
- **选项**：①解除 Ban+预算授权（HA 生产半边与 G7 生产收敛面同启）②维持冻结（HA 停在本地证据面）③部分授权（先最小单副本生产环境试跑阶 C）。
- **不解锁后果**：门禁②「100% HA」生产半边维持 0（NOT_HA 钉死），门禁④的 G7 生产收敛前置同样缺位。
- **一键行动建议**：①解除 Ban+给预算授权，与 1a 案 B 同批解 G7 双前置（本席只呈报，预算额度随裁随钉）。

### 1c. DASHSCOPE 能力三键（可选）

- **现状**：三能力键全缺（G7 全量预检：VISION/ASR/TTS 不在 .env→OCR/语音段按设计 skip·voice-duplex 3×2=6 skip 口径在账）；`e2e-live-capability-env.mjs:16-22` 已接线：键在即启 OCR preview 旗，硬条款=能力键**不得继承 `MODEL_API_KEY`**（须专用键）。
- **待裁点**：是否提供 `DASHSCOPE_VISION_API_KEY`／`DASHSCOPE_ASR_API_KEY`／`DASHSCOPE_TTS_API_KEY` 三键及各自授权范围。
- **选项**：①三键全供（G7 全量零 skip 跑）②仅供部分（缺哪段 skip 哪段·记账如实）③均不供（维持 skip 口径·门禁④按「skip 如实入账」收敛）。
- **不解锁后果**：G7 收据带 OCR/语音 skip 段，套件结论降级于「零 skip 全绿」，语音/OCR 能力面持续无实测证据。
- **一键行动建议**：③先跑（不阻 G7 出首份收据），能力面实测作为二轮增量；若求零 skip 口径则选①。

---

## 二、S 系 9 项 + keyed 真键环境（S7）＋新增：DASHSCOPE_EMBED_API_KEY 配置

- **现状**：S7 keyed 四件 SSOT 可考——`#98+#240`（全栈 E2E+黄金路径）·`#97`（反提示注入）·`#113-keyed` 半（夜间质量门）——checklist :2614「CI MODEL_API_KEY 决策未落前维持排除登记不预支」。**届实况新增**：幽灵脚本已修（更新项 3），nightly 召回金标门 `qbank:retrieval:eval` 接线完成、`touch .env` 断链已补——`DASHSCOPE_EMBED_API_KEY` secrets 钩已就位（`nightly.yml:51`），**未配→skip，配后即真跑金标**；同文件 `MODEL_API_KEY` 钩同形（`:37/:40`，未配→真模型门 skip）。即现有两个独立 secret 决策点，共用 GitHub Secrets 通道。
- **待裁点**：①是否授权「真键环境」＝CI/nightly 注入真 `MODEL_API_KEY`（解锁四件 keyed 面纳入）②是否同批配置 `DASHSCOPE_EMBED_API_KEY`（召回金标真跑·与四件 keyed 面相互独立）。
- **选项**：①授权 nightly 真键（仅夜间质量门用键·per-push 维持无键·额度最省）②授权 per-push+nightly 全量真键（反馈最快·额度最大）③不授权（四件维持排除登记·不计入门禁①）；embed 键：a.同批配置（召回率金标门即刻生效）b.暂缓（skip 口径维持）。
- **不解锁后果**：全栈 E2E/黄金路径/夜间质量门/反提示注入四面 keyed 半无法计入门禁①「E2E 零漏项」，S 系九件整体悬置；召回金标门持续空转（修好的门无米下锅）。
- **一键行动建议**：**选①+a**——nightly 真键+同批配 `DASHSCOPE_EMBED_API_KEY`：一次 secrets 配置动作解锁五面（四件 keyed+召回金标），per-push 零键纪律不动、额度可控。

---

## 三、PR #109 merge 决策

- **现状**：gh 现测（2026-10-17）＝OPEN·MERGEABLE·**CLEAN**·head=`7d71a64f`＝届 tip 恒等；CI 全绿 ×5+（面板 YES×5+第 6 连 `39016899845`@`2c257eb0` 亲验；本席另证 tip 链三波九绿，head 波 `39020874942`/`39020874897`/`39020874866` 全 success）；五刀+BV+幽灵脚本修+backlog 六件登记均在 head 链内；批表 216/271（79.7%）。
- **待裁点**：是否现在 merge PR #109 入 main。
- **选项**：①立即 merge（main 获绿基线·五刀/BV/幽灵修一并上主线·后续波次以 main 为底）②再等在飞（cap-2232/AG-15 等在飞波）一并 merge。
- **不解锁后果**：main 持续无绿基线（main tip 仍 `112e6d26`=#108），对外无可信主线，批表推进只落在支线叙事上；BV fail-fast、幽灵脚本修等已 nail 资产迟迟不达主线交付面。
- **一键行动建议**：**①立即 merge**——CLEAN+九绿在案+链内资产已验，等待只增加漂移面；merge 后随批执行 main FF（见第四项）。

---

## 四、计费开放 2 项 + #199 + B4 终裁 + main FF

| 项 | 现状 | 待裁点 |
|---|---|---|
| 计费开放 2 项 | billing-redesign/LANDING-INDEX §14：15 项中 13 已裁/已答，**仍开放仅余 2** | ①话题定义认可（§11-2）②封顶终值（影子期复核·初值 6）——两值钉后 billing rev 终稿 |
| #199（目标岗位族） | LEDGER :53/:210：同族 #259/#266/#268 已闭，#199 系**部分面·待裁后刀**（H5 已注明「裁后刀不在本刀」） | 对 #199 残面裁修复方向/是否立项后刀 |
| B4 终裁 | 面板待用户组标签；仓内 SSOT（LEDGER/checklist/两 backlog）全文检得「B4」仅门矩阵臂标与审席臂标，**无独立「B4 终裁」对象可考** | 所指待钉：请协调方/用户给出 B4 对象与终裁选项（如实登记缺口·不代钉） |
| main FF | LEDGER :250：main→feat/mysql-schema-skeleton 纯 fast-forward（10-11 时点 1518 提交零分叉亲证）待主层收口批次；现行为=PR #109 通道，**FF 在 merge 之后**（main tip 届值 `112e6d26`） | 是否授权 merge 后将 main 快进/对齐到战役支线 tip（完成 main 绿基线收口） |

- **选项**：计费两项按 LANDING-INDEX 建议值落（话题定义认可现行实现口径+封顶 6 进影子期）；#199 并入下一批域刀顺手收编；B4 待所指钉后随裁；main FF 随 PR #109 merge 同批执行（一事一批）。
- **不解锁后果**：billing rev 无法终稿（量产计费规则悬置）、#199 残面持续占批2 残额、main 收口批次无法闭卷。
- **一键行动建议**：四子项按上表建议值**一次批齐**（计费两值+#199 收编授权+FF 授权）；B4 唯一前置=请用户/协调方先给「B4 所指」一句话定义，钉后随裁。

---

## 五、BV P2-1 现网双钥长度核查（⚠届实况升格：更紧迫）

- **现状**：BOOT-VALIDATE 三件（#244 PREVIEW 三态/#245 signup 半成功消解/#246 启动期密钥校验）**已 nail 落主线 `ab3ab9c9`**（tip 祖先亲证·批表 +3 已入 216）——`resumeSecretProblems` fail-loud **已上线**：prod 短钥部署升级即拒启；而 compose `:?` 只查非空不查长度（届 tip 亲证：`docker/compose.prod.yml:20-21`+`docker/compose.ha.yml:60-61` 仍 `${VAR:?set ...}` 形）——**compose 不挡短钥**，现网双钥长度核查归用户（checklist :3429 口径）。fail-fast 上线 ⇒ 该核查从「部署注意」升格为**每次部署升级前的硬前置**。
- **待裁点**：现网/生产 `RESUME_ENC_KEY`/`RESUME_HASH_SECRET` 两钥是否已各 ≥16 字符——核查并回报（不足则升级前先在云 secret manager 换强钥）。
- **选项**：①现在核查并回报结果（升级前置，只读零风险）②授权部署窗口时随部署前核查（仍须在升级前完成，窗口内动作更紧）。
- **不解锁后果**：下次部署升级时 prod worker 因短钥 fail-loud 拒启，形成部署事故窗口（且因 fail-fast 已上线，该风险为**确定性触发**而非概率性）。
- **一键行动建议**：**①现在核查**——cloud secret manager 查两钥长度并回报；<16 即先换强钥再排任何 prod 升级（全程只读/换钥，不触码面）。

---

## 六、G7W LIVE 判别 run 授权

- **现状**：三针判别面已全数落主线——G7W-TAIL-DEATH 案 A 埋点刀（seg3_* 六码+NDJSON 五帧+批级 wall-clock·`51a06265`）+G7W-DIAG-NEEDLES 加针刀（R2 循环退出帧+心跳中途落盘+红路 tsx stderr 尾量·`2429f53e`）双 ✅（**均届 tip `7d71a64f` 祖先亲证·不灭失**）；判读谱=§9-rev.2 四行矩阵；LIVE 行使权归协调方**两票分立另行授权**（EXEC≠LIVE）——两票已过一票·待授权（协调方口径）。
- **待裁点**：是否授权执行 LIVE 判别 run（花 model key 额度·协调方口径约 30-60 分钟；卷内账本口径 est live≈7/run·沿硬帽 200 另账；两口径并陈不择一）。
- **选项**：①授权恰 1 run（红=三帧链闭环可回读·绿=帧链并存零干扰——两态均产出 hang 形因最终定谳）②暂缓（判别面在主线不灭失·随时可跑）。
- **不解锁后果**：worker 尾段 hang 形因维持「归因链在卷·实测定谳缺位」（WORKER-HANG-GUARD 自愈刀已落·根因面无 LIVE 收据佐证），`:108` GAP-G7W-API-TAIL-DEATH 行无法终局。
- **一键行动建议**：**①授权恰 1 run**——判别面三针已在主线就位，恰 1 run 两态皆定谳、额度按账本口径另账可控；暂缓只延后必答题。

---

## 附：全部不解锁 vs 全部解锁 —— 北星四门禁影响对照（届值刷新）

- **全部不解锁**：门①E2E 零漏项维持远期（coverage 8·UC 大面积 partial·S7 keyed 四件+召回金标持续排除不计）｜门②100% HA 生产半边维持 0（NOT_HA pin 不翻·本地 9/9 不变）｜门③0 BUG 维持远期（AG 台账 open 17·done 27·half 3）｜门④G7 绿维持 false（boot 双红无收据·三输入缺位）——且 main 无绿基线、billing 终稿悬置、BV 短钥拒启风险确定性在位、G7W hang 形因无终谳。
- **全部解锁**：门④三输入齐→G7 全量复跑出收据→经独立双审可议翻转 g7SuiteGreen；门②生产半边随买云开工（阶 C/D 云证据）→HA 可议；S7 四件+召回金标随双键纳入→门①keyed 面可计；PR #109 merge+main FF→main 获绿基线·五刀/BV/幽灵修整体达主线交付面；billing 两项落值→rev 终稿；#199/B4 裁后→批2 残额清偿通道开启；BV 双钥核查过→部署升级闸清；G7W LIVE run→hang 形因定谳归档——四门禁全部进入「可推进/可议翻转」状态（翻转本身仍须各卷既定独立双审+授权链，不因解锁自动翻）。

---

## 优先级排序（定稿席按届实况排定·呈报用户按序裁）

- **P1［部署阻断面］**：**PR #109 merge**（CLEAN+九绿·一键①）＋**BV 双钥核查**（fail-fast 已上线·部署前硬前置·一键①只读核查）——两项均直通主线交付面与部署安全，先行。
- **P2［门禁④＋终谳面］**：**G7 三输入**（1a 案 B 一行解闸＋1b 买云授权＋1c 可选三键·g7SuiteGreen 唯一解锁路径）＋**G7W LIVE 判别授权**（恰 1 run·hang 形因终谳[HA 终谳]·判别面已在主线就位）。
- **P3［收口面］**：**S7 真键**（MODEL_API_KEY nightly 真键+DASHSCOPE_EMBED_API_KEY 同批·五面一次解锁）＋**计费 2 项**（话题定义认可+封顶 6→rev 终稿）＋**#199**（并入下一批域刀）＋**B4**（待所指一句话钉后随裁）＋**main FF**（随 #109 merge 同批·一事一批）。

---

### 定稿席备注（如实登记）

1. 届实况六项更新全部本席亲测：`git fetch origin` 后 tip=`7d71a64f`；`gh pr view 109` 现测 CLEAN；`gh run list` 三波九绿；批表/门禁口径取 `.tmp/dashboard/state.json`（updatedAt=2026-10-16 第 100+ 波·快照略旧处以 gh/git 现测为准并注明）；compose/nightly.yml 引行号均届 tip 版亲读。
2. 「S 系 9 项」「B4 终裁」两标签出自战役面板待用户组，仓内 SSOT 可考核心分别为 S7 keyed 四件（checklist :2614）与「无独立对象命中」——按实情分记，未代为补全定义。
3. 「两票分立另行授权」（第六项）与「LIVE run 30-60 分钟」系协调方派单口径；卷内权威口径=两票分立另行授权+est live≈7/run 账本口径，两口径并陈不择一。
4. 本席只读定稿：零产品码改动、零 push、零 merge；本文件位于 `.tmp/`（gitignored·不入 git）。
