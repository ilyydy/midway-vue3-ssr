/**
 * @file 服务端、浏览器端共用的变量，注意兼容性，不包含敏感信息
 */
/** */

export const API_ROUTE_PREFIX = '/api';
export const VIEW_ROUTE_PREFIX = '/view';
export const STATIC_RESOURCE_ROUTE_PREFIX = '/public';

export const FRONT_SOURCE_DIR_NAME = 'view';
export const FRONT_BUILD_DIR_NAME = 'public';
export const FRONT_BUILD_CLIENT_DIR_NAME = 'client';
export const FRONT_BUILD_SERVER_DIR_NAME = 'server';
export const SRC_SERVER_ENTRY_PATH = '/src/server.ts';
export const BUILD_SERVER_ENTRY = 'server.js';
export const ENTRY_HTML = 'index.html';
export const MANIFEST = 'ssr-manifest.json';
export const CSR = 'csr';
export const SSR = 'ssr';

export const X_TRANSACTION_ID = 'X-Transaction-Id';
export const X_RESPONSE_TIME = 'X-Response-Time';
export const X_REQUEST_ID = 'X-Request-Id';
export const HTTP_METHOD_MAP = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
} as const;

export const CONTENT_DISPOSITION = 'content-disposition';
export const CONTENT_LENGTH = 'content-length';
export const CONTENT_TYPE = 'content-type';
export const CONTENT_TYPE_MAP = {
  stream: 'application/octet-stream',
  json: 'application/json',
  html: 'text/html',
  text: 'text/plain;',
} as const;
