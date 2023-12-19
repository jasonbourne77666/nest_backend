import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PhoneService } from './phone.service';

@Resolver('Phone')
export class PhoneResolver {
  constructor(private readonly phoneService: PhoneService) {}

  @Mutation(() => String, { description: '发送短信验证码' })
  async sendPhoneCode(@Args('tel') tel: string): Promise<string> {
    return await this.phoneService.sendCode(tel);
  }
}
