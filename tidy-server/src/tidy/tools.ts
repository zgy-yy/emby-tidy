// @ts-nocheck - 禁用此文件的类型检查，避免 LangChain 类型实例化过深的问题
import { tool } from "langchain";
import * as z from "zod";
import utils from './utils';
import { logger } from '@/logger';
/**
 * 扫描目录中的媒体文件
 */
export const scanDirectory: any = tool(
    (input: { directory: string; recursive?: boolean }) => {
        logger.info(`扫描目录: ${input.directory}, 递归: ${input.recursive ?? false}`);
        const result = utils.screenFolder(input.directory, input.recursive ?? false);
        // 计算文件总数
        function countFiles(tree: any): number {
            if (tree.type === 'file') {
                return 1;
            }
            let count = 0;
            if (tree.children) {
                for (const child of tree.children) {
                    count += countFiles(child);
                }
            }
            return count;
        }
        const fileCount = result.fileTree ? countFiles(result.fileTree) : 0;
        logger.info(`扫描完成，找到 ${fileCount} 个文件`);
        return JSON.stringify({ ...result, count: fileCount }, null, 2);
    },
    {
        name: "scan_directory",
        description: "扫描指定目录中的所有文件（包括文件和子目录）。返回完整的文件树结构。注意：每个目录只扫描一次，扫描完成后根据结果决定下一步操作，不要重复扫描。",
        schema: z.object({
            directory: z.string().describe("要扫描的目录路径（可以是相对路径或绝对路径）"),
            recursive: z.boolean().optional().describe("是否递归扫描子目录，默认为 false（不递归）"),
        }),
    }
);

export const renameFile: any = tool(
    (input: { file: string; newName: string }) => {
        logger.info(`重命名文件: ${input.file} -> ${input.newName}`);
        utils.renameFile(input.file, input.newName);
        logger.info(`文件重命名成功: ${input.file} -> ${input.newName}`);
        return JSON.stringify({ success: true, message: `文件 ${input.file} 重命名成功为 ${input.newName}` }, null, 2);
    },
    {
        name: "rename_file",
        description: "重命名指定文件。这是一个一次性操作，重命名完成后任务就结束了，不需要再次调用。",
        schema: z.object({
            file: z.string().describe("要重命名的文件路径（可以是相对路径或绝对路径）"),
            newName: z.string().describe("新的文件名"),
        }),
    }
);

export const moveFile: any = tool(
    (input: { file: string; targetDirectory: string }) => {
        logger.info(`移动文件: ${input.file} -> ${input.targetDirectory}`);
        utils.moveFile(input.file, input.targetDirectory);
        logger.info(`文件移动成功: ${input.file} -> ${input.targetDirectory}`);
        return JSON.stringify({ success: true, message: `文件 ${input.file} 移动成功到 ${input.targetDirectory}` }, null, 2);
    },
    {
        name: "move_file",
        description: "移动指定文件到指定目录。这是一个一次性操作，移动完成后任务就结束了，不需要再次调用。",
        schema: z.object({
            file: z.string().describe("要移动的文件路径（可以是相对路径或绝对路径）"),
            targetDirectory: z.string().describe("目标目录路径（可以是相对路径或绝对路径）"),
        }),
    }
);
export const deleteFile: any = tool(
    (input: { file: string }) => {
        logger.warn(`删除文件: ${input.file}`);
        utils.deleteFile(input.file);
        logger.info(`文件删除成功: ${input.file}`);
        return JSON.stringify({ success: true, message: `文件 ${input.file} 删除成功` }, null, 2);
    },
    {
        name: "delete_file",
        description: "删除指定文件。这是一个一次性操作，删除完成后任务就结束了，不需要再次调用。",
        schema: z.object({
            file: z.string().describe("要删除的文件路径（可以是相对路径或绝对路径）"),
        }),
    }
);
export const createDirectory: any = tool(
    (input: { directory: string }) => {
        logger.info(`创建目录: ${input.directory}`);
        utils.createDirectory(input.directory);
        logger.info(`目录创建成功: ${input.directory}`);
        return JSON.stringify({ success: true, message: `目录 ${input.directory} 创建成功` }, null, 2);
    },
    {
        name: "create_directory",
        description: "创建指定目录。这是一个一次性操作，创建完成后任务就结束了，不需要再次调用。",
        schema: z.object({
            directory: z.string().describe("要创建的目录路径（可以是相对路径或绝对路径）"),
        }),
    }
);
export const deleteDirectory: any = tool(
    (input: { directory: string }) => {
        logger.warn(`删除目录: ${input.directory}`);
        utils.deleteDirectory(input.directory);
        logger.info(`目录删除成功: ${input.directory}`);
        return JSON.stringify({ success: true, message: `目录 ${input.directory} 删除成功` }, null, 2);
    },
    {
        name: "delete_directory",
        description: "删除指定目录。这是一个一次性操作，删除完成后任务就结束了，不需要再次调用。",
        schema: z.object({
            directory: z.string().describe("要删除的目录路径（可以是相对路径或绝对路径）"),
        }),
    }
);
export const renameDirectory: any = tool(
    (input: { directory: string; newName: string }) => {
        logger.info(`重命名目录: ${input.directory} -> ${input.newName}`);
        utils.renameDirectory(input.directory, input.newName);
        logger.info(`目录重命名成功: ${input.directory} -> ${input.newName}`);
        return JSON.stringify({ success: true, message: `目录 ${input.directory} 重命名成功为 ${input.newName}` }, null, 2);
    },
    {
        name: "rename_directory",
        description: "重命名指定目录。这是一个一次性操作，重命名完成后任务就结束了，不需要再次调用。",
        schema: z.object({
            directory: z.string().describe("要重命名的目录路径（可以是相对路径或绝对路径）"),
            newName: z.string().describe("新的目录名"),
        }), 
    }
);