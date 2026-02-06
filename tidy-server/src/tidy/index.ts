import { createAgent, createMiddleware, ToolMessage } from "langchain";
import config from '@/config';
import { ChatOpenAI } from "@langchain/openai";
import { scanDirectory, createDirectory, deleteDirectory, renameDirectory, moveFile, renameFile, deleteFile } from "./tools";
import { logger } from '@/logger';
import { Readable } from 'stream';


const model = new ChatOpenAI({
    modelName: config.ai.model,
    configuration: {
        baseURL: config.ai.baseUrl,
        apiKey: config.ai.apiKey,
    },
    apiKey: config.ai.apiKey,
});

const handleToolErrors = createMiddleware({
    name: "HandleToolErrors", wrapToolCall: async (request, handler) => {
        try {
            logger.debug(`调用工具: ${request.toolCall.name}`);
            return await handler(request);
        } catch (error) {
            logger.error(`工具调用失败: ${request.toolCall.name}`, error)
            return new ToolMessage({
                content: `Tool error: Please check your input and try again. (${error})`,
                tool_call_id: request.toolCall.id!,
            });
        }
    },
});

const systemPrompt = `
你是一个媒体整理助手，你的任务是根据用户的需求整理媒体文件。

工作流程：
1. 首先使用 scan_directory 扫描目录，了解当前文件结构
2. 根据扫描结果，判断哪些文件需要整理
3. 按照 Emby 标准格式整理文件：
   - 电影格式：Movies/电影名 (年份)/电影名 (年份).扩展名
   - 电视剧格式：TV Shows/剧集名/Season XX/剧集名 - SXXEXX - 集名.扩展名
4. 删除非媒体文件（文档、压缩包等）
5. 任务完成后，直接结束，不要再调用任何工具

重要提示：
- 如果文件已经符合 Emby 格式，不需要整理
- 扫描完成后，根据结果决定下一步操作
- 不要重复扫描同一个目录
- 整理完成后立即结束任务
`;
const agent = createAgent({
    model: model,
    middleware: [handleToolErrors],
    systemPrompt: systemPrompt,
    tools: [scanDirectory, createDirectory, deleteDirectory, renameDirectory, moveFile, renameFile, deleteFile],
});


export async function aiExecutor(messages: string) {
    console.log('messages', messages);
    try {
        const recursionLimit = config.ai.recursionLimit ?? 1000;
        
        logger.debug(`使用递归限制: ${recursionLimit}`);
        
        // 获取原始流
        const originalStream = await agent.stream({
            messages: [{ role: "user", content: messages }],
        }, {
            recursionLimit: recursionLimit,
        });

        // 创建对象模式的流，可以推送对象
        const newStream = new Readable({
            objectMode: true,
            read() {
                // Readable 流的 read 方法由异步迭代器驱动
            }
        });
        
        // 异步处理原始流，记录日志并转发到新流
        (async () => {
            try {
                for await (const chunk of originalStream) {
                    // 记录日志
                    logger.info('Agent 流数据块:', JSON.stringify(chunk, null, 2));
                    // 将数据推送到新流（对象模式可以推送对象）
                    newStream.push(chunk);
                }
                // 流结束
                newStream.push(null);
                logger.info('Agent 执行完成');
            } catch (error: any) {
                logger.error('处理流时出错:', error);
                newStream.destroy(error);
            }
        })();
        
        return newStream;
    } catch (error: any) {
        logger.error('Agent 执行失败:', error);
        if (error.name === 'GraphRecursionError' || error.message?.includes('Recursion limit')) {
            logger.error('达到递归限制，可能是任务过于复杂或 agent 陷入循环');
            logger.error(`当前递归限制: ${config.ai.recursionLimit ?? 1000}`);
            throw new Error('任务执行超过最大递归次数，请简化任务或检查文件结构');
        }
        throw error;
    }
}