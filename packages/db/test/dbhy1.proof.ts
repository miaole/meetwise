/**
 * DBHY-1 · GAP-DEBT-DB-HYGIENE 卫生刀 prove（P1–P6 · EXIT=0 · attempts 全账 · Ban retry-to-green）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（版本化迁移全量至 0146）：
 *   P0 隔离目标检测先行（assertIsolatedTestTarget + 容器 nonce）。
 *   P1 死表退役：app_setting/consumption_record catalog 缺席 + 生产 src 静态 grep 0 命中。
 *   P2 迁移链完整性：0001–0144 全部历史迁移文件 sha256 与冻结基线逐一相等（Ban 历史迁移改写的机器面）。
 *   P3 sql/ 兼容镜像退役残面门（案B'）：全代码面文件名/路径模式 grep（含模板路径形态·rev2 教训），
 *      命中仅允许登记残面清单（neg 族 24 boot() 消费 + legacy 向量夹具 + 孤儿 proof + manifest/拷贝）。
 *   P4 fresh deploy 重建（runner 实测）：① schema_migrations 行数=迁移文件数 ② resume_quiz.expires_at 存在
 *      （0007+0135 链·对 sql/20 的替代证明）③ 0019 四项封口断言（当年 fresh deploy 炸史的对象）④ 死表缺席
 *      ⑤ 对象类承载机器断言（rev3 P4④）：临时库重放全部 sql/ 文件，抽取函数/触发器/策略/索引四类名录，
 *      断言 sql 侧 ⊆ 迁移侧（逐名打印·豁免对象逐个登记）。
 *   P5 qbank 分区释放例程（0146）：retired 代在 corpus epoch 前进前拒绝释放；前进后 DETACH+DROP·
 *      元数据行保留·active 代 evidence 不变；负门：active/幂等/unknown/building/权限；failed 代同样回收。
 *   P6 deprecated 标注（0145）：四 jsonb 老列 pg_description 含 DEPRECATED。
 */
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, resolve } from 'node:path';
import { Client } from 'pg';
import { assertIsolatedTestTarget, createPool, ingestQbank, asQbankControlExecutor } from '../src/index.ts';

const ROOT = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const MIG_DIR = join(ROOT, 'packages/db/migrations');
const SQL_DIR = join(ROOT, 'packages/db/sql');

