import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@/logger';

export type FileTree = {
    name: string; // 文件名
    path: string;
    type: 'file' | 'directory';
    children: FileTree[];
}

function screenFolder(directory: string, recursive: boolean = false) {
    logger.info(`开始扫描目录: ${directory}, 递归: ${recursive}`);
    if (!fs.existsSync(directory)) {
        logger.error(`目录不存在: ${directory}`);
        throw new Error(`Directory ${directory} does not exist`);
    }
    if (!fs.statSync(directory).isDirectory()) {
        logger.error(`路径不是目录: ${directory}`);
        throw new Error(`${directory} is not a directory`);
    }

    const resolvedDir = path.resolve(directory);

    function scan(currentPath: string): FileTree {
        if (!fs.existsSync(currentPath)) {
            throw new Error(`Path ${currentPath} does not exist`);
        }
        const name = path.basename(currentPath);
        const stat = fs.statSync(currentPath);
        if (stat.isDirectory()) {
            const children: FileTree[] = [];
            const items = fs.readdirSync(currentPath);
            for (const item of items) {
                const filePath = path.join(currentPath, item);
                if (recursive) {
                    children.push(scan(filePath));
                } else {
                    const stat = fs.statSync(filePath);
                    if (stat.isFile()) {
                        children.push({
                            name: item,
                            path: filePath,
                            type: 'file',
                            children: [],
                        });
                    } else if (stat.isDirectory()) {
                        children.push({
                            name: item,
                            path: filePath,
                            type: 'directory',
                            children: [],
                        });
                    }
                }
            }
            return {
                name: name,
                path: currentPath,
                type: 'directory',
                children: children,
            };
        }
        logger.info(`扫描文件完成: ${currentPath}`);
        return {
            name: name,
            path: currentPath,
            type: 'file',
            children: [],
        };
    }

    const fileTree: FileTree = scan(resolvedDir);
    return {
        success: true,
        fileTree: fileTree,
        directory: resolvedDir,
        message: `成功扫描目录,扫描任务已完成。`
    };
}


function moveFile(file: string, targetDirectory: string) {
    if (!fs.existsSync(file)) {
        throw new Error(`File ${file} does not exist`);
    }
    if (!fs.statSync(file).isFile()) {
        throw new Error(`${file} is not a file`);
    }
    fs.renameSync(file, path.join(targetDirectory, path.basename(file)));
    return {
        success: true,
        message: `文件 ${file} 移动成功到 ${targetDirectory}`,
    };
}

function renameFile(file: string, newName: string) {
    if (!fs.existsSync(file)) {
        throw new Error(`File ${file} does not exist`);
    }
    if (!fs.statSync(file).isFile()) {
        throw new Error(`${file} is not a file`);
    }
    fs.renameSync(file, path.join(path.dirname(file), newName));
    return {
        success: true,
        message: `文件 ${file} 重命名成功为 ${newName}`,
    };
}

function deleteFile(file: string) {
    if (!fs.existsSync(file)) {
        throw new Error(`File ${file} does not exist`);
    }
    if (!fs.statSync(file).isFile()) {
        throw new Error(`${file} is not a file`);
    }
    fs.unlinkSync(file);
    return {
        success: true,
        message: `文件 ${file} 删除成功`,
    };
}

function createDirectory(directory: string) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    return {
        success: true,
        message: `目录 ${directory} 创建成功`,
    };
}

function deleteDirectory(directory: string) {
    if (!fs.existsSync(directory)) {
        throw new Error(`Directory ${directory} does not exist`);
    }
    if (!fs.statSync(directory).isDirectory()) {
        throw new Error(`${directory} is not a directory`);
    }
    // 使用 fs.rmSync 替代已弃用的 fs.rmdirSync
    fs.rmSync(directory, { recursive: true, force: true });
    return {
        success: true,
        message: `目录 ${directory} 删除成功`,
    };
}

function renameDirectory(directory: string, newName: string) {
    logger.debug(`重命名目录: ${directory} -> ${newName}`);
    if (!fs.existsSync(directory)) {
        logger.error(`目录不存在: ${directory}`);
        throw new Error(`Directory ${directory} does not exist`);
    }
    if (!fs.statSync(directory).isDirectory()) {
        logger.error(`路径不是目录: ${directory}`);
        throw new Error(`${directory} is not a directory`);
    }

    fs.renameSync(directory, path.join(path.dirname(directory), newName));
    return {
        success: true,
        message: `目录 ${directory} 重命名成功为 ${newName}`,
    };
}

export default {
    screenFolder,
    moveFile,
    renameFile,
    deleteFile,
    createDirectory,
    deleteDirectory,
    renameDirectory,
};