"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Bot, Users } from "lucide-react";

export function LlmBotAccounts() {
  const { data: botData, mutate: mutateBots } = useSWR<{
    data: {
      bots: Array<{ id: string; nickname: string; createdAt: string }>;
      total: number;
    };
  }>("/api/admin/llm/bot-accounts", fetcher);

  const [seedCount, setSeedCount] = useState("10");
  const [seedLoading, setSeedLoading] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          봇 계정 관리
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          현재 봇 계정:{" "}
          <span className="font-medium text-foreground">
            {botData?.data?.total ?? 0}개
          </span>
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
  );
}
