"use client";

import { useState, useEffect } from "react";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

interface LlmSettingsData {
  provider: string;
  apiKey: string; // Masked
  baseUrl?: string;
  modelSummarize?: string;
  modelGenerate?: string;
  isEnabled: boolean;
  enableSummarize: boolean;
  enableGenerate: boolean;
  enableGrounds: boolean;
  enableClassify: boolean;
  timeoutMs: number;
}

export function LlmSettings() {
  const { data: settingsData, mutate } = useSWR<{ data: LlmSettingsData | null }>(
    "/api/admin/llm/settings",
    fetcher
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [modelSummarize, setModelSummarize] = useState("");
  const [modelGenerate, setModelGenerate] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [enableSummarize, setEnableSummarize] = useState(true);
  const [enableGenerate, setEnableGenerate] = useState(true);
  const [enableGrounds, setEnableGrounds] = useState(true);
  const [enableClassify, setEnableClassify] = useState(true);
  const [timeoutMs, setTimeoutMs] = useState(30000);

  // Load existing settings
  useEffect(() => {
    if (settingsData?.data) {
      const s = settingsData.data;
      setProvider(s.provider);
      setApiKey(s.apiKey); // Masked
      setBaseUrl(s.baseUrl || "");
      setModelSummarize(s.modelSummarize || "");
      setModelGenerate(s.modelGenerate || "");
      setIsEnabled(s.isEnabled);
      setEnableSummarize(s.enableSummarize);
      setEnableGenerate(s.enableGenerate);
      setEnableGrounds(s.enableGrounds);
      setEnableClassify(s.enableClassify);
      setTimeoutMs(s.timeoutMs);
    }
  }, [settingsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/llm/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          baseUrl: baseUrl || undefined,
          modelSummarize: modelSummarize || undefined,
          modelGenerate: modelGenerate || undefined,
          isEnabled,
          enableSummarize,
          enableGenerate,
          enableGrounds,
          enableClassify,
          timeoutMs,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "설정 저장에 실패했습니다.");
      }

      setSuccess(true);
      mutate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settingsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">LLM 설정</h2>
        <p className="text-muted-foreground mt-2">
          AI 기능에 사용할 LLM 제공자와 API 키를 설정합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>제공자 설정</CardTitle>
            <CardDescription>
              데이터베이스에 저장된 설정이 환경 변수보다 우선 적용됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Global Enable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>LLM 기능 활성화</Label>
                <p className="text-sm text-muted-foreground">
                  모든 AI 기능을 활성화/비활성화합니다.
                </p>
              </div>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider">제공자</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="google" disabled>Google (준비 중)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API 키</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                API 키는 암호화되어 저장됩니다.
              </p>
            </div>

            {/* Base URL */}
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL (선택사항)</Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>

            {/* Models */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelSummarize">요약 모델</Label>
                <Input
                  id="modelSummarize"
                  value={modelSummarize}
                  onChange={(e) => setModelSummarize(e.target.value)}
                  placeholder="gpt-4o-mini"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelGenerate">생성 모델</Label>
                <Input
                  id="modelGenerate"
                  value={modelGenerate}
                  onChange={(e) => setModelGenerate(e.target.value)}
                  placeholder="gpt-4o-mini"
                />
              </div>
            </div>

            {/* Timeout */}
            <div className="space-y-2">
              <Label htmlFor="timeout">타임아웃 (ms)</Label>
              <Input
                id="timeout"
                type="number"
                min={1000}
                max={120000}
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(parseInt(e.target.value, 10))}
              />
            </div>

            {/* Feature Flags */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">기능 활성화</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>토론 요약</Label>
                  <Switch
                    checked={enableSummarize}
                    onCheckedChange={setEnableSummarize}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>의견 생성</Label>
                  <Switch
                    checked={enableGenerate}
                    onCheckedChange={setEnableGenerate}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>논거 분석</Label>
                  <Switch
                    checked={enableGrounds}
                    onCheckedChange={setEnableGrounds}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>의견 분류</Label>
                  <Switch
                    checked={enableClassify}
                    onCheckedChange={setEnableClassify}
                  />
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>설정이 저장되었습니다.</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
