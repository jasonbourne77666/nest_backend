import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FormatResponseInterceptor } from './format-response.interceptor';
import { InvokeRecordInterceptor } from './invoke-record.interceptor';
import { CustomExceptionFilter } from './custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.setGlobalPrefix('/api');

  // 启用跨域支持
  app.enableCors();

  // 参数校验
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        if (errors.length && errors[0]) {
          const { property = '', constraints = {} } = errors[0] || {};
          const msg = Object.values(constraints)?.[0];
          // 参数检验的问题 抛出到全局filter中处理
          throw new HttpException(`${property} ${msg}`, HttpStatus.BAD_REQUEST);
        }
      },
    }),
  );
  // 拦截数据返回
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  // 日志
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  // 全局统一错误返回格式
  app.useGlobalFilters(new CustomExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('会议室预订系统')
    .setDescription('api 接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description: '基于 jwt 的认证',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  const configService = app.get(ConfigService);

  await app.listen(configService.get('nest_server_port'));
}

bootstrap();
