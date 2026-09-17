/**
 * S4 legacy path forwarder → scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs
 *
 * Conn-only forever (BUG-FAKE-CONN). NEVER LIVE · NEVER prove-shell · NEVER covered.
 * Keeps root package.json mysql-stack:*:prove aliases working.
 * releaseEvidence=false · Not HA · inventory+readyz ≠ RAG/memory on Qdrant
 *
 * Rollback: restore body here from scripts/conn-stack/ (or git revert); delete conn-stack forwarders.
 */
import './conn-stack/mysql-stack.qdrant-backed.prove.mjs';
