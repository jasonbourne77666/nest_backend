import { Injectable } from '@nestjs/common';
import { ossConfig as config } from '@/config/config';
import * as OSS from 'ali-oss';
import * as dayjs from 'dayjs';
// import { Buffer } from 'buffer';

import { OssType } from './dto/oss.type';

@Injectable()
export class OssService {
  async getOssToken(): Promise<OssType> {
    const client = new OSS(config);

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const policy = {
      expiration: date.toISOString(), // 请求有效期
      conditions: [
        ['content-length-range', 0, 1048576000], // 设置上传文件的大小限制
        // { bucket: client.options.bucket } // 限制可上传的bucket
      ],
    };

    //签名
    const formData = await client.calculatePostSignature(policy);
    //bucket域名
    const host = `http://${config.bucket}.${
      (await client.getBucketLocation()).location
    }.aliyuncs.com`.toString();

    //回调
    // const callback = {
    //   callbackUrl: config.callbackUrl,
    //   callbackBody:
    //     'filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}',
    //   callbackBodyType: 'application/x-www-form-urlencoded',
    // };

    //返回参数
    const params = {
      expire: dayjs().add(1, 'days').unix().toString(),
      policy: formData.policy,
      signature: formData.Signature,
      accessId: formData.OSSAccessKeyId,
      host,
      // callback: Buffer.from(JSON.stringify(callback)).toString('base64'),
      dir: config.dir,
    };

    return params;
  }
}
