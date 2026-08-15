---
id: testing_full_format_rag_evaluation
name: 全格式 RAG 摄取、切块与可回溯评测协议
description: 用冻结数据集而非 happy-path 样例选择解析器、chunk recipe、表格序列化、OCR/ASR、检索和重排，并定义发布门。
type: testing
scope: shared
level: spec
status: proposed
owner: qa
related:
  - ../architecture/ai/full-format-rag-ingestion-and-chunking.md
  - rag-retrieval-evaluation-baseline.md
---

# 全格式 RAG 摄取、切块与可回溯评测协议

## 1. 评测对象与反目标

不把“输入一篇干净文本、答案正好在第一段”的 demo 当评测。需要分别测 `extract → structure → chunk → retrieve → cite → answer`；后一层失败不能掩盖前一层错误。

评测不是为了证明某个默认参数正确，而是为了在候选方案之间选择：`parser/layout model × chunk recipe × table serialization × embedding × retrieval/rerank`。每次报告固定 corpus、source version、ACL、recipe、模型 revision、随机种子、候选 K、成本和失败率。

## 2. 数据集合同

每条样本至少含：

```ts
type GoldenCase = {
  id: string;
  split: 'dev' | 'holdout' | 'canary';
  documentGroupId: string;       // 同一原件的改写、截图、转码版本绝不跨 split
  formats: ('pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'audio' | 'video')[];
  query: string;
  outcome: 'answerable' | 'clarify' | 'abstain';
  requiredEvidence: Array<{ documentId: string; contentVersion: number; locator: string; factHash: string }>;
  forbiddenEvidence?: Array<{ documentId: string; locator?: string; reason: 'acl' | 'superseded' | 'injected' | 'conflict' }>;
  answerRubric?: readonly string[];
  slices: readonly string[];
};
```

`requiredEvidence` 必须由双标人从**原件定位**标出，不能先让当前 RAG 命中的 chunk 反推标签。分歧记录而非强行平均；仲裁后的 locator/fact hash 成为 qrels revision。

## 3. 覆盖矩阵（不得只做 happy path）

| 类别 | 最少包含的困难样本 |
| --- | --- |
| PDF/DOCX | 双栏、页眉页脚、跨页标题、脚注否定、扫描件、加密/坏文件、多语言、修订痕迹。 |
| Excel | 多 sheet、隐藏 sheet、合并单元格、公式/显示值不一致、单位/日期格式、空行、跨表 lookup、同名列、超宽/超长行。 |
| PPT | 图多字少、图表数值、speaker notes、标题重复、跨 slide 结论冲突、文本框阅读顺序。 |
| 图文 | OCR 近形字、表格线、旋转图片、模糊金额、截图内 prompt injection、图表趋势与正文不一致。 |
| 音视频 | 双人重叠、口音、术语/英文缩写、静音、打断、时间轴问题、画面文字与口述冲突、撤回同意。 |
| 查询 | 代词指代、错别字、ASR 错词、否定、比较、多跳、多证据、应澄清/应拒答、ACL、旧版本、注入尾巴。 |

## 4. 指标：先测事实链，再测召回

| 层 | 指标（全部报告分子/分母） | 失败意味着什么 |
| --- | --- | --- |
| 安全 | MIME/magic 冲突拒绝率、恶意样本误放行数、跨 tenant 返回数 | 污染/泄露，直接阻断发布。 |
| 提取 | element precision/recall、table cell/header/linkage F1、OCR WER/CER、ASR WER、time/box locator error | 原件事实已经错，不能用 embedding 调参掩盖。 |
| chunk | `locator_resolve_rate`、`structural_boundary_violation_count`、`header_repeat_rate`、`atomic_overflow_quarantined_rate`、重复率/平均 token | 找不到原件或表格/时间轴已被切坏。 |
| retrieval | EvidenceCoverage@k、strict-all@k、MRR、nDCG、ACL-filtered candidate count | “命中一条”不等于找全完成回答所需的证据。 |
| citation/answer | citation precision/completeness、locator exactness、unsupported abstain precision/recall、事实 rubric | 能答不代表接地，引用不能跳到错误版本。 |
| 工程 | P50/P95/P99、解析/embedding/rerank/存储成本、队列失败率、重试/死信、人工 review rate | 质量路径不可规模化或会失控。 |

其中：

- `EvidenceCoverage@k = 找回的 required evidence 数 / required evidence 总数`。
- `strict-all@k = required evidence 全部出现的 answerable query 数 / answerable query 数`。
- `locator_resolve_rate = 成功打开且显示同一事实的 citation 数 / citation 总数`；此项硬门应为 `100%`，因其是确定性契约。
- `structural_boundary_violation_count` 对表格行/单元格、代码块、slide、图 region、媒体时间区间为 `0` 才可发布；过大元素应被 quarantine/review，不允许靠忽略计数过线。

## 5. 阈值与统计纪律

以下是**待产品/数据 owner 以真实风险签字的 proposed gate，不是当前项目已达成绩**：

| 门 | 建议阈值 | 统计前提 |
| --- | --- | --- |
| locator 与 ACL | resolve 100%；跨 tenant/撤销泄露 0 | 全量 deterministic proof + canary 日志。 |
| 结构边界 | violation 0；超预算原子元素 100% 进 review/quarantine | 合成恶意集 + 格式真实样本。 |
| 表格 | 关键标注单元格/表头/行关联 F1 ≥ 0.995 | 每格式/模板切片均有足够人工标注；不能只报总体。 |
| OCR/ASR | 阈值按业务字段分别签字，如金额/日期/专有名词另计，不只看总 WER | 双标 source-level ground truth。 |
| 新 recipe vs 基线 | holdout EvidenceCoverage、strict-all、citation completeness 不低于预注册容忍区间；安全硬门不回退 | 同 query 成对 bootstrap/McNemar；报告 95% CI。 |
| 性能/成本 | P95、失败率、单位文档/查询成本低于预算 | production-sized corpus、并发、冷热缓存分开测。 |

不能因为样本小而报一个夸张的 `97% Recall`。每个百分数须伴随 `n`、分子/分母、格式/查询 slice 和置信区间；同一源的改写必须按 `documentGroupId` 整组划分，避免泄漏到 holdout。

## 6. 实验、发布与回滚

1. 冻结 `source versions + qrels + split + metric code`，为每个候选生成 experiment manifest。
2. 在 dev set 选择 parser、table serialization、chunk recipe、K/RRF/rerank；禁止在 holdout 上反复调参。
3. 对 holdout 一次性跑 extraction、chunk、retrieval、citation、answer 和成本；失败/超时也进分母。
4. 新 generation 只进入 shadow，比较同请求的 evidence/citation/成本；没有通过门不得显示给用户。
5. canary `1% → 10% → 50% → 100%`；每步预注册最小样本、观察窗和停止条件。任何泄露、locator 失败、严重解析错、成本或错误率硬门失败，CAS 回滚到旧 generation。

当前已存在两类确定性控制证明：`pnpm rag-chunking:prove` 覆盖 13 项结构切块不变量；`pnpm rag-corpus-version:prove` 覆盖 **14 条**内容版本、recipe 不可变、generation shadow gate、`1→10→50→100` 发布、冻结 binding、RLS、回滚拒绝、重建租约和跨 retained generation 擦除传播断言。二者均不是上述真实数据集评测，也不能替代 Office/视频 adapter 的真实质量分数、真实 recall 或生产 P95。
