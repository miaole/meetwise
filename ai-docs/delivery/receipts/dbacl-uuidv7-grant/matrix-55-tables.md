# DBACL-1 · 55 表 DEFAULT uuidv7() 写点全量枚举矩阵（P2 收据）

官方 run#3（@db941542 · failures=0）MATRIX 行全量（表→idcol→受限写角色→TS app_role 直写文件数）· 断言 P2-MATRIX：每表受限写者 ⊆ 8 角色闭集（PASS）。

`writers` 来源：① §3 catalog 机检（SD 函数体 omit-id INSERT INTO 该表 → distinct proowner）② `app_role(ts-direct)` = TS 侧 omit-id INSERT 直写机检（packages/db/src + apps/api/src + apps/worker/src 正则扫描）。`[]` = 无受限写者（owner-only / 显式 id 插入 / 间接经 SD）。

| # | 表 | idcol | 受限写角色 | ts_files |
|---|---|---|---|---|
| 1 | entitlement_consumption | id | app_role(ts-direct) | 1 |
| 2 | entitlement_bucket | id | app_role(ts-direct) | 1 |
| 3 | consumption_record | id |  | 0 |
| 4 | commerce_outbox | id | app_role(ts-direct) | 1 |
| 5 | settlement_ledger | id | app_role(ts-direct) | 1 |
| 6 | ai_graph_run | run_id | app_role(ts-direct) | 2 |
| 7 | privacy_deletion_target | id | privacy_api_owner,app_role(ts-direct) | 1 |
| 8 | privacy_erasure_request | id | privacy_api_owner | 0 |
| 9 | resume | id | app_role(ts-direct) | 4 |
| 10 | interview_job | id | app_role(ts-direct) | 1 |
| 11 | ai_report | id | app_role(ts-direct) | 1 |
| 12 | quiz_job | id | app_role(ts-direct) | 1 |
| 13 | diagnosis_job | id | app_role(ts-direct) | 1 |
| 14 | interview_answer_submission | id |  | 0 |
| 15 | interview_answer_artifact | id |  | 0 |
| 16 | interview_answer_job | id |  | 0 |
| 17 | conversation_event | id |  | 0 |
| 18 | conversation_event_artifact | id |  | 0 |
| 19 | context_compression_snapshot | id | memory_runtime | 0 |
| 20 | context_compression_dispatch | id | memory_runtime | 0 |
| 21 | issued_question_contract | id | scoring_definer_owner | 0 |
| 22 | score_request | id | scoring_definer_owner | 0 |
| 23 | score_card | id | scoring_definer_owner | 0 |
| 24 | score_card_criterion | id | scoring_definer_owner | 0 |
| 25 | score_evidence | id | scoring_definer_owner | 0 |
| 26 | online_judge_candidate | id | online_judge_owner | 0 |
| 27 | online_judge_dispatch | id | online_judge_owner | 0 |
| 28 | online_judge_lot | id | online_judge_owner | 0 |
| 29 | memory_consent | id | memory_runtime | 0 |
| 30 | memory_fact | id | memory_runtime | 0 |
| 31 | memory_context_snapshot | id | memory_runtime | 0 |
| 32 | memory_index_generation | id | memory_runtime | 0 |
| 33 | memory_fact_adjudication | id | memory_runtime | 0 |
| 34 | memory_fact_relationship | id | memory_runtime | 0 |
| 35 | memory_recall_context_snapshot | id | memory_runtime | 0 |
| 36 | memory_index_generation_cache_entry | id | memory_runtime | 0 |
| 37 | memory_index_generation_embedding | id | memory_runtime | 0 |
| 38 | memory_index_source_manifest | id | memory_runtime | 0 |
| 39 | memory_index_source_manifest_item | id | memory_runtime | 0 |
| 40 | memory_summary | id | memory_summarizer | 0 |
| 41 | memory_admission_authorization | id | memory_admission_issuer | 0 |
| 42 | memory_admission_record | id | memory_runtime | 0 |
| 43 | privacy_authorization_snapshot | id | privacy_api_owner | 0 |
| 44 | privacy_deletion_receipt | id | privacy_worker_owner | 0 |
| 45 | privacy_preview_request | id | privacy_api_owner | 0 |
| 46 | privacy_external_purge_evidence | id | privacy_worker_owner | 0 |
| 47 | memory_collection_pause | id | memory_runtime | 0 |
| 48 | memory_correction_command | id | memory_runtime | 0 |
| 49 | memory_deletion_request | id | memory_runtime | 0 |
| 50 | memory_deletion_target | id | memory_runtime | 0 |
| 51 | memory_export_receipt | id | memory_runtime | 0 |
| 52 | memory_policy_publish_command | id | memory_runtime | 0 |
| 53 | memory_reindex_task | id | memory_runtime | 0 |
| 54 | question_rubric | id | scoring_definer_owner | 0 |
| 55 | question_rubric_criterion | id | scoring_definer_owner | 0 |

注：conversation_event / conversation_event_artifact writers=[] —— 0108 conversation_event_append 为显式 v4 id（gen_random_uuid()）插入，非 uuidv7 调用者（omit-id 精化排除 · 见 exec.md §4 N1）。
