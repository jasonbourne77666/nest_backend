import { Module } from '@nestjs/common';
import { OssService } from './oss.service';
import { OssController } from './oss.controller';

@Module({
  controllers: [OssController],
  providers: [OssController, OssService],
})
export class OssModule {}
