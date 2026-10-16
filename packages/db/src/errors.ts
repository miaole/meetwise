/**
 * GODFN-1d · AppError 统一错误分类面 —— 【#174 下沉 shim·5E 2026-10-12】实现体已逐字节搬迁至
 * 叶子包 @meetwise/errors（packages/errors/src/index.ts，搬迁动机=blueprint :419 修法列：
 * ai-runtime 经错误类对 db 的耦合解出）。本文件改为**再导出 shim**：@meetwise/db 公共面与
 * db 包内相对引用（'./errors.ts'）29 处既有消费点零迁移、符号/语义/错误码字符串零变。
 * 原语义零变纪律原文（GODFN-1d）随实现体迁至新包头注，收据
 * ai-docs/delivery/receipts/godfn-decompose/1d-consumers.md §1/§5 仍为对账蓝本。
 */
export { AppError, type ErrLike, asErr, errCode } from '@meetwise/errors';
