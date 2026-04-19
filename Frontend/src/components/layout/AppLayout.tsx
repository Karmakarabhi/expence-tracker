import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full flex-row bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col w-full h-full min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in bg-secondary/20">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
