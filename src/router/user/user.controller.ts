import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UnauthorizedException,
  DefaultValuePipe,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Request } from 'express';
import {
  RegisterUserDto,
  LoginUserDto,
  UpdateUserPasswordDto,
  UpdateUserDto,
  EmailLoginUserDto,
} from './dto';
import { LoginUserVo, UserDetailVo, RefreshTokenVo, UserListVo } from './vo';
import { UserService } from './user.service';
import { EmailService } from '../email/email.service';
import { User } from './entities/user.entity';
import { RedisService } from '../redis/redis.service';
import {
  RequireLogin,
  UserInfo,
} from '../../common/decorator/custom.decorator';
import { md5, generateParseIntPipe } from '../../utils';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  // 注入 User 实体，
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  // 组装登录信息
  loginVo(loginUser: LoginUserVo) {
    loginUser.accessToken = this.jwtService.sign(
      {
        userId: loginUser.userInfo.id,
        username: loginUser.userInfo.username,
        roles: loginUser.userInfo.roles,
        permissions: loginUser.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    loginUser.refreshToken = this.jwtService.sign(
      {
        userId: loginUser.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return loginUser;
  }

  /**
   * login
   * @param loginUser
   * @returns
   */
  @Post('login')
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo,
  })
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser);
    const res = this.loginVo(vo);
    return res;
  }

  /**
   * login-email
   * @param loginUser
   * @returns
   */
  @Post('email-login')
  @ApiBody({
    type: EmailLoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo,
  })
  async emailLogin(@Body() loginUser: EmailLoginUserDto) {
    const vo = await this.userService.emailLogin(loginUser);
    const res = this.loginVo(vo);
    return res;
  }

  // login-email-captcha
  /**
   *
   * @param email
   * @returns
   */
  @Get('email-login-captcha')
  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  async loginCaptcha(@Query('email') email: string) {
    if (!email) {
      throw new HttpException('请输入邮箱', HttpStatus.BAD_REQUEST);
    }
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`login_user_captcha_${email}`, code, 10 * 60);
    console.log(code);
    await this.emailService.sendMail({
      to: email,
      subject: '登录验证码',
      html: `<p>你的验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  /**
   * outLogin
   * @param req
   * @returns
   */
  @Post('outLogin')
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: String,
  })
  @RequireLogin()
  async outLogin(@Req() req: Request) {
    req.user = null;
    return '退出登录成功';
  }

  /**
   * refresh
   * @param refreshToken
   * @returns
   */
  @Get('refresh')
  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxxxxxxyyyyyyyyzzzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );

      const vo = new RefreshTokenVo();

      vo.access_token = access_token;
      vo.refresh_token = refresh_token;

      return vo;
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  /**
   * register
   * @param user
   * @returns
   */
  @Post('register')
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  async register(@Body(ValidationPipe) user: RegisterUserDto) {
    const captcha = await this.redisService.get(
      `captcha_regiter_${user.email}`,
    );
    console.log(`captcha_regiter_${user.email}`, captcha);
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userService.register(newUser);
      return '注册成功';
    } catch (e) {
      // this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  // 注册邮箱验证码
  /**
   * register-captcha
   * @param email
   * @returns
   */
  @Get('register-captcha')
  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  async captcha(@Query('email') email: string) {
    if (!email) {
      throw new HttpException('请输入邮箱', HttpStatus.BAD_REQUEST);
    }

    const code = Math.random().toString().slice(2, 8);

    // 有效期 5 mins
    await this.redisService.set(`captcha_regiter_${email}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: email,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  // userInfo
  /**
   * info
   * @param userId
   * @returns
   */
  @Get('info')
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: UserDetailVo,
  })
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserById(userId);

    const vo = new UserDetailVo();
    // 过滤返回的数据
    vo.id = user.id;
    vo.email = user.email;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.nickName = user.nickName;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;
    vo.roles = user.roles;
    vo.permissions = user.permissions;
    return vo;
  }

  // 修改个人信息
  /**
   * update
   * @param userId
   * @param updateUserDto
   * @returns
   */
  @Post(['update'])
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: String,
  })
  @RequireLogin()
  async update(
    @Body('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('update/captcha')
  async updateCaptcha(@Query('email') email: string) {
    if (!email) {
      throw new HttpException('请输入邮箱', HttpStatus.BAD_REQUEST);
    }

    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`update_user_captcha_${email}`, code, 10 * 60);
    console.log('get-code', code);
    await this.emailService.sendMail({
      to: email,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  // 修改密码
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserPasswordDto,
  })
  @ApiResponse({
    type: String,
    description: '验证码已失效/不正确',
  })
  @Post(['update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdateUserPasswordDto,
  ) {
    return await this.userService.updatePassword(userId, passwordDto);
  }

  // 修改密码-发送验证码
  @ApiBearerAuth()
  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @RequireLogin()
  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    if (!address) {
      throw new HttpException('请输入邮箱', HttpStatus.BAD_REQUEST);
    }
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      10 * 60,
    );

    await this.emailService.sendMail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  // 冻结用户
  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: 'success',
  })
  @RequireLogin()
  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId);
    return 'success';
  }

  // 删除用户
  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: 'success',
  })
  @RequireLogin()
  @Get('delete')
  async deleteUser(@Query('id') userId: number) {
    await this.userService.deleteUserById(userId);
    return '删除成功';
  }

  // 用户列表
  /**
   * list
   * @returns
   */
  @Get('list')
  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: Number,
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: Number,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: Number,
  })
  @ApiResponse({
    type: UserListVo,
    description: '用户列表',
  })
  @RequireLogin()
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
    @Query('isFrozen') isFrozen: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return await this.userService.findUsers(
      username,
      nickName,
      email,
      pageNo,
      pageSize,
      isFrozen,
      startTime,
      endTime,
    );
  }

  // 初始化数据
  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'done';
  }
}
