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

/**
 * C-IMAGE-DIGEST fix · LIVE per-run digest capture constants.
 * 'live-container-inspect' is deliberately NOT added to RUNTIME_STACK_SOURCES
 * (that table is frozen): a live image digest is a digest-honesty observation,
 * NOT a runtime stack MET — adding it there would be an out-of-scope stack change.
 */
export const LIVE_CONTAINER_INSPECT_SOURCE = 'live-container-inspect';
export const LIVE_CONTAINER_INSPECT_FAILED_SOURCE = 'live-container-inspect-failed';
export const HOST_TAG_INSPECT_FALLBACK_SOURCE = 'host-tag-inspect-fallback';
/** The tracked image the isolated-PG banner identifies (servicesStartedFromLog). */
export const ISOLATED_PG_TRACKED_IMAGE = 'pgvector/pgvector:pg16';

const CONTAINER_ID_RE = /^[a-f0-9]{64}$/i;
const IMAGE_DIGEST_RE = /^sha256:[a-f0-9]{64}$/i;
const RUN_CONTAINER_NAME_RE = /^meetwise-e2e-\d+-\d+$/;
const ISO_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/**
 * Parse the exact run container name out of the run-e2e-isolated banner line
 * ("E2E isolated PostgreSQL: meetwise-e2e-<pid>-<ts> on 127.0.0.1:<port>").
 * Only the banner's exact container name is trusted (pid+timestamp is unique per
 * run — Ban name-prefix polling that could hit a concurrent run's container).
 * Returns null when the line is not the banner; { trusted:false, reason } when it
 * is the banner but the parsed name does not match the run container shape.
 */
export function parseIsolatedPgBannerContainer(line) {
  const m = /E2E isolated PostgreSQL:\s*(\S+)\s+on\s+127\.0\.0\.1:\d+/.exec(String(line));
  if (!m) return null;
  const containerName = m[1];
  if (!RUN_CONTAINER_NAME_RE.test(containerName)) {
    return { containerName, trusted: false, reason: 'banner-container-name-unexpected' };
  }
  return { containerName, trusted: true };
}

/**
 * Parse `docker inspect --format '{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Running}}'`
 * output for a run-window container. Fail-closed: any missing / ill-formed field
 * (including a forged or empty container Id) → { ok:false, reason }.
 */
export function parseContainerInspectOutput(stdout) {
  const text = String(stdout || '').trim();
  if (!text) return { ok: false, reason: 'inspect-output-empty' };
  const parts = text.split('|');
  if (parts.length < 4) {
    return { ok: false, reason: 'inspect-output-unparseable', detail: text.slice(0, 240) };
  }
  const [containerId, imageDigest, configImage, running] = parts;
  if (!CONTAINER_ID_RE.test(containerId || '')) {
    return { ok: false, reason: 'container-id-unparseable', detail: String(containerId).slice(0, 80) };
  }
  if (!IMAGE_DIGEST_RE.test(imageDigest || '')) {
    return { ok: false, reason: 'image-digest-unparseable', detail: String(imageDigest).slice(0, 80) };
  }
  if (!configImage) return { ok: false, reason: 'config-image-empty' };
  if (running !== 'true') return { ok: false, reason: 'container-not-running' };
  return { ok: true, containerId, imageDigest, configImage, running: true };
}

/**
 * Full validation of a live-container-inspect capture record (defense in depth:
 * the emitter validates at capture time; buildImageDigests re-validates before it
 * ever marks an entry live). A record that is missing / forging containerId or
 * digest, not observed running, or without an ISO capturedAt can never yield a
 * live entry — it is downgraded to a fail-closed failure entry instead.
 */
export function isValidLiveCaptureRecord(rec) {
  if (!rec || typeof rec !== 'object') return false;
  if (rec.ok !== true) return false;
  if (rec.source !== LIVE_CONTAINER_INSPECT_SOURCE) return false;
  if (typeof rec.containerId !== 'string' || !CONTAINER_ID_RE.test(rec.containerId)) return false;
  if (typeof rec.imageDigest !== 'string' || !IMAGE_DIGEST_RE.test(rec.imageDigest)) return false;
  if (typeof rec.configImage !== 'string' || !rec.configImage) return false;
  if (rec.running !== true) return false;
  if (typeof rec.capturedAt !== 'string' || !ISO_TS_RE.test(rec.capturedAt)) return false;
  if (Number.isNaN(Date.parse(rec.capturedAt))) return false;
  return true;
}

/**
 * LIVE per-run image digest gate — tightened extension (C-IMAGE-DIGEST fix).
 * Global strict reading: an entry is live ONLY when
 *   source === 'live-container-inspect' && liveObservation === true && containerId non-empty.
 * ANY entry missing a non-empty containerId is false — including legacy
 * 'docker-inspect' entries that carried no containerId (host tag inspect must not
 * impersonate a run-window observation), 'prior-docker-inspect', host-tag fallback,
 * 'live-container-inspect-failed', not-started / unpinned / unobserved. Existing
 * committed receipts stay false under this gate and are never rewritten.
 */
