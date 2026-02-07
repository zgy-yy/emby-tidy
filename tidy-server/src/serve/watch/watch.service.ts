import { aiExecutor } from '@/tidy';
import { Injectable } from '@nestjs/common';
import chokidar, { FSWatcher } from 'chokidar';
import { logger } from '@/logger';

@Injectable()
export class WatchService {
    constructor() { }
    private watchers: Map<string, FSWatcher> = new Map();


    watchDirectory(directory: string) {
        if (this.watchers.has(directory)) {
            return {
                success: true,
                message: 'directory is already being watched',
            }
        }
        const options = {
            ignored: /(^|[\/\\])\../, // 忽略 . 开头的文件
            persistent: true,
            ignoreInitial: true,
            usePolling: true,
            interval: 500,
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100,
            },
        }
        const watcher = chokidar.watch(directory, options);
        this.watchers.set(directory, watcher);
        logger.info(`开始监听目录: ${directory}`);
        watcher.on('add', async (path: string) => {
            logger.info(`暂停监听目录: ${directory},准备整理文件: ${path}`);
            await watcher.unwatch(directory);
            await this.executeWatch(path);
            await watcher.add(directory);
            logger.info(`恢复监听目录: ${directory}`);
        });
        return {
            success: true,
            message: '监听目录成功',
            directory: directory,
        }
    }

    unwatchDirectory(directory: string) {
        const watcher = this.watchers.get(directory);
        if (watcher) {
            watcher.unwatch(directory);
            watcher.close();
            this.watchers.delete(directory);
        }
    }
    catWatchDirectories() {
        return Array.from(this.watchers.keys());
    }

    async executeWatch(path: string) {
        logger.info(`执行整理任务,路径: ${path}`);
        const result = await aiExecutor(`整理 ${path} 下的所有媒体文件`);
        logger.info(`整理任务完成,路径: ${path}`);
        return result;
    }
}
