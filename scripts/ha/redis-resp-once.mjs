#!/usr/bin/env node
/**
 * Tiny Redis RESP one-shot (no deps) for HA C3 shared prove inside api containers.
 * releaseEvidence=false · Not HA · never claim production HA
 *
 * Usage:
 *   node redis-resp-once.mjs SET <key> <value> [EX <seconds>]
 *   node redis-resp-once.mjs GET <key>
 *
 * Host/port from MEETWISE_HA_SHARED_REDIS_HOST/PORT or REDIS_URL or defaults.
 */
import net from 'node:net';

function parseRedisUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return { host: u.hostname || '127.0.0.1', port: Number(u.port || 6379) };
  } catch {
    return null;
  }
}

const fromUrl = parseRedisUrl(process.env.REDIS_URL);
const host =
  process.env.MEETWISE_HA_SHARED_REDIS_HOST ||
  fromUrl?.host ||
  '127.0.0.1';
const port = Number(
  process.env.MEETWISE_HA_SHARED_REDIS_PORT ||
    fromUrl?.port ||
    6379,
);

const argv = process.argv.slice(2);
if (argv.length < 2) {
  console.error('usage: redis-resp-once.mjs SET key value [EX sec] | GET key');
  process.exit(2);
}

const op = argv[0].toUpperCase();
/** @type {string[]} */
let parts;
if (op === 'SET') {
  const key = argv[1];
  const value = argv[2];
  if (value == null) {
    console.error('SET requires key value');
    process.exit(2);
  }
  parts = ['SET', key, value];
  if (argv[3] && argv[3].toUpperCase() === 'EX' && argv[4]) {
    parts.push('EX', String(argv[4]));
  }
} else if (op === 'GET') {
  parts = ['GET', argv[1]];
} else {
  console.error(`unsupported op: ${op}`);
  process.exit(2);
}

function encode(cmdParts) {
  let out = `*${cmdParts.length}\r\n`;
  for (const p of cmdParts) {
    const b = Buffer.from(String(p), 'utf8');
    out += `$${b.length}\r\n${b.toString('utf8')}\r\n`;
  }
  return out;
}

function decodeSimple(buf) {
  const s = buf.toString('utf8');
  if (s.startsWith('+')) {
    return { ok: true, value: s.slice(1, s.indexOf('\r\n')) };
  }
  if (s.startsWith('$')) {
    const nl = s.indexOf('\r\n');
    const len = Number(s.slice(1, nl));
    if (len < 0) return { ok: true, value: null };
    const start = nl + 2;
    return { ok: true, value: s.slice(start, start + len) };
  }
  if (s.startsWith('-')) {
    return { ok: false, value: s.slice(1).trim() };
  }
  if (s.startsWith(':')) {
    return { ok: true, value: s.slice(1, s.indexOf('\r\n')) };
  }
  return { ok: false, value: `unparsed:${s.slice(0, 80)}` };
}

const sock = net.connect({ host, port }, () => {
  sock.write(encode(parts));
});
const chunks = [];
sock.setTimeout(3000);
sock.on('data', (c) => chunks.push(c));
sock.on('timeout', () => {
  sock.destroy(new Error('timeout'));
});
sock.on('error', (err) => {
  console.error(JSON.stringify({ ok: false, host, port, error: err.message }));
  process.exit(1);
});
sock.on('end', () => {
  const decoded = decodeSimple(Buffer.concat(chunks));
  if (!decoded.ok) {
    console.error(JSON.stringify({ ok: false, host, port, error: decoded.value }));
    process.exit(1);
  }
  console.log(
    JSON.stringify({
      ok: true,
      host,
      port,
      op,
      key: parts[1],
      value: decoded.value,
    }),
  );
  process.exit(0);
});
