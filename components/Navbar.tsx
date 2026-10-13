"use client";

import React, { useEffect, useState } from "react";
import BaithakLogo from "./BaithakLogo";
import MobileNav from "./MobileNav";
import { SignedIn, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
      setTimeStr(`${time} • ${date}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="dashboard-navbar fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-[#3C4043] bg-[#1A1B1E] px-4 md:px-7">
      <div className="flex items-center gap-4">
        <BaithakLogo size={32} textClassName="text-xl font-medium" />
      </div>

      <div className="flex items-center gap-2 sm:gap-5">
        {timeStr && (
          <span className="hidden select-none border-r border-[#3C4043] pr-5 text-xs font-medium tracking-wide text-[#9AA0A6] md:inline-block">
            {timeStr}
          </span>
        )}

        <SignedIn>
          <div className="flex items-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-full border border-[#5F6368]",
                },
              }}
            />
          </div>
        </SignedIn>

        <div className="flex items-center sm:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
