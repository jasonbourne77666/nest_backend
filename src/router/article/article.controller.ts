import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
// import { RequireLogin } from '../custom.decorator';

import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('/detail/:id')
  async findOne(@Param('id') id: string) {
    return await this.articleService.findOne(+id);
  }

  // @RequireLogin()
  @Get('/:id/view')
  async view(@Param('id') id: string, @Req() req: Request) {
    return await this.articleService.view(+id, req?.user?.userId || req.ip);
  }

  @Get('/init-data')
  async initData() {
    await this.articleService.initData();
    return 'done';
  }
}
