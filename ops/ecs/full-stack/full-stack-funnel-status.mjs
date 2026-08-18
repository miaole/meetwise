import { readFileSync } from 'node:fs';

const status = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const expected = new URL(process.argv[3]);
if (expected.protocol !== 'https:' || expected.pathname !== '/' || expected.search || expected.hash || expected.port) throw new Error('full_stack_funnel_origin_invalid');
const web = status?.Web ?? status?.web;
if (!web || typeof web !== 'object' || Array.isArray(web) || Object.keys(web).length !== 1) throw new Error('full_stack_funnel_binding_invalid');
const [key] = Object.keys(web);
if (key !== `${expected.hostname}:443` || !/^[a-z0-9-]+\.tail[a-z0-9]+\.ts\.net:443$/.test(key)) throw new Error('full_stack_funnel_host_invalid');
const handlers = web[key]?.Handlers ?? web[key]?.handlers;
if (!handlers || typeof handlers !== 'object' || Array.isArray(handlers) || Object.keys(handlers).length !== 1 || (handlers['/']?.Proxy ?? handlers['/']?.proxy) !== 'http://127.0.0.1:80') throw new Error('full_stack_funnel_target_invalid');
process.stdout.write(`https://${key.slice(0, -4)}\n`);