let failures = 0; let assertions = 0;
const A = (name: string, ok: boolean) => { assertions++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const sha256 = (b: Buffer) => createHash('sha256').update(b).digest('hex');

/** P2 冻结基线：0001–0144（亲核 @ EXEC 起点·含 DBTF-1 0144 汇流后）——Ban 历史迁移改写的机器面。 */
const P2_BASELINE: ReadonlyArray<readonly [string, string]> = [
  ['0001_baseline', 'a467e51954d935a40909d86d322c8f83b5da51f69c80085906ae0869cef2a8b9'],
  ['0002_app_setting', '6e76daeb81920cf10efb3ca24e781f47a107e6f543426b1891721e2308b3a8ae'],
  ['0003_app_setting_updated_at', '6497f3b9f3bc7ceb04edef283f14aa3eca84ed464bd5ffcbf5d001ad4cf9aa75'],
  ['0004_recruiter', 'd4a5f624db5a40f4e0cbb4dd269d52406f6ba4c4e2886c0beaf3a26838ece076'],
  ['0005_job_application', '399fc1fd2e123ee9424da0cfbaae1d0e888af8606d370838ebcb15cb88a249b5'],
  ['0006_user_role', 'c0d85a5a2bf75ab76a2f502d3ecf186ac1cac103c961802224e121a29b72a7ce'],
  ['0007_resume_quiz', '064d7ab95fde5404758684d486c132ab18e5b44c07347dc35b9d8da05d3d872e'],
  ['0008_resume_diagnosis', '9e1e5f5c4944c1789e55936b90b91a8ab2cc94ded328f5ada9548a823fed9763'],
  ['0009_interview_invitation', '88f8c82c9155cc5be6d4a9676b581ab59b4849e78166644c4de13493433aa17b'],
  ['0010_consumption_stale_lease_idx', 'df5917c1828e940aba4c96ffb20123c2391a3eacf9c437ffc5beb1027ba506a0'],
  ['0011_trace_tokens', '63781955d598813bba79c4408269b738e50bb3dce42c338684564d52d2f0c222'],
  ['0012_resume_profile_status', '95bc16fb2c1e0988ac95e7a1429d3edc4db531aa922019280bad2119f5ee7d54'],
  ['0013_qbank_source', '409f67292fc7917ed887a1017ac1786419f0f3e458958158cbab3d8c11b94309'],
  ['0014_trace_request_id', 'a80dc98ebc3f7cd489ed4caa4c4cb10dd4629be3e1bbb1b3f108644ae61df151'],
  ['0015_pwd_epoch', '5b7072c9911eead030012df22e625538fad40463c9119cc63c6fcf81ded0e18c'],
  ['0016_qbank_retrieval_takeover', '85f11f887894efa09d4e98cc60bf8e41b3090ec3e769793d29e36d3af9239557'],
  ['0017_qbank_seed_curator', '98eae096739b3a30f8dc81e1386bdf7a4ff861d992cf3205c69fde5e2710202f'],
  ['0018_payment_order_idempotency', '5fe69c7637f7f22d416d37ce5f0a70674d09098a6f1191a46f7e7690b13cb96c'],
  ['0019_schema_drift_reconcile', '0bab1ab9910062cf44cfa70d9c4e5077f4d955857d507f551d990b878d7f7627'],
  ['0020_commerce_terminal_integrity', '1d1b419cf3a84a9041f250c0d5aa87912d6cb2e0c39bf79b66fd547953c75125'],
  ['0021_interview_question_identity', '7e77379919478eaf5689834f470f389734a94b8592d4b91490836a4f1e2eb7d4'],
  ['0022_qbank_retrieval_cache', '855279296d3dbd6feb4690397b9e80b6717350f603cd1b67ed55f02694e5bd30'],
  ['0023_qbank_cache_epoch_rls_reconcile', 'c6fff586f7c9b9801271a1b6a173f45abbd75b2946688688fbe66e16b34e84bd'],
  ['0024_qbank_cache_epoch_lock', '443a60fbf14f88b964100b1d6cb50d7445a799d8d1189fc82736c6f907bf45a2'],
  ['0025_qbank_cache_delete_acl_reconcile', '50cad241b1341cfdd8402438bf2131312044b993f0ac46028eef1cdad2410260'],
  ['0026_qbank_cache_trigger_reconcile', 'aaced73f0919be9111361fd3d202a15f383f9111d279d6e5b6a2e2bb611304db'],
  ['0027_interview_event_unique_constraint_reconcile', '8922f4bc294bfa94a8fb89442f8e63d3333a434c40094f160aca51a6b4b5551d'],
  ['0028_application_bound_interview', '44e7d96963a56fad575d608623c930d8866a419c369ff4690a64689bc72ef211'],
  ['0029_qbank_generation_hybrid_retrieval', '84b37fba77f06815d92dea89ba8c741bd211bbfd67a91314eddd3b6ca7226dae'],
  ['0030_job_posting_idempotency', 'f37310c4812a83b9f488fac492ef3283d36bbe85f1ab822095571e3ae0f4e7f6'],
  ['0031_qbank_question_artifact_rag', '9e27e35c367f52f4bfaefe1c09cc951e75d93799cca98f00df49d19d2ec4c4ea'],
  ['0032_rag_corpus_version_control', 'c5010cb09e2138aedeca2c7b3dc13099bef83d11d05a9755e0a241b06798dcda'],
  ['0033_ai_cost_governance', '78e3e0c63102e50c46243a208cd08bd496347d60060cdaaab21c325ffcc7753f'],
  ['0034_ai_cost_governance_function_fix', '5bf82f9597d69eba3d15293d1421a4533d44f471004b14e57f80e7783832184c'],
  ['0035_ai_cost_principal_scope', 'accfe6574ad46faa051175a6ae45231b943400b0ed18e7ec411e0d0fa9a93a6c'],
  ['0036_ai_text_cost_governance', 'e2e7c187d4c0764562ee8a687462068893cc4d0d70ddd85ca08bb1904607aa8c'],
  ['0037_ai_model_invocation_durable_claim', 'b08a3c48a10f9cbcc82a0ba4e13612c692a29ea637f798e8ecb2b2a58aedf7d1'],
  ['0038_resume_ocr_artifact', 'dacf4b7540b52754a281a9b5acf71ad16bea8199d4fc3fe4959b7022551fcd9b'],
  ['0039_resume_derivative_erasure', 'b9a54ec1731cad83930d8d4c71ce3f9043942f737605cebc704031d2c73fe19c'],
  ['0040_gateway_dispatch_least_privilege', '15b17f9b1d562f694ce43508e08e594c140b9ddacfddcb70b9dc76e52a0f0370'],
  ['0041_api_runtime_least_privilege', '0c4b19459885ba1a58254615b294500c28077a718195270009fa2943d1c5c4ad'],
  ['0042_runtime_observability_gateway', 'a0585f94181fb62471c7f0d6f450fdecbd89a4616bb24f022ab34e13beefae14'],
  ['0043_langgraph_checkpoint_least_privilege', 'f12c3026f0624d012de988fd0f77310cde9d4128defc8fc18bc502075d7e9123'],
  ['0044_qbank_redis_cache_fill_intent', 'e7e0bd987236a921c392dc14a99cc91b8f57915d1cbc007038c0b5ef5f3c89db'],
  ['0045_checkpoint_thread_rls', '0cf6694604860f6abd7201f3d002e30d661a947f8de81aac895f12c4ba929c06'],
  ['0046_application_assessment_recovery', '04e15b22969b232ad5de93707a494fdb8eb3ee6471e94cef9145dbdad4602f81'],
  ['0047_checkpoint_privacy_fence', '81577d5899b8d50699b5344afb09c396189e929d89426e84b85257aeb4db4724'],
  ['0048_checkpoint_physical_erasure', 'eb9c9cf28f8424c0233d8c0512f86386bfff44945fe2fc3a4ab524e1e15a5adc'],
  ['0049_resume_reference_foundation', '8ca8d5ba4828a72b0bbc38636c2b4247e67842829f283b1e44cb74eea97d8395'],
  ['0050_online_judge_control_plane', 'b51fe93c6768b8ae1c8b0b65a598582027aaf1cdd35c8d31eeb9cee72f99554f'],
  ['0051_application_no_eligible_score_terminal', 'cc4fbb64968411407afd1d3b80ea56e75b252383ab646499289cef199cb67fa4'],
  ['0052_resume_reference_runtime_enforcement', 'c1079c9de14da6036f5be306daaf944dd6312e34cf21c3f72781b24ff6dc0d0e'],
  ['0053_resume_reference_legacy_classification', '6c137e0b0b3e5699fa2c235ffaa3ebf23451964542cfb01d7cfec6d4bf98f88e'],
  ['0054_resume_reference_write_gate', '8e5719964161bf92b6e531a0f9742e1934959f616184883f9ca72c60ed4c0ae5'],
  ['0055_resume_reference_legacy_backfill_index', '5d8ba91f4d030379db8692e4b4560aba9df62e4ec31fef4e1341ce0daa70dd57'],
  ['0056_model_invocation_reconcile', '34be3619874db8d4292913686c5d28a59201cc37ff768b60f263ae15dabdbf9a'],
  ['0057_model_invocation_cost_scope', '59e741cef2d093d67c9b1c33bb906c997c6a1e8027d357964da0f1b901450ef3'],
  ['0058_interview_privacy_queue_fence', 'f5f4931a4b02342abdc56a59abe66a0b317ca9e3e1f00bb99bdcdf8eb9e87ef8'],
  ['0059_interview_privacy_projection_fence', '8dc20dce4777acd8dfe9970cff47d299a936b648a1eaffa901456c481bdcd8fc'],
  ['0060_resume_erasure_tombstone_foundation', '86a677d0e0fcf387a828809c88ce6a6acca7f0dac926586287c95f6308c094f3'],
  ['0061_resume_derivative_reference_guard', 'cc3d2870e268c8b5d0c3a12e798e715f0c99caac0f69b70d86344b853a3e4693'],
  ['0062_interview_privacy_event_stream_scope', '45468f9c8a22d836c4ea8a4262fd84d5e16567fa5b1480cbb82991102ea39a5c'],
  ['0063_resume_active_content_read_gate', '1a7db0cccbe5c2b9941c98f77c46f1d43d061d833b98cb681315fc7d5f9b1b65'],
  ['0064_interview_resume_epoch_reference', 'fb64bfc1a3d80a94685c1b3e3c9a172fa117f1ec825149b36cf2070bd66686af'],
  ['0065_qbank_artifact_integrity', '1be8ef96b307907c5fa9d2c5e5cadb3a5370561ff47473fd571381c7ac6a4749'],
  ['0066_qbank_control_executor', '9ca83f33ed72f1a7ddcaaf940cb863421ca2d7a660885e6f72344ed38b009cf6'],
  ['0067_qbank_control_plane_read_boundary', 'd5e6bbbe6480b7afcb894c8ccce028256c36f65a258e98f983411acfedc51fdc'],
  ['0068_qbank_content_fact_immutability', 'd066aff2c0bac3d8d96dc262e591f62033a688fe719543b90b4a3cd6fe992a2c'],
  ['0069_qbank_legacy_integrity_quarantine', '58a465626a22941580d3aa495e013759d98859330f278319b1e655333f702d07'],
  ['0070_qbank_low_privilege_control_definer_rls', '4abb9c3944abb872dd79961a894c40112aee6abb39c14b0d99bc07bd63527607'],
  ['0071_qbank_artifact_control_definer_rls', 'cd7b8deb0ea3b35c6236eca54ce990602cb3a918ded16440a317dfd2167d7a39'],
  ['0072_qbank_question_evidence_definer_rls', 'b1512d74b28fb7c85b19ac4f03ff2138918e1410fea71fdb18ab7fee8608166e'],
  ['0073_rag_control_plane_identity_isolation', 'fa128b30e29177b35404cfd70ea7cf08142a500a7947ff06db2d45e13b31103f'],
  ['0074_rag_rebuild_request_fence', '167af219d2cf148bde963de4cf75c276d519a910df64ed3d4996ea944f23a45e'],
  ['0075_privacy_erasure_authorization_pause', '1834a37a3267140312feca7a96fdbc3ded138698adb03a216b28223d5141dfd3'],
  ['0076_privacy_erasure_legacy_request_pause', 'd314304600b7fb9525e86178b4a204950dabe29689d6b22853d8f4d02255b5c9'],
  ['0077_privacy_worker_dispatch_rls', 'adcb33a293e68cb39daca5e7f58f715ec8d399c1ca555b08e31ead873c97bbeb'],
  ['0078_privacy_worker_parent_request_guard', 'a9c6bea9d1446e17063f3a8a136d288fcc4fdc37140dd8503deeab3fc2a24ff7'],
  ['0079_rag_control_acl_allowlist', 'e87629de0814b325abe6a7cb3e31cb26f1a967c3341323061f2b0ed34fc2bae8'],
  ['0080_rag_control_executor_membership_allowlist', 'ba29d71fa0537ff9e8f78525756217d00ff2efedca6a95b133aa7241ef16e683'],
  ['0081_rag_control_dispatch_concurrent_replay', '2837a9578934d9cf572c01846b12fa6cd11b58c6efb308958d5198a7464d5a36'],
  ['0082_b_side_score_calibration_hold', '22035b8ecc0e00c78d83355d003d91f00299ed210aab4ba4aa08d9f4e65a4bc9'],
  ['0083_ai_text_cost_price_revision_binding', 'fc89c9b134dddd17c317ab095d009111c42c925bf60fa87554ac9a54b729a3ce'],
  ['0084_worker_job_wakeup_notifications', 'a77df3b0fb49c5b69606dcea399bc3434363ad88d22a0582d76de38e261d71f9'],
  ['0085_ai_model_logical_node_dispatch_slot', '19dd8c0926ddbf3d5fd6a6af6baef94948ce22fa9cfc865baffabf147bb52a39'],
  ['0086_qbank_routed_metadata_taxonomy', 'e126f22a58dd924f1e19fe72529df8e9ad220062080c149734a20ae4639046b5'],
  ['0087_qbank_control_definer_corpus_dependency', '9577d4c81f5e88be74a44fc63d5da54c6d7456488b4443139004d16c932876f0'],
  ['0088_ai_model_invocation_controlled_state_machine', '9b99a0c7cd9a59a57aeedb47508c3e1dada00691041b4e8deb80989af6b697e7'],
  ['0089_qbank_taxonomy_definer_manifest', '0790cf1b40e5bba863287b7d18708cec1fb26fa58807266bed8899f25a66ea20'],
  ['0090_ai_usage_estimate_calibration', '133bfd949bc2fc3950613dcc6ca4f4dd941303c4f3b597cff967da2069afe928'],
  ['0091_privacy_authorization_issuer', '4a5f80269101b871e37f0cc27019ca590e91f243bcf6a51e4bb0bf6c866e5a4a'],
  ['0092_int_transcript_answer_fact_root', '7edb392a56d108931accf02ad2adce2456e4025306cd4da3ce5bda80c9f4d3c1'],
  ['0093_memory_governance', 'fddff901f92915bd645a2432f903309fe370f17574a8c302c5a95112496c920b'],
  ['0094_qbank_control_definer_handoff_closure', 'b9e8b98d4150e4c0a40ad4a5146f83e0de59b2279d528f0d51c47154c30037f9'],
  ['0095_memory_admission_metadata_gate', '8a046a00a17c095dcfb62aab91d2c364eb6eb6ea480f1bd5a947304953bc332b'],
  ['0096_int_transcript_remaining_sinks', '94e8adee972f328cfd1ec63bde1bf2216d462b7eac092c133ca1e9246a8646a2'],
  ['0097_qbank_generation_serving_scope_projection', 'bb8010e8b8055886bcb93ecf35f385d241d407f6b945be2413cd5be7eb563fdd'],
  ['0098_qbank_active_source_id_executor_grant', '485c2d0b8c2d1e2ac9c002f528de3f231adc3c17f9da04d269e6aec43704bf92'],
  ['0099_memory_fact_adjudication', '43a000c69f280a665ecfbe4118cfafd8ac21daf12f3dd2cb162f87f0c2a397dc'],
  ['0100_scoring_fact_root', '75c7f64a6a7ea46bc23c694813fe8c42e1aa67bff47390f2d7c249335eda7d46'],
  ['0101_embedding_compute_cache', 'db7cb1df94173689f420ee4ddc8f0bb3fcacf6fcc055ce3d9ff40cd590b65771'],
  ['0102_memory_index_generation_governance', '9bd8349188597cabe4227609f9cb994b26c2b0764e6d0cf7b2a20c7b92e5edd6'],
  ['0103_scoring_deterministic_aggregation', '5393bceafbf4a842c3ceb5201a92f1009b0bc9e20067bf5b6313bc6c94ff584c'],
  ['0104_job_route_decision', 'a74b73f8bff9bef80364b3560b417c240b6322ede0c2069778775563a8f311f7'],
  ['0105_memory_two_stage_recall', 'fd5c258e02d1fa9acf6fc1e474bc01030edbe65dc26e09c117a4fa0f22ae6532'],
  ['0106_qbank_track_local_serving_scope', 'c2358d7171182d8599137947b2f50b55877cb68ff3a135a7bfd27efede507197'],
  ['0107_memory_control_surface', '03bcf6a0fa3d8cc558d670fd0919ab4281c7878822526cea2f91e45a3929eb3c'],
  ['0108_ctx03_immutable_session_event_source', '5e0ecadfe3f0a0ffa2157e966a29f3a90abce59582e80a9010784676d6613021'],
  ['0109_scoring_evidence_conflict_uncertainty', '8916b75e9dc6247412d598abafc2c38220d468f527b0db6de5960e5107d7da02'],
  ['0110_llm_qbank_miss_generation', 'a35f7a0a84b8fde9444658f7748bc3cfef481c7bc372347ebd74b554b20e8e02'],
  ['0111_ctx03_event_source_erasure', '3dc3117c482ab5d1e7e39bb9dab00b039ce78a4552d061bb0f211cae44b4bdad'],
  ['0112_memory_summary', 'e0979ce9cfaf1a487214be3c95cf6d65f2060e5967fdf2b820ad7d9d741a5ab0'],
  ['0113_qbank_route_scope_cache', '913dac0e9df19a8e8af4dac855469c3af20b99128e9cb66a2dc8421c48b54fb8'],
  ['0114_free_text_route_scope', '08469e5af2b93193935f92037534c9d8b98b84d306aa34d3d1c01a7885e5152b'],
  ['0115_ctx04_verifiable_compression_snapshot', 'dd4cfa981c8473bf40458d8510b03f627bdda6a94dad89000acf966966f4f043'],
  ['0116_memory_summary_tree', '77e4f206a2a7b65848d149ba1ff0c960b3bdbcbaf966cf6a08d71f1a8abb62ce'],
  ['0117_ctx05_compression_dispatch', '83e489117e12f6fb1fca0e80c0bc5c70f8e65d0e7b5fb2a63dde3662a52508ef'],
  ['0118_ctx06_deletion_closure', '45bd07e7e749a6a0a2a314e2a1cf8c66e2251c2d3d888e9b91a0f8b5cc876fab'],
  ['0119_usage_reconciliation_wiring', '45e795a9f161f667f10620a2b098ef5c509bff051f4c7bfb1bb75a44876a76ad'],
  ['0120_model_op02_shared_provider_admission_ledger_breaker', '0a4b2da4b199d69269bc28775206ce8f992c3de1376c992160212640e2948710'],
  ['0121_resume_pgcrypto_runtime_acl', '228f14105feb546c66aff68296ace5e389f16af32c52a84fd4a42679e9166ec8'],
  ['0122_resume_pgcrypto_optional_acl', 'ae2e345aa6685ed3b0c7f35e399d4dbfbf267766f8e8326c9f7b81f2bb9c3847'],
  ['0123_user_facing_context_snapshots', 'edc858fd2e91223900e7eeeba3a43aaf364daf225ff4fe1a3e39777606204f75'],
  ['0124_rag_retrieval_acl_fail_closed', 'f881d3e1fe9cd02c72e7ec1ccce61528e93c93dfdcea4283bf14ba4d10873a31'],
  ['0125_memory_vector_chunk_erasure', 'e6794563677ce85bdd677545adb9b3f6915ff738e62af03d1f12cc1ef29e87d9'],
  ['0126_interview_answer_dual_write_fence', '85ac21fa853e6dc4353681ec96d41d7d925349d50ea6c430d518c4b4fe639e01'],
  ['0127_resume_ocr_binding_provenance', '9b28e7efd485aa0c8df4b7515575c82e77b724c4dfccefb2bc775f21bfbac015'],
  ['0128_interview_dispatch_fairness', '307cde4123668f2d593f34df40f83c464937968bb7a573355bf97647aaf76f2a'],
  ['0129_privacy_erasure_preview_path', '0274484b2b9fbb37a73f6427a666fcfe5bf42e9dbaf58284075bdd6d31853ebb'],
  ['0130_model_invocation_same_key_claim_join', '273363a857a7b41770486a7cd398505290ead74266f004c7deae6b7630b6e4bc'],
  ['0131_job_route_classify_admission', 'a0ada1a63e46a84475e75ebd1c9a4a65b37a16b83f1f4a2338c4e197694b2794'],
  ['0132_job_route_classify_worker_dispatch', '18686c3fb8c0d2bde9ebd65f76c405a77af3ff89b43809a1ef728327fee2ffaf'],
  ['0133_job_route_pending_worker_wakeup', '1c0d66390985e004755085e4e3a556afceb8fc12237bba46586916d8b3785b85'],
  ['0134_usage_calibration_gateway_owners', '9fc2f574dd30f2af1dd204ccf99964dc4662ed9dc70aea9322e67131296259eb'],
  ['0135_resume_quiz_freshness_anchor', '776220a4325c09c78aaba10ce032da4b3aaefc399cf4f8cf1010f00d61014d1f'],
  ['0136_payment_order_refund_provider_txn', '8fa97e068d1e8fc29062c5beb2046be5177a2172ed472be0ba4dcce99e6393d4'],
  ['0137_privacy_external_sink_confirmation_guard', '9f05959de6801aa8109a2129651b769e45ac185ed26b6ad769729d8e74a2cd08'],
  ['0138_qbank_ann_candidate_before_limit', '947ea64b3d9b67e35f70c18b80db11b9512d5ee3d3aaf445b088d19f130ec439'],
  ['0139_qbank_ann_hnsw_iterative_scan', 'cc32f9a49ccae436839ecb4348ebfa508c101ac03d0078e51e67fc99eba83464'],
  ['0140_privacy_external_vendor_purge_evidence', '4504ba15027c496f6f7ee7d49b3d499d7fb4b7d3f35ac70f00fc68a44176c6fe'],
  ['0141_vector_plane_erasure_receipt_fence', 'c0e30ff44d985fe9add1c121cdfbc7445ca092a73fda127356f475c40d91b009'],
  ['0142_candidate_profile_route', '6bfc08e040be5a211d9ac4da8988e2080ebf30fb06bfa5107084c438c4a20bd4'],
  ['0143_db_id_v7_unify', 'ea85ab3629087c5f4b3f93a023a63b401829a1f47468bb3a6bac4e7e44e1f068'],
  ['0143_sse_push_notify', '87c472134193d67100f77b6fc34cb1665595586a80924a70803754809ebd4000'],
  ['0144_db_trigfam_unify', '1a7d6f9c3c0eeeb0167e803abf64503ea1689e4854644dc107025ce66eb8e861'],
];

/**
 * P3 登记残面（案B'·sql/ 目录保留至 neg 迁移另刀）：
 *  - neg 族：_neg-harness + 24 个 boot() 消费 proof + 025-bound 静态文本 + runner 收据 manifest + 云测拷贝
 *  - legacy 向量夹具：vectorstore.proof（marked-red 自证只装 legacy 面）+ rag-demo smoke（需外网/模型 key·本刀不可复跑）
 *  - 孤儿：qbank-ingest.proof（无 runner 宿主·无法复跑验证迁移·留待 neg 刀一并处置）
 */
const P3_RESIDUE_FILES: ReadonlySet<string> = new Set([
  'apps/api/test/_neg-harness.ts',
  'apps/api/test/uc-e2e-025-nhp-bound.proof.ts',
  'apps/api/test/uc-e2e-025-nhp-adv.proof.ts',
  'apps/api/test/neg-bend.proof.ts',
  'apps/worker/test/qbank-ingest.proof.ts',
  'packages/db/test/vectorstore.proof.ts',
  'apps/worker/smoke/rag-demo.ts',
  'scripts/run-e2e-isolated.mjs',
  'scripts/build-cloud-test-fc.mjs',
  // 以下为「禁止用 sql/ 影子 schema」纪律注释的文本提及（非加载器·run-4 采集）：
  'apps/worker/test/interview.proof.ts',
  'apps/worker/test/memory.proof.ts',
  'apps/worker/test/report-bulkhead.proof.ts',
  // 本 proof 自身（P4⑤ 读 SQL_DIR 建夹具库 + P3 模式字面量）：
  'packages/db/test/dbhy1.proof.ts',
]);

/** P4⑤ 对象类豁免：sql/ 侧独有但经亲核判定为夹具辅助/演示对象（非 fresh deploy 承载面）——逐对象登记理由。 */
const P4_OBJECT_EXEMPTIONS: ReadonlyMap<string, string> = new Map([
  // run-4 采集·逐对象亲核（迁移侧证据在注释行号）——均为 sql/ 夹具镜像滞后/设计内差，非 fresh deploy 承载缺口：
  ['policies:public.consumption_record:p_owner', '0145 本刀 DROP 死表·迁移侧无此表（sql/ 夹具仍载历史镜像）'],
  ['policies:public.ai_model_invocation:p_owner', '迁移侧 0037:39 以 p_ai_model_invocation_owner 承载（改名后继在产）'],
  ['policies:public.resume_ocr_artifact:p_owner', '迁移侧 0038:21 以 p_resume_ocr_artifact_owner 承载（改名后继在产）'],
  ['indexes:uq_interview_application_binding', '0046:33 故意 DROP（评估恢复刀放宽一次性绑定）·sql/ 夹具滞后旧索引'],
]);

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.git', '.tmp', 'dist', 'coverage', '.turbo'].includes(entry)) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p); else yield p;
  }
}

