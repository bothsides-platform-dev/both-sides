"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";

export interface ReferenceLink {
  url: string;
  title?: string;
}

interface ReferenceLinkInputProps {
  value: ReferenceLink[];
  onChange: (links: ReferenceLink[]) => void;
  disabled?: boolean;
  maxLinks?: number;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function ReferenceLinkInput({
  value,
  onChange,
  disabled = false,
  maxLinks = 5,
}: ReferenceLinkInputProps) {
  const [urlError, setUrlError] = useState<number | null>(null);

  const handleAddLink = () => {
    if (value.length >= maxLinks) return;
    onChange([...value, { url: "", title: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = value.filter((_, i) => i !== index);
    onChange(newLinks);
    if (urlError === index) {
      setUrlError(null);
    }
  };

  const handleUrlChange = (index: number, url: string) => {
    const newLinks = [...value];
    newLinks[index] = { ...newLinks[index], url };
    onChange(newLinks);

    if (url && !isValidUrl(url)) {
      setUrlError(index);
    } else if (urlError === index) {
      setUrlError(null);
    }
  };

  const handleTitleChange = (index: number, title: string) => {
    const newLinks = [...value];
    newLinks[index] = { ...newLinks[index], title };
    onChange(newLinks);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          참고링크 (선택)
        </Label>
        <span className="text-xs text-muted-foreground">
          {value.length}/{maxLinks}
        </span>
      </div>

      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((link, index) => (
            <div key={index} className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="https://example.com/article"
                    value={link.url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    disabled={disabled}
                    className={urlError === index ? "border-destructive" : ""}
                  />
                  {urlError === index && (
                    <p className="text-xs text-destructive">올바른 URL 형식이 아닙니다.</p>
                  )}
                  <Input
                    placeholder="제목 (선택)"
                    value={link.title || ""}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    disabled={disabled}
                    maxLength={100}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLink(index)}
                  disabled={disabled}
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length < maxLinks && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddLink}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          참고링크 추가
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        관련 기사, 영상, 자료 등의 링크를 추가할 수 있습니다
      </p>
    </div>
  );
}
