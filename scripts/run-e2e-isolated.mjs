/**
 * 在独立、临时的 PostgreSQL cluster 上运行会重建 schema/role 的 E2E 或数据库 proof。
 *
 * 不能只在同一 cluster 新建 database：冻结的 0001 baseline 会维护 cluster-level
 * `app_role`，而共享开发库已有依赖它的对象。该包装器每次只删除它自己创建的
 * `meetwise-e2e-*` 容器，绝不触碰开发数据库或开发容器。
 *
 *   pnpm e2e:isolated       # HTTP 全链路
 *   pnpm e2e:ui:isolated    # production Next + Playwright
 *   pnpm qbank-source:prove # qbank 审核/RLS proof（绝不触碰开发库）
 *   pnpm rag-corpus-version:prove # 通用语料版本/灰度/删除 proof（绝不触碰开发库）
 *   pnpm memory:prove       # memory/RLS proof（绝不触碰开发库）
 *   node scripts/run-e2e-isolated.mjs neg:resume # 简历/隐私负路径（绝不触碰开发库）
 *   pnpm adaptive-consumer:prove # queue→consumer→graph research-skill proof（绝不触碰开发库）
 *   pnpm adaptive-life:prove     # graph checkpoint→ledger→SSE→settlement proof（绝不触碰开发库）
 *   pnpm adaptive-flow:prove     # real model-gateway contract + adaptive graph proof（绝不触碰开发库）
 *   pnpm voice:prove             # 单轨 ASR/TTS→同一持久图的边缘契约（绝不触碰开发库）
 *   pnpm scoring-integrity:prove # 评分/报告完整性 proof（绝不触碰开发库）
 *   pnpm runtime-role:prove      # 应用登录最小权限/RLS proof（绝不触碰开发库）
 */
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { captureBounded } from './bounded-command.mjs';
import { writeLocalE2EReceipt, writeLocalIsolatedReceipt } from './local-e2e-receipt.mjs';
import { withheldOutputSummary } from './withheld-output.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const target = process.argv[2] ?? 'e2e:prove';
const isolatedReceiptSources = {
  'model-cost:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/ai-runtime/test/model-cost-governance.proof.ts',
    'packages/ai-runtime/src/invoke.ts', 'packages/db/src/ai-cost-governance.ts',
    'packages/db/migrations/0033_ai_cost_governance.sql',
    'packages/db/migrations/0035_ai_cost_principal_scope.sql',
    'packages/db/migrations/0036_ai_text_cost_governance.sql',
    'packages/db/migrations/0037_ai_model_invocation_durable_claim.sql',
    'packages/db/migrations/0056_model_invocation_reconcile.sql',
    'packages/db/migrations/0057_model_invocation_cost_scope.sql',
    'packages/db/migrations/0083_ai_text_cost_price_revision_binding.sql',
    'packages/db/migrations/0085_ai_model_logical_node_dispatch_slot.sql',
    'packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql',
  ],
  'model-invocation-reconcile:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/model-invocation-reconcile.proof.ts',
    'apps/worker/src/model-invocation-reconcile.ts',
    'packages/db/src/model-invocation.ts', 'packages/db/src/ai-cost-governance.ts',
    'packages/db/migrations/0037_ai_model_invocation_durable_claim.sql',
    'packages/db/migrations/0056_model_invocation_reconcile.sql',
    'packages/db/migrations/0057_model_invocation_cost_scope.sql',
    'packages/db/migrations/0083_ai_text_cost_price_revision_binding.sql',
    'packages/db/migrations/0085_ai_model_logical_node_dispatch_slot.sql',
    'packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql',
  ],
  'privacy-erasure:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/checkpoint-privacy-erasure.proof.ts',
    'packages/db/src/checkpoint-privacy.ts', 'packages/db/src/interview-jobs.ts',
    'packages/db/src/model-invocation.ts', 'apps/worker/src/report-worker.ts',
    'packages/db/migrations/0058_interview_privacy_queue_fence.sql',
    'packages/db/migrations/0059_interview_privacy_projection_fence.sql',
    'packages/db/migrations/0062_interview_privacy_event_stream_scope.sql',
    'packages/db/migrations/0075_privacy_erasure_authorization_pause.sql',
    'packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql',
    'packages/db/migrations/0077_privacy_worker_dispatch_rls.sql',
    'packages/db/migrations/0078_privacy_worker_parent_request_guard.sql',
    'packages/ai-runtime/src/invoke.ts',
  ],
  'privacy-erasure:pause-upgrade:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/privacy-erasure-pause-upgrade.proof.ts', 'apps/worker/src/privacy-worker-runtime.ts',
    'packages/db/src/checkpoint-privacy.ts', 'packages/db/src/principal.ts',
    'packages/db/migrations/0047_checkpoint_privacy_fence.sql',
    'packages/db/migrations/0048_checkpoint_physical_erasure.sql',
    'packages/db/migrations/0058_interview_privacy_queue_fence.sql',
    'packages/db/migrations/0075_privacy_erasure_authorization_pause.sql',
    'packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql',
    'packages/db/migrations/0077_privacy_worker_dispatch_rls.sql',
    'packages/db/migrations/0078_privacy_worker_parent_request_guard.sql',
  ],
  'privacy-erasure:http:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/api/test/privacy-erasure-http.proof.ts', 'apps/api/src/modules/interview/interview.service.ts',
    'packages/db/src/checkpoint-privacy.ts', 'packages/db/migrations/0058_interview_privacy_queue_fence.sql',
    'packages/db/migrations/0059_interview_privacy_projection_fence.sql',
    'packages/db/migrations/0062_interview_privacy_event_stream_scope.sql',
    'packages/db/migrations/0075_privacy_erasure_authorization_pause.sql',
    'packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql',
    'packages/db/migrations/0077_privacy_worker_dispatch_rls.sql',
    'packages/db/migrations/0078_privacy_worker_parent_request_guard.sql',
  ],
  'scor-00:http:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/api/test/scor-00-http-db.proof.ts',
    'apps/api/src/modules/interview/interview.controller.ts',
    'apps/api/src/modules/interview/interview.service.ts',
    'packages/db/src/recruiter.ts',
    'packages/db/migrations/0028_application_bound_interview.sql',
    'packages/db/migrations/0046_application_assessment_recovery.sql',
    'packages/db/migrations/0082_b_side_score_calibration_hold.sql',
  ],
  'scoring:eval:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/smoke/scoring-eval.ts', 'apps/worker/src/interview-service.ts',
    'packages/ai-runtime/src/invoke.ts', 'packages/db/src/principal.ts',
    'packages/db/src/isolated-test-target.ts',
  ],
  'checkpoint-role:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/checkpointer-runtime-role.proof.ts', 'apps/worker/src/checkpoint-principal.ts',
    'packages/db/src/checkpoint-privacy.ts', 'packages/db/src/principal.ts',
    'packages/db/migrations/0045_checkpoint_thread_rls.sql',
    'packages/db/migrations/0047_checkpoint_privacy_fence.sql',
    'packages/db/migrations/0048_checkpoint_physical_erasure.sql',
    'packages/db/migrations/0075_privacy_erasure_authorization_pause.sql',
    'packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql',
    'packages/db/migrations/0077_privacy_worker_dispatch_rls.sql',
    'packages/db/migrations/0078_privacy_worker_parent_request_guard.sql',
  ],
  'resume-erasure:foundation:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/resume-erasure-tombstone-foundation.proof.ts', 'packages/db/src/resume.ts',
    'packages/db/migrations/0060_resume_erasure_tombstone_foundation.sql',
    'packages/db/migrations/0063_resume_active_content_read_gate.sql',
  ],
  'resume-derivative-reference:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/resume-derivative-reference.proof.ts',
    'apps/worker/src/quiz-consumer.ts', 'apps/worker/src/diagnosis-consumer.ts',
    'apps/worker/src/quiz-lifecycle.ts', 'apps/worker/src/diagnosis-lifecycle.ts',
    'packages/db/src/quiz-jobs.ts', 'packages/db/src/diagnosis-jobs.ts', 'packages/db/src/resume.ts',
    'packages/db/migrations/0061_resume_derivative_reference_guard.sql',
    'packages/db/migrations/0062_interview_privacy_event_stream_scope.sql',
  ],
  'resume-reference:http:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/api/test/resume-reference-http.proof.ts', 'apps/api/src/modules/interview/interview.service.ts',
    'packages/db/src/interview-jobs.ts', 'packages/db/src/resume.ts',
    'packages/db/migrations/0063_resume_active_content_read_gate.sql',
    'packages/db/migrations/0064_interview_resume_epoch_reference.sql',
  ],
  'recruiter:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/recruiter-depth.proof.ts', 'packages/db/src/recruiter.ts',
    'packages/db/src/commerce.ts', 'packages/db/migrations/0046_application_assessment_recovery.sql',
    'packages/db/migrations/0064_interview_resume_epoch_reference.sql',
    'packages/db/migrations/0082_b_side_score_calibration_hold.sql',
  ],
  'reqid:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/reqid.proof.ts', 'apps/worker/src/interview-consumer.ts',
    'packages/db/src/interview-jobs.ts', 'packages/ai-runtime/src/invoke.ts',
    'packages/db/migrations/0057_model_invocation_cost_scope.sql',
    'packages/db/migrations/0064_interview_resume_epoch_reference.sql',
  ],
  'interview:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/interview.proof.ts', 'apps/worker/src/interview-consumer.ts',
    'apps/worker/src/adaptive-lifecycle.ts', 'apps/worker/src/report-worker.ts',
    'packages/db/src/interview-jobs.ts', 'packages/db/src/resume.ts',
    'packages/db/migrations/0064_interview_resume_epoch_reference.sql',
  ],
  'stress:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/context-stress.proof.ts', 'apps/worker/src/interview-consumer.ts',
    'apps/worker/src/adaptive-lifecycle.ts', 'apps/worker/src/interview-service.ts',
    'apps/worker/src/report-worker.ts', 'packages/db/src/interview-jobs.ts',
    'packages/db/migrations/0064_interview_resume_epoch_reference.sql',
  ],
  'memory:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/memory.proof.ts', 'apps/worker/src/memory-service.ts',
    'packages/db/src/memory-store.ts', 'packages/db/migrations/0001_baseline.sql',
  ],
  'report:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/report-bulkhead.proof.ts', 'apps/worker/src/report-worker.ts',
    'packages/db/src/report.ts', 'packages/db/migrations/0059_interview_privacy_projection_fence.sql',
  ],
  'quiz:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/quiz.proof.ts', 'apps/worker/src/quiz-consumer.ts',
    'apps/worker/src/quiz-lifecycle.ts', 'packages/db/src/quiz-jobs.ts',
    'packages/db/migrations/0061_resume_derivative_reference_guard.sql',
  ],
  'diagnosis:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/diagnosis.proof.ts', 'apps/worker/src/diagnosis-consumer.ts',
    'apps/worker/src/diagnosis-lifecycle.ts', 'packages/db/src/diagnosis-jobs.ts',
    'packages/db/migrations/0061_resume_derivative_reference_guard.sql',
  ],
  'reaper:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/reaper.proof.ts', 'apps/worker/src/interview-consumer.ts',
    'apps/worker/src/quiz-consumer.ts', 'apps/worker/src/job-heartbeat.ts',
    'packages/db/src/interview-jobs.ts', 'packages/db/src/quiz-jobs.ts',
    'packages/db/src/commerce.ts', 'packages/db/src/resume.ts',
    'packages/db/migrations/0061_resume_derivative_reference_guard.sql',
    'packages/db/migrations/0064_interview_resume_epoch_reference.sql',
  ],
  'ocr:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/ocr.proof.ts', 'packages/ai-runtime/src/resume-ocr.ts',
    'packages/ai-runtime/src/invoke.ts', 'packages/db/src/resume.ts',
    'packages/db/src/commerce.ts', 'packages/db/migrations/0038_resume_ocr_artifact.sql',
    'packages/db/migrations/0057_model_invocation_cost_scope.sql',
  ],
  'adaptive-degrade:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/adaptive-degrade.proof.ts', 'apps/worker/src/adaptive-interview-service.ts',
    'packages/ai-runtime/src/invoke.ts', 'packages/db/src/model-invocation.ts',
    'packages/db/migrations/0057_model_invocation_cost_scope.sql',
  ],
  'rag-generation:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/qbank-generation.proof.ts', 'apps/worker/src/qbank-ingest.ts',
    'apps/worker/src/qbank-generation.ts', 'packages/db/src/qbank-generation-retrieval.ts',
    'packages/db/src/qbank-retrieval-cache.ts', 'packages/db/migrations/0029_qbank_generation_hybrid_retrieval.sql',
    'packages/db/migrations/0031_qbank_question_artifact_rag.sql',
    'packages/db/migrations/0065_qbank_artifact_integrity.sql',
    'packages/db/migrations/0066_qbank_control_executor.sql',
    'packages/db/migrations/0067_qbank_control_plane_read_boundary.sql',
    'packages/db/migrations/0068_qbank_content_fact_immutability.sql',
    'packages/db/migrations/0069_qbank_legacy_integrity_quarantine.sql',
    'packages/db/migrations/0070_qbank_low_privilege_control_definer_rls.sql',
    'packages/db/migrations/0071_qbank_artifact_control_definer_rls.sql',
    'packages/db/migrations/0072_qbank_question_evidence_definer_rls.sql',
    'packages/db/migrations/0086_qbank_routed_metadata_taxonomy.sql',
    'packages/db/migrations/0087_qbank_control_definer_corpus_dependency.sql',
    'packages/db/migrations/0089_qbank_taxonomy_definer_manifest.sql',
  ],
  'qbank-integrity-upgrade:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/qbank-integrity-upgrade.proof.ts', 'apps/worker/src/qbank-ingest.ts',
    'apps/worker/src/qbank-generation.ts', 'packages/db/src/migrate.ts',
    'packages/db/src/qbank-generation-retrieval.ts', 'packages/db/migrations/0067_qbank_control_plane_read_boundary.sql',
    'packages/db/migrations/0068_qbank_content_fact_immutability.sql',
    'packages/db/migrations/0069_qbank_legacy_integrity_quarantine.sql',
    'packages/db/migrations/0070_qbank_low_privilege_control_definer_rls.sql',
    'packages/db/migrations/0071_qbank_artifact_control_definer_rls.sql',
    'packages/db/migrations/0072_qbank_question_evidence_definer_rls.sql',
    'packages/db/migrations/0086_qbank_routed_metadata_taxonomy.sql',
    'packages/db/migrations/0087_qbank_control_definer_corpus_dependency.sql',
    'packages/db/migrations/0089_qbank_taxonomy_definer_manifest.sql',
  ],
  'qbank-control-role:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/qbank-control-role.proof.ts', 'packages/db/src/principal.ts',
    'packages/db/migrations/0066_qbank_control_executor.sql',
    'packages/db/migrations/0067_qbank_control_plane_read_boundary.sql',
    'packages/db/migrations/0068_qbank_content_fact_immutability.sql',
    'packages/db/migrations/0069_qbank_legacy_integrity_quarantine.sql',
    'packages/db/migrations/0070_qbank_low_privilege_control_definer_rls.sql',
    'packages/db/migrations/0071_qbank_artifact_control_definer_rls.sql',
    'packages/db/migrations/0072_qbank_question_evidence_definer_rls.sql',
    'packages/db/migrations/0086_qbank_routed_metadata_taxonomy.sql',
    'packages/db/migrations/0087_qbank_control_definer_corpus_dependency.sql',
    'packages/db/migrations/0089_qbank_taxonomy_definer_manifest.sql',
  ],
  'rag-control-role:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/rag-control-role.proof.ts', 'packages/db/src/principal.ts', 'packages/db/src/rag-corpus-versioning.ts',
    'packages/db/migrations/0032_rag_corpus_version_control.sql',
    'packages/db/migrations/0073_rag_control_plane_identity_isolation.sql',
      'packages/db/migrations/0074_rag_rebuild_request_fence.sql',
      'packages/db/migrations/0079_rag_control_acl_allowlist.sql',
      'packages/db/migrations/0080_rag_control_executor_membership_allowlist.sql',
      'packages/db/migrations/0081_rag_control_dispatch_concurrent_replay.sql',
  ],
  'rag-control-upgrade:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/rag-control-upgrade.proof.ts', 'packages/db/src/rag-corpus-versioning.ts',
    'packages/db/migrations/0032_rag_corpus_version_control.sql',
    'packages/db/migrations/0073_rag_control_plane_identity_isolation.sql',
      'packages/db/migrations/0074_rag_rebuild_request_fence.sql',
      'packages/db/migrations/0079_rag_control_acl_allowlist.sql',
      'packages/db/migrations/0080_rag_control_executor_membership_allowlist.sql',
      'packages/db/migrations/0081_rag_control_dispatch_concurrent_replay.sql',
  ],
  'rag-control-dispatch:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/rag-control-dispatch.proof.ts', 'packages/db/src/principal.ts',
    'packages/db/migrations/0032_rag_corpus_version_control.sql',
    'packages/db/migrations/0073_rag_control_plane_identity_isolation.sql',
      'packages/db/migrations/0074_rag_rebuild_request_fence.sql',
      'packages/db/migrations/0079_rag_control_acl_allowlist.sql',
      'packages/db/migrations/0080_rag_control_executor_membership_allowlist.sql',
      'packages/db/migrations/0081_rag_control_dispatch_concurrent_replay.sql',
  ],
  'migrate-cli:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/migrate-cli.proof.ts', 'packages/db/src/migrate-cli.ts', 'packages/db/src/principal.ts',
    'apps/worker/src/qbank-ingest.ts',
    'packages/db/migrations/0066_qbank_control_executor.sql',
    'packages/db/migrations/0067_qbank_control_plane_read_boundary.sql',
    'packages/db/migrations/0068_qbank_content_fact_immutability.sql',
    'packages/db/migrations/0069_qbank_legacy_integrity_quarantine.sql',
    'packages/db/migrations/0070_qbank_low_privilege_control_definer_rls.sql',
    'packages/db/migrations/0071_qbank_artifact_control_definer_rls.sql',
    'packages/db/migrations/0072_qbank_question_evidence_definer_rls.sql',
    'packages/db/migrations/0086_qbank_routed_metadata_taxonomy.sql',
    'packages/db/migrations/0087_qbank_control_definer_corpus_dependency.sql',
    'packages/db/migrations/0089_qbank_taxonomy_definer_manifest.sql',
    'packages/db/migrations/0073_rag_control_plane_identity_isolation.sql',
      'packages/db/migrations/0074_rag_rebuild_request_fence.sql',
      'packages/db/migrations/0079_rag_control_acl_allowlist.sql',
      'packages/db/migrations/0080_rag_control_executor_membership_allowlist.sql',
      'packages/db/migrations/0081_rag_control_dispatch_concurrent_replay.sql',
  ],
  'rag-corpus-version:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/rag-corpus-version.proof.ts', 'packages/db/src/rag-corpus-versioning.ts', 'packages/db/src/principal.ts',
    'packages/db/migrations/0032_rag_corpus_version_control.sql',
    'packages/db/migrations/0073_rag_control_plane_identity_isolation.sql',
    'packages/db/migrations/0074_rag_rebuild_request_fence.sql',
  ],
  'qbank-pipeline:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/qbank-pipeline.proof.ts', 'apps/worker/src/qbank-ingest.ts',
    'apps/worker/src/qbank-generation.ts', 'packages/db/src/qbank-generation-retrieval.ts',
    'apps/worker/src/main.ts',
    'packages/db/migrations/0029_qbank_generation_hybrid_retrieval.sql',
    'packages/db/migrations/0031_qbank_question_artifact_rag.sql',
    'packages/db/migrations/0065_qbank_artifact_integrity.sql',
    'packages/db/migrations/0067_qbank_control_plane_read_boundary.sql',
    'packages/db/migrations/0068_qbank_content_fact_immutability.sql',
    'packages/db/migrations/0069_qbank_legacy_integrity_quarantine.sql',
    'packages/db/migrations/0070_qbank_low_privilege_control_definer_rls.sql',
    'packages/db/migrations/0071_qbank_artifact_control_definer_rls.sql',
    'packages/db/migrations/0072_qbank_question_evidence_definer_rls.sql',
    'packages/db/migrations/0086_qbank_routed_metadata_taxonomy.sql',
    'packages/db/migrations/0087_qbank_control_definer_corpus_dependency.sql',
    'packages/db/migrations/0089_qbank_taxonomy_definer_manifest.sql',
  ],
  'commerce:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/commerce-saga.proof.ts', 'packages/db/src/commerce.ts',
    'packages/db/migrations/0001_baseline.sql',
    'packages/db/migrations/0046_application_assessment_recovery.sql',
  ],
  'resume:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'packages/db/test/resume-ingest.proof.ts', 'packages/db/src/resume.ts',
    'packages/db/migrations/0001_baseline.sql',
    'packages/db/migrations/0060_resume_erasure_tombstone_foundation.sql',
    'packages/db/migrations/0063_resume_active_content_read_gate.sql',
  ],
  'adaptive-consumer:prove:raw': [
    'scripts/run-e2e-isolated.mjs', 'scripts/bounded-command.mjs',
    'apps/worker/test/adaptive-consumer.proof.ts',
    'apps/worker/src/interview-consumer.ts', 'apps/worker/src/adaptive-lifecycle.ts',
    'packages/db/src/interview-jobs.ts', 'packages/db/src/resume.ts',
    'packages/db/migrations/0063_resume_active_content_read_gate.sql',
    'packages/db/migrations/0064_interview_resume_epoch_reference.sql',
  ],
};
if (![
  'e2e:prove', 'e2e:ui', 'performance:e2e',
  'api:validate', 'neg:all', 'neg:auth', 'neg:commerce', 'neg:resume', 'neg:interview', 'neg:bend', 'neg:input', 'turn-idempotency:prove', 'migrate:prove', 'commerce:prove:raw', 'resume:prove:raw',
  'stress:prove:raw', 'adaptive-latency:prove', 'runtime:prove:raw', 'model-cost:prove:raw', 'adaptive-degrade:prove:raw', 'vectorstore:prove:raw',
  'qbank-source:prove:raw', 'memory:prove:raw', 'report:prove:raw', 'quiz:prove:raw', 'diagnosis:prove:raw', 'reaper:prove:raw', 'ocr:prove:raw', 'adaptive-consumer:prove:raw', 'adaptive-life:prove:raw', 'adaptive-flow:prove:raw', 'rag-generation:prove:raw', 'rag-corpus-version:prove:raw',
  'voice:prove', 'scoring-integrity:prove', 'scoring:eval:raw', 'qbank-pipeline:prove:raw', 'runtime-role:prove:raw', 'checkpoint-role:prove:raw', 'api-runtime-role:prove:raw',
  'qbank:prove:raw', 'privacy-erasure:prove:raw', 'privacy-erasure:http:prove:raw', 'privacy-erasure:pause-upgrade:prove:raw', 'resume-erasure:foundation:prove:raw', 'resume-derivative-reference:prove:raw', 'resume-reference:http:prove:raw', 'reqid:prove:raw', 'interview:prove:raw',
  'scor-00:http:prove:raw',
  'online-judge-control:prove:raw', 'qbank-control-role:prove:raw', 'qbank-integrity-upgrade:prove:raw',
  'rag-control-role:prove:raw', 'rag-control-upgrade:prove:raw', 'rag-control-dispatch:prove:raw', 'migrate-cli:prove:raw',
  'recruiter:prove:raw',
  'commerce-reconcile:prove:raw',
  'model-invocation-reconcile:prove:raw',
  'isolated-env:prove',
].includes(target)) {
  throw new Error(`unsupported_e2e_target:${target}`);
}

