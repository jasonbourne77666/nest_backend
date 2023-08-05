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
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';
import { EmailService } from '../email/email.service';
import { User } from './entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { md5 } from '../utils';

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

  @Post('register')
  async register(@Body(ValidationPipe) user: RegisterUserDto) {
    console.log('req', user);
    const captcha = await this.redisService.get(`captcha_${user.email}`);

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
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      // this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    if (!address) {
      throw new HttpException('请输入邮箱', HttpStatus.BAD_REQUEST);
    }

    const code = Math.random().toString().slice(2, 8);

    // 有效期 5 mins
    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`,
    });
    return '发送成功';
  }
}
