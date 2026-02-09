# Tidy Web - 文件管理前端应用

基于 Vue 3 + TypeScript 的文件管理前端应用，用于管理媒体文件并调用 tidy-server 的 API 进行文件整理。

## 功能特性

- 📁 **文件扫描**：扫描指定目录，展示文件树结构
- 🗂️ **文件整理**：使用 AI 自动整理文件到 Emby 标准格式
- 📊 **实时日志**：流式接收整理过程，实时显示整理日志
- 🌳 **文件树展示**：可视化展示目录结构

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vue Router
- Axios
- Pinia

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（Vite 默认端口）。

### 构建生产版本

```bash
npm run build
```

## API 配置

应用通过 Vite 代理连接到 tidy-server：

- 开发环境：`/api` 请求会被代理到 `http://127.0.0.1:3000`
- 确保 tidy-server 在 3000 端口运行

## 使用说明

1. **扫描目录**：
   - 在输入框中输入要扫描的目录路径
   - 点击"扫描目录"按钮
   - 左侧会显示文件树结构

2. **整理文件**：
   - 确保已输入目录路径
   - 点击"整理文件"按钮
   - 右侧日志区域会实时显示整理过程
   - 整理完成后会自动重新扫描目录

## API 接口

### 文件操作

- `GET /api/file/scan?directory={path}&recursive={true|false}` - 扫描目录
- `DELETE /api/file?path={path}` - 删除文件
- `POST /api/file/move` - 移动文件
- `POST /api/file/rename` - 重命名文件
- `POST /api/file/tidy` - 整理文件（流式返回）

### 目录监听

- `POST /api/watch/dir` - 监听目录
- `GET /api/watch/all` - 获取所有监听的目录
- `POST /api/watch/unwatch` - 取消监听目录

## 项目结构

```
src/
├── api/           # API 服务
│   ├── files.ts   # 文件操作 API
│   └── watch.ts   # 目录监听 API
├── components/    # 组件
│   └── FileTreeNode.vue  # 文件树节点组件
├── views/         # 页面
│   └── FileManager.vue    # 文件管理主页面
├── router/        # 路由配置
├── net/           # 网络请求封装
└── App.vue        # 根组件
```
