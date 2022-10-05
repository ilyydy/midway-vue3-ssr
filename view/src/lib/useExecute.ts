import { ref } from 'vue';

export function useExecute<T = any>(
  funcOrPromise: (() => Promise<T>) | Promise<T>
) {
  const data = ref<null | T>(null);
  const error = ref<null | Error>(null);
  const loading = ref(false);

  async function execute() {
    if (loading.value) return null;
    loading.value = true;

    try {
      data.value = (
        typeof funcOrPromise === 'function'
          ? await funcOrPromise()
          : await funcOrPromise
      ) as any;
      error.value = null;
    } catch (err: any) {
      error.value = err;
      data.value = null;
    } finally {
      loading.value = false;
    }

    return { data: data.value, error: error.value, loading: loading.value } as
      | { data: T; error: null; loading: false }
      | { data: null; error: Error; loading: false };
  }

  return { data, error, loading, execute };
}
