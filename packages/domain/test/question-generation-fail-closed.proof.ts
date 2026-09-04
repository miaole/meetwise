/**
 * TC-MODEL-ROUTE-04-main: missing keys / timeouts / malformed invoke tokens
 * classify to structured errors. A success path must not be marked unavailable.
 */
import {
  classifyQuestionGenerationError,
  unavailableGeneration,
  approvedTemplateGeneration,
  normalizeQuestionGenerationResult,
  resolveCitedSources,
} from '../src/question-generation.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

A('缺 Key / 未派发 → provider_not_configured',
  classifyQuestionGenerationError('deterministic_refusal') === 'provider_not_configured'
  && classifyQuestionGenerationError('provider_rejected') === 'provider_not_configured'
  && classifyQuestionGenerationError('model_operation_policy_required') === 'provider_not_configured'
  && classifyQuestionGenerationError('embedder_not_configured') === 'provider_not_configured');

A('超时 → provider_timeout',
  classifyQuestionGenerationError('model_execution_timeout') === 'provider_timeout'
  && classifyQuestionGenerationError('model_prepare_timeout') === 'provider_timeout'
  && classifyQuestionGenerationError('external_request_timeout') === 'provider_timeout');

A('畸形 schema / JSON → schema_invalid / provider_malformed',
  classifyQuestionGenerationError('schema_validation_failed') === 'schema_invalid'
  && classifyQuestionGenerationError('external_response_json_invalid') === 'provider_malformed'
  && classifyQuestionGenerationError('asr_malformed') === 'provider_malformed');

A('已派发未知 → external_outcome_unknown',
  classifyQuestionGenerationError('external_outcome_unknown') === 'external_outcome_unknown');

A('业务校验 reason 不丢成 generic',
  classifyQuestionGenerationError('business:unknown_retrieval_reference') === 'business_invalid');

A('空/超长错误码 fail-closed 为 generation_unavailable，不猜测',
  classifyQuestionGenerationError('') === 'generation_unavailable'
  && classifyQuestionGenerationError('x'.repeat(201)) === 'generation_unavailable');

const miss = unavailableGeneration('provider_not_configured', { invokeError: 'deterministic_refusal', operationId: 'interview.question-generation.v1' });
A('失败结果不得带题面字段',
  miss.ok === false && miss.provenance.origin === 'unavailable' && miss.provenance.errorCode === 'provider_not_configured'
  && !('question' in miss));

const tmpl = approvedTemplateGeneration('请结合你的实际经验说明一次关键取舍。');
A('批准模板 provenance 显式，不是 unavailable 也不是静默模型题',
  tmpl.ok === true && tmpl.provenance.origin === 'approved_template' && tmpl.sources.length === 0);

A('空题面的旧 seam 归一成失败，不发明内容',
  normalizeQuestionGenerationResult({ question: '   ', sources: ['qbank:x'] }).ok === false);

A('合法旧 seam 保留题面且标 origin=model（测试夹具，非生产失败路径）',
  (() => {
    const n = normalizeQuestionGenerationResult({ question: '怎么做限流？', sources: ['qbank:a'] });
    return n.ok === true && n.question === '怎么做限流？' && n.provenance.origin === 'model';
  })());

A('无检索材料时 leftover refs 丢弃为空，不 fail-close',
  (() => {
    const r = resolveCitedSources([], ['qbank:a', 'https://allow.example/deep']);
    return r.ok === true && r.sources.length === 0;
  })());

A('有检索材料时未知 ref 仍 fail-closed',
  (() => {
    const r = resolveCitedSources(['qbank:a'], ['qbank:a', 'qbank:invented']);
    return r.ok === false && r.reason === 'unknown_retrieval_reference';
  })());

A('有检索材料时已知 ref 原样保留',
  (() => {
    const r = resolveCitedSources(['qbank:a', 'https://allow.example/deep'], ['qbank:a']);
    return r.ok === true && r.sources.length === 1 && r.sources[0] === 'qbank:a';
  })());

console.log(`\n${fail === 0 ? '✓ question-generation fail-closed classifier passed' : `✗ ${fail} failed`}`);
process.exit(fail === 0 ? 0 : 1);
