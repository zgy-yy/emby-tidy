# Docker 部署指南

## 项目结构

```
.
├── tidy-server/          # 后端服务
├── tidy-web/            # 前端应用
├── Dockerfile          # Docker 构建文件
├── docker-compose.yml  # Docker Compose 配置
├── config/             # 配置目录（映射到容器）
├── media/              # 媒体目录（映射到容器）
└── README.Docker.md    # 本文档
```

## 快速开始

### 1. 构建和启动

```bash
# 使用 docker-compose 构建并启动
docker-compose up -d --build
```

### 2. 访问应用

- 前端界面: http://localhost:3000
- API 接口: http://localhost:3000/api

### 3. 停止服务

```bash
docker-compose down
```

## 目录映射

Docker Compose 会将以下目录映射到容器：

- `./config` → `/app/config` - 配置文件目录
- `./config/logs` → `/app/logs` - 日志文件目录
- `./media` → `/app/media` - 媒体文件目录（默认扫描路径）

## 配置文件

配置文件位于 `./config/config.json`，首次启动时会自动创建默认配置：

```json
{
  "log": {
    "level": "INFO",
    "toFile": true,
    "logDir": "/app/logs"
  },
  "ai": {
    "model": "deepseek-chat",
    "baseUrl": "https://api.deepseek.com",
    "apiKey": "your-api-key",
    "recursionLimit": 1000
  },
  "folders": [
    {
      "path": "/app/media"
    }
  ]
}
```

## 环境变量

可以通过环境变量配置：

- `NODE_ENV`: 运行环境（默认: production）

## 日志

日志文件保存在 `./config/logs/` 目录下，可以通过以下命令查看：

```bash
# 查看实时日志
docker-compose logs -f

# 查看应用日志文件
tail -f config/logs/*.log
```

## 开发模式

如果需要本地开发，可以分别启动前后端：

### 后端开发
```bash
cd tidy-server
npm install
npm run start:dev
```

### 前端开发
```bash
cd tidy-web
npm install
npm run dev
```

## 故障排查

### 1. 端口被占用
如果 3000 端口被占用，可以修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "3001:3000"  # 将宿主机端口改为 3001
```

### 2. 权限问题
确保 `config` 和 `media` 目录有正确的读写权限：
```bash
chmod -R 755 config media
```

### 3. 查看容器日志
```bash
docker-compose logs emby-tidy
```

### 4. 进入容器调试
```bash
docker-compose exec emby-tidy sh
```

## 更新应用

```bash
# 停止当前容器
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

## 清理

```bash
# 停止并删除容器
docker-compose down

# 删除镜像（可选）
docker rmi emby-tidy_emby-tidy
```
