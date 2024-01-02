import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/role.entity';

export class FindRoleListVo {
  @ApiProperty({
    type: [Role],
  })
  list: Role[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  pageNo: number;

  @ApiProperty()
  pageSize: number;
}
