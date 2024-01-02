import { IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindRoleDto {
  @IsOptional()
  @ApiProperty()
  name?: string;

  @IsOptional()
  @ApiProperty()
  status?: number;

  @IsNotEmpty({
    message: '页码不能为空',
  })
  @ApiProperty()
  pageNo: number;

  @IsOptional()
  @ApiProperty()
  pageSize?: number;
}
