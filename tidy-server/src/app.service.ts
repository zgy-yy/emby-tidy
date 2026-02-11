import { Injectable } from '@nestjs/common';
import { logger } from './logger/logger';

@Injectable()
export class AppService {
  restart() {
    setTimeout(() => {
      logger.info('Restart requested, exiting process');
      process.exit(0);
    }, 500);
    return { success: true, message: 'Restarting...' };
  }
}
