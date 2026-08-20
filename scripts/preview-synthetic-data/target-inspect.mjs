#!/usr/bin/env node
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { sha256 } from './catalog.mjs';
import { resolveReadOnlyVerifierEnv } from './verifier-env.mjs';

function releaseDigest(root) {
  const rows = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`release_symlink_rejected:${relative(root, path)}`);
      if (entry.isDirectory()) visit(path); else if (entry.isFile()) rows.push([relative(root, path), sha256(readFileSync(path))]);
    }
  };
  for (const scope of ['apps/api', 'packages/contracts', 'packages/db']) visit(join(root, scope));
  return sha256(rows);
}

async function main() {
  if (!((process.getuid?.() === 0 && process.getgid?.() === 0) || (process.getuid?.() === 2001 && process.getgid?.() === 2001))) throw new Error('target_inspect_requires_trusted_uid');
  const verifierEnv = resolveReadOnlyVerifierEnv(process.env);
  const root = realpathSync('/srv/meetwise-full-stack/current'); const require = createRequire(join(root, 'packages/db/package.json')); const pg = require('pg');
  const pool = new pg.Pool({ connectionString: verifierEnv.databaseUrl, ssl: { ca: readFileSync(verifierEnv.caPath, 'utf8'), rejectUnauthorized: true, servername: verifierEnv.tlsServername }, max: 1 });
  try {
    const identity = (await pool.query('SELECT current_database() AS database, current_user AS role')).rows[0];
    if (identity.database !== verifierEnv.expectedDatabase || identity.role !== verifierEnv.expectedRole) throw new Error('target_inspect_wrong_identity');
    const ledger = (await pool.query('SELECT version, checksum FROM schema_migrations ORDER BY version')).rows;
    process.stdout.write(`${JSON.stringify({ identity, schemaHead: `${ledger.at(-1)?.version}.sql`, schemaLedgerDigest: sha256(ledger), releasePath: root, releaseTreeDigest: releaseDigest(root), apiContractDigest: sha256(readFileSync(join(root, 'packages/contracts/src/openapi.ts'))) }, null, 2)}\n`);
  } finally { await pool.end(); }
}
main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'target_inspect_failed'}\n`); process.exitCode = 1; });
