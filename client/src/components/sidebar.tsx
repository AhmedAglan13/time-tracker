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
  Keyboard
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
  
  const links = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { href: "/", label: "Time Tracker", icon: <Clock className="w-5 h-5 mr-3" /> },
    { href: "/history", label: "History", icon: <History className="w-5 h-5 mr-3" /> },
    { href: "/reports", label: "Reports", icon: <BarChart className="w-5 h-5 mr-3" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5 mr-3" /> }
  ];
  
  const sidebarClasses = cn(
    "flex flex-col h-screen bg-muted/50 border-r border-border transition-all duration-300",
    isMobileOpen ? "fixed inset-y-0 left-0 z-50 w-64" : "hidden md:flex w-64"
  );
  
  return (
    <aside className={sidebarClasses}>
      <div className="p-5 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="text-primary text-xl">
            <Keyboard className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">DevTime <span className="text-primary">Tracker</span></h1>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {getInitials(user?.name || "")}
          </div>
          <div>
            <h3 className="font-medium">{user?.name || "User"}</h3>
            <p className="text-xs text-muted-foreground">{user?.role || "DevOps Engineer"}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-5 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href}>
                  <a
                    className={cn(
                      "flex items-center p-2 rounded-md transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-foreground hover:bg-accent/50"
                    )}
                    onClick={() => {
                      if (isMobileOpen) onCloseMobile();
                    }}
                  >
                    {link.icon}
                    {link.label}
                  </a>
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
          className="w-full justify-start text-muted-foreground" 
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        
        <Separator className="my-4" />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Version 1.0.2</span>
          <span>© 2023</span>
        </div>
      </div>
    </aside>
  );
}
