import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ParseIntPipe, BadRequestException } from '@nestjs/common';

export function md5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

export function generateParseIntPipe(name) {
  return new ParseIntPipe({
    exceptionFactory() {
      throw new BadRequestException(name + ' 应该传数字');
    },
  });
}

/**
 * 解析url参数
 * @param {Object} url
 * @param {Object} queryName
 */
export function getParams(url: string, queryName: string): string | null {
  const query = decodeURI(url.split('?')[1]);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] === queryName) {
      return pair[1];
    }
  }
  return null;
}

/**
 * DB data
 * @author suke
 * @param {Object} userId
 * @param {Object} roomId
 * @param {Object} nickname
 * @param {Object} pub
 */
export function getUserDetailByUid(
  userId: string,
  roomId: string,
  nickname: string,
  pub: string,
): string {
  const res = JSON.stringify({
    userId: userId,
    roomId: roomId,
    nickname: nickname,
    pub: pub,
  });
  return res;
}

// 列出文件夹下所有文件
export function listDir(path: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      // 把mac系统下的临时文件去掉
      if (data && data.length > 0 && data[0] === '.DS_Store') {
        data.splice(0, 1);
      }
      resolve(data);
    });
  });
}

// 文件或文件夹是否存在
export function isExist(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      // 文件不存在
      if (err && err.code === 'ENOENT') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// 文件夹是否存在, 不存在则创建文件夹
export function folderIsExit(folder) {
  return new Promise(async (resolve, reject) => {
    fs.ensureDirSync(path.join(folder));
    resolve(true);
  });
}

// 把文件从一个目录拷贝到别一个目录
export function copyFile(src: fs.PathLike, dest: fs.PathLike) {
  return new Promise((resolve, reject) => {
    fs.rename(src, dest, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve('copy file:' + dest + ' success!');
      }
    });
  });
}
