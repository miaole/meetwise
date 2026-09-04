# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is right now

Meetwise（中文名：知面）is an AI-driven interview-prep platform. **The repo is contract-first docs PLUS a validated walking skeleton** — the production-critical mechanisms are built and proven, but business features are mostly not filled in yet. `pnpm dev` prints a bootstrapping notice (see `ai-docs/delivery/production-backlog.md`, walking skeleton S0). The phase goal remains: settle product scope, domain models, LangGraph orchestration, API contracts, data model, and acceptance criteria, and prove the load-bearing infra, *before* filling production business code.

What exists on disk now: `apps/{api,worker}` + `packages/{db,domain,ai-runtime,ai-graphs,contracts,config}`, guarded by 8 reproducible gates (`db:prove`, `runtime:prove`, `graph:prove`, `pipeline:prove`, `api:validate`, `api:smoke`, `arch`, `docs:check` — all green; run via `corepack pnpm <gate>`). `apps/web` and packages `ui`/`observability`/`testkit` are still planned, not built. The architecture docs describe the fuller target; where a doc lists something not yet on disk, treat it as the plan.

## Commands

```bash
pnpm docs:check        # Validate ai-docs structure: required files exist + required terms present
pnpm compose:demo      # Bring up the demo infra stack (docker/compose.demo.yml)
pnpm compose:down      # Tear down the demo stack
docker compose -f docker/compose.dev.yml up   # Dev infra only (Postgres+pgvector, Redis, MinIO, Mailhog)
```

`pnpm docs:check` (`scripts/ai-docs/check-docs.mjs`) is the only "test" today: it asserts a fixed list of required docs exist and that key docs mention required terms (e.g. system-blueprint must mention Next.js/NestJS/LangGraph/Postgres). **When adding/renaming a required doc or changing core terminology, update this script's `requiredFiles` / `requiredTerms`.**

## How to work in this repo (read before generating anything)

The workflow is documentation-first, structure-first, contract-first, test-first (`AGENTS.md`). Concretely:

- **Start from `ai-docs/meta/index.md`**, then route to the right doc via its task table before touching anything.
- **Do not invent interfaces.** Frontend and backend must be driven by a shared contract (`packages/contracts` — shared zod4 schemas + `zod-openapi`; ts-rest was rejected, see ADR-0004). Meetwise locks contracts from day one to prevent frontend/backend drift.
- **Before writing code/DB/API/LangGraph/payment/AI tasks**, produce the pre-generation gate (`AGENTS.md` "生成前门禁"): task scope, source evidence, explicit non-goals, domain objects, state-machine impact, contract impact, DB impact, test plan, verification command. For complex tasks follow the pre-generation gate fields in `AGENTS.md` "生成前门禁".
- **One conclusion lives in one place** (`ai-docs/meta/directory-boundaries.md`). Long-term product truth → `product/`; this-iteration scope → `requirements/`; tech design → `architecture/`; hard constraints → `rules/`; one-off tickets/evidence → `.tmp/` (gitignored, never committed to `ai-docs`).

## Planned architecture (target, not yet built)

Stack: Next.js App Router (web) + NestJS (api) + LangGraphJS (worker/graphs) + Postgres (+pgvector) + Redis + S3/MinIO. Full rationale in `ai-docs/architecture/system-blueprint.md`.

Target monorepo layout: `apps/{web,api,worker}` + `packages/{ai-graphs,ai-runtime,contracts,db,domain,ui,config}`. (`ai-runtime` is a package, not just a NestJS module — the model-call chokepoint is only mechanically enforceable as a package boundary; `ui` is deferred until a 2nd web surface exists.)

Backend module seams (NestJS): `identity`, `resume`, `role`, `assessment`, `interview`, `learning`, `commerce`, `ai-runtime`, `admin`, `observability`.

### Architectural invariants (these are the load-bearing rules)

- **Controllers don't orchestrate** — they call application services.
- **AI graphs never mutate payment/entitlements directly.** Entitlements are controlled in business services. Graph state holds run-time state; business facts still land in business tables.
- **All user content is untrusted input** before it reaches a model — it goes in a data block, never spliced into system instructions (`ai-docs/rules/ai/structured-output-and-safety.md`).
- **All model output is validated twice** before entering business logic: schema validation, then a business validator (question counts, score ranges, enum legality, no hallucinated résumé facts). Schema failure → retry / degrade / explainable error.
- **P0: never default-trust AI-generated code or outputs.** Review against source/UC/contract, then verify with automated multi-round gates (`ai-docs/rules/global/ai-generated-review.md`). One green command is not completion.
- **Every state-bearing object uses an explicit status enum**, never a soup of booleans, with audited transitions re-validated server-side (`ai-docs/rules/global/status-machine.md`). Key objects: `InterviewResult`, `AssessmentReport`, `PaymentOrder`, `ConsumptionRecord`, `AiGraphRun`.

