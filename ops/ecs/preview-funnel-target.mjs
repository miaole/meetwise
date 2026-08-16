import { readFileSync } from 'node:fs';

const HOST = /^[a-z0-9-]+\.tail[a-z0-9]+\.ts\.net$/;

export function localPreviewHost(status) {
  const host = String(status?.Self?.DNSName ?? '').replace(/\.$/, '');
  if (!HOST.test(host)) throw new Error('preview_funnel_local_dns_name_invalid');
  return host;
}

export function assertPreviewFunnel(status, host) {
  const web = status?.Web ?? status?.web;
  const expectedKey = `${host}:443`;
  if (!web || typeof web !== 'object' || Array.isArray(web) || Object.keys(web).length !== 1) throw new Error('preview_funnel_web_bindings_invalid');
  const binding = web[expectedKey];
  const handlers = binding?.Handlers ?? binding?.handlers;
  if (!handlers || typeof handlers !== 'object' || Object.keys(handlers).length !== 1) throw new Error('preview_funnel_handlers_invalid');
  const root = handlers['/'];
  if (!root || (root.Proxy ?? root.proxy) !== 'http://127.0.0.1:8080') throw new Error('preview_funnel_target_invalid');
  return `https://${host}`;
}

export function assertFunnelAbsentOrPreview(status, host) {
  const web = status?.Web ?? status?.web;
  if (web === undefined || (web && typeof web === 'object' && !Array.isArray(web) && Object.keys(web).length === 0)) return null;
  return assertPreviewFunnel(status, host);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [mode, path, host] = process.argv.slice(2);
  const status = JSON.parse(readFileSync(path, 'utf8'));
  if (mode === 'host') process.stdout.write(`${localPreviewHost(status)}\n`);
  else if (mode === 'assert' && host) process.stdout.write(`${assertPreviewFunnel(status, host)}\n`);
  else if (mode === 'absent-or-assert' && host) process.stdout.write(`${assertFunnelAbsentOrPreview(status, host) ?? 'absent'}\n`);
  else throw new Error('usage: preview-funnel-target.mjs host|assert <status-json> [host]');
}
