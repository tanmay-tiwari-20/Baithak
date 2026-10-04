import CallList from "@/components/CallList";
import React from "react";

const Previous = () => {
  return (
    <div className="space-y-8 max-w-6xl text-[#E8EAED]">
      <div>
        <h1 className="text-3xl font-normal tracking-tight text-[#E8EAED]">
          Previous Calls
        </h1>
        <p className="text-sm text-[#9AA0A6] mt-1">
          Review calls and meetings that have concluded.
        </p>
      </div>

      <CallList type="ended" />
    </div>
  );
};

export default Previous;