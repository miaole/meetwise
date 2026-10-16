-- 0153_account_deletion_column.sql
--
-- UNSTUB-ERASE rev2 (D6 minimum set · soft-delete first) — D5 account
-- deactivation column.  `user_account.deleted_at` records that the owner
-- initiated account-level deletion (POST /profile/deactivate with password
-- recheck).  The row itself stays (same-email re-registration stays impossible
-- in S1 because the row and its unique email remain); anonymization/physical
-- deletion belongs to S2 and is never claimed by S1.

ALTER TABLE user_account ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_account_deleted_at_status_chk') THEN
    -- Weak consistency constraint (rev2 D5): a recorded deletion timestamp can
    -- only exist on a disabled account.  Pre-existing disabled accounts
    -- (deleted_at IS NULL) stay valid; the existing status CHECK is untouched.
    ALTER TABLE user_account
      ADD CONSTRAINT user_account_deleted_at_status_chk
      CHECK (deleted_at IS NULL OR status = 'disabled');
  END IF;
END $$;

-- ── DOWN (rollback face · reviewed reverse operations, apply in order) ──────
-- Requires zero accounts with deleted_at set (all deactivations resolved or
-- explicitly reviewed), otherwise the column drop silently loses deletion
-- records.
--   ALTER TABLE user_account DROP CONSTRAINT IF EXISTS user_account_deleted_at_status_chk;
--   ALTER TABLE user_account DROP COLUMN IF EXISTS deleted_at;
