# 多阶段构建 Dockerfile

# 阶段1: 构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/tidy-web

# 配置 npm 使用淘宝镜像源（加快下载速度）
# 清除可能存在的旧配置
RUN npm config delete registry || true
RUN npm config set registry https://registry.npmmirror.com/
RUN npm config get registry

# 复制前端依赖文件（只复制 package.json，不使用 package-lock.json）
COPY tidy-web/package.json ./

# 安装前端依赖（不使用 package-lock.json）
RUN npm install

# 复制前端源代码
COPY tidy-web/ .

# 构建前端
RUN npm run build

# 阶段2: 构建后端
FROM node:20-alpine AS backend-builder

WORKDIR /app/tidy-server

# 配置 npm 使用淘宝镜像源（加快下载速度）
# 清除可能存在的旧配置
RUN npm config delete registry || true
RUN npm config set registry https://registry.npmmirror.com/
RUN npm config get registry

# 复制后端依赖文件（只复制 package.json，不使用 package-lock.json）
COPY tidy-server/package.json ./

# 安装后端依赖（不使用 package-lock.json）
RUN npm install --prefer-offline --no-audit
    

# 复制后端源代码
COPY tidy-server/ .

# 构建后端
RUN npm run build

# 阶段3: 运行阶段
FROM node:20-alpine

WORKDIR /app

# 复制 package.json 用于参考（不使用 package-lock.json）
WORKDIR /app/tidy-server
COPY tidy-server/package.json ./

# 从构建阶段复制 node_modules（包含所有依赖）
# 然后清理 devDependencies 以减小镜像大小
COPY --from=backend-builder /app/tidy-server/node_modules ./node_modules
RUN npm prune --production

# 复制构建后的后端代码
COPY --from=backend-builder /app/tidy-server/dist ./dist

# 复制 tsconfig.json 用于 tsconfig-paths 路径解析
COPY --from=backend-builder /app/tidy-server/tsconfig.json ./tsconfig.json

# 复制构建后的前端静态文件到 public 目录
WORKDIR /app/tidy-server
RUN mkdir -p public
COPY --from=frontend-builder /app/tidy-web/dist ./public

# 创建必要的目录
RUN mkdir -p /app/config /app/logs /app/media

# 暴露端口
EXPOSE 3000

# 设置工作目录
WORKDIR /app/tidy-server

# 启动应用（使用 tsconfig-paths 解析路径别名）
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
