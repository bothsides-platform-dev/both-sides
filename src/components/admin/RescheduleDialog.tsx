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

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicTitle: string;
  currentScheduledAt: string;
  onConfirm: (newDate: string) => Promise<void>;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  topicTitle,
  currentScheduledAt,
  onConfirm,
}: RescheduleDialogProps) {
  const [newDate, setNewDate] = useState(() =>
    format(new Date(currentScheduledAt), "yyyy-MM-dd'T'HH:mm")
  );
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(new Date(newDate).toISOString());
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>일정 변경</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {topicTitle}
          </p>

          <div className="space-y-2">
            <Label htmlFor="scheduled-date">새 예약 시각</Label>
            <input
              id="scheduled-date"
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
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
          <Button onClick={handleConfirm} disabled={loading || !newDate}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
