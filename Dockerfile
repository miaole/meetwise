# Node 服务镜像（api / worker，tsx 直跑 TS）。多阶段:deps 层缓存依赖,runtime 层跑源码。
# 用法: docker build -t meetwise-node . ;  command 由 compose 指定(api 或 worker)。
FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS deps
WORKDIR /app
RUN corepack enable
# 仅拷贝清单做依赖安装(层缓存:源码变了不重装依赖)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY packages/domain/package.json packages/domain/
COPY packages/ai-runtime/package.json packages/ai-runtime/
COPY packages/ai-graphs/package.json packages/ai-graphs/
COPY packages/contracts/package.json packages/contracts/
COPY packages/config/package.json packages/config/
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
RUN pnpm install --frozen-lockfile --prod=false

FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS runtime
ARG VCS_REF=unknown
ARG SOURCE_TREE=unknown
LABEL org.opencontainers.image.revision=$VCS_REF \
      io.meetwise.source-tree=$SOURCE_TREE
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
# 非 root 运行
RUN useradd -m app && chown -R app /app
USER app
EXPOSE 8787
# 默认起 api;worker 用 compose 覆盖 command。**用 serve(@swc-node/register)**——Nest DI 需 emitDecoratorMetadata,tsx 不发元数据。
CMD ["pnpm","-C","apps/api","serve"]
