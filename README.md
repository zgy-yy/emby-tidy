# Emby 文件整理工具

使用 TypeScript 和 LangChain 实现的智能 Emby 媒体文件整理工具。可以自动识别电影和剧集文件，并整理到 Emby 标准格式。

## 功能特性

- 🔍 自动扫描目录中的媒体文件
- 🤖 使用 AI 智能分析文件信息（标题、年份、季数、集数等）
- 📁 自动整理到 Emby 标准格式
  - 电影：`Movies/{电影名} ({年份})/{电影名} ({年份}).{扩展名}`
  - 剧集：`TV Shows/{剧集名}/Season {季数}/{剧集名} - S{季数}E{集数} - {集名}.{扩展名}`
- 🧪 支持模拟运行（dry-run）模式
- ⚙️ 支持命令行和交互式使用

## 安装依赖

```bash
npm install
```

## 配置

创建 `.env` 文件（可选，如果使用环境变量）：

```env
# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 日志配置（可选）
LOG_LEVEL=INFO          # DEBUG, INFO, WARN, ERROR
LOG_TO_FILE=false       # 是否写入日志文件
LOG_DIR=./logs          # 日志文件目录
LOG_CONSOLE=true        # 是否输出到控制台
```

## 使用方法

### 1. 扫描目录

扫描指定目录中的所有媒体文件：

```bash
npm run dev scan /path/to/media/directory
```

### 2. 分析文件

分析单个文件的信息：

```bash
npm run dev analyze "/path/to/movie (2023).mp4"
```

### 3. 整理文件

将文件整理到 Emby 格式：

```bash
# 实际整理
npm run dev organize "/path/to/movie.mp4" /path/to/library

# 模拟运行（不实际移动文件）
npm run dev organize "/path/to/movie.mp4" /path/to/library --dry-run
```

### 4. 交互式使用

直接与 AI Agent 对话：

```bash
npm run dev "请扫描 /path/to/media 目录并整理所有文件到 /path/to/library"
```

### 5. 查看帮助

```bash
npm run dev help
```

## 支持的文件格式

- 视频格式：`.mp4`, `.mkv`, `.avi`, `.mov`, `.wmv`, `.flv`, `.webm`, `.m4v`

## 文件名识别规则

### 电影格式
- `电影名 (年份).扩展名`
- `电影名.年份.扩展名`

### 剧集格式
- `剧集名 - S01E01 - 集名.扩展名`
- `剧集名.S01E01.集名.扩展名`
- `剧集名 S01E01.扩展名`

## 注意事项

⚠️ **重要提示**：

1. **备份数据**：在首次使用前，请确保已备份所有媒体文件
2. **测试运行**：建议先使用 `--dry-run` 选项查看整理方案
3. **权限检查**：确保程序有读写媒体文件目录的权限

## 测试

```bash
# 运行测试（监听模式）
npm test

# 运行测试（单次）
npm run test:run

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 开发

```bash
# 开发模式运行
npm run dev

# 编译 TypeScript
npm run build

# 监听模式编译
npm run watch

# 运行编译后的代码
npm start
```
