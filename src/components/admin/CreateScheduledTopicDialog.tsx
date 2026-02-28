"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category } from "@prisma/client";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

interface CreateScheduledTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultScheduledDate: Date | null;
  onCreated: () => void;
}

export function CreateScheduledTopicDialog({
  open,
  onOpenChange,
  defaultScheduledDate,
  onCreated,
}: CreateScheduledTopicDialogProps) {
  const defaultDatetime = defaultScheduledDate
    ? format(
        new Date(
          defaultScheduledDate.getFullYear(),
          defaultScheduledDate.getMonth(),
          defaultScheduledDate.getDate(),
          9,
          0
        ),
        "yyyy-MM-dd'T'HH:mm"
      )
    : "";

  const [title, setTitle] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [category, setCategory] = useState<Category>("DAILY");
  const [scheduledAt, setScheduledAt] = useState(defaultDatetime);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    title.trim().length >= 5 &&
    optionA.trim().length >= 1 &&
    optionB.trim().length >= 1 &&
    scheduledAt;

  const resetForm = () => {
    setTitle("");
    setOptionA("");
    setOptionB("");
    setCategory("DAILY");
    setScheduledAt(defaultDatetime);
    setError("");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          category,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "생성에 실패했습니다.");
      }
      resetForm();
      onCreated();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>예약 토론 생성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="create-title">제목</Label>
            <input
              id="create-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="5자 이상 입력"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="create-optionA">A 옵션</Label>
              <input
                id="create-optionA"
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="옵션 A"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-optionB">B 옵션</Label>
              <input
                id="create-optionB"
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="옵션 B"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-category">카테고리</Label>
            <select
              id="create-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-scheduled">예약 시각</Label>
            <input
              id="create-scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !canSubmit}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
