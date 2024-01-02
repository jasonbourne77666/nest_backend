import { IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindPermissionDto {
  @IsOptional()
  @ApiProperty()
  code?: string;

  @IsOptional()
  @ApiProperty()
  desc?: number;

  @IsNotEmpty({
    message: '页码不能为空',
  })
  @ApiProperty()
  pageNo: number;

  @IsOptional()
  @ApiProperty()
  pageSize?: number;
}
