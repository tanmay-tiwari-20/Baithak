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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#202124] border-b border-[#3C4043] px-4 md:px-6 flex items-center justify-between">
      {/* Left: Minimal Baithak Logo */}
      <div className="flex items-center gap-4">
        <BaithakLogo size={32} textClassName="text-xl font-normal" />
      </div>

        {/* Right: Clock + User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {timeStr && (
          <span className="hidden md:inline-block text-sm font-normal text-[#9AA0A6] select-none pr-2">
            {timeStr}
          </span>
        )}

        <SignedIn>
          <div className="flex items-center pl-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full border border-[#3C4043]",
                },
              }}
            />
          </div>
        </SignedIn>

        {/* Mobile Navigation Trigger */}
        <div className="sm:hidden flex items-center">
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
