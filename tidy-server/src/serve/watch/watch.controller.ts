import { Body, Controller, Get, Post } from '@nestjs/common';
import { WatchService } from './watch.service';
import { WatchDirectoryDto, UnwatchDirectoryDto } from './dto/watch.dto';

@Controller('watch')
export class WatchController {
    constructor(private readonly watchService: WatchService) { }

    @Post('dir')
    watchDirectory(@Body() body: WatchDirectoryDto) {
        return this.watchService.watchDirectory(body.directory);
    }

    @Get('all')
    getWatchDirectories() {
        return this.watchService.catWatchDirectories();
    }

    @Post('unwatch')
    unwatchDirectory(@Body() body: UnwatchDirectoryDto) {
        return this.watchService.unwatchDirectory(body.directory);
    }
}
