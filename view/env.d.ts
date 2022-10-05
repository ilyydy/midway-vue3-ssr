/// <reference types="vite/client" />

interface ApiResponseData<T = any> {
  code: number;
  data: T;
  msg: string;
}
