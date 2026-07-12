-- 0001 增量迁移示范:CREATE IF NOT EXISTS(非破坏,可重跑)。生产由 runMigrations 跑、记 schema_migrations。
CREATE TABLE IF NOT EXISTS app_setting (
  key text PRIMARY KEY,
  value text NOT NULL
);
