import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export function MetricCard({ label, value, delta, deltaLabel, icon: Icon, accent = "default" }) {
  const isUp = (delta ?? 0) >= 0;
  const accentMap = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-accent-soft text-accent-soft-foreground",
    warning: "bg-warning-soft text-warning-soft-foreground",
    info: "bg-info-soft text-info-soft-foreground",
  };

  return (
    <Card className="p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", accentMap[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              isUp ? "bg-accent-soft text-accent-soft-foreground" : "bg-destructive-soft text-destructive-soft-foreground"
            )}
          >
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        </div>
      )}
    </Card>
  );
}
