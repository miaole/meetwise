-- 0002 增量演进:ALTER ADD COLUMN IF NOT EXISTS(非破坏,不丢数据)——这才是生产改库的姿势,不是 DROP+CREATE。
ALTER TABLE app_setting ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
