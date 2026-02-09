import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './serve/files/files.module';
import { WatchModule } from './serve/watch/watch.module';
import { ConfigModule } from './serve/config/config.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const staticPath = join(__dirname, '..', 'public');

@Module({
  imports: [FilesModule, WatchModule, ConfigModule, ServeStaticModule.forRoot({
    rootPath: staticPath,
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
