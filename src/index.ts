import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, createMiddleware, ToolMessage } from "langchain";
import { scanDirectory, renameFile, moveFile, deleteFile, createDirectory, renameDirectory, deleteDirectory } from "./tools";
import { logger } from "./logger";
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
const warcher = chokidar.watch(folder);


const model: any = new ChatOpenAI({
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




async function execute() {
    await warcher.close();
    logger.info('文件监控器关闭');
    try {
        logger.info('开始执行整理任务');
        const result = await agent.invoke({
            messages: [{ role: "user", content: `请扫描 ${folder} 下的内容，并将这个目录整理成Emby标准格式` }],
            middleware: [handleToolErrors],
        }, {
            limit: 500,
        });
        logger.info('整理任务执行完成');
        const lastMessage = result.messages[result.messages.length - 1];
        if (lastMessage && 'content' in lastMessage) {
            console.log(lastMessage.content);
        } else {
            logger.warn('Agent 响应无内容');
            console.log('完整结果:', result);
        }
    } catch (error) {
        logger.error('执行失败:', error);
    } finally {
        warcher.on("add", (path) => {
            logger.info(`文件 ${path} 被添加`);
            logger.info('准备执行整理任务');
            execute();
        });
    }
}

execute();