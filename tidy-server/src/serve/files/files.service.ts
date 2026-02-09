import { aiExecutor } from '@/tidy';
import utils, { FileTree } from '@/tidy/utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
    constructor() { }

    scanDirectory(directory: string, recursive: boolean = true) {
        return utils.screenFolder(directory, recursive);
    }

    deleteFile(filePath: string) {
        return utils.deleteFile(filePath);
    }

    moveFile(filePath: string, targetDirectory: string) {
        return utils.moveFile(filePath, targetDirectory);
    }

    renameFile(filePath: string, newName: string) {
        return utils.renameFile(filePath, newName);
    }
    async tidyFile(path: string) {
        const stream = aiExecutor(`整理 ${path} 下的所有媒体文件,并返回整理后的文件路径列表`);
        return stream;
    }
}
