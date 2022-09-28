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
