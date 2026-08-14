/**
 * 全格式 RAG 的结构化切块核心。
 *
 * 这不是文件解析器：PDF/PPTX/XLSX/ASR/OCR adapter 必须先在沙箱中把原件变为
 * DocumentElement。这里唯一职责是以可复现 recipe 把**已定位的结构元素**变成
 * 可检索 chunk，且绝不悄悄跨越表格行、幻灯片、代码块或媒体时间轴。
 *
 * 关键不变量：
 *  1. 每一个 chunk 都含不可变 document/version/recipe 和至少一个可点击原件 locator；
 *  2. 表格只按 row group 分块，所有 chunk 重复表头，单行超预算 fail-loud；
 *  3. PPT/图片/代码不按字符硬切；超预算转人工/专用 adapter，不制造断裂证据；
 *  4. 视频/音频仅在相邻时间片内聚合，保留逐段 speaker/time locator；
 *  5. 完全确定性：相同 IR + recipe 必须得到同一 chunk id 和正文。
 */
import { createHash } from 'node:crypto';

export type SourceLocator =
  | { kind: 'text'; charStart: number; charEnd: number; lineStart?: number; lineEnd?: number }
  | { kind: 'pdf'; page: number; charStart: number; charEnd: number; boxes?: ReadonlyArray<readonly [number, number, number, number]> }
  | { kind: 'sheet'; sheet: string; range: string; rowStart: number; rowEnd: number; colStart: number; colEnd: number; headerRows: readonly number[] }
  | { kind: 'slide'; slide: number; shapeIds: readonly string[] }
  | { kind: 'media'; startMs: number; endMs: number; speaker?: string; wordStart?: number; wordEnd?: number }
  | { kind: 'image'; page?: number; imageId: string; boxes?: ReadonlyArray<readonly [number, number, number, number]> };

export type DocumentFormat = 'text' | 'html' | 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'audio' | 'video';
export type ElementKind = 'heading' | 'paragraph' | 'table' | 'code' | 'slide_text' | 'image_ocr' | 'transcript';

export interface TextElement {
  id: string;
  kind: Exclude<ElementKind, 'table' | 'transcript'>;
  text: string;
  locator: SourceLocator;
  level?: number;
}

export interface TableElement {
  id: string;
  kind: 'table';
  locator: Extract<SourceLocator, { kind: 'sheet' | 'pdf' | 'slide' | 'image' }>;
  headers: readonly string[];
  rows: ReadonlyArray<readonly string[]>;
}

export interface TranscriptElement {
  id: string;
  kind: 'transcript';
  text: string;
  locator: Extract<SourceLocator, { kind: 'media' }>;
}

export type DocumentElement = TextElement | TableElement | TranscriptElement;

export interface StructuredDocument {
  documentId: string;
  contentVersion: number;
  format: DocumentFormat;
  title: string;
  elements: readonly DocumentElement[];
}

export interface ChunkerRecipe {
  id: string;
  maxChars: number;
  /** Text elements under this size are kept together where the structural boundary permits. */
  minChars: number;
  includeHeadingPath: boolean;
}

export interface RagChunk {
  id: string;
  documentId: string;
  contentVersion: number;
  recipeId: string;
  ordinal: number;
  text: string;
  /** Data must be wrapped as untrusted when injected into an LLM prompt. */
  trust: 'untrusted';
  elementIds: readonly string[];
  locators: readonly SourceLocator[];
  metadata: { format: DocumentFormat; title: string; headingPath: readonly string[]; table?: { headerHash: string; rowStart: number; rowEnd: number } };
}

const stable = (v: unknown) => JSON.stringify(v);
const sha = (v: unknown) => createHash('sha256').update(stable(v)).digest('hex');
const clean = (v: string) => v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();

