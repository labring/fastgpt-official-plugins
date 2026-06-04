export async function retryFn<T>(fn: () => Promise<T>, retries = 3, interval = 1000): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
  throw lastError;
}
