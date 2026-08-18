#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Tailscale returns `{}` when Funnel is disabled for the complete tailnet.
 * A configured public edge is accepted only when its single documented Web
 * section is a plain empty object. Every other shape is an unknown state and
 * must keep the controller fail-closed.
 */
export function funnelStatusIsClosed(status) {
  if (!isPlainObject(status)) return false;
  const keys = Object.keys(status);
  if (keys.length === 0) return true;
  if (keys.length !== 1 || !['Web', 'web'].includes(keys[0])) return false;
  const web = status[keys[0]];
  return isPlainObject(web) && Object.keys(web).length === 0;
}

function main(argv) {
  if (argv.length !== 3) throw new Error('usage: preview-funnel-status.mjs <status.json>');
  const status = JSON.parse(readFileSync(argv[2], 'utf8'));
  if (!funnelStatusIsClosed(status)) throw new Error('preview_funnel_remains_configured');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv);
