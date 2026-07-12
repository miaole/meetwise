/**
 * 部署运行路径守卫：防"容器用 tsx、gate 用 swc"的工具链漂移(实跑部署才抓到的 Nest DI 静默失效)。
 * 断言:容器命令必须用 serve/start(= @swc-node/register,发 emitDecoratorMetadata),绝不用 tsx 跑 main。
 * 配合 `docker compose config -q`(编排合法)组成 deploy:check。
 */
import { readFileSync } from 'node:fs';

const compose = readFileSync('docker/compose.prod.yml', 'utf8');
const dockerfile = readFileSync('Dockerfile', 'utf8');
const apiPkg = JSON.parse(readFileSync('apps/api/package.json', 'utf8'));
const workerPkg = JSON.parse(readFileSync('apps/worker/package.json', 'utf8'));

const fails = [];
const must = (cond, msg) => { if (!cond) fails.push(msg); };

// ① 容器命令用 serve/start,不用 tsx 跑 main(tsx 不发装饰器元数据 → Nest DI 失效)
must(/apps\/api","serve"/.test(compose), 'compose api 应 command: pnpm -C apps/api serve');
must(/apps\/worker","start"/.test(compose), 'compose worker 应 command: pnpm -C apps/worker start');
must(!/"tsx","src\/main/.test(compose), 'compose 不得用 tsx 跑 main(DI 元数据缺失)');
must(/apps\/api","serve"/.test(dockerfile) && !/"tsx","src\/main/.test(dockerfile), 'Dockerfile CMD 应 serve、非 tsx main');
// ② serve/start 脚本确实走 @swc-node/register(发元数据,与 gate api:validate 同路径)
must(/@swc-node\/register/.test(apiPkg.scripts?.serve ?? ''), 'apps/api serve 必须经 @swc-node/register');
must(/@swc-node\/register/.test(workerPkg.scripts?.start ?? ''), 'apps/worker start 必须经 @swc-node/register');

// ③ 部署迁移:compose 挂载 sql 目录做 init-scripts;只放真迁移、不放 psql 证明(否则部署首启会跑证明)
import { readdirSync, readFileSync as rf } from 'node:fs';
must(/packages\/db\/sql:\/docker-entrypoint-initdb\.d/.test(compose), 'compose 须挂载 sql 为 init-scripts(部署自动建表)');
const sqls = readdirSync('packages/db/sql').filter((f) => f.endsWith('.sql')).sort();
must(sqls.length >= 14 && sqls[0].startsWith('01'), `sql 迁移按序齐全(现 ${sqls.length} 个,01 起)`);
// init 路径不得含 psql 元命令证明(\set/\pset)——那是证明非迁移,会污染部署首启
const proofInInit = sqls.filter((f) => /\\(set|pset)\b/.test(rf(`packages/db/sql/${f}`, 'utf8')));
must(proofInInit.length === 0, `init 路径混入 psql 证明文件:${proofInInit.join(',')}（应移出 sql/）`);

if (fails.length) { console.error('✗ 部署校验失败:\n  - ' + fails.join('\n  - ')); process.exit(1); }
console.log(`✓ deploy-check-ok（命令经 @swc-node/register 无 tsx 漂移 · ${sqls.length} 个迁移挂载为 init-scripts 自动建表）`);
