import { IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindArticleDto {
  @IsOptional()
  @ApiProperty()
  title?: string;

  @IsNotEmpty({
    message: '页码不能为空',
  })
  @ApiProperty()
  pageNo?: number;

  @IsOptional()
  @ApiProperty()
  pageSize?: number;
}
