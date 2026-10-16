-- 0196_trigfam_execute_least_privilege.sql — #150：0144 六触发器函数收回 PUBLIC 改授 app_role（最小授权）
--
-- executionMode = transactional（默认·12 语句 REVOKE×6+GRANT×6 单事务原子）
--
-- #150 修法：0144 把 6 个 tf_* 函数 GRANT EXECUTE TO PUBLIC（0144:406-411 六处
-- 连续在位亲证·5 INVOKER+1 低暴露 DEFINER），口径宽于最小授权。本迁移逐函数
-- REVOKE EXECUTE FROM PUBLIC → GRANT EXECUTE TO app_role（运行时角色·触发器
-- 函数运行时由系统代表触发器调用，EXECUTE 授权面=直调可达边界——收回 PUBLIC
-- 即收窄至运行时角色，触发器触发路径零变化）。0144 原文零字节改（历史迁移铁律）。
--
-- 【0145 归因注释勘误登记（#141 修法半·新迁移注释面通道）】0145:21-24 将
-- 「uuidv7 DEFAULT 不可执行」归因于 0040/0041 的 REVOKE——审计考证实证真因=
-- 0073 默认撤销 PUBLIC EXECUTE 后 DEFAULT 函数对运行时角色不可执行（0145:25-26
-- 补的 GRANT 即补此洞）。0145 原文零字节改，本注记即对侧诚实化锚；泛化门
-- 机制面由 db-acl.proof 泛化臂承载（pg_attrdef 推导的 DEFAULT 函数 × 运行时
-- 角色 executable 全量断言）。
--
-- 死预注册件 interview_derived_score（0144 §3 未接线）删除面如实登记缓行：
-- 删除将翻 db-trigfam-unify.proof P1 在位断言/P3 公式臂（他刀收据 proof·非本刀
-- 触面）——呈报协调方归后继处置，本迁移不删。

REVOKE EXECUTE ON FUNCTION public.tf_assert_job_application_transition(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tf_enforce_job_application_binding(public.job_application, public.job_application) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tf_finalize_bound_job_application(public.interview, public.interview) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tf_interview_application_binding_immutable(text, public.interview, public.interview) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tf_interview_job_resume_reference(text, public.interview_job, public.interview_job) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tf_interview_consumption_terminal_pair(public.interview, public.interview) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.tf_assert_job_application_transition(text, text) TO app_role;
GRANT EXECUTE ON FUNCTION public.tf_enforce_job_application_binding(public.job_application, public.job_application) TO app_role;
GRANT EXECUTE ON FUNCTION public.tf_finalize_bound_job_application(public.interview, public.interview) TO app_role;
GRANT EXECUTE ON FUNCTION public.tf_interview_application_binding_immutable(text, public.interview, public.interview) TO app_role;
GRANT EXECUTE ON FUNCTION public.tf_interview_job_resume_reference(text, public.interview_job, public.interview_job) TO app_role;
GRANT EXECUTE ON FUNCTION public.tf_interview_consumption_terminal_pair(public.interview, public.interview) TO app_role;
