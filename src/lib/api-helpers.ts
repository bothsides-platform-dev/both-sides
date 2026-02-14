import { requireAdmin } from "./auth";
import { handleApiError } from "./errors";

type Handler = (...args: any[]) => Promise<Response>;

export function withAdmin<T extends Handler>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      await requireAdmin();
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  }) as T;
}
