/**
 * 应用版本与构建标识（ADR-0022）。
 *
 * 运行时版本来自部署注入的 `APP_VERSION` / `APP_REVISION`。当前部署管线尚未把
 * git tag 写入这两个变量（接线点在部署步骤，见 ADR-0022 §4），故 `/meta` 现恒为
 * `dev`——这是"尚未接线"，不对外宣称线上版本可读。刻意不读文件系统取版本：cwd /
 * __dirname 在 monorepo 打包、多进程与容器路径下均存在歧义，12-factor 应用以环境注入为准。
 */
export const APP_VERSION = process.env.APP_VERSION ?? 'dev';
export const APP_REVISION = process.env.APP_REVISION ?? process.env.GIT_SHA ?? 'dev';
