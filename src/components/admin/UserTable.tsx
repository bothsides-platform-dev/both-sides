"use client";

import { useState } from "react";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRelativeTime } from "@/lib/utils";
import { Loader2, Pencil, Check, X, Ban, UserCheck } from "lucide-react";
import type { Role } from "@prisma/client";

interface User {
  id: string;
  nickname: string | null;
  name: string | null;
  email: string | null;
  role: Role;
  isBlacklisted: boolean;
  blacklistedAt: string | null;
  blacklistReason: string | null;
  createdAt: string;
  _count: {
    topics: number;
    opinions: number;
    votes: number;
  };
}

interface UserTableProps {
  users: User[];
}

function maskEmail(email: string | null): string {
  if (!email) return "-";
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal =
    localPart.length > 2
      ? localPart.slice(0, 2) + "*".repeat(localPart.length - 2)
      : localPart;
  return `${maskedLocal}@${domain}`;
}

export function UserTable({ users }: UserTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [blacklistTargetUser, setBlacklistTargetUser] = useState<User | null>(null);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [blacklistError, setBlacklistError] = useState<string | null>(null);

  const handleStartEdit = (user: User) => {
    setEditingId(user.id);
    setEditValue(user.nickname || "");
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setError(null);
  };

  const handleOpenBlacklistDialog = (user: User) => {
    setBlacklistTargetUser(user);
    setBlacklistReason("");
    setBlacklistError(null);
    setBlacklistDialogOpen(true);
  };

  const handleCloseBlacklistDialog = () => {
    setBlacklistDialogOpen(false);
    setBlacklistTargetUser(null);
    setBlacklistReason("");
    setBlacklistError(null);
  };

  const handleBlacklist = async () => {
    if (!blacklistTargetUser) return;

    if (!blacklistReason.trim()) {
      setBlacklistError("차단 사유를 입력해주세요.");
      return;
    }

    setProcessingId(blacklistTargetUser.id);
    setBlacklistError(null);

    try {
      const response = await fetch(`/api/admin/users/${blacklistTargetUser.id}/blacklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: blacklistReason.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBlacklistError(data.error || "차단 처리에 실패했습니다.");
        return;
      }

      handleCloseBlacklistDialog();
      mutate((key: string) => key.startsWith("/api/admin/users"));
    } catch {
      setBlacklistError("차단 처리에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnblacklist = async (userId: string) => {
    if (!confirm("정말 차단을 해제하시겠습니까?")) return;

    setProcessingId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}/blacklist`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "차단 해제에 실패했습니다.");
        return;
      }

      mutate((key: string) => key.startsWith("/api/admin/users"));
    } catch {
      alert("차단 해제에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveNickname = async (userId: string) => {
    if (!editValue.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    setProcessingId(userId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: editValue.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "닉네임 수정에 실패했습니다.");
        return;
      }

      setEditingId(null);
      setEditValue("");
      mutate((key: string) => key.startsWith("/api/admin/users"));
    } catch {
      setError("닉네임 수정에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          사용자가 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "관리자" : "일반"}
                    </Badge>
                    {user.isBlacklisted && (
                      <Badge variant="destructive">차단됨</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId === user.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-48 h-8"
                          placeholder="닉네임 입력"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveNickname(user.id);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveNickname(user.id)}
                          disabled={processingId === user.id}
                        >
                          {processingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={processingId === user.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {user.nickname || user.name || "이름 없음"}
                      </span>
                    )}
                  </div>

                  {editingId === user.id && error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span>이메일: {maskEmail(user.email)}</span>
                    <span>토론 {user._count.topics}</span>
                    <span>의견 {user._count.opinions}</span>
                    <span>투표 {user._count.votes}</span>
                    <span suppressHydrationWarning>{formatRelativeTime(user.createdAt)}</span>
                  </div>

                  {user.isBlacklisted && user.blacklistReason && (
                    <div className="text-xs text-destructive mt-1">
                      <span className="font-medium">차단 사유:</span> {user.blacklistReason}
                      {user.blacklistedAt && (
                        <span className="ml-2 text-muted-foreground" suppressHydrationWarning>
                          ({formatRelativeTime(user.blacklistedAt)})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId !== user.id && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(user)}
                        title="닉네임 수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.role !== "ADMIN" && (
                        user.isBlacklisted ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnblacklist(user.id)}
                            disabled={processingId === user.id}
                            title="차단 해제"
                          >
                            {processingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenBlacklistDialog(user)}
                            disabled={processingId === user.id}
                            title="차단"
                          >
                            <Ban className="h-4 w-4 text-destructive" />
                          </Button>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={blacklistDialogOpen} onOpenChange={setBlacklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 차단</DialogTitle>
            <DialogDescription>
              {blacklistTargetUser?.nickname || blacklistTargetUser?.name || "이름 없음"}님을 차단하시겠습니까?
              차단된 사용자는 로그인할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="차단 사유를 입력해주세요..."
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              rows={3}
            />
            {blacklistError && (
              <p className="text-sm text-destructive">{blacklistError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseBlacklistDialog}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlacklist}
              disabled={processingId === blacklistTargetUser?.id}
            >
              {processingId === blacklistTargetUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              차단
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
