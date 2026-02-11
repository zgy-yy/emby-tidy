import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { logger } from '@/logger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  /**
   * 重启服务：先返回 200，再退出进程，由 Docker/进程管理器拉起重启
   */
  @Post('restart')
  restart() {
    return this.appService.restart();
  }
}
