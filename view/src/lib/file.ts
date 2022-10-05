import { CONTENT_DISPOSITION } from '@share/constant';

import type { AxiosResponseHeaders } from 'axios';

/**
 * @description 下载blob格式数据
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const linkElem = document.createElement('a');
  const url = window.URL.createObjectURL(blob);
  linkElem.href = url;
  // 设置文件名
  linkElem.download = fileName;
  linkElem.click();
  // 释放资源
  window.URL.revokeObjectURL(url);
};

export const getFileNameFromContentDisposition = (
  headers: AxiosResponseHeaders
) => {
  const contentDisposition = headers[CONTENT_DISPOSITION];
  if (!contentDisposition) return null;

  const filenameRegex = /filename\*?=([^']*'')?([^;]*)/;
  const matches = filenameRegex.exec(contentDisposition);
  if (matches && matches.length > 0) {
    return decodeURIComponent(matches[2].replace(/['"]/g, ''));
  }

  return null;
};
