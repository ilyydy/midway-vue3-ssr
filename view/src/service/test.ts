import { useGetRequest } from './index';

import { downloadBlob, getFileNameFromContentDisposition } from '@/lib/file';

export function useGetJson() {
  return useGetRequest('/api/json');
}

export async function downloadFile2(type: 'txt' | 'img') {
  const { request, data, headers, error } = useGetRequest<
    Blob | ApiResponseData
  >(`/api/${type}File`, {
    responseType: 'blob',
  });

  await request();
  if (error.value) {
    console.log('downloadFile2 error', error.value);
    return;
  }

  if (!headers.value || !data.value) {
    return;
  }

  const v = data.value;
  if (v instanceof Blob) {
    const fileName = getFileNameFromContentDisposition(headers.value);
    downloadBlob(v, fileName || 'unknownFile');
  } else {
    console.log('downloadFile2 data', v);
  }
}

export async function downloadFile3(type: 'txt' | 'img') {
  const { request, data, headers, error } = useGetRequest<
    ArrayBuffer | ApiResponseData
  >(`/api/${type}File`, {
    responseType: 'arraybuffer',
  });

  await request();
  if (error.value) {
    console.log('downloadFile3 error', error.value);
    return;
  }

  if (!headers.value || !data.value) {
    return;
  }

  const v = data.value;
  if (v instanceof ArrayBuffer) {
    const fileName = getFileNameFromContentDisposition(headers.value);
    downloadBlob(new Blob([v]), fileName || 'unknownFile');
  } else {
    console.log('downloadFile3 data', v);
  }
}
