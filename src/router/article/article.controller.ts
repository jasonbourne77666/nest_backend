import {
  Controller,
  Get,
  Param,
  Req,
  Query,
  Post,
  Delete,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
// import { RequireLogin } from '../custom.decorator';
import { FindArticleDto } from './dto/find-article.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post('/create')
  async create(@Body() query: CreateArticleDto) {
    return await this.articleService.create(query);
  }

  @Get('/list')
  async findBlogs(@Query() query: FindArticleDto) {
    return await this.articleService.findBlogList(query);
  }

  @Post('/update')
  async update(@Body() updateArticleDto: UpdateArticleDto) {
    try {
      await this.articleService.update(updateArticleDto);
      return '更新成功';
    } catch (error) {
      return '更新失败';
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }

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
