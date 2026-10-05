import CallList from "@/components/CallList";
import { Clapperboard } from "lucide-react";
import React from "react";

const Recordings = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-8 text-[#E8EAED]">
      <div className="flex items-start gap-4 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#242831] to-[#1b1e25] p-6 sm:p-8">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#8AB4F8]/10 text-[#AECBFA]">
          <Clapperboard className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-[#E8EAED] sm:text-3xl">
            Meeting recordings
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#9AA0A6]">
            Play and share saved recordings. Each recording is listed using the name of its meeting room.
          </p>
        </div>
      </div>

      <CallList type="recordings" />
    </div>
  );
};

export default Recordings;
