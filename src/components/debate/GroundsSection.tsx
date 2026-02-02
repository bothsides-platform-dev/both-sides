"use client";

import { useState } from "react";
import useSWR from "swr";
import { Brain } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GroundsSectionProps {
  topicId: string;
  optionA: string;
  optionB: string;
}

interface Ground {
  id: number;
  title: string;
  points: string[];
}

interface SideGrounds {
  summaryText: string;
  grounds: Ground[];
}

interface GroundsResponse {
  data: {
    sideA: SideGrounds | null;
    sideB: SideGrounds | null;
  };
}

function GroundCard({ ground }: { ground: Ground }) {
  return (
    <div className="rounded-md border border-border/50 bg-background p-3 space-y-1.5">
      <h4 className="text-sm font-medium">{ground.title}</h4>
      <ul className="space-y-0.5">
        {ground.points.map((point, idx) => (
          <li key={idx} className="text-xs text-muted-foreground flex gap-1.5">
            <span className="shrink-0 mt-0.5">&#8226;</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SideColumn({
  label,
  grounds,
  colorClass,
}: {
  label: string;
  grounds: SideGrounds;
  colorClass: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className={cn("text-sm font-semibold", colorClass)}>{label}</h3>
      <div className="space-y-2">
        {grounds.grounds.map((ground) => (
          <GroundCard key={ground.id} ground={ground} />
        ))}
      </div>
    </div>
  );
}

export function GroundsSection({ topicId, optionA, optionB }: GroundsSectionProps) {
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");
  const { data } = useSWR<GroundsResponse>(
    `/api/topics/${topicId}/grounds`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!data?.data?.sideA && !data?.data?.sideB) return null;

  const { sideA, sideB } = data.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-violet-500" />
        <Badge variant="secondary" className="text-xs font-medium">
          AI 논거 분석
        </Badge>
      </div>

      {/* Desktop: 2-column */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6">
        {sideA && (
          <SideColumn label={optionA} grounds={sideA} colorClass="text-blue-600 dark:text-blue-400" />
        )}
        {sideB && (
          <SideColumn label={optionB} grounds={sideB} colorClass="text-red-600 dark:text-red-400" />
        )}
      </div>

      {/* Mobile: Tabs */}
      <div className="md:hidden space-y-3">
        <div className="flex gap-1 rounded-md bg-muted p-1">
          <button
            onClick={() => setActiveTab("A")}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              activeTab === "A"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {optionA}
          </button>
          <button
            onClick={() => setActiveTab("B")}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              activeTab === "B"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {optionB}
          </button>
        </div>

        {activeTab === "A" && sideA && (
          <SideColumn label={optionA} grounds={sideA} colorClass="text-blue-600 dark:text-blue-400" />
        )}
        {activeTab === "B" && sideB && (
          <SideColumn label={optionB} grounds={sideB} colorClass="text-red-600 dark:text-red-400" />
        )}
      </div>
    </div>
  );
}
