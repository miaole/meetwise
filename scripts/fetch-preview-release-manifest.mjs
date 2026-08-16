import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { verifyManifest } from '../ops/ecs/preview-release-manifest.mjs';

const [url, output] = process.argv.slice(2);
if (!url || !output) throw new Error('usage: fetch-preview-release-manifest.mjs <https-manifest-url> <output>');
const endpoint = new URL(url);
if (endpoint.protocol !== 'https:' || endpoint.pathname !== '/preview-release-manifest.json' || endpoint.search || endpoint.hash || endpoint.username || endpoint.password) throw new Error('preview_manifest_endpoint_invalid');
const response = await fetch(endpoint, { redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { accept: 'application/json' } });
if (!response.ok) throw new Error(`preview_manifest_fetch_failed:${response.status}`);
const manifest = await response.json();
const publicKey = await readFile(resolve(process.cwd(), 'ops/ecs/keys/preview-release-ed25519.pub.pem'), 'utf8');
verifyManifest(manifest, publicKey);
if (`${manifest.origin}/preview-release-manifest.json` !== endpoint.toString()) throw new Error('preview_manifest_endpoint_origin_mismatch');
await writeFile(resolve(output), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
console.log(`✓ fetched signed preview release record: ${manifest.status}`);
