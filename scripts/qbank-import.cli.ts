/**
 * 题库导入工具与审核流程(H2 QBANK-CORPUS #75·§3-①)。
 *
 * 双模式审核门(不静默灌):
 *   plan   : 校验导入件(结构/难度/逐题 rubric 互异)+ 近重复扫描(批内;DB 可达时连存量)→ 输出待审清单,零写库。
 *   commit : 复核后显式执行——重跑全部校验 + 全量近重复扫描(批内+存量,必连 DB);命中且未带
 *            --accept-near-duplicate(人工复核确认位)→ 拦截 EXIT 2;通过 → ingestQuestionBankArtifacts
 *            走既有治理路径(propose→qbank_source→approve→promoteToPool,零新表)。
 *
 * 用法:
 *   node --import tsx scripts/qbank-import.cli.ts plan   --file corpus.json [--out review.json]
 *   node --import tsx scripts/qbank-import.cli.ts commit --file corpus.json --embedder mock|provider
 *        [--accept-near-duplicate] [--annotation-source curator_reviewed|seed_v1_reviewed]
 *
 * 输入形态(QbankCorpusImportItem 数组,§3-①):逐题 refId/text/competency/difficulty(1-5)/
 * servingScopeId(须为已释放 taxonomy 叶)/rubric/followUp/antiPattern(逐题撰写,#76)。
 * annotationSource 默认 curator_reviewed(运营导入);seed_v1_reviewed 须显式指定(内置种子通道语义)。
 *
 * 退出码:0 成功 · 1 导入件校验拒绝 · 2 近重复复核位拦截 · 3 环境/DB 错误。
 * est live=0:prove 仅 --embedder mock(确定性向量,generation 模式下 ingest 本就不调 embed);
 * provider 形(dashscopeEmbedder)仅供运营真实环境,须外部提供 Key,本仓 prove 零外呼。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  assertPerQuestionCoachingDistinct, buildQuestionArtifact, scanNearDuplicates, normalizedCorpusHash,
  validateQuestionArtifacts, ingestQuestionBankArtifacts,
  asQbankControlExecutor, createPool,
  type NearDuplicateHit, type QbankCorpusImportItem, type QbankEmbedder, type QbankQuestionArtifact,
} from '@meetwise/db';

const EXIT_OK = 0, EXIT_INVALID = 1, EXIT_NEAR_DUP_GATE = 2, EXIT_ENV = 3;

interface ImportFile {
  taxonomyVersion?: string;
  annotationSource?: 'curator_reviewed' | 'seed_v1_reviewed';
  servingScopeId?: string;
  items: (Partial<QbankCorpusImportItem> & { refId?: unknown; text?: unknown })[];
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { out[key] = next; i += 1; } else out[key] = 'true';
    }
  }
  return out;
}

/** 确定性 512 维向量 embedder(mock·prove 专用):同文本=同单位向量;generation 模式下不调用。 */
function mockEmbedder(): QbankEmbedder {
  const DIM = 512;
  return {
    id: 'qbank-import-mock:v1',
    dim: DIM,
    async embed(texts: string[]): Promise<number[][]> {
      return texts.map((text) => {
        const v: number[] = [];
        for (let i = 0; i < DIM; i++) {
          const h = createHash('sha256').update(`${text}:${i}`).digest();
          v.push((h[0]! + h[1]! / 256) / 128 - 1);
        }
        const nrm = Math.hypot(...v);
        return v.map((x) => x / nrm);
      });
    },
  };
}

function loadImportFile(path: string): { items: QbankCorpusImportItem[]; annotationSource: 'curator_reviewed' | 'seed_v1_reviewed'; taxonomyVersion: string } {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as ImportFile).items)) {
    throw new Error('qbank_import_file_invalid:items 数组缺失');
  }
  const file = raw as ImportFile;
  const annotationSource = file.annotationSource ?? 'curator_reviewed';
  const taxonomyVersion = file.taxonomyVersion ?? 'v1';
  const items = file.items.map((raw2, index): QbankCorpusImportItem => {
    const item = raw2 as Record<string, unknown>;
    const required = (k: string): string => {
      const v = item[k];
      if (typeof v !== 'string' || !v.trim()) throw new Error(`qbank_import_file_field_missing:items[${index}].${k}`);
      return v;
    };
    const difficulty = item.difficulty;
    if (!Number.isInteger(difficulty) || (difficulty as number) < 1 || (difficulty as number) > 5) {
      throw new Error(`qbank_import_file_field_missing:items[${index}].difficulty(1-5)`);
    }
    return {
      refId: required('refId'),
      text: required('text'),
      competency: required('competency'),
      difficulty: difficulty as number,
      rubric: required('rubric'),
      followUp: required('followUp'),
      antiPattern: required('antiPattern'),
      servingScopeId: (typeof item.servingScopeId === 'string' && item.servingScopeId.trim())
        ? item.servingScopeId
        : (file.servingScopeId ?? ''),
      taxonomyVersion,
      annotationSource,
    };
  });
  return { items, annotationSource, taxonomyVersion };
}

function buildArtifacts(items: QbankCorpusImportItem[]): QbankQuestionArtifact[] {
  return items.map((item) => {
    if (!item.servingScopeId) throw new Error(`qbank_import_scope_missing:${item.refId}`);
    return buildQuestionArtifact(item);
  });
}

