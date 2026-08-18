/**
 * 非网络 fixture gate：防止 RAG 对抗集在后续维护中退化回仅有改写/单证据的 happy-path。
 * 它不生成或声称任何模型质量数字；真实 embedding 和 pgvector 路径由 rag-adversarial-*.ts 测量。
 */
import {
  ADVERSARIAL_QUERIES,
  ADVERSARIAL_STRESSORS,
  validateAdversarialFixture,
} from './retrieval-adversarial-golden.ts';

let failures = 0;
const assert = (label: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`);
  if (!condition) failures++;
};

try {
  validateAdversarialFixture();
  const extendedAnswerable = ADVERSARIAL_QUERIES.filter((q) => !q.noAnswer);
  const extendedNoAnswer = ADVERSARIAL_QUERIES.filter((q) => q.noAnswer);
  const requiredStressors = ['anaphora', 'typo', 'mixed_language', 'negation', 'multi_hop', 'no_answer', 'prompt_injection', 'repeated_noise', 'freshness_conflict', 'sensitive_action'] as const;

  assert('当前发布集含 45 answerable + 12 no-answer，且每条 answerable 都有至少一条金标证据', extendedAnswerable.length === 45 && extendedNoAnswer.length === 12 && extendedAnswerable.every((q) => q.relevant.length > 0));
  assert('12 条 no-answer 均没有伪造 local evidence，且均指定 web 与拒绝/澄清边界', extendedNoAnswer.length === 12 && extendedNoAnswer.every((q) => q.relevant.length === 0 && q.noAnswerBoundary));
  assert('至少 8 条 no-answer 要求 reject_or_clarify，防止把“不命中”错误升级为 web', extendedNoAnswer.filter((q) => q.noAnswerBoundary === 'reject_or_clarify').length >= 8);
  for (const tag of requiredStressors) assert(`${tag} 压力标签至少覆盖 1 条`, ADVERSARIAL_STRESSORS[tag].length > 0);
  console.log(`\n样本计数：release=${ADVERSARIAL_QUERIES.length}; answerable=${extendedAnswerable.length}; no_answer=${extendedNoAnswer.length}`);
} catch (error) {
  failures++;
  console.error('FAIL  fixture structural validation:', error instanceof Error ? error.message : error);
}

console.log(failures === 0 ? '✓ RAG adversarial fixture gate 通过（结构与覆盖，不代表检索质量）' : `✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
