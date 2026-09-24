/**
 * UC018 receipt-backfill · sourced stack + imageDigest helpers.
 * Every stack fact carries { value, source }; image entries carry imageDigest.
 */
import { readFileSync, existsSync } from 'node:fs';

export const STACK_KEYS = Object.freeze([
  'postgres',
  'postgresSaver',
  'memorySaver',
  'mysql',
  'qdrant',
]);

export const TRACKED_IMAGES = Object.freeze([
  'pgvector/pgvector:pg16',
  'redis:7-alpine',
  'minio/minio:latest',
  'mailhog/mailhog:v1.0.1',
]);

/** @param {*} value @param {string} source @param {Record<string, unknown>} [extra] */
export function stackFact(value, source, extra = {}) {
  return { value, source, ...extra };
}

export function unobservedFact() {
  return stackFact('unobserved', 'unobserved');
}

/**
 * Unwrap sourced or legacy flat stack field for evaluator booleans.
 * 'unobserved' / missing → undefined (fail-closed STUB-STACK).
 * source=static-doc is NOT a runtime observation → always undefined
 * (Ban counting ADR prose pins as stack MET).
 */
export function unwrapStackValue(fact) {
  if (fact == null) return undefined;
  if (typeof fact === 'object' && 'value' in fact) {
    const source = fact.source;
    if (source === 'static-doc') return undefined;
    const v = fact.value;
    if (v === 'unobserved' || v === undefined || v === null) return undefined;
    return v;
  }
  if (fact === 'unobserved') return undefined;
  return fact;
}

/** Runtime-observation sources that may count toward stack MET. */
export const RUNTIME_STACK_SOURCES = Object.freeze([
  'log-parse',
  'docker-inspect',
]);

export function isRuntimeStackSource(source) {
  return RUNTIME_STACK_SOURCES.includes(source);
}

/** Image digest from a prior emit — not a live per-run observation. */
export function isLiveImageDigestEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (entry.liveObservation === false) return false;
  if (entry.source === 'prior-docker-inspect') return false;
  return entry.source === 'docker-inspect' && entry.liveObservation === true;
}

/** Find 1-based line index matching regex; return { line, text } or null. */
export function findLogLine(logText, regex) {
  const lines = String(logText).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      return { line: i + 1, text: lines[i] };
    }
  }
  return null;
}

/**
 * Parse stack facts from prove log (preferred) or leave unobserved.
 * Does NOT invent postgresSaver:true without a log marker.
 */
export function parseStackFromLog(logText, { logRel = null } = {}) {
  const logFile = logRel || '(inline-log)';
  const stack = {};

  // SOLE static markers (cite SOLE-*.log)
  const solePgSaver = findLogLine(
    logText,
    /PASS\s+adr-postgres-retained:\s+pins PostgresSaver/,
  );
  const solePg = findLogLine(
    logText,
    /PASS\s+adr-postgres-retained:\s+names Postgres/,
  );
  const soleBanQdrant = findLogLine(
    logText,
    /PASS\s+adr-postgres-retained:\s+Ban Qdrant-as-required-vector/,
  );
  const soleBanMysql = findLogLine(
    logText,
    /PASS\s+adr-postgres-retained:\s+Ban MySQL business cutover/,
  );
  const isolatedPg = findLogLine(logText, /E2E isolated PostgreSQL:/);

  if (solePg) {
    stack.postgres = stackFact(true, 'static-doc', {
      logFile,
      line: solePg.line,
      regex: 'PASS\\\\s+adr-postgres-retained:\\\\s+names Postgres',
      matched: solePg.text.trim(),
    });
  } else if (isolatedPg) {
    stack.postgres = stackFact(true, 'log-parse', {
      logFile,
      line: isolatedPg.line,
      regex: 'E2E isolated PostgreSQL:',
      matched: isolatedPg.text.trim(),
    });
  } else {
    stack.postgres = unobservedFact();
  }

  if (solePgSaver) {
    stack.postgresSaver = stackFact(true, 'static-doc', {
      logFile,
      line: solePgSaver.line,
      regex: 'PASS\\\\s+adr-postgres-retained:\\\\s+pins PostgresSaver',
      matched: solePgSaver.text.trim(),
    });
  } else {
    // App-level PostgresSaver is not observable from isolated-PG banner alone
    stack.postgresSaver = unobservedFact();
  }

  // memorySaver: no positive Ban MemorySaver line in committed logs → unobserved
  stack.memorySaver = unobservedFact();

  if (soleBanMysql) {
    stack.mysql = stackFact(false, 'static-doc', {
      logFile,
      line: soleBanMysql.line,
      regex: 'PASS\\\\s+adr-postgres-retained:\\\\s+Ban MySQL business cutover',
      matched: soleBanMysql.text.trim(),
    });
  } else {
    stack.mysql = unobservedFact();
  }

  if (soleBanQdrant) {
    stack.qdrant = stackFact(false, 'static-doc', {
      logFile,
      line: soleBanQdrant.line,
      regex: 'PASS\\\\s+adr-postgres-retained:\\\\s+Ban Qdrant-as-required-vector',
      matched: soleBanQdrant.text.trim(),
    });
  } else {
    stack.qdrant = unobservedFact();
  }

  return stack;
}

