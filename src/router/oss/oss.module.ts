import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OssService } from './oss.service';
import { OssResolver } from './oss.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [OssResolver, OssService],
})
export class OssModule {}
