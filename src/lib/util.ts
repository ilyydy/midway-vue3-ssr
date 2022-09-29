import { Framework } from '@midwayjs/koa';
import os from 'os';
import { getCurrentApplicationContext } from '@midwayjs/core';

import { RESPONSE_CODE, CODE_MESSAGES } from '../constant/code';
import {
  CONTENT_TYPE,
  CONTENT_DISPOSITION,
  CONTENT_TYPE_MAP,
} from '../share/constant';

import type { Context } from '@midwayjs/koa';

export function jsonStringifyReplacerFactory(maxLen: number) {
  return function jsonStringifyReplacer(k: any, v: any) {
    if (typeof v === 'string' && v.length > maxLen) {
      return `${v.slice(0, 10)}; length: ${v.length}`;
    }

    return v;
  };
}

export const jsonStringifyReplacer = jsonStringifyReplacerFactory(1000);

export function jsonStringify(o: any, replacer = jsonStringifyReplacer) {
  return replacer ? JSON.stringify(o, replacer) : JSON.stringify(o);
}

// 获取IP地址
export function getIPAddress() {
  // k8s IP地址，内网地址查询环境变量$POD_IP
  const POD_IP = process.env.POD_IP;
  if (POD_IP) {
    return POD_IP;
  }

  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
}

export function getPort() {
  const framework = getCurrentApplicationContext().get(Framework);
  const port = framework.getPort();
  return port;
}

export function successResp({
  code = RESPONSE_CODE.SUCCESS as number,
  data = {} as any,
  msg = '',
}) {
  return {
    code,
    data,
    msg: msg || CODE_MESSAGES[code as 0],
  };
}

export function failResp({
  code = RESPONSE_CODE.FAIL as number,
  data = {} as any,
  msg = '',
}) {
  return {
    code,
    data,
    msg: msg || CODE_MESSAGES[code as 500],
  };
}

export function setDownloadHeader(ctx: Context, fileName: string) {
  ctx.set(CONTENT_TYPE, CONTENT_TYPE_MAP.stream);
  setAttachmentContentDisposition(ctx, fileName);
}

export function setAttachmentContentDisposition(
  ctx: Context,
  fileName: string
) {
  ctx.set(
    CONTENT_DISPOSITION,
    `attachment; filename="${encodeURIComponent(
      fileName
    )}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
  );
}

export function isTxtContentType(contentType: string) {
  return (
    contentType.includes(CONTENT_TYPE_MAP.json) ||
    contentType.includes(CONTENT_TYPE_MAP.text)
  );
}

export function isDev(env: string) {
  return env === 'dev' || env === 'local';
}
