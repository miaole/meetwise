/**
 * 题库语料供给面(H2 QBANK-CORPUS #75/#76/#78):导入件构造 + 逐题 rubric 互异校验 + 非向量近重复门。
 *
 * 职责边界(与 qbank-ingest.ts 的关系):本模块只做**入库前的语料治理**——把扁平导入项组装成
 * `QbankQuestionArtifact`(逐题 prompt/rubric/follow_up/anti_pattern 四 chunk,禁前缀整组复制),
 * 校验同能力域逐题撰写(#76),并跑非向量近重复门(#78:Unicode NFKC 规范化 → 规范化精确 hash →
 * 字符 3-gram shingle Jaccard)。真正写库(治理路径 propose→qbank_source→approve→promoteToPool)
 * 仍由 ingestQbank/ingestQuestionBankArtifacts 承载,本模块零写库零 DB 依赖(纯函数,可离线 prove)。
 *
 * #78 非向量形裁决注记:修法列的「向量近重复(cosine 阈值)」依赖 embedding 计算,归后刀
 * (§4 范围外)。本刀落非向量门并在下方留 `NearDuplicateVectorSeam` 接口缝——后刀可注入
 * 向量 checker,本刀零 embedding 实现零外呼。阈值裁决:卷建议 0.8 起步,但种子自带近重复对
 * (qbank-seed.ts seed:limit-3 vs seed:design-2)实测 3-gram Jaccard=0.289,而同域非重复对
 * 全量实测 ≤0.086(种子 12 题全对实测)——0.8 落不中卷点名要求「如实命中」的种子对,故 EXEC
 * 定 0.2:落在 3 倍以上间隔带内,方向=召回优先(命中只进人工复核队列,不静默拒不静默灌)。
 * 近重复命中 ≠ 拒绝:处置(合并/保留双题打注记)=人工复核位裁决(§3-④)。
 */
import { createHash } from 'node:crypto';
import type { QbankQuestionArtifact, QbankAnnotationSource } from './qbank-ingest.ts';

/** 扁平导入项(导入工具输入形态,§3-①):逐题 refId/题面/能力域/难度/scope/逐题三件套。 */
export interface QbankCorpusImportItem {
  refId: string;
  text: string;
  competency: string;
  difficulty: number;
  taxonomyVersion?: string;
  servingScopeId: string;
  annotationSource?: QbankAnnotationSource;
  rubric: string;
  followUp: string;
  antiPattern: string;
  kind?: 'question_bank' | 'reference_doc';
}

/** 近重复命中:method 登记检出通道,score=Jaccard(0..1),exact_normalized 恒 1。 */
export interface NearDuplicateHit {
  leftRefId: string;
  rightRefId: string;
  score: number;
  method: 'exact_normalized' | 'shingle_jaccard' | 'vector_seam';
}

/**
 * 向量近重复 seam(#78 修法列的 cosine 半·留缝不实现):后刀注入向量 checker 后,导入门可
 * 并入向量通道命中。本刀所有调用点 seam 恒缺省(零 embedding 依赖可断言)。
 */
export interface NearDuplicateVectorSeam {
  nearDuplicate?(normalizedText: string): { score: number; hitRefId: string }[];
}

/** 默认阈值(EXEC 裁决 0.2,依据见文件头注;实测:种子近重复对 0.289 命中,非重复对 ≤0.086 不误报)。 */
export const NEAR_DUP_JACCARD_THRESHOLD = 0.2;

/** shingle n-gram 长度(字符 3-gram:CJK 无分词依赖,短题面仍有稳定区分度)。 */
export const NEAR_DUP_SHINGLE_N = 3;

/** 规范化(§3-④):Unicode NFKC → 小写 → 剔除全部空白/标点(比较形,与展示原文解耦)。 */
export function normalizeCorpusText(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/[\p{Z}\p{P}\p{S}]+/gu, '');
}

/** 规范化精确 hash(sha256 截 32,与 qbank-ingest hashOf 同形;比较域=规范化文本非原文)。 */
export function normalizedCorpusHash(text: string): string {
  return createHash('sha256').update(normalizeCorpusText(text), 'utf8').digest('hex').slice(0, 32);
}

/** 字符 n-gram shingle 集(规范化文本上取,长度不足 n 时退化为全集单串——短文本仍有定义)。 */
export function charShingles(text: string, n = NEAR_DUP_SHINGLE_N): Set<string> {
  const normalized = normalizeCorpusText(text);
  if (normalized.length < n) return normalized.length > 0 ? new Set([normalized]) : new Set();
  const out = new Set<string>();
  for (let i = 0; i + n <= normalized.length; i++) out.add(normalized.slice(i, i + n));
  return out;
}

/** shingle Jaccard:|A∩B| / |A∪B|(双空集=0,不视作重复)。 */
export function shingleJaccard(a: string, b: string, n = NEAR_DUP_SHINGLE_N): number {
  const sa = charShingles(a, n);
  const sb = charShingles(b, n);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const s of sa) if (sb.has(s)) inter += 1;
  return inter / (sa.size + sb.size - inter);
}

