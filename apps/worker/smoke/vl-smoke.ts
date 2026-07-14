/**
 * 多模态(视觉)实测:qwen-vl-max 能否读懂简历图片并结构化。手动,需 .env 的 MODEL_API_KEY。
 *   pnpm vl:smoke
 * 走同一 openAICompatibleClient(多模态 content)+ 版本化 prompt(resume.vision)。验证视觉够不够用。
 */
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { openAICompatibleClient, promptedModel } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const IMG = process.env.SMOKE_IMAGE ?? './.smoke/resume.png';   // 手动 live smoke:置 SMOKE_IMAGE 指向本地图片(默认 .smoke/,gitignored)
const VisionSchema = z.object({ skills: z.array(z.string()), experience: z.array(z.string()), phone: z.string().nullable() });

async function main() {
  const dataUri = 'data:image/png;base64,' + readFileSync(IMG).toString('base64');
  const client = openAICompatibleClient({ model: 'qwen-vl-max' });    // 视觉模型
  console.log('model: qwen-vl-max | image bytes:', readFileSync(IMG).length);
  const model = promptedModel(client, 'resume.vision', {}, [dataUri]);
  const r = await model.call(1);
  if (!r.ok) { console.log('✗ 视觉调用未贯通:', (r as any).kind, '——可能模型名/多模态格式/账号未开通 qwen-vl'); process.exit(1); }
  const parsed = VisionSchema.safeParse(r.raw);
  console.log('raw:', JSON.stringify(r.raw));
  if (!parsed.success) { console.log('✗ 输出不符 schema(读到了但结构不对):', parsed.error.issues.slice(0, 2)); process.exit(1); }
  const v = parsed.data;
  const skillsBlob = v.skills.join(' ');
  const readSkills = ['Redis', '限流', 'MySQL'].filter((s) => skillsBlob.includes(s));
  const readPhone = (v.phone ?? '').includes('13800138000');
  console.log('提取技能:', v.skills, '| 经历:', v.experience, '| 电话:', v.phone);
  console.log(`命中技能 ${readSkills.length}/3 (${readSkills.join(',')}) | 电话识别:${readPhone}`);
  const enough = readSkills.length >= 2 && readPhone;
  console.log(enough ? '✓ qwen-vl-max 能准确读懂简历图片(视觉够用)' : '⚠ 读到了但准确度不足(够不够用看这里)');
  process.exit(enough ? 0 : 2);
}
main().catch((e) => { console.error('✗ 异常', e?.message ?? e); process.exit(1); });
