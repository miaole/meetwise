-- 0012_resume_profile_status.sql — resume_profile 增审阅状态 + 置信度(幂等,脏库可重跑)。
-- 目的:OCR/图片来源(尤其伪造证件图)产出的结构化画像**恒标 needs_review**,系统不冒充判"真/假",给人工复核落地位;
--       文本/PDF 文本层来源默认 ok。confidence 供视觉抗注入 eval 后续按字段置信回写(现可空)。
ALTER TABLE resume_profile ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ok';
ALTER TABLE resume_profile ADD COLUMN IF NOT EXISTS confidence numeric;
-- 显式枚举约束(状态机:ok / needs_review / rejected),幂等添加。
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resume_profile_status_chk') THEN
    ALTER TABLE resume_profile ADD CONSTRAINT resume_profile_status_chk CHECK (status IN ('ok','needs_review','rejected'));
  END IF;
END $$;