/** Detect which tracked images were actually started by this prove (log evidence). */
export function servicesStartedFromLog(logText) {
  const isolatedPg = findLogLine(logText, /E2E isolated PostgreSQL:/);
  const started = {
    'pgvector/pgvector:pg16': Boolean(isolatedPg),
    'redis:7-alpine': false,
    'minio/minio:latest': false,
    'mailhog/mailhog:v1.0.1': false,
  };
  const cites = {
    'pgvector/pgvector:pg16': isolatedPg
      ? {
          logLine: isolatedPg.line,
          matched: isolatedPg.text.trim(),
          note: 'run-e2e-isolated disposable PG (not docker/compose.dev.yml minio/mailhog)',
        }
      : {
          note: 'no E2E isolated PostgreSQL banner — prove did not start disposable PG',
        },
    'redis:7-alpine': {
      note: 'isolated e2e / sole static do not start redis:7-alpine (compose.dev declares it; not used by these proves)',
    },
    'minio/minio:latest': {
      compose: 'docker/compose.dev.yml:36 image: minio/minio:latest',
      note: 'declared in compose.dev but run-e2e-isolated does not start minio; log has no minio',
    },
    'mailhog/mailhog:v1.0.1': {
      compose: 'docker/compose.dev.yml:54 image: mailhog/mailhog:v1.0.1',
      note: 'declared in compose.dev but run-e2e-isolated does not start mailhog; log has no mailhog',
    },
  };
  return { started, cites, isolatedPg };
}

function isFloatingTag(imageRef) {
  return /:latest$/.test(imageRef) || /:main$/.test(imageRef);
}

/**
 * Build imageDigests map.
 * @param {string} logText
 * @param {Record<string, unknown>} [priorDigests] legacy map image→string[]|object
 * @param {{ logRel?: string, mode?: 'live'|'reemit', priorCapturedAt?: string|null, liveCapturedAt?: string|null }} [opts]
 *
 * Re-emit / reused digests → source=prior-docker-inspect + priorCapturedAt + liveObservation=false
 * (Ban counting as a live per-run docker observation).
 * Live prove inspect → source=docker-inspect + liveObservation=true + capturedAt.
 */
