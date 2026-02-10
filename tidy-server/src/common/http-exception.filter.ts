import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { ExceptionResponseDto } from './exception-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, body } = this.normalize(exception);

    this.logger.warn(
      `[${request.method}] ${request.url} ${statusCode} - ${body.message}`,
    );
    if (statusCode >= 500 && exception instanceof Error) {
      this.logger.error(exception.stack);
    }

    response.status(statusCode).json(body);
  }

  private normalize(exception: unknown): {
    statusCode: number;
    body: ExceptionResponseDto;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const error =
        typeof res === 'object' && res !== null && 'error' in (res as object)
          ? String((res as { error?: string }).error)
          : exception.name;
      const message = this.getHttpExceptionMessage(exception);
      return {
        statusCode: status,
        body: {
          success: false,
          statusCode: status,
          error,
          message,
        },
      };
    }

    const message =
      exception instanceof Error ? exception.message : '服务器内部错误';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message,
      },
    };
  }

  private getHttpExceptionMessage(exception: HttpException): string {
    const res = exception.getResponse();
    if (typeof res === 'string') return res;
    if (typeof res === 'object' && res !== null && 'message' in (res as object)) {
      const msg = (res as { message?: string | string[] }).message;
      return Array.isArray(msg) ? msg.join('; ') : String(msg);
    }
    return exception.message;
  }
}
