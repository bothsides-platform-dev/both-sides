"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval: 5000,
        errorRetryCount: 3,
        onError: (error) => {
          if (error?.status === 401 || error?.status === 403) return;
          console.error("[SWR]", error);
        },
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          if (error?.status === 401 || error?.status === 403 || error?.status === 404) return;
          if (retryCount >= 3) return;
          setTimeout(() => revalidate({ retryCount }), 3000 * (retryCount + 1));
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
