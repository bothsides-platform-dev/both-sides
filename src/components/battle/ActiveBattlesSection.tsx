"use client";

import { useCallback, useRef } from "react";
import useSWR from "swr";
import { useTopicSSE } from "@/hooks/useTopicSSE";
import { BattleCard } from "./BattleCard";
import { Swords } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ActiveBattlesSectionProps {
  topicId: string;
}

export function ActiveBattlesSection({ topicId }: ActiveBattlesSectionProps) {
  const mutateRef = useRef<() => void>(() => {});

  const { isConnected: sseConnected } = useTopicSSE(
    useCallback((event: { type: string }) => {
      if (event.type === "battle:active") {
        mutateRef.current();
      }
    }, [])
  );

  const { data, mutate } = useSWR(
    `/api/battles?topicId=${topicId}&status=ACTIVE`,
    fetcher,
    { refreshInterval: sseConnected ? 0 : 10000 }
  );

  mutateRef.current = mutate;

  const battles = data?.data?.battles ?? [];

  if (battles.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Swords className="h-5 w-5 text-orange-500" />
        진행 중인 맞짱
      </h2>
      <div className="space-y-2">
        {battles.map((battle: { id: string } & Record<string, unknown>) => (
          <BattleCard key={battle.id} battle={battle as unknown as React.ComponentProps<typeof BattleCard>["battle"]} />
        ))}
      </div>
    </section>
  );
}
