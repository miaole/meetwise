-- 0234_qbank_taxonomy_v2_business_leaves.sql
--
-- Publish taxonomy v2: v1 leaf semantics are copied unchanged, and business/*
-- professional leaves are added.  v1 remains released and immutable.  New
-- job/candidate decisions use v2 only when a business leaf is allocated;
-- tech-only decisions stay on v1 so existing generation projections still hit.
--
-- Migration actor is a superuser (FORCE RLS does not apply).  Release must
-- start as draft, then flip to released with the manifest hash receipt.

INSERT INTO qbank_taxonomy_release(version, release_hash, state)
VALUES (
  'v2',
  encode(digest(convert_to('qbank-taxonomy-draft:v2', 'UTF8'), 'sha256'), 'hex'),
  'draft'
)
ON CONFLICT (version) DO NOTHING;

INSERT INTO qbank_taxonomy_scope(taxonomy_version, scope_id, parent_scope_id, is_leaf, display_name)
VALUES
  ('v2','backend',NULL,false,'后端'),
  ('v2','backend/nodejs','backend',true,'Node.js 后端'),
  ('v2','backend/java','backend',true,'Java/JVM 后端'),
  ('v2','backend/go','backend',true,'Go 后端'),
  ('v2','backend/python','backend',true,'Python 后端'),
  ('v2','backend/general','backend',true,'通用后端与系统设计'),
  ('v2','frontend',NULL,false,'前端'),
  ('v2','frontend/web','frontend',true,'Web 前端'),
  ('v2','qa',NULL,false,'测试质量'),
  ('v2','qa/quality_engineering','qa',true,'测试与质量工程'),
  ('v2','ai_ml',NULL,false,'AI 与机器学习'),
  ('v2','ai_ml/applied','ai_ml',true,'AI、RAG 与机器学习'),
  ('v2','business',NULL,false,'非技术职场'),
  ('v2','business/product','business',true,'产品管理'),
  ('v2','business/design','business',true,'设计'),
  ('v2','business/operations','business',true,'运营'),
  ('v2','business/sales','business',true,'销售与客户成功'),
  ('v2','business/hr','business',true,'人力资源'),
  ('v2','business/general','business',true,'通用职场与协作')
ON CONFLICT (taxonomy_version, scope_id) DO NOTHING;

SET CONSTRAINTS ALL IMMEDIATE;

UPDATE qbank_taxonomy_release
   SET state='released', release_hash=qbank_taxonomy_manifest_hash(version)
 WHERE version='v2' AND state='draft';
