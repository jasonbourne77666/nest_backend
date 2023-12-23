import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import {
  LoginUserDto,
  UpdateUserPasswordDto,
  UpdateUserDto,
  EmailLoginUserDto,
} from './dto';
import { LoginUserVo, UserListVo } from './vo';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RedisService } from '../redis/redis.service';

import { md5 } from '../../utils';

@Injectable()
export class UserService {
  private logger = new Logger();

  @Inject(RedisService)
  private redisService: RedisService;

  // 注入 User 实体，
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  // 注入 Role 实体，
  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  // 注入 Permission 实体，
  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        // isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('用户名或者密码错误', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();

    vo.userInfo = this.getLoginVo(user);

    return vo;
  }

  async register(user: User) {
    return await this.userRepository.save(user);
  }

  async emailLogin(loginUserDto: EmailLoginUserDto) {
    const captcha = await this.redisService.get(
      `login_user_captcha_${loginUserDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (loginUserDto.code !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();

    vo.userInfo = this.getLoginVo(user);

    return vo;
  }

  // 登录返回数据
  getLoginVo = (user: User) => {
    return {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  };

  async findUserById(userId: number, isAdmin?: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        // isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
      headPic: user.headPic,
      isFrozen: user.isFrozen,
      email: user.email,
      nickName: user.nickName,
      phoneNumber: user.phoneNumber,
      createTime: user.createTime,
    };
  }

  // 修改密码
  async updatePassword(userId: number, passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    foundUser.password = md5(passwordDto.password);

    try {
      await this.userRepository.save(foundUser);
      return '密码修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      throw new HttpException('密码修改失败', HttpStatus.BAD_REQUEST);
    }
  }

  // 修改个人信息
  async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUserDto.email}`,
    );
    console.log('captcha', captcha);
    console.log('updateUserDto.captcha', updateUserDto.captcha);
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (updateUserDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    if (updateUserDto.username) {
      foundUser.username = updateUserDto.username;
    }

    if (updateUserDto.nickName) {
      foundUser.nickName = updateUserDto.nickName;
    }

    if (updateUserDto.headPic) {
      foundUser.headPic = updateUserDto.headPic;
    }

    if (updateUserDto.phoneNumber) {
      foundUser.phoneNumber = updateUserDto.phoneNumber;
    }

    if (updateUserDto.email) {
      foundUser.email = updateUserDto.email;
    }

    try {
      await this.userRepository.save(foundUser);
      return '用户信息修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      throw new HttpException('修改失败', HttpStatus.BAD_REQUEST);
    }
  }

  // 冻结
  async freezeUserById(id: number) {
    const user = await this.userRepository.findOneBy({
      id,
    });
    if (user.isFrozen === '1') {
      user.isFrozen = '0';
    } else {
      user.isFrozen = '1';
    }

    await this.userRepository.save(user);
  }

  // 删除
  async deleteUserById(id: number) {
    return await this.userRepository.delete({ id });
  }

  async findUsers(
    username: string,
    nickName: string,
    email: string,
    pageNo: number,
    pageSize: number,
    isFrozen: string,
    startTime: string,
    endTime: string,
  ) {
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (username) {
      condition.username = Like(`%${username}%`);
    }
    if (nickName) {
      condition.nickName = Like(`%${nickName}%`);
    }
    if (email) {
      condition.email = Like(`%${email}%`);
    }
    if (isFrozen) {
      condition.isFrozen = isFrozen;
    }
    if (startTime) {
      condition.createTime = Between(startTime, endTime);
    }

    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'phoneNumber',
        'isFrozen',
        'headPic',
        'createTime',
        'updateTime',
      ],
      skip: skipCount,
      take: pageSize,
      where: condition,
      relations: ['roles', 'roles.permissions'],
    });

    const vo = new UserListVo();

    vo.list = users;
    vo.totalCount = totalCount;
    vo.pageNo = pageNo;
    vo.pageSize = pageSize;
    return vo;
  }

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }
}