// Public root scripts must point at this isolation gate.  These two concrete
// package invocations deliberately avoid calling the public script again.
const isolatedCommand = target === 'migrate:prove'
  ? ['pnpm', ['-C', 'packages/db', 'prove:migrate']]
  : target === 'runtime:prove:raw'
    ? ['pnpm', ['-C', 'packages/ai-runtime', 'prove']]
  : target === 'model-cost:prove:raw'
    ? ['pnpm', ['-C', 'packages/ai-runtime', 'prove:model-cost']]
  : target === 'commerce:prove:raw'
    ? ['pnpm', ['-C', 'packages/db', 'commerce']]
  : target === 'resume:prove:raw'
    ? ['pnpm', ['-C', 'packages/db', 'resume']]
  : target === 'adaptive-degrade:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:adaptive-degrade']]
  : target === 'adaptive-life:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:adaptive-life']]
  : target === 'adaptive-flow:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:adaptive-flow']]
  : target === 'reqid:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:reqid']]
  : target === 'interview:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:interview']]
  : target === 'stress:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:stress']]
  : target === 'memory:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:memory']]
  : target === 'report:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:report']]
  : target === 'quiz:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:quiz']]
  : target === 'diagnosis:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:diagnosis']]
  : target === 'reaper:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:reaper']]
  : target === 'ocr:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:ocr']]
  : target === 'rag-generation:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:qbank-generation']]
  : target === 'qbank:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:qbank-generation']]
  : target === 'qbank-pipeline:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:qbank-pipeline']]
  : target === 'qbank-integrity-upgrade:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:qbank-integrity-upgrade']]
  : target === 'qbank-control-role:prove:raw'
    ? ['pnpm', ['-C', 'packages/db', 'prove:qbank-control-role']]
  : target === 'rag-control-role:prove:raw'
    ? ['pnpm', ['-C', 'packages/db', 'prove:rag-control-role']]
  : target === 'rag-control-upgrade:prove:raw'
    ? ['pnpm', ['-C', 'packages/db', 'prove:rag-control-upgrade']]
  : target === 'migrate-cli:prove:raw'
    ? ['pnpm', ['-C', 'packages/db', 'prove:migrate-cli']]
  : target === 'scoring-integrity:prove'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:scoring-integrity']]
  : target === 'scoring:eval:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'exec', 'tsx', 'smoke/scoring-eval.ts']]
  : target === 'privacy-erasure:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:checkpoint-privacy-erasure']]
  : target === 'privacy-erasure:http:prove:raw'
    ? ['pnpm', ['-C', 'apps/api', 'prove:privacy-erasure-http']]
  : target === 'scor-00:http:prove:raw'
    ? ['pnpm', ['-C', 'apps/api', 'prove:scor-00-http']]
  : target === 'privacy-erasure:pause-upgrade:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:privacy-erasure-pause-upgrade']]
  : target === 'resume-erasure:foundation:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:resume-erasure-tombstone']]
  : target === 'resume-derivative-reference:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:resume-derivative-reference']]
  : target === 'adaptive-consumer:prove:raw'
    ? ['pnpm', ['-C', 'apps/worker', 'prove:adaptive-consumer']]
  : target === 'api:validate'
    ? ['pnpm', ['-C', 'apps/api', 'validate']]
    : target.startsWith('neg:') || target === 'turn-idempotency:prove'
      ? ['pnpm', ['-C', 'apps/api', target]]
    : target === 'isolated-env:prove'
    ? ['node', ['scripts/isolated-env.proof.mjs']]
  : undefined;

