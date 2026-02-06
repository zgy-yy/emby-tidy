import { Controller, Get, Post, Delete, Query, Body, Res, Header } from '@nestjs/common';
import { FilesService } from './files.service';
import { ScanDirectoryDto, DeleteFileDto, MoveFileDto, RenameFileDto, TidyFileDto } from './dto/files.dto';
import type { Response } from 'express';

@Controller('file')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Get('scan')
    scan(@Query() query: ScanDirectoryDto) {
        return this.filesService.scanDirectory(query.directory);
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
        // 使用 @Res() 时，必须手动控制响应，不能返回任何值
        try {
            const stream = await this.filesService.tidyFile(body.path);
            
            // 设置响应头
            res.setHeader('Content-Type', 'application/x-ndjson'); // NDJSON 格式
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            // 流式返回数据
            for await (const chunk of stream) {
                // 将每个 chunk 转换为 JSON 字符串并发送（NDJSON 格式：每行一个 JSON）
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
                // 如果已经开始发送数据，只能关闭连接
                res.end();
            }
        }
    }
}
