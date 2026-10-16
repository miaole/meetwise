-- 0001_skeleton.sql — MySQL first-vertical skeleton for compose.mysql-local.
-- utf8mb4 + InnoDB. owner_user_id columns ready for app-layer tenant filtering.
-- NOT an RLS equivalent. NOT a full ~130 PG migration port.
-- releaseEvidence=false. Not HA. Do not claim cutover or privacy parity from this file alone.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS mw_schema_migrations (
  version VARCHAR(64) NOT NULL,
  applied_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  checksum CHAR(64) NULL,
  PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='MySQL migration ledger (local skeleton; not PG schema_migrations parity)';

-- Owner / principal stub — app tenant column surface only (≠ RLS).
CREATE TABLE IF NOT EXISTS owner_principal (
  owner_user_id VARCHAR(128) NOT NULL,
  display_name VARCHAR(255) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (owner_user_id),
  KEY idx_owner_principal_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Principal stub; owner_user_id filter ≠ RLS FORCE';

-- Job-queue shaped table for a first vertical (claim/lease columns for future work).
-- Does not wire production wakeup / LISTEN-NOTIFY. Not MODEL-OP cutover.
CREATE TABLE IF NOT EXISTS job_queue (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id VARCHAR(128) NOT NULL,
  job_type VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  payload_json JSON NULL,
  lease_owner VARCHAR(128) NULL,
  lease_expires_at TIMESTAMP(3) NULL,
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_job_queue_owner_status (owner_user_id, status),
  KEY idx_job_queue_claim (status, lease_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Queue-shaped stub; owner_user_id ≠ RLS; not production wakeup';
