import {cn} from "@/lib/utils";
// import {Link} from "react-router-dom";
import {MobileSidebar} from "./MobileSidebar";
import UserNav from "./UserNav";
import ThemeToggle from "./theme-toggle";
import {Link} from "react-router-dom";
import {LayoutDashboard} from "lucide-react";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 border-b supports-backdrop-blur:bg-background/60 bg-background/95 backdrop-blur">
      <nav className="flex items-center justify-between px-4 h-14">
        <Link to="/" className="hidden lg:block">
          <div className="flex items-center gap-2">
            <LayoutDashboard />
            <p className="text-2xl font-bold uppercase">backoffice</p>
          </div>
        </Link>
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>

        <div className="flex items-center gap-2">
          <UserNav />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

