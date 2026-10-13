import CallList from "@/components/CallList";
import { History } from "lucide-react";
import React from "react";

const Previous = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-8 text-[#E8EAED]">
      <div className="flex items-start gap-4 rounded-2xl border border-[#3C4043] bg-[#202124] p-6 sm:p-8">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#3C4043] bg-[#28292C] text-[#AECBFA]">
          <History className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-[#E8EAED] sm:text-3xl">
            Previous meetings
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#9AA0A6]">
            Revisit your recent rooms, copy a meeting link, or open a meeting again.
          </p>
        </div>
      </div>

      <CallList type="ended" />
    </div>
  );
};

export default Previous;
