/**
 * MW-RUN-001 · 成功文件上传必须返回 JSON，不能只写库。
 *
 * 层：真实 ResumeController + ResumeService + 真实 extractResumeText（text/pdf 子进程）
 *     + HTTP loopback。SQL 客户端是进程内替身，不是隔离 PG，不证明 RLS/加密落库。
 * OCR 成功整链需要预览旗、视觉缝和真实额度事务，本证明不跑、不记 PASS。
 * 去掉 `return await this.doUploadFile` 后，写库次数仍 >0 但 HTTP body 为空，NORM/PDF/DEDUP 必红。
 *
 * releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · est live=0
 *   不挂 apps/api package.json scripts（该文件在治理 digest 闭集里，本刀不改登记）。
 *   cd apps/api && env -u DATABASE_URL -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE \
 *     node --import @swc-node/register/esm-register test/resume-upload-response.proof.ts
 */
import 'reflect-metadata';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HttpException, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ModelClient } from '@meetwise/ai-runtime';
import { ResumeController } from '../src/modules/resume/resume.controller.ts';
import { OCR_VISION_CLIENT, ResumeService } from '../src/modules/resume/resume.service.ts';
import { AllExceptionsFilter } from '../src/platform/all-exceptions.filter.ts';
import { DbService } from '../src/platform/db.service.ts';
import { PrincipalGuard } from '../src/platform/principal.guard.ts';
import { RateLimitService } from '../src/platform/rate-limit.service.ts';

const CASE_ID = 'MW-RUN-001';
const ATTEMPT_STARTED_AT = new Date().toISOString();
const PRINCIPAL = 'resume-upload-response-user';

type ResumeRow = { id: string; owner: string; sha: string; status: string };
type QueryResult = { rowCount: number; rows: Array<Record<string, unknown>> };

class UploadSqlStub {
  readonly writes: string[] = [];
  readonly resumes = new Map<string, ResumeRow>();
  private seq = 1;

  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const s = sql.replace(/\s+/g, ' ').trim();
    if (s.startsWith('SELECT 1 FROM consent_record')) return { rowCount: 1, rows: [{ ok: 1 }] };
    if (s.startsWith('INSERT INTO resume_blob')) {
      this.writes.push('insert_blob');
      return { rowCount: 1, rows: [] };
    }
    if (s.startsWith('INSERT INTO resume_profile')) {
      this.writes.push('insert_profile');
      return { rowCount: 1, rows: [] };
    }
    if (s.startsWith('INSERT INTO resume(')) {
      const owner = String(params[0]);
      const sha = String(params[1]);
      const active = [...this.resumes.values()].find((row) => row.owner === owner && row.sha === sha && row.status !== 'erased');
      this.writes.push(active ? 'insert_resume_conflict' : 'insert_resume');
      if (active) return { rowCount: 0, rows: [] };
      const id = `00000000-0000-4000-8000-${String(this.seq++).padStart(12, '0')}`;
      this.resumes.set(id, { id, owner, sha, status: 'uploaded' });
      return { rowCount: 1, rows: [{ id }] };
    }
    if (s.startsWith('SELECT id, status FROM resume')) {
      const owner = String(params[0]);
      const sha = String(params[1]);
      const active = [...this.resumes.values()].find((row) => row.owner === owner && row.sha === sha && ['uploaded', 'ingesting', 'ingested', 'failed'].includes(row.status));
      return { rowCount: active ? 1 : 0, rows: active ? [{ id: active.id, status: active.status }] : [] };
    }
    if (s.startsWith('UPDATE resume SET status=$4')) {
      const id = String(params[0]);
      const from = String(params[2]);
      const to = String(params[3]);
      const row = this.resumes.get(id);
      if (!row || row.status !== from) return { rowCount: 0, rows: [] };
      row.status = to;
      this.writes.push(`transition:${from}->${to}`);
      return { rowCount: 1, rows: [] };
    }
    if (s.startsWith('SAVEPOINT ') || s.startsWith('RELEASE SAVEPOINT ') || s.startsWith('ROLLBACK TO SAVEPOINT ')) {
      return { rowCount: 0, rows: [] };
    }
    throw new Error(`upload_sql_stub_unexpected:${s.slice(0, 180)}`);
  }
}

function realPdfFixture(tag: string): Buffer {
  const text = `Senior backend engineer with Go and Kubernetes ${tag}`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    null as string | null,
  ];
  const stream = `BT /F1 14 Tf 72 720 Td (${text.replace(/([()\\])/g, '\\$1')}) Tj ET`;
  objects[4] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  const header = '%PDF-1.4\n';
  const body: string[] = [];
  const offsets: number[] = [];
  let pos = header.length;
  objects.forEach((obj, i) => {
    offsets.push(pos);
    const chunk = `${i + 1} 0 obj\n${obj}\nendobj\n`;
    body.push(chunk);
    pos += chunk.length;
  });
  const xrefPos = pos;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(header + body.join('') + xref + trailer, 'latin1');
}

