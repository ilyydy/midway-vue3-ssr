import { computed } from 'vue';
import { createInstance } from '@/lib/axios';
import { useExecute } from '@/lib/useExecute';

import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export const { instance, clearPending } = createInstance();

export function useAxiosRequest<T = ApiResponseData>(
  func: () => Promise<AxiosResponse<T>>
) {
  const { data: response, error, execute: request, loading } = useExecute(func);

  const data = computed(() => response.value?.data);
  const headers = computed(() => response.value?.headers);

  return { data, headers, error, loading, request };
}

export function useGetRequest<T = ApiResponseData>(
  url: string,
  config?: AxiosRequestConfig
) {
  return useAxiosRequest(() => instance.get<T>(url, config));
}

export function usePostRequest<D, T = ApiResponseData>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig<D>
) {
  return useAxiosRequest(() => instance.post<T>(url, data, config));
}
