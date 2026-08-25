import {
  LayoutDashboard, Receipt, PlusCircle, Tags, Wallet, BarChart3,
  FolderKanban, Sparkles, Building2
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@finlight/ui";

const overview = [{ title: "Dashboard", url: "/", icon: LayoutDashboard }];

const spending = [
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Add Expense", url: "/expenses/new", icon: PlusCircle },
  { title: "Categories", url: "/categories", icon: Tags },
  { title: "Budget", url: "/budget", icon: Wallet },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Supplier Settlements", url: "/reports/suppliers", icon: Building2 },
];

const projectItems = [{ title: "Projects", url: "/projects", icon: FolderKanban }];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderItems = (items) =>
    items.map((item) => (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm shadow">
            EM
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">Expense Management</span>
              <span className="text-xs text-muted-foreground">Finlight Business</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Overview</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(overview)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Spending & Invoices</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(spending)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Projects</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(projectItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
