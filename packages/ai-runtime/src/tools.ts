/**
 * Agent 工具系统(把"workflow 插模型调用"升级为"会调工具的 agent")。两条架构师级铁律:
 *  ① **工具入参不可信**:args 是模型产出 → dispatch **必先 zod 校验再 invoke**(校验不过绝不执行工具,防工具注入/越权)。
 *  ② **工具循环有界**:runToolLoop 封顶 maxSteps(防模型无限调工具烧钱/打转);失败的工具调用也记入轨迹,模型可据此改道。
 * 与 invoke 关口分层:invoke 守"模型输出双校验";tools 守"模型决定调的工具入参校验 + 调用编排"。两者正交、各自可测。
 */
import type { z } from 'zod';

export interface Tool<A = unknown, R = unknown> {
  name: string;
  description: string;        // 给模型看的工具说明(进 prompt,模型据此决定调不调)
  argsSchema: z.ZodType<A>;   // 入参 schema(不可信 args 的校验门)
  invoke(args: A): Promise<R>;
}

export interface ToolRegistry {
  describe(): { name: string; description: string }[];   // 喂模型的工具清单
  dispatch(name: string, rawArgs: unknown): Promise<{ ok: true; result: unknown } | { ok: false; error: string }>;
}

export function toolRegistry(tools: Tool[]): ToolRegistry {
  const byName = new Map(tools.map((t) => [t.name, t]));
  return {
    describe: () => tools.map((t) => ({ name: t.name, description: t.description })),
    async dispatch(name, rawArgs) {
      const tool = byName.get(name);
      if (!tool) return { ok: false, error: 'unknown_tool:' + name };
      const parsed = tool.argsSchema.safeParse(rawArgs);
      if (!parsed.success) return { ok: false, error: 'invalid_args' };        // 铁律①:校验不过 → 不执行
      try { return { ok: true, result: await tool.invoke(parsed.data) }; }
      catch (e: any) { return { ok: false, error: 'tool_error:' + (e?.message ?? 'unknown') }; }
    },
  };
}

export interface ToolStep { tool: string; args: unknown; result: unknown }
export type ToolDecision = { kind: 'tool'; name: string; args: unknown } | { kind: 'final'; value: unknown };

/**
 * 有界工具循环(ReAct 式):decide(模型,通常经 invoke)看历史 → 出"调工具"或"给终值"。
 * 调工具 → 校验+执行 → 结果回灌历史 → 再 decide,直到终值或 maxSteps 封顶。
 */
export async function runToolLoop(
  decide: (steps: ToolStep[]) => Promise<ToolDecision>,
  registry: ToolRegistry,
  opts: { maxSteps?: number } = {},
): Promise<{ value: unknown; steps: ToolStep[] } | { error: string; steps: ToolStep[] }> {
  const maxSteps = opts.maxSteps ?? 6;
  const steps: ToolStep[] = [];
  for (let i = 0; i < maxSteps; i++) {
    const d = await decide(steps);
    if (d.kind === 'final') return { value: d.value, steps };
    const r = await registry.dispatch(d.name, d.args);
    steps.push({ tool: d.name, args: d.args, result: r.ok === true ? r.result : { error: r.error } });   // 失败也记入,模型可据此改道
  }
  return { error: 'tool_loop_exhausted', steps };   // 铁律②:防无限工具循环
}
