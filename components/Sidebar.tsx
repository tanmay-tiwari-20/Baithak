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
    <aside className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-[#202124] border-r border-[#3C4043] p-4 pt-24 text-[#E8EAED] max-sm:hidden lg:w-64 select-none">
      <div className="flex flex-1 flex-col gap-1.5">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.route || (link.route !== "/" && pathname.startsWith(link.route));

          return (
            <Link
              href={link.route}
              key={link.label}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#303134] text-[#8AB4F8]"
                  : "text-[#BDC1C6] hover:bg-[#28292C] hover:text-[#E8EAED]"
              )}
            >
              {iconMap[link.label] || <Home className="w-5 h-5" />}
              <span className="max-lg:hidden">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Security / Status Footer */}
      <div className="max-lg:hidden p-3 rounded-xl bg-[#28292C] border border-[#3C4043] flex items-center gap-2.5 text-xs text-[#9AA0A6]">
        <ShieldCheck className="w-4 h-4 text-[#8AB4F8] shrink-0" />
        <span>Share meetings by code or link</span>
      </div>
    </aside>
  );
};

export default Sidebar;
