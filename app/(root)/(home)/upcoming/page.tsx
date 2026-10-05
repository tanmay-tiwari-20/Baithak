"use client";

import CallList from "@/components/CallList";
import ScheduleMeetingDialog from "@/components/ScheduleMeetingDialog";
import { Button } from "@/components/ui/button";
import { CalendarClock, Plus } from "lucide-react";
import React, { useState } from "react";

const Upcoming = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mx-auto max-w-7xl space-y-8 text-[#E8EAED]">
      <div className="flex flex-col gap-5 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#242831] to-[#1b1e25] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#8AB4F8]/10 text-[#AECBFA]">
            <CalendarClock className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#E8EAED] sm:text-3xl">
              Upcoming meetings
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#9AA0A6]">
              Plan your next conversation, share the room link, and join when it’s time.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsScheduleOpen(true)}
          className="h-11 shrink-0 rounded-full bg-[#8AB4F8] px-5 font-medium text-[#111318] hover:bg-[#AECBFA]"
        >
          <Plus className="mr-2 size-4" /> Schedule meeting
        </Button>
      </div>

      <CallList type="upcoming" refreshKey={refreshKey} />
      <ScheduleMeetingDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        onScheduled={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  );
};

export default Upcoming;
