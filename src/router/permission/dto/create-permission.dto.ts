import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @IsNotEmpty({
    message: '权限代码不能为空',
  })
  @ApiProperty()
  code: string;

  opUser?: string;

  desc?: string;
}
