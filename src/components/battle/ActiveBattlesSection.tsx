"use client";

import useSWR from "swr";
import { BattleCard } from "./BattleCard";
import { Swords } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ActiveBattlesSectionProps {
  topicId: string;
}

export function ActiveBattlesSection({ topicId }: ActiveBattlesSectionProps) {
  const { data } = useSWR(
    `/api/battles?topicId=${topicId}&status=ACTIVE`,
    fetcher,
    { refreshInterval: 10000 }
  );

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
