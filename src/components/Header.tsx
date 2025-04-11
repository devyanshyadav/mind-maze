import { Brain, History, HomeIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bgGradient backdrop-blur-md border-b-4 border-gray-100 py-3">
      <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-lg font-semibold text-gray-900">Mind Maze</h1>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <a
                href="/"
                className="text-sm flex items-center gap-2 font-medium "
              >
               <HomeIcon className="h-5 w-5" /> Home
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <a
                href="/history"
                className="text-sm flex items-center gap-2  font-medium"
              >
               <History className="h-5 w-5" /> History
              </a>
            </Button>
          </nav>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                Home
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
