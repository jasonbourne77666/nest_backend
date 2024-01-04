import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateRoleDto {
  @IsNotEmpty({
    message: '角色名不能为空',
  })
  @ApiProperty()
  name: string;

  desc?: string;

  opUser?: string;

  permissionIds: number[];
}