type PostResult = { status: number; bodyBytes: number; body: Record<string, unknown> | null };

const failures: string[] = [];
const A = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures.push(name);
};

async function postFile(base: string, dto: { filename: string; mimeType: string; contentBase64: string }): Promise<PostResult> {
  const contentType = 'content-type';
  const userHeader = 'x-user-id';
  const res = await fetch(`${base}/resume/file`, {
    method: 'POST',
    headers: { [contentType]: 'application/json', [userHeader]: PRINCIPAL },
    body: JSON.stringify(dto),
  });
  const raw = await res.text();
  let body: Record<string, unknown> | null = null;
  if (raw.length > 0) {
    try { body = JSON.parse(raw) as Record<string, unknown>; }
    catch { body = { parseError: true }; }
  }
  return { status: res.status, bodyBytes: Buffer.byteLength(raw), body };
}

(async () => {
  console.log(`${CASE_ID} file upload success JSON contract`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · est live=0');
  console.log('layer=real HTTP controller/service + real text/pdf extract + stub SQL client');
  console.log('NOT real PG · NOT RLS · NOT OCR success chain · NOT production HA');
  console.log(`ATTEMPT_START iso=${ATTEMPT_STARTED_AT}`);

  process.env.NODE_ENV = 'test';
  process.env.AUTH_DEV_HEADER = '1';
  delete process.env.OCR_ENABLED;
  delete process.env.OCR_PREVIEW;

  const sql = new UploadSqlStub();
  const db = { asPrincipal: async <T>(_user: string, fn: (c: UploadSqlStub) => Promise<T>) => fn(sql) };
  const rl = new RateLimitService();
  let visionCalls = 0;
  const vision: ModelClient = {
    complete() {
      visionCalls += 1;
      return Promise.reject(new Error('vision_must_not_run'));
    },
  };

  @Module({
    controllers: [ResumeController],
    providers: [
      PrincipalGuard,
      { provide: DbService, useValue: db },
      { provide: RateLimitService, useValue: rl },
      {
        provide: ResumeService,
        useFactory: (ddb: DbService, model: ModelClient, rateLimit: RateLimitService) => new ResumeService(ddb, model, rateLimit),
        inject: [DbService, OCR_VISION_CLIENT, RateLimitService],
      },
      { provide: OCR_VISION_CLIENT, useValue: vision },
    ],
  })
  class UploadResponseModule {}

  const app = await NestFactory.create<NestFastifyApplication>(UploadResponseModule, new FastifyAdapter(), { logger: false, abortOnError: false });
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const receipt: Record<string, unknown> = { caseId: CASE_ID, startedAt: ATTEMPT_STARTED_AT, layer: 'http-stub-sql' };
  try {
    const text = `简历正文 MW-RUN-001 ${process.pid} 后端工程师 分布式系统`;
    const textDto = { filename: 'cv.txt', mimeType: 'text/plain', contentBase64: Buffer.from(text, 'utf8').toString('base64') };
    const first = await postFile(base, textDto);
    A('NORM text 200 且 body 非空（写库成功不能代替响应）',
      first.status === 200 && first.bodyBytes > 0 && first.body?.status === 'ingested' && first.body?.format === 'text'
      && typeof first.body?.resumeId === 'string' && Number(first.body?.chars) >= 20);
    A('NORM 替身确实写入 resume/blob/profile 并收到 ingested',
      sql.writes.includes('insert_resume') && sql.writes.includes('insert_blob') && sql.writes.includes('insert_profile')
      && [...sql.resumes.values()].some((row) => row.status === 'ingested'));
    const rowsAfterNorm = sql.resumes.size;

    const again = await postFile(base, textDto);
    A('DEDUP 同文再次上传仍返回 JSON（deduped），不是空 200',
      again.status === 200 && again.bodyBytes > 0 && again.body?.status === 'deduped'
      && again.body?.resumeId === first.body?.resumeId && again.body?.format === 'text');
    A('DEDUP 不新增 resume/blob 行', sql.resumes.size === rowsAfterNorm && sql.writes.filter((w) => w === 'insert_blob').length === 1);

    const pdf = realPdfFixture(`mw-run-001-${process.pid}`);
    const pdfRes = await postFile(base, { filename: 'cv.pdf', mimeType: 'application/pdf', contentBase64: pdf.toString('base64') });
    A('PDF 200 且 body 含 ingested/format=pdf/resumeId',
      pdfRes.status === 200 && pdfRes.bodyBytes > 0 && pdfRes.body?.status === 'ingested' && pdfRes.body?.format === 'pdf'
      && typeof pdfRes.body?.resumeId === 'string' && pdfRes.body.resumeId !== first.body?.resumeId);

    const writesBeforeErrors = sql.writes.length;
    const rowsBeforeErrors = sql.resumes.size;
    const short = await postFile(base, {
      filename: 'short.txt', mimeType: 'text/plain', contentBase64: Buffer.from('太短', 'utf8').toString('base64'),
    });
    A('异常短文本 400 extracted_too_short 且 body 非空、零新写入',
      short.status === 400 && short.bodyBytes > 0 && short.body?.error === 'extracted_too_short'
      && sql.writes.length === writesBeforeErrors && sql.resumes.size === rowsBeforeErrors);
    // 契约要求 base64 长度是 4 的倍数且至多两个填充符；合法串至少解出 1 字节。
    // empty_file 因此到不了 HTTP，只在服务层解码后触发。这里直接打服务，确认它抛 400 而不是空成功。
    const resumes = app.get(ResumeService);
    let emptyError: HttpException | null = null;
    try {
      await resumes.uploadFile(PRINCIPAL, { filename: 'empty.pdf', mimeType: 'application/pdf', contentBase64: '====' });
    } catch (error) {
      if (error instanceof HttpException) emptyError = error;
    }
    const emptyBody = emptyError?.getResponse();
    const empty = {
      status: emptyError?.getStatus() ?? 0,
      body: typeof emptyBody === 'object' && emptyBody !== null ? emptyBody as Record<string, unknown> : null,
    };
    A('异常空解码 400 empty_file（服务层抛错，不是空成功）且零写入',
      empty.status === 400 && empty.body?.error === 'empty_file'
      && sql.writes.length === writesBeforeErrors && sql.resumes.size === rowsBeforeErrors);
    const badB64 = await postFile(base, { filename: 'pad.pdf', mimeType: 'application/pdf', contentBase64: '====' });
    A('异常非法 base64 400 invalid 且 body 非空、零写入（停在契约，不落成空 200）',
      badB64.status === 400 && badB64.bodyBytes > 0 && badB64.body?.error === 'invalid'
      && sql.writes.length === writesBeforeErrors && sql.resumes.size === rowsBeforeErrors);
    const mismatch = await postFile(base, {
      filename: 'notes.txt', mimeType: 'text/plain',
      contentBase64: Buffer.from('%PDF-1.4\nsmuggled-pdf-bytes-inside-text-declaration', 'utf8').toString('base64'),
    });
    A('异常魔数不符 422 magic_mismatch 且 body 非空、零写入',
      mismatch.status === 422 && mismatch.bodyBytes > 0 && mismatch.body?.error === 'magic_mismatch'
      && sql.writes.length === writesBeforeErrors && sql.resumes.size === rowsBeforeErrors);
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from('not-a-real-png-body')]);
    const image = await postFile(base, { filename: 'scan.png', mimeType: 'image/png', contentBase64: png.toString('base64') });
    A('异常未开 OCR 422 image_ocr_unavailable 且 body 非空、零视觉调用、零写入',
      image.status === 422 && image.bodyBytes > 0 && image.body?.error === 'image_ocr_unavailable' && visionCalls === 0
      && sql.writes.length === writesBeforeErrors && sql.resumes.size === rowsBeforeErrors);

    console.log('NOT_RUN  OCR success HTTP（需预览旗+视觉缝+真实额度事务/隔离 PG）blocked:ocr-preview-and-pg');
    receipt.ocrSuccessHttp = 'not_run:ocr-preview-and-isolated-pg';
    receipt.arms = { first, again, pdf: pdfRes, short, empty, badB64, mismatch, image, visionCalls, writes: sql.writes };
  } finally {
    await app.close();
  }

  const endedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  receipt.endedAt = endedAt;
  receipt.exit = exit;
  receipt.failures = failures;
  const receiptPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.tmp/acceptance-fix-20261117/mw-run-001-receipt.json');
  mkdirSync(dirname(receiptPath), { recursive: true });
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  console.log(`ATTEMPT_END iso=${endedAt} EXIT=${exit} fail=${failures.length}`);
  console.log(`RECEIPT ${receiptPath}`);
  if (failures.length) {
    for (const name of failures) console.log(`GAP_DETAIL  ${name}`);
  }
  process.exit(exit);
})().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
