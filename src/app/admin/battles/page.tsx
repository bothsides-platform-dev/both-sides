"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const AdminBattles = dynamic(
  () => import("@/components/admin/AdminBattles").then((mod) => mod.AdminBattles),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function AdminBattlesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  return <AdminBattles />;
}
