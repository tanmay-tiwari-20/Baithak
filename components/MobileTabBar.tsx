"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", route: "/", Icon: Home },
  { label: "Upcoming", route: "/upcoming", Icon: CalendarDays },
  { label: "Recordings", route: "/recordings", Icon: Video },
];

const MobileTabBar = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[#3C4043] bg-[#1A1B1E]/95 px-2 pt-2 backdrop-blur-lg sm:hidden"
    >
      {tabs.map(({ label, route, Icon }) => {
        const isActive = pathname === route || (route !== "/" && pathname.startsWith(route));

        return (
          <Link
            key={route}
            href={route}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]",
              isActive ? "text-[#AECBFA]" : "text-[#9AA0A6] hover:text-[#E8EAED]",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;
