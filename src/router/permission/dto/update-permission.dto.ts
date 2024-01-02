import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @IsNotEmpty({
    message: '权限id不能为空',
  })
  @ApiProperty()
  id: number;
}