/** 存量题面(prompt chunk)文本经 control executor 只读取出(对库近重复比对;规模帽 20000 如实注记)。 */
async function loadExistingPromptTexts(pool: ReturnType<typeof createPool>): Promise<{ refId: string; text: string }[]> {
  return asQbankControlExecutor(pool, async (c) => {
    const r = await c.query(
      `SELECT qc.ref_id AS chunk_ref, ch.content AS content
         FROM qbank_question_chunk qc
         JOIN qbank_chunk ch ON ch.ref_id = qc.ref_id
        WHERE qc.role = 'prompt'
        ORDER BY qc.ref_id
        LIMIT 20000`,
    );
    return r.rows.map((row: { chunk_ref: string; content: string }) => ({
      refId: String(row.chunk_ref).replace(/:prompt$/, ''),
      text: String(row.content),
    }));
  });
}

function nearDupReport(hits: NearDuplicateHit[]): string {
  if (hits.length === 0) return '无';
  return hits.map((h) => `${h.leftRefId} <-> ${h.rightRefId} method=${h.method} score=${h.score.toFixed(3)}`).join('; ');
}

async function main(): Promise<number> {
  const [mode] = process.argv.slice(2);
  const args = parseArgs(process.argv.slice(3));
  if (mode !== 'plan' && mode !== 'commit') {
    console.error('用法: qbank-import.cli.ts <plan|commit> --file corpus.json [--out review.json] [--embedder mock|provider] [--accept-near-duplicate]');
    return EXIT_ENV;
  }
  if (!args.file) { console.error('缺少 --file <corpus.json>'); return EXIT_ENV; }

  let items: QbankCorpusImportItem[];
  let artifacts: QbankQuestionArtifact[];
  try {
    const parsed = loadImportFile(args.file);
    artifacts = buildArtifacts(parsed.items);
    validateQuestionArtifacts(artifacts);
    items = parsed.items;
  } catch (error) {
    console.error(`[导入件校验拒绝] ${(error as Error).message}`);
    return EXIT_INVALID;
  }
  try {
    assertPerQuestionCoachingDistinct(artifacts);
  } catch (error) {
    console.error(`[逐题 rubric 互异校验拒绝·#76] ${(error as Error).message}`);
    return EXIT_INVALID;
  }

  const batchTexts = items.map((item) => ({ refId: item.refId, text: item.text }));
  let pool: ReturnType<typeof createPool> | undefined;
  const wantDb = mode === 'commit' || args.db === 'true';
  if (wantDb) {
    try { pool = createPool({ purpose: 'qbank_import' }); } catch (error) {
      console.error(`[环境] DB 连接失败: ${(error as Error).message}`);
      return EXIT_ENV;
    }
  }

  try {
    const existing = pool ? await loadExistingPromptTexts(pool) : [];
    const hits = scanNearDuplicates({ items: [...batchTexts, ...existing] });
    const reviewList = {
      generatedAt: new Date().toISOString(),
      itemCount: items.length,
      existingCompared: existing.length,
      items: items.map((item) => ({
        refId: item.refId, competency: item.competency, difficulty: item.difficulty,
        servingScopeId: item.servingScopeId, normalizedHash: normalizedCorpusHash(item.text),
        text: item.text,
      })),
      nearDuplicateHits: hits,
    };
    if (args.out) writeFileSync(args.out, JSON.stringify(reviewList, null, 2), 'utf8');

    console.log(`[plan] 导入件 ${items.length} 条·结构校验 PASS·逐题 rubric 互异 PASS(#76)`);
    console.log(`[近重复扫描] 批内${existing.length > 0 ? `+存量 ${existing.length} 条` : '(仅批内;commit 模式必连存量)'}: ${nearDupReport(hits)}`);
    if (args.out) console.log(`[待审清单] 已写出 ${args.out}(零写库)`);

    if (mode === 'plan') {
      if (!pool && hits.length > 0) console.log('[复核位] 批内近重复命中已列入待审清单;commit 前必须人工复核处置。');
      return EXIT_OK;
    }
    // commit:复核位——近重复命中未获显式确认(人工复核)则拦截,不静默拒不静默灌。
    if (hits.length > 0 && args['accept-near-duplicate'] !== 'true') {
      console.error('[复核位拦截·#78] 近重复命中未获 --accept-near-duplicate 显式确认;请人工复核待审清单后带位重跑(或修订导入件)。');
      return EXIT_NEAR_DUP_GATE;
    }
    const embedder = args.embedder === 'provider' ? undefined : mockEmbedder();
    if (!embedder) {
      console.error('[环境] provider embedder 需真实 Key 与运营环境;本仓导入请用 --embedder mock(generation 模式不外呼)。');
      return EXIT_ENV;
    }
    const result = await ingestQuestionBankArtifacts(pool!, artifacts, embedder);
    console.log(`[commit] 治理路径入库完成: questions=${result.questionCount} chunks=${result.chunkCount}(propose→qbank_source→approve→promoteToPool)`);
    return EXIT_OK;
  } catch (error) {
    console.error(`[失败] ${(error as Error).message}`);
    return EXIT_ENV;
  } finally {
    if (pool) await pool.end().catch(() => undefined);
  }
}

void main().then((code) => { process.exitCode = code; });
