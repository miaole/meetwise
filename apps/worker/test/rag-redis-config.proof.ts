import { isProductionEnvironment, resolveRagRedisCacheConfig } from '../src/rag-redis-cache.ts';
import { resolveRagCostGovernance } from '../src/rag-cost-governance.ts';
import { resolveModelCostGovernance } from '../src/model-cost-governance.ts';

let failures = 0;
const check = (name: string, condition: boolean) => { console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`); if (!condition) failures++; };
const rejects = (env: NodeJS.ProcessEnv, code: string) => {
  try { resolveRagRedisCacheConfig(env); return false; }
  catch (error) { return String(error).includes(code); }
};

const base = { RAG_REDIS_URL: 'rediss://cache.internal:6380/0', RAG_REDIS_TOPOLOGY: 'standalone' } as NodeJS.ProcessEnv;

check('Production（大小写混合）被统一识别为生产环境', isProductionEnvironment({ NODE_ENV: 'Production' }));
check('大小写混合的生产环境不能把 RAG 费用治理降为 observe（观察）', (() => {
  try { resolveRagCostGovernance({ NODE_ENV: 'Production', RAG_COST_ENFORCEMENT: 'observe' }); return false; } catch { return true; }
})());
check('大小写混合的生产环境不能把模型费用治理降为 observe（观察）', (() => {
  try { resolveModelCostGovernance({ NODE_ENV: 'Production', MODEL_COST_ENFORCEMENT: 'observe' }); return false; } catch { return true; }
})());
check('生产环境拒绝明文 redis://', rejects({ ...base, NODE_ENV: 'Production', RAG_REDIS_URL: 'redis://cache.internal:6379/0' }, 'rag_redis_tls_required_in_production'));
check('生产环境拒绝缺失 hostname 的 rediss URL', rejects({ ...base, NODE_ENV: 'production', RAG_REDIS_URL: 'rediss:///' }, 'rag_redis_url_host_missing'));
check('生产环境拒绝回环 Tair/Redis 目标', rejects({ ...base, NODE_ENV: 'PRODUCTION', RAG_REDIS_URL: 'rediss://127.0.0.2:6380/0' }, 'rag_redis_production_loopback_forbidden'));
check('生产环境拒绝不可读取的 TLS CA（证书颁发机构）文件', rejects({ ...base, NODE_ENV: 'production', RAG_REDIS_TLS_CA_PATH: '/definitely/missing/ca.pem' }, 'rag_redis_tls_ca_unreadable'));
const cfg = resolveRagRedisCacheConfig({ ...base, NODE_ENV: 'Production' });
check('有效生产 rediss 配置显式开启证书校验与 server name（服务名）', cfg.tls && cfg.tlsServerName === 'cache.internal');

if (failures) process.exit(1);
console.log('✓ Redis/Tair 配置故障关闭 proof 全部通过；真实 TLS/认证/DNS 故障仍需专用云测试目标验证。');
