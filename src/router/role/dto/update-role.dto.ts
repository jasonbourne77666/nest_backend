import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsNotEmpty({
    message: '角色id不能为空',
  })
  @ApiProperty()
  id: number;
}
