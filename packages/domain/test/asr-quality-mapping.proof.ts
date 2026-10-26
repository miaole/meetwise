/**
 * ASR 裁决映射词表证明（纯函数·零 IO·零 db·零模型）。`pnpm asr-quality:prove` 门②。
 *
 * 三分映射逐臂真断言（能失败的断言，非空泛分类）：
 *   ① 缺省/非串/纯空白 → undefined（调用方不写列=文字作答照旧）；
 *   ② 词表 unavailable 组：word_timestamps_not_available + 四失败码
 *      （asr_timeout/asr_aborted/asr_malformed/asr_not_configured）→ 'unavailable'；
 *      low 组：asr_quality_low → 'low'（真置信适配器接线前零生产者，结构就位）；
 *   ③ 非空而映射不到（自由转写文本/未收编 token）→ 保守兜底 'unavailable'，绝不落缺省 ok。
 * 另 pin：任何输入都不产出 'ok'（伪造 ok=评分谎，Ban 面）。
 */
import { voiceQualityFromAsrOutcome } from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const UNAVAILABLE_GROUP = [
  'word_timestamps_not_available',
  'asr_timeout',
  'asr_aborted',
  'asr_malformed',
  'asr_not_configured',
] as const;

async function main() {
  // ① 缺省/非串/纯空白 → undefined。
  A('缺省不映射：调用方不写列（文字作答照旧）', voiceQualityFromAsrOutcome() === undefined);
  A('空串/纯空白不映射：trim 后为空一律 undefined',
    voiceQualityFromAsrOutcome('') === undefined
    && voiceQualityFromAsrOutcome('   ') === undefined
    && voiceQualityFromAsrOutcome(' \n\t ') === undefined);
  A('非串输入 fail-closed 返回 undefined，不抛错不猜值',
    voiceQualityFromAsrOutcome(undefined) === undefined
    && voiceQualityFromAsrOutcome(123 as unknown as string) === undefined
    && voiceQualityFromAsrOutcome({} as unknown as string) === undefined);

  // ② 词表 unavailable 组（TEXT_ONLY_ASR_OUTCOME+四失败码）。
  A('词表 unavailable 组五 token 逐值映射 unavailable',
    UNAVAILABLE_GROUP.every((token) => voiceQualityFromAsrOutcome(token) === 'unavailable'));

  // ② low 组：asr_quality_low → low（review 触发臂结构就位）。
  A('asr_quality_low 映射 low（真置信申报 token 的唯一 low 臂）',
    voiceQualityFromAsrOutcome('asr_quality_low') === 'low');

  // ③ 非空映射不到 → 保守兜底 unavailable（绝不落缺省 ok）。
  A('自由转写文本（原文直通）兜底 unavailable，不落缺省 ok',
    voiceQualityFromAsrOutcome('我会用 Redis 计数器做限流') === 'unavailable');
  A('未收编 token/未来未知串同样兜底 unavailable',
    voiceQualityFromAsrOutcome('some_future_unknown_token') === 'unavailable'
    && voiceQualityFromAsrOutcome('OK') === 'unavailable'
    && voiceQualityFromAsrOutcome('ok') === 'unavailable');

  // 全域不产出 'ok'。返回类型 union 本身已不含 'ok'（静态层零产出）；
  // 这里再经 widened 读法做运行时兜底断言（直接 !== 'ok' 会因类型无重叠触发 TS2367）。
  const widenedNeverOk = (value: 'unavailable' | 'low' | undefined): boolean => {
    const widened: string | undefined = value;
    return widened !== 'ok';
  };
  const probes = [...UNAVAILABLE_GROUP, 'asr_quality_low', '自由文本', '未知token', '', '   ', undefined, 42 as unknown as string];
  A('任何输入都不产出 ok（伪造 ok 即评分谎）', probes.every((p) => widenedNeverOk(voiceQualityFromAsrOutcome(p))));

  console.log(`\n${failures === 0 ? '✓ ASR 裁决映射词表全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();
