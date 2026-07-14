-- 0017_qbank_seed_curator.sql — 把"系统灌库主体"provision 成 curator,使种子/官方题库灌库走**策展治理路径**。
--
-- 背景/缺口:0013 建了策展源审核门 + 受审池,0016 让检索接管(annSearch 只召回可信可见集)。但**灌库仍直写**
--   (apps/worker qbank-ingest 以 '__system_qbank__' 直写 vector_chunk、不建 pool 条目)→ 这些块落 0016 可见 lane(b)
--   (系统 owner 且无池条目)= **免治理直灌**。后果:源审核/撤销只管未来内容,**现有线上真实题库撤不掉**。
--
-- 本迁移做一件事:seed '__system_qbank__' 进 qbank_curator 白名单。灌库据此(见 apps/worker qbank-ingest)改走
--   propose→approve→promoteToPool→写 vector_chunk:每条种子挂在一条 approved 策展源之下、进 qbank_pool_entry(lane a),
--   **撤销(reject)源即时下架其真实 chunk** → 线上真实题库自此可治理。
--
-- 为何系统主体可当 curator(且自 propose 自 approve 合法):它是**服务端可信绑定的运营灌库主体**,绝不取自不可信输入
--   (见 06_retrieval 注),其灌入即官方/策展语料 —— 与"不受信用户提议必须落 pending、由他人 curator 审"是两回事。
--   授权根仍钉在 DB:qbank_curator 只超级用户(迁移账号)能写(0013 显式 REVOKE app_role 写)→ 运行期 app_role 无法自封,
--   信任根不可被应用层提权。收窄:仅授予 '__system_qbank__' 单一主体,不放开任何用户可写 qbank。
--
-- 幂等/非破坏:纯 INSERT ... ON CONFLICT DO NOTHING;不改表结构、不动 0013/0016 的策略/触发器/视图。
-- 依赖顺序:qbank_curator 由 0013 建;迁移按 version 序,0017 在 0013 之后应用(runMigrations 按文件名排序)。
-- 未 provision 兜底:灌库检测到本主体非 curator 时回落 lane(b) 直灌(= 收紧前行为,写门仍封投毒),非 fail-open。

INSERT INTO qbank_curator (user_id) VALUES ('__system_qbank__') ON CONFLICT (user_id) DO NOTHING;
