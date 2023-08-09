import { ApiProperty } from '@nestjs/swagger';

export class UserDetailVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  headPic: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isFrozen: number;

  @ApiProperty()
  createTime: Date;

  @ApiProperty({ example: ['管理员'] })
  roles: string[];

  @ApiProperty({ example: 'query_aaa' })
  permissions: string[];
}
