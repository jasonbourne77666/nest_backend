import { Controller, Get } from '@nestjs/common';
import { OssService } from './oss.service';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Get('/token')
  async getOssToken() {
    return await this.ossService.getOssToken();
  }
}
