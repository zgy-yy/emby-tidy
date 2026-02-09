import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from './config.service';
import { SetConfigDto } from './dto/config.dto';

@Controller('config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) {}

    @Get('find')
    getConfig() {
        return this.configService.getConfig();
    }

    @Post('set')
    setConfig(@Body() body: SetConfigDto) {
        return this.configService.setConfig(body.config);
    }
}
