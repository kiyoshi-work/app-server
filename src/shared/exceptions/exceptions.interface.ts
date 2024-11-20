export interface IException {
  message: string;
  code?: number;
  cause?: Error;
  description?: string;
}

export interface IHttpBadRequestExceptionResponse {
  code: number;
  statusCode?: number;
  message: string;
  description: string;
  timestamp: string;
  traceId: string;
}

export interface IHttpInternalServerErrorExceptionResponse {
  code: number;
  statusCode?: number;
  message: string;
  description: string;
  timestamp: string;
  traceId: string;
}

export interface IHttpUnauthorizedExceptionResponse {
  code: number;
  statusCode?: number;
  message: string;
  description: string;
  timestamp: string;
  traceId: string;
}

export interface IHttpForbiddenExceptionResponse {
  code: number;
  statusCode?: number;
  message: string;
  description: string;
  timestamp: string;
  traceId: string;
}
