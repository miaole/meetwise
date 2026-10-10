// E-COLD-1 (and E-COLD-3 with --parallel) — release-window race probe.
// Pre-registered (harness/gap-flake-rootcause-investigation.md §3.1):
//   H-COLD-1: between `docker port` returning the mapping and the Docker Desktop
//   proxy actually accepting connections there is a window; a host connect in
//   that window gets ECONNREFUSED and the same port self-heals afterwards.
//   Method: per fresh instance, 100 probes at <=100ms interval, each probe =
//   TCP connect + (on TCP ok) host-side SELECT 1. >=5 instances.
//   Judgment: any ECONNREFUSED that self-heals => window exists (class
//   reproduced); 0 refusals => "not reproduced on this host/Docker version"
//   booked as observation (NOT an exclusion).
import { bootContainer, cleanupContainer, newContainerName, newToken, probeTcpConnect, probeHostSql, writeJson, log } from './lib.mjs';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const INSTANCES = Number(arg('instances', '5'));
const PROBES = Number(arg('probes', '100'));
const INTERVAL = Number(arg('interval-ms', '100'));
const PARALLEL = Number(arg('parallel', '1'));
const LABEL = arg('label', 'ecold1');
const OUT = arg('outdir', '/Users/miaole/Desktop/golucky/meetwise-line-flk/.tmp/flk-exec');

const jsonlPath = `${OUT}/${LABEL}.jsonl`;
const summaryPath = `${OUT}/${LABEL}-summary.json`;
const logPath = `${OUT}/${LABEL}.log`;
const fs = await import('node:fs');
fs.writeFileSync(jsonlPath, '');
fs.writeFileSync(logPath, '');

async function probeInstance(idx) {
  const name = newContainerName(`${LABEL}-${idx}`);
  const token = newToken();
  const logFile = logPath;
  log(logFile, `INSTANCE start idx=${idx} container=${name}`);
  const boot = await bootContainer(name, token);
  const readyAt = Date.now();
  log(logFile, `INSTANCE booted idx=${idx} port=${boot.port} bootMs=${boot.bootMs}`);
  let firstTcpOkMs = null, firstSqlOkMs = null, refusals = 0, sqlRefusals = 0, timeouts = 0, others = 0;
  for (let i = 0; i < PROBES; i++) {
    const tProbe = Date.now();
    const tcp = await probeTcpConnect(boot.port);
    if (tcp.outcome === 'ok' && firstTcpOkMs === null) firstTcpOkMs = Date.now() - readyAt;
    let sql = null;
    if (tcp.outcome === 'ok') {
      sql = await probeHostSql(boot.port);
      if (sql.ok && firstSqlOkMs === null) firstSqlOkMs = Date.now() - readyAt;
      if (!sql.ok && sql.code === 'ECONNREFUSED') sqlRefusals += 1;
    } else if (tcp.outcome === 'ECONNREFUSED') refusals += 1;
    else if (tcp.outcome === 'timeout') timeouts += 1;
    else others += 1;
    fs.appendFileSync(jsonlPath, `${JSON.stringify({ idx, container: name, port: boot.port, probe: i, tOffsetMs: tProbe - readyAt, tcp: tcp.outcome, tcpMs: tcp.ms, sql: sql ? (sql.ok ? 'ok' : String(sql.code)) : null, sqlMs: sql?.ms ?? null })}\n`);
    const spent = Date.now() - tProbe;
    if (spent < INTERVAL) await new Promise((r) => setTimeout(r, INTERVAL - spent));
  }
  log(logFile, `INSTANCE done idx=${idx} tcpRefusals=${refusals} sqlRefusals=${sqlRefusals} timeouts=${timeouts} other=${others} firstTcpOkMs=${firstTcpOkMs} firstSqlOkMs=${firstSqlOkMs}`);
  await cleanupContainer(name);
  return { idx, container: name, port: boot.port, bootMs: boot.bootMs, refusals, sqlRefusals, timeouts, others, firstTcpOkMs, firstSqlOkMs };
}

const instances = [];
if (PARALLEL <= 1) {
  for (let i = 0; i < INSTANCES; i++) instances.push(await probeInstance(i));
} else {
  // E-COLD-3 load amplifier: PARALLEL instances booted and probed concurrently.
  const runs = [];
  for (let i = 0; i < INSTANCES; i += PARALLEL) {
    const batch = [];
    for (let j = i; j < Math.min(i + PARALLEL, INSTANCES); j++) batch.push(probeInstance(j));
    runs.push(...await Promise.all(batch));
  }
  instances.push(...runs);
}
const summary = {
  experiment: LABEL, instances: INSTANCES, probesPerInstance: PROBES, intervalMs: INTERVAL, parallel: PARALLEL,
  image: 'pgvector/pgvector:pg16', dockerServer: '29.1.3',
  totalProbes: INSTANCES * PROBES,
  totalTcpRefusals: instances.reduce((a, r) => a + r.refusals, 0),
  totalSqlRefusals: instances.reduce((a, r) => a + r.sqlRefusals, 0),
  totalTimeouts: instances.reduce((a, r) => a + r.timeouts, 0),
  perInstance: instances,
};
writeJson(summaryPath, summary);
log(logPath, `SUMMARY ${JSON.stringify({ totalTcpRefusals: summary.totalTcpRefusals, totalSqlRefusals: summary.totalSqlRefusals, totalProbes: summary.totalProbes })}`);
console.log(`DONE ${LABEL} totalTcpRefusals=${summary.totalTcpRefusals}/${summary.totalProbes}`);
