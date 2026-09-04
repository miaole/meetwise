/**
 * Observe-and-fence inventory of public/preview paths that can write
 * interview or scoring state. Does not start services, read secrets, or
 * claim ECS/release evidence.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_MANIFEST = 'ai-docs/architecture/backend/public-preview-write-inventory.json';
const INTERVIEW_CONTROLLER = 'apps/api/src/modules/interview/interview.controller.ts';
const APPLICATIONS_CONTROLLER = 'apps/api/src/modules/jobs/applications.controller.ts';
const INTERVIEW_SERVICE = 'apps/api/src/modules/interview/interview.service.ts';
const APPLICATIONS_SERVICE = 'apps/api/src/modules/jobs/applications.service.ts';
const WEB_WRITE_API_ROOTS = ['apps/web/app/api/interview', 'apps/web/app/api/applications'];
const ALLOWED_KINDS = new Set(['http-route', 'web-proxy', 'server-action', 'internal-writer']);
const ALLOWED_EXPOSURE = new Set(['public-reachable', 'internal-only']);
const ALLOWED_DISPOSITION = new Set(['fenced', 'not-public']);
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SERVICE_FENCE_MARKERS = ['denyPublicPreviewWrite(', 'assertPublicPreviewWritesClosed('];

export function inventoryPath(repoRoot) {
  return resolve(repoRoot, DEFAULT_MANIFEST);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function readSource(repoRoot, file) {
  const absolute = resolve(repoRoot, file);
  if (!existsSync(absolute)) return null;
  return readFileSync(absolute, 'utf8');
}

function controllerPrefix(source) {
  const match = source.match(/@Controller\(\s*['"]([^'"]+)['"]\s*\)/);
  return match ? `/${match[1]}` : '';
}

function joinPath(prefix, route) {
  if (!route) return prefix || '/';
  const left = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
  const right = route.startsWith('/') ? route : `/${route}`;
  return `${left}${right}` || '/';
}

export function extractMutatingHttpRoutes(source, file) {
  const prefix = controllerPrefix(source);
  const routes = [];
  const decorator = /@(Post|Put|Patch|Delete)\(([^)]*)\)\s*(?:@[A-Za-z][A-Za-z0-9]*\([^)]*\)\s*)*([A-Za-z][A-Za-z0-9]*)\s*\(/g;
  let match;
  while ((match = decorator.exec(source))) {
    const method = match[1].toUpperCase();
    const rawArgs = match[2].trim();
    const handler = match[3];
    let route = '';
    const literal = rawArgs.match(/^['"]([^'"]*)['"]$/);
    if (literal) route = literal[1];
    else if (rawArgs === '') route = '';
    else continue;
    routes.push({
      method,
      path: joinPath(prefix, route),
      handler,
      source: file,
    });
  }
  return routes;
}

export function extractGetHandlers(source) {
  const handlers = [];
  const decorator = /@Get\(([^)]*)\)\s*(?:@[A-Za-z][A-Za-z0-9]*\([^)]*\)\s*)*(?:async\s+)?([A-Za-z][A-Za-z0-9]*)\s*\(/g;
  let match;
  while ((match = decorator.exec(source))) handlers.push(match[2]);
  return handlers;
}

function methodBody(source, name) {
  const start = source.search(new RegExp(`(?:async\\s+)?(?<![.\\w])${name}\\s*\\(`));
  if (start < 0) return '';
  let i = source.indexOf('(', start);
  if (i < 0) return '';
  let parens = 0;
  let braceStart = -1;
  for (; i < source.length; i += 1) {
    if (source[i] === '(') parens += 1;
    else if (source[i] === ')') {
      parens -= 1;
      if (parens === 0) {
        const bodyBrace = source.slice(i + 1).search(/\{/);
        if (bodyBrace < 0) return '';
        braceStart = i + 1 + bodyBrace;
        break;
      }
    }
  }
  if (braceStart < 0) return '';
  let depth = 0;
  for (let j = braceStart; j < source.length; j += 1) {
    if (source[j] === '{') depth += 1;
    else if (source[j] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart, j + 1);
    }
  }
  return source.slice(braceStart);
}

function walkWebInterviewPosts(repoRoot) {
  const found = [];
  const walk = (relativeDir) => {
    const absolute = resolve(repoRoot, relativeDir);
    if (!existsSync(absolute)) return;
    for (const entry of readdirSync(absolute)) {
      const child = `${relativeDir}/${entry}`;
      const stat = statSync(resolve(repoRoot, child));
      if (stat.isDirectory()) walk(child);
      else if (entry === 'route.ts') {
        const source = readSource(repoRoot, child);
        if (source && /\bexport\s+async\s+function\s+POST\b/.test(source)) {
          const stripped = child
            .replace(/^apps\/web\/app/, '')
            .replace(/\/route\.ts$/, '')
            .replace(/\[id\]/g, ':id');
          const path = stripped.startsWith('/') ? stripped : `/${stripped}`;
          found.push({ method: 'POST', path, source: child, handler: 'POST' });
        }
      }
    }
  };
  for (const root of WEB_WRITE_API_ROOTS) walk(root);
  return found;
}

export function listPublicHttpWriteSurfaces(manifest) {
  return manifest.surfaces.filter((surface) => (
    surface.kind === 'http-route'
    && surface.exposure === 'public-reachable'
    && MUTATING_METHODS.has(surface.method)
  ));
}

export function validatePublicPreviewWriteInventory(manifest, { repoRoot }) {
  const errors = [];
  if (!isObject(manifest)) return { valid: false, errors: ['manifest_not_object'], stats: {} };
  if (manifest.mode !== 'observe-and-fence') errors.push('mode_must_be_observe_and_fence');
  if (manifest.releaseEvidence !== false) errors.push('release_evidence_must_be_false');
  if (manifest.scope !== 'interview-and-scoring-state') errors.push('scope_must_be_interview_and_scoring_state');
  if (!Array.isArray(manifest.requiredFenceKinds) || manifest.requiredFenceKinds.length === 0) {
    errors.push('required_fence_kinds_missing');
  }
  if (!Array.isArray(manifest.surfaces)) {
    return { valid: false, errors: [...errors, 'surfaces_missing'], stats: {} };
  }

  const requiredFences = new Set(manifest.requiredFenceKinds ?? []);
  const ids = new Set();
  const httpKeys = new Set();
  const webKeys = new Set();

  for (const surface of manifest.surfaces) {
    if (!isObject(surface) || !nonEmptyString(surface.id)) {
      errors.push('surface_invalid');
      continue;
    }
    if (ids.has(surface.id)) errors.push(`surface_duplicate:${surface.id}`);
    ids.add(surface.id);
    if (!ALLOWED_KINDS.has(surface.kind)) errors.push(`surface_kind_invalid:${surface.id}`);
    if (!ALLOWED_EXPOSURE.has(surface.exposure)) errors.push(`surface_exposure_invalid:${surface.id}`);
    if (!ALLOWED_DISPOSITION.has(surface.disposition)) errors.push(`surface_disposition_invalid:${surface.id}`);
    if (!nonEmptyString(surface.source) || !existsSync(resolve(repoRoot, surface.source))) {
      errors.push(`surface_source_missing:${surface.id}:${surface.source}`);
    }
    if (!Array.isArray(surface.fences) || surface.fences.length === 0) {
      errors.push(`surface_unfenced:${surface.id}`);
    } else {
      for (const fence of surface.fences) {
        if (!requiredFences.has(fence)) errors.push(`surface_unknown_fence:${surface.id}:${fence}`);
      }
    }
    if (surface.exposure === 'public-reachable' && surface.disposition !== 'fenced') {
      errors.push(`public_surface_not_fenced:${surface.id}`);
    }
    if (surface.exposure === 'internal-only' && !surface.fences.includes('internal-not-public')) {
      errors.push(`internal_surface_missing_internal_fence:${surface.id}`);
    }
    if (surface.kind === 'http-route') {
      if (!MUTATING_METHODS.has(surface.method) || !nonEmptyString(surface.path) || !nonEmptyString(surface.handler)) {
        errors.push(`http_surface_incomplete:${surface.id}`);
      } else {
        httpKeys.add(`${surface.method} ${surface.path} ${surface.handler} ${surface.source}`);
      }
    }
    if (surface.kind === 'web-proxy') {
      webKeys.add(`${surface.method} ${surface.path} ${surface.source}`);
    }
    if (surface.kind === 'server-action') {
      const source = readSource(repoRoot, surface.source) ?? '';
      if (!source.includes("'use server'") || !source.includes(surface.handler)) {
        errors.push(`server_action_unregistered:${surface.id}`);
      }
    }
    if (surface.fences.includes('service-write-fence')) {
      const serviceFile = surface.source.includes('applications.controller')
        ? APPLICATIONS_SERVICE
        : INTERVIEW_SERVICE;
      const service = readSource(repoRoot, serviceFile) ?? '';
      const body = methodBody(service, surface.handler);
      if (!SERVICE_FENCE_MARKERS.some((marker) => body.includes(marker))) {
        errors.push(`service_fence_missing:${surface.id}:${surface.handler}`);
      }
    }
  }

  for (const file of [INTERVIEW_CONTROLLER, APPLICATIONS_CONTROLLER]) {
    const source = readSource(repoRoot, file);
    if (!source) {
      errors.push(`controller_missing:${file}`);
      continue;
    }
    for (const route of extractMutatingHttpRoutes(source, file)) {
      const key = `${route.method} ${route.path} ${route.handler} ${route.source}`;
      const relevant = file === INTERVIEW_CONTROLLER
        || (file === APPLICATIONS_CONTROLLER && (route.handler === 'start' || route.handler === 'finalize'));
      if (relevant && !httpKeys.has(key)) {
        errors.push(`http_route_unregistered:${route.method}:${route.path}:${route.handler}`);
      }
    }
  }

  for (const route of walkWebInterviewPosts(repoRoot)) {
    const key = `${route.method} ${route.path} ${route.source}`;
    if (!webKeys.has(key)) errors.push(`web_proxy_unregistered:${route.path}`);
  }

  const interviewController = readSource(repoRoot, INTERVIEW_CONTROLLER) ?? '';
  const interviewService = readSource(repoRoot, INTERVIEW_SERVICE) ?? '';
  const listedGets = manifest.readOnlyGetHandlers?.[INTERVIEW_CONTROLLER] ?? [];
  const foundGets = extractGetHandlers(interviewController);
  for (const handler of foundGets) {
    if (!listedGets.includes(handler)) errors.push(`get_handler_unregistered:${handler}`);
  }
  for (const handler of listedGets) {
    if (!foundGets.includes(handler)) errors.push(`get_handler_missing:${handler}`);
    const body = methodBody(interviewService, handler);
    for (const pattern of manifest.writeSqlPatterns ?? []) {
      if (body.includes(pattern)) errors.push(`get_handler_writes:${handler}:${pattern}`);
    }
  }

  const publicHttp = listPublicHttpWriteSurfaces(manifest);
  const fencedPublic = publicHttp.filter((surface) => surface.disposition === 'fenced');
  if (fencedPublic.length !== publicHttp.length) errors.push('public_http_write_not_fully_fenced');

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      surfaceCount: manifest.surfaces.length,
      publicHttpWriteCount: publicHttp.length,
      serviceFenceCount: manifest.surfaces.filter((surface) => surface.fences.includes('service-write-fence')).length,
      releaseEvidence: false,
    },
  };
}

function repoRootFromHere() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = repoRootFromHere();
  const manifest = JSON.parse(readFileSync(inventoryPath(repoRoot), 'utf8'));
  const result = validatePublicPreviewWriteInventory(manifest, { repoRoot });
  if (!result.valid) {
    console.error('public preview write inventory failed:');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`public preview write inventory ok (${result.stats.surfaceCount} surfaces, ${result.stats.publicHttpWriteCount} public HTTP writes, ${result.stats.serviceFenceCount} service fences; releaseEvidence=false)`);
  }
}
