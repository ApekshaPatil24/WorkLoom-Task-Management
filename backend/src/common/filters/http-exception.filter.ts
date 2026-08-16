// backend/src/common/filters/http-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface MongoDuplicateKeyError {
  code: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      // Covers class-validator failures (400), NotFoundException (404),
      // anything a service/controller throws deliberately later.
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string | string[]) ?? exception.message;
        error = (resObj.error as string) ?? error;
      }
    } else if (this.isMongoDuplicateKeyError(exception)) {
      // e.g. two users in the same workspace with the same email —
      // triggers the unique+sparse index from Phase 3.
      statusCode = HttpStatus.CONFLICT;
      message = 'A record with this value already exists';
      error = 'Conflict';
    } else if (exception instanceof Error) {
      // Truly unexpected — log full detail server-side, never leak
      // stack traces or raw driver errors to the client.
      this.logger.error(exception.message, exception.stack);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private isMongoDuplicateKeyError(
    exception: unknown,
  ): exception is MongoDuplicateKeyError {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code?: number }).code === 11000
    );
  }
}