-- 0077_privacy_worker_dispatch_rls.sql
--
-- The dedicated worker executor can call only
-- privacy_list_claimable_checkpoint_targets(), whose SECURITY DEFINER body
-- returns target ID + owner—not locators, payloads, or checkpoint content.
-- With FORCE RLS, its definer owner nevertheless inherited the tenant-scoped
-- SELECT policies and therefore saw zero rows without a principal GUC.  That
-- made the reviewed dispatch capability permanently idle.
--
-- Give only the NOLOGIN SECURITY DEFINER owner its cross-owner *SELECT*
-- policy.  The provisioned worker login receives privacy_worker_executor, not
-- privacy_worker_owner and no table privileges; it can observe this minimal
-- dispatch feed solely by executing the reviewed function.  Claim/purge stay
-- owner-scoped and validate their target/lease CAS independently.

DROP POLICY IF EXISTS privacy_deletion_target_worker_dispatch ON privacy_deletion_target;
CREATE POLICY privacy_deletion_target_worker_dispatch ON privacy_deletion_target
  FOR SELECT TO privacy_worker_owner
  USING (true);

DROP POLICY IF EXISTS privacy_checkpoint_target_worker_dispatch ON privacy_checkpoint_target;
CREATE POLICY privacy_checkpoint_target_worker_dispatch ON privacy_checkpoint_target
  FOR SELECT TO privacy_worker_owner
  USING (true);