export function buildImageDigests(logText, priorDigests = {}, opts = {}) {
  const { started, cites } = servicesStartedFromLog(logText);
  const mode = opts.mode === 'live' ? 'live' : 'reemit';
  const out = {};
  for (const img of TRACKED_IMAGES) {
    const wasStarted = started[img] === true;
    const prior = priorDigests[img];
    let priorDigestStr = null;
    let inheritedPriorAt = null;
    if (Array.isArray(prior) && prior.length > 0) {
      const first = String(prior[0]);
      const m = first.match(/@?(sha256:[a-f0-9]+)/i);
      priorDigestStr = m ? m[1] : first;
    } else if (prior && typeof prior === 'object' && prior.imageDigest) {
      const d = prior.imageDigest;
      if (typeof d === 'string' && (d.startsWith('sha256:') || d === 'unpinned' || d === 'unobserved' || d === 'not-started')) {
        if (d.startsWith('sha256:')) priorDigestStr = d;
      }
      inheritedPriorAt = prior.priorCapturedAt || prior.capturedAt || null;
    }

    let imageDigest;
    let source;
    let liveObservation = false;
    let priorCapturedAt = null;
    let capturedAt = null;

    if (!wasStarted) {
      imageDigest = 'not-started';
      source = 'log-parse';
      liveObservation = false;
    } else if (priorDigestStr && mode === 'reemit') {
      imageDigest = priorDigestStr;
      source = 'prior-docker-inspect';
      liveObservation = false;
      priorCapturedAt = inheritedPriorAt || opts.priorCapturedAt || null;
    } else if (priorDigestStr && mode === 'live') {
      // Fresh inspect arrays passed as priorDigests in prove mode
      imageDigest = priorDigestStr;
      source = 'docker-inspect';
      liveObservation = true;
      capturedAt = opts.liveCapturedAt || new Date().toISOString();
    } else if (isFloatingTag(img)) {
      imageDigest = 'unpinned';
      source = 'compose-declared-floating';
      liveObservation = false;
    } else {
      imageDigest = 'unobserved';
      source = 'log-parse';
      liveObservation = false;
    }

    const entry = {
      imageDigest,
      started: wasStarted,
      source,
      liveObservation,
      cite: cites[img],
      logFile: opts.logRel || null,
    };
    if (priorCapturedAt) entry.priorCapturedAt = priorCapturedAt;
    if (capturedAt) entry.capturedAt = capturedAt;
    out[img] = entry;
  }
  return out;
}

/**
 * targetEnv from log evidence (not hardcoded docker-isolated for SOLE).
 */
export function parseTargetEnvFromLog(logText, { logRel = null } = {}) {
  const logFile = logRel || '(inline-log)';
  const isolated = findLogLine(logText, /E2E isolated PostgreSQL:/);
  if (isolated) {
    return {
      value: 'docker-isolated',
      source: 'log-parse',
      logFile,
      line: isolated.line,
      regex: 'E2E isolated PostgreSQL:',
    };
  }
  const soleStatic = findLogLine(
    logText,
    /uc018:sole:prove is static PG-retained honesty/,
  );
  if (soleStatic) {
    return {
      value: 'static-docs',
      source: 'log-parse',
      logFile,
      line: soleStatic.line,
      regex: 'uc018:sole:prove is static PG-retained honesty',
    };
  }
  return { value: 'unobserved', source: 'unobserved' };
}

export function capacityRepresentativeFact() {
  // Policy pin: local/docker backfill never capacity-representative
  return {
    value: false,
    source: 'policy-C-PERF-CAP-PARTIAL',
    note: 'local/docker-isolated backfill · Ban elevate · C-PERF-CAP-PARTIAL',
  };
}

/** Validate stack object: every present key must be sourced fact. All STACK_KEYS required. */
export function validateStackSources(stack) {
  if (!stack || typeof stack !== 'object') {
    return { ok: false, reason: 'stack-missing' };
  }
  for (const k of STACK_KEYS) {
    const f = stack[k];
    if (f == null || typeof f !== 'object') {
      return { ok: false, reason: `stack-fact-missing-or-unsourced:${k}` };
    }
    if (typeof f.source !== 'string' || !f.source.trim()) {
      return { ok: false, reason: `stack-fact-missing-source:${k}` };
    }
    if (!('value' in f)) {
      return { ok: false, reason: `stack-fact-missing-value:${k}` };
    }
  }
  return { ok: true };
}

/** Validate imageDigests: every tracked entry must have imageDigest field. */
export function validateImageDigests(imageDigests) {
  if (!imageDigests || typeof imageDigests !== 'object') {
    return { ok: false, reason: 'imageDigests-missing' };
  }
  for (const img of TRACKED_IMAGES) {
    const e = imageDigests[img];
    if (!e || typeof e !== 'object') {
      return { ok: false, reason: `imageDigest-entry-missing:${img}` };
    }
    if (!('imageDigest' in e) || e.imageDigest == null || e.imageDigest === '') {
      return { ok: false, reason: `imageDigest-field-missing:${img}` };
    }
  }
  return { ok: true };
}

export function readLogText(absPath) {
  if (!existsSync(absPath)) return null;
  return readFileSync(absPath, 'utf8');
}
