-- 0124_rag_retrieval_acl_fail_closed.sql
-- RAG-FUNNEL-01A：检索 ACL fail-closed。只 CREATE OR REPLACE 已有 rag_runtime
-- 函数体，不新增对象、不 ALTER OWNER/GRANT。空或空白 app.principal_user 必须
-- 抛 rag_acl_principal_missing（42501），不得退化为无范围 bind/resolve/search/
-- evidence。跨租户 binding 仍是 rag_binding_unavailable；无 provenance 仍是 0 行。
-- 编号：main 最新 0123。本文件保持 0124。并行未合入的 memory_vector_chunk 擦除
-- 已改用 0125_memory_vector_chunk_erasure.sql，不得与本文件抢号，本文件也不得改到 0125。

CREATE OR REPLACE FUNCTION rag_runtime.rag_bind_query(p_binding_id text,p_sticky_key text,p_ttl_seconds integer)
RETURNS TABLE(generation_id text,recipe_id text) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE principal text := btrim(current_setting('app.principal_user',true)); active_id text; candidate_id text; candidate_percent integer;
        corpus_epoch bigint; candidate_epoch bigint; selected_id text;
BEGIN
  IF coalesce(principal,'')='' THEN
    RAISE EXCEPTION 'rag_acl_principal_missing' USING ERRCODE='insufficient_privilege';
  END IF;
  IF p_ttl_seconds NOT BETWEEN 60 AND 604800 OR char_length(p_sticky_key) NOT BETWEEN 1 AND 512 THEN
    RAISE EXCEPTION 'rag_binding_invalid' USING ERRCODE='check_violation';
  END IF;
  SELECT epoch INTO corpus_epoch FROM public.rag_corpus_epoch WHERE singleton;
  SELECT a.generation_id INTO active_id FROM public.rag_active_generation a WHERE a.singleton;
  IF active_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rag_embedding_generation g
    WHERE g.id=active_id AND g.state='active' AND g.control_trust_state='controlled' AND g.source_epoch=corpus_epoch) THEN
    RAISE EXCEPTION 'rag_active_generation_stale' USING ERRCODE='serialization_failure';
  END IF;
  SELECT g.id,r.percent,g.source_epoch INTO candidate_id,candidate_percent,candidate_epoch
    FROM public.rag_embedding_generation g JOIN public.rag_generation_rollout r ON r.generation_id=g.id
   WHERE g.state='gated' AND g.control_trust_state='controlled' AND r.status IN ('running','completed') ORDER BY g.created_at DESC LIMIT 1;
  IF candidate_id IS NOT NULL AND candidate_epoch=corpus_epoch
     AND (get_byte(decode(substr(md5(p_sticky_key),1,2),'hex'),0) % 100) < candidate_percent THEN selected_id:=candidate_id; ELSE selected_id:=active_id; END IF;
  IF selected_id IS NULL THEN RAISE EXCEPTION 'rag_active_generation_unavailable' USING ERRCODE='no_data_found'; END IF;
  INSERT INTO public.rag_query_binding(id,owner_user_id,generation_id,sticky_key_hash,expires_at)
  VALUES (p_binding_id,principal,selected_id,encode(public.digest(p_sticky_key,'sha256'),'hex'),clock_timestamp()+make_interval(secs=>p_ttl_seconds))
  ON CONFLICT (id) DO NOTHING;
  RETURN QUERY SELECT b.generation_id,g.recipe_id FROM public.rag_query_binding b
    JOIN public.rag_embedding_generation g ON g.id=b.generation_id AND g.control_trust_state='controlled'
    WHERE b.id=p_binding_id AND b.owner_user_id=principal AND b.status='active' AND b.expires_at>clock_timestamp();
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_resolve_query_binding(p_binding_id text)
RETURNS TABLE(generation_id text,recipe_id text,dimensions integer) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE principal text := btrim(current_setting('app.principal_user',true));
BEGIN
  IF coalesce(principal,'')='' THEN
    RAISE EXCEPTION 'rag_acl_principal_missing' USING ERRCODE='insufficient_privilege';
  END IF;
  UPDATE public.rag_query_binding SET status='expired' WHERE id=p_binding_id AND owner_user_id=principal AND status='active' AND expires_at<=clock_timestamp();
  RETURN QUERY SELECT b.generation_id,r.id,r.dimensions FROM public.rag_query_binding b
    JOIN public.rag_embedding_generation g ON g.id=b.generation_id AND g.state IN ('active','gated','deprecated') AND g.control_trust_state='controlled'
    JOIN public.rag_embedding_recipe r ON r.id=g.recipe_id
   WHERE b.id=p_binding_id AND b.owner_user_id=principal AND b.status='active' AND b.expires_at>clock_timestamp();
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_binding_unavailable' USING ERRCODE='no_data_found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_search_bound(p_binding_id text,p_embedding public.vector,p_k integer)
RETURNS TABLE(chunk_id text,document_id text,content_version integer,distance double precision) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE gen_id text; ignored_recipe text; table_name text; dim integer;
        principal text := btrim(current_setting('app.principal_user',true));
