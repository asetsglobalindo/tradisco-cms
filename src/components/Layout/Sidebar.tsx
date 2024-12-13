import {cn} from "@/lib/utils";
import {DashboardNav} from "./DashboardNav";

export default function Sidebar() {
  return (
    <nav className={cn(`hidden  border-r sticky top-0 w-[280px] lg:flex flex-col h-screen  overflow-hidden `)}>
      <div className="w-full px-4 mt-16 overflow-y-auto scrollbar-sm">
        {/* <h2 className="mb-2 text-lg font-semibold tracking-tight">OVERVIEW</h2> */}
        <div className="space-y-1 ">
          <DashboardNav />
        </div>
      </div>
    </nav>
  );
}
