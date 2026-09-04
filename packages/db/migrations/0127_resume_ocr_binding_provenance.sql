-- 0127_resume_ocr_binding_provenance.sql
--
-- MODEL-OP-01：图片简历的面试授权只认密封 OCR binding 快照。
-- 快照不含转写原文、prompt 或 Key；文本/PDF 行保持 ocr_binding IS NULL。
-- Number is 0127: 0124–0126 are reserved by open PRs (#71 RAG ACL, #70
-- memory vector erasure, #74 interview answer dual-write fence).

ALTER TABLE resume DROP CONSTRAINT IF EXISTS resume_source_kind_chk;
ALTER TABLE resume ADD CONSTRAINT resume_source_kind_chk
  CHECK (source_kind IN ('text', 'pdf', 'image'));

ALTER TABLE resume_profile
  ADD COLUMN IF NOT EXISTS ocr_binding jsonb;

ALTER TABLE resume_profile DROP CONSTRAINT IF EXISTS resume_profile_ocr_binding_chk;
ALTER TABLE resume_profile ADD CONSTRAINT resume_profile_ocr_binding_chk
  CHECK (
    ocr_binding IS NULL
    OR (
      jsonb_typeof(ocr_binding) = 'object'
      AND ocr_binding->>'operationId' = 'resume.ocr.v1'
      AND ocr_binding->>'registryVersion' = 'model-op-registry-v1'
      AND ocr_binding->>'inputKind' = 'vision-ocr'
      AND ocr_binding->>'capability' = 'vision'
      AND ocr_binding->>'endpointProfileId' = 'dashscope-cn-beijing'
      AND ocr_binding->>'region' = 'cn-beijing'
      AND ocr_binding->>'modelOrRecipe' = 'vision-ocr'
      AND ocr_binding->>'admissionKey' = 'dashscope-native|cn-beijing|vision-ocr|resume.ocr.v1'
      AND ocr_binding->>'wired' = 'true'
      AND ocr_binding->>'mediaDigest' ~ '^[0-9a-f]{64}$'
      AND NOT (ocr_binding ? 'text')
      AND NOT (ocr_binding ? 'prompt')
      AND NOT (ocr_binding ? 'system')
      AND NOT (ocr_binding ? 'messages')
      AND NOT (ocr_binding ? 'apiKey')
      AND NOT (ocr_binding ? 'api_key')
      AND NOT (ocr_binding ? 'url')
      AND NOT (ocr_binding ? 'baseUrl')
      AND NOT (ocr_binding ? 'image')
      AND NOT (ocr_binding ? 'raw')
    )
  );

-- Identity pairing + immutability. CHECK cannot subquery, so the exact
-- key set and source_kind coupling live here. This is still an identity
-- seal, not an invocation/blob hash chain.
CREATE OR REPLACE FUNCTION meetwise_resume_ocr_identity_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  kind text;
  keys text[];
BEGIN
  IF TG_TABLE_NAME = 'resume' THEN
    IF TG_OP = 'UPDATE' AND NEW.source_kind IS DISTINCT FROM OLD.source_kind THEN
      RAISE EXCEPTION 'resume_source_kind_immutable';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.ocr_binding IS DISTINCT FROM OLD.ocr_binding THEN
    RAISE EXCEPTION 'resume_ocr_binding_immutable';
  END IF;

  SELECT r.source_kind INTO kind
    FROM resume r
   WHERE r.id = NEW.resume_id AND r.owner_user_id = NEW.owner_user_id;
  IF kind IN ('text', 'pdf') AND NEW.ocr_binding IS NOT NULL THEN
    RAISE EXCEPTION 'ocr_binding_forbidden_for_non_image';
  END IF;
  IF kind = 'image' AND NEW.ocr_binding IS NULL THEN
    RAISE EXCEPTION 'ocr_binding_required_for_image';
  END IF;
  IF NEW.ocr_binding IS NOT NULL THEN
    SELECT array_agg(k ORDER BY k) INTO keys
      FROM jsonb_object_keys(NEW.ocr_binding) AS k;
    IF keys IS DISTINCT FROM ARRAY[
      'admissionKey','capability','endpointProfileId','inputKind','mediaDigest',
      'modelOrRecipe','operationId','region','registryVersion','wired'
    ] THEN
      RAISE EXCEPTION 'ocr_binding_keys_invalid';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resume_source_kind_immutable ON resume;
CREATE TRIGGER trg_resume_source_kind_immutable
  BEFORE UPDATE ON resume
  FOR EACH ROW
  EXECUTE FUNCTION meetwise_resume_ocr_identity_guard();

DROP TRIGGER IF EXISTS trg_resume_ocr_identity_guard ON resume_profile;
CREATE TRIGGER trg_resume_ocr_identity_guard
  BEFORE INSERT OR UPDATE ON resume_profile
  FOR EACH ROW
  EXECUTE FUNCTION meetwise_resume_ocr_identity_guard();
