"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Timer } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { DURATION_OPTIONS, DURATION_LABELS } from "@/modules/battles/constants";
import { cn } from "@/lib/utils";

interface BattleSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  battleId: string;
  onSetupComplete?: () => void;
}

export function BattleSetupDialog({
  open,
  onOpenChange,
  battleId,
  onSetupComplete,
}: BattleSetupDialogProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/battles/${battleId}/setup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds: selectedDuration }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "배틀 설정에 실패했습니다.");
      }

      showToast(`${DURATION_LABELS[selectedDuration]} 배틀이 시작됩니다!`, "success");
      onOpenChange(false);
      onSetupComplete?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "배틀 설정에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            배틀 시간 설정
          </DialogTitle>
          <DialogDescription>
            배틀 시간을 선택하세요. HP가 시간(초)만큼 부여됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-4">
          {DURATION_OPTIONS.map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={cn(
                "p-3 rounded-lg border-2 text-center transition-all",
                selectedDuration === duration
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="text-lg font-bold">{DURATION_LABELS[duration]}</div>
              <div className="text-xs text-muted-foreground">HP {duration}</div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            배틀 시작
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
