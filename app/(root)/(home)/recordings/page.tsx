import CallList from "@/components/CallList";
import React from "react";

const Recordings = () => {
  return (
    <div className="space-y-8 max-w-6xl text-[#E8EAED]">
      <div>
        <h1 className="text-3xl font-normal tracking-tight text-[#E8EAED]">
          Call Recordings
        </h1>
        <p className="text-sm text-[#9AA0A6] mt-1">
          Access your recorded meetings, cloud playback, and transcripts.
        </p>
      </div>

      <CallList type="recordings" />
    </div>
  );
};

export default Recordings;
