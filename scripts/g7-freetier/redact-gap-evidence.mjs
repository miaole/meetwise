#!/usr/bin/env node
/**
 * Deterministic G7 GAP evidence redaction.
 * Masks secrets/keys/tokens/emails; keeps key fingerprint prefix only.
 * Same input bytes → identical output bytes (stable across runs).
 *
 * Usage:
 *   node scripts/g7-freetier/redact-gap-evidence.mjs \
 *     --in <raw.txt> --out <redacted.txt>
 *   node scripts/g7-freetier/redact-gap-evidence.mjs --all
 *   node scripts/g7-freetier/redact-gap-evidence.mjs --prove-idempotent
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const RAW_DIR = join(ROOT, 'ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/gap-evidence/raw');
const RED_DIR = join(ROOT, 'ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/gap-evidence/redacted');

/** Ordered, deterministic substitutions. */
const RULES = [
  // Bearer / API keys / sk- tokens
  { re: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/g, to: 'Bearer [REDACTED_TOKEN]' },
  { re: /\bsk-[A-Za-z0-9]{8,}\b/g, to: 'sk-[REDACTED_KEY]' },
  { re: /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|id[_-]?token|client[_-]?secret)\s*[:=]\s*['"]?[^'")\s]+['"]?/gi, to: '$1=[REDACTED_SECRET]' },
  // JWT-shaped
  { re: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, to: '[REDACTED_JWT]' },
  // Emails
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, to: '[REDACTED_EMAIL]' },
  // Long hex secrets (keep short fingerprints ≤16 hex chars)
  { re: /\b[a-f0-9]{32,}\b/gi, to: '[REDACTED_HEX]' },
  // DASHSCOPE / MODEL env assignments in logs
  { re: /\b(DASHSCOPE_API_KEY|MODEL_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY)=([^\s]+)/g, to: '$1=[REDACTED_KEY]' },
];

export function redactText(input) {
  let out = input;
  for (const { re, to } of RULES) {
    out = out.replace(re, to);
  }
  return out;
}

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function redactFile(inPath, outPath) {
  const raw = readFileSync(inPath);
  const redacted = Buffer.from(redactText(raw.toString('utf8')), 'utf8');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, redacted);
  return { rawSha256: sha256(raw), redactedSha256: sha256(redacted), bytesRaw: raw.length, bytesRedacted: redacted.length };
}

function allRawFiles() {
  return readdirSync(RAW_DIR).filter((n) => n.endsWith('.raw.txt')).sort();
}

function runAll() {
  const results = [];
  for (const name of allRawFiles()) {
    const inPath = join(RAW_DIR, name);
    const outName = name.replace(/\.raw\.txt$/, '.redacted.txt');
    const outPath = join(RED_DIR, outName);
    const digests = redactFile(inPath, outPath);
    results.push({ raw: name, redacted: outName, ...digests });
    console.log(`REDACTED ${name} -> ${outName}`);
    console.log(`  raw_sha256=${digests.rawSha256}`);
    console.log(`  redacted_sha256=${digests.redactedSha256}`);
  }
  return results;
}

function proveIdempotent() {
  let ok = true;
  for (const name of allRawFiles()) {
    const inPath = join(RAW_DIR, name);
    const raw = readFileSync(inPath, 'utf8');
    const a = redactText(raw);
    const b = redactText(raw);
    const c = redactText(a); // redacting already-redacted must stay stable for our rules
    if (a !== b) {
      console.error(`FAIL non-deterministic: ${name}`);
      ok = false;
      continue;
    }
    // Second pass over raw again via file write path
    const out1 = join(RED_DIR, `_idem_a_${name}`);
    const out2 = join(RED_DIR, `_idem_b_${name}`);
    const d1 = redactFile(inPath, out1);
    const d2 = redactFile(inPath, out2);
    const body1 = readFileSync(out1);
    const body2 = readFileSync(out2);
    if (!body1.equals(body2) || d1.redactedSha256 !== d2.redactedSha256) {
      console.error(`FAIL file-path non-identical: ${name}`);
      ok = false;
    } else {
      console.log(`PASS idempotent ${name} sha256=${d1.redactedSha256}`);
    }
  }
  // remove temp idem files
  for (const n of readdirSync(RED_DIR)) {
    if (n.startsWith('_idem_')) {
      try { unlinkSync(join(RED_DIR, n)); } catch {}
    }
  }
  if (!ok) process.exit(1);
  console.log('PASS redact-gap-evidence idempotent (two runs identical)');
}

const args = process.argv.slice(2);
if (args.includes('--prove-idempotent')) {
  proveIdempotent();
} else if (args.includes('--all')) {
  const results = runAll();
  writeFileSync(join(RED_DIR, 'digests.json'), JSON.stringify(results, null, 2) + '\n');
  console.log('Wrote digests.json');
} else {
  const i = args.indexOf('--in');
  const o = args.indexOf('--out');
  if (i < 0 || o < 0) {
    console.error('Usage: --all | --prove-idempotent | --in <raw> --out <redacted>');
    process.exit(2);
  }
  const digests = redactFile(args[i + 1], args[o + 1]);
  console.log(JSON.stringify(digests));
}
