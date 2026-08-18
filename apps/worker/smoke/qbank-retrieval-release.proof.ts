/** Structural gate for the frozen qbank retrieval holdout; no model or database call is made here. */
import { QBANK_ARTIFACTS } from '../src/qbank-seed.ts';
import { QBANK_RETRIEVAL_RELEASE, validateQbankRetrievalRelease } from './qbank-retrieval-release.ts';

function assertion(label: string, ok: boolean): void {
  if (!ok) throw new Error(`qbank_retrieval_release_assertion_failed:${label}`);
  console.log(`PASS  ${label}`);
}

validateQbankRetrievalRelease();
const artifactIds = new Set(QBANK_ARTIFACTS.map((artifact) => artifact.id));
const tags = new Map<string, number>();
for (const item of QBANK_RETRIEVAL_RELEASE) for (const tag of item.tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);

assertion('frozen holdout has 35 natural-language cases', QBANK_RETRIEVAL_RELEASE.length === 35);
assertion('every qrel resolves to a current whole-question artifact', QBANK_RETRIEVAL_RELEASE.every((item) => item.relevantQuestionIds.every((id) => artifactIds.has(id))));
assertion('adversarial coverage includes paraphrase typo mixed-language multi-evidence constraint and ambiguity',
  ['paraphrase', 'typo', 'mixed_language', 'multi_evidence', 'constraint', 'ambiguous'].every((tag) => (tags.get(tag) ?? 0) >= 1));
assertion('multi-evidence queries are materially represented', QBANK_RETRIEVAL_RELEASE.filter((item) => item.tags.includes('multi_evidence')).length >= 8);
console.log('✓ qbank retrieval release fixture is valid; run qbank:retrieval:eval for the live embedding result.');
