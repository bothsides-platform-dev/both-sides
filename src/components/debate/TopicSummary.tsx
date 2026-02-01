"use client";

import useSWR from "swr";
import { Sparkles } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Badge } from "@/components/ui/badge";

interface TopicSummaryProps {
  topicId: string;
}

interface SummaryResponse {
  data: {
    id: string;
    summary: string;
  } | null;
}

export function TopicSummary({ topicId }: TopicSummaryProps) {
  const { data } = useSWR<SummaryResponse>(
    `/api/topics/${topicId}/summary`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!data?.data) return null;

  return (
    <div className="rounded-lg bg-muted/50 border border-border/50 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <Badge variant="secondary" className="text-xs font-medium">
          AI 요약
        </Badge>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {data.data.summary}
      </p>
    </div>
  );
}
