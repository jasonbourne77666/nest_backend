import { Resolver, Query } from '@nestjs/graphql';
import { OssService } from './oss.service';
import { OssType } from './dto/oss.type';

@Resolver('Oss')
export class OssResolver {
  constructor(private readonly ossService: OssService) {}

  @Query(() => OssType, { description: '获取oss上传token' })
  async getOssToken(): Promise<OssType> {
    return await this.ossService.getOssToken();
  }
}