function locatorKey(locator: SourceLocator): string {
  switch (locator.kind) {
    case 'text': return `text:${locator.charStart}-${locator.charEnd}`;
    case 'pdf': return `pdf:${locator.page}:${locator.charStart}-${locator.charEnd}:${stable(locator.boxes ?? [])}`;
    case 'sheet': return `sheet:${locator.sheet}:${locator.range}:${locator.rowStart}-${locator.rowEnd}:${locator.colStart}-${locator.colEnd}:${stable(locator.headerRows)}`;
    case 'slide': return `slide:${locator.slide}:${[...locator.shapeIds].join(',')}`;
    case 'media': return `media:${locator.startMs}-${locator.endMs}:${locator.speaker ?? ''}:${locator.wordStart ?? ''}-${locator.wordEnd ?? ''}`;
    case 'image': return `image:${locator.page ?? ''}:${locator.imageId}:${stable(locator.boxes ?? [])}`;
  }
}

function assertDocument(doc: StructuredDocument, recipe: ChunkerRecipe) {
  if (!/^[A-Za-z0-9:_-]{1,160}$/.test(doc.documentId)) throw new Error('rag_chunk_invalid_document_id');
  if (!Number.isInteger(doc.contentVersion) || doc.contentVersion < 1) throw new Error('rag_chunk_invalid_content_version');
  // 128 是结构单元的绝对下限：测试和表格/字幕切片可用更小预算验证边界；生产 recipe
  // 应由 tokenizer 预算与评测选择，不能把 512/1024 这类经验数硬编码成“正确”。
  if (!recipe.id || recipe.id.length > 160 || !Number.isInteger(recipe.maxChars) || recipe.maxChars < 128 || recipe.minChars < 0 || recipe.minChars > recipe.maxChars)
    throw new Error('rag_chunk_invalid_recipe');
  const ids = new Set<string>();
  for (const e of doc.elements) {
    if (!/^[A-Za-z0-9:_-]{1,160}$/.test(e.id) || ids.has(e.id)) throw new Error('rag_chunk_invalid_or_duplicate_element_id');
    ids.add(e.id);
    if (e.kind === 'table') {
      if (e.headers.length === 0 || e.headers.some((h) => !clean(h))) throw new Error(`rag_chunk_invalid_table_headers:${e.id}`);
      if (e.rows.some((row) => row.length !== e.headers.length || row.some((cell) => !clean(cell)))) throw new Error(`rag_chunk_invalid_table_rows:${e.id}`);
    } else if (!clean(e.text)) throw new Error(`rag_chunk_empty_element:${e.id}`);
  }
}

function headingPrefix(path: readonly string[], recipe: ChunkerRecipe): string {
  return recipe.includeHeadingPath && path.length ? `[章节] ${path.join(' > ')}\n` : '';
}

function tableHeader(headers: readonly string[]) { return `| ${headers.map(clean).join(' | ')} |`; }
function tableRow(row: readonly string[]) { return `| ${row.map(clean).join(' | ')} |`; }

function createChunk(doc: StructuredDocument, recipe: ChunkerRecipe, ordinal: number, text: string, elements: readonly string[], locators: readonly SourceLocator[], headingPath: readonly string[], table?: { headerHash: string; rowStart: number; rowEnd: number }): RagChunk {
  const canonicalLocators = [...locators].sort((a, b) => locatorKey(a).localeCompare(locatorKey(b)));
  const body = clean(text);
  if (!body || body.length > recipe.maxChars) throw new Error('rag_chunk_budget_violation');
  const base = { documentId: doc.documentId, contentVersion: doc.contentVersion, recipeId: recipe.id, ordinal, text: body, elementIds: [...elements], locators: canonicalLocators.map(locatorKey) };
  return {
    id: `rch-${sha(base).slice(0, 32)}`,
    documentId: doc.documentId, contentVersion: doc.contentVersion, recipeId: recipe.id, ordinal, text: body,
    trust: 'untrusted', elementIds: [...elements], locators: canonicalLocators,
    metadata: { format: doc.format, title: doc.title, headingPath: [...headingPath], ...(table ? { table } : {}) },
  };
}

function splitText(text: string, max: number): string[] {
  const words = clean(text).split(/(?<=\n)|(?<=[。！？!?])\s+|\s+/u).filter(Boolean);
  const out: string[] = []; let current = '';
  for (const word of words) {
    if (word.length > max) throw new Error('rag_chunk_atomic_text_exceeds_budget');
    const next = current ? `${current}${/\n$/.test(current) ? '' : ' '}${word}` : word;
    if (next.length > max && current) { out.push(current); current = word; } else current = next;
  }
  if (current) out.push(current);
  return out;
}

