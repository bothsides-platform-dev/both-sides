"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Video } from "lucide-react";
import { POST_MAX_VIDEOS } from "@/lib/constants";

interface VideoUrlInputProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

const VIDEO_URL_PATTERN = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i;

export function VideoUrlInput({ value, onChange, disabled }: VideoUrlInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addUrl = () => {
    const url = inputValue.trim();
    if (!url) return;

    if (!VIDEO_URL_PATTERN.test(url)) {
      setError("YouTube 또는 Vimeo URL만 허용됩니다.");
      return;
    }

    if (value.includes(url)) {
      setError("이미 추가된 URL입니다.");
      return;
    }

    if (value.length >= POST_MAX_VIDEOS) {
      setError(`최대 ${POST_MAX_VIDEOS}개까지 추가할 수 있습니다.`);
      return;
    }

    onChange([...value, url]);
    setInputValue("");
    setError(null);
  };

  const removeUrl = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="YouTube 또는 Vimeo URL"
          disabled={disabled || value.length >= POST_MAX_VIDEOS}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addUrl}
          disabled={disabled || value.length >= POST_MAX_VIDEOS}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value.length > 0 && (
        <div className="space-y-1">
          {value.map((url, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
              <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{url}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeUrl(i)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