### LangGraph orchestration (`ai-docs/architecture/ai/langgraph-blueprint.md`)

Four graphs: `resume-quiz`, `mock-interview`, `career-path`, `report` (report runs as subgraph/background job so it never blocks the interview path). The mock-interview graph is a resumable long session:

- **`threadId = interviewResult.resultId`.** Business code keeps camelCase `threadId`; when calling LangGraph, pass it as `thread_id` in `configurable`.
- **Waiting for user input must be expressed by persisted state** (interrupt / explicit `waiting_user`), never an in-memory connection. Resume uses the same `threadId`. This is the #1 "must redo" vs. the source project's in-memory `Map` sessions.
- **The frontend consumes business events over SSE, not model tokens** (`progress`, `question_ready`, `waiting_user`, `answer_evaluated`, `report_ready`, `report_unavailable`, …). SSE owns no business state. Terminal-failure events (e.g. `report_unavailable` on report quarantine) are mandatory so the UI degrades gracefully instead of spinning forever — no silent dead-ends.
- Graph checkpoints persist to **Postgres checkpointer**; traces → `ai_invocation_traces`, prompt versions → `ai_prompt_versions`.

## Load-bearing architectural commitments

These are the non-negotiable deltas that define Meetwise's engineering:

- LangGraph Postgres checkpoint for all run-time state — **no in-memory session maps** (durable, resumable, multi-instance safe).
- Postgres + migrations + constraints — **no scattered schemaless models**.
- Shared zod4 contracts front/back (`packages/contracts` + ZodValidationPipe + zod-openapi; ts-rest rejected per ADR-0004) — **no hand-written, drifting API calls**.
- Structured output + double validation (schema, then business) — **no bare JSON parsing**.
- Next.js App Router frontend.

## Testing posture (`ai-docs/testing/strategy/test-strategy.md`)

Layers: unit (Vitest/Jest) · contract (shared zod4 schema) · integration (Supertest + Testcontainers) · graph (deterministic fixtures + fake model) · e2e HTTP **primary** (`pnpm e2e:isolated`, fetch/SSE) · e2e UI **secondary** (Playwright, `pnpm e2e:ui:isolated`) · ai-eval (golden tasks in `ai-docs/testing/golden-tasks/`). Authoring: `ai-docs/testing/conventions/test-authoring.md`. Post-change ritual: follow only `ai-docs/skills/testing/sop.md` (review → test → regression). Close with `ai-docs/skills/testing/fail-closed-gate.md` (documentary P0, not a runner): never trust AI code/outputs by default; review ∧ verification; author must not self-sign review; multi-round reopens the gate; no secrets. Long-term rule pointer: `ai-docs/rules/global/ai-generated-review.md`. Allowed close line: local verification complete (`releaseEvidence: false`). `pnpm regression` is the always-on subset (includes `pnpm e2e-platform:check`, `pnpm e2e-platform:prove`, and `pnpm e2e-platform:layout:prove` — do not swap those scripts); then run the matrix “must” column. HTTP E2E platform SOP: `skills/testing/e2e-platform/` (draft / NOT_READY). Directory contract: `ai-docs/testing/conventions/e2e-directory-contract.md`. Integration merge order: `ai-docs/delivery/e2e-platform-integration.md`. The skill stays `status: draft` until proven. **Forbidden fake acceptance:** asserting only HTTP 200, opening a page without running the flow, proving production model quality with a mock model, AI self-grading its own report, testing only the happy path while skipping failure-refund and duplicate-request cases, or treating Playwright as the HTTP full-path implementation.

## Privacy / safety constraints (hard rules)

Never log full résumé text, full user answers, PII (ID/phone/email), API keys/tokens/payment secrets, or full model prompts (except locally, desensitized). Never commit real `.env`, secrets, résumé originals, or interview recordings — only `*.env.example`. Don't help users fabricate experience or generate fake credentials; career advice must preserve uncertainty and the user's final decision.
