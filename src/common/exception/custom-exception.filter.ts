import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

// 在 appmodule中注册全局模块，可导入service
// {
//   provide: APP_FILTER,
//   useClass: HelloFilter
// }

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  // @Inject(AppService)
  // private service: AppService;

  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    console.log('exception', exception);
    response
      .json({
        code: exception.getStatus(),
        message: exception.message || 'fail',
        data: null,
      })
      .end();
  }
}
