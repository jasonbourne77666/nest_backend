/**
 * 拦截器
 * 统一修改响应格式： {code、message、data}
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
// import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        return {
          code: 200, // response.statusCode
          message: 'success',
          data,
        };
      }),
    );
  }
}
