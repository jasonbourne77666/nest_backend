import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Get,
  Res,
  Req,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as sharp from 'sharp';
import * as path from 'path';
import formidable from 'formidable';
import * as concat from 'concat-files';

import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { UploadService } from './upload.service';
import { listDir, isExist, folderIsExit, copyFile } from '../../utils';

const uploadDir = 'uploads';

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

  // 压缩
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

  // 大文件
  @Get('/check/file')
  async checkFile(
    @Query('fileName') fileName: string,
    @Query('fileMd5Value') fileMd5Value: string,
  ) {
    const res = await this.getChunkList(
      path.join(uploadDir, fileName),
      path.join(uploadDir, fileMd5Value),
    );

    return res;
  }

  // 获取文件Chunk列表
  async getChunkList(filePath: string, folderPath: string) {
    const isFileExit = await isExist(filePath);
    let result = {};
    // 如果文件已在存在, 不用再继续上传, 真接秒传
    if (isFileExit) {
      result = {
        stat: 1,
        file: {
          isExist: true,
          name: filePath,
        },
        desc: 'file is exist',
      };
    } else {
      const isFolderExist = await isExist(folderPath);
      // 如果文件夹(md5值后的文件)存在, 就获取已经上传的块
      let fileList: any[] = [];
      if (isFolderExist) {
        fileList = await listDir(folderPath);
      }
      result = {
        stat: 1,
        chunkList: fileList,
        desc: 'folder list',
      };
    }
    return result;
  }

  @Post('/fileSlice')
  async fileSliceUpload(@Req() req: Request, @Res() res: Response) {
    const form = formidable({
      uploadDir: 'uploads/tmp',
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      }
      const index = fields.index;
      const fileMd5Value = fields.fileMd5Value[0];
      const folder = path.resolve(__dirname, '../../../uploads', fileMd5Value);
      // 使用Md5查看文件是否存在
      const isExistFolder = await folderIsExit(folder);
      if (isExistFolder) {
        const destFile = path.resolve(folder, fields.index[0]);
        copyFile(files.data[0].filepath, destFile).then(
          (successLog) => {
            res.send({
              stat: 1,
              desc: index,
              msg: '上传成功',
            });
          },
          (errorLog) => {
            res.send({
              stat: 0,
              desc: 'Error',
              msg: errorLog,
            });
          },
        );
      }
    });
  }

  // 合并文件
  async mergeFiles(srcDir, targetDir, newFileName) {
    const fileArr = await listDir(srcDir);
    fileArr.sort((x, y) => {
      return x - y;
    });
    // 把文件名加上文件夹的前缀
    for (let i = 0; i < fileArr.length; i++) {
      fileArr[i] = srcDir + '/' + fileArr[i];
    }
    concat(fileArr, path.join(targetDir, newFileName), (err) => {
      if (err) {
        return false;
      }
      return true;
    });
  }

  @Get('/merge')
  mergeBigFile(@Query('md5') md5: string, @Query('fileName') fileName: string) {
    const res = this.mergeFiles(path.join(uploadDir, md5), uploadDir, fileName);
    return {
      stat: res ? 1 : 0,
    };
  }
}
