"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetcher } from "@/lib/fetcher";
import { Loader2, Bot, Sparkles, Brain, Users } from "lucide-react";

export default function AdminLlmPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Bot accounts
  const { data: botData, mutate: mutateBots } = useSWR<{
    data: { bots: Array<{ id: string; nickname: string; createdAt: string }>; total: number };
  }>(
    session?.user?.role === "ADMIN" ? "/api/admin/llm/bot-accounts" : null,
    fetcher
  );
  const [seedCount, setSeedCount] = useState("10");
  const [seedLoading, setSeedLoading] = useState(false);

  // Opinion generation
  const [genTopicId, setGenTopicId] = useState("");
  const [genCountA, setGenCountA] = useState("3");
  const [genCountB, setGenCountB] = useState("3");
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<{
    generatedA: number;
    generatedB: number;
    errors: string[];
  } | null>(null);

  // Manual triggers
  const [summaryTopicId, setSummaryTopicId] = useState("");
  const [groundsTopicId, setGroundsTopicId] = useState("");
  const [triggerLoading, setTriggerLoading] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const handleSeedBots = async () => {
    setSeedLoading(true);
    try {
      await fetch("/api/admin/llm/bot-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: parseInt(seedCount, 10) }),
      });
      mutateBots();
    } catch (err) {
      console.error("Failed to seed bots:", err);
    } finally {
      setSeedLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    setGenResult(null);
    try {
      const res = await fetch("/api/admin/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: genTopicId,
          countA: parseInt(genCountA, 10),
          countB: parseInt(genCountB, 10),
        }),
      });
      const json = await res.json();
      if (json.data) setGenResult(json.data);
    } catch (err) {
      console.error("Failed to generate:", err);
    } finally {
      setGenLoading(false);
    }
  };

  const handleTrigger = async (type: "summary" | "grounds", topicId: string) => {
    if (!topicId) return;
    setTriggerLoading(type);
    try {
      const url =
        type === "summary"
          ? `/api/admin/llm/summarize/${topicId}`
          : `/api/admin/llm/grounds/${topicId}`;
      await fetch(url, { method: "POST" });
    } catch (err) {
      console.error(`Failed to trigger ${type}:`, err);
    } finally {
      setTriggerLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bot Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            봇 계정 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            현재 봇 계정: <span className="font-medium text-foreground">{botData?.data?.total ?? 0}개</span>
          </p>
          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="seedCount">생성할 수</Label>
              <Input
                id="seedCount"
                type="number"
                min={1}
                max={50}
                value={seedCount}
                onChange={(e) => setSeedCount(e.target.value)}
                className="w-24"
              />
            </div>
            <Button onClick={handleSeedBots} disabled={seedLoading}>
              {seedLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Bot className="h-4 w-4 mr-2" />
              봇 생성
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Opinion Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            의견 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="genTopicId">토론 ID</Label>
            <Input
              id="genTopicId"
              placeholder="cuid..."
              value={genTopicId}
              onChange={(e) => setGenTopicId(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="space-y-1">
              <Label htmlFor="genCountA">A측 의견 수</Label>
              <Input
                id="genCountA"
                type="number"
                min={0}
                max={20}
                value={genCountA}
                onChange={(e) => setGenCountA(e.target.value)}
                className="w-24"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="genCountB">B측 의견 수</Label>
              <Input
                id="genCountB"
                type="number"
                min={0}
                max={20}
                value={genCountB}
                onChange={(e) => setGenCountB(e.target.value)}
                className="w-24"
              />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={genLoading || !genTopicId}>
            {genLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            의견 생성
          </Button>
          {genResult && (
            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
              <p>A측 생성: {genResult.generatedA}개 / B측 생성: {genResult.generatedB}개</p>
              {genResult.errors.length > 0 && (
                <div className="text-destructive">
                  {genResult.errors.map((e, i) => (
                    <p key={i}>{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            수동 트리거
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="summaryTopicId">토론 요약 재생성</Label>
              <Input
                id="summaryTopicId"
                placeholder="토론 ID"
                value={summaryTopicId}
                onChange={(e) => setSummaryTopicId(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleTrigger("summary", summaryTopicId)}
              disabled={triggerLoading === "summary" || !summaryTopicId}
              variant="secondary"
            >
              {triggerLoading === "summary" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              요약 생성
            </Button>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="groundsTopicId">논거 분석 재생성</Label>
              <Input
                id="groundsTopicId"
                placeholder="토론 ID"
                value={groundsTopicId}
                onChange={(e) => setGroundsTopicId(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleTrigger("grounds", groundsTopicId)}
              disabled={triggerLoading === "grounds" || !groundsTopicId}
              variant="secondary"
            >
              {triggerLoading === "grounds" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              논거 생성
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
