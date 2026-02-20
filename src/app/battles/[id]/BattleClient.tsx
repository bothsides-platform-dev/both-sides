"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useBattleSSE } from "@/hooks/useBattleSSE";
import { BattleHpBar } from "@/components/battle/BattleHpBar";
import { BattleTimer } from "@/components/battle/BattleTimer";
import { BattleChat } from "@/components/battle/BattleChat";
import { BattleGroundInput } from "@/components/battle/BattleGroundInput";
import { BattleObserverComments } from "@/components/battle/BattleObserverComments";
import { BattleResultBanner } from "@/components/battle/BattleResultBanner";
import { BattleSetupDialog } from "@/components/battle/BattleSetupDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Swords, Flag, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface BattleClientProps {
  battleId: string;
}

export function BattleClient({ battleId }: BattleClientProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { showToast } = useToast();

  const { data: battleData, mutate: mutateBattle } = useSWR(
    `/api/battles/${battleId}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: messagesData, mutate: mutateMessages } = useSWR(
    `/api/battles/${battleId}/messages`,
    fetcher,
    { refreshInterval: 3000 }
  );

  const { data: commentsData, mutate: mutateComments } = useSWR(
    `/api/battles/${battleId}/comments`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const [showSetup, setShowSetup] = useState(false);

  const battle = battleData?.data;
  const messages = messagesData?.data ?? [];
  const comments = commentsData?.data?.comments ?? [];

  // SSE for real-time updates
  const { connectionStatus } = useBattleSSE({
    battleId,
    enabled: battle?.status === "ACTIVE",
    onMessage: useCallback(
      (event: { type: string }) => {
        if (event.type === "battle:state" || event.type === "battle:hp" || event.type === "battle:turn" || event.type === "battle:end") {
          mutateBattle();
        }
        if (event.type === "battle:message") {
          mutateMessages();
        }
        if (event.type === "battle:comment") {
          mutateComments();
        }
      },
      [mutateBattle, mutateMessages, mutateComments]
    ),
  });

  // Show setup dialog when battle is in SETUP status
  useEffect(() => {
    if (battle?.status === "SETUP" && isParticipant) {
      setShowSetup(true);
    }
  }, [battle?.status]);

  if (!battle) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isParticipant =
    currentUserId === battle.challengerId || currentUserId === battle.challengedId;
  const isMyTurn = battle.currentTurn === currentUserId;
  const isActive = battle.status === "ACTIVE";
  const isCompleted = ["COMPLETED", "RESIGNED", "ABANDONED"].includes(battle.status);
  const isPending = battle.status === "PENDING";
  const isChallenged = currentUserId === battle.challengedId;
  const maxHp = battle.durationSeconds ?? 600;

  const challengerName = battle.challenger.nickname || battle.challenger.name || "도전자";
  const challengedName = battle.challenged.nickname || battle.challenged.name || "상대";
  const winnerName =
    battle.winnerId === battle.challengerId
      ? challengerName
      : challengedName;

  const handleRespond = async (accept: boolean) => {
    try {
      const res = await fetch(`/api/battles/${battleId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "응답에 실패했습니다.", "error");
        return;
      }
      mutateBattle();
    } catch {
      showToast("응답에 실패했습니다.", "error");
    }
  };

  const handleResign = async () => {
    if (!confirm("정말 기권하시겠습니까?")) return;
    try {
      await fetch(`/api/battles/${battleId}/resign`, {
        method: "POST",
      });
      mutateBattle();
    } catch {
      // Error handled by SWR revalidation
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/topics/${battle.topicId}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              토론으로
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 animate-pulse flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              LIVE
            </span>
          )}
          {connectionStatus === "connected" ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : connectionStatus === "polling" ? (
            <Wifi className="h-4 w-4 text-yellow-500" />
          ) : null}
        </div>
      </div>

      {/* Topic Title */}
      <Link
        href={`/topics/${battle.topicId}`}
        className="text-lg font-bold hover:underline block"
      >
        {battle.topic.title}
      </Link>

      {/* Pending: Accept/Decline */}
      {isPending && isChallenged && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-orange-500" />
            <span className="font-medium">{challengerName}님이 맞짱을 신청했습니다!</span>
          </div>
          {battle.challengeMessage && (
            <p className="text-sm bg-muted/50 rounded p-2 italic">
              &ldquo;{battle.challengeMessage}&rdquo;
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={() => handleRespond(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
              수락
            </Button>
            <Button variant="outline" onClick={() => handleRespond(false)}>
              거절
            </Button>
          </div>
        </div>
      )}

      {/* Result Banner */}
      {isCompleted && (
        <BattleResultBanner
          winnerId={battle.winnerId}
          currentUserId={currentUserId}
          winnerName={winnerName}
          endReason={battle.endReason}
        />
      )}

      {/* HP Bars & Timers */}
      {(isActive || isCompleted) && battle.challengerHp !== null && battle.challengedHp !== null && (
        <div className="border rounded-lg p-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Challenger */}
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-sm font-medium truncate">{challengerName}</div>
                <div className="text-xs text-muted-foreground">
                  {battle.challengerSide === "A" ? battle.topic.optionA : battle.topic.optionB}
                </div>
              </div>
              <BattleHpBar
                current={battle.challengerHp}
                max={maxHp}
                label=""
              />
              {isActive && (
                <BattleTimer
                  turnStartedAt={battle.turnStartedAt}
                  isMyTurn={battle.currentTurn === battle.challengerId}
                  currentHp={battle.challengerHp}
                  className="justify-center"
                />
              )}
            </div>

            {/* VS */}
            <div className="text-xl font-bold text-muted-foreground">VS</div>

            {/* Challenged */}
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-sm font-medium truncate">{challengedName}</div>
                <div className="text-xs text-muted-foreground">
                  {battle.challengedSide === "A" ? battle.topic.optionA : battle.topic.optionB}
                </div>
              </div>
              <BattleHpBar
                current={battle.challengedHp}
                max={maxHp}
                label=""
              />
              {isActive && (
                <BattleTimer
                  turnStartedAt={battle.turnStartedAt}
                  isMyTurn={battle.currentTurn === battle.challengedId}
                  currentHp={battle.challengedHp}
                  className="justify-center"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat & Ground Input */}
      {(isActive || isCompleted) && (
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <BattleChat messages={messages} />

          {isActive && isParticipant && (
            <BattleGroundInput
              battleId={battleId}
              isMyTurn={isMyTurn}
              isActive={isActive}
            />
          )}
        </div>
      )}

      {/* Resign Button */}
      {isActive && isParticipant && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResign}
            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
          >
            <Flag className="h-4 w-4 mr-1" />
            기권
          </Button>
        </div>
      )}

      {/* Observer Comments */}
      {(isActive || isCompleted) && (
        <div className="border rounded-lg overflow-hidden">
          <BattleObserverComments
            battleId={battleId}
            comments={comments}
            isLoggedIn={!!currentUserId}
            onCommentAdded={() => mutateComments()}
          />
        </div>
      )}

      {/* Setup Dialog */}
      <BattleSetupDialog
        open={showSetup}
        onOpenChange={setShowSetup}
        battleId={battleId}
        onSetupComplete={() => mutateBattle()}
      />
    </div>
  );
}
