import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindArticleDto } from './dto/find-article.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindArticleListVo } from './vo/find-article.vo';
import { Article } from './entities/article.entity';
import { RedisService } from '../redis/redis.service';
import { Repository, Like } from 'typeorm';
@Injectable()
export class ArticleService {
  // 注入 Article 实体，
  @InjectRepository(Article)
  private readonly articleRepository: Repository<Article>;

  @Inject(RedisService)
  private redisService: RedisService;

  async create(createArticleDto: CreateArticleDto) {
    return await this.articleRepository.save(createArticleDto);
  }

  async findBlogList(condition: FindArticleDto) {
    const { title, pageNo = 1, pageSize = 20 } = condition;
    const newCondition: Record<string, any> = {};
    if (title) {
      newCondition.title = Like(`%${title}%`);
    }

    const [articles, totalCount] = await this.articleRepository.findAndCount({
      select: [
        'id',
        'title',
        'viewCount',
        'likeCount',
        'collectCount',
        'createTime',
        'updateTime',
      ],
      where: newCondition,
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
    });
    const vo = new FindArticleListVo();
    vo.list = articles;
    vo.totalCount = totalCount;
    vo.pageNo = pageNo;
    vo.pageSize = pageSize;

    return vo;
  }

  async findOne(id: number) {
    return await this.articleRepository.findOneBy({
      id,
    });
  }

  async update(updateArticleDto: UpdateArticleDto) {
    return await this.articleRepository.update(
      { id: updateArticleDto.id },
      updateArticleDto,
    );
  }

  async remove(id: number) {
    return await this.articleRepository.delete({ id });
  }

  async flushRedisToDB() {
    const keys = await this.redisService.keys(`article_*`);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      const res = await this.redisService.hashGet(key);

      const [, id] = key.split('_');

      await this.articleRepository.update(
        {
          id: +id,
        },
        {
          viewCount: +res.viewCount,
        },
      );
    }
  }

  async view(id: number, userId: string | number) {
    const res = await this.redisService.hashGet(`article_${id}`);

    if (res.viewCount === undefined) {
      const article = await this.findOne(id);

      article.viewCount++;

      await this.articleRepository.update(
        { id },
        {
          viewCount: article.viewCount,
        },
      );

      await this.redisService.hashSet(`article_${id}`, {
        viewCount: article.viewCount,
        likeCount: article.likeCount,
        collectCount: article.collectCount,
      });

      // 设置标识，用于判断是否同一个用户
      await this.redisService.set(`user_${userId}_article_${id}`, 1, 60);

      return article.viewCount;
    } else {
      // 判断是否 同一个用户 同一篇文章， 都相同不增加访问量
      const flag = await this.redisService.get(`user_${userId}_article_${id}`);
      if (flag) {
        return res.viewCount;
      }

      await this.redisService.hashSet(`article_${id}`, {
        ...res,
        viewCount: +res.viewCount + 1,
      });

      // 设置标识，用于判断是否同一个用户
      await this.redisService.set(`user_${userId}_article_${id}`, 1, 60);

      return +res.viewCount + 1;
    }
  }

  async initData() {
    await this.articleRepository.save({
      title: '基于 Axios 封装一个完美的双 token 无感刷新',
      content: `用户登录之后，会返回一个用户的标识，之后带上这个标识请求别的接口，就能识别出该用户。

      标识登录状态的方案有两种： session 和 jwt。
      `,
    });

    await this.articleRepository.save({
      title: 'Three.js 手写跳一跳小游戏',
      content: `前几年，跳一跳小游戏火过一段时间。

      玩家从一个方块跳到下一个方块，如果没跳过去就算失败，跳过去了就会再出现下一个方块。`,
    });
    return 'done';
  }
}
