import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticleService } from 'src/router/article/article.service';

@Injectable()
export class TaskService {
  @Inject(ArticleService)
  private articleService: ArticleService;

  // 执行时间，每日凌晨4点
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleCron() {
    await this.articleService.flushRedisToDB();
  }
}
