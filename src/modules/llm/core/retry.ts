export type RetryOptions = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  shouldRetry?: (err: unknown) => boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async <T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T> => {
  let attempt = 0;
  let lastErr: unknown;

  while (attempt <= opts.retries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === opts.retries) break;
      if (opts.shouldRetry && !opts.shouldRetry(err)) break;
      const exp = Math.min(opts.maxDelayMs, opts.baseDelayMs * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 100);
      await sleep(exp + jitter);
      attempt += 1;
    }
  }

  throw lastErr;
};
