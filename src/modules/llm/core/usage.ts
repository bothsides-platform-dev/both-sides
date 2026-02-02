import { Usage } from "./schemas";

export const toUsage = (inputTokens?: number, outputTokens?: number): Usage => {
  return {
    inputTokens: inputTokens ?? 0,
    outputTokens: outputTokens ?? 0,
    costUsd: null
  };
};
