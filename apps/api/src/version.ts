/**
 * 应用版本与构建标识（ADR-0021）。
 *
 * 运行时版本单一来源是部署注入的 `APP_VERSION`（CI 从 git tag 写入），
 * 本地/未发布环境回退到 `dev`。刻意不读文件系统取版本：cwd / __dirname 在
 * monorepo 打包、多进程与容器路径下均存在歧义，12-factor 应用以环境注入为准。
 */
export const APP_VERSION = process.env.APP_VERSION ?? 'dev';
export const APP_REVISION = process.env.APP_REVISION ?? process.env.GIT_SHA ?? 'dev';
