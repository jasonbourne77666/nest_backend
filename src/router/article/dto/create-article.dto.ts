import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @IsNotEmpty({ context: { code: 10001, message: '标题不能为空' } })
  @ApiProperty()
  title: string;

  @IsOptional()
  @ApiProperty()
  content: string;

  @IsOptional()
  @ApiProperty()
  markdownContent: string;

  @IsNotEmpty({ context: { code: 10001, message: '内容不能为空' } })
  @ApiProperty()
  isMarkdow: number;
}
