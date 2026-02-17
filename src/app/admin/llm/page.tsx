"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LlmTopicList } from "@/components/admin/llm/LlmTopicList";
import { LlmOpinionGeneration } from "@/components/admin/llm/LlmOpinionGeneration";
import { LlmBotAccounts } from "@/components/admin/llm/LlmBotAccounts";
import { LlmSettings } from "@/components/admin/llm/LlmSettings";
import { UnifiedBotOpinionGeneration } from "@/components/admin/llm/UnifiedBotOpinionGeneration";

type TabType = "generate" | "topics" | "opinions" | "bots" | "settings";

export default function AdminLlmPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("generate");

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

  const tabs: { value: TabType; label: string }[] = [
    { value: "generate", label: "🤖 봇 의견 생성" },
    { value: "topics", label: "📊 AI 작업 현황" },
    { value: "settings", label: "⚙️ 설정" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card className="p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.value)}
              className="flex-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === "generate" && <UnifiedBotOpinionGeneration />}
      {activeTab === "topics" && <LlmTopicList />}
      {activeTab === "settings" && <LlmSettings />}
    </div>
  );
}
