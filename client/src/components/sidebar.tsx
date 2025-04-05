import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Clock,
  History,
  BarChart,
  Settings,
  LogOut,
  Shield,
  Users,
  BadgeHelp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Convert full name to initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Define regular user links - these users need time tracking functionality
  const userLinks = [
    { id: "dashboard", href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { id: "tracker", href: "/tracker", label: "Time Tracker", icon: <Clock className="w-5 h-5 mr-3" /> },
    { id: "history", href: "/history", label: "History", icon: <History className="w-5 h-5 mr-3" /> },
    { id: "reports", href: "/reports", label: "Reports", icon: <BarChart className="w-5 h-5 mr-3" /> },
    { id: "settings", href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5 mr-3" /> }
  ];
  
  // Define admin-only links - admins focus on user management, not time tracking
  const adminLinks = [
    { id: "dashboard", href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { id: "admin", href: "/admin", label: "Admin Dashboard", icon: <Shield className="w-5 h-5 mr-3" /> },
    { id: "users", href: "/user-management", label: "User Management", icon: <Users className="w-5 h-5 mr-3" /> },
    { id: "reports", href: "/reports", label: "Analytics", icon: <BarChart className="w-5 h-5 mr-3" /> },
    { id: "settings", href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5 mr-3" /> }
  ];
  
  // Use different navigation based on user role
  const links = user?.role?.toLowerCase() === 'admin' ? adminLinks : userLinks;
  
  const sidebarClasses = cn(
    "flex flex-col h-screen bg-[#044C7E] border-r border-border transition-all duration-300 text-white",
    isMobileOpen ? "fixed inset-y-0 left-0 z-50 w-64" : "hidden md:flex w-64"
  );
  
  return (
    <aside className={sidebarClasses}>
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="text-primary text-xl">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold text-white">Time <span className="text-primary font-extrabold">Tracker</span></h1>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
            {getInitials(user?.username || "")}
          </div>
          <div>
            <h3 className="font-medium text-white">{user?.username || "User"}</h3>
            <p className="text-xs text-white/70">DevOps Engineer</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-5 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <li key={link.id}>
                {/* Use Link without nested <a> tags to avoid DOM nesting warnings */}
                <Link href={link.href}>
                  <div
                    className={cn(
                      "flex items-center p-2 rounded-md transition-colors cursor-pointer",
                      isActive 
                        ? "bg-primary/90 text-white font-medium" 
                        : "text-white hover:bg-primary/50"
                    )}
                    onClick={() => {
                      if (isMobileOpen) onCloseMobile();
                    }}
                  >
                    {link.icon}
                    {link.label}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 mt-auto">
        <Button 
          variant="outline" 
          className="w-full justify-start text-white border-white/20 hover:bg-primary/50 hover:text-white" 
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        
        <Separator className="my-4 bg-white/20" />
        
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Version 1.1.0</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </aside>
  );
}
