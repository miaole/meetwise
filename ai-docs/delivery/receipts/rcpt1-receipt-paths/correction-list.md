# RCPT-1 修正清单（机器生成·59 条唯一路径·旧→新·逐条 ls 亲证）

生成基线：HEAD=5fad59ee（修正前）·区间 `scripts/run-e2e-isolated.mjs` :93-1640（isolatedReceiptSources 段）。
替换前区间内：陈旧行 165 行 / 236 处 / 唯一陈旧路径 59 条（另有真子目录 `packages/db/src/tenant/index.ts` 1 条原样保留未改，:998）。
勘误：DBFK-1 nit 口径 58 处 → 双席实测 **59 条唯一路径**（236 处出现），以本清单为准。所有 59 条 ls 亲证 = OK，零发明路径、零 MISSING。

| # | 旧路径（陈旧子目录前缀） | 新路径（平铺实文件） | 区间出现次数 | ls 亲证 |
|---|---|---|---|---|
| 1 | `packages/db/src/commerce/commerce.ts` | `packages/db/src/commerce.ts` | 20 | OK |
| 2 | `packages/db/src/qbank/qbank-ingest.ts` | `packages/db/src/qbank-ingest.ts` | 16 | OK |
| 3 | `packages/db/src/qbank/qbank-generation-retrieval.ts` | `packages/db/src/qbank-generation-retrieval.ts` | 13 | OK |
| 4 | `packages/db/src/privacy/privacy-authorization.ts` | `packages/db/src/privacy-authorization.ts` | 11 | OK |
| 5 | `packages/db/src/model-op/ai-cost-governance.ts` | `packages/db/src/ai-cost-governance.ts` | 9 | OK |
| 6 | `packages/db/src/resume/resume.ts` | `packages/db/src/resume.ts` | 9 | OK |
| 7 | `packages/db/src/interview/interview-jobs.ts` | `packages/db/src/interview-jobs.ts` | 8 | OK |
| 8 | `packages/db/src/model-op/model-invocation.ts` | `packages/db/src/model-invocation.ts` | 8 | OK |
| 9 | `packages/db/src/recruiting/recruiter.ts` | `packages/db/src/recruiter.ts` | 8 | OK |
| 10 | `packages/db/src/checkpoint/checkpoint-privacy.ts` | `packages/db/src/checkpoint-privacy.ts` | 7 | OK |
| 11 | `packages/db/src/qbank/qbank-retrieval-cache.ts` | `packages/db/src/qbank-retrieval-cache.ts` | 7 | OK |
| 12 | `packages/db/src/context/ctx03-event-source.ts` | `packages/db/src/ctx03-event-source.ts` | 6 | OK |
| 13 | `packages/db/src/routing/job-route-decision.ts` | `packages/db/src/job-route-decision.ts` | 6 | OK |
| 14 | `packages/db/src/transcript/int-transcript.ts` | `packages/db/src/int-transcript.ts` | 6 | OK |
| 15 | `packages/db/src/memory/memory-admission.ts` | `packages/db/src/memory-admission.ts` | 5 | OK |
| 16 | `packages/db/src/qbank/qbank-curation.ts` | `packages/db/src/qbank-curation.ts` | 5 | OK |
| 17 | `packages/db/src/qbank/qbank-generation-projection.ts` | `packages/db/src/qbank-generation-projection.ts` | 5 | OK |
| 18 | `packages/db/src/report/report.ts` | `packages/db/src/report.ts` | 5 | OK |
| 19 | `packages/db/src/jobs/quiz-jobs.ts` | `packages/db/src/quiz-jobs.ts` | 4 | OK |
| 20 | `packages/db/src/memory/memory-fact-adjudication.ts` | `packages/db/src/memory-fact-adjudication.ts` | 4 | OK |
| 21 | `packages/db/src/privacy/uc052-internal-erasure.ts` | `packages/db/src/uc052-internal-erasure.ts` | 4 | OK |
| 22 | `packages/db/src/qbank/qbank-track-local-retrieval.ts` | `packages/db/src/qbank-track-local-retrieval.ts` | 4 | OK |
| 23 | `packages/db/src/scoring/scoring-fact-root.ts` | `packages/db/src/scoring-fact-root.ts` | 4 | OK |
| 24 | `packages/db/src/commerce/payment.ts` | `packages/db/src/payment.ts` | 3 | OK |
| 25 | `packages/db/src/context/context-compression-snapshot.ts` | `packages/db/src/context-compression-snapshot.ts` | 3 | OK |
| 26 | `packages/db/src/interview/interview-question.ts` | `packages/db/src/interview-question.ts` | 3 | OK |
| 27 | `packages/db/src/jobs/diagnosis-jobs.ts` | `packages/db/src/diagnosis-jobs.ts` | 3 | OK |
| 28 | `packages/db/src/memory/memory-index-generation.ts` | `packages/db/src/memory-index-generation.ts` | 3 | OK |
| 29 | `packages/db/src/memory/memory-summary.ts` | `packages/db/src/memory-summary.ts` | 3 | OK |
| 30 | `packages/db/src/retrieval/rag-corpus-versioning.ts` | `packages/db/src/rag-corpus-versioning.ts` | 3 | OK |
| 31 | `packages/db/src/retrieval/retrieval-store.ts` | `packages/db/src/retrieval-store.ts` | 3 | OK |
| 32 | `packages/db/src/transcript/int-transcript-projection.ts` | `packages/db/src/int-transcript-projection.ts` | 3 | OK |
| 33 | `packages/db/src/context/context-compression-dispatch.ts` | `packages/db/src/context-compression-dispatch.ts` | 2 | OK |
| 34 | `packages/db/src/interview/interview-event.ts` | `packages/db/src/interview-event.ts` | 2 | OK |
| 35 | `packages/db/src/memory/memory-governance.ts` | `packages/db/src/memory-governance.ts` | 2 | OK |
| 36 | `packages/db/src/memory/memory-store.ts` | `packages/db/src/memory-store.ts` | 2 | OK |
| 37 | `packages/db/src/memory/memory-vector-chunk-erasure.ts` | `packages/db/src/memory-vector-chunk-erasure.ts` | 2 | OK |
| 38 | `packages/db/src/model-op/model-operation-admission.ts` | `packages/db/src/model-operation-admission.ts` | 2 | OK |
| 39 | `packages/db/src/retrieval/retrieval-legacy.ts` | `packages/db/src/retrieval-legacy.ts` | 2 | OK |
| 40 | `packages/db/src/scoring/scoring-aggregation.ts` | `packages/db/src/scoring-aggregation.ts` | 2 | OK |
| 41 | `packages/db/src/context/context-compression-erasure.ts` | `packages/db/src/context-compression-erasure.ts` | 1 | OK |
| 42 | `packages/db/src/interview/interview-answer-dual-write.ts` | `packages/db/src/interview-answer-dual-write.ts` | 1 | OK |
| 43 | `packages/db/src/interview/interview-graph-lease.ts` | `packages/db/src/interview-graph-lease.ts` | 1 | OK |
| 44 | `packages/db/src/memory/memory-control-surface.ts` | `packages/db/src/memory-control-surface.ts` | 1 | OK |
| 45 | `packages/db/src/memory/memory-summary-tree.ts` | `packages/db/src/memory-summary-tree.ts` | 1 | OK |
| 46 | `packages/db/src/memory/memory-two-stage-recall.ts` | `packages/db/src/memory-two-stage-recall.ts` | 1 | OK |
| 47 | `packages/db/src/model-op/usage-calibration.ts` | `packages/db/src/usage-calibration.ts` | 1 | OK |
| 48 | `packages/db/src/notification/notification.ts` | `packages/db/src/notification.ts` | 1 | OK |
| 49 | `packages/db/src/privacy/privacy-erasure-preview.ts` | `packages/db/src/privacy-erasure-preview.ts` | 1 | OK |
| 50 | `packages/db/src/privacy/uc052-checkpoint-physical.ts` | `packages/db/src/uc052-checkpoint-physical.ts` | 1 | OK |
| 51 | `packages/db/src/privacy/uc052-external-sink-async-purge.ts` | `packages/db/src/uc052-external-sink-async-purge.ts` | 1 | OK |
| 52 | `packages/db/src/privacy/vector-plane-erasure.ts` | `packages/db/src/vector-plane-erasure.ts` | 1 | OK |
| 53 | `packages/db/src/qbank/qbank-embedding-compute-cache.ts` | `packages/db/src/qbank-embedding-compute-cache.ts` | 1 | OK |
| 54 | `packages/db/src/qbank/qbank-miss.ts` | `packages/db/src/qbank-miss.ts` | 1 | OK |
| 55 | `packages/db/src/qbank/qbank-provider-input.ts` | `packages/db/src/qbank-provider-input.ts` | 1 | OK |
| 56 | `packages/db/src/qbank/qbank-route-scope-cache.ts` | `packages/db/src/qbank-route-scope-cache.ts` | 1 | OK |
| 57 | `packages/db/src/routing/candidate-route.ts` | `packages/db/src/candidate-route.ts` | 1 | OK |
| 58 | `packages/db/src/routing/free-text-route-decision.ts` | `packages/db/src/free-text-route-decision.ts` | 1 | OK |
| 59 | `packages/db/src/scoring/scoring-evidence-conflict.ts` | `packages/db/src/scoring-evidence-conflict.ts` | 1 | OK |
