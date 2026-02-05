import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, createMiddleware, ToolMessage } from "langchain";
import { scanDirectory, renameFile, moveFile, deleteFile, createDirectory, renameDirectory, deleteDirectory } from "./tools.js";
import { logger } from "./logger.js";
import chokidar from 'chokidar';
// 加载 .env 文件
dotenv.config();

// 初始化 logger
logger.info('Emby 文件整理工具启动');
logger.debug(`环境变量配置: LOG_LEVEL=${process.env.LOG_LEVEL || 'INFO'}, LOG_TO_FILE=${process.env.LOG_TO_FILE || 'false'}, LOG_CONSOLE=${process.env.LOG_CONSOLE || 'true'}`);
const folder = process.env.FOLDER
if (!folder) {
    logger.error('FOLDER 未设置');
    process.exit(1);
}
const watcher = chokidar.watch(folder, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: true, // 忽略初始扫描
    depth: undefined, // 递归监控所有子目录
});

const model = new ChatOpenAI({
    modelName: "deepseek-chat",
    configuration: {
        baseURL: process.env.MODEL_BASE_URL || 'https://api.deepseek.com',
        apiKey: process.env.API_KEY || 'sk-b7bdbcdd18884392934a40caf1abcee6',
    },
});

const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
        try {
            logger.debug(`调用工具: ${request.toolCall.name}`);
            return await handler(request);
        } catch (error) {
            logger.error(`工具调用失败: ${request.toolCall.name}`, error);
            return new ToolMessage({
                content: `Tool error: Please check your input and try again. (${error})`,
                tool_call_id: request.toolCall.id!,
            });
        }
    },
});


const agent: any = createAgent({
    model,
    tools: [scanDirectory, renameFile, deleteFile, moveFile, createDirectory, renameDirectory, deleteDirectory],
});

// 执行整理任务
async function execute(filePath: string) {
    watcher.off("add", handleAddFile);
    logger.info('准备执行整理任务');
    try {
        logger.info('开始执行整理任务');
        const result = await agent.invoke({
            middleware: [handleToolErrors],
            systemPrompt: `你是一个专业的文件整理专家，请扫描 ${folder} 下的内容,并整理成Emby标准格式,如果已有Emby标准格式,则不需要整理`,
            messages: [{ role: "user", content: `请扫描 ${filePath} 的内容，并将其整理成Emby标准格式，如果是目录直接整理目录，如果是文件直接整理文件并为其创建目录` }]
        }, {
            limit: 500,
        });
        logger.info('整理任务执行完成');
        const lastMessage = result.messages[result.messages.length - 1];
        if (lastMessage && 'content' in lastMessage) {
            logger.info(lastMessage.content);
        } else {
            logger.warn('Agent 响应无内容');
            logger.info('完整结果:', result);
        }
    } catch (error) {
        logger.error('执行失败:', error);
    } finally {
        logger.info('重新监听文件添加事件');
        watcher.on("add", handleAddFile);
    }
}


function handleAddFile(filePath: string) {
    logger.info(`watcher 检测到新文件: ${filePath}`);
    execute(filePath);
}

// 监听文件添加事件
watcher.on("add", handleAddFile);

// 监听文件变化事件
watcher.on("change", (filePath) => {
    logger.info(`watcher 检测到文件已修改: ${filePath}`);
});

// 监听目录添加事件
watcher.on("addDir", (dirPath) => {
    logger.info(`watcher 检测到新目录: ${dirPath}`);
});

// 监听错误
watcher.on("error", (error) => {
    logger.error(`watcher 监控错误: ${error.message}`);
});

// 监听就绪
watcher.on("ready", () => {
    logger.info(`watcher 目录监控已启动，正在监控: ${folder}`);
    logger.info('watcher 程序将持续运行，等待文件变化...');
});

// 处理程序退出
process.on('SIGINT', () => {
    logger.info('收到退出信号，正在关闭监控器...');
    watcher.close().then(() => {
        logger.info('监控器已关闭');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    logger.info('收到终止信号，正在关闭监控器...');
    watcher.close().then(() => {
        logger.info('监控器已关闭');
        process.exit(0);
    });
});

// 保持程序运行
logger.info('程序已启动，等待文件变化...');