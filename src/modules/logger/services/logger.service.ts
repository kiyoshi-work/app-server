import { Injectable, Scope } from '@nestjs/common';
import { convertDateToUnixTimestamp } from '../utils/time';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context: string;

  public setContext(context: string) {
    this.context = context;
  }
  private customMessage(
    message: string | object,
    level: string,
    data?: object,
    context?: string,
  ) {
    const serviceName = 'app_notification_server';
    const now = convertDateToUnixTimestamp();

    let trace;

    if (typeof message == 'object') {
      if ((message as any)?.stack) {
        trace = (message as any)?.stack;
        message = message.toString();
      } else {
        message = JSON.stringify(message);
      }
    }

    return JSON.stringify({
      serviceName,
      message,
      timestamp: now,
      level,
      ...data,
      context: context,
      trace,
    });
  }

  error(message: string | object, data?: object, context?: string): void {
    // TO DO
    const mess = this.customMessage(
      message,
      'ERROR',
      data,
      context || this.context,
    );
    console.error(mess);
  }

  warn(message: string | object, data?: object, context?: string): void {
    // TO DO
    const mess = this.customMessage(
      message,
      'WARN',
      data,
      context || this.context,
    );
    console.warn(mess);
  }

  log(message: string | object, data?: object, context?: string): void {
    // TO DO
    const mess = this.customMessage(
      message,
      'INFO',
      data,
      context || this.context,
    );
    console.log(mess);
  }

  debug(message: string | object, data?: object, context?: string): void {
    // TO DO
    const mess = this.customMessage(
      message,
      'DEBUG',
      data,
      context || this.context,
    );
    console.debug(mess);
  }

  verbose(message: string | object, data?: object, context?: string): void {
    // TO DO
    const mess = this.customMessage(
      message,
      'VERBOSE',
      data,
      context || this.context,
    );
    console.debug(mess);
  }
}
