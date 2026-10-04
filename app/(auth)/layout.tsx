import React, { ReactNode } from "react";
import BaithakLogo from "@/components/BaithakLogo";
import { ShieldCheck, Video, Users } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#202124] text-[#E8EAED] flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Clean Google Meet Style Brand Info */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
          <BaithakLogo size={40} textClassName="text-2xl font-normal" />

          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-normal tracking-tight text-[#E8EAED] leading-tight">
              Premium video meetings. <br />
              <span className="text-[#8AB4F8]">Now free for everyone.</span>
            </h1>
            <p className="text-base text-[#9AA0A6] leading-relaxed max-w-lg">
              We re-engineered the service we built for secure business meetings, Baithak, to make it available for all with seamless HD video, live sharing, and real-time collaboration.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-[#BDC1C6]">
              <div className="w-8 h-8 rounded-full bg-[#303134] flex items-center justify-center text-[#8AB4F8]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>End-to-end encrypted and secure by default</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#BDC1C6]">
              <div className="w-8 h-8 rounded-full bg-[#303134] flex items-center justify-center text-[#8AB4F8]">
                <Video className="w-4 h-4" />
              </div>
              <span>Crystal-clear video and noise-cancelling audio</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#BDC1C6]">
              <div className="w-8 h-8 rounded-full bg-[#303134] flex items-center justify-center text-[#8AB4F8]">
                <Users className="w-4 h-4" />
              </div>
              <span>Works directly in your browser without downloads</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Clerk Form */}
        <div className="w-full lg:col-span-6 flex flex-col items-center justify-center">
          <div className="lg:hidden mb-6 flex justify-center">
            <BaithakLogo size={36} />
          </div>
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