async function main() {
  const pool = createPool();
  try {
    // ── P0 检测先行 ────────────────────────────────────────────────────────
    await assertIsolatedTestTarget(pool);
    A('P0 隔离目标实证（E2E_ISOLATED + 容器 nonce）', true);

    // ── P1 死表退役 ────────────────────────────────────────────────────────
    const reg = async (t: string) => (await pool.query('SELECT to_regclass($1) r', ['public.' + t])).rows[0]?.r;
    A('P1-1 app_setting 已退役（to_regclass NULL）', (await reg('app_setting')) === null);
    A('P1-2 consumption_record 已退役（to_regclass NULL）', (await reg('consumption_record')) === null);
    A('P1-3 幂等真身 entitlement_consumption 在产', (await reg('entitlement_consumption')) !== null);
    {
      const srcDirs = ['packages/db/src', 'packages/ai-runtime/src', 'packages/domain/src', 'apps/api/src', 'apps/worker/src', 'apps/web'];
      const hits: string[] = [];
      for (const d of srcDirs) {
        const abs = join(ROOT, d);
        if (!existsSync(abs)) continue;
        for (const f of walk(abs)) {
          if (!/\.(ts|tsx|mjs)$/.test(f)) continue;
          if (/\b(app_setting|consumption_record)\b/.test(readFileSync(f, 'utf8'))) hits.push(relative(ROOT, f));
        }
      }
      A('P1-4 生产 src 静态 grep 两死表名 0 命中（primitives.sql 本地副本豁免·登记）', hits.length === 0);
      if (hits.length) console.log('  ✗ 残留:', hits.join(', '));
    }

    // ── P2 迁移链完整性（0001–0144 冻结基线） ──────────────────────────────
    {
      let drift = 0;
      for (const [version, digest] of P2_BASELINE) {
        const p = join(MIG_DIR, `${version}.sql`);
        if (!existsSync(p) || sha256(readFileSync(p)) !== digest) { drift++; console.log(`  ✗ 历史迁移被改动/缺失: ${version}.sql`); }
      }
      const baselineVersions = new Set(P2_BASELINE.map(([v]) => v));
      const extra = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql') && f < '0145_' && !baselineVersions.has(f.replace(/\.sql$/, '')));
      A(`P2-1 0001–0144 全 ${P2_BASELINE.length} 文件 sha256 与冻结基线逐一相等（Ban 历史迁移改写）`, drift === 0 && extra.length === 0);
    }

    // ── P3 sql/ 退役残面门（全代码面文件名/路径模式 grep·含模板路径形态） ──
    {
      const patterns = [/packages\/db\/sql/, /db\/sql\//, /sql\/\$\{/, /db\/\$\{dir\}/];
      const offenders: string[] = [];
      for (const f of walk(ROOT)) {
        if (!/\.(ts|tsx|mjs|js|json|yml|yaml|sh)$/.test(f) && !/Dockerfile/.test(f)) continue;
        const rel = relative(ROOT, f);
        if (rel.startsWith('ai-docs/')) continue;                                 // 文档叙事面：P3 只守代码面
        if (P3_RESIDUE_FILES.has(rel)) continue;                                   // 登记残面（案B'）
        if (patterns.some((re) => re.test(readFileSync(f, 'utf8')))) offenders.push(rel);
      }
      A("P3-1 全代码面 sql/ 引用仅剩登记残面（neg 族+legacy 夹具+孤儿+manifest/拷贝·案B'）", offenders.length === 0);
      if (offenders.length) console.log('  ✗ 未登记引用:', offenders.join(', '));
    }

    // ── P4 fresh deploy 重建（runner 实测） ────────────────────────────────
    const files = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort();
    const rows = (await pool.query('SELECT version FROM schema_migrations')).rows.map((r: { version: string }) => r.version);
    A(`P4-1 schema_migrations 行数=${rows.length} = 迁移文件数=${files.length}（fresh deploy 全链落账）`, rows.length === files.length);
    const col = async (t: string, c: string) => (await pool.query('SELECT 1 FROM information_schema.columns WHERE table_name=$1 AND column_name=$2', [t, c])).rowCount === 1;
    A('P4-2 resume_quiz.expires_at 存在（0007+0135 链·sql/20 的替代证明）', await col('resume_quiz', 'expires_at'));
    A('P4-3 0019 封口：admin_audit 存在', (await reg('admin_audit')) !== null);
    A('P4-4 0019 封口：question_feedback 存在', (await reg('question_feedback')) !== null);
    A('P4-5 0019 封口：learning_progress 存在', (await reg('learning_progress')) !== null);
    A('P4-6 0019 封口：user_account.is_admin 存在', await col('user_account', 'is_admin'));

    // P4⑤ 对象类承载机器断言：临时库重放 sql/ → 四类名录 diff（sql ⊆ mig·逐名打印·豁免登记）
    {
      const tempDb = '_dbhy1_fixture';
      await pool.query(`DROP DATABASE IF EXISTS ${tempDb}`);
      await pool.query(`CREATE DATABASE ${tempDb}`);
      const fixture = new Client({ host: process.env.PGHOST, port: Number(process.env.PGPORT), user: process.env.PGUSER, password: process.env.PGPASSWORD, database: tempDb });
      await fixture.connect();
      try {
        // 角色中和（drift-check 同款）：临时库不动 cluster 角色
        const neutralize = (s: string) => s
          .replace(/EXECUTE 'DROP OWNED BY app_role';\s*EXECUTE 'DROP ROLE app_role';/g, 'NULL;')
          .replace(/EXECUTE 'DROP OWNED BY app_gateway_role';\s*EXECUTE 'DROP ROLE app_gateway_role';/g, 'NULL;')
          .replace(/CREATE ROLE app_role NOLOGIN\s*;/gi, 'DO $ir$ BEGIN CREATE ROLE app_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $ir$;')
          .replace(/CREATE ROLE app_gateway_role NOLOGIN\s*;/gi, 'DO $ir$ BEGIN CREATE ROLE app_gateway_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $ir$;');
        for (const f of readdirSync(SQL_DIR).filter((x) => x.endsWith('.sql')).sort()) {
          await fixture.query(neutralize(readFileSync(join(SQL_DIR, f), 'utf8')));
        }
        const LISTS = {
          functions: `SELECT p.oid::regprocedure::text AS name FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
              WHERE n.nspname='public' AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid=p.oid AND d.deptype='e') ORDER BY 1`,
          triggers: `SELECT DISTINCT trigger_name AS name FROM information_schema.triggers WHERE trigger_schema='public' ORDER BY 1`,
          policies: `SELECT schemaname||'.'||tablename||':'||policyname AS name FROM pg_policies WHERE schemaname='public' ORDER BY 1`,
          indexes: `SELECT i.indexname AS name FROM pg_indexes i WHERE i.schemaname='public'
              AND i.indexname NOT IN (SELECT conname FROM pg_constraint WHERE contype IN ('p','u')) ORDER BY 1`,
        } as const;
        let missingTotal = 0;
        for (const [klass, q] of Object.entries(LISTS)) {
          const sqlSide = new Set((await fixture.query(q)).rows.map((r: { name: string }) => r.name));
          const migSide = new Set((await pool.query(q)).rows.map((r: { name: string }) => r.name));
          const missing = [...sqlSide].filter((n) => !migSide.has(n));
          const unregistered = missing.filter((n) => !P4_OBJECT_EXEMPTIONS.has(`${klass}:${n}`));
          console.log(`  P4⑤ ${klass}: sql=${sqlSide.size} mig=${migSide.size} 缺=${missing.length}（豁免登记=${missing.length - unregistered.length}）`);
          for (const n of missing) console.log(`    - [${klass}] ${n}${P4_OBJECT_EXEMPTIONS.has(`${klass}:${n}`) ? '（豁免·' + P4_OBJECT_EXEMPTIONS.get(`${klass}:${n}`) + '）' : '（未登记=红）'}`);
          missingTotal += unregistered.length;
        }
        A('P4⑤ 对象类承载：sql/ 侧四类名录 ⊆ 迁移侧（未登记缺口=0·逐名打印入 attempts）', missingTotal === 0);
      } finally {
        await fixture.end();
        await pool.query(`DROP DATABASE IF EXISTS ${tempDb}`);
      }
    }

    // ── P5 qbank 分区释放例程（0146·正门路径:ingestQbank + asQbankControlExecutor·不绕任何 trigger） ──
    {
      const DIM2 = 512, TAX = 'v1', SCOPE2 = 'backend/nodejs';   // 0086:375 迁移内建 taxonomy
      const unusedEmbedder = { dim: DIM2, id: 'dbhy1-proof:v1', embed: async () => { throw new Error('dbhy1_embedder_must_not_be_called'); } } as const;
      const mkVec = () => '[' + Array.from({ length: DIM2 }, (_, i) => ((i % 7) + 1) / 10).join(',') + ']';
      const RECIPE_MANIFEST = { schema: 'qbank-embedding-recipe:v1', provider: 'dbhy1', model: 'dbhy1-proof:v1', providerRevision: 'r1', dimensions: DIM2, chunkerVersion: 'whole:v1', normalizationVersion: 'nfc:v1', documentPrefixVersion: 'none:v1', queryPrefixVersion: 'none:v1' };
      const recipeHash = createHash('sha256').update(JSON.stringify(RECIPE_MANIFEST)).digest('hex');
      const recipeId = 'qrecipe-' + recipeHash.slice(0, 32);
      const vecByRef = new Map<string, string>();
      const ingest = async (refs: string[]) => {
        const items = refs.map((r) => { vecByRef.set(r, mkVec()); return { refId: r, text: `DBHY-1 例程冒烟语料 ${r} alpha bravo`, taxonomyVersion: TAX, servingScopeId: SCOPE2, annotationSource: 'seed_v1_reviewed' }; });
        const n = await ingestQbank(pool, items as any, unusedEmbedder as any);
        if (n !== items.length) throw new Error(`dbhy1_ingest_short:${n}/${items.length}`);
      };
      const factsSnapshot = () => asQbankControlExecutor(pool, async (c: any) => {
        const e = await c.query('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton=true');
        const rows = await c.query(
          `SELECT ch.ref_id, ch.content_hash, cs.taxonomy_version, cs.serving_scope_id
             FROM qbank_chunk ch
             JOIN qbank_pool_entry pool ON pool.ref_id=ch.ref_id AND pool.source_id=ch.source_id AND pool.content_hash=ch.content_hash
             JOIN qbank_source source ON source.id=pool.source_id AND source.content_hash=pool.content_hash
             JOIN qbank_chunk_serving_scope cs ON cs.ref_id=ch.ref_id
            WHERE source.status='approved'
            ORDER BY ch.ref_id, cs.taxonomy_version, cs.serving_scope_id`, []);
        return { epoch: String(e.rows[0].epoch), facts: rows.rows.map((r: any) => ({ refId: String(r.ref_id), contentHash: String(r.content_hash), taxonomyVersion: String(r.taxonomy_version), servingScopeId: String(r.serving_scope_id) })) };
      });
      const mkGeneration = async (validate: boolean): Promise<string> => {
        await asQbankControlExecutor(pool, (c: any) => c.query(
          `INSERT INTO qbank_embedding_recipe(id,recipe_hash,provider,model,provider_revision,dimensions,chunker_version,normalization_version,document_prefix_version,query_prefix_version,manifest)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb) ON CONFLICT (recipe_hash) DO NOTHING`,
          [recipeId, recipeHash, RECIPE_MANIFEST.provider, RECIPE_MANIFEST.model, RECIPE_MANIFEST.providerRevision, DIM2, RECIPE_MANIFEST.chunkerVersion, RECIPE_MANIFEST.normalizationVersion, RECIPE_MANIFEST.documentPrefixVersion, RECIPE_MANIFEST.queryPrefixVersion, JSON.stringify(RECIPE_MANIFEST)]));
        const { epoch, facts } = await factsSnapshot();
        const gen = 'qgen-' + randomUUID();
        await asQbankControlExecutor(pool, async (c: any) => {
          await c.query(`INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state) VALUES ($1,$2,$3::bigint,$4,'building')`, [gen, recipeId, epoch, facts.length]);
          await c.query('SELECT qbank_prepare_generation_partition($1)', [gen]);
        });
        await asQbankControlExecutor(pool, async (c: any) => {
          const params: unknown[] = [];
          const values = facts.map((f: any, i: number) => {
            const v = vecByRef.get(f.refId);
            if (!v) throw new Error('dbhy1_missing_vector:' + f.refId);
            const q = i * 6;
            params.push(gen, f.refId, f.taxonomyVersion, f.servingScopeId, f.contentHash, v);
            return `($${q + 1},$${q + 2},$${q + 3},$${q + 4},$${q + 5},$${q + 6}::vector)`;
          }).join(',');
          await c.query(`INSERT INTO qbank_generation_chunk(generation_id,ref_id,taxonomy_version,serving_scope_id,content_hash,embedding) VALUES ${values}`, params);
        });
        if (validate) await asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_validate_generation($1)', [gen]));
        return gen;
      };
      const activate = (g: string) => asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_activate_generation($1)', [g]));
      const release = async (g: string) => { await pool.query("SELECT set_config('app.principal_user','__system_qbank__',false)"); await pool.query('SELECT qbank_release_retired_generation_storage($1)', [g]); };
      // plpgsql RAISE USING ERRCODE='check_violation' → node-pg e.code=SQLSTATE '23514'（insufficient_privilege→'42501'）
      const SQLSTATE: Record<string, string> = { check_violation: '23514', insufficient_privilege: '42501' };
      const expectRejected = async (label: string, g: string, code: string) => {
        try { await release(g); A(`${label}（拒绝·${code}）`, false); }
        catch (e: any) { A(`${label}（拒绝·${code}）`, String(e?.code) === SQLSTATE[code]); }
      };
      const part = (g: string) => `qbank_generation_chunk_${g.slice(5).replaceAll('-', '')}`;
      const epochNow = async () => Number((await pool.query('SELECT epoch FROM qbank_corpus_epoch WHERE singleton')).rows[0].epoch);

      await ingest(['dbhy1:a', 'dbhy1:b', 'dbhy1:bump']);
      const G1 = await mkGeneration(true);
      await activate(G1);
      const G2 = await mkGeneration(true);
      await activate(G2);   // G1 → retired·两次构建间 corpus 未动（epoch 相同）

      const evi = async (g: string) => (await pool.query('SELECT ref_id FROM qbank_generation_evidence($1,ARRAY[$2,$3],64) ORDER BY ref_id', [g, 'dbhy1:a', 'dbhy1:b'])).rows;
      const annBefore = await evi(G2);
      A('P5-1 G2 active 后 G1=retired（元数据在产）', (await pool.query('SELECT state FROM qbank_vector_generation WHERE id=$1', [G1])).rows[0].state === 'retired');
      const e1 = await epochNow();
      await expectRejected('P5-2 corpus 未前进时释放 retired 代被拒（回滚窗口守卫·check_violation）', G1, 'check_violation');
      // corpus 前进：撤销 bump 源（rag03 同款 sanctioned 路径·可见性变化→corpus+cache epoch bump）
      await asQbankControlExecutor(pool, (c: any) => c.query(
        `UPDATE qbank_source s SET status='rejected', reviewed_by='dbhy1-proof', review_note='dbhy1 corpus bump', reviewed_at=now(), version=version+1
          WHERE s.status='approved' AND s.id IN (SELECT ch.source_id FROM qbank_chunk ch WHERE ch.ref_id='dbhy1:bump')`));
      const e2 = await epochNow();
      A(`P5-3 corpus epoch 已前进（${e1} → ${e2}·回滚窗口关闭）`, e2 > e1);
      await release(G1);
      A('P5-4 G1 分区已 DETACH+DROP（to_regclass NULL·HNSW 随表落）', (await pool.query('SELECT to_regclass($1) r', ['public.' + part(G1)])).rows[0].r === null);
      A('P5-5 G1 元数据行保留且 storage_released_at 落时间戳（审计面不抹）', (await pool.query('SELECT storage_released_at IS NOT NULL AS r FROM qbank_vector_generation WHERE id=$1', [G1])).rows[0].r === true);
      const annAfter = await evi(G2);
      A('P5-6 active 代(G2) evidence 不受释放影响（G-R4-5 闭面零波及负门）', JSON.stringify(annBefore) === JSON.stringify(annAfter) && annAfter.length === 2);
      await expectRejected('P5-7 释放 active 代被拒（check_violation）', G2, 'check_violation');
      await expectRejected('P5-8 幂等门：二次释放被拒（check_violation）', G1, 'check_violation');
      await expectRejected('P5-9 unknown 代被拒（check_violation）', 'qgen-' + randomUUID(), 'check_violation');
      const G3 = await mkGeneration(false);   // 保持 building
      await expectRejected('P5-10 building 代释放被拒（check_violation）', G3, 'check_violation');
      try {
        await pool.query("SELECT set_config('app.principal_user','mallory',false)");
        await pool.query('SELECT qbank_release_retired_generation_storage($1)', [G1]);
        A('P5-11 非 __system_qbank__ 释放被拒（insufficient_privilege）', false);
      } catch (e: any) { A('P5-11 非 __system_qbank__ 释放被拒（insufficient_privilege）', String(e?.code) === '42501'); }
      await pool.query("SELECT set_config('app.principal_user','__system_qbank__',false)");
      // failed 代同样可释放（半成品分区回收·guard4 仅约束 retired）
      const G4 = await mkGeneration(false);
      await asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_mark_generation_failed($1,$2)', [G4, 'dbhy1-fixture']));
      await release(G4);
      A('P5-12 failed 代分区回收（to_regclass NULL）', (await pool.query('SELECT to_regclass($1) r', ['public.' + part(G4)])).rows[0].r === null);
      A('P5-13 active 指针仍=G2（释放不动控制面）', (await pool.query('SELECT generation_id FROM qbank_active_generation WHERE singleton')).rows[0].generation_id === G2);
    }

    // ── P6 deprecated 标注（0145） ─────────────────────────────────────────
    {
      const cols: Array<readonly [string, string]> = [['interview', 'questions'], ['assessment_report', 'dimensions'], ['learning_plan', 'items'], ['career_path', 'milestones']];
      let all = true;
      for (const [t, c] of cols) {
        const r = (await pool.query(`SELECT col_description('public.${t}'::regclass, attnum) AS d FROM pg_attribute
            WHERE attrelid='public.${t}'::regclass AND attname='${c}' AND NOT attisdropped LIMIT 1`)).rows[0];
        if (!String(r?.d ?? '').includes('DEPRECATED')) { all = false; console.log(`  ✗ ${t}.${c} 无 DEPRECATED 标注`); }
      }
      A('P6-1 四 jsonb 老列 pg_description 含 DEPRECATED（规范冻结·拆表另刀）', all);
    }

    console.log(`\n${failures === 0 ? `✓ DBHY-1 prove ${assertions} 断言全绿` : `✗ ${failures}/${assertions} 失败`}`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    await pool.end();
  }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
