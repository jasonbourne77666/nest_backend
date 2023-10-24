import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Get,
  Res,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import * as sharp from 'sharp';

import {
  FilesInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor({ dest: 'uploads' }))
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    const res: Array<Record<string, any>> = [];
    console.log(files);
    if (files.length) {
      files.forEach((item) => {
        res.push({
          name: item.originalname,
          path: item.path,
          mimetype: item.mimetype,
        });
      });
    }
    return res;
  }

  @Get('compression')
  async compression(
    @Query('path') filePath: string,
    @Query('color', ParseIntPipe) color: number,
    @Query('level', ParseIntPipe) level: number,
    @Res() res: Response,
  ) {
    if (!existsSync(filePath)) {
      throw new BadRequestException('文件不存在');
    }
    const data = await sharp(filePath, {
      animated: true,
      limitInputPixels: false,
      level,
    })
      .gif({
        colours: color,
      })
      .toBuffer();
    res.set('Content-Disposition', `attachment; filename="filename.jpg"`);

    res.send(data);
  }
}
