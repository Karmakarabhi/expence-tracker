import { SidebarTrigger, Button, Input } from "@finlight/ui";
import { Search, Bell, LogOut } from "lucide-react";
import { useAuth } from "@finlight/shared";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="shrink-0" />

      <div className="hidden md:flex relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search expenses, invoices, suppliers, projects…"
          className="pl-9 h-9 bg-secondary border-transparent focus-visible:bg-background"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
