/**
 * API Error handling utilities
 * Provides consistent error handling across the application
 */

export class ApiError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }

  get isRateLimit(): boolean {
    return this.status === 429;
  }
}

export interface ApiErrorResponse {
  error: string;
  requestId?: string;
}

/**
 * Wrapper for fetch that handles common error cases
 * Returns typed response or throws ApiError
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const retryAfter = res.headers.get("Retry-After");
    let errorMessage = "요청 처리 중 오류가 발생했습니다.";

    try {
      const errorData: ApiErrorResponse = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // JSON parsing failed, use default message
    }

    throw new ApiError(
      errorMessage,
      res.status,
      retryAfter ? parseInt(retryAfter, 10) : undefined
    );
  }

  return res.json();
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.isRateLimit;
}