export function isLiveImageDigestEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (entry.liveObservation !== true) return false;
  if (entry.source !== LIVE_CONTAINER_INSPECT_SOURCE) return false;
  if (typeof entry.containerId !== 'string' || entry.containerId.trim() === '') return false;
  return true;
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
 * @param {{ logRel?: string, mode?: 'live'|'reemit', priorCapturedAt?: string|null,
 *           liveCaptures?: Array<object> }} [opts]
 *
 * C-IMAGE-DIGEST fix labeling (fail-closed):
 * - LIVE per-run entry ONLY from a validated in-run-window container capture
 *   (emitter observed the run banner, then docker-inspected that exact container
 *   while it was still alive): source=live-container-inspect + liveObservation=true
 *   + containerId + capturedAt(run window). Re-validated via
 *   isValidLiveCaptureRecord — forged/missing containerId can never be live.
 * - re-emit / reused digests → source=prior-docker-inspect + priorCapturedAt +
 *   liveObservation=false (Ban counting as a live per-run docker observation).
 *   liveCaptures are deliberately ignored in reemit mode: reemit runs no prove,
 *   so no run window exists and any capture would be fabricated.
 * - host tag image inspect (fresh arrays without a container capture) →
 *   source=host-tag-inspect-fallback + liveObservation=false. The old branch that
 *   mislabeled these host readings as 'docker-inspect'/live=true is REMOVED.
 * - a present-but-invalid/failed capture attempt → explicit failure entry
 *   (source=live-container-inspect-failed, imageDigest='unobserved',
 *   liveObservation=false): the failure is visible, and no host tag value is
 *   impersonated as a live observation.
 * The former opts.liveCapturedAt (emit-time timestamp feeding the mislabeled
 * live branch) is gone — live capturedAt now comes only from the in-window
 * capture record (Ban inheriting priorCapturedAt or emit-time as live moment).
 */
export function buildImageDigests(logText, priorDigests = {}, opts = {}) {
  const { started, cites } = servicesStartedFromLog(logText);
  const mode = opts.mode === 'live' ? 'live' : 'reemit';
  const liveCaptures = Array.isArray(opts.liveCaptures) ? opts.liveCaptures : [];
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

    const capturesForImg = liveCaptures.filter((c) => c && c.image === img);
    const liveCap = mode === 'live'
      ? capturesForImg.find((c) => isValidLiveCaptureRecord(c))
      : null;
    const failedCap = liveCap
      ? null
      : capturesForImg.find((c) => !isValidLiveCaptureRecord(c) || mode !== 'live');

    let imageDigest;
    let source;
    let liveObservation = false;
    let priorCapturedAt = null;
    let capturedAt = null;
    let containerId = null;
    let containerName = null;
    let failureReason = null;

    if (!wasStarted) {
      imageDigest = 'not-started';
      source = 'log-parse';
      liveObservation = false;
    } else if (priorDigestStr && mode === 'reemit') {
      // Re-emit: inherited prior digest — never a live per-run observation
      // (liveCaptures ignored in reemit: no prove ran, no run window exists).
      imageDigest = priorDigestStr;
      source = 'prior-docker-inspect';
      liveObservation = false;
      priorCapturedAt = inheritedPriorAt || opts.priorCapturedAt || null;
    } else if (liveCap) {
      // LIVE per-run capture: docker inspect of the banner-parsed run container,
      // performed by the emitter inside the run window (container still alive).
      imageDigest = liveCap.imageDigest;
      source = LIVE_CONTAINER_INSPECT_SOURCE;
      liveObservation = true;
      containerId = liveCap.containerId;
      containerName = liveCap.containerName || null;
      capturedAt = liveCap.capturedAt || null;
    } else if (failedCap) {
      // Fail-closed: a capture attempt exists but is missing/forged/failed —
      // honest failure marker; never live; host tag value not impersonated.
      imageDigest = 'unobserved';
      source = LIVE_CONTAINER_INSPECT_FAILED_SOURCE;
      liveObservation = false;
      failureReason = failedCap.reason
        || (mode !== 'live' ? 'no-run-window-in-reemit' : 'container-inspect-failed');
      containerName = failedCap.containerName || null;
      capturedAt = failedCap.capturedAt || null;
    } else if (priorDigestStr) {
      // Host-side tag image inspect fallback — honest non-live. The old
      // 'docker-inspect'/live=true mislabel branch was removed (C-IMAGE-DIGEST).
      imageDigest = priorDigestStr;
      source = HOST_TAG_INSPECT_FALLBACK_SOURCE;
      liveObservation = false;
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
    if (containerId) entry.containerId = containerId;
    if (containerName) entry.containerName = containerName;
    if (failureReason) entry.failureReason = failureReason;
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
