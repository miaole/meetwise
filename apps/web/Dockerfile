# Next.js web 镜像（standalone 产物,最小运行时）。build 阶段编译,run 阶段只带 standalone。
# 用法: docker build -f apps/web/Dockerfile -t meetwise-web .   (context=仓库根)
FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS build
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY packages/domain/package.json packages/domain/
COPY packages/ai-runtime/package.json packages/ai-runtime/
COPY packages/ai-graphs/package.json packages/ai-graphs/
COPY packages/contracts/package.json packages/contracts/
COPY packages/config/package.json packages/config/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --prod=false
COPY . .
RUN pnpm -C apps/web build

FROM node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS run
ARG VCS_REF=unknown
ARG SOURCE_TREE=unknown
LABEL org.opencontainers.image.revision=$VCS_REF \
      io.meetwise.source-tree=$SOURCE_TREE
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
RUN useradd -m app && chown -R app /app
USER app
EXPOSE 3000
CMD ["node","apps/web/server.js"]
