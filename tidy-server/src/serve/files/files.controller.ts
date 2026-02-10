import { Controller, Get, Post, Delete, Query, Body, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { ScanDirectoryDto, DeleteFileDto, MoveFileDto, RenameFileDto, TidyFileDto } from './dto/files.dto';
import type { Response } from 'express';

@Controller('file')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('scan')
    scan(@Body() body: ScanDirectoryDto) {
        return this.filesService.scanDirectory(body.directory, body.recursive);
    }

    @Delete()
    deleteFile(@Query() query: DeleteFileDto) {
        return this.filesService.deleteFile(query.path);
    }

    @Post('move')
    moveFile(@Body() body: MoveFileDto) {
        return this.filesService.moveFile(body.filePath, body.targetDirectory);
    }

    @Post('rename')
    renameFile(@Body() body: RenameFileDto) {
        return this.filesService.renameFile(body.filePath, body.newName);
    }

    @Post('tidy')
    async tidyFile(@Body() body: TidyFileDto, @Res() res: Response) {
        try {
            const stream = await this.filesService.tidyFile(body.path);

            // 设置响应头为 NDJSON 格式（流式传输）
            res.setHeader('Content-Type', 'application/x-ndjson');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
            
            // 立即发送响应头，确保前端可以开始接收数据
            res.flushHeaders();

            // 流式返回数据（NDJSON 格式：每行一个 JSON）
            for await (const chunk of stream) {
                // chunk 是对象，需要序列化为 JSON 字符串
                const data = JSON.stringify(chunk) + '\n';
                res.write(data);
            }
            // 流结束
            res.end();
        } catch (error: any) {
            // 如果还没有发送响应头，设置错误状态
            if (!res.headersSent) {
                res.status(500).json({
                    error: '流处理失败',
                    message: error?.message || '未知错误'
                });
            } else {
                // 如果已经开始发送数据，发送错误信息后关闭
                res.write(JSON.stringify({
                    error: '流处理失败',
                    message: error?.message || '未知错误'
                }) + '\n');
                res.end();
            }
        }
    }
}
