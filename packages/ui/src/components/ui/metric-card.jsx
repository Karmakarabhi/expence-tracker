import { Card } from "./card.jsx";
import { cn } from "@finlight/shared";
import { TrendingDown, TrendingUp } from "lucide-react";

export function MetricCard({ label, title, value, delta, deltaLabel, description, icon: Icon, accent = "default" }) {
  const isUp = (delta ?? 0) >= 0;
  const accentMap = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
  };

  const displayLabel = label || title;

  return (
    <Card className="p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {displayLabel && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{displayLabel}</p>
          )}
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
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
              isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
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
