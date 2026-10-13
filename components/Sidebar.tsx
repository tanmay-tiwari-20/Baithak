"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Home,
  Calendar,
  History,
  Video,
  User,
  ShieldCheck,
} from "lucide-react";

// Map labels to clean Lucide icons
const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5 shrink-0" />,
  Upcoming: <Calendar className="w-5 h-5 shrink-0" />,
  Previous: <History className="w-5 h-5 shrink-0" />,
  Recordings: <Video className="w-5 h-5 shrink-0" />,
  "Personal Room": <User className="w-5 h-5 shrink-0" />,
};

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between border-r border-[#3C4043] bg-[#1A1B1E] p-3 pt-24 text-[#E8EAED] max-sm:hidden lg:w-64 lg:p-4 lg:pt-24">
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#747984] max-lg:hidden">
          Workspace
        </p>
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.route || (link.route !== "/" && pathname.startsWith(link.route));

          return (
            <Link
              href={link.route}
              key={link.label}
              aria-label={link.label}
              title={link.label}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8] max-lg:justify-center",
                isActive
                  ? "border-[#3C4043] bg-[#28292C] text-[#AECBFA]"
                  : "border-transparent text-[#BDC1C6] hover:border-[#303134] hover:bg-[#202124] hover:text-[#E8EAED]"
              )}
            >
              {iconMap[link.label] || <Home className="w-5 h-5" />}
              <span className="max-lg:hidden">{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="max-lg:hidden flex items-center gap-2.5 rounded-xl border border-[#3C4043] bg-[#202124] p-3 text-xs text-[#9AA0A6]">
        <ShieldCheck className="w-4 h-4 text-[#8AB4F8] shrink-0" />
        <span>Share meetings by code or link</span>
      </div>
    </aside>
  );
};

export default Sidebar;
