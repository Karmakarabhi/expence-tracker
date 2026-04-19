import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const aiInsights = [
  { id: "ai1", type: "warning", title: "Shopping budget exceeded", body: "You've spent more than your budget on Shopping this month." },
  { id: "ai2", type: "info", title: "Food spend up 18% MoM", body: "Dining out drove most of the increase. Consider setting a weekly cap." },
  { id: "ai3", type: "success", title: "Portfolio outperforming", body: "Your flexi cap holding returned above the category average." },
  { id: "ai4", type: "info", title: "SIP suggestion", body: "Based on your savings pattern, you can comfortably increase SIP." },
];

const iconMap = { warning: AlertTriangle, info: Info, success: CheckCircle2 };
const styleMap = {
  warning: "bg-warning-soft text-warning-soft-foreground border-warning/20",
  info: "bg-info-soft text-info-soft-foreground border-info/20",
  success: "bg-accent-soft text-accent-soft-foreground border-accent/20",
};

export function AIInsightsPanel({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> AI Insights
          </SheetTitle>
          <SheetDescription>
            Personalized observations from your spending and portfolio activity.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {aiInsights.map((insight) => {
            const Icon = iconMap[insight.type];
            return (
              <div key={insight.id} className={cn("rounded-xl border p-4 transition-all", styleMap[insight.type])}>
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{insight.title}</p>
                    <p className="text-sm opacity-80">{insight.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 rounded-xl border border-dashed p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Insights refresh daily. Connect your AI endpoint in <code className="text-foreground">src/api</code>.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
