-- 0156 在主键默认值切到 uuidv7() 之后新建了两张表，主键仍是 gen_random_uuid()。
-- 只改这两列的默认值，不回填已有行。

ALTER TABLE ONLY public.offline_remit_record ALTER COLUMN id SET DEFAULT public.uuidv7();
ALTER TABLE ONLY public.invoice_request ALTER COLUMN id SET DEFAULT public.uuidv7();
