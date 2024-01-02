import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../entities/permission.entity';

export class FindPermissionListVo {
  @ApiProperty({
    type: [Permission],
  })
  list: Permission[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  pageNo: number;

  @ApiProperty()
  pageSize: number;
}