function canSliceLocator(locator: SourceLocator): locator is Extract<SourceLocator, { kind: 'text' | 'pdf' }> {
  return locator.kind === 'text' || locator.kind === 'pdf';
}

function slicedLocator(locator: Extract<SourceLocator, { kind: 'text' | 'pdf' }>, start: number, length: number): SourceLocator {
  return { ...locator, charStart: locator.charStart + start, charEnd: locator.charStart + start + length };
}

/**
 * Deterministically chunk an already-sandboxed structured document. Errors are intentional
 * quarantine signals: an adapter must emit finer elements or route the document to review;
 * silently slicing an atomic table cell/slide/image would make a citation lie.
 */
export function chunkStructuredDocument(doc: StructuredDocument, recipe: ChunkerRecipe): RagChunk[] {
  assertDocument(doc, recipe);
  const chunks: RagChunk[] = [];
  const headingPath: string[] = [];
  let ordinal = 0;
  const emit = (text: string, ids: readonly string[], locators: readonly SourceLocator[], table?: { headerHash: string; rowStart: number; rowEnd: number }) =>
    chunks.push(createChunk(doc, recipe, ordinal++, text, ids, locators, headingPath, table));

  for (const element of doc.elements) {
    if (element.kind === 'heading') {
      const level = Math.max(1, Math.min(6, element.level ?? 1));
      headingPath.splice(level - 1);
      headingPath[level - 1] = clean(element.text);
      continue;
    }
    const prefix = headingPrefix(headingPath, recipe);
    if (element.kind === 'table') {
      const header = tableHeader(element.headers);
      const headHash = sha(element.headers.map(clean));
      let rows: string[] = []; let start = 0;
      const flush = (end: number) => {
        if (!rows.length) return;
        const text = `${prefix}[表格]\n${header}\n${rows.join('\n')}`;
        const loc = element.locator.kind === 'sheet'
          ? { ...element.locator, range: `${element.locator.sheet}!R${element.locator.rowStart + start}C${element.locator.colStart}:R${element.locator.rowStart + end}C${element.locator.colEnd}`, rowStart: element.locator.rowStart + start, rowEnd: element.locator.rowStart + end }
          : element.locator;
        emit(text, [element.id], [loc], { headerHash: headHash, rowStart: start, rowEnd: end });
        rows = []; start = end + 1;
      };
      element.rows.forEach((row, index) => {
        const rowText = tableRow(row);
        if (`${prefix}[表格]\n${header}\n${rowText}`.length > recipe.maxChars) throw new Error(`rag_chunk_table_row_exceeds_budget:${element.id}:${index}`);
        const candidate = `${prefix}[表格]\n${header}\n${[...rows, rowText].join('\n')}`;
        if (candidate.length > recipe.maxChars && rows.length) flush(index - 1);
        rows.push(rowText);
      });
      flush(element.rows.length - 1);
      continue;
    }
    if (element.kind === 'transcript') {
      const text = `${prefix}[转写 ${element.locator.startMs}-${element.locator.endMs}ms${element.locator.speaker ? ` ${element.locator.speaker}` : ''}]\n${clean(element.text)}`;
      if (text.length > recipe.maxChars) throw new Error(`rag_chunk_transcript_segment_exceeds_budget:${element.id}`);
      emit(text, [element.id], [element.locator]);
      continue;
    }
    const atomic = element.kind === 'code' || element.kind === 'slide_text' || element.kind === 'image_ocr';
    const cleanText = clean(element.text);
    const text = `${prefix}${cleanText}`;
    if (text.length <= recipe.maxChars) { emit(text, [element.id], [element.locator]); continue; }
    if (atomic || !canSliceLocator(element.locator)) throw new Error(`rag_chunk_atomic_element_exceeds_budget:${element.id}`);
    let offset = 0;
    for (const part of splitText(cleanText, Math.max(1, recipe.maxChars - prefix.length))) {
      const at = cleanText.indexOf(part, offset);
      emit(`${prefix}${part}`, [element.id], [slicedLocator(element.locator, at, part.length)]);
      offset = at + part.length;
    }
  }
  return chunks;
}