export interface NearDuplicateScanInput {
  /** 待扫描文本(refId 唯一;同 refId 重复项=输入错误,由调用方校验先挡)。 */
  items: readonly { refId: string; text: string }[];
  threshold?: number;
  /** 向量 seam(后刀注入;本刀调用点恒缺省=零 embedding 依赖)。 */
  vectorSeam?: NearDuplicateVectorSeam;
}

/**
 * 非向量近重复扫描(纯函数):① 规范化精确 hash 同碰 → exact_normalized 命中(score=1);
 * ② 逐对 3-gram shingle Jaccard ≥ threshold → shingle_jaccard 命中;③ 向量 seam(注入时)命中
 * 以 method='shingle_jaccard' 无法表达 → 登记为独立通道名,防止伪装成词法命中。
 * O(n²) 逐对:导入件批内规模(百级)完全可行;对库比对由调用方把存量 prompt 文本并入 items
 * (见 scripts/qbank-import.cli.ts,存量文本经 control executor 只读取出,规模如实注记)。
 */
export function scanNearDuplicates(input: NearDuplicateScanInput): NearDuplicateHit[] {
  const threshold = input.threshold ?? NEAR_DUP_JACCARD_THRESHOLD;
  const items = input.items;
  const hits: NearDuplicateHit[] = [];
  const byNormHash = new Map<string, string>();
  for (const item of items) {
    const h = normalizedCorpusHash(item.text);
    const prior = byNormHash.get(h);
    if (prior !== undefined && prior !== item.refId) {
      hits.push({ leftRefId: prior, rightRefId: item.refId, score: 1, method: 'exact_normalized' });
    } else {
      byNormHash.set(h, item.refId);
    }
  }
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]!;
      const b = items[j]!;
      if (a.refId === b.refId) continue;
      const score = shingleJaccard(a.text, b.text);
      if (score >= threshold) {
        hits.push({ leftRefId: a.refId, rightRefId: b.refId, score, method: 'shingle_jaccard' });
      }
    }
  }
  const seam = input.vectorSeam;
  if (seam?.nearDuplicate) {
    for (const item of items) {
      for (const v of seam.nearDuplicate(normalizeCorpusText(item.text))) {
        if (v.hitRefId === item.refId) continue;
        hits.push({ leftRefId: item.refId, rightRefId: v.hitRefId, score: v.score, method: 'vector_seam' });
      }
    }
  }
  return hits;
}

/** 逐题 rubric 互异阈值:同 competency 下任两题的三件套文本必须逐字段互异(#76·禁前缀整组复制)。 */
export function assertPerQuestionCoachingDistinct(artifacts: readonly QbankQuestionArtifact[]): void {
  const roleText = (artifact: QbankQuestionArtifact, role: 'rubric' | 'follow_up' | 'anti_pattern'): string =>
    artifact.chunks.filter((c) => c.role === role).map((c) => c.text).join('\n');
  const byCompetency = new Map<string, QbankQuestionArtifact[]>();
  for (const artifact of artifacts) {
    const list = byCompetency.get(artifact.competency) ?? [];
    list.push(artifact);
    byCompetency.set(artifact.competency, list);
  }
  for (const [competency, list] of byCompetency) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        for (const role of ['rubric', 'follow_up', 'anti_pattern'] as const) {
          if (roleText(a, role) === roleText(b, role)) {
            throw new Error(`qbank_question_shared_coaching:${competency}:${a.id}:${b.id}:${role}`);
          }
        }
      }
    }
  }
}

/** 导入项 → 逐题四 chunk artifact(#76:三件套逐题撰写,禁共享复制;prompt+rubric required 沿校验门)。 */
export function buildQuestionArtifact(item: QbankCorpusImportItem): QbankQuestionArtifact {
  const base = `question:${item.refId}`;
  return {
    id: base,
    competency: item.competency,
    difficulty: item.difficulty,
    taxonomyVersion: item.taxonomyVersion ?? 'v1',
    servingScopeId: item.servingScopeId,
    annotationSource: item.annotationSource ?? 'curator_reviewed',
    chunks: [
      { refId: `${base}:prompt`, role: 'prompt', ordinal: 0, required: true, text: `【训练问题】${item.text}\n【能力域】${item.competency}\n请先澄清前提、约束和失败语义，再给出可验证的方案。` },
      { refId: `${base}:rubric`, role: 'rubric', ordinal: 0, required: true, text: `【评分锚点】${item.rubric}\n高分回答必须陈述至少一个可量化指标、一个失败模式和一个验证/回滚步骤。` },
      { refId: `${base}:follow-up`, role: 'follow_up', ordinal: 0, text: `【追问】${item.followUp}` },
      { refId: `${base}:anti-pattern`, role: 'anti_pattern', ordinal: 0, text: `【常见失分】${item.antiPattern}` },
    ],
  };
}
