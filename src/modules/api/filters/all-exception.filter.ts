import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
// import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { IntegrationError } from './integration-error';

// https://github.com/marciopd/nestjs-exceptions
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private static extractIntegrationErrorDetails(error: any): string {
    if (!(error instanceof IntegrationError)) {
      return undefined;
    }

    if (!error.causeError) {
      return undefined;
    }

    if (error.causeError instanceof String) {
      return error.causeError as string;
    }

    if (!error.causeError.message && !error.causeError.response) {
      return undefined;
    }

    const integrationErrorDetails = {
      message: error.causeError.message,
      details: error.causeError.response && error.causeError.response.data,
    };
    return JSON.stringify({ causeError: integrationErrorDetails });
  }

  // private logger: JsonLogger = LoggerFactory.createLogger(
  //   AllExceptionsFilter.name,
  // );
  private readonly logger = new Logger(AllExceptionsFilter.name);

  public constructor(
    private readonly sendClientInternalServerErrorCause: boolean = false,
    private readonly logAllErrors: boolean = false,
    private readonly logErrorsWithStatusCode: number[] = [],
  ) {}

  public catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const responseStatus = exception.status
      ? exception.status
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const messageObject = this.getBackwardsCompatibleMessageObject(
      exception,
      responseStatus,
    );
    const errorObject = {
      traceId: request.id,
      route: request.url,
      timestamp: new Date().toISOString(),
      ...messageObject,
      integrationErrorDetails:
        responseStatus === HttpStatus.INTERNAL_SERVER_ERROR
          ? AllExceptionsFilter.extractIntegrationErrorDetails(exception)
          : undefined,
      stack: exception.stack && JSON.stringify(exception.stack, ['stack'], 4),
    };
    if (
      this.logAllErrors ||
      this.logErrorsWithStatusCode.indexOf(responseStatus) !== -1
    ) {
      this.logger.warn(errorObject);
    }
    if (!this.sendClientInternalServerErrorCause) {
      delete errorObject.stack;
      delete errorObject.integrationErrorDetails;
    }
    response.status(responseStatus).json(errorObject);
  }

  private getBackwardsCompatibleMessageObject(
    exception: any,
    responseStatus: number,
  ): any {
    const errorResponse = exception.response;
    if (errorResponse && errorResponse.error) {
      return {
        error: errorResponse.error,
        message: errorResponse.message,
        statusCode: responseStatus,
      };
    }
    return { message: exception.message, statusCode: responseStatus };
  }
}
