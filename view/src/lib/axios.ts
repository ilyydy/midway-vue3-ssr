import axios from 'axios';
import { v4 } from 'uuid';

import { X_REQUEST_ID, CONTENT_TYPE, CONTENT_TYPE_MAP } from '@share/constant';

import type { AxiosRequestConfig } from 'axios';

const defaultGetAbortIdentifier = (config: AxiosRequestConfig) =>
  [config.method, config.url, JSON.stringify(config.params)].join('&');

const useAutoAbort = Symbol('useAutoAbort');

/**
 * 添加并检查重复请求
 * @param config 请求拦截器中的 config
 */
const addPending = (
  config: AxiosRequestConfig,
  pending: Map<string, AbortController>
) => {
  // 如果已经自行传入了 signal 或不启用该功能，则不再处理
  if (config.signal || config.abortWhenRepeat === false) {
    return;
  }

  const c = new AbortController();
  config.signal = c.signal;
  (config as any)[useAutoAbort] = true; // 用于在响应拦截器中区分该次请求是否加入过 pending，是否需要从 pending 中清掉
  const identifier = config.getAbortIdentifier
    ? config.getAbortIdentifier(config)
    : defaultGetAbortIdentifier(config);

  const previousAbortController = pending.get(identifier);
  if (!previousAbortController) {
    // 如果 pending 中不存在同种请求，则添加进去
    pending.set(identifier, c);
  } else {
    // 取消重复请求
    if (!config.abortType || config.abortType === 'before') {
      previousAbortController.abort();
      pending.set(identifier, c);
    } else {
      c.abort();
    }
  }
};

/**
 * 移除请求
 * @param config 响应拦截器中的 config
 */
const removePending = (
  config: AxiosRequestConfig,
  pending: Map<string, AbortController>
) => {
  if (!(config as any)[useAutoAbort]) {
    return;
  }

  const identifier = config.getAbortIdentifier
    ? config.getAbortIdentifier(config)
    : defaultGetAbortIdentifier(config);

  pending.delete(identifier);
};

/**
 * 清空 pending 中的请求（在路由跳转时调用）
 */
const createClearPending = (pending: Map<string, AbortController>) => () => {
  for (const c of pending.values()) {
    c.abort();
  }
  pending.clear();
};

const BLOB = 'blob';
const ARRAY_BUFFER = 'arraybuffer';

export function createInstance(config: AxiosRequestConfig = {}) {
  const instance = axios.create({
    timeout: 50000,
    withCredentials: true,
    ...config,
  });

  // 用于存储每个请求的标识和 AbortController
  const pending = new Map<string, AbortController>();

  instance.interceptors.request.use(
    config => {
      const requestId = v4();
      if (config.headers) {
        config.headers[X_REQUEST_ID] = requestId;
      } else {
        config.headers = { [X_REQUEST_ID]: requestId };
      }

      addPending(config, pending);
      return config;
    },
    undefined,
    { synchronous: true }
  );

  instance.interceptors.response.use(
    async response => {
      const { config } = response;

      removePending(config, pending);

      // console.log(typeof response.data, 'response type');
      // console.log(response.data instanceof Blob, 'response data is Blob');
      // console.log(
      //   response.data instanceof ArrayBuffer,
      //   'response data is arrayBuffer'
      // );

      // 请求 blob/arrayBuffer 形式数据时，判断实际是否 json 数据
      if (
        config.responseType === BLOB ||
        config.responseType === ARRAY_BUFFER
      ) {
        if (
          response.headers[CONTENT_TYPE] &&
          response.headers[CONTENT_TYPE].toLocaleLowerCase().includes(
            CONTENT_TYPE_MAP.json
          )
        ) {
          // 转换为 json 响应
          response.data =
            config.responseType === BLOB
              ? JSON.parse(await response.data.text())
              : JSON.parse(new TextDecoder().decode(response.data));
        }
      }

      return response;
    },
    error => {
      if (!axios.isCancel(error)) {
        removePending(error.config, pending);
      }
      return Promise.reject(error);
    }
  );

  return { instance, clearPending: createClearPending(pending) };
}
