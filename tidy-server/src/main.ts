import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from '@/logger';
import config from '@/config';
import { ValidationPipe } from '@nestjs/common';
logger.info('config', config);
logger.info('Starting Tidy Server');

let production = false;
if (process.env.NODE_ENV === 'production') {
  production = true;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (production) {
    app.setGlobalPrefix('api');
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动删除不在 DTO 中的属性
      forbidNonWhitelisted: true, // 如果请求包含未定义的属性，抛出错误
      transform: true, // 自动转换类型
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
