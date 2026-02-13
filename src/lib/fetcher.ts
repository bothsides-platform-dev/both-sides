/**
 * Shared fetcher utility for SWR
 * Used across the application for consistent fetch behavior
 */
import { ApiError } from "./api-error";

export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let message = "데이터를 불러오는 중 오류가 발생했습니다.";
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {}
    throw new ApiError(message, res.status);
  }
  return res.json();
}
