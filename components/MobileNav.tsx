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
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="border-r border-[#3C4043] bg-[#202124] p-6 text-[#E8EAED]"
          aria-describedby={undefined}
        >
          <VisuallyHidden>
            <h2>Navigation Menu</h2>
          </VisuallyHidden>
          
          <div className="pb-6 border-b border-[#3C4043]">
            <BaithakLogo size={32} textClassName="text-xl font-normal" />
          </div>

          <div className="flex h-[calc(100vh-100px)] flex-col justify-between pt-6 overflow-y-auto">
            <section className="flex flex-col gap-2">
              {sidebarLinks.map((item) => {
                const isActive =
                  pathname === item.route ||
                  (item.route !== "/" && pathname.startsWith(item.route));

                return (
                  <SheetClose asChild key={item.route}>
                    <Link
                      href={item.route}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-full text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#303134] text-[#8AB4F8]"
                          : "text-[#BDC1C6] hover:bg-[#28292C] hover:text-[#E8EAED]"
                      )}
                    >
                      {iconMap[item.label] || <Home className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </section>

            <div className="p-4 rounded-xl bg-[#28292C] border border-[#3C4043] text-xs text-[#9AA0A6] text-center">
              Baithak Video Collaboration
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
