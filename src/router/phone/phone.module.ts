import { Module } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { PhoneController } from './phone.controller';

@Module({
  controllers: [PhoneController],
  providers: [PhoneController, PhoneService],
  exports: [PhoneService],
})
export class PhoneModule {}
