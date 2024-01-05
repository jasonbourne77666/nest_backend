import { Injectable } from '@nestjs/common';
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';

import { phoneSmsConfig, ossConfig } from '@/config/config';
import { generateCode } from '@/utils';

@Injectable()
export class PhoneService {
  async sendCode(tel: string): Promise<string> {
    const code = generateCode();
    const config = new $OpenApi.Config({
      // 请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID 和 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
      // 工程代码泄露可能会导致 AccessKey 泄露，并威胁账号下所有资源的安全性。以下代码示例使用环境变量获取 AccessKey 的方式进行调用，仅供参考，建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/378664.html
      // 必填，您的 AccessKey ID
      accessKeyId: ossConfig.accessKeyId,
      // 必填，您的 AccessKey Secret
      accessKeySecret: ossConfig.accessKeySecret,
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
    config.endpoint = `dysmsapi.aliyuncs.com`;
    const client = new Dysmsapi20170525(config);

    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      ...phoneSmsConfig,
      phoneNumbers: tel,
      templateParam: `{"code":"${code}"}`,
    });
    const runtime = new $Util.RuntimeOptions({});

    try {
      // 复制代码运行请自行打印 API 的返回值
      await client.sendSmsWithOptions(sendSmsRequest, runtime);
    } catch (error) {
      // 错误 message
      console.log(error.message);
      // 诊断地址
      console.log(error.data['Recommend']);
      Util.assertAsString(error.message);
    }

    return code;
  }
}
