import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

const logger = new Logger('GraphQL');

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    logger.log(
      `${context.getArgByIndex(3).path.typename} ${
        context.getArgByIndex(3).path.key
      } > ${JSON.stringify(context.getArgByIndex(1))}`,
    );

    return next.handle();
  }
}
