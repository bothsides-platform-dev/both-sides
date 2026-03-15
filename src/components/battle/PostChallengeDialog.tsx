"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Swords, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DURATION_OPTIONS, DURATION_LABELS } from "@/modules/battles/constants";
import { useToast } from "@/components/ui/toast";

interface PostChallengeDialogProps {
  postId: string;
  challengedId: string;
  challengedName: string;
  sourceCommentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PostChallengeDialog({
  postId,
  challengedId,
  challengedName,
  sourceCommentId,
  onClose,
  onSuccess,
}: PostChallengeDialogProps) {
  const { showToast } = useToast();
  const [battleTitle, setBattleTitle] = useState("");
  const [customOptionA, setCustomOptionA] = useState("");
  const [customOptionB, setCustomOptionB] = useState("");
  const [challengerSide, setChallengerSide] = useState<"A" | "B">("A");
  const [durationSeconds, setDurationSeconds] = useState<number>(600);
  const [challengeMessage, setChallengeMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    battleTitle.trim().length >= 2 &&
    customOptionA.trim().length >= 1 &&
    customOptionB.trim().length >= 1 &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/battles/challenge-from-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          challengedId,
          sourceCommentId,
          battleTitle: battleTitle.trim(),
          customOptionA: customOptionA.trim(),
          customOptionB: customOptionB.trim(),
          challengerSide,
          challengeMessage: challengeMessage.trim() || undefined,
          durationSeconds,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "맞짱 신청에 실패했습니다.", "error");
        return;
      }

      showToast("맞짱을 신청했습니다!", "success");
      onSuccess();
      onClose();
    } catch {
      showToast("맞짱 신청에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-background border rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-orange-500" />
            <h2 className="font-bold">맞짱 도전</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{challengedName}</strong>님에게 맞짱을 신청합니다.
          </p>

          {/* Battle Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">맞짱 주제 *</label>
            <input
              type="text"
              value={battleTitle}
              onChange={(e) => setBattleTitle(e.target.value)}
              maxLength={100}
              placeholder="예: 민트초코는 맛있다?"
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sideA">선택지 A *</label>
              <input
                type="text"
                value={customOptionA}
                onChange={(e) => setCustomOptionA(e.target.value)}
                maxLength={30}
                placeholder="예: 맛있다"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-sideA/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sideB">선택지 B *</label>
              <input
                type="text"
                value={customOptionB}
                onChange={(e) => setCustomOptionB(e.target.value)}
                maxLength={30}
                placeholder="예: 맛없다"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-sideB/50"
              />
            </div>
          </div>

          {/* Side Picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">내 입장 선택 *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChallengerSide("A")}
                className={cn(
                  "px-3 py-2.5 text-sm rounded-lg border-2 transition-all font-medium",
                  challengerSide === "A"
                    ? "border-sideA bg-sideA/10 text-sideA"
                    : "border-border hover:border-sideA/50"
                )}
              >
                A: {customOptionA || "선택지 A"}
              </button>
              <button
                type="button"
                onClick={() => setChallengerSide("B")}
                className={cn(
                  "px-3 py-2.5 text-sm rounded-lg border-2 transition-all font-medium",
                  challengerSide === "B"
                    ? "border-sideB bg-sideB/10 text-sideB"
                    : "border-border hover:border-sideB/50"
                )}
              >
                B: {customOptionB || "선택지 B"}
              </button>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">배틀 시간</label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDurationSeconds(option)}
                  className={cn(
                    "px-2 py-2 text-sm rounded-lg border transition-colors",
                    durationSeconds === option
                      ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                      : "border-border hover:border-orange-300"
                  )}
                >
                  {DURATION_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          {/* Challenge Message */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">도발 메시지 (선택)</label>
            <textarea
              value={challengeMessage}
              onChange={(e) => setChallengeMessage(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="상대에게 한 마디..."
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Swords className="h-4 w-4 mr-1" />
            맞짱 신청
          </Button>
        </div>
      </div>
    </div>
  );
}
