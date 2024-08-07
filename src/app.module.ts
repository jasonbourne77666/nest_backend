import * as path from 'path';
import { Module, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

// modules
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './router/user/user.module';
import { RoleModule } from './router/role/role.module';
import { PermissionModule } from './router/permission/permission.module';
import { RedisModule } from './router/redis/redis.module';
import { EmailModule } from './router/email/email.module';
import { ArticleModule } from './router/article/article.module';
import { TaskModule } from './task/task.module';
import { EventsModule } from './router/events/events.module';
import { UploadModule } from './router/upload/upload.module';
import { PhoneModule } from './router/phone/phone.module';

// entities
import { User } from './router/user/entities/user.entity';
import { Role } from './router/role/entities/role.entity';
import { Permission } from './router/permission/entities/permission.entity';
import { Article } from './router/article/entities/article.entity';

// 守卫
import { LoginGuard } from './common/guards/login.guard';
import { PermissionGuard } from './common/guards/permission.guard';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        console.log(
          'mysql_server_host',
          configService.get('mysql_server_host'),
        );
        return {
          type: 'mysql',
          host: configService.get('mysql_server_host'),
          port: configService.get('mysql_server_port'),
          username: configService.get('mysql_server_username'),
          password: configService.get('mysql_server_password'),
          database: configService.get('mysql_server_database'),
          synchronize: true,
          logging: false,
          entities: [User, Role, Permission, Article],
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: {
            // authPlugin: 'sha256_password',
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn:
              configService.get('jwt_access_token_expires_time') || '30m', // 默认 30 分钟
          },
        };
      },
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(process.cwd(), `.env.${process.env.NODE_ENV}`),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    RedisModule,
    EmailModule,
    ArticleModule,
    TaskModule,
    EventsModule,
    UploadModule,
    PhoneModule,
    RoleModule,
    PermissionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  @Inject(SchedulerRegistry)
  private schedulerRegistry: SchedulerRegistry;

  // 初始化主模块依赖处理后调用一次
  // onModuleInit

  // 组件生命周期-在应用程序完全启动并监听连接后调用一次
  onApplicationBootstrap() {
    // 获取定时任务
    // const crons = this.schedulerRegistry.getCronJobs();
    // 删除
    // crons.forEach((item, key) => {
    //   item.stop();
    //   this.schedulerRegistry.deleteCronJob(key);
    // });
    // 添加
    // const job = new CronJob(`0/5 * * * * *`, () => {
    //   console.log('cron job');
    // });
    // this.schedulerRegistry.addCronJob('job1', job);
    // job.start(); 手动触发
    // --------------------------------------
    // const intervals = this.schedulerRegistry.getIntervals;
    // 删除
    // intervals.forEach(item => {
    //   const interval = this.schedulerRegistry.getInterval(item);
    //   clearInterval(interval);
    //   this.schedulerRegistry.deleteInterval(item);
    // });
    // 添加
    // const interval = setInterval(() => {
    //   console.log('interval job')
    // }, 3000);
    //
    // this.schedulerRegistry.addInterval('job2', interval);
    //  --------------------------------------
    // const timeouts = this.schedulerRegistry.getTimeouts();
    // 删除
    // timeouts.forEach((item) => {
    //   const timeout = this.schedulerRegistry.getTimeout(item);
    //   clearTimeout(timeout);
    //   this.schedulerRegistry.deleteTimeout(item);
    // });
    // 添加
    // const timeout = setTimeout(() => {
    //   console.log('timeout job');
    // }, 5000);
    // this.schedulerRegistry.addTimeout('job3', timeout);
  }

  // 连接关闭处理时调用(app.close())
  // OnApplicationShutdown
}