BEGIN
  IF coalesce(principal,'')='' THEN
    RAISE EXCEPTION 'rag_acl_principal_missing' USING ERRCODE='insufficient_privilege';
  END IF;
  IF p_k NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'rag_search_k_invalid' USING ERRCODE='check_violation'; END IF;
  SELECT rb.generation_id,rb.recipe_id,rb.dimensions INTO gen_id,ignored_recipe,dim FROM rag_runtime.rag_resolve_query_binding(p_binding_id) rb;
  SELECT physical_table INTO table_name FROM public.rag_embedding_generation WHERE id=gen_id AND control_trust_state='controlled';
  IF NOT FOUND OR public.vector_dims(p_embedding)<>dim THEN RAISE EXCEPTION 'rag_search_embedding_invalid' USING ERRCODE='check_violation'; END IF;
  RETURN QUERY EXECUTE format(
    'SELECT v.chunk_id,v.document_id,v.content_version,(v.embedding OPERATOR(public.<=>) $1)::double precision
       FROM rag_control.%I v
       JOIN public.rag_generation_member m ON m.generation_id=$2 AND m.chunk_id=v.chunk_id
       JOIN public.rag_corpus_chunk c ON c.id=v.chunk_id AND c.state IN (''active'',''superseded'')
       JOIN public.rag_corpus_document d ON d.id=c.document_id
      WHERE (v.visibility=''private'' AND v.owner_user_id=$4)
         OR (v.visibility=''global'' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
            WHERE p.document_id=v.document_id AND p.content_version=v.content_version AND p.trust_state=''approved''))
      ORDER BY v.embedding OPERATOR(public.<=>) $1 LIMIT $3', table_name)
    USING p_embedding,gen_id,p_k,principal;
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_evidence_bound(p_binding_id text,p_chunk_ids text[],p_max_chars integer)
RETURNS TABLE(chunk_id text,document_id text,content_version integer,snapshot_hash text,locator jsonb,excerpt text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE gen_id text;
        principal text := btrim(current_setting('app.principal_user',true));
BEGIN
  IF coalesce(principal,'')='' THEN
    RAISE EXCEPTION 'rag_acl_principal_missing' USING ERRCODE='insufficient_privilege';
  END IF;
  IF coalesce(array_length(p_chunk_ids,1),0)>50 OR p_max_chars NOT BETWEEN 1 AND 1200 THEN
    RAISE EXCEPTION 'rag_evidence_invalid' USING ERRCODE='check_violation';
  END IF;
  SELECT rb.generation_id INTO gen_id FROM rag_runtime.rag_resolve_query_binding(p_binding_id) rb;
  RETURN QUERY SELECT c.id,c.document_id,c.content_version,c.content_hash,c.locator,left(c.content,p_max_chars)
    FROM unnest(p_chunk_ids) WITH ORDINALITY u(id,ord)
    JOIN public.rag_generation_member m ON m.generation_id=gen_id AND m.chunk_id=u.id
    JOIN public.rag_corpus_chunk c ON c.id=m.chunk_id AND c.state IN ('active','superseded')
    JOIN public.rag_corpus_document d ON d.id=c.document_id
   WHERE (d.visibility='private' AND d.owner_user_id=principal)
      OR (d.visibility='global' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
        WHERE p.document_id=c.document_id AND p.content_version=c.content_version AND p.trust_state='approved'))
   ORDER BY u.ord;
END;
$$;
