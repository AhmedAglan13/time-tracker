import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        onCloseMobile={() => setIsMobileOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-blue-100 h-16 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 md:hidden text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="text-xl font-medium text-gray-800">{title}</h2>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
