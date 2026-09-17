import {
  assertLegacyInterviewGraphDisabled,
  isProductionNodeEnv,
  productionRequiresTrackLocal,
} from '../src/production-config.ts';

let failures = 0;
function A(name: string, value: boolean): void {
  console.log(`${value ? 'PASS' : 'FAIL'}  ${name}`);
  if (!value) failures++;
}
function rejects(env: Record<string, string | undefined>): boolean {
  try { assertLegacyInterviewGraphDisabled(env); return false; } catch (error: unknown) { return error instanceof Error && error.message === 'legacy_interview_graph_disabled'; }
}

A('生产组合根显式 ADAPTIVE_INTERVIEW=0 时拒绝启动旧固定题单', rejects({ ADAPTIVE_INTERVIEW: '0' }));
A('未配置或非旧图值不会误杀自适应图启动', !rejects({}) && !rejects({ ADAPTIVE_INTERVIEW: '1' }));
A('isProductionNodeEnv: production (case/trim)', isProductionNodeEnv({ NODE_ENV: ' production ' }) && isProductionNodeEnv({ NODE_ENV: 'PRODUCTION' }));
A('isProductionNodeEnv: non-production', !isProductionNodeEnv({}) && !isProductionNodeEnv({ NODE_ENV: 'development' }));
A('F1 deploy: production + missing trackLocal → require fail-closed', productionRequiresTrackLocal(false, { NODE_ENV: 'production' }));
A('F1 deploy: production + trackLocal present → ok', !productionRequiresTrackLocal(true, { NODE_ENV: 'production' }));
A('F1 deploy: development missing trackLocal → compat allowed', !productionRequiresTrackLocal(false, { NODE_ENV: 'development' }));
console.log(`\n${failures === 0 ? '✓ worker 生产图配置证明通过' : `✗ ${failures} 项失败`}`);
process.exit(failures ? 1 : 0);
