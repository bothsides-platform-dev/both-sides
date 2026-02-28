"use client";

import useSWR from "swr";
import { Info, Swords } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { BattleCard } from "./BattleCard";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";

type BattleBrief = React.ComponentProps<typeof BattleCard>["battle"];

interface BattlesResponse {
  data: {
    battles: BattleBrief[];
  };
}

export function HomeBattleSection() {
  const { data: activeData, isLoading: activeLoading } = useSWR<BattlesResponse>(
    "/api/battles?status=ACTIVE&limit=5",
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: completedData, isLoading: completedLoading } = useSWR<BattlesResponse>(
    "/api/battles?status=COMPLETED&limit=5",
    fetcher,
    { refreshInterval: 60000 }
  );

  const activeBattles = activeData?.data?.battles ?? [];
  const completedBattles = completedData?.data?.battles ?? [];

  const isLoading = activeLoading || completedLoading;
  const isEmpty = !isLoading && activeBattles.length === 0 && completedBattles.length === 0;

  if (isEmpty) return null;

  if (isLoading && activeBattles.length === 0 && completedBattles.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-bold">맞짱 배틀</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[280px] flex-shrink-0">
              <Skeleton className="h-[120px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Swords className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-bold">맞짱 배틀</h2>
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                sideOffset={4}
                className="z-50 max-w-[240px] rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
              >
                두 유저가 실시간으로 HP를 걸고 의견 대결하는 배틀이에요. 투표로 상대의 HP를 깎아 승부를 가려요!
                <Tooltip.Arrow className="fill-border" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      {activeBattles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>진행 중</span>
          </div>
          <HorizontalScroll>
            {activeBattles.map((battle) => (
              <div key={battle.id} className="flex-shrink-0 w-[280px]">
                <BattleCard battle={battle} showTopicTitle />
              </div>
            ))}
          </HorizontalScroll>
        </div>
      )}

      {completedBattles.length > 0 && (
        <HorizontalScroll>
          {completedBattles.map((battle) => (
            <div key={battle.id} className="flex-shrink-0 w-[280px]">
              <BattleCard battle={battle} showTopicTitle />
            </div>
          ))}
        </HorizontalScroll>
      )}
    </section>
  );
}
