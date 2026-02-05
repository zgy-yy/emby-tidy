# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 设置 npm 镜像源（使用国内镜像加速）
RUN npm config set registry https://registry.npmmirror.com || \
    npm config set registry https://registry.npmjs.org

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies），增加超时时间和重试
RUN npm ci --maxsockets 1 --fetch-retries 5 --fetch-retry-mintimeout 20000 --fetch-retry-maxtimeout 120000 || \
    npm install --maxsockets 1 --fetch-retries 5 --fetch-retry-mintimeout 20000 --fetch-retry-maxtimeout 120000

# 复制 TypeScript 配置和源代码
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

# 构建 TypeScript 代码
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 设置 npm 镜像源和超时配置
RUN npm config set registry https://registry.npmmirror.com || \
    npm config set registry https://registry.npmjs.org && \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖，使用更宽松的配置
RUN npm ci --only=production --prefer-offline --no-audit && \
    npm cache clean --force || \
    npm install --only=production --prefer-offline --no-audit && \
    npm cache clean --force

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 创建日志目录和媒体目录
RUN mkdir -p /app/logs /app/media

# 设置环境变量
ENV NODE_ENV=production
ENV LOG_DIR=/app/logs
ENV FOLDER=/app/media

# 暴露端口（如果需要）
# EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
