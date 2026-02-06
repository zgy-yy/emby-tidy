import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './serve/files/files.module';
import { WatchModule } from './serve/watch/watch.module';

@Module({
  imports: [FilesModule, WatchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
