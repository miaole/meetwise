/** Agent 工具系统证明:入参不可信→校验后才执行(防注入) + 工具循环有界(防无限调用)。 pnpm tools:prove */
import { z } from 'zod';
import { toolRegistry, runToolLoop, type Tool } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

let invoked = 0;
const retr: Tool = { name: 'retrieve', description: '按 query 检索题库', argsSchema: z.object({ query: z.string().min(1), k: z.number().int().max(20) }), async invoke(a: any) { invoked++; return ['q:' + a.query]; } };
const reg = toolRegistry([retr]);

const described = reg.describe();
A('describe 列出工具(喂模型)', described.length === 1 && described[0]?.name === 'retrieve');
let r = await reg.dispatch('retrieve', { query: '限流', k: 3 });
A('合法入参 → 执行返回结果', r.ok === true && (r as any).result[0] === 'q:限流' && invoked === 1);
invoked = 0; r = await reg.dispatch('retrieve', { query: '', k: 999 });
A('非法入参 → 拒绝且**绝不执行工具**(防注入)', r.ok === false && (r as any).error === 'invalid_args' && invoked === 0);
r = await reg.dispatch('nope', {});
A('未知工具 → unknown_tool', r.ok === false && (r as any).error.startsWith('unknown_tool'));

// 工具循环:调一次工具 → 给终值
let step = 0;
const decideOnce = async () => step++ === 0 ? { kind: 'tool' as const, name: 'retrieve', args: { query: 'redis', k: 2 } } : { kind: 'final' as const, value: 'done' };
let loop = await runToolLoop(decideOnce, reg, { maxSteps: 5 });
A('循环:调工具→回灌→终值(轨迹含该步)', 'value' in loop && loop.value === 'done' && loop.steps.length === 1 && loop.steps[0]?.tool === 'retrieve');

// 有界:一直要调工具 → 封顶停(防无限烧钱)
const decideForever = async () => ({ kind: 'tool' as const, name: 'retrieve', args: { query: 'x', k: 1 } });
loop = await runToolLoop(decideForever, reg, { maxSteps: 3 });
A('循环有界:封顶 → tool_loop_exhausted(防无限工具循环)', 'error' in loop && loop.error === 'tool_loop_exhausted' && loop.steps.length === 3);

console.log(`\n${fail === 0 ? '✓ Agent 工具系统(入参校验防注入 + 循环有界)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