const container = `meetwise-e2e-${process.pid}-${Date.now()}`;
const image = process.env.E2E_PG_IMAGE ?? 'pgvector/pgvector:pg16';
const inheritedEnv = { ...process.env };
// A real-model scoring evaluation must never load a developer `.env` or pay
// for a provider call implicitly. CI/manual operators inject the key into this
// process; without it no disposable database is even started.
if (target === 'scoring:eval:raw' && !inheritedEnv.MODEL_API_KEY) {
  console.log('SKIP scoring:eval:raw: MODEL_API_KEY not injected');
  process.exit(0);
}
// An operator's shell may contain cloud data-plane credentials. Isolated tests
// have one explicitly allowed external dependency (the live model for the
// full E2E); RDS/Tair/OSS and tracing credentials are stripped before any
// child is spawned, so a test cannot silently read/write a paid cloud service.
for (const key of [
  'DATABASE_URL', 'DATABASE_SSL_MODE', 'DATABASE_SSL_CA_PATH', 'QBANK_CONTROL_DATABASE_URL', 'QBANK_CONTROL_DB_USER', 'QBANK_CONTROL_DB_PASSWORD',
  'REDIS_URL', 'RAG_REDIS_URL', 'RAG_REDIS_TEST_URL', 'RAG_QBANK_CACHE_HASH_KEY',
  'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_BUCKET', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
  'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
  'MINIO_USER', 'MINIO_PASSWORD', 'LANGSMITH_API_KEY',
  'DASHSCOPE_API_KEY', 'DASHSCOPE_ENDPOINT_PROFILE', 'DASHSCOPE_WORKSPACE_ID',
  'DASHSCOPE_COMPAT_BASE_URL', 'DASHSCOPE_TTS_URL', 'DASHSCOPE_STREAM_URL', 'DASHSCOPE_RERANK_URL',
  'DASHSCOPE_ASR_MODEL', 'DASHSCOPE_TTS_MODEL', 'DASHSCOPE_EMBED_MODEL', 'DASHSCOPE_RERANK_MODEL', 'DASHSCOPE_VISION_MODEL', 'DASHSCOPE_STREAM_ASR_MODEL', 'DASHSCOPE_STREAM_TTS_MODEL',
]) delete inheritedEnv[key];
for (const key of Object.keys(inheritedEnv)) if (key.startsWith('LANGFUSE_')) delete inheritedEnv[key];
const targetToken = randomUUID();
const baseEnv = {
  ...inheritedEnv,
  E2E_ISOLATED: '1',
  E2E_TEST_CONTAINER: container,
  E2E_TEST_TARGET_TOKEN: targetToken,
  DATABASE_SSL_MODE: 'disable',
  PGHOST: '127.0.0.1',
  PGUSER: 'meetwise',
  PGPASSWORD: 'meetwise_dev_password',
  PGDATABASE: 'meetwise',
};

