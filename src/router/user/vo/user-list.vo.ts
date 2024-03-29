import { ApiProperty } from '@nestjs/swagger';

class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isFrozen: string;

  @ApiProperty()
  headPic: string;

  @ApiProperty()
  createTime: Date;

  @ApiProperty()
  updateTime: Date;
}

export class UserListVo {
  @ApiProperty({
    type: [User],
  })
  list: User[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  pageNo: number;

  @ApiProperty()
  pageSize: number;
}
