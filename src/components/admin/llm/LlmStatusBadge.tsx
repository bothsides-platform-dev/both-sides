import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export type BadgeStatus = "complete" | "needed" | "insufficient";

interface LlmStatusBadgeProps {
  label: string;
  status: BadgeStatus;
}

export function LlmStatusBadge({ label, status }: LlmStatusBadgeProps) {
  const variants = {
    complete: {
      variant: "default" as const,
      className: "bg-green-500 hover:bg-green-600 text-white",
      icon: CheckCircle2,
    },
    needed: {
      variant: "secondary" as const,
      className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      icon: AlertCircle,
    },
    insufficient: {
      variant: "secondary" as const,
      className: "bg-gray-400 hover:bg-gray-500 text-white",
      icon: XCircle,
    },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
