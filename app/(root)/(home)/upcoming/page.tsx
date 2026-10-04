import CallList from "@/components/CallList";
import React from "react";

const Upcoming = () => {
  return (
    <div className="space-y-8 max-w-6xl text-[#E8EAED]">
      <div>
        <h1 className="text-3xl font-normal tracking-tight text-[#E8EAED]">
          Upcoming Meetings
        </h1>
        <p className="text-sm text-[#9AA0A6] mt-1">
          Review your scheduled calls and calendar invites.
        </p>
      </div>

      <CallList type="upcoming" />
    </div>
  );
};

export default Upcoming;