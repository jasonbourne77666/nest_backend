import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { UserController } from './user.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, // 在当前作用域中注册的存储库，就可以使用 @InjectRepository() 装饰器将 UsersRepository 注入 UsersService：
      Role,
      Permission,
    ]),
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
