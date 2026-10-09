# NEGRESFIX 探针报告（定谳取证 · 只读零 run · 2026-10-09）

## 裁决摘要
G7TRIO-2 CMD3 步 10 neg:resume 12/87 红：**12/12 全为 (a) driver 期望形状漂移；(b) 产品回归 0 条**。单一 locus = `apps/api/test/neg-resume.proof.ts` 断言面滞留于退疫前契约。

## 时间线（git 考古）
1. `3c87bfa7`（2026-07-14）spec 创建，断言当时真同步硬删除语义。
2. `3f5bdc80`（2026-08-18）`remove()`/`deleteResumeData()` 同 commit 换 fail-closed 503 桩（`resume_erasure_migration_in_progress` 首现·pickaxe 亲证），同 commit 改 spec §10 但**未回和** §8 删除族 6 条与 §1 图片同意门 2 条。
3. neg:all fail-fast 序（auth→commerce→resume）使 resume 族在 G7TRIO era 从未行使；NEGCOMM-1 修复 commerce 后（本 run 84 全绿），12 条**预存红首次暴露**=「locus 移位」真因。
4. 红非新发：godfn-1d 收据 `receipts/godfn-decompose/1d/2026-10-07-exec-receipt.md:80` 已账 `neg:resume EXIT=1（12/87）base≡red 签名 IDENTICAL`。

## 分类表（12 行·期望=spec 断言·实际=静态读码+同 run 步 9 绿断言互证）
| # | 断言 | 期望 | 实际 | 产品侧 | 同 run 绿反证 |
|---|---|---|---|---|---|
| 1 | 图片未同意 403 计费前拦 | 403 | 422 `image_ocr_unavailable` | resume.service.ts:85 能力门先于 :93-96 consent 门先于 :98 计费 reserve（pin「计费前即拦」意图完好） | validate.ts:396 |
| 2 | 图片 error=consent_required | consent_required | `image_ocr_unavailable` | 同上 | spec §11 :309-312 同文件已接受降级分支且本 run PASS（内部自证漂移） |
| 3-8 | DELETE /resume/:id 族 ×6 | 404/200/幂等 404 | 503 `resume_erasure_migration_in_progress`（不按存在性分叉） | resume.controller.ts:41-45 → resume.service.ts:278-280（恒 503） | validate.ts:546/548 |
| 9-12 | DELETE /privacy/resume-data 族 ×4 | 200+resumesRemoved/ocrTracesRemoved/ocrInvocationsRemoved | 503（controller @HttpCode(503) 钉死·旧返回形状随同步删除退役） | privacy.controller.ts:57-61 + privacy.service.ts:65-67 | validate.ts:553/556 + privacy-erasure-http.proof.ts:64 |

## 与已 nail 契约零冲突
G7FIX-4 finalize 契约属 interview 域；consent 契约（POST /privacy/consent 幂等/隔离/401）本 run neg:resume 内全 PASS；文本路径 consent 403 亦绿。12 红全落 resume 删除/擦除+图片能力门序域。

## 归域建议
driver-fix 刀（零产品码）：单文件三断言块对齐已钉 fail-closed 契约。预估算 1 文件 ~12 条 A() + 相邻前置行（~40 行面）、单 run 可验。
