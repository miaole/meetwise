-- 0015_pwd_epoch.sql — 账户加"密码代次"列,支撑改密即时吊销会话(安全洞 F4)。幂等,脏库可重跑。
-- 令牌内嵌签发时刻的 pwd_epoch 快照;改密使本列自增 → 旧/被盗令牌代次落后 → 守卫比对不等即 401(不再等 7 天 TTL)。
-- 默认 0 与老令牌"无 pe 字段视作 0"对齐:迁移前签发的令牌在首个代次仍有效,不误吊销。
-- 增量非破坏(ADD COLUMN IF NOT EXISTS),不改历史;新库全量 schema 由集成者合入 01_schema。
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS pwd_epoch int NOT NULL DEFAULT 0;
