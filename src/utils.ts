import * as crypto from 'crypto';
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
