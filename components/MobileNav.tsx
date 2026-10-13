"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import BaithakLogo from "./BaithakLogo";
import { Menu, Home, Calendar, History, Video, User } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5 shrink-0" />,
  Upcoming: <Calendar className="w-5 h-5 shrink-0" />,
  Previous: <History className="w-5 h-5 shrink-0" />,
  Recordings: <Video className="w-5 h-5 shrink-0" />,
  "Personal Room": <User className="w-5 h-5 shrink-0" />,
};

const MobileNav = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <section>
      <Sheet>
        <SheetTrigger asChild>
          <button
            title="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#9AA0A6] transition-colors hover:bg-[#303134] hover:text-[#E8EAED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="border-r border-[#3C4043] bg-[#1A1B1E] p-5 text-[#E8EAED] sm:p-6"
          aria-describedby={undefined}
        >
          <VisuallyHidden>
            <h2>Navigation Menu</h2>
          </VisuallyHidden>
          
           <div className="border-b border-[#3C4043] pb-6">
            <BaithakLogo size={32} textClassName="text-xl font-normal" />
          </div>

          <div className="flex h-[calc(100vh-100px)] flex-col justify-between pt-6 overflow-y-auto">
             <section className="flex flex-col gap-1.5">
              {sidebarLinks.map((item) => {
                const isActive =
                  pathname === item.route ||
                  (item.route !== "/" && pathname.startsWith(item.route));

                return (
                  <SheetClose asChild key={item.route}>
                    <Link
                      href={item.route}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB4F8]",
                        isActive
                          ? "border-[#3C4043] bg-[#28292C] text-[#AECBFA]"
                          : "border-transparent text-[#BDC1C6] hover:border-[#303134] hover:bg-[#202124] hover:text-[#E8EAED]"
                      )}
                    >
                      {iconMap[item.label] || <Home className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </section>

             <div className="rounded-xl border border-[#3C4043] bg-[#202124] p-4 text-center text-xs text-[#9AA0A6]">
              Baithak Video Collaboration
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
