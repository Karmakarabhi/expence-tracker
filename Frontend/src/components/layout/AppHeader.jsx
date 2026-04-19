import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Search, Bell, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "../../context/AuthContext";
import ProfileSwitcher from "../portfolio/ProfileSwitcher";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="shrink-0" />

      <div className="hidden md:flex relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search expenses, funds, projects…"
          className="pl-9 h-9 bg-secondary border-transparent focus-visible:bg-background"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ProfileSwitcher />
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
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
