"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Loader2 } from "lucide-react";

interface ProfileEditFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProfileEditForm({ onCancel, onSuccess }: ProfileEditFormProps) {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const [nickname, setNickname] = useState(user?.nickname || user?.name || "");
  const [image, setImage] = useState<string | undefined>(user?.image || undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // Real-time nickname validation (length only)
  const validateNicknameLength = (value: string) => {
    if (value.trim().length < 2) {
      return "닉네임은 최소 2자 이상이어야 합니다.";
    }
    if (value.length > 20) {
      return "닉네임은 최대 20자까지 가능합니다.";
    }
    return null;
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setNicknameError(validateNicknameLength(value));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const lengthError = validateNicknameLength(nickname);
    if (lengthError) {
      setNicknameError(lengthError);
      return;
    }

    const trimmedNickname = nickname.trim();
    const hasNicknameChanged = trimmedNickname !== (user?.nickname || user?.name || "");
    const hasImageChanged = image !== user?.image;

    if (!hasNicknameChanged && !hasImageChanged) {
      setError("변경된 내용이 없습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const updateData: { nickname?: string; image?: string } = {};
      
      if (hasNicknameChanged) {
        updateData.nickname = trimmedNickname;
      }
      
      if (hasImageChanged) {
        updateData.image = image;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "프로필 업데이트에 실패했습니다.");
      }

      // Update session with new data
      await updateSession();

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Profile Image */}
        <div className="space-y-2">
          <Label>프로필 사진</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={image} />
              <AvatarFallback className="text-2xl">
                {nickname.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <ImageUpload
                value={image}
                onChange={setImage}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            disabled={isLoading}
            placeholder="닉네임을 입력하세요"
            className={nicknameError ? "border-destructive" : ""}
          />
          {nicknameError && (
            <p className="text-sm text-destructive">{nicknameError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            2-20자 사이로 입력해주세요.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button type="submit" disabled={isLoading || !!nicknameError}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </form>
  );
}
