import { Controller, Get, Query } from '@nestjs/common';
import { PhoneService } from './phone.service';

@Controller('phone')
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}
  @Get('/sendCode')
  async getPhoneToken(@Query('tel') tel: string) {
    return await this.phoneService.sendCode(tel);
  }
}