function capture(command, args, env = baseEnv, cwd = ROOT, timeoutMs = 15_000) {
  return captureBounded(command, args, { cwd, env, timeoutMs });
}

function run(command, args, env = baseEnv) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

function safeFailureClass(output) {
  if (/permission denied for table/i.test(output)) return 'database_permission_denied';
  if (/privacy_[a-z0-9_:-]+/i.test(output)) return 'privacy_contract_failed';
  if (/interview_[a-z0-9_:-]+/i.test(output)) return 'interview_contract_failed';
  if (/model_[a-z0-9_:-]+/i.test(output)) return 'model_contract_failed';
  if (/migration_[a-z0-9_:-]+/i.test(output)) return 'migration_contract_failed';
  return 'child_exit_nonzero';
}

/**
 * Privacy proofs may carry random raw-data sentinels in their process output.
 * Keep that output in memory solely to count the proof framework's fixed
 * result prefixes and map a failure to a tiny allowlisted class.  Never print
 * or persist the child output itself.
 */
function runRedactedProof(command, args, env = baseEnv) {
  return new Promise((resolve, reject) => {
    let output = '';
    const child = spawn(command, args, { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const append = (chunk) => { if (output.length < 256 * 1024) output += chunk.toString('utf8'); };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('error', reject);
    child.on('exit', (code) => {
      const passed = (output.match(/^PASS  /gm) ?? []).length;
      const failed = (output.match(/^FAIL  /gm) ?? []).length;
      // These IDs are a closed vocabulary defined in the privacy proof; do
      // not carry assertion prose, exception text, inputs, or raw sentinels
      // into a receipt merely to debug a failed local run.
      const failedCheckIds = [...output.matchAll(/^FAIL  (P(?:PRIV|RES)\d{3}(?:_[A-Z0-9_]{1,64})?)$/gm)].map((match) => match[1]);
      const exitCode = code ?? 1;
      const failureClass = exitCode === 0 ? 'none' : (failedCheckIds.length ? 'privacy_assertion_failed' : safeFailureClass(output));
      const safeIds = failedCheckIds.length === failed && failedCheckIds.length > 0 ? failedCheckIds : undefined;
      const stagedFailure = output.match(/^ADAPTIVE_CONSUMER_STAGE=([A-Z_]{1,64}) CODE=([A-Z0-9_]{1,64})$/m);
      const stagedDiagnostic = stagedFailure ? { stage: stagedFailure[1], code: stagedFailure[2] } : undefined;
      console.log(`ISOLATED_PROOF_SUMMARY target=${target} exit=${exitCode} pass_count=${passed} fail_count=${failed} failure_class=${failureClass}${safeIds ? ` failed_check_ids=${safeIds.join(',')}` : ''}${stagedDiagnostic ? ` stage=${stagedDiagnostic.stage} code=${stagedDiagnostic.code}` : ''}`);
      resolve({ exitCode, proofSummary: { passCount: passed, failCount: failed, failureClass, ...(safeIds ? { failedCheckIds: safeIds } : {}), ...(stagedDiagnostic ? { stagedDiagnostic } : {}) } });
    });
  });
}

/**
 * HTTP 全链路会触发真实模型，子进程输出可能含不可信内容。为让运行本身可
 * 复核而不留下敏感原文，只在内存中识别其最终、固定格式的断言摘要并写入回执。
 */
function runFullE2E(command, args, env = baseEnv) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    const child = spawn(command, args, { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    // stderr（标准错误）永不转存或回显；错误结果只由退出码和安全回执表达。
    child.stderr.on('data', () => {});
    child.on('error', reject);
    child.on('exit', (code) => {
      const summary = stdout.match(/^✓ E2E 全栈跑通\((\d+) 断言,[^\n]*$/m);
      const assertionCount = summary ? Number(summary[1]) : null;
      if (code === 0 && !Number.isInteger(assertionCount)) return reject(new Error('e2e_success_without_final_assertion_summary'));
      if (summary) console.log(`E2E_FINAL_SUMMARY assertions=${assertionCount}`);
      resolve({ code: code ?? 1, assertionCount });
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * `pg_isready` 仅说明 postmaster（数据库主进程）开始接受连接；它不足以证明
 * Docker 端口映射与真实 SQL（结构化查询语言）连接已稳定。每次隔离库在迁移前
 * 都走同一条宿主机 TCP 探针，避免把启动竞态误记为业务/性能失败。
 */
const HOST_SQL_PROBE = [
  "import { Client } from 'pg';",
  "const client = new Client({ host: process.env.PGHOST, port: Number(process.env.PGPORT), user: process.env.PGUSER, password: process.env.PGPASSWORD, database: process.env.PGDATABASE, ssl: false, connectionTimeoutMillis: 2000 });",
  "try { await client.connect(); await client.query('SELECT 1'); } finally { await client.end().catch(() => undefined); }",
].join(' ');

async function probeHostSql(env) {
  // `pg` 是 db workspace 的直接依赖，而不是仓库根依赖。以该 workspace 作为
  // 模块解析起点，避免为了测试探针把数据库驱动错误提升为根生产依赖。
  await capture('node', ['--input-type=module', '--eval', HOST_SQL_PROBE], env, `${ROOT}packages/db`, 5_000);
}

/**
 * 失败容器随即会删除。容器日志可能包含测试 fixture、连接串或未来依赖回显的密钥，
 * 因此只保留诊断字节数，绝不把 State/日志原文带入终端、CI 或 release 证据。
 */
async function dockerDiagnostic(args) {
  return captureBounded('docker', args, { cwd: ROOT, env: baseEnv, timeoutMs: 5_000 })
    .catch(() => 'docker_diagnostic_unavailable');
}

async function emitFailureDiagnostic() {
  const [state, logs] = await Promise.all([
    dockerDiagnostic(['inspect', '--format', '{{json .State}}', container]),
    dockerDiagnostic(['logs', '--tail', '80', container]),
  ]);
  console.error(`ISOLATED_POSTGRES_OUTPUT_WITHHELD container=${container} ${withheldOutputSummary('state', state)} ${withheldOutputSummary('logs', logs)}`);
}

async function waitForPostgres(env) {
  // Docker 的 Postgres entrypoint（入口脚本）会先起一个临时 postmaster 执行
  // initdb，再创建 POSTGRES_DB 并重启正式实例。`pg_isready` 在临时实例阶段也
  // 可能返回成功，然而 meetwise 库尚不存在，宿主 TCP 连接会被中断。只能把
  // “目标库可查询”作为 ready 条件，不能把“进程已监听”当 ready。
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await capture('docker', ['exec', container, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'meetwise', '-d', 'meetwise', '-Atqc', 'SELECT 1'], baseEnv, ROOT, 5_000);
      if (env) await probeHostSql(env);
      return;
    } catch { await sleep(1_000); }
  }
  throw new Error('isolated_postgres_database_not_ready');
}

async function migrateWithRecovery(env) {
  // Versioned migrations are individually transactional and their ledger is idempotent.  A second
  // attempt is therefore safe on this disposable, per-run target, while a second deterministic SQL
  // failure still exits non-zero and retains diagnostics instead of being hidden as a flaky pass.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const code = await run('pnpm', ['-C', 'packages/db', 'migrate'], env);
    if (code === 0) return;
    console.error(`ISOLATED_E2E_MIGRATE_ATTEMPT_FAILED attempt=${attempt}/2`);
    if (attempt === 2) throw new Error(`isolated_e2e_migrate_failed:${code}`);
    await waitForPostgres(env);
    await sleep(500);
    await probeHostSql(env);
  }
}

async function main() {
  let created = false;
  let failed = false;
  const startedAt = new Date();
  let targetExitCode = 1;
  let assertionCount = null;
  let proofSummary;
  try {
    await capture('docker', [
      'run', '--rm', '-d', '--name', container,
      '-e', 'POSTGRES_USER=meetwise',
      '-e', 'POSTGRES_PASSWORD=meetwise_dev_password',
      '-e', 'POSTGRES_DB=meetwise',
      '-p', '127.0.0.1::5432', image,
      'postgres', '-c', `meetwise.e2e_run_token=${targetToken}`,
    ], baseEnv, ROOT, 120_000);
    created = true;
    const portOutput = await capture('docker', ['port', container, '5432/tcp'], baseEnv, ROOT, 10_000);
    const match = portOutput.match(/127\.0\.0\.1:(\d+)/);
    if (!match) throw new Error(`isolated_postgres_port_unparseable:${portOutput}`);
    const env = { ...baseEnv, PGPORT: match[1] };
    await waitForPostgres(env);
    console.log(`E2E isolated PostgreSQL: ${container} on 127.0.0.1:${env.PGPORT}`);
    if (['e2e:prove', 'e2e:ui', 'performance:e2e', 'api:validate', 'recruiter:prove:raw', 'commerce-reconcile:prove:raw', 'model-invocation-reconcile:prove:raw', 'adaptive-consumer:prove:raw', 'adaptive-life:prove:raw', 'adaptive-flow:prove:raw', 'scoring-integrity:prove', 'scoring:eval:raw', 'privacy-erasure:prove:raw', 'privacy-erasure:http:prove:raw', 'scor-00:http:prove:raw', 'resume-erasure:foundation:prove:raw', 'resume-derivative-reference:prove:raw', 'resume-reference:http:prove:raw', 'reqid:prove:raw', 'interview:prove:raw', 'stress:prove:raw', 'memory:prove:raw', 'report:prove:raw', 'quiz:prove:raw', 'diagnosis:prove:raw', 'reaper:prove:raw', 'ocr:prove:raw', 'adaptive-degrade:prove:raw', 'commerce:prove:raw', 'resume:prove:raw', 'rag-generation:prove:raw', 'qbank:prove:raw', 'qbank-pipeline:prove:raw', 'qbank-control-role:prove:raw', 'online-judge-control:prove:raw'].includes(target)) {
      await migrateWithRecovery(env);
    }
    if (target === 'api:validate') env.E2E_PREMIGRATED = '1';
    if (target === 'e2e:prove') {
      const result = await runFullE2E('pnpm', [target], env);
      targetExitCode = result.code;
      assertionCount = result.assertionCount;
    } else {
      if (isolatedCommand && (target.startsWith('privacy-erasure:') || target.startsWith('resume-erasure:') || target.startsWith('resume-derivative-reference:') || target === 'adaptive-consumer:prove:raw')) {
        const result = await runRedactedProof(isolatedCommand[0], isolatedCommand[1], env);
        targetExitCode = result.exitCode;
        proofSummary = result.proofSummary;
      } else {
        targetExitCode = isolatedCommand
          ? await run(isolatedCommand[0], isolatedCommand[1], env)
          : await run('pnpm', [target], env);
      }
    }
    process.exitCode = targetExitCode;
    failed = targetExitCode !== 0;
  } catch (error) {
    failed = true;
    targetExitCode = 1;
    throw error;
  } finally {
    if (created && failed) await emitFailureDiagnostic();
    if (created) await capture('docker', ['rm', '-f', container]).catch(() => {});
    if (target === 'e2e:prove') {
      try {
        const { relativePath } = await writeLocalE2EReceipt({
          repoRoot: ROOT,
          receiptRoot: join(ROOT, '.tmp', 'e2e-receipts'),
          target,
          outcome: failed ? 'failed' : 'passed',
          exitCode: targetExitCode,
          startedAt,
          finishedAt: new Date(),
          assertionCount,
        });
        console.log(`LOCAL_E2E_RECEIPT file=${relativePath} release_evidence=false`);
      } catch (error) {
        // A successful execution without its minimal, non-sensitive evidence
        // is inconclusive.  Do not let it pass a local gate silently.
        failed = true;
        process.exitCode = 1;
        console.error(`LOCAL_E2E_RECEIPT_FAILED reason=${error instanceof Error ? error.message : 'unknown'}`);
      }
    }
    const sources = isolatedReceiptSources[target];
    if (sources) {
      try {
        const { relativePath } = await writeLocalIsolatedReceipt({
          repoRoot: ROOT,
          receiptRoot: join(ROOT, '.tmp', 'isolated-proof-receipts'),
          target,
          outcome: failed ? 'failed' : 'passed',
          exitCode: targetExitCode,
          startedAt,
          finishedAt: new Date(),
          sourcePaths: sources,
          proofSummary,
        });
        console.log(`LOCAL_ISOLATED_PROOF_RECEIPT file=${relativePath} release_evidence=false`);
      } catch (error) {
        failed = true;
        process.exitCode = 1;
        console.error(`LOCAL_ISOLATED_PROOF_RECEIPT_FAILED reason=${error instanceof Error ? error.message : 'unknown'}`);
      }
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
