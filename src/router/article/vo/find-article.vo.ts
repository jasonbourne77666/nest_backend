import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../entities/article.entity';

export class FindArticleListVo {
  @ApiProperty({
    type: [Article],
  })
  list: Article[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  pageNo: number;

  @ApiProperty()
  pageSize: number;
}
