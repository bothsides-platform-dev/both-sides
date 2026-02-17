"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

export function LlmOpinionGeneration() {
  const [genTopicId, setGenTopicId] = useState("");
  const [genCountA, setGenCountA] = useState("3");
  const [genCountB, setGenCountB] = useState("3");
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<{
    generatedA: number;
    generatedB: number;
    errors: string[];
  } | null>(null);

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

  return (
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
            <p>
              A측 생성: {genResult.generatedA}개 / B측 생성:{" "}
              {genResult.generatedB}개
            </p>
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
  );
}
